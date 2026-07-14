/**
 * protocol.js — webapp 侧协议单一事实源（阶段3 · 契约化 第一批）
 *
 * - APP_MESSAGE_TYPES：所有已知 postMessage type 的集中清单（替代散落的字符串字面量）；
 * - parseAppMessage(event, expectedSource)：统一「来源校验 + type 合法性」，
 *   替代散落在 bridge.js 三处、AppAPI 等各处的裸 event.source 比较；
 * - PROTOCOL_VERSION：协议版本号，供后续 host↔webapp 版本协商
 *   （直击「main.js 升级但 webapp 缓存旧版」发布失配风险）。
 *
 * 注意：本模块为「加性」基础设施，不改变任何消息语义；
 * 沙箱边界（themeAudit）不受影响。host 侧 TS 将并行维护一份类型镜像。
 */

export const PROTOCOL_VERSION = 1;

// 已知消息类型（来源：docs/plans/2026-07-14-architecture-roadmap.md §1）
export const APP_MESSAGE_TYPES = [
  // webapp → host
  'app:ready',
  'app:close',
  'app:saveSectionConfig',
  'app:saveCustomNoises',
  'app:theme:sync',
  'theme:syncPalette',
  'app:listVaultAudioFiles',
  'app:readVaultFile',
  'app:readLocalFile',
  'app:proxyAudioUrl',
  // storage:*（17 个子类型，运行期统一按前缀匹配）
  'storage:readDay',
  'storage:writeDay',
  'storage:listDays',
  'storage:deleteDay',
  'storage:getSetting',
  'storage:putSetting',
  'storage:getAllSettings',
  'storage:getGoals',
  'storage:putGoals',
  'storage:getPurchaseHistory',
  'storage:putPurchaseHistory',
  'storage:getIncomeHistory',
  'storage:putIncomeHistory',
  'storage:getDayKeys',
  'storage:getDaysPaginated',
  'storage:exportAll',
  'storage:importAll',
  'storage:clearAll',
  // host → webapp
  'theme:changed',
  'theme:followDisabled',
  'theme:syncPaletteEnabled',
  'nav:prevDay',
  'nav:nextDay',
  'nav:today',
  'action:openStats',
  'action:openSettings',
];

const KNOWN = new Set(APP_MESSAGE_TYPES);

/** type 是否合法：精确命中集合，或 storage: 前缀（子类型众多，按前缀放行） */
export function isKnownType(type) {
  if (typeof type !== 'string') return false;
  if (KNOWN.has(type)) return true;
  return type.startsWith('storage:');
}

/**
 * 统一解析 / 校验一条 postMessage 事件。
 * @param {MessageEvent} event
 * @param {Window} expectedSource 期望来源（通常是 window.parent）
 * @returns {null | {
 *   type: string,
 *   id?: string,
 *   payload?: any,
 *   protocolVersion?: number,
 * }}
 *   非法（来源不符 / 无 data / type 未知）一律返回 null。
 */
export function parseAppMessage(event, expectedSource) {
  if (!event || event.source !== expectedSource) return null;
  const data = event.data;
  if (!data || typeof data.type !== 'string') return null;
  if (!isKnownType(data.type)) return null;
  return {
    type: data.type,
    id: typeof data.id === 'string' ? data.id : undefined,
    payload: data.payload,
    protocolVersion:
      typeof data.protocolVersion === 'number' ? data.protocolVersion : undefined,
  };
}

// 供入口 / 其他模块直接使用
if (typeof window !== 'undefined') {
  window.AppProtocol = {
    PROTOCOL_VERSION,
    APP_MESSAGE_TYPES,
    parseAppMessage,
    isKnownType,
  };
}
