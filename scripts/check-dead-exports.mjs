#!/usr/bin/env node
/**
 * 死导出候选清单（零依赖；CI 闸门 + `--update` 生成）
 * ==================================================================
 * 背景（死代码审计 D 类）：运行时导出若在生产代码中零消费者，就是死权重或冗余 export。
 *
 * 为什么需要闸门（§8「防再次堆积」）：审计已发现 ~45 个零消费者导出，其中多数为
 * 「仅本文件内部使用的冗余 export 关键字」（代码活着，去掉 export 即可改善 tree-shaking 信号）；
 * 少数为真死（如 appendToRoot / fallbackQuestion，已列为 A 级待删）。不固化清单，新增的
 * 未评审死导出会静默堆积。
 *
 * 做法（同 check-window-globals.mjs）：docs/dead-exports.md 维护 AUTO-GENERATED 区块，
 * 由本脚本从源码扫描生成。CI 默认模式校验漂移 —— 任何「新增的零消费者运行时导出」都会让
 * 生成结果与区块不一致 → 退出码 1，强制人工评审。`--update` 重新生成（评审通过后执行）。
 *
 * 用法：
 *   node scripts/check-dead-exports.mjs            # 校验
 *   node scripts/check-dead-exports.mjs --update   # 重新生成区块
 *
 * 扫描范围（关键：入口必须齐）：
 *   - webapp/assets/scripts 下所有 .js（排除 tests/）
 *   - src 下所有 .ts（排除 __tests__）+ 仓库根 main.ts（Obsidian 插件入口，esbuild entryPoints！
 *     首轮审计曾因漏扫 main.ts 把 4 个实际被入口消费的符号误判为零引用）
 *   - 排除 TS 纯类型声明：export type / export interface / export declare（零运行时成本，非死权重）
 *   - 保留 export enum（运行时对象）/ const / let / var / function / class / default
 *
 * 消费者判定（六形态，对应审计 §3）：
 *   1. import/export-from 引用（标识符文本命中即覆盖）
 *   2. 裸全局（剥离 import 后按 globalThis 解析 —— 同标识符文本）
 *   3. window.X / globalThis.X
 *   4. 字符串键（'X' / "X" / `X` —— 引号内命中，覆盖 ActionDispatcher/ROUTES/协议分发）
 *   5. CSS 不适用（JS 符号）
 *   6. 测试：tests/**、__tests__/**（单独统计，不影响「零生产消费者」判定）
 *   非单词字符名（如 $ / $$）用 `(?<![-\w$])…(?![-\w$])` 边界，避免 \b 失效误判（审计中曾发生）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS_DIR = path.join(ROOT, 'webapp/assets/scripts');
const SRC_DIR = path.join(ROOT, 'src');
const DOC = path.join(ROOT, 'docs/dead-exports.md');
const START = '<!-- AUTO-GENERATED:dead-exports START -->';
const END = '<!-- AUTO-GENERATED:dead-exports END -->';

const BUILT_HTML = new Set(['app.html', 'scroll.html', 'archive.html', 'module.html']);

function walk(dir, pred, skipTests = true, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if ((e.name === 'tests' || e.name === '__tests__') && skipTests) continue;
      if (e.name === 'node_modules') continue;
      walk(full, pred, skipTests, out);
    } else if (pred(e.name)) {
      out.push(full);
    }
  }
  return out;
}

function allSourceFiles() {
  const web = walk(SCRIPTS_DIR, (n) => n.endsWith('.js'));
  const host = walk(SRC_DIR, (n) => n.endsWith('.ts'));
  const main = path.join(ROOT, 'main.ts');
  if (fs.existsSync(main)) host.push(main);
  // 源码 html（含内联脚本/字符串键），排除打包产物
  const htmls = fs.readdirSync(path.join(ROOT, 'webapp'))
    .filter((f) => /\.html$/.test(f) && !BUILT_HTML.has(f))
    .map((f) => path.join(ROOT, 'webapp', f));
  return { web, host, htmls };
}

const runtimeExportRe = /^\s*export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
const defaultExportRe = /^\s*export\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/gm;
const reexportRe = /^\s*export\s*\{([^}]+)\}/gm;
const typeDeclRe = /^\s*export\s+(?:type|interface|declare)\b/gm;

function collectExports(files) {
  const map = new Map(); // key=file::name -> {file, name, defLine}
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const lines = src.split('\n');
    const push = (name, idx) => {
      if (!name) return;
      const key = `${f}::${name}`;
      if (!map.has(key)) map.set(key, { file: f, name, defLine: idx + 1 });
    };
    // 跳过整行类型声明行（避免把 type/interface 当运行时导出）
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (typeDeclRe.test(ln)) continue;
      let m;
      runtimeExportRe.lastIndex = 0;
      while ((m = runtimeExportRe.exec(ln))) push(m[1], i);
      defaultExportRe.lastIndex = 0;
      while ((m = defaultExportRe.exec(ln))) push(m[1], i);
    }
    reexportRe.lastIndex = 0;
    let m;
    while ((m = reexportRe.exec(src))) {
      for (const part of m[1].split(',')) {
        const nm = part.trim().split(/\s+as\s+/).pop().trim();
        if (/^[A-Za-z_$][\w$]*$/.test(nm)) {
          // 重导出项通常引用本文件已存在的绑定；以本文件名标记
          const key = `${f}::${nm}`;
          if (!map.has(key)) map.set(key, { file: f, name: nm, defLine: -1, reexport: true });
        }
      }
    }
  }
  return map;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function analyze() {
  const { web, host, htmls } = allSourceFiles();
  // 生产语料（用于消费者判定）
  const prodFiles = [...web, ...host, ...htmls];
  const corpus = new Map();
  for (const f of prodFiles) corpus.set(f, fs.readFileSync(f, 'utf8'));
  const exportsMap = collectExports([...web, ...host]);

  // 测试语料（不计入「生产消费者」，仅用于标注），单独收集（含 tests / __tests__ 目录）
  const testFiles = [
    ...walk(SCRIPTS_DIR, (n) => n.endsWith('.js'), false).filter((f) => f.includes(path.sep + 'tests' + path.sep)),
    ...walk(SRC_DIR, (n) => n.endsWith('.ts'), false).filter((f) => f.includes(path.sep + '__tests__' + path.sep)),
  ];
  const testCorpus = new Map();
  for (const f of testFiles) testCorpus.set(f, fs.readFileSync(f, 'utf8'));

  const results = [];
  for (const { file, name, defLine, reexport } of exportsMap.values()) {
    const idRe = new RegExp(`(?<![-\\w$])${escapeRe(name)}(?![-\\w$])`);
    const qRe = new RegExp(`['"\`]\\s*${escapeRe(name)}\\s*['"\`]`);
    let extProd = 0;
    let internal = 0;
    const ownSrc = corpus.get(file) || '';
    const ownLines = ownSrc.split('\n');
    let defIdx = defLine > 0 ? defLine - 1 : -1;
    for (let i = 0; i < ownLines.length; i++) {
      if ((idRe.test(ownLines[i]) || qRe.test(ownLines[i])) && i !== defIdx) internal++;
    }
    for (const [f, s] of corpus) {
      if (f === file) continue;
      if (idRe.test(s) || qRe.test(s)) extProd++;
    }
    let testRef = 0;
    for (const [f, s] of testCorpus) {
      if (idRe.test(s) || qRe.test(s)) testRef++;
    }
    const dead = extProd === 0;
    results.push({ file: path.relative(ROOT, file), name, internal, extProd, testRef, dead, reexport: !!reexport });
  }
  results.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name));
  return results.filter((r) => r.dead);
}

function renderBlock(results) {
  const groups = new Map();
  for (const r of results) {
    if (!groups.has(r.file)) groups.set(r.file, []);
    groups.get(r.file).push(r);
  }
  const rows = [];
  for (const [file, items] of [...groups.entries()].sort()) {
    for (const r of items) {
      const tag = r.internal > 0 ? '内部使用(冗余export)' : (r.testRef > 0 ? '仅测试引用' : '零引用');
      rows.push(`| \`${r.name}\` | ${tag} | 内部:${r.internal} 测试:${r.testRef} |${r.reexport ? ' 重导出' : ''}`);
    }
  }
  return [
    START,
    '> 本节由 `scripts/check-dead-exports.mjs` **自动生成，勿手改**。改完代码执行：',
    '> `node scripts/check-dead-exports.mjs --update`（CI 跑默认模式校验漂移）。',
    '>',
    '> 扫描：webapp JS(排除 tests) + src TS(排除 __tests__) + 根 main.ts（插件入口）；排除 TS type/interface/declare。',
    '> 判定：生产代码零消费者（标识符 + 引号内字符串键）即记为死导出。非单词名($/$$)用专用边界。',
    '',
    `**零消费者运行时导出合计：${results.length}**`,
    '',
    '| 导出名 | 状态 | 内部/测试引用 |',
    '|---|---|---|',
    ...rows,
    END,
  ].join('\n');
}

const dead = analyze();
const expected = renderBlock(dead);
const update = process.argv.includes('--update');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const hasBlock = doc.includes(START) && doc.includes(END);

if (update) {
  const head = hasBlock
    ? doc.slice(0, doc.indexOf(START)).replace(/\s*$/, '\n\n')
    : `${doc.replace(/\s*$/, '')}\n\n`;
  fs.writeFileSync(DOC, head + expected + '\n');
  console.log(`[dead-exports] 已更新 ${path.relative(ROOT, DOC)}：${dead.length} 个零消费者运行时导出`);
  process.exit(0);
}

if (!hasBlock) {
  console.error('[dead-exports] ❌ 文档缺少 AUTO-GENERATED 区块（先跑一次 --update 生成）');
  process.exit(1);
}
const actual = doc.slice(doc.indexOf(START), doc.indexOf(END) + END.length);
if (actual !== expected) {
  console.error('[dead-exports] ❌ 死导出清单与代码不一致（漂移）。');
  console.error('  原因：新增了未评审的零消费者运行时导出，或某导出被新接线/被删。');
  console.error('  修复：评审后执行 node scripts/check-dead-exports.mjs --update');
  process.exit(1);
}
console.log(`[dead-exports] ✅ 清单与代码一致：${dead.length} 个零消费者运行时导出`);
