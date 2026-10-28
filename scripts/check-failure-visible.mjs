/**
 * 失败可见性门禁（failure visible）：catch 里「返回空值」必须有交代。
 *
 * 背景：本仓最高频的缺陷模式是「失败被当成空值/不存在」，且会复发 ——
 * 近两周同一模式被修过两次，每次都只修被报告的那一处：
 *   · 18199922 修画中卷三档的 docFailed，goals 路径没跟
 *   · 59572ba 修 putSettings 的非 TFile 分支，putSetting 没跟（dc80ae1 才补）
 *
 * 规则：catch 块内 `return null/[]/false/undefined` 时，必须满足其一——
 *   ① 块内调用了失败标记（MARKERS 白名单）
 *   ② 在 docs/failure-exemptions.md 中按「文件 + 所在函数」登记
 * 否则红。
 *
 * 为什么豁免必须登记、不能只写注释：写注释的成本趋近于零，等于没有约束。
 * 本仓已有先例——为了让闸门变绿而补的理由并不可靠。登记要求同时说明
 * 「触发条件与后果」，并把维护成本抬高到「要动第二个文件」。
 *
 * 已知逃逸口（不假装穷尽）：
 *   · 链式 `.catch(() => [])`、`?? []` 兜底、`if (!x) return` 早退 —— 不在扫描范围
 *   · 函数名靠「向上找最近的单行签名」推断，跨行签名或多层嵌套可能认错
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXEMPTION_DOC = path.join(ROOT, 'docs/failure-exemptions.md');
const SKIP = /(__tests__|\.test\.ts$|node_modules)/;

const MARKERS = [
  '_ioFailedPaths.add',
  'markDocFailed',
  'quarantineCorrupt',
  '_showSaveFailed',
  'respondError',
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '__tests__'].includes(e.name)) continue;
      walk(full, out);
    } else if (e.name.endsWith('.ts') && !SKIP.test(full)) {
      out.push(full);
    }
  }
  return out;
}

/** 解析登记表：| `文件` | `函数` | ... | */
function loadExemptions() {
  if (!fs.existsSync(EXEMPTION_DOC)) return new Set();
  const set = new Set();
  for (const line of fs.readFileSync(EXEMPTION_DOC, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/);
    if (m) set.add(`${m[1]}::${m[2]}`);
  }
  return set;
}

/** 向上找最近的单行函数签名 */
function enclosingFunction(lines, startLine) {
  // 修饰符顺序不定（`private async` / `async private` 都可能），统一按无序处理。
  // 必须以 `{` 结尾 —— 否则会把「跨行调用里的某一行」当成函数定义
  // （实际踩过：把 `normalizePath(\`...\`)` 认成了所在函数）。
  const re =
    /^\s{0,8}(?:export\s+)?(?:(?:async|private|public|protected|static)\s+)*(?:function\s+)?([A-Za-z_$][\w$]*)\s*\(.*\)\s*(?::\s*[^{]+)?\{\s*$/;
  for (let i = startLine - 1; i >= 0; i--) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];
    if (['if', 'for', 'while', 'switch', 'catch', 'return', 'else', 'do'].includes(name)) continue;
    return name;
  }
  return null;
}

function catchBlocks(src) {
  const out = [];
  const re = /catch\s*(?:\([^)]*\))?\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const start = src.indexOf('{', m.index);
    let depth = 0;
    for (let i = start; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) {
          out.push({
            line: src.slice(0, m.index).split('\n').length,
            body: src.slice(m.index, i + 1),
          });
          break;
        }
      }
    }
  }
  return out;
}

const exemptions = loadExemptions();
const failures = [];

for (const file of walk(path.join(ROOT, 'src'))) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');

  for (const { line, body } of catchBlocks(src)) {
    if (!/return\s+(null|\[\]|false|undefined|0|'')\b/.test(body)) continue;
    if (MARKERS.some((k) => body.includes(k))) continue; // ① 已标记

    const fn = enclosingFunction(lines, line);
    const key = `${rel}::${fn}`;
    if (fn && exemptions.has(key)) continue; // ② 已登记

    failures.push({ where: `${rel}:${line}`, fn });
  }
}

if (failures.length) {
  console.error('[failure-visible] ❌ catch 里返回了空值，但没有交代：');
  for (const f of failures) {
    console.error(`  ${f.where}${f.fn ? `（函数 ${f.fn}）` : '（未能识别所在函数）'}`);
  }
  console.error('  修复二选一：');
  console.error('    · 加失败标记（_ioFailedPaths.add / markDocFailed / respondError …）');
  console.error('    · 在 docs/failure-exemptions.md 登记，并写清「触发条件与后果」');
  console.error('  注意：仅在代码里写注释**不能**通过本闸门。');
  process.exit(1);
}

console.log(
  `[failure-visible] ✅ catch 的「返回空」均已交代（标记或登记，登记 ${exemptions.size} 条）。`,
);
