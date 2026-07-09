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
  /** 获取当前 Obsidian 明暗状态（仅内部使用） */
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
        console.debug(`[BambooReview] \u53D1\u73B0 ${themes.length} \u4E2A\u81EA\u5B9A\u4E49\u4E3B\u9898:`, themes.map((t) => t.name));
      }
    } catch (err) {
      console.debug("[BambooReview] \u626B\u63CF\u81EA\u5B9A\u4E49\u4E3B\u9898\u65F6\u51FA\u9519:", err.message);
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
        console.debug("[BambooReview] Downloading webapp from release", currentVersion);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9NYXJrZG93blN5bmMudHMiLCAic3JjL2JyaWRnZS9TdG9yYWdlQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvVGhlbWVCcmlkZ2UudHMiLCAic3JjL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL3NlcnZlci9Mb2NhbFNlcnZlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IExvY2FsU2VydmVyIH0gZnJvbSAnLi9zcmMvc2VydmVyL0xvY2FsU2VydmVyJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9zcmMvYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG4vKiogXHU3RUFGIE5vZGUuanMgWklQIFx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1Nlx1N0NGQlx1N0VERiB1bnppcC9Qb3dlclNoZWxsXHUzMDAyXHU1RjAyXHU2QjY1XHU4QkZCXHU1M0Q2K1x1ODlFM1x1NTM4Qlx1RkYwQ1x1NEVDNVx1NUI1N1x1ODI4Mlx1ODlFM1x1Njc5MFx1NEZERFx1NjMwMVx1NTQwQ1x1NkI2NVx1MzAwMiAqL1xuYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFppcChzb3VyY2U6IHN0cmluZyB8IEJ1ZmZlciwgZGVzdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGJ1ZiA9IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoc291cmNlKSA6IHNvdXJjZTtcbiAgbGV0IHBvcyA9IDA7XG5cbiAgY29uc3QgcmVhZDE2ID0gKCkgPT4geyBjb25zdCB2ID0gYnVmLnJlYWRVSW50MTZMRShwb3MpOyBwb3MgKz0gMjsgcmV0dXJuIHY7IH07XG4gIGNvbnN0IHJlYWQzMiA9ICgpID0+IHsgY29uc3QgdiA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTsgcG9zICs9IDQ7IHJldHVybiB2OyB9O1xuICBjb25zdCBza2lwID0gKG46IG51bWJlcikgPT4geyBwb3MgKz0gbjsgfTtcblxuICBjb25zdCB3cml0ZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gIC8vIFx1NjI2Qlx1NjNDRlx1NjI0MFx1NjcwOSBsb2NhbCBmaWxlIGhlYWRlclx1RkYwOFx1N0I3RVx1NTQwRCAweDA0MDM0YjUwXHVGRjA5XG4gIHdoaWxlIChwb3MgPCBidWYubGVuZ3RoIC0gNCkge1xuICAgIGNvbnN0IHNpZyA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTtcbiAgICBpZiAoc2lnICE9PSAweDA0MDM0YjUwKSBicmVhaztcblxuICAgIHBvcyArPSA0O1xuICAgIHJlYWQxNigpOyAvLyB2ZXJzaW9uXG4gICAgcmVhZDE2KCk7IC8vIGZsYWdzXG4gICAgY29uc3QgbWV0aG9kID0gcmVhZDE2KCk7XG4gICAgc2tpcCg0KTsgLy8gbW9kIHRpbWUsIG1vZCBkYXRlXG4gICAgcmVhZDMyKCk7IC8vIGNyYzMyXG4gICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSByZWFkMzIoKTtcbiAgICBjb25zdCB1bmNvbXByZXNzZWRTaXplID0gcmVhZDMyKCk7XG4gICAgY29uc3QgbmFtZUxlbiA9IHJlYWQxNigpO1xuICAgIGNvbnN0IGV4dHJhTGVuID0gcmVhZDE2KCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBidWYudG9TdHJpbmcoJ3V0Zi04JywgcG9zLCBwb3MgKyBuYW1lTGVuKTtcbiAgICBwb3MgKz0gbmFtZUxlbiArIGV4dHJhTGVuO1xuXG4gICAgLy8gXHU4REYzXHU4RkM3XHU3NkVFXHU1RjU1XHU2NzYxXHU3NkVFXG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcvJykgfHwgZmlsZU5hbWUuZW5kc1dpdGgoJ1xcXFwnKSkge1xuICAgICAgcG9zICs9IGNvbXByZXNzZWRTaXplO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0UGF0aCA9IHBhdGguam9pbihkZXN0RGlyLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKG91dFBhdGgpO1xuXG4gICAgY29uc3QgZGF0YSA9IGJ1Zi5zdWJhcnJheShwb3MsIHBvcyArIGNvbXByZXNzZWRTaXplKTtcbiAgICBwb3MgKz0gY29tcHJlc3NlZFNpemU7XG5cbiAgICBpZiAobWV0aG9kID09PSAwKSB7XG4gICAgICB3cml0ZXMucHVzaChmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pLnRoZW4oKCkgPT4gZnMucHJvbWlzZXMud3JpdGVGaWxlKG91dFBhdGgsIGRhdGEpKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kID09PSA4KSB7XG4gICAgICB3cml0ZXMucHVzaCgoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYnl0ZXM6IEJ1ZmZlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBieXRlcyA9IHpsaWIuaW5mbGF0ZVJhd1N5bmMoZGF0YSwgeyBmaW5pc2hGbHVzaDogemxpYi5jb25zdGFudHMuWl9TWU5DX0ZMVVNIIH0pO1xuICAgICAgICAgIGlmIChieXRlcy5sZW5ndGggIT09IHVuY29tcHJlc3NlZFNpemUpIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMCwgdW5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGJ5dGVzID0gemxpYi5pbmZsYXRlU3luYyhkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy53cml0ZUZpbGUob3V0UGF0aCwgYnl0ZXMpO1xuICAgICAgfSkoKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZDogYCArIG1ldGhvZCArICcgKCcgKyBmaWxlTmFtZSArICcpJyk7XG4gIH1cbn1cblxuLyoqIFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEIgKi9cbmZ1bmN0aW9uIGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXI6IHN0cmluZywgZGVzdERpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscy9yZWxlYXNlcy9kb3dubG9hZC8ke3ZlcnNpb259L3dlYmFwcC56aXBgO1xuICAgIGh0dHBzLmdldCh1cmwsIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdvYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9IH0sIChyZXMpID0+IHtcbiAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAyIHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDEpIHtcbiAgICAgICAgLy8gRm9sbG93IHJlZGlyZWN0XG4gICAgICAgIGh0dHBzLmdldChyZXMuaGVhZGVycy5sb2NhdGlvbiB8fCAnJywgeyBoZWFkZXJzOiB7ICdVc2VyLUFnZW50JzogJ29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnIH0gfSwgKHJlZGlyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgICAgIHJlZGlyLm9uKCdkYXRhJywgKGM6IEJ1ZmZlcikgPT4gY2h1bmtzLnB1c2goYykpO1xuICAgICAgICAgIHJlZGlyLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBleHRyYWN0WmlwKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSwgZGVzdERpcikudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZWRpci5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQICR7cmVzLnN0YXR1c0NvZGV9OiAke3VybH1gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgIHJlcy5vbignZGF0YScsIChjOiBCdWZmZXIpID0+IGNodW5rcy5wdXNoKGMpKTtcbiAgICAgIHJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGV4dHJhY3RaaXAoQnVmZmVyLmNvbmNhdChjaHVua3MpLCBkZXN0RGlyKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9XG4gICAgICB9KTtcbiAgICAgIHJlcy5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gIH0pO1xufVxuXG4vKiogXHU1NDBFXHU1M0YwXHU1RjAyXHU2QjY1XHU1MjFEXHU1OUNCXHU1MzE2IHdlYmFwcFx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVx1NjNEMlx1NEVGNlx1NzY4NCBvbmxvYWQgXHU4RkQ0XHU1NkRFICovXG5mdW5jdGlvbiBzZXR1cFdlYmFwcEluQmFja2dyb3VuZChcbiAgdGhpczogQmFtYm9vUmV2aWV3UGx1Z2luLFxuICB3ZWJhcHBEaXI6IHN0cmluZyxcbiAgcGx1Z2luRGlyOiBzdHJpbmcsXG4gIHZhdWx0QmFzZVBhdGg6IHN0cmluZyxcbiAgY3VycmVudFZlcnNpb246IHN0cmluZ1xuKTogdm9pZCB7XG4gIGNvbnN0IHdlYmFwcFZlcnNpb25GaWxlID0gcGF0aC5qb2luKHdlYmFwcERpciwgJy52ZXJzaW9uJyk7XG4gIGNvbnN0IG5lZWRzVXBkYXRlID0gIWZzLmV4aXN0c1N5bmMod2ViYXBwVmVyc2lvbkZpbGUpIHx8XG4gICAgKCgpID0+IHsgdHJ5IHsgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyh3ZWJhcHBWZXJzaW9uRmlsZSwgJ3V0Zi04JykudHJpbSgpICE9PSBjdXJyZW50VmVyc2lvbjsgfSBjYXRjaCB7IHJldHVybiB0cnVlOyB9IH0pKCk7XG5cbiAgaWYgKCFuZWVkc1VwZGF0ZSkge1xuICAgIHRoaXMud2ViYXBwUmVhZHkgPSB0cnVlO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFx1NzUyOCBzZXRJbW1lZGlhdGUgLyBzZXRUaW1lb3V0IFx1NjNBOFx1OEZERlx1NTIzMFx1NEUwQlx1NEUwMFx1NEUyQSB0aWNrXHVGRjBDXHU3ODZFXHU0RkREIG9ubG9hZCBcdTUxNDhcdThGRDRcdTU2REVcbiAgc2V0SW1tZWRpYXRlKGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwRGlyKSkge1xuICAgICAgICB0cnkgeyBmcy5ybVN5bmMod2ViYXBwRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7IH0gY2F0Y2gge31cbiAgICAgIH1cbiAgICAgIGNvbnN0IHdlYmFwcFppcCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAuemlwJyk7XG4gICAgICBmcy5ta2RpclN5bmMod2ViYXBwRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwWmlwKSkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NkI2M1x1NTcyOFx1ODlFM1x1NTM4Qlx1OEQ0NFx1NkU5MFx1NTMwNVx1MjAyNicsIDApO1xuICAgICAgICBhd2FpdCBleHRyYWN0WmlwKHdlYmFwcFppcCwgd2ViYXBwRGlyKTtcbiAgICAgICAgdHJ5IHsgZnMudW5saW5rU3luYyh3ZWJhcHBaaXApOyB9IGNhdGNoIHt9XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1REYyXHU2NkY0XHU2NUIwJywgMzAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3dubG9hZE5vdGljZSA9IG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2QjYzXHU1NzI4XHU0RTBCXHU4RjdEXHU4RDQ0XHU2RTkwXHU1MzA1XHUyMDI2JywgMCk7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ1tCYW1ib29SZXZpZXddIERvd25sb2FkaW5nIHdlYmFwcCBmcm9tIHJlbGVhc2UnLCBjdXJyZW50VmVyc2lvbik7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXIsIHdlYmFwcERpciwgY3VycmVudFZlcnNpb24pO1xuICAgICAgICBkb3dubG9hZE5vdGljZS5oaWRlKCk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1Qjg5XHU4OEM1XHU1QjhDXHU2MjEwJywgNDAwMCk7XG4gICAgICB9XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMod2ViYXBwVmVyc2lvbkZpbGUsIGN1cnJlbnRWZXJzaW9uLCAndXRmLTgnKTtcbiAgICAgIHRoaXMud2ViYXBwUmVhZHkgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFdlYmFwcCBzZXR1cCBmYWlsZWQ6JywgZSk7XG4gICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1OEQ0NFx1NkU5MFx1NTMwNVx1NUI4OVx1ODhDNVx1NTkzMVx1OEQyNVx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNVx1N0Y1MVx1N0VEQ1x1NTQwRVx1OTFDRFx1NTQyRiBPYnNpZGlhbicsIDApO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgbG9jYWxTZXJ2ZXI6IExvY2FsU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VydmVyVXJsID0gJyc7XG4gIC8qKiB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHU2NjJGXHU1NDI2XHU1QzMxXHU3RUVBXHVGRjA4XHU1M0VGXHU3NTI4XHU0RThFXHU5OTk2XHU1QzRGXHU1QzU1XHU3OTNBIGxvYWRpbmcgXHU3MkI2XHU2MDAxXHVGRjA5ICovXG4gIHdlYmFwcFJlYWR5ID0gZmFsc2U7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcbiAgICBjb25zdCBwbHVnaW5EaXIgPSAodGhpcy5tYW5pZmVzdCBhcyBhbnkpLmRpcjtcbiAgICBpZiAocGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGNvbnN0IHdlYmFwcERpciA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCBwbHVnaW5EaXIsICd3ZWJhcHAnKTtcbiAgICAgIGNvbnN0IHdlYmFwcEluZGV4UGF0aCA9IHBhdGguam9pbih3ZWJhcHBEaXIsICdpbmRleC5odG1sJyk7XG4gICAgICB0aGlzLmxvY2FsU2VydmVyID0gbmV3IExvY2FsU2VydmVyKHdlYmFwcERpcik7XG5cbiAgICAgIC8vIFx1N0FDQlx1NTM3M1x1NTQyRlx1NTJBOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOFx1NTM3M1x1NEY3RiB3ZWJhcHAgXHU4RkQ4XHU2Q0ExXHU1QzMxXHU3RUVBXHVGRjA5XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU1ODVFIG9ubG9hZFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sb2NhbFNlcnZlci5zdGFydCgpO1xuICAgICAgICB0aGlzLnNlcnZlclVybCA9IHRoaXMubG9jYWxTZXJ2ZXIuZ2V0VXJsKCk7XG4gICAgICAgIHRoaXMubG9jYWxTZXJ2ZXIuc2V0VmF1bHRCYXNlUGF0aCh2YXVsdEJhc2VQYXRoKTtcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDIHdlYmFwcCBcdTVERjJcdTVDMzFcdTdFRUFcdUZGMENcdTc2RjRcdTYzQTVcdTY4MDdcdThCQjBcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwSW5kZXhQYXRoKSkge1xuICAgICAgICAgIHRoaXMud2ViYXBwUmVhZHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEZhaWxlZCB0byBzdGFydCBsb2NhbCBzZXJ2ZXI6JywgZSk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2NzJDXHU1NzMwXHU2NzBEXHU1MkExXHU1NDJGXHU1MkE4XHU1OTMxXHU4RDI1XHVGRjBDXHU5MEU4XHU1MjA2XHU1MjlGXHU4MEZEXHVGRjA4XHU3NjdEXHU1NjZBXHU5N0YzXHUzMDAxXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4XHVGRjA5XHU1M0VGXHU4MEZEXHU0RTBEXHU1M0VGXHU3NTI4JywgMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NzI0OFx1NjcyQ1x1OERERlx1OEUyQSAmIHdlYmFwcCBcdTRFMEJcdThGN0RcdTY1M0VcdTUyMzBcdTU0MEVcdTUzRjBcdUZGMENcdTRFMERcdTk2M0JcdTU4NUUgb25sb2FkIFx1OEZENFx1NTZERVxuICAgICAgc2V0dXBXZWJhcHBJbkJhY2tncm91bmQuY2FsbCh0aGlzLCB3ZWJhcHBEaXIsIHBsdWdpbkRpciwgdmF1bHRCYXNlUGF0aCwgdGhpcy5tYW5pZmVzdC52ZXJzaW9uKTtcbiAgICB9XG5cbiAgICAvLyBcdTZDRThcdTUxOEMgVmlld1xuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsIChsZWFmOiBXb3Jrc3BhY2VMZWFmKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IERhaWx5UmV2aWV3VmlldyhsZWFmLCB0aGlzLnNlcnZlclVybCwgdGhpcywgdGhpcy5zZXR0aW5ncywgKCkgPT4gdGhpcy5zYXZlU2V0dGluZ3MoKSk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLWRhaWx5LXJldmlldycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU0RUNBXHU2NUU1XHU1OTBEXHU3NkQ4JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtcHJldi1kYXknLFxuICAgICAgbmFtZTogJ1x1NTI0RFx1NEUwMFx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjpwcmV2RGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1uZXh0LWRheScsXG4gICAgICBuYW1lOiAnXHU1NDBFXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2Om5leHREYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXRvZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU2REVcdTUyMzBcdTRFQ0FcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6dG9kYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc3RhdHMnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1N0VERlx1OEJBMVx1NTIwNlx1Njc5MCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU3RhdHMnKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc2V0dGluZ3MtaW4tYXBwJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCdhY3Rpb246b3BlblNldHRpbmdzJyksXG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBsdWdpblNldHRpbmdzKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBcdTZERkJcdTUyQTBcdTVERTZcdTRGQTcgUmliYm9uIFx1NTZGRVx1NjgwN1xuICAgIHRoaXMuYWRkUmliYm9uSWNvbignbGVhZicsICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCAoKSA9PiB7XG4gICAgICB2b2lkIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgICB2b2lkIHRoaXMubG9jYWxTZXJ2ZXI/LnN0b3AoKTtcbiAgICB0aGlzLmxvY2FsU2VydmVyID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTZGQzBcdTZEM0JcdTYyMTZcdTUyMUJcdTVFRkFcdTU5MERcdTc2RDhcdTg5QzZcdTU2RkUgKi9cbiAgYXN5bmMgYWN0aXZhdGVWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblxuICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgbGVhdmVzID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcblxuICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gXHU1REYyXHU2NzA5XHU4OUM2XHU1NkZFXHVGRjBDXHU3NkY0XHU2M0E1XHU4MDVBXHU3MTI2XG4gICAgICBsZWFmID0gbGVhdmVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTY1QjBcdTg5QzZcdTU2RkVcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XG4gICAgICAgIHR5cGU6IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChsZWFmKSB7XG4gICAgICBhd2FpdCB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0ICovXG4gIHByaXZhdGUgc2VuZFRvSWZyYW1lKHR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGNvbnN0IHZpZXcgPSBsZWF2ZXNbMF0udmlldyBhcyBEYWlseVJldmlld1ZpZXc7XG4gICAgY29uc3QgaWZyYW1lID0gKHZpZXcgYXMgYW55KS5pZnJhbWUgYXMgSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChpZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIGxldCBvcmlnaW4gPSAnKic7XG4gICAgICB0cnkgeyBvcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjsgfSBjYXRjaCB7IC8qIGtlZXAgJyonICovIH1cbiAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgICB7IHR5cGUsIGlkOiAnY21kXycgKyBEYXRlLm5vdygpIH0sXG4gICAgICAgIG9yaWdpblxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSBCYW1ib29SZXZpZXdQbHVnaW4gZnJvbSAnLi4vLi4vbWFpbic7XG5pbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHsgQnJpZGdlU2VydmljZSB9IGZyb20gJy4uL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1Njc4MVx1N0I4MFx1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZSBcdTYyN0ZcdThGN0QgUFdBXG4gKiAyLiBcdTdCQTFcdTc0MDYgQnJpZGdlU2VydmljZSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcbiAqIDMuIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTVFNzZcdTU0MENcdTZCNjVcbiAqL1xuZXhwb3J0IGNsYXNzIERhaWx5UmV2aWV3VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcHJpdmF0ZSBicmlkZ2VTZXJ2aWNlOiBCcmlkZ2VTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZUVycm9ySGFuZGxlcjogKChlOiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBrZXlkb3duRm9yd2FyZGVyOiAoKGU6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2NoZWNrSW50ZXJ2YWw6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNzc0NoYW5nZVJlZjogYW55ID0gbnVsbDtcbiAgcHJpdmF0ZSB3ZWJhcHBQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBwcml2YXRlIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHdlYmFwcFBhdGg6IHN0cmluZywgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4sIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncywgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIobGVhZik7XG4gICAgdGhpcy53ZWJhcHBQYXRoID0gd2ViYXBwUGF0aDtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3M7XG4gIH1cblxuICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXO1xuICB9XG5cbiAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCc7XG4gIH1cblxuICBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdsZWFmJztcbiAgfVxuXG4gIGFzeW5jIG9uT3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXTtcbiAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctY29udGFpbmVyJyk7XG5cbiAgICBpZiAoIXRoaXMud2ViYXBwUGF0aCkge1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjVFMFx1NkNENVx1NUI5QVx1NEY0RCB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU2M0QyXHU0RUY2XHU1Qjg5XHU4OEM1XHU3NkVFXHU1RjU1JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB3ZWJhcHAgXHU1QzFBXHU2NzJBXHU1QzMxXHU3RUVBXHU2NUY2XHU2NjNFXHU3OTNBIGxvYWRpbmcgXHU1MzYwXHU0RjREXHVGRjBDXHU1NDBFXHU1M0YwXHU1RjAyXHU2QjY1XHU2MkM5XHU1MzA1XHU4OUUzXHU1MzA1XG4gICAgaWYgKCF0aGlzLnBsdWdpbi53ZWJhcHBSZWFkeSkge1xuICAgICAgY29uc3Qgc3RhdHVzRWwgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1NkI2M1x1NTcyOFx1NTIxRFx1NTlDQlx1NTMxNlx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1MjAyNicsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctbG9hZGluZycsXG4gICAgICB9KTtcbiAgICAgIC8vIFx1OEY2RVx1OEJFMlx1N0I0OVx1NUY4NVx1NUMzMVx1N0VFQVx1NTQwRVx1NTJBMFx1OEY3RCBpZnJhbWVcbiAgICAgIGxldCB0aWNrcyA9IDA7XG4gICAgICB0aGlzLl9jaGVja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgdGlja3MrKztcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLndlYmFwcFJlYWR5KSB7XG4gICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5fY2hlY2tJbnRlcnZhbCEpO1xuICAgICAgICAgIHRoaXMuX2NoZWNrSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICAgIHZvaWQgdGhpcy5zZXR1cElmcmFtZShjb250YWluZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyAzMCBcdTc5RDJcdTU0MEVcdTYzRDBcdTc5M0FcdTdGNTFcdTdFRENcdThGODNcdTYxNjJcbiAgICAgICAgaWYgKHRpY2tzID09PSA2MCkge1xuICAgICAgICAgIHN0YXR1c0VsLnNldFRleHQoJ1x1NkI2M1x1NTcyOFx1NEUwQlx1OEY3RFx1OEQ0NFx1NkU5MFx1NTMwNVx1RkYwQ1x1N0Y1MVx1N0VEQ1x1OEY4M1x1NjE2Mlx1OEJGN1x1N0EwRFx1NTAxOVx1MjAyNicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIDEyMCBcdTc5RDJcdTU0MEVcdTYzRDBcdTc5M0FcdTUzRUZcdTgwRkRcdTU5MzFcdThEMjVcbiAgICAgICAgaWYgKHRpY2tzID09PSAyNDApIHtcbiAgICAgICAgICBzdGF0dXNFbC5zZXRUZXh0KCdcdThENDRcdTZFOTBcdTUzMDVcdTRFMEJcdThGN0RcdTVGMDJcdTVFMzhcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTdGNTFcdTdFRENcdTU0MEVcdTkxQ0RcdTU0MkYgT2JzaWRpYW4nKTtcbiAgICAgICAgfVxuICAgICAgfSwgNTAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnNldHVwSWZyYW1lKGNvbnRhaW5lcik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNldHVwSWZyYW1lKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTUyMUJcdTVFRkEgaWZyYW1lIC0gXHU0RTBEXHU0RjdGXHU3NTI4IHNhbmRib3hcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTZCNjIgYXBwOi8vIFx1NTM0Rlx1OEJBRVx1NEUwQlx1NzY4NFx1NUI1MFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFxuICAgIHRoaXMuaWZyYW1lID0gY29udGFpbmVyLmNyZWF0ZUVsKCdpZnJhbWUnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWZyYW1lJyxcbiAgICAgIGF0dHI6IHtcbiAgICAgICAgc3JjOiB0aGlzLndlYmFwcFBhdGgsXG4gICAgICAgIGFsbG93OiAnY2FtZXJhOyBtaWNyb3Bob25lOyBjbGlwYm9hcmQtcmVhZDsgY2xpcGJvYXJkLXdyaXRlJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBpZnJhbWUgXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU2NUY2XHU2NjNFXHU3OTNBXHU2M0QwXHU3OTNBXG4gICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSAoZTogRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIGlmcmFtZSBmYWlsZWQgdG8gbG9hZDonLCB0aGlzLndlYmFwcFBhdGgpO1xuICAgIH07XG4gICAgdGhpcy5pZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG5cbiAgICAvLyBcdTVGNTMgaWZyYW1lIFx1NTkwNFx1NEU4RVx1NzEyNlx1NzBCOVx1NjVGNlx1RkYwQ1x1NUMwNiBDdHJsL0NtZCBcdTVGRUJcdTYzNzdcdTk1MkVcdThGNkNcdTUzRDFcdTdFRDkgT2JzaWRpYW5cdUZGMENcbiAgICAvLyBcdTc4NkVcdTRGRERcdTU0N0RcdTRFRTRcdTk3NjJcdTY3N0ZcdUZGMDhDdHJsL0NtZCtQXHVGRjA5XHUzMDAxXHU1RkVCXHU5MDFGXHU1MjA3XHU2MzYyXHVGRjA4Q3RybC9DbWQrT1x1RkYwOVx1N0I0OVx1NTE2OFx1NUM0MFx1NUZFQlx1NjM3N1x1OTUyRVx1NEVDRFx1NzEzNlx1NTNFRlx1NzUyOFxuICAgIGNvbnN0IG9ic2lkaWFuRG9jID0gYWN0aXZlRG9jdW1lbnQ7XG4gICAgbGV0IGZvcndhcmRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmtleWRvd25Gb3J3YXJkZXIgPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGZvcndhcmRpbmcpIHJldHVybjtcbiAgICAgIGlmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSB7XG4gICAgICAgIGZvcndhcmRpbmcgPSB0cnVlO1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgS2V5Ym9hcmRFdmVudCgna2V5ZG93bicsIHtcbiAgICAgICAgICBrZXk6IGUua2V5LFxuICAgICAgICAgIGNvZGU6IGUuY29kZSxcbiAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgbWV0YUtleTogZS5tZXRhS2V5LFxuICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgIGFsdEtleTogZS5hbHRLZXksXG4gICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgb2JzaWRpYW5Eb2MuYm9keS5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgICAgIGZvcndhcmRpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFjdGl2ZURvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd25Gb3J3YXJkZXIsIHRydWUpO1xuXG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2XHU2ODY1XHU2M0E1XHU2NzBEXHU1MkExXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGF3YWl0IHN0b3JhZ2UuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBjb25zdCBzdG9yYWdlQnJpZGdlID0gbmV3IFN0b3JhZ2VCcmlkZ2Uoc3RvcmFnZSwgdGhpcy5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBuZXcgVGhlbWVCcmlkZ2UoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UgPSBuZXcgQnJpZGdlU2VydmljZShcbiAgICAgIHN0b3JhZ2VCcmlkZ2UsXG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzXG4gICAgKTtcblxuICAgIC8vIFx1NjI2Qlx1NjNDRiBWYXVsdCBcdTRFMkRcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcbiAgICBjb25zdCBjdXN0b21UaGVtZXMgPSBhd2FpdCB0aGlzLl9zY2FuQ3VzdG9tVGhlbWVzKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldEN1c3RvbVRoZW1lcyhjdXN0b21UaGVtZXMpO1xuXG4gICAgLy8gXHU0RjIwXHU5MDEyXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjA4XHU0RjlCXHU3NjdEXHU1NjZBXHU5N0YzXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2MjZCXHU2M0NGL1x1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIHx8ICcnO1xuICAgIGlmICh2YXVsdEJhc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0VmF1bHRCYXNlUGF0aCh2YXVsdEJhc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Tm9pc2VQYXRoKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1NjUyRlx1NjMwMVx1NzUyOFx1NjIzN1x1ODFFQVx1NUI5QVx1NEU0OSAub2JzaWRpYW4gXHU1NDBEXHU3OUYwXHVGRjA5XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldENvbmZpZ0Rpcih0aGlzLmFwcC52YXVsdC5jb25maWdEaXIpO1xuXG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLmF0dGFjaCh0aGlzLmlmcmFtZSk7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUodGhpcy5pZnJhbWUpO1xuXG4gICAgLy8gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlxuICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gdGhpcy5hcHAud29ya3NwYWNlLm9uKCdjc3MtY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy50aGVtZUJyaWRnZT8ub25UaGVtZUNoYW5nZWQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIG9uQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU2RTA1XHU3NDA2XHU4RjZFXHU4QkUyIGludGVydmFsXG4gICAgaWYgKHRoaXMuX2NoZWNrSW50ZXJ2YWwgIT09IG51bGwpIHtcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2NoZWNrSW50ZXJ2YWwpO1xuICAgICAgdGhpcy5fY2hlY2tJbnRlcnZhbCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU2ODY1XHU2M0E1XHU2NzBEXHU1MkExXG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlPy5kZXRhY2goKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU0RTNCXHU5ODk4XHU3NkQxXHU1NDJDXG4gICAgaWYgKHRoaXMuY3NzQ2hhbmdlUmVmKSB7XG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub2ZmcmVmKHRoaXMuY3NzQ2hhbmdlUmVmKTtcbiAgICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLnRoZW1lQnJpZGdlPy5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWUgZXJyb3IgXHU3NkQxXHU1NDJDXHU1NjY4XG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKTtcbiAgICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTk1MkVcdTc2RDhcdThGNkNcdTUzRDFcdTU2NjhcbiAgICBpZiAodGhpcy5rZXlkb3duRm9yd2FyZGVyKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duRm9yd2FyZGVyLCB0cnVlKTtcbiAgICAgIHRoaXMua2V5ZG93bkZvcndhcmRlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGlmcmFtZVxuICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlKCk7XG4gICAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfc2NhbkN1c3RvbVRoZW1lcygpOiBQcm9taXNlPEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCB0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgYW55KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGlmICghdmF1bHRCYXNlUGF0aCkgcmV0dXJuIHRoZW1lcztcblxuICAgICAgY29uc3QgdGhlbWVEaXJOYW1lID0gdGhpcy5zZXR0aW5ncy50aGVtZVBhdGggfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICBjb25zdCB0aGVtZXNEaXIgPSBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgdGhlbWVEaXJOYW1lKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KHRoZW1lc0Rpcik7XG4gICAgICAgIGlmICghc3RhdC5pc0RpcmVjdG9yeSgpKSByZXR1cm4gdGhlbWVzO1xuICAgICAgfSBjYXRjaCB7IHJldHVybiB0aGVtZXM7IH1cblxuICAgICAgY29uc3QgZW50cmllczogc3RyaW5nW10gPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKHRoZW1lc0Rpcik7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5lbmRzV2l0aCgnLmpzJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGVtZXNEaXIsIGVudHJ5KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBlbnRyeVN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZpbGVQYXRoKTtcbiAgICAgICAgICBpZiAoIWVudHJ5U3RhdC5pc0ZpbGUoKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgY29kZTogc3RyaW5nID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIC8vIFx1NUZFQlx1OTAxRlx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NTMwNVx1NTQyQlx1NUZDNVx1OTcwMFx1NzY4NCBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XG4gICAgICAgICAgaWYgKCFjb2RlLmluY2x1ZGVzKCdfX2JhbWJvb190aGVtZV8nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU3RjNBXHU1QzExIF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcdUZGMENcdTVERjJcdThERjNcdThGQzdgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGVtZXMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBlbnRyeS5yZXBsYWNlKC9cXC5qcyQvLCAnJyksXG4gICAgICAgICAgICBjb2RlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW0JhbWJvb1Jldmlld10gXHU4QkZCXHU1M0Q2XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1NTkzMVx1OEQyNTpgLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoZW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYFtCYW1ib29SZXZpZXddIFx1NTNEMVx1NzNCMCAke3RoZW1lcy5sZW5ndGh9IFx1NEUyQVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5ODpgLCB0aGVtZXMubWFwKHQgPT4gdC5uYW1lKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1tCYW1ib29SZXZpZXddIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjVGNlx1NTFGQVx1OTUxOTonLCBlcnIubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1RkYwQ1x1NUMwNlx1OERGM1x1OEZDNzogJHtwYXRofWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsRGF5cygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IGZpbGVzLmZpbGVzXG4gICAgICAuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzb24nKSlcbiAgICAgIC5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmICghZGF0ZUtleSkgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChmaWxlKTtcbiAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHBhcnNlIGRheSBmaWxlOiAke2ZpbGV9YCwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuICAgIHJldHVybiBkYXlzO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NjVFNVx1NjcxRiBrZXlcdUZGMDhcdTYzMDlcdTY1RTVcdTY3MUZcdTk2NERcdTVFOEZcdUZGMENcdTY3MDBcdTY1QjBcdTU3MjhcdTUyNERcdUZGMDkgKi9cbiAgYXN5bmMgZ2V0RGF5S2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkga2V5cy5wdXNoKGRhdGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBrZXlzLnNvcnQoKS5yZXZlcnNlKCk7IC8vIFx1OTY0RFx1NUU4Rlx1RkYxQVx1NjcwMFx1NjVCMFx1NjVFNVx1NjcxRlx1NTcyOFx1NTI0RFxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIwNlx1OTg3NVx1NTJBMFx1OEY3RFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVxuICAgKiBAcGFyYW0gcGFnZSBcdTk4NzVcdTc4MDFcdUZGMDhcdTRFQ0UgMCBcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICogQHBhcmFtIHBhZ2VTaXplIFx1NkJDRlx1OTg3NVx1NjU3MFx1OTFDRlxuICAgKiBAcmV0dXJucyB7IGRheXMsIHRvdGFsLCBwYWdlLCBwYWdlU2l6ZSwgaGFzTW9yZSB9XG4gICAqL1xuICBhc3luYyBnZXREYXlzUGFnaW5hdGVkKHBhZ2UgPSAwLCBwYWdlU2l6ZSA9IDMwKTogUHJvbWlzZTx7XG4gICAgZGF5czogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgICBrZXlzOiBzdHJpbmdbXTtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIGhhc01vcmU6IGJvb2xlYW47XG4gIH0+IHtcbiAgICBjb25zdCBhbGxLZXlzID0gYXdhaXQgdGhpcy5nZXREYXlLZXlzKCk7XG4gICAgY29uc3QgdG90YWwgPSBhbGxLZXlzLmxlbmd0aDtcbiAgICBjb25zdCBzdGFydCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBwYWdlS2V5cyA9IGFsbEtleXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgIGNvbnN0IHJlYWRzID0gcGFnZUtleXMubWFwKGFzeW5jIChkYXRlS2V5KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXREYXkoZGF0ZUtleSk7XG4gICAgICAgIGlmIChkYXRhKSBkYXlzW2RhdGVLZXldID0gZGF0YTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gbG9hZCBkYXk6ICR7ZGF0ZUtleX1gLCBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5cyxcbiAgICAgIGtleXM6IHBhZ2VLZXlzLFxuICAgICAgdG90YWwsXG4gICAgICBwYWdlLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBoYXNNb3JlOiBzdGFydCArIHBhZ2VLZXlzLmxlbmd0aCA8IHRvdGFsLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBwdXREYXkoZGF5RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dEdvYWxzKGdvYWxzOiB1bmtub3duW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBKU09OLnBhcnNlKGRhdGEpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgMik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHsgW2tleV06IHZhbHVlIH0sIG51bGwsIDIpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxTZXR0aW5ncygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgfVxuXG4gIGFzeW5jIHB1dFB1cmNoYXNlSGlzdG9yeShkYXRhOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMiAoaW5jb21lLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgaW5jb21lSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9pbmNvbWUtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRJbmNvbWVIaXN0b3J5KCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gIH1cblxuICBhc3luYyBwdXRJbmNvbWVIaXN0b3J5KGRhdGE6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NUJGQ1x1NTFGQS9cdTVCRkNcdTUxNjUgLS0tLVxuXG4gIGFzeW5jIGV4cG9ydEFsbERhdGEoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBpZiAoZGF0YS5kYXlzKSB7XG4gICAgICBmb3IgKGNvbnN0IGRheSBvZiBPYmplY3QudmFsdWVzKGRhdGEuZGF5cykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXREYXkoZGF5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEuZ29hbHMpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoZGF0YS5nb2FscyBhcyBhbnlbXSk7XG4gICAgfVxuICAgIGlmIChkYXRhLnNldHRpbmdzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhkYXRhLnNldHRpbmdzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dFNldHRpbmcoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhLnB1cmNoYXNlSGlzdG9yeSkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRQdXJjaGFzZUhpc3RvcnkoZGF0YS5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5pbmNvbWVIaXN0b3J5KSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEluY29tZUhpc3RvcnkoZGF0YS5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjbGVhckFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIodGhpcy5iYXNlUGF0aCwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvLyAtLS0tIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAtLS0tXG5cbiAgcHJpdmF0ZSByZXZpZXdQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcmV2aWV3cy8ke2RhdGVLZXl9Lm1kYCk7XG4gIH1cblxuICBhc3luYyB3cml0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZywgbWFya2Rvd246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgbWFya2Rvd24pO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogTWFya2Rvd25TeW5jIC0gXHU1QzA2IERheURhdGEgSlNPTiBcdThGNkNcdTYzNjJcdTRFM0FcdTUzRUZcdThCRkJcdTc2ODQgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cblxuaW50ZXJmYWNlIERheURhdGEge1xuICBkYXRlOiBzdHJpbmc7XG4gIHdlZWtkYXk6IHN0cmluZztcbiAgbWV0cmljcz86IHtcbiAgICBmaXJzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgbGFzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgY29tcGxldGVkVGFza3M/OiBzdHJpbmc7XG4gICAgaW5zcGlyYXRpb25Db3VudD86IHN0cmluZztcbiAgICBhY3RpdmVUaW1lPzogc3RyaW5nO1xuICAgIGVtcHR5U2xvdHM/OiBzdHJpbmc7XG4gIH07XG4gIHRpbWVsaW5lPzogQXJyYXk8e1xuICAgIHBlcmlvZDogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0aW1lOiBzdHJpbmc7XG4gICAgaWNvbj86IHN0cmluZztcbiAgICBldmFsPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyB0aW1lOiBzdHJpbmc7IHRhc2s6IHN0cmluZzsgZXZhbD86IHN0cmluZyB9PjtcbiAgfT47XG4gIGdvYWxzPzogQXJyYXk8e1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBtZXRhPzogc3RyaW5nO1xuICAgIGl0ZW1zPzogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IHBlcmNlbnQ/OiBudW1iZXI7IGRldGFpbD86IHN0cmluZyB9PjtcbiAgfT47XG59XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blN5bmMge1xuICAvKiogXHU1QzA2IERheURhdGEgXHU4RjZDXHU2MzYyXHU0RTNBIE1hcmtkb3duICovXG4gIHN0YXRpYyBnZW5lcmF0ZU1hcmtkb3duKGRhdGE6IERheURhdGEpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gZnJvbnRtYXR0ZXJcdUZGMDhcdTUyQThcdTYwMDFcdTUwM0NcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdTUzMDVcdTg4RjlcdTk2MzJcdTZCNjIgWUFNTCBcdTZDRThcdTUxNjVcdUZGMDlcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKGBkYXRlOiBcIiR7ZGF0YS5kYXRlfVwiYCk7XG4gICAgbGluZXMucHVzaChgd2Vla2RheTogXCIke2RhdGEud2Vla2RheX1cImApO1xuICAgIGxpbmVzLnB1c2goJ3R5cGU6IEJhbWJvbyBJbW1vcnRhbHMnKTtcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFxuICAgIGxpbmVzLnB1c2goYCMgJHtkYXRhLmRhdGV9ICR7ZGF0YS53ZWVrZGF5fVx1NTkwRFx1NzZEOGApO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2MzA3XHU2ODA3XG4gICAgaWYgKGRhdGEubWV0cmljcykge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2MzA3XHU2ODA3Jyk7XG4gICAgICBjb25zdCBtID0gZGF0YS5tZXRyaWNzO1xuICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAobS5maXJzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1OTk5Nlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmZpcnN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmxhc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTY3MkJcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5sYXN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmNvbXBsZXRlZFRhc2tzKSBwYXJ0cy5wdXNoKGBcdTVCOENcdTYyMTBcdTRFRkJcdTUyQTE6ICR7bS5jb21wbGV0ZWRUYXNrc31gKTtcbiAgICAgIGlmIChtLmluc3BpcmF0aW9uQ291bnQpIHBhcnRzLnB1c2goYFx1NzA3NVx1NjExRjogJHttLmluc3BpcmF0aW9uQ291bnR9YCk7XG4gICAgICBpZiAobS5hY3RpdmVUaW1lKSBwYXJ0cy5wdXNoKGBcdTZEM0JcdThEQzNcdTY1RjZcdTk1N0Y6ICR7bS5hY3RpdmVUaW1lfWApO1xuICAgICAgaWYgKG0uZW1wdHlTbG90cykgcGFydHMucHVzaChgXHU3QTdBXHU3NjdEXHU2NUY2XHU2QkI1OiAke20uZW1wdHlTbG90c31gKTtcblxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDAsIDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgfVxuXG4gICAgLy8gXHU2NUY2XHU5NUY0XHU3RUJGXG4gICAgaWYgKGRhdGEudGltZWxpbmUgJiYgZGF0YS50aW1lbGluZS5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTY1RjZcdTk1RjRcdTdFQkYnKTtcbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgZGF0YS50aW1lbGluZSkge1xuICAgICAgICBjb25zdCBpY29uID0gYmxvY2suaWNvbiA/IGAke2Jsb2NrLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2Jsb2NrLm5hbWV9ICgke2Jsb2NrLnRpbWV9KWApO1xuICAgICAgICBpZiAoYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWxTdHIgPSBpdGVtLmV2YWwgPyBgIC0gJHtpdGVtLmV2YWx9YCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0udGltZX0gJHtpdGVtLnRhc2t9JHtldmFsU3RyfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTZcbiAgICBpZiAoZGF0YS5nb2FscyAmJiBkYXRhLmdvYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNicpO1xuICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGRhdGEuZ29hbHMpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGdvYWwuaWNvbiA/IGAke2dvYWwuaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7Z29hbC50aXRsZX1gKTtcbiAgICAgICAgaWYgKGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZ29hbC5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IGl0ZW0ucGVyY2VudCAhPT0gdW5kZWZpbmVkID8gYCAke2l0ZW0ucGVyY2VudH0lYCA6ICcnO1xuICAgICAgICAgICAgY29uc3QgZGV0YWlsID0gaXRlbS5kZXRhaWwgPyBgICgke2l0ZW0uZGV0YWlsfSlgIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS5uYW1lfSR7cGVyY2VudH0ke2RldGFpbH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgTWFya2Rvd25TeW5jIH0gZnJvbSAnLi4vc3RvcmFnZS9NYXJrZG93blN5bmMnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuXG4vKipcbiAqIFN0b3JhZ2VCcmlkZ2UgLSBcdTVDMDYgc3RvcmFnZToqIFx1NkQ4OFx1NjA2Rlx1NjYyMFx1NUMwNFx1NTIzMCBWYXVsdFN0b3JhZ2UgXHU2NENEXHU0RjVDXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yYWdlQnJpZGdlIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2U6IFZhdWx0U3RvcmFnZSwgZW5hYmxlTWFya2Rvd25TeW5jID0gdHJ1ZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgdGhpcy5lbmFibGVNYXJrZG93blN5bmMgPSBlbmFibGVNYXJrZG93blN5bmM7XG4gIH1cblxuICBhc3luYyBoYW5kbGUobWVzc2FnZTogQW55QnJpZGdlTWVzc2FnZSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZS5wdXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAvLyBcdTUzQ0NcdTUxOTkgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZU1hcmtkb3duU3luYyAmJiBtZXNzYWdlLnBheWxvYWQuZGF0YSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtZCA9IE1hcmtkb3duU3luYy5nZW5lcmF0ZU1hcmtkb3duKG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS53cml0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5LCBtZCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXJrZG93biBzeW5jIGZhaWxlZDonLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVEYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5LCBtZXNzYWdlLnBheWxvYWQudmFsdWUpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRHb2FscyhtZXNzYWdlLnBheWxvYWQuZ29hbHMpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRQdXJjaGFzZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRJbmNvbWVIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCc6IHtcbiAgICAgICAgY29uc3QgcGFnaW5hdGVkUGF5bG9hZCA9IG1lc3NhZ2UucGF5bG9hZCBhcyB7IHBhZ2U/OiBudW1iZXI7IHBhZ2VTaXplPzogbnVtYmVyIH07XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5c1BhZ2luYXRlZChcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2UgPz8gMCxcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2VTaXplID8/IDMwXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKG1lc3NhZ2UucGF5bG9hZC5kYXRhKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpjbGVhckFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXJBbGwoKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0b3JhZ2UgbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICB9XG4gIH1cbn1cbiIsICJcbi8qKlxuICogVGhlbWVCcmlkZ2UgLSBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHVGRjBDXHU2M0E4XHU5MDAxXHU1MjMwIGlmcmFtZVxuICogICAgICAgICAgICAgICsgXHU1M0NEXHU1NDExXHVGRjFBXHU2M0E1XHU2NTM2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTUwM0NcdUZGMENcdTZDRThcdTUxNjUgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtZUJyaWRnZSB7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBleHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIHByaXZhdGUgX3BhbGV0dGVTeW5jVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogXHU1QjU4XHU1MEE4XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTk1MkVcdTU0MERcdUZGMENcdTc1MjhcdTRFOEUgcmVzdG9yZURlZmF1bHRzIFx1NkUwNVx1NzQwNiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOSkVDVEVEX1ZBUlMgPSBbXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnLFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJyxcbiAgICAgICctLXRleHQtYWNjZW50JyxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeScsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScsXG4gICAgICAnLS10ZXh0LW5vcm1hbCcsXG4gICAgICAnLS10ZXh0LW11dGVkJyxcbiAgICBdO1xuXG4gICAgLyoqIFx1OTYzMlx1NjI5Nlx1N0FERVx1NjAwMVx1NjgwN1x1OEJCMFx1RkYxQXJlc3RvcmVEZWZhdWx0cyBcdTg4QUJcdThDMDNcdTc1MjhcdTU0MEVcdThCQkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTYzQlx1NkI2Mlx1NUVGNlx1OEZERlx1NTZERVx1OEMwM1x1ODk4Nlx1NTE5OSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdXBwcmVzc2VkID0gZmFsc2U7XG5cbiAgYXR0YWNoSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGRldGFjaElmcmFtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NjYwRVx1NjY5N1x1NzJCNlx1NjAwMVx1RkYwOFx1NEVDNVx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBwcml2YXRlIGlzRGFya01vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTcyQjZcdTYwMDEgKi9cbiAgcHVzaFRoZW1lKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgaWQ6ICd0aGVtZV9wdXNoXycgKyBEYXRlLm5vdygpLFxuICAgICAgICBwYXlsb2FkOiB7IGlzRGFyazogdGhpcy5pc0RhcmtNb2RlKCkgfSxcbiAgICAgIH0sXG4gICAgICAnKidcbiAgICApO1xuICB9XG5cbiAgLyoqIFx1NEY5Qlx1NTkxNlx1OTBFOFx1OEMwM1x1NzUyOFx1RkYxQU9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMSAqL1xuICBvblRoZW1lQ2hhbmdlZCgpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hUaGVtZSgpO1xuICB9XG5cbiAgLy8gPT09PT0gXHU1M0NDXHU1NDExXHU4QzAzXHU4MjcyID09PT09XG5cbiAgLyoqXG4gICAqIFx1OEJBMVx1N0I5NyB3ZWJhcHAgXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNiBcdTIxOTIgT2JzaWRpYW4gQ1NTIFx1NTNEOFx1OTFDRlx1NjYyMFx1NUMwNFxuICAgKiBcdTRFQzVcdTg5ODZcdTc2RDYgMyBcdTdDN0JcdTY4MzhcdTVGQzNcdTgyNzJcdUZGMDhcdTVGM0FcdThDMDMvXHU4MENDXHU2NjZGL1x1NjU4N1x1NUI1N1x1RkYwOVx1RkYwQ1x1NTE3Nlx1NEY1OVx1NzUzMSBPYnNpZGlhbiBcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTYzQThcdTdCOTdcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlT2JzaWRpYW5WYXJzKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgaCA9IE1hdGgucm91bmQoaHVlKTtcbiAgICBjb25zdCBsbyA9IE1hdGgubWF4KC0zMCwgTWF0aC5taW4oMzAsIGxpZ2h0bmVzc09mZnNldCkpO1xuXG4gICAgLy8gXHU1RjNBXHU4QzAzXHU4MjcyXG4gICAgY29uc3QgYWNjZW50UyA9IDQwO1xuICAgIGNvbnN0IGFjY2VudEwgPSBpc0RhcmsgPyA1MCA6IDQwO1xuICAgIGNvbnN0IGFjY2VudCA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TH0lKWA7XG4gICAgY29uc3QgYWNjZW50SG92ZXIgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEwgKyA1fSUpYDtcblxuICAgIC8vIFx1ODBDQ1x1NjY2Rlx1ODI3MlxuICAgIGNvbnN0IGJnUyA9IGlzRGFyayA/IDggOiAxMjtcbiAgICBjb25zdCBiZ0wgPSBpc0RhcmtcbiAgICAgID8gTWF0aC5tYXgoNSwgMTIgKyBsbyAqIDAuMylcbiAgICAgIDogTWF0aC5taW4oOTgsIDk0ICsgbG8gKiAwLjE1KTtcbiAgICBjb25zdCBiZ1ByaW1hcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7YmdMfSUpYDtcbiAgICBjb25zdCBiZ1NlY29uZGFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtpc0RhcmsgPyBiZ0wgKyAzIDogYmdMIC0gMn0lKWA7XG5cbiAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcbiAgICBjb25zdCB0ZXh0Tm9ybWFsID0gaXNEYXJrID8gYGhzbCgke2h9LCA2JSwgODglKWAgOiBgaHNsKCR7aH0sIDYlLCAxMiUpYDtcbiAgICBjb25zdCB0ZXh0TXV0ZWQgID0gaXNEYXJrID8gYGhzbCgke2h9LCA0JSwgNTUlKWAgOiBgaHNsKCR7aH0sIDQlLCA0NSUpYDtcblxuICAgIHJldHVybiB7XG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInOiBhY2NlbnRIb3ZlcixcbiAgICAgICctLXRleHQtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JzogYmdQcmltYXJ5LFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknOiBiZ1NlY29uZGFyeSxcbiAgICAgICctLXRleHQtbm9ybWFsJzogdGV4dE5vcm1hbCxcbiAgICAgICctLXRleHQtbXV0ZWQnOiB0ZXh0TXV0ZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdThDMDNcdTgyNzJcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqIDUwbXMgZGVib3VuY2VcdUZGMENcdTk2MzJcdTZCNjJcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU2RUQxXHU1NzU3XHU1RkVCXHU5MDFGXHU2MkQ2XHU2MkZEXHU0RUE3XHU3NTFGXHU5QUQ4XHU5ODkxIERPTSBcdTUxOTlcdTUxNjVcbiAgICovXG4gIGFwcGx5UGFsZXR0ZShodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYWxldHRlU3luY1RpbWVyKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpO1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gZmFsc2U7IC8vIFx1NjVCMFx1OEMwM1x1ODI3Mlx1OEJGN1x1NkM0Mlx1NTIzMFx1Njc2NSBcdTIxOTIgXHU4OUUzXHU5NjY0XHU2MjkxXHU1MjM2XG4gICAgdGhpcy5fcGFsZXR0ZVN5bmNUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCkgcmV0dXJuOyAvLyByZXN0b3JlRGVmYXVsdHMgXHU1NzI4XHU5NjMyXHU2Mjk2XHU3QTk3XHU1M0UzXHU1MTg1XHU4OEFCXHU4QzAzXHU3NTI4XG4gICAgICBjb25zdCB2YXJzID0gVGhlbWVCcmlkZ2UuY29tcHV0ZU9ic2lkaWFuVmFycyhodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZhcnMpKSB7XG4gICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLyoqIFx1NkUwNVx1OTY2NFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHVGRjBDXHU2MDYyXHU1OTBEIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OUVEOFx1OEJBNFx1NTAzQyAqL1xuICBzdGF0aWMgcmVzdG9yZURlZmF1bHRzKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBUaGVtZUJyaWRnZS5JTkpFQ1RFRF9WQVJTKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFN0b3JhZ2VCcmlkZ2UgfSBmcm9tICcuL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuL1RoZW1lQnJpZGdlJztcbmltcG9ydCB0eXBlIHsgQW55QnJpZGdlTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzL21lc3NhZ2VzJztcbmltcG9ydCB7IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuXG4vKiogXHU2MjZCXHU2M0NGXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2NUY2XHU5RUQ4XHU4QkE0XHU4REYzXHU4RkM3XHU3Njg0XHU3NkVFXHU1RjU1XHU1NDBEXHVGRjA4Y29uZmlnRGlyIFx1NTNFRlx1OTAxQVx1OEZDNyBzZXRDb25maWdEaXIgXHU4MUVBXHU1QjlBXHU0RTQ5XHVGRjA5ICovXG5jb25zdCBERUZBVUxUX1NLSVBfRElSUyA9IFsnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ107XG5cbi8qKlxuICogQnJpZGdlU2VydmljZSAtIHBvc3RNZXNzYWdlIFx1NkQ4OFx1NjA2Rlx1OERFRlx1NzUzMVx1NEUyRFx1NUZDM1xuICpcbiAqIFx1NzZEMVx1NTQyQyBpZnJhbWUgXHU1M0QxXHU2NzY1XHU3Njg0IHBvc3RNZXNzYWdlXHVGRjBDXHU1MjA2XHU1M0QxXHU1MjMwXHU1QkY5XHU1RTk0XHU1OTA0XHU3NDA2XHU2QTIxXHU1NzU3XHVGRjBDXG4gKiBcdTcxMzZcdTU0MEVcdTVDMDZcdTdFRDNcdTY3OUNcdTU2REVcdTRGMjBcdTdFRDkgaWZyYW1lXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBCcmlkZ2VTZXJ2aWNlIHtcbiAgICBwcml2YXRlIHN0b3JhZ2VCcmlkZ2U6IFN0b3JhZ2VCcmlkZ2U7XG4gICAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2U7XG4gICAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCgpID0+IFByb21pc2U8dm9pZD4pIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcjogKChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgY3VzdG9tVGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gICAgcHJpdmF0ZSB2YXVsdEJhc2VQYXRoOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIG5vaXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBjb25maWdEaXI6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgZXhwZWN0ZWRPcmlnaW4gPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlLFxuICAgICAgICB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2UsXG4gICAgICAgIHNldHRpbmdzPzogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgICAgIHNhdmVTZXR0aW5ncz86ICgpID0+IFByb21pc2U8dm9pZD5cbiAgICApIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlQnJpZGdlID0gc3RvcmFnZUJyaWRnZTtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZSA9IHRoZW1lQnJpZGdlO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3MgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3MgfHwgbnVsbDtcbiAgICB9XG5cbiAgLyoqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RTc2XHU1RjAwXHU1OUNCXHU3NkQxXHU1NDJDXHU2RDg4XHU2MDZGICovXG4gIGF0dGFjaChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgLy8gXHU5NjMyXHU2QjYyXHU5MUNEXHU1OTBEXHU3RUQxXHU1QjlBXG4gICAgdGhpcy5kZXRhY2goKTtcblxuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG5cbiAgICAvLyBcdThCQjBcdTVGNTUgZXhwZWN0ZWQgb3JpZ2luXHVGRjBDXHU3NTI4XHU0RThFXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMuZXhwZWN0ZWRPcmlnaW4gPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5vbk1lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyMTdcdTg4NjhcdUZGMDhcdTRGOUJcdTYzRDJcdTRFRjZcdTdBRUZcdTYyNkJcdTYzQ0ZcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgc2V0Q3VzdG9tVGhlbWVzKHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pik6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tVGhlbWVzID0gdGhlbWVzO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOFx1NEY5Qlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBzZXRWYXVsdEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnZhdWx0QmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODQgKi9cbiAgc2V0Tm9pc2VQYXRoKG5vaXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNCAub2JzaWRpYW5cdUZGMENcdTc1MjhcdTYyMzdcdTUzRUZcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbiAgc2V0Q29uZmlnRGlyKGRpcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdEaXIgPSBkaXI7XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHU2MjE2XHU1MTY4XHU1RTkzXHU2MjZCXHU2M0NGXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgX3NjYW5WYXVsdEF1ZGlvRmlsZXMobWF4RGVwdGggPSA1KTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFsbG93ZWRFeHRzID0gQUxMT1dFRF9BVURJT19FWFRFTlNJT05TO1xuICAgIGNvbnN0IGJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgIGlmICghYmFzZVBhdGgpIHJldHVybiByZXN1bHRzO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1IGJhc2VQYXRoIFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1RkYwOFx1NUYwMlx1NkI2NVx1RkYwOVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGJhc2VQYXRoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjMwN1x1NUI5QVx1NEU4Nlx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTNFQVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEUwRFx1OTAxMlx1NUY1Mlx1RkYwOVxuICAgIGlmICh0aGlzLm5vaXNlUGF0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0RGlyID0gcGF0aC5qb2luKGJhc2VQYXRoLCB0aGlzLm5vaXNlUGF0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzOiBmcy5EaXJlbnRbXSA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIodGFyZ2V0RGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgaWYgKCFlbnRyeS5pc0ZpbGUoKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQ6IGZzLlN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChwYXRoLmpvaW4odGFyZ2V0RGlyLCBlbnRyeS5uYW1lKSk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiBwYXRoLmpvaW4odGhpcy5ub2lzZVBhdGgsIGVudHJ5Lm5hbWUpLCBuYW1lOiBlbnRyeS5uYW1lLCBzaXplOiBzdGF0LnNpemUsIGV4dCB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTY3MkFcdTYzMDdcdTVCOUFcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUxNjhcdTVFOTNcdTkwMTJcdTVGNTJcdTYyNkJcdTYzQ0ZcdUZGMDhcdTVGMDJcdTZCNjUgKyBcdTZERjFcdTVFQTZcdTk2NTBcdTUyMzZcdUZGMDlcbiAgICBjb25zdCBzY2FuRGlyID0gYXN5bmMgKGRpclBhdGg6IHN0cmluZywgcmVsYXRpdmVQcmVmaXg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcbiAgICAgIGxldCBlbnRyaWVzOiBmcy5EaXJlbnRbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVudHJpZXMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGRpclBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgIH0gY2F0Y2ggeyByZXR1cm47IC8qIHNraXAgdW5yZWFkYWJsZSBkaXJzICovIH1cblxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmIChlbnRyeS5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsIGVudHJ5Lm5hbWUpO1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZVByZWZpeCA/IHBhdGguam9pbihyZWxhdGl2ZVByZWZpeCwgZW50cnkubmFtZSkgOiBlbnRyeS5uYW1lO1xuXG4gICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgY29uc3Qgc2tpcERpcnMgPSBuZXcgU2V0KFsuLi5ERUZBVUxUX1NLSVBfRElSUywgLi4uKHRoaXMuY29uZmlnRGlyID8gW3RoaXMuY29uZmlnRGlyXSA6IFtdKV0pO1xuICAgICAgICAgIGlmIChza2lwRGlycy5oYXMoZW50cnkubmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgIGF3YWl0IHNjYW5EaXIoZnVsbFBhdGgsIHJlbGF0aXZlUGF0aCwgZGVwdGggKyAxKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0ZpbGUoKSkge1xuICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBzdGF0OiBmcy5TdGF0cyA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiByZWxhdGl2ZVBhdGgsIG5hbWU6IGVudHJ5Lm5hbWUsIHNpemU6IHN0YXQuc2l6ZSwgZXh0IH0pO1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBhd2FpdCBzY2FuRGlyKGJhc2VQYXRoLCAnJywgMCk7XG4gICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKiBcdTg5RTNcdTdFRDEgaWZyYW1lXHVGRjBDXHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZXNzYWdlSGFuZGxlcikge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnRoZW1lQnJpZGdlLmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTU5MDRcdTc0MDYgKi9cbiAgcHJpdmF0ZSBhc3luYyBvbk1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1zZyA9IGV2ZW50LmRhdGEgYXMgQW55QnJpZGdlTWVzc2FnZTtcbiAgICBpZiAoIW1zZyB8fCAhbXNnLnR5cGUgfHwgIW1zZy5pZCkgcmV0dXJuO1xuXG4gICAgLy8gXHU2ODIxXHU5QThDXHU2RDg4XHU2MDZGXHU2NzY1XHU2RTkwXHVGRjFBc291cmNlICsgb3JpZ2luIFx1NTNDQ1x1OTFDRFx1OUE4Q1x1OEJDMVxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiBldmVudC5zb3VyY2UgIT09IHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZXhwZWN0ZWRPcmlnaW4gJiYgZXZlbnQub3JpZ2luICE9PSB0aGlzLmV4cGVjdGVkT3JpZ2luKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tCcmlkZ2VTZXJ2aWNlXSBJZ25vcmVkIG1lc3NhZ2UgZnJvbSB1bmtub3duIG9yaWdpbjonLCBldmVudC5vcmlnaW4pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNlx1NURGMlx1NzdFNVx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4Qlx1NTI0RFx1N0YwMFxuICAgIGlmICghbXNnLnR5cGUuc3RhcnRzV2l0aCgnc3RvcmFnZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnYXBwOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCdmaWxlOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCd0aGVtZTonKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlx1NkQ4OFx1NjA2RlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpyZWFkeScpIHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKCk7XG4gICAgICAvLyBcdTYyOEFcdTYzMDFcdTRFNDVcdTUzMTZcdTc2ODQgc2VjdGlvbkNvbmZpZ1x1MzAwMVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTQ4Q1x1ODFFQVx1NUI5QVx1NEU0OVx1OTdGM1x1NkU5MFx1OTY4RiByZWFkeSBcdTU0Q0RcdTVFOTRcdTUzRDFcdTdFRDkgd2ViYXBwXG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBzZWN0aW9uQ29uZmlnOiB0aGlzLnNldHRpbmdzPy5zZWN0aW9uQ29uZmlnIHx8IG51bGwsXG4gICAgICAgIGN1c3RvbVRoZW1lczogdGhpcy5jdXN0b21UaGVtZXMsXG4gICAgICAgIGN1c3RvbU5vaXNlczogdGhpcy5zZXR0aW5ncz8ubm9pc2VJdGVtcyB8fCBbXSxcbiAgICAgICAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiB0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gfHwgZmFsc2UsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6Y2xvc2UnKSB7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1Njc3Rlx1NTc1N1x1OTE0RFx1N0Y2RVx1NjMwMVx1NEU0NVx1NTMxNlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpzYXZlU2VjdGlvbkNvbmZpZycpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2VjdGlvbkNvbmZpZyA9IG1zZy5wYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmdzKSBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTYzMDFcdTRFNDVcdTUzMTZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6c2F2ZUN1c3RvbU5vaXNlcycpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Mubm9pc2VJdGVtcyA9IG1zZy5wYXlsb2FkIGFzIHVua25vd25bXSB8fCBbXTtcbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmdzKSBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTRFM0JcdTk4OThcdTUyMDdcdTYzNjJcdThCRjdcdTZDNDJcdUZGMDhpZnJhbWUgXHUyMTkyIE9ic2lkaWFuXHVGRjA5XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnRvZ2dsZVRoZW1lJykge1xuICAgICAgY29uc3QgdGFyZ2V0SXNEYXJrID0gbXNnLnBheWxvYWQuaXNEYXJrID09PSB0cnVlOyAgICAgIGNvbnN0IGN1cnJlbnRJc0RhcmsgPSBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICAgICAgaWYgKHRhcmdldElzRGFyayAhPT0gY3VycmVudElzRGFyaykge1xuICAgICAgICBpZiAodGFyZ2V0SXNEYXJrKSB7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1saWdodCcpO1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtZGFyaycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUtZGFyaycpO1xuICAgICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndGhlbWUtbGlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTkwMUFcdTc3RTUgaWZyYW1lIFx1NEUzQlx1OTg5OFx1NURGMlx1NTIwN1x1NjM2MlxuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSwgaXNEYXJrOiB0YXJnZXRJc0RhcmsgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU4QkY3XHU2QzQyXHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pIHtcbiAgICAgICAgY29uc3QgeyBodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrIH0gPSBtc2cucGF5bG9hZDtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5hcHBseVBhbGV0dGUoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vID09PT09IFx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1RkYxQVx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiA9PT09PVxuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU2MjQwXHU2NzA5XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU0RjlCIHdlYmFwcCBcdTY1ODdcdTRFRjZcdTkwMDlcdTYyRTlcdTU2NjhcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6bGlzdFZhdWx0QXVkaW9GaWxlcycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMENcdThCRjdcdTVDMURcdThCRDVcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTk3NjJcdTY3N0YnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBfc2NhblZhdWx0QXVkaW9GaWxlcygpIFx1NTE4NVx1OTBFOFx1NURGMlx1NUYwMlx1NkI2NVx1NjhDMFx1NjdFNVx1OERFRlx1NUY4NFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKTtcbiAgICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBmaWxlcyB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb10gXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1OicsIGVycm9yKTtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdcdTYyNkJcdTYzQ0ZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTkwMUFcdThGQzdcdTVFOTNcdTUxODVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcdTIwMTQgXHU4RkQ0XHU1NkRFXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1MjREXHU3QUVGXHU3NkY0XHU2M0E1IGZldGNoIGZpbGU6Ly9cbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZFZhdWx0RmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgaWYgKCF0aGlzLnZhdWx0QmFzZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSB0aGlzLnZhdWx0QmFzZVBhdGg7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIC8vIFx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NjhDMFx1NjdFNVx1RkYxQVx1Nzg2RVx1NEZERFx1ODlFM1x1Njc5MFx1NTQwRVx1NzY4NFx1OERFRlx1NUY4NFx1NjcyQVx1OTAwM1x1OTAzOFx1NTFGQSB2YXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgICAgaWYgKCFmdWxsUGF0aC5zdGFydHNXaXRoKHZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjJcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQScgKyByZWxhdGl2ZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZVBhdGg6IGZ1bGxQYXRoLCBuYW1lOiBwYXRoLmJhc2VuYW1lKHJlbGF0aXZlUGF0aCwgZXh0KSB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdcdThCRkJcdTUzRDZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTY3MkNcdTU3MzBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdTU2REVcdTRGMjBcdThERUZcdTVGODRcdTc1MzFcdTUyNERcdTdBRUZcdTc1MjggZmlsZTovLyBcdTUyQTBcdThGN0RcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZExvY2FsRmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gbXNnLnBheWxvYWQ/LnBhdGggfHwgJyc7XG4gICAgICAgIGlmICghZmlsZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NjJEMlx1N0VERFx1NTMwNVx1NTQyQlx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NUI1N1x1N0IyNlx1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICBpZiAoZmlsZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZpbGVQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZVBhdGgsIG5hbWU6IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IubWVzc2FnZSB8fCAnXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1QjU4XHU1MEE4XHU3QzdCXHU2RDg4XHU2MDZGXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZUJyaWRnZS5oYW5kbGUobXNnKTtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvci5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJyk7XG4gICAgfVxuICB9XG5cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTYyMTBcdTUyOUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kKGlkOiBzdHJpbmcsIHBheWxvYWQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgaWQsIHBheWxvYWQgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1OTUxOVx1OEJFRlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmRFcnJvcihpZDogc3RyaW5nLCBlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgZXJyb3IgfSwgJyonKTtcbiAgfVxufVxuIiwgIi8qKiBcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDhcdTVCOENcdTY1NzRcdTUyMTdcdTg4NjhcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgPSBbXG4gICcubXAzJywgJy53YXYnLCAnLm9nZycsICcuZmxhYycsICcuYWFjJywgJy5tNGEnLCAnLndtYScsICcud2VibScsICcub3B1cycsXG5dO1xuXG4vKiogXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEIFx1MjE5MiBNSU1FIFx1N0M3Qlx1NTc4QiAqL1xuY29uc3QgQVVESU9fTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5tcDMnOiAgJ2F1ZGlvL21wZWcnLFxuICAnLndhdic6ICAnYXVkaW8vd2F2JyxcbiAgJy5vZ2cnOiAgJ2F1ZGlvL29nZycsXG4gICcuZmxhYyc6ICdhdWRpby9mbGFjJyxcbiAgJy5hYWMnOiAgJ2F1ZGlvL2FhYycsXG4gICcubTRhJzogICdhdWRpby9tcDQnLFxuICAnLndtYSc6ICAnYXVkaW8veC1tcy13bWEnLFxuICAnLndlYm0nOiAnYXVkaW8vd2VibScsXG4gICcub3B1cyc6ICdhdWRpby9vcHVzJyxcbn07XG5cbi8qKiBcdTVCOENcdTY1NzQgTUlNRSBcdTdDN0JcdTU3OEJcdTY2MjBcdTVDMDRcdUZGMDhcdTU0MkIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IE1JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcuaHRtbCc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmNzcyc6ICAndGV4dC9jc3M7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcubWpzJzogICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qc29uJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAnLnBuZyc6ICAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAgJ2ltYWdlL2pwZWcnLFxuICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICcuZ2lmJzogICdpbWFnZS9naWYnLFxuICAnLnN2Zyc6ICAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcuaWNvJzogICdpbWFnZS94LWljb24nLFxuICAnLndvZmYnOiAnZm9udC93b2ZmJyxcbiAgJy53b2ZmMic6J2ZvbnQvd29mZjInLFxuICAnLnR0Zic6ICAnZm9udC90dGYnLFxuICAuLi5BVURJT19NSU1FX1RZUEVTLFxufTtcbiIsICJpbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG5ldCBmcm9tICduZXQnO1xuaW1wb3J0IHsgTUlNRV9UWVBFUywgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcblxuLyoqXG4gKiBMb2NhbFNlcnZlciAtIFx1NjcyQ1x1NTczMCBIVFRQIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjcwRFx1NTJBMVx1NTY2OFxuICpcbiAqIFx1NTcyOCBPYnNpZGlhbiAoRWxlY3Ryb24pIFx1NzNBRlx1NTg4M1x1NEUyRFx1NTQyRlx1NTJBOFx1NEUwMFx1NEUyQVx1NjcyQ1x1NTczMCBIVFRQIFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1xuICogXHU0RTNBIGlmcmFtZSBcdTYzRDBcdTRGOUIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NjcwRFx1NTJBMVx1RkYwQ1x1N0VENVx1OEZDNyBhcHA6Ly8gXHU1MzRGXHU4QkFFXHU3Njg0XHU5NjUwXHU1MjM2XHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFNlcnZlciB7XG4gIHByaXZhdGUgc2VydmVyOiBodHRwLlNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHBvcnQgPSAwO1xuICBwcml2YXRlIHdlYmFwcERpcjogc3RyaW5nO1xuICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKHdlYmFwcERpcjogc3RyaW5nKSB7XG4gICAgdGhpcy53ZWJhcHBEaXIgPSB3ZWJhcHBEaXI7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RjlCIC9iYW1ib28tYXVkaW8gXHU5N0YzXHU5ODkxXHU0RUUzXHU3NDA2XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHNldFZhdWx0QmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMudmF1bHRCYXNlUGF0aCA9IGJhc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1x1OEZENFx1NTZERVx1NzZEMVx1NTQyQ1x1N0FFRlx1NTNFMyAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLnNlcnZlcikgcmV0dXJuIHRoaXMucG9ydDtcblxuICAgIHRoaXMucG9ydCA9IGF3YWl0IHRoaXMuZmluZEZyZWVQb3J0KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KHJlcSwgcmVzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBTZXJ2ZXIgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2VydmVyIGVycm9yOiAke2Vyci5tZXNzYWdlfWApKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5saXN0ZW4odGhpcy5wb3J0LCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gTG9jYWwgc2VydmVyIHN0YXJ0ZWQgb24gcG9ydCAke3RoaXMucG9ydH1gKTtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnBvcnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU1MDVDXHU2QjYyXHU2NzBEXHU1MkExXHU1NjY4ICovXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RvcHBlZCcpO1xuICAgICAgICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnBvcnQgPSAwO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2NzBEXHU1MkExXHU1NjY4IFVSTCAqL1xuICBnZXRVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGh0dHA6Ly8xMjcuMC4wLjE6JHt0aGlzLnBvcnR9YDtcbiAgfVxuXG4gIC8qKiBcdTU5MDRcdTc0MDYgSFRUUCBcdThCRjdcdTZDNDIgKi9cbiAgcHJpdmF0ZSBoYW5kbGVSZXF1ZXN0KHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSk6IHZvaWQge1xuICAgIC8vIC9iYW1ib28tYXVkaW8/cGF0aD14eHggXHUyMDE0IFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NEVFM1x1NzQwNlx1RkYwQ1x1N0VENVx1OEZDNyBwb3N0TWVzc2FnZSBcdTU5MjcgcGF5bG9hZCBcdTk2NTBcdTUyMzZcbiAgICBjb25zdCB1cmwgPSByZXEudXJsIHx8ICcvJztcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9iYW1ib28tYXVkaW8tcHJveHknKSkge1xuICAgICAgdGhpcy5oYW5kbGVBdWRpb1VybFByb3h5KHJlcSwgcmVzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvYmFtYm9vLWF1ZGlvJykpIHtcbiAgICAgIHRoaXMuaGFuZGxlQXVkaW9Qcm94eShyZXEsIHJlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4OUUzXHU2NzkwIFVSTFx1RkYwQ1x1NTNCQlx1OTY2NFx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFxuICAgIGxldCB1cmxQYXRoID0gdXJsLnNwbGl0KCc/JylbMF07XG4gICAgLy8gXHU3NkVFXHU1RjU1XHU5RUQ4XHU4QkE0XHU2NTg3XHU0RUY2XG4gICAgaWYgKHVybFBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgICAgdXJsUGF0aCArPSAnaW5kZXguaHRtbCc7XG4gICAgfVxuICAgIGNvbnN0IHNhZmVQYXRoID0gcGF0aC5ub3JtYWxpemUodXJsUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy53ZWJhcHBEaXIsIHNhZmVQYXRoKTtcblxuICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NTcyOCB3ZWJhcHBEaXIgXHU1MTg1XG4gICAgaWYgKCFmaWxlUGF0aC5zdGFydHNXaXRoKHRoaXMud2ViYXBwRGlyKSkge1xuICAgICAgcmVzLndyaXRlSGVhZCg0MDMpO1xuICAgICAgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgZnMuc3RhdChmaWxlUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgIGlmIChlcnIgfHwgIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTtcbiAgICAgICAgcmVzLmVuZChgPCFET0NUWVBFIGh0bWw+XG48aHRtbD48aGVhZD48bWV0YSBjaGFyc2V0PVwidXRmLThcIj48c3R5bGU+XG4gIGJvZHkgeyBkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgaGVpZ2h0OjEwMHZoOyBtYXJnaW46MDtcbiAgICAgICAgIGZvbnQtZmFtaWx5OiBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7IGJhY2tncm91bmQ6IzBhMGEwYTsgY29sb3I6Izg4ODsgfVxuICAuYm94IHsgdGV4dC1hbGlnbjpjZW50ZXI7IH1cbiAgaDIgeyBjb2xvcjojY2NjOyBmb250LXdlaWdodDo0MDA7IH1cbiAgcCB7IGZvbnQtc2l6ZToxNHB4OyB9XG4gIGJ1dHRvbiB7IG1hcmdpbi10b3A6MTZweDsgcGFkZGluZzo4cHggMjRweDsgYm9yZGVyOjFweCBzb2xpZCAjNDQ0OyBib3JkZXItcmFkaXVzOjZweDtcbiAgICAgICAgICAgYmFja2dyb3VuZDojMWExYTFhOyBjb2xvcjojYWFhOyBjdXJzb3I6cG9pbnRlcjsgZm9udC1zaXplOjE0cHg7IH1cbiAgYnV0dG9uOmhvdmVyIHsgYmFja2dyb3VuZDojMmEyYTJhOyBjb2xvcjojZmZmOyB9XG48L3N0eWxlPjwvaGVhZD48Ym9keT5cbjxkaXYgY2xhc3M9XCJib3hcIj5cbiAgPGgyPlx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1NkI2M1x1NTcyOFx1NTIxRFx1NTlDQlx1NTMxNlx1MjAyNlx1MjAyNjwvaDI+XG4gIDxwPlx1OTk5Nlx1NkIyMVx1NTQyRlx1NTJBOFx1OTcwMFx1ODk4MVx1NEUwQlx1OEY3RFx1OEQ0NFx1NkU5MFx1NTMwNVx1RkYwQ1x1OEJGN1x1N0EwRFx1NTAxOTwvcD5cbiAgPGJ1dHRvbiBvbmNsaWNrPVwibG9jYXRpb24ucmVsb2FkKClcIj5cdTYyNEJcdTUyQThcdTUyMzdcdTY1QjA8L2J1dHRvbj5cbiAgPHNjcmlwdD5cbiAgICB2YXIgcmV0cmllcyA9IDA7XG4gICAgZnVuY3Rpb24gY2hlY2soKSB7XG4gICAgICBmZXRjaCh3aW5kb3cubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6ICdIRUFEJyB9KS50aGVuKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgaWYgKHIuc3RhdHVzID09PSAyMDApIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBlbHNlIGlmICgrK3JldHJpZXMgPCAzMCkgc2V0VGltZW91dChjaGVjaywgMjAwMCk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbigpIHsgaWYgKCsrcmV0cmllcyA8IDMwKSBzZXRUaW1lb3V0KGNoZWNrLCAyMDAwKTsgfSk7XG4gICAgfVxuICAgIHNldFRpbWVvdXQoY2hlY2ssIDMwMDApO1xuICA8L3NjcmlwdD5cbjwvZGl2PjwvYm9keT48L2h0bWw+YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4QkJFXHU3RjZFIE1JTUUgXHU3QzdCXHU1NzhCXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcblxuICAgICAgLy8gXHU1REVFXHU1RjAyXHU1MzE2XHU3RjEzXHU1QjU4XHU3QjU2XHU3NTY1XHVGRjFBXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU1RTI2IF9fQlVJTERfXyBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMENcdTUzRUZcdTk1N0ZcdTY3MUZcdTdGMTNcdTVCNThcbiAgICAgIGNvbnN0IGlzSFRNTCA9IGV4dCA9PT0gJy5odG1sJztcbiAgICAgIGNvbnN0IGlzU3RhdGljID0gWycuY3NzJywgJy5qcycsICcud29mZicsICcud29mZjInLCAnLnR0ZicsICcuc3ZnJywgJy5wbmcnLCAnLmljbycsICcuanNvbiddLmluY2x1ZGVzKGV4dCk7XG4gICAgICBjb25zdCBjYWNoZUNvbnRyb2wgPSBpc0hUTUxcbiAgICAgICAgPyAnbm8tY2FjaGUnXG4gICAgICAgIDogaXNTdGF0aWNcbiAgICAgICAgICA/ICdwdWJsaWMsIG1heC1hZ2U9ODY0MDAnXG4gICAgICAgICAgOiAncHVibGljLCBtYXgtYWdlPTM2MDAnO1xuXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMDhcdTRFMERcdTk3MDBcdTg5ODEgQ09SU1x1RkYwQ2lmcmFtZSBcdTRFMEVcdTY3MERcdTUyQTFcdTU2NjhcdTU0MENcdTZFOTBcdUZGMDlcbiAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiBjYWNoZUNvbnRyb2wsXG4gICAgICB9KTtcblxuICAgICAgLy8gXHU2RDQxXHU1RjBGXHU0RjIwXHU4RjkzXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBzdHJlYW06IGZzLlJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoKTtcbiAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpby1wcm94eT91cmw9eHh4IFx1MjAxNCBcdTRFRTNcdTc0MDZcdTU5MTZcdTkwRThcdTk3RjNcdTZFOTAgVVJMXHVGRjBDXHU3RUQ1XHU4RkM3XHU2RDRGXHU4OUM4XHU1NjY4IENPUlMgXHU5NjUwXHU1MjM2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9VcmxQcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyB1cmwgcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHF1ZXJ5U3RyID0gcmF3VXJsLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHIpO1xuICAgICAgY29uc3QgdGFyZ2V0VXJsID0gcGFyYW1zLmdldCgndXJsJyk7XG4gICAgICBpZiAoIXRhcmdldFVybCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgdXJsIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NEVDNVx1NTE0MVx1OEJCOCBodHRwL2h0dHBzXG4gICAgICBsZXQgcGFyc2VkOiBVUkw7XG4gICAgICB0cnkge1xuICAgICAgICBwYXJzZWQgPSBuZXcgVVJMKHRhcmdldFVybCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdJbnZhbGlkIFVSTCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocGFyc2VkLnByb3RvY29sICE9PSAnaHR0cDonICYmIHBhcnNlZC5wcm90b2NvbCAhPT0gJ2h0dHBzOicpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IG9ubHkgaHR0cC9odHRwcyBVUkxzIGFsbG93ZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc5ODFcdTZCNjJcdThCQkZcdTk1RUVcdTY3MkNcdTU3MzBcdTU3MzBcdTU3NDBcbiAgICAgIGNvbnN0IGhvc3RuYW1lID0gcGFyc2VkLmhvc3RuYW1lO1xuICAgICAgaWYgKGhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fCBob3N0bmFtZSA9PT0gJzEyNy4wLjAuMScgfHwgaG9zdG5hbWUgPT09ICcwLjAuMC4wJ1xuICAgICAgICB8fCBob3N0bmFtZSA9PT0gJ1s6OjFdJyB8fCBob3N0bmFtZS5zdGFydHNXaXRoKCcxOTIuMTY4LicpIHx8IGhvc3RuYW1lLnN0YXJ0c1dpdGgoJzEwLicpXG4gICAgICAgIHx8IGhvc3RuYW1lLnN0YXJ0c1dpdGgoJzE3Mi4nKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogbG9jYWwvcHJpdmF0ZSBuZXR3b3JrIFVSTHMgbm90IGFsbG93ZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDhcdTc2N0RcdTU0MERcdTUzNTVcdUZGMDlcbiAgICAgIGNvbnN0IHBhdGhuYW1lID0gcGFyc2VkLnBhdGhuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5zb21lKGV4dCA9PiBwYXRobmFtZS5lbmRzV2l0aChleHQpKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogdW5zdXBwb3J0ZWQgYXVkaW8gZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdHJhbnNwb3J0ID0gcGFyc2VkLnByb3RvY29sID09PSAnaHR0cHM6JyA/IGh0dHBzIDogaHR0cDtcbiAgICAgIGNvbnN0IHByb3h5UmVxID0gdHJhbnNwb3J0LmdldCh0YXJnZXRVcmwsIHsgdGltZW91dDogMzAwMDAgfSwgKHByb3h5UmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgNTAwO1xuICAgICAgICBjb25zdCBjdCA9IHByb3h5UmVzLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuXG4gICAgICAgIC8vIFx1OTY1MFx1NTIzNlx1NTRDRFx1NUU5NFx1NTkyN1x1NUMwRlx1RkYwOFx1NjcwMFx1NTkyNyA1ME1CXHVGRjA5XG4gICAgICAgIGNvbnN0IG1heFNpemUgPSA1MCAqIDEwMjQgKiAxMDI0O1xuICAgICAgICBsZXQgdG90YWxTaXplID0gMDtcbiAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuXG4gICAgICAgIHByb3h5UmVzLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICB0b3RhbFNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICAgIGlmICh0b3RhbFNpemUgPiBtYXhTaXplKSB7XG4gICAgICAgICAgICBwcm94eVJlcS5kZXN0cm95KCk7XG4gICAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQxMyk7IHJlcy5lbmQoJ0F1ZGlvIGZpbGUgdG9vIGxhcmdlIChtYXggNTBNQiknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm94eVJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgIGlmIChyZXMuaGVhZGVyc1NlbnQpIHJldHVybjtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKHN0YXR1cywge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGN0LFxuICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogdG90YWxTaXplLFxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAgICdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT0zNjAwJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBib2R5ID0gQnVmZmVyLmNvbmNhdChjaHVua3MpO1xuICAgICAgICAgIHJlcy5lbmQoYm9keSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb3h5UmVzLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gVVJMIHByb3h5IHVwc3RyZWFtIGVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAyKTsgcmVzLmVuZCgnVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb3h5UmVxLm9uKCd0aW1lb3V0JywgKCkgPT4ge1xuICAgICAgICBwcm94eVJlcS5kZXN0cm95KCk7XG4gICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDQpOyByZXMuZW5kKCdVcHN0cmVhbSB0aW1lb3V0Jyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwcm94eVJlcS5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIFVSTCBwcm94eSBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIpOyByZXMuZW5kKCdVcHN0cmVhbSBjb25uZWN0aW9uIGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIFVSTCBwcm94eSBlcnJvcjonLCBlKTtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU2RDQxXHU1RjBGXHU0RUUzXHU3NDA2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9Qcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXM6IFVSTFNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHIpO1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFyYW1zLmdldCgncGF0aCcpO1xuICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHBhdGggcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU1M0VBXHU1MTQxXHU4QkI4XHU2MzA3XHU1QjlBXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUocmVsYXRpdmVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogdW5zdXBwb3J0ZWQgYXVkaW8gZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzk4MVx1NkI2Mlx1OERFRlx1NUY4NFx1N0E3Rlx1OEQ4QVxuICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IHBhdGgubm9ybWFsaXplKHJlbGF0aXZlUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcuLicpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTsgcmVzLmVuZCgnVmF1bHQgYmFzZSBwYXRoIG5vdCBjb25maWd1cmVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCBub3JtYWxpemVkKTtcbiAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnMuc3RhdChmdWxsUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7IHJlcy5lbmQoJ0ZpbGUgbm90IGZvdW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBzdGF0cy5zaXplLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3RyZWFtOiBmcy5SZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmdWxsUGF0aCk7XG4gICAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIHJlcy5lbmQoJ1N0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gcHJveHkgZXJyb3I6JywgZSk7XG4gICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTY3RTVcdTYyN0VcdTUzRUZcdTc1MjhcdTdBRUZcdTUzRTMgKi9cbiAgcHJpdmF0ZSBmaW5kRnJlZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgc2VydmVyLmxpc3RlbigwLCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3J0ID0gKHNlcnZlci5hZGRyZXNzKCkgYXMgbmV0LkFkZHJlc3NJbmZvKS5wb3J0O1xuICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4gcmVzb2x2ZShwb3J0KSk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59IiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSBCYW1ib29SZXZpZXdQbHVnaW4gZnJvbSAnLi4vLi4vbWFpbic7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5cbi8qKiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTYzQTVcdTUzRTMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFtYm9vUmV2aWV3U2V0dGluZ3Mge1xuICAvKiogXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU2ODM5XHU4REVGXHU1Rjg0ICovXG4gIGRhdGFQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxICovXG4gIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcbiAgLyoqIFx1Njc3Rlx1NTc1N1x1N0JBMVx1NzQwNlx1OTE0RFx1N0Y2RVx1RkYwOFx1NTNFRlx1ODlDMVx1NjAyNyArIFx1NjM5Mlx1NUU4Rlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RSB3ZWJhcHAgaWZyYW1lIGxvY2FsU3RvcmFnZSBcdTRFMERcdTUzRUZcdTk3NjBcdTY1RjZcdTYzMDFcdTRFNDVcdTUzMTYgKi9cbiAgc2VjdGlvbkNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5ICovXG4gIHRoZW1lUGF0aDogc3RyaW5nO1xuICAvKiogXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzXHVGRjA5ICovXG4gIG5vaXNlUGF0aDogc3RyaW5nO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU1MjE3XHU4ODY4XHVGRjA4XHU5MDFBXHU4RkM3XHU2ODY1XHU2M0E1XHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjBDXHU1MTRCXHU2NzBEIGxvY2FsU3RvcmFnZSBwb3J0LXNjb3BlZCBcdTk1RUVcdTk4OThcdUZGMDkgKi9cbiAgbm9pc2VJdGVtczogdW5rbm93bltdO1xuICAvKiogXHU2NjJGXHU1NDI2XHU1QzA2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyICovXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEJhbWJvb1Jldmlld1NldHRpbmdzID0ge1xuICBkYXRhUGF0aDogJ2JhbWJvby1yZXZpZXcnLFxuICBlbmFibGVNYXJrZG93blN5bmM6IHRydWUsXG4gIHNlY3Rpb25Db25maWc6IG51bGwsXG4gIHRoZW1lUGF0aDogJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcsXG4gIG5vaXNlUGF0aDogJycsXG4gIG5vaXNlSXRlbXM6IFtdLFxuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGZhbHNlLFxufTtcblxuLyoqXG4gKiBQbHVnaW5TZXR0aW5ncyAtIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2V0dGluZ3MgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctc2V0dGluZ3MnKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgLSBcdThCQkVcdTdGNkUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyA9PT0gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODRcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NTcyOCBWYXVsdCBcdTRFMkRcdTc2ODRcdTVCNThcdTUwQThcdTc2RUVcdTVGNTVcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2JhbWJvby1yZXZpZXcnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aCA9IHZhbHVlIHx8ICdiYW1ib28tcmV2aWV3JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gTWFya2Rvd24gXHU2NDU4XHU4OTgxXHU1NDBDXHU2QjY1XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MScpXG4gICAgICAuc2V0RGVzYygnXHU2QkNGXHU2QjIxXHU0RkREXHU1QjU4XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1NzI4IHJldmlld3MvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzUxRlx1NjIxMFx1NTNFRlx1OEJGQlx1NzY4NCAubWQgXHU2NTg3XHU0RUY2JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTVCNThcdTY1M0VcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggLmpzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aCA9IHZhbHVlIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU3NjdEXHU1NjZBXHU5N0YzID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjMnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzknKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NjMwN1x1NUI5QVx1NTQwRVx1NEVDNVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1NTE4NVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1MzAwMlx1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NjU3NFx1NEUyQVx1NUU5M1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3NjdEXHU1NjZBXHU5N0YzIFx1NjIxNlx1NzU1OVx1N0E3QVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5MycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGggPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NUMwNlx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDd2ViYXBwIFx1NTE4NVx1NjBBQ1x1NkQ2RVx1ODNEQ1x1NTM1NVx1NzY4NFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdThDMDNcdTgyNzJcdTRGMUFcdTVCOUVcdTY1RjZcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU3Njg0XHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHU5MTREXHU4MjcyJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJhbWJvby1yZXZpZXctZnJhbWUnKTtcbiAgICAgICAgICAgIGlmIChmcmFtZT8uY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgZW5hYmxlZDogdmFsdWUgfVxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gXHU1MTczXHU0RThFXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NTE3M1x1NEU4RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMVx1RkYxQVx1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBwbHVnaW5Cb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnQmFtYm9vIEltbW9ydGFsc1x1RkYwOFx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1RkYwOVx1NjYyRlx1NEUwMFx1NkIzRVx1NTdGQVx1NEU4RVx1ODJDRlx1ODA1NFx1NjNBN1x1NTIzNlx1OEJCQVx1NEU0Qlx1NzIzNlx1N0VGNFx1NTE0Qlx1NjI1OFx1MDBCN1x1NjgzQ1x1NTM2Mlx1NEVDMFx1NzlEMVx1NTkyQlx1NjNEMFx1NTFGQVx1NzY4NFwiT0dBU1wiXHU3NDA2XHU1RkY1XHVGRjBDXHU0RTEzXHU0RTNBXHU0RTJBXHU0RUJBXHU2MjUzXHU5MDIwXHU3Njg0XHU0RTJEXHU1NkZEXHU5OENFXHU3NkVFXHU2ODA3XHU4MUVBXHU1MkE4XHU1MzE2XHU1MjA2XHU5MTREXHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGXHUzMDAyJyxcbiAgICAgIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJ1xuICAgIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAyXHVGRjFBXHU0RjVDXHU4MDA1ICsgXHU0RjVDXHU1NEMxIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IGF1dGhvckJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkIGJhbWJvby1hYm91dC1hdXRob3InIH0pO1xuICAgIGNvbnN0IGF1dGhvclJvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvdycgfSk7XG4gICAgY29uc3QgYXZhdGFyID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdmF0YXInIH0pO1xuICAgIC8vIFx1NEVDRVx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NVx1OEJGQlx1NTNENlx1NTkzNFx1NTBDRlx1NjU4N1x1NEVGNlx1RkYwOFx1OTA3Rlx1NTE0RFx1OEZDN1x1OTU3Rlx1NzY4NCBiYXNlNjQgXHU4OEFCIE9ic2lkaWFuIFx1NjIyQVx1NjVBRFx1NUJGQ1x1ODFGNFx1N0E3QVx1NzY3RFx1RkYwOVxuICAgIC8vIFx1NEYxOFx1NTE0OFx1OEJGQlx1NjNEMlx1NEVGNlx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOGRldi9CUkFUXHVGRjA5XHVGRjBDXHU1MTc2XHU2QjIxXHU0RUNFIHdlYmFwcCBcdThENDRcdTZFOTBcdTRFMkRcdThCRkJcdTUzRDZcdUZGMDhcdTYzRDJcdTRFRjZcdTVFMDJcdTU3M0FcdTVCODlcdTg4QzVcdUZGMDlcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGx1Z2luRGlyID0gKHRoaXMucGx1Z2luLm1hbmlmZXN0IGFzIGFueSkuZGlyO1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIGFueSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgICAgICBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnYXV0aG9yLWF2YXRhci5qcGcnKSwgICAgICAgICAgICAgICAvLyBkZXYgLyBCUkFUIC8gcmVsZWFzZSBhc3NldFxuICAgICAgICBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnd2ViYXBwJywgJ2Fzc2V0cycsICdpbWFnZXMnLCAnYXV0aG9yLWF2YXRhci5qcGcnKSwgLy8gd2ViYXBwIFx1NTE4NVx1N0Y2RVxuICAgICAgXTtcbiAgICAgIGZvciAoY29uc3QgYXZhdGFyUGF0aCBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGF2YXRhclBhdGgpKSB7XG4gICAgICAgICAgY29uc3QgYXZhdGFyRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhdmF0YXJQYXRoKTtcbiAgICAgICAgICBjb25zdCBiNjQgPSBhdmF0YXJEYXRhLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgICBhdmF0YXIuc2V0Q3NzU3R5bGVzKHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYHVybChkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCR7YjY0fSlgLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7IC8qIHNpbGVudGx5IHNraXAgXHUyMDE0IHNob3cgZGVmYXVsdCBlbXB0eSBhdmF0YXIgKi8gfVxuXG5cbiAgICBjb25zdCBhdXRob3JJbmZvID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItaW5mbycgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1N0ZCRFx1OUNERVx1NTQxQicsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItbmFtZScgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NTVCNVx1NUI1N1x1OTk4Nlx1NTIxQlx1NTlDQlx1NEVCQScsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm9sZScgfSk7XG5cbiAgICAvLyBcdTRGNUNcdTU0QzFcdTUzM0FcbiAgICBhdXRob3JCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTRGNUNcdTU0QzEnLCBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3MtbGFiZWwnIH0pO1xuICAgIGNvbnN0IHdvcmtzUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1yb3cnIH0pO1xuXG4gICAgW3sgbmFtZTogJ1x1N0FGOVx1NTNGNlx1OThERVx1NTIwMycsIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLUJhbWJvby1EYXJ0cycgfSxcbiAgICAgeyBuYW1lOiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscycgfV0uZm9yRWFjaCh3b3JrID0+IHtcbiAgICAgIGNvbnN0IHRhZyA9IHdvcmtzUm93LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiB3b3JrLm5hbWUsIGNsczogJ2JhbWJvby1hYm91dC10YWcnIH0pO1xuICAgICAgaWYgKHdvcmsudXJsKSB7XG4gICAgICAgIHRhZy5zZXRDc3NTdHlsZXMoeyBjdXJzb3I6ICdwb2ludGVyJyB9KTtcbiAgICAgICAgdGFnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5vcGVuKHdvcmsudXJsLCAnX2JsYW5rJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGXG4gICAgY29uc3QgY29udGFjdEJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU5MEFFXHU3QkIxXHVGRjFBeWFueXVsaW4yMTAwQHFxLmNvbScsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1RkFFXHU0RkUxXHVGRjFBeWFuaHU5NCcsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQXNDO0FBQ3RDLElBQUFDLFFBQXNCO0FBQ3RCLElBQUFDLE1BQW9CO0FBQ3BCLFdBQXNCO0FBQ3RCLElBQUFDLFNBQXVCOzs7QUNKdkIsSUFBQUMsbUJBQXdDO0FBQ3hDLElBQUFDLFFBQXNCO0FBQ3RCLElBQUFDLE1BQW9COzs7QUNGcEIsc0JBQTBDO0FBY25DLElBQU0sZUFBTixNQUFtQjtBQUFBLEVBSXhCLFlBQVksS0FBVSxXQUFXLGlCQUFpQjtBQUNoRCxTQUFLLE1BQU07QUFDWCxTQUFLLGVBQVcsK0JBQWMsUUFBUTtBQUFBLEVBQ3hDO0FBQUE7QUFBQSxFQUdBLE1BQWMsVUFBVSxLQUE0QjtBQUNsRCxVQUFNQyxZQUFPLCtCQUFjLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxFQUFFO0FBQ3BELFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBT0EsS0FBSSxHQUFJO0FBQ2hELFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxNQUFNQSxLQUFJO0FBQUEsSUFDekM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sa0JBQWlDO0FBQ3JDLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxLQUFLLFFBQVEsR0FBSTtBQUN6RCxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsTUFBTSxLQUFLLFFBQVE7QUFBQSxJQUNsRDtBQUNBLFVBQU0sS0FBSyxVQUFVLE1BQU07QUFDM0IsVUFBTSxLQUFLLFVBQVUsU0FBUztBQUFBLEVBQ2hDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRQSxNQUFjLFdBQVdBLE9BQWMsU0FBZ0M7QUFDckUsVUFBTSxpQkFBYSwrQkFBY0EsS0FBSTtBQUNyQyxVQUFNLFdBQVcsS0FBSyxJQUFJLE1BQU0sc0JBQXNCLFVBQVU7QUFFaEUsUUFBSSxvQkFBb0IsdUJBQU87QUFDN0IsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLFVBQVUsTUFBTSxPQUFPO0FBQ3BEO0FBQUEsSUFDRjtBQUVBLFVBQU0sYUFBYSxXQUFXLFVBQVUsR0FBRyxXQUFXLFlBQVksR0FBRyxDQUFDO0FBQ3RFLFFBQUksY0FBYyxDQUFFLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLFVBQVUsR0FBSTtBQUNwRSxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsTUFBTSxVQUFVO0FBQUEsSUFDL0M7QUFFQSxRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLFVBQVUsR0FBRztBQUNuRCxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxVQUFVO0FBQUEsSUFDaEQ7QUFFQSxVQUFNLEtBQUssSUFBSSxNQUFNLE9BQU8sWUFBWSxPQUFPO0FBQUEsRUFDakQ7QUFBQTtBQUFBLEVBSVEsUUFBUSxTQUF5QjtBQUN2QyxlQUFPLCtCQUFjLEdBQUcsS0FBSyxRQUFRLFNBQVMsT0FBTyxPQUFPO0FBQUEsRUFDOUQ7QUFBQSxFQUVBLE1BQU0sT0FBTyxTQUFtQztBQUM5QyxVQUFNQSxRQUFPLEtBQUssUUFBUSxPQUFPO0FBQ2pDLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBT0EsS0FBSSxHQUFJO0FBQ2hELGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSTtBQUNGLFlBQU0sVUFBa0IsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUtBLEtBQUk7QUFDOUQsYUFBTyxLQUFLLE1BQU0sT0FBTztBQUFBLElBQzNCLFNBQVMsR0FBRztBQUNWLGNBQVEsS0FBSyw0RkFBZ0NBLEtBQUksSUFBSSxDQUFDO0FBQ3RELGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxhQUEyQztBQUMvQyxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQzNCLFVBQU0sY0FBVSwrQkFBYyxHQUFHLEtBQUssUUFBUSxPQUFPO0FBQ3JELFVBQU0sUUFBUSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxPQUFPO0FBQ3ZELFVBQU0sT0FBNEIsQ0FBQztBQUVuQyxVQUFNLFFBQVEsTUFBTSxNQUNqQixPQUFPLE9BQUssRUFBRSxTQUFTLE9BQU8sQ0FBQyxFQUMvQixJQUFJLE9BQU8sU0FBUztBQUNuQixZQUFNLFVBQVUsS0FBSyxNQUFNLEdBQUcsRUFBRSxJQUFJLEdBQUcsUUFBUSxTQUFTLEVBQUU7QUFDMUQsVUFBSSxDQUFDLFFBQVM7QUFDZCxVQUFJO0FBQ0YsY0FBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELGFBQUssT0FBTyxJQUFJLEtBQUssTUFBTSxPQUFPO0FBQUEsTUFDcEMsU0FBUyxHQUFHO0FBQ1YsZ0JBQVEsS0FBSyw2QkFBNkIsSUFBSSxJQUFJLENBQUM7QUFBQSxNQUNyRDtBQUFBLElBQ0YsQ0FBQztBQUVILFVBQU0sUUFBUSxJQUFJLEtBQUs7QUFDdkIsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBLEVBR0EsTUFBTSxhQUFnQztBQUNwQyxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQzNCLFVBQU0sY0FBVSwrQkFBYyxHQUFHLEtBQUssUUFBUSxPQUFPO0FBQ3JELFVBQU0sUUFBUSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxPQUFPO0FBQ3ZELFVBQU0sT0FBaUIsQ0FBQztBQUN4QixlQUFXLFFBQVEsTUFBTSxPQUFPO0FBQzlCLFVBQUksS0FBSyxTQUFTLE9BQU8sR0FBRztBQUMxQixjQUFNLFVBQVUsS0FBSyxNQUFNLEdBQUcsRUFBRSxJQUFJLEdBQUcsUUFBUSxTQUFTLEVBQUU7QUFDMUQsWUFBSSxRQUFTLE1BQUssS0FBSyxPQUFPO0FBQUEsTUFDaEM7QUFBQSxJQUNGO0FBQ0EsU0FBSyxLQUFLLEVBQUUsUUFBUTtBQUNwQixXQUFPO0FBQUEsRUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsTUFBTSxpQkFBaUIsT0FBTyxHQUFHLFdBQVcsSUFPekM7QUFDRCxVQUFNLFVBQVUsTUFBTSxLQUFLLFdBQVc7QUFDdEMsVUFBTSxRQUFRLFFBQVE7QUFDdEIsVUFBTSxRQUFRLE9BQU87QUFDckIsVUFBTSxXQUFXLFFBQVEsTUFBTSxPQUFPLFFBQVEsUUFBUTtBQUN0RCxVQUFNLE9BQTRCLENBQUM7QUFFbkMsVUFBTSxRQUFRLFNBQVMsSUFBSSxPQUFPLFlBQVk7QUFDNUMsVUFBSTtBQUNGLGNBQU0sT0FBTyxNQUFNLEtBQUssT0FBTyxPQUFPO0FBQ3RDLFlBQUksS0FBTSxNQUFLLE9BQU8sSUFBSTtBQUFBLE1BQzVCLFNBQVMsR0FBRztBQUNWLGdCQUFRLEtBQUssdUJBQXVCLE9BQU8sSUFBSSxDQUFDO0FBQUEsTUFDbEQ7QUFBQSxJQUNGLENBQUM7QUFDRCxVQUFNLFFBQVEsSUFBSSxLQUFLO0FBRXZCLFdBQU87QUFBQSxNQUNMO0FBQUEsTUFDQSxNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTLFFBQVEsU0FBUyxTQUFTO0FBQUEsSUFDckM7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLE9BQU8sU0FBaUQ7QUFDNUQsVUFBTSxLQUFLLFVBQVUsTUFBTTtBQUMzQixVQUFNLFVBQVUsUUFBUTtBQUN4QixRQUFJLENBQUMsU0FBUztBQUNaLFlBQU0sSUFBSSxNQUFNLGdDQUFnQztBQUFBLElBQ2xEO0FBQ0EsVUFBTUEsUUFBTyxLQUFLLFFBQVEsT0FBTztBQUNqQyxVQUFNLEtBQUssV0FBV0EsT0FBTSxLQUFLLFVBQVUsU0FBUyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQzlEO0FBQUEsRUFFQSxNQUFNLFVBQVUsU0FBZ0M7QUFDOUMsVUFBTUEsUUFBTyxLQUFLLFFBQVEsT0FBTztBQUNqQyxRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPQSxLQUFJLEdBQUc7QUFDN0MsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU9BLEtBQUk7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBSVEsWUFBb0I7QUFDMUIsZUFBTywrQkFBYyxHQUFHLEtBQUssUUFBUSxhQUFhO0FBQUEsRUFDcEQ7QUFBQSxFQUVBLE1BQU0sV0FBMkI7QUFDL0IsVUFBTUEsUUFBTyxLQUFLLFVBQVU7QUFDNUIsUUFBSSxDQUFFLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPQSxLQUFJLEdBQUk7QUFDaEQsYUFBTyxDQUFDO0FBQUEsSUFDVjtBQUNBLFVBQU0sVUFBa0IsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUtBLEtBQUk7QUFDOUQsV0FBTyxLQUFLLE1BQU0sT0FBTztBQUFBLEVBQzNCO0FBQUEsRUFFQSxNQUFNLFNBQVMsT0FBaUM7QUFDOUMsVUFBTUEsUUFBTyxLQUFLLFVBQVU7QUFDNUIsVUFBTSxLQUFLLFdBQVdBLE9BQU0sS0FBSyxVQUFVLE9BQU8sTUFBTSxDQUFDLENBQUM7QUFBQSxFQUM1RDtBQUFBO0FBQUEsRUFJUSxlQUF1QjtBQUM3QixlQUFPLCtCQUFjLEdBQUcsS0FBSyxRQUFRLGdCQUFnQjtBQUFBLEVBQ3ZEO0FBQUEsRUFFQSxNQUFNLFdBQVcsS0FBK0I7QUFDOUMsVUFBTSxXQUFXLE1BQU0sS0FBSyxlQUFlO0FBQzNDLFdBQU8sU0FBUyxHQUFHLEtBQUs7QUFBQSxFQUMxQjtBQUFBLEVBRUEsTUFBTSxXQUFXLEtBQWEsT0FBK0I7QUFDM0QsVUFBTUEsWUFBTywrQkFBYyxLQUFLLGFBQWEsQ0FBQztBQUM5QyxVQUFNLFdBQVcsS0FBSyxJQUFJLE1BQU0sc0JBQXNCQSxLQUFJO0FBRTFELFFBQUksb0JBQW9CLHVCQUFPO0FBRTdCLFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxVQUFVLENBQUMsU0FBUztBQUMvQyxjQUFNLFdBQW9DLEtBQUssTUFBTSxJQUFJO0FBQ3pELGlCQUFTLEdBQUcsSUFBSTtBQUNoQixlQUFPLEtBQUssVUFBVSxVQUFVLE1BQU0sQ0FBQztBQUFBLE1BQ3pDLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxZQUFNLEtBQUssV0FBV0EsT0FBTSxLQUFLLFVBQVUsRUFBRSxDQUFDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFBQSxJQUN2RTtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0saUJBQStDO0FBQ25ELFVBQU1BLFFBQU8sS0FBSyxhQUFhO0FBQy9CLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBT0EsS0FBSSxHQUFJO0FBQ2hELGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFDQSxRQUFJO0FBQ0YsWUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBS0EsS0FBSTtBQUM5RCxhQUFPLEtBQUssTUFBTSxPQUFPO0FBQUEsSUFDM0IsUUFBUTtBQUNOLGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUlRLHNCQUE4QjtBQUNwQyxlQUFPLCtCQUFjLEdBQUcsS0FBSyxRQUFRLHdCQUF3QjtBQUFBLEVBQy9EO0FBQUEsRUFFQSxNQUFNLHFCQUF1QztBQUMzQyxVQUFNQSxRQUFPLEtBQUssb0JBQW9CO0FBQ3RDLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBT0EsS0FBSSxHQUFJO0FBQ2hELGFBQU87QUFBQSxJQUNUO0FBQ0EsVUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBS0EsS0FBSTtBQUM5RCxXQUFPLEtBQUssTUFBTSxPQUFPO0FBQUEsRUFDM0I7QUFBQSxFQUVBLE1BQU0sbUJBQW1CLE1BQThCO0FBQ3JELFVBQU1BLFFBQU8sS0FBSyxvQkFBb0I7QUFDdEMsVUFBTSxLQUFLLFdBQVdBLE9BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFBQSxFQUMzRDtBQUFBO0FBQUEsRUFJUSxvQkFBNEI7QUFDbEMsZUFBTywrQkFBYyxHQUFHLEtBQUssUUFBUSxzQkFBc0I7QUFBQSxFQUM3RDtBQUFBLEVBRUEsTUFBTSxtQkFBcUM7QUFDekMsVUFBTUEsUUFBTyxLQUFLLGtCQUFrQjtBQUNwQyxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU9BLEtBQUksR0FBSTtBQUNoRCxhQUFPO0FBQUEsSUFDVDtBQUNBLFVBQU0sVUFBa0IsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUtBLEtBQUk7QUFDOUQsV0FBTyxLQUFLLE1BQU0sT0FBTztBQUFBLEVBQzNCO0FBQUEsRUFFQSxNQUFNLGlCQUFpQixNQUE4QjtBQUNuRCxVQUFNQSxRQUFPLEtBQUssa0JBQWtCO0FBQ3BDLFVBQU0sS0FBSyxXQUFXQSxPQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQUEsRUFDM0Q7QUFBQTtBQUFBLEVBSUEsTUFBTSxnQkFBOEI7QUFDbEMsVUFBTSxDQUFDLE1BQU0sT0FBTyxVQUFVLGlCQUFpQixhQUFhLElBQUksTUFBTSxRQUFRLElBQUk7QUFBQSxNQUNoRixLQUFLLFdBQVc7QUFBQSxNQUNoQixLQUFLLFNBQVM7QUFBQSxNQUNkLEtBQUssZUFBZTtBQUFBLE1BQ3BCLEtBQUssbUJBQW1CO0FBQUEsTUFDeEIsS0FBSyxpQkFBaUI7QUFBQSxJQUN4QixDQUFDO0FBRUQsV0FBTztBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsYUFBWSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLE1BQ25DLGFBQWE7QUFBQSxNQUNiO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0EsUUFBUSxDQUFDO0FBQUEsTUFDVCxTQUFTLENBQUM7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxXQUFXLE1BQThDO0FBQzdELFVBQU0sS0FBSyxnQkFBZ0I7QUFFM0IsUUFBSSxLQUFLLE1BQU07QUFDYixpQkFBVyxPQUFPLE9BQU8sT0FBTyxLQUFLLElBQUksR0FBRztBQUMxQyxjQUFNLEtBQUssT0FBTyxHQUFHO0FBQUEsTUFDdkI7QUFBQSxJQUNGO0FBQ0EsUUFBSSxLQUFLLE9BQU87QUFDZCxZQUFNLEtBQUssU0FBUyxLQUFLLEtBQWM7QUFBQSxJQUN6QztBQUNBLFFBQUksS0FBSyxVQUFVO0FBQ2pCLGlCQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssT0FBTyxRQUFRLEtBQUssUUFBUSxHQUFHO0FBQ3hELGNBQU0sS0FBSyxXQUFXLEtBQUssS0FBSztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUNBLFFBQUksS0FBSyxpQkFBaUI7QUFDeEIsWUFBTSxLQUFLLG1CQUFtQixLQUFLLGVBQWU7QUFBQSxJQUNwRDtBQUNBLFFBQUksS0FBSyxlQUFlO0FBQ3RCLFlBQU0sS0FBSyxpQkFBaUIsS0FBSyxhQUFhO0FBQUEsSUFDaEQ7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLFdBQTBCO0FBQzlCLFFBQUksTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sS0FBSyxRQUFRLEdBQUc7QUFDdEQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sS0FBSyxVQUFVLElBQUk7QUFBQSxJQUN4RDtBQUNBLFVBQU0sS0FBSyxnQkFBZ0I7QUFBQSxFQUM3QjtBQUFBO0FBQUEsRUFJUSxXQUFXLFNBQXlCO0FBQzFDLGVBQU8sK0JBQWMsR0FBRyxLQUFLLFFBQVEsWUFBWSxPQUFPLEtBQUs7QUFBQSxFQUMvRDtBQUFBLEVBRUEsTUFBTSxvQkFBb0IsU0FBaUIsVUFBaUM7QUFDMUUsVUFBTSxLQUFLLFVBQVUsU0FBUztBQUM5QixVQUFNQSxRQUFPLEtBQUssV0FBVyxPQUFPO0FBQ3BDLFVBQU0sS0FBSyxXQUFXQSxPQUFNLFFBQVE7QUFBQSxFQUN0QztBQUFBLEVBRUEsTUFBTSxxQkFBcUIsU0FBZ0M7QUFDekQsVUFBTUEsUUFBTyxLQUFLLFdBQVcsT0FBTztBQUNwQyxRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPQSxLQUFJLEdBQUc7QUFDN0MsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU9BLEtBQUk7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFDRjs7O0FDdFVPLElBQU0sZUFBTixNQUFtQjtBQUFBO0FBQUEsRUFFeEIsT0FBTyxpQkFBaUIsTUFBdUI7QUFDN0MsVUFBTSxRQUFrQixDQUFDO0FBR3pCLFVBQU0sS0FBSyxLQUFLO0FBQ2hCLFVBQU0sS0FBSyxVQUFVLEtBQUssSUFBSSxHQUFHO0FBQ2pDLFVBQU0sS0FBSyxhQUFhLEtBQUssT0FBTyxHQUFHO0FBQ3ZDLFVBQU0sS0FBSyx3QkFBd0I7QUFDbkMsVUFBTSxLQUFLLEtBQUs7QUFDaEIsVUFBTSxLQUFLLEVBQUU7QUFHYixVQUFNLEtBQUssS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLE9BQU8sY0FBSTtBQUM3QyxVQUFNLEtBQUssRUFBRTtBQUdiLFFBQUksS0FBSyxTQUFTO0FBQ2hCLFlBQU0sS0FBSyxpQkFBTztBQUNsQixZQUFNLElBQUksS0FBSztBQUNmLFlBQU0sUUFBa0IsQ0FBQztBQUN6QixVQUFJLEVBQUUsYUFBYyxPQUFNLEtBQUssNkJBQVMsRUFBRSxZQUFZLEVBQUU7QUFDeEQsVUFBSSxFQUFFLFlBQWEsT0FBTSxLQUFLLDZCQUFTLEVBQUUsV0FBVyxFQUFFO0FBQ3RELFVBQUksRUFBRSxlQUFnQixPQUFNLEtBQUssNkJBQVMsRUFBRSxjQUFjLEVBQUU7QUFDNUQsVUFBSSxFQUFFLGlCQUFrQixPQUFNLEtBQUssaUJBQU8sRUFBRSxnQkFBZ0IsRUFBRTtBQUM5RCxVQUFJLEVBQUUsV0FBWSxPQUFNLEtBQUssNkJBQVMsRUFBRSxVQUFVLEVBQUU7QUFDcEQsVUFBSSxFQUFFLFdBQVksT0FBTSxLQUFLLDZCQUFTLEVBQUUsVUFBVSxFQUFFO0FBRXBELFVBQUksTUFBTSxTQUFTLEdBQUc7QUFDcEIsY0FBTSxLQUFLLEtBQUssTUFBTSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDL0MsWUFBSSxNQUFNLFNBQVMsR0FBRztBQUNwQixnQkFBTSxLQUFLLEtBQUssTUFBTSxNQUFNLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQUEsUUFDOUM7QUFBQSxNQUNGO0FBQ0EsWUFBTSxLQUFLLEVBQUU7QUFBQSxJQUNmO0FBR0EsUUFBSSxLQUFLLFlBQVksS0FBSyxTQUFTLFNBQVMsR0FBRztBQUM3QyxZQUFNLEtBQUssdUJBQVE7QUFDbkIsaUJBQVcsU0FBUyxLQUFLLFVBQVU7QUFDakMsY0FBTSxPQUFPLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxNQUFNO0FBQzdDLGNBQU0sS0FBSyxPQUFPLElBQUksR0FBRyxNQUFNLElBQUksS0FBSyxNQUFNLElBQUksR0FBRztBQUNyRCxZQUFJLE1BQU0sT0FBTztBQUNmLHFCQUFXLFFBQVEsTUFBTSxPQUFPO0FBQzlCLGtCQUFNLFVBQVUsS0FBSyxPQUFPLE1BQU0sS0FBSyxJQUFJLEtBQUs7QUFDaEQsa0JBQU0sS0FBSyxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssSUFBSSxHQUFHLE9BQU8sRUFBRTtBQUFBLFVBQ3BEO0FBQUEsUUFDRjtBQUNBLGNBQU0sS0FBSyxFQUFFO0FBQUEsTUFDZjtBQUFBLElBQ0Y7QUFHQSxRQUFJLEtBQUssU0FBUyxLQUFLLE1BQU0sU0FBUyxHQUFHO0FBQ3ZDLFlBQU0sS0FBSyw2QkFBUztBQUNwQixpQkFBVyxRQUFRLEtBQUssT0FBTztBQUM3QixjQUFNLE9BQU8sS0FBSyxPQUFPLEdBQUcsS0FBSyxJQUFJLE1BQU07QUFDM0MsY0FBTSxLQUFLLE9BQU8sSUFBSSxHQUFHLEtBQUssS0FBSyxFQUFFO0FBQ3JDLFlBQUksS0FBSyxPQUFPO0FBQ2QscUJBQVcsUUFBUSxLQUFLLE9BQU87QUFDN0Isa0JBQU0sVUFBVSxLQUFLLFlBQVksU0FBWSxJQUFJLEtBQUssT0FBTyxNQUFNO0FBQ25FLGtCQUFNLFNBQVMsS0FBSyxTQUFTLEtBQUssS0FBSyxNQUFNLE1BQU07QUFDbkQsa0JBQU0sS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLE9BQU8sR0FBRyxNQUFNLEVBQUU7QUFBQSxVQUNoRDtBQUFBLFFBQ0Y7QUFDQSxjQUFNLEtBQUssRUFBRTtBQUFBLE1BQ2Y7QUFBQSxJQUNGO0FBRUEsV0FBTyxNQUFNLEtBQUssSUFBSTtBQUFBLEVBQ3hCO0FBQ0Y7OztBQ2pHTyxJQUFNLGdCQUFOLE1BQW9CO0FBQUEsRUFJekIsWUFBWSxTQUF1QixxQkFBcUIsTUFBTTtBQUM1RCxTQUFLLFVBQVU7QUFDZixTQUFLLHFCQUFxQjtBQUFBLEVBQzVCO0FBQUEsRUFFQSxNQUFNLE9BQU8sU0FBNkM7QUFDeEQsWUFBUSxRQUFRLE1BQU07QUFBQSxNQUNwQixLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxPQUFPLFFBQVEsUUFBUSxPQUFPO0FBQUEsTUFFMUQsS0FBSyxvQkFBb0I7QUFDdkIsY0FBTSxTQUFTLE1BQU0sS0FBSyxRQUFRLE9BQU8sUUFBUSxRQUFRLElBQStCO0FBRXhGLFlBQUksS0FBSyxzQkFBc0IsUUFBUSxRQUFRLE1BQU07QUFDbkQsY0FBSTtBQUNGLGtCQUFNLEtBQUssYUFBYSxpQkFBaUIsUUFBUSxRQUFRLElBQStCO0FBQ3hGLGtCQUFNLEtBQUssUUFBUSxvQkFBb0IsUUFBUSxRQUFRLFNBQVMsRUFBRTtBQUFBLFVBQ3BFLFNBQVMsR0FBRztBQUNWLG9CQUFRLEtBQUsseUJBQXlCLENBQUM7QUFBQSxVQUN6QztBQUFBLFFBQ0Y7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUFBLE1BRUEsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsV0FBVztBQUFBLE1BRXZDLEtBQUsscUJBQXFCO0FBQ3hCLGNBQU0sS0FBSyxRQUFRLHFCQUFxQixRQUFRLFFBQVEsT0FBTztBQUMvRCxlQUFPLE1BQU0sS0FBSyxRQUFRLFVBQVUsUUFBUSxRQUFRLE9BQU87QUFBQSxNQUM3RDtBQUFBLE1BRUEsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsV0FBVyxRQUFRLFFBQVEsR0FBRztBQUFBLE1BRTFELEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFdBQVcsUUFBUSxRQUFRLEtBQUssUUFBUSxRQUFRLEtBQUs7QUFBQSxNQUVqRixLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxlQUFlO0FBQUEsTUFFM0MsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsU0FBUztBQUFBLE1BRXJDLEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFNBQVMsUUFBUSxRQUFRLEtBQUs7QUFBQSxNQUUxRCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxtQkFBbUI7QUFBQSxNQUUvQyxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxtQkFBbUIsUUFBUSxRQUFRLElBQUk7QUFBQSxNQUVuRSxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxpQkFBaUI7QUFBQSxNQUU3QyxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxpQkFBaUIsUUFBUSxRQUFRLElBQUk7QUFBQSxNQUVqRSxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxXQUFXO0FBQUEsTUFFdkMsS0FBSyw0QkFBNEI7QUFDL0IsY0FBTSxtQkFBbUIsUUFBUTtBQUNqQyxlQUFPLE1BQU0sS0FBSyxRQUFRO0FBQUEsVUFDeEIsaUJBQWlCLFFBQVE7QUFBQSxVQUN6QixpQkFBaUIsWUFBWTtBQUFBLFFBQy9CO0FBQUEsTUFDRjtBQUFBLE1BRUEsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsY0FBYztBQUFBLE1BRTFDLEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFdBQVcsUUFBUSxRQUFRLElBQUk7QUFBQSxNQUUzRCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxTQUFTO0FBQUEsTUFFckM7QUFDRSxjQUFNLElBQUksTUFBTSxpQ0FBaUMsUUFBUSxJQUFJLEVBQUU7QUFBQSxJQUNuRTtBQUFBLEVBQ0Y7QUFDRjs7O0FDekZPLElBQU0sZUFBTixNQUFNLGFBQVk7QUFBQSxFQUFsQjtBQUNILFNBQVEsU0FBbUM7QUFDM0MsU0FBUSxpQkFBaUI7QUFDekIsU0FBUSxvQkFBMEQ7QUFBQTtBQUFBLEVBZ0JwRSxhQUFhLFFBQWlDO0FBQzVDLFNBQUssU0FBUztBQUNkLFFBQUk7QUFDRixXQUFLLGlCQUFpQixJQUFJLElBQUksT0FBTyxHQUFHLEVBQUU7QUFBQSxJQUM1QyxRQUFRO0FBQ04sV0FBSyxpQkFBaUI7QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGVBQXFCO0FBQ25CLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUE7QUFBQSxFQUdRLGFBQXNCO0FBQzVCLFdBQU8sZUFBZSxLQUFLLFVBQVUsU0FBUyxZQUFZO0FBQUEsRUFDNUQ7QUFBQTtBQUFBLEVBR0EsWUFBa0I7QUFDaEIsUUFBSSxDQUFDLEtBQUssUUFBUSxjQUFlO0FBRWpDLFNBQUssT0FBTyxjQUFjO0FBQUEsTUFDeEI7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLElBQUksZ0JBQWdCLEtBQUssSUFBSTtBQUFBLFFBQzdCLFNBQVMsRUFBRSxRQUFRLEtBQUssV0FBVyxFQUFFO0FBQUEsTUFDdkM7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsaUJBQXVCO0FBQ3JCLFNBQUssVUFBVTtBQUFBLEVBQ2pCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsT0FBTyxvQkFBb0IsS0FBYSxpQkFBeUIsUUFBeUM7QUFDeEcsVUFBTSxJQUFJLEtBQUssTUFBTSxHQUFHO0FBQ3hCLFVBQU0sS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxlQUFlLENBQUM7QUFHdEQsVUFBTSxVQUFVO0FBQ2hCLFVBQU0sVUFBVSxTQUFTLEtBQUs7QUFDOUIsVUFBTSxTQUFTLE9BQU8sQ0FBQyxLQUFLLE9BQU8sTUFBTSxPQUFPO0FBQ2hELFVBQU0sY0FBYyxPQUFPLENBQUMsS0FBSyxPQUFPLE1BQU0sVUFBVSxDQUFDO0FBR3pELFVBQU0sTUFBTSxTQUFTLElBQUk7QUFDekIsVUFBTSxNQUFNLFNBQ1IsS0FBSyxJQUFJLEdBQUcsS0FBSyxLQUFLLEdBQUcsSUFDekIsS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLElBQUk7QUFDL0IsVUFBTSxZQUFZLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxHQUFHO0FBQzNDLFVBQU0sY0FBYyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sU0FBUyxNQUFNLElBQUksTUFBTSxDQUFDO0FBR3BFLFVBQU0sYUFBYSxTQUFTLE9BQU8sQ0FBQyxlQUFlLE9BQU8sQ0FBQztBQUMzRCxVQUFNLFlBQWEsU0FBUyxPQUFPLENBQUMsZUFBZSxPQUFPLENBQUM7QUFFM0QsV0FBTztBQUFBLE1BQ0wsd0JBQXdCO0FBQUEsTUFDeEIsOEJBQThCO0FBQUEsTUFDOUIsaUJBQWlCO0FBQUEsTUFDakIsd0JBQXdCO0FBQUEsTUFDeEIsMEJBQTBCO0FBQUEsTUFDMUIsaUJBQWlCO0FBQUEsTUFDakIsZ0JBQWdCO0FBQUEsSUFDbEI7QUFBQSxFQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLGFBQWEsS0FBYSxpQkFBeUIsUUFBdUI7QUFDeEUsUUFBSSxLQUFLLGtCQUFtQixRQUFPLGFBQWEsS0FBSyxpQkFBaUI7QUFDdEUsaUJBQVksY0FBYztBQUMxQixTQUFLLG9CQUFvQixPQUFPLFdBQVcsTUFBTTtBQUMvQyxVQUFJLGFBQVksWUFBYTtBQUM3QixZQUFNLE9BQU8sYUFBWSxvQkFBb0IsS0FBSyxpQkFBaUIsTUFBTTtBQUN6RSxpQkFBVyxDQUFDLEtBQUssS0FBSyxLQUFLLE9BQU8sUUFBUSxJQUFJLEdBQUc7QUFDL0MsdUJBQWUsS0FBSyxNQUFNLFlBQVksS0FBSyxLQUFLO0FBQUEsTUFDbEQ7QUFBQSxJQUNGLEdBQUcsRUFBRTtBQUFBLEVBQ1A7QUFBQTtBQUFBLEVBR0EsT0FBTyxrQkFBd0I7QUFDN0IsaUJBQVksY0FBYztBQUMxQixlQUFXLE9BQU8sYUFBWSxlQUFlO0FBQzNDLHFCQUFlLEtBQUssTUFBTSxlQUFlLEdBQUc7QUFBQSxJQUM5QztBQUFBLEVBQ0Y7QUFDRjtBQUFBO0FBdEhhLGFBTWUsZ0JBQWdCO0FBQUEsRUFDdEM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUFBO0FBZFMsYUFpQk0sY0FBYztBQWpCMUIsSUFBTSxjQUFOOzs7QUNMUCxTQUFvQjtBQUNwQixXQUFzQjs7O0FDQWYsSUFBTSwyQkFBMkI7QUFBQSxFQUN0QztBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQ3BFO0FBR0EsSUFBTSxtQkFBMkM7QUFBQSxFQUMvQyxRQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxTQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxTQUFTO0FBQUEsRUFDVCxTQUFTO0FBQ1g7QUFHTyxJQUFNLGFBQXFDO0FBQUEsRUFDaEQsU0FBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsT0FBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsVUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsR0FBRztBQUNMOzs7QUQxQkEsSUFBTSxvQkFBb0IsQ0FBQyxVQUFVLFFBQVEsY0FBYztBQVFwRCxJQUFNLGdCQUFOLE1BQW9CO0FBQUEsRUFhdkIsWUFDSSxlQUNBLGFBQ0EsVUFDQSxjQUNGO0FBZkYsU0FBUSxXQUF3QztBQUNoRCxTQUFRLGVBQTZDO0FBQ3JELFNBQVEsU0FBbUM7QUFDM0MsU0FBUSxpQkFBeUQ7QUFDakUsU0FBUSxlQUFzRCxDQUFDO0FBQy9ELFNBQVEsZ0JBQXdCO0FBQ2hDLFNBQVEsWUFBb0I7QUFDNUIsU0FBUSxZQUFvQjtBQUM1QixTQUFRLGlCQUFpQjtBQVFyQixTQUFLLGdCQUFnQjtBQUNyQixTQUFLLGNBQWM7QUFDbkIsU0FBSyxXQUFXLFlBQVk7QUFDNUIsU0FBSyxlQUFlLGdCQUFnQjtBQUFBLEVBQ3hDO0FBQUE7QUFBQSxFQUdGLE9BQU8sUUFBaUM7QUFFdEMsU0FBSyxPQUFPO0FBRVosU0FBSyxTQUFTO0FBQ2QsU0FBSyxZQUFZLGFBQWEsTUFBTTtBQUdwQyxRQUFJO0FBQ0YsV0FBSyxpQkFBaUIsSUFBSSxJQUFJLE9BQU8sR0FBRyxFQUFFO0FBQUEsSUFDNUMsUUFBUTtBQUNOLFdBQUssaUJBQWlCO0FBQUEsSUFDeEI7QUFFQSxTQUFLLGlCQUFpQixDQUFDLFVBQXdCO0FBQzdDLFdBQUssS0FBSyxVQUFVLEtBQUs7QUFBQSxJQUMzQjtBQUNBLFdBQU8saUJBQWlCLFdBQVcsS0FBSyxjQUFjO0FBQUEsRUFDeEQ7QUFBQTtBQUFBLEVBR0EsZ0JBQWdCLFFBQXFEO0FBQ25FLFNBQUssZUFBZTtBQUFBLEVBQ3RCO0FBQUE7QUFBQSxFQUdBLGlCQUFpQixVQUF3QjtBQUN2QyxTQUFLLGdCQUFnQjtBQUFBLEVBQ3ZCO0FBQUE7QUFBQSxFQUdBLGFBQWEsV0FBeUI7QUFDcEMsU0FBSyxZQUFZO0FBQUEsRUFDbkI7QUFBQTtBQUFBLEVBR0EsYUFBYSxLQUFtQjtBQUM5QixTQUFLLFlBQVk7QUFBQSxFQUNuQjtBQUFBO0FBQUEsRUFHQSxNQUFjLHFCQUFxQixXQUFXLEdBQThFO0FBQzFILFVBQU0sVUFBNEUsQ0FBQztBQUNuRixVQUFNLGNBQWM7QUFDcEIsVUFBTSxXQUFXLEtBQUs7QUFDdEIsUUFBSSxDQUFDLFNBQVUsUUFBTztBQUd0QixRQUFJO0FBQ0YsWUFBUyxZQUFTLEtBQUssUUFBUTtBQUFBLElBQ2pDLFFBQVE7QUFDTixhQUFPO0FBQUEsSUFDVDtBQUdBLFFBQUksS0FBSyxXQUFXO0FBQ2xCLFlBQU0sWUFBaUIsVUFBSyxVQUFVLEtBQUssU0FBUztBQUNwRCxVQUFJO0FBQ0YsY0FBTSxVQUF1QixNQUFTLFlBQVMsUUFBUSxXQUFXLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFDekYsbUJBQVcsU0FBUyxTQUFTO0FBQzNCLGNBQUksTUFBTSxLQUFLLFdBQVcsR0FBRyxFQUFHO0FBQ2hDLGNBQUksQ0FBQyxNQUFNLE9BQU8sRUFBRztBQUNyQixnQkFBTSxNQUFXLGFBQVEsTUFBTSxJQUFJLEVBQUUsWUFBWTtBQUNqRCxjQUFJLFlBQVksU0FBUyxHQUFHLEdBQUc7QUFDN0Isa0JBQU1DLFFBQWlCLE1BQVMsWUFBUyxLQUFVLFVBQUssV0FBVyxNQUFNLElBQUksQ0FBQztBQUM5RSxvQkFBUSxLQUFLLEVBQUUsTUFBVyxVQUFLLEtBQUssV0FBVyxNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sTUFBTSxNQUFNQSxNQUFLLE1BQU0sSUFBSSxDQUFDO0FBQUEsVUFDdEc7QUFBQSxRQUNGO0FBQUEsTUFDRixRQUFRO0FBQUEsTUFBYTtBQUNyQixjQUFRLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLGNBQWMsRUFBRSxJQUFJLENBQUM7QUFDbkQsYUFBTztBQUFBLElBQ1Q7QUFHQSxVQUFNLFVBQVUsT0FBTyxTQUFpQixnQkFBd0IsVUFBaUM7QUFDL0YsVUFBSSxRQUFRLFNBQVU7QUFDdEIsVUFBSTtBQUNKLFVBQUk7QUFDRixrQkFBVSxNQUFTLFlBQVMsUUFBUSxTQUFTLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFBQSxNQUN0RSxRQUFRO0FBQUU7QUFBQSxNQUFtQztBQUU3QyxpQkFBVyxTQUFTLFNBQVM7QUFDM0IsWUFBSSxNQUFNLEtBQUssV0FBVyxHQUFHLEVBQUc7QUFDaEMsY0FBTSxXQUFnQixVQUFLLFNBQVMsTUFBTSxJQUFJO0FBQzlDLGNBQU0sZUFBZSxpQkFBc0IsVUFBSyxnQkFBZ0IsTUFBTSxJQUFJLElBQUksTUFBTTtBQUVwRixZQUFJLE1BQU0sWUFBWSxHQUFHO0FBQ3ZCLGdCQUFNLFdBQVcsb0JBQUksSUFBSSxDQUFDLEdBQUcsbUJBQW1CLEdBQUksS0FBSyxZQUFZLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFFLENBQUM7QUFDNUYsY0FBSSxTQUFTLElBQUksTUFBTSxJQUFJLEVBQUc7QUFDOUIsZ0JBQU0sUUFBUSxVQUFVLGNBQWMsUUFBUSxDQUFDO0FBQUEsUUFDakQsV0FBVyxNQUFNLE9BQU8sR0FBRztBQUN6QixnQkFBTSxNQUFXLGFBQVEsTUFBTSxJQUFJLEVBQUUsWUFBWTtBQUNqRCxjQUFJLFlBQVksU0FBUyxHQUFHLEdBQUc7QUFDN0IsZ0JBQUk7QUFDRixvQkFBTUEsUUFBaUIsTUFBUyxZQUFTLEtBQUssUUFBUTtBQUN0RCxzQkFBUSxLQUFLLEVBQUUsTUFBTSxjQUFjLE1BQU0sTUFBTSxNQUFNLE1BQU1BLE1BQUssTUFBTSxJQUFJLENBQUM7QUFBQSxZQUM3RSxRQUFRO0FBQUEsWUFBYTtBQUFBLFVBQ3ZCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxRQUFRLFVBQVUsSUFBSSxDQUFDO0FBQzdCLFlBQVEsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLEtBQUssY0FBYyxFQUFFLElBQUksQ0FBQztBQUNuRCxXQUFPO0FBQUEsRUFDVDtBQUFBO0FBQUEsRUFHQSxTQUFlO0FBQ2IsUUFBSSxLQUFLLGdCQUFnQjtBQUN2QixhQUFPLG9CQUFvQixXQUFXLEtBQUssY0FBYztBQUN6RCxXQUFLLGlCQUFpQjtBQUFBLElBQ3hCO0FBQ0EsU0FBSyxZQUFZLGFBQWE7QUFDOUIsU0FBSyxTQUFTO0FBQUEsRUFDaEI7QUFBQTtBQUFBLEVBR0EsTUFBYyxVQUFVLE9BQW9DO0FBQzFELFVBQU0sTUFBTSxNQUFNO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxHQUFJO0FBR2xDLFFBQUksS0FBSyxVQUFVLE1BQU0sV0FBVyxLQUFLLE9BQU8sZUFBZTtBQUM3RDtBQUFBLElBQ0Y7QUFDQSxRQUFJLEtBQUssa0JBQWtCLE1BQU0sV0FBVyxLQUFLLGdCQUFnQjtBQUMvRCxjQUFRLEtBQUssd0RBQXdELE1BQU0sTUFBTTtBQUNqRjtBQUFBLElBQ0Y7QUFHQSxRQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsVUFBVSxLQUFLLENBQUMsSUFBSSxLQUFLLFdBQVcsTUFBTSxLQUFLLENBQUMsSUFBSSxLQUFLLFdBQVcsT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFdBQVcsUUFBUSxHQUFHO0FBQ3ZJO0FBQUEsSUFDRjtBQUdBLFFBQUksSUFBSSxTQUFTLGFBQWE7QUFDNUIsV0FBSyxZQUFZLFVBQVU7QUFFM0IsV0FBSyxRQUFRLElBQUksSUFBSTtBQUFBLFFBQ25CLElBQUk7QUFBQSxRQUNKLGVBQWUsS0FBSyxVQUFVLGlCQUFpQjtBQUFBLFFBQy9DLGNBQWMsS0FBSztBQUFBLFFBQ25CLGNBQWMsS0FBSyxVQUFVLGNBQWMsQ0FBQztBQUFBLFFBQzVDLHVCQUF1QixLQUFLLFVBQVUseUJBQXlCO0FBQUEsTUFDakUsQ0FBQztBQUNEO0FBQUEsSUFDRjtBQUVBLFFBQUksSUFBSSxTQUFTLGFBQWE7QUFDNUIsV0FBSyxRQUFRLElBQUksSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDO0FBQ2pDO0FBQUEsSUFDRjtBQUdBLFFBQUksSUFBSSxTQUFTLHlCQUF5QjtBQUN4QyxVQUFJLEtBQUssVUFBVTtBQUNqQixhQUFLLFNBQVMsZ0JBQWdCLElBQUk7QUFDbEMsWUFBSSxLQUFLLGFBQWMsT0FBTSxLQUFLLGFBQWE7QUFBQSxNQUNqRDtBQUNBLFdBQUssUUFBUSxJQUFJLElBQUksRUFBRSxJQUFJLEtBQUssQ0FBQztBQUNqQztBQUFBLElBQ0Y7QUFHQSxRQUFJLElBQUksU0FBUyx3QkFBd0I7QUFDdkMsVUFBSSxLQUFLLFVBQVU7QUFDakIsYUFBSyxTQUFTLGFBQWEsSUFBSSxXQUF3QixDQUFDO0FBQ3hELFlBQUksS0FBSyxhQUFjLE9BQU0sS0FBSyxhQUFhO0FBQUEsTUFDakQ7QUFDQSxXQUFLLFFBQVEsSUFBSSxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDakM7QUFBQSxJQUNGO0FBR0EsUUFBSSxJQUFJLFNBQVMsbUJBQW1CO0FBQ2xDLFlBQU0sZUFBZSxJQUFJLFFBQVEsV0FBVztBQUFXLFlBQU0sZ0JBQWdCLGVBQWUsS0FBSyxVQUFVLFNBQVMsWUFBWTtBQUNoSSxVQUFJLGlCQUFpQixlQUFlO0FBQ2xDLFlBQUksY0FBYztBQUNoQix5QkFBZSxLQUFLLFVBQVUsT0FBTyxhQUFhO0FBQ2xELHlCQUFlLEtBQUssVUFBVSxJQUFJLFlBQVk7QUFBQSxRQUNoRCxPQUFPO0FBQ0wseUJBQWUsS0FBSyxVQUFVLE9BQU8sWUFBWTtBQUNqRCx5QkFBZSxLQUFLLFVBQVUsSUFBSSxhQUFhO0FBQUEsUUFDakQ7QUFFQSxhQUFLLFlBQVksVUFBVTtBQUFBLE1BQzdCO0FBQ0EsV0FBSyxRQUFRLElBQUksSUFBSSxFQUFFLElBQUksTUFBTSxRQUFRLGFBQWEsQ0FBQztBQUN2RDtBQUFBLElBQ0Y7QUFHQSxRQUFJLElBQUksU0FBUyxxQkFBcUI7QUFDcEMsVUFBSSxLQUFLLFVBQVUsdUJBQXVCO0FBQ3hDLGNBQU0sRUFBRSxLQUFLLGlCQUFpQixPQUFPLElBQUksSUFBSTtBQUM3QyxhQUFLLFlBQVksYUFBYSxLQUFLLGlCQUFpQixNQUFNO0FBQUEsTUFDNUQ7QUFDQSxXQUFLLFFBQVEsSUFBSSxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDakM7QUFBQSxJQUNGO0FBS0EsUUFBSSxJQUFJLFNBQVMsMkJBQTJCO0FBQzFDLFVBQUk7QUFDRixZQUFJLENBQUMsS0FBSyxlQUFlO0FBQ3ZCLGdCQUFNLElBQUksTUFBTSwwSEFBc0I7QUFBQSxRQUN4QztBQUVBLGNBQU0sUUFBUSxNQUFNLEtBQUsscUJBQXFCO0FBQzlDLGFBQUssUUFBUSxJQUFJLElBQUksRUFBRSxNQUFNLENBQUM7QUFBQSxNQUNoQyxTQUFTLE9BQVk7QUFDbkIsZ0JBQVEsTUFBTSwwRUFBd0IsS0FBSztBQUMzQyxhQUFLLGFBQWEsSUFBSSxJQUFJLE1BQU0sV0FBVyw0Q0FBUztBQUFBLE1BQ3REO0FBQ0E7QUFBQSxJQUNGO0FBR0EsUUFBSSxJQUFJLFNBQVMscUJBQXFCO0FBQ3BDLFVBQUk7QUFDRixjQUFNLGVBQWUsSUFBSSxTQUFTLFFBQVE7QUFDMUMsWUFBSSxDQUFDLGFBQWMsT0FBTSxJQUFJLE1BQU0sNENBQVM7QUFDNUMsY0FBTSxNQUFXLGFBQVEsWUFBWSxFQUFFLFlBQVk7QUFDbkQsWUFBSSxDQUFDLHlCQUF5QixTQUFTLEdBQUcsRUFBRyxPQUFNLElBQUksTUFBTSwyREFBYyxHQUFHO0FBQzlFLFlBQUksQ0FBQyxLQUFLLGNBQWUsT0FBTSxJQUFJLE1BQU0sOERBQVk7QUFDckQsY0FBTSxnQkFBZ0IsS0FBSztBQUMzQixjQUFNLFdBQWdCLFVBQUssZUFBZSxZQUFZO0FBRXRELFlBQUksQ0FBQyxTQUFTLFdBQVcsYUFBYSxHQUFHO0FBQ3ZDLGdCQUFNLElBQUksTUFBTSwrQ0FBWSxZQUFZO0FBQUEsUUFDMUM7QUFDQSxZQUFJO0FBQ0YsZ0JBQVMsWUFBUyxLQUFLLFFBQVE7QUFBQSxRQUNqQyxRQUFRO0FBQ04sZ0JBQU0sSUFBSSxNQUFNLHlDQUFXLFlBQVk7QUFBQSxRQUN6QztBQUNBLGFBQUssUUFBUSxJQUFJLElBQUksRUFBRSxVQUFVLFVBQVUsTUFBVyxjQUFTLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFBQSxNQUNyRixTQUFTLE9BQVk7QUFDbkIsYUFBSyxhQUFhLElBQUksSUFBSSxNQUFNLFdBQVcsNENBQVM7QUFBQSxNQUN0RDtBQUNBO0FBQUEsSUFDRjtBQUdBLFFBQUksSUFBSSxTQUFTLHFCQUFxQjtBQUNwQyxVQUFJO0FBQ0YsY0FBTSxXQUFXLElBQUksU0FBUyxRQUFRO0FBQ3RDLFlBQUksQ0FBQyxTQUFVLE9BQU0sSUFBSSxNQUFNLDRDQUFTO0FBRXhDLFlBQUksU0FBUyxTQUFTLElBQUksRUFBRyxPQUFNLElBQUksTUFBTSxzQ0FBUTtBQUNyRCxjQUFNLE1BQVcsYUFBUSxRQUFRLEVBQUUsWUFBWTtBQUMvQyxZQUFJLENBQUMseUJBQXlCLFNBQVMsR0FBRyxFQUFHLE9BQU0sSUFBSSxNQUFNLDJEQUFjLEdBQUc7QUFDOUUsWUFBSTtBQUNGLGdCQUFTLFlBQVMsS0FBSyxRQUFRO0FBQUEsUUFDakMsUUFBUTtBQUNOLGdCQUFNLElBQUksTUFBTSx5Q0FBVyxRQUFRO0FBQUEsUUFDckM7QUFDQSxhQUFLLFFBQVEsSUFBSSxJQUFJLEVBQUUsVUFBVSxNQUFXLGNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUFBLE1BQ3ZFLFNBQVMsT0FBWTtBQUNuQixhQUFLLGFBQWEsSUFBSSxJQUFJLE1BQU0sV0FBVyxzQ0FBUTtBQUFBLE1BQ3JEO0FBQ0E7QUFBQSxJQUNGO0FBR0EsUUFBSTtBQUNGLFlBQU0sU0FBUyxNQUFNLEtBQUssY0FBYyxPQUFPLEdBQUc7QUFDbEQsV0FBSyxRQUFRLElBQUksSUFBSSxNQUFNO0FBQUEsSUFDN0IsU0FBUyxPQUFZO0FBQ25CLFdBQUssYUFBYSxJQUFJLElBQUksTUFBTSxXQUFXLGVBQWU7QUFBQSxJQUM1RDtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBSVEsUUFBUSxJQUFZLFNBQW9CO0FBQzlDLFFBQUksQ0FBQyxLQUFLLFFBQVEsY0FBZTtBQUNqQyxTQUFLLE9BQU8sY0FBYyxZQUFZLEVBQUUsSUFBSSxRQUFRLEdBQUcsR0FBRztBQUFBLEVBQzVEO0FBQUE7QUFBQSxFQUdRLGFBQWEsSUFBWSxPQUFxQjtBQUNwRCxRQUFJLENBQUMsS0FBSyxRQUFRLGNBQWU7QUFDakMsU0FBSyxPQUFPLGNBQWMsWUFBWSxFQUFFLElBQUksTUFBTSxHQUFHLEdBQUc7QUFBQSxFQUMxRDtBQUNGOzs7QUxsVU8sSUFBTSx5QkFBeUI7QUFVL0IsSUFBTSxrQkFBTixjQUE4QiwwQkFBUztBQUFBLEVBYzVDLFlBQVksTUFBcUIsWUFBb0IsUUFBNEIsVUFBZ0MsY0FBbUM7QUFDbEosVUFBTSxJQUFJO0FBZFosU0FBUSxnQkFBc0M7QUFDOUMsU0FBUSxjQUFrQztBQUMxQyxTQUFRLFNBQW1DO0FBQzNDLFNBQVEscUJBQWtEO0FBQzFELFNBQVEsbUJBQXdEO0FBQ2hFLFNBQVEsaUJBQWdDO0FBQ3hDLFNBQVEsZUFBb0I7QUFTMUIsU0FBSyxhQUFhO0FBQ2xCLFNBQUssU0FBUztBQUNkLFNBQUssV0FBVztBQUNoQixTQUFLLGVBQWU7QUFBQSxFQUN0QjtBQUFBLEVBRUEsY0FBc0I7QUFDcEIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLGlCQUF5QjtBQUN2QixXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsVUFBa0I7QUFDaEIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLE1BQU0sU0FBd0I7QUFDNUIsVUFBTSxZQUF5QixLQUFLLFlBQVksU0FBUyxDQUFDO0FBQzFELGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMseUJBQXlCO0FBRTVDLFFBQUksQ0FBQyxLQUFLLFlBQVk7QUFDcEIsZ0JBQVUsU0FBUyxPQUFPO0FBQUEsUUFDeEIsTUFBTTtBQUFBLFFBQ04sS0FBSztBQUFBLE1BQ1AsQ0FBQztBQUNEO0FBQUEsSUFDRjtBQUdBLFFBQUksQ0FBQyxLQUFLLE9BQU8sYUFBYTtBQUM1QixZQUFNLFdBQVcsVUFBVSxTQUFTLE9BQU87QUFBQSxRQUN6QyxNQUFNO0FBQUEsUUFDTixLQUFLO0FBQUEsTUFDUCxDQUFDO0FBRUQsVUFBSSxRQUFRO0FBQ1osV0FBSyxpQkFBaUIsT0FBTyxZQUFZLE1BQU07QUFDN0M7QUFDQSxZQUFJLEtBQUssT0FBTyxhQUFhO0FBQzNCLGlCQUFPLGNBQWMsS0FBSyxjQUFlO0FBQ3pDLGVBQUssaUJBQWlCO0FBQ3RCLG9CQUFVLE1BQU07QUFDaEIsZUFBSyxLQUFLLFlBQVksU0FBUztBQUMvQjtBQUFBLFFBQ0Y7QUFFQSxZQUFJLFVBQVUsSUFBSTtBQUNoQixtQkFBUyxRQUFRLGtHQUFrQjtBQUFBLFFBQ3JDO0FBRUEsWUFBSSxVQUFVLEtBQUs7QUFDakIsbUJBQVMsUUFBUSwyR0FBMkI7QUFBQSxRQUM5QztBQUFBLE1BQ0YsR0FBRyxHQUFHO0FBQ047QUFBQSxJQUNGO0FBRUEsVUFBTSxLQUFLLFlBQVksU0FBUztBQUFBLEVBQ2xDO0FBQUEsRUFFQSxNQUFjLFlBQVksV0FBdUM7QUFFL0QsU0FBSyxTQUFTLFVBQVUsU0FBUyxVQUFVO0FBQUEsTUFDekMsS0FBSztBQUFBLE1BQ0wsTUFBTTtBQUFBLFFBQ0osS0FBSyxLQUFLO0FBQUEsUUFDVixPQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0YsQ0FBQztBQUdELFNBQUsscUJBQXFCLENBQUMsTUFBYTtBQUN0QyxjQUFRLE1BQU0seUNBQXlDLEtBQUssVUFBVTtBQUFBLElBQ3hFO0FBQ0EsU0FBSyxPQUFPLGlCQUFpQixTQUFTLEtBQUssa0JBQWtCO0FBSTdELFVBQU0sY0FBYztBQUNwQixRQUFJLGFBQWE7QUFDakIsU0FBSyxtQkFBbUIsQ0FBQyxNQUFxQjtBQUM1QyxVQUFJLFdBQVk7QUFDaEIsVUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTO0FBQzFCLHFCQUFhO0FBQ2IsY0FBTSxNQUFNLElBQUksY0FBYyxXQUFXO0FBQUEsVUFDdkMsS0FBSyxFQUFFO0FBQUEsVUFDUCxNQUFNLEVBQUU7QUFBQSxVQUNSLFNBQVMsRUFBRTtBQUFBLFVBQ1gsU0FBUyxFQUFFO0FBQUEsVUFDWCxVQUFVLEVBQUU7QUFBQSxVQUNaLFFBQVEsRUFBRTtBQUFBLFVBQ1YsU0FBUztBQUFBLFVBQ1QsWUFBWTtBQUFBLFFBQ2QsQ0FBQztBQUNELG9CQUFZLEtBQUssY0FBYyxHQUFHO0FBQ2xDLHFCQUFhO0FBQUEsTUFDZjtBQUFBLElBQ0Y7QUFDQSxtQkFBZSxpQkFBaUIsV0FBVyxLQUFLLGtCQUFrQixJQUFJO0FBR3RFLFVBQU0sVUFBVSxJQUFJLGFBQWEsS0FBSyxHQUFHO0FBQ3pDLFVBQU0sUUFBUSxnQkFBZ0I7QUFFOUIsVUFBTSxnQkFBZ0IsSUFBSSxjQUFjLFNBQVMsS0FBSyxTQUFTLGtCQUFrQjtBQUNqRixTQUFLLGNBQWMsSUFBSSxZQUFZO0FBQ25DLFNBQUssZ0JBQWdCLElBQUk7QUFBQSxNQUN2QjtBQUFBLE1BQ0EsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLElBQ1A7QUFHQSxVQUFNLGVBQWUsTUFBTSxLQUFLLGtCQUFrQjtBQUNsRCxTQUFLLGNBQWMsZ0JBQWdCLFlBQVk7QUFHL0MsVUFBTSxnQkFBaUIsS0FBSyxJQUFJLE1BQU0sUUFBZ0IsWUFBWTtBQUNsRSxRQUFJLGVBQWU7QUFDakIsV0FBSyxjQUFjLGlCQUFpQixhQUFhO0FBQUEsSUFDbkQ7QUFFQSxRQUFJLEtBQUssU0FBUyxXQUFXO0FBQzNCLFdBQUssY0FBYyxhQUFhLEtBQUssU0FBUyxTQUFTO0FBQUEsSUFDekQ7QUFFQSxTQUFLLGNBQWMsYUFBYSxLQUFLLElBQUksTUFBTSxTQUFTO0FBRXhELFNBQUssY0FBYyxPQUFPLEtBQUssTUFBTTtBQUNyQyxTQUFLLFlBQVksYUFBYSxLQUFLLE1BQU07QUFHekMsU0FBSyxlQUFlLEtBQUssSUFBSSxVQUFVLEdBQUcsY0FBYyxNQUFNO0FBQzVELFdBQUssYUFBYSxlQUFlO0FBQUEsSUFDbkMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVBLE1BQU0sVUFBeUI7QUFFN0IsUUFBSSxLQUFLLG1CQUFtQixNQUFNO0FBQ2hDLGFBQU8sY0FBYyxLQUFLLGNBQWM7QUFDeEMsV0FBSyxpQkFBaUI7QUFBQSxJQUN4QjtBQUdBLFNBQUssZUFBZSxPQUFPO0FBQzNCLFNBQUssZ0JBQWdCO0FBR3JCLFFBQUksS0FBSyxjQUFjO0FBQ3JCLFdBQUssSUFBSSxVQUFVLE9BQU8sS0FBSyxZQUFZO0FBQzNDLFdBQUssZUFBZTtBQUFBLElBQ3RCO0FBRUEsU0FBSyxhQUFhLGFBQWE7QUFDL0IsU0FBSyxjQUFjO0FBR25CLFFBQUksS0FBSyxVQUFVLEtBQUssb0JBQW9CO0FBQzFDLFdBQUssT0FBTyxvQkFBb0IsU0FBUyxLQUFLLGtCQUFrQjtBQUNoRSxXQUFLLHFCQUFxQjtBQUFBLElBQzVCO0FBR0EsUUFBSSxLQUFLLGtCQUFrQjtBQUN6QixxQkFBZSxvQkFBb0IsV0FBVyxLQUFLLGtCQUFrQixJQUFJO0FBQ3pFLFdBQUssbUJBQW1CO0FBQUEsSUFDMUI7QUFHQSxRQUFJLEtBQUssUUFBUTtBQUNmLFdBQUssT0FBTyxPQUFPO0FBQ25CLFdBQUssU0FBUztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxvQkFBb0U7QUFDaEYsVUFBTSxTQUFnRCxDQUFDO0FBRXZELFFBQUk7QUFDRixZQUFNLGdCQUFpQixLQUFLLElBQUksTUFBTSxRQUFnQixZQUFZO0FBQ2xFLFVBQUksQ0FBQyxjQUFlLFFBQU87QUFFM0IsWUFBTSxlQUFlLEtBQUssU0FBUyxhQUFhO0FBQ2hELFlBQU0sWUFBaUIsV0FBSyxlQUFlLFlBQVk7QUFDdkQsVUFBSTtBQUNGLGNBQU1DLFFBQU8sTUFBUyxhQUFTLEtBQUssU0FBUztBQUM3QyxZQUFJLENBQUNBLE1BQUssWUFBWSxFQUFHLFFBQU87QUFBQSxNQUNsQyxRQUFRO0FBQUUsZUFBTztBQUFBLE1BQVE7QUFFekIsWUFBTSxVQUFvQixNQUFTLGFBQVMsUUFBUSxTQUFTO0FBQzdELGlCQUFXLFNBQVMsU0FBUztBQUMzQixZQUFJLENBQUMsTUFBTSxTQUFTLEtBQUssRUFBRztBQUM1QixjQUFNLFdBQWdCLFdBQUssV0FBVyxLQUFLO0FBQzNDLFlBQUk7QUFDRixnQkFBTSxZQUFZLE1BQVMsYUFBUyxLQUFLLFFBQVE7QUFDakQsY0FBSSxDQUFDLFVBQVUsT0FBTyxFQUFHO0FBQ3pCLGdCQUFNLE9BQWUsTUFBUyxhQUFTLFNBQVMsVUFBVSxPQUFPO0FBRWpFLGNBQUksQ0FBQyxLQUFLLFNBQVMsaUJBQWlCLEdBQUc7QUFDckMsb0JBQVEsS0FBSyxpREFBd0IsS0FBSywwRUFBNkI7QUFDdkU7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sS0FBSztBQUFBLFlBQ1YsTUFBTSxNQUFNLFFBQVEsU0FBUyxFQUFFO0FBQUEsWUFDL0I7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNILFNBQVMsS0FBVTtBQUNqQixrQkFBUSxNQUFNLDZEQUEwQixLQUFLLGtCQUFRLElBQUksT0FBTztBQUFBLFFBQ2xFO0FBQUEsTUFDRjtBQUVBLFVBQUksT0FBTyxTQUFTLEdBQUc7QUFDckIsZ0JBQVEsTUFBTSwrQkFBcUIsT0FBTyxNQUFNLDBDQUFZLE9BQU8sSUFBSSxPQUFLLEVBQUUsSUFBSSxDQUFDO0FBQUEsTUFDckY7QUFBQSxJQUNGLFNBQVMsS0FBVTtBQUNqQixjQUFRLE1BQU0sZ0ZBQThCLElBQUksT0FBTztBQUFBLElBQ3pEO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFDRjs7O0FPclFBLFdBQXNCO0FBQ3RCLFlBQXVCO0FBQ3ZCLElBQUFDLE1BQW9CO0FBQ3BCLElBQUFDLFFBQXNCO0FBQ3RCLFVBQXFCO0FBU2QsSUFBTSxjQUFOLE1BQWtCO0FBQUEsRUFNdkIsWUFBWSxXQUFtQjtBQUwvQixTQUFRLFNBQTZCO0FBQ3JDLFNBQVEsT0FBTztBQUVmLFNBQVEsZ0JBQXdCO0FBRzlCLFNBQUssWUFBWTtBQUFBLEVBQ25CO0FBQUE7QUFBQSxFQUdBLGlCQUFpQixVQUF3QjtBQUN2QyxTQUFLLGdCQUFnQjtBQUFBLEVBQ3ZCO0FBQUE7QUFBQSxFQUdBLE1BQU0sUUFBeUI7QUFDN0IsUUFBSSxLQUFLLE9BQVEsUUFBTyxLQUFLO0FBRTdCLFNBQUssT0FBTyxNQUFNLEtBQUssYUFBYTtBQUVwQyxXQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxXQUFLLFNBQWMsa0JBQWEsQ0FBQyxLQUFLLFFBQVE7QUFDNUMsYUFBSyxjQUFjLEtBQUssR0FBRztBQUFBLE1BQzdCLENBQUM7QUFFRCxXQUFLLE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBZTtBQUN0QyxnQkFBUSxNQUFNLGdDQUFnQyxHQUFHO0FBQ2pELGVBQU8sSUFBSSxNQUFNLGlCQUFpQixJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQUEsTUFDbEQsQ0FBQztBQUVELFdBQUssT0FBTyxPQUFPLEtBQUssTUFBTSxhQUFhLE1BQU07QUFDL0MsZ0JBQVEsSUFBSSwrQ0FBK0MsS0FBSyxJQUFJLEVBQUU7QUFDdEUsZ0JBQVEsS0FBSyxJQUFJO0FBQUEsTUFDbkIsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUFBLEVBQ0g7QUFBQTtBQUFBLEVBR0EsTUFBTSxPQUFzQjtBQUMxQixXQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDOUIsVUFBSSxLQUFLLFFBQVE7QUFDZixhQUFLLE9BQU8sTUFBTSxNQUFNO0FBQ3RCLGtCQUFRLElBQUkscUNBQXFDO0FBQ2pELGVBQUssU0FBUztBQUNkLGVBQUssT0FBTztBQUNaLGtCQUFRO0FBQUEsUUFDVixDQUFDO0FBQUEsTUFDSCxPQUFPO0FBQ0wsZ0JBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBO0FBQUEsRUFHQSxTQUFpQjtBQUNmLFdBQU8sb0JBQW9CLEtBQUssSUFBSTtBQUFBLEVBQ3RDO0FBQUE7QUFBQSxFQUdRLGNBQWMsS0FBMkIsS0FBZ0M7QUFFL0UsVUFBTSxNQUFNLElBQUksT0FBTztBQUN2QixRQUFJLElBQUksV0FBVyxxQkFBcUIsR0FBRztBQUN6QyxXQUFLLG9CQUFvQixLQUFLLEdBQUc7QUFDakM7QUFBQSxJQUNGO0FBQ0EsUUFBSSxJQUFJLFdBQVcsZUFBZSxHQUFHO0FBQ25DLFdBQUssaUJBQWlCLEtBQUssR0FBRztBQUM5QjtBQUFBLElBQ0Y7QUFHQSxRQUFJLFVBQVUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBRTlCLFFBQUksUUFBUSxTQUFTLEdBQUcsR0FBRztBQUN6QixpQkFBVztBQUFBLElBQ2I7QUFDQSxVQUFNLFdBQWdCLGdCQUFVLE9BQU8sRUFBRSxRQUFRLGlCQUFpQixFQUFFO0FBQ3BFLFVBQU0sV0FBZ0IsV0FBSyxLQUFLLFdBQVcsUUFBUTtBQUduRCxRQUFJLENBQUMsU0FBUyxXQUFXLEtBQUssU0FBUyxHQUFHO0FBQ3hDLFVBQUksVUFBVSxHQUFHO0FBQ2pCLFVBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsSUFDRjtBQUdBLElBQUcsU0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVO0FBQ2hDLFVBQUksT0FBTyxDQUFDLE1BQU0sT0FBTyxHQUFHO0FBQzFCLFlBQUksVUFBVSxHQUFHO0FBQ2pCLFlBQUksSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQXlCSztBQUNiO0FBQUEsTUFDRjtBQUdBLFlBQU0sTUFBVyxjQUFRLFFBQVEsRUFBRSxZQUFZO0FBQy9DLFlBQU0sY0FBYyxXQUFXLEdBQUcsS0FBSztBQUd2QyxZQUFNLFNBQVMsUUFBUTtBQUN2QixZQUFNLFdBQVcsQ0FBQyxRQUFRLE9BQU8sU0FBUyxVQUFVLFFBQVEsUUFBUSxRQUFRLFFBQVEsT0FBTyxFQUFFLFNBQVMsR0FBRztBQUN6RyxZQUFNLGVBQWUsU0FDakIsYUFDQSxXQUNFLDBCQUNBO0FBR04sVUFBSSxVQUFVLEtBQUs7QUFBQSxRQUNqQixnQkFBZ0I7QUFBQSxRQUNoQixpQkFBaUI7QUFBQSxNQUNuQixDQUFDO0FBR0QsWUFBTSxTQUEyQixxQkFBaUIsUUFBUTtBQUMxRCxhQUFPLEtBQUssR0FBRztBQUNmLGFBQU8sR0FBRyxTQUFTLE1BQU07QUFDdkIsWUFBSSxDQUFDLElBQUksYUFBYTtBQUNwQixjQUFJLFVBQVUsR0FBRztBQUNqQixjQUFJLElBQUksdUJBQXVCO0FBQUEsUUFDakM7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQSxFQUdRLG9CQUFvQixLQUEyQixLQUFnQztBQUNyRixRQUFJO0FBQ0YsWUFBTSxTQUFTLElBQUksT0FBTztBQUMxQixZQUFNLGFBQWEsT0FBTyxRQUFRLEdBQUc7QUFDckMsVUFBSSxlQUFlLElBQUk7QUFDckIsWUFBSSxVQUFVLEdBQUc7QUFBRyxZQUFJLElBQUksdUJBQXVCO0FBQ25EO0FBQUEsTUFDRjtBQUNBLFlBQU0sV0FBVyxPQUFPLE1BQU0sYUFBYSxDQUFDO0FBQzVDLFlBQU0sU0FBUyxJQUFJLGdCQUFnQixRQUFRO0FBQzNDLFlBQU0sWUFBWSxPQUFPLElBQUksS0FBSztBQUNsQyxVQUFJLENBQUMsV0FBVztBQUNkLFlBQUksVUFBVSxHQUFHO0FBQUcsWUFBSSxJQUFJLHVCQUF1QjtBQUNuRDtBQUFBLE1BQ0Y7QUFHQSxVQUFJO0FBQ0osVUFBSTtBQUNGLGlCQUFTLElBQUksSUFBSSxTQUFTO0FBQUEsTUFDNUIsUUFBUTtBQUNOLFlBQUksVUFBVSxHQUFHO0FBQUcsWUFBSSxJQUFJLGFBQWE7QUFDekM7QUFBQSxNQUNGO0FBQ0EsVUFBSSxPQUFPLGFBQWEsV0FBVyxPQUFPLGFBQWEsVUFBVTtBQUMvRCxZQUFJLFVBQVUsR0FBRztBQUFHLFlBQUksSUFBSSx5Q0FBeUM7QUFDckU7QUFBQSxNQUNGO0FBR0EsWUFBTSxXQUFXLE9BQU87QUFDeEIsVUFBSSxhQUFhLGVBQWUsYUFBYSxlQUFlLGFBQWEsYUFDcEUsYUFBYSxXQUFXLFNBQVMsV0FBVyxVQUFVLEtBQUssU0FBUyxXQUFXLEtBQUssS0FDcEYsU0FBUyxXQUFXLE1BQU0sR0FBRztBQUNoQyxZQUFJLFVBQVUsR0FBRztBQUFHLFlBQUksSUFBSSxtREFBbUQ7QUFDL0U7QUFBQSxNQUNGO0FBR0EsWUFBTSxXQUFXLE9BQU8sU0FBUyxZQUFZO0FBQzdDLFVBQUksQ0FBQyx5QkFBeUIsS0FBSyxTQUFPLFNBQVMsU0FBUyxHQUFHLENBQUMsR0FBRztBQUNqRSxZQUFJLFVBQVUsR0FBRztBQUFHLFlBQUksSUFBSSxxQ0FBcUM7QUFDakU7QUFBQSxNQUNGO0FBRUEsWUFBTSxZQUFZLE9BQU8sYUFBYSxXQUFXLFFBQVE7QUFDekQsWUFBTSxXQUFXLFVBQVUsSUFBSSxXQUFXLEVBQUUsU0FBUyxJQUFNLEdBQUcsQ0FBQyxhQUFhO0FBQzFFLGNBQU0sU0FBUyxTQUFTLGNBQWM7QUFDdEMsY0FBTSxLQUFLLFNBQVMsUUFBUSxjQUFjLEtBQUs7QUFHL0MsY0FBTSxVQUFVLEtBQUssT0FBTztBQUM1QixZQUFJLFlBQVk7QUFDaEIsY0FBTSxTQUFtQixDQUFDO0FBRTFCLGlCQUFTLEdBQUcsUUFBUSxDQUFDLFVBQWtCO0FBQ3JDLHVCQUFhLE1BQU07QUFDbkIsY0FBSSxZQUFZLFNBQVM7QUFDdkIscUJBQVMsUUFBUTtBQUNqQixnQkFBSSxDQUFDLElBQUksYUFBYTtBQUNwQixrQkFBSSxVQUFVLEdBQUc7QUFBRyxrQkFBSSxJQUFJLGlDQUFpQztBQUFBLFlBQy9EO0FBQ0E7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sS0FBSyxLQUFLO0FBQUEsUUFDbkIsQ0FBQztBQUVELGlCQUFTLEdBQUcsT0FBTyxNQUFNO0FBQ3ZCLGNBQUksSUFBSSxZQUFhO0FBQ3JCLGNBQUksVUFBVSxRQUFRO0FBQUEsWUFDcEIsZ0JBQWdCO0FBQUEsWUFDaEIsa0JBQWtCO0FBQUEsWUFDbEIsK0JBQStCO0FBQUEsWUFDL0IsaUJBQWlCO0FBQUEsVUFDbkIsQ0FBQztBQUNELGdCQUFNLE9BQU8sT0FBTyxPQUFPLE1BQU07QUFDakMsY0FBSSxJQUFJLElBQUk7QUFBQSxRQUNkLENBQUM7QUFFRCxpQkFBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRO0FBQzVCLGNBQUksQ0FBQyxJQUFJLGFBQWE7QUFDcEIsb0JBQVEsTUFBTSxrREFBa0QsSUFBSSxPQUFPO0FBQzNFLGdCQUFJLFVBQVUsR0FBRztBQUFHLGdCQUFJLElBQUksZ0JBQWdCO0FBQUEsVUFDOUM7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNILENBQUM7QUFFRCxlQUFTLEdBQUcsV0FBVyxNQUFNO0FBQzNCLGlCQUFTLFFBQVE7QUFDakIsWUFBSSxDQUFDLElBQUksYUFBYTtBQUNwQixjQUFJLFVBQVUsR0FBRztBQUFHLGNBQUksSUFBSSxrQkFBa0I7QUFBQSxRQUNoRDtBQUFBLE1BQ0YsQ0FBQztBQUVELGVBQVMsR0FBRyxTQUFTLENBQUMsUUFBZTtBQUNuQyxZQUFJLENBQUMsSUFBSSxhQUFhO0FBQ3BCLGtCQUFRLE1BQU0seUNBQXlDLElBQUksT0FBTztBQUNsRSxjQUFJLFVBQVUsR0FBRztBQUFHLGNBQUksSUFBSSw0QkFBNEI7QUFBQSxRQUMxRDtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsU0FBUyxHQUFRO0FBQ2YsVUFBSSxDQUFDLElBQUksYUFBYTtBQUNwQixnQkFBUSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3hELFlBQUksVUFBVSxHQUFHO0FBQ2pCLFlBQUksSUFBSSx1QkFBdUI7QUFBQSxNQUNqQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdRLGlCQUFpQixLQUEyQixLQUFnQztBQUNsRixRQUFJO0FBQ0YsWUFBTSxTQUFTLElBQUksT0FBTztBQUMxQixZQUFNLGFBQWEsT0FBTyxRQUFRLEdBQUc7QUFDckMsVUFBSSxlQUFlLElBQUk7QUFDckIsWUFBSSxVQUFVLEdBQUc7QUFBRyxZQUFJLElBQUksd0JBQXdCO0FBQ3BEO0FBQUEsTUFDRjtBQUNBLFlBQU0sV0FBVyxPQUFPLE1BQU0sYUFBYSxDQUFDO0FBQzVDLFlBQU0sU0FBMEIsSUFBSSxnQkFBZ0IsUUFBUTtBQUM1RCxZQUFNLGVBQWUsT0FBTyxJQUFJLE1BQU07QUFDdEMsVUFBSSxDQUFDLGNBQWM7QUFDakIsWUFBSSxVQUFVLEdBQUc7QUFBRyxZQUFJLElBQUksd0JBQXdCO0FBQ3BEO0FBQUEsTUFDRjtBQUdBLFlBQU0sTUFBVyxjQUFRLFlBQVksRUFBRSxZQUFZO0FBQ25ELFVBQUksQ0FBQyx5QkFBeUIsU0FBUyxHQUFHLEdBQUc7QUFDM0MsWUFBSSxVQUFVLEdBQUc7QUFBRyxZQUFJLElBQUkscUNBQXFDO0FBQ2pFO0FBQUEsTUFDRjtBQUVBLFlBQU0sYUFBa0IsZ0JBQVUsWUFBWSxFQUFFLFFBQVEsaUJBQWlCLEVBQUU7QUFDM0UsVUFBSSxDQUFDLGNBQWMsV0FBVyxXQUFXLElBQUksS0FBSyxXQUFXLFdBQVcsR0FBRyxHQUFHO0FBQzVFLFlBQUksVUFBVSxHQUFHO0FBQUcsWUFBSSxJQUFJLFdBQVc7QUFDdkM7QUFBQSxNQUNGO0FBQ0EsVUFBSSxDQUFDLEtBQUssZUFBZTtBQUN2QixZQUFJLFVBQVUsR0FBRztBQUFHLFlBQUksSUFBSSxnQ0FBZ0M7QUFDNUQ7QUFBQSxNQUNGO0FBRUEsWUFBTSxXQUFnQixXQUFLLEtBQUssZUFBZSxVQUFVO0FBQ3pELFVBQUksQ0FBQyxTQUFTLFdBQVcsS0FBSyxhQUFhLEdBQUc7QUFDNUMsWUFBSSxVQUFVLEdBQUc7QUFBRyxZQUFJLElBQUksV0FBVztBQUN2QztBQUFBLE1BQ0Y7QUFFQSxNQUFHLFNBQUssVUFBVSxDQUFDLEtBQUssVUFBVTtBQUNoQyxZQUFJLE9BQU8sQ0FBQyxNQUFNLE9BQU8sR0FBRztBQUMxQixjQUFJLFVBQVUsR0FBRztBQUFHLGNBQUksSUFBSSxnQkFBZ0I7QUFDNUM7QUFBQSxRQUNGO0FBQ0EsY0FBTSxjQUFjLFdBQVcsR0FBRyxLQUFLO0FBQ3ZDLFlBQUksVUFBVSxLQUFLO0FBQUEsVUFDakIsZ0JBQWdCO0FBQUEsVUFDaEIsa0JBQWtCLE1BQU07QUFBQSxVQUN4QiwrQkFBK0I7QUFBQSxVQUMvQixpQkFBaUI7QUFBQSxRQUNuQixDQUFDO0FBQ0QsY0FBTSxTQUEyQixxQkFBaUIsUUFBUTtBQUMxRCxlQUFPLEtBQUssR0FBRztBQUNmLGVBQU8sR0FBRyxTQUFTLE1BQU07QUFDdkIsY0FBSSxDQUFDLElBQUksYUFBYTtBQUNwQixnQkFBSSxVQUFVLEdBQUc7QUFDakIsZ0JBQUksSUFBSSxjQUFjO0FBQUEsVUFDeEI7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNILENBQUM7QUFBQSxJQUNILFNBQVMsR0FBUTtBQUNmLFVBQUksQ0FBQyxJQUFJLGFBQWE7QUFDcEIsWUFBSSxVQUFVLEdBQUc7QUFDakIsZ0JBQVEsTUFBTSxxQ0FBcUMsQ0FBQztBQUNwRCxZQUFJLElBQUksdUJBQXVCO0FBQUEsTUFDakM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxlQUFnQztBQUN0QyxXQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxZQUFNLFNBQWEsaUJBQWE7QUFDaEMsYUFBTyxPQUFPLEdBQUcsYUFBYSxNQUFNO0FBQ2xDLGNBQU0sT0FBUSxPQUFPLFFBQVEsRUFBc0I7QUFDbkQsZUFBTyxNQUFNLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFBQSxNQUNsQyxDQUFDO0FBQ0QsYUFBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLElBQzNCLENBQUM7QUFBQSxFQUNIO0FBQ0Y7OztBQ3BXQSxJQUFBQyxtQkFBK0M7QUFDL0MsSUFBQUMsUUFBc0I7QUFDdEIsSUFBQUMsTUFBb0I7QUFzQmIsSUFBTSxtQkFBeUM7QUFBQSxFQUNwRCxVQUFVO0FBQUEsRUFDVixvQkFBb0I7QUFBQSxFQUNwQixlQUFlO0FBQUEsRUFDZixXQUFXO0FBQUEsRUFDWCxXQUFXO0FBQUEsRUFDWCxZQUFZLENBQUM7QUFBQSxFQUNiLHVCQUF1QjtBQUN6QjtBQUtPLElBQU0saUJBQU4sY0FBNkIsa0NBQWlCO0FBQUEsRUFHbkQsWUFBWSxLQUFVLFFBQTRCO0FBQ2hELFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFDeEIsZ0JBQVksTUFBTTtBQUNsQixnQkFBWSxTQUFTLHdCQUF3QjtBQUU3QyxRQUFJLHlCQUFRLFdBQVcsRUFBRSxRQUFRLCtDQUFZLEVBQUUsV0FBVztBQUcxRCxRQUFJLHlCQUFRLFdBQVcsRUFBRSxRQUFRLDBCQUFNLEVBQUUsV0FBVztBQUdwRCxRQUFJLHlCQUFRLFdBQVcsRUFDcEIsUUFBUSxzQ0FBUSxFQUNoQixRQUFRLHVJQUE4QixFQUN0QztBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxlQUFlLEVBQzlCLFNBQVMsS0FBSyxPQUFPLFNBQVMsUUFBUSxFQUN0QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxXQUFXLFNBQVM7QUFDekMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsZ0RBQWtCLEVBQzFCLFFBQVEsMkpBQXdDLEVBQ2hEO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FDRyxTQUFTLEtBQUssT0FBTyxTQUFTLGtCQUFrQixFQUNoRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxxQkFBcUI7QUFDMUMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSwwQkFBTSxFQUFFLFdBQVc7QUFFcEQsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsNENBQVMsRUFDakIsUUFBUSwrS0FBd0MsRUFDaEQ7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsc0NBQVEsRUFDdkIsU0FBUyxLQUFLLE9BQU8sU0FBUyxTQUFTLEVBQ3ZDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLFlBQVksU0FBUztBQUMxQyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0w7QUFHRixRQUFJLHlCQUFRLFdBQVcsRUFBRSxRQUFRLG9CQUFLLEVBQUUsV0FBVztBQUVuRCxRQUFJLHlCQUFRLFdBQVcsRUFDcEIsUUFBUSxzQ0FBUSxFQUNoQixRQUFRLHNSQUFxRCxFQUM3RDtBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSwrREFBYSxFQUM1QixTQUFTLEtBQUssT0FBTyxTQUFTLFNBQVMsRUFDdkMsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsWUFBWSxNQUFNLEtBQUs7QUFDNUMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSwwQkFBTSxFQUFFLFdBQVc7QUFFcEQsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsK0NBQWlCLEVBQ3pCLFFBQVEsa01BQWlELEVBQ3pEO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FDRyxTQUFTLEtBQUssT0FBTyxTQUFTLHFCQUFxQixFQUNuRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyx3QkFBd0I7QUFDN0MsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixZQUFJLENBQUMsT0FBTztBQUNWLHNCQUFZLGdCQUFnQjtBQUFBLFFBQzlCO0FBQ0EsY0FBTSxRQUFRLGVBQWUsY0FBYyxzQkFBc0I7QUFDakUsWUFBSSxPQUFPLGVBQWU7QUFDeEIsZ0JBQU0sY0FBYyxZQUFZO0FBQUEsWUFDOUIsTUFBTTtBQUFBLFlBQ04sSUFBSSxjQUFjLEtBQUssSUFBSTtBQUFBLFlBQzNCLFNBQVMsRUFBRSxTQUFTLE1BQU07QUFBQSxVQUM1QixHQUFHLEdBQUc7QUFBQSxRQUNSO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDTDtBQUdGLFFBQUkseUJBQVEsV0FBVyxFQUFFLFFBQVEsY0FBSSxFQUFFLFdBQVc7QUFHbEQsVUFBTSxZQUFZLFlBQVksVUFBVSxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDcEUsY0FBVSxTQUFTLEtBQUssRUFBRSxNQUFNLDRCQUFRLEtBQUsscUJBQXFCLENBQUM7QUFDbkUsY0FBVSxTQUFTLEtBQUs7QUFBQSxNQUN0QixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsSUFDUCxDQUFDO0FBR0QsVUFBTSxZQUFZLFlBQVksVUFBVSxFQUFFLEtBQUssd0NBQXdDLENBQUM7QUFDeEYsVUFBTSxZQUFZLFVBQVUsVUFBVSxFQUFFLEtBQUssMEJBQTBCLENBQUM7QUFDeEUsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUssc0JBQXNCLENBQUM7QUFHakUsUUFBSTtBQUNGLFlBQU0sWUFBYSxLQUFLLE9BQU8sU0FBaUI7QUFDaEQsWUFBTSxnQkFBaUIsS0FBSyxJQUFJLE1BQU0sUUFBZ0IsWUFBWTtBQUNsRSxZQUFNLGFBQWE7QUFBQSxRQUNaLFdBQUssZUFBZSxXQUFXLG1CQUFtQjtBQUFBO0FBQUEsUUFDbEQsV0FBSyxlQUFlLFdBQVcsVUFBVSxVQUFVLFVBQVUsbUJBQW1CO0FBQUE7QUFBQSxNQUN2RjtBQUNBLGlCQUFXLGNBQWMsWUFBWTtBQUNuQyxZQUFPLGVBQVcsVUFBVSxHQUFHO0FBQzdCLGdCQUFNLGFBQWdCLGlCQUFhLFVBQVU7QUFDN0MsZ0JBQU0sTUFBTSxXQUFXLFNBQVMsUUFBUTtBQUN4QyxpQkFBTyxhQUFhO0FBQUEsWUFDbEIsaUJBQWlCLDhCQUE4QixHQUFHO0FBQUEsVUFDcEQsQ0FBQztBQUNEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFFBQVE7QUFBQSxJQUFrRDtBQUcxRCxVQUFNLGFBQWEsVUFBVSxVQUFVLEVBQUUsS0FBSywyQkFBMkIsQ0FBQztBQUMxRSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0sc0JBQU8sS0FBSywyQkFBMkIsQ0FBQztBQUN6RSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0sd0NBQVUsS0FBSywyQkFBMkIsQ0FBQztBQUc1RSxjQUFVLFNBQVMsS0FBSyxFQUFFLE1BQU0scUNBQWlCLEtBQUssMkJBQTJCLENBQUM7QUFDbEYsVUFBTSxXQUFXLFVBQVUsVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFFdEU7QUFBQSxNQUFDLEVBQUUsTUFBTSw0QkFBUSxLQUFLLHNEQUFzRDtBQUFBLE1BQzNFLEVBQUUsTUFBTSxrQ0FBUyxLQUFLLDBEQUEwRDtBQUFBLElBQUMsRUFBRSxRQUFRLFVBQVE7QUFDbEcsWUFBTSxNQUFNLFNBQVMsU0FBUyxRQUFRLEVBQUUsTUFBTSxLQUFLLE1BQU0sS0FBSyxtQkFBbUIsQ0FBQztBQUNsRixVQUFJLEtBQUssS0FBSztBQUNaLFlBQUksYUFBYSxFQUFFLFFBQVEsVUFBVSxDQUFDO0FBQ3RDLFlBQUksaUJBQWlCLFNBQVMsTUFBTTtBQUNsQyxpQkFBTyxLQUFLLEtBQUssS0FBSyxRQUFRO0FBQUEsUUFDaEMsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGLENBQUM7QUFHRCxVQUFNLGFBQWEsWUFBWSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsQ0FBQztBQUNyRSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0sNEJBQVEsS0FBSyxxQkFBcUIsQ0FBQztBQUNwRSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0seUNBQTBCLEtBQUssb0JBQW9CLENBQUM7QUFDckYsZUFBVyxTQUFTLEtBQUssRUFBRSxNQUFNLDZCQUFjLEtBQUssb0JBQW9CLENBQUM7QUFBQSxFQUMzRTtBQUNGOzs7QVRsTEEsZUFBZSxXQUFXLFFBQXlCLFNBQWdDO0FBQ2pGLFFBQU0sTUFBTSxPQUFPLFdBQVcsV0FBVyxNQUFTLGFBQVMsU0FBUyxNQUFNLElBQUk7QUFDOUUsTUFBSSxNQUFNO0FBRVYsUUFBTSxTQUFTLE1BQU07QUFBRSxVQUFNLElBQUksSUFBSSxhQUFhLEdBQUc7QUFBRyxXQUFPO0FBQUcsV0FBTztBQUFBLEVBQUc7QUFDNUUsUUFBTSxTQUFTLE1BQU07QUFBRSxVQUFNLElBQUksSUFBSSxhQUFhLEdBQUc7QUFBRyxXQUFPO0FBQUcsV0FBTztBQUFBLEVBQUc7QUFDNUUsUUFBTSxPQUFPLENBQUMsTUFBYztBQUFFLFdBQU87QUFBQSxFQUFHO0FBRXhDLFFBQU0sU0FBMEIsQ0FBQztBQUdqQyxTQUFPLE1BQU0sSUFBSSxTQUFTLEdBQUc7QUFDM0IsVUFBTSxNQUFNLElBQUksYUFBYSxHQUFHO0FBQ2hDLFFBQUksUUFBUSxTQUFZO0FBRXhCLFdBQU87QUFDUCxXQUFPO0FBQ1AsV0FBTztBQUNQLFVBQU0sU0FBUyxPQUFPO0FBQ3RCLFNBQUssQ0FBQztBQUNOLFdBQU87QUFDUCxVQUFNLGlCQUFpQixPQUFPO0FBQzlCLFVBQU0sbUJBQW1CLE9BQU87QUFDaEMsVUFBTSxVQUFVLE9BQU87QUFDdkIsVUFBTSxXQUFXLE9BQU87QUFDeEIsVUFBTSxXQUFXLElBQUksU0FBUyxTQUFTLEtBQUssTUFBTSxPQUFPO0FBQ3pELFdBQU8sVUFBVTtBQUdqQixRQUFJLFNBQVMsU0FBUyxHQUFHLEtBQUssU0FBUyxTQUFTLElBQUksR0FBRztBQUNyRCxhQUFPO0FBQ1A7QUFBQSxJQUNGO0FBRUEsVUFBTSxVQUFlLFdBQUssU0FBUyxRQUFRO0FBQzNDLFVBQU0sTUFBVyxjQUFRLE9BQU87QUFFaEMsVUFBTSxPQUFPLElBQUksU0FBUyxLQUFLLE1BQU0sY0FBYztBQUNuRCxXQUFPO0FBRVAsUUFBSSxXQUFXLEdBQUc7QUFDaEIsYUFBTyxLQUFRLGFBQVMsTUFBTSxLQUFLLEVBQUUsV0FBVyxLQUFLLENBQUMsRUFBRSxLQUFLLE1BQVMsYUFBUyxVQUFVLFNBQVMsSUFBSSxDQUFDLENBQUM7QUFDeEc7QUFBQSxJQUNGO0FBRUEsUUFBSSxXQUFXLEdBQUc7QUFDaEIsYUFBTyxNQUFNLFlBQVk7QUFDdkIsWUFBSTtBQUNKLFlBQUk7QUFDRixrQkFBYSxvQkFBZSxNQUFNLEVBQUUsYUFBa0IsZUFBVSxhQUFhLENBQUM7QUFDOUUsY0FBSSxNQUFNLFdBQVcsaUJBQWtCLFNBQVEsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCO0FBQUEsUUFDbkYsUUFBUTtBQUNOLGtCQUFhLGlCQUFZLElBQUk7QUFBQSxRQUMvQjtBQUNBLGNBQVMsYUFBUyxNQUFNLEtBQUssRUFBRSxXQUFXLEtBQUssQ0FBQztBQUNoRCxjQUFTLGFBQVMsVUFBVSxTQUFTLEtBQUs7QUFBQSxNQUM1QyxHQUFHLENBQUM7QUFDSjtBQUFBLElBQ0Y7QUFFQSxVQUFNLElBQUksTUFBTSxxQ0FBcUMsU0FBUyxPQUFPLFdBQVcsR0FBRztBQUFBLEVBQ3JGO0FBQ0Y7QUFHQSxTQUFTLHlCQUF5QixXQUFtQixTQUFpQixTQUFnQztBQUNwRyxTQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0QyxVQUFNLE1BQU0sNkVBQTZFLE9BQU87QUFDaEcsSUFBTSxXQUFJLEtBQUssRUFBRSxTQUFTLEVBQUUsY0FBYyw0QkFBNEIsRUFBRSxHQUFHLENBQUMsUUFBUTtBQUNsRixVQUFJLElBQUksZUFBZSxPQUFPLElBQUksZUFBZSxLQUFLO0FBRXBELFFBQU0sV0FBSSxJQUFJLFFBQVEsWUFBWSxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLFVBQVU7QUFDM0csZ0JBQU1DLFVBQW1CLENBQUM7QUFDMUIsZ0JBQU0sR0FBRyxRQUFRLENBQUMsTUFBY0EsUUFBTyxLQUFLLENBQUMsQ0FBQztBQUM5QyxnQkFBTSxHQUFHLE9BQU8sTUFBTTtBQUNwQixnQkFBSTtBQUNGLHlCQUFXLE9BQU8sT0FBT0EsT0FBTSxHQUFHLE9BQU8sRUFBRSxLQUFLLE9BQU8sRUFBRSxNQUFNLE1BQU07QUFBQSxZQUN2RSxTQUFTLEdBQUc7QUFBRSxxQkFBTyxDQUFDO0FBQUEsWUFBRztBQUFBLFVBQzNCLENBQUM7QUFDRCxnQkFBTSxHQUFHLFNBQVMsTUFBTTtBQUFBLFFBQzFCLENBQUMsRUFBRSxHQUFHLFNBQVMsTUFBTTtBQUNyQjtBQUFBLE1BQ0Y7QUFDQSxVQUFJLElBQUksZUFBZSxLQUFLO0FBQzFCLGVBQU8sSUFBSSxNQUFNLFFBQVEsSUFBSSxVQUFVLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDbEQ7QUFBQSxNQUNGO0FBQ0EsWUFBTSxTQUFtQixDQUFDO0FBQzFCLFVBQUksR0FBRyxRQUFRLENBQUMsTUFBYyxPQUFPLEtBQUssQ0FBQyxDQUFDO0FBQzVDLFVBQUksR0FBRyxPQUFPLE1BQU07QUFDbEIsWUFBSTtBQUNGLHFCQUFXLE9BQU8sT0FBTyxNQUFNLEdBQUcsT0FBTyxFQUFFLEtBQUssT0FBTyxFQUFFLE1BQU0sTUFBTTtBQUFBLFFBQ3ZFLFNBQVMsR0FBRztBQUFFLGlCQUFPLENBQUM7QUFBQSxRQUFHO0FBQUEsTUFDM0IsQ0FBQztBQUNELFVBQUksR0FBRyxTQUFTLE1BQU07QUFBQSxJQUN4QixDQUFDLEVBQUUsR0FBRyxTQUFTLE1BQU07QUFBQSxFQUN2QixDQUFDO0FBQ0g7QUFHQSxTQUFTLHdCQUVQLFdBQ0EsV0FDQSxlQUNBLGdCQUNNO0FBQ04sUUFBTSxvQkFBeUIsV0FBSyxXQUFXLFVBQVU7QUFDekQsUUFBTSxjQUFjLENBQUksZUFBVyxpQkFBaUIsTUFDakQsTUFBTTtBQUFFLFFBQUk7QUFBRSxhQUFVLGlCQUFhLG1CQUFtQixPQUFPLEVBQUUsS0FBSyxNQUFNO0FBQUEsSUFBZ0IsUUFBUTtBQUFFLGFBQU87QUFBQSxJQUFNO0FBQUEsRUFBRSxHQUFHO0FBRTNILE1BQUksQ0FBQyxhQUFhO0FBQ2hCLFNBQUssY0FBYztBQUNuQjtBQUFBLEVBQ0Y7QUFHQSxlQUFhLFlBQVk7QUFDdkIsUUFBSTtBQUNGLFVBQU8sZUFBVyxTQUFTLEdBQUc7QUFDNUIsWUFBSTtBQUFFLFVBQUcsV0FBTyxXQUFXLEVBQUUsV0FBVyxNQUFNLE9BQU8sS0FBSyxDQUFDO0FBQUEsUUFBRyxRQUFRO0FBQUEsUUFBQztBQUFBLE1BQ3pFO0FBQ0EsWUFBTSxZQUFpQixXQUFLLGVBQWUsV0FBVyxZQUFZO0FBQ2xFLE1BQUcsY0FBVSxXQUFXLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFFM0MsVUFBTyxlQUFXLFNBQVMsR0FBRztBQUM1QixZQUFJLE9BQU8sb0ZBQW1CLENBQUM7QUFDL0IsY0FBTSxXQUFXLFdBQVcsU0FBUztBQUNyQyxZQUFJO0FBQUUsVUFBRyxlQUFXLFNBQVM7QUFBQSxRQUFHLFFBQVE7QUFBQSxRQUFDO0FBQ3pDLFlBQUksT0FBTyx3RUFBaUIsR0FBSTtBQUFBLE1BQ2xDLE9BQU87QUFDTCxjQUFNLGlCQUFpQixJQUFJLE9BQU8sb0ZBQW1CLENBQUM7QUFDdEQsZ0JBQVEsTUFBTSxrREFBa0QsY0FBYztBQUM5RSxjQUFNLHlCQUF5QixXQUFXLFdBQVcsY0FBYztBQUNuRSx1QkFBZSxLQUFLO0FBQ3BCLFlBQUksT0FBTyw4RUFBa0IsR0FBSTtBQUFBLE1BQ25DO0FBRUEsTUFBRyxrQkFBYyxtQkFBbUIsZ0JBQWdCLE9BQU87QUFDM0QsV0FBSyxjQUFjO0FBQUEsSUFDckIsU0FBUyxHQUFHO0FBQ1YsY0FBUSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3RELFVBQUksT0FBTyw2SUFBb0MsQ0FBQztBQUFBLElBQ2xEO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFQSxJQUFxQixxQkFBckIsY0FBZ0Qsd0JBQU87QUFBQSxFQUF2RDtBQUFBO0FBQ0Usb0JBQWlDO0FBQ2pDLFNBQVEsY0FBa0M7QUFDMUMsU0FBUSxZQUFZO0FBRXBCO0FBQUEsdUJBQWM7QUFBQTtBQUFBLEVBRWQsTUFBTSxTQUF3QjtBQUU1QixVQUFNLEtBQUssYUFBYTtBQUd4QixVQUFNLFlBQWEsS0FBSyxTQUFpQjtBQUN6QyxRQUFJLFdBQVc7QUFDYixZQUFNLGdCQUFpQixLQUFLLElBQUksTUFBTSxRQUFnQixZQUFZO0FBQ2xFLFlBQU0sWUFBaUIsV0FBSyxlQUFlLFdBQVcsUUFBUTtBQUM5RCxZQUFNLGtCQUF1QixXQUFLLFdBQVcsWUFBWTtBQUN6RCxXQUFLLGNBQWMsSUFBSSxZQUFZLFNBQVM7QUFHNUMsVUFBSTtBQUNGLGNBQU0sS0FBSyxZQUFZLE1BQU07QUFDN0IsYUFBSyxZQUFZLEtBQUssWUFBWSxPQUFPO0FBQ3pDLGFBQUssWUFBWSxpQkFBaUIsYUFBYTtBQUUvQyxZQUFPLGVBQVcsZUFBZSxHQUFHO0FBQ2xDLGVBQUssY0FBYztBQUFBLFFBQ3JCO0FBQUEsTUFDRixTQUFTLEdBQUc7QUFDVixnQkFBUSxNQUFNLGdEQUFnRCxDQUFDO0FBQy9ELFlBQUksT0FBTyw0TUFBdUMsQ0FBQztBQUFBLE1BQ3JEO0FBR0EsOEJBQXdCLEtBQUssTUFBTSxXQUFXLFdBQVcsZUFBZSxLQUFLLFNBQVMsT0FBTztBQUFBLElBQy9GO0FBR0EsU0FBSyxhQUFhLHdCQUF3QixDQUFDLFNBQXdCO0FBQ2pFLGFBQU8sSUFBSSxnQkFBZ0IsTUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLGFBQWEsQ0FBQztBQUFBLElBQ2pHLENBQUM7QUFHRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxLQUFLLGFBQWE7QUFBQSxJQUNwQyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhLGFBQWE7QUFBQSxJQUNqRCxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhLGFBQWE7QUFBQSxJQUNqRCxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhLFdBQVc7QUFBQSxJQUMvQyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhLGtCQUFrQjtBQUFBLElBQ3RELENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxLQUFLLGFBQWEscUJBQXFCO0FBQUEsSUFDekQsQ0FBQztBQUdELFNBQUssY0FBYyxJQUFJLGVBQWUsS0FBSyxLQUFLLElBQUksQ0FBQztBQUdyRCxTQUFLLGNBQWMsUUFBUSxrQ0FBUyxNQUFNO0FBQ3hDLFdBQUssS0FBSyxhQUFhO0FBQUEsSUFDekIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVBLFdBQWlCO0FBQ2YsZ0JBQVksZ0JBQWdCO0FBQzVCLFNBQUssS0FBSyxhQUFhLEtBQUs7QUFDNUIsU0FBSyxjQUFjO0FBQUEsRUFDckI7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEVBQUUsVUFBVSxJQUFJLEtBQUs7QUFFM0IsUUFBSSxPQUE2QjtBQUNqQyxVQUFNLFNBQVMsVUFBVSxnQkFBZ0Isc0JBQXNCO0FBRS9ELFFBQUksT0FBTyxTQUFTLEdBQUc7QUFFckIsYUFBTyxPQUFPLENBQUM7QUFBQSxJQUNqQixPQUFPO0FBRUwsYUFBTyxVQUFVLFFBQVEsS0FBSztBQUM5QixZQUFNLEtBQUssYUFBYTtBQUFBLFFBQ3RCLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBRUEsUUFBSSxNQUFNO0FBQ1IsWUFBTSxVQUFVLFdBQVcsSUFBSTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxhQUFhLE1BQW9CO0FBQ3ZDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0Isc0JBQXNCO0FBQ3hFLFFBQUksT0FBTyxXQUFXLEVBQUc7QUFFekIsVUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLFVBQU0sU0FBVSxLQUFhO0FBQzdCLFFBQUksUUFBUSxlQUFlO0FBQ3pCLFVBQUksU0FBUztBQUNiLFVBQUk7QUFBRSxpQkFBUyxJQUFJLElBQUksT0FBTyxHQUFHLEVBQUU7QUFBQSxNQUFRLFFBQVE7QUFBQSxNQUFpQjtBQUNwRSxhQUFPLGNBQWM7QUFBQSxRQUNuQixFQUFFLE1BQU0sSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQUEsUUFDaEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQzNFO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsRUFDbkM7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAiaHR0cHMiLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJzdGF0IiwgInN0YXQiLCAiZnMiLCAicGF0aCIsICJpbXBvcnRfb2JzaWRpYW4iLCAicGF0aCIsICJmcyIsICJjaHVua3MiXQp9Cg==
