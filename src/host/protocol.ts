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
export const INBOUND_PREFIXES = [
  'storage:',
  'app:',
  'file:',
  'theme:',
  'market:',
  // 竹林模块系统：按需下载的模块经 module:* 与宿主通信（清单/安装/卸载/加载/能力调用）
  'module:',
] as const;

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
  // 竹林模块：悬浮菜单点模块按钮 → 宿主打开该模块视图
  'app:openModule',
  // 画中卷·打字机「一键全屏」：折叠/恢复 Obsidian 左右侧栏，最大化画面
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
  // storage:*（20 个子类型）
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

  // ---- host → webapp ----
  'goals:changed',
  'theme:changed',
  // 画中卷：宿主在 iframe load / app:ready 时把「功能选型 / 停靠位 / 真实全屏态」注入 webapp
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
  // ---- 竹林模块系统（webapp → host）----
  'module:market:manifest', // 拉取模块市场清单（宿主侧 requestUrl）
  'module:install',         // 下载模块 .js 写入模块目录
  'module:uninstall',       // 删除模块 .js
  'module:list',            // 已安装模块清单（id → version）
  'module:load',            // 按 id 取回模块代码（同 theme:load 懒加载）
  'module:saveData',        // 模块自持久化数据写入（data: URL 下无 localStorage）
  'module:loadData',        // 模块自持久化数据读取
  'module:listFiles',       // 列出指定目录下的 markdown 文件
  'module:readFile',        // 读取 vault 文件正文
  'module:openFile',        // 用 Obsidian 原生视图打开文件
  'module:resolveResource', // 把 vault 内文件路径解析成 webview 可加载的资源 URL（头像/封面等）
  'module:toggleTheme',     // 模块切换 Obsidian 基础明暗（博客模块「快门」改作明暗开关用）
  // ---- 竹林模块系统（host → webapp）----
  'module:context',         // 宿主注入当前 leaf 承载的 moduleId
] as const;

export type AppMessageType = (typeof ALL_MESSAGE_TYPES)[number];

/** nav: / action: 指令类型（WebappController 使用） */
export type CommandType = Extract<AppMessageType, `nav:${string}` | `action:${string}`>;
