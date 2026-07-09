#!/usr/bin/env node
/**
 * 设计令牌守门员（零依赖）
 * ------------------------------------------------------------------
 * 拦截「新的」裸写硬编码，防止视觉规范回潮：
 *   R1  no-bare-radius         border-radius 出现裸 px（必须用 var(--radius-*)）
 *   R2  no-bare-font-size      font-size 出现裸 px（必须用 var(--type-*)/var(--font-size-*)）
 *   R3  no-hardcoded-white     #fff / #ffffff 等纯白十六进制（必须用 var(--white)）
 *   R4  no-hardcoded-black     #000 / #000000 等纯黑十六进制（必须用 var(--black)）
 *   R5  no-hardcoded-rgb       裸 rgba(255,255,255,...) / rgb(0,0,0,...) 通道（必须用 --white-rgb/--black-rgb）
 *
 * 设计：只校验「使用处」，令牌的「定义处」(variables.css) 整体豁免；
 *       装饰渐变色（如 #fff9e6）因含非 f/F 字符不会被误伤；
 *       var(--token, <兜底>) 整段视为令牌引用（含兜底里的 px/色），不误报。
 *
 * 用法： node scripts/lint-css-tokens.mjs
 * 退出码 1 = 发现违规（可用于 CI / pre-commit 门禁）
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STYLES_DIR = join(__dirname, '..', 'webapp', 'assets', 'styles');
// variables.css 是令牌定义源，整体豁免；其余文件均为"使用处"，必须守规。
const EXEMPT_FILES = new Set(['variables.css']);

const files = readdirSync(STYLES_DIR).filter((f) => f.endsWith('.css'));
const violations = [];

// 把完整的 var(--x) 与 var(--x, 兜底) 整段剔除（含兜底里的 px / 色值，支持嵌套括号）
function stripVars(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    if (s.startsWith('var(', i)) {
      let depth = 0;
      let j = i;
      for (; j < s.length; j++) {
        if (s[j] === '(') depth++;
        else if (s[j] === ')') { depth--; if (depth === 0) { j++; break; } }
      }
      out += ' VAR() ';
      i = j;
    } else {
      out += s[i];
      i++;
    }
  }
  return out;
}

// 取出某一属性「自身的值段」（到 ; 或 { 或 } 为止），避免同行其它属性误伤
const propValue = (line, prop) => {
  const m = line.match(new RegExp(prop + '\\s*:\\s*([^;{}]+)'));
  return m ? m[1] : null;
};

// 值段里是否还有裸 px 长度（排除 var 残留后）
const hasBarePx = (s) => /(^|[^a-z0-9.])(-?\d*\.?\d+)px/.test(s);

// 纯白(#f) / 纯黑(#0)，3 或 6 位，且其后不紧跟十六进制字符
const WHITE_HEX = /#([fF]{6}(?![0-9a-fA-F])|[fF]{3}(?![0-9a-fA-F]))/;
const BLACK_HEX = /#([0]{6}(?![0-9a-fA-F])|[0]{3}(?![0-9a-fA-F]))/;

// 裸通道三元组，且仅在 rgb()/rgba() 颜色上下文（排除 clip: rect(0,0,0,0) 之类）
const WHITE_RGB = /rgba?\(\s*255\s*,\s*255\s*,\s*255/i;
const BLACK_RGB = /rgba?\(\s*0\s*,\s*0\s*,\s*0(?![\d])/i;

for (const file of files) {
  if (EXEMPT_FILES.has(file)) continue;
  const text = readFileSync(join(STYLES_DIR, file), 'utf8');
  text.split('\n').forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('/*') || line.startsWith('*')) return;

    const stripped = stripVars(rawLine);

    // R1 border-radius —— 仅检查该属性自身的值段
    const rVal = propValue(stripped, 'border-radius');
    if (rVal !== null && hasBarePx(rVal)) {
      violations.push({ file, lineNo, rule: 'R1 no-bare-radius', text: line });
    }

    // R2 font-size —— 仅检查该属性自身的值段
    const fVal = propValue(stripped, 'font-size');
    if (fVal !== null && hasBarePx(fVal)) {
      violations.push({ file, lineNo, rule: 'R2 no-bare-font-size', text: line });
    }

    // R3 纯白
    if (WHITE_HEX.test(stripped)) {
      violations.push({ file, lineNo, rule: 'R3 no-hardcoded-white', text: line });
    }
    // R4 纯黑
    if (BLACK_HEX.test(stripped)) {
      violations.push({ file, lineNo, rule: 'R4 no-hardcoded-black', text: line });
    }
    // R5 裸通道（仅 rgb/rgba 颜色上下文）
    if (WHITE_RGB.test(stripped) || BLACK_RGB.test(stripped)) {
      violations.push({ file, lineNo, rule: 'R5 no-hardcoded-rgb', text: line });
    }
  });
}

if (violations.length === 0) {
  console.log('✅ CSS 令牌守门员：未发现裸写硬编码（圆角/字号/白黑）。规范保持统一。');
  process.exit(0);
}

console.error('❌ CSS 令牌守门员：发现以下裸写硬编码，请改用对应设计令牌：\n');
const order = { R1: 1, R2: 2, R3: 3, R4: 4, R5: 5 };
violations
  .sort((a, b) => order[a.rule[0]] - order[b.rule[0]] || a.file.localeCompare(b.file) || a.lineNo - b.lineNo)
  .forEach((v) => {
    console.error(`  [${v.rule}] ${v.file}:${v.lineNo}`);
    console.error(`      ${v.text}`);
  });
console.error(`\n共 ${violations.length} 处违规。令牌映射见 variables.css（圆角 --radius-* / 字号 --type-* / 纯色 --white --black / 通道 --white-rgb --black-rgb）。`);
process.exit(1);
