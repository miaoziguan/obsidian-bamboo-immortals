import { ItemView, WorkspaceLeaf, EventRef } from 'obsidian';
import type { BambooReviewSettings } from '../settings/PluginSettings';
import { AppHost } from '../host/AppHost';
import { AppAPI } from '../host/AppAPI';
import type BambooReviewPlugin from '../../main';
import { LicenseStore } from '../license/licenseStore';

export const VIEW_TYPE_ARCHIVE = 'bamboo-archive';

/**
 * ArchiveView - 目标归档独立页
 *
 * 职责：
 * 1. 创建 iframe（blob URL）承载 webapp/archive.html
 * 2. 管理 AppHost / AppAPI 生命周期（仅存储 + 主题同步）
 * 3. 监听 Obsidian 主题变化并同步
 *
 * 与 DailyReviewView 相比，去除了日期导航、健康分、修行境界等 provider，
 * 因为归档页只消费 goals.json，不依赖每日数据。
 */
export class ArchiveView extends ItemView {
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
    return VIEW_TYPE_ARCHIVE;
  }

  getDisplayText(): string {
    return '目标归档';
  }

  getIcon(): string {
    return 'archive';
  }

  async onOpen(): Promise<void> {
    const container: HTMLElement = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('bamboo-archive-container');

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

    // 扫描自定义主题
    const customThemes = await this.scanCustomThemes();
    this.appAPI.setCustomThemes(customThemes);

    // 创建 AppHost 并构建 blob URL（加载 archive.html）
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);

    const loadingEl = container.createDiv({
      text: '目标归档加载中…',
      cls: 'bamboo-review-loading',
    });

    // 移动端延迟视图超时规避：onOpen 尽快返回，先同步建好 iframe + 通信层，
    // 耗时的 buildBlobUrl（可能联网下载 webapp）异步完成后再赋 src。
    this.appAPI.startListening();

    this.iframe = container.createEl('iframe', {
      cls: 'bamboo-review-frame',
      attr: {
        allow: 'camera; microphone; clipboard-read; clipboard-write',
      },
    });
    this.appAPI.bindIframe(this.iframe);

    this.cssChangeRef = this.app.workspace.on('css-change', () => {
      this.appAPI?.onThemeChanged(this.settings.followObsidianTheme);
    });

    this.appHost.buildBlobUrl('archive.html')
      .then((blobUrl) => {
        if (!this.iframe) return;
        this.iframe.src = blobUrl;
        loadingEl.remove();
      })
      .catch((e) => {
        loadingEl.remove();
        container.createDiv({
          text: `目标归档加载失败: ${e instanceof Error ? e.message : '未知错误'}`,
          cls: 'bamboo-review-error',
        });
      });
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

  /** 扫描 Vault 中的自定义主题 */
  private async scanCustomThemes(): Promise<Array<{ name: string; code: string }>> {
    const themes: Array<{ name: string; code: string }> = [];
    const adapter = this.app.vault.adapter;

    try {
      const themeDirName = this.settings.themePath || '竹林复盘主题';
      let themeDirFiles: string[];
      try {
        themeDirFiles = (await adapter.list(themeDirName)).files;
      } catch {
        return themes;
      }

      for (const entry of themeDirFiles) {
        if (!entry.endsWith('.js')) continue;
        const filePath = `${themeDirName}/${entry}`;
        try {
          const code: string = await adapter.read(filePath);
          if (!code.includes('__bamboo_theme_')) {
            continue;
          }
          themes.push({ name: entry.replace(/\.js$/, ''), code });
        } catch {
          // 读取失败跳过该主题
        }
      }
    } catch {
      // 扫描自定义主题出错时返回已收集的主题
    }

    return themes;
  }
}
