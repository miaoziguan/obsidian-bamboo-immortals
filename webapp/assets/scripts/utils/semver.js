/**
 * semver.js — 语义化版本比较（素材 minAppVersion 门控用）
 *
 * 为什么单独成模块：
 *   版本号比较是经典易错点（'1.10.0' 与 '1.9.9' 按字符串比会得出错误结论：
 *   '1.1' < '1.9' 使 '1.10.0' 被误判为更旧），而这条判定决定「素材能不能被装载」——
 *   判错要么误杀合法素材，要么放行不兼容素材导致画布崩坏。故独立成**纯函数**、
 *   零依赖、零副作用，可在 Node / jsdom 下单测钉住边界。
 *
 * 容错口径（面向真实世界的不规范版本号，如 '2026.10'、'3.28.13-beta.1'）：
 *   · 先截断 -prerelease / +build 元数据（本门控只关心主版本三元组）；
 *   · 以 . 分段，各段 parseInt，非数字段按 0（'3.x' → [3, 0]）；
 *   · 缺失段按 0 补齐（'1.2' 等价 '1.2.0'）；
 *   · 空 / 未声明 → 返回 null，由 meetsMinVersion 判定为「无从比较 → 放行」，
 *     保证旧宿主、旧素材（schema 尚无此字段）永不被误杀。
 */

/**
 * 解析版本号为数值数组。
 * @param {string} version 形如 '3.28.13' / '3.28.13-beta.1' / '2026.10'
 * @returns {number[]|null} 数值段数组；空值返回 null（表示「无从比较」）
 */
export function parseSemver(version) {
  const raw = String(version == null ? '' : version).trim();
  if (!raw) return null;
  const core = raw.split('+')[0].split('-')[0].trim();
  return core.split('.').map((p) => {
    const n = parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

/**
 * 比较两个版本号（逐段数值比较，缺失段补 0）。
 * @param {string} a
 * @param {string} b
 * @returns {number} a<b → -1；a===b → 0；a>b → 1
 */
export function compareSemver(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa && !pb) return 0;
  if (!pa) return -1;
  if (!pb) return 1;
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/**
 * 当前版本是否满足「≥ 要求版本」。
 *
 * 放行口径（任一成立即放行，绝不误杀）：
 *   · required 未声明 / 非法 → 素材没提要求；
 *   · current 未上报 / 非法  → 宿主太旧、未下发版本，无从比较，宁可放行也不锁死用户。
 * @param {string} current  当前宿主版本（如 '3.28.13'）
 * @param {string} required 素材声明的最低宿主版本（minAppVersion）
 * @returns {boolean}
 */
export function meetsMinVersion(current, required) {
  if (!parseSemver(required)) return true;
  if (!parseSemver(current)) return true;
  return compareSemver(current, required) >= 0;
}
