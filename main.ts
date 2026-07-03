import { Plugin, WorkspaceLeaf } from 'obsidian';
import * as path from 'path';
import { DailyReviewView, VIEW_TYPE_DAILY_REVIEW } from './src/views/DailyReviewView';
import { LocalServer } from './src/server/LocalServer';
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
  private localServer: LocalServer | null = null;
  private serverUrl = '';

  async onload(): Promise<void> {
    // 加载设置
    await this.loadSettings();

    // 启动本地 HTTP 服务器
    const pluginDir = (this.manifest as any).dir;
    if (pluginDir) {
      const vaultBasePath = (this.app.vault.adapter as any).basePath || '';
      const webappDir = path.join(vaultBasePath, pluginDir, 'webapp');
      this.localServer = new LocalServer(webappDir);
      try {
        await this.localServer.start();
        this.serverUrl = this.localServer.getUrl();
        // 把库根目录传给 LocalServer，供 /bamboo-audio 音频代理使用
        this.localServer.setVaultBasePath(vaultBasePath);
      } catch (e) {
        console.error('[BambooReview] Failed to start local server:', e);
        new Notice('竹林修仙传: 本地服务启动失败，部分功能（白噪音、主题动效）可能不可用', 0);
      }
    }

    // 注册 View
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf: WorkspaceLeaf) => {
      return new DailyReviewView(leaf, this.serverUrl, this.settings, () => this.saveSettings());
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
      callback: () => this.sendToIframe('nav:prevDay'),
    });

    this.addCommand({
      id: 'navigate-next-day',
      name: '后一天',
      callback: () => this.sendToIframe('nav:nextDay'),
    });

    this.addCommand({
      id: 'navigate-today',
      name: '回到今天',
      callback: () => this.sendToIframe('nav:today'),
    });

    this.addCommand({
      id: 'open-stats',
      name: '打开统计分析',
      callback: () => this.sendToIframe('action:openStats'),
    });

    this.addCommand({
      id: 'open-settings-in-app',
      name: '打开应用设置',
      callback: () => this.sendToIframe('action:openSettings'),
    });

    // 注册设置面板
    this.addSettingTab(new PluginSettings(this.app, this));

    // 添加左侧 Ribbon 图标
    this.addRibbonIcon('leaf', '竹林修仙传', () => {
      void this.activateView();
    });
  }

  onunload(): void {
    void this.localServer?.stop();
    this.localServer = null;
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

  /** 向 iframe 发送导航/操作指令 */
  private sendToIframe(type: string): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length === 0) return;

    const view = leaves[0].view as DailyReviewView;
    const iframe = (view as any).iframe as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      let origin = '*';
      try { origin = new URL(iframe.src).origin; } catch { /* keep '*' */ }
      iframe.contentWindow.postMessage(
        { type, id: 'cmd_' + Date.now() },
        origin
      );
    }
  }

  /** 加载设置 */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /** 保存设置 */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
