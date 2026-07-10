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
  /**
   * 解析 CSS 颜色字符串 → [r, g, b]（0–255 整数）
   * 支持 rgb()/rgba()/#hex（3 或 6 位）；无法解析返回 null
   */
  static parseColorToRgb(color) {
    if (!color) return null;
    const c = color.trim();
    let r, g, b;
    const rgbMatch = c.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(",").map((s) => parseFloat(s));
      [r, g, b] = parts;
    } else if (c[0] === "#") {
      let hex = c.slice(1);
      if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
      if (hex.length < 6) return null;
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return null;
    }
    if ([r, g, b].some((v) => isNaN(v))) return null;
    return [Math.round(r), Math.round(g), Math.round(b)];
  }
  /**
   * 解析 CSS 颜色字符串 → HSL 色相 H（0–360）
   * 用于把 Obsidian 主题的 --interactive-accent 反推为插件的 --accent-hue
   */
  static rgbToHue(color) {
    const rgb = _ThemeBridge.parseColorToRgb(color);
    if (!rgb) return null;
    const [r, g, b] = rgb;
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
    if (d === 0) return 0;
    let h;
    if (max === rn) h = (gn - bn) / d % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60);
    return h < 0 ? h + 360 : h;
  }
  /**
   * 解析 CSS 颜色字符串 → "r, g, b" 三元组字符串
   * 用于把 Obsidian 侧边栏背景 --background-secondary 同步为插件卡片底色，
   * 让插件卡片色温贴近 Obsidian 原生界面
   */
  static rgbToRgbString(color) {
    const rgb = _ThemeBridge.parseColorToRgb(color);
    if (!rgb) return null;
    return rgb.join(", ");
  }
  /**
   * 向 iframe 推送当前主题状态
   * @param followObsidianTheme 为 true 时，附带从 Obsidian 主题
   *        --interactive-accent 反推的意境色相 hue，驱动插件整盘配色联动
   */
  pushTheme(followObsidianTheme = false) {
    if (!this.iframe?.contentWindow) return;
    const payload = {
      isDark: this.isDarkMode()
    };
    if (followObsidianTheme) {
      const accent = getComputedStyle(activeDocument.body).getPropertyValue("--interactive-accent").trim();
      const hue = _ThemeBridge.rgbToHue(accent);
      if (hue !== null) payload.hue = hue;
      const sidebar = getComputedStyle(activeDocument.body).getPropertyValue("--background-secondary").trim();
      const bg = _ThemeBridge.rgbToRgbString(sidebar);
      if (bg !== null) payload.bg = bg;
    }
    this.iframe.contentWindow.postMessage(
      {
        type: "theme:changed",
        id: "theme_push_" + Date.now(),
        payload
      },
      "*"
    );
  }
  /** 供外部调用：Obsidian 主题变化时触发 */
  onThemeChanged(followObsidianTheme = false) {
    this.pushTheme(followObsidianTheme);
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
      this.themeBridge.pushTheme(this.settings?.followObsidianTheme ?? false);
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
        this.themeBridge.pushTheme(this.settings?.followObsidianTheme ?? false);
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
      this.themeBridge?.onThemeChanged(this.settings.followObsidianTheme);
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
  syncPaletteToObsidian: false,
  followObsidianTheme: true
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
    new import_obsidian3.Setting(containerEl).setName("\u8DDF\u968F Obsidian \u4E3B\u9898\u914D\u8272").setDesc("\u6253\u5F00\u540E\uFF0C\u63D2\u4EF6\u6574\u4F53\u914D\u8272\u4F1A\u8DDF\u968F\u5F53\u524D Obsidian \u4E3B\u9898\u7684\u5F3A\u8C03\u8272\uFF08--interactive-accent\uFF09\u3002\u5207\u6362 Bamboo China \u7684\u7AF9\u5F71 / \u58A8\u591C / \u80ED\u8102 / \u9752\u7EFF\u7B49\u610F\u5883\u65F6\uFF0C\u63D2\u4EF6\u914D\u8272\u968F\u4E4B\u8054\u52A8").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.followObsidianTheme).onChange(async (value) => {
        this.plugin.settings.followObsidianTheme = value;
        await this.plugin.saveSettings();
        const frame = activeDocument.querySelector(".bamboo-review-frame");
        if (!frame?.contentWindow) return;
        if (value) {
          const accent = getComputedStyle(activeDocument.body).getPropertyValue("--interactive-accent").trim();
          const hue = ThemeBridge.rgbToHue(accent);
          const sidebar = getComputedStyle(activeDocument.body).getPropertyValue("--background-secondary").trim();
          const bg = ThemeBridge.rgbToRgbString(sidebar);
          const payload = {
            isDark: activeDocument.body.classList.contains("theme-dark")
          };
          if (hue !== null) payload.hue = hue;
          if (bg !== null) payload.bg = bg;
          frame.contentWindow.postMessage({
            type: "theme:changed",
            id: "settings_" + Date.now(),
            payload
          }, "*");
        } else {
          frame.contentWindow.postMessage({
            type: "theme:followDisabled",
            id: "settings_" + Date.now(),
            payload: {}
          }, "*");
        }
      })
    );
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
    void (async () => {
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
    })();
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
    const DOWNLOAD_TIMEOUT_MS = 3e4;
    const url = `https://github.com/miaoziguan/obsidian-bamboo-immortals/releases/download/${version}/webapp.zip`;
    let timeoutId = null;
    const clearTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
    const fail = (err) => {
      clearTimer();
      reject(err);
    };
    timeoutId = window.setTimeout(() => {
      fail(new Error(`\u4E0B\u8F7D\u8D85\u65F6\uFF08${DOWNLOAD_TIMEOUT_MS / 1e3}s\uFF09\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u901A\u6027: ${url}`));
    }, DOWNLOAD_TIMEOUT_MS);
    const fetchWithRedirect = (targetUrl, cb) => {
      https2.get(targetUrl, { headers: { "User-Agent": "obsidian-bamboo-immortals" } }, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          const loc = res.headers.location;
          if (!loc) {
            fail(new Error("\u91CD\u5B9A\u5411\u7F3A\u5C11 Location \u5934"));
            return;
          }
          fetchWithRedirect(loc, cb);
          return;
        }
        if (res.statusCode !== 200) {
          fail(new Error(`HTTP ${res.statusCode}: ${targetUrl}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          clearTimer();
          cb(chunks);
        });
        res.on("error", (e) => fail(e instanceof Error ? e : new Error(String(e))));
      }).on("error", (e) => fail(e instanceof Error ? e : new Error(String(e))));
    };
    fetchWithRedirect(url, (chunks) => {
      extractZip(Buffer.concat(chunks), destDir).then(resolve).catch((e) => reject(e instanceof Error ? e : new Error(String(e))));
    });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9JbXBvcnRWYWxpZGF0b3IudHMiLCAic3JjL3N0b3JhZ2UvTWFya2Rvd25TeW5jLnRzIiwgInNyYy9icmlkZ2UvU3RvcmFnZUJyaWRnZS50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9icmlkZ2UvQnJpZGdlU2VydmljZS50cyIsICJzcmMvY29uc3RhbnRzL2F1ZGlvLnRzIiwgInNyYy9zZXJ2ZXIvTG9jYWxTZXJ2ZXIudHMiLCAic3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBQbHVnaW4sIFdvcmtzcGFjZUxlYWYsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IExvY2FsU2VydmVyIH0gZnJvbSAnLi9zcmMvc2VydmVyL0xvY2FsU2VydmVyJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9zcmMvYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG4vKiogXHU3RUFGIE5vZGUuanMgWklQIFx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1Nlx1N0NGQlx1N0VERiB1bnppcC9Qb3dlclNoZWxsXHUzMDAyXHU1RjAyXHU2QjY1XHU4QkZCXHU1M0Q2K1x1ODlFM1x1NTM4Qlx1RkYwQ1x1NEVDNVx1NUI1N1x1ODI4Mlx1ODlFM1x1Njc5MFx1NEZERFx1NjMwMVx1NTQwQ1x1NkI2NVx1MzAwMiAqL1xuYXN5bmMgZnVuY3Rpb24gZXh0cmFjdFppcChzb3VyY2U6IHN0cmluZyB8IEJ1ZmZlciwgZGVzdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGJ1ZiA9IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoc291cmNlKSA6IHNvdXJjZTtcbiAgbGV0IHBvcyA9IDA7XG5cbiAgY29uc3QgcmVhZDE2ID0gKCkgPT4geyBjb25zdCB2ID0gYnVmLnJlYWRVSW50MTZMRShwb3MpOyBwb3MgKz0gMjsgcmV0dXJuIHY7IH07XG4gIGNvbnN0IHJlYWQzMiA9ICgpID0+IHsgY29uc3QgdiA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTsgcG9zICs9IDQ7IHJldHVybiB2OyB9O1xuICBjb25zdCBza2lwID0gKG46IG51bWJlcikgPT4geyBwb3MgKz0gbjsgfTtcblxuICBjb25zdCB3cml0ZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gIC8vIFx1NjI2Qlx1NjNDRlx1NjI0MFx1NjcwOSBsb2NhbCBmaWxlIGhlYWRlclx1RkYwOFx1N0I3RVx1NTQwRCAweDA0MDM0YjUwXHVGRjA5XG4gIHdoaWxlIChwb3MgPCBidWYubGVuZ3RoIC0gNCkge1xuICAgIGNvbnN0IHNpZyA9IGJ1Zi5yZWFkVUludDMyTEUocG9zKTtcbiAgICBpZiAoc2lnICE9PSAweDA0MDM0YjUwKSBicmVhaztcblxuICAgIHBvcyArPSA0O1xuICAgIHJlYWQxNigpOyAvLyB2ZXJzaW9uXG4gICAgcmVhZDE2KCk7IC8vIGZsYWdzXG4gICAgY29uc3QgbWV0aG9kID0gcmVhZDE2KCk7XG4gICAgc2tpcCg0KTsgLy8gbW9kIHRpbWUsIG1vZCBkYXRlXG4gICAgcmVhZDMyKCk7IC8vIGNyYzMyXG4gICAgY29uc3QgY29tcHJlc3NlZFNpemUgPSByZWFkMzIoKTtcbiAgICBjb25zdCB1bmNvbXByZXNzZWRTaXplID0gcmVhZDMyKCk7XG4gICAgY29uc3QgbmFtZUxlbiA9IHJlYWQxNigpO1xuICAgIGNvbnN0IGV4dHJhTGVuID0gcmVhZDE2KCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBidWYudG9TdHJpbmcoJ3V0Zi04JywgcG9zLCBwb3MgKyBuYW1lTGVuKTtcbiAgICBwb3MgKz0gbmFtZUxlbiArIGV4dHJhTGVuO1xuXG4gICAgLy8gXHU4REYzXHU4RkM3XHU3NkVFXHU1RjU1XHU2NzYxXHU3NkVFXG4gICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcvJykgfHwgZmlsZU5hbWUuZW5kc1dpdGgoJ1xcXFwnKSkge1xuICAgICAgcG9zICs9IGNvbXByZXNzZWRTaXplO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0UGF0aCA9IHBhdGguam9pbihkZXN0RGlyLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKG91dFBhdGgpO1xuXG4gICAgY29uc3QgZGF0YSA9IGJ1Zi5zdWJhcnJheShwb3MsIHBvcyArIGNvbXByZXNzZWRTaXplKTtcbiAgICBwb3MgKz0gY29tcHJlc3NlZFNpemU7XG5cbiAgICBpZiAobWV0aG9kID09PSAwKSB7XG4gICAgICB3cml0ZXMucHVzaChmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pLnRoZW4oKCkgPT4gZnMucHJvbWlzZXMud3JpdGVGaWxlKG91dFBhdGgsIGRhdGEpKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kID09PSA4KSB7XG4gICAgICB3cml0ZXMucHVzaCgoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYnl0ZXM6IEJ1ZmZlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBieXRlcyA9IHpsaWIuaW5mbGF0ZVJhd1N5bmMoZGF0YSwgeyBmaW5pc2hGbHVzaDogemxpYi5jb25zdGFudHMuWl9TWU5DX0ZMVVNIIH0pO1xuICAgICAgICAgIGlmIChieXRlcy5sZW5ndGggIT09IHVuY29tcHJlc3NlZFNpemUpIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMCwgdW5jb21wcmVzc2VkU2l6ZSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGJ5dGVzID0gemxpYi5pbmZsYXRlU3luYyhkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy53cml0ZUZpbGUob3V0UGF0aCwgYnl0ZXMpO1xuICAgICAgfSkoKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZDogYCArIG1ldGhvZCArICcgKCcgKyBmaWxlTmFtZSArICcpJyk7XG4gIH1cbn1cblxuLyoqIFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEJcdUZGMENcdTUxODVcdTdGNkUgMzAgXHU3OUQyXHU4RDg1XHU2NUY2XHU5NjMyXHU2QjYyXHU3RjUxXHU3RURDXHU0RTBEXHU5MDFBXHU2NUY2XHU2QzM4XHU0RTQ1XHU2MzAyXHU4RDc3ICovXG5mdW5jdGlvbiBkb3dubG9hZEFuZEV4dHJhY3RXZWJhcHAoX3BsdWdpbkRpcjogc3RyaW5nLCBkZXN0RGlyOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IERPV05MT0FEX1RJTUVPVVRfTVMgPSAzMF8wMDA7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMvcmVsZWFzZXMvZG93bmxvYWQvJHt2ZXJzaW9ufS93ZWJhcHAuemlwYDtcblxuICAgIGxldCB0aW1lb3V0SWQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGNsZWFyVGltZXIgPSAoKSA9PiB7IGlmICh0aW1lb3V0SWQgIT09IG51bGwpIHsgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0SWQpOyB0aW1lb3V0SWQgPSBudWxsOyB9IH07XG4gICAgY29uc3QgZmFpbCA9IChlcnI6IEVycm9yKSA9PiB7IGNsZWFyVGltZXIoKTsgcmVqZWN0KGVycik7IH07XG5cbiAgICB0aW1lb3V0SWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBmYWlsKG5ldyBFcnJvcihgXHU0RTBCXHU4RjdEXHU4RDg1XHU2NUY2XHVGRjA4JHtET1dOTE9BRF9USU1FT1VUX01TIC8gMTAwMH1zXHVGRjA5XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU3RjUxXHU3RURDXHU4RkRFXHU5MDFBXHU2MDI3OiAke3VybH1gKSk7XG4gICAgfSwgRE9XTkxPQURfVElNRU9VVF9NUyk7XG5cbiAgICBjb25zdCBmZXRjaFdpdGhSZWRpcmVjdCA9ICh0YXJnZXRVcmw6IHN0cmluZywgY2I6IChjaHVua3M6IEJ1ZmZlcltdKSA9PiB2b2lkKTogdm9pZCA9PiB7XG4gICAgICBodHRwcy5nZXQodGFyZ2V0VXJsLCB7IGhlYWRlcnM6IHsgJ1VzZXItQWdlbnQnOiAnb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscycgfSB9LCAocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAyIHx8IHJlcy5zdGF0dXNDb2RlID09PSAzMDEpIHtcbiAgICAgICAgICBjb25zdCBsb2MgPSByZXMuaGVhZGVycy5sb2NhdGlvbjtcbiAgICAgICAgICBpZiAoIWxvYykgeyBmYWlsKG5ldyBFcnJvcignXHU5MUNEXHU1QjlBXHU1NDExXHU3RjNBXHU1QzExIExvY2F0aW9uIFx1NTkzNCcpKTsgcmV0dXJuOyB9XG4gICAgICAgICAgZmV0Y2hXaXRoUmVkaXJlY3QobG9jLCBjYik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgZmFpbChuZXcgRXJyb3IoYEhUVFAgJHtyZXMuc3RhdHVzQ29kZX06ICR7dGFyZ2V0VXJsfWApKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgICByZXMub24oJ2RhdGEnLCAoYzogQnVmZmVyKSA9PiBjaHVua3MucHVzaChjKSk7XG4gICAgICAgIHJlcy5vbignZW5kJywgKCkgPT4geyBjbGVhclRpbWVyKCk7IGNiKGNodW5rcyk7IH0pO1xuICAgICAgICByZXMub24oJ2Vycm9yJywgKGUpID0+IGZhaWwoZSBpbnN0YW5jZW9mIEVycm9yID8gZSA6IG5ldyBFcnJvcihTdHJpbmcoZSkpKSk7XG4gICAgICB9KS5vbignZXJyb3InLCAoZSkgPT4gZmFpbChlIGluc3RhbmNlb2YgRXJyb3IgPyBlIDogbmV3IEVycm9yKFN0cmluZyhlKSkpKTtcbiAgICB9O1xuXG4gICAgZmV0Y2hXaXRoUmVkaXJlY3QodXJsLCAoY2h1bmtzKSA9PiB7XG4gICAgICBleHRyYWN0WmlwKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSwgZGVzdERpcikudGhlbihyZXNvbHZlKS5jYXRjaCgoZSkgPT4gcmVqZWN0KGUgaW5zdGFuY2VvZiBFcnJvciA/IGUgOiBuZXcgRXJyb3IoU3RyaW5nKGUpKSkpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqIFx1NTQwRVx1NTNGMFx1NUYwMlx1NkI2NVx1NTIxRFx1NTlDQlx1NTMxNiB3ZWJhcHBcdUZGMENcdTRFMERcdTk2M0JcdTU4NUVcdTYzRDJcdTRFRjZcdTc2ODQgb25sb2FkIFx1OEZENFx1NTZERSAqL1xuZnVuY3Rpb24gc2V0dXBXZWJhcHBJbkJhY2tncm91bmQoXG4gIHRoaXM6IEJhbWJvb1Jldmlld1BsdWdpbixcbiAgd2ViYXBwRGlyOiBzdHJpbmcsXG4gIHBsdWdpbkRpcjogc3RyaW5nLFxuICB2YXVsdEJhc2VQYXRoOiBzdHJpbmcsXG4gIGN1cnJlbnRWZXJzaW9uOiBzdHJpbmdcbik6IHZvaWQge1xuICBjb25zdCB3ZWJhcHBWZXJzaW9uRmlsZSA9IHBhdGguam9pbih3ZWJhcHBEaXIsICcudmVyc2lvbicpO1xuICBjb25zdCBuZWVkc1VwZGF0ZSA9ICFmcy5leGlzdHNTeW5jKHdlYmFwcFZlcnNpb25GaWxlKSB8fFxuICAgICgoKSA9PiB7IHRyeSB7IHJldHVybiBmcy5yZWFkRmlsZVN5bmMod2ViYXBwVmVyc2lvbkZpbGUsICd1dGYtOCcpLnRyaW0oKSAhPT0gY3VycmVudFZlcnNpb247IH0gY2F0Y2ggeyByZXR1cm4gdHJ1ZTsgfSB9KSgpO1xuXG4gIGlmICghbmVlZHNVcGRhdGUpIHtcbiAgICB0aGlzLndlYmFwcFJlYWR5ID0gdHJ1ZTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBcdTc1Mjggc2V0SW1tZWRpYXRlIC8gc2V0VGltZW91dCBcdTYzQThcdThGREZcdTUyMzBcdTRFMEJcdTRFMDBcdTRFMkEgdGlja1x1RkYwQ1x1Nzg2RVx1NEZERCBvbmxvYWQgXHU1MTQ4XHU4RkQ0XHU1NkRFXG4gIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyh3ZWJhcHBEaXIpKSB7XG4gICAgICAgIHRyeSB7IGZzLnJtU3luYyh3ZWJhcHBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTsgfSBjYXRjaCB7IC8qIFx1NzZFRVx1NUY1NVx1NTNFRlx1ODBGRFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NUZGRFx1NzU2NSAqLyB9XG4gICAgICB9XG4gICAgICBjb25zdCB3ZWJhcHBaaXAgPSBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnd2ViYXBwLnppcCcpO1xuICAgICAgZnMubWtkaXJTeW5jKHdlYmFwcERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHdlYmFwcFppcCkpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTZCNjNcdTU3MjhcdTg5RTNcdTUzOEJcdThENDRcdTZFOTBcdTUzMDVcdTIwMjYnLCAwKTtcbiAgICAgICAgYXdhaXQgZXh0cmFjdFppcCh3ZWJhcHBaaXAsIHdlYmFwcERpcik7XG4gICAgICAgIHRyeSB7IGZzLnVubGlua1N5bmMod2ViYXBwWmlwKTsgfSBjYXRjaCB7IC8qIFx1ODlFM1x1NTM4Qlx1NEVBN1x1NzI2OVx1NURGMlx1NUMzMVx1NEY0RFx1RkYwQ1x1NTIyMFx1OTY2NCB6aXAgXHU1OTMxXHU4RDI1XHU1M0VGXHU1RkZEXHU3NTY1ICovIH1cbiAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdThENDRcdTZFOTBcdTUzMDVcdTVERjJcdTY2RjRcdTY1QjAnLCAzMDAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGRvd25sb2FkTm90aWNlID0gbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTZCNjNcdTU3MjhcdTRFMEJcdThGN0RcdThENDRcdTZFOTBcdTUzMDVcdTIwMjYnLCAwKTtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnW0JhbWJvb1Jldmlld10gRG93bmxvYWRpbmcgd2ViYXBwIGZyb20gcmVsZWFzZScsIGN1cnJlbnRWZXJzaW9uKTtcbiAgICAgICAgYXdhaXQgZG93bmxvYWRBbmRFeHRyYWN0V2ViYXBwKHBsdWdpbkRpciwgd2ViYXBwRGlyLCBjdXJyZW50VmVyc2lvbik7XG4gICAgICAgIGRvd25sb2FkTm90aWNlLmhpZGUoKTtcbiAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdThENDRcdTZFOTBcdTUzMDVcdTVCODlcdTg4QzVcdTVCOENcdTYyMTAnLCA0MDAwKTtcbiAgICAgIH1cblxuICAgICAgZnMud3JpdGVGaWxlU3luYyh3ZWJhcHBWZXJzaW9uRmlsZSwgY3VycmVudFZlcnNpb24sICd1dGYtOCcpO1xuICAgICAgdGhpcy53ZWJhcHBSZWFkeSA9IHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gV2ViYXBwIHNldHVwIGZhaWxlZDonLCBlKTtcbiAgICAgICAgbmV3IE5vdGljZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdThENDRcdTZFOTBcdTUzMDVcdTVCODlcdTg4QzVcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTdGNTFcdTdFRENcdTU0MEVcdTkxQ0RcdTU0MkYgT2JzaWRpYW4nLCAwKTtcbiAgICB9XG4gICAgfSkoKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgbG9jYWxTZXJ2ZXI6IExvY2FsU2VydmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VydmVyVXJsID0gJyc7XG4gIC8qKiB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHU2NjJGXHU1NDI2XHU1QzMxXHU3RUVBXHVGRjA4XHU1M0VGXHU3NTI4XHU0RThFXHU5OTk2XHU1QzRGXHU1QzU1XHU3OTNBIGxvYWRpbmcgXHU3MkI2XHU2MDAxXHVGRjA5ICovXG4gIHdlYmFwcFJlYWR5ID0gZmFsc2U7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBcdTY3MERcdTUyQTFcdTU2NjhcbiAgICBjb25zdCBwbHVnaW5EaXIgPSB0aGlzLm1hbmlmZXN0LmRpcjtcbiAgICBpZiAocGx1Z2luRGlyKSB7XG4gICAgICBjb25zdCB2YXVsdEJhc2VQYXRoID0gKHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgdW5rbm93biBhcyB7IGJhc2VQYXRoOiBzdHJpbmcgfSkuYmFzZVBhdGggfHwgJyc7XG4gICAgICBjb25zdCB3ZWJhcHBEaXIgPSBwYXRoLmpvaW4odmF1bHRCYXNlUGF0aCwgcGx1Z2luRGlyLCAnd2ViYXBwJyk7XG4gICAgICBjb25zdCB3ZWJhcHBJbmRleFBhdGggPSBwYXRoLmpvaW4od2ViYXBwRGlyLCAnaW5kZXguaHRtbCcpO1xuICAgICAgdGhpcy5sb2NhbFNlcnZlciA9IG5ldyBMb2NhbFNlcnZlcih3ZWJhcHBEaXIpO1xuXG4gICAgICAvLyBcdTdBQ0JcdTUzNzNcdTU0MkZcdTUyQThcdTY3MERcdTUyQTFcdTU2NjhcdUZGMDhcdTUzNzNcdTRGN0Ygd2ViYXBwIFx1OEZEOFx1NkNBMVx1NUMzMVx1N0VFQVx1RkYwOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTYzQlx1NTg1RSBvbmxvYWRcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9jYWxTZXJ2ZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSB0aGlzLmxvY2FsU2VydmVyLmdldFVybCgpO1xuICAgICAgICB0aGlzLmxvY2FsU2VydmVyLnNldFZhdWx0QmFzZVBhdGgodmF1bHRCYXNlUGF0aCk7XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5QyB3ZWJhcHAgXHU1REYyXHU1QzMxXHU3RUVBXHVGRjBDXHU3NkY0XHU2M0E1XHU2ODA3XHU4QkIwXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHdlYmFwcEluZGV4UGF0aCkpIHtcbiAgICAgICAgICB0aGlzLndlYmFwcFJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBGYWlsZWQgdG8gc3RhcnQgbG9jYWwgc2VydmVyOicsIGUpO1xuICAgICAgICBuZXcgTm90aWNlKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjcyQ1x1NTczMFx1NjcwRFx1NTJBMVx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTBFOFx1NTIwNlx1NTI5Rlx1ODBGRFx1RkYwOFx1NzY3RFx1NTY2QVx1OTdGM1x1MzAwMVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1RkYwOVx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1NzUyOCcsIDApO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTcyNDhcdTY3MkNcdThEREZcdThFMkEgJiB3ZWJhcHAgXHU0RTBCXHU4RjdEXHU2NTNFXHU1MjMwXHU1NDBFXHU1M0YwXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFIG9ubG9hZCBcdThGRDRcdTU2REVcbiAgICAgIHNldHVwV2ViYXBwSW5CYWNrZ3JvdW5kLmNhbGwodGhpcywgd2ViYXBwRGlyLCBwbHVnaW5EaXIsIHZhdWx0QmFzZVBhdGgsIHRoaXMubWFuaWZlc3QudmVyc2lvbik7XG4gICAgfVxuXG4gICAgLy8gXHU2Q0U4XHU1MThDIFZpZXdcbiAgICB0aGlzLnJlZ2lzdGVyVmlldyhWSUVXX1RZUEVfREFJTFlfUkVWSUVXLCAobGVhZjogV29ya3NwYWNlTGVhZikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYWlseVJldmlld1ZpZXcobGVhZiwgdGhpcy5zZXJ2ZXJVcmwsIHRoaXMsIHRoaXMuc2V0dGluZ3MsICgpID0+IHRoaXMuc2F2ZVNldHRpbmdzKCkpO1xuICAgIH0pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU1NDdEXHU0RUU0XG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1kYWlseS1yZXZpZXcnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NEVDQVx1NjVFNVx1NTkwRFx1NzZEOCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXByZXYtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTUyNERcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCduYXY6cHJldkRheScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtbmV4dC1kYXknLFxuICAgICAgbmFtZTogJ1x1NTQwRVx1NEUwMFx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9JZnJhbWUoJ25hdjpuZXh0RGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS10b2RheScsXG4gICAgICBuYW1lOiAnXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnbmF2OnRvZGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLXN0YXRzJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTdFREZcdThCQTFcdTUyMDZcdTY3OTAnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvSWZyYW1lKCdhY3Rpb246b3BlblN0YXRzJyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLXNldHRpbmdzLWluLWFwcCcsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb0lmcmFtZSgnYWN0aW9uOm9wZW5TZXR0aW5ncycpLFxuICAgIH0pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBQbHVnaW5TZXR0aW5ncyh0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgLy8gXHU2REZCXHU1MkEwXHU1REU2XHU0RkE3IFJpYmJvbiBcdTU2RkVcdTY4MDdcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oJ2xlYWYnLCAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJywgKCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLmFjdGl2YXRlVmlldygpO1xuICAgIH0pO1xuICB9XG5cbiAgb251bmxvYWQoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UucmVzdG9yZURlZmF1bHRzKCk7XG4gICAgdm9pZCB0aGlzLmxvY2FsU2VydmVyPy5zdG9wKCk7XG4gICAgdGhpcy5sb2NhbFNlcnZlciA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RkMwXHU2RDNCXHU2MjE2XHU1MjFCXHU1RUZBXHU1OTBEXHU3NkQ4XHU4OUM2XHU1NkZFICovXG4gIGFzeW5jIGFjdGl2YXRlVmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG5cbiAgICBsZXQgbGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG5cbiAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFx1NURGMlx1NjcwOVx1ODlDNlx1NTZGRVx1RkYwQ1x1NzZGNFx1NjNBNVx1ODA1QVx1NzEyNlxuICAgICAgbGVhZiA9IGxlYXZlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NUIwXHU4OUM2XHU1NkZFXG4gICAgICBsZWFmID0gd29ya3NwYWNlLmdldExlYWYoZmFsc2UpO1xuICAgICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoe1xuICAgICAgICB0eXBlOiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobGVhZikge1xuICAgICAgYXdhaXQgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU1QkZDXHU4MjJBL1x1NjRDRFx1NEY1Q1x1NjMwN1x1NEVFNCAqL1xuICBwcml2YXRlIHNlbmRUb0lmcmFtZSh0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgIGlmIChsZWF2ZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCB2aWV3ID0gbGVhdmVzWzBdLnZpZXcgYXMgRGFpbHlSZXZpZXdWaWV3O1xuICAgIGNvbnN0IGlmcmFtZSA9ICh2aWV3IGFzIHVua25vd24gYXMgeyBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCB9KS5pZnJhbWU7XG4gICAgaWYgKGlmcmFtZT8uY29udGVudFdpbmRvdykge1xuICAgICAgbGV0IG9yaWdpbiA9ICcqJztcbiAgICAgIHRyeSB7IG9yaWdpbiA9IG5ldyBVUkwoaWZyYW1lLnNyYykub3JpZ2luOyB9IGNhdGNoIHsgLyoga2VlcCAnKicgKi8gfVxuICAgICAgaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICAgIHsgdHlwZSwgaWQ6ICdjbWRfJyArIERhdGUubm93KCkgfSxcbiAgICAgICAgb3JpZ2luXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpIGFzIEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICB9XG5cbiAgLyoqIFx1NEZERFx1NUI1OFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBzYXZlU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEl0ZW1WaWV3LCBXb3Jrc3BhY2VMZWFmLCBFdmVudFJlZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IFN0b3JhZ2VCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvU3RvcmFnZUJyaWRnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5pbXBvcnQgeyBCcmlkZ2VTZXJ2aWNlIH0gZnJvbSAnLi4vYnJpZGdlL0JyaWRnZVNlcnZpY2UnO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuZXhwb3J0IGNvbnN0IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgPSAnYmFtYm9vLWltbW9ydGFscyc7XG5cbi8qKlxuICogRGFpbHlSZXZpZXdWaWV3IC0gXHU0RTNCXHU4OUM2XHU1NkZFXG4gKlxuICogXHU4MDRDXHU4RDIzXHU2NzgxXHU3QjgwXHVGRjFBXG4gKiAxLiBcdTUyMUJcdTVFRkEgaWZyYW1lIFx1NjI3Rlx1OEY3RCBQV0FcbiAqIDIuIFx1N0JBMVx1NzQwNiBCcmlkZ2VTZXJ2aWNlIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICogMy4gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NUU3Nlx1NTQwQ1x1NkI2NVxuICovXG5leHBvcnQgY2xhc3MgRGFpbHlSZXZpZXdWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuICBwcml2YXRlIGJyaWRnZVNlcnZpY2U6IEJyaWRnZVNlcnZpY2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lRXJyb3JIYW5kbGVyOiAoKGU6IEV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGtleWRvd25Gb3J3YXJkZXI6ICgoZTogS2V5Ym9hcmRFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfY2hlY2tJbnRlcnZhbDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3NzQ2hhbmdlUmVmOiBFdmVudFJlZiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHdlYmFwcFBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIHByaXZhdGUgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgd2ViYXBwUGF0aDogc3RyaW5nLCBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbiwgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLCBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihsZWFmKTtcbiAgICB0aGlzLndlYmFwcFBhdGggPSB3ZWJhcHBQYXRoO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgfVxuXG4gIGdldFZpZXdUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVc7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJztcbiAgfVxuXG4gIGdldEljb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2xlYWYnO1xuICB9XG5cbiAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgPSB0aGlzLmNvbnRhaW5lckVsLmNoaWxkcmVuWzFdIGFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgIGNvbnRhaW5lci5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1jb250YWluZXInKTtcblxuICAgIGlmICghdGhpcy53ZWJhcHBQYXRoKSB7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2NUUwXHU2Q0Q1XHU1QjlBXHU0RjREIHdlYmFwcCBcdThENDRcdTZFOTBcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdTYzRDJcdTRFRjZcdTVCODlcdTg4QzVcdTc2RUVcdTVGNTUnLFxuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWVycm9yJyxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHdlYmFwcCBcdTVDMUFcdTY3MkFcdTVDMzFcdTdFRUFcdTY1RjZcdTY2M0VcdTc5M0EgbG9hZGluZyBcdTUzNjBcdTRGNERcdUZGMENcdTU0MEVcdTUzRjBcdTVGMDJcdTZCNjVcdTYyQzlcdTUzMDVcdTg5RTNcdTUzMDVcbiAgICBpZiAoIXRoaXMucGx1Z2luLndlYmFwcFJlYWR5KSB7XG4gICAgICBjb25zdCBzdGF0dXNFbCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiAnXHU2QjYzXHU1NzI4XHU1MjFEXHU1OUNCXHU1MzE2XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHUyMDI2JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1sb2FkaW5nJyxcbiAgICAgIH0pO1xuICAgICAgLy8gXHU4RjZFXHU4QkUyXHU3QjQ5XHU1Rjg1XHU1QzMxXHU3RUVBXHU1NDBFXHU1MkEwXHU4RjdEIGlmcmFtZVxuICAgICAgbGV0IHRpY2tzID0gMDtcbiAgICAgIHRoaXMuX2NoZWNrSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICB0aWNrcysrO1xuICAgICAgICBpZiAodGhpcy5wbHVnaW4ud2ViYXBwUmVhZHkpIHtcbiAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLl9jaGVja0ludGVydmFsISk7XG4gICAgICAgICAgdGhpcy5fY2hlY2tJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgICAgdm9pZCB0aGlzLnNldHVwSWZyYW1lKGNvbnRhaW5lcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIDMwIFx1NzlEMlx1NTQwRVx1NjNEMFx1NzkzQVx1N0Y1MVx1N0VEQ1x1OEY4M1x1NjE2MlxuICAgICAgICBpZiAodGlja3MgPT09IDYwKSB7XG4gICAgICAgICAgc3RhdHVzRWwuc2V0VGV4dCgnXHU2QjYzXHU1NzI4XHU0RTBCXHU4RjdEXHU4RDQ0XHU2RTkwXHU1MzA1XHVGRjBDXHU3RjUxXHU3RURDXHU4RjgzXHU2MTYyXHU4QkY3XHU3QTBEXHU1MDE5XHUyMDI2Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMTIwIFx1NzlEMlx1NTQwRVx1NjNEMFx1NzkzQVx1NTNFRlx1ODBGRFx1NTkzMVx1OEQyNVxuICAgICAgICBpZiAodGlja3MgPT09IDI0MCkge1xuICAgICAgICAgIHN0YXR1c0VsLnNldFRleHQoJ1x1OEQ0NFx1NkU5MFx1NTMwNVx1NEUwQlx1OEY3RFx1NUYwMlx1NUUzOFx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNVx1N0Y1MVx1N0VEQ1x1NTQwRVx1OTFDRFx1NTQyRiBPYnNpZGlhbicpO1xuICAgICAgICB9XG4gICAgICB9LCA1MDApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuc2V0dXBJZnJhbWUoY29udGFpbmVyKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2V0dXBJZnJhbWUoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTIxQlx1NUVGQSBpZnJhbWUgLSBcdTRFMERcdTRGN0ZcdTc1Mjggc2FuZGJveFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTYzQlx1NkI2MiBhcHA6Ly8gXHU1MzRGXHU4QkFFXHU0RTBCXHU3Njg0XHU1QjUwXHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXG4gICAgdGhpcy5pZnJhbWUgPSBjb250YWluZXIuY3JlYXRlRWwoJ2lmcmFtZScsIHtcbiAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZnJhbWUnLFxuICAgICAgYXR0cjoge1xuICAgICAgICBzcmM6IHRoaXMud2ViYXBwUGF0aCxcbiAgICAgICAgYWxsb3c6ICdjYW1lcmE7IG1pY3JvcGhvbmU7IGNsaXBib2FyZC1yZWFkOyBjbGlwYm9hcmQtd3JpdGUnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIGlmcmFtZSBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjVcdTY1RjZcdTY2M0VcdTc5M0FcdTYzRDBcdTc5M0FcbiAgICB0aGlzLmlmcmFtZUVycm9ySGFuZGxlciA9IChfZTogRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIGlmcmFtZSBmYWlsZWQgdG8gbG9hZDonLCB0aGlzLndlYmFwcFBhdGgpO1xuICAgIH07XG4gICAgdGhpcy5pZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLmlmcmFtZUVycm9ySGFuZGxlcik7XG5cbiAgICAvLyBcdTVGNTMgaWZyYW1lIFx1NTkwNFx1NEU4RVx1NzEyNlx1NzBCOVx1NjVGNlx1RkYwQ1x1NUMwNiBDdHJsL0NtZCBcdTVGRUJcdTYzNzdcdTk1MkVcdThGNkNcdTUzRDFcdTdFRDkgT2JzaWRpYW5cdUZGMENcbiAgICAvLyBcdTc4NkVcdTRGRERcdTU0N0RcdTRFRTRcdTk3NjJcdTY3N0ZcdUZGMDhDdHJsL0NtZCtQXHVGRjA5XHUzMDAxXHU1RkVCXHU5MDFGXHU1MjA3XHU2MzYyXHVGRjA4Q3RybC9DbWQrT1x1RkYwOVx1N0I0OVx1NTE2OFx1NUM0MFx1NUZFQlx1NjM3N1x1OTUyRVx1NEVDRFx1NzEzNlx1NTNFRlx1NzUyOFxuICAgIGNvbnN0IG9ic2lkaWFuRG9jID0gYWN0aXZlRG9jdW1lbnQ7XG4gICAgbGV0IGZvcndhcmRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmtleWRvd25Gb3J3YXJkZXIgPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGZvcndhcmRpbmcpIHJldHVybjtcbiAgICAgIGlmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSB7XG4gICAgICAgIGZvcndhcmRpbmcgPSB0cnVlO1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgS2V5Ym9hcmRFdmVudCgna2V5ZG93bicsIHtcbiAgICAgICAgICBrZXk6IGUua2V5LFxuICAgICAgICAgIGNvZGU6IGUuY29kZSxcbiAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgbWV0YUtleTogZS5tZXRhS2V5LFxuICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgIGFsdEtleTogZS5hbHRLZXksXG4gICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgb2JzaWRpYW5Eb2MuYm9keS5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgICAgIGZvcndhcmRpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFjdGl2ZURvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd25Gb3J3YXJkZXIsIHRydWUpO1xuXG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2XHU2ODY1XHU2M0E1XHU2NzBEXHU1MkExXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGF3YWl0IHN0b3JhZ2UuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICBjb25zdCBzdG9yYWdlQnJpZGdlID0gbmV3IFN0b3JhZ2VCcmlkZ2Uoc3RvcmFnZSwgdGhpcy5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBuZXcgVGhlbWVCcmlkZ2UoKTtcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2UgPSBuZXcgQnJpZGdlU2VydmljZShcbiAgICAgIHN0b3JhZ2VCcmlkZ2UsXG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzXG4gICAgKTtcblxuICAgIC8vIFx1NjI2Qlx1NjNDRiBWYXVsdCBcdTRFMkRcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcbiAgICBjb25zdCBjdXN0b21UaGVtZXMgPSBhd2FpdCB0aGlzLl9zY2FuQ3VzdG9tVGhlbWVzKCk7XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldEN1c3RvbVRoZW1lcyhjdXN0b21UaGVtZXMpO1xuXG4gICAgLy8gXHU0RjIwXHU5MDEyXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHVGRjA4XHU0RjlCXHU3NjdEXHU1NjZBXHU5N0YzXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2MjZCXHU2M0NGL1x1OEJGQlx1NTNENlx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIGNvbnN0IHZhdWx0QmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyB1bmtub3duIGFzIHsgYmFzZVBhdGg6IHN0cmluZyB9KS5iYXNlUGF0aCB8fCAnJztcbiAgICBpZiAodmF1bHRCYXNlUGF0aCkge1xuICAgICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldFZhdWx0QmFzZVBhdGgodmF1bHRCYXNlUGF0aCk7XG4gICAgfVxuICAgIC8vIFx1NkNFOFx1NTE2NSBWYXVsdCBBZGFwdGVyXHVGRjBDXHU3NTI4XHU0RThFIFZhdWx0IEFQSSBcdTY2RkZcdTRFRTMgZnMgXHU4RkRCXHU4ODRDXHU2NTg3XHU0RUY2XHU2MjZCXHU2M0NGL1x1OUE4Q1x1OEJDMVxuICAgIHRoaXMuYnJpZGdlU2VydmljZS5zZXRWYXVsdEFkYXB0ZXIodGhpcy5hcHAudmF1bHQuYWRhcHRlcik7XG4gICAgLy8gXHU0RjIwXHU5MDEyXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKSB7XG4gICAgICB0aGlzLmJyaWRnZVNlcnZpY2Uuc2V0Tm9pc2VQYXRoKHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoKTtcbiAgICB9XG4gICAgLy8gXHU0RjIwXHU5MDEyIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1NjUyRlx1NjMwMVx1NzUyOFx1NjIzN1x1ODFFQVx1NUI5QVx1NEU0OSAub2JzaWRpYW4gXHU1NDBEXHU3OUYwXHVGRjA5XG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLnNldENvbmZpZ0Rpcih0aGlzLmFwcC52YXVsdC5jb25maWdEaXIpO1xuXG4gICAgdGhpcy5icmlkZ2VTZXJ2aWNlLmF0dGFjaCh0aGlzLmlmcmFtZSk7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUodGhpcy5pZnJhbWUpO1xuXG4gICAgLy8gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1RkYwOFx1NTQyQlx1NjEwRlx1NTg4M1x1OTE0RFx1ODI3Mlx1NTIwN1x1NjM2Mlx1RkYwOVxuICAgIC8vIFx1NUYwMFx1NTQyRlx1MzAwQ1x1OERERlx1OTY4RiBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTkxNERcdTgyNzJcdTMwMERcdTY1RjZcdUZGMENcdTYyOEFcdTRFM0JcdTk4OThcdTVGM0FcdThDMDNcdTgyNzJcdTUzQ0RcdTYzQThcdTc2ODRcdTgyNzJcdTc2RjhcdTRFMDBcdTVFNzZcdTYzQThcdTdFRDkgaWZyYW1lXG4gICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSB0aGlzLmFwcC53b3Jrc3BhY2Uub24oJ2Nzcy1jaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlPy5vblRoZW1lQ2hhbmdlZCh0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgb25DbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdThGNkVcdThCRTIgaW50ZXJ2YWxcbiAgICBpZiAodGhpcy5fY2hlY2tJbnRlcnZhbCAhPT0gbnVsbCkge1xuICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5fY2hlY2tJbnRlcnZhbCk7XG4gICAgICB0aGlzLl9jaGVja0ludGVydmFsID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTY4NjVcdTYzQTVcdTY3MERcdTUyQTFcbiAgICB0aGlzLmJyaWRnZVNlcnZpY2U/LmRldGFjaCgpO1xuICAgIHRoaXMuYnJpZGdlU2VydmljZSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFM0JcdTk4OThcdTc2RDFcdTU0MkNcbiAgICBpZiAodGhpcy5jc3NDaGFuZ2VSZWYpIHtcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vZmZyZWYodGhpcy5jc3NDaGFuZ2VSZWYpO1xuICAgICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMudGhlbWVCcmlkZ2U/LmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGlmcmFtZSBlcnJvciBcdTc2RDFcdTU0MkNcdTU2NjhcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIpO1xuICAgICAgdGhpcy5pZnJhbWVFcnJvckhhbmRsZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1OTUyRVx1NzZEOFx1OEY2Q1x1NTNEMVx1NTY2OFxuICAgIGlmICh0aGlzLmtleWRvd25Gb3J3YXJkZXIpIHtcbiAgICAgIGFjdGl2ZURvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd25Gb3J3YXJkZXIsIHRydWUpO1xuICAgICAgdGhpcy5rZXlkb3duRm9yd2FyZGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgaWZyYW1lXG4gICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUyRFx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHVGRjA4XHU5MDFBXHU4RkM3IFZhdWx0IEFQSVx1RkYwQ1x1NEUwRFx1N0VDRlx1OEZDNyBmc1x1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIF9zY2FuQ3VzdG9tVGhlbWVzKCk6IFByb21pc2U8QXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRoZW1lRGlyTmFtZSA9IHRoaXMuc2V0dGluZ3MudGhlbWVQYXRoIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuXG4gICAgICBsZXQgdGhlbWVEaXJGaWxlczogc3RyaW5nW107XG4gICAgICB0cnkge1xuICAgICAgICB0aGVtZURpckZpbGVzID0gKGF3YWl0IGFkYXB0ZXIubGlzdCh0aGVtZURpck5hbWUpKS5maWxlcztcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gdGhlbWVzOyAvLyBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdTYyMTZcdTRFMERcdTUzRUZcdThCRkJcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGVtZURpckZpbGVzKSB7XG4gICAgICAgIGlmICghZW50cnkuZW5kc1dpdGgoJy5qcycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBgJHt0aGVtZURpck5hbWV9LyR7ZW50cnl9YDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb2RlOiBzdHJpbmcgPSBhd2FpdCBhZGFwdGVyLnJlYWQoZmlsZVBhdGgpO1xuICAgICAgICAgIC8vIFx1NUZFQlx1OTAxRlx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NTMwNVx1NTQyQlx1NUZDNVx1OTcwMFx1NzY4NCBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XG4gICAgICAgICAgaWYgKCFjb2RlLmluY2x1ZGVzKCdfX2JhbWJvb190aGVtZV8nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU3RjNBXHU1QzExIF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcdUZGMENcdTVERjJcdThERjNcdThGQzdgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGVtZXMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBlbnRyeS5yZXBsYWNlKC9cXC5qcyQvLCAnJyksXG4gICAgICAgICAgICBjb2RlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgICAgIGNvbnN0IG1zZyA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQmFtYm9vUmV2aWV3XSBcdThCRkJcdTUzRDZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU1OTMxXHU4RDI1OmAsIG1zZyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoZW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYFtCYW1ib29SZXZpZXddIFx1NTNEMVx1NzNCMCAke3RoZW1lcy5sZW5ndGh9IFx1NEUyQVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5ODpgLCB0aGVtZXMubWFwKHQgPT4gdC5uYW1lKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICBjb25zdCBtc2cgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICBjb25zb2xlLmRlYnVnKCdbQmFtYm9vUmV2aWV3XSBcdTYyNkJcdTYzQ0ZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTY1RjZcdTUxRkFcdTk1MTk6JywgbXNnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhlbWVzO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBub3JtYWxpemVQYXRoLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEltcG9ydFZhbGlkYXRvciB9IGZyb20gJy4vSW1wb3J0VmFsaWRhdG9yJztcbmltcG9ydCB0eXBlIHtcbiAgRGF5RGF0YSxcbiAgR29hbEl0ZW0sXG4gIEFwcFNldHRpbmdzLFxuICBQdXJjaGFzZUhpc3RvcnksXG4gIEluY29tZUhpc3RvcnksXG4gIEV4cG9ydFNoYXBlLFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuLyoqXG4gKiBWYXVsdFN0b3JhZ2UgLSBcdTVDMDFcdTg4QzUgT2JzaWRpYW4gVmF1bHQgYWRhcHRlciBcdTc2ODRcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcbiAqXG4gKiBWYXVsdCBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODQ6XG4gKiAgIHtiYXNlUGF0aH0vXG4gKiAgICAgZGF0YS8gICAgICAgICAgLT4gXHU2QkNGXHU2NUU1IEpTT04gXHU2NTcwXHU2MzZFXG4gKiAgICAgZ29hbHMuanNvbiAgICAgLT4gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3XG4gKiAgICAgc2V0dGluZ3MuanNvbiAgLT4gXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFXG4gKiAgICAgdGhlbWVzLyAgICAgICAgLT4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmVwb3J0cy8gICAgICAgLT4gXHU2MkE1XHU1NDRBIChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmV2aWV3cy8gICAgICAgLT4gTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cbmV4cG9ydCBjbGFzcyBWYXVsdFN0b3JhZ2Uge1xuICBwcml2YXRlIGFwcDogQXBwO1xuICBwcml2YXRlIGJhc2VQYXRoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGJhc2VQYXRoID0gJ2JhbWJvby1yZXZpZXcnKSB7XG4gICAgdGhpcy5hcHAgPSBhcHA7XG4gICAgdGhpcy5iYXNlUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYmFzZVBhdGgpO1xuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOCAqL1xuICBwcml2YXRlIGFzeW5jIGVuc3VyZURpcihkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9LyR7ZGlyfWApO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2RpcihwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU1N0ZBXHU3ODQwXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0XHU1QjU4XHU1NzI4ICovXG4gIGFzeW5jIGVuc3VyZVN0cnVjdHVyZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIodGhpcy5iYXNlUGF0aCk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUzOUZcdTVCNTBcdTY1QjlcdTVGMEZcdTUxOTlcdTUxNjUgdmF1bHQgXHU2NTg3XHU0RUY2XHVGRjA4XHU2NkZGXHU0RUUzIGFkYXB0ZXIud3JpdGVcdUZGMDlcdTMwMDJcbiAgICogLSBcdTY1ODdcdTRFRjZcdTVERjJcdTU3MjggdmF1bHQgXHU3RjEzXHU1QjU4IFx1MjE5MiB2YXVsdC5wcm9jZXNzXHVGRjA4XHU1MzlGXHU1QjUwXHU2NkY0XHU2NUIwXHVGRjBDXHU5MDdGXHU1MTREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXHVGRjA5XG4gICAqIC0gXHU2NUIwXHU2NTg3XHU0RUY2IFx1MjE5MiB2YXVsdC5jcmVhdGVcdUZGMDhcdTU0MENcdTY1RjZcdTUxOTlcdTUxNjVcdTc4QzFcdTc2RDhcdTU0OEMgT2JzaWRpYW4gXHU3RjEzXHU1QjU4XHVGRjA5XG4gICAqIC0gXHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHVGRjA4XHU3OEMxXHU3NkQ4XHU2NzA5XHU0RjQ2XHU3RjEzXHU1QjU4XHU2NUUwXHVGRjA5XHUyMTkyIGFkYXB0ZXIucmVtb3ZlICsgdmF1bHQuY3JlYXRlXHVGRjA4XHU4RkMxXHU3OUZCXHU4RkRCXHU3RjEzXHU1QjU4XHVGRjA5XG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHZhdWx0V3JpdGUocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplUGF0aChwYXRoKTtcbiAgICBjb25zdCBhYnN0cmFjdCA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChub3JtYWxpemVkKTtcblxuICAgIGlmIChhYnN0cmFjdCBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoKSA9PiBjb250ZW50KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnRQYXRoID0gbm9ybWFsaXplZC5zdWJzdHJpbmcoMCwgbm9ybWFsaXplZC5sYXN0SW5kZXhPZignLycpKTtcbiAgICBpZiAocGFyZW50UGF0aCAmJiAhKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhcmVudFBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2RpcihwYXJlbnRQYXRoKTtcbiAgICB9XG5cbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMobm9ybWFsaXplZCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKG5vcm1hbGl6ZWQpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShub3JtYWxpemVkLCBjb250ZW50KTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2QkNGXHU2NUU1XHU2NTcwXHU2MzZFIChkYXlzKSAtLS0tXG5cbiAgcHJpdmF0ZSBkYXlQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YS8ke2RhdGVLZXl9Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldERheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPERheURhdGEgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgRGF5RGF0YTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1RkYwQ1x1NUMwNlx1OERGM1x1OEZDNzogJHtwYXRofWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsRGF5cygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIERheURhdGE+PiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4gPSB7fTtcblxuICAgIGNvbnN0IHJlYWRzID0gZmlsZXMuZmlsZXNcbiAgICAgIC5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuanNvbicpKVxuICAgICAgLm1hcChhc3luYyAoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKCFkYXRlS2V5KSByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKGZpbGUpO1xuICAgICAgICAgIGRheXNbZGF0ZUtleV0gPSBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIERheURhdGE7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwYXJzZSBkYXkgZmlsZTogJHtmaWxlfWAsIGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlYWRzKTtcbiAgICByZXR1cm4gZGF5cztcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTY1RTVcdTY3MUYga2V5XHVGRjA4XHU2MzA5XHU2NUU1XHU2NzFGXHU5NjREXHU1RThGXHVGRjBDXHU2NzAwXHU2NUIwXHU1NzI4XHU1MjREXHVGRjA5ICovXG4gIGFzeW5jIGdldERheUtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKGRhdGVLZXkpIGtleXMucHVzaChkYXRlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAga2V5cy5zb3J0KCkucmV2ZXJzZSgpOyAvLyBcdTk2NERcdTVFOEZcdUZGMUFcdTY3MDBcdTY1QjBcdTY1RTVcdTY3MUZcdTU3MjhcdTUyNERcbiAgICByZXR1cm4ga2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMDZcdTk4NzVcdTUyQTBcdThGN0RcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcbiAgICogQHBhcmFtIHBhZ2UgXHU5ODc1XHU3ODAxXHVGRjA4XHU0RUNFIDAgXHU1RjAwXHU1OUNCXHVGRjA5XG4gICAqIEBwYXJhbSBwYWdlU2l6ZSBcdTZCQ0ZcdTk4NzVcdTY1NzBcdTkxQ0ZcbiAgICogQHJldHVybnMgeyBkYXlzLCB0b3RhbCwgcGFnZSwgcGFnZVNpemUsIGhhc01vcmUgfVxuICAgKi9cbiAgYXN5bmMgZ2V0RGF5c1BhZ2luYXRlZChwYWdlID0gMCwgcGFnZVNpemUgPSAzMCk6IFByb21pc2U8e1xuICAgIGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICAgIGtleXM6IHN0cmluZ1tdO1xuICAgIHRvdGFsOiBudW1iZXI7XG4gICAgcGFnZTogbnVtYmVyO1xuICAgIHBhZ2VTaXplOiBudW1iZXI7XG4gICAgaGFzTW9yZTogYm9vbGVhbjtcbiAgfT4ge1xuICAgIGNvbnN0IGFsbEtleXMgPSBhd2FpdCB0aGlzLmdldERheUtleXMoKTtcbiAgICBjb25zdCB0b3RhbCA9IGFsbEtleXMubGVuZ3RoO1xuICAgIGNvbnN0IHN0YXJ0ID0gcGFnZSAqIHBhZ2VTaXplO1xuICAgIGNvbnN0IHBhZ2VLZXlzID0gYWxsS2V5cy5zbGljZShzdGFydCwgc3RhcnQgKyBwYWdlU2l6ZSk7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4gPSB7fTtcblxuICAgIGNvbnN0IHJlYWRzID0gcGFnZUtleXMubWFwKGFzeW5jIChkYXRlS2V5KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXREYXkoZGF0ZUtleSk7XG4gICAgICAgIGlmIChkYXRhKSBkYXlzW2RhdGVLZXldID0gZGF0YTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gbG9hZCBkYXk6ICR7ZGF0ZUtleX1gLCBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5cyxcbiAgICAgIGtleXM6IHBhZ2VLZXlzLFxuICAgICAgdG90YWwsXG4gICAgICBwYWdlLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBoYXNNb3JlOiBzdGFydCArIHBhZ2VLZXlzLmxlbmd0aCA8IHRvdGFsLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBwdXREYXkoZGF5RGF0YTogRGF5RGF0YSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0ZUtleSA9IGRheURhdGEuZGF0ZTtcbiAgICBpZiAoIWRhdGVLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF5RGF0YSBtdXN0IGhhdmUgYSBkYXRlIGZpZWxkJyk7XG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRheURhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZURheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDcgKGdvYWxzKSAtLS0tXG5cbiAgcHJpdmF0ZSBnb2Fsc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9nb2Fscy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRHb2FscygpOiBQcm9taXNlPEdvYWxJdGVtW10+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEdvYWxJdGVtW107XG4gIH1cblxuICBhc3luYyBwdXRHb2Fscyhnb2FsczogR29hbEl0ZW1bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShnb2FscywgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdThCQkVcdTdGNkUgKHNldHRpbmdzKSAtLS0tXG5cbiAgcHJpdmF0ZSBzZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9zZXR0aW5ncy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRTZXR0aW5nKGtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCB0aGlzLmdldEFsbFNldHRpbmdzKCk7XG4gICAgcmV0dXJuIHNldHRpbmdzW2tleV0gPz8gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHB1dFNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgodGhpcy5zZXR0aW5nc1BhdGgoKSk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgLy8gdmF1bHQucHJvY2VzcyBcdTUzOUZcdTVCNTAgcmVhZC1tb2RpZnktd3JpdGVcdUZGMENcdTY3NUNcdTdFRERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IEpTT04ucGFyc2UoZGF0YSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIHNldHRpbmdzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoeyBba2V5XTogdmFsdWUgfSwgbnVsbCwgMikpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbFNldHRpbmdzKCk6IFByb21pc2U8QXBwU2V0dGluZ3M+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEFwcFNldHRpbmdzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU4RDJEXHU0RTcwXHU1Mzg2XHU1M0YyIChwdXJjaGFzZS1oaXN0b3J5Lmpzb24pIC0tLS1cblxuICBwcml2YXRlIHB1cmNoYXNlSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9wdXJjaGFzZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFB1cmNoYXNlSGlzdG9yeSgpOiBQcm9taXNlPFB1cmNoYXNlSGlzdG9yeSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIFB1cmNoYXNlSGlzdG9yeTtcbiAgfVxuXG4gIGFzeW5jIHB1dFB1cmNoYXNlSGlzdG9yeShkYXRhOiBQdXJjaGFzZUhpc3RvcnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyIChpbmNvbWUtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBpbmNvbWVIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2luY29tZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEluY29tZUhpc3RvcnkoKTogUHJvbWlzZTxJbmNvbWVIaXN0b3J5IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEluY29tZUhpc3Rvcnk7XG4gIH1cblxuICBhc3luYyBwdXRJbmNvbWVIaXN0b3J5KGRhdGE6IEluY29tZUhpc3RvcnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NUJGQ1x1NTFGQS9cdTVCRkNcdTUxNjUgLS0tLVxuXG4gIGFzeW5jIGV4cG9ydEFsbERhdGEoKTogUHJvbWlzZTxFeHBvcnRTaGFwZT4ge1xuICAgIGNvbnN0IFtkYXlzLCBnb2Fscywgc2V0dGluZ3MsIHB1cmNoYXNlSGlzdG9yeSwgaW5jb21lSGlzdG9yeV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmdldEFsbERheXMoKSxcbiAgICAgIHRoaXMuZ2V0R29hbHMoKSxcbiAgICAgIHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSxcbiAgICAgIHRoaXMuZ2V0UHVyY2hhc2VIaXN0b3J5KCksXG4gICAgICB0aGlzLmdldEluY29tZUhpc3RvcnkoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAnMy4wJyxcbiAgICAgIGV4cG9ydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHN0b3JhZ2VUeXBlOiAndmF1bHQnLFxuICAgICAgZGF5cyxcbiAgICAgIGdvYWxzLFxuICAgICAgc2V0dGluZ3MsXG4gICAgICBwdXJjaGFzZUhpc3RvcnksXG4gICAgICBpbmNvbWVIaXN0b3J5LFxuICAgICAgdGhlbWVzOiBbXSxcbiAgICAgIHJlcG9ydHM6IFtdLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBpbXBvcnREYXRhKGRhdGE6IHVua25vd24sIG9wdGlvbnM6IHsgc3RyYXRlZ3k/OiAnb3ZlcndyaXRlJyB8ICdtZXJnZScgfSA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgICBjb25zdCBzdHJhdGVneSA9IG9wdGlvbnMuc3RyYXRlZ3kgPz8gJ292ZXJ3cml0ZSc7XG5cbiAgICAvLyBQMlx1RkYxQVx1NUJGQ1x1NTE2NVx1NTI0RFx1NjgyMVx1OUE4QyArIFx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1RkYxQlx1NjM1Rlx1NTc0Rlx1NjU4N1x1NEVGNlx1NTcyOFx1NkI2NFx1ODhBQlx1NjJEMlx1N0VERFx1RkYwQ1x1NEUwRFx1NkM2MVx1NjdEMyBWYXVsdFxuICAgIGNvbnN0IHJlY29yZCA9IEltcG9ydFZhbGlkYXRvci52YWxpZGF0ZShkYXRhKTtcblxuICAgIGlmIChyZWNvcmQuZGF5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBcdTk2MzJcdTVGQTFcdUZGMUFkYXlzIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1N0E3QVx1NUJGOVx1OEM2MVx1ODg2OFx1NzkzQVx1NkUwNVx1N0E3QVx1NTE2OFx1OTBFOFx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwOFx1NEVDNSBvdmVyd3JpdGUgXHU4QkVEXHU0RTQ5XHU0RTBCXHU1MTQxXHU4QkI4XHVGRjA5XG4gICAgICBjb25zdCBkYXlzID0gKHJlY29yZC5kYXlzICYmIHR5cGVvZiByZWNvcmQuZGF5cyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkocmVjb3JkLmRheXMpKVxuICAgICAgICA/IHJlY29yZC5kYXlzXG4gICAgICAgIDoge307XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdvdmVyd3JpdGUnKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuY2xlYXJBbGxEYXlzKCk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGRheSBvZiBPYmplY3QudmFsdWVzKGRheXMpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucHV0RGF5KGRheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5nb2FscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBpbmNvbWluZzogR29hbEl0ZW1bXSA9IEFycmF5LmlzQXJyYXkocmVjb3JkLmdvYWxzKSA/IHJlY29yZC5nb2FscyA6IFtdO1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnbWVyZ2UnKSB7XG4gICAgICAgIC8vIFx1NTQwOFx1NUU3Nlx1RkYxQVx1NEZERFx1NzU1OVx1NzNCMFx1NjcwOVx1NzZFRVx1NjgwN1x1RkYwQ1x1NUJGQ1x1NTE2NVx1NzZFRVx1NjgwN1x1NjMwOSBpZCBcdTg5ODZcdTc2RDZcdUZGMUJcdTdBN0FcdTY1NzBcdTdFQzRcdTRFMERcdTg5RTZcdTUzRDFcdTZFMDVcdTdBN0FcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSAoYXdhaXQgdGhpcy5nZXRHb2FscygpKSB8fCBbXTtcbiAgICAgICAgY29uc3QgbWVyZ2VkID0gbmV3IE1hcChleGlzdGluZy5tYXAoKGcpID0+IFtnLmlkLCBnXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGdvYWwgb2YgaW5jb21pbmcpIHtcbiAgICAgICAgICBpZiAoZ29hbCAmJiBnb2FsLmlkKSBtZXJnZWQuc2V0KGdvYWwuaWQsIGdvYWwpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoQXJyYXkuZnJvbShtZXJnZWQudmFsdWVzKCkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG92ZXJ3cml0ZVx1RkYxQVx1NjU3NFx1NEY1M1x1NjZGRlx1NjM2Mlx1RkYwOFx1N0E3QVx1NjU3MFx1N0VDNCA9IFx1NkUwNVx1N0E3QVx1RkYwQ1x1N0IyNlx1NTQwOFx1OTg4NFx1NjcxRlx1OEJFRFx1NEU0OVx1RkYwOVxuICAgICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKGluY29taW5nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLnNldHRpbmdzICE9PSB1bmRlZmluZWQgJiYgcmVjb3JkLnNldHRpbmdzICYmIHR5cGVvZiByZWNvcmQuc2V0dGluZ3MgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCBpbmNvbWluZyA9IHJlY29yZC5zZXR0aW5ncztcbiAgICAgIGxldCB0b1dyaXRlOiBBcHBTZXR0aW5ncztcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ21lcmdlJykge1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IChhd2FpdCB0aGlzLmdldEFsbFNldHRpbmdzKCkpIHx8IHt9O1xuICAgICAgICB0b1dyaXRlID0geyAuLi5leGlzdGluZywgLi4uaW5jb21pbmcgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvV3JpdGUgPSBpbmNvbWluZztcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZSh0aGlzLnNldHRpbmdzUGF0aCgpLCBKU09OLnN0cmluZ2lmeSh0b1dyaXRlLCBudWxsLCAyKSk7XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5wdXJjaGFzZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRQdXJjaGFzZUhpc3RvcnkocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQuaW5jb21lSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEluY29tZUhpc3RvcnkocmVjb3JkLmluY29tZUhpc3RvcnkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTRFQzVcdTZFMDVcdTdBN0FcdTYyNDBcdTY3MDlcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMDhvdmVyd3JpdGUgXHU1QkZDXHU1MTY1IGRheXMgXHU1MjREXHU4QzAzXHU3NTI4XHVGRjBDXHU0RTBEXHU1RjcxXHU1NENEIGdvYWxzL3NldHRpbmdzXHVGRjA5ICovXG4gIGFzeW5jIGNsZWFyQWxsRGF5cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGRhdGFEaXIpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKGRhdGFEaXIsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICB9XG5cbiAgLyoqIFx1NEVDNVx1NkUwNVx1N0E3QVx1OEJCRVx1N0Y2RVx1NjU4N1x1NEVGNlx1RkYwOG92ZXJ3cml0ZSBcdTVCRkNcdTUxNjUgc2V0dGluZ3MgXHU1MjREXHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIGFzeW5jIGNsZWFyQWxsU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjbGVhckFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIodGhpcy5iYXNlUGF0aCwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvLyAtLS0tIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAtLS0tXG5cbiAgcHJpdmF0ZSByZXZpZXdQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcmV2aWV3cy8ke2RhdGVLZXl9Lm1kYCk7XG4gIH1cblxuICBhc3luYyB3cml0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZywgbWFya2Rvd246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgbWFya2Rvd24pO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogSW1wb3J0VmFsaWRhdG9yIC0gXHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHU3Njg0XHU2ODIxXHU5QThDXHU0RTBFXHU1QjU3XHU2QkI1XHU4ODY1XHU5RjUwXHVGRjA4XHU1QkJGXHU0RTNCXHU0RkE3XHVGRjBDXHU5NkY2XHU0RjlEXHU4RDU2XHVGRjA5XG4gKlxuICogXHU3NTI4XHU5MDE0XHVGRjFBXHU1NzI4IFZhdWx0U3RvcmFnZS5pbXBvcnREYXRhIFx1ODQzRFx1NzZEOFx1NTI0RFx1NjJFNlx1NjIyQVx1NjM1Rlx1NTc0Rlx1NjU4N1x1NEVGNlx1MzAwMVx1ODg2NVx1OUY1MFx1N0YzQVx1NTkzMVx1NUI1N1x1NkJCNVx1RkYwQ1xuICogXHU5MDdGXHU1MTREXHU1MzRBXHU2MjJBL1x1OTc1RVx1NkNENVx1NjU3MFx1NjM2RVx1NkM2MVx1NjdEMyBWYXVsdFx1MzAwMlxuICpcbiAqIFx1OEJCRVx1OEJBMVx1NTM5Rlx1NTIxOVx1RkYxQVxuICogIC0gXHU0RUM1XHU1MDVBXCJcdTdFRDNcdTY3ODRcdTVDNDJcdTk3NjJcdTc2ODRcdTVCODlcdTUxNjhcdTUxNUNcdTVFOTVcIlx1RkYwQ1x1NEUwRFx1OTFDRFx1NTE5OVx1NEUxQVx1NTJBMVx1NUI1N1x1NkJCNVx1RkYwOFx1NTk4MiBtZXRyaWNzIFx1NzY4NFx1NTE3N1x1NEY1M1x1NjU3MFx1NTAzQ1x1RkYwOVx1MzAwMlxuICogIC0gXHU1QjU3XHU2QkI1XHU4ODY1XHU5RjUwXHU0RjE4XHU1MTQ4XHU3NTI4XHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHU4MUVBXHU4RUFCXHU3Njg0IGtleSAvIFx1NTE4NVx1NUJCOVx1RkYwQ1x1N0YzQVx1NTkzMVx1NjVGNlx1NjI0RFx1NzUyOFx1NUI4OVx1NTE2OFx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMlxuICogIC0gXHU0RUZCXHU0RjU1XHU2NUUwXHU2Q0Q1XHU0RkVFXHU1OTBEXHU3Njg0XHU3RUQzXHU2Nzg0XHU2MDI3XHU2MzVGXHU1NzRGXHU5MEZEXHU2MjlCIEltcG9ydFZhbGlkYXRpb25FcnJvclx1RkYwQ1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjNEMFx1NzkzQVx1NzUyOFx1NjIzN1x1MzAwMlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGF5RGF0YSxcbiAgR29hbEl0ZW0sXG4gIEFwcFNldHRpbmdzLFxuICBQdXJjaGFzZUhpc3RvcnksXG4gIEluY29tZUhpc3RvcnksXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG5leHBvcnQgY2xhc3MgSW1wb3J0VmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnSW1wb3J0VmFsaWRhdGlvbkVycm9yJztcbiAgfVxufVxuXG5jb25zdCBLTk9XTl9GSUVMRFMgPSBbJ2RheXMnLCAnZ29hbHMnLCAnc2V0dGluZ3MnLCAncHVyY2hhc2VIaXN0b3J5JywgJ2luY29tZUhpc3RvcnknXSBhcyBjb25zdDtcblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZWRJbXBvcnQge1xuICBkYXlzPzogUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gIGdvYWxzPzogR29hbEl0ZW1bXTtcbiAgc2V0dGluZ3M/OiBBcHBTZXR0aW5ncztcbiAgcHVyY2hhc2VIaXN0b3J5PzogUHVyY2hhc2VIaXN0b3J5O1xuICBpbmNvbWVIaXN0b3J5PzogSW5jb21lSGlzdG9yeTtcbn1cblxuZXhwb3J0IGNvbnN0IEltcG9ydFZhbGlkYXRvciA9IHtcbiAgLyoqXG4gICAqIFx1NjgyMVx1OUE4Q1x1NUU3Nlx1ODg2NVx1OUY1MFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1MzAwMlxuICAgKiBAcmV0dXJucyBcdTg4NjVcdTlGNTBcdTU0MEVcdTc2ODRcdTVFNzJcdTUxQzBcdTY1NzBcdTYzNkVcdUZGMDhcdTdFRDNcdTY3ODRcdTRFMEVcdThGOTNcdTUxNjVcdTRFMDBcdTgxRjRcdUZGMENcdTRGNDZcdTVCNTdcdTZCQjVcdTVCOENcdTY1NzRcdUZGMDlcbiAgICogQHRocm93cyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IgXHU1RjUzXHU3RUQzXHU2Nzg0XHU2MzVGXHU1NzRGXHU2NUUwXHU2Q0Q1XHU0RkVFXHU1OTBEXHU2NUY2XG4gICAqL1xuICB2YWxpZGF0ZShkYXRhOiB1bmtub3duKTogVmFsaWRhdGVkSW1wb3J0IHtcbiAgICBpZiAoIWRhdGEgfHwgdHlwZW9mIGRhdGEgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIHRocm93IG5ldyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IoJ1x1NTkwN1x1NEVGRFx1NjU4N1x1NEVGNlx1NjgzQ1x1NUYwRlx1NjVFMFx1NjU0OFx1RkYxQVx1NjgzOVx1ODI4Mlx1NzBCOVx1NUZDNVx1OTg3Qlx1NjYyRiBKU09OIFx1NUJGOVx1OEM2MScpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZCA9IGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAvLyBcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTYyRDJcdTdFRERcdUZGMUFcdTZDQTFcdTY3MDlcdTRFRkJcdTRGNTVcdTVERjJcdTc3RTVcdTVCNTdcdTZCQjUgXHUyMTkyIFx1ODlDNlx1NEUzQVx1NjM1Rlx1NTc0Ri9cdTY1RTBcdTUxNzNcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBoYXNLbm93bkZpZWxkID0gS05PV05fRklFTERTLnNvbWUoKGYpID0+IHJlY29yZFtmXSAhPT0gdW5kZWZpbmVkKTtcbiAgICBpZiAoIWhhc0tub3duRmllbGQpIHtcbiAgICAgIHRocm93IG5ldyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IoXG4gICAgICAgICdcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcdTY1RTBcdTY1NDhcdUZGMUFcdTY3MkFcdTYyN0VcdTUyMzBcdTRFRkJcdTRGNTVcdTUzRUZcdThCQzZcdTUyMkJcdTc2ODRcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdUZGMDhkYXlzIC8gZ29hbHMgLyBzZXR0aW5ncyAvIHB1cmNoYXNlSGlzdG9yeSAvIGluY29tZUhpc3RvcnlcdUZGMDknXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdDogVmFsaWRhdGVkSW1wb3J0ID0ge307XG5cbiAgICBpZiAocmVjb3JkLmRheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmRheXMgPSBJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplRGF5cyhyZWNvcmQuZGF5cyk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQuZ29hbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmdvYWxzID0gSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZUdvYWxzKHJlY29yZC5nb2Fscyk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LnNldHRpbmdzID0gSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZVNldHRpbmdzKHJlY29yZC5zZXR0aW5ncyk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQucHVyY2hhc2VIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5wdXJjaGFzZUhpc3RvcnkgPSByZWNvcmQucHVyY2hhc2VIaXN0b3J5IGFzIFB1cmNoYXNlSGlzdG9yeTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5pbmNvbWVIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5pbmNvbWVIaXN0b3J5ID0gcmVjb3JkLmluY29tZUhpc3RvcnkgYXMgSW5jb21lSGlzdG9yeTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgZGF5c1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTk3NUVcdTVCRjlcdThDNjFcdUZGMDhcdTU5ODJcdTY1NzBcdTdFQzQvXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA5XHUyMTkyIFx1ODlDNlx1NEUzQVx1NjVFMFx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NUJGOVx1OEM2MVx1RkYwOFx1NEUwRFx1NkM2MVx1NjdEMyBWYXVsdFx1RkYwOVxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZGF5IFx1N0YzQSBkYXRlIFx1NjVGNlx1NzUyOFx1NTE3NiBrZXkgXHU4ODY1XHU5RjUwXG4gICAqICAtIFx1NkJDRlx1NEUyQSBkYXkgXHU3RjNBIG1ldHJpY3MvdGltZWxpbmUvZ29hbHMgXHU2NUY2XHU4ODY1XHU3QTdBXHU3RUQzXHU2Nzg0XG4gICAqL1xuICBub3JtYWxpemVEYXlzKGRheXM6IHVua25vd24pOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiB7XG4gICAgaWYgKCFkYXlzIHx8IHR5cGVvZiBkYXlzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRheXMpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHJhdyA9IGRheXMgYXMgUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocmF3KSkge1xuICAgICAgY29uc3QgZGF5ID0gcmF3W2tleV07XG4gICAgICBpZiAoIWRheSB8fCB0eXBlb2YgZGF5ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRheSkpIHtcbiAgICAgICAgY29udGludWU7IC8vIFx1OERGM1x1OEZDN1x1OTc1RVx1NUJGOVx1OEM2MVx1Njc2MVx1NzZFRVxuICAgICAgfVxuICAgICAgY29uc3QgY2xlYW46IERheURhdGEgPSB7IC4uLmRheSB9O1xuICAgICAgaWYgKCFjbGVhbi5kYXRlKSBjbGVhbi5kYXRlID0ga2V5OyAvLyBcdTc1Mjgga2V5IFx1ODg2NSBkYXRlXG4gICAgICBpZiAoIWNsZWFuLm1ldHJpY3MgfHwgdHlwZW9mIGNsZWFuLm1ldHJpY3MgIT09ICdvYmplY3QnKSBjbGVhbi5tZXRyaWNzID0ge307XG4gICAgICBpZiAoIWNsZWFuLnRpbWVsaW5lIHx8ICFBcnJheS5pc0FycmF5KGNsZWFuLnRpbWVsaW5lKSkgY2xlYW4udGltZWxpbmUgPSBbXTtcbiAgICAgIGlmICghY2xlYW4uZ29hbHMgfHwgIUFycmF5LmlzQXJyYXkoY2xlYW4uZ29hbHMpKSBjbGVhbi5nb2FscyA9IFtdO1xuICAgICAgb3V0W2tleV0gPSBjbGVhbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IGdvYWxzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NjU3MFx1N0VDNFx1RkYxQlx1OTc1RVx1NjU3MFx1N0VDNCBcdTIxOTIgXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gICAqICAtIFx1NkJDRlx1NEUyQSBnb2FsIFx1N0YzQSBpZCBcdTY1RjZcdTg4NjVcdTRFMDBcdTRFMkFcdTdBMzNcdTVCOUFcdTUzRUZcdTU5MERcdTczQjBcdTc2ODQgaWRcbiAgICovXG4gIG5vcm1hbGl6ZUdvYWxzKGdvYWxzOiB1bmtub3duKTogR29hbEl0ZW1bXSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGdvYWxzKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgcmV0dXJuIGdvYWxzLm1hcCgocmF3KTogR29hbEl0ZW0gPT4ge1xuICAgICAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gcmF3IGFzIEdvYWxJdGVtO1xuICAgICAgY29uc3Qgb2JqID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgY29uc3QgY2xlYW4gPSB7IC4uLm9iaiB9IGFzIHVua25vd24gYXMgR29hbEl0ZW07XG4gICAgICBpZiAoIWNsZWFuLmlkKSB7XG4gICAgICAgIGNsZWFuLmlkID0gYGdvYWxfaW1wb3J0XyR7Y291bnRlcisrfV8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfWA7XG4gICAgICB9XG4gICAgICBpZiAoY2xlYW4uaXRlbXMgJiYgIUFycmF5LmlzQXJyYXkoY2xlYW4uaXRlbXMpKSBjbGVhbi5pdGVtcyA9IFtdO1xuICAgICAgcmV0dXJuIGNsZWFuO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgc2V0dGluZ3NcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU5NzVFXHU1QkY5XHU4QzYxIFx1MjE5MiBcdThGRDRcdTU2REVcdTdBN0FcdTVCRjlcdThDNjFcbiAgICovXG4gIG5vcm1hbGl6ZVNldHRpbmdzKHNldHRpbmdzOiB1bmtub3duKTogQXBwU2V0dGluZ3Mge1xuICAgIGlmICghc2V0dGluZ3MgfHwgdHlwZW9mIHNldHRpbmdzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNldHRpbmdzKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4gc2V0dGluZ3MgYXMgQXBwU2V0dGluZ3M7XG4gIH0sXG59O1xuIiwgIi8qKlxuICogTWFya2Rvd25TeW5jIC0gXHU1QzA2IERheURhdGEgSlNPTiBcdThGNkNcdTYzNjJcdTRFM0FcdTUzRUZcdThCRkJcdTc2ODQgTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cbmltcG9ydCB0eXBlIHsgRGF5RGF0YSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25TeW5jIHtcbiAgLyoqIFx1NUMwNiBEYXlEYXRhIFx1OEY2Q1x1NjM2Mlx1NEUzQSBNYXJrZG93biAqL1xuICBzdGF0aWMgZ2VuZXJhdGVNYXJrZG93bihkYXRhOiBEYXlEYXRhKTogc3RyaW5nIHtcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIGZyb250bWF0dGVyXHVGRjA4XHU1MkE4XHU2MDAxXHU1MDNDXHU3NTI4XHU1M0NDXHU1RjE1XHU1M0Y3XHU1MzA1XHU4OEY5XHU5NjMyXHU2QjYyIFlBTUwgXHU2Q0U4XHU1MTY1XHVGRjA5XG4gICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgbGluZXMucHVzaChgZGF0ZTogXCIke2RhdGEuZGF0ZX1cImApO1xuICAgIGxpbmVzLnB1c2goYHdlZWtkYXk6IFwiJHtkYXRhLndlZWtkYXl9XCJgKTtcbiAgICBsaW5lcy5wdXNoKCd0eXBlOiBCYW1ib28gSW1tb3J0YWxzJyk7XG4gICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgbGluZXMucHVzaCgnJyk7XG5cbiAgICAvLyBcdTY4MDdcdTk4OThcbiAgICBsaW5lcy5wdXNoKGAjICR7ZGF0YS5kYXRlfSAke2RhdGEud2Vla2RheX1cdTU5MERcdTc2RDhgKTtcbiAgICBsaW5lcy5wdXNoKCcnKTtcblxuICAgIC8vIFx1NjMwN1x1NjgwN1xuICAgIGlmIChkYXRhLm1ldHJpY3MpIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIFx1NjMwN1x1NjgwNycpO1xuICAgICAgY29uc3QgbSA9IGRhdGEubWV0cmljcztcbiAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgaWYgKG0uZmlyc3RDaGVja0luKSBwYXJ0cy5wdXNoKGBcdTk5OTZcdTZCMjFcdTYyNTNcdTUzNjE6ICR7bS5maXJzdENoZWNrSW59YCk7XG4gICAgICBpZiAobS5sYXN0Q2hlY2tJbikgcGFydHMucHVzaChgXHU2NzJCXHU2QjIxXHU2MjUzXHU1MzYxOiAke20ubGFzdENoZWNrSW59YCk7XG4gICAgICBpZiAobS5jb21wbGV0ZWRUYXNrcykgcGFydHMucHVzaChgXHU1QjhDXHU2MjEwXHU0RUZCXHU1MkExOiAke20uY29tcGxldGVkVGFza3N9YCk7XG4gICAgICBpZiAobS5pbnNwaXJhdGlvbkNvdW50KSBwYXJ0cy5wdXNoKGBcdTcwNzVcdTYxMUY6ICR7bS5pbnNwaXJhdGlvbkNvdW50fWApO1xuICAgICAgaWYgKG0uYWN0aXZlVGltZSkgcGFydHMucHVzaChgXHU2RDNCXHU4REMzXHU2NUY2XHU5NTdGOiAke20uYWN0aXZlVGltZX1gKTtcbiAgICAgIGlmIChtLmVtcHR5U2xvdHMpIHBhcnRzLnB1c2goYFx1N0E3QVx1NzY3RFx1NjVGNlx1NkJCNTogJHttLmVtcHR5U2xvdHN9YCk7XG5cbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXJ0cy5zbGljZSgwLCAyKS5qb2luKCcgfCAnKX1gKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGFydHMuc2xpY2UoMikuam9pbignIHwgJyl9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgIH1cblxuICAgIC8vIFx1NjVGNlx1OTVGNFx1N0VCRlxuICAgIGlmIChkYXRhLnRpbWVsaW5lICYmIGRhdGEudGltZWxpbmUubGVuZ3RoID4gMCkge1xuICAgICAgbGluZXMucHVzaCgnIyMgXHU2NUY2XHU5NUY0XHU3RUJGJyk7XG4gICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGRhdGEudGltZWxpbmUpIHtcbiAgICAgICAgY29uc3QgaWNvbiA9IGJsb2NrLmljb24gPyBgJHtibG9jay5pY29ufSBgIDogJyc7XG4gICAgICAgIGxpbmVzLnB1c2goYCMjIyAke2ljb259JHtibG9jay5uYW1lfSAoJHtibG9jay50aW1lfSlgKTtcbiAgICAgICAgaWYgKGJsb2NrLml0ZW1zKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGJsb2NrLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBldmFsU3RyID0gaXRlbS5ldmFsID8gYCAtICR7aXRlbS5ldmFsfWAgOiAnJztcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYC0gJHtpdGVtLnRpbWV9ICR7aXRlbS50YXNrfSR7ZXZhbFN0cn1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHU3NkVFXHU2ODA3XHU4RkRCXHU1RUE2XG4gICAgaWYgKGRhdGEuZ29hbHMgJiYgZGF0YS5nb2Fscy5sZW5ndGggPiAwKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBcdTc2RUVcdTY4MDdcdThGREJcdTVFQTYnKTtcbiAgICAgIGZvciAoY29uc3QgZ29hbCBvZiBkYXRhLmdvYWxzKSB7XG4gICAgICAgIGNvbnN0IGljb24gPSBnb2FsLmljb24gPyBgJHtnb2FsLmljb259IGAgOiAnJztcbiAgICAgICAgbGluZXMucHVzaChgIyMjICR7aWNvbn0ke2dvYWwudGl0bGV9YCk7XG4gICAgICAgIGlmIChnb2FsLml0ZW1zKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGdvYWwuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnQgPSBpdGVtLnBlcmNlbnQgIT09IHVuZGVmaW5lZCA/IGAgJHtpdGVtLnBlcmNlbnR9JWAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IGRldGFpbCA9IGl0ZW0uZGV0YWlsID8gYCAoJHtpdGVtLmRldGFpbH0pYCA6ICcnO1xuICAgICAgICAgICAgbGluZXMucHVzaChgLSAke2l0ZW0ubmFtZX0ke3BlcmNlbnR9JHtkZXRhaWx9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IE1hcmtkb3duU3luYyB9IGZyb20gJy4uL3N0b3JhZ2UvTWFya2Rvd25TeW5jJztcbmltcG9ydCB0eXBlIHsgQW55QnJpZGdlTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzL21lc3NhZ2VzJztcbmltcG9ydCB0eXBlIHsgRGF5RGF0YSwgR29hbEl0ZW0sIFB1cmNoYXNlSGlzdG9yeSwgSW5jb21lSGlzdG9yeSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG4vKipcbiAqIFN0b3JhZ2VCcmlkZ2UgLSBcdTVDMDYgc3RvcmFnZToqIFx1NkQ4OFx1NjA2Rlx1NjYyMFx1NUMwNFx1NTIzMCBWYXVsdFN0b3JhZ2UgXHU2NENEXHU0RjVDXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yYWdlQnJpZGdlIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2U6IFZhdWx0U3RvcmFnZSwgZW5hYmxlTWFya2Rvd25TeW5jID0gdHJ1ZSkge1xuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgdGhpcy5lbmFibGVNYXJrZG93blN5bmMgPSBlbmFibGVNYXJrZG93blN5bmM7XG4gIH1cblxuICBhc3luYyBoYW5kbGUobWVzc2FnZTogQW55QnJpZGdlTWVzc2FnZSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3RvcmFnZS5wdXREYXkobWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgRGF5RGF0YSk7XG4gICAgICAgIC8vIFx1NTNDQ1x1NTE5OSBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlTWFya2Rvd25TeW5jICYmIG1lc3NhZ2UucGF5bG9hZC5kYXRhKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1kID0gTWFya2Rvd25TeW5jLmdlbmVyYXRlTWFya2Rvd24obWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgRGF5RGF0YSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uud3JpdGVNYXJrZG93blJldmlldyhtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSwgbWQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTWFya2Rvd24gc3luYyBmYWlsZWQ6JywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6bGlzdERheXMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbERheXMoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpkZWxldGVEYXknOiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVNYXJrZG93blJldmlldyhtZXNzYWdlLnBheWxvYWQuZGF0ZUtleSk7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlRGF5KG1lc3NhZ2UucGF5bG9hZC5kYXRlS2V5KTtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRTZXR0aW5nKG1lc3NhZ2UucGF5bG9hZC5rZXkpO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFNldHRpbmcobWVzc2FnZS5wYXlsb2FkLmtleSwgbWVzc2FnZS5wYXlsb2FkLnZhbHVlKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRBbGxTZXR0aW5ncyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsU2V0dGluZ3MoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0R29hbHMoKTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0R29hbHMobWVzc2FnZS5wYXlsb2FkLmdvYWxzIGFzIEdvYWxJdGVtW10pO1xuXG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRQdXJjaGFzZUhpc3RvcnkobWVzc2FnZS5wYXlsb2FkLmRhdGEgYXMgUHVyY2hhc2VIaXN0b3J5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRJbmNvbWVIaXN0b3J5KCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0SW5jb21lSGlzdG9yeShtZXNzYWdlLnBheWxvYWQuZGF0YSBhcyBJbmNvbWVIaXN0b3J5KTtcblxuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCc6IHtcbiAgICAgICAgY29uc3QgcGFnaW5hdGVkUGF5bG9hZCA9IG1lc3NhZ2UucGF5bG9hZCBhcyB7IHBhZ2U/OiBudW1iZXI7IHBhZ2VTaXplPzogbnVtYmVyIH07XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5c1BhZ2luYXRlZChcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2UgPz8gMCxcbiAgICAgICAgICBwYWdpbmF0ZWRQYXlsb2FkLnBhZ2VTaXplID8/IDMwXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKG1lc3NhZ2UucGF5bG9hZC5kYXRhLCBtZXNzYWdlLnBheWxvYWQub3B0aW9ucyA/PyB7fSk7XG5cbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Y2xlYXJBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyQWxsKCk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdG9yYWdlIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgfVxuICB9XG59XG4iLCAiXG4vKipcbiAqIFRoZW1lQnJpZGdlIC0gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1RkYwQ1x1NjNBOFx1OTAwMVx1NTIzMCBpZnJhbWVcbiAqICAgICAgICAgICAgICArIFx1NTNDRFx1NTQxMVx1RkYxQVx1NjNBNVx1NjUzNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1MDNDXHVGRjBDXHU2Q0U4XHU1MTY1IE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICovXG5leHBvcnQgY2xhc3MgVGhlbWVCcmlkZ2Uge1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgX3BhbGV0dGVTeW5jVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gICAgLyoqIFx1NUI1OFx1NTBBOFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHU5NTJFXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFIHJlc3RvcmVEZWZhdWx0cyBcdTZFMDVcdTc0MDYgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTkpFQ1RFRF9WQVJTID0gW1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JyxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlcicsXG4gICAgICAnLS10ZXh0LWFjY2VudCcsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknLFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknLFxuICAgICAgJy0tdGV4dC1ub3JtYWwnLFxuICAgICAgJy0tdGV4dC1tdXRlZCcsXG4gICAgXTtcblxuICAgIC8qKiBcdTk2MzJcdTYyOTZcdTdBREVcdTYwMDFcdTY4MDdcdThCQjBcdUZGMUFyZXN0b3JlRGVmYXVsdHMgXHU4OEFCXHU4QzAzXHU3NTI4XHU1NDBFXHU4QkJFXHU0RTNBIHRydWVcdUZGMENcdTk2M0JcdTZCNjJcdTVFRjZcdThGREZcdTU2REVcdThDMDNcdTg5ODZcdTUxOTkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3VwcHJlc3NlZCA9IGZhbHNlO1xuXG4gIGF0dGFjaElmcmFtZShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gIH1cblxuICBkZXRhY2hJZnJhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTY2MEVcdTY2OTdcdTcyQjZcdTYwMDFcdUZGMDhcdTRFQzVcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgcHJpdmF0ZSBpc0RhcmtNb2RlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBDU1MgXHU5ODlDXHU4MjcyXHU1QjU3XHU3QjI2XHU0RTMyIFx1MjE5MiBbciwgZywgYl1cdUZGMDgwXHUyMDEzMjU1IFx1NjU3NFx1NjU3MFx1RkYwOVxuICAgKiBcdTY1MkZcdTYzMDEgcmdiKCkvcmdiYSgpLyNoZXhcdUZGMDgzIFx1NjIxNiA2IFx1NEY0RFx1RkYwOVx1RkYxQlx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1OEZENFx1NTZERSBudWxsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBwYXJzZUNvbG9yVG9SZ2IoY29sb3I6IHN0cmluZyk6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSB8IG51bGwge1xuICAgIGlmICghY29sb3IpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGMgPSBjb2xvci50cmltKCk7XG4gICAgbGV0IHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXI7XG5cbiAgICBjb25zdCByZ2JNYXRjaCA9IGMubWF0Y2goL3JnYmE/XFwoKFteKV0rKVxcKS9pKTtcbiAgICBpZiAocmdiTWF0Y2gpIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gcmdiTWF0Y2hbMV0uc3BsaXQoJywnKS5tYXAoKHMpID0+IHBhcnNlRmxvYXQocykpO1xuICAgICAgW3IsIGcsIGJdID0gcGFydHM7XG4gICAgfSBlbHNlIGlmIChjWzBdID09PSAnIycpIHtcbiAgICAgIGxldCBoZXggPSBjLnNsaWNlKDEpO1xuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpIGhleCA9IGhleC5zcGxpdCgnJykubWFwKChjaCkgPT4gY2ggKyBjaCkuam9pbignJyk7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHJldHVybiBudWxsO1xuICAgICAgciA9IHBhcnNlSW50KGhleC5zbGljZSgwLCAyKSwgMTYpO1xuICAgICAgZyA9IHBhcnNlSW50KGhleC5zbGljZSgyLCA0KSwgMTYpO1xuICAgICAgYiA9IHBhcnNlSW50KGhleC5zbGljZSg0LCA2KSwgMTYpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoW3IsIGcsIGJdLnNvbWUoKHYpID0+IGlzTmFOKHYpKSkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIFtNYXRoLnJvdW5kKHIpLCBNYXRoLnJvdW5kKGcpLCBNYXRoLnJvdW5kKGIpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgSFNMIFx1ODI3Mlx1NzZGOCBIXHVGRjA4MFx1MjAxMzM2MFx1RkYwOVxuICAgKiBcdTc1MjhcdTRFOEVcdTYyOEEgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU3Njg0IC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1NEUzQVx1NjNEMlx1NEVGNlx1NzY4NCAtLWFjY2VudC1odWVcbiAgICovXG4gIHN0YXRpYyByZ2JUb0h1ZShjb2xvcjogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgcmdiID0gVGhlbWVCcmlkZ2UucGFyc2VDb2xvclRvUmdiKGNvbG9yKTtcbiAgICBpZiAoIXJnYikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgW3IsIGcsIGJdID0gcmdiO1xuXG4gICAgY29uc3Qgcm4gPSByIC8gMjU1LCBnbiA9IGcgLyAyNTUsIGJuID0gYiAvIDI1NTtcbiAgICBjb25zdCBtYXggPSBNYXRoLm1heChybiwgZ24sIGJuKSwgbWluID0gTWF0aC5taW4ocm4sIGduLCBibiksIGQgPSBtYXggLSBtaW47XG4gICAgaWYgKGQgPT09IDApIHJldHVybiAwO1xuXG4gICAgbGV0IGg6IG51bWJlcjtcbiAgICBpZiAobWF4ID09PSBybikgaCA9ICgoZ24gLSBibikgLyBkKSAlIDY7XG4gICAgZWxzZSBpZiAobWF4ID09PSBnbikgaCA9IChibiAtIHJuKSAvIGQgKyAyO1xuICAgIGVsc2UgaCA9IChybiAtIGduKSAvIGQgKyA0O1xuXG4gICAgaCA9IE1hdGgucm91bmQoaCAqIDYwKTtcbiAgICByZXR1cm4gaCA8IDAgPyBoICsgMzYwIDogaDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgXCJyLCBnLCBiXCIgXHU0RTA5XHU1MTQzXHU3RUM0XHU1QjU3XHU3QjI2XHU0RTMyXG4gICAqIFx1NzUyOFx1NEU4RVx1NjI4QSBPYnNpZGlhbiBcdTRGQTdcdThGQjlcdTY4MEZcdTgwQ0NcdTY2NkYgLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSBcdTU0MENcdTZCNjVcdTRFM0FcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTVFOTVcdTgyNzJcdUZGMENcbiAgICogXHU4QkE5XHU2M0QyXHU0RUY2XHU1MzYxXHU3MjQ3XHU4MjcyXHU2RTI5XHU4RDM0XHU4RkQxIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKi9cbiAgc3RhdGljIHJnYlRvUmdiU3RyaW5nKGNvbG9yOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCByZ2IgPSBUaGVtZUJyaWRnZS5wYXJzZUNvbG9yVG9SZ2IoY29sb3IpO1xuICAgIGlmICghcmdiKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gcmdiLmpvaW4oJywgJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1NDExIGlmcmFtZSBcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTcyQjZcdTYwMDFcbiAgICogQHBhcmFtIGZvbGxvd09ic2lkaWFuVGhlbWUgXHU0RTNBIHRydWUgXHU2NUY2XHVGRjBDXHU5NjQ0XHU1RTI2XHU0RUNFIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFxuICAgKiAgICAgICAgLS1pbnRlcmFjdGl2ZS1hY2NlbnQgXHU1M0NEXHU2M0E4XHU3Njg0XHU2MTBGXHU1ODgzXHU4MjcyXHU3NkY4IGh1ZVx1RkYwQ1x1OUE3MVx1NTJBOFx1NjNEMlx1NEVGNlx1NjU3NFx1NzZEOFx1OTE0RFx1ODI3Mlx1ODA1NFx1NTJBOFxuICAgKi9cbiAgcHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUgPSBmYWxzZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIGNvbnN0IHBheWxvYWQ6IHsgaXNEYXJrOiBib29sZWFuOyBodWU/OiBudW1iZXI7IGJnPzogc3RyaW5nIH0gPSB7XG4gICAgICBpc0Rhcms6IHRoaXMuaXNEYXJrTW9kZSgpLFxuICAgIH07XG5cbiAgICBpZiAoZm9sbG93T2JzaWRpYW5UaGVtZSkge1xuICAgICAgY29uc3QgYWNjZW50ID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgaHVlID0gVGhlbWVCcmlkZ2UucmdiVG9IdWUoYWNjZW50KTtcbiAgICAgIGlmIChodWUgIT09IG51bGwpIHBheWxvYWQuaHVlID0gaHVlO1xuXG4gICAgICAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTgwQ0NcdTY2NkZcdTgyNzJcdUZGMUFcdTlBNzFcdTUyQThcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTVFOTVcdTgyNzJcdThEMzRcdThGRDEgT2JzaWRpYW4gXHU4MjcyXHU2RTI5XG4gICAgICBjb25zdCBzaWRlYmFyID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCBiZyA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHNpZGViYXIpO1xuICAgICAgaWYgKGJnICE9PSBudWxsKSBwYXlsb2FkLmJnID0gYmc7XG4gICAgfVxuXG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICBpZDogJ3RoZW1lX3B1c2hfJyArIERhdGUubm93KCksXG4gICAgICAgIHBheWxvYWQsXG4gICAgICB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTRGOUJcdTU5MTZcdTkwRThcdThDMDNcdTc1MjhcdUZGMUFPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDEgKi9cbiAgb25UaGVtZUNoYW5nZWQoZm9sbG93T2JzaWRpYW5UaGVtZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoVGhlbWUoZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gIH1cblxuICAvLyA9PT09PSBcdTUzQ0NcdTU0MTFcdThDMDNcdTgyNzIgPT09PT1cblxuICAvKipcbiAgICogXHU4QkExXHU3Qjk3IHdlYmFwcCBcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2IFx1MjE5MiBPYnNpZGlhbiBDU1MgXHU1M0Q4XHU5MUNGXHU2NjIwXHU1QzA0XG4gICAqIFx1NEVDNVx1ODk4Nlx1NzZENiAzIFx1N0M3Qlx1NjgzOFx1NUZDM1x1ODI3Mlx1RkYwOFx1NUYzQVx1OEMwMy9cdTgwQ0NcdTY2NkYvXHU2NTg3XHU1QjU3XHVGRjA5XHVGRjBDXHU1MTc2XHU0RjU5XHU3NTMxIE9ic2lkaWFuIFx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NjNBOFx1N0I5N1xuICAgKi9cbiAgc3RhdGljIGNvbXB1dGVPYnNpZGlhblZhcnMoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBoID0gTWF0aC5yb3VuZChodWUpO1xuICAgIGNvbnN0IGxvID0gTWF0aC5tYXgoLTMwLCBNYXRoLm1pbigzMCwgbGlnaHRuZXNzT2Zmc2V0KSk7XG5cbiAgICAvLyBcdTVGM0FcdThDMDNcdTgyNzJcbiAgICBjb25zdCBhY2NlbnRTID0gNDA7XG4gICAgY29uc3QgYWNjZW50TCA9IGlzRGFyayA/IDUwIDogNDA7XG4gICAgY29uc3QgYWNjZW50ID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMfSUpYDtcbiAgICBjb25zdCBhY2NlbnRIb3ZlciA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TCArIDV9JSlgO1xuXG4gICAgLy8gXHU4MENDXHU2NjZGXHU4MjcyXG4gICAgY29uc3QgYmdTID0gaXNEYXJrID8gOCA6IDEyO1xuICAgIGNvbnN0IGJnTCA9IGlzRGFya1xuICAgICAgPyBNYXRoLm1heCg1LCAxMiArIGxvICogMC4zKVxuICAgICAgOiBNYXRoLm1pbig5OCwgOTQgKyBsbyAqIDAuMTUpO1xuICAgIGNvbnN0IGJnUHJpbWFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtiZ0x9JSlgO1xuICAgIGNvbnN0IGJnU2Vjb25kYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2lzRGFyayA/IGJnTCArIDMgOiBiZ0wgLSAyfSUpYDtcblxuICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3MlxuICAgIGNvbnN0IHRleHROb3JtYWwgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDYlLCA4OCUpYCA6IGBoc2woJHtofSwgNiUsIDEyJSlgO1xuICAgIGNvbnN0IHRleHRNdXRlZCAgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDQlLCA1NSUpYCA6IGBoc2woJHtofSwgNCUsIDQ1JSlgO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3Zlcic6IGFjY2VudEhvdmVyLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknOiBiZ1ByaW1hcnksXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSc6IGJnU2Vjb25kYXJ5LFxuICAgICAgJy0tdGV4dC1ub3JtYWwnOiB0ZXh0Tm9ybWFsLFxuICAgICAgJy0tdGV4dC1tdXRlZCc6IHRleHRNdXRlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1OEMwM1x1ODI3Mlx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICogNTBtcyBkZWJvdW5jZVx1RkYwQ1x1OTYzMlx1NkI2Mlx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdTZFRDFcdTU3NTdcdTVGRUJcdTkwMUZcdTYyRDZcdTYyRkRcdTRFQTdcdTc1MUZcdTlBRDhcdTk4OTEgRE9NIFx1NTE5OVx1NTE2NVxuICAgKi9cbiAgYXBwbHlQYWxldHRlKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcik7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSBmYWxzZTsgLy8gXHU2NUIwXHU4QzAzXHU4MjcyXHU4QkY3XHU2QzQyXHU1MjMwXHU2NzY1IFx1MjE5MiBcdTg5RTNcdTk2NjRcdTYyOTFcdTUyMzZcbiAgICB0aGlzLl9wYWxldHRlU3luY1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkKSByZXR1cm47IC8vIHJlc3RvcmVEZWZhdWx0cyBcdTU3MjhcdTk2MzJcdTYyOTZcdTdBOTdcdTUzRTNcdTUxODVcdTg4QUJcdThDMDNcdTc1MjhcbiAgICAgIGNvbnN0IHZhcnMgPSBUaGVtZUJyaWRnZS5jb21wdXRlT2JzaWRpYW5WYXJzKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFycykpIHtcbiAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvKiogXHU2RTA1XHU5NjY0XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTYwNjJcdTU5MEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5RUQ4XHU4QkE0XHU1MDNDICovXG4gIHN0YXRpYyByZXN0b3JlRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFRoZW1lQnJpZGdlLklOSkVDVEVEX1ZBUlMpIHtcbiAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgRGF0YUFkYXB0ZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBTdG9yYWdlQnJpZGdlIH0gZnJvbSAnLi9TdG9yYWdlQnJpZGdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9UaGVtZUJyaWRnZSc7XG5pbXBvcnQgdHlwZSB7IEFueUJyaWRnZU1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcy9tZXNzYWdlcyc7XG5pbXBvcnQgeyBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqIFx1NjI2Qlx1NjNDRlx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjVGNlx1OUVEOFx1OEJBNFx1OERGM1x1OEZDN1x1NzY4NFx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOGNvbmZpZ0RpciBcdTUzRUZcdTkwMUFcdThGQzcgc2V0Q29uZmlnRGlyIFx1ODFFQVx1NUI5QVx1NEU0OVx1RkYwOSAqL1xuY29uc3QgREVGQVVMVF9TS0lQX0RJUlMgPSBbJy50cmFzaCcsICcuZ2l0JywgJ25vZGVfbW9kdWxlcyddO1xuXG4vKipcbiAqIEJyaWRnZVNlcnZpY2UgLSBwb3N0TWVzc2FnZSBcdTZEODhcdTYwNkZcdThERUZcdTc1MzFcdTRFMkRcdTVGQzNcbiAqXG4gKiBcdTc2RDFcdTU0MkMgaWZyYW1lIFx1NTNEMVx1Njc2NVx1NzY4NCBwb3N0TWVzc2FnZVx1RkYwQ1x1NTIwNlx1NTNEMVx1NTIzMFx1NUJGOVx1NUU5NFx1NTkwNFx1NzQwNlx1NkEyMVx1NTc1N1x1RkYwQ1xuICogXHU3MTM2XHU1NDBFXHU1QzA2XHU3RUQzXHU2NzlDXHU1NkRFXHU0RjIwXHU3RUQ5IGlmcmFtZVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQnJpZGdlU2VydmljZSB7XG4gICAgcHJpdmF0ZSBzdG9yYWdlQnJpZGdlOiBTdG9yYWdlQnJpZGdlO1xuICAgIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICAgIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgoKSA9PiBQcm9taXNlPHZvaWQ+KSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGN1c3RvbVRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICAgIHByaXZhdGUgdmF1bHRCYXNlUGF0aDogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSB2YXVsdEFkYXB0ZXI6IERhdGFBZGFwdGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZyA9ICcnO1xuICAgIHByaXZhdGUgY29uZmlnRGlyOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIGV4cGVjdGVkT3JpZ2luID0gJyc7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc3RvcmFnZUJyaWRnZTogU3RvcmFnZUJyaWRnZSxcbiAgICAgICAgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlLFxuICAgICAgICBzZXR0aW5ncz86IEJhbWJvb1Jldmlld1NldHRpbmdzLFxuICAgICAgICBzYXZlU2V0dGluZ3M/OiAoKSA9PiBQcm9taXNlPHZvaWQ+XG4gICAgKSB7XG4gICAgICAgIHRoaXMuc3RvcmFnZUJyaWRnZSA9IHN0b3JhZ2VCcmlkZ2U7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UgPSB0aGVtZUJyaWRnZTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzIHx8IG51bGw7XG4gICAgICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzIHx8IG51bGw7XG4gICAgfVxuXG4gIC8qKiBcdTdFRDFcdTVCOUEgaWZyYW1lIFx1NUU3Nlx1NUYwMFx1NTlDQlx1NzZEMVx1NTQyQ1x1NkQ4OFx1NjA2RiAqL1xuICBhdHRhY2goaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIC8vIFx1OTYzMlx1NkI2Mlx1OTFDRFx1NTkwRFx1N0VEMVx1NUI5QVxuICAgIHRoaXMuZGV0YWNoKCk7XG5cbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZShpZnJhbWUpO1xuXG4gICAgLy8gXHU4QkIwXHU1RjU1IGV4cGVjdGVkIG9yaWdpblx1RkYwQ1x1NzUyOFx1NEU4RVx1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1NjgyMVx1OUE4Q1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gbmV3IFVSTChpZnJhbWUuc3JjKS5vcmlnaW47XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLmV4cGVjdGVkT3JpZ2luID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICB2b2lkIHRoaXMub25NZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4XHVGRjA4XHU0RjlCXHU2M0QyXHU0RUY2XHU3QUVGXHU2MjZCXHU2M0NGXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhcdTRGOUJcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgc2V0VmF1bHRCYXNlUGF0aChiYXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy52YXVsdEJhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICAvKiogXHU2Q0U4XHU1MTY1IE9ic2lkaWFuIFZhdWx0IFx1OTAwMlx1OTE0RFx1NTY2OFx1RkYwQ1x1NzUyOFx1NEU4RSBWYXVsdCBBUEkgXHU4REVGXHU1Rjg0XHU2NENEXHU0RjVDXHU2NkZGXHU0RUUzIGZzICovXG4gIHNldFZhdWx0QWRhcHRlcihhZGFwdGVyOiBEYXRhQWRhcHRlcik6IHZvaWQge1xuICAgIHRoaXMudmF1bHRBZGFwdGVyID0gYWRhcHRlcjtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODQgKi9cbiAgc2V0Tm9pc2VQYXRoKG5vaXNlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFIE9ic2lkaWFuIFx1OTE0RFx1N0Y2RVx1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNCAub2JzaWRpYW5cdUZGMENcdTc1MjhcdTYyMzdcdTUzRUZcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMDkgKi9cbiAgc2V0Q29uZmlnRGlyKGRpcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWdEaXIgPSBkaXI7XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHU2MjE2XHU1MTY4XHU1RTkzXHU2MjZCXHU2M0NGXHVGRjA5XHVGRjBDXHU5MDFBXHU4RkM3IFZhdWx0IEFQSSBcdTY2RkZcdTRFRTMgZnMgKi9cbiAgcHJpdmF0ZSBhc3luYyBfc2NhblZhdWx0QXVkaW9GaWxlcyhtYXhEZXB0aCA9IDUpOiBQcm9taXNlPEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+ID0gW107XG4gICAgY29uc3QgYWxsb3dlZEV4dHMgPSBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlM7XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXMudmF1bHRBZGFwdGVyO1xuICAgIGlmICghYWRhcHRlcikgcmV0dXJuIHJlc3VsdHM7XG5cbiAgICAvLyBcdTYzMDdcdTVCOUFcdTRFODZcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMENcdTUzRUFcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRFMERcdTkwMTJcdTVGNTJcdUZGMDlcbiAgICBpZiAodGhpcy5ub2lzZVBhdGgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBhd2FpdCBhZGFwdGVyLmxpc3QodGhpcy5ub2lzZVBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbGlzdC5maWxlcykge1xuICAgICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGFsbG93ZWRFeHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVTdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KHBhdGguam9pbih0aGlzLm5vaXNlUGF0aCwgZmlsZSkpO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiBwYXRoLmpvaW4odGhpcy5ub2lzZVBhdGgsIGZpbGUpLCBuYW1lOiBmaWxlLCBzaXplOiBmaWxlU3RhdD8uc2l6ZSA/PyAwLCBleHQgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gXHU2NzJBXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1MTY4XHU1RTkzXHU5MDEyXHU1RjUyXHU2MjZCXHU2M0NGXHVGRjA4VmF1bHQgQVBJICsgXHU2REYxXHU1RUE2XHU5NjUwXHU1MjM2XHVGRjA5XG4gICAgY29uc3Qgc2NhbkRpciA9IGFzeW5jIChyZWxhdGl2ZURpcjogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgbGV0IGxpc3Q7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ID0gYXdhaXQgYWRhcHRlci5saXN0KHJlbGF0aXZlRGlyKTtcbiAgICAgIH0gY2F0Y2ggeyByZXR1cm47IC8qIHNraXAgdW5yZWFkYWJsZSBkaXJzICovIH1cblxuICAgICAgZm9yIChjb25zdCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XG4gICAgICAgIGlmIChmb2xkZXIuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc2tpcERpcnMgPSBuZXcgU2V0KFsuLi5ERUZBVUxUX1NLSVBfRElSUywgLi4uKHRoaXMuY29uZmlnRGlyID8gW3RoaXMuY29uZmlnRGlyXSA6IFtdKV0pO1xuICAgICAgICBpZiAoc2tpcERpcnMuaGFzKGZvbGRlcikpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBzdWJQYXRoID0gcmVsYXRpdmVEaXIgPyBwYXRoLmpvaW4ocmVsYXRpdmVEaXIsIGZvbGRlcikgOiBmb2xkZXI7XG4gICAgICAgIGF3YWl0IHNjYW5EaXIoc3ViUGF0aCwgZGVwdGggKyAxKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGxpc3QuZmlsZXMpIHtcbiAgICAgICAgaWYgKGZpbGUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChhbGxvd2VkRXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlRGlyID8gcGF0aC5qb2luKHJlbGF0aXZlRGlyLCBmaWxlKSA6IGZpbGU7XG4gICAgICAgICAgICBjb25zdCBmaWxlU3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChyZWxhdGl2ZVBhdGgpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcmVsYXRpdmVQYXRoLCBuYW1lOiBmaWxlLCBzaXplOiBmaWxlU3RhdD8uc2l6ZSA/PyAwLCBleHQgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGF3YWl0IHNjYW5EaXIoJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxIGlmcmFtZVx1RkYwQ1x1NTA1Q1x1NkI2Mlx1NzZEMVx1NTQyQyAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVzc2FnZUhhbmRsZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gICAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aGVtZUJyaWRnZS5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtc2cgPSBldmVudC5kYXRhIGFzIEFueUJyaWRnZU1lc3NhZ2U7XG4gICAgaWYgKCFtc2cgfHwgIW1zZy50eXBlIHx8ICFtc2cuaWQpIHJldHVybjtcblxuICAgIC8vIFx1NjgyMVx1OUE4Q1x1NkQ4OFx1NjA2Rlx1Njc2NVx1NkU5MFx1RkYxQXNvdXJjZSArIG9yaWdpbiBcdTUzQ0NcdTkxQ0RcdTlBOENcdThCQzFcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgZXZlbnQuc291cmNlICE9PSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmV4cGVjdGVkT3JpZ2luICYmIGV2ZW50Lm9yaWdpbiAhPT0gdGhpcy5leHBlY3RlZE9yaWdpbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQnJpZGdlU2VydmljZV0gSWdub3JlZCBtZXNzYWdlIGZyb20gdW5rbm93biBvcmlnaW46JywgZXZlbnQub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTUyNERcdTdGMDBcbiAgICBpZiAoIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ3N0b3JhZ2U6JykgJiYgIW1zZy50eXBlLnN0YXJ0c1dpdGgoJ2FwcDonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgnZmlsZTonKSAmJiAhbXNnLnR5cGUuc3RhcnRzV2l0aCgndGhlbWU6JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcdTZEODhcdTYwNkZcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSh0aGlzLnNldHRpbmdzPy5mb2xsb3dPYnNpZGlhblRoZW1lID8/IGZhbHNlKTtcbiAgICAgIC8vIFx1NjI4QVx1NjMwMVx1NEU0NVx1NTMxNlx1NzY4NCBzZWN0aW9uQ29uZmlnXHUzMDAxXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1NDhDXHU4MUVBXHU1QjlBXHU0RTQ5XHU5N0YzXHU2RTkwXHU5NjhGIHJlYWR5IFx1NTRDRFx1NUU5NFx1NTNEMVx1N0VEOSB3ZWJhcHBcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHtcbiAgICAgICAgb2s6IHRydWUsXG4gICAgICAgIHNlY3Rpb25Db25maWc6IHRoaXMuc2V0dGluZ3M/LnNlY3Rpb25Db25maWcgfHwgbnVsbCxcbiAgICAgICAgY3VzdG9tVGhlbWVzOiB0aGlzLmN1c3RvbVRoZW1lcyxcbiAgICAgICAgY3VzdG9tTm9pc2VzOiB0aGlzLnNldHRpbmdzPy5ub2lzZUl0ZW1zIHx8IFtdLFxuICAgICAgICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IHRoaXMuc2V0dGluZ3M/LnN5bmNQYWxldHRlVG9PYnNpZGlhbiB8fCBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpjbG9zZScpIHtcbiAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU2NzdGXHU1NzU3XHU5MTREXHU3RjZFXHU2MzAxXHU0RTQ1XHU1MzE2XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnID0gbXNnLnBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZ3MpIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NjMwMVx1NEU0NVx1NTMxNlxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJykge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zID0gQXJyYXkuaXNBcnJheShtc2cucGF5bG9hZCkgPyBtc2cucGF5bG9hZCA6IFtdO1xuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZ3MpIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NEUzQlx1OTg5OFx1NTIwN1x1NjM2Mlx1OEJGN1x1NkM0Mlx1RkYwOGlmcmFtZSBcdTIxOTIgT2JzaWRpYW5cdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6dG9nZ2xlVGhlbWUnKSB7XG4gICAgICBjb25zdCB0YXJnZXRJc0RhcmsgPSBtc2cucGF5bG9hZC5pc0RhcmsgPT09IHRydWU7ICAgICAgY29uc3QgY3VycmVudElzRGFyayA9IGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gICAgICBpZiAodGFyZ2V0SXNEYXJrICE9PSBjdXJyZW50SXNEYXJrKSB7XG4gICAgICAgIGlmICh0YXJnZXRJc0RhcmspIHtcbiAgICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lLWxpZ2h0Jyk7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd0aGVtZS1kYXJrJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZS1kYXJrJyk7XG4gICAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd0aGVtZS1saWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1OTAxQVx1NzdFNSBpZnJhbWUgXHU0RTNCXHU5ODk4XHU1REYyXHU1MjA3XHU2MzYyXG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKHRoaXMuc2V0dGluZ3M/LmZvbGxvd09ic2lkaWFuVGhlbWUgPz8gZmFsc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBvazogdHJ1ZSwgaXNEYXJrOiB0YXJnZXRJc0RhcmsgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU4QkY3XHU2QzQyXHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzPy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pIHtcbiAgICAgICAgY29uc3QgeyBodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrIH0gPSBtc2cucGF5bG9hZDtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5hcHBseVBhbGV0dGUoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vID09PT09IFx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1RkYxQVx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiA9PT09PVxuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU2MjQwXHU2NzA5XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjA4XHU0RjlCIHdlYmFwcCBcdTY1ODdcdTRFRjZcdTkwMDlcdTYyRTlcdTU2NjhcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6bGlzdFZhdWx0QXVkaW9GaWxlcycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEJhc2VQYXRoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMENcdThCRjdcdTVDMURcdThCRDVcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTk3NjJcdTY3N0YnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBfc2NhblZhdWx0QXVkaW9GaWxlcygpIFx1NTE4NVx1OTBFOFx1NURGMlx1NUYwMlx1NkI2NVx1NjhDMFx1NjdFNVx1OERFRlx1NUY4NFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuX3NjYW5WYXVsdEF1ZGlvRmlsZXMoKTtcbiAgICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBmaWxlcyB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdcdTYyNkJcdTYzQ0ZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vXSBcdTYyNkJcdTYzQ0ZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjU6JywgZXJyb3IpO1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIG1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEJGQlx1NTNENlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwOFx1OTAxQVx1OEZDN1x1NUU5M1x1NTE4NVx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOVx1MjAxNCBcdTRGN0ZcdTc1MjggYWRhcHRlciBcdTlBOENcdThCQzFcdTVFNzZcdTkwMUFcdThGQzcgZ2V0RnVsbFBhdGggXHU4M0I3XHU1M0Q2XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgaWYgKG1zZy50eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtc2cucGF5bG9hZD8ucGF0aCB8fCAnJztcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShyZWxhdGl2ZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICAgIGlmICghdGhpcy52YXVsdEFkYXB0ZXIpIHRocm93IG5ldyBFcnJvcignVmF1bHQgXHU5MDAyXHU5MTREXHU1NjY4XHU2NzJBXHU1MjFEXHU1OUNCXHU1MzE2Jyk7XG4gICAgICAgIC8vIFx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NjhDMFx1NjdFNVxuICAgICAgICBpZiAocmVsYXRpdmVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2Mlx1RkYxQScgKyByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBWYXVsdCBBUEkgXHU5QThDXHU4QkMxXHU2NTg3XHU0RUY2XHU1QjU4XHU1NzI4XG4gICAgICAgIGNvbnN0IGZpbGVTdGF0ID0gYXdhaXQgdGhpcy52YXVsdEFkYXB0ZXIuc3RhdChyZWxhdGl2ZVBhdGgpO1xuICAgICAgICBpZiAoIWZpbGVTdGF0IHx8IGZpbGVTdGF0LnR5cGUgIT09ICdmaWxlJykgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgLy8gYWRhcHRlci5zdGF0IFx1NURGMlx1OUE4Q1x1OEJDMVx1NUI1OFx1NTcyOFx1RkYwQ2Jhc2VQYXRoIFx1NzUyOFx1NEU4RVx1NjJGQ1x1NjNBNVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1NEY5QiBIVFRQIFx1NjcwRFx1NTJBMVx1NTY2OFx1NEY3Rlx1NzUyOFxuICAgICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTVFOTNcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODQnKTtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odGhpcy52YXVsdEJhc2VQYXRoLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICBpZiAoIWZ1bGxQYXRoLnN0YXJ0c1dpdGgodGhpcy52YXVsdEJhc2VQYXRoKSkgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjJcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgdGhpcy5yZXNwb25kKG1zZy5pZCwgeyBmaWxlUGF0aDogZnVsbFBhdGgsIG5hbWU6IHBhdGguYmFzZW5hbWUocmVsYXRpdmVQYXRoLCBleHQpIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdcdThCRkJcdTUzRDZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTY3MkNcdTU3MzBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMDhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdTU2REVcdTRGMjBcdThERUZcdTVGODRcdTc1MzFcdTUyNERcdTdBRUZcdTc1MjggZmlsZTovLyBcdTUyQTBcdThGN0RcdUZGMDlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdhcHA6cmVhZExvY2FsRmlsZScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gbXNnLnBheWxvYWQ/LnBhdGggfHwgJyc7XG4gICAgICAgIGlmICghZmlsZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG4gICAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NjJEMlx1N0VERFx1NTMwNVx1NTQyQlx1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1NUI1N1x1N0IyNlx1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICBpZiAoZmlsZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZpbGVQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzcG9uZChtc2cuaWQsIHsgZmlsZVBhdGgsIG5hbWU6IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgsIGV4dCkgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2RlxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnN0b3JhZ2VCcmlkZ2UuaGFuZGxlKG1zZyk7XG4gICAgICB0aGlzLnJlc3BvbmQobXNnLmlkLCByZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NjIxMFx1NTI5Rlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmQoaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgaWQsIHBheWxvYWQgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1OTUxOVx1OEJFRlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmRFcnJvcihpZDogc3RyaW5nLCBlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgZXJyb3IgfSwgJyonKTtcbiAgfVxufVxuIiwgIi8qKiBcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDhcdTVCOENcdTY1NzRcdTUyMTdcdTg4NjhcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgPSBbXG4gICcubXAzJywgJy53YXYnLCAnLm9nZycsICcuZmxhYycsICcuYWFjJywgJy5tNGEnLCAnLndtYScsICcud2VibScsICcub3B1cycsXG5dO1xuXG4vKiogXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEIFx1MjE5MiBNSU1FIFx1N0M3Qlx1NTc4QiAqL1xuY29uc3QgQVVESU9fTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5tcDMnOiAgJ2F1ZGlvL21wZWcnLFxuICAnLndhdic6ICAnYXVkaW8vd2F2JyxcbiAgJy5vZ2cnOiAgJ2F1ZGlvL29nZycsXG4gICcuZmxhYyc6ICdhdWRpby9mbGFjJyxcbiAgJy5hYWMnOiAgJ2F1ZGlvL2FhYycsXG4gICcubTRhJzogICdhdWRpby9tcDQnLFxuICAnLndtYSc6ICAnYXVkaW8veC1tcy13bWEnLFxuICAnLndlYm0nOiAnYXVkaW8vd2VibScsXG4gICcub3B1cyc6ICdhdWRpby9vcHVzJyxcbn07XG5cbi8qKiBcdTVCOENcdTY1NzQgTUlNRSBcdTdDN0JcdTU3OEJcdTY2MjBcdTVDMDRcdUZGMDhcdTU0MkIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IE1JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcuaHRtbCc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmNzcyc6ICAndGV4dC9jc3M7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcubWpzJzogICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qc29uJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAnLnBuZyc6ICAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAgJ2ltYWdlL2pwZWcnLFxuICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICcuZ2lmJzogICdpbWFnZS9naWYnLFxuICAnLnN2Zyc6ICAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcuaWNvJzogICdpbWFnZS94LWljb24nLFxuICAnLndvZmYnOiAnZm9udC93b2ZmJyxcbiAgJy53b2ZmMic6J2ZvbnQvd29mZjInLFxuICAnLnR0Zic6ICAnZm9udC90dGYnLFxuICAuLi5BVURJT19NSU1FX1RZUEVTLFxufTtcbiIsICJpbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIG5ldCBmcm9tICduZXQnO1xuaW1wb3J0IHsgTUlNRV9UWVBFUywgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcblxuLyoqXG4gKiBMb2NhbFNlcnZlciAtIFx1NjcyQ1x1NTczMCBIVFRQIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjcwRFx1NTJBMVx1NTY2OFxuICpcbiAqIFx1NTcyOCBPYnNpZGlhbiAoRWxlY3Ryb24pIFx1NzNBRlx1NTg4M1x1NEUyRFx1NTQyRlx1NTJBOFx1NEUwMFx1NEUyQVx1NjcyQ1x1NTczMCBIVFRQIFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1xuICogXHU0RTNBIGlmcmFtZSBcdTYzRDBcdTRGOUIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NjcwRFx1NTJBMVx1RkYwQ1x1N0VENVx1OEZDNyBhcHA6Ly8gXHU1MzRGXHU4QkFFXHU3Njg0XHU5NjUwXHU1MjM2XHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFNlcnZlciB7XG4gIHByaXZhdGUgc2VydmVyOiBodHRwLlNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHBvcnQgPSAwO1xuICBwcml2YXRlIHdlYmFwcERpcjogc3RyaW5nO1xuICBwcml2YXRlIHZhdWx0QmFzZVBhdGg6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKHdlYmFwcERpcjogc3RyaW5nKSB7XG4gICAgdGhpcy53ZWJhcHBEaXIgPSB3ZWJhcHBEaXI7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RjlCIC9iYW1ib28tYXVkaW8gXHU5N0YzXHU5ODkxXHU0RUUzXHU3NDA2XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHNldFZhdWx0QmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMudmF1bHRCYXNlUGF0aCA9IGJhc2VQYXRoO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1x1OEZENFx1NTZERVx1NzZEMVx1NTQyQ1x1N0FFRlx1NTNFMyAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLnNlcnZlcikgcmV0dXJuIHRoaXMucG9ydDtcblxuICAgIHRoaXMucG9ydCA9IGF3YWl0IHRoaXMuZmluZEZyZWVQb3J0KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KHJlcSwgcmVzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBTZXJ2ZXIgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2VydmVyIGVycm9yOiAke2Vyci5tZXNzYWdlfWApKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZlci5saXN0ZW4odGhpcy5wb3J0LCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW0JhbWJvb1Jldmlld10gTG9jYWwgc2VydmVyIHN0YXJ0ZWQgb24gcG9ydCAke3RoaXMucG9ydH1gKTtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnBvcnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU1MDVDXHU2QjYyXHU2NzBEXHU1MkExXHU1NjY4ICovXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdbQmFtYm9vUmV2aWV3XSBMb2NhbCBzZXJ2ZXIgc3RvcHBlZCcpO1xuICAgICAgICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnBvcnQgPSAwO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2NzBEXHU1MkExXHU1NjY4IFVSTCAqL1xuICBnZXRVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGh0dHA6Ly8xMjcuMC4wLjE6JHt0aGlzLnBvcnR9YDtcbiAgfVxuXG4gIC8qKiBcdTU5MDRcdTc0MDYgSFRUUCBcdThCRjdcdTZDNDIgKi9cbiAgcHJpdmF0ZSBoYW5kbGVSZXF1ZXN0KHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSk6IHZvaWQge1xuICAgIC8vIC9iYW1ib28tYXVkaW8/cGF0aD14eHggXHUyMDE0IFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NEVFM1x1NzQwNlx1RkYwQ1x1N0VENVx1OEZDNyBwb3N0TWVzc2FnZSBcdTU5MjcgcGF5bG9hZCBcdTk2NTBcdTUyMzZcbiAgICBjb25zdCB1cmwgPSByZXEudXJsIHx8ICcvJztcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9iYW1ib28tYXVkaW8tcHJveHknKSkge1xuICAgICAgdGhpcy5oYW5kbGVBdWRpb1VybFByb3h5KHJlcSwgcmVzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvYmFtYm9vLWF1ZGlvJykpIHtcbiAgICAgIHRoaXMuaGFuZGxlQXVkaW9Qcm94eShyZXEsIHJlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4OUUzXHU2NzkwIFVSTFx1RkYwQ1x1NTNCQlx1OTY2NFx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFxuICAgIGxldCB1cmxQYXRoID0gdXJsLnNwbGl0KCc/JylbMF07XG4gICAgLy8gXHU3NkVFXHU1RjU1XHU5RUQ4XHU4QkE0XHU2NTg3XHU0RUY2XG4gICAgaWYgKHVybFBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgICAgdXJsUGF0aCArPSAnaW5kZXguaHRtbCc7XG4gICAgfVxuICAgIGNvbnN0IHNhZmVQYXRoID0gcGF0aC5ub3JtYWxpemUodXJsUGF0aCkucmVwbGFjZSgvXihcXC5cXC5bL1xcXFxdKSsvLCAnJyk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy53ZWJhcHBEaXIsIHNhZmVQYXRoKTtcblxuICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NTcyOCB3ZWJhcHBEaXIgXHU1MTg1XG4gICAgaWYgKCFmaWxlUGF0aC5zdGFydHNXaXRoKHRoaXMud2ViYXBwRGlyKSkge1xuICAgICAgcmVzLndyaXRlSGVhZCg0MDMpO1xuICAgICAgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgZnMuc3RhdChmaWxlUGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgIGlmIChlcnIgfHwgIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTtcbiAgICAgICAgcmVzLmVuZChgPCFET0NUWVBFIGh0bWw+XG48aHRtbD48aGVhZD48bWV0YSBjaGFyc2V0PVwidXRmLThcIj48c3R5bGU+XG4gIGJvZHkgeyBkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgaGVpZ2h0OjEwMHZoOyBtYXJnaW46MDtcbiAgICAgICAgIGZvbnQtZmFtaWx5OiBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7IGJhY2tncm91bmQ6IzBhMGEwYTsgY29sb3I6Izg4ODsgfVxuICAuYm94IHsgdGV4dC1hbGlnbjpjZW50ZXI7IH1cbiAgaDIgeyBjb2xvcjojY2NjOyBmb250LXdlaWdodDo0MDA7IH1cbiAgcCB7IGZvbnQtc2l6ZToxNHB4OyB9XG4gIGJ1dHRvbiB7IG1hcmdpbi10b3A6MTZweDsgcGFkZGluZzo4cHggMjRweDsgYm9yZGVyOjFweCBzb2xpZCAjNDQ0OyBib3JkZXItcmFkaXVzOjZweDtcbiAgICAgICAgICAgYmFja2dyb3VuZDojMWExYTFhOyBjb2xvcjojYWFhOyBjdXJzb3I6cG9pbnRlcjsgZm9udC1zaXplOjE0cHg7IH1cbiAgYnV0dG9uOmhvdmVyIHsgYmFja2dyb3VuZDojMmEyYTJhOyBjb2xvcjojZmZmOyB9XG48L3N0eWxlPjwvaGVhZD48Ym9keT5cbjxkaXYgY2xhc3M9XCJib3hcIj5cbiAgPGgyPlx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1NkI2M1x1NTcyOFx1NTIxRFx1NTlDQlx1NTMxNlx1MjAyNlx1MjAyNjwvaDI+XG4gIDxwPlx1OTk5Nlx1NkIyMVx1NTQyRlx1NTJBOFx1OTcwMFx1ODk4MVx1NEUwQlx1OEY3RFx1OEQ0NFx1NkU5MFx1NTMwNVx1RkYwQ1x1OEJGN1x1N0EwRFx1NTAxOTwvcD5cbiAgPGJ1dHRvbiBvbmNsaWNrPVwibG9jYXRpb24ucmVsb2FkKClcIj5cdTYyNEJcdTUyQThcdTUyMzdcdTY1QjA8L2J1dHRvbj5cbiAgPHNjcmlwdD5cbiAgICB2YXIgcmV0cmllcyA9IDA7XG4gICAgZnVuY3Rpb24gY2hlY2soKSB7XG4gICAgICBmZXRjaCh3aW5kb3cubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6ICdIRUFEJyB9KS50aGVuKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgaWYgKHIuc3RhdHVzID09PSAyMDApIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBlbHNlIGlmICgrK3JldHJpZXMgPCAzMCkgc2V0VGltZW91dChjaGVjaywgMjAwMCk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbigpIHsgaWYgKCsrcmV0cmllcyA8IDMwKSBzZXRUaW1lb3V0KGNoZWNrLCAyMDAwKTsgfSk7XG4gICAgfVxuICAgIHNldFRpbWVvdXQoY2hlY2ssIDMwMDApO1xuICA8L3NjcmlwdD5cbjwvZGl2PjwvYm9keT48L2h0bWw+YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4QkJFXHU3RjZFIE1JTUUgXHU3QzdCXHU1NzhCXG4gICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcblxuICAgICAgLy8gXHU1REVFXHU1RjAyXHU1MzE2XHU3RjEzXHU1QjU4XHU3QjU2XHU3NTY1XHVGRjFBXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU1RTI2IF9fQlVJTERfXyBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMENcdTUzRUZcdTk1N0ZcdTY3MUZcdTdGMTNcdTVCNThcbiAgICAgIGNvbnN0IGlzSFRNTCA9IGV4dCA9PT0gJy5odG1sJztcbiAgICAgIGNvbnN0IGlzU3RhdGljID0gWycuY3NzJywgJy5qcycsICcud29mZicsICcud29mZjInLCAnLnR0ZicsICcuc3ZnJywgJy5wbmcnLCAnLmljbycsICcuanNvbiddLmluY2x1ZGVzKGV4dCk7XG4gICAgICBjb25zdCBjYWNoZUNvbnRyb2wgPSBpc0hUTUxcbiAgICAgICAgPyAnbm8tY2FjaGUnXG4gICAgICAgIDogaXNTdGF0aWNcbiAgICAgICAgICA/ICdwdWJsaWMsIG1heC1hZ2U9ODY0MDAnXG4gICAgICAgICAgOiAncHVibGljLCBtYXgtYWdlPTM2MDAnO1xuXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMDhcdTRFMERcdTk3MDBcdTg5ODEgQ09SU1x1RkYwQ2lmcmFtZSBcdTRFMEVcdTY3MERcdTUyQTFcdTU2NjhcdTU0MENcdTZFOTBcdUZGMDlcbiAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiBjb250ZW50VHlwZSxcbiAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiBjYWNoZUNvbnRyb2wsXG4gICAgICB9KTtcblxuICAgICAgLy8gXHU2RDQxXHU1RjBGXHU0RjIwXHU4RjkzXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBzdHJlYW06IGZzLlJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoKTtcbiAgICAgIHN0cmVhbS5waXBlKHJlcyk7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICByZXMuZW5kKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogL2JhbWJvby1hdWRpby1wcm94eT91cmw9eHh4IFx1MjAxNCBcdTRFRTNcdTc0MDZcdTU5MTZcdTkwRThcdTk3RjNcdTZFOTAgVVJMXHVGRjBDXHU3RUQ1XHU4RkM3XHU2RDRGXHU4OUM4XHU1NjY4IENPUlMgXHU5NjUwXHU1MjM2ICovXG4gIHByaXZhdGUgaGFuZGxlQXVkaW9VcmxQcm94eShyZXE6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3VXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGNvbnN0IHF1ZXJ5SW5kZXggPSByYXdVcmwuaW5kZXhPZignPycpO1xuICAgICAgaWYgKHF1ZXJ5SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyB1cmwgcGFyYW1ldGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHF1ZXJ5U3RyID0gcmF3VXJsLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHIpO1xuICAgICAgY29uc3QgdGFyZ2V0VXJsID0gcGFyYW1zLmdldCgndXJsJyk7XG4gICAgICBpZiAoIXRhcmdldFVybCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgdXJsIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NEVDNVx1NTE0MVx1OEJCOCBodHRwL2h0dHBzXG4gICAgICBsZXQgcGFyc2VkOiBVUkw7XG4gICAgICB0cnkge1xuICAgICAgICBwYXJzZWQgPSBuZXcgVVJMKHRhcmdldFVybCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDApOyByZXMuZW5kKCdJbnZhbGlkIFVSTCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocGFyc2VkLnByb3RvY29sICE9PSAnaHR0cDonICYmIHBhcnNlZC5wcm90b2NvbCAhPT0gJ2h0dHBzOicpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IG9ubHkgaHR0cC9odHRwcyBVUkxzIGFsbG93ZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc5ODFcdTZCNjJcdThCQkZcdTk1RUVcdTY3MkNcdTU3MzBcdTU3MzBcdTU3NDBcbiAgICAgIGNvbnN0IGhvc3RuYW1lID0gcGFyc2VkLmhvc3RuYW1lO1xuICAgICAgaWYgKGhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fCBob3N0bmFtZSA9PT0gJzEyNy4wLjAuMScgfHwgaG9zdG5hbWUgPT09ICcwLjAuMC4wJ1xuICAgICAgICB8fCBob3N0bmFtZSA9PT0gJ1s6OjFdJyB8fCBob3N0bmFtZS5zdGFydHNXaXRoKCcxOTIuMTY4LicpIHx8IGhvc3RuYW1lLnN0YXJ0c1dpdGgoJzEwLicpXG4gICAgICAgIHx8IGhvc3RuYW1lLnN0YXJ0c1dpdGgoJzE3Mi4nKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogbG9jYWwvcHJpdmF0ZSBuZXR3b3JrIFVSTHMgbm90IGFsbG93ZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDhcdTc2N0RcdTU0MERcdTUzNTVcdUZGMDlcbiAgICAgIGNvbnN0IHBhdGhuYW1lID0gcGFyc2VkLnBhdGhuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5zb21lKGV4dCA9PiBwYXRobmFtZS5lbmRzV2l0aChleHQpKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbjogdW5zdXBwb3J0ZWQgYXVkaW8gZm9ybWF0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdHJhbnNwb3J0ID0gcGFyc2VkLnByb3RvY29sID09PSAnaHR0cHM6JyA/IGh0dHBzIDogaHR0cDtcbiAgICAgIGNvbnN0IHByb3h5UmVxID0gdHJhbnNwb3J0LmdldCh0YXJnZXRVcmwsIHsgdGltZW91dDogMzAwMDAgfSwgKHByb3h5UmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgNTAwO1xuICAgICAgICBjb25zdCBjdCA9IHByb3h5UmVzLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuXG4gICAgICAgIC8vIFx1OTY1MFx1NTIzNlx1NTRDRFx1NUU5NFx1NTkyN1x1NUMwRlx1RkYwOFx1NjcwMFx1NTkyNyA1ME1CXHVGRjA5XG4gICAgICAgIGNvbnN0IG1heFNpemUgPSA1MCAqIDEwMjQgKiAxMDI0O1xuICAgICAgICBsZXQgdG90YWxTaXplID0gMDtcbiAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuXG4gICAgICAgIHByb3h5UmVzLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICB0b3RhbFNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICAgIGlmICh0b3RhbFNpemUgPiBtYXhTaXplKSB7XG4gICAgICAgICAgICBwcm94eVJlcS5kZXN0cm95KCk7XG4gICAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQxMyk7IHJlcy5lbmQoJ0F1ZGlvIGZpbGUgdG9vIGxhcmdlIChtYXggNTBNQiknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm94eVJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgIGlmIChyZXMuaGVhZGVyc1NlbnQpIHJldHVybjtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKHN0YXR1cywge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGN0LFxuICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogdG90YWxTaXplLFxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAgICdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT0zNjAwJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBib2R5ID0gQnVmZmVyLmNvbmNhdChjaHVua3MpO1xuICAgICAgICAgIHJlcy5lbmQoYm9keSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb3h5UmVzLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gQXVkaW8gVVJMIHByb3h5IHVwc3RyZWFtIGVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAyKTsgcmVzLmVuZCgnVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb3h5UmVxLm9uKCd0aW1lb3V0JywgKCkgPT4ge1xuICAgICAgICBwcm94eVJlcS5kZXN0cm95KCk7XG4gICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDQpOyByZXMuZW5kKCdVcHN0cmVhbSB0aW1lb3V0Jyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwcm94eVJlcS5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIEF1ZGlvIFVSTCBwcm94eSBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIpOyByZXMuZW5kKCdVcHN0cmVhbSBjb25uZWN0aW9uIGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBBdWRpbyBVUkwgcHJveHkgZXJyb3I6JywgZSk7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIC9iYW1ib28tYXVkaW8/cGF0aD14eHggXHUyMDE0IFx1NkQ0MVx1NUYwRlx1NEVFM1x1NzQwNlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiAqL1xuICBwcml2YXRlIGhhbmRsZUF1ZGlvUHJveHkocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJhd1VybCA9IHJlcS51cmwgfHwgJyc7XG4gICAgICBjb25zdCBxdWVyeUluZGV4ID0gcmF3VXJsLmluZGV4T2YoJz8nKTtcbiAgICAgIGlmIChxdWVyeUluZGV4ID09PSAtMSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7IHJlcy5lbmQoJ01pc3NpbmcgcGF0aCBwYXJhbWV0ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcXVlcnlTdHIgPSByYXdVcmwuc2xpY2UocXVlcnlJbmRleCArIDEpO1xuICAgICAgY29uc3QgcGFyYW1zOiBVUkxTZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5U3RyKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhcmFtcy5nZXQoJ3BhdGgnKTtcbiAgICAgIGlmICghcmVsYXRpdmVQYXRoKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTsgcmVzLmVuZCgnTWlzc2luZyBwYXRoIHBhcmFtZXRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUI4OVx1NTE2OFx1NjhDMFx1NjdFNVx1RkYxQVx1NTNFQVx1NTE0MVx1OEJCOFx1NjMwN1x1NUI5QVx1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHJlbGF0aXZlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpOyByZXMuZW5kKCdGb3JiaWRkZW46IHVuc3VwcG9ydGVkIGF1ZGlvIGZvcm1hdCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBcdTVCODlcdTUxNjhcdTY4QzBcdTY3RTVcdUZGMUFcdTc5ODFcdTZCNjJcdThERUZcdTVGODRcdTdBN0ZcdThEOEFcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBwYXRoLm5vcm1hbGl6ZShyZWxhdGl2ZVBhdGgpLnJlcGxhY2UoL14oXFwuXFwuWy9cXFxcXSkrLywgJycpO1xuICAgICAgaWYgKCFub3JtYWxpemVkIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aCgnLi4nKSB8fCBub3JtYWxpemVkLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMudmF1bHRCYXNlUGF0aCkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7IHJlcy5lbmQoJ1ZhdWx0IGJhc2UgcGF0aCBub3QgY29uZmlndXJlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHRoaXMudmF1bHRCYXNlUGF0aCwgbm9ybWFsaXplZCk7XG4gICAgICBpZiAoIWZ1bGxQYXRoLnN0YXJ0c1dpdGgodGhpcy52YXVsdEJhc2VQYXRoKSkge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7IHJlcy5lbmQoJ0ZvcmJpZGRlbicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZzLnN0YXQoZnVsbFBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICAgIGlmIChlcnIgfHwgIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpOyByZXMuZW5kKCdGaWxlIG5vdCBmb3VuZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZW50VHlwZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogY29udGVudFR5cGUsXG4gICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogc3RhdHMuc2l6ZSxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT0zNjAwJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHN0cmVhbTogZnMuUmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZnVsbFBhdGgpO1xuICAgICAgICBzdHJlYW0ucGlwZShyZXMpO1xuICAgICAgICBzdHJlYW0ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgICByZXMuZW5kKCdTdHJlYW0gZXJyb3InKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBBdWRpbyBwcm94eSBlcnJvcjonLCBlKTtcbiAgICAgICAgcmVzLmVuZCgnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjdFNVx1NjI3RVx1NTNFRlx1NzUyOFx1N0FFRlx1NTNFMyAqL1xuICBwcml2YXRlIGZpbmRGcmVlUG9ydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzZXJ2ZXIgPSBuZXQuY3JlYXRlU2VydmVyKCk7XG4gICAgICBzZXJ2ZXIubGlzdGVuKDAsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcnQgPSAoc2VydmVyLmFkZHJlc3MoKSBhcyBuZXQuQWRkcmVzc0luZm8pLnBvcnQ7XG4gICAgICAgIHNlcnZlci5jbG9zZSgoKSA9PiByZXNvbHZlKHBvcnQpKTtcbiAgICAgIH0pO1xuICAgICAgc2VydmVyLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn0iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuXG4vKiogXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhbWJvb1Jldmlld1NldHRpbmdzIHtcbiAgLyoqIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1NjgzOVx1OERFRlx1NUY4NCAqL1xuICBkYXRhUGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAqL1xuICBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG4gIC8qKiBcdTY3N0ZcdTU3NTdcdTdCQTFcdTc0MDZcdTkxNERcdTdGNkVcdUZGMDhcdTUzRUZcdTg5QzFcdTYwMjcgKyBcdTYzOTJcdTVFOEZcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEUgd2ViYXBwIGlmcmFtZSBsb2NhbFN0b3JhZ2UgXHU0RTBEXHU1M0VGXHU5NzYwXHU2NUY2XHU2MzAxXHU0RTQ1XHU1MzE2ICovXG4gIHNlY3Rpb25Db25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOSAqL1xuICB0aGVtZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5M1x1RkYwOSAqL1xuICBub2lzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NTIxN1x1ODg2OFx1RkYwOFx1OTAxQVx1OEZDN1x1Njg2NVx1NjNBNVx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwQ1x1NTE0Qlx1NjcwRCBsb2NhbFN0b3JhZ2UgcG9ydC1zY29wZWQgXHU5NUVFXHU5ODk4XHVGRjA5ICovXG4gIG5vaXNlSXRlbXM6IHVua25vd25bXTtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NUMwNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MiAqL1xuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGJvb2xlYW47XG4gIC8qKiBcdTY2MkZcdTU0MjZcdThCQTlcdTYzRDJcdTRFRjZcdTkxNERcdTgyNzJcdThEREZcdTk2OEYgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHVGRjA4XHU4QkZCXHU1M0Q2IC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1ODI3Mlx1NzZGOFx1RkYwOSAqL1xuICBmb2xsb3dPYnNpZGlhblRoZW1lOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSB7XG4gIGRhdGFQYXRoOiAnYmFtYm9vLXJldmlldycsXG4gIGVuYWJsZU1hcmtkb3duU3luYzogdHJ1ZSxcbiAgc2VjdGlvbkNvbmZpZzogbnVsbCxcbiAgdGhlbWVQYXRoOiAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JyxcbiAgbm9pc2VQYXRoOiAnJyxcbiAgbm9pc2VJdGVtczogW10sXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogZmFsc2UsXG4gIGZvbGxvd09ic2lkaWFuVGhlbWU6IHRydWUsXG59O1xuXG4vKipcbiAqIFBsdWdpblNldHRpbmdzIC0gT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gKi9cbmV4cG9ydCBjbGFzcyBQbHVnaW5TZXR0aW5ncyBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1zZXR0aW5ncycpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vID09PSBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU1NzI4IFZhdWx0IFx1NEUyRFx1NzY4NFx1NUI1OFx1NTBBOFx1NzZFRVx1NUY1NVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignYmFtYm9vLXJldmlldycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoID0gdmFsdWUgfHwgJ2JhbWJvby1yZXZpZXcnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBNYXJrZG93biBcdTY0NThcdTg5ODFcdTU0MENcdTZCNjVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxJylcbiAgICAgIC5zZXREZXNjKCdcdTZCQ0ZcdTZCMjFcdTRGRERcdTVCNThcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTU3MjggcmV2aWV3cy8gXHU3NkVFXHU1RjU1XHU0RTBCXHU3NTFGXHU2MjEwXHU1M0VGXHU4QkZCXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjYnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NUI1OFx1NjUzRVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoID0gdmFsdWUgfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTc2N0RcdTU2NkFcdTk3RjMgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGMycpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOScpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU2MzA3XHU1QjlBXHU1NDBFXHU0RUM1XHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHU1MTg1XHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHUzMDAyXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU2NTc0XHU0RTJBXHU1RTkzXHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTc2N0RcdTU2NkFcdTk3RjMgXHU2MjE2XHU3NTU5XHU3QTdBXHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4RERGXHU5NjhGIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OTE0RFx1ODI3MicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDXHU2M0QyXHU0RUY2XHU2NTc0XHU0RjUzXHU5MTREXHU4MjcyXHU0RjFBXHU4RERGXHU5NjhGXHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NzY4NFx1NUYzQVx1OEMwM1x1ODI3Mlx1RkYwOC0taW50ZXJhY3RpdmUtYWNjZW50XHVGRjA5XHUzMDAyXHU1MjA3XHU2MzYyIEJhbWJvbyBDaGluYSBcdTc2ODRcdTdBRjlcdTVGNzEgLyBcdTU4QThcdTU5MUMgLyBcdTgwRURcdTgxMDIgLyBcdTk3NTJcdTdFRkZcdTdCNDlcdTYxMEZcdTU4ODNcdTY1RjZcdUZGMENcdTYzRDJcdTRFRjZcdTkxNERcdTgyNzJcdTk2OEZcdTRFNEJcdTgwNTRcdTUyQTgnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSUZyYW1lRWxlbWVudD4oJy5iYW1ib28tcmV2aWV3LWZyYW1lJyk7XG4gICAgICAgICAgICBpZiAoIWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgLy8gXHU3QUNCXHU1MzczXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU1RjNBXHU4QzAzXHU4MjcyXHU1M0NEXHU2M0E4XHU3Njg0XHU4MjcyXHU3NkY4ICsgXHU0RkE3XHU4RkI5XHU2ODBGXHU4MENDXHU2NjZGXHU4MjcyXHU2RTI5XG4gICAgICAgICAgICAgIGNvbnN0IGFjY2VudCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGh1ZSA9IFRoZW1lQnJpZGdlLnJnYlRvSHVlKGFjY2VudCk7XG4gICAgICAgICAgICAgIGNvbnN0IHNpZGViYXIgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGJnID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcoc2lkZWJhcik7XG4gICAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IHsgaXNEYXJrOiBib29sZWFuOyBodWU/OiBudW1iZXI7IGJnPzogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAgICAgaXNEYXJrOiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpZiAoaHVlICE9PSBudWxsKSBwYXlsb2FkLmh1ZSA9IGh1ZTtcbiAgICAgICAgICAgICAgaWYgKGJnICE9PSBudWxsKSBwYXlsb2FkLmJnID0gYmc7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBcdTUxNzNcdTk1RURcdTgwNTRcdTUyQTggXHUyMTkyIFx1OTAxQVx1NzdFNSBpZnJhbWUgXHU2MDYyXHU1OTBEXHU3NTI4XHU2MjM3XHU2MjRCXHU1MkE4XHU4QzAzXHU4MjcyXG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpmb2xsb3dEaXNhYmxlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7fSxcbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NUMwNlx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDd2ViYXBwIFx1NTE4NVx1NjBBQ1x1NkQ2RVx1ODNEQ1x1NTM1NVx1NzY4NFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdThDMDNcdTgyNzJcdTRGMUFcdTVCOUVcdTY1RjZcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU3Njg0XHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHU5MTREXHU4MjcyJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSUZyYW1lRWxlbWVudD4oJy5iYW1ib28tcmV2aWV3LWZyYW1lJyk7XG4gICAgICAgICAgICBpZiAoZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOnN5bmNQYWxldHRlRW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGVuYWJsZWQ6IHZhbHVlIH1cbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIFx1NTE3M1x1NEU4RVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTUxNzNcdTRFOEUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDFcdUZGMUFcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0IgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgcGx1Z2luQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ0JhbWJvbyBJbW1vcnRhbHNcdUZGMDhcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdUZGMDlcdTY2MkZcdTRFMDBcdTZCM0VcdTU3RkFcdTRFOEVcdTgyQ0ZcdTgwNTRcdTYzQTdcdTUyMzZcdThCQkFcdTRFNEJcdTcyMzZcdTdFRjRcdTUxNEJcdTYyNThcdTAwQjdcdTY4M0NcdTUzNjJcdTRFQzBcdTc5RDFcdTU5MkJcdTYzRDBcdTUxRkFcdTc2ODRcIk9HQVNcIlx1NzQwNlx1NUZGNVx1RkYwQ1x1NEUxM1x1NEUzQVx1NEUyQVx1NEVCQVx1NjI1M1x1OTAyMFx1NzY4NFx1NEUyRFx1NTZGRFx1OThDRVx1NzZFRVx1NjgwN1x1ODFFQVx1NTJBOFx1NTMxNlx1NTIwNlx1OTE0RFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlx1MzAwMicsXG4gICAgICBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYydcbiAgICB9KTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMlx1RkYxQVx1NEY1Q1x1ODAwNSArIFx1NEY1Q1x1NTRDMSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBhdXRob3JCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCBiYW1ib28tYWJvdXQtYXV0aG9yJyB9KTtcbiAgICBjb25zdCBhdXRob3JSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb3cnIH0pO1xuICAgIGNvbnN0IGF2YXRhciA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXZhdGFyJyB9KTtcbiAgICAvLyBcdTRFQ0VcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdThCRkJcdTUzRDZcdTU5MzRcdTUwQ0ZcdUZGMDhcdTkwMUFcdThGQzcgVmF1bHQgQVBJIFx1OEJGQlx1NTNENiAub2JzaWRpYW4vcGx1Z2lucy8gXHU0RTBCXHU3Njg0XHU4MUVBXHU2NzA5XHU4RDQ0XHU2RTkwXHVGRjA5XG4gICAgLy8gZmlyZS1hbmQtZm9yZ2V0XHVGRjFBXHU1OTM0XHU1MENGXHU5NzVFXHU1MTczXHU5NTJFXHVGRjBDXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU5NzU5XHU5RUQ4XHU2NjNFXHU3OTNBXHU5RUQ4XHU4QkE0XHU3QTdBXHU1OTM0XHU1MENGXG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGx1Z2luRGlyID0gdGhpcy5wbHVnaW4ubWFuaWZlc3QuZGlyID8/ICcnO1xuICAgICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgICBgJHtwbHVnaW5EaXJ9L2F1dGhvci1hdmF0YXIuanBnYCxcbiAgICAgICAgICBgJHtwbHVnaW5EaXJ9L3dlYmFwcC9hc3NldHMvaW1hZ2VzL2F1dGhvci1hdmF0YXIuanBnYCxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBhdmF0YXJQYXRoIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICBjb25zdCBleGlzdHMgPSBhd2FpdCBhZGFwdGVyLmV4aXN0cyhhdmF0YXJQYXRoKTtcbiAgICAgICAgICBpZiAoIWV4aXN0cykgY29udGludWU7XG4gICAgICAgICAgY29uc3QgYXZhdGFyRGF0YSA9IGF3YWl0IGFkYXB0ZXIucmVhZEJpbmFyeShhdmF0YXJQYXRoKTtcbiAgICAgICAgICBjb25zdCBiNjQgPSBCdWZmZXIuZnJvbShhdmF0YXJEYXRhKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2I2NH0pYCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNpbGVudGx5IHNraXAgXHUyMDE0IHNob3cgZGVmYXVsdCBlbXB0eSBhdmF0YXIgKi8gfVxuICAgIH0pKCk7XG5cblxuICAgIGNvbnN0IGF1dGhvckluZm8gPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1pbmZvJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU3RkJEXHU5Q0RFXHU1NDFCJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1uYW1lJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1NUI1XHU1QjU3XHU5OTg2XHU1MjFCXHU1OUNCXHU0RUJBJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb2xlJyB9KTtcblxuICAgIC8vIFx1NEY1Q1x1NTRDMVx1NTMzQVxuICAgIGF1dGhvckJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ09ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NEY1Q1x1NTRDMScsIGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1sYWJlbCcgfSk7XG4gICAgY29uc3Qgd29ya3NSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLXJvdycgfSk7XG5cbiAgICBbeyBuYW1lOiAnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tQmFtYm9vLURhcnRzJyB9LFxuICAgICB7IG5hbWU6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9XS5mb3JFYWNoKHdvcmsgPT4ge1xuICAgICAgY29uc3QgdGFnID0gd29ya3NSb3cuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IHdvcmsubmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgICBpZiAod29yay51cmwpIHtcbiAgICAgICAgdGFnLnNldENzc1N0eWxlcyh7IGN1cnNvcjogJ3BvaW50ZXInIH0pO1xuICAgICAgICB0YWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgd2luZG93Lm9wZW4od29yay51cmwsICdfYmxhbmsnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEZcbiAgICBjb25zdCBjb250YWN0Qm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEYnLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTkwQUVcdTdCQjFcdUZGMUF5YW55dWxpbjIxMDBAcXEuY29tJywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTVGQUVcdTRGRTFcdUZGMUF5YW5odTk0JywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQThDO0FBQzlDLElBQUFDLFFBQXNCO0FBQ3RCLElBQUFDLE1BQW9CO0FBQ3BCLFdBQXNCO0FBQ3RCLElBQUFDLFNBQXVCOzs7QUNKdkIsSUFBQUMsbUJBQWtEOzs7QUNBbEQsc0JBQTBDOzs7QUNvQm5DLElBQU0sd0JBQU4sY0FBb0MsTUFBTTtBQUFBLEVBQy9DLFlBQVksU0FBaUI7QUFDM0IsVUFBTSxPQUFPO0FBQ2IsU0FBSyxPQUFPO0FBQUEsRUFDZDtBQUNGO0FBRUEsSUFBTSxlQUFlLENBQUMsUUFBUSxTQUFTLFlBQVksbUJBQW1CLGVBQWU7QUFVOUUsSUFBTSxrQkFBa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNN0IsU0FBUyxNQUFnQztBQUN2QyxRQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxNQUFNLFFBQVEsSUFBSSxHQUFHO0FBQzVELFlBQU0sSUFBSSxzQkFBc0IsOEdBQXlCO0FBQUEsSUFDM0Q7QUFFQSxVQUFNLFNBQVM7QUFHZixVQUFNLGdCQUFnQixhQUFhLEtBQUssQ0FBQyxNQUFNLE9BQU8sQ0FBQyxNQUFNLE1BQVM7QUFDdEUsUUFBSSxDQUFDLGVBQWU7QUFDbEIsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7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TixVQUFVLE1BQU0sS0FBSyxhQUFhLHFCQUFxQjtBQUFBLElBQ3pELENBQUM7QUFHRCxTQUFLLGNBQWMsSUFBSSxlQUFlLEtBQUssS0FBSyxJQUFJLENBQUM7QUFHckQsU0FBSyxjQUFjLFFBQVEsa0NBQVMsTUFBTTtBQUN4QyxXQUFLLEtBQUssYUFBYTtBQUFBLElBQ3pCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxXQUFpQjtBQUNmLGdCQUFZLGdCQUFnQjtBQUM1QixTQUFLLEtBQUssYUFBYSxLQUFLO0FBQzVCLFNBQUssY0FBYztBQUFBLEVBQ3JCO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxFQUFFLFVBQVUsSUFBSSxLQUFLO0FBRTNCLFFBQUksT0FBNkI7QUFDakMsVUFBTSxTQUFTLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUUvRCxRQUFJLE9BQU8sU0FBUyxHQUFHO0FBRXJCLGFBQU8sT0FBTyxDQUFDO0FBQUEsSUFDakIsT0FBTztBQUVMLGFBQU8sVUFBVSxRQUFRLEtBQUs7QUFDOUIsWUFBTSxLQUFLLGFBQWE7QUFBQSxRQUN0QixNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVixDQUFDO0FBQUEsSUFDSDtBQUVBLFFBQUksTUFBTTtBQUNSLFlBQU0sVUFBVSxXQUFXLElBQUk7QUFBQSxJQUNqQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR1EsYUFBYSxNQUFvQjtBQUN2QyxVQUFNLFNBQVMsS0FBSyxJQUFJLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUN4RSxRQUFJLE9BQU8sV0FBVyxFQUFHO0FBRXpCLFVBQU0sT0FBTyxPQUFPLENBQUMsRUFBRTtBQUN2QixVQUFNLFNBQVUsS0FBeUQ7QUFDekUsUUFBSSxRQUFRLGVBQWU7QUFDekIsVUFBSSxTQUFTO0FBQ2IsVUFBSTtBQUFFLGlCQUFTLElBQUksSUFBSSxPQUFPLEdBQUcsRUFBRTtBQUFBLE1BQVEsUUFBUTtBQUFBLE1BQWlCO0FBQ3BFLGFBQU8sY0FBYztBQUFBLFFBQ25CLEVBQUUsTUFBTSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFBQSxRQUNoQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFNBQUssV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixNQUFNLEtBQUssU0FBUyxDQUFDO0FBQUEsRUFDM0U7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAicGF0aCIsICJmcyIsICJodHRwcyIsICJpbXBvcnRfb2JzaWRpYW4iLCAicGF0aCIsICJmcyIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiJdCn0K
