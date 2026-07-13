"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BambooReviewPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/views/DailyReviewView.ts
var import_obsidian4 = require("obsidian");

// src/host/AppHost.ts
var import_obsidian = require("obsidian");
var AppHost = class {
  constructor(app, pluginDir) {
    this.blobUrls = [];
    this.app = app;
    this.webappDir = (0, import_obsidian.normalizePath)(`${pluginDir}/webapp`);
  }
  async buildBlobUrl() {
    const adapter = this.app.vault.adapter;
    const indexPath = (0, import_obsidian.normalizePath)(`${this.webappDir}/index.html`);
    let html;
    try {
      html = await adapter.read(indexPath);
    } catch {
      throw new Error("\u65E0\u6CD5\u8BFB\u53D6 webapp/index.html\uFF0C\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5B89\u88C5\u5B8C\u6574");
    }
    html = await this.inlineStyles(html, adapter);
    html = await this.processScripts(html, adapter);
    if (!await this.fileExists(adapter, (0, import_obsidian.normalizePath)(`${this.webappDir}/assets/scripts/bundle.js`))) {
      html = this.fixBridgeSelection(html);
    }
    const blob = new Blob([html], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    this.blobUrls.push(blobUrl);
    return blobUrl;
  }
  async inlineStyles(html, adapter) {
    const linkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi;
    const links = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({ full: match[0], href: match[1] });
    }
    for (const { full, href } of links) {
      const cleanHref = href.split("?")[0];
      const cssPath = (0, import_obsidian.normalizePath)(`${this.webappDir}/${cleanHref}`);
      try {
        const css = await adapter.read(cssPath);
        html = html.replace(full, `<style data-src="${cleanHref}">
${css}
</style>`);
      } catch (e) {
        console.warn(`[AppHost] \u65E0\u6CD5\u52A0\u8F7D CSS: ${cssPath}`, e);
      }
    }
    return html;
  }
  async processScripts(html, adapter) {
    const bundlePath = (0, import_obsidian.normalizePath)(`${this.webappDir}/assets/scripts/bundle.js`);
    const hasBundle = await this.fileExists(adapter, bundlePath);
    if (hasBundle) {
      return await this.useBundle(html, adapter, bundlePath);
    }
    return await this.useIndividualScripts(html, adapter);
  }
  /**
   * 使用构建产物 bundle.js — 替换所有外部 module 脚本为单个脚本
   */
  async useBundle(html, adapter, bundlePath) {
    console.log("[AppHost] \u4F7F\u7528 bundle.js");
    const bundleContent = await adapter.read(bundlePath);
    const blob = new Blob([bundleContent], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    this.blobUrls.push(blobUrl);
    html = html.replace(/<script\s+[^>]*?src=["'][^"']+["'][^>]*?>\s*<\/script>/gi, "");
    const bundleTag = `<script src="${blobUrl}"><\/script>`;
    const firstScript = html.search(/<script/i);
    if (firstScript >= 0) {
      html = html.slice(0, firstScript) + bundleTag + "\n" + html.slice(firstScript);
    } else {
      html = html.replace("</body>", `${bundleTag}
</body>`);
    }
    return html;
  }
  /**
   * 回退方案：逐个创建 blob URL + 重写 import 路径
   */
  async useIndividualScripts(html, _adapter) {
    console.warn("[AppHost] \u672A\u627E\u5230 bundle.js\uFF0C\u8DF3\u8FC7 JS \u5904\u7406");
    return html;
  }
  async fileExists(adapter, path) {
    try {
      return await adapter.exists(path);
    } catch {
      return false;
    }
  }
  fixBridgeSelection(html) {
    const oldScript = /<script>\s*\/\/ Obsidian iframe 检测[\s\S]*?<\/script>/;
    html = html.replace(oldScript, '<script type="module" src="assets/scripts/storage/bridge.js?__BUILD__"><\/script>');
    return html;
  }
  destroy() {
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];
  }
};

// src/host/AppAPI.ts
var import_obsidian3 = require("obsidian");

// src/storage/VaultStorage.ts
var import_obsidian2 = require("obsidian");

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
    this.basePath = (0, import_obsidian2.normalizePath)(basePath);
  }
  /** 确保目录存在 */
  async ensureDir(dir) {
    const path = (0, import_obsidian2.normalizePath)(`${this.basePath}/${dir}`);
    if (!await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.mkdir(path);
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
  async vaultWrite(path, content) {
    const normalized = (0, import_obsidian2.normalizePath)(path);
    const abstract = this.app.vault.getAbstractFileByPath(normalized);
    if (abstract instanceof import_obsidian2.TFile) {
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
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/data/${dateKey}.json`);
  }
  async getDay(dateKey) {
    const path = this.dayPath(dateKey);
    if (!await this.app.vault.adapter.exists(path)) {
      return null;
    }
    try {
      const content = await this.app.vault.adapter.read(path);
      return JSON.parse(content);
    } catch (e) {
      console.warn(`[BambooReview] \u65E5\u671F\u6570\u636E\u6587\u4EF6\u635F\u574F\uFF0C\u5C06\u8DF3\u8FC7: ${path}`, e);
      return null;
    }
  }
  async getAllDays() {
    await this.ensureDir("data");
    const dataDir = (0, import_obsidian2.normalizePath)(`${this.basePath}/data`);
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
    const dataDir = (0, import_obsidian2.normalizePath)(`${this.basePath}/data`);
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
    const path = this.dayPath(dateKey);
    await this.vaultWrite(path, JSON.stringify(dayData, null, 2));
  }
  async deleteDay(dateKey) {
    const path = this.dayPath(dateKey);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }
  // ---- 全局目标 (goals) ----
  goalsPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/goals.json`);
  }
  async getGoals() {
    const path = this.goalsPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return [];
    }
    const content = await this.app.vault.adapter.read(path);
    return JSON.parse(content);
  }
  async putGoals(goals) {
    const path = this.goalsPath();
    await this.vaultWrite(path, JSON.stringify(goals, null, 2));
  }
  // ---- 设置 (settings) ----
  settingsPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/settings.json`);
  }
  async getSetting(key) {
    const settings = await this.getAllSettings();
    return settings[key] ?? null;
  }
  async putSetting(key, value) {
    const path = (0, import_obsidian2.normalizePath)(this.settingsPath());
    const abstract = this.app.vault.getAbstractFileByPath(path);
    if (abstract instanceof import_obsidian2.TFile) {
      await this.app.vault.process(abstract, (data) => {
        const settings = JSON.parse(data);
        settings[key] = value;
        return JSON.stringify(settings, null, 2);
      });
    } else {
      await this.vaultWrite(path, JSON.stringify({ [key]: value }, null, 2));
    }
  }
  async getAllSettings() {
    const path = this.settingsPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return {};
    }
    try {
      const content = await this.app.vault.adapter.read(path);
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  // ---- 购买历史 (purchase-history.json) ----
  purchaseHistoryPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/purchase-history.json`);
  }
  async getPurchaseHistory() {
    const path = this.purchaseHistoryPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path);
    return JSON.parse(content);
  }
  async putPurchaseHistory(data) {
    const path = this.purchaseHistoryPath();
    await this.vaultWrite(path, JSON.stringify(data, null, 2));
  }
  // ---- 收入历史 (income-history.json) ----
  incomeHistoryPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/income-history.json`);
  }
  async getIncomeHistory() {
    const path = this.incomeHistoryPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path);
    return JSON.parse(content);
  }
  async putIncomeHistory(data) {
    const path = this.incomeHistoryPath();
    await this.vaultWrite(path, JSON.stringify(data, null, 2));
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
    const dataDir = (0, import_obsidian2.normalizePath)(`${this.basePath}/data`);
    if (await this.app.vault.adapter.exists(dataDir)) {
      await this.app.vault.adapter.rmdir(dataDir, true);
    }
    await this.ensureDir("data");
  }
  /** 仅清空设置文件（overwrite 导入 settings 前调用） */
  async clearAllSettings() {
    const path = this.settingsPath();
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
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
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/reviews/${dateKey}.md`);
  }
  async writeMarkdownReview(dateKey, markdown) {
    await this.ensureDir("reviews");
    const path = this.reviewPath(dateKey);
    await this.vaultWrite(path, markdown);
  }
  async deleteMarkdownReview(dateKey) {
    const path = this.reviewPath(dateKey);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
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
      const textNormal = getComputedStyle(activeDocument.body).getPropertyValue("--text-normal").trim();
      const textNormalRgb = _ThemeBridge.rgbToRgbString(textNormal);
      if (textNormalRgb !== null) payload.textNormal = textNormalRgb;
      const textMuted = getComputedStyle(activeDocument.body).getPropertyValue("--text-muted").trim();
      const textMutedRgb = _ThemeBridge.rgbToRgbString(textMuted);
      if (textMutedRgb !== null) payload.textMuted = textMutedRgb;
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

// src/host/AppAPI.ts
var SKIP_DIRS = [".trash", ".git", "node_modules"];
var AppAPI = class {
  constructor(app, settings, saveSettings, noisePath, configDir) {
    this.iframe = null;
    this.messageHandler = null;
    this.customThemes = [];
    this.settings = settings;
    this.saveSettings = saveSettings;
    this.storage = new VaultStorage(app);
    this.themeBridge = new ThemeBridge();
    this.vaultAdapter = app.vault.adapter;
    this.noisePath = noisePath;
    this.configDir = configDir;
  }
  /** 确保存储结构存在 */
  async ensureStructure() {
    await this.storage.ensureStructure();
  }
  /** 设置自定义主题列表 */
  setCustomThemes(themes) {
    this.customThemes = themes;
  }
  /** 绑定 iframe 并开始监听消息 */
  attach(iframe) {
    this.detach();
    this.iframe = iframe;
    this.themeBridge.attachIframe(iframe);
    this.messageHandler = (event) => {
      void this.onMessage(event);
    };
    window.addEventListener("message", this.messageHandler);
  }
  /** 解绑并停止监听 */
  detach() {
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
      this.messageHandler = null;
    }
    this.themeBridge.detachIframe();
    this.iframe = null;
  }
  /** Obsidian 主题变化时触发（由 DailyReviewView 的 css-change 事件调用） */
  onThemeChanged(followObsidianTheme) {
    this.settings.followObsidianTheme = followObsidianTheme;
    this.themeBridge.pushTheme(followObsidianTheme);
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
  /** 消息路由 */
  async onMessage(event) {
    const msg = event.data;
    if (!msg || !msg.type || !msg.id) return;
    if (this.iframe && event.source !== this.iframe.contentWindow) return;
    const validPrefixes = ["storage:", "app:", "file:", "theme:"];
    if (!validPrefixes.some((p) => msg.type.startsWith(p))) return;
    try {
      await this.handleMessage(msg.type, msg.id, msg.payload ?? {});
    } catch (e) {
      this.respondError(msg.id, e instanceof Error ? e.message : "Unknown error");
    }
  }
  /** 消息分发处理 */
  async handleMessage(type, id, payload) {
    if (type === "app:ready") {
      this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      this.respond(id, {
        ok: true,
        sectionConfig: this.settings.sectionConfig || null,
        customThemes: this.customThemes,
        customNoises: this.settings.noiseItems || [],
        syncPaletteToObsidian: this.settings.syncPaletteToObsidian || false
      });
      return;
    }
    if (type === "app:close") {
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:saveSectionConfig") {
      this.settings.sectionConfig = payload;
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:saveCustomNoises") {
      this.settings.noiseItems = Array.isArray(payload) ? payload : [];
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:toggleTheme") {
      const p = payload;
      const currentIsDark = activeDocument.body.classList.contains("theme-dark");
      if (p.isDark !== currentIsDark) {
        const targetClass = p.isDark ? "theme-dark" : "theme-light";
        const removeClass = p.isDark ? "theme-light" : "theme-dark";
        activeDocument.body.classList.remove(removeClass);
        activeDocument.body.classList.add(targetClass);
        this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      }
      this.respond(id, { ok: true, isDark: p.isDark });
      return;
    }
    if (type === "theme:syncPalette") {
      const p = payload;
      if (this.settings.syncPaletteToObsidian) {
        this.themeBridge.applyPalette(p.hue, p.lightnessOffset, p.isDark);
      }
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:listVaultAudioFiles") {
      try {
        const files = await this.scanVaultAudioFiles();
        this.respond(id, { files });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : "\u626B\u63CF\u5E93\u6587\u4EF6\u5931\u8D25");
      }
      return;
    }
    if (type === "app:readVaultFile") {
      await this.handleReadVaultFile(id, payload);
      return;
    }
    const result = await this.handleStorageMessage(type, payload);
    this.respond(id, result);
  }
  /** 存储消息处理 */
  async handleStorageMessage(type, payload) {
    const p = payload;
    switch (type) {
      case "storage:readDay":
        return await this.storage.getDay(p.dateKey);
      case "storage:writeDay":
        return await this.storage.putDay(p.data);
      case "storage:listDays":
        return await this.storage.getAllDays();
      case "storage:deleteDay":
        return await this.storage.deleteDay(p.dateKey);
      case "storage:getSetting":
        return await this.storage.getSetting(p.key);
      case "storage:putSetting":
        return await this.storage.putSetting(p.key, p.value);
      case "storage:getAllSettings":
        return await this.storage.getAllSettings();
      case "storage:getGoals":
        return await this.storage.getGoals();
      case "storage:putGoals":
        return await this.storage.putGoals(p.goals);
      case "storage:getPurchaseHistory":
        return await this.storage.getPurchaseHistory();
      case "storage:putPurchaseHistory":
        return await this.storage.putPurchaseHistory(p.data);
      case "storage:getIncomeHistory":
        return await this.storage.getIncomeHistory();
      case "storage:putIncomeHistory":
        return await this.storage.putIncomeHistory(p.data);
      case "storage:getDayKeys":
        return await this.storage.getDayKeys();
      case "storage:getDaysPaginated":
        return await this.storage.getDaysPaginated(
          p.page ?? 0,
          p.pageSize ?? 30
        );
      case "storage:exportAll":
        return await this.storage.exportAllData();
      case "storage:importAll":
        return await this.storage.importData(
          p.data,
          { strategy: p.options?.strategy }
        );
      case "storage:clearAll":
        return await this.storage.clearAll();
      default:
        throw new Error(`Unknown storage message type: ${type}`);
    }
  }
  /** 扫描库内音频文件 */
  async scanVaultAudioFiles(maxDepth = 5) {
    const results = [];
    const adapter = this.vaultAdapter;
    if (this.noisePath) {
      try {
        const list = await adapter.list(this.noisePath);
        for (const file of list.files) {
          if (file.startsWith(".")) continue;
          const ext = file.substring(file.lastIndexOf(".")).toLowerCase();
          if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
            try {
              const fullPath = (0, import_obsidian3.normalizePath)(`${this.noisePath}/${file}`);
              const stat = await adapter.stat(fullPath);
              results.push({ path: fullPath, name: file, size: stat?.size ?? 0, ext });
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
        const skipSet = /* @__PURE__ */ new Set([...SKIP_DIRS, ...this.configDir ? [this.configDir] : []]);
        if (skipSet.has(folder)) continue;
        const subPath = relativeDir ? (0, import_obsidian3.normalizePath)(`${relativeDir}/${folder}`) : folder;
        await scanDir(subPath, depth + 1);
      }
      for (const file of list.files) {
        if (file.startsWith(".")) continue;
        const ext = file.substring(file.lastIndexOf(".")).toLowerCase();
        if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
          try {
            const relativePath = relativeDir ? (0, import_obsidian3.normalizePath)(`${relativeDir}/${file}`) : file;
            const stat = await adapter.stat(relativePath);
            results.push({ path: relativePath, name: file, size: stat?.size ?? 0, ext });
          } catch {
          }
        }
      }
    };
    await scanDir("", 0);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  }
  /** 读取库内音频文件 */
  async handleReadVaultFile(id, payload) {
    try {
      const p = payload;
      const relativePath = p.path || "";
      if (!relativePath) throw new Error("\u672A\u63D0\u4F9B\u6587\u4EF6\u8DEF\u5F84");
      const ext = relativePath.substring(relativePath.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error("\u4E0D\u652F\u6301\u7684\u97F3\u9891\u683C\u5F0F\uFF1A" + ext);
      if (relativePath.includes("..")) throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62");
      const adapter = this.vaultAdapter;
      const stat = await adapter.stat(relativePath);
      if (!stat || stat.type !== "file") throw new Error("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A" + relativePath);
      const basePath = adapter.basePath || "";
      if (!basePath) throw new Error("\u65E0\u6CD5\u83B7\u53D6\u5E93\u6839\u76EE\u5F55\u8DEF\u5F84");
      const fullPath = (0, import_obsidian3.normalizePath)(`${basePath}/${relativePath}`);
      if (!fullPath.startsWith(basePath)) throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62");
      this.respond(id, {
        filePath: fullPath,
        name: relativePath.split("/").pop()?.replace(ext, "") || ""
      });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : "\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25");
    }
  }
};

// src/views/DailyReviewView.ts
var VIEW_TYPE_DAILY_REVIEW = "bamboo-immortals";
var DailyReviewView = class extends import_obsidian4.ItemView {
  constructor(leaf, pluginDir, _plugin, settings, saveSettings) {
    super(leaf);
    this.appHost = null;
    this.appAPI = null;
    this.iframe = null;
    this.cssChangeRef = null;
    this.pluginDir = pluginDir;
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
    if (!this.pluginDir) {
      container.createEl("div", {
        text: "\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u65E0\u6CD5\u5B9A\u4F4D\u63D2\u4EF6\u76EE\u5F55",
        cls: "bamboo-review-error"
      });
      return;
    }
    this.appAPI = new AppAPI(
      this.app,
      this.settings,
      this.saveSettings,
      this.settings.noisePath || "",
      this.app.vault.configDir
    );
    await this.appAPI.ensureStructure();
    const customThemes = await this.scanCustomThemes();
    this.appAPI.setCustomThemes(customThemes);
    this.appHost = new AppHost(this.app, this.pluginDir);
    try {
      const blobUrl = await this.appHost.buildBlobUrl();
      this.iframe = container.createEl("iframe", {
        cls: "bamboo-review-frame",
        attr: {
          src: blobUrl,
          allow: "camera; microphone; clipboard-read; clipboard-write"
        }
      });
      this.appAPI.attach(this.iframe);
      this.cssChangeRef = this.app.workspace.on("css-change", () => {
        this.appAPI?.onThemeChanged(this.settings.followObsidianTheme);
      });
    } catch (e) {
      console.error("[BambooReview] \u52A0\u8F7D webapp \u5931\u8D25:", e);
      container.createEl("div", {
        text: `\u7AF9\u6797\u4FEE\u4ED9\u4F20\u52A0\u8F7D\u5931\u8D25: ${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`,
        cls: "bamboo-review-error"
      });
    }
  }
  async onClose() {
    if (this.cssChangeRef) {
      this.app.workspace.offref(this.cssChangeRef);
      this.cssChangeRef = null;
    }
    this.appAPI?.detach();
    this.appAPI = null;
    this.appHost?.destroy();
    this.appHost = null;
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
  /** 接收来自插件的导航/操作指令 */
  sendCommand(type) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage(
      { type, id: "cmd_" + Date.now() },
      "*"
    );
  }
  /** 扫描 Vault 中的自定义主题 */
  async scanCustomThemes() {
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
          themes.push({ name: entry.replace(/\.js$/, ""), code });
        } catch (err) {
          console.error(`[BambooReview] \u8BFB\u53D6\u81EA\u5B9A\u4E49\u4E3B\u9898 ${entry} \u5931\u8D25:`, err instanceof Error ? err.message : String(err));
        }
      }
      if (themes.length > 0) {
        console.debug(`[BambooReview] \u53D1\u73B0 ${themes.length} \u4E2A\u81EA\u5B9A\u4E49\u4E3B\u9898:`, themes.map((t) => t.name));
      }
    } catch (err) {
      console.debug("[BambooReview] \u626B\u63CF\u81EA\u5B9A\u4E49\u4E3B\u9898\u65F6\u51FA\u9519:", err instanceof Error ? err.message : String(err));
    }
    return themes;
  }
};

// src/settings/PluginSettings.ts
var import_obsidian5 = require("obsidian");
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
var PluginSettings = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("bamboo-review-settings");
    new import_obsidian5.Setting(containerEl).setName("\u7AF9\u6797\u4FEE\u4ED9\u4F20 - \u8BBE\u7F6E").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u6570\u636E\u5B58\u50A8").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u6570\u636E\u5B58\u50A8\u8DEF\u5F84").setDesc("\u590D\u76D8\u6570\u636E\u5728 Vault \u4E2D\u7684\u5B58\u50A8\u76EE\u5F55\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("bamboo-review").setValue(this.plugin.settings.dataPath).onChange(async (value) => {
        this.plugin.settings.dataPath = value || "bamboo-review";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u81EA\u52A8\u751F\u6210 Markdown \u6458\u8981").setDesc("\u6BCF\u6B21\u4FDD\u5B58\u590D\u76D8\u6570\u636E\u65F6\uFF0C\u81EA\u52A8\u5728 reviews/ \u76EE\u5F55\u4E0B\u751F\u6210\u53EF\u8BFB\u7684 .md \u6587\u4EF6").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enableMarkdownSync).onChange(async (value) => {
        this.plugin.settings.enableMarkdownSync = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u4E3B\u9898\u52A8\u6548").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u81EA\u5B9A\u4E49\u4E3B\u9898\u8DEF\u5F84").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u5B58\u653E\u81EA\u5B9A\u4E49\u4E3B\u9898 .js \u6587\u4EF6\u7684\u6587\u4EF6\u5939\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u7AF9\u6797\u590D\u76D8\u4E3B\u9898").setValue(this.plugin.settings.themePath).onChange(async (value) => {
        this.plugin.settings.themePath = value || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u767D\u566A\u97F3").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u767D\u566A\u97F3\u6587\u4EF6\u5939").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u7684\u76F8\u5BF9\u8DEF\u5F84\uFF0C\u6307\u5B9A\u540E\u4EC5\u626B\u63CF\u8BE5\u6587\u4EF6\u5939\u5185\u7684\u97F3\u9891\u6587\u4EF6\u3002\u7559\u7A7A\u5219\u626B\u63CF\u6574\u4E2A\u5E93\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u767D\u566A\u97F3 \u6216\u7559\u7A7A\u626B\u63CF\u5168\u5E93").setValue(this.plugin.settings.noisePath).onChange(async (value) => {
        this.plugin.settings.noisePath = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u8C03\u8272\u8054\u52A8").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u8DDF\u968F Obsidian \u4E3B\u9898\u914D\u8272").setDesc("\u6253\u5F00\u540E\uFF0C\u63D2\u4EF6\u6574\u4F53\u914D\u8272\u4F1A\u8DDF\u968F\u5F53\u524D Obsidian \u4E3B\u9898\u7684\u5F3A\u8C03\u8272\uFF08--interactive-accent\uFF09\u3002\u5207\u6362 Bamboo China \u7684\u7AF9\u5F71 / \u58A8\u591C / \u80ED\u8102 / \u9752\u7EFF\u7B49\u610F\u5883\u65F6\uFF0C\u63D2\u4EF6\u914D\u8272\u968F\u4E4B\u8054\u52A8").addToggle(
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
          const textNormal = getComputedStyle(activeDocument.body).getPropertyValue("--text-normal").trim();
          const textNormalRgb = ThemeBridge.rgbToRgbString(textNormal);
          const textMuted = getComputedStyle(activeDocument.body).getPropertyValue("--text-muted").trim();
          const textMutedRgb = ThemeBridge.rgbToRgbString(textMuted);
          const payload = {
            isDark: activeDocument.body.classList.contains("theme-dark")
          };
          if (hue !== null) payload.hue = hue;
          if (bg !== null) payload.bg = bg;
          if (textNormalRgb !== null) payload.textNormal = textNormalRgb;
          if (textMutedRgb !== null) payload.textMuted = textMutedRgb;
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
    new import_obsidian5.Setting(containerEl).setName("\u5C06\u8C03\u8272\u540C\u6B65\u5230 Obsidian").setDesc("\u6253\u5F00\u540E\uFF0Cwebapp \u5185\u60AC\u6D6E\u83DC\u5355\u7684\u8272\u76F8/\u660E\u5EA6\u8C03\u8272\u4F1A\u5B9E\u65F6\u540C\u6B65\u5230 Obsidian \u7684\u539F\u751F\u754C\u9762\u914D\u8272").addToggle(
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
    new import_obsidian5.Setting(containerEl).setName("\u5173\u4E8E").setHeading();
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
var BambooReviewPlugin = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    const pluginDir = this.manifest.dir || "";
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf) => {
      return new DailyReviewView(leaf, pluginDir, this, this.settings, () => this.saveSettings());
    });
    this.addCommand({
      id: "open-daily-review",
      name: "\u6253\u5F00\u4ECA\u65E5\u590D\u76D8",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "navigate-prev-day",
      name: "\u524D\u4E00\u5929",
      callback: () => this.sendToWebapp("nav:prevDay")
    });
    this.addCommand({
      id: "navigate-next-day",
      name: "\u540E\u4E00\u5929",
      callback: () => this.sendToWebapp("nav:nextDay")
    });
    this.addCommand({
      id: "navigate-today",
      name: "\u56DE\u5230\u4ECA\u5929",
      callback: () => this.sendToWebapp("nav:today")
    });
    this.addCommand({
      id: "open-stats",
      name: "\u6253\u5F00\u7EDF\u8BA1\u5206\u6790",
      callback: () => this.sendToWebapp("action:openStats")
    });
    this.addCommand({
      id: "open-settings-in-app",
      name: "\u6253\u5F00\u5E94\u7528\u8BBE\u7F6E",
      callback: () => this.sendToWebapp("action:openSettings")
    });
    this.addSettingTab(new PluginSettings(this.app, this));
    this.addRibbonIcon("leaf", "\u7AF9\u6797\u4FEE\u4ED9\u4F20", () => {
      void this.activateView();
    });
  }
  onunload() {
    ThemeBridge.restoreDefaults();
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
  /** 向 webapp 发送导航/操作指令（Phase 3 将替换为直接 API 调用） */
  sendToWebapp(type) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length === 0) return;
    const view = leaves[0].view;
    view.sendCommand(type);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9ob3N0L0FwcEhvc3QudHMiLCAic3JjL2hvc3QvQXBwQVBJLnRzIiwgInNyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZS50cyIsICJzcmMvc3RvcmFnZS9JbXBvcnRWYWxpZGF0b3IudHMiLCAic3JjL2JyaWRnZS9UaGVtZUJyaWRnZS50cyIsICJzcmMvY29uc3RhbnRzL2F1ZGlvLnRzIiwgInNyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBXb3Jrc3BhY2VMZWFmIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9zcmMvYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW1ib29SZXZpZXdQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuXG4gIGFzeW5jIG9ubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkVcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgY29uc3QgcGx1Z2luRGlyID0gdGhpcy5tYW5pZmVzdC5kaXIgfHwgJyc7XG5cbiAgICAvLyBcdTZDRThcdTUxOEMgVmlld1x1RkYwOFx1NEYyMFx1OTAxMiBwbHVnaW5EaXIgXHU0RjlCIEl0ZW1WaWV3IFx1NTJBMFx1OEY3RCB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHVGRjA5XG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0RBSUxZX1JFVklFVywgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGFpbHlSZXZpZXdWaWV3KGxlYWYsIHBsdWdpbkRpciwgdGhpcywgdGhpcy5zZXR0aW5ncywgKCkgPT4gdGhpcy5zYXZlU2V0dGluZ3MoKSk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLWRhaWx5LXJldmlldycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU0RUNBXHU2NUU1XHU1OTBEXHU3NkQ4JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbmF2aWdhdGUtcHJldi1kYXknLFxuICAgICAgbmFtZTogJ1x1NTI0RFx1NEUwMFx1NTkyOScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9XZWJhcHAoJ25hdjpwcmV2RGF5JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1uZXh0LWRheScsXG4gICAgICBuYW1lOiAnXHU1NDBFXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnNlbmRUb1dlYmFwcCgnbmF2Om5leHREYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXRvZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU2REVcdTUyMzBcdTRFQ0FcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvV2ViYXBwKCduYXY6dG9kYXknKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc3RhdHMnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1N0VERlx1OEJBMVx1NTIwNlx1Njc5MCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zZW5kVG9XZWJhcHAoJ2FjdGlvbjpvcGVuU3RhdHMnKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc2V0dGluZ3MtaW4tYXBwJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2VuZFRvV2ViYXBwKCdhY3Rpb246b3BlblNldHRpbmdzJyksXG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBsdWdpblNldHRpbmdzKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBcdTZERkJcdTUyQTBcdTVERTZcdTRGQTcgUmliYm9uIFx1NTZGRVx1NjgwN1xuICAgIHRoaXMuYWRkUmliYm9uSWNvbignbGVhZicsICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCAoKSA9PiB7XG4gICAgICB2b2lkIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgfVxuXG4gIC8qKiBcdTZGQzBcdTZEM0JcdTYyMTZcdTUyMUJcdTVFRkFcdTU5MERcdTc2RDhcdTg5QzZcdTU2RkUgKi9cbiAgYXN5bmMgYWN0aXZhdGVWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblxuICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgbGVhdmVzID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcblxuICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gXHU1REYyXHU2NzA5XHU4OUM2XHU1NkZFXHVGRjBDXHU3NkY0XHU2M0E1XHU4MDVBXHU3MTI2XG4gICAgICBsZWFmID0gbGVhdmVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTY1QjBcdTg5QzZcdTU2RkVcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XG4gICAgICAgIHR5cGU6IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChsZWFmKSB7XG4gICAgICBhd2FpdCB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1NDExIHdlYmFwcCBcdTUzRDFcdTkwMDFcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0XHVGRjA4UGhhc2UgMyBcdTVDMDZcdTY2RkZcdTYzNjJcdTRFM0FcdTc2RjRcdTYzQTUgQVBJIFx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBwcml2YXRlIHNlbmRUb1dlYmFwcCh0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgIGlmIChsZWF2ZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCB2aWV3ID0gbGVhdmVzWzBdLnZpZXcgYXMgRGFpbHlSZXZpZXdWaWV3O1xuICAgIHZpZXcuc2VuZENvbW1hbmQodHlwZSk7XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKSBhcyBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgRXZlbnRSZWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuaW1wb3J0IHsgQXBwSG9zdCB9IGZyb20gJy4uL2hvc3QvQXBwSG9zdCc7XG5pbXBvcnQgeyBBcHBBUEkgfSBmcm9tICcuLi9ob3N0L0FwcEFQSSc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZVx1RkYwOGJsb2IgVVJMXHVGRjA5XHU2MjdGXHU4RjdEIHdlYmFwcFxuICogMi4gXHU3QkExXHU3NDA2IEFwcEhvc3QgLyBBcHBBUEkgXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKiAzLiBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU1RTc2XHU1NDBDXHU2QjY1XG4gKi9cbmV4cG9ydCBjbGFzcyBEYWlseVJldmlld1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgcGx1Z2luRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBwcml2YXRlIGFwcEhvc3Q6IEFwcEhvc3QgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBhcHBBUEk6IEFwcEFQSSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjc3NDaGFuZ2VSZWY6IEV2ZW50UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbGVhZjogV29ya3NwYWNlTGVhZixcbiAgICBwbHVnaW5EaXI6IHN0cmluZyxcbiAgICBfcGx1Z2luOiB1bmtub3duLFxuICAgIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbiAgICBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD5cbiAgKSB7XG4gICAgc3VwZXIobGVhZik7XG4gICAgdGhpcy5wbHVnaW5EaXIgPSBwbHVnaW5EaXI7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0RBSUxZX1JFVklFVztcbiAgfVxuXG4gIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnO1xuICB9XG5cbiAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGVhZic7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LWNvbnRhaW5lcicpO1xuXG4gICAgaWYgKCF0aGlzLnBsdWdpbkRpcikge1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjVFMFx1NkNENVx1NUI5QVx1NEY0RFx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NScsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2IEFwcEFQSVx1RkYwOFx1OTAxQVx1NEZFMVx1NUM0Mlx1RkYwOVxuICAgIHRoaXMuYXBwQVBJID0gbmV3IEFwcEFQSShcbiAgICAgIHRoaXMuYXBwLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzLFxuICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZVBhdGggfHwgJycsXG4gICAgICB0aGlzLmFwcC52YXVsdC5jb25maWdEaXJcbiAgICApO1xuICAgIGF3YWl0IHRoaXMuYXBwQVBJLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XG4gICAgY29uc3QgY3VzdG9tVGhlbWVzID0gYXdhaXQgdGhpcy5zY2FuQ3VzdG9tVGhlbWVzKCk7XG4gICAgdGhpcy5hcHBBUEkuc2V0Q3VzdG9tVGhlbWVzKGN1c3RvbVRoZW1lcyk7XG5cbiAgICAvLyBcdTUyMUJcdTVFRkEgQXBwSG9zdCBcdTVFNzZcdTY3ODRcdTVFRkEgYmxvYiBVUkxcbiAgICB0aGlzLmFwcEhvc3QgPSBuZXcgQXBwSG9zdCh0aGlzLmFwcCwgdGhpcy5wbHVnaW5EaXIpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGJsb2JVcmwgPSBhd2FpdCB0aGlzLmFwcEhvc3QuYnVpbGRCbG9iVXJsKCk7XG5cbiAgICAgIHRoaXMuaWZyYW1lID0gY29udGFpbmVyLmNyZWF0ZUVsKCdpZnJhbWUnLCB7XG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZnJhbWUnLFxuICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgc3JjOiBibG9iVXJsLFxuICAgICAgICAgIGFsbG93OiAnY2FtZXJhOyBtaWNyb3Bob25lOyBjbGlwYm9hcmQtcmVhZDsgY2xpcGJvYXJkLXdyaXRlJyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTdFRDFcdTVCOUFcdTkwMUFcdTRGRTFcbiAgICAgIHRoaXMuYXBwQVBJLmF0dGFjaCh0aGlzLmlmcmFtZSk7XG5cbiAgICAgIC8vIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcbiAgICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gdGhpcy5hcHAud29ya3NwYWNlLm9uKCdjc3MtY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmFwcEFQST8ub25UaGVtZUNoYW5nZWQodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFx1NTJBMFx1OEY3RCB3ZWJhcHAgXHU1OTMxXHU4RDI1OicsIGUpO1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6IGBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjU6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRid9YCxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzQlx1OTg5OFx1NzZEMVx1NTQyQ1xuICAgIGlmICh0aGlzLmNzc0NoYW5nZVJlZikge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9mZnJlZih0aGlzLmNzc0NoYW5nZVJlZik7XG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU5MDFBXHU0RkUxXHU1QzQyXG4gICAgdGhpcy5hcHBBUEk/LmRldGFjaCgpO1xuICAgIHRoaXMuYXBwQVBJID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNiBibG9iIFVSTFxuICAgIHRoaXMuYXBwSG9zdD8uZGVzdHJveSgpO1xuICAgIHRoaXMuYXBwSG9zdCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYzQTVcdTY1MzZcdTY3NjVcdTgxRUFcdTYzRDJcdTRFRjZcdTc2ODRcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0ICovXG4gIHNlbmRDb21tYW5kKHR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgeyB0eXBlLCBpZDogJ2NtZF8nICsgRGF0ZS5ub3coKSB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTJEXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICovXG4gIHByaXZhdGUgYXN5bmMgc2NhbkN1c3RvbVRoZW1lcygpOiBQcm9taXNlPEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCB0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aGVtZURpck5hbWUgPSB0aGlzLnNldHRpbmdzLnRoZW1lUGF0aCB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgIGxldCB0aGVtZURpckZpbGVzOiBzdHJpbmdbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW1lRGlyRmlsZXMgPSAoYXdhaXQgYWRhcHRlci5saXN0KHRoZW1lRGlyTmFtZSkpLmZpbGVzO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiB0aGVtZXM7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhlbWVEaXJGaWxlcykge1xuICAgICAgICBpZiAoIWVudHJ5LmVuZHNXaXRoKCcuanMnKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYCR7dGhlbWVEaXJOYW1lfS8ke2VudHJ5fWA7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29kZTogc3RyaW5nID0gYXdhaXQgYWRhcHRlci5yZWFkKGZpbGVQYXRoKTtcbiAgICAgICAgICBpZiAoIWNvZGUuaW5jbHVkZXMoJ19fYmFtYm9vX3RoZW1lXycpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTdGM0FcdTVDMTEgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDN2ApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoZW1lcy5wdXNoKHsgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLCBjb2RlIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQmFtYm9vUmV2aWV3XSBcdThCRkJcdTUzRDZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU1OTMxXHU4RDI1OmAsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoZW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYFtCYW1ib29SZXZpZXddIFx1NTNEMVx1NzNCMCAke3RoZW1lcy5sZW5ndGh9IFx1NEUyQVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5ODpgLCB0aGVtZXMubWFwKHQgPT4gdC5uYW1lKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdbQmFtYm9vUmV2aWV3XSBcdTYyNkJcdTYzQ0ZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhlbWVzO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBEYXRhQWRhcHRlciwgbm9ybWFsaXplUGF0aCB9IGZyb20gJ29ic2lkaWFuJztcblxuLyoqXG4gKiBBcHBIb3N0IFx1MjAxNCB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU0RTBFXHU2Q0U4XHU1MTY1XHU0RTJEXHU1RkMzXG4gKlxuICogXHU3QjU2XHU3NTY1XHVGRjFBXG4gKiAgIDEuIFx1ODJFNSB3ZWJhcHAvYXNzZXRzL3NjcmlwdHMvYnVuZGxlLmpzIFx1NUI1OFx1NTcyOFx1RkYwOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1RkYwOVx1RkYwQ1xuICogICAgICBcdTY2RkZcdTYzNjJcdTYyNDBcdTY3MDlcdTU5MTZcdTkwRTggbW9kdWxlIFx1ODExQVx1NjcyQ1x1NEUzQVx1NTM1NVx1NEUyQSBidW5kbGUgPHNjcmlwdD5cdUZGMENcdTk2RjYgaW1wb3J0IFx1OTVFRVx1OTg5OFx1MzAwMlxuICogICAyLiBcdTgyRTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTU2REVcdTkwMDBcdTUyMzBcdTkwMTBcdTRFMkEgYmxvYiBVUkwgKyBpbXBvcnQgXHU5MUNEXHU1MTk5XHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBIb3N0IHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSB3ZWJhcHBEaXI6IHN0cmluZztcbiAgcHJpdmF0ZSBibG9iVXJsczogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luRGlyOiBzdHJpbmcpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLndlYmFwcERpciA9IG5vcm1hbGl6ZVBhdGgoYCR7cGx1Z2luRGlyfS93ZWJhcHBgKTtcbiAgfVxuXG4gIGFzeW5jIGJ1aWxkQmxvYlVybCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuICAgIGNvbnN0IGluZGV4UGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9L2luZGV4Lmh0bWxgKTtcbiAgICBsZXQgaHRtbDogc3RyaW5nO1xuICAgIHRyeSB7XG4gICAgICBodG1sID0gYXdhaXQgYWRhcHRlci5yZWFkKGluZGV4UGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1OEJGQlx1NTNENiB3ZWJhcHAvaW5kZXguaHRtbFx1RkYwQ1x1OEJGN1x1Nzg2RVx1OEJBNFx1NjNEMlx1NEVGNlx1NUI4OVx1ODhDNVx1NUI4Q1x1NjU3NCcpO1xuICAgIH1cblxuICAgIC8vIFx1NTE4NVx1ODA1NCBDU1NcbiAgICBodG1sID0gYXdhaXQgdGhpcy5pbmxpbmVTdHlsZXMoaHRtbCwgYWRhcHRlcik7XG5cbiAgICAvLyBKUyBcdTU5MDRcdTc0MDYgXHUyMDE0IFx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBidW5kbGVcbiAgICBodG1sID0gYXdhaXQgdGhpcy5wcm9jZXNzU2NyaXB0cyhodG1sLCBhZGFwdGVyKTtcblxuICAgIC8vIGJyaWRnZS5qcyBcdTkwMDlcdTYyRTlcdTkwM0JcdThGOTFcdUZGMDhcdTRFQzVcdTk3NUUgYnVuZGxlIFx1NkEyMVx1NUYwRlx1OTcwMFx1ODk4MVx1RkYwOVxuICAgIGlmICghYXdhaXQgdGhpcy5maWxlRXhpc3RzKGFkYXB0ZXIsIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9L2Fzc2V0cy9zY3JpcHRzL2J1bmRsZS5qc2ApKSkge1xuICAgICAgaHRtbCA9IHRoaXMuZml4QnJpZGdlU2VsZWN0aW9uKGh0bWwpO1xuICAgIH1cblxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbaHRtbF0sIHsgdHlwZTogJ3RleHQvaHRtbCcgfSk7XG4gICAgY29uc3QgYmxvYlVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgdGhpcy5ibG9iVXJscy5wdXNoKGJsb2JVcmwpO1xuICAgIHJldHVybiBibG9iVXJsO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbmxpbmVTdHlsZXMoaHRtbDogc3RyaW5nLCBhZGFwdGVyOiBEYXRhQWRhcHRlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgbGlua1JlZ2V4ID0gLzxsaW5rXFxzK1tePl0qcmVsPVtcIiddc3R5bGVzaGVldFtcIiddW14+XSpocmVmPVtcIiddKFteXCInXSspW1wiJ11bXj5dKlxcLz8+L2dpO1xuICAgIGNvbnN0IGxpbmtzOiBBcnJheTx7IGZ1bGw6IHN0cmluZzsgaHJlZjogc3RyaW5nIH0+ID0gW107XG4gICAgbGV0IG1hdGNoO1xuICAgIHdoaWxlICgobWF0Y2ggPSBsaW5rUmVnZXguZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICAgIGxpbmtzLnB1c2goeyBmdWxsOiBtYXRjaFswXSwgaHJlZjogbWF0Y2hbMV0gfSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgeyBmdWxsLCBocmVmIH0gb2YgbGlua3MpIHtcbiAgICAgIGNvbnN0IGNsZWFuSHJlZiA9IGhyZWYuc3BsaXQoJz8nKVswXTtcbiAgICAgIGNvbnN0IGNzc1BhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS8ke2NsZWFuSHJlZn1gKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNzcyA9IGF3YWl0IGFkYXB0ZXIucmVhZChjc3NQYXRoKTtcbiAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShmdWxsLCBgPHN0eWxlIGRhdGEtc3JjPVwiJHtjbGVhbkhyZWZ9XCI+XFxuJHtjc3N9XFxuPC9zdHlsZT5gKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbQXBwSG9zdF0gXHU2NUUwXHU2Q0Q1XHU1MkEwXHU4RjdEIENTUzogJHtjc3NQYXRofWAsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcHJvY2Vzc1NjcmlwdHMoaHRtbDogc3RyaW5nLCBhZGFwdGVyOiBEYXRhQWRhcHRlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYnVuZGxlUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9L2Fzc2V0cy9zY3JpcHRzL2J1bmRsZS5qc2ApO1xuICAgIGNvbnN0IGhhc0J1bmRsZSA9IGF3YWl0IHRoaXMuZmlsZUV4aXN0cyhhZGFwdGVyLCBidW5kbGVQYXRoKTtcblxuICAgIGlmIChoYXNCdW5kbGUpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVzZUJ1bmRsZShodG1sLCBhZGFwdGVyLCBidW5kbGVQYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMudXNlSW5kaXZpZHVhbFNjcmlwdHMoaHRtbCwgYWRhcHRlcik7XG4gIH1cblxuICAvKipcbiAgICogXHU0RjdGXHU3NTI4XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5IGJ1bmRsZS5qcyBcdTIwMTQgXHU2NkZGXHU2MzYyXHU2MjQwXHU2NzA5XHU1OTE2XHU5MEU4IG1vZHVsZSBcdTgxMUFcdTY3MkNcdTRFM0FcdTUzNTVcdTRFMkFcdTgxMUFcdTY3MkNcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdXNlQnVuZGxlKGh0bWw6IHN0cmluZywgYWRhcHRlcjogRGF0YUFkYXB0ZXIsIGJ1bmRsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc29sZS5sb2coJ1tBcHBIb3N0XSBcdTRGN0ZcdTc1MjggYnVuZGxlLmpzJyk7XG4gICAgY29uc3QgYnVuZGxlQ29udGVudCA9IGF3YWl0IGFkYXB0ZXIucmVhZChidW5kbGVQYXRoKTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2J1bmRsZUNvbnRlbnRdLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JyB9KTtcbiAgICBjb25zdCBibG9iVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICB0aGlzLmJsb2JVcmxzLnB1c2goYmxvYlVybCk7XG5cbiAgICAvLyBcdTY2RkZcdTYzNjJcdTYyNDBcdTY3MDlcdTU5MTZcdTkwRTggPHNjcmlwdCB0eXBlPVwibW9kdWxlXCIgc3JjPVwiLi4uXCI+XG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvPHNjcmlwdFxccytbXj5dKj9zcmM9W1wiJ11bXlwiJ10rW1wiJ11bXj5dKj8+XFxzKjxcXC9zY3JpcHQ+L2dpLCAnJyk7XG5cbiAgICAvLyBcdTU3MjhcdTdCMkNcdTRFMDBcdTRFMkEgPHNjcmlwdD4gXHU2ODA3XHU3QjdFXHU1MjREXHU2M0QyXHU1MTY1IGJ1bmRsZVx1RkYwOFx1Nzg2RVx1NEZERCBnbG9iYWxzIFx1NTcyOCBpbmxpbmUgc2NyaXB0cyBcdTRFNEJcdTUyNERcdTUyQTBcdThGN0RcdUZGMDlcbiAgICBjb25zdCBidW5kbGVUYWcgPSBgPHNjcmlwdCBzcmM9XCIke2Jsb2JVcmx9XCI+PC9zY3JpcHQ+YDtcbiAgICBjb25zdCBmaXJzdFNjcmlwdCA9IGh0bWwuc2VhcmNoKC88c2NyaXB0L2kpO1xuICAgIGlmIChmaXJzdFNjcmlwdCA+PSAwKSB7XG4gICAgICBodG1sID0gaHRtbC5zbGljZSgwLCBmaXJzdFNjcmlwdCkgKyBidW5kbGVUYWcgKyAnXFxuJyArIGh0bWwuc2xpY2UoZmlyc3RTY3JpcHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBodG1sID0gaHRtbC5yZXBsYWNlKCc8L2JvZHk+JywgYCR7YnVuZGxlVGFnfVxcbjwvYm9keT5gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTU2REVcdTkwMDBcdTY1QjlcdTY4NDhcdUZGMUFcdTkwMTBcdTRFMkFcdTUyMUJcdTVFRkEgYmxvYiBVUkwgKyBcdTkxQ0RcdTUxOTkgaW1wb3J0IFx1OERFRlx1NUY4NFxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB1c2VJbmRpdmlkdWFsU2NyaXB0cyhodG1sOiBzdHJpbmcsIF9hZGFwdGVyOiBEYXRhQWRhcHRlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gXHU1NkRFXHU5MDAwXHU2NUI5XHU2ODQ4XHVGRjFBXHU0RTBEXHU1OTA0XHU3NDA2XHVGRjA4XHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHU1MzlGXHU1OUNCIEhUTUxcdUZGMDlcbiAgICBjb25zb2xlLndhcm4oJ1tBcHBIb3N0XSBcdTY3MkFcdTYyN0VcdTUyMzAgYnVuZGxlLmpzXHVGRjBDXHU4REYzXHU4RkM3IEpTIFx1NTkwNFx1NzQwNicpO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmaWxlRXhpc3RzKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGFkYXB0ZXIuZXhpc3RzKHBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZml4QnJpZGdlU2VsZWN0aW9uKGh0bWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3Qgb2xkU2NyaXB0ID0gLzxzY3JpcHQ+XFxzKlxcL1xcLyBPYnNpZGlhbiBpZnJhbWUgXHU2OEMwXHU2RDRCW1xcc1xcU10qPzxcXC9zY3JpcHQ+LztcbiAgICBodG1sID0gaHRtbC5yZXBsYWNlKG9sZFNjcmlwdCwgJzxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiIHNyYz1cImFzc2V0cy9zY3JpcHRzL3N0b3JhZ2UvYnJpZGdlLmpzP19fQlVJTERfX1wiPjwvc2NyaXB0PicpO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHVybCBvZiB0aGlzLmJsb2JVcmxzKSB7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfVxuICAgIHRoaXMuYmxvYlVybHMgPSBbXTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgRGF0YUFkYXB0ZXIsIG5vcm1hbGl6ZVBhdGggfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuLi9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzLCBOb2lzZUl0ZW0gfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5pbXBvcnQgeyBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgfSBmcm9tICcuLi9jb25zdGFudHMvYXVkaW8nO1xuaW1wb3J0IHR5cGUgeyBEYXlEYXRhIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MEQgKi9cbmNvbnN0IFNLSVBfRElSUyA9IFsnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ107XG5cbi8qKlxuICogQXBwQVBJIFx1MjAxNCBcdTdFREZcdTRFMDBcdTkwMUFcdTRGRTFcdTYzQTVcdTUzRTNcbiAqXG4gKiBcdTY2RkZcdTRFRTNcdTY1RTdcdTc2ODQgQnJpZGdlU2VydmljZSArIFN0b3JhZ2VCcmlkZ2UgKyBUaGVtZUJyaWRnZSBcdTRFMDlcdTVDNDJcdTY3QjZcdTY3ODRcdUZGMENcbiAqIFx1NUMwNiBwb3N0TWVzc2FnZSBcdThERUZcdTc1MzFcdTMwMDFcdTVCNThcdTUwQThcdTY0Q0RcdTRGNUNcdTMwMDFcdTRFM0JcdTk4OThcdTU0MENcdTZCNjVcdTU0MDhcdTVFNzZcdTRFM0FcdTUzNTVcdTRFMDAgQVBJXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBBUEkge1xuICBwcml2YXRlIHN0b3JhZ2U6IFZhdWx0U3RvcmFnZTtcbiAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2U7XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjdXN0b21UaGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgcHJpdmF0ZSB2YXVsdEFkYXB0ZXI6IERhdGFBZGFwdGVyO1xuICBwcml2YXRlIG5vaXNlUGF0aDogc3RyaW5nO1xuICBwcml2YXRlIGNvbmZpZ0Rpcjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbiAgICBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD4sXG4gICAgbm9pc2VQYXRoOiBzdHJpbmcsXG4gICAgY29uZmlnRGlyOiBzdHJpbmdcbiAgKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICAgIHRoaXMuc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UoYXBwKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbmV3IFRoZW1lQnJpZGdlKCk7XG4gICAgdGhpcy52YXVsdEFkYXB0ZXIgPSBhcHAudmF1bHQuYWRhcHRlcjtcbiAgICB0aGlzLm5vaXNlUGF0aCA9IG5vaXNlUGF0aDtcbiAgICB0aGlzLmNvbmZpZ0RpciA9IGNvbmZpZ0RpcjtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTVCNThcdTUwQThcdTdFRDNcdTY3ODRcdTVCNThcdTU3MjggKi9cbiAgYXN5bmMgZW5zdXJlU3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyMTdcdTg4NjggKi9cbiAgc2V0Q3VzdG9tVGhlbWVzKHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pik6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tVGhlbWVzID0gdGhlbWVzO1xuICB9XG5cbiAgLyoqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RTc2XHU1RjAwXHU1OUNCXHU3NkQxXHU1NDJDXHU2RDg4XHU2MDZGICovXG4gIGF0dGFjaChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5kZXRhY2goKTtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZShpZnJhbWUpO1xuXG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICB2b2lkIHRoaXMub25NZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxXHU1RTc2XHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZXNzYWdlSGFuZGxlcikge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnRoZW1lQnJpZGdlLmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDFcdUZGMDhcdTc1MzEgRGFpbHlSZXZpZXdWaWV3IFx1NzY4NCBjc3MtY2hhbmdlIFx1NEU4Qlx1NEVGNlx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBvblRoZW1lQ2hhbmdlZChmb2xsb3dPYnNpZGlhblRoZW1lOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lID0gZm9sbG93T2JzaWRpYW5UaGVtZTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZShmb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NjIxMFx1NTI5Rlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmQoaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgaWQsIHBheWxvYWQgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1OTUxOVx1OEJFRlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmRFcnJvcihpZDogc3RyaW5nLCBlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyBpZCwgZXJyb3IgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdThERUZcdTc1MzEgKi9cbiAgcHJpdmF0ZSBhc3luYyBvbk1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1zZyA9IGV2ZW50LmRhdGEgYXMgeyB0eXBlPzogc3RyaW5nOyBpZD86IHN0cmluZzsgcGF5bG9hZD86IHVua25vd24gfTtcbiAgICBpZiAoIW1zZyB8fCAhbXNnLnR5cGUgfHwgIW1zZy5pZCkgcmV0dXJuO1xuXG4gICAgLy8gXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgLy8gXHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXHU3NjdEXHU1NDBEXHU1MzU1XG4gICAgY29uc3QgdmFsaWRQcmVmaXhlcyA9IFsnc3RvcmFnZTonLCAnYXBwOicsICdmaWxlOicsICd0aGVtZTonXTtcbiAgICBpZiAoIXZhbGlkUHJlZml4ZXMuc29tZSgocCkgPT4gbXNnLnR5cGUhLnN0YXJ0c1dpdGgocCkpKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVNZXNzYWdlKG1zZy50eXBlLCBtc2cuaWQsIG1zZy5wYXlsb2FkID8/IHt9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NkQ4OFx1NjA2Rlx1NTIwNlx1NTNEMVx1NTkwNFx1NzQwNiAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZU1lc3NhZ2UodHlwZTogc3RyaW5nLCBpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gLS0tLSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUYgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWR5Jykge1xuICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnIHx8IG51bGwsXG4gICAgICAgIGN1c3RvbVRoZW1lczogdGhpcy5jdXN0b21UaGVtZXMsXG4gICAgICAgIGN1c3RvbU5vaXNlczogdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zIHx8IFtdLFxuICAgICAgICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IHRoaXMuc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6Y2xvc2UnKSB7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkUgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnID0gcGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zID0gKEFycmF5LmlzQXJyYXkocGF5bG9hZCkgPyBwYXlsb2FkIDogW10pIGFzIE5vaXNlSXRlbVtdO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1NEUzQlx1OTg5OFx1NTIwN1x1NjM2MiAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6dG9nZ2xlVGhlbWUnKSB7XG4gICAgICBjb25zdCBwID0gcGF5bG9hZCBhcyB7IGlzRGFyazogYm9vbGVhbiB9O1xuICAgICAgY29uc3QgY3VycmVudElzRGFyayA9IGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gICAgICBpZiAocC5pc0RhcmsgIT09IGN1cnJlbnRJc0RhcmspIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Q2xhc3MgPSBwLmlzRGFyayA/ICd0aGVtZS1kYXJrJyA6ICd0aGVtZS1saWdodCc7XG4gICAgICAgIGNvbnN0IHJlbW92ZUNsYXNzID0gcC5pc0RhcmsgPyAndGhlbWUtbGlnaHQnIDogJ3RoZW1lLWRhcmsnO1xuICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUocmVtb3ZlQ2xhc3MpO1xuICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQodGFyZ2V0Q2xhc3MpO1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSh0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlLCBpc0Rhcms6IHAuaXNEYXJrIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhblx1RkYwOS0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ3RoZW1lOnN5bmNQYWxldHRlJykge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyBodWU6IG51bWJlcjsgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXI7IGlzRGFyazogYm9vbGVhbiB9O1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKSB7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UuYXBwbHlQYWxldHRlKHAuaHVlLCBwLmxpZ2h0bmVzc09mZnNldCwgcC5pc0RhcmspO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjZCXHU2M0NGIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpsaXN0VmF1bHRBdWRpb0ZpbGVzJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLnNjYW5WYXVsdEF1ZGlvRmlsZXMoKTtcbiAgICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IGZpbGVzIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjI2Qlx1NjNDRlx1NUU5M1x1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpyZWFkVmF1bHRGaWxlJykge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSZWFkVmF1bHRGaWxlKGlkLCBwYXlsb2FkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2Rlx1RkYwOFx1NTlENFx1NjI1OFx1N0VEOSBWYXVsdFN0b3JhZ2VcdUZGMDktLS0tXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5oYW5kbGVTdG9yYWdlTWVzc2FnZSh0eXBlLCBwYXlsb2FkKTtcbiAgICB0aGlzLnJlc3BvbmQoaWQsIHJlc3VsdCk7XG4gIH1cblxuICAvKiogXHU1QjU4XHU1MEE4XHU2RDg4XHU2MDZGXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlU3RvcmFnZU1lc3NhZ2UodHlwZTogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcCA9IHBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShwLmRhdGVLZXkgYXMgc3RyaW5nKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dERheShwLmRhdGEgYXMgRGF5RGF0YSk7XG4gICAgICBjYXNlICdzdG9yYWdlOmxpc3REYXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxEYXlzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlRGF5KHAuZGF0ZUtleSBhcyBzdHJpbmcpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRTZXR0aW5nKHAua2V5IGFzIHN0cmluZyk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFNldHRpbmcocC5rZXkgYXMgc3RyaW5nLCBwLnZhbHVlKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbFNldHRpbmdzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0R29hbHMocC5nb2FscyBhcyBuZXZlcik7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0UHVyY2hhc2VIaXN0b3J5KHAuZGF0YSBhcyBuZXZlcik7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0SW5jb21lSGlzdG9yeShwLmRhdGEgYXMgbmV2ZXIpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheXNQYWdpbmF0ZWQnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheXNQYWdpbmF0ZWQoXG4gICAgICAgICAgKHAucGFnZSBhcyBudW1iZXIpID8/IDAsXG4gICAgICAgICAgKHAucGFnZVNpemUgYXMgbnVtYmVyKSA/PyAzMFxuICAgICAgICApO1xuICAgICAgY2FzZSAnc3RvcmFnZTpleHBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmV4cG9ydEFsbERhdGEoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKFxuICAgICAgICAgIHAuZGF0YSxcbiAgICAgICAgICB7IHN0cmF0ZWd5OiAocC5vcHRpb25zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KT8uc3RyYXRlZ3kgYXMgJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIHwgdW5kZWZpbmVkIH1cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Y2xlYXJBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyQWxsKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RvcmFnZSBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgYXN5bmMgc2NhblZhdWx0QXVkaW9GaWxlcyhcbiAgICBtYXhEZXB0aCA9IDVcbiAgKTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLnZhdWx0QWRhcHRlcjtcblxuICAgIGlmICh0aGlzLm5vaXNlUGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IGFkYXB0ZXIubGlzdCh0aGlzLm5vaXNlUGF0aCk7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0LmZpbGVzKSB7XG4gICAgICAgICAgaWYgKGZpbGUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBleHQgPSBmaWxlLnN1YnN0cmluZyhmaWxlLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKEFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5ub2lzZVBhdGh9LyR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IGZ1bGxQYXRoLCBuYW1lOiBmaWxlLCBzaXplOiBzdGF0Py5zaXplID8/IDAsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTUxNjhcdTVFOTNcdTYyNkJcdTYzQ0ZcbiAgICBjb25zdCBzY2FuRGlyID0gYXN5bmMgKHJlbGF0aXZlRGlyOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICBsZXQgbGlzdDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxpc3QgPSBhd2FpdCBhZGFwdGVyLmxpc3QocmVsYXRpdmVEaXIpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XG4gICAgICAgIGlmIChmb2xkZXIuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc2tpcFNldCA9IG5ldyBTZXQoWy4uLlNLSVBfRElSUywgLi4uKHRoaXMuY29uZmlnRGlyID8gW3RoaXMuY29uZmlnRGlyXSA6IFtdKV0pO1xuICAgICAgICBpZiAoc2tpcFNldC5oYXMoZm9sZGVyKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHN1YlBhdGggPSByZWxhdGl2ZURpciA/IG5vcm1hbGl6ZVBhdGgoYCR7cmVsYXRpdmVEaXJ9LyR7Zm9sZGVyfWApIDogZm9sZGVyO1xuICAgICAgICBhd2FpdCBzY2FuRGlyKHN1YlBhdGgsIGRlcHRoICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0LmZpbGVzKSB7XG4gICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGV4dCA9IGZpbGUuc3Vic3RyaW5nKGZpbGUubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKEFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlRGlyID8gbm9ybWFsaXplUGF0aChgJHtyZWxhdGl2ZURpcn0vJHtmaWxlfWApIDogZmlsZTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQocmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHJlbGF0aXZlUGF0aCwgbmFtZTogZmlsZSwgc2l6ZTogc3RhdD8uc2l6ZSA/PyAwLCBleHQgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGF3YWl0IHNjYW5EaXIoJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUmVhZFZhdWx0RmlsZShpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgcGF0aDogc3RyaW5nIH07XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwLnBhdGggfHwgJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcblxuICAgICAgY29uc3QgZXh0ID0gcmVsYXRpdmVQYXRoLnN1YnN0cmluZyhyZWxhdGl2ZVBhdGgubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICBpZiAocmVsYXRpdmVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuXG4gICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy52YXVsdEFkYXB0ZXI7XG4gICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KHJlbGF0aXZlUGF0aCk7XG4gICAgICBpZiAoIXN0YXQgfHwgc3RhdC50eXBlICE9PSAnZmlsZScpIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG5cbiAgICAgIC8vIFx1ODNCN1x1NTNENlx1NjU4N1x1NEVGNlx1NzY4NFx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1NEY5Qlx1OTdGM1x1OTg5MVx1NEY3Rlx1NzUyOFxuICAgICAgY29uc3QgYmFzZVBhdGggPSAoYWRhcHRlciBhcyB1bmtub3duIGFzIHsgYmFzZVBhdGg6IHN0cmluZyB9KS5iYXNlUGF0aCB8fCAnJztcbiAgICAgIGlmICghYmFzZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU1RTkzXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0Jyk7XG4gICAgICBjb25zdCBmdWxsUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7YmFzZVBhdGh9LyR7cmVsYXRpdmVQYXRofWApO1xuICAgICAgaWYgKCFmdWxsUGF0aC5zdGFydHNXaXRoKGJhc2VQYXRoKSkgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjInKTtcblxuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7XG4gICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgbmFtZTogcmVsYXRpdmVQYXRoLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoZXh0LCAnJykgfHwgJycsXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBJbXBvcnRWYWxpZGF0b3IgfSBmcm9tICcuL0ltcG9ydFZhbGlkYXRvcic7XG5pbXBvcnQgdHlwZSB7XG4gIERheURhdGEsXG4gIEdvYWxJdGVtLFxuICBBcHBTZXR0aW5ncyxcbiAgUHVyY2hhc2VIaXN0b3J5LFxuICBJbmNvbWVIaXN0b3J5LFxuICBFeHBvcnRTaGFwZSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxEYXlEYXRhIHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIERheURhdGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdUZGMENcdTVDMDZcdThERjNcdThGQzc6ICR7cGF0aH1gLCBlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbERheXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPj4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IGZpbGVzLmZpbGVzXG4gICAgICAuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzb24nKSlcbiAgICAgIC5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmICghZGF0ZUtleSkgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChmaWxlKTtcbiAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyBEYXlEYXRhO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcGFyc2UgZGF5IGZpbGU6ICR7ZmlsZX1gLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG4gICAgcmV0dXJuIGRheXM7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU2NUU1XHU2NzFGIGtleVx1RkYwOFx1NjMwOVx1NjVFNVx1NjcxRlx1OTY0RFx1NUU4Rlx1RkYwQ1x1NjcwMFx1NjVCMFx1NTcyOFx1NTI0RFx1RkYwOSAqL1xuICBhc3luYyBnZXREYXlLZXlzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5maWxlcykge1xuICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmIChkYXRlS2V5KSBrZXlzLnB1c2goZGF0ZUtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIGtleXMuc29ydCgpLnJldmVyc2UoKTsgLy8gXHU5NjREXHU1RThGXHVGRjFBXHU2NzAwXHU2NUIwXHU2NUU1XHU2NzFGXHU1NzI4XHU1MjREXG4gICAgcmV0dXJuIGtleXM7XG4gIH1cblxuICAvKipcbiAgICogXHU1MjA2XHU5ODc1XHU1MkEwXHU4RjdEXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXG4gICAqIEBwYXJhbSBwYWdlIFx1OTg3NVx1NzgwMVx1RkYwOFx1NEVDRSAwIFx1NUYwMFx1NTlDQlx1RkYwOVxuICAgKiBAcGFyYW0gcGFnZVNpemUgXHU2QkNGXHU5ODc1XHU2NTcwXHU5MUNGXG4gICAqIEByZXR1cm5zIHsgZGF5cywgdG90YWwsIHBhZ2UsIHBhZ2VTaXplLCBoYXNNb3JlIH1cbiAgICovXG4gIGFzeW5jIGdldERheXNQYWdpbmF0ZWQocGFnZSA9IDAsIHBhZ2VTaXplID0gMzApOiBQcm9taXNlPHtcbiAgICBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICBrZXlzOiBzdHJpbmdbXTtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIGhhc01vcmU6IGJvb2xlYW47XG4gIH0+IHtcbiAgICBjb25zdCBhbGxLZXlzID0gYXdhaXQgdGhpcy5nZXREYXlLZXlzKCk7XG4gICAgY29uc3QgdG90YWwgPSBhbGxLZXlzLmxlbmd0aDtcbiAgICBjb25zdCBzdGFydCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBwYWdlS2V5cyA9IGFsbEtleXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IHBhZ2VLZXlzLm1hcChhc3luYyAoZGF0ZUtleSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0RGF5KGRhdGVLZXkpO1xuICAgICAgICBpZiAoZGF0YSkgZGF5c1tkYXRlS2V5XSA9IGRhdGE7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGxvYWQgZGF5OiAke2RhdGVLZXl9YCwgZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheXMsXG4gICAgICBrZXlzOiBwYWdlS2V5cyxcbiAgICAgIHRvdGFsLFxuICAgICAgcGFnZSxcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgaGFzTW9yZTogc3RhcnQgKyBwYWdlS2V5cy5sZW5ndGggPCB0b3RhbCxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcHV0RGF5KGRheURhdGE6IERheURhdGEpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxHb2FsSXRlbVtdPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBHb2FsSXRlbVtdO1xuICB9XG5cbiAgYXN5bmMgcHV0R29hbHMoZ29hbHM6IEdvYWxJdGVtW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBKU09OLnBhcnNlKGRhdGEpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgMik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHsgW2tleV06IHZhbHVlIH0sIG51bGwsIDIpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxTZXR0aW5ncygpOiBQcm9taXNlPEFwcFNldHRpbmdzPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBBcHBTZXR0aW5ncztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1OEQyRFx1NEU3MFx1NTM4Nlx1NTNGMiAocHVyY2hhc2UtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBwdXJjaGFzZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcHVyY2hhc2UtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRQdXJjaGFzZUhpc3RvcnkoKTogUHJvbWlzZTxQdXJjaGFzZUhpc3RvcnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBQdXJjaGFzZUhpc3Rvcnk7XG4gIH1cblxuICBhc3luYyBwdXRQdXJjaGFzZUhpc3RvcnkoZGF0YTogUHVyY2hhc2VIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMiAoaW5jb21lLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgaW5jb21lSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9pbmNvbWUtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRJbmNvbWVIaXN0b3J5KCk6IFByb21pc2U8SW5jb21lSGlzdG9yeSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBJbmNvbWVIaXN0b3J5O1xuICB9XG5cbiAgYXN5bmMgcHV0SW5jb21lSGlzdG9yeShkYXRhOiBJbmNvbWVIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTVCRkNcdTUxRkEvXHU1QkZDXHU1MTY1IC0tLS1cblxuICBhc3luYyBleHBvcnRBbGxEYXRhKCk6IFByb21pc2U8RXhwb3J0U2hhcGU+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiB1bmtub3duLCBvcHRpb25zOiB7IHN0cmF0ZWd5PzogJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIH0gPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gICAgY29uc3Qgc3RyYXRlZ3kgPSBvcHRpb25zLnN0cmF0ZWd5ID8/ICdvdmVyd3JpdGUnO1xuXG4gICAgLy8gUDJcdUZGMUFcdTVCRkNcdTUxNjVcdTUyNERcdTY4MjFcdTlBOEMgKyBcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdUZGMUJcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTU3MjhcdTZCNjRcdTg4QUJcdTYyRDJcdTdFRERcdUZGMENcdTRFMERcdTZDNjFcdTY3RDMgVmF1bHRcbiAgICBjb25zdCByZWNvcmQgPSBJbXBvcnRWYWxpZGF0b3IudmFsaWRhdGUoZGF0YSk7XG5cbiAgICBpZiAocmVjb3JkLmRheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gXHU5NjMyXHU1RkExXHVGRjFBZGF5cyBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTdBN0FcdTVCRjlcdThDNjFcdTg4NjhcdTc5M0FcdTZFMDVcdTdBN0FcdTUxNjhcdTkwRThcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMDhcdTRFQzUgb3ZlcndyaXRlIFx1OEJFRFx1NEU0OVx1NEUwQlx1NTE0MVx1OEJCOFx1RkYwOVxuICAgICAgY29uc3QgZGF5cyA9IChyZWNvcmQuZGF5cyAmJiB0eXBlb2YgcmVjb3JkLmRheXMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHJlY29yZC5kYXlzKSlcbiAgICAgICAgPyByZWNvcmQuZGF5c1xuICAgICAgICA6IHt9O1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnb3ZlcndyaXRlJykge1xuICAgICAgICBhd2FpdCB0aGlzLmNsZWFyQWxsRGF5cygpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBkYXkgb2YgT2JqZWN0LnZhbHVlcyhkYXlzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dERheShkYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWNvcmQuZ29hbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgaW5jb21pbmc6IEdvYWxJdGVtW10gPSBBcnJheS5pc0FycmF5KHJlY29yZC5nb2FscykgPyByZWNvcmQuZ29hbHMgOiBbXTtcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ21lcmdlJykge1xuICAgICAgICAvLyBcdTU0MDhcdTVFNzZcdUZGMUFcdTRGRERcdTc1NTlcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTVCRkNcdTUxNjVcdTc2RUVcdTY4MDdcdTYzMDkgaWQgXHU4OTg2XHU3NkQ2XHVGRjFCXHU3QTdBXHU2NTcwXHU3RUM0XHU0RTBEXHU4OUU2XHU1M0QxXHU2RTA1XHU3QTdBXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKGF3YWl0IHRoaXMuZ2V0R29hbHMoKSkgfHwgW107XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXAoZXhpc3RpbmcubWFwKChnKSA9PiBbZy5pZCwgZ10pKTtcbiAgICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGluY29taW5nKSB7XG4gICAgICAgICAgaWYgKGdvYWwgJiYgZ29hbC5pZCkgbWVyZ2VkLnNldChnb2FsLmlkLCBnb2FsKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKEFycmF5LmZyb20obWVyZ2VkLnZhbHVlcygpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvdmVyd3JpdGVcdUZGMUFcdTY1NzRcdTRGNTNcdTY2RkZcdTYzNjJcdUZGMDhcdTdBN0FcdTY1NzBcdTdFQzQgPSBcdTZFMDVcdTdBN0FcdUZGMENcdTdCMjZcdTU0MDhcdTk4ODRcdTY3MUZcdThCRURcdTRFNDlcdUZGMDlcbiAgICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhpbmNvbWluZyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmIHJlY29yZC5zZXR0aW5ncyAmJiB0eXBlb2YgcmVjb3JkLnNldHRpbmdzID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgaW5jb21pbmcgPSByZWNvcmQuc2V0dGluZ3M7XG4gICAgICBsZXQgdG9Xcml0ZTogQXBwU2V0dGluZ3M7XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdtZXJnZScpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSAoYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpKSB8fCB7fTtcbiAgICAgICAgdG9Xcml0ZSA9IHsgLi4uZXhpc3RpbmcsIC4uLmluY29taW5nIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b1dyaXRlID0gaW5jb21pbmc7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUodGhpcy5zZXR0aW5nc1BhdGgoKSwgSlNPTi5zdHJpbmdpZnkodG9Xcml0ZSwgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIGlmIChyZWNvcmQucHVyY2hhc2VIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0UHVyY2hhc2VIaXN0b3J5KHJlY29yZC5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmluY29tZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRJbmNvbWVIaXN0b3J5KHJlY29yZC5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU0RUM1XHU2RTA1XHU3QTdBXHU2MjQwXHU2NzA5XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjA4b3ZlcndyaXRlIFx1NUJGQ1x1NTE2NSBkYXlzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwQ1x1NEUwRFx1NUY3MVx1NTRDRCBnb2Fscy9zZXR0aW5nc1x1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbERheXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhkYXRhRGlyKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcihkYXRhRGlyLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgfVxuXG4gIC8qKiBcdTRFQzVcdTZFMDVcdTdBN0FcdThCQkVcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMDhvdmVyd3JpdGUgXHU1QkZDXHU1MTY1IHNldHRpbmdzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2xlYXJBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKHRoaXMuYmFzZVBhdGgsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICB9XG5cbiAgLy8gLS0tLSBNYXJrZG93biBcdTY0NThcdTg5ODEgLS0tLVxuXG4gIHByaXZhdGUgcmV2aWV3UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3Jldmlld3MvJHtkYXRlS2V5fS5tZGApO1xuICB9XG5cbiAgYXN5bmMgd3JpdGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcsIG1hcmtkb3duOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIG1hcmtkb3duKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIEltcG9ydFZhbGlkYXRvciAtIFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1NzY4NFx1NjgyMVx1OUE4Q1x1NEUwRVx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1RkYwOFx1NUJCRlx1NEUzQlx1NEZBN1x1RkYwQ1x1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwOVxuICpcbiAqIFx1NzUyOFx1OTAxNFx1RkYxQVx1NTcyOCBWYXVsdFN0b3JhZ2UuaW1wb3J0RGF0YSBcdTg0M0RcdTc2RDhcdTUyNERcdTYyRTZcdTYyMkFcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTMwMDFcdTg4NjVcdTlGNTBcdTdGM0FcdTU5MzFcdTVCNTdcdTZCQjVcdUZGMENcbiAqIFx1OTA3Rlx1NTE0RFx1NTM0QVx1NjIyQS9cdTk3NUVcdTZDRDVcdTY1NzBcdTYzNkVcdTZDNjFcdTY3RDMgVmF1bHRcdTMwMDJcbiAqXG4gKiBcdThCQkVcdThCQTFcdTUzOUZcdTUyMTlcdUZGMUFcbiAqICAtIFx1NEVDNVx1NTA1QVwiXHU3RUQzXHU2Nzg0XHU1QzQyXHU5NzYyXHU3Njg0XHU1Qjg5XHU1MTY4XHU1MTVDXHU1RTk1XCJcdUZGMENcdTRFMERcdTkxQ0RcdTUxOTlcdTRFMUFcdTUyQTFcdTVCNTdcdTZCQjVcdUZGMDhcdTU5ODIgbWV0cmljcyBcdTc2ODRcdTUxNzdcdTRGNTNcdTY1NzBcdTUwM0NcdUZGMDlcdTMwMDJcbiAqICAtIFx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1NEYxOFx1NTE0OFx1NzUyOFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1ODFFQVx1OEVBQlx1NzY4NCBrZXkgLyBcdTUxODVcdTVCQjlcdUZGMENcdTdGM0FcdTU5MzFcdTY1RjZcdTYyNERcdTc1MjhcdTVCODlcdTUxNjhcdTlFRDhcdThCQTRcdTUwM0NcdTMwMDJcbiAqICAtIFx1NEVGQlx1NEY1NVx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NzY4NFx1N0VEM1x1Njc4NFx1NjAyN1x1NjM1Rlx1NTc0Rlx1OTBGRFx1NjI5QiBJbXBvcnRWYWxpZGF0aW9uRXJyb3JcdUZGMENcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTc5M0FcdTc1MjhcdTYyMzdcdTMwMDJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERheURhdGEsXG4gIEdvYWxJdGVtLFxuICBBcHBTZXR0aW5ncyxcbiAgUHVyY2hhc2VIaXN0b3J5LFxuICBJbmNvbWVIaXN0b3J5LFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuZXhwb3J0IGNsYXNzIEltcG9ydFZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0ltcG9ydFZhbGlkYXRpb25FcnJvcic7XG4gIH1cbn1cblxuY29uc3QgS05PV05fRklFTERTID0gWydkYXlzJywgJ2dvYWxzJywgJ3NldHRpbmdzJywgJ3B1cmNoYXNlSGlzdG9yeScsICdpbmNvbWVIaXN0b3J5J10gYXMgY29uc3Q7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVkSW1wb3J0IHtcbiAgZGF5cz86IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICBnb2Fscz86IEdvYWxJdGVtW107XG4gIHNldHRpbmdzPzogQXBwU2V0dGluZ3M7XG4gIHB1cmNoYXNlSGlzdG9yeT86IFB1cmNoYXNlSGlzdG9yeTtcbiAgaW5jb21lSGlzdG9yeT86IEluY29tZUhpc3Rvcnk7XG59XG5cbmV4cG9ydCBjb25zdCBJbXBvcnRWYWxpZGF0b3IgPSB7XG4gIC8qKlxuICAgKiBcdTY4MjFcdTlBOENcdTVFNzZcdTg4NjVcdTlGNTBcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTMwMDJcbiAgICogQHJldHVybnMgXHU4ODY1XHU5RjUwXHU1NDBFXHU3Njg0XHU1RTcyXHU1MUMwXHU2NTcwXHU2MzZFXHVGRjA4XHU3RUQzXHU2Nzg0XHU0RTBFXHU4RjkzXHU1MTY1XHU0RTAwXHU4MUY0XHVGRjBDXHU0RjQ2XHU1QjU3XHU2QkI1XHU1QjhDXHU2NTc0XHVGRjA5XG4gICAqIEB0aHJvd3MgSW1wb3J0VmFsaWRhdGlvbkVycm9yIFx1NUY1M1x1N0VEM1x1Njc4NFx1NjM1Rlx1NTc0Rlx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NjVGNlxuICAgKi9cbiAgdmFsaWRhdGUoZGF0YTogdW5rbm93bik6IFZhbGlkYXRlZEltcG9ydCB7XG4gICAgaWYgKCFkYXRhIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKCdcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcdTY4M0NcdTVGMEZcdTY1RTBcdTY1NDhcdUZGMUFcdTY4MzlcdTgyODJcdTcwQjlcdTVGQzVcdTk4N0JcdTY2MkYgSlNPTiBcdTVCRjlcdThDNjEnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSBkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgLy8gXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHU2MkQyXHU3RUREXHVGRjFBXHU2Q0ExXHU2NzA5XHU0RUZCXHU0RjU1XHU1REYyXHU3N0U1XHU1QjU3XHU2QkI1IFx1MjE5MiBcdTg5QzZcdTRFM0FcdTYzNUZcdTU3NEYvXHU2NUUwXHU1MTczXHU2NTg3XHU0RUY2XG4gICAgY29uc3QgaGFzS25vd25GaWVsZCA9IEtOT1dOX0ZJRUxEUy5zb21lKChmKSA9PiByZWNvcmRbZl0gIT09IHVuZGVmaW5lZCk7XG4gICAgaWYgKCFoYXNLbm93bkZpZWxkKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKFxuICAgICAgICAnXHU1OTA3XHU0RUZEXHU2NTg3XHU0RUY2XHU2NUUwXHU2NTQ4XHVGRjFBXHU2NzJBXHU2MjdFXHU1MjMwXHU0RUZCXHU0RjU1XHU1M0VGXHU4QkM2XHU1MjJCXHU3Njg0XHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHVGRjA4ZGF5cyAvIGdvYWxzIC8gc2V0dGluZ3MgLyBwdXJjaGFzZUhpc3RvcnkgLyBpbmNvbWVIaXN0b3J5XHVGRjA5J1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFZhbGlkYXRlZEltcG9ydCA9IHt9O1xuXG4gICAgaWYgKHJlY29yZC5kYXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5kYXlzID0gSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZURheXMocmVjb3JkLmRheXMpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmdvYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5nb2FscyA9IEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVHb2FscyhyZWNvcmQuZ29hbHMpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnNldHRpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5zZXR0aW5ncyA9IEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVTZXR0aW5ncyhyZWNvcmQuc2V0dGluZ3MpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQucHVyY2hhc2VIaXN0b3J5ID0gcmVjb3JkLnB1cmNoYXNlSGlzdG9yeSBhcyBQdXJjaGFzZUhpc3Rvcnk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQuaW5jb21lSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuaW5jb21lSGlzdG9yeSA9IHJlY29yZC5pbmNvbWVIaXN0b3J5IGFzIEluY29tZUhpc3Rvcnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IGRheXNcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU5NzVFXHU1QkY5XHU4QzYxXHVGRjA4XHU1OTgyXHU2NTcwXHU3RUM0L1x1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOVx1MjE5MiBcdTg5QzZcdTRFM0FcdTY1RTBcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTVCRjlcdThDNjFcdUZGMDhcdTRFMERcdTZDNjFcdTY3RDMgVmF1bHRcdUZGMDlcbiAgICogIC0gXHU2QkNGXHU0RTJBIGRheSBcdTdGM0EgZGF0ZSBcdTY1RjZcdTc1MjhcdTUxNzYga2V5IFx1ODg2NVx1OUY1MFxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZGF5IFx1N0YzQSBtZXRyaWNzL3RpbWVsaW5lL2dvYWxzIFx1NjVGNlx1ODg2NVx1N0E3QVx1N0VEM1x1Njc4NFxuICAgKi9cbiAgbm9ybWFsaXplRGF5cyhkYXlzOiB1bmtub3duKTogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4ge1xuICAgIGlmICghZGF5cyB8fCB0eXBlb2YgZGF5cyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXlzKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBjb25zdCByYXcgPSBkYXlzIGFzIFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICAgIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4gPSB7fTtcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJhdykpIHtcbiAgICAgIGNvbnN0IGRheSA9IHJhd1trZXldO1xuICAgICAgaWYgKCFkYXkgfHwgdHlwZW9mIGRheSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXkpKSB7XG4gICAgICAgIGNvbnRpbnVlOyAvLyBcdThERjNcdThGQzdcdTk3NUVcdTVCRjlcdThDNjFcdTY3NjFcdTc2RUVcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsZWFuOiBEYXlEYXRhID0geyAuLi5kYXkgfTtcbiAgICAgIGlmICghY2xlYW4uZGF0ZSkgY2xlYW4uZGF0ZSA9IGtleTsgLy8gXHU3NTI4IGtleSBcdTg4NjUgZGF0ZVxuICAgICAgaWYgKCFjbGVhbi5tZXRyaWNzIHx8IHR5cGVvZiBjbGVhbi5tZXRyaWNzICE9PSAnb2JqZWN0JykgY2xlYW4ubWV0cmljcyA9IHt9O1xuICAgICAgaWYgKCFjbGVhbi50aW1lbGluZSB8fCAhQXJyYXkuaXNBcnJheShjbGVhbi50aW1lbGluZSkpIGNsZWFuLnRpbWVsaW5lID0gW107XG4gICAgICBpZiAoIWNsZWFuLmdvYWxzIHx8ICFBcnJheS5pc0FycmF5KGNsZWFuLmdvYWxzKSkgY2xlYW4uZ29hbHMgPSBbXTtcbiAgICAgIG91dFtrZXldID0gY2xlYW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBnb2Fsc1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTY1NzBcdTdFQzRcdUZGMUJcdTk3NUVcdTY1NzBcdTdFQzQgXHUyMTkyIFx1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZ29hbCBcdTdGM0EgaWQgXHU2NUY2XHU4ODY1XHU0RTAwXHU0RTJBXHU3QTMzXHU1QjlBXHU1M0VGXHU1OTBEXHU3M0IwXHU3Njg0IGlkXG4gICAqL1xuICBub3JtYWxpemVHb2Fscyhnb2FsczogdW5rbm93bik6IEdvYWxJdGVtW10ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShnb2FscykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIHJldHVybiBnb2Fscy5tYXAoKHJhdyk6IEdvYWxJdGVtID0+IHtcbiAgICAgIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdyBhcyBHb2FsSXRlbTtcbiAgICAgIGNvbnN0IG9iaiA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGNvbnN0IGNsZWFuID0geyAuLi5vYmogfSBhcyB1bmtub3duIGFzIEdvYWxJdGVtO1xuICAgICAgaWYgKCFjbGVhbi5pZCkge1xuICAgICAgICBjbGVhbi5pZCA9IGBnb2FsX2ltcG9ydF8ke2NvdW50ZXIrK31fJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1gO1xuICAgICAgfVxuICAgICAgaWYgKGNsZWFuLml0ZW1zICYmICFBcnJheS5pc0FycmF5KGNsZWFuLml0ZW1zKSkgY2xlYW4uaXRlbXMgPSBbXTtcbiAgICAgIHJldHVybiBjbGVhbjtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IHNldHRpbmdzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1OTc1RVx1NUJGOVx1OEM2MSBcdTIxOTIgXHU4RkQ0XHU1NkRFXHU3QTdBXHU1QkY5XHU4QzYxXG4gICAqL1xuICBub3JtYWxpemVTZXR0aW5ncyhzZXR0aW5nczogdW5rbm93bik6IEFwcFNldHRpbmdzIHtcbiAgICBpZiAoIXNldHRpbmdzIHx8IHR5cGVvZiBzZXR0aW5ncyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShzZXR0aW5ncykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHNldHRpbmdzIGFzIEFwcFNldHRpbmdzO1xuICB9LFxufTtcbiIsICJcbi8qKlxuICogVGhlbWVCcmlkZ2UgLSBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHVGRjBDXHU2M0E4XHU5MDAxXHU1MjMwIGlmcmFtZVxuICogICAgICAgICAgICAgICsgXHU1M0NEXHU1NDExXHVGRjFBXHU2M0E1XHU2NTM2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTUwM0NcdUZGMENcdTZDRThcdTUxNjUgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtZUJyaWRnZSB7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcGFsZXR0ZVN5bmNUaW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogXHU1QjU4XHU1MEE4XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTk1MkVcdTU0MERcdUZGMENcdTc1MjhcdTRFOEUgcmVzdG9yZURlZmF1bHRzIFx1NkUwNVx1NzQwNiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOSkVDVEVEX1ZBUlMgPSBbXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnLFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJyxcbiAgICAgICctLXRleHQtYWNjZW50JyxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeScsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScsXG4gICAgICAnLS10ZXh0LW5vcm1hbCcsXG4gICAgICAnLS10ZXh0LW11dGVkJyxcbiAgICBdO1xuXG4gICAgLyoqIFx1OTYzMlx1NjI5Nlx1N0FERVx1NjAwMVx1NjgwN1x1OEJCMFx1RkYxQXJlc3RvcmVEZWZhdWx0cyBcdTg4QUJcdThDMDNcdTc1MjhcdTU0MEVcdThCQkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTYzQlx1NkI2Mlx1NUVGNlx1OEZERlx1NTZERVx1OEMwM1x1ODk4Nlx1NTE5OSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdXBwcmVzc2VkID0gZmFsc2U7XG5cbiAgYXR0YWNoSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgfVxuXG4gIGRldGFjaElmcmFtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NjYwRVx1NjY5N1x1NzJCNlx1NjAwMVx1RkYwOFx1NEVDNVx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBwcml2YXRlIGlzRGFya01vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIENTUyBcdTk4OUNcdTgyNzJcdTVCNTdcdTdCMjZcdTRFMzIgXHUyMTkyIFtyLCBnLCBiXVx1RkYwODBcdTIwMTMyNTUgXHU2NTc0XHU2NTcwXHVGRjA5XG4gICAqIFx1NjUyRlx1NjMwMSByZ2IoKS9yZ2JhKCkvI2hleFx1RkYwODMgXHU2MjE2IDYgXHU0RjREXHVGRjA5XHVGRjFCXHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU4RkQ0XHU1NkRFIG51bGxcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHBhcnNlQ29sb3JUb1JnYihjb2xvcjogc3RyaW5nKTogW251bWJlciwgbnVtYmVyLCBudW1iZXJdIHwgbnVsbCB7XG4gICAgaWYgKCFjb2xvcikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgYyA9IGNvbG9yLnRyaW0oKTtcbiAgICBsZXQgcjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlcjtcblxuICAgIGNvbnN0IHJnYk1hdGNoID0gYy5tYXRjaCgvcmdiYT9cXCgoW14pXSspXFwpL2kpO1xuICAgIGlmIChyZ2JNYXRjaCkge1xuICAgICAgY29uc3QgcGFydHMgPSByZ2JNYXRjaFsxXS5zcGxpdCgnLCcpLm1hcCgocykgPT4gcGFyc2VGbG9hdChzKSk7XG4gICAgICBbciwgZywgYl0gPSBwYXJ0cztcbiAgICB9IGVsc2UgaWYgKGNbMF0gPT09ICcjJykge1xuICAgICAgbGV0IGhleCA9IGMuc2xpY2UoMSk7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCA9PT0gMykgaGV4ID0gaGV4LnNwbGl0KCcnKS5tYXAoKGNoKSA9PiBjaCArIGNoKS5qb2luKCcnKTtcbiAgICAgIGlmIChoZXgubGVuZ3RoIDwgNikgcmV0dXJuIG51bGw7XG4gICAgICByID0gcGFyc2VJbnQoaGV4LnNsaWNlKDAsIDIpLCAxNik7XG4gICAgICBnID0gcGFyc2VJbnQoaGV4LnNsaWNlKDIsIDQpLCAxNik7XG4gICAgICBiID0gcGFyc2VJbnQoaGV4LnNsaWNlKDQsIDYpLCAxNik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChbciwgZywgYl0uc29tZSgodikgPT4gaXNOYU4odikpKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gW01hdGgucm91bmQociksIE1hdGgucm91bmQoZyksIE1hdGgucm91bmQoYildO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBDU1MgXHU5ODlDXHU4MjcyXHU1QjU3XHU3QjI2XHU0RTMyIFx1MjE5MiBIU0wgXHU4MjcyXHU3NkY4IEhcdUZGMDgwXHUyMDEzMzYwXHVGRjA5XG4gICAqIFx1NzUyOFx1NEU4RVx1NjI4QSBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTc2ODQgLS1pbnRlcmFjdGl2ZS1hY2NlbnQgXHU1M0NEXHU2M0E4XHU0RTNBXHU2M0QyXHU0RUY2XHU3Njg0IC0tYWNjZW50LWh1ZVxuICAgKi9cbiAgc3RhdGljIHJnYlRvSHVlKGNvbG9yOiBzdHJpbmcpOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCByZ2IgPSBUaGVtZUJyaWRnZS5wYXJzZUNvbG9yVG9SZ2IoY29sb3IpO1xuICAgIGlmICghcmdiKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBbciwgZywgYl0gPSByZ2I7XG5cbiAgICBjb25zdCBybiA9IHIgLyAyNTUsIGduID0gZyAvIDI1NSwgYm4gPSBiIC8gMjU1O1xuICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KHJuLCBnbiwgYm4pLCBtaW4gPSBNYXRoLm1pbihybiwgZ24sIGJuKSwgZCA9IG1heCAtIG1pbjtcbiAgICBpZiAoZCA9PT0gMCkgcmV0dXJuIDA7XG5cbiAgICBsZXQgaDogbnVtYmVyO1xuICAgIGlmIChtYXggPT09IHJuKSBoID0gKChnbiAtIGJuKSAvIGQpICUgNjtcbiAgICBlbHNlIGlmIChtYXggPT09IGduKSBoID0gKGJuIC0gcm4pIC8gZCArIDI7XG4gICAgZWxzZSBoID0gKHJuIC0gZ24pIC8gZCArIDQ7XG5cbiAgICBoID0gTWF0aC5yb3VuZChoICogNjApO1xuICAgIHJldHVybiBoIDwgMCA/IGggKyAzNjAgOiBoO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBDU1MgXHU5ODlDXHU4MjcyXHU1QjU3XHU3QjI2XHU0RTMyIFx1MjE5MiBcInIsIGcsIGJcIiBcdTRFMDlcdTUxNDNcdTdFQzRcdTVCNTdcdTdCMjZcdTRFMzJcbiAgICogXHU3NTI4XHU0RThFXHU2MjhBIE9ic2lkaWFuIFx1NEZBN1x1OEZCOVx1NjgwRlx1ODBDQ1x1NjY2RiAtLWJhY2tncm91bmQtc2Vjb25kYXJ5IFx1NTQwQ1x1NkI2NVx1NEUzQVx1NjNEMlx1NEVGNlx1NTM2MVx1NzI0N1x1NUU5NVx1ODI3Mlx1RkYwQ1xuICAgKiBcdThCQTlcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTgyNzJcdTZFMjlcdThEMzRcdThGRDEgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqL1xuICBzdGF0aWMgcmdiVG9SZ2JTdHJpbmcoY29sb3I6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHJnYiA9IFRoZW1lQnJpZGdlLnBhcnNlQ29sb3JUb1JnYihjb2xvcik7XG4gICAgaWYgKCFyZ2IpIHJldHVybiBudWxsO1xuICAgIHJldHVybiByZ2Iuam9pbignLCAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTU0MTEgaWZyYW1lIFx1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NzJCNlx1NjAwMVxuICAgKiBAcGFyYW0gZm9sbG93T2JzaWRpYW5UaGVtZSBcdTRFM0EgdHJ1ZSBcdTY1RjZcdUZGMENcdTk2NDRcdTVFMjZcdTRFQ0UgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XG4gICAqICAgICAgICAtLWludGVyYWN0aXZlLWFjY2VudCBcdTUzQ0RcdTYzQThcdTc2ODRcdTYxMEZcdTU4ODNcdTgyNzJcdTc2RjggaHVlXHVGRjBDXHU5QTcxXHU1MkE4XHU2M0QyXHU0RUY2XHU2NTc0XHU3NkQ4XHU5MTREXHU4MjcyXHU4MDU0XHU1MkE4XG4gICAqL1xuICBwdXNoVGhlbWUoZm9sbG93T2JzaWRpYW5UaGVtZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgY29uc3QgcGF5bG9hZDogeyBpc0Rhcms6IGJvb2xlYW47IGh1ZT86IG51bWJlcjsgYmc/OiBzdHJpbmc7IHRleHROb3JtYWw/OiBzdHJpbmc7IHRleHRNdXRlZD86IHN0cmluZyB9ID0ge1xuICAgICAgaXNEYXJrOiB0aGlzLmlzRGFya01vZGUoKSxcbiAgICB9O1xuXG4gICAgaWYgKGZvbGxvd09ic2lkaWFuVGhlbWUpIHtcbiAgICAgIGNvbnN0IGFjY2VudCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0taW50ZXJhY3RpdmUtYWNjZW50JylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IGh1ZSA9IFRoZW1lQnJpZGdlLnJnYlRvSHVlKGFjY2VudCk7XG4gICAgICBpZiAoaHVlICE9PSBudWxsKSBwYXlsb2FkLmh1ZSA9IGh1ZTtcblxuICAgICAgLy8gXHU0RkE3XHU4RkI5XHU2ODBGXHU4MENDXHU2NjZGXHU4MjcyXHVGRjFBXHU5QTcxXHU1MkE4XHU2M0QyXHU0RUY2XHU1MzYxXHU3MjQ3XHU1RTk1XHU4MjcyXHU4RDM0XHU4RkQxIE9ic2lkaWFuIFx1ODI3Mlx1NkUyOVxuICAgICAgY29uc3Qgc2lkZWJhciA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgYmcgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyhzaWRlYmFyKTtcbiAgICAgIGlmIChiZyAhPT0gbnVsbCkgcGF5bG9hZC5iZyA9IGJnO1xuXG4gICAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcdUZGMUFcdTlBNzFcdTUyQThcdTYzRDJcdTRFRjZcdTY1ODdcdTVCNTdcdTgyNzJcdTZFMjlcdThEMzRcdThGRDEgT2JzaWRpYW5cbiAgICAgIGNvbnN0IHRleHROb3JtYWwgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbm9ybWFsJylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IHRleHROb3JtYWxSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0Tm9ybWFsKTtcbiAgICAgIGlmICh0ZXh0Tm9ybWFsUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHROb3JtYWwgPSB0ZXh0Tm9ybWFsUmdiO1xuXG4gICAgICBjb25zdCB0ZXh0TXV0ZWQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbXV0ZWQnKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgdGV4dE11dGVkUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE11dGVkKTtcbiAgICAgIGlmICh0ZXh0TXV0ZWRSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE11dGVkID0gdGV4dE11dGVkUmdiO1xuICAgIH1cblxuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgaWQ6ICd0aGVtZV9wdXNoXycgKyBEYXRlLm5vdygpLFxuICAgICAgICBwYXlsb2FkLFxuICAgICAgfSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKiogXHU0RjlCXHU1OTE2XHU5MEU4XHU4QzAzXHU3NTI4XHVGRjFBT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU2NUY2XHU4OUU2XHU1M0QxICovXG4gIG9uVGhlbWVDaGFuZ2VkKGZvbGxvd09ic2lkaWFuVGhlbWUgPSBmYWxzZSk6IHZvaWQge1xuICAgIHRoaXMucHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICB9XG5cbiAgLy8gPT09PT0gXHU1M0NDXHU1NDExXHU4QzAzXHU4MjcyID09PT09XG5cbiAgLyoqXG4gICAqIFx1OEJBMVx1N0I5NyB3ZWJhcHAgXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNiBcdTIxOTIgT2JzaWRpYW4gQ1NTIFx1NTNEOFx1OTFDRlx1NjYyMFx1NUMwNFxuICAgKiBcdTRFQzVcdTg5ODZcdTc2RDYgMyBcdTdDN0JcdTY4MzhcdTVGQzNcdTgyNzJcdUZGMDhcdTVGM0FcdThDMDMvXHU4MENDXHU2NjZGL1x1NjU4N1x1NUI1N1x1RkYwOVx1RkYwQ1x1NTE3Nlx1NEY1OVx1NzUzMSBPYnNpZGlhbiBcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTYzQThcdTdCOTdcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlT2JzaWRpYW5WYXJzKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgaCA9IE1hdGgucm91bmQoaHVlKTtcbiAgICBjb25zdCBsbyA9IE1hdGgubWF4KC0zMCwgTWF0aC5taW4oMzAsIGxpZ2h0bmVzc09mZnNldCkpO1xuXG4gICAgLy8gXHU1RjNBXHU4QzAzXHU4MjcyXG4gICAgY29uc3QgYWNjZW50UyA9IDQwO1xuICAgIGNvbnN0IGFjY2VudEwgPSBpc0RhcmsgPyA1MCA6IDQwO1xuICAgIGNvbnN0IGFjY2VudCA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TH0lKWA7XG4gICAgY29uc3QgYWNjZW50SG92ZXIgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEwgKyA1fSUpYDtcblxuICAgIC8vIFx1ODBDQ1x1NjY2Rlx1ODI3MlxuICAgIGNvbnN0IGJnUyA9IGlzRGFyayA/IDggOiAxMjtcbiAgICBjb25zdCBiZ0wgPSBpc0RhcmtcbiAgICAgID8gTWF0aC5tYXgoNSwgMTIgKyBsbyAqIDAuMylcbiAgICAgIDogTWF0aC5taW4oOTgsIDk0ICsgbG8gKiAwLjE1KTtcbiAgICBjb25zdCBiZ1ByaW1hcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7YmdMfSUpYDtcbiAgICBjb25zdCBiZ1NlY29uZGFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtpc0RhcmsgPyBiZ0wgKyAzIDogYmdMIC0gMn0lKWA7XG5cbiAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcbiAgICBjb25zdCB0ZXh0Tm9ybWFsID0gaXNEYXJrID8gYGhzbCgke2h9LCA2JSwgODglKWAgOiBgaHNsKCR7aH0sIDYlLCAxMiUpYDtcbiAgICBjb25zdCB0ZXh0TXV0ZWQgID0gaXNEYXJrID8gYGhzbCgke2h9LCA0JSwgNTUlKWAgOiBgaHNsKCR7aH0sIDQlLCA0NSUpYDtcblxuICAgIHJldHVybiB7XG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInOiBhY2NlbnRIb3ZlcixcbiAgICAgICctLXRleHQtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JzogYmdQcmltYXJ5LFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknOiBiZ1NlY29uZGFyeSxcbiAgICAgICctLXRleHQtbm9ybWFsJzogdGV4dE5vcm1hbCxcbiAgICAgICctLXRleHQtbXV0ZWQnOiB0ZXh0TXV0ZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdThDMDNcdTgyNzJcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqIDUwbXMgZGVib3VuY2VcdUZGMENcdTk2MzJcdTZCNjJcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU2RUQxXHU1NzU3XHU1RkVCXHU5MDFGXHU2MkQ2XHU2MkZEXHU0RUE3XHU3NTFGXHU5QUQ4XHU5ODkxIERPTSBcdTUxOTlcdTUxNjVcbiAgICovXG4gIGFwcGx5UGFsZXR0ZShodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYWxldHRlU3luY1RpbWVyKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpO1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gZmFsc2U7IC8vIFx1NjVCMFx1OEMwM1x1ODI3Mlx1OEJGN1x1NkM0Mlx1NTIzMFx1Njc2NSBcdTIxOTIgXHU4OUUzXHU5NjY0XHU2MjkxXHU1MjM2XG4gICAgdGhpcy5fcGFsZXR0ZVN5bmNUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCkgcmV0dXJuOyAvLyByZXN0b3JlRGVmYXVsdHMgXHU1NzI4XHU5NjMyXHU2Mjk2XHU3QTk3XHU1M0UzXHU1MTg1XHU4OEFCXHU4QzAzXHU3NTI4XG4gICAgICBjb25zdCB2YXJzID0gVGhlbWVCcmlkZ2UuY29tcHV0ZU9ic2lkaWFuVmFycyhodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZhcnMpKSB7XG4gICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLyoqIFx1NkUwNVx1OTY2NFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHVGRjBDXHU2MDYyXHU1OTBEIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OUVEOFx1OEJBNFx1NTAzQyAqL1xuICBzdGF0aWMgcmVzdG9yZURlZmF1bHRzKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBUaGVtZUJyaWRnZS5JTkpFQ1RFRF9WQVJTKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqIFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NUI4Q1x1NjU3NFx1NTIxN1x1ODg2OFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyA9IFtcbiAgJy5tcDMnLCAnLndhdicsICcub2dnJywgJy5mbGFjJywgJy5hYWMnLCAnLm00YScsICcud21hJywgJy53ZWJtJywgJy5vcHVzJyxcbl07XG5cbi8qKiBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MEQgXHUyMTkyIE1JTUUgXHU3QzdCXHU1NzhCICovXG5jb25zdCBBVURJT19NSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLm1wMyc6ICAnYXVkaW8vbXBlZycsXG4gICcud2F2JzogICdhdWRpby93YXYnLFxuICAnLm9nZyc6ICAnYXVkaW8vb2dnJyxcbiAgJy5mbGFjJzogJ2F1ZGlvL2ZsYWMnLFxuICAnLmFhYyc6ICAnYXVkaW8vYWFjJyxcbiAgJy5tNGEnOiAgJ2F1ZGlvL21wNCcsXG4gICcud21hJzogICdhdWRpby94LW1zLXdtYScsXG4gICcud2VibSc6ICdhdWRpby93ZWJtJyxcbiAgJy5vcHVzJzogJ2F1ZGlvL29wdXMnLFxufTtcblxuLyoqIFx1NUI4Q1x1NjU3NCBNSU1FIFx1N0M3Qlx1NTc4Qlx1NjYyMFx1NUMwNFx1RkYwOFx1NTQyQiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHVGRjA5ICovXG5leHBvcnQgY29uc3QgTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5odG1sJzogJ3RleHQvaHRtbDsgY2hhcnNldD11dGYtOCcsXG4gICcuY3NzJzogICd0ZXh0L2NzczsgY2hhcnNldD11dGYtOCcsXG4gICcuanMnOiAgICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5tanMnOiAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzb24nOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICcucG5nJzogICdpbWFnZS9wbmcnLFxuICAnLmpwZyc6ICAnaW1hZ2UvanBlZycsXG4gICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJy5naWYnOiAgJ2ltYWdlL2dpZicsXG4gICcuc3ZnJzogICdpbWFnZS9zdmcreG1sJyxcbiAgJy5pY28nOiAgJ2ltYWdlL3gtaWNvbicsXG4gICcud29mZic6ICdmb250L3dvZmYnLFxuICAnLndvZmYyJzonZm9udC93b2ZmMicsXG4gICcudHRmJzogICdmb250L3R0ZicsXG4gIC4uLkFVRElPX01JTUVfVFlQRVMsXG59O1xuIiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcblxuLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MCAqL1xuZXhwb3J0IGludGVyZmFjZSBOb2lzZUl0ZW0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHR5cGU6ICd1cmwnIHwgJ3ZhdWx0JyB8ICdnZW5lcmF0ZWQnO1xuICB1cmw/OiBzdHJpbmc7XG4gIHBhdGg/OiBzdHJpbmc7XG4gIHZvbHVtZT86IG51bWJlcjtcbn1cblxuLyoqIFx1Njc3Rlx1NTc1N1x1OTE0RFx1N0Y2RVx1RkYwOFx1NzUzMSB3ZWJhcHAgU2VjdGlvblJlZ2lzdHJ5IFx1NUI5QVx1NEU0OVx1RkYwQ1x1NjNEMlx1NEVGNlx1NEVDNVx1OTAwRlx1NEYyMFx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBTZWN0aW9uQ29uZmlnSXRlbSB7XG4gIGlkOiBzdHJpbmc7XG4gIGVuYWJsZWQ6IGJvb2xlYW47XG4gIHZpc2libGU6IGJvb2xlYW47XG4gIG9yZGVyOiBudW1iZXI7XG59XG5cbi8qKiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTYzQTVcdTUzRTMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFtYm9vUmV2aWV3U2V0dGluZ3Mge1xuICAvKiogXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU2ODM5XHU4REVGXHU1Rjg0ICovXG4gIGRhdGFQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxICovXG4gIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcbiAgLyoqIFx1Njc3Rlx1NTc1N1x1N0JBMVx1NzQwNlx1OTE0RFx1N0Y2RVx1RkYwOEpTT04gXHU4OUUzXHU2NzkwXHU1NDBFXHU3RUQzXHU2Nzg0XHU0RTBEXHU1NkZBXHU1QjlBXHVGRjBDXHU0RjdGXHU3NTI4XHU1QkJEXHU2NzdFXHU3QzdCXHU1NzhCXHVGRjA5ICovXG4gIHNlY3Rpb25Db25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOSAqL1xuICB0aGVtZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5M1x1RkYwOSAqL1xuICBub2lzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NTIxN1x1ODg2OCAqL1xuICBub2lzZUl0ZW1zOiBOb2lzZUl0ZW1bXTtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NUMwNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MiAqL1xuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGJvb2xlYW47XG4gIC8qKiBcdTY2MkZcdTU0MjZcdThCQTlcdTYzRDJcdTRFRjZcdTkxNERcdTgyNzJcdThEREZcdTk2OEYgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHVGRjA4XHU4QkZCXHU1M0Q2IC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1ODI3Mlx1NzZGOFx1RkYwOSAqL1xuICBmb2xsb3dPYnNpZGlhblRoZW1lOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSB7XG4gIGRhdGFQYXRoOiAnYmFtYm9vLXJldmlldycsXG4gIGVuYWJsZU1hcmtkb3duU3luYzogdHJ1ZSxcbiAgc2VjdGlvbkNvbmZpZzogbnVsbCxcbiAgdGhlbWVQYXRoOiAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JyxcbiAgbm9pc2VQYXRoOiAnJyxcbiAgbm9pc2VJdGVtczogW10sXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogZmFsc2UsXG4gIGZvbGxvd09ic2lkaWFuVGhlbWU6IHRydWUsXG59O1xuXG4vKipcbiAqIFBsdWdpblNldHRpbmdzIC0gT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gKi9cbmV4cG9ydCBjbGFzcyBQbHVnaW5TZXR0aW5ncyBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1zZXR0aW5ncycpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vID09PSBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU1NzI4IFZhdWx0IFx1NEUyRFx1NzY4NFx1NUI1OFx1NTBBOFx1NzZFRVx1NUY1NVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignYmFtYm9vLXJldmlldycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoID0gdmFsdWUgfHwgJ2JhbWJvby1yZXZpZXcnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBNYXJrZG93biBcdTY0NThcdTg5ODFcdTU0MENcdTZCNjVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxJylcbiAgICAgIC5zZXREZXNjKCdcdTZCQ0ZcdTZCMjFcdTRGRERcdTVCNThcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTU3MjggcmV2aWV3cy8gXHU3NkVFXHU1RjU1XHU0RTBCXHU3NTFGXHU2MjEwXHU1M0VGXHU4QkZCXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjYnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NUI1OFx1NjUzRVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoID0gdmFsdWUgfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTc2N0RcdTU2NkFcdTk3RjMgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGMycpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOScpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU2MzA3XHU1QjlBXHU1NDBFXHU0RUM1XHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHU1MTg1XHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHUzMDAyXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU2NTc0XHU0RTJBXHU1RTkzXHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTc2N0RcdTU2NkFcdTk3RjMgXHU2MjE2XHU3NTU5XHU3QTdBXHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4RERGXHU5NjhGIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OTE0RFx1ODI3MicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDXHU2M0QyXHU0RUY2XHU2NTc0XHU0RjUzXHU5MTREXHU4MjcyXHU0RjFBXHU4RERGXHU5NjhGXHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NzY4NFx1NUYzQVx1OEMwM1x1ODI3Mlx1RkYwOC0taW50ZXJhY3RpdmUtYWNjZW50XHVGRjA5XHUzMDAyXHU1MjA3XHU2MzYyIEJhbWJvbyBDaGluYSBcdTc2ODRcdTdBRjlcdTVGNzEgLyBcdTU4QThcdTU5MUMgLyBcdTgwRURcdTgxMDIgLyBcdTk3NTJcdTdFRkZcdTdCNDlcdTYxMEZcdTU4ODNcdTY1RjZcdUZGMENcdTYzRDJcdTRFRjZcdTkxNERcdTgyNzJcdTk2OEZcdTRFNEJcdTgwNTRcdTUyQTgnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSUZyYW1lRWxlbWVudD4oJy5iYW1ib28tcmV2aWV3LWZyYW1lJyk7XG4gICAgICAgICAgICBpZiAoIWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgLy8gXHU3QUNCXHU1MzczXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU1RjNBXHU4QzAzXHU4MjcyXHU1M0NEXHU2M0E4XHU3Njg0XHU4MjcyXHU3NkY4ICsgXHU0RkE3XHU4RkI5XHU2ODBGXHU4MENDXHU2NjZGXHU4MjcyXHU2RTI5ICsgXHU2NTg3XHU1QjU3XHU4MjcyXHU2RTI5XG4gICAgICAgICAgICAgIGNvbnN0IGFjY2VudCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGh1ZSA9IFRoZW1lQnJpZGdlLnJnYlRvSHVlKGFjY2VudCk7XG4gICAgICAgICAgICAgIGNvbnN0IHNpZGViYXIgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGJnID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcoc2lkZWJhcik7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHROb3JtYWwgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tdGV4dC1ub3JtYWwnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHROb3JtYWxSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0Tm9ybWFsKTtcbiAgICAgICAgICAgICAgY29uc3QgdGV4dE11dGVkID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbXV0ZWQnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHRNdXRlZFJnYiA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHRleHRNdXRlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IHsgaXNEYXJrOiBib29sZWFuOyBodWU/OiBudW1iZXI7IGJnPzogc3RyaW5nOyB0ZXh0Tm9ybWFsPzogc3RyaW5nOyB0ZXh0TXV0ZWQ/OiBzdHJpbmcgfSA9IHtcbiAgICAgICAgICAgICAgICBpc0Rhcms6IGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyksXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGlmIChodWUgIT09IG51bGwpIHBheWxvYWQuaHVlID0gaHVlO1xuICAgICAgICAgICAgICBpZiAoYmcgIT09IG51bGwpIHBheWxvYWQuYmcgPSBiZztcbiAgICAgICAgICAgICAgaWYgKHRleHROb3JtYWxSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE5vcm1hbCA9IHRleHROb3JtYWxSZ2I7XG4gICAgICAgICAgICAgIGlmICh0ZXh0TXV0ZWRSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE11dGVkID0gdGV4dE11dGVkUmdiO1xuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6Y2hhbmdlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU1MTczXHU5NUVEXHU4MDU0XHU1MkE4IFx1MjE5MiBcdTkwMUFcdTc3RTUgaWZyYW1lIFx1NjA2Mlx1NTkwRFx1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1OEMwM1x1ODI3MlxuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6Zm9sbG93RGlzYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDoge30sXG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTVDMDZcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4nKVxuICAgICAgLnNldERlc2MoJ1x1NjI1M1x1NUYwMFx1NTQwRVx1RkYwQ3dlYmFwcCBcdTUxODVcdTYwQUNcdTZENkVcdTgzRENcdTUzNTVcdTc2ODRcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU4QzAzXHU4MjcyXHU0RjFBXHU1QjlFXHU2NUY2XHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NzY4NFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2Mlx1OTE0RFx1ODI3MicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgVGhlbWVCcmlkZ2UucmVzdG9yZURlZmF1bHRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGFjdGl2ZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElGcmFtZUVsZW1lbnQ+KCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKGZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBlbmFibGVkOiB2YWx1ZSB9XG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTUxNzNcdTRFOEVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU1MTczXHU0RThFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAxXHVGRjFBXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBsdWdpbkJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdCYW1ib28gSW1tb3J0YWxzXHVGRjA4XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHVGRjA5XHU2NjJGXHU0RTAwXHU2QjNFXHU1N0ZBXHU0RThFXHU4MkNGXHU4MDU0XHU2M0E3XHU1MjM2XHU4QkJBXHU0RTRCXHU3MjM2XHU3RUY0XHU1MTRCXHU2MjU4XHUwMEI3XHU2ODNDXHU1MzYyXHU0RUMwXHU3OUQxXHU1OTJCXHU2M0QwXHU1MUZBXHU3Njg0XCJPR0FTXCJcdTc0MDZcdTVGRjVcdUZGMENcdTRFMTNcdTRFM0FcdTRFMkFcdTRFQkFcdTYyNTNcdTkwMjBcdTc2ODRcdTRFMkRcdTU2RkRcdTk4Q0VcdTc2RUVcdTY4MDdcdTgxRUFcdTUyQThcdTUzMTZcdTUyMDZcdTkxNERcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnXG4gICAgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQgYmFtYm9vLWFib3V0LWF1dGhvcicgfSk7XG4gICAgY29uc3QgYXV0aG9yUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm93JyB9KTtcbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF2YXRhcicgfSk7XG4gICAgLy8gXHU0RUNFXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHU4QkZCXHU1M0Q2XHU1OTM0XHU1MENGXHVGRjA4XHU5MDFBXHU4RkM3IFZhdWx0IEFQSSBcdThCRkJcdTUzRDYgLm9ic2lkaWFuL3BsdWdpbnMvIFx1NEUwQlx1NzY4NFx1ODFFQVx1NjcwOVx1OEQ0NFx1NkU5MFx1RkYwOVxuICAgIC8vIGZpcmUtYW5kLWZvcmdldFx1RkYxQVx1NTkzNFx1NTBDRlx1OTc1RVx1NTE3M1x1OTUyRVx1RkYwQ1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNVx1OTc1OVx1OUVEOFx1NjYzRVx1NzkzQVx1OUVEOFx1OEJBNFx1N0E3QVx1NTkzNFx1NTBDRlxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbkRpciA9IHRoaXMucGx1Z2luLm1hbmlmZXN0LmRpciA/PyAnJztcbiAgICAgICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBbXG4gICAgICAgICAgYCR7cGx1Z2luRGlyfS9hdXRob3ItYXZhdGFyLmpwZ2AsXG4gICAgICAgICAgYCR7cGx1Z2luRGlyfS93ZWJhcHAvYXNzZXRzL2ltYWdlcy9hdXRob3ItYXZhdGFyLmpwZ2AsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3QgYXZhdGFyUGF0aCBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgYWRhcHRlci5leGlzdHMoYXZhdGFyUGF0aCk7XG4gICAgICAgICAgaWYgKCFleGlzdHMpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGF2YXRhckRhdGEgPSBhd2FpdCBhZGFwdGVyLnJlYWRCaW5hcnkoYXZhdGFyUGF0aCk7XG4gICAgICAgICAgY29uc3QgYjY0ID0gQnVmZmVyLmZyb20oYXZhdGFyRGF0YSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICAgIGF2YXRhci5zZXRDc3NTdHlsZXMoe1xuICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBgdXJsKGRhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiNjR9KWAsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBzaWxlbnRseSBza2lwIFx1MjAxNCBzaG93IGRlZmF1bHQgZW1wdHkgYXZhdGFyICovIH1cbiAgICB9KSgpO1xuXG5cbiAgICBjb25zdCBhdXRob3JJbmZvID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItaW5mbycgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1N0ZCRFx1OUNERVx1NTQxQicsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItbmFtZScgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NTVCNVx1NUI1N1x1OTk4Nlx1NTIxQlx1NTlDQlx1NEVCQScsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm9sZScgfSk7XG5cbiAgICAvLyBcdTRGNUNcdTU0QzFcdTUzM0FcbiAgICBhdXRob3JCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTRGNUNcdTU0QzEnLCBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3MtbGFiZWwnIH0pO1xuICAgIGNvbnN0IHdvcmtzUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1yb3cnIH0pO1xuXG4gICAgW3sgbmFtZTogJ1x1N0FGOVx1NTNGNlx1OThERVx1NTIwMycsIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLUJhbWJvby1EYXJ0cycgfSxcbiAgICAgeyBuYW1lOiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscycgfV0uZm9yRWFjaCh3b3JrID0+IHtcbiAgICAgIGNvbnN0IHRhZyA9IHdvcmtzUm93LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiB3b3JrLm5hbWUsIGNsczogJ2JhbWJvby1hYm91dC10YWcnIH0pO1xuICAgICAgaWYgKHdvcmsudXJsKSB7XG4gICAgICAgIHRhZy5zZXRDc3NTdHlsZXMoeyBjdXJzb3I6ICdwb2ludGVyJyB9KTtcbiAgICAgICAgdGFnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5vcGVuKHdvcmsudXJsLCAnX2JsYW5rJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGXG4gICAgY29uc3QgY29udGFjdEJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU5MEFFXHU3QkIxXHVGRjFBeWFueXVsaW4yMTAwQHFxLmNvbScsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1RkFFXHU0RkUxXHVGRjFBeWFuaHU5NCcsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQXNDOzs7QUNBdEMsSUFBQUMsbUJBQWtEOzs7QUNBbEQsc0JBQWdEO0FBVXpDLElBQU0sVUFBTixNQUFjO0FBQUEsRUFLbkIsWUFBWSxLQUFVLFdBQW1CO0FBRnpDLFNBQVEsV0FBcUIsQ0FBQztBQUc1QixTQUFLLE1BQU07QUFDWCxTQUFLLGdCQUFZLCtCQUFjLEdBQUcsU0FBUyxTQUFTO0FBQUEsRUFDdEQ7QUFBQSxFQUVBLE1BQU0sZUFBZ0M7QUFDcEMsVUFBTSxVQUFVLEtBQUssSUFBSSxNQUFNO0FBQy9CLFVBQU0sZ0JBQVksK0JBQWMsR0FBRyxLQUFLLFNBQVMsYUFBYTtBQUM5RCxRQUFJO0FBQ0osUUFBSTtBQUNGLGFBQU8sTUFBTSxRQUFRLEtBQUssU0FBUztBQUFBLElBQ3JDLFFBQVE7QUFDTixZQUFNLElBQUksTUFBTSx3R0FBa0M7QUFBQSxJQUNwRDtBQUdBLFdBQU8sTUFBTSxLQUFLLGFBQWEsTUFBTSxPQUFPO0FBRzVDLFdBQU8sTUFBTSxLQUFLLGVBQWUsTUFBTSxPQUFPO0FBRzlDLFFBQUksQ0FBQyxNQUFNLEtBQUssV0FBVyxhQUFTLCtCQUFjLEdBQUcsS0FBSyxTQUFTLDJCQUEyQixDQUFDLEdBQUc7QUFDaEcsYUFBTyxLQUFLLG1CQUFtQixJQUFJO0FBQUEsSUFDckM7QUFFQSxVQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbkQsVUFBTSxVQUFVLElBQUksZ0JBQWdCLElBQUk7QUFDeEMsU0FBSyxTQUFTLEtBQUssT0FBTztBQUMxQixXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBYyxhQUFhLE1BQWMsU0FBdUM7QUFDOUUsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sUUFBK0MsQ0FBQztBQUN0RCxRQUFJO0FBQ0osWUFBUSxRQUFRLFVBQVUsS0FBSyxJQUFJLE9BQU8sTUFBTTtBQUM5QyxZQUFNLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUFBLElBQy9DO0FBQ0EsZUFBVyxFQUFFLE1BQU0sS0FBSyxLQUFLLE9BQU87QUFDbEMsWUFBTSxZQUFZLEtBQUssTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNuQyxZQUFNLGNBQVUsK0JBQWMsR0FBRyxLQUFLLFNBQVMsSUFBSSxTQUFTLEVBQUU7QUFDOUQsVUFBSTtBQUNGLGNBQU0sTUFBTSxNQUFNLFFBQVEsS0FBSyxPQUFPO0FBQ3RDLGVBQU8sS0FBSyxRQUFRLE1BQU0sb0JBQW9CLFNBQVM7QUFBQSxFQUFPLEdBQUc7QUFBQSxTQUFZO0FBQUEsTUFDL0UsU0FBUyxHQUFHO0FBQ1YsZ0JBQVEsS0FBSywyQ0FBdUIsT0FBTyxJQUFJLENBQUM7QUFBQSxNQUNsRDtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBYyxlQUFlLE1BQWMsU0FBdUM7QUFDaEYsVUFBTSxpQkFBYSwrQkFBYyxHQUFHLEtBQUssU0FBUywyQkFBMkI7QUFDN0UsVUFBTSxZQUFZLE1BQU0sS0FBSyxXQUFXLFNBQVMsVUFBVTtBQUUzRCxRQUFJLFdBQVc7QUFDYixhQUFPLE1BQU0sS0FBSyxVQUFVLE1BQU0sU0FBUyxVQUFVO0FBQUEsSUFDdkQ7QUFDQSxXQUFPLE1BQU0sS0FBSyxxQkFBcUIsTUFBTSxPQUFPO0FBQUEsRUFDdEQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtBLE1BQWMsVUFBVSxNQUFjLFNBQXNCLFlBQXFDO0FBQy9GLFlBQVEsSUFBSSxrQ0FBd0I7QUFDcEMsVUFBTSxnQkFBZ0IsTUFBTSxRQUFRLEtBQUssVUFBVTtBQUNuRCxVQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsYUFBYSxHQUFHLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RSxVQUFNLFVBQVUsSUFBSSxnQkFBZ0IsSUFBSTtBQUN4QyxTQUFLLFNBQVMsS0FBSyxPQUFPO0FBRzFCLFdBQU8sS0FBSyxRQUFRLDREQUE0RCxFQUFFO0FBR2xGLFVBQU0sWUFBWSxnQkFBZ0IsT0FBTztBQUN6QyxVQUFNLGNBQWMsS0FBSyxPQUFPLFVBQVU7QUFDMUMsUUFBSSxlQUFlLEdBQUc7QUFDcEIsYUFBTyxLQUFLLE1BQU0sR0FBRyxXQUFXLElBQUksWUFBWSxPQUFPLEtBQUssTUFBTSxXQUFXO0FBQUEsSUFDL0UsT0FBTztBQUNMLGFBQU8sS0FBSyxRQUFRLFdBQVcsR0FBRyxTQUFTO0FBQUEsUUFBVztBQUFBLElBQ3hEO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtBLE1BQWMscUJBQXFCLE1BQWMsVUFBd0M7QUFFdkYsWUFBUSxLQUFLLDBFQUFrQztBQUMvQyxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBYyxXQUFXLFNBQXNCLE1BQWdDO0FBQzdFLFFBQUk7QUFDRixhQUFPLE1BQU0sUUFBUSxPQUFPLElBQUk7QUFBQSxJQUNsQyxRQUFRO0FBQ04sYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQUEsRUFFUSxtQkFBbUIsTUFBc0I7QUFDL0MsVUFBTSxZQUFZO0FBQ2xCLFdBQU8sS0FBSyxRQUFRLFdBQVcsbUZBQWtGO0FBQ2pILFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxVQUFnQjtBQUNkLGVBQVcsT0FBTyxLQUFLLFVBQVU7QUFDL0IsVUFBSSxnQkFBZ0IsR0FBRztBQUFBLElBQ3pCO0FBQ0EsU0FBSyxXQUFXLENBQUM7QUFBQSxFQUNuQjtBQUNGOzs7QUNuSUEsSUFBQUMsbUJBQWdEOzs7QUNBaEQsSUFBQUMsbUJBQTBDOzs7QUNvQm5DLElBQU0sd0JBQU4sY0FBb0MsTUFBTTtBQUFBLEVBQy9DLFlBQVksU0FBaUI7QUFDM0IsVUFBTSxPQUFPO0FBQ2IsU0FBSyxPQUFPO0FBQUEsRUFDZDtBQUNGO0FBRUEsSUFBTSxlQUFlLENBQUMsUUFBUSxTQUFTLFlBQVksbUJBQW1CLGVBQWU7QUFVOUUsSUFBTSxrQkFBa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNN0IsU0FBUyxNQUFnQztBQUN2QyxRQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxNQUFNLFFBQVEsSUFBSSxHQUFHO0FBQzVELFlBQU0sSUFBSSxzQkFBc0IsOEdBQXlCO0FBQUEsSUFDM0Q7QUFFQSxVQUFNLFNBQVM7QUFHZixVQUFNLGdCQUFnQixhQUFhLEtBQUssQ0FBQyxNQUFNLE9BQU8sQ0FBQyxNQUFNLE1BQVM7QUFDdEUsUUFBSSxDQUFDLGVBQWU7QUFDbEIsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxTQUEwQixDQUFDO0FBRWpDLFFBQUksT0FBTyxTQUFTLFFBQVc7QUFDN0IsYUFBTyxPQUFPLGdCQUFnQixjQUFjLE9BQU8sSUFBSTtBQUFBLElBQ3pEO0FBQ0EsUUFBSSxPQUFPLFVBQVUsUUFBVztBQUM5QixhQUFPLFFBQVEsZ0JBQWdCLGVBQWUsT0FBTyxLQUFLO0FBQUEsSUFDNUQ7QUFDQSxRQUFJLE9BQU8sYUFBYSxRQUFXO0FBQ2pDLGFBQU8sV0FBVyxnQkFBZ0Isa0JBQWtCLE9BQU8sUUFBUTtBQUFBLElBQ3JFO0FBQ0EsUUFBSSxPQUFPLG9CQUFvQixRQUFXO0FBQ3hDLGFBQU8sa0JBQWtCLE9BQU87QUFBQSxJQUNsQztBQUNBLFFBQUksT0FBTyxrQkFBa0IsUUFBVztBQUN0QyxhQUFPLGdCQUFnQixPQUFPO0FBQUEsSUFDaEM7QUFFQSxXQUFPO0FBQUEsRUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsY0FBYyxNQUF3QztBQUNwRCxRQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxNQUFNLFFBQVEsSUFBSSxHQUFHO0FBQzVELGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFDQSxVQUFNLE1BQU07QUFDWixVQUFNLE1BQStCLENBQUM7QUFFdEMsZUFBVyxPQUFPLE9BQU8sS0FBSyxHQUFHLEdBQUc7QUFDbEMsWUFBTSxNQUFNLElBQUksR0FBRztBQUNuQixVQUFJLENBQUMsT0FBTyxPQUFPLFFBQVEsWUFBWSxNQUFNLFFBQVEsR0FBRyxHQUFHO0FBQ3pEO0FBQUEsTUFDRjtBQUNBLFlBQU0sUUFBaUIsRUFBRSxHQUFHLElBQUk7QUFDaEMsVUFBSSxDQUFDLE1BQU0sS0FBTSxPQUFNLE9BQU87QUFDOUIsVUFBSSxDQUFDLE1BQU0sV0FBVyxPQUFPLE1BQU0sWUFBWSxTQUFVLE9BQU0sVUFBVSxDQUFDO0FBQzFFLFVBQUksQ0FBQyxNQUFNLFlBQVksQ0FBQyxNQUFNLFFBQVEsTUFBTSxRQUFRLEVBQUcsT0FBTSxXQUFXLENBQUM7QUFDekUsVUFBSSxDQUFDLE1BQU0sU0FBUyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssRUFBRyxPQUFNLFFBQVEsQ0FBQztBQUNoRSxVQUFJLEdBQUcsSUFBSTtBQUFBLElBQ2I7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9BLGVBQWUsT0FBNEI7QUFDekMsUUFBSSxDQUFDLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFDekIsYUFBTyxDQUFDO0FBQUEsSUFDVjtBQUNBLFFBQUksVUFBVTtBQUNkLFdBQU8sTUFBTSxJQUFJLENBQUMsUUFBa0I7QUFDbEMsVUFBSSxDQUFDLE9BQU8sT0FBTyxRQUFRLFlBQVksTUFBTSxRQUFRLEdBQUcsRUFBRyxRQUFPO0FBQ2xFLFlBQU0sTUFBTTtBQUNaLFlBQU0sUUFBUSxFQUFFLEdBQUcsSUFBSTtBQUN2QixVQUFJLENBQUMsTUFBTSxJQUFJO0FBQ2IsY0FBTSxLQUFLLGVBQWUsU0FBUyxJQUFJLEtBQUssSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQUEsTUFDaEU7QUFDQSxVQUFJLE1BQU0sU0FBUyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssRUFBRyxPQUFNLFFBQVEsQ0FBQztBQUMvRCxhQUFPO0FBQUEsSUFDVCxDQUFDO0FBQUEsRUFDSDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNQSxrQkFBa0IsVUFBZ0M7QUFDaEQsUUFBSSxDQUFDLFlBQVksT0FBTyxhQUFhLFlBQVksTUFBTSxRQUFRLFFBQVEsR0FBRztBQUN4RSxhQUFPLENBQUM7QUFBQSxJQUNWO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDRjs7O0FEcEhPLElBQU0sZUFBTixNQUFtQjtBQUFBLEVBSXhCLFlBQVksS0FBVSxXQUFXLGlCQUFpQjtBQUNoRCxTQUFLLE1BQU07QUFDWCxTQUFLLGVBQVcsZ0NBQWMsUUFBUTtBQUFBLEVBQ3hDO0FBQUE7QUFBQSxFQUdBLE1BQWMsVUFBVSxLQUE0QjtBQUNsRCxVQUFNLFdBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDcEQsUUFBSSxDQUFFLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBSTtBQUNoRCxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsTUFBTSxJQUFJO0FBQUEsSUFDekM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sa0JBQWlDO0FBQ3JDLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxLQUFLLFFBQVEsR0FBSTtBQUN6RCxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsTUFBTSxLQUFLLFFBQVE7QUFBQSxJQUNsRDtBQUNBLFVBQU0sS0FBSyxVQUFVLE1BQU07QUFDM0IsVUFBTSxLQUFLLFVBQVUsU0FBUztBQUFBLEVBQ2hDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRQSxNQUFjLFdBQVcsTUFBYyxTQUFnQztBQUNyRSxVQUFNLGlCQUFhLGdDQUFjLElBQUk7QUFDckMsVUFBTSxXQUFXLEtBQUssSUFBSSxNQUFNLHNCQUFzQixVQUFVO0FBRWhFLFFBQUksb0JBQW9CLHdCQUFPO0FBQzdCLFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxVQUFVLE1BQU0sT0FBTztBQUNwRDtBQUFBLElBQ0Y7QUFFQSxVQUFNLGFBQWEsV0FBVyxVQUFVLEdBQUcsV0FBVyxZQUFZLEdBQUcsQ0FBQztBQUN0RSxRQUFJLGNBQWMsQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxVQUFVLEdBQUk7QUFDcEUsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sVUFBVTtBQUFBLElBQy9DO0FBRUEsUUFBSSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxVQUFVLEdBQUc7QUFDbkQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sVUFBVTtBQUFBLElBQ2hEO0FBRUEsVUFBTSxLQUFLLElBQUksTUFBTSxPQUFPLFlBQVksT0FBTztBQUFBLEVBQ2pEO0FBQUE7QUFBQSxFQUlRLFFBQVEsU0FBeUI7QUFDdkMsZUFBTyxnQ0FBYyxHQUFHLEtBQUssUUFBUSxTQUFTLE9BQU8sT0FBTztBQUFBLEVBQzlEO0FBQUEsRUFFQSxNQUFNLE9BQU8sU0FBMEM7QUFDckQsVUFBTSxPQUFPLEtBQUssUUFBUSxPQUFPO0FBQ2pDLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJLEdBQUk7QUFDaEQsYUFBTztBQUFBLElBQ1Q7QUFDQSxRQUFJO0FBQ0YsWUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELGFBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxJQUMzQixTQUFTLEdBQUc7QUFDVixjQUFRLEtBQUssNEZBQWdDLElBQUksSUFBSSxDQUFDO0FBQ3RELGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxhQUErQztBQUNuRCxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQzNCLFVBQU0sY0FBVSxnQ0FBYyxHQUFHLEtBQUssUUFBUSxPQUFPO0FBQ3JELFVBQU0sUUFBUSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxPQUFPO0FBQ3ZELFVBQU0sT0FBZ0MsQ0FBQztBQUV2QyxVQUFNLFFBQVEsTUFBTSxNQUNqQixPQUFPLE9BQUssRUFBRSxTQUFTLE9BQU8sQ0FBQyxFQUMvQixJQUFJLE9BQU8sU0FBUztBQUNuQixZQUFNLFVBQVUsS0FBSyxNQUFNLEdBQUcsRUFBRSxJQUFJLEdBQUcsUUFBUSxTQUFTLEVBQUU7QUFDMUQsVUFBSSxDQUFDLFFBQVM7QUFDZCxVQUFJO0FBQ0YsY0FBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELGFBQUssT0FBTyxJQUFJLEtBQUssTUFBTSxPQUFPO0FBQUEsTUFDcEMsU0FBUyxHQUFHO0FBQ1YsZ0JBQVEsS0FBSyw2QkFBNkIsSUFBSSxJQUFJLENBQUM7QUFBQSxNQUNyRDtBQUFBLElBQ0YsQ0FBQztBQUVILFVBQU0sUUFBUSxJQUFJLEtBQUs7QUFDdkIsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBLEVBR0EsTUFBTSxhQUFnQztBQUNwQyxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQzNCLFVBQU0sY0FBVSxnQ0FBYyxHQUFHLEtBQUssUUFBUSxPQUFPO0FBQ3JELFVBQU0sUUFBUSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxPQUFPO0FBQ3ZELFVBQU0sT0FBaUIsQ0FBQztBQUN4QixlQUFXLFFBQVEsTUFBTSxPQUFPO0FBQzlCLFVBQUksS0FBSyxTQUFTLE9BQU8sR0FBRztBQUMxQixjQUFNLFVBQVUsS0FBSyxNQUFNLEdBQUcsRUFBRSxJQUFJLEdBQUcsUUFBUSxTQUFTLEVBQUU7QUFDMUQsWUFBSSxRQUFTLE1BQUssS0FBSyxPQUFPO0FBQUEsTUFDaEM7QUFBQSxJQUNGO0FBQ0EsU0FBSyxLQUFLLEVBQUUsUUFBUTtBQUNwQixXQUFPO0FBQUEsRUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsTUFBTSxpQkFBaUIsT0FBTyxHQUFHLFdBQVcsSUFPekM7QUFDRCxVQUFNLFVBQVUsTUFBTSxLQUFLLFdBQVc7QUFDdEMsVUFBTSxRQUFRLFFBQVE7QUFDdEIsVUFBTSxRQUFRLE9BQU87QUFDckIsVUFBTSxXQUFXLFFBQVEsTUFBTSxPQUFPLFFBQVEsUUFBUTtBQUN0RCxVQUFNLE9BQWdDLENBQUM7QUFFdkMsVUFBTSxRQUFRLFNBQVMsSUFBSSxPQUFPLFlBQVk7QUFDNUMsVUFBSTtBQUNGLGNBQU0sT0FBTyxNQUFNLEtBQUssT0FBTyxPQUFPO0FBQ3RDLFlBQUksS0FBTSxNQUFLLE9BQU8sSUFBSTtBQUFBLE1BQzVCLFNBQVMsR0FBRztBQUNWLGdCQUFRLEtBQUssdUJBQXVCLE9BQU8sSUFBSSxDQUFDO0FBQUEsTUFDbEQ7QUFBQSxJQUNGLENBQUM7QUFDRCxVQUFNLFFBQVEsSUFBSSxLQUFLO0FBRXZCLFdBQU87QUFBQSxNQUNMO0FBQUEsTUFDQSxNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTLFFBQVEsU0FBUyxTQUFTO0FBQUEsSUFDckM7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLE9BQU8sU0FBaUM7QUFDNUMsVUFBTSxLQUFLLFVBQVUsTUFBTTtBQUMzQixVQUFNLFVBQVUsUUFBUTtBQUN4QixRQUFJLENBQUMsU0FBUztBQUNaLFlBQU0sSUFBSSxNQUFNLGdDQUFnQztBQUFBLElBQ2xEO0FBQ0EsVUFBTSxPQUFPLEtBQUssUUFBUSxPQUFPO0FBQ2pDLFVBQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxVQUFVLFNBQVMsTUFBTSxDQUFDLENBQUM7QUFBQSxFQUM5RDtBQUFBLEVBRUEsTUFBTSxVQUFVLFNBQWdDO0FBQzlDLFVBQU0sT0FBTyxLQUFLLFFBQVEsT0FBTztBQUNqQyxRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBRztBQUM3QyxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUlRLFlBQW9CO0FBQzFCLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsYUFBYTtBQUFBLEVBQ3BEO0FBQUEsRUFFQSxNQUFNLFdBQWdDO0FBQ3BDLFVBQU0sT0FBTyxLQUFLLFVBQVU7QUFDNUIsUUFBSSxDQUFFLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBSTtBQUNoRCxhQUFPLENBQUM7QUFBQSxJQUNWO0FBQ0EsVUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELFdBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxFQUMzQjtBQUFBLEVBRUEsTUFBTSxTQUFTLE9BQWtDO0FBQy9DLFVBQU0sT0FBTyxLQUFLLFVBQVU7QUFDNUIsVUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLFVBQVUsT0FBTyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQzVEO0FBQUE7QUFBQSxFQUlRLGVBQXVCO0FBQzdCLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsZ0JBQWdCO0FBQUEsRUFDdkQ7QUFBQSxFQUVBLE1BQU0sV0FBVyxLQUErQjtBQUM5QyxVQUFNLFdBQVcsTUFBTSxLQUFLLGVBQWU7QUFDM0MsV0FBTyxTQUFTLEdBQUcsS0FBSztBQUFBLEVBQzFCO0FBQUEsRUFFQSxNQUFNLFdBQVcsS0FBYSxPQUErQjtBQUMzRCxVQUFNLFdBQU8sZ0NBQWMsS0FBSyxhQUFhLENBQUM7QUFDOUMsVUFBTSxXQUFXLEtBQUssSUFBSSxNQUFNLHNCQUFzQixJQUFJO0FBRTFELFFBQUksb0JBQW9CLHdCQUFPO0FBRTdCLFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxVQUFVLENBQUMsU0FBUztBQUMvQyxjQUFNLFdBQW9DLEtBQUssTUFBTSxJQUFJO0FBQ3pELGlCQUFTLEdBQUcsSUFBSTtBQUNoQixlQUFPLEtBQUssVUFBVSxVQUFVLE1BQU0sQ0FBQztBQUFBLE1BQ3pDLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxZQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUFBLElBQ3ZFO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxpQkFBdUM7QUFDM0MsVUFBTSxPQUFPLEtBQUssYUFBYTtBQUMvQixRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFJO0FBQ2hELGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFDQSxRQUFJO0FBQ0YsWUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELGFBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxJQUMzQixRQUFRO0FBQ04sYUFBTyxDQUFDO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBSVEsc0JBQThCO0FBQ3BDLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsd0JBQXdCO0FBQUEsRUFDL0Q7QUFBQSxFQUVBLE1BQU0scUJBQXNEO0FBQzFELFVBQU0sT0FBTyxLQUFLLG9CQUFvQjtBQUN0QyxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFJO0FBQ2hELGFBQU87QUFBQSxJQUNUO0FBQ0EsVUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELFdBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxFQUMzQjtBQUFBLEVBRUEsTUFBTSxtQkFBbUIsTUFBc0M7QUFDN0QsVUFBTSxPQUFPLEtBQUssb0JBQW9CO0FBQ3RDLFVBQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFBQSxFQUMzRDtBQUFBO0FBQUEsRUFJUSxvQkFBNEI7QUFDbEMsZUFBTyxnQ0FBYyxHQUFHLEtBQUssUUFBUSxzQkFBc0I7QUFBQSxFQUM3RDtBQUFBLEVBRUEsTUFBTSxtQkFBa0Q7QUFDdEQsVUFBTSxPQUFPLEtBQUssa0JBQWtCO0FBQ3BDLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJLEdBQUk7QUFDaEQsYUFBTztBQUFBLElBQ1Q7QUFDQSxVQUFNLFVBQWtCLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxLQUFLLElBQUk7QUFDOUQsV0FBTyxLQUFLLE1BQU0sT0FBTztBQUFBLEVBQzNCO0FBQUEsRUFFQSxNQUFNLGlCQUFpQixNQUFvQztBQUN6RCxVQUFNLE9BQU8sS0FBSyxrQkFBa0I7QUFDcEMsVUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQzNEO0FBQUE7QUFBQSxFQUlBLE1BQU0sZ0JBQXNDO0FBQzFDLFVBQU0sQ0FBQyxNQUFNLE9BQU8sVUFBVSxpQkFBaUIsYUFBYSxJQUFJLE1BQU0sUUFBUSxJQUFJO0FBQUEsTUFDaEYsS0FBSyxXQUFXO0FBQUEsTUFDaEIsS0FBSyxTQUFTO0FBQUEsTUFDZCxLQUFLLGVBQWU7QUFBQSxNQUNwQixLQUFLLG1CQUFtQjtBQUFBLE1BQ3hCLEtBQUssaUJBQWlCO0FBQUEsSUFDeEIsQ0FBQztBQUVELFdBQU87QUFBQSxNQUNMLFNBQVM7QUFBQSxNQUNULGFBQVksb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxNQUNuQyxhQUFhO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLFFBQVEsQ0FBQztBQUFBLE1BQ1QsU0FBUyxDQUFDO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sV0FBVyxNQUFlLFVBQWdELENBQUMsR0FBa0I7QUFDakcsVUFBTSxLQUFLLGdCQUFnQjtBQUMzQixVQUFNLFdBQVcsUUFBUSxZQUFZO0FBR3JDLFVBQU0sU0FBUyxnQkFBZ0IsU0FBUyxJQUFJO0FBRTVDLFFBQUksT0FBTyxTQUFTLFFBQVc7QUFFN0IsWUFBTSxPQUFRLE9BQU8sUUFBUSxPQUFPLE9BQU8sU0FBUyxZQUFZLENBQUMsTUFBTSxRQUFRLE9BQU8sSUFBSSxJQUN0RixPQUFPLE9BQ1AsQ0FBQztBQUNMLFVBQUksYUFBYSxhQUFhO0FBQzVCLGNBQU0sS0FBSyxhQUFhO0FBQUEsTUFDMUI7QUFDQSxpQkFBVyxPQUFPLE9BQU8sT0FBTyxJQUFJLEdBQUc7QUFDckMsY0FBTSxLQUFLLE9BQU8sR0FBRztBQUFBLE1BQ3ZCO0FBQUEsSUFDRjtBQUVBLFFBQUksT0FBTyxVQUFVLFFBQVc7QUFDOUIsWUFBTSxXQUF1QixNQUFNLFFBQVEsT0FBTyxLQUFLLElBQUksT0FBTyxRQUFRLENBQUM7QUFDM0UsVUFBSSxhQUFhLFNBQVM7QUFFeEIsY0FBTSxXQUFZLE1BQU0sS0FBSyxTQUFTLEtBQU0sQ0FBQztBQUM3QyxjQUFNLFNBQVMsSUFBSSxJQUFJLFNBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckQsbUJBQVcsUUFBUSxVQUFVO0FBQzNCLGNBQUksUUFBUSxLQUFLLEdBQUksUUFBTyxJQUFJLEtBQUssSUFBSSxJQUFJO0FBQUEsUUFDL0M7QUFDQSxjQUFNLEtBQUssU0FBUyxNQUFNLEtBQUssT0FBTyxPQUFPLENBQUMsQ0FBQztBQUFBLE1BQ2pELE9BQU87QUFFTCxjQUFNLEtBQUssU0FBUyxRQUFRO0FBQUEsTUFDOUI7QUFBQSxJQUNGO0FBRUEsUUFBSSxPQUFPLGFBQWEsVUFBYSxPQUFPLFlBQVksT0FBTyxPQUFPLGFBQWEsVUFBVTtBQUMzRixZQUFNLFdBQVcsT0FBTztBQUN4QixVQUFJO0FBQ0osVUFBSSxhQUFhLFNBQVM7QUFDeEIsY0FBTSxXQUFZLE1BQU0sS0FBSyxlQUFlLEtBQU0sQ0FBQztBQUNuRCxrQkFBVSxFQUFFLEdBQUcsVUFBVSxHQUFHLFNBQVM7QUFBQSxNQUN2QyxPQUFPO0FBQ0wsa0JBQVU7QUFBQSxNQUNaO0FBQ0EsWUFBTSxLQUFLLFdBQVcsS0FBSyxhQUFhLEdBQUcsS0FBSyxVQUFVLFNBQVMsTUFBTSxDQUFDLENBQUM7QUFBQSxJQUM3RTtBQUVBLFFBQUksT0FBTyxvQkFBb0IsUUFBVztBQUN4QyxZQUFNLEtBQUssbUJBQW1CLE9BQU8sZUFBZTtBQUFBLElBQ3REO0FBQ0EsUUFBSSxPQUFPLGtCQUFrQixRQUFXO0FBQ3RDLFlBQU0sS0FBSyxpQkFBaUIsT0FBTyxhQUFhO0FBQUEsSUFDbEQ7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxjQUFVLGdDQUFjLEdBQUcsS0FBSyxRQUFRLE9BQU87QUFDckQsUUFBSSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxPQUFPLEdBQUc7QUFDaEQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sU0FBUyxJQUFJO0FBQUEsSUFDbEQ7QUFDQSxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQUEsRUFDN0I7QUFBQTtBQUFBLEVBR0EsTUFBTSxtQkFBa0M7QUFDdEMsVUFBTSxPQUFPLEtBQUssYUFBYTtBQUMvQixRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBRztBQUM3QyxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLFdBQTBCO0FBQzlCLFFBQUksTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sS0FBSyxRQUFRLEdBQUc7QUFDdEQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sS0FBSyxVQUFVLElBQUk7QUFBQSxJQUN4RDtBQUNBLFVBQU0sS0FBSyxnQkFBZ0I7QUFBQSxFQUM3QjtBQUFBO0FBQUEsRUFJUSxXQUFXLFNBQXlCO0FBQzFDLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsWUFBWSxPQUFPLEtBQUs7QUFBQSxFQUMvRDtBQUFBLEVBRUEsTUFBTSxvQkFBb0IsU0FBaUIsVUFBaUM7QUFDMUUsVUFBTSxLQUFLLFVBQVUsU0FBUztBQUM5QixVQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU87QUFDcEMsVUFBTSxLQUFLLFdBQVcsTUFBTSxRQUFRO0FBQUEsRUFDdEM7QUFBQSxFQUVBLE1BQU0scUJBQXFCLFNBQWdDO0FBQ3pELFVBQU0sT0FBTyxLQUFLLFdBQVcsT0FBTztBQUNwQyxRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBRztBQUM3QyxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQ0Y7OztBRTFaTyxJQUFNLGVBQU4sTUFBTSxhQUFZO0FBQUEsRUFBbEI7QUFDSCxTQUFRLFNBQW1DO0FBQzNDLFNBQVEsb0JBQW1DO0FBQUE7QUFBQSxFQWdCN0MsYUFBYSxRQUFpQztBQUM1QyxTQUFLLFNBQVM7QUFBQSxFQUNoQjtBQUFBLEVBRUEsZUFBcUI7QUFDbkIsU0FBSyxTQUFTO0FBQUEsRUFDaEI7QUFBQTtBQUFBLEVBR1EsYUFBc0I7QUFDNUIsV0FBTyxlQUFlLEtBQUssVUFBVSxTQUFTLFlBQVk7QUFBQSxFQUM1RDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNQSxPQUFlLGdCQUFnQixPQUFnRDtBQUM3RSxRQUFJLENBQUMsTUFBTyxRQUFPO0FBQ25CLFVBQU0sSUFBSSxNQUFNLEtBQUs7QUFDckIsUUFBSSxHQUFXLEdBQVc7QUFFMUIsVUFBTSxXQUFXLEVBQUUsTUFBTSxtQkFBbUI7QUFDNUMsUUFBSSxVQUFVO0FBQ1osWUFBTSxRQUFRLFNBQVMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLFdBQVcsQ0FBQyxDQUFDO0FBQzdELE9BQUMsR0FBRyxHQUFHLENBQUMsSUFBSTtBQUFBLElBQ2QsV0FBVyxFQUFFLENBQUMsTUFBTSxLQUFLO0FBQ3ZCLFVBQUksTUFBTSxFQUFFLE1BQU0sQ0FBQztBQUNuQixVQUFJLElBQUksV0FBVyxFQUFHLE9BQU0sSUFBSSxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDdEUsVUFBSSxJQUFJLFNBQVMsRUFBRyxRQUFPO0FBQzNCLFVBQUksU0FBUyxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRTtBQUNoQyxVQUFJLFNBQVMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDaEMsVUFBSSxTQUFTLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO0FBQUEsSUFDbEMsT0FBTztBQUNMLGFBQU87QUFBQSxJQUNUO0FBRUEsUUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUMsRUFBRyxRQUFPO0FBQzVDLFdBQU8sQ0FBQyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEtBQUssTUFBTSxDQUFDLEdBQUcsS0FBSyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQ3JEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLE9BQU8sU0FBUyxPQUE4QjtBQUM1QyxVQUFNLE1BQU0sYUFBWSxnQkFBZ0IsS0FBSztBQUM3QyxRQUFJLENBQUMsSUFBSyxRQUFPO0FBQ2pCLFVBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJO0FBRWxCLFVBQU0sS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJO0FBQzNDLFVBQU0sTUFBTSxLQUFLLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLEtBQUssSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksTUFBTTtBQUN4RSxRQUFJLE1BQU0sRUFBRyxRQUFPO0FBRXBCLFFBQUk7QUFDSixRQUFJLFFBQVEsR0FBSSxNQUFNLEtBQUssTUFBTSxJQUFLO0FBQUEsYUFDN0IsUUFBUSxHQUFJLE1BQUssS0FBSyxNQUFNLElBQUk7QUFBQSxRQUNwQyxNQUFLLEtBQUssTUFBTSxJQUFJO0FBRXpCLFFBQUksS0FBSyxNQUFNLElBQUksRUFBRTtBQUNyQixXQUFPLElBQUksSUFBSSxJQUFJLE1BQU07QUFBQSxFQUMzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9BLE9BQU8sZUFBZSxPQUE4QjtBQUNsRCxVQUFNLE1BQU0sYUFBWSxnQkFBZ0IsS0FBSztBQUM3QyxRQUFJLENBQUMsSUFBSyxRQUFPO0FBQ2pCLFdBQU8sSUFBSSxLQUFLLElBQUk7QUFBQSxFQUN0QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9BLFVBQVUsc0JBQXNCLE9BQWE7QUFDM0MsUUFBSSxDQUFDLEtBQUssUUFBUSxjQUFlO0FBRWpDLFVBQU0sVUFBbUc7QUFBQSxNQUN2RyxRQUFRLEtBQUssV0FBVztBQUFBLElBQzFCO0FBRUEsUUFBSSxxQkFBcUI7QUFDdkIsWUFBTSxTQUFTLGlCQUFpQixlQUFlLElBQUksRUFDaEQsaUJBQWlCLHNCQUFzQixFQUN2QyxLQUFLO0FBQ1IsWUFBTSxNQUFNLGFBQVksU0FBUyxNQUFNO0FBQ3ZDLFVBQUksUUFBUSxLQUFNLFNBQVEsTUFBTTtBQUdoQyxZQUFNLFVBQVUsaUJBQWlCLGVBQWUsSUFBSSxFQUNqRCxpQkFBaUIsd0JBQXdCLEVBQ3pDLEtBQUs7QUFDUixZQUFNLEtBQUssYUFBWSxlQUFlLE9BQU87QUFDN0MsVUFBSSxPQUFPLEtBQU0sU0FBUSxLQUFLO0FBRzlCLFlBQU0sYUFBYSxpQkFBaUIsZUFBZSxJQUFJLEVBQ3BELGlCQUFpQixlQUFlLEVBQ2hDLEtBQUs7QUFDUixZQUFNLGdCQUFnQixhQUFZLGVBQWUsVUFBVTtBQUMzRCxVQUFJLGtCQUFrQixLQUFNLFNBQVEsYUFBYTtBQUVqRCxZQUFNLFlBQVksaUJBQWlCLGVBQWUsSUFBSSxFQUNuRCxpQkFBaUIsY0FBYyxFQUMvQixLQUFLO0FBQ1IsWUFBTSxlQUFlLGFBQVksZUFBZSxTQUFTO0FBQ3pELFVBQUksaUJBQWlCLEtBQU0sU0FBUSxZQUFZO0FBQUEsSUFDakQ7QUFFQSxTQUFLLE9BQU8sY0FBYztBQUFBLE1BQ3hCO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixJQUFJLGdCQUFnQixLQUFLLElBQUk7QUFBQSxRQUM3QjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsZUFBZSxzQkFBc0IsT0FBYTtBQUNoRCxTQUFLLFVBQVUsbUJBQW1CO0FBQUEsRUFDcEM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRQSxPQUFPLG9CQUFvQixLQUFhLGlCQUF5QixRQUF5QztBQUN4RyxVQUFNLElBQUksS0FBSyxNQUFNLEdBQUc7QUFDeEIsVUFBTSxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLGVBQWUsQ0FBQztBQUd0RCxVQUFNLFVBQVU7QUFDaEIsVUFBTSxVQUFVLFNBQVMsS0FBSztBQUM5QixVQUFNLFNBQVMsT0FBTyxDQUFDLEtBQUssT0FBTyxNQUFNLE9BQU87QUFDaEQsVUFBTSxjQUFjLE9BQU8sQ0FBQyxLQUFLLE9BQU8sTUFBTSxVQUFVLENBQUM7QUFHekQsVUFBTSxNQUFNLFNBQVMsSUFBSTtBQUN6QixVQUFNLE1BQU0sU0FDUixLQUFLLElBQUksR0FBRyxLQUFLLEtBQUssR0FBRyxJQUN6QixLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssSUFBSTtBQUMvQixVQUFNLFlBQVksT0FBTyxDQUFDLEtBQUssR0FBRyxNQUFNLEdBQUc7QUFDM0MsVUFBTSxjQUFjLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxTQUFTLE1BQU0sSUFBSSxNQUFNLENBQUM7QUFHcEUsVUFBTSxhQUFhLFNBQVMsT0FBTyxDQUFDLGVBQWUsT0FBTyxDQUFDO0FBQzNELFVBQU0sWUFBYSxTQUFTLE9BQU8sQ0FBQyxlQUFlLE9BQU8sQ0FBQztBQUUzRCxXQUFPO0FBQUEsTUFDTCx3QkFBd0I7QUFBQSxNQUN4Qiw4QkFBOEI7QUFBQSxNQUM5QixpQkFBaUI7QUFBQSxNQUNqQix3QkFBd0I7QUFBQSxNQUN4QiwwQkFBMEI7QUFBQSxNQUMxQixpQkFBaUI7QUFBQSxNQUNqQixnQkFBZ0I7QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTUEsYUFBYSxLQUFhLGlCQUF5QixRQUF1QjtBQUN4RSxRQUFJLEtBQUssa0JBQW1CLFFBQU8sYUFBYSxLQUFLLGlCQUFpQjtBQUN0RSxpQkFBWSxjQUFjO0FBQzFCLFNBQUssb0JBQW9CLE9BQU8sV0FBVyxNQUFNO0FBQy9DLFVBQUksYUFBWSxZQUFhO0FBQzdCLFlBQU0sT0FBTyxhQUFZLG9CQUFvQixLQUFLLGlCQUFpQixNQUFNO0FBQ3pFLGlCQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssT0FBTyxRQUFRLElBQUksR0FBRztBQUMvQyx1QkFBZSxLQUFLLE1BQU0sWUFBWSxLQUFLLEtBQUs7QUFBQSxNQUNsRDtBQUFBLElBQ0YsR0FBRyxFQUFFO0FBQUEsRUFDUDtBQUFBO0FBQUEsRUFHQSxPQUFPLGtCQUF3QjtBQUM3QixpQkFBWSxjQUFjO0FBQzFCLGVBQVcsT0FBTyxhQUFZLGVBQWU7QUFDM0MscUJBQWUsS0FBSyxNQUFNLGVBQWUsR0FBRztBQUFBLElBQzlDO0FBQUEsRUFDRjtBQUNGO0FBQUE7QUFqTmEsYUFLZSxnQkFBZ0I7QUFBQSxFQUN0QztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBQUE7QUFiUyxhQWdCTSxjQUFjO0FBaEIxQixJQUFNLGNBQU47OztBQ0pBLElBQU0sMkJBQTJCO0FBQUEsRUFDdEM7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBUztBQUNwRTtBQUdBLElBQU0sbUJBQTJDO0FBQUEsRUFDL0MsUUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsUUFBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUNYO0FBR08sSUFBTSxhQUFxQztBQUFBLEVBQ2hELFNBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULE9BQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFVBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULEdBQUc7QUFDTDs7O0FKM0JBLElBQU0sWUFBWSxDQUFDLFVBQVUsUUFBUSxjQUFjO0FBUTVDLElBQU0sU0FBTixNQUFhO0FBQUEsRUFZbEIsWUFDRSxLQUNBLFVBQ0EsY0FDQSxXQUNBLFdBQ0E7QUFiRixTQUFRLFNBQW1DO0FBQzNDLFNBQVEsaUJBQXlEO0FBQ2pFLFNBQVEsZUFBc0QsQ0FBQztBQVk3RCxTQUFLLFdBQVc7QUFDaEIsU0FBSyxlQUFlO0FBQ3BCLFNBQUssVUFBVSxJQUFJLGFBQWEsR0FBRztBQUNuQyxTQUFLLGNBQWMsSUFBSSxZQUFZO0FBQ25DLFNBQUssZUFBZSxJQUFJLE1BQU07QUFDOUIsU0FBSyxZQUFZO0FBQ2pCLFNBQUssWUFBWTtBQUFBLEVBQ25CO0FBQUE7QUFBQSxFQUdBLE1BQU0sa0JBQWlDO0FBQ3JDLFVBQU0sS0FBSyxRQUFRLGdCQUFnQjtBQUFBLEVBQ3JDO0FBQUE7QUFBQSxFQUdBLGdCQUFnQixRQUFxRDtBQUNuRSxTQUFLLGVBQWU7QUFBQSxFQUN0QjtBQUFBO0FBQUEsRUFHQSxPQUFPLFFBQWlDO0FBQ3RDLFNBQUssT0FBTztBQUNaLFNBQUssU0FBUztBQUNkLFNBQUssWUFBWSxhQUFhLE1BQU07QUFFcEMsU0FBSyxpQkFBaUIsQ0FBQyxVQUF3QjtBQUM3QyxXQUFLLEtBQUssVUFBVSxLQUFLO0FBQUEsSUFDM0I7QUFDQSxXQUFPLGlCQUFpQixXQUFXLEtBQUssY0FBYztBQUFBLEVBQ3hEO0FBQUE7QUFBQSxFQUdBLFNBQWU7QUFDYixRQUFJLEtBQUssZ0JBQWdCO0FBQ3ZCLGFBQU8sb0JBQW9CLFdBQVcsS0FBSyxjQUFjO0FBQ3pELFdBQUssaUJBQWlCO0FBQUEsSUFDeEI7QUFDQSxTQUFLLFlBQVksYUFBYTtBQUM5QixTQUFLLFNBQVM7QUFBQSxFQUNoQjtBQUFBO0FBQUEsRUFHQSxlQUFlLHFCQUFvQztBQUNqRCxTQUFLLFNBQVMsc0JBQXNCO0FBQ3BDLFNBQUssWUFBWSxVQUFVLG1CQUFtQjtBQUFBLEVBQ2hEO0FBQUE7QUFBQSxFQUdRLFFBQVEsSUFBWSxTQUF3QjtBQUNsRCxRQUFJLENBQUMsS0FBSyxRQUFRLGNBQWU7QUFDakMsU0FBSyxPQUFPLGNBQWMsWUFBWSxFQUFFLElBQUksUUFBUSxHQUFHLEdBQUc7QUFBQSxFQUM1RDtBQUFBO0FBQUEsRUFHUSxhQUFhLElBQVksT0FBcUI7QUFDcEQsUUFBSSxDQUFDLEtBQUssUUFBUSxjQUFlO0FBQ2pDLFNBQUssT0FBTyxjQUFjLFlBQVksRUFBRSxJQUFJLE1BQU0sR0FBRyxHQUFHO0FBQUEsRUFDMUQ7QUFBQTtBQUFBLEVBR0EsTUFBYyxVQUFVLE9BQW9DO0FBQzFELFVBQU0sTUFBTSxNQUFNO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxHQUFJO0FBR2xDLFFBQUksS0FBSyxVQUFVLE1BQU0sV0FBVyxLQUFLLE9BQU8sY0FBZTtBQUcvRCxVQUFNLGdCQUFnQixDQUFDLFlBQVksUUFBUSxTQUFTLFFBQVE7QUFDNUQsUUFBSSxDQUFDLGNBQWMsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFNLFdBQVcsQ0FBQyxDQUFDLEVBQUc7QUFFekQsUUFBSTtBQUNGLFlBQU0sS0FBSyxjQUFjLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQztBQUFBLElBQzlELFNBQVMsR0FBRztBQUNWLFdBQUssYUFBYSxJQUFJLElBQUksYUFBYSxRQUFRLEVBQUUsVUFBVSxlQUFlO0FBQUEsSUFDNUU7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsY0FBYyxNQUFjLElBQVksU0FBaUM7QUFFckYsUUFBSSxTQUFTLGFBQWE7QUFDeEIsV0FBSyxZQUFZLFVBQVUsS0FBSyxTQUFTLG1CQUFtQjtBQUM1RCxXQUFLLFFBQVEsSUFBSTtBQUFBLFFBQ2YsSUFBSTtBQUFBLFFBQ0osZUFBZSxLQUFLLFNBQVMsaUJBQWlCO0FBQUEsUUFDOUMsY0FBYyxLQUFLO0FBQUEsUUFDbkIsY0FBYyxLQUFLLFNBQVMsY0FBYyxDQUFDO0FBQUEsUUFDM0MsdUJBQXVCLEtBQUssU0FBUyx5QkFBeUI7QUFBQSxNQUNoRSxDQUFDO0FBQ0Q7QUFBQSxJQUNGO0FBRUEsUUFBSSxTQUFTLGFBQWE7QUFDeEIsV0FBSyxRQUFRLElBQUksRUFBRSxJQUFJLEtBQUssQ0FBQztBQUM3QjtBQUFBLElBQ0Y7QUFHQSxRQUFJLFNBQVMseUJBQXlCO0FBQ3BDLFdBQUssU0FBUyxnQkFBZ0I7QUFDOUIsWUFBTSxLQUFLLGFBQWE7QUFDeEIsV0FBSyxRQUFRLElBQUksRUFBRSxJQUFJLEtBQUssQ0FBQztBQUM3QjtBQUFBLElBQ0Y7QUFHQSxRQUFJLFNBQVMsd0JBQXdCO0FBQ25DLFdBQUssU0FBUyxhQUFjLE1BQU0sUUFBUSxPQUFPLElBQUksVUFBVSxDQUFDO0FBQ2hFLFlBQU0sS0FBSyxhQUFhO0FBQ3hCLFdBQUssUUFBUSxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0I7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLG1CQUFtQjtBQUM5QixZQUFNLElBQUk7QUFDVixZQUFNLGdCQUFnQixlQUFlLEtBQUssVUFBVSxTQUFTLFlBQVk7QUFDekUsVUFBSSxFQUFFLFdBQVcsZUFBZTtBQUM5QixjQUFNLGNBQWMsRUFBRSxTQUFTLGVBQWU7QUFDOUMsY0FBTSxjQUFjLEVBQUUsU0FBUyxnQkFBZ0I7QUFDL0MsdUJBQWUsS0FBSyxVQUFVLE9BQU8sV0FBVztBQUNoRCx1QkFBZSxLQUFLLFVBQVUsSUFBSSxXQUFXO0FBQzdDLGFBQUssWUFBWSxVQUFVLEtBQUssU0FBUyxtQkFBbUI7QUFBQSxNQUM5RDtBQUNBLFdBQUssUUFBUSxJQUFJLEVBQUUsSUFBSSxNQUFNLFFBQVEsRUFBRSxPQUFPLENBQUM7QUFDL0M7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLHFCQUFxQjtBQUNoQyxZQUFNLElBQUk7QUFDVixVQUFJLEtBQUssU0FBUyx1QkFBdUI7QUFDdkMsYUFBSyxZQUFZLGFBQWEsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsTUFBTTtBQUFBLE1BQ2xFO0FBQ0EsV0FBSyxRQUFRLElBQUksRUFBRSxJQUFJLEtBQUssQ0FBQztBQUM3QjtBQUFBLElBQ0Y7QUFHQSxRQUFJLFNBQVMsMkJBQTJCO0FBQ3RDLFVBQUk7QUFDRixjQUFNLFFBQVEsTUFBTSxLQUFLLG9CQUFvQjtBQUM3QyxhQUFLLFFBQVEsSUFBSSxFQUFFLE1BQU0sQ0FBQztBQUFBLE1BQzVCLFNBQVMsR0FBRztBQUNWLGFBQUssYUFBYSxJQUFJLGFBQWEsUUFBUSxFQUFFLFVBQVUsNENBQVM7QUFBQSxNQUNsRTtBQUNBO0FBQUEsSUFDRjtBQUdBLFFBQUksU0FBUyxxQkFBcUI7QUFDaEMsWUFBTSxLQUFLLG9CQUFvQixJQUFJLE9BQU87QUFDMUM7QUFBQSxJQUNGO0FBR0EsVUFBTSxTQUFTLE1BQU0sS0FBSyxxQkFBcUIsTUFBTSxPQUFPO0FBQzVELFNBQUssUUFBUSxJQUFJLE1BQU07QUFBQSxFQUN6QjtBQUFBO0FBQUEsRUFHQSxNQUFjLHFCQUFxQixNQUFjLFNBQW9DO0FBQ25GLFVBQU0sSUFBSTtBQUNWLFlBQVEsTUFBTTtBQUFBLE1BQ1osS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsT0FBTyxFQUFFLE9BQWlCO0FBQUEsTUFDdEQsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsT0FBTyxFQUFFLElBQWU7QUFBQSxNQUNwRCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxXQUFXO0FBQUEsTUFDdkMsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsVUFBVSxFQUFFLE9BQWlCO0FBQUEsTUFDekQsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsV0FBVyxFQUFFLEdBQWE7QUFBQSxNQUN0RCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxXQUFXLEVBQUUsS0FBZSxFQUFFLEtBQUs7QUFBQSxNQUMvRCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxlQUFlO0FBQUEsTUFDM0MsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsU0FBUztBQUFBLE1BQ3JDLEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFNBQVMsRUFBRSxLQUFjO0FBQUEsTUFDckQsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsbUJBQW1CO0FBQUEsTUFDL0MsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsbUJBQW1CLEVBQUUsSUFBYTtBQUFBLE1BQzlELEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLGlCQUFpQjtBQUFBLE1BQzdDLEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLGlCQUFpQixFQUFFLElBQWE7QUFBQSxNQUM1RCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxXQUFXO0FBQUEsTUFDdkMsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVE7QUFBQSxVQUN2QixFQUFFLFFBQW1CO0FBQUEsVUFDckIsRUFBRSxZQUF1QjtBQUFBLFFBQzVCO0FBQUEsTUFDRixLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxjQUFjO0FBQUEsTUFDMUMsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVE7QUFBQSxVQUN4QixFQUFFO0FBQUEsVUFDRixFQUFFLFVBQVcsRUFBRSxTQUFxQyxTQUE4QztBQUFBLFFBQ3BHO0FBQUEsTUFDRixLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxTQUFTO0FBQUEsTUFDckM7QUFDRSxjQUFNLElBQUksTUFBTSxpQ0FBaUMsSUFBSSxFQUFFO0FBQUEsSUFDM0Q7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsb0JBQ1osV0FBVyxHQUNnRTtBQUMzRSxVQUFNLFVBQTRFLENBQUM7QUFDbkYsVUFBTSxVQUFVLEtBQUs7QUFFckIsUUFBSSxLQUFLLFdBQVc7QUFDbEIsVUFBSTtBQUNGLGNBQU0sT0FBTyxNQUFNLFFBQVEsS0FBSyxLQUFLLFNBQVM7QUFDOUMsbUJBQVcsUUFBUSxLQUFLLE9BQU87QUFDN0IsY0FBSSxLQUFLLFdBQVcsR0FBRyxFQUFHO0FBQzFCLGdCQUFNLE1BQU0sS0FBSyxVQUFVLEtBQUssWUFBWSxHQUFHLENBQUMsRUFBRSxZQUFZO0FBQzlELGNBQUkseUJBQXlCLFNBQVMsR0FBRyxHQUFHO0FBQzFDLGdCQUFJO0FBQ0Ysb0JBQU0sZUFBVyxnQ0FBYyxHQUFHLEtBQUssU0FBUyxJQUFJLElBQUksRUFBRTtBQUMxRCxvQkFBTSxPQUFPLE1BQU0sUUFBUSxLQUFLLFFBQVE7QUFDeEMsc0JBQVEsS0FBSyxFQUFFLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFBQSxZQUN6RSxRQUFRO0FBQUEsWUFBYTtBQUFBLFVBQ3ZCO0FBQUEsUUFDRjtBQUFBLE1BQ0YsUUFBUTtBQUFBLE1BQWE7QUFDckIsY0FBUSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsS0FBSyxjQUFjLEVBQUUsSUFBSSxDQUFDO0FBQ25ELGFBQU87QUFBQSxJQUNUO0FBR0EsVUFBTSxVQUFVLE9BQU8sYUFBcUIsVUFBaUM7QUFDM0UsVUFBSSxRQUFRLFNBQVU7QUFDdEIsVUFBSTtBQUNKLFVBQUk7QUFDRixlQUFPLE1BQU0sUUFBUSxLQUFLLFdBQVc7QUFBQSxNQUN2QyxRQUFRO0FBQ047QUFBQSxNQUNGO0FBRUEsaUJBQVcsVUFBVSxLQUFLLFNBQVM7QUFDakMsWUFBSSxPQUFPLFdBQVcsR0FBRyxFQUFHO0FBQzVCLGNBQU0sVUFBVSxvQkFBSSxJQUFJLENBQUMsR0FBRyxXQUFXLEdBQUksS0FBSyxZQUFZLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFFLENBQUM7QUFDbkYsWUFBSSxRQUFRLElBQUksTUFBTSxFQUFHO0FBQ3pCLGNBQU0sVUFBVSxrQkFBYyxnQ0FBYyxHQUFHLFdBQVcsSUFBSSxNQUFNLEVBQUUsSUFBSTtBQUMxRSxjQUFNLFFBQVEsU0FBUyxRQUFRLENBQUM7QUFBQSxNQUNsQztBQUVBLGlCQUFXLFFBQVEsS0FBSyxPQUFPO0FBQzdCLFlBQUksS0FBSyxXQUFXLEdBQUcsRUFBRztBQUMxQixjQUFNLE1BQU0sS0FBSyxVQUFVLEtBQUssWUFBWSxHQUFHLENBQUMsRUFBRSxZQUFZO0FBQzlELFlBQUkseUJBQXlCLFNBQVMsR0FBRyxHQUFHO0FBQzFDLGNBQUk7QUFDRixrQkFBTSxlQUFlLGtCQUFjLGdDQUFjLEdBQUcsV0FBVyxJQUFJLElBQUksRUFBRSxJQUFJO0FBQzdFLGtCQUFNLE9BQU8sTUFBTSxRQUFRLEtBQUssWUFBWTtBQUM1QyxvQkFBUSxLQUFLLEVBQUUsTUFBTSxjQUFjLE1BQU0sTUFBTSxNQUFNLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUFBLFVBQzdFLFFBQVE7QUFBQSxVQUFhO0FBQUEsUUFDdkI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLFVBQU0sUUFBUSxJQUFJLENBQUM7QUFDbkIsWUFBUSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsS0FBSyxjQUFjLEVBQUUsSUFBSSxDQUFDO0FBQ25ELFdBQU87QUFBQSxFQUNUO0FBQUE7QUFBQSxFQUdBLE1BQWMsb0JBQW9CLElBQVksU0FBaUM7QUFDN0UsUUFBSTtBQUNGLFlBQU0sSUFBSTtBQUNWLFlBQU0sZUFBZSxFQUFFLFFBQVE7QUFDL0IsVUFBSSxDQUFDLGFBQWMsT0FBTSxJQUFJLE1BQU0sNENBQVM7QUFFNUMsWUFBTSxNQUFNLGFBQWEsVUFBVSxhQUFhLFlBQVksR0FBRyxDQUFDLEVBQUUsWUFBWTtBQUM5RSxVQUFJLENBQUMseUJBQXlCLFNBQVMsR0FBRyxFQUFHLE9BQU0sSUFBSSxNQUFNLDJEQUFjLEdBQUc7QUFDOUUsVUFBSSxhQUFhLFNBQVMsSUFBSSxFQUFHLE9BQU0sSUFBSSxNQUFNLHNDQUFRO0FBRXpELFlBQU0sVUFBVSxLQUFLO0FBQ3JCLFlBQU0sT0FBTyxNQUFNLFFBQVEsS0FBSyxZQUFZO0FBQzVDLFVBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxPQUFRLE9BQU0sSUFBSSxNQUFNLHlDQUFXLFlBQVk7QUFHMUUsWUFBTSxXQUFZLFFBQTRDLFlBQVk7QUFDMUUsVUFBSSxDQUFDLFNBQVUsT0FBTSxJQUFJLE1BQU0sOERBQVk7QUFDM0MsWUFBTSxlQUFXLGdDQUFjLEdBQUcsUUFBUSxJQUFJLFlBQVksRUFBRTtBQUM1RCxVQUFJLENBQUMsU0FBUyxXQUFXLFFBQVEsRUFBRyxPQUFNLElBQUksTUFBTSxzQ0FBUTtBQUU1RCxXQUFLLFFBQVEsSUFBSTtBQUFBLFFBQ2YsVUFBVTtBQUFBLFFBQ1YsTUFBTSxhQUFhLE1BQU0sR0FBRyxFQUFFLElBQUksR0FBRyxRQUFRLEtBQUssRUFBRSxLQUFLO0FBQUEsTUFDM0QsQ0FBQztBQUFBLElBQ0gsU0FBUyxHQUFHO0FBQ1YsV0FBSyxhQUFhLElBQUksYUFBYSxRQUFRLEVBQUUsVUFBVSxzQ0FBUTtBQUFBLElBQ2pFO0FBQUEsRUFDRjtBQUNGOzs7QUY3VU8sSUFBTSx5QkFBeUI7QUFVL0IsSUFBTSxrQkFBTixjQUE4QiwwQkFBUztBQUFBLEVBVTVDLFlBQ0UsTUFDQSxXQUNBLFNBQ0EsVUFDQSxjQUNBO0FBQ0EsVUFBTSxJQUFJO0FBWlosU0FBUSxVQUEwQjtBQUNsQyxTQUFRLFNBQXdCO0FBQ2hDLFNBQVEsU0FBbUM7QUFDM0MsU0FBUSxlQUFnQztBQVV0QyxTQUFLLFlBQVk7QUFDakIsU0FBSyxXQUFXO0FBQ2hCLFNBQUssZUFBZTtBQUFBLEVBQ3RCO0FBQUEsRUFFQSxjQUFzQjtBQUNwQixXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsaUJBQXlCO0FBQ3ZCLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxVQUFrQjtBQUNoQixXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBTSxTQUF3QjtBQUM1QixVQUFNLFlBQXlCLEtBQUssWUFBWSxTQUFTLENBQUM7QUFDMUQsY0FBVSxNQUFNO0FBQ2hCLGNBQVUsU0FBUyx5QkFBeUI7QUFFNUMsUUFBSSxDQUFDLEtBQUssV0FBVztBQUNuQixnQkFBVSxTQUFTLE9BQU87QUFBQSxRQUN4QixNQUFNO0FBQUEsUUFDTixLQUFLO0FBQUEsTUFDUCxDQUFDO0FBQ0Q7QUFBQSxJQUNGO0FBR0EsU0FBSyxTQUFTLElBQUk7QUFBQSxNQUNoQixLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLLFNBQVMsYUFBYTtBQUFBLE1BQzNCLEtBQUssSUFBSSxNQUFNO0FBQUEsSUFDakI7QUFDQSxVQUFNLEtBQUssT0FBTyxnQkFBZ0I7QUFHbEMsVUFBTSxlQUFlLE1BQU0sS0FBSyxpQkFBaUI7QUFDakQsU0FBSyxPQUFPLGdCQUFnQixZQUFZO0FBR3hDLFNBQUssVUFBVSxJQUFJLFFBQVEsS0FBSyxLQUFLLEtBQUssU0FBUztBQUVuRCxRQUFJO0FBQ0YsWUFBTSxVQUFVLE1BQU0sS0FBSyxRQUFRLGFBQWE7QUFFaEQsV0FBSyxTQUFTLFVBQVUsU0FBUyxVQUFVO0FBQUEsUUFDekMsS0FBSztBQUFBLFFBQ0wsTUFBTTtBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsT0FBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGLENBQUM7QUFHRCxXQUFLLE9BQU8sT0FBTyxLQUFLLE1BQU07QUFHOUIsV0FBSyxlQUFlLEtBQUssSUFBSSxVQUFVLEdBQUcsY0FBYyxNQUFNO0FBQzVELGFBQUssUUFBUSxlQUFlLEtBQUssU0FBUyxtQkFBbUI7QUFBQSxNQUMvRCxDQUFDO0FBQUEsSUFDSCxTQUFTLEdBQUc7QUFDVixjQUFRLE1BQU0sb0RBQWdDLENBQUM7QUFDL0MsZ0JBQVUsU0FBUyxPQUFPO0FBQUEsUUFDeEIsTUFBTSwyREFBYyxhQUFhLFFBQVEsRUFBRSxVQUFVLDBCQUFNO0FBQUEsUUFDM0QsS0FBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLFVBQXlCO0FBRTdCLFFBQUksS0FBSyxjQUFjO0FBQ3JCLFdBQUssSUFBSSxVQUFVLE9BQU8sS0FBSyxZQUFZO0FBQzNDLFdBQUssZUFBZTtBQUFBLElBQ3RCO0FBR0EsU0FBSyxRQUFRLE9BQU87QUFDcEIsU0FBSyxTQUFTO0FBR2QsU0FBSyxTQUFTLFFBQVE7QUFDdEIsU0FBSyxVQUFVO0FBRWYsUUFBSSxLQUFLLFFBQVE7QUFDZixXQUFLLE9BQU8sT0FBTztBQUNuQixXQUFLLFNBQVM7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsWUFBWSxNQUFvQjtBQUM5QixRQUFJLENBQUMsS0FBSyxRQUFRLGNBQWU7QUFDakMsU0FBSyxPQUFPLGNBQWM7QUFBQSxNQUN4QixFQUFFLE1BQU0sSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQUEsTUFDaEM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFjLG1CQUFtRTtBQUMvRSxVQUFNLFNBQWdELENBQUM7QUFDdkQsVUFBTSxVQUFVLEtBQUssSUFBSSxNQUFNO0FBRS9CLFFBQUk7QUFDRixZQUFNLGVBQWUsS0FBSyxTQUFTLGFBQWE7QUFDaEQsVUFBSTtBQUNKLFVBQUk7QUFDRix5QkFBaUIsTUFBTSxRQUFRLEtBQUssWUFBWSxHQUFHO0FBQUEsTUFDckQsUUFBUTtBQUNOLGVBQU87QUFBQSxNQUNUO0FBRUEsaUJBQVcsU0FBUyxlQUFlO0FBQ2pDLFlBQUksQ0FBQyxNQUFNLFNBQVMsS0FBSyxFQUFHO0FBQzVCLGNBQU0sV0FBVyxHQUFHLFlBQVksSUFBSSxLQUFLO0FBQ3pDLFlBQUk7QUFDRixnQkFBTSxPQUFlLE1BQU0sUUFBUSxLQUFLLFFBQVE7QUFDaEQsY0FBSSxDQUFDLEtBQUssU0FBUyxpQkFBaUIsR0FBRztBQUNyQyxvQkFBUSxLQUFLLGlEQUF3QixLQUFLLDBFQUE2QjtBQUN2RTtBQUFBLFVBQ0Y7QUFDQSxpQkFBTyxLQUFLLEVBQUUsTUFBTSxNQUFNLFFBQVEsU0FBUyxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBQUEsUUFDeEQsU0FBUyxLQUFjO0FBQ3JCLGtCQUFRLE1BQU0sNkRBQTBCLEtBQUssa0JBQVEsZUFBZSxRQUFRLElBQUksVUFBVSxPQUFPLEdBQUcsQ0FBQztBQUFBLFFBQ3ZHO0FBQUEsTUFDRjtBQUVBLFVBQUksT0FBTyxTQUFTLEdBQUc7QUFDckIsZ0JBQVEsTUFBTSwrQkFBcUIsT0FBTyxNQUFNLDBDQUFZLE9BQU8sSUFBSSxPQUFLLEVBQUUsSUFBSSxDQUFDO0FBQUEsTUFDckY7QUFBQSxJQUNGLFNBQVMsS0FBYztBQUNyQixjQUFRLE1BQU0sZ0ZBQThCLGVBQWUsUUFBUSxJQUFJLFVBQVUsT0FBTyxHQUFHLENBQUM7QUFBQSxJQUM5RjtBQUVBLFdBQU87QUFBQSxFQUNUO0FBQ0Y7OztBTy9LQSxJQUFBQyxtQkFBK0M7QUEwQ3hDLElBQU0sbUJBQXlDO0FBQUEsRUFDcEQsVUFBVTtBQUFBLEVBQ1Ysb0JBQW9CO0FBQUEsRUFDcEIsZUFBZTtBQUFBLEVBQ2YsV0FBVztBQUFBLEVBQ1gsV0FBVztBQUFBLEVBQ1gsWUFBWSxDQUFDO0FBQUEsRUFDYix1QkFBdUI7QUFBQSxFQUN2QixxQkFBcUI7QUFDdkI7QUFLTyxJQUFNLGlCQUFOLGNBQTZCLGtDQUFpQjtBQUFBLEVBR25ELFlBQVksS0FBVSxRQUE0QjtBQUNoRCxVQUFNLEtBQUssTUFBTTtBQUNqQixTQUFLLFNBQVM7QUFBQSxFQUNoQjtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxVQUFNLEVBQUUsWUFBWSxJQUFJO0FBQ3hCLGdCQUFZLE1BQU07QUFDbEIsZ0JBQVksU0FBUyx3QkFBd0I7QUFFN0MsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSwrQ0FBWSxFQUFFLFdBQVc7QUFHMUQsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSwwQkFBTSxFQUFFLFdBQVc7QUFHcEQsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsc0NBQVEsRUFDaEIsUUFBUSx1SUFBOEIsRUFDdEM7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsZUFBZSxFQUM5QixTQUFTLEtBQUssT0FBTyxTQUFTLFFBQVEsRUFDdEMsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsV0FBVyxTQUFTO0FBQ3pDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUdGLFFBQUkseUJBQVEsV0FBVyxFQUNwQixRQUFRLGdEQUFrQixFQUMxQixRQUFRLDJKQUF3QyxFQUNoRDtBQUFBLE1BQVUsQ0FBQyxXQUNWLE9BQ0csU0FBUyxLQUFLLE9BQU8sU0FBUyxrQkFBa0IsRUFDaEQsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMscUJBQXFCO0FBQzFDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUdGLFFBQUkseUJBQVEsV0FBVyxFQUFFLFFBQVEsMEJBQU0sRUFBRSxXQUFXO0FBRXBELFFBQUkseUJBQVEsV0FBVyxFQUNwQixRQUFRLDRDQUFTLEVBQ2pCLFFBQVEsK0tBQXdDLEVBQ2hEO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLHNDQUFRLEVBQ3ZCLFNBQVMsS0FBSyxPQUFPLFNBQVMsU0FBUyxFQUN2QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxZQUFZLFNBQVM7QUFDMUMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSxvQkFBSyxFQUFFLFdBQVc7QUFFbkQsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsc0NBQVEsRUFDaEIsUUFBUSxzUkFBcUQsRUFDN0Q7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsK0RBQWEsRUFDNUIsU0FBUyxLQUFLLE9BQU8sU0FBUyxTQUFTLEVBQ3ZDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLFlBQVksTUFBTSxLQUFLO0FBQzVDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUdGLFFBQUkseUJBQVEsV0FBVyxFQUFFLFFBQVEsMEJBQU0sRUFBRSxXQUFXO0FBRXBELFFBQUkseUJBQVEsV0FBVyxFQUNwQixRQUFRLGdEQUFrQixFQUMxQixRQUFRLHVWQUF1RyxFQUMvRztBQUFBLE1BQVUsQ0FBQyxXQUNWLE9BQ0csU0FBUyxLQUFLLE9BQU8sU0FBUyxtQkFBbUIsRUFDakQsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsc0JBQXNCO0FBQzNDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFDL0IsY0FBTSxRQUFRLGVBQWUsY0FBaUMsc0JBQXNCO0FBQ3BGLFlBQUksQ0FBQyxPQUFPLGNBQWU7QUFDM0IsWUFBSSxPQUFPO0FBRVQsZ0JBQU0sU0FBUyxpQkFBaUIsZUFBZSxJQUFJLEVBQ2hELGlCQUFpQixzQkFBc0IsRUFDdkMsS0FBSztBQUNSLGdCQUFNLE1BQU0sWUFBWSxTQUFTLE1BQU07QUFDdkMsZ0JBQU0sVUFBVSxpQkFBaUIsZUFBZSxJQUFJLEVBQ2pELGlCQUFpQix3QkFBd0IsRUFDekMsS0FBSztBQUNSLGdCQUFNLEtBQUssWUFBWSxlQUFlLE9BQU87QUFDN0MsZ0JBQU0sYUFBYSxpQkFBaUIsZUFBZSxJQUFJLEVBQ3BELGlCQUFpQixlQUFlLEVBQ2hDLEtBQUs7QUFDUixnQkFBTSxnQkFBZ0IsWUFBWSxlQUFlLFVBQVU7QUFDM0QsZ0JBQU0sWUFBWSxpQkFBaUIsZUFBZSxJQUFJLEVBQ25ELGlCQUFpQixjQUFjLEVBQy9CLEtBQUs7QUFDUixnQkFBTSxlQUFlLFlBQVksZUFBZSxTQUFTO0FBQ3pELGdCQUFNLFVBQW1HO0FBQUEsWUFDdkcsUUFBUSxlQUFlLEtBQUssVUFBVSxTQUFTLFlBQVk7QUFBQSxVQUM3RDtBQUNBLGNBQUksUUFBUSxLQUFNLFNBQVEsTUFBTTtBQUNoQyxjQUFJLE9BQU8sS0FBTSxTQUFRLEtBQUs7QUFDOUIsY0FBSSxrQkFBa0IsS0FBTSxTQUFRLGFBQWE7QUFDakQsY0FBSSxpQkFBaUIsS0FBTSxTQUFRLFlBQVk7QUFDL0MsZ0JBQU0sY0FBYyxZQUFZO0FBQUEsWUFDOUIsTUFBTTtBQUFBLFlBQ04sSUFBSSxjQUFjLEtBQUssSUFBSTtBQUFBLFlBQzNCO0FBQUEsVUFDRixHQUFHLEdBQUc7QUFBQSxRQUNSLE9BQU87QUFFTCxnQkFBTSxjQUFjLFlBQVk7QUFBQSxZQUM5QixNQUFNO0FBQUEsWUFDTixJQUFJLGNBQWMsS0FBSyxJQUFJO0FBQUEsWUFDM0IsU0FBUyxDQUFDO0FBQUEsVUFDWixHQUFHLEdBQUc7QUFBQSxRQUNSO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDTDtBQUVGLFFBQUkseUJBQVEsV0FBVyxFQUNwQixRQUFRLCtDQUFpQixFQUN6QixRQUFRLGtNQUFpRCxFQUN6RDtBQUFBLE1BQVUsQ0FBQyxXQUNWLE9BQ0csU0FBUyxLQUFLLE9BQU8sU0FBUyxxQkFBcUIsRUFDbkQsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsd0JBQXdCO0FBQzdDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFDL0IsWUFBSSxDQUFDLE9BQU87QUFDVixzQkFBWSxnQkFBZ0I7QUFBQSxRQUM5QjtBQUNBLGNBQU0sUUFBUSxlQUFlLGNBQWlDLHNCQUFzQjtBQUNwRixZQUFJLE9BQU8sZUFBZTtBQUN4QixnQkFBTSxjQUFjLFlBQVk7QUFBQSxZQUM5QixNQUFNO0FBQUEsWUFDTixJQUFJLGNBQWMsS0FBSyxJQUFJO0FBQUEsWUFDM0IsU0FBUyxFQUFFLFNBQVMsTUFBTTtBQUFBLFVBQzVCLEdBQUcsR0FBRztBQUFBLFFBQ1I7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSxjQUFJLEVBQUUsV0FBVztBQUdsRCxVQUFNLFlBQVksWUFBWSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsQ0FBQztBQUNwRSxjQUFVLFNBQVMsS0FBSyxFQUFFLE1BQU0sNEJBQVEsS0FBSyxxQkFBcUIsQ0FBQztBQUNuRSxjQUFVLFNBQVMsS0FBSztBQUFBLE1BQ3RCLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFHRCxVQUFNLFlBQVksWUFBWSxVQUFVLEVBQUUsS0FBSyx3Q0FBd0MsQ0FBQztBQUN4RixVQUFNLFlBQVksVUFBVSxVQUFVLEVBQUUsS0FBSywwQkFBMEIsQ0FBQztBQUN4RSxVQUFNLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxzQkFBc0IsQ0FBQztBQUdqRSxVQUFNLFlBQVk7QUFDaEIsVUFBSTtBQUNGLGNBQU0sWUFBWSxLQUFLLE9BQU8sU0FBUyxPQUFPO0FBQzlDLGNBQU0sVUFBVSxLQUFLLElBQUksTUFBTTtBQUMvQixjQUFNLGFBQWE7QUFBQSxVQUNqQixHQUFHLFNBQVM7QUFBQSxVQUNaLEdBQUcsU0FBUztBQUFBLFFBQ2Q7QUFDQSxtQkFBVyxjQUFjLFlBQVk7QUFDbkMsZ0JBQU0sU0FBUyxNQUFNLFFBQVEsT0FBTyxVQUFVO0FBQzlDLGNBQUksQ0FBQyxPQUFRO0FBQ2IsZ0JBQU0sYUFBYSxNQUFNLFFBQVEsV0FBVyxVQUFVO0FBQ3RELGdCQUFNLE1BQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxTQUFTLFFBQVE7QUFDckQsaUJBQU8sYUFBYTtBQUFBLFlBQ2xCLGlCQUFpQiw4QkFBOEIsR0FBRztBQUFBLFVBQ3BELENBQUM7QUFDRDtBQUFBLFFBQ0Y7QUFBQSxNQUNGLFFBQVE7QUFBQSxNQUFrRDtBQUFBLElBQzVELEdBQUc7QUFHSCxVQUFNLGFBQWEsVUFBVSxVQUFVLEVBQUUsS0FBSywyQkFBMkIsQ0FBQztBQUMxRSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0sc0JBQU8sS0FBSywyQkFBMkIsQ0FBQztBQUN6RSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0sd0NBQVUsS0FBSywyQkFBMkIsQ0FBQztBQUc1RSxjQUFVLFNBQVMsS0FBSyxFQUFFLE1BQU0scUNBQWlCLEtBQUssMkJBQTJCLENBQUM7QUFDbEYsVUFBTSxXQUFXLFVBQVUsVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFFdEU7QUFBQSxNQUFDLEVBQUUsTUFBTSw0QkFBUSxLQUFLLHNEQUFzRDtBQUFBLE1BQzNFLEVBQUUsTUFBTSxrQ0FBUyxLQUFLLDBEQUEwRDtBQUFBLElBQUMsRUFBRSxRQUFRLFVBQVE7QUFDbEcsWUFBTSxNQUFNLFNBQVMsU0FBUyxRQUFRLEVBQUUsTUFBTSxLQUFLLE1BQU0sS0FBSyxtQkFBbUIsQ0FBQztBQUNsRixVQUFJLEtBQUssS0FBSztBQUNaLFlBQUksYUFBYSxFQUFFLFFBQVEsVUFBVSxDQUFDO0FBQ3RDLFlBQUksaUJBQWlCLFNBQVMsTUFBTTtBQUNsQyxpQkFBTyxLQUFLLEtBQUssS0FBSyxRQUFRO0FBQUEsUUFDaEMsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGLENBQUM7QUFHRCxVQUFNLGFBQWEsWUFBWSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsQ0FBQztBQUNyRSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0sNEJBQVEsS0FBSyxxQkFBcUIsQ0FBQztBQUNwRSxlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0seUNBQTBCLEtBQUssb0JBQW9CLENBQUM7QUFDckYsZUFBVyxTQUFTLEtBQUssRUFBRSxNQUFNLDZCQUFjLEtBQUssb0JBQW9CLENBQUM7QUFBQSxFQUMzRTtBQUNGOzs7QVJqUUEsSUFBcUIscUJBQXJCLGNBQWdELHdCQUFPO0FBQUEsRUFBdkQ7QUFBQTtBQUNFLG9CQUFpQztBQUFBO0FBQUEsRUFFakMsTUFBTSxTQUF3QjtBQUU1QixVQUFNLEtBQUssYUFBYTtBQUV4QixVQUFNLFlBQVksS0FBSyxTQUFTLE9BQU87QUFHdkMsU0FBSyxhQUFhLHdCQUF3QixDQUFDLFNBQXdCO0FBQ2pFLGFBQU8sSUFBSSxnQkFBZ0IsTUFBTSxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxhQUFhLENBQUM7QUFBQSxJQUM1RixDQUFDO0FBR0QsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhO0FBQUEsSUFDcEMsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLEtBQUssYUFBYSxhQUFhO0FBQUEsSUFDakQsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLEtBQUssYUFBYSxhQUFhO0FBQUEsSUFDakQsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLEtBQUssYUFBYSxXQUFXO0FBQUEsSUFDL0MsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLEtBQUssYUFBYSxrQkFBa0I7QUFBQSxJQUN0RCxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhLHFCQUFxQjtBQUFBLElBQ3pELENBQUM7QUFHRCxTQUFLLGNBQWMsSUFBSSxlQUFlLEtBQUssS0FBSyxJQUFJLENBQUM7QUFHckQsU0FBSyxjQUFjLFFBQVEsa0NBQVMsTUFBTTtBQUN4QyxXQUFLLEtBQUssYUFBYTtBQUFBLElBQ3pCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxXQUFpQjtBQUNmLGdCQUFZLGdCQUFnQjtBQUFBLEVBQzlCO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxFQUFFLFVBQVUsSUFBSSxLQUFLO0FBRTNCLFFBQUksT0FBNkI7QUFDakMsVUFBTSxTQUFTLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUUvRCxRQUFJLE9BQU8sU0FBUyxHQUFHO0FBRXJCLGFBQU8sT0FBTyxDQUFDO0FBQUEsSUFDakIsT0FBTztBQUVMLGFBQU8sVUFBVSxRQUFRLEtBQUs7QUFDOUIsWUFBTSxLQUFLLGFBQWE7QUFBQSxRQUN0QixNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVixDQUFDO0FBQUEsSUFDSDtBQUVBLFFBQUksTUFBTTtBQUNSLFlBQU0sVUFBVSxXQUFXLElBQUk7QUFBQSxJQUNqQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR1EsYUFBYSxNQUFvQjtBQUN2QyxVQUFNLFNBQVMsS0FBSyxJQUFJLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUN4RSxRQUFJLE9BQU8sV0FBVyxFQUFHO0FBRXpCLFVBQU0sT0FBTyxPQUFPLENBQUMsRUFBRTtBQUN2QixTQUFLLFlBQVksSUFBSTtBQUFBLEVBQ3ZCO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxFQUMzRTtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
