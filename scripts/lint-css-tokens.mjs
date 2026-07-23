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
 *   R6  no-hardcoded-shadow      box-shadow / drop-shadow() 里的裸白/黑/通道色（必须用 --white/--black/--white-rgb 等）
 *                              —— 注意：box-shadow 的裸 px 偏移/模糊不拦截（阴影无对应 --radius-* 令牌，强拦 ROI 低）
 *   R7  no-bare-white-kw      color/background 等属性出现裸 white 关键字（必须用 var(--white)）
 *   R8  no-bare-black-kw      color/background 等属性出现裸 black 关键字（必须用 var(--black)）
 *
 * 设计：只校验「使用处」，令牌的「定义处」(variables.css) 整体豁免；
 *       装饰渐变色（如 #fff9e6）因含非 f/F 字符不会被误伤；
 *       var(--token, <兜底>) 整段视为令牌引用（含兜底里的 px/色），不误报。
 *       行内注释 lint-disable:R7 可豁免单行特定规则。
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

// 解析行内豁免注释 /* lint-disable: R7 */ 或 /* lint-disable: R7,R8 */
function parseDisabledRules(rawLine) {
  const m = rawLine.match(/\/\*\s*lint-disable:\s*([^\*]+?)\s*\*\//);
  if (!m) return new Set();
  return new Set(m[1].split(',').map(r => r.trim().split(/[\s—\-]/)[0].toUpperCase()).filter(Boolean));
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

// R7/R8: 裸 white/black CSS 关键字（在属性值位置，排除 var() 后）
// 匹配模式：属性值以 "white" 或 "black" 关键词结尾（分号前）
const WHITE_KW_RE = /(?:color|background|background-color|border-color|outline-color)\s*:\s*white\b(?!\s*-)/i;
const BLACK_KW_RE = /(?:color|background|background-color|border-color|outline-color)\s*:\s*black\b(?!\s*-)/i;

// 需要检查裸色关键字的 CSS 属性列表（扩展版）
const COLOR_PROPS_RE = /(?:color|background|background-color|border-color|outline-color|fill|stroke)\s*:\s*(white|black)\b(?!\s*-)/i;

const RULE_ORDER = { R1: 1, R2: 2, R3: 3, R4: 4, R5: 5, R6: 6, R7: 7, R8: 8 };

for (const file of files) {
  if (EXEMPT_FILES.has(file)) continue;
  const text = readFileSync(join(STYLES_DIR, file), 'utf8');
  text.split('\n').forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('/*') || line.startsWith('*')) return;

    const disabled = parseDisabledRules(rawLine);
    const isRuleDisabled = (rule) => disabled.has(rule);

    const stripped = stripVars(rawLine);

    // R1 border-radius —— 仅检查该属性自身的值段
    const rVal = propValue(stripped, 'border-radius');
    if (rVal !== null && hasBarePx(rVal) && !isRuleDisabled('R1')) {
      violations.push({ file, lineNo, rule: 'R1 no-bare-radius', text: line });
    }

    // R2 font-size —— 仅检查该属性自身的值段
    const fVal = propValue(stripped, 'font-size');
    if (fVal !== null && hasBarePx(fVal) && !isRuleDisabled('R2')) {
      violations.push({ file, lineNo, rule: 'R2 no-bare-font-size', text: line });
    }

    // R3 纯白 hex
    if (WHITE_HEX.test(stripped) && !isRuleDisabled('R3')) {
      violations.push({ file, lineNo, rule: 'R3 no-hardcoded-white', text: line });
    }
    // R4 纯黑 hex
    if (BLACK_HEX.test(stripped) && !isRuleDisabled('R4')) {
      violations.push({ file, lineNo, rule: 'R4 no-hardcoded-black', text: line });
    }
    // R5 裸通道（仅 rgb/rgba 颜色上下文）
    if ((WHITE_RGB.test(stripped) || BLACK_RGB.test(stripped)) && !isRuleDisabled('R5')) {
      violations.push({ file, lineNo, rule: 'R5 no-hardcoded-rgb', text: line });
    }

    // R6 box-shadow / drop-shadow() 里的裸白/黑/通道色
    if (/box-shadow|drop-shadow\(/.test(stripped) && !isRuleDisabled('R6')) {
      if (WHITE_HEX.test(stripped) || BLACK_HEX.test(stripped) ||
          WHITE_RGB.test(stripped) || BLACK_RGB.test(stripped)) {
        violations.push({ file, lineNo, rule: 'R6 no-hardcoded-shadow', text: line });
      }
    }

    // R7 裸 white 关键字（color/background 等属性）
    const colorKw = stripped.match(COLOR_PROPS_RE);
    if (colorKw && !isRuleDisabled('R7') && !isRuleDisabled('R8')) {
      const kw = colorKw[1].toLowerCase();
      const rule = kw === 'white' ? 'R7 no-bare-white-kw' : 'R8 no-bare-black-kw';
      violations.push({ file, lineNo, rule, text: line });
    }
  });
}

if (violations.length === 0) {
  console.log('✅ CSS 令牌守门员：未发现裸写硬编码（圆角/字号/白黑/阴影色/关键字）。规范保持统一。');
  process.exit(0);
}

console.error('❌ CSS 令牌守门员：发现以下裸写硬编码，请改用对应设计令牌：\n');
violations
  .sort((a, b) => (RULE_ORDER[a.rule.slice(0,2)] || 99) - (RULE_ORDER[b.rule.slice(0,2)] || 99) || a.file.localeCompare(b.file) || a.lineNo - b.lineNo)
  .forEach((v) => {
    console.error('  [' + v.rule + '] ' + v.file + ':' + v.lineNo);
    console.error('      ' + v.text);
  });
console.error('\n共 ' + violations.length + ' 处违规。令牌映射见 variables.css（圆角 --radius-* / 字号 --type-* / 纯色 --white --black / 通道 --white-rgb --black-rgb）。阴影的裸 px 偏移/模糊不在拦截范围。');
console.error('提示：若某行为设计意图（如 tooltip 白色文字），在行尾添加 /* lint-disable: R7 */ 豁免。');
process.exit(1);
