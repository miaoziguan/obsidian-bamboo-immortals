import { App, PluginSettingTab, Setting } from 'obsidian';
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
            const frame = activeDocument.querySelector('.bamboo-review-frame') as HTMLIFrameElement | null;
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
    const pluginTitle = pluginBox.createEl('p', { text: '插件简介', cls: 'bamboo-about-label' });
    const descEl = pluginBox.createEl('p', {
      text: 'Bamboo Immortals（竹林修仙传）是一款基于苏联控制论之父维克托·格卢什科夫提出的"OGAS"理念，专为个人打造的中国风目标自动化分配管理系统。',
      cls: 'bamboo-about-desc'
    });

    // ───── 卡片 2：作者 + 作品 ─────
    const authorBox = containerEl.createDiv({ cls: 'bamboo-about-card bamboo-about-author' });
    const authorRow = authorBox.createDiv({ cls: 'bamboo-about-author-row' });
    const avatar = authorRow.createDiv({ cls: 'bamboo-about-avatar' });
    avatar.setCssStyles({
      backgroundImage: 'url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAKAAoADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5UooooAKKKKACiiigAooo9KACiij0oAKKKPSgAooooAKKKKACiij0oAKKKXFACUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFLigUtADaKWkoAKUdKSlFACikNLSGgBKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopRQAlFLikoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAFFFLSGgBKKKKAClFJThQAlJTqbQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAopaQUtACUlLSUAFKKSlFAC0hoooASiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAWlpBS0AFNp1IaAEooooAKKKKACiiigAooooAKKKKACiiigApQKBThQACkNOxTWoAbRRRQAU4U2nCgApKdTTQAlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAKKWkFLQAlJTqbQAUopKUUAFFFJQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFKKAFFLSCloAKQ0tIaAG0UUUAFFFFABRRRQAUUUUAFFFFABSikpRQA4UopKBQAtIaWkNADKKKKACnLTaUUAOooooASm0402gAooooAKKKKACiiigAooooAKKKKACl7UlKKACilpDQAlKKSnUAFJS0dqAG0UUUAFFFFABRRRQAUUUUAFFFFABSikpwoASkpxptABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSik... [truncated]'
    });

    const authorInfo = authorRow.createDiv({ cls: 'bamboo-about-author-info' });
    const authorEl = authorInfo.createEl('p', { text: '羽鳞君', cls: 'bamboo-about-author-name' });
    const roleEl = authorInfo.createEl('p', { text: '喵字馆创始人', cls: 'bamboo-about-author-role' });

    // 作品区
    const worksTitle = authorBox.createEl('p', { text: 'Obsidian 插件作品', cls: 'bamboo-about-works-label' });
    const worksRow = authorBox.createDiv({ cls: 'bamboo-about-works-row' });

    ['竹叶飞刃', '竹林修仙传'].forEach(name => {
      const tag = worksRow.createEl('span', { text: name, cls: 'bamboo-about-tag' });
    });
  }
}
