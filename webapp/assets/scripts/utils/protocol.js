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
  'theme:appDarkMode',
  // 画中卷·打字机机身明暗开关：请求宿主切换 Obsidian 基础主题（moonstone ↔ obsidian）
  'app:toggleObsidianTheme',
  'app:listVaultAudioFiles',
  'app:readVaultFile',
  'app:readLocalFile',
  'app:proxyAudioUrl',
  'app:aiImproveGoal',
  // 布局板块：侧边栏 ↔ 中央工作区迁移 + 折叠/展开右侧栏为多列腾宽
  'app:moveToCenter',
  'app:moveToSidebar',
  'app:openArchive',
  'app:openScroll',
  'app:openScrollLeftSidebar',
  'app:moveScroll',
  // 画中卷·打字机「一键全屏」：折叠/恢复 Obsidian 左右侧栏
  'app:toggleZen',
  'app:collapseRightSidebar',
  'app:expandRightSidebar',
  'app:getTheme',
  'app:openFile',
  'app:exportMindmap',
  'app:getHealthOverview',
  'app:getCultivationRealm',
  'app:getBambooCoinBalance',
  'app:getBambooCoinAvailableBalance',
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
  'storage:getCustomTemplates',
  'storage:putCustomTemplate',
  'storage:deleteCustomTemplate',
  // 画中卷·打字机（便签 / 写作档 / 思维子弹 / 便签组）：每组独立文件 + 轻量索引
  'storage:getTypewriterNotes',
  'storage:putTypewriterNotes',
  'storage:getTypewriterWritingIndex',
  'storage:putTypewriterWritingIndex',
  'storage:getTypewriterWritingDoc',
  'storage:putTypewriterWritingDoc',
  'storage:deleteTypewriterWritingDoc',
  'storage:getTypewriterMindmapDoc',
  'storage:putTypewriterMindmapDoc',
  'storage:deleteTypewriterMindmapDoc',
  'storage:getTypewriterNotesDoc',
  'storage:putTypewriterNotesDoc',
  'storage:deleteTypewriterNotesDoc',
  // file:*（画中卷文本文件协议：list / get / write / delete）
  'file:list',
  'file:get',
  'file:write',
  'file:delete',
  'file:response',
  // host → webapp
  'goals:changed',
  'theme:changed',
  // 画中卷：宿主注入「停靠位 / 功能选型 / 真实全屏态」
  'scroll:location',
  'scroll:feature',
  'scroll:zen',
  'theme:followDisabled',
  'theme:syncPaletteEnabled',
  'nav:prevDay',
  'nav:nextDay',
  'nav:today',
  'action:openStats',
  'action:openSettings',
  // ---- 主题市场（webapp → host）----
  'market:manifest',
  'market:install',
  'market:uninstall',
];

const KNOWN = new Set(APP_MESSAGE_TYPES);

/** type 是否合法：精确命中集合，或 storage:/file: 前缀（子类型众多，按前缀放行） */
export function isKnownType(type) {
  if (typeof type !== 'string') return false;
  if (KNOWN.has(type)) return true;
  return type.startsWith('storage:') || type.startsWith('file:') || type.startsWith('market:');
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
