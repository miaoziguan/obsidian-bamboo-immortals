import { ItemView, WorkspaceLeaf, EventRef } from 'obsidian';
import type { BambooReviewSettings } from '../settings/PluginSettings';
import { AppHost } from '../host/AppHost';
import { AppAPI } from '../host/AppAPI';

export const VIEW_TYPE_DAILY_REVIEW = 'bamboo-immortals';

/**
 * DailyReviewView - 主视图
 *
 * 职责：
 * 1. 创建 iframe（blob URL）承载 webapp
 * 2. 管理 AppHost / AppAPI 生命周期
 * 3. 监听 Obsidian 主题变化并同步
 */
export class DailyReviewView extends ItemView {
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
    return VIEW_TYPE_DAILY_REVIEW;
  }

  getDisplayText(): string {
    return '竹林修仙传';
  }

  getIcon(): string {
    return 'leaf';
  }

  async onOpen(): Promise<void> {
    const container: HTMLElement = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('bamboo-review-container');

    if (!this.pluginDir) {
      container.createEl('div', {
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
      this.app.vault.configDir
    );
    await this.appAPI.ensureStructure();

    // 扫描自定义主题
    const customThemes = await this.scanCustomThemes();
    this.appAPI.setCustomThemes(customThemes);

    // 创建 AppHost 并构建 blob URL（传入插件版本用于 webapp 缺失时自举下载）
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);

    // 加载态占位：webapp 体积较大，构建 blob（必要时联网下载）期间先展示，避免空白
    const loadingEl = container.createEl('div', {
      text: '竹林修仙传加载中…',
      cls: 'bamboo-review-loading',
    });

    try {
      const blobUrl = await this.appHost.buildBlobUrl();

      this.iframe = container.createEl('iframe', {
        cls: 'bamboo-review-frame',
        attr: {
          src: blobUrl,
          allow: 'camera; microphone; clipboard-read; clipboard-write',
        },
      });

      // blob 就绪后移除加载态
      loadingEl.remove();

      // 绑定通信
      this.appAPI.attach(this.iframe);

      // 监听 Obsidian 主题变化
      this.cssChangeRef = this.app.workspace.on('css-change', () => {
        this.appAPI?.onThemeChanged(this.settings.followObsidianTheme);
      });
    } catch (e) {
      loadingEl.remove();
      console.error('[BambooReview] 加载 webapp 失败:', e);
      container.createEl('div', {
        text: `竹林修仙传加载失败: ${e instanceof Error ? e.message : '未知错误'}`,
        cls: 'bamboo-review-error',
      });
    }
  }

  async onClose(): Promise<void> {
    // 清理主题监听
    if (this.cssChangeRef) {
      this.app.workspace.offref(this.cssChangeRef);
      this.cssChangeRef = null;
    }

    // 清理通信层
    this.appAPI?.detach();
    this.appAPI = null;

    // 清理 blob URL
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
            console.warn(`[BambooReview] 自定义主题 ${entry} 缺少 __bamboo_theme_ 标识符，已跳过`);
            continue;
          }
          themes.push({ name: entry.replace(/\.js$/, ''), code });
        } catch (err: unknown) {
          console.error(`[BambooReview] 读取自定义主题 ${entry} 失败:`, err instanceof Error ? err.message : String(err));
        }
      }

      if (themes.length > 0) {
        console.debug(`[BambooReview] 发现 ${themes.length} 个自定义主题:`, themes.map(t => t.name));
      }
    } catch (err: unknown) {
      console.debug('[BambooReview] 扫描自定义主题时出错:', err instanceof Error ? err.message : String(err));
    }

    return themes;
  }
}
