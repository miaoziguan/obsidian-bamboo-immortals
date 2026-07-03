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
    this.configDir = ".obsidian";
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
          const skipDirs = /* @__PURE__ */ new Set([...DEFAULT_SKIP_DIRS, this.configDir]);
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
        const configMsg = msg;
        this.settings.sectionConfig = configMsg.payload;
        if (this.saveSettings) await this.saveSettings();
      }
      this.respond(msg.id, { ok: true });
      return;
    }
    if (msg.type === "app:saveCustomNoises") {
      if (this.settings) {
        const noisesMsg = msg;
        this.settings.noiseItems = noisesMsg.payload || [];
        if (this.saveSettings) await this.saveSettings();
      }
      this.respond(msg.id, { ok: true });
      return;
    }
    if (msg.type === "app:toggleTheme") {
      const themeMsg = msg;
      const targetIsDark = themeMsg.payload.isDark === true;
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
        const paletteMsg = msg;
        const { hue, lightnessOffset, isDark } = paletteMsg.payload;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBEYWlseVJldmlld1ZpZXcsIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgfSBmcm9tICcuL3NyYy92aWV3cy9EYWlseVJldmlld1ZpZXcnO1xuaW1wb3J0IHsgTG9jYWxTZXJ2ZXIgfSBmcm9tICcuL3NyYy9zZXJ2ZXIvTG9jYWxTZXJ2ZXInO1xuaW1wb3J0IHtcbiAgUGx1Z2luU2V0dGluZ3MsXG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG59IGZyb20gJy4vc3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqXG4gKiBCYW1ib29SZXZpZXdQbHVnaW4gLSBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTZDRThcdTUxOEMgVmlldyBcdTdDN0JcdTU3OEJcbiAqIDIuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1RkYwOFx1NjI1M1x1NUYwMFx1NTkwRFx1NzZEOFx1MzAwMVx1NTI0RC9cdTU0MEVcdTRFMDBcdTU5MjlcdTMwMDFcdTdFREZcdThCQTFcdTk3NjJcdTY3N0ZcdUZGMDlcbiAqIDMuIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICogNC4gXHU3QkExXHU3NDA2XHU2M0QyXHU0RUY2XHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgbG9jYWxTZXJ2ZXI6IExvY2FsU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VydmVyVXJsID0gJyc7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcbiAgICBjb25zdCBwbHVnaW5EaXIgPSAodGhpcy5tYW5pZmVzdCBhcyBhbnkpLmRpcjtcbiAgICBpZiAocGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGNvbnN0IHdlYmFwcERpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAnKTtcbiAgICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBuZXcgTG9jYWxTZXJ2ZXIod2ViYXBwRGlyKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jYWxTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSB0aGlzLmxvY2FsU2VydmVyLmdldFVybCgpO1xuICAgICAgICAvLyBcdTYyOEFcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdTRGMjBcdTdFRDkgTG9jYWxTZXJ2ZXJcdUZGMENcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcbiAgICAgICAgdGhpcy5sb2NhbFNlcnZlci5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBGYWlsZWQgdG8gc3RhcnQgbG9jYWwgc2VydmVyOicsIGUpO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjcyQ1x1NTczMFx1NjcwRFx1NTJBMVx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTBFOFx1NTIwNlx1NTI5Rlx1ODBGRFx1RkYwOFx1NzY3RFx1NTY2QVx1OTdGM1x1MzAwMVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1RkYwOVx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1NzUyOCcsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0RBSUxZX1JFVklFVywgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGFpbHlSZXZpZXdWaWV3KGxlYWYsIHRoaXMuc2VydmVyVXJsLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnByZXZEYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6bmV4dERheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtdG9kYXknLFxuICAgICAgbmFtZTogJ1x1NTZERVx1NTIzMFx1NEVDQVx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjp0b2RheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TdGF0cycpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU2V0dGluZ3MnKSxcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLmxvY2FsU2VydmVyPy5zdG9wKCk7XG4gICAgdGhpcy5sb2NhbFNlcnZlciA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RkMwXHU2RDNCXHU2MjE2XHU1MjFCXHU1RUZBXHU1OTBEXHU3NkQ4XHU4OUM2XHU1NkZFICovXG4gIGFzeW5jIGFjdGl2YXRlVmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG5cbiAgICBsZXQgbGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG5cbiAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFx1NURGMlx1NjcwOVx1ODlDNlx1NTZGRVx1RkYwQ1x1NzZGNFx1NjNBNVx1ODA1QVx1NzEyNlxuICAgICAgbGVhZiA9IGxlYXZlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NUIwXHU4OUM2XHU1NkZFXG4gICAgICBsZWFmID0gd29ya3NwYWNlLmdldExlYWYoZmFsc2UpO1xuICAgICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoe1xuICAgICAgICB0eXBlOiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobGVhZikge1xuICAgICAgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU1QkZDXHU4MjJBL1x1NjRDRFx1NEY1Q1x1NjMwN1x1NEVFNCAqL1xuICBwcml2YXRlIHNlbmRUb0lmcmFtZSh0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgIGlmIChsZWF2ZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCB2aWV3ID0gbGVhdmVzWzBdLnZpZXcgYXMgRGFpbHlSZXZpZXdWaWV3O1xuICAgIGNvbnN0IGlmcmFtZSA9ICh2aWV3IGFzIGFueSkuaWZyYW1lIGFzIEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAoaWZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICBsZXQgb3JpZ2luID0gJyonO1xuICAgICAgdHJ5IHsgb3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47IH0gY2F0Y2ggeyAvKiBrZWVwICcqJyAqLyB9XG4gICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgICAgeyB0eXBlLCBpZDogJ2NtZF8nICsgRGF0ZS5ub3coKSB9LFxuICAgICAgICBvcmlnaW5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICAvKiogXHU0RkREXHU1QjU4XHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgSXRlbVZpZXcsIFdvcmtzcGFjZUxlYWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9TdG9yYWdlQnJpZGdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7IEJyaWRnZVNlcnZpY2UgfSBmcm9tICcuLi9icmlkZ2UvQnJpZGdlU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX0RBSUxZX1JFVklFVyA9ICdiYW1ib28taW1tb3J0YWxzJztcblxuLyoqXG4gKiBEYWlseVJldmlld1ZpZXcgLSBcdTRFM0JcdTg5QzZcdTU2RkVcbiAqXG4gKiBcdTgwNENcdThEMjNcdTY3ODFcdTdCODBcdUZGMUFcbiAqIDEuIFx1NTIxQlx1NUVGQSBpZnJhbWUgXHU2MjdGXHU4RjdEIFBXQVxuICogMi4gXHU3QkExXHU3NDA2IEJyaWRnZVNlcnZpY2UgXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKiAzLiBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU1RTc2XHU1NDBDXHU2QjY1XG4gKi9cbmV4cG9ydCBjbGFzcyBEYWlseVJldmlld1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgYnJpZGdlU2VydmljZTogQnJpZGdlU2VydmljZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWVFcnJvckhhbmRsZXI6ICgoZTogRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3NzQ2hhbmdlUmVmOiBhbnkgPSBudWxsO1xuICBwcml2YXRlIHdlYmFwcFBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHdlYmFwcFBhdGg6IHN0cmluZywgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLCBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihsZWFmKTtcbiAgICB0aGlzLndlYmFwcFBhdGggPSB3ZWJhcHBQYXRoO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgfVxuXG4gIGdldFZpZXdUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVc7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJztcbiAgfVxuXG4gIGdldEljb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2xlYWYnO1xuICB9XG5cbiAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LWNvbnRhaW5lcicpO1xuXG4gICAgaWYgKCF0aGlzLndlYmFwcFBhdGgpIHtcbiAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY1RTBcdTZDRDVcdTVCOUFcdTRGNEQgd2ViYXBwIFx1OEQ0NFx1NkU5MFx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNVx1NjNEMlx1NEVGNlx1NUI4OVx1ODhDNVx1NzZFRVx1NUY1NScsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1MjFCXHU1RUZBIGlmcmFtZSAtIFx1NEUwRFx1NEY3Rlx1NzUyOCBzYW5kYm94XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU2QjYyIGFwcDovLyBcdTUzNEZcdThCQUVcdTRFMEJcdTc2ODRcdTVCNTBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcbiAgICB0aGlzLmlmcmFtZSA9IGNvbnRhaW5lci5jcmVhdGVFbCgnaWZyYW1lJywge1xuICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1mcmFtZScsXG4gICAgICBhdHRyOiB7XG4gICAgICAgIHNyYzogdGhpcy53ZWJhcHBQYXRoLFxuICAgICAgICBhbGxvdzogJ2NhbWVyYTsgbWljcm9waG9uZTsgY2xpcGJvYXJkLXJlYWQ7IGNsaXBib2FyZC13cml0ZScsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gaWZyYW1lIFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNVx1NjVGNlx1NjYzRVx1NzkzQVx1NjNEMFx1NzkzQVxuICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBpZnJhbWUgZmFpbGVkIHRvIGxvYWQ6JywgdGhpcy53ZWJhcHBQYXRoKTtcbiAgICB9O1xuICAgIHRoaXMuaWZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuXG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2XHU2ODY1XHU2M0E1XHU2NzBEXHU1MkExXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGF3YWl0IHN0b3JhZ2UuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBjb25zdCBzdG9yYWdlQnJpZGdlID0gbmV3IFN0b3JhZ2VCcmlkZ2Uoc3RvcmFnZSwgdGhpcy5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBuZXcgVGhlbWVCcmlkZ2UoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UgPSBuZXcgQnJpZGdlU2VydmljZShcbiAgICAgIHN0b3JhZ2VCcmlkZ2UsXG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzXG4gICAgKTtcblxuICAgIC8vIFx1NjI2Qlx1NjNDRiBWYXVsdCBcdTRFMkRcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcbiAgICBjb25zdCBjdXN0b21UaGVtZXMgPSB0aGlzLl9zY2FuQ3VzdG9tVGhlbWVzKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldEN1c3RvbVRoZW1lcyhjdXN0b21UaGVtZXMpO1xuXG4gICAgLy8gXHU0RjIwXHU5MDEyXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjA4XHU0RjlCXHU3NjdEXHU1NjZBXHU5N0YzXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2MjZCXHU2M0NGL1x1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIHx8ICcnO1xuICAgIGlmICh2YXVsdEJhc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0VmF1bHRCYXNlUGF0aCh2YXVsdEJhc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Tm9pc2VQYXRoKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1NjUyRlx1NjMwMVx1NzUyOFx1NjIzN1x1ODFFQVx1NUI5QVx1NEU0OSAub2JzaWRpYW4gXHU1NDBEXHU3OUYwXHVGRjA5XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldENvbmZpZ0Rpcih0aGlzLmFwcC52YXVsdC5jb25maWdEaXIpO1xuXG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLmF0dGFjaCh0aGlzLmlmcmFtZSk7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUodGhpcy5pZnJhbWUpO1xuXG4gICAgLy8gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlxuICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gdGhpcy5hcHAud29ya3NwYWNlLm9uKCdjc3MtY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy50aGVtZUJyaWRnZT8ub25UaGVtZUNoYW5nZWQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIG9uQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU2RTA1XHU3NDA2XHU2ODY1XHU2M0E1XHU2NzBEXHU1MkExXG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlPy5kZXRhY2goKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU0RTNCXHU5ODk4XHU3NkQxXHU1NDJDXG4gICAgaWYgKHRoaXMuY3NzQ2hhbmdlUmVmKSB7XG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub2ZmcmVmKHRoaXMuY3NzQ2hhbmdlUmVmKTtcbiAgICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLnRoZW1lQnJpZGdlPy5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWUgZXJyb3IgXHU3NkQxXHU1NDJDXHU1NjY4XG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKTtcbiAgICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgaWZyYW1lXG4gICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUwQlx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1OERFRlx1NUY4NFx1NzUzMVx1NzUyOFx1NjIzN1x1OEJCRVx1N0Y2RVx1NjMwN1x1NUI5QVx1RkYwOSAqL1xuICBwcml2YXRlIF9zY2FuQ3VzdG9tVGhlbWVzKCk6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIHx8ICcnO1xuICAgICAgaWYgKCF2YXVsdEJhc2VQYXRoKSByZXR1cm4gdGhlbWVzO1xuXG4gICAgICBjb25zdCB0aGVtZURpck5hbWUgPSB0aGlzLnNldHRpbmdzLnRoZW1lUGF0aCB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgIGNvbnN0IHRoZW1lc0RpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCB0aGVtZURpck5hbWUpO1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoZW1lc0RpcikgfHwgIWZzLnN0YXRTeW5jKHRoZW1lc0RpcikuaXNEaXJlY3RvcnkoKSkgcmV0dXJuIHRoZW1lcztcblxuICAgICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKHRoZW1lc0Rpcik7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5lbmRzV2l0aCgnLmpzJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGVtZXNEaXIsIGVudHJ5KTtcbiAgICAgICAgaWYgKCFmcy5zdGF0U3luYyhmaWxlUGF0aCkuaXNGaWxlKCkpIGNvbnRpbnVlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29kZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgLy8gXHU1RkVCXHU5MDFGXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1MzA1XHU1NDJCXHU1RkM1XHU5NzAwXHU3Njg0IF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcbiAgICAgICAgICBpZiAoIWNvZGUuaW5jbHVkZXMoJ19fYmFtYm9vX3RoZW1lXycpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTdGM0FcdTVDMTEgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDN2ApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoZW1lcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IGVudHJ5LnJlcGxhY2UoL1xcLmpzJC8sICcnKSxcbiAgICAgICAgICAgIGNvZGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQmFtYm9vUmV2aWV3XSBcdThCRkJcdTUzRDZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU1OTMxXHU4RDI1OmAsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhlbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtCYW1ib29SZXZpZXddIFx1NTNEMVx1NzNCMCAke3RoZW1lcy5sZW5ndGh9IFx1NEUyQVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5ODpgLCB0aGVtZXMubWFwKHQgPT4gdC5uYW1lKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbQmFtYm9vUmV2aWV3XSBcdTYyNkJcdTYzQ0ZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGVtZXM7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIG5vcm1hbGl6ZVBhdGgsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG4vKipcbiAqIFZhdWx0U3RvcmFnZSAtIFx1NUMwMVx1ODhDNSBPYnNpZGlhbiBWYXVsdCBhZGFwdGVyIFx1NzY4NFx1NjU4N1x1NEVGNlx1NjRDRFx1NEY1Q1xuICpcbiAqIFZhdWx0IFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NDpcbiAqICAge2Jhc2VQYXRofS9cbiAqICAgICBkYXRhLyAgICAgICAgICAtPiBcdTZCQ0ZcdTY1RTUgSlNPTiBcdTY1NzBcdTYzNkVcbiAqICAgICBnb2Fscy5qc29uICAgICAtPiBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDdcbiAqICAgICBzZXR0aW5ncy5qc29uICAtPiBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkVcbiAqICAgICB0aGVtZXMvICAgICAgICAtPiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXBvcnRzLyAgICAgICAtPiBcdTYyQTVcdTU0NEEgKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXZpZXdzLyAgICAgICAtPiBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuZXhwb3J0IGNsYXNzIFZhdWx0U3RvcmFnZSB7XG4gIHByaXZhdGUgYXBwOiBBcHA7XG4gIHByaXZhdGUgYmFzZVBhdGg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgYmFzZVBhdGggPSAnYmFtYm9vLXJldmlldycpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLmJhc2VQYXRoID0gbm9ybWFsaXplUGF0aChiYXNlUGF0aCk7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4ICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlRGlyKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vJHtkaXJ9YCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTU3RkFcdTc4NDBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODRcdTVCNThcdTU3MjggKi9cbiAgYXN5bmMgZW5zdXJlU3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2Rpcih0aGlzLmJhc2VQYXRoKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTM5Rlx1NUI1MFx1NjVCOVx1NUYwRlx1NTE5OVx1NTE2NSB2YXVsdCBcdTY1ODdcdTRFRjZcdUZGMDhcdTY2RkZcdTRFRTMgYWRhcHRlci53cml0ZVx1RkYwOVx1MzAwMlxuICAgKiAtIFx1NjU4N1x1NEVGNlx1NURGMlx1NTcyOCB2YXVsdCBcdTdGMTNcdTVCNTggXHUyMTkyIHZhdWx0LnByb2Nlc3NcdUZGMDhcdTUzOUZcdTVCNTBcdTY2RjRcdTY1QjBcdUZGMENcdTkwN0ZcdTUxNERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcdUZGMDlcbiAgICogLSBcdTY1QjBcdTY1ODdcdTRFRjYgXHUyMTkyIHZhdWx0LmNyZWF0ZVx1RkYwOFx1NTQwQ1x1NjVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFx1NTQ4QyBPYnNpZGlhbiBcdTdGMTNcdTVCNThcdUZGMDlcbiAgICogLSBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDhcdTc4QzFcdTc2RDhcdTY3MDlcdTRGNDZcdTdGMTNcdTVCNThcdTY1RTBcdUZGMDlcdTIxOTIgYWRhcHRlci5yZW1vdmUgKyB2YXVsdC5jcmVhdGVcdUZGMDhcdThGQzFcdTc5RkJcdThGREJcdTdGMTNcdTVCNThcdUZGMDlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdmF1bHRXcml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vcm1hbGl6ZWQpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsICgpID0+IGNvbnRlbnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudFBhdGggPSBub3JtYWxpemVkLnN1YnN0cmluZygwLCBub3JtYWxpemVkLmxhc3RJbmRleE9mKCcvJykpO1xuICAgIGlmIChwYXJlbnRQYXRoICYmICEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGFyZW50UGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhcmVudFBhdGgpO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhub3JtYWxpemVkKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUobm9ybWFsaXplZCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKG5vcm1hbGl6ZWQsIGNvbnRlbnQpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTZCQ0ZcdTY1RTVcdTY1NzBcdTYzNkUgKGRheXMpIC0tLS1cblxuICBwcml2YXRlIGRheVBhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhLyR7ZGF0ZUtleX0uanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8YW55IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1RkYwQ1x1NUMwNlx1OERGM1x1OEZDNzogJHtwYXRofWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsRGF5cygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKGZpbGUpO1xuICAgICAgICAgICAgZGF5c1tkYXRlS2V5XSA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcGFyc2UgZGF5IGZpbGU6ICR7ZmlsZX1gLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRheXM7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU2NUU1XHU2NzFGIGtleVx1RkYwOFx1NjMwOVx1NjVFNVx1NjcxRlx1OTY0RFx1NUU4Rlx1RkYwQ1x1NjcwMFx1NjVCMFx1NTcyOFx1NTI0RFx1RkYwOSAqL1xuICBhc3luYyBnZXREYXlLZXlzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5maWxlcykge1xuICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmIChkYXRlS2V5KSBrZXlzLnB1c2goZGF0ZUtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIGtleXMuc29ydCgpLnJldmVyc2UoKTsgLy8gXHU5NjREXHU1RThGXHVGRjFBXHU2NzAwXHU2NUIwXHU2NUU1XHU2NzFGXHU1NzI4XHU1MjREXG4gICAgcmV0dXJuIGtleXM7XG4gIH1cblxuICAvKipcbiAgICogXHU1MjA2XHU5ODc1XHU1MkEwXHU4RjdEXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXG4gICAqIEBwYXJhbSBwYWdlIFx1OTg3NVx1NzgwMVx1RkYwOFx1NEVDRSAwIFx1NUYwMFx1NTlDQlx1RkYwOVxuICAgKiBAcGFyYW0gcGFnZVNpemUgXHU2QkNGXHU5ODc1XHU2NTcwXHU5MUNGXG4gICAqIEByZXR1cm5zIHsgZGF5cywgdG90YWwsIHBhZ2UsIHBhZ2VTaXplLCBoYXNNb3JlIH1cbiAgICovXG4gIGFzeW5jIGdldERheXNQYWdpbmF0ZWQocGFnZSA9IDAsIHBhZ2VTaXplID0gMzApOiBQcm9taXNlPHtcbiAgICBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgIGtleXM6IHN0cmluZ1tdO1xuICAgIHRvdGFsOiBudW1iZXI7XG4gICAgcGFnZTogbnVtYmVyO1xuICAgIHBhZ2VTaXplOiBudW1iZXI7XG4gICAgaGFzTW9yZTogYm9vbGVhbjtcbiAgfT4ge1xuICAgIGNvbnN0IGFsbEtleXMgPSBhd2FpdCB0aGlzLmdldERheUtleXMoKTtcbiAgICBjb25zdCB0b3RhbCA9IGFsbEtleXMubGVuZ3RoO1xuICAgIGNvbnN0IHN0YXJ0ID0gcGFnZSAqIHBhZ2VTaXplO1xuICAgIGNvbnN0IHBhZ2VLZXlzID0gYWxsS2V5cy5zbGljZShzdGFydCwgc3RhcnQgKyBwYWdlU2l6ZSk7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBkYXRlS2V5IG9mIHBhZ2VLZXlzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXREYXkoZGF0ZUtleSk7XG4gICAgICAgIGlmIChkYXRhKSBkYXlzW2RhdGVLZXldID0gZGF0YTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gbG9hZCBkYXk6ICR7ZGF0ZUtleX1gLCBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5cyxcbiAgICAgIGtleXM6IHBhZ2VLZXlzLFxuICAgICAgdG90YWwsXG4gICAgICBwYWdlLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBoYXNNb3JlOiBzdGFydCArIHBhZ2VLZXlzLmxlbmd0aCA8IHRvdGFsLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBwdXREYXkoZGF5RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICB9XG5cbiAgYXN5bmMgcHV0R29hbHMoZ29hbHM6IHVua25vd25bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShnb2FscywgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdThCQkVcdTdGNkUgKHNldHRpbmdzKSAtLS0tXG5cbiAgcHJpdmF0ZSBzZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9zZXR0aW5ncy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRTZXR0aW5nKGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnkgfCBudWxsPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCB0aGlzLmdldEFsbFNldHRpbmdzKCk7XG4gICAgcmV0dXJuIHNldHRpbmdzW2tleV0gPz8gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHB1dFNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgodGhpcy5zZXR0aW5nc1BhdGgoKSk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgLy8gdmF1bHQucHJvY2VzcyBcdTUzOUZcdTVCNTAgcmVhZC1tb2RpZnktd3JpdGVcdUZGMENcdTY3NUNcdTdFRERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgc2V0dGluZ3Nba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeSh7IFtrZXldOiB2YWx1ZSB9LCBudWxsLCAyKSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsU2V0dGluZ3MoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8YW55IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICB9XG5cbiAgYXN5bmMgcHV0UHVyY2hhc2VIaXN0b3J5KGRhdGE6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyIChpbmNvbWUtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBpbmNvbWVIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2luY29tZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEluY29tZUhpc3RvcnkoKTogUHJvbWlzZTxhbnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICB9XG5cbiAgYXN5bmMgcHV0SW5jb21lSGlzdG9yeShkYXRhOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTVCRkNcdTUxRkEvXHU1QkZDXHU1MTY1IC0tLS1cblxuICBhc3luYyBleHBvcnRBbGxEYXRhKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgW2RheXMsIGdvYWxzLCBzZXR0aW5ncywgcHVyY2hhc2VIaXN0b3J5LCBpbmNvbWVIaXN0b3J5XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuZ2V0QWxsRGF5cygpLFxuICAgICAgdGhpcy5nZXRHb2FscygpLFxuICAgICAgdGhpcy5nZXRBbGxTZXR0aW5ncygpLFxuICAgICAgdGhpcy5nZXRQdXJjaGFzZUhpc3RvcnkoKSxcbiAgICAgIHRoaXMuZ2V0SW5jb21lSGlzdG9yeSgpLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICczLjAnLFxuICAgICAgZXhwb3J0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgc3RvcmFnZVR5cGU6ICd2YXVsdCcsXG4gICAgICBkYXlzLFxuICAgICAgZ29hbHMsXG4gICAgICBzZXR0aW5ncyxcbiAgICAgIHB1cmNoYXNlSGlzdG9yeSxcbiAgICAgIGluY29tZUhpc3RvcnksXG4gICAgICB0aGVtZXM6IFtdLFxuICAgICAgcmVwb3J0czogW10sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGltcG9ydERhdGEoZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG9wdGlvbnM/OiB7IHN0cmF0ZWd5PzogJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgaWYgKGRhdGEuZGF5cykge1xuICAgICAgZm9yIChjb25zdCBkYXkgb2YgT2JqZWN0LnZhbHVlcyhkYXRhLmRheXMpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucHV0RGF5KGRheSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhLmdvYWxzKSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKGRhdGEuZ29hbHMgYXMgYW55W10pO1xuICAgIH1cbiAgICBpZiAoZGF0YS5zZXR0aW5ncykge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZGF0YS5zZXR0aW5ncykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXRTZXR0aW5nKGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGF0YS5wdXJjaGFzZUhpc3RvcnkpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0UHVyY2hhc2VIaXN0b3J5KGRhdGEucHVyY2hhc2VIaXN0b3J5KTtcbiAgICB9XG4gICAgaWYgKGRhdGEuaW5jb21lSGlzdG9yeSkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRJbmNvbWVIaXN0b3J5KGRhdGEuaW5jb21lSGlzdG9yeSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2xlYXJBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKHRoaXMuYmFzZVBhdGgsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICB9XG5cbiAgLy8gLS0tLSBNYXJrZG93biBcdTY0NThcdTg5ODEgLS0tLVxuXG4gIHByaXZhdGUgcmV2aWV3UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3Jldmlld3MvJHtkYXRlS2V5fS5tZGApO1xuICB9XG5cbiAgYXN5bmMgd3JpdGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcsIG1hcmtkb3duOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIG1hcmtkb3duKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIE1hcmtkb3duU3luYyAtIFx1NUMwNiBEYXlEYXRhIEpTT04gXHU4RjZDXHU2MzYyXHU0RTNBXHU1M0VGXHU4QkZCXHU3Njg0IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5cbmludGVyZmFjZSBEYXlEYXRhIHtcbiAgZGF0ZTogc3RyaW5nO1xuICB3ZWVrZGF5OiBzdHJpbmc7XG4gIG1ldHJpY3M/OiB7XG4gICAgZmlyc3RDaGVja0luPzogc3RyaW5nO1xuICAgIGxhc3RDaGVja0luPzogc3RyaW5nO1xuICAgIGNvbXBsZXRlZFRhc2tzPzogc3RyaW5nO1xuICAgIGluc3BpcmF0aW9uQ291bnQ/OiBzdHJpbmc7XG4gICAgYWN0aXZlVGltZT86IHN0cmluZztcbiAgICBlbXB0eVNsb3RzPzogc3RyaW5nO1xuICB9O1xuICB0aW1lbGluZT86IEFycmF5PHtcbiAgICBwZXJpb2Q6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdGltZTogc3RyaW5nO1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgZXZhbD86IHN0cmluZztcbiAgICBpdGVtcz86IEFycmF5PHsgdGltZTogc3RyaW5nOyB0YXNrOiBzdHJpbmc7IGV2YWw/OiBzdHJpbmcgfT47XG4gIH0+O1xuICBnb2Fscz86IEFycmF5PHtcbiAgICBpY29uPzogc3RyaW5nO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgbWV0YT86IHN0cmluZztcbiAgICBpdGVtcz86IEFycmF5PHsgbmFtZTogc3RyaW5nOyBwZXJjZW50PzogbnVtYmVyOyBkZXRhaWw/OiBzdHJpbmcgfT47XG4gIH0+O1xufVxuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25TeW5jIHtcbiAgLyoqIFx1NUMwNiBEYXlEYXRhIFx1OEY2Q1x1NjM2Mlx1NEUzQSBNYXJrZG93biAqL1xuICBzdGF0aWMgZ2VuZXJhdGVNYXJrZG93bihkYXRhOiBEYXlEYXRhKTogc3RyaW5nIHtcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIGZyb250bWF0dGVyXHVGRjA4XHU1MkE4XHU2MDAxXHU1MDNDXHU3NTI4XHU1M0NDXHU1RjE1XHU1M0Y3XHU1MzA1XHU4OEY5XHU5NjMyXHU2QjYyIFlBTUwgXHU2Q0U4XHU1MTY1XHVGRjA5XG4gICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgbGluZXMucHVzaChgZGF0ZTogXCIke2RhdGEuZGF0ZX1cImApO1xuICAgIGxpbmVzLnB1c2goYHdlZWtkYXk6IFwiJHtkYXRhLndlZWtkYXl9XCJgKTtcbiAgICBsaW5lcy5wdXNoKCd0eXBlOiBCYW1ib28gSW1tb3J0YWxzJyk7XG4gICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgbGluZXMucHVzaCgnJyk7XG5cbiAgICAvLyBcdTY4MDdcdTk4OThcbiAgICBsaW5lcy5wdXNoKGAjICR7ZGF0YS5kYXRlfSAke2RhdGEud2Vla2RheX1cdTU5MERcdTc2RDhgKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjMwN1x1NjgwN1xuICAgIGlmIChkYXRhLm1ldHJpY3MpIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NjMwN1x1NjgwNycpO1xuICAgICAgY29uc3QgbSA9IGRhdGEubWV0cmljcztcbiAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgaWYgKG0uZmlyc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTk5OTZcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5maXJzdENoZWNrSW59YCk7XG4gICAgICBpZiAobS5sYXN0Q2hlY2tJbikgcGFydHMucHVzaChgXHU2NzJCXHU2QjIxXHU2MjUzXHU1MzYxOiAke20ubGFzdENoZWNrSW59YCk7XG4gICAgICBpZiAobS5jb21wbGV0ZWRUYXNrcykgcGFydHMucHVzaChgXHU1QjhDXHU2MjEwXHU0RUZCXHU1MkExOiAke20uY29tcGxldGVkVGFza3N9YCk7XG4gICAgICBpZiAobS5pbnNwaXJhdGlvbkNvdW50KSBwYXJ0cy5wdXNoKGBcdTcwNzVcdTYxMUY6ICR7bS5pbnNwaXJhdGlvbkNvdW50fWApO1xuICAgICAgaWYgKG0uYWN0aXZlVGltZSkgcGFydHMucHVzaChgXHU2RDNCXHU4REMzXHU2NUY2XHU5NTdGOiAke20uYWN0aXZlVGltZX1gKTtcbiAgICAgIGlmIChtLmVtcHR5U2xvdHMpIHBhcnRzLnB1c2goYFx1N0E3QVx1NzY3RFx1NjVGNlx1NkJCNTogJHttLmVtcHR5U2xvdHN9YCk7XG5cbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgwLCAyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGFydHMuc2xpY2UoMikuam9pbignIHwgJyl9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgIH1cblxuICAgIC8vIFx1NjVGNlx1OTVGNFx1N0VCRlxuICAgIGlmIChkYXRhLnRpbWVsaW5lICYmIGRhdGEudGltZWxpbmUubGVuZ3RoID4gMCkge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2NUY2XHU5NUY0XHU3RUJGJyk7XG4gICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGRhdGEudGltZWxpbmUpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGJsb2NrLmljb24gPyBgJHtibG9jay5pY29ufSBgIDogJyc7XG4gICAgICAgIGxpbmVzLnB1c2goYCMjIyAke2ljb259JHtibG9jay5uYW1lfSAoJHtibG9jay50aW1lfSlgKTtcbiAgICAgICAgaWYgKGJsb2NrLml0ZW1zKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGJsb2NrLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBldmFsU3RyID0gaXRlbS5ldmFsID8gYCAtICR7aXRlbS5ldmFsfWAgOiAnJztcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtpdGVtLnRpbWV9ICR7aXRlbS50YXNrfSR7ZXZhbFN0cn1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHU3NkVFXHU2ODA3XHU4RkRCXHU1RUE2XG4gICAgaWYgKGRhdGEuZ29hbHMgJiYgZGF0YS5nb2Fscy5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTYnKTtcbiAgICAgIGZvciAoY29uc3QgZ29hbCBvZiBkYXRhLmdvYWxzKSB7XG4gICAgICAgIGNvbnN0IGljb24gPSBnb2FsLmljb24gPyBgJHtnb2FsLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2dvYWwudGl0bGV9YCk7XG4gICAgICAgIGlmIChnb2FsLml0ZW1zKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnQgPSBpdGVtLnBlcmNlbnQgIT09IHVuZGVmaW5lZCA/IGAgJHtpdGVtLnBlcmNlbnR9JWAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IGRldGFpbCA9IGl0ZW0uZGV0YWlsID8gYCAoJHtpdGVtLmRldGFpbH0pYCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0ubmFtZX0ke3BlcmNlbnR9JHtkZXRhaWx9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IE1hcmtkb3duU3luYyB9IGZyb20gJy4uL3N0b3JhZ2UvTWFya2Rvd25TeW5jJztcbmltcG9ydCB0eXBlIHsgQW55QnJpZGdlTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzL21lc3NhZ2VzJztcblxuLyoqXG4gKiBTdG9yYWdlQnJpZGdlIC0gXHU1QzA2IHN0b3JhZ2U6KiBcdTZEODhcdTYwNkZcdTY2MjBcdTVDMDRcdTUyMzAgVmF1bHRTdG9yYWdlIFx1NjRDRFx1NEY1Q1xuICovXG5leHBvcnQgY2xhc3MgU3RvcmFnZUJyaWRnZSB7XG4gIHByaXZhdGUgc3RvcmFnZTogVmF1bHRTdG9yYWdlO1xuICBwcml2YXRlIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdG9yYWdlOiBWYXVsdFN0b3JhZ2UsIGVuYWJsZU1hcmtkb3duU3luYyA9IHRydWUpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgIHRoaXMuZW5hYmxlTWFya2Rvd25TeW5jID0gZW5hYmxlTWFya2Rvd25TeW5jO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlKG1lc3NhZ2U6IEFueUJyaWRnZU1lc3NhZ2UpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnc3RvcmFnZTpyZWFkRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOndyaXRlRGF5Jzoge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0RGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIGFueSk7XG4gICAgICAgIC8vIFx1NTNDQ1x1NTE5OSBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlTWFya2Rvd25TeW5jICYmIG1lc3NhZ2UucGF5bG9hZC5kYXRhKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1kID0gTWFya2Rvd25TeW5jLmdlbmVyYXRlTWFya2Rvd24obWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgYW55KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS53cml0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5LCBtZCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXJrZG93biBzeW5jIGZhaWxlZDonLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVEYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5LCBtZXNzYWdlLnBheWxvYWQudmFsdWUpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRHb2FscyhtZXNzYWdlLnBheWxvYWQuZ29hbHMpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRQdXJjaGFzZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRJbmNvbWVIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5c1BhZ2luYXRlZChcbiAgICAgICAgICAobWVzc2FnZSBhcyBhbnkpLnBheWxvYWQ/LnBhZ2UgPz8gMCxcbiAgICAgICAgICAobWVzc2FnZSBhcyBhbnkpLnBheWxvYWQ/LnBhZ2VTaXplID8/IDMwXG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKG1lc3NhZ2UucGF5bG9hZC5kYXRhLCBtZXNzYWdlLnBheWxvYWQub3B0aW9ucyk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Y2xlYXJBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyQWxsKCk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdG9yYWdlIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgfVxuICB9XG59XG4iLCAiXG4vKipcbiAqIFRoZW1lQnJpZGdlIC0gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1RkYwQ1x1NjNBOFx1OTAwMVx1NTIzMCBpZnJhbWVcbiAqICAgICAgICAgICAgICArIFx1NTNDRFx1NTQxMVx1RkYxQVx1NjNBNVx1NjUzNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1MDNDXHVGRjBDXHU2Q0U4XHU1MTY1IE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICovXG5leHBvcnQgY2xhc3MgVGhlbWVCcmlkZ2Uge1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICBwcml2YXRlIF9wYWxldHRlU3luY1RpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xuXG4gICAgLyoqIFx1NUI1OFx1NTBBOFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHU5NTJFXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFIHJlc3RvcmVEZWZhdWx0cyBcdTZFMDVcdTc0MDYgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTkpFQ1RFRF9WQVJTID0gW1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JyxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlcicsXG4gICAgICAnLS10ZXh0LWFjY2VudCcsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknLFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknLFxuICAgICAgJy0tdGV4dC1ub3JtYWwnLFxuICAgICAgJy0tdGV4dC1tdXRlZCcsXG4gICAgXTtcblxuICAgIC8qKiBcdTk2MzJcdTYyOTZcdTdBREVcdTYwMDFcdTY4MDdcdThCQjBcdUZGMUFyZXN0b3JlRGVmYXVsdHMgXHU4OEFCXHU4QzAzXHU3NTI4XHU1NDBFXHU4QkJFXHU0RTNBIHRydWVcdUZGMENcdTk2M0JcdTZCNjJcdTVFRjZcdThGREZcdTU2REVcdThDMDNcdTg5ODZcdTUxOTkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3VwcHJlc3NlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gIGF0dGFjaElmcmFtZShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICB9XG4gIH1cblxuICBkZXRhY2hJZnJhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTY2MEVcdTY2OTdcdTcyQjZcdTYwMDEgKi9cbiAgaXNEYXJrTW9kZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NzJCNlx1NjAwMSAqL1xuICBwdXNoVGhlbWUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICBpZDogJ3RoZW1lX3B1c2hfJyArIERhdGUubm93KCksXG4gICAgICAgIHBheWxvYWQ6IHsgaXNEYXJrOiB0aGlzLmlzRGFya01vZGUoKSB9LFxuICAgICAgfSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKiogXHU0RjlCXHU1OTE2XHU5MEU4XHU4QzAzXHU3NTI4XHVGRjFBT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU2NUY2XHU4OUU2XHU1M0QxICovXG4gIG9uVGhlbWVDaGFuZ2VkKCk6IHZvaWQge1xuICAgIHRoaXMucHVzaFRoZW1lKCk7XG4gIH1cblxuICAvLyA9PT09PSBcdTUzQ0NcdTU0MTFcdThDMDNcdTgyNzIgPT09PT1cblxuICAvKipcbiAgICogXHU4QkExXHU3Qjk3IHdlYmFwcCBcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2IFx1MjE5MiBPYnNpZGlhbiBDU1MgXHU1M0Q4XHU5MUNGXHU2NjIwXHU1QzA0XG4gICAqIFx1NEVDNVx1ODk4Nlx1NzZENiAzIFx1N0M3Qlx1NjgzOFx1NUZDM1x1ODI3Mlx1RkYwOFx1NUYzQVx1OEMwMy9cdTgwQ0NcdTY2NkYvXHU2NTg3XHU1QjU3XHVGRjA5XHVGRjBDXHU1MTc2XHU0RjU5XHU3NTMxIE9ic2lkaWFuIFx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NjNBOFx1N0I5N1xuICAgKi9cbiAgc3RhdGljIGNvbXB1dGVPYnNpZGlhblZhcnMoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBoID0gTWF0aC5yb3VuZChodWUpO1xuICAgIGNvbnN0IGxvID0gTWF0aC5tYXgoLTMwLCBNYXRoLm1pbigzMCwgbGlnaHRuZXNzT2Zmc2V0KSk7XG5cbiAgICAvLyBcdTVGM0FcdThDMDNcdTgyNzJcbiAgICBjb25zdCBhY2NlbnRTID0gNDA7XG4gICAgY29uc3QgYWNjZW50TCA9IGlzRGFyayA/IDUwIDogNDA7XG4gICAgY29uc3QgYWNjZW50ID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMfSUpYDtcbiAgICBjb25zdCBhY2NlbnRIb3ZlciA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TCArIDV9JSlgO1xuXG4gICAgLy8gXHU4MENDXHU2NjZGXHU4MjcyXG4gICAgY29uc3QgYmdTID0gaXNEYXJrID8gOCA6IDEyO1xuICAgIGNvbnN0IGJnTCA9IGlzRGFya1xuICAgICAgPyBNYXRoLm1heCg1LCAxMiArIGxvICogMC4zKVxuICAgICAgOiBNYXRoLm1pbig5OCwgOTQgKyBsbyAqIDAuMTUpO1xuICAgIGNvbnN0IGJnUHJpbWFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtiZ0x9JSlgO1xuICAgIGNvbnN0IGJnU2Vjb25kYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2lzRGFyayA/IGJnTCArIDMgOiBiZ0wgLSAyfSUpYDtcblxuICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3MlxuICAgIGNvbnN0IHRleHROb3JtYWwgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDYlLCA4OCUpYCA6IGBoc2woJHtofSwgNiUsIDEyJSlgO1xuICAgIGNvbnN0IHRleHRNdXRlZCAgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDQlLCA1NSUpYCA6IGBoc2woJHtofSwgNCUsIDQ1JSlgO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3Zlcic6IGFjY2VudEhvdmVyLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknOiBiZ1ByaW1hcnksXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSc6IGJnU2Vjb25kYXJ5LFxuICAgICAgJy0tdGV4dC1ub3JtYWwnOiB0ZXh0Tm9ybWFsLFxuICAgICAgJy0tdGV4dC1tdXRlZCc6IHRleHRNdXRlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1OEMwM1x1ODI3Mlx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICogNTBtcyBkZWJvdW5jZVx1RkYwQ1x1OTYzMlx1NkI2Mlx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdTZFRDFcdTU3NTdcdTVGRUJcdTkwMUZcdTYyRDZcdTYyRkRcdTRFQTdcdTc1MUZcdTlBRDhcdTk4OTEgRE9NIFx1NTE5OVx1NTE2NVxuICAgKi9cbiAgYXBwbHlQYWxldHRlKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcik7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSBmYWxzZTsgLy8gXHU2NUIwXHU4QzAzXHU4MjcyXHU4QkY3XHU2QzQyXHU1MjMwXHU2NzY1IFx1MjE5MiBcdTg5RTNcdTk2NjRcdTYyOTFcdTUyMzZcbiAgICB0aGlzLl9wYWxldHRlU3luY1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkKSByZXR1cm47IC8vIHJlc3RvcmVEZWZhdWx0cyBcdTU3MjhcdTk2MzJcdTYyOTZcdTdBOTdcdTUzRTNcdTUxODVcdTg4QUJcdThDMDNcdTc1MjhcbiAgICAgIGNvbnN0IHZhcnMgPSBUaGVtZUJyaWRnZS5jb21wdXRlT2JzaWRpYW5WYXJzKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFycykpIHtcbiAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvKiogXHU2RTA1XHU5NjY0XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTYwNjJcdTU5MEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5RUQ4XHU4QkE0XHU1MDNDICovXG4gIHN0YXRpYyByZXN0b3JlRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFRoZW1lQnJpZGdlLklOSkVDVEVEX1ZBUlMpIHtcbiAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4vU3RvcmFnZUJyaWRnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4vVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlLCBUaGVtZVN5bmNQYWxldHRlTWVzc2FnZSwgQXBwVG9nZ2xlVGhlbWVNZXNzYWdlLCBBcHBTYXZlU2VjdGlvbkNvbmZpZ01lc3NhZ2UsIEFwcFNhdmVDdXN0b21Ob2lzZXNNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuaW1wb3J0IHsgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLCBBVURJT19NSU1FX1RZUEVTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhjb25maWdEaXIgXHU1M0VGXHU5MDFBXHU4RkM3IHNldENvbmZpZ0RpciBcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbmNvbnN0IERFRkFVTFRfU0tJUF9ESVJTID0gWycudHJhc2gnLCAnLmdpdCcsICdub2RlX21vZHVsZXMnXTtcblxuLyoqXG4gKiBCcmlkZ2VTZXJ2aWNlIC0gcG9zdE1lc3NhZ2UgXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU0RTJEXHU1RkMzXG4gKlxuICogXHU3NkQxXHU1NDJDIGlmcmFtZSBcdTUzRDFcdTY3NjVcdTc2ODQgcG9zdE1lc3NhZ2VcdUZGMENcdTUyMDZcdTUzRDFcdTUyMzBcdTVCRjlcdTVFOTRcdTU5MDRcdTc0MDZcdTZBMjFcdTU3NTdcdUZGMENcbiAqIFx1NzEzNlx1NTQwRVx1NUMwNlx1N0VEM1x1Njc5Q1x1NTZERVx1NEYyMFx1N0VEOSBpZnJhbWVcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIEJyaWRnZVNlcnZpY2Uge1xuICAgIHByaXZhdGUgc3RvcmFnZUJyaWRnZTogU3RvcmFnZUJyaWRnZTtcbiAgICBwcml2YXRlIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZTtcbiAgICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKCkgPT4gUHJvbWlzZTx2b2lkPikgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBjdXN0b21UaGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgbm9pc2VQYXRoOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIGNvbmZpZ0Rpcjogc3RyaW5nID0gJy5vYnNpZGlhbic7XG4gICAgcHJpdmF0ZSBleHBlY3RlZE9yaWdpbiA9ICcnO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHN0b3JhZ2VCcmlkZ2U6IFN0b3JhZ2VCcmlkZ2UsXG4gICAgICAgIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZSxcbiAgICAgICAgc2V0dGluZ3M/OiBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbiAgICAgICAgc2F2ZVNldHRpbmdzPzogKCkgPT4gUHJvbWlzZTx2b2lkPlxuICAgICkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VCcmlkZ2UgPSBzdG9yYWdlQnJpZGdlO1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlID0gdGhlbWVCcmlkZ2U7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncyB8fCBudWxsO1xuICAgICAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncyB8fCBudWxsO1xuICAgIH1cblxuICAvKiogXHU3RUQxXHU1QjlBIGlmcmFtZSBcdTVFNzZcdTVGMDBcdTU5Q0JcdTc2RDFcdTU0MkNcdTZEODhcdTYwNkYgKi9cbiAgYXR0YWNoKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICAvLyBcdTk2MzJcdTZCNjJcdTkxQ0RcdTU5MERcdTdFRDFcdTVCOUFcbiAgICB0aGlzLmRldGFjaCgpO1xuXG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUoaWZyYW1lKTtcblxuICAgIC8vIFx1OEJCMFx1NUY1NSBleHBlY3RlZCBvcmlnaW5cdUZGMENcdTc1MjhcdTRFOEVcdTZEODhcdTYwNkZcdTY3NjVcdTZFOTBcdTY4MjFcdTlBOENcbiAgICB0cnkge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgdGhpcy5vbk1lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyMTdcdTg4NjhcdUZGMDhcdTRGOUJcdTYzRDJcdTRFRjZcdTdBRUZcdTYyNkJcdTYzQ0ZcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgc2V0Q3VzdG9tVGhlbWVzKHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pik6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tVGhlbWVzID0gdGhlbWVzO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOFx1NEY5Qlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBzZXRWYXVsdEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnZhdWx0QmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODQgKi9cbiAgc2V0Tm9pc2VQYXRoKG5vaXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNCAub2JzaWRpYW5cdUZGMENcdTc1MjhcdTYyMzdcdTUzRUZcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbiAgc2V0Q29uZmlnRGlyKGRpcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdEaXIgPSBkaXI7XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHU2MjE2XHU1MTY4XHU1RTkzXHU2MjZCXHU2M0NGXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgX3NjYW5WYXVsdEF1ZGlvRmlsZXMobWF4RGVwdGggPSA1KTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFsbG93ZWRFeHRzID0gQUxMT1dFRF9BVURJT19FWFRFTlNJT05TO1xuICAgIGNvbnN0IGJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgIGlmICghYmFzZVBhdGgpIHJldHVybiByZXN1bHRzO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1IGJhc2VQYXRoIFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1RkYwOFx1NUYwMlx1NkI2NVx1RkYwOVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGJhc2VQYXRoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjMwN1x1NUI5QVx1NEU4Nlx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTNFQVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEUwRFx1OTAxMlx1NUY1Mlx1RkYwOVxuICAgIGlmICh0aGlzLm5vaXNlUGF0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0RGlyID0gcGF0aC5qb2luKGJhc2VQYXRoLCB0aGlzLm5vaXNlUGF0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcih0YXJnZXREaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgaWYgKGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgICBpZiAoIWVudHJ5LmlzRmlsZSgpKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQocGF0aC5qb2luKHRhcmdldERpciwgZW50cnkubmFtZSkpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcGF0aC5qb2luKHRoaXMubm9pc2VQYXRoLCBlbnRyeS5uYW1lKSwgbmFtZTogZW50cnkubmFtZSwgc2l6ZTogc3RhdC5zaXplLCBleHQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gXHU2NzJBXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1MTY4XHU1RTkzXHU5MDEyXHU1RjUyXHU2MjZCXHU2M0NGXHVGRjA4XHU1RjAyXHU2QjY1ICsgXHU2REYxXHU1RUE2XHU5NjUwXHU1MjM2XHVGRjA5XG4gICAgY29uc3Qgc2NhbkRpciA9IGFzeW5jIChkaXJQYXRoOiBzdHJpbmcsIHJlbGF0aXZlUHJlZml4OiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICBsZXQgZW50cmllczogZnMuRGlyZW50W107XG4gICAgICB0cnkge1xuICAgICAgICBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXJQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICB9IGNhdGNoIHsgcmV0dXJuOyAvKiBza2lwIHVucmVhZGFibGUgZGlycyAqLyB9XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmVQcmVmaXggPyBwYXRoLmpvaW4ocmVsYXRpdmVQcmVmaXgsIGVudHJ5Lm5hbWUpIDogZW50cnkubmFtZTtcblxuICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIGNvbnN0IHNraXBEaXJzID0gbmV3IFNldChbLi4uREVGQVVMVF9TS0lQX0RJUlMsIHRoaXMuY29uZmlnRGlyXSk7XG4gICAgICAgICAgaWYgKHNraXBEaXJzLmhhcyhlbnRyeS5uYW1lKSkgY29udGludWU7XG4gICAgICAgICAgYXdhaXQgc2NhbkRpcihmdWxsUGF0aCwgcmVsYXRpdmVQYXRoLCBkZXB0aCArIDEpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpKSB7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcmVsYXRpdmVQYXRoLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgc2NhbkRpcihiYXNlUGF0aCwgJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxIGlmcmFtZVx1RkYwQ1x1NTA1Q1x1NkI2Mlx1NzZEMVx1NTQyQyAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVzc2FnZUhhbmRsZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gICAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aGVtZUJyaWRnZS5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtc2cgPSBldmVudC5kYXRhIGFzIEFueUJyaWRnZU1lc3NhZ2U7XG4gICAgaWYgKCFtc2cgfHwgIW1zZy50eXBlIHx8ICFtc2cuaWQpIHJldHVybjtcblxuICAgIC8vIFx1NjgyMVx1OUE4Q1x1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1RkYxQXNvdXJjZSArIG9yaWdpbiBcdTUzQ0NcdTkxQ0RcdTlBOENcdThCQzFcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgZXZlbnQuc291cmNlICE9PSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmV4cGVjdGVkT3JpZ2luICYmIGV2ZW50Lm9yaWdpbiAhPT0gdGhpcy5leHBlY3RlZE9yaWdpbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQnJpZGdlU2VydmljZV0gSWdub3JlZCBtZXNzYWdlIGZyb20gdW5rbm93biBvcmlnaW46JywgZXZlbnQub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTUyNERcdTdGMDBcbiAgICBpZiAoIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3N0b3JhZ2U6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2FwcDonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnZmlsZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgndGhlbWU6JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcdTZEODhcdTYwNkZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgLy8gXHU2MjhBXHU2MzAxXHU0RTQ1XHU1MzE2XHU3Njg0IHNlY3Rpb25Db25maWdcdTMwMDFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTU0OENcdTgxRUFcdTVCOUFcdTRFNDlcdTk3RjNcdTZFOTBcdTk2OEYgcmVhZHkgXHU1NENEXHU1RTk0XHU1M0QxXHU3RUQ5IHdlYmFwcFxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncz8uc2VjdGlvbkNvbmZpZyB8fCBudWxsLFxuICAgICAgICBjdXN0b21UaGVtZXM6IHRoaXMuY3VzdG9tVGhlbWVzLFxuICAgICAgICBjdXN0b21Ob2lzZXM6IHRoaXMuc2V0dGluZ3M/Lm5vaXNlSXRlbXMgfHwgW10sXG4gICAgICAgIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogdGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmNsb3NlJykge1xuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkVcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZVNlY3Rpb25Db25maWcnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICBjb25zdCBjb25maWdNc2cgPSBtc2cgYXMgQXBwU2F2ZVNlY3Rpb25Db25maWdNZXNzYWdlO1xuICAgICAgICB0aGlzLnNldHRpbmdzLnNlY3Rpb25Db25maWcgPSBjb25maWdNc2cucGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVDdXN0b21Ob2lzZXMnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICBjb25zdCBub2lzZXNNc2cgPSBtc2cgYXMgQXBwU2F2ZUN1c3RvbU5vaXNlc01lc3NhZ2U7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Mubm9pc2VJdGVtcyA9IChub2lzZXNNc2cucGF5bG9hZCBhcyB1bmtub3duW10pIHx8IFtdO1xuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZ3MpIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NEUzQlx1OTg5OFx1NTIwN1x1NjM2Mlx1OEJGN1x1NkM0Mlx1RkYwOGlmcmFtZSBcdTIxOTIgT2JzaWRpYW5cdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6dG9nZ2xlVGhlbWUnKSB7XG4gICAgICBjb25zdCB0aGVtZU1zZyA9IG1zZyBhcyBBcHBUb2dnbGVUaGVtZU1lc3NhZ2U7XG4gICAgICBjb25zdCB0YXJnZXRJc0RhcmsgPSB0aGVtZU1zZy5wYXlsb2FkLmlzRGFyayA9PT0gdHJ1ZTtcbiAgICAgIGNvbnN0IGN1cnJlbnRJc0RhcmsgPSBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICAgICAgaWYgKHRhcmdldElzRGFyayAhPT0gY3VycmVudElzRGFyaykge1xuICAgICAgICBpZiAodGFyZ2V0SXNEYXJrKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1saWdodCcpO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtZGFyaycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtZGFyaycpO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTkwMUFcdTc3RTUgaWZyYW1lIFx1NEUzQlx1OTg5OFx1NURGMlx1NTIwN1x1NjM2MlxuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSwgaXNEYXJrOiB0YXJnZXRJc0RhcmsgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU4QkY3XHU2QzQyXHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pIHtcbiAgICAgICAgY29uc3QgcGFsZXR0ZU1zZyA9IG1zZyBhcyBUaGVtZVN5bmNQYWxldHRlTWVzc2FnZTtcbiAgICAgICAgY29uc3QgeyBodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrIH0gPSBwYWxldHRlTXNnLnBheWxvYWQ7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UuYXBwbHlQYWxldHRlKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdUZGMUFcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjYgPT09PT1cblxuICAgIC8vIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1NjI0MFx1NjcwOVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NEY5QiB3ZWJhcHAgXHU2NTg3XHU0RUY2XHU5MDA5XHU2MkU5XHU1NjY4XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjBDXHU4QkY3XHU1QzFEXHU4QkQ1XHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU5NzYyXHU2NzdGJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKSBcdTUxODVcdTkwRThcdTVERjJcdTVGMDJcdTZCNjVcdTY4QzBcdTY3RTVcdThERUZcdTVGODRcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLl9zY2FuVmF1bHRBdWRpb0ZpbGVzKCk7XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29dIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3XHU1RTkzXHU1MTg1XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUyMDE0IFx1OEZENFx1NTZERVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTI0RFx1N0FFRlx1NzZGNFx1NjNBNSBmZXRjaCBmaWxlOi8vXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NCcpO1xuICAgICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdThERUZcdTVGODRcdTY3MkFcdTkwMDNcdTkwMzhcdTUxRkEgdmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh2YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyXHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoOiBmdWxsUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShyZWxhdGl2ZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU2NzJDXHU1NzMwXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU1NkRFXHU0RjIwXHU4REVGXHU1Rjg0XHU3NTMxXHU1MjREXHU3QUVGXHU3NTI4IGZpbGU6Ly8gXHU1MkEwXHU4RjdEXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIWZpbGVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuICAgICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTYyRDJcdTdFRERcdTUzMDVcdTU0MkJcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTVCNTdcdTdCMjZcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoLCBleHQpIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yLm1lc3NhZ2UgfHwgJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2RlxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2VCcmlkZ2UuaGFuZGxlKG1zZyk7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY4MzlcdTYzNkVcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcdTgzQjdcdTUzRDYgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbiAgcHJpdmF0ZSBfZ2V0QXVkaW9NaW1lVHlwZShleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEFVRElPX01JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NjIxMFx1NTI5Rlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmQoaWQ6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgcGF5bG9hZCB9LCAnKicpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZEVycm9yKGlkOiBzdHJpbmcsIGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBlcnJvciB9LCAnKicpO1xuICB9XG59XG4iLCAiLyoqIFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NUI4Q1x1NjU3NFx1NTIxN1x1ODg2OFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyA9IFtcbiAgJy5tcDMnLCAnLndhdicsICcub2dnJywgJy5mbGFjJywgJy5hYWMnLCAnLm00YScsICcud21hJywgJy53ZWJtJywgJy5vcHVzJyxcbl07XG5cbi8qKiBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MEQgXHUyMTkyIE1JTUUgXHU3QzdCXHU1NzhCICovXG5leHBvcnQgY29uc3QgQVVESU9fTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5tcDMnOiAgJ2F1ZGlvL21wZWcnLFxuICAnLndhdic6ICAnYXVkaW8vd2F2JyxcbiAgJy5vZ2cnOiAgJ2F1ZGlvL29nZycsXG4gICcuZmxhYyc6ICdhdWRpby9mbGFjJyxcbiAgJy5hYWMnOiAgJ2F1ZGlvL2FhYycsXG4gICcubTRhJzogICdhdWRpby9tcDQnLFxuICAnLndtYSc6ICAnYXVkaW8veC1tcy13bWEnLFxuICAnLndlYm0nOiAnYXVkaW8vd2VibScsXG4gICcub3B1cyc6ICdhdWRpby9vcHVzJyxcbn07XG5cbi8qKiBcdTVCOENcdTY1NzQgTUlNRSBcdTdDN0JcdTU3OEJcdTY2MjBcdTVDMDRcdUZGMDhcdTU0MkIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IE1JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcuaHRtbCc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmNzcyc6ICAndGV4dC9jc3M7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcubWpzJzogICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qc29uJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAnLnBuZyc6ICAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAgJ2ltYWdlL2pwZWcnLFxuICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICcuZ2lmJzogICdpbWFnZS9naWYnLFxuICAnLnN2Zyc6ICAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcuaWNvJzogICdpbWFnZS94LWljb24nLFxuICAnLndvZmYnOiAnZm9udC93b2ZmJyxcbiAgJy53b2ZmMic6J2ZvbnQvd29mZjInLFxuICAnLnR0Zic6ICAnZm9udC90dGYnLFxuICAuLi5BVURJT19NSU1FX1RZUEVTLFxufTtcbiIsICJpbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG5ldCBmcm9tICduZXQnO1xuaW1wb3J0IHsgTUlNRV9UWVBFUywgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcblxuLyoqXG4gKiBMb2NhbFNlcnZlciAtIFx1NjcyQ1x1NTczMCBIVFRQIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjcwRFx1NTJBMVx1NTY2OFxuICpcbiAqIFx1NTcyOCBPYnNpZGlhbiAoRWxlY3Ryb24pIFx1NzNBRlx1NTg4M1x1NEUyRFx1NTQyRlx1NTJBOFx1NEUwMFx1NEUyQVx1NjcyQ1x1NTczMCBIVFRQIFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1xuICogXHU0RTNBIGlmcmFtZSBcdTYzRDBcdTRGOUIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NjcwRFx1NTJBMVx1RkYwQ1x1N0VENVx1OEZDNyBhcHA6Ly8gXHU1MzRGXHU4QkFFXHU3Njg0XHU5NjUwXHU1MjM2XHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFNlcnZlciB7XG4gIHByaXZhdGUgc2VydmVyOiBodHRwLlNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHBvcnQgPSAwO1xuICBwcml2YXRlIHdlYmFwcERpcjogc3RyaW5nO1xuICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKHdlYmFwcERpcjogc3RyaW5nKSB7XG4gICAgdGhpcy53ZWJhcHBEaXIgPSB3ZWJhcHBEaXI7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RjlCIC9iYW1ib28tYXVkaW8gXHU5N0YzXHU5ODkxXHU0RUUzXHU3NDA2XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHNldFZhdWx0QmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMudmF1bHRCYXNlUGF0aCA9IGJhc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1x1OEZENFx1NTZERVx1NzZEMVx1NTQyQ1x1N0FFRlx1NTNFMyAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLnNlcnZlcikgcmV0dXJuIHRoaXMucG9ydDtcblxuICAgIHRoaXMucG9ydCA9IGF3YWl0IHRoaXMuZmluZEZyZWVQb3J0KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KHJlcSwgcmVzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBTZXJ2ZXIgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHRoaXMucG9ydCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtCYW1ib29SZXZpZXddIExvY2FsIHNlcnZlciBzdGFydGVkIG9uIHBvcnQgJHt0aGlzLnBvcnR9YCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5wb3J0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1NTA1Q1x1NkI2Mlx1NjcwRFx1NTJBMVx1NTY2OCAqL1xuICBhc3luYyBzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW0JhbWJvb1Jldmlld10gTG9jYWwgc2VydmVyIHN0b3BwZWQnKTtcbiAgICAgICAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5wb3J0ID0gMDtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjcwRFx1NTJBMVx1NTY2OCBVUkwgKi9cbiAgZ2V0VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5wb3J0fWA7XG4gIH1cblxuICAvKiogXHU1OTA0XHU3NDA2IEhUVFAgXHU4QkY3XHU2QzQyICovXG4gIHByaXZhdGUgaGFuZGxlUmVxdWVzdChyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICAvLyAvYmFtYm9vLWF1ZGlvP3BhdGg9eHh4IFx1MjAxNCBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTRFRTNcdTc0MDZcdUZGMENcdTdFRDVcdThGQzcgcG9zdE1lc3NhZ2UgXHU1OTI3IHBheWxvYWQgXHU5NjUwXHU1MjM2XG4gICAgY29uc3QgdXJsID0gcmVxLnVybCB8fCAnLyc7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvYmFtYm9vLWF1ZGlvJykpIHtcbiAgICAgIHRoaXMuaGFuZGxlQXVkaW9Qcm94eShyZXEsIHJlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4OUUzXHU2NzkwIFVSTFx1RkYwQ1x1NTNCQlx1OTY2NFx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFxuICAgIGxldCB1cmxQYXRoID0gdXJsLnNwbGl0KCc/JylbMF07XG4gICAgLy8gXHU3NkVFXHU1RjU1XHU5RUQ4XHU4QkE0XHU2NTg3XHU0RUY2XG4gICAgaWYgKHVybFBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgICAgdXJsUGF0aCArPSAnaW5kZXguaHRtbCc7XG4gICAgfVxuICAgIGNvbnN0IHNhZmVQYXRoID0gcGF0aC5ub3JtYWxpemUodXJsUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bXFwvXFxcXF0pKy8sICcnKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLndlYmFwcERpciwgc2FmZVBhdGgpO1xuXG4gICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU1NzI4IHdlYmFwcERpciBcdTUxODVcbiAgICBpZiAoIWZpbGVQYXRoLnN0YXJ0c1dpdGgodGhpcy53ZWJhcHBEaXIpKSB7XG4gICAgICByZXMud3JpdGVIZWFkKDQwMyk7XG4gICAgICByZXMuZW5kKCdGb3JiaWRkZW4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBmcy5zdGF0KGZpbGVQYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xuICAgICAgICByZXMuZW5kKCdOb3QgRm91bmQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThCQkVcdTdGNkUgTUlNRSBcdTdDN0JcdTU3OEJcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMDhcdTRFMERcdTk3MDBcdTg5ODEgQ09SU1x1RkYwQ2lmcmFtZSBcdTRFMEVcdTY3MERcdTUyQTFcdTU2NjhcdTU0MENcdTZFOTBcdUZGMDlcbiAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NkQ0MVx1NUYwRlx1NEYyMFx1OEY5M1x1NjU4N1x1NEVGNlxuICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCk7XG4gICAgICBzdHJlYW0ucGlwZShyZXMpO1xuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIC9iYW1ib28tYXVkaW8/cGF0aD14eHggXHUyMDE0IFx1NkQ0MVx1NUYwRlx1NEVFM1x1NzQwNlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiAqL1xuICBwcml2YXRlIGhhbmRsZUF1ZGlvUHJveHkocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJhd1VybCA9IHJlcS51cmwgfHwgJyc7XG4gICAgICBjb25zdCBxdWVyeUluZGV4ID0gcmF3VXJsLmluZGV4T2YoJz8nKTtcbiAgICAgIGlmIChxdWVyeUluZGV4ID09PSAtMSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgcGF0aCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcXVlcnlTdHIgPSByYXdVcmwuc2xpY2UocXVlcnlJbmRleCArIDEpO1xuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhxdWVyeVN0cik7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwYXJhbXMuZ2V0KCdwYXRoJyk7XG4gICAgICBpZiAoIXJlbGF0aXZlUGF0aCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgcGF0aCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTUzRUFcdTUxNDFcdThCQjhcdTYzMDdcdTVCOUFcdTYyNjlcdTVDNTVcdTU0MERcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuOiB1bnN1cHBvcnRlZCBhdWRpbyBmb3JtYXQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU3OTgxXHU2QjYyXHU4REVGXHU1Rjg0XHU3QTdGXHU4RDhBXG4gICAgICBjb25zdCBub3JtYWxpemVkID0gcGF0aC5ub3JtYWxpemUocmVsYXRpdmVQYXRoKS5yZXBsYWNlKC9eKFxcLlxcLltcXC9cXFxcXSkrLywgJycpO1xuICAgICAgaWYgKCFub3JtYWxpemVkIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLi4nKSB8fCBub3JtYWxpemVkLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7IHJlcy5lbmQoJ1ZhdWx0IGJhc2UgcGF0aCBub3QgY29uZmlndXJlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHRoaXMudmF1bHRCYXNlUGF0aCwgbm9ybWFsaXplZCk7XG4gICAgICBpZiAoIWZ1bGxQYXRoLnN0YXJ0c1dpdGgodGhpcy52YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZzLnN0YXQoZnVsbFBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICAgIGlmIChlcnIgfHwgIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpOyByZXMuZW5kKCdGaWxlIG5vdCBmb3VuZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZW50VHlwZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogY29udGVudFR5cGUsXG4gICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogc3RhdHMuc2l6ZSxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT0zNjAwJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZnVsbFBhdGgpO1xuICAgICAgICBzdHJlYW0ucGlwZShyZXMpO1xuICAgICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgICByZXMuZW5kKCdTdHJlYW0gZXJyb3InKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIHByb3h5IGVycm9yOicsIGUpO1xuICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogXHU2N0U1XHU2MjdFXHU1M0VGXHU3NTI4XHU3QUVGXHU1M0UzICovXG4gIHByaXZhdGUgZmluZEZyZWVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgIHNlcnZlci5saXN0ZW4oMCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9ydCA9IChzZXJ2ZXIuYWRkcmVzcygpIGFzIG5ldC5BZGRyZXNzSW5mbykucG9ydDtcbiAgICAgICAgc2VydmVyLmNsb3NlKCgpID0+IHJlc29sdmUocG9ydCkpO1xuICAgICAgfSk7XG4gICAgICBzZXJ2ZXIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufSIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSBCYW1ib29SZXZpZXdQbHVnaW4gZnJvbSAnLi4vLi4vbWFpbic7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5cbi8qKiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTYzQTVcdTUzRTMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFtYm9vUmV2aWV3U2V0dGluZ3Mge1xuICAvKiogXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU2ODM5XHU4REVGXHU1Rjg0ICovXG4gIGRhdGFQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxICovXG4gIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcbiAgLyoqIFx1Njc3Rlx1NTc1N1x1N0JBMVx1NzQwNlx1OTE0RFx1N0Y2RVx1RkYwOFx1NTNFRlx1ODlDMVx1NjAyNyArIFx1NjM5Mlx1NUU4Rlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RSB3ZWJhcHAgaWZyYW1lIGxvY2FsU3RvcmFnZSBcdTRFMERcdTUzRUZcdTk3NjBcdTY1RjZcdTYzMDFcdTRFNDVcdTUzMTYgKi9cbiAgc2VjdGlvbkNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5ICovXG4gIHRoZW1lUGF0aDogc3RyaW5nO1xuICAvKiogXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzXHVGRjA5ICovXG4gIG5vaXNlUGF0aDogc3RyaW5nO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU1MjE3XHU4ODY4XHVGRjA4XHU5MDFBXHU4RkM3XHU2ODY1XHU2M0E1XHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjBDXHU1MTRCXHU2NzBEIGxvY2FsU3RvcmFnZSBwb3J0LXNjb3BlZCBcdTk1RUVcdTk4OThcdUZGMDkgKi9cbiAgbm9pc2VJdGVtczogdW5rbm93bltdO1xuICAvKiogXHU2NjJGXHU1NDI2XHU1QzA2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyICovXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEJhbWJvb1Jldmlld1NldHRpbmdzID0ge1xuICBkYXRhUGF0aDogJ2JhbWJvby1yZXZpZXcnLFxuICBlbmFibGVNYXJrZG93blN5bmM6IHRydWUsXG4gIHNlY3Rpb25Db25maWc6IG51bGwsXG4gIHRoZW1lUGF0aDogJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcsXG4gIG5vaXNlUGF0aDogJycsXG4gIG5vaXNlSXRlbXM6IFtdLFxuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGZhbHNlLFxufTtcblxuLyoqXG4gKiBQbHVnaW5TZXR0aW5ncyAtIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2V0dGluZ3MgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctc2V0dGluZ3MnKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgLSBcdThCQkVcdTdGNkUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyA9PT0gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODRcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NTcyOCBWYXVsdCBcdTRFMkRcdTc2ODRcdTVCNThcdTUwQThcdTc2RUVcdTVGNTVcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2JhbWJvby1yZXZpZXcnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aCA9IHZhbHVlIHx8ICdiYW1ib28tcmV2aWV3JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gTWFya2Rvd24gXHU2NDU4XHU4OTgxXHU1NDBDXHU2QjY1XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MScpXG4gICAgICAuc2V0RGVzYygnXHU2QkNGXHU2QjIxXHU0RkREXHU1QjU4XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1NzI4IHJldmlld3MvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzUxRlx1NjIxMFx1NTNFRlx1OEJGQlx1NzY4NCAubWQgXHU2NTg3XHU0RUY2JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTVCNThcdTY1M0VcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggLmpzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aCA9IHZhbHVlIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU3NjdEXHU1NjZBXHU5N0YzID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjMnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzknKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NjMwN1x1NUI5QVx1NTQwRVx1NEVDNVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1NTE4NVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1MzAwMlx1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NjU3NFx1NEUyQVx1NUU5M1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3NjdEXHU1NjZBXHU5N0YzIFx1NjIxNlx1NzU1OVx1N0E3QVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5MycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGggPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NUMwNlx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDd2ViYXBwIFx1NTE4NVx1NjBBQ1x1NkQ2RVx1ODNEQ1x1NTM1NVx1NzY4NFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdThDMDNcdTgyNzJcdTRGMUFcdTVCOUVcdTY1RjZcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU3Njg0XHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHU5MTREXHU4MjcyJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJhbWJvby1yZXZpZXctZnJhbWUnKSBhcyBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgICBpZiAoZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOnN5bmNQYWxldHRlRW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGVuYWJsZWQ6IHZhbHVlIH1cbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIFx1NTE3M1x1NEU4RVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTUxNzNcdTRFOEUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDFcdUZGMUFcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0IgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgcGx1Z2luQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIGNvbnN0IHBsdWdpblRpdGxlID0gcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBjb25zdCBkZXNjRWwgPSBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnQmFtYm9vIEltbW9ydGFsc1x1RkYwOFx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1RkYwOVx1NjYyRlx1NEUwMFx1NkIzRVx1NTdGQVx1NEU4RVx1ODJDRlx1ODA1NFx1NjNBN1x1NTIzNlx1OEJCQVx1NEU0Qlx1NzIzNlx1N0VGNFx1NTE0Qlx1NjI1OFx1MDBCN1x1NjgzQ1x1NTM2Mlx1NEVDMFx1NzlEMVx1NTkyQlx1NjNEMFx1NTFGQVx1NzY4NFwiT0dBU1wiXHU3NDA2XHU1RkY1XHVGRjBDXHU0RTEzXHU0RTNBXHU0RTJBXHU0RUJBXHU2MjUzXHU5MDIwXHU3Njg0XHU0RTJEXHU1NkZEXHU5OENFXHU3NkVFXHU2ODA3XHU4MUVBXHU1MkE4XHU1MzE2XHU1MjA2XHU5MTREXHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGXHUzMDAyJyxcbiAgICAgIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJ1xuICAgIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAyXHVGRjFBXHU0RjVDXHU4MDA1ICsgXHU0RjVDXHU1NEMxIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IGF1dGhvckJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkIGJhbWJvby1hYm91dC1hdXRob3InIH0pO1xuICAgIGNvbnN0IGF1dGhvclJvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvdycgfSk7XG4gICAgY29uc3QgYXZhdGFyID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdmF0YXInIH0pO1xuICAgIGF2YXRhci5zZXRDc3NTdHlsZXMoe1xuICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKGRhdGE6aW1hZ2UvanBlZztiYXNlNjQsLzlqLzRBQVFTa1pKUmdBQkFRQUFBUUFCQUFELzJ3QkRBQVlFQlFZRkJBWUdCUVlIQndZSUNoQUtDZ2tKQ2hRT0R3d1FGeFFZR0JjVUZoWWFIU1VmR2hzakhCWVdJQ3dnSXlZbktTb3BHUjh0TUMwb01DVW9LU2ovMndCREFRY0hCd29JQ2hNS0NoTW9HaFlhS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDZ29LQ2dvS0Nnb0tDai93QUFSQ0FLQUFvQURBU0lBQWhFQkF4RUIvOFFBSHdBQUFRVUJBUUVCQVFFQUFBQUFBQUFBQUFFQ0F3UUZCZ2NJQ1FvTC84UUF0UkFBQWdFREF3SUVBd1VGQkFRQUFBRjlBUUlEQUFRUkJSSWhNVUVHRTFGaEJ5SnhGREtCa2FFSUkwS3h3UlZTMGZBa00ySnlnZ2tLRmhjWUdSb2xKaWNvS1NvME5UWTNPRGs2UTBSRlJrZElTVXBUVkZWV1YxaFpXbU5rWldabmFHbHFjM1IxZG5kNGVYcURoSVdHaDRpSmlwS1RsSldXbDVpWm1xS2pwS1dtcDZpcHFyS3p0TFcydDdpNXVzTER4TVhHeDhqSnl0TFQxTlhXMTlqWjJ1SGk0K1RsNXVmbzZlcng4dlAwOWZiMytQbjYvOFFBSHdFQUF3RUJBUUVCQVFFQkFRQUFBQUFBQUFFQ0F3UUZCZ2NJQ1FvTC84UUF0UkVBQWdFQ0JBUURCQWNGQkFRQUFRSjNBQUVDQXhFRUJTRXhCaEpCVVFkaGNSTWlNb0VJRkVLUm9iSEJDU016VXZBVlluTFJDaFlrTk9FbDhSY1lHUm9tSnlncEtqVTJOemc1T2tORVJVWkhTRWxLVTFSVlZsZFlXVnBqWkdWbVoyaHBhbk4wZFhaM2VIbDZnb09FaFlhSGlJbUtrcE9VbFphWG1KbWFvcU9rcGFhbnFLbXFzck8wdGJhM3VMbTZ3c1BFeGNiSHlNbkswdFBVMWRiWDJObmE0dVBrNWVibjZPbnE4dlAwOWZiMytQbjYvOW9BREFNQkFBSVJBeEVBUHdENVVvb29vQUtLS0tBQ2lpaWdBb29vOUtBQ2lpajBvQUtLS1BTZ0Fvb29vQUtLS0tBQ2lpajBvQUtLS1hGQUNVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkxpZ1V0QURhS1drb0FLVWRLU2xGQUNpa05MU0dnQktLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb3BSUUFsRkxpa29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUZGRkxTR2dCS0tLS0FDbEZKVGhRQWxKVHFiUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQW9wYVFVdEFDVWxMU1VBRktLU2xGQUMwaG9vb0FTaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNpaWlnQW9vb29BV2xwQlMwQUZOcDFJYUFFb29vb0FLS0tLQUNpaWlnQW9vb29BS0tLS0FDaWlpZ0FwUUtCVGhRQUNrTk94VFdvQWJSUlJRQVU0VTJuQ2dBcEtkVFRRQWxGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBS0tXa0ZMUUFsSlRxYlFBVW9wS1VVQUZGRkpRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlJSUlFBVVVVVUFGRkZLS0FGRkxTQ2xvQUtRMHRJYUFHMFVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCU2lrcFJRQTRVb3BLQlFBdElhV2tOQURLS0tLQUNuTFRhVVVBT29vb29BU20wNDAyZ0Fvb29vQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUNsN1VsS0tBQ2lscERRQWxLS1NuVUFGSlMwZHFBRzBVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlNpa3B3b0FTa3B4cHRBQlJSUlFBVVVVVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJSUUFVVVVVQUZGRkZBQlNpay4uLiBbdHJ1bmNhdGVkXSdcbiAgICB9KTtcblxuICAgIGNvbnN0IGF1dGhvckluZm8gPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1pbmZvJyB9KTtcbiAgICBjb25zdCBhdXRob3JFbCA9IGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTdGQkRcdTlDREVcdTU0MUInLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLW5hbWUnIH0pO1xuICAgIGNvbnN0IHJvbGVFbCA9IGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTU1QjVcdTVCNTdcdTk5ODZcdTUyMUJcdTU5Q0JcdTRFQkEnLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvbGUnIH0pO1xuXG4gICAgLy8gXHU0RjVDXHU1NEMxXHU1MzNBXG4gICAgY29uc3Qgd29ya3NUaXRsZSA9IGF1dGhvckJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ09ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NEY1Q1x1NTRDMScsIGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1sYWJlbCcgfSk7XG4gICAgY29uc3Qgd29ya3NSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLXJvdycgfSk7XG5cbiAgICBbJ1x1N0FGOVx1NTNGNlx1OThERVx1NTIwMycsICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnXS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgdGFnID0gd29ya3NSb3cuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IG5hbWUsIGNsczogJ2JhbWJvby1hYm91dC10YWcnIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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
