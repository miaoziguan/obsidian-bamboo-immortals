#!/usr/bin/env node
/**
 * 死方法候选清单（零依赖；CI 闸门 + `--update` 生成）
 * ==================================================================
 * 背景：check-dead-exports.mjs 只扫 `export` 符号，且判定是「消费者计数」而非
 * 「可达性」。两起真实事故都从它的盲区溜过：
 *
 *   1. whiteNoiseManager._showInputModal —— 对象字面量方法，不是 export，
 *      根本不在扫描范围；全仓零调用却存活至今（2026-10 复查发现）。
 *   2. timeline editor —— TimelineEditor 有 1 个消费者（index.js 的
 *      `Editor: TimelineEditor`），但那个消费者自己是死的（openEditor 零调用）。
 *      「引用链到死出口就断了」，计数看不见。
 *
 * 本脚本补第一层：**方法级零引用扫描**。对象方法 `name(...) {` 若在生产代码中
 * 零文本引用（排除所有方法声明行），记为死候选 → 快照到 docs/dead-methods.md。
 * 任何「新增的死方法」触发 CI 失败，强制评审；清理后 --update 移出快照。
 *
 * 已知局限（诚实声明，勿过度信任）：
 *   - 同名方法共享判定：任何一个 `render()` 被引用，所有 `render()` 都不算死
 *     （保守，宁可漏报）。
 *   - 不覆盖属性键（`Editor: TimelineEditor` 的 `Editor`）——「唯一消费者自身
 *     已死」的传递性判定需要真正的调用图，是未来工作（见 ADR「接线三问」）。
 *   - 动态派发（this[key]、字符串拼名）依赖字符串键命中，与 dead-exports 同款假设。
 *
 * 用法：
 *   node scripts/check-dead-methods.mjs            # 校验漂移
 *   node scripts/check-dead-methods.mjs --update   # 重新生成 docs/dead-methods.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS_DIR = path.join(ROOT, 'webapp/assets/scripts');
const SRC_DIR = path.join(ROOT, 'src');
const DOC = path.join(ROOT, 'docs/dead-methods.md');
const START = '<!-- AUTO-GENERATED:dead-methods START -->';
const END = '<!-- AUTO-GENERATED:dead-methods END -->';
const BUILT_HTML = new Set(['app.html', 'scroll.html', 'archive.html', 'module.html']);

// 控制流关键字 / 语言结构，不是方法名
const KEYWORDS = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof',
  'constructor', 'get', 'set', 'static', 'do', 'else', 'try', 'with',
]);

const METHOD_DECL_RE = /^\s*(?:async\s+)?(?:\*\s*)?([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{\s*$/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'tests' || e.name === '__tests__' || e.name === 'node_modules') continue;
      walk(full, out);
    } else if (e.name.endsWith('.js') || e.name.endsWith('.ts')) out.push(full);
    // ↑ .ts 必须收：src/ 宿主侧是生产语料的一半（~1.5 万行）。
    //   初版漏收导致 src 独占引用的方法被误判死（如 layoutMode.exit ——
    //   其 4 处「引用」实为 BambooReaderView.ts 的同名局部变量，但
    //   src 里真正调用这些方法的场景若存在也会被同样漏掉）。
  }
  return out;
}

function sourceFiles() {
  const web = walk(SCRIPTS_DIR);
  const host = walk(SRC_DIR).filter((f) => f.endsWith('.ts'));
  const main = path.join(ROOT, 'main.ts');
  if (fs.existsSync(main)) host.push(main);
  const htmls = fs.readdirSync(path.join(ROOT, 'webapp'))
    .filter((f) => /\.html$/.test(f) && !BUILT_HTML.has(f))
    .map((f) => path.join(ROOT, 'webapp', f));
  return [...web, ...host, ...htmls];
}

const esc = (name) =>
  /[\w$]/.test(name[0]) && /[\w$]/.test(name[name.length - 1])
    ? `\\b${name}\\b`
    : `(?<![\\w$])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w$])`;

// ---------- 收集方法声明（仅 webapp JS；TS/html 只作引用语料） ----------
function collectMethods() {
  const methods = [];
  for (const file of walk(SCRIPTS_DIR)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(METHOD_DECL_RE);
      if (!m) return;
      const name = m[1];
      if (KEYWORDS.has(name)) return;
      methods.push({ name, file: rel, line: i + 1 });
    });
  }
  return methods;
}

// ---------- 语料：生产代码逐行（排除一切方法声明行） ----------
function corpusLines() {
  const out = [];
  for (const file of sourceFiles()) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      if (METHOD_DECL_RE.test(line)) continue; // 声明行不算引用（含他文件同名声明）
      out.push(line);
    }
  }
  return out;
}

function findDead() {
  const methods = collectMethods();
  const corpus = corpusLines();
  const dead = [];
  const seen = new Set();
  for (const { name, file, line } of methods) {
    const key = name;
    if (seen.has(key)) continue; // 同名共享判定：出现重复名时只报一次
    seen.add(key);
    const re = new RegExp(esc(name));
    const refs = corpus.reduce((n, l) => (re.test(l) ? n + 1 : n), 0);
    if (refs === 0) dead.push({ name, file, line });
  }
  return dead.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

// ---------- 文档读写 ----------
function renderDoc(dead) {
  const rows = dead
    .map(({ name, file, line }) => `| \`${name}\` | \`${file}:${line}\` |`)
    .join('\n');
  return `# 死方法候选清单（零引用对象方法）

> 本清单由 \`scripts/check-dead-methods.mjs\` 自动生成 + 人工裁决。
> 背景：_showInputModal（零调用存活）、timeline editor（唯一消费者自身已死）
> 两起事故后补的方法级扫描。参见 docs/ui-debt-decisions.md「接线三问」。

## 闸门意图

任何「新增的零引用方法」触发 CI 失败（强制评审）。已知局限见脚本头部注释
（同名共享判定、属性键不覆盖、动态派发假设）——宁可漏报，不误伤。

---

${START}
> 本节由 \`scripts/check-dead-methods.mjs\` **自动生成，勿手改**。改完代码执行：
> \`node scripts/check-dead-methods.mjs --update\`（CI 跑默认模式校验漂移）。

**零引用方法合计：${dead.length}**

| 方法 | 位置 |
|---|---|
${rows || '（无）'}
${END}
`;
}

function readBlock(text) {
  const s = text.indexOf(START);
  const e = text.indexOf(END);
  if (s === -1 || e === -1) return null;
  return text.slice(s, e + END.length);
}

// ---------- 主流程 ----------
const dead = findDead();
const docText = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

if (process.argv.includes('--update')) {
  const head = docText.split(START)[0] || '';
  const tail = docText.includes(END) ? '' : '';
  fs.writeFileSync(DOC, renderDoc(dead));
  console.log(`[dead-methods] 已更新 docs/dead-methods.md：${dead.length} 个零引用方法`);
  process.exit(0);
}

const current = renderDoc(dead);
const existing = docText ? readBlock(docText) : null;
if (existing === null) {
  console.error('[dead-methods] ❌ docs/dead-methods.md 不存在或缺 AUTO-GENERATED 区块。');
  console.error('  修复：node scripts/check-dead-methods.mjs --update（评审后执行）');
  process.exit(1);
}
if (existing.trim() !== current.slice(current.indexOf(START), current.indexOf(END) + END.length).trim()) {
  console.error('[dead-methods] ❌ 死方法清单与代码不一致（漂移）。');
  console.error('  原因：新增了零引用方法，或某方法被新接线/被删。');
  console.error('  修复：评审后执行 node scripts/check-dead-methods.mjs --update');
  const existingNames = new Set([...existing.matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1]));
  const currentNames = new Set([...current.matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1]));
  const added = [...currentNames].filter((n) => !existingNames.has(n));
  const removed = [...existingNames].filter((n) => !currentNames.has(n));
  if (added.length) console.error(`  新增：${added.join(', ')}`);
  if (removed.length) console.error(`  移除：${removed.join(', ')}`);
  process.exit(1);
}
console.log(`[dead-methods] ✅ 清单与代码一致：${dead.length} 个零引用方法`);
