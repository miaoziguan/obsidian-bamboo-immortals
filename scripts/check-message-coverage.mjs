#!/usr/bin/env node
/**
 * check:message-coverage —— 注册表覆盖率（协议数组是否覆盖源码真实收发的类型）
 * ==================================================================
 * 背景：check-message-contract 的闸门 1 只做「host 数组 == webapp 数组」。
 * 这是必要的，但**结构上不可能发现两边同时漏登**：两份数组都是 103 项时，
 * 镜像闸门恒绿，而代码里真实收发的类型可以不在这 103 项里。
 *
 * 实测教训：protocol.ts / protocol.js 曾各 103 项、零差异，但 app:activateLicense、
 * app:exportBackup、app:importBackup、app:getSettings、app:revealed、
 * storage:putSettings、storage:response、theme:load 这 8 个类型一份都没登记。
 * 它们当时能工作，靠的是别的机制而非契约：
 *   · webapp → host 的 6 个 —— host 侧 onMessage 只查 INBOUND_PREFIXES 前缀，放行
 *   · host → webapp 的 app:revealed —— 走了 bridge.js 里绕开 parseAppMessage 的裸 listener
 *   · host → webapp 的 storage:response —— isKnownType 的 storage: 前缀兜底
 * 也就是说：没有一个靠登记活着。而 app:* 在 webapp 侧**没有前缀兜底**，
 * 一旦某个未登记的 app:* 走标准化入口，就会被 parseAppMessage 静默丢弃。
 *
 * 本闸门补的就是这一层：源码里被当作 message type 使用的字面量，
 * 必须出现在注册表里。只取「高置信证据」，宁可漏报不误伤：
 *   发送 _send('X') / pushRaw('X')
 *   推送 postMessage({ type: 'X' })
 *   处理 case 'X':
 *   监听 data.type === 'X'
 *   路由路由表 'X': handler（仅 src/host/handlers/）
 * 动态拼出来的 type（_send(typeVar)）无法静态解析，天然漏报 —— 这是已知盲区。
 *
 * 用法：node scripts/check-message-coverage.mjs   # 有未登记类型则 exit 1
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOCOL_FILES = [
  { file: 'src/host/protocol.ts', array: 'ALL_MESSAGE_TYPES' },
  { file: 'webapp/assets/scripts/utils/protocol.js', array: 'APP_MESSAGE_TYPES' },
];
const SCAN_DIRS = ['src', 'webapp/assets/scripts'];
const SKIP_DIRS = new Set(['node_modules', 'tests', '__tests__', '__pycache__', 'dist', '.git']);
const SKIP_BASENAMES = new Set(['protocol.ts', 'protocol.js']);

/** 方括号配对取字符串数组（与 check-message-contract 同策略：数组可能以 `] as const` 结尾） */
function parseStringArray(src, name) {
  const start = src.indexOf(`${name} = [`);
  if (start < 0) throw new Error(`未找到数组 ${name}`);
  const open = src.indexOf('[', start);
  let depth = 0;
  let close = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) { close = i; break; }
    }
  }
  if (close < 0) throw new Error(`数组 ${name} 未闭合`);
  return [...src.slice(open, close).matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

const TYPE_RE = "'([a-z][A-Za-z]*:[A-Za-z:]+)'";

/** 高置信证据模式。顺序即报告里的标注。 */
const PATTERNS = [
  [new RegExp(`(?:_send|pushRaw)\\s*\\(\\s*${TYPE_RE}`, 'g'), '发送'],
  [new RegExp(`postMessage\\s*\\(\\s*\\{\\s*type\\s*:\\s*${TYPE_RE}`, 'g'), '推送'],
  [new RegExp(`\\bcase\\s+${TYPE_RE}`, 'g'), '处理'],
  [new RegExp(`type\\s*===\\s*${TYPE_RE}`, 'g'), '监听'],
];
/** 路由表只在 handlers 目录内匹配，避免普通对象的类型字段误伤 */
const ROUTE_PATTERN = new RegExp(`^\\s*${TYPE_RE}\\s*:\\s*[A-Za-z_$]`, 'gm');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, out);
    } else if (/\.(ts|js)$/.test(entry.name) && !SKIP_BASENAMES.has(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// ---------- 注册表 ----------
const registry = new Set();
for (const { file, array } of PROTOCOL_FILES) {
  for (const t of parseStringArray(fs.readFileSync(path.join(ROOT, file), 'utf8'), array)) {
    registry.add(t);
  }
}

// ---------- 源码使用点 ----------
const used = new Map(); // type -> ['相对路径:行(证据)', ...]
for (const dir of SCAN_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const rel = path.relative(ROOT, file);
    const src = fs.readFileSync(file, 'utf8');
    const patterns = rel.includes(`${path.sep}host${path.sep}handlers${path.sep}`)
      ? [...PATTERNS, [ROUTE_PATTERN, '路由']]
      : PATTERNS;
    for (const [re, kind] of patterns) {
      for (const m of src.matchAll(new RegExp(re.source, re.flags))) {
        const line = src.slice(0, m.index).split('\n').length;
        if (!used.has(m[1])) used.set(m[1], []);
        used.get(m[1]).push(`${rel}:${line}(${kind})`);
      }
    }
  }
}

// ---------- 比对 ----------
const missing = [...used.keys()].filter((t) => !registry.has(t)).sort();
const unused = [...registry].filter((t) => !used.has(t)).sort();

console.log(`[coverage] 注册表 ${registry.size} 项 / 源码证据 ${used.size} 项`);

if (unused.length) {
  // 不阻断：动态拼出的 type（如 _send(prefix + ':x')）无法静态解析，
  // 未命中不等于死登记。仅列出供人工判断。
  console.log(`[coverage] ℹ️ 注册表内未见静态使用点 ${unused.length} 项（可能由动态 type 发出）:`);
  console.log(`  ${unused.join(', ')}`);
}

if (missing.length) {
  console.error('\n[coverage] ❌ 以下 message type 在源码中真实使用，但未登记进协议注册表：');
  for (const t of missing) {
    console.error(`  · ${t} ← ${used.get(t).join(', ')}`);
  }
  console.error('\n  未登记的后果按方向不同：host → webapp 且为 app:* 会被 parseAppMessage');
  console.error('  静默丢弃（app:* 没有前缀兜底）；其余方向靠前缀放行勉强工作，但契约失真。');
  console.error('  修法：加进 src/host/protocol.ts 的 ALL_MESSAGE_TYPES 与');
  console.error('  webapp/assets/scripts/utils/protocol.js 的 APP_MESSAGE_TYPES（两份必须同时加）。');
  process.exit(1);
}

console.log('[coverage] ✅ 源码使用的 message type 全部已登记');
