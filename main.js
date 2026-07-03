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
var SKIP_DIRS = /* @__PURE__ */ new Set([".obsidian", ".trash", ".git", "node_modules"]);
var BridgeService = class {
  constructor(storageBridge, themeBridge, settings, saveSettings) {
    this.settings = null;
    this.saveSettings = null;
    this.iframe = null;
    this.messageHandler = null;
    this.customThemes = [];
    this.vaultBasePath = "";
    this.noisePath = "";
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
      this.onMessage(event);
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
          if (SKIP_DIRS.has(entry.name)) continue;
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
      const currentIsDark = document.body.classList.contains("theme-dark");
      if (targetIsDark !== currentIsDark) {
        if (targetIsDark) {
          document.body.classList.remove("theme-light");
          document.body.classList.add("theme-dark");
        } else {
          document.body.classList.remove("theme-dark");
          document.body.classList.add("theme-light");
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
        reject(err);
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
    const safePath = path3.normalize(urlPath).replace(/^(\.\.[\/\\])+/, "");
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
      const normalized = path3.normalize(relativePath).replace(/^(\.\.[\/\\])+/, "");
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
    const pluginTitle = pluginBox.createEl("p", { text: "\u63D2\u4EF6\u7B80\u4ECB", cls: "bamboo-about-label" });
    const descEl = pluginBox.createEl("p", {
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
    const authorEl = authorInfo.createEl("p", { text: "\u7FBD\u9CDE\u541B", cls: "bamboo-about-author-name" });
    const roleEl = authorInfo.createEl("p", { text: "\u55B5\u5B57\u9986\u521B\u59CB\u4EBA", cls: "bamboo-about-author-role" });
    const worksTitle = authorBox.createEl("p", { text: "Obsidian \u63D2\u4EF6\u4F5C\u54C1", cls: "bamboo-about-works-label" });
    const worksRow = authorBox.createDiv({ cls: "bamboo-about-works-row" });
    ["\u7AF9\u53F6\u98DE\u5203", "\u7AF9\u6797\u4FEE\u4ED9\u4F20"].forEach((name) => {
      const tag = worksRow.createEl("span", { text: name, cls: "bamboo-about-tag" });
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
      this.activateView();
    });
  }
  onunload() {
    this.localServer?.stop();
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
      workspace.revealLeaf(leaf);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBEYWlseVJldmlld1ZpZXcsIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgfSBmcm9tICcuL3NyYy92aWV3cy9EYWlseVJldmlld1ZpZXcnO1xuaW1wb3J0IHsgTG9jYWxTZXJ2ZXIgfSBmcm9tICcuL3NyYy9zZXJ2ZXIvTG9jYWxTZXJ2ZXInO1xuaW1wb3J0IHtcbiAgUGx1Z2luU2V0dGluZ3MsXG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG59IGZyb20gJy4vc3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqXG4gKiBCYW1ib29SZXZpZXdQbHVnaW4gLSBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTZDRThcdTUxOEMgVmlldyBcdTdDN0JcdTU3OEJcbiAqIDIuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1RkYwOFx1NjI1M1x1NUYwMFx1NTkwRFx1NzZEOFx1MzAwMVx1NTI0RC9cdTU0MEVcdTRFMDBcdTU5MjlcdTMwMDFcdTdFREZcdThCQTFcdTk3NjJcdTY3N0ZcdUZGMDlcbiAqIDMuIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICogNC4gXHU3QkExXHU3NDA2XHU2M0QyXHU0RUY2XHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgbG9jYWxTZXJ2ZXI6IExvY2FsU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VydmVyVXJsID0gJyc7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcbiAgICBjb25zdCBwbHVnaW5EaXIgPSAodGhpcy5tYW5pZmVzdCBhcyBhbnkpLmRpcjtcbiAgICBpZiAocGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGNvbnN0IHdlYmFwcERpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAnKTtcbiAgICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBuZXcgTG9jYWxTZXJ2ZXIod2ViYXBwRGlyKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jYWxTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSB0aGlzLmxvY2FsU2VydmVyLmdldFVybCgpO1xuICAgICAgICAvLyBcdTYyOEFcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdTRGMjBcdTdFRDkgTG9jYWxTZXJ2ZXJcdUZGMENcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcbiAgICAgICAgdGhpcy5sb2NhbFNlcnZlci5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBGYWlsZWQgdG8gc3RhcnQgbG9jYWwgc2VydmVyOicsIGUpO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjcyQ1x1NTczMFx1NjcwRFx1NTJBMVx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTBFOFx1NTIwNlx1NTI5Rlx1ODBGRFx1RkYwOFx1NzY3RFx1NTY2QVx1OTdGM1x1MzAwMVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1RkYwOVx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1NzUyOCcsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0RBSUxZX1JFVklFVywgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGFpbHlSZXZpZXdWaWV3KGxlYWYsIHRoaXMuc2VydmVyVXJsLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnByZXZEYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6bmV4dERheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtdG9kYXknLFxuICAgICAgbmFtZTogJ1x1NTZERVx1NTIzMFx1NEVDQVx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjp0b2RheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TdGF0cycpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU2V0dGluZ3MnKSxcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLmxvY2FsU2VydmVyPy5zdG9wKCk7XG4gICAgdGhpcy5sb2NhbFNlcnZlciA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RkMwXHU2RDNCXHU2MjE2XHU1MjFCXHU1RUZBXHU1OTBEXHU3NkQ4XHU4OUM2XHU1NkZFICovXG4gIGFzeW5jIGFjdGl2YXRlVmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG5cbiAgICBsZXQgbGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG5cbiAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFx1NURGMlx1NjcwOVx1ODlDNlx1NTZGRVx1RkYwQ1x1NzZGNFx1NjNBNVx1ODA1QVx1NzEyNlxuICAgICAgbGVhZiA9IGxlYXZlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NUIwXHU4OUM2XHU1NkZFXG4gICAgICBsZWFmID0gd29ya3NwYWNlLmdldExlYWYoZmFsc2UpO1xuICAgICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoe1xuICAgICAgICB0eXBlOiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobGVhZikge1xuICAgICAgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU1QkZDXHU4MjJBL1x1NjRDRFx1NEY1Q1x1NjMwN1x1NEVFNCAqL1xuICBwcml2YXRlIHNlbmRUb0lmcmFtZSh0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgIGlmIChsZWF2ZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCB2aWV3ID0gbGVhdmVzWzBdLnZpZXcgYXMgRGFpbHlSZXZpZXdWaWV3O1xuICAgIGNvbnN0IGlmcmFtZSA9ICh2aWV3IGFzIGFueSkuaWZyYW1lIGFzIEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAoaWZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICBsZXQgb3JpZ2luID0gJyonO1xuICAgICAgdHJ5IHsgb3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47IH0gY2F0Y2ggeyAvKiBrZWVwICcqJyAqLyB9XG4gICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgICAgeyB0eXBlLCBpZDogJ2NtZF8nICsgRGF0ZS5ub3coKSB9LFxuICAgICAgICBvcmlnaW5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICAvKiogXHU0RkREXHU1QjU4XHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgSXRlbVZpZXcsIFdvcmtzcGFjZUxlYWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9TdG9yYWdlQnJpZGdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7IEJyaWRnZVNlcnZpY2UgfSBmcm9tICcuLi9icmlkZ2UvQnJpZGdlU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX0RBSUxZX1JFVklFVyA9ICdiYW1ib28taW1tb3J0YWxzJztcblxuLyoqXG4gKiBEYWlseVJldmlld1ZpZXcgLSBcdTRFM0JcdTg5QzZcdTU2RkVcbiAqXG4gKiBcdTgwNENcdThEMjNcdTY3ODFcdTdCODBcdUZGMUFcbiAqIDEuIFx1NTIxQlx1NUVGQSBpZnJhbWUgXHU2MjdGXHU4RjdEIFBXQVxuICogMi4gXHU3QkExXHU3NDA2IEJyaWRnZVNlcnZpY2UgXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKiAzLiBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU1RTc2XHU1NDBDXHU2QjY1XG4gKi9cbmV4cG9ydCBjbGFzcyBEYWlseVJldmlld1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgYnJpZGdlU2VydmljZTogQnJpZGdlU2VydmljZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWVFcnJvckhhbmRsZXI6ICgoZTogRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3NzQ2hhbmdlUmVmOiBhbnkgPSBudWxsO1xuICBwcml2YXRlIHdlYmFwcFBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHdlYmFwcFBhdGg6IHN0cmluZywgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLCBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihsZWFmKTtcbiAgICB0aGlzLndlYmFwcFBhdGggPSB3ZWJhcHBQYXRoO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgfVxuXG4gIGdldFZpZXdUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVc7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJztcbiAgfVxuXG4gIGdldEljb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2xlYWYnO1xuICB9XG5cbiAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LWNvbnRhaW5lcicpO1xuXG4gICAgaWYgKCF0aGlzLndlYmFwcFBhdGgpIHtcbiAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY1RTBcdTZDRDVcdTVCOUFcdTRGNEQgd2ViYXBwIFx1OEQ0NFx1NkU5MFx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNVx1NjNEMlx1NEVGNlx1NUI4OVx1ODhDNVx1NzZFRVx1NUY1NScsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1MjFCXHU1RUZBIGlmcmFtZSAtIFx1NEUwRFx1NEY3Rlx1NzUyOCBzYW5kYm94XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU2QjYyIGFwcDovLyBcdTUzNEZcdThCQUVcdTRFMEJcdTc2ODRcdTVCNTBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcbiAgICB0aGlzLmlmcmFtZSA9IGNvbnRhaW5lci5jcmVhdGVFbCgnaWZyYW1lJywge1xuICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1mcmFtZScsXG4gICAgICBhdHRyOiB7XG4gICAgICAgIHNyYzogdGhpcy53ZWJhcHBQYXRoLFxuICAgICAgICBhbGxvdzogJ2NhbWVyYTsgbWljcm9waG9uZTsgY2xpcGJvYXJkLXJlYWQ7IGNsaXBib2FyZC13cml0ZScsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gaWZyYW1lIFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNVx1NjVGNlx1NjYzRVx1NzkzQVx1NjNEMFx1NzkzQVxuICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBpZnJhbWUgZmFpbGVkIHRvIGxvYWQ6JywgdGhpcy53ZWJhcHBQYXRoKTtcbiAgICB9O1xuICAgIHRoaXMuaWZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuXG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2XHU2ODY1XHU2M0E1XHU2NzBEXHU1MkExXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGF3YWl0IHN0b3JhZ2UuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBjb25zdCBzdG9yYWdlQnJpZGdlID0gbmV3IFN0b3JhZ2VCcmlkZ2Uoc3RvcmFnZSwgdGhpcy5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBuZXcgVGhlbWVCcmlkZ2UoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UgPSBuZXcgQnJpZGdlU2VydmljZShcbiAgICAgIHN0b3JhZ2VCcmlkZ2UsXG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzXG4gICAgKTtcblxuICAgIC8vIFx1NjI2Qlx1NjNDRiBWYXVsdCBcdTRFMkRcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcbiAgICBjb25zdCBjdXN0b21UaGVtZXMgPSB0aGlzLl9zY2FuQ3VzdG9tVGhlbWVzKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldEN1c3RvbVRoZW1lcyhjdXN0b21UaGVtZXMpO1xuXG4gICAgLy8gXHU0RjIwXHU5MDEyXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjA4XHU0RjlCXHU3NjdEXHU1NjZBXHU5N0YzXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2MjZCXHU2M0NGL1x1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIHx8ICcnO1xuICAgIGlmICh2YXVsdEJhc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0VmF1bHRCYXNlUGF0aCh2YXVsdEJhc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Tm9pc2VQYXRoKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKTtcbiAgICB9XG5cbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UuYXR0YWNoKHRoaXMuaWZyYW1lKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZSh0aGlzLmlmcmFtZSk7XG5cbiAgICAvLyBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XG4gICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSB0aGlzLmFwcC53b3Jrc3BhY2Uub24oJ2Nzcy1jaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlPy5vblRoZW1lQ2hhbmdlZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgb25DbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2U/LmRldGFjaCgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFM0JcdTk4OThcdTc2RDFcdTU0MkNcbiAgICBpZiAodGhpcy5jc3NDaGFuZ2VSZWYpIHtcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vZmZyZWYodGhpcy5jc3NDaGFuZ2VSZWYpO1xuICAgICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMudGhlbWVCcmlkZ2U/LmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGlmcmFtZSBlcnJvciBcdTc2RDFcdTU0MkNcdTU2NjhcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuICAgICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWVcbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTBCXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU4REVGXHU1Rjg0XHU3NTMxXHU3NTI4XHU2MjM3XHU4QkJFXHU3RjZFXHU2MzA3XHU1QjlBXHVGRjA5ICovXG4gIHByaXZhdGUgX3NjYW5DdXN0b21UaGVtZXMoKTogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiB7XG4gICAgY29uc3QgdGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBpZiAoIXZhdWx0QmFzZVBhdGgpIHJldHVybiB0aGVtZXM7XG5cbiAgICAgIGNvbnN0IHRoZW1lRGlyTmFtZSA9IHRoaXMuc2V0dGluZ3MudGhlbWVQYXRoIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgY29uc3QgdGhlbWVzRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHRoZW1lRGlyTmFtZSk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhlbWVzRGlyKSB8fCAhZnMuc3RhdFN5bmModGhlbWVzRGlyKS5pc0RpcmVjdG9yeSgpKSByZXR1cm4gdGhlbWVzO1xuXG4gICAgICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmModGhlbWVzRGlyKTtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoIWVudHJ5LmVuZHNXaXRoKCcuanMnKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoZW1lc0RpciwgZW50cnkpO1xuICAgICAgICBpZiAoIWZzLnN0YXRTeW5jKGZpbGVQYXRoKS5pc0ZpbGUoKSkgY29udGludWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb2RlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAvLyBcdTVGRUJcdTkwMUZcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTUzMDVcdTU0MkJcdTVGQzVcdTk3MDBcdTc2ODQgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlxuICAgICAgICAgIGlmICghY29kZS5pbmNsdWRlcygnX19iYW1ib29fdGhlbWVfJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1N0YzQVx1NUMxMSBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlbWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLFxuICAgICAgICAgICAgY29kZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtCYW1ib29SZXZpZXddIFx1OEJGQlx1NTNENlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTU5MzFcdThEMjU6YCwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGVtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gXHU1M0QxXHU3M0IwICR7dGhlbWVzLmxlbmd0aH0gXHU0RTJBXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4OmAsIHRoZW1lcy5tYXAodCA9PiB0Lm5hbWUpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjVGNlx1NTFGQVx1OTUxOTonLCBlcnIubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxhbnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHVGRjBDXHU1QzA2XHU4REYzXHU4RkM3OiAke3BhdGh9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxEYXlzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5maWxlcykge1xuICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmIChkYXRlS2V5KSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XG4gICAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwYXJzZSBkYXkgZmlsZTogJHtmaWxlfWAsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF5cztcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTY1RTVcdTY3MUYga2V5XHVGRjA4XHU2MzA5XHU2NUU1XHU2NzFGXHU5NjREXHU1RThGXHVGRjBDXHU2NzAwXHU2NUIwXHU1NzI4XHU1MjREXHVGRjA5ICovXG4gIGFzeW5jIGdldERheUtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKGRhdGVLZXkpIGtleXMucHVzaChkYXRlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAga2V5cy5zb3J0KCkucmV2ZXJzZSgpOyAvLyBcdTk2NERcdTVFOEZcdUZGMUFcdTY3MDBcdTY1QjBcdTY1RTVcdTY3MUZcdTU3MjhcdTUyNERcbiAgICByZXR1cm4ga2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMDZcdTk4NzVcdTUyQTBcdThGN0RcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcbiAgICogQHBhcmFtIHBhZ2UgXHU5ODc1XHU3ODAxXHVGRjA4XHU0RUNFIDAgXHU1RjAwXHU1OUNCXHVGRjA5XG4gICAqIEBwYXJhbSBwYWdlU2l6ZSBcdTZCQ0ZcdTk4NzVcdTY1NzBcdTkxQ0ZcbiAgICogQHJldHVybnMgeyBkYXlzLCB0b3RhbCwgcGFnZSwgcGFnZVNpemUsIGhhc01vcmUgfVxuICAgKi9cbiAgYXN5bmMgZ2V0RGF5c1BhZ2luYXRlZChwYWdlID0gMCwgcGFnZVNpemUgPSAzMCk6IFByb21pc2U8e1xuICAgIGRheXM6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAga2V5czogc3RyaW5nW107XG4gICAgdG90YWw6IG51bWJlcjtcbiAgICBwYWdlOiBudW1iZXI7XG4gICAgcGFnZVNpemU6IG51bWJlcjtcbiAgICBoYXNNb3JlOiBib29sZWFuO1xuICB9PiB7XG4gICAgY29uc3QgYWxsS2V5cyA9IGF3YWl0IHRoaXMuZ2V0RGF5S2V5cygpO1xuICAgIGNvbnN0IHRvdGFsID0gYWxsS2V5cy5sZW5ndGg7XG4gICAgY29uc3Qgc3RhcnQgPSBwYWdlICogcGFnZVNpemU7XG4gICAgY29uc3QgcGFnZUtleXMgPSBhbGxLZXlzLnNsaWNlKHN0YXJ0LCBzdGFydCArIHBhZ2VTaXplKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGRhdGVLZXkgb2YgcGFnZUtleXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldERheShkYXRlS2V5KTtcbiAgICAgICAgaWYgKGRhdGEpIGRheXNbZGF0ZUtleV0gPSBkYXRhO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBsb2FkIGRheTogJHtkYXRlS2V5fWAsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBkYXlzLFxuICAgICAga2V5czogcGFnZUtleXMsXG4gICAgICB0b3RhbCxcbiAgICAgIHBhZ2UsXG4gICAgICBwYWdlU2l6ZSxcbiAgICAgIGhhc01vcmU6IHN0YXJ0ICsgcGFnZUtleXMubGVuZ3RoIDwgdG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHB1dERheShkYXlEYXRhOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICB9XG5cbiAgYXN5bmMgcHV0R29hbHMoZ29hbHM6IGFueVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGdvYWxzLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1OEJCRVx1N0Y2RSAoc2V0dGluZ3MpIC0tLS1cblxuICBwcml2YXRlIHNldHRpbmdzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3NldHRpbmdzLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFNldHRpbmcoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueSB8IG51bGw+IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IHRoaXMuZ2V0QWxsU2V0dGluZ3MoKTtcbiAgICByZXR1cm4gc2V0dGluZ3Nba2V5XSA/PyBudWxsO1xuICB9XG5cbiAgYXN5bmMgcHV0U2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIHNldHRpbmdzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoeyBba2V5XTogdmFsdWUgfSwgbnVsbCwgMikpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbFNldHRpbmdzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU4RDJEXHU0RTcwXHU1Mzg2XHU1M0YyIChwdXJjaGFzZS1oaXN0b3J5Lmpzb24pIC0tLS1cblxuICBwcml2YXRlIHB1cmNoYXNlSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9wdXJjaGFzZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFB1cmNoYXNlSGlzdG9yeSgpOiBQcm9taXNlPGFueSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgfVxuXG4gIGFzeW5jIHB1dFB1cmNoYXNlSGlzdG9yeShkYXRhOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyIChpbmNvbWUtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBpbmNvbWVIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2luY29tZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEluY29tZUhpc3RvcnkoKTogUHJvbWlzZTxhbnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICB9XG5cbiAgYXN5bmMgcHV0SW5jb21lSGlzdG9yeShkYXRhOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NUJGQ1x1NTFGQS9cdTVCRkNcdTUxNjUgLS0tLVxuXG4gIGFzeW5jIGV4cG9ydEFsbERhdGEoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiBhbnksIG9wdGlvbnM/OiB7IHN0cmF0ZWd5PzogJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgaWYgKGRhdGEuZGF5cykge1xuICAgICAgZm9yIChjb25zdCBkYXkgb2YgT2JqZWN0LnZhbHVlcyhkYXRhLmRheXMpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucHV0RGF5KGRheSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhLmdvYWxzKSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKGRhdGEuZ29hbHMgYXMgYW55W10pO1xuICAgIH1cbiAgICBpZiAoZGF0YS5zZXR0aW5ncykge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZGF0YS5zZXR0aW5ncykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXRTZXR0aW5nKGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGF0YS5wdXJjaGFzZUhpc3RvcnkpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0UHVyY2hhc2VIaXN0b3J5KGRhdGEucHVyY2hhc2VIaXN0b3J5KTtcbiAgICB9XG4gICAgaWYgKGRhdGEuaW5jb21lSGlzdG9yeSkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRJbmNvbWVIaXN0b3J5KGRhdGEuaW5jb21lSGlzdG9yeSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2xlYXJBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKHRoaXMuYmFzZVBhdGgsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICB9XG5cbiAgLy8gLS0tLSBNYXJrZG93biBcdTY0NThcdTg5ODEgLS0tLVxuXG4gIHByaXZhdGUgcmV2aWV3UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3Jldmlld3MvJHtkYXRlS2V5fS5tZGApO1xuICB9XG5cbiAgYXN5bmMgd3JpdGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcsIG1hcmtkb3duOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIG1hcmtkb3duKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIE1hcmtkb3duU3luYyAtIFx1NUMwNiBEYXlEYXRhIEpTT04gXHU4RjZDXHU2MzYyXHU0RTNBXHU1M0VGXHU4QkZCXHU3Njg0IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5cbmludGVyZmFjZSBEYXlEYXRhIHtcbiAgZGF0ZTogc3RyaW5nO1xuICB3ZWVrZGF5OiBzdHJpbmc7XG4gIG1ldHJpY3M/OiB7XG4gICAgZmlyc3RDaGVja0luPzogc3RyaW5nO1xuICAgIGxhc3RDaGVja0luPzogc3RyaW5nO1xuICAgIGNvbXBsZXRlZFRhc2tzPzogc3RyaW5nO1xuICAgIGluc3BpcmF0aW9uQ291bnQ/OiBzdHJpbmc7XG4gICAgYWN0aXZlVGltZT86IHN0cmluZztcbiAgICBlbXB0eVNsb3RzPzogc3RyaW5nO1xuICB9O1xuICB0aW1lbGluZT86IEFycmF5PHtcbiAgICBwZXJpb2Q6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdGltZTogc3RyaW5nO1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgZXZhbD86IHN0cmluZztcbiAgICBpdGVtcz86IEFycmF5PHsgdGltZTogc3RyaW5nOyB0YXNrOiBzdHJpbmc7IGV2YWw/OiBzdHJpbmcgfT47XG4gIH0+O1xuICBnb2Fscz86IEFycmF5PHtcbiAgICBpY29uPzogc3RyaW5nO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgbWV0YT86IHN0cmluZztcbiAgICBpdGVtcz86IEFycmF5PHsgbmFtZTogc3RyaW5nOyBwZXJjZW50PzogbnVtYmVyOyBkZXRhaWw/OiBzdHJpbmcgfT47XG4gIH0+O1xufVxuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25TeW5jIHtcbiAgLyoqIFx1NUMwNiBEYXlEYXRhIFx1OEY2Q1x1NjM2Mlx1NEUzQSBNYXJrZG93biAqL1xuICBzdGF0aWMgZ2VuZXJhdGVNYXJrZG93bihkYXRhOiBEYXlEYXRhKTogc3RyaW5nIHtcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIGZyb250bWF0dGVyXHVGRjA4XHU1MkE4XHU2MDAxXHU1MDNDXHU3NTI4XHU1M0NDXHU1RjE1XHU1M0Y3XHU1MzA1XHU4OEY5XHU5NjMyXHU2QjYyIFlBTUwgXHU2Q0U4XHU1MTY1XHVGRjA5XG4gICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgbGluZXMucHVzaChgZGF0ZTogXCIke2RhdGEuZGF0ZX1cImApO1xuICAgIGxpbmVzLnB1c2goYHdlZWtkYXk6IFwiJHtkYXRhLndlZWtkYXl9XCJgKTtcbiAgICBsaW5lcy5wdXNoKCd0eXBlOiBCYW1ib28gSW1tb3J0YWxzJyk7XG4gICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgbGluZXMucHVzaCgnJyk7XG5cbiAgICAvLyBcdTY4MDdcdTk4OThcbiAgICBsaW5lcy5wdXNoKGAjICR7ZGF0YS5kYXRlfSAke2RhdGEud2Vla2RheX1cdTU5MERcdTc2RDhgKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjMwN1x1NjgwN1xuICAgIGlmIChkYXRhLm1ldHJpY3MpIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NjMwN1x1NjgwNycpO1xuICAgICAgY29uc3QgbSA9IGRhdGEubWV0cmljcztcbiAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgaWYgKG0uZmlyc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTk5OTZcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5maXJzdENoZWNrSW59YCk7XG4gICAgICBpZiAobS5sYXN0Q2hlY2tJbikgcGFydHMucHVzaChgXHU2NzJCXHU2QjIxXHU2MjUzXHU1MzYxOiAke20ubGFzdENoZWNrSW59YCk7XG4gICAgICBpZiAobS5jb21wbGV0ZWRUYXNrcykgcGFydHMucHVzaChgXHU1QjhDXHU2MjEwXHU0RUZCXHU1MkExOiAke20uY29tcGxldGVkVGFza3N9YCk7XG4gICAgICBpZiAobS5pbnNwaXJhdGlvbkNvdW50KSBwYXJ0cy5wdXNoKGBcdTcwNzVcdTYxMUY6ICR7bS5pbnNwaXJhdGlvbkNvdW50fWApO1xuICAgICAgaWYgKG0uYWN0aXZlVGltZSkgcGFydHMucHVzaChgXHU2RDNCXHU4REMzXHU2NUY2XHU5NTdGOiAke20uYWN0aXZlVGltZX1gKTtcbiAgICAgIGlmIChtLmVtcHR5U2xvdHMpIHBhcnRzLnB1c2goYFx1N0E3QVx1NzY3RFx1NjVGNlx1NkJCNTogJHttLmVtcHR5U2xvdHN9YCk7XG5cbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgwLCAyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGFydHMuc2xpY2UoMikuam9pbignIHwgJyl9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgIH1cblxuICAgIC8vIFx1NjVGNlx1OTVGNFx1N0VCRlxuICAgIGlmIChkYXRhLnRpbWVsaW5lICYmIGRhdGEudGltZWxpbmUubGVuZ3RoID4gMCkge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2NUY2XHU5NUY0XHU3RUJGJyk7XG4gICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGRhdGEudGltZWxpbmUpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGJsb2NrLmljb24gPyBgJHtibG9jay5pY29ufSBgIDogJyc7XG4gICAgICAgIGxpbmVzLnB1c2goYCMjIyAke2ljb259JHtibG9jay5uYW1lfSAoJHtibG9jay50aW1lfSlgKTtcbiAgICAgICAgaWYgKGJsb2NrLml0ZW1zKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGJsb2NrLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBldmFsU3RyID0gaXRlbS5ldmFsID8gYCAtICR7aXRlbS5ldmFsfWAgOiAnJztcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtpdGVtLnRpbWV9ICR7aXRlbS50YXNrfSR7ZXZhbFN0cn1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHU3NkVFXHU2ODA3XHU4RkRCXHU1RUE2XG4gICAgaWYgKGRhdGEuZ29hbHMgJiYgZGF0YS5nb2Fscy5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTYnKTtcbiAgICAgIGZvciAoY29uc3QgZ29hbCBvZiBkYXRhLmdvYWxzKSB7XG4gICAgICAgIGNvbnN0IGljb24gPSBnb2FsLmljb24gPyBgJHtnb2FsLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2dvYWwudGl0bGV9YCk7XG4gICAgICAgIGlmIChnb2FsLml0ZW1zKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnQgPSBpdGVtLnBlcmNlbnQgIT09IHVuZGVmaW5lZCA/IGAgJHtpdGVtLnBlcmNlbnR9JWAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IGRldGFpbCA9IGl0ZW0uZGV0YWlsID8gYCAoJHtpdGVtLmRldGFpbH0pYCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0ubmFtZX0ke3BlcmNlbnR9JHtkZXRhaWx9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IE1hcmtkb3duU3luYyB9IGZyb20gJy4uL3N0b3JhZ2UvTWFya2Rvd25TeW5jJztcbmltcG9ydCB0eXBlIHsgQW55QnJpZGdlTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzL21lc3NhZ2VzJztcblxuLyoqXG4gKiBTdG9yYWdlQnJpZGdlIC0gXHU1QzA2IHN0b3JhZ2U6KiBcdTZEODhcdTYwNkZcdTY2MjBcdTVDMDRcdTUyMzAgVmF1bHRTdG9yYWdlIFx1NjRDRFx1NEY1Q1xuICovXG5leHBvcnQgY2xhc3MgU3RvcmFnZUJyaWRnZSB7XG4gIHByaXZhdGUgc3RvcmFnZTogVmF1bHRTdG9yYWdlO1xuICBwcml2YXRlIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdG9yYWdlOiBWYXVsdFN0b3JhZ2UsIGVuYWJsZU1hcmtkb3duU3luYyA9IHRydWUpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgIHRoaXMuZW5hYmxlTWFya2Rvd25TeW5jID0gZW5hYmxlTWFya2Rvd25TeW5jO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlKG1lc3NhZ2U6IEFueUJyaWRnZU1lc3NhZ2UpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnc3RvcmFnZTpyZWFkRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOndyaXRlRGF5Jzoge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0RGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIGFueSk7XG4gICAgICAgIC8vIFx1NTNDQ1x1NTE5OSBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlTWFya2Rvd25TeW5jICYmIG1lc3NhZ2UucGF5bG9hZC5kYXRhKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1kID0gTWFya2Rvd25TeW5jLmdlbmVyYXRlTWFya2Rvd24obWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgYW55KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS53cml0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5LCBtZCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXJrZG93biBzeW5jIGZhaWxlZDonLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVEYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5LCBtZXNzYWdlLnBheWxvYWQudmFsdWUpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRHb2FscyhtZXNzYWdlLnBheWxvYWQuZ29hbHMpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRQdXJjaGFzZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRJbmNvbWVIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5c1BhZ2luYXRlZChcbiAgICAgICAgICAobWVzc2FnZSBhcyBhbnkpLnBheWxvYWQ/LnBhZ2UgPz8gMCxcbiAgICAgICAgICAobWVzc2FnZSBhcyBhbnkpLnBheWxvYWQ/LnBhZ2VTaXplID8/IDMwXG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKG1lc3NhZ2UucGF5bG9hZC5kYXRhLCBtZXNzYWdlLnBheWxvYWQub3B0aW9ucyk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Y2xlYXJBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyQWxsKCk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdG9yYWdlIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgfVxuICB9XG59XG4iLCAiXG4vKipcbiAqIFRoZW1lQnJpZGdlIC0gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1RkYwQ1x1NjNBOFx1OTAwMVx1NTIzMCBpZnJhbWVcbiAqICAgICAgICAgICAgICArIFx1NTNDRFx1NTQxMVx1RkYxQVx1NjNBNVx1NjUzNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1MDNDXHVGRjBDXHU2Q0U4XHU1MTY1IE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICovXG5leHBvcnQgY2xhc3MgVGhlbWVCcmlkZ2Uge1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICBwcml2YXRlIF9wYWxldHRlU3luY1RpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xuXG4gICAgLyoqIFx1NUI1OFx1NTBBOFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHU5NTJFXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFIHJlc3RvcmVEZWZhdWx0cyBcdTZFMDVcdTc0MDYgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTkpFQ1RFRF9WQVJTID0gW1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JyxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlcicsXG4gICAgICAnLS10ZXh0LWFjY2VudCcsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknLFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknLFxuICAgICAgJy0tdGV4dC1ub3JtYWwnLFxuICAgICAgJy0tdGV4dC1tdXRlZCcsXG4gICAgXTtcblxuICAgIC8qKiBcdTk2MzJcdTYyOTZcdTdBREVcdTYwMDFcdTY4MDdcdThCQjBcdUZGMUFyZXN0b3JlRGVmYXVsdHMgXHU4OEFCXHU4QzAzXHU3NTI4XHU1NDBFXHU4QkJFXHU0RTNBIHRydWVcdUZGMENcdTk2M0JcdTZCNjJcdTVFRjZcdThGREZcdTU2REVcdThDMDNcdTg5ODZcdTUxOTkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3VwcHJlc3NlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gIGF0dGFjaElmcmFtZShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICB9XG4gIH1cblxuICBkZXRhY2hJZnJhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTY2MEVcdTY2OTdcdTcyQjZcdTYwMDEgKi9cbiAgaXNEYXJrTW9kZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NzJCNlx1NjAwMSAqL1xuICBwdXNoVGhlbWUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICBpZDogJ3RoZW1lX3B1c2hfJyArIERhdGUubm93KCksXG4gICAgICAgIHBheWxvYWQ6IHsgaXNEYXJrOiB0aGlzLmlzRGFya01vZGUoKSB9LFxuICAgICAgfSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKiogXHU0RjlCXHU1OTE2XHU5MEU4XHU4QzAzXHU3NTI4XHVGRjFBT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU2NUY2XHU4OUU2XHU1M0QxICovXG4gIG9uVGhlbWVDaGFuZ2VkKCk6IHZvaWQge1xuICAgIHRoaXMucHVzaFRoZW1lKCk7XG4gIH1cblxuICAvLyA9PT09PSBcdTUzQ0NcdTU0MTFcdThDMDNcdTgyNzIgPT09PT1cblxuICAvKipcbiAgICogXHU4QkExXHU3Qjk3IHdlYmFwcCBcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2IFx1MjE5MiBPYnNpZGlhbiBDU1MgXHU1M0Q4XHU5MUNGXHU2NjIwXHU1QzA0XG4gICAqIFx1NEVDNVx1ODk4Nlx1NzZENiAzIFx1N0M3Qlx1NjgzOFx1NUZDM1x1ODI3Mlx1RkYwOFx1NUYzQVx1OEMwMy9cdTgwQ0NcdTY2NkYvXHU2NTg3XHU1QjU3XHVGRjA5XHVGRjBDXHU1MTc2XHU0RjU5XHU3NTMxIE9ic2lkaWFuIFx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NjNBOFx1N0I5N1xuICAgKi9cbiAgc3RhdGljIGNvbXB1dGVPYnNpZGlhblZhcnMoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBoID0gTWF0aC5yb3VuZChodWUpO1xuICAgIGNvbnN0IGxvID0gTWF0aC5tYXgoLTMwLCBNYXRoLm1pbigzMCwgbGlnaHRuZXNzT2Zmc2V0KSk7XG5cbiAgICAvLyBcdTVGM0FcdThDMDNcdTgyNzJcbiAgICBjb25zdCBhY2NlbnRTID0gNDA7XG4gICAgY29uc3QgYWNjZW50TCA9IGlzRGFyayA/IDUwIDogNDA7XG4gICAgY29uc3QgYWNjZW50ID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMfSUpYDtcbiAgICBjb25zdCBhY2NlbnRIb3ZlciA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TCArIDV9JSlgO1xuXG4gICAgLy8gXHU4MENDXHU2NjZGXHU4MjcyXG4gICAgY29uc3QgYmdTID0gaXNEYXJrID8gOCA6IDEyO1xuICAgIGNvbnN0IGJnTCA9IGlzRGFya1xuICAgICAgPyBNYXRoLm1heCg1LCAxMiArIGxvICogMC4zKVxuICAgICAgOiBNYXRoLm1pbig5OCwgOTQgKyBsbyAqIDAuMTUpO1xuICAgIGNvbnN0IGJnUHJpbWFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtiZ0x9JSlgO1xuICAgIGNvbnN0IGJnU2Vjb25kYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2lzRGFyayA/IGJnTCArIDMgOiBiZ0wgLSAyfSUpYDtcblxuICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3MlxuICAgIGNvbnN0IHRleHROb3JtYWwgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDYlLCA4OCUpYCA6IGBoc2woJHtofSwgNiUsIDEyJSlgO1xuICAgIGNvbnN0IHRleHRNdXRlZCAgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDQlLCA1NSUpYCA6IGBoc2woJHtofSwgNCUsIDQ1JSlgO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3Zlcic6IGFjY2VudEhvdmVyLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknOiBiZ1ByaW1hcnksXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSc6IGJnU2Vjb25kYXJ5LFxuICAgICAgJy0tdGV4dC1ub3JtYWwnOiB0ZXh0Tm9ybWFsLFxuICAgICAgJy0tdGV4dC1tdXRlZCc6IHRleHRNdXRlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1OEMwM1x1ODI3Mlx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICogNTBtcyBkZWJvdW5jZVx1RkYwQ1x1OTYzMlx1NkI2Mlx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdTZFRDFcdTU3NTdcdTVGRUJcdTkwMUZcdTYyRDZcdTYyRkRcdTRFQTdcdTc1MUZcdTlBRDhcdTk4OTEgRE9NIFx1NTE5OVx1NTE2NVxuICAgKi9cbiAgYXBwbHlQYWxldHRlKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcik7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSBmYWxzZTsgLy8gXHU2NUIwXHU4QzAzXHU4MjcyXHU4QkY3XHU2QzQyXHU1MjMwXHU2NzY1IFx1MjE5MiBcdTg5RTNcdTk2NjRcdTYyOTFcdTUyMzZcbiAgICB0aGlzLl9wYWxldHRlU3luY1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkKSByZXR1cm47IC8vIHJlc3RvcmVEZWZhdWx0cyBcdTU3MjhcdTk2MzJcdTYyOTZcdTdBOTdcdTUzRTNcdTUxODVcdTg4QUJcdThDMDNcdTc1MjhcbiAgICAgIGNvbnN0IHZhcnMgPSBUaGVtZUJyaWRnZS5jb21wdXRlT2JzaWRpYW5WYXJzKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFycykpIHtcbiAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvKiogXHU2RTA1XHU5NjY0XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTYwNjJcdTU5MEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5RUQ4XHU4QkE0XHU1MDNDICovXG4gIHN0YXRpYyByZXN0b3JlRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFRoZW1lQnJpZGdlLklOSkVDVEVEX1ZBUlMpIHtcbiAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4vU3RvcmFnZUJyaWRnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4vVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuaW1wb3J0IHsgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLCBBVURJT19NSU1FX1RZUEVTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTY1RjZcdTg5ODFcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MEQgKi9cbmNvbnN0IFNLSVBfRElSUyA9IG5ldyBTZXQoWycub2JzaWRpYW4nLCAnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ10pO1xuXG4vKipcbiAqIEJyaWRnZVNlcnZpY2UgLSBwb3N0TWVzc2FnZSBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTRFMkRcdTVGQzNcbiAqXG4gKiBcdTc2RDFcdTU0MkMgaWZyYW1lIFx1NTNEMVx1Njc2NVx1NzY4NCBwb3N0TWVzc2FnZVx1RkYwQ1x1NTIwNlx1NTNEMVx1NTIzMFx1NUJGOVx1NUU5NFx1NTkwNFx1NzQwNlx1NkEyMVx1NTc1N1x1RkYwQ1xuICogXHU3MTM2XHU1NDBFXHU1QzA2XHU3RUQzXHU2NzlDXHU1NkRFXHU0RjIwXHU3RUQ5IGlmcmFtZVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQnJpZGdlU2VydmljZSB7XG4gICAgcHJpdmF0ZSBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlO1xuICAgIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICAgIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgoKSA9PiBQcm9taXNlPHZvaWQ+KSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGN1c3RvbVRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICAgIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgZXhwZWN0ZWRPcmlnaW4gPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlLFxuICAgICAgICB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2UsXG4gICAgICAgIHNldHRpbmdzPzogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgICAgIHNhdmVTZXR0aW5ncz86ICgpID0+IFByb21pc2U8dm9pZD5cbiAgICApIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlQnJpZGdlID0gc3RvcmFnZUJyaWRnZTtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZSA9IHRoZW1lQnJpZGdlO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3MgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3MgfHwgbnVsbDtcbiAgICB9XG5cbiAgLyoqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RTc2XHU1RjAwXHU1OUNCXHU3NkQxXHU1NDJDXHU2RDg4XHU2MDZGICovXG4gIGF0dGFjaChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgLy8gXHU5NjMyXHU2QjYyXHU5MUNEXHU1OTBEXHU3RUQxXHU1QjlBXG4gICAgdGhpcy5kZXRhY2goKTtcblxuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG5cbiAgICAvLyBcdThCQjBcdTVGNTUgZXhwZWN0ZWQgb3JpZ2luXHVGRjBDXHU3NTI4XHU0RThFXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgIHRoaXMub25NZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4XHVGRjA4XHU0RjlCXHU2M0QyXHU0RUY2XHU3QUVGXHU2MjZCXHU2M0NGXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0ICovXG4gIHNldE5vaXNlUGF0aChub2lzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubm9pc2VQYXRoID0gbm9pc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1NjIxNlx1NTE2OFx1NUU5M1x1NjI2Qlx1NjNDRlx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIF9zY2FuVmF1bHRBdWRpb0ZpbGVzKG1heERlcHRoID0gNSk6IFByb21pc2U8QXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhbGxvd2VkRXh0cyA9IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUztcbiAgICBjb25zdCBiYXNlUGF0aCA9IHRoaXMudmF1bHRCYXNlUGF0aDtcbiAgICBpZiAoIWJhc2VQYXRoKSByZXR1cm4gcmVzdWx0cztcblxuICAgIC8vIFx1NjhDMFx1NjdFNSBiYXNlUGF0aCBcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdUZGMDhcdTVGMDJcdTZCNjVcdUZGMDlcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChiYXNlUGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTYzMDdcdTVCOUFcdTRFODZcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUzRUFcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRFMERcdTkwMTJcdTVGNTJcdUZGMDlcbiAgICBpZiAodGhpcy5ub2lzZVBhdGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldERpciA9IHBhdGguam9pbihiYXNlUGF0aCwgdGhpcy5ub2lzZVBhdGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIodGFyZ2V0RGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUoKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KHBhdGguam9pbih0YXJnZXREaXIsIGVudHJ5Lm5hbWUpKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHBhdGguam9pbih0aGlzLm5vaXNlUGF0aCwgZW50cnkubmFtZSksIG5hbWU6IGVudHJ5Lm5hbWUsIHNpemU6IHN0YXQuc2l6ZSwgZXh0IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjcyQVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTE2OFx1NUU5M1x1OTAxMlx1NUY1Mlx1NjI2Qlx1NjNDRlx1RkYwOFx1NUYwMlx1NkI2NSArIFx1NkRGMVx1NUVBNlx1OTY1MFx1NTIzNlx1RkYwOVxuICAgIGNvbnN0IHNjYW5EaXIgPSBhc3luYyAoZGlyUGF0aDogc3RyaW5nLCByZWxhdGl2ZVByZWZpeDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgbGV0IGVudHJpZXM6IGZzLkRpcmVudFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZW50cmllcyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIoZGlyUGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgfSBjYXRjaCB7IHJldHVybjsgLyogc2tpcCB1bnJlYWRhYmxlIGRpcnMgKi8gfVxuXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgZW50cnkubmFtZSk7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlUHJlZml4ID8gcGF0aC5qb2luKHJlbGF0aXZlUHJlZml4LCBlbnRyeS5uYW1lKSA6IGVudHJ5Lm5hbWU7XG5cbiAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICBpZiAoU0tJUF9ESVJTLmhhcyhlbnRyeS5uYW1lKSkgY29udGludWU7XG4gICAgICAgICAgYXdhaXQgc2NhbkRpcihmdWxsUGF0aCwgcmVsYXRpdmVQYXRoLCBkZXB0aCArIDEpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpKSB7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcmVsYXRpdmVQYXRoLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgc2NhbkRpcihiYXNlUGF0aCwgJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxIGlmcmFtZVx1RkYwQ1x1NTA1Q1x1NkI2Mlx1NzZEMVx1NTQyQyAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVzc2FnZUhhbmRsZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gICAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aGVtZUJyaWRnZS5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtc2cgPSBldmVudC5kYXRhIGFzIEFueUJyaWRnZU1lc3NhZ2U7XG4gICAgaWYgKCFtc2cgfHwgIW1zZy50eXBlIHx8ICFtc2cuaWQpIHJldHVybjtcblxuICAgIC8vIFx1NjgyMVx1OUE4Q1x1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1RkYxQXNvdXJjZSArIG9yaWdpbiBcdTUzQ0NcdTkxQ0RcdTlBOENcdThCQzFcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgZXZlbnQuc291cmNlICE9PSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmV4cGVjdGVkT3JpZ2luICYmIGV2ZW50Lm9yaWdpbiAhPT0gdGhpcy5leHBlY3RlZE9yaWdpbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQnJpZGdlU2VydmljZV0gSWdub3JlZCBtZXNzYWdlIGZyb20gdW5rbm93biBvcmlnaW46JywgZXZlbnQub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTUyNERcdTdGMDBcbiAgICBpZiAoIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3N0b3JhZ2U6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2FwcDonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnZmlsZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgndGhlbWU6JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcdTZEODhcdTYwNkZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgLy8gXHU2MjhBXHU2MzAxXHU0RTQ1XHU1MzE2XHU3Njg0IHNlY3Rpb25Db25maWdcdTMwMDFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTU0OENcdTgxRUFcdTVCOUFcdTRFNDlcdTk3RjNcdTZFOTBcdTk2OEYgcmVhZHkgXHU1NENEXHU1RTk0XHU1M0QxXHU3RUQ5IHdlYmFwcFxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncz8uc2VjdGlvbkNvbmZpZyB8fCBudWxsLFxuICAgICAgICBjdXN0b21UaGVtZXM6IHRoaXMuY3VzdG9tVGhlbWVzLFxuICAgICAgICBjdXN0b21Ob2lzZXM6IHRoaXMuc2V0dGluZ3M/Lm5vaXNlSXRlbXMgfHwgW10sXG4gICAgICAgIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogdGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmNsb3NlJykge1xuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkVcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZVNlY3Rpb25Db25maWcnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnNlY3Rpb25Db25maWcgPSBtc2cucGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVDdXN0b21Ob2lzZXMnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLm5vaXNlSXRlbXMgPSBtc2cucGF5bG9hZCBhcyB1bmtub3duW10gfHwgW107XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU0RTNCXHU5ODk4XHU1MjA3XHU2MzYyXHU4QkY3XHU2QzQyXHVGRjA4aWZyYW1lIFx1MjE5MiBPYnNpZGlhblx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDp0b2dnbGVUaGVtZScpIHtcbiAgICAgIGNvbnN0IHRhcmdldElzRGFyayA9IChtc2cucGF5bG9hZCBhcyB7IGlzRGFyazogYm9vbGVhbiB9KS5pc0RhcmsgPT09IHRydWU7XG4gICAgICBjb25zdCBjdXJyZW50SXNEYXJrID0gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgICAgIGlmICh0YXJnZXRJc0RhcmsgIT09IGN1cnJlbnRJc0RhcmspIHtcbiAgICAgICAgaWYgKHRhcmdldElzRGFyaykge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWxpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU5MDFBXHU3N0U1IGlmcmFtZSBcdTRFM0JcdTk4OThcdTVERjJcdTUyMDdcdTYzNjJcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUsIGlzRGFyazogdGFyZ2V0SXNEYXJrIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1OEJGN1x1NkM0Mlx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAndGhlbWU6c3luY1BhbGV0dGUnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuKSB7XG4gICAgICAgIGNvbnN0IHsgaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayB9ID0gKG1zZyBhcyBhbnkpLnBheWxvYWQ7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UuYXBwbHlQYWxldHRlKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdUZGMUFcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjYgPT09PT1cblxuICAgIC8vIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1NjI0MFx1NjcwOVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NEY5QiB3ZWJhcHAgXHU2NTg3XHU0RUY2XHU5MDA5XHU2MkU5XHU1NjY4XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjBDXHU4QkY3XHU1QzFEXHU4QkQ1XHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU5NzYyXHU2NzdGJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKSBcdTUxODVcdTkwRThcdTVERjJcdTVGMDJcdTZCNjVcdTY4QzBcdTY3RTVcdThERUZcdTVGODRcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLl9zY2FuVmF1bHRBdWRpb0ZpbGVzKCk7XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29dIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3XHU1RTkzXHU1MTg1XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUyMDE0IFx1OEZENFx1NTZERVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTI0RFx1N0FFRlx1NzZGNFx1NjNBNSBmZXRjaCBmaWxlOi8vXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NCcpO1xuICAgICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdThERUZcdTVGODRcdTY3MkFcdTkwMDNcdTkwMzhcdTUxRkEgdmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh2YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyXHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoOiBmdWxsUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShyZWxhdGl2ZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU2NzJDXHU1NzMwXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU1NkRFXHU0RjIwXHU4REVGXHU1Rjg0XHU3NTMxXHU1MjREXHU3QUVGXHU3NTI4IGZpbGU6Ly8gXHU1MkEwXHU4RjdEXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIWZpbGVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuICAgICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTYyRDJcdTdFRERcdTUzMDVcdTU0MkJcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTVCNTdcdTdCMjZcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoLCBleHQpIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yLm1lc3NhZ2UgfHwgJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2RlxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2VCcmlkZ2UuaGFuZGxlKG1zZyk7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY4MzlcdTYzNkVcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcdTgzQjdcdTUzRDYgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbiAgcHJpdmF0ZSBfZ2V0QXVkaW9NaW1lVHlwZShleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEFVRElPX01JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NjIxMFx1NTI5Rlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmQoaWQ6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgcGF5bG9hZCB9LCAnKicpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZEVycm9yKGlkOiBzdHJpbmcsIGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBlcnJvciB9LCAnKicpO1xuICB9XG59XG4iLCAiLyoqIFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NUI4Q1x1NjU3NFx1NTIxN1x1ODg2OFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyA9IFtcbiAgJy5tcDMnLCAnLndhdicsICcub2dnJywgJy5mbGFjJywgJy5hYWMnLCAnLm00YScsICcud21hJywgJy53ZWJtJywgJy5vcHVzJyxcbl07XG5cbi8qKiBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MEQgXHUyMTkyIE1JTUUgXHU3QzdCXHU1NzhCICovXG5leHBvcnQgY29uc3QgQVVESU9fTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5tcDMnOiAgJ2F1ZGlvL21wZWcnLFxuICAnLndhdic6ICAnYXVkaW8vd2F2JyxcbiAgJy5vZ2cnOiAgJ2F1ZGlvL29nZycsXG4gICcuZmxhYyc6ICdhdWRpby9mbGFjJyxcbiAgJy5hYWMnOiAgJ2F1ZGlvL2FhYycsXG4gICcubTRhJzogICdhdWRpby9tcDQnLFxuICAnLndtYSc6ICAnYXVkaW8veC1tcy13bWEnLFxuICAnLndlYm0nOiAnYXVkaW8vd2VibScsXG4gICcub3B1cyc6ICdhdWRpby9vcHVzJyxcbn07XG5cbi8qKiBcdTVCOENcdTY1NzQgTUlNRSBcdTdDN0JcdTU3OEJcdTY2MjBcdTVDMDRcdUZGMDhcdTU0MkIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IE1JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcuaHRtbCc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmNzcyc6ICAndGV4dC9jc3M7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcubWpzJzogICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qc29uJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAnLnBuZyc6ICAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAgJ2ltYWdlL2pwZWcnLFxuICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICcuZ2lmJzogICdpbWFnZS9naWYnLFxuICAnLnN2Zyc6ICAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcuaWNvJzogICdpbWFnZS94LWljb24nLFxuICAnLndvZmYnOiAnZm9udC93b2ZmJyxcbiAgJy53b2ZmMic6J2ZvbnQvd29mZjInLFxuICAnLnR0Zic6ICAnZm9udC90dGYnLFxuICAuLi5BVURJT19NSU1FX1RZUEVTLFxufTtcbiIsICJpbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG5ldCBmcm9tICduZXQnO1xuaW1wb3J0IHsgTUlNRV9UWVBFUywgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcblxuLyoqXG4gKiBMb2NhbFNlcnZlciAtIFx1NjcyQ1x1NTczMCBIVFRQIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjcwRFx1NTJBMVx1NTY2OFxuICpcbiAqIFx1NTcyOCBPYnNpZGlhbiAoRWxlY3Ryb24pIFx1NzNBRlx1NTg4M1x1NEUyRFx1NTQyRlx1NTJBOFx1NEUwMFx1NEUyQVx1NjcyQ1x1NTczMCBIVFRQIFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1xuICogXHU0RTNBIGlmcmFtZSBcdTYzRDBcdTRGOUIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NjcwRFx1NTJBMVx1RkYwQ1x1N0VENVx1OEZDNyBhcHA6Ly8gXHU1MzRGXHU4QkFFXHU3Njg0XHU5NjUwXHU1MjM2XHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFNlcnZlciB7XG4gIHByaXZhdGUgc2VydmVyOiBodHRwLlNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHBvcnQgPSAwO1xuICBwcml2YXRlIHdlYmFwcERpcjogc3RyaW5nO1xuICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKHdlYmFwcERpcjogc3RyaW5nKSB7XG4gICAgdGhpcy53ZWJhcHBEaXIgPSB3ZWJhcHBEaXI7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RjlCIC9iYW1ib28tYXVkaW8gXHU5N0YzXHU5ODkxXHU0RUUzXHU3NDA2XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHNldFZhdWx0QmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMudmF1bHRCYXNlUGF0aCA9IGJhc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1x1OEZENFx1NTZERVx1NzZEMVx1NTQyQ1x1N0FFRlx1NTNFMyAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLnNlcnZlcikgcmV0dXJuIHRoaXMucG9ydDtcblxuICAgIHRoaXMucG9ydCA9IGF3YWl0IHRoaXMuZmluZEZyZWVQb3J0KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KHJlcSwgcmVzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFNlcnZlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5saXN0ZW4odGhpcy5wb3J0LCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gTG9jYWwgc2VydmVyIHN0YXJ0ZWQgb24gcG9ydCAke3RoaXMucG9ydH1gKTtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnBvcnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU1MDVDXHU2QjYyXHU2NzBEXHU1MkExXHU1NjY4ICovXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RvcHBlZCcpO1xuICAgICAgICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnBvcnQgPSAwO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2NzBEXHU1MkExXHU1NjY4IFVSTCAqL1xuICBnZXRVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGh0dHA6Ly8xMjcuMC4wLjE6JHt0aGlzLnBvcnR9YDtcbiAgfVxuXG4gIC8qKiBcdTU5MDRcdTc0MDYgSFRUUCBcdThCRjdcdTZDNDIgKi9cbiAgcHJpdmF0ZSBoYW5kbGVSZXF1ZXN0KHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSk6IHZvaWQge1xuICAgIC8vIC9iYW1ib28tYXVkaW8/cGF0aD14eHggXHUyMDE0IFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NEVFM1x1NzQwNlx1RkYwQ1x1N0VENVx1OEZDNyBwb3N0TWVzc2FnZSBcdTU5MjcgcGF5bG9hZCBcdTk2NTBcdTUyMzZcbiAgICBjb25zdCB1cmwgPSByZXEudXJsIHx8ICcvJztcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9iYW1ib28tYXVkaW8nKSkge1xuICAgICAgdGhpcy5oYW5kbGVBdWRpb1Byb3h5KHJlcSwgcmVzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTg5RTNcdTY3OTAgVVJMXHVGRjBDXHU1M0JCXHU5NjY0XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXG4gICAgbGV0IHVybFBhdGggPSB1cmwuc3BsaXQoJz8nKVswXTtcbiAgICAvLyBcdTc2RUVcdTVGNTVcdTlFRDhcdThCQTRcdTY1ODdcdTRFRjZcbiAgICBpZiAodXJsUGF0aC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICB1cmxQYXRoICs9ICdpbmRleC5odG1sJztcbiAgICB9XG4gICAgY29uc3Qgc2FmZVBhdGggPSBwYXRoLm5vcm1hbGl6ZSh1cmxQYXRoKS5yZXBsYWNlKC9eKFxcLlxcLltcXC9cXFxcXSkrLywgJycpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMud2ViYXBwRGlyLCBzYWZlUGF0aCk7XG5cbiAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTU3Mjggd2ViYXBwRGlyIFx1NTE4NVxuICAgIGlmICghZmlsZVBhdGguc3RhcnRzV2l0aCh0aGlzLndlYmFwcERpcikpIHtcbiAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTtcbiAgICAgIHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGZzLnN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICBpZiAoZXJyIHx8ICFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XG4gICAgICAgIHJlcy5lbmQoJ05vdCBGb3VuZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RSBNSU1FIFx1N0M3Qlx1NTc4QlxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSBNSU1FX1RZUEVTW2V4dF0gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NEUwRFx1OTcwMFx1ODk4MSBDT1JTXHVGRjBDaWZyYW1lIFx1NEUwRVx1NjcwRFx1NTJBMVx1NTY2OFx1NTQwQ1x1NkU5MFx1RkYwOVxuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScsXG4gICAgICB9KTtcblxuICAgICAgLy8gXHU2RDQxXHU1RjBGXHU0RjIwXHU4RjkzXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoKTtcbiAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU2RDQxXHU1RjBGXHU0RUUzXHU3NDA2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9Qcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5U3RyKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhcmFtcy5nZXQoJ3BhdGgnKTtcbiAgICAgIGlmICghcmVsYXRpdmVQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NTNFQVx1NTE0MVx1OEJCOFx1NjMwN1x1NUI5QVx1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IHVuc3VwcG9ydGVkIGF1ZGlvIGZvcm1hdCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc5ODFcdTZCNjJcdThERUZcdTVGODRcdTdBN0ZcdThEOEFcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBwYXRoLm5vcm1hbGl6ZShyZWxhdGl2ZVBhdGgpLnJlcGxhY2UoL14oXFwuXFwuW1xcL1xcXFxdKSsvLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcuLicpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTsgcmVzLmVuZCgnVmF1bHQgYmFzZSBwYXRoIG5vdCBjb25maWd1cmVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCBub3JtYWxpemVkKTtcbiAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnMuc3RhdChmdWxsUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7IHJlcy5lbmQoJ0ZpbGUgbm90IGZvdW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBzdGF0cy5zaXplLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmdWxsUGF0aCk7XG4gICAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIHJlcy5lbmQoJ1N0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gcHJveHkgZXJyb3I6JywgZSk7XG4gICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY3RTVcdTYyN0VcdTUzRUZcdTc1MjhcdTdBRUZcdTUzRTMgKi9cbiAgcHJpdmF0ZSBmaW5kRnJlZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgc2VydmVyLmxpc3RlbigwLCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3J0ID0gKHNlcnZlci5hZGRyZXNzKCkgYXMgbmV0LkFkZHJlc3NJbmZvKS5wb3J0O1xuICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4gcmVzb2x2ZShwb3J0KSk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59IiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcblxuLyoqIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyAqL1xuZXhwb3J0IGludGVyZmFjZSBCYW1ib29SZXZpZXdTZXR0aW5ncyB7XG4gIC8qKiBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdTY4MzlcdThERUZcdTVGODQgKi9cbiAgZGF0YVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEgKi9cbiAgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuICAvKiogXHU2NzdGXHU1NzU3XHU3QkExXHU3NDA2XHU5MTREXHU3RjZFXHVGRjA4XHU1M0VGXHU4OUMxXHU2MDI3ICsgXHU2MzkyXHU1RThGXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFIHdlYmFwcCBpZnJhbWUgbG9jYWxTdG9yYWdlIFx1NEUwRFx1NTNFRlx1OTc2MFx1NjVGNlx1NjMwMVx1NEU0NVx1NTMxNiAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDkgKi9cbiAgdGhlbWVQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTNcdUZGMDkgKi9cbiAgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTUyMTdcdTg4NjhcdUZGMDhcdTkwMUFcdThGQzdcdTY4NjVcdTYzQTVcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMENcdTUxNEJcdTY3MEQgbG9jYWxTdG9yYWdlIHBvcnQtc2NvcGVkIFx1OTVFRVx1OTg5OFx1RkYwOSAqL1xuICBub2lzZUl0ZW1zOiB1bmtub3duW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVDMDYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjIgKi9cbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSB7XG4gIGRhdGFQYXRoOiAnYmFtYm9vLXJldmlldycsXG4gIGVuYWJsZU1hcmtkb3duU3luYzogdHJ1ZSxcbiAgc2VjdGlvbkNvbmZpZzogbnVsbCxcbiAgdGhlbWVQYXRoOiAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JyxcbiAgbm9pc2VQYXRoOiAnJyxcbiAgbm9pc2VJdGVtczogW10sXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogZmFsc2UsXG59O1xuXG4vKipcbiAqIFBsdWdpblNldHRpbmdzIC0gT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gKi9cbmV4cG9ydCBjbGFzcyBQbHVnaW5TZXR0aW5ncyBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1zZXR0aW5ncycpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vID09PSBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU1NzI4IFZhdWx0IFx1NEUyRFx1NzY4NFx1NUI1OFx1NTBBOFx1NzZFRVx1NUY1NVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignYmFtYm9vLXJldmlldycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoID0gdmFsdWUgfHwgJ2JhbWJvby1yZXZpZXcnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBNYXJrZG93biBcdTY0NThcdTg5ODFcdTU0MENcdTZCNjVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxJylcbiAgICAgIC5zZXREZXNjKCdcdTZCQ0ZcdTZCMjFcdTRGRERcdTVCNThcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTU3MjggcmV2aWV3cy8gXHU3NkVFXHU1RjU1XHU0RTBCXHU3NTFGXHU2MjEwXHU1M0VGXHU4QkZCXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjYnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NUI1OFx1NjUzRVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoID0gdmFsdWUgfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTc2N0RcdTU2NkFcdTk3RjMgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGMycpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOScpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU2MzA3XHU1QjlBXHU1NDBFXHU0RUM1XHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHU1MTg1XHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHUzMDAyXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU2NTc0XHU0RTJBXHU1RTkzXHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTc2N0RcdTU2NkFcdTk3RjMgXHU2MjE2XHU3NTU5XHU3QTdBXHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1QzA2XHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMEN3ZWJhcHAgXHU1MTg1XHU2MEFDXHU2RDZFXHU4M0RDXHU1MzU1XHU3Njg0XHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1OEMwM1x1ODI3Mlx1NEYxQVx1NUI5RVx1NjVGNlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTc2ODRcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdTkxNERcdTgyNzInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmFtYm9vLXJldmlldy1mcmFtZScpIGFzIEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgIGlmIChmcmFtZT8uY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgZW5hYmxlZDogdmFsdWUgfVxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gXHU1MTczXHU0RThFXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NTE3M1x1NEU4RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMVx1RkYxQVx1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBwbHVnaW5Cb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCcgfSk7XG4gICAgY29uc3QgcGx1Z2luVGl0bGUgPSBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIGNvbnN0IGRlc2NFbCA9IHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdCYW1ib28gSW1tb3J0YWxzXHVGRjA4XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHVGRjA5XHU2NjJGXHU0RTAwXHU2QjNFXHU1N0ZBXHU0RThFXHU4MkNGXHU4MDU0XHU2M0E3XHU1MjM2XHU4QkJBXHU0RTRCXHU3MjM2XHU3RUY0XHU1MTRCXHU2MjU4XHUwMEI3XHU2ODNDXHU1MzYyXHU0RUMwXHU3OUQxXHU1OTJCXHU2M0QwXHU1MUZBXHU3Njg0XCJPR0FTXCJcdTc0MDZcdTVGRjVcdUZGMENcdTRFMTNcdTRFM0FcdTRFMkFcdTRFQkFcdTYyNTNcdTkwMjBcdTc2ODRcdTRFMkRcdTU2RkRcdTk4Q0VcdTc2RUVcdTY4MDdcdTgxRUFcdTUyQThcdTUzMTZcdTUyMDZcdTkxNERcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnXG4gICAgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQgYmFtYm9vLWFib3V0LWF1dGhvcicgfSk7XG4gICAgY29uc3QgYXV0aG9yUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm93JyB9KTtcbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF2YXRhcicgfSk7XG4gICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvMndCREFBWUVCUVlGQkFZR0JRWUhCd1lJQ2hBS0Nna0pDaFFPRHd3UUZ4UVlHQmNVRmhZYUhTVWZHaHNqSEJZV0lDd2dJeVluS1NvcEdSOHRNQzBvTUNVb0tTai8yd0JEQVFjSEJ3b0lDaE1LQ2hNb0doWWFLQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0NqL3dBQVJDQUtBQW9BREFTSUFBaEVCQXhFQi84UUFId0FBQVFVQkFRRUJBUUVBQUFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSQUFBZ0VEQXdJRUF3VUZCQVFBQUFGOUFRSURBQVFSQlJJaE1VRUdFMUZoQnlKeEZES0JrYUVJSTBLeHdSVlMwZkFrTTJKeWdna0tGaGNZR1JvbEppY29LU28wTlRZM09EazZRMFJGUmtkSVNVcFRWRlZXVjFoWldtTmtaV1puYUdscWMzUjFkbmQ0ZVhxRGhJV0doNGlKaXBLVGxKV1dsNWlabXFLanBLV21wNmlwcXJLenRMVzJ0N2k1dXNMRHhNWEd4OGpKeXRMVDFOWFcxOWpaMnVIaTQrVGw1dWZvNmVyeDh2UDA5ZmIzK1BuNi84UUFId0VBQXdFQkFRRUJBUUVCQVFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSRUFBZ0VDQkFRREJBY0ZCQVFBQVFKM0FBRUNBeEVFQlNFeEJoSkJVUWRoY1JNaU1vRUlGRUtSb2JIQkNTTXpVdkFWWW5MUkNoWWtOT0VsOFJjWUdSb21KeWdwS2pVMk56ZzVPa05FUlVaSFNFbEtVMVJWVmxkWVdWcGpaR1ZtWjJocGFuTjBkWFozZUhsNmdvT0VoWWFIaUltS2twT1VsWmFYbUptYW9xT2twYWFucUttcXNyTzB0YmEzdUxtNndzUEV4Y2JIeU1uSzB0UFUxZGJYMk5uYTR1UGs1ZWJuNk9ucTh2UDA5ZmIzK1BuNi85b0FEQU1CQUFJUkF4RUFQd0Q1VW9vb29BS0tLS0FDaWlpZ0Fvb285S0FDaWlqMG9BS0tLUFNnQW9vb29BS0tLS0FDaWlqMG9BS0tLWEZBQ1VVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGTGlnVXRBRGFLV2tvQUtVZEtTbEZBQ2lrTkxTR2dCS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vcFJRQWxGTGlrb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBRkZGTFNHZ0JLS0tLQUNsRkpUaFFBbEpUcWJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBb3BhUVV0QUNVbExTVUFGS0tTbEZBQzBob29vQVNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FXbHBCUzBBRk5wMUlhQUVvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQXBRS0JUaFFBQ2tOT3hUV29BYlJSUlFBVTRVMm5DZ0FwS2RUVFFBbEZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFLS1drRkxRQWxKVHFiUUFVb3BLVVVBRkZGSlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRktLQUZGTFNDbG9BS1EwdElhQUcwVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJTaWtwUlFBNFVvcEtCUUF0SWFXa05BREtLS0tBQ25MVGFVVUFPb29vb0FTbTA0MDJnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2w3VWxLS0FDaWxwRFFBbEtLU25VQUZKUzBkcUFHMFVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrcHdvQVNrcHhwdEFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrLi4uIFt0cnVuY2F0ZWRdJ1xuICAgIH0pO1xuXG4gICAgY29uc3QgYXV0aG9ySW5mbyA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLWluZm8nIH0pO1xuICAgIGNvbnN0IGF1dGhvckVsID0gYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1N0ZCRFx1OUNERVx1NTQxQicsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItbmFtZScgfSk7XG4gICAgY29uc3Qgcm9sZUVsID0gYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NTVCNVx1NUI1N1x1OTk4Nlx1NTIxQlx1NTlDQlx1NEVCQScsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm9sZScgfSk7XG5cbiAgICAvLyBcdTRGNUNcdTU0QzFcdTUzM0FcbiAgICBjb25zdCB3b3Jrc1RpdGxlID0gYXV0aG9yQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU0RjVDXHU1NEMxJywgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLWxhYmVsJyB9KTtcbiAgICBjb25zdCB3b3Jrc1JvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3Mtcm93JyB9KTtcblxuICAgIFsnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCddLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCB0YWcgPSB3b3Jrc1Jvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogbmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFzQztBQUN0QyxJQUFBQyxRQUFzQjs7O0FDRHRCLElBQUFDLG1CQUF3QztBQUN4QyxJQUFBQyxRQUFzQjtBQUN0QixJQUFBQyxNQUFvQjs7O0FDRnBC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QSxJQUMzQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR1EsYUFBYSxNQUFvQjtBQUN2QyxVQUFNLFNBQVMsS0FBSyxJQUFJLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUN4RSxRQUFJLE9BQU8sV0FBVyxFQUFHO0FBRXpCLFVBQU0sT0FBTyxPQUFPLENBQUMsRUFBRTtBQUN2QixVQUFNLFNBQVUsS0FBYTtBQUM3QixRQUFJLFFBQVEsZUFBZTtBQUN6QixVQUFJLFNBQVM7QUFDYixVQUFJO0FBQUUsaUJBQVMsSUFBSSxJQUFJLE9BQU8sR0FBRyxFQUFFO0FBQUEsTUFBUSxRQUFRO0FBQUEsTUFBaUI7QUFDcEUsYUFBTyxjQUFjO0FBQUEsUUFDbkIsRUFBRSxNQUFNLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtBQUFBLFFBQ2hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxFQUMzRTtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAic3RhdCIsICJmcyIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiJdCn0K
