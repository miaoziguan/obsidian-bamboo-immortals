import { App, PluginSettingTab, Setting, Notice, Modal } from 'obsidian';
import type BambooReviewPlugin from '../../main';
import { ThemeBridge } from '../bridge/ThemeBridge';
import { arrayBufferToBase64 } from '../utils/base64';
import { encodeBackup, decodeBackup } from '../license/backupCode';

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
  /** 已激活的激活码原文（脱敏显示用，不要明文展示全部） */
  licenseKey: string;
  /** 是否已激活（门控开关，onload 读取） */
  licenseActive: boolean;
  /** 已激活码的归属 TAG（用户码才有，格式 BRI-<TAG4>-<SIG20>） */
  licenseTag: string;
  /** 竹林咨询：SMTP 发件服务器地址 */
  smtpHost: string;
  /** 竹林咨询：SMTP 端口（465 SSL / 587 STARTTLS） */
  smtpPort: number;
  /** 竹林咨询：是否 SSL 直连 */
  smtpSecure: boolean;
  /** 竹林咨询：发件人邮箱账号 */
  smtpUser: string;
  /** 竹林咨询：SMTP 授权码 */
  smtpPass: string;
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
  licenseKey: '',
  licenseActive: false,
  licenseTag: '',
  smtpHost: 'smtp.qq.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: '',
  smtpPass: '',
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
    this.buildUI();
  }

  /** 渲染设置面板 */
  private buildUI(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('bamboo-review-settings');

    // 竹林咨询：最先、完全独立渲染，不依赖任何其他分区，
    // 确保即便激活/License/AI/调色等分区渲染抛错，邮箱配置入口也必然出现。
    this.renderConsultSection(containerEl);

    try {
      this.renderAllSections(containerEl);
    } catch (err) {
      // 兜底：任何分区渲染抛错都不应让整页白屏
      console.error('[竹林修仙传] 设置页渲染异常：', err);
      containerEl.createEl('p', {
        text: '⚠️ 设置页部分内容渲染失败，请查看开发者控制台（Ctrl/Cmd+Shift+I）的报错。',
        cls: 'bamboo-settings-error',
      });
    }
  }

  /** 竹林咨询配置区（零依赖、独立隔离渲染） */
  private renderConsultSection(containerEl: HTMLElement): void {
    try {
      new Setting(containerEl).setName('竹林咨询（邮箱 SMTP 配置）').setHeading();

      // 引导卡片：QQ 邮箱 SMTP 授权码获取步骤
      const guideBox = containerEl.createDiv({ cls: 'bamboo-about-card bamboo-consult-guide' });
      guideBox.createEl('p', { text: '📮 发送邮件需要配置 SMTP。推荐使用 QQ 邮箱：', cls: 'bamboo-about-label' });
      const steps = guideBox.createEl('ol', { cls: 'bamboo-consult-steps' });
      steps.createEl('li', { text: '登录 QQ 邮箱网页版 → 点击顶部「设置」→「账户」' });
      steps.createEl('li', { text: '找到「POP3/SMTP 服务」一栏 → 点击「开启」' });
      steps.createEl('li', { text: '按提示发送短信验证后会得到一个授权码（16 位），复制它粘贴到下方「SMTP 授权码」输入框' });
      guideBox.createEl('p', {
        text: '⚠️ 授权码不是你的 QQ 密码，是 QQ 邮箱专门为第三方客户端生成的独立凭证，仅保存在本地 data.json。',
        cls: 'bamboo-consult-note',
      });

      new Setting(containerEl)
        .setName('SMTP 服务器')
        .setDesc('发件服务器地址。QQ 邮箱用 smtp.qq.com，163 邮箱用 smtp.163.com')
        .addText((text) =>
          text
            .setPlaceholder('smtp.qq.com')
            .setValue(this.plugin.settings.smtpHost)
            .onChange(async (value) => {
              this.plugin.settings.smtpHost = value.trim() || 'smtp.qq.com';
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName('SMTP 端口')
        .setDesc('SSL 直连用 465，STARTTLS 用 587。QQ 邮箱推荐 465')
        .addText((text) => {
          text.inputEl.type = 'number';
          text
            .setPlaceholder('465')
            .setValue(String(this.plugin.settings.smtpPort))
            .onChange(async (value) => {
              const n = parseInt(value, 10);
              this.plugin.settings.smtpPort = Number.isFinite(n) && n > 0 ? n : 465;
              await this.plugin.saveSettings();
            });
        });

      new Setting(containerEl)
        .setName('SSL 直连')
        .setDesc('端口 465 开启，端口 587 关闭')
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.smtpSecure)
            .onChange(async (value) => {
              this.plugin.settings.smtpSecure = value;
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName('发件人邮箱')
        .setDesc('填写你的完整 QQ 邮箱地址，如 123456789@qq.com')
        .addText((text) =>
          text
            .setPlaceholder('你的QQ号@qq.com')
            .setValue(this.plugin.settings.smtpUser)
            .onChange(async (value) => {
              this.plugin.settings.smtpUser = value.trim();
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName('SMTP 授权码')
        .setDesc('QQ 邮箱生成的 16 位授权码（非 QQ 密码），仅保存在本地 data.json')
        .addText((text) =>
          text
            .setPlaceholder('16 位授权码')
            .setValue(this.plugin.settings.smtpPass)
            .onChange(async (value) => {
              this.plugin.settings.smtpPass = value.trim();
              await this.plugin.saveSettings();
            })
        )
        .then((setting) => {
          const input = setting.controlEl.querySelector('input');
          if (input) input.type = 'password';
        });
    } catch (err) {
      console.error('[竹林修仙传] 竹林咨询分区渲染异常：', err);
    }
    console.log('[竹林修仙传] ◀ 竹林咨询区渲染结束');
  }

  /** 各分区顺序渲染（竹林咨询独立隔离，确保即使别处抛错也能显示） */
  private renderAllSections(containerEl: HTMLElement): void {
    new Setting(containerEl).setName('竹林修仙传 - 设置').setHeading();

    // === 激活（License Gate） ===
    new Setting(containerEl).setName('激活').setHeading();

    // 购买激活入口（轻量模式：付款后私聊作者拿码）
    new Setting(containerEl)
      .setName('购买激活')
      .setDesc('一次性买断，无订阅、无有效期。点击查看价格与付款方式，付款后私聊作者获取激活码。')
      .addButton((btn) =>
        btn
          .setButtonText('查看购买说明')
          .setCta()
          .onClick(() => {
            new PurchaseModal(this.app, this.plugin).open();
          })
      );

    this.renderLicenseSection(containerEl);

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

  /** 激活区：输入激活码 / 显示状态（原生设置页作为激活的补充入口，主入口在 webapp 内遮罩） */
  private renderLicenseSection(containerEl: HTMLElement): void {
    // 使用插件级 LicenseStore 单例（与 webapp 门控同源）
    const store = this.plugin.license;
    if (!store) {
      // 防御：设置页打开时 license 尚未初始化（极端时序），
      // 不应让异常吞掉后续所有分区（激活/竹林咨询等）
      new Setting(containerEl)
        .setName('激活')
        .setHeading()
        .setDesc('激活信息加载中，请稍后重新打开本设置页。');
      return;
    }
    const active = store.isActive();

    // 状态行
    const savedTag = store.getSavedTag();
    const tagDesc = active
      ? savedTag
        ? `已激活（用户码，归属 TAG ${savedTag}），全部功能已解锁。`
        : '已激活，全部功能已解锁。'
      : '未激活，复盘视图将显示激活遮罩。';
    new Setting(containerEl)
      .setName('激活状态')
      .setDesc(tagDesc)
      .addText((text) => {
        text.setDisabled(true).setValue(active ? '✅ 已激活' : '🔒 未激活');
      });

    // 已激活：提供「解除激活」便于调试 / 退款，以及备份码导出 / 导入
    if (active) {
      // —— 方案 1：备份码（换设备 / 换仓库用）——
      new Setting(containerEl)
        .setName('备份码')
        .setDesc(
          '备份码 = 当前激活码的便携封装（BRIBACK- 开头），可在另一台设备 / 另一个仓库的激活页「导入备份码」一键激活，免去手抄长串激活码。不含任何密钥，请妥善保管。'
        )
        .addButton((btn) =>
          btn.setButtonText('导出备份码').onClick(async () => {
            const savedKey = store.getSavedKey();
            if (!savedKey) {
              new Notice('未找到已保存的激活码，无法导出备份码');
              return;
            }
            try {
              const backup = encodeBackup(savedKey);
              await navigator.clipboard.writeText(backup);
              new Notice('备份码已复制到剪贴板，请妥善保存 🔑', 8000);
            } catch {
              new Notice('复制失败，请检查浏览器剪贴板权限');
            }
          })
        );

      new Setting(containerEl)
        .setName('导入备份码')
        .setDesc('若当前设备尚未激活，可粘贴另一台设备导出的备份码完成激活。')
        .addText((text) =>
          text.setPlaceholder('BRIBACK-...').onChange((v) => {
            (this as unknown as { _pendingBackup?: string })._pendingBackup = v;
          })
        )
        .addButton((btn) =>
          btn.setButtonText('导入并激活').onClick(async () => {
            const raw = ((this as unknown as { _pendingBackup?: string })._pendingBackup ?? '').trim();
            if (!raw) {
              new Notice('请先粘贴备份码');
              return;
            }
            let code: string;
            try {
              code = decodeBackup(raw);
            } catch (e) {
              new Notice(`导入失败：${e instanceof Error ? e.message : '备份码无效'}`);
              return;
            }
            const res = await store.activate(code);
            if (res.ok) {
              this.buildUI();
              new Notice('备份码导入成功，已激活 🎋', 6000);
            } else {
              new Notice(`导入失败：${res.reason ?? '未知错误'}`);
            }
          })
        );

      // —— 方案 3：vault 同步说明 ——
      new Setting(containerEl)
        .setName('多设备 / 多仓库同步')
        .setDesc(
          '激活状态保存在本 vault 的 data.json 中。若你用 Obsidian Sync、git 或网盘同步该 vault，激活态会随 vault 一起迁移，换电脑后无需重新激活；仅当在"全新 vault"或"全新仓库"首次使用时，才需要重新输入激活码或导入备份码。'
        );

      new Setting(containerEl)
        .setName('解除激活')
        .setDesc('清除本机激活状态（调试 / 退款用）。之后需重新输入激活码。')
        .addButton((btn) =>
          btn.setButtonText('解除激活').onClick(async () => {
            await store.deactivate();
            this.buildUI();
            new Notice('已解除激活。重新打开复盘视图将再次显示激活遮罩。');
          })
        );
      return;
    }

    // 未激活：输入 + 激活按钮
    let inputKey = '';
    new Setting(containerEl)
      .setName('激活码')
      .setDesc('付款后获得的激活码，格式 BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX。激活码离线校验，无需联网。')
      .addText((text) =>
        text
          .setPlaceholder('BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX')
          .setValue(inputKey)
          .onChange((v) => {
            inputKey = v;
          })
      )
      .addButton((btn) =>
        btn
          .setButtonText('激活')
          .setCta()
          .onClick(async () => {
            const res = await store.activate(inputKey.trim());
            if (res.ok) {
              this.buildUI();
              new Notice('激活成功！重新打开复盘视图即可解锁全部功能 🎋', 6000);
            } else {
              new Notice(`激活失败：${res.reason ?? '未知错误'}`);
            }
          })
      );
  }

}

/** 购买说明弹窗：展示价格、收款码与拿码流程（轻量买断模式） */
class PurchaseModal extends Modal {
  private plugin: BambooReviewPlugin;

  constructor(app: App, plugin: BambooReviewPlugin) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bamboo-purchase-modal');

    contentEl.createEl('h2', { text: '购买与激活 · 竹林修仙传' });

    // 价格
    const priceBox = contentEl.createDiv({ cls: 'bamboo-purchase-price' });
    priceBox.createSpan({ text: '早鸟价 ¥29', cls: 'bamboo-purchase-early' });
    priceBox.createSpan({ text: ' / 正式价 ¥99', cls: 'bamboo-purchase-regular' });
    contentEl.createEl('p', {
      text: '一次性买断，无订阅、无有效期。付款后获得专属激活码，离线激活、永久可用。',
      cls: 'bamboo-purchase-note',
    });

    // 收款码
    contentEl.createEl('p', { text: '① 扫码付款（微信）', cls: 'bamboo-purchase-step' });
    const qrBox = contentEl.createDiv({ cls: 'bamboo-purchase-qr' });
    const qrImg = qrBox.createEl('img', { cls: 'bamboo-purchase-qr-img' });
    qrImg.setAttribute('alt', '微信收款码');
    // fire-and-forget：从插件目录读取收款码图片
    void (async () => {
      try {
        const pluginDir = this.plugin.manifest.dir ?? '';
        const qrPath = `${pluginDir}/webapp/assets/images/payment-wechat.png`;
        if (!(await this.app.vault.adapter.exists(qrPath))) return;
        const data = await this.app.vault.adapter.readBinary(qrPath);
        const b64 = arrayBufferToBase64(data);
        qrImg.setAttribute('src', `data:image/png;base64,${b64}`);
      } catch {
        qrBox.createEl('p', { text: '收款码加载失败，请查看 README 或私聊作者。', cls: 'bamboo-purchase-qr-fallback' });
      }
    })();

    // 流程
    contentEl.createEl('p', { text: '② 将付款截图私聊发给作者（微信：yanhu94）', cls: 'bamboo-purchase-step' });
    contentEl.createEl('p', { text: '③ 作者确认后发你激活码，回到本设置页「激活码」处粘贴激活', cls: 'bamboo-purchase-step' });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
