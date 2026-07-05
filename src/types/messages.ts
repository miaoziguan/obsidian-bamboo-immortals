/**
 * postMessage 通信协议类型定义
 *
 * 使用方式：
 *   - 编译时：用 AnyBridgeMessage 联合类型，TypeScript 会根据 msg.type 自动收窄 payload 类型
 *   - 运行时：用 BridgeMessage 接口（透传/序列化用）
 */

// ---- 存储类消息 ----

export interface StorageReadRequest {
  type: 'storage:readDay';
  id: string;
  payload: { dateKey: string };
}

export interface StorageWriteRequest {
  type: 'storage:writeDay';
  id: string;
  payload: { dateKey: string; data: unknown };
}

export interface StorageListRequest {
  type: 'storage:listDays';
  id: string;
  payload?: never;
}

export interface StorageDeleteRequest {
  type: 'storage:deleteDay';
  id: string;
  payload: { dateKey: string };
}

export interface StorageGetSettingRequest {
  type: 'storage:getSetting';
  id: string;
  payload: { key: string };
}

export interface StoragePutSettingRequest {
  type: 'storage:putSetting';
  id: string;
  payload: { key: string; value: unknown };
}

export interface StorageGetGoalsRequest {
  type: 'storage:getGoals';
  id: string;
  payload?: never;
}

export interface StoragePutGoalsRequest {
  type: 'storage:putGoals';
  id: string;
  payload: { goals: unknown[] };
}

export interface StorageGetPurchaseHistoryRequest {
  type: 'storage:getPurchaseHistory';
  id: string;
  payload?: never;
}

export interface StoragePutPurchaseHistoryRequest {
  type: 'storage:putPurchaseHistory';
  id: string;
  payload: { data: unknown };
}

export interface StorageGetIncomeHistoryRequest {
  type: 'storage:getIncomeHistory';
  id: string;
  payload?: never;
}

export interface StoragePutIncomeHistoryRequest {
  type: 'storage:putIncomeHistory';
  id: string;
  payload: { data: unknown };
}

export interface StorageGetAllSettingsRequest {
  type: 'storage:getAllSettings';
  id: string;
  payload?: never;
}

export interface StorageGetDaysPaginatedRequest {
  type: 'storage:getDaysPaginated';
  id: string;
  payload: { page: number; pageSize?: number };
}

export interface StorageGetDayKeysRequest {
  type: 'storage:getDayKeys';
  id: string;
  payload?: never;
}

export interface StorageExportRequest {
  type: 'storage:exportAll';
  id: string;
  payload?: never;
}

export interface StorageImportRequest {
  type: 'storage:importAll';
  id: string;
  payload: { data: unknown; options?: { strategy?: 'overwrite' | 'merge' } };
}

export interface StorageClearRequest {
  type: 'storage:clearAll';
  id: string;
  payload?: never;
}

// ---- 应用类消息 ----

export interface AppReadyMessage {
  type: 'app:ready';
  id: string;
}

export interface AppCloseMessage {
  type: 'app:close';
  id: string;
}

export interface AppSaveSectionConfigMessage {
  type: 'app:saveSectionConfig';
  id: string;
  payload: unknown; // sectionConfig 结构由 webapp 定义
}

export interface AppSaveCustomNoisesMessage {
  type: 'app:saveCustomNoises';
  id: string;
  payload: unknown[]; // noiseItems
}

export interface AppToggleThemeMessage {
  type: 'app:toggleTheme';
  id: string;
  payload: { isDark: boolean };
}

export interface AppListVaultAudioFilesMessage {
  type: 'app:listVaultAudioFiles';
  id: string;
  payload?: never;
}

export interface AppReadVaultFileMessage {
  type: 'app:readVaultFile';
  id: string;
  payload: { path: string };
}

export interface AppReadLocalFileMessage {
  type: 'app:readLocalFile';
  id: string;
  payload: { path: string };
}

// ---- 主题类消息 ----

export interface ThemeChangedMessage {
  type: 'theme:changed';
  payload: { isDark: boolean };
}

/** webapp 调色 → Obsidian 原生界面同步 */
export interface ThemeSyncPaletteMessage {
  type: 'theme:syncPalette';
  id: string;
  payload: { hue: number; lightnessOffset: number; isDark: boolean };
}

/** 所有入站消息联合类型（iframe → 插件，编译时类型收窄用） */
export type AnyBridgeMessage =
  | StorageReadRequest
  | StorageWriteRequest
  | StorageListRequest
  | StorageDeleteRequest
  | StorageGetSettingRequest
  | StoragePutSettingRequest
  | StorageGetGoalsRequest
  | StoragePutGoalsRequest
  | StorageGetPurchaseHistoryRequest
  | StoragePutPurchaseHistoryRequest
  | StorageGetIncomeHistoryRequest
  | StoragePutIncomeHistoryRequest
  | StorageGetAllSettingsRequest
  | StorageGetDaysPaginatedRequest
  | StorageGetDayKeysRequest
  | StorageExportRequest
  | StorageImportRequest
  | StorageClearRequest
  | AppReadyMessage
  | AppCloseMessage
  | AppSaveSectionConfigMessage
  | AppSaveCustomNoisesMessage
  | AppToggleThemeMessage
  | AppListVaultAudioFilesMessage
  | AppReadVaultFileMessage
  | AppReadLocalFileMessage
  | ThemeSyncPaletteMessage;

/**
 * 运行时消息透传接口（序列化用，payload 为 unknown）
 * 实际处理时优先用 AnyBridgeMessage 做类型收窄。
 */
export interface BridgeMessage {
  type: string;
  id: string;
  payload?: unknown;
  error?: string;
}
