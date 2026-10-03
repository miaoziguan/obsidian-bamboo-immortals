import { ItemView, WorkspaceLeaf, EventRef } from 'obsidian';
import type { BambooReviewSettings } from '../settings/PluginSettings';
import { AppHost } from '../host/AppHost';
import { AppAPI } from '../host/AppAPI';
import type BambooReviewPlugin from '../../main';
import { LicenseStore } from '../license/licenseStore';

export const VIEW_TYPE_MODULE = 'bamboo-module';

/**
 * ModuleView - 竹林模块通用宿主视图
 *
 * 职责：
 * 1. 创建 iframe（blob URL）承载 webapp/module.html（模块专用精简入口，不含日报主体 / FAB）
 * 2. 把「本 leaf 承载哪个模块」（moduleId）注入 webapp，webapp 再经 module:load 取回代码执行
 * 3. 管理 AppHost / AppAPI 生命周期，并跟随 Obsidian 主题变化
 *
 * 为什么做成「通用宿主」而不是每个模块各注册一个视图类型：
 * 模块是用户按需下载的可选能力，代码不在主 bundle 内。若让模块动态 registerView，
 * 就要处理视图类型注册时机、Obsidian 生命周期与重启恢复（deferred view / 布局还原）等
 * 一串复杂度；改为所有模块共用本视图、用 state.moduleId 区分承载对象后，
 * 模块侧零注册成本，宿主 bundle 也不随模块数量膨胀。
 *
 * 与 ScrollView 同构：入口换成 module.html，上下文注入换成 moduleId。
 */
export class ModuleView extends ItemView {
  /** 打开入口暂存的模块 id（同 ScrollView.pendingFeature 的语义，只服务本次打开） */
  static pendingModuleId: string | null = null;

  private pluginDir: string;
  private plugin: unknown;
  private settings: BambooReviewSettings;
  private saveSettings: () => Promise<void>;

  private appHost: AppHost | null = null;
  private appAPI: AppAPI | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private cssChangeRef: EventRef | null = null;
  /** 本 leaf 承载的模块 id，per-leaf 存储以支持不同模块各开一个 leaf 并存 */
  private _moduleId: string = '';

  constructor(
    leaf: WorkspaceLeaf,
    pluginDir: string,
    _plugin: unknown,
    settings: BambooReviewSettings,
    saveSettings: () => Promise<void>
  ) {
    super(leaf);
    this.pluginDir = pluginDir;
    this.plugin = _plugin;
    this.settings = settings;
    this.saveSettings = saveSettings;
  }

  getViewType(): string {
    return VIEW_TYPE_MODULE;
  }

  getDisplayText(): string {
    return '竹林模块';
  }

  getIcon(): string {
    return 'package';
  }

  /** 本 leaf 当前承载的模块 id */
  getModuleId(): string {
    return this._moduleId;
  }

  /** 持久化本 leaf 承载的模块：Obsidian 序列化的是 view.getState()（而非 setViewState 入参），
   *  不重写则重启后 leaf 丢失 moduleId → 模块视图空白（同 ScrollView「打字机变香道」的坑）。 */
  getState(): Record<string, unknown> {
    return { moduleId: this._moduleId };
  }

  /** 自 workspace 布局恢复（重启后 Obsidian 调它回填模块 id），iframe 加载时据此注入。 */
  async setState(state: Record<string, unknown>): Promise<void> {
    if (state && typeof state === 'object') {
      if (typeof state.moduleId === 'string') this._moduleId = state.moduleId;
    }
  }

  /** 解析本 leaf 的模块 id：优先 leaf 视图状态（随布局持久化、重启后即由此还原），
   *  回退宿主 pending（同会话内打开入口写入）。 */
  private _resolveModuleContext(): void {
    const vs = this.leaf.getViewState() as { state?: { moduleId?: string } } | null;
    this._moduleId = vs?.state?.moduleId ?? ModuleView.pendingModuleId ?? '';
    // pending 是静态量、只服务「本次打开」，消费后立即清空：
    // 否则残留值会被后续重载或其它 leaf 误读（多模块并存时尤其危险）。
    ModuleView.pendingModuleId = null;
  }

  /** 向 iframe 推送模块上下文（load 完成时调用一次） */
  private _pushModuleContext(): void {
    const cw = this.iframe?.contentWindow;
    if (!cw) return;
    this._resolveModuleContext();
    cw.postMessage({ type: 'module:context', moduleId: this._moduleId }, '*');
  }

  async onOpen(): Promise<void> {
    const container: HTMLElement = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('bamboo-module-container');

    if (!this.pluginDir) {
      container.createDiv({
        text: '竹林修仙传: 无法定位插件目录',
        cls: 'bamboo-review-error',
      });
      return;
    }

    // 初始化 AppAPI（通信层）
    this.appAPI = this._createAppApi();
    await this.appAPI.ensureStructure();

    // 创建 AppHost（版本守卫 + blob URL 构建）
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);

    // 同 ArchiveView / ScrollView：onOpen 用 void 触发异步挂载，避免延迟视图加载超时
    void this._mountWebapp(container);
  }

  private async _mountWebapp(container: HTMLElement): Promise<void> {
    const loadingEl = container.createDiv({
      text: '模块加载中…',
      cls: 'bamboo-review-loading',
    });

    // 让 iframe 占满侧边栏/面板容器高度，否则内容会按高度塌陷
    container.setCssStyles({
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    });

    try {
      this.appAPI?.startListening();
      const appHost = this.appHost;
      if (!appHost) throw new Error('AppHost 未初始化');
      const blobUrl = await appHost.buildBlobUrl('module.html');

      // 视图可能已在加载期间被关闭
      if (!container.isConnected) {
        loadingEl.remove();
        return;
      }

      this.iframe = container.createEl('iframe', {
        cls: 'bamboo-review-frame',
        attr: {
          src: blobUrl,
        },
      });
      this.iframe.setCssStyles({
        flex: '1 1 auto',
        width: '100%',
        minHeight: '0',
        border: 'none',
      });

      // 模块 id 经 data: URL 的 #hash 在 Obsidian 中不稳定（同画中卷功能选型），
      // 改为 iframe 加载完成后由宿主主动 postMessage 注入。
      this.iframe.addEventListener('load', () => this._pushModuleContext());

      loadingEl.remove();
      this.appAPI?.bindIframe(this.iframe);
      // 握手补发：module.html 若被 gzip 包装、脚本晚于 load 才执行，load 那次注入会被漏收，
      // 由 app:ready 再来要一次上下文兜住（详见 AppAPI.onModuleContextRequest 注释）。
      if (this.appAPI) {
        this.appAPI.onModuleContextRequest = () => {
          this._resolveModuleContext();
          return { moduleId: this._moduleId };
        };
      }

      this.cssChangeRef = this.app.workspace.on('css-change', () => {
        this.appAPI?.onThemeChanged(this.settings.followObsidianTheme);
      });
    } catch (e) {
      loadingEl.remove();
      container.createDiv({
        text: `模块加载失败: ${e instanceof Error ? e.message : '未知错误'}`,
        cls: 'bamboo-review-error',
      });
    }
  }

  private _createAppApi(): AppAPI {
    const api = new AppAPI(
      this.app,
      this.settings,
      this.saveSettings,
      this.settings.noisePath || '',
      this.app.vault.configDir,
      (this.plugin as BambooReviewPlugin).license ??
        new LicenseStore(this.plugin as BambooReviewPlugin)
    );
    // 博客模块点文章 → 宿主自建竹杖芒鞋式阅读视图打开（中央）
    api.onOpenReader = (path: string) => {
      const plugin = this.plugin as { openReaderView?: (p: string) => Promise<void> };
      void plugin.openReaderView?.(path);
    };
    return api;
  }

  async onClose(): Promise<void> {
    if (this.cssChangeRef) {
      this.app.workspace.offref(this.cssChangeRef);
      this.cssChangeRef = null;
    }

    this.appAPI?.detach();
    this.appAPI = null;

    this.appHost?.destroy();
    this.appHost = null;

    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }

  /**
   * 重新加载 webapp（开发期热更新用）：卸载旧 iframe / 通信层 / 版本守卫，
   * 按最新磁盘 module.html 重建 iframe 的 blob URL。
   */
  async reloadWebapp(): Promise<void> {
    if (this.cssChangeRef) {
      this.app.workspace.offref(this.cssChangeRef);
      this.cssChangeRef = null;
    }
    this.appAPI?.detach();
    this.appAPI = null;
    this.appHost?.destroy();
    this.appHost = null;
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }

    const container = this.containerEl.children[1] as HTMLElement;
    if (!this.pluginDir) return;
    this.appAPI = this._createAppApi();
    await this.appAPI.ensureStructure();
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);
    await this._mountWebapp(container);
  }
}
