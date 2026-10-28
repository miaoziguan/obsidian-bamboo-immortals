/**
 * 失败可见性门禁（failure visible）：catch 里「返回空值」必须有交代。
 *
 * 为什么需要它：本仓最高频的缺陷模式是「失败被当成空值/不存在」，
 * 而且它会复发 —— 近两周内同一模式被修过两次，每次都只修被报告的那一处：
 *   · 18199922 修了画中卷三档的 docFailed，goals 路径没跟着修
 *   · 59572ba 修了 putSettings 的非 TFile 分支，putSetting 没跟着修（dc80ae1 才补）
 * 结果：每修一次，下一次换个文件以同样形态再出现一次。
 *
 * 规则：catch 块内出现 `return null/[]/false/undefined` 时，必须满足其一——
 *   ① 块内有注释（任意说明即可，本仓历史写法多为「/* 已存在则忽略 *\/」）
 *   ② 块内调用了失败标记（白名单见 MARKERS）
 * 否则视为「静默吞没」，红。
 *
 * 为什么只要求「有注释」而不要求固定句式：本仓 51 处 catch-return-空值里，
 * 46 处早就有说明，只有 5 处是彻底静默的。强制统一句式会把 46 处无关代码
 * 卷进来，那不是治理质量，是制造 diff。
 *
 * 盲区（宁可漏报，不误伤）：
 * - 只认 `catch {` 块内的 return；链式 `.catch(() => [])`、`?? []` 兜底、
 *   `if (!x) return` 早退都不在覆盖范围（这三类是本机制的已知逃逸口）
 * - 注释只要存在即通过，不判断理由是否成立 —— 这是刻意的，理由的审查
 *   属于 code review，不属于静态闸门
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = ['src'];
const SKIP = /(__tests__|\.test\.ts$|node_modules)/;

/** 标记函数：调用它们等于「失败已被记录，不会静默」 */
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

/** 提取所有 catch { ... } 块（大括号配平） */
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

const failures = [];
for (const file of walk(path.join(ROOT, 'src'))) {
  const src = fs.readFileSync(file, 'utf8');
  for (const { line, body } of catchBlocks(src)) {
    const returnsEmpty = /return\s+(null|\[\]|false|undefined|0|'')\b/.test(body);
    if (!returnsEmpty) continue;

    const hasComment = /\/\/|\/\*/.test(body);
    const hasMarker = MARKERS.some((k) => body.includes(k));
    if (hasComment || hasMarker) continue;

    failures.push(`${path.relative(ROOT, file)}:${line}`);
  }
}

if (failures.length) {
  console.error('[failure-visible] ❌ catch 里返回了空值，但没有交代原因：');
  for (const f of failures) console.error(`  ${f}`);
  console.error('  修复：加失败标记（_ioFailedPaths.add / markDocFailed 等），或写一行注释说明');
  console.error('        为什么「返回空」在此处是安全的（例如「已存在则忽略」）。');
  process.exit(1);
}

console.log('[failure-visible] ✅ catch 的「返回空」均已显式交代（标记或注释）。');
