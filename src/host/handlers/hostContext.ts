/**
 * 宿主能力门面（HostContext）—— handlers/ 下各领域处理器访问宿主的唯一通道。
 *
 * 为什么需要它：
 *   AppAPI 的许多状态是 private（settings / saveSettings / licenseStore / respondError 等）。
 *   若让 handler 直接拿 AppAPI 实例（或 Pick<AppAPI, ...>），就得把这些私有成员整体放宽为
 *   public —— 那会侵蚀封装、并让「谁能改什么」失去边界。改为门面后：
 *     · 私有状态不外泄，handler 只能调用门面暴露的操作；
 *     · 「某领域依赖宿主哪些能力」在类型上显式可见（各 handler 用 Pick<HostContext, ...> 声明）；
 *     · 视图层注入的回调（moveToCenter 等）经 getter 延迟读取，构造后注入也能拿到最新值。
 *
 * 约束：门面只做「转发」，不含业务逻辑；业务留在各 handler 模块里。
 */
import type { NoiseItem } from '../../settings/PluginSettings';
import type { StrategyOverview } from '../../ai/strategyOverview';
import type { CultivationRealm } from '../../cultivation';

export interface HostContext {
    // ---- 传输 ----
    respond(id: string, payload: unknown): void;
    respondError(id: string, error: string): void;

    // ---- 许可证（备份码导出 / 导入 / 激活）----
    isLicenseActive(): boolean;
    getSavedLicenseKey(): string | null;
    activateLicense(code: string): Promise<void>;
    notifyLicenseActivated(): void;

    // ---- 设置 ----
    /** 当前设置快照（供 app:getSettings 下发） */
    getSettingsSnapshot(): unknown;
    setSectionConfig(config: Record<string, unknown> | null): Promise<void>;
    setNoiseItems(items: NoiseItem[]): Promise<void>;

    // ---- 视图 / 导航 ----
    openArchive(): void;
    openScroll(feature?: string): void;
    openScrollLeftSidebar(feature?: string): void;
    moveScroll(location?: string): void;
    openModule(moduleId: string, location?: 'left' | 'center' | 'right'): void;

    // ---- 数据源（由视图层注入，可能未注入 → handler 回「未配置数据源」）----
    strategyOverview?: () => Promise<StrategyOverview | null>;
    cultivationRealm?: () => Promise<CultivationRealm | null>;
    bambooCoinBalance?: () => Promise<number | null>;
    bambooCoinAvailableBalance?: () => Promise<number | null>;

    // ---- AI ----
    improveGoal(req: { goalId: string; title?: string; hints?: string }): void;

    // ---- 音频 / 本地文件读取（委托宿主私有实现，含路径安全与 CORS 代理）----
    readVaultFile(id: string, payload: unknown): Promise<void>;
    readLocalFile(id: string, payload: unknown): Promise<void>;
    proxyAudioUrl(id: string, payload: unknown): Promise<void>;
    /** 扫描 vault 内音频文件，返回文件清单（handler 负责包装成 { files } 回执） */
    scanVaultAudioFiles(): Promise<unknown>;

    // ---- 明暗主题 ----
    /** 当前 Obsidian 外观是否为暗色（body 是否带 theme-dark） */
    isObsidianDark(): boolean;
    /** 切换 Obsidian 基础明暗主题；不支持时返回 { ok:false, error } */
    switchObsidianTheme(targetIsDark: boolean): { ok: boolean; isDark?: boolean; error?: string };
    /** 重新开启主题跟随（webapp → Obsidian） */
    syncThemeFollow(): void;

    // ---- 外部主题 / 调色 ----
    /** 取已装载外部主题代码（未找到返回 undefined） */
    getThemeCode(name: string): string | undefined;
    /** 阅读视图（宿主自有 BambooReaderView）调色：始终跟随滑块 */
    applyReaderPalette(hue: number, lightnessOffset: number, saturation: number): void;
    /** 调色是否写回 Obsidian 原生界面（settings.syncPaletteToObsidian） */
    shouldSyncPaletteToObsidian(): boolean;
    /** 把调色写到 Obsidian 原生界面 */
    applyPaletteToObsidian(hue: number, lightnessOffset: number, isDark: boolean, saturation: number): void;
    /** 广播主题（含可选调色）给所有已打开视图 */
    broadcastTheme(isDark: boolean, palette?: { hue: number; lightnessOffset: number; saturation: number }): void;

    // ---- 画中卷文本文件协议（list/get/write/delete，含路径遍历防护）----
    handleFileOp(id: string, type: string, payload: unknown): Promise<void>;

    // ---- 模块（市场 / 元数据 / 自持久化数据）----
    /** 模块目录（默认配置区 modules，或用户自定义） */
    moduleDir(): string;
    /** 模块路径安全校验（拦路径遍历 + 配置目录红线） */
    safeModulePath(raw: string, label?: string): string;
    /** 重扫模块（安装/卸载/列清单前） */
    rescanModules(): Promise<void>;
    /** 模块安装版本记录表 */
    getModuleInstalled(): Record<string, { version?: string }>;
    /** 写入单条安装记录并落盘 */
    setModuleInstalled(id: string, record: { version: string; installedAt: number }): Promise<void>;
    /** 卸载：同时清除安装记录与模块自持久化数据（一次落盘） */
    clearModuleRecords(id: string): Promise<void>;
    /** 已装载模块 id 列表 */
    getModuleIds(): string[];
    /** 按 id 取模块代码 */
    getModuleCode(id: string): string | undefined;
    /** 按 id 取模块元数据（含 fab 声明） */
    getModuleMeta(id: string): { id?: string; name?: string; version?: string; fab?: unknown; location?: string } | undefined;
    /** 模块自持久化数据 */
    getModuleData(id: string): unknown;
    setModuleData(id: string, data: unknown): Promise<void>;

    // ---- 通用 vault 文件原语（供模块文件能力使用）----
    normalizeVaultPath(p: string): string;
    vaultFileExists(p: string): Promise<boolean>;
    listVaultDir(p: string): Promise<{ files: string[]; folders: string[] }>;
    statVaultFile(p: string): Promise<{ mtime: number; ctime: number; size: number } | null>;
    /** 读取 vault 文本（失败抛错） */
    readVaultText(p: string): Promise<string>;
    /** 解析 vault 文件（含 wikilink/basename 回退） */
    resolveModuleFile(p: string): { path: string } | null;
    /** 在中央新页签打开 vault 文件 */
    openVaultFileInTab(p: string): Promise<void>;
    /** wikilink / 仅笔记名 → 目标文件 */
    resolveWikiLink(base: string, sourcePath: string): { path: string } | null;
    /** vault 文件 → webview 可加载的资源 URL（走 safeModulePath 校验；不存在返回 null；校验失败抛错） */
    resolveResourceUrl(rawPath: string): string | null;
    /** 渲染 markdown 为 HTML 字符串（宿主用 MarkdownRenderer + 一次性 Component） */
    renderMarkdownToHtml(markdown: string, sourcePath: string): Promise<string>;
    /** 打开中央阅读视图 */
    openReader(p: string): void;

    // ---- 扩展市场（主题 / 素材）：只暴露原语，安装/卸载的决策逻辑留在 handler ----
    /** 拉取市场清单（host 侧 requestUrl；webview 禁 fetch）。which 区分主题/素材源 */
    fetchMarketJson(which: 'theme' | 'material' | 'module', refresh: boolean): Promise<unknown>;
    /** 拉取市场文本（.js 源码） */
    fetchMarketText(url: string): Promise<string>;
    /** 是否要求强制刷新（绕过清单缓存） */
    wantRefresh(payload: unknown): boolean;
    /** 已安装版本表（主题/素材） */
    getInstalledMap(kind: 'theme' | 'material'): Record<string, unknown>;
    /** 写入/清除单条安装记录（record=null 表示清除）并落盘 */
    setInstalled(kind: 'theme' | 'material', id: string, record: { version: string; installedAt: number } | null): Promise<void>;
    /** 已装载外部主题名列表 */
    getCustomThemeNames(): string[];
    /** 回填遗留素材安装记录（磁盘有 .js 但无记录） */
    backfillMaterialRecords(): Promise<void>;
    /** 素材 id 安全校验（拼入路径前必须过） */
    safeAssetId(id: string, label: string): string;
    /** 主题目录（settings.themePath 或默认） */
    getThemeDir(): string;
    /** 素材目录 */
    getMaterialDir(): string;
    /** 删除 vault 文件（不存在时静默跳过），返回是否真的删了 */
    removeVaultFileIfExists(path: string): Promise<boolean>;
    /** 读取 vault 文本（不存在返回 null） */
    readVaultTextIfExists(path: string): Promise<string | null>;
    /** 重扫主题（安装/卸载后） */
    rescanThemes(): Promise<void>;
    /** 广播主题清单给所有已打开视图 */
    broadcastThemeManifests(): void;

    // ---- Vault 文件（失败时抛错，由 handler 统一转成 respondError，保留原文案）----
    /** 在原生编辑器打开指定 vault 文件；文件不存在时抛 '文件不存在：<path>' */
    openVaultFileByPath(path: string): Promise<void>;
    /** 写入 vault 文本（自动逐级建目录），返回归一化后的完整路径 */
    writeVaultText(path: string, content: string): Promise<string>;

    // ---- 布局 / 视图移动（由视图层注入，可能未注入）----
    moveToCenter?: (mode?: string) => void | Promise<void>;
    moveToSidebar?: () => void;
    toggleZen?: () => boolean;
    collapseRightSidebar?: () => boolean;
    expandRightSidebar?: () => void;
}

/**
 * handler 统一签名：ctx 为宿主门面。
 *
 * 各模块用 Pick<HostContext, ...> 收窄到自己需要的部分，故这里**不能**约束为
 * `C extends HostContext`（子集不满足该约束）；不设约束也不会丢失类型安全：
 * 路由表按 RouteHandler<HostContext> 合并时，HostContext 可赋值给任意子集，
 * 反之则不行 —— 方向正是我们要的（handler 只能少要、不能多要）。
 */
export type RouteHandler<C = HostContext> = (
    ctx: C,
    id: string,
    payload: Record<string, unknown>,
) => Promise<void>;
