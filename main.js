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
    return document.body.classList.contains("theme-dark");
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
    if (this._paletteSyncTimer) clearTimeout(this._paletteSyncTimer);
    _ThemeBridge._suppressed = false;
    this._paletteSyncTimer = setTimeout(() => {
      if (_ThemeBridge._suppressed) return;
      const vars = _ThemeBridge.computeObsidianVars(hue, lightnessOffset, isDark);
      for (const [key, value] of Object.entries(vars)) {
        document.body.style.setProperty(key, value);
      }
    }, 50);
  }
  /** 清除注入的 CSS 变量，恢复 Obsidian 主题默认值 */
  static restoreDefaults() {
    _ThemeBridge._suppressed = true;
    for (const key of _ThemeBridge.INJECTED_VARS) {
      document.body.style.removeProperty(key);
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
    const leafContent = container.parentElement;
    if (leafContent) {
      const titleEl = leafContent.querySelector(".view-header-title-container");
      if (titleEl) titleEl.style.display = "none";
    }
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
    containerEl.createEl("h2", { text: "\u7AF9\u6797\u4FEE\u4ED9\u4F20 - \u8BBE\u7F6E" });
    containerEl.createEl("h3", { text: "\u6570\u636E\u5B58\u50A8" });
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
    containerEl.createEl("h3", { text: "\u4E3B\u9898\u52A8\u6548" });
    new import_obsidian3.Setting(containerEl).setName("\u81EA\u5B9A\u4E49\u4E3B\u9898\u8DEF\u5F84").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u5B58\u653E\u81EA\u5B9A\u4E49\u4E3B\u9898 .js \u6587\u4EF6\u7684\u6587\u4EF6\u5939\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u7AF9\u6797\u590D\u76D8\u4E3B\u9898").setValue(this.plugin.settings.themePath).onChange(async (value) => {
        this.plugin.settings.themePath = value || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u767D\u566A\u97F3" });
    new import_obsidian3.Setting(containerEl).setName("\u767D\u566A\u97F3\u6587\u4EF6\u5939").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u7684\u76F8\u5BF9\u8DEF\u5F84\uFF0C\u6307\u5B9A\u540E\u4EC5\u626B\u63CF\u8BE5\u6587\u4EF6\u5939\u5185\u7684\u97F3\u9891\u6587\u4EF6\u3002\u7559\u7A7A\u5219\u626B\u63CF\u6574\u4E2A\u5E93\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u767D\u566A\u97F3 \u6216\u7559\u7A7A\u626B\u63CF\u5168\u5E93").setValue(this.plugin.settings.noisePath).onChange(async (value) => {
        this.plugin.settings.noisePath = value.trim();
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u8C03\u8272\u8054\u52A8" });
    new import_obsidian3.Setting(containerEl).setName("\u5C06\u8C03\u8272\u540C\u6B65\u5230 Obsidian").setDesc("\u6253\u5F00\u540E\uFF0Cwebapp \u5185\u60AC\u6D6E\u83DC\u5355\u7684\u8272\u76F8/\u660E\u5EA6\u8C03\u8272\u4F1A\u5B9E\u65F6\u540C\u6B65\u5230 Obsidian \u7684\u539F\u751F\u754C\u9762\u914D\u8272").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.syncPaletteToObsidian).onChange(async (value) => {
        this.plugin.settings.syncPaletteToObsidian = value;
        await this.plugin.saveSettings();
        if (!value) {
          ThemeBridge.restoreDefaults();
        }
        const frame = document.querySelector(".bamboo-review-frame");
        if (frame?.contentWindow) {
          frame.contentWindow.postMessage({
            type: "theme:syncPaletteEnabled",
            id: "settings_" + Date.now(),
            payload: { enabled: value }
          }, "*");
        }
      })
    );
    containerEl.createEl("h3", { text: "\u5173\u4E8E" });
    const pluginBox = containerEl.createDiv();
    pluginBox.style.padding = "14px 16px";
    pluginBox.style.borderRadius = "10px";
    pluginBox.style.background = "var(--background-secondary)";
    pluginBox.style.border = "1px solid var(--background-modifier-border)";
    pluginBox.style.marginTop = "8px";
    const pluginTitle = pluginBox.createEl("p", { text: "\u63D2\u4EF6\u7B80\u4ECB" });
    pluginTitle.style.fontSize = "11px";
    pluginTitle.style.color = "var(--text-faint)";
    pluginTitle.style.textTransform = "uppercase";
    pluginTitle.style.letterSpacing = "0.6px";
    pluginTitle.style.fontWeight = "600";
    pluginTitle.style.margin = "0 0 8px 0";
    const descEl = pluginBox.createEl("p", {
      text: 'Bamboo Immortals\uFF08\u7AF9\u6797\u4FEE\u4ED9\u4F20\uFF09\u662F\u4E00\u6B3E\u57FA\u4E8E\u82CF\u8054\u63A7\u5236\u8BBA\u4E4B\u7236\u7EF4\u514B\u6258\xB7\u683C\u5362\u4EC0\u79D1\u592B\u63D0\u51FA\u7684"OGAS"\u7406\u5FF5\uFF0C\u4E13\u4E3A\u4E2A\u4EBA\u6253\u9020\u7684\u4E2D\u56FD\u98CE\u76EE\u6807\u81EA\u52A8\u5316\u5206\u914D\u7BA1\u7406\u7CFB\u7EDF\u3002'
    });
    descEl.style.fontSize = "12.5px";
    descEl.style.lineHeight = "1.7";
    descEl.style.color = "var(--text-muted)";
    descEl.style.margin = "0";
    const authorBox = containerEl.createDiv();
    authorBox.style.padding = "14px 16px";
    authorBox.style.borderRadius = "10px";
    authorBox.style.background = "var(--background-secondary)";
    authorBox.style.border = "1px solid var(--background-modifier-border)";
    authorBox.style.marginTop = "10px";
    authorBox.style.display = "flex";
    authorBox.style.flexDirection = "column";
    authorBox.style.gap = "12px";
    const authorRow = authorBox.createDiv();
    authorRow.style.display = "flex";
    authorRow.style.alignItems = "center";
    authorRow.style.gap = "12px";
    const avatar = authorRow.createDiv();
    avatar.style.width = "44px";
    avatar.style.height = "44px";
    avatar.style.borderRadius = "50%";
    avatar.style.backgroundImage = "url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAKAAoADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5UooooAKKKKACiiigAooo9KACiij0oAKKKPSgAooooAKKKKACiij0oAKKKXFACUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFLigUtADaKWkoAKUdKSlFACikNLSGgBKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopRQAlFLikoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAFFFLSGgBKKKKAClFJThQAlJTqbQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAopaQUtACUlLSUAFKKSlFAC0hoooASiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAWlpBS0AFNp1IaAEooooAKKKKACiiigAooooAKKKKACiiigApQKBThQACkNOxTWoAbRRRQAU4U2nCgApKdTTQAlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAKKWkFLQAlJTqbQAUopKUUAFFFJQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFKKAFFLSCloAKaadSGgBtFFFABRRRQAUUUUAFFFFABRRRQAUUUtACilpBS0ALSGlpDQAyiiigApwptOWgBaSlpKAG0UtJQAUUUUAFFFFABRRRQAUUUUAFFFFACilptKKAFptOpKAEpRSUooAWkNLSGgBKKKKACiiigAooooAKKKKACiiigAoopaAEooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKUUlKKAFFLSCloAKQ0tIaAG0UUUAFFFFABRRRQAUUUUAFFFFABSikpRQA4UopKBQAtIaWkNADKKKKACnLTaUUAOooooASm0402gAooooAKKKKACiiigAooooAKKKKACl7UlKKACilpDQAlKKSnUAFJS0dqAG0UUUAFFFFABRRRQAUUUUAFFFFABSikpwoASkpxptABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSikpRQAopaSlFABSGlpDQA2iiigAooooAKKKKACiiigAooooAKUUlFADhSikFKKAFoNKKQ0AMpKU0lABSikpRQA6iiigBKbTqSgBKKKKACiiigAooooAKKKKACiiigApaBS0AApDSig0AJS0lLQAUUCloAbSUppKACiiigAooooAKKKKACiiigApwpBSigApMU6koAbRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSikpRQAopaQUtABTTTqQ0ANooooAKKKKACiiigAooooAKKKKACiiigBR0pwpopwoAWg0CjtQAw0lKaSgApRSUooAdRSUUAFNpaSgAooooAKKKKACiiigAooooAKKKKAFFLSClFAAKDS0hoASlpKBQAppaQUtADTSUppKACiiigAooooAKKKKACiiigBRThTRThQAUlLTTQAlFFFABRRRQAUUUUAFFFFABRS4oxQAlFFFABRRRQAUUUUAFFFFABSmkpRQAopaKKACkNLSGgBtFFFABRRRQAUUUUAFFFFABRRRQAUUUUAKKcKaKcKAFopaQ0AMNJSmkoAKUUlKKAFpKWkoAKSiigAooooAKKKKACiiigAooooAKKKKAFFKKQUooAWkNLRQAyilpKAClzSUUAFFFFABRRRQAUUUUAFFFFABRRRQApp1MpwoAWm0ppKAEooooAKKKKACiiigApRSUooAWiiigBKSlpKACiiigAooooAKKKKAClFJSigB1FFLQAlBpaQ0AMooooAKKKKACiiigAooooAKKKKACiiigBRThTRTxQAooNKKSgBhptONNoAKUUlKKAFpKWigBKSlpKACiiigAooooAKKKKACiiigAooooAUUopBSigBaKKKAG0lLSUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFOFNpQaAFNNpc0lABRRRQAUUUUAFFFFABSikpRQAUtFJQAUlLSUAFFFFABRRRQAUUUUAFKKSlFADhS00U4UALTTTqQ0AR0UUUAFFFFABRRRQAUUUUAFFFFABRRRQA5acKaKcKAHCkIpaKAIzTacabQAUopKKAHCikFLQAlJS0lABRRRQAUUUUAFFFFABRRRQAUUUUAKKXNJQKAFzQaKKAG0UUUAFFKKWgBtFLSUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFKKSlFAC0UUUAJSUtJQAUUUUAFFFFABRRRQAUUUUAOFOFNFKKAHYpDSikNAEdFFFABRRRQAUUUUAFFFFABRRRQAUUUUAOWnCmrTxQAtJS0lADDTacabQAUUUUAOooFFACUlLSUAFFFFABRRRQAUUUUAFFFFABRRRQAopaQUooAKSlooAbRRRQAopRSCloAQ0lLSUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFOptOoAKKBRigBKSlNJQAUUUUAFFFFABRRRQAUUUUAKKcKQUooAdSGgUGgCOiiigAooooAKKKKACiiigAooooAKKKKAHLTxTBTxQAtFAooAYaZTzTaAEooooAUUtApaAGmkp1JQAlFFFABRRRQAUUUUA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CoLi6lnmkkdjl2LHn1qCgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPVNUu5IYyqH5iOvXFc5bsTdIcZO4c/jW/qMSlCo5Pc+tV9O07EoeQYwc4oA7SCRILMzSY2gZrinM2tawznPlqeB6Ct3WroC1jtkPzN1FTaLYi2tgSPnbk0AUlszBKnPAraht4WTlBk1WuE5GOOc1at2IGTQA9oViQrAg3nge1CgRx7c5I6ml83KkjpUKEkMW79BQA15ecZxVq0nKg5PWsq4JVqlgm4wOvWgDUYFiSvap45CygHrVKwuN/B65rQ2c/KKALETU12HP1pI1bacimsjc0ARSOckikZsuOakZSQQKjMOFPrQBbWRXQeoqtKBuwagWXY2M4p8r7lzmgB1v8rYz7irlxbqssDqwxMP1rMjuBG2XPAqr9tmlv0fBESH5RQB0aBU6cGtvS13qhJOFPFc7FMJSDXT6dhbYHFAE9+2yNSvXdmrcVx56xRxfeOM4rI1Cfc4RecCtLwkhFywk+92oA7WLMiC1Q8CPYfyrzS3i2TuD1DEfrXp2mx+XcMTzkZrziL95eT46eYf50AdfoWWiC4+UDmqXiKMCYS4yFOMVteGrZjbOccAZJqh4hjVImkfJVCKAMS4t02+bGMBhypqWcfZdNbYSyjGas2QjvIsxkFcVQ1YbITESyhu46GgDnJokS8ZowNpOce1Sy2A5eF9wIztzTDH5QEg+bHWmSPi43xsyg84zQBMxZIsqeB1BqCC5G47utLIxJznnoR61XWHMuF70AaEcwaUbMtXQ2MoVMt1BrK0e32yEOmSRwTWlqSi3iZlIHGSKAMbxlPHcWdxbz/NDKhRx6givlK7h+z3U0JOfLcrn6GvofxPqO+GTnpXgfiHadXuGTo53Y9D3oAzqKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA9UedBIcAu/ZR2qdoXeAs77T/dWsaG/b7SF2KiHjjrXRqyJpkk7Y4BxQBBYW631wsxG5V/nW+TgYrL0LbFYqq455Y+9XWcZ96AGXQ5qs12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)";
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.style.backgroundColor = "var(--background-primary)";
    avatar.style.flexShrink = "0";
    avatar.style.border = "1px solid var(--background-modifier-border)";
    const authorInfo = authorRow.createDiv();
    authorInfo.style.display = "flex";
    authorInfo.style.flexDirection = "column";
    authorInfo.style.gap = "3px";
    const authorEl = authorInfo.createEl("p", { text: "\u7FBD\u9CDE\u541B" });
    authorEl.style.fontSize = "16px";
    authorEl.style.fontWeight = "600";
    authorEl.style.margin = "0";
    authorEl.style.color = "var(--text-normal)";
    authorEl.style.lineHeight = "1.2";
    const roleEl = authorInfo.createEl("p", { text: "\u55B5\u5B57\u9986\u521B\u59CB\u4EBA" });
    roleEl.style.color = "var(--text-muted)";
    roleEl.style.fontSize = "12.5px";
    roleEl.style.margin = "0";
    roleEl.style.lineHeight = "1.2";
    const worksTitle = authorBox.createEl("p", { text: "Obsidian \u63D2\u4EF6\u4F5C\u54C1" });
    worksTitle.style.fontSize = "11px";
    worksTitle.style.color = "var(--text-faint)";
    worksTitle.style.textTransform = "uppercase";
    worksTitle.style.letterSpacing = "0.6px";
    worksTitle.style.margin = "0";
    worksTitle.style.fontWeight = "600";
    const worksRow = authorBox.createDiv();
    worksRow.style.display = "flex";
    worksRow.style.gap = "8px";
    worksRow.style.flexWrap = "wrap";
    ["\u7AF9\u53F6\u98DE\u5203", "\u7AF9\u6797\u4FEE\u4ED9\u4F20"].forEach((name) => {
      const tag = worksRow.createEl("span", { text: name });
      tag.style.padding = "5px 12px";
      tag.style.borderRadius = "6px";
      tag.style.background = "var(--background-primary)";
      tag.style.border = "1px solid var(--background-modifier-border)";
      tag.style.fontSize = "13px";
      tag.style.color = "var(--text-normal)";
      tag.style.fontWeight = "500";
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
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBEYWlseVJldmlld1ZpZXcsIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgfSBmcm9tICcuL3NyYy92aWV3cy9EYWlseVJldmlld1ZpZXcnO1xuaW1wb3J0IHsgTG9jYWxTZXJ2ZXIgfSBmcm9tICcuL3NyYy9zZXJ2ZXIvTG9jYWxTZXJ2ZXInO1xuaW1wb3J0IHtcbiAgUGx1Z2luU2V0dGluZ3MsXG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG59IGZyb20gJy4vc3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqXG4gKiBCYW1ib29SZXZpZXdQbHVnaW4gLSBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTZDRThcdTUxOEMgVmlldyBcdTdDN0JcdTU3OEJcbiAqIDIuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1RkYwOFx1NjI1M1x1NUYwMFx1NTkwRFx1NzZEOFx1MzAwMVx1NTI0RC9cdTU0MEVcdTRFMDBcdTU5MjlcdTMwMDFcdTdFREZcdThCQTFcdTk3NjJcdTY3N0ZcdUZGMDlcbiAqIDMuIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICogNC4gXHU3QkExXHU3NDA2XHU2M0QyXHU0RUY2XHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgbG9jYWxTZXJ2ZXI6IExvY2FsU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VydmVyVXJsID0gJyc7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcbiAgICBjb25zdCBwbHVnaW5EaXIgPSAodGhpcy5tYW5pZmVzdCBhcyBhbnkpLmRpcjtcbiAgICBpZiAocGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGNvbnN0IHdlYmFwcERpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAnKTtcbiAgICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBuZXcgTG9jYWxTZXJ2ZXIod2ViYXBwRGlyKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jYWxTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSB0aGlzLmxvY2FsU2VydmVyLmdldFVybCgpO1xuICAgICAgICAvLyBcdTYyOEFcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdTRGMjBcdTdFRDkgTG9jYWxTZXJ2ZXJcdUZGMENcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcbiAgICAgICAgdGhpcy5sb2NhbFNlcnZlci5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBGYWlsZWQgdG8gc3RhcnQgbG9jYWwgc2VydmVyOicsIGUpO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjcyQ1x1NTczMFx1NjcwRFx1NTJBMVx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTBFOFx1NTIwNlx1NTI5Rlx1ODBGRFx1RkYwOFx1NzY3RFx1NTY2QVx1OTdGM1x1MzAwMVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1RkYwOVx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1NzUyOCcsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0RBSUxZX1JFVklFVywgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGFpbHlSZXZpZXdWaWV3KGxlYWYsIHRoaXMuc2VydmVyVXJsLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnByZXZEYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6bmV4dERheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtdG9kYXknLFxuICAgICAgbmFtZTogJ1x1NTZERVx1NTIzMFx1NEVDQVx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjp0b2RheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TdGF0cycpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU2V0dGluZ3MnKSxcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZGV0YWNoTGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgIHRoaXMubG9jYWxTZXJ2ZXI/LnN0b3AoKTtcbiAgICB0aGlzLmxvY2FsU2VydmVyID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTZGQzBcdTZEM0JcdTYyMTZcdTUyMUJcdTVFRkFcdTU5MERcdTc2RDhcdTg5QzZcdTU2RkUgKi9cbiAgYXN5bmMgYWN0aXZhdGVWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblxuICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgbGVhdmVzID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcblxuICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gXHU1REYyXHU2NzA5XHU4OUM2XHU1NkZFXHVGRjBDXHU3NkY0XHU2M0E1XHU4MDVBXHU3MTI2XG4gICAgICBsZWFmID0gbGVhdmVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTY1QjBcdTg5QzZcdTU2RkVcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XG4gICAgICAgIHR5cGU6IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChsZWFmKSB7XG4gICAgICB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0ICovXG4gIHByaXZhdGUgc2VuZFRvSWZyYW1lKHR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGNvbnN0IHZpZXcgPSBsZWF2ZXNbMF0udmlldyBhcyBEYWlseVJldmlld1ZpZXc7XG4gICAgY29uc3QgaWZyYW1lID0gKHZpZXcgYXMgYW55KS5pZnJhbWUgYXMgSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChpZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIGxldCBvcmlnaW4gPSAnKic7XG4gICAgICB0cnkgeyBvcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjsgfSBjYXRjaCB7IC8qIGtlZXAgJyonICovIH1cbiAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgICB7IHR5cGUsIGlkOiAnY21kXycgKyBEYXRlLm5vdygpIH0sXG4gICAgICAgIG9yaWdpblxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHsgQnJpZGdlU2VydmljZSB9IGZyb20gJy4uL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1Njc4MVx1N0I4MFx1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZSBcdTYyN0ZcdThGN0QgUFdBXG4gKiAyLiBcdTdCQTFcdTc0MDYgQnJpZGdlU2VydmljZSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcbiAqIDMuIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTVFNzZcdTU0MENcdTZCNjVcbiAqL1xuZXhwb3J0IGNsYXNzIERhaWx5UmV2aWV3VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcHJpdmF0ZSBicmlkZ2VTZXJ2aWNlOiBCcmlkZ2VTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZUVycm9ySGFuZGxlcjogKChlOiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjc3NDaGFuZ2VSZWY6IGFueSA9IG51bGw7XG4gIHByaXZhdGUgd2ViYXBwUGF0aDogc3RyaW5nO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgd2ViYXBwUGF0aDogc3RyaW5nLCBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPikge1xuICAgIHN1cGVyKGxlYWYpO1xuICAgIHRoaXMud2ViYXBwUGF0aCA9IHdlYmFwcFBhdGg7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0RBSUxZX1JFVklFVztcbiAgfVxuXG4gIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnO1xuICB9XG5cbiAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGVhZic7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXSBhcyBIVE1MRWxlbWVudDtcbiAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctY29udGFpbmVyJyk7XG5cbiAgICAvLyBcdTk2OTBcdTg1Q0Ygdmlldy1oZWFkZXIgXHU2ODA3XHU5ODk4XHU2NTg3XHU1QjU3XHVGRjA4aWZyYW1lIFx1ODFFQVx1NUUyNlx1NjgwN1x1OTg5OFx1RkYwQ1x1NUM0NVx1NEUyRFx1NjU4N1x1NUI1N1x1NTkxQVx1NEY1OVx1RkYwOVxuICAgIGNvbnN0IGxlYWZDb250ZW50ID0gY29udGFpbmVyLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKGxlYWZDb250ZW50KSB7XG4gICAgICBjb25zdCB0aXRsZUVsID0gbGVhZkNvbnRlbnQucXVlcnlTZWxlY3RvcignLnZpZXctaGVhZGVyLXRpdGxlLWNvbnRhaW5lcicpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgaWYgKHRpdGxlRWwpIHRpdGxlRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMud2ViYXBwUGF0aCkge1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjVFMFx1NkNENVx1NUI5QVx1NEY0RCB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU2M0QyXHU0RUY2XHU1Qjg5XHU4OEM1XHU3NkVFXHU1RjU1JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUyMUJcdTVFRkEgaWZyYW1lIC0gXHU0RTBEXHU0RjdGXHU3NTI4IHNhbmRib3hcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTZCNjIgYXBwOi8vIFx1NTM0Rlx1OEJBRVx1NEUwQlx1NzY4NFx1NUI1MFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFxuICAgIHRoaXMuaWZyYW1lID0gY29udGFpbmVyLmNyZWF0ZUVsKCdpZnJhbWUnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWZyYW1lJyxcbiAgICAgIGF0dHI6IHtcbiAgICAgICAgc3JjOiB0aGlzLndlYmFwcFBhdGgsXG4gICAgICAgIGFsbG93OiAnY2FtZXJhOyBtaWNyb3Bob25lOyBjbGlwYm9hcmQtcmVhZDsgY2xpcGJvYXJkLXdyaXRlJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBpZnJhbWUgXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU2NUY2XHU2NjNFXHU3OTNBXHU2M0QwXHU3OTNBXG4gICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSAoZTogRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIGlmcmFtZSBmYWlsZWQgdG8gbG9hZDonLCB0aGlzLndlYmFwcFBhdGgpO1xuICAgIH07XG4gICAgdGhpcy5pZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG5cbiAgICAvLyBcdTUyMURcdTU5Q0JcdTUzMTZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgYXdhaXQgc3RvcmFnZS5lbnN1cmVTdHJ1Y3R1cmUoKTtcblxuICAgIGNvbnN0IHN0b3JhZ2VCcmlkZ2UgPSBuZXcgU3RvcmFnZUJyaWRnZShzdG9yYWdlLCB0aGlzLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG5ldyBUaGVtZUJyaWRnZSgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG5ldyBCcmlkZ2VTZXJ2aWNlKFxuICAgICAgc3RvcmFnZUJyaWRnZSxcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UsXG4gICAgICB0aGlzLnNldHRpbmdzLFxuICAgICAgdGhpcy5zYXZlU2V0dGluZ3NcbiAgICApO1xuXG4gICAgLy8gXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUyRFx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFxuICAgIGNvbnN0IGN1c3RvbVRoZW1lcyA9IHRoaXMuX3NjYW5DdXN0b21UaGVtZXMoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Q3VzdG9tVGhlbWVzKGN1c3RvbVRoZW1lcyk7XG5cbiAgICAvLyBcdTRGMjBcdTkwMTJcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTc2N0RcdTU2NkFcdTk3RjNcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTYyNkJcdTYzQ0YvXHU4QkZCXHU1M0Q2XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgaWYgKHZhdWx0QmFzZVBhdGgpIHtcbiAgICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgIH1cbiAgICAvLyBcdTRGMjBcdTkwMTJcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5ub2lzZVBhdGgpIHtcbiAgICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXROb2lzZVBhdGgodGhpcy5zZXR0aW5ncy5ub2lzZVBhdGgpO1xuICAgIH1cblxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5hdHRhY2godGhpcy5pZnJhbWUpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKHRoaXMuaWZyYW1lKTtcblxuICAgIC8vIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcbiAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5vbignY3NzLWNoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2U/Lm9uVGhlbWVDaGFuZ2VkKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1Njg2NVx1NjNBNVx1NjcwRFx1NTJBMVxuICAgIHRoaXMuYnJpZGdlU2VydmljZT8uZGV0YWNoKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzQlx1OTg5OFx1NzZEMVx1NTQyQ1xuICAgIGlmICh0aGlzLmNzc0NoYW5nZVJlZikge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9mZnJlZih0aGlzLmNzc0NoYW5nZVJlZik7XG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy50aGVtZUJyaWRnZT8uZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgaWZyYW1lIGVycm9yIFx1NzZEMVx1NTQyQ1x1NTY2OFxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcikge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG4gICAgICB0aGlzLmlmcmFtZUVycm9ySGFuZGxlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGlmcmFtZVxuICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlKCk7XG4gICAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRiBWYXVsdCBcdTRFMEJcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdThERUZcdTVGODRcdTc1MzFcdTc1MjhcdTYyMzdcdThCQkVcdTdGNkVcdTYzMDdcdTVCOUFcdUZGMDkgKi9cbiAgcHJpdmF0ZSBfc2NhbkN1c3RvbVRoZW1lcygpOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+IHtcbiAgICBjb25zdCB0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGlmICghdmF1bHRCYXNlUGF0aCkgcmV0dXJuIHRoZW1lcztcblxuICAgICAgY29uc3QgdGhlbWVEaXJOYW1lID0gdGhpcy5zZXR0aW5ncy50aGVtZVBhdGggfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICBjb25zdCB0aGVtZXNEaXIgPSBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgdGhlbWVEaXJOYW1lKTtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGVtZXNEaXIpIHx8ICFmcy5zdGF0U3luYyh0aGVtZXNEaXIpLmlzRGlyZWN0b3J5KCkpIHJldHVybiB0aGVtZXM7XG5cbiAgICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyh0aGVtZXNEaXIpO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmICghZW50cnkuZW5kc1dpdGgoJy5qcycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhlbWVzRGlyLCBlbnRyeSk7XG4gICAgICAgIGlmICghZnMuc3RhdFN5bmMoZmlsZVBhdGgpLmlzRmlsZSgpKSBjb250aW51ZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvZGUgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIC8vIFx1NUZFQlx1OTAxRlx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NTMwNVx1NTQyQlx1NUZDNVx1OTcwMFx1NzY4NCBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XG4gICAgICAgICAgaWYgKCFjb2RlLmluY2x1ZGVzKCdfX2JhbWJvb190aGVtZV8nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU3RjNBXHU1QzExIF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcdUZGMENcdTVERjJcdThERjNcdThGQzdgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGVtZXMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBlbnRyeS5yZXBsYWNlKC9cXC5qcyQvLCAnJyksXG4gICAgICAgICAgICBjb2RlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW0JhbWJvb1Jldmlld10gXHU4QkZCXHU1M0Q2XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1NTkzMVx1OEQyNTpgLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoZW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQmFtYm9vUmV2aWV3XSBcdTUzRDFcdTczQjAgJHt0aGVtZXMubGVuZ3RofSBcdTRFMkFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTg6YCwgdGhlbWVzLm1hcCh0ID0+IHQubmFtZSkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBjb25zb2xlLmxvZygnW0JhbWJvb1Jldmlld10gXHU2MjZCXHU2M0NGXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU2NUY2XHU1MUZBXHU5NTE5OicsIGVyci5tZXNzYWdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhlbWVzO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBub3JtYWxpemVQYXRoLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcblxuLyoqXG4gKiBWYXVsdFN0b3JhZ2UgLSBcdTVDMDFcdTg4QzUgT2JzaWRpYW4gVmF1bHQgYWRhcHRlciBcdTc2ODRcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcbiAqXG4gKiBWYXVsdCBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODQ6XG4gKiAgIHtiYXNlUGF0aH0vXG4gKiAgICAgZGF0YS8gICAgICAgICAgLT4gXHU2QkNGXHU2NUU1IEpTT04gXHU2NTcwXHU2MzZFXG4gKiAgICAgZ29hbHMuanNvbiAgICAgLT4gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3XG4gKiAgICAgc2V0dGluZ3MuanNvbiAgLT4gXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFXG4gKiAgICAgdGhlbWVzLyAgICAgICAgLT4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmVwb3J0cy8gICAgICAgLT4gXHU2MkE1XHU1NDRBIChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmV2aWV3cy8gICAgICAgLT4gTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cbmV4cG9ydCBjbGFzcyBWYXVsdFN0b3JhZ2Uge1xuICBwcml2YXRlIGFwcDogQXBwO1xuICBwcml2YXRlIGJhc2VQYXRoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGJhc2VQYXRoID0gJ2JhbWJvby1yZXZpZXcnKSB7XG4gICAgdGhpcy5hcHAgPSBhcHA7XG4gICAgdGhpcy5iYXNlUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYmFzZVBhdGgpO1xuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOCAqL1xuICBwcml2YXRlIGFzeW5jIGVuc3VyZURpcihkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9LyR7ZGlyfWApO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2RpcihwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU1N0ZBXHU3ODQwXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0XHU1QjU4XHU1NzI4ICovXG4gIGFzeW5jIGVuc3VyZVN0cnVjdHVyZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIodGhpcy5iYXNlUGF0aCk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUzOUZcdTVCNTBcdTY1QjlcdTVGMEZcdTUxOTlcdTUxNjUgdmF1bHQgXHU2NTg3XHU0RUY2XHVGRjA4XHU2NkZGXHU0RUUzIGFkYXB0ZXIud3JpdGVcdUZGMDlcdTMwMDJcbiAgICogLSBcdTY1ODdcdTRFRjZcdTVERjJcdTU3MjggdmF1bHQgXHU3RjEzXHU1QjU4IFx1MjE5MiB2YXVsdC5wcm9jZXNzXHVGRjA4XHU1MzlGXHU1QjUwXHU2NkY0XHU2NUIwXHVGRjBDXHU5MDdGXHU1MTREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXHVGRjA5XG4gICAqIC0gXHU2NUIwXHU2NTg3XHU0RUY2IFx1MjE5MiB2YXVsdC5jcmVhdGVcdUZGMDhcdTU0MENcdTY1RjZcdTUxOTlcdTUxNjVcdTc4QzFcdTc2RDhcdTU0OEMgT2JzaWRpYW4gXHU3RjEzXHU1QjU4XHVGRjA5XG4gICAqIC0gXHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHVGRjA4XHU3OEMxXHU3NkQ4XHU2NzA5XHU0RjQ2XHU3RjEzXHU1QjU4XHU2NUUwXHVGRjA5XHUyMTkyIGFkYXB0ZXIucmVtb3ZlICsgdmF1bHQuY3JlYXRlXHVGRjA4XHU4RkMxXHU3OUZCXHU4RkRCXHU3RjEzXHU1QjU4XHVGRjA5XG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHZhdWx0V3JpdGUocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplUGF0aChwYXRoKTtcbiAgICBjb25zdCBhYnN0cmFjdCA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChub3JtYWxpemVkKTtcblxuICAgIGlmIChhYnN0cmFjdCBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoKSA9PiBjb250ZW50KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnRQYXRoID0gbm9ybWFsaXplZC5zdWJzdHJpbmcoMCwgbm9ybWFsaXplZC5sYXN0SW5kZXhPZignLycpKTtcbiAgICBpZiAocGFyZW50UGF0aCAmJiAhKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhcmVudFBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2RpcihwYXJlbnRQYXRoKTtcbiAgICB9XG5cbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMobm9ybWFsaXplZCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKG5vcm1hbGl6ZWQpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShub3JtYWxpemVkLCBjb250ZW50KTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2QkNGXHU2NUU1XHU2NTcwXHU2MzZFIChkYXlzKSAtLS0tXG5cbiAgcHJpdmF0ZSBkYXlQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YS8ke2RhdGVLZXl9Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldERheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdUZGMENcdTVDMDZcdThERjNcdThGQzc6ICR7cGF0aH1gLCBlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbERheXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKGRhdGVLZXkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChmaWxlKTtcbiAgICAgICAgICAgIGRheXNbZGF0ZUtleV0gPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHBhcnNlIGRheSBmaWxlOiAke2ZpbGV9YCwgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXlzO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NjVFNVx1NjcxRiBrZXlcdUZGMDhcdTYzMDlcdTY1RTVcdTY3MUZcdTk2NERcdTVFOEZcdUZGMENcdTY3MDBcdTY1QjBcdTU3MjhcdTUyNERcdUZGMDkgKi9cbiAgYXN5bmMgZ2V0RGF5S2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkga2V5cy5wdXNoKGRhdGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBrZXlzLnNvcnQoKS5yZXZlcnNlKCk7IC8vIFx1OTY0RFx1NUU4Rlx1RkYxQVx1NjcwMFx1NjVCMFx1NjVFNVx1NjcxRlx1NTcyOFx1NTI0RFxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIwNlx1OTg3NVx1NTJBMFx1OEY3RFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVxuICAgKiBAcGFyYW0gcGFnZSBcdTk4NzVcdTc4MDFcdUZGMDhcdTRFQ0UgMCBcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICogQHBhcmFtIHBhZ2VTaXplIFx1NkJDRlx1OTg3NVx1NjU3MFx1OTFDRlxuICAgKiBAcmV0dXJucyB7IGRheXMsIHRvdGFsLCBwYWdlLCBwYWdlU2l6ZSwgaGFzTW9yZSB9XG4gICAqL1xuICBhc3luYyBnZXREYXlzUGFnaW5hdGVkKHBhZ2UgPSAwLCBwYWdlU2l6ZSA9IDMwKTogUHJvbWlzZTx7XG4gICAgZGF5czogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgICBrZXlzOiBzdHJpbmdbXTtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIGhhc01vcmU6IGJvb2xlYW47XG4gIH0+IHtcbiAgICBjb25zdCBhbGxLZXlzID0gYXdhaXQgdGhpcy5nZXREYXlLZXlzKCk7XG4gICAgY29uc3QgdG90YWwgPSBhbGxLZXlzLmxlbmd0aDtcbiAgICBjb25zdCBzdGFydCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBwYWdlS2V5cyA9IGFsbEtleXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgIGZvciAoY29uc3QgZGF0ZUtleSBvZiBwYWdlS2V5cykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0RGF5KGRhdGVLZXkpO1xuICAgICAgICBpZiAoZGF0YSkgZGF5c1tkYXRlS2V5XSA9IGRhdGE7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGxvYWQgZGF5OiAke2RhdGVLZXl9YCwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheXMsXG4gICAgICBrZXlzOiBwYWdlS2V5cyxcbiAgICAgIHRvdGFsLFxuICAgICAgcGFnZSxcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgaGFzTW9yZTogc3RhcnQgKyBwYWdlS2V5cy5sZW5ndGggPCB0b3RhbCxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcHV0RGF5KGRheURhdGE6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0ZUtleSA9IGRheURhdGEuZGF0ZTtcbiAgICBpZiAoIWRhdGVLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF5RGF0YSBtdXN0IGhhdmUgYSBkYXRlIGZpZWxkJyk7XG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRheURhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZURheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDcgKGdvYWxzKSAtLS0tXG5cbiAgcHJpdmF0ZSBnb2Fsc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9nb2Fscy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRHb2FscygpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG4gIH1cblxuICBhc3luYyBwdXRHb2Fscyhnb2FsczogYW55W10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8YW55IHwgbnVsbD4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgodGhpcy5zZXR0aW5nc1BhdGgoKSk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgLy8gdmF1bHQucHJvY2VzcyBcdTUzOUZcdTVCNTAgcmVhZC1tb2RpZnktd3JpdGVcdUZGMENcdTY3NUNcdTdFRERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgc2V0dGluZ3Nba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeSh7IFtrZXldOiB2YWx1ZSB9LCBudWxsLCAyKSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsU2V0dGluZ3MoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8YW55IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICB9XG5cbiAgYXN5bmMgcHV0UHVyY2hhc2VIaXN0b3J5KGRhdGE6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTY1MzZcdTUxNjVcdTUzODZcdTUzRjIgKGluY29tZS1oaXN0b3J5Lmpzb24pIC0tLS1cblxuICBwcml2YXRlIGluY29tZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vaW5jb21lLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0SW5jb21lSGlzdG9yeSgpOiBQcm9taXNlPGFueSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG4gIH1cblxuICBhc3luYyBwdXRJbmNvbWVIaXN0b3J5KGRhdGE6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU1QkZDXHU1MUZBL1x1NUJGQ1x1NTE2NSAtLS0tXG5cbiAgYXN5bmMgZXhwb3J0QWxsRGF0YSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IFtkYXlzLCBnb2Fscywgc2V0dGluZ3MsIHB1cmNoYXNlSGlzdG9yeSwgaW5jb21lSGlzdG9yeV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmdldEFsbERheXMoKSxcbiAgICAgIHRoaXMuZ2V0R29hbHMoKSxcbiAgICAgIHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSxcbiAgICAgIHRoaXMuZ2V0UHVyY2hhc2VIaXN0b3J5KCksXG4gICAgICB0aGlzLmdldEluY29tZUhpc3RvcnkoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAnMy4wJyxcbiAgICAgIGV4cG9ydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHN0b3JhZ2VUeXBlOiAndmF1bHQnLFxuICAgICAgZGF5cyxcbiAgICAgIGdvYWxzLFxuICAgICAgc2V0dGluZ3MsXG4gICAgICBwdXJjaGFzZUhpc3RvcnksXG4gICAgICBpbmNvbWVIaXN0b3J5LFxuICAgICAgdGhlbWVzOiBbXSxcbiAgICAgIHJlcG9ydHM6IFtdLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBpbXBvcnREYXRhKGRhdGE6IGFueSwgb3B0aW9ucz86IHsgc3RyYXRlZ3k/OiAnb3ZlcndyaXRlJyB8ICdtZXJnZScgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBpZiAoZGF0YS5kYXlzKSB7XG4gICAgICBmb3IgKGNvbnN0IGRheSBvZiBPYmplY3QudmFsdWVzKGRhdGEuZGF5cykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXREYXkoZGF5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEuZ29hbHMpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoZGF0YS5nb2FscyBhcyBhbnlbXSk7XG4gICAgfVxuICAgIGlmIChkYXRhLnNldHRpbmdzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhkYXRhLnNldHRpbmdzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dFNldHRpbmcoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhLnB1cmNoYXNlSGlzdG9yeSkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRQdXJjaGFzZUhpc3RvcnkoZGF0YS5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5pbmNvbWVIaXN0b3J5KSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEluY29tZUhpc3RvcnkoZGF0YS5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjbGVhckFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIodGhpcy5iYXNlUGF0aCwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvLyAtLS0tIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAtLS0tXG5cbiAgcHJpdmF0ZSByZXZpZXdQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcmV2aWV3cy8ke2RhdGVLZXl9Lm1kYCk7XG4gIH1cblxuICBhc3luYyB3cml0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZywgbWFya2Rvd246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgbWFya2Rvd24pO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogTWFya2Rvd25TeW5jIC0gXHU1QzA2IERheURhdGEgSlNPTiBcdThGNkNcdTYzNjJcdTRFM0FcdTUzRUZcdThCRkJcdTc2ODQgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cblxuaW50ZXJmYWNlIERheURhdGEge1xuICBkYXRlOiBzdHJpbmc7XG4gIHdlZWtkYXk6IHN0cmluZztcbiAgbWV0cmljcz86IHtcbiAgICBmaXJzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgbGFzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgY29tcGxldGVkVGFza3M/OiBzdHJpbmc7XG4gICAgaW5zcGlyYXRpb25Db3VudD86IHN0cmluZztcbiAgICBhY3RpdmVUaW1lPzogc3RyaW5nO1xuICAgIGVtcHR5U2xvdHM/OiBzdHJpbmc7XG4gIH07XG4gIHRpbWVsaW5lPzogQXJyYXk8e1xuICAgIHBlcmlvZDogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0aW1lOiBzdHJpbmc7XG4gICAgaWNvbj86IHN0cmluZztcbiAgICBldmFsPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyB0aW1lOiBzdHJpbmc7IHRhc2s6IHN0cmluZzsgZXZhbD86IHN0cmluZyB9PjtcbiAgfT47XG4gIGdvYWxzPzogQXJyYXk8e1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBtZXRhPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHBlcmNlbnQ/OiBudW1iZXI7IGRldGFpbD86IHN0cmluZyB9PjtcbiAgfT47XG59XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blN5bmMge1xuICAvKiogXHU1QzA2IERheURhdGEgXHU4RjZDXHU2MzYyXHU0RTNBIE1hcmtkb3duICovXG4gIHN0YXRpYyBnZW5lcmF0ZU1hcmtkb3duKGRhdGE6IERheURhdGEpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gZnJvbnRtYXR0ZXJcdUZGMDhcdTUyQThcdTYwMDFcdTUwM0NcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdTUzMDVcdTg4RjlcdTk2MzJcdTZCNjIgWUFNTCBcdTZDRThcdTUxNjVcdUZGMDlcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKGBkYXRlOiBcIiR7ZGF0YS5kYXRlfVwiYCk7XG4gICAgbGluZXMucHVzaChgd2Vla2RheTogXCIke2RhdGEud2Vla2RheX1cImApO1xuICAgIGxpbmVzLnB1c2goJ3R5cGU6IEJhbWJvbyBJbW1vcnRhbHMnKTtcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFxuICAgIGxpbmVzLnB1c2goYCMgJHtkYXRhLmRhdGV9ICR7ZGF0YS53ZWVrZGF5fVx1NTkwRFx1NzZEOGApO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2MzA3XHU2ODA3XG4gICAgaWYgKGRhdGEubWV0cmljcykge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2MzA3XHU2ODA3Jyk7XG4gICAgICBjb25zdCBtID0gZGF0YS5tZXRyaWNzO1xuICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAobS5maXJzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1OTk5Nlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmZpcnN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmxhc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTY3MkJcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5sYXN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmNvbXBsZXRlZFRhc2tzKSBwYXJ0cy5wdXNoKGBcdTVCOENcdTYyMTBcdTRFRkJcdTUyQTE6ICR7bS5jb21wbGV0ZWRUYXNrc31gKTtcbiAgICAgIGlmIChtLmluc3BpcmF0aW9uQ291bnQpIHBhcnRzLnB1c2goYFx1NzA3NVx1NjExRjogJHttLmluc3BpcmF0aW9uQ291bnR9YCk7XG4gICAgICBpZiAobS5hY3RpdmVUaW1lKSBwYXJ0cy5wdXNoKGBcdTZEM0JcdThEQzNcdTY1RjZcdTk1N0Y6ICR7bS5hY3RpdmVUaW1lfWApO1xuICAgICAgaWYgKG0uZW1wdHlTbG90cykgcGFydHMucHVzaChgXHU3QTdBXHU3NjdEXHU2NUY2XHU2QkI1OiAke20uZW1wdHlTbG90c31gKTtcblxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDAsIDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgfVxuXG4gICAgLy8gXHU2NUY2XHU5NUY0XHU3RUJGXG4gICAgaWYgKGRhdGEudGltZWxpbmUgJiYgZGF0YS50aW1lbGluZS5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTY1RjZcdTk1RjRcdTdFQkYnKTtcbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgZGF0YS50aW1lbGluZSkge1xuICAgICAgICBjb25zdCBpY29uID0gYmxvY2suaWNvbiA/IGAke2Jsb2NrLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2Jsb2NrLm5hbWV9ICgke2Jsb2NrLnRpbWV9KWApO1xuICAgICAgICBpZiAoYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWxTdHIgPSBpdGVtLmV2YWwgPyBgIC0gJHtpdGVtLmV2YWx9YCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0udGltZX0gJHtpdGVtLnRhc2t9JHtldmFsU3RyfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTZcbiAgICBpZiAoZGF0YS5nb2FscyAmJiBkYXRhLmdvYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNicpO1xuICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGRhdGEuZ29hbHMpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGdvYWwuaWNvbiA/IGAke2dvYWwuaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7Z29hbC50aXRsZX1gKTtcbiAgICAgICAgaWYgKGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZ29hbC5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IGl0ZW0ucGVyY2VudCAhPT0gdW5kZWZpbmVkID8gYCAke2l0ZW0ucGVyY2VudH0lYCA6ICcnO1xuICAgICAgICAgICAgY29uc3QgZGV0YWlsID0gaXRlbS5kZXRhaWwgPyBgICgke2l0ZW0uZGV0YWlsfSlgIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS5uYW1lfSR7cGVyY2VudH0ke2RldGFpbH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgTWFya2Rvd25TeW5jIH0gZnJvbSAnLi4vc3RvcmFnZS9NYXJrZG93blN5bmMnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuXG4vKipcbiAqIFN0b3JhZ2VCcmlkZ2UgLSBcdTVDMDYgc3RvcmFnZToqIFx1NkQ4OFx1NjA2Rlx1NjYyMFx1NUMwNFx1NTIzMCBWYXVsdFN0b3JhZ2UgXHU2NENEXHU0RjVDXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yYWdlQnJpZGdlIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2U6IFZhdWx0U3RvcmFnZSwgZW5hYmxlTWFya2Rvd25TeW5jID0gdHJ1ZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgdGhpcy5lbmFibGVNYXJrZG93blN5bmMgPSBlbmFibGVNYXJrZG93blN5bmM7XG4gIH1cblxuICBhc3luYyBoYW5kbGUobWVzc2FnZTogQW55QnJpZGdlTWVzc2FnZSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZS5wdXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgYW55KTtcbiAgICAgICAgLy8gXHU1M0NDXHU1MTk5IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICAgICAgICBpZiAodGhpcy5lbmFibGVNYXJrZG93blN5bmMgJiYgbWVzc2FnZS5wYXlsb2FkLmRhdGEpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbWQgPSBNYXJrZG93blN5bmMuZ2VuZXJhdGVNYXJrZG93bihtZXNzYWdlLnBheWxvYWQuZGF0YSBhcyBhbnkpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLndyaXRlTWFya2Rvd25SZXZpZXcobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXksIG1kKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ01hcmtkb3duIHN5bmMgZmFpbGVkOicsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmxpc3REYXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxEYXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZGVsZXRlRGF5Jzoge1xuICAgICAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlTWFya2Rvd25SZXZpZXcobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZURheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRTZXR0aW5nKG1lc3NhZ2UucGF5bG9hZC5rZXksIG1lc3NhZ2UucGF5bG9hZC52YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbFNldHRpbmdzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEdvYWxzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEdvYWxzKG1lc3NhZ2UucGF5bG9hZC5nb2Fscyk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRQdXJjaGFzZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFB1cmNoYXNlSGlzdG9yeShtZXNzYWdlLnBheWxvYWQuZGF0YSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0SW5jb21lSGlzdG9yeSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEluY29tZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheUtleXMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheUtleXMoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlzUGFnaW5hdGVkJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlzUGFnaW5hdGVkKFxuICAgICAgICAgIChtZXNzYWdlIGFzIGFueSkucGF5bG9hZD8ucGFnZSA/PyAwLFxuICAgICAgICAgIChtZXNzYWdlIGFzIGFueSkucGF5bG9hZD8ucGFnZVNpemUgPz8gMzBcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpleHBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmV4cG9ydEFsbERhdGEoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTppbXBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmltcG9ydERhdGEobWVzc2FnZS5wYXlsb2FkLmRhdGEsIG1lc3NhZ2UucGF5bG9hZC5vcHRpb25zKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpjbGVhckFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXJBbGwoKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0b3JhZ2UgbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICB9XG4gIH1cbn1cbiIsICJcbi8qKlxuICogVGhlbWVCcmlkZ2UgLSBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHVGRjBDXHU2M0E4XHU5MDAxXHU1MjMwIGlmcmFtZVxuICogICAgICAgICAgICAgICsgXHU1M0NEXHU1NDExXHVGRjFBXHU2M0E1XHU2NTM2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTUwM0NcdUZGMENcdTZDRThcdTUxNjUgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtZUJyaWRnZSB7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBleHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIHByaXZhdGUgX3BhbGV0dGVTeW5jVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogXHU1QjU4XHU1MEE4XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTk1MkVcdTU0MERcdUZGMENcdTc1MjhcdTRFOEUgcmVzdG9yZURlZmF1bHRzIFx1NkUwNVx1NzQwNiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOSkVDVEVEX1ZBUlMgPSBbXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnLFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJyxcbiAgICAgICctLXRleHQtYWNjZW50JyxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeScsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScsXG4gICAgICAnLS10ZXh0LW5vcm1hbCcsXG4gICAgICAnLS10ZXh0LW11dGVkJyxcbiAgICBdO1xuXG4gICAgLyoqIFx1OTYzMlx1NjI5Nlx1N0FERVx1NjAwMVx1NjgwN1x1OEJCMFx1RkYxQXJlc3RvcmVEZWZhdWx0cyBcdTg4QUJcdThDMDNcdTc1MjhcdTU0MEVcdThCQkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTYzQlx1NkI2Mlx1NUVGNlx1OEZERlx1NTZERVx1OEMwM1x1ODk4Nlx1NTE5OSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdXBwcmVzc2VkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgYXR0YWNoSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGRldGFjaElmcmFtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NjYwRVx1NjY5N1x1NzJCNlx1NjAwMSAqL1xuICBpc0RhcmtNb2RlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU3MkI2XHU2MDAxICovXG4gIHB1c2hUaGVtZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG5cbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiAndGhlbWU6Y2hhbmdlZCcsXG4gICAgICAgIGlkOiAndGhlbWVfcHVzaF8nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgcGF5bG9hZDogeyBpc0Rhcms6IHRoaXMuaXNEYXJrTW9kZSgpIH0sXG4gICAgICB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTRGOUJcdTU5MTZcdTkwRThcdThDMDNcdTc1MjhcdUZGMUFPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDEgKi9cbiAgb25UaGVtZUNoYW5nZWQoKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoVGhlbWUoKTtcbiAgfVxuXG4gIC8vID09PT09IFx1NTNDQ1x1NTQxMVx1OEMwM1x1ODI3MiA9PT09PVxuXG4gIC8qKlxuICAgKiBcdThCQTFcdTdCOTcgd2ViYXBwIFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTYgXHUyMTkyIE9ic2lkaWFuIENTUyBcdTUzRDhcdTkxQ0ZcdTY2MjBcdTVDMDRcbiAgICogXHU0RUM1XHU4OTg2XHU3NkQ2IDMgXHU3QzdCXHU2ODM4XHU1RkMzXHU4MjcyXHVGRjA4XHU1RjNBXHU4QzAzL1x1ODBDQ1x1NjY2Ri9cdTY1ODdcdTVCNTdcdUZGMDlcdUZGMENcdTUxNzZcdTRGNTlcdTc1MzEgT2JzaWRpYW4gXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU2M0E4XHU3Qjk3XG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZU9ic2lkaWFuVmFycyhodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGNvbnN0IGggPSBNYXRoLnJvdW5kKGh1ZSk7XG4gICAgY29uc3QgbG8gPSBNYXRoLm1heCgtMzAsIE1hdGgubWluKDMwLCBsaWdodG5lc3NPZmZzZXQpKTtcblxuICAgIC8vIFx1NUYzQVx1OEMwM1x1ODI3MlxuICAgIGNvbnN0IGFjY2VudFMgPSA0MDtcbiAgICBjb25zdCBhY2NlbnRMID0gaXNEYXJrID8gNTAgOiA0MDtcbiAgICBjb25zdCBhY2NlbnQgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEx9JSlgO1xuICAgIGNvbnN0IGFjY2VudEhvdmVyID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMICsgNX0lKWA7XG5cbiAgICAvLyBcdTgwQ0NcdTY2NkZcdTgyNzJcbiAgICBjb25zdCBiZ1MgPSBpc0RhcmsgPyA4IDogMTI7XG4gICAgY29uc3QgYmdMID0gaXNEYXJrXG4gICAgICA/IE1hdGgubWF4KDUsIDEyICsgbG8gKiAwLjMpXG4gICAgICA6IE1hdGgubWluKDk4LCA5NCArIGxvICogMC4xNSk7XG4gICAgY29uc3QgYmdQcmltYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2JnTH0lKWA7XG4gICAgY29uc3QgYmdTZWNvbmRhcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7aXNEYXJrID8gYmdMICsgMyA6IGJnTCAtIDJ9JSlgO1xuXG4gICAgLy8gXHU2NTg3XHU1QjU3XHU4MjcyXG4gICAgY29uc3QgdGV4dE5vcm1hbCA9IGlzRGFyayA/IGBoc2woJHtofSwgNiUsIDg4JSlgIDogYGhzbCgke2h9LCA2JSwgMTIlKWA7XG4gICAgY29uc3QgdGV4dE11dGVkICA9IGlzRGFyayA/IGBoc2woJHtofSwgNCUsIDU1JSlgIDogYGhzbCgke2h9LCA0JSwgNDUlKWA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJzogYWNjZW50SG92ZXIsXG4gICAgICAnLS10ZXh0LWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeSc6IGJnUHJpbWFyeSxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JzogYmdTZWNvbmRhcnksXG4gICAgICAnLS10ZXh0LW5vcm1hbCc6IHRleHROb3JtYWwsXG4gICAgICAnLS10ZXh0LW11dGVkJzogdGV4dE11dGVkLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU4QzAzXHU4MjcyXHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKiA1MG1zIGRlYm91bmNlXHVGRjBDXHU5NjMyXHU2QjYyXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1NkVEMVx1NTc1N1x1NUZFQlx1OTAxRlx1NjJENlx1NjJGRFx1NEVBN1x1NzUxRlx1OUFEOFx1OTg5MSBET00gXHU1MTk5XHU1MTY1XG4gICAqL1xuICBhcHBseVBhbGV0dGUoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpO1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gZmFsc2U7IC8vIFx1NjVCMFx1OEMwM1x1ODI3Mlx1OEJGN1x1NkM0Mlx1NTIzMFx1Njc2NSBcdTIxOTIgXHU4OUUzXHU5NjY0XHU2MjkxXHU1MjM2XG4gICAgdGhpcy5fcGFsZXR0ZVN5bmNUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkKSByZXR1cm47IC8vIHJlc3RvcmVEZWZhdWx0cyBcdTU3MjhcdTk2MzJcdTYyOTZcdTdBOTdcdTUzRTNcdTUxODVcdTg4QUJcdThDMDNcdTc1MjhcbiAgICAgIGNvbnN0IHZhcnMgPSBUaGVtZUJyaWRnZS5jb21wdXRlT2JzaWRpYW5WYXJzKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFycykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvKiogXHU2RTA1XHU5NjY0XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTYwNjJcdTU5MEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5RUQ4XHU4QkE0XHU1MDNDICovXG4gIHN0YXRpYyByZXN0b3JlRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFRoZW1lQnJpZGdlLklOSkVDVEVEX1ZBUlMpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4vU3RvcmFnZUJyaWRnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4vVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuaW1wb3J0IHsgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLCBBVURJT19NSU1FX1RZUEVTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTY1RjZcdTg5ODFcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MEQgKi9cbmNvbnN0IFNLSVBfRElSUyA9IG5ldyBTZXQoWycub2JzaWRpYW4nLCAnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ10pO1xuXG4vKipcbiAqIEJyaWRnZVNlcnZpY2UgLSBwb3N0TWVzc2FnZSBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTRFMkRcdTVGQzNcbiAqXG4gKiBcdTc2RDFcdTU0MkMgaWZyYW1lIFx1NTNEMVx1Njc2NVx1NzY4NCBwb3N0TWVzc2FnZVx1RkYwQ1x1NTIwNlx1NTNEMVx1NTIzMFx1NUJGOVx1NUU5NFx1NTkwNFx1NzQwNlx1NkEyMVx1NTc1N1x1RkYwQ1xuICogXHU3MTM2XHU1NDBFXHU1QzA2XHU3RUQzXHU2NzlDXHU1NkRFXHU0RjIwXHU3RUQ5IGlmcmFtZVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQnJpZGdlU2VydmljZSB7XG4gICAgcHJpdmF0ZSBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlO1xuICAgIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICAgIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgoKSA9PiBQcm9taXNlPHZvaWQ+KSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGN1c3RvbVRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICAgIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgZXhwZWN0ZWRPcmlnaW4gPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlLFxuICAgICAgICB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2UsXG4gICAgICAgIHNldHRpbmdzPzogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgICAgIHNhdmVTZXR0aW5ncz86ICgpID0+IFByb21pc2U8dm9pZD5cbiAgICApIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlQnJpZGdlID0gc3RvcmFnZUJyaWRnZTtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZSA9IHRoZW1lQnJpZGdlO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3MgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3MgfHwgbnVsbDtcbiAgICB9XG5cbiAgLyoqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RTc2XHU1RjAwXHU1OUNCXHU3NkQxXHU1NDJDXHU2RDg4XHU2MDZGICovXG4gIGF0dGFjaChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgLy8gXHU5NjMyXHU2QjYyXHU5MUNEXHU1OTBEXHU3RUQxXHU1QjlBXG4gICAgdGhpcy5kZXRhY2goKTtcblxuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG5cbiAgICAvLyBcdThCQjBcdTVGNTUgZXhwZWN0ZWQgb3JpZ2luXHVGRjBDXHU3NTI4XHU0RThFXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgIHRoaXMub25NZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4XHVGRjA4XHU0RjlCXHU2M0QyXHU0RUY2XHU3QUVGXHU2MjZCXHU2M0NGXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0ICovXG4gIHNldE5vaXNlUGF0aChub2lzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubm9pc2VQYXRoID0gbm9pc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1NjIxNlx1NTE2OFx1NUU5M1x1NjI2Qlx1NjNDRlx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIF9zY2FuVmF1bHRBdWRpb0ZpbGVzKG1heERlcHRoID0gNSk6IFByb21pc2U8QXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhbGxvd2VkRXh0cyA9IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUztcbiAgICBjb25zdCBiYXNlUGF0aCA9IHRoaXMudmF1bHRCYXNlUGF0aDtcbiAgICBpZiAoIWJhc2VQYXRoKSByZXR1cm4gcmVzdWx0cztcblxuICAgIC8vIFx1NjhDMFx1NjdFNSBiYXNlUGF0aCBcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdUZGMDhcdTVGMDJcdTZCNjVcdUZGMDlcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChiYXNlUGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTYzMDdcdTVCOUFcdTRFODZcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUzRUFcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRFMERcdTkwMTJcdTVGNTJcdUZGMDlcbiAgICBpZiAodGhpcy5ub2lzZVBhdGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldERpciA9IHBhdGguam9pbihiYXNlUGF0aCwgdGhpcy5ub2lzZVBhdGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIodGFyZ2V0RGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUoKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KHBhdGguam9pbih0YXJnZXREaXIsIGVudHJ5Lm5hbWUpKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHBhdGguam9pbih0aGlzLm5vaXNlUGF0aCwgZW50cnkubmFtZSksIG5hbWU6IGVudHJ5Lm5hbWUsIHNpemU6IHN0YXQuc2l6ZSwgZXh0IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjcyQVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTE2OFx1NUU5M1x1OTAxMlx1NUY1Mlx1NjI2Qlx1NjNDRlx1RkYwOFx1NUYwMlx1NkI2NSArIFx1NkRGMVx1NUVBNlx1OTY1MFx1NTIzNlx1RkYwOVxuICAgIGNvbnN0IHNjYW5EaXIgPSBhc3luYyAoZGlyUGF0aDogc3RyaW5nLCByZWxhdGl2ZVByZWZpeDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgbGV0IGVudHJpZXM6IGZzLkRpcmVudFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZW50cmllcyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIoZGlyUGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgfSBjYXRjaCB7IHJldHVybjsgLyogc2tpcCB1bnJlYWRhYmxlIGRpcnMgKi8gfVxuXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgZW50cnkubmFtZSk7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlUHJlZml4ID8gcGF0aC5qb2luKHJlbGF0aXZlUHJlZml4LCBlbnRyeS5uYW1lKSA6IGVudHJ5Lm5hbWU7XG5cbiAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICBpZiAoU0tJUF9ESVJTLmhhcyhlbnRyeS5uYW1lKSkgY29udGludWU7XG4gICAgICAgICAgYXdhaXQgc2NhbkRpcihmdWxsUGF0aCwgcmVsYXRpdmVQYXRoLCBkZXB0aCArIDEpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpKSB7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcmVsYXRpdmVQYXRoLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgc2NhbkRpcihiYXNlUGF0aCwgJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxIGlmcmFtZVx1RkYwQ1x1NTA1Q1x1NkI2Mlx1NzZEMVx1NTQyQyAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVzc2FnZUhhbmRsZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gICAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aGVtZUJyaWRnZS5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtc2cgPSBldmVudC5kYXRhIGFzIEFueUJyaWRnZU1lc3NhZ2U7XG4gICAgaWYgKCFtc2cgfHwgIW1zZy50eXBlIHx8ICFtc2cuaWQpIHJldHVybjtcblxuICAgIC8vIFx1NjgyMVx1OUE4Q1x1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1RkYxQXNvdXJjZSArIG9yaWdpbiBcdTUzQ0NcdTkxQ0RcdTlBOENcdThCQzFcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgZXZlbnQuc291cmNlICE9PSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmV4cGVjdGVkT3JpZ2luICYmIGV2ZW50Lm9yaWdpbiAhPT0gdGhpcy5leHBlY3RlZE9yaWdpbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQnJpZGdlU2VydmljZV0gSWdub3JlZCBtZXNzYWdlIGZyb20gdW5rbm93biBvcmlnaW46JywgZXZlbnQub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTUyNERcdTdGMDBcbiAgICBpZiAoIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3N0b3JhZ2U6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2FwcDonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnZmlsZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgndGhlbWU6JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcdTZEODhcdTYwNkZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgLy8gXHU2MjhBXHU2MzAxXHU0RTQ1XHU1MzE2XHU3Njg0IHNlY3Rpb25Db25maWdcdTMwMDFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTU0OENcdTgxRUFcdTVCOUFcdTRFNDlcdTk3RjNcdTZFOTBcdTk2OEYgcmVhZHkgXHU1NENEXHU1RTk0XHU1M0QxXHU3RUQ5IHdlYmFwcFxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncz8uc2VjdGlvbkNvbmZpZyB8fCBudWxsLFxuICAgICAgICBjdXN0b21UaGVtZXM6IHRoaXMuY3VzdG9tVGhlbWVzLFxuICAgICAgICBjdXN0b21Ob2lzZXM6IHRoaXMuc2V0dGluZ3M/Lm5vaXNlSXRlbXMgfHwgW10sXG4gICAgICAgIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogdGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmNsb3NlJykge1xuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkVcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZVNlY3Rpb25Db25maWcnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnNlY3Rpb25Db25maWcgPSBtc2cucGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVDdXN0b21Ob2lzZXMnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLm5vaXNlSXRlbXMgPSBtc2cucGF5bG9hZCBhcyB1bmtub3duW10gfHwgW107XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU0RTNCXHU5ODk4XHU1MjA3XHU2MzYyXHU4QkY3XHU2QzQyXHVGRjA4aWZyYW1lIFx1MjE5MiBPYnNpZGlhblx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDp0b2dnbGVUaGVtZScpIHtcbiAgICAgIGNvbnN0IHRhcmdldElzRGFyayA9IChtc2cucGF5bG9hZCBhcyB7IGlzRGFyazogYm9vbGVhbiB9KS5pc0RhcmsgPT09IHRydWU7XG4gICAgICBjb25zdCBjdXJyZW50SXNEYXJrID0gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgICAgIGlmICh0YXJnZXRJc0RhcmsgIT09IGN1cnJlbnRJc0RhcmspIHtcbiAgICAgICAgaWYgKHRhcmdldElzRGFyaykge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWxpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU5MDFBXHU3N0U1IGlmcmFtZSBcdTRFM0JcdTk4OThcdTVERjJcdTUyMDdcdTYzNjJcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUsIGlzRGFyazogdGFyZ2V0SXNEYXJrIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1OEJGN1x1NkM0Mlx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAndGhlbWU6c3luY1BhbGV0dGUnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuKSB7XG4gICAgICAgIGNvbnN0IHsgaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayB9ID0gKG1zZyBhcyBhbnkpLnBheWxvYWQ7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UuYXBwbHlQYWxldHRlKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdUZGMUFcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjYgPT09PT1cblxuICAgIC8vIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1NjI0MFx1NjcwOVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NEY5QiB3ZWJhcHAgXHU2NTg3XHU0RUY2XHU5MDA5XHU2MkU5XHU1NjY4XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjBDXHU4QkY3XHU1QzFEXHU4QkQ1XHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU5NzYyXHU2NzdGJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKSBcdTUxODVcdTkwRThcdTVERjJcdTVGMDJcdTZCNjVcdTY4QzBcdTY3RTVcdThERUZcdTVGODRcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLl9zY2FuVmF1bHRBdWRpb0ZpbGVzKCk7XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29dIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3XHU1RTkzXHU1MTg1XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUyMDE0IFx1OEZENFx1NTZERVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTI0RFx1N0FFRlx1NzZGNFx1NjNBNSBmZXRjaCBmaWxlOi8vXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NCcpO1xuICAgICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdThERUZcdTVGODRcdTY3MkFcdTkwMDNcdTkwMzhcdTUxRkEgdmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh2YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyXHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoOiBmdWxsUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShyZWxhdGl2ZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU2NzJDXHU1NzMwXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU1NkRFXHU0RjIwXHU4REVGXHU1Rjg0XHU3NTMxXHU1MjREXHU3QUVGXHU3NTI4IGZpbGU6Ly8gXHU1MkEwXHU4RjdEXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIWZpbGVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuICAgICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTYyRDJcdTdFRERcdTUzMDVcdTU0MkJcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTVCNTdcdTdCMjZcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoLCBleHQpIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yLm1lc3NhZ2UgfHwgJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2RlxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2VCcmlkZ2UuaGFuZGxlKG1zZyk7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY4MzlcdTYzNkVcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcdTgzQjdcdTUzRDYgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbiAgcHJpdmF0ZSBfZ2V0QXVkaW9NaW1lVHlwZShleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEFVRElPX01JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NjIxMFx1NTI5Rlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmQoaWQ6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgcGF5bG9hZCB9LCAnKicpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZEVycm9yKGlkOiBzdHJpbmcsIGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBlcnJvciB9LCAnKicpO1xuICB9XG59XG4iLCAiLyoqIFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NUI4Q1x1NjU3NFx1NTIxN1x1ODg2OFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyA9IFtcbiAgJy5tcDMnLCAnLndhdicsICcub2dnJywgJy5mbGFjJywgJy5hYWMnLCAnLm00YScsICcud21hJywgJy53ZWJtJywgJy5vcHVzJyxcbl07XG5cbi8qKiBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MEQgXHUyMTkyIE1JTUUgXHU3QzdCXHU1NzhCICovXG5leHBvcnQgY29uc3QgQVVESU9fTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5tcDMnOiAgJ2F1ZGlvL21wZWcnLFxuICAnLndhdic6ICAnYXVkaW8vd2F2JyxcbiAgJy5vZ2cnOiAgJ2F1ZGlvL29nZycsXG4gICcuZmxhYyc6ICdhdWRpby9mbGFjJyxcbiAgJy5hYWMnOiAgJ2F1ZGlvL2FhYycsXG4gICcubTRhJzogICdhdWRpby9tcDQnLFxuICAnLndtYSc6ICAnYXVkaW8veC1tcy13bWEnLFxuICAnLndlYm0nOiAnYXVkaW8vd2VibScsXG4gICcub3B1cyc6ICdhdWRpby9vcHVzJyxcbn07XG5cbi8qKiBcdTVCOENcdTY1NzQgTUlNRSBcdTdDN0JcdTU3OEJcdTY2MjBcdTVDMDRcdUZGMDhcdTU0MkIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IE1JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcuaHRtbCc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmNzcyc6ICAndGV4dC9jc3M7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcubWpzJzogICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qc29uJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAnLnBuZyc6ICAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAgJ2ltYWdlL2pwZWcnLFxuICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICcuZ2lmJzogICdpbWFnZS9naWYnLFxuICAnLnN2Zyc6ICAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcuaWNvJzogICdpbWFnZS94LWljb24nLFxuICAnLndvZmYnOiAnZm9udC93b2ZmJyxcbiAgJy53b2ZmMic6J2ZvbnQvd29mZjInLFxuICAnLnR0Zic6ICAnZm9udC90dGYnLFxuICAuLi5BVURJT19NSU1FX1RZUEVTLFxufTtcbiIsICJpbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG5ldCBmcm9tICduZXQnO1xuaW1wb3J0IHsgTUlNRV9UWVBFUywgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcblxuLyoqXG4gKiBMb2NhbFNlcnZlciAtIFx1NjcyQ1x1NTczMCBIVFRQIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjcwRFx1NTJBMVx1NTY2OFxuICpcbiAqIFx1NTcyOCBPYnNpZGlhbiAoRWxlY3Ryb24pIFx1NzNBRlx1NTg4M1x1NEUyRFx1NTQyRlx1NTJBOFx1NEUwMFx1NEUyQVx1NjcyQ1x1NTczMCBIVFRQIFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1xuICogXHU0RTNBIGlmcmFtZSBcdTYzRDBcdTRGOUIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NjcwRFx1NTJBMVx1RkYwQ1x1N0VENVx1OEZDNyBhcHA6Ly8gXHU1MzRGXHU4QkFFXHU3Njg0XHU5NjUwXHU1MjM2XHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFNlcnZlciB7XG4gIHByaXZhdGUgc2VydmVyOiBodHRwLlNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHBvcnQgPSAwO1xuICBwcml2YXRlIHdlYmFwcERpcjogc3RyaW5nO1xuICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKHdlYmFwcERpcjogc3RyaW5nKSB7XG4gICAgdGhpcy53ZWJhcHBEaXIgPSB3ZWJhcHBEaXI7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RjlCIC9iYW1ib28tYXVkaW8gXHU5N0YzXHU5ODkxXHU0RUUzXHU3NDA2XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHNldFZhdWx0QmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMudmF1bHRCYXNlUGF0aCA9IGJhc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1x1OEZENFx1NTZERVx1NzZEMVx1NTQyQ1x1N0FFRlx1NTNFMyAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLnNlcnZlcikgcmV0dXJuIHRoaXMucG9ydDtcblxuICAgIHRoaXMucG9ydCA9IGF3YWl0IHRoaXMuZmluZEZyZWVQb3J0KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KHJlcSwgcmVzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFNlcnZlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5saXN0ZW4odGhpcy5wb3J0LCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gTG9jYWwgc2VydmVyIHN0YXJ0ZWQgb24gcG9ydCAke3RoaXMucG9ydH1gKTtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnBvcnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU1MDVDXHU2QjYyXHU2NzBEXHU1MkExXHU1NjY4ICovXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RvcHBlZCcpO1xuICAgICAgICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnBvcnQgPSAwO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2NzBEXHU1MkExXHU1NjY4IFVSTCAqL1xuICBnZXRVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGh0dHA6Ly8xMjcuMC4wLjE6JHt0aGlzLnBvcnR9YDtcbiAgfVxuXG4gIC8qKiBcdTU5MDRcdTc0MDYgSFRUUCBcdThCRjdcdTZDNDIgKi9cbiAgcHJpdmF0ZSBoYW5kbGVSZXF1ZXN0KHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSk6IHZvaWQge1xuICAgIC8vIC9iYW1ib28tYXVkaW8/cGF0aD14eHggXHUyMDE0IFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NEVFM1x1NzQwNlx1RkYwQ1x1N0VENVx1OEZDNyBwb3N0TWVzc2FnZSBcdTU5MjcgcGF5bG9hZCBcdTk2NTBcdTUyMzZcbiAgICBjb25zdCB1cmwgPSByZXEudXJsIHx8ICcvJztcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9iYW1ib28tYXVkaW8nKSkge1xuICAgICAgdGhpcy5oYW5kbGVBdWRpb1Byb3h5KHJlcSwgcmVzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTg5RTNcdTY3OTAgVVJMXHVGRjBDXHU1M0JCXHU5NjY0XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXG4gICAgbGV0IHVybFBhdGggPSB1cmwuc3BsaXQoJz8nKVswXTtcbiAgICAvLyBcdTc2RUVcdTVGNTVcdTlFRDhcdThCQTRcdTY1ODdcdTRFRjZcbiAgICBpZiAodXJsUGF0aC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICB1cmxQYXRoICs9ICdpbmRleC5odG1sJztcbiAgICB9XG4gICAgY29uc3Qgc2FmZVBhdGggPSBwYXRoLm5vcm1hbGl6ZSh1cmxQYXRoKS5yZXBsYWNlKC9eKFxcLlxcLltcXC9cXFxcXSkrLywgJycpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMud2ViYXBwRGlyLCBzYWZlUGF0aCk7XG5cbiAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTU3Mjggd2ViYXBwRGlyIFx1NTE4NVxuICAgIGlmICghZmlsZVBhdGguc3RhcnRzV2l0aCh0aGlzLndlYmFwcERpcikpIHtcbiAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTtcbiAgICAgIHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGZzLnN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICBpZiAoZXJyIHx8ICFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XG4gICAgICAgIHJlcy5lbmQoJ05vdCBGb3VuZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RSBNSU1FIFx1N0M3Qlx1NTc4QlxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSBNSU1FX1RZUEVTW2V4dF0gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NEUwRFx1OTcwMFx1ODk4MSBDT1JTXHVGRjBDaWZyYW1lIFx1NEUwRVx1NjcwRFx1NTJBMVx1NTY2OFx1NTQwQ1x1NkU5MFx1RkYwOVxuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScsXG4gICAgICB9KTtcblxuICAgICAgLy8gXHU2RDQxXHU1RjBGXHU0RjIwXHU4RjkzXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoKTtcbiAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU2RDQxXHU1RjBGXHU0RUUzXHU3NDA2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9Qcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5U3RyKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhcmFtcy5nZXQoJ3BhdGgnKTtcbiAgICAgIGlmICghcmVsYXRpdmVQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NTNFQVx1NTE0MVx1OEJCOFx1NjMwN1x1NUI5QVx1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IHVuc3VwcG9ydGVkIGF1ZGlvIGZvcm1hdCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc5ODFcdTZCNjJcdThERUZcdTVGODRcdTdBN0ZcdThEOEFcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBwYXRoLm5vcm1hbGl6ZShyZWxhdGl2ZVBhdGgpLnJlcGxhY2UoL14oXFwuXFwuW1xcL1xcXFxdKSsvLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcuLicpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTsgcmVzLmVuZCgnVmF1bHQgYmFzZSBwYXRoIG5vdCBjb25maWd1cmVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCBub3JtYWxpemVkKTtcbiAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnMuc3RhdChmdWxsUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7IHJlcy5lbmQoJ0ZpbGUgbm90IGZvdW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBzdGF0cy5zaXplLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmdWxsUGF0aCk7XG4gICAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIHJlcy5lbmQoJ1N0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gcHJveHkgZXJyb3I6JywgZSk7XG4gICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY3RTVcdTYyN0VcdTUzRUZcdTc1MjhcdTdBRUZcdTUzRTMgKi9cbiAgcHJpdmF0ZSBmaW5kRnJlZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgc2VydmVyLmxpc3RlbigwLCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3J0ID0gKHNlcnZlci5hZGRyZXNzKCkgYXMgbmV0LkFkZHJlc3NJbmZvKS5wb3J0O1xuICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4gcmVzb2x2ZShwb3J0KSk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59IiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcblxuLyoqIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyAqL1xuZXhwb3J0IGludGVyZmFjZSBCYW1ib29SZXZpZXdTZXR0aW5ncyB7XG4gIC8qKiBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdTY4MzlcdThERUZcdTVGODQgKi9cbiAgZGF0YVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEgKi9cbiAgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuICAvKiogXHU2NzdGXHU1NzU3XHU3QkExXHU3NDA2XHU5MTREXHU3RjZFXHVGRjA4XHU1M0VGXHU4OUMxXHU2MDI3ICsgXHU2MzkyXHU1RThGXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFIHdlYmFwcCBpZnJhbWUgbG9jYWxTdG9yYWdlIFx1NEUwRFx1NTNFRlx1OTc2MFx1NjVGNlx1NjMwMVx1NEU0NVx1NTMxNiAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbDtcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOSAqL1xuICB0aGVtZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5M1x1RkYwOSAqL1xuICBub2lzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NTIxN1x1ODg2OFx1RkYwOFx1OTAxQVx1OEZDN1x1Njg2NVx1NjNBNVx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwQ1x1NTE0Qlx1NjcwRCBsb2NhbFN0b3JhZ2UgcG9ydC1zY29wZWQgXHU5NUVFXHU5ODk4XHVGRjA5ICovXG4gIG5vaXNlSXRlbXM6IGFueVtdO1xuICAvKiogXHU2NjJGXHU1NDI2XHU1QzA2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyICovXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEJhbWJvb1Jldmlld1NldHRpbmdzID0ge1xuICBkYXRhUGF0aDogJ2JhbWJvby1yZXZpZXcnLFxuICBlbmFibGVNYXJrZG93blN5bmM6IHRydWUsXG4gIHNlY3Rpb25Db25maWc6IG51bGwsXG4gIHRoZW1lUGF0aDogJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcsXG4gIG5vaXNlUGF0aDogJycsXG4gIG5vaXNlSXRlbXM6IFtdLFxuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGZhbHNlLFxufTtcblxuLyoqXG4gKiBQbHVnaW5TZXR0aW5ncyAtIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2V0dGluZ3MgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctc2V0dGluZ3MnKTtcblxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScgfSk7XG5cbiAgICAvLyA9PT0gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4ID09PVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcgfSk7XG5cbiAgICAvLyBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODRcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NTcyOCBWYXVsdCBcdTRFMkRcdTc2ODRcdTVCNThcdTUwQThcdTc2RUVcdTVGNTVcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2JhbWJvby1yZXZpZXcnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aCA9IHZhbHVlIHx8ICdiYW1ib28tcmV2aWV3JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gTWFya2Rvd24gXHU2NDU4XHU4OTgxXHU1NDBDXHU2QjY1XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MScpXG4gICAgICAuc2V0RGVzYygnXHU2QkNGXHU2QjIxXHU0RkREXHU1QjU4XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1NzI4IHJldmlld3MvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzUxRlx1NjIxMFx1NTNFRlx1OEJGQlx1NzY4NCAubWQgXHU2NTg3XHU0RUY2JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCA9PT1cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTVCNThcdTY1M0VcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggLmpzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aCA9IHZhbHVlIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU3NjdEXHU1NjZBXHU5N0YzID09PVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NzY3RFx1NTY2QVx1OTdGMycgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzknKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NjMwN1x1NUI5QVx1NTQwRVx1NEVDNVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1NTE4NVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1MzAwMlx1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NjU3NFx1NEUyQVx1NUU5M1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3NjdEXHU1NjZBXHU5N0YzIFx1NjIxNlx1NzU1OVx1N0E3QVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5MycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGggPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTggPT09XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4JyB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NUMwNlx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDd2ViYXBwIFx1NTE4NVx1NjBBQ1x1NkQ2RVx1ODNEQ1x1NTM1NVx1NzY4NFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdThDMDNcdTgyNzJcdTRGMUFcdTVCOUVcdTY1RjZcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU3Njg0XHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHU5MTREXHU4MjcyJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NUVEXHU2NUY2XHU2MDYyXHU1OTBEIE9ic2lkaWFuIFx1OUVEOFx1OEJBNFx1OTE0RFx1ODI3MlxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1OTAxQVx1NzdFNSB3ZWJhcHAgXHU4QkJFXHU3RjZFXHU1REYyXHU1M0Q4XHU2NkY0XHVGRjA4XHU0RjdGXHU1MTc2XHU4REYzXHU4RkM3IHBvc3RNZXNzYWdlXHVGRjBDXHU5MDdGXHU1MTREXHU2NUUwXHU2NTQ4XHU2RDQxXHU5MUNGXHVGRjA5XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5iYW1ib28tcmV2aWV3LWZyYW1lJykgYXMgSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsO1xuICAgICAgICAgICAgaWYgKGZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBlbmFibGVkOiB2YWx1ZSB9XG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTUxNzNcdTRFOEVcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTUxNzNcdTRFOEUnIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAxXHVGRjFBXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBsdWdpbkJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdigpO1xuICAgIHBsdWdpbkJveC5zdHlsZS5wYWRkaW5nID0gJzE0cHggMTZweCc7XG4gICAgcGx1Z2luQm94LnN0eWxlLmJvcmRlclJhZGl1cyA9ICcxMHB4JztcbiAgICBwbHVnaW5Cb3guc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSknO1xuICAgIHBsdWdpbkJveC5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkIHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKSc7XG4gICAgcGx1Z2luQm94LnN0eWxlLm1hcmdpblRvcCA9ICc4cHgnO1xuXG4gICAgY29uc3QgcGx1Z2luVGl0bGUgPSBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InIH0pO1xuICAgIHBsdWdpblRpdGxlLnN0eWxlLmZvbnRTaXplID0gJzExcHgnO1xuICAgIHBsdWdpblRpdGxlLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRleHQtZmFpbnQpJztcbiAgICBwbHVnaW5UaXRsZS5zdHlsZS50ZXh0VHJhbnNmb3JtID0gJ3VwcGVyY2FzZSc7XG4gICAgcGx1Z2luVGl0bGUuc3R5bGUubGV0dGVyU3BhY2luZyA9ICcwLjZweCc7XG4gICAgcGx1Z2luVGl0bGUuc3R5bGUuZm9udFdlaWdodCA9ICc2MDAnO1xuICAgIHBsdWdpblRpdGxlLnN0eWxlLm1hcmdpbiA9ICcwIDAgOHB4IDAnO1xuXG4gICAgY29uc3QgZGVzY0VsID0gcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ0JhbWJvbyBJbW1vcnRhbHNcdUZGMDhcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdUZGMDlcdTY2MkZcdTRFMDBcdTZCM0VcdTU3RkFcdTRFOEVcdTgyQ0ZcdTgwNTRcdTYzQTdcdTUyMzZcdThCQkFcdTRFNEJcdTcyMzZcdTdFRjRcdTUxNEJcdTYyNThcdTAwQjdcdTY4M0NcdTUzNjJcdTRFQzBcdTc5RDFcdTU5MkJcdTYzRDBcdTUxRkFcdTc2ODRcIk9HQVNcIlx1NzQwNlx1NUZGNVx1RkYwQ1x1NEUxM1x1NEUzQVx1NEUyQVx1NEVCQVx1NjI1M1x1OTAyMFx1NzY4NFx1NEUyRFx1NTZGRFx1OThDRVx1NzZFRVx1NjgwN1x1ODFFQVx1NTJBOFx1NTMxNlx1NTIwNlx1OTE0RFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlx1MzAwMicsXG4gICAgfSk7XG4gICAgZGVzY0VsLnN0eWxlLmZvbnRTaXplID0gJzEyLjVweCc7XG4gICAgZGVzY0VsLnN0eWxlLmxpbmVIZWlnaHQgPSAnMS43JztcbiAgICBkZXNjRWwuc3R5bGUuY29sb3IgPSAndmFyKC0tdGV4dC1tdXRlZCknO1xuICAgIGRlc2NFbC5zdHlsZS5tYXJnaW4gPSAnMCc7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCk7XG4gICAgYXV0aG9yQm94LnN0eWxlLnBhZGRpbmcgPSAnMTRweCAxNnB4JztcbiAgICBhdXRob3JCb3guc3R5bGUuYm9yZGVyUmFkaXVzID0gJzEwcHgnO1xuICAgIGF1dGhvckJveC5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KSc7XG4gICAgYXV0aG9yQm94LnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpJztcbiAgICBhdXRob3JCb3guc3R5bGUubWFyZ2luVG9wID0gJzEwcHgnO1xuICAgIGF1dGhvckJveC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgIGF1dGhvckJveC5zdHlsZS5mbGV4RGlyZWN0aW9uID0gJ2NvbHVtbic7XG4gICAgYXV0aG9yQm94LnN0eWxlLmdhcCA9ICcxMnB4JztcblxuICAgIC8vIFx1NEY1Q1x1ODAwNVx1ODg0Q1x1RkYwOFx1NTkzNFx1NTBDRiArIFx1NTlEM1x1NTQwRCArIFx1ODlEMlx1ODI3Mlx1RkYwQ1x1NkEyQVx1NTQxMVx1RkYwOVxuICAgIGNvbnN0IGF1dGhvclJvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoKTtcbiAgICBhdXRob3JSb3cuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICBhdXRob3JSb3cuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xuICAgIGF1dGhvclJvdy5zdHlsZS5nYXAgPSAnMTJweCc7XG5cbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KCk7XG4gICAgYXZhdGFyLnN0eWxlLndpZHRoID0gJzQ0cHgnO1xuICAgIGF2YXRhci5zdHlsZS5oZWlnaHQgPSAnNDRweCc7XG4gICAgYXZhdGFyLnN0eWxlLmJvcmRlclJhZGl1cyA9ICc1MCUnO1xuICAgIGF2YXRhci5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKGRhdGE6aW1hZ2UvanBlZztiYXNlNjQsLzlqLzRBQVFTa1pKUmdBQkFRQUFBUUFCQUFELzJ3QkRBQVlFQlFZRkJBWUdCUVlIQndZSUNoQUtDZ2tKQ2hRT0R3d1FGeFFZR0JjVUZoWWFIU1VmR2hzakhCWVdJQ3dnSXlZbktTb3BHUjh0TUMwb01DVW9LU2ovMndCREFRY0hCd29JQ2hNS0NoTW9HaFlhS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDai93QUFSQ0FLQUFvQURBU0lBQWhFQkF4RUIvOFFBSHdBQUFRVUJBUUVCQVFFQUFBQUFBQUFBQUFFQ0F3UUZCZ2NJQ1FvTC84UUF0UkFBQWdFREF3SUVBd1VGQkFRQUFBRjlBUUlEQUFRUkJSSWhNVUVHRTFGaEJ5SnhGREtCa2FFSUkwS3h3UlZTMGZBa00ySnlnZ2tLRmhjWUdSb2xKaWNvS1NvME5UWTNPRGs2UTBSRlJrZElTVXBUVkZWV1YxaFpXbU5rWldabmFHbHFjM1IxZG5kNGVYcURoSVdHaDRpSmlwS1RsSldXbDVpWm1xS2pwS1dtcDZpcHFyS3p0TFcydDdpNXVzTER4TVhHeDhqSnl0TFQxTlhXMTlqWjJ1SGk0K1RsNXVmbzZlcng4dlAwOWZiMytQbjYvOFFBSHdFQUF3RUJBUUVCQVFFQkFRQUFBQUFBQUFFQ0F3UUZCZ2NJQ1FvTC84UUF0UkVBQWdFQ0JBUURCQWNGQkFRQUFRSjNBQUVDQXhFRUJTRXhCaEpCVVFkaGNSTWlNb0VJRkVLUm9iSEJDU016VXZBVlluTFJDaFlrTk9FbDhSY1lHUm9tSnlncEtqVTJOemc1T2tORVJVWkhTRWxLVTFSVlZsZFlXVnBqWkdWbVoyaHBhbk4wZFhaM2VIbDZnb09FaFlhSGlJbUtrcE9VbFphWG1KbWFvcU9rcGFhbnFLbXFzck8wdGJhM3VMbTZ3c1BFeGNiSHlNbkswdFBVMWRiWDJObmE0dVBrNWVibjZPbnE4dlAwOWZiMytQbjYvOW9BREFNQkFBSVJBeEVBUHdENVVvb29vQUtLS0tBQ2lpaWdBb29vOUtBQ2lpajBvQUtLS1BTZ0Fvb29vQUtLS0tBQ2lpajBvQUtLS1hGQUNVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkxpZ1V0QURhS1drb0FLVWRLU2xGQUNpa05MU0dnQktLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb3BSUUFsRkxpa29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUZGRkxTR2dCS0tLS0FDbEZKVGhRQWxKVHFiUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQW9wYVFVdEFDVWxMU1VBRktLU2xGQUMwaG9vb0FTaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BV2xwQlMwQUZOcDFJYUFFb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0FwUUtCVGhRQUNrTk94VFdvQWJSUlJRQVU0VTJuQ2dBcEtkVFRRQWxGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBS0tXa0ZMUUFsSlRxYlFBVW9wS1VVQUZGRkpRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZLS0FGRkxTQ2xvQUthYWRTR2dCdEZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVdEFDaWxwQlMwQUxTR2xwRFFBeWlpaWdBcHdwdE9XZ0JhU2xwS0FHMFV0SlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFDaWxwdEtLQUZwdE9wS0FFcFJTVW9vQVdrTkxTR2dCS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29wYUFFb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLVVVsS0tBRkZMU0Nsb0FLUTB0SWFBRzBVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlNpa3BSUUE0VW9wS0JRQXRJYVdrTkFES0tLS0FDbkxUYVVVQU9vb29vQVNtMDQwMmdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDbDdVbEtLQUNpbHBEUUFsS0tTblVBRkpTMGRxQUcwVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJTaWtwd29BU2tweHB0QUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJTaWtwUlFBb3BhU2xGQUJTR2xwRFFBMmlpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS1VVbEZBRGhTaWtGS0tBRm9OS0tRMEFNcEtVMGxBQlNpa3BSUUE2aWlpZ0JLYlRxU2dCS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBcGFCUzBBQXBEU2lnMEFKUzBsTFFBVVVDbG9BYlNVcHBLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fwd3BCU2lnQXBNVTZrb0FiUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrcFJRQW9wYVFVdEFCVFRUcVEwQU5vb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQlIwcHdwb3B3b0FXZzBDanRRQXcwbEthU2dBcFJTVW9vQWRSU1VVQUZOcGFTZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUZGTFNDbEZBQUtEUzBob0FTbHBLQlFBcHBhUVV0QURUU1VwcEtBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQlJUaFRSVGhRQVVsTFRUUUFsRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlM0b3hRQWxGRkZBQlJSUlFBVVVVVUFGRkZGQUJTbWtwUlFBb3BhS0tBQ2tOTFNHZ0J0RkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUtLY0thS2NLQUZvcGFRMEFNTkpTbWtvQUtVVWxLS0FGcEtXa29BS1NpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FGRktLUVVvb0FXa05MUlFBeWlscEtBQ2x6U1VVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQXBwMU1wd29BV20wcHBLQUVvb29vQUtLS0tBQ2lpaWdBcFJTVW9vQVdpaWlnQktTbHBLQUNpaWlnQW9vb29BS0tLS0FDbEZKU2lnQjFGRkxRQWxCcGFRMEFNb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0JSVGhUUlR4UUFvb05LS1NnQmhwdE9OTm9BS1VVbEtLQUZwS1dpZ0JLU2xwS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FVVW9wQlNpZ0JhS0tLQUcwbExTVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZPRk5wUWFBRk5OcGMwbEFCUlJSUUFVVVVVQUZGRkZBQlNpa3BSUUFVdEZKUUFVbExTVUFGRkZGQUJSUlJRQVVVVVVBRktLU2xGQURoUzAwVTRVQUxUVFRxUTBBUjBVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBNWFjS2FLY0tBSENrSXBhS0FJelRhY2FiUUFVb3BLS0FIQ2lrRkxRQWxKUzBsQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUtLWE5KUUtBRnpRYUtLQUcwVVVVQUZGS0tXZ0J0RkxTVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGS0tTbEZBQzBVVVVBSlNVdEpRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQU9GT0ZORktLQUhZcERTaWtOQUVkRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQU9XbkNtclR4UUF0SlMwbEFERFRhY2FiUUFVVVVVQU9vb0ZGQUNVbExTVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFvcGFRVW9vQUtTbG9vQWJSUlJRQW9wUlNDbG9BUTBsTFNVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZPcHRPb0FLS0JSaWdCS1NsTkpRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUtLY0tRVW9vQWRTR2dVR2dDT2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FITFR4VEJUeFFBdEZBb29BWWFaVHpUYUFFb29vb0FVVXRBcGFBR21rcDFKUUFsRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFvcFJTQ25DZ0FwRFMwZHFBR1VVdEpRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCVGhUYWRRQW9wS0tLQUVwS1drb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FGRk9GTkZPb0FXZzBDaWdDT2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS1VVbEZBRHhUaFRCVHhRQTZrTkZGQUREVGFlYVpRQWxGRktLQUZGRkFwYUFFcEtXa29BU2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BVVU0VTBVb29BV2lpaWdCdEpTMGxBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGT05OcHdvQVdrcGFTZ0JEU1V0SlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBS0tjS2FLZFFBb29OQW9vQWpvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQnkwOFV3VTRVQU9GRkFvb0FhYVlhZWFhYUFHMFVVVUFPRkxTQ2xvQVEwbExTVUFKUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGT0Zhdmh6dzNxM2lPN0Z2bzFqTmN2a0JtVmZrVFBkbTZDdmRQQ1A3UEVSVlp2RTJxTXg2bUMwRzBENnNSeitRb0ErZDZWVloyQ29wWmowQUdhKzM5QStGL2d6U0kxVzIwT3prY0RtUzVYem1QNHZuOUs3Q3pzdFAwaTMvQU5BczdhMlgwaGlWQitnb0ErQTRmRE91engrWkRvdXB5Ui8za3RYSS9QRlVackc3aGQwbXRaNDNUaGxlTWdqNjEramR0Y3RJdVE0L0NyQ25jUVg1STZHZ0Q4MUNDRGdqQnBLL1NhOTAreDFDUHlyK3l0N21NOVZtaVZ4K29yaS9FUHdkOEQrSVVrRnhvVUZwTjJtc3YzREQ4RitVL2lEUUI4RzBWOUtlTnYyWXJtSU5QNE4xVVhDZ0UvWmI3Q3Qvd0Z3TUg4UVByWGdmaWZ3enJQaGUvTmw0ZzA2NHNiam5BbFhoZ082c09HSHVDYUFNZWlpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBRkZLS1FVNGRLQUNpaWtvQVEwbExTVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFDaW5DbWluQ2dCMUlhQlFhQUk2S0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQVVVOFV4YWVLQUZvcGFLQUdtbUdubW1tZ0J0RkZGQURoUzBncGFBQ20wNm0wQUpSUlJRQVVVVVVBRkZUV2x0UGVYTWR2YVF5VFR5SGFrY2FsbVkrd0ZleGVEdmcwYmlmVDIxNjR3elRCcDdhRTV6SGo3dTRkR3p3ZmJwUUI0dlJYdmVxZkFDNVhXYnRwOWFzYk8xZVZqQkRid1BLeXg1K1VFRWdEakg4UnJzdkNmd2Y4T2FOSXNzbHMrcFhDOUpidkRMbjJRZkwrZWFBUG5MdzM0TzEzeEhKRU5MMDI0a2ljNDg5a0t4RDNMZEs5aThLL0FOWTVJNWRldXpja0hKZ2crUlBvV1BKL0lWNzdhMlRMR3FyR0FvR0FCd0FLdCtVOFM1MjlLQU1EVHRHajBhd1NDeHRZTGEyakhDeExnQ3RHR1J3TWtrNXFlV0s0dWx4dUNSL3FhZkhZeUFZTGppZ0N6YTdtQUpYOWEwWVF4R0N0WjBOck5HRHRaVDdacTNHMDZIRElUOURtZ0M2a0xLUGtHUGFvcHJscmMvdmtaUjY0NHAwZHlWNFlFSDNxNUhNcmpCd1FleG9BcHc2aGJ5akFsVFAxcXlMaEZJM3NCbm9hcVgraldseWpPa1lTUWM1WGpOWkUya1NiQzFwS2ZkU2NVQWRiRzRZWkJ5S3pmRWZoM1N2RStseTZkcnRqRGVXci93eUx5cDlWUFZUN2ptc0d4MUM5MDl3dHhHelIvWHBYVFdsL0ZjUmg0MkdSMUZBSHlYOFdQMmVkUzhPUTNHcWVGWlgxVFRFeTcyekQ5L0N2OEE3T0I3WVB0WGd0ZnAySERJR0hOZUQvR240RFduaWVTYld2Q2ZrMk9yRUZwYmJHMks1UHFQN3JIMTZIdjYwQWZIbEZUM3RyUFpYYzFyZHhQRGNRdVk1STNHQ3JBNElOUVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJUaFRhY0tBRnBLV2tvQVNrcGFTZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FVVW9wQlRoUUFvb05BcFRRQkZSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBRGxwd3BvcHdvQVVVdElLV2dCcHBwcDVwaG9BYlJSUlFBNFV0SUtXZ0FwdExTVUFKUlQ0NDJrT0ZCUDBGZHQ0WDhBYXBxNDNKYlJsUDcwakVmeUlvQTR1R0NXYzRoaWVRLzdLazExT2svRHJ4UHFMSWY3THVMYUJzSHpyaENpNFBweGsvaFh1UGdUd0JCcEVabG5VeHpFWUcyUnpqOE4yUDByMEMzdHpaUmJiVzdjWjZnY1kvS2dEeUR3eG8xajRHc1hpUUxkYXpOeE5jYk1iUi96elQyOWZXdlNmQ0Z2ZnNvdWJsREV6RDVJK2hIdWE2RGM4c0lXWlJMdE9RMGdCTk5odkZ0MktOZ2MwQWFNTm9YYmZNKzQxZmlDUm9jTGpGWmtXcEtlNmdlOU9uMUJESDhweWFBTm1KaTNJT0JVeEc5Q3JjZzF6OXRxcXFBQ1ZINDFjWFZGNjdxQUxEeHp3ajVQbVNvdlBrWEpiSXBrdXJScW1Td3FTMTFLS1FjRlRRQUxxUVQxTlRKcW9QVnNZcTNCTEZKMkIrdFdoYlcwcS9ORWgvQ2dDdGIzNnlEKzhLdGJvaWhjSHk4RE9SVEk0bzRHMitXdTNzUUtsdmJWTGl6ZEVHMWlPQ0tBRzJWeThpYml3STdZcTM1WVlaUTRhdVkweTdlMWtOdE9NRlRqbXVqdFpGY1p6UUFCWTVnVW5RQmh3YWdiU3doTWx1NVUxYXVZUXl0SUd3VkdhcVFYN05Ga2RPbEFFMmxUTUZkWE9WQjROYWFNRGtDc3UxbFJuWlZHTThrVkkwcnczQ2NIQjRvQThML2FHK0RjZXRKcVBpcnc5dkdyS29rdUxSUU5zNnFNRmxBR2QrQVByajFyNUxQSFd2MHVuT05yWjY5cS9QSDRpV2tWaDQ4OFEydHVvV0dLL21WRkhRRGVjQ2dEbnFLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FGRk9IU21VNFVBRkZGRkFDVWxMU1VBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQ2luQ21yVHFBSENnMEFVWW9BaW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdCVnB3cG9wNG9BVVV0QXBhQUdrVXcxSWFqTkFEYUtLS0FGRk9wQlMwQU9qamVRNFJTVDZDdFN3MGVTNks3Vkp6MkhYNlYwbmcvUWxsdFZ1WmVEMkJGZGhvK213alV2TVdJREp5d0hRKzlBRWZncndKRkVZN3k4QVlNTWhIN2ZoL25yWHFtbnJIYVJoSWh0UWRBS29Xd1VJb1hvQlYySWpIYWdEUk4vdFhHN0ZXTEdYY3U5andlbFlzMHlxTVlINTBzTitUSHNCSUs5aFFCMExYQjlEK1ZVTHlYZDA0cWg5czNkVy9XbVNYSHlubWdDeWhrUGNuOGFrL2ZrWURWa05kdWpZTERiVmkzdmpnaklvQTBQSXVISEQweFZ2WVR5ZHkvV3BJN3diZW9OUXpYcEdlYUFMYXl6U1I0S3FQd05RclBQYXZ1QkpxeFpTSkxDR3prMVBPa1FqTEVqT0tBSFdYaUo0OGIwUDFyZnNmRUN5NDVQMHJuTFdHRjRzb1ZKUFVFVmV0L0xqeHNPMXZURkFIVkxmcExGOHdKSHJqaXBiRmc1UGt2dFlkcTU2YlVudG9kMHFMczlTYWRvbW9XOTh4OGlYYktEMHppZ0IzaWp6NGJoSnRoejBKSFNxdGo0aG10WFZiaGZrOWM4aXVtbVZacmN4M3NZQ2tmZXJtZjdEVkxpUm1VeTJwN0RPUjlLQU9wdHRadHJtQUdPVU14SFFWbng2a2hlU0NQQ3lLTWpkV0JlNmQ5aGo4eTJkdHZZamcwWE04cWFaQThqQnlXeUcvaVdnRHFvTDVvMURTS3F5RWRhdFc5NzV6Qm1iSlBhdWRzdFJXYUZVTWZtRHB1RlRRR1dHOEpYN280d2ZTZ0RyV2NQYkVrOGdacjQ2L2FaOEp6Nlo0eXVkZWdnVk5OdjJRRndjWm0ybmR4OUZ6bjNyNnZ0N2t1c21TT2V3cjVsL2FqOFVKcUYzcCtpMjBxTkRhc1paQU9yUHlQeUF6K0pJN0dnRHdTaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQXB3cHRPRkFCUlJSUUFsSlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFLdE9GSUtVVUFQSFNnMENnMEFRMFVVVUFGRlRyYVhEVzVuV0NWb0J3WkFwS2o2bW9LQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0JSVGhUUlRoUUE4VXRJS2RRQWg2Vkdha1BTb3pRQXlpbHF4WVdGM3FNNGdzTGFhNW1QUklrTEg4aFFCQUtmR3BlUlZIVWtDdlJ2RHZ3ajFpOUNTNnZKSHAwTGNsVDg4bVBvT0IrSi9DdlJ0RThCZUh0Qnc4ZHQ5cnVSejUxd2Q1SDBIUWZsUUJ6dmgzVFp2c052Q0ZLcUZHWFlZRmRiYTJVTnRFVmhCWnoxWTFKZVRKTExzVURnZHVLa3RTQW5QV2dDU0FzTUJxdGh1T3RVeEl1OEFtckF3QnhRQVM4cWFweUt3K2FNNGFyZko0cGhpYk9PdEFGWlpYL2lITk9lVnNjWnF5dHE1L2hwelc3QmVSOUtBTXVZU012R2MrdFJJSm94d2YxcTlNcmdrY0Q2MURJY0o4eEg0VUFRdGUzS0wxd1BhcGJmVURLdUhiNWhWRzVtalZTb2JMZW5lc3hXZnpDWXgrdEFIV1FYa3NJSmpiOEtzUHJmeWJXRForbGM5RGRPRkhtREZPbHVGWURCb0EyYmZVcEVZdkUyT2VoTmJ1bmE0OGcyeXFHeDNyaE4vbHA1Z2ZIcFRrMWhGTzF0eFk5NkFPNHVMMk82bGRZb3BISkdPQm5GVmJjTlpabnRwZ3NpbkpVbm11WFhYamF6Q1NIZXh4Z2dkNm82MXJ0NjgwVHRHcUs0enMvd0FjVUFkaHFIanU4UkZWOXZCNm5xYTdmd3Q0cmgxaXpXSUp0bFVEbGhpdm5POWErMVZpV25DYnM1VkFNNDlpZWxMYmVLSDhMekxHMnJKRzZwdE1aRFNuOGNVQWZSdXMzTjRrcWlLMlNTRU1OMkc2MUcwMEYyMDFzWVdqQUdWM0RHRGl2S1BEZmpTL3VOTGFiellyNncrNHp3ZzVESDFIVUhIT0NLMlY4U1RpOWEzYVZHVlVHMWxPVHo2OC93QXFBTzEwVlZnREp1d1ZZakIrdGFSdXBXdUdoQnkzSE5jenBWN2F5eEswa202WW50NjFlbXZUTzhpd2toZ09XQTRvQTZUemhZYWZkVEJsSlNKbloyWUFBQVpKelh3MTR5MTJYeEg0aHU5Um1YWUpHd2lBNTJvT2dyNjcxcTgzNkxMQmNwNWx2SW5seXFNamNwNEk0Nlp6WHpEOFIvQkRlRzUxdk5PYVM0MGVkc0k3RDVvVy91UDcraDcwQWNQUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVU0VTJuQ2dBcEtXa29BU2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BY3RLS1FVNWFBSEFjVVVDZzBBUTBVVVVBZXIvQUFXMWFEVFhtU1ZqdGxPSFFuS3NQOTNHSzlYMUx3QjRJOFR4ZWE5bWxwY09QOWJadDVSLzc1KzZmeXI1eThOM3pRSGFHQUgrNlA1MTZaNGUxL0FWUzZnL1hGQUJyL3dCdjQyZVR3OXExdGVSZFZqdUI1VC9BRXlNZy9wWG5tdC9EN3hWb3BmN2RvbDRFWGt5Uko1cVk5ZHk1RmUvYWY0ajJvdUpsNC8yNjZUVFBFNVpnRElEK05BSHhveWxXS3NDQ09vSXBLKzNMdUxROWFYL0FJbTJtV0Y0VHdUTkNySDh5TTF6bXAvQ0x3SHFwTEpZUzJNaDcya3pLUHliSS9TZ0Q1R29yNmF1djJldkRzd1AyUFhOUmhidDVpcElQNUNzRzgvWnl1aGsyUGlTMWxIL0FFMnRtVCtUR2dEd09pdmFwUDJkL0VJSjh2VnRKWWVwYVFmK3kwMGZzOCtJODg2cHBJLzRHLzhBOFRRQjR3S2NLOXNqL1o0MXJQNzdXdE1SZjlrT3gva0sxYkg5bnFCVG5VUEVqTXZkWUxYSDZsai9BQ29BOEFGT0ZmVEZwOEV2Q05wemMzR28zWkhaNVFnUC9mS2cvclcvWStEL0FBaHBZeGFhSFpaSDhVcW1VL20rYUFQbGJUTkgxSFZHSzZiWTNOMFJ3ZkppTFkrdU9sZG5vL3dnOFMzd0QzaVFhZkdmK2U3NWIvdmxjL3Jpdm9wOVFpdDRoRkFpUnhxTUJVR0FCN0FWbVhlckRuNXFBT0UwWDRRNkJweFNUVkpwOVNsWGtxVDVjWlAwSFA2MTJ0b2xqcGNQazZkYTI5ckYvZGlqQ0EvbFdaYzZxV0pBYmlzMmErWmljc1RRQjBOeHFBS25uTlk5M2VFaHNITlp6M1RHcTgwK0ZPVFFBc056L3BmekhyeFdzSDJEZzF5a2s3Q1lNdlFHdDJ6bkVpQTk2QUxvaytZR3I4VGIwSE5aeWpqcGtVUnU2dUZCd0NhQU51UFlDTnhyV3RGdGlOMjVXTmMyNVlZR2MxYWh6dDRHRFFCME1yVzJ3N2xVL2hWRXRHR3lwd1ByVkVlWVFjWklxclA1cU1jZzdhQU5lU1dIYVM2SXg5U0JXTGZSeFNFbE1MN0Rpck1jTHpKOHU0L1NvTG5UcmdBL0t3SHZRQml5UVJ4NUtxTWZYTkxadkVKUG5PTSt1S2ZjMjBxZ2c3ZWZ6ck1rc1ovVWdab0EycGtpWVpSZ1Nld3FqY0x0UElVRDJxdEdzcS9LcHhWL1RnSGx4TVBNWWRxQU1lVXpUUHRRYlY2YmlNNG9rc2p3T1cvbWEzdFRrY3lxaUp0VURsc2NEMnFyRncyVkdSL2VITkFGS2V3Tm5ZdEs3ZEJubXFsbk1sMVp6WFYwK0FwSy9LY0FKWFRYZGlOVnR0Z2wybEI5enNhNWJXNERZU1orZU9KejVaQUdRUDhBNjNTZ0RsZkZPcFNXT2pJMW5NeU04bXdzbnBna2RlTzFlZHBPNlhDejUzU0syL0xqZGs1enlEMS9HdlFkVFQrMExlNjArOWsvMG5JYU03VHRJQSs4RDZmNDF4djlnYXFaVEhIWXp5RUhHWTBMQS9RaWdEdmZoWDRsdWIvNG0zVnhlSkdGMWJ6WkxpT0ZBaUsyQzRJWG9NRWZxYTlOOFJhWkJwR3RDWlkyRnJNck1EbkFCQnJnL2hWNEQxT3gxZURXTHh4RExDak1scW56eUVGU3VXeDBIUFRyOUs2bjR3WGJTMm1uUVJTRlp6bDNVTUI2WXprKzdmbFFCdDJNdHJFR3VwSnlzUVRkaFJrbHZRVnA2WnJjVTkzOWszQlZHR2M1K2IxeFhsM2hxUzluRFJ1QWx0RDgwc3BiUC9BVjdaTmEwZW94MmVibnlkOXhOSWZsWU1BemRmeTdVQWVtWFdvUmZaNVZLaHJlWWJOM2ZPZURXUGNXOXBKTmNXZDZFdWJDOWkyU3hkbTlHSG9mZjZWaFc5OTlvaGxNeXhySUFQTVNJWUNuL1p6V3JvQlR5WXJLNFJpU3A4dG0rOFJRQjg5ZVAvQzAzaFRYcExSaXoya243eTJtSSsrbnY3am9hNXF2by80aGFJZkVYaDI4c2lnKzMyaWk0dHM0eVNBZHlqNmdmbml2bkNnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBcFJTVW9vQVdrcGFRMEFKUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFLS2VLYUtjS0FGRkJQRkFvb0Fpb29vb0FsdDVmS2tEY1k5eFhUNlJxVVM0UG5ySDY0YkJyazZsaG5raGJNYnN2ME5BSHFPbmFsSE1NSnFIUHR0UDlLMjdXOWFOaC9wVGZvSzhrZzFpVmZ2bHlmWGRXeFlhckhJVkFubDNEcW9RbitsQUhydHRxOGtXMCtjNStwcmJ0ZkVMZ2pMZ2ZqWG1ObGN4VFJqRXBQZkxIR1AxcTRrNm8zK3NZKzRCTkFIcTl0NGliUE1ncS9ENGlPT0pLOG1ndmdNYlhlcnNlb2xlNS9FMEFlcXg2OWs0MzA4NjMvdFY1Z3VyN2VRM1B0VXk2cEl3NU9CNzBBZWl2cmVjL1BWV1hXemcvUFhCUHEyd2tGdWZTcTdhaXprNEp3YUFPMHVOYTRJM0VtcytmVnl3UHpWeWIzdkp5MVJHOExkS0FOKzQxSmlldFVaYnBuems4Vm1lZDNKeWFhWml4NjhVQVhtbUo2SGlvL05BeVNhcCtkajB4NjB3eUZ1U2VCUUJjOC9qTlF5T1d5YzFYV1RkbjBGVFF4dktjQlNjOXFBSDJrWWx1RlU1eDJycHRQdEkwSTQrdFptbTJqUlM1ZGZuN2UxZEhiUVp3VGtHZ0FsdDBWZU9LcGVYaVlFbm9lbGF6d2xoMHF0SmFIcVRRQkkxdnZUNWV0TENHVTRmaWtoa0s0VWs1RlM3aWM0NVAwb0F0MnpsUm55eTFYa0VraS84ZWNqRC9aVE5VdE5ZbWNCbXJva3VmTFhCWnFBS0tXaVk0RXNMSHN5RmYvclVOWk1Sek5uNjgxb3BkckxsU0hDOXlRYWVHZ0tjS0Q3NE5BR0RMcHFzY2ZLNTl4aXFGeG8vSEM0UHAycnEzTU8zNVIrZElWaUNZQVVIcjA1b0E0Q2F3Y00ySTFCSHJWblQ3TmR4THFvYnRXMU5DSmJqWjVoTEhweUJ4VWY5bTNNTDd0OFd4ajFCemo4T3BQNVVBTld3aUlJazI3dXpZNE5aTjlvd2hrTTlpNm8zZFIwTmRIaHd2bHdoTitPY3NGeDlhYkpiRklENXBqWnU1NUZBSEtRVE5CSUN5ZzUrOEFLWjRrc2JiVkxNcXB3NVhHZTRyY2tnZzU4MWVTZXFpckVlaU5QYktiZkRSa2RDTUVVQWVKYWhvZW8yanBzZ2x1Rmp5WTVJamgwL3hxNW8wYVFMdHU3VFYxSXgvcW9teVR4eG5PUFg4NjlidDlFdUlReVR3bHdPVktja1ZQcDZYTTl5SVZ0bk1ZNVpaRTRHUGVnRGpkRW1nL3RFeXg2WGYyVDdRWTVyaWM3bndlVktBNHh6M3JtOWVEWFhpRmIzVnRzTmw1ZzJJL0FJR2NEOFRrLzU0OTcwVFFpWjdtU2NMKzhKTzBEQS93RHI5NjhRK0trZ2s4VlcrbFdrTHlRMkRLa3d4dzBoNTNaOUFEajg2QUtkeHFabHZaYlcwdG80N1RjWTlnNDNEcVdQNUR2M3FLV1pnalRoRTh6SGxnQUJ0aWpyZ251VFduNGxzcmF6aVpvMVpHdW1hUlZVNUczY1FNSHVPTTUrbFA4QUNvaWxSaGN4OHJqQ25rZTFBRVBoaWJNbmwzQjJ1K0FCNmcxNlhMYUxGYnd5cHQzcGc4Y0VIcURYSHRwOERYNlhWdm5CNDRHQVBiOE1WclM2cE5mS3RudlVBTDgyMGZOajBvQXIrTUx2N0hGYmF0R1Q1dnk4THp0eHpnMTg1K0tJMFhYTHVTQk5rRTdHYU5RTUFCdWNBZXh5UHdyNkJqaGhlMTFHMm1MeU91SElKeU93cnhMeC9icEJxRVhsanB1VW5PYzg1SC9vVkFISzBVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVW9wS1VVQUxTVXRGQURhS1hGSlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBT0ZPRk5XbkNnQmFTbHBLQUk2S0tLQUNpaWlnQXBhU2lnRFUwclZwckxDb1FFL3o3MTBsdnI0a3dBV1krd0ZjUFVzTW9pT1FnWnZjbWdEMGExMUtWajhxcXc5L3dENjFYaHF5UjQrMExicWZUcWE4d04vYzdkb2xZRDI0cElIa2FUZHVPZTdaL3FhQVBUNVBFS2tmdWxpUVk2OEExVlhWcDVtSlYxSTl1MzQxeUZ0ZDJzSStVR1JoMUlHQm42bXIwZW94ZVhtVmxqWHNpOVQrSCtOQUhTTHFPdzRjNzMvQUxxYzA3KzBwQ3dYRzNQYlBOY28rcXFWMlFia3oyWGxtK3A3VmIwNktja05Ld2lVL3dBSTViOFQyb0E2V080WmozelZsSkNCNjFtUnlwR3ZVQVVwdlZWYzV4UUJxQjhENW0vQ2xNdmM5TzFaSzNZWThrZm5UbVp5TXUyRkk3ZGFBTDVuREVqUEFvV1F5bmF2Q2pxYW9vU3lnY2hlZ0E1Si93RHIxMEdoYWRNWlVlU0x5NGh5QWVwb0FzNlpwVWs0VmlOa2ZhdW9zOU1XTkFFWDhlOVhyRzFHMFlHQlduRkR0R0tBTW43RHQrWUwrbFdiZVBqSlA0VnN3UWc5UU1WRlBaN0R1aEdSNlVBUVJwbWtkRlVISXFiYVZISUlOUnlZQ25OQUZHUkE3ZktPZmFuaFNvd1VwMEEvMGdaNkd0WDdKdUgzZUtBTTZ5SlM0VmlNQ3VqalZXWDYxUWpzV1k4WUZYNExhWUVCc0ZhQUd4b1luUHpuODZ0a2VZbU4zNTArUzArUXRrazFCYURMbFN4SDA2MEFRU3djNEdTYXpMN3pOcFZXSXg2OXE2YVczVXFjQWJ1dFYzc0ZWTnpMbGM4Y1p6UUI1OGtGK0x1U1JuM2pzd1BQNVZxV3Nzb0MrWU55L2xYUXpXa28zR0cxVjJZWXdUV2FiQjJZL3VXZVFIbkhHMmdDMWJTakcxRmFFSHFRb2FyMGFKSkdVWWJ2VEZaOFVWeUNFakpVamtsbytnK3RhME51eTREeUF1ZllVQVp0MVpBSmlOQWNIOHF0NmE4aUVvUUkzNllkaGcxTmNDVlFBMldYT09CVWNjS2ljQVFrTm5yaklvQTNMVVN4U0psQTI0OXVhdHhORTh6SzZSSnNiRGJldFEyU2JIMy9BREhZT1J6VXBsODZZYjF3akhvZmFnRFF0L0xMRGFBQUsrZVBFK29XMEh4RHZZZFIxTVFvWW1MeVhVU3FBR0pJVmY3d0hZOWMxOUNRL0xCTHQrK0ZiSDVWNEorMEI0UnVkWjhPNlJxbWx4UE5lMitVdUZYR1dWZ0R1L0FnOGU5QUhsbXA2cGM2aGF4elJ2dWpYQ0oxNFVmNU5hV2hhNDFoY3hpYmM4Y3lGR3h3TTl2MHJ6Mk83dTlPaE1FbVZYZHlwNFlHcnNlcFd0eGJvczhzcXVoQkl3T1FQZlA5S0FQU2JYWHhOcU0xdDVzY1lYRHB1UERIMDVyUXNMOFI2b3pIRG5vcW5vU1RqcitOZU9TWGRxc0xBTElzaGJPUWNncjZWcmVIOVUzeUtrVXA4MVd5RmZBNDl1YUFQVnRIbkZ4cStwWjJxcnhzUU4zSXh6WGt2eEhCWFV3cElJNmdqM3J0dER2UDlPdThFc3lSRm0yYzllMWVmK09MbjdScUdjQUVVQWN6UlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJTaWtvb0FXbG9vb0FLU2lpZ0JLS0tLQUNpaWlnQW9vb29BS0tLS0FGRk9wb3BSUUE2a29vb0FaUlJSUUFVVVVVQUZGRkZBQlJSUlFBVXVUakdlS1NpZ0JReEFJQkl6U3FHWTRYSk5TUmlMK0lrbXJDM0VLZ2dEQS96L25wUUJaMC9iYkVOakxrZGY4QUN0RTZoZ2ZMZ24wQjRIMU5Zc3Q0aEdFUTU3bHU5VjJuZHVwempwUUJ0dnFaM2ZlSko2WS9vS3JtZWFkd3Z6Wko0UlRrbXFOcWsxek9Jb1FXa2M0ei9pYTduUjlMaTA1TUlQTXVXSHpQajlCNkNnQ25aYVU1Vld2aVQ2UkRvUHJYUjZmcE10NjRFWUVkdXZHNytncTVZV0htc3BrNVhPU0FLN1BSck5KR0NCY0FkcUFJTkYwRzNoQTh1UGMzOTV1dGRWYWFPR0hUQXJTc0xPS0dQSktnRDE0clFqdWJPRmVaMEo5dWFBTXlIVDNoNHdTS2tLQk91UHBXZzJwMllqTExJRHpqbmo4YXBYdHhhU0p2V1VaSTNmaFFBK0JnZUJWK0NIZjFyRHNyaFN4STZubXRxMmtMZCtLQUxYMkNHUTVrUDRVeWJTN2RsUGxvYXRRSDhmZXJrWUJGQUhHM21tdEM1NHg3MW9XQjNRaFNTU081cm9MaTNTZU1vUVByV0ZOYW0zazJzU0IyTkFGcUpjZGF2UWM4VlVoWEFHVHVOYU51dTFjNEF6UUJiU0VQQTI0Y0FackdXMWFJZVpqQmM1cmJqZktGZlhyVmEvVXZHQUNBQlFCWGdqa1o4NytNZGNDclYwNFZOaEc3ME5WTk9kUklFY2tqMEhldDU3ZFhRRUJSeFFCemp1NmpDQWdrZHFabHlNTXdQc2Excnl5VlJ1Kzh4OUtwTWtVYTVhUDVzY2s5cUFLcVROSHUzS1FCNzV6VVUxNmpFRDVkMktMdG1VR1YyQ29CMHJrMjhTUURVRWlmNWZuMkVuazlNL3k1b0E3R0NPU1FidzN5NTZjaXRpMWRMcDBqakhBR2MrbFY5TjFXd2pnakVMSmx4eG5HVGpyL0FFcE5KSW0xT2VXQi93QjJUOHZ5bitkQUdtOFZ6QVNVSUlOVllMYTRCM3k0WEdXQ2RjVmRtam1ua1ZjNFZUdVA0VVR5NWNpTWJpUmcwQVB0TVM3Z1QxeURYa3NGNWZtOFMybUpsOHVWZzZMd3FrSHY2RHQrTmVvV0RsWEx0d0F4elhtWGlXL2wwcnhEcThNU3hOQ3hhVmNFWmJLN3ovV2dEem40dGVEN2ZWYmg5UjAveTB2WTBKbmhRajVoMXo5Um12RS9zd2luS1REQkhYbXZVTkkxalZicS9tdm9uVi9Na0xGRzRBLyt0WFArS2RFVFVwcnU0MHBDdDVGKzltdGwvalh1eURyeDZlbEFIS2ZZL050NW5pTzd5dVNQOW4xck5ERkhCQndRYTZ6d2hidzZqUGJXRU1NdzFTYWI3UGhlVWxqYlBVZFF3UHAxQjdFYzg1ZldGeFozYzF2Y1J0SEpFekt3WVl3UVNDUDBvQTlCOE5YcU5iekRla2NyeFlEbklCeHp5UU85Y1I0aWRXdkFCbklIT2V1YWRaWHh0UnVWbURiY0hCNmowckx1SldubWVTUWtzeHlUUUJIUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJTaWtvb0FkUlNVdEFDVVVVbEFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVTRVMmxGQUNpbHBLQlFBMmlpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaXRDdzBxNHUwODNNY0Z1T3MwemJGL0RQWDhLMjlHMHpUY3RJazcza2taeG5adFRQc0R5YUFEdzNZbTBYN1RjakRzUGtqL3FhOUIwT3lXUkEwNHdXNysxVXRKMDVjaTV1d00vd1Ivd0JUV3dreDh6T1FCNlVBYWx0QkZhazdteW5ZMXF3WDhoWFphSUZIVGNCV1ZGRWJoZHB4c1BVMTJQaFMwdGJPM1ZRbm10MVVubm1nREpzVGVYR3B6d09rb2pqUWZNM1FrK2xhMGVtWFQ1OHVKbStncnEyVmRnYmFBZTR4VFk3dFEyTWZsUUJ4OXhiU1FxeXlLVmYwSXJuTHk1bWh2REVNN2NnQ3UrMUxYclMydTgrVEZLNTRiekJtc2pXb0xUVmRrOW1ndDVQNGt4MzlSN1VBTjBZbG9nVDM3VjBkb1NNWk5ZT25XdjJXTUF0dUlyWWhrL09nRFpnYmpyVitKK0t4clp6bjJxM0ZMazBBYWFONzFCZndpV0hnY2puTlJySmc5YVdTY0JEanFhQUtWckppWFl3NmNrK2xhSDJxUEFDc0tiWVFwKzlkd01zdUtwdGFxWEpCeFFCcXhUQUpucm5pbG1PNWNtczZLVHk4SzNUdFZzT0hHTTBBVVd6SEprSG4yclkwbTVNc2dWeVdQWVpyTm5lS05TVGdtdERRb3VHbC9pUFFEc0tBTjd5UTV4amI3ZzFYdnJHSUp1TlR4eURyZ1pwTHQ5OEVnSFhhYUFPUTEvVDVKUnNVL0wzcnp1KzhOdlBNSkRsU2hJUjE2bm5KUDRuK1JyMTRSbVczR2VXWlJrL2gvd0RyckxudEFybmdaOXgwb0E0UFFNNmRITE5kRExqNVk0VjVDajFQYlBmSHYxcjFEdzAyN1RZNUdRSTBoejcxeGVxMm05SE9HQ2l1cXNaRi9zbUFwSUFWRkFGNmZVbHR0VmxpWUhhSXd3UGJOWE5PQytYdjR5M05jbGYzUzNGckkvM2pIT3NaWTl6WFM2ZEtQczQ1NlVBUVgyNkpyeDE2S2NqOHE4VytJRjJZL2lFOEdCcyt6aHVUd1F5ay93QTJJcjJTYWZ6VzFGVDBDLzByNTkrSW1yV3NYajJDNmVVRUd4akdQZkxEK2xBR1hwK2xXdWwzczg4MHVCS2RvM2Z3OStQODlxcDYxYXhMTEhxVUVyVzIwbDBtVmdHNDdmenJJOFUrS0ZlSjF0Z0d3K0E3cVNjL3lyamIzeERlM05tYlY1Y3drNUkvR2dEdnRFOFoyWXU3a1hrVVgybDhHRzZ0N1NKWk4zUWdrS09EeHpYQitLOVFGNXFjNFNSNVZEa0IyNmtackg4NWg5MG1vaWNubWdCU3hOTm9vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBRm9vb29BS1NpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLVVVBS0tLQlMwQU1vb29vQUtLS0tBQ2lpbG9BU2lpaWdBb29vb0FLZEdTR0cwQW5zQ00xYTB2VHJqVXJnUTJ5Wi92TWVpajFOZXErRWZCOXRaTXNoWHpyanZJdzZmUWR2NTBBY1ZwZmhQVnRYWkh2V2FDSWNEek9XQTlsN2ZqaXU2cy9EOXZvVmxHb1JtWThxWDduMXJ1ck95aWdBWndDcTlCNm11ZjhBRVUvMm00Wm1QQTRBOUJRQmsrYWtaTzV2bVBXcDdPM2t2bTN3NEVRNmsvMHJKV3prdWJvWVB5ams0TmRmWk1salpuY1FveGlnQjBTZVhzUkNjZWxkTHBFenh5SjZkSzVQN1h1WU1EaXRuUnIxaElDV3lCUUI2QzBoa1VBWkNLTzNlbzdWZk0rWW9RdnZ4VVdrNmhETnc0S0gxN1Z2UndLeFVnZ2c5eFFCYTBxMDB5ZENrc0NlWWY0aUFhcjZwNFdRWmFFQWpzVkdNVms2bGIzaHVIUzJiYU9CeDZWcmFKcUY1YUtzVjI1bFVjRXNlYUFPR1oydDlVbnM1LzhBV1JucDZpcndCSEk0cnB2R0dqVzkyOFdwMjZBVGdiV0k3aXNCSVh4OHc1b0FkQmNHTVlhcnR0TUdIV3FRaDU1TldvTFhqZ2tHZ0MySmNkRFRnNGJ2elVFdG82aktOa1lwa0RGV3c0eFFCc1FuRUJIY2lzejdWNVVoU1RyVitKd1UvQ3NuVW9UamNPdEFHbkJ0bWp5TUhGUnpqWjkwbXNDRytrdEcrWEpIb2FuZldkMkNVT2FBTFVyRUhxU2U1TmIvQUlmdU10c3owNm11T2U5ZVlFSU5xMW82UGROQzR5VDFvQTlBYVBjdVU0TlFPV0NzTWRlS2ZwMXdKb2dRZWNjMVpsakJpYkhXZ0NyYklwVXJqb090TW5zQTZranJUb1dLeWxUMnE0alVBYzVkV0RMRzZsQVEzRmMzSk5MQnFkclp4SVgzeUFBWjQ2Ly9BS3pYcFRScThiWkdlSzVXMXNQK0o2c20wSGFlYzlxQU1UeElVMDdUTDErZ043a2RxM2RQbFNTeWhuVitDb09CM3JuUGl0aE5GblVuR0pnLzFxcDRRdjFPbXd4ZVp1d3ZBb0Ezbzd0VU9xU09ma1FFayt3V3ZpZlUvRUY1cVYwczkwNFowVHkxSUdPQVNmNm12cS94YlBKcHZobnhGY3MyQjlqbVlIMUpVZ1Y4Y1VBVFRYRXN4K2R5UjlhaG9vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FXaWdkS0tBRW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdCd3BhYUtkUUF5aWlpZ0Fvb29vQUtLS0tBQ2lpbkFVQUNybXJGcmFOTktGSjJyM05OalhISnJYMHFFdTQ0NG9BN1B3cGFKR2lSUXB0VCtmdWE5SjA5VWdoQUdNK3RjUjRaaUlJeDBydFlXQ0p6Mm9BbjFLZnlMWXNuTDlzOXE0MjhkcmlRcVJ5eDdWdDM5MHNzM2xFZk42WjZDbVdVRUxTRTRCS21nQ0RUTFVReDdpT3RNdjRXbjJqZmdEMHJVRU04ck41YVlUb00xRFBaVCtXY0E1SHBRQmtXOWc1dWN5WG55ZGtBcnBMQzBaVkFqNUhyV2ZvT2pDR2RwcnBqSk01empzdGRsWVFxbTNBSEZBR2hvdG5MRkdKSDNFOWhqaXVpdDdoMTh2SzdjSHRTYVBjeE1ubFRMZ2RqVnlhMkViY2NvZVFhQUxiMkgybEJNRzJsdWhxdkpZWEx4RU02bVJPK09vcVFYaGhoalhPVkZhbGpjUjNFUktOODQ3R2dEUHMwZGJOb0pHQk9jL056VUxhZVlROGdUY2hHY2VsYmF4UjNFYll3SEZRUnl0Qyt5UWZMMG9BNTNWckFReHgzTVdURTNYMk5Vb1pjTUNPUlhhMzlySEpwcyt3QXhsY2tlbnZYajArcVMyODJJZ1NNa0VmalFCM1VjNnZIazlhYXlxeTd1SzRPTHhhbThvUmdaUEhmRmF1bStKN0M0dFNUTHRZTjBOQUhSbGpHVHRQRk1sdVkyWEQ4VmxmMnBBelpXVlRuM3FEVU5RaVdMQVlaNmlnQzNkQ0UraHpWVHkxYm9PbFo4ZDhKQW1UMnhtcjBNNm5IekNnQ3lrZTFjQ3A0RjJzTTBrREsyT1JVMHE0R1FmZWdEb3RITXlSaG8rUjZWdUdaMlRCVWpOYzE0ZTFCTXJFNXhYV29GZEJRQm5yTURJY0g1aDFGV1VtREFZTlVOWXRHaEszY1J4c0kzRDFGSnBjcXlnanVLQU42MWJjdjFGVXZLOHEvWnY3d3EzYWtBQVU2NVFGTjNjVUFlUmVQWGx2L0FCZkpZT3greXh3SSszSEJjNS9wVVZwcGNlajNNUmlZN0hYbjYxc2VMZFBLZUk0YnpIeXpKZy9VVlMxaVVHM1FnNEtuaWdEamZqcHJDVzNnSzdnRFlsdW1TRmVlMjdKL1FHdmwrdTErS25pU1hYUEVVMEtUckpZMngyeGJEd1RnWlA1NXJpcUFDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0JhS1NsN1VBSlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFDaW5DbWlsRkFDQVpweWdVMmpOQUNtbTBVVUFGS0JRS2NLQUVBcDZpbTFKR3BaZ3FqSlBhZ0NlM1F1d3JyTkV0ZHdYQTRGWittNmY1VUJsbEFMTjhxTDc5eitGZGpwTml5d29kdUY3azBBYjJqaUswaUR6Wkk5T2xPMURYVVJHTVNCTWZwV2JjdTJDcVpJNkFDcWEyVXQ3ZExicXdVWkc5ajBGQUduby93Qm8xQU5NcWxpNXhuMEZkWHBtbVJXb3hNL21QbmMzb0Q2Vm9XdG5hYVZwQ0xBVkNxTXMzcjYxeDJtNi93RGEvRmErWTJ5MkpZS0NlUHBRQjMwSlRaOGtRVWVwSE5OTUt1cHBrdXBXMFpWWTJFak1PZzVwME1oZmtqR2FBSTRiVGE1SS9DdEszaUlGSkVveCtGQW1NWjlSN1VBYVZzekljZzlLMzlQdXZOaUtFZzQ1d2E1dTFtV1FmV3RLMk8xd1ZPS0FMdDBQa0xJY1k3VXl3bkt5QW9jTUtkTWN3dnpoZ09mZXM2M2tIbURua0dnRHE3ZTQ4dTVWbk9GYnJWeTVqK1lnOGc5RFdPc2dsZ1FzY01PdGF0dGxyY0RPUU9ob0Fuc0pNRm9YNVZoam11RDFmUjQ0THVkR2o0Qk9PSzdxSUR6RlBvYWsxaXlpdW9oSnRHZTVvQThFMS93MUlJM3VMVlR2VUU0SGNWd3kyazhOL2dNNFZ2bTYxOU1wcGNaeU52SHBYay9qRFFuMDd4Q3lvdjdtWDVvL3AzRkFHRlp4VG5xekVWc3d3eU9vOHhqaXA0SUJIRXU0QWNWS1dYSFVZb0FZc0FVWUZUeEtGem4rZFU1YmdSbk9jMHNWOUYzSnlhQU5pMm0yWUFKclgzN29jazlSWEtHOEw4UktUV2phaTdtVkYrNzZtZ0MwTG93ektWUHpDdXgwVHhCOGdqdUFjK3RjeEZwTEZOeDVOYldqUXdGdHM0RzlmV2dEcXJpOGl1ck9WQWNobElybmROdWpiVC9OMHp6WFRXc0VKaUtxQmlzM1ZOS1VEZkgrTkFHeGJTcElva2piclZneWIrUFdzWFNvUUJ0REhqM3JaSlZFejNvQTV2eGlpdlpGdWpSTm12QmZpLzR0ajByUkdzb1R1dkx0V1JjSDdpOTIvWGl2Yi9GOTJpMmMrODRHMGttdmgveFhxRGFwNGh2cnRuRGlTUTdTQ2NiZTJQYkZBR1RSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBS0tLU2lnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBcHdwdEtLQUVvb29vQUtLS0tBRkZPRklCVWthRmp4UUFLTTFyYVJBc1lOeE1PT2lqMXB0alk3K1pPRkhKTmEwRnMwOHFZWGJFdkNpZ0RSMFdKN200M3VBQU9uSFFlaHJxcFpWVUtoSjJqcldWWklMZUlBZGF1YWZGOXN1RHVPRlRuSHJRQmJ1SGp0MGp6MWM4WjlLazAyQ1daV2toRzFISmJQYzFBOW1kUjFOQ1FmczhYSFA4VmRWSEVJb1ZVREE2QVVBWTJwTGR4MlM3NTNlSXRqWUt6cE5GM3hyUEJ3NDdpdFhWWjJrbThsZnVxUDFxVFRtTU5wTjVwRzNISHRRQlkwbUVScXVQbWJIVTEwMXFjTDcxeXVoM1FsTEE4YzhWMGxzOUFHbjVubHdzeDdWVHNiaHJoMkRMdDlLZko4NkJlM2VvbEJqY0ZldEFHckQ4cmNjR3RPM2syc0RXSGF6NUxBOEhOYVN5Qll3YzlzMEFhRnpQa01BZWFxUmJpMlIxck8rMUZtT09nTmFsaVF3M2NZb0F2SmNuNVY5T3YxcmMwaTdZSzBUL0FIVDA5aldKYXhiM2FSZnU1NXJVdEYyUzg5S0FOaU51dGFVQkVsdVIxckRpbEhtWVBUcFdsWU5ndXA1SFVVQUpLbmx0d09LNUw0aDJTeTZXdDBCODl1MmMreDQvd3J0Snh1QnJGMWVFWE9uWFVEaklaQ0tBUE1GWGZBclk2aXFUd0FzZVNQYXA0eWJlTjQzNnAycGhrVmgxNW9BWWxtaDRPRFY2MzBtRmhrNHFvalliR2ExcmFSVlFGemhTTVVBVDJObGJ4Z2pBemlyMXNVVTRBNlZtaWVHUExMSU1IM3FzbXJSeFROZ2dudFFCMkZyTUdKR09NVTI4dG1jK1pBZHJlMVl1bjMyK1RJNHoycm9iZDl5VUFXTkt2THVJYlpGM0QxclhrdTNtdFd6R1ZPTzlVcklDcnVCdHgyb0F4ZFAxQVJYREs1Mjg5NjFybS9Vd2JsWUdzelY5TVdSR2tqTzFzVnc5L2QzdG1XWGVmTHpRQXZqYlZoNU1xRThFRVY4a2F4YUd4MU81dHVvamNoVDZqdCtsZXlmRkhVcHhwTWtxU01ycElqY2QvbTZWNDdxdDZiK1ZabkFFdU5yWTcraG9BbzBVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVvcEtVVUFKUlNpbEFvQWJUZ0tjRnowcXhid2JtNW9BYmJ3R1E4Q3RteTAwNUJZVmEwdXlBWUZlVDlLNmFPRVlUY25UKzdRQmp3V1VqZkxqQ2cvblc3WWFlQXVXR2NWZGdpVmdNaHMraHJXdHJSdklMN2ZsRkFHQmRwc0JDMXA2UENZN2YvQUdtNjFZU3c4eHQwaWpKNkN0QzMwMGhTUWFBSFc0U0JBYXNTeWdMbk9jRHBVUjAyWS94RWpOWEUwOFF3dTg1eUFNMEFadHZBc2t6TTQ2OGs1cGwxbWQvS2o0UWRjVkZGT2ZMZGdmdkh0MnJTMHVFckZ2Ymt0enpRQm54Vy93Qm5PNGNWZnNOVVZaUkhLUUQ3MWJ1SUVlUGNPTVZsejJVVW95RzU5UlFCMXNPWkJ1WGtZcWRZc25HT2F5L0RsMkZ6Ynlua0RnbnZYVTJLSTVKT0tBTUdlSjBmSzU5NlV4M0VvQldRcW80eFhUTmJSdGtsUWF6YmxOakhhT0tBTVkya3NZSk14L0NyMWhkaU9FeHN4eURUSmpsU0t5cFhaSnNyMk5BSHBPaWdHeUJKNjFkZ21IMlliaGgrbGM3b3VyeEMydDRITzEzR0FLMVpuUG03QU9sQUdrRzZOV3ZadU9vckVzNDNraVBGWHJPVm8va2xYQkhlZ0RVTGJpYW96Smx5cDZrR3JNYnFBV1k4QVpyRjBxLyszZUlMMUNjTEV1MVY5ZW1UUUJ3ZmppMEVkdWwzYmo3MG5sU0FlNTYxeWQ4MGtVenFEd0s3WFdybFpEcU1Ea2JST1ZBOU1ISU5jdGQyZm5tUmxKem5Jb0F3MnZwbHo4eE9LbWkxT1NSQXU4NUhiTkU5aEpFMlhCMit0UVQyZzRaY2RPZmVnQjBsek1Wd2puNlUyMHVYTGZ2RHo2MHlOTmpaSElwOGNmekhBNEZBSFdhVGRCU3U0NXJ0Tk91QXlEbXZNckdSNDFCUElybzlNMWJ5d29iNllvQTlHc255VDByUkgzYTV2VEx0bWozNDdWclFYRFNPb1BGQUZpNWtBaFlHdUI4VmJmS2NnZHE3UFZpMFFEL3dIZyt4cnoveFhjaFlXT1JpZ0R4M3gvSUcwdTZXUWpCSEdmWHRYa1JyMDN4bGNyTEJld3VQbEF5RCtvUCtmU3ZNalFBbEZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFEd0trUk0wS29xekFtVGdDZ0JZSXNuQUdUVzVZV0J3cEs4bnRScE9udEt3TzA0cnE3S3lDRE9PbEFFRmhaaUlESU82dHkzaFhhQzRINDFIREd6Y2diUjZtcGtHeHZsSlpqM29Bc3hyR0pOdnA2VnNaL2RLcEcxRkhDMW1XY2FyTGxpQ1I2ZXRhcFVzcFByUUF0dEh2YlBldE9OQXFjMWwyMC9sdHRjWTk2dXRkUmhSeng3ZDZBTExPRlVrOEFWU3Vyb1N4TWc1R0tobWtlYklJS3FPM2MxV1pkdVQyb0F6b290cTRVZFdybzdOQjVTK21LeUlFRHpZN0ExdXhZU01jOXFBSXB4MVVkTzladDBoejhuV3RNZ3VEZ1ZTbmpZRThjVUFaMGM4a1Z6bkJ4MklycmRFMXlOVTJUSEI5YTV2WUQxNit0V2JTRkVuVGQwelFCM1VlcVFOSHhJdjUxVXVabGxHNEdzdnlZdzN5QVlxNWJ3SmtIdFFCQklHWThEaXE3UWorTHJXeE1vQy9LTzFaOHd4bWdDZlNXaVcvdDJZRDVXRmRxc3l2TU9CenpYbXdtTVU2a2RqWFk2WmMrZmNJVlBCRkFIWjJuQ0RGU3VRVzU2MVV0WlBsRkxMTnRmcU9sQUMzY29qaUk5YXpQQ2tURFU5WHVpTUx3b1BxY1ZITmRmYWJncXZRY1Z2V2R0NUZpeUlNRitUOWFBUEpOYTQxeThSL3V5c0gvR21XakJTd3hrRHJrMWUxeUQvaWFNUU9VWXFhcm0xTUVoWURLbnFLQUttb1FTRlNWeVl6eUFhemZKSVErWXVCN1Ywa28zV29qSTRQUStsWlp0bVhPUG1GQUdNdHRoaUIwUFNyVUZvU09CeVRWbDR0bU1yam1yVmlBemM5QlFBdHRweGNCUUszOVAwRlNON3JWclNvVTJnc09UMHJvSDJwR3FpZ0JMQ3pDUUVEdnhWeTBqd0NyZmVXbndnTENvcU9WaXJxNCtob0FsMURFdHE2bnVQMXJ4enh0ZFJ3eHlSeXNBY0hBenp4MXIxbThseEUzTmZPbng3OHlQN0plVzdsWGpsWmNnOGdNTUdnRHpEWDlXYWVkMVpSdlVtTnhucU04Vnp4eGs0NlU2VnpKSXpzU1NmV21VQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBRmhCazFxV01SSjQ0cWxieGxtNlZ2YWZCakhjK2xBRzVva0xGMUNrNHJyMVZJSUJrRGNlZ3JJMFdFS29PMnRjSW1TODdjRG9CMVB0UUJFRWxjSFloZHowQ2lvZkxsaUpNMkViSFE4bXBJWmJpS1Jwek1JRUErNk93cVdDSnAyODZmSnlNZ0dnQnVtNWlrM1BrcWUxYjBjeTdlQ01udFdYRXZ6azRBQUhBcXphMlFrbWFXVmo5QjJIK05BRnhkcm5Kd1RVVFQ3THlPT05CZ2ZNeHAwU3FDZG82bXN1NDFDS3p1YmlTWThLQW85U2FBTjJZaG0zRG9haG5JRVp6VmZUN3FPNXRzeE5rQ252bHNqTkFFTmsyWnVhMnQ0OHNZckVJYVBKRlhMUzVENFU5YUFORlJ3QlVjc2U0RVUvY0EzRk9KNDZVQVpjNDh0eG1wUnlnWUdpK0FZWTcxSFluZkd5TWVsQUYyMXZsOHBsZHVSMHJhc0psZU1ITmMzSmFxVko2VmYwaFdFT0F4NE5BRyt6QTk2ekxtVUJqeUJVckZ3bkJyT25YZTNKelFCQTh1Wk0xMHZocWJEN2owQXJuSllzS0RqbXJtazNSZ0RqdVJnVUFlbzJUNWlEZW9xanJGd3lwOG5XcHJOd0xSZllZck0xU1hLdVNlRFFBdWpBdGNEUHJYZHhMKzQ5ZUs0Ynd6QzA4eEN0d1BTdTdnSThzTDZDZ0R5L1dZc2FycUhIM1hCTlZQTk1neHQ1clgxcE02emRBZjh0R0kvR28wc2pBRGdidldnREtWbElDdUNCMnFOSUpQTnlveUsyREVDUmtBZlh0VHhGc0hINTBBWkwyUWNZZGNOVkdXMWEwa3lNNE5kUTJObUNWcXBjMjVkQ3h3eStsQUZUVEwvRWdMbmhlQlhRUTNpU3VBR3lLNU40a1JqZ0hpcmxoY0xGay93QVhvYUFPM2ptRG9EbW81WC9kZmpWalRiZUxVTFJURTJ5VUxuSHJXUmNUTkd6eHR3Vk9DYUFIWDdOOWtjbnNLK2RQamxjR1d4dFJqanp6L0kxNzllM1FOazJUemcxODUvRitUekxhSmZTZitob0E4cm9wVFNVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBRy9Zd0VrVjFPa1dPNWx5S3A2WGFjZzRyb0lKa3RsSjZzS0FOR1IxdFlDcThZKzgxWWMrdXpPekpBdU93SjVxSzZsbHUySzVPTTlCMEZXck93V0libUdXN1VBWE5EczVyeVJKcngyTVNISVVuN3gvd3JwWmlCd01WV3NoNWNDZ1ZLM3o4L2hRQkF6dEVyRmZ2SG9UVitPYU5MWVJSdmtqN3g5VFZDVk1pcWd0aWl5T0pDTURQV2dEWmprQXp6MnJuZFN0R244eVhxQzJhdDI2M053eWgyMm9hMHpiNGlDWTRvQXo5RmkrenFlMlJ5SzI3Wk53eXdxa2thaDhWcFJmS29vQUpJd1Y2VlJhSm9wZDZDdExka1ZGS01naWdCOEVtN21wdk5HM0JyT1FtSmlQNGFjSmdjZ21nQjl4SU1ubXFzRTRqbjQ2R3E5M2NvckhMQWZXc3lXL0NzUXVTZXhGQUhWTEx1UWdHcmVqc0FaRjZuTmN0cGQ4NVpsbFBCcloweVlyZEFEb1Qxb0E2UWpJcXE2QmNuMHExR3d3VFQ0N1pwNVVqNkZ5QlFCazNtOUFxbFRrak9LclJsZzJWQk5kSmUycVBkRTU0UEErZzRxV0d4Z2dCWXJsRzYreG9BbHNQRUVjV25ZbkpWMTY1ckExZnhWRzUyeHNXendNVnIrUkhldTFzSWx3UmpJSFVWZ3RvTWR2ck1VVGdFS2R4b0E5SDhIazJXaGZiTG5obkdRUDZWdDZKcUgyaU9SM1BYa1Z5bW82Z0pyVkxhQWdSd3I4MlBXckdteUcxMHlhY2s3VVFuOGFBTSs0dTB1TlRuZGp3SEp6K05UcGNsd3JZUFRyV0ZiRmlubXJqNWp5YTA3YVZoMEhGQUdqR2l1Q1Rta2RkcVpYa1ZMR2NxTUNraTRZZzhnSHBRQldrVStXWFVBaXNLNHZwQ3hqMjdSbmdnMTBOMSs3QmFQTzBja0N1ZnZkc3R4dml4N2dVQVJDUS9LcFlienpnMVlzTjhtb3dXOHNXREl3QStoNzFRbVFsd3g1SnJyZEtXMnVyUzNWbUNYTVdCRklmNzNvYUFPamxBMHVTUHlSL0R6WE4zZDJ0eGRUU2pqSnlhMXRXdUhOdkMwcEhtQlFHOWpYbWQ5cjhkdjRpTmk4Z1V5eE15alBVNS93Qm9BMTlVdnhIYnlMbjFyd2I0aVhCbWprVnY0WnVQZmcxNkw0aDFRS2pCVzRyeWZ4VmNyT0pWSitZL01Qd29BNDl1dE5wVFNVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBSHFOdEd3R3hCZzl4VnlLMFZzNTdkU2VsU1JRK1hIbHF5Nys5RWtua3EyRnpnZ1VBYTBVTWFvZnN5ZVkzZHVncFNIUmN1UnZQWWRxMUxLSlJiSkVvQUNnVm02NUtsaW1Pcm5vRFFCZWhuK1ZZMU9XUExIMHE4ckxqaml1ZHRKaEhFbXc3blBESDFOWDB2azI3U2ZtNzBBWDVIK2RjZXRWcEI1a216T0Z6elViekJpREg4eDdZcVcxWGhtYmxpYUFOSzNaVlVESFN0QndIaUREMHJHU1RCOUswN2FiZERnOXFBS2tZL2Y0cTcwT0FLcVpVWEdjMVlacUFMQzlNMUhMd0RTb2NEbWtrd1JqdFFCVkxrbm1uUmdIakZETGpwU0E4MEFaOTVhSkpkamNNOFZKRmFRWjRRWStsWEhpK2NNUjFGUTh4UG50MG9BcXpXQWpJZE9tYXRXeENPakRpclVlSkYyZzlhZ0NEbGU0b0E2N1NZeE1BekhnRE5hZG9WanVKcFR6NVNISCs4ZUJXRHBWMG9YYm5BQ2dWclJPRGFMZy9OTk5rL1FVQU92SkFzb0dPZ0FwTGRwTGlRUmpvYWJkSnVsQjdFNHJUMHFOWUNXYkhBeUtBTkRTOU0reXhpVmhsaHpuMk5jNXJqZ2F3VlUvTW81cnZ0cE9qaVR2NVJOZVh5eUc0MVNhVW5qZGdVQWJWaEY4Nzd6Z091TVYwR29XcXZvVFJLM09PbnJXUHBXblBjQXlTTVFvSEFxRFhIbWdFVVc1bUE1SE5BRk5vM05xZkkrNk9vcWJUWlgyWW1CQTlmU3FtbnpTSkkrOG5ZZTNwV2tGWVJOS29HMGVuZWdEUmdrVmdWM1lZZmthdFJBUDFINDF4RnRxeFM5a1FqTVliSDByY0dwZVVxNGtISjYwQWFsNjdSeDVWZm1GYzdOODB4Y0x0WTlRT2xYTHEvM29IREVrOEVWUlNaSHlWNjl4UUE4eEF4czJSbXRMd3VpWFZ4TGJUNUNUREdlNnNPVllWbGVhRmZiaklOYk9pNFM3amZHTUhJTkFHZjRsMVNXMnZaNHJrbFpFeHZIYlBxUFk5YStmdkhHcHkzL0FJemhXeGtJY0FLcnI3NXlmeU5lOC9GejdPK2lYT295a3I1TVpFaFhyanNhK1QzdjVmdDV1a2MrWjBESHIweFFCNkhydXBxTW9aT1Y0NU5lZmFuZG00dVdZSGdjQ29MaTZsbm1ra2RqbDJMSG4xcUNnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FQVk5VdTVJWXlxSDVpT3ZYRmM1YnNUZEljWk80Yy9qVy9xTVNsQ281UGMrdFY5TzA3RW9lUVl3YzRvQTdTQ1JJTE16U1kyZ1pyaW5NMnRhd3puUGxxZUI2Q3QzV3JvQzFqdGtQek4xRlRhTFlpMnRnU1BuYmswQVVsc3pCS25QQXJhaHQ0V1RsQmsxV3VFNUdPT2MxYXQySUdUUUE5b1ZpUXJBZzNuZ2UxQ2dSeDdjNUk2bWw4M0tranBVS0VrTVc3OUJRQTE1ZWNaeFZxMG5LZzVQV3NxNEpWcWxnbTR3T3ZXZ0RVWUZpU3ZhcDQ1Q3lnSHJWS3d1Ti9CNjVyUTJjL0tLQUxFVFUxMkhQMXBJMWJhY2ltc2pjMEFSU09ja2lrWnN1T2FrWlNRUUtqTU9GUHJRQmJXUlhRZW9xdEtCdXdhZ1dYWTJNNHA4cjdsem1nQjF2OHJZejdpcmx4YnFzc0Rxd3hNUDFyTWp1QkcyWFBBcXI5dG1sdjBmQkVTSDVSUUIwYUJVNmNHdHZTMTNxaEpPRlBGYzdGTUpTRFhUNmRoYllIRkFFOSsyeU5TdlhkbXJjVng1NnhSeGZlT000ckkxQ2ZjNFJlY0N0THdraEZ5d2srOTJvQTdXTE1pQzFROENQWWZ5cnpTM2kyVHVEMURFZnJYcDJteCtYY01UemtacnppTDk1ZVQ0NmVZZjUwQWRmb1dXaUM0K1VEbXFYaUtNQ1lTNHlGT01WdGVHclpqYk9jY0FaSnFoNGhqVklta2ZKVkNLQU1TNHQwMitiR01CaHlwcVdjZlpkTmJZU3lqR2FzMlFqdklzeGtGY1ZRMVliSVRFU3lodTQ2R2dEbkpva1M4Wm93TnBPY2UxU3kyQTVlRjl3SXp0elRESDVRRWcrYkhXbVNQaTQzeHN5Zzg0elFCTXhaSXNxZUIxQnFDQzVHNDd1dExJeEp6bm5vUjYxWFdITXVGNzBBYUVjd2FVYk10WFEyTW9WTXQxQnJLMGUzMnlFT21TUndUV2xxU2kzaVpsSUhHU0tBTWJ4bFBIY1dkeGJ6L05ES2hSeDZnaXZsSzdoK3ozVTBKT2ZMY3JuNkd2b2Z4UHFPK0dUbnBYZ2ZpSGFkWHVHVG81M1k5RDNvQXpxS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BOVVlZEJJY0F1L1pSMnFkb1hlQXM3N1QvZFdzYUcvYjdTRjJLaUhqanJYUnF5SnBrazdZNEJ4UUJCWVc2MzF3c3hHNVYvblcrVGdZckwwTGJGWXFxNDU1WSs5WFdjWjk2QUdYUTVxczEyc2UwRWZlTzJydUE3RlNlY1ZXazA0VFB1emdyeUtBSm8yL2Q0enhUeGdwaXFhUVNSRWt0eDZWTkNUbm1nQ0s1UVlPYXBRSDkrQXA0UEZYcnJsRHhVR21vSGxERWNLZjFvQTFJWWRnVXIxclNpa3lPT3RQamkrVVo2a1VyVyswN2tvQXN4bktDaGt5TW1xOGJzTWc5cW5Fb3gxNW9BYVZBR2NVNVZFaW5hT2FSblhGVm11UkFkeFBGQUdmcVVUNE8zZzVxckFMbHhoUnlmV3RLT1lYRXBMcjhySGlwZktNTDdsb0F5a3Q1VUpNcHlhc01xTkdjREJGYWJMSE1tN0dHNzFUbWcyZ2xmeW9BZHBiZ3lGU2VoSFd1MnRDRGJ4cWV1Szg2UXVrd2RPb05kZFlhbXNrZUFDR0NqaWdDN2dlZXpjR3QvUWdQUERKakJPRFhKTGM3SlFYQit0ZEQ0WG1CdTJYT1VZZ3FmUTBBZC9icm1SUi9lRmNEQmFHMzFPNFFnNDNISDUxMmQ1STl0RWtvNnFhNXVPY1R6VEhHNEZ6eU92V2dEcmRFdW80Tk5jSDVuYmpBcWd2bHpTWE1Wd0FZNVJnZTFVWUdrQ25QeVJJTWtEdFdZbDg5MWViWWlWVW5ieDZmNG1nRGR0Tk5TSzNZUmpBQXhYQzYzTExiM1poM0VxVG5CcjFXMWgyMmV6T1d4elhtUGpXQm81WkdDL01uSW9BNXNYenhzNFFBNE9DdnRUSTlRaGsrV1FiRDJOWlR5eVB1a1Roczhpa1FDVGtuazBBYnJ0bFZPUXc5UlYzVDQvTVplZnhyR3RJMk9CelhSNlJFVktnMEFkQWtIbFFCd1FjaXNiVmJ6TWNpc2M4WXJabmtDSmduQ2tWd2ZpSzk4cEoySjRVRTBBY1ZyOTZxeU5HemN2a0wrRmVTNmlkMTlPZlZ6WFVlS3I4bTd0WlViSUdXL00xeU1yYm5aajFKb0FaUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBSGNSMmN5NGRseTNxZTFiR3ZHU0xRTGVPUGhtSUxIMnFHL25jVENLTEcwZGVLa01vdWpKRTV5cktBUGJGQUVXZ1hjc01JU1RKVWl0eU84aWtQRFlJck8wcEk1dDhTZ0t5Y0VWcVFhZERHcFoxRzQwQVQycE1zcnVoeUNBQldyRXVCelZPMlVScmdBQWRzVmNSdUJ6UUFTeGdxZU9hckxHQWF0TWNWQ1NNazBBUXp3QW9mUTFCYXdMRklOcFBYbk5XWGZJTlY5MjF2ZWdEb0VKeDdWSW1jYzFWc3BOOEtuMnEycG9BaW5USU8zcldmSUpWRGNFMXMvTGlxOG9TZ0NqYmlkMEE0VWV0VEphZ05tUTdqNzA2SmdCVDkrN3ZRQXZrSVFTRGo2VkpuY2dEZFJVQmNxZmxxUXNHUU1PdEFDRkNweXZTb1NTd1lkNnQyNzd1RFMzRnZzSWRSUUJqdmdNZU1Hcm1uekZKRlBGUTNxTHc2WUhyVU1ESGRuUEZBSGYyc1VOL1pNdUY4ekdLeHRIdVhzZFJhS1RQeXRVMmdUc3JJVlBQZWp4SkdzT294VEQ1UklNL2pRQjNUelhkOVlFUUxHd0F5QTFZSU9veFhEQmxpakM0SktqMXJVOEYzZ2RGUmo3WXB2anE3aXMxQ2x0cGNBY2Vnb0FnVFY4YWJkQmxKQktrTjZqbXM3VEx0UmVCbzFBSjRXbzVpZzB4SERBUnVvUHBuclZYU1hXVzhpV0k4N3Ywb0E5ZjB0QW1uQWs1TzNKUHFhOCs4WEtKSGw2Zk1hNzB5ZVRwbU8rQVB4cml0V2dMNzg4ODVvQTh6bnMvSm5jWStYc2FTRzNBYmpwWFJhaGE3dVNPbkZVVnQ5cDI5RFFCSnAxdnVZQUN1aHNyWUljazhWV3NMTWhOd09HUEZhZDRGaGlDcWVjVUFZdXNYM2xoeHV3VnJ6UHhqcWFpeHVtTEQ1a0lINDhWcytNdFdGdE5JekhBSnhYa3ZpdlZ2dFVnaWpiS3FjbWdERXU1Mmt3R09Rb3dhcEduTTJhWlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQjZuTFpsb3lWR2ZlbVJXT3dENXVldWEya3RXaGliNWk4WjZlb3BnWDkzakhOQUdiWnhGTDNjdkhmTmJydnVRNTQ0cWxHdnpic1ZZTERabWdDYTFKeG44S3RnbXFsbzJJcW5EWTRCb0FrWmowSFdvQXhWdVR4VW1SMU5SRlE1SjdkcUFCM0JVa1ZVbGJCSjcxWlhCM0RISXFuY3R0eWZUOWFBTnpRWDgyTmxCeVJXdXd4WE1lR0pTTDFsNmJoWFVTQWhjbWdDSjM2aXFzamNITkxJL3dBeHowcXZJNXhuclFBMUhBSjlNMUtyOCsxWjhqbERrZE0wc2R3RzRQV2dEVzNaaTNEcU8xVi9PQ2sraDdWQkZjRkRnOUdxRnBNT2NjMEFha0Ric0ZEaytsYVZzNGxVby9XdWVna3d3WlNWYXRteXVvNVNGbXdyZG5IOWFBSzkvYi9LU3ZBOUt5Rk94empOZFZlUWtLTTlHSFVWeTF3UEx1R1UrdEFHOW9zNVVncWVhMi9GQ0xjYUlsd09OakQ4SzVuUjgrWUNPbGRySENMblM1cmQvdXlKOHVmV2dETThHYXNJM1ZYT0dCNit0YkhqcVV6L0FHSzdFU0VENWNOem44SzR2UlpoWmFuNU15akFKR0Q2MTJ3dG0xR3hNWS9oK1pSUUJ6MHYyclVqdnVKTTlnb0dBQjdDcHJaR3M3aUoxQitVak5TT1BLWGJnZ2ppaUc3ajNiWmNIUEZBSG9PbWFqOXZSRS9nUmQ1UHZVVnpFSkdlcTNoZmF0akk0L2lPTTFidFpWbGVVKzVINUhGQUdBOWtzck9NYzRPS3oyc1FTQ2VvTmEwVnlCcVVRSStWbVpmMW9XMGtFN2xzN0d6L0FEb0Fqc29HZmNRTVJxTVZrNi9kaUdOc25rREZkRks0dHJac0hxTTE1ajR4MUhHNzVxQVBMZmlacWpTVHBDamNuSk5jRkpJWElKNmdZcS80aHV6ZWF0UEp1M0tHMmo4S3phQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0QzcEVSWVBJejA2Q3F0OG1JOTBXUjZpbnlTWXVzcWVRS2E4Nk1HVThOUUJSUnNScnp6VW5tWVNxN3Q2WTROTWQrT3RBRnl5bTNLUlZ1TitlTzFZU1M3Sk1EdWEwNEpBVjRvQXU3dlNtaDJESDBxTkc2MDB2bHFBSHo1WE1pZHV2MHJPdVpOdzNEcFZpNWNtTm84a1pHS3k0c3JHVUorNzYwQVhOTXV4QmZRWXdOekFHdlFKeC9vNms5eG12S0paU2t5RmVvYk5lb3hTK2RwOERBOVVIOHFBS00zZmlxa3g1QTlhdVNFN3NacWpmemkzdEpaaUFTb3dQclFCbXkzc1Qza2xzRDh5OWFJNU5qRWQ2NWl4OHdYSm5mTzVtelc2WDNESk5BRjE1UU1HbU5jOGdrZHFxTy95OWFydGNmTUFLQU55RncrQ0t1MitRY2RSV0RiWEhJNXJYc3JnWkdhQU9wc0F6VzVqWWxvK285UlhOYXpIc3VjanZYVTZHVWx3T2g5YW8rTDlQTVlXWEhIclFCbDZOY0JabERIZy9yWHBPbklrOWpzSFVqZzE1SGJrby9XdlMvQmwySlkxamMvTU85QUhIK0tJR3Q5V0tOa01BTU5qclhhZkRyVXc3aUM1T1hIVFBlb3ZpVHBxWXRycEIxRzFzVmkrRlVZM0NiTWlSVGtOUUIxZXYya1NhaE5HbnlnOHFleHJrekdQdHV3bmE2bm9lbGQ5ck5wOXFzVW5IQmpYQnJpNy9BR3pFWVErWUY1YjFvQTZLMjFTS0czRU1EQWdEL3dEWFUrbFRNc1RGajIvVTgxdzR1UkZlUnFDZlRub2E3alI0L08wMXBNOTZBRytTV25UMVU1RmFnY1BieXFmdkJoK1ZVNEQ1Y2h6N1ZZdUNvM3NEZ2J1bEFHSnI5M3RnYm5nOUs4UzhlNm41VUU3QnVjWVg2bXZUL0ZWMkFqalBTdkF2SGQ0WnJ0WVFlRitZL1h0UUJ5TkZMU1VBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBSHRLeWJwbWJwU1RvSGpQclNSeVJrT1IwcE4yUWNVQVp4Y3JrRTV4M05KdUZMZUtVYmNPOVFnNUdhQUhQaXJWak1DcFVubk5WTzNXb2h1Vjl5bWdEZlRKSEhlbXNUbmsxQmF6R1JSenpUYnVZUS9lSm9BZEsrR09UeUt6M2ZFcDU3VU5PWEoySXpINlZFWXBPV2NZSjdVQU10c1N6c3pjYzhWM09sWE9iQkU1K1hpdVN0WWxYSUEvR3RTMG5lQkdVbkttZ0RlMzdzMWdlSlovbGhnWFB6SGNhMXJhWU1NWkJybjlUUG02c1EzM1VHS0FDT0JYaUFBQXdLQU5xNDdpcktKdFRnY0dtc0I4dzc0b0FxVFNCVjVQTlo2U2t5bHM4SGl0WkxSN25JeDhvNzFrelFtRnluUEZBRnVDUVpPZURXaGJUc0QxckI4empOVzdLOEFPMlRsZlh1S0FPKzBDKzJPQVRYYzNGdEZxMmt2SHh2eGtmV3ZKYk9SNHNTb2R5ZXRlaWVFOVNXUUJTYUFPRXZvR3Q1M1RHQ3B4VzE0VjFGcmE2VU1lTTFxK1BOSzh0dnRrUXh2KzlqMXJqck80TU13M0R2UUI3VnJ0dXVvK0hXYk9kZ0Rpc3Z3YnB5UEJNNEh6bmhUNzA3d3ZmQzgweVMzTGNiZldyT2gzSzJLbFhQQ21nRGRsVS8yWVk4WUxIRFZqejZRc2k3bFhsZjFyb3dwdUxaM3dPZVJTUVIvdTJ6enhRQjVOcm1qeTJtb2tkVVBJcmU4T2FsNVZ2SmF5OFlYSXJlOFpXZWJTenVrSUFCMnR4K1ZlZDYxZE5aM1Q0WGFTT29vQTd4cnFKbjNJUjgyRDlLeGI3V0ZWNUJ1NEZjVzNpY1FxUVh3d0dPYTVTOThUQjNJRW5VNVBOQUczNHExY01IQWF2RjlXbiswWFVzaFAzalhSYTlxeGtSL201SXJrSlgzRTBBUkhyU1VVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFIckZsS0hpYzk4OWF0cGduQjZWbldCMkl3SjRKRlhOeEdPZXRBRDdoQTBiREhOWnlxZVFSeUt2bzM0bXExd21HSlRyUUJDbzYwU2o1Y2lvaSsxc053YWZIaHlGQnpRQXlDNktOK05iMFFqdWRoNElISnJBU0JUSjdaNU5kQlkyeXhwOGpaeUtBR3Q1VVpZQUFkcW9UZnZIQVVuQVBOT3ZvSm11dGtiNEdjMWJzYmZiQzZ0OTdybWdDcEdNWnpWbUxKT0QwcGpMbkl4VXNBMm5GQUVxYjRQbUdTdFowcmY2ZThoNk56WFJRQkhVQnU5Vk5SMDBGR2tqeGtjNG9BaFJzcUN2SW9NUWZrZmpWVzNmWTJCOU1WZWp3UnVXZ0MxYk1xcnR4Z1ZnYTlIc3VHWmVocmJBeU9lS3k5YlhNWUo2aWdEbm1iQjVJd2FqUUZINGJLbnRTU25PUWFnRTVYUGYyb0E2SFNOUmExZmF3M1FucXRkcHBWd3FPbHhhdHVqUHAyK3RlYTI4eXlkT0Q2VnZhTHFEMkV3S25jaFB6S2U5QUh1TUFqMXZTR3Q1TUNYYjh2MXJ5N1ZMSjdTNmtqa1VobFBRMTJYaDNWSThSeUlkMEw5RDNCOUsxdkZPaVI2bllOZHdZTXlqT1Izb0E1UHdaZk5EZVJveElYT0RYb2VvV3NYMmxObk1Vb0dQNjE1ZnBjTWtkeXVlQ3ByMUN3ZnpMQ0ZwT1NoNHpRQjArbllNU3IyQXdLa2xUeVMzb1JWU3hiRVlQclZ2VVFXdEJJdVN5OVI3VUFVNzZHTzYweG9aZVU2ajhLOGI4WkRkRWtpZHNnNDlNbi9DdlQ5UTFKWXJOeG5CSFN2TGRXYzNGdGNxZW1EZzBBZVErSXRXTU1ySXJmT0Qwcm1CZU8wb0xOeDNwbXB5dExmVHUyZVhQNVZUb0FzWEZ3MHJzU2VLZ3BLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0E5T2lKdzQ5QlV5VFpVWlB6Q29sWGpIZXE4a1VpdHVIRkFHa2plaHptbGxQeTVyT1c3OHBzU0FxUFdwaGV4TmxWSlkwQU11U001SUhGVDJ1M2NjZHhWZmI1dWQvd0NGUUs3eE1jRElGQUZ5RndlUFFrVnMyVTZvb3llSzVlSzdSWkpEbmduTlY1dFlrYmRIQ1BiTkFIVzNFOGY5b3JzWUg1ZVFLdlJGY2hoelhHNk9XTWdhVW5kWFVXMG1BQWVsQURMeVB5NWo3OC9Xb29ud2NIdFZxK0FhQUU5VnFnSHovalFCcVFOam9lUHJWOUpReUVNZUNNVmpRdmtkY1ZiZ1k1OWFBS042Z2h1R0E0NXlLZGJ5a0VBOUtzNnBCNTF1U003bDV5S3hJcnN4dHNsNUhRR2dEb1l5R1hpczNYbEl0eWU5V0xPNVZ1QWZ4cVcvVVMya2dZWk9LQU9GbnlHUHJWZlB0VnU5d004ZEtvYnVDRFFBSGNqN2xKeDFxN2FhaVI4cjFUVjg4R24rU0d5Vk9EUUIzWGhYV2phVEJYTzZCejh3L3VuMUZleWVGZFhnbVpiYWRsdzQrVTU0WUd2bXEwZVdCeHRKSTcxNkQ0VTFrblpIS01FZEQ2VUFlbGE5bzBlbTZrcnAvcVpUbGY4QUN0SFQ1b3dxbzdaQTUyait0WWs5N1BlV1NpWnkyd1pVbnJXaDRiWHo3bENGQkFvQTZxR1RHQURqUGFycjNRampLc2NqYlhPVzkzNXQ1S2M4STVYOWFrMVcrRVZ1SHowWVorbEFIUDY3SVRQS3U3S1pPSzVIVWYzRWJaNllyVzFLK0VzK00vV3VhOFU2aWxyYlNTeW5iSGpHZXdQdlFCNG40bmhXTFY3alpqYXpFakE5NnlLdmF2UDU5OWNPUHVzNVlET2FvMEFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQWYvOWs9KSc7XG4gICAgYXZhdGFyLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2NvdmVyJztcbiAgICBhdmF0YXIuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gJ2NlbnRlcic7XG4gICAgYXZhdGFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpJztcbiAgICBhdmF0YXIuc3R5bGUuZmxleFNocmluayA9ICcwJztcbiAgICBhdmF0YXIuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlciknO1xuXG4gICAgY29uc3QgYXV0aG9ySW5mbyA9IGF1dGhvclJvdy5jcmVhdGVEaXYoKTtcbiAgICBhdXRob3JJbmZvLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgYXV0aG9ySW5mby5zdHlsZS5mbGV4RGlyZWN0aW9uID0gJ2NvbHVtbic7XG4gICAgYXV0aG9ySW5mby5zdHlsZS5nYXAgPSAnM3B4JztcblxuICAgIGNvbnN0IGF1dGhvckVsID0gYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1N0ZCRFx1OUNERVx1NTQxQicgfSk7XG4gICAgYXV0aG9yRWwuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgYXV0aG9yRWwuc3R5bGUuZm9udFdlaWdodCA9ICc2MDAnO1xuICAgIGF1dGhvckVsLnN0eWxlLm1hcmdpbiA9ICcwJztcbiAgICBhdXRob3JFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXh0LW5vcm1hbCknO1xuICAgIGF1dGhvckVsLnN0eWxlLmxpbmVIZWlnaHQgPSAnMS4yJztcblxuICAgIGNvbnN0IHJvbGVFbCA9IGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTU1QjVcdTVCNTdcdTk5ODZcdTUyMUJcdTU5Q0JcdTRFQkEnIH0pO1xuICAgIHJvbGVFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXh0LW11dGVkKSc7XG4gICAgcm9sZUVsLnN0eWxlLmZvbnRTaXplID0gJzEyLjVweCc7XG4gICAgcm9sZUVsLnN0eWxlLm1hcmdpbiA9ICcwJztcbiAgICByb2xlRWwuc3R5bGUubGluZUhlaWdodCA9ICcxLjInO1xuXG4gICAgLy8gXHU0RjVDXHU1NEMxXHU1MzNBXG4gICAgY29uc3Qgd29ya3NUaXRsZSA9IGF1dGhvckJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ09ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NEY1Q1x1NTRDMScgfSk7XG4gICAgd29ya3NUaXRsZS5zdHlsZS5mb250U2l6ZSA9ICcxMXB4JztcbiAgICB3b3Jrc1RpdGxlLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRleHQtZmFpbnQpJztcbiAgICB3b3Jrc1RpdGxlLnN0eWxlLnRleHRUcmFuc2Zvcm0gPSAndXBwZXJjYXNlJztcbiAgICB3b3Jrc1RpdGxlLnN0eWxlLmxldHRlclNwYWNpbmcgPSAnMC42cHgnO1xuICAgIHdvcmtzVGl0bGUuc3R5bGUubWFyZ2luID0gJzAnO1xuICAgIHdvcmtzVGl0bGUuc3R5bGUuZm9udFdlaWdodCA9ICc2MDAnO1xuXG4gICAgY29uc3Qgd29ya3NSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KCk7XG4gICAgd29ya3NSb3cuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICB3b3Jrc1Jvdy5zdHlsZS5nYXAgPSAnOHB4JztcbiAgICB3b3Jrc1Jvdy5zdHlsZS5mbGV4V3JhcCA9ICd3cmFwJztcblxuICAgIFsnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCddLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCB0YWcgPSB3b3Jrc1Jvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogbmFtZSB9KTtcbiAgICAgIHRhZy5zdHlsZS5wYWRkaW5nID0gJzVweCAxMnB4JztcbiAgICAgIHRhZy5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNnB4JztcbiAgICAgIHRhZy5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWJhY2tncm91bmQtcHJpbWFyeSknO1xuICAgICAgdGFnLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpJztcbiAgICAgIHRhZy5zdHlsZS5mb250U2l6ZSA9ICcxM3B4JztcbiAgICAgIHRhZy5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXh0LW5vcm1hbCknO1xuICAgICAgdGFnLnN0eWxlLmZvbnRXZWlnaHQgPSAnNTAwJztcbiAgICB9KTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsV0FBaUI7QUFDZixTQUFLLElBQUksVUFBVSxtQkFBbUIsc0JBQXNCO0FBQzVELFNBQUssYUFBYSxLQUFLO0FBQ3ZCLFNBQUssY0FBYztBQUFBLEVBQ3JCO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxFQUFFLFVBQVUsSUFBSSxLQUFLO0FBRTNCLFFBQUksT0FBNkI7QUFDakMsVUFBTSxTQUFTLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUUvRCxRQUFJLE9BQU8sU0FBUyxHQUFHO0FBRXJCLGFBQU8sT0FBTyxDQUFDO0FBQUEsSUFDakIsT0FBTztBQUVMLGFBQU8sVUFBVSxRQUFRLEtBQUs7QUFDOUIsWUFBTSxLQUFLLGFBQWE7QUFBQSxRQUN0QixNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVixDQUFDO0FBQUEsSUFDSDtBQUVBLFFBQUksTUFBTTtBQUNSLGdCQUFVLFdBQVcsSUFBSTtBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxhQUFhLE1BQW9CO0FBQ3ZDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0Isc0JBQXNCO0FBQ3hFLFFBQUksT0FBTyxXQUFXLEVBQUc7QUFFekIsVUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLFVBQU0sU0FBVSxLQUFhO0FBQzdCLFFBQUksUUFBUSxlQUFlO0FBQ3pCLFVBQUksU0FBUztBQUNiLFVBQUk7QUFBRSxpQkFBUyxJQUFJLElBQUksT0FBTyxHQUFHLEVBQUU7QUFBQSxNQUFRLFFBQVE7QUFBQSxNQUFpQjtBQUNwRSxhQUFPLGNBQWM7QUFBQSxRQUNuQixFQUFFLE1BQU0sSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQUEsUUFDaEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQzNFO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsRUFDbkM7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJzdGF0IiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
