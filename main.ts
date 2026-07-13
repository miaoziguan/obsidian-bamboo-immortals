import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DailyReviewView, VIEW_TYPE_DAILY_REVIEW } from './src/views/DailyReviewView';
import { AppHost } from './src/host/AppHost';
import { ThemeBridge } from './src/bridge/ThemeBridge';
import {
  PluginSettings,
  DEFAULT_SETTINGS,
  type BambooReviewSettings,
} from './src/settings/PluginSettings';

/**
 * BambooReviewPlugin - 竹林修仙传 Obsidian 插件入口
 *
 * 职责：
 * 1. 注册 View 类型
 * 2. 注册命令（打开复盘、前/后一天、统计面板）
 * 3. 注册设置面板
 * 4. 管理插件生命周期
 */
export default class BambooReviewPlugin extends Plugin {
  settings: BambooReviewSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    // 加载设置
    await this.loadSettings();

    const pluginDir = this.manifest.dir || '';
    const version = this.manifest.version || '';

    // 后台预拉取 webapp：插件加载即触发，打开视图前大概率已就绪，消除「打开空白」体感。
    // 失败不阻塞 onload，打开视图时 buildBlobUrl 会再次尝试。
    void AppHost.prefetch(this.app, pluginDir, version);

    // 注册 View（传递 pluginDir 供 ItemView 加载 webapp 静态资源）
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf: WorkspaceLeaf) => {
      return new DailyReviewView(leaf, pluginDir, this, this.settings, () => this.saveSettings());
    });

    // 注册命令
    this.addCommand({
      id: 'open-daily-review',
      name: '打开今日复盘',
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: 'navigate-prev-day',
      name: '前一天',
      callback: () => this.sendToWebapp('nav:prevDay'),
    });

    this.addCommand({
      id: 'navigate-next-day',
      name: '后一天',
      callback: () => this.sendToWebapp('nav:nextDay'),
    });

    this.addCommand({
      id: 'navigate-today',
      name: '回到今天',
      callback: () => this.sendToWebapp('nav:today'),
    });

    this.addCommand({
      id: 'open-stats',
      name: '打开统计分析',
      callback: () => this.sendToWebapp('action:openStats'),
    });

    this.addCommand({
      id: 'open-settings-in-app',
      name: '打开应用设置',
      callback: () => this.sendToWebapp('action:openSettings'),
    });

    // 注册设置面板
    this.addSettingTab(new PluginSettings(this.app, this));

    // 添加左侧 Ribbon 图标
    this.addRibbonIcon('leaf', '竹林修仙传', () => {
      void this.activateView();
    });
  }

  onunload(): void {
    ThemeBridge.restoreDefaults();
  }

  /** 激活或创建复盘视图 */
  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);

    if (leaves.length > 0) {
      // 已有视图，直接聚焦
      leaf = leaves[0];
    } else {
      // 创建新视图
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        active: true,
      });
    }

    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }

  /** 向 webapp 发送导航/操作指令（Phase 3 将替换为直接 API 调用） */
  private sendToWebapp(type: string): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length === 0) return;

    const view = leaves[0].view as DailyReviewView;
    view.sendCommand(type);
  }

  /** 加载设置 */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as BambooReviewSettings;
  }

  /** 保存设置 */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
