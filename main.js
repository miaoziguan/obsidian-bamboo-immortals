var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BambooReviewPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");
var path4 = __toESM(require("path"));

// src/views/DailyReviewView.ts
var import_obsidian2 = require("obsidian");
var path2 = __toESM(require("path"));
var fs2 = __toESM(require("fs"));

// src/storage/VaultStorage.ts
var import_obsidian = require("obsidian");
var VaultStorage = class {
  constructor(app, basePath = "bamboo-review") {
    this.app = app;
    this.basePath = (0, import_obsidian.normalizePath)(basePath);
  }
  /** 确保目录存在 */
  async ensureDir(dir) {
    const path5 = (0, import_obsidian.normalizePath)(`${this.basePath}/${dir}`);
    if (!await this.app.vault.adapter.exists(path5)) {
      await this.app.vault.adapter.mkdir(path5);
    }
  }
  /** 确保基础目录结构存在 */
  async ensureStructure() {
    if (!await this.app.vault.adapter.exists(this.basePath)) {
      await this.app.vault.adapter.mkdir(this.basePath);
    }
    await this.ensureDir("data");
    await this.ensureDir("reviews");
  }
  /**
   * 原子方式写入 vault 文件（替代 adapter.write）。
   * - 文件已在 vault 缓存 → vault.process（原子更新，避免竞态丢数据）
   * - 新文件 → vault.create（同时写入磁盘和 Obsidian 缓存）
   * - 历史遗留（磁盘有但缓存无）→ adapter.remove + vault.create（迁移进缓存）
   */
  async vaultWrite(path5, content) {
    const normalized = (0, import_obsidian.normalizePath)(path5);
    const abstract = this.app.vault.getAbstractFileByPath(normalized);
    if (abstract instanceof import_obsidian.TFile) {
      await this.app.vault.process(abstract, () => content);
      return;
    }
    const parentPath = normalized.substring(0, normalized.lastIndexOf("/"));
    if (parentPath && !await this.app.vault.adapter.exists(parentPath)) {
      await this.app.vault.adapter.mkdir(parentPath);
    }
    if (await this.app.vault.adapter.exists(normalized)) {
      await this.app.vault.adapter.remove(normalized);
    }
    await this.app.vault.create(normalized, content);
  }
  // ---- 每日数据 (days) ----
  dayPath(dateKey) {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/data/${dateKey}.json`);
  }
  async getDay(dateKey) {
    const path5 = this.dayPath(dateKey);
    if (!await this.app.vault.adapter.exists(path5)) {
      return null;
    }
    try {
      const content = await this.app.vault.adapter.read(path5);
      return JSON.parse(content);
    } catch (e) {
      console.warn(`[BambooReview] \u65E5\u671F\u6570\u636E\u6587\u4EF6\u635F\u574F\uFF0C\u5C06\u8DF3\u8FC7: ${path5}`, e);
      return null;
    }
  }
  async getAllDays() {
    await this.ensureDir("data");
    const dataDir = (0, import_obsidian.normalizePath)(`${this.basePath}/data`);
    const files = await this.app.vault.adapter.list(dataDir);
    const days = {};
    for (const file of files.files) {
      if (file.endsWith(".json")) {
        const dateKey = file.split("/").pop()?.replace(".json", "");
        if (dateKey) {
          try {
            const content = await this.app.vault.adapter.read(file);
            days[dateKey] = JSON.parse(content);
          } catch (e) {
            console.warn(`Failed to parse day file: ${file}`, e);
          }
        }
      }
    }
    return days;
  }
  /** 获取所有日期 key（按日期降序，最新在前） */
  async getDayKeys() {
    await this.ensureDir("data");
    const dataDir = (0, import_obsidian.normalizePath)(`${this.basePath}/data`);
    const files = await this.app.vault.adapter.list(dataDir);
    const keys = [];
    for (const file of files.files) {
      if (file.endsWith(".json")) {
        const dateKey = file.split("/").pop()?.replace(".json", "");
        if (dateKey) keys.push(dateKey);
      }
    }
    keys.sort().reverse();
    return keys;
  }
  /**
   * 分页加载日期数据
   * @param page 页码（从 0 开始）
   * @param pageSize 每页数量
   * @returns { days, total, page, pageSize, hasMore }
   */
  async getDaysPaginated(page = 0, pageSize = 30) {
    const allKeys = await this.getDayKeys();
    const total = allKeys.length;
    const start = page * pageSize;
    const pageKeys = allKeys.slice(start, start + pageSize);
    const days = {};
    for (const dateKey of pageKeys) {
      try {
        const data = await this.getDay(dateKey);
        if (data) days[dateKey] = data;
      } catch (e) {
        console.warn(`Failed to load day: ${dateKey}`, e);
      }
    }
    return {
      days,
      keys: pageKeys,
      total,
      page,
      pageSize,
      hasMore: start + pageKeys.length < total
    };
  }
  async putDay(dayData) {
    await this.ensureDir("data");
    const dateKey = dayData.date;
    if (!dateKey) {
      throw new Error("DayData must have a date field");
    }
    const path5 = this.dayPath(dateKey);
    await this.vaultWrite(path5, JSON.stringify(dayData, null, 2));
  }
  async deleteDay(dateKey) {
    const path5 = this.dayPath(dateKey);
    if (await this.app.vault.adapter.exists(path5)) {
      await this.app.vault.adapter.remove(path5);
    }
  }
  // ---- 全局目标 (goals) ----
  goalsPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/goals.json`);
  }
  async getGoals() {
    const path5 = this.goalsPath();
    if (!await this.app.vault.adapter.exists(path5)) {
      return [];
    }
    const content = await this.app.vault.adapter.read(path5);
    return JSON.parse(content);
  }
  async putGoals(goals) {
    const path5 = this.goalsPath();
    await this.vaultWrite(path5, JSON.stringify(goals, null, 2));
  }
  // ---- 设置 (settings) ----
  settingsPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/settings.json`);
  }
  async getSetting(key) {
    const settings = await this.getAllSettings();
    return settings[key] ?? null;
  }
  async putSetting(key, value) {
    const path5 = (0, import_obsidian.normalizePath)(this.settingsPath());
    const abstract = this.app.vault.getAbstractFileByPath(path5);
    if (abstract instanceof import_obsidian.TFile) {
      await this.app.vault.process(abstract, (data) => {
        const settings = JSON.parse(data);
        settings[key] = value;
        return JSON.stringify(settings, null, 2);
      });
    } else {
      await this.vaultWrite(path5, JSON.stringify({ [key]: value }, null, 2));
    }
  }
  async getAllSettings() {
    const path5 = this.settingsPath();
    if (!await this.app.vault.adapter.exists(path5)) {
      return {};
    }
    try {
      const content = await this.app.vault.adapter.read(path5);
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  // ---- 购买历史 (purchase-history.json) ----
  purchaseHistoryPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/purchase-history.json`);
  }
  async getPurchaseHistory() {
    const path5 = this.purchaseHistoryPath();
    if (!await this.app.vault.adapter.exists(path5)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path5);
    return JSON.parse(content);
  }
  async putPurchaseHistory(data) {
    const path5 = this.purchaseHistoryPath();
    await this.vaultWrite(path5, JSON.stringify(data, null, 2));
  }
  // ---- 收入历史 (income-history.json) ----
  incomeHistoryPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/income-history.json`);
  }
  async getIncomeHistory() {
    const path5 = this.incomeHistoryPath();
    if (!await this.app.vault.adapter.exists(path5)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path5);
    return JSON.parse(content);
  }
  async putIncomeHistory(data) {
    const path5 = this.incomeHistoryPath();
    await this.vaultWrite(path5, JSON.stringify(data, null, 2));
  }
  // ---- 导出/导入 ----
  async exportAllData() {
    const [days, goals, settings, purchaseHistory, incomeHistory] = await Promise.all([
      this.getAllDays(),
      this.getGoals(),
      this.getAllSettings(),
      this.getPurchaseHistory(),
      this.getIncomeHistory()
    ]);
    return {
      version: "3.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      storageType: "vault",
      days,
      goals,
      settings,
      purchaseHistory,
      incomeHistory,
      themes: [],
      reports: []
    };
  }
  async importData(data, options) {
    await this.ensureStructure();
    if (data.days) {
      for (const day of Object.values(data.days)) {
        await this.putDay(day);
      }
    }
    if (data.goals) {
      await this.putGoals(data.goals);
    }
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await this.putSetting(key, value);
      }
    }
    if (data.purchaseHistory) {
      await this.putPurchaseHistory(data.purchaseHistory);
    }
    if (data.incomeHistory) {
      await this.putIncomeHistory(data.incomeHistory);
    }
  }
  async clearAll() {
    if (await this.app.vault.adapter.exists(this.basePath)) {
      await this.app.vault.adapter.rmdir(this.basePath, true);
    }
    await this.ensureStructure();
  }
  // ---- Markdown 摘要 ----
  reviewPath(dateKey) {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/reviews/${dateKey}.md`);
  }
  async writeMarkdownReview(dateKey, markdown) {
    await this.ensureDir("reviews");
    const path5 = this.reviewPath(dateKey);
    await this.vaultWrite(path5, markdown);
  }
  async deleteMarkdownReview(dateKey) {
    const path5 = this.reviewPath(dateKey);
    if (await this.app.vault.adapter.exists(path5)) {
      await this.app.vault.adapter.remove(path5);
    }
  }
};

// src/storage/MarkdownSync.ts
var MarkdownSync = class {
  /** 将 DayData 转换为 Markdown */
  static generateMarkdown(data) {
    const lines = [];
    lines.push("---");
    lines.push(`date: "${data.date}"`);
    lines.push(`weekday: "${data.weekday}"`);
    lines.push("type: Bamboo Immortals");
    lines.push("---");
    lines.push("");
    lines.push(`# ${data.date} ${data.weekday}\u590D\u76D8`);
    lines.push("");
    if (data.metrics) {
      lines.push("## \u6307\u6807");
      const m = data.metrics;
      const parts = [];
      if (m.firstCheckIn) parts.push(`\u9996\u6B21\u6253\u5361: ${m.firstCheckIn}`);
      if (m.lastCheckIn) parts.push(`\u672B\u6B21\u6253\u5361: ${m.lastCheckIn}`);
      if (m.completedTasks) parts.push(`\u5B8C\u6210\u4EFB\u52A1: ${m.completedTasks}`);
      if (m.inspirationCount) parts.push(`\u7075\u611F: ${m.inspirationCount}`);
      if (m.activeTime) parts.push(`\u6D3B\u8DC3\u65F6\u957F: ${m.activeTime}`);
      if (m.emptySlots) parts.push(`\u7A7A\u767D\u65F6\u6BB5: ${m.emptySlots}`);
      if (parts.length > 0) {
        lines.push(`- ${parts.slice(0, 2).join(" | ")}`);
        if (parts.length > 2) {
          lines.push(`- ${parts.slice(2).join(" | ")}`);
        }
      }
      lines.push("");
    }
    if (data.timeline && data.timeline.length > 0) {
      lines.push("## \u65F6\u95F4\u7EBF");
      for (const block of data.timeline) {
        const icon = block.icon ? `${block.icon} ` : "";
        lines.push(`### ${icon}${block.name} (${block.time})`);
        if (block.items) {
          for (const item of block.items) {
            const evalStr = item.eval ? ` - ${item.eval}` : "";
            lines.push(`- ${item.time} ${item.task}${evalStr}`);
          }
        }
        lines.push("");
      }
    }
    if (data.goals && data.goals.length > 0) {
      lines.push("## \u76EE\u6807\u8FDB\u5EA6");
      for (const goal of data.goals) {
        const icon = goal.icon ? `${goal.icon} ` : "";
        lines.push(`### ${icon}${goal.title}`);
        if (goal.items) {
          for (const item of goal.items) {
            const percent = item.percent !== void 0 ? ` ${item.percent}%` : "";
            const detail = item.detail ? ` (${item.detail})` : "";
            lines.push(`- ${item.name}${percent}${detail}`);
          }
        }
        lines.push("");
      }
    }
    return lines.join("\n");
  }
};

// src/bridge/StorageBridge.ts
var StorageBridge = class {
  constructor(storage, enableMarkdownSync = true) {
    this.storage = storage;
    this.enableMarkdownSync = enableMarkdownSync;
  }
  async handle(message) {
    switch (message.type) {
      case "storage:readDay":
        return await this.storage.getDay(message.payload.dateKey);
      case "storage:writeDay": {
        const result = await this.storage.putDay(message.payload.data);
        if (this.enableMarkdownSync && message.payload.data) {
          try {
            const md = MarkdownSync.generateMarkdown(message.payload.data);
            await this.storage.writeMarkdownReview(message.payload.dateKey, md);
          } catch (e) {
            console.warn("Markdown sync failed:", e);
          }
        }
        return result;
      }
      case "storage:listDays":
        return await this.storage.getAllDays();
      case "storage:deleteDay": {
        await this.storage.deleteMarkdownReview(message.payload.dateKey);
        return await this.storage.deleteDay(message.payload.dateKey);
      }
      case "storage:getSetting":
        return await this.storage.getSetting(message.payload.key);
      case "storage:putSetting":
        return await this.storage.putSetting(message.payload.key, message.payload.value);
      case "storage:getAllSettings":
        return await this.storage.getAllSettings();
      case "storage:getGoals":
        return await this.storage.getGoals();
      case "storage:putGoals":
        return await this.storage.putGoals(message.payload.goals);
      case "storage:getPurchaseHistory":
        return await this.storage.getPurchaseHistory();
      case "storage:putPurchaseHistory":
        return await this.storage.putPurchaseHistory(message.payload.data);
      case "storage:getIncomeHistory":
        return await this.storage.getIncomeHistory();
      case "storage:putIncomeHistory":
        return await this.storage.putIncomeHistory(message.payload.data);
      case "storage:getDayKeys":
        return await this.storage.getDayKeys();
      case "storage:getDaysPaginated":
        return await this.storage.getDaysPaginated(
          message.payload?.page ?? 0,
          message.payload?.pageSize ?? 30
        );
      case "storage:exportAll":
        return await this.storage.exportAllData();
      case "storage:importAll":
        return await this.storage.importData(message.payload.data, message.payload.options);
      case "storage:clearAll":
        return await this.storage.clearAll();
      default:
        throw new Error(`Unknown storage message type: ${message.type}`);
    }
  }
};

// src/bridge/ThemeBridge.ts
var _ThemeBridge = class _ThemeBridge {
  constructor() {
    this.iframe = null;
    this.expectedOrigin = "";
    this._paletteSyncTimer = null;
  }
  attachIframe(iframe) {
    this.iframe = iframe;
    try {
      this.expectedOrigin = new URL(iframe.src).origin;
    } catch {
      this.expectedOrigin = "";
    }
  }
  detachIframe() {
    this.iframe = null;
  }
  /** 获取当前 Obsidian 明暗状态 */
  isDarkMode() {
    return activeDocument.body.classList.contains("theme-dark");
  }
  /** 向 iframe 推送当前主题状态 */
  pushTheme() {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage(
      {
        type: "theme:changed",
        id: "theme_push_" + Date.now(),
        payload: { isDark: this.isDarkMode() }
      },
      "*"
    );
  }
  /** 供外部调用：Obsidian 主题变化时触发 */
  onThemeChanged() {
    this.pushTheme();
  }
  // ===== 双向调色 =====
  /**
   * 计算 webapp 色相/明度 → Obsidian CSS 变量映射
   * 仅覆盖 3 类核心色（强调/背景/文字），其余由 Obsidian 当前主题推算
   */
  static computeObsidianVars(hue, lightnessOffset, isDark) {
    const h = Math.round(hue);
    const lo = Math.max(-30, Math.min(30, lightnessOffset));
    const accentS = 40;
    const accentL = isDark ? 50 : 40;
    const accent = `hsl(${h}, ${accentS}%, ${accentL}%)`;
    const accentHover = `hsl(${h}, ${accentS}%, ${accentL + 5}%)`;
    const bgS = isDark ? 8 : 12;
    const bgL = isDark ? Math.max(5, 12 + lo * 0.3) : Math.min(98, 94 + lo * 0.15);
    const bgPrimary = `hsl(${h}, ${bgS}%, ${bgL}%)`;
    const bgSecondary = `hsl(${h}, ${bgS}%, ${isDark ? bgL + 3 : bgL - 2}%)`;
    const textNormal = isDark ? `hsl(${h}, 6%, 88%)` : `hsl(${h}, 6%, 12%)`;
    const textMuted = isDark ? `hsl(${h}, 4%, 55%)` : `hsl(${h}, 4%, 45%)`;
    return {
      "--interactive-accent": accent,
      "--interactive-accent-hover": accentHover,
      "--text-accent": accent,
      "--background-primary": bgPrimary,
      "--background-secondary": bgSecondary,
      "--text-normal": textNormal,
      "--text-muted": textMuted
    };
  }
  /**
   * 应用调色到 Obsidian 原生界面
   * 50ms debounce，防止色相/明度滑块快速拖拽产生高频 DOM 写入
   */
  applyPalette(hue, lightnessOffset, isDark) {
    if (this._paletteSyncTimer) window.clearTimeout(this._paletteSyncTimer);
    _ThemeBridge._suppressed = false;
    this._paletteSyncTimer = window.setTimeout(() => {
      if (_ThemeBridge._suppressed) return;
      const vars = _ThemeBridge.computeObsidianVars(hue, lightnessOffset, isDark);
      for (const [key, value] of Object.entries(vars)) {
        activeDocument.body.style.setProperty(key, value);
      }
    }, 50);
  }
  /** 清除注入的 CSS 变量，恢复 Obsidian 主题默认值 */
  static restoreDefaults() {
    _ThemeBridge._suppressed = true;
    for (const key of _ThemeBridge.INJECTED_VARS) {
      activeDocument.body.style.removeProperty(key);
    }
  }
};
/** 存储注入的 CSS 变量键名，用于 restoreDefaults 清理 */
_ThemeBridge.INJECTED_VARS = [
  "--interactive-accent",
  "--interactive-accent-hover",
  "--text-accent",
  "--background-primary",
  "--background-secondary",
  "--text-normal",
  "--text-muted"
];
/** 防抖竞态标记：restoreDefaults 被调用后设为 true，阻止延迟回调覆写 */
_ThemeBridge._suppressed = false;
var ThemeBridge = _ThemeBridge;

// src/bridge/BridgeService.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));

// src/constants/audio.ts
var ALLOWED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".aac",
  ".m4a",
  ".wma",
  ".webm",
  ".opus"
];
var AUDIO_MIME_TYPES = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
  ".aac": "audio/aac",
  ".m4a": "audio/mp4",
  ".wma": "audio/x-ms-wma",
  ".webm": "audio/webm",
  ".opus": "audio/opus"
};
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ...AUDIO_MIME_TYPES
};

// src/bridge/BridgeService.ts
var DEFAULT_SKIP_DIRS = [".trash", ".git", "node_modules"];
var BridgeService = class {
  constructor(storageBridge, themeBridge, settings, saveSettings) {
    this.settings = null;
    this.saveSettings = null;
    this.iframe = null;
    this.messageHandler = null;
    this.customThemes = [];
    this.vaultBasePath = "";
    this.noisePath = "";
    this.configDir = "";
    this.expectedOrigin = "";
    this.storageBridge = storageBridge;
    this.themeBridge = themeBridge;
    this.settings = settings || null;
    this.saveSettings = saveSettings || null;
  }
  /** 绑定 iframe 并开始监听消息 */
  attach(iframe) {
    this.detach();
    this.iframe = iframe;
    this.themeBridge.attachIframe(iframe);
    try {
      this.expectedOrigin = new URL(iframe.src).origin;
    } catch {
      this.expectedOrigin = "";
    }
    this.messageHandler = (event) => {
      void this.onMessage(event);
    };
    window.addEventListener("message", this.messageHandler);
  }
  /** 设置自定义主题列表（供插件端扫描后调用） */
  setCustomThemes(themes) {
    this.customThemes = themes;
  }
  /** 设置库根目录路径（供库内音频文件读取使用） */
  setVaultBasePath(basePath) {
    this.vaultBasePath = basePath;
  }
  /** 设置白噪音文件夹路径 */
  setNoisePath(noisePath) {
    this.noisePath = noisePath;
  }
  /** 设置 Obsidian 配置目录名（默认 .obsidian，用户可自定义） */
  setConfigDir(dir) {
    this.configDir = dir;
  }
  /** 扫描库内音频文件（支持指定文件夹或全库扫描） */
  async _scanVaultAudioFiles(maxDepth = 5) {
    const results = [];
    const allowedExts = ALLOWED_AUDIO_EXTENSIONS;
    const basePath = this.vaultBasePath;
    if (!basePath) return results;
    try {
      await fs.promises.stat(basePath);
    } catch {
      return results;
    }
    if (this.noisePath) {
      const targetDir = path.join(basePath, this.noisePath);
      try {
        const entries = await fs.promises.readdir(targetDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".")) continue;
          if (!entry.isFile()) continue;
          const ext = path.extname(entry.name).toLowerCase();
          if (allowedExts.includes(ext)) {
            const stat2 = await fs.promises.stat(path.join(targetDir, entry.name));
            results.push({ path: path.join(this.noisePath, entry.name), name: entry.name, size: stat2.size, ext });
          }
        }
      } catch {
      }
      results.sort((a, b) => a.path.localeCompare(b.path));
      return results;
    }
    const scanDir = async (dirPath, relativePrefix, depth) => {
      if (depth > maxDepth) return;
      let entries;
      try {
        entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = relativePrefix ? path.join(relativePrefix, entry.name) : entry.name;
        if (entry.isDirectory()) {
          const skipDirs = /* @__PURE__ */ new Set([...DEFAULT_SKIP_DIRS, ...this.configDir ? [this.configDir] : []]);
          if (skipDirs.has(entry.name)) continue;
          await scanDir(fullPath, relativePath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (allowedExts.includes(ext)) {
            try {
              const stat2 = await fs.promises.stat(fullPath);
              results.push({ path: relativePath, name: entry.name, size: stat2.size, ext });
            } catch {
            }
          }
        }
      }
    };
    await scanDir(basePath, "", 0);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  }
  /** 解绑 iframe，停止监听 */
  detach() {
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
      this.messageHandler = null;
    }
    this.themeBridge.detachIframe();
    this.iframe = null;
  }
  /** 消息路由处理 */
  async onMessage(event) {
    const msg = event.data;
    if (!msg || !msg.type || !msg.id) return;
    if (this.iframe && event.source !== this.iframe.contentWindow) {
      return;
    }
    if (this.expectedOrigin && event.origin !== this.expectedOrigin) {
      console.warn("[BridgeService] Ignored message from unknown origin:", event.origin);
      return;
    }
    if (!msg.type.startsWith("storage:") && !msg.type.startsWith("app:") && !msg.type.startsWith("file:") && !msg.type.startsWith("theme:")) {
      return;
    }
    if (msg.type === "app:ready") {
      this.themeBridge.pushTheme();
      this.respond(msg.id, {
        ok: true,
        sectionConfig: this.settings?.sectionConfig || null,
        customThemes: this.customThemes,
        customNoises: this.settings?.noiseItems || [],
        syncPaletteToObsidian: this.settings?.syncPaletteToObsidian || false
      });
      return;
    }
    if (msg.type === "app:close") {
      this.respond(msg.id, { ok: true });
      return;
    }
    if (msg.type === "app:saveSectionConfig") {
      if (this.settings) {
        this.settings.sectionConfig = msg.payload;
        if (this.saveSettings) await this.saveSettings();
      }
      this.respond(msg.id, { ok: true });
      return;
    }
    if (msg.type === "app:saveCustomNoises") {
      if (this.settings) {
        this.settings.noiseItems = msg.payload || [];
        if (this.saveSettings) await this.saveSettings();
      }
      this.respond(msg.id, { ok: true });
      return;
    }
    if (msg.type === "app:toggleTheme") {
      const targetIsDark = msg.payload.isDark === true;
      const currentIsDark = activeDocument.body.classList.contains("theme-dark");
      if (targetIsDark !== currentIsDark) {
        if (targetIsDark) {
          activeDocument.body.classList.remove("theme-light");
          activeDocument.body.classList.add("theme-dark");
        } else {
          activeDocument.body.classList.remove("theme-dark");
          activeDocument.body.classList.add("theme-light");
        }
        this.themeBridge.pushTheme();
      }
      this.respond(msg.id, { ok: true, isDark: targetIsDark });
      return;
    }
    if (msg.type === "theme:syncPalette") {
      if (this.settings?.syncPaletteToObsidian) {
        const { hue, lightnessOffset, isDark } = msg.payload;
        this.themeBridge.applyPalette(hue, lightnessOffset, isDark);
      }
      this.respond(msg.id, { ok: true });
      return;
    }
    if (msg.type === "app:listVaultAudioFiles") {
      try {
        if (!this.vaultBasePath) {
          throw new Error("\u65E0\u6CD5\u83B7\u53D6\u5E93\u6839\u76EE\u5F55\u8DEF\u5F84\uFF0C\u8BF7\u5C1D\u8BD5\u91CD\u65B0\u6253\u5F00\u9762\u677F");
        }
        const files = await this._scanVaultAudioFiles();
        this.respond(msg.id, { files });
      } catch (error) {
        console.error("[Bamboo] \u626B\u63CF\u5E93\u5185\u97F3\u9891\u6587\u4EF6\u5931\u8D25:", error);
        this.respondError(msg.id, error.message || "\u626B\u63CF\u5E93\u6587\u4EF6\u5931\u8D25");
      }
      return;
    }
    if (msg.type === "app:readVaultFile") {
      try {
        const relativePath = msg.payload?.path || "";
        if (!relativePath) throw new Error("\u672A\u63D0\u4F9B\u6587\u4EF6\u8DEF\u5F84");
        const ext = path.extname(relativePath).toLowerCase();
        if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error("\u4E0D\u652F\u6301\u7684\u97F3\u9891\u683C\u5F0F\uFF1A" + ext);
        if (!this.vaultBasePath) throw new Error("\u65E0\u6CD5\u83B7\u53D6\u5E93\u6839\u76EE\u5F55\u8DEF\u5F84");
        const vaultBasePath = this.vaultBasePath;
        const fullPath = path.join(vaultBasePath, relativePath);
        if (!fullPath.startsWith(vaultBasePath)) {
          throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62\uFF1A" + relativePath);
        }
        try {
          await fs.promises.stat(fullPath);
        } catch {
          throw new Error("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A" + relativePath);
        }
        this.respond(msg.id, { filePath: fullPath, name: path.basename(relativePath, ext) });
      } catch (error) {
        this.respondError(msg.id, error.message || "\u8BFB\u53D6\u5E93\u6587\u4EF6\u5931\u8D25");
      }
      return;
    }
    if (msg.type === "app:readLocalFile") {
      try {
        const filePath = msg.payload?.path || "";
        if (!filePath) throw new Error("\u672A\u63D0\u4F9B\u6587\u4EF6\u8DEF\u5F84");
        if (filePath.includes("..")) throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62");
        const ext = path.extname(filePath).toLowerCase();
        if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error("\u4E0D\u652F\u6301\u7684\u97F3\u9891\u683C\u5F0F\uFF1A" + ext);
        try {
          await fs.promises.stat(filePath);
        } catch {
          throw new Error("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A" + filePath);
        }
        this.respond(msg.id, { filePath, name: path.basename(filePath, ext) });
      } catch (error) {
        this.respondError(msg.id, error.message || "\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25");
      }
      return;
    }
    try {
      const result = await this.storageBridge.handle(msg);
      this.respond(msg.id, result);
    } catch (error) {
      this.respondError(msg.id, error.message || "Unknown error");
    }
  }
  /** 根据文件扩展名获取 MIME 类型 */
  _getAudioMimeType(ext) {
    return AUDIO_MIME_TYPES[ext] || "application/octet-stream";
  }
  /** 向 iframe 发送成功响应 */
  respond(id, payload) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ id, payload }, "*");
  }
  /** 向 iframe 发送错误响应 */
  respondError(id, error) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ id, error }, "*");
  }
};

// src/views/DailyReviewView.ts
var VIEW_TYPE_DAILY_REVIEW = "bamboo-immortals";
var DailyReviewView = class extends import_obsidian2.ItemView {
  constructor(leaf, webappPath, settings, saveSettings) {
    super(leaf);
    this.bridgeService = null;
    this.themeBridge = null;
    this.iframe = null;
    this.iframeErrorHandler = null;
    this.cssChangeRef = null;
    this.webappPath = webappPath;
    this.settings = settings;
    this.saveSettings = saveSettings;
  }
  getViewType() {
    return VIEW_TYPE_DAILY_REVIEW;
  }
  getDisplayText() {
    return "\u7AF9\u6797\u4FEE\u4ED9\u4F20";
  }
  getIcon() {
    return "leaf";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("bamboo-review-container");
    if (!this.webappPath) {
      container.createEl("div", {
        text: "\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u65E0\u6CD5\u5B9A\u4F4D webapp \u8D44\u6E90\uFF0C\u8BF7\u68C0\u67E5\u63D2\u4EF6\u5B89\u88C5\u76EE\u5F55",
        cls: "bamboo-review-error"
      });
      return;
    }
    this.iframe = container.createEl("iframe", {
      cls: "bamboo-review-frame",
      attr: {
        src: this.webappPath,
        allow: "camera; microphone; clipboard-read; clipboard-write"
      }
    });
    this.iframeErrorHandler = (e) => {
      console.error("[BambooReview] iframe failed to load:", this.webappPath);
    };
    this.iframe.addEventListener("error", this.iframeErrorHandler);
    const storage = new VaultStorage(this.app);
    await storage.ensureStructure();
    const storageBridge = new StorageBridge(storage, this.settings.enableMarkdownSync);
    this.themeBridge = new ThemeBridge();
    this.bridgeService = new BridgeService(
      storageBridge,
      this.themeBridge,
      this.settings,
      this.saveSettings
    );
    const customThemes = this._scanCustomThemes();
    this.bridgeService.setCustomThemes(customThemes);
    const vaultBasePath = this.app.vault.adapter.basePath || "";
    if (vaultBasePath) {
      this.bridgeService.setVaultBasePath(vaultBasePath);
    }
    if (this.settings.noisePath) {
      this.bridgeService.setNoisePath(this.settings.noisePath);
    }
    this.bridgeService.setConfigDir(this.app.vault.configDir);
    this.bridgeService.attach(this.iframe);
    this.themeBridge.attachIframe(this.iframe);
    this.cssChangeRef = this.app.workspace.on("css-change", () => {
      this.themeBridge?.onThemeChanged();
    });
  }
  async onClose() {
    this.bridgeService?.detach();
    this.bridgeService = null;
    if (this.cssChangeRef) {
      this.app.workspace.offref(this.cssChangeRef);
      this.cssChangeRef = null;
    }
    this.themeBridge?.detachIframe();
    this.themeBridge = null;
    if (this.iframe && this.iframeErrorHandler) {
      this.iframe.removeEventListener("error", this.iframeErrorHandler);
      this.iframeErrorHandler = null;
    }
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
  /** 扫描 Vault 下的自定义主题文件夹（路径由用户设置指定） */
  _scanCustomThemes() {
    const themes = [];
    try {
      const vaultBasePath = this.app.vault.adapter.basePath || "";
      if (!vaultBasePath) return themes;
      const themeDirName = this.settings.themePath || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
      const themesDir = path2.join(vaultBasePath, themeDirName);
      if (!fs2.existsSync(themesDir) || !fs2.statSync(themesDir).isDirectory()) return themes;
      const entries = fs2.readdirSync(themesDir);
      for (const entry of entries) {
        if (!entry.endsWith(".js")) continue;
        const filePath = path2.join(themesDir, entry);
        if (!fs2.statSync(filePath).isFile()) continue;
        try {
          const code = fs2.readFileSync(filePath, "utf-8");
          if (!code.includes("__bamboo_theme_")) {
            console.warn(`[BambooReview] \u81EA\u5B9A\u4E49\u4E3B\u9898 ${entry} \u7F3A\u5C11 __bamboo_theme_ \u6807\u8BC6\u7B26\uFF0C\u5DF2\u8DF3\u8FC7`);
            continue;
          }
          themes.push({
            name: entry.replace(/\.js$/, ""),
            code
          });
        } catch (err) {
          console.error(`[BambooReview] \u8BFB\u53D6\u81EA\u5B9A\u4E49\u4E3B\u9898 ${entry} \u5931\u8D25:`, err.message);
        }
      }
      if (themes.length > 0) {
        console.log(`[BambooReview] \u53D1\u73B0 ${themes.length} \u4E2A\u81EA\u5B9A\u4E49\u4E3B\u9898:`, themes.map((t) => t.name));
      }
    } catch (err) {
      console.log("[BambooReview] \u626B\u63CF\u81EA\u5B9A\u4E49\u4E3B\u9898\u65F6\u51FA\u9519:", err.message);
    }
    return themes;
  }
};

// src/server/LocalServer.ts
var http = __toESM(require("http"));
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var net = __toESM(require("net"));
var LocalServer = class {
  constructor(webappDir) {
    this.server = null;
    this.port = 0;
    this.vaultBasePath = "";
    this.webappDir = webappDir;
  }
  /** 设置库根目录（供 /bamboo-audio 音频代理使用） */
  setVaultBasePath(basePath) {
    this.vaultBasePath = basePath;
  }
  /** 启动服务器，返回监听端口 */
  async start() {
    if (this.server) return this.port;
    this.port = await this.findFreePort();
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });
      this.server.on("error", (err) => {
        console.error("[BambooReview] Server error:", err);
        reject(new Error(`Server error: ${err.message}`));
      });
      this.server.listen(this.port, "127.0.0.1", () => {
        console.log(`[BambooReview] Local server started on port ${this.port}`);
        resolve(this.port);
      });
    });
  }
  /** 停止服务器 */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log("[BambooReview] Local server stopped");
          this.server = null;
          this.port = 0;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  /** 获取服务器 URL */
  getUrl() {
    return `http://127.0.0.1:${this.port}`;
  }
  /** 处理 HTTP 请求 */
  handleRequest(req, res) {
    const url = req.url || "/";
    if (url.startsWith("/bamboo-audio")) {
      this.handleAudioProxy(req, res);
      return;
    }
    let urlPath = url.split("?")[0];
    if (urlPath.endsWith("/")) {
      urlPath += "index.html";
    }
    const safePath = path3.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path3.join(this.webappDir, safePath);
    if (!filePath.startsWith(this.webappDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs3.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
      const ext = path3.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
      });
      const stream = fs3.createReadStream(filePath);
      stream.pipe(res);
      stream.on("error", () => {
        if (!res.headersSent) {
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      });
    });
  }
  /** /bamboo-audio?path=xxx — 流式代理库内音频文件 */
  handleAudioProxy(req, res) {
    try {
      const rawUrl = req.url || "";
      const queryIndex = rawUrl.indexOf("?");
      if (queryIndex === -1) {
        res.writeHead(400);
        res.end("Missing path parameter");
        return;
      }
      const queryStr = rawUrl.slice(queryIndex + 1);
      const params = new URLSearchParams(queryStr);
      const relativePath = params.get("path");
      if (!relativePath) {
        res.writeHead(400);
        res.end("Missing path parameter");
        return;
      }
      const ext = path3.extname(relativePath).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
        res.writeHead(403);
        res.end("Forbidden: unsupported audio format");
        return;
      }
      const normalized = path3.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
      if (!normalized || normalized.startsWith("..") || normalized.startsWith("/")) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      if (!this.vaultBasePath) {
        res.writeHead(500);
        res.end("Vault base path not configured");
        return;
      }
      const fullPath = path3.join(this.vaultBasePath, normalized);
      if (!fullPath.startsWith(this.vaultBasePath)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      fs3.stat(fullPath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404);
          res.end("File not found");
          return;
        }
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": contentType,
          "Content-Length": stats.size,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600"
        });
        const stream = fs3.createReadStream(fullPath);
        stream.pipe(res);
        stream.on("error", () => {
          if (!res.headersSent) {
            res.writeHead(500);
            res.end("Stream error");
          }
        });
      });
    } catch (e) {
      if (!res.headersSent) {
        res.writeHead(500);
        console.error("[BambooReview] Audio proxy error:", e);
        res.end("Internal Server Error");
      }
    }
  }
  /** 查找可用端口 */
  findFreePort() {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
      server.on("error", reject);
    });
  }
};

// src/settings/PluginSettings.ts
var import_obsidian3 = require("obsidian");
var DEFAULT_SETTINGS = {
  dataPath: "bamboo-review",
  enableMarkdownSync: true,
  sectionConfig: null,
  themePath: "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898",
  noisePath: "",
  noiseItems: [],
  syncPaletteToObsidian: false
};
var PluginSettings = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("bamboo-review-settings");
    new import_obsidian3.Setting(containerEl).setName("\u7AF9\u6797\u4FEE\u4ED9\u4F20 - \u8BBE\u7F6E").setHeading();
    new import_obsidian3.Setting(containerEl).setName("\u6570\u636E\u5B58\u50A8").setHeading();
    new import_obsidian3.Setting(containerEl).setName("\u6570\u636E\u5B58\u50A8\u8DEF\u5F84").setDesc("\u590D\u76D8\u6570\u636E\u5728 Vault \u4E2D\u7684\u5B58\u50A8\u76EE\u5F55\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("bamboo-review").setValue(this.plugin.settings.dataPath).onChange(async (value) => {
        this.plugin.settings.dataPath = value || "bamboo-review";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u81EA\u52A8\u751F\u6210 Markdown \u6458\u8981").setDesc("\u6BCF\u6B21\u4FDD\u5B58\u590D\u76D8\u6570\u636E\u65F6\uFF0C\u81EA\u52A8\u5728 reviews/ \u76EE\u5F55\u4E0B\u751F\u6210\u53EF\u8BFB\u7684 .md \u6587\u4EF6").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enableMarkdownSync).onChange(async (value) => {
        this.plugin.settings.enableMarkdownSync = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u4E3B\u9898\u52A8\u6548").setHeading();
    new import_obsidian3.Setting(containerEl).setName("\u81EA\u5B9A\u4E49\u4E3B\u9898\u8DEF\u5F84").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u5B58\u653E\u81EA\u5B9A\u4E49\u4E3B\u9898 .js \u6587\u4EF6\u7684\u6587\u4EF6\u5939\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u7AF9\u6797\u590D\u76D8\u4E3B\u9898").setValue(this.plugin.settings.themePath).onChange(async (value) => {
        this.plugin.settings.themePath = value || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u767D\u566A\u97F3").setHeading();
    new import_obsidian3.Setting(containerEl).setName("\u767D\u566A\u97F3\u6587\u4EF6\u5939").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u7684\u76F8\u5BF9\u8DEF\u5F84\uFF0C\u6307\u5B9A\u540E\u4EC5\u626B\u63CF\u8BE5\u6587\u4EF6\u5939\u5185\u7684\u97F3\u9891\u6587\u4EF6\u3002\u7559\u7A7A\u5219\u626B\u63CF\u6574\u4E2A\u5E93\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u767D\u566A\u97F3 \u6216\u7559\u7A7A\u626B\u63CF\u5168\u5E93").setValue(this.plugin.settings.noisePath).onChange(async (value) => {
        this.plugin.settings.noisePath = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u8C03\u8272\u8054\u52A8").setHeading();
    new import_obsidian3.Setting(containerEl).setName("\u5C06\u8C03\u8272\u540C\u6B65\u5230 Obsidian").setDesc("\u6253\u5F00\u540E\uFF0Cwebapp \u5185\u60AC\u6D6E\u83DC\u5355\u7684\u8272\u76F8/\u660E\u5EA6\u8C03\u8272\u4F1A\u5B9E\u65F6\u540C\u6B65\u5230 Obsidian \u7684\u539F\u751F\u754C\u9762\u914D\u8272").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.syncPaletteToObsidian).onChange(async (value) => {
        this.plugin.settings.syncPaletteToObsidian = value;
        await this.plugin.saveSettings();
        if (!value) {
          ThemeBridge.restoreDefaults();
        }
        const frame = activeDocument.querySelector(".bamboo-review-frame");
        if (frame?.contentWindow) {
          frame.contentWindow.postMessage({
            type: "theme:syncPaletteEnabled",
            id: "settings_" + Date.now(),
            payload: { enabled: value }
          }, "*");
        }
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u5173\u4E8E").setHeading();
    const pluginBox = containerEl.createDiv({ cls: "bamboo-about-card" });
    pluginBox.createEl("p", { text: "\u63D2\u4EF6\u7B80\u4ECB", cls: "bamboo-about-label" });
    pluginBox.createEl("p", {
      text: 'Bamboo Immortals\uFF08\u7AF9\u6797\u4FEE\u4ED9\u4F20\uFF09\u662F\u4E00\u6B3E\u57FA\u4E8E\u82CF\u8054\u63A7\u5236\u8BBA\u4E4B\u7236\u7EF4\u514B\u6258\xB7\u683C\u5362\u4EC0\u79D1\u592B\u63D0\u51FA\u7684"OGAS"\u7406\u5FF5\uFF0C\u4E13\u4E3A\u4E2A\u4EBA\u6253\u9020\u7684\u4E2D\u56FD\u98CE\u76EE\u6807\u81EA\u52A8\u5316\u5206\u914D\u7BA1\u7406\u7CFB\u7EDF\u3002',
      cls: "bamboo-about-desc"
    });
    const authorBox = containerEl.createDiv({ cls: "bamboo-about-card bamboo-about-author" });
    const authorRow = authorBox.createDiv({ cls: "bamboo-about-author-row" });
    const avatar = authorRow.createDiv({ cls: "bamboo-about-avatar" });
    avatar.setCssStyles({
      backgroundImage: "url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAKAAoADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5UooooAKKKKACiiigAooo9KACiij0oAKKKPSgAooooAKKKKACiij0oAKKKXFACUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFLigUtADaKWkoAKUdKSlFACikNLSGgBKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopRQAlFLikoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAFFFLSGgBKKKKAClFJThQAlJTqbQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAopaQUtACUlLSUAFKKSlFAC0hoooASiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAWlpBS0AFNp1IaAEooooAKKKKACiiigAooooAKKKKACiiigApQKBThQACkNOxTWoAbRRRQAU4U2nCgApKdTTQAlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAKKWkFLQAlJTqbQAUopKUUAFFFJQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFKKAFFLSCloAKQ0tIaAG0UUUAFFFFABRRRQAUUUUAFFFFABSikpRQA4UopKBQAtIaWkNADKKKKACnLTaUUAOooooASm0402gAooooAKKKKACiiigAooooAKKKKACl7UlKKACilpDQAlKKSnUAFJS0dqAG0UUUAFFFFABRRRQAUUUUAFFFFABSikpwoASkpxptABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSik... [truncated]"
    });
    const authorInfo = authorRow.createDiv({ cls: "bamboo-about-author-info" });
    authorInfo.createEl("p", { text: "\u7FBD\u9CDE\u541B", cls: "bamboo-about-author-name" });
    authorInfo.createEl("p", { text: "\u55B5\u5B57\u9986\u521B\u59CB\u4EBA", cls: "bamboo-about-author-role" });
    authorBox.createEl("p", { text: "Obsidian \u63D2\u4EF6\u4F5C\u54C1", cls: "bamboo-about-works-label" });
    const worksRow = authorBox.createDiv({ cls: "bamboo-about-works-row" });
    ["\u7AF9\u53F6\u98DE\u5203", "\u7AF9\u6797\u4FEE\u4ED9\u4F20"].forEach((name) => {
      worksRow.createEl("span", { text: name, cls: "bamboo-about-tag" });
    });
  }
};

// main.ts
var BambooReviewPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.localServer = null;
    this.serverUrl = "";
  }
  async onload() {
    await this.loadSettings();
    const pluginDir = this.manifest.dir;
    if (pluginDir) {
      const vaultBasePath = this.app.vault.adapter.basePath || "";
      const webappDir = path4.join(vaultBasePath, pluginDir, "webapp");
      this.localServer = new LocalServer(webappDir);
      try {
        await this.localServer.start();
        this.serverUrl = this.localServer.getUrl();
        this.localServer.setVaultBasePath(vaultBasePath);
      } catch (e) {
        console.error("[BambooReview] Failed to start local server:", e);
        new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u672C\u5730\u670D\u52A1\u542F\u52A8\u5931\u8D25\uFF0C\u90E8\u5206\u529F\u80FD\uFF08\u767D\u566A\u97F3\u3001\u4E3B\u9898\u52A8\u6548\uFF09\u53EF\u80FD\u4E0D\u53EF\u7528", 0);
      }
    }
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf) => {
      return new DailyReviewView(leaf, this.serverUrl, this.settings, () => this.saveSettings());
    });
    this.addCommand({
      id: "open-daily-review",
      name: "\u6253\u5F00\u4ECA\u65E5\u590D\u76D8",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "navigate-prev-day",
      name: "\u524D\u4E00\u5929",
      callback: () => this.sendToIframe("nav:prevDay")
    });
    this.addCommand({
      id: "navigate-next-day",
      name: "\u540E\u4E00\u5929",
      callback: () => this.sendToIframe("nav:nextDay")
    });
    this.addCommand({
      id: "navigate-today",
      name: "\u56DE\u5230\u4ECA\u5929",
      callback: () => this.sendToIframe("nav:today")
    });
    this.addCommand({
      id: "open-stats",
      name: "\u6253\u5F00\u7EDF\u8BA1\u5206\u6790",
      callback: () => this.sendToIframe("action:openStats")
    });
    this.addCommand({
      id: "open-settings-in-app",
      name: "\u6253\u5F00\u5E94\u7528\u8BBE\u7F6E",
      callback: () => this.sendToIframe("action:openSettings")
    });
    this.addSettingTab(new PluginSettings(this.app, this));
    this.addRibbonIcon("leaf", "\u7AF9\u6797\u4FEE\u4ED9\u4F20", () => {
      void this.activateView();
    });
  }
  onunload() {
    void this.localServer?.stop();
    this.localServer = null;
  }
  /** 激活或创建复盘视图 */
  async activateView() {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        active: true
      });
    }
    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }
  /** 向 iframe 发送导航/操作指令 */
  sendToIframe(type) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length === 0) return;
    const view = leaves[0].view;
    const iframe = view.iframe;
    if (iframe?.contentWindow) {
      let origin = "*";
      try {
        origin = new URL(iframe.src).origin;
      } catch {
      }
      iframe.contentWindow.postMessage(
        { type, id: "cmd_" + Date.now() },
        origin
      );
    }
  }
  /** 加载设置 */
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  /** 保存设置 */
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBEYWlseVJldmlld1ZpZXcsIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgfSBmcm9tICcuL3NyYy92aWV3cy9EYWlseVJldmlld1ZpZXcnO1xuaW1wb3J0IHsgTG9jYWxTZXJ2ZXIgfSBmcm9tICcuL3NyYy9zZXJ2ZXIvTG9jYWxTZXJ2ZXInO1xuaW1wb3J0IHtcbiAgUGx1Z2luU2V0dGluZ3MsXG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG59IGZyb20gJy4vc3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqXG4gKiBCYW1ib29SZXZpZXdQbHVnaW4gLSBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTZDRThcdTUxOEMgVmlldyBcdTdDN0JcdTU3OEJcbiAqIDIuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1RkYwOFx1NjI1M1x1NUYwMFx1NTkwRFx1NzZEOFx1MzAwMVx1NTI0RC9cdTU0MEVcdTRFMDBcdTU5MjlcdTMwMDFcdTdFREZcdThCQTFcdTk3NjJcdTY3N0ZcdUZGMDlcbiAqIDMuIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICogNC4gXHU3QkExXHU3NDA2XHU2M0QyXHU0RUY2XHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgbG9jYWxTZXJ2ZXI6IExvY2FsU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VydmVyVXJsID0gJyc7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcbiAgICBjb25zdCBwbHVnaW5EaXIgPSAodGhpcy5tYW5pZmVzdCBhcyBhbnkpLmRpcjtcbiAgICBpZiAocGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGNvbnN0IHdlYmFwcERpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAnKTtcbiAgICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBuZXcgTG9jYWxTZXJ2ZXIod2ViYXBwRGlyKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jYWxTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSB0aGlzLmxvY2FsU2VydmVyLmdldFVybCgpO1xuICAgICAgICAvLyBcdTYyOEFcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdTRGMjBcdTdFRDkgTG9jYWxTZXJ2ZXJcdUZGMENcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcbiAgICAgICAgdGhpcy5sb2NhbFNlcnZlci5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBGYWlsZWQgdG8gc3RhcnQgbG9jYWwgc2VydmVyOicsIGUpO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjcyQ1x1NTczMFx1NjcwRFx1NTJBMVx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTBFOFx1NTIwNlx1NTI5Rlx1ODBGRFx1RkYwOFx1NzY3RFx1NTY2QVx1OTdGM1x1MzAwMVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1RkYwOVx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1NzUyOCcsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0RBSUxZX1JFVklFVywgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGFpbHlSZXZpZXdWaWV3KGxlYWYsIHRoaXMuc2VydmVyVXJsLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnByZXZEYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6bmV4dERheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtdG9kYXknLFxuICAgICAgbmFtZTogJ1x1NTZERVx1NTIzMFx1NEVDQVx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjp0b2RheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TdGF0cycpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU2V0dGluZ3MnKSxcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9udW5sb2FkKCk6IHZvaWQge1xuICAgIHZvaWQgdGhpcy5sb2NhbFNlcnZlcj8uc3RvcCgpO1xuICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1NkZDMFx1NkQzQlx1NjIxNlx1NTIxQlx1NUVGQVx1NTkwRFx1NzZEOFx1ODlDNlx1NTZGRSAqL1xuICBhc3luYyBhY3RpdmF0ZVZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwO1xuXG4gICAgbGV0IGxlYWY6IFdvcmtzcGFjZUxlYWYgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBsZWF2ZXMgPSB3b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuXG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBcdTVERjJcdTY3MDlcdTg5QzZcdTU2RkVcdUZGMENcdTc2RjRcdTYzQTVcdTgwNUFcdTcxMjZcbiAgICAgIGxlYWYgPSBsZWF2ZXNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NTIxQlx1NUVGQVx1NjVCMFx1ODlDNlx1NTZGRVxuICAgICAgbGVhZiA9IHdvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKTtcbiAgICAgIGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHtcbiAgICAgICAgdHlwZTogVklFV19UWVBFX0RBSUxZX1JFVklFVyxcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGxlYWYpIHtcbiAgICAgIGF3YWl0IHdvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYWYpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NUJGQ1x1ODIyQS9cdTY0Q0RcdTRGNUNcdTYzMDdcdTRFRTQgKi9cbiAgcHJpdmF0ZSBzZW5kVG9JZnJhbWUodHlwZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcbiAgICBpZiAobGVhdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdmlldyA9IGxlYXZlc1swXS52aWV3IGFzIERhaWx5UmV2aWV3VmlldztcbiAgICBjb25zdCBpZnJhbWUgPSAodmlldyBhcyBhbnkpLmlmcmFtZSBhcyBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKGlmcmFtZT8uY29udGVudFdpbmRvdykge1xuICAgICAgbGV0IG9yaWdpbiA9ICcqJztcbiAgICAgIHRyeSB7IG9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luOyB9IGNhdGNoIHsgLyoga2VlcCAnKicgKi8gfVxuICAgICAgaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICAgIHsgdHlwZSwgaWQ6ICdjbWRfJyArIERhdGUubm93KCkgfSxcbiAgICAgICAgb3JpZ2luXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICB9XG5cbiAgLyoqIFx1NEZERFx1NUI1OFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBzYXZlU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEl0ZW1WaWV3LCBXb3Jrc3BhY2VMZWFmIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IFN0b3JhZ2VCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvU3RvcmFnZUJyaWRnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5pbXBvcnQgeyBCcmlkZ2VTZXJ2aWNlIH0gZnJvbSAnLi4vYnJpZGdlL0JyaWRnZVNlcnZpY2UnO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuZXhwb3J0IGNvbnN0IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgPSAnYmFtYm9vLWltbW9ydGFscyc7XG5cbi8qKlxuICogRGFpbHlSZXZpZXdWaWV3IC0gXHU0RTNCXHU4OUM2XHU1NkZFXG4gKlxuICogXHU4MDRDXHU4RDIzXHU2NzgxXHU3QjgwXHVGRjFBXG4gKiAxLiBcdTUyMUJcdTVFRkEgaWZyYW1lIFx1NjI3Rlx1OEY3RCBQV0FcbiAqIDIuIFx1N0JBMVx1NzQwNiBCcmlkZ2VTZXJ2aWNlIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICogMy4gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NUU3Nlx1NTQwQ1x1NkI2NVxuICovXG5leHBvcnQgY2xhc3MgRGFpbHlSZXZpZXdWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuICBwcml2YXRlIGJyaWRnZVNlcnZpY2U6IEJyaWRnZVNlcnZpY2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lRXJyb3JIYW5kbGVyOiAoKGU6IEV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNzc0NoYW5nZVJlZjogYW55ID0gbnVsbDtcbiAgcHJpdmF0ZSB3ZWJhcHBQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCB3ZWJhcHBQYXRoOiBzdHJpbmcsIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncywgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIobGVhZik7XG4gICAgdGhpcy53ZWJhcHBQYXRoID0gd2ViYXBwUGF0aDtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3M7XG4gIH1cblxuICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXO1xuICB9XG5cbiAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCc7XG4gIH1cblxuICBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdsZWFmJztcbiAgfVxuXG4gIGFzeW5jIG9uT3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXTtcbiAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctY29udGFpbmVyJyk7XG5cbiAgICBpZiAoIXRoaXMud2ViYXBwUGF0aCkge1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjVFMFx1NkNENVx1NUI5QVx1NEY0RCB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU2M0QyXHU0RUY2XHU1Qjg5XHU4OEM1XHU3NkVFXHU1RjU1JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUyMUJcdTVFRkEgaWZyYW1lIC0gXHU0RTBEXHU0RjdGXHU3NTI4IHNhbmRib3hcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTZCNjIgYXBwOi8vIFx1NTM0Rlx1OEJBRVx1NEUwQlx1NzY4NFx1NUI1MFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFxuICAgIHRoaXMuaWZyYW1lID0gY29udGFpbmVyLmNyZWF0ZUVsKCdpZnJhbWUnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWZyYW1lJyxcbiAgICAgIGF0dHI6IHtcbiAgICAgICAgc3JjOiB0aGlzLndlYmFwcFBhdGgsXG4gICAgICAgIGFsbG93OiAnY2FtZXJhOyBtaWNyb3Bob25lOyBjbGlwYm9hcmQtcmVhZDsgY2xpcGJvYXJkLXdyaXRlJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBpZnJhbWUgXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU2NUY2XHU2NjNFXHU3OTNBXHU2M0QwXHU3OTNBXG4gICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSAoZTogRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIGlmcmFtZSBmYWlsZWQgdG8gbG9hZDonLCB0aGlzLndlYmFwcFBhdGgpO1xuICAgIH07XG4gICAgdGhpcy5pZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG5cbiAgICAvLyBcdTUyMURcdTU5Q0JcdTUzMTZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgYXdhaXQgc3RvcmFnZS5lbnN1cmVTdHJ1Y3R1cmUoKTtcblxuICAgIGNvbnN0IHN0b3JhZ2VCcmlkZ2UgPSBuZXcgU3RvcmFnZUJyaWRnZShzdG9yYWdlLCB0aGlzLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG5ldyBUaGVtZUJyaWRnZSgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG5ldyBCcmlkZ2VTZXJ2aWNlKFxuICAgICAgc3RvcmFnZUJyaWRnZSxcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UsXG4gICAgICB0aGlzLnNldHRpbmdzLFxuICAgICAgdGhpcy5zYXZlU2V0dGluZ3NcbiAgICApO1xuXG4gICAgLy8gXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUyRFx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFxuICAgIGNvbnN0IGN1c3RvbVRoZW1lcyA9IHRoaXMuX3NjYW5DdXN0b21UaGVtZXMoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Q3VzdG9tVGhlbWVzKGN1c3RvbVRoZW1lcyk7XG5cbiAgICAvLyBcdTRGMjBcdTkwMTJcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTc2N0RcdTU2NkFcdTk3RjNcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTYyNkJcdTYzQ0YvXHU4QkZCXHU1M0Q2XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgaWYgKHZhdWx0QmFzZVBhdGgpIHtcbiAgICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgIH1cbiAgICAvLyBcdTRGMjBcdTkwMTJcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5ub2lzZVBhdGgpIHtcbiAgICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXROb2lzZVBhdGgodGhpcy5zZXR0aW5ncy5ub2lzZVBhdGgpO1xuICAgIH1cbiAgICAvLyBcdTRGMjBcdTkwMTIgT2JzaWRpYW4gXHU5MTREXHU3RjZFXHU3NkVFXHU1RjU1XHU1NDBEXHVGRjA4XHU2NTJGXHU2MzAxXHU3NTI4XHU2MjM3XHU4MUVBXHU1QjlBXHU0RTQ5IC5vYnNpZGlhbiBcdTU0MERcdTc5RjBcdUZGMDlcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Q29uZmlnRGlyKHRoaXMuYXBwLnZhdWx0LmNvbmZpZ0Rpcik7XG5cbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UuYXR0YWNoKHRoaXMuaWZyYW1lKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZSh0aGlzLmlmcmFtZSk7XG5cbiAgICAvLyBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XG4gICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSB0aGlzLmFwcC53b3Jrc3BhY2Uub24oJ2Nzcy1jaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlPy5vblRoZW1lQ2hhbmdlZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgb25DbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2U/LmRldGFjaCgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFM0JcdTk4OThcdTc2RDFcdTU0MkNcbiAgICBpZiAodGhpcy5jc3NDaGFuZ2VSZWYpIHtcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vZmZyZWYodGhpcy5jc3NDaGFuZ2VSZWYpO1xuICAgICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMudGhlbWVCcmlkZ2U/LmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGlmcmFtZSBlcnJvciBcdTc2RDFcdTU0MkNcdTU2NjhcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuICAgICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWVcbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTBCXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU4REVGXHU1Rjg0XHU3NTMxXHU3NTI4XHU2MjM3XHU4QkJFXHU3RjZFXHU2MzA3XHU1QjlBXHVGRjA5ICovXG4gIHByaXZhdGUgX3NjYW5DdXN0b21UaGVtZXMoKTogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiB7XG4gICAgY29uc3QgdGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBpZiAoIXZhdWx0QmFzZVBhdGgpIHJldHVybiB0aGVtZXM7XG5cbiAgICAgIGNvbnN0IHRoZW1lRGlyTmFtZSA9IHRoaXMuc2V0dGluZ3MudGhlbWVQYXRoIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgY29uc3QgdGhlbWVzRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHRoZW1lRGlyTmFtZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhlbWVzRGlyKSB8fCAhZnMuc3RhdFN5bmModGhlbWVzRGlyKS5pc0RpcmVjdG9yeSgpKSByZXR1cm4gdGhlbWVzO1xuXG4gICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmModGhlbWVzRGlyKTtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoIWVudHJ5LmVuZHNXaXRoKCcuanMnKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoZW1lc0RpciwgZW50cnkpO1xuICAgICAgICBpZiAoIWZzLnN0YXRTeW5jKGZpbGVQYXRoKS5pc0ZpbGUoKSkgY29udGludWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb2RlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAvLyBcdTVGRUJcdTkwMUZcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTUzMDVcdTU0MkJcdTVGQzVcdTk3MDBcdTc2ODQgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlxuICAgICAgICAgIGlmICghY29kZS5pbmNsdWRlcygnX19iYW1ib29fdGhlbWVfJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1N0YzQVx1NUMxMSBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlbWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLFxuICAgICAgICAgICAgY29kZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtCYW1ib29SZXZpZXddIFx1OEJGQlx1NTNENlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTU5MzFcdThEMjU6YCwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGVtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gXHU1M0QxXHU3M0IwICR7dGhlbWVzLmxlbmd0aH0gXHU0RTJBXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4OmAsIHRoZW1lcy5tYXAodCA9PiB0Lm5hbWUpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjVGNlx1NTFGQVx1OTUxOTonLCBlcnIubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1RkYwQ1x1NUMwNlx1OERGM1x1OEZDNzogJHtwYXRofWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsRGF5cygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XG4gICAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwYXJzZSBkYXkgZmlsZTogJHtmaWxlfWAsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF5cztcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTY1RTVcdTY3MUYga2V5XHVGRjA4XHU2MzA5XHU2NUU1XHU2NzFGXHU5NjREXHU1RThGXHVGRjBDXHU2NzAwXHU2NUIwXHU1NzI4XHU1MjREXHVGRjA5ICovXG4gIGFzeW5jIGdldERheUtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKGRhdGVLZXkpIGtleXMucHVzaChkYXRlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAga2V5cy5zb3J0KCkucmV2ZXJzZSgpOyAvLyBcdTk2NERcdTVFOEZcdUZGMUFcdTY3MDBcdTY1QjBcdTY1RTVcdTY3MUZcdTU3MjhcdTUyNERcbiAgICByZXR1cm4ga2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMDZcdTk4NzVcdTUyQTBcdThGN0RcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcbiAgICogQHBhcmFtIHBhZ2UgXHU5ODc1XHU3ODAxXHVGRjA4XHU0RUNFIDAgXHU1RjAwXHU1OUNCXHVGRjA5XG4gICAqIEBwYXJhbSBwYWdlU2l6ZSBcdTZCQ0ZcdTk4NzVcdTY1NzBcdTkxQ0ZcbiAgICogQHJldHVybnMgeyBkYXlzLCB0b3RhbCwgcGFnZSwgcGFnZVNpemUsIGhhc01vcmUgfVxuICAgKi9cbiAgYXN5bmMgZ2V0RGF5c1BhZ2luYXRlZChwYWdlID0gMCwgcGFnZVNpemUgPSAzMCk6IFByb21pc2U8e1xuICAgIGRheXM6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAga2V5czogc3RyaW5nW107XG4gICAgdG90YWw6IG51bWJlcjtcbiAgICBwYWdlOiBudW1iZXI7XG4gICAgcGFnZVNpemU6IG51bWJlcjtcbiAgICBoYXNNb3JlOiBib29sZWFuO1xuICB9PiB7XG4gICAgY29uc3QgYWxsS2V5cyA9IGF3YWl0IHRoaXMuZ2V0RGF5S2V5cygpO1xuICAgIGNvbnN0IHRvdGFsID0gYWxsS2V5cy5sZW5ndGg7XG4gICAgY29uc3Qgc3RhcnQgPSBwYWdlICogcGFnZVNpemU7XG4gICAgY29uc3QgcGFnZUtleXMgPSBhbGxLZXlzLnNsaWNlKHN0YXJ0LCBzdGFydCArIHBhZ2VTaXplKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGRhdGVLZXkgb2YgcGFnZUtleXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldERheShkYXRlS2V5KTtcbiAgICAgICAgaWYgKGRhdGEpIGRheXNbZGF0ZUtleV0gPSBkYXRhO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBsb2FkIGRheTogJHtkYXRlS2V5fWAsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBkYXlzLFxuICAgICAga2V5czogcGFnZUtleXMsXG4gICAgICB0b3RhbCxcbiAgICAgIHBhZ2UsXG4gICAgICBwYWdlU2l6ZSxcbiAgICAgIGhhc01vcmU6IHN0YXJ0ICsgcGFnZUtleXMubGVuZ3RoIDwgdG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHB1dERheShkYXlEYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0ZUtleSA9IGRheURhdGEuZGF0ZTtcbiAgICBpZiAoIWRhdGVLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF5RGF0YSBtdXN0IGhhdmUgYSBkYXRlIGZpZWxkJyk7XG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRheURhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZURheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDcgKGdvYWxzKSAtLS0tXG5cbiAgcHJpdmF0ZSBnb2Fsc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9nb2Fscy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRHb2FscygpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyB1bmtub3duO1xuICB9XG5cbiAgYXN5bmMgcHV0R29hbHMoZ29hbHM6IHVua25vd25bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShnb2FscywgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdThCQkVcdTdGNkUgKHNldHRpbmdzKSAtLS0tXG5cbiAgcHJpdmF0ZSBzZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9zZXR0aW5ncy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRTZXR0aW5nKGtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCB0aGlzLmdldEFsbFNldHRpbmdzKCk7XG4gICAgcmV0dXJuIHNldHRpbmdzW2tleV0gPz8gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHB1dFNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgodGhpcy5zZXR0aW5nc1BhdGgoKSk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgLy8gdmF1bHQucHJvY2VzcyBcdTUzOUZcdTVCNTAgcmVhZC1tb2RpZnktd3JpdGVcdUZGMENcdTY3NUNcdTdFRERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IEpTT04ucGFyc2UoZGF0YSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIHNldHRpbmdzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoeyBba2V5XTogdmFsdWUgfSwgbnVsbCwgMikpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbFNldHRpbmdzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1OEQyRFx1NEU3MFx1NTM4Nlx1NTNGMiAocHVyY2hhc2UtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBwdXJjaGFzZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcHVyY2hhc2UtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRQdXJjaGFzZUhpc3RvcnkoKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyB1bmtub3duO1xuICB9XG5cbiAgYXN5bmMgcHV0UHVyY2hhc2VIaXN0b3J5KGRhdGE6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyIChpbmNvbWUtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBpbmNvbWVIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2luY29tZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEluY29tZUhpc3RvcnkoKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dEluY29tZUhpc3RvcnkoZGF0YTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU1QkZDXHU1MUZBL1x1NUJGQ1x1NTE2NSAtLS0tXG5cbiAgYXN5bmMgZXhwb3J0QWxsRGF0YSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IFtkYXlzLCBnb2Fscywgc2V0dGluZ3MsIHB1cmNoYXNlSGlzdG9yeSwgaW5jb21lSGlzdG9yeV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmdldEFsbERheXMoKSxcbiAgICAgIHRoaXMuZ2V0R29hbHMoKSxcbiAgICAgIHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSxcbiAgICAgIHRoaXMuZ2V0UHVyY2hhc2VIaXN0b3J5KCksXG4gICAgICB0aGlzLmdldEluY29tZUhpc3RvcnkoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAnMy4wJyxcbiAgICAgIGV4cG9ydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHN0b3JhZ2VUeXBlOiAndmF1bHQnLFxuICAgICAgZGF5cyxcbiAgICAgIGdvYWxzLFxuICAgICAgc2V0dGluZ3MsXG4gICAgICBwdXJjaGFzZUhpc3RvcnksXG4gICAgICBpbmNvbWVIaXN0b3J5LFxuICAgICAgdGhlbWVzOiBbXSxcbiAgICAgIHJlcG9ydHM6IFtdLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBpbXBvcnREYXRhKGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBvcHRpb25zPzogeyBzdHJhdGVneT86ICdvdmVyd3JpdGUnIHwgJ21lcmdlJyB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcblxuICAgIGlmIChkYXRhLmRheXMpIHtcbiAgICAgIGZvciAoY29uc3QgZGF5IG9mIE9iamVjdC52YWx1ZXMoZGF0YS5kYXlzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dERheShkYXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGF0YS5nb2Fscykge1xuICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhkYXRhLmdvYWxzIGFzIGFueVtdKTtcbiAgICB9XG4gICAgaWYgKGRhdGEuc2V0dGluZ3MpIHtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGRhdGEuc2V0dGluZ3MpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucHV0U2V0dGluZyhrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEucHVyY2hhc2VIaXN0b3J5KSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dFB1cmNoYXNlSGlzdG9yeShkYXRhLnB1cmNoYXNlSGlzdG9yeSk7XG4gICAgfVxuICAgIGlmIChkYXRhLmluY29tZUhpc3RvcnkpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0SW5jb21lSGlzdG9yeShkYXRhLmluY29tZUhpc3RvcnkpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcih0aGlzLmJhc2VQYXRoLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgfVxuXG4gIC8vIC0tLS0gTWFya2Rvd24gXHU2NDU4XHU4OTgxIC0tLS1cblxuICBwcml2YXRlIHJldmlld1BhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9yZXZpZXdzLyR7ZGF0ZUtleX0ubWRgKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nLCBtYXJrZG93bjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBtYXJrZG93bik7XG4gIH1cblxuICBhc3luYyBkZWxldGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBNYXJrZG93blN5bmMgLSBcdTVDMDYgRGF5RGF0YSBKU09OIFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NTNFRlx1OEJGQlx1NzY4NCBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuXG5pbnRlcmZhY2UgRGF5RGF0YSB7XG4gIGRhdGU6IHN0cmluZztcbiAgd2Vla2RheTogc3RyaW5nO1xuICBtZXRyaWNzPzoge1xuICAgIGZpcnN0Q2hlY2tJbj86IHN0cmluZztcbiAgICBsYXN0Q2hlY2tJbj86IHN0cmluZztcbiAgICBjb21wbGV0ZWRUYXNrcz86IHN0cmluZztcbiAgICBpbnNwaXJhdGlvbkNvdW50Pzogc3RyaW5nO1xuICAgIGFjdGl2ZVRpbWU/OiBzdHJpbmc7XG4gICAgZW1wdHlTbG90cz86IHN0cmluZztcbiAgfTtcbiAgdGltZWxpbmU/OiBBcnJheTx7XG4gICAgcGVyaW9kOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHRpbWU6IHN0cmluZztcbiAgICBpY29uPzogc3RyaW5nO1xuICAgIGV2YWw/OiBzdHJpbmc7XG4gICAgaXRlbXM/OiBBcnJheTx7IHRpbWU6IHN0cmluZzsgdGFzazogc3RyaW5nOyBldmFsPzogc3RyaW5nIH0+O1xuICB9PjtcbiAgZ29hbHM/OiBBcnJheTx7XG4gICAgaWNvbj86IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIG1ldGE/OiBzdHJpbmc7XG4gICAgaXRlbXM/OiBBcnJheTx7IG5hbWU6IHN0cmluZzsgcGVyY2VudD86IG51bWJlcjsgZGV0YWlsPzogc3RyaW5nIH0+O1xuICB9Pjtcbn1cblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duU3luYyB7XG4gIC8qKiBcdTVDMDYgRGF5RGF0YSBcdThGNkNcdTYzNjJcdTRFM0EgTWFya2Rvd24gKi9cbiAgc3RhdGljIGdlbmVyYXRlTWFya2Rvd24oZGF0YTogRGF5RGF0YSk6IHN0cmluZyB7XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBmcm9udG1hdHRlclx1RkYwOFx1NTJBOFx1NjAwMVx1NTAzQ1x1NzUyOFx1NTNDQ1x1NUYxNVx1NTNGN1x1NTMwNVx1ODhGOVx1OTYzMlx1NkI2MiBZQU1MIFx1NkNFOFx1NTE2NVx1RkYwOVxuICAgIGxpbmVzLnB1c2goJy0tLScpO1xuICAgIGxpbmVzLnB1c2goYGRhdGU6IFwiJHtkYXRhLmRhdGV9XCJgKTtcbiAgICBsaW5lcy5wdXNoKGB3ZWVrZGF5OiBcIiR7ZGF0YS53ZWVrZGF5fVwiYCk7XG4gICAgbGluZXMucHVzaCgndHlwZTogQmFtYm9vIEltbW9ydGFscycpO1xuICAgIGxpbmVzLnB1c2goJy0tLScpO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2ODA3XHU5ODk4XG4gICAgbGluZXMucHVzaChgIyAke2RhdGEuZGF0ZX0gJHtkYXRhLndlZWtkYXl9XHU1OTBEXHU3NkQ4YCk7XG4gICAgbGluZXMucHVzaCgnJyk7XG5cbiAgICAvLyBcdTYzMDdcdTY4MDdcbiAgICBpZiAoZGF0YS5tZXRyaWNzKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTYzMDdcdTY4MDcnKTtcbiAgICAgIGNvbnN0IG0gPSBkYXRhLm1ldHJpY3M7XG4gICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmIChtLmZpcnN0Q2hlY2tJbikgcGFydHMucHVzaChgXHU5OTk2XHU2QjIxXHU2MjUzXHU1MzYxOiAke20uZmlyc3RDaGVja0lufWApO1xuICAgICAgaWYgKG0ubGFzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1NjcyQlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmxhc3RDaGVja0lufWApO1xuICAgICAgaWYgKG0uY29tcGxldGVkVGFza3MpIHBhcnRzLnB1c2goYFx1NUI4Q1x1NjIxMFx1NEVGQlx1NTJBMTogJHttLmNvbXBsZXRlZFRhc2tzfWApO1xuICAgICAgaWYgKG0uaW5zcGlyYXRpb25Db3VudCkgcGFydHMucHVzaChgXHU3MDc1XHU2MTFGOiAke20uaW5zcGlyYXRpb25Db3VudH1gKTtcbiAgICAgIGlmIChtLmFjdGl2ZVRpbWUpIHBhcnRzLnB1c2goYFx1NkQzQlx1OERDM1x1NjVGNlx1OTU3RjogJHttLmFjdGl2ZVRpbWV9YCk7XG4gICAgICBpZiAobS5lbXB0eVNsb3RzKSBwYXJ0cy5wdXNoKGBcdTdBN0FcdTc2N0RcdTY1RjZcdTZCQjU6ICR7bS5lbXB0eVNsb3RzfWApO1xuXG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGFydHMuc2xpY2UoMCwgMikuam9pbignIHwgJyl9YCk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICB9XG5cbiAgICAvLyBcdTY1RjZcdTk1RjRcdTdFQkZcbiAgICBpZiAoZGF0YS50aW1lbGluZSAmJiBkYXRhLnRpbWVsaW5lLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NjVGNlx1OTVGNFx1N0VCRicpO1xuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBkYXRhLnRpbWVsaW5lKSB7XG4gICAgICAgIGNvbnN0IGljb24gPSBibG9jay5pY29uID8gYCR7YmxvY2suaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7YmxvY2submFtZX0gKCR7YmxvY2sudGltZX0pYCk7XG4gICAgICAgIGlmIChibG9jay5pdGVtcykge1xuICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBibG9jay5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZXZhbFN0ciA9IGl0ZW0uZXZhbCA/IGAgLSAke2l0ZW0uZXZhbH1gIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS50aW1lfSAke2l0ZW0udGFza30ke2V2YWxTdHJ9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNlxuICAgIGlmIChkYXRhLmdvYWxzICYmIGRhdGEuZ29hbHMubGVuZ3RoID4gMCkge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU3NkVFXHU2ODA3XHU4RkRCXHU1RUE2Jyk7XG4gICAgICBmb3IgKGNvbnN0IGdvYWwgb2YgZGF0YS5nb2Fscykge1xuICAgICAgICBjb25zdCBpY29uID0gZ29hbC5pY29uID8gYCR7Z29hbC5pY29ufSBgIDogJyc7XG4gICAgICAgIGxpbmVzLnB1c2goYCMjIyAke2ljb259JHtnb2FsLnRpdGxlfWApO1xuICAgICAgICBpZiAoZ29hbC5pdGVtcykge1xuICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBnb2FsLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBwZXJjZW50ID0gaXRlbS5wZXJjZW50ICE9PSB1bmRlZmluZWQgPyBgICR7aXRlbS5wZXJjZW50fSVgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBkZXRhaWwgPSBpdGVtLmRldGFpbCA/IGAgKCR7aXRlbS5kZXRhaWx9KWAgOiAnJztcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtpdGVtLm5hbWV9JHtwZXJjZW50fSR7ZGV0YWlsfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBNYXJrZG93blN5bmMgfSBmcm9tICcuLi9zdG9yYWdlL01hcmtkb3duU3luYyc7XG5pbXBvcnQgdHlwZSB7IEFueUJyaWRnZU1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcy9tZXNzYWdlcyc7XG5cbi8qKlxuICogU3RvcmFnZUJyaWRnZSAtIFx1NUMwNiBzdG9yYWdlOiogXHU2RDg4XHU2MDZGXHU2NjIwXHU1QzA0XHU1MjMwIFZhdWx0U3RvcmFnZSBcdTY0Q0RcdTRGNUNcbiAqL1xuZXhwb3J0IGNsYXNzIFN0b3JhZ2VCcmlkZ2Uge1xuICBwcml2YXRlIHN0b3JhZ2U6IFZhdWx0U3RvcmFnZTtcbiAgcHJpdmF0ZSBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioc3RvcmFnZTogVmF1bHRTdG9yYWdlLCBlbmFibGVNYXJrZG93blN5bmMgPSB0cnVlKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICB0aGlzLmVuYWJsZU1hcmtkb3duU3luYyA9IGVuYWJsZU1hcmtkb3duU3luYztcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZShtZXNzYWdlOiBBbnlCcmlkZ2VNZXNzYWdlKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cmVhZERheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTp3cml0ZURheSc6IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dERheShtZXNzYWdlLnBheWxvYWQuZGF0YSBhcyBhbnkpO1xuICAgICAgICAvLyBcdTUzQ0NcdTUxOTkgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZU1hcmtkb3duU3luYyAmJiBtZXNzYWdlLnBheWxvYWQuZGF0YSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtZCA9IE1hcmtkb3duU3luYy5nZW5lcmF0ZU1hcmtkb3duKG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIGFueSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uud3JpdGVNYXJrZG93blJldmlldyhtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSwgbWQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTWFya2Rvd24gc3luYyBmYWlsZWQ6JywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6bGlzdERheXMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbERheXMoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpkZWxldGVEYXknOiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVNYXJrZG93blJldmlldyhtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlRGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRTZXR0aW5nKG1lc3NhZ2UucGF5bG9hZC5rZXkpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSwgbWVzc2FnZS5wYXlsb2FkLnZhbHVlKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRBbGxTZXR0aW5ncyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsU2V0dGluZ3MoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0R29hbHMoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0R29hbHMobWVzc2FnZS5wYXlsb2FkLmdvYWxzKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFB1cmNoYXNlSGlzdG9yeSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0UHVyY2hhc2VIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRJbmNvbWVIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0SW5jb21lSGlzdG9yeShtZXNzYWdlLnBheWxvYWQuZGF0YSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5S2V5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5S2V5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheXNQYWdpbmF0ZWQnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheXNQYWdpbmF0ZWQoXG4gICAgICAgICAgKG1lc3NhZ2UgYXMgYW55KS5wYXlsb2FkPy5wYWdlID8/IDAsXG4gICAgICAgICAgKG1lc3NhZ2UgYXMgYW55KS5wYXlsb2FkPy5wYWdlU2l6ZSA/PyAzMFxuICAgICAgICApO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmV4cG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZXhwb3J0QWxsRGF0YSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmltcG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuaW1wb3J0RGF0YShtZXNzYWdlLnBheWxvYWQuZGF0YSwgbWVzc2FnZS5wYXlsb2FkLm9wdGlvbnMpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmNsZWFyQWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhckFsbCgpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RvcmFnZSBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgIH1cbiAgfVxufVxuIiwgIlxuLyoqXG4gKiBUaGVtZUJyaWRnZSAtIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdUZGMENcdTYzQThcdTkwMDFcdTUyMzAgaWZyYW1lXG4gKiAgICAgICAgICAgICAgKyBcdTUzQ0RcdTU0MTFcdUZGMUFcdTYzQTVcdTY1MzYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTAzQ1x1RkYwQ1x1NkNFOFx1NTE2NSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAqL1xuZXhwb3J0IGNsYXNzIFRoZW1lQnJpZGdlIHtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGV4cGVjdGVkT3JpZ2luID0gJyc7XG4gICAgcHJpdmF0ZSBfcGFsZXR0ZVN5bmNUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcblxuICAgIC8qKiBcdTVCNThcdTUwQThcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1OTUyRVx1NTQwRFx1RkYwQ1x1NzUyOFx1NEU4RSByZXN0b3JlRGVmYXVsdHMgXHU2RTA1XHU3NDA2ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgSU5KRUNURURfVkFSUyA9IFtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCcsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnLFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JyxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JyxcbiAgICAgICctLXRleHQtbm9ybWFsJyxcbiAgICAgICctLXRleHQtbXV0ZWQnLFxuICAgIF07XG5cbiAgICAvKiogXHU5NjMyXHU2Mjk2XHU3QURFXHU2MDAxXHU2ODA3XHU4QkIwXHVGRjFBcmVzdG9yZURlZmF1bHRzIFx1ODhBQlx1OEMwM1x1NzUyOFx1NTQwRVx1OEJCRVx1NEUzQSB0cnVlXHVGRjBDXHU5NjNCXHU2QjYyXHU1RUY2XHU4RkRGXHU1NkRFXHU4QzAzXHU4OTg2XHU1MTk5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N1cHByZXNzZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICBhdHRhY2hJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gJyc7XG4gICAgfVxuICB9XG5cbiAgZGV0YWNoSWZyYW1lKCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNEQgT2JzaWRpYW4gXHU2NjBFXHU2Njk3XHU3MkI2XHU2MDAxICovXG4gIGlzRGFya01vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTcyQjZcdTYwMDEgKi9cbiAgcHVzaFRoZW1lKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgaWQ6ICd0aGVtZV9wdXNoXycgKyBEYXRlLm5vdygpLFxuICAgICAgICBwYXlsb2FkOiB7IGlzRGFyazogdGhpcy5pc0RhcmtNb2RlKCkgfSxcbiAgICAgIH0sXG4gICAgICAnKidcbiAgICApO1xuICB9XG5cbiAgLyoqIFx1NEY5Qlx1NTkxNlx1OTBFOFx1OEMwM1x1NzUyOFx1RkYxQU9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMSAqL1xuICBvblRoZW1lQ2hhbmdlZCgpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hUaGVtZSgpO1xuICB9XG5cbiAgLy8gPT09PT0gXHU1M0NDXHU1NDExXHU4QzAzXHU4MjcyID09PT09XG5cbiAgLyoqXG4gICAqIFx1OEJBMVx1N0I5NyB3ZWJhcHAgXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNiBcdTIxOTIgT2JzaWRpYW4gQ1NTIFx1NTNEOFx1OTFDRlx1NjYyMFx1NUMwNFxuICAgKiBcdTRFQzVcdTg5ODZcdTc2RDYgMyBcdTdDN0JcdTY4MzhcdTVGQzNcdTgyNzJcdUZGMDhcdTVGM0FcdThDMDMvXHU4MENDXHU2NjZGL1x1NjU4N1x1NUI1N1x1RkYwOVx1RkYwQ1x1NTE3Nlx1NEY1OVx1NzUzMSBPYnNpZGlhbiBcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTYzQThcdTdCOTdcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlT2JzaWRpYW5WYXJzKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgaCA9IE1hdGgucm91bmQoaHVlKTtcbiAgICBjb25zdCBsbyA9IE1hdGgubWF4KC0zMCwgTWF0aC5taW4oMzAsIGxpZ2h0bmVzc09mZnNldCkpO1xuXG4gICAgLy8gXHU1RjNBXHU4QzAzXHU4MjcyXG4gICAgY29uc3QgYWNjZW50UyA9IDQwO1xuICAgIGNvbnN0IGFjY2VudEwgPSBpc0RhcmsgPyA1MCA6IDQwO1xuICAgIGNvbnN0IGFjY2VudCA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TH0lKWA7XG4gICAgY29uc3QgYWNjZW50SG92ZXIgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEwgKyA1fSUpYDtcblxuICAgIC8vIFx1ODBDQ1x1NjY2Rlx1ODI3MlxuICAgIGNvbnN0IGJnUyA9IGlzRGFyayA/IDggOiAxMjtcbiAgICBjb25zdCBiZ0wgPSBpc0RhcmtcbiAgICAgID8gTWF0aC5tYXgoNSwgMTIgKyBsbyAqIDAuMylcbiAgICAgIDogTWF0aC5taW4oOTgsIDk0ICsgbG8gKiAwLjE1KTtcbiAgICBjb25zdCBiZ1ByaW1hcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7YmdMfSUpYDtcbiAgICBjb25zdCBiZ1NlY29uZGFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtpc0RhcmsgPyBiZ0wgKyAzIDogYmdMIC0gMn0lKWA7XG5cbiAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcbiAgICBjb25zdCB0ZXh0Tm9ybWFsID0gaXNEYXJrID8gYGhzbCgke2h9LCA2JSwgODglKWAgOiBgaHNsKCR7aH0sIDYlLCAxMiUpYDtcbiAgICBjb25zdCB0ZXh0TXV0ZWQgID0gaXNEYXJrID8gYGhzbCgke2h9LCA0JSwgNTUlKWAgOiBgaHNsKCR7aH0sIDQlLCA0NSUpYDtcblxuICAgIHJldHVybiB7XG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInOiBhY2NlbnRIb3ZlcixcbiAgICAgICctLXRleHQtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JzogYmdQcmltYXJ5LFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknOiBiZ1NlY29uZGFyeSxcbiAgICAgICctLXRleHQtbm9ybWFsJzogdGV4dE5vcm1hbCxcbiAgICAgICctLXRleHQtbXV0ZWQnOiB0ZXh0TXV0ZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdThDMDNcdTgyNzJcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqIDUwbXMgZGVib3VuY2VcdUZGMENcdTk2MzJcdTZCNjJcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU2RUQxXHU1NzU3XHU1RkVCXHU5MDFGXHU2MkQ2XHU2MkZEXHU0RUE3XHU3NTFGXHU5QUQ4XHU5ODkxIERPTSBcdTUxOTlcdTUxNjVcbiAgICovXG4gIGFwcGx5UGFsZXR0ZShodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYWxldHRlU3luY1RpbWVyKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpO1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gZmFsc2U7IC8vIFx1NjVCMFx1OEMwM1x1ODI3Mlx1OEJGN1x1NkM0Mlx1NTIzMFx1Njc2NSBcdTIxOTIgXHU4OUUzXHU5NjY0XHU2MjkxXHU1MjM2XG4gICAgdGhpcy5fcGFsZXR0ZVN5bmNUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCkgcmV0dXJuOyAvLyByZXN0b3JlRGVmYXVsdHMgXHU1NzI4XHU5NjMyXHU2Mjk2XHU3QTk3XHU1M0UzXHU1MTg1XHU4OEFCXHU4QzAzXHU3NTI4XG4gICAgICBjb25zdCB2YXJzID0gVGhlbWVCcmlkZ2UuY29tcHV0ZU9ic2lkaWFuVmFycyhodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZhcnMpKSB7XG4gICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLyoqIFx1NkUwNVx1OTY2NFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHVGRjBDXHU2MDYyXHU1OTBEIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OUVEOFx1OEJBNFx1NTAzQyAqL1xuICBzdGF0aWMgcmVzdG9yZURlZmF1bHRzKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBUaGVtZUJyaWRnZS5JTkpFQ1RFRF9WQVJTKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFN0b3JhZ2VCcmlkZ2UgfSBmcm9tICcuL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuL1RoZW1lQnJpZGdlJztcbmltcG9ydCB0eXBlIHsgQW55QnJpZGdlTWVzc2FnZSwgVGhlbWVTeW5jUGFsZXR0ZU1lc3NhZ2UsIEFwcFRvZ2dsZVRoZW1lTWVzc2FnZSwgQXBwU2F2ZVNlY3Rpb25Db25maWdNZXNzYWdlLCBBcHBTYXZlQ3VzdG9tTm9pc2VzTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzL21lc3NhZ2VzJztcbmltcG9ydCB7IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUywgQVVESU9fTUlNRV9UWVBFUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuXG4vKiogXHU2MjZCXHU2M0NGXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2NUY2XHU5RUQ4XHU4QkE0XHU4REYzXHU4RkM3XHU3Njg0XHU3NkVFXHU1RjU1XHU1NDBEXHVGRjA4Y29uZmlnRGlyIFx1NTNFRlx1OTAxQVx1OEZDNyBzZXRDb25maWdEaXIgXHU4MUVBXHU1QjlBXHU0RTQ5XHVGRjA5ICovXG5jb25zdCBERUZBVUxUX1NLSVBfRElSUyA9IFsnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ107XG5cbi8qKlxuICogQnJpZGdlU2VydmljZSAtIHBvc3RNZXNzYWdlIFx1NkQ4OFx1NjA2Rlx1OERFRlx1NzUzMVx1NEUyRFx1NUZDM1xuICpcbiAqIFx1NzZEMVx1NTQyQyBpZnJhbWUgXHU1M0QxXHU2NzY1XHU3Njg0IHBvc3RNZXNzYWdlXHVGRjBDXHU1MjA2XHU1M0QxXHU1MjMwXHU1QkY5XHU1RTk0XHU1OTA0XHU3NDA2XHU2QTIxXHU1NzU3XHVGRjBDXG4gKiBcdTcxMzZcdTU0MEVcdTVDMDZcdTdFRDNcdTY3OUNcdTU2REVcdTRGMjBcdTdFRDkgaWZyYW1lXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBCcmlkZ2VTZXJ2aWNlIHtcbiAgICBwcml2YXRlIHN0b3JhZ2VCcmlkZ2U6IFN0b3JhZ2VCcmlkZ2U7XG4gICAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2U7XG4gICAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCgpID0+IFByb21pc2U8dm9pZD4pIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcjogKChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgY3VzdG9tVGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gICAgcHJpdmF0ZSB2YXVsdEJhc2VQYXRoOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIG5vaXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBjb25maWdEaXI6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgZXhwZWN0ZWRPcmlnaW4gPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlLFxuICAgICAgICB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2UsXG4gICAgICAgIHNldHRpbmdzPzogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgICAgIHNhdmVTZXR0aW5ncz86ICgpID0+IFByb21pc2U8dm9pZD5cbiAgICApIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlQnJpZGdlID0gc3RvcmFnZUJyaWRnZTtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZSA9IHRoZW1lQnJpZGdlO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3MgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3MgfHwgbnVsbDtcbiAgICB9XG5cbiAgLyoqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RTc2XHU1RjAwXHU1OUNCXHU3NkQxXHU1NDJDXHU2RDg4XHU2MDZGICovXG4gIGF0dGFjaChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgLy8gXHU5NjMyXHU2QjYyXHU5MUNEXHU1OTBEXHU3RUQxXHU1QjlBXG4gICAgdGhpcy5kZXRhY2goKTtcblxuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG5cbiAgICAvLyBcdThCQjBcdTVGNTUgZXhwZWN0ZWQgb3JpZ2luXHVGRjBDXHU3NTI4XHU0RThFXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5vbk1lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyMTdcdTg4NjhcdUZGMDhcdTRGOUJcdTYzRDJcdTRFRjZcdTdBRUZcdTYyNkJcdTYzQ0ZcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgc2V0Q3VzdG9tVGhlbWVzKHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pik6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tVGhlbWVzID0gdGhlbWVzO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOFx1NEY5Qlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBzZXRWYXVsdEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnZhdWx0QmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODQgKi9cbiAgc2V0Tm9pc2VQYXRoKG5vaXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNCAub2JzaWRpYW5cdUZGMENcdTc1MjhcdTYyMzdcdTUzRUZcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbiAgc2V0Q29uZmlnRGlyKGRpcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdEaXIgPSBkaXI7XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHU2MjE2XHU1MTY4XHU1RTkzXHU2MjZCXHU2M0NGXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgX3NjYW5WYXVsdEF1ZGlvRmlsZXMobWF4RGVwdGggPSA1KTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFsbG93ZWRFeHRzID0gQUxMT1dFRF9BVURJT19FWFRFTlNJT05TO1xuICAgIGNvbnN0IGJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgIGlmICghYmFzZVBhdGgpIHJldHVybiByZXN1bHRzO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1IGJhc2VQYXRoIFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1RkYwOFx1NUYwMlx1NkI2NVx1RkYwOVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGJhc2VQYXRoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjMwN1x1NUI5QVx1NEU4Nlx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTNFQVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEUwRFx1OTAxMlx1NUY1Mlx1RkYwOVxuICAgIGlmICh0aGlzLm5vaXNlUGF0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0RGlyID0gcGF0aC5qb2luKGJhc2VQYXRoLCB0aGlzLm5vaXNlUGF0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzOiBmcy5EaXJlbnRbXSA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIodGFyZ2V0RGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUoKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQ6IGZzLlN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChwYXRoLmpvaW4odGFyZ2V0RGlyLCBlbnRyeS5uYW1lKSk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiBwYXRoLmpvaW4odGhpcy5ub2lzZVBhdGgsIGVudHJ5Lm5hbWUpLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTY3MkFcdTYzMDdcdTVCOUFcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUxNjhcdTVFOTNcdTkwMTJcdTVGNTJcdTYyNkJcdTYzQ0ZcdUZGMDhcdTVGMDJcdTZCNjUgKyBcdTZERjFcdTVFQTZcdTk2NTBcdTUyMzZcdUZGMDlcbiAgICBjb25zdCBzY2FuRGlyID0gYXN5bmMgKGRpclBhdGg6IHN0cmluZywgcmVsYXRpdmVQcmVmaXg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcbiAgICAgIGxldCBlbnRyaWVzOiBmcy5EaXJlbnRbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVudHJpZXMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGRpclBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgIH0gY2F0Y2ggeyByZXR1cm47IC8qIHNraXAgdW5yZWFkYWJsZSBkaXJzICovIH1cblxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsIGVudHJ5Lm5hbWUpO1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZVByZWZpeCA/IHBhdGguam9pbihyZWxhdGl2ZVByZWZpeCwgZW50cnkubmFtZSkgOiBlbnRyeS5uYW1lO1xuXG4gICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgY29uc3Qgc2tpcERpcnMgPSBuZXcgU2V0KFsuLi5ERUZBVUxUX1NLSVBfRElSUywgLi4uKHRoaXMuY29uZmlnRGlyID8gW3RoaXMuY29uZmlnRGlyXSA6IFtdKV0pO1xuICAgICAgICAgIGlmIChza2lwRGlycy5oYXMoZW50cnkubmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgIGF3YWl0IHNjYW5EaXIoZnVsbFBhdGgsIHJlbGF0aXZlUGF0aCwgZGVwdGggKyAxKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0ZpbGUoKSkge1xuICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBzdGF0OiBmcy5TdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiByZWxhdGl2ZVBhdGgsIG5hbWU6IGVudHJ5Lm5hbWUsIHNpemU6IHN0YXQuc2l6ZSwgZXh0IH0pO1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBhd2FpdCBzY2FuRGlyKGJhc2VQYXRoLCAnJywgMCk7XG4gICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKiBcdTg5RTNcdTdFRDEgaWZyYW1lXHVGRjBDXHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZXNzYWdlSGFuZGxlcikge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnRoZW1lQnJpZGdlLmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTU5MDRcdTc0MDYgKi9cbiAgcHJpdmF0ZSBhc3luYyBvbk1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1zZyA9IGV2ZW50LmRhdGEgYXMgQW55QnJpZGdlTWVzc2FnZTtcbiAgICBpZiAoIW1zZyB8fCAhbXNnLnR5cGUgfHwgIW1zZy5pZCkgcmV0dXJuO1xuXG4gICAgLy8gXHU2ODIxXHU5QThDXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHVGRjFBc291cmNlICsgb3JpZ2luIFx1NTNDQ1x1OTFDRFx1OUE4Q1x1OEJDMVxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiBldmVudC5zb3VyY2UgIT09IHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZXhwZWN0ZWRPcmlnaW4gJiYgZXZlbnQub3JpZ2luICE9PSB0aGlzLmV4cGVjdGVkT3JpZ2luKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tCcmlkZ2VTZXJ2aWNlXSBJZ25vcmVkIG1lc3NhZ2UgZnJvbSB1bmtub3duIG9yaWdpbjonLCBldmVudC5vcmlnaW4pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNlx1NURGMlx1NzdFNVx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4Qlx1NTI0RFx1N0YwMFxuICAgIGlmICghbXNnLnR5cGUuc3RhcnRzV2l0aCgnc3RvcmFnZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnYXBwOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCdmaWxlOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCd0aGVtZTonKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlx1NkQ4OFx1NjA2RlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpyZWFkeScpIHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKCk7XG4gICAgICAvLyBcdTYyOEFcdTYzMDFcdTRFNDVcdTUzMTZcdTc2ODQgc2VjdGlvbkNvbmZpZ1x1MzAwMVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTQ4Q1x1ODFFQVx1NUI5QVx1NEU0OVx1OTdGM1x1NkU5MFx1OTY4RiByZWFkeSBcdTU0Q0RcdTVFOTRcdTUzRDFcdTdFRDkgd2ViYXBwXG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBzZWN0aW9uQ29uZmlnOiB0aGlzLnNldHRpbmdzPy5zZWN0aW9uQ29uZmlnIHx8IG51bGwsXG4gICAgICAgIGN1c3RvbVRoZW1lczogdGhpcy5jdXN0b21UaGVtZXMsXG4gICAgICAgIGN1c3RvbU5vaXNlczogdGhpcy5zZXR0aW5ncz8ubm9pc2VJdGVtcyB8fCBbXSxcbiAgICAgICAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiB0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gfHwgZmFsc2UsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6Y2xvc2UnKSB7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1Njc3Rlx1NTc1N1x1OTE0RFx1N0Y2RVx1NjMwMVx1NEU0NVx1NTMxNlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpzYXZlU2VjdGlvbkNvbmZpZycpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2VjdGlvbkNvbmZpZyA9IG1zZy5wYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmdzKSBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZUN1c3RvbU5vaXNlcycpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Mubm9pc2VJdGVtcyA9IG1zZy5wYXlsb2FkIGFzIHVua25vd25bXSB8fCBbXTtcbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmdzKSBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTRFM0JcdTk4OThcdTUyMDdcdTYzNjJcdThCRjdcdTZDNDJcdUZGMDhpZnJhbWUgXHUyMTkyIE9ic2lkaWFuXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnRvZ2dsZVRoZW1lJykge1xuICAgICAgY29uc3QgdGFyZ2V0SXNEYXJrID0gbXNnLnBheWxvYWQuaXNEYXJrID09PSB0cnVlOyAgICAgIGNvbnN0IGN1cnJlbnRJc0RhcmsgPSBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICAgICAgaWYgKHRhcmdldElzRGFyayAhPT0gY3VycmVudElzRGFyaykge1xuICAgICAgICBpZiAodGFyZ2V0SXNEYXJrKSB7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1saWdodCcpO1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtZGFyaycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtZGFyaycpO1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTkwMUFcdTc3RTUgaWZyYW1lIFx1NEUzQlx1OTg5OFx1NURGMlx1NTIwN1x1NjM2MlxuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSwgaXNEYXJrOiB0YXJnZXRJc0RhcmsgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU4QkY3XHU2QzQyXHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pIHtcbiAgICAgICAgY29uc3QgeyBodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrIH0gPSBtc2cucGF5bG9hZDtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5hcHBseVBhbGV0dGUoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vID09PT09IFx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1RkYxQVx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiA9PT09PVxuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU2MjQwXHU2NzA5XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU0RjlCIHdlYmFwcCBcdTY1ODdcdTRFRjZcdTkwMDlcdTYyRTlcdTU2NjhcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6bGlzdFZhdWx0QXVkaW9GaWxlcycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMENcdThCRjdcdTVDMURcdThCRDVcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTk3NjJcdTY3N0YnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBfc2NhblZhdWx0QXVkaW9GaWxlcygpIFx1NTE4NVx1OTBFOFx1NURGMlx1NUYwMlx1NkI2NVx1NjhDMFx1NjdFNVx1OERFRlx1NUY4NFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKTtcbiAgICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBmaWxlcyB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb10gXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1OicsIGVycm9yKTtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdcdTYyNkJcdTYzQ0ZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTkwMUFcdThGQzdcdTVFOTNcdTUxODVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcdTIwMTQgXHU4RkQ0XHU1NkRFXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1MjREXHU3QUVGXHU3NkY0XHU2M0E1IGZldGNoIGZpbGU6Ly9cbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZFZhdWx0RmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgaWYgKCF0aGlzLnZhdWx0QmFzZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSB0aGlzLnZhdWx0QmFzZVBhdGg7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIC8vIFx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NjhDMFx1NjdFNVx1RkYxQVx1Nzg2RVx1NEZERFx1ODlFM1x1Njc5MFx1NTQwRVx1NzY4NFx1OERFRlx1NUY4NFx1NjcyQVx1OTAwM1x1OTAzOFx1NTFGQSB2YXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgICAgaWYgKCFmdWxsUGF0aC5zdGFydHNXaXRoKHZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjJcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQScgKyByZWxhdGl2ZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZVBhdGg6IGZ1bGxQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKHJlbGF0aXZlUGF0aCwgZXh0KSB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdcdThCRkJcdTUzRDZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTY3MkNcdTU3MzBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdTU2REVcdTRGMjBcdThERUZcdTVGODRcdTc1MzFcdTUyNERcdTdBRUZcdTc1MjggZmlsZTovLyBcdTUyQTBcdThGN0RcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZExvY2FsRmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gbXNnLnBheWxvYWQ/LnBhdGggfHwgJyc7XG4gICAgICAgIGlmICghZmlsZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NjJEMlx1N0VERFx1NTMwNVx1NTQyQlx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NUI1N1x1N0IyNlx1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICBpZiAoZmlsZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZpbGVQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZVBhdGgsIG5hbWU6IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1QjU4XHU1MEE4XHU3QzdCXHU2RDg4XHU2MDZGXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZUJyaWRnZS5oYW5kbGUobXNnKTtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjgzOVx1NjM2RVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1ODNCN1x1NTNENiBNSU1FIFx1N0M3Qlx1NTc4QiAqL1xuICBwcml2YXRlIF9nZXRBdWRpb01pbWVUeXBlKGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gQVVESU9fTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBwYXlsb2FkIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kRXJyb3IoaWQ6IHN0cmluZywgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgaWQsIGVycm9yIH0sICcqJyk7XG4gIH1cbn1cbiIsICIvKiogXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA4XHU1QjhDXHU2NTc0XHU1MjE3XHU4ODY4XHVGRjA5ICovXG5leHBvcnQgY29uc3QgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TID0gW1xuICAnLm1wMycsICcud2F2JywgJy5vZ2cnLCAnLmZsYWMnLCAnLmFhYycsICcubTRhJywgJy53bWEnLCAnLndlYm0nLCAnLm9wdXMnLFxuXTtcblxuLyoqIFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRCBcdTIxOTIgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbmV4cG9ydCBjb25zdCBBVURJT19NSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLm1wMyc6ICAnYXVkaW8vbXBlZycsXG4gICcud2F2JzogICdhdWRpby93YXYnLFxuICAnLm9nZyc6ICAnYXVkaW8vb2dnJyxcbiAgJy5mbGFjJzogJ2F1ZGlvL2ZsYWMnLFxuICAnLmFhYyc6ICAnYXVkaW8vYWFjJyxcbiAgJy5tNGEnOiAgJ2F1ZGlvL21wNCcsXG4gICcud21hJzogICdhdWRpby94LW1zLXdtYScsXG4gICcud2VibSc6ICdhdWRpby93ZWJtJyxcbiAgJy5vcHVzJzogJ2F1ZGlvL29wdXMnLFxufTtcblxuLyoqIFx1NUI4Q1x1NjU3NCBNSU1FIFx1N0M3Qlx1NTc4Qlx1NjYyMFx1NUMwNFx1RkYwOFx1NTQyQiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHVGRjA5ICovXG5leHBvcnQgY29uc3QgTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5odG1sJzogJ3RleHQvaHRtbDsgY2hhcnNldD11dGYtOCcsXG4gICcuY3NzJzogICd0ZXh0L2NzczsgY2hhcnNldD11dGYtOCcsXG4gICcuanMnOiAgICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5tanMnOiAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzb24nOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICcucG5nJzogICdpbWFnZS9wbmcnLFxuICAnLmpwZyc6ICAnaW1hZ2UvanBlZycsXG4gICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJy5naWYnOiAgJ2ltYWdlL2dpZicsXG4gICcuc3ZnJzogICdpbWFnZS9zdmcreG1sJyxcbiAgJy5pY28nOiAgJ2ltYWdlL3gtaWNvbicsXG4gICcud29mZic6ICdmb250L3dvZmYnLFxuICAnLndvZmYyJzonZm9udC93b2ZmMicsXG4gICcudHRmJzogICdmb250L3R0ZicsXG4gIC4uLkFVRElPX01JTUVfVFlQRVMsXG59O1xuIiwgImltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgbmV0IGZyb20gJ25ldCc7XG5pbXBvcnQgeyBNSU1FX1RZUEVTLCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuXG4vKipcbiAqIExvY2FsU2VydmVyIC0gXHU2NzJDXHU1NzMwIEhUVFAgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2NzBEXHU1MkExXHU1NjY4XG4gKlxuICogXHU1NzI4IE9ic2lkaWFuIChFbGVjdHJvbikgXHU3M0FGXHU1ODgzXHU0RTJEXHU1NDJGXHU1MkE4XHU0RTAwXHU0RTJBXHU2NzJDXHU1NzMwIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXG4gKiBcdTRFM0EgaWZyYW1lIFx1NjNEMFx1NEY5QiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU2NzBEXHU1MkExXHVGRjBDXHU3RUQ1XHU4RkM3IGFwcDovLyBcdTUzNEZcdThCQUVcdTc2ODRcdTk2NTBcdTUyMzZcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU2VydmVyIHtcbiAgcHJpdmF0ZSBzZXJ2ZXI6IGh0dHAuU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcG9ydCA9IDA7XG4gIHByaXZhdGUgd2ViYXBwRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG5cbiAgY29uc3RydWN0b3Iod2ViYXBwRGlyOiBzdHJpbmcpIHtcbiAgICB0aGlzLndlYmFwcERpciA9IHdlYmFwcERpcjtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU1NDJGXHU1MkE4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXHU4RkQ0XHU1NkRFXHU3NkQxXHU1NDJDXHU3QUVGXHU1M0UzICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKHRoaXMuc2VydmVyKSByZXR1cm4gdGhpcy5wb3J0O1xuXG4gICAgdGhpcy5wb3J0ID0gYXdhaXQgdGhpcy5maW5kRnJlZVBvcnQoKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QocmVxLCByZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFNlcnZlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbih0aGlzLnBvcnQsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RhcnRlZCBvbiBwb3J0ICR7dGhpcy5wb3J0fWApO1xuICAgICAgICByZXNvbHZlKHRoaXMucG9ydCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTUwNUNcdTZCNjJcdTY3MERcdTUyQTFcdTU2NjggKi9cbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIExvY2FsIHNlcnZlciBzdG9wcGVkJyk7XG4gICAgICAgICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgICAgICAgIHRoaXMucG9ydCA9IDA7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTY3MERcdTUyQTFcdTU2NjggVVJMICovXG4gIGdldFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgaHR0cDovLzEyNy4wLjAuMToke3RoaXMucG9ydH1gO1xuICB9XG5cbiAgLyoqIFx1NTkwNFx1NzQwNiBIVFRQIFx1OEJGN1x1NkM0MiAqL1xuICBwcml2YXRlIGhhbmRsZVJlcXVlc3QocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgLy8gL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU0RUUzXHU3NDA2XHVGRjBDXHU3RUQ1XHU4RkM3IHBvc3RNZXNzYWdlIFx1NTkyNyBwYXlsb2FkIFx1OTY1MFx1NTIzNlxuICAgIGNvbnN0IHVybCA9IHJlcS51cmwgfHwgJy8nO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnL2JhbWJvby1hdWRpbycpKSB7XG4gICAgICB0aGlzLmhhbmRsZUF1ZGlvUHJveHkocmVxLCByZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1ODlFM1x1Njc5MCBVUkxcdUZGMENcdTUzQkJcdTk2NjRcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICBsZXQgdXJsUGF0aCA9IHVybC5zcGxpdCgnPycpWzBdO1xuICAgIC8vIFx1NzZFRVx1NUY1NVx1OUVEOFx1OEJBNFx1NjU4N1x1NEVGNlxuICAgIGlmICh1cmxQYXRoLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHVybFBhdGggKz0gJ2luZGV4Lmh0bWwnO1xuICAgIH1cbiAgICBjb25zdCBzYWZlUGF0aCA9IHBhdGgubm9ybWFsaXplKHVybFBhdGgpLnJlcGxhY2UoL14oXFwuXFwuWy9cXFxcXSkrLywgJycpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMud2ViYXBwRGlyLCBzYWZlUGF0aCk7XG5cbiAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTU3Mjggd2ViYXBwRGlyIFx1NTE4NVxuICAgIGlmICghZmlsZVBhdGguc3RhcnRzV2l0aCh0aGlzLndlYmFwcERpcikpIHtcbiAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTtcbiAgICAgIHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGZzLnN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICBpZiAoZXJyIHx8ICFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XG4gICAgICAgIHJlcy5lbmQoJ05vdCBGb3VuZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RSBNSU1FIFx1N0M3Qlx1NTc4QlxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSBNSU1FX1RZUEVTW2V4dF0gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NEUwRFx1OTcwMFx1ODk4MSBDT1JTXHVGRjBDaWZyYW1lIFx1NEUwRVx1NjcwRFx1NTJBMVx1NTY2OFx1NTQwQ1x1NkU5MFx1RkYwOVxuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScsXG4gICAgICB9KTtcblxuICAgICAgLy8gXHU2RDQxXHU1RjBGXHU0RjIwXHU4RjkzXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBzdHJlYW06IGZzLlJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoKTtcbiAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU2RDQxXHU1RjBGXHU0RUUzXHU3NDA2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9Qcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXM6IFVSTFNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHIpO1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFyYW1zLmdldCgncGF0aCcpO1xuICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHBhdGggcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU1M0VBXHU1MTQxXHU4QkI4XHU2MzA3XHU1QjlBXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUocmVsYXRpdmVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogdW5zdXBwb3J0ZWQgYXVkaW8gZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzk4MVx1NkI2Mlx1OERFRlx1NUY4NFx1N0E3Rlx1OEQ4QVxuICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IHBhdGgubm9ybWFsaXplKHJlbGF0aXZlUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcuLicpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTsgcmVzLmVuZCgnVmF1bHQgYmFzZSBwYXRoIG5vdCBjb25maWd1cmVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCBub3JtYWxpemVkKTtcbiAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnMuc3RhdChmdWxsUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7IHJlcy5lbmQoJ0ZpbGUgbm90IGZvdW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBzdGF0cy5zaXplLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3RyZWFtOiBmcy5SZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmdWxsUGF0aCk7XG4gICAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIHJlcy5lbmQoJ1N0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gcHJveHkgZXJyb3I6JywgZSk7XG4gICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY3RTVcdTYyN0VcdTUzRUZcdTc1MjhcdTdBRUZcdTUzRTMgKi9cbiAgcHJpdmF0ZSBmaW5kRnJlZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgc2VydmVyLmxpc3RlbigwLCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3J0ID0gKHNlcnZlci5hZGRyZXNzKCkgYXMgbmV0LkFkZHJlc3NJbmZvKS5wb3J0O1xuICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4gcmVzb2x2ZShwb3J0KSk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59IiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcblxuLyoqIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyAqL1xuZXhwb3J0IGludGVyZmFjZSBCYW1ib29SZXZpZXdTZXR0aW5ncyB7XG4gIC8qKiBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdTY4MzlcdThERUZcdTVGODQgKi9cbiAgZGF0YVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEgKi9cbiAgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuICAvKiogXHU2NzdGXHU1NzU3XHU3QkExXHU3NDA2XHU5MTREXHU3RjZFXHVGRjA4XHU1M0VGXHU4OUMxXHU2MDI3ICsgXHU2MzkyXHU1RThGXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFIHdlYmFwcCBpZnJhbWUgbG9jYWxTdG9yYWdlIFx1NEUwRFx1NTNFRlx1OTc2MFx1NjVGNlx1NjMwMVx1NEU0NVx1NTMxNiAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDkgKi9cbiAgdGhlbWVQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTNcdUZGMDkgKi9cbiAgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTUyMTdcdTg4NjhcdUZGMDhcdTkwMUFcdThGQzdcdTY4NjVcdTYzQTVcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMENcdTUxNEJcdTY3MEQgbG9jYWxTdG9yYWdlIHBvcnQtc2NvcGVkIFx1OTVFRVx1OTg5OFx1RkYwOSAqL1xuICBub2lzZUl0ZW1zOiB1bmtub3duW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVDMDYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjIgKi9cbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSB7XG4gIGRhdGFQYXRoOiAnYmFtYm9vLXJldmlldycsXG4gIGVuYWJsZU1hcmtkb3duU3luYzogdHJ1ZSxcbiAgc2VjdGlvbkNvbmZpZzogbnVsbCxcbiAgdGhlbWVQYXRoOiAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JyxcbiAgbm9pc2VQYXRoOiAnJyxcbiAgbm9pc2VJdGVtczogW10sXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogZmFsc2UsXG59O1xuXG4vKipcbiAqIFBsdWdpblNldHRpbmdzIC0gT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gKi9cbmV4cG9ydCBjbGFzcyBQbHVnaW5TZXR0aW5ncyBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1zZXR0aW5ncycpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vID09PSBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU1NzI4IFZhdWx0IFx1NEUyRFx1NzY4NFx1NUI1OFx1NTBBOFx1NzZFRVx1NUY1NVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignYmFtYm9vLXJldmlldycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoID0gdmFsdWUgfHwgJ2JhbWJvby1yZXZpZXcnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBNYXJrZG93biBcdTY0NThcdTg5ODFcdTU0MENcdTZCNjVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxJylcbiAgICAgIC5zZXREZXNjKCdcdTZCQ0ZcdTZCMjFcdTRGRERcdTVCNThcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTU3MjggcmV2aWV3cy8gXHU3NkVFXHU1RjU1XHU0RTBCXHU3NTFGXHU2MjEwXHU1M0VGXHU4QkZCXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjYnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NUI1OFx1NjUzRVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoID0gdmFsdWUgfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTc2N0RcdTU2NkFcdTk3RjMgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGMycpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOScpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU2MzA3XHU1QjlBXHU1NDBFXHU0RUM1XHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHU1MTg1XHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHUzMDAyXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU2NTc0XHU0RTJBXHU1RTkzXHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTc2N0RcdTU2NkFcdTk3RjMgXHU2MjE2XHU3NTU5XHU3QTdBXHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1QzA2XHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMEN3ZWJhcHAgXHU1MTg1XHU2MEFDXHU2RDZFXHU4M0RDXHU1MzU1XHU3Njg0XHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1OEMwM1x1ODI3Mlx1NEYxQVx1NUI5RVx1NjVGNlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTc2ODRcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdTkxNERcdTgyNzInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKGZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBlbmFibGVkOiB2YWx1ZSB9XG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTUxNzNcdTRFOEVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU1MTczXHU0RThFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAxXHVGRjFBXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBsdWdpbkJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdCYW1ib28gSW1tb3J0YWxzXHVGRjA4XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHVGRjA5XHU2NjJGXHU0RTAwXHU2QjNFXHU1N0ZBXHU0RThFXHU4MkNGXHU4MDU0XHU2M0E3XHU1MjM2XHU4QkJBXHU0RTRCXHU3MjM2XHU3RUY0XHU1MTRCXHU2MjU4XHUwMEI3XHU2ODNDXHU1MzYyXHU0RUMwXHU3OUQxXHU1OTJCXHU2M0QwXHU1MUZBXHU3Njg0XCJPR0FTXCJcdTc0MDZcdTVGRjVcdUZGMENcdTRFMTNcdTRFM0FcdTRFMkFcdTRFQkFcdTYyNTNcdTkwMjBcdTc2ODRcdTRFMkRcdTU2RkRcdTk4Q0VcdTc2RUVcdTY4MDdcdTgxRUFcdTUyQThcdTUzMTZcdTUyMDZcdTkxNERcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnXG4gICAgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQgYmFtYm9vLWFib3V0LWF1dGhvcicgfSk7XG4gICAgY29uc3QgYXV0aG9yUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm93JyB9KTtcbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF2YXRhcicgfSk7XG4gICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvMndCREFBWUVCUVlGQkFZR0JRWUhCd1lJQ2hBS0Nna0pDaFFPRHd3UUZ4UVlHQmNVRmhZYUhTVWZHaHNqSEJZV0lDd2dJeVluS1NvcEdSOHRNQzBvTUNVb0tTai8yd0JEQVFjSEJ3b0lDaE1LQ2hNb0doWWFLQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0NqL3dBQVJDQUtBQW9BREFTSUFBaEVCQXhFQi84UUFId0FBQVFVQkFRRUJBUUVBQUFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSQUFBZ0VEQXdJRUF3VUZCQVFBQUFGOUFRSURBQVFSQlJJaE1VRUdFMUZoQnlKeEZES0JrYUVJSTBLeHdSVlMwZkFrTTJKeWdna0tGaGNZR1JvbEppY29LU28wTlRZM09EazZRMFJGUmtkSVNVcFRWRlZXVjFoWldtTmtaV1puYUdscWMzUjFkbmQ0ZVhxRGhJV0doNGlKaXBLVGxKV1dsNWlabXFLanBLV21wNmlwcXJLenRMVzJ0N2k1dXNMRHhNWEd4OGpKeXRMVDFOWFcxOWpaMnVIaTQrVGw1dWZvNmVyeDh2UDA5ZmIzK1BuNi84UUFId0VBQXdFQkFRRUJBUUVCQVFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSRUFBZ0VDQkFRREJBY0ZCQVFBQVFKM0FBRUNBeEVFQlNFeEJoSkJVUWRoY1JNaU1vRUlGRUtSb2JIQkNTTXpVdkFWWW5MUkNoWWtOT0VsOFJjWUdSb21KeWdwS2pVMk56ZzVPa05FUlVaSFNFbEtVMVJWVmxkWVdWcGpaR1ZtWjJocGFuTjBkWFozZUhsNmdvT0VoWWFIaUltS2twT1VsWmFYbUptYW9xT2twYWFucUttcXNyTzB0YmEzdUxtNndzUEV4Y2JIeU1uSzB0UFUxZGJYMk5uYTR1UGs1ZWJuNk9ucTh2UDA5ZmIzK1BuNi85b0FEQU1CQUFJUkF4RUFQd0Q1VW9vb29BS0tLS0FDaWlpZ0Fvb285S0FDaWlqMG9BS0tLUFNnQW9vb29BS0tLS0FDaWlqMG9BS0tLWEZBQ1VVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGTGlnVXRBRGFLV2tvQUtVZEtTbEZBQ2lrTkxTR2dCS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vcFJRQWxGTGlrb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBRkZGTFNHZ0JLS0tLQUNsRkpUaFFBbEpUcWJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBb3BhUVV0QUNVbExTVUFGS0tTbEZBQzBob29vQVNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FXbHBCUzBBRk5wMUlhQUVvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQXBRS0JUaFFBQ2tOT3hUV29BYlJSUlFBVTRVMm5DZ0FwS2RUVFFBbEZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFLS1drRkxRQWxKVHFiUUFVb3BLVVVBRkZGSlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRktLQUZGTFNDbG9BS1EwdElhQUcwVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJTaWtwUlFBNFVvcEtCUUF0SWFXa05BREtLS0tBQ25MVGFVVUFPb29vb0FTbTA0MDJnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2w3VWxLS0FDaWxwRFFBbEtLU25VQUZKUzBkcUFHMFVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrcHdvQVNrcHhwdEFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrLi4uIFt0cnVuY2F0ZWRdJ1xuICAgIH0pO1xuXG4gICAgY29uc3QgYXV0aG9ySW5mbyA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLWluZm8nIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTdGQkRcdTlDREVcdTU0MUInLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLW5hbWUnIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTU1QjVcdTVCNTdcdTk5ODZcdTUyMUJcdTU5Q0JcdTRFQkEnLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvbGUnIH0pO1xuXG4gICAgLy8gXHU0RjVDXHU1NEMxXHU1MzNBXG4gICAgYXV0aG9yQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU0RjVDXHU1NEMxJywgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLWxhYmVsJyB9KTtcbiAgICBjb25zdCB3b3Jrc1JvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3Mtcm93JyB9KTtcblxuICAgIFsnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCddLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICB3b3Jrc1Jvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogbmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFzQztBQUN0QyxJQUFBQyxRQUFzQjs7O0FDRHRCLElBQUFDLG1CQUF3QztBQUN4QyxJQUFBQyxR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QkFBZ0Isc0JBQXNCO0FBRS9ELFFBQUksT0FBTyxTQUFTLEdBQUc7QUFFckIsYUFBTyxPQUFPLENBQUM7QUFBQSxJQUNqQixPQUFPO0FBRUwsYUFBTyxVQUFVLFFBQVEsS0FBSztBQUM5QixZQUFNLEtBQUssYUFBYTtBQUFBLFFBQ3RCLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBRUEsUUFBSSxNQUFNO0FBQ1IsWUFBTSxVQUFVLFdBQVcsSUFBSTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxhQUFhLE1BQW9CO0FBQ3ZDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0Isc0JBQXNCO0FBQ3hFLFFBQUksT0FBTyxXQUFXLEVBQUc7QUFFekIsVUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLFVBQU0sU0FBVSxLQUFhO0FBQzdCLFFBQUksUUFBUSxlQUFlO0FBQ3pCLFVBQUksU0FBUztBQUNiLFVBQUk7QUFBRSxpQkFBUyxJQUFJLElBQUksT0FBTyxHQUFHLEVBQUU7QUFBQSxNQUFRLFFBQVE7QUFBQSxNQUFpQjtBQUNwRSxhQUFPLGNBQWM7QUFBQSxRQUNuQixFQUFFLE1BQU0sSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQUEsUUFDaEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQzNFO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsRUFDbkM7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJzdGF0IiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
