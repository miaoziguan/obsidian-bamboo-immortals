import { ItemView, WorkspaceLeaf, EventRef, Notice } from 'obsidian';
import type { BambooReviewSettings, ScrollLocation } from '../settings/PluginSettings';
import { AppHost } from '../host/AppHost';
import { AppAPI } from '../host/AppAPI';
import type BambooReviewPlugin from '../../main';
import { LicenseStore } from '../license/licenseStore';

export const VIEW_TYPE_SCROLL = 'bamboo-scroll';

/**
 * ScrollView - 画中卷独立视图
 *
 * 职责：
 * 1. 创建 iframe（blob URL）承载 webapp/scroll.html（仅画中卷的精简入口）
 * 2. 管理 AppHost / AppAPI 生命周期（存储 + 主题同步；画中卷消费 vault 文件，无需健康分等 provider）
 * 3. 监听 Obsidian 主题变化并同步
 *
 * 与 ArchiveView 同构，但入口为 scroll.html，且只暴露 file:* 协议所需的存储层。
 */
export class ScrollView extends ItemView {
  /** 功能选择器暂存的选型（'typewriter'/'incense' 等），由宿主 openScroll* 写入，拼入 iframe blob URL 的 #hash */
  static pendingFeature: string | null = null;
  /** 视图内移动按钮 / 打开入口写入的当前停靠位置，供 iframe 加载后广播给 webapp 切布局 */
  static pendingLocation: ScrollLocation | null = null;
  private pluginDir: string;
  private plugin: unknown;
  private settings: BambooReviewSettings;
  private saveSettings: () => Promise<void>;

  private appHost: AppHost | null = null;
  private appAPI: AppAPI | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private cssChangeRef: EventRef | null = null;
  /** 本 leaf 所属功能（'incense' | 'typewriter'），per-leaf 存储以支持双 leaf 并存（替代原 static pendingFeature） */
  private _feature: string = 'incense';
  /** 本 leaf 当前停靠位置，per-leaf 存储（替代原 static pendingLocation） */
  private _location: ScrollLocation = 'center';

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
    return VIEW_TYPE_SCROLL;
  }

  getDisplayText(): string {
    return '画中卷';
  }

  getIcon(): string {
    return 'scroll';
  }

  async onOpen(): Promise<void> {
    const container: HTMLElement = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('bamboo-scroll-container');

    if (!this.pluginDir) {
      container.createDiv({
        text: '竹林修仙传: 无法定位插件目录',
        cls: 'bamboo-review-error',
      });
      return;
    }

    // 初始化 AppAPI（通信层），并通过构造参数传入 3-dot 移动回调，避免被 esbuild 当死代码摇掉
    this.appAPI = this._createAppApi();
    await this.appAPI.ensureStructure();

    // 创建 AppHost（版本守卫 + blob URL 构建）
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);

    // 同 ArchiveView：onOpen 用 void 触发异步挂载，避免延迟视图加载超时
    // 位置选择器（3-dot）已移入画布内（webapp scrollManager），故此处只挂载 iframe。
    void this._mountWebapp(container);
  }

  private async _mountWebapp(container: HTMLElement): Promise<void> {
    const loadingEl = container.createDiv({
      text: '画中卷加载中…',
      cls: 'bamboo-review-loading',
    });

    // 让 iframe 占满侧边栏/面板容器高度，否则内容会按高度塌陷，
    // 寻呼机被挤在顶部无法落底。
    container.setCssStyles({
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    });

    try {
      this.appAPI?.startListening();
      const blobUrl = await this.appHost!.buildBlobUrl('scroll.html');

      // 视图可能已在加载期间被关闭
      if (!container.isConnected) {
        loadingEl.remove();
        return;
      }

      this.iframe = container.createEl('iframe', {
        cls: 'bamboo-review-frame',
        attr: {
          src: blobUrl,
          allow: 'camera; microphone; clipboard-read; clipboard-write',
        },
      });
      this.iframe.setCssStyles({
        flex: '1 1 auto',
        width: '100%',
        minHeight: '0',
        border: 'none',
      });

      // 画中卷功能选型（typewriter/incense）经 data: URL 的 #hash 在 Obsidian 中不稳定，
      // 改为 iframe 加载完成后由宿主主动 postMessage 注入（与主题同步同机制）。
      this.iframe.addEventListener('load', () => {
        const cw = this.iframe?.contentWindow;
        if (!cw) return;
        // 本 leaf 的功能/位置：优先 leaf 视图状态（三圆点移动写入），回退宿主 pending（命令打开写入）。
        const vs = this.leaf.getViewState() as { state?: { feature?: string; location?: ScrollLocation } } | null;
        this._feature = vs?.state?.feature ?? ScrollView.pendingFeature ?? 'incense';
        this._location = vs?.state?.location ?? ScrollView.pendingLocation ?? 'center';
        cw.postMessage({ type: 'scroll:feature', feature: this._feature }, '*');
        cw.postMessage({ type: 'scroll:location', location: this._location }, '*');
      });

      loadingEl.remove();
      this.appAPI?.bindIframe(this.iframe);

      this.cssChangeRef = this.app.workspace.on('css-change', () => {
        this.appAPI?.onThemeChanged(this.settings.followObsidianTheme);
      });
    } catch (e) {
      loadingEl.remove();
      container.createDiv({
        text: `画中卷加载失败: ${e instanceof Error ? e.message : '未知错误'}`,
        cls: 'bamboo-review-error',
      });
    }
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

  /** 构造 AppAPI（通信层），含 3-dot 移动回调。onOpen 与 reloadWebapp 共用，避免逻辑分叉 */
  private _createAppApi(): AppAPI {
    return new AppAPI(
      this.app,
      this.settings,
      this.saveSettings,
      this.settings.noisePath || '',
      this.app.vault.configDir,
      (this.plugin as BambooReviewPlugin).license ??
        new LicenseStore(this.plugin as BambooReviewPlugin),
      (loc) => {
        void (async () => {
          try {
            const ws = this.app.workspace;
            const targetLoc = (loc as ScrollLocation) || 'center';
            // 记忆默认位置：下次「打开画中卷」沿用此栏
            this.settings.scrollDefaultLocation = targetLoc;
            await this.saveSettings();
            ScrollView.pendingLocation = targetLoc;
            this._location = targetLoc;
            let target: WorkspaceLeaf | null = null;
            if (targetLoc === 'left') target = ws.getLeftLeaf(false) || ws.getLeftLeaf(true);
            else if (targetLoc === 'right') target = ws.getRightLeaf(false) || ws.getRightLeaf(true);
            else target = ws.getLeaf(true);
            if (!target) {
              new Notice('无法移动画中卷', 3000);
              return;
            }
            await target.setViewState({
              type: VIEW_TYPE_SCROLL,
              state: { feature: this._feature ?? undefined, location: targetLoc },
              active: true,
            });
            this.leaf.detach();
          } catch {
            new Notice('画中卷移动失败', 3000);
          }
        })();
      }
    );
  }

  /**
   * 重新加载 webapp（开发期热更新用）：卸载旧 iframe / 通信层 / 版本守卫，
   * 按最新磁盘 scroll.html 重建 iframe 的 blob URL。
   *
   * 根因：画中卷 iframe 仅在 onOpen 挂载一次；插件热重载（Hot Reload / BRAT）后，
   * 该 leaf 往往沿用旧 bundle 的旧视图实例，其 iframe 仍指向旧 blob URL → 磁盘上的
   * CSS/JS 改动永远照不到运行中的视图。本方法让开发者在命令面板执行一次即可换上新构建，
   * 无需关闭/重开视图，也不必依赖热重载是否会重建视图实例。
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
    if (!this.pluginDir) {
      new Notice('画中卷：无法定位插件目录，重载失败', 4000);
      return;
    }
    this.appAPI = this._createAppApi();
    await this.appAPI.ensureStructure();
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);
    await this._mountWebapp(container);
  }

  /** 接收来自插件的导航/操作指令 */
  sendCommand(type: string): void {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage(
      { type, id: 'cmd_' + Date.now() },
      '*'
    );
  }
}
