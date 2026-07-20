import { ItemView, WorkspaceLeaf, EventRef } from 'obsidian';
import type { BambooReviewSettings } from '../settings/PluginSettings';
import { AppHost } from '../host/AppHost';
import { AppAPI } from '../host/AppAPI';
import type { StrategyOverview } from '../ai/strategyOverview';
import type { CultivationRealm } from '../cultivation';

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
      this.app.vault.configDir
    );
    await this.appAPI.ensureStructure();

    // 战略复盘面板「用 AI 改进」入口：webapp 健康分详情 → 插件 Agentic 编辑链路
    this.appAPI.onAiImproveGoal = (payload) => {
      const plugin = this.plugin as
        | { requestAiImprove?: (p: typeof payload) => void }
        | undefined;
      plugin?.requestAiImprove?.(payload);
    };

    // 健康分单一数据源：webapp 通过 app:getHealthOverview 向插件请求权威健康快照，
    // 彻底消除插件(竹杖芒鞋)与前端(竹林修仙 webapp)各自计算导致的分数漂移。
    this.appAPI.setStrategyOverviewProvider(async () => {
      const plugin = this.plugin as
        | { getStrategyOverview?: () => Promise<StrategyOverview | null> }
        | undefined;
      return plugin?.getStrategyOverview ? plugin.getStrategyOverview() : null;
    });

    // 修行境界 / 竹币余额 / 可用竹币余额：同样以插件方法为单一数据源，经 AppAPI 暴露给 webapp 侧栏
    this.appAPI.setCultivationRealmProvider(async () => {
      const plugin = this.plugin as
        | { getCultivationRealm?: () => Promise<CultivationRealm | null> }
        | undefined;
      return plugin?.getCultivationRealm ? plugin.getCultivationRealm() : null;
    });
    this.appAPI.setBambooCoinBalanceProvider(async () => {
      const plugin = this.plugin as
        | { getBambooCoinBalance?: () => Promise<number | null> }
        | undefined;
      return plugin?.getBambooCoinBalance ? plugin.getBambooCoinBalance() : null;
    });
    this.appAPI.setBambooCoinAvailableBalanceProvider(async () => {
      const plugin = this.plugin as
        | { getBambooCoinAvailableBalance?: () => Promise<number | null> }
        | undefined;
      return plugin?.getBambooCoinAvailableBalance ? plugin.getBambooCoinAvailableBalance() : null;
    });

    // 扫描自定义主题
    const customThemes = await this.scanCustomThemes();
    this.appAPI.setCustomThemes(customThemes);

    // 创建 AppHost 并构建 blob URL
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);

    const loadingEl = container.createDiv({
      text: '竹林修仙传加载中…',
      cls: 'bamboo-review-loading',
    });

    try {
      this.appAPI.startListening();
      const blobUrl = await this.appHost.buildBlobUrl();

      this.iframe = container.createEl('iframe', {
        cls: 'bamboo-review-frame',
        attr: {
          src: blobUrl,
          allow: 'camera; microphone; clipboard-read; clipboard-write',
        },
      });

      loadingEl.remove();
      this.appAPI.bindIframe(this.iframe);

      this.cssChangeRef = this.app.workspace.on('css-change', () => {
        this.appAPI?.onThemeChanged(this.settings.followObsidianTheme);
      });
    } catch (e) {
      loadingEl.remove();
      container.createDiv({
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
