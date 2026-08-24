import { ItemView, WorkspaceLeaf, EventRef, Notice } from 'obsidian';
import type { BambooReviewSettings } from '../settings/PluginSettings';
import { AppHost } from '../host/AppHost';
import { AppAPI } from '../host/AppAPI';
import type { StrategyOverview } from '../ai/strategyOverview';
import type { CultivationRealm } from '../cultivation';
import type BambooReviewPlugin from '../../main';
import { LicenseStore } from '../license/licenseStore';

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
  /** 从侧边栏移到中央后待恢复的布局模式（重建视图后 app:ready 带回 webapp） */
  private pendingLayoutMode: string | null = null;
  /** 视图是否由系统从侧边栏移到中央（恢复纵向时据此决定是否移回右栏） */
  private cameFromSidebar = false;

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

  /** 视图状态持久化：重建（侧边栏↔中央）时恢复布局模式与来源标记 */
  getState(): Record<string, unknown> {
    return {
      pendingLayoutMode: this.pendingLayoutMode ?? null,
      cameFromSidebar: this.cameFromSidebar || false,
    };
  }

  async setState(state: Record<string, unknown>): Promise<void> {
    if (state && typeof state === 'object') {
      if (typeof state.pendingLayoutMode === 'string') {
        this.pendingLayoutMode = state.pendingLayoutMode;
      }
      if (state.cameFromSidebar) {
        this.cameFromSidebar = true;
      }
    }
  }

  async onOpen(): Promise<void> {
    // 持久化「面板开着」标记：插件热更新被核心 detach 后，新实例据此自动恢复面板
    this.settings.reviewViewOpen = true;
    void this.saveSettings();

    // 从侧边栏移到中央的重建视图：读取待恢复的布局模式与来源标记
    //（getState/setState 已由 Obsidian 在 setViewState 时自动调用恢复）
    if (this.pendingLayoutMode || this.cameFromSidebar) {
      // 待恢复状态已在 getState/setState 中处理，无需额外日志
    }

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
      this.app.vault.configDir,
      (this.plugin as BambooReviewPlugin).license ??
        new LicenseStore(this.plugin as BambooReviewPlugin)
    );
    await this.appAPI.ensureStructure();

    // 激活成功（webapp 遮罩内输入激活码并经宿主校验通过）→ webapp 侧 licenseGate.js 会自行移除遮罩并解锁
    this.appAPI.onLicenseActivated = () => {
      new Notice('竹林修仙传：激活成功，全部功能已解锁 🎋', 4000);
    };

    // 视图是否在主工作区（中央）：webapp 进入横向/看板模式时据此决定是否请求移动。
    // 用 leaf 容器是否位于左右侧边栏（Obsidian 固定布局类）判定，稳定可靠。
    this.appAPI.isMainLeaf = () => {
      try {
        const el = this.leaf.view.containerEl;
        const inSidebar = el.closest('.mod-left-split, .mod-right-split') !== null;
        return !inSidebar;
      } catch {
        return true;
      }
    };

    // 侧边栏点横向/看板 → 原位移动到主工作区（不重建视图，app.workspace.moveLeaf 为运行时 API，
    // 未声明于 d.ts，故做类型断言 + 功能检测；缺失时回退为提示用户手动移动）
    this.appAPI.moveToCenter = (mode?: string) => {
      const isMain = this.appAPI?.isMainLeaf?.() ?? true;
      // 已在主工作区（中央）：无需移动
      if (isMain) return;
      void this.moveViewToCenter(mode || 'horizontal');
    };
    // 重建视图（侧边栏移中央）后，webapp app:ready 时带回待恢复的布局模式
    this.appAPI.getPendingLayoutMode = () => {
      const m = this.pendingLayoutMode;
      // 一次性消费：取走后清空，避免后续重载重复恢复
      this.pendingLayoutMode = null;
      return m;
    };
    // 恢复纵向 → 移回右侧栏（仅当视图由系统从侧栏移来）
    this.appAPI.moveToSidebar = () => {
      if (!this.cameFromSidebar) return;
      void this.moveViewToSidebar();
    };

    // 战略复盘面板「用 AI 改进」入口：webapp 健康分详情 → 插件 Agentic 编辑链路
    this.appAPI.onAiImproveGoal = (payload) => {
      const plugin = this.plugin as
        | { requestAiImprove?: (p: typeof payload) => void }
        | undefined;
      plugin?.requestAiImprove?.(payload);
    };

    // 目标归档入口：webapp 目标地图 → 插件打开归档独立页
    this.appAPI.onOpenArchive = () => {
      const plugin = this.plugin as { openArchive?: () => Promise<void> } | undefined;
      void plugin?.openArchive?.();
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

    console.time('DailyReviewView-onOpen');
    // 扫描自定义主题
    const scanTimer = 'DailyReviewView-scanCustomThemes';
    console.time(scanTimer);
    console.time('DailyReviewView-onOpen');
    const customThemes = await this.scanCustomThemes();
    console.timeEnd(scanTimer);
    this.appAPI.setCustomThemes(customThemes);

    // 创建 AppHost（版本守卫 + blob URL 构建都延迟到 _mountWebapp，避免阻塞 onOpen）
    const version = (this.plugin as { manifest?: { version?: string } } | undefined)?.manifest?.version ?? '';
    this.appHost = new AppHost(this.app, this.pluginDir, version);

    // 移动端视图片以「延迟视图(deferred view)」加载：onOpen 若被首次联网下载 webapp
    // 阻塞过久，会触发 Obsidian 的 "Failed to load deferred view Timeout" 直接抛弃视图，
    // 表现为永久卡在「加载中」。故把耗时挂载拆到独立异步方法，onOpen 用 void 触发后
    // 立即返回，延迟视图超时阈值内立起空容器；webapp 就绪后再填充 iframe（桌面同效）。
    void this._mountWebapp(container);
    console.timeEnd('DailyReviewView-onOpen');
  }

  /**
   * 异步挂载 webapp：先立起 loading 容器、建立通信层，再 await buildBlobUrl
   * （首次安装/升级可能联网下载 1MB webapp.zip）拿到 blobUrl 并赋予 iframe.src。
   * 由 onOpen 以 void 调用，避免阻塞延迟视图加载超时。
   */
  private async _mountWebapp(container: HTMLElement): Promise<void> {
    const loadingEl = container.createDiv({
      text: '竹林修仙传加载中…',
      cls: 'bamboo-review-loading',
    });

    try {
      this.appAPI?.startListening();
      const blobTimer = 'DailyReviewView-buildBlobUrl';
      console.time(blobTimer);
      const blobUrl = await this.appHost!.buildBlobUrl();
      console.timeEnd(blobTimer);

      // 视图可能已在加载期间被关闭
      if (!container.isConnected) {
        loadingEl.remove();
        return;
      }

      // 先创建 iframe 并绑定通信层，再赋予 src —— 确保 webapp 启动发来的
      // app:ready 到达时 this.iframe 已就绪，避免 onMessage 因 source 校验不通过
      // 而丢弃握手（握手失败时 store 首屏会退化为空/离线数据，需重启才恢复）。
      this.iframe = container.createEl('iframe', {
        cls: 'bamboo-review-frame',
        attr: {
          allow: 'camera; microphone; clipboard-read; clipboard-write',
        },
      });
      this.appAPI?.bindIframe(this.iframe);
      loadingEl.remove();

      this.iframe.src = blobUrl;

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


  /**
   * 把视图移动到中央工作区（方案 Y：重建视图 + 恢复布局模式）。
   * app.workspace.moveLeaf 运行时不存在，故用官方 API：
   * getLeaf(true)（中央新 leaf）→ setViewState(本视图，state 携带待恢复模式) → detach 旧 leaf。
   */
  private async moveViewToCenter(mode: string): Promise<void> {
    try {
      const ws = this.app.workspace;
      const targetLeaf = ws.getLeaf(true);
      if (!targetLeaf) {
        new Notice('无法移动到中央工作区', 3000);
        return;
      }
      // 在目标 leaf 上打开本视图，state 携带待恢复的布局模式 + 来源标记
      await targetLeaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        state: { pendingLayoutMode: mode, cameFromSidebar: true },
        active: true,
      });
      // 关闭原侧边栏 leaf
      this.leaf.detach();
    } catch {
      new Notice('请将视图移至中央工作区以获得最佳横向布局体验', 3000);
    }
  }

  /** 把视图移回右侧栏（方案 Y 反向：getRightLeaf + setViewState + detach 旧 leaf） */
  private async moveViewToSidebar(): Promise<void> {
    try {
      const ws = this.app.workspace;
      const rightLeaf = ws.getRightLeaf(false) || ws.getRightLeaf(true);
      if (!rightLeaf) {
        new Notice('无法移动到右侧栏', 3000);
        return;
      }
      // 在右栏 leaf 上打开本视图（纵向为默认布局，无需恢复模式）
      await rightLeaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        active: true,
      });
      this.leaf.detach();
    } catch {
      // 移回侧栏失败：静默兜底
    }
  }

  async onClose(): Promise<void> {
    // 注意：热更新（Obsidian 先调 onClose 后调插件 onunload）时，若在此清除
    // reviewViewOpen 标记，重载后会误判「面板没开过」而不恢复面板。
    // 因此 onClose 一律不清除标记；用户主动关闭由 main.ts 的 layout-change
    // 检测（延迟一帧避开热更新瞬时 detach）负责清除。

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
