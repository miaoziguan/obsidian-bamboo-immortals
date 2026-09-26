#!/usr/bin/env node
/**
 * 加载矩阵防漂移检查（零依赖）
 * ------------------------------------------------------------------
 * 背景：webapp 有 3 个源视图（index / scroll-src / archive-src），每个通过
 *   <link rel="stylesheet" href="assets/styles/X.css?__BUILD__">
 * 声明自己需要哪些 CSS。重构把巨石块从 base.css 抽成独立 CSS 文件时，
 * 很容易「文件抽走了，但某个视图的 <link> 忘了加」——本次就出过：
 * 选签浮层(scroll-overlay.css)被抽出来却只挂进 scroll-src.html，主视图
 * index.html 漏挂 → 浮层完全无样式。
 *
 * 两道闸门：
 *   闸门 1（权威锁）：每个视图实际 <link> 集合 必须 == scripts/load-matrix.json
 *     中声明的期望集合。任一处缺/多都算漂移 → 直接失败。这是「防漂移」主闸，
 *     确定性、零误报。用 `node scripts/check-load-matrix.mjs --update` 在修正后
 *     重新生成 load-matrix.json 并提交即可锁住当前正确矩阵。
 *
 *   闸门 2（启发式安全网）：对每个视图，收集它加载的 JS 模块图中所有「真实 DOM
 *     类名引用」（className= / classList.add / querySelector('.x') / class="..."），
 *     反查这些类定义在哪些 CSS；若某个类唯一归属某 CSS 文件、且「其它视图」加载了
 *     该 CSS 但本视图没加载 → 判定为疑似漂移。这能在「忘记更新清单」时仍兜底抓出
 *     本次这类 bug。默认仅告警(退出码 0)，加 --strict 时升级为失败。
 *
 * 用法：
 *   node scripts/check-load-matrix.mjs            # 检查（闸门1硬失败，闸门2告警）
 *   node scripts/check-load-matrix.mjs --strict   # 闸门2 也失败
 *   node scripts/check-load-matrix.mjs --update   # 依据当前源 HTML 重新生成 load-matrix.json
 *
 * 退出码：发现闸门1漂移或 --strict 下闸门2漂移 → 1；否则 0。可进 pre-commit / CI。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBAPP = join(__dirname, '..', 'webapp');
const STYLES = join(WEBAPP, 'assets', 'styles');
const VIEWS = ['index.html', 'scroll-src.html', 'archive-src.html'];

const argUpdate = process.argv.includes('--update');
const argStrict = process.argv.includes('--strict');

// ---------- 解析：某视图实际加载的 CSS ----------
function linksOf(view) {
  const html = readFileSync(join(WEBAPP, view), 'utf8');
  const set = new Set();
  const re = /<link\b[^>]*?rel=["']stylesheet["'][^>]*?>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[0].match(/href=["']([^"']+)["']/i);
    if (!href) continue;
    const clean = href[1].split('?')[0].replace(/^\.\//, '');
    if (!clean.startsWith('assets/styles/')) continue;
    set.add(clean.split('/').pop());
  }
  return set;
}

// ---------- 解析：CSS 类名索引（类名 -> 定义它的 css 文件集合）----------
function cssClassIndex() {
  const idx = new Map();
  for (const f of readdirSyncSafe(STYLES).filter((f) => f.endsWith('.css'))) {
    const text = readFileSync(join(STYLES, f), 'utf8');
    const re = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g;
    let m;
    while ((m = re.exec(text))) {
      const cls = m[1];
      if (/[+/@]/.test(cls)) continue; // 排除 .svg+xml / .5 / @media 误伤
      if (!idx.has(cls)) idx.set(cls, new Set());
      idx.get(cls).add(f);
    }
  }
  return idx;
}

function readdirSyncSafe(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

// ---------- 解析：某视图 JS 模块图里引用的真实 DOM 类名 ----------
function jsClassTokens(view) {
  const html = readFileSync(join(WEBAPP, view), 'utf8');
  const scripts = [];
  const re = /<script\b[^>]*?\bsrc=["']([^"']+)["'][^>]*?>/gi;
  let m;
  while ((m = re.exec(html))) {
    const s = m[1].split('?')[0].replace(/^\.\//, '');
    if (s.startsWith('assets/scripts/')) scripts.push(s);
  }
  const tokens = new Set();
  const visited = new Set();
  const queue = [...scripts];
  while (queue.length) {
    const rel = queue.shift();
    if (visited.has(rel)) continue;
    visited.add(rel);
    const full = join(WEBAPP, rel);
    if (!existsSync(full)) continue;
    let code;
    try {
      code = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    extractClasses(code, tokens);
    const ire = /import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g;
    let im;
    while ((im = ire.exec(code))) {
      const spec = im[1];
      if (!spec.startsWith('.')) continue; // 跳过裸模块 / node_modules
      const imp = resolve(join(WEBAPP, dirname(rel)), spec);
      const impRel = relative(WEBAPP, imp);
      if (existsSync(join(WEBAPP, impRel))) queue.push(impRel);
      else if (existsSync(join(WEBAPP, impRel + '.js'))) queue.push(impRel + '.js');
    }
  }
  return tokens;
}

function extractClasses(code, tokens) {
  const push = (s) => {
    for (const t of String(s).split(/[\s"'`<]+/)) if (t) tokens.add(t);
  };
  let m;
  const r1 = /className\s*=\s*["'`]([^"'`<]+)["'`]/g; // className = '...'
  while ((m = r1.exec(code))) push(m[1]);
  const r2 = /classList\.(?:add|remove|toggle|contains)\(\s*["'`]([^"'`<]+)["'`]/g; // classList.add('...')
  while ((m = r2.exec(code))) push(m[1]);
  const r3 = /querySelector(?:All)?\(\s*["'`]\.([A-Za-z0-9_-]+)["'`]/g; // querySelector('.x')
  while ((m = r3.exec(code))) tokens.add(m[1]);
  const r4 = /class\s*=\s*["'`]([^"'`<]+)["'`]/g; // class="..."（模板串里）
  while ((m = r4.exec(code))) push(m[1]);
}

// ---------- 闸门 2 的白名单（已知的有意不对称）----------
function loadAllow() {
  const p = join(__dirname, 'load-matrix-allow.json');
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

// =====================================================================
let exitCode = 0;
const fail = (msg) => {
  console.error('❌ ' + msg);
  exitCode = 1;
};

// ---- 闸门 1：权威锁 ----
const manifestPath = join(__dirname, 'load-matrix.json');
let manifest = {};
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    fail(`load-matrix.json 解析失败：${e.message}`);
  }
}

if (argUpdate) {
  const out = {};
  for (const v of VIEWS) out[v] = [...linksOf(v)].sort();
  writeFileSync(manifestPath, JSON.stringify(out, null, 2) + '\n');
  console.log('✅ load-matrix.json 已基于当前源 HTML 重新生成：');
  for (const v of VIEWS) console.log(`   ${v}: ${out[v].length} 个 CSS`);
  process.exit(0);
}

if (Object.keys(manifest).length === 0) {
  fail('load-matrix.json 不存在或为空。请先运行 `node scripts/check-load-matrix.mjs --update` 生成基线。');
  process.exit(exitCode);
}

console.log('🔍 加载矩阵防漂移检查');
console.log('— 闸门 1：视图 <link> 集合 vs load-matrix.json —');
let gate1 = false;
for (const v of VIEWS) {
  const actual = linksOf(v);
  const expected = new Set(manifest[v] || []);
  const missing = [...expected].filter((x) => !actual.has(x));
  const extra = [...actual].filter((x) => !expected.has(x));
  if (missing.length) {
    fail(`${v}: 缺失期望 CSS 链接 → ${missing.join(', ')}`);
    gate1 = true;
  }
  if (extra.length) {
    fail(`${v}: 多余 CSS 链接(不在清单) → ${extra.join(', ')}`);
    gate1 = true;
  }
  if (!missing.length && !extra.length) {
    console.log(`   ✅ ${v} (${actual.size} 个)`);
  }
}

// ---- 闸门 2：JS 类名 ↔ CSS 归属 交叉校验 ----
console.log('— 闸门 2：JS 类引用 ↔ CSS 加载（疑似漂移扫描）—');
const idx = cssClassIndex();
const allow = loadAllow();
let gate2 = false;
for (const v of VIEWS) {
  const links = linksOf(v);
  const tokens = jsClassTokens(v);
  const others = new Set();
  for (const o of VIEWS)
    if (o !== v) for (const c of linksOf(o)) others.add(c);
  const allowSet = new Set(allow[v] || []);
  const flagged = new Map(); // ownerCss -> Set(class)
  for (const c of tokens) {
    const owners = idx.get(c);
    if (!owners || owners.size === 0) continue;
    if ([...owners].some((f) => links.has(f))) continue; // 本视图已加载至少一个归属文件
    const shared = [...owners].filter((f) => others.has(f) && !allowSet.has(f));
    if (shared.length === 0) continue;
    for (const f of shared) {
      if (!flagged.has(f)) flagged.set(f, new Set());
      flagged.get(f).add(c);
    }
  }
  for (const [f, classes] of flagged) {
    const msg = `⚠️  ${v} 的 JS 引用了类 [${[...classes].join(', ')}]，定义在 ${f} 中，但 ${v} 未加载该 CSS（其它视图已加载）→ 疑似加载矩阵漂移`;
    if (argStrict) {
      fail(msg);
      gate2 = true;
    } else {
      console.error('   ' + msg);
      gate2 = true;
    }
  }
}

// ---- 结论 ----
if (gate1) {
  console.error('\n❌ 闸门 1 失败：加载矩阵与本仓库锁定基线不一致（必要时 `npm run check:load-matrix -- --update` 后复核再提交）。');
} else if (gate2) {
  if (argStrict) {
    console.error('\n❌ 闸门 2(--strict) 发现疑似漂移，请确认各视图是否遗漏了必需的 CSS 链接。');
  } else {
    console.error('\n⚠️  闸门 2 发现疑似漂移（仅告警，不阻断；加 --strict 可升级为失败）。');
  }
} else {
  console.log('\n✅ 加载矩阵一致：三视图的 CSS 链接均符合锁定基线，且无 JS 类引用 ↔ CSS 加载的疑似漂移。');
}

process.exit(exitCode);
