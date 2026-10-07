import { App, TFile, DataAdapter, normalizePath, requestUrl, Platform, MarkdownRenderer, Component } from 'obsidian';
import { arrayBufferToBase64 } from '../utils/base64';
import { VaultStorage } from '../storage/VaultStorage';
import { ThemeBridge } from '../bridge/ThemeBridge';
import type { BambooReviewSettings, NoiseItem } from '../settings/PluginSettings';
import { ALLOWED_AUDIO_EXTENSIONS, MIME_TYPES } from '../constants/audio';
import type { DayData, CustomTemplate } from '../types/data';
import type { StrategyOverview } from '../ai/strategyOverview';
import type { CultivationRealm } from '../cultivation';
import { INBOUND_PREFIXES } from './protocol';
import { LicenseStore } from '../license/licenseStore';
import { verifyLicenseKey } from '../license/licenseKey';
import { marketUrlCandidates, isGithubApiUrl, GITHUB_RAW_ACCEPT } from './marketSources';
import { encodeBackup, decodeBackup } from '../license/backupCode';

/** Obsidian 插件运行时注入的主窗口 document（非插件沙箱内的 document） */
declare const activeDocument: Document;

/** 扫描音频时默认跳过的目录名 */
const SKIP_DIRS = ['.trash', '.git', 'node_modules'];

/** 读取音频文件入内存前的体积上限（base64 再膨胀 ~33%，避免大文件 OOM） */
const MAX_AUDIO_FILE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * 校验音源代理 URL：仅允许 http/https 协议，限制长度，
 * 防止 `app:proxyAudioUrl` 成为运行在用户机器上的开放 fetch 代理。
 */
export function isValidAudioUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.length > 2048) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

// ArrayBuffer → base64 见 ../utils/base64（跨平台，不依赖 Node Buffer）

/**
 * AppAPI — 统一通信接口
 *
 * 替代旧的 BridgeService + StorageBridge + ThemeBridge 三层架构，
 * 将 postMessage 路由、存储操作、主题同步合并为单一 API。
 */
const MARKET_MANIFEST_URL = 'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/manifest.json';
/**
 * 竹林模块市场清单（与主题市场平级的独立仓库）。
 *
 * 模块是「用户按需下载」的可选能力（首个模块 = 本地博客阅读器），不入主 bundle，
 * 故清单与代码都必须联网获取；webview 侧禁止 fetch（沙箱），下载一律由宿主 requestUrl 代劳。
 */
const MODULE_MARKET_MANIFEST_URL = 'https://raw.githubusercontent.com/miaoziguan/bamboo-module-market/main/manifest.json';

/**
 * 模块元数据。
 *
 * 模块文件顶部约定带一行标记注释：
 *   /* __bamboo_module_ {"id":"blog","name":"本地博客","version":"1.0.0","fab":{...}} *\/
 * 宿主扫描时只做纯文本解析（不 new Function 执行），因此主应用拿到按钮配置
 * 无需承担「执行全部模块代码」的代价——真正执行只发生在用户打开该模块视图时。
 */
export interface ModuleMeta {
  id: string;
  name: string;
  version: string;
  /** 模块声明的悬浮菜单按钮（图标用 lucide 名，与主题/FAB 现有图标体系一致） */
  fab?: { icon?: string; label?: string };
  /** 默认停靠位，未声明按 left（左侧栏） */
  location?: 'left' | 'center' | 'right';
}

export class AppAPI {
  private storage: VaultStorage;
  private themeBridge: ThemeBridge;
  private settings: BambooReviewSettings;
  private saveSettings: () => Promise<void>;
  private iframe: HTMLIFrameElement | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  /**
   * 「战略复盘面板 → AI 改进」入口回调（由 DailyReviewView 注入，转发到插件 requestAiImprove）。
   * webapp 健康分详情点「用 AI 改进」时触发，参数为目标标识 + 本地 hints。
   */
  onAiImproveGoal?: (payload: { goalId: string; title?: string; hints?: string }) => void;

  /**
   * 「目标归档」入口回调（由 DailyReviewView 注入，转发到插件 openArchive）。
   * webapp 目标地图中点击「查看归档」时触发，打开归档独立页。
   */
  onOpenArchive?: () => void;

  /**
   * 「画中卷」入口回调（由 DailyReviewView 注入，转发到插件 openScroll）。
   * webapp FAB 点「画中卷」时触发，打开画中卷独立中央视图（不影响日报）。
   * feature 为功能选择器暂存选型（如 'typewriter'），经 blob URL hash 注入画中卷。
   */
  onOpenScroll?: (feature?: string) => void;

  /**
   * 「画中卷」入口回调（由 DailyReviewView 注入，转发到插件 openScrollLeftSidebar）。
   * 点击画中卷默认以左侧边栏（类似大纲面板）形态打开。
   * feature 为功能选择器暂存选型（如 'typewriter'），经 blob URL hash 注入画中卷。
   */
  onOpenScrollLeftSidebar?: (feature?: string) => void;

  /**
   * 「画中卷」位置切换回调（由 DailyReviewView 注入，转发到插件 openScrollAt）。
   * webapp 画布内 3-dot 控件点击时触发，把画中卷移到指定栏。
   */
  onMoveScroll?: (location?: string) => void;

  /**
   * 「竹林模块」入口回调（由 DailyReviewView 注入，转发到插件 openModuleLeftSidebar）。
   * webapp 悬浮菜单点模块按钮时触发，把该模块视图以左侧边栏形态打开。
   *
   * 模块代码不在主 bundle 内（按需下载），故这里只传模块 id，由宿主视图
   * 经 module:load 取回代码后执行——主应用不需要为拿按钮而执行任何模块代码。
   */
  onOpenModule?: (moduleId: string, location?: string) => void;

  /** 「博客模块」入口回调：在宿主自建的竹杖芒鞋式阅读视图打开文章（中央视图） */
  onOpenReader?: (path: string) => void;

  /**
   * 「画中卷」上下文索取回调（由 ScrollView 注入）。
   *
   * 画中卷的功能选型/停靠位/全屏态原本只在 iframe `load` 事件里注入一次，而 webapp 侧
   * 是一次性 promise（2s 超时后回落香道）。若 webapp 因故晚于 `load` 才注册监听
   * （典型场景：scroll.html 体积超过 bundle 阈值被 gzip 包装，模块脚本在 `load` 之后
   * 才解压执行），这次注入就被彻底漏掉 —— 表现为「打字机变香道」且 2s 白屏。
   * 故 webapp 握手（`app:ready`）时由宿主补发一次上下文，把一次性注入升级为「可重放」。
   */
  onScrollContextRequest?: () => { feature?: string; location?: string; zen?: boolean } | null;

  /**
   * 「模块视图」上下文索取回调（由 ModuleView 注入）。
   *
   * 模块视图是通用宿主：同一个 VIEW_TYPE_MODULE 可承载任意模块，具体承载哪个由
   * leaf 视图状态里的 moduleId 决定。该 id 原本只在 iframe `load` 时注入一次，
   * 与画中卷同源问题——module.html 若被 gzip 包装、脚本在 load 之后才解压执行，
   * 这次注入就会被漏掉，表现为模块视图空白。故 webapp 握手（app:ready）时由宿主
   * 补发一次，把一次性注入升级为「可重放」。
   */
  onModuleContextRequest?: () => { moduleId?: string } | null;

  /**
   * 健康分权威快照数据源（由 DailyReviewView 注入，转发到插件的 getStrategyOverview()）。
   * webapp 通过 app:getHealthOverview 向插件请求单一数据源的健康分套件，
   * 避免插件与前端各算一遍导致的分数漂移。
   */
  private strategyOverviewProvider?: () => Promise<StrategyOverview | null>;

  /** 注入健康分数据源（单一数据源） */
  setStrategyOverviewProvider(fn: () => Promise<StrategyOverview | null>): void {
    this.strategyOverviewProvider = fn;
  }

  /** 当前修行境界数据源（由 DailyReviewView 注入，转发到插件 getCultivationRealm()） */
  private cultivationRealmProvider?: () => Promise<CultivationRealm | null>;
  /** 当前竹币余额数据源（转发到插件 getBambooCoinBalance()） */
  private bambooCoinBalanceProvider?: () => Promise<number | null>;
  /** 当前可用竹币余额数据源（转发到插件 getBambooCoinAvailableBalance()） */
  private bambooCoinAvailableBalanceProvider?: () => Promise<number | null>;

  setCultivationRealmProvider(fn: () => Promise<CultivationRealm | null>): void {
    this.cultivationRealmProvider = fn;
  }
  setBambooCoinBalanceProvider(fn: () => Promise<number | null>): void {
    this.bambooCoinBalanceProvider = fn;
  }
  setBambooCoinAvailableBalanceProvider(fn: () => Promise<number | null>): void {
    this.bambooCoinAvailableBalanceProvider = fn;
  }

  /** 外部主题清单（仅名字 + 可选 meta），经 app:ready 下发，不含代码；代码按需经 theme:load 取回 */
  private customThemeManifests: Array<{ name: string; meta?: Record<string, unknown> }> = [];
  /** 外部主题代码缓存（name → code），由 scanCustomThemes 预读，按需经 theme:load 回传，避免每次全量跨进程下发 */
  private customThemeCodeMap = new Map<string, string>();
  /** 模块代码缓存（模块 id → 代码），由 _rescanModules 填充，按需经 module:load 回传。
   *  与主题同构：清单先行、代码懒加载，避免所有模块代码一次性跨进程灌入。 */
  private moduleCodeMap = new Map<string, string>();
  /** 模块元数据缓存（模块 id → meta）。从模块文件的标记行解析，**不执行模块代码**，
   *  供主应用在不加载模块的情况下把模块声明的悬浮菜单按钮注入菜单。 */
  private moduleMetaMap = new Map<string, ModuleMeta>();
  private vaultAdapter: DataAdapter;
  private noisePath: string;
  private configDir: string;
  /** 激活状态持有（门控单一数据源） */
  private licenseStore: LicenseStore;
  /** 激活成功后回调（由 DailyReviewView 注入），用于通知宿主层刷新 UI */
  onLicenseActivated?: () => void;
  /** 当前视图是否位于主工作区（中央）回调（由 DailyReviewView 注入） */
  isMainLeaf?: () => boolean;
  /** 把当前视图移动到主工作区回调（由 DailyReviewView 注入）；mode 为当前布局模式 */
  moveToCenter?: (mode?: string) => void;
  /** 把当前视图移回右侧栏回调（由 DailyReviewView 注入；仅当视图由系统从侧栏移来才执行） */
  moveToSidebar?: () => void;
  /** 折叠 Obsidian 右侧栏回调（由 DailyReviewView 注入；进入横向/看板多列模式时调用）
   *  @returns 折叠前右侧栏是否已折叠（供 webapp 判断恢复纵向时是否需对称展开） */
  collapseRightSidebar?: () => boolean;
  /** 展开 Obsidian 右侧栏回调（由 DailyReviewView 注入；恢复纵向且此前由我们折叠时调用） */
  expandRightSidebar?: () => void;
  /**
   * 画中卷·打字机「一键全屏」：同时折叠/恢复 Obsidian 左右侧栏（由 ScrollView 注入）。
   * 进入时记录两侧原始折叠态，退出时按记录恢复——不一律展开，避免把用户刻意收起的侧栏弹回来。
   * @returns 切换后是否处于全屏态（true=已全屏，false=已恢复）
   */
  toggleZen?: () => boolean;
  /** 待恢复的布局模式回调（由 DailyReviewView 注入，重建视图后 app:ready 带回 webapp） */
  getPendingLayoutMode?: () => string | null;
  /** 视图已 detach 后置 true，扫描等异步任务据此提前终止（#L14） */
  private disposed = false;
  /** Obsidian App 引用（打开文件等宿主操作需要） */
  private app: App;

  constructor(
    app: App,
    settings: BambooReviewSettings,
    saveSettings: () => Promise<void>,
    noisePath: string,
    configDir: string,
    licenseStore: LicenseStore,
    onMoveScroll?: (location?: string) => void
  ) {
    this.settings = settings;
    this.saveSettings = saveSettings;
    this.app = app;
    this.onMoveScroll = onMoveScroll;
    // 注意：webapp 读取目标的实际路径由此处决定（VaultStorage 默认 basePath = bamboo-review）。
    // writeAiGoals 必须写入同一路径，否则 AI 目标不显示。详见 main.ts writeAiGoals 的注释。
    this.storage = new VaultStorage(app);
    this.themeBridge = new ThemeBridge();
    this.vaultAdapter = app.vault.adapter;
    this.noisePath = noisePath;
    this.configDir = configDir;
    this.licenseStore = licenseStore;
  }

  /** 确保存储结构存在 */
  async ensureStructure(): Promise<void> {
    await this.storage.ensureStructure();
  }

  /** 取出当前已激活的外部主题（含代码），随 app:ready 同步下发，避免重建后异步懒加载竞态 */
  private getActiveExternalTheme(): { name: string; code: string } | null {
    // 结构见 SectionRegistry.save()：sectionConfig.themes 以 sectionId 为键存选中主题
    const theme = (this.settings.sectionConfig as { themes?: Record<string, string> } | undefined)
      ?.themes?.themeEffect;
    if (!theme || theme === 'bamboo') return null;
    const code = this.customThemeCodeMap.get(theme);
    return code !== undefined ? { name: theme, code } : null;
  }

  /** 设置自定义主题列表：拆成清单（下发）与代码缓存（按需取）两份 */
  setCustomThemes(themes: Array<{ name: string; code: string }>): void {
    this.customThemeManifests = themes.map(t => ({ name: t.name }));
    this.customThemeCodeMap = new Map(themes.map(t => [t.name, t.code]));
  }

  /** 
   * 预注册 message 监听器。
   * 在 iframe 创建前调用，消除竞态窗口。
   * 使用 activeDocument.defaultView（主 Obsidian 窗口）而非插件沙箱 window。
   */
  startListening(): void {
    this.detach();
    this.messageHandler = (event: MessageEvent) => {
      void this.onMessage(event);
    };
    // bridge.js 的 postMessage 目标是 window.parent（主 Obsidian 窗口）。
    // Obsidian 多窗口/右侧栏 dock 下 window.parent 可能与 activeDocument.defaultView
    // 不是同一对象，故同时在两者上监听，确保 app:ready 等消息一定被收到。
    const targets = new Set<Window | null>([activeDocument.defaultView, window]);
    for (const t of targets) {
      if (t) t.addEventListener('message', this.messageHandler);
    }
    this.disposed = false; // 重新 attach 后恢复可扫描状态（detach 已置 true）
  }

  /** 
   * 绑定 iframe 引用并初始化主题桥接。
   * 在 iframe 元素创建后调用，供 respond() 获取 contentWindow。
   */
  bindIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
    this.themeBridge.attachIframe(iframe);
    // iframe 一旦绑定即主动推一次当前主题，确保画中卷/归档等独立视图首屏即跟随。
    // 带上 currentPalette（主视图已同步的手动调色），使独立视图首屏即跟随色相/明度，
    // 而非停在默认竹青绿（此前仅推 isDark，用户在显示设置调的色相/明度首屏不生效）。
    this.themeBridge.pushTheme(this.settings.followObsidianTheme, undefined, this.themeBridge.currentPalette ?? undefined);
  }

  /** 解绑并停止监听 */
  detach(): void {
    this.disposed = true;
    if (this.messageHandler) {
      const targets = new Set<Window | null>([activeDocument.defaultView, window]);
      for (const t of targets) {
        if (t) t.removeEventListener('message', this.messageHandler);
      }
      this.messageHandler = null;
    }
    this.themeBridge.detachIframe();
    this.iframe = null;
  }

  /** Obsidian 主题变化时触发（由 DailyReviewView 的 css-change 事件调用） */
  onThemeChanged(followObsidianTheme: boolean): void {
    this.settings.followObsidianTheme = followObsidianTheme;
    this.themeBridge.pushTheme(followObsidianTheme);
    // 若开「将调色同步到 Obsidian」，随 Obsidian 明暗重算行内调色变量，
    // 避免旧模式算出的颜色残留覆盖新主题（applyPalette 写的是行内样式，优先级高于主题 CSS）。
    if (this.settings.syncPaletteToObsidian) {
      this.themeBridge.reapplyOnThemeChange(
        activeDocument.body.classList.contains('theme-dark')
      );
    }
    void this.saveSettings(); // 与 saveSectionConfig/saveCustomNoises 一致，持久化主题跟随开关
  }

  /** 向 iframe 发送成功响应 */
  private respond(id: string, payload: unknown): void {
    if (!this.iframe?.contentWindow) return;
    // 必须带 type 字段：bridge.js 的 parseAppMessage 要求 typeof data.type === 'string'
    this.iframe.contentWindow.postMessage({ type: 'storage:response', id, payload }, '*');
  }

  /** 向 iframe 发送错误响应 */
  private respondError(id: string, error: string): void {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ type: 'storage:response', id, error }, '*');
  }

  /** 向 iframe 推送画中卷上下文（feature / location / zen）。
   *  由 app:ready 握手触发；ScrollView 未注入索取回调时（日报/归档视图）静默跳过。 */
  private _pushScrollContext(): void {
    if (!this.onScrollContextRequest) return;
    const cw = this.iframe?.contentWindow;
    if (!cw) return;
    const ctx = this.onScrollContextRequest();
    if (!ctx) return;
    cw.postMessage({ type: 'scroll:feature', feature: ctx.feature ?? 'incense' }, '*');
    cw.postMessage({ type: 'scroll:location', location: ctx.location ?? 'center' }, '*');
    cw.postMessage({ type: 'scroll:zen', zen: !!ctx.zen }, '*');
  }

  /** 向 iframe 推送模块视图上下文（moduleId）。
   *  由 app:ready 握手触发；ModuleView 未注入索取回调时（日报/归档/画中卷视图）静默跳过。 */
  private _pushModuleContext(): void {
    if (!this.onModuleContextRequest) return;
    const cw = this.iframe?.contentWindow;
    if (!cw) return;
    const ctx = this.onModuleContextRequest();
    if (!ctx || !ctx.moduleId) return;
    cw.postMessage({ type: 'module:context', moduleId: ctx.moduleId }, '*');
  }

  /** 消息路由 */
  private async onMessage(event: MessageEvent): Promise<void> {
    const msg = event.data as { type?: string; id?: string; payload?: unknown };
    if (!msg || !msg.type || !msg.id) return;

    // 来源校验
    // 【安全】必须是「已绑定的本视图 iframe」：startListening() 早于 iframe 创建（中间还隔着
    // await buildBlobUrl），那段窗口里 this.iframe 为 null，若写成 `this.iframe && ...`，
    // 来源校验会被整体跳过 —— 主窗口内任意第三方插件/脚本 postMessage 一条
    // storage:clearAll / file:write 即可被无条件执行。iframe 尚不存在时其内的 webapp
    // 也必然还不存在，故这段窗口内到达的任何消息都不是合法来源，一律丢弃。
    if (!this.iframe || event.source !== this.iframe.contentWindow) return;

    // 消息类型白名单（阶段3 · 契约化：从 protocol.ts 集中定义）
    const type = msg.type;
    if (!INBOUND_PREFIXES.some((p) => type.startsWith(p))) return;



    try {
      await this.handleMessage(msg.type, msg.id, msg.payload ?? {});
    } catch (e) {
      this.respondError(msg.id, e instanceof Error ? e.message : 'Unknown error');
    }
  }

  /** 消息分发处理 */
  /** 重扫主题文件夹，刷新「本地外部主题」清单与代码缓存（市场装/卸后调用） */
  /**
   * 依次尝试各源取回文本（市场清单、主题与模块代码共用）。
   *
   * 源展开逻辑见 src/host/marketSources.ts：raw.githubusercontent.com 在部分网络环境
   * （国内常见）被 DNS 污染解析到 0.0.0.0，直连即失败，故按
   * 「jsDelivr CDN → GitHub API → 原 raw 链接」依次回退，任一成功即可。
   */
  private async _fetchMarketText(rawUrl: string): Promise<string> {
    const failures: string[] = [];
    for (const url of marketUrlCandidates(rawUrl)) {
      try {
        const headers = isGithubApiUrl(url) ? { Accept: GITHUB_RAW_ACCEPT } : undefined;
        const resp = await requestUrl({ url, method: 'GET', headers });
        if (resp.status < 200 || resp.status >= 300) {
          failures.push(`${url} → HTTP ${resp.status}`);
          continue;
        }
        const text = resp.text;
        if (typeof text === 'string' && text.trim().length > 0) return text;
        failures.push(`${url} → 空响应`);
      } catch (e) {
        failures.push(`${url} → ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    throw new Error(`所有源均拉取失败（${failures.join('；')}）`);
  }

  private async _fetchMarketJson(rawUrl: string): Promise<Record<string, unknown>> {
    const text = await this._fetchMarketText(rawUrl);
    return JSON.parse(text) as Record<string, unknown>;
  }

  /** 装/卸后把最新主题清单推给已打开的视图（清单原本只在 app:ready 握手时下发一次） */
  private _broadcastThemeManifests(): void {
    this.themeBridge.broadcastRaw('theme:manifests', { customThemes: this.customThemeManifests });
  }

  private async _rescanThemes(): Promise<void> {
    // 候选目录：优先用户配置的 themePath；并兼容实际目录「竹林动效主题」
    // （复盘主题 → 动效主题 改名后的正确目录）与历史默认「竹林复盘主题」。
    // 任一目录成功扫到主题即采用，避免 themePath 被旧默认值/错值残留时整体加载失败。
    const candidates: string[] = [];
    if (this.settings.themePath) candidates.push(this.settings.themePath);
    candidates.push('竹林动效主题', '竹林复盘主题');

    for (const dir of candidates) {
      try {
        const listed = await this.vaultAdapter.list(dir);
        const files = (listed.files || []).filter((f) => f.endsWith('.js'));
        const themes: { name: string; code: string }[] = [];
        let found = false;
        for (const f of files) {
          const name = f.split('/').pop() || f;
          try {
            const code = await this.vaultAdapter.read(f);
            if (!code.includes('__bamboo_theme_')) continue;
            themes.push({ name: name.replace(/\.js$/, ''), code });
            found = true;
          } catch {
            /* 跳过读取失败的文件 */
          }
        }
        if (found) {
          this.setCustomThemes(themes);
          // 回填：磁盘存在主题但无版本记录（老版本遗留，早于 marketInstalled 字段）→ 补空版本，
          // 使「已安装」仍判得出、且「可更新」统一走 rec.version !== ver（不再依赖 !rec 兜底），
          // 避免卸载删记录后被误判为「老版本可更新」。
          if (!this.settings.marketInstalled) this.settings.marketInstalled = {};
          let dirty = false;
          for (const t of themes) {
            if (!this.settings.marketInstalled[t.name]) {
              this.settings.marketInstalled[t.name] = { version: '', installedAt: 0 };
              dirty = true;
            }
          }
          if (dirty) { await this.saveSettings(); }
          return;
        }
      } catch {
        /* 该候选目录不存在，尝试下一个 */
      }
    }
  }

  /**
   * 模块默认存放目录：收拢到 bamboo-review 管理区（<configDir>/bamboo-review/modules），
   * 不再散落 vault 根目录的 `竹林模块/`，与插件数据同域、且不受插件更新覆盖。
   * 用户可在设置用 modulePath 覆盖（自定义路径时不做旧目录迁移）。
   */
  private _defaultModulePath(): string {
    return normalizePath(`${this.configDir}/bamboo-review/modules`);
  }

  /** 是否走默认路径（未设置，或仍是旧默认 '竹林模块' 哨兵） */
  private _usingDefaultModulePath(): boolean {
    const mp = this.settings.modulePath;
    return !mp || mp === '竹林模块';
  }

  /** 解析模块目录：用户自定义优先，否则取默认管理区路径 */
  private _moduleDir(): string {
    return normalizePath(this._usingDefaultModulePath() ? this._defaultModulePath() : this.settings.modulePath);
  }

  /** 目标文件是否存在（迁移时避免覆盖已重装的新版本） */
  private async _fileExists(p: string): Promise<boolean> {
    try {
      await this.vaultAdapter.read(p);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 一次性迁移：把 vault 根目录旧的 `竹林模块/*.js` 移入默认管理区。
   * 仅在使用默认路径时执行；目标已存在的文件保留（不回退覆盖），旧目录迁移后清空。
   */
  private async _migrateLegacyModules(): Promise<void> {
    if (!this._usingDefaultModulePath()) return;
    const legacy = normalizePath('竹林模块');
    const target = this._defaultModulePath();
    if (legacy === target) return;
    try {
      const listed = await this.vaultAdapter.list(legacy);
      const files = (listed.files || []).filter((f) => f.endsWith('.js'));
      if (!files.length) return;
      const movable: string[] = [];
      for (const f of files) {
        try {
          const code = await this.vaultAdapter.read(f);
          if (code.includes('__bamboo_module_')) movable.push(f);
        } catch {
          /* 跳过读取失败 */
        }
      }
      if (!movable.length) return;
      const parent = target.split('/').slice(0, -1).join('/');
      if (parent) {
        try { await this.vaultAdapter.mkdir(parent); } catch { /* 已存在忽略 */ }
      }
      try { await this.vaultAdapter.mkdir(target); } catch { /* 已存在忽略 */ }
      for (const f of movable) {
        const name = f.split('/').pop() || f;
        const dest = `${target}/${name}`;
        if (!(await this._fileExists(dest))) {
          const code = await this.vaultAdapter.read(f);
          await this.vaultAdapter.write(dest, code);
        }
        await this.vaultAdapter.remove(f);
      }
      // 落定新路径，避免后续仍走旧哨兵判断
      this.settings.modulePath = target;
      await this.saveSettings();
      // 旧目录若已空则尝试移除（失败忽略：空目录残留无害）
      try { await this.vaultAdapter.remove(legacy); } catch { /* 忽略 */ }
    } catch {
      // 旧目录不存在等：无需迁移
    }
  }

  /** 重扫模块目录，刷新「已安装模块」代码缓存（市场装/卸后、module:list/load 前调用）。
   *  模块标记校验（__bamboo_module_）与主题（__bamboo_theme_）同构，误放进来的普通
   *  .js 会被静默忽略，不会被当作模块执行。目录不存在（尚未装任何模块）不算错误。 */
  private async _rescanModules(): Promise<void> {
    await this._migrateLegacyModules();
    const dir = this._moduleDir();
    try {
      const listed = await this.vaultAdapter.list(dir);
      const files = (listed.files || []).filter((f) => f.endsWith('.js'));
      const map = new Map<string, string>();
      const metaMap = new Map<string, ModuleMeta>();
      for (const f of files) {
        const name = (f.split('/').pop() || f).replace(/\.js$/, '');
        try {
          const code = await this.vaultAdapter.read(f);
          if (!code.includes('__bamboo_module_')) continue;
          map.set(name, code);
          metaMap.set(name, this._parseModuleMeta(code, name));
        } catch {
          /* 跳过读取失败的文件 */
        }
      }
      this.moduleCodeMap = map;
      this.moduleMetaMap = metaMap;
    } catch {
      // 目录不存在：尚未安装任何模块，清空缓存即可
      this.moduleCodeMap = new Map();
      this.moduleMetaMap = new Map();
    }
  }

  /** 从模块代码的标记行解析元数据（纯文本，不执行代码）。
   *  解析失败时退回「以文件名当 id 与显示名」的最小元数据，保证模块仍可用。 */
  private _parseModuleMeta(code: string, fallbackId: string): ModuleMeta {
    const fallback: ModuleMeta = { id: fallbackId, name: fallbackId, version: '' };
    const marker = '__bamboo_module_';
    const idx = code.indexOf(marker);
    if (idx < 0) return fallback;
    const after = code.slice(idx + marker.length);
    const open = after.indexOf('{');
    if (open < 0) return fallback;
    // 括号匹配（跳过字符串字面量里的括号）定位 meta 对象体的闭合 }。
    // 声明可能跨多行且含 mount 函数，故不能只取标记那一行做 JSON.parse。
    let depth = 0;
    let close = -1;
    let inStr: string | null = null;
    for (let i = open; i < after.length; i++) {
      const ch = after[i];
      if (inStr) {
        if (ch === '\\') { i++; continue; } // 跳转义字符
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { close = i; break; } }
    }
    if (close < 0) return fallback;
    const body = after.slice(open, close + 1);

    // 优先按 JSON 解析：模块声明常写成纯 JSON（key 带引号，如 {"id":"blog",...}），
    // 整体 JSON.parse 最稳；正则方案对带引号 key 会整体失配（已用 node 复现确认）。
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(body) as Record<string, unknown>;
    } catch {
      parsed = null;
    }
    if (parsed && typeof parsed === 'object') {
      const fabRaw = (parsed.fab && typeof parsed.fab === 'object' ? parsed.fab : null) as {
        icon?: unknown;
        label?: unknown;
      } | null;
      const loc = parsed.location;
      return {
        id: typeof parsed.id === 'string' && parsed.id ? parsed.id : fallbackId,
        name: typeof parsed.name === 'string' && parsed.name ? parsed.name : fallbackId,
        version: typeof parsed.version === 'string' ? parsed.version : '',
        fab:
          fabRaw && (fabRaw.icon || fabRaw.label)
            ? {
                icon: typeof fabRaw.icon === 'string' ? fabRaw.icon : undefined,
                label: typeof fabRaw.label === 'string' ? fabRaw.label : undefined,
              }
            : undefined,
        location: loc === 'left' || loc === 'center' || loc === 'right' ? loc : undefined,
      };
    }

    // JSON 解析失败（对象字面量含函数等）→ 正则兜底，兼容无引号 key 的 JS 对象
    const strField = (key: string): string | undefined => {
      const m = body.match(new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"']*?)["']`));
      return m ? m[1] : undefined;
    };
    const id = strField('id') || fallbackId;
    const name = strField('name') || fallbackId;
    const version = strField('version') || '';
    const locRaw = strField('location');
    const location = locRaw === 'left' || locRaw === 'center' || locRaw === 'right' ? locRaw : undefined;

    // fab 按钮块（约定只含 icon/label 两个字符串字段，无嵌套 {}）
    const fabMatch = body.match(/["']?fab["']?\s*:\s*\{[^}]*\}/);
    let fab: ModuleMeta['fab'] = undefined;
    if (fabMatch) {
      const fb = fabMatch[0];
      const icon = (fb.match(/icon\s*:\s*["']([^"']*?)["']/) || [])[1];
      const label = (fb.match(/label\s*:\s*["']([^"']*?)["']/) || [])[1];
      if (icon || label) fab = { icon, label };
    }
    return { id, name, version, fab, location };
  }

  private async handleMessage(type: string, id: string, payload: unknown): Promise<void> {
    // ---- 生命周期 ----
    if (type === 'app:ready') {
      // 阶段3 · 契约化：版本协商 — 插件升级但 webapp 缓存旧版时，用户重新加载视图即可获取最新 webapp
      this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      this.respond(id, {
        ok: true,
        // 门控：webapp 启动即知激活状态，未激活时显示全屏激活遮罩
        licenseActive: this.licenseStore.isActive(),
        sectionConfig: this.settings.sectionConfig || null,
        // 仅下发主题清单（名字 + meta），代码不在此全量下发；
        // webapp 在用户点选/恢复外部主题时经 theme:load 按需取回，避免 5 个主题代码一次性跨进程灌入。
        customThemes: this.customThemeManifests,
        // 随 app:ready 直接带上「当前已激活外部主题」的代码（仅此一个，非全量 5 个）：
        // 视图重建（横向布局 moveToCenter 重建 webview）后，init 走异步 theme:load 往返会因
        // 新 iframe 的通信层绑定 / 消息路由竞态而失败，导致外部主题掉回默认竹林。把激活主题代码
        // 同步随握手下发，init 跑前即已注册，彻底消除该竞态。其余主题仍走懒加载。
        activeTheme: this.getActiveExternalTheme(),
        customNoises: this.settings.noiseItems || [],
        syncPaletteToObsidian: this.settings.syncPaletteToObsidian || false,
        // 平台感知：移动端 webapp 据此做平台分支（隐藏拖拽提示、优化动画、抽屉适配等）。
        // 用可选链防御：测试环境 mock 的 obsidian 未导出 Platform 时安全降级为 false。
        isMobile: Platform?.isMobile ?? false,
        // 视图是否在主工作区（中央）：侧边栏时 webapp 据此决定是否请求移动到中央
        isMainLeaf: this.isMainLeaf ? this.isMainLeaf() : true,
        // 重建视图（侧边栏移中央）后待恢复的布局模式，webapp 据此自动进入横向/看板
        pendingLayoutMode: this.getPendingLayoutMode ? this.getPendingLayoutMode() : null,
      });
      // 画中卷：握手时补发一次上下文（feature/location/zen），
      // 兜住「iframe load 时那次注入被 webapp 漏收」的窗口（详见 onScrollContextRequest 注释）。
      this._pushScrollContext();
      // 模块视图：同理补发 moduleId（详见 onModuleContextRequest 注释）。
      this._pushModuleContext();
      return;
    }

    // ---- 按需加载外部主题代码（清单先行，用户点选/恢复时才取回，避免全量跨进程下发 + 全量 new Function 执行）----
    if (type === 'theme:load') {
      const name = (payload as { name?: string } | undefined)?.name;
      const code = name ? this.customThemeCodeMap.get(name) : undefined;
      if (code !== undefined) {
        this.respond(id, { ok: true, code });
      } else {
        this.respondError(id, 'THEME_NOT_FOUND');
      }
      return;
    }

    // ================= 竹林模块系统 =================
    // 设计前提：模块是「按需下载」的可选能力，代码不在主 bundle 内，落盘在 vault 的
    // 模块目录（默认 <configDir>/bamboo-review/modules，收拢到插件管理区，不再散落 vault 根目录）。
    // webview 侧禁 fetch，故下载一律由宿主 requestUrl 完成。
    // 模块标记 __bamboo_module_ 用于校验下载物确为模块，避免把任意 .js 当模块执行。

    // ---- 模块市场：拉取清单（host 侧 fetch 公开仓库的 manifest.json）----
    if (type === 'module:market:manifest') {
      try {
        const manifest = await this._fetchMarketJson(MODULE_MARKET_MANIFEST_URL);
        // 附带「已安装版本表」，webapp 拿它与 manifest 中各模块的 version 比对 → 得出「可更新」
        this.respond(id, { ok: true, manifest, installed: this.settings.moduleInstalled || {} });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '模块市场清单拉取失败');
      }
      return;
    }

    // ---- 模块市场：安装（下载 .js 写入模块目录，触发重扫）----
    if (type === 'module:install') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as {
        id?: string;
        url?: string;
        version?: string;
      };
      if (!p.id || !p.url) { this.respondError(id, 'module:install 缺少 id 或 url'); return; }
      try {
        const code = await this._fetchMarketText(p.url);
        if (!code.includes('__bamboo_module_')) throw new Error('不是有效的竹林模块文件');
        const dir = this._moduleDir();
        try { await this.vaultAdapter.mkdir(dir); } catch { /* 已存在则忽略 */ }
        await this.vaultAdapter.write(`${dir}/${p.id}.js`, code);
        // 记录本次安装的版本：后续与 manifest 的 version 比对即可判断「可更新」
        if (!this.settings.moduleInstalled) this.settings.moduleInstalled = {};
        this.settings.moduleInstalled[p.id] = { version: p.version || '', installedAt: Date.now() };
        await this.saveSettings();
        await this._rescanModules();
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '模块安装失败');
      }
      return;
    }

    // ---- 模块市场：卸载（删除模块 .js，连带清除其自持久化数据）----
    if (type === 'module:uninstall') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { id?: string };
      if (!p.id) { this.respondError(id, 'module:uninstall 缺少 id'); return; }
      try {
        const dir = this._moduleDir();
        if (await this._fileExists(`${dir}/${p.id}.js`)) {
          await this.vaultAdapter.remove(`${dir}/${p.id}.js`);
        }
        let dirty = false;
        if (this.settings.moduleInstalled) {
          delete this.settings.moduleInstalled[p.id];
          dirty = true;
        }
        // 模块数据一并清除：避免卸载后重装读到上个「人生」的残留配置
        if (this.settings.moduleData) {
          delete this.settings.moduleData[p.id];
          dirty = true;
        }
        if (dirty) await this.saveSettings();
        await this._rescanModules();
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '模块卸载失败');
      }
      return;
    }

    // ---- 已安装模块清单（主应用据此把模块声明的按钮注入悬浮菜单）----
    if (type === 'module:list') {
      await this._rescanModules();
      const installed = this.settings.moduleInstalled || {};
      this.respond(id, {
        ok: true,
        // 带上元数据（含 fab 按钮声明），主应用据此注入悬浮菜单按钮，无需执行模块代码
        modules: Array.from(this.moduleCodeMap.keys()).map((mid) => {
          const meta = this.moduleMetaMap.get(mid);
          return {
            id: meta?.id || mid,
            name: meta?.name || mid,
            // 版本以安装记录为准（市场装/卸时写入）；无记录（手工放入的文件）退回元数据声明
            version: installed[mid]?.version || meta?.version || '',
            fab: meta?.fab || null,
            location: meta?.location || 'left',
          };
        }),
      });
      return;
    }

    // ---- 按需加载模块代码（同 theme:load，避免全量下发 + 全量 new Function 执行）----
    if (type === 'module:load') {
      const mid = (payload as { id?: string } | undefined)?.id;
      if (!mid) { this.respondError(id, 'module:load 缺少 id'); return; }
      if (this.moduleCodeMap.size === 0) await this._rescanModules();
      const code = this.moduleCodeMap.get(mid);
      if (code !== undefined) {
        this.respond(id, { ok: true, code });
      } else {
        this.respondError(id, 'MODULE_NOT_FOUND');
      }
      return;
    }

    // ---- 模块自持久化数据：data: URL 下 localStorage/sessionStorage/indexedDB 读取即抛
    //      SecurityError，故模块的用户数据统一由宿主存进插件设置 ----
    if (type === 'module:saveData') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { id?: string; data?: unknown };
      if (!p.id) { this.respondError(id, 'module:saveData 缺少 id'); return; }
      if (!this.settings.moduleData) this.settings.moduleData = {};
      this.settings.moduleData[p.id] =
        (p.data && typeof p.data === 'object' ? p.data : {}) as Record<string, unknown>;
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }

    if (type === 'module:loadData') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { id?: string };
      const data = (p.id && this.settings.moduleData?.[p.id]) || null;
      this.respond(id, { ok: true, data });
      return;
    }

    // ---- 模块能力：列出指定目录下的 markdown 文件（博客文章列表）----
    if (type === 'module:listFiles') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as {
        folder?: string;
        recursive?: boolean;
      };
      const folder = normalizePath((p.folder || '').replace(/\/+$/, ''));
      if (!folder) { this.respondError(id, 'module:listFiles 缺少 folder'); return; }
      try {
        const out: { path: string; name: string; mtime: number; ctime: number; size: number }[] = [];
        // 上限保护：误把 vault 根目录当博客目录时，不至于一次吞掉整个库
        const MAX_FILES = 500;
        const MAX_DEPTH = 5;
        const queue: { p: string; d: number }[] = [{ p: folder, d: 0 }];
        while (queue.length > 0 && out.length < MAX_FILES) {
          const cur = queue.shift();
          if (!cur) break;
          const listed = await this.vaultAdapter.list(cur.p);
          for (const f of listed.files || []) {
            if (!f.endsWith('.md')) continue;
            const np = normalizePath(f);
            const tf = this.app.vault.getAbstractFileByPath(np) as TFile | null;
            const st = tf ? tf.stat : null;
            out.push({
              path: np,
              name: (np.split('/').pop() || np).replace(/\.md$/, ''),
              mtime: st?.mtime ?? 0,
              ctime: st?.ctime ?? 0,
              size: st?.size ?? 0,
            });
            if (out.length >= MAX_FILES) break;
          }
          if (p.recursive && cur.d + 1 < MAX_DEPTH) {
            for (const d of listed.folders || []) queue.push({ p: d, d: cur.d + 1 });
          }
        }
        out.sort((a, b) => b.mtime - a.mtime);
        this.respond(id, { ok: true, files: out });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '目录读取失败');
      }
      return;
    }

    // ---- 模块能力：读取 vault 文件正文 ----
    if (type === 'module:readFile') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { path?: string };
      if (!p.path) { this.respondError(id, 'module:readFile 缺少 path'); return; }
      try {
        const content = await this.vaultAdapter.read(normalizePath(p.path));
        this.respond(id, { ok: true, content });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '文件读取失败');
      }
      return;
    }

    // ---- 模块能力：渲染 markdown 为 HTML（侧栏内置阅读视图，避免跳离模块）----
    if (type === 'module:renderMarkdown') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as {
        path?: string; content?: string; sourcePath?: string;
      };
      let markdown = typeof p.content === 'string' ? p.content : null;
      let sourcePath = typeof p.sourcePath === 'string' ? p.sourcePath : (p.path || '');
      if (markdown == null && p.path) {
        let target = normalizePath(p.path);
        if (!(await this.app.vault.adapter.exists(target))) {
          // wikilink / 仅笔记名：按 basename 查找（模块内 [[笔记]] 跳转）
          const base = p.path.split('#')[0].split('/').pop() || p.path;
          const hit = this.app.vault.getMarkdownFiles().find((f) => f.basename === base);
          if (hit) target = hit.path;
        }
        try {
          markdown = await this.vaultAdapter.read(target);
          sourcePath = target;
        } catch (e) {
          this.respondError(id, e instanceof Error ? e.message : '文件读取失败');
          return;
        }
      }
      if (markdown == null) { this.respondError(id, 'module:renderMarkdown 缺少 content/path'); return; }
      // 渲染结果只以 innerHTML 字符串回传 webview，因此不需要 foreign document：
      // activeDocument 就是 Obsidian 主窗口 document，其元素带 createEl/createDiv 增强。
      // 挂一个一次性容器，渲染完（无论成败）立即卸载组件并移除节点，不留残留。
      const el = activeDocument.body.createDiv();
      const comp = new Component();
      comp.load();
      try {
        await MarkdownRenderer.render(this.app, markdown, el, sourcePath, comp);
        this.respond(id, { ok: true, html: el.innerHTML, sourcePath });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '渲染失败');
      } finally {
        comp.unload();
        el.remove();
      }
      return;
    }

    // ---- 模块能力：用 Obsidian 原生阅读视图打开文件 ----
    // 模块视图常驻左侧栏，故文章一律在中央工作区新页签打开（不抢占模块视图所在的 leaf）。
    if (type === 'module:openFile') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { path?: string };
      if (!p.path) { this.respondError(id, 'module:openFile 缺少 path'); return; }
      const path = p.path;
      let tf = this.app.vault.getAbstractFileByPath(normalizePath(path)) as TFile | null;
      if (!tf) {
        // wikilink / 仅笔记名：按 basename 查找（模块内 markdown 的 [[笔记]] 跳转）
        const base = path.split('#')[0].split('/').pop() || path;
        const hit = this.app.vault.getMarkdownFiles().find(
          (f) => f.basename === base || f.path === normalizePath(path)
        );
        if (hit) tf = hit;
      }
      if (!tf) { this.respondError(id, '文件不存在：' + path); return; }
      const leaf = this.app.workspace.getLeaf('tab');
      await leaf.openFile(tf);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 模块能力：写入 vault 文件（博客模块「一键应用竹杖芒鞋排版」用）----
    if (type === 'module:writeFile') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { path?: string; content?: string };
      if (!p.path || typeof p.content !== 'string') { this.respondError(id, 'module:writeFile 缺少 path/content'); return; }
      const np = normalizePath(p.path);
      try {
        const dir = np.split('/').slice(0, -1).join('/');
        if (dir) { try { await this.app.vault.adapter.mkdir(dir); } catch { /* 目录已存在 */ } }
        await this.vaultAdapter.write(np, p.content);
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '写入失败');
      }
      return;
    }

    // ---- 视图移动到主工作区（侧边栏点横向/看板 → 自动切到中央）----
    if (type === 'app:moveToCenter') {
      if (this.moveToCenter) {
        // mode 会被写进视图状态（pendingLayoutMode）并随 workspace 布局跨重启持久化，
        // 重启后又经 app:ready 注入 webapp 兜底恢复。必须白名单收口，
        // 否则任意字符串会被存进布局文件、并在恢复时被当成布局模式消费。
        const raw = (payload as { mode?: string })?.mode;
        const mode = raw === 'kanban' || raw === 'horizontal' ? raw : 'horizontal';
        this.moveToCenter(mode);
        this.respond(id, { ok: true });
      } else {
        this.respond(id, { ok: false, error: 'moveToCenter 未注入' });
      }
      return;
    }

    // ---- 视图移回右侧栏（恢复纵向时）----
    if (type === 'app:moveToSidebar') {
      if (this.moveToSidebar) {
        this.moveToSidebar();
        this.respond(id, { ok: true });
      } else {
        this.respond(id, { ok: false, error: 'moveToSidebar 未注入' });
      }
      return;
    }

    // ---- 画中卷·打字机「一键全屏」：折叠/恢复左右侧栏 ----
    if (type === 'app:toggleZen') {
      if (this.toggleZen) {
        const zen = this.toggleZen();
        this.respond(id, { ok: true, zen: !!zen });
      } else {
        this.respond(id, { ok: false, error: 'toggleZen 未注入' });
      }
      return;
    }

    // ---- 折叠 Obsidian 右侧栏（进入横向/看板多列模式时腾出横向宽度）----
    if (type === 'app:collapseRightSidebar') {
      if (this.collapseRightSidebar) {
        const wasCollapsed = this.collapseRightSidebar();
        this.respond(id, { ok: true, wasCollapsed: !!wasCollapsed });
      } else {
        this.respond(id, { ok: false, error: 'collapseRightSidebar 未注入' });
      }
      return;
    }

    // ---- 展开 Obsidian 右侧栏（恢复纵向时对称还原）----
    if (type === 'app:expandRightSidebar') {
      if (this.expandRightSidebar) {
        this.expandRightSidebar();
        this.respond(id, { ok: true });
      } else {
        this.respond(id, { ok: false, error: 'expandRightSidebar 未注入' });
      }
      return;
    }

    // ---- 备份码导出：仅已激活设备可导出（本质是已存激活码的便携封装）----
    if (type === 'app:exportBackup') {
      if (!this.licenseStore.isActive()) {
        this.respond(id, { ok: false, error: '未激活，无法导出备份码' });
        return;
      }
      const savedKey = this.licenseStore.getSavedKey();
      if (!savedKey) {
        this.respond(id, { ok: false, error: '未找到已保存的激活码' });
        return;
      }
      // 用 Base64 包裹 + 前缀，避免与正式激活码混淆；不含任何密钥
      let backup: string;
      try {
        backup = encodeBackup(savedKey);
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '备份码生成失败');
        return;
      }
      this.respond(id, { ok: true, backup });
      return;
    }

    // ---- 备份码导入：解包得到激活码后走标准激活流程（换设备/换仓库用）----
    if (type === 'app:importBackup') {
      const p = payload as { backup?: string };
      const raw = typeof p.backup === 'string' ? p.backup.trim() : '';
      if (!raw) {
        this.respond(id, { ok: false, error: '请输入备份码' });
        return;
      }
      let code: string;
      try {
        code = decodeBackup(raw);
      } catch (e) {
        this.respond(id, { ok: false, error: e instanceof Error ? e.message : '备份码无效' });
        return;
      }
      try {
        const verified = await verifyLicenseKey(code);
        if (!verified) {
          this.respond(id, { ok: false, error: '备份码无效或已失效' });
          return;
        }
        await this.licenseStore.activate(code);
        this.onLicenseActivated?.();
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '备份码导入失败');
      }
      return;
    }

    // ---- 激活码校验（宿主侧持密钥，Web Crypto 异步校验）----
    if (type === 'app:activateLicense') {
      const p = payload as { code?: string };
      const code = typeof p.code === 'string' ? p.code.trim() : '';
      if (!code) {
        this.respond(id, { ok: false, error: '请输入激活码' });
        return;
      }
      try {
        const verified = await verifyLicenseKey(code);
        if (!verified) {
          this.respond(id, { ok: false, error: '激活码无效或格式错误' });
          return;
        }
        await this.licenseStore.activate(code);
        this.onLicenseActivated?.();
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '激活校验失败');
      }
      return;
    }

    if (type === 'app:close') {
      this.respond(id, { ok: true });
      return;
    }

    // ---- 板块配置 ----
    if (type === 'app:saveSectionConfig') {
      this.settings.sectionConfig = payload as Record<string, unknown> | null;
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }

    // ---- 白噪音音源 ----
    if (type === 'app:saveCustomNoises') {
      this.settings.noiseItems = (Array.isArray(payload) ? payload : []) as NoiseItem[];
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }

    // ---- 调色同步（webapp → Obsidian）----
    if (type === 'theme:syncPalette') {
      const p = payload as { hue: number; lightnessOffset: number; isDark: boolean };
      // 阅读视图（宿主自有 BambooReaderView）的竹青强调色：始终跟随滑块。
      // 放在开关判断之外——「将调色同步到 Obsidian」只管原生界面那 7 个变量，
      // 插件自有视图跟随主视图调色属内部一致性要求（与下方 broadcastTheme 同理）。
      ThemeBridge.applyReaderPalette(p.hue, p.lightnessOffset);
      if (this.settings.syncPaletteToObsidian) {
        this.themeBridge.applyPalette(p.hue, p.lightnessOffset, p.isDark);
      }
      // 应用内调色（含明暗与色相）→ 广播给所有已打开视图（含画中卷独立 iframe）。
      // 色相/明度必须一并下发：画中卷等独立 iframe 视图内没有 DisplayManager，
      // 只有拿到这两个值才能驱动自身配色（其内部样式全由 --accent-hue /
      // --accent-lightness-offset 派生）。
      // 注意：此处不受 syncPaletteToObsidian 开关控制——那个开关管的是
      // 「webapp 调色是否写回 Obsidian 原生界面」，而「所有视图跟随主视图调色」
      // 是插件内部一致性要求，始终生效。
      ThemeBridge.broadcastTheme(p.isDark, { hue: p.hue, lightnessOffset: p.lightnessOffset });
      this.respond(id, { ok: true });
      return;
    }

    // ---- 模块能力：切换 Obsidian 基础明暗（博客模块「快门」改作明暗开关用）----
    // 与画中卷·打字机的机身明暗开关走同一实现（_switchObsidianTheme），
    // 语义是「控制 Obsidian 外观明暗」，切换后整条主题管线会即时跟随，模块侧栏随之变明暗。
    if (type === 'module:toggleTheme') {
      const wanted = (payload as { isDark?: boolean } | null)?.isDark;
      const currentlyDark = activeDocument.body.classList.contains('theme-dark');
      const targetIsDark = typeof wanted === 'boolean' ? wanted : !currentlyDark;
      const r = this._switchObsidianTheme(targetIsDark);
      if (!r.ok) {
        this.respondError(id, r.error || '切换明暗主题失败');
        return;
      }
      this.respond(id, { ok: true, isDark: r.isDark });
      return;
    }

    // ---- 模块能力：设置主题调色（色相 + 明度偏移），替代显示设置面板的调色旋钮 ----
    // 与 theme:syncPalette 同源：阅读视图始终跟随，原生界面视「同步到 Obsidian」开关，
    // 并广播给所有已打开视图（含画中卷独立 iframe）。
    if (type === 'module:setTheme') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { hue?: number; lightnessOffset?: number };
      if (typeof p.hue !== 'number' || !Number.isFinite(p.hue)) {
        this.respondError(id, 'module:setTheme 缺少合法 hue');
        return;
      }
      const lo = Number.isFinite(p.lightnessOffset as number) ? (p.lightnessOffset as number) : 0;
      const isDark = activeDocument.body.classList.contains('theme-dark');
      ThemeBridge.applyReaderPalette(p.hue, lo);
      if (this.settings.syncPaletteToObsidian) {
        this.themeBridge.applyPalette(p.hue, lo, isDark);
      }
      ThemeBridge.broadcastTheme(isDark, { hue: p.hue, lightnessOffset: lo });
      this.respond(id, { ok: true });
      return;
    }

    // ---- 模块能力：读取当前主题调色（供模块初始化微调滑块等）----
    if (type === 'module:getTheme') {
      const isDark = activeDocument.body.classList.contains('theme-dark');
      const last = this.themeBridge.currentPalette;
      let hue = 152;
      let lightnessOffset = 0;
      if (last && Number.isFinite(last.hue)) {
        hue = last.hue;
        lightnessOffset = last.lightnessOffset;
      } else {
        const accent = getComputedStyle(activeDocument.body).getPropertyValue('--interactive-accent').trim();
        const h = accent ? ThemeBridge.rgbToHue(accent) : null;
        if (h != null && Number.isFinite(h)) hue = h;
      }
      this.respond(id, { ok: true, palette: { hue, lightnessOffset, isDark } });
      return;
    }

    // ---- 应用内手动切换明暗（如悬浮菜单夜间模式）----
    // webapp 的 store.setDarkMode 仅在用户手动切换时发出本消息（宿主推送不触发），
    // 由宿主广播给所有视图，确保画中卷等独立 iframe 跟随应用明暗，不依赖 Obsidian 系统主题。
    if (type === 'theme:appDarkMode') {
      const isDark = !!(payload as { isDark?: boolean } | null)?.isDark;
      ThemeBridge.broadcastTheme(isDark);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 画中卷·打字机机身明暗开关：切换 Obsidian 基础主题 ----
    // 该开关语义是「控制 Obsidian 外观明暗」（不是 webapp 内部夜间模式）：
    // 宿主切换 moonstone(亮) / obsidian(暗) 后显式重放 css-change，
    // 驱动既有主题管线（各视图 css-change → onThemeChanged → pushTheme → theme:changed）即时跟随。
    if (type === 'app:toggleObsidianTheme') {
      const wanted = (payload as { isDark?: boolean } | null)?.isDark;
      const currentlyDark = activeDocument.body.classList.contains('theme-dark');
      const targetIsDark = typeof wanted === 'boolean' ? wanted : !currentlyDark;
      const r = this._switchObsidianTheme(targetIsDark);
      if (!r.ok) {
        this.respondError(id, r.error || '切换明暗主题失败');
        return;
      }
      this.respond(id, { ok: true, isDark: r.isDark });
      return;
    }

    // ---- 重新开启主题跟随（webapp → Obsidian）----
    if (type === 'app:theme:sync') {
      this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 音频文件扫描 ----
    if (type === 'app:listVaultAudioFiles') {
      try {
        const files = await this.scanVaultAudioFiles();
        this.respond(id, { files });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '扫描库文件失败');
      }
      return;
    }

    // ---- 读取库内音频 ----
    if (type === 'app:readVaultFile') {
      await this.handleReadVaultFile(id, payload);
      return;
    }

    // ---- 读取本机绝对路径音频（兼容旧音源）----
    if (type === 'app:readLocalFile') {
      await this.handleReadLocalFile(id, payload);
      return;
    }

    // ---- 画中卷 · 通用文本文件协议（listDir / get / write / delete）----
    // 作用域限定在「画中卷」绑定目录内，路径遍历防护由 handleFileOp 统一执行。
    if (type === 'file:list' || type === 'file:get' || type === 'file:write' || type === 'file:delete') {
      await this.handleFileOp(id, type, payload);
      return;
    }

    // ---- 代理外部音源链接（绕过 webview CORS，桌面/移动一致）----
    if (type === 'app:proxyAudioUrl') {
      await this.handleProxyAudioUrl(id, payload);
      return;
    }

    // ---- 战略复盘面板 → AI 改进入口 ----
    if (type === 'app:aiImproveGoal') {
      const p = payload as { goalId?: unknown; title?: unknown; hints?: unknown };
      if (typeof p.goalId !== 'string' || p.goalId.length === 0) {
        this.respondError(id, 'app:aiImproveGoal 缺少 goalId');
        return;
      }
      this.onAiImproveGoal?.({
        goalId: p.goalId,
        title: typeof p.title === 'string' ? p.title : undefined,
        hints: typeof p.hints === 'string' ? p.hints : undefined,
      });
      this.respond(id, { ok: true });
      return;
    }

    // ---- 目标归档：打开独立归档页 ----
    if (type === 'app:openArchive') {
      this.onOpenArchive?.();
      this.respond(id, { ok: true });
      return;
    }

    // ---- 画中卷：打开独立中央视图（不影响日报）----
    if (type === 'app:openScroll') {
      this.onOpenScroll?.(payload && typeof payload === 'object' ? (payload as { feature?: unknown }).feature as string | undefined : undefined);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 画中卷：打开到左侧边栏（百宝箱首个功能，默认形态）----
    if (type === 'app:openScrollLeftSidebar') {
      this.onOpenScrollLeftSidebar?.(payload && typeof payload === 'object' ? (payload as { feature?: unknown }).feature as string | undefined : undefined);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 画中卷：画布内 3-dot 请求切换停靠位置 ----
    if (type === 'app:moveScroll') {
      const loc = payload && typeof payload === 'object' ? (payload as { location?: unknown }).location : undefined;
      this.onMoveScroll?.(typeof loc === 'string' ? loc : undefined);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 模块能力：把 vault 文件路径解析成 webview 可加载的资源 URL ----
    // 模块运行在 webview 里，拿不到 Obsidian 的 getResourcePath；头像/封面等 vault 内图片
    // 必须经宿主换成 app:// 资源地址才能渲染。只读操作，不写盘。
    if (type === 'module:resolveResource') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { path?: string };
      if (!p.path) { this.respondError(id, 'module:resolveResource 缺少 path'); return; }
      const tf = this.app.vault.getAbstractFileByPath(normalizePath(p.path)) as TFile | null;
      if (!tf) { this.respondError(id, '文件不存在'); return; }
      this.respond(id, { ok: true, url: this.app.vault.getResourcePath(tf) });
      return;
    }

    // ---- 竹林模块：悬浮菜单点模块按钮 → 打开该模块视图 ----
    if (type === 'app:openModule') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as {
        moduleId?: unknown;
        location?: unknown;
      };
      const moduleId = typeof p.moduleId === 'string' ? p.moduleId : '';
      if (!moduleId) { this.respondError(id, 'app:openModule 缺少 moduleId'); return; }
      const location = p.location === 'left' || p.location === 'center' || p.location === 'right'
        ? p.location
        : undefined;
      this.onOpenModule?.(moduleId, location);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 模块能力：在宿主自建的竹杖芒鞋式中央阅读视图打开文章 ----
    if (type === 'module:openReader') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { path?: string };
      if (!p.path) { this.respondError(id, 'module:openReader 缺少 path'); return; }
      this.onOpenReader?.(p.path);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 在 Obsidian 原生打开指定 vault 文件（画中卷便签 → 原生 md 编辑器）----
    if (type === 'app:openFile') {
      try {
        const raw = (payload as { path?: string } | null)?.path;
        const p: string = typeof raw === 'string' ? raw : '';
        if (!p) { this.respondError(id, '未提供文件路径'); return; }
        const file = this.app.vault.getAbstractFileByPath(p);
        if (!file || !(file instanceof TFile)) {
          this.respondError(id, '文件不存在：' + p);
          return;
        }
        // false：在当前活跃 leaf 旁开新 leaf（不替换画中卷本身）
        const leaf = this.app.workspace.getLeaf(false);
        await leaf.openFile(file);
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '打开文件失败');
      }
      return;
    }

    // ---- 思维子弹导出为 Markdown：写入 Vault 任意相对路径（不受画中卷目录限制）----
    if (type === 'app:exportMindmap') {
      try {
        const p = payload as { path?: string; content?: string } | null;
        const raw = typeof p?.path === 'string' ? p.path.trim() : '';
        if (!raw) throw new Error('未提供文件路径');
        if (raw.includes('..')) throw new Error('路径遍历禁止');
        const full = normalizePath(raw);
        const content = typeof p?.content === 'string' ? p.content : '';
        const parent = full.substring(0, full.lastIndexOf('/'));
        if (parent) { try { await this.vaultAdapter.mkdir(parent); } catch { /* 已存在忽略 */ } }
        await this.vaultAdapter.write(full, content);
        this.respond(id, { ok: true, path: full });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '导出失败');
      }
      return;
    }

    // ---- 健康分权威快照（单一数据源，供 webapp 健康分环/详情消费）----
    if (type === 'app:getHealthOverview') {
      const provider = this.strategyOverviewProvider;
      if (!provider) {
        this.respondError(id, 'app:getHealthOverview 未配置数据源');
        return;
      }
      try {
        const overview = await provider();
        if (!overview) {
          this.respondError(id, '暂无目标数据，无法计算健康分');
          return;
        }
        // overview 必须一并下发：webapp「数据概览」tab 此前拿不到它，只能本地再算一遍
        // （且本地用的是未过滤归档的目标集），于是同一面板里「概览」与「诊断」两套口径。
        // 下发后概览 tab 优先消费这份权威聚合，真正做到单一数据源。
        this.respond(id, {
          updatedAt: overview.updatedAt,
          health: overview.health,
          goals: overview.goals,
          results: overview.results,
          overview: overview.overview,
          hints: overview.hints,
        });
      } catch (e) {
        this.respondError(id, `app:getHealthOverview 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 主题市场：拉取清单（host 侧 fetch 公开仓库的 manifest.json）----
    if (type === 'market:manifest') {
      try {
        const manifest = await this._fetchMarketJson(MARKET_MANIFEST_URL);
        // 附带「已安装版本表」，webapp 拿它与 manifest 中各主题的 version 比对 → 得出「可更新」
        this.respond(id, { ok: true, manifest, installed: this.settings.marketInstalled || {}, installedIds: this.customThemeManifests.map((t) => t.name) });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '市场清单拉取失败');
      }
      return;
    }

    // ---- 主题市场：安装（下载 .js 写入主题文件夹，触发重扫）----
    if (type === 'market:install') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as {
        id?: string;
        url?: string;
        version?: string;
      };
      const tid = p.id;
      const url = p.url;
      if (!tid || !url) { this.respondError(id, 'market:install 缺少 id 或 url'); return; }
      try {
        const code = await this._fetchMarketText(url);
        if (!code.includes('__bamboo_theme_')) throw new Error('不是有效的竹林主题文件');
        const dir = this.settings.themePath || '竹林动效主题';
        const filePath = `${dir}/${tid}.js`;
        // 首次安装时目录可能尚不存在（用户改过 themePath / 从未装过主题）：
        // 低层 adapter.write 不保证自动建目录，先 mkdir 再写（与本项目其它写入点一致）。
        try { await this.vaultAdapter.mkdir(dir); } catch { /* 已存在则忽略 */ }
        await this.vaultAdapter.write(filePath, code);
        // 记录本次安装的版本：后续与 manifest 的 version 比对即可判断「可更新」
        if (!this.settings.marketInstalled) this.settings.marketInstalled = {};
        this.settings.marketInstalled[tid] = { version: p.version || '', installedAt: Date.now() };
        await this.saveSettings();
        await this._rescanThemes();
        this._broadcastThemeManifests();   // 让其它已打开的视图也看到新主题
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '主题安装失败');
      }
      return;
    }

    // ---- 主题市场：卸载（删除主题文件夹中的 .js，触发重扫）----
    if (type === 'market:uninstall') {
      const p = (payload && typeof payload === 'object' ? payload : {}) as { id?: string };
      const tid = p.id;
      if (!tid) { this.respondError(id, 'market:uninstall 缺少 id'); return; }
      try {
        const dir = this.settings.themePath || '竹林动效主题';
        const filePath = `${dir}/${tid}.js`;
        // 文件可能已被手动删除、或 themePath 与当初安装时不同：
        // 此时 remove 会抛错并让整条卸载失败，故先判存在 —— 不存在时按「已卸载」处理，
        // 版本记录照常清除，避免残留导致重装后误判「已最新」。
        if (await this._fileExists(filePath)) {
          await this.vaultAdapter.remove(filePath);
        }
        // 同步清除版本记录，避免残留导致重装后误判「已最新」
        if (this.settings.marketInstalled) {
          delete this.settings.marketInstalled[tid];
          await this.saveSettings();
        }
        await this._rescanThemes();
        this._broadcastThemeManifests();
        this.respond(id, { ok: true });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '主题卸载失败');
      }
      return;
    }

    // ---- 当前修行境界（竹杖芒鞋侧栏常驻展示）----
    if (type === 'app:getCultivationRealm') {
      const provider = this.cultivationRealmProvider;
      if (!provider) {
        this.respondError(id, 'app:getCultivationRealm 未配置数据源');
        return;
      }
      try {
        this.respond(id, await provider());
      } catch (e) {
        this.respondError(id, `app:getCultivationRealm 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 当前竹币余额（竹杖芒鞋侧栏常驻展示）----
    if (type === 'app:getBambooCoinBalance') {
      const provider = this.bambooCoinBalanceProvider;
      if (!provider) {
        this.respondError(id, 'app:getBambooCoinBalance 未配置数据源');
        return;
      }
      try {
        this.respond(id, await provider());
      } catch (e) {
        this.respondError(id, `app:getBambooCoinBalance 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 当前可用竹币余额（竹杖芒鞋侧栏常驻展示，与 webapp 商店界面对齐）----
    if (type === 'app:getBambooCoinAvailableBalance') {
      const provider = this.bambooCoinAvailableBalanceProvider;
      if (!provider) {
        this.respondError(id, 'app:getBambooCoinAvailableBalance 未配置数据源');
        return;
      }
      try {
        this.respond(id, await provider());
      } catch (e) {
        this.respondError(id, `app:getBambooCoinAvailableBalance 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 存储类消息（委托给 VaultStorage）----
    const result = await this.handleStorageMessage(type, payload);
    this.respond(id, result);
  }

  /**
   * 切换 Obsidian 基础明暗主题（moonstone 亮 / obsidian 暗）——明暗开关的唯一实现。
   * 抽出来给两处复用：画中卷·打字机机身开关（app:toggleObsidianTheme）与博客模块快门
   * （module:toggleTheme，见 _buildApi 暴露的 api.toggleTheme）。
   *
   * 语义是「控制 Obsidian 外观明暗」（不是 webapp 内部夜间模式）：切换后显式重放
   * css-change，驱动既有主题管线（各视图 css-change → onThemeChanged → pushTheme →
   * theme:changed）即时跟随，模块侧栏也就跟着变明暗。
   *
   * Obsidian 未在公开类型中暴露「切基础主题」API：优先用运行时存在的 App.changeTheme，
   * 回退到 Vault.setConfig('theme', mode)。两者都以受限接口探测，避免 any 回潮。
   */
  private _switchObsidianTheme(targetIsDark: boolean): { ok: boolean; isDark?: boolean; error?: string } {
    const targetMode = targetIsDark ? 'obsidian' : 'moonstone';
    const appUnsafe = this.app as unknown as {
      changeTheme?: (theme: string) => void;
      vault?: { setConfig?: (key: string, value: unknown) => void };
    };
    let switched = false;
    try {
      if (typeof appUnsafe.changeTheme === 'function') {
        appUnsafe.changeTheme(targetMode);
        switched = true;
      } else if (appUnsafe.vault && typeof appUnsafe.vault.setConfig === 'function') {
        appUnsafe.vault.setConfig('theme', targetMode);
        switched = true;
      }
    } catch {
      /* 落到下方「不支持」分支统一响应 */
    }
    if (!switched) return { ok: false, error: '当前 Obsidian 版本不支持切换明暗主题' };
    // 显式重放主题管线：即便 changeTheme/setConfig 已自行派发 css-change，
    // 再触发一次也幂等（pushTheme 有签名缓存），却可兜住「配置已改但事件未派发」的情况。
    try {
      this.app.workspace.trigger('css-change');
    } catch {
      /* 触发失败不影响切换结果：下一次任意主题事件仍会同步 */
    }
    return { ok: true, isDark: targetIsDark };
  }

  /** 存储消息处理 */
  private async handleStorageMessage(type: string, payload: unknown): Promise<unknown> {
    const p = payload as Record<string, unknown>;
    switch (type) {
      case 'storage:readDay':
        return await this.storage.getDay(p.dateKey as string);
      case 'storage:writeDay':
        return await this.storage.putDay(p.data as DayData);
      case 'storage:listDays':
        return await this.storage.getAllDays();
      case 'storage:deleteDay':
        return await this.storage.deleteDay(p.dateKey as string);
      case 'storage:getSetting':
        return await this.storage.getSetting(p.key as string);
      case 'storage:putSetting':
        return await this.storage.putSetting(p.key as string, p.value);
      case 'storage:getAllSettings':
        return await this.storage.getAllSettings();
      case 'storage:getGoals':
        return await this.storage.getGoals();
      case 'storage:putGoals':
        return await this.storage.putGoals(p.goals as never);
      case 'storage:getPurchaseHistory':
        return await this.storage.getPurchaseHistory();
      case 'storage:putPurchaseHistory':
        return await this.storage.putPurchaseHistory(p.data as never);
      case 'storage:getIncomeHistory':
        return await this.storage.getIncomeHistory();
      case 'storage:putIncomeHistory':
        return await this.storage.putIncomeHistory(p.data as never);
      case 'storage:getDayKeys':
        return await this.storage.getDayKeys();
      case 'storage:getDaysPaginated':
        return await this.storage.getDaysPaginated(
          (p.page as number) ?? 0,
          (p.pageSize as number) ?? 30
        );
      case 'storage:exportAll':
        return await this.storage.exportAllData();
      case 'storage:importAll':
        return await this.storage.importData(
          p.data,
          { strategy: (p.options as Record<string, unknown>)?.strategy as 'overwrite' | 'merge' | undefined }
        );
      case 'storage:clearAll':
        return await this.storage.clearAll();
      case 'storage:getCustomTemplates':
        return await this.storage.getCustomTemplates();
      case 'storage:putCustomTemplate':
        return await this.storage.putCustomTemplate(p.template as CustomTemplate);
      case 'storage:deleteCustomTemplate':
        return await this.storage.deleteCustomTemplate(p.id as string);
      case 'storage:getTypewriterNotes':
        return await this.storage.getTypewriterNotes();
      case 'storage:putTypewriterNotes':
        return await this.storage.putTypewriterNotes(p.notes);
      case 'storage:getTypewriterWritingIndex':
        return await this.storage.getTypewriterWritingIndex();
      case 'storage:putTypewriterWritingIndex':
        return await this.storage.putTypewriterWritingIndex(p.idx);
      case 'storage:getTypewriterWritingDoc':
        return await this.storage.getTypewriterWritingDoc(p.id as string);
      case 'storage:putTypewriterWritingDoc':
        return await this.storage.putTypewriterWritingDoc(p.id as string, p.doc);
      case 'storage:deleteTypewriterWritingDoc':
        return await this.storage.deleteTypewriterWritingDoc(p.id as string);
      case 'storage:getTypewriterMindmapDoc':
        return await this.storage.getTypewriterMindmapDoc(p.id as string);
      case 'storage:putTypewriterMindmapDoc':
        return await this.storage.putTypewriterMindmapDoc(p.id as string, p.doc);
      case 'storage:deleteTypewriterMindmapDoc':
        return await this.storage.deleteTypewriterMindmapDoc(p.id as string);
      case 'storage:getTypewriterNotesDoc':
        return await this.storage.getTypewriterNotesDoc(p.id as string);
      case 'storage:putTypewriterNotesDoc':
        return await this.storage.putTypewriterNotesDoc(p.id as string, p.doc);
      case 'storage:deleteTypewriterNotesDoc':
        return await this.storage.deleteTypewriterNotesDoc(p.id as string);
      default:
        throw new Error(`Unknown storage message type: ${type}`);
    }
  }

  /** 扫描库内音频文件 */
  private async scanVaultAudioFiles(
    maxDepth = 5
  ): Promise<Array<{ path: string; name: string; size: number; ext: string }>> {
    const results: Array<{ path: string; name: string; size: number; ext: string }> = [];
    const adapter = this.vaultAdapter;

    // 视图已 detach 后提前终止（#L14）
    if (this.disposed) return results;

    if (this.noisePath) {
      try {
        const list = await adapter.list(this.noisePath);
        if (this.disposed) return results;
        for (const file of list.files) {
          if (file.startsWith('.')) continue;
          const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
          if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
            try {
              // adapter.list 返回的是相对 vault 根的绝对路径（已包含 noisePath），无需再次拼接
              const stat = await adapter.stat(file);
              const name = file.substring(file.lastIndexOf('/') + 1);
              results.push({ path: file, name, size: stat?.size ?? 0, ext });
            } catch { /* skip */ }
          }
        }
      } catch { /* skip */ }
      results.sort((a, b) => a.path.localeCompare(b.path));
      return results;
    }

    // 全库扫描（detach 后 this.disposed 置 true，提前终止避免无谓耗时）
    if (this.disposed) return results;
    const scanDir = async (relativeDir: string, depth: number): Promise<void> => {
      if (depth > maxDepth) return;
      if (this.disposed) return;
      let list;
      try {
        list = await adapter.list(relativeDir);
      } catch {
        return;
      }

      for (const folder of list.folders) {
        if (folder.startsWith('.')) continue;
        const skipSet = new Set([...SKIP_DIRS, ...(this.configDir ? [this.configDir] : [])]);
        if (skipSet.has(folder)) continue;
        // adapter.list 返回的 folders 已是相对 vault 根的绝对路径，直接递归
        await scanDir(folder, depth + 1);
        if (this.disposed) return;
      }

      for (const file of list.files) {
        if (file.startsWith('.')) continue;
        const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
        if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
          try {
            // adapter.list 返回的 files 已是相对 vault 根的绝对路径，直接使用
            const stat = await adapter.stat(file);
            const name = file.substring(file.lastIndexOf('/') + 1);
            results.push({ path: file, name, size: stat?.size ?? 0, ext });
          } catch { /* skip */ }
        }
      }
    };

    await scanDir('', 0);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  }

  /** 读取库内音频文件，返回可播放的 base64 data URL（桌面/移动一致，不依赖 basePath） */
  private async handleReadVaultFile(id: string, payload: unknown): Promise<void> {
    try {
      const p = payload as { path: string };
      let relativePath = p.path || '';
      if (!relativePath) throw new Error('未提供文件路径');

      const ext = relativePath.substring(relativePath.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error('不支持的音频格式：' + ext);
      if (relativePath.includes('..')) throw new Error('路径遍历禁止');

      const adapter = this.vaultAdapter;
      let stat = await adapter.stat(relativePath);
      // 兼容旧版本：若路径因重复拼接 noisePath 而含双前缀，自动去掉一层再试
      if (!stat && this.noisePath) {
        const dup = normalizePath(this.noisePath + '/' + this.noisePath);
        if (relativePath.startsWith(dup + '/')) {
          const fixed = normalizePath(relativePath.slice(this.noisePath.length + 1));
          stat = await adapter.stat(fixed);
          if (stat) relativePath = fixed;
        }
      }
      if (!stat || stat.type !== 'file') throw new Error('文件不存在：' + relativePath);
      if (stat.size > MAX_AUDIO_FILE_BYTES) throw new Error('音频文件过大，无法加载');

      const buffer = await adapter.readBinary(relativePath);
      // 回传 base64 data URL：与 readLocalFile / proxyAudioUrl 保持同一契约，
      // webapp 端 (whiteNoiseManager._dataUrlToArrayBuffer) 统一按 data URL 解析。
      this.respond(id, { data: this.toDataUrl(buffer, ext) });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : '读取文件失败');
    }
  }

  /** 读取本机绝对路径音频（兼容旧音源；移动端沙盒下可能不可读） */
  private async handleReadLocalFile(id: string, payload: unknown): Promise<void> {
    try {
      const p = payload as { path: string };
      const filePath = p.path || '';
      if (!filePath) throw new Error('未提供文件路径');

      const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error('不支持的音频格式：' + ext);
      if (filePath.includes('..')) throw new Error('路径遍历禁止');

      try {
        const st = await this.vaultAdapter.stat(filePath);
        if (st && st.size > MAX_AUDIO_FILE_BYTES) throw new Error('音频文件过大，无法加载');
      } catch (e) {
        // 沙盒下 stat 可能不可用；仅「过大」错误阻断，其余忽略继续读取
        if (e instanceof Error && e.message.includes('过大')) throw e;
      }

      const buffer = await this.vaultAdapter.readBinary(filePath);
      this.respond(id, { data: this.toDataUrl(buffer, ext) });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : '读取本地文件失败');
    }
  }

  /**
   * 画中卷通用文本文件协议。作用域严格限定在绑定的「画中卷」目录（默认 vault 根下
   * `画中卷/`），所有 path 都经 resolveScrollPath 归一化并禁止越界（路径遍历防护）。
   * 支持：
   *  - file:list   { dir? }                      → { files: [{name, path, mtime, size}] }
   *  - file:get    { path | filename }           → { content: string }
   *  - file:write  { path, content }             → { ok: true }
   *  - file:delete { path }                      → { ok: true }
   */
  private async handleFileOp(id: string, type: string, payload: unknown): Promise<void> {
    try {
      const p = (payload || {}) as { path?: string; filename?: string; content?: string; dir?: string };
      const adapter = this.vaultAdapter;
      const root = normalizePath('画中卷');

      // 目录确保存在（首次使用自动创建绑定目录）
      try { await adapter.mkdir(root); } catch { /* 已存在则忽略 */ }

      const resolveScrollPath = (raw: string | undefined): string => {
        const src = (raw || '').trim();
        if (!src) throw new Error('未提供文件路径');
        // 按「路径分段」判定 `..`，而不是子串包含：后者会误伤 `笔记..md` / `..备份.md`
        // 这类合法文件名（用户命名习惯里连续两个点并不罕见），导致正常文件被拒绝读写。
        // 分段相等判定既挡住真正的 `../` 越界，又放行含 `..` 的文件名。
        if (src.split(/[\\/]+/).some((seg) => seg === '..')) throw new Error('路径遍历禁止');
        const norm = normalizePath(src);
        // 允许以「画中卷」开头或相对，统一收敛到绑定目录内
        const full = norm.startsWith(root + '/') || norm === root
          ? norm
          : normalizePath(`${root}/${norm}`);
        if (!full.startsWith(root + '/') && full !== root) throw new Error('超出画中卷目录范围');
        return full;
      };

      if (type === 'file:list') {
        const dir = resolveScrollPath(p.dir || root);
        let entries;
        try {
          entries = await adapter.list(dir);
        } catch {
          // 目录暂不存（首次）视为空
          this.respond(id, { files: [] });
          return;
        }
        const files = [];
        for (const name of entries.files) {
          if (!name.toLowerCase().endsWith('.md')) continue;
          const fullPath = normalizePath(`${dir}/${name}`);
          try {
            const st = await adapter.stat(fullPath);
            files.push({ name, path: fullPath, mtime: st?.mtime ?? 0, size: st?.size ?? 0 });
          } catch {
            files.push({ name, path: fullPath, mtime: 0, size: 0 });
          }
        }
        files.sort((a, b) => b.mtime - a.mtime);
        this.respond(id, { files });
        return;
      }

      if (type === 'file:get') {
        const fullPath = resolveScrollPath(p.path || p.filename);
        if (!fullPath.toLowerCase().endsWith('.md')) throw new Error('仅支持 .md 文件');
        const content = await adapter.read(fullPath);
        this.respond(id, { content: content || '' });
        return;
      }

      if (type === 'file:write') {
        const fullPath = resolveScrollPath(p.path);
        if (!fullPath.toLowerCase().endsWith('.md')) throw new Error('仅支持 .md 文件');
        const content = typeof p.content === 'string' ? p.content : '';
        // 父目录确保存在（含子目录新建）
        const parent = fullPath.substring(0, fullPath.lastIndexOf('/'));
        if (parent && parent !== root) {
          try { await adapter.mkdir(parent); } catch { /* 已存在忽略 */ }
        }
        await adapter.write(fullPath, content);
        this.respond(id, { ok: true });
        return;
      }

      if (type === 'file:delete') {
        const fullPath = resolveScrollPath(p.path);
        if (!fullPath.toLowerCase().endsWith('.md')) throw new Error('仅支持 .md 文件');
        await adapter.remove(fullPath);
        this.respond(id, { ok: true });
        return;
      }

      this.respondError(id, '未知的 file 操作：' + type);
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : '文件操作失败');
    }
  }

  /** 代理外部音源链接：插件端 requestUrl 不受 webview CORS 限制（桌面/移动均支持） */
  private async handleProxyAudioUrl(id: string, payload: unknown): Promise<void> {
    try {
      const p = payload as { url: string };
      const url = p.url || '';
      if (!isValidAudioUrl(url)) throw new Error('非法音源链接（仅支持 http/https）');

      const resp = await requestUrl({ url, method: 'GET' });
      if (resp.status < 200 || resp.status >= 300) {
        throw new Error('音源访问失败 (HTTP ' + resp.status + ')');
      }
      const buffer = resp.arrayBuffer;
      if (!buffer) throw new Error('音源响应为空');

      const mime = (resp.headers && resp.headers['content-type']) || 'application/octet-stream';
      this.respond(id, { data: `data:${mime};base64,${arrayBufferToBase64(buffer)}` });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : '代理音源失败');
    }
  }

  /** ArrayBuffer → 带 MIME 的 base64 data URL */
  private toDataUrl(buffer: ArrayBuffer, ext: string): string {
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    return `data:${mime};base64,${arrayBufferToBase64(buffer)}`;
  }
}
