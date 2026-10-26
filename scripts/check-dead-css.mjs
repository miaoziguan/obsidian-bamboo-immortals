#!/usr/bin/env node
/**
 * 死 CSS 候选清单（零依赖；CI 闸门 + `--update` 生成）
 * ==================================================================
 * 背景（死代码审计 F 类）：docs/dead-css-candidates.md 是 2026-10-26 审计产出的
 * 「疑似死 CSS」候选。CSS 规则若类名/ID 从未被任何标记命中，就是死权重。
 *
 * 为什么需要闸门（§8「防再次堆积」）：
 *   不固化清单，下次审计又从 0 开始；且新增的未用 CSS 会静默堆积。
 *
 * 做法（同 check-window-globals.mjs）：文档里只维护一段 AUTO-GENERATED 区块，
 * 由本脚本从源码扫描生成。CI 跑默认模式（不加 --update）即可发现漂移
 * （新增未评审的死 CSS，或已裁决删除/复活的类）。
 *
 * 用法：
 *   node scripts/check-dead-css.mjs            # 校验（漂移则退出码 1）
 *   node scripts/check-dead-css.mjs --update   # 重新生成区块
 *
 * 扫描范围：
 *   - 定义侧：webapp/assets/styles 下的所有 .css
 *   - 使用侧：webapp/assets/scripts 下的所有 .js（排除 tests/） + webapp 下 *src*.html / index.html
 *   - 刻意排除 4 个打包产物 html（app/scroll/archive/module.html）：它们内联了本仓库 CSS 源码，
 *     把选择器定义当成「使用」会误判。源码 html 已覆盖静态标记；运行时标记来自 JS innerHTML，已被覆盖。
 *
 * 误判防护（与审计记录一致）：
 *   1. CSS 颜色值（如 #A5B4FC）被误当 id 选择器 → 过滤纯十六进制。
 *   2. 动态拼接类名（如 'tw-mm-style-' + n、模板前缀 week-）→ 含数字后缀的类若其「前缀兄弟类」
 *      被使用，则判为动态生成，从「确认死」移到「疑似动态（已剔除）」列，不计入闸门判定。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STYLES_DIR = path.join(ROOT, 'webapp/assets/styles');
const SCRIPTS_DIR = path.join(ROOT, 'webapp/assets/scripts');
const DOC = path.join(ROOT, 'docs/dead-css-candidates.md');
const START = '<!-- AUTO-GENERATED:dead-css START -->';
const END = '<!-- AUTO-GENERATED:dead-css END -->';

const BUILT_HTML = new Set(['app.html', 'scroll.html', 'archive.html', 'module.html']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'tests' || e.name === 'node_modules') continue;
      walk(full, out);
    } else if (e.name.endsWith('.css')) {
      out.push(full);
    }
  }
  return out;
}

/** 从 JS + 源码 html 收集「使用侧」文本（用于类名/ID 命中） */
function buildUsageCorpus() {
  const files = [];
  const collectJs = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'tests' || e.name === 'node_modules') continue;
        collectJs(full);
      } else if (e.name.endsWith('.js')) {
        files.push(full);
      }
    }
  };
  collectJs(SCRIPTS_DIR);
  const htmls = fs.readdirSync(path.join(ROOT, 'webapp'))
    .filter((f) => /\.html$/.test(f) && !BUILT_HTML.has(f));
  for (const f of htmls) files.push(path.join(ROOT, 'webapp', f));
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
}

/** 收集 CSS 中定义的类选择器与 id 选择器 */
function collectSelectors() {
  const classes = new Set();
  const ids = new Set();
  const hexRe = /^[0-9a-fA-F]{3,8}$/;
  for (const file of walk(STYLES_DIR)) {
    let css = fs.readFileSync(file, 'utf8');
    css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    for (const m of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) classes.add(m[1]);
    for (const m of css.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)) {
      const id = m[1];
      if (!hexRe.test(id)) ids.add(id);
    }
  }
  return { classes: [...classes], ids: [...ids] };
}

/** 是否作为完整令牌（不被更长连字符/标识符吞并）出现在文本中 */
function isUsed(name, corpus) {
  return new RegExp(`(?<![-\\w])${escapeRe(name)}(?![-\\w])`).test(corpus);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 检测动态拼接前缀（如 'tw-mm-style-' + n），返回 Set<prefix> */
function dynamicPrefixes(corpus) {
  const prefixes = new Set();
  const re = /(['"`])([a-zA-Z][\w-]{4,})\1\s*\+\s*|\+\s*(['"`])([a-zA-Z][\w-]{4,})\3/g;
  for (const m of corpus.matchAll(re)) {
    prefixes.add(m[2] || m[4]);
  }
  // 模板字符串 `${...}prefix`
  for (const m of corpus.matchAll(/\$\{\s*[^\}]*\}\s*(['"`])([a-zA-Z][\w-]{4,})\1/g)) {
    prefixes.add(m[2]);
  }
  return prefixes;
}

function clusterOf(name) {
  const i = name.indexOf('-');
  if (i === -1) return name;
  const head = name.slice(0, i);
  // 把 week-day / goal-action-btn 这类按首段聚类；纯前缀足够区分
  return head;
}

function analyze() {
  const { classes, ids } = collectSelectors();
  const corpus = buildUsageCorpus();
  const dyn = dynamicPrefixes(corpus);

  const usedClasses = new Set(classes.filter((c) => isUsed(c, corpus)));
  const usedIds = new Set(ids.filter((id) => isUsed(id, corpus)));
  const deadClasses = classes.filter((c) => !usedClasses.has(c));
  const deadIds = ids.filter((id) => !usedIds.has(id));

  // 动态拼接嫌疑：类以数字结尾，且其「前缀（去尾部数字）」存在被使用的兄弟类 → 动态生成
  const dynamicClasses = new Set();
  for (const c of deadClasses) {
    const m = c.match(/^(.*?)(\d+)$/);
    if (!m) continue;
    const base = m[1];
    let siblingUsed = false;
    for (const u of usedClasses) if (u.startsWith(base)) { siblingUsed = true; break; }
    if (siblingUsed || [...dyn].some((p) => c.startsWith(p))) dynamicClasses.add(c);
  }

  const confirmed = deadClasses.filter((c) => !dynamicClasses.has(c));
  return { confirmed, dynamic: [...dynamicClasses], ids: deadIds };
}

function renderBlock(res) {
  const { confirmed, dynamic, ids } = res;
  const clusters = new Map();
  for (const c of confirmed) {
    const k = clusterOf(c);
    if (!clusters.has(k)) clusters.set(k, []);
    clusters.get(k).push(c);
  }
  const clusterRows = [...clusters.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([k, arr]) => `| \`${k}\` | ${arr.length} | ${arr.slice(0, 6).map((x) => `\`${x}\``).join(', ')}${arr.length > 6 ? ', …' : ''} |`)
    .join('\n');

  return [
    START,
    '> 本节由 `scripts/check-dead-css.mjs` **自动生成，勿手改**。改完代码执行：',
    '> `node scripts/check-dead-css.mjs --update`（CI 跑默认模式校验漂移）。',
    '>',
    '> 扫描：定义 `webapp/assets/styles/**/*.css`；使用 `webapp/assets/scripts/**/*.js`(排除 tests) + `webapp/*src*.html`/`index.html`（刻意排除 4 个打包产物 html，避免把 CSS 定义当使用）。',
    '> 误判防护：十六进制颜色值过滤；动态拼接类名（`prefix`+n）移至「疑似动态」列，不计入判定。',
    '',
    `**确认死类名：${confirmed.length}　疑似动态（已剔除）：${dynamic.length}　死 ID 选择器：${ids.length}**`,
    '',
    '### 按首段聚类（确认死类名）',
    '',
    '| 前缀簇 | 数量 | 样例 |',
    '|---|---|---|',
    clusterRows,
    '',
    '### 疑似动态拼接（已从判定剔除，待人工确认）',
    '',
    dynamic.length ? dynamic.slice(0, 40).map((x) => `\`${x}\``).join(' ') : '（无）',
    '',
    '### 死 ID 选择器',
    '',
    ids.length ? ids.map((x) => `\`#${x}\``).join(' ') : '（无）',
    END,
  ].join('\n');
}

const res = analyze();
const expected = renderBlock(res);
const update = process.argv.includes('--update');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const hasBlock = doc.includes(START) && doc.includes(END);

if (update) {
  const head = hasBlock
    ? doc.slice(0, doc.indexOf(START)).replace(/\s*$/, '\n\n')
    : `${doc.replace(/\s*$/, '')}\n\n`;
  fs.writeFileSync(DOC, head + expected + '\n');
  console.log(`[dead-css] 已更新 ${path.relative(ROOT, DOC)}：确认死类 ${res.confirmed.length} / 疑似动态 ${res.dynamic.length} / 死 ID ${res.ids.length}`);
  process.exit(0);
}

if (!hasBlock) {
  console.error('[dead-css] ❌ 文档缺少 AUTO-GENERATED 区块（先跑一次 --update 生成）');
  process.exit(1);
}
const actual = doc.slice(doc.indexOf(START), doc.indexOf(END) + END.length);
if (actual !== expected) {
  console.error('[dead-css] ❌ 死 CSS 清单与代码不一致（漂移）。');
  console.error('  可能原因：新增未评审的死 CSS，或已裁决删除/复活的类。');
  console.error('  修复：node scripts/check-dead-css.mjs --update（更新前请人工核对差异）');
  process.exit(1);
}
console.log(`[dead-css] ✅ 清单与代码一致：确认死类 ${res.confirmed.length} / 疑似动态 ${res.dynamic.length} / 死 ID ${res.ids.length}`);
