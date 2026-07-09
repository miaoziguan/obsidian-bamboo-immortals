"use strict";
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

// src/storage/ImportValidator.ts
var ImportValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ImportValidationError";
  }
};
var KNOWN_FIELDS = ["days", "goals", "settings", "purchaseHistory", "incomeHistory"];
var ImportValidator = {
  /**
   * 校验并补齐导入数据。
   * @returns 补齐后的干净数据（结构与输入一致，但字段完整）
   * @throws ImportValidationError 当结构损坏无法修复时
   */
  validate(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new ImportValidationError("\u5907\u4EFD\u6587\u4EF6\u683C\u5F0F\u65E0\u6548\uFF1A\u6839\u8282\u70B9\u5FC5\u987B\u662F JSON \u5BF9\u8C61");
    }
    const record = data;
    const hasKnownField = KNOWN_FIELDS.some((f) => record[f] !== void 0);
    if (!hasKnownField) {
      throw new ImportValidationError(
        "\u5907\u4EFD\u6587\u4EF6\u65E0\u6548\uFF1A\u672A\u627E\u5230\u4EFB\u4F55\u53EF\u8BC6\u522B\u7684\u6570\u636E\u5B57\u6BB5\uFF08days / goals / settings / purchaseHistory / incomeHistory\uFF09"
      );
    }
    const result = {};
    if (record.days !== void 0) {
      result.days = ImportValidator.normalizeDays(record.days);
    }
    if (record.goals !== void 0) {
      result.goals = ImportValidator.normalizeGoals(record.goals);
    }
    if (record.settings !== void 0) {
      result.settings = ImportValidator.normalizeSettings(record.settings);
    }
    if (record.purchaseHistory !== void 0) {
      result.purchaseHistory = record.purchaseHistory;
    }
    if (record.incomeHistory !== void 0) {
      result.incomeHistory = record.incomeHistory;
    }
    return result;
  },
  /**
   * 归一化 days。
   *  - 必须是对象；非对象（如数组/字符串）→ 视为无日数据，返回空对象（不污染 Vault）
   *  - 每个 day 缺 date 时用其 key 补齐
   *  - 每个 day 缺 metrics/timeline/goals 时补空结构
   */
  normalizeDays(days) {
    if (!days || typeof days !== "object" || Array.isArray(days)) {
      return {};
    }
    const raw = days;
    const out = {};
    for (const key of Object.keys(raw)) {
      const day = raw[key];
      if (!day || typeof day !== "object" || Array.isArray(day)) {
        continue;
      }
      const clean = { ...day };
      if (!clean.date) clean.date = key;
      if (!clean.metrics || typeof clean.metrics !== "object") clean.metrics = {};
      if (!clean.timeline || !Array.isArray(clean.timeline)) clean.timeline = [];
      if (!clean.goals || !Array.isArray(clean.goals)) clean.goals = [];
      out[key] = clean;
    }
    return out;
  },
  /**
   * 归一化 goals。
   *  - 必须是数组；非数组 → 返回空数组
   *  - 每个 goal 缺 id 时补一个稳定可复现的 id
   */
  normalizeGoals(goals) {
    if (!Array.isArray(goals)) {
      return [];
    }
    let counter = 0;
    return goals.map((raw) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
      const obj = raw;
      const clean = { ...obj };
      if (!clean.id) {
        clean.id = `goal_import_${counter++}_${Date.now().toString(36)}`;
      }
      if (clean.items && !Array.isArray(clean.items)) clean.items = [];
      return clean;
    });
  },
  /**
   * 归一化 settings。
   *  - 必须是对象；非对象 → 返回空对象
   */
  normalizeSettings(settings) {
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return {};
    }
    return settings;
  }
};

// src/storage/VaultStorage.ts
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
  async importData(data, options = {}) {
    await this.ensureStructure();
    const strategy = options.strategy ?? "overwrite";
    const record = ImportValidator.validate(data);
    if (record.days !== void 0) {
      const days = record.days && typeof record.days === "object" && !Array.isArray(record.days) ? record.days : {};
      if (strategy === "overwrite") {
        await this.clearAllDays();
      }
      for (const day of Object.values(days)) {
        await this.putDay(day);
      }
    }
    if (record.goals !== void 0) {
      const incoming = Array.isArray(record.goals) ? record.goals : [];
      if (strategy === "merge") {
        const existing = await this.getGoals() || [];
        const merged = new Map(existing.map((g) => [g.id, g]));
        for (const goal of incoming) {
          if (goal && goal.id) merged.set(goal.id, goal);
        }
        await this.putGoals(Array.from(merged.values()));
      } else {
        await this.putGoals(incoming);
      }
    }
    if (record.settings !== void 0 && record.settings && typeof record.settings === "object") {
      const incoming = record.settings;
      let toWrite;
      if (strategy === "merge") {
        const existing = await this.getAllSettings() || {};
        toWrite = { ...existing, ...incoming };
      } else {
        toWrite = incoming;
      }
      await this.vaultWrite(this.settingsPath(), JSON.stringify(toWrite, null, 2));
    }
    if (record.purchaseHistory !== void 0) {
      await this.putPurchaseHistory(record.purchaseHistory);
    }
    if (record.incomeHistory !== void 0) {
      await this.putIncomeHistory(record.incomeHistory);
    }
  }
  /** 仅清空所有日数据（overwrite 导入 days 前调用，不影响 goals/settings） */
  async clearAllDays() {
    const dataDir = (0, import_obsidian.normalizePath)(`${this.basePath}/data`);
    if (await this.app.vault.adapter.exists(dataDir)) {
      await this.app.vault.adapter.rmdir(dataDir, true);
    }
    await this.ensureDir("data");
  }
  /** 仅清空设置文件（overwrite 导入 settings 前调用） */
  async clearAllSettings() {
    const path6 = this.settingsPath();
    if (await this.app.vault.adapter.exists(path6)) {
      await this.app.vault.adapter.remove(path6);
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
        return await this.storage.importData(message.payload.data, message.payload.options ?? {});
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
    this._paletteSyncTimer = null;
  }
  attachIframe(iframe) {
    this.iframe = iframe;
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
        this.settings.noiseItems = Array.isArray(msg.payload) ? msg.payload : [];
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
        const message = error instanceof Error ? error.message : "\u626B\u63CF\u5E93\u6587\u4EF6\u5931\u8D25";
        console.error("[Bamboo] \u626B\u63CF\u5E93\u5185\u97F3\u9891\u6587\u4EF6\u5931\u8D25:", error);
        this.respondError(msg.id, message);
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
        this.respondError(msg.id, error instanceof Error ? error.message : "\u8BFB\u53D6\u5E93\u6587\u4EF6\u5931\u8D25");
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
        this.respondError(msg.id, error instanceof Error ? error.message : "\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25");
      }
      return;
    }
    try {
      const result = await this.storageBridge.handle(msg);
      this.respond(msg.id, result);
    } catch (error) {
      this.respondError(msg.id, error instanceof Error ? error.message : "Unknown error");
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
    this.iframeErrorHandler = (_e) => {
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
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[BambooReview] \u8BFB\u53D6\u81EA\u5B9A\u4E49\u4E3B\u9898 ${entry} \u5931\u8D25:`, msg);
        }
      }
      if (themes.length > 0) {
        console.debug(`[BambooReview] \u53D1\u73B0 ${themes.length} \u4E2A\u81EA\u5B9A\u4E49\u4E3B\u9898:`, themes.map((t) => t.name));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.debug("[BambooReview] \u626B\u63CF\u81EA\u5B9A\u4E49\u4E3B\u9898\u65F6\u51FA\u9519:", msg);
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
      const pluginDir = this.plugin.manifest.dir ?? "";
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
function downloadAndExtractWebapp(_pluginDir, destDir, version) {
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
              reject(e instanceof Error ? e : new Error(String(e)));
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
          reject(e instanceof Error ? e : new Error(String(e)));
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
  setImmediate(() => {
    void (async () => {
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
          new import_obsidian4.Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u6B63\u5728\u89E3\u538B\u8D44\u6E90\u5305\u2026", 0);
          await extractZip(webappZip, webappDir);
          try {
            fs5.unlinkSync(webappZip);
          } catch {
          }
          new import_obsidian4.Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5DF2\u66F4\u65B0", 3e3);
        } else {
          const downloadNotice = new import_obsidian4.Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u6B63\u5728\u4E0B\u8F7D\u8D44\u6E90\u5305\u2026", 0);
          console.debug("[BambooReview] Downloading webapp from release", currentVersion);
          await downloadAndExtractWebapp(pluginDir, webappDir, currentVersion);
          downloadNotice.hide();
          new import_obsidian4.Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5B89\u88C5\u5B8C\u6210", 4e3);
        }
        fs5.writeFileSync(webappVersionFile, currentVersion, "utf-8");
        this.webappReady = true;
      } catch (e) {
        console.error("[BambooReview] Webapp setup failed:", e);
        new import_obsidian4.Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u8D44\u6E90\u5305\u5B89\u88C5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u542F Obsidian", 0);
      }
    })();
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
        new import_obsidian4.Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u672C\u5730\u670D\u52A1\u542F\u52A8\u5931\u8D25\uFF0C\u90E8\u5206\u529F\u80FD\uFF08\u767D\u566A\u97F3\u3001\u4E3B\u9898\u52A8\u6548\uFF09\u53EF\u80FD\u4E0D\u53EF\u7528", 0);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9JbXBvcnRWYWxpZGF0b3IudHMiLCAic3JjL3N0b3JhZ2UvTWFya2Rvd25TeW5jLnRzIiwgInNyYy9icmlkZ2UvU3RvcmFnZUJyaWRnZS50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvQnJpZGdlU2VydmljZS50cyIsICJzcmMvY29uc3RhbnRzL2F1ZGlvLnRzIiwgInNyYy9zZXJ2ZXIvTG9jYWxTZXJ2ZXIudHMiLCAic3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBQbHVnaW4sIFdvcmtzcGFjZUxlYWYsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IExvY2FsU2VydmVyIH0gZnJvbSAnLi9zcmMvc2VydmVyL0xvY2FsU2VydmVyJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9zcmMvYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG4vKiogXHU3RUFGIE5vZGUuanMgWklQIFx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1Nlx1N0NGQlx1N0VERiB1bnppcC9Qb3dlclNoZWxsXHUzMDAyXHU1RjAyXHU2QjY1XHU4QkZCXHU1M0Q2K1x1ODlFM1x1NTM4Qlx1RkYwQ1x1NEVDNVx1NUI1N1x1ODI4Mlx1ODlFM1x1Njc5MFx1NEZERFx1NjMwMVx1NTQwQ1x1NkI2NVx1MzAwMiAqL1xuYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFppcChzb3VyY2U6IHN0cmluZyB8IEJ1ZmZlciwgZGVzdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGJ1ZiA9IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoc291cmNlKSA6IHNvdXJjZTtcbiAgbGV0IHBvcyA9IDA7XG5cbiAgY29uc3QgcmVhZDE2ID0gKCkgPT4geyBjb25zdCB2ID0gYnVmLnJlYWRVSW50MTZMRShwb3MpOyBwb3MgKz0gMjsgcmV0dXJuIHY7IH07XG4gIGNvbnN0IHJlYWQzMiA9ICgpID0+IHsgY29uc3QgdiA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTsgcG9zICs9IDQ7IHJldHVybiB2OyB9O1xuICBjb25zdCBza2lwID0gKG46IG51bWJlcikgPT4geyBwb3MgKz0gbjsgfTtcblxuICBjb25zdCB3cml0ZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gIC8vIFx1NjI2Qlx1NjNDRlx1NjI0MFx1NjcwOSBsb2NhbCBmaWxlIGhlYWRlclx1RkYwOFx1N0I3RVx1NTQwRCAweDA0MDM0YjUwXHVGRjA5XG4gIHdoaWxlIChwb3MgPCBidWYubGVuZ3RoIC0gNCkge1xuICAgIGNvbnN0IHNpZyA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTtcbiAgICBpZiAoc2lnICE9PSAweDA0MDM0YjUwKSBicmVhaztcblxuICAgIHBvcyArPSA0O1xuICAgIHJlYWQxNigpOyAvLyB2ZXJzaW9uXG4gICAgcmVhZDE2KCk7IC8vIGZsYWdzXG4gICAgY29uc3QgbWV0aG9kID0gcmVhZDE2KCk7XG4gICAgc2tpcCg0KTsgLy8gbW9kIHRpbWUsIG1vZCBkYXRlXG4gICAgcmVhZDMyKCk7IC8vIGNyYzMyXG4gICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSByZWFkMzIoKTtcbiAgICBjb25zdCB1bmNvbXByZXNzZWRTaXplID0gcmVhZDMyKCk7XG4gICAgY29uc3QgbmFtZUxlbiA9IHJlYWQxNigpO1xuICAgIGNvbnN0IGV4dHJhTGVuID0gcmVhZDE2KCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBidWYudG9TdHJpbmcoJ3V0Zi04JywgcG9zLCBwb3MgKyBuYW1lTGVuKTtcbiAgICBwb3MgKz0gbmFtZUxlbiArIGV4dHJhTGVuO1xuXG4gICAgLy8gXHU4REYzXHU4RkM3XHU3NkVFXHU1RjU1XHU2NzYxXHU3NkVFXG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcvJykgfHwgZmlsZU5hbWUuZW5kc1dpdGgoJ1xcXFwnKSkge1xuICAgICAgcG9zICs9IGNvbXByZXNzZWRTaXplO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0UGF0aCA9IHBhdGguam9pbihkZXN0RGlyLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKG91dFBhdGgpO1xuXG4gICAgY29uc3QgZGF0YSA9IGJ1Zi5zdWJhcnJheShwb3MsIHBvcyArIGNvbXByZXNzZWRTaXplKTtcbiAgICBwb3MgKz0gY29tcHJlc3NlZFNpemU7XG5cbiAgICBpZiAobWV0aG9kID09PSAwKSB7XG4gICAgICB3cml0ZXMucHVzaChmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pLnRoZW4oKCkgPT4gZnMucHJvbWlzZXMud3JpdGVGaWxlKG91dFBhdGgsIGRhdGEpKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kID09PSA4KSB7XG4gICAgICB3cml0ZXMucHVzaCgoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYnl0ZXM6IEJ1ZmZlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBieXRlcyA9IHpsaWIuaW5mbGF0ZVJhd1N5bmMoZGF0YSwgeyBmaW5pc2hGbHVzaDogemxpYi5jb25zdGFudHMuWl9TWU5DX0ZMVVNIIH0pO1xuICAgICAgICAgIGlmIChieXRlcy5sZW5ndGggIT09IHVuY29tcHJlc3NlZFNpemUpIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMCwgdW5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGJ5dGVzID0gemxpYi5pbmZsYXRlU3luYyhkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy53cml0ZUZpbGUob3V0UGF0aCwgYnl0ZXMpO1xuICAgICAgfSkoKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZDogYCArIG1ldGhvZCArICcgKCcgKyBmaWxlTmFtZSArICcpJyk7XG4gIH1cbn1cblxuLyoqIFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEIgKi9cbmZ1bmN0aW9uIGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChfcGx1Z2luRGlyOiBzdHJpbmcsIGRlc3REaXI6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMvcmVsZWFzZXMvZG93bmxvYWQvJHt2ZXJzaW9ufS93ZWJhcHAuemlwYDtcbiAgICBodHRwcy5nZXQodXJsLCB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscycgfSB9LCAocmVzKSA9PiB7XG4gICAgICBpZiAocmVzLnN0YXR1c0NvZGUgPT09IDMwMiB8fCByZXMuc3RhdHVzQ29kZSA9PT0gMzAxKSB7XG4gICAgICAgIC8vIEZvbGxvdyByZWRpcmVjdFxuICAgICAgICBodHRwcy5nZXQocmVzLmhlYWRlcnMubG9jYXRpb24gfHwgJycsIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdvYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9IH0sIChyZWRpcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgICAgICByZWRpci5vbignZGF0YScsIChjOiBCdWZmZXIpID0+IGNodW5rcy5wdXNoKGMpKTtcbiAgICAgICAgICByZWRpci5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZXh0cmFjdFppcChCdWZmZXIuY29uY2F0KGNodW5rcyksIGRlc3REaXIpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUgaW5zdGFuY2VvZiBFcnJvciA/IGUgOiBuZXcgRXJyb3IoU3RyaW5nKGUpKSk7IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZWRpci5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQICR7cmVzLnN0YXR1c0NvZGV9OiAke3VybH1gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgIHJlcy5vbignZGF0YScsIChjOiBCdWZmZXIpID0+IGNodW5rcy5wdXNoKGMpKTtcbiAgICAgIHJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGV4dHJhY3RaaXAoQnVmZmVyLmNvbmNhdChjaHVua3MpLCBkZXN0RGlyKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUgaW5zdGFuY2VvZiBFcnJvciA/IGUgOiBuZXcgRXJyb3IoU3RyaW5nKGUpKSk7IH1cbiAgICAgIH0pO1xuICAgICAgcmVzLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgfSk7XG59XG5cbi8qKiBcdTU0MEVcdTUzRjBcdTVGMDJcdTZCNjVcdTUyMURcdTU5Q0JcdTUzMTYgd2ViYXBwXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFXHU2M0QyXHU0RUY2XHU3Njg0IG9ubG9hZCBcdThGRDRcdTU2REUgKi9cbmZ1bmN0aW9uIHNldHVwV2ViYXBwSW5CYWNrZ3JvdW5kKFxuICB0aGlzOiBCYW1ib29SZXZpZXdQbHVnaW4sXG4gIHdlYmFwcERpcjogc3RyaW5nLFxuICBwbHVnaW5EaXI6IHN0cmluZyxcbiAgdmF1bHRCYXNlUGF0aDogc3RyaW5nLFxuICBjdXJyZW50VmVyc2lvbjogc3RyaW5nXG4pOiB2b2lkIHtcbiAgY29uc3Qgd2ViYXBwVmVyc2lvbkZpbGUgPSBwYXRoLmpvaW4od2ViYXBwRGlyLCAnLnZlcnNpb24nKTtcbiAgY29uc3QgbmVlZHNVcGRhdGUgPSAhZnMuZXhpc3RzU3luYyh3ZWJhcHBWZXJzaW9uRmlsZSkgfHxcbiAgICAoKCkgPT4geyB0cnkgeyByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHdlYmFwcFZlcnNpb25GaWxlLCAndXRmLTgnKS50cmltKCkgIT09IGN1cnJlbnRWZXJzaW9uOyB9IGNhdGNoIHsgcmV0dXJuIHRydWU7IH0gfSkoKTtcblxuICBpZiAoIW5lZWRzVXBkYXRlKSB7XG4gICAgdGhpcy53ZWJhcHBSZWFkeSA9IHRydWU7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gXHU3NTI4IHNldEltbWVkaWF0ZSAvIHNldFRpbWVvdXQgXHU2M0E4XHU4RkRGXHU1MjMwXHU0RTBCXHU0RTAwXHU0RTJBIHRpY2tcdUZGMENcdTc4NkVcdTRGREQgb25sb2FkIFx1NTE0OFx1OEZENFx1NTZERVxuICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwRGlyKSkge1xuICAgICAgICB0cnkgeyBmcy5ybVN5bmMod2ViYXBwRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7IH0gY2F0Y2ggeyAvKiBcdTc2RUVcdTVGNTVcdTUzRUZcdTgwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTVGRkRcdTc1NjUgKi8gfVxuICAgICAgfVxuICAgICAgY29uc3Qgd2ViYXBwWmlwID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHBsdWdpbkRpciwgJ3dlYmFwcC56aXAnKTtcbiAgICAgIGZzLm1rZGlyU3luYyh3ZWJhcHBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyh3ZWJhcHBaaXApKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2QjYzXHU1NzI4XHU4OUUzXHU1MzhCXHU4RDQ0XHU2RTkwXHU1MzA1XHUyMDI2JywgMCk7XG4gICAgICAgIGF3YWl0IGV4dHJhY3RaaXAod2ViYXBwWmlwLCB3ZWJhcHBEaXIpO1xuICAgICAgICB0cnkgeyBmcy51bmxpbmtTeW5jKHdlYmFwcFppcCk7IH0gY2F0Y2ggeyAvKiBcdTg5RTNcdTUzOEJcdTRFQTdcdTcyNjlcdTVERjJcdTVDMzFcdTRGNERcdUZGMENcdTUyMjBcdTk2NjQgemlwIFx1NTkzMVx1OEQyNVx1NTNFRlx1NUZGRFx1NzU2NSAqLyB9XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1REYyXHU2NkY0XHU2NUIwJywgMzAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3dubG9hZE5vdGljZSA9IG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2QjYzXHU1NzI4XHU0RTBCXHU4RjdEXHU4RDQ0XHU2RTkwXHU1MzA1XHUyMDI2JywgMCk7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ1tCYW1ib29SZXZpZXddIERvd25sb2FkaW5nIHdlYmFwcCBmcm9tIHJlbGVhc2UnLCBjdXJyZW50VmVyc2lvbik7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXIsIHdlYmFwcERpciwgY3VycmVudFZlcnNpb24pO1xuICAgICAgICBkb3dubG9hZE5vdGljZS5oaWRlKCk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1Qjg5XHU4OEM1XHU1QjhDXHU2MjEwJywgNDAwMCk7XG4gICAgICB9XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMod2ViYXBwVmVyc2lvbkZpbGUsIGN1cnJlbnRWZXJzaW9uLCAndXRmLTgnKTtcbiAgICAgIHRoaXMud2ViYXBwUmVhZHkgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFdlYmFwcCBzZXR1cCBmYWlsZWQ6JywgZSk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1Qjg5XHU4OEM1XHU1OTMxXHU4RDI1XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU3RjUxXHU3RURDXHU1NDBFXHU5MUNEXHU1NDJGIE9ic2lkaWFuJywgMCk7XG4gICAgfVxuICAgIH0pKCk7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW1ib29SZXZpZXdQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIGxvY2FsU2VydmVyOiBMb2NhbFNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHNlcnZlclVybCA9ICcnO1xuICAvKiogd2ViYXBwIFx1OEQ0NFx1NkU5MFx1NjYyRlx1NTQyNlx1NUMzMVx1N0VFQVx1RkYwOFx1NTNFRlx1NzUyOFx1NEU4RVx1OTk5Nlx1NUM0Rlx1NUM1NVx1NzkzQSBsb2FkaW5nIFx1NzJCNlx1NjAwMVx1RkYwOSAqL1xuICB3ZWJhcHBSZWFkeSA9IGZhbHNlO1xuXG4gIGFzeW5jIG9ubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkVcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4XHU2NzJDXHU1NzMwIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XG4gICAgY29uc3QgcGx1Z2luRGlyID0gdGhpcy5tYW5pZmVzdC5kaXI7XG4gICAgaWYgKHBsdWdpbkRpcikge1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIHVua25vd24gYXMgeyBiYXNlUGF0aDogc3RyaW5nIH0pLmJhc2VQYXRoIHx8ICcnO1xuICAgICAgY29uc3Qgd2ViYXBwRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHBsdWdpbkRpciwgJ3dlYmFwcCcpO1xuICAgICAgY29uc3Qgd2ViYXBwSW5kZXhQYXRoID0gcGF0aC5qb2luKHdlYmFwcERpciwgJ2luZGV4Lmh0bWwnKTtcbiAgICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBuZXcgTG9jYWxTZXJ2ZXIod2ViYXBwRGlyKTtcblxuICAgICAgLy8gXHU3QUNCXHU1MzczXHU1NDJGXHU1MkE4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjA4XHU1MzczXHU0RjdGIHdlYmFwcCBcdThGRDhcdTZDQTFcdTVDMzFcdTdFRUFcdUZGMDlcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTU4NUUgb25sb2FkXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxvY2FsU2VydmVyLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuc2VydmVyVXJsID0gdGhpcy5sb2NhbFNlcnZlci5nZXRVcmwoKTtcbiAgICAgICAgdGhpcy5sb2NhbFNlcnZlci5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgICAgICAvLyBcdTU5ODJcdTY3OUMgd2ViYXBwIFx1NURGMlx1NUMzMVx1N0VFQVx1RkYwQ1x1NzZGNFx1NjNBNVx1NjgwN1x1OEJCMFxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh3ZWJhcHBJbmRleFBhdGgpKSB7XG4gICAgICAgICAgdGhpcy53ZWJhcHBSZWFkeSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gRmFpbGVkIHRvIHN0YXJ0IGxvY2FsIHNlcnZlcjonLCBlKTtcbiAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY3MkNcdTU3MzBcdTY3MERcdTUyQTFcdTU0MkZcdTUyQThcdTU5MzFcdThEMjVcdUZGMENcdTkwRThcdTUyMDZcdTUyOUZcdTgwRkRcdUZGMDhcdTc2N0RcdTU2NkFcdTk3RjNcdTMwMDFcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdUZGMDlcdTUzRUZcdTgwRkRcdTRFMERcdTUzRUZcdTc1MjgnLCAwKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU3MjQ4XHU2NzJDXHU4RERGXHU4RTJBICYgd2ViYXBwIFx1NEUwQlx1OEY3RFx1NjUzRVx1NTIzMFx1NTQwRVx1NTNGMFx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RSBvbmxvYWQgXHU4RkQ0XHU1NkRFXG4gICAgICBzZXR1cFdlYmFwcEluQmFja2dyb3VuZC5jYWxsKHRoaXMsIHdlYmFwcERpciwgcGx1Z2luRGlyLCB2YXVsdEJhc2VQYXRoLCB0aGlzLm1hbmlmZXN0LnZlcnNpb24pO1xuICAgIH1cblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0RBSUxZX1JFVklFVywgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGFpbHlSZXZpZXdWaWV3KGxlYWYsIHRoaXMuc2VydmVyVXJsLCB0aGlzLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnByZXZEYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6bmV4dERheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtdG9kYXknLFxuICAgICAgbmFtZTogJ1x1NTZERVx1NTIzMFx1NEVDQVx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjp0b2RheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TdGF0cycpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU2V0dGluZ3MnKSxcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9udW5sb2FkKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgIHZvaWQgdGhpcy5sb2NhbFNlcnZlcj8uc3RvcCgpO1xuICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1NkZDMFx1NkQzQlx1NjIxNlx1NTIxQlx1NUVGQVx1NTkwRFx1NzZEOFx1ODlDNlx1NTZGRSAqL1xuICBhc3luYyBhY3RpdmF0ZVZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwO1xuXG4gICAgbGV0IGxlYWY6IFdvcmtzcGFjZUxlYWYgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBsZWF2ZXMgPSB3b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuXG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBcdTVERjJcdTY3MDlcdTg5QzZcdTU2RkVcdUZGMENcdTc2RjRcdTYzQTVcdTgwNUFcdTcxMjZcbiAgICAgIGxlYWYgPSBsZWF2ZXNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NTIxQlx1NUVGQVx1NjVCMFx1ODlDNlx1NTZGRVxuICAgICAgbGVhZiA9IHdvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKTtcbiAgICAgIGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHtcbiAgICAgICAgdHlwZTogVklFV19UWVBFX0RBSUxZX1JFVklFVyxcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGxlYWYpIHtcbiAgICAgIGF3YWl0IHdvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYWYpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NUJGQ1x1ODIyQS9cdTY0Q0RcdTRGNUNcdTYzMDdcdTRFRTQgKi9cbiAgcHJpdmF0ZSBzZW5kVG9JZnJhbWUodHlwZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcbiAgICBpZiAobGVhdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdmlldyA9IGxlYXZlc1swXS52aWV3IGFzIERhaWx5UmV2aWV3VmlldztcbiAgICBjb25zdCBpZnJhbWUgPSAodmlldyBhcyB1bmtub3duIGFzIHsgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgfSkuaWZyYW1lO1xuICAgIGlmIChpZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIGxldCBvcmlnaW4gPSAnKic7XG4gICAgICB0cnkgeyBvcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjsgfSBjYXRjaCB7IC8qIGtlZXAgJyonICovIH1cbiAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgICB7IHR5cGUsIGlkOiAnY21kXycgKyBEYXRlLm5vdygpIH0sXG4gICAgICAgIG9yaWdpblxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKSBhcyBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgRXZlbnRSZWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9TdG9yYWdlQnJpZGdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7IEJyaWRnZVNlcnZpY2UgfSBmcm9tICcuLi9icmlkZ2UvQnJpZGdlU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX0RBSUxZX1JFVklFVyA9ICdiYW1ib28taW1tb3J0YWxzJztcblxuLyoqXG4gKiBEYWlseVJldmlld1ZpZXcgLSBcdTRFM0JcdTg5QzZcdTU2RkVcbiAqXG4gKiBcdTgwNENcdThEMjNcdTY3ODFcdTdCODBcdUZGMUFcbiAqIDEuIFx1NTIxQlx1NUVGQSBpZnJhbWUgXHU2MjdGXHU4RjdEIFBXQVxuICogMi4gXHU3QkExXHU3NDA2IEJyaWRnZVNlcnZpY2UgXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKiAzLiBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU1RTc2XHU1NDBDXHU2QjY1XG4gKi9cbmV4cG9ydCBjbGFzcyBEYWlseVJldmlld1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgYnJpZGdlU2VydmljZTogQnJpZGdlU2VydmljZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWVFcnJvckhhbmRsZXI6ICgoZTogRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUga2V5ZG93bkZvcndhcmRlcjogKChlOiBLZXlib2FyZEV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9jaGVja0ludGVydmFsOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjc3NDaGFuZ2VSZWY6IEV2ZW50UmVmIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgd2ViYXBwUGF0aDogc3RyaW5nO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgcHJpdmF0ZSBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCB3ZWJhcHBQYXRoOiBzdHJpbmcsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luLCBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPikge1xuICAgIHN1cGVyKGxlYWYpO1xuICAgIHRoaXMud2ViYXBwUGF0aCA9IHdlYmFwcFBhdGg7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0RBSUxZX1JFVklFVztcbiAgfVxuXG4gIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnO1xuICB9XG5cbiAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGVhZic7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LWNvbnRhaW5lcicpO1xuXG4gICAgaWYgKCF0aGlzLndlYmFwcFBhdGgpIHtcbiAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY1RTBcdTZDRDVcdTVCOUFcdTRGNEQgd2ViYXBwIFx1OEQ0NFx1NkU5MFx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNVx1NjNEMlx1NEVGNlx1NUI4OVx1ODhDNVx1NzZFRVx1NUY1NScsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gd2ViYXBwIFx1NUMxQVx1NjcyQVx1NUMzMVx1N0VFQVx1NjVGNlx1NjYzRVx1NzkzQSBsb2FkaW5nIFx1NTM2MFx1NEY0RFx1RkYwQ1x1NTQwRVx1NTNGMFx1NUYwMlx1NkI2NVx1NjJDOVx1NTMwNVx1ODlFM1x1NTMwNVxuICAgIGlmICghdGhpcy5wbHVnaW4ud2ViYXBwUmVhZHkpIHtcbiAgICAgIGNvbnN0IHN0YXR1c0VsID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTZCNjNcdTU3MjhcdTUyMURcdTU5Q0JcdTUzMTZcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTIwMjYnLFxuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWxvYWRpbmcnLFxuICAgICAgfSk7XG4gICAgICAvLyBcdThGNkVcdThCRTJcdTdCNDlcdTVGODVcdTVDMzFcdTdFRUFcdTU0MEVcdTUyQTBcdThGN0QgaWZyYW1lXG4gICAgICBsZXQgdGlja3MgPSAwO1xuICAgICAgdGhpcy5fY2hlY2tJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHRpY2tzKys7XG4gICAgICAgIGlmICh0aGlzLnBsdWdpbi53ZWJhcHBSZWFkeSkge1xuICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2NoZWNrSW50ZXJ2YWwhKTtcbiAgICAgICAgICB0aGlzLl9jaGVja0ludGVydmFsID0gbnVsbDtcbiAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgICB2b2lkIHRoaXMuc2V0dXBJZnJhbWUoY29udGFpbmVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gMzAgXHU3OUQyXHU1NDBFXHU2M0QwXHU3OTNBXHU3RjUxXHU3RURDXHU4RjgzXHU2MTYyXG4gICAgICAgIGlmICh0aWNrcyA9PT0gNjApIHtcbiAgICAgICAgICBzdGF0dXNFbC5zZXRUZXh0KCdcdTZCNjNcdTU3MjhcdTRFMEJcdThGN0RcdThENDRcdTZFOTBcdTUzMDVcdUZGMENcdTdGNTFcdTdFRENcdThGODNcdTYxNjJcdThCRjdcdTdBMERcdTUwMTlcdTIwMjYnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAxMjAgXHU3OUQyXHU1NDBFXHU2M0QwXHU3OTNBXHU1M0VGXHU4MEZEXHU1OTMxXHU4RDI1XG4gICAgICAgIGlmICh0aWNrcyA9PT0gMjQwKSB7XG4gICAgICAgICAgc3RhdHVzRWwuc2V0VGV4dCgnXHU4RDQ0XHU2RTkwXHU1MzA1XHU0RTBCXHU4RjdEXHU1RjAyXHU1RTM4XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU3RjUxXHU3RURDXHU1NDBFXHU5MUNEXHU1NDJGIE9ic2lkaWFuJyk7XG4gICAgICAgIH1cbiAgICAgIH0sIDUwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5zZXR1cElmcmFtZShjb250YWluZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZXR1cElmcmFtZShjb250YWluZXI6IEhUTUxFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU1MjFCXHU1RUZBIGlmcmFtZSAtIFx1NEUwRFx1NEY3Rlx1NzUyOCBzYW5kYm94XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU2QjYyIGFwcDovLyBcdTUzNEZcdThCQUVcdTRFMEJcdTc2ODRcdTVCNTBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcbiAgICB0aGlzLmlmcmFtZSA9IGNvbnRhaW5lci5jcmVhdGVFbCgnaWZyYW1lJywge1xuICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1mcmFtZScsXG4gICAgICBhdHRyOiB7XG4gICAgICAgIHNyYzogdGhpcy53ZWJhcHBQYXRoLFxuICAgICAgICBhbGxvdzogJ2NhbWVyYTsgbWljcm9waG9uZTsgY2xpcGJvYXJkLXJlYWQ7IGNsaXBib2FyZC13cml0ZScsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gaWZyYW1lIFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNVx1NjVGNlx1NjYzRVx1NzkzQVx1NjNEMFx1NzkzQVxuICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gKF9lOiBFdmVudCkgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gaWZyYW1lIGZhaWxlZCB0byBsb2FkOicsIHRoaXMud2ViYXBwUGF0aCk7XG4gICAgfTtcbiAgICB0aGlzLmlmcmFtZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKTtcblxuICAgIC8vIFx1NUY1MyBpZnJhbWUgXHU1OTA0XHU0RThFXHU3MTI2XHU3MEI5XHU2NUY2XHVGRjBDXHU1QzA2IEN0cmwvQ21kIFx1NUZFQlx1NjM3N1x1OTUyRVx1OEY2Q1x1NTNEMVx1N0VEOSBPYnNpZGlhblx1RkYwQ1xuICAgIC8vIFx1Nzg2RVx1NEZERFx1NTQ3RFx1NEVFNFx1OTc2Mlx1Njc3Rlx1RkYwOEN0cmwvQ21kK1BcdUZGMDlcdTMwMDFcdTVGRUJcdTkwMUZcdTUyMDdcdTYzNjJcdUZGMDhDdHJsL0NtZCtPXHVGRjA5XHU3QjQ5XHU1MTY4XHU1QzQwXHU1RkVCXHU2Mzc3XHU5NTJFXHU0RUNEXHU3MTM2XHU1M0VGXHU3NTI4XG4gICAgY29uc3Qgb2JzaWRpYW5Eb2MgPSBhY3RpdmVEb2N1bWVudDtcbiAgICBsZXQgZm9yd2FyZGluZyA9IGZhbHNlO1xuICAgIHRoaXMua2V5ZG93bkZvcndhcmRlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZm9yd2FyZGluZykgcmV0dXJuO1xuICAgICAgaWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkpIHtcbiAgICAgICAgZm9yd2FyZGluZyA9IHRydWU7XG4gICAgICAgIGNvbnN0IGV2dCA9IG5ldyBLZXlib2FyZEV2ZW50KCdrZXlkb3duJywge1xuICAgICAgICAgIGtleTogZS5rZXksXG4gICAgICAgICAgY29kZTogZS5jb2RlLFxuICAgICAgICAgIGN0cmxLZXk6IGUuY3RybEtleSxcbiAgICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgICAgc2hpZnRLZXk6IGUuc2hpZnRLZXksXG4gICAgICAgICAgYWx0S2V5OiBlLmFsdEtleSxcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBvYnNpZGlhbkRvYy5ib2R5LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICAgICAgZm9yd2FyZGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH07XG4gICAgYWN0aXZlRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bkZvcndhcmRlciwgdHJ1ZSk7XG5cbiAgICAvLyBcdTUyMURcdTU5Q0JcdTUzMTZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgYXdhaXQgc3RvcmFnZS5lbnN1cmVTdHJ1Y3R1cmUoKTtcblxuICAgIGNvbnN0IHN0b3JhZ2VCcmlkZ2UgPSBuZXcgU3RvcmFnZUJyaWRnZShzdG9yYWdlLCB0aGlzLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG5ldyBUaGVtZUJyaWRnZSgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG5ldyBCcmlkZ2VTZXJ2aWNlKFxuICAgICAgc3RvcmFnZUJyaWRnZSxcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UsXG4gICAgICB0aGlzLnNldHRpbmdzLFxuICAgICAgdGhpcy5zYXZlU2V0dGluZ3NcbiAgICApO1xuXG4gICAgLy8gXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUyRFx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFxuICAgIGNvbnN0IGN1c3RvbVRoZW1lcyA9IGF3YWl0IHRoaXMuX3NjYW5DdXN0b21UaGVtZXMoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Q3VzdG9tVGhlbWVzKGN1c3RvbVRoZW1lcyk7XG5cbiAgICAvLyBcdTRGMjBcdTkwMTJcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTc2N0RcdTU2NkFcdTk3RjNcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTYyNkJcdTYzQ0YvXHU4QkZCXHU1M0Q2XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIHVua25vd24gYXMgeyBiYXNlUGF0aDogc3RyaW5nIH0pLmJhc2VQYXRoIHx8ICcnO1xuICAgIGlmICh2YXVsdEJhc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0VmF1bHRCYXNlUGF0aCh2YXVsdEJhc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Tm9pc2VQYXRoKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1NjUyRlx1NjMwMVx1NzUyOFx1NjIzN1x1ODFFQVx1NUI5QVx1NEU0OSAub2JzaWRpYW4gXHU1NDBEXHU3OUYwXHVGRjA5XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldENvbmZpZ0Rpcih0aGlzLmFwcC52YXVsdC5jb25maWdEaXIpO1xuXG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLmF0dGFjaCh0aGlzLmlmcmFtZSk7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUodGhpcy5pZnJhbWUpO1xuXG4gICAgLy8gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlxuICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gdGhpcy5hcHAud29ya3NwYWNlLm9uKCdjc3MtY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy50aGVtZUJyaWRnZT8ub25UaGVtZUNoYW5nZWQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIG9uQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU2RTA1XHU3NDA2XHU4RjZFXHU4QkUyIGludGVydmFsXG4gICAgaWYgKHRoaXMuX2NoZWNrSW50ZXJ2YWwgIT09IG51bGwpIHtcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2NoZWNrSW50ZXJ2YWwpO1xuICAgICAgdGhpcy5fY2hlY2tJbnRlcnZhbCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU2ODY1XHU2M0E1XHU2NzBEXHU1MkExXG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlPy5kZXRhY2goKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU0RTNCXHU5ODk4XHU3NkQxXHU1NDJDXG4gICAgaWYgKHRoaXMuY3NzQ2hhbmdlUmVmKSB7XG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub2ZmcmVmKHRoaXMuY3NzQ2hhbmdlUmVmKTtcbiAgICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLnRoZW1lQnJpZGdlPy5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWUgZXJyb3IgXHU3NkQxXHU1NDJDXHU1NjY4XG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyKTtcbiAgICAgIHRoaXMuaWZyYW1lRXJyb3JIYW5kbGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTk1MkVcdTc2RDhcdThGNkNcdTUzRDFcdTU2NjhcbiAgICBpZiAodGhpcy5rZXlkb3duRm9yd2FyZGVyKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duRm9yd2FyZGVyLCB0cnVlKTtcbiAgICAgIHRoaXMua2V5ZG93bkZvcndhcmRlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGlmcmFtZVxuICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlKCk7XG4gICAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfc2NhbkN1c3RvbVRoZW1lcygpOiBQcm9taXNlPEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCB0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgdW5rbm93biBhcyB7IGJhc2VQYXRoOiBzdHJpbmcgfSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBpZiAoIXZhdWx0QmFzZVBhdGgpIHJldHVybiB0aGVtZXM7XG5cbiAgICAgIGNvbnN0IHRoZW1lRGlyTmFtZSA9IHRoaXMuc2V0dGluZ3MudGhlbWVQYXRoIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgY29uc3QgdGhlbWVzRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHRoZW1lRGlyTmFtZSk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdCh0aGVtZXNEaXIpO1xuICAgICAgICBpZiAoIXN0YXQuaXNEaXJlY3RvcnkoKSkgcmV0dXJuIHRoZW1lcztcbiAgICAgIH0gY2F0Y2ggeyByZXR1cm4gdGhlbWVzOyB9XG5cbiAgICAgIGNvbnN0IGVudHJpZXM6IHN0cmluZ1tdID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcih0aGVtZXNEaXIpO1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGlmICghZW50cnkuZW5kc1dpdGgoJy5qcycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhlbWVzRGlyLCBlbnRyeSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgZW50cnlTdGF0ID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmaWxlUGF0aCk7XG4gICAgICAgICAgaWYgKCFlbnRyeVN0YXQuaXNGaWxlKCkpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGNvZGU6IHN0cmluZyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRGaWxlKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAvLyBcdTVGRUJcdTkwMUZcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTUzMDVcdTU0MkJcdTVGQzVcdTk3MDBcdTc2ODQgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlxuICAgICAgICAgIGlmICghY29kZS5pbmNsdWRlcygnX19iYW1ib29fdGhlbWVfJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1N0YzQVx1NUMxMSBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlbWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLFxuICAgICAgICAgICAgY29kZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICBjb25zdCBtc2cgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW0JhbWJvb1Jldmlld10gXHU4QkZCXHU1M0Q2XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1NTkzMVx1OEQyNTpgLCBtc2cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGVtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKGBbQmFtYm9vUmV2aWV3XSBcdTUzRDFcdTczQjAgJHt0aGVtZXMubGVuZ3RofSBcdTRFMkFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTg6YCwgdGhlbWVzLm1hcCh0ID0+IHQubmFtZSkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgY29uc3QgbXNnID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgICAgY29uc29sZS5kZWJ1ZygnW0JhbWJvb1Jldmlld10gXHU2MjZCXHU2M0NGXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU2NUY2XHU1MUZBXHU5NTE5OicsIG1zZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBJbXBvcnRWYWxpZGF0b3IgfSBmcm9tICcuL0ltcG9ydFZhbGlkYXRvcic7XG5pbXBvcnQgdHlwZSB7XG4gIERheURhdGEsXG4gIEdvYWxJdGVtLFxuICBBcHBTZXR0aW5ncyxcbiAgUHVyY2hhc2VIaXN0b3J5LFxuICBJbmNvbWVIaXN0b3J5LFxuICBFeHBvcnRTaGFwZSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxEYXlEYXRhIHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIERheURhdGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdUZGMENcdTVDMDZcdThERjNcdThGQzc6ICR7cGF0aH1gLCBlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbERheXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPj4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IGZpbGVzLmZpbGVzXG4gICAgICAuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzb24nKSlcbiAgICAgIC5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmICghZGF0ZUtleSkgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChmaWxlKTtcbiAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyBEYXlEYXRhO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcGFyc2UgZGF5IGZpbGU6ICR7ZmlsZX1gLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG4gICAgcmV0dXJuIGRheXM7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU2NUU1XHU2NzFGIGtleVx1RkYwOFx1NjMwOVx1NjVFNVx1NjcxRlx1OTY0RFx1NUU4Rlx1RkYwQ1x1NjcwMFx1NjVCMFx1NTcyOFx1NTI0RFx1RkYwOSAqL1xuICBhc3luYyBnZXREYXlLZXlzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5maWxlcykge1xuICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmIChkYXRlS2V5KSBrZXlzLnB1c2goZGF0ZUtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIGtleXMuc29ydCgpLnJldmVyc2UoKTsgLy8gXHU5NjREXHU1RThGXHVGRjFBXHU2NzAwXHU2NUIwXHU2NUU1XHU2NzFGXHU1NzI4XHU1MjREXG4gICAgcmV0dXJuIGtleXM7XG4gIH1cblxuICAvKipcbiAgICogXHU1MjA2XHU5ODc1XHU1MkEwXHU4RjdEXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXG4gICAqIEBwYXJhbSBwYWdlIFx1OTg3NVx1NzgwMVx1RkYwOFx1NEVDRSAwIFx1NUYwMFx1NTlDQlx1RkYwOVxuICAgKiBAcGFyYW0gcGFnZVNpemUgXHU2QkNGXHU5ODc1XHU2NTcwXHU5MUNGXG4gICAqIEByZXR1cm5zIHsgZGF5cywgdG90YWwsIHBhZ2UsIHBhZ2VTaXplLCBoYXNNb3JlIH1cbiAgICovXG4gIGFzeW5jIGdldERheXNQYWdpbmF0ZWQocGFnZSA9IDAsIHBhZ2VTaXplID0gMzApOiBQcm9taXNlPHtcbiAgICBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICBrZXlzOiBzdHJpbmdbXTtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIGhhc01vcmU6IGJvb2xlYW47XG4gIH0+IHtcbiAgICBjb25zdCBhbGxLZXlzID0gYXdhaXQgdGhpcy5nZXREYXlLZXlzKCk7XG4gICAgY29uc3QgdG90YWwgPSBhbGxLZXlzLmxlbmd0aDtcbiAgICBjb25zdCBzdGFydCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBwYWdlS2V5cyA9IGFsbEtleXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IHBhZ2VLZXlzLm1hcChhc3luYyAoZGF0ZUtleSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0RGF5KGRhdGVLZXkpO1xuICAgICAgICBpZiAoZGF0YSkgZGF5c1tkYXRlS2V5XSA9IGRhdGE7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGxvYWQgZGF5OiAke2RhdGVLZXl9YCwgZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheXMsXG4gICAgICBrZXlzOiBwYWdlS2V5cyxcbiAgICAgIHRvdGFsLFxuICAgICAgcGFnZSxcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgaGFzTW9yZTogc3RhcnQgKyBwYWdlS2V5cy5sZW5ndGggPCB0b3RhbCxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcHV0RGF5KGRheURhdGE6IERheURhdGEpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxHb2FsSXRlbVtdPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBHb2FsSXRlbVtdO1xuICB9XG5cbiAgYXN5bmMgcHV0R29hbHMoZ29hbHM6IEdvYWxJdGVtW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBKU09OLnBhcnNlKGRhdGEpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgMik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHsgW2tleV06IHZhbHVlIH0sIG51bGwsIDIpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxTZXR0aW5ncygpOiBQcm9taXNlPEFwcFNldHRpbmdzPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBBcHBTZXR0aW5ncztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1OEQyRFx1NEU3MFx1NTM4Nlx1NTNGMiAocHVyY2hhc2UtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBwdXJjaGFzZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcHVyY2hhc2UtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRQdXJjaGFzZUhpc3RvcnkoKTogUHJvbWlzZTxQdXJjaGFzZUhpc3RvcnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBQdXJjaGFzZUhpc3Rvcnk7XG4gIH1cblxuICBhc3luYyBwdXRQdXJjaGFzZUhpc3RvcnkoZGF0YTogUHVyY2hhc2VIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMiAoaW5jb21lLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgaW5jb21lSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9pbmNvbWUtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRJbmNvbWVIaXN0b3J5KCk6IFByb21pc2U8SW5jb21lSGlzdG9yeSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBJbmNvbWVIaXN0b3J5O1xuICB9XG5cbiAgYXN5bmMgcHV0SW5jb21lSGlzdG9yeShkYXRhOiBJbmNvbWVIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTVCRkNcdTUxRkEvXHU1QkZDXHU1MTY1IC0tLS1cblxuICBhc3luYyBleHBvcnRBbGxEYXRhKCk6IFByb21pc2U8RXhwb3J0U2hhcGU+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiB1bmtub3duLCBvcHRpb25zOiB7IHN0cmF0ZWd5PzogJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIH0gPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gICAgY29uc3Qgc3RyYXRlZ3kgPSBvcHRpb25zLnN0cmF0ZWd5ID8/ICdvdmVyd3JpdGUnO1xuXG4gICAgLy8gUDJcdUZGMUFcdTVCRkNcdTUxNjVcdTUyNERcdTY4MjFcdTlBOEMgKyBcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdUZGMUJcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTU3MjhcdTZCNjRcdTg4QUJcdTYyRDJcdTdFRERcdUZGMENcdTRFMERcdTZDNjFcdTY3RDMgVmF1bHRcbiAgICBjb25zdCByZWNvcmQgPSBJbXBvcnRWYWxpZGF0b3IudmFsaWRhdGUoZGF0YSk7XG5cbiAgICBpZiAocmVjb3JkLmRheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gXHU5NjMyXHU1RkExXHVGRjFBZGF5cyBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTdBN0FcdTVCRjlcdThDNjFcdTg4NjhcdTc5M0FcdTZFMDVcdTdBN0FcdTUxNjhcdTkwRThcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMDhcdTRFQzUgb3ZlcndyaXRlIFx1OEJFRFx1NEU0OVx1NEUwQlx1NTE0MVx1OEJCOFx1RkYwOVxuICAgICAgY29uc3QgZGF5cyA9IChyZWNvcmQuZGF5cyAmJiB0eXBlb2YgcmVjb3JkLmRheXMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHJlY29yZC5kYXlzKSlcbiAgICAgICAgPyByZWNvcmQuZGF5c1xuICAgICAgICA6IHt9O1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnb3ZlcndyaXRlJykge1xuICAgICAgICBhd2FpdCB0aGlzLmNsZWFyQWxsRGF5cygpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBkYXkgb2YgT2JqZWN0LnZhbHVlcyhkYXlzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dERheShkYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWNvcmQuZ29hbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgaW5jb21pbmc6IEdvYWxJdGVtW10gPSBBcnJheS5pc0FycmF5KHJlY29yZC5nb2FscykgPyByZWNvcmQuZ29hbHMgOiBbXTtcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ21lcmdlJykge1xuICAgICAgICAvLyBcdTU0MDhcdTVFNzZcdUZGMUFcdTRGRERcdTc1NTlcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTVCRkNcdTUxNjVcdTc2RUVcdTY4MDdcdTYzMDkgaWQgXHU4OTg2XHU3NkQ2XHVGRjFCXHU3QTdBXHU2NTcwXHU3RUM0XHU0RTBEXHU4OUU2XHU1M0QxXHU2RTA1XHU3QTdBXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKGF3YWl0IHRoaXMuZ2V0R29hbHMoKSkgfHwgW107XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXAoZXhpc3RpbmcubWFwKChnKSA9PiBbZy5pZCwgZ10pKTtcbiAgICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGluY29taW5nKSB7XG4gICAgICAgICAgaWYgKGdvYWwgJiYgZ29hbC5pZCkgbWVyZ2VkLnNldChnb2FsLmlkLCBnb2FsKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKEFycmF5LmZyb20obWVyZ2VkLnZhbHVlcygpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvdmVyd3JpdGVcdUZGMUFcdTY1NzRcdTRGNTNcdTY2RkZcdTYzNjJcdUZGMDhcdTdBN0FcdTY1NzBcdTdFQzQgPSBcdTZFMDVcdTdBN0FcdUZGMENcdTdCMjZcdTU0MDhcdTk4ODRcdTY3MUZcdThCRURcdTRFNDlcdUZGMDlcbiAgICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhpbmNvbWluZyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmIHJlY29yZC5zZXR0aW5ncyAmJiB0eXBlb2YgcmVjb3JkLnNldHRpbmdzID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgaW5jb21pbmcgPSByZWNvcmQuc2V0dGluZ3M7XG4gICAgICBsZXQgdG9Xcml0ZTogQXBwU2V0dGluZ3M7XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdtZXJnZScpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSAoYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpKSB8fCB7fTtcbiAgICAgICAgdG9Xcml0ZSA9IHsgLi4uZXhpc3RpbmcsIC4uLmluY29taW5nIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b1dyaXRlID0gaW5jb21pbmc7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUodGhpcy5zZXR0aW5nc1BhdGgoKSwgSlNPTi5zdHJpbmdpZnkodG9Xcml0ZSwgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIGlmIChyZWNvcmQucHVyY2hhc2VIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0UHVyY2hhc2VIaXN0b3J5KHJlY29yZC5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmluY29tZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRJbmNvbWVIaXN0b3J5KHJlY29yZC5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU0RUM1XHU2RTA1XHU3QTdBXHU2MjQwXHU2NzA5XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjA4b3ZlcndyaXRlIFx1NUJGQ1x1NTE2NSBkYXlzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwQ1x1NEUwRFx1NUY3MVx1NTRDRCBnb2Fscy9zZXR0aW5nc1x1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbERheXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhkYXRhRGlyKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcihkYXRhRGlyLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgfVxuXG4gIC8qKiBcdTRFQzVcdTZFMDVcdTdBN0FcdThCQkVcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMDhvdmVyd3JpdGUgXHU1QkZDXHU1MTY1IHNldHRpbmdzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2xlYXJBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKHRoaXMuYmFzZVBhdGgsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICB9XG5cbiAgLy8gLS0tLSBNYXJrZG93biBcdTY0NThcdTg5ODEgLS0tLVxuXG4gIHByaXZhdGUgcmV2aWV3UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3Jldmlld3MvJHtkYXRlS2V5fS5tZGApO1xuICB9XG5cbiAgYXN5bmMgd3JpdGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcsIG1hcmtkb3duOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIG1hcmtkb3duKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIEltcG9ydFZhbGlkYXRvciAtIFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1NzY4NFx1NjgyMVx1OUE4Q1x1NEUwRVx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1RkYwOFx1NUJCRlx1NEUzQlx1NEZBN1x1RkYwQ1x1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwOVxuICpcbiAqIFx1NzUyOFx1OTAxNFx1RkYxQVx1NTcyOCBWYXVsdFN0b3JhZ2UuaW1wb3J0RGF0YSBcdTg0M0RcdTc2RDhcdTUyNERcdTYyRTZcdTYyMkFcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTMwMDFcdTg4NjVcdTlGNTBcdTdGM0FcdTU5MzFcdTVCNTdcdTZCQjVcdUZGMENcbiAqIFx1OTA3Rlx1NTE0RFx1NTM0QVx1NjIyQS9cdTk3NUVcdTZDRDVcdTY1NzBcdTYzNkVcdTZDNjFcdTY3RDMgVmF1bHRcdTMwMDJcbiAqXG4gKiBcdThCQkVcdThCQTFcdTUzOUZcdTUyMTlcdUZGMUFcbiAqICAtIFx1NEVDNVx1NTA1QVwiXHU3RUQzXHU2Nzg0XHU1QzQyXHU5NzYyXHU3Njg0XHU1Qjg5XHU1MTY4XHU1MTVDXHU1RTk1XCJcdUZGMENcdTRFMERcdTkxQ0RcdTUxOTlcdTRFMUFcdTUyQTFcdTVCNTdcdTZCQjVcdUZGMDhcdTU5ODIgbWV0cmljcyBcdTc2ODRcdTUxNzdcdTRGNTNcdTY1NzBcdTUwM0NcdUZGMDlcdTMwMDJcbiAqICAtIFx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1NEYxOFx1NTE0OFx1NzUyOFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1ODFFQVx1OEVBQlx1NzY4NCBrZXkgLyBcdTUxODVcdTVCQjlcdUZGMENcdTdGM0FcdTU5MzFcdTY1RjZcdTYyNERcdTc1MjhcdTVCODlcdTUxNjhcdTlFRDhcdThCQTRcdTUwM0NcdTMwMDJcbiAqICAtIFx1NEVGQlx1NEY1NVx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NzY4NFx1N0VEM1x1Njc4NFx1NjAyN1x1NjM1Rlx1NTc0Rlx1OTBGRFx1NjI5QiBJbXBvcnRWYWxpZGF0aW9uRXJyb3JcdUZGMENcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTc5M0FcdTc1MjhcdTYyMzdcdTMwMDJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERheURhdGEsXG4gIEdvYWxJdGVtLFxuICBBcHBTZXR0aW5ncyxcbiAgUHVyY2hhc2VIaXN0b3J5LFxuICBJbmNvbWVIaXN0b3J5LFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuZXhwb3J0IGNsYXNzIEltcG9ydFZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0ltcG9ydFZhbGlkYXRpb25FcnJvcic7XG4gIH1cbn1cblxuY29uc3QgS05PV05fRklFTERTID0gWydkYXlzJywgJ2dvYWxzJywgJ3NldHRpbmdzJywgJ3B1cmNoYXNlSGlzdG9yeScsICdpbmNvbWVIaXN0b3J5J10gYXMgY29uc3Q7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVkSW1wb3J0IHtcbiAgZGF5cz86IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICBnb2Fscz86IEdvYWxJdGVtW107XG4gIHNldHRpbmdzPzogQXBwU2V0dGluZ3M7XG4gIHB1cmNoYXNlSGlzdG9yeT86IFB1cmNoYXNlSGlzdG9yeTtcbiAgaW5jb21lSGlzdG9yeT86IEluY29tZUhpc3Rvcnk7XG59XG5cbmV4cG9ydCBjb25zdCBJbXBvcnRWYWxpZGF0b3IgPSB7XG4gIC8qKlxuICAgKiBcdTY4MjFcdTlBOENcdTVFNzZcdTg4NjVcdTlGNTBcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTMwMDJcbiAgICogQHJldHVybnMgXHU4ODY1XHU5RjUwXHU1NDBFXHU3Njg0XHU1RTcyXHU1MUMwXHU2NTcwXHU2MzZFXHVGRjA4XHU3RUQzXHU2Nzg0XHU0RTBFXHU4RjkzXHU1MTY1XHU0RTAwXHU4MUY0XHVGRjBDXHU0RjQ2XHU1QjU3XHU2QkI1XHU1QjhDXHU2NTc0XHVGRjA5XG4gICAqIEB0aHJvd3MgSW1wb3J0VmFsaWRhdGlvbkVycm9yIFx1NUY1M1x1N0VEM1x1Njc4NFx1NjM1Rlx1NTc0Rlx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NjVGNlxuICAgKi9cbiAgdmFsaWRhdGUoZGF0YTogdW5rbm93bik6IFZhbGlkYXRlZEltcG9ydCB7XG4gICAgaWYgKCFkYXRhIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKCdcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcdTY4M0NcdTVGMEZcdTY1RTBcdTY1NDhcdUZGMUFcdTY4MzlcdTgyODJcdTcwQjlcdTVGQzVcdTk4N0JcdTY2MkYgSlNPTiBcdTVCRjlcdThDNjEnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSBkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgLy8gXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHU2MkQyXHU3RUREXHVGRjFBXHU2Q0ExXHU2NzA5XHU0RUZCXHU0RjU1XHU1REYyXHU3N0U1XHU1QjU3XHU2QkI1IFx1MjE5MiBcdTg5QzZcdTRFM0FcdTYzNUZcdTU3NEYvXHU2NUUwXHU1MTczXHU2NTg3XHU0RUY2XG4gICAgY29uc3QgaGFzS25vd25GaWVsZCA9IEtOT1dOX0ZJRUxEUy5zb21lKChmKSA9PiByZWNvcmRbZl0gIT09IHVuZGVmaW5lZCk7XG4gICAgaWYgKCFoYXNLbm93bkZpZWxkKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKFxuICAgICAgICAnXHU1OTA3XHU0RUZEXHU2NTg3XHU0RUY2XHU2NUUwXHU2NTQ4XHVGRjFBXHU2NzJBXHU2MjdFXHU1MjMwXHU0RUZCXHU0RjU1XHU1M0VGXHU4QkM2XHU1MjJCXHU3Njg0XHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHVGRjA4ZGF5cyAvIGdvYWxzIC8gc2V0dGluZ3MgLyBwdXJjaGFzZUhpc3RvcnkgLyBpbmNvbWVIaXN0b3J5XHVGRjA5J1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFZhbGlkYXRlZEltcG9ydCA9IHt9O1xuXG4gICAgaWYgKHJlY29yZC5kYXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5kYXlzID0gSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZURheXMocmVjb3JkLmRheXMpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmdvYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5nb2FscyA9IEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVHb2FscyhyZWNvcmQuZ29hbHMpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnNldHRpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5zZXR0aW5ncyA9IEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVTZXR0aW5ncyhyZWNvcmQuc2V0dGluZ3MpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQucHVyY2hhc2VIaXN0b3J5ID0gcmVjb3JkLnB1cmNoYXNlSGlzdG9yeSBhcyBQdXJjaGFzZUhpc3Rvcnk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQuaW5jb21lSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuaW5jb21lSGlzdG9yeSA9IHJlY29yZC5pbmNvbWVIaXN0b3J5IGFzIEluY29tZUhpc3Rvcnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IGRheXNcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU5NzVFXHU1QkY5XHU4QzYxXHVGRjA4XHU1OTgyXHU2NTcwXHU3RUM0L1x1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOVx1MjE5MiBcdTg5QzZcdTRFM0FcdTY1RTBcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTVCRjlcdThDNjFcdUZGMDhcdTRFMERcdTZDNjFcdTY3RDMgVmF1bHRcdUZGMDlcbiAgICogIC0gXHU2QkNGXHU0RTJBIGRheSBcdTdGM0EgZGF0ZSBcdTY1RjZcdTc1MjhcdTUxNzYga2V5IFx1ODg2NVx1OUY1MFxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZGF5IFx1N0YzQSBtZXRyaWNzL3RpbWVsaW5lL2dvYWxzIFx1NjVGNlx1ODg2NVx1N0E3QVx1N0VEM1x1Njc4NFxuICAgKi9cbiAgbm9ybWFsaXplRGF5cyhkYXlzOiB1bmtub3duKTogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4ge1xuICAgIGlmICghZGF5cyB8fCB0eXBlb2YgZGF5cyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXlzKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBjb25zdCByYXcgPSBkYXlzIGFzIFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICAgIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4gPSB7fTtcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJhdykpIHtcbiAgICAgIGNvbnN0IGRheSA9IHJhd1trZXldO1xuICAgICAgaWYgKCFkYXkgfHwgdHlwZW9mIGRheSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXkpKSB7XG4gICAgICAgIGNvbnRpbnVlOyAvLyBcdThERjNcdThGQzdcdTk3NUVcdTVCRjlcdThDNjFcdTY3NjFcdTc2RUVcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsZWFuOiBEYXlEYXRhID0geyAuLi5kYXkgfTtcbiAgICAgIGlmICghY2xlYW4uZGF0ZSkgY2xlYW4uZGF0ZSA9IGtleTsgLy8gXHU3NTI4IGtleSBcdTg4NjUgZGF0ZVxuICAgICAgaWYgKCFjbGVhbi5tZXRyaWNzIHx8IHR5cGVvZiBjbGVhbi5tZXRyaWNzICE9PSAnb2JqZWN0JykgY2xlYW4ubWV0cmljcyA9IHt9O1xuICAgICAgaWYgKCFjbGVhbi50aW1lbGluZSB8fCAhQXJyYXkuaXNBcnJheShjbGVhbi50aW1lbGluZSkpIGNsZWFuLnRpbWVsaW5lID0gW107XG4gICAgICBpZiAoIWNsZWFuLmdvYWxzIHx8ICFBcnJheS5pc0FycmF5KGNsZWFuLmdvYWxzKSkgY2xlYW4uZ29hbHMgPSBbXTtcbiAgICAgIG91dFtrZXldID0gY2xlYW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBnb2Fsc1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTY1NzBcdTdFQzRcdUZGMUJcdTk3NUVcdTY1NzBcdTdFQzQgXHUyMTkyIFx1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZ29hbCBcdTdGM0EgaWQgXHU2NUY2XHU4ODY1XHU0RTAwXHU0RTJBXHU3QTMzXHU1QjlBXHU1M0VGXHU1OTBEXHU3M0IwXHU3Njg0IGlkXG4gICAqL1xuICBub3JtYWxpemVHb2Fscyhnb2FsczogdW5rbm93bik6IEdvYWxJdGVtW10ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShnb2FscykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIHJldHVybiBnb2Fscy5tYXAoKHJhdyk6IEdvYWxJdGVtID0+IHtcbiAgICAgIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdyBhcyBHb2FsSXRlbTtcbiAgICAgIGNvbnN0IG9iaiA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGNvbnN0IGNsZWFuID0geyAuLi5vYmogfSBhcyB1bmtub3duIGFzIEdvYWxJdGVtO1xuICAgICAgaWYgKCFjbGVhbi5pZCkge1xuICAgICAgICBjbGVhbi5pZCA9IGBnb2FsX2ltcG9ydF8ke2NvdW50ZXIrK31fJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1gO1xuICAgICAgfVxuICAgICAgaWYgKGNsZWFuLml0ZW1zICYmICFBcnJheS5pc0FycmF5KGNsZWFuLml0ZW1zKSkgY2xlYW4uaXRlbXMgPSBbXTtcbiAgICAgIHJldHVybiBjbGVhbjtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IHNldHRpbmdzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1OTc1RVx1NUJGOVx1OEM2MSBcdTIxOTIgXHU4RkQ0XHU1NkRFXHU3QTdBXHU1QkY5XHU4QzYxXG4gICAqL1xuICBub3JtYWxpemVTZXR0aW5ncyhzZXR0aW5nczogdW5rbm93bik6IEFwcFNldHRpbmdzIHtcbiAgICBpZiAoIXNldHRpbmdzIHx8IHR5cGVvZiBzZXR0aW5ncyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShzZXR0aW5ncykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHNldHRpbmdzIGFzIEFwcFNldHRpbmdzO1xuICB9LFxufTtcbiIsICIvKipcbiAqIE1hcmtkb3duU3luYyAtIFx1NUMwNiBEYXlEYXRhIEpTT04gXHU4RjZDXHU2MzYyXHU0RTNBXHU1M0VGXHU4QkZCXHU3Njg0IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5pbXBvcnQgdHlwZSB7IERheURhdGEgfSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duU3luYyB7XG4gIC8qKiBcdTVDMDYgRGF5RGF0YSBcdThGNkNcdTYzNjJcdTRFM0EgTWFya2Rvd24gKi9cbiAgc3RhdGljIGdlbmVyYXRlTWFya2Rvd24oZGF0YTogRGF5RGF0YSk6IHN0cmluZyB7XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBmcm9udG1hdHRlclx1RkYwOFx1NTJBOFx1NjAwMVx1NTAzQ1x1NzUyOFx1NTNDQ1x1NUYxNVx1NTNGN1x1NTMwNVx1ODhGOVx1OTYzMlx1NkI2MiBZQU1MIFx1NkNFOFx1NTE2NVx1RkYwOVxuICAgIGxpbmVzLnB1c2goJy0tLScpO1xuICAgIGxpbmVzLnB1c2goYGRhdGU6IFwiJHtkYXRhLmRhdGV9XCJgKTtcbiAgICBsaW5lcy5wdXNoKGB3ZWVrZGF5OiBcIiR7ZGF0YS53ZWVrZGF5fVwiYCk7XG4gICAgbGluZXMucHVzaCgndHlwZTogQmFtYm9vIEltbW9ydGFscycpO1xuICAgIGxpbmVzLnB1c2goJy0tLScpO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2ODA3XHU5ODk4XG4gICAgbGluZXMucHVzaChgIyAke2RhdGEuZGF0ZX0gJHtkYXRhLndlZWtkYXl9XHU1OTBEXHU3NkQ4YCk7XG4gICAgbGluZXMucHVzaCgnJyk7XG5cbiAgICAvLyBcdTYzMDdcdTY4MDdcbiAgICBpZiAoZGF0YS5tZXRyaWNzKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTYzMDdcdTY4MDcnKTtcbiAgICAgIGNvbnN0IG0gPSBkYXRhLm1ldHJpY3M7XG4gICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmIChtLmZpcnN0Q2hlY2tJbikgcGFydHMucHVzaChgXHU5OTk2XHU2QjIxXHU2MjUzXHU1MzYxOiAke20uZmlyc3RDaGVja0lufWApO1xuICAgICAgaWYgKG0ubGFzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1NjcyQlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmxhc3RDaGVja0lufWApO1xuICAgICAgaWYgKG0uY29tcGxldGVkVGFza3MpIHBhcnRzLnB1c2goYFx1NUI4Q1x1NjIxMFx1NEVGQlx1NTJBMTogJHttLmNvbXBsZXRlZFRhc2tzfWApO1xuICAgICAgaWYgKG0uaW5zcGlyYXRpb25Db3VudCkgcGFydHMucHVzaChgXHU3MDc1XHU2MTFGOiAke20uaW5zcGlyYXRpb25Db3VudH1gKTtcbiAgICAgIGlmIChtLmFjdGl2ZVRpbWUpIHBhcnRzLnB1c2goYFx1NkQzQlx1OERDM1x1NjVGNlx1OTU3RjogJHttLmFjdGl2ZVRpbWV9YCk7XG4gICAgICBpZiAobS5lbXB0eVNsb3RzKSBwYXJ0cy5wdXNoKGBcdTdBN0FcdTc2N0RcdTY1RjZcdTZCQjU6ICR7bS5lbXB0eVNsb3RzfWApO1xuXG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGFydHMuc2xpY2UoMCwgMikuam9pbignIHwgJyl9YCk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICB9XG5cbiAgICAvLyBcdTY1RjZcdTk1RjRcdTdFQkZcbiAgICBpZiAoZGF0YS50aW1lbGluZSAmJiBkYXRhLnRpbWVsaW5lLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NjVGNlx1OTVGNFx1N0VCRicpO1xuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBkYXRhLnRpbWVsaW5lKSB7XG4gICAgICAgIGNvbnN0IGljb24gPSBibG9jay5pY29uID8gYCR7YmxvY2suaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7YmxvY2submFtZX0gKCR7YmxvY2sudGltZX0pYCk7XG4gICAgICAgIGlmIChibG9jay5pdGVtcykge1xuICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBibG9jay5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZXZhbFN0ciA9IGl0ZW0uZXZhbCA/IGAgLSAke2l0ZW0uZXZhbH1gIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS50aW1lfSAke2l0ZW0udGFza30ke2V2YWxTdHJ9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNlxuICAgIGlmIChkYXRhLmdvYWxzICYmIGRhdGEuZ29hbHMubGVuZ3RoID4gMCkge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU3NkVFXHU2ODA3XHU4RkRCXHU1RUE2Jyk7XG4gICAgICBmb3IgKGNvbnN0IGdvYWwgb2YgZGF0YS5nb2Fscykge1xuICAgICAgICBjb25zdCBpY29uID0gZ29hbC5pY29uID8gYCR7Z29hbC5pY29ufSBgIDogJyc7XG4gICAgICAgIGxpbmVzLnB1c2goYCMjIyAke2ljb259JHtnb2FsLnRpdGxlfWApO1xuICAgICAgICBpZiAoZ29hbC5pdGVtcykge1xuICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBnb2FsLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBwZXJjZW50ID0gaXRlbS5wZXJjZW50ICE9PSB1bmRlZmluZWQgPyBgICR7aXRlbS5wZXJjZW50fSVgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBkZXRhaWwgPSBpdGVtLmRldGFpbCA/IGAgKCR7aXRlbS5kZXRhaWx9KWAgOiAnJztcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtpdGVtLm5hbWV9JHtwZXJjZW50fSR7ZGV0YWlsfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBNYXJrZG93blN5bmMgfSBmcm9tICcuLi9zdG9yYWdlL01hcmtkb3duU3luYyc7XG5pbXBvcnQgdHlwZSB7IEFueUJyaWRnZU1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcy9tZXNzYWdlcyc7XG5pbXBvcnQgdHlwZSB7IERheURhdGEsIEdvYWxJdGVtLCBQdXJjaGFzZUhpc3RvcnksIEluY29tZUhpc3RvcnkgfSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuLyoqXG4gKiBTdG9yYWdlQnJpZGdlIC0gXHU1QzA2IHN0b3JhZ2U6KiBcdTZEODhcdTYwNkZcdTY2MjBcdTVDMDRcdTUyMzAgVmF1bHRTdG9yYWdlIFx1NjRDRFx1NEY1Q1xuICovXG5leHBvcnQgY2xhc3MgU3RvcmFnZUJyaWRnZSB7XG4gIHByaXZhdGUgc3RvcmFnZTogVmF1bHRTdG9yYWdlO1xuICBwcml2YXRlIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdG9yYWdlOiBWYXVsdFN0b3JhZ2UsIGVuYWJsZU1hcmtkb3duU3luYyA9IHRydWUpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgIHRoaXMuZW5hYmxlTWFya2Rvd25TeW5jID0gZW5hYmxlTWFya2Rvd25TeW5jO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlKG1lc3NhZ2U6IEFueUJyaWRnZU1lc3NhZ2UpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnc3RvcmFnZTpyZWFkRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOndyaXRlRGF5Jzoge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0RGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIERheURhdGEpO1xuICAgICAgICAvLyBcdTUzQ0NcdTUxOTkgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZU1hcmtkb3duU3luYyAmJiBtZXNzYWdlLnBheWxvYWQuZGF0YSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtZCA9IE1hcmtkb3duU3luYy5nZW5lcmF0ZU1hcmtkb3duKG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIERheURhdGEpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLndyaXRlTWFya2Rvd25SZXZpZXcobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXksIG1kKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ01hcmtkb3duIHN5bmMgZmFpbGVkOicsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmxpc3REYXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxEYXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZGVsZXRlRGF5Jzoge1xuICAgICAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlTWFya2Rvd25SZXZpZXcobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZURheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRTZXR0aW5nKG1lc3NhZ2UucGF5bG9hZC5rZXksIG1lc3NhZ2UucGF5bG9hZC52YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbFNldHRpbmdzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEdvYWxzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEdvYWxzKG1lc3NhZ2UucGF5bG9hZC5nb2FscyBhcyBHb2FsSXRlbVtdKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFB1cmNoYXNlSGlzdG9yeSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0UHVyY2hhc2VIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIFB1cmNoYXNlSGlzdG9yeSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0SW5jb21lSGlzdG9yeSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEluY29tZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgSW5jb21lSGlzdG9yeSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5S2V5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5S2V5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheXNQYWdpbmF0ZWQnOiB7XG4gICAgICAgIGNvbnN0IHBhZ2luYXRlZFBheWxvYWQgPSBtZXNzYWdlLnBheWxvYWQgYXMgeyBwYWdlPzogbnVtYmVyOyBwYWdlU2l6ZT86IG51bWJlciB9O1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheXNQYWdpbmF0ZWQoXG4gICAgICAgICAgcGFnaW5hdGVkUGF5bG9hZC5wYWdlID8/IDAsXG4gICAgICAgICAgcGFnaW5hdGVkUGF5bG9hZC5wYWdlU2l6ZSA/PyAzMFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmV4cG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZXhwb3J0QWxsRGF0YSgpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmltcG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuaW1wb3J0RGF0YShtZXNzYWdlLnBheWxvYWQuZGF0YSwgbWVzc2FnZS5wYXlsb2FkLm9wdGlvbnMgPz8ge30pO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmNsZWFyQWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhckFsbCgpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RvcmFnZSBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgIH1cbiAgfVxufVxuIiwgIlxuLyoqXG4gKiBUaGVtZUJyaWRnZSAtIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdUZGMENcdTYzQThcdTkwMDFcdTUyMzAgaWZyYW1lXG4gKiAgICAgICAgICAgICAgKyBcdTUzQ0RcdTU0MTFcdUZGMUFcdTYzQTVcdTY1MzYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTAzQ1x1RkYwQ1x1NkNFOFx1NTE2NSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAqL1xuZXhwb3J0IGNsYXNzIFRoZW1lQnJpZGdlIHtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF9wYWxldHRlU3luY1RpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIC8qKiBcdTVCNThcdTUwQThcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1OTUyRVx1NTQwRFx1RkYwQ1x1NzUyOFx1NEU4RSByZXN0b3JlRGVmYXVsdHMgXHU2RTA1XHU3NDA2ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgSU5KRUNURURfVkFSUyA9IFtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCcsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnLFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JyxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JyxcbiAgICAgICctLXRleHQtbm9ybWFsJyxcbiAgICAgICctLXRleHQtbXV0ZWQnLFxuICAgIF07XG5cbiAgICAvKiogXHU5NjMyXHU2Mjk2XHU3QURFXHU2MDAxXHU2ODA3XHU4QkIwXHVGRjFBcmVzdG9yZURlZmF1bHRzIFx1ODhBQlx1OEMwM1x1NzUyOFx1NTQwRVx1OEJCRVx1NEUzQSB0cnVlXHVGRjBDXHU5NjNCXHU2QjYyXHU1RUY2XHU4RkRGXHU1NkRFXHU4QzAzXHU4OTg2XHU1MTk5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N1cHByZXNzZWQgPSBmYWxzZTtcblxuICBhdHRhY2hJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICB9XG5cbiAgZGV0YWNoSWZyYW1lKCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNEQgT2JzaWRpYW4gXHU2NjBFXHU2Njk3XHU3MkI2XHU2MDAxXHVGRjA4XHU0RUM1XHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHByaXZhdGUgaXNEYXJrTW9kZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NzJCNlx1NjAwMSAqL1xuICBwdXNoVGhlbWUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICBpZDogJ3RoZW1lX3B1c2hfJyArIERhdGUubm93KCksXG4gICAgICAgIHBheWxvYWQ6IHsgaXNEYXJrOiB0aGlzLmlzRGFya01vZGUoKSB9LFxuICAgICAgfSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKiogXHU0RjlCXHU1OTE2XHU5MEU4XHU4QzAzXHU3NTI4XHVGRjFBT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU2NUY2XHU4OUU2XHU1M0QxICovXG4gIG9uVGhlbWVDaGFuZ2VkKCk6IHZvaWQge1xuICAgIHRoaXMucHVzaFRoZW1lKCk7XG4gIH1cblxuICAvLyA9PT09PSBcdTUzQ0NcdTU0MTFcdThDMDNcdTgyNzIgPT09PT1cblxuICAvKipcbiAgICogXHU4QkExXHU3Qjk3IHdlYmFwcCBcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2IFx1MjE5MiBPYnNpZGlhbiBDU1MgXHU1M0Q4XHU5MUNGXHU2NjIwXHU1QzA0XG4gICAqIFx1NEVDNVx1ODk4Nlx1NzZENiAzIFx1N0M3Qlx1NjgzOFx1NUZDM1x1ODI3Mlx1RkYwOFx1NUYzQVx1OEMwMy9cdTgwQ0NcdTY2NkYvXHU2NTg3XHU1QjU3XHVGRjA5XHVGRjBDXHU1MTc2XHU0RjU5XHU3NTMxIE9ic2lkaWFuIFx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NjNBOFx1N0I5N1xuICAgKi9cbiAgc3RhdGljIGNvbXB1dGVPYnNpZGlhblZhcnMoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBoID0gTWF0aC5yb3VuZChodWUpO1xuICAgIGNvbnN0IGxvID0gTWF0aC5tYXgoLTMwLCBNYXRoLm1pbigzMCwgbGlnaHRuZXNzT2Zmc2V0KSk7XG5cbiAgICAvLyBcdTVGM0FcdThDMDNcdTgyNzJcbiAgICBjb25zdCBhY2NlbnRTID0gNDA7XG4gICAgY29uc3QgYWNjZW50TCA9IGlzRGFyayA/IDUwIDogNDA7XG4gICAgY29uc3QgYWNjZW50ID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMfSUpYDtcbiAgICBjb25zdCBhY2NlbnRIb3ZlciA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TCArIDV9JSlgO1xuXG4gICAgLy8gXHU4MENDXHU2NjZGXHU4MjcyXG4gICAgY29uc3QgYmdTID0gaXNEYXJrID8gOCA6IDEyO1xuICAgIGNvbnN0IGJnTCA9IGlzRGFya1xuICAgICAgPyBNYXRoLm1heCg1LCAxMiArIGxvICogMC4zKVxuICAgICAgOiBNYXRoLm1pbig5OCwgOTQgKyBsbyAqIDAuMTUpO1xuICAgIGNvbnN0IGJnUHJpbWFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtiZ0x9JSlgO1xuICAgIGNvbnN0IGJnU2Vjb25kYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2lzRGFyayA/IGJnTCArIDMgOiBiZ0wgLSAyfSUpYDtcblxuICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3MlxuICAgIGNvbnN0IHRleHROb3JtYWwgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDYlLCA4OCUpYCA6IGBoc2woJHtofSwgNiUsIDEyJSlgO1xuICAgIGNvbnN0IHRleHRNdXRlZCAgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDQlLCA1NSUpYCA6IGBoc2woJHtofSwgNCUsIDQ1JSlgO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3Zlcic6IGFjY2VudEhvdmVyLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknOiBiZ1ByaW1hcnksXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSc6IGJnU2Vjb25kYXJ5LFxuICAgICAgJy0tdGV4dC1ub3JtYWwnOiB0ZXh0Tm9ybWFsLFxuICAgICAgJy0tdGV4dC1tdXRlZCc6IHRleHRNdXRlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1OEMwM1x1ODI3Mlx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICogNTBtcyBkZWJvdW5jZVx1RkYwQ1x1OTYzMlx1NkI2Mlx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdTZFRDFcdTU3NTdcdTVGRUJcdTkwMUZcdTYyRDZcdTYyRkRcdTRFQTdcdTc1MUZcdTlBRDhcdTk4OTEgRE9NIFx1NTE5OVx1NTE2NVxuICAgKi9cbiAgYXBwbHlQYWxldHRlKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcik7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSBmYWxzZTsgLy8gXHU2NUIwXHU4QzAzXHU4MjcyXHU4QkY3XHU2QzQyXHU1MjMwXHU2NzY1IFx1MjE5MiBcdTg5RTNcdTk2NjRcdTYyOTFcdTUyMzZcbiAgICB0aGlzLl9wYWxldHRlU3luY1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkKSByZXR1cm47IC8vIHJlc3RvcmVEZWZhdWx0cyBcdTU3MjhcdTk2MzJcdTYyOTZcdTdBOTdcdTUzRTNcdTUxODVcdTg4QUJcdThDMDNcdTc1MjhcbiAgICAgIGNvbnN0IHZhcnMgPSBUaGVtZUJyaWRnZS5jb21wdXRlT2JzaWRpYW5WYXJzKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFycykpIHtcbiAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvKiogXHU2RTA1XHU5NjY0XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTYwNjJcdTU5MEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5RUQ4XHU4QkE0XHU1MDNDICovXG4gIHN0YXRpYyByZXN0b3JlRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFRoZW1lQnJpZGdlLklOSkVDVEVEX1ZBUlMpIHtcbiAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4vU3RvcmFnZUJyaWRnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4vVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuaW1wb3J0IHsgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhjb25maWdEaXIgXHU1M0VGXHU5MDFBXHU4RkM3IHNldENvbmZpZ0RpciBcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbmNvbnN0IERFRkFVTFRfU0tJUF9ESVJTID0gWycudHJhc2gnLCAnLmdpdCcsICdub2RlX21vZHVsZXMnXTtcblxuLyoqXG4gKiBCcmlkZ2VTZXJ2aWNlIC0gcG9zdE1lc3NhZ2UgXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU0RTJEXHU1RkMzXG4gKlxuICogXHU3NkQxXHU1NDJDIGlmcmFtZSBcdTUzRDFcdTY3NjVcdTc2ODQgcG9zdE1lc3NhZ2VcdUZGMENcdTUyMDZcdTUzRDFcdTUyMzBcdTVCRjlcdTVFOTRcdTU5MDRcdTc0MDZcdTZBMjFcdTU3NTdcdUZGMENcbiAqIFx1NzEzNlx1NTQwRVx1NUMwNlx1N0VEM1x1Njc5Q1x1NTZERVx1NEYyMFx1N0VEOSBpZnJhbWVcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIEJyaWRnZVNlcnZpY2Uge1xuICAgIHByaXZhdGUgc3RvcmFnZUJyaWRnZTogU3RvcmFnZUJyaWRnZTtcbiAgICBwcml2YXRlIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZTtcbiAgICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKCkgPT4gUHJvbWlzZTx2b2lkPikgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBjdXN0b21UaGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgbm9pc2VQYXRoOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIGNvbmZpZ0Rpcjogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBleHBlY3RlZE9yaWdpbiA9ICcnO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHN0b3JhZ2VCcmlkZ2U6IFN0b3JhZ2VCcmlkZ2UsXG4gICAgICAgIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZSxcbiAgICAgICAgc2V0dGluZ3M/OiBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbiAgICAgICAgc2F2ZVNldHRpbmdzPzogKCkgPT4gUHJvbWlzZTx2b2lkPlxuICAgICkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VCcmlkZ2UgPSBzdG9yYWdlQnJpZGdlO1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlID0gdGhlbWVCcmlkZ2U7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncyB8fCBudWxsO1xuICAgICAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncyB8fCBudWxsO1xuICAgIH1cblxuICAvKiogXHU3RUQxXHU1QjlBIGlmcmFtZSBcdTVFNzZcdTVGMDBcdTU5Q0JcdTc2RDFcdTU0MkNcdTZEODhcdTYwNkYgKi9cbiAgYXR0YWNoKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICAvLyBcdTk2MzJcdTZCNjJcdTkxQ0RcdTU5MERcdTdFRDFcdTVCOUFcbiAgICB0aGlzLmRldGFjaCgpO1xuXG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUoaWZyYW1lKTtcblxuICAgIC8vIFx1OEJCMFx1NUY1NSBleHBlY3RlZCBvcmlnaW5cdUZGMENcdTc1MjhcdTRFOEVcdTZEODhcdTYwNkZcdTY3NjVcdTZFOTBcdTY4MjFcdTlBOENcbiAgICB0cnkge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLm9uTWVzc2FnZShldmVudCk7XG4gICAgfTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTIxN1x1ODg2OFx1RkYwOFx1NEY5Qlx1NjNEMlx1NEVGNlx1N0FFRlx1NjI2Qlx1NjNDRlx1NTQwRVx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBzZXRDdXN0b21UaGVtZXModGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+KTogdm9pZCB7XG4gICAgdGhpcy5jdXN0b21UaGVtZXMgPSB0aGVtZXM7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjA4XHU0RjlCXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHNldFZhdWx0QmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMudmF1bHRCYXNlUGF0aCA9IGJhc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NCAqL1xuICBzZXROb2lzZVBhdGgobm9pc2VQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLm5vaXNlUGF0aCA9IG5vaXNlUGF0aDtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkUgT2JzaWRpYW4gXHU5MTREXHU3RjZFXHU3NkVFXHU1RjU1XHU1NDBEXHVGRjA4XHU5RUQ4XHU4QkE0IC5vYnNpZGlhblx1RkYwQ1x1NzUyOFx1NjIzN1x1NTNFRlx1ODFFQVx1NUI5QVx1NEU0OVx1RkYwOSAqL1xuICBzZXRDb25maWdEaXIoZGlyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZ0RpciA9IGRpcjtcbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0ZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTY1MkZcdTYzMDFcdTYzMDdcdTVCOUFcdTY1ODdcdTRFRjZcdTU5MzlcdTYyMTZcdTUxNjhcdTVFOTNcdTYyNkJcdTYzQ0ZcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBfc2NhblZhdWx0QXVkaW9GaWxlcyhtYXhEZXB0aCA9IDUpOiBQcm9taXNlPEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+ID0gW107XG4gICAgY29uc3QgYWxsb3dlZEV4dHMgPSBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlM7XG4gICAgY29uc3QgYmFzZVBhdGggPSB0aGlzLnZhdWx0QmFzZVBhdGg7XG4gICAgaWYgKCFiYXNlUGF0aCkgcmV0dXJuIHJlc3VsdHM7XG5cbiAgICAvLyBcdTY4QzBcdTY3RTUgYmFzZVBhdGggXHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XHVGRjA4XHU1RjAyXHU2QjY1XHVGRjA5XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGZzLnByb21pc2VzLnN0YXQoYmFzZVBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gXHU2MzA3XHU1QjlBXHU0RTg2XHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1M0VBXHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RTBEXHU5MDEyXHU1RjUyXHVGRjA5XG4gICAgaWYgKHRoaXMubm9pc2VQYXRoKSB7XG4gICAgICBjb25zdCB0YXJnZXREaXIgPSBwYXRoLmpvaW4oYmFzZVBhdGgsIHRoaXMubm9pc2VQYXRoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXM6IGZzLkRpcmVudFtdID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcih0YXJnZXREaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgaWYgKGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgICBpZiAoIWVudHJ5LmlzRmlsZSgpKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdDogZnMuU3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KHBhdGguam9pbih0YXJnZXREaXIsIGVudHJ5Lm5hbWUpKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHBhdGguam9pbih0aGlzLm5vaXNlUGF0aCwgZW50cnkubmFtZSksIG5hbWU6IGVudHJ5Lm5hbWUsIHNpemU6IHN0YXQuc2l6ZSwgZXh0IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjcyQVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTE2OFx1NUU5M1x1OTAxMlx1NUY1Mlx1NjI2Qlx1NjNDRlx1RkYwOFx1NUYwMlx1NkI2NSArIFx1NkRGMVx1NUVBNlx1OTY1MFx1NTIzNlx1RkYwOVxuICAgIGNvbnN0IHNjYW5EaXIgPSBhc3luYyAoZGlyUGF0aDogc3RyaW5nLCByZWxhdGl2ZVByZWZpeDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgbGV0IGVudHJpZXM6IGZzLkRpcmVudFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZW50cmllcyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIoZGlyUGF0aCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xuICAgICAgfSBjYXRjaCB7IHJldHVybjsgLyogc2tpcCB1bnJlYWRhYmxlIGRpcnMgKi8gfVxuXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgZW50cnkubmFtZSk7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlUHJlZml4ID8gcGF0aC5qb2luKHJlbGF0aXZlUHJlZml4LCBlbnRyeS5uYW1lKSA6IGVudHJ5Lm5hbWU7XG5cbiAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICBjb25zdCBza2lwRGlycyA9IG5ldyBTZXQoWy4uLkRFRkFVTFRfU0tJUF9ESVJTLCAuLi4odGhpcy5jb25maWdEaXIgPyBbdGhpcy5jb25maWdEaXJdIDogW10pXSk7XG4gICAgICAgICAgaWYgKHNraXBEaXJzLmhhcyhlbnRyeS5uYW1lKSkgY29udGludWU7XG4gICAgICAgICAgYXdhaXQgc2NhbkRpcihmdWxsUGF0aCwgcmVsYXRpdmVQYXRoLCBkZXB0aCArIDEpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpKSB7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXQ6IGZzLlN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHJlbGF0aXZlUGF0aCwgbmFtZTogZW50cnkubmFtZSwgc2l6ZTogc3RhdC5zaXplLCBleHQgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGF3YWl0IHNjYW5EaXIoYmFzZVBhdGgsICcnLCAwKTtcbiAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqIFx1ODlFM1x1N0VEMSBpZnJhbWVcdUZGMENcdTUwNUNcdTZCNjJcdTc2RDFcdTU0MkMgKi9cbiAgZGV0YWNoKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lc3NhZ2VIYW5kbGVyKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICAgICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMudGhlbWVCcmlkZ2UuZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1NkQ4OFx1NjA2Rlx1OERFRlx1NzUzMVx1NTkwNFx1NzQwNiAqL1xuICBwcml2YXRlIGFzeW5jIG9uTWVzc2FnZShldmVudDogTWVzc2FnZUV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbXNnID0gZXZlbnQuZGF0YSBhcyBBbnlCcmlkZ2VNZXNzYWdlO1xuICAgIGlmICghbXNnIHx8ICFtc2cudHlwZSB8fCAhbXNnLmlkKSByZXR1cm47XG5cbiAgICAvLyBcdTY4MjFcdTlBOENcdTZEODhcdTYwNkZcdTY3NjVcdTZFOTBcdUZGMUFzb3VyY2UgKyBvcmlnaW4gXHU1M0NDXHU5MUNEXHU5QThDXHU4QkMxXG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5leHBlY3RlZE9yaWdpbiAmJiBldmVudC5vcmlnaW4gIT09IHRoaXMuZXhwZWN0ZWRPcmlnaW4pIHtcbiAgICAgIGNvbnNvbGUud2FybignW0JyaWRnZVNlcnZpY2VdIElnbm9yZWQgbWVzc2FnZSBmcm9tIHVua25vd24gb3JpZ2luOicsIGV2ZW50Lm9yaWdpbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1M0VBXHU1OTA0XHU3NDA2XHU1REYyXHU3N0U1XHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXHU1MjREXHU3RjAwXG4gICAgaWYgKCFtc2cudHlwZS5zdGFydHNXaXRoKCdzdG9yYWdlOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCdhcHA6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2ZpbGU6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3RoZW1lOicpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXHU2RDg4XHU2MDZGXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWR5Jykge1xuICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUoKTtcbiAgICAgIC8vIFx1NjI4QVx1NjMwMVx1NEU0NVx1NTMxNlx1NzY4NCBzZWN0aW9uQ29uZmlnXHUzMDAxXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1NDhDXHU4MUVBXHU1QjlBXHU0RTQ5XHU5N0YzXHU2RTkwXHU5NjhGIHJlYWR5IFx1NTRDRFx1NUU5NFx1NTNEMVx1N0VEOSB3ZWJhcHBcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHtcbiAgICAgICAgb2s6IHRydWUsXG4gICAgICAgIHNlY3Rpb25Db25maWc6IHRoaXMuc2V0dGluZ3M/LnNlY3Rpb25Db25maWcgfHwgbnVsbCxcbiAgICAgICAgY3VzdG9tVGhlbWVzOiB0aGlzLmN1c3RvbVRoZW1lcyxcbiAgICAgICAgY3VzdG9tTm9pc2VzOiB0aGlzLnNldHRpbmdzPy5ub2lzZUl0ZW1zIHx8IFtdLFxuICAgICAgICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IHRoaXMuc2V0dGluZ3M/LnN5bmNQYWxldHRlVG9PYnNpZGlhbiB8fCBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpjbG9zZScpIHtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU2NzdGXHU1NzU3XHU5MTREXHU3RjZFXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnID0gbXNnLnBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZ3MpIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NjMwMVx1NEU0NVx1NTMxNlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zID0gQXJyYXkuaXNBcnJheShtc2cucGF5bG9hZCkgPyBtc2cucGF5bG9hZCA6IFtdO1xuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZ3MpIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NEUzQlx1OTg5OFx1NTIwN1x1NjM2Mlx1OEJGN1x1NkM0Mlx1RkYwOGlmcmFtZSBcdTIxOTIgT2JzaWRpYW5cdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6dG9nZ2xlVGhlbWUnKSB7XG4gICAgICBjb25zdCB0YXJnZXRJc0RhcmsgPSBtc2cucGF5bG9hZC5pc0RhcmsgPT09IHRydWU7ICAgICAgY29uc3QgY3VycmVudElzRGFyayA9IGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gICAgICBpZiAodGFyZ2V0SXNEYXJrICE9PSBjdXJyZW50SXNEYXJrKSB7XG4gICAgICAgIGlmICh0YXJnZXRJc0RhcmspIHtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWxpZ2h0Jyk7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd0aGVtZS1kYXJrJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1kYXJrJyk7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd0aGVtZS1saWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1OTAxQVx1NzdFNSBpZnJhbWUgXHU0RTNCXHU5ODk4XHU1REYyXHU1MjA3XHU2MzYyXG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlLCBpc0Rhcms6IHRhcmdldElzRGFyayB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdThCRjdcdTZDNDJcdUZGMDh3ZWJhcHAgXHUyMTkyIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2Mlx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3RoZW1lOnN5bmNQYWxldHRlJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3M/LnN5bmNQYWxldHRlVG9PYnNpZGlhbikge1xuICAgICAgICBjb25zdCB7IGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmsgfSA9IG1zZy5wYXlsb2FkO1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLmFwcGx5UGFsZXR0ZShodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gPT09PT0gXHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHVGRjFBXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ID09PT09XG5cbiAgICAvLyBcdTYyNkJcdTYzQ0ZcdTVFOTNcdTUxODVcdTYyNDBcdTY3MDlcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTRGOUIgd2ViYXBwIFx1NjU4N1x1NEVGNlx1OTAwOVx1NjJFOVx1NTY2OFx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpsaXN0VmF1bHRBdWRpb0ZpbGVzJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF0aGlzLnZhdWx0QmFzZVBhdGgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwQ1x1OEJGN1x1NUMxRFx1OEJENVx1OTFDRFx1NjVCMFx1NjI1M1x1NUYwMFx1OTc2Mlx1Njc3RicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIF9zY2FuVmF1bHRBdWRpb0ZpbGVzKCkgXHU1MTg1XHU5MEU4XHU1REYyXHU1RjAyXHU2QjY1XHU2OEMwXHU2N0U1XHU4REVGXHU1Rjg0XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5fc2NhblZhdWx0QXVkaW9GaWxlcygpO1xuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVzIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1x1NjI2Qlx1NjNDRlx1NUU5M1x1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNSc7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29dIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgbWVzc2FnZSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3XHU1RTkzXHU1MTg1XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUyMDE0IFx1OEZENFx1NTZERVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTI0RFx1N0FFRlx1NzZGNFx1NjNBNSBmZXRjaCBmaWxlOi8vXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NCcpO1xuICAgICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gdGhpcy52YXVsdEJhc2VQYXRoO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2VQYXRoLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTY4QzBcdTY3RTVcdUZGMUFcdTc4NkVcdTRGRERcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdThERUZcdTVGODRcdTY3MkFcdTkwMDNcdTkwMzhcdTUxRkEgdmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh2YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyXHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoOiBmdWxsUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShyZWxhdGl2ZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NUU5M1x1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEJGQlx1NTNENlx1NjcyQ1x1NTczMFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGNFx1NjNBNVx1NTZERVx1NEYyMFx1OERFRlx1NUY4NFx1NzUzMVx1NTI0RFx1N0FFRlx1NzUyOCBmaWxlOi8vIFx1NTJBMFx1OEY3RFx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpyZWFkTG9jYWxGaWxlJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFmaWxlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcbiAgICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU2MkQyXHU3RUREXHU1MzA1XHU1NDJCXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU1QjU3XHU3QjI2XHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgIGlmIChmaWxlUGF0aC5pbmNsdWRlcygnLi4nKSkgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjInKTtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NEUwRFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjgzQ1x1NUYwRlx1RkYxQScgKyBleHQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZmlsZVBhdGgpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQScgKyBmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBmaWxlUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShmaWxlUGF0aCwgZXh0KSB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1QjU4XHU1MEE4XHU3QzdCXHU2RDg4XHU2MDZGXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZUJyaWRnZS5oYW5kbGUobXNnKTtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgcGF5bG9hZCB9LCAnKicpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZEVycm9yKGlkOiBzdHJpbmcsIGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBlcnJvciB9LCAnKicpO1xuICB9XG59XG4iLCAiLyoqIFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NUI4Q1x1NjU3NFx1NTIxN1x1ODg2OFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyA9IFtcbiAgJy5tcDMnLCAnLndhdicsICcub2dnJywgJy5mbGFjJywgJy5hYWMnLCAnLm00YScsICcud21hJywgJy53ZWJtJywgJy5vcHVzJyxcbl07XG5cbi8qKiBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MEQgXHUyMTkyIE1JTUUgXHU3QzdCXHU1NzhCICovXG5jb25zdCBBVURJT19NSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLm1wMyc6ICAnYXVkaW8vbXBlZycsXG4gICcud2F2JzogICdhdWRpby93YXYnLFxuICAnLm9nZyc6ICAnYXVkaW8vb2dnJyxcbiAgJy5mbGFjJzogJ2F1ZGlvL2ZsYWMnLFxuICAnLmFhYyc6ICAnYXVkaW8vYWFjJyxcbiAgJy5tNGEnOiAgJ2F1ZGlvL21wNCcsXG4gICcud21hJzogICdhdWRpby94LW1zLXdtYScsXG4gICcud2VibSc6ICdhdWRpby93ZWJtJyxcbiAgJy5vcHVzJzogJ2F1ZGlvL29wdXMnLFxufTtcblxuLyoqIFx1NUI4Q1x1NjU3NCBNSU1FIFx1N0M3Qlx1NTc4Qlx1NjYyMFx1NUMwNFx1RkYwOFx1NTQyQiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHVGRjA5ICovXG5leHBvcnQgY29uc3QgTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5odG1sJzogJ3RleHQvaHRtbDsgY2hhcnNldD11dGYtOCcsXG4gICcuY3NzJzogICd0ZXh0L2NzczsgY2hhcnNldD11dGYtOCcsXG4gICcuanMnOiAgICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5tanMnOiAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzb24nOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICcucG5nJzogICdpbWFnZS9wbmcnLFxuICAnLmpwZyc6ICAnaW1hZ2UvanBlZycsXG4gICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJy5naWYnOiAgJ2ltYWdlL2dpZicsXG4gICcuc3ZnJzogICdpbWFnZS9zdmcreG1sJyxcbiAgJy5pY28nOiAgJ2ltYWdlL3gtaWNvbicsXG4gICcud29mZic6ICdmb250L3dvZmYnLFxuICAnLndvZmYyJzonZm9udC93b2ZmMicsXG4gICcudHRmJzogICdmb250L3R0ZicsXG4gIC4uLkFVRElPX01JTUVfVFlQRVMsXG59O1xuIiwgImltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgbmV0IGZyb20gJ25ldCc7XG5pbXBvcnQgeyBNSU1FX1RZUEVTLCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuXG4vKipcbiAqIExvY2FsU2VydmVyIC0gXHU2NzJDXHU1NzMwIEhUVFAgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2NzBEXHU1MkExXHU1NjY4XG4gKlxuICogXHU1NzI4IE9ic2lkaWFuIChFbGVjdHJvbikgXHU3M0FGXHU1ODgzXHU0RTJEXHU1NDJGXHU1MkE4XHU0RTAwXHU0RTJBXHU2NzJDXHU1NzMwIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXG4gKiBcdTRFM0EgaWZyYW1lIFx1NjNEMFx1NEY5QiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU2NzBEXHU1MkExXHVGRjBDXHU3RUQ1XHU4RkM3IGFwcDovLyBcdTUzNEZcdThCQUVcdTc2ODRcdTk2NTBcdTUyMzZcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU2VydmVyIHtcbiAgcHJpdmF0ZSBzZXJ2ZXI6IGh0dHAuU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcG9ydCA9IDA7XG4gIHByaXZhdGUgd2ViYXBwRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG5cbiAgY29uc3RydWN0b3Iod2ViYXBwRGlyOiBzdHJpbmcpIHtcbiAgICB0aGlzLndlYmFwcERpciA9IHdlYmFwcERpcjtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU1NDJGXHU1MkE4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXHU4RkQ0XHU1NkRFXHU3NkQxXHU1NDJDXHU3QUVGXHU1M0UzICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKHRoaXMuc2VydmVyKSByZXR1cm4gdGhpcy5wb3J0O1xuXG4gICAgdGhpcy5wb3J0ID0gYXdhaXQgdGhpcy5maW5kRnJlZVBvcnQoKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QocmVxLCByZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFNlcnZlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbih0aGlzLnBvcnQsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RhcnRlZCBvbiBwb3J0ICR7dGhpcy5wb3J0fWApO1xuICAgICAgICByZXNvbHZlKHRoaXMucG9ydCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTUwNUNcdTZCNjJcdTY3MERcdTUyQTFcdTU2NjggKi9cbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIExvY2FsIHNlcnZlciBzdG9wcGVkJyk7XG4gICAgICAgICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgICAgICAgIHRoaXMucG9ydCA9IDA7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTY3MERcdTUyQTFcdTU2NjggVVJMICovXG4gIGdldFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgaHR0cDovLzEyNy4wLjAuMToke3RoaXMucG9ydH1gO1xuICB9XG5cbiAgLyoqIFx1NTkwNFx1NzQwNiBIVFRQIFx1OEJGN1x1NkM0MiAqL1xuICBwcml2YXRlIGhhbmRsZVJlcXVlc3QocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgLy8gL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU0RUUzXHU3NDA2XHVGRjBDXHU3RUQ1XHU4RkM3IHBvc3RNZXNzYWdlIFx1NTkyNyBwYXlsb2FkIFx1OTY1MFx1NTIzNlxuICAgIGNvbnN0IHVybCA9IHJlcS51cmwgfHwgJy8nO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnL2JhbWJvby1hdWRpby1wcm94eScpKSB7XG4gICAgICB0aGlzLmhhbmRsZUF1ZGlvVXJsUHJveHkocmVxLCByZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9iYW1ib28tYXVkaW8nKSkge1xuICAgICAgdGhpcy5oYW5kbGVBdWRpb1Byb3h5KHJlcSwgcmVzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTg5RTNcdTY3OTAgVVJMXHVGRjBDXHU1M0JCXHU5NjY0XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXG4gICAgbGV0IHVybFBhdGggPSB1cmwuc3BsaXQoJz8nKVswXTtcbiAgICAvLyBcdTc2RUVcdTVGNTVcdTlFRDhcdThCQTRcdTY1ODdcdTRFRjZcbiAgICBpZiAodXJsUGF0aC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICB1cmxQYXRoICs9ICdpbmRleC5odG1sJztcbiAgICB9XG4gICAgY29uc3Qgc2FmZVBhdGggPSBwYXRoLm5vcm1hbGl6ZSh1cmxQYXRoKS5yZXBsYWNlKC9eKFxcLlxcLlsvXFxcXF0pKy8sICcnKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLndlYmFwcERpciwgc2FmZVBhdGgpO1xuXG4gICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU1NzI4IHdlYmFwcERpciBcdTUxODVcbiAgICBpZiAoIWZpbGVQYXRoLnN0YXJ0c1dpdGgodGhpcy53ZWJhcHBEaXIpKSB7XG4gICAgICByZXMud3JpdGVIZWFkKDQwMyk7XG4gICAgICByZXMuZW5kKCdGb3JiaWRkZW4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBmcy5zdGF0KGZpbGVQYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xuICAgICAgICByZXMuZW5kKGA8IURPQ1RZUEUgaHRtbD5cbjxodG1sPjxoZWFkPjxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPjxzdHlsZT5cbiAgYm9keSB7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBoZWlnaHQ6MTAwdmg7IG1hcmdpbjowO1xuICAgICAgICAgZm9udC1mYW1pbHk6IHN5c3RlbS11aSwgc2Fucy1zZXJpZjsgYmFja2dyb3VuZDojMGEwYTBhOyBjb2xvcjojODg4OyB9XG4gIC5ib3ggeyB0ZXh0LWFsaWduOmNlbnRlcjsgfVxuICBoMiB7IGNvbG9yOiNjY2M7IGZvbnQtd2VpZ2h0OjQwMDsgfVxuICBwIHsgZm9udC1zaXplOjE0cHg7IH1cbiAgYnV0dG9uIHsgbWFyZ2luLXRvcDoxNnB4OyBwYWRkaW5nOjhweCAyNHB4OyBib3JkZXI6MXB4IHNvbGlkICM0NDQ7IGJvcmRlci1yYWRpdXM6NnB4O1xuICAgICAgICAgICBiYWNrZ3JvdW5kOiMxYTFhMWE7IGNvbG9yOiNhYWE7IGN1cnNvcjpwb2ludGVyOyBmb250LXNpemU6MTRweDsgfVxuICBidXR0b246aG92ZXIgeyBiYWNrZ3JvdW5kOiMyYTJhMmE7IGNvbG9yOiNmZmY7IH1cbjwvc3R5bGU+PC9oZWFkPjxib2R5PlxuPGRpdiBjbGFzcz1cImJveFwiPlxuICA8aDI+XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHU2QjYzXHU1NzI4XHU1MjFEXHU1OUNCXHU1MzE2XHUyMDI2XHUyMDI2PC9oMj5cbiAgPHA+XHU5OTk2XHU2QjIxXHU1NDJGXHU1MkE4XHU5NzAwXHU4OTgxXHU0RTBCXHU4RjdEXHU4RDQ0XHU2RTkwXHU1MzA1XHVGRjBDXHU4QkY3XHU3QTBEXHU1MDE5PC9wPlxuICA8YnV0dG9uIG9uY2xpY2s9XCJsb2NhdGlvbi5yZWxvYWQoKVwiPlx1NjI0Qlx1NTJBOFx1NTIzN1x1NjVCMDwvYnV0dG9uPlxuICA8c2NyaXB0PlxuICAgIHZhciByZXRyaWVzID0gMDtcbiAgICBmdW5jdGlvbiBjaGVjaygpIHtcbiAgICAgIGZldGNoKHdpbmRvdy5sb2NhdGlvbi5ocmVmLCB7IG1ldGhvZDogJ0hFQUQnIH0pLnRoZW4oZnVuY3Rpb24ocikge1xuICAgICAgICBpZiAoci5zdGF0dXMgPT09IDIwMCkgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIGVsc2UgaWYgKCsrcmV0cmllcyA8IDMwKSBzZXRUaW1lb3V0KGNoZWNrLCAyMDAwKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKCkgeyBpZiAoKytyZXRyaWVzIDwgMzApIHNldFRpbWVvdXQoY2hlY2ssIDIwMDApOyB9KTtcbiAgICB9XG4gICAgc2V0VGltZW91dChjaGVjaywgMzAwMCk7XG4gIDwvc2NyaXB0PlxuPC9kaXY+PC9ib2R5PjwvaHRtbD5gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThCQkVcdTdGNkUgTUlNRSBcdTdDN0JcdTU3OEJcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuXG4gICAgICAvLyBcdTVERUVcdTVGMDJcdTUzMTZcdTdGMTNcdTVCNThcdTdCNTZcdTc1NjVcdUZGMUFcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdTVFMjYgX19CVUlMRF9fIFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwQ1x1NTNFRlx1OTU3Rlx1NjcxRlx1N0YxM1x1NUI1OFxuICAgICAgY29uc3QgaXNIVE1MID0gZXh0ID09PSAnLmh0bWwnO1xuICAgICAgY29uc3QgaXNTdGF0aWMgPSBbJy5jc3MnLCAnLmpzJywgJy53b2ZmJywgJy53b2ZmMicsICcudHRmJywgJy5zdmcnLCAnLnBuZycsICcuaWNvJywgJy5qc29uJ10uaW5jbHVkZXMoZXh0KTtcbiAgICAgIGNvbnN0IGNhY2hlQ29udHJvbCA9IGlzSFRNTFxuICAgICAgICA/ICduby1jYWNoZSdcbiAgICAgICAgOiBpc1N0YXRpY1xuICAgICAgICAgID8gJ3B1YmxpYywgbWF4LWFnZT04NjQwMCdcbiAgICAgICAgICA6ICdwdWJsaWMsIG1heC1hZ2U9MzYwMCc7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NEUwRFx1OTcwMFx1ODk4MSBDT1JTXHVGRjBDaWZyYW1lIFx1NEUwRVx1NjcwRFx1NTJBMVx1NTY2OFx1NTQwQ1x1NkU5MFx1RkYwOVxuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgICAnQ2FjaGUtQ29udHJvbCc6IGNhY2hlQ29udHJvbCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTZENDFcdTVGMEZcdTRGMjBcdThGOTNcdTY1ODdcdTRFRjZcbiAgICAgIGNvbnN0IHN0cmVhbTogZnMuUmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZVBhdGgpO1xuICAgICAgc3RyZWFtLnBpcGUocmVzKTtcbiAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiAvYmFtYm9vLWF1ZGlvLXByb3h5P3VybD14eHggXHUyMDE0IFx1NEVFM1x1NzQwNlx1NTkxNlx1OTBFOFx1OTdGM1x1NkU5MCBVUkxcdUZGMENcdTdFRDVcdThGQzdcdTZENEZcdTg5QzhcdTU2NjggQ09SUyBcdTk2NTBcdTUyMzYgKi9cbiAgcHJpdmF0ZSBoYW5kbGVBdWRpb1VybFByb3h5KHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByYXdVcmwgPSByZXEudXJsIHx8ICcnO1xuICAgICAgY29uc3QgcXVlcnlJbmRleCA9IHJhd1VybC5pbmRleE9mKCc/Jyk7XG4gICAgICBpZiAocXVlcnlJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHVybCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcXVlcnlTdHIgPSByYXdVcmwuc2xpY2UocXVlcnlJbmRleCArIDEpO1xuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhxdWVyeVN0cik7XG4gICAgICBjb25zdCB0YXJnZXRVcmwgPSBwYXJhbXMuZ2V0KCd1cmwnKTtcbiAgICAgIGlmICghdGFyZ2V0VXJsKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyB1cmwgcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU0RUM1XHU1MTQxXHU4QkI4IGh0dHAvaHR0cHNcbiAgICAgIGxldCBwYXJzZWQ6IFVSTDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IG5ldyBVUkwodGFyZ2V0VXJsKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ0ludmFsaWQgVVJMJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJzZWQucHJvdG9jb2wgIT09ICdodHRwOicgJiYgcGFyc2VkLnByb3RvY29sICE9PSAnaHR0cHM6Jykge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogb25seSBodHRwL2h0dHBzIFVSTHMgYWxsb3dlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzk4MVx1NkI2Mlx1OEJCRlx1OTVFRVx1NjcyQ1x1NTczMFx1NTczMFx1NTc0MFxuICAgICAgY29uc3QgaG9zdG5hbWUgPSBwYXJzZWQuaG9zdG5hbWU7XG4gICAgICBpZiAoaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnIHx8IGhvc3RuYW1lID09PSAnMTI3LjAuMC4xJyB8fCBob3N0bmFtZSA9PT0gJzAuMC4wLjAnXG4gICAgICAgIHx8IGhvc3RuYW1lID09PSAnWzo6MV0nIHx8IGhvc3RuYW1lLnN0YXJ0c1dpdGgoJzE5Mi4xNjguJykgfHwgaG9zdG5hbWUuc3RhcnRzV2l0aCgnMTAuJylcbiAgICAgICAgfHwgaG9zdG5hbWUuc3RhcnRzV2l0aCgnMTcyLicpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuOiBsb2NhbC9wcml2YXRlIG5ldHdvcmsgVVJMcyBub3QgYWxsb3dlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NzY3RFx1NTQwRFx1NTM1NVx1RkYwOVxuICAgICAgY29uc3QgcGF0aG5hbWUgPSBwYXJzZWQucGF0aG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLnNvbWUoZXh0ID0+IHBhdGhuYW1lLmVuZHNXaXRoKGV4dCkpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuOiB1bnN1cHBvcnRlZCBhdWRpbyBmb3JtYXQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0cmFuc3BvcnQgPSBwYXJzZWQucHJvdG9jb2wgPT09ICdodHRwczonID8gaHR0cHMgOiBodHRwO1xuICAgICAgY29uc3QgcHJveHlSZXEgPSB0cmFuc3BvcnQuZ2V0KHRhcmdldFVybCwgeyB0aW1lb3V0OiAzMDAwMCB9LCAocHJveHlSZXMpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gcHJveHlSZXMuc3RhdHVzQ29kZSB8fCA1MDA7XG4gICAgICAgIGNvbnN0IGN0ID0gcHJveHlSZXMuaGVhZGVyc1snY29udGVudC10eXBlJ10gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG5cbiAgICAgICAgLy8gXHU5NjUwXHU1MjM2XHU1NENEXHU1RTk0XHU1OTI3XHU1QzBGXHVGRjA4XHU2NzAwXHU1OTI3IDUwTUJcdUZGMDlcbiAgICAgICAgY29uc3QgbWF4U2l6ZSA9IDUwICogMTAyNCAqIDEwMjQ7XG4gICAgICAgIGxldCB0b3RhbFNpemUgPSAwO1xuICAgICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG5cbiAgICAgICAgcHJveHlSZXMub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgIHRvdGFsU2l6ZSArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgICAgaWYgKHRvdGFsU2l6ZSA+IG1heFNpemUpIHtcbiAgICAgICAgICAgIHByb3h5UmVxLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDEzKTsgcmVzLmVuZCgnQXVkaW8gZmlsZSB0b28gbGFyZ2UgKG1heCA1ME1CKScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb3h5UmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcy5oZWFkZXJzU2VudCkgcmV0dXJuO1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoc3RhdHVzLCB7XG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogY3QsXG4gICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiB0b3RhbFNpemUsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBCdWZmZXIuY29uY2F0KGNodW5rcyk7XG4gICAgICAgICAgcmVzLmVuZChib2R5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJveHlSZXMub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBBdWRpbyBVUkwgcHJveHkgdXBzdHJlYW0gZXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIpOyByZXMuZW5kKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcHJveHlSZXEub24oJ3RpbWVvdXQnLCAoKSA9PiB7XG4gICAgICAgIHByb3h5UmVxLmRlc3Ryb3koKTtcbiAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwNCk7IHJlcy5lbmQoJ1Vwc3RyZWFtIHRpbWVvdXQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByb3h5UmVxLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gVVJMIHByb3h5IGVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMik7IHJlcy5lbmQoJ1Vwc3RyZWFtIGNvbm5lY3Rpb24gZmFpbGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIFVSTCBwcm94eSBlcnJvcjonLCBlKTtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU2RDQxXHU1RjBGXHU0RUUzXHU3NDA2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9Qcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXM6IFVSTFNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHIpO1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFyYW1zLmdldCgncGF0aCcpO1xuICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHBhdGggcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU1M0VBXHU1MTQxXHU4QkI4XHU2MzA3XHU1QjlBXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUocmVsYXRpdmVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogdW5zdXBwb3J0ZWQgYXVkaW8gZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzk4MVx1NkI2Mlx1OERFRlx1NUY4NFx1N0E3Rlx1OEQ4QVxuICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IHBhdGgubm9ybWFsaXplKHJlbGF0aXZlUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcuLicpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTsgcmVzLmVuZCgnVmF1bHQgYmFzZSBwYXRoIG5vdCBjb25maWd1cmVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCBub3JtYWxpemVkKTtcbiAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnMuc3RhdChmdWxsUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7IHJlcy5lbmQoJ0ZpbGUgbm90IGZvdW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBzdGF0cy5zaXplLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3RyZWFtOiBmcy5SZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmdWxsUGF0aCk7XG4gICAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIHJlcy5lbmQoJ1N0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIHByb3h5IGVycm9yOicsIGUpO1xuICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogXHU2N0U1XHU2MjdFXHU1M0VGXHU3NTI4XHU3QUVGXHU1M0UzICovXG4gIHByaXZhdGUgZmluZEZyZWVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgIHNlcnZlci5saXN0ZW4oMCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9ydCA9IChzZXJ2ZXIuYWRkcmVzcygpIGFzIG5ldC5BZGRyZXNzSW5mbykucG9ydDtcbiAgICAgICAgc2VydmVyLmNsb3NlKCgpID0+IHJlc29sdmUocG9ydCkpO1xuICAgICAgfSk7XG4gICAgICBzZXJ2ZXIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufSIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuXG4vKiogXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhbWJvb1Jldmlld1NldHRpbmdzIHtcbiAgLyoqIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1NjgzOVx1OERFRlx1NUY4NCAqL1xuICBkYXRhUGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAqL1xuICBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG4gIC8qKiBcdTY3N0ZcdTU3NTdcdTdCQTFcdTc0MDZcdTkxNERcdTdGNkVcdUZGMDhcdTUzRUZcdTg5QzFcdTYwMjcgKyBcdTYzOTJcdTVFOEZcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEUgd2ViYXBwIGlmcmFtZSBsb2NhbFN0b3JhZ2UgXHU0RTBEXHU1M0VGXHU5NzYwXHU2NUY2XHU2MzAxXHU0RTQ1XHU1MzE2ICovXG4gIHNlY3Rpb25Db25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOSAqL1xuICB0aGVtZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5M1x1RkYwOSAqL1xuICBub2lzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NTIxN1x1ODg2OFx1RkYwOFx1OTAxQVx1OEZDN1x1Njg2NVx1NjNBNVx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwQ1x1NTE0Qlx1NjcwRCBsb2NhbFN0b3JhZ2UgcG9ydC1zY29wZWQgXHU5NUVFXHU5ODk4XHVGRjA5ICovXG4gIG5vaXNlSXRlbXM6IHVua25vd25bXTtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NUMwNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MiAqL1xuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IHtcbiAgZGF0YVBhdGg6ICdiYW1ib28tcmV2aWV3JyxcbiAgZW5hYmxlTWFya2Rvd25TeW5jOiB0cnVlLFxuICBzZWN0aW9uQ29uZmlnOiBudWxsLFxuICB0aGVtZVBhdGg6ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnLFxuICBub2lzZVBhdGg6ICcnLFxuICBub2lzZUl0ZW1zOiBbXSxcbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBmYWxzZSxcbn07XG5cbi8qKlxuICogUGx1Z2luU2V0dGluZ3MgLSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqL1xuZXhwb3J0IGNsYXNzIFBsdWdpblNldHRpbmdzIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgfVxuXG4gIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuICAgIGNvbnRhaW5lckVsLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LXNldHRpbmdzJyk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIC0gXHU4QkJFXHU3RjZFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gPT09IFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU4REVGXHU1Rjg0XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTU3MjggVmF1bHQgXHU0RTJEXHU3Njg0XHU1QjU4XHU1MEE4XHU3NkVFXHU1RjU1XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdiYW1ib28tcmV2aWV3JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGF0YVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGF0YVBhdGggPSB2YWx1ZSB8fCAnYmFtYm9vLXJldmlldyc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIE1hcmtkb3duIFx1NjQ1OFx1ODk4MVx1NTQwQ1x1NkI2NVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEnKVxuICAgICAgLnNldERlc2MoJ1x1NkJDRlx1NkIyMVx1NEZERFx1NUI1OFx1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NjVGNlx1RkYwQ1x1ODFFQVx1NTJBOFx1NTcyOCByZXZpZXdzLyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc1MUZcdTYyMTBcdTUzRUZcdThCRkJcdTc2ODQgLm1kIFx1NjU4N1x1NEVGNicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTRFM0JcdTk4OThcdTUyQThcdTY1NDggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU1QjU4XHU2NTNFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IC5qcyBcdTY1ODdcdTRFRjZcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGggPSB2YWx1ZSB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NzY3RFx1NTY2QVx1OTdGMyA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU3NjdEXHU1NjZBXHU5N0YzJykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTYzMDdcdTVCOUFcdTU0MEVcdTRFQzVcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdTUxODVcdTc2ODRcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTMwMDJcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTY1NzRcdTRFMkFcdTVFOTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1NzY3RFx1NTY2QVx1OTdGMyBcdTYyMTZcdTc1NTlcdTdBN0FcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTMnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTVDMDZcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4nKVxuICAgICAgLnNldERlc2MoJ1x1NjI1M1x1NUYwMFx1NTQwRVx1RkYwQ3dlYmFwcCBcdTUxODVcdTYwQUNcdTZENkVcdTgzRENcdTUzNTVcdTc2ODRcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU4QzAzXHU4MjcyXHU0RjFBXHU1QjlFXHU2NUY2XHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NzY4NFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2Mlx1OTE0RFx1ODI3MicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgVGhlbWVCcmlkZ2UucmVzdG9yZURlZmF1bHRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGFjdGl2ZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElGcmFtZUVsZW1lbnQ+KCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKGZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBlbmFibGVkOiB2YWx1ZSB9XG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTUxNzNcdTRFOEVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU1MTczXHU0RThFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAxXHVGRjFBXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBsdWdpbkJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdCYW1ib28gSW1tb3J0YWxzXHVGRjA4XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHVGRjA5XHU2NjJGXHU0RTAwXHU2QjNFXHU1N0ZBXHU0RThFXHU4MkNGXHU4MDU0XHU2M0E3XHU1MjM2XHU4QkJBXHU0RTRCXHU3MjM2XHU3RUY0XHU1MTRCXHU2MjU4XHUwMEI3XHU2ODNDXHU1MzYyXHU0RUMwXHU3OUQxXHU1OTJCXHU2M0QwXHU1MUZBXHU3Njg0XCJPR0FTXCJcdTc0MDZcdTVGRjVcdUZGMENcdTRFMTNcdTRFM0FcdTRFMkFcdTRFQkFcdTYyNTNcdTkwMjBcdTc2ODRcdTRFMkRcdTU2RkRcdTk4Q0VcdTc2RUVcdTY4MDdcdTgxRUFcdTUyQThcdTUzMTZcdTUyMDZcdTkxNERcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnXG4gICAgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQgYmFtYm9vLWFib3V0LWF1dGhvcicgfSk7XG4gICAgY29uc3QgYXV0aG9yUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm93JyB9KTtcbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF2YXRhcicgfSk7XG4gICAgLy8gXHU0RUNFXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHU4QkZCXHU1M0Q2XHU1OTM0XHU1MENGXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDdGXHU1MTREXHU4RkM3XHU5NTdGXHU3Njg0IGJhc2U2NCBcdTg4QUIgT2JzaWRpYW4gXHU2MjJBXHU2NUFEXHU1QkZDXHU4MUY0XHU3QTdBXHU3NjdEXHVGRjA5XG4gICAgLy8gXHU0RjE4XHU1MTQ4XHU4QkZCXHU2M0QyXHU0RUY2XHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4ZGV2L0JSQVRcdUZGMDlcdUZGMENcdTUxNzZcdTZCMjFcdTRFQ0Ugd2ViYXBwIFx1OEQ0NFx1NkU5MFx1NEUyRFx1OEJGQlx1NTNENlx1RkYwOFx1NjNEMlx1NEVGNlx1NUUwMlx1NTczQVx1NUI4OVx1ODhDNVx1RkYwOVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwbHVnaW5EaXIgPSB0aGlzLnBsdWdpbi5tYW5pZmVzdC5kaXIgPz8gJyc7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgdW5rbm93biBhcyB7IGJhc2VQYXRoOiBzdHJpbmcgfSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgICAgICBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnYXV0aG9yLWF2YXRhci5qcGcnKSwgICAgICAgICAgICAgICAvLyBkZXYgLyBCUkFUIC8gcmVsZWFzZSBhc3NldFxuICAgICAgICBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnd2ViYXBwJywgJ2Fzc2V0cycsICdpbWFnZXMnLCAnYXV0aG9yLWF2YXRhci5qcGcnKSwgLy8gd2ViYXBwIFx1NTE4NVx1N0Y2RVxuICAgICAgXTtcbiAgICAgIGZvciAoY29uc3QgYXZhdGFyUGF0aCBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGF2YXRhclBhdGgpKSB7XG4gICAgICAgICAgY29uc3QgYXZhdGFyRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhdmF0YXJQYXRoKTtcbiAgICAgICAgICBjb25zdCBiNjQgPSBhdmF0YXJEYXRhLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgICBhdmF0YXIuc2V0Q3NzU3R5bGVzKHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYHVybChkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCR7YjY0fSlgLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7IC8qIHNpbGVudGx5IHNraXAgXHUyMDE0IHNob3cgZGVmYXVsdCBlbXB0eSBhdmF0YXIgKi8gfVxuXG5cbiAgICBjb25zdCBhdXRob3JJbmZvID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItaW5mbycgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1N0ZCRFx1OUNERVx1NTQxQicsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItbmFtZScgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NTVCNVx1NUI1N1x1OTk4Nlx1NTIxQlx1NTlDQlx1NEVCQScsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm9sZScgfSk7XG5cbiAgICAvLyBcdTRGNUNcdTU0QzFcdTUzM0FcbiAgICBhdXRob3JCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTRGNUNcdTU0QzEnLCBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3MtbGFiZWwnIH0pO1xuICAgIGNvbnN0IHdvcmtzUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1yb3cnIH0pO1xuXG4gICAgW3sgbmFtZTogJ1x1N0FGOVx1NTNGNlx1OThERVx1NTIwMycsIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLUJhbWJvby1EYXJ0cycgfSxcbiAgICAgeyBuYW1lOiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscycgfV0uZm9yRWFjaCh3b3JrID0+IHtcbiAgICAgIGNvbnN0IHRhZyA9IHdvcmtzUm93LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiB3b3JrLm5hbWUsIGNsczogJ2JhbWJvby1hYm91dC10YWcnIH0pO1xuICAgICAgaWYgKHdvcmsudXJsKSB7XG4gICAgICAgIHRhZy5zZXRDc3NTdHlsZXMoeyBjdXJzb3I6ICdwb2ludGVyJyB9KTtcbiAgICAgICAgdGFnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5vcGVuKHdvcmsudXJsLCAnX2JsYW5rJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGXG4gICAgY29uc3QgY29udGFjdEJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU5MEFFXHU3QkIxXHVGRjFBeWFueXVsaW4yMTAwQHFxLmNvbScsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1RkFFXHU0RkUxXHVGRjFBeWFuaHU5NCcsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUE4QztBQUM5QyxJQUFBQyxRQUFzQjtBQUN0QixJQUFBQyxNQUFvQjtBQUNwQixXQUFzQjtBQUN0QixJQUFBQyxTQUF1Qjs7O0FDSnZCLElBQUFDLG1CQUFrRDtBQUNsRCxJQUFBQyxRQUFzQjtBQUN0QixJQUFBQyxNQUFvQjs7O0FDRnBCLHNCQUEwQzs7O0FDb0JuQyxJQUFNLHdCQUFOLGNBQW9DLE1BQU07QUFBQSxFQUMvQyxZQUFZLFNBQWlCO0FBQzNCLFVBQU0sT0FBTztBQUNiLFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFDRjtBQUVBLElBQU0sZUFBZSxDQUFDLFFBQVEs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O0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxhQUFhLE1BQW9CO0FBQ3ZDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0Isc0JBQXNCO0FBQ3hFLFFBQUksT0FBTyxXQUFXLEVBQUc7QUFFekIsVUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLFVBQU0sU0FBVSxLQUF5RDtBQUN6RSxRQUFJLFFBQVEsZUFBZTtBQUN6QixVQUFJLFNBQVM7QUFDYixVQUFJO0FBQUUsaUJBQVMsSUFBSSxJQUFJLE9BQU8sR0FBRyxFQUFFO0FBQUEsTUFBUSxRQUFRO0FBQUEsTUFBaUI7QUFDcEUsYUFBTyxjQUFjO0FBQUEsUUFDbkIsRUFBRSxNQUFNLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtBQUFBLFFBQ2hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxFQUMzRTtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImZzIiwgImh0dHBzIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAic3RhdCIsICJzdGF0IiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZnMiLCAiY2h1bmtzIl0KfQo=
