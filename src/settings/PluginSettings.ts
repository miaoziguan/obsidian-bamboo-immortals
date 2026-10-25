import { App, PluginSettingTab, Setting, Notice, Modal, SettingPage, SettingDefinitionItem } from 'obsidian';
import { normalizeDirInput, migrateDataDir, bindFolderMigration } from './folderMigration';
import { EXPORT_FOLDER_DEFAULTS } from './settingsDefaults';
import type BambooReviewPlugin from '../../main';
import { ThemeBridge } from '../bridge/ThemeBridge';
import { arrayBufferToBase64 } from '../utils/base64';
import { encodeBackup, decodeBackup } from '../license/backupCode';

/** Obsidian 插件运行时注入的主窗口 document（非 iframe 内的 document） */
declare const activeDocument: Document;

/**
 * 向所有已打开的复盘 iframe（主复盘/画中卷/归档共用 .bamboo-review-frame class）广播消息。
 *
 * 修复：原先用 querySelector 只取 DOM 中第一个 frame，多视图同时打开时其余视图
 * 收不到设置变更（theme:changed / theme:followDisabled / theme:syncPaletteEnabled），
 * 需重开视图才生效；theme:syncPaletteEnabled 还会导致其余视图内部的
 * syncPaletteToObsidian 标志停留在旧值。改用 querySelectorAll 全量广播。
 * 各视图的 webapp 接收端（bridge.js）对主视图/精简视图分支均有 typeof 防御，广播安全。
 */
function broadcastToReviewFrames(message: Record<string, unknown>): void {
  try {
    const frames = activeDocument.querySelectorAll<HTMLIFrameElement>('.bamboo-review-frame');
    frames.forEach((frame) => {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage(message, '*');
      }
    });
  } catch {
    // 无活动文档等极端时序下静默：设置已持久化，视图重开后由 app:ready 推送对齐
  }
}

/** 画中卷视图可停靠的位置 */
export type ScrollLocation = 'left' | 'center' | 'right';

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
  /** 板块管理配置（JSON 解析后结构不固定，使用宽松类型） */
  sectionConfig: Record<string, unknown> | null;
  /** 主题动效文件夹路径（Vault 根目录下的相对路径） */
  themePath: string;
  /** 白噪音文件夹路径（Vault 根目录下的相对路径，留空则扫描全库） */
  noisePath: string;
  /** 自定义白噪音音源列表 */
  noiseItems: NoiseItem[];
  /**
   * 主题市场：已安装主题的版本记录（主题 id → { version, installedAt }）。
   * 用于「可更新」检测——与 manifest 里的 version 比对，不一致即提示更新。
   * 可选字段：老版本设置里没有该键时按「未知版本」处理（表现为可更新）。
   */
  marketInstalled?: Record<string, { version: string; installedAt: number }>;
  /**
   * 模块市场：已安装模块的版本记录（模块 id → { version, installedAt }）。
   * 与主题市场（marketInstalled）分开存放，避免两类市场的版本记录互相覆盖。
   */
  moduleInstalled?: Record<string, { version: string; installedAt: number }>;
  /**
   * 便签素材市场：已安装素材的版本记录（素材 id → { version, installedAt }）。
   * 与主题/模块市场分开存放，避免三类市场的版本记录互相覆盖。
   */
  materialInstalled?: Record<string, { version: string; installedAt: number }>;
  /**
   * 模块文件夹路径（Vault 相对路径）。留空时回落到默认管理区 <configDir>/bamboo-review/modules，
   * 收拢在插件数据同域、不再散落 vault 根目录；设置具体路径则完全自定义（此时不做旧目录迁移）。
   */
  modulePath: string;
  /**
   * 模块自持久化的业务数据（模块 id → 任意 JSON 对象）。
   *
   * 模块视图以 data: URL 加载，该上下文下 localStorage / sessionStorage / indexedDB
   * 读取即抛 SecurityError（不可配置 getter），故模块的用户数据（如博客头像、昵称、
   * 简介、目录配置）必须由宿主代为落盘，经 module:saveData / module:loadData 存取。
   */
  moduleData?: Record<string, Record<string, unknown>>;
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
  /** 竹林咨询：跳过 TLS 证书校验（仅自建/自签证书的私有服务器需要，默认关闭） */
  smtpAllowSelfSigned: boolean;
  /**
   * 复盘面板当前是否处于打开状态（内部运行时标记，不在设置 UI 暴露）。
   * 视图 onOpen 置 true、用户主动关闭置 false；插件卸载（禁用/热更新）触发的
   * 关闭不清除，供重载后 onload 判断「更新前面板是否开着」并自动恢复。
   */
  /** 画中卷默认打开位置（left/center/right），由视图内移动按钮或设置面板写入 */
  scrollDefaultLocation: ScrollLocation;
  reviewViewOpen: boolean;
  /** 复盘面板内左右滑动切换日期（原 webapp 设置项，已收归原生设置） */
  enableSwipe: boolean;
  /** 数据修改后延迟自动保存的时间（毫秒）。可选 1000/2000/5000/10000 */
  autoSaveInterval: number;
  /** 静坐一炉香：整支香的燃烧时长（分钟，1~240；原 webapp 设置项，已收归原生设置） */
  incenseDuration: number;
  /** 静坐一炉香：每燃烧多少分钟化一次雁（分钟，1~120 且不超过总时长） */
  incenseGooseInterval: number;
  /** 插件数据根目录（Vault 相对路径）。所有竹林数据（日记/目标/画中卷/设置/收支等）存于此目录。
   *  留空或保持默认 'bamboo-review' 即存放于库根 bamboo-review/。修改后自动复制现有数据到新目录。 */
  dataPath: string;
  /** 写作档（MD可视化写作，每组独立 .json）的程序数据存储目录（相对 dataPath 的子目录）。
   *  默认 typewriter-writing；修改后自动把旧档复制到新目录，重启插件生效（与 dataPath 同机制）。 */
  writeStoreFolder: string;
  /** 便签档（便签模式，每组独立 .json）的程序数据存储目录（相对 dataPath 的子目录）。
   *  默认 typewriter-notes；修改后自动把旧档复制到新目录，重启插件生效（与 writeStoreFolder 同机制）。 */
  notesStoreFolder: string;
  /** 思维子弹档（思维子弹模式，每组独立 .json）的程序数据存储目录（相对 dataPath 的子目录）。
   *  默认 typewriter-mindmap；修改后自动把旧档复制到新目录，重启插件生效（与 writeStoreFolder 同机制）。 */
  mindmapStoreFolder: string;
  /** 思维子弹导出为 Markdown 的落库目录（Vault 相对路径，默认 思维子弹） */
  mmExportFolder: string;
  /** 便签导出为 Markdown 的落库目录（Vault 相对路径，默认 便签） */
  noteExportFolder: string;
  /** 写作模式整篇快照导出为 Markdown 的落库目录（Vault 相对路径，默认 MD可视化写作） */
  writeExportFolder: string;
}

export const DEFAULT_SETTINGS: BambooReviewSettings = {
  sectionConfig: null,
  themePath: '竹林动效主题',
  noisePath: '',
  noiseItems: [],
  marketInstalled: {},
  moduleInstalled: {},
  materialInstalled: {},
  modulePath: '',
  moduleData: {},
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
  smtpAllowSelfSigned: false,
  scrollDefaultLocation: 'left',
  reviewViewOpen: false,
  enableSwipe: true,
  autoSaveInterval: 2000,
  incenseDuration: 60,
  incenseGooseInterval: 10,
  dataPath: 'bamboo-review',
  writeStoreFolder: 'typewriter-writing',
  notesStoreFolder: 'typewriter-notes',
  mindmapStoreFolder: 'typewriter-mindmap',
  mmExportFolder: '思维子弹',
  noteExportFolder: '便签',
  writeExportFolder: 'MD可视化写作',
};

/**
 * PluginSettings - Obsidian 原生设置面板（1.13.0+ 声明式 + 命令式子页）
 *
 * 采用 Obsidian 1.13 推荐架构：
 * - 顶层 getSettingDefinitions() 返回 6 个 SettingDefinitionPage，
 *   每个 page 的 name/desc 进入设置搜索索引，消除官方 lint 提示；
 * - 每个 page 通过 `page: () => new XxxPage()` 工厂返回一个命令式 SettingPage
 *   子类，在子类的 display() 里沿用原 renderXxxTab 的命令式逻辑（含页内
 *   重绘、iframe 联动、动态卡片），因此复杂动态 UI 完全保留。
 * 这样既获得设置搜索能力，又不必把全部自定义 UI 硬塞进声明式控制数组。
 */
/**
 * 设置面板落盘防抖。
 *
 * 原实现每个 onChange 都 `await this.plugin.saveSettings()`：文本框是**逐键**触发 onChange，
 * 即每敲一个字符就把整个 data.json 全量序列化并写一次盘（连续输入还会出现多次写交叉）。
 * 而设置值在内存中已即时生效，写盘只是持久化 —— 用户感知不到这 300ms 的合并。
 * 关面板时由 PluginSettings.hide() 统一 flush，保证最后一次输入必定落库。
 */
const SAVE_DEBOUNCE_MS = 300;
// window.setTimeout/clearTimeout：Obsidian 弹窗（popout window）是独立浏览器窗口，
// 裸 setTimeout 在该场景下解析到的全局可能错位；全仓其它位置（ThemeBridge/AppHost）也统一用 window. 前缀。
// 类型按 ThemeBridge 的写法显式取 number（@types/node 会把 Window 上的定时器类型注入成
// NodeJS.Timeout，导致 setTimeout 的返回值与 clearTimeout 的参数类型对不齐，显式 number 可消歧义）。
const _saveTimers = new WeakMap<BambooReviewPlugin, number>();

function scheduleSaveSettings(plugin: BambooReviewPlugin): void {
  const prev = _saveTimers.get(plugin);
  if (prev) window.clearTimeout(prev);
  const timer = window.setTimeout(() => {
    _saveTimers.delete(plugin);
    void plugin.saveSettings();
  }, SAVE_DEBOUNCE_MS);
  _saveTimers.set(plugin, timer);
}

function flushSaveSettings(plugin: BambooReviewPlugin): void {
  const timer = _saveTimers.get(plugin);
  if (!timer) return;
  window.clearTimeout(timer);
  _saveTimers.delete(plugin);
  void plugin.saveSettings();
}

export class PluginSettings extends PluginSettingTab {
  plugin: BambooReviewPlugin;

  constructor(app: App, plugin: BambooReviewPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /** 关闭设置面板前补一次落盘：避免最后一次输入还没到防抖窗口就被丢弃 */
  hide(): void {
    flushSaveSettings(this.plugin);
    super.hide();
  }

  /** 声明式定义：5 个可搜索的页面，内部仍命令式渲染 */
  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      { type: 'page', name: '概览', desc: '关于竹林修仙传与作者信息', page: () => new OverviewPage(this.plugin) },
      { type: 'page', name: '激活', desc: '购买激活、备份码与多设备同步', page: () => new LicensePage(this.plugin) },
      { type: 'page', name: 'AI 规划', desc: '自然语言转目标卡片的 AI 配置', page: () => new AIPage(this.plugin) },
      { type: 'page', name: '外观与交互', desc: '配色联动、界面与交互偏好', page: () => new AppearancePage(this.plugin) },
      { type: 'page', name: '资源', desc: '主题动效与白噪音等资源文件的存放目录', page: () => new ResourcePage(this.plugin) },
      { type: 'page', name: '数据', desc: '数据存储目录与数据迁移', page: () => new DataPage(this.plugin) },
      { type: 'page', name: '导出', desc: '思维子弹/便签/写作导出为 Markdown 的落库目录', page: () => new ExportPage(this.plugin) },
      { type: 'page', name: '竹林咨询', desc: '邮箱 SMTP 发件配置', page: () => new ConsultPage(this.plugin) },
    ];
  }
}

/** 概览页：关于卡片 + 插件简介 */
class OverviewPage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = '概览';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.addClass('bamboo-settings-page');
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
        const adapter = this.plugin.app.vault.adapter;
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
}

/** 激活页：购买入口 + License 区块 */
class LicensePage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = '激活';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.empty();
    containerEl.addClass('bamboo-settings-page');
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
            new PurchaseModal(this.plugin.app, this.plugin).open();
          })
      );

    this.renderLicenseSection(containerEl);
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
              this.display();
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
            this.display();
            new Notice('已解除激活。重新打开复盘视图将再次显示激活遮罩。');
          })
        );
      return;
    }

    // 未激活：输入 + 激活按钮
    let inputKey = '';
    new Setting(containerEl)
      .setName('激活码')
      .setDesc('付款后获得的激活码，格式 BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX。激活码离线校验，无需联网。')
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
              this.display();
              new Notice('激活成功！重新打开复盘视图即可解锁全部功能 🎋', 6000);
            } else {
              new Notice(`激活失败：${res.reason ?? '未知错误'}`);
            }
          })
      );
  }
}

/** AI 规划页 */
class AIPage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = 'AI 规划';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.addClass('bamboo-settings-page');
    new Setting(containerEl).setName('AI 规划（自然语言 → 目标卡片）').setHeading();

    new Setting(containerEl)
      .setName('启用 AI 规划')
      .setDesc('开启后，可在笔记中运行「AI 规划：将当前笔记转为目标卡片」命令，由大模型拆解目标并写入复盘。')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.aiEnabled)
          .onChange(async (value) => {
            this.plugin.settings.aiEnabled = value;
            scheduleSaveSettings(this.plugin);
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
            scheduleSaveSettings(this.plugin);
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
            scheduleSaveSettings(this.plugin);
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
            scheduleSaveSettings(this.plugin);
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
            scheduleSaveSettings(this.plugin);
          })
      );
  }
}

/** 外观与交互页：调色联动 / 界面布局 / 交互行为 / 静坐一炉香（主题·白噪音资源目录已移至 ResourcePage） */
class AppearancePage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = '外观与交互';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.addClass('bamboo-settings-page');
    // ───── 主题/白噪音资源目录已移至独立的「资源」页（ResourcePage）─────

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
            scheduleSaveSettings(this.plugin);
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
              broadcastToReviewFrames({
                type: 'theme:changed',
                id: 'settings_' + Date.now(),
                payload,
              });
            } else {
              // 关闭联动 → 通知所有 iframe 恢复用户手动调色
              broadcastToReviewFrames({
                type: 'theme:followDisabled',
                id: 'settings_' + Date.now(),
                payload: {},
              });
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
            scheduleSaveSettings(this.plugin);
            if (!value) {
              // 遍历 registry 清理所有视图实例（含 trailing 防抖定时器），而非仅 default 单例
              ThemeBridge.restoreAllDefaults();
            }
            // 广播给所有视图，使各 iframe 内部的 syncPaletteToObsidian 标志同步更新
            broadcastToReviewFrames({
              type: 'theme:syncPaletteEnabled',
              id: 'settings_' + Date.now(),
              payload: { enabled: value }
            });
          })
      );

    // === 界面布局 ===
    new Setting(containerEl).setName('界面布局').setHeading();

    new Setting(containerEl)
      .setName('画中卷默认打开位置')
      .setDesc('画中卷（便签墙 / 香道）打开时默认停靠的位置；在视图内用标签页按钮移动后也会更新此项')
      .addDropdown((drop) =>
        drop
          .addOption('left', '左侧栏')
          .addOption('center', '中央页签')
          .addOption('right', '右侧栏')
          .setValue(this.plugin.settings.scrollDefaultLocation)
          .onChange(async (value) => {
            this.plugin.settings.scrollDefaultLocation = value as ScrollLocation;
            scheduleSaveSettings(this.plugin);
          })
      );

    // === 交互行为 ===
    new Setting(containerEl).setName('交互行为').setHeading();

    new Setting(containerEl)
      .setName('滑动切换日期')
      .setDesc('复盘面板内左右滑动切换日期；关闭后只能用日期选择器切换')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableSwipe !== false).onChange(async (value) => {
          this.plugin.settings.enableSwipe = value;
          scheduleSaveSettings(this.plugin);
        })
      );

    new Setting(containerEl)
      .setName('自动保存间隔')
      .setDesc('数据修改后延迟保存的时间')
      .addDropdown((drop) =>
        drop
          .addOption('1000', '1 秒')
          .addOption('2000', '2 秒')
          .addOption('5000', '5 秒')
          .addOption('10000', '10 秒')
          .setValue(String(this.plugin.settings.autoSaveInterval || 2000))
          .onChange(async (value) => {
            this.plugin.settings.autoSaveInterval = parseInt(value, 10) || 2000;
            scheduleSaveSettings(this.plugin);
          })
      );

    // === 静坐一炉香 ===
    new Setting(containerEl).setName('静坐一炉香').setHeading();

    new Setting(containerEl)
      .setName('一炷香总时长')
      .setDesc('香道番茄钟整支香的燃烧时长（分钟，1~240）')
      .addText((text) =>
        text
          .setPlaceholder('60')
          .setValue(String(this.plugin.settings.incenseDuration || 60))
          .onChange(async (value) => {
            this.plugin.settings.incenseDuration = Math.min(240, Math.max(1, parseInt(value, 10) || 60));
            scheduleSaveSettings(this.plugin);
          })
      );

    new Setting(containerEl)
      .setName('化雁间隔')
      .setDesc('每燃烧多少分钟，一段香灰随风化作大雁飞向远方（分钟，1~120，且不超过总时长）')
      .addText((text) =>
        text
          .setPlaceholder('10')
          .setValue(String(this.plugin.settings.incenseGooseInterval || 10))
          .onChange(async (value) => {
            const dur = this.plugin.settings.incenseDuration || 60;
            this.plugin.settings.incenseGooseInterval = Math.min(120, Math.min(dur, Math.max(1, parseInt(value, 10) || 10)));
            scheduleSaveSettings(this.plugin);
          })
      );
  }

}

/** 资源页：主题动效与白噪音等资源文件的存放目录（输入型资源目录） */
class ResourcePage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = '资源';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.addClass('bamboo-settings-page');
    // === 主题动效 ===
    new Setting(containerEl).setName('主题动效').setHeading();

    new Setting(containerEl)
      .setName('主题动效文件夹')
      .setDesc('Vault 根目录下存放主题动效 .js 文件的文件夹（修改后需重启插件）')
      .addText((text) =>
        text
          .setPlaceholder('竹林动效主题')
          .setValue(this.plugin.settings.themePath)
          .onChange((value) => {
            const old = this.plugin.settings.themePath || '竹林动效主题';
            const next = normalizeDirInput(value, '竹林动效主题');
            this.plugin.settings.themePath = next;
            scheduleSaveSettings(this.plugin);
            // 主题 .js 是用户资产：换目录时把旧目录里的主题一并搬过去（复制式，不删旧档）。
            // 否则旧目录不在 _rescanThemes 的扫描候选里，已装主题会"凭空消失"。
            if (next !== old) {
              void migrateDataDir(this.plugin.app, old, next).catch(() => { /* 迁移失败不阻断设置保存 */ });
            }
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
          .onChange((value) => {
            this.plugin.settings.noisePath = normalizeDirInput(value, '');
            scheduleSaveSettings(this.plugin);
          })
      );
  }
}

/** 数据页：数据存储目录（竹林全部业务数据的 Vault 相对根路径）+ 后续迁移/备份类功能的分组位 */
class DataPage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = '数据';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.addClass('bamboo-settings-page');
    new Setting(containerEl).setName('数据根目录').setHeading();

    // 数据存储目录（根）：迁移时递归整树复制（含子目录）
    new Setting(containerEl)
      .setName('数据存储目录')
      .setDesc('竹林修仙传全部数据（日记/目标/画中卷/设置/收支等）存放的 Vault 相对路径。留空或保持默认「bamboo-review」即存于库根 bamboo-review/；修改后自动把现有数据（含子目录）复制到新目录，重启插件生效。')
      .addText((text) => {
        text
          .setPlaceholder('bamboo-review')
          .setValue(this.plugin.settings.dataPath || 'bamboo-review')
          .onChange((value) => {
            this.plugin.settings.dataPath = normalizeDirInput(value, 'bamboo-review');
            scheduleSaveSettings(this.plugin);
          });
        bindFolderMigration(
          text,
          () => this.plugin.settings.dataPath || 'bamboo-review',
          (oldVal, newVal) => migrateDataDir(this.plugin.app, oldVal, newVal)
        );
        return text;
      });

    // ── 画中卷各模式的存档目录（均相对「数据存储目录」）──
    new Setting(containerEl).setName('画中卷模式存档目录').setHeading();

    type StoreKey = 'writeStoreFolder' | 'notesStoreFolder' | 'mindmapStoreFolder';
    const storeFolders: Array<{ key: StoreKey; name: string; def: string; desc: string }> = [
      { key: 'writeStoreFolder', name: 'MD 可视化写作存档目录', def: 'typewriter-writing', desc: '写作档（MD可视化写作，每组独立 .json）的程序数据存储位置（相对「数据存储目录」的子路径，默认 typewriter-writing）。修改后自动把旧档复制到新目录，重启插件生效。' },
      { key: 'notesStoreFolder', name: '便签模式存档目录', def: 'typewriter-notes', desc: '便签档（便签模式，每组独立 .json）的程序数据存储位置（相对「数据存储目录」的子路径，默认 typewriter-notes）。修改后自动把旧档复制到新目录，重启插件生效。' },
      { key: 'mindmapStoreFolder', name: '思维子弹模式存档目录', def: 'typewriter-mindmap', desc: '思维子弹档（每组独立 .json）的程序数据存储位置（相对「数据存储目录」的子路径，默认 typewriter-mindmap）。修改后自动把旧档复制到新目录，重启插件生效。' },
    ];

    for (const it of storeFolders) {
      new Setting(containerEl)
        .setName(it.name)
        .setDesc(it.desc)
        .addText((text) => {
          text
            .setPlaceholder(it.def)
            .setValue(this.plugin.settings[it.key] || it.def)
            .onChange((value) => {
              this.plugin.settings[it.key] = normalizeDirInput(value, it.def);
              scheduleSaveSettings(this.plugin);
            });
          bindFolderMigration(
            text,
            () => this.plugin.settings[it.key] || it.def,
            (oldVal, newVal) => {
              const base = this.plugin.settings.dataPath || 'bamboo-review';
              return migrateDataDir(this.plugin.app, `${base}/${oldVal}`, `${base}/${newVal}`);
            }
          );
          return text;
        });
    }
  }

}

/** 导出页：三类 Markdown 导出的落库目录（Vault 相对路径）。仅影响"导出到 Vault"的目标位置，不迁移既有文件。 */
class ExportPage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = '导出';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.addClass('bamboo-settings-page');
    new Setting(containerEl).setName('画中卷打字机板块导出目录').setHeading();

    const items: Array<{ key: 'mmExportFolder' | 'noteExportFolder' | 'writeExportFolder'; name: string; desc: string; placeholder: string }> = [
      { key: 'mmExportFolder', name: '思维子弹模式导出目录', desc: '思维子弹图导出为 Markdown 的落库位置（Vault 相对路径，如 画中卷/子弹笔记 或 思维子弹）', placeholder: '如 思维子弹' },
      { key: 'noteExportFolder', name: '便签模式导出目录', desc: '便签（单张/框选多张）导出为 Markdown 的落库位置（Vault 相对路径，如 画中卷/便签MD 或 便签）', placeholder: '如 便签' },
      { key: 'writeExportFolder', name: 'MD 可视化写作模式导出目录', desc: '写作模式（MD可视化写作）整篇快照导出为 Markdown 的落库位置（Vault 相对路径，默认 MD可视化写作）', placeholder: '如 MD可视化写作' },
    ];

    for (const it of items) {
      new Setting(containerEl)
        .setName(it.name)
        .setDesc(it.desc)
        .addText((text) =>
          text
            .setPlaceholder(it.placeholder)
            .setValue(this.plugin.settings[it.key] || EXPORT_FOLDER_DEFAULTS[it.key])
            .onChange(async (value) => {
              const norm = (value || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
              if (norm.includes('..')) return; // 禁止路径遍历，忽略非法输入
              this.plugin.settings[it.key] = norm || EXPORT_FOLDER_DEFAULTS[it.key];
              scheduleSaveSettings(this.plugin);
            })
        );
    }
  }

}

/** 竹林咨询页（零依赖、独立隔离渲染） */
class ConsultPage extends SettingPage {
  constructor(private plugin: BambooReviewPlugin) {
    super();
    this.title = '竹林咨询';
  }

  display(): void {
    const containerEl = this.containerEl;
    containerEl.addClass('bamboo-settings-page');
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
              scheduleSaveSettings(this.plugin);
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
              scheduleSaveSettings(this.plugin);
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
              scheduleSaveSettings(this.plugin);
            })
        );

      new Setting(containerEl)
        .setName('跳过 TLS 证书校验')
        .setDesc('默认关闭。仅当使用自建/自签证书的私有 SMTP 服务器时才开启——关闭校验会让邮箱授权码暴露给中间人')
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.smtpAllowSelfSigned)
            .onChange(async (value) => {
              this.plugin.settings.smtpAllowSelfSigned = value;
              scheduleSaveSettings(this.plugin);
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
              scheduleSaveSettings(this.plugin);
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
              scheduleSaveSettings(this.plugin);
            })
        )
        .then((setting) => {
          const input = setting.controlEl.querySelector('input');
          if (input) input.type = 'password';
        });
    } catch {
      // 竹林咨询分区渲染异常：非致命，静默兜底
    }
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
    priceBox.createSpan({ text: '限时早鸟价 ¥59', cls: 'bamboo-purchase-early' });
    priceBox.createSpan({ text: ' / 正式价 ¥9999', cls: 'bamboo-purchase-regular' });
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
