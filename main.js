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
var fs4 = __toESM(require("fs"));
var zlib = __toESM(require("zlib"));
var https = __toESM(require("https"));

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
        const paginatedPayload = message.payload;
        return await this.storage.getDaysPaginated(
          paginatedPayload.page ?? 0,
          paginatedPayload.pageSize ?? 30
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
    this.keydownForwarder = null;
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
    const obsidianDoc = activeDocument;
    this.keydownForwarder = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const evt = new KeyboardEvent("keydown", {
          key: e.key,
          code: e.code,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          bubbles: true,
          cancelable: true
        });
        obsidianDoc.body.dispatchEvent(evt);
      }
    };
    document.addEventListener("keydown", this.keydownForwarder, true);
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
    if (this.keydownForwarder) {
      document.removeEventListener("keydown", this.keydownForwarder, true);
      this.keydownForwarder = null;
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
function extractZip(source, destDir) {
  const buf = typeof source === "string" ? fs4.readFileSync(source) : source;
  let pos = 0;
  const read16 = () => {
    const v = buf.readUInt16LE(pos);
    pos += 2;
    return v;
  };
  const read32 = () => {
    const v = buf.readUInt32LE(pos);
    pos += 4;
    return v;
  };
  const skip = (n) => {
    pos += n;
  };
  while (pos < buf.length - 4) {
    const sig = buf.readUInt32LE(pos);
    if (sig !== 67324752) break;
    pos += 4;
    read16();
    const flags = read16();
    const method = read16();
    skip(4);
    const crc32 = read32();
    const compressedSize = read32();
    const uncompressedSize = read32();
    const nameLen = read16();
    const extraLen = read16();
    const fileName = buf.toString("utf-8", pos, pos + nameLen);
    pos += nameLen + extraLen;
    if (fileName.endsWith("/") || fileName.endsWith("\\")) {
      pos += compressedSize;
      continue;
    }
    const outPath = path4.join(destDir, fileName);
    fs4.mkdirSync(path4.dirname(outPath), { recursive: true });
    const data = buf.subarray(pos, pos + compressedSize);
    pos += compressedSize;
    if (method === 0) {
      fs4.writeFileSync(outPath, data);
      continue;
    }
    if (method === 8) {
      try {
        const decompressed = zlib.inflateRawSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
        if (decompressed.length !== uncompressedSize) {
          fs4.writeFileSync(outPath, decompressed.subarray(0, uncompressedSize));
        } else {
          fs4.writeFileSync(outPath, decompressed);
        }
      } catch {
        fs4.writeFileSync(outPath, zlib.inflateSync(data));
      }
      continue;
    }
    throw new Error(`Unsupported compression method: ` + method + " (" + fileName + ")");
  }
}
function downloadAndExtractWebapp(pluginDir, destDir, version) {
  return new Promise((resolve, reject) => {
    const url = `https://github.com/miaoziguan/obsidian-bamboo-immortals/releases/download/${version}/webapp.zip`;
    https.get(url, { headers: { "User-Agent": "obsidian-bamboo-immortals" } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location || "", { headers: { "User-Agent": "obsidian-bamboo-immortals" } }, (redir) => {
          const chunks2 = [];
          redir.on("data", (c) => chunks2.push(c));
          redir.on("end", () => {
            try {
              extractZip(Buffer.concat(chunks2), destDir);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          redir.on("error", reject);
        }).on("error", reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        try {
          extractZip(Buffer.concat(chunks), destDir);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}
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
      const webappIndexPath = path4.join(webappDir, "index.html");
      this.localServer = new LocalServer(webappDir);
      if (!fs4.existsSync(webappIndexPath)) {
        const webappZip = path4.join(vaultBasePath, pluginDir, "webapp.zip");
        try {
          fs4.mkdirSync(webappDir, { recursive: true });
          if (fs4.existsSync(webappZip)) {
            extractZip(webappZip, webappDir);
            try {
              fs4.unlinkSync(webappZip);
            } catch {
            }
            new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u5DF2\u81EA\u52A8\u89E3\u538B webapp \u8D44\u6E90", 4e3);
          } else {
            const version = this.manifest.version;
            console.log("[BambooReview] Downloading webapp from release", version);
            await downloadAndExtractWebapp(pluginDir, webappDir, version);
            new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5B89\u88C5\u5B8C\u6210\uFF0C\u6B63\u5728\u542F\u52A8...", 4e3);
          }
        } catch (e) {
          console.error("[BambooReview] Failed to setup webapp:", e);
          new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5B89\u88C5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5", 0);
        }
      }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IExvY2FsU2VydmVyIH0gZnJvbSAnLi9zcmMvc2VydmVyL0xvY2FsU2VydmVyJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG4vKiogXHU3RUFGIE5vZGUuanMgWklQIFx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1Nlx1N0NGQlx1N0VERiB1bnppcC9Qb3dlclNoZWxsICovXG5mdW5jdGlvbiBleHRyYWN0WmlwKHNvdXJjZTogc3RyaW5nIHwgQnVmZmVyLCBkZXN0RGlyOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgYnVmID0gdHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgPyBmcy5yZWFkRmlsZVN5bmMoc291cmNlKSA6IHNvdXJjZTtcbiAgbGV0IHBvcyA9IDA7XG5cbiAgY29uc3QgcmVhZDE2ID0gKCkgPT4geyBjb25zdCB2ID0gYnVmLnJlYWRVSW50MTZMRShwb3MpOyBwb3MgKz0gMjsgcmV0dXJuIHY7IH07XG4gIGNvbnN0IHJlYWQzMiA9ICgpID0+IHsgY29uc3QgdiA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTsgcG9zICs9IDQ7IHJldHVybiB2OyB9O1xuICBjb25zdCBza2lwID0gKG46IG51bWJlcikgPT4geyBwb3MgKz0gbjsgfTtcblxuICAvLyBcdTYyNkJcdTYzQ0ZcdTYyNDBcdTY3MDkgbG9jYWwgZmlsZSBoZWFkZXJcdUZGMDhcdTdCN0VcdTU0MEQgMHgwNDAzNGI1MFx1RkYwOVxuICB3aGlsZSAocG9zIDwgYnVmLmxlbmd0aCAtIDQpIHtcbiAgICBjb25zdCBzaWcgPSBidWYucmVhZFVJbnQzMkxFKHBvcyk7XG4gICAgaWYgKHNpZyAhPT0gMHgwNDAzNGI1MCkgYnJlYWs7XG5cbiAgICBwb3MgKz0gNDtcbiAgICByZWFkMTYoKTsgLy8gdmVyc2lvblxuICAgIGNvbnN0IGZsYWdzID0gcmVhZDE2KCk7XG4gICAgY29uc3QgbWV0aG9kID0gcmVhZDE2KCk7XG4gICAgc2tpcCg0KTsgLy8gbW9kIHRpbWUsIG1vZCBkYXRlXG4gICAgY29uc3QgY3JjMzIgPSByZWFkMzIoKTtcbiAgICBjb25zdCBjb21wcmVzc2VkU2l6ZSA9IHJlYWQzMigpO1xuICAgIGNvbnN0IHVuY29tcHJlc3NlZFNpemUgPSByZWFkMzIoKTtcbiAgICBjb25zdCBuYW1lTGVuID0gcmVhZDE2KCk7XG4gICAgY29uc3QgZXh0cmFMZW4gPSByZWFkMTYoKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IGJ1Zi50b1N0cmluZygndXRmLTgnLCBwb3MsIHBvcyArIG5hbWVMZW4pO1xuICAgIHBvcyArPSBuYW1lTGVuICsgZXh0cmFMZW47XG5cbiAgICAvLyBcdThERjNcdThGQzdcdTc2RUVcdTVGNTVcdTY3NjFcdTc2RUVcbiAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy8nKSB8fCBmaWxlTmFtZS5lbmRzV2l0aCgnXFxcXCcpKSB7XG4gICAgICBwb3MgKz0gY29tcHJlc3NlZFNpemU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRQYXRoID0gcGF0aC5qb2luKGRlc3REaXIsIGZpbGVOYW1lKTtcbiAgICBmcy5ta2RpclN5bmMocGF0aC5kaXJuYW1lKG91dFBhdGgpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgIGNvbnN0IGRhdGEgPSBidWYuc3ViYXJyYXkocG9zLCBwb3MgKyBjb21wcmVzc2VkU2l6ZSk7XG4gICAgcG9zICs9IGNvbXByZXNzZWRTaXplO1xuXG4gICAgaWYgKG1ldGhvZCA9PT0gMCkge1xuICAgICAgLy8gXHU2NUUwXHU1MzhCXHU3RjI5XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG91dFBhdGgsIGRhdGEpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKG1ldGhvZCA9PT0gOCkge1xuICAgICAgLy8gZGVmbGF0ZVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGVjb21wcmVzc2VkID0gemxpYi5pbmZsYXRlUmF3U3luYyhkYXRhLCB7IGZpbmlzaEZsdXNoOiB6bGliLmNvbnN0YW50cy5aX1NZTkNfRkxVU0ggfSk7XG4gICAgICAgIGlmIChkZWNvbXByZXNzZWQubGVuZ3RoICE9PSB1bmNvbXByZXNzZWRTaXplKSB7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvdXRQYXRoLCBkZWNvbXByZXNzZWQuc3ViYXJyYXkoMCwgdW5jb21wcmVzc2VkU2l6ZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0UGF0aCwgZGVjb21wcmVzc2VkKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0UGF0aCwgemxpYi5pbmZsYXRlU3luYyhkYXRhKSk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZDogYCArIG1ldGhvZCArICcgKCcgKyBmaWxlTmFtZSArICcpJyk7XG4gIH1cbn1cblxuLyoqIFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEIgKi9cbmZ1bmN0aW9uIGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXI6IHN0cmluZywgZGVzdERpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscy9yZWxlYXNlcy9kb3dubG9hZC8ke3ZlcnNpb259L3dlYmFwcC56aXBgO1xuICAgIGh0dHBzLmdldCh1cmwsIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdvYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9IH0sIChyZXMpID0+IHtcbiAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAyIHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDEpIHtcbiAgICAgICAgLy8gRm9sbG93IHJlZGlyZWN0XG4gICAgICAgIGh0dHBzLmdldChyZXMuaGVhZGVycy5sb2NhdGlvbiB8fCAnJywgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnIH0gfSwgKHJlZGlyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgICAgIHJlZGlyLm9uKCdkYXRhJywgKGM6IEJ1ZmZlcikgPT4gY2h1bmtzLnB1c2goYykpO1xuICAgICAgICAgIHJlZGlyLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBleHRyYWN0WmlwKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSwgZGVzdERpcik7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVkaXIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHJlcy5zdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSFRUUCAke3Jlcy5zdGF0dXNDb2RlfTogJHt1cmx9YCkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG4gICAgICByZXMub24oJ2RhdGEnLCAoYzogQnVmZmVyKSA9PiBjaHVua3MucHVzaChjKSk7XG4gICAgICByZXMub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBleHRyYWN0WmlwKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSwgZGVzdERpcik7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfVxuICAgICAgfSk7XG4gICAgICByZXMub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFtYm9vUmV2aWV3UGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HUztcbiAgcHJpdmF0ZSBsb2NhbFNlcnZlcjogTG9jYWxTZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBzZXJ2ZXJVcmwgPSAnJztcblxuICBhc3luYyBvbmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NjcyQ1x1NTczMCBIVFRQIFx1NjcwRFx1NTJBMVx1NTY2OFxuICAgIGNvbnN0IHBsdWdpbkRpciA9ICh0aGlzLm1hbmlmZXN0IGFzIGFueSkuZGlyO1xuICAgIGlmIChwbHVnaW5EaXIpIHtcbiAgICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIHx8ICcnO1xuICAgICAgY29uc3Qgd2ViYXBwRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHBsdWdpbkRpciwgJ3dlYmFwcCcpO1xuICAgICAgY29uc3Qgd2ViYXBwSW5kZXhQYXRoID0gcGF0aC5qb2luKHdlYmFwcERpciwgJ2luZGV4Lmh0bWwnKTtcbiAgICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBuZXcgTG9jYWxTZXJ2ZXIod2ViYXBwRGlyKTtcblxuICAgICAgLy8gXHU3ODZFXHU0RkREIHdlYmFwcCBcdThENDRcdTZFOTBcdTVDMzFcdTdFRUFcdUZGMUFcdTY3MkNcdTU3MzAgemlwIFx1MjE5MiBHaXRIdWIgXHU0RTBCXHU4RjdEXG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMod2ViYXBwSW5kZXhQYXRoKSkge1xuICAgICAgICBjb25zdCB3ZWJhcHBaaXAgPSBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnd2ViYXBwLnppcCcpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZzLm1rZGlyU3luYyh3ZWJhcHBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwWmlwKSkge1xuICAgICAgICAgICAgLy8gXHU2NzJDXHU1NzMwXHU2NzA5IHppcFx1RkYwOFx1NEVDRSByZWxlYXNlIFx1NEUwQlx1OEY3RFx1NjIxNlx1NTM0N1x1N0VBN1x1NkI4Qlx1NzU1OVx1RkYwOVx1RkYwQ1x1NzZGNFx1NjNBNVx1ODlFM1x1NTM4QlxuICAgICAgICAgICAgZXh0cmFjdFppcCh3ZWJhcHBaaXAsIHdlYmFwcERpcik7XG4gICAgICAgICAgICAvLyBcdTg5RTNcdTUzOEJcdTVCOENcdTYyMTBcdTU0MEVcdTUyMjBcdTk2NjQgemlwIFx1OTFDQVx1NjUzRVx1N0E3QVx1OTVGNFxuICAgICAgICAgICAgdHJ5IHsgZnMudW5saW5rU3luYyh3ZWJhcHBaaXApOyB9IGNhdGNoIHt9XG4gICAgICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NURGMlx1ODFFQVx1NTJBOFx1ODlFM1x1NTM4QiB3ZWJhcHAgXHU4RDQ0XHU2RTkwJywgNDAwMCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1NjNEMlx1NEVGNlx1NUUwMlx1NTczQVx1NUI4OVx1ODhDNVx1NkNBMVx1NjcwOSB3ZWJhcHBcdUZGMENcdTRFQ0UgR2l0SHViIFJlbGVhc2UgXHU0RTBCXHU4RjdEXG4gICAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gdGhpcy5tYW5pZmVzdC52ZXJzaW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIERvd25sb2FkaW5nIHdlYmFwcCBmcm9tIHJlbGVhc2UnLCB2ZXJzaW9uKTtcbiAgICAgICAgICAgIGF3YWl0IGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXIsIHdlYmFwcERpciwgdmVyc2lvbik7XG4gICAgICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1OEQ0NFx1NkU5MFx1NTMwNVx1NUI4OVx1ODhDNVx1NUI4Q1x1NjIxMFx1RkYwQ1x1NkI2M1x1NTcyOFx1NTQyRlx1NTJBOC4uLicsIDQwMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEZhaWxlZCB0byBzZXR1cCB3ZWJhcHA6JywgZSk7XG4gICAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdThENDRcdTZFOTBcdTUzMDVcdTVCODlcdTg4QzVcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTdGNTFcdTdFRENcdTU0MEVcdTkxQ0RcdThCRDUnLCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxvY2FsU2VydmVyLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuc2VydmVyVXJsID0gdGhpcy5sb2NhbFNlcnZlci5nZXRVcmwoKTtcbiAgICAgICAgLy8gXHU2MjhBXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU0RjIwXHU3RUQ5IExvY2FsU2VydmVyXHVGRjBDXHU0RjlCIC9iYW1ib28tYXVkaW8gXHU5N0YzXHU5ODkxXHU0RUUzXHU3NDA2XHU0RjdGXHU3NTI4XG4gICAgICAgIHRoaXMubG9jYWxTZXJ2ZXIuc2V0VmF1bHRCYXNlUGF0aCh2YXVsdEJhc2VQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gRmFpbGVkIHRvIHN0YXJ0IGxvY2FsIHNlcnZlcjonLCBlKTtcbiAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY3MkNcdTU3MzBcdTY3MERcdTUyQTFcdTU0MkZcdTUyQThcdTU5MzFcdThEMjVcdUZGMENcdTkwRThcdTUyMDZcdTUyOUZcdTgwRkRcdUZGMDhcdTc2N0RcdTU2NkFcdTk3RjNcdTMwMDFcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdUZGMDlcdTUzRUZcdTgwRkRcdTRFMERcdTUzRUZcdTc1MjgnLCAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTZDRThcdTUxOEMgVmlld1xuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsIChsZWFmOiBXb3Jrc3BhY2VMZWFmKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IERhaWx5UmV2aWV3VmlldyhsZWFmLCB0aGlzLnNlcnZlclVybCwgdGhpcy5zZXR0aW5ncywgKCkgPT4gdGhpcy5zYXZlU2V0dGluZ3MoKSk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLWRhaWx5LXJldmlldycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU0RUNBXHU2NUU1XHU1OTBEXHU3NkQ4JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtcHJldi1kYXknLFxuICAgICAgbmFtZTogJ1x1NTI0RFx1NEUwMFx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjpwcmV2RGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1uZXh0LWRheScsXG4gICAgICBuYW1lOiAnXHU1NDBFXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2Om5leHREYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXRvZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU2REVcdTUyMzBcdTRFQ0FcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6dG9kYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc3RhdHMnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1N0VERlx1OEJBMVx1NTIwNlx1Njc5MCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU3RhdHMnKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc2V0dGluZ3MtaW4tYXBwJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCdhY3Rpb246b3BlblNldHRpbmdzJyksXG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBsdWdpblNldHRpbmdzKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBcdTZERkJcdTUyQTBcdTVERTZcdTRGQTcgUmliYm9uIFx1NTZGRVx1NjgwN1xuICAgIHRoaXMuYWRkUmliYm9uSWNvbignbGVhZicsICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCAoKSA9PiB7XG4gICAgICB2b2lkIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICB2b2lkIHRoaXMubG9jYWxTZXJ2ZXI/LnN0b3AoKTtcbiAgICB0aGlzLmxvY2FsU2VydmVyID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTZGQzBcdTZEM0JcdTYyMTZcdTUyMUJcdTVFRkFcdTU5MERcdTc2RDhcdTg5QzZcdTU2RkUgKi9cbiAgYXN5bmMgYWN0aXZhdGVWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblxuICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgbGVhdmVzID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcblxuICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gXHU1REYyXHU2NzA5XHU4OUM2XHU1NkZFXHVGRjBDXHU3NkY0XHU2M0E1XHU4MDVBXHU3MTI2XG4gICAgICBsZWFmID0gbGVhdmVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTY1QjBcdTg5QzZcdTU2RkVcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XG4gICAgICAgIHR5cGU6IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChsZWFmKSB7XG4gICAgICBhd2FpdCB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0ICovXG4gIHByaXZhdGUgc2VuZFRvSWZyYW1lKHR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGNvbnN0IHZpZXcgPSBsZWF2ZXNbMF0udmlldyBhcyBEYWlseVJldmlld1ZpZXc7XG4gICAgY29uc3QgaWZyYW1lID0gKHZpZXcgYXMgYW55KS5pZnJhbWUgYXMgSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChpZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIGxldCBvcmlnaW4gPSAnKic7XG4gICAgICB0cnkgeyBvcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjsgfSBjYXRjaCB7IC8qIGtlZXAgJyonICovIH1cbiAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgICB7IHR5cGUsIGlkOiAnY21kXycgKyBEYXRlLm5vdygpIH0sXG4gICAgICAgIG9yaWdpblxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHsgQnJpZGdlU2VydmljZSB9IGZyb20gJy4uL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1Njc4MVx1N0I4MFx1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZSBcdTYyN0ZcdThGN0QgUFdBXG4gKiAyLiBcdTdCQTFcdTc0MDYgQnJpZGdlU2VydmljZSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcbiAqIDMuIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTVFNzZcdTU0MENcdTZCNjVcbiAqL1xuZXhwb3J0IGNsYXNzIERhaWx5UmV2aWV3VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcHJpdmF0ZSBicmlkZ2VTZXJ2aWNlOiBCcmlkZ2VTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZUVycm9ySGFuZGxlcjogKChlOiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBrZXlkb3duRm9yd2FyZGVyOiAoKGU6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3NzQ2hhbmdlUmVmOiBhbnkgPSBudWxsO1xuICBwcml2YXRlIHdlYmFwcFBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHdlYmFwcFBhdGg6IHN0cmluZywgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLCBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihsZWFmKTtcbiAgICB0aGlzLndlYmFwcFBhdGggPSB3ZWJhcHBQYXRoO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgfVxuXG4gIGdldFZpZXdUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVc7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJztcbiAgfVxuXG4gIGdldEljb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2xlYWYnO1xuICB9XG5cbiAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgPSB0aGlzLmNvbnRhaW5lckVsLmNoaWxkcmVuWzFdO1xuICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgIGNvbnRhaW5lci5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1jb250YWluZXInKTtcblxuICAgIGlmICghdGhpcy53ZWJhcHBQYXRoKSB7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2NUUwXHU2Q0Q1XHU1QjlBXHU0RjREIHdlYmFwcCBcdThENDRcdTZFOTBcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTYzRDJcdTRFRjZcdTVCODlcdTg4QzVcdTc2RUVcdTVGNTUnLFxuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWVycm9yJyxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NTIxQlx1NUVGQSBpZnJhbWUgLSBcdTRFMERcdTRGN0ZcdTc1Mjggc2FuZGJveFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTYzQlx1NkI2MiBhcHA6Ly8gXHU1MzRGXHU4QkFFXHU0RTBCXHU3Njg0XHU1QjUwXHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXG4gICAgdGhpcy5pZnJhbWUgPSBjb250YWluZXIuY3JlYXRlRWwoJ2lmcmFtZScsIHtcbiAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZnJhbWUnLFxuICAgICAgYXR0cjoge1xuICAgICAgICBzcmM6IHRoaXMud2ViYXBwUGF0aCxcbiAgICAgICAgYWxsb3c6ICdjYW1lcmE7IG1pY3JvcGhvbmU7IGNsaXBib2FyZC1yZWFkOyBjbGlwYm9hcmQtd3JpdGUnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIGlmcmFtZSBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjVcdTY1RjZcdTY2M0VcdTc5M0FcdTYzRDBcdTc5M0FcbiAgICB0aGlzLmlmcmFtZUVycm9ySGFuZGxlciA9IChlOiBFdmVudCkgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gaWZyYW1lIGZhaWxlZCB0byBsb2FkOicsIHRoaXMud2ViYXBwUGF0aCk7XG4gICAgfTtcbiAgICB0aGlzLmlmcmFtZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKTtcblxuICAgIC8vIFx1NUY1MyBpZnJhbWUgXHU1OTA0XHU0RThFXHU3MTI2XHU3MEI5XHU2NUY2XHVGRjBDXHU1QzA2IEN0cmwvQ21kIFx1NUZFQlx1NjM3N1x1OTUyRVx1OEY2Q1x1NTNEMVx1N0VEOSBPYnNpZGlhblx1RkYwQ1xuICAgIC8vIFx1Nzg2RVx1NEZERFx1NTQ3RFx1NEVFNFx1OTc2Mlx1Njc3Rlx1RkYwOEN0cmwvQ21kK1BcdUZGMDlcdTMwMDFcdTVGRUJcdTkwMUZcdTUyMDdcdTYzNjJcdUZGMDhDdHJsL0NtZCtPXHVGRjA5XHU3QjQ5XHU1MTY4XHU1QzQwXHU1RkVCXHU2Mzc3XHU5NTJFXHU0RUNEXHU3MTM2XHU1M0VGXHU3NTI4XG4gICAgY29uc3Qgb2JzaWRpYW5Eb2MgPSBhY3RpdmVEb2N1bWVudDtcbiAgICB0aGlzLmtleWRvd25Gb3J3YXJkZXIgPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEtleWJvYXJkRXZlbnQoJ2tleWRvd24nLCB7XG4gICAgICAgICAga2V5OiBlLmtleSxcbiAgICAgICAgICBjb2RlOiBlLmNvZGUsXG4gICAgICAgICAgY3RybEtleTogZS5jdHJsS2V5LFxuICAgICAgICAgIG1ldGFLZXk6IGUubWV0YUtleSxcbiAgICAgICAgICBzaGlmdEtleTogZS5zaGlmdEtleSxcbiAgICAgICAgICBhbHRLZXk6IGUuYWx0S2V5LFxuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2lkaWFuRG9jLmJvZHkuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgICAgfVxuICAgIH07XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bkZvcndhcmRlciwgdHJ1ZSk7XG5cbiAgICAvLyBcdTUyMURcdTU5Q0JcdTUzMTZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgYXdhaXQgc3RvcmFnZS5lbnN1cmVTdHJ1Y3R1cmUoKTtcblxuICAgIGNvbnN0IHN0b3JhZ2VCcmlkZ2UgPSBuZXcgU3RvcmFnZUJyaWRnZShzdG9yYWdlLCB0aGlzLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG5ldyBUaGVtZUJyaWRnZSgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG5ldyBCcmlkZ2VTZXJ2aWNlKFxuICAgICAgc3RvcmFnZUJyaWRnZSxcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UsXG4gICAgICB0aGlzLnNldHRpbmdzLFxuICAgICAgdGhpcy5zYXZlU2V0dGluZ3NcbiAgICApO1xuXG4gICAgLy8gXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUyRFx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFxuICAgIGNvbnN0IGN1c3RvbVRoZW1lcyA9IHRoaXMuX3NjYW5DdXN0b21UaGVtZXMoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Q3VzdG9tVGhlbWVzKGN1c3RvbVRoZW1lcyk7XG5cbiAgICAvLyBcdTRGMjBcdTkwMTJcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTc2N0RcdTU2NkFcdTk3RjNcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTYyNkJcdTYzQ0YvXHU4QkZCXHU1M0Q2XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgaWYgKHZhdWx0QmFzZVBhdGgpIHtcbiAgICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgIH1cbiAgICAvLyBcdTRGMjBcdTkwMTJcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5ub2lzZVBhdGgpIHtcbiAgICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXROb2lzZVBhdGgodGhpcy5zZXR0aW5ncy5ub2lzZVBhdGgpO1xuICAgIH1cbiAgICAvLyBcdTRGMjBcdTkwMTIgT2JzaWRpYW4gXHU5MTREXHU3RjZFXHU3NkVFXHU1RjU1XHU1NDBEXHVGRjA4XHU2NTJGXHU2MzAxXHU3NTI4XHU2MjM3XHU4MUVBXHU1QjlBXHU0RTQ5IC5vYnNpZGlhbiBcdTU0MERcdTc5RjBcdUZGMDlcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Q29uZmlnRGlyKHRoaXMuYXBwLnZhdWx0LmNvbmZpZ0Rpcik7XG5cbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UuYXR0YWNoKHRoaXMuaWZyYW1lKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZSh0aGlzLmlmcmFtZSk7XG5cbiAgICAvLyBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XG4gICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSB0aGlzLmFwcC53b3Jrc3BhY2Uub24oJ2Nzcy1jaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlPy5vblRoZW1lQ2hhbmdlZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgb25DbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2U/LmRldGFjaCgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFM0JcdTk4OThcdTc2RDFcdTU0MkNcbiAgICBpZiAodGhpcy5jc3NDaGFuZ2VSZWYpIHtcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vZmZyZWYodGhpcy5jc3NDaGFuZ2VSZWYpO1xuICAgICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMudGhlbWVCcmlkZ2U/LmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGlmcmFtZSBlcnJvciBcdTc2RDFcdTU0MkNcdTU2NjhcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuICAgICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1OTUyRVx1NzZEOFx1OEY2Q1x1NTNEMVx1NTY2OFxuICAgIGlmICh0aGlzLmtleWRvd25Gb3J3YXJkZXIpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd25Gb3J3YXJkZXIsIHRydWUpO1xuICAgICAgdGhpcy5rZXlkb3duRm9yd2FyZGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgaWZyYW1lXG4gICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUwQlx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1OERFRlx1NUY4NFx1NzUzMVx1NzUyOFx1NjIzN1x1OEJCRVx1N0Y2RVx1NjMwN1x1NUI5QVx1RkYwOSAqL1xuICBwcml2YXRlIF9zY2FuQ3VzdG9tVGhlbWVzKCk6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIHx8ICcnO1xuICAgICAgaWYgKCF2YXVsdEJhc2VQYXRoKSByZXR1cm4gdGhlbWVzO1xuXG4gICAgICBjb25zdCB0aGVtZURpck5hbWUgPSB0aGlzLnNldHRpbmdzLnRoZW1lUGF0aCB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgIGNvbnN0IHRoZW1lc0RpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCB0aGVtZURpck5hbWUpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoZW1lc0RpcikgfHwgIWZzLnN0YXRTeW5jKHRoZW1lc0RpcikuaXNEaXJlY3RvcnkoKSkgcmV0dXJuIHRoZW1lcztcblxuICAgICAgY29uc3QgZW50cmllczogc3RyaW5nW10gPSBmcy5yZWFkZGlyU3luYyh0aGVtZXNEaXIpO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmICghZW50cnkuZW5kc1dpdGgoJy5qcycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhlbWVzRGlyLCBlbnRyeSk7XG4gICAgICAgIGlmICghZnMuc3RhdFN5bmMoZmlsZVBhdGgpLmlzRmlsZSgpKSBjb250aW51ZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvZGU6IHN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgLy8gXHU1RkVCXHU5MDFGXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1MzA1XHU1NDJCXHU1RkM1XHU5NzAwXHU3Njg0IF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcbiAgICAgICAgICBpZiAoIWNvZGUuaW5jbHVkZXMoJ19fYmFtYm9vX3RoZW1lXycpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTdGM0FcdTVDMTEgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDN2ApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoZW1lcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IGVudHJ5LnJlcGxhY2UoL1xcLmpzJC8sICcnKSxcbiAgICAgICAgICAgIGNvZGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQmFtYm9vUmV2aWV3XSBcdThCRkJcdTUzRDZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU1OTMxXHU4RDI1OmAsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhlbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtCYW1ib29SZXZpZXddIFx1NTNEMVx1NzNCMCAke3RoZW1lcy5sZW5ndGh9IFx1NEUyQVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5ODpgLCB0aGVtZXMubWFwKHQgPT4gdC5uYW1lKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbQmFtYm9vUmV2aWV3XSBcdTYyNkJcdTYzQ0ZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGVtZXM7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIG5vcm1hbGl6ZVBhdGgsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG4vKipcbiAqIFZhdWx0U3RvcmFnZSAtIFx1NUMwMVx1ODhDNSBPYnNpZGlhbiBWYXVsdCBhZGFwdGVyIFx1NzY4NFx1NjU4N1x1NEVGNlx1NjRDRFx1NEY1Q1xuICpcbiAqIFZhdWx0IFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NDpcbiAqICAge2Jhc2VQYXRofS9cbiAqICAgICBkYXRhLyAgICAgICAgICAtPiBcdTZCQ0ZcdTY1RTUgSlNPTiBcdTY1NzBcdTYzNkVcbiAqICAgICBnb2Fscy5qc29uICAgICAtPiBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDdcbiAqICAgICBzZXR0aW5ncy5qc29uICAtPiBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkVcbiAqICAgICB0aGVtZXMvICAgICAgICAtPiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXBvcnRzLyAgICAgICAtPiBcdTYyQTVcdTU0NEEgKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXZpZXdzLyAgICAgICAtPiBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuZXhwb3J0IGNsYXNzIFZhdWx0U3RvcmFnZSB7XG4gIHByaXZhdGUgYXBwOiBBcHA7XG4gIHByaXZhdGUgYmFzZVBhdGg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgYmFzZVBhdGggPSAnYmFtYm9vLXJldmlldycpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLmJhc2VQYXRoID0gbm9ybWFsaXplUGF0aChiYXNlUGF0aCk7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4ICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlRGlyKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vJHtkaXJ9YCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTU3RkFcdTc4NDBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODRcdTVCNThcdTU3MjggKi9cbiAgYXN5bmMgZW5zdXJlU3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2Rpcih0aGlzLmJhc2VQYXRoKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTM5Rlx1NUI1MFx1NjVCOVx1NUYwRlx1NTE5OVx1NTE2NSB2YXVsdCBcdTY1ODdcdTRFRjZcdUZGMDhcdTY2RkZcdTRFRTMgYWRhcHRlci53cml0ZVx1RkYwOVx1MzAwMlxuICAgKiAtIFx1NjU4N1x1NEVGNlx1NURGMlx1NTcyOCB2YXVsdCBcdTdGMTNcdTVCNTggXHUyMTkyIHZhdWx0LnByb2Nlc3NcdUZGMDhcdTUzOUZcdTVCNTBcdTY2RjRcdTY1QjBcdUZGMENcdTkwN0ZcdTUxNERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcdUZGMDlcbiAgICogLSBcdTY1QjBcdTY1ODdcdTRFRjYgXHUyMTkyIHZhdWx0LmNyZWF0ZVx1RkYwOFx1NTQwQ1x1NjVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFx1NTQ4QyBPYnNpZGlhbiBcdTdGMTNcdTVCNThcdUZGMDlcbiAgICogLSBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDhcdTc4QzFcdTc2RDhcdTY3MDlcdTRGNDZcdTdGMTNcdTVCNThcdTY1RTBcdUZGMDlcdTIxOTIgYWRhcHRlci5yZW1vdmUgKyB2YXVsdC5jcmVhdGVcdUZGMDhcdThGQzFcdTc5RkJcdThGREJcdTdGMTNcdTVCNThcdUZGMDlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdmF1bHRXcml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vcm1hbGl6ZWQpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsICgpID0+IGNvbnRlbnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudFBhdGggPSBub3JtYWxpemVkLnN1YnN0cmluZygwLCBub3JtYWxpemVkLmxhc3RJbmRleE9mKCcvJykpO1xuICAgIGlmIChwYXJlbnRQYXRoICYmICEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGFyZW50UGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhcmVudFBhdGgpO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhub3JtYWxpemVkKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUobm9ybWFsaXplZCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKG5vcm1hbGl6ZWQsIGNvbnRlbnQpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTZCQ0ZcdTY1RTVcdTY1NzBcdTYzNkUgKGRheXMpIC0tLS1cblxuICBwcml2YXRlIGRheVBhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhLyR7ZGF0ZUtleX0uanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdUZGMENcdTVDMDZcdThERjNcdThGQzc6ICR7cGF0aH1gLCBlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbERheXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKGRhdGVLZXkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKGZpbGUpO1xuICAgICAgICAgICAgZGF5c1tkYXRlS2V5XSA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcGFyc2UgZGF5IGZpbGU6ICR7ZmlsZX1gLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRheXM7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU2NUU1XHU2NzFGIGtleVx1RkYwOFx1NjMwOVx1NjVFNVx1NjcxRlx1OTY0RFx1NUU4Rlx1RkYwQ1x1NjcwMFx1NjVCMFx1NTcyOFx1NTI0RFx1RkYwOSAqL1xuICBhc3luYyBnZXREYXlLZXlzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5maWxlcykge1xuICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmIChkYXRlS2V5KSBrZXlzLnB1c2goZGF0ZUtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIGtleXMuc29ydCgpLnJldmVyc2UoKTsgLy8gXHU5NjREXHU1RThGXHVGRjFBXHU2NzAwXHU2NUIwXHU2NUU1XHU2NzFGXHU1NzI4XHU1MjREXG4gICAgcmV0dXJuIGtleXM7XG4gIH1cblxuICAvKipcbiAgICogXHU1MjA2XHU5ODc1XHU1MkEwXHU4RjdEXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXG4gICAqIEBwYXJhbSBwYWdlIFx1OTg3NVx1NzgwMVx1RkYwOFx1NEVDRSAwIFx1NUYwMFx1NTlDQlx1RkYwOVxuICAgKiBAcGFyYW0gcGFnZVNpemUgXHU2QkNGXHU5ODc1XHU2NTcwXHU5MUNGXG4gICAqIEByZXR1cm5zIHsgZGF5cywgdG90YWwsIHBhZ2UsIHBhZ2VTaXplLCBoYXNNb3JlIH1cbiAgICovXG4gIGFzeW5jIGdldERheXNQYWdpbmF0ZWQocGFnZSA9IDAsIHBhZ2VTaXplID0gMzApOiBQcm9taXNlPHtcbiAgICBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgIGtleXM6IHN0cmluZ1tdO1xuICAgIHRvdGFsOiBudW1iZXI7XG4gICAgcGFnZTogbnVtYmVyO1xuICAgIHBhZ2VTaXplOiBudW1iZXI7XG4gICAgaGFzTW9yZTogYm9vbGVhbjtcbiAgfT4ge1xuICAgIGNvbnN0IGFsbEtleXMgPSBhd2FpdCB0aGlzLmdldERheUtleXMoKTtcbiAgICBjb25zdCB0b3RhbCA9IGFsbEtleXMubGVuZ3RoO1xuICAgIGNvbnN0IHN0YXJ0ID0gcGFnZSAqIHBhZ2VTaXplO1xuICAgIGNvbnN0IHBhZ2VLZXlzID0gYWxsS2V5cy5zbGljZShzdGFydCwgc3RhcnQgKyBwYWdlU2l6ZSk7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBkYXRlS2V5IG9mIHBhZ2VLZXlzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXREYXkoZGF0ZUtleSk7XG4gICAgICAgIGlmIChkYXRhKSBkYXlzW2RhdGVLZXldID0gZGF0YTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gbG9hZCBkYXk6ICR7ZGF0ZUtleX1gLCBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5cyxcbiAgICAgIGtleXM6IHBhZ2VLZXlzLFxuICAgICAgdG90YWwsXG4gICAgICBwYWdlLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBoYXNNb3JlOiBzdGFydCArIHBhZ2VLZXlzLmxlbmd0aCA8IHRvdGFsLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBwdXREYXkoZGF5RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dEdvYWxzKGdvYWxzOiB1bmtub3duW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBKU09OLnBhcnNlKGRhdGEpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgMik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHsgW2tleV06IHZhbHVlIH0sIG51bGwsIDIpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxTZXR0aW5ncygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dFB1cmNoYXNlSGlzdG9yeShkYXRhOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMiAoaW5jb21lLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgaW5jb21lSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9pbmNvbWUtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRJbmNvbWVIaXN0b3J5KCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gIH1cblxuICBhc3luYyBwdXRJbmNvbWVIaXN0b3J5KGRhdGE6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NUJGQ1x1NTFGQS9cdTVCRkNcdTUxNjUgLS0tLVxuXG4gIGFzeW5jIGV4cG9ydEFsbERhdGEoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgb3B0aW9ucz86IHsgc3RyYXRlZ3k/OiAnb3ZlcndyaXRlJyB8ICdtZXJnZScgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBpZiAoZGF0YS5kYXlzKSB7XG4gICAgICBmb3IgKGNvbnN0IGRheSBvZiBPYmplY3QudmFsdWVzKGRhdGEuZGF5cykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXREYXkoZGF5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEuZ29hbHMpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoZGF0YS5nb2FscyBhcyBhbnlbXSk7XG4gICAgfVxuICAgIGlmIChkYXRhLnNldHRpbmdzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhkYXRhLnNldHRpbmdzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dFNldHRpbmcoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhLnB1cmNoYXNlSGlzdG9yeSkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRQdXJjaGFzZUhpc3RvcnkoZGF0YS5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5pbmNvbWVIaXN0b3J5KSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEluY29tZUhpc3RvcnkoZGF0YS5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjbGVhckFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIodGhpcy5iYXNlUGF0aCwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvLyAtLS0tIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAtLS0tXG5cbiAgcHJpdmF0ZSByZXZpZXdQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcmV2aWV3cy8ke2RhdGVLZXl9Lm1kYCk7XG4gIH1cblxuICBhc3luYyB3cml0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZywgbWFya2Rvd246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgbWFya2Rvd24pO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogTWFya2Rvd25TeW5jIC0gXHU1QzA2IERheURhdGEgSlNPTiBcdThGNkNcdTYzNjJcdTRFM0FcdTUzRUZcdThCRkJcdTc2ODQgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cblxuaW50ZXJmYWNlIERheURhdGEge1xuICBkYXRlOiBzdHJpbmc7XG4gIHdlZWtkYXk6IHN0cmluZztcbiAgbWV0cmljcz86IHtcbiAgICBmaXJzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgbGFzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgY29tcGxldGVkVGFza3M/OiBzdHJpbmc7XG4gICAgaW5zcGlyYXRpb25Db3VudD86IHN0cmluZztcbiAgICBhY3RpdmVUaW1lPzogc3RyaW5nO1xuICAgIGVtcHR5U2xvdHM/OiBzdHJpbmc7XG4gIH07XG4gIHRpbWVsaW5lPzogQXJyYXk8e1xuICAgIHBlcmlvZDogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0aW1lOiBzdHJpbmc7XG4gICAgaWNvbj86IHN0cmluZztcbiAgICBldmFsPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyB0aW1lOiBzdHJpbmc7IHRhc2s6IHN0cmluZzsgZXZhbD86IHN0cmluZyB9PjtcbiAgfT47XG4gIGdvYWxzPzogQXJyYXk8e1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBtZXRhPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHBlcmNlbnQ/OiBudW1iZXI7IGRldGFpbD86IHN0cmluZyB9PjtcbiAgfT47XG59XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blN5bmMge1xuICAvKiogXHU1QzA2IERheURhdGEgXHU4RjZDXHU2MzYyXHU0RTNBIE1hcmtkb3duICovXG4gIHN0YXRpYyBnZW5lcmF0ZU1hcmtkb3duKGRhdGE6IERheURhdGEpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gZnJvbnRtYXR0ZXJcdUZGMDhcdTUyQThcdTYwMDFcdTUwM0NcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdTUzMDVcdTg4RjlcdTk2MzJcdTZCNjIgWUFNTCBcdTZDRThcdTUxNjVcdUZGMDlcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKGBkYXRlOiBcIiR7ZGF0YS5kYXRlfVwiYCk7XG4gICAgbGluZXMucHVzaChgd2Vla2RheTogXCIke2RhdGEud2Vla2RheX1cImApO1xuICAgIGxpbmVzLnB1c2goJ3R5cGU6IEJhbWJvbyBJbW1vcnRhbHMnKTtcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFxuICAgIGxpbmVzLnB1c2goYCMgJHtkYXRhLmRhdGV9ICR7ZGF0YS53ZWVrZGF5fVx1NTkwRFx1NzZEOGApO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2MzA3XHU2ODA3XG4gICAgaWYgKGRhdGEubWV0cmljcykge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2MzA3XHU2ODA3Jyk7XG4gICAgICBjb25zdCBtID0gZGF0YS5tZXRyaWNzO1xuICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAobS5maXJzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1OTk5Nlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmZpcnN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmxhc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTY3MkJcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5sYXN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmNvbXBsZXRlZFRhc2tzKSBwYXJ0cy5wdXNoKGBcdTVCOENcdTYyMTBcdTRFRkJcdTUyQTE6ICR7bS5jb21wbGV0ZWRUYXNrc31gKTtcbiAgICAgIGlmIChtLmluc3BpcmF0aW9uQ291bnQpIHBhcnRzLnB1c2goYFx1NzA3NVx1NjExRjogJHttLmluc3BpcmF0aW9uQ291bnR9YCk7XG4gICAgICBpZiAobS5hY3RpdmVUaW1lKSBwYXJ0cy5wdXNoKGBcdTZEM0JcdThEQzNcdTY1RjZcdTk1N0Y6ICR7bS5hY3RpdmVUaW1lfWApO1xuICAgICAgaWYgKG0uZW1wdHlTbG90cykgcGFydHMucHVzaChgXHU3QTdBXHU3NjdEXHU2NUY2XHU2QkI1OiAke20uZW1wdHlTbG90c31gKTtcblxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDAsIDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgfVxuXG4gICAgLy8gXHU2NUY2XHU5NUY0XHU3RUJGXG4gICAgaWYgKGRhdGEudGltZWxpbmUgJiYgZGF0YS50aW1lbGluZS5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTY1RjZcdTk1RjRcdTdFQkYnKTtcbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgZGF0YS50aW1lbGluZSkge1xuICAgICAgICBjb25zdCBpY29uID0gYmxvY2suaWNvbiA/IGAke2Jsb2NrLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2Jsb2NrLm5hbWV9ICgke2Jsb2NrLnRpbWV9KWApO1xuICAgICAgICBpZiAoYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWxTdHIgPSBpdGVtLmV2YWwgPyBgIC0gJHtpdGVtLmV2YWx9YCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0udGltZX0gJHtpdGVtLnRhc2t9JHtldmFsU3RyfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTZcbiAgICBpZiAoZGF0YS5nb2FscyAmJiBkYXRhLmdvYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNicpO1xuICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGRhdGEuZ29hbHMpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGdvYWwuaWNvbiA/IGAke2dvYWwuaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7Z29hbC50aXRsZX1gKTtcbiAgICAgICAgaWYgKGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZ29hbC5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IGl0ZW0ucGVyY2VudCAhPT0gdW5kZWZpbmVkID8gYCAke2l0ZW0ucGVyY2VudH0lYCA6ICcnO1xuICAgICAgICAgICAgY29uc3QgZGV0YWlsID0gaXRlbS5kZXRhaWwgPyBgICgke2l0ZW0uZGV0YWlsfSlgIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS5uYW1lfSR7cGVyY2VudH0ke2RldGFpbH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgTWFya2Rvd25TeW5jIH0gZnJvbSAnLi4vc3RvcmFnZS9NYXJrZG93blN5bmMnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuXG4vKipcbiAqIFN0b3JhZ2VCcmlkZ2UgLSBcdTVDMDYgc3RvcmFnZToqIFx1NkQ4OFx1NjA2Rlx1NjYyMFx1NUMwNFx1NTIzMCBWYXVsdFN0b3JhZ2UgXHU2NENEXHU0RjVDXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yYWdlQnJpZGdlIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2U6IFZhdWx0U3RvcmFnZSwgZW5hYmxlTWFya2Rvd25TeW5jID0gdHJ1ZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgdGhpcy5lbmFibGVNYXJrZG93blN5bmMgPSBlbmFibGVNYXJrZG93blN5bmM7XG4gIH1cblxuICBhc3luYyBoYW5kbGUobWVzc2FnZTogQW55QnJpZGdlTWVzc2FnZSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZS5wdXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAvLyBcdTUzQ0NcdTUxOTkgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZU1hcmtkb3duU3luYyAmJiBtZXNzYWdlLnBheWxvYWQuZGF0YSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtZCA9IE1hcmtkb3duU3luYy5nZW5lcmF0ZU1hcmtkb3duKG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS53cml0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5LCBtZCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXJrZG93biBzeW5jIGZhaWxlZDonLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVEYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5LCBtZXNzYWdlLnBheWxvYWQudmFsdWUpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRHb2FscyhtZXNzYWdlLnBheWxvYWQuZ29hbHMpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRQdXJjaGFzZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRJbmNvbWVIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCc6XG4gICAgICAgIGNvbnN0IHBhZ2luYXRlZFBheWxvYWQgPSBtZXNzYWdlLnBheWxvYWQgYXMgeyBwYWdlPzogbnVtYmVyOyBwYWdlU2l6ZT86IG51bWJlciB9O1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheXNQYWdpbmF0ZWQoXG4gICAgICAgICAgcGFnaW5hdGVkUGF5bG9hZC5wYWdlID8/IDAsXG4gICAgICAgICAgcGFnaW5hdGVkUGF5bG9hZC5wYWdlU2l6ZSA/PyAzMFxuICAgICAgICApO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmV4cG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZXhwb3J0QWxsRGF0YSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmltcG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuaW1wb3J0RGF0YShtZXNzYWdlLnBheWxvYWQuZGF0YSwgbWVzc2FnZS5wYXlsb2FkLm9wdGlvbnMpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmNsZWFyQWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhckFsbCgpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RvcmFnZSBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgIH1cbiAgfVxufVxuIiwgIlxuLyoqXG4gKiBUaGVtZUJyaWRnZSAtIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdUZGMENcdTYzQThcdTkwMDFcdTUyMzAgaWZyYW1lXG4gKiAgICAgICAgICAgICAgKyBcdTUzQ0RcdTU0MTFcdUZGMUFcdTYzQTVcdTY1MzYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTAzQ1x1RkYwQ1x1NkNFOFx1NTE2NSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAqL1xuZXhwb3J0IGNsYXNzIFRoZW1lQnJpZGdlIHtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGV4cGVjdGVkT3JpZ2luID0gJyc7XG4gICAgcHJpdmF0ZSBfcGFsZXR0ZVN5bmNUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcblxuICAgIC8qKiBcdTVCNThcdTUwQThcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1OTUyRVx1NTQwRFx1RkYwQ1x1NzUyOFx1NEU4RSByZXN0b3JlRGVmYXVsdHMgXHU2RTA1XHU3NDA2ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgSU5KRUNURURfVkFSUyA9IFtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCcsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnLFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JyxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JyxcbiAgICAgICctLXRleHQtbm9ybWFsJyxcbiAgICAgICctLXRleHQtbXV0ZWQnLFxuICAgIF07XG5cbiAgICAvKiogXHU5NjMyXHU2Mjk2XHU3QURFXHU2MDAxXHU2ODA3XHU4QkIwXHVGRjFBcmVzdG9yZURlZmF1bHRzIFx1ODhBQlx1OEMwM1x1NzUyOFx1NTQwRVx1OEJCRVx1NEUzQSB0cnVlXHVGRjBDXHU5NjNCXHU2QjYyXHU1RUY2XHU4RkRGXHU1NkRFXHU4QzAzXHU4OTg2XHU1MTk5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N1cHByZXNzZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICBhdHRhY2hJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gJyc7XG4gICAgfVxuICB9XG5cbiAgZGV0YWNoSWZyYW1lKCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNEQgT2JzaWRpYW4gXHU2NjBFXHU2Njk3XHU3MkI2XHU2MDAxICovXG4gIGlzRGFya01vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTcyQjZcdTYwMDEgKi9cbiAgcHVzaFRoZW1lKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgaWQ6ICd0aGVtZV9wdXNoXycgKyBEYXRlLm5vdygpLFxuICAgICAgICBwYXlsb2FkOiB7IGlzRGFyazogdGhpcy5pc0RhcmtNb2RlKCkgfSxcbiAgICAgIH0sXG4gICAgICAnKidcbiAgICApO1xuICB9XG5cbiAgLyoqIFx1NEY5Qlx1NTkxNlx1OTBFOFx1OEMwM1x1NzUyOFx1RkYxQU9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMSAqL1xuICBvblRoZW1lQ2hhbmdlZCgpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hUaGVtZSgpO1xuICB9XG5cbiAgLy8gPT09PT0gXHU1M0NDXHU1NDExXHU4QzAzXHU4MjcyID09PT09XG5cbiAgLyoqXG4gICAqIFx1OEJBMVx1N0I5NyB3ZWJhcHAgXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNiBcdTIxOTIgT2JzaWRpYW4gQ1NTIFx1NTNEOFx1OTFDRlx1NjYyMFx1NUMwNFxuICAgKiBcdTRFQzVcdTg5ODZcdTc2RDYgMyBcdTdDN0JcdTY4MzhcdTVGQzNcdTgyNzJcdUZGMDhcdTVGM0FcdThDMDMvXHU4MENDXHU2NjZGL1x1NjU4N1x1NUI1N1x1RkYwOVx1RkYwQ1x1NTE3Nlx1NEY1OVx1NzUzMSBPYnNpZGlhbiBcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTYzQThcdTdCOTdcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlT2JzaWRpYW5WYXJzKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgaCA9IE1hdGgucm91bmQoaHVlKTtcbiAgICBjb25zdCBsbyA9IE1hdGgubWF4KC0zMCwgTWF0aC5taW4oMzAsIGxpZ2h0bmVzc09mZnNldCkpO1xuXG4gICAgLy8gXHU1RjNBXHU4QzAzXHU4MjcyXG4gICAgY29uc3QgYWNjZW50UyA9IDQwO1xuICAgIGNvbnN0IGFjY2VudEwgPSBpc0RhcmsgPyA1MCA6IDQwO1xuICAgIGNvbnN0IGFjY2VudCA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TH0lKWA7XG4gICAgY29uc3QgYWNjZW50SG92ZXIgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEwgKyA1fSUpYDtcblxuICAgIC8vIFx1ODBDQ1x1NjY2Rlx1ODI3MlxuICAgIGNvbnN0IGJnUyA9IGlzRGFyayA/IDggOiAxMjtcbiAgICBjb25zdCBiZ0wgPSBpc0RhcmtcbiAgICAgID8gTWF0aC5tYXgoNSwgMTIgKyBsbyAqIDAuMylcbiAgICAgIDogTWF0aC5taW4oOTgsIDk0ICsgbG8gKiAwLjE1KTtcbiAgICBjb25zdCBiZ1ByaW1hcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7YmdMfSUpYDtcbiAgICBjb25zdCBiZ1NlY29uZGFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtpc0RhcmsgPyBiZ0wgKyAzIDogYmdMIC0gMn0lKWA7XG5cbiAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcbiAgICBjb25zdCB0ZXh0Tm9ybWFsID0gaXNEYXJrID8gYGhzbCgke2h9LCA2JSwgODglKWAgOiBgaHNsKCR7aH0sIDYlLCAxMiUpYDtcbiAgICBjb25zdCB0ZXh0TXV0ZWQgID0gaXNEYXJrID8gYGhzbCgke2h9LCA0JSwgNTUlKWAgOiBgaHNsKCR7aH0sIDQlLCA0NSUpYDtcblxuICAgIHJldHVybiB7XG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInOiBhY2NlbnRIb3ZlcixcbiAgICAgICctLXRleHQtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JzogYmdQcmltYXJ5LFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknOiBiZ1NlY29uZGFyeSxcbiAgICAgICctLXRleHQtbm9ybWFsJzogdGV4dE5vcm1hbCxcbiAgICAgICctLXRleHQtbXV0ZWQnOiB0ZXh0TXV0ZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdThDMDNcdTgyNzJcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqIDUwbXMgZGVib3VuY2VcdUZGMENcdTk2MzJcdTZCNjJcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU2RUQxXHU1NzU3XHU1RkVCXHU5MDFGXHU2MkQ2XHU2MkZEXHU0RUE3XHU3NTFGXHU5QUQ4XHU5ODkxIERPTSBcdTUxOTlcdTUxNjVcbiAgICovXG4gIGFwcGx5UGFsZXR0ZShodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYWxldHRlU3luY1RpbWVyKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpO1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gZmFsc2U7IC8vIFx1NjVCMFx1OEMwM1x1ODI3Mlx1OEJGN1x1NkM0Mlx1NTIzMFx1Njc2NSBcdTIxOTIgXHU4OUUzXHU5NjY0XHU2MjkxXHU1MjM2XG4gICAgdGhpcy5fcGFsZXR0ZVN5bmNUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCkgcmV0dXJuOyAvLyByZXN0b3JlRGVmYXVsdHMgXHU1NzI4XHU5NjMyXHU2Mjk2XHU3QTk3XHU1M0UzXHU1MTg1XHU4OEFCXHU4QzAzXHU3NTI4XG4gICAgICBjb25zdCB2YXJzID0gVGhlbWVCcmlkZ2UuY29tcHV0ZU9ic2lkaWFuVmFycyhodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZhcnMpKSB7XG4gICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLyoqIFx1NkUwNVx1OTY2NFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHVGRjBDXHU2MDYyXHU1OTBEIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OUVEOFx1OEJBNFx1NTAzQyAqL1xuICBzdGF0aWMgcmVzdG9yZURlZmF1bHRzKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBUaGVtZUJyaWRnZS5JTkpFQ1RFRF9WQVJTKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFN0b3JhZ2VCcmlkZ2UgfSBmcm9tICcuL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuL1RoZW1lQnJpZGdlJztcbmltcG9ydCB0eXBlIHsgQW55QnJpZGdlTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzL21lc3NhZ2VzJztcbmltcG9ydCB7IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUywgQVVESU9fTUlNRV9UWVBFUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuXG4vKiogXHU2MjZCXHU2M0NGXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2NUY2XHU5RUQ4XHU4QkE0XHU4REYzXHU4RkM3XHU3Njg0XHU3NkVFXHU1RjU1XHU1NDBEXHVGRjA4Y29uZmlnRGlyIFx1NTNFRlx1OTAxQVx1OEZDNyBzZXRDb25maWdEaXIgXHU4MUVBXHU1QjlBXHU0RTQ5XHVGRjA5ICovXG5jb25zdCBERUZBVUxUX1NLSVBfRElSUyA9IFsnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ107XG5cbi8qKlxuICogQnJpZGdlU2VydmljZSAtIHBvc3RNZXNzYWdlIFx1NkQ4OFx1NjA2Rlx1OERFRlx1NzUzMVx1NEUyRFx1NUZDM1xuICpcbiAqIFx1NzZEMVx1NTQyQyBpZnJhbWUgXHU1M0QxXHU2NzY1XHU3Njg0IHBvc3RNZXNzYWdlXHVGRjBDXHU1MjA2XHU1M0QxXHU1MjMwXHU1QkY5XHU1RTk0XHU1OTA0XHU3NDA2XHU2QTIxXHU1NzU3XHVGRjBDXG4gKiBcdTcxMzZcdTU0MEVcdTVDMDZcdTdFRDNcdTY3OUNcdTU2REVcdTRGMjBcdTdFRDkgaWZyYW1lXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBCcmlkZ2VTZXJ2aWNlIHtcbiAgICBwcml2YXRlIHN0b3JhZ2VCcmlkZ2U6IFN0b3JhZ2VCcmlkZ2U7XG4gICAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2U7XG4gICAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCgpID0+IFByb21pc2U8dm9pZD4pIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcjogKChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgY3VzdG9tVGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gICAgcHJpdmF0ZSB2YXVsdEJhc2VQYXRoOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIG5vaXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBjb25maWdEaXI6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgZXhwZWN0ZWRPcmlnaW4gPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlLFxuICAgICAgICB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2UsXG4gICAgICAgIHNldHRpbmdzPzogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgICAgIHNhdmVTZXR0aW5ncz86ICgpID0+IFByb21pc2U8dm9pZD5cbiAgICApIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlQnJpZGdlID0gc3RvcmFnZUJyaWRnZTtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZSA9IHRoZW1lQnJpZGdlO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3MgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3MgfHwgbnVsbDtcbiAgICB9XG5cbiAgLyoqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RTc2XHU1RjAwXHU1OUNCXHU3NkQxXHU1NDJDXHU2RDg4XHU2MDZGICovXG4gIGF0dGFjaChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgLy8gXHU5NjMyXHU2QjYyXHU5MUNEXHU1OTBEXHU3RUQxXHU1QjlBXG4gICAgdGhpcy5kZXRhY2goKTtcblxuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG5cbiAgICAvLyBcdThCQjBcdTVGNTUgZXhwZWN0ZWQgb3JpZ2luXHVGRjBDXHU3NTI4XHU0RThFXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5vbk1lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyMTdcdTg4NjhcdUZGMDhcdTRGOUJcdTYzRDJcdTRFRjZcdTdBRUZcdTYyNkJcdTYzQ0ZcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgc2V0Q3VzdG9tVGhlbWVzKHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pik6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tVGhlbWVzID0gdGhlbWVzO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOFx1NEY5Qlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBzZXRWYXVsdEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnZhdWx0QmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODQgKi9cbiAgc2V0Tm9pc2VQYXRoKG5vaXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNCAub2JzaWRpYW5cdUZGMENcdTc1MjhcdTYyMzdcdTUzRUZcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbiAgc2V0Q29uZmlnRGlyKGRpcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdEaXIgPSBkaXI7XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHU2MjE2XHU1MTY4XHU1RTkzXHU2MjZCXHU2M0NGXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgX3NjYW5WYXVsdEF1ZGlvRmlsZXMobWF4RGVwdGggPSA1KTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFsbG93ZWRFeHRzID0gQUxMT1dFRF9BVURJT19FWFRFTlNJT05TO1xuICAgIGNvbnN0IGJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgIGlmICghYmFzZVBhdGgpIHJldHVybiByZXN1bHRzO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1IGJhc2VQYXRoIFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1RkYwOFx1NUYwMlx1NkI2NVx1RkYwOVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGJhc2VQYXRoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjMwN1x1NUI5QVx1NEU4Nlx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTNFQVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEUwRFx1OTAxMlx1NUY1Mlx1RkYwOVxuICAgIGlmICh0aGlzLm5vaXNlUGF0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0RGlyID0gcGF0aC5qb2luKGJhc2VQYXRoLCB0aGlzLm5vaXNlUGF0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzOiBmcy5EaXJlbnRbXSA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIodGFyZ2V0RGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUoKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQ6IGZzLlN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChwYXRoLmpvaW4odGFyZ2V0RGlyLCBlbnRyeS5uYW1lKSk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiBwYXRoLmpvaW4odGhpcy5ub2lzZVBhdGgsIGVudHJ5Lm5hbWUpLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTY3MkFcdTYzMDdcdTVCOUFcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUxNjhcdTVFOTNcdTkwMTJcdTVGNTJcdTYyNkJcdTYzQ0ZcdUZGMDhcdTVGMDJcdTZCNjUgKyBcdTZERjFcdTVFQTZcdTk2NTBcdTUyMzZcdUZGMDlcbiAgICBjb25zdCBzY2FuRGlyID0gYXN5bmMgKGRpclBhdGg6IHN0cmluZywgcmVsYXRpdmVQcmVmaXg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcbiAgICAgIGxldCBlbnRyaWVzOiBmcy5EaXJlbnRbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVudHJpZXMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGRpclBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgIH0gY2F0Y2ggeyByZXR1cm47IC8qIHNraXAgdW5yZWFkYWJsZSBkaXJzICovIH1cblxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsIGVudHJ5Lm5hbWUpO1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZVByZWZpeCA/IHBhdGguam9pbihyZWxhdGl2ZVByZWZpeCwgZW50cnkubmFtZSkgOiBlbnRyeS5uYW1lO1xuXG4gICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgY29uc3Qgc2tpcERpcnMgPSBuZXcgU2V0KFsuLi5ERUZBVUxUX1NLSVBfRElSUywgLi4uKHRoaXMuY29uZmlnRGlyID8gW3RoaXMuY29uZmlnRGlyXSA6IFtdKV0pO1xuICAgICAgICAgIGlmIChza2lwRGlycy5oYXMoZW50cnkubmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgIGF3YWl0IHNjYW5EaXIoZnVsbFBhdGgsIHJlbGF0aXZlUGF0aCwgZGVwdGggKyAxKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0ZpbGUoKSkge1xuICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBzdGF0OiBmcy5TdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiByZWxhdGl2ZVBhdGgsIG5hbWU6IGVudHJ5Lm5hbWUsIHNpemU6IHN0YXQuc2l6ZSwgZXh0IH0pO1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBhd2FpdCBzY2FuRGlyKGJhc2VQYXRoLCAnJywgMCk7XG4gICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKiBcdTg5RTNcdTdFRDEgaWZyYW1lXHVGRjBDXHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZXNzYWdlSGFuZGxlcikge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnRoZW1lQnJpZGdlLmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTU5MDRcdTc0MDYgKi9cbiAgcHJpdmF0ZSBhc3luYyBvbk1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1zZyA9IGV2ZW50LmRhdGEgYXMgQW55QnJpZGdlTWVzc2FnZTtcbiAgICBpZiAoIW1zZyB8fCAhbXNnLnR5cGUgfHwgIW1zZy5pZCkgcmV0dXJuO1xuXG4gICAgLy8gXHU2ODIxXHU5QThDXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHVGRjFBc291cmNlICsgb3JpZ2luIFx1NTNDQ1x1OTFDRFx1OUE4Q1x1OEJDMVxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiBldmVudC5zb3VyY2UgIT09IHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZXhwZWN0ZWRPcmlnaW4gJiYgZXZlbnQub3JpZ2luICE9PSB0aGlzLmV4cGVjdGVkT3JpZ2luKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tCcmlkZ2VTZXJ2aWNlXSBJZ25vcmVkIG1lc3NhZ2UgZnJvbSB1bmtub3duIG9yaWdpbjonLCBldmVudC5vcmlnaW4pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNlx1NURGMlx1NzdFNVx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4Qlx1NTI0RFx1N0YwMFxuICAgIGlmICghbXNnLnR5cGUuc3RhcnRzV2l0aCgnc3RvcmFnZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnYXBwOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCdmaWxlOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCd0aGVtZTonKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlx1NkQ4OFx1NjA2RlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpyZWFkeScpIHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKCk7XG4gICAgICAvLyBcdTYyOEFcdTYzMDFcdTRFNDVcdTUzMTZcdTc2ODQgc2VjdGlvbkNvbmZpZ1x1MzAwMVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTQ4Q1x1ODFFQVx1NUI5QVx1NEU0OVx1OTdGM1x1NkU5MFx1OTY4RiByZWFkeSBcdTU0Q0RcdTVFOTRcdTUzRDFcdTdFRDkgd2ViYXBwXG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBzZWN0aW9uQ29uZmlnOiB0aGlzLnNldHRpbmdzPy5zZWN0aW9uQ29uZmlnIHx8IG51bGwsXG4gICAgICAgIGN1c3RvbVRoZW1lczogdGhpcy5jdXN0b21UaGVtZXMsXG4gICAgICAgIGN1c3RvbU5vaXNlczogdGhpcy5zZXR0aW5ncz8ubm9pc2VJdGVtcyB8fCBbXSxcbiAgICAgICAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiB0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gfHwgZmFsc2UsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6Y2xvc2UnKSB7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1Njc3Rlx1NTc1N1x1OTE0RFx1N0Y2RVx1NjMwMVx1NEU0NVx1NTMxNlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpzYXZlU2VjdGlvbkNvbmZpZycpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2VjdGlvbkNvbmZpZyA9IG1zZy5wYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmdzKSBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZUN1c3RvbU5vaXNlcycpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Mubm9pc2VJdGVtcyA9IG1zZy5wYXlsb2FkIGFzIHVua25vd25bXSB8fCBbXTtcbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmdzKSBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTRFM0JcdTk4OThcdTUyMDdcdTYzNjJcdThCRjdcdTZDNDJcdUZGMDhpZnJhbWUgXHUyMTkyIE9ic2lkaWFuXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnRvZ2dsZVRoZW1lJykge1xuICAgICAgY29uc3QgdGFyZ2V0SXNEYXJrID0gbXNnLnBheWxvYWQuaXNEYXJrID09PSB0cnVlOyAgICAgIGNvbnN0IGN1cnJlbnRJc0RhcmsgPSBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICAgICAgaWYgKHRhcmdldElzRGFyayAhPT0gY3VycmVudElzRGFyaykge1xuICAgICAgICBpZiAodGFyZ2V0SXNEYXJrKSB7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1saWdodCcpO1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtZGFyaycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtZGFyaycpO1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTkwMUFcdTc3RTUgaWZyYW1lIFx1NEUzQlx1OTg5OFx1NURGMlx1NTIwN1x1NjM2MlxuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSwgaXNEYXJrOiB0YXJnZXRJc0RhcmsgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU4QkY3XHU2QzQyXHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pIHtcbiAgICAgICAgY29uc3QgeyBodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrIH0gPSBtc2cucGF5bG9hZDtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5hcHBseVBhbGV0dGUoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vID09PT09IFx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1RkYxQVx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiA9PT09PVxuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU2MjQwXHU2NzA5XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU0RjlCIHdlYmFwcCBcdTY1ODdcdTRFRjZcdTkwMDlcdTYyRTlcdTU2NjhcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6bGlzdFZhdWx0QXVkaW9GaWxlcycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMENcdThCRjdcdTVDMURcdThCRDVcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTk3NjJcdTY3N0YnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBfc2NhblZhdWx0QXVkaW9GaWxlcygpIFx1NTE4NVx1OTBFOFx1NURGMlx1NUYwMlx1NkI2NVx1NjhDMFx1NjdFNVx1OERFRlx1NUY4NFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKTtcbiAgICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBmaWxlcyB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb10gXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1OicsIGVycm9yKTtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdcdTYyNkJcdTYzQ0ZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTkwMUFcdThGQzdcdTVFOTNcdTUxODVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcdTIwMTQgXHU4RkQ0XHU1NkRFXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1MjREXHU3QUVGXHU3NkY0XHU2M0E1IGZldGNoIGZpbGU6Ly9cbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZFZhdWx0RmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgaWYgKCF0aGlzLnZhdWx0QmFzZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSB0aGlzLnZhdWx0QmFzZVBhdGg7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIC8vIFx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NjhDMFx1NjdFNVx1RkYxQVx1Nzg2RVx1NEZERFx1ODlFM1x1Njc5MFx1NTQwRVx1NzY4NFx1OERFRlx1NUY4NFx1NjcyQVx1OTAwM1x1OTAzOFx1NTFGQSB2YXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgICAgaWYgKCFmdWxsUGF0aC5zdGFydHNXaXRoKHZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjJcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQScgKyByZWxhdGl2ZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZVBhdGg6IGZ1bGxQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKHJlbGF0aXZlUGF0aCwgZXh0KSB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdcdThCRkJcdTUzRDZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTY3MkNcdTU3MzBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdTU2REVcdTRGMjBcdThERUZcdTVGODRcdTc1MzFcdTUyNERcdTdBRUZcdTc1MjggZmlsZTovLyBcdTUyQTBcdThGN0RcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZExvY2FsRmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gbXNnLnBheWxvYWQ/LnBhdGggfHwgJyc7XG4gICAgICAgIGlmICghZmlsZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NjJEMlx1N0VERFx1NTMwNVx1NTQyQlx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NUI1N1x1N0IyNlx1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICBpZiAoZmlsZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZpbGVQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZVBhdGgsIG5hbWU6IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1QjU4XHU1MEE4XHU3QzdCXHU2RDg4XHU2MDZGXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZUJyaWRnZS5oYW5kbGUobXNnKTtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjgzOVx1NjM2RVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1ODNCN1x1NTNENiBNSU1FIFx1N0M3Qlx1NTc4QiAqL1xuICBwcml2YXRlIF9nZXRBdWRpb01pbWVUeXBlKGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gQVVESU9fTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBwYXlsb2FkIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kRXJyb3IoaWQ6IHN0cmluZywgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgaWQsIGVycm9yIH0sICcqJyk7XG4gIH1cbn1cbiIsICIvKiogXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA4XHU1QjhDXHU2NTc0XHU1MjE3XHU4ODY4XHVGRjA5ICovXG5leHBvcnQgY29uc3QgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TID0gW1xuICAnLm1wMycsICcud2F2JywgJy5vZ2cnLCAnLmZsYWMnLCAnLmFhYycsICcubTRhJywgJy53bWEnLCAnLndlYm0nLCAnLm9wdXMnLFxuXTtcblxuLyoqIFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRCBcdTIxOTIgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbmV4cG9ydCBjb25zdCBBVURJT19NSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLm1wMyc6ICAnYXVkaW8vbXBlZycsXG4gICcud2F2JzogICdhdWRpby93YXYnLFxuICAnLm9nZyc6ICAnYXVkaW8vb2dnJyxcbiAgJy5mbGFjJzogJ2F1ZGlvL2ZsYWMnLFxuICAnLmFhYyc6ICAnYXVkaW8vYWFjJyxcbiAgJy5tNGEnOiAgJ2F1ZGlvL21wNCcsXG4gICcud21hJzogICdhdWRpby94LW1zLXdtYScsXG4gICcud2VibSc6ICdhdWRpby93ZWJtJyxcbiAgJy5vcHVzJzogJ2F1ZGlvL29wdXMnLFxufTtcblxuLyoqIFx1NUI4Q1x1NjU3NCBNSU1FIFx1N0M3Qlx1NTc4Qlx1NjYyMFx1NUMwNFx1RkYwOFx1NTQyQiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHVGRjA5ICovXG5leHBvcnQgY29uc3QgTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5odG1sJzogJ3RleHQvaHRtbDsgY2hhcnNldD11dGYtOCcsXG4gICcuY3NzJzogICd0ZXh0L2NzczsgY2hhcnNldD11dGYtOCcsXG4gICcuanMnOiAgICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5tanMnOiAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzb24nOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICcucG5nJzogICdpbWFnZS9wbmcnLFxuICAnLmpwZyc6ICAnaW1hZ2UvanBlZycsXG4gICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJy5naWYnOiAgJ2ltYWdlL2dpZicsXG4gICcuc3ZnJzogICdpbWFnZS9zdmcreG1sJyxcbiAgJy5pY28nOiAgJ2ltYWdlL3gtaWNvbicsXG4gICcud29mZic6ICdmb250L3dvZmYnLFxuICAnLndvZmYyJzonZm9udC93b2ZmMicsXG4gICcudHRmJzogICdmb250L3R0ZicsXG4gIC4uLkFVRElPX01JTUVfVFlQRVMsXG59O1xuIiwgImltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgbmV0IGZyb20gJ25ldCc7XG5pbXBvcnQgeyBNSU1FX1RZUEVTLCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuXG4vKipcbiAqIExvY2FsU2VydmVyIC0gXHU2NzJDXHU1NzMwIEhUVFAgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2NzBEXHU1MkExXHU1NjY4XG4gKlxuICogXHU1NzI4IE9ic2lkaWFuIChFbGVjdHJvbikgXHU3M0FGXHU1ODgzXHU0RTJEXHU1NDJGXHU1MkE4XHU0RTAwXHU0RTJBXHU2NzJDXHU1NzMwIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXG4gKiBcdTRFM0EgaWZyYW1lIFx1NjNEMFx1NEY5QiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU2NzBEXHU1MkExXHVGRjBDXHU3RUQ1XHU4RkM3IGFwcDovLyBcdTUzNEZcdThCQUVcdTc2ODRcdTk2NTBcdTUyMzZcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU2VydmVyIHtcbiAgcHJpdmF0ZSBzZXJ2ZXI6IGh0dHAuU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcG9ydCA9IDA7XG4gIHByaXZhdGUgd2ViYXBwRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG5cbiAgY29uc3RydWN0b3Iod2ViYXBwRGlyOiBzdHJpbmcpIHtcbiAgICB0aGlzLndlYmFwcERpciA9IHdlYmFwcERpcjtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU1NDJGXHU1MkE4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXHU4RkQ0XHU1NkRFXHU3NkQxXHU1NDJDXHU3QUVGXHU1M0UzICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKHRoaXMuc2VydmVyKSByZXR1cm4gdGhpcy5wb3J0O1xuXG4gICAgdGhpcy5wb3J0ID0gYXdhaXQgdGhpcy5maW5kRnJlZVBvcnQoKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QocmVxLCByZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFNlcnZlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbih0aGlzLnBvcnQsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RhcnRlZCBvbiBwb3J0ICR7dGhpcy5wb3J0fWApO1xuICAgICAgICByZXNvbHZlKHRoaXMucG9ydCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTUwNUNcdTZCNjJcdTY3MERcdTUyQTFcdTU2NjggKi9cbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIExvY2FsIHNlcnZlciBzdG9wcGVkJyk7XG4gICAgICAgICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgICAgICAgIHRoaXMucG9ydCA9IDA7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTY3MERcdTUyQTFcdTU2NjggVVJMICovXG4gIGdldFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgaHR0cDovLzEyNy4wLjAuMToke3RoaXMucG9ydH1gO1xuICB9XG5cbiAgLyoqIFx1NTkwNFx1NzQwNiBIVFRQIFx1OEJGN1x1NkM0MiAqL1xuICBwcml2YXRlIGhhbmRsZVJlcXVlc3QocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgLy8gL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU0RUUzXHU3NDA2XHVGRjBDXHU3RUQ1XHU4RkM3IHBvc3RNZXNzYWdlIFx1NTkyNyBwYXlsb2FkIFx1OTY1MFx1NTIzNlxuICAgIGNvbnN0IHVybCA9IHJlcS51cmwgfHwgJy8nO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnL2JhbWJvby1hdWRpbycpKSB7XG4gICAgICB0aGlzLmhhbmRsZUF1ZGlvUHJveHkocmVxLCByZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1ODlFM1x1Njc5MCBVUkxcdUZGMENcdTUzQkJcdTk2NjRcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICBsZXQgdXJsUGF0aCA9IHVybC5zcGxpdCgnPycpWzBdO1xuICAgIC8vIFx1NzZFRVx1NUY1NVx1OUVEOFx1OEJBNFx1NjU4N1x1NEVGNlxuICAgIGlmICh1cmxQYXRoLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHVybFBhdGggKz0gJ2luZGV4Lmh0bWwnO1xuICAgIH1cbiAgICBjb25zdCBzYWZlUGF0aCA9IHBhdGgubm9ybWFsaXplKHVybFBhdGgpLnJlcGxhY2UoL14oXFwuXFwuWy9cXFxcXSkrLywgJycpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMud2ViYXBwRGlyLCBzYWZlUGF0aCk7XG5cbiAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTU3Mjggd2ViYXBwRGlyIFx1NTE4NVxuICAgIGlmICghZmlsZVBhdGguc3RhcnRzV2l0aCh0aGlzLndlYmFwcERpcikpIHtcbiAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTtcbiAgICAgIHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGZzLnN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICBpZiAoZXJyIHx8ICFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XG4gICAgICAgIHJlcy5lbmQoJ05vdCBGb3VuZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RSBNSU1FIFx1N0M3Qlx1NTc4QlxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSBNSU1FX1RZUEVTW2V4dF0gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NEUwRFx1OTcwMFx1ODk4MSBDT1JTXHVGRjBDaWZyYW1lIFx1NEUwRVx1NjcwRFx1NTJBMVx1NTY2OFx1NTQwQ1x1NkU5MFx1RkYwOVxuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScsXG4gICAgICB9KTtcblxuICAgICAgLy8gXHU2RDQxXHU1RjBGXHU0RjIwXHU4RjkzXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBzdHJlYW06IGZzLlJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoKTtcbiAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU2RDQxXHU1RjBGXHU0RUUzXHU3NDA2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9Qcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXM6IFVSTFNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHIpO1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFyYW1zLmdldCgncGF0aCcpO1xuICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHBhdGggcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU1M0VBXHU1MTQxXHU4QkI4XHU2MzA3XHU1QjlBXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUocmVsYXRpdmVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogdW5zdXBwb3J0ZWQgYXVkaW8gZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzk4MVx1NkI2Mlx1OERFRlx1NUY4NFx1N0E3Rlx1OEQ4QVxuICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IHBhdGgubm9ybWFsaXplKHJlbGF0aXZlUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcuLicpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTsgcmVzLmVuZCgnVmF1bHQgYmFzZSBwYXRoIG5vdCBjb25maWd1cmVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCBub3JtYWxpemVkKTtcbiAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnMuc3RhdChmdWxsUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7IHJlcy5lbmQoJ0ZpbGUgbm90IGZvdW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBzdGF0cy5zaXplLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3RyZWFtOiBmcy5SZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmdWxsUGF0aCk7XG4gICAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIHJlcy5lbmQoJ1N0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gcHJveHkgZXJyb3I6JywgZSk7XG4gICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY3RTVcdTYyN0VcdTUzRUZcdTc1MjhcdTdBRUZcdTUzRTMgKi9cbiAgcHJpdmF0ZSBmaW5kRnJlZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgc2VydmVyLmxpc3RlbigwLCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3J0ID0gKHNlcnZlci5hZGRyZXNzKCkgYXMgbmV0LkFkZHJlc3NJbmZvKS5wb3J0O1xuICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4gcmVzb2x2ZShwb3J0KSk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59IiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcblxuLyoqIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyAqL1xuZXhwb3J0IGludGVyZmFjZSBCYW1ib29SZXZpZXdTZXR0aW5ncyB7XG4gIC8qKiBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdTY4MzlcdThERUZcdTVGODQgKi9cbiAgZGF0YVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEgKi9cbiAgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuICAvKiogXHU2NzdGXHU1NzU3XHU3QkExXHU3NDA2XHU5MTREXHU3RjZFXHVGRjA4XHU1M0VGXHU4OUMxXHU2MDI3ICsgXHU2MzkyXHU1RThGXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFIHdlYmFwcCBpZnJhbWUgbG9jYWxTdG9yYWdlIFx1NEUwRFx1NTNFRlx1OTc2MFx1NjVGNlx1NjMwMVx1NEU0NVx1NTMxNiAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDkgKi9cbiAgdGhlbWVQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTNcdUZGMDkgKi9cbiAgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTUyMTdcdTg4NjhcdUZGMDhcdTkwMUFcdThGQzdcdTY4NjVcdTYzQTVcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMENcdTUxNEJcdTY3MEQgbG9jYWxTdG9yYWdlIHBvcnQtc2NvcGVkIFx1OTVFRVx1OTg5OFx1RkYwOSAqL1xuICBub2lzZUl0ZW1zOiB1bmtub3duW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVDMDYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjIgKi9cbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSB7XG4gIGRhdGFQYXRoOiAnYmFtYm9vLXJldmlldycsXG4gIGVuYWJsZU1hcmtkb3duU3luYzogdHJ1ZSxcbiAgc2VjdGlvbkNvbmZpZzogbnVsbCxcbiAgdGhlbWVQYXRoOiAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JyxcbiAgbm9pc2VQYXRoOiAnJyxcbiAgbm9pc2VJdGVtczogW10sXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogZmFsc2UsXG59O1xuXG4vKipcbiAqIFBsdWdpblNldHRpbmdzIC0gT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gKi9cbmV4cG9ydCBjbGFzcyBQbHVnaW5TZXR0aW5ncyBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1zZXR0aW5ncycpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vID09PSBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU1NzI4IFZhdWx0IFx1NEUyRFx1NzY4NFx1NUI1OFx1NTBBOFx1NzZFRVx1NUY1NVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignYmFtYm9vLXJldmlldycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoID0gdmFsdWUgfHwgJ2JhbWJvby1yZXZpZXcnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBNYXJrZG93biBcdTY0NThcdTg5ODFcdTU0MENcdTZCNjVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxJylcbiAgICAgIC5zZXREZXNjKCdcdTZCQ0ZcdTZCMjFcdTRGRERcdTVCNThcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTU3MjggcmV2aWV3cy8gXHU3NkVFXHU1RjU1XHU0RTBCXHU3NTFGXHU2MjEwXHU1M0VGXHU4QkZCXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjYnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NUI1OFx1NjUzRVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoID0gdmFsdWUgfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTc2N0RcdTU2NkFcdTk3RjMgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGMycpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOScpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU2MzA3XHU1QjlBXHU1NDBFXHU0RUM1XHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHU1MTg1XHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHUzMDAyXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU2NTc0XHU0RTJBXHU1RTkzXHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTc2N0RcdTU2NkFcdTk3RjMgXHU2MjE2XHU3NTU5XHU3QTdBXHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1QzA2XHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMEN3ZWJhcHAgXHU1MTg1XHU2MEFDXHU2RDZFXHU4M0RDXHU1MzU1XHU3Njg0XHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1OEMwM1x1ODI3Mlx1NEYxQVx1NUI5RVx1NjVGNlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTc2ODRcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdTkxNERcdTgyNzInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKGZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBlbmFibGVkOiB2YWx1ZSB9XG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTUxNzNcdTRFOEVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU1MTczXHU0RThFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAxXHVGRjFBXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBsdWdpbkJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdCYW1ib28gSW1tb3J0YWxzXHVGRjA4XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHVGRjA5XHU2NjJGXHU0RTAwXHU2QjNFXHU1N0ZBXHU0RThFXHU4MkNGXHU4MDU0XHU2M0E3XHU1MjM2XHU4QkJBXHU0RTRCXHU3MjM2XHU3RUY0XHU1MTRCXHU2MjU4XHUwMEI3XHU2ODNDXHU1MzYyXHU0RUMwXHU3OUQxXHU1OTJCXHU2M0QwXHU1MUZBXHU3Njg0XCJPR0FTXCJcdTc0MDZcdTVGRjVcdUZGMENcdTRFMTNcdTRFM0FcdTRFMkFcdTRFQkFcdTYyNTNcdTkwMjBcdTc2ODRcdTRFMkRcdTU2RkRcdTk4Q0VcdTc2RUVcdTY4MDdcdTgxRUFcdTUyQThcdTUzMTZcdTUyMDZcdTkxNERcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnXG4gICAgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQgYmFtYm9vLWFib3V0LWF1dGhvcicgfSk7XG4gICAgY29uc3QgYXV0aG9yUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm93JyB9KTtcbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF2YXRhcicgfSk7XG4gICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvMndCREFBWUVCUVlGQkFZR0JRWUhCd1lJQ2hBS0Nna0pDaFFPRHd3UUZ4UVlHQmNVRmhZYUhTVWZHaHNqSEJZV0lDd2dJeVluS1NvcEdSOHRNQzBvTUNVb0tTai8yd0JEQVFjSEJ3b0lDaE1LQ2hNb0doWWFLQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0NqL3dBQVJDQUtBQW9BREFTSUFBaEVCQXhFQi84UUFId0FBQVFVQkFRRUJBUUVBQUFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSQUFBZ0VEQXdJRUF3VUZCQVFBQUFGOUFRSURBQVFSQlJJaE1VRUdFMUZoQnlKeEZES0JrYUVJSTBLeHdSVlMwZkFrTTJKeWdna0tGaGNZR1JvbEppY29LU28wTlRZM09EazZRMFJGUmtkSVNVcFRWRlZXVjFoWldtTmtaV1puYUdscWMzUjFkbmQ0ZVhxRGhJV0doNGlKaXBLVGxKV1dsNWlabXFLanBLV21wNmlwcXJLenRMVzJ0N2k1dXNMRHhNWEd4OGpKeXRMVDFOWFcxOWpaMnVIaTQrVGw1dWZvNmVyeDh2UDA5ZmIzK1BuNi84UUFId0VBQXdFQkFRRUJBUUVCQVFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSRUFBZ0VDQkFRREJBY0ZCQVFBQVFKM0FBRUNBeEVFQlNFeEJoSkJVUWRoY1JNaU1vRUlGRUtSb2JIQkNTTXpVdkFWWW5MUkNoWWtOT0VsOFJjWUdSb21KeWdwS2pVMk56ZzVPa05FUlVaSFNFbEtVMVJWVmxkWVdWcGpaR1ZtWjJocGFuTjBkWFozZUhsNmdvT0VoWWFIaUltS2twT1VsWmFYbUptYW9xT2twYWFucUttcXNyTzB0YmEzdUxtNndzUEV4Y2JIeU1uSzB0UFUxZGJYMk5uYTR1UGs1ZWJuNk9ucTh2UDA5ZmIzK1BuNi85b0FEQU1CQUFJUkF4RUFQd0Q1VW9vb29BS0tLS0FDaWlpZ0Fvb285S0FDaWlqMG9BS0tLUFNnQW9vb29BS0tLS0FDaWlqMG9BS0tLWEZBQ1VVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGTGlnVXRBRGFLV2tvQUtVZEtTbEZBQ2lrTkxTR2dCS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vcFJRQWxGTGlrb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBRkZGTFNHZ0JLS0tLQUNsRkpUaFFBbEpUcWJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBb3BhUVV0QUNVbExTVUFGS0tTbEZBQzBob29vQVNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FXbHBCUzBBRk5wMUlhQUVvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQXBRS0JUaFFBQ2tOT3hUV29BYlJSUlFBVTRVMm5DZ0FwS2RUVFFBbEZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFLS1drRkxRQWxKVHFiUUFVb3BLVVVBRkZGSlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRktLQUZGTFNDbG9BS1EwdElhQUcwVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJTaWtwUlFBNFVvcEtCUUF0SWFXa05BREtLS0tBQ25MVGFVVUFPb29vb0FTbTA0MDJnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2w3VWxLS0FDaWxwRFFBbEtLU25VQUZKUzBkcUFHMFVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrcHdvQVNrcHhwdEFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrLi4uIFt0cnVuY2F0ZWRdJ1xuICAgIH0pO1xuXG4gICAgY29uc3QgYXV0aG9ySW5mbyA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLWluZm8nIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTdGQkRcdTlDREVcdTU0MUInLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLW5hbWUnIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTU1QjVcdTVCNTdcdTk5ODZcdTUyMUJcdTU5Q0JcdTRFQkEnLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvbGUnIH0pO1xuXG4gICAgLy8gXHU0RjVDXHU1NEMxXHU1MzNBXG4gICAgYXV0aG9yQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU0RjVDXHU1NEMxJywgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLWxhYmVsJyB9KTtcbiAgICBjb25zdCB3b3Jrc1JvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3Mtcm93JyB9KTtcblxuICAgIFsnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCddLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICB3b3Jrc1Jvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogbmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFzQztBQUN0QyxJQUFBQyxRQUFzQjtBQUN0QixJQUFBQyxNQUFvQjtBQUNwQixXQUFzQjtBQUN0QixZQUF1Qjs7O0FDSnZCLElBQUFDLG1CQUF3QztBQUN4QyxJQUFBQyxRQUFzQjtBQUN0QixJQUFBQyxNQUFvQjs7O0FDRnBCLHNCQUEwQztBQWNuQyxJQUFNLGVBQU4sTUFBbUI7QUFBQSxFQUl4QixZQUFZLEtBQVUsV0FBVyxpQkFBaUI7QUFDaEQsU0FBSyxNQUFNO0FBQ1gsU0FBSyxlQUFXLCtCQUFjLFFBQVE7QUFBQSxFQUN4QztBQUFBO0FBQUEsRUFHQSxNQUFjLFVBQVUsS0FBNEI7QUFDbEQsVUFBTUMsWUFBTywrQkFBYyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUNwRCxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU9BLEtBQUksR0FBSTtBQUNoRCxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsTUFBTUEsS0FBSTtBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFNLGtCQUFpQztBQUNyQyxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sS0FBSyxRQUFRLEdBQUk7QUFDekQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sS0FBSyxRQUFRO0FBQUEsSUFDbEQ7QUFDQSxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQzNCLFVBQU0sS0FBSyxVQUFVLFNBQVM7QUFBQSxFQUNoQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsTUFBYyxXQUFXQSxPQUFjLFNBQWdD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LENBQUM7QUFBQSxJQUNqQixPQUFPO0FBRUwsYUFBTyxVQUFVLFFBQVEsS0FBSztBQUM5QixZQUFNLEtBQUssYUFBYTtBQUFBLFFBQ3RCLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBRUEsUUFBSSxNQUFNO0FBQ1IsWUFBTSxVQUFVLFdBQVcsSUFBSTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxhQUFhLE1BQW9CO0FBQ3ZDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0Isc0JBQXNCO0FBQ3hFLFFBQUksT0FBTyxXQUFXLEVBQUc7QUFFekIsVUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLFVBQU0sU0FBVSxLQUFhO0FBQzdCLFFBQUksUUFBUSxlQUFlO0FBQ3pCLFVBQUksU0FBUztBQUNiLFVBQUk7QUFBRSxpQkFBUyxJQUFJLElBQUksT0FBTyxHQUFHLEVBQUU7QUFBQSxNQUFRLFFBQVE7QUFBQSxNQUFpQjtBQUNwRSxhQUFPLGNBQWM7QUFBQSxRQUNuQixFQUFFLE1BQU0sSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQUEsUUFDaEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQzNFO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsRUFDbkM7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJzdGF0IiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgImNodW5rcyJdCn0K
