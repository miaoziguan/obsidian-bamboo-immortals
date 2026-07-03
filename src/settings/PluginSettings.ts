import { App, PluginSettingTab, Setting } from 'obsidian';
import * as path from 'path';
import * as fs from 'fs';
import type BambooReviewPlugin from '../../main';
import { ThemeBridge } from '../bridge/ThemeBridge';

/** 插件设置接口 */
export interface BambooReviewSettings {
  /** 数据存储根路径 */
  dataPath: string;
  /** 是否自动生成 Markdown 摘要 */
  enableMarkdownSync: boolean;
  /** 板块管理配置（可见性 + 排序），用于 webapp iframe localStorage 不可靠时持久化 */
  sectionConfig: Record<string, unknown> | null;
  /** 自定义主题动效文件夹路径（Vault 根目录下的相对路径） */
  themePath: string;
  /** 白噪音文件夹路径（Vault 根目录下的相对路径，留空则扫描全库） */
  noisePath: string;
  /** 自定义白噪音音源列表（通过桥接持久化，克服 localStorage port-scoped 问题） */
  noiseItems: unknown[];
  /** 是否将 webapp 调色同步到 Obsidian 原生界面 */
  syncPaletteToObsidian: boolean;
}

export const DEFAULT_SETTINGS: BambooReviewSettings = {
  dataPath: 'bamboo-review',
  enableMarkdownSync: true,
  sectionConfig: null,
  themePath: '竹林复盘主题',
  noisePath: '',
  noiseItems: [],
  syncPaletteToObsidian: false,
};

/**
 * PluginSettings - Obsidian 原生设置面板
 */
export class PluginSettings extends PluginSettingTab {
  plugin: BambooReviewPlugin;

  constructor(app: App, plugin: BambooReviewPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('bamboo-review-settings');

    new Setting(containerEl).setName('竹林修仙传 - 设置').setHeading();

    // === 数据存储 ===
    new Setting(containerEl).setName('数据存储').setHeading();

    // 数据存储路径
    new Setting(containerEl)
      .setName('数据存储路径')
      .setDesc('复盘数据在 Vault 中的存储目录（修改后需重启插件）')
      .addText((text) =>
        text
          .setPlaceholder('bamboo-review')
          .setValue(this.plugin.settings.dataPath)
          .onChange(async (value) => {
            this.plugin.settings.dataPath = value || 'bamboo-review';
            await this.plugin.saveSettings();
          })
      );

    // Markdown 摘要同步
    new Setting(containerEl)
      .setName('自动生成 Markdown 摘要')
      .setDesc('每次保存复盘数据时，自动在 reviews/ 目录下生成可读的 .md 文件')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableMarkdownSync)
          .onChange(async (value) => {
            this.plugin.settings.enableMarkdownSync = value;
            await this.plugin.saveSettings();
          })
      );

    // === 主题动效 ===
    new Setting(containerEl).setName('主题动效').setHeading();

    new Setting(containerEl)
      .setName('自定义主题路径')
      .setDesc('Vault 根目录下存放自定义主题 .js 文件的文件夹（修改后需重启插件）')
      .addText((text) =>
        text
          .setPlaceholder('竹林复盘主题')
          .setValue(this.plugin.settings.themePath)
          .onChange(async (value) => {
            this.plugin.settings.themePath = value || '竹林复盘主题';
            await this.plugin.saveSettings();
          })
      );

    // === 白噪音 ===
    new Setting(containerEl).setName('白噪音').setHeading();

    new Setting(containerEl)
      .setName('白噪音文件夹')
      .setDesc('Vault 根目录下的相对路径，指定后仅扫描该文件夹内的音频文件。留空则扫描整个库（修改后需重启插件）')
      .addText((text) =>
        text
          .setPlaceholder('白噪音 或留空扫描全库')
          .setValue(this.plugin.settings.noisePath)
          .onChange(async (value) => {
            this.plugin.settings.noisePath = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // === 调色联动 ===
    new Setting(containerEl).setName('调色联动').setHeading();

    new Setting(containerEl)
      .setName('将调色同步到 Obsidian')
      .setDesc('打开后，webapp 内悬浮菜单的色相/明度调色会实时同步到 Obsidian 的原生界面配色')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.syncPaletteToObsidian)
          .onChange(async (value) => {
            this.plugin.settings.syncPaletteToObsidian = value;
            await this.plugin.saveSettings();
            if (!value) {
              ThemeBridge.restoreDefaults();
            }
            const frame = activeDocument.querySelector('.bamboo-review-frame');
            if (frame?.contentWindow) {
              frame.contentWindow.postMessage({
                type: 'theme:syncPaletteEnabled',
                id: 'settings_' + Date.now(),
                payload: { enabled: value }
              }, '*');
            }
          })
      );

    // 关于
    new Setting(containerEl).setName('关于').setHeading();

    // ───── 卡片 1：插件简介 ─────
    const pluginBox = containerEl.createDiv({ cls: 'bamboo-about-card' });
    pluginBox.createEl('p', { text: '插件简介', cls: 'bamboo-about-label' });
    pluginBox.createEl('p', {
      text: 'Bamboo Immortals（竹林修仙传）是一款基于苏联控制论之父维克托·格卢什科夫提出的"OGAS"理念，专为个人打造的中国风目标自动化分配管理系统。',
      cls: 'bamboo-about-desc'
    });

    // ───── 卡片 2：作者 + 作品 ─────
    const authorBox = containerEl.createDiv({ cls: 'bamboo-about-card bamboo-about-author' });
    const authorRow = authorBox.createDiv({ cls: 'bamboo-about-author-row' });
    const avatar = authorRow.createDiv({ cls: 'bamboo-about-avatar' });
    // 从插件目录读取头像文件（避免过长的 base64 被 Obsidian 截断导致空白）
    // 优先读插件根目录（dev/BRAT），其次从 webapp 资源中读取（插件市场安装）
    try {
      const pluginDir = (this.plugin.manifest as any).dir;
      const vaultBasePath = (this.app.vault.adapter as any).basePath || '';
      const candidates = [
        path.join(vaultBasePath, pluginDir, 'author-avatar.jpg'),               // dev / BRAT / release asset
        path.join(vaultBasePath, pluginDir, 'webapp', 'assets', 'images', 'author-avatar.jpg'), // webapp 内置
      ];
      for (const avatarPath of candidates) {
        if (fs.existsSync(avatarPath)) {
          const avatarData = fs.readFileSync(avatarPath);
          const b64 = avatarData.toString('base64');
          avatar.setCssStyles({
            backgroundImage: `url(data:image/jpeg;base64,${b64})`,
          });
          break;
        }
      }
    } catch { /* silently skip — show default empty avatar */ }


    const authorInfo = authorRow.createDiv({ cls: 'bamboo-about-author-info' });
    authorInfo.createEl('p', { text: '羽鳞君', cls: 'bamboo-about-author-name' });
    authorInfo.createEl('p', { text: '喵字馆创始人', cls: 'bamboo-about-author-role' });

    // 作品区
    authorBox.createEl('p', { text: 'Obsidian 插件作品', cls: 'bamboo-about-works-label' });
    const worksRow = authorBox.createDiv({ cls: 'bamboo-about-works-row' });

    [{ name: '竹叶飞刃', url: 'https://github.com/miaoziguan/obsidian-Bamboo-Darts' },
     { name: '竹林修仙传', url: 'https://github.com/miaoziguan/obsidian-bamboo-immortals' }].forEach(work => {
      const tag = worksRow.createEl('span', { text: work.name, cls: 'bamboo-about-tag' });
      if (work.url) {
        tag.style.cursor = 'pointer';
        tag.addEventListener('click', () => {
          window.open(work.url, '_blank');
        });
      }
    });

    // 联系方式
    const contactBox = containerEl.createDiv({ cls: 'bamboo-about-card' });
    contactBox.createEl('p', { text: '联系方式', cls: 'bamboo-about-label' });
    contactBox.createEl('p', { text: '邮箱：yanyulin2100@qq.com', cls: 'bamboo-about-desc' });
    contactBox.createEl('p', { text: '微信：yanhu94', cls: 'bamboo-about-desc' });
  }
}
