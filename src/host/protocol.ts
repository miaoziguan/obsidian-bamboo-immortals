/**
 * protocol.ts — host 侧协议类型镜像（阶段3 · 契约化 后续）
 *
 * 本文件是 webapp/assets/scripts/utils/protocol.js 的 TypeScript 并行副本。
 * 两端必须保持 PROTOCOL_VERSION 与 ALL_MESSAGE_TYPES 同步。
 *
 * 职责：
 * - PROTOCOL_VERSION：协议版本号（两端一致）；
 * - ALL_MESSAGE_TYPES：webapp↔host 双向全部已知消息类型的单一事实源；
 * - AppMessage：类型化消息结构；
 * - INBOUND_PREFIXES：host 侧 onMessage 白名单（替代散落的裸数组）；
 * - isKnownType / parseAppMessage：集中校验（与 webapp 侧语义一致）。
 */

// ============================================================
//  协议版本 — 须与 webapp/assets/scripts/utils/protocol.js 同步
// ============================================================
export const PROTOCOL_VERSION = 1;

// ============================================================
//  消息前缀（host 侧 onMessage 来源前缀白名单）
// ============================================================
export const INBOUND_PREFIXES = ['storage:', 'app:', 'file:', 'theme:'] as const;

// ============================================================
//  全部已知 message type（双向）
// ============================================================
export const ALL_MESSAGE_TYPES = [
  // ---- webapp → host ----
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
  // storage:*（17 个子类型）
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

  // ---- host → webapp ----
  'theme:changed',
  'theme:followDisabled',
  'theme:syncPaletteEnabled',
  'nav:prevDay',
  'nav:nextDay',
  'nav:today',
  'action:openStats',
  'action:openSettings',
] as const;

export type AppMessageType = (typeof ALL_MESSAGE_TYPES)[number];

/** nav: / action: 指令类型（WebappController 使用） */
export type CommandType = Extract<AppMessageType, `nav:${string}` | `action:${string}`>;

// ============================================================
//  消息结构
// ============================================================
export interface AppMessage {
  type: string;
  id?: string;
  payload?: unknown;
  /** webapp 在 app:ready 中携带的协议版本号；其他消息通常不带 */
  protocolVersion?: number;
}

// ============================================================
//  校验函数（与 webapp 侧语义一致）
// ============================================================
const KNOWN_SET = new Set<string>(ALL_MESSAGE_TYPES);

/** 校验 type 是否合法：精确命中集合，或 storage: 前缀（子类型众多，按前缀放行） */
export function isKnownType(type: string): boolean {
  if (typeof type !== 'string') return false;
  if (KNOWN_SET.has(type)) return true;
  return type.startsWith('storage:');
}

/**
 * 统一解析/校验一条 postMessage 事件。
 * 与 webapp 侧 parseAppMessage 语义一致：来源不符 / 无 data / type 未知 → null。
 */
export function parseAppMessage(
  event: MessageEvent,
  expectedSource: Window | null,
): AppMessage | null {
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
