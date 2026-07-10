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
  /** 是否让插件配色跟随 Obsidian 主题（读取 --interactive-accent 反推色相） */
  followObsidianTheme: boolean;
}

export const DEFAULT_SETTINGS: BambooReviewSettings = {
  dataPath: 'bamboo-review',
  enableMarkdownSync: true,
  sectionConfig: null,
  themePath: '竹林复盘主题',
  noisePath: '',
  noiseItems: [],
  syncPaletteToObsidian: false,
  followObsidianTheme: true,
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
      .setName('跟随 Obsidian 主题配色')
      .setDesc('打开后，插件整体配色会跟随当前 Obsidian 主题的强调色（--interactive-accent）。切换 Bamboo China 的竹影 / 墨夜 / 胭脂 / 青绿等意境时，插件配色随之联动')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.followObsidianTheme)
          .onChange(async (value) => {
            this.plugin.settings.followObsidianTheme = value;
            await this.plugin.saveSettings();
            const frame = activeDocument.querySelector<HTMLIFrameElement>('.bamboo-review-frame');
            if (!frame?.contentWindow) return;
            if (value) {
              // 立即推送当前主题强调色反推的色相 + 侧边栏背景色温 + 文字色温
              const accent = getComputedStyle(activeDocument.body)
                .getPropertyValue('--interactive-accent')
                .trim();
              const hue = ThemeBridge.rgbToHue(accent);
              const sidebar = getComputedStyle(activeDocument.body)
                .getPropertyValue('--background-secondary')
                .trim();
              const bg = ThemeBridge.rgbToRgbString(sidebar);
              const textNormal = getComputedStyle(activeDocument.body)
                .getPropertyValue('--text-normal')
                .trim();
              const textNormalRgb = ThemeBridge.rgbToRgbString(textNormal);
              const textMuted = getComputedStyle(activeDocument.body)
                .getPropertyValue('--text-muted')
                .trim();
              const textMutedRgb = ThemeBridge.rgbToRgbString(textMuted);
              const payload: { isDark: boolean; hue?: number; bg?: string; textNormal?: string; textMuted?: string } = {
                isDark: activeDocument.body.classList.contains('theme-dark'),
              };
              if (hue !== null) payload.hue = hue;
              if (bg !== null) payload.bg = bg;
              if (textNormalRgb !== null) payload.textNormal = textNormalRgb;
              if (textMutedRgb !== null) payload.textMuted = textMutedRgb;
              frame.contentWindow.postMessage({
                type: 'theme:changed',
                id: 'settings_' + Date.now(),
                payload,
              }, '*');
            } else {
              // 关闭联动 → 通知 iframe 恢复用户手动调色
              frame.contentWindow.postMessage({
                type: 'theme:followDisabled',
                id: 'settings_' + Date.now(),
                payload: {},
              }, '*');
            }
          })
      );

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
            const frame = activeDocument.querySelector<HTMLIFrameElement>('.bamboo-review-frame');
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
    // 从插件目录读取头像（通过 Vault API 读取 .obsidian/plugins/ 下的自有资源）
    // fire-and-forget：头像非关键，加载失败静默显示默认空头像
    void (async () => {
      try {
        const pluginDir = this.plugin.manifest.dir ?? '';
        const adapter = this.app.vault.adapter;
        const candidates = [
          `${pluginDir}/author-avatar.jpg`,
          `${pluginDir}/webapp/assets/images/author-avatar.jpg`,
        ];
        for (const avatarPath of candidates) {
          const exists = await adapter.exists(avatarPath);
          if (!exists) continue;
          const avatarData = await adapter.readBinary(avatarPath);
          const b64 = Buffer.from(avatarData).toString('base64');
          avatar.setCssStyles({
            backgroundImage: `url(data:image/jpeg;base64,${b64})`,
          });
          break;
        }
      } catch { /* silently skip — show default empty avatar */ }
    })();


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
        tag.setCssStyles({ cursor: 'pointer' });
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
