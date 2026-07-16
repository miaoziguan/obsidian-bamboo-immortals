/**
 * protocol.ts — host 侧协议类型镜像
 *
 * 本文件是 webapp/assets/scripts/utils/protocol.js 的 TypeScript 并行副本。
 * 两端必须保持 PROTOCOL_VERSION 与 ALL_MESSAGE_TYPES 同步。
 *
 * 职责：
 * - PROTOCOL_VERSION：协议版本号（两端一致）；
 * - ALL_MESSAGE_TYPES：webapp↔host 双向全部已知消息类型的单一事实源；
 * - INBOUND_PREFIXES：host 侧 onMessage 白名单；
 * - CommandType：导航/Action 指令联合类型（WebappController 使用）。
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
  'goals:changed',
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
