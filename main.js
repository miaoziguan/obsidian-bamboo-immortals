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
var path5 = __toESM(require("path"));
var fs5 = __toESM(require("fs"));
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
    const path6 = (0, import_obsidian.normalizePath)(`${this.basePath}/${dir}`);
    if (!await this.app.vault.adapter.exists(path6)) {
      await this.app.vault.adapter.mkdir(path6);
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
  async vaultWrite(path6, content) {
    const normalized = (0, import_obsidian.normalizePath)(path6);
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
    const path6 = this.dayPath(dateKey);
    if (!await this.app.vault.adapter.exists(path6)) {
      return null;
    }
    try {
      const content = await this.app.vault.adapter.read(path6);
      return JSON.parse(content);
    } catch (e) {
      console.warn(`[BambooReview] \u65E5\u671F\u6570\u636E\u6587\u4EF6\u635F\u574F\uFF0C\u5C06\u8DF3\u8FC7: ${path6}`, e);
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
    const path6 = this.dayPath(dateKey);
    await this.vaultWrite(path6, JSON.stringify(dayData, null, 2));
  }
  async deleteDay(dateKey) {
    const path6 = this.dayPath(dateKey);
    if (await this.app.vault.adapter.exists(path6)) {
      await this.app.vault.adapter.remove(path6);
    }
  }
  // ---- 全局目标 (goals) ----
  goalsPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/goals.json`);
  }
  async getGoals() {
    const path6 = this.goalsPath();
    if (!await this.app.vault.adapter.exists(path6)) {
      return [];
    }
    const content = await this.app.vault.adapter.read(path6);
    return JSON.parse(content);
  }
  async putGoals(goals) {
    const path6 = this.goalsPath();
    await this.vaultWrite(path6, JSON.stringify(goals, null, 2));
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
    const path6 = (0, import_obsidian.normalizePath)(this.settingsPath());
    const abstract = this.app.vault.getAbstractFileByPath(path6);
    if (abstract instanceof import_obsidian.TFile) {
      await this.app.vault.process(abstract, (data) => {
        const settings = JSON.parse(data);
        settings[key] = value;
        return JSON.stringify(settings, null, 2);
      });
    } else {
      await this.vaultWrite(path6, JSON.stringify({ [key]: value }, null, 2));
    }
  }
  async getAllSettings() {
    const path6 = this.settingsPath();
    if (!await this.app.vault.adapter.exists(path6)) {
      return {};
    }
    try {
      const content = await this.app.vault.adapter.read(path6);
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
    const path6 = this.purchaseHistoryPath();
    if (!await this.app.vault.adapter.exists(path6)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path6);
    return JSON.parse(content);
  }
  async putPurchaseHistory(data) {
    const path6 = this.purchaseHistoryPath();
    await this.vaultWrite(path6, JSON.stringify(data, null, 2));
  }
  // ---- 收入历史 (income-history.json) ----
  incomeHistoryPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/income-history.json`);
  }
  async getIncomeHistory() {
    const path6 = this.incomeHistoryPath();
    if (!await this.app.vault.adapter.exists(path6)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path6);
    return JSON.parse(content);
  }
  async putIncomeHistory(data) {
    const path6 = this.incomeHistoryPath();
    await this.vaultWrite(path6, JSON.stringify(data, null, 2));
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
  async importData(data) {
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
    const path6 = this.reviewPath(dateKey);
    await this.vaultWrite(path6, markdown);
  }
  async deleteMarkdownReview(dateKey) {
    const path6 = this.reviewPath(dateKey);
    if (await this.app.vault.adapter.exists(path6)) {
      await this.app.vault.adapter.remove(path6);
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
        return await this.storage.importData(message.payload.data);
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
  constructor(leaf, webappPath, plugin, settings, saveSettings) {
    super(leaf);
    this.bridgeService = null;
    this.themeBridge = null;
    this.iframe = null;
    this.iframeErrorHandler = null;
    this.keydownForwarder = null;
    this.cssChangeRef = null;
    this.webappPath = webappPath;
    this.plugin = plugin;
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
    if (!this.plugin.webappReady) {
      container.createEl("div", {
        text: "\u6B63\u5728\u521D\u59CB\u5316\u7AF9\u6797\u4FEE\u4ED9\u4F20\u2026",
        cls: "bamboo-review-loading"
      });
      const checkInterval = setInterval(() => {
        if (this.plugin.webappReady) {
          clearInterval(checkInterval);
          container.empty();
          void this.setupIframe(container);
        }
      }, 500);
      return;
    }
    await this.setupIframe(container);
  }
  async setupIframe(container) {
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
        res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { display:flex; align-items:center; justify-content:center; height:100vh; margin:0;
         font-family: system-ui, sans-serif; background:#0a0a0a; color:#888; }
  .box { text-align:center; }
  h2 { color:#ccc; font-weight:400; }
  p { font-size:14px; }
  button { margin-top:16px; padding:8px 24px; border:1px solid #444; border-radius:6px;
           background:#1a1a1a; color:#aaa; cursor:pointer; font-size:14px; }
  button:hover { background:#2a2a2a; color:#fff; }
</style></head><body>
<div class="box">
  <h2>\u7AF9\u6797\u4FEE\u4ED9\u4F20\u6B63\u5728\u521D\u59CB\u5316\u2026\u2026</h2>
  <p>\u9996\u6B21\u542F\u52A8\u9700\u8981\u4E0B\u8F7D\u8D44\u6E90\u5305\uFF0C\u8BF7\u7A0D\u5019</p>
  <button onclick="location.reload()">\u624B\u52A8\u5237\u65B0</button>
  <script>
    var retries = 0;
    function check() {
      fetch(window.location.href, { method: 'HEAD' }).then(function(r) {
        if (r.status === 200) location.reload();
        else if (++retries < 30) setTimeout(check, 2000);
      }).catch(function() { if (++retries < 30) setTimeout(check, 2000); });
    }
    setTimeout(check, 3000);
  <\/script>
</div></body></html>`);
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
var path4 = __toESM(require("path"));
var fs4 = __toESM(require("fs"));
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
    try {
      const pluginDir = this.plugin.manifest.dir;
      const vaultBasePath = this.app.vault.adapter.basePath || "";
      const candidates = [
        path4.join(vaultBasePath, pluginDir, "author-avatar.jpg"),
        // dev / BRAT / release asset
        path4.join(vaultBasePath, pluginDir, "webapp", "assets", "images", "author-avatar.jpg")
        // webapp 内置
      ];
      for (const avatarPath of candidates) {
        if (fs4.existsSync(avatarPath)) {
          const avatarData = fs4.readFileSync(avatarPath);
          const b64 = avatarData.toString("base64");
          avatar.setCssStyles({
            backgroundImage: `url(data:image/jpeg;base64,${b64})`
          });
          break;
        }
      }
    } catch {
    }
    const authorInfo = authorRow.createDiv({ cls: "bamboo-about-author-info" });
    authorInfo.createEl("p", { text: "\u7FBD\u9CDE\u541B", cls: "bamboo-about-author-name" });
    authorInfo.createEl("p", { text: "\u55B5\u5B57\u9986\u521B\u59CB\u4EBA", cls: "bamboo-about-author-role" });
    authorBox.createEl("p", { text: "Obsidian \u63D2\u4EF6\u4F5C\u54C1", cls: "bamboo-about-works-label" });
    const worksRow = authorBox.createDiv({ cls: "bamboo-about-works-row" });
    [
      { name: "\u7AF9\u53F6\u98DE\u5203", url: "https://github.com/miaoziguan/obsidian-Bamboo-Darts" },
      { name: "\u7AF9\u6797\u4FEE\u4ED9\u4F20", url: "https://github.com/miaoziguan/obsidian-bamboo-immortals" }
    ].forEach((work) => {
      const tag = worksRow.createEl("span", { text: work.name, cls: "bamboo-about-tag" });
      if (work.url) {
        tag.setCssStyles({ cursor: "pointer" });
        tag.addEventListener("click", () => {
          window.open(work.url, "_blank");
        });
      }
    });
    const contactBox = containerEl.createDiv({ cls: "bamboo-about-card" });
    contactBox.createEl("p", { text: "\u8054\u7CFB\u65B9\u5F0F", cls: "bamboo-about-label" });
    contactBox.createEl("p", { text: "\u90AE\u7BB1\uFF1Ayanyulin2100@qq.com", cls: "bamboo-about-desc" });
    contactBox.createEl("p", { text: "\u5FAE\u4FE1\uFF1Ayanhu94", cls: "bamboo-about-desc" });
  }
};

// main.ts
function extractZip(source, destDir) {
  const buf = typeof source === "string" ? fs5.readFileSync(source) : source;
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
    const outPath = path5.join(destDir, fileName);
    fs5.mkdirSync(path5.dirname(outPath), { recursive: true });
    const data = buf.subarray(pos, pos + compressedSize);
    pos += compressedSize;
    if (method === 0) {
      fs5.writeFileSync(outPath, data);
      continue;
    }
    if (method === 8) {
      try {
        const decompressed = zlib.inflateRawSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
        if (decompressed.length !== uncompressedSize) {
          fs5.writeFileSync(outPath, decompressed.subarray(0, uncompressedSize));
        } else {
          fs5.writeFileSync(outPath, decompressed);
        }
      } catch {
        fs5.writeFileSync(outPath, zlib.inflateSync(data));
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
function setupWebappInBackground(webappDir, pluginDir, vaultBasePath, currentVersion) {
  const webappVersionFile = path5.join(webappDir, ".version");
  const needsUpdate = !fs5.existsSync(webappVersionFile) || (() => {
    try {
      return fs5.readFileSync(webappVersionFile, "utf-8").trim() !== currentVersion;
    } catch {
      return true;
    }
  })();
  if (!needsUpdate) {
    this.webappReady = true;
    return;
  }
  setImmediate(async () => {
    try {
      if (fs5.existsSync(webappDir)) {
        try {
          fs5.rmSync(webappDir, { recursive: true, force: true });
        } catch {
        }
      }
      const webappZip = path5.join(vaultBasePath, pluginDir, "webapp.zip");
      fs5.mkdirSync(webappDir, { recursive: true });
      if (fs5.existsSync(webappZip)) {
        extractZip(webappZip, webappDir);
        try {
          fs5.unlinkSync(webappZip);
        } catch {
        }
        new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5DF2\u66F4\u65B0", 3e3);
      } else {
        console.log("[BambooReview] Downloading webapp from release", currentVersion);
        await downloadAndExtractWebapp(pluginDir, webappDir, currentVersion);
        new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5B89\u88C5\u5B8C\u6210", 4e3);
      }
      fs5.writeFileSync(webappVersionFile, currentVersion, "utf-8");
      this.webappReady = true;
    } catch (e) {
      console.error("[BambooReview] Webapp setup failed:", e);
    }
  });
}
var BambooReviewPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.localServer = null;
    this.serverUrl = "";
    /** webapp 资源是否就绪（可用于首屏展示 loading 状态） */
    this.webappReady = false;
  }
  async onload() {
    await this.loadSettings();
    const pluginDir = this.manifest.dir;
    if (pluginDir) {
      const vaultBasePath = this.app.vault.adapter.basePath || "";
      const webappDir = path5.join(vaultBasePath, pluginDir, "webapp");
      const webappIndexPath = path5.join(webappDir, "index.html");
      this.localServer = new LocalServer(webappDir);
      try {
        await this.localServer.start();
        this.serverUrl = this.localServer.getUrl();
        this.localServer.setVaultBasePath(vaultBasePath);
        if (fs5.existsSync(webappIndexPath)) {
          this.webappReady = true;
        }
      } catch (e) {
        console.error("[BambooReview] Failed to start local server:", e);
        new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u672C\u5730\u670D\u52A1\u542F\u52A8\u5931\u8D25\uFF0C\u90E8\u5206\u529F\u80FD\uFF08\u767D\u566A\u97F3\u3001\u4E3B\u9898\u52A8\u6548\uFF09\u53EF\u80FD\u4E0D\u53EF\u7528", 0);
      }
      setupWebappInBackground.call(this, webappDir, pluginDir, vaultBasePath, this.manifest.version);
    }
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf) => {
      return new DailyReviewView(leaf, this.serverUrl, this, this.settings, () => this.saveSettings());
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IExvY2FsU2VydmVyIH0gZnJvbSAnLi9zcmMvc2VydmVyL0xvY2FsU2VydmVyJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG4vKiogXHU3RUFGIE5vZGUuanMgWklQIFx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1Nlx1N0NGQlx1N0VERiB1bnppcC9Qb3dlclNoZWxsICovXG5mdW5jdGlvbiBleHRyYWN0WmlwKHNvdXJjZTogc3RyaW5nIHwgQnVmZmVyLCBkZXN0RGlyOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgYnVmID0gdHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgPyBmcy5yZWFkRmlsZVN5bmMoc291cmNlKSA6IHNvdXJjZTtcbiAgbGV0IHBvcyA9IDA7XG5cbiAgY29uc3QgcmVhZDE2ID0gKCkgPT4geyBjb25zdCB2ID0gYnVmLnJlYWRVSW50MTZMRShwb3MpOyBwb3MgKz0gMjsgcmV0dXJuIHY7IH07XG4gIGNvbnN0IHJlYWQzMiA9ICgpID0+IHsgY29uc3QgdiA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTsgcG9zICs9IDQ7IHJldHVybiB2OyB9O1xuICBjb25zdCBza2lwID0gKG46IG51bWJlcikgPT4geyBwb3MgKz0gbjsgfTtcblxuICAvLyBcdTYyNkJcdTYzQ0ZcdTYyNDBcdTY3MDkgbG9jYWwgZmlsZSBoZWFkZXJcdUZGMDhcdTdCN0VcdTU0MEQgMHgwNDAzNGI1MFx1RkYwOVxuICB3aGlsZSAocG9zIDwgYnVmLmxlbmd0aCAtIDQpIHtcbiAgICBjb25zdCBzaWcgPSBidWYucmVhZFVJbnQzMkxFKHBvcyk7XG4gICAgaWYgKHNpZyAhPT0gMHgwNDAzNGI1MCkgYnJlYWs7XG5cbiAgICBwb3MgKz0gNDtcbiAgICByZWFkMTYoKTsgLy8gdmVyc2lvblxuICAgIGNvbnN0IGZsYWdzID0gcmVhZDE2KCk7XG4gICAgY29uc3QgbWV0aG9kID0gcmVhZDE2KCk7XG4gICAgc2tpcCg0KTsgLy8gbW9kIHRpbWUsIG1vZCBkYXRlXG4gICAgY29uc3QgY3JjMzIgPSByZWFkMzIoKTtcbiAgICBjb25zdCBjb21wcmVzc2VkU2l6ZSA9IHJlYWQzMigpO1xuICAgIGNvbnN0IHVuY29tcHJlc3NlZFNpemUgPSByZWFkMzIoKTtcbiAgICBjb25zdCBuYW1lTGVuID0gcmVhZDE2KCk7XG4gICAgY29uc3QgZXh0cmFMZW4gPSByZWFkMTYoKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IGJ1Zi50b1N0cmluZygndXRmLTgnLCBwb3MsIHBvcyArIG5hbWVMZW4pO1xuICAgIHBvcyArPSBuYW1lTGVuICsgZXh0cmFMZW47XG5cbiAgICAvLyBcdThERjNcdThGQzdcdTc2RUVcdTVGNTVcdTY3NjFcdTc2RUVcbiAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy8nKSB8fCBmaWxlTmFtZS5lbmRzV2l0aCgnXFxcXCcpKSB7XG4gICAgICBwb3MgKz0gY29tcHJlc3NlZFNpemU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRQYXRoID0gcGF0aC5qb2luKGRlc3REaXIsIGZpbGVOYW1lKTtcbiAgICBmcy5ta2RpclN5bmMocGF0aC5kaXJuYW1lKG91dFBhdGgpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgIGNvbnN0IGRhdGEgPSBidWYuc3ViYXJyYXkocG9zLCBwb3MgKyBjb21wcmVzc2VkU2l6ZSk7XG4gICAgcG9zICs9IGNvbXByZXNzZWRTaXplO1xuXG4gICAgaWYgKG1ldGhvZCA9PT0gMCkge1xuICAgICAgLy8gXHU2NUUwXHU1MzhCXHU3RjI5XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG91dFBhdGgsIGRhdGEpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKG1ldGhvZCA9PT0gOCkge1xuICAgICAgLy8gZGVmbGF0ZVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGVjb21wcmVzc2VkID0gemxpYi5pbmZsYXRlUmF3U3luYyhkYXRhLCB7IGZpbmlzaEZsdXNoOiB6bGliLmNvbnN0YW50cy5aX1NZTkNfRkxVU0ggfSk7XG4gICAgICAgIGlmIChkZWNvbXByZXNzZWQubGVuZ3RoICE9PSB1bmNvbXByZXNzZWRTaXplKSB7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvdXRQYXRoLCBkZWNvbXByZXNzZWQuc3ViYXJyYXkoMCwgdW5jb21wcmVzc2VkU2l6ZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0UGF0aCwgZGVjb21wcmVzc2VkKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0UGF0aCwgemxpYi5pbmZsYXRlU3luYyhkYXRhKSk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZDogYCArIG1ldGhvZCArICcgKCcgKyBmaWxlTmFtZSArICcpJyk7XG4gIH1cbn1cblxuLyoqIFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEIgKi9cbmZ1bmN0aW9uIGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXI6IHN0cmluZywgZGVzdERpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscy9yZWxlYXNlcy9kb3dubG9hZC8ke3ZlcnNpb259L3dlYmFwcC56aXBgO1xuICAgIGh0dHBzLmdldCh1cmwsIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdvYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9IH0sIChyZXMpID0+IHtcbiAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAyIHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDEpIHtcbiAgICAgICAgLy8gRm9sbG93IHJlZGlyZWN0XG4gICAgICAgIGh0dHBzLmdldChyZXMuaGVhZGVycy5sb2NhdGlvbiB8fCAnJywgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnIH0gfSwgKHJlZGlyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgICAgIHJlZGlyLm9uKCdkYXRhJywgKGM6IEJ1ZmZlcikgPT4gY2h1bmtzLnB1c2goYykpO1xuICAgICAgICAgIHJlZGlyLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBleHRyYWN0WmlwKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSwgZGVzdERpcik7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVkaXIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHJlcy5zdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSFRUUCAke3Jlcy5zdGF0dXNDb2RlfTogJHt1cmx9YCkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG4gICAgICByZXMub24oJ2RhdGEnLCAoYzogQnVmZmVyKSA9PiBjaHVua3MucHVzaChjKSk7XG4gICAgICByZXMub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBleHRyYWN0WmlwKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSwgZGVzdERpcik7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfVxuICAgICAgfSk7XG4gICAgICByZXMub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICB9KTtcbn1cblxuLyoqIFx1NTQwRVx1NTNGMFx1NUYwMlx1NkI2NVx1NTIxRFx1NTlDQlx1NTMxNiB3ZWJhcHBcdUZGMENcdTRFMERcdTk2M0JcdTU4NUVcdTYzRDJcdTRFRjZcdTc2ODQgb25sb2FkIFx1OEZENFx1NTZERSAqL1xuZnVuY3Rpb24gc2V0dXBXZWJhcHBJbkJhY2tncm91bmQoXG4gIHRoaXM6IEJhbWJvb1Jldmlld1BsdWdpbixcbiAgd2ViYXBwRGlyOiBzdHJpbmcsXG4gIHBsdWdpbkRpcjogc3RyaW5nLFxuICB2YXVsdEJhc2VQYXRoOiBzdHJpbmcsXG4gIGN1cnJlbnRWZXJzaW9uOiBzdHJpbmdcbik6IHZvaWQge1xuICBjb25zdCB3ZWJhcHBWZXJzaW9uRmlsZSA9IHBhdGguam9pbih3ZWJhcHBEaXIsICcudmVyc2lvbicpO1xuICBjb25zdCBuZWVkc1VwZGF0ZSA9ICFmcy5leGlzdHNTeW5jKHdlYmFwcFZlcnNpb25GaWxlKSB8fFxuICAgICgoKSA9PiB7IHRyeSB7IHJldHVybiBmcy5yZWFkRmlsZVN5bmMod2ViYXBwVmVyc2lvbkZpbGUsICd1dGYtOCcpLnRyaW0oKSAhPT0gY3VycmVudFZlcnNpb247IH0gY2F0Y2ggeyByZXR1cm4gdHJ1ZTsgfSB9KSgpO1xuXG4gIGlmICghbmVlZHNVcGRhdGUpIHtcbiAgICB0aGlzLndlYmFwcFJlYWR5ID0gdHJ1ZTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBcdTc1Mjggc2V0SW1tZWRpYXRlIC8gc2V0VGltZW91dCBcdTYzQThcdThGREZcdTUyMzBcdTRFMEJcdTRFMDBcdTRFMkEgdGlja1x1RkYwQ1x1Nzg2RVx1NEZERCBvbmxvYWQgXHU1MTQ4XHU4RkQ0XHU1NkRFXG4gIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHdlYmFwcERpcikpIHtcbiAgICAgICAgdHJ5IHsgZnMucm1TeW5jKHdlYmFwcERpciwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pOyB9IGNhdGNoIHt9XG4gICAgICB9XG4gICAgICBjb25zdCB3ZWJhcHBaaXAgPSBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnd2ViYXBwLnppcCcpO1xuICAgICAgZnMubWtkaXJTeW5jKHdlYmFwcERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHdlYmFwcFppcCkpIHtcbiAgICAgICAgZXh0cmFjdFppcCh3ZWJhcHBaaXAsIHdlYmFwcERpcik7XG4gICAgICAgIHRyeSB7IGZzLnVubGlua1N5bmMod2ViYXBwWmlwKTsgfSBjYXRjaCB7fVxuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1OEQ0NFx1NkU5MFx1NTMwNVx1NURGMlx1NjZGNFx1NjVCMCcsIDMwMDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIERvd25sb2FkaW5nIHdlYmFwcCBmcm9tIHJlbGVhc2UnLCBjdXJyZW50VmVyc2lvbik7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXIsIHdlYmFwcERpciwgY3VycmVudFZlcnNpb24pO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1OEQ0NFx1NkU5MFx1NTMwNVx1NUI4OVx1ODhDNVx1NUI4Q1x1NjIxMCcsIDQwMDApO1xuICAgICAgfVxuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHdlYmFwcFZlcnNpb25GaWxlLCBjdXJyZW50VmVyc2lvbiwgJ3V0Zi04Jyk7XG4gICAgICB0aGlzLndlYmFwcFJlYWR5ID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBXZWJhcHAgc2V0dXAgZmFpbGVkOicsIGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgbG9jYWxTZXJ2ZXI6IExvY2FsU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VydmVyVXJsID0gJyc7XG4gIC8qKiB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHU2NjJGXHU1NDI2XHU1QzMxXHU3RUVBXHVGRjA4XHU1M0VGXHU3NTI4XHU0RThFXHU5OTk2XHU1QzRGXHU1QzU1XHU3OTNBIGxvYWRpbmcgXHU3MkI2XHU2MDAxXHVGRjA5ICovXG4gIHdlYmFwcFJlYWR5ID0gZmFsc2U7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcbiAgICBjb25zdCBwbHVnaW5EaXIgPSAodGhpcy5tYW5pZmVzdCBhcyBhbnkpLmRpcjtcbiAgICBpZiAocGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGNvbnN0IHdlYmFwcERpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAnKTtcbiAgICAgIGNvbnN0IHdlYmFwcEluZGV4UGF0aCA9IHBhdGguam9pbih3ZWJhcHBEaXIsICdpbmRleC5odG1sJyk7XG4gICAgICB0aGlzLmxvY2FsU2VydmVyID0gbmV3IExvY2FsU2VydmVyKHdlYmFwcERpcik7XG5cbiAgICAgIC8vIFx1N0FDQlx1NTM3M1x1NTQyRlx1NTJBOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOFx1NTM3M1x1NEY3RiB3ZWJhcHAgXHU4RkQ4XHU2Q0ExXHU1QzMxXHU3RUVBXHVGRjA5XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU1ODVFIG9ubG9hZFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sb2NhbFNlcnZlci5zdGFydCgpO1xuICAgICAgICB0aGlzLnNlcnZlclVybCA9IHRoaXMubG9jYWxTZXJ2ZXIuZ2V0VXJsKCk7XG4gICAgICAgIHRoaXMubG9jYWxTZXJ2ZXIuc2V0VmF1bHRCYXNlUGF0aCh2YXVsdEJhc2VQYXRoKTtcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDIHdlYmFwcCBcdTVERjJcdTVDMzFcdTdFRUFcdUZGMENcdTc2RjRcdTYzQTVcdTY4MDdcdThCQjBcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwSW5kZXhQYXRoKSkge1xuICAgICAgICAgIHRoaXMud2ViYXBwUmVhZHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEZhaWxlZCB0byBzdGFydCBsb2NhbCBzZXJ2ZXI6JywgZSk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2NzJDXHU1NzMwXHU2NzBEXHU1MkExXHU1NDJGXHU1MkE4XHU1OTMxXHU4RDI1XHVGRjBDXHU5MEU4XHU1MjA2XHU1MjlGXHU4MEZEXHVGRjA4XHU3NjdEXHU1NjZBXHU5N0YzXHUzMDAxXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4XHVGRjA5XHU1M0VGXHU4MEZEXHU0RTBEXHU1M0VGXHU3NTI4JywgMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NzI0OFx1NjcyQ1x1OERERlx1OEUyQSAmIHdlYmFwcCBcdTRFMEJcdThGN0RcdTY1M0VcdTUyMzBcdTU0MEVcdTUzRjBcdUZGMENcdTRFMERcdTk2M0JcdTU4NUUgb25sb2FkIFx1OEZENFx1NTZERVxuICAgICAgc2V0dXBXZWJhcHBJbkJhY2tncm91bmQuY2FsbCh0aGlzLCB3ZWJhcHBEaXIsIHBsdWdpbkRpciwgdmF1bHRCYXNlUGF0aCwgdGhpcy5tYW5pZmVzdC52ZXJzaW9uKTtcbiAgICB9XG5cbiAgICAvLyBcdTZDRThcdTUxOEMgVmlld1xuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsIChsZWFmOiBXb3Jrc3BhY2VMZWFmKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IERhaWx5UmV2aWV3VmlldyhsZWFmLCB0aGlzLnNlcnZlclVybCwgdGhpcywgdGhpcy5zZXR0aW5ncywgKCkgPT4gdGhpcy5zYXZlU2V0dGluZ3MoKSk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLWRhaWx5LXJldmlldycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU0RUNBXHU2NUU1XHU1OTBEXHU3NkQ4JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtcHJldi1kYXknLFxuICAgICAgbmFtZTogJ1x1NTI0RFx1NEUwMFx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjpwcmV2RGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1uZXh0LWRheScsXG4gICAgICBuYW1lOiAnXHU1NDBFXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2Om5leHREYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXRvZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU2REVcdTUyMzBcdTRFQ0FcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6dG9kYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc3RhdHMnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1N0VERlx1OEJBMVx1NTIwNlx1Njc5MCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU3RhdHMnKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc2V0dGluZ3MtaW4tYXBwJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCdhY3Rpb246b3BlblNldHRpbmdzJyksXG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBsdWdpblNldHRpbmdzKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBcdTZERkJcdTUyQTBcdTVERTZcdTRGQTcgUmliYm9uIFx1NTZGRVx1NjgwN1xuICAgIHRoaXMuYWRkUmliYm9uSWNvbignbGVhZicsICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCAoKSA9PiB7XG4gICAgICB2b2lkIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICB2b2lkIHRoaXMubG9jYWxTZXJ2ZXI/LnN0b3AoKTtcbiAgICB0aGlzLmxvY2FsU2VydmVyID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTZGQzBcdTZEM0JcdTYyMTZcdTUyMUJcdTVFRkFcdTU5MERcdTc2RDhcdTg5QzZcdTU2RkUgKi9cbiAgYXN5bmMgYWN0aXZhdGVWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblxuICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgbGVhdmVzID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcblxuICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gXHU1REYyXHU2NzA5XHU4OUM2XHU1NkZFXHVGRjBDXHU3NkY0XHU2M0E1XHU4MDVBXHU3MTI2XG4gICAgICBsZWFmID0gbGVhdmVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTY1QjBcdTg5QzZcdTU2RkVcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XG4gICAgICAgIHR5cGU6IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChsZWFmKSB7XG4gICAgICBhd2FpdCB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0ICovXG4gIHByaXZhdGUgc2VuZFRvSWZyYW1lKHR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGNvbnN0IHZpZXcgPSBsZWF2ZXNbMF0udmlldyBhcyBEYWlseVJldmlld1ZpZXc7XG4gICAgY29uc3QgaWZyYW1lID0gKHZpZXcgYXMgYW55KS5pZnJhbWUgYXMgSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChpZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIGxldCBvcmlnaW4gPSAnKic7XG4gICAgICB0cnkgeyBvcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjsgfSBjYXRjaCB7IC8qIGtlZXAgJyonICovIH1cbiAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgICB7IHR5cGUsIGlkOiAnY21kXycgKyBEYXRlLm5vdygpIH0sXG4gICAgICAgIG9yaWdpblxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSBCYW1ib29SZXZpZXdQbHVnaW4gZnJvbSAnLi4vLi4vbWFpbic7XG5pbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHsgQnJpZGdlU2VydmljZSB9IGZyb20gJy4uL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1Njc4MVx1N0I4MFx1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZSBcdTYyN0ZcdThGN0QgUFdBXG4gKiAyLiBcdTdCQTFcdTc0MDYgQnJpZGdlU2VydmljZSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcbiAqIDMuIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTVFNzZcdTU0MENcdTZCNjVcbiAqL1xuZXhwb3J0IGNsYXNzIERhaWx5UmV2aWV3VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcHJpdmF0ZSBicmlkZ2VTZXJ2aWNlOiBCcmlkZ2VTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZUVycm9ySGFuZGxlcjogKChlOiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBrZXlkb3duRm9yd2FyZGVyOiAoKGU6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3NzQ2hhbmdlUmVmOiBhbnkgPSBudWxsO1xuICBwcml2YXRlIHdlYmFwcFBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIHByaXZhdGUgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgd2ViYXBwUGF0aDogc3RyaW5nLCBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbiwgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLCBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihsZWFmKTtcbiAgICB0aGlzLndlYmFwcFBhdGggPSB3ZWJhcHBQYXRoO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgfVxuXG4gIGdldFZpZXdUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVc7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJztcbiAgfVxuXG4gIGdldEljb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2xlYWYnO1xuICB9XG5cbiAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgPSB0aGlzLmNvbnRhaW5lckVsLmNoaWxkcmVuWzFdO1xuICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgIGNvbnRhaW5lci5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1jb250YWluZXInKTtcblxuICAgIGlmICghdGhpcy53ZWJhcHBQYXRoKSB7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2NUUwXHU2Q0Q1XHU1QjlBXHU0RjREIHdlYmFwcCBcdThENDRcdTZFOTBcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTYzRDJcdTRFRjZcdTVCODlcdTg4QzVcdTc2RUVcdTVGNTUnLFxuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWVycm9yJyxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHdlYmFwcCBcdTVDMUFcdTY3MkFcdTVDMzFcdTdFRUFcdTY1RjZcdTY2M0VcdTc5M0EgbG9hZGluZyBcdTUzNjBcdTRGNERcdUZGMENcdTU0MEVcdTUzRjBcdTVGMDJcdTZCNjVcdTYyQzlcdTUzMDVcdTg5RTNcdTUzMDVcbiAgICBpZiAoIXRoaXMucGx1Z2luLndlYmFwcFJlYWR5KSB7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1NkI2M1x1NTcyOFx1NTIxRFx1NTlDQlx1NTMxNlx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1MjAyNicsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctbG9hZGluZycsXG4gICAgICB9KTtcbiAgICAgIC8vIFx1OEY2RVx1OEJFMlx1N0I0OVx1NUY4NVx1NUMzMVx1N0VFQVx1NTQwRVx1NTJBMFx1OEY3RCBpZnJhbWVcbiAgICAgIGNvbnN0IGNoZWNrSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBsdWdpbi53ZWJhcHBSZWFkeSkge1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2hlY2tJbnRlcnZhbCk7XG4gICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgICAgdm9pZCB0aGlzLnNldHVwSWZyYW1lKGNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0sIDUwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5zZXR1cElmcmFtZShjb250YWluZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZXR1cElmcmFtZShjb250YWluZXI6IEhUTUxFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU1MjFCXHU1RUZBIGlmcmFtZSAtIFx1NEUwRFx1NEY3Rlx1NzUyOCBzYW5kYm94XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU2QjYyIGFwcDovLyBcdTUzNEZcdThCQUVcdTRFMEJcdTc2ODRcdTVCNTBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcbiAgICB0aGlzLmlmcmFtZSA9IGNvbnRhaW5lci5jcmVhdGVFbCgnaWZyYW1lJywge1xuICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1mcmFtZScsXG4gICAgICBhdHRyOiB7XG4gICAgICAgIHNyYzogdGhpcy53ZWJhcHBQYXRoLFxuICAgICAgICBhbGxvdzogJ2NhbWVyYTsgbWljcm9waG9uZTsgY2xpcGJvYXJkLXJlYWQ7IGNsaXBib2FyZC13cml0ZScsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gaWZyYW1lIFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNVx1NjVGNlx1NjYzRVx1NzkzQVx1NjNEMFx1NzkzQVxuICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBpZnJhbWUgZmFpbGVkIHRvIGxvYWQ6JywgdGhpcy53ZWJhcHBQYXRoKTtcbiAgICB9O1xuICAgIHRoaXMuaWZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuXG4gICAgLy8gXHU1RjUzIGlmcmFtZSBcdTU5MDRcdTRFOEVcdTcxMjZcdTcwQjlcdTY1RjZcdUZGMENcdTVDMDYgQ3RybC9DbWQgXHU1RkVCXHU2Mzc3XHU5NTJFXHU4RjZDXHU1M0QxXHU3RUQ5IE9ic2lkaWFuXHVGRjBDXG4gICAgLy8gXHU3ODZFXHU0RkREXHU1NDdEXHU0RUU0XHU5NzYyXHU2NzdGXHVGRjA4Q3RybC9DbWQrUFx1RkYwOVx1MzAwMVx1NUZFQlx1OTAxRlx1NTIwN1x1NjM2Mlx1RkYwOEN0cmwvQ21kK09cdUZGMDlcdTdCNDlcdTUxNjhcdTVDNDBcdTVGRUJcdTYzNzdcdTk1MkVcdTRFQ0RcdTcxMzZcdTUzRUZcdTc1MjhcbiAgICBjb25zdCBvYnNpZGlhbkRvYyA9IGFjdGl2ZURvY3VtZW50O1xuICAgIHRoaXMua2V5ZG93bkZvcndhcmRlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkge1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgS2V5Ym9hcmRFdmVudCgna2V5ZG93bicsIHtcbiAgICAgICAgICBrZXk6IGUua2V5LFxuICAgICAgICAgIGNvZGU6IGUuY29kZSxcbiAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgbWV0YUtleTogZS5tZXRhS2V5LFxuICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgIGFsdEtleTogZS5hbHRLZXksXG4gICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgb2JzaWRpYW5Eb2MuYm9keS5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duRm9yd2FyZGVyLCB0cnVlKTtcblxuICAgIC8vIFx1NTIxRFx1NTlDQlx1NTMxNlx1Njg2NVx1NjNBNVx1NjcwRFx1NTJBMVxuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBhd2FpdCBzdG9yYWdlLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgY29uc3Qgc3RvcmFnZUJyaWRnZSA9IG5ldyBTdG9yYWdlQnJpZGdlKHN0b3JhZ2UsIHRoaXMuc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbmV3IFRoZW1lQnJpZGdlKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlID0gbmV3IEJyaWRnZVNlcnZpY2UoXG4gICAgICBzdG9yYWdlQnJpZGdlLFxuICAgICAgdGhpcy50aGVtZUJyaWRnZSxcbiAgICAgIHRoaXMuc2V0dGluZ3MsXG4gICAgICB0aGlzLnNhdmVTZXR0aW5nc1xuICAgICk7XG5cbiAgICAvLyBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTJEXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XG4gICAgY29uc3QgY3VzdG9tVGhlbWVzID0gdGhpcy5fc2NhbkN1c3RvbVRoZW1lcygpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRDdXN0b21UaGVtZXMoY3VzdG9tVGhlbWVzKTtcblxuICAgIC8vIFx1NEYyMFx1OTAxMlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOFx1NEY5Qlx1NzY3RFx1NTY2QVx1OTdGM1x1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjI2Qlx1NjNDRi9cdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICBpZiAodmF1bHRCYXNlUGF0aCkge1xuICAgICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldFZhdWx0QmFzZVBhdGgodmF1bHRCYXNlUGF0aCk7XG4gICAgfVxuICAgIC8vIFx1NEYyMFx1OTAxMlx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFxuICAgIGlmICh0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCkge1xuICAgICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldE5vaXNlUGF0aCh0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCk7XG4gICAgfVxuICAgIC8vIFx1NEYyMFx1OTAxMiBPYnNpZGlhbiBcdTkxNERcdTdGNkVcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhcdTY1MkZcdTYzMDFcdTc1MjhcdTYyMzdcdTgxRUFcdTVCOUFcdTRFNDkgLm9ic2lkaWFuIFx1NTQwRFx1NzlGMFx1RkYwOVxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRDb25maWdEaXIodGhpcy5hcHAudmF1bHQuY29uZmlnRGlyKTtcblxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5hdHRhY2godGhpcy5pZnJhbWUpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKHRoaXMuaWZyYW1lKTtcblxuICAgIC8vIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcbiAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5vbignY3NzLWNoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2U/Lm9uVGhlbWVDaGFuZ2VkKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1Njg2NVx1NjNBNVx1NjcwRFx1NTJBMVxuICAgIHRoaXMuYnJpZGdlU2VydmljZT8uZGV0YWNoKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzQlx1OTg5OFx1NzZEMVx1NTQyQ1xuICAgIGlmICh0aGlzLmNzc0NoYW5nZVJlZikge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9mZnJlZih0aGlzLmNzc0NoYW5nZVJlZik7XG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy50aGVtZUJyaWRnZT8uZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgaWZyYW1lIGVycm9yIFx1NzZEMVx1NTQyQ1x1NTY2OFxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcikge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG4gICAgICB0aGlzLmlmcmFtZUVycm9ySGFuZGxlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU5NTJFXHU3NkQ4XHU4RjZDXHU1M0QxXHU1NjY4XG4gICAgaWYgKHRoaXMua2V5ZG93bkZvcndhcmRlcikge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bkZvcndhcmRlciwgdHJ1ZSk7XG4gICAgICB0aGlzLmtleWRvd25Gb3J3YXJkZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWVcbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTBCXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU4REVGXHU1Rjg0XHU3NTMxXHU3NTI4XHU2MjM3XHU4QkJFXHU3RjZFXHU2MzA3XHU1QjlBXHVGRjA5ICovXG4gIHByaXZhdGUgX3NjYW5DdXN0b21UaGVtZXMoKTogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiB7XG4gICAgY29uc3QgdGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBpZiAoIXZhdWx0QmFzZVBhdGgpIHJldHVybiB0aGVtZXM7XG5cbiAgICAgIGNvbnN0IHRoZW1lRGlyTmFtZSA9IHRoaXMuc2V0dGluZ3MudGhlbWVQYXRoIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgY29uc3QgdGhlbWVzRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHRoZW1lRGlyTmFtZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhlbWVzRGlyKSB8fCAhZnMuc3RhdFN5bmModGhlbWVzRGlyKS5pc0RpcmVjdG9yeSgpKSByZXR1cm4gdGhlbWVzO1xuXG4gICAgICBjb25zdCBlbnRyaWVzOiBzdHJpbmdbXSA9IGZzLnJlYWRkaXJTeW5jKHRoZW1lc0Rpcik7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5lbmRzV2l0aCgnLmpzJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGVtZXNEaXIsIGVudHJ5KTtcbiAgICAgICAgaWYgKCFmcy5zdGF0U3luYyhmaWxlUGF0aCkuaXNGaWxlKCkpIGNvbnRpbnVlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29kZTogc3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAvLyBcdTVGRUJcdTkwMUZcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTUzMDVcdTU0MkJcdTVGQzVcdTk3MDBcdTc2ODQgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlxuICAgICAgICAgIGlmICghY29kZS5pbmNsdWRlcygnX19iYW1ib29fdGhlbWVfJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1N0YzQVx1NUMxMSBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlbWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLFxuICAgICAgICAgICAgY29kZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtCYW1ib29SZXZpZXddIFx1OEJGQlx1NTNENlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTU5MzFcdThEMjU6YCwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGVtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gXHU1M0QxXHU3M0IwICR7dGhlbWVzLmxlbmd0aH0gXHU0RTJBXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4OmAsIHRoZW1lcy5tYXAodCA9PiB0Lm5hbWUpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjVGNlx1NTFGQVx1OTUxOTonLCBlcnIubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1RkYwQ1x1NUMwNlx1OERGM1x1OEZDNzogJHtwYXRofWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsRGF5cygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XG4gICAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwYXJzZSBkYXkgZmlsZTogJHtmaWxlfWAsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF5cztcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTY1RTVcdTY3MUYga2V5XHVGRjA4XHU2MzA5XHU2NUU1XHU2NzFGXHU5NjREXHU1RThGXHVGRjBDXHU2NzAwXHU2NUIwXHU1NzI4XHU1MjREXHVGRjA5ICovXG4gIGFzeW5jIGdldERheUtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKGRhdGVLZXkpIGtleXMucHVzaChkYXRlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAga2V5cy5zb3J0KCkucmV2ZXJzZSgpOyAvLyBcdTk2NERcdTVFOEZcdUZGMUFcdTY3MDBcdTY1QjBcdTY1RTVcdTY3MUZcdTU3MjhcdTUyNERcbiAgICByZXR1cm4ga2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMDZcdTk4NzVcdTUyQTBcdThGN0RcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcbiAgICogQHBhcmFtIHBhZ2UgXHU5ODc1XHU3ODAxXHVGRjA4XHU0RUNFIDAgXHU1RjAwXHU1OUNCXHVGRjA5XG4gICAqIEBwYXJhbSBwYWdlU2l6ZSBcdTZCQ0ZcdTk4NzVcdTY1NzBcdTkxQ0ZcbiAgICogQHJldHVybnMgeyBkYXlzLCB0b3RhbCwgcGFnZSwgcGFnZVNpemUsIGhhc01vcmUgfVxuICAgKi9cbiAgYXN5bmMgZ2V0RGF5c1BhZ2luYXRlZChwYWdlID0gMCwgcGFnZVNpemUgPSAzMCk6IFByb21pc2U8e1xuICAgIGRheXM6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAga2V5czogc3RyaW5nW107XG4gICAgdG90YWw6IG51bWJlcjtcbiAgICBwYWdlOiBudW1iZXI7XG4gICAgcGFnZVNpemU6IG51bWJlcjtcbiAgICBoYXNNb3JlOiBib29sZWFuO1xuICB9PiB7XG4gICAgY29uc3QgYWxsS2V5cyA9IGF3YWl0IHRoaXMuZ2V0RGF5S2V5cygpO1xuICAgIGNvbnN0IHRvdGFsID0gYWxsS2V5cy5sZW5ndGg7XG4gICAgY29uc3Qgc3RhcnQgPSBwYWdlICogcGFnZVNpemU7XG4gICAgY29uc3QgcGFnZUtleXMgPSBhbGxLZXlzLnNsaWNlKHN0YXJ0LCBzdGFydCArIHBhZ2VTaXplKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGRhdGVLZXkgb2YgcGFnZUtleXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldERheShkYXRlS2V5KTtcbiAgICAgICAgaWYgKGRhdGEpIGRheXNbZGF0ZUtleV0gPSBkYXRhO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBsb2FkIGRheTogJHtkYXRlS2V5fWAsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBkYXlzLFxuICAgICAga2V5czogcGFnZUtleXMsXG4gICAgICB0b3RhbCxcbiAgICAgIHBhZ2UsXG4gICAgICBwYWdlU2l6ZSxcbiAgICAgIGhhc01vcmU6IHN0YXJ0ICsgcGFnZUtleXMubGVuZ3RoIDwgdG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHB1dERheShkYXlEYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0ZUtleSA9IGRheURhdGEuZGF0ZTtcbiAgICBpZiAoIWRhdGVLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF5RGF0YSBtdXN0IGhhdmUgYSBkYXRlIGZpZWxkJyk7XG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRheURhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZURheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDcgKGdvYWxzKSAtLS0tXG5cbiAgcHJpdmF0ZSBnb2Fsc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9nb2Fscy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRHb2FscygpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyB1bmtub3duO1xuICB9XG5cbiAgYXN5bmMgcHV0R29hbHMoZ29hbHM6IHVua25vd25bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShnb2FscywgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdThCQkVcdTdGNkUgKHNldHRpbmdzKSAtLS0tXG5cbiAgcHJpdmF0ZSBzZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9zZXR0aW5ncy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRTZXR0aW5nKGtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCB0aGlzLmdldEFsbFNldHRpbmdzKCk7XG4gICAgcmV0dXJuIHNldHRpbmdzW2tleV0gPz8gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHB1dFNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgodGhpcy5zZXR0aW5nc1BhdGgoKSk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgLy8gdmF1bHQucHJvY2VzcyBcdTUzOUZcdTVCNTAgcmVhZC1tb2RpZnktd3JpdGVcdUZGMENcdTY3NUNcdTdFRERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IEpTT04ucGFyc2UoZGF0YSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIHNldHRpbmdzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoeyBba2V5XTogdmFsdWUgfSwgbnVsbCwgMikpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbFNldHRpbmdzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1OEQyRFx1NEU3MFx1NTM4Nlx1NTNGMiAocHVyY2hhc2UtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBwdXJjaGFzZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcHVyY2hhc2UtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRQdXJjaGFzZUhpc3RvcnkoKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyB1bmtub3duO1xuICB9XG5cbiAgYXN5bmMgcHV0UHVyY2hhc2VIaXN0b3J5KGRhdGE6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyIChpbmNvbWUtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBpbmNvbWVIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2luY29tZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEluY29tZUhpc3RvcnkoKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dEluY29tZUhpc3RvcnkoZGF0YTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU1QkZDXHU1MUZBL1x1NUJGQ1x1NTE2NSAtLS0tXG5cbiAgYXN5bmMgZXhwb3J0QWxsRGF0YSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IFtkYXlzLCBnb2Fscywgc2V0dGluZ3MsIHB1cmNoYXNlSGlzdG9yeSwgaW5jb21lSGlzdG9yeV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmdldEFsbERheXMoKSxcbiAgICAgIHRoaXMuZ2V0R29hbHMoKSxcbiAgICAgIHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSxcbiAgICAgIHRoaXMuZ2V0UHVyY2hhc2VIaXN0b3J5KCksXG4gICAgICB0aGlzLmdldEluY29tZUhpc3RvcnkoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAnMy4wJyxcbiAgICAgIGV4cG9ydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHN0b3JhZ2VUeXBlOiAndmF1bHQnLFxuICAgICAgZGF5cyxcbiAgICAgIGdvYWxzLFxuICAgICAgc2V0dGluZ3MsXG4gICAgICBwdXJjaGFzZUhpc3RvcnksXG4gICAgICBpbmNvbWVIaXN0b3J5LFxuICAgICAgdGhlbWVzOiBbXSxcbiAgICAgIHJlcG9ydHM6IFtdLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBpbXBvcnREYXRhKGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcblxuICAgIGlmIChkYXRhLmRheXMpIHtcbiAgICAgIGZvciAoY29uc3QgZGF5IG9mIE9iamVjdC52YWx1ZXMoZGF0YS5kYXlzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dERheShkYXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGF0YS5nb2Fscykge1xuICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhkYXRhLmdvYWxzIGFzIGFueVtdKTtcbiAgICB9XG4gICAgaWYgKGRhdGEuc2V0dGluZ3MpIHtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGRhdGEuc2V0dGluZ3MpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucHV0U2V0dGluZyhrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEucHVyY2hhc2VIaXN0b3J5KSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dFB1cmNoYXNlSGlzdG9yeShkYXRhLnB1cmNoYXNlSGlzdG9yeSk7XG4gICAgfVxuICAgIGlmIChkYXRhLmluY29tZUhpc3RvcnkpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0SW5jb21lSGlzdG9yeShkYXRhLmluY29tZUhpc3RvcnkpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcih0aGlzLmJhc2VQYXRoLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgfVxuXG4gIC8vIC0tLS0gTWFya2Rvd24gXHU2NDU4XHU4OTgxIC0tLS1cblxuICBwcml2YXRlIHJldmlld1BhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9yZXZpZXdzLyR7ZGF0ZUtleX0ubWRgKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nLCBtYXJrZG93bjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBtYXJrZG93bik7XG4gIH1cblxuICBhc3luYyBkZWxldGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBNYXJrZG93blN5bmMgLSBcdTVDMDYgRGF5RGF0YSBKU09OIFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NTNFRlx1OEJGQlx1NzY4NCBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuXG5pbnRlcmZhY2UgRGF5RGF0YSB7XG4gIGRhdGU6IHN0cmluZztcbiAgd2Vla2RheTogc3RyaW5nO1xuICBtZXRyaWNzPzoge1xuICAgIGZpcnN0Q2hlY2tJbj86IHN0cmluZztcbiAgICBsYXN0Q2hlY2tJbj86IHN0cmluZztcbiAgICBjb21wbGV0ZWRUYXNrcz86IHN0cmluZztcbiAgICBpbnNwaXJhdGlvbkNvdW50Pzogc3RyaW5nO1xuICAgIGFjdGl2ZVRpbWU/OiBzdHJpbmc7XG4gICAgZW1wdHlTbG90cz86IHN0cmluZztcbiAgfTtcbiAgdGltZWxpbmU/OiBBcnJheTx7XG4gICAgcGVyaW9kOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHRpbWU6IHN0cmluZztcbiAgICBpY29uPzogc3RyaW5nO1xuICAgIGV2YWw/OiBzdHJpbmc7XG4gICAgaXRlbXM/OiBBcnJheTx7IHRpbWU6IHN0cmluZzsgdGFzazogc3RyaW5nOyBldmFsPzogc3RyaW5nIH0+O1xuICB9PjtcbiAgZ29hbHM/OiBBcnJheTx7XG4gICAgaWNvbj86IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIG1ldGE/OiBzdHJpbmc7XG4gICAgaXRlbXM/OiBBcnJheTx7IG5hbWU6IHN0cmluZzsgcGVyY2VudD86IG51bWJlcjsgZGV0YWlsPzogc3RyaW5nIH0+O1xuICB9Pjtcbn1cblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duU3luYyB7XG4gIC8qKiBcdTVDMDYgRGF5RGF0YSBcdThGNkNcdTYzNjJcdTRFM0EgTWFya2Rvd24gKi9cbiAgc3RhdGljIGdlbmVyYXRlTWFya2Rvd24oZGF0YTogRGF5RGF0YSk6IHN0cmluZyB7XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBmcm9udG1hdHRlclx1RkYwOFx1NTJBOFx1NjAwMVx1NTAzQ1x1NzUyOFx1NTNDQ1x1NUYxNVx1NTNGN1x1NTMwNVx1ODhGOVx1OTYzMlx1NkI2MiBZQU1MIFx1NkNFOFx1NTE2NVx1RkYwOVxuICAgIGxpbmVzLnB1c2goJy0tLScpO1xuICAgIGxpbmVzLnB1c2goYGRhdGU6IFwiJHtkYXRhLmRhdGV9XCJgKTtcbiAgICBsaW5lcy5wdXNoKGB3ZWVrZGF5OiBcIiR7ZGF0YS53ZWVrZGF5fVwiYCk7XG4gICAgbGluZXMucHVzaCgndHlwZTogQmFtYm9vIEltbW9ydGFscycpO1xuICAgIGxpbmVzLnB1c2goJy0tLScpO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2ODA3XHU5ODk4XG4gICAgbGluZXMucHVzaChgIyAke2RhdGEuZGF0ZX0gJHtkYXRhLndlZWtkYXl9XHU1OTBEXHU3NkQ4YCk7XG4gICAgbGluZXMucHVzaCgnJyk7XG5cbiAgICAvLyBcdTYzMDdcdTY4MDdcbiAgICBpZiAoZGF0YS5tZXRyaWNzKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTYzMDdcdTY4MDcnKTtcbiAgICAgIGNvbnN0IG0gPSBkYXRhLm1ldHJpY3M7XG4gICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmIChtLmZpcnN0Q2hlY2tJbikgcGFydHMucHVzaChgXHU5OTk2XHU2QjIxXHU2MjUzXHU1MzYxOiAke20uZmlyc3RDaGVja0lufWApO1xuICAgICAgaWYgKG0ubGFzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1NjcyQlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmxhc3RDaGVja0lufWApO1xuICAgICAgaWYgKG0uY29tcGxldGVkVGFza3MpIHBhcnRzLnB1c2goYFx1NUI4Q1x1NjIxMFx1NEVGQlx1NTJBMTogJHttLmNvbXBsZXRlZFRhc2tzfWApO1xuICAgICAgaWYgKG0uaW5zcGlyYXRpb25Db3VudCkgcGFydHMucHVzaChgXHU3MDc1XHU2MTFGOiAke20uaW5zcGlyYXRpb25Db3VudH1gKTtcbiAgICAgIGlmIChtLmFjdGl2ZVRpbWUpIHBhcnRzLnB1c2goYFx1NkQzQlx1OERDM1x1NjVGNlx1OTU3RjogJHttLmFjdGl2ZVRpbWV9YCk7XG4gICAgICBpZiAobS5lbXB0eVNsb3RzKSBwYXJ0cy5wdXNoKGBcdTdBN0FcdTc2N0RcdTY1RjZcdTZCQjU6ICR7bS5lbXB0eVNsb3RzfWApO1xuXG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGFydHMuc2xpY2UoMCwgMikuam9pbignIHwgJyl9YCk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICB9XG5cbiAgICAvLyBcdTY1RjZcdTk1RjRcdTdFQkZcbiAgICBpZiAoZGF0YS50aW1lbGluZSAmJiBkYXRhLnRpbWVsaW5lLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NjVGNlx1OTVGNFx1N0VCRicpO1xuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBkYXRhLnRpbWVsaW5lKSB7XG4gICAgICAgIGNvbnN0IGljb24gPSBibG9jay5pY29uID8gYCR7YmxvY2suaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7YmxvY2submFtZX0gKCR7YmxvY2sudGltZX0pYCk7XG4gICAgICAgIGlmIChibG9jay5pdGVtcykge1xuICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBibG9jay5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZXZhbFN0ciA9IGl0ZW0uZXZhbCA/IGAgLSAke2l0ZW0uZXZhbH1gIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS50aW1lfSAke2l0ZW0udGFza30ke2V2YWxTdHJ9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNlxuICAgIGlmIChkYXRhLmdvYWxzICYmIGRhdGEuZ29hbHMubGVuZ3RoID4gMCkge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU3NkVFXHU2ODA3XHU4RkRCXHU1RUE2Jyk7XG4gICAgICBmb3IgKGNvbnN0IGdvYWwgb2YgZGF0YS5nb2Fscykge1xuICAgICAgICBjb25zdCBpY29uID0gZ29hbC5pY29uID8gYCR7Z29hbC5pY29ufSBgIDogJyc7XG4gICAgICAgIGxpbmVzLnB1c2goYCMjIyAke2ljb259JHtnb2FsLnRpdGxlfWApO1xuICAgICAgICBpZiAoZ29hbC5pdGVtcykge1xuICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBnb2FsLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBwZXJjZW50ID0gaXRlbS5wZXJjZW50ICE9PSB1bmRlZmluZWQgPyBgICR7aXRlbS5wZXJjZW50fSVgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBkZXRhaWwgPSBpdGVtLmRldGFpbCA/IGAgKCR7aXRlbS5kZXRhaWx9KWAgOiAnJztcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtpdGVtLm5hbWV9JHtwZXJjZW50fSR7ZGV0YWlsfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBNYXJrZG93blN5bmMgfSBmcm9tICcuLi9zdG9yYWdlL01hcmtkb3duU3luYyc7XG5pbXBvcnQgdHlwZSB7IEFueUJyaWRnZU1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcy9tZXNzYWdlcyc7XG5cbi8qKlxuICogU3RvcmFnZUJyaWRnZSAtIFx1NUMwNiBzdG9yYWdlOiogXHU2RDg4XHU2MDZGXHU2NjIwXHU1QzA0XHU1MjMwIFZhdWx0U3RvcmFnZSBcdTY0Q0RcdTRGNUNcbiAqL1xuZXhwb3J0IGNsYXNzIFN0b3JhZ2VCcmlkZ2Uge1xuICBwcml2YXRlIHN0b3JhZ2U6IFZhdWx0U3RvcmFnZTtcbiAgcHJpdmF0ZSBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioc3RvcmFnZTogVmF1bHRTdG9yYWdlLCBlbmFibGVNYXJrZG93blN5bmMgPSB0cnVlKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICB0aGlzLmVuYWJsZU1hcmtkb3duU3luYyA9IGVuYWJsZU1hcmtkb3duU3luYztcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZShtZXNzYWdlOiBBbnlCcmlkZ2VNZXNzYWdlKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cmVhZERheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTp3cml0ZURheSc6IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dERheShtZXNzYWdlLnBheWxvYWQuZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgIC8vIFx1NTNDQ1x1NTE5OSBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlTWFya2Rvd25TeW5jICYmIG1lc3NhZ2UucGF5bG9hZC5kYXRhKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1kID0gTWFya2Rvd25TeW5jLmdlbmVyYXRlTWFya2Rvd24obWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLndyaXRlTWFya2Rvd25SZXZpZXcobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXksIG1kKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ01hcmtkb3duIHN5bmMgZmFpbGVkOicsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmxpc3REYXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxEYXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZGVsZXRlRGF5Jzoge1xuICAgICAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlTWFya2Rvd25SZXZpZXcobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZURheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRTZXR0aW5nKG1lc3NhZ2UucGF5bG9hZC5rZXksIG1lc3NhZ2UucGF5bG9hZC52YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbFNldHRpbmdzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEdvYWxzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEdvYWxzKG1lc3NhZ2UucGF5bG9hZC5nb2Fscyk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRQdXJjaGFzZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFB1cmNoYXNlSGlzdG9yeShtZXNzYWdlLnBheWxvYWQuZGF0YSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0SW5jb21lSGlzdG9yeSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEluY29tZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheUtleXMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheUtleXMoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlzUGFnaW5hdGVkJzpcbiAgICAgICAgY29uc3QgcGFnaW5hdGVkUGF5bG9hZCA9IG1lc3NhZ2UucGF5bG9hZCBhcyB7IHBhZ2U/OiBudW1iZXI7IHBhZ2VTaXplPzogbnVtYmVyIH07XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5c1BhZ2luYXRlZChcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2UgPz8gMCxcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2VTaXplID8/IDMwXG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpjbGVhckFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXJBbGwoKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0b3JhZ2UgbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICB9XG4gIH1cbn1cbiIsICJcbi8qKlxuICogVGhlbWVCcmlkZ2UgLSBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHVGRjBDXHU2M0E4XHU5MDAxXHU1MjMwIGlmcmFtZVxuICogICAgICAgICAgICAgICsgXHU1M0NEXHU1NDExXHVGRjFBXHU2M0E1XHU2NTM2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTUwM0NcdUZGMENcdTZDRThcdTUxNjUgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtZUJyaWRnZSB7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBleHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIHByaXZhdGUgX3BhbGV0dGVTeW5jVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogXHU1QjU4XHU1MEE4XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTk1MkVcdTU0MERcdUZGMENcdTc1MjhcdTRFOEUgcmVzdG9yZURlZmF1bHRzIFx1NkUwNVx1NzQwNiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOSkVDVEVEX1ZBUlMgPSBbXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnLFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJyxcbiAgICAgICctLXRleHQtYWNjZW50JyxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeScsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScsXG4gICAgICAnLS10ZXh0LW5vcm1hbCcsXG4gICAgICAnLS10ZXh0LW11dGVkJyxcbiAgICBdO1xuXG4gICAgLyoqIFx1OTYzMlx1NjI5Nlx1N0FERVx1NjAwMVx1NjgwN1x1OEJCMFx1RkYxQXJlc3RvcmVEZWZhdWx0cyBcdTg4QUJcdThDMDNcdTc1MjhcdTU0MEVcdThCQkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTYzQlx1NkI2Mlx1NUVGNlx1OEZERlx1NTZERVx1OEMwM1x1ODk4Nlx1NTE5OSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdXBwcmVzc2VkID0gZmFsc2U7XG5cbiAgYXR0YWNoSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGRldGFjaElmcmFtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NjYwRVx1NjY5N1x1NzJCNlx1NjAwMSAqL1xuICBpc0RhcmtNb2RlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU3MkI2XHU2MDAxICovXG4gIHB1c2hUaGVtZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG5cbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiAndGhlbWU6Y2hhbmdlZCcsXG4gICAgICAgIGlkOiAndGhlbWVfcHVzaF8nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgcGF5bG9hZDogeyBpc0Rhcms6IHRoaXMuaXNEYXJrTW9kZSgpIH0sXG4gICAgICB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTRGOUJcdTU5MTZcdTkwRThcdThDMDNcdTc1MjhcdUZGMUFPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDEgKi9cbiAgb25UaGVtZUNoYW5nZWQoKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoVGhlbWUoKTtcbiAgfVxuXG4gIC8vID09PT09IFx1NTNDQ1x1NTQxMVx1OEMwM1x1ODI3MiA9PT09PVxuXG4gIC8qKlxuICAgKiBcdThCQTFcdTdCOTcgd2ViYXBwIFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTYgXHUyMTkyIE9ic2lkaWFuIENTUyBcdTUzRDhcdTkxQ0ZcdTY2MjBcdTVDMDRcbiAgICogXHU0RUM1XHU4OTg2XHU3NkQ2IDMgXHU3QzdCXHU2ODM4XHU1RkMzXHU4MjcyXHVGRjA4XHU1RjNBXHU4QzAzL1x1ODBDQ1x1NjY2Ri9cdTY1ODdcdTVCNTdcdUZGMDlcdUZGMENcdTUxNzZcdTRGNTlcdTc1MzEgT2JzaWRpYW4gXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU2M0E4XHU3Qjk3XG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZU9ic2lkaWFuVmFycyhodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGNvbnN0IGggPSBNYXRoLnJvdW5kKGh1ZSk7XG4gICAgY29uc3QgbG8gPSBNYXRoLm1heCgtMzAsIE1hdGgubWluKDMwLCBsaWdodG5lc3NPZmZzZXQpKTtcblxuICAgIC8vIFx1NUYzQVx1OEMwM1x1ODI3MlxuICAgIGNvbnN0IGFjY2VudFMgPSA0MDtcbiAgICBjb25zdCBhY2NlbnRMID0gaXNEYXJrID8gNTAgOiA0MDtcbiAgICBjb25zdCBhY2NlbnQgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEx9JSlgO1xuICAgIGNvbnN0IGFjY2VudEhvdmVyID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMICsgNX0lKWA7XG5cbiAgICAvLyBcdTgwQ0NcdTY2NkZcdTgyNzJcbiAgICBjb25zdCBiZ1MgPSBpc0RhcmsgPyA4IDogMTI7XG4gICAgY29uc3QgYmdMID0gaXNEYXJrXG4gICAgICA/IE1hdGgubWF4KDUsIDEyICsgbG8gKiAwLjMpXG4gICAgICA6IE1hdGgubWluKDk4LCA5NCArIGxvICogMC4xNSk7XG4gICAgY29uc3QgYmdQcmltYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2JnTH0lKWA7XG4gICAgY29uc3QgYmdTZWNvbmRhcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7aXNEYXJrID8gYmdMICsgMyA6IGJnTCAtIDJ9JSlgO1xuXG4gICAgLy8gXHU2NTg3XHU1QjU3XHU4MjcyXG4gICAgY29uc3QgdGV4dE5vcm1hbCA9IGlzRGFyayA/IGBoc2woJHtofSwgNiUsIDg4JSlgIDogYGhzbCgke2h9LCA2JSwgMTIlKWA7XG4gICAgY29uc3QgdGV4dE11dGVkICA9IGlzRGFyayA/IGBoc2woJHtofSwgNCUsIDU1JSlgIDogYGhzbCgke2h9LCA0JSwgNDUlKWA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJzogYWNjZW50SG92ZXIsXG4gICAgICAnLS10ZXh0LWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeSc6IGJnUHJpbWFyeSxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JzogYmdTZWNvbmRhcnksXG4gICAgICAnLS10ZXh0LW5vcm1hbCc6IHRleHROb3JtYWwsXG4gICAgICAnLS10ZXh0LW11dGVkJzogdGV4dE11dGVkLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU4QzAzXHU4MjcyXHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKiA1MG1zIGRlYm91bmNlXHVGRjBDXHU5NjMyXHU2QjYyXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1NkVEMVx1NTc1N1x1NUZFQlx1OTAxRlx1NjJENlx1NjJGRFx1NEVBN1x1NzUxRlx1OUFEOFx1OTg5MSBET00gXHU1MTk5XHU1MTY1XG4gICAqL1xuICBhcHBseVBhbGV0dGUoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcikgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9wYWxldHRlU3luY1RpbWVyKTtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IGZhbHNlOyAvLyBcdTY1QjBcdThDMDNcdTgyNzJcdThCRjdcdTZDNDJcdTUyMzBcdTY3NjUgXHUyMTkyIFx1ODlFM1x1OTY2NFx1NjI5MVx1NTIzNlxuICAgIHRoaXMuX3BhbGV0dGVTeW5jVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQpIHJldHVybjsgLy8gcmVzdG9yZURlZmF1bHRzIFx1NTcyOFx1OTYzMlx1NjI5Nlx1N0E5N1x1NTNFM1x1NTE4NVx1ODhBQlx1OEMwM1x1NzUyOFxuICAgICAgY29uc3QgdmFycyA9IFRoZW1lQnJpZGdlLmNvbXB1dGVPYnNpZGlhblZhcnMoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2YXJzKSkge1xuICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0sIDUwKTtcbiAgfVxuXG4gIC8qKiBcdTZFMDVcdTk2NjRcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1RkYwQ1x1NjA2Mlx1NTkwRCBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTlFRDhcdThCQTRcdTUwM0MgKi9cbiAgc3RhdGljIHJlc3RvcmVEZWZhdWx0cygpOiB2b2lkIHtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgVGhlbWVCcmlkZ2UuSU5KRUNURURfVkFSUykge1xuICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi9TdG9yYWdlQnJpZGdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9UaGVtZUJyaWRnZSc7XG5pbXBvcnQgdHlwZSB7IEFueUJyaWRnZU1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcy9tZXNzYWdlcyc7XG5pbXBvcnQgeyBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqIFx1NjI2Qlx1NjNDRlx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjVGNlx1OUVEOFx1OEJBNFx1OERGM1x1OEZDN1x1NzY4NFx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOGNvbmZpZ0RpciBcdTUzRUZcdTkwMUFcdThGQzcgc2V0Q29uZmlnRGlyIFx1ODFFQVx1NUI5QVx1NEU0OVx1RkYwOSAqL1xuY29uc3QgREVGQVVMVF9TS0lQX0RJUlMgPSBbJy50cmFzaCcsICcuZ2l0JywgJ25vZGVfbW9kdWxlcyddO1xuXG4vKipcbiAqIEJyaWRnZVNlcnZpY2UgLSBwb3N0TWVzc2FnZSBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTRFMkRcdTVGQzNcbiAqXG4gKiBcdTc2RDFcdTU0MkMgaWZyYW1lIFx1NTNEMVx1Njc2NVx1NzY4NCBwb3N0TWVzc2FnZVx1RkYwQ1x1NTIwNlx1NTNEMVx1NTIzMFx1NUJGOVx1NUU5NFx1NTkwNFx1NzQwNlx1NkEyMVx1NTc1N1x1RkYwQ1xuICogXHU3MTM2XHU1NDBFXHU1QzA2XHU3RUQzXHU2NzlDXHU1NkRFXHU0RjIwXHU3RUQ5IGlmcmFtZVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQnJpZGdlU2VydmljZSB7XG4gICAgcHJpdmF0ZSBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlO1xuICAgIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICAgIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgoKSA9PiBQcm9taXNlPHZvaWQ+KSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGN1c3RvbVRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICAgIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgY29uZmlnRGlyOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIGV4cGVjdGVkT3JpZ2luID0gJyc7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc3RvcmFnZUJyaWRnZTogU3RvcmFnZUJyaWRnZSxcbiAgICAgICAgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlLFxuICAgICAgICBzZXR0aW5ncz86IEJhbWJvb1Jldmlld1NldHRpbmdzLFxuICAgICAgICBzYXZlU2V0dGluZ3M/OiAoKSA9PiBQcm9taXNlPHZvaWQ+XG4gICAgKSB7XG4gICAgICAgIHRoaXMuc3RvcmFnZUJyaWRnZSA9IHN0b3JhZ2VCcmlkZ2U7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UgPSB0aGVtZUJyaWRnZTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzIHx8IG51bGw7XG4gICAgICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzIHx8IG51bGw7XG4gICAgfVxuXG4gIC8qKiBcdTdFRDFcdTVCOUEgaWZyYW1lIFx1NUU3Nlx1NUYwMFx1NTlDQlx1NzZEMVx1NTQyQ1x1NkQ4OFx1NjA2RiAqL1xuICBhdHRhY2goaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIC8vIFx1OTYzMlx1NkI2Mlx1OTFDRFx1NTkwRFx1N0VEMVx1NUI5QVxuICAgIHRoaXMuZGV0YWNoKCk7XG5cbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZShpZnJhbWUpO1xuXG4gICAgLy8gXHU4QkIwXHU1RjU1IGV4cGVjdGVkIG9yaWdpblx1RkYwQ1x1NzUyOFx1NEU4RVx1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1NjgyMVx1OUE4Q1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICB2b2lkIHRoaXMub25NZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4XHVGRjA4XHU0RjlCXHU2M0QyXHU0RUY2XHU3QUVGXHU2MjZCXHU2M0NGXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0ICovXG4gIHNldE5vaXNlUGF0aChub2lzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubm9pc2VQYXRoID0gbm9pc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RSBPYnNpZGlhbiBcdTkxNERcdTdGNkVcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhcdTlFRDhcdThCQTQgLm9ic2lkaWFuXHVGRjBDXHU3NTI4XHU2MjM3XHU1M0VGXHU4MUVBXHU1QjlBXHU0RTQ5XHVGRjA5ICovXG4gIHNldENvbmZpZ0RpcihkaXI6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnRGlyID0gZGlyO1xuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1NjIxNlx1NTE2OFx1NUU5M1x1NjI2Qlx1NjNDRlx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIF9zY2FuVmF1bHRBdWRpb0ZpbGVzKG1heERlcHRoID0gNSk6IFByb21pc2U8QXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhbGxvd2VkRXh0cyA9IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUztcbiAgICBjb25zdCBiYXNlUGF0aCA9IHRoaXMudmF1bHRCYXNlUGF0aDtcbiAgICBpZiAoIWJhc2VQYXRoKSByZXR1cm4gcmVzdWx0cztcblxuICAgIC8vIFx1NjhDMFx1NjdFNSBiYXNlUGF0aCBcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdUZGMDhcdTVGMDJcdTZCNjVcdUZGMDlcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChiYXNlUGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTYzMDdcdTVCOUFcdTRFODZcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUzRUFcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRFMERcdTkwMTJcdTVGNTJcdUZGMDlcbiAgICBpZiAodGhpcy5ub2lzZVBhdGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldERpciA9IHBhdGguam9pbihiYXNlUGF0aCwgdGhpcy5ub2lzZVBhdGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllczogZnMuRGlyZW50W10gPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKHRhcmdldERpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICBpZiAoZW50cnkubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICAgIGlmICghZW50cnkuaXNGaWxlKCkpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0OiBmcy5TdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQocGF0aC5qb2luKHRhcmdldERpciwgZW50cnkubmFtZSkpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcGF0aC5qb2luKHRoaXMubm9pc2VQYXRoLCBlbnRyeS5uYW1lKSwgbmFtZTogZW50cnkubmFtZSwgc2l6ZTogc3RhdC5zaXplLCBleHQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gXHU2NzJBXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1MTY4XHU1RTkzXHU5MDEyXHU1RjUyXHU2MjZCXHU2M0NGXHVGRjA4XHU1RjAyXHU2QjY1ICsgXHU2REYxXHU1RUE2XHU5NjUwXHU1MjM2XHVGRjA5XG4gICAgY29uc3Qgc2NhbkRpciA9IGFzeW5jIChkaXJQYXRoOiBzdHJpbmcsIHJlbGF0aXZlUHJlZml4OiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICBsZXQgZW50cmllczogZnMuRGlyZW50W107XG4gICAgICB0cnkge1xuICAgICAgICBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXJQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICB9IGNhdGNoIHsgcmV0dXJuOyAvKiBza2lwIHVucmVhZGFibGUgZGlycyAqLyB9XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmVQcmVmaXggPyBwYXRoLmpvaW4ocmVsYXRpdmVQcmVmaXgsIGVudHJ5Lm5hbWUpIDogZW50cnkubmFtZTtcblxuICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIGNvbnN0IHNraXBEaXJzID0gbmV3IFNldChbLi4uREVGQVVMVF9TS0lQX0RJUlMsIC4uLih0aGlzLmNvbmZpZ0RpciA/IFt0aGlzLmNvbmZpZ0Rpcl0gOiBbXSldKTtcbiAgICAgICAgICBpZiAoc2tpcERpcnMuaGFzKGVudHJ5Lm5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICBhd2FpdCBzY2FuRGlyKGZ1bGxQYXRoLCByZWxhdGl2ZVBhdGgsIGRlcHRoICsgMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNGaWxlKCkpIHtcbiAgICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdDogZnMuU3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcmVsYXRpdmVQYXRoLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgc2NhbkRpcihiYXNlUGF0aCwgJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxIGlmcmFtZVx1RkYwQ1x1NTA1Q1x1NkI2Mlx1NzZEMVx1NTQyQyAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVzc2FnZUhhbmRsZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gICAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aGVtZUJyaWRnZS5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtc2cgPSBldmVudC5kYXRhIGFzIEFueUJyaWRnZU1lc3NhZ2U7XG4gICAgaWYgKCFtc2cgfHwgIW1zZy50eXBlIHx8ICFtc2cuaWQpIHJldHVybjtcblxuICAgIC8vIFx1NjgyMVx1OUE4Q1x1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1RkYxQXNvdXJjZSArIG9yaWdpbiBcdTUzQ0NcdTkxQ0RcdTlBOENcdThCQzFcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgZXZlbnQuc291cmNlICE9PSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmV4cGVjdGVkT3JpZ2luICYmIGV2ZW50Lm9yaWdpbiAhPT0gdGhpcy5leHBlY3RlZE9yaWdpbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQnJpZGdlU2VydmljZV0gSWdub3JlZCBtZXNzYWdlIGZyb20gdW5rbm93biBvcmlnaW46JywgZXZlbnQub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTUyNERcdTdGMDBcbiAgICBpZiAoIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3N0b3JhZ2U6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2FwcDonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnZmlsZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgndGhlbWU6JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcdTZEODhcdTYwNkZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgLy8gXHU2MjhBXHU2MzAxXHU0RTQ1XHU1MzE2XHU3Njg0IHNlY3Rpb25Db25maWdcdTMwMDFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTU0OENcdTgxRUFcdTVCOUFcdTRFNDlcdTk3RjNcdTZFOTBcdTk2OEYgcmVhZHkgXHU1NENEXHU1RTk0XHU1M0QxXHU3RUQ5IHdlYmFwcFxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncz8uc2VjdGlvbkNvbmZpZyB8fCBudWxsLFxuICAgICAgICBjdXN0b21UaGVtZXM6IHRoaXMuY3VzdG9tVGhlbWVzLFxuICAgICAgICBjdXN0b21Ob2lzZXM6IHRoaXMuc2V0dGluZ3M/Lm5vaXNlSXRlbXMgfHwgW10sXG4gICAgICAgIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogdGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmNsb3NlJykge1xuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkVcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZVNlY3Rpb25Db25maWcnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnNlY3Rpb25Db25maWcgPSBtc2cucGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVDdXN0b21Ob2lzZXMnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLm5vaXNlSXRlbXMgPSBtc2cucGF5bG9hZCBhcyB1bmtub3duW10gfHwgW107XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU0RTNCXHU5ODk4XHU1MjA3XHU2MzYyXHU4QkY3XHU2QzQyXHVGRjA4aWZyYW1lIFx1MjE5MiBPYnNpZGlhblx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDp0b2dnbGVUaGVtZScpIHtcbiAgICAgIGNvbnN0IHRhcmdldElzRGFyayA9IG1zZy5wYXlsb2FkLmlzRGFyayA9PT0gdHJ1ZTsgICAgICBjb25zdCBjdXJyZW50SXNEYXJrID0gYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgICAgIGlmICh0YXJnZXRJc0RhcmsgIT09IGN1cnJlbnRJc0RhcmspIHtcbiAgICAgICAgaWYgKHRhcmdldElzRGFyaykge1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWxpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU5MDFBXHU3N0U1IGlmcmFtZSBcdTRFM0JcdTk4OThcdTVERjJcdTUyMDdcdTYzNjJcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUsIGlzRGFyazogdGFyZ2V0SXNEYXJrIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1OEJGN1x1NkM0Mlx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAndGhlbWU6c3luY1BhbGV0dGUnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuKSB7XG4gICAgICAgIGNvbnN0IHsgaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayB9ID0gbXNnLnBheWxvYWQ7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UuYXBwbHlQYWxldHRlKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdUZGMUFcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjYgPT09PT1cblxuICAgIC8vIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1NjI0MFx1NjcwOVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NEY5QiB3ZWJhcHAgXHU2NTg3XHU0RUY2XHU5MDA5XHU2MkU5XHU1NjY4XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjBDXHU4QkY3XHU1QzFEXHU4QkQ1XHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU5NzYyXHU2NzdGJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKSBcdTUxODVcdTkwRThcdTVERjJcdTVGMDJcdTZCNjVcdTY4QzBcdTY3RTVcdThERUZcdTVGODRcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLl9zY2FuVmF1bHRBdWRpb0ZpbGVzKCk7XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29dIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3XHU1RTkzXHU1MTg1XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUyMDE0IFx1OEZENFx1NTZERVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTI0RFx1N0FFRlx1NzZGNFx1NjNBNSBmZXRjaCBmaWxlOi8vXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NCcpO1xuICAgICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdThERUZcdTVGODRcdTY3MkFcdTkwMDNcdTkwMzhcdTUxRkEgdmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh2YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyXHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoOiBmdWxsUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShyZWxhdGl2ZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU2NzJDXHU1NzMwXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU1NkRFXHU0RjIwXHU4REVGXHU1Rjg0XHU3NTMxXHU1MjREXHU3QUVGXHU3NTI4IGZpbGU6Ly8gXHU1MkEwXHU4RjdEXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIWZpbGVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuICAgICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTYyRDJcdTdFRERcdTUzMDVcdTU0MkJcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTVCNTdcdTdCMjZcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoLCBleHQpIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yLm1lc3NhZ2UgfHwgJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2RlxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2VCcmlkZ2UuaGFuZGxlKG1zZyk7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBwYXlsb2FkIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kRXJyb3IoaWQ6IHN0cmluZywgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgaWQsIGVycm9yIH0sICcqJyk7XG4gIH1cbn1cbiIsICIvKiogXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA4XHU1QjhDXHU2NTc0XHU1MjE3XHU4ODY4XHVGRjA5ICovXG5leHBvcnQgY29uc3QgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TID0gW1xuICAnLm1wMycsICcud2F2JywgJy5vZ2cnLCAnLmZsYWMnLCAnLmFhYycsICcubTRhJywgJy53bWEnLCAnLndlYm0nLCAnLm9wdXMnLFxuXTtcblxuLyoqIFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRCBcdTIxOTIgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbmNvbnN0IEFVRElPX01JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcubXAzJzogICdhdWRpby9tcGVnJyxcbiAgJy53YXYnOiAgJ2F1ZGlvL3dhdicsXG4gICcub2dnJzogICdhdWRpby9vZ2cnLFxuICAnLmZsYWMnOiAnYXVkaW8vZmxhYycsXG4gICcuYWFjJzogICdhdWRpby9hYWMnLFxuICAnLm00YSc6ICAnYXVkaW8vbXA0JyxcbiAgJy53bWEnOiAgJ2F1ZGlvL3gtbXMtd21hJyxcbiAgJy53ZWJtJzogJ2F1ZGlvL3dlYm0nLFxuICAnLm9wdXMnOiAnYXVkaW8vb3B1cycsXG59O1xuXG4vKiogXHU1QjhDXHU2NTc0IE1JTUUgXHU3QzdCXHU1NzhCXHU2NjIwXHU1QzA0XHVGRjA4XHU1NDJCIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBNSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLmh0bWwnOiAndGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5jc3MnOiAgJ3RleHQvY3NzOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qcyc6ICAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLm1qcyc6ICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcuanNvbic6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5wbmcnOiAgJ2ltYWdlL3BuZycsXG4gICcuanBnJzogICdpbWFnZS9qcGVnJyxcbiAgJy5qcGVnJzogJ2ltYWdlL2pwZWcnLFxuICAnLmdpZic6ICAnaW1hZ2UvZ2lmJyxcbiAgJy5zdmcnOiAgJ2ltYWdlL3N2Zyt4bWwnLFxuICAnLmljbyc6ICAnaW1hZ2UveC1pY29uJyxcbiAgJy53b2ZmJzogJ2ZvbnQvd29mZicsXG4gICcud29mZjInOidmb250L3dvZmYyJyxcbiAgJy50dGYnOiAgJ2ZvbnQvdHRmJyxcbiAgLi4uQVVESU9fTUlNRV9UWVBFUyxcbn07XG4iLCAiaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBuZXQgZnJvbSAnbmV0JztcbmltcG9ydCB7IE1JTUVfVFlQRVMsIEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5cbi8qKlxuICogTG9jYWxTZXJ2ZXIgLSBcdTY3MkNcdTU3MzAgSFRUUCBcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcdTY3MERcdTUyQTFcdTU2NjhcbiAqXG4gKiBcdTU3MjggT2JzaWRpYW4gKEVsZWN0cm9uKSBcdTczQUZcdTU4ODNcdTRFMkRcdTU0MkZcdTUyQThcdTRFMDBcdTRFMkFcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcdUZGMENcbiAqIFx1NEUzQSBpZnJhbWUgXHU2M0QwXHU0RjlCIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdTY3MERcdTUyQTFcdUZGMENcdTdFRDVcdThGQzcgYXBwOi8vIFx1NTM0Rlx1OEJBRVx1NzY4NFx1OTY1MFx1NTIzNlx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgTG9jYWxTZXJ2ZXIge1xuICBwcml2YXRlIHNlcnZlcjogaHR0cC5TZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBwb3J0ID0gMDtcbiAgcHJpdmF0ZSB3ZWJhcHBEaXI6IHN0cmluZztcbiAgcHJpdmF0ZSB2YXVsdEJhc2VQYXRoOiBzdHJpbmcgPSAnJztcblxuICBjb25zdHJ1Y3Rvcih3ZWJhcHBEaXI6IHN0cmluZykge1xuICAgIHRoaXMud2ViYXBwRGlyID0gd2ViYXBwRGlyO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NEY5QiAvYmFtYm9vLWF1ZGlvIFx1OTdGM1x1OTg5MVx1NEVFM1x1NzQwNlx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBzZXRWYXVsdEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnZhdWx0QmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIC8qKiBcdTU0MkZcdTUyQThcdTY3MERcdTUyQTFcdTU2NjhcdUZGMENcdThGRDRcdTU2REVcdTc2RDFcdTU0MkNcdTdBRUZcdTUzRTMgKi9cbiAgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIpIHJldHVybiB0aGlzLnBvcnQ7XG5cbiAgICB0aGlzLnBvcnQgPSBhd2FpdCB0aGlzLmZpbmRGcmVlUG9ydCgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZGxlUmVxdWVzdChyZXEsIHJlcyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJ2ZXIub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gU2VydmVyIGVycm9yOicsIGVycik7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFNlcnZlciBlcnJvcjogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHRoaXMucG9ydCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtCYW1ib29SZXZpZXddIExvY2FsIHNlcnZlciBzdGFydGVkIG9uIHBvcnQgJHt0aGlzLnBvcnR9YCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5wb3J0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1NTA1Q1x1NkI2Mlx1NjcwRFx1NTJBMVx1NTY2OCAqL1xuICBhc3luYyBzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW0JhbWJvb1Jldmlld10gTG9jYWwgc2VydmVyIHN0b3BwZWQnKTtcbiAgICAgICAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5wb3J0ID0gMDtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjcwRFx1NTJBMVx1NTY2OCBVUkwgKi9cbiAgZ2V0VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5wb3J0fWA7XG4gIH1cblxuICAvKiogXHU1OTA0XHU3NDA2IEhUVFAgXHU4QkY3XHU2QzQyICovXG4gIHByaXZhdGUgaGFuZGxlUmVxdWVzdChyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICAvLyAvYmFtYm9vLWF1ZGlvP3BhdGg9eHh4IFx1MjAxNCBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTRFRTNcdTc0MDZcdUZGMENcdTdFRDVcdThGQzcgcG9zdE1lc3NhZ2UgXHU1OTI3IHBheWxvYWQgXHU5NjUwXHU1MjM2XG4gICAgY29uc3QgdXJsID0gcmVxLnVybCB8fCAnLyc7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvYmFtYm9vLWF1ZGlvJykpIHtcbiAgICAgIHRoaXMuaGFuZGxlQXVkaW9Qcm94eShyZXEsIHJlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4OUUzXHU2NzkwIFVSTFx1RkYwQ1x1NTNCQlx1OTY2NFx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFxuICAgIGxldCB1cmxQYXRoID0gdXJsLnNwbGl0KCc/JylbMF07XG4gICAgLy8gXHU3NkVFXHU1RjU1XHU5RUQ4XHU4QkE0XHU2NTg3XHU0RUY2XG4gICAgaWYgKHVybFBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgICAgdXJsUGF0aCArPSAnaW5kZXguaHRtbCc7XG4gICAgfVxuICAgIGNvbnN0IHNhZmVQYXRoID0gcGF0aC5ub3JtYWxpemUodXJsUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy53ZWJhcHBEaXIsIHNhZmVQYXRoKTtcblxuICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NTcyOCB3ZWJhcHBEaXIgXHU1MTg1XG4gICAgaWYgKCFmaWxlUGF0aC5zdGFydHNXaXRoKHRoaXMud2ViYXBwRGlyKSkge1xuICAgICAgcmVzLndyaXRlSGVhZCg0MDMpO1xuICAgICAgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgZnMuc3RhdChmaWxlUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgIGlmIChlcnIgfHwgIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTtcbiAgICAgICAgcmVzLmVuZChgPCFET0NUWVBFIGh0bWw+XG48aHRtbD48aGVhZD48bWV0YSBjaGFyc2V0PVwidXRmLThcIj48c3R5bGU+XG4gIGJvZHkgeyBkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgaGVpZ2h0OjEwMHZoOyBtYXJnaW46MDtcbiAgICAgICAgIGZvbnQtZmFtaWx5OiBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7IGJhY2tncm91bmQ6IzBhMGEwYTsgY29sb3I6Izg4ODsgfVxuICAuYm94IHsgdGV4dC1hbGlnbjpjZW50ZXI7IH1cbiAgaDIgeyBjb2xvcjojY2NjOyBmb250LXdlaWdodDo0MDA7IH1cbiAgcCB7IGZvbnQtc2l6ZToxNHB4OyB9XG4gIGJ1dHRvbiB7IG1hcmdpbi10b3A6MTZweDsgcGFkZGluZzo4cHggMjRweDsgYm9yZGVyOjFweCBzb2xpZCAjNDQ0OyBib3JkZXItcmFkaXVzOjZweDtcbiAgICAgICAgICAgYmFja2dyb3VuZDojMWExYTFhOyBjb2xvcjojYWFhOyBjdXJzb3I6cG9pbnRlcjsgZm9udC1zaXplOjE0cHg7IH1cbiAgYnV0dG9uOmhvdmVyIHsgYmFja2dyb3VuZDojMmEyYTJhOyBjb2xvcjojZmZmOyB9XG48L3N0eWxlPjwvaGVhZD48Ym9keT5cbjxkaXYgY2xhc3M9XCJib3hcIj5cbiAgPGgyPlx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1NkI2M1x1NTcyOFx1NTIxRFx1NTlDQlx1NTMxNlx1MjAyNlx1MjAyNjwvaDI+XG4gIDxwPlx1OTk5Nlx1NkIyMVx1NTQyRlx1NTJBOFx1OTcwMFx1ODk4MVx1NEUwQlx1OEY3RFx1OEQ0NFx1NkU5MFx1NTMwNVx1RkYwQ1x1OEJGN1x1N0EwRFx1NTAxOTwvcD5cbiAgPGJ1dHRvbiBvbmNsaWNrPVwibG9jYXRpb24ucmVsb2FkKClcIj5cdTYyNEJcdTUyQThcdTUyMzdcdTY1QjA8L2J1dHRvbj5cbiAgPHNjcmlwdD5cbiAgICB2YXIgcmV0cmllcyA9IDA7XG4gICAgZnVuY3Rpb24gY2hlY2soKSB7XG4gICAgICBmZXRjaCh3aW5kb3cubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6ICdIRUFEJyB9KS50aGVuKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgaWYgKHIuc3RhdHVzID09PSAyMDApIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBlbHNlIGlmICgrK3JldHJpZXMgPCAzMCkgc2V0VGltZW91dChjaGVjaywgMjAwMCk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbigpIHsgaWYgKCsrcmV0cmllcyA8IDMwKSBzZXRUaW1lb3V0KGNoZWNrLCAyMDAwKTsgfSk7XG4gICAgfVxuICAgIHNldFRpbWVvdXQoY2hlY2ssIDMwMDApO1xuICA8L3NjcmlwdD5cbjwvZGl2PjwvYm9keT48L2h0bWw+YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4QkJFXHU3RjZFIE1JTUUgXHU3QzdCXHU1NzhCXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcblxuICAgICAgLy8gXHU4QkJFXHU3RjZFXHU1NENEXHU1RTk0XHU1OTM0XHVGRjA4XHU0RTBEXHU5NzAwXHU4OTgxIENPUlNcdUZGMENpZnJhbWUgXHU0RTBFXHU2NzBEXHU1MkExXHU1NjY4XHU1NDBDXHU2RTkwXHVGRjA5XG4gICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogY29udGVudFR5cGUsXG4gICAgICAgICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTZENDFcdTVGMEZcdTRGMjBcdThGOTNcdTY1ODdcdTRFRjZcbiAgICAgIGNvbnN0IHN0cmVhbTogZnMuUmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZVBhdGgpO1xuICAgICAgc3RyZWFtLnBpcGUocmVzKTtcbiAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiAvYmFtYm9vLWF1ZGlvP3BhdGg9eHh4IFx1MjAxNCBcdTZENDFcdTVGMEZcdTRFRTNcdTc0MDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjYgKi9cbiAgcHJpdmF0ZSBoYW5kbGVBdWRpb1Byb3h5KHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByYXdVcmwgPSByZXEudXJsIHx8ICcnO1xuICAgICAgY29uc3QgcXVlcnlJbmRleCA9IHJhd1VybC5pbmRleE9mKCc/Jyk7XG4gICAgICBpZiAocXVlcnlJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHBhdGggcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHF1ZXJ5U3RyID0gcmF3VXJsLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKTtcbiAgICAgIGNvbnN0IHBhcmFtczogVVJMU2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhxdWVyeVN0cik7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwYXJhbXMuZ2V0KCdwYXRoJyk7XG4gICAgICBpZiAoIXJlbGF0aXZlUGF0aCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgcGF0aCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTUzRUFcdTUxNDFcdThCQjhcdTYzMDdcdTVCOUFcdTYyNjlcdTVDNTVcdTU0MERcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuOiB1bnN1cHBvcnRlZCBhdWRpbyBmb3JtYXQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU3OTgxXHU2QjYyXHU4REVGXHU1Rjg0XHU3QTdGXHU4RDhBXG4gICAgICBjb25zdCBub3JtYWxpemVkID0gcGF0aC5ub3JtYWxpemUocmVsYXRpdmVQYXRoKS5yZXBsYWNlKC9eKFxcLlxcLlsvXFxcXF0pKy8sICcnKTtcbiAgICAgIGlmICghbm9ybWFsaXplZCB8fCBub3JtYWxpemVkLnN0YXJ0c1dpdGgoJy4uJykgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnZhdWx0QmFzZVBhdGgpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApOyByZXMuZW5kKCdWYXVsdCBiYXNlIHBhdGggbm90IGNvbmZpZ3VyZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih0aGlzLnZhdWx0QmFzZVBhdGgsIG5vcm1hbGl6ZWQpO1xuICAgICAgaWYgKCFmdWxsUGF0aC5zdGFydHNXaXRoKHRoaXMudmF1bHRCYXNlUGF0aCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmcy5zdGF0KGZ1bGxQYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgICBpZiAoZXJyIHx8ICFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTsgcmVzLmVuZCgnRmlsZSBub3QgZm91bmQnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSBNSU1FX1RZUEVTW2V4dF0gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IHN0YXRzLnNpemUsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICdwdWJsaWMsIG1heC1hZ2U9MzYwMCcsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzdHJlYW06IGZzLlJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZ1bGxQYXRoKTtcbiAgICAgICAgc3RyZWFtLnBpcGUocmVzKTtcbiAgICAgICAgc3RyZWFtLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICAgICAgcmVzLmVuZCgnU3RyZWFtIGVycm9yJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBBdWRpbyBwcm94eSBlcnJvcjonLCBlKTtcbiAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjdFNVx1NjI3RVx1NTNFRlx1NzUyOFx1N0FFRlx1NTNFMyAqL1xuICBwcml2YXRlIGZpbmRGcmVlUG9ydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzZXJ2ZXIgPSBuZXQuY3JlYXRlU2VydmVyKCk7XG4gICAgICBzZXJ2ZXIubGlzdGVuKDAsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcnQgPSAoc2VydmVyLmFkZHJlc3MoKSBhcyBuZXQuQWRkcmVzc0luZm8pLnBvcnQ7XG4gICAgICAgIHNlcnZlci5jbG9zZSgoKSA9PiByZXNvbHZlKHBvcnQpKTtcbiAgICAgIH0pO1xuICAgICAgc2VydmVyLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn0iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcblxuLyoqIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyAqL1xuZXhwb3J0IGludGVyZmFjZSBCYW1ib29SZXZpZXdTZXR0aW5ncyB7XG4gIC8qKiBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdTY4MzlcdThERUZcdTVGODQgKi9cbiAgZGF0YVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEgKi9cbiAgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuICAvKiogXHU2NzdGXHU1NzU3XHU3QkExXHU3NDA2XHU5MTREXHU3RjZFXHVGRjA4XHU1M0VGXHU4OUMxXHU2MDI3ICsgXHU2MzkyXHU1RThGXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFIHdlYmFwcCBpZnJhbWUgbG9jYWxTdG9yYWdlIFx1NEUwRFx1NTNFRlx1OTc2MFx1NjVGNlx1NjMwMVx1NEU0NVx1NTMxNiAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDkgKi9cbiAgdGhlbWVQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTNcdUZGMDkgKi9cbiAgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTUyMTdcdTg4NjhcdUZGMDhcdTkwMUFcdThGQzdcdTY4NjVcdTYzQTVcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMENcdTUxNEJcdTY3MEQgbG9jYWxTdG9yYWdlIHBvcnQtc2NvcGVkIFx1OTVFRVx1OTg5OFx1RkYwOSAqL1xuICBub2lzZUl0ZW1zOiB1bmtub3duW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVDMDYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjIgKi9cbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSB7XG4gIGRhdGFQYXRoOiAnYmFtYm9vLXJldmlldycsXG4gIGVuYWJsZU1hcmtkb3duU3luYzogdHJ1ZSxcbiAgc2VjdGlvbkNvbmZpZzogbnVsbCxcbiAgdGhlbWVQYXRoOiAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JyxcbiAgbm9pc2VQYXRoOiAnJyxcbiAgbm9pc2VJdGVtczogW10sXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogZmFsc2UsXG59O1xuXG4vKipcbiAqIFBsdWdpblNldHRpbmdzIC0gT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gKi9cbmV4cG9ydCBjbGFzcyBQbHVnaW5TZXR0aW5ncyBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1zZXR0aW5ncycpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vID09PSBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU1NzI4IFZhdWx0IFx1NEUyRFx1NzY4NFx1NUI1OFx1NTBBOFx1NzZFRVx1NUY1NVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignYmFtYm9vLXJldmlldycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoID0gdmFsdWUgfHwgJ2JhbWJvby1yZXZpZXcnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBNYXJrZG93biBcdTY0NThcdTg5ODFcdTU0MENcdTZCNjVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxJylcbiAgICAgIC5zZXREZXNjKCdcdTZCQ0ZcdTZCMjFcdTRGRERcdTVCNThcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTU3MjggcmV2aWV3cy8gXHU3NkVFXHU1RjU1XHU0RTBCXHU3NTFGXHU2MjEwXHU1M0VGXHU4QkZCXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjYnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NUI1OFx1NjUzRVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoID0gdmFsdWUgfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTc2N0RcdTU2NkFcdTk3RjMgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGMycpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOScpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU2MzA3XHU1QjlBXHU1NDBFXHU0RUM1XHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHU1MTg1XHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHUzMDAyXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU2NTc0XHU0RTJBXHU1RTkzXHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTc2N0RcdTU2NkFcdTk3RjMgXHU2MjE2XHU3NTU5XHU3QTdBXHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1QzA2XHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMEN3ZWJhcHAgXHU1MTg1XHU2MEFDXHU2RDZFXHU4M0RDXHU1MzU1XHU3Njg0XHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1OEMwM1x1ODI3Mlx1NEYxQVx1NUI5RVx1NjVGNlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTc2ODRcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdTkxNERcdTgyNzInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKGZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBlbmFibGVkOiB2YWx1ZSB9XG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTUxNzNcdTRFOEVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU1MTczXHU0RThFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAxXHVGRjFBXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBsdWdpbkJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdCYW1ib28gSW1tb3J0YWxzXHVGRjA4XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHVGRjA5XHU2NjJGXHU0RTAwXHU2QjNFXHU1N0ZBXHU0RThFXHU4MkNGXHU4MDU0XHU2M0E3XHU1MjM2XHU4QkJBXHU0RTRCXHU3MjM2XHU3RUY0XHU1MTRCXHU2MjU4XHUwMEI3XHU2ODNDXHU1MzYyXHU0RUMwXHU3OUQxXHU1OTJCXHU2M0QwXHU1MUZBXHU3Njg0XCJPR0FTXCJcdTc0MDZcdTVGRjVcdUZGMENcdTRFMTNcdTRFM0FcdTRFMkFcdTRFQkFcdTYyNTNcdTkwMjBcdTc2ODRcdTRFMkRcdTU2RkRcdTk4Q0VcdTc2RUVcdTY4MDdcdTgxRUFcdTUyQThcdTUzMTZcdTUyMDZcdTkxNERcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnXG4gICAgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQgYmFtYm9vLWFib3V0LWF1dGhvcicgfSk7XG4gICAgY29uc3QgYXV0aG9yUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm93JyB9KTtcbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF2YXRhcicgfSk7XG4gICAgLy8gXHU0RUNFXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHU4QkZCXHU1M0Q2XHU1OTM0XHU1MENGXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDdGXHU1MTREXHU4RkM3XHU5NTdGXHU3Njg0IGJhc2U2NCBcdTg4QUIgT2JzaWRpYW4gXHU2MjJBXHU2NUFEXHU1QkZDXHU4MUY0XHU3QTdBXHU3NjdEXHVGRjA5XG4gICAgLy8gXHU0RjE4XHU1MTQ4XHU4QkZCXHU2M0QyXHU0RUY2XHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4ZGV2L0JSQVRcdUZGMDlcdUZGMENcdTUxNzZcdTZCMjFcdTRFQ0Ugd2ViYXBwIFx1OEQ0NFx1NkU5MFx1NEUyRFx1OEJGQlx1NTNENlx1RkYwOFx1NjNEMlx1NEVGNlx1NUUwMlx1NTczQVx1NUI4OVx1ODhDNVx1RkYwOVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwbHVnaW5EaXIgPSAodGhpcy5wbHVnaW4ubWFuaWZlc3QgYXMgYW55KS5kaXI7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBbXG4gICAgICAgIHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICdhdXRob3ItYXZhdGFyLmpwZycpLCAgICAgICAgICAgICAgIC8vIGRldiAvIEJSQVQgLyByZWxlYXNlIGFzc2V0XG4gICAgICAgIHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAnLCAnYXNzZXRzJywgJ2ltYWdlcycsICdhdXRob3ItYXZhdGFyLmpwZycpLCAvLyB3ZWJhcHAgXHU1MTg1XHU3RjZFXG4gICAgICBdO1xuICAgICAgZm9yIChjb25zdCBhdmF0YXJQYXRoIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYXZhdGFyUGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBhdmF0YXJEYXRhID0gZnMucmVhZEZpbGVTeW5jKGF2YXRhclBhdGgpO1xuICAgICAgICAgIGNvbnN0IGI2NCA9IGF2YXRhckRhdGEudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICAgIGF2YXRhci5zZXRDc3NTdHlsZXMoe1xuICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBgdXJsKGRhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiNjR9KWAsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHsgLyogc2lsZW50bHkgc2tpcCBcdTIwMTQgc2hvdyBkZWZhdWx0IGVtcHR5IGF2YXRhciAqLyB9XG5cblxuICAgIGNvbnN0IGF1dGhvckluZm8gPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1pbmZvJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU3RkJEXHU5Q0RFXHU1NDFCJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1uYW1lJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1NUI1XHU1QjU3XHU5OTg2XHU1MjFCXHU1OUNCXHU0RUJBJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb2xlJyB9KTtcblxuICAgIC8vIFx1NEY1Q1x1NTRDMVx1NTMzQVxuICAgIGF1dGhvckJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ09ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NEY1Q1x1NTRDMScsIGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1sYWJlbCcgfSk7XG4gICAgY29uc3Qgd29ya3NSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLXJvdycgfSk7XG5cbiAgICBbeyBuYW1lOiAnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tQmFtYm9vLURhcnRzJyB9LFxuICAgICB7IG5hbWU6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9XS5mb3JFYWNoKHdvcmsgPT4ge1xuICAgICAgY29uc3QgdGFnID0gd29ya3NSb3cuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IHdvcmsubmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgICBpZiAod29yay51cmwpIHtcbiAgICAgICAgdGFnLnNldENzc1N0eWxlcyh7IGN1cnNvcjogJ3BvaW50ZXInIH0pO1xuICAgICAgICB0YWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgd2luZG93Lm9wZW4od29yay51cmwsICdfYmxhbmsnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEZcbiAgICBjb25zdCBjb250YWN0Qm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEYnLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTkwQUVcdTdCQjFcdUZGMUF5YW55dWxpbjIxMDBAcXEuY29tJywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTVGQUVcdTRGRTFcdUZGMUF5YW5odTk0JywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxtQkFBc0M7QUFDdEMsSUFBQUMsUUFBc0I7QUFDdEIsSUFBQUMsTUFBb0I7QUFDcEIsV0FBc0I7QUFDdEIsWUFBdUI7OztBQ0p2QixJQUFBQyxtQkFBd0M7QUFDeEMsSUFBQUMsUUFBc0I7QUFDdEIsSUFBQUMsTUFBb0I7OztBQ0ZwQixzQkFBMEM7QUFjbkMsSUFBTSxlQUFOLE1BQW1CO0FBQUEsRUFJeEIsWUFBWSxLQUFVLFdBQVcsaUJBQWlCO0FBQ2hELFNBQUssTUFBTTtBQUNYLFNBQUssZUFBVywrQkFBYyxRQUFRO0FBQUEsRUFDeEM7QUFBQTtBQUFBLEVBR0EsTUFBYyxVQUFVLEtBQTRCO0FBQ2xELFVBQU1DLFlBQU8sK0JBQWMsR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDcEQsUUFBSSxDQUFFLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPQSxLQUFJLEdBQUk7QUFDaEQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU1BLEtBQUk7QUFBQSxJQUN6QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxrQkFBaUM7QUFDckMsUUFBSSxDQUFFLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLEtBQUssUUFBUSxHQUFJO0FBQ3pELFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxNQUFNLEtBQUssUUFBUTtBQUFBLElBQ2xEO0FBQ0EsVUFBTSxLQUFLLFVBQVUsTUFBTTtBQUMz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QUVyQixhQUFPLE9BQU8sQ0FBQztBQUFBLElBQ2pCLE9BQU87QUFFTCxhQUFPLFVBQVUsUUFBUSxLQUFLO0FBQzlCLFlBQU0sS0FBSyxhQUFhO0FBQUEsUUFDdEIsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUFBLElBQ0g7QUFFQSxRQUFJLE1BQU07QUFDUixZQUFNLFVBQVUsV0FBVyxJQUFJO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdRLGFBQWEsTUFBb0I7QUFDdkMsVUFBTSxTQUFTLEtBQUssSUFBSSxVQUFVLGdCQUFnQixzQkFBc0I7QUFDeEUsUUFBSSxPQUFPLFdBQVcsRUFBRztBQUV6QixVQUFNLE9BQU8sT0FBTyxDQUFDLEVBQUU7QUFDdkIsVUFBTSxTQUFVLEtBQWE7QUFDN0IsUUFBSSxRQUFRLGVBQWU7QUFDekIsVUFBSSxTQUFTO0FBQ2IsVUFBSTtBQUFFLGlCQUFTLElBQUksSUFBSSxPQUFPLEdBQUcsRUFBRTtBQUFBLE1BQVEsUUFBUTtBQUFBLE1BQWlCO0FBQ3BFLGFBQU8sY0FBYztBQUFBLFFBQ25CLEVBQUUsTUFBTSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFBQSxRQUNoQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFNBQUssV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixNQUFNLEtBQUssU0FBUyxDQUFDO0FBQUEsRUFDM0U7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAicGF0aCIsICJmcyIsICJpbXBvcnRfb2JzaWRpYW4iLCAicGF0aCIsICJmcyIsICJwYXRoIiwgInN0YXQiLCAiZnMiLCAicGF0aCIsICJpbXBvcnRfb2JzaWRpYW4iLCAicGF0aCIsICJmcyIsICJjaHVua3MiXQp9Cg==
