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
var path3 = __toESM(require("path"));
var fs3 = __toESM(require("fs"));
var zlib = __toESM(require("zlib"));
var https2 = __toESM(require("https"));

// src/views/DailyReviewView.ts
var import_obsidian2 = require("obsidian");

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
    const path4 = (0, import_obsidian.normalizePath)(`${this.basePath}/${dir}`);
    if (!await this.app.vault.adapter.exists(path4)) {
      await this.app.vault.adapter.mkdir(path4);
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
  async vaultWrite(path4, content) {
    const normalized = (0, import_obsidian.normalizePath)(path4);
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
    const path4 = this.dayPath(dateKey);
    if (!await this.app.vault.adapter.exists(path4)) {
      return null;
    }
    try {
      const content = await this.app.vault.adapter.read(path4);
      return JSON.parse(content);
    } catch (e) {
      console.warn(`[BambooReview] \u65E5\u671F\u6570\u636E\u6587\u4EF6\u635F\u574F\uFF0C\u5C06\u8DF3\u8FC7: ${path4}`, e);
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
    const path4 = this.dayPath(dateKey);
    await this.vaultWrite(path4, JSON.stringify(dayData, null, 2));
  }
  async deleteDay(dateKey) {
    const path4 = this.dayPath(dateKey);
    if (await this.app.vault.adapter.exists(path4)) {
      await this.app.vault.adapter.remove(path4);
    }
  }
  // ---- 全局目标 (goals) ----
  goalsPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/goals.json`);
  }
  async getGoals() {
    const path4 = this.goalsPath();
    if (!await this.app.vault.adapter.exists(path4)) {
      return [];
    }
    const content = await this.app.vault.adapter.read(path4);
    return JSON.parse(content);
  }
  async putGoals(goals) {
    const path4 = this.goalsPath();
    await this.vaultWrite(path4, JSON.stringify(goals, null, 2));
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
    const path4 = (0, import_obsidian.normalizePath)(this.settingsPath());
    const abstract = this.app.vault.getAbstractFileByPath(path4);
    if (abstract instanceof import_obsidian.TFile) {
      await this.app.vault.process(abstract, (data) => {
        const settings = JSON.parse(data);
        settings[key] = value;
        return JSON.stringify(settings, null, 2);
      });
    } else {
      await this.vaultWrite(path4, JSON.stringify({ [key]: value }, null, 2));
    }
  }
  async getAllSettings() {
    const path4 = this.settingsPath();
    if (!await this.app.vault.adapter.exists(path4)) {
      return {};
    }
    try {
      const content = await this.app.vault.adapter.read(path4);
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
    const path4 = this.purchaseHistoryPath();
    if (!await this.app.vault.adapter.exists(path4)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path4);
    return JSON.parse(content);
  }
  async putPurchaseHistory(data) {
    const path4 = this.purchaseHistoryPath();
    await this.vaultWrite(path4, JSON.stringify(data, null, 2));
  }
  // ---- 收入历史 (income-history.json) ----
  incomeHistoryPath() {
    return (0, import_obsidian.normalizePath)(`${this.basePath}/income-history.json`);
  }
  async getIncomeHistory() {
    const path4 = this.incomeHistoryPath();
    if (!await this.app.vault.adapter.exists(path4)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path4);
    return JSON.parse(content);
  }
  async putIncomeHistory(data) {
    const path4 = this.incomeHistoryPath();
    await this.vaultWrite(path4, JSON.stringify(data, null, 2));
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
    const path4 = this.settingsPath();
    if (await this.app.vault.adapter.exists(path4)) {
      await this.app.vault.adapter.remove(path4);
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
    const path4 = this.reviewPath(dateKey);
    await this.vaultWrite(path4, markdown);
  }
  async deleteMarkdownReview(dateKey) {
    const path4 = this.reviewPath(dateKey);
    if (await this.app.vault.adapter.exists(path4)) {
      await this.app.vault.adapter.remove(path4);
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
    this.vaultAdapter = null;
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
  /** 注入 Obsidian Vault 适配器，用于 Vault API 路径操作替代 fs */
  setVaultAdapter(adapter) {
    this.vaultAdapter = adapter;
  }
  /** 设置白噪音文件夹路径 */
  setNoisePath(noisePath) {
    this.noisePath = noisePath;
  }
  /** 设置 Obsidian 配置目录名（默认 .obsidian，用户可自定义） */
  setConfigDir(dir) {
    this.configDir = dir;
  }
  /** 扫描库内音频文件（支持指定文件夹或全库扫描），通过 Vault API 替代 fs */
  async _scanVaultAudioFiles(maxDepth = 5) {
    const results = [];
    const allowedExts = ALLOWED_AUDIO_EXTENSIONS;
    const adapter = this.vaultAdapter;
    if (!adapter) return results;
    if (this.noisePath) {
      try {
        const list = await adapter.list(this.noisePath);
        for (const file of list.files) {
          if (file.startsWith(".")) continue;
          const ext = path.extname(file).toLowerCase();
          if (allowedExts.includes(ext)) {
            try {
              const fileStat = await adapter.stat(path.join(this.noisePath, file));
              results.push({ path: path.join(this.noisePath, file), name: file, size: fileStat?.size ?? 0, ext });
            } catch {
            }
          }
        }
      } catch {
      }
      results.sort((a, b) => a.path.localeCompare(b.path));
      return results;
    }
    const scanDir = async (relativeDir, depth) => {
      if (depth > maxDepth) return;
      let list;
      try {
        list = await adapter.list(relativeDir);
      } catch {
        return;
      }
      for (const folder of list.folders) {
        if (folder.startsWith(".")) continue;
        const skipDirs = /* @__PURE__ */ new Set([...DEFAULT_SKIP_DIRS, ...this.configDir ? [this.configDir] : []]);
        if (skipDirs.has(folder)) continue;
        const subPath = relativeDir ? path.join(relativeDir, folder) : folder;
        await scanDir(subPath, depth + 1);
      }
      for (const file of list.files) {
        if (file.startsWith(".")) continue;
        const ext = path.extname(file).toLowerCase();
        if (allowedExts.includes(ext)) {
          try {
            const relativePath = relativeDir ? path.join(relativeDir, file) : file;
            const fileStat = await adapter.stat(relativePath);
            results.push({ path: relativePath, name: file, size: fileStat?.size ?? 0, ext });
          } catch {
          }
        }
      }
    };
    await scanDir("", 0);
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
        if (!this.vaultAdapter) throw new Error("Vault \u9002\u914D\u5668\u672A\u521D\u59CB\u5316");
        if (relativePath.includes("..")) throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62\uFF1A" + relativePath);
        const fileStat = await this.vaultAdapter.stat(relativePath);
        if (!fileStat || fileStat.type !== "file") throw new Error("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A" + relativePath);
        if (!this.vaultBasePath) throw new Error("\u65E0\u6CD5\u83B7\u53D6\u5E93\u6839\u76EE\u5F55\u8DEF\u5F84");
        const fullPath = path.join(this.vaultBasePath, relativePath);
        if (!fullPath.startsWith(this.vaultBasePath)) throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62\uFF1A" + relativePath);
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
    this.bridgeService.setVaultAdapter(this.app.vault.adapter);
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
  /** 扫描 Vault 中的自定义主题 .js 文件（通过 Vault API，不经过 fs） */
  async _scanCustomThemes() {
    const themes = [];
    const adapter = this.app.vault.adapter;
    try {
      const themeDirName = this.settings.themePath || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
      let themeDirFiles;
      try {
        themeDirFiles = (await adapter.list(themeDirName)).files;
      } catch {
        return themes;
      }
      for (const entry of themeDirFiles) {
        if (!entry.endsWith(".js")) continue;
        const filePath = `${themeDirName}/${entry}`;
        try {
          const code = await adapter.read(filePath);
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
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
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
    const safePath = path2.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path2.join(this.webappDir, safePath);
    if (!filePath.startsWith(this.webappDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs2.stat(filePath, (err, stats) => {
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
      const ext = path2.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const isHTML = ext === ".html";
      const isStatic = [".css", ".js", ".woff", ".woff2", ".ttf", ".svg", ".png", ".ico", ".json"].includes(ext);
      const cacheControl = isHTML ? "no-cache" : isStatic ? "public, max-age=86400" : "public, max-age=3600";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": cacheControl
      });
      const stream = fs2.createReadStream(filePath);
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
      const ext = path2.extname(relativePath).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
        res.writeHead(403);
        res.end("Forbidden: unsupported audio format");
        return;
      }
      const normalized = path2.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
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
      const fullPath = path2.join(this.vaultBasePath, normalized);
      if (!fullPath.startsWith(this.vaultBasePath)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      fs2.stat(fullPath, (err, stats) => {
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
        const stream = fs2.createReadStream(fullPath);
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
  async display() {
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
      const adapter = this.app.vault.adapter;
      const candidates = [
        `${pluginDir}/author-avatar.jpg`,
        `${pluginDir}/webapp/assets/images/author-avatar.jpg`
      ];
      for (const avatarPath of candidates) {
        const exists = await adapter.exists(avatarPath);
        if (!exists) continue;
        const avatarData = await adapter.readBinary(avatarPath);
        const b64 = Buffer.from(avatarData).toString("base64");
        avatar.setCssStyles({
          backgroundImage: `url(data:image/jpeg;base64,${b64})`
        });
        break;
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
  const buf = typeof source === "string" ? await fs3.promises.readFile(source) : source;
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
    const outPath = path3.join(destDir, fileName);
    const dir = path3.dirname(outPath);
    const data = buf.subarray(pos, pos + compressedSize);
    pos += compressedSize;
    if (method === 0) {
      writes.push(fs3.promises.mkdir(dir, { recursive: true }).then(() => fs3.promises.writeFile(outPath, data)));
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
        await fs3.promises.mkdir(dir, { recursive: true });
        await fs3.promises.writeFile(outPath, bytes);
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
  const webappVersionFile = path3.join(webappDir, ".version");
  const needsUpdate = !fs3.existsSync(webappVersionFile) || (() => {
    try {
      return fs3.readFileSync(webappVersionFile, "utf-8").trim() !== currentVersion;
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
        if (fs3.existsSync(webappDir)) {
          try {
            fs3.rmSync(webappDir, { recursive: true, force: true });
          } catch {
          }
        }
        const webappZip = path3.join(vaultBasePath, pluginDir, "webapp.zip");
        fs3.mkdirSync(webappDir, { recursive: true });
        if (fs3.existsSync(webappZip)) {
          new import_obsidian4.Notice("\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u6B63\u5728\u89E3\u538B\u8D44\u6E90\u5305\u2026", 0);
          await extractZip(webappZip, webappDir);
          try {
            fs3.unlinkSync(webappZip);
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
        fs3.writeFileSync(webappVersionFile, currentVersion, "utf-8");
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
      const webappDir = path3.join(vaultBasePath, pluginDir, "webapp");
      const webappIndexPath = path3.join(webappDir, "index.html");
      this.localServer = new LocalServer(webappDir);
      try {
        await this.localServer.start();
        this.serverUrl = this.localServer.getUrl();
        this.localServer.setVaultBasePath(vaultBasePath);
        if (fs3.existsSync(webappIndexPath)) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9JbXBvcnRWYWxpZGF0b3IudHMiLCAic3JjL3N0b3JhZ2UvTWFya2Rvd25TeW5jLnRzIiwgInNyYy9icmlkZ2UvU3RvcmFnZUJyaWRnZS50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvQnJpZGdlU2VydmljZS50cyIsICJzcmMvY29uc3RhbnRzL2F1ZGlvLnRzIiwgInNyYy9zZXJ2ZXIvTG9jYWxTZXJ2ZXIudHMiLCAic3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBQbHVnaW4sIFdvcmtzcGFjZUxlYWYsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IExvY2FsU2VydmVyIH0gZnJvbSAnLi9zcmMvc2VydmVyL0xvY2FsU2VydmVyJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9zcmMvYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG4vKiogXHU3RUFGIE5vZGUuanMgWklQIFx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1Nlx1N0NGQlx1N0VERiB1bnppcC9Qb3dlclNoZWxsXHUzMDAyXHU1RjAyXHU2QjY1XHU4QkZCXHU1M0Q2K1x1ODlFM1x1NTM4Qlx1RkYwQ1x1NEVDNVx1NUI1N1x1ODI4Mlx1ODlFM1x1Njc5MFx1NEZERFx1NjMwMVx1NTQwQ1x1NkI2NVx1MzAwMiAqL1xuYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFppcChzb3VyY2U6IHN0cmluZyB8IEJ1ZmZlciwgZGVzdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGJ1ZiA9IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoc291cmNlKSA6IHNvdXJjZTtcbiAgbGV0IHBvcyA9IDA7XG5cbiAgY29uc3QgcmVhZDE2ID0gKCkgPT4geyBjb25zdCB2ID0gYnVmLnJlYWRVSW50MTZMRShwb3MpOyBwb3MgKz0gMjsgcmV0dXJuIHY7IH07XG4gIGNvbnN0IHJlYWQzMiA9ICgpID0+IHsgY29uc3QgdiA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTsgcG9zICs9IDQ7IHJldHVybiB2OyB9O1xuICBjb25zdCBza2lwID0gKG46IG51bWJlcikgPT4geyBwb3MgKz0gbjsgfTtcblxuICBjb25zdCB3cml0ZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gIC8vIFx1NjI2Qlx1NjNDRlx1NjI0MFx1NjcwOSBsb2NhbCBmaWxlIGhlYWRlclx1RkYwOFx1N0I3RVx1NTQwRCAweDA0MDM0YjUwXHVGRjA5XG4gIHdoaWxlIChwb3MgPCBidWYubGVuZ3RoIC0gNCkge1xuICAgIGNvbnN0IHNpZyA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTtcbiAgICBpZiAoc2lnICE9PSAweDA0MDM0YjUwKSBicmVhaztcblxuICAgIHBvcyArPSA0O1xuICAgIHJlYWQxNigpOyAvLyB2ZXJzaW9uXG4gICAgcmVhZDE2KCk7IC8vIGZsYWdzXG4gICAgY29uc3QgbWV0aG9kID0gcmVhZDE2KCk7XG4gICAgc2tpcCg0KTsgLy8gbW9kIHRpbWUsIG1vZCBkYXRlXG4gICAgcmVhZDMyKCk7IC8vIGNyYzMyXG4gICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSByZWFkMzIoKTtcbiAgICBjb25zdCB1bmNvbXByZXNzZWRTaXplID0gcmVhZDMyKCk7XG4gICAgY29uc3QgbmFtZUxlbiA9IHJlYWQxNigpO1xuICAgIGNvbnN0IGV4dHJhTGVuID0gcmVhZDE2KCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBidWYudG9TdHJpbmcoJ3V0Zi04JywgcG9zLCBwb3MgKyBuYW1lTGVuKTtcbiAgICBwb3MgKz0gbmFtZUxlbiArIGV4dHJhTGVuO1xuXG4gICAgLy8gXHU4REYzXHU4RkM3XHU3NkVFXHU1RjU1XHU2NzYxXHU3NkVFXG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcvJykgfHwgZmlsZU5hbWUuZW5kc1dpdGgoJ1xcXFwnKSkge1xuICAgICAgcG9zICs9IGNvbXByZXNzZWRTaXplO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0UGF0aCA9IHBhdGguam9pbihkZXN0RGlyLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKG91dFBhdGgpO1xuXG4gICAgY29uc3QgZGF0YSA9IGJ1Zi5zdWJhcnJheShwb3MsIHBvcyArIGNvbXByZXNzZWRTaXplKTtcbiAgICBwb3MgKz0gY29tcHJlc3NlZFNpemU7XG5cbiAgICBpZiAobWV0aG9kID09PSAwKSB7XG4gICAgICB3cml0ZXMucHVzaChmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pLnRoZW4oKCkgPT4gZnMucHJvbWlzZXMud3JpdGVGaWxlKG91dFBhdGgsIGRhdGEpKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kID09PSA4KSB7XG4gICAgICB3cml0ZXMucHVzaCgoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYnl0ZXM6IEJ1ZmZlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBieXRlcyA9IHpsaWIuaW5mbGF0ZVJhd1N5bmMoZGF0YSwgeyBmaW5pc2hGbHVzaDogemxpYi5jb25zdGFudHMuWl9TWU5DX0ZMVVNIIH0pO1xuICAgICAgICAgIGlmIChieXRlcy5sZW5ndGggIT09IHVuY29tcHJlc3NlZFNpemUpIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMCwgdW5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGJ5dGVzID0gemxpYi5pbmZsYXRlU3luYyhkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy53cml0ZUZpbGUob3V0UGF0aCwgYnl0ZXMpO1xuICAgICAgfSkoKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZDogYCArIG1ldGhvZCArICcgKCcgKyBmaWxlTmFtZSArICcpJyk7XG4gIH1cbn1cblxuLyoqIFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEIgKi9cbmZ1bmN0aW9uIGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChfcGx1Z2luRGlyOiBzdHJpbmcsIGRlc3REaXI6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMvcmVsZWFzZXMvZG93bmxvYWQvJHt2ZXJzaW9ufS93ZWJhcHAuemlwYDtcbiAgICBodHRwcy5nZXQodXJsLCB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscycgfSB9LCAocmVzKSA9PiB7XG4gICAgICBpZiAocmVzLnN0YXR1c0NvZGUgPT09IDMwMiB8fCByZXMuc3RhdHVzQ29kZSA9PT0gMzAxKSB7XG4gICAgICAgIC8vIEZvbGxvdyByZWRpcmVjdFxuICAgICAgICBodHRwcy5nZXQocmVzLmhlYWRlcnMubG9jYXRpb24gfHwgJycsIHsgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdvYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9IH0sIChyZWRpcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgICAgICByZWRpci5vbignZGF0YScsIChjOiBCdWZmZXIpID0+IGNodW5rcy5wdXNoKGMpKTtcbiAgICAgICAgICByZWRpci5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZXh0cmFjdFppcChCdWZmZXIuY29uY2F0KGNodW5rcyksIGRlc3REaXIpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUgaW5zdGFuY2VvZiBFcnJvciA/IGUgOiBuZXcgRXJyb3IoU3RyaW5nKGUpKSk7IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZWRpci5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQICR7cmVzLnN0YXR1c0NvZGV9OiAke3VybH1gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgIHJlcy5vbignZGF0YScsIChjOiBCdWZmZXIpID0+IGNodW5rcy5wdXNoKGMpKTtcbiAgICAgIHJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGV4dHJhY3RaaXAoQnVmZmVyLmNvbmNhdChjaHVua3MpLCBkZXN0RGlyKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUgaW5zdGFuY2VvZiBFcnJvciA/IGUgOiBuZXcgRXJyb3IoU3RyaW5nKGUpKSk7IH1cbiAgICAgIH0pO1xuICAgICAgcmVzLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgfSk7XG59XG5cbi8qKiBcdTU0MEVcdTUzRjBcdTVGMDJcdTZCNjVcdTUyMURcdTU5Q0JcdTUzMTYgd2ViYXBwXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFXHU2M0QyXHU0RUY2XHU3Njg0IG9ubG9hZCBcdThGRDRcdTU2REUgKi9cbmZ1bmN0aW9uIHNldHVwV2ViYXBwSW5CYWNrZ3JvdW5kKFxuICB0aGlzOiBCYW1ib29SZXZpZXdQbHVnaW4sXG4gIHdlYmFwcERpcjogc3RyaW5nLFxuICBwbHVnaW5EaXI6IHN0cmluZyxcbiAgdmF1bHRCYXNlUGF0aDogc3RyaW5nLFxuICBjdXJyZW50VmVyc2lvbjogc3RyaW5nXG4pOiB2b2lkIHtcbiAgY29uc3Qgd2ViYXBwVmVyc2lvbkZpbGUgPSBwYXRoLmpvaW4od2ViYXBwRGlyLCAnLnZlcnNpb24nKTtcbiAgY29uc3QgbmVlZHNVcGRhdGUgPSAhZnMuZXhpc3RzU3luYyh3ZWJhcHBWZXJzaW9uRmlsZSkgfHxcbiAgICAoKCkgPT4geyB0cnkgeyByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHdlYmFwcFZlcnNpb25GaWxlLCAndXRmLTgnKS50cmltKCkgIT09IGN1cnJlbnRWZXJzaW9uOyB9IGNhdGNoIHsgcmV0dXJuIHRydWU7IH0gfSkoKTtcblxuICBpZiAoIW5lZWRzVXBkYXRlKSB7XG4gICAgdGhpcy53ZWJhcHBSZWFkeSA9IHRydWU7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gXHU3NTI4IHNldEltbWVkaWF0ZSAvIHNldFRpbWVvdXQgXHU2M0E4XHU4RkRGXHU1MjMwXHU0RTBCXHU0RTAwXHU0RTJBIHRpY2tcdUZGMENcdTc4NkVcdTRGREQgb25sb2FkIFx1NTE0OFx1OEZENFx1NTZERVxuICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMod2ViYXBwRGlyKSkge1xuICAgICAgICB0cnkgeyBmcy5ybVN5bmMod2ViYXBwRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7IH0gY2F0Y2ggeyAvKiBcdTc2RUVcdTVGNTVcdTUzRUZcdTgwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTVGRkRcdTc1NjUgKi8gfVxuICAgICAgfVxuICAgICAgY29uc3Qgd2ViYXBwWmlwID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHBsdWdpbkRpciwgJ3dlYmFwcC56aXAnKTtcbiAgICAgIGZzLm1rZGlyU3luYyh3ZWJhcHBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyh3ZWJhcHBaaXApKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2QjYzXHU1NzI4XHU4OUUzXHU1MzhCXHU4RDQ0XHU2RTkwXHU1MzA1XHUyMDI2JywgMCk7XG4gICAgICAgIGF3YWl0IGV4dHJhY3RaaXAod2ViYXBwWmlwLCB3ZWJhcHBEaXIpO1xuICAgICAgICB0cnkgeyBmcy51bmxpbmtTeW5jKHdlYmFwcFppcCk7IH0gY2F0Y2ggeyAvKiBcdTg5RTNcdTUzOEJcdTRFQTdcdTcyNjlcdTVERjJcdTVDMzFcdTRGNERcdUZGMENcdTUyMjBcdTk2NjQgemlwIFx1NTkzMVx1OEQyNVx1NTNFRlx1NUZGRFx1NzU2NSAqLyB9XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1REYyXHU2NkY0XHU2NUIwJywgMzAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3dubG9hZE5vdGljZSA9IG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2QjYzXHU1NzI4XHU0RTBCXHU4RjdEXHU4RDQ0XHU2RTkwXHU1MzA1XHUyMDI2JywgMCk7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ1tCYW1ib29SZXZpZXddIERvd25sb2FkaW5nIHdlYmFwcCBmcm9tIHJlbGVhc2UnLCBjdXJyZW50VmVyc2lvbik7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkQW5kRXh0cmFjdFdlYmFwcChwbHVnaW5EaXIsIHdlYmFwcERpciwgY3VycmVudFZlcnNpb24pO1xuICAgICAgICBkb3dubG9hZE5vdGljZS5oaWRlKCk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1Qjg5XHU4OEM1XHU1QjhDXHU2MjEwJywgNDAwMCk7XG4gICAgICB9XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMod2ViYXBwVmVyc2lvbkZpbGUsIGN1cnJlbnRWZXJzaW9uLCAndXRmLTgnKTtcbiAgICAgIHRoaXMud2ViYXBwUmVhZHkgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFdlYmFwcCBzZXR1cCBmYWlsZWQ6JywgZSk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU4RDQ0XHU2RTkwXHU1MzA1XHU1Qjg5XHU4OEM1XHU1OTMxXHU4RDI1XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU3RjUxXHU3RURDXHU1NDBFXHU5MUNEXHU1NDJGIE9ic2lkaWFuJywgMCk7XG4gICAgfVxuICAgIH0pKCk7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW1ib29SZXZpZXdQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIGxvY2FsU2VydmVyOiBMb2NhbFNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHNlcnZlclVybCA9ICcnO1xuICAvKiogd2ViYXBwIFx1OEQ0NFx1NkU5MFx1NjYyRlx1NTQyNlx1NUMzMVx1N0VFQVx1RkYwOFx1NTNFRlx1NzUyOFx1NEU4RVx1OTk5Nlx1NUM0Rlx1NUM1NVx1NzkzQSBsb2FkaW5nIFx1NzJCNlx1NjAwMVx1RkYwOSAqL1xuICB3ZWJhcHBSZWFkeSA9IGZhbHNlO1xuXG4gIGFzeW5jIG9ubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkVcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4XHU2NzJDXHU1NzMwIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XG4gICAgY29uc3QgcGx1Z2luRGlyID0gdGhpcy5tYW5pZmVzdC5kaXI7XG4gICAgaWYgKHBsdWdpbkRpcikge1xuICAgICAgY29uc3QgdmF1bHRCYXNlUGF0aCA9ICh0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIHVua25vd24gYXMgeyBiYXNlUGF0aDogc3RyaW5nIH0pLmJhc2VQYXRoIHx8ICcnO1xuICAgICAgY29uc3Qgd2ViYXBwRGlyID0gcGF0aC5qb2luKHZhdWx0QmFzZVBhdGgsIHBsdWdpbkRpciwgJ3dlYmFwcCcpO1xuICAgICAgY29uc3Qgd2ViYXBwSW5kZXhQYXRoID0gcGF0aC5qb2luKHdlYmFwcERpciwgJ2luZGV4Lmh0bWwnKTtcbiAgICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBuZXcgTG9jYWxTZXJ2ZXIod2ViYXBwRGlyKTtcblxuICAgICAgLy8gXHU3QUNCXHU1MzczXHU1NDJGXHU1MkE4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjA4XHU1MzczXHU0RjdGIHdlYmFwcCBcdThGRDhcdTZDQTFcdTVDMzFcdTdFRUFcdUZGMDlcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTU4NUUgb25sb2FkXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxvY2FsU2VydmVyLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuc2VydmVyVXJsID0gdGhpcy5sb2NhbFNlcnZlci5nZXRVcmwoKTtcbiAgICAgICAgdGhpcy5sb2NhbFNlcnZlci5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgICAgICAvLyBcdTU5ODJcdTY3OUMgd2ViYXBwIFx1NURGMlx1NUMzMVx1N0VFQVx1RkYwQ1x1NzZGNFx1NjNBNVx1NjgwN1x1OEJCMFxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh3ZWJhcHBJbmRleFBhdGgpKSB7XG4gICAgICAgICAgdGhpcy53ZWJhcHBSZWFkeSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gRmFpbGVkIHRvIHN0YXJ0IGxvY2FsIHNlcnZlcjonLCBlKTtcbiAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY3MkNcdTU3MzBcdTY3MERcdTUyQTFcdTU0MkZcdTUyQThcdTU5MzFcdThEMjVcdUZGMENcdTkwRThcdTUyMDZcdTUyOUZcdTgwRkRcdUZGMDhcdTc2N0RcdTU2NkFcdTk3RjNcdTMwMDFcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdUZGMDlcdTUzRUZcdTgwRkRcdTRFMERcdTUzRUZcdTc1MjgnLCAwKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU3MjQ4XHU2NzJDXHU4RERGXHU4RTJBICYgd2ViYXBwIFx1NEUwQlx1OEY3RFx1NjUzRVx1NTIzMFx1NTQwRVx1NTNGMFx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RSBvbmxvYWQgXHU4RkQ0XHU1NkRFXG4gICAgICBzZXR1cFdlYmFwcEluQmFja2dyb3VuZC5jYWxsKHRoaXMsIHdlYmFwcERpciwgcGx1Z2luRGlyLCB2YXVsdEJhc2VQYXRoLCB0aGlzLm1hbmlmZXN0LnZlcnNpb24pO1xuICAgIH1cblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0RBSUxZX1JFVklFVywgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGFpbHlSZXZpZXdWaWV3KGxlYWYsIHRoaXMuc2VydmVyVXJsLCB0aGlzLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnByZXZEYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6bmV4dERheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtdG9kYXknLFxuICAgICAgbmFtZTogJ1x1NTZERVx1NTIzMFx1NEVDQVx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjp0b2RheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TdGF0cycpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ2FjdGlvbjpvcGVuU2V0dGluZ3MnKSxcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9udW5sb2FkKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgIHZvaWQgdGhpcy5sb2NhbFNlcnZlcj8uc3RvcCgpO1xuICAgIHRoaXMubG9jYWxTZXJ2ZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1NkZDMFx1NkQzQlx1NjIxNlx1NTIxQlx1NUVGQVx1NTkwRFx1NzZEOFx1ODlDNlx1NTZGRSAqL1xuICBhc3luYyBhY3RpdmF0ZVZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwO1xuXG4gICAgbGV0IGxlYWY6IFdvcmtzcGFjZUxlYWYgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBsZWF2ZXMgPSB3b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuXG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBcdTVERjJcdTY3MDlcdTg5QzZcdTU2RkVcdUZGMENcdTc2RjRcdTYzQTVcdTgwNUFcdTcxMjZcbiAgICAgIGxlYWYgPSBsZWF2ZXNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NTIxQlx1NUVGQVx1NjVCMFx1ODlDNlx1NTZGRVxuICAgICAgbGVhZiA9IHdvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKTtcbiAgICAgIGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHtcbiAgICAgICAgdHlwZTogVklFV19UWVBFX0RBSUxZX1JFVklFVyxcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGxlYWYpIHtcbiAgICAgIGF3YWl0IHdvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYWYpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NUJGQ1x1ODIyQS9cdTY0Q0RcdTRGNUNcdTYzMDdcdTRFRTQgKi9cbiAgcHJpdmF0ZSBzZW5kVG9JZnJhbWUodHlwZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcbiAgICBpZiAobGVhdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdmlldyA9IGxlYXZlc1swXS52aWV3IGFzIERhaWx5UmV2aWV3VmlldztcbiAgICBjb25zdCBpZnJhbWUgPSAodmlldyBhcyB1bmtub3duIGFzIHsgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgfSkuaWZyYW1lO1xuICAgIGlmIChpZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgIGxldCBvcmlnaW4gPSAnKic7XG4gICAgICB0cnkgeyBvcmlnaW4gPSBuZXcgVVJMKGlmcmFtZS5zcmMpLm9yaWdpbjsgfSBjYXRjaCB7IC8qIGtlZXAgJyonICovIH1cbiAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgICB7IHR5cGUsIGlkOiAnY21kXycgKyBEYXRlLm5vdygpIH0sXG4gICAgICAgIG9yaWdpblxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKSBhcyBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgRXZlbnRSZWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSBCYW1ib29SZXZpZXdQbHVnaW4gZnJvbSAnLi4vLi4vbWFpbic7XG5pbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1N0b3JhZ2VCcmlkZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHsgQnJpZGdlU2VydmljZSB9IGZyb20gJy4uL2JyaWRnZS9CcmlkZ2VTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1Njc4MVx1N0I4MFx1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZSBcdTYyN0ZcdThGN0QgUFdBXG4gKiAyLiBcdTdCQTFcdTc0MDYgQnJpZGdlU2VydmljZSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcbiAqIDMuIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTVFNzZcdTU0MENcdTZCNjVcbiAqL1xuZXhwb3J0IGNsYXNzIERhaWx5UmV2aWV3VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcHJpdmF0ZSBicmlkZ2VTZXJ2aWNlOiBCcmlkZ2VTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZUVycm9ySGFuZGxlcjogKChlOiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBrZXlkb3duRm9yd2FyZGVyOiAoKGU6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2NoZWNrSW50ZXJ2YWw6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNzc0NoYW5nZVJlZjogRXZlbnRSZWYgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB3ZWJhcHBQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBwcml2YXRlIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHdlYmFwcFBhdGg6IHN0cmluZywgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4sIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncywgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIobGVhZik7XG4gICAgdGhpcy53ZWJhcHBQYXRoID0gd2ViYXBwUGF0aDtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3M7XG4gIH1cblxuICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXO1xuICB9XG5cbiAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCc7XG4gIH1cblxuICBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdsZWFmJztcbiAgfVxuXG4gIGFzeW5jIG9uT3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXSBhcyBIVE1MRWxlbWVudDtcbiAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctY29udGFpbmVyJyk7XG5cbiAgICBpZiAoIXRoaXMud2ViYXBwUGF0aCkge1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjVFMFx1NkNENVx1NUI5QVx1NEY0RCB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU2M0QyXHU0RUY2XHU1Qjg5XHU4OEM1XHU3NkVFXHU1RjU1JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB3ZWJhcHAgXHU1QzFBXHU2NzJBXHU1QzMxXHU3RUVBXHU2NUY2XHU2NjNFXHU3OTNBIGxvYWRpbmcgXHU1MzYwXHU0RjREXHVGRjBDXHU1NDBFXHU1M0YwXHU1RjAyXHU2QjY1XHU2MkM5XHU1MzA1XHU4OUUzXHU1MzA1XG4gICAgaWYgKCF0aGlzLnBsdWdpbi53ZWJhcHBSZWFkeSkge1xuICAgICAgY29uc3Qgc3RhdHVzRWwgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1NkI2M1x1NTcyOFx1NTIxRFx1NTlDQlx1NTMxNlx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1MjAyNicsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctbG9hZGluZycsXG4gICAgICB9KTtcbiAgICAgIC8vIFx1OEY2RVx1OEJFMlx1N0I0OVx1NUY4NVx1NUMzMVx1N0VFQVx1NTQwRVx1NTJBMFx1OEY3RCBpZnJhbWVcbiAgICAgIGxldCB0aWNrcyA9IDA7XG4gICAgICB0aGlzLl9jaGVja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgdGlja3MrKztcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLndlYmFwcFJlYWR5KSB7XG4gICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5fY2hlY2tJbnRlcnZhbCEpO1xuICAgICAgICAgIHRoaXMuX2NoZWNrSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICAgIHZvaWQgdGhpcy5zZXR1cElmcmFtZShjb250YWluZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyAzMCBcdTc5RDJcdTU0MEVcdTYzRDBcdTc5M0FcdTdGNTFcdTdFRENcdThGODNcdTYxNjJcbiAgICAgICAgaWYgKHRpY2tzID09PSA2MCkge1xuICAgICAgICAgIHN0YXR1c0VsLnNldFRleHQoJ1x1NkI2M1x1NTcyOFx1NEUwQlx1OEY3RFx1OEQ0NFx1NkU5MFx1NTMwNVx1RkYwQ1x1N0Y1MVx1N0VEQ1x1OEY4M1x1NjE2Mlx1OEJGN1x1N0EwRFx1NTAxOVx1MjAyNicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIDEyMCBcdTc5RDJcdTU0MEVcdTYzRDBcdTc5M0FcdTUzRUZcdTgwRkRcdTU5MzFcdThEMjVcbiAgICAgICAgaWYgKHRpY2tzID09PSAyNDApIHtcbiAgICAgICAgICBzdGF0dXNFbC5zZXRUZXh0KCdcdThENDRcdTZFOTBcdTUzMDVcdTRFMEJcdThGN0RcdTVGMDJcdTVFMzhcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTdGNTFcdTdFRENcdTU0MEVcdTkxQ0RcdTU0MkYgT2JzaWRpYW4nKTtcbiAgICAgICAgfVxuICAgICAgfSwgNTAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnNldHVwSWZyYW1lKGNvbnRhaW5lcik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNldHVwSWZyYW1lKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTUyMUJcdTVFRkEgaWZyYW1lIC0gXHU0RTBEXHU0RjdGXHU3NTI4IHNhbmRib3hcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTZCNjIgYXBwOi8vIFx1NTM0Rlx1OEJBRVx1NEUwQlx1NzY4NFx1NUI1MFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFxuICAgIHRoaXMuaWZyYW1lID0gY29udGFpbmVyLmNyZWF0ZUVsKCdpZnJhbWUnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWZyYW1lJyxcbiAgICAgIGF0dHI6IHtcbiAgICAgICAgc3JjOiB0aGlzLndlYmFwcFBhdGgsXG4gICAgICAgIGFsbG93OiAnY2FtZXJhOyBtaWNyb3Bob25lOyBjbGlwYm9hcmQtcmVhZDsgY2xpcGJvYXJkLXdyaXRlJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBpZnJhbWUgXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU2NUY2XHU2NjNFXHU3OTNBXHU2M0QwXHU3OTNBXG4gICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSAoX2U6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBpZnJhbWUgZmFpbGVkIHRvIGxvYWQ6JywgdGhpcy53ZWJhcHBQYXRoKTtcbiAgICB9O1xuICAgIHRoaXMuaWZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuXG4gICAgLy8gXHU1RjUzIGlmcmFtZSBcdTU5MDRcdTRFOEVcdTcxMjZcdTcwQjlcdTY1RjZcdUZGMENcdTVDMDYgQ3RybC9DbWQgXHU1RkVCXHU2Mzc3XHU5NTJFXHU4RjZDXHU1M0QxXHU3RUQ5IE9ic2lkaWFuXHVGRjBDXG4gICAgLy8gXHU3ODZFXHU0RkREXHU1NDdEXHU0RUU0XHU5NzYyXHU2NzdGXHVGRjA4Q3RybC9DbWQrUFx1RkYwOVx1MzAwMVx1NUZFQlx1OTAxRlx1NTIwN1x1NjM2Mlx1RkYwOEN0cmwvQ21kK09cdUZGMDlcdTdCNDlcdTUxNjhcdTVDNDBcdTVGRUJcdTYzNzdcdTk1MkVcdTRFQ0RcdTcxMzZcdTUzRUZcdTc1MjhcbiAgICBjb25zdCBvYnNpZGlhbkRvYyA9IGFjdGl2ZURvY3VtZW50O1xuICAgIGxldCBmb3J3YXJkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5rZXlkb3duRm9yd2FyZGVyID0gKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChmb3J3YXJkaW5nKSByZXR1cm47XG4gICAgICBpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkge1xuICAgICAgICBmb3J3YXJkaW5nID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEtleWJvYXJkRXZlbnQoJ2tleWRvd24nLCB7XG4gICAgICAgICAga2V5OiBlLmtleSxcbiAgICAgICAgICBjb2RlOiBlLmNvZGUsXG4gICAgICAgICAgY3RybEtleTogZS5jdHJsS2V5LFxuICAgICAgICAgIG1ldGFLZXk6IGUubWV0YUtleSxcbiAgICAgICAgICBzaGlmdEtleTogZS5zaGlmdEtleSxcbiAgICAgICAgICBhbHRLZXk6IGUuYWx0S2V5LFxuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2lkaWFuRG9jLmJvZHkuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgICAgICBmb3J3YXJkaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgICBhY3RpdmVEb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duRm9yd2FyZGVyLCB0cnVlKTtcblxuICAgIC8vIFx1NTIxRFx1NTlDQlx1NTMxNlx1Njg2NVx1NjNBNVx1NjcwRFx1NTJBMVxuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBhd2FpdCBzdG9yYWdlLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgY29uc3Qgc3RvcmFnZUJyaWRnZSA9IG5ldyBTdG9yYWdlQnJpZGdlKHN0b3JhZ2UsIHRoaXMuc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbmV3IFRoZW1lQnJpZGdlKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlID0gbmV3IEJyaWRnZVNlcnZpY2UoXG4gICAgICBzdG9yYWdlQnJpZGdlLFxuICAgICAgdGhpcy50aGVtZUJyaWRnZSxcbiAgICAgIHRoaXMuc2V0dGluZ3MsXG4gICAgICB0aGlzLnNhdmVTZXR0aW5nc1xuICAgICk7XG5cbiAgICAvLyBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTJEXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XG4gICAgY29uc3QgY3VzdG9tVGhlbWVzID0gYXdhaXQgdGhpcy5fc2NhbkN1c3RvbVRoZW1lcygpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRDdXN0b21UaGVtZXMoY3VzdG9tVGhlbWVzKTtcblxuICAgIC8vIFx1NEYyMFx1OTAxMlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOFx1NEY5Qlx1NzY3RFx1NTY2QVx1OTdGM1x1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjI2Qlx1NjNDRi9cdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgdW5rbm93biBhcyB7IGJhc2VQYXRoOiBzdHJpbmcgfSkuYmFzZVBhdGggfHwgJyc7XG4gICAgaWYgKHZhdWx0QmFzZVBhdGgpIHtcbiAgICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRWYXVsdEJhc2VQYXRoKHZhdWx0QmFzZVBhdGgpO1xuICAgIH1cbiAgICAvLyBcdTZDRThcdTUxNjUgVmF1bHQgQWRhcHRlclx1RkYwQ1x1NzUyOFx1NEU4RSBWYXVsdCBBUEkgXHU2NkZGXHU0RUUzIGZzIFx1OEZEQlx1ODg0Q1x1NjU4N1x1NEVGNlx1NjI2Qlx1NjNDRi9cdTlBOENcdThCQzFcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0VmF1bHRBZGFwdGVyKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIpO1xuICAgIC8vIFx1NEYyMFx1OTAxMlx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFxuICAgIGlmICh0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCkge1xuICAgICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldE5vaXNlUGF0aCh0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCk7XG4gICAgfVxuICAgIC8vIFx1NEYyMFx1OTAxMiBPYnNpZGlhbiBcdTkxNERcdTdGNkVcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhcdTY1MkZcdTYzMDFcdTc1MjhcdTYyMzdcdTgxRUFcdTVCOUFcdTRFNDkgLm9ic2lkaWFuIFx1NTQwRFx1NzlGMFx1RkYwOVxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRDb25maWdEaXIodGhpcy5hcHAudmF1bHQuY29uZmlnRGlyKTtcblxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5hdHRhY2godGhpcy5pZnJhbWUpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKHRoaXMuaWZyYW1lKTtcblxuICAgIC8vIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcbiAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5vbignY3NzLWNoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2U/Lm9uVGhlbWVDaGFuZ2VkKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1OEY2RVx1OEJFMiBpbnRlcnZhbFxuICAgIGlmICh0aGlzLl9jaGVja0ludGVydmFsICE9PSBudWxsKSB7XG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLl9jaGVja0ludGVydmFsKTtcbiAgICAgIHRoaXMuX2NoZWNrSW50ZXJ2YWwgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1Njg2NVx1NjNBNVx1NjcwRFx1NTJBMVxuICAgIHRoaXMuYnJpZGdlU2VydmljZT8uZGV0YWNoKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzQlx1OTg5OFx1NzZEMVx1NTQyQ1xuICAgIGlmICh0aGlzLmNzc0NoYW5nZVJlZikge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9mZnJlZih0aGlzLmNzc0NoYW5nZVJlZik7XG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy50aGVtZUJyaWRnZT8uZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgaWZyYW1lIGVycm9yIFx1NzZEMVx1NTQyQ1x1NTY2OFxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcikge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG4gICAgICB0aGlzLmlmcmFtZUVycm9ySGFuZGxlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU5NTJFXHU3NkQ4XHU4RjZDXHU1M0QxXHU1NjY4XG4gICAgaWYgKHRoaXMua2V5ZG93bkZvcndhcmRlcikge1xuICAgICAgYWN0aXZlRG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bkZvcndhcmRlciwgdHJ1ZSk7XG4gICAgICB0aGlzLmtleWRvd25Gb3J3YXJkZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNiBpZnJhbWVcbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTJEXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IC5qcyBcdTY1ODdcdTRFRjZcdUZGMDhcdTkwMUFcdThGQzcgVmF1bHQgQVBJXHVGRjBDXHU0RTBEXHU3RUNGXHU4RkM3IGZzXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgX3NjYW5DdXN0b21UaGVtZXMoKTogUHJvbWlzZTxBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgdGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdGhlbWVEaXJOYW1lID0gdGhpcy5zZXR0aW5ncy50aGVtZVBhdGggfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG5cbiAgICAgIGxldCB0aGVtZURpckZpbGVzOiBzdHJpbmdbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW1lRGlyRmlsZXMgPSAoYXdhaXQgYWRhcHRlci5saXN0KHRoZW1lRGlyTmFtZSkpLmZpbGVzO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiB0aGVtZXM7IC8vIFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1NjIxNlx1NEUwRFx1NTNFRlx1OEJGQlxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoZW1lRGlyRmlsZXMpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5lbmRzV2l0aCgnLmpzJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGAke3RoZW1lRGlyTmFtZX0vJHtlbnRyeX1gO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvZGU6IHN0cmluZyA9IGF3YWl0IGFkYXB0ZXIucmVhZChmaWxlUGF0aCk7XG4gICAgICAgICAgLy8gXHU1RkVCXHU5MDFGXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1MzA1XHU1NDJCXHU1RkM1XHU5NzAwXHU3Njg0IF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcbiAgICAgICAgICBpZiAoIWNvZGUuaW5jbHVkZXMoJ19fYmFtYm9vX3RoZW1lXycpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTdGM0FcdTVDMTEgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDN2ApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoZW1lcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IGVudHJ5LnJlcGxhY2UoL1xcLmpzJC8sICcnKSxcbiAgICAgICAgICAgIGNvZGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICAgICAgY29uc3QgbXNnID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtCYW1ib29SZXZpZXddIFx1OEJGQlx1NTNENlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTU5MzFcdThEMjU6YCwgbXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhlbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgW0JhbWJvb1Jldmlld10gXHU1M0QxXHU3M0IwICR7dGhlbWVzLmxlbmd0aH0gXHU0RTJBXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4OmAsIHRoZW1lcy5tYXAodCA9PiB0Lm5hbWUpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IG1zZyA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1tCYW1ib29SZXZpZXddIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjVGNlx1NTFGQVx1OTUxOTonLCBtc2cpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGVtZXM7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIG5vcm1hbGl6ZVBhdGgsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgSW1wb3J0VmFsaWRhdG9yIH0gZnJvbSAnLi9JbXBvcnRWYWxpZGF0b3InO1xuaW1wb3J0IHR5cGUge1xuICBEYXlEYXRhLFxuICBHb2FsSXRlbSxcbiAgQXBwU2V0dGluZ3MsXG4gIFB1cmNoYXNlSGlzdG9yeSxcbiAgSW5jb21lSGlzdG9yeSxcbiAgRXhwb3J0U2hhcGUsXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG4vKipcbiAqIFZhdWx0U3RvcmFnZSAtIFx1NUMwMVx1ODhDNSBPYnNpZGlhbiBWYXVsdCBhZGFwdGVyIFx1NzY4NFx1NjU4N1x1NEVGNlx1NjRDRFx1NEY1Q1xuICpcbiAqIFZhdWx0IFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NDpcbiAqICAge2Jhc2VQYXRofS9cbiAqICAgICBkYXRhLyAgICAgICAgICAtPiBcdTZCQ0ZcdTY1RTUgSlNPTiBcdTY1NzBcdTYzNkVcbiAqICAgICBnb2Fscy5qc29uICAgICAtPiBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDdcbiAqICAgICBzZXR0aW5ncy5qc29uICAtPiBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkVcbiAqICAgICB0aGVtZXMvICAgICAgICAtPiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXBvcnRzLyAgICAgICAtPiBcdTYyQTVcdTU0NEEgKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXZpZXdzLyAgICAgICAtPiBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuZXhwb3J0IGNsYXNzIFZhdWx0U3RvcmFnZSB7XG4gIHByaXZhdGUgYXBwOiBBcHA7XG4gIHByaXZhdGUgYmFzZVBhdGg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgYmFzZVBhdGggPSAnYmFtYm9vLXJldmlldycpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLmJhc2VQYXRoID0gbm9ybWFsaXplUGF0aChiYXNlUGF0aCk7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4ICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlRGlyKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vJHtkaXJ9YCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTU3RkFcdTc4NDBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODRcdTVCNThcdTU3MjggKi9cbiAgYXN5bmMgZW5zdXJlU3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2Rpcih0aGlzLmJhc2VQYXRoKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTM5Rlx1NUI1MFx1NjVCOVx1NUYwRlx1NTE5OVx1NTE2NSB2YXVsdCBcdTY1ODdcdTRFRjZcdUZGMDhcdTY2RkZcdTRFRTMgYWRhcHRlci53cml0ZVx1RkYwOVx1MzAwMlxuICAgKiAtIFx1NjU4N1x1NEVGNlx1NURGMlx1NTcyOCB2YXVsdCBcdTdGMTNcdTVCNTggXHUyMTkyIHZhdWx0LnByb2Nlc3NcdUZGMDhcdTUzOUZcdTVCNTBcdTY2RjRcdTY1QjBcdUZGMENcdTkwN0ZcdTUxNERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcdUZGMDlcbiAgICogLSBcdTY1QjBcdTY1ODdcdTRFRjYgXHUyMTkyIHZhdWx0LmNyZWF0ZVx1RkYwOFx1NTQwQ1x1NjVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFx1NTQ4QyBPYnNpZGlhbiBcdTdGMTNcdTVCNThcdUZGMDlcbiAgICogLSBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDhcdTc4QzFcdTc2RDhcdTY3MDlcdTRGNDZcdTdGMTNcdTVCNThcdTY1RTBcdUZGMDlcdTIxOTIgYWRhcHRlci5yZW1vdmUgKyB2YXVsdC5jcmVhdGVcdUZGMDhcdThGQzFcdTc5RkJcdThGREJcdTdGMTNcdTVCNThcdUZGMDlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdmF1bHRXcml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vcm1hbGl6ZWQpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsICgpID0+IGNvbnRlbnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudFBhdGggPSBub3JtYWxpemVkLnN1YnN0cmluZygwLCBub3JtYWxpemVkLmxhc3RJbmRleE9mKCcvJykpO1xuICAgIGlmIChwYXJlbnRQYXRoICYmICEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGFyZW50UGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhcmVudFBhdGgpO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhub3JtYWxpemVkKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUobm9ybWFsaXplZCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKG5vcm1hbGl6ZWQsIGNvbnRlbnQpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTZCQ0ZcdTY1RTVcdTY1NzBcdTYzNkUgKGRheXMpIC0tLS1cblxuICBwcml2YXRlIGRheVBhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhLyR7ZGF0ZUtleX0uanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8RGF5RGF0YSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBEYXlEYXRhO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHVGRjBDXHU1QzA2XHU4REYzXHU4RkM3OiAke3BhdGh9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxEYXlzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgRGF5RGF0YT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgY29uc3QgcmVhZHMgPSBmaWxlcy5maWxlc1xuICAgICAgLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoJy5qc29uJykpXG4gICAgICAubWFwKGFzeW5jIChmaWxlKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoIWRhdGVLZXkpIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XG4gICAgICAgICAgZGF5c1tkYXRlS2V5XSA9IEpTT04ucGFyc2UoY29udGVudCkgYXMgRGF5RGF0YTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHBhcnNlIGRheSBmaWxlOiAke2ZpbGV9YCwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuICAgIHJldHVybiBkYXlzO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NjVFNVx1NjcxRiBrZXlcdUZGMDhcdTYzMDlcdTY1RTVcdTY3MUZcdTk2NERcdTVFOEZcdUZGMENcdTY3MDBcdTY1QjBcdTU3MjhcdTUyNERcdUZGMDkgKi9cbiAgYXN5bmMgZ2V0RGF5S2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkga2V5cy5wdXNoKGRhdGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBrZXlzLnNvcnQoKS5yZXZlcnNlKCk7IC8vIFx1OTY0RFx1NUU4Rlx1RkYxQVx1NjcwMFx1NjVCMFx1NjVFNVx1NjcxRlx1NTcyOFx1NTI0RFxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIwNlx1OTg3NVx1NTJBMFx1OEY3RFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVxuICAgKiBAcGFyYW0gcGFnZSBcdTk4NzVcdTc4MDFcdUZGMDhcdTRFQ0UgMCBcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICogQHBhcmFtIHBhZ2VTaXplIFx1NkJDRlx1OTg3NVx1NjU3MFx1OTFDRlxuICAgKiBAcmV0dXJucyB7IGRheXMsIHRvdGFsLCBwYWdlLCBwYWdlU2l6ZSwgaGFzTW9yZSB9XG4gICAqL1xuICBhc3luYyBnZXREYXlzUGFnaW5hdGVkKHBhZ2UgPSAwLCBwYWdlU2l6ZSA9IDMwKTogUHJvbWlzZTx7XG4gICAgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAga2V5czogc3RyaW5nW107XG4gICAgdG90YWw6IG51bWJlcjtcbiAgICBwYWdlOiBudW1iZXI7XG4gICAgcGFnZVNpemU6IG51bWJlcjtcbiAgICBoYXNNb3JlOiBib29sZWFuO1xuICB9PiB7XG4gICAgY29uc3QgYWxsS2V5cyA9IGF3YWl0IHRoaXMuZ2V0RGF5S2V5cygpO1xuICAgIGNvbnN0IHRvdGFsID0gYWxsS2V5cy5sZW5ndGg7XG4gICAgY29uc3Qgc3RhcnQgPSBwYWdlICogcGFnZVNpemU7XG4gICAgY29uc3QgcGFnZUtleXMgPSBhbGxLZXlzLnNsaWNlKHN0YXJ0LCBzdGFydCArIHBhZ2VTaXplKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgY29uc3QgcmVhZHMgPSBwYWdlS2V5cy5tYXAoYXN5bmMgKGRhdGVLZXkpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldERheShkYXRlS2V5KTtcbiAgICAgICAgaWYgKGRhdGEpIGRheXNbZGF0ZUtleV0gPSBkYXRhO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBsb2FkIGRheTogJHtkYXRlS2V5fWAsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlYWRzKTtcblxuICAgIHJldHVybiB7XG4gICAgICBkYXlzLFxuICAgICAga2V5czogcGFnZUtleXMsXG4gICAgICB0b3RhbCxcbiAgICAgIHBhZ2UsXG4gICAgICBwYWdlU2l6ZSxcbiAgICAgIGhhc01vcmU6IHN0YXJ0ICsgcGFnZUtleXMubGVuZ3RoIDwgdG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHB1dERheShkYXlEYXRhOiBEYXlEYXRhKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRlS2V5ID0gZGF5RGF0YS5kYXRlO1xuICAgIGlmICghZGF0ZUtleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXlEYXRhIG11c3QgaGF2ZSBhIGRhdGUgZmllbGQnKTtcbiAgICB9XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF5RGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlRGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwNyAoZ29hbHMpIC0tLS1cblxuICBwcml2YXRlIGdvYWxzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2dvYWxzLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEdvYWxzKCk6IFByb21pc2U8R29hbEl0ZW1bXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgR29hbEl0ZW1bXTtcbiAgfVxuXG4gIGFzeW5jIHB1dEdvYWxzKGdvYWxzOiBHb2FsSXRlbVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGdvYWxzLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1OEJCRVx1N0Y2RSAoc2V0dGluZ3MpIC0tLS1cblxuICBwcml2YXRlIHNldHRpbmdzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3NldHRpbmdzLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFNldHRpbmcoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IHRoaXMuZ2V0QWxsU2V0dGluZ3MoKTtcbiAgICByZXR1cm4gc2V0dGluZ3Nba2V5XSA/PyBudWxsO1xuICB9XG5cbiAgYXN5bmMgcHV0U2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aCh0aGlzLnNldHRpbmdzUGF0aCgpKTtcbiAgICBjb25zdCBhYnN0cmFjdCA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKTtcblxuICAgIGlmIChhYnN0cmFjdCBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAvLyB2YXVsdC5wcm9jZXNzIFx1NTM5Rlx1NUI1MCByZWFkLW1vZGlmeS13cml0ZVx1RkYwQ1x1Njc1Q1x1N0VERFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVxuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0gSlNPTi5wYXJzZShkYXRhKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgc2V0dGluZ3Nba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeSh7IFtrZXldOiB2YWx1ZSB9LCBudWxsLCAyKSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsU2V0dGluZ3MoKTogUHJvbWlzZTxBcHBTZXR0aW5ncz4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgQXBwU2V0dGluZ3M7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8UHVyY2hhc2VIaXN0b3J5IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgUHVyY2hhc2VIaXN0b3J5O1xuICB9XG5cbiAgYXN5bmMgcHV0UHVyY2hhc2VIaXN0b3J5KGRhdGE6IFB1cmNoYXNlSGlzdG9yeSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTY1MzZcdTUxNjVcdTUzODZcdTUzRjIgKGluY29tZS1oaXN0b3J5Lmpzb24pIC0tLS1cblxuICBwcml2YXRlIGluY29tZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vaW5jb21lLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0SW5jb21lSGlzdG9yeSgpOiBQcm9taXNlPEluY29tZUhpc3RvcnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgSW5jb21lSGlzdG9yeTtcbiAgfVxuXG4gIGFzeW5jIHB1dEluY29tZUhpc3RvcnkoZGF0YTogSW5jb21lSGlzdG9yeSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU1QkZDXHU1MUZBL1x1NUJGQ1x1NTE2NSAtLS0tXG5cbiAgYXN5bmMgZXhwb3J0QWxsRGF0YSgpOiBQcm9taXNlPEV4cG9ydFNoYXBlPiB7XG4gICAgY29uc3QgW2RheXMsIGdvYWxzLCBzZXR0aW5ncywgcHVyY2hhc2VIaXN0b3J5LCBpbmNvbWVIaXN0b3J5XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuZ2V0QWxsRGF5cygpLFxuICAgICAgdGhpcy5nZXRHb2FscygpLFxuICAgICAgdGhpcy5nZXRBbGxTZXR0aW5ncygpLFxuICAgICAgdGhpcy5nZXRQdXJjaGFzZUhpc3RvcnkoKSxcbiAgICAgIHRoaXMuZ2V0SW5jb21lSGlzdG9yeSgpLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICczLjAnLFxuICAgICAgZXhwb3J0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgc3RvcmFnZVR5cGU6ICd2YXVsdCcsXG4gICAgICBkYXlzLFxuICAgICAgZ29hbHMsXG4gICAgICBzZXR0aW5ncyxcbiAgICAgIHB1cmNoYXNlSGlzdG9yeSxcbiAgICAgIGluY29tZUhpc3RvcnksXG4gICAgICB0aGVtZXM6IFtdLFxuICAgICAgcmVwb3J0czogW10sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGltcG9ydERhdGEoZGF0YTogdW5rbm93biwgb3B0aW9uczogeyBzdHJhdGVneT86ICdvdmVyd3JpdGUnIHwgJ21lcmdlJyB9ID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICAgIGNvbnN0IHN0cmF0ZWd5ID0gb3B0aW9ucy5zdHJhdGVneSA/PyAnb3ZlcndyaXRlJztcblxuICAgIC8vIFAyXHVGRjFBXHU1QkZDXHU1MTY1XHU1MjREXHU2ODIxXHU5QThDICsgXHU1QjU3XHU2QkI1XHU4ODY1XHU5RjUwXHVGRjFCXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHU1NzI4XHU2QjY0XHU4OEFCXHU2MkQyXHU3RUREXHVGRjBDXHU0RTBEXHU2QzYxXHU2N0QzIFZhdWx0XG4gICAgY29uc3QgcmVjb3JkID0gSW1wb3J0VmFsaWRhdG9yLnZhbGlkYXRlKGRhdGEpO1xuXG4gICAgaWYgKHJlY29yZC5kYXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFx1OTYzMlx1NUZBMVx1RkYxQWRheXMgXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU3QTdBXHU1QkY5XHU4QzYxXHU4ODY4XHU3OTNBXHU2RTA1XHU3QTdBXHU1MTY4XHU5MEU4XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjA4XHU0RUM1IG92ZXJ3cml0ZSBcdThCRURcdTRFNDlcdTRFMEJcdTUxNDFcdThCQjhcdUZGMDlcbiAgICAgIGNvbnN0IGRheXMgPSAocmVjb3JkLmRheXMgJiYgdHlwZW9mIHJlY29yZC5kYXlzID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShyZWNvcmQuZGF5cykpXG4gICAgICAgID8gcmVjb3JkLmRheXNcbiAgICAgICAgOiB7fTtcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ292ZXJ3cml0ZScpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jbGVhckFsbERheXMoKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgZGF5IG9mIE9iamVjdC52YWx1ZXMoZGF5cykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXREYXkoZGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLmdvYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGluY29taW5nOiBHb2FsSXRlbVtdID0gQXJyYXkuaXNBcnJheShyZWNvcmQuZ29hbHMpID8gcmVjb3JkLmdvYWxzIDogW107XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdtZXJnZScpIHtcbiAgICAgICAgLy8gXHU1NDA4XHU1RTc2XHVGRjFBXHU0RkREXHU3NTU5XHU3M0IwXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU1QkZDXHU1MTY1XHU3NkVFXHU2ODA3XHU2MzA5IGlkIFx1ODk4Nlx1NzZENlx1RkYxQlx1N0E3QVx1NjU3MFx1N0VDNFx1NEUwRFx1ODlFNlx1NTNEMVx1NkUwNVx1N0E3QVxuICAgICAgICBjb25zdCBleGlzdGluZyA9IChhd2FpdCB0aGlzLmdldEdvYWxzKCkpIHx8IFtdO1xuICAgICAgICBjb25zdCBtZXJnZWQgPSBuZXcgTWFwKGV4aXN0aW5nLm1hcCgoZykgPT4gW2cuaWQsIGddKSk7XG4gICAgICAgIGZvciAoY29uc3QgZ29hbCBvZiBpbmNvbWluZykge1xuICAgICAgICAgIGlmIChnb2FsICYmIGdvYWwuaWQpIG1lcmdlZC5zZXQoZ29hbC5pZCwgZ29hbCk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhBcnJheS5mcm9tKG1lcmdlZC52YWx1ZXMoKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gb3ZlcndyaXRlXHVGRjFBXHU2NTc0XHU0RjUzXHU2NkZGXHU2MzYyXHVGRjA4XHU3QTdBXHU2NTcwXHU3RUM0ID0gXHU2RTA1XHU3QTdBXHVGRjBDXHU3QjI2XHU1NDA4XHU5ODg0XHU2NzFGXHU4QkVEXHU0RTQ5XHVGRjA5XG4gICAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoaW5jb21pbmcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWNvcmQuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJiByZWNvcmQuc2V0dGluZ3MgJiYgdHlwZW9mIHJlY29yZC5zZXR0aW5ncyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IGluY29taW5nID0gcmVjb3JkLnNldHRpbmdzO1xuICAgICAgbGV0IHRvV3JpdGU6IEFwcFNldHRpbmdzO1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnbWVyZ2UnKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKGF3YWl0IHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSkgfHwge307XG4gICAgICAgIHRvV3JpdGUgPSB7IC4uLmV4aXN0aW5nLCAuLi5pbmNvbWluZyB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9Xcml0ZSA9IGluY29taW5nO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHRoaXMuc2V0dGluZ3NQYXRoKCksIEpTT04uc3RyaW5naWZ5KHRvV3JpdGUsIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dFB1cmNoYXNlSGlzdG9yeShyZWNvcmQucHVyY2hhc2VIaXN0b3J5KTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5pbmNvbWVIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0SW5jb21lSGlzdG9yeShyZWNvcmQuaW5jb21lSGlzdG9yeSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NEVDNVx1NkUwNVx1N0E3QVx1NjI0MFx1NjcwOVx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwOG92ZXJ3cml0ZSBcdTVCRkNcdTUxNjUgZGF5cyBcdTUyNERcdThDMDNcdTc1MjhcdUZGMENcdTRFMERcdTVGNzFcdTU0Q0QgZ29hbHMvc2V0dGluZ3NcdUZGMDkgKi9cbiAgYXN5bmMgY2xlYXJBbGxEYXlzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMoZGF0YURpcikpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIoZGF0YURpciwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gIH1cblxuICAvKiogXHU0RUM1XHU2RTA1XHU3QTdBXHU4QkJFXHU3RjZFXHU2NTg3XHU0RUY2XHVGRjA4b3ZlcndyaXRlIFx1NUJGQ1x1NTE2NSBzZXR0aW5ncyBcdTUyNERcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgYXN5bmMgY2xlYXJBbGxTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcih0aGlzLmJhc2VQYXRoLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgfVxuXG4gIC8vIC0tLS0gTWFya2Rvd24gXHU2NDU4XHU4OTgxIC0tLS1cblxuICBwcml2YXRlIHJldmlld1BhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9yZXZpZXdzLyR7ZGF0ZUtleX0ubWRgKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nLCBtYXJrZG93bjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBtYXJrZG93bik7XG4gIH1cblxuICBhc3luYyBkZWxldGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBJbXBvcnRWYWxpZGF0b3IgLSBcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTc2ODRcdTY4MjFcdTlBOENcdTRFMEVcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdUZGMDhcdTVCQkZcdTRFM0JcdTRGQTdcdUZGMENcdTk2RjZcdTRGOURcdThENTZcdUZGMDlcbiAqXG4gKiBcdTc1MjhcdTkwMTRcdUZGMUFcdTU3MjggVmF1bHRTdG9yYWdlLmltcG9ydERhdGEgXHU4NDNEXHU3NkQ4XHU1MjREXHU2MkU2XHU2MjJBXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHUzMDAxXHU4ODY1XHU5RjUwXHU3RjNBXHU1OTMxXHU1QjU3XHU2QkI1XHVGRjBDXG4gKiBcdTkwN0ZcdTUxNERcdTUzNEFcdTYyMkEvXHU5NzVFXHU2Q0Q1XHU2NTcwXHU2MzZFXHU2QzYxXHU2N0QzIFZhdWx0XHUzMDAyXG4gKlxuICogXHU4QkJFXHU4QkExXHU1MzlGXHU1MjE5XHVGRjFBXG4gKiAgLSBcdTRFQzVcdTUwNUFcIlx1N0VEM1x1Njc4NFx1NUM0Mlx1OTc2Mlx1NzY4NFx1NUI4OVx1NTE2OFx1NTE1Q1x1NUU5NVwiXHVGRjBDXHU0RTBEXHU5MUNEXHU1MTk5XHU0RTFBXHU1MkExXHU1QjU3XHU2QkI1XHVGRjA4XHU1OTgyIG1ldHJpY3MgXHU3Njg0XHU1MTc3XHU0RjUzXHU2NTcwXHU1MDNDXHVGRjA5XHUzMDAyXG4gKiAgLSBcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdTRGMThcdTUxNDhcdTc1MjhcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTgxRUFcdThFQUJcdTc2ODQga2V5IC8gXHU1MTg1XHU1QkI5XHVGRjBDXHU3RjNBXHU1OTMxXHU2NUY2XHU2MjREXHU3NTI4XHU1Qjg5XHU1MTY4XHU5RUQ4XHU4QkE0XHU1MDNDXHUzMDAyXG4gKiAgLSBcdTRFRkJcdTRGNTVcdTY1RTBcdTZDRDVcdTRGRUVcdTU5MERcdTc2ODRcdTdFRDNcdTY3ODRcdTYwMjdcdTYzNUZcdTU3NEZcdTkwRkRcdTYyOUIgSW1wb3J0VmFsaWRhdGlvbkVycm9yXHVGRjBDXHU3NTMxXHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU3OTNBXHU3NTI4XHU2MjM3XHUzMDAyXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEYXlEYXRhLFxuICBHb2FsSXRlbSxcbiAgQXBwU2V0dGluZ3MsXG4gIFB1cmNoYXNlSGlzdG9yeSxcbiAgSW5jb21lSGlzdG9yeSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdJbXBvcnRWYWxpZGF0aW9uRXJyb3InO1xuICB9XG59XG5cbmNvbnN0IEtOT1dOX0ZJRUxEUyA9IFsnZGF5cycsICdnb2FscycsICdzZXR0aW5ncycsICdwdXJjaGFzZUhpc3RvcnknLCAnaW5jb21lSGlzdG9yeSddIGFzIGNvbnN0O1xuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlZEltcG9ydCB7XG4gIGRheXM/OiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgZ29hbHM/OiBHb2FsSXRlbVtdO1xuICBzZXR0aW5ncz86IEFwcFNldHRpbmdzO1xuICBwdXJjaGFzZUhpc3Rvcnk/OiBQdXJjaGFzZUhpc3Rvcnk7XG4gIGluY29tZUhpc3Rvcnk/OiBJbmNvbWVIaXN0b3J5O1xufVxuXG5leHBvcnQgY29uc3QgSW1wb3J0VmFsaWRhdG9yID0ge1xuICAvKipcbiAgICogXHU2ODIxXHU5QThDXHU1RTc2XHU4ODY1XHU5RjUwXHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHUzMDAyXG4gICAqIEByZXR1cm5zIFx1ODg2NVx1OUY1MFx1NTQwRVx1NzY4NFx1NUU3Mlx1NTFDMFx1NjU3MFx1NjM2RVx1RkYwOFx1N0VEM1x1Njc4NFx1NEUwRVx1OEY5M1x1NTE2NVx1NEUwMFx1ODFGNFx1RkYwQ1x1NEY0Nlx1NUI1N1x1NkJCNVx1NUI4Q1x1NjU3NFx1RkYwOVxuICAgKiBAdGhyb3dzIEltcG9ydFZhbGlkYXRpb25FcnJvciBcdTVGNTNcdTdFRDNcdTY3ODRcdTYzNUZcdTU3NEZcdTY1RTBcdTZDRDVcdTRGRUVcdTU5MERcdTY1RjZcbiAgICovXG4gIHZhbGlkYXRlKGRhdGE6IHVua25vd24pOiBWYWxpZGF0ZWRJbXBvcnQge1xuICAgIGlmICghZGF0YSB8fCB0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgdGhyb3cgbmV3IEltcG9ydFZhbGlkYXRpb25FcnJvcignXHU1OTA3XHU0RUZEXHU2NTg3XHU0RUY2XHU2ODNDXHU1RjBGXHU2NUUwXHU2NTQ4XHVGRjFBXHU2ODM5XHU4MjgyXHU3MEI5XHU1RkM1XHU5ODdCXHU2NjJGIEpTT04gXHU1QkY5XHU4QzYxJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb3JkID0gZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgIC8vIFx1NjM1Rlx1NTc0Rlx1NjU4N1x1NEVGNlx1NjJEMlx1N0VERFx1RkYxQVx1NkNBMVx1NjcwOVx1NEVGQlx1NEY1NVx1NURGMlx1NzdFNVx1NUI1N1x1NkJCNSBcdTIxOTIgXHU4OUM2XHU0RTNBXHU2MzVGXHU1NzRGL1x1NjVFMFx1NTE3M1x1NjU4N1x1NEVGNlxuICAgIGNvbnN0IGhhc0tub3duRmllbGQgPSBLTk9XTl9GSUVMRFMuc29tZSgoZikgPT4gcmVjb3JkW2ZdICE9PSB1bmRlZmluZWQpO1xuICAgIGlmICghaGFzS25vd25GaWVsZCkge1xuICAgICAgdGhyb3cgbmV3IEltcG9ydFZhbGlkYXRpb25FcnJvcihcbiAgICAgICAgJ1x1NTkwN1x1NEVGRFx1NjU4N1x1NEVGNlx1NjVFMFx1NjU0OFx1RkYxQVx1NjcyQVx1NjI3RVx1NTIzMFx1NEVGQlx1NEY1NVx1NTNFRlx1OEJDNlx1NTIyQlx1NzY4NFx1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNVx1RkYwOGRheXMgLyBnb2FscyAvIHNldHRpbmdzIC8gcHVyY2hhc2VIaXN0b3J5IC8gaW5jb21lSGlzdG9yeVx1RkYwOSdcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0OiBWYWxpZGF0ZWRJbXBvcnQgPSB7fTtcblxuICAgIGlmIChyZWNvcmQuZGF5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuZGF5cyA9IEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVEYXlzKHJlY29yZC5kYXlzKTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5nb2FscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuZ29hbHMgPSBJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplR29hbHMocmVjb3JkLmdvYWxzKTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuc2V0dGluZ3MgPSBJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplU2V0dGluZ3MocmVjb3JkLnNldHRpbmdzKTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5wdXJjaGFzZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LnB1cmNoYXNlSGlzdG9yeSA9IHJlY29yZC5wdXJjaGFzZUhpc3RvcnkgYXMgUHVyY2hhc2VIaXN0b3J5O1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmluY29tZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmluY29tZUhpc3RvcnkgPSByZWNvcmQuaW5jb21lSGlzdG9yeSBhcyBJbmNvbWVIaXN0b3J5O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBkYXlzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1OTc1RVx1NUJGOVx1OEM2MVx1RkYwOFx1NTk4Mlx1NjU3MFx1N0VDNC9cdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDlcdTIxOTIgXHU4OUM2XHU0RTNBXHU2NUUwXHU2NUU1XHU2NTcwXHU2MzZFXHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU1QkY5XHU4QzYxXHVGRjA4XHU0RTBEXHU2QzYxXHU2N0QzIFZhdWx0XHVGRjA5XG4gICAqICAtIFx1NkJDRlx1NEUyQSBkYXkgXHU3RjNBIGRhdGUgXHU2NUY2XHU3NTI4XHU1MTc2IGtleSBcdTg4NjVcdTlGNTBcbiAgICogIC0gXHU2QkNGXHU0RTJBIGRheSBcdTdGM0EgbWV0cmljcy90aW1lbGluZS9nb2FscyBcdTY1RjZcdTg4NjVcdTdBN0FcdTdFRDNcdTY3ODRcbiAgICovXG4gIG5vcm1hbGl6ZURheXMoZGF5czogdW5rbm93bik6IFJlY29yZDxzdHJpbmcsIERheURhdGE+IHtcbiAgICBpZiAoIWRheXMgfHwgdHlwZW9mIGRheXMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF5cykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3QgcmF3ID0gZGF5cyBhcyBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICBjb25zdCBvdXQ6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyYXcpKSB7XG4gICAgICBjb25zdCBkYXkgPSByYXdba2V5XTtcbiAgICAgIGlmICghZGF5IHx8IHR5cGVvZiBkYXkgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF5KSkge1xuICAgICAgICBjb250aW51ZTsgLy8gXHU4REYzXHU4RkM3XHU5NzVFXHU1QkY5XHU4QzYxXHU2NzYxXHU3NkVFXG4gICAgICB9XG4gICAgICBjb25zdCBjbGVhbjogRGF5RGF0YSA9IHsgLi4uZGF5IH07XG4gICAgICBpZiAoIWNsZWFuLmRhdGUpIGNsZWFuLmRhdGUgPSBrZXk7IC8vIFx1NzUyOCBrZXkgXHU4ODY1IGRhdGVcbiAgICAgIGlmICghY2xlYW4ubWV0cmljcyB8fCB0eXBlb2YgY2xlYW4ubWV0cmljcyAhPT0gJ29iamVjdCcpIGNsZWFuLm1ldHJpY3MgPSB7fTtcbiAgICAgIGlmICghY2xlYW4udGltZWxpbmUgfHwgIUFycmF5LmlzQXJyYXkoY2xlYW4udGltZWxpbmUpKSBjbGVhbi50aW1lbGluZSA9IFtdO1xuICAgICAgaWYgKCFjbGVhbi5nb2FscyB8fCAhQXJyYXkuaXNBcnJheShjbGVhbi5nb2FscykpIGNsZWFuLmdvYWxzID0gW107XG4gICAgICBvdXRba2V5XSA9IGNsZWFuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgZ29hbHNcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU2NTcwXHU3RUM0XHVGRjFCXHU5NzVFXHU2NTcwXHU3RUM0IFx1MjE5MiBcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgICogIC0gXHU2QkNGXHU0RTJBIGdvYWwgXHU3RjNBIGlkIFx1NjVGNlx1ODg2NVx1NEUwMFx1NEUyQVx1N0EzM1x1NUI5QVx1NTNFRlx1NTkwRFx1NzNCMFx1NzY4NCBpZFxuICAgKi9cbiAgbm9ybWFsaXplR29hbHMoZ29hbHM6IHVua25vd24pOiBHb2FsSXRlbVtdIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ29hbHMpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICByZXR1cm4gZ29hbHMubWFwKChyYXcpOiBHb2FsSXRlbSA9PiB7XG4gICAgICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcgYXMgR29hbEl0ZW07XG4gICAgICBjb25zdCBvYmogPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBjb25zdCBjbGVhbiA9IHsgLi4ub2JqIH0gYXMgdW5rbm93biBhcyBHb2FsSXRlbTtcbiAgICAgIGlmICghY2xlYW4uaWQpIHtcbiAgICAgICAgY2xlYW4uaWQgPSBgZ29hbF9pbXBvcnRfJHtjb3VudGVyKyt9XyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9YDtcbiAgICAgIH1cbiAgICAgIGlmIChjbGVhbi5pdGVtcyAmJiAhQXJyYXkuaXNBcnJheShjbGVhbi5pdGVtcykpIGNsZWFuLml0ZW1zID0gW107XG4gICAgICByZXR1cm4gY2xlYW47XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBzZXR0aW5nc1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTk3NUVcdTVCRjlcdThDNjEgXHUyMTkyIFx1OEZENFx1NTZERVx1N0E3QVx1NUJGOVx1OEM2MVxuICAgKi9cbiAgbm9ybWFsaXplU2V0dGluZ3Moc2V0dGluZ3M6IHVua25vd24pOiBBcHBTZXR0aW5ncyB7XG4gICAgaWYgKCFzZXR0aW5ncyB8fCB0eXBlb2Ygc2V0dGluZ3MgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc2V0dGluZ3MpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHJldHVybiBzZXR0aW5ncyBhcyBBcHBTZXR0aW5ncztcbiAgfSxcbn07XG4iLCAiLyoqXG4gKiBNYXJrZG93blN5bmMgLSBcdTVDMDYgRGF5RGF0YSBKU09OIFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NTNFRlx1OEJGQlx1NzY4NCBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuaW1wb3J0IHR5cGUgeyBEYXlEYXRhIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blN5bmMge1xuICAvKiogXHU1QzA2IERheURhdGEgXHU4RjZDXHU2MzYyXHU0RTNBIE1hcmtkb3duICovXG4gIHN0YXRpYyBnZW5lcmF0ZU1hcmtkb3duKGRhdGE6IERheURhdGEpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gZnJvbnRtYXR0ZXJcdUZGMDhcdTUyQThcdTYwMDFcdTUwM0NcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdTUzMDVcdTg4RjlcdTk2MzJcdTZCNjIgWUFNTCBcdTZDRThcdTUxNjVcdUZGMDlcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKGBkYXRlOiBcIiR7ZGF0YS5kYXRlfVwiYCk7XG4gICAgbGluZXMucHVzaChgd2Vla2RheTogXCIke2RhdGEud2Vla2RheX1cImApO1xuICAgIGxpbmVzLnB1c2goJ3R5cGU6IEJhbWJvbyBJbW1vcnRhbHMnKTtcbiAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFxuICAgIGxpbmVzLnB1c2goYCMgJHtkYXRhLmRhdGV9ICR7ZGF0YS53ZWVrZGF5fVx1NTkwRFx1NzZEOGApO1xuICAgIGxpbmVzLnB1c2goJycpO1xuXG4gICAgLy8gXHU2MzA3XHU2ODA3XG4gICAgaWYgKGRhdGEubWV0cmljcykge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2MzA3XHU2ODA3Jyk7XG4gICAgICBjb25zdCBtID0gZGF0YS5tZXRyaWNzO1xuICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAobS5maXJzdENoZWNrSW4pIHBhcnRzLnB1c2goYFx1OTk5Nlx1NkIyMVx1NjI1M1x1NTM2MTogJHttLmZpcnN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmxhc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTY3MkJcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5sYXN0Q2hlY2tJbn1gKTtcbiAgICAgIGlmIChtLmNvbXBsZXRlZFRhc2tzKSBwYXJ0cy5wdXNoKGBcdTVCOENcdTYyMTBcdTRFRkJcdTUyQTE6ICR7bS5jb21wbGV0ZWRUYXNrc31gKTtcbiAgICAgIGlmIChtLmluc3BpcmF0aW9uQ291bnQpIHBhcnRzLnB1c2goYFx1NzA3NVx1NjExRjogJHttLmluc3BpcmF0aW9uQ291bnR9YCk7XG4gICAgICBpZiAobS5hY3RpdmVUaW1lKSBwYXJ0cy5wdXNoKGBcdTZEM0JcdThEQzNcdTY1RjZcdTk1N0Y6ICR7bS5hY3RpdmVUaW1lfWApO1xuICAgICAgaWYgKG0uZW1wdHlTbG90cykgcGFydHMucHVzaChgXHU3QTdBXHU3NjdEXHU2NUY2XHU2QkI1OiAke20uZW1wdHlTbG90c31gKTtcblxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhcnRzLnNsaWNlKDAsIDIpLmpvaW4oJyB8ICcpfWApO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgfVxuXG4gICAgLy8gXHU2NUY2XHU5NUY0XHU3RUJGXG4gICAgaWYgKGRhdGEudGltZWxpbmUgJiYgZGF0YS50aW1lbGluZS5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTY1RjZcdTk1RjRcdTdFQkYnKTtcbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgZGF0YS50aW1lbGluZSkge1xuICAgICAgICBjb25zdCBpY29uID0gYmxvY2suaWNvbiA/IGAke2Jsb2NrLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2Jsb2NrLm5hbWV9ICgke2Jsb2NrLnRpbWV9KWApO1xuICAgICAgICBpZiAoYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYmxvY2suaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWxTdHIgPSBpdGVtLmV2YWwgPyBgIC0gJHtpdGVtLmV2YWx9YCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0udGltZX0gJHtpdGVtLnRhc2t9JHtldmFsU3RyfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTZcbiAgICBpZiAoZGF0YS5nb2FscyAmJiBkYXRhLmdvYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNicpO1xuICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGRhdGEuZ29hbHMpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGdvYWwuaWNvbiA/IGAke2dvYWwuaWNvbn0gYCA6ICcnO1xuICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtpY29ufSR7Z29hbC50aXRsZX1gKTtcbiAgICAgICAgaWYgKGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZ29hbC5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IGl0ZW0ucGVyY2VudCAhPT0gdW5kZWZpbmVkID8gYCAke2l0ZW0ucGVyY2VudH0lYCA6ICcnO1xuICAgICAgICAgICAgY29uc3QgZGV0YWlsID0gaXRlbS5kZXRhaWwgPyBgICgke2l0ZW0uZGV0YWlsfSlgIDogJyc7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7aXRlbS5uYW1lfSR7cGVyY2VudH0ke2RldGFpbH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgTWFya2Rvd25TeW5jIH0gZnJvbSAnLi4vc3RvcmFnZS9NYXJrZG93blN5bmMnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuaW1wb3J0IHR5cGUgeyBEYXlEYXRhLCBHb2FsSXRlbSwgUHVyY2hhc2VIaXN0b3J5LCBJbmNvbWVIaXN0b3J5IH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbi8qKlxuICogU3RvcmFnZUJyaWRnZSAtIFx1NUMwNiBzdG9yYWdlOiogXHU2RDg4XHU2MDZGXHU2NjIwXHU1QzA0XHU1MjMwIFZhdWx0U3RvcmFnZSBcdTY0Q0RcdTRGNUNcbiAqL1xuZXhwb3J0IGNsYXNzIFN0b3JhZ2VCcmlkZ2Uge1xuICBwcml2YXRlIHN0b3JhZ2U6IFZhdWx0U3RvcmFnZTtcbiAgcHJpdmF0ZSBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioc3RvcmFnZTogVmF1bHRTdG9yYWdlLCBlbmFibGVNYXJrZG93blN5bmMgPSB0cnVlKSB7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICB0aGlzLmVuYWJsZU1hcmtkb3duU3luYyA9IGVuYWJsZU1hcmtkb3duU3luYztcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZShtZXNzYWdlOiBBbnlCcmlkZ2VNZXNzYWdlKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cmVhZERheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTp3cml0ZURheSc6IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dERheShtZXNzYWdlLnBheWxvYWQuZGF0YSBhcyBEYXlEYXRhKTtcbiAgICAgICAgLy8gXHU1M0NDXHU1MTk5IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICAgICAgICBpZiAodGhpcy5lbmFibGVNYXJrZG93blN5bmMgJiYgbWVzc2FnZS5wYXlsb2FkLmRhdGEpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbWQgPSBNYXJrZG93blN5bmMuZ2VuZXJhdGVNYXJrZG93bihtZXNzYWdlLnBheWxvYWQuZGF0YSBhcyBEYXlEYXRhKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS53cml0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5LCBtZCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXJrZG93biBzeW5jIGZhaWxlZDonLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZU1hcmtkb3duUmV2aWV3KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVEYXkobWVzc2FnZS5wYXlsb2FkLmRhdGVLZXkpO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0U2V0dGluZyhtZXNzYWdlLnBheWxvYWQua2V5LCBtZXNzYWdlLnBheWxvYWQudmFsdWUpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRHb2FscyhtZXNzYWdlLnBheWxvYWQuZ29hbHMgYXMgR29hbEl0ZW1bXSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRQdXJjaGFzZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFB1cmNoYXNlSGlzdG9yeShtZXNzYWdlLnBheWxvYWQuZGF0YSBhcyBQdXJjaGFzZUhpc3RvcnkpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRJbmNvbWVIaXN0b3J5KG1lc3NhZ2UucGF5bG9hZC5kYXRhIGFzIEluY29tZUhpc3RvcnkpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheUtleXMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheUtleXMoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlzUGFnaW5hdGVkJzoge1xuICAgICAgICBjb25zdCBwYWdpbmF0ZWRQYXlsb2FkID0gbWVzc2FnZS5wYXlsb2FkIGFzIHsgcGFnZT86IG51bWJlcjsgcGFnZVNpemU/OiBudW1iZXIgfTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlzUGFnaW5hdGVkKFxuICAgICAgICAgIHBhZ2luYXRlZFBheWxvYWQucGFnZSA/PyAwLFxuICAgICAgICAgIHBhZ2luYXRlZFBheWxvYWQucGFnZVNpemUgPz8gMzBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpleHBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmV4cG9ydEFsbERhdGEoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTppbXBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmltcG9ydERhdGEobWVzc2FnZS5wYXlsb2FkLmRhdGEsIG1lc3NhZ2UucGF5bG9hZC5vcHRpb25zID8/IHt9KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpjbGVhckFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXJBbGwoKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0b3JhZ2UgbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICB9XG4gIH1cbn1cbiIsICJcbi8qKlxuICogVGhlbWVCcmlkZ2UgLSBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHVGRjBDXHU2M0E4XHU5MDAxXHU1MjMwIGlmcmFtZVxuICogICAgICAgICAgICAgICsgXHU1M0NEXHU1NDExXHVGRjFBXHU2M0E1XHU2NTM2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTUwM0NcdUZGMENcdTZDRThcdTUxNjUgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtZUJyaWRnZSB7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcGFsZXR0ZVN5bmNUaW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogXHU1QjU4XHU1MEE4XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTk1MkVcdTU0MERcdUZGMENcdTc1MjhcdTRFOEUgcmVzdG9yZURlZmF1bHRzIFx1NkUwNVx1NzQwNiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOSkVDVEVEX1ZBUlMgPSBbXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnLFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJyxcbiAgICAgICctLXRleHQtYWNjZW50JyxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeScsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScsXG4gICAgICAnLS10ZXh0LW5vcm1hbCcsXG4gICAgICAnLS10ZXh0LW11dGVkJyxcbiAgICBdO1xuXG4gICAgLyoqIFx1OTYzMlx1NjI5Nlx1N0FERVx1NjAwMVx1NjgwN1x1OEJCMFx1RkYxQXJlc3RvcmVEZWZhdWx0cyBcdTg4QUJcdThDMDNcdTc1MjhcdTU0MEVcdThCQkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTYzQlx1NkI2Mlx1NUVGNlx1OEZERlx1NTZERVx1OEMwM1x1ODk4Nlx1NTE5OSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdXBwcmVzc2VkID0gZmFsc2U7XG5cbiAgYXR0YWNoSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgfVxuXG4gIGRldGFjaElmcmFtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NjYwRVx1NjY5N1x1NzJCNlx1NjAwMVx1RkYwOFx1NEVDNVx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBwcml2YXRlIGlzRGFya01vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTcyQjZcdTYwMDEgKi9cbiAgcHVzaFRoZW1lKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgaWQ6ICd0aGVtZV9wdXNoXycgKyBEYXRlLm5vdygpLFxuICAgICAgICBwYXlsb2FkOiB7IGlzRGFyazogdGhpcy5pc0RhcmtNb2RlKCkgfSxcbiAgICAgIH0sXG4gICAgICAnKidcbiAgICApO1xuICB9XG5cbiAgLyoqIFx1NEY5Qlx1NTkxNlx1OTBFOFx1OEMwM1x1NzUyOFx1RkYxQU9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMSAqL1xuICBvblRoZW1lQ2hhbmdlZCgpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hUaGVtZSgpO1xuICB9XG5cbiAgLy8gPT09PT0gXHU1M0NDXHU1NDExXHU4QzAzXHU4MjcyID09PT09XG5cbiAgLyoqXG4gICAqIFx1OEJBMVx1N0I5NyB3ZWJhcHAgXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNiBcdTIxOTIgT2JzaWRpYW4gQ1NTIFx1NTNEOFx1OTFDRlx1NjYyMFx1NUMwNFxuICAgKiBcdTRFQzVcdTg5ODZcdTc2RDYgMyBcdTdDN0JcdTY4MzhcdTVGQzNcdTgyNzJcdUZGMDhcdTVGM0FcdThDMDMvXHU4MENDXHU2NjZGL1x1NjU4N1x1NUI1N1x1RkYwOVx1RkYwQ1x1NTE3Nlx1NEY1OVx1NzUzMSBPYnNpZGlhbiBcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTYzQThcdTdCOTdcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlT2JzaWRpYW5WYXJzKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgaCA9IE1hdGgucm91bmQoaHVlKTtcbiAgICBjb25zdCBsbyA9IE1hdGgubWF4KC0zMCwgTWF0aC5taW4oMzAsIGxpZ2h0bmVzc09mZnNldCkpO1xuXG4gICAgLy8gXHU1RjNBXHU4QzAzXHU4MjcyXG4gICAgY29uc3QgYWNjZW50UyA9IDQwO1xuICAgIGNvbnN0IGFjY2VudEwgPSBpc0RhcmsgPyA1MCA6IDQwO1xuICAgIGNvbnN0IGFjY2VudCA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TH0lKWA7XG4gICAgY29uc3QgYWNjZW50SG92ZXIgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEwgKyA1fSUpYDtcblxuICAgIC8vIFx1ODBDQ1x1NjY2Rlx1ODI3MlxuICAgIGNvbnN0IGJnUyA9IGlzRGFyayA/IDggOiAxMjtcbiAgICBjb25zdCBiZ0wgPSBpc0RhcmtcbiAgICAgID8gTWF0aC5tYXgoNSwgMTIgKyBsbyAqIDAuMylcbiAgICAgIDogTWF0aC5taW4oOTgsIDk0ICsgbG8gKiAwLjE1KTtcbiAgICBjb25zdCBiZ1ByaW1hcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7YmdMfSUpYDtcbiAgICBjb25zdCBiZ1NlY29uZGFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtpc0RhcmsgPyBiZ0wgKyAzIDogYmdMIC0gMn0lKWA7XG5cbiAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcbiAgICBjb25zdCB0ZXh0Tm9ybWFsID0gaXNEYXJrID8gYGhzbCgke2h9LCA2JSwgODglKWAgOiBgaHNsKCR7aH0sIDYlLCAxMiUpYDtcbiAgICBjb25zdCB0ZXh0TXV0ZWQgID0gaXNEYXJrID8gYGhzbCgke2h9LCA0JSwgNTUlKWAgOiBgaHNsKCR7aH0sIDQlLCA0NSUpYDtcblxuICAgIHJldHVybiB7XG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInOiBhY2NlbnRIb3ZlcixcbiAgICAgICctLXRleHQtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JzogYmdQcmltYXJ5LFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknOiBiZ1NlY29uZGFyeSxcbiAgICAgICctLXRleHQtbm9ybWFsJzogdGV4dE5vcm1hbCxcbiAgICAgICctLXRleHQtbXV0ZWQnOiB0ZXh0TXV0ZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdThDMDNcdTgyNzJcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqIDUwbXMgZGVib3VuY2VcdUZGMENcdTk2MzJcdTZCNjJcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU2RUQxXHU1NzU3XHU1RkVCXHU5MDFGXHU2MkQ2XHU2MkZEXHU0RUE3XHU3NTFGXHU5QUQ4XHU5ODkxIERPTSBcdTUxOTlcdTUxNjVcbiAgICovXG4gIGFwcGx5UGFsZXR0ZShodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYWxldHRlU3luY1RpbWVyKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpO1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gZmFsc2U7IC8vIFx1NjVCMFx1OEMwM1x1ODI3Mlx1OEJGN1x1NkM0Mlx1NTIzMFx1Njc2NSBcdTIxOTIgXHU4OUUzXHU5NjY0XHU2MjkxXHU1MjM2XG4gICAgdGhpcy5fcGFsZXR0ZVN5bmNUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCkgcmV0dXJuOyAvLyByZXN0b3JlRGVmYXVsdHMgXHU1NzI4XHU5NjMyXHU2Mjk2XHU3QTk3XHU1M0UzXHU1MTg1XHU4OEFCXHU4QzAzXHU3NTI4XG4gICAgICBjb25zdCB2YXJzID0gVGhlbWVCcmlkZ2UuY29tcHV0ZU9ic2lkaWFuVmFycyhodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZhcnMpKSB7XG4gICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLyoqIFx1NkUwNVx1OTY2NFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHVGRjBDXHU2MDYyXHU1OTBEIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OUVEOFx1OEJBNFx1NTAzQyAqL1xuICBzdGF0aWMgcmVzdG9yZURlZmF1bHRzKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBUaGVtZUJyaWRnZS5JTkpFQ1RFRF9WQVJTKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IERhdGFBZGFwdGVyIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgU3RvcmFnZUJyaWRnZSB9IGZyb20gJy4vU3RvcmFnZUJyaWRnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4vVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHR5cGUgeyBBbnlCcmlkZ2VNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZXMnO1xuaW1wb3J0IHsgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhjb25maWdEaXIgXHU1M0VGXHU5MDFBXHU4RkM3IHNldENvbmZpZ0RpciBcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbmNvbnN0IERFRkFVTFRfU0tJUF9ESVJTID0gWycudHJhc2gnLCAnLmdpdCcsICdub2RlX21vZHVsZXMnXTtcblxuLyoqXG4gKiBCcmlkZ2VTZXJ2aWNlIC0gcG9zdE1lc3NhZ2UgXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU0RTJEXHU1RkMzXG4gKlxuICogXHU3NkQxXHU1NDJDIGlmcmFtZSBcdTUzRDFcdTY3NjVcdTc2ODQgcG9zdE1lc3NhZ2VcdUZGMENcdTUyMDZcdTUzRDFcdTUyMzBcdTVCRjlcdTVFOTRcdTU5MDRcdTc0MDZcdTZBMjFcdTU3NTdcdUZGMENcbiAqIFx1NzEzNlx1NTQwRVx1NUMwNlx1N0VEM1x1Njc5Q1x1NTZERVx1NEYyMFx1N0VEOSBpZnJhbWVcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIEJyaWRnZVNlcnZpY2Uge1xuICAgIHByaXZhdGUgc3RvcmFnZUJyaWRnZTogU3RvcmFnZUJyaWRnZTtcbiAgICBwcml2YXRlIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZTtcbiAgICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKCkgPT4gUHJvbWlzZTx2b2lkPikgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBjdXN0b21UaGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgdmF1bHRBZGFwdGVyOiBEYXRhQWRhcHRlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbm9pc2VQYXRoOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIGNvbmZpZ0Rpcjogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSBleHBlY3RlZE9yaWdpbiA9ICcnO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHN0b3JhZ2VCcmlkZ2U6IFN0b3JhZ2VCcmlkZ2UsXG4gICAgICAgIHRoZW1lQnJpZGdlOiBUaGVtZUJyaWRnZSxcbiAgICAgICAgc2V0dGluZ3M/OiBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbiAgICAgICAgc2F2ZVNldHRpbmdzPzogKCkgPT4gUHJvbWlzZTx2b2lkPlxuICAgICkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VCcmlkZ2UgPSBzdG9yYWdlQnJpZGdlO1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlID0gdGhlbWVCcmlkZ2U7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncyB8fCBudWxsO1xuICAgICAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncyB8fCBudWxsO1xuICAgIH1cblxuICAvKiogXHU3RUQxXHU1QjlBIGlmcmFtZSBcdTVFNzZcdTVGMDBcdTU5Q0JcdTc2RDFcdTU0MkNcdTZEODhcdTYwNkYgKi9cbiAgYXR0YWNoKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICAvLyBcdTk2MzJcdTZCNjJcdTkxQ0RcdTU5MERcdTdFRDFcdTVCOUFcbiAgICB0aGlzLmRldGFjaCgpO1xuXG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUoaWZyYW1lKTtcblxuICAgIC8vIFx1OEJCMFx1NUY1NSBleHBlY3RlZCBvcmlnaW5cdUZGMENcdTc1MjhcdTRFOEVcdTZEODhcdTYwNkZcdTY3NjVcdTZFOTBcdTY4MjFcdTlBOENcbiAgICB0cnkge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5leHBlY3RlZE9yaWdpbiA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLm9uTWVzc2FnZShldmVudCk7XG4gICAgfTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTIxN1x1ODg2OFx1RkYwOFx1NEY5Qlx1NjNEMlx1NEVGNlx1N0FFRlx1NjI2Qlx1NjNDRlx1NTQwRVx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBzZXRDdXN0b21UaGVtZXModGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+KTogdm9pZCB7XG4gICAgdGhpcy5jdXN0b21UaGVtZXMgPSB0aGVtZXM7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjA4XHU0RjlCXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHNldFZhdWx0QmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMudmF1bHRCYXNlUGF0aCA9IGJhc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NkNFOFx1NTE2NSBPYnNpZGlhbiBWYXVsdCBcdTkwMDJcdTkxNERcdTU2NjhcdUZGMENcdTc1MjhcdTRFOEUgVmF1bHQgQVBJIFx1OERFRlx1NUY4NFx1NjRDRFx1NEY1Q1x1NjZGRlx1NEVFMyBmcyAqL1xuICBzZXRWYXVsdEFkYXB0ZXIoYWRhcHRlcjogRGF0YUFkYXB0ZXIpOiB2b2lkIHtcbiAgICB0aGlzLnZhdWx0QWRhcHRlciA9IGFkYXB0ZXI7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0ICovXG4gIHNldE5vaXNlUGF0aChub2lzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubm9pc2VQYXRoID0gbm9pc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RSBPYnNpZGlhbiBcdTkxNERcdTdGNkVcdTc2RUVcdTVGNTVcdTU0MERcdUZGMDhcdTlFRDhcdThCQTQgLm9ic2lkaWFuXHVGRjBDXHU3NTI4XHU2MjM3XHU1M0VGXHU4MUVBXHU1QjlBXHU0RTQ5XHVGRjA5ICovXG4gIHNldENvbmZpZ0RpcihkaXI6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnRGlyID0gZGlyO1xuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1NjIxNlx1NTE2OFx1NUU5M1x1NjI2Qlx1NjNDRlx1RkYwOVx1RkYwQ1x1OTAxQVx1OEZDNyBWYXVsdCBBUEkgXHU2NkZGXHU0RUUzIGZzICovXG4gIHByaXZhdGUgYXN5bmMgX3NjYW5WYXVsdEF1ZGlvRmlsZXMobWF4RGVwdGggPSA1KTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFsbG93ZWRFeHRzID0gQUxMT1dFRF9BVURJT19FWFRFTlNJT05TO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLnZhdWx0QWRhcHRlcjtcbiAgICBpZiAoIWFkYXB0ZXIpIHJldHVybiByZXN1bHRzO1xuXG4gICAgLy8gXHU2MzA3XHU1QjlBXHU0RTg2XHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1M0VBXHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RTBEXHU5MDEyXHU1RjUyXHVGRjA5XG4gICAgaWYgKHRoaXMubm9pc2VQYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsaXN0ID0gYXdhaXQgYWRhcHRlci5saXN0KHRoaXMubm9pc2VQYXRoKTtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGxpc3QuZmlsZXMpIHtcbiAgICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBmaWxlU3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChwYXRoLmpvaW4odGhpcy5ub2lzZVBhdGgsIGZpbGUpKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcGF0aC5qb2luKHRoaXMubm9pc2VQYXRoLCBmaWxlKSwgbmFtZTogZmlsZSwgc2l6ZTogZmlsZVN0YXQ/LnNpemUgPz8gMCwgZXh0IH0pO1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NjcyQVx1NjMwN1x1NUI5QVx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTE2OFx1NUU5M1x1OTAxMlx1NUY1Mlx1NjI2Qlx1NjNDRlx1RkYwOFZhdWx0IEFQSSArIFx1NkRGMVx1NUVBNlx1OTY1MFx1NTIzNlx1RkYwOVxuICAgIGNvbnN0IHNjYW5EaXIgPSBhc3luYyAocmVsYXRpdmVEaXI6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcbiAgICAgIGxldCBsaXN0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdCA9IGF3YWl0IGFkYXB0ZXIubGlzdChyZWxhdGl2ZURpcik7XG4gICAgICB9IGNhdGNoIHsgcmV0dXJuOyAvKiBza2lwIHVucmVhZGFibGUgZGlycyAqLyB9XG5cbiAgICAgIGZvciAoY29uc3QgZm9sZGVyIG9mIGxpc3QuZm9sZGVycykge1xuICAgICAgICBpZiAoZm9sZGVyLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHNraXBEaXJzID0gbmV3IFNldChbLi4uREVGQVVMVF9TS0lQX0RJUlMsIC4uLih0aGlzLmNvbmZpZ0RpciA/IFt0aGlzLmNvbmZpZ0Rpcl0gOiBbXSldKTtcbiAgICAgICAgaWYgKHNraXBEaXJzLmhhcyhmb2xkZXIpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc3ViUGF0aCA9IHJlbGF0aXZlRGlyID8gcGF0aC5qb2luKHJlbGF0aXZlRGlyLCBmb2xkZXIpIDogZm9sZGVyO1xuICAgICAgICBhd2FpdCBzY2FuRGlyKHN1YlBhdGgsIGRlcHRoICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0LmZpbGVzKSB7XG4gICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoYWxsb3dlZEV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZURpciA/IHBhdGguam9pbihyZWxhdGl2ZURpciwgZmlsZSkgOiBmaWxlO1xuICAgICAgICAgICAgY29uc3QgZmlsZVN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQocmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHJlbGF0aXZlUGF0aCwgbmFtZTogZmlsZSwgc2l6ZTogZmlsZVN0YXQ/LnNpemUgPz8gMCwgZXh0IH0pO1xuICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBhd2FpdCBzY2FuRGlyKCcnLCAwKTtcbiAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqIFx1ODlFM1x1N0VEMSBpZnJhbWVcdUZGMENcdTUwNUNcdTZCNjJcdTc2RDFcdTU0MkMgKi9cbiAgZGV0YWNoKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lc3NhZ2VIYW5kbGVyKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICAgICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMudGhlbWVCcmlkZ2UuZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1NkQ4OFx1NjA2Rlx1OERFRlx1NzUzMVx1NTkwNFx1NzQwNiAqL1xuICBwcml2YXRlIGFzeW5jIG9uTWVzc2FnZShldmVudDogTWVzc2FnZUV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbXNnID0gZXZlbnQuZGF0YSBhcyBBbnlCcmlkZ2VNZXNzYWdlO1xuICAgIGlmICghbXNnIHx8ICFtc2cudHlwZSB8fCAhbXNnLmlkKSByZXR1cm47XG5cbiAgICAvLyBcdTY4MjFcdTlBOENcdTZEODhcdTYwNkZcdTY3NjVcdTZFOTBcdUZGMUFzb3VyY2UgKyBvcmlnaW4gXHU1M0NDXHU5MUNEXHU5QThDXHU4QkMxXG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5leHBlY3RlZE9yaWdpbiAmJiBldmVudC5vcmlnaW4gIT09IHRoaXMuZXhwZWN0ZWRPcmlnaW4pIHtcbiAgICAgIGNvbnNvbGUud2FybignW0JyaWRnZVNlcnZpY2VdIElnbm9yZWQgbWVzc2FnZSBmcm9tIHVua25vd24gb3JpZ2luOicsIGV2ZW50Lm9yaWdpbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1M0VBXHU1OTA0XHU3NDA2XHU1REYyXHU3N0U1XHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXHU1MjREXHU3RjAwXG4gICAgaWYgKCFtc2cudHlwZS5zdGFydHNXaXRoKCdzdG9yYWdlOicpICYmICFtc2cudHlwZS5zdGFydHNXaXRoKCdhcHA6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2ZpbGU6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3RoZW1lOicpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXHU2RDg4XHU2MDZGXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWR5Jykge1xuICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUoKTtcbiAgICAgIC8vIFx1NjI4QVx1NjMwMVx1NEU0NVx1NTMxNlx1NzY4NCBzZWN0aW9uQ29uZmlnXHUzMDAxXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1NDhDXHU4MUVBXHU1QjlBXHU0RTQ5XHU5N0YzXHU2RTkwXHU5NjhGIHJlYWR5IFx1NTRDRFx1NUU5NFx1NTNEMVx1N0VEOSB3ZWJhcHBcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHtcbiAgICAgICAgb2s6IHRydWUsXG4gICAgICAgIHNlY3Rpb25Db25maWc6IHRoaXMuc2V0dGluZ3M/LnNlY3Rpb25Db25maWcgfHwgbnVsbCxcbiAgICAgICAgY3VzdG9tVGhlbWVzOiB0aGlzLmN1c3RvbVRoZW1lcyxcbiAgICAgICAgY3VzdG9tTm9pc2VzOiB0aGlzLnNldHRpbmdzPy5ub2lzZUl0ZW1zIHx8IFtdLFxuICAgICAgICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IHRoaXMuc2V0dGluZ3M/LnN5bmNQYWxldHRlVG9PYnNpZGlhbiB8fCBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpjbG9zZScpIHtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU2NzdGXHU1NzU3XHU5MTREXHU3RjZFXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnID0gbXNnLnBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZ3MpIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NjMwMVx1NEU0NVx1NTMxNlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zID0gQXJyYXkuaXNBcnJheShtc2cucGF5bG9hZCkgPyBtc2cucGF5bG9hZCA6IFtdO1xuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZ3MpIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NEUzQlx1OTg5OFx1NTIwN1x1NjM2Mlx1OEJGN1x1NkM0Mlx1RkYwOGlmcmFtZSBcdTIxOTIgT2JzaWRpYW5cdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6dG9nZ2xlVGhlbWUnKSB7XG4gICAgICBjb25zdCB0YXJnZXRJc0RhcmsgPSBtc2cucGF5bG9hZC5pc0RhcmsgPT09IHRydWU7ICAgICAgY29uc3QgY3VycmVudElzRGFyayA9IGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gICAgICBpZiAodGFyZ2V0SXNEYXJrICE9PSBjdXJyZW50SXNEYXJrKSB7XG4gICAgICAgIGlmICh0YXJnZXRJc0RhcmspIHtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWxpZ2h0Jyk7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd0aGVtZS1kYXJrJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1kYXJrJyk7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd0aGVtZS1saWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1OTAxQVx1NzdFNSBpZnJhbWUgXHU0RTNCXHU5ODk4XHU1REYyXHU1MjA3XHU2MzYyXG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlLCBpc0Rhcms6IHRhcmdldElzRGFyayB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdThCRjdcdTZDNDJcdUZGMDh3ZWJhcHAgXHUyMTkyIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2Mlx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3RoZW1lOnN5bmNQYWxldHRlJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3M/LnN5bmNQYWxldHRlVG9PYnNpZGlhbikge1xuICAgICAgICBjb25zdCB7IGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmsgfSA9IG1zZy5wYXlsb2FkO1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLmFwcGx5UGFsZXR0ZShodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gPT09PT0gXHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHVGRjFBXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ID09PT09XG5cbiAgICAvLyBcdTYyNkJcdTYzQ0ZcdTVFOTNcdTUxODVcdTYyNDBcdTY3MDlcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTRGOUIgd2ViYXBwIFx1NjU4N1x1NEVGNlx1OTAwOVx1NjJFOVx1NTY2OFx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpsaXN0VmF1bHRBdWRpb0ZpbGVzJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF0aGlzLnZhdWx0QmFzZVBhdGgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwQ1x1OEJGN1x1NUMxRFx1OEJENVx1OTFDRFx1NjVCMFx1NjI1M1x1NUYwMFx1OTc2Mlx1Njc3RicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIF9zY2FuVmF1bHRBdWRpb0ZpbGVzKCkgXHU1MTg1XHU5MEU4XHU1REYyXHU1RjAyXHU2QjY1XHU2OEMwXHU2N0U1XHU4REVGXHU1Rjg0XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5fc2NhblZhdWx0QXVkaW9GaWxlcygpO1xuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVzIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1x1NjI2Qlx1NjNDRlx1NUU5M1x1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNSc7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29dIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgbWVzc2FnZSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3XHU1RTkzXHU1MTg1XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUyMDE0IFx1NEY3Rlx1NzUyOCBhZGFwdGVyIFx1OUE4Q1x1OEJDMVx1NUU3Nlx1OTAxQVx1OEZDNyBnZXRGdWxsUGF0aCBcdTgzQjdcdTUzRDZcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZFZhdWx0RmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1zZy5wYXlsb2FkPy5wYXRoIHx8ICcnO1xuICAgICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgaWYgKCF0aGlzLnZhdWx0QWRhcHRlcikgdGhyb3cgbmV3IEVycm9yKCdWYXVsdCBcdTkwMDJcdTkxNERcdTU2NjhcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTYnKTtcbiAgICAgICAgLy8gXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU2OEMwXHU2N0U1XG4gICAgICAgIGlmIChyZWxhdGl2ZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyXHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIC8vIFZhdWx0IEFQSSBcdTlBOENcdThCQzFcdTY1ODdcdTRFRjZcdTVCNThcdTU3MjhcbiAgICAgICAgY29uc3QgZmlsZVN0YXQgPSBhd2FpdCB0aGlzLnZhdWx0QWRhcHRlci5zdGF0KHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIGlmICghZmlsZVN0YXQgfHwgZmlsZVN0YXQudHlwZSAhPT0gJ2ZpbGUnKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQScgKyByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBhZGFwdGVyLnN0YXQgXHU1REYyXHU5QThDXHU4QkMxXHU1QjU4XHU1NzI4XHVGRjBDYmFzZVBhdGggXHU3NTI4XHU0RThFXHU2MkZDXHU2M0E1XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU0RjlCIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XHU0RjdGXHU3NTI4XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NUU5M1x1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NCcpO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih0aGlzLnZhdWx0QmFzZVBhdGgsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2Mlx1RkYxQScgKyByZWxhdGl2ZVBhdGgpO1xuICAgICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IGZpbGVQYXRoOiBmdWxsUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShyZWxhdGl2ZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NUU5M1x1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEJGQlx1NTNENlx1NjcyQ1x1NTczMFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGNFx1NjNBNVx1NTZERVx1NEYyMFx1OERFRlx1NUY4NFx1NzUzMVx1NTI0RFx1N0FFRlx1NzUyOCBmaWxlOi8vIFx1NTJBMFx1OEY3RFx1RkYwOVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpyZWFkTG9jYWxGaWxlJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFmaWxlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcbiAgICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU2MkQyXHU3RUREXHU1MzA1XHU1NDJCXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU1QjU3XHU3QjI2XHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgIGlmIChmaWxlUGF0aC5pbmNsdWRlcygnLi4nKSkgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjInKTtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NEUwRFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjgzQ1x1NUYwRlx1RkYxQScgKyBleHQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZmlsZVBhdGgpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQScgKyBmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBmaWxlUGF0aCwgbmFtZTogcGF0aC5iYXNlbmFtZShmaWxlUGF0aCwgZXh0KSB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1QjU4XHU1MEE4XHU3QzdCXHU2RDg4XHU2MDZGXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZUJyaWRnZS5oYW5kbGUobXNnKTtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgcGF5bG9hZCB9LCAnKicpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZEVycm9yKGlkOiBzdHJpbmcsIGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IGlkLCBlcnJvciB9LCAnKicpO1xuICB9XG59XG4iLCAiLyoqIFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NUI4Q1x1NjU3NFx1NTIxN1x1ODg2OFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyA9IFtcbiAgJy5tcDMnLCAnLndhdicsICcub2dnJywgJy5mbGFjJywgJy5hYWMnLCAnLm00YScsICcud21hJywgJy53ZWJtJywgJy5vcHVzJyxcbl07XG5cbi8qKiBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MEQgXHUyMTkyIE1JTUUgXHU3QzdCXHU1NzhCICovXG5jb25zdCBBVURJT19NSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLm1wMyc6ICAnYXVkaW8vbXBlZycsXG4gICcud2F2JzogICdhdWRpby93YXYnLFxuICAnLm9nZyc6ICAnYXVkaW8vb2dnJyxcbiAgJy5mbGFjJzogJ2F1ZGlvL2ZsYWMnLFxuICAnLmFhYyc6ICAnYXVkaW8vYWFjJyxcbiAgJy5tNGEnOiAgJ2F1ZGlvL21wNCcsXG4gICcud21hJzogICdhdWRpby94LW1zLXdtYScsXG4gICcud2VibSc6ICdhdWRpby93ZWJtJyxcbiAgJy5vcHVzJzogJ2F1ZGlvL29wdXMnLFxufTtcblxuLyoqIFx1NUI4Q1x1NjU3NCBNSU1FIFx1N0M3Qlx1NTc4Qlx1NjYyMFx1NUMwNFx1RkYwOFx1NTQyQiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHVGRjA5ICovXG5leHBvcnQgY29uc3QgTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5odG1sJzogJ3RleHQvaHRtbDsgY2hhcnNldD11dGYtOCcsXG4gICcuY3NzJzogICd0ZXh0L2NzczsgY2hhcnNldD11dGYtOCcsXG4gICcuanMnOiAgICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5tanMnOiAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzb24nOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICcucG5nJzogICdpbWFnZS9wbmcnLFxuICAnLmpwZyc6ICAnaW1hZ2UvanBlZycsXG4gICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJy5naWYnOiAgJ2ltYWdlL2dpZicsXG4gICcuc3ZnJzogICdpbWFnZS9zdmcreG1sJyxcbiAgJy5pY28nOiAgJ2ltYWdlL3gtaWNvbicsXG4gICcud29mZic6ICdmb250L3dvZmYnLFxuICAnLndvZmYyJzonZm9udC93b2ZmMicsXG4gICcudHRmJzogICdmb250L3R0ZicsXG4gIC4uLkFVRElPX01JTUVfVFlQRVMsXG59O1xuIiwgImltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgbmV0IGZyb20gJ25ldCc7XG5pbXBvcnQgeyBNSU1FX1RZUEVTLCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuXG4vKipcbiAqIExvY2FsU2VydmVyIC0gXHU2NzJDXHU1NzMwIEhUVFAgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2NzBEXHU1MkExXHU1NjY4XG4gKlxuICogXHU1NzI4IE9ic2lkaWFuIChFbGVjdHJvbikgXHU3M0FGXHU1ODgzXHU0RTJEXHU1NDJGXHU1MkE4XHU0RTAwXHU0RTJBXHU2NzJDXHU1NzMwIEhUVFAgXHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXG4gKiBcdTRFM0EgaWZyYW1lIFx1NjNEMFx1NEY5QiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU2NzBEXHU1MkExXHVGRjBDXHU3RUQ1XHU4RkM3IGFwcDovLyBcdTUzNEZcdThCQUVcdTc2ODRcdTk2NTBcdTUyMzZcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU2VydmVyIHtcbiAgcHJpdmF0ZSBzZXJ2ZXI6IGh0dHAuU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcG9ydCA9IDA7XG4gIHByaXZhdGUgd2ViYXBwRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG5cbiAgY29uc3RydWN0b3Iod2ViYXBwRGlyOiBzdHJpbmcpIHtcbiAgICB0aGlzLndlYmFwcERpciA9IHdlYmFwcERpcjtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTRGOUIgL2JhbWJvby1hdWRpbyBcdTk3RjNcdTk4OTFcdTRFRTNcdTc0MDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU1NDJGXHU1MkE4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXHU4RkQ0XHU1NkRFXHU3NkQxXHU1NDJDXHU3QUVGXHU1M0UzICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKHRoaXMuc2VydmVyKSByZXR1cm4gdGhpcy5wb3J0O1xuXG4gICAgdGhpcy5wb3J0ID0gYXdhaXQgdGhpcy5maW5kRnJlZVBvcnQoKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QocmVxLCByZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFNlcnZlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBTZXJ2ZXIgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbih0aGlzLnBvcnQsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RhcnRlZCBvbiBwb3J0ICR7dGhpcy5wb3J0fWApO1xuICAgICAgICByZXNvbHZlKHRoaXMucG9ydCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTUwNUNcdTZCNjJcdTY3MERcdTUyQTFcdTU2NjggKi9cbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1tCYW1ib29SZXZpZXddIExvY2FsIHNlcnZlciBzdG9wcGVkJyk7XG4gICAgICAgICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgICAgICAgIHRoaXMucG9ydCA9IDA7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTY3MERcdTUyQTFcdTU2NjggVVJMICovXG4gIGdldFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgaHR0cDovLzEyNy4wLjAuMToke3RoaXMucG9ydH1gO1xuICB9XG5cbiAgLyoqIFx1NTkwNFx1NzQwNiBIVFRQIFx1OEJGN1x1NkM0MiAqL1xuICBwcml2YXRlIGhhbmRsZVJlcXVlc3QocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgLy8gL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU0RUUzXHU3NDA2XHVGRjBDXHU3RUQ1XHU4RkM3IHBvc3RNZXNzYWdlIFx1NTkyNyBwYXlsb2FkIFx1OTY1MFx1NTIzNlxuICAgIGNvbnN0IHVybCA9IHJlcS51cmwgfHwgJy8nO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnL2JhbWJvby1hdWRpby1wcm94eScpKSB7XG4gICAgICB0aGlzLmhhbmRsZUF1ZGlvVXJsUHJveHkocmVxLCByZXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9iYW1ib28tYXVkaW8nKSkge1xuICAgICAgdGhpcy5oYW5kbGVBdWRpb1Byb3h5KHJlcSwgcmVzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTg5RTNcdTY3OTAgVVJMXHVGRjBDXHU1M0JCXHU5NjY0XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXG4gICAgbGV0IHVybFBhdGggPSB1cmwuc3BsaXQoJz8nKVswXTtcbiAgICAvLyBcdTc2RUVcdTVGNTVcdTlFRDhcdThCQTRcdTY1ODdcdTRFRjZcbiAgICBpZiAodXJsUGF0aC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICB1cmxQYXRoICs9ICdpbmRleC5odG1sJztcbiAgICB9XG4gICAgY29uc3Qgc2FmZVBhdGggPSBwYXRoLm5vcm1hbGl6ZSh1cmxQYXRoKS5yZXBsYWNlKC9eKFxcLlxcLlsvXFxcXF0pKy8sICcnKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLndlYmFwcERpciwgc2FmZVBhdGgpO1xuXG4gICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU1NzI4IHdlYmFwcERpciBcdTUxODVcbiAgICBpZiAoIWZpbGVQYXRoLnN0YXJ0c1dpdGgodGhpcy53ZWJhcHBEaXIpKSB7XG4gICAgICByZXMud3JpdGVIZWFkKDQwMyk7XG4gICAgICByZXMuZW5kKCdGb3JiaWRkZW4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBmcy5zdGF0KGZpbGVQYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xuICAgICAgICByZXMuZW5kKGA8IURPQ1RZUEUgaHRtbD5cbjxodG1sPjxoZWFkPjxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPjxzdHlsZT5cbiAgYm9keSB7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBoZWlnaHQ6MTAwdmg7IG1hcmdpbjowO1xuICAgICAgICAgZm9udC1mYW1pbHk6IHN5c3RlbS11aSwgc2Fucy1zZXJpZjsgYmFja2dyb3VuZDojMGEwYTBhOyBjb2xvcjojODg4OyB9XG4gIC5ib3ggeyB0ZXh0LWFsaWduOmNlbnRlcjsgfVxuICBoMiB7IGNvbG9yOiNjY2M7IGZvbnQtd2VpZ2h0OjQwMDsgfVxuICBwIHsgZm9udC1zaXplOjE0cHg7IH1cbiAgYnV0dG9uIHsgbWFyZ2luLXRvcDoxNnB4OyBwYWRkaW5nOjhweCAyNHB4OyBib3JkZXI6MXB4IHNvbGlkICM0NDQ7IGJvcmRlci1yYWRpdXM6NnB4O1xuICAgICAgICAgICBiYWNrZ3JvdW5kOiMxYTFhMWE7IGNvbG9yOiNhYWE7IGN1cnNvcjpwb2ludGVyOyBmb250LXNpemU6MTRweDsgfVxuICBidXR0b246aG92ZXIgeyBiYWNrZ3JvdW5kOiMyYTJhMmE7IGNvbG9yOiNmZmY7IH1cbjwvc3R5bGU+PC9oZWFkPjxib2R5PlxuPGRpdiBjbGFzcz1cImJveFwiPlxuICA8aDI+XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHU2QjYzXHU1NzI4XHU1MjFEXHU1OUNCXHU1MzE2XHUyMDI2XHUyMDI2PC9oMj5cbiAgPHA+XHU5OTk2XHU2QjIxXHU1NDJGXHU1MkE4XHU5NzAwXHU4OTgxXHU0RTBCXHU4RjdEXHU4RDQ0XHU2RTkwXHU1MzA1XHVGRjBDXHU4QkY3XHU3QTBEXHU1MDE5PC9wPlxuICA8YnV0dG9uIG9uY2xpY2s9XCJsb2NhdGlvbi5yZWxvYWQoKVwiPlx1NjI0Qlx1NTJBOFx1NTIzN1x1NjVCMDwvYnV0dG9uPlxuICA8c2NyaXB0PlxuICAgIHZhciByZXRyaWVzID0gMDtcbiAgICBmdW5jdGlvbiBjaGVjaygpIHtcbiAgICAgIGZldGNoKHdpbmRvdy5sb2NhdGlvbi5ocmVmLCB7IG1ldGhvZDogJ0hFQUQnIH0pLnRoZW4oZnVuY3Rpb24ocikge1xuICAgICAgICBpZiAoci5zdGF0dXMgPT09IDIwMCkgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIGVsc2UgaWYgKCsrcmV0cmllcyA8IDMwKSBzZXRUaW1lb3V0KGNoZWNrLCAyMDAwKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKCkgeyBpZiAoKytyZXRyaWVzIDwgMzApIHNldFRpbWVvdXQoY2hlY2ssIDIwMDApOyB9KTtcbiAgICB9XG4gICAgc2V0VGltZW91dChjaGVjaywgMzAwMCk7XG4gIDwvc2NyaXB0PlxuPC9kaXY+PC9ib2R5PjwvaHRtbD5gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThCQkVcdTdGNkUgTUlNRSBcdTdDN0JcdTU3OEJcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuXG4gICAgICAvLyBcdTVERUVcdTVGMDJcdTUzMTZcdTdGMTNcdTVCNThcdTdCNTZcdTc1NjVcdUZGMUFcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdTVFMjYgX19CVUlMRF9fIFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwQ1x1NTNFRlx1OTU3Rlx1NjcxRlx1N0YxM1x1NUI1OFxuICAgICAgY29uc3QgaXNIVE1MID0gZXh0ID09PSAnLmh0bWwnO1xuICAgICAgY29uc3QgaXNTdGF0aWMgPSBbJy5jc3MnLCAnLmpzJywgJy53b2ZmJywgJy53b2ZmMicsICcudHRmJywgJy5zdmcnLCAnLnBuZycsICcuaWNvJywgJy5qc29uJ10uaW5jbHVkZXMoZXh0KTtcbiAgICAgIGNvbnN0IGNhY2hlQ29udHJvbCA9IGlzSFRNTFxuICAgICAgICA/ICduby1jYWNoZSdcbiAgICAgICAgOiBpc1N0YXRpY1xuICAgICAgICAgID8gJ3B1YmxpYywgbWF4LWFnZT04NjQwMCdcbiAgICAgICAgICA6ICdwdWJsaWMsIG1heC1hZ2U9MzYwMCc7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NEUwRFx1OTcwMFx1ODk4MSBDT1JTXHVGRjBDaWZyYW1lIFx1NEUwRVx1NjcwRFx1NTJBMVx1NTY2OFx1NTQwQ1x1NkU5MFx1RkYwOVxuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgICAgICAnQ2FjaGUtQ29udHJvbCc6IGNhY2hlQ29udHJvbCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTZENDFcdTVGMEZcdTRGMjBcdThGOTNcdTY1ODdcdTRFRjZcbiAgICAgIGNvbnN0IHN0cmVhbTogZnMuUmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZVBhdGgpO1xuICAgICAgc3RyZWFtLnBpcGUocmVzKTtcbiAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICAgIHJlcy5lbmQoJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiAvYmFtYm9vLWF1ZGlvLXByb3h5P3VybD14eHggXHUyMDE0IFx1NEVFM1x1NzQwNlx1NTkxNlx1OTBFOFx1OTdGM1x1NkU5MCBVUkxcdUZGMENcdTdFRDVcdThGQzdcdTZENEZcdTg5QzhcdTU2NjggQ09SUyBcdTk2NTBcdTUyMzYgKi9cbiAgcHJpdmF0ZSBoYW5kbGVBdWRpb1VybFByb3h5KHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByYXdVcmwgPSByZXEudXJsIHx8ICcnO1xuICAgICAgY29uc3QgcXVlcnlJbmRleCA9IHJhd1VybC5pbmRleE9mKCc/Jyk7XG4gICAgICBpZiAocXVlcnlJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHVybCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcXVlcnlTdHIgPSByYXdVcmwuc2xpY2UocXVlcnlJbmRleCArIDEpO1xuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhxdWVyeVN0cik7XG4gICAgICBjb25zdCB0YXJnZXRVcmwgPSBwYXJhbXMuZ2V0KCd1cmwnKTtcbiAgICAgIGlmICghdGFyZ2V0VXJsKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyB1cmwgcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU0RUM1XHU1MTQxXHU4QkI4IGh0dHAvaHR0cHNcbiAgICAgIGxldCBwYXJzZWQ6IFVSTDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IG5ldyBVUkwodGFyZ2V0VXJsKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ0ludmFsaWQgVVJMJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJzZWQucHJvdG9jb2wgIT09ICdodHRwOicgJiYgcGFyc2VkLnByb3RvY29sICE9PSAnaHR0cHM6Jykge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogb25seSBodHRwL2h0dHBzIFVSTHMgYWxsb3dlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzk4MVx1NkI2Mlx1OEJCRlx1OTVFRVx1NjcyQ1x1NTczMFx1NTczMFx1NTc0MFxuICAgICAgY29uc3QgaG9zdG5hbWUgPSBwYXJzZWQuaG9zdG5hbWU7XG4gICAgICBpZiAoaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnIHx8IGhvc3RuYW1lID09PSAnMTI3LjAuMC4xJyB8fCBob3N0bmFtZSA9PT0gJzAuMC4wLjAnXG4gICAgICAgIHx8IGhvc3RuYW1lID09PSAnWzo6MV0nIHx8IGhvc3RuYW1lLnN0YXJ0c1dpdGgoJzE5Mi4xNjguJykgfHwgaG9zdG5hbWUuc3RhcnRzV2l0aCgnMTAuJylcbiAgICAgICAgfHwgaG9zdG5hbWUuc3RhcnRzV2l0aCgnMTcyLicpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuOiBsb2NhbC9wcml2YXRlIG5ldHdvcmsgVVJMcyBub3QgYWxsb3dlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NzY3RFx1NTQwRFx1NTM1NVx1RkYwOVxuICAgICAgY29uc3QgcGF0aG5hbWUgPSBwYXJzZWQucGF0aG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLnNvbWUoZXh0ID0+IHBhdGhuYW1lLmVuZHNXaXRoKGV4dCkpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuOiB1bnN1cHBvcnRlZCBhdWRpbyBmb3JtYXQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0cmFuc3BvcnQgPSBwYXJzZWQucHJvdG9jb2wgPT09ICdodHRwczonID8gaHR0cHMgOiBodHRwO1xuICAgICAgY29uc3QgcHJveHlSZXEgPSB0cmFuc3BvcnQuZ2V0KHRhcmdldFVybCwgeyB0aW1lb3V0OiAzMDAwMCB9LCAocHJveHlSZXMpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gcHJveHlSZXMuc3RhdHVzQ29kZSB8fCA1MDA7XG4gICAgICAgIGNvbnN0IGN0ID0gcHJveHlSZXMuaGVhZGVyc1snY29udGVudC10eXBlJ10gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG5cbiAgICAgICAgLy8gXHU5NjUwXHU1MjM2XHU1NENEXHU1RTk0XHU1OTI3XHU1QzBGXHVGRjA4XHU2NzAwXHU1OTI3IDUwTUJcdUZGMDlcbiAgICAgICAgY29uc3QgbWF4U2l6ZSA9IDUwICogMTAyNCAqIDEwMjQ7XG4gICAgICAgIGxldCB0b3RhbFNpemUgPSAwO1xuICAgICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG5cbiAgICAgICAgcHJveHlSZXMub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgIHRvdGFsU2l6ZSArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgICAgaWYgKHRvdGFsU2l6ZSA+IG1heFNpemUpIHtcbiAgICAgICAgICAgIHByb3h5UmVxLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDEzKTsgcmVzLmVuZCgnQXVkaW8gZmlsZSB0b28gbGFyZ2UgKG1heCA1ME1CKScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb3h5UmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcy5oZWFkZXJzU2VudCkgcmV0dXJuO1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoc3RhdHVzLCB7XG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogY3QsXG4gICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiB0b3RhbFNpemUsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBCdWZmZXIuY29uY2F0KGNodW5rcyk7XG4gICAgICAgICAgcmVzLmVuZChib2R5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJveHlSZXMub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBBdWRpbyBVUkwgcHJveHkgdXBzdHJlYW0gZXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIpOyByZXMuZW5kKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcHJveHlSZXEub24oJ3RpbWVvdXQnLCAoKSA9PiB7XG4gICAgICAgIHByb3h5UmVxLmRlc3Ryb3koKTtcbiAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwNCk7IHJlcy5lbmQoJ1Vwc3RyZWFtIHRpbWVvdXQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByb3h5UmVxLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gVVJMIHByb3h5IGVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMik7IHJlcy5lbmQoJ1Vwc3RyZWFtIGNvbm5lY3Rpb24gZmFpbGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIFVSTCBwcm94eSBlcnJvcjonLCBlKTtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpbz9wYXRoPXh4eCBcdTIwMTQgXHU2RDQxXHU1RjBGXHU0RUUzXHU3NDA2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9Qcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBxdWVyeVN0ciA9IHJhd1VybC5zbGljZShxdWVyeUluZGV4ICsgMSk7XG4gICAgICBjb25zdCBwYXJhbXM6IFVSTFNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHIpO1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFyYW1zLmdldCgncGF0aCcpO1xuICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdNaXNzaW5nIHBhdGggcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1Qjg5XHU1MTY4XHU2OEMwXHU2N0U1XHVGRjFBXHU1M0VBXHU1MTQxXHU4QkI4XHU2MzA3XHU1QjlBXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUocmVsYXRpdmVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogdW5zdXBwb3J0ZWQgYXVkaW8gZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzk4MVx1NkI2Mlx1OERFRlx1NUY4NFx1N0E3Rlx1OEQ4QVxuICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IHBhdGgubm9ybWFsaXplKHJlbGF0aXZlUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZC5zdGFydHNXaXRoKCcuLicpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTsgcmVzLmVuZCgnVmF1bHQgYmFzZSBwYXRoIG5vdCBjb25maWd1cmVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCBub3JtYWxpemVkKTtcbiAgICAgIGlmICghZnVsbFBhdGguc3RhcnRzV2l0aCh0aGlzLnZhdWx0QmFzZVBhdGgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTsgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnMuc3RhdChmdWxsUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgaWYgKGVyciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7IHJlcy5lbmQoJ0ZpbGUgbm90IGZvdW5kJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBzdGF0cy5zaXplLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTM2MDAnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3RyZWFtOiBmcy5SZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmdWxsUGF0aCk7XG4gICAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIHJlcy5lbmQoJ1N0cmVhbSBlcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIHByb3h5IGVycm9yOicsIGUpO1xuICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogXHU2N0U1XHU2MjdFXHU1M0VGXHU3NTI4XHU3QUVGXHU1M0UzICovXG4gIHByaXZhdGUgZmluZEZyZWVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgIHNlcnZlci5saXN0ZW4oMCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9ydCA9IChzZXJ2ZXIuYWRkcmVzcygpIGFzIG5ldC5BZGRyZXNzSW5mbykucG9ydDtcbiAgICAgICAgc2VydmVyLmNsb3NlKCgpID0+IHJlc29sdmUocG9ydCkpO1xuICAgICAgfSk7XG4gICAgICBzZXJ2ZXIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufSIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSBCYW1ib29SZXZpZXdQbHVnaW4gZnJvbSAnLi4vLi4vbWFpbic7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5cbi8qKiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTYzQTVcdTUzRTMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFtYm9vUmV2aWV3U2V0dGluZ3Mge1xuICAvKiogXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU2ODM5XHU4REVGXHU1Rjg0ICovXG4gIGRhdGFQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxICovXG4gIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcbiAgLyoqIFx1Njc3Rlx1NTc1N1x1N0JBMVx1NzQwNlx1OTE0RFx1N0Y2RVx1RkYwOFx1NTNFRlx1ODlDMVx1NjAyNyArIFx1NjM5Mlx1NUU4Rlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RSB3ZWJhcHAgaWZyYW1lIGxvY2FsU3RvcmFnZSBcdTRFMERcdTUzRUZcdTk3NjBcdTY1RjZcdTYzMDFcdTRFNDVcdTUzMTYgKi9cbiAgc2VjdGlvbkNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5ICovXG4gIHRoZW1lUGF0aDogc3RyaW5nO1xuICAvKiogXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzXHVGRjA5ICovXG4gIG5vaXNlUGF0aDogc3RyaW5nO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU1MjE3XHU4ODY4XHVGRjA4XHU5MDFBXHU4RkM3XHU2ODY1XHU2M0E1XHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjBDXHU1MTRCXHU2NzBEIGxvY2FsU3RvcmFnZSBwb3J0LXNjb3BlZCBcdTk1RUVcdTk4OThcdUZGMDkgKi9cbiAgbm9pc2VJdGVtczogdW5rbm93bltdO1xuICAvKiogXHU2NjJGXHU1NDI2XHU1QzA2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyICovXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEJhbWJvb1Jldmlld1NldHRpbmdzID0ge1xuICBkYXRhUGF0aDogJ2JhbWJvby1yZXZpZXcnLFxuICBlbmFibGVNYXJrZG93blN5bmM6IHRydWUsXG4gIHNlY3Rpb25Db25maWc6IG51bGwsXG4gIHRoZW1lUGF0aDogJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcsXG4gIG5vaXNlUGF0aDogJycsXG4gIG5vaXNlSXRlbXM6IFtdLFxuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGZhbHNlLFxufTtcblxuLyoqXG4gKiBQbHVnaW5TZXR0aW5ncyAtIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2V0dGluZ3MgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgYXN5bmMgZGlzcGxheSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctc2V0dGluZ3MnKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgLSBcdThCQkVcdTdGNkUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyA9PT0gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODRcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NTcyOCBWYXVsdCBcdTRFMkRcdTc2ODRcdTVCNThcdTUwQThcdTc2RUVcdTVGNTVcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2JhbWJvby1yZXZpZXcnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aCA9IHZhbHVlIHx8ICdiYW1ib28tcmV2aWV3JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gTWFya2Rvd24gXHU2NDU4XHU4OTgxXHU1NDBDXHU2QjY1XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MScpXG4gICAgICAuc2V0RGVzYygnXHU2QkNGXHU2QjIxXHU0RkREXHU1QjU4XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1NzI4IHJldmlld3MvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzUxRlx1NjIxMFx1NTNFRlx1OEJGQlx1NzY4NCAubWQgXHU2NTg3XHU0RUY2JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTVCNThcdTY1M0VcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggLmpzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aCA9IHZhbHVlIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU3NjdEXHU1NjZBXHU5N0YzID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjMnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzknKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NjMwN1x1NUI5QVx1NTQwRVx1NEVDNVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1NTE4NVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1MzAwMlx1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NjU3NFx1NEUyQVx1NUU5M1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3NjdEXHU1NjZBXHU5N0YzIFx1NjIxNlx1NzU1OVx1N0E3QVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5MycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGggPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NUMwNlx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDd2ViYXBwIFx1NTE4NVx1NjBBQ1x1NkQ2RVx1ODNEQ1x1NTM1NVx1NzY4NFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdThDMDNcdTgyNzJcdTRGMUFcdTVCOUVcdTY1RjZcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU3Njg0XHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHU5MTREXHU4MjcyJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSUZyYW1lRWxlbWVudD4oJy5iYW1ib28tcmV2aWV3LWZyYW1lJyk7XG4gICAgICAgICAgICBpZiAoZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOnN5bmNQYWxldHRlRW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGVuYWJsZWQ6IHZhbHVlIH1cbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIFx1NTE3M1x1NEU4RVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTUxNzNcdTRFOEUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDFcdUZGMUFcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0IgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgcGx1Z2luQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ0JhbWJvbyBJbW1vcnRhbHNcdUZGMDhcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdUZGMDlcdTY2MkZcdTRFMDBcdTZCM0VcdTU3RkFcdTRFOEVcdTgyQ0ZcdTgwNTRcdTYzQTdcdTUyMzZcdThCQkFcdTRFNEJcdTcyMzZcdTdFRjRcdTUxNEJcdTYyNThcdTAwQjdcdTY4M0NcdTUzNjJcdTRFQzBcdTc5RDFcdTU5MkJcdTYzRDBcdTUxRkFcdTc2ODRcIk9HQVNcIlx1NzQwNlx1NUZGNVx1RkYwQ1x1NEUxM1x1NEUzQVx1NEUyQVx1NEVCQVx1NjI1M1x1OTAyMFx1NzY4NFx1NEUyRFx1NTZGRFx1OThDRVx1NzZFRVx1NjgwN1x1ODFFQVx1NTJBOFx1NTMxNlx1NTIwNlx1OTE0RFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlx1MzAwMicsXG4gICAgICBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYydcbiAgICB9KTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMlx1RkYxQVx1NEY1Q1x1ODAwNSArIFx1NEY1Q1x1NTRDMSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBhdXRob3JCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCBiYW1ib28tYWJvdXQtYXV0aG9yJyB9KTtcbiAgICBjb25zdCBhdXRob3JSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb3cnIH0pO1xuICAgIGNvbnN0IGF2YXRhciA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXZhdGFyJyB9KTtcbiAgICAvLyBcdTRFQ0VcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdThCRkJcdTUzRDZcdTU5MzRcdTUwQ0ZcdUZGMDhcdTkwMUFcdThGQzcgVmF1bHQgQVBJIFx1OEJGQlx1NTNENiAub2JzaWRpYW4vcGx1Z2lucy8gXHU0RTBCXHU3Njg0XHU4MUVBXHU2NzA5XHU4RDQ0XHU2RTkwXHVGRjA5XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBsdWdpbkRpciA9IHRoaXMucGx1Z2luLm1hbmlmZXN0LmRpciA/PyAnJztcbiAgICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgYCR7cGx1Z2luRGlyfS9hdXRob3ItYXZhdGFyLmpwZ2AsXG4gICAgICAgIGAke3BsdWdpbkRpcn0vd2ViYXBwL2Fzc2V0cy9pbWFnZXMvYXV0aG9yLWF2YXRhci5qcGdgLFxuICAgICAgXTtcbiAgICAgIGZvciAoY29uc3QgYXZhdGFyUGF0aCBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGFkYXB0ZXIuZXhpc3RzKGF2YXRhclBhdGgpO1xuICAgICAgICBpZiAoIWV4aXN0cykgY29udGludWU7XG4gICAgICAgIGNvbnN0IGF2YXRhckRhdGEgPSBhd2FpdCBhZGFwdGVyLnJlYWRCaW5hcnkoYXZhdGFyUGF0aCk7XG4gICAgICAgIGNvbnN0IGI2NCA9IEJ1ZmZlci5mcm9tKGF2YXRhckRhdGEpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBgdXJsKGRhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiNjR9KWAsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIHsgLyogc2lsZW50bHkgc2tpcCBcdTIwMTQgc2hvdyBkZWZhdWx0IGVtcHR5IGF2YXRhciAqLyB9XG5cblxuICAgIGNvbnN0IGF1dGhvckluZm8gPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1pbmZvJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU3RkJEXHU5Q0RFXHU1NDFCJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1uYW1lJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1NUI1XHU1QjU3XHU5OTg2XHU1MjFCXHU1OUNCXHU0RUJBJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb2xlJyB9KTtcblxuICAgIC8vIFx1NEY1Q1x1NTRDMVx1NTMzQVxuICAgIGF1dGhvckJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ09ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NEY1Q1x1NTRDMScsIGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1sYWJlbCcgfSk7XG4gICAgY29uc3Qgd29ya3NSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLXJvdycgfSk7XG5cbiAgICBbeyBuYW1lOiAnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tQmFtYm9vLURhcnRzJyB9LFxuICAgICB7IG5hbWU6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9XS5mb3JFYWNoKHdvcmsgPT4ge1xuICAgICAgY29uc3QgdGFnID0gd29ya3NSb3cuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IHdvcmsubmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgICBpZiAod29yay51cmwpIHtcbiAgICAgICAgdGFnLnNldENzc1N0eWxlcyh7IGN1cnNvcjogJ3BvaW50ZXInIH0pO1xuICAgICAgICB0YWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgd2luZG93Lm9wZW4od29yay51cmwsICdfYmxhbmsnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEZcbiAgICBjb25zdCBjb250YWN0Qm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEYnLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTkwQUVcdTdCQjFcdUZGMUF5YW55dWxpbjIxMDBAcXEuY29tJywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTVGQUVcdTRGRTFcdUZGMUF5YW5odTk0JywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQThDO0FBQzlDLElBQUFDLFFBQXNCO0FBQ3RCLElBQUFDLE1BQW9CO0FBQ3BCLFdBQXNCO0FBQ3RCLElBQUFDLFNBQXVCOzs7QUNKdkIsSUFBQUMsbUJBQWtEOzs7QUNBbEQsc0JBQTBDOzs7QUNvQm5DLElBQU0sd0JBQU4sY0FBb0MsTUFBTTtBQUFBLEVBQy9DLFlBQVksU0FBaUI7QUFDM0IsVUFBTSxPQUFPO0FBQ2IsU0FBSyxPQUFPO0FBQUEsRUFDZDtBQUNGO0FBRUEsSUFBTSxlQUFlLENBQUMsUUFBUSxTQUFTLFlBQVksbUJBQW1CLGVBQWU7QUFVOUUsSUFBTSxrQkFBa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNN0IsU0FBUyxNQUFnQztBQUN2QyxRQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxNQUFNLFFBQVEsSUFBSSxHQUFHO0FB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S0FBSyxLQUFLLElBQUksQ0FBQztBQUdyRCxTQUFLLGNBQWMsUUFBUSxrQ0FBUyxNQUFNO0FBQ3hDLFdBQUssS0FBSyxhQUFhO0FBQUEsSUFDekIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVBLFdBQWlCO0FBQ2YsZ0JBQVksZ0JBQWdCO0FBQzVCLFNBQUssS0FBSyxhQUFhLEtBQUs7QUFDNUIsU0FBSyxjQUFjO0FBQUEsRUFDckI7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEVBQUUsVUFBVSxJQUFJLEtBQUs7QUFFM0IsUUFBSSxPQUE2QjtBQUNqQyxVQUFNLFNBQVMsVUFBVSxnQkFBZ0Isc0JBQXNCO0FBRS9ELFFBQUksT0FBTyxTQUFTLEdBQUc7QUFFckIsYUFBTyxPQUFPLENBQUM7QUFBQSxJQUNqQixPQUFPO0FBRUwsYUFBTyxVQUFVLFFBQVEsS0FBSztBQUM5QixZQUFNLEtBQUssYUFBYTtBQUFBLFFBQ3RCLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBRUEsUUFBSSxNQUFNO0FBQ1IsWUFBTSxVQUFVLFdBQVcsSUFBSTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxhQUFhLE1BQW9CO0FBQ3ZDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0Isc0JBQXNCO0FBQ3hFLFFBQUksT0FBTyxXQUFXLEVBQUc7QUFFekIsVUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLFVBQU0sU0FBVSxLQUF5RDtBQUN6RSxRQUFJLFFBQVEsZUFBZTtBQUN6QixVQUFJLFNBQVM7QUFDYixVQUFJO0FBQUUsaUJBQVMsSUFBSSxJQUFJLE9BQU8sR0FBRyxFQUFFO0FBQUEsTUFBUSxRQUFRO0FBQUEsTUFBaUI7QUFDcEUsYUFBTyxjQUFjO0FBQUEsUUFDbkIsRUFBRSxNQUFNLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtBQUFBLFFBQ2hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxFQUMzRTtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImZzIiwgImh0dHBzIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgImNodW5rcyJdCn0K
