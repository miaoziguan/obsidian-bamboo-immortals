import { App, PluginSettingTab, Setting, type SettingDefinitionItem } from 'obsidian';
import type BambooReviewPlugin from '../../main';
import { ThemeBridge } from '../bridge/ThemeBridge';
import { arrayBufferToBase64 } from '../utils/base64';

/** Obsidian 插件运行时注入的主窗口 document（非 iframe 内的 document） */
declare const activeDocument: Document;

/** 自定义白噪音音源 */
export interface NoiseItem {
  id: string;
  name: string;
  type: 'url' | 'vault' | 'generated';
  url?: string;
  path?: string;
  volume?: number;
}

/** 插件设置接口 */
export interface BambooReviewSettings {
  /** 数据存储根路径 */
  dataPath: string;
  /** 是否自动生成 Markdown 摘要 */
  enableMarkdownSync: boolean;
  /** 板块管理配置（JSON 解析后结构不固定，使用宽松类型） */
  sectionConfig: Record<string, unknown> | null;
  /** 自定义主题动效文件夹路径（Vault 根目录下的相对路径） */
  themePath: string;
  /** 白噪音文件夹路径（Vault 根目录下的相对路径，留空则扫描全库） */
  noisePath: string;
  /** 自定义白噪音音源列表 */
  noiseItems: NoiseItem[];
  /** 是否将 webapp 调色同步到 Obsidian 原生界面 */
  syncPaletteToObsidian: boolean;
  /** 是否让插件配色跟随 Obsidian 主题（读取 --interactive-accent 反推色相） */
  followObsidianTheme: boolean;
  /** 是否启用 AI 自然语言规划（笔记 → 目标卡片） */
  aiEnabled: boolean;
  /** AI 服务 API Key（Bearer 鉴权） */
  aiApiKey: string;
  /** AI 服务 Base URL（不含 /chat/completions 后缀，如 https://api.deepseek.com/v1） */
  aiBaseUrl: string;
  /** 模型名（如 deepseek-chat） */
  aiModel: string;
  /** 默认拆解粒度：粗(2-3) / 中(3-6) / 细(5-8) 子项 */
  aiDecomposeDepth: '粗' | '中' | '细';
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
  aiEnabled: false,
  aiApiKey: '',
  aiBaseUrl: 'https://api.deepseek.com/v1',
  aiModel: 'deepseek-chat',
  aiDecomposeDepth: '中',
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
              ThemeBridge.default.restoreDefaults();
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

    // === AI 规划 ===
    new Setting(containerEl).setName('AI 规划（自然语言 → 目标卡片）').setHeading();

    new Setting(containerEl)
      .setName('启用 AI 规划')
      .setDesc('开启后，可在笔记中运行「AI 规划：将当前笔记转为目标卡片」命令，由大模型拆解目标并写入复盘。')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.aiEnabled)
          .onChange(async (value) => {
            this.plugin.settings.aiEnabled = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('大模型服务鉴权密钥（Bearer Token）。仅保存在本库 settings.json，不上传。')
      .addText((text) =>
        text
          .setPlaceholder('sk-...')
          .setValue(this.plugin.settings.aiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.aiApiKey = value.trim();
            await this.plugin.saveSettings();
          })
      )
      .then((setting) => {
        // 密码框样式：输入隐藏
        const input = setting.controlEl.querySelector('input');
        if (input) input.type = 'password';
      });

    new Setting(containerEl)
      .setName('Base URL')
      .setDesc('API 基地址（不含 /chat/completions 后缀）。默认 DeepSeek v1。')
      .addText((text) =>
        text
          .setPlaceholder('https://api.deepseek.com/v1')
          .setValue(this.plugin.settings.aiBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.aiBaseUrl = value.trim() || 'https://api.deepseek.com/v1';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('模型')
      .setDesc('模型名，如 deepseek-chat / gpt-4o-mini。需兼容 OpenAI Chat Completions JSON 模式。')
      .addText((text) =>
        text
          .setPlaceholder('deepseek-chat')
          .setValue(this.plugin.settings.aiModel)
          .onChange(async (value) => {
            this.plugin.settings.aiModel = value.trim() || 'deepseek-chat';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('默认拆解粒度')
      .setDesc('AI 把目标拆成子项的细粒度：粗(2-3) / 中(3-6) / 细(5-8)。可在审阅弹窗里再逐条删改。')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('粗', '粗（2-3 子项）')
          .addOption('中', '中（3-6 子项）')
          .addOption('细', '细（5-8 子项）')
          .setValue(this.plugin.settings.aiDecomposeDepth)
          .onChange(async (value) => {
            this.plugin.settings.aiDecomposeDepth = value as '粗' | '中' | '细';
            await this.plugin.saveSettings();
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
          const b64 = arrayBufferToBase64(avatarData);
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
      const tag = worksRow.createSpan({ text: work.name, cls: 'bamboo-about-tag' });
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

  getControlValue(key: string): unknown {
    return (this.plugin.settings as unknown as Record<string, unknown>)[key];
  }

  setControlValue(key: string, value: unknown): void {
    (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
    void this.plugin.saveSettings();
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    const s = this.plugin.settings;
    return [
      { name: '数据存储路径', desc: '复盘数据在 Vault 中的存储目录', control: { key: 'dataPath', type: 'text', defaultValue: s.dataPath, placeholder: 'bamboo-review' } },
      { name: '自动生成 Markdown 摘要', desc: '每次保存复盘数据时自动生成可读 .md 文件', control: { key: 'enableMarkdownSync', type: 'toggle', defaultValue: s.enableMarkdownSync } },
      { name: '自定义主题路径', desc: '存放自定义主题 .js 文件的文件夹', control: { key: 'themePath', type: 'text', defaultValue: s.themePath, placeholder: '竹林复盘主题' } },
      { name: '白噪音文件夹', desc: '扫描音频文件的文件夹（留空扫描全库）', control: { key: 'noisePath', type: 'text', defaultValue: s.noisePath, placeholder: '留空扫描全库' } },
      { name: '跟随 Obsidian 主题配色', desc: '插件配色跟随当前 Obsidian 主题强调色', control: { key: 'followObsidianTheme', type: 'toggle', defaultValue: s.followObsidianTheme } },
      { name: '将调色同步到 Obsidian', desc: 'webapp 调色实时同步到原生界面', control: { key: 'syncPaletteToObsidian', type: 'toggle', defaultValue: s.syncPaletteToObsidian } },
      { name: '启用 AI 规划', desc: '运行「AI 规划」命令由大模型拆解目标', control: { key: 'aiEnabled', type: 'toggle', defaultValue: s.aiEnabled } },
      { name: 'API Key', desc: '大模型服务鉴权密钥', control: { key: 'aiApiKey', type: 'text', defaultValue: s.aiApiKey, placeholder: 'sk-...' } },
      { name: 'Base URL', desc: 'API 基地址（不含 /chat/completions 后缀）', control: { key: 'aiBaseUrl', type: 'text', defaultValue: s.aiBaseUrl, placeholder: 'https://api.deepseek.com/v1' } },
      { name: '模型', desc: '模型名，如 deepseek-chat', control: { key: 'aiModel', type: 'text', defaultValue: s.aiModel, placeholder: 'deepseek-chat' } },
      { name: '默认拆解粒度', desc: 'AI 拆解子项的细粒度：粗 / 中 / 细', control: { key: 'aiDecomposeDepth', type: 'dropdown', defaultValue: s.aiDecomposeDepth, options: { '粗': '粗（2-3 子项）', '中': '中（3-6 子项）', '细': '细（5-8 子项）' } } },
    ];
  }
}
