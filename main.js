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
var https2 = __toESM(require("https"));

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
    const reads = files.files.filter((f) => f.endsWith(".json")).map(async (file) => {
      const dateKey = file.split("/").pop()?.replace(".json", "");
      if (!dateKey) return;
      try {
        const content = await this.app.vault.adapter.read(file);
        days[dateKey] = JSON.parse(content);
      } catch (e) {
        console.warn(`Failed to parse day file: ${file}`, e);
      }
    });
    await Promise.all(reads);
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
    const reads = pageKeys.map(async (dateKey) => {
      try {
        const data = await this.getDay(dateKey);
        if (data) days[dateKey] = data;
      } catch (e) {
        console.warn(`Failed to load day: ${dateKey}`, e);
      }
    });
    await Promise.all(reads);
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
      case "storage:getDaysPaginated": {
        const paginatedPayload = message.payload;
        return await this.storage.getDaysPaginated(
          paginatedPayload.page ?? 0,
          paginatedPayload.pageSize ?? 30
        );
      }
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
    this._checkInterval = null;
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
      const statusEl = container.createEl("div", {
        text: "\u6B63\u5728\u521D\u59CB\u5316\u7AF9\u6797\u4FEE\u4ED9\u4F20\u2026",
        cls: "bamboo-review-loading"
      });
      let ticks = 0;
      this._checkInterval = window.setInterval(() => {
        ticks++;
        if (this.plugin.webappReady) {
          window.clearInterval(this._checkInterval);
          this._checkInterval = null;
          container.empty();
          void this.setupIframe(container);
          return;
        }
        if (ticks === 60) {
          statusEl.setText("\u6B63\u5728\u4E0B\u8F7D\u8D44\u6E90\u5305\uFF0C\u7F51\u7EDC\u8F83\u6162\u8BF7\u7A0D\u5019\u2026");
        }
        if (ticks === 240) {
          statusEl.setText("\u8D44\u6E90\u5305\u4E0B\u8F7D\u5F02\u5E38\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u542F Obsidian");
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
    let forwarding = false;
    this.keydownForwarder = (e) => {
      if (forwarding) return;
      if (e.ctrlKey || e.metaKey) {
        forwarding = true;
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
        forwarding = false;
      }
    };
    activeDocument.addEventListener("keydown", this.keydownForwarder, true);
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
    const customThemes = await this._scanCustomThemes();
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
    if (this._checkInterval !== null) {
      window.clearInterval(this._checkInterval);
      this._checkInterval = null;
    }
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
      activeDocument.removeEventListener("keydown", this.keydownForwarder, true);
      this.keydownForwarder = null;
    }
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
  async _scanCustomThemes() {
    const themes = [];
    try {
      const vaultBasePath = this.app.vault.adapter.basePath || "";
      if (!vaultBasePath) return themes;
      const themeDirName = this.settings.themePath || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
      const themesDir = path2.join(vaultBasePath, themeDirName);
      try {
        const stat2 = await fs2.promises.stat(themesDir);
        if (!stat2.isDirectory()) return themes;
      } catch {
        return themes;
      }
      const entries = await fs2.promises.readdir(themesDir);
      for (const entry of entries) {
        if (!entry.endsWith(".js")) continue;
        const filePath = path2.join(themesDir, entry);
        try {
          const entryStat = await fs2.promises.stat(filePath);
          if (!entryStat.isFile()) continue;
          const code = await fs2.promises.readFile(filePath, "utf-8");
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
var https = __toESM(require("https"));
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
    if (url.startsWith("/bamboo-audio-proxy")) {
      this.handleAudioUrlProxy(req, res);
      return;
    }
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
      const isHTML = ext === ".html";
      const isStatic = [".css", ".js", ".woff", ".woff2", ".ttf", ".svg", ".png", ".ico", ".json"].includes(ext);
      const cacheControl = isHTML ? "no-cache" : isStatic ? "public, max-age=86400" : "public, max-age=3600";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": cacheControl
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
  /** /bamboo-audio-proxy?url=xxx — 代理外部音源 URL，绕过浏览器 CORS 限制 */
  handleAudioUrlProxy(req, res) {
    try {
      const rawUrl = req.url || "";
      const queryIndex = rawUrl.indexOf("?");
      if (queryIndex === -1) {
        res.writeHead(400);
        res.end("Missing url parameter");
        return;
      }
      const queryStr = rawUrl.slice(queryIndex + 1);
      const params = new URLSearchParams(queryStr);
      const targetUrl = params.get("url");
      if (!targetUrl) {
        res.writeHead(400);
        res.end("Missing url parameter");
        return;
      }
      let parsed;
      try {
        parsed = new URL(targetUrl);
      } catch {
        res.writeHead(400);
        res.end("Invalid URL");
        return;
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        res.writeHead(403);
        res.end("Forbidden: only http/https URLs allowed");
        return;
      }
      const hostname = parsed.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "[::1]" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.")) {
        res.writeHead(403);
        res.end("Forbidden: local/private network URLs not allowed");
        return;
      }
      const pathname = parsed.pathname.toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
        res.writeHead(403);
        res.end("Forbidden: unsupported audio format");
        return;
      }
      const transport = parsed.protocol === "https:" ? https : http;
      const proxyReq = transport.get(targetUrl, { timeout: 3e4 }, (proxyRes) => {
        const status = proxyRes.statusCode || 500;
        const ct = proxyRes.headers["content-type"] || "application/octet-stream";
        const maxSize = 50 * 1024 * 1024;
        let totalSize = 0;
        const chunks = [];
        proxyRes.on("data", (chunk) => {
          totalSize += chunk.length;
          if (totalSize > maxSize) {
            proxyReq.destroy();
            if (!res.headersSent) {
              res.writeHead(413);
              res.end("Audio file too large (max 50MB)");
            }
            return;
          }
          chunks.push(chunk);
        });
        proxyRes.on("end", () => {
          if (res.headersSent) return;
          res.writeHead(status, {
            "Content-Type": ct,
            "Content-Length": totalSize,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=3600"
          });
          const body = Buffer.concat(chunks);
          res.end(body);
        });
        proxyRes.on("error", (err) => {
          if (!res.headersSent) {
            console.error("[BambooReview] Audio URL proxy upstream error:", err.message);
            res.writeHead(502);
            res.end("Upstream error");
          }
        });
      });
      proxyReq.on("timeout", () => {
        proxyReq.destroy();
        if (!res.headersSent) {
          res.writeHead(504);
          res.end("Upstream timeout");
        }
      });
      proxyReq.on("error", (err) => {
        if (!res.headersSent) {
          console.error("[BambooReview] Audio URL proxy error:", err.message);
          res.writeHead(502);
          res.end("Upstream connection failed");
        }
      });
    } catch (e) {
      if (!res.headersSent) {
        console.error("[BambooReview] Audio URL proxy error:", e);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    }
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
async function extractZip(source, destDir) {
  const buf = typeof source === "string" ? await fs5.promises.readFile(source) : source;
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
  const writes = [];
  while (pos < buf.length - 4) {
    const sig = buf.readUInt32LE(pos);
    if (sig !== 67324752) break;
    pos += 4;
    read16();
    read16();
    const method = read16();
    skip(4);
    read32();
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
    const dir = path5.dirname(outPath);
    const data = buf.subarray(pos, pos + compressedSize);
    pos += compressedSize;
    if (method === 0) {
      writes.push(fs5.promises.mkdir(dir, { recursive: true }).then(() => fs5.promises.writeFile(outPath, data)));
      continue;
    }
    if (method === 8) {
      writes.push((async () => {
        let bytes;
        try {
          bytes = zlib.inflateRawSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
          if (bytes.length !== uncompressedSize) bytes = bytes.subarray(0, uncompressedSize);
        } catch {
          bytes = zlib.inflateSync(data);
        }
        await fs5.promises.mkdir(dir, { recursive: true });
        await fs5.promises.writeFile(outPath, bytes);
      })());
      continue;
    }
    throw new Error(`Unsupported compression method: ` + method + " (" + fileName + ")");
  }
}
function downloadAndExtractWebapp(pluginDir, destDir, version) {
  return new Promise((resolve, reject) => {
    const url = `https://github.com/miaoziguan/obsidian-bamboo-immortals/releases/download/${version}/webapp.zip`;
    https2.get(url, { headers: { "User-Agent": "obsidian-bamboo-immortals" } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https2.get(res.headers.location || "", { headers: { "User-Agent": "obsidian-bamboo-immortals" } }, (redir) => {
          const chunks2 = [];
          redir.on("data", (c) => chunks2.push(c));
          redir.on("end", () => {
            try {
              extractZip(Buffer.concat(chunks2), destDir).then(resolve).catch(reject);
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
          extractZip(Buffer.concat(chunks), destDir).then(resolve).catch(reject);
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
        new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u6B63\u5728\u89E3\u538B\u8D44\u6E90\u5305\u2026", 0);
        await extractZip(webappZip, webappDir);
        try {
          fs5.unlinkSync(webappZip);
        } catch {
        }
        new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5DF2\u66F4\u65B0", 3e3);
      } else {
        const downloadNotice = new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u6B63\u5728\u4E0B\u8F7D\u8D44\u6E90\u5305\u2026", 0);
        console.log("[BambooReview] Downloading webapp from release", currentVersion);
        await downloadAndExtractWebapp(pluginDir, webappDir, currentVersion);
        downloadNotice.hide();
        new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5B89\u88C5\u5B8C\u6210", 4e3);
      }
      fs5.writeFileSync(webappVersionFile, currentVersion, "utf-8");
      this.webappReady = true;
    } catch (e) {
      console.error("[BambooReview] Webapp setup failed:", e);
      new Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5B89\u88C5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u542F Obsidian", 0);
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
    ThemeBridge.restoreDefaults();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IExvY2FsU2VydmVyIH0gZnJvbSAnLi9zcmMvc2VydmVyL0xvY2FsU2VydmVyJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9zcmMvYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG4vKiogXHU3RUFGIE5vZGUuanMgWklQIFx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1Nlx1N0NGQlx1N0VERiB1bnppcC9Qb3dlclNoZWxsXHUzMDAyXHU1RjAyXHU2QjY1XHU4QkZCXHU1M0Q2K1x1ODlFM1x1NTM4Qlx1RkYwQ1x1NEVDNVx1NUI1N1x1ODI4Mlx1ODlFM1x1Njc5MFx1NEZERFx1NjMwMVx1NTQwQ1x1NkI2NVx1MzAwMiAqL1xuYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFppcChzb3VyY2U6IHN0cmluZyB8IEJ1ZmZlciwgZGVzdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGJ1ZiA9IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoc291cmNlKSA6IHNvdXJjZTtcbiAgbGV0IHBvcyA9IDA7XG5cbiAgY29uc3QgcmVhZDE2ID0gKCkgPT4geyBjb25zdCB2ID0gYnVmLnJlYWRVSW50MTZMRShwb3MpOyBwb3MgKz0gMjsgcmV0dXJuIHY7IH07XG4gIGNvbnN0IHJlYWQzMiA9ICgpID0+IHsgY29uc3QgdiA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTsgcG9zICs9IDQ7IHJldHVybiB2OyB9O1xuICBjb25zdCBza2lwID0gKG46IG51bWJlcikgPT4geyBwb3MgKz0gbjsgfTtcblxuICBjb25zdCB3cml0ZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gIC8vIFx1NjI2Qlx1NjNDRlx1NjI0MFx1NjcwOSBsb2NhbCBmaWxlIGhlYWRlclx1RkYwOFx1N0I3RVx1NTQwRCAweDA0MDM0YjUwXHVGRjA5XG4gIHdoaWxlIChwb3MgPCBidWYubGVuZ3RoIC0gNCkge1xuICAgIGNvbnN0IHNpZyA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTtcbiAgICBpZiAoc2lnICE9PSAweDA0MDM0YjUwKSBicmVhaztcblxuICAgIHBvcyArPSA0O1xuICAgIHJlYWQxNigpOyAvLyB2ZXJzaW9uXG4gICAgcmVhZDE2KCk7IC8vIGZsYWdzXG4gICAgY29uc3QgbWV0aG9kID0gcmVhZDE2KCk7XG4gICAgc2tpcCg0KTsgLy8gbW9kIHRpbWUsIG1vZCBkYXRlXG4gICAgcmVhZDMyKCk7IC8vIGNyYzMyXG4gICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSByZWFkMzIoKTtcbiAgICBjb25zdCB1bmNvbXByZXNzZWRTaXplID0gcmVhZDMyKCk7XG4gICAgY29uc3QgbmFtZUxlbiA9IHJlYWQxNigpO1xuICAgIGNvbnN0IGV4dHJhTGVuID0gcmVhZDE2KCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBidWYudG9TdHJpbmcoJ3V0Zi04JywgcG9zLCBwb3MgKyBuYW1lTGVuKTtcbiAgICBwb3MgKz0gbmFtZUxlbiArIGV4dHJhTGVuO1xuXG4gICAgLy8gXHU4REYzXHU4RkM3XHU3NkVFXHU1RjU1XHU2NzYxXHU3NkVFXG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcvJykgfHwgZmlsZU5hbWUuZW5kc1dpdGgoJ1xcXFwnKSkge1xuICAgICAgcG9zICs9IGNvbXByZXNzZWRTaXplO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0UGF0aCA9IHBhdGguam9pbihkZXN0RGlyLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKG91dFBhdGgpO1xuXG4gICAgY29uc3QgZGF0YSA9IGJ1Zi5zdWJhcnJheShwb3MsIHBvcyArIGNvbXByZXNzZWRTaXplKTtcbiAgICBwb3MgKz0gY29tcHJlc3NlZFNpemU7XG5cbiAgICBpZiAobWV0aG9kID09PSAwKSB7XG4gICAgICB3cml0ZXMucHVzaChmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pLnRoZW4oKCkgPT4gZnMucHJvbWlzZXMud3JpdGVGaWxlKG91dFBhdGgsIGRhdGEpKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kID09PSA4KSB7XG4gICAgICB3cml0ZXMucHVzaCgoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYnl0ZXM6IEJ1ZmZlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBieXRlcyA9IHpsaWIuaW5mbGF0ZVJhd1N5bmMoZGF0YSwgeyBmaW5pc2hGbHVzaDogemxpYi5jb25zdGFudHMuWl9TWU5DX0ZMVVNIIH0pO1xuICAgICAgICAgIGlmIChieXRlcy5sZW5ndGggIT09IHVuY29tcHJlc3NlZFNpemUpIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMCwgdW5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGJ5dGVzID0gemxpYi5pbmZsYXRlU3luYyhkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy53cml0ZUZpbGUob3V0UGF0aCwgYnl0ZXMpO1xuICAgICAgfSkoKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZDogYCArIG1ldGhvZCArICcgKCcgKyBmaWxlTmFtZSArICcpJyk7XG4gIH1cbn1cblxuLyoqIFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEIgKi9cbmZ1bmN0aW9uIGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXI6IHN0cmluZywgZGVzdERpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscy9yZWxlYXNlcy9kb3dubG9hZC8ke3ZlcnNpb259L3dlYmFwcC56aXBgO1xuICAgIGh0dHBzLmdldCh1cmwsIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdvYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9IH0sIChyZXMpID0+IHtcbiAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAyIHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDEpIHtcbiAgICAgICAgLy8gRm9sbG93IHJlZGlyZWN0XG4gICAgICAgIGh0dHBzLmdldChyZXMuaGVhZGVycy5sb2NhdGlvbiB8fCAnJywgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnIH0gfSwgKHJlZGlyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgICAgIHJlZGlyLm9uKCdkYXRhJywgKGM6IEJ1ZmZlcikgPT4gY2h1bmtzLnB1c2goYykpO1xuICAgICAgICAgIHJlZGlyLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBleHRyYWN0WmlwKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSwgZGVzdERpcikudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZWRpci5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQICR7cmVzLnN0YXR1c0NvZGV9OiAke3VybH1gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgIHJlcy5vbignZGF0YScsIChjOiBCdWZmZXIpID0+IGNodW5rcy5wdXNoKGMpKTtcbiAgICAgIHJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGV4dHJhY3RaaXAoQnVmZmVyLmNvbmNhdChjaHVua3MpLCBkZXN0RGlyKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9XG4gICAgICB9KTtcbiAgICAgIHJlcy5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gIH0pO1xufVxuXG4vKiogXHU1NDBFXHU1M0YwXHU1RjAyXHU2QjY1XHU1MjFEXHU1OUNCXHU1MzE2IHdlYmFwcFx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVx1NjNEMlx1NEVGNlx1NzY4NCBvbmxvYWQgXHU4RkQ0XHU1NkRFICovXG5mdW5jdGlvbiBzZXR1cFdlYmFwcEluQmFja2dyb3VuZChcbiAgdGhpczogQmFtYm9vUmV2aWV3UGx1Z2luLFxuICB3ZWJhcHBEaXI6IHN0cmluZyxcbiAgcGx1Z2luRGlyOiBzdHJpbmcsXG4gIHZhdWx0QmFzZVBhdGg6IHN0cmluZyxcbiAgY3VycmVudFZlcnNpb246IHN0cmluZ1xuKTogdm9pZCB7XG4gIGNvbnN0IHdlYmFwcFZlcnNpb25GaWxlID0gcGF0aC5qb2luKHdlYmFwcERpciwgJy52ZXJzaW9uJyk7XG4gIGNvbnN0IG5lZWRzVXBkYXRlID0gIWZzLmV4aXN0c1N5bmMod2ViYXBwVmVyc2lvbkZpbGUpIHx8XG4gICAgKCgpID0+IHsgdHJ5IHsgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyh3ZWJhcHBWZXJzaW9uRmlsZSwgJ3V0Zi04JykudHJpbSgpICE9PSBjdXJyZW50VmVyc2lvbjsgfSBjYXRjaCB7IHJldHVybiB0cnVlOyB9IH0pKCk7XG5cbiAgaWYgKCFuZWVkc1VwZGF0ZSkge1xuICAgIHRoaXMud2ViYXBwUmVhZHkgPSB0cnVlO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFx1NzUyOCBzZXRJbW1lZGlhdGUgLyBzZXRUaW1lb3V0IFx1NjNBOFx1OEZERlx1NTIzMFx1NEUwQlx1NEUwMFx1NEUyQSB0aWNrXHVGRjBDXHU3ODZFXHU0RkREIG9ubG9hZCBcdTUxNDhcdThGRDRcdTU2REVcbiAgc2V0SW1tZWRpYXRlKGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwRGlyKSkge1xuICAgICAgICB0cnkgeyBmcy5ybVN5bmMod2ViYXBwRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7IH0gY2F0Y2gge31cbiAgICAgIH1cbiAgICAgIGNvbnN0IHdlYmFwcFppcCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAuemlwJyk7XG4gICAgICBmcy5ta2RpclN5bmMod2ViYXBwRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwWmlwKSkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NkI2M1x1NTcyOFx1ODlFM1x1NTM4Qlx1OEQ0NFx1NkU5MFx1NTMwNVx1MjAyNicsIDApO1xuICAgICAgICBhd2FpdCBleHRyYWN0WmlwKHdlYmFwcFppcCwgd2ViYXBwRGlyKTtcbiAgICAgICAgdHJ5IHsgZnMudW5saW5rU3luYyh3ZWJhcHBaaXApOyB9IGNhdGNoIHt9XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1REYyXHU2NkY0XHU2NUIwJywgMzAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3dubG9hZE5vdGljZSA9IG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2QjYzXHU1NzI4XHU0RTBCXHU4RjdEXHU4RDQ0XHU2RTkwXHU1MzA1XHUyMDI2JywgMCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbQmFtYm9vUmV2aWV3XSBEb3dubG9hZGluZyB3ZWJhcHAgZnJvbSByZWxlYXNlJywgY3VycmVudFZlcnNpb24pO1xuICAgICAgICBhd2FpdCBkb3dubG9hZEFuZEV4dHJhY3RXZWJhcHAocGx1Z2luRGlyLCB3ZWJhcHBEaXIsIGN1cnJlbnRWZXJzaW9uKTtcbiAgICAgICAgZG93bmxvYWROb3RpY2UuaGlkZSgpO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1OEQ0NFx1NkU5MFx1NTMwNVx1NUI4OVx1ODhDNVx1NUI4Q1x1NjIxMCcsIDQwMDApO1xuICAgICAgfVxuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHdlYmFwcFZlcnNpb25GaWxlLCBjdXJyZW50VmVyc2lvbiwgJ3V0Zi04Jyk7XG4gICAgICB0aGlzLndlYmFwcFJlYWR5ID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBXZWJhcHAgc2V0dXAgZmFpbGVkOicsIGUpO1xuICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdThENDRcdTZFOTBcdTUzMDVcdTVCODlcdTg4QzVcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTdGNTFcdTdFRENcdTU0MEVcdTkxQ0RcdTU0MkYgT2JzaWRpYW4nLCAwKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW1ib29SZXZpZXdQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIGxvY2FsU2VydmVyOiBMb2NhbFNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHNlcnZlclVybCA9ICcnO1xuICAvKiogd2ViYXBwIFx1OEQ0NFx1NkU5MFx1NjYyRlx1NTQyNlx1NUMzMVx1N0VFQVx1RkYwOFx1NTNFRlx1NzUyOFx1NEU4RVx1OTk5Nlx1NUM0Rlx1NUM1NVx1NzkzQSBsb2FkaW5nIFx1NzJCNlx1NjAwMVx1RkYwOSAqL1xuICB3ZWJhcHBSZWFkeSA9IGZhbHNlO1xuXG4gIGFzeW5jIG9ubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkVcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4XHU2NzJDXHU1NzMwIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XG4gICAgY29uc3QgcGx1Z2luRGlyID0gKHRoaXMubWFuaWZlc3QgYXMgYW55KS5kaXI7XG4gICAgaWYgKHBsdWdpbkRpcikge1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBjb25zdCB3ZWJhcHBEaXIgPSBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnd2ViYXBwJyk7XG4gICAgICBjb25zdCB3ZWJhcHBJbmRleFBhdGggPSBwYXRoLmpvaW4od2ViYXBwRGlyLCAnaW5kZXguaHRtbCcpO1xuICAgICAgdGhpcy5sb2NhbFNlcnZlciA9IG5ldyBMb2NhbFNlcnZlcih3ZWJhcHBEaXIpO1xuXG4gICAgICAvLyBcdTdBQ0JcdTUzNzNcdTU0MkZcdTUyQThcdTY3MERcdTUyQTFcdTU2NjhcdUZGMDhcdTUzNzNcdTRGN0Ygd2ViYXBwIFx1OEZEOFx1NkNBMVx1NUMzMVx1N0VFQVx1RkYwOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTYzQlx1NTg1RSBvbmxvYWRcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jYWxTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSB0aGlzLmxvY2FsU2VydmVyLmdldFVybCgpO1xuICAgICAgICB0aGlzLmxvY2FsU2VydmVyLnNldFZhdWx0QmFzZVBhdGgodmF1bHRCYXNlUGF0aCk7XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5QyB3ZWJhcHAgXHU1REYyXHU1QzMxXHU3RUVBXHVGRjBDXHU3NkY0XHU2M0E1XHU2ODA3XHU4QkIwXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHdlYmFwcEluZGV4UGF0aCkpIHtcbiAgICAgICAgICB0aGlzLndlYmFwcFJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBGYWlsZWQgdG8gc3RhcnQgbG9jYWwgc2VydmVyOicsIGUpO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjcyQ1x1NTczMFx1NjcwRFx1NTJBMVx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTBFOFx1NTIwNlx1NTI5Rlx1ODBGRFx1RkYwOFx1NzY3RFx1NTY2QVx1OTdGM1x1MzAwMVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1RkYwOVx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1NzUyOCcsIDApO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTcyNDhcdTY3MkNcdThEREZcdThFMkEgJiB3ZWJhcHAgXHU0RTBCXHU4RjdEXHU2NTNFXHU1MjMwXHU1NDBFXHU1M0YwXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFIG9ubG9hZCBcdThGRDRcdTU2REVcbiAgICAgIHNldHVwV2ViYXBwSW5CYWNrZ3JvdW5kLmNhbGwodGhpcywgd2ViYXBwRGlyLCBwbHVnaW5EaXIsIHZhdWx0QmFzZVBhdGgsIHRoaXMubWFuaWZlc3QudmVyc2lvbik7XG4gICAgfVxuXG4gICAgLy8gXHU2Q0U4XHU1MThDIFZpZXdcbiAgICB0aGlzLnJlZ2lzdGVyVmlldyhWSUVXX1RZUEVfREFJTFlfUkVWSUVXLCAobGVhZjogV29ya3NwYWNlTGVhZikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYWlseVJldmlld1ZpZXcobGVhZiwgdGhpcy5zZXJ2ZXJVcmwsIHRoaXMsIHRoaXMuc2V0dGluZ3MsICgpID0+IHRoaXMuc2F2ZVNldHRpbmdzKCkpO1xuICAgIH0pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU1NDdEXHU0RUU0XG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1kYWlseS1yZXZpZXcnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NEVDQVx1NjVFNVx1NTkwRFx1NzZEOCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXByZXYtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTUyNERcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6cHJldkRheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtbmV4dC1kYXknLFxuICAgICAgbmFtZTogJ1x1NTQwRVx1NEUwMFx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjpuZXh0RGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS10b2RheScsXG4gICAgICBuYW1lOiAnXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnRvZGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLXN0YXRzJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTdFREZcdThCQTFcdTUyMDZcdTY3OTAnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCdhY3Rpb246b3BlblN0YXRzJyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLXNldHRpbmdzLWluLWFwcCcsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TZXR0aW5ncycpLFxuICAgIH0pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBQbHVnaW5TZXR0aW5ncyh0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgLy8gXHU2REZCXHU1MkEwXHU1REU2XHU0RkE3IFJpYmJvbiBcdTU2RkVcdTY4MDdcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oJ2xlYWYnLCAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJywgKCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLmFjdGl2YXRlVmlldygpO1xuICAgIH0pO1xuICB9XG5cbiAgb251bmxvYWQoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UucmVzdG9yZURlZmF1bHRzKCk7XG4gICAgdm9pZCB0aGlzLmxvY2FsU2VydmVyPy5zdG9wKCk7XG4gICAgdGhpcy5sb2NhbFNlcnZlciA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RkMwXHU2RDNCXHU2MjE2XHU1MjFCXHU1RUZBXHU1OTBEXHU3NkQ4XHU4OUM2XHU1NkZFICovXG4gIGFzeW5jIGFjdGl2YXRlVmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG5cbiAgICBsZXQgbGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG5cbiAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFx1NURGMlx1NjcwOVx1ODlDNlx1NTZGRVx1RkYwQ1x1NzZGNFx1NjNBNVx1ODA1QVx1NzEyNlxuICAgICAgbGVhZiA9IGxlYXZlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NUIwXHU4OUM2XHU1NkZFXG4gICAgICBsZWFmID0gd29ya3NwYWNlLmdldExlYWYoZmFsc2UpO1xuICAgICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoe1xuICAgICAgICB0eXBlOiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobGVhZikge1xuICAgICAgYXdhaXQgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU1QkZDXHU4MjJBL1x1NjRDRFx1NEY1Q1x1NjMwN1x1NEVFNCAqL1xuICBwcml2YXRlIHNlbmRUb0lmcmFtZSh0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgIGlmIChsZWF2ZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCB2aWV3ID0gbGVhdmVzWzBdLnZpZXcgYXMgRGFpbHlSZXZpZXdWaWV3O1xuICAgIGNvbnN0IGlmcmFtZSA9ICh2aWV3IGFzIGFueSkuaWZyYW1lIGFzIEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAoaWZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICBsZXQgb3JpZ2luID0gJyonO1xuICAgICAgdHJ5IHsgb3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47IH0gY2F0Y2ggeyAvKiBrZWVwICcqJyAqLyB9XG4gICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgICAgeyB0eXBlLCBpZDogJ2NtZF8nICsgRGF0ZS5ub3coKSB9LFxuICAgICAgICBvcmlnaW5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICAvKiogXHU0RkREXHU1QjU4XHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgSXRlbVZpZXcsIFdvcmtzcGFjZUxlYWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9TdG9yYWdlQnJpZGdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7IEJyaWRnZVNlcnZpY2UgfSBmcm9tICcuLi9icmlkZ2UvQnJpZGdlU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX0RBSUxZX1JFVklFVyA9ICdiYW1ib28taW1tb3J0YWxzJztcblxuLyoqXG4gKiBEYWlseVJldmlld1ZpZXcgLSBcdTRFM0JcdTg5QzZcdTU2RkVcbiAqXG4gKiBcdTgwNENcdThEMjNcdTY3ODFcdTdCODBcdUZGMUFcbiAqIDEuIFx1NTIxQlx1NUVGQSBpZnJhbWUgXHU2MjdGXHU4RjdEIFBXQVxuICogMi4gXHU3QkExXHU3NDA2IEJyaWRnZVNlcnZpY2UgXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKiAzLiBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU1RTc2XHU1NDBDXHU2QjY1XG4gKi9cbmV4cG9ydCBjbGFzcyBEYWlseVJldmlld1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgYnJpZGdlU2VydmljZTogQnJpZGdlU2VydmljZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWVFcnJvckhhbmRsZXI6ICgoZTogRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUga2V5ZG93bkZvcndhcmRlcjogKChlOiBLZXlib2FyZEV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9jaGVja0ludGVydmFsOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjc3NDaGFuZ2VSZWY6IGFueSA9IG51bGw7XG4gIHByaXZhdGUgd2ViYXBwUGF0aDogc3RyaW5nO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgcHJpdmF0ZSBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCB3ZWJhcHBQYXRoOiBzdHJpbmcsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luLCBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPikge1xuICAgIHN1cGVyKGxlYWYpO1xuICAgIHRoaXMud2ViYXBwUGF0aCA9IHdlYmFwcFBhdGg7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0RBSUxZX1JFVklFVztcbiAgfVxuXG4gIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnO1xuICB9XG5cbiAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGVhZic7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV07XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LWNvbnRhaW5lcicpO1xuXG4gICAgaWYgKCF0aGlzLndlYmFwcFBhdGgpIHtcbiAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY1RTBcdTZDRDVcdTVCOUFcdTRGNEQgd2ViYXBwIFx1OEQ0NFx1NkU5MFx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNVx1NjNEMlx1NEVGNlx1NUI4OVx1ODhDNVx1NzZFRVx1NUY1NScsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gd2ViYXBwIFx1NUMxQVx1NjcyQVx1NUMzMVx1N0VFQVx1NjVGNlx1NjYzRVx1NzkzQSBsb2FkaW5nIFx1NTM2MFx1NEY0RFx1RkYwQ1x1NTQwRVx1NTNGMFx1NUYwMlx1NkI2NVx1NjJDOVx1NTMwNVx1ODlFM1x1NTMwNVxuICAgIGlmICghdGhpcy5wbHVnaW4ud2ViYXBwUmVhZHkpIHtcbiAgICAgIGNvbnN0IHN0YXR1c0VsID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTZCNjNcdTU3MjhcdTUyMURcdTU5Q0JcdTUzMTZcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTIwMjYnLFxuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWxvYWRpbmcnLFxuICAgICAgfSk7XG4gICAgICAvLyBcdThGNkVcdThCRTJcdTdCNDlcdTVGODVcdTVDMzFcdTdFRUFcdTU0MEVcdTUyQTBcdThGN0QgaWZyYW1lXG4gICAgICBsZXQgdGlja3MgPSAwO1xuICAgICAgdGhpcy5fY2hlY2tJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHRpY2tzKys7XG4gICAgICAgIGlmICh0aGlzLnBsdWdpbi53ZWJhcHBSZWFkeSkge1xuICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2NoZWNrSW50ZXJ2YWwhKTtcbiAgICAgICAgICB0aGlzLl9jaGVja0ludGVydmFsID0gbnVsbDtcbiAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgICB2b2lkIHRoaXMuc2V0dXBJZnJhbWUoY29udGFpbmVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gMzAgXHU3OUQyXHU1NDBFXHU2M0QwXHU3OTNBXHU3RjUxXHU3RURDXHU4RjgzXHU2MTYyXG4gICAgICAgIGlmICh0aWNrcyA9PT0gNjApIHtcbiAgICAgICAgICBzdGF0dXNFbC5zZXRUZXh0KCdcdTZCNjNcdTU3MjhcdTRFMEJcdThGN0RcdThENDRcdTZFOTBcdTUzMDVcdUZGMENcdTdGNTFcdTdFRENcdThGODNcdTYxNjJcdThCRjdcdTdBMERcdTUwMTlcdTIwMjYnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAxMjAgXHU3OUQyXHU1NDBFXHU2M0QwXHU3OTNBXHU1M0VGXHU4MEZEXHU1OTMxXHU4RDI1XG4gICAgICAgIGlmICh0aWNrcyA9PT0gMjQwKSB7XG4gICAgICAgICAgc3RhdHVzRWwuc2V0VGV4dCgnXHU4RDQ0XHU2RTkwXHU1MzA1XHU0RTBCXHU4RjdEXHU1RjAyXHU1RTM4XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU3RjUxXHU3RURDXHU1NDBFXHU5MUNEXHU1NDJGIE9ic2lkaWFuJyk7XG4gICAgICAgIH1cbiAgICAgIH0sIDUwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5zZXR1cElmcmFtZShjb250YWluZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZXR1cElmcmFtZShjb250YWluZXI6IEhUTUxFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU1MjFCXHU1RUZBIGlmcmFtZSAtIFx1NEUwRFx1NEY3Rlx1NzUyOCBzYW5kYm94XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU2QjYyIGFwcDovLyBcdTUzNEZcdThCQUVcdTRFMEJcdTc2ODRcdTVCNTBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcbiAgICB0aGlzLmlmcmFtZSA9IGNvbnRhaW5lci5jcmVhdGVFbCgnaWZyYW1lJywge1xuICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1mcmFtZScsXG4gICAgICBhdHRyOiB7XG4gICAgICAgIHNyYzogdGhpcy53ZWJhcHBQYXRoLFxuICAgICAgICBhbGxvdzogJ2NhbWVyYTsgbWljcm9waG9uZTsgY2xpcGJvYXJkLXJlYWQ7IGNsaXBib2FyZC13cml0ZScsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gaWZyYW1lIFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNVx1NjVGNlx1NjYzRVx1NzkzQVx1NjNEMFx1NzkzQVxuICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBpZnJhbWUgZmFpbGVkIHRvIGxvYWQ6JywgdGhpcy53ZWJhcHBQYXRoKTtcbiAgICB9O1xuICAgIHRoaXMuaWZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuXG4gICAgLy8gXHU1RjUzIGlmcmFtZSBcdTU5MDRcdTRFOEVcdTcxMjZcdTcwQjlcdTY1RjZcdUZGMENcdTVDMDYgQ3RybC9DbWQgXHU1RkVCXHU2Mzc3XHU5NTJFXHU4RjZDXHU1M0QxXHU3RUQ5IE9ic2lkaWFuXHVGRjBDXG4gICAgLy8gXHU3ODZFXHU0RkREXHU1NDdEXHU0RUU0XHU5NzYyXHU2NzdGXHVGRjA4Q3RybC9DbWQrUFx1RkYwOVx1MzAwMVx1NUZFQlx1OTAxRlx1NTIwN1x1NjM2Mlx1RkYwOEN0cmwvQ21kK09cdUZGMDlcdTdCNDlcdTUxNjhcdTVDNDBcdTVGRUJcdTYzNzdcdTk1MkVcdTRFQ0RcdTcxMzZcdTUzRUZcdTc1MjhcbiAgICBjb25zdCBvYnNpZGlhbkRvYyA9IGFjdGl2ZURvY3VtZW50O1xuICAgIGxldCBmb3J3YXJkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5rZXlkb3duRm9yd2FyZGVyID0gKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChmb3J3YXJkaW5nKSByZXR1cm47XG4gICAgICBpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkge1xuICAgICAgICBmb3J3YXJkaW5nID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEtleWJvYXJkRXZlbnQoJ2tleWRvd24nLCB7XG4gICAgICAgICAga2V5OiBlLmtleSxcbiAgICAgICAgICBjb2RlOiBlLmNvZGUsXG4gICAgICAgICAgY3RybEtleTogZS5jdHJsS2V5LFxuICAgICAgICAgIG1ldGFLZXk6IGUubWV0YUtleSxcbiAgICAgICAgICBzaGlmdEtleTogZS5zaGlmdEtleSxcbiAgICAgICAgICBhbHRLZXk6IGUuYWx0S2V5LFxuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2lkaWFuRG9jLmJvZHkuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgICAgICBmb3J3YXJkaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgICBhY3RpdmVEb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duRm9yd2FyZGVyLCB0cnVlKTtcblxuICAgIC8vIFx1NTIxRFx1NTlDQlx1NTMxNlx1Njg2NVx1NjNBNVx1NjcwRFx1NTJBMVxuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBhd2FpdCBzdG9yYWdlLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgY29uc3Qgc3RvcmFnZUJyaWRnZSA9IG5ldyBTdG9yYWdlQnJpZGdlKHN0b3JhZ2UsIHRoaXMuc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbmV3IFRoZW1lQnJpZGdlKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlID0gbmV3IEJyaWRnZVNlcnZpY2UoXG4gICAgICBzdG9yYWdlQnJpZGdlLFxuICAgICAgdGhpcy50aGVtZUJyaWRnZSxcbiAgICAgIHRoaXMuc2V0dGluZ3MsXG4gICAgICB0aGlzLnNhdmVTZXR0aW5nc1xuICAgICk7XG5cbiAgICAvLyBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTJEXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XG4gICAgY29uc3QgY3VzdG9tVGhlbWVzID0gYXdhaXQgdGhpcy5fc2NhbkN1c3RvbVRoZW1lcygpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRDdXN0b21UaGVtZXMoY3VzdG9tVGhlbWVzKTtcblxuICAgIC8vIFx1NEYyMFx1OTAxMlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOFx1NEY5Qlx1NzY3RFx1NTY2QVx1OTdGM1x1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjI2Qlx1NjNDRi9cdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICBpZiAodmF1bHRCYXNlUGF0aCkge1xuICAgICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldFZhdWx0QmFzZVBhdGgodmF1bHRCYXNlUGF0aCk7XG4gICAgfVxuICAgIC8vIFx1NEYyMFx1OTAxMlx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFxuICAgIGlmICh0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCkge1xuICAgICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldE5vaXNlUGF0aCh0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCk7XG4gICAgfVxuICAgIC8vIFx1NEYyMFx1OTAxMiBPYnNpZGlhbiBcdTkxNERcdTdGNkVcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhcdTY1MkZcdTYzMDFcdTc1MjhcdTYyMzdcdTgxRUFcdTVCOUFcdTRFNDkgLm9ic2lkaWFuIFx1NTQwRFx1NzlGMFx1RkYwOVxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRDb25maWdEaXIodGhpcy5hcHAudmF1bHQuY29uZmlnRGlyKTtcblxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5hdHRhY2godGhpcy5pZnJhbWUpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKHRoaXMuaWZyYW1lKTtcblxuICAgIC8vIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcbiAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5vbignY3NzLWNoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2U/Lm9uVGhlbWVDaGFuZ2VkKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1OEY2RVx1OEJFMiBpbnRlcnZhbFxuICAgIGlmICh0aGlzLl9jaGVja0ludGVydmFsICE9PSBudWxsKSB7XG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLl9jaGVja0ludGVydmFsKTtcbiAgICAgIHRoaXMuX2NoZWNrSW50ZXJ2YWwgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1Njg2NVx1NjNBNVx1NjcwRFx1NTJBMVxuICAgIHRoaXMuYnJpZGdlU2VydmljZT8uZGV0YWNoKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzQlx1OTg5OFx1NzZEMVx1NTQyQ1xuICAgIGlmICh0aGlzLmNzc0NoYW5nZVJlZikge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9mZnJlZih0aGlzLmNzc0NoYW5nZVJlZik7XG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy50aGVtZUJyaWRnZT8uZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgaWZyYW1lIGVycm9yIFx1NzZEMVx1NTQyQ1x1NTY2OFxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcikge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG4gICAgICB0aGlzLmlmcmFtZUVycm9ySGFuZGxlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU5NTJFXHU3NkQ4XHU4RjZDXHU1M0QxXHU1NjY4XG4gICAgaWYgKHRoaXMua2V5ZG93bkZvcndhcmRlcikge1xuICAgICAgYWN0aXZlRG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bkZvcndhcmRlciwgdHJ1ZSk7XG4gICAgICB0aGlzLmtleWRvd25Gb3J3YXJkZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWVcbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgX3NjYW5DdXN0b21UaGVtZXMoKTogUHJvbWlzZTxBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgdGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBpZiAoIXZhdWx0QmFzZVBhdGgpIHJldHVybiB0aGVtZXM7XG5cbiAgICAgIGNvbnN0IHRoZW1lRGlyTmFtZSA9IHRoaXMuc2V0dGluZ3MudGhlbWVQYXRoIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgY29uc3QgdGhlbWVzRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHRoZW1lRGlyTmFtZSk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdCh0aGVtZXNEaXIpO1xuICAgICAgICBpZiAoIXN0YXQuaXNEaXJlY3RvcnkoKSkgcmV0dXJuIHRoZW1lcztcbiAgICAgIH0gY2F0Y2ggeyByZXR1cm4gdGhlbWVzOyB9XG5cbiAgICAgIGNvbnN0IGVudHJpZXM6IHN0cmluZ1tdID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcih0aGVtZXNEaXIpO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmICghZW50cnkuZW5kc1dpdGgoJy5qcycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhlbWVzRGlyLCBlbnRyeSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgZW50cnlTdGF0ID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmaWxlUGF0aCk7XG4gICAgICAgICAgaWYgKCFlbnRyeVN0YXQuaXNGaWxlKCkpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGNvZGU6IHN0cmluZyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRGaWxlKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAvLyBcdTVGRUJcdTkwMUZcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTUzMDVcdTU0MkJcdTVGQzVcdTk3MDBcdTc2ODQgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlxuICAgICAgICAgIGlmICghY29kZS5pbmNsdWRlcygnX19iYW1ib29fdGhlbWVfJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1N0YzQVx1NUMxMSBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlbWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLFxuICAgICAgICAgICAgY29kZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtCYW1ib29SZXZpZXddIFx1OEJGQlx1NTNENlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTU5MzFcdThEMjU6YCwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGVtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gXHU1M0QxXHU3M0IwICR7dGhlbWVzLmxlbmd0aH0gXHU0RTJBXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4OmAsIHRoZW1lcy5tYXAodCA9PiB0Lm5hbWUpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjVGNlx1NTFGQVx1OTUxOTonLCBlcnIubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1RkYwQ1x1NUMwNlx1OERGM1x1OEZDNzogJHtwYXRofWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsRGF5cygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IGZpbGVzLmZpbGVzXG4gICAgICAuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzb24nKSlcbiAgICAgIC5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmICghZGF0ZUtleSkgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChmaWxlKTtcbiAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHBhcnNlIGRheSBmaWxlOiAke2ZpbGV9YCwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuICAgIHJldHVybiBkYXlzO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NjVFNVx1NjcxRiBrZXlcdUZGMDhcdTYzMDlcdTY1RTVcdTY3MUZcdTk2NERcdTVFOEZcdUZGMENcdTY3MDBcdTY1QjBcdTU3MjhcdTUyNERcdUZGMDkgKi9cbiAgYXN5bmMgZ2V0RGF5S2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkga2V5cy5wdXNoKGRhdGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBrZXlzLnNvcnQoKS5yZXZlcnNlKCk7IC8vIFx1OTY0RFx1NUU4Rlx1RkYxQVx1NjcwMFx1NjVCMFx1NjVFNVx1NjcxRlx1NTcyOFx1NTI0RFxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIwNlx1OTg3NVx1NTJBMFx1OEY3RFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVxuICAgKiBAcGFyYW0gcGFnZSBcdTk4NzVcdTc4MDFcdUZGMDhcdTRFQ0UgMCBcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICogQHBhcmFtIHBhZ2VTaXplIFx1NkJDRlx1OTg3NVx1NjU3MFx1OTFDRlxuICAgKiBAcmV0dXJucyB7IGRheXMsIHRvdGFsLCBwYWdlLCBwYWdlU2l6ZSwgaGFzTW9yZSB9XG4gICAqL1xuICBhc3luYyBnZXREYXlzUGFnaW5hdGVkKHBhZ2UgPSAwLCBwYWdlU2l6ZSA9IDMwKTogUHJvbWlzZTx7XG4gICAgZGF5czogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgICBrZXlzOiBzdHJpbmdbXTtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIGhhc01vcmU6IGJvb2xlYW47XG4gIH0+IHtcbiAgICBjb25zdCBhbGxLZXlzID0gYXdhaXQgdGhpcy5nZXREYXlLZXlzKCk7XG4gICAgY29uc3QgdG90YWwgPSBhbGxLZXlzLmxlbmd0aDtcbiAgICBjb25zdCBzdGFydCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBwYWdlS2V5cyA9IGFsbEtleXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgIGNvbnN0IHJlYWRzID0gcGFnZUtleXMubWFwKGFzeW5jIChkYXRlS2V5KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXREYXkoZGF0ZUtleSk7XG4gICAgICAgIGlmIChkYXRhKSBkYXlzW2RhdGVLZXldID0gZGF0YTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gbG9hZCBkYXk6ICR7ZGF0ZUtleX1gLCBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5cyxcbiAgICAgIGtleXM6IHBhZ2VLZXlzLFxuICAgICAgdG90YWwsXG4gICAgICBwYWdlLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBoYXNNb3JlOiBzdGFydCArIHBhZ2VLZXlzLmxlbmd0aCA8IHRvdGFsLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBwdXREYXkoZGF5RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dEdvYWxzKGdvYWxzOiB1bmtub3duW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBKU09OLnBhcnNlKGRhdGEpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgMik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHsgW2tleV06IHZhbHVlIH0sIG51bGwsIDIpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxTZXR0aW5ncygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dFB1cmNoYXNlSGlzdG9yeShkYXRhOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMiAoaW5jb21lLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgaW5jb21lSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9pbmNvbWUtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRJbmNvbWVIaXN0b3J5KCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gIH1cblxuICBhc3luYyBwdXRJbmNvbWVIaXN0b3J5KGRhdGE6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NUJGQ1x1NTFGQS9cdTVCRkNcdTUxNjUgLS0tLVxuXG4gIGFzeW5jIGV4cG9ydEFsbERhdGEoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBpZiAoZGF0YS5kYXlzKSB7XG4gICAgICBmb3IgKGNvbnN0IGRheSBvZiBPYmplY3QudmFsdWVzKGRhdGEuZGF5cykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXREYXkoZGF5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEuZ29hbHMpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoZGF0YS5nb2FscyBhcyBhbnlbXSk7XG4gICAgfVxuICAgIGlmIChkYXRhLnNldHRpbmdzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhkYXRhLnNldHRpbmdzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dFNldHRpbmcoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhLnB1cmNoYXNlSGlzdG9yeSkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRQdXJjaGFzZUhpc3RvcnkoZGF0YS5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5pbmNvbWVIaXN0b3J5KSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEluY29tZUhpc3RvcnkoZGF0YS5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjbGVhckFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIodGhpcy5iYXNlUGF0aCwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvLyAtLS0tIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAtLS0tXG5cbiAgcHJpdmF0ZSByZXZpZXdQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcmV2aWV3cy8ke2RhdGVLZXl9Lm1kYCk7XG4gIH1cblxuICBhc3luYyB3cml0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZywgbWFya2Rvd246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgbWFya2Rvd24pO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogTWFya2Rvd25TeW5jIC0gXHU1QzA2IERheURhdGEgSlNPTiBcdThGNkNcdTYzNjJcdTRFM0FcdTUzRUZcdThCRkJcdTc2ODQgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cblxuaW50ZXJmYWNlIERheURhdGEge1xuICBkYXRlOiBzdHJpbmc7XG4gIHdlZWtkYXk6IHN0cmluZztcbiAgbWV0cmljcz86IHtcbiAgICBmaXJzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgbGFzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgY29tcGxldGVkVGFza3M/OiBzdHJpbmc7XG4gICAgaW5zcGlyYXRpb25Db3VudD86IHN0cmluZztcbiAgICBhY3RpdmVUaW1lPzogc3RyaW5nO1xuICAgIGVtcHR5U2xvdHM/OiBzdHJpbmc7XG4gIH07XG4gIHRpbWVsaW5lPzogQXJyYXk8e1xuICAgIHBlcmlvZDogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0aW1lOiBzdHJpbmc7XG4gICAgaWNvbj86IHN0cmluZztcbiAgICBldmFsPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyB0aW1lOiBzdHJpbmc7IHRhc2s6IHN0cmluZzsgZXZhbD86IHN0cmluZyB9PjtcbiAgfT47XG4gIGdvYWxzPzogQXJyYXk8e1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBtZXRhPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHBlcmNlbnQ/OiBudW1iZXI7IGRldGFpbD86IHN0cmluZyB9PjtcbiAgfT47XG59XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blN5bmMge1xuICAvKiogXHU1QzA2IERheURhdGEgXHU4RjZDXHU2MzYyXHU0RTNBIE1hcmtkb3duICovXG4gIHN0YXRpYyBnZW5lcmF0ZU1hcmtkb3duKGRhdGE6IERheURhdGEpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gZnJvbnRtYXR0ZXJcdUZGMDhcdTUyQThcdTYwMDFcdTUwM0NcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdTUzMDVcdTg4RjlcdTk2MzJcdTZCNjIgWUFNTCBcdTZDRThcdTUxNjVcdUZGMDlcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKGBkYXRlOiBcIiR7ZGF0YS5kYXRlfVwiYCk7XG4gICAgbGluZXMucHVzaChgd2Vla2RheTogXCIke2RhdGEud2Vla2RheX1cImApO1xuICAgIGxpbmVzLnB1c2goJ3R5cGU6IEJhbWJvbyBJbW1vcnRhbHMnKTtcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFxuICAgIGxpbmVzLnB1c2goYCMgJHtkYXRhLmRhdGV9ICR7ZGF0YS53ZWVrZGF5fVx1NTkwRFx1NzZEOGApO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2MzA3XHU2ODA3XG4gICAgaWYgKGRhdGEubWV0cmljcykge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2MzA3XHU2ODA3Jyk7XG4gICAgICBjb25zdCBtID0gZGF0YS5tZXRyaWNzO1xuICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAobS5maXJzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1OTk5Nlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmZpcnN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmxhc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTY3MkJcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5sYXN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmNvbXBsZXRlZFRhc2tzKSBwYXJ0cy5wdXNoKGBcdTVCOENcdTYyMTBcdTRFRkJcdTUyQTE6ICR7bS5jb21wbGV0ZWRUYXNrc31gKTtcbiAgICAgIGlmIChtLmluc3BpcmF0aW9uQ291bnQpIHBhcnRzLnB1c2goYFx1NzA3NVx1NjExRjogJHttLmluc3BpcmF0aW9uQ291bnR9YCk7XG4gICAgICBpZiAobS5hY3RpdmVUaW1lKSBwYXJ0cy5wdXNoKGBcdTZEM0JcdThEQzNcdTY1RjZcdTk1N0Y6ICR7bS5hY3RpdmVUaW1lfWApO1xuICAgICAgaWYgKG0uZW1wdHlTbG90cykgcGFydHMucHVzaChgXHU3QTdBXHU3NjdEXHU2NUY2XHU2QkI1OiAke20uZW1wdHlTbG90c31gKTtcblxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDAsIDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgfVxuXG4gICAgLy8gXHU2NUY2XHU5NUY0XHU3RUJGXG4gICAgaWYgKGRhdGEudGltZWxpbmUgJiYgZGF0YS50aW1lbGluZS5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTY1RjZcdTk1RjRcdTdFQkYnKTtcbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgZGF0YS50aW1lbGluZSkge1xuICAgICAgICBjb25zdCBpY29uID0gYmxvY2suaWNvbiA/IGAke2Jsb2NrLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2Jsb2NrLm5hbWV9ICgke2Jsb2NrLnRpbWV9KWApO1xuICAgICAgICBpZiAoYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWxTdHIgPSBpdGVtLmV2YWwgPyBgIC0gJHtpdGVtLmV2YWx9YCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0udGltZX0gJHtpdGVtLnRhc2t9JHtldmFsU3RyfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTZcbiAgICBpZiAoZGF0YS5nb2FscyAmJiBkYXRhLmdvYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNicpO1xuICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGRhdGEuZ29hbHMpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGdvYWwuaWNvbiA/IGAke2dvYWwuaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7Z29hbC50aXRsZX1gKTtcbiAgICAgICAgaWYgKGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZ29hbC5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IGl0ZW0ucGVyY2VudCAhPT0gdW5kZWZpbmVkID8gYCAke2l0ZW0ucGVyY2VudH0lYCA6ICcnO1xuICAgICAgICAgICAgY29uc3QgZGV0YWlsID0gaXRlbS5kZXRhaWwgPyBgICgke2l0ZW0uZGV0YWlsfSlgIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS5uYW1lfSR7cGVyY2VudH0ke2RldGFpbH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgTWFya2Rvd25TeW5jIH0gZnJvbSAnLi4vc3RvcmFnZS9NYXJrZG93blN5bmMnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuXG4vKipcbiAqIFN0b3JhZ2VCcmlkZ2UgLSBcdTVDMDYgc3RvcmFnZToqIFx1NkQ4OFx1NjA2Rlx1NjYyMFx1NUMwNFx1NTIzMCBWYXVsdFN0b3JhZ2UgXHU2NENEXHU0RjVDXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yYWdlQnJpZGdlIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2U6IFZhdWx0U3RvcmFnZSwgZW5hYmxlTWFya2Rvd25TeW5jID0gdHJ1ZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgdGhpcy5lbmFibGVNYXJrZG93blN5bmMgPSBlbmFibGVNYXJrZG93blN5bmM7XG4gIH1cblxuICBhc3luYyBoYW5kbGUobWVzc2FnZTogQW55QnJpZGdlTWVzc2FnZSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZS5wdXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAvLyBcdTUzQ0NcdTUxOTkgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZU1hcmtkb3duU3luYyAmJiBtZXNzYWdlLnBheWxvYWQuZGF0YSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtZCA9IE1hcmtkb3duU3luYy5nZW5lcmF0ZU1hcmtkb3duKG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS53cml0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5LCBtZCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXJrZG93biBzeW5jIGZhaWxlZDonLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVEYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5LCBtZXNzYWdlLnBheWxvYWQudmFsdWUpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRHb2FscyhtZXNzYWdlLnBheWxvYWQuZ29hbHMpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRQdXJjaGFzZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRJbmNvbWVIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCc6IHtcbiAgICAgICAgY29uc3QgcGFnaW5hdGVkUGF5bG9hZCA9IG1lc3NhZ2UucGF5bG9hZCBhcyB7IHBhZ2U/OiBudW1iZXI7IHBhZ2VTaXplPzogbnVtYmVyIH07XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5c1BhZ2luYXRlZChcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2UgPz8gMCxcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2VTaXplID8/IDMwXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpjbGVhckFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXJBbGwoKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0b3JhZ2UgbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICB9XG4gIH1cbn1cbiIsICJcbi8qKlxuICogVGhlbWVCcmlkZ2UgLSBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHVGRjBDXHU2M0E4XHU5MDAxXHU1MjMwIGlmcmFtZVxuICogICAgICAgICAgICAgICsgXHU1M0NEXHU1NDExXHVGRjFBXHU2M0E1XHU2NTM2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTUwM0NcdUZGMENcdTZDRThcdTUxNjUgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtZUJyaWRnZSB7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBleHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIHByaXZhdGUgX3BhbGV0dGVTeW5jVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogXHU1QjU4XHU1MEE4XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTk1MkVcdTU0MERcdUZGMENcdTc1MjhcdTRFOEUgcmVzdG9yZURlZmF1bHRzIFx1NkUwNVx1NzQwNiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOSkVDVEVEX1ZBUlMgPSBbXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnLFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJyxcbiAgICAgICctLXRleHQtYWNjZW50JyxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeScsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScsXG4gICAgICAnLS10ZXh0LW5vcm1hbCcsXG4gICAgICAnLS10ZXh0LW11dGVkJyxcbiAgICBdO1xuXG4gICAgLyoqIFx1OTYzMlx1NjI5Nlx1N0FERVx1NjAwMVx1NjgwN1x1OEJCMFx1RkYxQXJlc3RvcmVEZWZhdWx0cyBcdTg4QUJcdThDMDNcdTc1MjhcdTU0MEVcdThCQkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTYzQlx1NkI2Mlx1NUVGNlx1OEZERlx1NTZERVx1OEMwM1x1ODk4Nlx1NTE5OSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdXBwcmVzc2VkID0gZmFsc2U7XG5cbiAgYXR0YWNoSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGRldGFjaElmcmFtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NjYwRVx1NjY5N1x1NzJCNlx1NjAwMSAqL1xuICBpc0RhcmtNb2RlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU3MkI2XHU2MDAxICovXG4gIHB1c2hUaGVtZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG5cbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiAndGhlbWU6Y2hhbmdlZCcsXG4gICAgICAgIGlkOiAndGhlbWVfcHVzaF8nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgcGF5bG9hZDogeyBpc0Rhcms6IHRoaXMuaXNEYXJrTW9kZSgpIH0sXG4gICAgICB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTRGOUJcdTU5MTZcdTkwRThcdThDMDNcdTc1MjhcdUZGMUFPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDEgKi9cbiAgb25UaGVtZUNoYW5nZWQoKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoVGhlbWUoKTtcbiAgfVxuXG4gIC8vID09PT09IFx1NTNDQ1x1NTQxMVx1OEMwM1x1ODI3MiA9PT09PVxuXG4gIC8qKlxuICAgKiBcdThCQTFcdTdCOTcgd2ViYXBwIFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTYgXHUyMTkyIE9ic2lkaWFuIENTUyBcdTUzRDhcdTkxQ0ZcdTY2MjBcdTVDMDRcbiAgICogXHU0RUM1XHU4OTg2XHU3NkQ2IDMgXHU3QzdCXHU2ODM4XHU1RkMzXHU4MjcyXHVGRjA4XHU1RjNBXHU4QzAzL1x1ODBDQ1x1NjY2Ri9cdTY1ODdcdTVCNTdcdUZGMDlcdUZGMENcdTUxNzZcdTRGNTlcdTc1MzEgT2JzaWRpYW4gXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU2M0E4XHU3Qjk3XG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZU9ic2lkaWFuVmFycyhodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGNvbnN0IGggPSBNYXRoLnJvdW5kKGh1ZSk7XG4gICAgY29uc3QgbG8gPSBNYXRoLm1heCgtMzAsIE1hdGgubWluKDMwLCBsaWdodG5lc3NPZmZzZXQpKTtcblxuICAgIC8vIFx1NUYzQVx1OEMwM1x1ODI3MlxuICAgIGNvbnN0IGFjY2VudFMgPSA0MDtcbiAgICBjb25zdCBhY2NlbnRMID0gaXNEYXJrID8gNTAgOiA0MDtcbiAgICBjb25zdCBhY2NlbnQgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEx9JSlgO1xuICAgIGNvbnN0IGFjY2VudEhvdmVyID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMICsgNX0lKWA7XG5cbiAgICAvLyBcdTgwQ0NcdTY2NkZcdTgyNzJcbiAgICBjb25zdCBiZ1MgPSBpc0RhcmsgPyA4IDogMTI7XG4gICAgY29uc3QgYmdMID0gaXNEYXJrXG4gICAgICA/IE1hdGgubWF4KDUsIDEyICsgbG8gKiAwLjMpXG4gICAgICA6IE1hdGgubWluKDk4LCA5NCArIGxvICogMC4xNSk7XG4gICAgY29uc3QgYmdQcmltYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2JnTH0lKWA7XG4gICAgY29uc3QgYmdTZWNvbmRhcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7aXNEYXJrID8gYmdMICsgMyA6IGJnTCAtIDJ9JSlgO1xuXG4gICAgLy8gXHU2NTg3XHU1QjU3XHU4MjcyXG4gICAgY29uc3QgdGV4dE5vcm1hbCA9IGlzRGFyayA/IGBoc2woJHtofSwgNiUsIDg4JSlgIDogYGhzbCgke2h9LCA2JSwgMTIlKWA7XG4gICAgY29uc3QgdGV4dE11dGVkICA9IGlzRGFyayA/IGBoc2woJHtofSwgNCUsIDU1JSlgIDogYGhzbCgke2h9LCA0JSwgNDUlKWA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJzogYWNjZW50SG92ZXIsXG4gICAgICAnLS10ZXh0LWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeSc6IGJnUHJpbWFyeSxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JzogYmdTZWNvbmRhcnksXG4gICAgICAnLS10ZXh0LW5vcm1hbCc6IHRleHROb3JtYWwsXG4gICAgICAnLS10ZXh0LW11dGVkJzogdGV4dE11dGVkLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU4QzAzXHU4MjcyXHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKiA1MG1zIGRlYm91bmNlXHVGRjBDXHU5NjMyXHU2QjYyXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1NkVEMVx1NTc1N1x1NUZFQlx1OTAxRlx1NjJENlx1NjJGRFx1NEVBN1x1NzUxRlx1OUFEOFx1OTg5MSBET00gXHU1MTk5XHU1MTY1XG4gICAqL1xuICBhcHBseVBhbGV0dGUoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcikgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9wYWxldHRlU3luY1RpbWVyKTtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IGZhbHNlOyAvLyBcdTY1QjBcdThDMDNcdTgyNzJcdThCRjdcdTZDNDJcdTUyMzBcdTY3NjUgXHUyMTkyIFx1ODlFM1x1OTY2NFx1NjI5MVx1NTIzNlxuICAgIHRoaXMuX3BhbGV0dGVTeW5jVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQpIHJldHVybjsgLy8gcmVzdG9yZURlZmF1bHRzIFx1NTcyOFx1OTYzMlx1NjI5Nlx1N0E5N1x1NTNFM1x1NTE4NVx1ODhBQlx1OEMwM1x1NzUyOFxuICAgICAgY29uc3QgdmFycyA9IFRoZW1lQnJpZGdlLmNvbXB1dGVPYnNpZGlhblZhcnMoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2YXJzKSkge1xuICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0sIDUwKTtcbiAgfVxuXG4gIC8qKiBcdTZFMDVcdTk2NjRcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1RkYwQ1x1NjA2Mlx1NTkwRCBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTlFRDhcdThCQTRcdTUwM0MgKi9cbiAgc3RhdGljIHJlc3RvcmVEZWZhdWx0cygpOiB2b2lkIHtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgVGhlbWVCcmlkZ2UuSU5KRUNURURfVkFSUykge1xuICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi9TdG9yYWdlQnJpZGdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9UaGVtZUJyaWRnZSc7XG5pbXBvcnQgdHlwZSB7IEFueUJyaWRnZU1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcy9tZXNzYWdlcyc7XG5pbXBvcnQgeyBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqIFx1NjI2Qlx1NjNDRlx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjVGNlx1OUVEOFx1OEJBNFx1OERGM1x1OEZDN1x1NzY4NFx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOGNvbmZpZ0RpciBcdTUzRUZcdTkwMUFcdThGQzcgc2V0Q29uZmlnRGlyIFx1ODFFQVx1NUI5QVx1NEU0OVx1RkYwOSAqL1xuY29uc3QgREVGQVVMVF9TS0lQX0RJUlMgPSBbJy50cmFzaCcsICcuZ2l0JywgJ25vZGVfbW9kdWxlcyddO1xuXG4vKipcbiAqIEJyaWRnZVNlcnZpY2UgLSBwb3N0TWVzc2FnZSBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTRFMkRcdTVGQzNcbiAqXG4gKiBcdTc2RDFcdTU0MkMgaWZyYW1lIFx1NTNEMVx1Njc2NVx1NzY4NCBwb3N0TWVzc2FnZVx1RkYwQ1x1NTIwNlx1NTNEMVx1NTIzMFx1NUJGOVx1NUU5NFx1NTkwNFx1NzQwNlx1NkEyMVx1NTc1N1x1RkYwQ1xuICogXHU3MTM2XHU1NDBFXHU1QzA2XHU3RUQzXHU2NzlDXHU1NkRFXHU0RjIwXHU3RUQ5IGlmcmFtZVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQnJpZGdlU2VydmljZSB7XG4gICAgcHJpdmF0ZSBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlO1xuICAgIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICAgIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgoKSA9PiBQcm9taXNlPHZvaWQ+KSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGN1c3RvbVRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICAgIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgY29uZmlnRGlyOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIGV4cGVjdGVkT3JpZ2luID0gJyc7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc3RvcmFnZUJyaWRnZTogU3RvcmFnZUJyaWRnZSxcbiAgICAgICAgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlLFxuICAgICAgICBzZXR0aW5ncz86IEJhbWJvb1Jldmlld1NldHRpbmdzLFxuICAgICAgICBzYXZlU2V0dGluZ3M/OiAoKSA9PiBQcm9taXNlPHZvaWQ+XG4gICAgKSB7XG4gICAgICAgIHRoaXMuc3RvcmFnZUJyaWRnZSA9IHN0b3JhZ2VCcmlkZ2U7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UgPSB0aGVtZUJyaWRnZTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzIHx8IG51bGw7XG4gICAgICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzIHx8IG51bGw7XG4gICAgfVxuXG4gIC8qKiBcdTdFRDFcdTVCOUEgaWZyYW1lIFx1NUU3Nlx1NUYwMFx1NTlDQlx1NzZEMVx1NTQyQ1x1NkQ4OFx1NjA2RiAqL1xuICBhdHRhY2goaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIC8vIFx1OTYzMlx1NkI2Mlx1OTFDRFx1NTkwRFx1N0VEMVx1NUI5QVxuICAgIHRoaXMuZGV0YWNoKCk7XG5cbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZShpZnJhbWUpO1xuXG4gICAgLy8gXHU4QkIwXHU1RjU1IGV4cGVjdGVkIG9yaWdpblx1RkYwQ1x1NzUyOFx1NEU4RVx1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1NjgyMVx1OUE4Q1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICB2b2lkIHRoaXMub25NZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4XHVGRjA4XHU0RjlCXHU2M0QyXHU0RUY2XHU3QUVGXHU2MjZCXHU2M0NGXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0ICovXG4gIHNldE5vaXNlUGF0aChub2lzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubm9pc2VQYXRoID0gbm9pc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RSBPYnNpZGlhbiBcdTkxNERcdTdGNkVcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhcdTlFRDhcdThCQTQgLm9ic2lkaWFuXHVGRjBDXHU3NTI4XHU2MjM3XHU1M0VGXHU4MUVBXHU1QjlBXHU0RTQ5XHVGRjA5ICovXG4gIHNldENvbmZpZ0RpcihkaXI6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnRGlyID0gZGlyO1xuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1NjIxNlx1NTE2OFx1NUU5M1x1NjI2Qlx1NjNDRlx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIF9zY2FuVmF1bHRBdWRpb0ZpbGVzKG1heERlcHRoID0gNSk6IFByb21pc2U8QXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhbGxvd2VkRXh0cyA9IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUztcbiAgICBjb25zdCBiYXNlUGF0aCA9IHRoaXMudmF1bHRCYXNlUGF0aDtcbiAgICBpZiAoIWJhc2VQYXRoKSByZXR1cm4gcmVzdWx0cztcblxuICAgIC8vIFx1NjhDMFx1NjdFNSBiYXNlUGF0aCBcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdUZGMDhcdTVGMDJcdTZCNjVcdUZGMDlcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChiYXNlUGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTYzMDdcdTVCOUFcdTRFODZcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUzRUFcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRFMERcdTkwMTJcdTVGNTJcdUZGMDlcbiAgICBpZiAodGhpcy5ub2lzZVBhdGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldERpciA9IHBhdGguam9pbihiYXNlUGF0aCwgdGhpcy5ub2lzZVBhdGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllczogZnMuRGlyZW50W10gPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKHRhcmdldERpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICBpZiAoZW50cnkubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICAgIGlmICghZW50cnkuaXNGaWxlKCkpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0OiBmcy5TdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQocGF0aC5qb2luKHRhcmdldERpciwgZW50cnkubmFtZSkpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcGF0aC5qb2luKHRoaXMubm9pc2VQYXRoLCBlbnRyeS5uYW1lKSwgbmFtZTogZW50cnkubmFtZSwgc2l6ZTogc3RhdC5zaXplLCBleHQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gXHU2NzJBXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1MTY4XHU1RTkzXHU5MDEyXHU1RjUyXHU2MjZCXHU2M0NGXHVGRjA4XHU1RjAyXHU2QjY1ICsgXHU2REYxXHU1RUE2XHU5NjUwXHU1MjM2XHVGRjA5XG4gICAgY29uc3Qgc2NhbkRpciA9IGFzeW5jIChkaXJQYXRoOiBzdHJpbmcsIHJlbGF0aXZlUHJlZml4OiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICBsZXQgZW50cmllczogZnMuRGlyZW50W107XG4gICAgICB0cnkge1xuICAgICAgICBlbnRyaWVzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXJQYXRoLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICB9IGNhdGNoIHsgcmV0dXJuOyAvKiBza2lwIHVucmVhZGFibGUgZGlycyAqLyB9XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBpZiAoZW50cnkubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBlbnRyeS5uYW1lKTtcbiAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmVQcmVmaXggPyBwYXRoLmpvaW4ocmVsYXRpdmVQcmVmaXgsIGVudHJ5Lm5hbWUpIDogZW50cnkubmFtZTtcblxuICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIGNvbnN0IHNraXBEaXJzID0gbmV3IFNldChbLi4uREVGQVVMVF9TS0lQX0RJUlMsIC4uLih0aGlzLmNvbmZpZ0RpciA/IFt0aGlzLmNvbmZpZ0Rpcl0gOiBbXSldKTtcbiAgICAgICAgICBpZiAoc2tpcERpcnMuaGFzKGVudHJ5Lm5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICBhd2FpdCBzY2FuRGlyKGZ1bGxQYXRoLCByZWxhdGl2ZVBhdGgsIGRlcHRoICsgMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNGaWxlKCkpIHtcbiAgICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdDogZnMuU3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcmVsYXRpdmVQYXRoLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgc2NhbkRpcihiYXNlUGF0aCwgJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxIGlmcmFtZVx1RkYwQ1x1NTA1Q1x1NkI2Mlx1NzZEMVx1NTQyQyAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVzc2FnZUhhbmRsZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gICAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aGVtZUJyaWRnZS5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtc2cgPSBldmVudC5kYXRhIGFzIEFueUJyaWRnZU1lc3NhZ2U7XG4gICAgaWYgKCFtc2cgfHwgIW1zZy50eXBlIHx8ICFtc2cuaWQpIHJldHVybjtcblxuICAgIC8vIFx1NjgyMVx1OUE4Q1x1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1RkYxQXNvdXJjZSArIG9yaWdpbiBcdTUzQ0NcdTkxQ0RcdTlBOENcdThCQzFcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgZXZlbnQuc291cmNlICE9PSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmV4cGVjdGVkT3JpZ2luICYmIGV2ZW50Lm9yaWdpbiAhPT0gdGhpcy5leHBlY3RlZE9yaWdpbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQnJpZGdlU2VydmljZV0gSWdub3JlZCBtZXNzYWdlIGZyb20gdW5rbm93biBvcmlnaW46JywgZXZlbnQub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTUyNERcdTdGMDBcbiAgICBpZiAoIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3N0b3JhZ2U6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2FwcDonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnZmlsZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgndGhlbWU6JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcdTZEODhcdTYwNkZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgLy8gXHU2MjhBXHU2MzAxXHU0RTQ1XHU1MzE2XHU3Njg0IHNlY3Rpb25Db25maWdcdTMwMDFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTU0OENcdTgxRUFcdTVCOUFcdTRFNDlcdTk3RjNcdTZFOTBcdTk2OEYgcmVhZHkgXHU1NENEXHU1RTk0XHU1M0QxXHU3RUQ5IHdlYmFwcFxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncz8uc2VjdGlvbkNvbmZpZyB8fCBudWxsLFxuICAgICAgICBjdXN0b21UaGVtZXM6IHRoaXMuY3VzdG9tVGhlbWVzLFxuICAgICAgICBjdXN0b21Ob2lzZXM6IHRoaXMuc2V0dGluZ3M/Lm5vaXNlSXRlbXMgfHwgW10sXG4gICAgICAgIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogdGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmNsb3NlJykge1xuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkVcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZVNlY3Rpb25Db25maWcnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnNlY3Rpb25Db25maWcgPSBtc2cucGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVDdXN0b21Ob2lzZXMnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLm5vaXNlSXRlbXMgPSBtc2cucGF5bG9hZCBhcyB1bmtub3duW10gfHwgW107XG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5ncykgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU0RTNCXHU5ODk4XHU1MjA3XHU2MzYyXHU4QkY3XHU2QzQyXHVGRjA4aWZyYW1lIFx1MjE5MiBPYnNpZGlhblx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDp0b2dnbGVUaGVtZScpIHtcbiAgICAgIGNvbnN0IHRhcmdldElzRGFyayA9IG1zZy5wYXlsb2FkLmlzRGFyayA9PT0gdHJ1ZTsgICAgICBjb25zdCBjdXJyZW50SXNEYXJrID0gYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgICAgIGlmICh0YXJnZXRJc0RhcmsgIT09IGN1cnJlbnRJc0RhcmspIHtcbiAgICAgICAgaWYgKHRhcmdldElzRGFyaykge1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWRhcmsnKTtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RoZW1lLWxpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU5MDFBXHU3N0U1IGlmcmFtZSBcdTRFM0JcdTk4OThcdTVERjJcdTUyMDdcdTYzNjJcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUsIGlzRGFyazogdGFyZ2V0SXNEYXJrIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1OEJGN1x1NkM0Mlx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAndGhlbWU6c3luY1BhbGV0dGUnKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncz8uc3luY1BhbGV0dGVUb09ic2lkaWFuKSB7XG4gICAgICAgIGNvbnN0IHsgaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayB9ID0gbXNnLnBheWxvYWQ7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UuYXBwbHlQYWxldHRlKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdUZGMUFcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjYgPT09PT1cblxuICAgIC8vIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1NjI0MFx1NjcwOVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NEY5QiB3ZWJhcHAgXHU2NTg3XHU0RUY2XHU5MDA5XHU2MkU5XHU1NjY4XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjBDXHU4QkY3XHU1QzFEXHU4QkQ1XHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU5NzYyXHU2NzdGJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKSBcdTUxODVcdTkwRThcdTVERjJcdTVGMDJcdTZCNjVcdTY4QzBcdTY3RTVcdThERUZcdTVGODRcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLl9zY2FuVmF1bHRBdWRpb0ZpbGVzKCk7XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29dIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3XHU1RTkzXHU1MTg1XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUyMDE0IFx1OEZENFx1NTZERVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTI0RFx1N0FFRlx1NzZGNFx1NjNBNSBmZXRjaCBmaWxlOi8vXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NCcpO1xuICAgICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdThERUZcdTVGODRcdTY3MkFcdTkwMDNcdTkwMzhcdTUxRkEgdmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh2YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyXHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoOiBmdWxsUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShyZWxhdGl2ZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU2NzJDXHU1NzMwXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU1NkRFXHU0RjIwXHU4REVGXHU1Rjg0XHU3NTMxXHU1MjREXHU3QUVGXHU3NTI4IGZpbGU6Ly8gXHU1MkEwXHU4RjdEXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIWZpbGVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuICAgICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTYyRDJcdTdFRERcdTUzMDVcdTU0MkJcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTVCNTdcdTdCMjZcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoLCBleHQpIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yLm1lc3NhZ2UgfHwgJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2RlxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2VCcmlkZ2UuaGFuZGxlKG1zZyk7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBwYXlsb2FkIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kRXJyb3IoaWQ6IHN0cmluZywgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgaWQsIGVycm9yIH0sICcqJyk7XG4gIH1cbn1cbiIsICIvKiogXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA4XHU1QjhDXHU2NTc0XHU1MjE3XHU4ODY4XHVGRjA5ICovXG5leHBvcnQgY29uc3QgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TID0gW1xuICAnLm1wMycsICcud2F2JywgJy5vZ2cnLCAnLmZsYWMnLCAnLmFhYycsICcubTRhJywgJy53bWEnLCAnLndlYm0nLCAnLm9wdXMnLFxuXTtcblxuLyoqIFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRCBcdTIxOTIgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbmNvbnN0IEFVRElPX01JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcubXAzJzogICdhdWRpby9tcGVnJyxcbiAgJy53YXYnOiAgJ2F1ZGlvL3dhdicsXG4gICcub2dnJzogICdhdWRpby9vZ2cnLFxuICAnLmZsYWMnOiAnYXVkaW8vZmxhYycsXG4gICcuYWFjJzogICdhdWRpby9hYWMnLFxuICAnLm00YSc6ICAnYXVkaW8vbXA0JyxcbiAgJy53bWEnOiAgJ2F1ZGlvL3gtbXMtd21hJyxcbiAgJy53ZWJtJzogJ2F1ZGlvL3dlYm0nLFxuICAnLm9wdXMnOiAnYXVkaW8vb3B1cycsXG59O1xuXG4vKiogXHU1QjhDXHU2NTc0IE1JTUUgXHU3QzdCXHU1NzhCXHU2NjIwXHU1QzA0XHVGRjA4XHU1NDJCIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBNSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLmh0bWwnOiAndGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5jc3MnOiAgJ3RleHQvY3NzOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qcyc6ICAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLm1qcyc6ICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcuanNvbic6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5wbmcnOiAgJ2ltYWdlL3BuZycsXG4gICcuanBnJzogICdpbWFnZS9qcGVnJyxcbiAgJy5qcGVnJzogJ2ltYWdlL2pwZWcnLFxuICAnLmdpZic6ICAnaW1hZ2UvZ2lmJyxcbiAgJy5zdmcnOiAgJ2ltYWdlL3N2Zyt4bWwnLFxuICAnLmljbyc6ICAnaW1hZ2UveC1pY29uJyxcbiAgJy53b2ZmJzogJ2ZvbnQvd29mZicsXG4gICcud29mZjInOidmb250L3dvZmYyJyxcbiAgJy50dGYnOiAgJ2ZvbnQvdHRmJyxcbiAgLi4uQVVESU9fTUlNRV9UWVBFUyxcbn07XG4iLCAiaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCAqIGFzIGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBuZXQgZnJvbSAnbmV0JztcbmltcG9ydCB7IE1JTUVfVFlQRVMsIEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5cbi8qKlxuICogTG9jYWxTZXJ2ZXIgLSBcdTY3MkNcdTU3MzAgSFRUUCBcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcdTY3MERcdTUyQTFcdTU2NjhcbiAqXG4gKiBcdTU3MjggT2JzaWRpYW4gKEVsZWN0cm9uKSBcdTczQUZcdTU4ODNcdTRFMkRcdTU0MkZcdTUyQThcdTRFMDBcdTRFMkFcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcdUZGMENcbiAqIFx1NEUzQSBpZnJhbWUgXHU2M0QwXHU0RjlCIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdTY3MERcdTUyQTFcdUZGMENcdTdFRDVcdThGQzcgYXBwOi8vIFx1NTM0Rlx1OEJBRVx1NzY4NFx1OTY1MFx1NTIzNlx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgTG9jYWxTZXJ2ZXIge1xuICBwcml2YXRlIHNlcnZlcjogaHR0cC5TZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBwb3J0ID0gMDtcbiAgcHJpdmF0ZSB3ZWJhcHBEaXI6IHN0cmluZztcbiAgcHJpdmF0ZSB2YXVsdEJhc2VQYXRoOiBzdHJpbmcgPSAnJztcblxuICBjb25zdHJ1Y3Rvcih3ZWJhcHBEaXI6IHN0cmluZykge1xuICAgIHRoaXMud2ViYXBwRGlyID0gd2ViYXBwRGlyO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NEY5QiAvYmFtYm9vLWF1ZGlvIFx1OTdGM1x1OTg5MVx1NEVFM1x1NzQwNlx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBzZXRWYXVsdEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnZhdWx0QmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIC8qKiBcdTU0MkZcdTUyQThcdTY3MERcdTUyQTFcdTU2NjhcdUZGMENcdThGRDRcdTU2REVcdTc2RDFcdTU0MkNcdTdBRUZcdTUzRTMgKi9cbiAgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIpIHJldHVybiB0aGlzLnBvcnQ7XG5cbiAgICB0aGlzLnBvcnQgPSBhd2FpdCB0aGlzLmZpbmRGcmVlUG9ydCgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZGxlUmVxdWVzdChyZXEsIHJlcyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJ2ZXIub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gU2VydmVyIGVycm9yOicsIGVycik7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFNlcnZlciBlcnJvcjogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHRoaXMucG9ydCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtCYW1ib29SZXZpZXddIExvY2FsIHNlcnZlciBzdGFydGVkIG9uIHBvcnQgJHt0aGlzLnBvcnR9YCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5wb3J0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1NTA1Q1x1NkI2Mlx1NjcwRFx1NTJBMVx1NTY2OCAqL1xuICBhc3luYyBzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW0JhbWJvb1Jldmlld10gTG9jYWwgc2VydmVyIHN0b3BwZWQnKTtcbiAgICAgICAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5wb3J0ID0gMDtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjcwRFx1NTJBMVx1NTY2OCBVUkwgKi9cbiAgZ2V0VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5wb3J0fWA7XG4gIH1cblxuICAvKiogXHU1OTA0XHU3NDA2IEhUVFAgXHU4QkY3XHU2QzQyICovXG4gIHByaXZhdGUgaGFuZGxlUmVxdWVzdChyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICAvLyAvYmFtYm9vLWF1ZGlvP3BhdGg9eHh4IFx1MjAxNCBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTRFRTNcdTc0MDZcdUZGMENcdTdFRDVcdThGQzcgcG9zdE1lc3NhZ2UgXHU1OTI3IHBheWxvYWQgXHU5NjUwXHU1MjM2XG4gICAgY29uc3QgdXJsID0gcmVxLnVybCB8fCAnLyc7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvYmFtYm9vLWF1ZGlvLXByb3h5JykpIHtcbiAgICAgIHRoaXMuaGFuZGxlQXVkaW9VcmxQcm94eShyZXEsIHJlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnL2JhbWJvby1hdWRpbycpKSB7XG4gICAgICB0aGlzLmhhbmRsZUF1ZGlvUHJveHkocmVxLCByZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1ODlFM1x1Njc5MCBVUkxcdUZGMENcdTUzQkJcdTk2NjRcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICBsZXQgdXJsUGF0aCA9IHVybC5zcGxpdCgnPycpWzBdO1xuICAgIC8vIFx1NzZFRVx1NUY1NVx1OUVEOFx1OEJBNFx1NjU4N1x1NEVGNlxuICAgIGlmICh1cmxQYXRoLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHVybFBhdGggKz0gJ2luZGV4Lmh0bWwnO1xuICAgIH1cbiAgICBjb25zdCBzYWZlUGF0aCA9IHBhdGgubm9ybWFsaXplKHVybFBhdGgpLnJlcGxhY2UoL14oXFwuXFwuWy9cXFxcXSkrLywgJycpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMud2ViYXBwRGlyLCBzYWZlUGF0aCk7XG5cbiAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTU3Mjggd2ViYXBwRGlyIFx1NTE4NVxuICAgIGlmICghZmlsZVBhdGguc3RhcnRzV2l0aCh0aGlzLndlYmFwcERpcikpIHtcbiAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTtcbiAgICAgIHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGZzLnN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICBpZiAoZXJyIHx8ICFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XG4gICAgICAgIHJlcy5lbmQoYDwhRE9DVFlQRSBodG1sPlxuPGh0bWw+PGhlYWQ+PG1ldGEgY2hhcnNldD1cInV0Zi04XCI+PHN0eWxlPlxuICBib2R5IHsgZGlzcGxheTpmbGV4OyBhbGlnbi1pdGVtczpjZW50ZXI7IGp1c3RpZnktY29udGVudDpjZW50ZXI7IGhlaWdodDoxMDB2aDsgbWFyZ2luOjA7XG4gICAgICAgICBmb250LWZhbWlseTogc3lzdGVtLXVpLCBzYW5zLXNlcmlmOyBiYWNrZ3JvdW5kOiMwYTBhMGE7IGNvbG9yOiM4ODg7IH1cbiAgLmJveCB7IHRleHQtYWxpZ246Y2VudGVyOyB9XG4gIGgyIHsgY29sb3I6I2NjYzsgZm9udC13ZWlnaHQ6NDAwOyB9XG4gIHAgeyBmb250LXNpemU6MTRweDsgfVxuICBidXR0b24geyBtYXJnaW4tdG9wOjE2cHg7IHBhZGRpbmc6OHB4IDI0cHg7IGJvcmRlcjoxcHggc29saWQgIzQ0NDsgYm9yZGVyLXJhZGl1czo2cHg7XG4gICAgICAgICAgIGJhY2tncm91bmQ6IzFhMWExYTsgY29sb3I6I2FhYTsgY3Vyc29yOnBvaW50ZXI7IGZvbnQtc2l6ZToxNHB4OyB9XG4gIGJ1dHRvbjpob3ZlciB7IGJhY2tncm91bmQ6IzJhMmEyYTsgY29sb3I6I2ZmZjsgfVxuPC9zdHlsZT48L2hlYWQ+PGJvZHk+XG48ZGl2IGNsYXNzPVwiYm94XCI+XG4gIDxoMj5cdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTZCNjNcdTU3MjhcdTUyMURcdTU5Q0JcdTUzMTZcdTIwMjZcdTIwMjY8L2gyPlxuICA8cD5cdTk5OTZcdTZCMjFcdTU0MkZcdTUyQThcdTk3MDBcdTg5ODFcdTRFMEJcdThGN0RcdThENDRcdTZFOTBcdTUzMDVcdUZGMENcdThCRjdcdTdBMERcdTUwMTk8L3A+XG4gIDxidXR0b24gb25jbGljaz1cImxvY2F0aW9uLnJlbG9hZCgpXCI+XHU2MjRCXHU1MkE4XHU1MjM3XHU2NUIwPC9idXR0b24+XG4gIDxzY3JpcHQ+XG4gICAgdmFyIHJldHJpZXMgPSAwO1xuICAgIGZ1bmN0aW9uIGNoZWNrKCkge1xuICAgICAgZmV0Y2god2luZG93LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiAnSEVBRCcgfSkudGhlbihmdW5jdGlvbihyKSB7XG4gICAgICAgIGlmIChyLnN0YXR1cyA9PT0gMjAwKSBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgZWxzZSBpZiAoKytyZXRyaWVzIDwgMzApIHNldFRpbWVvdXQoY2hlY2ssIDIwMDApO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7IGlmICgrK3JldHJpZXMgPCAzMCkgc2V0VGltZW91dChjaGVjaywgMjAwMCk7IH0pO1xuICAgIH1cbiAgICBzZXRUaW1lb3V0KGNoZWNrLCAzMDAwKTtcbiAgPC9zY3JpcHQ+XG48L2Rpdj48L2JvZHk+PC9odG1sPmApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RSBNSU1FIFx1N0M3Qlx1NTc4QlxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgY29udGVudFR5cGUgPSBNSU1FX1RZUEVTW2V4dF0gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG5cbiAgICAgIC8vIFx1NURFRVx1NUYwMlx1NTMxNlx1N0YxM1x1NUI1OFx1N0I1Nlx1NzU2NVx1RkYxQVx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NUUyNiBfX0JVSUxEX18gXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjBDXHU1M0VGXHU5NTdGXHU2NzFGXHU3RjEzXHU1QjU4XG4gICAgICBjb25zdCBpc0hUTUwgPSBleHQgPT09ICcuaHRtbCc7XG4gICAgICBjb25zdCBpc1N0YXRpYyA9IFsnLmNzcycsICcuanMnLCAnLndvZmYnLCAnLndvZmYyJywgJy50dGYnLCAnLnN2ZycsICcucG5nJywgJy5pY28nLCAnLmpzb24nXS5pbmNsdWRlcyhleHQpO1xuICAgICAgY29uc3QgY2FjaGVDb250cm9sID0gaXNIVE1MXG4gICAgICAgID8gJ25vLWNhY2hlJ1xuICAgICAgICA6IGlzU3RhdGljXG4gICAgICAgICAgPyAncHVibGljLCBtYXgtYWdlPTg2NDAwJ1xuICAgICAgICAgIDogJ3B1YmxpYywgbWF4LWFnZT0zNjAwJztcblxuICAgICAgLy8gXHU4QkJFXHU3RjZFXHU1NENEXHU1RTk0XHU1OTM0XHVGRjA4XHU0RTBEXHU5NzAwXHU4OTgxIENPUlNcdUZGMENpZnJhbWUgXHU0RTBFXHU2NzBEXHU1MkExXHU1NjY4XHU1NDBDXHU2RTkwXHVGRjA5XG4gICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogY29udGVudFR5cGUsXG4gICAgICAgICdDYWNoZS1Db250cm9sJzogY2FjaGVDb250cm9sLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NkQ0MVx1NUYwRlx1NEYyMFx1OEY5M1x1NjU4N1x1NEVGNlxuICAgICAgY29uc3Qgc3RyZWFtOiBmcy5SZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCk7XG4gICAgICBzdHJlYW0ucGlwZShyZXMpO1xuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIC9iYW1ib28tYXVkaW8tcHJveHk/dXJsPXh4eCBcdTIwMTQgXHU0RUUzXHU3NDA2XHU1OTE2XHU5MEU4XHU5N0YzXHU2RTkwIFVSTFx1RkYwQ1x1N0VENVx1OEZDN1x1NkQ0Rlx1ODlDOFx1NTY2OCBDT1JTIFx1OTY1MFx1NTIzNiAqL1xuICBwcml2YXRlIGhhbmRsZUF1ZGlvVXJsUHJveHkocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJhd1VybCA9IHJlcS51cmwgfHwgJyc7XG4gICAgICBjb25zdCBxdWVyeUluZGV4ID0gcmF3VXJsLmluZGV4T2YoJz8nKTtcbiAgICAgIGlmIChxdWVyeUluZGV4ID09PSAtMSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgdXJsIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5U3RyKTtcbiAgICAgIGNvbnN0IHRhcmdldFVybCA9IHBhcmFtcy5nZXQoJ3VybCcpO1xuICAgICAgaWYgKCF0YXJnZXRVcmwpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHVybCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTRFQzVcdTUxNDFcdThCQjggaHR0cC9odHRwc1xuICAgICAgbGV0IHBhcnNlZDogVVJMO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGFyc2VkID0gbmV3IFVSTCh0YXJnZXRVcmwpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnSW52YWxpZCBVUkwnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHBhcnNlZC5wcm90b2NvbCAhPT0gJ2h0dHA6JyAmJiBwYXJzZWQucHJvdG9jb2wgIT09ICdodHRwczonKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuOiBvbmx5IGh0dHAvaHR0cHMgVVJMcyBhbGxvd2VkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU3OTgxXHU2QjYyXHU4QkJGXHU5NUVFXHU2NzJDXHU1NzMwXHU1NzMwXHU1NzQwXG4gICAgICBjb25zdCBob3N0bmFtZSA9IHBhcnNlZC5ob3N0bmFtZTtcbiAgICAgIGlmIChob3N0bmFtZSA9PT0gJ2xvY2FsaG9zdCcgfHwgaG9zdG5hbWUgPT09ICcxMjcuMC4wLjEnIHx8IGhvc3RuYW1lID09PSAnMC4wLjAuMCdcbiAgICAgICAgfHwgaG9zdG5hbWUgPT09ICdbOjoxXScgfHwgaG9zdG5hbWUuc3RhcnRzV2l0aCgnMTkyLjE2OC4nKSB8fCBob3N0bmFtZS5zdGFydHNXaXRoKCcxMC4nKVxuICAgICAgICB8fCBob3N0bmFtZS5zdGFydHNXaXRoKCcxNzIuJykpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IGxvY2FsL3ByaXZhdGUgbmV0d29yayBVUkxzIG5vdCBhbGxvd2VkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA4XHU3NjdEXHU1NDBEXHU1MzU1XHVGRjA5XG4gICAgICBjb25zdCBwYXRobmFtZSA9IHBhcnNlZC5wYXRobmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuc29tZShleHQgPT4gcGF0aG5hbWUuZW5kc1dpdGgoZXh0KSkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IHVuc3VwcG9ydGVkIGF1ZGlvIGZvcm1hdCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRyYW5zcG9ydCA9IHBhcnNlZC5wcm90b2NvbCA9PT0gJ2h0dHBzOicgPyBodHRwcyA6IGh0dHA7XG4gICAgICBjb25zdCBwcm94eVJlcSA9IHRyYW5zcG9ydC5nZXQodGFyZ2V0VXJsLCB7IHRpbWVvdXQ6IDMwMDAwIH0sIChwcm94eVJlcykgPT4ge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBwcm94eVJlcy5zdGF0dXNDb2RlIHx8IDUwMDtcbiAgICAgICAgY29uc3QgY3QgPSBwcm94eVJlcy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcblxuICAgICAgICAvLyBcdTk2NTBcdTUyMzZcdTU0Q0RcdTVFOTRcdTU5MjdcdTVDMEZcdUZGMDhcdTY3MDBcdTU5MjcgNTBNQlx1RkYwOVxuICAgICAgICBjb25zdCBtYXhTaXplID0gNTAgKiAxMDI0ICogMTAyNDtcbiAgICAgICAgbGV0IHRvdGFsU2l6ZSA9IDA7XG4gICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcblxuICAgICAgICBwcm94eVJlcy5vbignZGF0YScsIChjaHVuazogQnVmZmVyKSA9PiB7XG4gICAgICAgICAgdG90YWxTaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgICBpZiAodG90YWxTaXplID4gbWF4U2l6ZSkge1xuICAgICAgICAgICAgcHJveHlSZXEuZGVzdHJveSgpO1xuICAgICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MTMpOyByZXMuZW5kKCdBdWRpbyBmaWxlIHRvbyBsYXJnZSAobWF4IDUwTUIpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJveHlSZXMub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICBpZiAocmVzLmhlYWRlcnNTZW50KSByZXR1cm47XG4gICAgICAgICAgcmVzLndyaXRlSGVhZChzdGF0dXMsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjdCxcbiAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IHRvdGFsU2l6ZSxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICdwdWJsaWMsIG1heC1hZ2U9MzYwMCcsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgYm9keSA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKTtcbiAgICAgICAgICByZXMuZW5kKGJvZHkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm94eVJlcy5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIFVSTCBwcm94eSB1cHN0cmVhbSBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMik7IHJlcy5lbmQoJ1Vwc3RyZWFtIGVycm9yJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm94eVJlcS5vbigndGltZW91dCcsICgpID0+IHtcbiAgICAgICAgcHJveHlSZXEuZGVzdHJveSgpO1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTA0KTsgcmVzLmVuZCgnVXBzdHJlYW0gdGltZW91dCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcHJveHlSZXEub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBBdWRpbyBVUkwgcHJveHkgZXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAyKTsgcmVzLmVuZCgnVXBzdHJlYW0gY29ubmVjdGlvbiBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBBdWRpbyBVUkwgcHJveHkgZXJyb3I6JywgZSk7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIC9iYW1ib28tYXVkaW8/cGF0aD14eHggXHUyMDE0IFx1NkQ0MVx1NUYwRlx1NEVFM1x1NzQwNlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiAqL1xuICBwcml2YXRlIGhhbmRsZUF1ZGlvUHJveHkocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJhd1VybCA9IHJlcS51cmwgfHwgJyc7XG4gICAgICBjb25zdCBxdWVyeUluZGV4ID0gcmF3VXJsLmluZGV4T2YoJz8nKTtcbiAgICAgIGlmIChxdWVyeUluZGV4ID09PSAtMSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgcGF0aCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcXVlcnlTdHIgPSByYXdVcmwuc2xpY2UocXVlcnlJbmRleCArIDEpO1xuICAgICAgY29uc3QgcGFyYW1zOiBVUkxTZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5U3RyKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhcmFtcy5nZXQoJ3BhdGgnKTtcbiAgICAgIGlmICghcmVsYXRpdmVQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NTNFQVx1NTE0MVx1OEJCOFx1NjMwN1x1NUI5QVx1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IHVuc3VwcG9ydGVkIGF1ZGlvIGZvcm1hdCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc5ODFcdTZCNjJcdThERUZcdTVGODRcdTdBN0ZcdThEOEFcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBwYXRoLm5vcm1hbGl6ZShyZWxhdGl2ZVBhdGgpLnJlcGxhY2UoL14oXFwuXFwuWy9cXFxcXSkrLywgJycpO1xuICAgICAgaWYgKCFub3JtYWxpemVkIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLi4nKSB8fCBub3JtYWxpemVkLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7IHJlcy5lbmQoJ1ZhdWx0IGJhc2UgcGF0aCBub3QgY29uZmlndXJlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHRoaXMudmF1bHRCYXNlUGF0aCwgbm9ybWFsaXplZCk7XG4gICAgICBpZiAoIWZ1bGxQYXRoLnN0YXJ0c1dpdGgodGhpcy52YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZzLnN0YXQoZnVsbFBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICAgIGlmIChlcnIgfHwgIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpOyByZXMuZW5kKCdGaWxlIG5vdCBmb3VuZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZW50VHlwZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogY29udGVudFR5cGUsXG4gICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogc3RhdHMuc2l6ZSxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT0zNjAwJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHN0cmVhbTogZnMuUmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZnVsbFBhdGgpO1xuICAgICAgICBzdHJlYW0ucGlwZShyZXMpO1xuICAgICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgICByZXMuZW5kKCdTdHJlYW0gZXJyb3InKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIHByb3h5IGVycm9yOicsIGUpO1xuICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogXHU2N0U1XHU2MjdFXHU1M0VGXHU3NTI4XHU3QUVGXHU1M0UzICovXG4gIHByaXZhdGUgZmluZEZyZWVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgIHNlcnZlci5saXN0ZW4oMCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9ydCA9IChzZXJ2ZXIuYWRkcmVzcygpIGFzIG5ldC5BZGRyZXNzSW5mbykucG9ydDtcbiAgICAgICAgc2VydmVyLmNsb3NlKCgpID0+IHJlc29sdmUocG9ydCkpO1xuICAgICAgfSk7XG4gICAgICBzZXJ2ZXIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufSIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuXG4vKiogXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhbWJvb1Jldmlld1NldHRpbmdzIHtcbiAgLyoqIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1NjgzOVx1OERFRlx1NUY4NCAqL1xuICBkYXRhUGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAqL1xuICBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG4gIC8qKiBcdTY3N0ZcdTU3NTdcdTdCQTFcdTc0MDZcdTkxNERcdTdGNkVcdUZGMDhcdTUzRUZcdTg5QzFcdTYwMjcgKyBcdTYzOTJcdTVFOEZcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEUgd2ViYXBwIGlmcmFtZSBsb2NhbFN0b3JhZ2UgXHU0RTBEXHU1M0VGXHU5NzYwXHU2NUY2XHU2MzAxXHU0RTQ1XHU1MzE2ICovXG4gIHNlY3Rpb25Db25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOSAqL1xuICB0aGVtZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5M1x1RkYwOSAqL1xuICBub2lzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NTIxN1x1ODg2OFx1RkYwOFx1OTAxQVx1OEZDN1x1Njg2NVx1NjNBNVx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwQ1x1NTE0Qlx1NjcwRCBsb2NhbFN0b3JhZ2UgcG9ydC1zY29wZWQgXHU5NUVFXHU5ODk4XHVGRjA5ICovXG4gIG5vaXNlSXRlbXM6IHVua25vd25bXTtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NUMwNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MiAqL1xuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IHtcbiAgZGF0YVBhdGg6ICdiYW1ib28tcmV2aWV3JyxcbiAgZW5hYmxlTWFya2Rvd25TeW5jOiB0cnVlLFxuICBzZWN0aW9uQ29uZmlnOiBudWxsLFxuICB0aGVtZVBhdGg6ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnLFxuICBub2lzZVBhdGg6ICcnLFxuICBub2lzZUl0ZW1zOiBbXSxcbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBmYWxzZSxcbn07XG5cbi8qKlxuICogUGx1Z2luU2V0dGluZ3MgLSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqL1xuZXhwb3J0IGNsYXNzIFBsdWdpblNldHRpbmdzIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgfVxuXG4gIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuICAgIGNvbnRhaW5lckVsLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LXNldHRpbmdzJyk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIC0gXHU4QkJFXHU3RjZFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gPT09IFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU4REVGXHU1Rjg0XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTU3MjggVmF1bHQgXHU0RTJEXHU3Njg0XHU1QjU4XHU1MEE4XHU3NkVFXHU1RjU1XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdiYW1ib28tcmV2aWV3JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGF0YVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGF0YVBhdGggPSB2YWx1ZSB8fCAnYmFtYm9vLXJldmlldyc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIE1hcmtkb3duIFx1NjQ1OFx1ODk4MVx1NTQwQ1x1NkI2NVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEnKVxuICAgICAgLnNldERlc2MoJ1x1NkJDRlx1NkIyMVx1NEZERFx1NUI1OFx1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NjVGNlx1RkYwQ1x1ODFFQVx1NTJBOFx1NTcyOCByZXZpZXdzLyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc1MUZcdTYyMTBcdTUzRUZcdThCRkJcdTc2ODQgLm1kIFx1NjU4N1x1NEVGNicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTRFM0JcdTk4OThcdTUyQThcdTY1NDggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU1QjU4XHU2NTNFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IC5qcyBcdTY1ODdcdTRFRjZcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGggPSB2YWx1ZSB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NzY3RFx1NTY2QVx1OTdGMyA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU3NjdEXHU1NjZBXHU5N0YzJykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTYzMDdcdTVCOUFcdTU0MEVcdTRFQzVcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdTUxODVcdTc2ODRcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTMwMDJcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTY1NzRcdTRFMkFcdTVFOTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1NzY3RFx1NTY2QVx1OTdGMyBcdTYyMTZcdTc1NTlcdTdBN0FcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTMnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTVDMDZcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4nKVxuICAgICAgLnNldERlc2MoJ1x1NjI1M1x1NUYwMFx1NTQwRVx1RkYwQ3dlYmFwcCBcdTUxODVcdTYwQUNcdTZENkVcdTgzRENcdTUzNTVcdTc2ODRcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU4QzAzXHU4MjcyXHU0RjFBXHU1QjlFXHU2NUY2XHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NzY4NFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2Mlx1OTE0RFx1ODI3MicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgVGhlbWVCcmlkZ2UucmVzdG9yZURlZmF1bHRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGFjdGl2ZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5iYW1ib28tcmV2aWV3LWZyYW1lJyk7XG4gICAgICAgICAgICBpZiAoZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOnN5bmNQYWxldHRlRW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGVuYWJsZWQ6IHZhbHVlIH1cbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIFx1NTE3M1x1NEU4RVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTUxNzNcdTRFOEUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDFcdUZGMUFcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0IgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgcGx1Z2luQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ0JhbWJvbyBJbW1vcnRhbHNcdUZGMDhcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdUZGMDlcdTY2MkZcdTRFMDBcdTZCM0VcdTU3RkFcdTRFOEVcdTgyQ0ZcdTgwNTRcdTYzQTdcdTUyMzZcdThCQkFcdTRFNEJcdTcyMzZcdTdFRjRcdTUxNEJcdTYyNThcdTAwQjdcdTY4M0NcdTUzNjJcdTRFQzBcdTc5RDFcdTU5MkJcdTYzRDBcdTUxRkFcdTc2ODRcIk9HQVNcIlx1NzQwNlx1NUZGNVx1RkYwQ1x1NEUxM1x1NEUzQVx1NEUyQVx1NEVCQVx1NjI1M1x1OTAyMFx1NzY4NFx1NEUyRFx1NTZGRFx1OThDRVx1NzZFRVx1NjgwN1x1ODFFQVx1NTJBOFx1NTMxNlx1NTIwNlx1OTE0RFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlx1MzAwMicsXG4gICAgICBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYydcbiAgICB9KTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMlx1RkYxQVx1NEY1Q1x1ODAwNSArIFx1NEY1Q1x1NTRDMSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBhdXRob3JCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCBiYW1ib28tYWJvdXQtYXV0aG9yJyB9KTtcbiAgICBjb25zdCBhdXRob3JSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb3cnIH0pO1xuICAgIGNvbnN0IGF2YXRhciA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXZhdGFyJyB9KTtcbiAgICAvLyBcdTRFQ0VcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdThCRkJcdTUzRDZcdTU5MzRcdTUwQ0ZcdTY1ODdcdTRFRjZcdUZGMDhcdTkwN0ZcdTUxNERcdThGQzdcdTk1N0ZcdTc2ODQgYmFzZTY0IFx1ODhBQiBPYnNpZGlhbiBcdTYyMkFcdTY1QURcdTVCRkNcdTgxRjRcdTdBN0FcdTc2N0RcdUZGMDlcbiAgICAvLyBcdTRGMThcdTUxNDhcdThCRkJcdTYzRDJcdTRFRjZcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhkZXYvQlJBVFx1RkYwOVx1RkYwQ1x1NTE3Nlx1NkIyMVx1NEVDRSB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHU0RTJEXHU4QkZCXHU1M0Q2XHVGRjA4XHU2M0QyXHU0RUY2XHU1RTAyXHU1NzNBXHU1Qjg5XHU4OEM1XHVGRjA5XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBsdWdpbkRpciA9ICh0aGlzLnBsdWdpbi5tYW5pZmVzdCBhcyBhbnkpLmRpcjtcbiAgICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIHx8ICcnO1xuICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHBsdWdpbkRpciwgJ2F1dGhvci1hdmF0YXIuanBnJyksICAgICAgICAgICAgICAgLy8gZGV2IC8gQlJBVCAvIHJlbGVhc2UgYXNzZXRcbiAgICAgICAgcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHBsdWdpbkRpciwgJ3dlYmFwcCcsICdhc3NldHMnLCAnaW1hZ2VzJywgJ2F1dGhvci1hdmF0YXIuanBnJyksIC8vIHdlYmFwcCBcdTUxODVcdTdGNkVcbiAgICAgIF07XG4gICAgICBmb3IgKGNvbnN0IGF2YXRhclBhdGggb2YgY2FuZGlkYXRlcykge1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhhdmF0YXJQYXRoKSkge1xuICAgICAgICAgIGNvbnN0IGF2YXRhckRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoYXZhdGFyUGF0aCk7XG4gICAgICAgICAgY29uc3QgYjY0ID0gYXZhdGFyRGF0YS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2I2NH0pYCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggeyAvKiBzaWxlbnRseSBza2lwIFx1MjAxNCBzaG93IGRlZmF1bHQgZW1wdHkgYXZhdGFyICovIH1cblxuXG4gICAgY29uc3QgYXV0aG9ySW5mbyA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLWluZm8nIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTdGQkRcdTlDREVcdTU0MUInLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLW5hbWUnIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTU1QjVcdTVCNTdcdTk5ODZcdTUyMUJcdTU5Q0JcdTRFQkEnLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvbGUnIH0pO1xuXG4gICAgLy8gXHU0RjVDXHU1NEMxXHU1MzNBXG4gICAgYXV0aG9yQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU0RjVDXHU1NEMxJywgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLWxhYmVsJyB9KTtcbiAgICBjb25zdCB3b3Jrc1JvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3Mtcm93JyB9KTtcblxuICAgIFt7IG5hbWU6ICdcdTdBRjlcdTUzRjZcdTk4REVcdTUyMDMnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1CYW1ib28tRGFydHMnIH0sXG4gICAgIHsgbmFtZTogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnIH1dLmZvckVhY2god29yayA9PiB7XG4gICAgICBjb25zdCB0YWcgPSB3b3Jrc1Jvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogd29yay5uYW1lLCBjbHM6ICdiYW1ib28tYWJvdXQtdGFnJyB9KTtcbiAgICAgIGlmICh3b3JrLnVybCkge1xuICAgICAgICB0YWcuc2V0Q3NzU3R5bGVzKHsgY3Vyc29yOiAncG9pbnRlcicgfSk7XG4gICAgICAgIHRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICB3aW5kb3cub3Blbih3b3JrLnVybCwgJ19ibGFuaycpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFx1ODA1NFx1N0NGQlx1NjVCOVx1NUYwRlxuICAgIGNvbnN0IGNvbnRhY3RCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCcgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1ODA1NFx1N0NGQlx1NjVCOVx1NUYwRicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1OTBBRVx1N0JCMVx1RkYxQXlhbnl1bGluMjEwMEBxcS5jb20nLCBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYycgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NUZBRVx1NEZFMVx1RkYxQXlhbmh1OTQnLCBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYycgfSk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFzQztBQUN0QyxJQUFBQyxRQUFzQjtBQUN0QixJQUFBQyxNQUFvQjtBQUNwQixXQUFzQjtBQUN0QixJQUFBQyxTQUF1Qjs7O0FDSnZCLElBQUFDLG1CQUF3QztBQUN4QyxJQUFBQyxRQUFzQjtBQUN0QixJQUFBQyxNQUFvQjs7O0FDRnBCLHNCQUEwQztBQWNuQyxJQUFNLGVBQU4sTUFBbUI7QUFBQSxFQUl4QixZQUFZLEtBQVUsV0FBVyxpQkFBaUI7QUFDaEQsU0FBSyxNQUFNO0FBQ1gsU0FBSyxlQUFXLCtCQUFjLFFBQVE7QUFBQSxFQUN4QztBQUFBO0FBQUEsRUFHQSxNQUFjLFVBQVUsS0FBNEI7QUFDbEQsVUFBTUMsWUFBTywrQkFBYyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUNwRCxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU9BLEtBQUksR0FBSTtBQUNoRCxZQUFNLEtBQUss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TTtBQUNSLFlBQU0sVUFBVSxXQUFXLElBQUk7QUFBQSxJQUNqQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR1EsYUFBYSxNQUFvQjtBQUN2QyxVQUFNLFNBQVMsS0FBSyxJQUFJLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUN4RSxRQUFJLE9BQU8sV0FBVyxFQUFHO0FBRXpCLFVBQU0sT0FBTyxPQUFPLENBQUMsRUFBRTtBQUN2QixVQUFNLFNBQVUsS0FBYTtBQUM3QixRQUFJLFFBQVEsZUFBZTtBQUN6QixVQUFJLFNBQVM7QUFDYixVQUFJO0FBQUUsaUJBQVMsSUFBSSxJQUFJLE9BQU8sR0FBRyxFQUFFO0FBQUEsTUFBUSxRQUFRO0FBQUEsTUFBaUI7QUFDcEUsYUFBTyxjQUFjO0FBQUEsUUFDbkIsRUFBRSxNQUFNLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtBQUFBLFFBQ2hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxFQUMzRTtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImZzIiwgImh0dHBzIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAic3RhdCIsICJzdGF0IiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAiY2h1bmtzIl0KfQo=
