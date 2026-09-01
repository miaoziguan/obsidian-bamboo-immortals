import { ItemView, WorkspaceLeaf, EventRef } from 'obsidian';
import type { BambooReviewSettings } from '../settings/PluginSettings';
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
  private pluginDir: string;
  private plugin: unknown;
  private settings: BambooReviewSettings;
  private saveSettings: () => Promise<void>;

  private appHost: AppHost | null = null;
  private appAPI: AppAPI | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private cssChangeRef: EventRef | null = null;

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

    // 初始化 AppAPI（通信层）
    this.appAPI = new AppAPI(
      this.app,
      this.settings,
      this.saveSettings,
      this.settings.noisePath || '',
      this.app.vault.configDir,
      (this.plugin as BambooReviewPlugin).license ??
        new LicenseStore(this.plugin as BambooReviewPlugin)
    );
    await this.appAPI.ensureStructure();

    // 创建 AppHost（版本守卫 + blob URL 构建）
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);

    // 同 ArchiveView：onOpen 用 void 触发异步挂载，避免延迟视图加载超时
    void this._mountWebapp(container);
  }

  private async _mountWebapp(container: HTMLElement): Promise<void> {
    const loadingEl = container.createDiv({
      text: '画中卷加载中…',
      cls: 'bamboo-review-loading',
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

  /** 接收来自插件的导航/操作指令 */
  sendCommand(type: string): void {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage(
      { type, id: 'cmd_' + Date.now() },
      '*'
    );
  }
}
