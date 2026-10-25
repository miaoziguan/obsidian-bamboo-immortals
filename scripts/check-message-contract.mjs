#!/usr/bin/env node
/**
 * 消息契约一致性检查（零依赖，CI 闸门）
 * ==================================================================
 * 背景（P2-8）：webapp 有 5 个入口（app / scroll / archive / module / index），但它们共享
 * 同一份 assets/scripts 源码；真正容易「各入口不一致」的不是文件，而是**跨边界消息契约**。
 * 复盘期间已实证两类假象：
 *   · 只扫 assets/scripts 会漏掉 html 内联脚本里的发送（得出"死消息"的假阳性）；
 *   · 静态扫描无法解析动态类型（_send(typeVar)），所以「必须完全匹配」的检查必然误报。
 *
 * 因此本闸门只做**确定性、零误报**的三件事：
 *
 *  闸门 1 · 协议注册表镜像同步
 *     src/host/protocol.ts 的 ALL_MESSAGE_TYPES / PROTOCOL_VERSION
 *     与 webapp/assets/scripts/utils/protocol.js 的 APP_MESSAGE_TYPES / PROTOCOL_VERSION
 *     必须完全一致。注释里写着「两端必须保持同步」，但此前没有任何机制强制 —— 单边新增
 *     消息类型会让另一端 parseAppMessage 直接丢弃，表现为「发了但没反应」。
 *
 *  闸门 2 · 路由键唯一
 *     src/host/handlers/*.ts 之间不得出现重复 type。AppAPI 的 ROUTES 用对象展开合并，
 *     同名键后者静默覆盖前者 —— 结果是一条消息被路由到错误的处理器，不报错。
 *
 *  闸门 3 · 入站前缀合规
 *     handleMessage / handlers 路由 / handleStorageMessage 里的每个 type，
 *     必须以 INBOUND_PREFIXES 中某一项开头。否则 onMessage 的前缀白名单会在分发前
 *     直接丢弃 —— 注册了却永不触发，且无任何日志。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

/**
 * 取数组字面量（`const NAME = [ ... ]`）内的全部字符串字面量。
 *
 * 注意：不能用 indexOf('];') 找结束 —— 本仓库的数组可能以 `] as const;` 结尾，
 * 那样会吞掉后面整个数组（曾导致 INBOUND_PREFIXES 误解析成 ALL_MESSAGE_TYPES）。
 * 这里按方括号配对定位结束位置。
 */
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
  const body = src.slice(open, close);
  return [...body.matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function parseVersion(src) {
  const m = /PROTOCOL_VERSION\s*=\s*(\d+)/.exec(src);
  if (!m) throw new Error('未找到 PROTOCOL_VERSION');
  return Number(m[1]);
}

/** 花括号配对取方法体 */
function methodBody(src, signature) {
  const s = src.indexOf(signature);
  if (s < 0) return '';
  const b = src.indexOf('{', s);
  let depth = 0;
  for (let i = b; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(b, i + 1);
    }
  }
  return '';
}

const problems = [];
const notes = [];

// ---------- 闸门 1：协议注册表镜像 ----------
const hostProto = read('src/host/protocol.ts');
const webProto = read('webapp/assets/scripts/utils/protocol.js');
const hostTypes = parseStringArray(hostProto, 'ALL_MESSAGE_TYPES');
const webTypes = parseStringArray(webProto, 'APP_MESSAGE_TYPES');
const hostVer = parseVersion(hostProto);
const webVer = parseVersion(webProto);

if (hostVer !== webVer) {
  problems.push(`PROTOCOL_VERSION 不一致：host=${hostVer} / webapp=${webVer}`);
}
{
  const h = new Set(hostTypes);
  const w = new Set(webTypes);
  const onlyHost = [...h].filter((t) => !w.has(t));
  const onlyWeb = [...w].filter((t) => !h.has(t));
  if (onlyHost.length) problems.push(`消息类型仅存在于 host（webapp 会丢弃）: ${onlyHost.join(', ')}`);
  if (onlyWeb.length) problems.push(`消息类型仅存在于 webapp（host 不认识）: ${onlyWeb.join(', ')}`);
  if (hostTypes.length !== h.size) problems.push('host ALL_MESSAGE_TYPES 存在重复项');
  if (webTypes.length !== w.size) problems.push('webapp APP_MESSAGE_TYPES 存在重复项');
  notes.push(`协议注册表：host ${h.size} 项 / webapp ${w.size} 项 / 版本 ${hostVer}`);
}

// ---------- 闸门 2：路由键唯一 ----------
const handlersDir = path.join(ROOT, 'src/host/handlers');
const routeKeys = new Map();   // type -> [files]
if (fs.existsSync(handlersDir)) {
  for (const name of fs.readdirSync(handlersDir)) {
    if (!name.endsWith('.ts')) continue;
    const src = fs.readFileSync(path.join(handlersDir, name), 'utf8');
    for (const m of src.matchAll(/^\s*'([a-zA-Z:_-]+)'\s*:\s*\w+/gm)) {
      const t = m[1];
      if (!routeKeys.has(t)) routeKeys.set(t, []);
      routeKeys.get(t).push(name);
    }
  }
}
for (const [t, files] of routeKeys.entries()) {
  if (files.length > 1) problems.push(`路由键重复（后者会静默覆盖前者）：${t} ← ${files.join(' + ')}`);
}
notes.push(`路由键：${routeKeys.size} 条`);

// ---------- 闸门 3：入站前缀合规 ----------
const prefixes = parseStringArray(hostProto, 'INBOUND_PREFIXES');
const appApi = read('src/host/AppAPI.ts');
const handled = new Set([
  ...[...methodBody(appApi, 'private async handleMessage(').matchAll(/if \(type === '([a-zA-Z:_-]+)'\)/g)].map((m) => m[1]),
  ...[...methodBody(appApi, 'private async handleStorageMessage(').matchAll(/case '([a-zA-Z:_-]+)'/g)].map((m) => m[1]),
  ...routeKeys.keys(),
]);
const badPrefix = [...handled].filter((t) => !prefixes.some((p) => t.startsWith(p)));
if (badPrefix.length) {
  problems.push(`以下消息类型的入站前缀不在白名单内（onMessage 会在分发前丢弃）：${badPrefix.join(', ')}`);
}
notes.push(`宿主处理类型：${handled.size} 条；入站前缀：${prefixes.join(' ')}`);

// ---------- 输出 ----------
for (const n of notes) console.log(`[contract] ${n}`);
if (problems.length) {
  console.error('\n[contract] ❌ 消息契约检查未通过：');
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}
console.log('[contract] ✅ 三道闸门全部通过（协议镜像同步 / 路由键唯一 / 入站前缀合规）');
