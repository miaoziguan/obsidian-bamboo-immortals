import { ItemView, WorkspaceLeaf, EventRef } from 'obsidian';
import type BambooReviewPlugin from '../../main';
import { VaultStorage } from '../storage/VaultStorage';
import { StorageBridge } from '../bridge/StorageBridge';
import { ThemeBridge } from '../bridge/ThemeBridge';
import { BridgeService } from '../bridge/BridgeService';
import type { BambooReviewSettings } from '../settings/PluginSettings';

export const VIEW_TYPE_DAILY_REVIEW = 'bamboo-immortals';

/**
 * DailyReviewView - 主视图
 *
 * 职责极简：
 * 1. 创建 iframe 承载 PWA
 * 2. 管理 BridgeService 生命周期
 * 3. 监听 Obsidian 主题变化并同步
 */
export class DailyReviewView extends ItemView {
  private bridgeService: BridgeService | null = null;
  private themeBridge: ThemeBridge | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private iframeErrorHandler: ((e: Event) => void) | null = null;
  private keydownForwarder: ((e: KeyboardEvent) => void) | null = null;
  private _checkInterval: number | null = null;
  private cssChangeRef: EventRef | null = null;
  private webappPath: string;
  private settings: BambooReviewSettings;
  private saveSettings: () => Promise<void>;

  private plugin: BambooReviewPlugin;

  constructor(leaf: WorkspaceLeaf, webappPath: string, plugin: BambooReviewPlugin, settings: BambooReviewSettings, saveSettings: () => Promise<void>) {
    super(leaf);
    this.webappPath = webappPath;
    this.plugin = plugin;
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

    if (!this.webappPath) {
      container.createEl('div', {
        text: '竹林修仙传: 无法定位 webapp 资源，请检查插件安装目录',
        cls: 'bamboo-review-error',
      });
      return;
    }

    // webapp 尚未就绪时显示 loading 占位，后台异步拉包解包
    if (!this.plugin.webappReady) {
      const statusEl = container.createEl('div', {
        text: '正在初始化竹林修仙传…',
        cls: 'bamboo-review-loading',
      });
      // 轮询等待就绪后加载 iframe
      let ticks = 0;
      this._checkInterval = window.setInterval(() => {
        ticks++;
        if (this.plugin.webappReady) {
          window.clearInterval(this._checkInterval!);
          this._checkInterval = null;
          container.empty();
          void this.setupIframe(container);
          return;
        }
        // 30 秒后提示网络较慢
        if (ticks === 60) {
          statusEl.setText('正在下载资源包，网络较慢请稍候…');
        }
        // 120 秒后提示可能失败
        if (ticks === 240) {
          statusEl.setText('资源包下载异常，请检查网络后重启 Obsidian');
        }
      }, 500);
      return;
    }

    await this.setupIframe(container);
  }

  private async setupIframe(container: HTMLElement): Promise<void> {
    // 创建 iframe - 不使用 sandbox，避免阻止 app:// 协议下的子资源加载
    this.iframe = container.createEl('iframe', {
      cls: 'bamboo-review-frame',
      attr: {
        src: this.webappPath,
        allow: 'camera; microphone; clipboard-read; clipboard-write',
      },
    });

    // iframe 加载失败时显示提示
    this.iframeErrorHandler = (_e: Event) => {
      console.error('[BambooReview] iframe failed to load:', this.webappPath);
    };
    this.iframe.addEventListener('error', this.iframeErrorHandler);

    // 当 iframe 处于焦点时，将 Ctrl/Cmd 快捷键转发给 Obsidian，
    // 确保命令面板（Ctrl/Cmd+P）、快速切换（Ctrl/Cmd+O）等全局快捷键仍然可用
    const obsidianDoc = activeDocument;
    let forwarding = false;
    this.keydownForwarder = (e: KeyboardEvent) => {
      if (forwarding) return;
      if (e.ctrlKey || e.metaKey) {
        forwarding = true;
        const evt = new KeyboardEvent('keydown', {
          key: e.key,
          code: e.code,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          bubbles: true,
          cancelable: true,
        });
        obsidianDoc.body.dispatchEvent(evt);
        forwarding = false;
      }
    };
    activeDocument.addEventListener('keydown', this.keydownForwarder, true);

    // 初始化桥接服务
    const storage = new VaultStorage(this.app);
    await storage.ensureStructure();

    const storageBridge = new StorageBridge(storage, this.settings.enableMarkdownSync);
    this.themeBridge = new ThemeBridge();
    this.bridgeService = new BridgeService(
      storageBridge,
      this.themeBridge,
      this.settings,
      this.saveSettings
    );

    // 扫描 Vault 中的自定义主题
    const customThemes = await this._scanCustomThemes();
    this.bridgeService.setCustomThemes(customThemes);

    // 传递库根目录路径（供白噪音库内音频扫描/读取使用）
    const vaultBasePath = (this.app.vault.adapter as unknown as { basePath: string }).basePath || '';
    if (vaultBasePath) {
      this.bridgeService.setVaultBasePath(vaultBasePath);
    }
    // 注入 Vault Adapter，用于 Vault API 替代 fs 进行文件扫描/验证
    this.bridgeService.setVaultAdapter(this.app.vault.adapter);
    // 传递白噪音文件夹路径
    if (this.settings.noisePath) {
      this.bridgeService.setNoisePath(this.settings.noisePath);
    }
    // 传递 Obsidian 配置目录名（支持用户自定义 .obsidian 名称）
    this.bridgeService.setConfigDir(this.app.vault.configDir);

    this.bridgeService.attach(this.iframe);
    this.themeBridge.attachIframe(this.iframe);

    // 监听 Obsidian 主题变化（含意境配色切换）
    // 开启「跟随 Obsidian 主题配色」时，把主题强调色反推的色相一并推给 iframe
    this.cssChangeRef = this.app.workspace.on('css-change', () => {
      this.themeBridge?.onThemeChanged(this.settings.followObsidianTheme);
    });
  }

  async onClose(): Promise<void> {
    // 清理轮询 interval
    if (this._checkInterval !== null) {
      window.clearInterval(this._checkInterval);
      this._checkInterval = null;
    }

    // 清理桥接服务
    this.bridgeService?.detach();
    this.bridgeService = null;

    // 清理主题监听
    if (this.cssChangeRef) {
      this.app.workspace.offref(this.cssChangeRef);
      this.cssChangeRef = null;
    }

    this.themeBridge?.detachIframe();
    this.themeBridge = null;

    // 清理 iframe error 监听器
    if (this.iframe && this.iframeErrorHandler) {
      this.iframe.removeEventListener('error', this.iframeErrorHandler);
      this.iframeErrorHandler = null;
    }

    // 清理键盘转发器
    if (this.keydownForwarder) {
      activeDocument.removeEventListener('keydown', this.keydownForwarder, true);
      this.keydownForwarder = null;
    }

    // 清理 iframe
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }

  /** 扫描 Vault 中的自定义主题 .js 文件（通过 Vault API，不经过 fs） */
  private async _scanCustomThemes(): Promise<Array<{ name: string; code: string }>> {
    const themes: Array<{ name: string; code: string }> = [];
    const adapter = this.app.vault.adapter;

    try {
      const themeDirName = this.settings.themePath || '竹林复盘主题';

      let themeDirFiles: string[];
      try {
        themeDirFiles = (await adapter.list(themeDirName)).files;
      } catch {
        return themes; // 目录不存在或不可读
      }

      for (const entry of themeDirFiles) {
        if (!entry.endsWith('.js')) continue;
        const filePath = `${themeDirName}/${entry}`;
        try {
          const code: string = await adapter.read(filePath);
          // 快速检查是否包含必需的 __bamboo_theme_ 标识符
          if (!code.includes('__bamboo_theme_')) {
            console.warn(`[BambooReview] 自定义主题 ${entry} 缺少 __bamboo_theme_ 标识符，已跳过`);
            continue;
          }
          themes.push({
            name: entry.replace(/\.js$/, ''),
            code
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[BambooReview] 读取自定义主题 ${entry} 失败:`, msg);
        }
      }

      if (themes.length > 0) {
        console.debug(`[BambooReview] 发现 ${themes.length} 个自定义主题:`, themes.map(t => t.name));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.debug('[BambooReview] 扫描自定义主题时出错:', msg);
    }

    return themes;
  }
}
