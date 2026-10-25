#!/usr/bin/env node
/**
 * window 全局挂载点清单同步检查（零依赖；CI 闸门 + `--update` 生成）
 * ==================================================================
 * 背景（P1-3）：docs/window-globals.md 原本是 2026-06-17 的**手工快照**（自称 70 项），
 * 而代码里实际已有 100+ 处 `window.X =` 挂载 —— 文档与代码严重脱节。
 *
 * 为什么这不是纯文档问题：webapp 各模块大量依赖「文件尾把符号挂到 window」这一**隐式契约**
 * （剥离 import 后按裸名解析、隐含加载顺序依赖）。清单失真 = 这份隐式契约不可审计，
 * 改动时无法判断「这个全局还有谁在用」。
 *
 * 做法：文档里只维护一段 AUTO-GENERATED 区块（其余手写说明原样保留），
 * 由本脚本从源码扫描生成。CI 跑默认模式（不加 --update）即可发现漂移。
 *
 * 用法：
 *   node scripts/check-window-globals.mjs            # 校验（漂移则退出码 1）
 *   node scripts/check-window-globals.mjs --update   # 重新生成区块
 *
 * 扫描范围：webapp/assets/scripts/**\/*.js（排除 tests/）。打包产物 html 不计入
 * （其中的代码由本目录源码经 bundle-webapp.mjs 生成）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS_DIR = path.join(ROOT, 'webapp/assets/scripts');
const DOC = path.join(ROOT, 'docs/window-globals.md');
const START = '<!-- AUTO-GENERATED:window-globals START -->';
const END = '<!-- AUTO-GENERATED:window-globals END -->';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'tests' || e.name === 'node_modules') continue;
      walk(full, out);
    } else if (e.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

/** 收集 window.NAME = 赋值（排除 == 比较） */
function collect() {
  const byFile = new Map();   // relPath -> Set<name>
  for (const file of walk(SCRIPTS_DIR)) {
    const src = fs.readFileSync(file, 'utf8');
    const names = new Set();
    for (const m of src.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)) names.add(m[1]);
    if (names.size) {
      byFile.set(path.relative(SCRIPTS_DIR, file).split(path.sep).join('/'), names);
    }
  }
  return byFile;
}

function renderBlock(byFile) {
  const rels = [...byFile.keys()].sort();
  const all = [];
  for (const rel of rels) for (const n of byFile.get(rel)) all.push({ rel, n });
  const internal = all.filter((x) => x.n.startsWith('__'));
  const publicOnes = all.filter((x) => !x.n.startsWith('__'));

  const table = (items) => {
    const grouped = new Map();
    for (const { rel, n } of items) {
      if (!grouped.has(rel)) grouped.set(rel, []);
      grouped.get(rel).push(n);
    }
    const rows = [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rel, names]) => `| \`${rel}\` | ${names.sort().map((n) => `\`window.${n}\``).join('<br>')} |`);
    return ['| 文件 | 挂载点 |', '|---|---|', ...rows].join('\n');
  };

  return [
    START,
    '> 本节由 `scripts/check-window-globals.mjs` **自动生成，勿手改**。改完代码执行：',
    '> `node scripts/check-window-globals.mjs --update`（CI 会跑默认模式校验漂移）。',
    '>',
    '> 扫描范围：`webapp/assets/scripts/**/*.js`（排除 `tests/`）；打包产物 html 不计入。',
    '',
    `**合计 ${all.length} 个挂载点 / ${rels.length} 个文件**（其中 \`__\` 开头的内部标记 ${internal.length} 个）。`,
    '',
    `### 公共挂载点（${publicOnes.length}）`,
    '',
    table(publicOnes),
    '',
    `### 内部标记（${internal.length}）`,
    '',
    '> `__bamboo*` 等内部标记用于宿主↔webapp 传参/状态透传，不属于对外 API。',
    '',
    table(internal),
    END,
  ].join('\n');
}

const byFile = collect();
const expected = renderBlock(byFile);
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

const hasBlock = doc.includes(START) && doc.includes(END);
const actual = hasBlock ? doc.slice(doc.indexOf(START), doc.indexOf(END) + END.length) : null;
const update = process.argv.includes('--update');

if (update) {
  const head = hasBlock ? doc.slice(0, doc.indexOf(START)).replace(/\s*$/, '\n\n') : `${doc.replace(/\s*$/, '')}\n\n`;
  fs.writeFileSync(DOC, head + expected + '\n');
  const count = [...byFile.values()].reduce((n, s) => n + s.size, 0);
  console.log(`[window-globals] 已更新 ${path.relative(ROOT, DOC)}：${count} 个挂载点 / ${byFile.size} 个文件`);
  process.exit(0);
}

if (!hasBlock) {
  console.error('[window-globals] ❌ 文档中缺少 AUTO-GENERATED 区块（先跑一次 --update 生成）');
  process.exit(1);
}
if (actual !== expected) {
  console.error('[window-globals] ❌ 清单与代码不一致（漂移）。');
  console.error('  修复：node scripts/check-window-globals.mjs --update');
  // 给出简要差异提示（不打印全文，避免刷屏）
  const ex = expected.split('\n').filter((l) => l.startsWith('| `'));
  const ac = actual.split('\n').filter((l) => l.startsWith('| `'));
  const onlyExpected = ex.filter((l) => !ac.includes(l)).slice(0, 5);
  const onlyActual = ac.filter((l) => !ex.includes(l)).slice(0, 5);
  if (onlyExpected.length) console.error('  代码新增（文档缺）:\n    ' + onlyExpected.join('\n    '));
  if (onlyActual.length) console.error('  文档陈旧（代码已无）:\n    ' + onlyActual.join('\n    '));
  process.exit(1);
}

const count = [...byFile.values()].reduce((n, s) => n + s.size, 0);
console.log(`[window-globals] ✅ 清单与代码一致：${count} 个挂载点 / ${byFile.size} 个文件`);
