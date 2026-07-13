"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
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

  // assets/scripts/state/defaultData.js
  var require_defaultData = __commonJS({
    "assets/scripts/state/defaultData.js"() {
      "use strict";
      (function() {
        "use strict";
        var DATA_VERSION2 = "3.0";
        var _today = /* @__PURE__ */ new Date();
        var _startOfMonth = new Date(_today.getFullYear(), _today.getMonth(), 1);
        var _endOfMonth = new Date(_today.getFullYear(), _today.getMonth() + 1, 0);
        var _startDateStr = _startOfMonth.getFullYear() + "-" + String(_startOfMonth.getMonth() + 1).padStart(2, "0") + "-" + String(_startOfMonth.getDate()).padStart(2, "0");
        var _endDateStr = _endOfMonth.getFullYear() + "-" + String(_endOfMonth.getMonth() + 1).padStart(2, "0") + "-" + String(_endOfMonth.getDate()).padStart(2, "0");
        var todayKey = formatDate(/* @__PURE__ */ new Date());
        var DEFAULT_DATA2 = {};
        DEFAULT_DATA2[todayKey] = {
          date: todayKey,
          weekday: getChineseWeekday(/* @__PURE__ */ new Date()),
          metrics: {
            firstCheckIn: "08:30",
            completedTasks: "8/12",
            inspirationCount: "3",
            lastCheckIn: "18:30",
            activeTime: "8h",
            emptySlots: "2"
          },
          timeline: [
            { period: "lateNight", name: "\u51CC\u6668", time: "00:00 - 04:00", icon: "moon", eval: "good", items: [] },
            { period: "dawn", name: "\u9ECE\u660E", time: "04:00 - 05:30", icon: "sunrise", eval: "good", items: [] },
            {
              period: "earlyMorning",
              name: "\u6E05\u6668",
              time: "05:30 - 07:00",
              icon: "sun",
              eval: "good",
              items: [{ time: "06:00", task: "\u65E9\u8D77\u51A5\u60F3", eval: "\u8EAB\u5FC3\u8212\u7545" }]
            },
            {
              period: "morning",
              name: "\u4E0A\u5348",
              time: "07:00 - 12:00",
              icon: "briefcase",
              eval: "good",
              items: [
                { time: "07:00", task: "\u9605\u8BFB30\u5206\u949F", eval: "\u6536\u83B7\u9887\u4E30" },
                { time: "08:00", task: "\u65E9\u9910", eval: "\u8425\u517B\u5747\u8861" },
                { time: "09:30", task: "\u5B8C\u6210\u9879\u76EE\u65B9\u6848", eval: "\u6548\u7387\u5F88\u9AD8" },
                { time: "10:30", task: "\u56E2\u961F\u4F1A\u8BAE", eval: "\u8FDB\u5C55\u987A\u5229" },
                { time: "11:30", task: "\u4EE3\u7801review", eval: "\u7EC6\u81F4\u8BA4\u771F" }
              ]
            },
            {
              period: "midday",
              name: "\u4E2D\u5348",
              time: "12:00 - 13:00",
              icon: "utensils",
              eval: "good",
              items: [{ time: "12:30", task: "\u5348\u9910", eval: "\u9002\u91CF" }]
            },
            {
              period: "afternoon",
              name: "\u4E0B\u5348",
              time: "13:00 - 17:00",
              icon: "sun",
              eval: "warn",
              items: [
                { time: "13:30", task: "\u529F\u80FD\u5F00\u53D1", eval: "\u9047\u5230\u5C0F\u6311\u6218" },
                { time: "15:00", task: "\u4F11\u606F\u6563\u6B65", eval: "\u6062\u590D\u7CBE\u529B" },
                { time: "16:00", task: "\u7EE7\u7EED\u5F00\u53D1", eval: "\u9010\u6B65\u63A8\u8FDB" }
              ]
            },
            { period: "dusk", name: "\u508D\u665A", time: "17:00 - 18:30", icon: "sunset", eval: "good", items: [] },
            {
              period: "evening",
              name: "\u665A\u4E0A",
              time: "18:30 - 22:00",
              icon: "coffee",
              eval: "good",
              items: [
                { time: "18:30", task: "\u665A\u9910", eval: "\u5065\u5EB7\u996E\u98DF" },
                { time: "19:30", task: "\u8FD0\u52A8\u5065\u8EAB", eval: "\u575A\u6301\u8FD0\u52A8" },
                { time: "21:00", task: "\u590D\u76D8\u603B\u7ED3", eval: "\u56DE\u987E\u4E00\u5929" }
              ]
            },
            { period: "night", name: "\u6DF1\u591C", time: "22:00 - 24:00", icon: "moon", eval: "good", items: [] }
          ],
          goals: [
            {
              id: "goal_default_1",
              icon: "target",
              title: "\u9879\u76EE\u63A8\u8FDB",
              meta: "Q2\u6838\u5FC3\u76EE\u6807",
              category: "work",
              startDate: _startDateStr,
              endDate: _endDateStr,
              items: [
                { name: "\u65B9\u6848\u8BBE\u8BA1", detail: "\u5DF2\u5B8C\u6210", percent: 100, startDate: _startDateStr, endDate: _endDateStr, startValue: "0", targetValue: "100", currentValue: "100", dailyMin: "5", taskDayType: "daily" },
                { name: "\u5F00\u53D1\u5B9E\u73B0", detail: "\u8FDB\u884C\u4E2D", percent: 60, startDate: _startDateStr, endDate: _endDateStr, startValue: "0", targetValue: "100", currentValue: "60", dailyMin: "2", taskDayType: "daily" },
                { name: "\u6D4B\u8BD5\u4E0A\u7EBF", detail: "\u672A\u5F00\u59CB", percent: 0, startDate: _startDateStr, endDate: _endDateStr, startValue: "0", targetValue: "100", currentValue: "0", dailyMin: "3", taskDayType: "daily" }
              ]
            },
            {
              id: "goal_default_2",
              icon: "bookOpen",
              title: "\u6280\u80FD\u63D0\u5347",
              meta: "\u6301\u7EED\u5B66\u4E60",
              category: "study",
              startDate: _startDateStr,
              endDate: _endDateStr,
              items: [
                { name: "\u9605\u8BFB", detail: "\u8FDB\u884C\u4E2D", percent: 80, startDate: _startDateStr, endDate: _endDateStr, startValue: "0", targetValue: "100", currentValue: "80", dailyMin: "1", taskDayType: "daily" },
                { name: "\u7EC3\u4E60", detail: "\u8FDB\u884C\u4E2D", percent: 40, startDate: _startDateStr, endDate: _endDateStr, startValue: "0", targetValue: "100", currentValue: "40", dailyMin: "30", taskDayType: "daily" },
                { name: "\u603B\u7ED3", detail: "\u672A\u5F00\u59CB", percent: 20, startDate: _startDateStr, endDate: _endDateStr, startValue: "0", targetValue: "100", currentValue: "20", dailyMin: "1", taskDayType: "daily" }
              ]
            }
          ]
        };
        function createEmptyDayData2(dateKey) {
          if (!dateKey || typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            console.warn("[Bamboo] createEmptyDayData: invalid dateKey:", dateKey);
            dateKey = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          }
          var date = /* @__PURE__ */ new Date(dateKey + "T00:00:00");
          var metrics = {
            firstCheckIn: "--:--",
            completedTasks: "0/0",
            inspirationCount: "0",
            lastCheckIn: "--:--",
            activeTime: "0h",
            emptySlots: "0"
          };
          return {
            date: dateKey,
            weekday: ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"][date.getDay()],
            metrics,
            timeline: []
          };
        }
        window.DATA_VERSION = DATA_VERSION2;
        window.DEFAULT_DATA = DEFAULT_DATA2;
        window.createEmptyDayData = createEmptyDayData2;
      })();
    }
  });

  // assets/scripts/utils/shadowBootstrap.js
  var shadowBootstrap_exports = {};
  __export(shadowBootstrap_exports, {
    initShadow: () => initShadow
  });
  function initShadow() {
    if (typeof window === "undefined") return null;
    if (window.__bambooShadowRoot) return window.__bambooShadowRoot;
    const noShadow = window.__BAMBOO_NO_SHADOW__ || typeof document.body.attachShadow !== "function";
    if (noShadow) {
      window.__bambooShadowRoot = null;
      return null;
    }
    const body = document.body;
    const docEl = document.documentElement;
    const reset = document.createElement("style");
    reset.id = "bamboo-light-reset";
    reset.textContent = [
      "html,body{margin:0;padding:0;overflow:hidden;}",
      // 打印时还原 host 为常规流，避免 fixed/overflow 截断整页内容
      "@media print{",
      "  html,body{overflow:visible !important;}",
      "  #bamboo-shadow-host{position:static !important;inset:auto !important;width:auto !important;height:auto !important;overflow:visible !important;}",
      "}"
    ].join("\n");
    document.head.appendChild(reset);
    const host = document.createElement("div");
    host.id = "bamboo-shadow-host";
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.left = "0";
    host.style.right = "0";
    host.style.bottom = "0";
    host.style.margin = "0";
    host.style.padding = "0";
    host.style.overflowX = "hidden";
    host.style.overflowY = "auto";
    body.appendChild(host);
    const sr = host.attachShadow({ mode: "open" });
    window.__bambooShadowRoot = sr;
    const links = Array.from(
      document.querySelectorAll('head link[rel="stylesheet"]')
    );
    links.forEach((link) => sr.appendChild(link.cloneNode(true)));
    links.forEach((link) => link.remove());
    const styles = Array.from(
      document.querySelectorAll("head style:not(#bamboo-light-reset)")
    );
    styles.forEach((style) => sr.appendChild(style.cloneNode(true)));
    styles.forEach((style) => style.remove());
    const moveNodes = Array.from(body.children).filter(
      (node) => node !== host && node.tagName !== "SCRIPT"
    );
    moveNodes.forEach((node) => sr.appendChild(node));
    const mirror = () => {
      const raw = (body.className + " " + docEl.className).trim().split(/\s+/).filter(Boolean);
      const set = new Set(raw);
      if (set.has("dark") || set.has("theme-dark")) {
        set.add("dark");
        set.add("theme-dark");
      }
      if (set.has("theme-light")) set.add("theme-light");
      host.className = "bamboo-shadow-host " + [...set].join(" ");
    };
    mirror();
    if (typeof MutationObserver === "function") {
      new MutationObserver(mirror).observe(body, {
        attributes: true,
        attributeFilter: ["class"]
      });
      new MutationObserver(mirror).observe(docEl, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
    return sr;
  }
  initShadow();

  // assets/scripts/utils/constants.js
  var constants_exports = {};
  __export(constants_exports, {
    CONSTANTS: () => CONSTANTS
  });
  var CONSTANTS = {
    STORAGE: {
      UNDO_STACK_MAX: 50
    }
  };

  // assets/scripts/utils/storageAdapter.js
  var storageAdapter_exports = {};
  __export(storageAdapter_exports, {
    StorageKeys: () => StorageKeys2
  });
  var StorageKeys2 = {
    SECTION_CONFIG: "section_config",
    ENABLE_SWIPE: "enableSwipe",
    WHITENOISE_TYPE: "whitenoise_type",
    THEME_SETTINGS: "bamboo_theme_settings",
    WHITENOISE_TIMER: "whitenoise_timer",
    WHITENOISE_CUSTOM: "whitenoise_custom",
    WHITENOISE_PLAYING: "whitenoise_playing",
    DAILY_REVIEW_DATA: "dailyReviewData",
    THEME: "theme",
    FAB_POSITION: "fab_position",
    ARCHIVE_FILTER: "bamboo-archive-filter",
    AUTO_SAVE_INTERVAL: "autoSaveInterval",
    WEATHER_CITY: "weather-city",
    AUTO_BACKUPS: "autoBackups",
    WEATHER_ENABLED: "weatherEnabled",
    WEATHER_EXPANDED: "weatherExpanded",
    QUOTE_SOURCE: "quoteSource",
    QUOTE_ENABLED: "quoteEnabled",
    CUSTOM_TEMPLATES: "bamboo_custom_templates"
  };
  var StorageAdapter2 = {
    get(key, fallback = null) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? val : fallback;
      } catch (e) {
        return fallback;
      }
    },
    getJSON(key, fallback = null) {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
      }
    },
    setJSON(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
      }
    }
  };
  window.StorageAdapter = StorageAdapter2;
  window.StorageKeys = StorageKeys2;

  // assets/scripts/utils/lucideUtils.js
  var lucideUtils_exports = {};
  __export(lucideUtils_exports, {
    LucideUtils: () => LucideUtils2
  });
  var LucideUtils2 = {
    SPEC: {
      STROKE_WIDTH: 2,
      STROKE_WIDTH_LIGHT: 1.5,
      LINECAP: "round",
      LINEJOIN: "round",
      FILL: "none",
      SIZES: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, hero: 32, empty: 48 },
      COLOR: "currentColor"
    },
    _svg(name, paths, size, strokeWidth) {
      const sw = strokeWidth || this.SPEC.STROKE_WIDTH;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${this.SPEC.FILL}" stroke="${this.SPEC.COLOR}" stroke-width="${sw}" stroke-linecap="${this.SPEC.LINECAP}" stroke-linejoin="${this.SPEC.LINEJOIN}" class="icon icon-${name}" aria-hidden="true">${paths}</svg>`;
    },
    ICONS: {
      plus: (s, sw) => LucideUtils2._svg("plus", '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', s, sw),
      plusCircle: (s, sw) => LucideUtils2._svg("plus-circle", '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>', s, sw),
      x: (s, sw) => LucideUtils2._svg("x", '<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>', s, sw),
      check: (s, sw) => LucideUtils2._svg("check", '<polyline points="20 6 9 17 4 12"/>', s, sw),
      checkCircle: (s, sw) => LucideUtils2._svg("check-circle", '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', s, sw),
      alertTriangle: (s, sw) => LucideUtils2._svg("alert-triangle", '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>', s, sw),
      info: (s, sw) => LucideUtils2._svg("info", '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>', s, sw),
      edit: (s, sw) => LucideUtils2._svg("edit", '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>', s, sw),
      trash: (s, sw) => LucideUtils2._svg("trash", '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>', s, sw),
      archive: (s, sw) => LucideUtils2._svg("archive", '<rect x="2" y="4" width="20" height="5" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>', s, sw),
      refreshCw: (s, sw) => LucideUtils2._svg("refresh-cw", '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>', s, sw),
      settings: (s, sw) => LucideUtils2._svg("settings", '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>', s, sw),
      palette: (s, sw) => LucideUtils2._svg("palette", '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>', s, sw),
      search: (s, sw) => LucideUtils2._svg("search", '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', s, sw),
      calendar: (s, sw) => LucideUtils2._svg("calendar", '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>', s, sw),
      moon: (s, sw) => LucideUtils2._svg("moon", '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', s, sw),
      sun: (s, sw) => LucideUtils2._svg("sun", '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', s, sw),
      briefcase: (s, sw) => LucideUtils2._svg("briefcase", '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>', s, sw),
      map: (s, sw) => LucideUtils2._svg("map", '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>', s, sw),
      target: (s, sw) => LucideUtils2._svg("target", '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', s, sw),
      barChart: (s, sw) => LucideUtils2._svg("bar-chart", '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>', s, sw),
      messageCircle: (s, sw) => LucideUtils2._svg("message-circle", '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>', s, sw),
      leaf: (s, sw) => LucideUtils2._svg("leaf", '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>', s, sw),
      treePine: (s, sw) => LucideUtils2._svg("tree-pine", '<path d="m12 22 7-10H5l7 10z"/><path d="M9 12l3-4 3 4"/><path d="M12 22V10"/>', s, sw),
      clock: (s, sw) => LucideUtils2._svg("clock", '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', s, sw),
      star: (s, sw) => LucideUtils2._svg("star", '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', s, sw),
      bookClosed: (s, sw) => LucideUtils2._svg("book-closed", '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>', s, sw),
      bookOpen: (s, sw) => LucideUtils2._svg("book-open", '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>', s, sw),
      dollarSign: (s, sw) => LucideUtils2._svg("dollar-sign", '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', s, sw),
      trophy: (s, sw) => LucideUtils2._svg("trophy", '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>', s, sw),
      sparkles: (s, sw) => LucideUtils2._svg("sparkles", '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>', s, sw),
      bot: (s, sw) => LucideUtils2._svg("bot", '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>', s, sw),
      list: (s, sw) => LucideUtils2._svg("list", '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>', s, sw),
      handshake: (s, sw) => LucideUtils2._svg("handshake", '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h2"/>', s, sw),
      cloud: (s, sw) => LucideUtils2._svg("cloud", '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>', s, sw),
      monitor: (s, sw) => LucideUtils2._svg("monitor", '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>', s, sw),
      bell: (s, sw) => LucideUtils2._svg("bell", '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', s, sw),
      penTool: (s, sw) => LucideUtils2._svg("pen-tool", '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>', s, sw),
      lightbulb: (s, sw) => LucideUtils2._svg("lightbulb", '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>', s, sw),
      dumbbell: (s, sw) => LucideUtils2._svg("dumbbell", '<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>', s, sw),
      rocket: (s, sw) => LucideUtils2._svg("rocket", '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>', s, sw),
      fileText: (s, sw) => LucideUtils2._svg("file-text", '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>', s, sw),
      trendingUp: (s, sw) => LucideUtils2._svg("trending-up", '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>', s, sw),
      waves: (s, sw) => LucideUtils2._svg("waves", '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>', s, sw),
      mountain: (s, sw) => LucideUtils2._svg("mountain", '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>', s, sw),
      flower: (s, sw) => LucideUtils2._svg("flower", '<circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>', s, sw),
      cloudRain: (s, sw) => LucideUtils2._svg("cloud-rain", '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m4 18 2 2"/><path d="m10 18 2 2"/><path d="m16 18 2 2"/>', s, sw),
      coffee: (s, sw) => LucideUtils2._svg("coffee", '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>', s, sw),
      music: (s, sw) => LucideUtils2._svg("music", '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', s, sw),
      partyPopper: (s, sw) => LucideUtils2._svg("party-popper", '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/>', s, sw),
      circle: (s, sw) => LucideUtils2._svg("circle", '<circle cx="12" cy="12" r="10"/>', s, sw),
      keyboard: (s, sw) => LucideUtils2._svg("keyboard", '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/>', s, sw),
      volume: (s, sw) => LucideUtils2._svg("volume", '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>', s, sw),
      chevronDown: (s, sw) => LucideUtils2._svg("chevron-down", '<path d="m6 9 6 6 6-6"/>', s, sw),
      chevronUp: (s, sw) => LucideUtils2._svg("chevron-up", '<path d="m18 15-6-6-6 6"/>', s, sw),
      chevronLeft: (s, sw) => LucideUtils2._svg("chevron-left", '<path d="m15 18-6-6 6-6"/>', s, sw),
      chevronRight: (s, sw) => LucideUtils2._svg("chevron-right", '<path d="m9 18 6-6-6-6"/>', s, sw),
      download: (s, sw) => LucideUtils2._svg("download", '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>', s, sw),
      upload: (s, sw) => LucideUtils2._svg("upload", '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>', s, sw),
      pin: (s, sw) => LucideUtils2._svg("pin", '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>', s, sw),
      pause: (s, sw) => LucideUtils2._svg("pause", '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>', s, sw),
      link: (s, sw) => LucideUtils2._svg("link", '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>', s, sw),
      shield: (s, sw) => LucideUtils2._svg("shield", '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', s, sw),
      slidersHorizontal: (s, sw) => LucideUtils2._svg("sliders-horizontal", '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>', s, sw),
      eye: (s, sw) => LucideUtils2._svg("eye", '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>', s, sw),
      eyeOff: (s, sw) => LucideUtils2._svg("eye-off", '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>', s, sw),
      bookmark: (s, sw) => LucideUtils2._svg("bookmark", '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>', s, sw),
      gripVertical: (s, sw) => LucideUtils2._svg("grip-vertical", '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>', s, sw),
      ticket: (s, sw) => LucideUtils2._svg("ticket", '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>', s, sw),
      code: (s, sw) => LucideUtils2._svg("code", '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', s, sw),
      arrowUpFromLine: (s, sw) => LucideUtils2._svg("arrow-up-from-line", '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/><path d="M5 19h14"/>', s, sw),
      xCircle: (s, sw) => LucideUtils2._svg("x-circle", '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>', s, sw),
      layoutGrid: (s, sw) => LucideUtils2._svg("layout-grid", '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>', s, sw),
      rotateCcw: (s, sw) => LucideUtils2._svg("rotate-ccw", '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>', s, sw),
      flame: (s, sw) => LucideUtils2._svg("flame", '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-1.12-2.5-2.5-2.5S6 10.62 6 12a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 2c0 4-4 6-4 10a4 4 0 1 0 8 0c0-4-4-6-4-10z"/>', s, sw),
      filePlus: (s, sw) => LucideUtils2._svg("file-plus", '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>', s, sw)
    },
    emojiMap: {
      "\u{1F38B}": "treePine",
      "\u{1F3C6}": "trophy",
      "\u{1F4C6}": "calendar",
      "\u2728": "sparkles",
      "\u{1F916}": "bot",
      "\u{1F4CA}": "barChart",
      "\u{1F3A8}": "palette",
      "\u{1F319}": "moon",
      "\u{1F4CB}": "list",
      "\u{1F91D}": "handshake",
      "\u2601\uFE0F": "cloud",
      "\u{1F5A5}\uFE0F": "monitor",
      "\u{1F514}": "bell",
      "\u{1F5FA}\uFE0F": "map",
      "\u{1F3AF}": "target",
      "\u{1F4DD}": "penTool",
      "\u270E": "edit",
      "\u26A0\uFE0F": "alertTriangle",
      "\u274C": "x",
      "\u2705": "check",
      "\u{1F4A1}": "lightbulb",
      "\u{1F4AA}": "dumbbell",
      "\u{1F680}": "rocket",
      "\u{1F4C5}": "calendar",
      "\u{1F4DC}": "fileText",
      "\u{1F4C8}": "trendingUp",
      "\u{1F504}": "refreshCw",
      "\u2B50": "star",
      "\u2139\uFE0F": "info",
      "\u{1F3AA}": "ticket",
      "\u{1F33F}": "leaf",
      "\u{1F30A}": "waves",
      "\u{1F3D4}\uFE0F": "mountain",
      "\u{1F338}": "flower",
      "\u2614": "cloudRain",
      "\u{1F375}": "coffee",
      "\u{1F3B5}": "music",
      "\u{1F389}": "partyPopper",
      "\u{1F4CC}": "pin",
      "\u{1F4BC}": "briefcase",
      "\u2600\uFE0F": "sun",
      "\u{1F5D1}\uFE0F": "trash",
      "\u270F\uFE0F": "edit",
      "\u{1F534}": "circle",
      "\u{1F7E1}": "circle",
      "\u{1F7E2}": "circle",
      "\u{1F4E6}": "archive"
    },
    getIconName(emoji) {
      return this.emojiMap[emoji] || "circle";
    },
    _iconCache: /* @__PURE__ */ new Map(),
    _CACHE_MAX: 500,
    createIcon(name, options = {}) {
      const { size = 20, strokeWidth, className = "" } = options;
      const resolvedSize = typeof size === "string" ? this.SPEC.SIZES[size] || 20 : size;
      const cacheKey = name + ":" + resolvedSize + ":" + (strokeWidth || "") + ":" + className;
      const cached = this._iconCache.get(cacheKey);
      if (cached !== void 0) return cached;
      const iconFn = this.ICONS[name];
      if (!iconFn) return this.ICONS.circle(resolvedSize, strokeWidth);
      let svg = iconFn(resolvedSize, strokeWidth);
      if (className) {
        svg = svg.replace('class="icon icon-' + name + '"', 'class="icon icon-' + name + " " + className + '"');
      }
      if (this._iconCache.size >= this._CACHE_MAX) {
        const firstKey = this._iconCache.keys().next().value;
        this._iconCache.delete(firstKey);
      }
      this._iconCache.set(cacheKey, svg);
      return svg;
    },
    icon(name, size, strokeWidth) {
      return this.createIcon(name, { size: size || 20, strokeWidth });
    },
    replaceEmojiWithIcon(emoji, options = {}) {
      const iconName = this.getIconName(emoji);
      return this.createIcon(iconName, options);
    },
    renderIconForData(iconValue, options = {}) {
      if (!iconValue) return this.createIcon("circle", options);
      if (iconValue.startsWith("<svg")) return iconValue;
      if (this.emojiMap[iconValue]) return this.createIcon(this.emojiMap[iconValue], options);
      if (this.ICONS[iconValue]) return this.createIcon(iconValue, options);
      return this.createIcon("circle", options);
    }
  };
  window.LucideUtils = LucideUtils2;

  // assets/scripts/utils/helpers.js
  var helpers_exports = {};
  __export(helpers_exports, {
    $: () => $2,
    calculateCheckInTimes: () => calculateCheckInTimes2,
    createElement: () => createElement,
    debounce: () => debounce,
    formatDate: () => formatDate2,
    getChineseDateDisplay: () => getChineseDateDisplay2,
    getChineseWeekday: () => getChineseWeekday2,
    parseTime: () => parseTime2,
    scrollToSection: () => scrollToSection2,
    throttle: () => throttle
  });

  // assets/scripts/utils/domRef.js
  function getShadowRoot() {
    return typeof window !== "undefined" && window.__bambooShadowRoot || null;
  }
  function getDomRoot() {
    return getShadowRoot() || document;
  }
  function byId(id) {
    return getDomRoot().getElementById(id);
  }
  function $(selector, ctx) {
    return (ctx || getDomRoot()).querySelector(selector);
  }
  function $$(selector, ctx) {
    return (ctx || getDomRoot()).querySelectorAll(selector);
  }
  function getHost() {
    return typeof document !== "undefined" && document.getElementById("bamboo-shadow-host") || null;
  }
  function getRootMount() {
    const root = getDomRoot();
    return root === document ? document.body : root;
  }
  function modalMount() {
    return byId("modalContainer") || getRootMount();
  }
  function getStyleMount() {
    return getShadowRoot() || document.head;
  }
  function setGlobalCssVar(name, value) {
    const host = getHost();
    if (host) host.style.setProperty(name, value);
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.style.setProperty(name, value);
    }
  }
  function getCssVarRoot() {
    const host = getHost();
    if (host) {
      return {
        style: {
          setProperty: (name, value) => setGlobalCssVar(name, value)
        }
      };
    }
    return document.documentElement;
  }
  function getGlobalComputedStyle() {
    const host = getHost();
    return getComputedStyle(host || document.documentElement);
  }
  function eventInTargets2(e, node) {
    if (!node) return false;
    const path = e && typeof e.composedPath === "function" ? e.composedPath() : [];
    if (path.length) return path.includes(node);
    return !!(e && e.target && node.contains && node.contains(e.target));
  }

  // assets/scripts/utils/helpers.js
  var scrollToSection2 = (id) => {
    const el = byId(id);
    if (!el || !el.isConnected) return;
    let rect;
    try {
      rect = el.getBoundingClientRect();
    } catch (e) {
      return;
    }
    if (!rect || rect.width === 0 && rect.height === 0) return;
    const headerOffset = 100;
    const elementPosition = rect.top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };
  var formatDate2 = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  var getChineseDateDisplay2 = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}\u5E74${month}\u6708${day}\u65E5`;
  };
  var getChineseWeekday2 = (date) => {
    const weekdays = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
    return weekdays[date.getDay()];
  };
  var debounce = (fn, delay = 300, immediate = false) => {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      if (immediate && !timer) {
        fn(...args);
      }
      timer = setTimeout(() => {
        if (!immediate) fn(...args);
        timer = null;
      }, delay);
    };
  };
  var throttle = (fn, delay = 300, options = {}) => {
    let last = 0;
    let timer = null;
    const { leading = true, trailing = true } = options;
    return (...args) => {
      const now = Date.now();
      if (!last && !leading) last = now;
      if (now - last >= delay) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        fn(...args);
        last = now;
      } else if (!timer && trailing) {
        timer = setTimeout(() => {
          last = leading ? Date.now() : 0;
          timer = null;
          fn(...args);
        }, delay - (now - last));
      }
    };
  };
  var createElement = (tag, className, innerHTML) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  };
  var $2 = (selector) => $(selector);
  var parseTime2 = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    return { hour: parseInt(match[1]), minute: parseInt(match[2]) };
  };
  var calculateCheckInTimes2 = (timeline) => {
    if (!timeline || !Array.isArray(timeline)) {
      return { firstCheckIn: "--:--", lastCheckIn: "--:--" };
    }
    const allTimes = [];
    timeline.forEach((period) => {
      if (period.items && Array.isArray(period.items)) {
        period.items.forEach((item) => {
          const parsed = parseTime2(item.time);
          if (parsed) allTimes.push(parsed);
        });
      }
    });
    if (allTimes.length === 0) {
      return { firstCheckIn: "--:--", lastCheckIn: "--:--" };
    }
    allTimes.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    const formatTime = (t) => `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
    return {
      firstCheckIn: formatTime(allTimes[0]),
      lastCheckIn: formatTime(allTimes[allTimes.length - 1])
    };
  };
  window.scrollToSection = scrollToSection2;
  window.formatDate = formatDate2;
  window.getChineseDateDisplay = getChineseDateDisplay2;
  window.getChineseWeekday = getChineseWeekday2;
  window.parseTime = parseTime2;
  window.calculateCheckInTimes = calculateCheckInTimes2;

  // assets/scripts/utils/goalCalculations.js
  var goalCalculations_exports = {};
  __export(goalCalculations_exports, {
    GoalCalculations: () => GoalCalculations2
  });
  var GoalCalculations2 = function() {
    "use strict";
    function formatNumber(value) {
      if (value === null || value === void 0 || value === "") return { displayValue: "", fullValue: "" };
      const num = parseFloat(value);
      if (isNaN(num)) return { displayValue: String(value), fullValue: String(value) };
      const absNum = Math.abs(num);
      let displayValue;
      const fullValue = num.toLocaleString("zh-CN", {
        maximumFractionDigits: 10,
        useGrouping: true
      });
      if (absNum >= 1e9) {
        displayValue = (num / 1e9).toFixed(2) + "B";
      } else if (absNum >= 1e6) {
        displayValue = (num / 1e6).toFixed(2) + "M";
      } else if (absNum >= 1e4) {
        displayValue = (num / 1e3).toFixed(1) + "K";
      } else {
        displayValue = fullValue;
      }
      return { displayValue, fullValue };
    }
    function formatDate3(date) {
      if (!(date instanceof Date) || isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    function autoCalcGoalDateRange(goal) {
      if (!goal || !goal.items || goal.items.length === 0) return false;
      let earliestStart = null;
      let latestEnd = null;
      for (const item of goal.items) {
        if (item.startDate) {
          const startDate = /* @__PURE__ */ new Date(item.startDate + "T00:00:00");
          if (!isNaN(startDate.getTime()) && (!earliestStart || startDate < earliestStart)) {
            earliestStart = startDate;
          }
        }
        if (item.endDate) {
          const endDate = /* @__PURE__ */ new Date(item.endDate + "T00:00:00");
          if (!isNaN(endDate.getTime()) && (!latestEnd || endDate > latestEnd)) {
            latestEnd = endDate;
          }
        }
      }
      let changed = false;
      if (earliestStart) {
        const newStart = formatDate3(earliestStart);
        if (goal.startDate !== newStart) {
          goal.startDate = newStart;
          changed = true;
        }
      } else if (goal.startDate) {
        goal.startDate = "";
        changed = true;
      }
      if (latestEnd) {
        const newEnd = formatDate3(latestEnd);
        if (goal.endDate !== newEnd) {
          goal.endDate = newEnd;
          changed = true;
        }
      } else if (goal.endDate) {
        goal.endDate = "";
        changed = true;
      }
      return changed;
    }
    return {
      formatNumber,
      formatDate: formatDate3,
      autoCalcGoalDateRange
    };
  }();
  if (typeof window !== "undefined") {
    window.GoalCalculations = GoalCalculations2;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = GoalCalculations2;
  }

  // assets/scripts/utils/popupPositioner.js
  var popupPositioner_exports = {};
  __export(popupPositioner_exports, {
    PopupPositioner: () => PopupPositioner2
  });
  var PopupPositioner2 = function() {
    "use strict";
    const DEFAULT_PADDING = 8;
    const DEFAULT_FALLBACK_W = 300;
    const DEFAULT_FALLBACK_H = 400;
    function measure(el) {
      try {
        const r = el.getBoundingClientRect();
        if (r && (r.width > 0 || r.height > 0)) return r;
        return null;
      } catch (e) {
        return null;
      }
    }
    function applyPosition(el, pos) {
      const parts = [
        "position:fixed",
        `top:${Math.round(pos.top)}px`,
        `left:${Math.round(pos.left)}px`,
        "z-index:10000"
      ];
      el.style.cssText = parts.join(";");
      if (pos.maxHeight) {
        el.style.maxHeight = pos.maxHeight + "px";
        el.style.overflowY = "auto";
      }
    }
    function positionNextFrame(opts) {
      const {
        popupElement,
        anchorRect = null,
        anchor = {},
        fallbackSize = {},
        padding = DEFAULT_PADDING,
        flipUpWhenTooLow = true
      } = opts;
      if (!popupElement) return null;
      const pickerRect = measure(popupElement);
      const fallbackW = fallbackSize.width || DEFAULT_FALLBACK_W;
      const fallbackH = fallbackSize.height || DEFAULT_FALLBACK_H;
      const effectiveW = pickerRect ? pickerRect.width : fallbackW;
      const effectiveH = pickerRect ? pickerRect.height : fallbackH;
      const placement = anchor.placement || "below-left";
      let top, left;
      const hasAnchor = anchorRect && (anchorRect.width > 0 || anchorRect.height > 0);
      if (hasAnchor) {
        top = anchorRect.bottom + padding;
        if (placement === "below-center") {
          left = anchorRect.left + anchorRect.width / 2 - effectiveW / 2;
        } else {
          left = anchorRect.left;
        }
      } else {
        top = window.innerHeight / 2 - effectiveH / 2;
        left = window.innerWidth / 2 - effectiveW / 2;
      }
      let maxHeight = null;
      if (pickerRect) {
        if (flipUpWhenTooLow && top + pickerRect.height > window.innerHeight - padding) {
          top = hasAnchor ? anchorRect.top - pickerRect.height - padding : padding;
        }
        if (top < padding) {
          top = padding;
          maxHeight = window.innerHeight - padding * 2;
        }
        if (left + pickerRect.width > window.innerWidth - padding) {
          left = window.innerWidth - pickerRect.width - padding;
        }
        if (left < padding) left = padding;
      } else {
        top = Math.max(padding, top);
        left = Math.max(padding, left);
      }
      applyPosition(popupElement, { top, left, maxHeight });
      return pickerRect;
    }
    function positionOnNextFrame(opts) {
      requestAnimationFrame(() => positionNextFrame(opts));
    }
    return {
      measure,
      positionNextFrame,
      positionOnNextFrame
    };
  }();
  if (typeof window !== "undefined") {
    window.PopupPositioner = PopupPositioner2;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = PopupPositioner2;
  }

  // assets/scripts/utils/eventBus.js
  var eventBus_exports = {};
  __export(eventBus_exports, {
    EventBus: () => EventBus2
  });
  var EventBus2 = {
    events: {},
    SUBSCRIBER_LIMIT: 50,
    on(event, callback, context = null) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      if (this.events[event].length >= this.SUBSCRIBER_LIMIT) {
        console.warn(`Event "${event}" has reached subscriber limit of ${this.SUBSCRIBER_LIMIT}`);
        return null;
      }
      const id = `${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const subscriber = { id, callback, context };
      this.events[event].push(subscriber);
      return () => this.off(event, id);
    },
    off(event, subscriberId) {
      if (!this.events[event]) return false;
      const index = this.events[event].findIndex((sub) => sub.id === subscriberId);
      if (index === -1) return false;
      this.events[event].splice(index, 1);
      if (this.events[event].length === 0) {
        delete this.events[event];
      }
      return true;
    },
    emit(event, data = null) {
      if (!this.events[event]) return [];
      const results = [];
      const subscribers = [...this.events[event]];
      subscribers.forEach((subscriber) => {
        try {
          const result = subscriber.context ? subscriber.callback.call(subscriber.context, data) : subscriber.callback(data);
          results.push({ success: true, result });
        } catch (error) {
          console.error(`Error in event "${event}" subscriber:`, error);
          results.push({ success: false, error });
        }
      });
      return results;
    },
    /**
     * 检查指定事件是否有订阅者
     * @param {string} event
     * @returns {boolean}
     */
    hasListeners(event) {
      return !!(this.events[event] && this.events[event].length > 0);
    },
    /**
     * 获取指定事件的订阅者数量
     * @param {string} event
     * @returns {number}
     */
    getListenerCount(event) {
      return (this.events[event] || []).length;
    },
    /**
     * 获取所有已注册的事件名列表
     * @returns {string[]}
     */
    getEvents() {
      return Object.keys(this.events);
    },
    /**
     * 订阅事件，但只执行一次（首次触发后自动取消）
     * @returns {Function} 取消订阅函数
     */
    once(event, callback, context = null) {
      const self = this;
      let unsub = null;
      unsub = this.on(event, function onceWrapper(data) {
        if (unsub) unsub();
        callback.call(context, data);
      }, null);
      return unsub;
    },
    /**
     * 清除订阅
     * @param {string} [event] - 指定事件名时只清除该事件；无参数时清除所有事件
     */
    clear(event) {
      if (event) {
        delete this.events[event];
      } else {
        this.events = {};
      }
    }
  };
  window.EventBus = EventBus2;

  // assets/scripts/utils/actionDispatcher.js
  var actionDispatcher_exports = {};
  __export(actionDispatcher_exports, {
    ActionDispatcher: () => ActionDispatcher2
  });
  var ActionDispatcher2 = {
    _handlers: {},
    register(action, handler) {
      this._handlers[action] = handler;
    },
    registerMany(map) {
      Object.assign(this._handlers, map);
    },
    // Shadow DOM 下事件 e.target 会被 retarget 成 host，故用 composedPath() 取
    // 真实路径（含 shadow 内节点）查找带 [data-action]/[data-stop-propagation] 的元素。
    _findClosestAttr(e, attr) {
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      const list = path.length ? path : [e.target];
      for (const node of list) {
        if (node && node.nodeType === 1 && typeof node.closest === "function") {
          const match = node.closest("[" + attr + "]");
          if (match) return match;
        }
      }
      return null;
    },
    init() {
      document.addEventListener("click", (e) => {
        const target = this._findClosestAttr(e, "data-action");
        if (target) {
          const action = target.dataset.action;
          const handler = this._handlers[action];
          if (handler) {
            const isToggleInput = target.tagName === "INPUT" && (target.type === "checkbox" || target.type === "radio");
            if (!isToggleInput) {
              e.preventDefault();
            }
            e.stopImmediatePropagation();
            handler(target.dataset, target, e);
            return;
          }
        }
        const stopEl = this._findClosestAttr(e, "data-stop-propagation");
        if (stopEl) {
          e.stopImmediatePropagation();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const target = this._findClosestAttr(e, "data-action");
        if (!target) return;
        const action = target.dataset.action;
        const handler = this._handlers[action];
        if (!handler) return;
        e.preventDefault();
        handler(target.dataset, target, e);
      });
    }
  };
  window.ActionDispatcher = ActionDispatcher2;

  // assets/scripts/utils/panelManager.js
  var panelManager_exports = {};
  __export(panelManager_exports, {
    PanelManager: () => PanelManager2
  });
  var PanelManager2 = {
    activePanel: null,
    activeId: null,
    /**
     * 打开一个面板
     * @param {string} id 面板唯一标识
     * @param {string} title 面板标题
     * @param {string} content 面板 HTML 内容
     * @param {Object} options 配置项 (width, onOpen, onClose, tabs)
     */
    open(id, title, content, options = {}) {
      if (this.activeId === id) {
        this.close();
        return;
      }
      this.close();
      const panel = document.createElement("div");
      panel.className = "fab-panel";
      panel.id = `panel-${id}`;
      let tabsHtml = "";
      if (options.tabs && options.tabs.length > 0) {
        tabsHtml = `
                <div class="fab-panel-tabs">
                    ${options.tabs.map((tab, index) => `
                        <div class="fab-panel-tab ${index === 0 ? "active" : ""}" data-tab="${tab.id}">
                            ${tab.label}
                        </div>
                    `).join("")}
                </div>
            `;
      }
      panel.innerHTML = `
            <div class="fab-panel-header">
                <div class="fab-panel-title">
                    ${title}
                </div>
                <button class="fab-panel-close" aria-label="\u5173\u95ED">
                    ${LucideUtils.createIcon("x", { size: 14 })}
                </button>
            </div>
            ${tabsHtml}
            <div class="fab-panel-body">
                ${content}
            </div>
        `;
      modalMount().appendChild(panel);
      this.activePanel = panel;
      this.activeId = id;
      this._activeOptions = options;
      if (options.tabs) {
        const tabs = panel.querySelectorAll(".fab-panel-tab");
        tabs.forEach((tab) => {
          tab.onclick = () => {
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const tabId = tab.getAttribute("data-tab");
            const contents = panel.querySelectorAll(".fab-tab-content");
            contents.forEach((c) => {
              c.classList.toggle("active", c.id === `tab-content-${tabId}`);
            });
          };
        });
      }
      panel.querySelector(".fab-panel-close").onclick = () => this.close();
      panel.onclick = (e) => {
        if (e.target.closest("[data-action]")) return;
        e.stopPropagation();
      };
      this._outsideClickHandler = (e) => {
        if (this.activePanel && !eventInTargets(e, this.activePanel)) {
          this.close();
        }
      };
      setTimeout(() => document.addEventListener("click", this._outsideClickHandler), 10);
      this._escHandler = (e) => {
        if (e.key === "Escape") this.close();
      };
      document.addEventListener("keydown", this._escHandler);
      requestAnimationFrame(() => {
        panel.classList.add("active");
        this._initDraggable(panel);
        if (options.onOpen) options.onOpen(panel);
      });
    },
    /**
     * 初始化拖拽功能
     */
    _initDraggable(panel) {
      const header = panel.querySelector(".fab-panel-header");
      let isDragging = false;
      let startX, startY, initialLeft, initialTop;
      const onMouseMove = (e) => {
        if (!isDragging) return;
        panel.style.left = initialLeft + (e.clientX - startX) + "px";
        panel.style.top = initialTop + (e.clientY - startY) + "px";
      };
      const onMouseUp = () => {
        isDragging = false;
        header.style.cursor = "grab";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      header.addEventListener("mousedown", (e) => {
        if (e.target.closest(".fab-panel-close")) return;
        isDragging = true;
        header.style.cursor = "grabbing";
        const rect = panel.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        panel.style.transform = "none";
        panel.style.left = initialLeft + "px";
        panel.style.top = initialTop + "px";
        panel.style.margin = "0";
        startX = e.clientX;
        startY = e.clientY;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    },
    close() {
      if (!this.activePanel) return;
      const panel = this.activePanel;
      panel.classList.remove("active");
      document.removeEventListener("click", this._outsideClickHandler);
      document.removeEventListener("keydown", this._escHandler);
      if (this._activeOptions && typeof this._activeOptions.onClose === "function") {
        try {
          this._activeOptions.onClose(panel);
        } catch (e) {
          console.warn("onClose error:", e);
        }
      }
      this._activeOptions = null;
      setTimeout(() => {
        if (panel.parentNode) panel.parentNode.removeChild(panel);
      }, 300);
      this.activePanel = null;
      this.activeId = null;
    }
  };
  window.PanelManager = PanelManager2;

  // assets/scripts/handlers/shopManager.js
  var shopManager_exports = {};
  __export(shopManager_exports, {
    ShopManager: () => ShopManager2
  });
  var ShopManager2 = {
    // 预设商品列表 - 分2类
    ITEMS: {
      food: [
        { id: "milktea", name: "\u725B\u9A6C\u5496\u5561", price: 30, icon: "\u2615", desc: "\u6253\u5DE5\u4EBA\u7EED\u547D\u5FC5\u5907" },
        { id: "snack", name: "\u7F8E\u5473\u96F6\u98DF", price: 50, icon: "\u{1F37F}", desc: "\u8865\u5145\u80FD\u91CF\u7684\u5C0F\u96F6\u5634" },
        { id: "coffee", name: "\u996E\u6599\u679C\u8336", price: 40, icon: "\u{1F964}", desc: "\u6E05\u723D\u89E3\u6E34\u7684\u5348\u540E\u4E4B\u9009" },
        { id: "takeout", name: "\u70B9\u5916\u5356", price: 60, icon: "\u{1F371}", desc: "\u7292\u52B3\u81EA\u5DF1\u4E00\u987F\u597D\u7684" },
        { id: "bread", name: "\u9762\u5305", price: 30, icon: "\u{1F35E}", desc: "\u7B80\u5355\u53C8\u9971\u8179\u7684\u9009\u62E9" },
        { id: "cola", name: "\u53EF\u4E50", price: 20, icon: "\u{1F964}", desc: "\u5FEB\u4E50\u80A5\u5B85\u6C34" },
        { id: "selftea", name: "\u81EA\u6CE1\u83361\u676F", price: 1, icon: "\u{1F375}", desc: "\u60A0\u95F2\u54C1\u8317\u597D\u65F6\u5149" },
        { id: "selfcoffee", name: "\u81EA\u6CE1\u725B\u59761\u676F", price: 1, icon: "\u{1F95B}", desc: "\u6E29\u6696\u53C8\u8425\u517B\u7684\u4E00\u676F" },
        { id: "brewcoffee", name: "\u81EA\u51B2\u5496\u5561", price: 2, icon: "\u2615", desc: "\u624B\u51B2\u5496\u5561\u7684\u4EEA\u5F0F\u611F" }
      ],
      entertainment: [
        { id: "game", name: "\u6E38\u620F1\u5C0F\u65F6", price: 15, icon: "\u{1F3AE}", desc: "\u5C3D\u60C5\u4EAB\u53D71\u5C0F\u65F6\u6E38\u620F" },
        { id: "movie", name: "\u770B1\u90E8\u7535\u5F71", price: 15, icon: "\u{1F3AC}", desc: "\u5956\u52B1\u81EA\u5DF1\u4E00\u90E8\u597D\u7535\u5F71" },
        { id: "study", name: "\u5B66\u4E601\u5C0F\u65F6", price: 1, icon: "\u{1F4DA}", desc: "\u4E13\u6CE8\u5B66\u4E60\u63D0\u5347\u81EA\u5DF1" },
        { id: "bilibili", name: "\u5237B\u7AD91\u5C0F\u65F6", price: 15, icon: "\u{1F4FA}", desc: "\u5FEB\u4E50\u5237\u89C6\u9891\u653E\u677E\u4E00\u4E0B" },
        { id: "drawing", name: "\u7ED8\u753B1\u5C0F\u65F6", price: 1, icon: "\u{1F3A8}", desc: "\u4EAB\u53D7\u521B\u4F5C\u7684\u4E50\u8DA3" },
        { id: "fitness", name: "\u5065\u8EAB30\u5206\u949F", price: 1, icon: "\u{1F4AA}", desc: "\u8FD0\u52A8\u51FA\u6C57\u91CA\u653E\u538B\u529B" },
        { id: "running", name: "\u8DD1\u6B6530\u5206\u949F", price: 1, icon: "\u{1F3C3}", desc: "\u6237\u5916\u8DD1\u6B65\u547C\u5438\u65B0\u9C9C\u7A7A\u6C14" },
        { id: "tidyroom", name: "\u6574\u7406\u623F\u95F430\u5206\u949F", price: 1, icon: "\u{1F9F9}", desc: "\u6536\u62FE\u6574\u6D01\u5FC3\u60C5\u4E5F\u53D8\u597D" },
        { id: "meditation", name: "\u51A5\u60F330\u5206\u949F", price: 1, icon: "\u{1F9D8}", desc: "\u9759\u5FC3\u51A5\u60F3\u653E\u7A7A\u601D\u7EEA" }
      ]
    },
    _itemIndex: null,
    _currentHistoryMonth: null,
    _sortBy: {
      food: "default",
      entertainment: "default"
    },
    _sortOutsideClickHandler: null,
    _ensureIndex() {
      if (this._itemIndex) return;
      const idx = {};
      for (const category of Object.values(this.ITEMS)) {
        for (const item of category) {
          idx[item.id] = item;
        }
      }
      this._itemIndex = idx;
    },
    _sortItems(items, sortBy, category) {
      const indexed = items.map((item, idx) => ({ ...item, _originalIdx: idx }));
      if (sortBy === "price-desc") {
        indexed.sort((a, b) => b.price - a.price || a._originalIdx - b._originalIdx);
      } else {
        indexed.sort((a, b) => a.price - b.price || a._originalIdx - b._originalIdx);
      }
      return indexed;
    },
    _getSortLabel(sortBy) {
      const labels = {
        "default": "\u9ED8\u8BA4",
        "price-asc": "\u4EF7\u683C\u2191",
        "price-desc": "\u4EF7\u683C\u2193"
      };
      return labels[sortBy] || "\u9ED8\u8BA4";
    },
    _renderSortButton(category) {
      const currentSort = this._sortBy[category] || "default";
      const options = [
        { value: "default", label: "\u9ED8\u8BA4" },
        { value: "price-asc", label: "\u4EF7\u683C\u2191" },
        { value: "price-desc", label: "\u4EF7\u683C\u2193" }
      ];
      const currentLabel = options.find((o) => o.value === currentSort).label;
      return `
            <div class="shop-sort-dropdown">
                <button class="shop-sort-btn" data-sort-category="${category}">
                    <span class="shop-sort-label">${currentLabel}</span>
                    <span class="shop-sort-caret">\u25BE</span>
                </button>
                <div class="shop-sort-menu" data-sort-menu="${category}">
                    ${options.map((o) => `
                        <button class="shop-sort-option ${o.value === currentSort ? "is-active" : ""}"
                                data-sort-option="${o.value}" data-sort-category="${category}">${o.label}</button>
                    `).join("")}
                </div>
            </div>
        `;
    },
    _saveSortPreference() {
      try {
        storageManager.putSetting("shopSortBy", this._sortBy);
      } catch (e) {
      }
    },
    _loadSortPreference() {
      try {
        const saved = storageManager.getSetting("shopSortBy");
        if (saved) {
          this._sortBy = { food: saved.food || "default", entertainment: saved.entertainment || "default" };
        }
      } catch (e) {
      }
    },
    _updateItemsList(panel) {
      const availableBalance = store.getAvailableBalance();
      const purchaseCounts = store.getPurchaseCounts();
      const foodList = panel.querySelector("#shop-items-food");
      if (foodList) {
        const sortedFood = this._sortItems(this.ITEMS.food, this._sortBy.food, "food");
        foodList.innerHTML = sortedFood.map((item) => this._renderItemCard(item, availableBalance, purchaseCounts)).join("");
      }
      const entertainmentList = panel.querySelector("#shop-items-entertainment");
      if (entertainmentList) {
        const sortedEntertainment = this._sortItems(this.ITEMS.entertainment, this._sortBy.entertainment, "entertainment");
        entertainmentList.innerHTML = sortedEntertainment.map((item) => this._renderItemCard(item, availableBalance, purchaseCounts)).join("");
      }
      ["food", "entertainment"].forEach((category) => {
        const menu = panel.querySelector(`[data-sort-menu="${category}"]`);
        if (menu) {
          menu.style.display = "none";
          menu.querySelectorAll(".shop-sort-option").forEach((opt) => {
            opt.classList.toggle("is-active", opt.dataset.sortOption === this._sortBy[category]);
          });
        }
        const btn = panel.querySelector(`.shop-sort-btn[data-sort-category="${category}"]`);
        if (btn) {
          const labelSpan = btn.querySelector(".shop-sort-label");
          if (labelSpan) {
            labelSpan.textContent = this._getSortLabel(this._sortBy[category]);
          }
        }
      });
    },
    _updateBalanceDisplay(panel) {
      const availableBalance = store.getAvailableBalance();
      const balanceEl = panel.querySelector("#shopBalanceValue");
      if (balanceEl) {
        balanceEl.innerHTML = `<span class="shop-currency">\xA5</span>${availableBalance.toFixed(2)}`;
      }
    },
    _updateTodaySpentDisplay(panel) {
      const today = (/* @__PURE__ */ new Date()).toDateString();
      const { purchaseHistory } = store.getState();
      const todayPurchases = (purchaseHistory.records || []).filter((r) => new Date(r.date).toDateString() === today);
      const todaySpent = todayPurchases.reduce((sum, r) => sum + r.price, 0);
      const spentEl = panel.querySelector("#shop-today-spent-value");
      if (spentEl) {
        if (todaySpent > 0) {
          spentEl.textContent = `-\xA5${todaySpent.toFixed(2)}`;
        } else {
          spentEl.textContent = "\xA50.00";
        }
      }
      const detailsEl = panel.querySelector("#shop-today-spent-details");
      if (detailsEl) {
        if (todayPurchases.length === 0) {
          detailsEl.style.display = "none";
          detailsEl.innerHTML = "";
        } else {
          detailsEl.style.display = "";
          detailsEl.innerHTML = todayPurchases.map((p) => `
                    <div class="shop-breakdown-row">
                        <span class="shop-breakdown-text">${p.icon || ""} ${p.name}</span>
                        <span class="shop-breakdown-amount is-spent">-\xA5${p.price.toFixed(2)}</span>
                    </div>
                `).join("");
        }
      }
    },
    open() {
      this._loadSortPreference();
      const { balance, purchaseHistory, incomeHistory, stats } = store.getState();
      const today = (/* @__PURE__ */ new Date()).toDateString();
      const todayIncomes = incomeHistory.records.filter((inc) => new Date(inc.date).toDateString() === today);
      const todayEarnings = todayIncomes.reduce((sum, inc) => sum + inc.amount, 0);
      if (stats.todayEarnings !== todayEarnings) {
        stats.todayEarnings = todayEarnings;
        stats.date = today;
        storageManager.putSetting("shopStats", stats);
      }
      const totalSpent = stats.totalSpent || 0;
      const totalEarnings = stats.totalEarnings || 0;
      const availableBalance = store.getAvailableBalance();
      const purchaseCounts = store.getPurchaseCounts();
      const frozenAmount = todayEarnings;
      const todayPurchases = (purchaseHistory.records || []).filter((r) => new Date(r.date).toDateString() === today);
      const todaySpent = todayPurchases.reduce((sum, r) => sum + r.price, 0);
      const content = `
            <div id="tab-content-shop-items" class="fab-tab-content active">
                <!-- \u4F59\u989D\u5C55\u793A -->
                <div class="shop-balance-card">
                    <div class="shop-balance-amount-block shop-balance-amount-block--centered">
                        <div class="shop-balance-label">\u53EF\u7528\u7AF9\u5E01</div>
                        <div id="shopBalanceValue" class="shop-balance-value">
                            <span class="shop-currency">\xA5</span>${availableBalance.toFixed(2)}
                        </div>
                        ${frozenAmount > 0 ? `<div class="shop-balance-frozen">\u51BB\u7ED3 \xA5${frozenAmount.toFixed(2)}\uFF08\u4ECA\u65E5\u6536\u5165\u6B21\u65E5\u53EF\u7528\uFF09</div>` : ""}
                    </div>
                    <div class="shop-balance-metrics shop-balance-metrics--row">
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div class="shop-metric-value is-income-today">${todayEarnings > 0 ? "+\xA5" + todayEarnings.toFixed(2) : "\xA50.00"}</div>
                            <div class="shop-metric-label">\u4ECA\u65E5\u6536\u5165</div>
                        </div>
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div id="shop-today-spent-value" class="shop-metric-value is-spent-today">${todaySpent > 0 ? "-\xA5" + todaySpent.toFixed(2) : "\xA50.00"}</div>
                            <div class="shop-metric-label">\u4ECA\u65E5\u6D88\u8D39</div>
                        </div>
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div class="shop-metric-value is-income-total">+\xA5${totalEarnings.toFixed(2)}</div>
                            <div class="shop-metric-label">\u5386\u53F2\u603B\u6536\u5165</div>
                        </div>
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div class="shop-metric-value is-spent-total">\xA5${totalSpent.toFixed(2)}</div>
                            <div class="shop-metric-label">\u603B\u6D88\u8D39</div>
                        </div>
                    </div>
                    <div class="shop-rules-hint">
                        \u{1F4A1} \u6BCF\u5B8C\u6210\u4E00\u4E2A<b>\u4ECA\u65E5</b>\u5B50\u9879\u4EFB\u52A1\u53EF\u6323 1 \u7AF9\u5E01\uFF0C\u4ECA\u65E5\u6536\u5165\u6B21\u65E5\u53EF\u7528<br>
                        \u{1F4CC} \u8865\u5B8C\u6210\u5386\u53F2\u65E5\u671F\u7684\u4EFB\u52A1\u4E0D\u5956\u52B1\u7AF9\u5E01
                    </div>
                    ${todayIncomes.length > 0 ? `
                    <div class="shop-breakdown">
                        <div class="shop-breakdown-header">\u4ECA\u65E5\u6536\u5165\u660E\u7EC6</div>
                        ${todayIncomes.map((inc) => `
                            <div class="shop-breakdown-row">
                                <span class="shop-breakdown-text">${inc.desc || inc.type}</span>
                                <span class="shop-breakdown-amount is-income">+\xA5${inc.amount.toFixed(2)}</span>
                            </div>
                        `).join("")}
                    </div>
                    ` : ""}
                    <div id="shop-today-spent-details" class="shop-breakdown">
                        <div class="shop-breakdown-header">\u4ECA\u65E5\u6D88\u8D39\u660E\u7EC6</div>
                        ${todayPurchases.length > 0 ? todayPurchases.map((p) => `
                            <div class="shop-breakdown-row">
                                <span class="shop-breakdown-text">${p.icon || ""} ${p.name}</span>
                                <span class="shop-breakdown-amount is-spent">-\xA5${p.price.toFixed(2)}</span>
                            </div>
                        `).join("") : ""}
                    </div>
                </div>

                <!-- \u5403\u559D\u4EAB\u53D7 -->
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">
                        <span>\u{1F37D}\uFE0F \u5403\u559D\u4EAB\u53D7</span>
                        ${this._renderSortButton("food")}
                    </div>
                    <div class="shop-items-list" id="shop-items-food">
                        ${this._sortItems(this.ITEMS.food, this._sortBy.food, "food").map((item) => this._renderItemCard(item, availableBalance, purchaseCounts)).join("")}
                    </div>
                </div>

                <!-- \u4F11\u95F2\u5A31\u4E50 -->
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">
                        <span>\u{1F3AE} \u4F11\u95F2\u5A31\u4E50</span>
                        ${this._renderSortButton("entertainment")}
                    </div>
                    <div class="shop-items-list" id="shop-items-entertainment">
                        ${this._sortItems(this.ITEMS.entertainment, this._sortBy.entertainment, "entertainment").map((item) => this._renderItemCard(item, availableBalance, purchaseCounts)).join("")}
                    </div>
                </div>
            </div>

            <div id="tab-content-shop-history" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div id="history-content-container"></div>
                </div>
            </div>

            <div id="tab-content-shop-philosophy" class="fab-tab-content">
                <div class="shop-philosophy-hero">
                    <div class="shop-philosophy-icon">\u{1F38B}</div>
                    <div class="shop-philosophy-title">\u53CD\u6D88\u8D39\u4E3B\u4E49\u5546\u5E97</div>
                    <div class="shop-philosophy-subtitle">\u8D8A\u5BB9\u6613\u5F97\u5230\u7684\uFF0C\u8D8A\u8D35<br>\u8D8A\u9700\u8981\u4ED8\u51FA\u884C\u52A8\u7684\uFF0C\u8D8A\u4FBF\u5B9C</div>
                </div>

                <div class="fab-panel-section">
                    <div class="fab-panel-section-title"><span>\u{1F4A1} \u8BBE\u8BA1\u539F\u5219</span></div>
                    <div class="shop-principle-cards">
                        <div class="shop-principle-card is-warn">
                            <div class="shop-principle-icon">\u{1F6CB}\uFE0F</div>
                            <div class="shop-principle-content">
                                <div class="shop-principle-heading">\u88AB\u52A8\u6D88\u8017 \u2192 \u9AD8\u4EF7</div>
                                <div class="shop-principle-text">\u82B1\u94B1\u6D88\u8D39\u3001\u8EBA\u7740\u4E0D\u52A8\u5C31\u80FD\u505A\u7684\u4E8B\uFF0C\u4EE3\u4EF7\u6700\u9AD8\u3002\u70B9\u5916\u5356 60 \u7AF9\u5E01\uFF0C\u5237B\u7AD9 15 \u7AF9\u5E01\u2014\u2014\u8212\u9002\u5708\u662F\u6700\u8D35\u7684\u5708\u3002</div>
                            </div>
                        </div>
                        <div class="shop-principle-card">
                            <div class="shop-principle-icon">\u{1F3C3}</div>
                            <div class="shop-principle-content">
                                <div class="shop-principle-heading">\u4E3B\u52A8\u884C\u52A8 \u2192 \u4F4E\u4EF7</div>
                                <div class="shop-principle-text">\u81EA\u5DF1\u52A8\u624B\u505A\u996D\u3001\u51FA\u95E8\u8DD1\u6B65\u3001\u6574\u7406\u623F\u95F4\u3001\u51A5\u60F3\u2026\u2026\u9700\u8981\u4ED8\u51FA\u884C\u52A8\u7684\u4E8B\uFF0C\u53EA\u9700 1-2 \u7AF9\u5E01\u3002\u884C\u52A8\u672C\u8EAB\u5C31\u662F\u5956\u52B1\u3002</div>
                            </div>
                        </div>
                        <div class="shop-principle-card">
                            <div class="shop-principle-icon">\u{1F9E0}</div>
                            <div class="shop-principle-content">
                                <div class="shop-principle-heading">\u6838\u5FC3\u903B\u8F91</div>
                                <div class="shop-principle-text">\u7AF9\u5E01\u662F\u884C\u52A8\u529B\u7684\u5EA6\u91CF\uFF0C\u4E0D\u662F\u6D88\u8D39\u529B\u7684\u5EA6\u91CF\u3002\u5546\u5E97\u7684\u76EE\u7684\u4E0D\u662F\u8BA9\u4F60"\u4E70\u5F97\u8D77"\uFF0C\u800C\u662F\u8BA9\u4F60"\u52A8\u8D77\u6765"\u3002</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="fab-panel-section-title"><span>\u2696\uFE0F \u5B9A\u4EF7\u5BF9\u6BD4</span></div>
                    <div class="shop-price-rows">
                        <div class="shop-price-row is-warn">
                            <span class="shop-price-row-text">\u{1F371} \u70B9\u5916\u5356\uFF08\u82B1\u94B1 + \u4E0D\u52A8\uFF09</span>
                            <span class="shop-price-row-value is-warn">60 \u7AF9\u5E01</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">\u{1F3AE} \u6E38\u620F1\u5C0F\u65F6\uFF08\u4E0D\u52A8\uFF09</span>
                            <span class="shop-price-row-value">15 \u7AF9\u5E01</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">\u{1F4FA} \u5237B\u7AD91\u5C0F\u65F6\uFF08\u4E0D\u52A8\uFF09</span>
                            <span class="shop-price-row-value">15 \u7AF9\u5E01</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">\u{1F9F9} \u6574\u7406\u623F\u95F430\u5206\u949F\uFF08\u52A8\u624B\uFF09</span>
                            <span class="shop-price-row-value">1 \u7AF9\u5E01</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">\u{1F3C3} \u8DD1\u6B6530\u5206\u949F\uFF08\u52A8\u624B + \u51FA\u95E8\uFF09</span>
                            <span class="shop-price-row-value">1 \u7AF9\u5E01</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">\u{1F9D8} \u51A5\u60F330\u5206\u949F\uFF08\u52A8\u624B + \u5185\u5FC3\uFF09</span>
                            <span class="shop-price-row-value">1 \u7AF9\u5E01</span>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="fab-panel-section-title"><span>\u{1FA99} \u7AF9\u5E01\u83B7\u53D6\u89C4\u5219</span></div>
                    <div class="shop-coin-rules">
                        <div class="shop-coin-rule">
                            <span class="shop-coin-rule-mark">+1</span>
                            <span>\u6BCF\u5B8C\u6210\u4E00\u4E2A<b>\u4ECA\u65E5</b>\u5B50\u9879\u4EFB\u52A1</span>
                        </div>
                        <div class="shop-coin-rule">
                            <span class="shop-coin-rule-mark is-muted">+0</span>
                            <span>\u8865\u5B8C\u6210\u5386\u53F2\u65E5\u671F\u7684\u4EFB\u52A1\uFF08\u4E0D\u5956\u52B1\uFF09</span>
                        </div>
                        <div class="shop-coin-rule">
                            <span class="shop-coin-rule-mark is-hint">\u23F3</span>
                            <span>\u4ECA\u65E5\u6536\u5165\u6B21\u65E5\u53EF\u7528\uFF08\u51BB\u7ED3\u673A\u5236\uFF09</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
      PanelManager.open("shop", LucideUtils.createIcon("dollarSign", { size: 16 }) + "\u7AF9\u6797\u5546\u5E97", content, {
        tabs: [
          { id: "shop-items", label: "\u5546\u5E97\u5151\u6362" },
          { id: "shop-history", label: "\u6D88\u8D39\u5386\u53F2" },
          { id: "shop-philosophy", label: "\u8BBE\u8BA1\u54F2\u5B66" }
        ],
        onOpen: (panel) => {
          this._bindShopEvents(panel);
          this._renderHistoryTab(panel);
        },
        onClose: () => {
          if (this._sortOutsideClickHandler) {
            document.removeEventListener("mousedown", this._sortOutsideClickHandler);
            this._sortOutsideClickHandler = null;
          }
        }
      });
    },
    _renderItemCard(item, balance, purchaseCounts) {
      const count = purchaseCounts[item.id] || 0;
      const purchased = count > 0;
      const locked = balance < item.price;
      const statusText = locked ? "\u4F59\u989D\u4E0D\u8DB3" : purchased ? `\u5DF2\u5151${count}\u6B21` : "\u5151\u6362";
      const statusClass = locked ? "is-locked" : purchased ? "is-purchased" : "is-available";
      return `
            <div class="shop-item-card ${locked ? "is-locked" : ""}"
                 data-action="shop-buy" data-item-id="${item.id}" data-item-price="${item.price}" data-item-name="${item.name}" data-item-icon="${item.icon}">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.desc}</div>
                </div>
                <div class="shop-item-price-block">
                    <div class="shop-item-price">\xA5${item.price}</div>
                    <div class="shop-item-status ${statusClass}">${statusText}</div>
                </div>
            </div>
        `;
    },
    _bindShopEvents(panel) {
      if (this._sortOutsideClickHandler) {
        document.removeEventListener("mousedown", this._sortOutsideClickHandler);
        this._sortOutsideClickHandler = null;
      }
      panel.addEventListener("click", async (e) => {
        const sortBtn = e.target.closest(".shop-sort-btn");
        if (sortBtn) {
          e.stopPropagation();
          const category = sortBtn.dataset.sortCategory;
          const menu = panel.querySelector(`[data-sort-menu="${category}"]`);
          panel.querySelectorAll(".shop-sort-menu").forEach((m) => {
            if (m !== menu) m.style.display = "none";
          });
          menu.style.display = menu.style.display === "block" ? "none" : "block";
          return;
        }
        const sortOption = e.target.closest(".shop-sort-option");
        if (sortOption) {
          e.stopPropagation();
          const category = sortOption.dataset.sortCategory;
          const sortBy = sortOption.dataset.sortOption;
          this._sortBy[category] = sortBy;
          this._saveSortPreference();
          this._updateItemsList(panel);
          return;
        }
        const card = e.target.closest(".shop-item-card:not(.is-locked)");
        if (card) {
          const itemId = card.dataset.itemId;
          const price = parseFloat(card.dataset.itemPrice);
          const itemName = card.dataset.itemName;
          const item = this._findItem(itemId);
          if (!item) return;
          const confirmed = await ConfirmDialog.confirm({
            title: "\u786E\u8BA4\u5151\u6362",
            message: `\u786E\u5B9A\u8981\u82B1\u8D39 \xA5${price} \u5151\u6362\u3010${itemName}\u3011\u5417\uFF1F

\u8D2D\u4E70\u540E\u4F59\u989D\uFF1A\xA5${(store.getState().balance - price).toFixed(2)}`,
            confirmText: "\u786E\u8BA4\u5151\u6362",
            cancelText: "\u518D\u60F3\u60F3"
          });
          if (confirmed) {
            const availableBalance = store.getAvailableBalance();
            if (availableBalance >= price) {
              await store.updateBalance(-price);
              await store.addPurchaseHistory({
                id: item.id,
                name: item.name,
                price: item.price,
                icon: item.icon,
                date: (/* @__PURE__ */ new Date()).toISOString()
              });
              Toast.showToast(`\u{1F389} \u5151\u6362\u6210\u529F\uFF01\u5FEB\u53BB\u4EAB\u53D7\u4F60\u7684\u3010${itemName}\u3011\u5427~`, "success");
              this._updateBalanceDisplay(panel);
              this._updateTodaySpentDisplay(panel);
              this._updateItemsList(panel);
            } else {
              Toast.showToast("\u53EF\u7528\u4F59\u989D\u4E0D\u8DB3\uFF0C\u4ECA\u65E5\u6536\u5165\u6B21\u65E5\u624D\u53EF\u4F7F\u7528\u54E6", "error");
            }
          }
          return;
        }
        panel.querySelectorAll(".shop-sort-menu").forEach((m) => {
          m.style.display = "none";
        });
      });
      this._sortOutsideClickHandler = (e) => {
        if (!e.target.closest(".shop-sort-dropdown")) {
          panel.querySelectorAll(".shop-sort-menu").forEach((m) => {
            m.style.display = "none";
          });
        }
      };
      document.addEventListener("mousedown", this._sortOutsideClickHandler);
      this._bindHistoryEvents(panel);
    },
    _bindHistoryEvents(panel) {
      const container = panel.querySelector("#history-content-container");
      if (!container) return;
      container.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-history-action]");
        if (!btn) return;
        const action = btn.dataset.historyAction;
        const now = /* @__PURE__ */ new Date();
        const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        if (action === "prev-month") {
          const base = this._currentHistoryMonth || curMonth;
          const [y, m] = base.split("-").map(Number);
          const d = new Date(y, m - 2, 1);
          this._currentHistoryMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          this._renderHistoryTab(panel);
        } else if (action === "next-month") {
          const base = this._currentHistoryMonth || curMonth;
          const [y, m] = base.split("-").map(Number);
          const d = new Date(y, m, 1);
          const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (nextMonth <= curMonth) {
            this._currentHistoryMonth = nextMonth;
            this._renderHistoryTab(panel);
          }
        } else if (action === "all") {
          this._currentHistoryMonth = null;
          this._renderHistoryTab(panel);
        } else if (action.startsWith("month:")) {
          this._currentHistoryMonth = action.slice(6);
          this._renderHistoryTab(panel);
        }
      });
    },
    _renderHistoryTab(panel) {
      const container = panel.querySelector("#history-content-container");
      if (!container) return;
      const { purchaseHistory } = store.getState();
      const month = this._currentHistoryMonth;
      const now = /* @__PURE__ */ new Date();
      const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = month ? (() => {
        const [y, mm] = month.split("-");
        return `${parseInt(mm)}\u6708 \xB7 ${y}`;
      })() : "\u5168\u90E8\u8BB0\u5F55";
      const canPrev = true;
      const canNext = month !== null && month < curMonth;
      const icon = (name, size = 14) => typeof LucideUtils !== "undefined" ? LucideUtils.createIcon(name, { size }) : "";
      let records = purchaseHistory.records || [];
      let isArchived = false;
      let archiveData = null;
      if (month) {
        const filtered = records.filter((r) => (r.month || r.date.slice(0, 7)) === month);
        if (filtered.length > 0) {
          records = filtered;
        } else if (purchaseHistory.archive && purchaseHistory.archive[month]) {
          isArchived = true;
          archiveData = purchaseHistory.archive[month];
          records = [];
        } else {
          records = [];
        }
      }
      let summaryHtml = "";
      if (month && !isArchived) {
        const totalSpent = records.reduce((s, r) => s + r.price, 0);
        summaryHtml = `
                <div class="shop-history-summary">
                    <span class="shop-history-summary-text">\u5171 ${records.length} \u7B14\u6D88\u8D39</span>
                    <span class="shop-history-summary-amount">\xA5${totalSpent}</span>
                </div>`;
      } else if (isArchived && archiveData) {
        summaryHtml = `
                <div class="shop-history-summary">
                    <span class="shop-history-summary-text">\u5F52\u6863\u6C47\u603B \xB7 ${archiveData.totalCount} \u7B14</span>
                    <span class="shop-history-summary-amount">\xA5${archiveData.totalSpent}</span>
                </div>`;
      } else if (!month) {
        const totalAll = records.reduce((s, r) => s + r.price, 0);
        summaryHtml = `
                <div class="shop-history-summary">
                    <span class="shop-history-summary-text">\u8FD1\u671F ${records.length} \u7B14</span>
                    <span class="shop-history-summary-amount">\xA5${totalAll}</span>
                </div>`;
      }
      let listHtml = "";
      if (isArchived && archiveData && archiveData.items) {
        listHtml = Object.entries(archiveData.items).map(([id, info]) => {
          const item = this._findItem(id);
          return `
                    <div class="shop-history-row">
                        <div class="shop-history-icon">${item ? item.icon : "\u{1F6CD}\uFE0F"}</div>
                        <div class="shop-history-info">
                            <div class="shop-history-name">${item ? item.name : id}</div>
                            <div class="shop-history-meta">\u8D2D\u4E70 ${info.count} \u6B21</div>
                        </div>
                        <div class="shop-history-price">-\xA5${info.totalPrice}</div>
                    </div>`;
        }).join("");
      } else if (records.length > 0) {
        listHtml = records.map((record) => {
          const d = new Date(record.date);
          const day = d.getDate();
          const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          return `
                    <div class="shop-history-row">
                        <div class="shop-history-icon">${record.icon || "\u{1F6CD}\uFE0F"}</div>
                        <div class="shop-history-info">
                            <div class="shop-history-name">${record.name}</div>
                            <div class="shop-history-meta">${day}\u65E5 ${time}</div>
                        </div>
                        <div class="shop-history-price">-\xA5${record.price}</div>
                    </div>`;
        }).join("");
      } else {
        listHtml = `
                <div class="shop-history-empty">
                    <div class="shop-history-empty-icon">\u{1F343}</div>
                    <div class="shop-history-empty-text">${month ? "\u8BE5\u6708\u65E0\u6D88\u8D39\u8BB0\u5F55" : "\u6682\u65E0\u6D88\u8D39\u8BB0\u5F55"}</div>
                    <div class="shop-history-empty-hint">${month ? "" : "\u5B8C\u6210\u4EFB\u52A1\u6323\u7AF9\u5E01\uFF0C\u5956\u52B1\u81EA\u5DF1\u5427"}</div>
                </div>`;
      }
      const archiveKeys = Object.keys(purchaseHistory.archive || {}).sort().reverse();
      let archiveNavHtml = "";
      if (archiveKeys.length > 0) {
        archiveNavHtml = `
                <div class="shop-archive-nav">
                    <div class="shop-archive-nav-header">\u5F52\u6863\u6708\u4EFD</div>
                    <div class="shop-archive-nav-buttons">
                        ${archiveKeys.map((k) => {
          const a = purchaseHistory.archive[k];
          const [, mm] = k.split("-");
          const active = month === k;
          return `<button class="shop-archive-month-btn ${active ? "is-active" : ""}" data-history-action="month:${k}">${parseInt(mm)}\u6708 \xB7 \xA5${a.totalSpent}</button>`;
        }).join("")}
                    </div>
                </div>`;
      }
      const arrowBtnBase = "shop-history-arrow";
      container.innerHTML = `
            <!-- \u6708\u4EFD\u5BFC\u822A -->
            <div class="shop-history-nav">
                <button class="${arrowBtnBase}" data-history-action="prev-month" ${!canPrev ? "disabled" : ""}>${icon("chevronLeft", 16)}</button>
                <span class="shop-history-month-label">${monthLabel}</span>
                <button class="${arrowBtnBase}" data-history-action="next-month" ${!canNext ? "disabled" : ""}>${icon("chevronRight", 16)}</button>
                ${month ? `<button class="shop-history-all-btn" data-history-action="all">\u5168\u90E8</button>` : `<span class="shop-history-current-tag">\u5F53\u524D</span>`}
            </div>
            ${summaryHtml}
            <div class="purchase-history-list">
                ${listHtml}
            </div>
            ${archiveNavHtml}
        `;
    },
    _findItem(id) {
      this._ensureIndex();
      return this._itemIndex[id] || null;
    }
  };
  window.ShopManager = ShopManager2;

  // assets/scripts/utils/htmlUtils.js
  var htmlUtils_exports = {};
  __export(htmlUtils_exports, {
    HTMLUtils: () => HTMLUtils2
  });
  var HTMLUtils2 = {
    escapeHtml(str) {
      if (str === null || str === void 0) return "";
      const div = document.createElement("div");
      div.textContent = String(str);
      return div.innerHTML;
    },
    escapeHtmlAttr(str) {
      if (str === null || str === void 0) return "";
      return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    setSafeContent(el, html, allowHtml) {
      if (allowHtml) {
        el.innerHTML = html;
      } else {
        el.textContent = html;
      }
    },
    setSafeHTML(el, html) {
      el.textContent = html;
    },
    createSafeElement(tag, attrs = {}, text) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === "className") {
          el.className = value;
        } else if (key === "onClick") {
          el.addEventListener("click", value);
        } else if (key.startsWith("data-")) {
          el.setAttribute(key, value);
        } else {
          el[key] = value;
        }
      });
      if (text !== void 0) el.textContent = text;
      return el;
    },
    sanitizeHTML(html) {
      return this.escapeHtml(html);
    },
    stripAllTags(html) {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || "";
    }
  };
  window.HTMLUtils = HTMLUtils2;
  window.escapeHtml = HTMLUtils2.escapeHtml;

  // assets/scripts/utils/toast.js
  var toast_exports = {};
  __export(toast_exports, {
    Toast: () => Toast2,
    ToastManager: () => ToastManager
  });
  var ToastManager = class {
    constructor() {
      this.container = null;
      this.queue = [];
      this.defaultDuration = 3e3;
      this.maxVisible = 3;
      this.init();
    }
    init() {
      if (this.container) return;
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      this.container.setAttribute("aria-live", "polite");
      this.container.setAttribute("aria-label", "\u901A\u77E5");
      modalMount().appendChild(this.container);
    }
    show(options = {}) {
      const toast = {
        id: options.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: options.message || "",
        type: options.type || "info",
        title: options.title || "",
        duration: options.duration !== void 0 ? options.duration : this.defaultDuration,
        dismissible: options.dismissible !== false,
        actions: options.actions || [],
        onShow: options.onShow,
        onHide: options.onHide,
        onClick: options.onClick
      };
      if (this.queue.length >= this.maxVisible) {
        this.hideOldest();
      }
      this.queue.push(toast);
      this.render();
    }
    hideOldest() {
      if (this.queue.length > 0) {
        const oldest = this.queue.shift();
        this.removeToastElement(oldest.id);
      }
    }
    render() {
      this.cleanup();
      this.queue.forEach((toast, index) => {
        if (!byId(toast.id)) {
          const element = this.createToastElement(toast);
          this.container.appendChild(element);
          requestAnimationFrame(() => {
            element.classList.add("toast-visible");
          });
          if (toast.onShow) {
            toast.onShow(element);
          }
          if (toast.duration > 0) {
            toast.timeoutId = setTimeout(() => {
              this.hide(toast.id);
            }, toast.duration);
          }
        }
      });
    }
    createToastElement(toast) {
      const element = document.createElement("div");
      element.id = toast.id;
      element.className = `toast toast-${toast.type}`;
      element.setAttribute("role", "alert");
      if (toast.onClick) {
        element.style.cursor = "pointer";
        element.addEventListener("click", () => {
          if (toast.onClick) {
            toast.onClick(toast);
          }
        });
      }
      const icon = this.getIcon(toast.type);
      const titleHtml = toast.title ? `<div class="toast-title">${HTMLUtils.escapeHtml(toast.title)}</div>` : "";
      const messageHtml = `<div class="toast-message">${HTMLUtils.escapeHtml(toast.message)}</div>`;
      let actionsHtml = "";
      if (toast.actions.length > 0) {
        actionsHtml = '<div class="toast-actions">';
        toast.actions.forEach((action) => {
          actionsHtml += `<button class="toast-action-btn" data-action="${HTMLUtils.escapeHtmlAttr(action.id)}">${HTMLUtils.escapeHtml(action.label)}</button>`;
        });
        actionsHtml += "</div>";
      }
      const closeBtn = toast.dismissible ? `<button class="toast-close-btn" aria-label="\u5173\u95ED" data-action="toast-hide" data-toast-id="${toast.id}">\xD7</button>` : "";
      element.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-body">
                ${titleHtml}
                ${messageHtml}
                ${actionsHtml}
            </div>
            ${closeBtn}
        `;
      if (toast.actions.length > 0) {
        element.addEventListener("click", (e) => {
          const actionBtn = e.target.closest(".toast-action-btn");
          if (actionBtn) {
            const actionId = actionBtn.dataset.action;
            const action = toast.actions.find((a) => a.id === actionId);
            if (action && action.callback) {
              action.callback(toast);
            }
          }
        });
      }
      return element;
    }
    getIcon(type) {
      const icons = {
        success: LucideUtils.createIcon("check", { size: 16 }),
        error: LucideUtils.createIcon("x", { size: 16 }),
        warning: LucideUtils.createIcon("alertTriangle", { size: 16 }),
        info: LucideUtils.createIcon("info", { size: 16 }),
        loading: LucideUtils.createIcon("refreshCw", { size: 16 })
      };
      return icons[type] || icons.info;
    }
    hide(id) {
      const index = this.queue.findIndex((t) => t.id === id);
      if (index === -1) return;
      const toast = this.queue[index];
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      const element = byId(id);
      if (element) {
        element.classList.remove("toast-visible");
        element.classList.add("toast-hiding");
        setTimeout(() => {
          this.removeToastElement(id);
        }, 300);
      }
      this.queue.splice(index, 1);
      if (toast.onHide) {
        toast.onHide();
      }
    }
    removeToastElement(id) {
      const element = byId(id);
      if (element) {
        element.remove();
      }
    }
    cleanup() {
      const elements = this.container.querySelectorAll(".toast");
      elements.forEach((el) => {
        if (!this.queue.find((t) => t.id === el.id)) {
          el.remove();
        }
      });
    }
    clear() {
      this.queue.forEach((toast) => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId);
        }
      });
      this.queue = [];
      this.container.innerHTML = "";
    }
    success(message, options = {}) {
      return this.show({ ...options, message, type: "success" });
    }
    error(message, options = {}) {
      return this.show({ ...options, message, type: "error", duration: options.duration || 5e3 });
    }
    warning(message, options = {}) {
      return this.show({ ...options, message, type: "warning" });
    }
    info(message, options = {}) {
      return this.show({ ...options, message, type: "info" });
    }
    loading(message, options = {}) {
      return this.show({ ...options, message, type: "loading", dismissible: false });
    }
    /**
     * 无障碍播报：向 sr-announcements 区域写入消息
     */
    announce(message, priority = "polite") {
      const announcer = byId("sr-announcements");
      if (announcer) {
        announcer.setAttribute("aria-live", priority);
        announcer.textContent = message;
        setTimeout(() => {
          announcer.textContent = "";
        }, 1e3);
      }
    }
    /**
     * 向后兼容的便捷方法：Toast.showToast(message, type)
     * 替代原 store.showToast(message, type)
     */
    showToast(message, type = "success") {
      const durationMap = { success: 3e3, error: 5e3, warning: 4e3, info: 3e3 };
      const announcePriority = type === "error" ? "assertive" : "polite";
      this.announce(message, announcePriority);
      return this.show({ message, type, duration: durationMap[type] || 3e3 });
    }
  };
  var Toast2 = new ToastManager();
  ActionDispatcher.registerMany({
    "toast-hide": (ds) => Toast2.hide(ds.toastId)
  });
  window.Toast = Toast2;

  // assets/scripts/storage/bridge.js
  var bridge_exports = {};
  __export(bridge_exports, {
    BridgeStorage: () => BridgeStorage,
    storageManager: () => storageManager2
  });
  var BridgeStorage = class {
    constructor() {
      this.ready = false;
      this.fallbackMode = false;
      this._pendingRequests = /* @__PURE__ */ new Map();
      this._goalWriteChain = Promise.resolve();
      this.sectionConfig = null;
      this.customNoises = null;
      this._messageHandler = this._onMessage.bind(this);
      window.addEventListener("message", this._messageHandler);
      this.initPromise = this.initialize();
    }
    async initialize() {
      this.ready = true;
      try {
        const readyResp = await this._send("app:ready", {});
        if (readyResp && readyResp.sectionConfig) {
          this.sectionConfig = readyResp.sectionConfig;
        }
        if (readyResp && readyResp.customThemes && Array.isArray(readyResp.customThemes)) {
          this._handleCustomThemes(readyResp.customThemes);
        }
        if (readyResp && readyResp.customNoises && Array.isArray(readyResp.customNoises)) {
          this.customNoises = readyResp.customNoises;
          if (typeof WhiteNoiseManager !== "undefined") {
            WhiteNoiseManager.customNoises = this.customNoises;
            if (typeof NoisePanel !== "undefined" && NoisePanel.panelVisible) {
              NoisePanel._rebuild();
            }
          }
        }
        if (readyResp && typeof readyResp.syncPaletteToObsidian === "boolean") {
          this.syncPaletteToObsidian = readyResp.syncPaletteToObsidian;
        }
      } catch (e) {
        console.warn("[Bridge] Failed to get sectionConfig from plugin:", e.message);
      }
      if (typeof SectionRegistry !== "undefined" && SectionRegistry.applyBridgeConfig) {
        SectionRegistry.applyBridgeConfig();
      }
      setTimeout(() => {
        if (typeof EventBus !== "undefined") {
          EventBus.emit("storage:initialized", {
            adapter: "bridge",
            fallback: false
          });
        }
      }, 0);
    }
    /** 发送请求到父窗口并等待响应 */
    _send(type, payload) {
      return new Promise((resolve, reject) => {
        const id = "req_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
        const timeout = setTimeout(() => {
          this._pendingRequests.delete(id);
          reject(new Error(`Bridge request timeout: ${type}`));
        }, 1e4);
        this._pendingRequests.set(id, { resolve, reject, timeout });
        try {
          window.parent.postMessage({ type, id, payload }, window.parent.origin || "*");
        } catch {
          window.parent.postMessage({ type, id, payload }, "*");
        }
      });
    }
    /** 接收父窗口的响应 */
    _onMessage(event) {
      if (event.source !== window.parent) return;
      const data = event.data;
      if (!data) return;
      if (data.type === "app:theme") {
        if (typeof store !== "undefined" && data.payload) {
          const state = store.getState ? store.getState() : store.state;
          if (state && state.ui && state.ui.autoSyncTheme === false) return;
          const isDark = data.payload.isDark;
          store.setDarkMode(isDark);
        }
        return;
      }
      if (data.type === "theme:syncPaletteEnabled" && data.payload) {
        this.syncPaletteToObsidian = data.payload.enabled;
        return;
      }
      if (!data.id) return;
      const pending = this._pendingRequests.get(data.id);
      if (!pending) return;
      this._pendingRequests.delete(data.id);
      clearTimeout(pending.timeout);
      if (data.error) {
        pending.reject(new Error(data.error));
      } else {
        pending.resolve(data.payload !== void 0 ? data.payload : null);
      }
    }
    // ---- 与 storageManager.js 完全一致的接口 ----
    async ensureReady() {
      if (!this.ready) {
        await this.initPromise;
      }
    }
    async getDay(date) {
      await this.ensureReady();
      return this._send("storage:readDay", { dateKey: date });
    }
    async getAllDays() {
      await this.ensureReady();
      return this._send("storage:listDays", {});
    }
    /** 获取所有日期 key（降序，最新在前）— 轻量，只返回 key 列表 */
    async getDayKeys() {
      await this.ensureReady();
      return this._send("storage:getDayKeys", {});
    }
    /**
     * 分页加载日期数据
     * @param {number} page - 页码（从 0 开始）
     * @param {number} pageSize - 每页数量，默认 30
     * @returns {Promise<{ days: Object, keys: string[], total: number, page: number, pageSize: number, hasMore: boolean }>}
     */
    async getDaysPaginated(page = 0, pageSize = 30) {
      await this.ensureReady();
      return this._send("storage:getDaysPaginated", { page, pageSize });
    }
    async putDay(dayData) {
      await this.ensureReady();
      return this._send("storage:writeDay", {
        dateKey: dayData.date,
        data: dayData
      });
    }
    async deleteDay(date) {
      await this.ensureReady();
      return this._send("storage:deleteDay", { dateKey: date });
    }
    async getSetting(key) {
      await this.ensureReady();
      return this._send("storage:getSetting", { key });
    }
    async putSetting(key, value) {
      await this.ensureReady();
      return this._send("storage:putSetting", { key, value });
    }
    async getAllSettings() {
      await this.ensureReady();
      return this._send("storage:getAllSettings", {});
    }
    async getGoals() {
      await this.ensureReady();
      return this._send("storage:getGoals", {});
    }
    async putGoals(goals) {
      await this.ensureReady();
      return this._send("storage:putGoals", { goals });
    }
    async putGoal(goal) {
      await this.ensureReady();
      this._goalWriteChain = this._goalWriteChain.then(async () => {
        const goals = await this.getGoals() || [];
        const index = goals.findIndex((g) => g.id === goal.id);
        if (index >= 0) {
          goals[index] = goal;
        } else {
          goals.push(goal);
        }
        return this.putGoals(goals);
      });
      return this._goalWriteChain;
    }
    async deleteGoal(goalId) {
      await this.ensureReady();
      this._goalWriteChain = this._goalWriteChain.then(async () => {
        const goals = await this.getGoals() || [];
        const filtered = goals.filter((g) => g.id !== goalId);
        return this.putGoals(filtered);
      });
      return this._goalWriteChain;
    }
    async getPurchaseHistory() {
      await this.ensureReady();
      return this._send("storage:getPurchaseHistory", {});
    }
    async putPurchaseHistory(data) {
      await this.ensureReady();
      return this._send("storage:putPurchaseHistory", { data });
    }
    async getIncomeHistory() {
      await this.ensureReady();
      return this._send("storage:getIncomeHistory", {});
    }
    async putIncomeHistory(data) {
      await this.ensureReady();
      return this._send("storage:putIncomeHistory", { data });
    }
    async exportAllData() {
      await this.ensureReady();
      return this._send("storage:exportAll", {});
    }
    async importData(data, options = {}) {
      await this.ensureReady();
      return this._send("storage:importAll", { data, options });
    }
    async clearAll() {
      await this.ensureReady();
      return this._send("storage:clearAll", {});
    }
    // ---- 板块配置持久化 ----
    getSectionConfig() {
      return this.sectionConfig;
    }
    async saveSectionConfig(config) {
      this.sectionConfig = config;
      try {
        return await this._send("app:saveSectionConfig", config);
      } catch (e) {
        if (typeof localStorage !== "undefined") {
          StorageAdapter.set(StorageKeys.SECTION_CONFIG, JSON.stringify(config));
        }
      }
    }
    // ---- 自定义白噪音音源持久化 ----
    getCustomNoises() {
      return this.customNoises;
    }
    async saveCustomNoises(noises) {
      this.customNoises = noises;
      try {
        return await this._send("app:saveCustomNoises", noises);
      } catch (e) {
        if (typeof localStorage !== "undefined") {
          StorageAdapter.set(StorageKeys.WHITENOISE_CUSTOM, JSON.stringify(noises));
        }
      }
    }
    // ---- 读取 Obsidian Vault 内的文件 ----
    async getFile(filename) {
      const name = (filename || "").trim();
      if (!name) return "";
      await this.ensureReady();
      try {
        const content = await this._send("file:get", { filename: name });
        return typeof content === "string" ? content : "";
      } catch (e) {
        console.warn("[Bridge] getFile(" + name + ") failed:", e.message);
        return "";
      }
    }
    getCurrentAdapterType() {
      return "bridge";
    }
    /** 注册插件推送的自定义主题 */
    _handleCustomThemes(themes) {
      if (!themes || themes.length === 0) return;
      if (typeof ThemeEffects === "undefined") return;
      for (const t of themes) {
        try {
          window.ThemeEffects.registerExternal(t.name, t.code);
        } catch (e) {
          console.warn(`[Bridge] \u81EA\u5B9A\u4E49\u4E3B\u9898 "${t.name}" \u6CE8\u518C\u5931\u8D25:`, e.message);
        }
      }
    }
    isFallbackMode() {
      return this.fallbackMode;
    }
    destroy() {
      window.removeEventListener("message", this._messageHandler);
      this._pendingRequests.clear();
    }
  };
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const data = event.data;
    if (!data) return;
    if (data.type === "theme:followDisabled") {
      if (typeof window.DisplayManager !== "undefined" && window.DisplayManager._restoreUserHue) {
        window.DisplayManager._restoreUserHue();
      }
      if (typeof window.DisplayManager !== "undefined" && window.DisplayManager._restoreUserBg) {
        window.DisplayManager._restoreUserBg();
      }
      if (typeof window.DisplayManager !== "undefined" && window.DisplayManager._restoreUserText) {
        window.DisplayManager._restoreUserText();
      }
      return;
    }
    if (data.type !== "theme:changed") return;
    if (data.payload && typeof data.payload.isDark === "boolean") {
      if (typeof store !== "undefined") {
        const state = store.getState ? store.getState() : store.state;
        if (!(state && state.ui && state.ui.autoSyncTheme === false)) {
          store.setDarkMode(data.payload.isDark);
        }
      }
    }
    if (data.payload && typeof data.payload.hue === "number") {
      if (typeof window.DisplayManager !== "undefined" && window.DisplayManager._applyHue) {
        window.DisplayManager._applyHue(data.payload.hue, true);
      }
    }
    if (data.payload && typeof data.payload.bg === "string") {
      if (typeof window.DisplayManager !== "undefined" && window.DisplayManager._applyObsidianBg) {
        window.DisplayManager._applyObsidianBg(data.payload.bg, true);
      }
    }
    if (data.payload && (typeof data.payload.textNormal === "string" || typeof data.payload.textMuted === "string")) {
      if (typeof window.DisplayManager !== "undefined" && window.DisplayManager._applyObsidianText) {
        window.DisplayManager._applyObsidianText(data.payload.textNormal, data.payload.textMuted, true);
      }
    }
  });
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const data = event.data;
    if (typeof store === "undefined" || typeof Handlers === "undefined") return;
    switch (data.type) {
      case "nav:prevDay":
        store.navigateDate(-1);
        break;
      case "nav:nextDay":
        store.navigateDate(1);
        break;
      case "nav:today":
        store.goToDate(/* @__PURE__ */ new Date());
        break;
      case "action:openStats":
        if (typeof StatsModal !== "undefined") StatsModal.open();
        break;
      case "action:openSettings":
        if (typeof SettingsModal !== "undefined") Handlers.openSettingsModal();
        break;
    }
  });
  var storageManager2 = new BridgeStorage();
  window.storageManager = storageManager2;

  // assets/scripts/state/dataValidator.js
  var dataValidator_exports = {};
  __export(dataValidator_exports, {
    DataValidator: () => DataValidator2
  });
  var DataValidator2 = {
    VALID_METRICS: ["firstCheckIn", "completedTasks", "inspirationCount", "lastCheckIn", "activeTime", "emptySlots"],
    validateDayData: function(data) {
      var errors = [];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
        errors.push("\u65E0\u6548\u65E5\u671F\u683C\u5F0F: " + data.date);
      }
      if (data.metrics) {
        Object.keys(data.metrics).forEach(function(key) {
          if (DataValidator2.VALID_METRICS.indexOf(key) === -1) {
            errors.push("\u672A\u77E5\u6307\u6807: " + key);
          }
        });
      }
      if (data.goals && Array.isArray(data.goals)) {
        data.goals.forEach(function(goal, i) {
          if (!goal.title || typeof goal.title !== "string") errors.push("goals[" + i + "] \u7F3A\u5C11\u6709\u6548 title");
          if (goal.items && !Array.isArray(goal.items)) errors.push("goals[" + i + "] items \u5FC5\u987B\u662F\u6570\u7EC4");
          if (goal.items && Array.isArray(goal.items)) {
            goal.items.forEach(function(item, j) {
              if (!item.name || typeof item.name !== "string") errors.push("goals[" + i + "].items[" + j + "] \u7F3A\u5C11\u6709\u6548 name");
              if (typeof item.percent !== "number" || item.percent < 0 || item.percent > 100) {
                errors.push("goals[" + i + "].items[" + j + "] percent \u5E94\u4E3A 0-100 \u7684\u6570\u5B57");
              }
            });
          }
        });
      }
      return errors;
    },
    sanitizeDayData: function(data) {
      if (data.metrics) {
        Object.keys(data.metrics).forEach(function(key) {
          if (DataValidator2.VALID_METRICS.indexOf(key) === -1) {
            delete data.metrics[key];
          }
        });
      }
      return data;
    },
    migrateToV2: function(dayData) {
      if (dayData.metrics) return dayData;
      var metrics = {
        firstCheckIn: dayData.firstCheckIn || "--:--",
        completedTasks: dayData.completedTasks || "0/0",
        inspirationCount: dayData.inspirationCount || "0",
        lastCheckIn: dayData.lastCheckIn || "--:--",
        activeTime: dayData.activeTime || "0h",
        emptySlots: dayData.emptySlots || "0"
      };
      var result = Object.assign({}, dayData, { metrics });
      delete result.firstCheckIn;
      delete result.completedTasks;
      delete result.inspirationCount;
      delete result.lastCheckIn;
      delete result.activeTime;
      delete result.emptySlots;
      delete result.kpi;
      return result;
    },
    validateGoals: function(goals) {
      var errors = [];
      if (!Array.isArray(goals)) return errors;
      var seenIds = {};
      goals.forEach(function(goal, i) {
        if (!goal.id) errors.push("goals[" + i + "] \u7F3A\u5C11 id");
        else if (seenIds[goal.id]) errors.push("goals[" + i + "] id \u91CD\u590D: " + goal.id);
        else seenIds[goal.id] = true;
        if (goal.items && Array.isArray(goal.items)) {
          goal.items.forEach(function(item, j) {
            var start = parseFloat(item.startValue);
            var target = parseFloat(item.targetValue);
            var current = parseFloat(item.currentValue);
            if (!isNaN(start) && !isNaN(target) && !isNaN(current)) {
              var minVal = Math.min(start, target);
              var maxVal = Math.max(start, target);
              if (current < minVal || current > maxVal) {
                errors.push("goals[" + i + "].items[" + j + "] currentValue " + current + " \u8D85\u51FA [" + minVal + ", " + maxVal + "] \u8303\u56F4");
              }
            }
          });
        }
      });
      return errors;
    },
    sanitizeGoals: function(goals) {
      if (!Array.isArray(goals)) return goals;
      var seenIds = {};
      goals.forEach(function(goal) {
        if (!goal.id) {
          goal.id = "goal_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
        }
        if (seenIds[goal.id]) {
          goal.id = "goal_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
        }
        seenIds[goal.id] = true;
        if (goal.items && Array.isArray(goal.items)) {
          goal.items.forEach(function(item) {
            var start = parseFloat(item.startValue);
            var target = parseFloat(item.targetValue);
            var current = parseFloat(item.currentValue);
            if (!isNaN(start) && !isNaN(target) && !isNaN(current)) {
              var minVal = Math.min(start, target);
              var maxVal = Math.max(start, target);
              if (current < minVal) item.currentValue = String(minVal);
              else if (current > maxVal) item.currentValue = String(maxVal);
            }
          });
        }
      });
      return goals;
    },
    cleanupTimeline: function(dayData) {
      if (!dayData.timeline || !Array.isArray(dayData.timeline)) {
        dayData.timeline = [];
        return dayData;
      }
      var PERIOD_MAP = {
        lateNight: { name: "\u51CC\u6668", time: "00:00 - 04:00", icon: "moon" },
        dawn: { name: "\u9ECE\u660E", time: "04:00 - 05:30", icon: "sunrise" },
        earlyMorning: { name: "\u6E05\u6668", time: "05:30 - 07:00", icon: "sun" },
        morning: { name: "\u4E0A\u5348", time: "07:00 - 12:00", icon: "briefcase" },
        midday: { name: "\u4E2D\u5348", time: "12:00 - 13:00", icon: "utensils" },
        afternoon: { name: "\u4E0B\u5348", time: "13:00 - 17:00", icon: "sun" },
        dusk: { name: "\u508D\u665A", time: "17:00 - 18:30", icon: "sunset" },
        evening: { name: "\u665A\u4E0A", time: "18:30 - 22:00", icon: "coffee" },
        night: { name: "\u6DF1\u591C", time: "22:00 - 24:00", icon: "moon" }
      };
      var VALID_PERIODS = Object.keys(PERIOD_MAP);
      dayData.timeline = dayData.timeline.filter(function(period) {
        return period.period && VALID_PERIODS.indexOf(period.period) !== -1;
      });
      dayData.timeline.forEach(function(period) {
        var correctConfig = PERIOD_MAP[period.period];
        if (correctConfig) {
          if (!period.name) period.name = correctConfig.name;
          if (!period.time) period.time = correctConfig.time;
          if (!period.icon) period.icon = correctConfig.icon;
        }
      });
      dayData.timeline = dayData.timeline.filter(function(period) {
        return period.items && period.items.length > 0;
      });
      return dayData;
    }
  };
  if (typeof window !== "undefined") {
    window.DataValidator = DataValidator2;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DataValidator2;
  }

  // _bundle_entry.js
  var _m15 = __toESM(require_defaultData());

  // assets/scripts/services/searchService.js
  var searchService_exports = {};
  __export(searchService_exports, {
    SearchService: () => SearchService2
  });
  var SearchService2 = function() {
    "use strict";
    var METRICS_FIELDS = [
      { key: "firstCheckIn", label: "\u9996\u6B21\u6253\u5361" },
      { key: "completedTasks", label: "\u5B8C\u6210\u4EFB\u52A1" },
      { key: "inspirationCount", label: "\u7075\u611F" },
      { key: "lastCheckIn", label: "\u672B\u6B21\u6253\u5361" }
    ];
    var FALLBACK_FIELDS = ["note", "overall", "checklist", "diagnosis", "actionPlan", "deepReview"];
    function _dayContainsText(day, lowerQuery) {
      for (var i = 0; i < FALLBACK_FIELDS.length; i++) {
        var val = day[FALLBACK_FIELDS[i]];
        if (val && String(val).toLowerCase().indexOf(lowerQuery) !== -1) return true;
      }
      return false;
    }
    function search(data, globalGoals, query) {
      if (!data || !query) return [];
      var results = [];
      var lowerQuery = query.toLowerCase();
      Object.keys(data).forEach(function(dateKey) {
        var day = data[dateKey];
        var matches = [];
        var metrics = day.metrics || day;
        METRICS_FIELDS.forEach(function(field) {
          var val = metrics[field.key];
          if (val && String(val).toLowerCase().indexOf(lowerQuery) !== -1) {
            matches.push({ field: field.label, value: String(val) });
          }
        });
        var timeline = day.timeline || [];
        var hasTimelineMatch = timeline.some(function(t) {
          if (t.name && t.name.toLowerCase().indexOf(lowerQuery) !== -1) return true;
          return (t.items || []).some(function(item) {
            return item.task && item.task.toLowerCase().indexOf(lowerQuery) !== -1;
          });
        });
        if (hasTimelineMatch) {
          var matched = timeline.find(function(t) {
            if (t.name && t.name.toLowerCase().indexOf(lowerQuery) !== -1) return true;
            return (t.items || []).some(function(item) {
              return item.task && item.task.toLowerCase().indexOf(lowerQuery) !== -1;
            });
          });
          var matchedItem = (matched.items || []).find(function(item) {
            return item.task && item.task.toLowerCase().indexOf(lowerQuery) !== -1;
          });
          matches.push({ field: "\u6D3B\u52A8", value: matchedItem ? matchedItem.task : matched.name });
        }
        var matchedGoal = (day.goals || []).find(function(g) {
          return g.title && g.title.toLowerCase().indexOf(lowerQuery) !== -1;
        });
        if (matchedGoal) {
          matches.push({ field: "\u76EE\u6807", value: matchedGoal.title });
        }
        if (matches.length === 0 && globalGoals) {
          var globalMatch = globalGoals.find(function(g) {
            return g.title && g.title.toLowerCase().indexOf(lowerQuery) !== -1;
          });
          if (globalMatch) {
            matches.push({ field: "\u76EE\u6807", value: globalMatch.title });
          }
        }
        if (matches.length > 0 || _dayContainsText(day, lowerQuery)) {
          results.push({
            date: dateKey,
            weekday: day.weekday,
            matches: matches.slice(0, 3)
          });
        }
      });
      return results.sort(function(a, b) {
        return b.date.localeCompare(a.date);
      });
    }
    return { search };
  }();
  if (typeof window !== "undefined") {
    window.SearchService = SearchService2;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SearchService2;
  }

  // assets/scripts/state/store.js
  var store_exports = {};
  __export(store_exports, {
    Store: () => Store,
    store: () => store2
  });

  // assets/scripts/state/undoRedoManager.js
  var UndoRedoManager = class {
    /**
     * @param {{ data, undoStack, redoStack }} state — Store 的状态对象引用
     * @param {function} onStateChanged — 状态变化回调（通知 UI 更新）
     */
    constructor(state, onStateChanged) {
      this._state = state;
      this._onChange = onStateChanged || (() => {
      });
    }
    /** 推入撤销栈（在修改前调用） */
    push(dateKey, dayData) {
      const dataCopy = structuredClone(dayData || {});
      this._state.undoStack.push({ key: dateKey, data: dataCopy });
      const maxStackSize = 50;
      if (this._state.undoStack.length > maxStackSize) {
        this._state.undoStack.shift();
      }
      this._state.redoStack = [];
      this._onChange();
    }
    /** 撤销 */
    undo(currentKey) {
      if (this._state.undoStack.length === 0) return null;
      const currentData = structuredClone(this._state.data[currentKey] || {});
      this._state.redoStack.push({ key: currentKey, data: currentData });
      const prev = this._state.undoStack.pop();
      this._onChange();
      return prev;
    }
    /** 重做 */
    redo(currentKey) {
      if (this._state.redoStack.length === 0) return null;
      const currentData = structuredClone(this._state.data[currentKey] || {});
      this._state.undoStack.push({ key: currentKey, data: currentData });
      const next = this._state.redoStack.pop();
      this._onChange();
      return next;
    }
    canUndo() {
      return this._state.undoStack.length > 0;
    }
    canRedo() {
      return this._state.redoStack.length > 0;
    }
  };

  // assets/scripts/state/migrationService.js
  var MigrationService = class {
    /**
     * @param {object} storeState — Store 的 state 对象引用
     */
    constructor(storeState) {
      this._state = storeState;
    }
    async handleDataMigration() {
      const currentVersion = await storageManager.getSetting("dataVersion");
      if (!currentVersion) {
        await this.migrateFromV1();
      } else if (parseFloat(currentVersion) < 2) {
        await this.migrateFromV1ToV2();
      }
      if (currentVersion && parseFloat(currentVersion) < 3) {
        await this._migrateHistoryToFiles();
      } else if (!currentVersion) {
        await this._migrateHistoryToFiles();
      }
      await storageManager.putSetting("dataVersion", DATA_VERSION);
    }
    async migrateFromV1() {
      const migrated = await storageManager.getSetting("dataMigrated");
      if (!migrated) {
        await this._migrateFromLocalStorage();
      }
      await this._migrateDayDataToV2();
      await storageManager.putSetting("dataMigrated", true);
    }
    async migrateFromV1ToV2() {
      await this._migrateDayDataToV2();
    }
    async _migrateDayDataToV2() {
      const days = await storageManager.getAllDays();
      for (const [, dayData] of Object.entries(days)) {
        if (!dayData.metrics) {
          const migratedData = DataValidator.migrateToV2(dayData);
          await storageManager.putDay(migratedData);
        }
      }
    }
    async _migrateFromLocalStorage() {
      try {
        const savedData = StorageAdapter.get(StorageKeys.DAILY_REVIEW_DATA);
        if (savedData) {
          const data = JSON.parse(savedData);
          for (const [, dayData] of Object.entries(data)) {
            await storageManager.putDay(dayData);
          }
        }
        const theme = StorageAdapter.get(StorageKeys.THEME);
        await storageManager.putSetting("theme", theme || "light");
        await storageManager.putSetting("colorTheme", "bamboo");
        await storageManager.putSetting("dataMigrated", true);
      } catch (e) {
        console.error("Data migration failed:", e);
      }
    }
    async _migrateHistoryToFiles() {
      const phExists = await storageManager.getPurchaseHistory();
      if (!phExists) {
        const oldPurchases = await storageManager.getSetting("purchaseHistory");
        if (oldPurchases && Array.isArray(oldPurchases) && oldPurchases.length > 0) {
          const records = oldPurchases.map((r) => ({
            ...r,
            month: r.date ? r.date.slice(0, 7) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 7)
          }));
          this._state.purchaseHistory = { records, archive: {} };
          await storageManager.putPurchaseHistory(this._state.purchaseHistory);
        }
        await storageManager.putSetting("purchaseHistory", null);
      }
      const ihExists = await storageManager.getIncomeHistory();
      if (!ihExists) {
        const oldIncomes = await storageManager.getSetting("incomeHistory");
        if (oldIncomes && Array.isArray(oldIncomes) && oldIncomes.length > 0) {
          const records = oldIncomes.map((r) => ({
            ...r,
            month: r.date ? r.date.slice(0, 7) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 7)
          }));
          this._state.incomeHistory = { records, archive: {} };
          await storageManager.putIncomeHistory(this._state.incomeHistory);
        }
        await storageManager.putSetting("incomeHistory", null);
      }
    }
  };

  // assets/scripts/state/store.js
  var Store = class {
    constructor() {
      this.state = {
        currentDate: /* @__PURE__ */ new Date(),
        ui: {
          isDarkMode: false,
          currentTheme: "bamboo",
          autoSyncTheme: true,
          weatherEnabled: true,
          weatherCity: null,
          weatherExpanded: true,
          quoteSource: "",
          quoteEnabled: true
        },
        data: {},
        dayKeys: [],
        // 所有可用日期 key（降序，最新在前）
        globalGoals: [],
        balance: 0,
        purchaseHistory: { records: [], archive: {} },
        incomeHistory: { records: [], archive: {} },
        _statsDate: "",
        stats: {
          todayEarnings: 0,
          totalSpent: 0,
          totalEarnings: 0
        },
        undoStack: [],
        redoStack: [],
        autoSaveTimer: null,
        isDirty: false
      };
      this.listeners = [];
      this.onUndoStateChangedCallback = null;
      this._undoRedo = new UndoRedoManager(this.state, () => this.notifyUndoStateChanged());
      this._migration = new MigrationService(this.state);
      this.storageType = "indexeddb";
      this._dirtyDays = /* @__PURE__ */ new Set();
      this._dirtySettings = /* @__PURE__ */ new Set();
      this._goalsDirty = false;
      this.initPromise = this.initialize();
    }
    async initialize() {
      try {
        await storageManager.initPromise;
        await this.handleDataMigration();
        await this.loadFromStorage();
      } catch (e) {
        console.error("IndexedDB initialization failed, falling back to localStorage:", e);
        this.storageType = "localstorage";
        this.loadFromLocalStorage();
      }
      this.notify();
    }
    async handleDataMigration() {
      return this._migration.handleDataMigration();
    }
    async migrateFromV1() {
      return this._migration.migrateFromV1();
    }
    async migrateFromV1ToV2() {
      return this._migration.migrateFromV1ToV2();
    }
    async migrateDayDataToV2() {
      return this._migration._migrateDayDataToV2();
    }
    async migrateFromLocalStorage() {
      return this._migration._migrateFromLocalStorage();
    }
    async _migrateHistoryToFiles() {
      return this._migration._migrateHistoryToFiles();
    }
    loadFromLocalStorage() {
      this.loadFromStorageLegacy();
      this.loadGlobalGoals().catch((e) => console.error("Failed to load global goals from localStorage:", e));
    }
    getState() {
      return this.state;
    }
    async ready() {
      await this.initPromise;
      return this;
    }
    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter((l) => l !== listener);
      };
    }
    notify() {
      this.listeners.forEach((listener) => listener(this.state));
    }
    setState(updates) {
      Object.assign(this.state, updates);
      this.notify();
    }
    async loadFromStorage() {
      try {
        let dayKeys = [];
        try {
          dayKeys = await storageManager.getDayKeys();
        } catch (e) {
          console.warn("[Store] getDayKeys failed, falling back to getAllDays:", e.message);
          const all = await storageManager.getAllDays();
          dayKeys = Object.keys(all).sort().reverse();
        }
        this.state.dayKeys = dayKeys;
        const PAGE_SIZE = 30;
        let paginated;
        try {
          paginated = await storageManager.getDaysPaginated(0, PAGE_SIZE);
        } catch (e) {
          console.warn("[Store] getDaysPaginated failed, falling back to getAllDays:", e.message);
          paginated = {
            days: await storageManager.getAllDays(),
            keys: dayKeys.slice(0, PAGE_SIZE),
            total: dayKeys.length,
            page: 0,
            pageSize: PAGE_SIZE,
            hasMore: dayKeys.length > PAGE_SIZE
          };
        }
        const days = paginated.days;
        this.state._loadedPages = /* @__PURE__ */ new Set([0]);
        this.state._hasMoreDays = paginated.hasMore;
        if (Object.keys(days).length > 0) {
          Object.assign(this.state.data, days);
          let needSave = false;
          Object.keys(days).forEach((dateKey) => {
            if (!this.state.data[dateKey]) return;
            const originalLength = this.state.data[dateKey].timeline ? this.state.data[dateKey].timeline.length : 0;
            DataValidator.cleanupTimeline(this.state.data[dateKey]);
            const newLength = this.state.data[dateKey].timeline ? this.state.data[dateKey].timeline.length : 0;
            if (originalLength !== newLength) {
              needSave = true;
            }
          });
          if (needSave) {
            await this.saveToStorage();
          }
        } else {
          Object.assign(this.state.data, DEFAULT_DATA);
          await this.saveToStorage();
        }
        await this.loadGlobalGoals();
        const balance = await storageManager.getSetting("balance");
        if (balance !== null) {
          this.state.balance = parseFloat(balance) || 0;
        }
        const phData = await storageManager.getPurchaseHistory();
        if (phData) {
          this.state.purchaseHistory = phData;
        }
        const ihData = await storageManager.getIncomeHistory();
        if (ihData) {
          const seen = /* @__PURE__ */ new Set();
          const deduped = [];
          for (const inc of ihData.records) {
            if (inc.desc && inc.amount > 0) {
              const incDay = new Date(inc.date).toDateString();
              const key = `${incDay}::${inc.desc}`;
              if (!seen.has(key)) {
                seen.add(key);
                deduped.push(inc);
              }
            } else {
              deduped.push(inc);
            }
          }
          if (deduped.length !== ihData.records.length) {
            this.state.incomeHistory.records = deduped;
            await storageManager.putIncomeHistory(this.state.incomeHistory);
          } else {
            this.state.incomeHistory = ihData;
          }
        }
        await WalletService.archiveOldRecords();
        WalletService.recalibrateStats();
        await storageManager.putSetting("shopStats", this.state.stats);
        if (this.state.ui.weatherEnabled && typeof WeatherService !== "undefined") {
          const self = this;
          WeatherService.getWeather().then(function(w) {
            if (!w) return;
            const todayKey = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
            if (!self.state.data[todayKey]) {
              self.state.data[todayKey] = {
                date: todayKey,
                weekday: ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"][(/* @__PURE__ */ new Date()).getDay()],
                metrics: {},
                timeline: []
              };
            }
            try {
              const detail = WeatherService.formatDetail(w);
              self.state.data[todayKey].weather = {
                temperature: w.temperature,
                weatherCode: w.weatherCode,
                label: detail ? detail.label : "",
                fetchedAt: w.fetchedAt
              };
              self.scheduleAutoSave();
            } catch (e) {
            }
          }).catch(function() {
          });
        }
        const [theme, autoSyncThemeRaw, weatherEnabledRaw, weatherCityRaw, weatherExpandedRaw, quoteSourceRaw, quoteEnabledRaw] = await Promise.all([
          storageManager.getSetting("theme"),
          storageManager.getSetting("autoSyncTheme"),
          storageManager.getSetting("weatherEnabled"),
          storageManager.getSetting("weatherCity"),
          storageManager.getSetting("weatherExpanded"),
          storageManager.getSetting("quoteSource"),
          storageManager.getSetting("quoteEnabled")
        ]);
        this.state.ui.autoSyncTheme = autoSyncThemeRaw !== "false";
        this.state.ui.weatherEnabled = weatherEnabledRaw === "true";
        this.state.ui.weatherCity = weatherCityRaw && weatherCityRaw.length > 0 ? weatherCityRaw : null;
        this.state.ui.weatherExpanded = weatherExpandedRaw === "true";
        this.state.ui.quoteSource = quoteSourceRaw && quoteSourceRaw.length > 0 ? quoteSourceRaw : "";
        this.state.ui.quoteEnabled = quoteEnabledRaw === "false" ? false : true;
        if (theme === "dark") {
          this.state.ui.isDarkMode = true;
          document.documentElement.classList.add("dark");
        }
        const htmlEl = document.documentElement;
        for (let i = htmlEl.classList.length - 1; i >= 0; i--) {
          const cls = htmlEl.classList[i];
          if (cls.startsWith("theme-") && cls !== "theme-bamboo") {
            htmlEl.classList.remove(cls);
          }
        }
        htmlEl.classList.add("theme-bamboo");
        this.state.ui.currentTheme = "bamboo";
      } catch (e) {
        console.error("Failed to load from storage:", e);
        this.loadFromStorageLegacy();
      }
    }
    loadFromStorageLegacy() {
      try {
        const saved = StorageAdapter.get(StorageKeys.DAILY_REVIEW_DATA);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Object.keys(parsed).length > 0) {
            Object.assign(this.state.data, parsed);
          } else {
            Object.assign(this.state.data, DEFAULT_DATA);
            this.saveToStorageLegacy();
          }
        } else {
          Object.assign(this.state.data, DEFAULT_DATA);
          this.saveToStorageLegacy();
        }
      } catch (e) {
        console.error("Failed to load data:", e);
        Object.assign(this.state.data, DEFAULT_DATA);
        this.saveToStorageLegacy();
      }
      const theme = StorageAdapter.get(StorageKeys.THEME);
      if (theme === "dark") {
        this.state.ui.isDarkMode = true;
        document.documentElement.classList.add("dark");
      }
      const htmlElLegacy = document.documentElement;
      for (let i = htmlElLegacy.classList.length - 1; i >= 0; i--) {
        const cls = htmlElLegacy.classList[i];
        if (cls.startsWith("theme-") && cls !== "theme-bamboo") {
          htmlElLegacy.classList.remove(cls);
        }
      }
      htmlElLegacy.classList.add("theme-bamboo");
      this.state.ui.currentTheme = "bamboo";
    }
    async saveToStorage() {
      try {
        let dirtyDays = [];
        if (this._dirtyDays.size > 0) {
          for (const dateKey of this._dirtyDays) {
            const dayData = this.state.data[dateKey];
            if (dayData) dirtyDays.push(dayData);
          }
        } else if (!this._didInitialSave) {
          dirtyDays = Object.values(this.state.data);
        }
        const dirtySettings = {};
        const settingsMap = {
          balance: this.state.balance,
          shopStats: this.state.stats,
          dataVersion: DATA_VERSION,
          purchaseHistory: this.state.purchaseHistory,
          incomeHistory: this.state.incomeHistory
        };
        if (this._dirtySettings.size > 0) {
          for (const key of this._dirtySettings) {
            if (key in settingsMap) dirtySettings[key] = settingsMap[key];
          }
        } else if (!this._didInitialSave) {
          Object.assign(dirtySettings, settingsMap);
        }
        const goalsDirty = this._goalsDirty || !this._didInitialSave;
        const tasks = [];
        if (dirtyDays.length > 0) {
          tasks.push(typeof storageManager.putDaysBatch === "function" ? storageManager.putDaysBatch(dirtyDays) : (async () => {
            for (const d of dirtyDays) await storageManager.putDay(d);
          })());
        }
        if (goalsDirty && typeof storageManager.putGoals === "function") {
          tasks.push(storageManager.putGoals(this.state.globalGoals));
        }
        if (Object.keys(dirtySettings).length > 0) {
          tasks.push(typeof storageManager.putSettingsBatch === "function" ? storageManager.putSettingsBatch(dirtySettings) : (async () => {
            for (const [k, v] of Object.entries(dirtySettings)) await storageManager.putSetting(k, v);
          })());
        }
        if (tasks.length > 0) {
          await Promise.all(tasks);
        }
        this._dirtyDays.clear();
        this._dirtySettings.clear();
        this._goalsDirty = false;
        this._didInitialSave = true;
        this.state.isDirty = false;
      } catch (e) {
        console.error("Failed to save to storage:", e);
        this.saveToStorageLegacy();
      }
    }
    /**
     * 标记某个 setting 字段为脏，下次 saveToStorage 会写入
     */
    markSettingDirty(key) {
      this._dirtySettings.add(key);
    }
    markGoalsDirty() {
      this._goalsDirty = true;
    }
    markDayDirty(dateKey) {
      this._dirtyDays.add(dateKey);
    }
    saveToStorageLegacy() {
      try {
        StorageAdapter.set(StorageKeys.DAILY_REVIEW_DATA, JSON.stringify(this.state.data));
        this.state.isDirty = false;
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          if (typeof Toast !== "undefined") Toast.showToast("\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u5BFC\u51FA\u6570\u636E\u540E\u6E05\u7406\u5386\u53F2\u8BB0\u5F55", "error");
        }
      }
    }
    scheduleAutoSave() {
      this.state.isDirty = true;
      if (this.state.autoSaveTimer) {
        clearTimeout(this.state.autoSaveTimer);
      }
      const interval = typeof SettingsModal !== "undefined" && SettingsModal.autoSaveInterval ? SettingsModal.autoSaveInterval : 2e3;
      this.state.autoSaveTimer = setTimeout(async () => {
        if (this.storageType === "indexeddb") {
          await this.saveToStorage();
        } else {
          this.saveToStorageLegacy();
        }
      }, interval);
    }
    getDateKey(date = this.state.currentDate) {
      const d = date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    getCurrentDayData() {
      if (!this.initPromise) return createEmptyDayData(this.getDateKey());
      const key = this.getDateKey();
      if (!this.state.data[key]) {
        this.state.data[key] = createEmptyDayData(key);
        this.markDayDirty(key);
        this.scheduleAutoSave();
      }
      return this.state.data[key];
    }
    getDataByDate(dateStr) {
      if (!dateStr) return createEmptyDayData(this.getDateKey());
      if (!this.state.data[dateStr]) {
        this.state.data[dateStr] = createEmptyDayData(dateStr);
        this.markDayDirty(dateStr);
      }
      DataValidator.cleanupTimeline(this.state.data[dateStr]);
      return this.state.data[dateStr];
    }
    /**
     * 只读获取指定日期数据 — 缺失时返回空 dayData 但**不**写入 store，
     * 也**不**触发 markDayDirty / scheduleAutoSave。
     * 适用于纯渲染场景（todo 列表、统计预览等）。
     */
    peekDataByDate(dateStr) {
      if (!dateStr) return createEmptyDayData(this.getDateKey());
      if (!this.state.data[dateStr]) {
        return createEmptyDayData(dateStr);
      }
      return this.state.data[dateStr];
    }
    // ── Goal CRUD 向后兼容桥接：实际逻辑已迁入 GoalService ──
    getGlobalGoals() {
      return GoalService.getAll();
    }
    getArchivedGoals() {
      return GoalService.getArchived();
    }
    async loadGlobalGoals() {
      return GoalService.load();
    }
    async saveGlobalGoals() {
      return GoalService._save();
    }
    async addGlobalGoal(goal) {
      return GoalService.add(goal);
    }
    async updateGlobalGoal(id, updates) {
      return GoalService.update(id, updates);
    }
    async deleteGlobalGoal(id) {
      return GoalService.delete(id);
    }
    async reorderGlobalGoals(ids) {
      return GoalService.reorder(ids);
    }
    async archiveGoal(id) {
      return GoalService.archive(id);
    }
    async unarchiveGoal(id) {
      return GoalService.unarchive(id);
    }
    // ── 钱包 CRUD 向后兼容桥接：实际逻辑已迁入 WalletService ──
    async updateBalance(amount, type, desc) {
      return WalletService.updateBalance(amount, type, desc);
    }
    async addIncomeHistory(income) {
      return WalletService.addIncomeHistory(income);
    }
    async removeIncomeHistory(desc) {
      return WalletService.removeIncomeHistory(desc);
    }
    async addPurchaseHistory(purchase) {
      return WalletService.addPurchaseHistory(purchase);
    }
    getPurchaseCounts() {
      return WalletService.getPurchaseCounts();
    }
    getAvailableBalance() {
      return WalletService.getAvailableBalance();
    }
    _recalibrateStats() {
      return WalletService.recalibrateStats();
    }
    async updateDayData(updates) {
      this.pushUndo();
      const key = this.getDateKey();
      if (!this.state.data[key]) {
        this.state.data[key] = createEmptyDayData(key);
      }
      Object.assign(this.state.data[key], updates);
      const errors = DataValidator.validateDayData(this.state.data[key]);
      if (errors.length > 0) {
        console.warn("\u6570\u636E\u9A8C\u8BC1\u8B66\u544A:", errors);
        DataValidator.sanitizeDayData(this.state.data[key]);
      }
      this.markDayDirty(key);
      this.scheduleAutoSave();
    }
    async updateDayDataByDate(dateStr, updates) {
      this.pushUndo();
      if (!this.state.data[dateStr]) {
        this.state.data[dateStr] = createEmptyDayData(dateStr);
      }
      Object.assign(this.state.data[dateStr], updates);
      const errors = DataValidator.validateDayData(this.state.data[dateStr]);
      if (errors.length > 0) {
        console.warn("\u6570\u636E\u9A8C\u8BC1\u8B66\u544A:", errors);
        DataValidator.sanitizeDayData(this.state.data[dateStr]);
      }
      this.markDayDirty(dateStr);
      this.scheduleAutoSave();
    }
    setCurrentDate(date) {
      this.setState({ currentDate: new Date(date) });
      this._ensureCurrentDateLoaded();
    }
    /** 将 Date 格式化为 YYYY-MM-DD key */
    _dateKey(date) {
      return date.toISOString().slice(0, 10);
    }
    /** 如果当前日期有数据但未加载，异步补读并 notify */
    async _ensureCurrentDateLoaded() {
      const key = this._dateKey(this.state.currentDate);
      if (!this.state.dayKeys.includes(key)) return;
      if (this.state.data[key]) return;
      try {
        const day = await storageManager.getDay(key);
        if (day) {
          this.state.data[key] = day;
          this.notify();
        }
      } catch (e) {
        console.warn("[Store] \u8865\u8BFB\u65E5\u671F\u5931\u8D25:", key, e.message);
      }
    }
    /**
     * 加载下一页日期数据（滚动到旧日期时调用）
     * @returns {Promise<boolean>} 是否还有更多数据
     */
    async loadMoreDays() {
      if (!this.state._hasMoreDays) return false;
      if (this.state._loadingMore) return false;
      this.state._loadingMore = true;
      const pages = [...this.state._loadedPages];
      const nextPage = pages.length > 0 ? Math.max(...pages) + 1 : 0;
      if (this.state._loadedPages.has(nextPage)) {
        this.state._loadingMore = false;
        return this.state._hasMoreDays;
      }
      try {
        const paginated = await storageManager.getDaysPaginated(nextPage, 30);
        Object.assign(this.state.data, paginated.days);
        this.state._loadedPages.add(nextPage);
        this.state._hasMoreDays = paginated.hasMore;
        this.notify();
        return paginated.hasMore;
      } catch (e) {
        console.warn("[Store] \u52A0\u8F7D\u66F4\u591A\u65E5\u671F\u5931\u8D25:", e.message);
        return false;
      } finally {
        this.state._loadingMore = false;
      }
    }
    navigateDate(delta) {
      const newDate = new Date(this.state.currentDate);
      newDate.setDate(newDate.getDate() + delta);
      this.setCurrentDate(newDate);
    }
    goToDate(date) {
      this.setCurrentDate(date);
    }
    async setDarkMode(isDark) {
      const currentMode = this.state.ui.isDarkMode;
      const newMode = typeof isDark === "boolean" ? isDark : !currentMode;
      if (newMode === currentMode) {
        this.notify();
        return;
      }
      this.state.ui.isDarkMode = newMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      if (typeof storageManager !== "undefined" && typeof storageManager.putSetting === "function") {
        try {
          await storageManager.putSetting("theme", newMode ? "dark" : "light");
        } catch (e) {
        }
      }
      this.notify();
    }
    async toggleDarkMode() {
      return this.setDarkMode();
    }
    async setWeatherEnabled(enabled) {
      this.state.ui.weatherEnabled = !!enabled;
      if (typeof storageManager !== "undefined" && typeof storageManager.putSetting === "function") {
        try {
          await storageManager.putSetting("weatherEnabled", enabled ? "true" : "false");
        } catch (e) {
        }
      } else {
        StorageAdapter.set(StorageKeys.WEATHER_ENABLED, enabled ? "true" : "false");
      }
    }
    async setWeatherCity(city) {
      const cleaned = (city || "").trim();
      this.state.ui.weatherCity = cleaned.length > 0 ? cleaned : null;
      if (typeof storageManager !== "undefined" && typeof storageManager.putSetting === "function") {
        try {
          await storageManager.putSetting("weatherCity", cleaned.length > 0 ? cleaned : "");
        } catch (e) {
        }
      }
      if (typeof WeatherService !== "undefined" && typeof WeatherService.setManualCity === "function") {
        WeatherService.setManualCity(cleaned.length > 0 ? cleaned : null);
      }
    }
    async setWeatherExpanded(expanded) {
      this.state.ui.weatherExpanded = !!expanded;
      if (typeof storageManager !== "undefined" && typeof storageManager.putSetting === "function") {
        try {
          await storageManager.putSetting("weatherExpanded", expanded ? "true" : "false");
        } catch (e) {
        }
      } else {
        StorageAdapter.set(StorageKeys.WEATHER_EXPANDED, expanded ? "true" : "false");
      }
    }
    async setQuoteSource(source) {
      const cleaned = (source || "").trim();
      this.state.ui.quoteSource = cleaned;
      if (typeof storageManager !== "undefined" && typeof storageManager.putSetting === "function") {
        try {
          await storageManager.putSetting("quoteSource", cleaned);
        } catch (e) {
        }
      } else {
        StorageAdapter.set(StorageKeys.QUOTE_SOURCE, cleaned);
      }
    }
    async setQuoteEnabled(enabled) {
      this.state.ui.quoteEnabled = !!enabled;
      if (typeof storageManager !== "undefined" && typeof storageManager.putSetting === "function") {
        try {
          await storageManager.putSetting("quoteEnabled", enabled ? "true" : "false");
        } catch (e) {
        }
      } else {
        StorageAdapter.set(StorageKeys.QUOTE_ENABLED, enabled ? "true" : "false");
      }
    }
    async setSyncTheme(enabled) {
      this.state.ui.autoSyncTheme = enabled;
      if (typeof storageManager !== "undefined" && typeof storageManager.putSetting === "function") {
        try {
          await storageManager.putSetting("autoSyncTheme", enabled ? "true" : "false");
        } catch (e) {
        }
      }
      this.notify();
    }
    setOnUndoStateChanged(callback) {
      this.onUndoStateChangedCallback = callback;
    }
    notifyUndoStateChanged() {
      if (this.onUndoStateChangedCallback) {
        this.onUndoStateChangedCallback();
      }
    }
    pushUndo() {
      this._undoRedo.push(this.getDateKey(), this.state.data[this.getDateKey()]);
      this.notifyUndoStateChanged();
    }
    async undo() {
      const prev = this._undoRedo.undo(this.getDateKey());
      if (!prev) return false;
      if (this.state.data[prev.key]) {
        this.state.data[prev.key] = prev.data;
        this.markDayDirty(prev.key);
      }
      if (prev.key !== this.getDateKey()) {
        this.state.currentDate = new Date(prev.key);
      }
      this.scheduleAutoSave();
      this.notifyUndoStateChanged();
      this.notify();
      return true;
    }
    async redo() {
      const next = this._undoRedo.redo(this.getDateKey());
      if (!next) return false;
      if (this.state.data[next.key]) {
        this.state.data[next.key] = next.data;
        this.markDayDirty(next.key);
      }
      if (next.key !== this.getDateKey()) {
        this.state.currentDate = new Date(next.key);
      }
      this.scheduleAutoSave();
      this.notifyUndoStateChanged();
      this.notify();
      return true;
    }
    canUndo() {
      return this._undoRedo.canUndo();
    }
    canRedo() {
      return this._undoRedo.canRedo();
    }
    async exportData() {
      return DataIO.exportData();
    }
    async importData(data, opts) {
      return DataIO.importData(data, opts);
    }
    searchData(query) {
      return SearchService.search(this.state.data, this.state.globalGoals, query);
    }
  };
  var store2 = new Store();
  window.store = store2;
  window.Store = Store;

  // assets/scripts/services/TimelineService.js
  var TimelineService_exports = {};
  __export(TimelineService_exports, {
    PERIOD_CONFIG: () => PERIOD_CONFIG,
    TimelineService: () => TimelineService2
  });
  var PERIOD_CONFIG = {
    lateNight: { period: "lateNight", name: "\u51CC\u6668", time: "00:00 - 04:00", icon: "moon", eval: "good", hours: [0, 4] },
    dawn: { period: "dawn", name: "\u9ECE\u660E", time: "04:00 - 05:30", icon: "sunrise", eval: "good", hours: [4, 5.5] },
    earlyMorning: { period: "earlyMorning", name: "\u6E05\u6668", time: "05:30 - 07:00", icon: "sun", eval: "good", hours: [5.5, 7] },
    morning: { period: "morning", name: "\u4E0A\u5348", time: "07:00 - 12:00", icon: "briefcase", eval: "good", hours: [7, 12] },
    midday: { period: "midday", name: "\u4E2D\u5348", time: "12:00 - 13:00", icon: "utensils", eval: "good", hours: [12, 13] },
    afternoon: { period: "afternoon", name: "\u4E0B\u5348", time: "13:00 - 17:00", icon: "sun", eval: "good", hours: [13, 17] },
    dusk: { period: "dusk", name: "\u508D\u665A", time: "17:00 - 18:30", icon: "sunset", eval: "good", hours: [17, 18.5] },
    evening: { period: "evening", name: "\u665A\u4E0A", time: "18:30 - 22:00", icon: "coffee", eval: "good", hours: [18.5, 22] },
    night: { period: "night", name: "\u6DF1\u591C", time: "22:00 - 24:00", icon: "moon", eval: "good", hours: [22, 24] }
  };
  var TimelineService2 = {
    getCurrentPeriod() {
      const now = /* @__PURE__ */ new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTime = hour + minute / 60;
      if (currentTime >= 0 && currentTime < 4) return "lateNight";
      if (currentTime >= 4 && currentTime < 5.5) return "dawn";
      if (currentTime >= 5.5 && currentTime < 7) return "earlyMorning";
      if (currentTime >= 7 && currentTime < 12) return "morning";
      if (currentTime >= 12 && currentTime < 13) return "midday";
      if (currentTime >= 13 && currentTime < 17) return "afternoon";
      if (currentTime >= 17 && currentTime < 18.5) return "dusk";
      if (currentTime >= 18.5 && currentTime < 22) return "evening";
      return "night";
    },
    getCurrentTime() {
      return (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    },
    getPeriodConfig(periodKey) {
      return PERIOD_CONFIG[periodKey] || null;
    },
    getAllPeriodConfigs() {
      return PERIOD_CONFIG;
    },
    ensurePeriod(dayData, periodKey) {
      if (!dayData.timeline) dayData.timeline = [];
      let periodItem = dayData.timeline.find((p) => p.period === periodKey);
      if (!periodItem) {
        const config = PERIOD_CONFIG[periodKey];
        if (!config) return null;
        periodItem = {
          period: config.period,
          name: config.name,
          time: config.time,
          icon: config.icon,
          eval: config.eval,
          items: []
        };
        dayData.timeline.push(periodItem);
      }
      if (!periodItem.items) periodItem.items = [];
      return periodItem;
    },
    addEvent(dayData, taskText, evalLabel, refId) {
      const periodKey = this.getCurrentPeriod();
      const periodItem = this.ensurePeriod(dayData, periodKey);
      if (!periodItem) return;
      const eventItem = {
        time: this.getCurrentTime(),
        task: taskText,
        eval: evalLabel || "\u5B8C\u6210"
      };
      if (refId) {
        eventItem.refId = refId;
      }
      periodItem.items.push(eventItem);
    },
    removeEvent(dayData, identifier) {
      if (!dayData.timeline) return;
      let removed = false;
      dayData.timeline.forEach((periodItem) => {
        if (removed || !periodItem.items) return;
        const refIdx = periodItem.items.findIndex((i) => identifier && i.refId && i.refId === identifier);
        if (refIdx !== -1) {
          periodItem.items.splice(refIdx, 1);
          removed = true;
          return;
        }
        if (typeof identifier === "string") {
          const textIdx = periodItem.items.findIndex((i) => !i.refId && i.task === identifier);
          if (textIdx !== -1) {
            periodItem.items.splice(textIdx, 1);
            removed = true;
          }
        }
      });
      dayData.timeline = dayData.timeline.filter((periodItem) => {
        return periodItem.items && periodItem.items.length > 0;
      });
    },
    parseTime(timeStr) {
      if (!timeStr || typeof timeStr !== "string") return null;
      const match = timeStr.trim().match(/(\d{1,2}):(\d{2})/);
      if (!match) return null;
      return { hour: parseInt(match[1]), minute: parseInt(match[2]) };
    },
    calculateCheckInTimes(timeline) {
      if (!timeline || !Array.isArray(timeline)) {
        return { firstCheckIn: "--:--", lastCheckIn: "--:--" };
      }
      const allTimes = [];
      timeline.forEach((period) => {
        if (period.items && Array.isArray(period.items)) {
          period.items.forEach((item) => {
            const parsed = this.parseTime(item.time);
            if (parsed) allTimes.push(parsed);
          });
        }
      });
      if (allTimes.length === 0) {
        return { firstCheckIn: "--:--", lastCheckIn: "--:--" };
      }
      allTimes.sort((a, b) => {
        if (a.hour !== b.hour) return a.hour - b.hour;
        return a.minute - b.minute;
      });
      const formatTime = (t) => `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
      return {
        firstCheckIn: formatTime(allTimes[0]),
        lastCheckIn: formatTime(allTimes[allTimes.length - 1])
      };
    },
    updateMetrics(dayData) {
      const checkInTimes = this.calculateCheckInTimes(dayData.timeline);
      if (!dayData.metrics) dayData.metrics = {};
      dayData.metrics.firstCheckIn = checkInTimes.firstCheckIn;
      dayData.metrics.lastCheckIn = checkInTimes.lastCheckIn;
    }
  };
  window.TimelineService = TimelineService2;

  // assets/scripts/services/GoalService.js
  var GoalService_exports = {};
  __export(GoalService_exports, {
    DEFAULT_CATEGORIES: () => DEFAULT_CATEGORIES,
    GoalService: () => GoalService2
  });
  var DEFAULT_CATEGORIES = [
    { id: "work", name: "\u5DE5\u4F5C" },
    { id: "personal", name: "\u4E2A\u4EBA" },
    { id: "health", name: "\u5065\u5EB7" },
    { id: "study", name: "\u5B66\u4E60" },
    { id: "finance", name: "\u8D22\u52A1" },
    { id: "other", name: "\u5176\u4ED6" }
  ];
  var GoalService2 = {
    _customCategories: null,
    // 渲染缓存：getTodayGoalTasks 结果按 (dateStr, goals引用, completionsHash) 缓存
    _todayTasksCache: { key: null, result: null, goalsRef: null, completionsHash: null },
    // ── Goal CRUD（从 store.js 迁入）──
    getAll() {
      return store.state.globalGoals || [];
    },
    getArchived() {
      return this.getAll().filter((g) => g.archived);
    },
    async load() {
      try {
        const goals = await storageManager.getGoals();
        if (goals && goals.length > 0) {
          const errors = DataValidator.validateGoals(goals);
          if (errors.length > 0) {
            console.warn("\u76EE\u6807\u6570\u636E\u6821\u9A8C\u8B66\u544A:", errors);
            DataValidator.sanitizeGoals(goals);
          }
          store.state.globalGoals = goals.map((goal) => {
            if (goal.archived && !goal.archivedAt) {
              return { ...goal, archivedAt: (/* @__PURE__ */ new Date()).toISOString() };
            }
            return goal;
          });
        } else {
          await this._migrateFromDayData();
        }
      } catch (e) {
        console.error("Failed to load global goals:", e);
        store.state.globalGoals = [];
      }
      store.notify();
    },
    async _migrateFromDayData() {
      const dates = Object.keys(store.state.data).sort().reverse();
      let migrated = false;
      for (const dateKey of dates) {
        const dayData = store.state.data[dateKey];
        if (dayData.goals && dayData.goals.length > 0) {
          store.state.globalGoals = dayData.goals.map((goal, idx) => ({
            ...goal,
            id: goal.id || "goal_" + dateKey + "_" + idx,
            category: goal.category || "work",
            startDate: goal.startDate || "",
            endDate: goal.endDate || goal.deadline || "",
            items: (goal.items || []).map((item) => ({
              ...item,
              startDate: item.startDate || "",
              endDate: item.endDate || "",
              startValue: item.startValue || "",
              targetValue: item.targetValue || "",
              currentValue: item.currentValue || "",
              dailyMin: item.dailyMin || "",
              taskDayType: item.taskDayType || "daily",
              taskDayConfig: item.taskDayConfig || ""
            }))
          }));
          migrated = true;
          break;
        }
      }
      if (!migrated) {
        store.state.globalGoals = [];
      }
      await this._save();
    },
    async _save() {
      try {
        await storageManager.putGoals(store.state.globalGoals);
      } catch (e) {
        console.error("Failed to save global goals:", e);
      }
    },
    async add(goal) {
      if (!goal.id) {
        goal.id = "goal_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      }
      const existingIds = new Set(store.state.globalGoals.map((g) => g.id));
      if (existingIds.has(goal.id)) {
        goal.id = "goal_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      }
      if (!goal.category) goal.category = "work";
      if (!goal.startDate) goal.startDate = "";
      if (!goal.endDate) goal.endDate = "";
      if (goal.progress === void 0) goal.progress = 0;
      store.state.globalGoals.push(goal);
      await this._save();
      this._invalidateTasksCache();
      store.notify();
      return goal;
    },
    async update(goalId, updates) {
      const index = store.state.globalGoals.findIndex((g) => g.id === goalId);
      if (index >= 0) {
        const { id, ...safeUpdates } = updates;
        store.state.globalGoals[index] = { ...store.state.globalGoals[index], ...safeUpdates, id: goalId };
        await this._save();
        this._invalidateTasksCache();
        store.notify();
      }
    },
    async delete(goalId) {
      store.state.globalGoals = store.state.globalGoals.filter((g) => g.id !== goalId);
      await this._save();
      this._invalidateTasksCache();
      store.notify();
    },
    async reorder(goalIds) {
      const goalMap = {};
      store.state.globalGoals.forEach((g) => {
        goalMap[g.id] = g;
      });
      store.state.globalGoals = goalIds.map((id) => goalMap[id]).filter(Boolean);
      await this._save();
      this._invalidateTasksCache();
      store.notify();
    },
    async archive(goalId) {
      const index = store.state.globalGoals.findIndex((g) => g.id === goalId);
      if (index >= 0) {
        store.state.globalGoals[index].archived = true;
        store.state.globalGoals[index].archivedAt = (/* @__PURE__ */ new Date()).toISOString();
        await this._save();
        this._invalidateTasksCache();
        store.notify();
      }
    },
    async unarchive(goalId) {
      const index = store.state.globalGoals.findIndex((g) => g.id === goalId);
      if (index >= 0) {
        store.state.globalGoals[index].archived = false;
        delete store.state.globalGoals[index].archivedAt;
        await this._save();
        this._invalidateTasksCache();
        store.notify();
      }
    },
    /**
     * 失效 getTodayGoalTasks 渲染缓存 — 在 goal 集合或 completions 变更后调用
     */
    _invalidateTasksCache() {
      this._todayTasksCache = { key: null, result: null, goalsRef: null, completionsHash: null };
    },
    async loadCategories() {
      if (this._customCategories !== null) return this._customCategories;
      try {
        const stored = await storageManager.getSetting("goalCategories");
        if (stored && Array.isArray(stored) && stored.length > 0) {
          this._customCategories = stored;
        } else {
          this._customCategories = [...DEFAULT_CATEGORIES];
        }
      } catch (e) {
        this._customCategories = [...DEFAULT_CATEGORIES];
      }
      window.GOAL_CATEGORIES = this._customCategories;
      return this._customCategories;
    },
    getCategories() {
      if (this._customCategories === null) {
        return [...DEFAULT_CATEGORIES];
      }
      return [...this._customCategories];
    },
    async saveCategories(categories) {
      const prevCategories = [...this._customCategories];
      const prevGlobal = window.GOAL_CATEGORIES;
      this._customCategories = [...categories];
      window.GOAL_CATEGORIES = this._customCategories;
      try {
        await storageManager.putSetting("goalCategories", this._customCategories);
      } catch (e) {
        this._customCategories = prevCategories;
        window.GOAL_CATEGORIES = prevGlobal;
        console.error("Failed to save categories:", e);
      }
    },
    calcProgress(goal) {
      if (!goal.items || goal.items.length === 0) return goal.progress || 0;
      const total = goal.items.reduce((sum, item) => sum + (item.percent || 0), 0);
      return Math.round(total / goal.items.length);
    },
    calcDays(startDate, endDate) {
      if (!startDate || !endDate) return null;
      const start = /* @__PURE__ */ new Date(startDate + "T00:00:00");
      const end = /* @__PURE__ */ new Date(endDate + "T00:00:00");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      const diff = Math.round((end - start) / (1e3 * 60 * 60 * 24));
      return diff >= 0 ? diff + 1 : null;
    },
    calcDaysRemaining(endDate) {
      if (!endDate) return null;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const end = /* @__PURE__ */ new Date(endDate + "T00:00:00");
      if (isNaN(end.getTime())) return null;
      return Math.ceil((end - today) / (1e3 * 60 * 60 * 24));
    },
    calcSuggestedDaily(item) {
      if (item.targetValue === void 0 || item.targetValue === null || item.targetValue === "" || item.startValue === void 0 || item.startValue === null || item.startValue === "" || !item.endDate) return null;
      const target = parseFloat(item.targetValue) || 0;
      const start = parseFloat(item.startValue) || 0;
      const currentRaw = parseFloat(item.currentValue);
      const current = !isNaN(currentRaw) && item.currentValue !== void 0 && item.currentValue !== "" ? currentRaw : start;
      const remainingDays = this.calcDaysRemaining(item.endDate);
      if (remainingDays === null || remainingDays <= 0) return null;
      const remaining = target - current;
      if (remaining <= 0) return null;
      return parseFloat((Math.ceil(remaining / remainingDays * 10) / 10).toFixed(1));
    },
    calcProgressFromValues(item) {
      if (item.targetValue === void 0 || item.targetValue === null || item.targetValue === "" || item.startValue === void 0 || item.startValue === null || item.startValue === "") return item.percent || 0;
      const target = parseFloat(item.targetValue) || 0;
      const start = parseFloat(item.startValue) || 0;
      const currentRaw = parseFloat(item.currentValue);
      const current = !isNaN(currentRaw) && item.currentValue !== void 0 && item.currentValue !== "" ? currentRaw : start;
      if (target === start) return 100;
      const totalDistance = Math.abs(target - start);
      const covered = Math.abs(current - start);
      return Math.min(100, Math.max(0, Math.round(covered / totalDistance * 100)));
    },
    isDailyCompleted(item, goalId, itemIdx, dateStr) {
      if (!item.dailyMin) return false;
      const dailyMin = parseFloat(item.dailyMin) || 0;
      if (dailyMin <= 0) return false;
      if (goalId !== void 0 && itemIdx !== void 0) {
        const todayKey = dateStr || this._formatDate(/* @__PURE__ */ new Date());
        const dayData = store.getDataByDate(todayKey);
        const completedToday = dayData?.goalTaskCompletions?.[goalId]?.[itemIdx] || false;
        if (completedToday) return true;
      }
      return false;
    },
    isTodayTaskDay(item, dateStr) {
      const date = dateStr ? /* @__PURE__ */ new Date(dateStr + "T00:00:00") : /* @__PURE__ */ new Date();
      date.setHours(0, 0, 0, 0);
      const startDate = item.startDate ? /* @__PURE__ */ new Date(item.startDate + "T00:00:00") : null;
      const endDate = item.endDate ? /* @__PURE__ */ new Date(item.endDate + "T00:00:00") : null;
      if (startDate && !isNaN(startDate.getTime())) {
        startDate.setHours(0, 0, 0, 0);
        if (date < startDate) return false;
      }
      if (endDate && !isNaN(endDate.getTime())) {
        endDate.setHours(0, 0, 0, 0);
        if (date > endDate) return false;
      }
      const dayOfWeek = date.getDay();
      const taskDayType = item.taskDayType || "daily";
      const config = (item.taskDayConfig || "").trim();
      switch (taskDayType) {
        case "daily":
          return true;
        case "workday":
          return dayOfWeek >= 1 && dayOfWeek <= 5;
        case "weekend":
          return dayOfWeek === 0 || dayOfWeek === 6;
        case "custom_week":
          if (!config) return false;
          const weekDays = config.split(",").map((d) => parseInt(d.trim(), 10)).filter((d) => !isNaN(d));
          return weekDays.includes(dayOfWeek);
        case "custom_month":
          if (!config) return false;
          const monthDays = config.split(",").map((d) => parseInt(d.trim(), 10)).filter((d) => !isNaN(d) && (d >= 1 && d <= 31 || d === 99));
          const currentDay = date.getDate();
          const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          if (monthDays.includes(99) && currentDay === lastDayOfMonth) return true;
          if (monthDays.includes(currentDay)) return true;
          const adjustedDays = monthDays.map((d) => d >= 1 && d <= 31 ? Math.min(d, lastDayOfMonth) : d);
          return adjustedDays.includes(currentDay);
        case "interval":
          const interval = parseInt(config, 10) || 2;
          if (interval <= 0) return false;
          if (!startDate || isNaN(startDate.getTime())) return false;
          startDate.setHours(0, 0, 0, 0);
          const diffDays = Math.round((date - startDate) / (1e3 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays % interval === 0;
        default:
          return true;
      }
    },
    getTodayGoalTasks(dateStr) {
      const goals = store.getGlobalGoals();
      const todayKey = dateStr || this._formatDate(/* @__PURE__ */ new Date());
      const dayData = store.peekDataByDate(todayKey);
      const completions = dayData?.goalTaskCompletions || {};
      const completionsHash = JSON.stringify(completions);
      const cache = this._todayTasksCache;
      if (cache.key === todayKey && cache.goalsRef === goals && cache.completionsHash === completionsHash) {
        return cache.result;
      }
      const todayTasks = [];
      goals.forEach((goal) => {
        if (!goal.items || goal.items.length === 0) return;
        goal.items.forEach((item, itemIdx) => {
          const progress = this.calcProgressFromValues(item);
          const isComplete = progress >= 100;
          const isPaused = item.detail === "\u5DF2\u6401\u7F6E";
          if (isPaused) return;
          const todayKey2 = dateStr || this._formatDate(/* @__PURE__ */ new Date());
          const dayData2 = store.peekDataByDate(todayKey2);
          const completedToday = dayData2?.goalTaskCompletions?.[goal.id]?.[itemIdx] || false;
          if (isComplete && !completedToday) return;
          if (goal.archived && !completedToday) return;
          const dailyMinValue = parseFloat(item.dailyMin);
          const hasDailyMin = item.dailyMin !== void 0 && item.dailyMin !== null && item.dailyMin !== "" && dailyMinValue > 0;
          const hasTimeRange = !!(item.startDate || item.endDate);
          const hasCustomTaskDay = item.taskDayType && item.taskDayType !== "daily";
          if (!completedToday) {
            const isToday = this.isTodayTaskDay(item, dateStr);
            if (!isToday) return;
            if (!hasDailyMin && !hasTimeRange && !hasCustomTaskDay) return;
          }
          let incrementValue = 0;
          if (hasDailyMin) {
            incrementValue = dailyMinValue;
          } else if (item.targetValue !== void 0 && item.targetValue !== null && item.targetValue !== "" && item.startValue !== void 0 && item.startValue !== null && item.startValue !== "") {
            const suggested = this.calcSuggestedDaily(item);
            incrementValue = suggested !== null && suggested > 0 ? suggested : 1;
          }
          const hasValues = !!(item.startValue !== void 0 && item.startValue !== null && item.startValue !== "" || item.targetValue !== void 0 && item.targetValue !== null && item.targetValue !== "");
          todayTasks.push({
            id: `goal_${goal.id}_${itemIdx}`,
            goalId: goal.id,
            itemIdx,
            title: item.name,
            description: `${goal.icon} ${goal.title}`,
            dailyMin: hasDailyMin ? dailyMinValue : 0,
            incrementValue,
            hasValues,
            currentValue: item.currentValue || item.startValue || "0",
            targetValue: item.targetValue || "",
            completed: completedToday,
            type: "goal_task",
            isArchived: !!goal.archived
          });
        });
      });
      this._todayTasksCache = {
        key: todayKey,
        goalsRef: goals,
        completionsHash,
        result: todayTasks
      };
      return todayTasks;
    },
    async completeGoalTask(goalId, itemIdx, dateStr, isUncompleting) {
      const todayKey = dateStr || this._formatDate(/* @__PURE__ */ new Date());
      const actualToday = this._formatDate(/* @__PURE__ */ new Date());
      const isTodayTask = todayKey === actualToday;
      const dayData = store.getDataByDate(todayKey);
      if (!dayData.goalTaskCompletions) dayData.goalTaskCompletions = {};
      if (!dayData.goalTaskCompletions[goalId]) dayData.goalTaskCompletions[goalId] = {};
      const goals = store.getGlobalGoals();
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || !goal.items || !goal.items[itemIdx]) {
        store.updateDayDataByDate(todayKey, dayData);
        return;
      }
      const item = goal.items[itemIdx];
      const dailyMin = parseFloat(item.dailyMin) || 0;
      let incrementValue = dailyMin;
      if (!dailyMin && item.targetValue && item.startValue) {
        const suggested = this.calcSuggestedDaily(item);
        incrementValue = suggested !== null && suggested > 0 ? suggested : 1;
      } else if (!dailyMin) {
        incrementValue = 1;
      }
      if (isUncompleting) {
        dayData.goalTaskCompletions[goalId][itemIdx] = false;
        if (item.startValue !== void 0 && item.startValue !== null && item.startValue !== "" || item.targetValue !== void 0 && item.targetValue !== null && item.targetValue !== "") {
          const currentRaw = parseFloat(item.currentValue);
          const current = !isNaN(currentRaw) && item.currentValue !== void 0 && item.currentValue !== "" ? currentRaw : parseFloat(item.startValue) || 0;
          const totalStart = parseFloat(item.startValue) || 0;
          const totalTarget = parseFloat(item.targetValue) || totalStart;
          const isDescending = totalTarget < totalStart;
          const newValue = isDescending ? current + incrementValue : current - incrementValue;
          const minVal = Math.min(totalStart, totalTarget);
          const maxVal = Math.max(totalStart, totalTarget);
          item.currentValue = parseFloat(Math.max(minVal, Math.min(maxVal, newValue)).toFixed(1)).toString();
          if (totalTarget !== totalStart) {
            const totalDist = Math.abs(totalTarget - totalStart);
            const covered = Math.abs(parseFloat(item.currentValue) - totalStart);
            item.percent = Math.min(100, Math.max(0, Math.round(covered / totalDist * 100)));
          }
        }
        TimelineService.removeEvent(dayData, `${goal.title} - ${item.name}`);
        TimelineService.updateMetrics(dayData);
        goal.progress = this.calcProgress(goal);
        if (typeof GoalsRenderer !== "undefined") {
          GoalsRenderer._autoCalcEndDate(item);
          GoalsRenderer.autoCalcGoalDateRange(goal);
        }
        store.updateDayDataByDate(todayKey, dayData);
        await store.updateGlobalGoal(goalId, goal);
        await store.saveToStorage();
        const cancelDesc = `\u5B8C\u6210\uFF1A${goal.title} - ${item.name}`;
        if (isTodayTask) {
          await store.updateBalance(-1, "task_cancel", `\u53D6\u6D88\u5B8C\u6210\uFF1A${goal.title} - ${item.name}`);
          await store.removeIncomeHistory(cancelDesc);
        }
        Toast.showToast("\u76EE\u6807\u4EFB\u52A1\u5DF2\u53D6\u6D88\u5B8C\u6210", "info");
      } else {
        dayData.goalTaskCompletions[goalId][itemIdx] = true;
        if (item.startValue !== void 0 && item.startValue !== null && item.startValue !== "" || item.targetValue !== void 0 && item.targetValue !== null && item.targetValue !== "") {
          const currentRaw = parseFloat(item.currentValue);
          const current = !isNaN(currentRaw) && item.currentValue !== void 0 && item.currentValue !== "" ? currentRaw : parseFloat(item.startValue) || 0;
          const target = parseFloat(item.targetValue) || current;
          const newValue = current + incrementValue;
          item.currentValue = parseFloat((target >= current ? Math.min(target, newValue) : Math.max(target, newValue)).toFixed(1)).toString();
          const totalStart = parseFloat(item.startValue) || 0;
          const totalTarget = parseFloat(item.targetValue) || totalStart;
          if (totalTarget !== totalStart) {
            const totalDist = Math.abs(totalTarget - totalStart);
            const covered = Math.abs(parseFloat(item.currentValue) - totalStart);
            item.percent = Math.min(100, Math.max(0, Math.round(covered / totalDist * 100)));
          }
        }
        TimelineService.addEvent(dayData, `${goal.title} - ${item.name}`, "\u5B8C\u6210");
        TimelineService.updateMetrics(dayData);
        goal.progress = this.calcProgress(goal);
        if (typeof GoalsRenderer !== "undefined") {
          GoalsRenderer._autoCalcEndDate(item);
          GoalsRenderer.autoCalcGoalDateRange(goal);
        }
        store.updateDayDataByDate(todayKey, dayData);
        await store.updateGlobalGoal(goalId, goal);
        await store.saveToStorage();
        if (isTodayTask) {
          await store.updateBalance(1, "task_complete", `\u5B8C\u6210\uFF1A${goal.title} - ${item.name}`);
          Toast.showToast("\u76EE\u6807\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF0C\u5956\u52B1 1 \u7AF9\u5E01", "success");
        } else {
          Toast.showToast("\u76EE\u6807\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF08\u975E\u4ECA\u65E5\u4EFB\u52A1\uFF0C\u4E0D\u5956\u52B1\u7AF9\u5E01\uFF09", "info");
        }
      }
      this._todayTasksCache = { key: null, result: null, goalsRef: null, completionsHash: null };
    },
    _formatDate(date) {
      return GoalCalculations.formatDate(date);
    },
    /**
     * 获取使用指定分类的目标列表（含已归档）
     */
    getGoalsByCategory(categoryId) {
      return store.getGlobalGoals().filter((g) => g.category === categoryId);
    },
    /**
     * 将一批目标的分类切换到新分类
     * - 用于分类被删除时对受影响目标做"软回退"
     * - toCategoryId 传空字符串则视为"未分类"
     */
    async reassignGoalsCategory(fromCategoryId, toCategoryId) {
      const goals = store.getGlobalGoals().filter((g) => g.category === fromCategoryId);
      if (goals.length === 0) return 0;
      let successCount = 0;
      for (const goal of goals) {
        try {
          goal.category = toCategoryId || "";
          await store.updateGlobalGoal(goal.id, goal);
          successCount++;
        } catch (e) {
          console.error("Failed to reassign goal:", goal.id, e);
        }
      }
      return successCount;
    }
  };
  window.GoalService = GoalService2;

  // assets/scripts/services/TodoService.js
  var TodoService_exports = {};
  __export(TodoService_exports, {
    TodoService: () => TodoService2
  });
  var TodoService2 = {
    /** 切换目标子任务的完成状态 */
    async toggle(todoId, type, goalId, itemIdx, isCompleted) {
      await GoalService.completeGoalTask(goalId, parseInt(itemIdx), store.getDateKey(), isCompleted);
      renderAll();
      if (!isCompleted && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };
  window.TodoService = TodoService2;

  // assets/scripts/services/WalletService.js
  var WalletService_exports = {};
  __export(WalletService_exports, {
    WalletService: () => WalletService2
  });
  var WalletService2 = {
    async updateBalance(amount, type = "manual", desc = "") {
      const s = store.state;
      s.balance = parseFloat((s.balance + amount).toFixed(2));
      await storageManager.putSetting("balance", s.balance);
      const today = (/* @__PURE__ */ new Date()).toDateString();
      if (s._statsDate !== today) {
        s._statsDate = today;
        s.stats.todayEarnings = 0;
      }
      if (amount > 0) {
        s.stats.todayEarnings = parseFloat((s.stats.todayEarnings + amount).toFixed(2));
        s.stats.totalEarnings = parseFloat((s.stats.totalEarnings + amount).toFixed(2));
        await this.addIncomeHistory({
          amount,
          type,
          desc,
          date: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else if (amount < 0 && type !== "task_cancel") {
        s.stats.totalSpent = parseFloat((s.stats.totalSpent + Math.abs(amount)).toFixed(2));
      }
      s.stats.date = today;
      await storageManager.putSetting("shopStats", s.stats);
      store.notify();
    },
    async addIncomeHistory(income) {
      const s = store.state;
      if (income.desc && income.amount > 0) {
        const today = (/* @__PURE__ */ new Date()).toDateString();
        let adjustedEarnings = 0;
        const filtered = s.incomeHistory.records.filter((inc) => {
          if (inc.desc === income.desc && inc.amount > 0 && new Date(inc.date).toDateString() === today) {
            adjustedEarnings += inc.amount;
            return false;
          }
          return true;
        });
        if (adjustedEarnings > 0) {
          s.incomeHistory.records = filtered;
          s.stats.todayEarnings = Math.max(0, parseFloat((s.stats.todayEarnings - adjustedEarnings).toFixed(2)));
        }
      }
      const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      s.incomeHistory.records.unshift({
        ...income,
        date: (/* @__PURE__ */ new Date()).toISOString(),
        month
      });
      await storageManager.putIncomeHistory(s.incomeHistory);
    },
    async removeIncomeHistory(desc) {
      const s = store.state;
      const idx = s.incomeHistory.records.findIndex((inc) => inc.desc === desc);
      if (idx === -1) return;
      const removed = s.incomeHistory.records[idx];
      s.incomeHistory.records.splice(idx, 1);
      await storageManager.putIncomeHistory(s.incomeHistory);
      if (removed.amount > 0) {
        const today = (/* @__PURE__ */ new Date()).toDateString();
        if (s._statsDate === today) {
          s.stats.todayEarnings = Math.max(0, parseFloat((s.stats.todayEarnings - removed.amount).toFixed(2)));
        }
        s.stats.date = today;
        await storageManager.putSetting("shopStats", s.stats);
      }
      store.notify();
    },
    async addPurchaseHistory(purchase) {
      const s = store.state;
      const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      s.purchaseHistory.records.unshift({
        ...purchase,
        date: (/* @__PURE__ */ new Date()).toISOString(),
        month
      });
      await storageManager.putPurchaseHistory(s.purchaseHistory);
      store.notify();
    },
    /** 自动归档：将非近月（当月+上月）的 records 移入 archive */
    async archiveOldRecords() {
      const s = store.state;
      const now = /* @__PURE__ */ new Date();
      const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
      const recentMonths = /* @__PURE__ */ new Set([curMonth, prevMonth]);
      let phChanged = false;
      let ihChanged = false;
      const ph = s.purchaseHistory;
      const phToArchive = [];
      const phToKeep = [];
      for (const record of ph.records) {
        const m = record.month || record.date.slice(0, 7);
        if (recentMonths.has(m)) {
          phToKeep.push(record);
        } else {
          phToArchive.push(record);
        }
      }
      if (phToArchive.length > 0) {
        for (const record of phToArchive) {
          const m = record.month || record.date.slice(0, 7);
          if (!ph.archive[m]) {
            ph.archive[m] = { totalSpent: 0, totalCount: 0, items: {} };
          }
          const bucket = ph.archive[m];
          bucket.totalCount++;
          bucket.totalSpent += record.price;
          bucket.items[record.id] = bucket.items[record.id] || { count: 0, totalPrice: 0 };
          bucket.items[record.id].count++;
          bucket.items[record.id].totalPrice += record.price;
        }
        ph.records = phToKeep;
        phChanged = true;
      }
      const ih = s.incomeHistory;
      const ihToArchive = [];
      const ihToKeep = [];
      for (const record of ih.records) {
        const m = record.month || record.date.slice(0, 7);
        if (recentMonths.has(m)) {
          ihToKeep.push(record);
        } else {
          ihToArchive.push(record);
        }
      }
      if (ihToArchive.length > 0) {
        for (const record of ihToArchive) {
          const m = record.month || record.date.slice(0, 7);
          if (!ih.archive[m]) {
            ih.archive[m] = { totalEarned: 0, totalCount: 0 };
          }
          ih.archive[m].totalCount++;
          ih.archive[m].totalEarned += record.amount;
        }
        ih.records = ihToKeep;
        ihChanged = true;
      }
      if (phChanged) await storageManager.putPurchaseHistory(ph);
      if (ihChanged) await storageManager.putIncomeHistory(ih);
    },
    /** 全量购买计数（records + archive） */
    getPurchaseCounts() {
      const s = store.state;
      const counts = {};
      for (const r of s.purchaseHistory.records) {
        counts[r.id] = (counts[r.id] || 0) + 1;
      }
      for (const monthData of Object.values(s.purchaseHistory.archive)) {
        for (const [id, info] of Object.entries(monthData.items || {})) {
          counts[id] = (counts[id] || 0) + info.count;
        }
      }
      return counts;
    },
    /** 当前可用余额（扣除冻结的今日收入） */
    getAvailableBalance() {
      const { balance, stats } = store.state;
      return Math.max(0, parseFloat((balance - (stats.todayEarnings || 0)).toFixed(2)));
    },
    /**
     * 基于 incomeHistory / purchaseHistory / balance 重新计算 stats，
     * 确保 stats 始终是派生事实，而非独立缓存。
     */
    recalibrateStats() {
      const s = store.state;
      const today = (/* @__PURE__ */ new Date()).toDateString();
      const todayIncomes = (s.incomeHistory?.records || []).filter(
        (inc) => new Date(inc.date).toDateString() === today
      );
      const todayEarnings = todayIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
      let totalSpent = 0;
      const ph = s.purchaseHistory || { records: [], archive: {} };
      for (const r of ph.records) totalSpent += r.price || 0;
      for (const monthData of Object.values(ph.archive || {})) {
        totalSpent += monthData?.totalSpent || 0;
      }
      const balance = parseFloat(s.balance) || 0;
      s.stats = {
        todayEarnings,
        totalSpent,
        totalEarnings: parseFloat((balance + totalSpent).toFixed(2)),
        date: today
      };
    }
  };
  window.WalletService = WalletService2;

  // assets/scripts/services/CustomTemplateManager.js
  var CustomTemplateManager_exports = {};
  __export(CustomTemplateManager_exports, {
    CustomTemplateManager: () => CustomTemplateManager2,
    MAX_CUSTOM_TEMPLATES: () => MAX_CUSTOM_TEMPLATES
  });
  var MAX_CUSTOM_TEMPLATES = 20;
  var CustomTemplateManager2 = {
    _cache: null,
    _loadFromStorage() {
      if (this._cache) return this._cache;
      try {
        const raw = StorageAdapter.get(StorageKeys.CUSTOM_TEMPLATES);
        this._cache = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(this._cache)) this._cache = [];
      } catch (e) {
        console.error("Failed to load custom templates:", e);
        this._cache = [];
      }
      return this._cache;
    },
    _saveToStorage() {
      try {
        StorageAdapter.setJSON(StorageKeys.CUSTOM_TEMPLATES, this._cache || []);
      } catch (e) {
        console.error("Failed to save custom templates:", e);
        Toast.showToast("\u4FDD\u5B58\u6A21\u677F\u5931\u8D25", "error");
      }
    },
    getAll() {
      return this._loadFromStorage();
    },
    getAllAsTemplates() {
      return this._loadFromStorage().map((t) => ({
        id: t.id,
        name: t.name,
        desc: t.desc || "\u6211\u7684\u81EA\u5B9A\u4E49\u6A21\u677F",
        icon: LucideUtils.createIcon(t.iconName || "star", { size: 32, strokeWidth: 1.5 }),
        data: t.data,
        isCustom: true
      }));
    },
    add({ name, desc, iconName, data }) {
      if (!name || !data) {
        throw new Error("\u6A21\u677F\u540D\u79F0\u548C\u6570\u636E\u4E0D\u80FD\u4E3A\u7A7A");
      }
      const list = this._loadFromStorage();
      if (list.length >= MAX_CUSTOM_TEMPLATES) {
        throw new Error(`\u81EA\u5B9A\u4E49\u6A21\u677F\u5DF2\u8FBE\u4E0A\u9650\uFF08${MAX_CUSTOM_TEMPLATES}\u4E2A\uFF09`);
      }
      const template = {
        id: "custom_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        name: String(name).trim().slice(0, 30),
        desc: String(desc || "").trim().slice(0, 60),
        iconName: iconName || "star",
        data: {
          icon: data.icon || "",
          title: data.title || name,
          meta: data.meta || "",
          category: data.category || "work",
          progress: 0,
          items: (data.items || []).map((it) => ({
            name: it.name || "\u65B0\u5B50\u9879\u76EE",
            percent: 0,
            detail: it.detail || "",
            startValue: it.startValue || "0",
            targetValue: it.targetValue || "100",
            currentValue: it.currentValue || "0",
            dailyMin: it.dailyMin || "",
            taskDayType: it.taskDayType || "daily",
            taskDayConfig: it.taskDayConfig || ""
          }))
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      list.push(template);
      this._saveToStorage();
      return template;
    },
    remove(id) {
      const list = this._loadFromStorage();
      const idx = list.findIndex((t) => t.id === id);
      if (idx >= 0) {
        list.splice(idx, 1);
        this._saveToStorage();
        return true;
      }
      return false;
    },
    clear() {
      this._cache = [];
      this._saveToStorage();
    },
    count() {
      return this._loadFromStorage().length;
    }
  };
  window.CustomTemplateManager = CustomTemplateManager2;

  // assets/scripts/modules/goals/healthScore.js
  var healthScore_exports = {};
  __export(healthScore_exports, {
    GoalHealthScore: () => GoalHealthScore2,
    TUNING: () => TUNING
  });
  var TUNING = {
    // 三层总分权重（100% = L1 + L2 + L3
    WEIGHT_L1: 0.45,
    WEIGHT_L2: 0.3,
    WEIGHT_L3: 0.25,
    // L1 内部子项权重（占 L1 的 45% 总权重
    L1_ON_TIME: 0.3,
    L1_MODERATE_EARLY: 0.1,
    L1_WEEKLY_ACTIVE: 0.05,
    // L2 内部子项权重（占 L2 的 30% 总权重
    L2_PROGRESS_TREND: 0.2,
    L2_COMPLETION_TREND: 0.1,
    // L3 内部平衡分权重（占 L3 的 25% 总权重
    L3_BALANCE: 0.1,
    // 进度均衡度（剩余部分来自各种惩罚
    // 周活跃度 / 进度趋势的回溯天数
    RECENT_DAYS: 7,
    // 停滞检测的最大回溯天数
    STAGNATION_WINDOW: 60,
    // 过度超前 / 拖延的宽容天数与惩罚系数
    TOLERANCE_EARLY_DAYS: 3,
    // 超过此天数开始算"过度超前"
    OVER_EARLY_PENALTY_MAX: 50,
    OVER_EARLY_PENALTY_RATE: 5,
    TOLERANCE_DELAY_DAYS: 3,
    DELAY_PENALTY_MAX: 30,
    DELAY_PENALTY_RATE: 3,
    // 停滞惩罚的指数曲线（days / 5) ^ 1.5
    STAGNATION_EXPONENT: 1.5,
    STAGNATION_DIVISOR: 5,
    STAGNATION_PENALTY_MAX: 40,
    // 平衡分惩罚系数（stdDev * X 作为扣减
    BALANCE_PENALTY_RATE: 1.5,
    // L2 进度趋势的判定阈值
    TREND_ACCEL_THRESHOLD: 5,
    // diff > 5 算"加速"
    // 建议系统阈值
    SUGGESTION_LOW: 60,
    SUGGESTION_HIGH: 85,
    // 综合趋势映射
    TREND_STRONG_HIGH: 75,
    TREND_WEAK_HIGH: 60,
    TREND_STRONG_LOW: 40,
    TREND_WEAK_LOW: 55,
    // 等级划分阈值
    LEVEL_EXCELLENT: 85,
    LEVEL_GOOD: 70,
    LEVEL_WARNING: 50,
    // 诊断系统阈值
    HINT_L1: 70,
    HINT_L2: 60,
    HINT_L3: 70,
    HINT_LATE_GOAL_SCORE: 60,
    HINT_STAGNATION_PENALTY: 15,
    HINT_BALANCE_SCORE: 60,
    HINT_HIGH_SCORE: 90
  };
  var GoalHealthScore2 = {
    LEVELS: {
      excellent: { label: "\u4F18\u79C0", min: TUNING.LEVEL_EXCELLENT, color: "var(--bamboo-primary)" },
      good: { label: "\u826F\u597D", min: TUNING.LEVEL_GOOD, color: "var(--bamboo-light)" },
      warning: { label: "\u9700\u5173\u6CE8", min: TUNING.LEVEL_WARNING, color: "#f59e0b" },
      risk: { label: "\u98CE\u9669", min: 0, color: "#dc3545" }
    },
    HOLIDAYS: (() => {
      const h = /* @__PURE__ */ new Set();
      const addForYear = (year, m, d) => h.add(`${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      [currentYear, currentYear + 1].forEach((y) => {
        const add = (m, d) => addForYear(y, m, d);
        add(1, 1);
        add(5, 1);
        add(5, 2);
        add(5, 3);
        add(10, 1);
        add(10, 2);
        add(10, 3);
        add(10, 4);
        add(10, 5);
        add(10, 6);
        add(10, 7);
        add(4, 4);
        add(4, 5);
        add(4, 6);
        add(6, 9);
        add(6, 10);
        add(9, 14);
        add(9, 15);
        add(9, 16);
      });
      if (currentYear <= 2025 && 2025 <= currentYear + 1) {
        [
          "2025-01-28",
          "2025-01-29",
          "2025-01-30",
          "2025-01-31",
          "2025-02-01",
          "2025-02-02",
          "2025-02-03",
          "2025-02-04"
        ].forEach((d) => h.add(d));
      }
      if (currentYear <= 2026 && 2026 <= currentYear + 1) {
        [
          "2026-02-16",
          "2026-02-17",
          "2026-02-18",
          "2026-02-19",
          "2026-02-20",
          "2026-02-21",
          "2026-02-22"
        ].forEach((d) => h.add(d));
      }
      return h;
    })(),
    _isWorkday(d) {
      const day = d.getDay();
      if (day === 0 || day === 6) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return !this.HOLIDAYS.has(key);
    },
    _countWorkdays(from, to) {
      let count = 0;
      const cur = new Date(from);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(0, 0, 0, 0);
      while (cur < end) {
        if (this._isWorkday(cur)) count++;
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    },
    _workdaysBetween(from, to) {
      const a = new Date(from);
      a.setHours(0, 0, 0, 0);
      const b = new Date(to);
      b.setHours(0, 0, 0, 0);
      if (b >= a) return this._countWorkdays(a, b);
      return -this._countWorkdays(b, a);
    },
    _today() {
      const d = /* @__PURE__ */ new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
    _fmt(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    _clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    },
    /**
     * 预处理缓存：一次性扫描目标所需的 N 天历史数据，避免每个目标反复扫描 store.state.data
     *
     * cache = {
     *   byDateKey: {
     *     "2026-06-10": { goalId1: { active: true/false, completions: N, progress: num|undefined }, goalId2: ... }
     *     ... 最多覆盖 STAGNATION_WINDOW 天
     *   },
     *   goalIds: [goalId1, goalId2, ...]
     * }
     */
    _buildDataCache(goals, days) {
      days = days || TUNING.STAGNATION_WINDOW;
      const today = this._today();
      const byDateKey = {};
      const goalIds = (goals || []).map((g) => g.id);
      const allData = store && store.getState && store.getState() && store.getState().data || {};
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = this._fmt(d);
        const dayData = allData[key];
        if (!dayData) continue;
        const completionsByGoal = dayData.goalTaskCompletions;
        const progressMap = dayData.goalProgress;
        if (!completionsByGoal && !progressMap) continue;
        const entry = {};
        for (let j = 0; j < goalIds.length; j++) {
          const gid = goalIds[j];
          let active = false;
          let count = 0;
          if (completionsByGoal && completionsByGoal[gid]) {
            const vals = Object.values(completionsByGoal[gid]);
            for (let k = 0; k < vals.length; k++) {
              if (vals[k]) {
                active = true;
                count++;
              }
            }
          }
          const prog = progressMap ? progressMap[gid] : void 0;
          if (active || prog !== void 0) {
            entry[gid] = { active, completions: count, progress: prog };
          }
        }
        if (Object.keys(entry).length > 0) {
          byDateKey[key] = entry;
        }
      }
      return { byDateKey, goalIds, today };
    },
    /**
     * 基于缓存快速获取某个 goal 在某一天的活跃状态（是否有完成记录）
     */
    _cacheActiveOnDate(cache, goalId, dateKey) {
      if (!cache || !cache.byDateKey) return false;
      const day = cache.byDateKey[dateKey];
      if (!day) return false;
      const entry = day[goalId];
      return !!entry && !!entry.active;
    },
    /**
     * 基于缓存快速获取某个 goal 在某一天的子项完成数
     */
    _cacheCompletionsOnDate(cache, goalId, dateKey) {
      if (!cache || !cache.byDateKey) return 0;
      const day = cache.byDateKey[dateKey];
      if (!day) return 0;
      const entry = day[goalId];
      return entry ? entry.completions || 0 : 0;
    },
    /**
     * 基于缓存快速获取某个 goal 在某一天的进度快照
     */
    _cacheProgressOnDate(cache, goalId, dateKey) {
      if (!cache || !cache.byDateKey) return void 0;
      const day = cache.byDateKey[dateKey];
      if (!day) return void 0;
      const entry = day[goalId];
      return entry ? entry.progress : void 0;
    },
    compute(goal, cache) {
      if (!goal) return this._empty();
      const items = Array.isArray(goal.items) ? goal.items : [];
      const progress = this._clamp(Number(goal.progress) || 0, 0, 100);
      const isComplete = progress >= 100;
      const L1 = this._scoreL1(goal, items, progress, isComplete, cache);
      const L2 = this._scoreL2(goal, items, progress, isComplete, cache);
      const L3 = this._scoreL3(goal, items, progress, isComplete, cache);
      const score = this._clamp(Math.round(
        L1.score * TUNING.WEIGHT_L1 + L2.score * TUNING.WEIGHT_L2 + L3.score * TUNING.WEIGHT_L3
      ), 0, 100);
      const level = this._levelFor(score);
      return {
        score,
        level,
        label: this.LEVELS[level].label,
        color: this.LEVELS[level].color,
        L1,
        L2,
        L3
      };
    },
    /**
     * Compute aggregate health metrics for a set of goals.
     *
     * @param {Array} goals - list of goal objects
     * @param {Object|null} preComputedOrCache - either:
     *   - null/undefined: auto-build cache and compute results from scratch
     *   - Object with .score fields (pre-computed results array — one per goal, same order);
     *     if so these are used directly (0 extra store reads).
     *   - else treated as dataCache object: builds results using it.
     */
    computeSet(goals, preComputedOrCache) {
      if (!goals || goals.length === 0) {
        return { avgScore: 0, avgLevel: "risk", avgLabel: "\u2014", avgColor: "#999", count: 0, L1: 0, L2: 0, L3: 0, trend: 0 };
      }
      let results;
      if (Array.isArray(preComputedOrCache) && preComputedOrCache.length === goals.length && preComputedOrCache[0] && typeof preComputedOrCache[0].score === "number") {
        results = preComputedOrCache;
      } else {
        const dataCache = preComputedOrCache && !Array.isArray(preComputedOrCache) ? preComputedOrCache : this._buildDataCache(goals, TUNING.STAGNATION_WINDOW);
        results = goals.map((g) => this.compute(g, dataCache));
      }
      const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
      const avgL1 = Math.round(results.reduce((s, r) => s + r.L1.score, 0) / results.length);
      const avgL2 = Math.round(results.reduce((s, r) => s + r.L2.score, 0) / results.length);
      const avgL3 = Math.round(results.reduce((s, r) => s + r.L3.score, 0) / results.length);
      const avgLevel = this._levelFor(avgScore);
      let trend = 0;
      const avgL2Score = results.reduce((s, r) => s + r.L2.score, 0) / results.length;
      if (avgL2Score >= TUNING.TREND_STRONG_HIGH) trend = 3;
      else if (avgL2Score >= TUNING.TREND_WEAK_HIGH) trend = 1;
      else if (avgL2Score < TUNING.TREND_STRONG_LOW) trend = -3;
      else if (avgL2Score < TUNING.TREND_WEAK_LOW) trend = -1;
      return {
        avgScore,
        avgLevel,
        avgLabel: this.LEVELS[avgLevel].label,
        avgColor: this.LEVELS[avgLevel].color,
        count: goals.length,
        L1: avgL1,
        L2: avgL2,
        L3: avgL3,
        trend
      };
    },
    // ─── L1 基础健康分（履约能力）45% ───
    _scoreL1(goal, items, progress, isComplete, cache) {
      const onTime = this._scoreOnTime(goal, progress, isComplete);
      const moderateEarly = this._scoreModerateEarly(goal, progress, isComplete);
      const weeklyActive = this._scoreWeeklyActive(goal, items, cache);
      const score = this._clamp(Math.round(
        (onTime.score * TUNING.L1_ON_TIME + moderateEarly.score * TUNING.L1_MODERATE_EARLY + weeklyActive.score * TUNING.L1_WEEKLY_ACTIVE) / (TUNING.L1_ON_TIME + TUNING.L1_MODERATE_EARLY + TUNING.L1_WEEKLY_ACTIVE)
      ), 0, 100);
      return { score: Math.round(score), onTime, moderateEarly, weeklyActive };
    },
    _scoreOnTime(goal, progress, isComplete) {
      if (!goal.endDate) return { score: 70, hint: "\u672A\u8BBE\u622A\u6B62\u65E5\u671F" };
      if (goal.startDate && goal.endDate) {
        const s = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
        const e = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
        if (s > e) return { score: 0, hint: "\u65E5\u671F\u8303\u56F4\u5F02\u5E38" };
      }
      const today = this._today();
      const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
      end.setHours(0, 0, 0, 0);
      const daysToDeadline = this._workdaysBetween(today, end);
      if (isComplete) {
        if (daysToDeadline >= -TUNING.TOLERANCE_DELAY_DAYS && daysToDeadline <= 0) return { score: 100, hint: "\u6309\u65F6\u5B8C\u6210" };
        if (daysToDeadline > 0) return { score: 100, hint: "\u63D0\u524D\u5B8C\u6210" };
        const late = Math.abs(daysToDeadline);
        const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
        return { score: this._clamp(100 - penalty, 0, 100), hint: `\u62D6\u5EF6${late}\u4E2A\u5DE5\u4F5C\u65E5` };
      }
      if (daysToDeadline < -TUNING.TOLERANCE_DELAY_DAYS) {
        const late = Math.abs(daysToDeadline);
        const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
        return { score: this._clamp(70 - penalty, 0, 100), hint: `\u5DF2\u903E\u671F${late}\u4E2A\u5DE5\u4F5C\u65E5` };
      }
      if (!goal.startDate) return { score: 65, hint: "\u672A\u8BBE\u5F00\u59CB\u65E5\u671F" };
      const start = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
      start.setHours(0, 0, 0, 0);
      if (today < start) return { score: 80, hint: "\u5C1A\u672A\u5F00\u59CB" };
      const totalWorkdays = this._countWorkdays(start, end);
      const elapsedWorkdays = this._countWorkdays(start, today);
      const expected = totalWorkdays > 0 ? elapsedWorkdays / totalWorkdays * 100 : 50;
      const diff = progress - expected;
      if (diff >= 0) return { score: 100, hint: "\u8FDB\u5EA6\u8FBE\u6807" };
      if (diff > -15) return { score: this._clamp(85 + diff, 0, 100), hint: "\u8F7B\u5FAE\u843D\u540E" };
      if (diff > -30) return { score: this._clamp(60 + diff * 0.5, 0, 100), hint: "\u660E\u663E\u843D\u540E" };
      return { score: this._clamp(40 + diff * 0.2, 0, 100), hint: "\u4E25\u91CD\u843D\u540E" };
    },
    _scoreModerateEarly(goal, progress, isComplete) {
      if (!goal.endDate) return { score: 70, hint: "\u672A\u8BBE\u622A\u6B62\u65E5\u671F" };
      const today = this._today();
      const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
      end.setHours(0, 0, 0, 0);
      const daysToDeadline = this._workdaysBetween(today, end);
      if (isComplete) {
        if (daysToDeadline >= 1 && daysToDeadline <= TUNING.TOLERANCE_EARLY_DAYS) return { score: 80, hint: "\u9002\u5EA6\u63D0\u524D" };
        if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS) {
          const penalty = Math.min(TUNING.OVER_EARLY_PENALTY_MAX, daysToDeadline * TUNING.OVER_EARLY_PENALTY_RATE);
          return { score: this._clamp(80 - penalty, 0, 100), hint: `\u8FC7\u5EA6\u8D85\u524D${daysToDeadline}\u5929` };
        }
        return { score: 100, hint: "\u6309\u65F6\u5B8C\u6210" };
      }
      if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS && progress >= 90) return { score: 75, hint: "\u63A5\u8FD1\u5B8C\u6210" };
      return { score: 70, hint: "\u8FDB\u884C\u4E2D" };
    },
    _scoreWeeklyActive(goal, items, cache) {
      const today = this._today();
      let activeDays = 0;
      for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (!this._isWorkday(d)) continue;
        const key = this._fmt(d);
        if (cache) {
          if (this._cacheActiveOnDate(cache, goal.id, key)) activeDays++;
        } else {
          const allData = store.getState && store.getState() && store.getState().data || {};
          const dayData = allData[key];
          if (dayData && dayData.goalTaskCompletions && dayData.goalTaskCompletions[goal.id]) {
            const completions = dayData.goalTaskCompletions[goal.id];
            if (Object.values(completions).some((v) => v)) activeDays++;
          }
        }
      }
      let workdaysThisWeek = 0;
      for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (this._isWorkday(d)) workdaysThisWeek++;
      }
      const ratio = workdaysThisWeek > 0 ? activeDays / workdaysThisWeek : 0;
      return { score: this._clamp(Math.round(ratio * 100), 0, 100), hint: activeDays > 0 ? `\u5468\u6D3B\u8DC3${activeDays}\u5929` : "\u672C\u5468\u65E0\u63A8\u8FDB" };
    },
    // ─── L2 趋势动力分（成长能力）30% ───
    _scoreL2(goal, items, progress, isComplete, cache) {
      const progressTrend = this._scoreProgressTrend(goal, items, progress, isComplete, cache);
      const completionTrend = this._scoreCompletionTrend(goal, items, isComplete, cache);
      const score = this._clamp(Math.round(
        (progressTrend.score * TUNING.L2_PROGRESS_TREND + completionTrend.score * TUNING.L2_COMPLETION_TREND) / (TUNING.L2_PROGRESS_TREND + TUNING.L2_COMPLETION_TREND)
      ), 0, 100);
      return { score: Math.round(score), progressTrend, completionTrend };
    },
    _scoreProgressTrend(goal, items, progress, isComplete, cache) {
      if (isComplete) return { score: 100, hint: "\u5DF2\u5B8C\u6210" };
      if (!goal.startDate || !goal.endDate) return { score: 60, hint: "\u7F3A\u5C11\u65E5\u671F\u4FE1\u606F" };
      if (goal.startDate && goal.endDate) {
        const s = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
        const e = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
        if (s > e) return { score: 0, hint: "\u65E5\u671F\u8303\u56F4\u5F02\u5E38" };
      }
      const today = this._today();
      const start = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
      start.setHours(0, 0, 0, 0);
      if (today <= start) return { score: 50, hint: "\u5C1A\u672A\u5F00\u59CB" };
      const recentDays = TUNING.RECENT_DAYS;
      let recentProgress = 0;
      let olderProgress = 0;
      let recentHasData = false;
      let olderHasData = false;
      if (cache) {
        for (let i = 0; i < recentDays; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          const p = this._cacheProgressOnDate(cache, goal.id, key);
          if (p !== void 0) {
            recentProgress = p;
            recentHasData = true;
            break;
          }
        }
        for (let i = recentDays; i < recentDays * 2; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          const p = this._cacheProgressOnDate(cache, goal.id, key);
          if (p !== void 0) {
            olderProgress = p;
            olderHasData = true;
            break;
          }
        }
      } else {
        const allData = store.getState && store.getState() && store.getState().data || {};
        for (let i = 0; i < recentDays; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          if (allData[key] && allData[key].goalProgress && allData[key].goalProgress[goal.id] !== void 0) {
            recentProgress = allData[key].goalProgress[goal.id];
            recentHasData = true;
            break;
          }
        }
        for (let i = recentDays; i < recentDays * 2; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          if (allData[key] && allData[key].goalProgress && allData[key].goalProgress[goal.id] !== void 0) {
            olderProgress = allData[key].goalProgress[goal.id];
            olderHasData = true;
            break;
          }
        }
      }
      if (!recentHasData && !olderHasData) {
        const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
        end.setHours(0, 0, 0, 0);
        const totalWd = this._countWorkdays(start, end);
        const elapsedWd = this._countWorkdays(start, today);
        const expected = totalWd > 0 ? elapsedWd / totalWd * 100 : 50;
        const diff2 = progress - expected;
        if (diff2 >= 0) return { score: 80, hint: "\u8FDB\u5EA6\u6B63\u5E38" };
        if (diff2 > -20) return { score: 60, hint: "\u7A0D\u6709\u843D\u540E" };
        return { score: 40, hint: "\u8FDB\u5EA6\u504F\u6162" };
      }
      if (!olderHasData) return { score: 65, hint: "\u6570\u636E\u4E0D\u8DB3" };
      const diff = recentProgress - olderProgress;
      if (diff > TUNING.TREND_ACCEL_THRESHOLD) return { score: 90, hint: "\u8FDB\u5EA6\u52A0\u901F" };
      if (diff > 0) return { score: 75, hint: "\u7A33\u6B65\u63A8\u8FDB" };
      if (diff === 0) return { score: 50, hint: "\u8FDB\u5EA6\u505C\u6EDE" };
      return { score: 30, hint: "\u8FDB\u5EA6\u5012\u9000" };
    },
    _scoreCompletionTrend(goal, items, isComplete, cache) {
      if (isComplete) return { score: 100, hint: "\u5DF2\u5B8C\u6210" };
      if (!items || items.length === 0) return { score: 60, hint: "\u65E0\u5B50\u9879" };
      const today = this._today();
      let recentCompletions = 0;
      let olderCompletions = 0;
      if (cache) {
        for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          recentCompletions += this._cacheCompletionsOnDate(cache, goal.id, key);
        }
        for (let i = TUNING.RECENT_DAYS; i < TUNING.RECENT_DAYS * 2; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          olderCompletions += this._cacheCompletionsOnDate(cache, goal.id, key);
        }
      } else {
        const allData = store.getState && store.getState() && store.getState().data || {};
        for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          if (allData[key] && allData[key].goalTaskCompletions && allData[key].goalTaskCompletions[goal.id]) {
            Object.values(allData[key].goalTaskCompletions[goal.id]).forEach((v) => {
              if (v) recentCompletions++;
            });
          }
        }
        for (let i = TUNING.RECENT_DAYS; i < TUNING.RECENT_DAYS * 2; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          if (allData[key] && allData[key].goalTaskCompletions && allData[key].goalTaskCompletions[goal.id]) {
            Object.values(allData[key].goalTaskCompletions[goal.id]).forEach((v) => {
              if (v) olderCompletions++;
            });
          }
        }
      }
      if (recentCompletions === 0 && olderCompletions === 0) return { score: 50, hint: "\u8FD1\u671F\u65E0\u5B8C\u6210" };
      if (recentCompletions > olderCompletions) return { score: 85, hint: "\u5B8C\u6210\u52A0\u901F" };
      if (recentCompletions === olderCompletions) return { score: 65, hint: "\u5B8C\u6210\u7A33\u5B9A" };
      return { score: 40, hint: "\u5B8C\u6210\u653E\u7F13" };
    },
    // ─── L3 可持续性分（健康程度）25% ───
    _scoreL3(goal, items, progress, isComplete, cache) {
      const stagnation = this._scoreStagnation(goal, items, progress, isComplete, cache);
      const balance = this._scoreBalance(items, isComplete);
      const overEarly = this._scoreOverEarly(goal, progress, isComplete);
      const delay = this._scoreDelay(goal, progress, isComplete);
      let score = 100;
      score -= stagnation.penalty;
      score = score * (1 - TUNING.L3_BALANCE) + balance.score * TUNING.L3_BALANCE;
      score -= overEarly.penalty;
      score -= delay.penalty;
      return {
        score: this._clamp(Math.round(score), 0, 100),
        stagnation,
        balance,
        overEarly,
        delay
      };
    },
    _scoreStagnation(goal, items, progress, isComplete, cache) {
      if (isComplete) return { penalty: 0, hint: "\u5DF2\u5B8C\u6210" };
      if (!goal.startDate) return { penalty: 0, hint: "\u65E0\u5F00\u59CB\u65E5\u671F" };
      const today = this._today();
      const start = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
      start.setHours(0, 0, 0, 0);
      if (today <= start) return { penalty: 0, hint: "\u5C1A\u672A\u5F00\u59CB" };
      let lastActiveDate = null;
      if (cache) {
        for (let i = 0; i < TUNING.STAGNATION_WINDOW; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          if (this._cacheActiveOnDate(cache, goal.id, key)) {
            lastActiveDate = d;
            break;
          }
        }
      } else {
        const allData = store.getState && store.getState() && store.getState().data || {};
        for (let i = 0; i < TUNING.STAGNATION_WINDOW; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = this._fmt(d);
          if (allData[key] && allData[key].goalTaskCompletions && allData[key].goalTaskCompletions[goal.id]) {
            const completions = allData[key].goalTaskCompletions[goal.id];
            if (Object.values(completions).some((v) => v)) {
              lastActiveDate = d;
              break;
            }
          }
        }
      }
      if (!lastActiveDate) {
        const stagnantDays2 = this._workdaysBetween(start, today);
        const penalty2 = Math.min(
          TUNING.STAGNATION_PENALTY_MAX,
          Math.pow(stagnantDays2 / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT)
        );
        return { penalty: Math.round(penalty2), hint: `\u4ECE\u672A\u63A8\u8FDB(${stagnantDays2}\u5929)` };
      }
      const stagnantDays = this._workdaysBetween(lastActiveDate, today);
      if (stagnantDays <= 2) return { penalty: 0, hint: "\u8FD1\u671F\u6709\u63A8\u8FDB" };
      const penalty = Math.min(
        TUNING.STAGNATION_PENALTY_MAX,
        Math.pow(stagnantDays / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT)
      );
      return { penalty: Math.round(penalty), hint: `\u505C\u6EDE${stagnantDays}\u4E2A\u5DE5\u4F5C\u65E5` };
    },
    _scoreBalance(items, isComplete) {
      if (isComplete) return { score: 100, hint: "\u5DF2\u5B8C\u6210" };
      if (!items || items.length <= 1) return { score: 80, hint: "\u5B50\u9879\u4E0D\u8DB3" };
      const progresses = items.map((it) => {
        const tar = parseFloat(it.targetValue);
        if (tar === 0) {
          const cur2 = parseFloat(it.currentValue) || 0;
          return cur2 === 0 ? 100 : 0;
        }
        const tarSafe = tar || 100;
        const cur = parseFloat(it.currentValue) || 0;
        return cur / tarSafe * 100;
      });
      const avg = progresses.reduce((s, v) => s + v, 0) / progresses.length;
      const variance = progresses.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / progresses.length;
      const stdDev = Math.sqrt(variance);
      const score = this._clamp(Math.round(100 - stdDev * TUNING.BALANCE_PENALTY_RATE), 0, 100);
      return { score, hint: stdDev > 30 ? "\u8FDB\u5EA6\u4E0D\u5747\u8861" : stdDev > 15 ? "\u8FDB\u5EA6\u7565\u6709\u5DEE\u5F02" : "\u8FDB\u5EA6\u5747\u8861" };
    },
    _scoreOverEarly(goal, progress, isComplete) {
      if (!goal.endDate || !isComplete) return { penalty: 0, hint: "" };
      const today = this._today();
      const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
      end.setHours(0, 0, 0, 0);
      const daysEarly = this._workdaysBetween(today, end);
      if (daysEarly > TUNING.TOLERANCE_EARLY_DAYS) {
        const penalty = Math.min(TUNING.OVER_EARLY_PENALTY_MAX, daysEarly * TUNING.OVER_EARLY_PENALTY_RATE);
        return { penalty: Math.round(penalty), hint: `\u8FC7\u5EA6\u8D85\u524D${daysEarly}\u5929` };
      }
      return { penalty: 0, hint: "" };
    },
    _scoreDelay(goal, progress, isComplete) {
      if (!goal.endDate) return { penalty: 0, hint: "" };
      const today = this._today();
      const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
      end.setHours(0, 0, 0, 0);
      const daysLate = this._workdaysBetween(end, today);
      if (daysLate > TUNING.TOLERANCE_DELAY_DAYS) {
        const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, daysLate * TUNING.DELAY_PENALTY_RATE);
        return { penalty: Math.round(penalty), hint: `\u62D6\u5EF6${daysLate}\u5929` };
      }
      return { penalty: 0, hint: "" };
    },
    // ─── 渲染 ───
    renderOverviewCard(goals) {
      if (!goals || goals.length === 0) {
        return `
                <div class="goal-health-overview goal-health-empty" role="region" aria-label="\u5065\u5EB7\u5206\u7A7A\u72B6\u6001">
                    <div class="gho-empty-icon">${LucideUtils.createIcon("target", { size: 14 })}</div>
                    <span class="gho-empty-text">\u6682\u65E0\u5065\u5EB7\u6570\u636E</span>
                </div>
            `;
      }
      const set = this.computeSet(goals);
      const colors = {
        excellent: { start: "var(--bamboo-primary)", end: "var(--bamboo-light)" },
        good: { start: "var(--bamboo-light)", end: "var(--bamboo-pale)" },
        warning: { start: "#E6A252", end: "#F0C88A" },
        risk: { start: "#E47878", end: "#F0A0A0" }
      }[set.avgLevel] || { start: "var(--bamboo-light)", end: "var(--bamboo-pale)" };
      const stroke = 4.5;
      const size = 52;
      const r = (size - stroke) / 2;
      const c = 2 * Math.PI * r;
      const off = c - set.avgScore / 100 * c;
      const suggestion = this._generateSuggestion(set);
      const gradientId = "hlg-" + Math.random().toString(36).slice(2, 8);
      return `
            <div class="goal-health-overview"
                 style="--health-color:${colors.start};--ring-stroke:${colors.start}"
                 role="button"
                 tabindex="0"
                 aria-label="\u7EFC\u5408\u5065\u5EB7\u5206 ${set.avgScore} \u5206\uFF0C${set.avgLabel}\uFF0C\u5171 ${set.count} \u4E2A\u76EE\u6807\u3002\u70B9\u51FB\u67E5\u770B\u8BE6\u7EC6\u5206\u6790"
                 aria-haspopup="dialog"
                 aria-pressed="false">
                <div class="gho-left">
                    <div class="gho-ring">
                        <svg class="gho-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
                            <defs>
                                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="${colors.start}"/>
                                    <stop offset="100%" stop-color="${colors.end}"/>
                                </linearGradient>
                            </defs>
                            <circle class="gho-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"/>
                            <circle class="gho-progress" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
                                stroke="url(#${gradientId})" stroke-width="${stroke}" stroke-linecap="round"
                                style="stroke-dasharray:${c};stroke-dashoffset:${off}"/>
                        </svg>
                        <div class="gho-center">
                            <span class="gho-score">${set.avgScore}</span>
                        </div>
                    </div>
                    <span class="gho-label">${set.avgLabel}</span>
                </div>
                <div class="gho-divider"></div>
                <div class="gho-metrics">
                    <div class="gho-metric">
                        <span class="gho-metric-dot" style="background:${colors.start}"></span>
                        <span class="gho-metric-name">\u6267\u884C</span>
                        <span class="gho-metric-val">${set.L1}</span>
                    </div>
                    <div class="gho-metric">
                        <span class="gho-metric-dot" style="background:var(--bamboo-light)"></span>
                        <span class="gho-metric-name">\u52A8\u529B</span>
                        <span class="gho-metric-val">${set.L2}</span>
                    </div>
                    <div class="gho-metric">
                        <span class="gho-metric-dot" style="background:#8B7355"></span>
                        <span class="gho-metric-name">\u8282\u594F</span>
                        <span class="gho-metric-val">${set.L3}</span>
                    </div>
                </div>
                <div class="gho-divider"></div>
                <div class="gho-suggestion" title="${suggestion.tip}">
                    <span class="gho-suggestion-icon">${LucideUtils.createIcon(suggestion.icon, { size: 12 })}</span>
                    <span class="gho-suggestion-text">${suggestion.text}</span>
                </div>
                <div class="gho-divider"></div>
                <div class="gho-right">
                    <div class="gho-stat">
                        <span class="gho-stat-icon">${LucideUtils.createIcon("target", { size: 11 })}</span>
                        <span class="gho-stat-val">${set.count}</span>
                        <span class="gho-stat-label">\u76EE\u6807</span>
                    </div>
                </div>
                <button class="gho-review-btn" title="\u6218\u7565\u590D\u76D8">
                    ${LucideUtils.createIcon("barChart", { size: 13 })}
                    <span>\u590D\u76D8</span>
                </button>
            </div>
        `;
    },
    _generateSuggestion(set) {
      const suggestions = [];
      if (set.L1 < TUNING.SUGGESTION_LOW) {
        suggestions.push({ icon: "alertTriangle", text: "\u6267\u884C\u5206\u504F\u4F4E", tip: "\u7B97\u6CD5\u68C0\u6D4B\u5230\u6267\u884C\u80FD\u529B\u4E0D\u8DB3\uFF0C\u5EFA\u8BAE\u589E\u52A0\u4E13\u6CE8\u65F6\u95F4\u6295\u5165" });
      } else if (set.L1 >= TUNING.SUGGESTION_HIGH) {
        suggestions.push({ icon: "checkCircle", text: "\u6267\u884C\u4F18\u79C0", tip: "\u6267\u884C\u80FD\u529B\u5904\u4E8E\u9AD8\u6C34\u5E73\uFF0C\u7EE7\u7EED\u4FDD\u6301" });
      }
      if (set.L2 < TUNING.SUGGESTION_LOW) {
        suggestions.push({ icon: "zap", text: "\u52A8\u529B\u4E0D\u8DB3", tip: "\u8FD1\u671F\u8FDB\u5EA6\u589E\u91CF\u4F4E\u4E8E\u5386\u53F2\u5E73\u5747\uFF0C\u5EFA\u8BAE\u5B8C\u6210\u7B80\u5355\u5B50\u9879\u6FC0\u6D3B\u60EF\u6027" });
      } else if (set.L2 >= TUNING.SUGGESTION_HIGH) {
        suggestions.push({ icon: "flame", text: "\u52A8\u529B\u5145\u6C9B", tip: "\u52A8\u529B\u6307\u6570\u4F18\u79C0\uFF0C\u8D81\u52BF\u63A8\u8FDB\u66F4\u591A\u4EFB\u52A1" });
      }
      if (set.L3 < TUNING.SUGGESTION_LOW) {
        suggestions.push({ icon: "clock", text: "\u8282\u594F\u5931\u8861", tip: "\u68C0\u6D4B\u5230\u9879\u76EE\u505C\u6EDE\u6216\u8FDB\u5EA6\u4E0D\u5747\uFF0C\u5EFA\u8BAE\u5173\u6CE8\u8FB9\u7F18\u5B50\u9879" });
      } else if (set.L3 >= TUNING.SUGGESTION_HIGH) {
        suggestions.push({ icon: "waves", text: "\u8282\u594F\u7A33\u5B9A", tip: "\u8FDB\u5EA6\u5206\u5E03\u5747\u8861\uFF0C\u53EF\u6301\u7EED\u53D1\u5C55\u80FD\u529B\u5F3A" });
      }
      if (suggestions.length === 0) {
        const compliments = [
          { icon: "sparkles", text: "\u72B6\u6001\u6781\u4F73", tip: "\u6240\u6709\u7EF4\u5EA6\u8868\u73B0\u4F18\u79C0\uFF0C\u7EE7\u7EED\u4FDD\u6301\u826F\u597D\u72B6\u6001" },
          { icon: "trophy", text: "\u6218\u7565\u5065\u5EB7", tip: "\u6574\u4F53\u6218\u7565\u6267\u884C\u80FD\u529B\u5904\u4E8E\u6781\u9AD8\u6C34\u5E73" },
          { icon: "heart", text: "\u5065\u5EB7\u6EE1\u5206", tip: "\u76EE\u6807\u5065\u5EB7\u5EA6\u4F18\u79C0\uFF0C\u7EE7\u7EED\u4FDD\u6301" }
        ];
        return compliments[Math.floor(Math.random() * compliments.length)];
      }
      return suggestions[0];
    },
    _levelFor(score) {
      if (score >= TUNING.LEVEL_EXCELLENT) return "excellent";
      if (score >= TUNING.LEVEL_GOOD) return "good";
      if (score >= TUNING.LEVEL_WARNING) return "warning";
      return "risk";
    },
    _empty() {
      return { score: 0, level: "risk", label: "\u2014", color: "#999", L1: { score: 0 }, L2: { score: 0 }, L3: { score: 0 } };
    },
    /**
     * 生成基于算法的动态诊断建议
     * @param {Object} set computeSet 计算出的结果集
     * @param {Array} results 所有目标的详细计算结果
     */
    generateDynamicHints(set, results) {
      const hints = [];
      if (set.L1 < TUNING.HINT_L1) {
        const lateGoals = results.filter((r) => r.L1.onTime.score < TUNING.HINT_LATE_GOAL_SCORE);
        if (lateGoals.length > 0) {
          hints.push({
            type: "danger",
            icon: "calendar",
            text: `\u7B97\u6CD5\u68C0\u6D4B\u5230 ${lateGoals.length} \u4E2A\u9879\u76EE\u8FDB\u5EA6\u4E25\u91CD\u843D\u540E\u4E8E\u8BA1\u5212\u3002`,
            action: "\u6839\u636E\u5F53\u524D\u5B8C\u6210\u901F\u7387\uFF0C\u5EFA\u8BAE\u8C03\u6574\u622A\u6B62\u65E5\u671F\u6216\u7CBE\u7B80\u4EFB\u52A1\u5B50\u9879\u3002"
          });
        } else if (set.L1 < 50) {
          hints.push({
            type: "warning",
            icon: "zap",
            text: "\u7CFB\u7EDF\u76D1\u6D4B\u5230\u672C\u5468\u6D3B\u8DC3\u5929\u6570\u672A\u8FBE\u6807\u3002",
            action: "\u6570\u636E\u8868\u660E\uFF1A\u5C0F\u6B65\u5FEB\u8DD1\u7684\u9891\u7387\u6BD4\u5355\u6B21\u957F\u65F6\u95F4\u6295\u5165\u66F4\u6709\u52A9\u4E8E\u7EF4\u6301\u76EE\u6807\u5065\u5EB7\u3002"
          });
        }
      }
      if (set.L2 < TUNING.HINT_L2) {
        hints.push({
          type: "warning",
          icon: "trending-up",
          text: "\u52A8\u529B\u6307\u6570\u4E0B\u964D\uFF1A\u8FD1\u671F\u8FDB\u5EA6\u589E\u91CF\u4F4E\u4E8E\u5386\u53F2\u5E73\u5747\u6C34\u5E73\u3002",
          action: "\u8BCA\u65AD\uFF1A\u6267\u884C\u52A8\u529B\u8FDB\u5165\u74F6\u9888\u671F\uFF0C\u5EFA\u8BAE\u901A\u8FC7\u5B8C\u6210\u4E00\u4E2A\u7B80\u5355\u7684\u5B50\u9879\u6765\u91CD\u65B0\u6FC0\u6D3B\u60EF\u6027\u3002"
        });
      }
      if (set.L3 < TUNING.HINT_L3) {
        const stagnantGoals = results.filter((r) => r.L3.stagnation.penalty > TUNING.HINT_STAGNATION_PENALTY);
        if (stagnantGoals.length > 0) {
          hints.push({
            type: "danger",
            icon: "clock",
            text: `\u68C0\u6D4B\u5230 ${stagnantGoals.length} \u4E2A\u9879\u76EE\u5DF2\u505C\u6EDE\u8D85\u8FC7\u9884\u671F\u9608\u503C\u3002`,
            action: "\u8B66\u544A\uFF1A\u957F\u671F\u505C\u6EDE\u4F1A\u663E\u8457\u964D\u4F4E\u5B8C\u6210\u6982\u7387\uFF0C\u5EFA\u8BAE\u7ACB\u5373\u590D\u67E5\u9879\u76EE\u53EF\u884C\u6027\u3002"
          });
        }
        const unbalancedGoals = results.filter((r) => r.L3.balance.score < TUNING.HINT_BALANCE_SCORE);
        if (unbalancedGoals.length > 0) {
          hints.push({
            type: "warning",
            icon: "scale",
            text: "\u5B50\u9879\u65B9\u5DEE\u8FC7\u5927\uFF1A\u9879\u76EE\u5185\u90E8\u8FDB\u5EA6\u5206\u5E03\u4E25\u91CD\u4E0D\u5747\u3002",
            action: "\u5EFA\u8BAE\uFF1A\u5173\u6CE8\u88AB\u957F\u671F\u5FFD\u7565\u7684\u8FB9\u7F18\u5B50\u9879\uFF0C\u9632\u6B62\u9879\u76EE\u540E\u671F\u51FA\u73B0\u7ED3\u6784\u6027\u5D29\u584C\u3002"
          });
        }
      }
      if (set.avgScore >= TUNING.HINT_HIGH_SCORE) {
        hints.push({
          type: "success",
          icon: "sparkles",
          text: "\u7B97\u6CD5\u8BC4\u4F30\uFF1A\u6218\u7565\u6267\u884C\u529B\u5904\u4E8E\u6781\u9AD8\u6C34\u5E73\u3002",
          action: "\u5F53\u524D\u6570\u636E\u6A21\u578B\u663E\u793A\u4F60\u5DF2\u5EFA\u7ACB\u7A33\u56FA\u7684\u4E60\u60EF\u95ED\u73AF\uFF0C\u5EFA\u8BAE\u4FDD\u6301\u73B0\u72B6\u3002"
        });
      } else if (hints.length === 0) {
        hints.push({
          type: "success",
          icon: "check-circle",
          text: "\u7CFB\u7EDF\u8BC4\u4F30\uFF1A\u5404\u7EF4\u5EA6\u6570\u636E\u6307\u6807\u5E73\u7A33\u3002",
          action: "\u5EFA\u8BAE\uFF1A\u5F53\u524D\u8282\u594F\u53EF\u6301\u7EED\uFF0C\u53EF\u5C1D\u8BD5\u9010\u6B65\u589E\u52A0\u4EFB\u52A1\u8D1F\u8377\u3002"
        });
      }
      return hints;
    }
  };
  window.GoalHealthScore = GoalHealthScore2;

  // assets/scripts/utils/confirmDialog.js
  var confirmDialog_exports = {};
  __export(confirmDialog_exports, {
    Confirm: () => Confirm2,
    ConfirmDialog: () => ConfirmDialog2
  });
  var ConfirmDialog2 = class {
    constructor() {
      this.defaults = {
        title: "\u786E\u8BA4\u64CD\u4F5C",
        message: "\u786E\u5B9A\u8981\u6267\u884C\u6B64\u64CD\u4F5C\u5417\uFF1F",
        confirmText: "\u786E\u5B9A",
        cancelText: "\u53D6\u6D88",
        confirmClass: "btn-primary",
        cancelClass: "btn-secondary",
        danger: false,
        modal: true,
        closeOnConfirm: true,
        closeOnCancel: true,
        closeOnBackdrop: true,
        focusTrap: true
      };
      this.currentDialog = null;
    }
    show(options = {}) {
      const config = { ...this.defaults, ...options };
      return new Promise((resolve) => {
        if (this.currentDialog) {
          this.closeCurrent();
        }
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        const dialog = document.createElement("div");
        dialog.className = `confirm-dialog ${config.modal ? "" : "confirm-inline"}`;
        if (config.danger) {
          dialog.classList.add("confirm-danger");
        }
        dialog.innerHTML = `
                <div class="confirm-header">
                    <h3 class="confirm-title">${HTMLUtils.escapeHtml(config.title)}</h3>
                </div>
                <div class="confirm-body">
                    <p class="confirm-message">${config.message || ""}</p>
                    ${this._renderExtraOptions(config.extraOptions)}
                </div>
                <div class="confirm-footer">
                    <button class="btn ${HTMLUtils.escapeHtmlAttr(config.cancelClass)} confirm-cancel-btn">
                        ${HTMLUtils.escapeHtml(config.cancelText)}
                    </button>
                    <button class="btn ${HTMLUtils.escapeHtmlAttr(config.confirmClass)} confirm-confirm-btn ${config.danger ? "btn-danger" : ""}">
                        ${HTMLUtils.escapeHtml(config.confirmText)}
                    </button>
                </div>
            `;
        overlay.appendChild(dialog);
        modalMount().appendChild(overlay);
        this.currentDialog = { overlay, dialog, resolve, config };
        requestAnimationFrame(() => {
          overlay.classList.add("confirm-visible");
        });
        const confirmBtn = dialog.querySelector(".confirm-confirm-btn");
        const cancelBtn = dialog.querySelector(".confirm-cancel-btn");
        const collectExtraValues = () => {
          const values = {};
          if (!config.extraOptions) return values;
          if (Array.isArray(config.extraOptions)) {
            config.extraOptions.forEach((group) => {
              const checked = dialog.querySelector(`input[name="${group.key}"]:checked`);
              values[group.key] = checked ? checked.value : (group.choices.find((c) => c.default) || {}).value;
            });
          } else if (config.extraOptions.key) {
            const checked = dialog.querySelector(`input[name="${config.extraOptions.key}"]:checked`);
            values[config.extraOptions.key] = checked ? checked.value : (config.extraOptions.choices.find((c) => c.default) || {}).value;
          }
          return values;
        };
        const cleanupAndResolve = (result) => {
          const hasExtra = !!config.extraOptions;
          if (result === true) {
            this._currentResolved = true;
            resolve(hasExtra ? { confirmed: true, extraValues: collectExtraValues() } : true);
          } else if (result && typeof result === "object" && "confirmed" in result) {
            this._currentResolved = true;
            resolve(result);
          } else {
            this._currentResolved = true;
            resolve(hasExtra ? { confirmed: false, extraValues: {} } : false);
          }
          this.closeCurrent();
        };
        confirmBtn.addEventListener("click", () => {
          if (config.onConfirm) {
            const shouldClose = config.onConfirm();
            if (shouldClose === false && !config.closeOnConfirm) return;
          }
          cleanupAndResolve(true);
        });
        cancelBtn.addEventListener("click", () => {
          if (config.onCancel) {
            const shouldClose = config.onCancel();
            if (shouldClose === false && !config.closeOnCancel) return;
          }
          cleanupAndResolve(false);
        });
        if (config.closeOnBackdrop) {
          overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
              cleanupAndResolve(false);
            }
          });
        }
        if (config.focusTrap) {
          this.trapFocus(dialog, confirmBtn);
        }
        confirmBtn.focus();
      });
    }
    trapFocus(dialog, initialFocus) {
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const trapHandler = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        } else if (e.key === "Escape") {
          this.closeCurrent();
        }
      };
      dialog.addEventListener("keydown", trapHandler);
      dialog._focusTrapHandler = trapHandler;
    }
    closeCurrent() {
      if (!this.currentDialog) return;
      const { overlay, dialog, resolve, config } = this.currentDialog;
      const alreadyResolved = this._currentResolved;
      if (dialog._focusTrapHandler) {
        dialog.removeEventListener("keydown", dialog._focusTrapHandler);
      }
      overlay.classList.remove("confirm-visible");
      overlay.classList.add("confirm-hiding");
      setTimeout(() => {
        overlay.remove();
        if (!alreadyResolved) {
          const hasExtra = !!config.extraOptions;
          resolve(hasExtra ? { confirmed: false, extraValues: {}, dismissed: true } : false);
        }
      }, 200);
      this.currentDialog = null;
    }
    _renderExtraOptions(extraOptions) {
      if (!extraOptions) return "";
      const groups = Array.isArray(extraOptions) ? extraOptions : [extraOptions];
      return groups.map((group) => {
        if (!group || !group.key) return "";
        const labelHtml = group.label ? `<div class="confirm-extra-label">${HTMLUtils.escapeHtml(group.label)}</div>` : "";
        const choicesHtml = (group.choices || []).map((choice) => {
          const checked = choice.default ? "checked" : "";
          return `
                    <label class="confirm-extra-choice">
                        <input type="radio" name="${HTMLUtils.escapeHtmlAttr(group.key)}" value="${HTMLUtils.escapeHtmlAttr(choice.value)}" ${checked}>
                        <span class="confirm-extra-choice-mark"></span>
                        <span class="confirm-extra-choice-label">${HTMLUtils.escapeHtml(choice.label)}</span>
                    </label>
                `;
        }).join("");
        return `<div class="confirm-extra">${labelHtml}<div class="confirm-extra-choices">${choicesHtml}</div></div>`;
      }).join("");
    }
    confirm(options = {}) {
      return this.show(options);
    }
    alert(options = {}) {
      return this.show({
        ...options,
        cancelText: options.okText || "\u786E\u5B9A",
        showCancel: false
      });
    }
    danger(options = {}) {
      return this.show({
        ...options,
        danger: true,
        confirmClass: "btn-danger"
      });
    }
    delete(itemName = "\u6B64\u9879") {
      return this.danger({
        title: "\u786E\u8BA4\u5220\u9664",
        message: `\u786E\u5B9A\u8981\u5220\u9664 ${HTMLUtils.escapeHtml(itemName)} \u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002`,
        confirmText: "\u5220\u9664",
        cancelText: "\u53D6\u6D88"
      });
    }
    confirmDelete(message = "\u786E\u5B9A\u8981\u5220\u9664\u6B64\u9879\u76EE\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002") {
      return this.danger({
        title: "\u786E\u8BA4\u5220\u9664",
        message,
        confirmText: "\u5220\u9664",
        cancelText: "\u53D6\u6D88"
      });
    }
    warning(title, message) {
      return this.show({
        title,
        message,
        confirmText: "\u7EE7\u7EED",
        cancelText: "\u53D6\u6D88"
      });
    }
  };
  var Confirm2 = new ConfirmDialog2();
  window.ConfirmDialog = ConfirmDialog2;
  ConfirmDialog2.confirmDelete = (message) => Confirm2.confirmDelete(message);
  ConfirmDialog2.delete = (itemName) => Confirm2.delete(itemName);
  ConfirmDialog2.danger = (options) => Confirm2.danger(options);
  ConfirmDialog2.confirm = (options) => Confirm2.confirm(options);
  ConfirmDialog2.alert = (options) => Confirm2.alert(options);
  ConfirmDialog2.warning = (title, message) => Confirm2.warning(title, message);

  // assets/scripts/modules/sections/registry.js
  var registry_exports = {};
  __export(registry_exports, {
    SectionRegistry: () => SectionRegistry2
  });
  var SectionRegistry2 = {
    sections: {},
    customSections: [],
    defaultOrder: ["themeEffect", "todo", "timeline", "goals"],
    themes: {
      bamboo: { name: "\u7AF9\u6797\u6E05\u97F5", icon: "TreePine" }
    },
    register(id, config) {
      this.sections[id] = {
        id,
        name: config.name || id,
        icon: config.icon || "FileText",
        description: config.description || "",
        enabled: config.enabled !== false,
        visible: config.visible !== false,
        order: config.order !== void 0 ? config.order : this.defaultOrder.indexOf(id),
        className: config.className || "",
        renderer: config.renderer,
        editor: config.editor,
        dataKey: config.dataKey || id,
        isCustom: config.isCustom || false,
        theme: config.theme || "bamboo"
      };
    },
    get(id) {
      return this.sections[id];
    },
    getAll() {
      return Object.values(this.sections);
    },
    getEnabled() {
      return this.getAll().filter((s) => s.enabled);
    },
    getVisible() {
      return this.getEnabled().filter((s) => s.visible).sort((a, b) => a.order - b.order);
    },
    updateOrder(order) {
      order.forEach((id, index) => {
        if (this.sections[id]) {
          this.sections[id].order = index;
        }
      });
      this.save();
    },
    /** 更新排序但不触发 save（用于 load 恢复时避免循环写入） */
    _updateOrderSilent(order) {
      order.forEach((id, index) => {
        if (this.sections[id]) {
          this.sections[id].order = index;
        }
      });
    },
    toggle(id) {
      if (this.sections[id]) {
        this.sections[id].enabled = !this.sections[id].enabled;
        this.save();
      }
    },
    setVisible(id, visible) {
      if (this.sections[id]) {
        this.sections[id].visible = visible;
        this.save();
      }
    },
    addCustom(config) {
      const id = config.id || `custom_${Date.now()}`;
      this.register(id, {
        ...config,
        id,
        isCustom: true,
        order: this.getAll().length
      });
      this.customSections.push(id);
      this.save();
      return id;
    },
    remove(id) {
      if (this.sections[id] && this.sections[id].isCustom) {
        delete this.sections[id];
        this.customSections = this.customSections.filter((cid) => cid !== id);
        this.save();
        return true;
      }
      return false;
    },
    update(id, config) {
      if (this.sections[id]) {
        Object.assign(this.sections[id], config);
        this.save();
      }
    },
    save() {
      const state = {
        order: this.getVisible().map((s) => s.id),
        // enabled 已 deprecated，与 visible 语义一致，保留仅为向后兼容旧数据
        enabled: this.getAll().filter((s) => s.visible).map((s) => s.id),
        visible: this.getAll().filter((s) => s.visible).map((s) => s.id),
        custom: this.customSections.map((id) => this.sections[id]),
        themes: Object.fromEntries(this.getAll().filter((s) => s.theme).map((s) => [s.id, s.theme]))
      };
      if (typeof storageManager !== "undefined" && storageManager.saveSectionConfig) {
        storageManager.saveSectionConfig(state).catch((e) => {
          console.error("[SectionRegistry] Bridge save failed:", e);
        });
      }
      try {
        StorageAdapter.set(StorageKeys.SECTION_CONFIG, JSON.stringify(state));
      } catch (e) {
        console.error("[SectionRegistry] Failed to save config:", e);
      }
    },
    load() {
      let saved = null;
      if (typeof storageManager !== "undefined" && storageManager.getSectionConfig) {
        saved = storageManager.getSectionConfig();
      }
      if (!saved) {
        try {
          const raw = StorageAdapter.get(StorageKeys.SECTION_CONFIG);
          if (raw) saved = JSON.parse(raw);
        } catch (e) {
          console.error("[SectionRegistry] Failed to load config:", e);
          saved = null;
        }
      }
      if (saved) {
        if (saved.visible && Array.isArray(saved.visible)) {
          Object.keys(this.sections).forEach((id) => {
            this.sections[id].visible = saved.visible.includes(id);
            this.sections[id].enabled = this.sections[id].visible;
          });
        }
        if (saved.order && Array.isArray(saved.order)) {
          this._updateOrderSilent(saved.order);
        }
        if (saved.custom && Array.isArray(saved.custom)) {
          this.customSections = [];
          saved.custom.forEach((cfg) => {
            this.register(cfg);
            this.customSections.push(cfg.id);
          });
        }
        if (saved.themes) {
          Object.keys(saved.themes).forEach((id) => {
            if (this.sections[id]) {
              this.sections[id].theme = saved.themes[id];
            }
          });
        }
      } else {
        const defaultSectionIds = ["themeEffect", "todo", "timeline", "goals"];
        defaultSectionIds.forEach((id) => {
          if (this.sections[id]) {
            this.sections[id].visible = true;
            this.sections[id].enabled = true;
          }
        });
        this.updateOrder(this.defaultOrder);
      }
    },
    /**
     * 桥接就绪后二次应用配置（处理 init 时序问题：bridge 异步，load() 同步执行时桥接未必就绪）
     */
    applyBridgeConfig() {
      if (typeof storageManager === "undefined" || !storageManager.getSectionConfig) return;
      const saved = storageManager.getSectionConfig();
      if (!saved) return;
      if (saved.visible && Array.isArray(saved.visible)) {
        Object.keys(this.sections).forEach((id) => {
          this.sections[id].visible = saved.visible.includes(id);
          this.sections[id].enabled = this.sections[id].visible;
        });
      }
      if (saved.order && Array.isArray(saved.order)) {
        this._updateOrderSilent(saved.order);
      }
      if (saved.themes) {
        Object.keys(saved.themes).forEach((id) => {
          if (this.sections[id]) {
            this.sections[id].theme = saved.themes[id];
          }
        });
      }
      if (typeof renderAll === "function") {
        renderAll();
      }
    }
  };
  window.SectionRegistry = SectionRegistry2;

  // assets/scripts/modules/sections/sectionSettings.js
  var sectionSettings_exports = {};
  __export(sectionSettings_exports, {
    SectionSettings: () => SectionSettings2
  });
  var SectionSettings2 = {
    open(sectionId) {
      const section = SectionRegistry.get(sectionId);
      if (!section) {
        console.error("[SectionSettings] Section not found:", sectionId);
        store?.showToast("\u677F\u5757\u672A\u627E\u5230: " + sectionId, "error");
        return;
      }
      const content = this.renderSettingsContent(section);
      Handlers.openModal(content, LucideUtils.createIcon("settings", { size: 16 }) + "\u677F\u5757\u8BBE\u7F6E", "section-settings-modal");
    },
    renderSettingsContent(section) {
      const sectionIcon = typeof LucideUtils !== "undefined" ? LucideUtils.createIcon(section.icon, { size: 32 }) : section.icon;
      return `
            <div class="section-settings-container">
                <div class="section-settings-header">
                    <div class="section-settings-icon">${sectionIcon}</div>
                    <div class="section-settings-title">${escapeHtml(section.name)}</div>
                    <div class="section-settings-desc">${escapeHtml(section.description)}</div>
                </div>
                <div class="section-settings-actions">
                    <button class="section-settings-btn section-settings-btn-hide" data-action="hide-section" data-section-id="${section.id}">
                        <span class="btn-icon">${LucideUtils.createIcon("xCircle", { size: 16 })}</span>
                        <span class="btn-text">\u9690\u85CF\u677F\u5757</span>
                    </button>
                    <button class="section-settings-btn section-settings-btn-manage" data-action="open-section-manager">
                        <span class="btn-icon">${LucideUtils.createIcon("layoutGrid", { size: 16 })}</span>
                        <span class="btn-text">\u7BA1\u7406\u6240\u6709\u677F\u5757</span>
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">\u5173\u95ED</button>
            </div>
        `;
    }
  };
  ActionDispatcher.registerMany({
    "hide-section": (ds) => SectionManager.hideFromSettings(ds.sectionId),
    "open-section-manager": () => SectionManager.openManagerFromSettings()
  });
  window.SectionSettings = SectionSettings2;

  // assets/scripts/modules/sections/sectionDragDrop.js
  var sectionDragDrop_exports = {};
  __export(sectionDragDrop_exports, {
    SectionDragDrop: () => SectionDragDrop2
  });
  var SectionDragDrop2 = {
    draggedItem: null,
    draggedOverItem: null,
    config: {
      animationDuration: 200,
      ghostClass: "sm-dragging",
      dragOverClass: "sm-drag-over",
      placeholderClass: "sm-drag-placeholder",
      useGhost: true,
      useAnimation: true,
      constrainToContainer: true,
      maxItems: -1,
      filterSelector: null
    },
    instances: /* @__PURE__ */ new Map(),
    createConfig(options = {}) {
      return {
        ...this.config,
        ...options
      };
    },
    init(listElement, options = {}) {
      if (!listElement) return null;
      const instanceId = listElement.id || `dd_${Date.now()}`;
      if (this.instances.has(instanceId)) {
        this.destroy(instanceId);
      }
      const config = this.createConfig(options);
      config.listElement = listElement;
      config.instanceId = instanceId;
      const items = this.getDraggableItems(listElement, config);
      items.forEach((item) => {
        this.setupDragEvents(item, listElement, config);
      });
      this.instances.set(instanceId, {
        listElement,
        config,
        items
      });
      EventBus.emit("dragdrop:initialized", { instanceId, config });
      return instanceId;
    },
    getDraggableItems(listElement, config) {
      let items = listElement.querySelectorAll(".sm-item");
      if (config.filterSelector) {
        items = [...items].filter((item) => item.matches(config.filterSelector));
      }
      return items;
    },
    setupDragEvents(item, listElement, config) {
      item.setAttribute("draggable", "true");
      item.style.cursor = "grab";
      const dragStartHandler = (e) => this.handleDragStart(e, item, listElement, config);
      const dragEndHandler = (e) => this.handleDragEnd(e, item, listElement, config);
      const dragOverHandler = (e) => this.handleDragOver(e, item, listElement, config);
      const dragLeaveHandler = (e) => this.handleDragLeave(e, item, config);
      const dropHandler = (e) => this.handleDrop(e, item, listElement, config);
      item.__dragStartHandler = dragStartHandler;
      item.__dragEndHandler = dragEndHandler;
      item.__dragOverHandler = dragOverHandler;
      item.__dragLeaveHandler = dragLeaveHandler;
      item.__dropHandler = dropHandler;
      item.addEventListener("dragstart", dragStartHandler);
      item.addEventListener("dragend", dragEndHandler);
      item.addEventListener("dragover", dragOverHandler);
      item.addEventListener("dragleave", dragLeaveHandler);
      item.addEventListener("drop", dropHandler);
    },
    handleDragStart(e, item, listElement, config) {
      this.draggedItem = item;
      if (config.useAnimation) {
        item.style.transition = `transform ${config.animationDuration}ms ease`;
      }
      item.classList.add(config.ghostClass);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.dataset.id);
      if (config.onDragStart) {
        config.onDragStart({
          item,
          listElement,
          data: item.dataset.id
        });
      }
      EventBus.emit("dragdrop:dragstart", {
        instanceId: config.instanceId,
        item,
        data: item.dataset.id
      });
      if (config.useGhost) {
        const ghost = item.cloneNode(true);
        ghost.style.opacity = "0.5";
        ghost.style.position = "absolute";
        ghost.style.top = "-9999px";
        modalMount().appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => ghost.remove(), 0);
      }
    },
    handleDragEnd(e, item, listElement, config) {
      item.classList.remove(config.ghostClass);
      item.style.transition = "";
      if (this.draggedItem) {
        listElement.querySelectorAll(`.${config.dragOverClass}`).forEach((el) => {
          el.classList.remove(config.dragOverClass);
        });
      }
      const dragEndData = {
        instanceId: config.instanceId,
        item,
        data: item.dataset.id
      };
      if (config.onDragEnd) {
        config.onDragEnd(dragEndData);
      }
      EventBus.emit("dragdrop:dragend", dragEndData);
      this.draggedItem = null;
    },
    handleDragOver(e, item, listElement, config) {
      if (!this.draggedItem || this.draggedItem === item) return;
      if (config.constrainToContainer && listElement && listElement.isConnected) {
        let rect;
        try {
          rect = listElement.getBoundingClientRect();
        } catch (e2) {
          return;
        }
        if (!rect || rect.width === 0 && rect.height === 0) return;
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
          return;
        }
      }
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      item.classList.add(config.dragOverClass);
    },
    handleDragLeave(e, item, config) {
      item.classList.remove(config.dragOverClass);
    },
    handleDrop(e, item, listElement, config) {
      e.preventDefault();
      item.classList.remove(config.dragOverClass);
      if (!this.draggedItem || this.draggedItem === item) return;
      const dropData = {
        instanceId: config.instanceId,
        draggedItem: this.draggedItem,
        targetItem: item,
        draggedId: this.draggedItem.dataset.id,
        targetId: item.dataset.id
      };
      this.reorderItems(listElement, this.draggedItem, item, config);
      if (config.onDrop) {
        config.onDrop(dropData);
      }
      EventBus.emit("dragdrop:drop", dropData);
    },
    reorderItems(listElement, draggedItem, targetItem, config) {
      const allItems = [...listElement.querySelectorAll(".sm-item:not(.sm-item-hidden)")];
      const draggedIdx = allItems.indexOf(draggedItem);
      const targetIdx = allItems.indexOf(targetItem);
      if (draggedIdx === -1 || targetIdx === -1) return;
      if (draggedIdx < targetIdx) {
        if (config.useAnimation) {
          draggedItem.style.transform = "translateY(" + (targetItem.offsetTop - draggedItem.offsetTop) + "px)";
        }
        listElement.insertBefore(draggedItem, targetItem.nextSibling);
      } else {
        if (config.useAnimation) {
          draggedItem.style.transform = "translateY(" + (targetItem.offsetTop - draggedItem.offsetTop) + "px)";
        }
        listElement.insertBefore(draggedItem, targetItem);
      }
      if (config.useAnimation) {
        setTimeout(() => {
          allItems.forEach((item) => item.style.transform = "");
        }, config.animationDuration);
      }
      setTimeout(() => {
        this.saveOrder(listElement, config);
      }, config.useAnimation ? config.animationDuration : 0);
    },
    saveOrder(listElement, config) {
      if (!listElement) return;
      const items = listElement.querySelectorAll(".sm-item");
      const order = Array.from(items).map((item) => item.dataset.id);
      if (config.onOrderChange) {
        config.onOrderChange(order);
      }
      SectionRegistry.updateOrder(order);
      EventBus.emit("dragdrop:orderChanged", {
        instanceId: config.instanceId,
        order
      });
    },
    destroy(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return false;
      const { listElement, config } = instance;
      const items = this.getDraggableItems(listElement, config);
      items.forEach((item) => {
        if (item.__dragStartHandler) {
          item.removeEventListener("dragstart", item.__dragStartHandler);
        }
        if (item.__dragEndHandler) {
          item.removeEventListener("dragend", item.__dragEndHandler);
        }
        if (item.__dragOverHandler) {
          item.removeEventListener("dragover", item.__dragOverHandler);
        }
        if (item.__dragLeaveHandler) {
          item.removeEventListener("dragleave", item.__dragLeaveHandler);
        }
        if (item.__dropHandler) {
          item.removeEventListener("drop", item.__dropHandler);
        }
        item.removeAttribute("draggable");
        item.style.cursor = "";
      });
      this.instances.delete(instanceId);
      EventBus.emit("dragdrop:destroyed", { instanceId });
      return true;
    },
    destroyAll() {
      const instanceIds = [...this.instances.keys()];
      instanceIds.forEach((id) => this.destroy(id));
    },
    refresh(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return null;
      const { listElement: oldListElement, config } = instance;
      const items = this.getDraggableItems(oldListElement, config);
      items.forEach((item) => {
        if (item.__dragStartHandler) {
          item.removeEventListener("dragstart", item.__dragStartHandler);
          item.removeEventListener("dragend", item.__dragEndHandler);
          item.removeAttribute("draggable");
          item.style.cursor = "";
        }
      });
      const newListElement = byId(oldListElement.id);
      if (newListElement) {
        const newItems = this.getDraggableItems(newListElement, config);
        newItems.forEach((item) => {
          this.setupDragEvents(item, newListElement, config);
        });
        instance.listElement = newListElement;
        instance.items = newItems;
        EventBus.emit("dragdrop:refreshed", { instanceId });
        return instanceId;
      }
      this.instances.delete(instanceId);
      return null;
    },
    getInstance(instanceId) {
      return this.instances.get(instanceId) || null;
    },
    getActiveDraggable() {
      return this.draggedItem;
    },
    isDragging() {
      return this.draggedItem !== null;
    },
    pause(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return false;
      instance.config.isPaused = true;
      return true;
    },
    resume(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return false;
      instance.config.isPaused = false;
      return true;
    },
    addItem(instanceId, itemElement) {
      const instance = this.instances.get(instanceId);
      if (!instance) return false;
      this.setupDragEvents(itemElement, instance.listElement, instance.config);
      instance.items.push(itemElement);
      return true;
    },
    removeItem(instanceId, itemElement) {
      const instance = this.instances.get(instanceId);
      if (!instance) return false;
      itemElement.removeEventListener("dragstart", itemElement.__dragStartHandler);
      itemElement.removeEventListener("dragend", itemElement.__dragEndHandler);
      itemElement.removeAttribute("draggable");
      const index = instance.items.indexOf(itemElement);
      if (index > -1) {
        instance.items.splice(index, 1);
      }
      return true;
    }
  };
  window.SectionDragDrop = SectionDragDrop2;

  // assets/scripts/modules/timeline/renderer.js
  var renderer_exports = {};
  __export(renderer_exports, {
    TimelineRenderer: () => TimelineRenderer2
  });
  var TimelineRenderer2 = {
    render(data) {
      const container = byId("timelinePath");
      if (!container) return;
      if (!data.timeline || data.timeline.length === 0) {
        const iconHtml = typeof LucideUtils !== "undefined" ? LucideUtils.createIcon("treePine", { size: 48 }) : "";
        container.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-icon">${iconHtml}</div>
                    <div class="empty-state-title">\u8BB0\u5F55\u4F60\u7684\u6D3B\u52A8\u65F6\u95F4\u7EBF</div>
                    <div class="empty-state-desc">\u5B8C\u6210\u76EE\u6807\u4EFB\u52A1\u540E\u81EA\u52A8\u8BB0\u5F55</div>
                    <div class="empty-state-hint">\u6309\u51CC\u6668\u3001\u9ECE\u660E\u3001\u6E05\u6668\u3001\u4E0A\u5348\u3001\u4E2D\u5348\u3001\u4E0B\u5348\u3001\u508D\u665A\u3001\u665A\u4E0A\u3001\u6DF1\u591C\u4E5D\u4E2A\u65F6\u6BB5\u8BB0\u5F55</div>
                </div>
            `;
        return;
      }
      const hasTasks = data.timeline.some((period) => period.items && period.items.length > 0);
      if (!hasTasks) {
        const iconHtml = typeof LucideUtils !== "undefined" ? LucideUtils.createIcon("treePine", { size: 48 }) : "";
        container.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-icon">${iconHtml}</div>
                    <div class="empty-state-title">\u8BB0\u5F55\u4F60\u7684\u6D3B\u52A8\u65F6\u95F4\u7EBF</div>
                    <div class="empty-state-desc">\u5B8C\u6210\u76EE\u6807\u4EFB\u52A1\u540E\u81EA\u52A8\u8BB0\u5F55</div>
                    <div class="empty-state-hint">\u6309\u51CC\u6668\u3001\u9ECE\u660E\u3001\u6E05\u6668\u3001\u4E0A\u5348\u3001\u4E2D\u5348\u3001\u4E0B\u5348\u3001\u508D\u665A\u3001\u665A\u4E0A\u3001\u6DF1\u591C\u4E5D\u4E2A\u65F6\u6BB5\u8BB0\u5F55</div>
                </div>
            `;
        return;
      }
      container.innerHTML = data.timeline.map((period, index) => {
        const now = /* @__PURE__ */ new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour + currentMinute / 60;
        const periodHours = {
          lateNight: [0, 4],
          dawn: [4, 5.5],
          earlyMorning: [5.5, 7],
          morning: [7, 12],
          midday: [12, 13],
          afternoon: [13, 17],
          dusk: [17, 18.5],
          evening: [18.5, 22],
          night: [22, 24]
        };
        const isFocus = period.period && periodHours[period.period] && (currentTime >= periodHours[period.period][0] && currentTime < periodHours[period.period][1]);
        const count = period.items?.length || 0;
        let hint = "";
        if (count === 0) {
          hint = "\u8FD9\u4E2A\u65F6\u6BB5\u8FD8\u6CA1\u6709\u8BB0\u5F55\u6D3B\u52A8";
        } else if (count === 1) {
          hint = `\u8FD9\u4E2A\u65F6\u6BB5\u6709 1 \u6761\u6D3B\u52A8\u8BB0\u5F55`;
        } else {
          hint = `\u8FD9\u4E2A\u65F6\u6BB5\u6709 ${count} \u6761\u6D3B\u52A8\u8BB0\u5F55`;
        }
        return `
                <div class="bamboo-node ${isFocus ? "focus-now" : ""}" style="animation-delay: ${index * 0.1}s">
                    <div class="bamboo-card ${period.period}" role="button" tabindex="0" aria-label="${period.name}\u65F6\u95F4\u6BB5" data-action="timeline-toggle" data-index="${index}">
                        <div class="bamboo-card-header">
                            <div class="bamboo-left">
                                <div class="bamboo-info">
                                    <div class="bamboo-icon">${LucideUtils.createIcon(period.icon, { size: 15 })}</div>
                                    <div class="bamboo-title">
                                        <div class="bamboo-name">${escapeHtml(period.name)}</div>
                                        <div class="bamboo-time">${escapeHtml(period.time)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="bamboo-right">
                                <span class="bamboo-count" data-count="${count}" data-hint="${hint}">${count}</span>
                                <div class="bamboo-chevron${!isFocus ? " collapsed" : ""}" id="chevron-${index}">${LucideUtils.createIcon(isFocus ? "chevronDown" : "chevronRight", { size: 14 })}</div>
                            </div>
                            <div class="bamboo-leaf">
                                ${LucideUtils.createIcon("leaf", { size: 16 })}
                            </div>
                        </div>
                        <div class="bamboo-card-content${!isFocus ? " collapsed" : ""}" id="timeline-content-${index}">
                            <div class="bamboo-items">
                                ${(period.items || []).map((item) => `
                                    <div class="bamboo-item">
                                        <div class="bamboo-item-time">${escapeHtml(item.time)}</div>
                                        <div class="bamboo-item-content">
                                            <div class="bamboo-item-task">${escapeHtml(item.task)}</div>
                                            ${item.eval ? `<div class="bamboo-item-eval ${item.eval === "warn" ? "warn" : ""}">${escapeHtml(item.eval)}</div>` : ""}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            `;
      }).join("");
      this.setupHoverEffects();
      this.setupTooltips();
    },
    toggle(index) {
      const content = byId(`timeline-content-${index}`);
      const chevron = byId(`chevron-${index}`);
      if (!content || !chevron) return;
      if (content.classList.contains("collapsed")) {
        content.classList.remove("collapsed");
        chevron.classList.remove("collapsed");
        chevron.innerHTML = LucideUtils.createIcon("chevronDown", { size: 14 });
      } else {
        content.classList.add("collapsed");
        chevron.classList.add("collapsed");
        chevron.innerHTML = LucideUtils.createIcon("chevronRight", { size: 14 });
      }
    },
    setupHoverEffects() {
      if (this._hoverCleanup) this._hoverCleanup();
      const cleanups = [];
      const headers = $$(".bamboo-card-header");
      headers.forEach((header) => {
        const onMouseMove = (e) => {
          const rect = header.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 100;
          const y = (e.clientY - rect.top) / rect.height * 100;
          header.style.setProperty("--mouse-x", `${x}%`);
          header.style.setProperty("--mouse-y", `${y}%`);
        };
        const onMouseLeave = () => {
          header.style.setProperty("--mouse-x", "50%");
          header.style.setProperty("--mouse-y", "50%");
        };
        header.addEventListener("mousemove", onMouseMove);
        header.addEventListener("mouseleave", onMouseLeave);
        cleanups.push(() => {
          header.removeEventListener("mousemove", onMouseMove);
          header.removeEventListener("mouseleave", onMouseLeave);
        });
      });
      this._hoverCleanup = () => cleanups.forEach((fn) => fn());
    },
    setupTooltips() {
      let tooltip = $(".bamboo-tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.className = "bamboo-tooltip";
        modalMount().appendChild(tooltip);
      }
      const counts = $$(".bamboo-count");
      counts.forEach((count) => {
        count.addEventListener("mouseenter", () => {
          const hint = count.dataset.hint;
          if (!hint) return;
          tooltip.textContent = hint;
          tooltip.style.opacity = "1";
          const rect = count.getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();
          let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          let top = rect.top - tooltipRect.height - 8;
          left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
          top = Math.max(8, top);
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
        });
        count.addEventListener("mouseleave", () => {
          tooltip.style.opacity = "0";
        });
        count.addEventListener("mousemove", () => {
          const rect = count.getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();
          let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          let top = rect.top - tooltipRect.height - 8;
          left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
          top = Math.max(8, top);
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
        });
      });
    }
  };
  ActionDispatcher.registerMany({
    "timeline-toggle": (ds) => TimelineRenderer2.toggle(parseInt(ds.index))
  });
  window.TimelineRenderer = TimelineRenderer2;

  // assets/scripts/modules/timeline/editor.js
  var editor_exports = {};
  __export(editor_exports, {
    TimelineEditor: () => TimelineEditor2
  });
  var TimelineEditor2 = {
    editingIndex: -1,
    open() {
      this.renderList();
    },
    renderList() {
      const data = store.getCurrentDayData();
      const timeline = data.timeline || [];
      const content = `
            <div class="item-list" id="timelineEditorList">
                ${timeline.map((item, index) => `
                    <div class="item-card">
                        <div class="item-card-content">
                            <div class="item-card-title">${item.icon} ${escapeHtml(item.name)}</div>
                            <div class="item-card-subtitle">${escapeHtml(item.time)} - ${item.items ? item.items.length : 0}\u4E2A\u6D3B\u52A8</div>
                        </div>
                        <div class="item-card-actions">
                            <button class="btn btn-secondary btn-sm" data-action="timeline-editor-edit-item" data-index="${index}">\u7F16\u8F91</button>
                            <button class="btn btn-danger btn-sm" data-action="timeline-editor-delete-item" data-index="${index}">\u5220\u9664</button>
                        </div>
                    </div>
                `).join("")}
            </div>
            <button class="add-btn" data-action="timeline-editor-add-item">+ \u6DFB\u52A0\u65F6\u6BB5</button>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">\u5173\u95ED</button>
            </div>
        `;
      Handlers.openModal(content, "\u7F16\u8F91\u6D3B\u52A8\u65F6\u95F4\u7EBF");
    },
    addItem() {
      const data = store.getCurrentDayData();
      if (!data.timeline) data.timeline = [];
      data.timeline.push({
        period: "morning",
        name: "\u65B0\u65F6\u6BB5",
        time: "07:00 - 12:00",
        icon: "briefcase",
        eval: "good",
        items: []
      });
      this.editingIndex = data.timeline.length - 1;
      const checkInTimes = calculateCheckInTimes(data.timeline);
      if (!data.metrics) data.metrics = {};
      data.metrics.firstCheckIn = checkInTimes.firstCheckIn;
      data.metrics.lastCheckIn = checkInTimes.lastCheckIn;
      store.updateDayData({ timeline: data.timeline, metrics: data.metrics }).then(() => {
        renderAll();
        this.renderForm();
      }).catch((e) => console.error("[Bamboo] \u4FDD\u5B58\u65F6\u95F4\u7EBF\u5931\u8D25:", e));
    },
    editItem(index) {
      this.editingIndex = index;
      this.renderForm();
    },
    renderForm() {
      const data = store.getCurrentDayData();
      const item = data.timeline[this.editingIndex];
      if (!item) return;
      const content = `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">\u65F6\u6BB5\u540D\u79F0</label>
                    <input type="text" class="form-input" id="tl-name" value="${escapeHtml(item.name)}">
                </div>
                <div class="form-group">
                    <label class="form-label">\u65F6\u6BB5\u7C7B\u578B</label>
                    <select class="form-select" id="tl-period">
                        <option value="lateNight" ${item.period === "lateNight" ? "selected" : ""}>\u51CC\u6668</option>
                        <option value="dawn" ${item.period === "dawn" ? "selected" : ""}>\u9ECE\u660E</option>
                        <option value="earlyMorning" ${item.period === "earlyMorning" ? "selected" : ""}>\u6E05\u6668</option>
                        <option value="morning" ${item.period === "morning" ? "selected" : ""}>\u4E0A\u5348</option>
                        <option value="midday" ${item.period === "midday" ? "selected" : ""}>\u4E2D\u5348</option>
                        <option value="afternoon" ${item.period === "afternoon" ? "selected" : ""}>\u4E0B\u5348</option>
                        <option value="dusk" ${item.period === "dusk" ? "selected" : ""}>\u508D\u665A</option>
                        <option value="evening" ${item.period === "evening" ? "selected" : ""}>\u665A\u4E0A</option>
                        <option value="night" ${item.period === "night" ? "selected" : ""}>\u6DF1\u591C</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">\u65F6\u95F4\u8303\u56F4</label>
                    <input type="text" class="form-input" id="tl-time" value="${escapeHtml(item.time)}" placeholder="\u4F8B\u5982: 09:00 - 12:00">
                </div>
                <div class="form-group">
                    <label class="form-label">\u56FE\u6807</label>
                    <input type="text" class="form-input" id="tl-icon" value="${item.icon}" placeholder="\u4F8B\u5982: \u{1F4BC}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">\u6D3B\u52A8\u5217\u8868</label>
                <div id="activityListEditor">
                    ${this.renderActivityEditor(item.items || [])}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="timeline-editor-render-list">\u8FD4\u56DE</button>
                <button class="btn btn-primary" data-action="timeline-editor-save">\u4FDD\u5B58</button>
            </div>
        `;
      byId("modalBody").innerHTML = content;
      $(".modal-title").textContent = this.editingIndex >= 0 ? "\u7F16\u8F91\u65F6\u6BB5" : "\u6DFB\u52A0\u65F6\u6BB5";
    },
    renderActivityEditor(items) {
      return `
            <div style="max-height: 200px; overflow-y: auto; margin-bottom: 12px;">
                ${items.map((act, idx) => `
                    <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                        <input type="text" class="form-input" style="width: 60px;" value="${escapeHtml(act.time)}" placeholder="\u65F6\u95F4" data-activity-time="${idx}">
                        <input type="text" class="form-input" style="flex: 1;" value="${escapeHtml(act.task)}" placeholder="\u4EFB\u52A1\u5185\u5BB9" data-activity-task="${idx}">
                        <input type="text" class="form-input" style="flex: 1;" value="${escapeHtml(act.eval || "")}" placeholder="\u8BC4\u4EF7(\u53EF\u9009)" data-activity-eval="${idx}">
                        <button class="btn btn-danger btn-sm" data-action="remove-period-item" data-item-idx="${idx}">\u2715</button>
                    </div>
                `).join("")}
            </div>
            <button class="add-btn" data-action="timeline-editor-add-activity">+ \u6DFB\u52A0\u6D3B\u52A8</button>
        `;
    },
    addActivity() {
      const data = store.getCurrentDayData();
      const item = data.timeline[this.editingIndex];
      if (!item.items) item.items = [];
      item.items.push({ time: "", task: "", eval: "" });
      store.scheduleAutoSave();
      const container = byId("activityListEditor");
      if (container) container.innerHTML = this.renderActivityEditor(item.items);
    },
    removeActivity(index) {
      const data = store.getCurrentDayData();
      const item = data.timeline[this.editingIndex];
      if (!item.items) return;
      item.items.splice(index, 1);
      store.scheduleAutoSave();
      const container = byId("activityListEditor");
      if (container) container.innerHTML = this.renderActivityEditor(item.items);
    },
    save() {
      const data = store.getCurrentDayData();
      const item = data.timeline[this.editingIndex];
      if (!item) return;
      item.name = byId("tl-name").value;
      item.period = byId("tl-period").value;
      item.time = byId("tl-time").value;
      item.icon = byId("tl-icon").value;
      const timeInputs = $$("[data-activity-time]");
      const taskInputs = $$("[data-activity-task]");
      const evalInputs = $$("[data-activity-eval]");
      item.items = [];
      for (let i = 0; i < timeInputs.length; i++) {
        const taskValue = taskInputs[i].value.trim();
        if (taskValue) {
          item.items.push({
            time: timeInputs[i].value,
            task: taskValue,
            eval: evalInputs[i].value
          });
        }
      }
      const checkInTimes = calculateCheckInTimes(data.timeline);
      if (!data.metrics) data.metrics = {};
      data.metrics.firstCheckIn = checkInTimes.firstCheckIn;
      data.metrics.lastCheckIn = checkInTimes.lastCheckIn;
      store.updateDayData({ timeline: data.timeline, metrics: data.metrics }).then(() => {
        renderAll();
        this.renderList();
        Toast.showToast("\u65F6\u6BB5\u5DF2\u4FDD\u5B58", "success");
      }).catch((e) => console.error("[Bamboo] \u4FDD\u5B58\u65F6\u95F4\u7EBF\u5931\u8D25:", e));
    },
    deleteItem(index) {
      ConfirmDialog.confirmDelete("\u786E\u5B9A\u5220\u9664\u8FD9\u4E2A\u65F6\u6BB5\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002").then((confirmed) => {
        if (!confirmed) return;
        const data = store.getCurrentDayData();
        data.timeline.splice(index, 1);
        const checkInTimes = calculateCheckInTimes(data.timeline);
        if (!data.metrics) data.metrics = {};
        data.metrics.firstCheckIn = checkInTimes.firstCheckIn;
        data.metrics.lastCheckIn = checkInTimes.lastCheckIn;
        store.updateDayData({ timeline: data.timeline, metrics: data.metrics }).then(() => {
          renderAll();
          this.renderList();
        }).catch((e) => console.error("[Bamboo] \u5220\u9664\u65F6\u95F4\u7EBF\u65F6\u6BB5\u5931\u8D25:", e));
      });
    }
  };
  ActionDispatcher.registerMany({
    "timeline-editor-edit-item": (ds) => TimelineEditor2.editItem(parseInt(ds.index)),
    "timeline-editor-delete-item": (ds) => TimelineEditor2.deleteItem(parseInt(ds.index)),
    "timeline-editor-add-item": () => TimelineEditor2.addItem(),
    "timeline-editor-render-list": () => TimelineEditor2.renderList(),
    "timeline-editor-save": () => TimelineEditor2.save(),
    "remove-period-item": (ds) => TimelineEditor2.removeActivity(parseInt(ds.itemIdx)),
    "timeline-editor-add-activity": () => TimelineEditor2.addActivity()
  });
  window.TimelineEditor = TimelineEditor2;

  // assets/scripts/modules/timeline/index.js
  var timeline_exports = {};
  __export(timeline_exports, {
    Timeline: () => Timeline2
  });
  var Timeline2 = {
    Renderer: TimelineRenderer,
    Editor: TimelineEditor,
    render(data) {
      TimelineRenderer.render(data);
    },
    openEditor() {
      TimelineEditor.open();
    },
    toggle(index) {
      TimelineRenderer.toggle(index);
    }
  };
  window.Timeline = Timeline2;

  // assets/scripts/modules/goals/dateRangePicker.js
  var dateRangePicker_exports = {};
  __export(dateRangePicker_exports, {
    DateRangePicker: () => DateRangePicker2
  });
  var DateRangePicker2 = {
    show({ el, goal, subIdx, currentStart, currentEnd, onSelect, onCancel }) {
      if (!el || !el.isConnected) return;
      let rect;
      try {
        rect = el.getBoundingClientRect();
      } catch (e) {
        rect = null;
      }
      const parseDate = (str) => str ? /* @__PURE__ */ new Date(str + "T00:00:00") : null;
      let startDate = parseDate(currentStart);
      let endDate = parseDate(currentEnd);
      let currentTab = "end";
      const getWeekNumber = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(((d - yearStart) / 864e5 + 1) / 7);
      };
      const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
      };
      const getWeekEnd = (date) => {
        const start = getWeekStart(date);
        return new Date(start.getTime() + 6 * 864e5);
      };
      const formatDate3 = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };
      const pickerHtml = `
            <div class="drp-overlay"></div>
            <div class="drp-container">
                <div class="drp-header">
                    <span class="drp-title">\u9009\u62E9\u65E5\u671F\u8303\u56F4</span>
                    <button class="drp-close-btn">&times;</button>
                </div>
                <div class="drp-tabs">
                    <button class="drp-tab" data-tab="range">\u6539\u8303\u56F4</button>
                    <button class="drp-tab" data-tab="start">\u6539\u5F00\u59CB</button>
                    <button class="drp-tab" data-tab="end">\u6539\u7ED3\u675F</button>
                </div>
                <div class="drp-quick-area" data-tab-panel="range">
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-range="thisWeek">\u672C\u5468</button>
                        <button class="drp-quick-btn" data-range="nextWeek">\u4E0B\u5468</button>
                        <button class="drp-quick-btn" data-range="thisMonth">\u672C\u6708</button>
                        <button class="drp-quick-btn" data-range="nextMonth">\u4E0B\u6708</button>
                        <button class="drp-quick-btn" data-range="thisQuarter">\u672C\u5B63</button>
                        <button class="drp-quick-btn" data-range="thisYear">\u672C\u5E74</button>
                    </div>
                </div>
                <div class="drp-quick-area" data-tab-panel="start" style="display:none;">
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-start="today">\u4ECA\u5929</button>
                        <button class="drp-quick-btn" data-start="thisMonday">\u672C\u5468\u4E00</button>
                        <button class="drp-quick-btn" data-start="nextMonday">\u4E0B\u5468\u4E00</button>
                        <button class="drp-quick-btn" data-start="monthStart">\u672C\u67081\u53F7</button>
                        <button class="drp-quick-btn" data-start="nextMonthStart">\u4E0B\u67081\u53F7</button>
                    </div>
                </div>
                <div class="drp-quick-area" data-tab-panel="end" style="display:none;">
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-end="plus3">+3\u5929</button>
                        <button class="drp-quick-btn" data-end="plus7">+7\u5929</button>
                        <button class="drp-quick-btn" data-end="plus14">+14\u5929</button>
                    </div>
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-end="thisFriday">\u672C\u5468\u4E94</button>
                        <button class="drp-quick-btn" data-end="thisSunday">\u672C\u5468\u65E5</button>
                        <button class="drp-quick-btn" data-end="monthEnd">\u672C\u6708\u5E95</button>
                        <button class="drp-quick-btn" data-end="quarterEnd">\u672C\u5B63\u5E95</button>
                        <button class="drp-quick-btn" data-end="yearEnd">\u672C\u5E74\u5E95</button>
                    </div>
                </div>
                <div class="drp-body">
                    <div class="drp-calendar" id="drp-cal">
                        <div class="drp-cal-header">
                            <button class="drp-nav-btn drp-prev-month">&lt;</button>
                            <span class="drp-month-label"></span>
                            <button class="drp-nav-btn drp-next-month">&gt;</button>
                        </div>
                        <div class="drp-weekdays">
                            <span>\u4E00</span><span>\u4E8C</span><span>\u4E09</span><span>\u56DB</span><span>\u4E94</span><span>\u516D</span><span>\u65E5</span>
                        </div>
                        <div class="drp-days"></div>
                    </div>
                </div>
                <div class="drp-footer">
                    <div class="drp-selected-range">
                        <span class="drp-selected-label">\u8D77\u59CB:</span>
                        <input type="text" class="drp-input-start" value="${HTMLUtils.escapeHtmlAttr(currentStart || "")}" placeholder="YYYY-MM-DD">
                        <span class="drp-arrow">\u2192</span>
                        <span class="drp-selected-label">\u7ED3\u675F:</span>
                        <input type="text" class="drp-input-end" value="${HTMLUtils.escapeHtmlAttr(currentEnd || "")}" placeholder="YYYY-MM-DD">
                    </div>
                    <div class="drp-actions">
                        <button class="drp-cancel-btn">\u53D6\u6D88</button>
                        <button class="drp-confirm-btn" ${!currentStart || !currentEnd ? "disabled" : ""}>\u786E\u5B9A</button>
                    </div>
                </div>
            </div>
        `;
      const container = document.createElement("div");
      container.className = "date-range-picker";
      container.innerHTML = pickerHtml;
      modalMount().appendChild(container);
      PopupPositioner.positionOnNextFrame({
        popupElement: container.querySelector(".drp-container"),
        anchorRect: rect,
        anchor: { placement: "below-center" },
        fallbackSize: { width: 300, height: 400 }
      });
      const renderCalendar = (calendarEl, baseDate) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const label = container.querySelector(".drp-month-label");
        label.textContent = `${year}\u5E74${month + 1}\u6708`;
        const daysContainer = calendarEl.querySelector(".drp-days");
        daysContainer.innerHTML = "";
        const firstDay = new Date(year, month, 1);
        let startWeekday = firstDay.getDay() || 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = startWeekday - 1; i > 0; i--) {
          const dayEl = document.createElement("div");
          dayEl.className = "drp-day drp-day-disabled";
          dayEl.textContent = prevMonthDays - i + 1;
          daysContainer.appendChild(dayEl);
        }
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d);
          const dayEl = document.createElement("div");
          dayEl.className = "drp-day";
          dayEl.textContent = d;
          dayEl.dataset.date = formatDate3(date);
          if (date.getTime() === today.getTime()) {
            dayEl.classList.add("drp-day-today");
          }
          if (startDate && date.getTime() === startDate.getTime()) {
            dayEl.classList.add("drp-day-start");
          }
          if (endDate && date.getTime() === endDate.getTime()) {
            dayEl.classList.add("drp-day-end");
          }
          if (startDate && endDate && date > startDate && date < endDate) {
            dayEl.classList.add("drp-day-in-range");
          }
          daysContainer.appendChild(dayEl);
        }
        const remaining = 42 - (startWeekday - 1 + daysInMonth);
        for (let d = 1; d <= remaining; d++) {
          const dayEl = document.createElement("div");
          dayEl.className = "drp-day drp-day-disabled";
          dayEl.textContent = d;
          daysContainer.appendChild(dayEl);
        }
      };
      const updateSelectedDisplay = () => {
        const startInput = container.querySelector(".drp-input-start");
        const endInput = container.querySelector(".drp-input-end");
        if (startInput) startInput.value = startDate ? formatDate3(startDate) : "";
        if (endInput) endInput.value = endDate ? formatDate3(endDate) : "";
        const confirmBtn = container.querySelector(".drp-confirm-btn");
        confirmBtn.disabled = !startDate || !endDate;
      };
      const parseDateInput = (str) => {
        if (!str || !str.trim()) return null;
        str = str.trim();
        const formats = [
          /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
          /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
          /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
          /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
          /^(\d{1,2})-(\d{1,2})$/,
          /^(\d{1,2})\/(\d{1,2})$/
        ];
        for (const format of formats) {
          const match = str.match(format);
          if (match) {
            let y, m, d;
            if (match.length === 4) {
              if (match[1].length === 4) {
                y = parseInt(match[1]);
                m = parseInt(match[2]);
                d = parseInt(match[3]);
              } else {
                d = parseInt(match[1]);
                m = parseInt(match[2]);
                y = parseInt(match[3]);
              }
            } else {
              y = (/* @__PURE__ */ new Date()).getFullYear();
              m = parseInt(match[1]);
              d = parseInt(match[2]);
            }
            const date = new Date(y, m - 1, d);
            if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
              date.setHours(0, 0, 0, 0);
              return date;
            }
          }
        }
        return null;
      };
      const enforceDateConstraint = () => {
        if (startDate && endDate && endDate < startDate) {
          if (currentTab === "start") endDate = new Date(startDate);
          else if (currentTab === "end") startDate = new Date(endDate);
          else {
            const tmp = startDate;
            startDate = endDate;
            endDate = tmp;
          }
        }
      };
      const getQuarterEnd = (d) => {
        const q = Math.floor(d.getMonth() / 3);
        const endMonth = (q + 1) * 3;
        return new Date(d.getFullYear(), endMonth, 0);
      };
      let displayMonth = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
      const calEl = container.querySelector("#drp-cal");
      renderCalendar(calEl, displayMonth);
      const setupInputHandlers = () => {
        const startInput = container.querySelector(".drp-input-start");
        const endInput = container.querySelector(".drp-input-end");
        if (startInput) {
          startInput.addEventListener("input", () => {
            const parsed = parseDateInput(startInput.value);
            if (parsed) {
              startDate = parsed;
              enforceDateConstraint();
              displayMonth = new Date(startDate);
              renderCalendar(calEl, displayMonth);
              updateNavBtns();
              updateSelectedDisplay();
            }
          });
          startInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (startDate && endDate) {
                container.remove();
                onSelect(formatDate3(startDate), formatDate3(endDate));
              }
            }
          });
        }
        if (endInput) {
          endInput.addEventListener("input", () => {
            const parsed = parseDateInput(endInput.value);
            if (parsed) {
              endDate = parsed;
              enforceDateConstraint();
              displayMonth = new Date(endDate);
              renderCalendar(calEl, displayMonth);
              updateNavBtns();
              updateSelectedDisplay();
            }
          });
          endInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (startDate && endDate) {
                container.remove();
                onSelect(formatDate3(startDate), formatDate3(endDate));
              }
            }
          });
        }
      };
      setupInputHandlers();
      const updateNavBtns = () => {
        const prevBtn = container.querySelector(".drp-prev-month");
        const nextBtn = container.querySelector(".drp-next-month");
        prevBtn.disabled = displayMonth.getFullYear() < 2020;
        nextBtn.disabled = displayMonth.getFullYear() > 2099;
      };
      updateNavBtns();
      const closePicker = () => {
        container.remove();
        onCancel();
      };
      container.querySelector(".drp-overlay").addEventListener("click", closePicker);
      container.querySelector(".drp-close-btn").addEventListener("click", closePicker);
      container.querySelector(".drp-cancel-btn").addEventListener("click", closePicker);
      const switchTab = (tab) => {
        currentTab = tab;
        container.querySelectorAll(".drp-tab").forEach((t) => {
          t.classList.toggle("drp-tab-active", t.dataset.tab === tab);
        });
        container.querySelectorAll("[data-tab-panel]").forEach((panel) => {
          panel.style.display = panel.dataset.tabPanel === tab ? "" : "none";
        });
      };
      switchTab(currentTab);
      container.querySelectorAll(".drp-tab").forEach((tab) => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
      });
      container.querySelectorAll(".drp-quick-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const now = /* @__PURE__ */ new Date();
          now.setHours(0, 0, 0, 0);
          if (btn.dataset.range) {
            const action = btn.dataset.range;
            switch (action) {
              case "thisWeek":
                startDate = getWeekStart(now);
                endDate = getWeekEnd(now);
                break;
              case "nextWeek":
                startDate = getWeekStart(now);
                startDate.setDate(startDate.getDate() + 7);
                endDate = getWeekEnd(startDate);
                break;
              case "thisMonth":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
              case "nextMonth":
                startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                break;
              case "thisQuarter":
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                endDate = getQuarterEnd(now);
                break;
              case "thisYear":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            }
            if (startDate) displayMonth = new Date(startDate);
            renderCalendar(calEl, displayMonth);
            updateNavBtns();
            updateSelectedDisplay();
            return;
          }
          if (btn.dataset.start) {
            const action = btn.dataset.start;
            switch (action) {
              case "today":
                startDate = new Date(now);
                break;
              case "thisMonday":
                startDate = getWeekStart(now);
                break;
              case "nextMonday": {
                const ns = getWeekStart(now);
                ns.setDate(ns.getDate() + 7);
                startDate = ns;
                break;
              }
              case "monthStart":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
              case "nextMonthStart":
                startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            }
            enforceDateConstraint();
            if (startDate) displayMonth = new Date(startDate);
            renderCalendar(calEl, displayMonth);
            updateNavBtns();
            updateSelectedDisplay();
            return;
          }
          if (btn.dataset.end) {
            const action = btn.dataset.end;
            switch (action) {
              case "plus3":
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() + 3);
                break;
              case "plus7":
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() + 7);
                break;
              case "plus14":
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() + 14);
                break;
              case "thisFriday": {
                const day = now.getDay();
                const offset = day === 5 ? 0 : (5 - day + 7) % 7;
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() + offset);
                break;
              }
              case "thisSunday": {
                const day = now.getDay();
                const offset = day === 0 ? 0 : 7 - day;
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() + offset);
                break;
              }
              case "monthEnd":
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
              case "quarterEnd":
                endDate = getQuarterEnd(now);
                break;
              case "yearEnd":
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            }
            enforceDateConstraint();
            if (endDate) displayMonth = new Date(endDate);
            renderCalendar(calEl, displayMonth);
            updateNavBtns();
            updateSelectedDisplay();
            return;
          }
        });
      });
      container.querySelector(".drp-prev-month").addEventListener("click", () => {
        displayMonth.setMonth(displayMonth.getMonth() - 1);
        renderCalendar(calEl, displayMonth);
        updateNavBtns();
      });
      container.querySelector(".drp-next-month").addEventListener("click", () => {
        displayMonth.setMonth(displayMonth.getMonth() + 1);
        renderCalendar(calEl, displayMonth);
        updateNavBtns();
      });
      const handleDayClick = (dayEl) => {
        if (dayEl.classList.contains("drp-day-disabled")) return;
        const clickedDate = /* @__PURE__ */ new Date(dayEl.dataset.date + "T00:00:00");
        if (currentTab === "range") {
          if (!startDate || startDate && endDate) {
            startDate = clickedDate;
            endDate = null;
          } else {
            if (clickedDate < startDate) {
              endDate = startDate;
              startDate = clickedDate;
            } else {
              endDate = clickedDate;
            }
          }
          if (clickedDate) displayMonth = new Date(clickedDate);
          renderCalendar(calEl, displayMonth);
          updateNavBtns();
          updateSelectedDisplay();
          if (startDate && endDate) {
            setTimeout(() => {
              if (startDate && endDate && container.isConnected) {
                container.remove();
                onSelect(formatDate3(startDate), formatDate3(endDate));
              }
            }, 800);
          }
          return;
        }
        if (currentTab === "start") {
          startDate = clickedDate;
          enforceDateConstraint();
          displayMonth = new Date(clickedDate);
          renderCalendar(calEl, displayMonth);
          updateNavBtns();
          updateSelectedDisplay();
          return;
        }
        if (currentTab === "end") {
          endDate = clickedDate;
          enforceDateConstraint();
          displayMonth = new Date(clickedDate);
          renderCalendar(calEl, displayMonth);
          updateNavBtns();
          updateSelectedDisplay();
          return;
        }
      };
      calEl.querySelector(".drp-days").addEventListener("click", (e) => {
        const dayEl = e.target.closest(".drp-day");
        if (dayEl) handleDayClick(dayEl);
      });
      container.querySelector(".drp-confirm-btn").addEventListener("click", () => {
        if (startDate && endDate) {
          container.remove();
          onSelect(formatDate3(startDate), formatDate3(endDate));
        }
      });
    }
  };
  window.DateRangePicker = DateRangePicker2;

  // assets/scripts/modules/goals/priorityPicker.js
  var priorityPicker_exports = {};
  __export(priorityPicker_exports, {
    PriorityPicker: () => PriorityPicker2
  });
  var PriorityPicker2 = {
    show({ el, currentPriority, onSelect, onCancel }) {
      if (!el || !el.isConnected) return;
      let rect;
      try {
        rect = el.getBoundingClientRect();
      } catch (e) {
        rect = null;
      }
      const container = document.createElement("div");
      container.className = "priority-picker";
      container.innerHTML = `
            <div class="prio-overlay"></div>
            <div class="prio-container">
                <div class="prio-header">
                    <span class="prio-title">\u9009\u62E9\u4F18\u5148\u7EA7</span>
                    <button class="prio-close-btn">&times;</button>
                </div>
                <div class="prio-body">
                    <div class="prio-item ${currentPriority === "high" ? "prio-item-selected" : ""}" data-priority="high">
                        <span class="prio-dot high"></span>
                        <span class="prio-name">\u9AD8\u4F18\u5148\u7EA7</span>
                    </div>
                    <div class="prio-item ${currentPriority === "medium" ? "prio-item-selected" : ""}" data-priority="medium">
                        <span class="prio-dot medium"></span>
                        <span class="prio-name">\u4E2D\u4F18\u5148\u7EA7</span>
                    </div>
                    <div class="prio-item ${currentPriority === "low" ? "prio-item-selected" : ""}" data-priority="low">
                        <span class="prio-dot low"></span>
                        <span class="prio-name">\u4F4E\u4F18\u5148\u7EA7</span>
                    </div>
                </div>
            </div>
        `;
      modalMount().appendChild(container);
      PopupPositioner.positionOnNextFrame({
        popupElement: container.querySelector(".prio-container"),
        anchorRect: rect,
        anchor: { placement: "below-left" },
        fallbackSize: { width: 240, height: 240 }
      });
      const closePicker = () => {
        container.remove();
        onCancel();
      };
      container.querySelector(".prio-overlay").addEventListener("click", closePicker);
      container.querySelector(".prio-close-btn").addEventListener("click", closePicker);
      container.querySelectorAll(".prio-item").forEach((item) => {
        item.addEventListener("click", () => {
          const priority = item.dataset.priority;
          container.remove();
          onSelect(priority);
        });
      });
    }
  };
  window.PriorityPicker = PriorityPicker2;

  // assets/scripts/modules/goals/categoryPicker.js
  var categoryPicker_exports = {};
  __export(categoryPicker_exports, {
    CategoryPicker: () => CategoryPicker2
  });
  var CategoryPicker2 = {
    show({ el, categories, currentCatId, onSelect, onCancel, onManageCategories }) {
      if (!el || !el.isConnected) return;
      let rect;
      try {
        rect = el.getBoundingClientRect();
      } catch (e) {
        rect = null;
      }
      const container = document.createElement("div");
      container.className = "category-picker";
      container.innerHTML = `
            <div class="catp-overlay"></div>
            <div class="catp-container">
                <div class="catp-header">
                    <span class="catp-title">\u9009\u62E9\u5206\u7C7B</span>
                    <button class="catp-close-btn">&times;</button>
                </div>
                <div class="catp-body">
                    ${categories.map((cat) => `
                        <div class="catp-item ${cat.id === currentCatId ? "catp-item-selected" : ""}" data-cat-id="${HTMLUtils.escapeHtmlAttr(cat.id)}">
                            <span class="catp-item-name">${escapeHtml(cat.name)}</span>
                        </div>
                    `).join("")}
                </div>
                <div class="catp-footer">
                    <button class="catp-manage-btn">\u7BA1\u7406\u5206\u7C7B</button>
                </div>
            </div>
        `;
      modalMount().appendChild(container);
      PopupPositioner.positionOnNextFrame({
        popupElement: container.querySelector(".catp-container"),
        anchorRect: rect,
        anchor: { placement: "below-left" },
        fallbackSize: { width: 200, height: 300 }
      });
      const closePicker = () => {
        container.remove();
        onCancel();
      };
      container.querySelector(".catp-overlay").addEventListener("click", closePicker);
      container.querySelector(".catp-close-btn").addEventListener("click", closePicker);
      container.querySelectorAll(".catp-item").forEach((item) => {
        item.addEventListener("click", () => {
          const catId = item.dataset.catId;
          container.remove();
          onSelect(catId);
        });
      });
      if (onManageCategories) {
        container.querySelector(".catp-manage-btn").addEventListener("click", () => {
          container.remove();
          onManageCategories();
        });
      }
    }
  };
  window.CategoryPicker = CategoryPicker2;

  // assets/scripts/modules/goals/categoryManager.js
  var categoryManager_exports = {};
  __export(categoryManager_exports, {
    CategoryManager: () => CategoryManager2
  });
  var CategoryManager2 = {
    show({ initialCategories, onSaveCategories, onPromptMigration, onClose }) {
      let categories = initialCategories.map((c) => ({ ...c }));
      const container = document.createElement("div");
      container.className = "category-manager";
      container.innerHTML = `
            <div class="catm-overlay"></div>
            <div class="catm-container">
                <div class="catm-header">
                    <span class="catm-title">\u7BA1\u7406\u5206\u7C7B</span>
                    <button class="catm-close-btn">&times;</button>
                </div>
                <div class="catm-body">
                    <div class="catm-list"></div>
                    <div class="catm-add-section">
                        <div class="catm-form-row">
                            <input type="text" class="catm-input catm-name-input" placeholder="\u5206\u7C7B\u540D\u79F0">
                            <button class="catm-add-btn">+ \u6DFB\u52A0</button>
                        </div>
                    </div>
                </div>
                <div class="catm-footer">
                    <button class="catm-done-btn">\u5B8C\u6210</button>
                </div>
            </div>
        `;
      modalMount().appendChild(container);
      requestAnimationFrame(() => {
        const modal = container.querySelector(".catm-container");
        modal.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;`;
      });
      const renderList = () => {
        const listEl = container.querySelector(".catm-list");
        listEl.innerHTML = categories.map((cat, idx) => `
                <div class="catm-item" data-idx="${idx}">
                    <span class="catm-item-name">${escapeHtml(cat.name)}</span>
                    <div class="catm-item-actions">
                        <button class="catm-edit-btn" title="\u7F16\u8F91">${LucideUtils.createIcon("edit", { size: 14 })}</button>
                        <button class="catm-delete-btn" title="\u5220\u9664">${LucideUtils.createIcon("trash", { size: 14 })}</button>
                    </div>
                </div>
            `).join("");
        listEl.querySelectorAll(".catm-edit-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const itemEl = btn.closest(".catm-item");
            const idx = parseInt(itemEl.dataset.idx);
            const cat = categories[idx];
            const nameSpan = itemEl.querySelector(".catm-item-name");
            const actionsDiv = itemEl.querySelector(".catm-item-actions");
            nameSpan.innerHTML = `<input type="text" class="catm-inline-input" value="${HTMLUtils.escapeHtmlAttr(cat.name)}" style="width:120px;">`;
            actionsDiv.innerHTML = `<button class="catm-save-btn">${LucideUtils.createIcon("check", { size: 14 })}</button><button class="catm-cancel-btn">${LucideUtils.createIcon("x", { size: 14 })}</button>`;
            const saveBtn = actionsDiv.querySelector(".catm-save-btn");
            const cancelBtn = actionsDiv.querySelector(".catm-cancel-btn");
            saveBtn.addEventListener("click", () => {
              const newName = itemEl.querySelector(".catm-inline-input").value.trim();
              if (!newName) return;
              categories[idx] = { ...cat, name: newName };
              onSaveCategories(categories);
              renderList();
            });
            cancelBtn.addEventListener("click", () => renderList());
          });
        });
        listEl.querySelectorAll(".catm-delete-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const itemEl = btn.closest(".catm-item");
            const idx = parseInt(itemEl.dataset.idx);
            const cat = categories[idx];
            if (!cat) return;
            const affected = GoalService.getGoalsByCategory(cat.id);
            const affectedCount = affected.length;
            const fallbackCats = categories.filter((c) => c.id !== cat.id);
            const message = affectedCount > 0 ? `\u5206\u7C7B\u300C${cat.name}\u300D\u6B63\u5728\u88AB <strong style="color:var(--bamboo-error)">${affectedCount}</strong> \u4E2A\u76EE\u6807\u4F7F\u7528\u3002\u5220\u9664\u540E\u8FD9\u4E9B\u76EE\u6807\u9700\u8981\u91CD\u65B0\u5F52\u7C7B\u3002` : `\u786E\u5B9A\u5220\u9664\u5206\u7C7B\u300C${cat.name}\u300D\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u5F71\u54CD\u73B0\u6709\u76EE\u6807\u3002`;
            const result = await ConfirmDialog.danger({
              title: "\u786E\u8BA4\u5220\u9664\u5206\u7C7B",
              message,
              confirmText: "\u5220\u9664",
              cancelText: "\u53D6\u6D88",
              extraOptions: affectedCount > 0 ? {
                key: "fallback",
                label: "\u53D7\u5F71\u54CD\u76EE\u6807\u5904\u7406\u65B9\u5F0F",
                choices: [
                  { value: "unclassified", label: "\u8BBE\u4E3A\u672A\u5206\u7C7B\uFF08\u63A8\u8350\uFF09", default: true },
                  ...fallbackCats.length > 0 ? [{
                    value: "__choose__",
                    label: "\u8FC1\u79FB\u5230\u5176\u4ED6\u5206\u7C7B\u2026"
                  }] : []
                ]
              } : null
            });
            if (!result || result.confirmed !== true) return;
            let fallbackCategoryId = "";
            if (affectedCount > 0 && result.extraValues && result.extraValues.fallback === "__choose__") {
              const picked = await onPromptMigration(fallbackCats, cat.name);
              if (picked === null) return;
              fallbackCategoryId = picked;
            } else if (affectedCount > 0 && result.extraValues && result.extraValues.fallback === "unclassified") {
              fallbackCategoryId = "";
            }
            categories.splice(idx, 1);
            await onSaveCategories(categories);
            if (affectedCount > 0) {
              const migrated = await GoalService.reassignGoalsCategory(cat.id, fallbackCategoryId);
              const targetName = fallbackCategoryId ? fallbackCats.find((c) => c.id === fallbackCategoryId)?.name || "\u5176\u4ED6" : "\u672A\u5206\u7C7B";
              Toast.showToast(`\u300C${cat.name}\u300D\u5DF2\u5220\u9664\uFF0C${migrated} \u4E2A\u76EE\u6807\u5DF2\u5F52\u5165\u300C${targetName}\u300D`, "success");
            } else {
              Toast.showToast(`\u300C${cat.name}\u300D\u5DF2\u5220\u9664`, "success");
            }
            renderList();
          });
        });
      };
      renderList();
      const closeManager = () => {
        container.remove();
        if (onClose) onClose();
      };
      container.querySelector(".catm-overlay").addEventListener("click", closeManager);
      container.querySelector(".catm-close-btn").addEventListener("click", closeManager);
      container.querySelector(".catm-done-btn").addEventListener("click", closeManager);
      container.querySelector(".catm-add-btn").addEventListener("click", () => {
        const nameInput = container.querySelector(".catm-name-input");
        const name = nameInput.value.trim();
        if (!name) {
          Toast.showToast("\u8BF7\u8F93\u5165\u5206\u7C7B\u540D\u79F0", "error");
          return;
        }
        const id = "cat_" + Date.now();
        categories.push({ id, name });
        onSaveCategories(categories);
        nameInput.value = "";
        renderList();
      });
    }
  };
  window.CategoryManager = CategoryManager2;

  // assets/scripts/modules/goals/archiver.js
  var archiver_exports = {};
  __export(archiver_exports, {
    GoalsArchiver: () => GoalsArchiver2
  });
  var GoalsArchiver2 = {
    /** 回引 GoalsRenderer，用于调用 render() / calcProgress() */
    _renderer: null,
    _state: {
      filter: { progress: "all", category: "all", keyword: "", dateStart: "", dateEnd: "" },
      availableCategories: [],
      selection: /* @__PURE__ */ new Set(),
      selectAll: false
    },
    /** 初始化，绑定对 GoalsRenderer 的依赖 */
    init(renderer) {
      this._renderer = renderer;
    },
    // ========== 入口 ==========
    openArchiveManager() {
      this._loadArchiveFilter();
      this._renderArchivePanel();
    },
    // ========== 筛选状态持久化 ==========
    _loadArchiveFilter() {
      try {
        const saved = StorageAdapter.get(StorageKeys.ARCHIVE_FILTER);
        if (saved) {
          const parsed = JSON.parse(saved);
          delete parsed.date;
          this._state.filter = {
            progress: "all",
            category: "all",
            keyword: "",
            dateStart: "",
            dateEnd: "",
            ...parsed
          };
          return;
        }
      } catch (e) {
      }
      this._state.filter = { progress: "all", category: "all", keyword: "", dateStart: "", dateEnd: "" };
    },
    _saveArchiveFilter() {
      try {
        StorageAdapter.set(StorageKeys.ARCHIVE_FILTER, JSON.stringify(this._state.filter));
      } catch (e) {
        console.error("Failed to save archive filter:", e);
      }
    },
    // ========== 筛选栏 HTML ==========
    _buildArchiveFilterHTML() {
      const filter = this._state.filter;
      const categories = GoalService.getCategories();
      this._state.availableCategories = [...new Set(categories.map((c) => c.name))];
      return `
            <div class="arch-filter-bar">
                <div class="arch-filter-row arch-filter-search-row">
                    <div class="arch-filter-search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" class="arch-filter-input" data-filter-key="keyword" placeholder="\u641C\u7D22\u76EE\u6807..." value="${escapeHtml(filter.keyword)}">
                        ${filter.keyword ? `<button class="arch-icon-btn" data-action="arch-clear-keyword" title="\u6E05\u9664">${LucideUtils.createIcon("x", { size: 12 })}</button>` : ""}
                    </div>
                    ${filter.progress !== "all" || filter.category !== "all" || filter.dateStart || filter.dateEnd ? `<button class="arch-reset-btn" data-action="arch-reset-filter">\u91CD\u7F6E</button>` : ""}
                </div>
                <div class="arch-filter-row arch-filter-ctrls-row">
                    <select class="arch-select" data-filter-key="progress">
                        <option value="all" ${filter.progress === "all" ? "selected" : ""}>\u5168\u90E8\u8FDB\u5EA6</option>
                        <option value="complete" ${filter.progress === "complete" ? "selected" : ""}>\u5DF2\u5B8C\u6210</option>
                        <option value="incomplete" ${filter.progress === "incomplete" ? "selected" : ""}>\u8FDB\u884C\u4E2D</option>
                    </select>
                    <select class="arch-select" data-filter-key="category">
                        <option value="all" ${filter.category === "all" ? "selected" : ""}>\u5168\u90E8\u5206\u7C7B</option>
                        ${categories.map((c) => `<option value="${escapeHtml(c.name)}" ${filter.category === c.name ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                    <input type="text" class="arch-date-input" data-filter-key="dateStart" value="${escapeHtml(filter.dateStart)}" placeholder="\u8D77\u59CB YYYY-MM-DD">
                    <span class="arch-sep">~</span>
                    <input type="text" class="arch-date-input" data-filter-key="dateEnd" value="${escapeHtml(filter.dateEnd)}" placeholder="\u622A\u6B62 YYYY-MM-DD">
                </div>
            </div>
        `;
    },
    // ========== 过滤逻辑 ==========
    /**
     * 验证并自动修复归档目标的数据完整性
     */
    async _validateArchivedGoals(goals) {
      let needsSave = false;
      const fixedGoals = [];
      for (const g of goals) {
        if (!g.archivedAt) {
          g.archivedAt = g.startDate ? new Date(g.startDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
          fixedGoals.push(g.title || g.id);
          needsSave = true;
        }
      }
      if (needsSave) {
        try {
          await GoalService._save();
          console.warn(`[Bamboo] \u81EA\u52A8\u4FEE\u590D\u4E86 ${fixedGoals.length} \u4E2A\u5F52\u6863\u76EE\u6807\u7684 archivedAt \u5B57\u6BB5`);
        } catch (e) {
          console.error("[Bamboo] \u4FDD\u5B58\u4FEE\u590D\u5931\u8D25:", e);
        }
      }
      return goals;
    },
    _filterArchivedGoals(goals) {
      const filter = this._state.filter;
      const keyword = (filter.keyword || "").trim().toLowerCase();
      return goals.filter((g) => {
        if (keyword && !g.title.toLowerCase().includes(keyword)) return false;
        if (filter.category !== "all") {
          const cat = GoalService.getCategories().find((c) => c.id === g.category);
          if (!cat || cat.name !== filter.category) return false;
        }
        if (filter.progress === "complete") {
          const p = this._renderer ? this._renderer.calcProgress(g) : 0;
          if (p < 100) return false;
        }
        if (filter.progress === "incomplete") {
          const p = this._renderer ? this._renderer.calcProgress(g) : 0;
          if (p >= 100) return false;
        }
        if (filter.dateStart) {
          const d = new Date(g.archivedAt || g.startDate);
          if (d < new Date(filter.dateStart)) return false;
        }
        if (filter.dateEnd) {
          const d = new Date(g.archivedAt || g.startDate);
          if (d > /* @__PURE__ */ new Date(filter.dateEnd + "T23:59:59")) return false;
        }
        return true;
      });
    },
    // ========== 面板渲染 ==========
    _renderArchiveCard(goal, highlightKeyword) {
      const progress = this._renderer ? this._renderer.calcProgress(goal) : 0;
      const isComplete = progress >= 100;
      const archivedDate = goal.archivedAt ? new Date(goal.archivedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : "";
      const category = GoalService.getCategories().find((c) => c.id === goal.category);
      const categoryLabel = category ? category.name : "";
      const highlightText2 = (text) => {
        if (!highlightKeyword || !text) return escapeHtml(text || "");
        const regex = new RegExp(`(${highlightKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        return escapeHtml(text).replace(regex, '<mark class="arch-highlight">$1</mark>');
      };
      const hasItems = goal.items && goal.items.length > 0;
      let itemsPreview = "";
      if (hasItems) {
        itemsPreview = `
                <div class="arch-items">
                    ${goal.items.map((item) => {
          const itemProgress = GoalService.calcProgressFromValues(item);
          const isItemDone = itemProgress >= 100;
          return `
                            <div class="arch-item">
                                <span class="arch-item-name">${highlightText2(item.name)}</span>
                                <span class="arch-item-progress ${isItemDone ? "done" : ""}">${itemProgress}%${isItemDone ? " \u2713" : ""}</span>
                            </div>
                        `;
        }).join("")}
                </div>
            `;
      }
      return `
            <div class="arch-card ${isComplete ? "done" : ""}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                <label class="arch-check">
                    <input type="checkbox" class="arch-cb" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                    <span class="arch-cb-box"></span>
                </label>
                <div class="arch-body">
                    <div class="arch-head">
                        <span class="arch-title">${highlightText2(goal.title)}</span>
                        <span class="arch-pct ${isComplete ? "done" : ""}">${progress}%</span>
                    </div>
                    <div class="arch-meta">
                        <span class="arch-date">\u5F52\u6863\u4E8E ${archivedDate}</span>
                    </div>
                    <div class="arch-expand">
                        ${categoryLabel ? `<div class="arch-expand-row"><span class="arch-tag">${escapeHtml(categoryLabel)}</span></div>` : ""}
                        ${itemsPreview}
                        <div class="arch-expand-actions">
                            <button class="arch-act-btn" data-action="archive-restore" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="\u6062\u590D\u5230\u6D3B\u8DC3\u5217\u8868">${LucideUtils.createIcon("rotateCcw", { size: 13 })} \u6062\u590D</button>
                            <button class="arch-act-btn arch-act-del" data-action="archive-delete" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="\u6C38\u4E45\u5220\u9664">${LucideUtils.createIcon("trash", { size: 13 })} \u5220\u9664</button>
                        </div>
                    </div>
                </div>
                <span class="arch-toggle-icon">${LucideUtils.createIcon("chevronDown", { size: 14 })}</span>
            </div>
        `;
    },
    _buildArchiveContentHTML(archived) {
      const filter = this._state.filter;
      const keyword = filter.keyword;
      const filtered = this._filterArchivedGoals(archived);
      return `
            ${this._buildArchiveFilterHTML()}
            <div class="arch-list">
                <div class="arch-scroll">
                    ${filtered.length === 0 ? `
                        <div class="arch-empty">\u6CA1\u6709\u5339\u914D\u7684\u5F52\u6863\u76EE\u6807</div>
                    ` : filtered.map((goal) => this._renderArchiveCard(goal, keyword)).join("")}
                </div>
                <div class="arch-bar">
                    <label class="arch-sel-all">
                        <input type="checkbox" class="arch-cb-all" data-action="archive-toggle-all">
                        <span class="arch-cb-box"></span>
                        <span>\u5168\u9009</span>
                    </label>
                    <div class="arch-bar-actions">
                        <button class="arch-bar-btn" data-action="archive-batch-restore" disabled>${LucideUtils.createIcon("refreshCw", { size: 13 })} \u6062\u590D\u5DF2\u9009</button>
                        <button class="arch-bar-btn" data-action="archive-batch-delete" disabled>${LucideUtils.createIcon("trash", { size: 13 })} \u5220\u9664\u5DF2\u9009</button>
                    </div>
                </div>
            </div>
        `;
    },
    _renderArchivePanel() {
      const archived = store.getArchivedGoals();
      this._validateArchivedGoals(archived);
      if (archived.length === 0) {
        PanelManager.open("archive", LucideUtils.createIcon("archive", { size: 16 }) + "\u76EE\u6807\u5F52\u6863", this._renderArchiveEmptyState());
        return;
      }
      const content = this._buildArchiveContentHTML(archived);
      PanelManager.open("archive", LucideUtils.createIcon("archive", { size: 16 }) + "\u76EE\u6807\u5F52\u6863", content, {
        onOpen: (panel) => this._bindEvents(panel)
      });
    },
    _renderArchiveEmptyState() {
      return `
            <div class="arch-empty-state">
                <div class="arch-empty-icn">${LucideUtils.createIcon("archive", { size: 40, strokeWidth: 1 })}</div>
                <div class="arch-empty-txt">\u6682\u65E0\u5F52\u6863\u76EE\u6807</div>
                <div class="arch-empty-sub">\u5B8C\u6210\u6216\u5220\u9664\u7684\u76EE\u6807\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC</div>
            </div>
        `;
    },
    // ========== 事件绑定 ==========
    _bindEvents(panel) {
      const body = panel.querySelector(".fab-panel-body");
      if (!body) return;
      const searchInput = body.querySelector(".arch-filter-input");
      if (searchInput) {
        let timer;
        searchInput.addEventListener("input", () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            this._state.filter.keyword = searchInput.value;
            this._saveArchiveFilter();
            this._refreshContent();
          }, 250);
        });
      }
      body.onpointerdown = (e) => {
        const t = e.target;
        if (t.matches('[data-action="arch-clear-keyword"]')) {
          this._state.filter.keyword = "";
          this._saveArchiveFilter();
          this._refreshContent();
        } else if (t.matches('[data-action="arch-reset-filter"]')) {
          this._state.filter = { progress: "all", category: "all", keyword: "", dateStart: "", dateEnd: "" };
          this._saveArchiveFilter();
          this._refreshContent();
        } else if (t.matches('[data-action="arch-toggle-items"]')) {
          const items = t.closest(".arch-items");
          if (items) items.querySelectorAll(".arch-item-collapsed").forEach((el) => el.classList.remove("arch-item-collapsed"));
          t.remove();
        } else if (t.matches(".arch-cb")) {
        }
      };
      body.querySelectorAll(".arch-select").forEach((sel) => {
        sel.addEventListener("change", () => {
          this._state.filter[sel.dataset.filterKey] = sel.value;
          this._saveArchiveFilter();
          this._refreshContent();
        });
      });
      body.querySelectorAll(".arch-date-input").forEach((inp) => {
        inp.addEventListener("input", () => {
          const v = inp.value.trim();
          if (v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v)) {
            inp.classList.remove("arch-date-err");
          } else {
            inp.classList.add("arch-date-err");
          }
        });
        inp.addEventListener("change", () => {
          inp.classList.remove("arch-date-err");
          this._state.filter[inp.dataset.filterKey] = inp.value.trim();
          this._saveArchiveFilter();
          this._refreshContent();
        });
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            inp.blur();
          }
        });
      });
      body.querySelectorAll(".arch-cb").forEach((cb) => {
        cb.addEventListener("change", () => {
          if (cb.checked) this._state.selection.add(cb.dataset.goalId);
          else this._state.selection.delete(cb.dataset.goalId);
          this._updateBar(body);
        });
      });
      const allCb = body.querySelector(".arch-cb-all");
      if (allCb) {
        allCb.addEventListener("change", () => {
          this._state.selectAll = allCb.checked;
          body.querySelectorAll(".arch-cb").forEach((cb) => {
            cb.checked = allCb.checked;
            if (allCb.checked) this._state.selection.add(cb.dataset.goalId);
            else this._state.selection.delete(cb.dataset.goalId);
          });
          this._updateBar(body);
        });
      }
      body.addEventListener("click", (e) => {
        const card = e.target.closest(".arch-card");
        if (!card) return;
        if (e.target.closest(".arch-check")) return;
        if (e.target.closest(".arch-expand-actions")) return;
        card.classList.toggle("arch-card-expanded");
      });
      body.addEventListener("click", (e) => {
        const btn = e.target.closest('[data-action^="archive-"]');
        if (!btn) return;
        switch (btn.dataset.action) {
          case "archive-restore":
            this.unarchiveGoal(btn.dataset.goalId);
            break;
          case "archive-delete":
            this.deleteArchivedGoal(btn.dataset.goalId);
            break;
          case "archive-batch-restore":
            this._batchUnarchive([...this._state.selection]);
            break;
          case "archive-batch-delete":
            this._batchDeleteArchived([...this._state.selection]);
            break;
        }
      });
      this._updateBar(body);
    },
    _updateBar(body) {
      const bar = body.querySelector(".arch-bar");
      if (!bar) return;
      const count = this._state.selection.size;
      const restoreBtn = bar.querySelector('[data-action="archive-batch-restore"]');
      const deleteBtn = bar.querySelector('[data-action="archive-batch-delete"]');
      if (restoreBtn) restoreBtn.disabled = count === 0;
      if (deleteBtn) deleteBtn.disabled = count === 0;
    },
    // ========== 内容刷新 ==========
    _refreshContent() {
      this._saveArchiveFilter();
      let panel = PanelManager.activePanel;
      if (!panel || !panel.id.includes("archive")) {
        this.openArchiveManager();
        return;
      }
      const body = panel.querySelector(".fab-panel-body");
      if (!body) return;
      this._state.selection.clear();
      this._state.selectAll = false;
      const archived = store.getArchivedGoals();
      if (archived.length === 0) {
        body.innerHTML = this._renderArchiveEmptyState();
        return;
      }
      body.innerHTML = this._buildArchiveContentHTML(archived);
      this._bindEvents(panel);
    },
    // ========== 批量操作 ==========
    async _batchUnarchive(goalIds) {
      let successCount = 0;
      for (const id of goalIds) {
        try {
          await store.unarchiveGoal(id);
          successCount++;
        } catch (e) {
          console.error("[Bamboo] \u6062\u590D\u5931\u8D25:", id, e.message);
        }
      }
      this._state.selection.clear();
      this._refreshContent();
      if (this._renderer) this._renderer.render();
      Toast.showToast(`\u5DF2\u6062\u590D ${successCount} \u4E2A\u76EE\u6807`, "success");
    },
    async _batchDeleteArchived(goalIds) {
      const confirmed = await ConfirmDialog.confirmDelete(`\u786E\u5B9A\u8981\u6C38\u4E45\u5220\u9664\u9009\u4E2D\u7684 ${goalIds.length} \u4E2A\u5F52\u6863\u76EE\u6807\u5417\uFF1F`);
      if (!confirmed) return;
      const allGoals = store.getGlobalGoals();
      const deletedGoals = goalIds.map((id) => allGoals.find((g) => g.id === id)).filter(Boolean).map((g) => JSON.parse(JSON.stringify(g)));
      let deletedCount = 0;
      for (const id of goalIds) {
        try {
          await store.deleteGlobalGoal(id);
          deletedCount++;
        } catch (e) {
          console.error("[Bamboo] \u5220\u9664\u5931\u8D25:", id, e.message);
        }
      }
      this._state.selection.clear();
      this._refreshContent();
      if (typeof TodoRenderer !== "undefined") TodoRenderer._invalidateCache();
      this._showUndoToast(`\u5DF2\u5220\u9664 ${deletedCount} \u4E2A\u76EE\u6807`, deletedGoals);
    },
    // ========== 单项操作 ==========
    async unarchiveGoal(goalId) {
      await store.unarchiveGoal(goalId);
      this._refreshContent();
      if (this._renderer) this._renderer.render();
      Toast.showToast("\u76EE\u6807\u5DF2\u6062\u590D\u5230\u6D3B\u8DC3\u5217\u8868", "success");
    },
    async deleteArchivedGoal(goalId) {
      const confirmed = await ConfirmDialog.confirmDelete("\u786E\u5B9A\u8981\u6C38\u4E45\u5220\u9664\u8FD9\u4E2A\u5F52\u6863\u76EE\u6807\u5417\uFF1F");
      if (!confirmed) return;
      const goal = store.getGlobalGoals().find((g) => g.id === goalId);
      const deletedGoal = goal ? JSON.parse(JSON.stringify(goal)) : null;
      await store.deleteGlobalGoal(goalId);
      this._state.selection.clear();
      this._refreshContent();
      if (typeof TodoRenderer !== "undefined") TodoRenderer._invalidateCache();
      this._showUndoToast("\u76EE\u6807\u5DF2\u6C38\u4E45\u5220\u9664", deletedGoal ? [deletedGoal] : []);
    },
    // ========== 撤销 Toast ==========
    _showUndoToast(message, deletedGoals) {
      let container = $(".toast-container");
      if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        modalMount().appendChild(container);
      }
      const toast = document.createElement("div");
      toast.className = "toast success toast-undo";
      const iconHtml = typeof LucideUtils !== "undefined" ? LucideUtils.createIcon("trash", { size: 18 }) : "";
      toast.innerHTML = `
            <span class="toast-icon">${iconHtml}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-undo-btn">\u64A4\u9500</button>
        `;
      let undone = false;
      const undoBtn = toast.querySelector(".toast-undo-btn");
      const dismiss = () => {
        toast.style.animation = "toastOut 0.3s ease forwards";
        setTimeout(() => {
          toast.remove();
          if (container.children.length === 0) container.remove();
        }, 300);
      };
      const self = this;
      undoBtn.addEventListener("click", async () => {
        if (undone) return;
        undone = true;
        for (const g of deletedGoals) {
          try {
            g.archived = true;
            if (!g.archivedAt) g.archivedAt = (/* @__PURE__ */ new Date()).toISOString();
            await GoalService.add(g);
          } catch (e) {
            console.error("[Bamboo] \u64A4\u9500\u6062\u590D\u5931\u8D25:", g.id, e.message);
          }
        }
        self._refreshContent();
        if (typeof TodoRenderer !== "undefined") TodoRenderer._invalidateCache();
        if (self._renderer) self._renderer.render();
        dismiss();
        Toast.showToast(`\u5DF2\u64A4\u9500\u5220\u9664\uFF0C\u6062\u590D\u4E86 ${deletedGoals.length} \u4E2A\u5F52\u6863\u76EE\u6807`, "success");
      });
      container.appendChild(toast);
      setTimeout(() => {
        if (!undone) dismiss();
      }, 5e3);
    }
  };
  window.GoalsArchiver = GoalsArchiver2;

  // assets/scripts/modules/goals/inlineEditService.js
  var inlineEditService_exports = {};
  __export(inlineEditService_exports, {
    GoalInlineEditService: () => GoalInlineEditService
  });
  var GoalInlineEditService = {
    /**
     * @param {object} staleGoal — 编辑前的 goal 快照
     * @param {number|null} subIdx — 子项索引
     * @param {string} editType — 编辑类型
     * @param {string} value — 新值
     * @param {object} deps — 依赖注入
     * @param {function} deps.calcProgress
     * @param {function} deps.autoCalcEndDate
     * @param {function} deps.autoCalcGoalDateRange
     * @param {function} deps.renderSingleGoal
     */
    async commit(staleGoal, subIdx, editType, value, deps) {
      const goals = store.getGlobalGoals();
      const goal = goals.find((g) => g.id === staleGoal.id);
      if (!goal) return;
      let changed = false;
      switch (editType) {
        case "category":
          if (value && value !== goal.category) {
            goal.category = value;
            changed = true;
          }
          break;
        case "priority":
          if (value && value !== goal.priority) {
            goal.priority = value;
            changed = true;
          }
          break;
        case "title":
          if (value && value !== goal.title) {
            goal.title = value;
            changed = true;
          }
          break;
        case "meta":
          if (value !== goal.meta) {
            goal.meta = value;
            changed = true;
          }
          break;
        case "name":
          if (subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            if (value && value !== item.name) {
              item.name = value;
              changed = true;
            }
          }
          break;
        case "status":
          if (subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            const newStatus = value || "";
            if (newStatus !== (item.detail || "")) {
              item.detail = newStatus;
              changed = true;
            }
          }
          break;
        case "currentValue":
          if (subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            const newVal = parseFloat(value);
            if (!isNaN(newVal) && String(newVal) !== String(item.currentValue || item.startValue || 0)) {
              const start = parseFloat(item.startValue) || 0;
              const target = parseFloat(item.targetValue) || 0;
              const clamped = Math.max(Math.min(start, target), Math.min(Math.max(start, target), newVal));
              item.currentValue = String(clamped);
              if (item.startValue && item.targetValue && target !== start) {
                item.percent = Math.min(100, Math.max(0, Math.round(Math.abs(clamped - start) / Math.abs(target - start) * 100)));
              }
              delete item.manuallySetDate;
              deps.autoCalcEndDate(item);
              deps.autoCalcGoalDateRange(goal);
              changed = true;
            }
          }
          break;
        case "targetValue":
          if (subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            const newTarget = parseFloat(value);
            if (!isNaN(newTarget) && newTarget > 0) {
              const start = parseFloat(item.startValue) || 0;
              if (newTarget !== start) {
                item.targetValue = String(newTarget);
                const current = parseFloat(item.currentValue) || start;
                item.percent = Math.min(100, Math.max(0, Math.round(Math.abs(current - start) / Math.abs(newTarget - start) * 100)));
                delete item.manuallySetDate;
                deps.autoCalcEndDate(item);
                deps.autoCalcGoalDateRange(goal);
                changed = true;
              } else {
                Toast.showToast("\u76EE\u6807\u503C\u4E0D\u80FD\u7B49\u4E8E\u8D77\u59CB\u503C", "error");
              }
            }
          }
          break;
        case "dailyMin":
          if (subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            const newMin = parseFloat(value);
            if (!isNaN(newMin) && newMin > 0) {
              item.dailyMin = String(newMin);
              deps.autoCalcEndDate(item);
              deps.autoCalcGoalDateRange(goal);
              changed = true;
            } else if (value === "") {
              delete item.dailyMin;
              deps.autoCalcGoalDateRange(goal);
              changed = true;
            }
          }
          break;
        case "dateRange":
          if (subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            const match = value.match(/(\d{4}-\d{2}-\d{2})\s*→\s*(\d{4}-\d{2}-\d{2})/);
            if (match) {
              item.startDate = match[1];
              item.endDate = match[2];
              item.manuallySetDate = true;
              changed = true;
              deps.autoCalcGoalDateRange(goal);
            }
          }
          break;
      }
      if (changed) {
        goal.progress = deps.calcProgress(goal);
        await store.updateGlobalGoal(goal.id, goal);
        if (typeof TodoRenderer !== "undefined") TodoRenderer._invalidateCache();
        if (editType === "category" || editType === "priority" || editType === "name" || editType === "title") {
          if (typeof renderAll === "function") renderAll();
        } else {
          deps.renderSingleGoal(goal.id);
        }
      }
    }
  };
  window.GoalInlineEditService = GoalInlineEditService;

  // assets/scripts/modules/goals/renderer.js
  var renderer_exports2 = {};
  __export(renderer_exports2, {
    GoalsRenderer: () => GoalsRenderer2
  });
  var GoalsRenderer2 = {
    _expandedGoals: /* @__PURE__ */ new Set(),
    _collapsedCompleted: /* @__PURE__ */ new Set(),
    _pendingEditPromise: null,
    // 数值格式化 - 已抽至 utils/goalCalculations.formatNumber
    _formatNumber(value) {
      return GoalCalculations.formatNumber(value);
    },
    async loadCategories() {
      return GoalService.loadCategories();
    },
    getCategories() {
      return GoalService.getCategories();
    },
    async saveCategories(categories) {
      return GoalService.saveCategories(categories);
    },
    calcProgress(goal) {
      return GoalService.calcProgress(goal);
    },
    calcDays(startDate, endDate) {
      return GoalService.calcDays(startDate, endDate);
    },
    calcDaysRemaining(endDate) {
      return GoalService.calcDaysRemaining(endDate);
    },
    calcSuggestedDaily(item) {
      return GoalService.calcSuggestedDaily(item);
    },
    calcProgressFromValues(item) {
      return GoalService.calcProgressFromValues(item);
    },
    autoCalcGoalDateRange(goal) {
      return GoalCalculations.autoCalcGoalDateRange(goal);
    },
    isDailyCompleted(item, goalId, itemIdx, dateStr) {
      return GoalService.isDailyCompleted(item, goalId, itemIdx, dateStr);
    },
    isTodayTaskDay(item, dateStr) {
      return GoalService.isTodayTaskDay(item, dateStr);
    },
    getTodayGoalTasks(dateStr) {
      return GoalService.getTodayGoalTasks(dateStr);
    },
    completeGoalTask(goalId, itemIdx, dateStr, isUncompleting) {
      return GoalService.completeGoalTask(goalId, itemIdx, dateStr, isUncompleting);
    },
    addGoalTaskToTimeline(goal, item, dayData) {
      TimelineService.addEvent(dayData, `${goal.title} - ${item.name}`, "\u5B8C\u6210");
    },
    removeGoalTaskFromTimeline(goal, item, dayData) {
      TimelineService.removeEvent(dayData, `${goal.title} - ${item.name}`);
    },
    async render(data, container) {
      container = container || byId("goalList");
      if (!container) return;
      await this.loadCategories();
      const goals = store.getGlobalGoals().filter((g) => !g.archived);
      let dateSyncChain = Promise.resolve();
      for (const goal of goals) {
        const oldStart = goal.startDate;
        const oldEnd = goal.endDate;
        this.autoCalcGoalDateRange(goal);
        if (goal.startDate !== oldStart || goal.endDate !== oldEnd) {
          dateSyncChain = dateSyncChain.then(
            () => store.updateGlobalGoal(goal.id, goal).catch((e) => console.warn("\u76EE\u6807\u65E5\u671F\u540C\u6B65\u5931\u8D25:", e))
          );
        }
      }
      if (!goals || goals.length === 0) {
        container.innerHTML = `
                <div class="empty-state-card" data-action="goal-add-inline">
                    <div class="empty-state-icon">
                        ${LucideUtils.createIcon("target", { size: 48, strokeWidth: 1.5 })}
                    </div>
                    <div class="empty-state-title">\u8BBE\u5B9A\u4F60\u7684\u76EE\u6807</div>
                    <div class="empty-state-desc">\u957F\u671F\u76EE\u6807\u62C6\u5206\u4E3A\u53EF\u6267\u884C\u7684\u91CC\u7A0B\u7891</div>
                    <div class="empty-state-hint">\u660E\u786E\u7684\u76EE\u6807\u80FD\u8BA9\u4F60\u8D70\u5F97\u66F4\u8FDC</div>
                    <div class="empty-state-action">\u70B9\u51FB\u521B\u5EFA\u76EE\u6807 \u2192</div>
                </div>
            `;
        return;
      }
      container.innerHTML = `
            <div class="goal-health-shell">
                <div id="goalHealthOverviewHost"></div>
            </div>
            <div class="goal-list-body">
                ${goals.map((goal, idx) => this.renderGoalView(goal, idx)).join("")}
                <div class="goal-list-footer">
                    <button class="goal-inline-add-btn" data-action="goal-add-inline">+ \u6DFB\u52A0\u76EE\u6807</button>
                </div>
            </div>
        `;
      const healthHost = container.querySelector("#goalHealthOverviewHost");
      if (healthHost && window.GoalHealthScore) {
        healthHost.innerHTML = GoalHealthScore.renderOverviewCard(goals);
      }
      this.bindViewEvents(container);
      this.setupHoverEffects(container);
    },
    renderSingleGoal(goalId) {
      const container = byId("goalList");
      if (!container) return;
      const goals = store.getGlobalGoals().filter((g) => !g.archived);
      const goalIdx = goals.findIndex((g) => g.id === goalId);
      if (goalIdx === -1) return;
      const goal = goals[goalIdx];
      const goalRow = container.querySelector(`.goal-row[data-goal-id="${CSS.escape(goalId)}"]`);
      if (!goalRow) return;
      const temp = document.createElement("div");
      temp.innerHTML = this.renderGoalView(goal, goalIdx);
      const newRow = temp.firstElementChild;
      goalRow.replaceWith(newRow);
      this.bindViewEvents(container);
      this.setupHoverEffects(container);
    },
    _renderSubItemContent(goal) {
      const hasItems = goal.items && goal.items.length > 0;
      let activeItemsHtml = "";
      let completedItemsHtml = "";
      let completedCount = 0;
      if (hasItems) {
        const sortedItems = goal.items.map((item, originalIdx) => ({ item, originalIdx, itemProgress: this.calcProgressFromValues(item) }));
        const activeItems = sortedItems.filter((item) => item.itemProgress < 100);
        const completedItems = sortedItems.filter((item) => item.itemProgress >= 100);
        completedCount = completedItems.length;
        const renderItem = ({ item, originalIdx, itemProgress }) => {
          const isItemComplete = itemProgress >= 100;
          const isPaused = item.detail === "\u5DF2\u6401\u7F6E";
          const dailyCompleted = this.isDailyCompleted(item, goal.id, originalIdx);
          const dateTagHtml = this.renderSubDateTag(item.startDate, item.endDate);
          const currentVal = item.currentValue !== void 0 && item.currentValue !== "" && item.currentValue !== null ? item.currentValue : item.startValue;
          const targetVal = item.targetValue;
          const formatCurrent = currentVal !== void 0 && currentVal !== "" && currentVal !== null ? this._formatNumber(currentVal) : null;
          const formatTarget = targetVal !== void 0 && targetVal !== "" && targetVal !== null ? this._formatNumber(targetVal) : null;
          const valueInfo = `<span class="goal-item-value">
                        <span class="goal-item-current-value" 
                              data-inline-edit="currentValue" 
                              data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" 
                              data-sub-idx="${originalIdx}"
                              ${formatCurrent && formatCurrent.displayValue !== formatCurrent.fullValue ? `title="${HTMLUtils.escapeHtmlAttr(formatCurrent.fullValue)}"` : ""}>
                            ${formatCurrent ? formatCurrent.displayValue : '<span class="goal-item-empty-placeholder">\u5F53\u524D</span>'}
                        </span>
                        <span class="goal-item-value-sep">/</span>
                        <span class="goal-item-target-value" 
                              data-inline-edit="targetValue" 
                              data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" 
                              data-sub-idx="${originalIdx}"
                              ${formatTarget && formatTarget.displayValue !== formatTarget.fullValue ? `title="${HTMLUtils.escapeHtmlAttr(formatTarget.fullValue)}"` : ""}>
                            ${formatTarget ? formatTarget.displayValue : '<span class="goal-item-empty-placeholder">\u76EE\u6807</span>'}
                        </span>
                    </span>`;
          const dailyBadge = `<span class="goal-item-daily ${dailyCompleted ? "goal-item-daily-complete" : ""}" data-inline-edit="dailyMin" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">${item.dailyMin ? `\u6BCF\u65E5${item.dailyMin}` : '<span class="goal-item-empty-placeholder">\u6BCF\u65E5</span>'}</span>`;
          const dateTag = `<span class="goal-item-date" data-inline-edit="dateRange" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">${dateTagHtml || '<span class="goal-item-empty-placeholder">\u8BBE\u7F6E\u65E5\u671F</span>'}</span>`;
          let remainingBadge = "";
          if (item.endDate) {
            const remaining = this.calcDaysRemaining(item.endDate);
            if (remaining !== null) {
              let rClass = "goal-item-remaining";
              let rText = "";
              if (remaining < 0) {
                rClass += " goal-item-overdue";
                rText = `\u8D85\u671F${Math.abs(remaining)}\u5929`;
              } else if (remaining === 0) {
                rClass += " goal-item-remaining-urgent";
                rText = "\u4ECA\u5929\u622A\u6B62";
              } else if (remaining <= 3) {
                rClass += " goal-item-remaining-urgent";
                rText = `\u5269${remaining}\u5929`;
              } else {
                rText = `\u5269${remaining}\u5929`;
              }
              remainingBadge = `<span class="${rClass}">${rText}</span>`;
            }
          }
          const statusIcon = isPaused ? `<span class="goal-item-status" data-inline-edit="status" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}" title="\u70B9\u51FB\u5207\u6362\u72B6\u6001">${LucideUtils.createIcon("pause", { size: 14 })}</span>` : isItemComplete ? `<span class="goal-item-status goal-item-status-complete" data-inline-edit="status" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}" title="\u70B9\u51FB\u5207\u6362\u72B6\u6001">${LucideUtils.createIcon("check", { size: 14 })}</span>` : "";
          const hasDetail = item.dailyMin || dateTagHtml;
          return `
                <div class="goal-item-entry ${isItemComplete ? "goal-item-complete" : ""} ${isPaused ? "goal-item-paused" : ""}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">
                    <div class="goal-item-row">
                        ${statusIcon}
                        <span class="goal-item-name" data-inline-edit="name" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">${escapeHtml(item.name)}</span>
                        <div class="goal-item-progress">
                            <div class="goal-item-bar">
                                <div class="goal-item-bar-fill ${isItemComplete ? "goal-item-bar-complete" : ""}" style="width: ${Math.min(itemProgress, 100)}%"></div>
                            </div>
                            <span class="goal-item-percent ${isItemComplete ? "goal-item-percent-complete" : ""}">${Math.min(itemProgress, 100)}%</span>
                        </div>
                        <button class="goal-item-delete-btn" data-action="goal-remove-subitem" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}" title="\u5220\u9664\u5B50\u9879\u76EE">
                            ${LucideUtils.createIcon("x", { size: 12 })}
                        </button>
                    </div>
                    <div class="goal-item-meta">
                        ${valueInfo}
                        ${hasDetail ? dailyBadge : ""}
                        ${hasDetail ? dateTag : ""}
                        ${!isItemComplete ? remainingBadge : ""}
                    </div>
                </div>
                `;
        };
        activeItemsHtml = activeItems.map(renderItem).join("");
        completedItemsHtml = completedItems.map(renderItem).join("");
      }
      const isCompletedCollapsed = this._collapsedCompleted.has(goal.id);
      const completedSection = completedItemsHtml ? `
            <div class="completed-items-container ${isCompletedCollapsed ? "collapsed" : ""}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                <div class="completed-items-toggle" data-action="toggle-completed" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                    <span class="completed-items-toggle-icon">${LucideUtils.createIcon("chevronDown", { size: 12 })}</span>
                    <span>\u5DF2\u5B8C\u6210 (${completedCount})</span>
                </div>
                <div class="completed-items-list">
                    ${completedItemsHtml}
                </div>
            </div>
        ` : "";
      return activeItemsHtml + completedSection + `
            <button class="goal-item-add-btn" data-action="goal-quick-add-subitem" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                ${LucideUtils.createIcon("plusCircle", { size: 16 })} \u6DFB\u52A0\u5B50\u9879\u76EE
            </button>
        `;
    },
    renderGoalView(goal, idx) {
      const hasItems = goal.items && goal.items.length > 0;
      const progress = this.calcProgress(goal);
      const isComplete = progress >= 100;
      const categories = this.getCategories();
      const category = categories.find((c) => c.id === goal.category);
      const dateTag = this.renderDateRangeTag(goal.startDate, goal.endDate, `data-inline-edit="dateRange" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}"`, isComplete);
      const categoryTag = category ? `<span class="goal-row-category" data-inline-edit="category" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-category="${HTMLUtils.escapeHtmlAttr(category.id)}">${escapeHtml(category.name)}</span>` : "";
      const priority = goal.priority || "medium";
      const priorityLabel = priority === "high" ? "\u9AD8" : priority === "medium" ? "\u4E2D" : "\u4F4E";
      const remaining = this.calcDaysRemaining(goal.endDate);
      const isOverdue = remaining !== null && remaining < 0;
      const isSoon = remaining !== null && remaining >= 0 && remaining <= 3;
      let remainingBadge = "";
      if (!isComplete && goal.endDate && remaining !== null) {
        let rText = "";
        if (remaining < 0) {
          rText = `\u5DF2\u8D85\u671F${Math.abs(remaining)}\u5929`;
        } else if (remaining === 0) {
          rText = "\u4ECA\u5929\u622A\u6B62";
        } else {
          rText = `\u5269${remaining}\u5929`;
        }
        remainingBadge = `<span class="goal-row-remaining">${rText}</span>`;
      }
      return `
        <div class="goal-row ${isComplete ? "goal-complete" : ""} ${isOverdue ? "goal-overdue" : ""} ${isSoon ? "goal-soon" : ""}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-goal-idx="${idx}" onmouseenter="this.classList.add('is-hovered')" onmouseleave="this.classList.remove('is-hovered')">
            <div class="goal-row-main">
                <div class="goal-row-body">
                    <div class="goal-row-top-line">
                        <div class="goal-row-header">
                            ${categoryTag}
                            <span class="goal-row-title ${isComplete ? "goal-title-complete" : ""}" data-inline-edit="title" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}"><span class="goal-row-title-text">${escapeHtml(goal.title)}</span></span>
                            <span class="goal-priority-tag ${priority}" data-inline-edit="priority" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                                <span class="goal-priority-dot ${priority}"></span>${priorityLabel}
                            </span>
                            <span class="goal-row-toggle">${LucideUtils.createIcon("chevronRight", { size: 14 })}</span>
                        </div>
                        
                        <div class="goal-row-actions">
                            <button class="goal-row-action-btn goal-row-action-btn-info" data-action="goal-save-template" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="\u4FDD\u5B58\u4E3A\u6A21\u677F">
                                ${LucideUtils.createIcon("bookmark", { size: 14 })}
                            </button>
                            <button class="goal-row-action-btn goal-row-action-btn-success" data-action="goal-archive" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="\u5F52\u6863">
                                ${LucideUtils.createIcon("archive", { size: 14 })}
                            </button>
                            <button class="goal-row-action-btn goal-row-action-btn-danger" data-action="goal-delete" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="\u5220\u9664">
                                ${LucideUtils.createIcon("trash", { size: 14 })}
                            </button>
                        </div>
                    </div>
                    <div class="goal-row-meta-row">
                        ${goal.meta ? `<span class="goal-row-meta" data-inline-edit="meta" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">${escapeHtml(goal.meta)}</span>` : ""}
                        ${dateTag}
                        ${remainingBadge}
                        <span class="goal-row-percent ${isComplete ? "goal-percent-complete" : ""}">${Math.min(progress, 100)}%</span>
                    </div>
                    <div class="goal-row-progress">
                        <div class="goal-row-bar">
                            <div class="goal-row-bar-fill ${isComplete ? "goal-bar-complete" : ""}" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="goal-item-list ${hasItems ? this._expandedGoals.has(goal.id) ? "" : "collapsed" : "collapsed"}">
                ${this._renderSubItemContent(goal)}
            </div>
        </div>
        `;
    },
    // ========== 归档管理（委托 GoalsArchiver） ==========
    openArchiveManager() {
      GoalsArchiver.openArchiveManager();
    },
    /** 单项恢复（供 ActionDispatcher 调用） */
    unarchiveGoal(goalId) {
      GoalsArchiver.unarchiveGoal(goalId);
    },
    /** 单项永久删除（供 ActionDispatcher 调用） */
    async deleteArchivedGoal(goalId) {
      return GoalsArchiver.deleteArchivedGoal(goalId);
    },
    openHealthScoreDetail() {
      if (!window.GoalHealthScore) return;
      const goals = store.getGlobalGoals().filter((g) => !g.archived);
      const dataCache = GoalHealthScore._buildDataCache ? GoalHealthScore._buildDataCache(goals) : null;
      const results = goals.map((g) => GoalHealthScore.compute(g, dataCache));
      const set = GoalHealthScore.computeSet(goals, results);
      const dynamicHints = GoalHealthScore.generateDynamicHints(set, results);
      let goalsDetailHtml = "";
      if (goals.length > 0) {
        goalsDetailHtml = goals.map((goal, idx) => {
          const healthScore = results[idx];
          return `
                    <div class="health-goal-item">
                        <div class="health-goal-title">${escapeHtml(goal.title)}</div>
                        <div class="health-goal-score" style="color: ${healthScore.color};">
                            ${healthScore.score}\u5206 \xB7 ${healthScore.label}
                        </div>
                        <div class="health-goal-hints">
                            ${healthScore.L1.onTime.hint ? `<div class="health-goal-hint">${LucideUtils.createIcon("calendar", { size: 14, strokeWidth: 1.8 })} ${healthScore.L1.onTime.hint}</div>` : ""}
                            ${healthScore.L3.stagnation.hint ? `<div class="health-goal-hint">${LucideUtils.createIcon("clock", { size: 14, strokeWidth: 1.8 })} ${healthScore.L3.stagnation.hint}</div>` : ""}
                        </div>
                    </div>
                `;
        }).join("");
      }
      const content = `
            <div id="tab-content-overview" class="fab-tab-content active">
                ${typeof StatsModal !== "undefined" ? StatsModal.renderStatsHTML() : ""}
            </div>

            <div id="tab-content-diagnosis" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div class="health-section-title">\u6838\u5FC3\u4F53\u68C0</div>
                    <div class="health-overview-large" style="--avg-color: ${set.avgColor};">
                        <div class="health-score-ring" style="--score: ${set.avgScore}%;">
                            <div class="health-score-inner">
                                <div class="health-score-number" style="color: ${set.avgColor};">
                                    ${set.avgScore}
                                    ${set.trend !== 0 ? `
                                        <span class="score-trend" style="color: ${set.trend > 0 ? "var(--bamboo-primary)" : "#dc3545"}">
                                            ${set.trend > 0 ? "\u2191" : "\u2193"}${Math.abs(set.trend)}
                                        </span>
                                    ` : ""}
                                </div>
                                <div class="health-score-label">\u5065\u5EB7\u5206</div>
                                <div class="health-score-level">${set.avgLabel}</div>
                            </div>
                        </div>
                        <div class="health-layers-detail">
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: var(--bamboo-primary);"></div>
                                    <span class="health-layer-name">L1 \u6267\u884C\u529B</span>
                                    <span class="health-layer-score" style="color: var(--bamboo-primary);">${set.L1}</span>
                                </div>
                                <div class="health-layer-desc">\u6309\u65F6\u5B8C\u6210\u3001\u9002\u5EA6\u63D0\u524D\u3001\u5468\u6D3B\u8DC3\u5EA6</div>
                            </div>
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: var(--bamboo-light);"></div>
                                    <span class="health-layer-name">L2 \u52A8\u529B\u6307\u6570</span>
                                    <span class="health-layer-score" style="color: var(--bamboo-light);">${set.L2}</span>
                                </div>
                                <div class="health-layer-desc">\u8FDB\u5EA6\u8D8B\u52BF\u3001\u5B8C\u6210\u8D8B\u52BF\u3001\u52A0\u901F\u6307\u6570</div>
                            </div>
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: #c9a227;"></div>
                                    <span class="health-layer-name">L3 \u53EF\u6301\u7EED\u5EA6</span>
                                    <span class="health-layer-score" style="color: #c9a227;">${set.L3}</span>
                                </div>
                                <div class="health-layer-desc">\u505C\u6EDE\u6307\u6570\u3001\u8D1F\u8377\u5747\u8861\u3001\u53EF\u6301\u7EED\u5EA6</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${goalsDetailHtml ? `
                    <div class="fab-panel-section">
                        <div class="health-section-title">\u9879\u76EE\u8BCA\u65AD</div>
                        <div class="health-goals-list">
                            ${goalsDetailHtml}
                        </div>
                    </div>
                ` : ""}
                
                <div class="fab-panel-section">
                    <div class="health-section-title">\u7CFB\u7EDF\u6218\u7565\u8BCA\u65AD</div>
                    <div class="health-tips">
                        <div class="dynamic-hints-list">
                            ${dynamicHints.map((hint) => `
                                <div class="dynamic-hint-item">
                                    <div class="dynamic-hint-content">
                                        <div class="dynamic-hint-text" style="color: ${hint.type === "danger" ? "#dc3545" : hint.type === "warning" ? "#f59e0b" : "var(--bamboo-primary)"};">
                                            ${hint.text}
                                        </div>
                                        <div class="dynamic-hint-action">
                                            ${hint.action}
                                        </div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            </div>

            <div id="tab-content-system" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div class="health-section-title">\u8BBE\u8BA1\u54F2\u5B66</div>
                    <div class="philosophy-card">
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">\u4E09\u5C42\u8BC4\u4F30\u4F53\u7CFB</div>
                                <div class="philosophy-desc">\u4ECE\u6267\u884C\u529B\u3001\u52A8\u529B\u6307\u6570\u5230\u53EF\u6301\u7EED\u5EA6\u7684\u5168\u65B9\u4F4D\u8BCA\u65AD\uFF0C\u6A21\u62DF\u771F\u5B9E\u4E16\u754C\u7684\u76EE\u6807\u7BA1\u7406\u903B\u8F91\u3002</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">\u65F6\u95F4\u4EF7\u503C\u5BFC\u5411</div>
                                <div class="philosophy-desc">\u91CD\u89C6\u6309\u65F6\u5B8C\u6210\uFF0C\u540C\u65F6\u907F\u514D\u8FC7\u5EA6\u8D85\u524D\uFF0C\u627E\u5230\u65F6\u95F4\u7BA1\u7406\u7684\u5E73\u8861\u70B9\u3002</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">\u8D8B\u52BF\u91CD\u4E8E\u7ED3\u679C</div>
                                <div class="philosophy-desc">\u4E0D\u4EC5\u770B\u5F53\u524D\u8FDB\u5EA6\uFF0C\u66F4\u5173\u6CE8\u53D8\u5316\u8D8B\u52BF\uFF0C\u5C0F\u6B65\u5FEB\u8DD1\u7684\u6B63\u5411\u53CD\u9988\u6700\u91CD\u8981\u3002</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">\u53EF\u6301\u7EED\u53D1\u5C55\u89C2</div>
                                <div class="philosophy-desc">\u8B66\u60D5\u505C\u6EDE\u548C\u8FC7\u8F7D\uFF0C\u9F13\u52B1\u7A33\u5B9A\u3001\u5747\u8861\u3001\u53EF\u6301\u7EED\u7684\u63A8\u8FDB\u8282\u594F\u3002</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">\u8BC4\u5206\u6807\u51C6\u8BE6\u89E3</div>
                    <div class="rating-card">
                        <div class="rating-tier excellent">
                            <div class="rating-badge">\u4F18\u79C0</div>
                            <div class="rating-range">85-100\u5206</div>
                            <div class="rating-desc">\u6218\u7565\u6267\u884C\u5904\u4E8E\u6781\u9AD8\u6C34\u5E73\uFF0C\u5DF2\u5EFA\u7ACB\u7A33\u56FA\u7684\u4E60\u60EF\u95ED\u73AF\u3002\u4FDD\u6301\u5F53\u524D\u8282\u594F\uFF0C\u53EF\u5C1D\u8BD5\u9010\u6B65\u589E\u52A0\u4EFB\u52A1\u8D1F\u8377\u3002</div>
                        </div>
                        <div class="rating-tier good">
                            <div class="rating-badge">\u826F\u597D</div>
                            <div class="rating-range">70-84\u5206</div>
                            <div class="rating-desc">\u6574\u4F53\u6267\u884C\u72B6\u51B5\u826F\u597D\uFF0C\u5728\u67D0\u4E9B\u7EF4\u5EA6\u8FD8\u6709\u63D0\u5347\u7A7A\u95F4\u3002\u7EE7\u7EED\u4FDD\u6301\u4F18\u52BF\uFF0C\u5173\u6CE8\u8BCA\u65AD\u63D0\u793A\u4E2D\u7684\u6539\u8FDB\u70B9\u3002</div>
                        </div>
                        <div class="rating-tier warning">
                            <div class="rating-badge">\u9700\u5173\u6CE8</div>
                            <div class="rating-range">50-69\u5206</div>
                            <div class="rating-desc">\u5B58\u5728\u4E00\u4E9B\u9700\u8981\u5173\u6CE8\u7684\u95EE\u9898\uFF0C\u53EF\u80FD\u51FA\u73B0\u8FDB\u5EA6\u843D\u540E\u6216\u52A8\u529B\u4E0D\u8DB3\u3002\u5EFA\u8BAE\u6839\u636E\u8BCA\u65AD\u63D0\u793A\u8C03\u6574\u7B56\u7565\u3002</div>
                        </div>
                        <div class="rating-tier risk">
                            <div class="rating-badge">\u98CE\u9669</div>
                            <div class="rating-range">0-49\u5206</div>
                            <div class="rating-desc">\u7CFB\u7EDF\u68C0\u6D4B\u5230\u4E25\u91CD\u98CE\u9669\uFF0C\u9879\u76EE\u53EF\u80FD\u9762\u4E34\u505C\u6EDE\u6216\u5931\u63A7\u3002\u5EFA\u8BAE\u7ACB\u5373\u91CD\u65B0\u5BA1\u89C6\u76EE\u6807\u8BBE\u5B9A\u548C\u6267\u884C\u7B56\u7565\u3002</div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">\u4E09\u5C42\u6307\u6807\u4F53\u7CFB</div>
                    <div class="layers-detail-card">
                        <div class="layer-detail-item primary">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L1 \u6267\u884C\u529B</div>
                                    <div class="layer-detail-weight">\u6743\u91CD\uFF1A45%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">\u6309\u65F6\u5B8C\u6210\u7387</div>
                                    <div class="metric-weight">30%</div>
                                    <div class="metric-desc">\u6309\u65F6\uFF080~-3\u5929\uFF09\u5F97100\uFF0C\u62D6\u5EF6\u4F1A\u6263\u5206\u3002</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">\u9002\u5EA6\u63D0\u524D\u7387</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">\u63D0\u524D1~3\u5929\u5F9780\uFF0C\u8FC7\u5EA6\u8D85\u524D\u4F1A\u6263\u5206\u3002</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">\u5468\u6D3B\u8DC3\u5EA6</div>
                                    <div class="metric-weight">5%</div>
                                    <div class="metric-desc">\u8FD17\u5929\u6709\u63A8\u8FDB\u7684\u5DE5\u4F5C\u65E5\u5360\u6BD4\u3002</div>
                                </div>
                            </div>
                        </div>
                        <div class="layer-detail-item">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color" style="background: var(--bamboo-light);"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L2 \u52A8\u529B\u6307\u6570</div>
                                    <div class="layer-detail-weight">\u6743\u91CD\uFF1A30%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">\u8FDB\u5EA6\u8D8B\u52BF</div>
                                    <div class="metric-weight">20%</div>
                                    <div class="metric-desc">\u8FD1\u671F\u8FDB\u5EA6\u589E\u91CF\u4E0E\u5386\u53F2\u6C34\u5E73\u7684\u5BF9\u6BD4\u3002</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">\u5B8C\u6210\u8D8B\u52BF</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">\u5B50\u4EFB\u52A1\u5B8C\u6210\u901F\u5EA6\u7684\u53D8\u5316\u8D8B\u52BF\u3002</div>
                                </div>
                            </div>
                        </div>
                        <div class="layer-detail-item">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color" style="background: #c9a227;"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L3 \u53EF\u6301\u7EED\u5EA6</div>
                                    <div class="layer-detail-weight">\u6743\u91CD\uFF1A25%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">\u505C\u6EDE\u60E9\u7F5A</div>
                                    <div class="metric-weight">\u52A8\u6001</div>
                                    <div class="metric-desc">\u65E0\u63A8\u8FDB\u5929\u6570\u7684\u6307\u6570\u7EA7\u60E9\u7F5A\u3002</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">\u8D1F\u8377\u5747\u8861\u5EA6</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">\u5B50\u4EFB\u52A1\u8FDB\u5EA6\u7684\u6807\u51C6\u5DEE\u3002</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">\u8FC7\u5EA6\u8D85\u524D\u60E9\u7F5A</div>
                                    <div class="metric-weight">\u52A8\u6001</div>
                                    <div class="metric-desc">\u8FC7\u5EA6\u63D0\u524D\u5B8C\u6210\u7684\u7EBF\u6027\u60E9\u7F5A\u3002</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">\u62D6\u5EF6\u60E9\u7F5A</div>
                                    <div class="metric-weight">\u52A8\u6001</div>
                                    <div class="metric-desc">\u62D6\u5EF6\u7684\u7EBF\u6027\u60E9\u7F5A\u3002</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
      PanelManager.open("health-score", LucideUtils.createIcon("target", { size: 16 }) + "\u6218\u7565\u590D\u76D8", content, {
        tabs: [
          { id: "overview", label: "\u6570\u636E\u6982\u89C8" },
          { id: "diagnosis", label: "\u6DF1\u5EA6\u8BCA\u65AD" },
          { id: "system", label: "\u8BC4\u5206\u4F53\u7CFB" }
        ],
        onOpen: (panel) => {
          if (set.avgScore >= 90) {
            panel.classList.add("status-excellent");
          } else if (set.avgScore < 60) {
            panel.classList.add("status-risk");
            const scoreEl = panel.querySelector(".health-score-number");
            if (scoreEl) scoreEl.classList.add("shake-element");
          }
        }
      });
    },
    /**
     * 归档目标（从主页移除，进入归档区）
     */
    async archiveGoal(goalId) {
      await store.archiveGoal(goalId);
      this.render();
      if (typeof TodoRenderer !== "undefined") TodoRenderer._invalidateCache();
      if (typeof renderAll === "function") renderAll();
      Toast.showToast("\u76EE\u6807\u5DF2\u5F52\u6863\uFF0C\u53EF\u5728\u76EE\u6807\u5F52\u6863\u4E2D\u67E5\u770B", "success");
    },
    /**
     * 就地编辑子项目名称
     */
    renderDateRangeTag(startDate, endDate, dataAttrs = "", isComplete = false) {
      if (!startDate && !endDate) return "";
      const days = this.calcDays(startDate, endDate);
      const remaining = this.calcDaysRemaining(endDate);
      let cls = "goal-date-range";
      let inner = "";
      if (startDate && endDate) {
        inner = `${escapeHtml(startDate)} \u2192 ${escapeHtml(endDate)}`;
        if (days !== null) inner += ` (${days}\u5929)`;
      } else if (startDate) {
        inner = `\u4ECE ${escapeHtml(startDate)} \u8D77`;
      } else {
        inner = `\u622A\u6B62 ${escapeHtml(endDate)}`;
      }
      if (!isComplete && remaining !== null) {
        if (remaining < 0) {
          cls += " goal-date-overdue";
        } else if (remaining <= 3) {
          cls += " goal-date-soon";
        }
      }
      return `
            <span class="${cls}"${dataAttrs ? " " + dataAttrs : ""}>
                ${inner}
                <div class="goal-date-tooltip">
                    <div class="goal-date-tooltip-arrow"></div>
                    <div class="goal-date-tooltip-content">
                        <div class="goal-date-tooltip-item">\u6839\u636E\u5B50\u9879\u76EE\u81EA\u52A8\u8BA1\u7B97</div>
                    </div>
                </div>
            </span>
        `;
    },
    renderSubDateTag(startDate, endDate) {
      if (!startDate && !endDate) return "";
      const days = this.calcDays(startDate, endDate);
      let text = "";
      if (startDate && endDate) {
        text = `${escapeHtml(startDate.slice(5))}\u2192${escapeHtml(endDate.slice(5))}`;
        if (days !== null) text += ` ${days}\u5929`;
      } else if (startDate) {
        text = `\u4ECE${escapeHtml(startDate.slice(5))}`;
      } else {
        text = `\u622A\u6B62${escapeHtml(endDate.slice(5))}`;
      }
      return text;
    },
    bindViewEvents(container) {
      if (container._goalClickHandler) {
        container.removeEventListener("click", container._goalClickHandler);
      }
      if (container._goalKeyHandler) {
        container.removeEventListener("keydown", container._goalKeyHandler);
      }
      container._goalClickHandler = (e) => {
        const t = e.target;
        const healthCard = t.closest(".goal-health-overview");
        if (healthCard) {
          e.stopPropagation();
          this.openHealthScoreDetail();
          return;
        }
        if (t.closest(".goal-row-action-btn")) return;
        const editable = t.closest("[data-inline-edit]");
        if (editable) {
          e.stopPropagation();
          this._startInlineEdit(editable);
          return;
        }
        const toggleBtn = t.closest(".goal-row-toggle");
        if (toggleBtn) {
          const goalRow = toggleBtn.closest(".goal-row");
          if (goalRow) {
            GoalsRenderer2.toggleCollapse(goalRow);
          }
          return;
        }
        const header = t.closest(".goal-row-header");
        if (header) {
          const goalRow = header.closest(".goal-row");
          if (goalRow) {
            GoalsRenderer2.toggleCollapse(goalRow);
          }
          return;
        }
        const completedToggle = t.closest('[data-action="toggle-completed"]');
        if (completedToggle) {
          const container2 = completedToggle.closest(".completed-items-container");
          const goalId = completedToggle.dataset.goalId;
          if (container2 && goalId) {
            container2.classList.toggle("collapsed");
            if (container2.classList.contains("collapsed")) {
              GoalsRenderer2._collapsedCompleted.add(goalId);
            } else {
              GoalsRenderer2._collapsedCompleted.delete(goalId);
            }
          }
          return;
        }
        const actionBtn = t.closest("[data-action]");
        if (actionBtn) return;
        const itemRow = t.closest(".goal-item-entry");
        if (itemRow) return;
      };
      container.addEventListener("click", container._goalClickHandler);
      container._goalKeyHandler = (e) => {
        const healthCard = e.target.closest(".goal-health-overview");
        if (!healthCard) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          this.openHealthScoreDetail();
          const isPressed = healthCard.getAttribute("aria-pressed") === "true";
          healthCard.setAttribute("aria-pressed", !isPressed);
        }
      };
      container.addEventListener("keydown", container._goalKeyHandler);
    },
    setupHoverEffects(container) {
      if (container._hoverCleanup) container._hoverCleanup();
      let currentRow = null;
      const onMouseMove = (e) => {
        const row = e.target.closest(".goal-row");
        if (!row || row === currentRow) return;
        currentRow = row;
        const rect = row.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        row.style.setProperty("--mouse-x", `${x}%`);
        row.style.setProperty("--mouse-y", `${y}%`);
      };
      const onMouseLeave = (e) => {
        if (currentRow && !container.contains(e.relatedTarget)) {
          currentRow.style.setProperty("--mouse-x", "50%");
          currentRow.style.setProperty("--mouse-y", "50%");
          currentRow = null;
        }
      };
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
      container._hoverCleanup = () => {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
      };
    },
    /**
     * 启动单体行内编辑 — 仅替换被点击的元素为输入框
     */
    _startInlineEdit(el) {
      const editType = el.dataset.inlineEdit;
      const goalId = el.dataset.goalId;
      const subIdx = el.dataset.subIdx !== void 0 ? parseInt(el.dataset.subIdx) : null;
      if (el.querySelector("input, textarea, select")) return;
      const goals = store.getGlobalGoals();
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      if (goal.archived) {
        Toast.showToast("\u5DF2\u5F52\u6863\u76EE\u6807\u4E0D\u53EF\u7F16\u8F91\uFF0C\u8BF7\u5148\u6062\u590D", "warning");
        return;
      }
      let input;
      let hint = null;
      let closeHintFn = null;
      const saveAndRender = () => {
        if (closeHintFn) {
          closeHintFn({ target: input });
          closeHintFn = null;
        }
        const val = input.value.trim();
        if (val === "" && (editType === "title" || editType === "name")) {
          this.renderSingleGoal(goalId);
          return;
        }
        const doSave = () => {
          return this._commitInlineEdit(goal, subIdx, editType, val).then(() => {
            this._pendingEditPromise = null;
            this.renderSingleGoal(goalId);
          }).catch((e) => {
            this._pendingEditPromise = null;
            console.error("Save failed:", e);
            this.renderSingleGoal(goalId);
          });
        };
        if (this._pendingEditPromise) {
          this._pendingEditPromise = this._pendingEditPromise.then(doSave, doSave);
        } else {
          this._pendingEditPromise = doSave();
        }
      };
      const cancel = () => {
        if (closeHintFn) {
          closeHintFn({ target: input });
        }
        this.renderSingleGoal(goalId);
      };
      switch (editType) {
        case "title": {
          const current = el.textContent.trim();
          input = document.createElement("input");
          input.type = "text";
          input.value = current;
          input.className = "goal-inline-edit-input";
          input.style.cssText = "font:inherit;font-weight:600;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:clamp(80px, 15vw, 160px);";
          break;
        }
        case "meta": {
          const current = el.textContent.trim();
          input = document.createElement("input");
          input.type = "text";
          input.value = current;
          input.className = "goal-inline-edit-input";
          input.style.cssText = "font:inherit;font-size:var(--font-size-xs);color:var(--text-secondary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:80px;";
          break;
        }
        case "name": {
          const current = el.textContent.replace(/^[✓⏸]\s*/, "").trim();
          input = document.createElement("input");
          input.type = "text";
          input.value = current;
          input.className = "goal-inline-edit-input";
          input.style.cssText = "font:inherit;font-weight:500;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:80px;";
          break;
        }
        case "currentValue": {
          const rawVal = subIdx !== null && goal.items && goal.items[subIdx] ? goal.items[subIdx].currentValue !== void 0 && goal.items[subIdx].currentValue !== "" ? goal.items[subIdx].currentValue : goal.items[subIdx].startValue : el.textContent.trim();
          const current = rawVal;
          input = document.createElement("input");
          input.type = "text";
          input.value = current;
          input.className = "goal-inline-edit-input";
          input.style.cssText = "font:inherit;font-weight:500;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:4px 8px;outline:none;background:var(--bamboo-background);min-width:44px;max-width:200px;text-align:right;box-sizing:border-box;";
          const updateCVWidth = () => {
            const len = input.value.length || 1;
            input.style.width = Math.max(44, Math.min(200, len * 10 + 24)) + "px";
          };
          input.addEventListener("input", updateCVWidth);
          updateCVWidth();
          break;
        }
        case "dailyMin": {
          const current = subIdx !== null && goal.items && goal.items[subIdx] ? goal.items[subIdx].dailyMin || "" : "";
          input = document.createElement("input");
          input.type = "number";
          input.value = current;
          input.step = "any";
          input.placeholder = "";
          input.className = "goal-inline-edit-input";
          input.style.cssText = "font:inherit;font-size:var(--font-size-xs);color:var(--bamboo-warning);border:none;border-radius:0;padding:0;outline:none;background:transparent;min-width:20px;max-width:90px;text-align:left;box-sizing:border-box;font-weight:600;";
          const updateDMWidth = () => {
            const len = input.value.length || 1;
            input.style.width = Math.max(20, Math.min(90, len * 10)) + "px";
          };
          input.addEventListener("input", updateDMWidth);
          updateDMWidth();
          break;
        }
        case "targetValue": {
          const rawVal = subIdx !== null && goal.items && goal.items[subIdx] ? goal.items[subIdx].targetValue : el.textContent.trim();
          const current = rawVal;
          input = document.createElement("input");
          input.type = "text";
          input.value = current === "-" ? "" : current;
          input.placeholder = "\u76EE\u6807";
          input.className = "goal-inline-edit-input";
          input.style.cssText = "font:inherit;font-size:var(--font-size-sm);color:var(--text-secondary);border:1px solid var(--bamboo-primary);border-radius:6px;padding:4px 8px;outline:none;background:var(--bamboo-background);min-width:60px;max-width:200px;text-align:center;box-sizing:border-box;";
          const updateWidth = () => {
            const len = input.value.length || 1;
            input.style.width = Math.max(60, Math.min(200, len * 10 + 24)) + "px";
          };
          input.addEventListener("input", updateWidth);
          updateWidth();
          break;
        }
        case "category": {
          const currentCatId = el.dataset.category || "";
          this._showCategoryPicker({
            el,
            currentCatId,
            onSelect: (catId) => {
              this._pendingEditPromise = this._commitInlineEdit(goal, null, "category", catId).then(() => {
                this._pendingEditPromise = null;
                this.renderSingleGoal(goalId);
              }).catch((e) => console.warn("[Bamboo] \u76EE\u6807\u5206\u7C7B\u4FDD\u5B58\u5931\u8D25:", e));
            },
            onCancel: () => this.renderSingleGoal(goalId)
          });
          return;
        }
        case "priority": {
          const currentPriority = goal.priority || "medium";
          this._showPriorityPicker({
            el,
            currentPriority,
            onSelect: (priority) => {
              this._pendingEditPromise = this._commitInlineEdit(goal, null, "priority", priority).then(() => {
                this._pendingEditPromise = null;
                this.renderSingleGoal(goalId);
              }).catch((e) => console.warn("[Bamboo] \u76EE\u6807\u4F18\u5148\u7EA7\u4FDD\u5B58\u5931\u8D25:", e));
            },
            onCancel: () => this.renderSingleGoal(goalId)
          });
          return;
        }
        case "status": {
          if (subIdx === null || !goal.items || !goal.items[subIdx]) return;
          const item = goal.items[subIdx];
          const currentStatus = item.detail || "";
          const nextStatus = currentStatus === "\u5DF2\u6401\u7F6E" ? "" : "\u5DF2\u6401\u7F6E";
          this._pendingEditPromise = this._commitInlineEdit(goal, subIdx, "status", nextStatus).then(() => {
            this._pendingEditPromise = null;
            this.renderSingleGoal(goalId);
          }).catch((e) => console.warn("[Bamboo] \u76EE\u6807\u72B6\u6001\u4FDD\u5B58\u5931\u8D25:", e));
          return;
        }
        case "dateRange": {
          if (subIdx === null) {
            Toast.showToast("\u76EE\u6807\u65E5\u671F\u6839\u636E\u5B50\u9879\u76EE\u81EA\u52A8\u8BA1\u7B97", "info");
            return;
          }
          let currentStart = "";
          let currentEnd = "";
          if (goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            currentStart = item.startDate || "";
            currentEnd = item.endDate || "";
          }
          this._showDateRangePicker({
            el,
            goal,
            subIdx,
            currentStart,
            currentEnd,
            onSelect: (startDate, endDate) => {
              this._pendingEditPromise = this._commitInlineEdit(goal, subIdx, "dateRange", `${startDate}\u2192${endDate}`).then(() => {
                this._pendingEditPromise = null;
                this.renderSingleGoal(goalId);
              }).catch((e) => console.warn("[Bamboo] \u76EE\u6807\u65E5\u671F\u8303\u56F4\u4FDD\u5B58\u5931\u8D25:", e));
            },
            onCancel: () => this.renderSingleGoal(goalId)
          });
          return;
        }
        default:
          return;
      }
      el.replaceWith(input);
      input.focus();
      input.select();
      if (editType === "dailyMin" && subIdx !== null && goal.items && goal.items[subIdx]) {
        const item = goal.items[subIdx];
        const suggested = GoalService.calcSuggestedDaily(item);
        const remainingDays = GoalService.calcDaysRemaining(item.endDate);
        const targetVal = parseFloat(item.targetValue) || 0;
        const currentVal = parseFloat(item.currentValue) || parseFloat(item.startValue) || 0;
        const remainingVal = targetVal - currentVal;
        if (suggested !== null && suggested > 0 && remainingVal > 0 && remainingDays !== null) {
          const suggestedVal = String(suggested);
          const hint2 = document.createElement("div");
          hint2.className = "goal-daily-hint";
          hint2.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;"><span>\u{1F4A1} \u70B9\u51FB\u586B\u5165<br><strong>${suggestedVal}/\u5929</strong></span><span style="cursor:pointer;opacity:0.7;font-size:14px;line-height:1;" class="hint-close">\u2715</span></div><span style="font-size:10px;opacity:0.8;">\u5269\u4F59 ${remainingVal.toFixed(1)} / ${remainingDays} \u5929</span>`;
          hint2.style.cssText = "position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:8px;padding:10px 14px;background:var(--bamboo-primary);color:white;border-radius:10px;font-size:12px;white-space:nowrap;z-index:1000;box-shadow:0 4px 16px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.3);line-height:1.4;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s,opacity:0.2s;";
          hint2.addEventListener("mouseenter", () => {
            hint2.style.transform = "translateX(-50%) scale(1.05)";
            hint2.style.boxShadow = "0 6px 20px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.4)";
          });
          hint2.addEventListener("mouseleave", () => {
            hint2.style.transform = "translateX(-50%) scale(1)";
            hint2.style.boxShadow = "0 4px 16px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.3)";
          });
          hint2.addEventListener("mousedown", (e) => {
            e.preventDefault();
          });
          const closeHint = (e) => {
            if (!eventInTargets2(e, hint2) && !eventInTargets2(e, input)) {
              hint2.style.opacity = "0";
              setTimeout(() => hint2.remove(), 200);
              document.removeEventListener("click", closeHint);
            }
          };
          closeHintFn = closeHint;
          hint2.addEventListener("click", (e) => {
            e.stopPropagation();
            if (e.target.classList.contains("hint-close")) return;
            input.value = suggestedVal;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            hint2.style.opacity = "0";
            setTimeout(() => hint2.remove(), 200);
            document.removeEventListener("click", closeHint);
            input.removeEventListener("blur", saveAndRender);
            saveAndRender();
          });
          const closeBtn = hint2.querySelector(".hint-close");
          closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            hint2.style.opacity = "0";
            setTimeout(() => hint2.remove(), 200);
            document.removeEventListener("click", closeHint);
          });
          const arrow = document.createElement("div");
          arrow.style.cssText = "position:absolute;bottom:100%;left:50%;transform:translateX(-50%);border:7px solid transparent;border-bottom-color:var(--bamboo-primary);";
          hint2.appendChild(arrow);
          setTimeout(() => document.addEventListener("click", closeHint), 100);
          const wrapper = document.createElement("div");
          wrapper.style.cssText = "position:relative;display:inline-flex;";
          input.parentNode.replaceChild(wrapper, input);
          wrapper.appendChild(input);
          wrapper.appendChild(hint2);
        }
      }
      input.addEventListener("blur", saveAndRender, { once: true });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          input.blur();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          input.removeEventListener("blur", saveAndRender);
          cancel();
        }
      });
    },
    /**
     * 提交单体行内编辑到 store
     */
    async _commitInlineEdit(staleGoal, subIdx, editType, value) {
      return window.GoalInlineEditService.commit(staleGoal, subIdx, editType, value, {
        calcProgress: (g) => this.calcProgress(g),
        autoCalcEndDate: (i) => this._autoCalcEndDate(i),
        autoCalcGoalDateRange: (g) => this.autoCalcGoalDateRange(g),
        renderSingleGoal: (id) => this.renderSingleGoal(id)
      });
    },
    /**
     * 根据剩余量、每日量、起始日期自动计算结束日期
     * 触发条件：targetValue / dailyMin / currentValue 变更时
     */
    _autoCalcEndDate(item) {
      if (item && item.manuallySetDate) return;
      const target = parseFloat(item.targetValue);
      const dailyMin = parseFloat(item.dailyMin);
      if (!target || !dailyMin || dailyMin <= 0) return;
      const start = parseFloat(item.startValue) || 0;
      const current = parseFloat(item.currentValue) || start;
      const remaining = Math.abs(target - current);
      if (remaining <= 0) return;
      const days = Math.ceil(remaining / dailyMin);
      const startDate = item.startDate ? /* @__PURE__ */ new Date(item.startDate + "T00:00:00") : (() => {
        const d = /* @__PURE__ */ new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
      if (isNaN(startDate.getTime())) return;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days - 1);
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const newEndDate = fmt(endDate);
      if (item.endDate !== newEndDate) {
        item.endDate = newEndDate;
      }
    },
    /**
     * 显示日期范围选择器
     */
    _showDateRangePicker({ el, goal, subIdx, currentStart, currentEnd, onSelect, onCancel }) {
      return DateRangePicker.show({ el, goal, subIdx, currentStart, currentEnd, onSelect, onCancel });
    },
    /**
     * 显示分类选择器
     */
    _showCategoryPicker({ el, currentCatId, onSelect, onCancel }) {
      const categories = this.getCategories();
      CategoryPicker.show({
        el,
        categories,
        currentCatId,
        onSelect,
        onCancel,
        onManageCategories: () => {
          this._showCategoryManager(() => {
            this._showCategoryPicker({ el, currentCatId, onSelect, onCancel });
          });
        }
      });
    },
    _showPriorityPicker({ el, currentPriority, onSelect, onCancel }) {
      return PriorityPicker.show({ el, currentPriority, onSelect, onCancel });
    },
    /**
     * 弹窗让用户从候选分类中选一个作为目标回退目标
     * 返回选中的分类 id，未选择则返回 null
     */
    _promptCategoryMigration(fallbackCats, fromCategoryName) {
      return new Promise((resolve) => {
        const container = document.createElement("div");
        container.className = "catm-migrate-picker";
        container.innerHTML = `
                <div class="cmp-overlay"></div>
                <div class="cmp-container">
                    <div class="cmp-header">
                        <span class="cmp-title">\u5C06\u300C${HTMLUtils.escapeHtml(fromCategoryName)}\u300D\u7684\u76EE\u6807\u8FC1\u79FB\u5230</span>
                        <button class="cmp-close-btn" aria-label="\u5173\u95ED">${LucideUtils.createIcon("x", { size: 16 })}</button>
                    </div>
                    <div class="cmp-body">
                        ${fallbackCats.map((cat) => `
                            <div class="cmp-item" data-cat-id="${HTMLUtils.escapeHtmlAttr(cat.id)}">
                                <span class="cmp-item-name">${HTMLUtils.escapeHtml(cat.name)}</span>
                                ${LucideUtils.createIcon("chevronRight", { size: 14 })}
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        modalMount().appendChild(container);
        requestAnimationFrame(() => {
          const modal = container.querySelector(".cmp-container");
          modal.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;";
        });
        let escHandler = null;
        const close = (val) => {
          if (escHandler) {
            document.removeEventListener("keydown", escHandler);
            escHandler = null;
          }
          container.remove();
          resolve(val);
        };
        container.querySelector(".cmp-overlay").addEventListener("click", () => close(null));
        container.querySelector(".cmp-close-btn").addEventListener("click", () => close(null));
        container.querySelectorAll(".cmp-item").forEach((item) => {
          item.addEventListener("click", () => close(item.dataset.catId));
        });
        setTimeout(() => {
          escHandler = (e) => {
            if (e.key === "Escape" && container.isConnected) {
              close(null);
            }
          };
          document.addEventListener("keydown", escHandler);
        }, 0);
      });
    },
    /**
     * 显示分类管理面板
     */
    _showCategoryManager(onClose) {
      CategoryManager.show({
        initialCategories: this.getCategories(),
        onSaveCategories: (categories) => this.saveCategories(categories),
        onPromptMigration: (fallbackCats, catName) => this._promptCategoryMigration(fallbackCats, catName),
        onClose
      });
    },
    toggleCollapse(card) {
      const list = card.querySelector(".goal-item-list");
      const toggle = card.querySelector(".goal-row-toggle");
      if (!list) return;
      const isCollapsed = list.classList.contains("collapsed");
      const goalId = card.dataset.goalId;
      if (isCollapsed) {
        list.classList.remove("collapsed");
        if (toggle) toggle.innerHTML = LucideUtils.createIcon("chevronDown", { size: 14 });
        if (goalId) this._expandedGoals.add(goalId);
      } else {
        list.classList.add("collapsed");
        if (toggle) toggle.innerHTML = LucideUtils.createIcon("chevronRight", { size: 14 });
        if (goalId) this._expandedGoals.delete(goalId);
      }
    }
  };
  ActionDispatcher.registerMany({
    "goal-add-inline": () => GoalsEditor.startAddInline(),
    "goal-archive": (data) => GoalsRenderer2.archiveGoal(data.goalId),
    "goal-delete": (data) => GoalsEditor.deleteGoal(data.goalId),
    "goal-unarchive": (data) => GoalsRenderer2.unarchiveGoal(data.goalId),
    "goal-delete-archived": (data) => GoalsRenderer2.deleteArchivedGoal(data.goalId),
    "goal-remove-subitem": (data) => GoalsEditor.removeSubItem(data.goalId, parseInt(data.subIdx)),
    "goal-quick-add-subitem": (data) => GoalsEditor.quickAddSubItem(data.goalId),
    "goal-save-template": (data) => GoalsEditor.saveAsTemplate(data.goalId)
  });
  window.GoalsRenderer = GoalsRenderer2;
  if (typeof GoalsArchiver !== "undefined") {
    GoalsArchiver.init(GoalsRenderer2);
  }

  // assets/scripts/modules/goals/editor.js
  var editor_exports2 = {};
  __export(editor_exports2, {
    GOAL_TEMPLATES: () => GOAL_TEMPLATES,
    GoalsEditor: () => GoalsEditor2
  });
  var GOAL_TEMPLATES = [
    {
      id: "blank",
      name: "\u7A7A\u767D\u76EE\u6807",
      desc: "\u4ECE\u96F6\u5F00\u59CB\u521B\u5EFA",
      icon: LucideUtils.createIcon("plus", { size: 32, strokeWidth: 1.5 }),
      data: {
        icon: "",
        title: "",
        meta: "",
        category: "work",
        progress: 0,
        items: []
      }
    },
    {
      id: "reading",
      name: "\u9605\u8BFB\u8BA1\u5212",
      desc: "\u8BBE\u5B9A\u9605\u8BFB\u76EE\u6807\u4E0E\u8FDB\u5EA6\u8FFD\u8E2A",
      icon: LucideUtils.createIcon("bookClosed", { size: 32, strokeWidth: 1.5 }),
      data: {
        icon: "",
        title: "\u9605\u8BFB\u8BA1\u5212",
        meta: "",
        category: "study",
        progress: 0,
        items: [
          { name: "\u9605\u8BFB\u4E66\u7C4D", percent: 0, detail: "" },
          { name: "\u8BFB\u4E66\u7B14\u8BB0", percent: 0, detail: "" }
        ]
      }
    },
    {
      id: "fitness",
      name: "\u5065\u8EAB\u953B\u70BC",
      desc: "\u5236\u5B9A\u8FD0\u52A8\u8BA1\u5212\u4E0E\u8EAB\u4F53\u6307\u6807",
      icon: LucideUtils.createIcon("dumbbell", { size: 32, strokeWidth: 1.5 }),
      data: {
        icon: "",
        title: "\u5065\u8EAB\u8BA1\u5212",
        meta: "",
        category: "health",
        progress: 0,
        items: [
          { name: "\u6709\u6C27\u8FD0\u52A8", percent: 0, detail: "" },
          { name: "\u529B\u91CF\u8BAD\u7EC3", percent: 0, detail: "" },
          { name: "\u62C9\u4F38\u653E\u677E", percent: 0, detail: "" }
        ]
      }
    },
    {
      id: "project",
      name: "\u9879\u76EE\u5F00\u53D1",
      desc: "\u8F6F\u4EF6\u9879\u76EE\u91CC\u7A0B\u7891\u4E0E\u4EFB\u52A1\u5206\u89E3",
      icon: LucideUtils.createIcon("code", { size: 32, strokeWidth: 1.5 }),
      data: {
        icon: "",
        title: "\u9879\u76EE\u5F00\u53D1",
        meta: "",
        category: "work",
        progress: 0,
        items: [
          { name: "\u9700\u6C42\u5206\u6790", percent: 0, detail: "" },
          { name: "\u539F\u578B\u8BBE\u8BA1", percent: 0, detail: "" },
          { name: "\u5F00\u53D1\u5B9E\u73B0", percent: 0, detail: "" },
          { name: "\u6D4B\u8BD5\u9A8C\u6536", percent: 0, detail: "" }
        ]
      }
    },
    {
      id: "writing",
      name: "\u5199\u4F5C\u521B\u4F5C",
      desc: "\u6587\u7AE0\u6216\u5185\u5BB9\u521B\u4F5C\u7684\u9636\u6BB5\u89C4\u5212",
      icon: LucideUtils.createIcon("edit", { size: 32, strokeWidth: 1.5 }),
      data: {
        icon: "",
        title: "\u5199\u4F5C\u8BA1\u5212",
        meta: "",
        category: "personal",
        progress: 0,
        items: [
          { name: "\u9009\u9898\u6784\u601D", percent: 0, detail: "" },
          { name: "\u5927\u7EB2\u64B0\u5199", percent: 0, detail: "" },
          { name: "\u5185\u5BB9\u5199\u4F5C", percent: 0, detail: "" },
          { name: "\u4FEE\u6539\u6DA6\u8272", percent: 0, detail: "" }
        ]
      }
    },
    {
      id: "saving",
      name: "\u50A8\u84C4\u7406\u8D22",
      desc: "\u8D22\u52A1\u76EE\u6807\u4E0E\u50A8\u84C4\u8FDB\u5EA6\u8FFD\u8E2A",
      icon: LucideUtils.createIcon("dollarSign", { size: 32, strokeWidth: 1.5 }),
      data: {
        icon: "",
        title: "\u50A8\u84C4\u76EE\u6807",
        meta: "",
        category: "finance",
        progress: 0,
        items: [
          { name: "\u6BCF\u6708\u50A8\u84C4", percent: 0, detail: "", startValue: "0", targetValue: "5000" },
          { name: "\u6295\u8D44\u5B66\u4E60", percent: 0, detail: "" }
        ]
      }
    },
    {
      id: "language",
      name: "\u8BED\u8A00\u5B66\u4E60",
      desc: "\u8BCD\u6C47\u3001\u542C\u529B\u3001\u53E3\u8BED\u7B49\u5206\u9879\u8BAD\u7EC3",
      icon: LucideUtils.createIcon("messageCircle", { size: 32, strokeWidth: 1.5 }),
      data: {
        icon: "",
        title: "\u8BED\u8A00\u5B66\u4E60",
        meta: "",
        category: "study",
        progress: 0,
        items: [
          { name: "\u8BCD\u6C47\u79EF\u7D2F", percent: 0, detail: "" },
          { name: "\u542C\u529B\u8BAD\u7EC3", percent: 0, detail: "" },
          { name: "\u53E3\u8BED\u7EC3\u4E60", percent: 0, detail: "" },
          { name: "\u9605\u8BFB\u7406\u89E3", percent: 0, detail: "" }
        ]
      }
    }
  ];
  var GoalsEditor2 = {
    open() {
      GoalsRenderer.render(null);
    },
    _ensureGoalDefaults(goal) {
      if (!goal.category) goal.category = "work";
      if (goal.progress === void 0) goal.progress = 0;
      if (!goal.items) goal.items = [];
      const today = /* @__PURE__ */ new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const defaultStart = fmt(today);
      const defaultEnd = fmt(oneMonthLater);
      if (!goal.startDate) goal.startDate = defaultStart;
      if (!goal.endDate) goal.endDate = defaultEnd;
      goal.items.forEach((item) => {
        if (!item.startDate) item.startDate = defaultStart;
        if (!item.endDate) item.endDate = defaultEnd;
        if (item.startValue === void 0 || item.startValue === "") item.startValue = "0";
        if (item.targetValue === void 0 || item.targetValue === "") item.targetValue = "100";
        if (item.currentValue === void 0 || item.currentValue === "") item.currentValue = "0";
        if (!item.dailyMin) delete item.dailyMin;
        if (!item.taskDayType) item.taskDayType = "daily";
        if (!item.taskDayConfig) item.taskDayConfig = "";
      });
      return goal;
    },
    async startAddInline() {
      if (GoalsRenderer._pendingEditPromise) {
        await GoalsRenderer._pendingEditPromise;
      }
      this._showTemplatePicker(async (template) => {
        const baseData = template ? JSON.parse(JSON.stringify(template.data)) : {
          icon: "",
          title: "",
          meta: "",
          progress: 0,
          items: [],
          category: "work",
          startDate: "",
          endDate: ""
        };
        const goal = this._ensureGoalDefaults(baseData);
        if (!goal.title) goal.title = "\u65B0\u76EE\u6807";
        try {
          GoalsRenderer.autoCalcGoalDateRange(goal);
          const newGoal = await store.addGlobalGoal(goal);
          GoalsRenderer._expandedGoals.add(newGoal.id);
          if (typeof renderAll === "function") renderAll();
          else if (typeof window.renderAll === "function") window.renderAll();
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const titleEl = $(`[data-inline-edit="title"][data-goal-id="${CSS.escape(newGoal.id)}"]`);
            if (titleEl) {
              GoalsRenderer._startInlineEdit(titleEl);
              titleEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }));
        } catch (e) {
          console.error("Failed to create goal:", e);
          Toast.showToast("\u521B\u5EFA\u76EE\u6807\u5931\u8D25", "error");
        }
      });
    },
    async quickAddSubItem(goalId) {
      if (GoalsRenderer._pendingEditPromise) {
        await GoalsRenderer._pendingEditPromise;
      }
      const goals = store.getGlobalGoals();
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      if (!goal.items) goal.items = [];
      const newIdx = goal.items.length;
      const today = /* @__PURE__ */ new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      goal.items.push({
        name: "\u65B0\u5B50\u9879\u76EE",
        detail: "",
        percent: 0,
        startDate: fmt(today),
        endDate: fmt(oneMonthLater),
        startValue: "0",
        targetValue: "100",
        currentValue: "0",
        dailyMin: "",
        taskDayType: "daily",
        taskDayConfig: ""
      });
      try {
        GoalsRenderer.autoCalcGoalDateRange(goal);
        goal.progress = GoalsRenderer.calcProgress(goal);
        await store.updateGlobalGoal(goalId, goal);
        GoalsRenderer._expandedGoals.add(goalId);
        if (typeof renderAll === "function") renderAll();
        else if (typeof window.renderAll === "function") window.renderAll();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const nameEl = $(`[data-inline-edit="name"][data-goal-id="${CSS.escape(goalId)}"][data-sub-idx="${newIdx}"]`);
          if (nameEl) {
            GoalsRenderer._startInlineEdit(nameEl);
            nameEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }));
      } catch (e) {
        console.error("Failed to add sub-item:", e);
        Toast.showToast("\u6DFB\u52A0\u5B50\u9879\u76EE\u5931\u8D25", "error");
      }
    },
    async removeSubItem(goalId, subIdx) {
      if (GoalsRenderer._pendingEditPromise) {
        await GoalsRenderer._pendingEditPromise;
      }
      const goals = store.getGlobalGoals();
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || !goal.items || !goal.items[subIdx]) return;
      const itemName = goal.items[subIdx].name || "\u8BE5\u5B50\u9879\u76EE";
      const confirmed = await ConfirmDialog.confirmDelete(`\u786E\u5B9A\u5220\u9664\u300C${itemName}\u300D\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002`);
      if (!confirmed) return;
      goal.items.splice(subIdx, 1);
      try {
        GoalsRenderer.autoCalcGoalDateRange(goal);
        goal.progress = GoalsRenderer.calcProgress(goal);
        await store.updateGlobalGoal(goalId, goal);
        if (typeof renderAll === "function") renderAll();
        else if (typeof window.renderAll === "function") window.renderAll();
      } catch (e) {
        console.error("Failed to remove sub-item:", e);
        Toast.showToast("\u5220\u9664\u5B50\u9879\u76EE\u5931\u8D25", "error");
      }
    },
    _showTemplatePicker(onSelect) {
      const builtinTemplates = GOAL_TEMPLATES;
      const customTemplates = window.CustomTemplateManager ? CustomTemplateManager.getAllAsTemplates() : [];
      const allTemplates = [...builtinTemplates, ...customTemplates];
      const container = document.createElement("div");
      container.className = "template-picker";
      container.innerHTML = `
            <div class="tmpl-overlay"></div>
            <div class="tmpl-container">
                <div class="tmpl-header">
                    <span class="tmpl-title">\u9009\u62E9\u76EE\u6807\u6A21\u677F</span>
                    <button class="tmpl-close-btn" aria-label="\u5173\u95ED">${LucideUtils.createIcon("x", { size: 16 })}</button>
                </div>
                <div class="tmpl-tabs">
                    <button class="tmpl-tab active" data-tab="builtin">\u5185\u7F6E\u6A21\u677F</button>
                    <button class="tmpl-tab" data-tab="custom">\u6211\u7684\u6A21\u677F${customTemplates.length > 0 ? ` (${customTemplates.length})` : ""}</button>
                </div>
                <div class="tmpl-body">
                    <div class="tmpl-list" data-pane="builtin">
                        ${builtinTemplates.map((t) => `
                            <div class="tmpl-card" data-tmpl-id="${t.id}">
                                <div class="tmpl-card-icon">${t.icon}</div>
                                <div class="tmpl-card-info">
                                    <span class="tmpl-card-name">${HTMLUtils.escapeHtml(t.name)}</span>
                                    <span class="tmpl-card-desc">${HTMLUtils.escapeHtml(t.desc)}</span>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <div class="tmpl-list tmpl-list-hidden" data-pane="custom">
                        ${customTemplates.length > 0 ? customTemplates.map((t) => `
                            <div class="tmpl-card tmpl-card-custom" data-tmpl-id="${t.id}">
                                <div class="tmpl-card-icon">${t.icon}</div>
                                <div class="tmpl-card-info">
                                    <span class="tmpl-card-name">${HTMLUtils.escapeHtml(t.name)}</span>
                                    <span class="tmpl-card-desc">${HTMLUtils.escapeHtml(t.desc)}</span>
                                </div>
                                <button class="tmpl-card-delete" data-tmpl-del="${t.id}" title="\u5220\u9664\u6A21\u677F">${LucideUtils.createIcon("trash", { size: 14 })}</button>
                            </div>
                        `).join("") : `
                            <div class="tmpl-empty">
                                ${LucideUtils.createIcon("filePlus", { size: 32, strokeWidth: 1.5 })}
                                <p>\u8FD8\u6CA1\u6709\u81EA\u5B9A\u4E49\u6A21\u677F</p>
                                <p class="tmpl-empty-hint">\u521B\u5EFA\u76EE\u6807\u540E\uFF0C\u5728\u76EE\u6807\u64CD\u4F5C\u83DC\u5355\u4E2D\u9009\u62E9"\u4FDD\u5B58\u4E3A\u6A21\u677F"</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
      modalMount().appendChild(container);
      requestAnimationFrame(() => {
        const modal = container.querySelector(".tmpl-container");
        modal.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;";
      });
      const closePicker = () => container.remove();
      container.querySelector(".tmpl-overlay").addEventListener("click", closePicker);
      container.querySelector(".tmpl-close-btn").addEventListener("click", closePicker);
      container.querySelectorAll(".tmpl-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          container.querySelectorAll(".tmpl-tab").forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          const target = tab.dataset.tab;
          container.querySelectorAll("[data-pane]").forEach((pane) => {
            pane.classList.toggle("tmpl-list-hidden", pane.dataset.pane !== target);
          });
        });
      });
      container.querySelectorAll(".tmpl-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest(".tmpl-card-delete")) return;
          const tmplId = card.dataset.tmplId;
          const template = allTemplates.find((t) => t.id === tmplId);
          if (!template) return;
          container.remove();
          onSelect(template);
        });
      });
      container.querySelectorAll(".tmpl-card-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const tmplId = btn.dataset.tmplDel;
          const template = customTemplates.find((t) => t.id === tmplId);
          if (!template) return;
          const ok = await ConfirmDialog.confirmDelete(`\u786E\u5B9A\u5220\u9664\u81EA\u5B9A\u4E49\u6A21\u677F\u300C${template.name}\u300D\u5417\uFF1F`);
          if (!ok) return;
          CustomTemplateManager.remove(tmplId);
          Toast.showToast("\u6A21\u677F\u5DF2\u5220\u9664", "success");
          container.remove();
          this._showTemplatePicker(onSelect);
        });
      });
    },
    async saveAsTemplate(goalId) {
      const goals = store.getGlobalGoals();
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      const result = await this._showSaveTemplateDialog(goal);
      if (!result) return;
      try {
        CustomTemplateManager.add({
          name: result.name,
          desc: result.desc,
          iconName: result.iconName,
          data: {
            icon: goal.icon || "",
            title: goal.title,
            meta: goal.meta || "",
            category: goal.category,
            items: (goal.items || []).map((it) => ({
              name: it.name,
              detail: it.detail || "",
              startValue: it.startValue,
              targetValue: it.targetValue,
              currentValue: it.currentValue,
              startDate: it.startDate || "",
              endDate: it.endDate || "",
              dailyMin: it.dailyMin,
              taskDayType: it.taskDayType,
              taskDayConfig: it.taskDayConfig
            }))
          }
        });
        Toast.showToast(`\u5DF2\u4FDD\u5B58\u4E3A\u6A21\u677F\u300C${result.name}\u300D`, "success");
      } catch (e) {
        Toast.showToast(e.message || "\u4FDD\u5B58\u6A21\u677F\u5931\u8D25", "error");
      }
    },
    _showSaveTemplateDialog(goal) {
      return new Promise((resolve) => {
        const iconOptions = [
          "star",
          "heart",
          "flag",
          "target",
          "bookClosed",
          "dumbbell",
          "code",
          "edit",
          "dollarSign",
          "messageCircle",
          "sparkles",
          "briefcase",
          "palette",
          "leaf",
          "mountain",
          "music"
        ];
        let selectedIcon = iconOptions[0];
        const container = document.createElement("div");
        container.className = "tstd-save-template";
        container.innerHTML = `
                <div class="tstd-overlay"></div>
                <div class="tstd-container">
                    <div class="tstd-header">
                        <span class="tstd-title">\u4FDD\u5B58\u4E3A\u81EA\u5B9A\u4E49\u6A21\u677F</span>
                        <button class="tstd-close-btn" aria-label="\u5173\u95ED">${LucideUtils.createIcon("x", { size: 16 })}</button>
                    </div>
                    <div class="tstd-body">
                        <div class="tstd-field">
                            <label class="tstd-label">\u6A21\u677F\u540D\u79F0</label>
                            <input type="text" class="tstd-input" maxlength="30" value="${HTMLUtils.escapeHtmlAttr(goal.title || "")}" placeholder="\u5982\uFF1A\u6668\u95F4\u8BA1\u5212">
                        </div>
                        <div class="tstd-field">
                            <label class="tstd-label">\u6A21\u677F\u8BF4\u660E</label>
                            <input type="text" class="tstd-input tstd-desc" maxlength="60" placeholder="\u4E00\u53E5\u8BDD\u63CF\u8FF0\u8FD9\u4E2A\u6A21\u677F\u7684\u7528\u9014">
                        </div>
                        <div class="tstd-field">
                            <label class="tstd-label">\u9009\u62E9\u56FE\u6807</label>
                            <div class="tstd-icons">
                                ${iconOptions.map((name, i) => `
                                    <button class="tstd-icon-btn ${i === 0 ? "active" : ""}" data-icon="${name}" title="${name}">
                                        ${LucideUtils.createIcon(name, { size: 18, strokeWidth: 1.5 })}
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                        <div class="tstd-preview">
                            <span class="tstd-preview-label">\u5C06\u4FDD\u5B58 ${(goal.items || []).length} \u4E2A\u5B50\u9879\u76EE</span>
                        </div>
                    </div>
                    <div class="tstd-footer">
                        <button class="tstd-cancel">\u53D6\u6D88</button>
                        <button class="tstd-save">\u4FDD\u5B58\u6A21\u677F</button>
                    </div>
                </div>
            `;
        modalMount().appendChild(container);
        requestAnimationFrame(() => {
          const modal = container.querySelector(".tstd-container");
          modal.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;";
        });
        const close = (val) => {
          document.removeEventListener("keydown", handler);
          container.remove();
          resolve(val);
        };
        container.querySelector(".tstd-overlay").addEventListener("click", () => close(null));
        container.querySelector(".tstd-close-btn").addEventListener("click", () => close(null));
        container.querySelector(".tstd-cancel").addEventListener("click", () => close(null));
        container.querySelectorAll(".tstd-icon-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            container.querySelectorAll(".tstd-icon-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            selectedIcon = btn.dataset.icon;
          });
        });
        container.querySelector(".tstd-save").addEventListener("click", () => {
          const name = container.querySelector(".tstd-input").value.trim();
          if (!name) {
            Toast.showToast("\u8BF7\u8F93\u5165\u6A21\u677F\u540D\u79F0", "warning");
            return;
          }
          const desc = container.querySelector(".tstd-desc").value.trim();
          close({ name, desc, iconName: selectedIcon });
        });
        const handler = (e) => {
          if (e.key === "Escape" && container.isConnected) {
            close(null);
          }
        };
        document.addEventListener("keydown", handler);
      });
    },
    async deleteGoal(goalId) {
      try {
        const confirmed = await ConfirmDialog.confirmDelete("\u786E\u5B9A\u5220\u9664\u8FD9\u4E2A\u76EE\u6807\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002");
        if (!confirmed) return;
        await store.deleteGlobalGoal(goalId);
        if (typeof renderAll === "function") renderAll();
        else if (typeof window.renderAll === "function") window.renderAll();
        Toast.showToast("\u76EE\u6807\u5DF2\u5220\u9664", "info");
      } catch (e) {
        console.error("Failed to delete goal:", e);
        Toast.showToast("\u5220\u9664\u5931\u8D25", "error");
      }
    }
  };
  ActionDispatcher.registerMany({
    "goal-remove-subitem": (ds) => GoalsEditor2.removeSubItem(ds.goalId, parseInt(ds.subIdx, 10))
  });
  window.GoalsEditor = GoalsEditor2;

  // assets/scripts/modules/goals/index.js
  var goals_exports = {};
  __export(goals_exports, {
    Goals: () => Goals
  });
  Object.defineProperty(window, "GOAL_CATEGORIES", {
    get() {
      return GoalsRenderer.getCategories();
    },
    set(v) {
      Object.defineProperty(window, "GOAL_CATEGORIES", { value: v, writable: true, configurable: true });
    },
    configurable: true
  });
  var Goals = {
    Renderer: GoalsRenderer,
    Editor: GoalsEditor,
    render(data, container) {
      GoalsRenderer.render(data, container);
    },
    openEditor() {
      GoalsEditor.startAddInline();
    }
  };
  window.Goals = Goals;

  // assets/scripts/modules/todo/renderer.js
  var renderer_exports3 = {};
  __export(renderer_exports3, {
    TodoRenderer: () => TodoRenderer2
  });
  var TodoRenderer2 = {
    _lastSnapshot: null,
    _snapshot(data) {
      let goalTasks = [];
      if (typeof GoalsRenderer !== "undefined") {
        goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
      }
      return JSON.stringify({
        g: goalTasks.map((g) => ({ i: g.id, ti: g.title, de: g.description, c: g.completed, dm: g.dailyMin, inc: g.incrementValue, cv: g.currentValue, tv: g.targetValue, hv: g.hasValues, ar: g.isArchived }))
      });
    },
    _shouldSkipRender(data) {
      const snap = this._snapshot(data);
      if (snap === this._lastSnapshot) return true;
      this._lastSnapshot = snap;
      return false;
    },
    _invalidateCache() {
      this._lastSnapshot = null;
    },
    render(data) {
      const container = byId("todoContent");
      if (!container) return;
      if (this._shouldSkipRender(data)) return;
      let goalTasks = [];
      if (typeof GoalsRenderer !== "undefined") {
        goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
      }
      const completedCount = goalTasks.filter((t) => t.completed).length;
      const totalCount = goalTasks.length;
      const countEl = byId("todoCount");
      if (countEl) countEl.textContent = `${completedCount}/${totalCount}`;
      if (goalTasks.length === 0) {
        container.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-icon">
                        ${LucideUtils.createIcon("target", { size: 48, strokeWidth: 1.5 })}
                    </div>
                    <div class="empty-state-title">\u4ECA\u65E5\u76EE\u6807\u4EFB\u52A1</div>
                    <div class="empty-state-desc">\u5728\u76EE\u6807\u7BA1\u7406\u4E2D\u8BBE\u7F6E\u6BCF\u65E5\u4EFB\u52A1</div>
                    <div class="empty-state-hint">\u524D\u5F80\u76EE\u6807\u9875\u9762\u6DFB\u52A0\u4EFB\u52A1</div>
                </div>
            `;
        return;
      }
      const pending = goalTasks.filter((t) => !t.completed);
      const completed = goalTasks.filter((t) => t.completed);
      container.innerHTML = `
            <div class="todo-stats">
                <div class="todo-stat-item">
                    <span class="todo-stat-num">${pending.length}</span>
                    <span class="todo-stat-label">\u5F85\u5B8C\u6210</span>
                </div>
                <div class="todo-stat-item">
                    <span class="todo-stat-num">${completed.length}</span>
                    <span class="todo-stat-label">\u5DF2\u5B8C\u6210</span>
                </div>
                <div class="todo-stat-item">
                    <span class="todo-stat-num">${totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0}%</span>
                    <span class="todo-stat-label">\u5B8C\u6210\u7387</span>
                </div>
            </div>
            <div class="todo-progress-bar">
                <div class="todo-progress-fill" style="width: ${totalCount > 0 ? completedCount / totalCount * 100 : 0}%"></div>
            </div>
            ${pending.length > 0 ? `
                <div class="todo-group todo-group-goal">
                    <div class="todo-group-header">
                        <div class="todo-group-label">
                            ${LucideUtils.createIcon("target", { size: 16 })}
                            <span>\u76EE\u6807\u4EFB\u52A1</span>
                            <span class="todo-group-badge">${pending.length}</span>
                        </div>
                    </div>
                    <div class="todo-group-items">
                        ${pending.map((todo, idx) => this.renderTodoItem(todo, idx, false)).join("")}
                    </div>
                </div>
            ` : ""}
            ${completed.length > 0 ? `
                <div class="todo-group todo-group-completed collapsed" id="todoCompletedGroup">
                    <div class="todo-group-header">
                        <div class="todo-group-label" data-action="todo-toggle-completed-group">
                            <span class="todo-group-chevron">${LucideUtils.createIcon("chevronDown", { size: 14 })}</span>
                            <span class="completed-label">${LucideUtils.createIcon("checkCircle", { size: 14 })}</span>
                            \u5DF2\u5B8C\u6210 (${completed.length})
                        </div>
                    </div>
                    <div class="todo-group-items">
                        ${completed.map((todo, idx) => this.renderTodoItem(todo, idx, true)).join("")}
                    </div>
                </div>
            ` : ""}
        `;
    },
    renderTodoItem(todo, index, isCompleted) {
      const completedClass = isCompleted ? "todo-item-completed" : "";
      const goalTaskClass = "todo-item-goal";
      const archivedClass = todo.isArchived ? "todo-item-archived" : "";
      let goalMetaLabel = "";
      if (todo.isArchived) {
        goalMetaLabel = `<span class="todo-goal-archived">\u5DF2\u5F52\u6863</span>`;
      }
      if (todo.dailyMin > 0) {
        goalMetaLabel += `<span class="todo-goal-daily">\u6BCF\u65E5${todo.dailyMin}</span>`;
      } else if (todo.hasValues && todo.incrementValue > 0) {
        goalMetaLabel += `<span class="todo-goal-daily">+${todo.incrementValue}</span>`;
      }
      if (todo.hasValues) {
        goalMetaLabel += `<span class="todo-goal-progress">${todo.currentValue}/${todo.targetValue}</span>`;
      }
      if (todo.description) {
        goalMetaLabel += `<span class="todo-goal-source" title="${escapeHtml(todo.description)}">${escapeHtml(todo.description.length > 10 ? todo.description.slice(0, 10) + "\u2026" : todo.description)}</span>`;
      }
      return `
            <div class="todo-item ${completedClass} ${goalTaskClass} ${archivedClass}" data-todo-index="${index}" data-todo-id="${escapeHtml(todo.id)}" data-todo-type="goal_task">
                <button class="todo-checkbox ${isCompleted ? "checked" : ""}" 
                        data-action="todo-toggle" data-todo-id="${todo.id}" data-type="goal_task" data-goal-id="${todo.goalId || ""}" data-item-idx="${todo.itemIdx || ""}" data-is-completed="${isCompleted}"
                        aria-label="${isCompleted ? "\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210" : "\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210"}">
                    ${isCompleted ? LucideUtils.createIcon("check", { size: 9 }) : ""}
                </button>
                <div class="todo-content">
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ""}
                </div>
                <div class="todo-meta">
                    ${goalMetaLabel}
                </div>
            </div>
        `;
    }
  };
  ActionDispatcher.registerMany({
    "todo-toggle": (data) => Todo.toggle(data.todoId, data.type, data.goalId, data.itemIdx, data.isCompleted === "true"),
    "todo-toggle-completed-group": () => Todo.toggleCompletedGroup()
  });
  window.TodoRenderer = TodoRenderer2;

  // assets/scripts/modules/todo/index.js
  var todo_exports = {};
  __export(todo_exports, {
    Todo: () => Todo2
  });
  var Todo2 = {
    Renderer: TodoRenderer,
    _completedCollapsed: true,
    _keydownBound: false,
    init() {
    },
    render(data) {
      TodoRenderer.render(data);
      this._syncCollapsedState();
    },
    _syncCollapsedState() {
      const group = byId("todoCompletedGroup");
      if (group) {
        group.classList.toggle("collapsed", this._completedCollapsed);
      }
    },
    toggle(todoId, type, goalId, itemIdx, isCompleted) {
      TodoService.toggle(todoId, type, goalId, itemIdx, isCompleted);
    },
    toggleCompletedGroup() {
      this._completedCollapsed = !this._completedCollapsed;
      const group = byId("todoCompletedGroup");
      if (group) {
        group.classList.toggle("collapsed", this._completedCollapsed);
      }
    }
  };
  window.Todo = Todo2;

  // assets/scripts/modules/bamboo-garden.js
  var bamboo_garden_exports = {};
  __export(bamboo_garden_exports, {
    BambooGarden: () => BambooGarden2
  });
  var BambooGarden2 = {
    container: null,
    _leafIntervalId: null,
    _leafCount: 0,
    _MAX_LEAVES: 15,
    _isPageVisible: true,
    _observer: null,
    _visibilityHandler: null,
    render() {
      return `
            <section class="bamboo-garden-section" id="bambooGardenSection" role="region">
                <div class="bamboo-garden-container" id="bambooGardenContainer">
                    <div class="moon"></div>
                    <div class="mist-layer-1"></div>
                    <div class="mist-layer-2"></div>
                    <div class="mist-layer-3"></div>
                    <div class="distant-mountains" id="distantMountains">
                        <div class="mountain-layer mountain-3"></div>
                        <div class="mountain-layer mountain-2"></div>
                        <div class="mountain-layer mountain-1"></div>
                        <div class="mountain-mist"></div>
                    </div>
                    <div class="river-surface"></div>
                    <div class="boat-container">
                        <div class="boat"></div>
                    </div>
                    <div class="bamboo-forest" id="bambooForest">
                        <div class="bamboo-layer bamboo-far" id="farBamboo"></div>
                        <div class="bamboo-layer bamboo-mid" id="midBamboo"></div>
                        <div class="bamboo-layer bamboo-near" id="nearBamboo"></div>
                    </div>
                    <div class="forest-floor"></div>
                    <div class="foreground-haze"></div>
                    <div id="leafContainer"></div>
                </div>
            </section>
        `;
    },
    init() {
      if (this._observer) this.destroy();
      this.createBambooForest();
      this.startLeafAnimation();
      this._setupVisibilityGuard();
      this.updateTheme();
      this._observer = new MutationObserver(() => {
        this.updateTheme();
      });
      this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    },
    _setupVisibilityGuard() {
      if (this._visibilityHandler) {
        document.removeEventListener("visibilitychange", this._visibilityHandler);
      }
      this._visibilityHandler = () => {
        this._isPageVisible = !document.hidden;
        if (this._isPageVisible) {
          this.startLeafAnimation();
        } else {
          this.stopLeafAnimation();
        }
      };
      document.addEventListener("visibilitychange", this._visibilityHandler);
    },
    stopLeafAnimation() {
      if (this._leafIntervalId) {
        clearInterval(this._leafIntervalId);
        this._leafIntervalId = null;
      }
    },
    destroy() {
      this.stopLeafAnimation();
      const container = byId("leafContainer");
      if (container) container.innerHTML = "";
      this._leafCount = 0;
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      if (this._visibilityHandler) {
        document.removeEventListener("visibilitychange", this._visibilityHandler);
        this._visibilityHandler = null;
      }
      ["bambooSwayStyles", "windLeafStyles"].forEach((id) => {
        const el = byId(id);
        if (el) el.remove();
      });
    },
    createBambooForest() {
      const farLayer = byId("farBamboo");
      const midLayer = byId("midBamboo");
      const nearLayer = byId("nearBamboo");
      if (!farLayer || !midLayer || !nearLayer) return;
      farLayer.innerHTML = this.createBambooStalks(30, 280, 380, 2, 0.28, true);
      midLayer.innerHTML = this.createBambooStalks(22, 320, 420, 4, 0.5, true);
      nearLayer.innerHTML = this.createBambooStalks(14, 380, 480, 6, 0.72, false);
    },
    createBambooStalks(count, minH, maxH, width, opacity, leftFade) {
      let html = "";
      for (let i = 0; i < count; i++) {
        let left;
        if (i < count * 0.7) {
          left = 35 + i / (count * 0.7) * 60 + Math.random() * (30 / count);
        } else {
          left = (i - count * 0.7) / (count * 0.3) * 35 + Math.random() * (20 / count);
        }
        const height = minH + Math.random() * (maxH - minH);
        let stalkOpacity = opacity;
        if (leftFade) {
          if (left < 25) {
            stalkOpacity = opacity * (0.25 + left / 25 * 0.4);
          } else if (left < 45) {
            stalkOpacity = opacity * (0.65 + (left - 25) / 20 * 0.25);
          } else {
            stalkOpacity = opacity * (0.9 + (left - 45) / 55 * 0.15);
          }
        } else {
          if (left < 35) {
            stalkOpacity = opacity * (0.4 + left / 35 * 0.45);
          } else if (left < 55) {
            stalkOpacity = opacity * (0.85 + (left - 35) / 20 * 0.15);
          } else {
            stalkOpacity = opacity * 1;
          }
        }
        const lean = (Math.random() - 0.5) * 2;
        const nodeCount = Math.floor(height / 50);
        const layerMultiplier = width <= 2 ? 1.3 : width <= 4 ? 1 : 0.8;
        const swaySpeed = (6 + Math.random() * 4) * layerMultiplier;
        html += `
                <div class="bamboo-stalk" style="left: ${left}%; height: ${height}px; width: ${width}px; opacity: ${stalkOpacity}; transform: rotate(${lean}deg);">
                    <div class="bamboo-inner" style="animation-name: bambooSway${i % 6}; animation-duration: ${swaySpeed}s;">
                        ${this.createBambooNodes(nodeCount, height)}
                        ${this.createLeafCluster(height)}
                    </div>
                </div>
            `;
      }
      if (!byId("bambooSwayStyles")) {
        const s = document.createElement("style");
        s.id = "bambooSwayStyles";
        let swayStyles = "";
        for (let i = 0; i < 6; i++) {
          const amp1 = 0.2 + Math.random() * 0.3;
          const amp2 = 0.3 + Math.random() * 0.35;
          const amp3 = 0.15 + Math.random() * 0.2;
          const amp4 = 0.25 + Math.random() * 0.25;
          swayStyles += `
                    @keyframes bambooSway${i} {
                        0% { transform: rotate(0deg); }
                        18% { transform: rotate(${-amp1}deg); }
                        38% { transform: rotate(${amp2}deg); }
                        58% { transform: rotate(${-amp3}deg); }
                        78% { transform: rotate(${amp4}deg); }
                        100% { transform: rotate(0deg); }
                    }
                `;
        }
        s.textContent = swayStyles;
        getStyleMount().appendChild(s);
      }
      return html;
    },
    createBambooNodes(count, height) {
      let html = "";
      const spacing = height / (count + 1);
      for (let i = 1; i <= count; i++) {
        html += `<div style="position: absolute; left: -1px; right: -1px; top: ${i * spacing}px; height: 3px; background: hsla(calc(var(--accent-hue) + -9), 26%, 26%, 0.2); border-radius: 2px;"></div>`;
      }
      return html;
    },
    createLeafCluster(height) {
      const count = 6 + Math.floor(Math.random() * 7);
      let html = "";
      for (let i = 0; i < count; i++) {
        const h = 11 + Math.random() * 13;
        const angle = -75 + i * 26 + (Math.random() - 0.5) * 28;
        const t = -48 - Math.random() * 22;
        const l = -12 + i * 3.5 + (Math.random() - 0.5) * 11;
        const delay = Math.random() * 1.2;
        const dur = 1.6 + Math.random() * 1.2;
        html += `
                <div class="bamboo-leaf-tip" style="
                    top: ${t}px;
                    left: ${l}px;
                    height: ${h}px;
                    --r: ${angle}deg;
                    opacity: ${0.38 + Math.random() * 0.32};
                    animation: leafTremble ${dur}s ease-in-out infinite ${delay}s;
                "></div>
            `;
      }
      return html;
    },
    startLeafAnimation() {
      if (this._leafIntervalId) return;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => this.createLeaf(), i * 300);
      }
      this._leafIntervalId = setInterval(() => {
        if (!this._isPageVisible) return;
        this.createLeaf();
        if (Math.random() > 0.6) {
          setTimeout(() => this.createLeaf(), 200);
        }
      }, 750);
    },
    createLeaf() {
      const container = byId("leafContainer");
      if (!container) return;
      if (this._leafCount >= this._MAX_LEAVES) return;
      const leaf = document.createElement("div");
      leaf.className = "drifting-leaf";
      const startX = -5 + Math.random() * 40;
      const duration = 4.5 + Math.random() * 3.5;
      const delay = Math.random() * 1;
      leaf.style.left = startX + "%";
      leaf.style.animationDuration = duration + "s";
      leaf.style.animationDelay = delay + "s";
      const scale = 0.55 + Math.random() * 0.65;
      leaf.style.transform = `scale(${scale})`;
      const animationIndex = Math.floor(Math.random() * 4);
      leaf.style.animationName = `leafDrift${animationIndex}`;
      if (!byId("windLeafStyles")) {
        const s = document.createElement("style");
        s.id = "windLeafStyles";
        s.textContent = `
                @keyframes leafDrift0 {
                    0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                    12% { opacity: 0.45; }
                    40% { transform: translate(45px, 90px) rotate(150deg); }
                    70% { transform: translate(90px, 210px) rotate(300deg); }
                    88% { opacity: 0.3; }
                    100% { transform: translate(135px, 360px) rotate(480deg); opacity: 0; }
                }
                @keyframes leafDrift1 {
                    0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                    15% { opacity: 0.45; }
                    35% { transform: translate(30px, 70px) rotate(100deg); }
                    55% { transform: translate(75px, 150px) rotate(220deg); }
                    80% { transform: translate(110px, 270px) rotate(360deg); }
                    85% { opacity: 0.3; }
                    100% { transform: translate(140px, 360px) rotate(500deg); opacity: 0; }
                }
                @keyframes leafDrift2 {
                    0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.45; }
                    25% { transform: translate(55px, 50px) rotate(180deg); }
                    45% { transform: translate(95px, 130px) rotate(320deg); }
                    65% { transform: translate(125px, 230px) rotate(460deg); }
                    85% { opacity: 0.28; }
                    100% { transform: translate(150px, 360px) rotate(600deg); opacity: 0; }
                }
                @keyframes leafDrift3 {
                    0% { transform: translate(0, -70px) rotate(0deg); opacity: 0; }
                    15% { opacity: 0.45; }
                    30% { transform: translate(20px, 60px) rotate(80deg); }
                    50% { transform: translate(60px, 150px) rotate(180deg); }
                    70% { transform: translate(100px, 240px) rotate(290deg); }
                    85% { opacity: 0.28; }
                    100% { transform: translate(130px, 360px) rotate(400deg); opacity: 0; }
                }
            `;
        getStyleMount().appendChild(s);
      }
      this._leafCount++;
      container.appendChild(leaf);
      setTimeout(() => {
        if (leaf.parentNode === container) {
          container.removeChild(leaf);
        }
        this._leafCount = Math.max(0, this._leafCount - 1);
      }, (duration + delay) * 1e3 + 700);
    },
    updateTheme() {
      const container = byId("bambooGardenContainer");
      if (!container) return;
      const isDark = document.documentElement.classList.contains("dark");
      const bg = isDark ? "linear-gradient(180deg, hsl(var(--accent-hue), 47%, calc(7% + var(--accent-lightness-offset))) 0%, hsl(var(--accent-hue), 21%, calc(6% + var(--accent-lightness-offset))) 20%, hsl(var(--accent-hue), 38%, calc(7% + var(--accent-lightness-offset))) 50%, hsl(var(--accent-hue), 50%, calc(4% + var(--accent-lightness-offset))) 100%)" : "linear-gradient(180deg, hsl(var(--accent-hue), 36%, calc(95% + var(--accent-lightness-offset))) 0%, hsl(var(--accent-hue), 29%, calc(92% + var(--accent-lightness-offset))) 20%, hsl(var(--accent-hue), 26%, calc(88% + var(--accent-lightness-offset))) 50%, hsl(var(--accent-hue), 22%, calc(82% + var(--accent-lightness-offset))) 100%)";
      container.style.background = bg;
    }
  };
  window.BambooGarden = BambooGarden2;

  // assets/scripts/modules/sections/manager.js
  var manager_exports = {};
  __export(manager_exports, {
    SectionManager: () => SectionManager2
  });
  var SectionManager2 = {
    draggedItem: null,
    draggedOverItem: null,
    hasPendingChanges: false,
    init() {
      this.registerDefaultSections();
      SectionRegistry.load();
    },
    registerDefaultSections() {
      SectionRegistry.register("themeEffect", {
        name: "\u4E3B\u9898\u52A8\u6548",
        icon: "Palette",
        description: "\u52A8\u6001\u4E3B\u9898\u80CC\u666F\uFF0C\u7AF9\u6797\u3001\u6D77\u6D0B\u3001\u68EE\u6797\u7B49",
        className: "theme-effect-section",
        isCustom: false,
        renderer: window.ThemeEffects,
        dataKey: "themeEffect",
        theme: "bamboo"
      });
      SectionRegistry.register("timeline", {
        name: "\u4ECA\u65E5\u6D3B\u52A8",
        icon: "TreePine",
        description: "\u65F6\u95F4\u7EBF\u8BB0\u5F55\u4E00\u5929\u6D3B\u52A8",
        className: "timeline-section",
        renderer: TimelineRenderer,
        dataKey: "timeline"
      });
      SectionRegistry.register("goals", {
        name: "\u76EE\u6807\u5730\u56FE",
        icon: "Map",
        description: "\u76EE\u6807\u8FFD\u8E2A\u548C\u8FDB\u5EA6",
        className: "goal-section",
        renderer: GoalsRenderer,
        editor: GoalsEditor,
        dataKey: "goals"
      });
      SectionRegistry.register("todo", {
        name: "\u5F85\u529E\u4EFB\u52A1",
        icon: "List",
        description: "\u6BCF\u65E5\u5F85\u529E\u4EFB\u52A1\u7BA1\u7406",
        className: "todo-section",
        renderer: TodoRenderer
      });
    },
    openSectionSettings(sectionId) {
      SectionSettings.open(sectionId);
    },
    hideFromSettings(sectionId) {
      SectionRegistry.setVisible(sectionId, false);
      renderAll();
      Toast.showToast("\u677F\u5757\u5DF2\u9690\u85CF", "info");
      Handlers.closeModal();
    },
    openManagerFromSettings() {
      Handlers.closeModal();
      this.openManager();
    },
    openManager() {
      const allSections = SectionRegistry.getAll();
      const visible = allSections.filter((s) => s.visible).sort((a, b) => a.order - b.order);
      const hidden = allSections.filter((s) => !s.visible).sort((a, b) => a.order - b.order);
      const batchShowBtn = hidden.length > 1 ? `<button class="sm-batch-show-btn" data-action="section-manager-show-all">${LucideUtils.createIcon("eye", { size: 13 })} \u5168\u90E8\u663E\u793A</button>` : "";
      const content = `
            <div class="sm-actions-bar">
                <div class="sm-actions-bar-tip">\u8C03\u6574\u987A\u5E8F\u6216\u663E\u793A\u540E\uFF0C\u70B9\u51FB<span class="sm-apply-link" data-action="section-manager-apply-changes" title="\u5C06\u5F53\u524D\u7684\u987A\u5E8F\u548C\u663E\u793A\u8BBE\u7F6E\u5E94\u7528\u5230\u4E3B\u9875\u9762">\u5E94\u7528\u66F4\u6539</span></div>
            </div>
            <div class="fab-panel-section">
                <div class="fab-panel-section-title">\u663E\u793A\u7684\u677F\u5757 (${visible.length})</div>
                <div class="sm-list" id="smVisibleList">
                    ${visible.length > 0 ? visible.map((section) => this.renderSectionItem(section)).join("") : `
                        <div class="sm-empty">\u6682\u65E0\u663E\u793A\u7684\u677F\u5757</div>
                    `}
                </div>
            </div>

            <div class="fab-panel-section">
                <div class="fab-panel-section-title">
                    \u9690\u85CF\u7684\u677F\u5757 (${hidden.length})
                    ${batchShowBtn}
                </div>
                <div class="sm-list sm-list-hidden" id="smHiddenList">
                    ${hidden.length > 0 ? hidden.map((section) => this.renderHiddenSectionItem(section)).join("") : `
                        <div class="sm-empty">\u6240\u6709\u677F\u5757\u90FD\u5DF2\u663E\u793A</div>
                    `}
                </div>
            </div>
        `;
      PanelManager.open("sections", LucideUtils.createIcon("layoutGrid", { size: 16 }) + "\u677F\u5757\u7BA1\u7406", content, {
        onOpen: () => {
          SectionManager2.hasPendingChanges = false;
          SectionManager2._updateApplyBtnState();
          const list = byId("smVisibleList");
          if (list) SectionDragDrop.init(list, SectionManager2._getDragDropConfig());
        }
      });
    },
    renderSectionItem(section) {
      return `
            <div class="sm-item" data-id="${section.id}" draggable="true">
                <div class="sm-drag-handle">${LucideUtils.createIcon("gripVertical", { size: 14 })}</div>
                <div class="sm-info">
                    <div class="sm-name">${escapeHtml(section.name)}</div>
                    <div class="sm-desc">${escapeHtml(section.description)}</div>
                </div>
                <div class="sm-actions">
                    <button class="sm-btn sm-btn-hide" data-action="section-manager-hide-section" data-section-id="${section.id}" title="\u9690\u85CF">
                        ${LucideUtils.createIcon("eyeOff", { size: 16 })}
                    </button>
                </div>
            </div>
        `;
    },
    renderHiddenSectionItem(section) {
      return `
            <div class="sm-item sm-item-hidden" data-id="${section.id}">
                <div class="sm-info">
                    <div class="sm-name">${escapeHtml(section.name)}</div>
                </div>
                <div class="sm-actions">
                    <button class="sm-btn sm-btn-show" data-action="section-manager-show-section" data-section-id="${section.id}" title="\u663E\u793A">
                        ${LucideUtils.createIcon("eye", { size: 16 })}
                    </button>
                </div>
            </div>
        `;
    },
    hideSection(id) {
      SectionRegistry.setVisible(id, false);
      this.hasPendingChanges = true;
      this._updateManagerUI();
      this._updateApplyBtnState();
    },
    showSection(id) {
      SectionRegistry.setVisible(id, true);
      this.hasPendingChanges = true;
      this._updateManagerUI();
      this._updateApplyBtnState();
    },
    showAll() {
      SectionRegistry.getAll().forEach((s) => {
        if (!s.visible) SectionRegistry.setVisible(s.id, true);
      });
      this.hasPendingChanges = true;
      this._updateManagerUI();
      this._updateApplyBtnState();
    },
    applyChanges() {
      SectionRegistry.save();
      renderAll();
      this.hasPendingChanges = false;
      this._updateApplyBtnState();
      Toast.showToast("\u5E03\u5C40\u5DF2\u66F4\u65B0", "success");
    },
    /**
     * 统一的拖拽回调配置 — 拖拽完成后标记有未应用更改
     */
    _getDragDropConfig() {
      const self = this;
      return {
        onOrderChange: () => {
          self.hasPendingChanges = true;
          self._updateApplyBtnState();
        }
      };
    },
    /**
     * 就地更新管理面板 UI（不重建整个面板）
     * 依赖：PanelManager.activeId === 'sections' 且面板 DOM 已渲染
     */
    _updateManagerUI() {
      if (!PanelManager.activePanel || PanelManager.activeId !== "sections") {
        return;
      }
      const panel = PanelManager.activePanel;
      const visibleList = panel.querySelector("#smVisibleList");
      const hiddenList = panel.querySelector("#smHiddenList");
      if (!visibleList || !hiddenList) return;
      const allSections = SectionRegistry.getAll();
      const visible = allSections.filter((s) => s.visible).sort((a, b) => a.order - b.order);
      const hidden = allSections.filter((s) => !s.visible).sort((a, b) => a.order - b.order);
      const visibleTitle = panel.querySelectorAll(".fab-panel-section-title")[0];
      const hiddenTitle = panel.querySelectorAll(".fab-panel-section-title")[1];
      visibleList.innerHTML = visible.length > 0 ? visible.map((s) => this.renderSectionItem(s)).join("") : '<div class="sm-empty">\u6682\u65E0\u663E\u793A\u7684\u677F\u5757</div>';
      const batchBtn = hidden.length > 1 ? `<button class="sm-batch-show-btn" data-action="section-manager-show-all">${LucideUtils.createIcon("eye", { size: 13 })} \u5168\u90E8\u663E\u793A</button>` : "";
      hiddenList.innerHTML = hidden.length > 0 ? hidden.map((s) => this.renderHiddenSectionItem(s)).join("") : '<div class="sm-empty">\u6240\u6709\u677F\u5757\u90FD\u5DF2\u663E\u793A</div>';
      if (visibleTitle) visibleTitle.innerHTML = `\u663E\u793A\u7684\u677F\u5757 (${visible.length})`;
      if (hiddenTitle) hiddenTitle.innerHTML = `\u9690\u85CF\u7684\u677F\u5757 (${hidden.length})${batchBtn}`;
      SectionDragDrop.init(visibleList, this._getDragDropConfig());
      this._updateApplyBtnState();
    },
    _updateApplyBtnState() {
    }
  };
  ActionDispatcher.registerMany({
    "section-manager-hide-section": (ds) => SectionManager2.hideSection(ds.sectionId),
    "section-manager-show-section": (ds) => SectionManager2.showSection(ds.sectionId),
    "section-manager-show-all": () => SectionManager2.showAll(),
    "section-manager-apply-changes": () => SectionManager2.applyChanges()
  });
  window.SectionManager = SectionManager2;

  // assets/scripts/modules/theme-effects.js
  var theme_effects_exports = {};
  __export(theme_effects_exports, {
    ThemeEffects: () => ThemeEffects2
  });
  var ThemeEffects2 = {
    currentTheme: "bamboo",
    _intervals: [],
    /** 每个主题独立的色相/明度设置，分亮/暗两套
     *  新格式：{ light:{hue,lightness}, dark:{hue,lightness} }
     *  旧格式（兼容）：{ hue, lightness } → 迁移为 light 的值，dark 初始跟随 light
     */
    _themeSettings: {},
    themes: {
      bamboo: {
        name: "\u7AF9\u6797\u6E05\u97F5",
        icon: "tree-pine",
        render() {
          return BambooGarden.render();
        },
        init() {
          BambooGarden.init();
        }
      }
    },
    render(themeName = "bamboo") {
      const theme = this.themes[themeName];
      if (!theme) {
        console.debug("Theme not found, falling back to bamboo:", themeName);
        return this.themes.bamboo.render();
      }
      return theme.render();
    },
    init(themeName = "bamboo") {
      var section = byId("themeEffectSection");
      if (!section) return;
      var container = section.firstElementChild;
      const theme = this.themes[themeName];
      if (theme && typeof theme.init === "function") {
        theme.init(container);
      }
      this._applyThemeVars(themeName);
      this._syncThemeMode();
      this._initThemeModeObserver();
    },
    switchTheme(themeName) {
      if (!this.themes[themeName]) return;
      var section = byId("themeEffectSection");
      if (!section) return;
      var self = this;
      var doSwap = function() {
        var newEl = self.createElement(self.render(themeName));
        section.innerHTML = "";
        section.appendChild(newEl);
        requestAnimationFrame(function() {
          section.style.opacity = "1";
        });
      };
      var onTransitionEnd = function(e) {
        if (e.target !== section) return;
        if (e.propertyName !== "opacity") return;
        section.removeEventListener("transitionend", onTransitionEnd);
        doSwap();
      };
      section.addEventListener("transitionend", onTransitionEnd);
      var fallbackTimer = setTimeout(function() {
        section.removeEventListener("transitionend", onTransitionEnd);
        if (section.style.opacity === "0") {
          doSwap();
        }
      }, 400);
      var originalDoSwap = doSwap;
      doSwap = function() {
        clearTimeout(fallbackTimer);
        originalDoSwap();
      };
      section.style.opacity = "0";
      if (typeof SectionRegistry !== "undefined") {
        SectionRegistry.update("themeEffect", { theme: themeName });
      }
      const oldTheme = this.themes[this.currentTheme];
      if (oldTheme && typeof oldTheme.destroy === "function") {
        try {
          oldTheme.destroy();
        } catch (e) {
          console.warn("[ThemeEffects] \u65E7\u4E3B\u9898 destroy \u5931\u8D25:", e.message);
        }
      }
      this.destroy();
      this.currentTheme = themeName;
      this.init(themeName);
      Toast.showToast("\u5DF2\u5207\u6362\u81F3\u300C" + this.themes[themeName].name + "\u300D", "success");
    },
    createElement(html) {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      if (template.content.children.length > 1) {
        const frag = document.createDocumentFragment();
        while (template.content.firstChild) {
          frag.appendChild(template.content.firstChild);
        }
        return frag;
      }
      return template.content.firstChild;
    },
    /** 在 #themeEffectSection 上覆盖 --accent-hue / --accent-lightness-offset（仅当前模式） */
    _applyThemeVars(themeName) {
      var section = byId("themeEffectSection");
      if (!section) return;
      if (!this._settingsLoaded) {
        this._loadSettings();
        this._settingsLoaded = true;
      }
      var mode = this._getCurrentMode();
      var s = this._getModeSetting(themeName, mode);
      if (s && s.hue !== null) {
        section.style.setProperty("--accent-hue", s.hue, "important");
      } else {
        section.style.removeProperty("--accent-hue");
      }
      if (s && s.lightness !== null) {
        section.style.setProperty("--accent-lightness-offset", s.lightness + "%", "important");
      } else {
        section.style.removeProperty("--accent-lightness-offset");
      }
    },
    /** 同步明暗模式到 #themeEffectSection 的 CSS 变量和 data 属性 */
    _syncThemeMode() {
      var section = byId("themeEffectSection");
      if (!section) return;
      var isDark = document.documentElement.classList.contains("dark");
      section.setAttribute("data-theme-mode", isDark ? "dark" : "light");
      section.style.setProperty(
        "--theme-lum",
        "calc(" + (isDark ? "22%" : "80%") + " + var(--accent-lightness-offset, 0%))",
        "important"
      );
      section.style.setProperty("--theme-sat", isDark ? "25%" : "35%", "important");
      this._applyThemeVars(this.currentTheme);
      var panel = $('.panel[active-panel="theme"]');
      if (panel) {
        var mode = this._getCurrentMode();
        var modeLabel = mode === "dark" ? "\u6697\u8272" : "\u4EAE\u8272";
        var headerLabel = panel.querySelector(".theme-tune-header-label");
        if (headerLabel) headerLabel.textContent = "\u5F53\u524D\u4E3B\u9898\u989C\u8272 \xB7 " + modeLabel;
        var cur = this._getModeSetting(this.currentTheme, mode);
        var hueSlider = panel.querySelector("#tuneHue");
        var lightSlider = panel.querySelector("#tuneLight");
        var hv = panel.querySelector("#tuneHueVal");
        var lv = panel.querySelector("#tuneLightVal");
        if (hueSlider) hueSlider.value = cur.hue !== null ? cur.hue : "";
        if (lightSlider) lightSlider.value = cur.lightness !== null ? cur.lightness : "0";
        if (hv) hv.textContent = cur.hue !== null ? cur.hue + "\xB0" : "\u81EA\u52A8";
        if (lv) lv.textContent = cur.lightness !== null ? (cur.lightness > 0 ? "+" : "") + cur.lightness + "%" : "\u81EA\u52A8";
        var hr = panel.querySelector("#tuneHueReset");
        var lr = panel.querySelector("#tuneLightReset");
        if (hr) hr.style.display = cur.hue !== null ? "" : "none";
        if (lr) lr.style.display = cur.lightness !== null ? "" : "none";
      }
    },
    /** 监听 Obsidian 明暗模式切换（html.dark class 变化） */
    _initThemeModeObserver() {
      if (this._modeObserverActive) return;
      this._modeObserverActive = true;
      var el = this;
      var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === "attributes" && m.attributeName === "class") {
            el._syncThemeMode();
            break;
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      this._modeObserver = observer;
    },
    _getCurrentMode() {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    },
    /** 读取某主题某模式下的设置，带 fallback */
    _getModeSetting(themeName, mode) {
      var s = this._themeSettings[themeName];
      if (!s) return { hue: null, lightness: null };
      if (s.light && s.dark) return { hue: s[mode].hue, lightness: s[mode].lightness };
      return { hue: s.hue !== void 0 ? s.hue : null, lightness: s.lightness !== void 0 ? s.lightness : null };
    },
    /** 设置当前主题当前模式的独立色相/明度，null 表示跟随全局 */
    _setThemeSetting(themeName, key, val) {
      var mode = this._getCurrentMode();
      if (!this._themeSettings[themeName]) {
        this._themeSettings[themeName] = { light: { hue: null, lightness: null }, dark: { hue: null, lightness: null } };
      }
      if (!this._themeSettings[themeName].light) {
        this._themeSettings[themeName] = { light: { hue: null, lightness: null }, dark: { hue: null, lightness: null } };
      }
      this._themeSettings[themeName][mode][key] = val;
      if (this.currentTheme === themeName) {
        this._applyThemeVars(themeName);
      }
      this._saveSettings();
    },
    /** 从 localStorage 加载主题设置，兼容旧格式 */
    _loadSettings() {
      try {
        var raw = StorageAdapter.get(StorageKeys.THEME_SETTINGS);
        if (raw) {
          var parsed = JSON.parse(raw);
          var migrated = {};
          var keys = Object.keys(parsed);
          for (var i = 0; i < keys.length; i++) {
            var themeName = keys[i];
            var val = parsed[themeName];
            if (val && typeof val === "object" && !val.light && !val.dark && ("hue" in val || "lightness" in val)) {
              migrated[themeName] = {
                light: { hue: val.hue !== void 0 ? val.hue : null, lightness: val.lightness !== void 0 ? val.lightness : null },
                dark: { hue: val.hue !== void 0 ? val.hue : null, lightness: val.lightness !== void 0 ? val.lightness : null }
              };
            } else {
              migrated[themeName] = val;
            }
          }
          this._themeSettings = migrated;
        }
      } catch (e) {
        console.warn("[ThemeEffects] \u52A0\u8F7D\u4E3B\u9898\u8BBE\u7F6E\u5931\u8D25:", e);
      }
    },
    /** 保存到 localStorage */
    _saveSettings() {
      try {
        StorageAdapter.set(StorageKeys.THEME_SETTINGS, JSON.stringify(this._themeSettings));
      } catch (e) {
        console.warn("[ThemeEffects] \u4FDD\u5B58\u4E3B\u9898\u8BBE\u7F6E\u5931\u8D25:", e);
      }
    },
    getThemeList() {
      return Object.keys(this.themes).map((key) => ({
        id: key,
        name: this.themes[key].name,
        icon: this.themes[key].icon
      }));
    },
    /** 注册外部自定义主题 */
    registerExternal(name, code) {
      if (!name || !code) return;
      if (this.themes[name]) {
        console.warn('[ThemeEffects] \u4E3B\u9898 "' + name + '" \u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7\u6CE8\u518C');
        return;
      }
      const themeObj = this._evalTheme(name, code);
      if (!themeObj) return;
      if (typeof themeObj.name !== "string" || typeof themeObj.render !== "function") {
        console.warn('[ThemeEffects] \u4E3B\u9898 "' + name + '" \u7F3A\u5C11\u5FC5\u8981\u7684 name/render \u5B57\u6BB5\uFF0C\u8DF3\u8FC7\u6CE8\u518C');
        return;
      }
      this.themes[name] = {
        name: themeObj.name || name,
        icon: themeObj.icon || "palette",
        description: themeObj.description || "",
        render() {
          return themeObj.render();
        },
        init(container) {
          if (typeof themeObj.init === "function") themeObj.init(container);
        },
        destroy() {
          if (typeof themeObj.destroy === "function") themeObj.destroy();
        }
      };
      console.debug('[ThemeEffects] \u81EA\u5B9A\u4E49\u4E3B\u9898 "' + this.themes[name].name + '" \u6CE8\u518C\u6210\u529F');
    },
    /** 安全执行主题代码并提取主题对象 */
    _evalTheme(name, code) {
      try {
        const varName = name.startsWith("__bamboo_theme_") ? name : "__bamboo_theme_" + name;
        const blocked = this._auditThemeCode(name, code);
        if (blocked) return null;
        const beforeKeys = Object.getOwnPropertyNames(window);
        const DANGEROUS = [
          "parent",
          "top",
          "opener",
          "fetch",
          "XMLHttpRequest",
          "WebSocket",
          "localStorage",
          "sessionStorage",
          "indexedDB",
          "eval",
          "import"
        ];
        const saved = {};
        for (const key of DANGEROUS) {
          saved[key] = window[key];
          try {
            Object.defineProperty(window, key, { value: void 0, configurable: true, writable: false });
          } catch (_) {
          }
        }
        let result = null;
        try {
          const func = new Function(
            "window",
            "self",
            code + "; return typeof " + varName + ' !== "undefined" ? ' + varName + " : null;"
          );
          result = func(window, window);
        } finally {
          for (const key of DANGEROUS) {
            try {
              Object.defineProperty(window, key, { value: saved[key], configurable: true, writable: true });
            } catch (_) {
            }
          }
        }
        if (result) return result;
        const afterKeys = Object.getOwnPropertyNames(window);
        const leaked = afterKeys.filter((k) => !beforeKeys.includes(k) && !DANGEROUS.includes(k));
        const themeVar = window[varName];
        for (const k of leaked) {
          if (!k.startsWith("__bamboo_theme_")) {
            try {
              delete window[k];
            } catch (_) {
            }
          }
        }
        return themeVar || null;
      } catch (e) {
        console.error('[ThemeEffects] \u6267\u884C\u81EA\u5B9A\u4E49\u4E3B\u9898 "' + name + '" \u65F6\u51FA\u9519:', e.message);
        return null;
      }
    },
    /** 静态审计主题代码，检测危险 API 调用 */
    _auditThemeCode(name, code) {
      const stripped = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      const rules = [
        { pattern: /\bwindow\.parent\b/, msg: "window.parent" },
        { pattern: /\bwindow\.top\b/, msg: "window.top" },
        { pattern: /\bwindow\.opener\b/, msg: "window.opener" },
        { pattern: /\bfetch\s*\(/, msg: "fetch()" },
        { pattern: /\bXMLHttpRequest\b/, msg: "XMLHttpRequest" },
        { pattern: /\bWebSocket\b/, msg: "WebSocket" },
        { pattern: /\blocalStorage\b/, msg: "localStorage" },
        { pattern: /\bsessionStorage\b/, msg: "sessionStorage" },
        { pattern: /\bindexedDB\b/, msg: "indexedDB" },
        { pattern: /\bdocument\.cookie\b/, msg: "document.cookie" },
        { pattern: /\beval\s*\(/, msg: "eval()" },
        { pattern: /\bnew\s+Function\s*\(/, msg: "new Function()" },
        { pattern: /\bimport\s*\(/, msg: "import()" },
        { pattern: /\bimport\s+/, msg: "import statement" },
        { pattern: /\bnavigator\.sendBeacon\b/, msg: "navigator.sendBeacon" }
      ];
      for (const rule of rules) {
        if (rule.pattern.test(stripped)) {
          console.warn('[ThemeEffects] \u4E3B\u9898 "' + name + '" \u5305\u542B\u5371\u9669 API \u8C03\u7528: ' + rule.msg + "\uFF0C\u5DF2\u62D2\u7EDD\u52A0\u8F7D");
          return true;
        }
      }
      return false;
    },
    /** 显示主题开发指南 */
    showThemeGuide() {
      var g = [];
      g.push('<div class="theme-guide-ai-bar">');
      g.push('  <button class="theme-guide-ai-btn" id="aiWizardBtn">\u2728 AI \u8F85\u52A9\u521B\u5EFA</button>');
      g.push('  <span class="theme-guide-ai-hint">\u586B\u4E2A\u63CF\u8FF0\uFF0CAI \u5E2E\u4F60\u5199\u4E3B\u9898\u4EE3\u7801</span>');
      g.push("</div>");
      g.push('<div class="theme-guide">');
      g.push('<div class="theme-guide-section">');
      g.push("<h3>\u{1F4C1} \u6587\u4EF6\u4F4D\u7F6E</h3>");
      g.push("<p>\u5728 Vault \u6839\u76EE\u5F55\u4E0B\u521B\u5EFA <code>\u7AF9\u6797\u590D\u76D8\u4E3B\u9898/</code> \u6587\u4EF6\u5939\uFF0C\u653E\u5165 <code>.js</code> \u6587\u4EF6\u3002\u8DEF\u5F84\u53EF\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u4FEE\u6539\u3002</p>");
      g.push("</div>");
      g.push('<div class="theme-guide-section">');
      g.push("<h3>\u{1F4DD} \u63A5\u53E3\u89C4\u8303</h3>");
      g.push("<pre><code>// \u6587\u4EF6\u540D: \u6211\u7684\u4E3B\u9898.js  \u2192  \u53D8\u91CF\u540D: __bamboo_theme_\u6211\u7684\u4E3B\u9898");
      g.push("const theme = {");
      g.push("  name: '\u6211\u7684\u4E3B\u9898',       // \u5FC5\u586B\uFF1A\u663E\u793A\u540D\u79F0");
      g.push("  render() {              // \u5FC5\u586B\uFF1A\u8FD4\u56DE HTML");
      g.push("    return '&lt;div&gt;...&lt;/div&gt;';");
      g.push("  },");
      g.push("  init(container) {},     // \u53EF\u9009\uFF1A\u5E73\u53F0\u4F20\u5165\u6839\u5143\u7D20\uFF0C\u5B58 this._container");
      g.push("  destroy() {}            // \u5FC5\u8BFB\uFF1A\u6E05\u7406\u6240\u6709 setTimeout/RAF/GSAP tweens");
      g.push("};");
      g.push("window.__bamboo_theme_\u6211\u7684\u4E3B\u9898 = theme;</code></pre>");
      g.push("</div>");
      g.push('<div class="theme-guide-section">');
      g.push("<h3>\u{1F3A8} \u8DDF\u968F\u4E3B\u9898\u8272</h3>");
      g.push("<p>\u4F7F\u7528 <code>hsl(var(--accent-hue), S%, L%)</code> \u8DDF\u968F\u8272\u76F8\u6ED1\u5757\uFF0C<code>calc(L% + var(--accent-lightness-offset))</code> \u8DDF\u968F\u660E\u5EA6\u6ED1\u5757\u3002</p>");
      g.push("<p>\u4F7F\u7528 <code>var(--theme-lum)</code> \u81EA\u52A8\u9002\u914D\u660E\u6697\u6A21\u5F0F\uFF1A\u4EAE\u8272\u65F6 = 80%\uFF0C\u6697\u8272\u65F6\u81EA\u52A8\u7FFB\u8F6C\u4E3A 22%\u3002</p>");
      g.push('<p>\u9700\u8981\u7CBE\u7EC6\u63A7\u5236\u65F6\uFF0C\u4F7F\u7528 <code>[data-theme-mode="dark"]</code> \u9009\u62E9\u5668\u5206\u5199\u4E24\u5957 CSS\u3002</p>');
      g.push("</div>");
      g.push('<div class="theme-guide-section">');
      g.push("<h3>\u{1F3AF} \u5E73\u53F0 CSS \u53D8\u91CF</h3>");
      g.push("<p>\u4EE5\u4E0B CSS \u81EA\u5B9A\u4E49\u5C5E\u6027\u7531\u5E73\u53F0\u63D0\u4F9B\uFF0C\u4E3B\u9898\u4E2D\u53EF\u76F4\u63A5\u4F7F\u7528\uFF1A</p>");
      g.push('<table class="theme-guide-var-table"><tr><th>\u53D8\u91CF\u540D</th><th>\u7528\u9014</th><th>\u8BF4\u660E</th></tr>');
      g.push("<tr><td><code>--theme-inner-radius</code></td><td>\u5185\u6846\u5706\u89D2</td><td>\u5F53\u524D = 26px\uFF0C\u5916\u6846 38px\u2212padding 12px\u3002\u5916\u5C42\u6539\u5927\u65F6\u81EA\u52A8\u66F4\u65B0\uFF0C<u>\u5FC5\u987B\u7528\u6B64\u53D8\u91CF\uFF0C\u7981\u6B62\u786C\u7F16\u7801</u></td></tr>");
      g.push("<tr><td><code>--accent-hue</code></td><td>\u8272\u76F8</td><td>\u8DDF\u968F\u8272\u76F8\u6ED1\u5757\uFF0C\u7528 <code>hsl(var(--accent-hue), S%, L%)</code> \u8DDF\u968F</td></tr>");
      g.push("<tr><td><code>--accent-lightness-offset</code></td><td>\u660E\u5EA6\u504F\u79FB</td><td>\u8DDF\u968F\u660E\u5EA6\u6ED1\u5757\uFF0C\u7528 <code>calc(L% + var(--accent-lightness-offset))</code></td></tr>");
      g.push("<tr><td><code>--theme-lum</code></td><td>\u660E\u6697\u81EA\u9002\u5E94</td><td>\u4EAE\u8272=80%\uFF0C\u6697\u8272\u81EA\u52A8\u7FFB\u8F6C\u4E3A 22%\u3002\u7528\u6B64\u53D8\u91CF\u5199\u4E00\u5957\u4EE3\u7801\u540C\u65F6\u9002\u914D\u4EAE\u6697</td></tr>");
      g.push("<tr><td><code>--theme-sat</code></td><td>\u9971\u548C\u5EA6\u81EA\u9002\u5E94</td><td>\u4EAE\u8272=35%\uFF0C\u6697\u8272\u81EA\u52A8\u964D\u4E3A 25%\u3002\u8DDF\u968F\u4EAE\u6697\u5207\u6362</td></tr>");
      g.push("</table>");
      g.push("</div>");
      g.push('<div class="theme-guide-section">');
      g.push("<h3>\u{1F4D0} \u5BB9\u5668\u9002\u914D\u89C4\u8303</h3>");
      g.push("<p><strong>\u5BBD\u5EA6\uFF1A\u7236\u7EA7 100%</strong> \u2014 \u4E3B\u9898\u6E32\u67D3\u533A\u5BBD\u5EA6\u7531\u7528\u6237\u300C\u5185\u5BB9\u5BBD\u5EA6\u300D\u6ED1\u5757\u63A7\u5236\uFF08400~1600px \u52A8\u6001\u53D8\u5316\uFF09\uFF0C\u4E3B\u9898\u5FC5\u987B\u81EA\u9002\u5E94\u3002</p>");
      g.push("<p><strong>\u9AD8\u5EA6\uFF1A\u56FA\u5B9A 250~400px</strong> \u2014 \u63A8\u8350 300px\uFF0C\u4E0D\u5F97\u8D85\u51FA\u6B64\u533A\u95F4\u3002</p>");
      g.push("<p><strong>\u5706\u89D2\uFF1A\u4F7F\u7528\u5E73\u53F0\u53D8\u91CF</strong> \u2014 <code>border-radius: var(--theme-inner-radius)</code>\uFF0C<u>\u7981\u6B62\u786C\u7F16\u7801\u56FA\u5B9A\u503C</u>\u3002\u5E73\u53F0\u5916\u6846\u5706\u89D2\u968F\u65F6\u53EF\u80FD\u8C03\u5927\uFF0C\u53D8\u91CF\u503C\u81EA\u52A8\u8DDF\u968F\uFF0C\u786C\u7F16\u7801\u4F1A\u5BFC\u81F4\u53CC\u6846\u5012\u89D2\u9519\u4F4D\u3002</p>");
      g.push("<p><strong>\u6EA2\u51FA\u88C1\u5207\uFF1A\u5FC5\u987B\u8BBE\u7F6E</strong> \u2014 \u5BB9\u5668\u52A0 <code>overflow: hidden</code>\uFF0C\u9632\u6B62\u52A8\u6548\uFF08\u7C92\u5B50\u3001\u96FE\u6C14\u7B49\uFF09\u7A7F\u900F\u5706\u89D2\u8FB9\u754C\u3002</p>");
      g.push("<p><strong>\u6C34\u5E73\u5B9A\u4F4D\u5FC5\u987B\u81EA\u9002\u5E94</strong> \u2014 \u4F7F\u7528\u767E\u5206\u6BD4\uFF08\u5982 <code>left: 20%</code>\uFF09\u3001<code>vw</code> \u6216 JS \u52A8\u6001\u8BA1\u7B97\uFF08<code>container.offsetWidth</code>\uFF09\uFF0C<u>\u7981\u6B62\u4F7F\u7528\u56FA\u5B9A px \u5BBD\u5EA6</u>\u3002</p>");
      g.push("</div>");
      g.push('<div class="theme-guide-section">');
      g.push("<h3>\u{1F6E0}\uFE0F \u5FEB\u901F\u6A21\u677F</h3>");
      g.push("<pre><code>const theme = {");
      g.push("  name: '\u6211\u7684\u4E3B\u9898',");
      g.push("  render() {");
      g.push("    // width:100% \u81EA\u9002\u5E94\u7236\u7EA7\uFF0Cheight:300px \u56FA\u5B9A\u9AD8\u5EA6\uFF0Coverflow:hidden \u9632\u6B62\u52A8\u6548\u6EA2\u51FA");
      g.push("    // border-radius \u7528\u5E73\u53F0\u53D8\u91CF var(--theme-inner-radius)\uFF0C\u7981\u6B62\u786C\u7F16\u7801");
      g.push(`    return '&lt;div style="width:100%;height:300px;overflow:hidden;`);
      g.push("      border-radius:var(--theme-inner-radius,26px);");
      g.push("      background:linear-gradient(180deg,");
      g.push("        hsl(calc(var(--accent-hue)+10),var(--theme-sat),var(--theme-lum)),");
      g.push("        hsl(var(--accent-hue),var(--theme-sat),calc(var(--theme-lum) * 0.85)),");
      g.push("        hsl(calc(var(--accent-hue)-10),var(--theme-sat),calc(var(--theme-lum) * 0.6)));");
      g.push('      display:flex;align-items:center;justify-content:center"&gt;');
      g.push('      &lt;h2 style="color:rgba(255,255,255,.85)"&gt;\u2728 \u6211\u7684\u4E3B\u9898&lt;/h2&gt;');
      g.push("      &lt;/div&gt;';");
      g.push("  }");
      g.push("};");
      g.push("window.__bamboo_theme_\u6211\u7684\u4E3B\u9898 = theme;</code></pre>");
      g.push("</div>");
      g.push('<div class="theme-guide-section">');
      g.push("<h3>\u26A0\uFE0F \u5F02\u6B65\u5B89\u5168</h3>");
      g.push("<p>\u5207\u6362\u4E3B\u9898\u65F6 <code>destroy()</code> \u88AB\u8C03\u7528\uFF0C\u4F46\u5F02\u6B65\u56DE\u8C03\uFF08<code>setTimeout</code>/<code>requestAnimationFrame</code>/<code>gsap.onComplete</code>\uFF09\u53EF\u80FD\u4ECD\u5728\u961F\u5217\u4E2D\uFF0C\u56DE\u8C03\u89E6\u53D1\u65F6 DOM \u5DF2\u88AB\u6E05\u7A7A\u3002</p>");
      g.push("<p><strong>\u5FC5\u987B\u505A\u5230\uFF1A</strong></p>");
      g.push("<ol>");
      g.push("<li><code>init(container)</code> \u91CC\u5B58 <code>this._container = container</code></li>");
      g.push("<li>\u6240\u6709 <code>setTimeout</code> \u8FD4\u56DE ID \u5B58\u5165\u6570\u7EC4\uFF0C<code>destroy()</code> \u91CC <code>clearTimeout</code> \u5168\u90E8\u6E05\u6389</li>");
      g.push("<li>\u6240\u6709\u5F02\u6B65\u56DE\u8C03\u5165\u53E3\u52A0 <code>if (!this._container) return</code></li>");
      g.push("<li>\u5982\u6709 GSAP\uFF1A<code>destroy()</code> \u91CC <code>gsap.killTweensOf(container.querySelectorAll('*'))</code></li>");
      g.push("</ol>");
      g.push("<p>GSAP \u901A\u8FC7 <code>window.gsap</code> \u5168\u5C40\u53EF\u7528\uFF0C\u4E3B\u9898\u65E0\u9700 bundler\uFF0C\u76F4\u63A5\u7528\u3002</p>");
      g.push("</div>");
      g.push("</div>");
      var guide = g.join("\n");
      PanelManager.open("theme-guide", "\u4E3B\u9898\u52A8\u6548 \xB7 \u5F00\u53D1\u6307\u5357", guide, {
        width: "500px",
        onClose: function() {
        }
      });
      var el = this;
      var panel = byId("panel-theme-guide");
      if (panel) {
        var aiBtn = panel.querySelector("#aiWizardBtn");
        if (aiBtn) {
          aiBtn.addEventListener("click", function() {
            PanelManager.close();
            el.showAIWizard();
          });
        }
      }
    },
    /** AI 辅助创建主题 — 多步向导 */
    showAIWizard() {
      var el = this;
      var step = 1;
      var promptText = "";
      var content = [];
      content.push('<div class="ai-wizard">');
      content.push('<div class="ai-wizard-steps">');
      content.push('  <span class="ai-wizard-dot active"></span>');
      content.push('  <span class="ai-wizard-line"></span>');
      content.push('  <span class="ai-wizard-dot"></span>');
      content.push('  <span class="ai-wizard-line"></span>');
      content.push('  <span class="ai-wizard-dot"></span>');
      content.push("</div>");
      content.push('<div class="ai-wizard-body" id="wizardStep1">');
      content.push('  <label class="ai-wizard-label">\u4E3B\u9898\u540D\u79F0</label>');
      content.push('  <input class="ai-wizard-input" id="wizName" placeholder="\u5982\uFF1A\u661F\u7A7A\u3001\u6DF1\u6D77\u3001\u6A31\u82B1" maxlength="20">');
      content.push('  <label class="ai-wizard-label">\u98CE\u683C\u63CF\u8FF0</label>');
      content.push('  <textarea class="ai-wizard-textarea" id="wizDesc" placeholder="\u7528\u4E00\u53E5\u8BDD\u63CF\u8FF0\u4F60\u60F3\u8981\u7684\u89C6\u89C9\u6548\u679C\uFF0C\u5982\uFF1A\u6DF1\u84DD\u8272\u661F\u7A7A\u80CC\u666F\uFF0C\u6709\u6D41\u661F\u5212\u8FC7\u548C\u661F\u5149\u95EA\u70C1" rows="2" maxlength="200"></textarea>');
      content.push('  <div class="ai-wizard-options">');
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u660E\u6697\u9002\u914D</div>');
      content.push('      <div class="ai-wizard-opt-row">');
      content.push('        <button class="ai-wizard-opt active" data-group="darkMode" data-val="auto">\u81EA\u52A8\u9002\u914D</button>');
      content.push('        <button class="ai-wizard-opt" data-group="darkMode" data-val="fine">\u7CBE\u7EC6\u63A7\u5236</button>');
      content.push('        <button class="ai-wizard-opt" data-group="darkMode" data-val="none">\u4EC5\u4EAE\u8272</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u52A8\u6548\u7A0B\u5EA6</div>');
      content.push('      <div class="ai-wizard-opt-row">');
      content.push('        <button class="ai-wizard-opt" data-group="anim" data-val="none">\u9759\u6001</button>');
      content.push('        <button class="ai-wizard-opt active" data-group="anim" data-val="light">\u8F7B\u91CF</button>');
      content.push('        <button class="ai-wizard-opt" data-group="anim" data-val="rich">\u4E30\u5BCC</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u753B\u9762\u590D\u6742\u5EA6</div>');
      content.push('      <div class="ai-wizard-opt-row">');
      content.push('        <button class="ai-wizard-opt" data-group="complexity" data-val="simple">\u7B80\u7EA6</button>');
      content.push('        <button class="ai-wizard-opt active" data-group="complexity" data-val="medium">\u4E2D\u7B49</button>');
      content.push('        <button class="ai-wizard-opt" data-group="complexity" data-val="rich">\u4E30\u5BCC</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push("  </div>");
      content.push('  <button class="ai-wizard-adv-toggle" id="advToggle">\u2699 \u9AD8\u7EA7\u9009\u9879 \u25B8</button>');
      content.push('  <div class="ai-wizard-adv-body" id="advBody" style="display:none">');
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u6280\u6CD5\u6807\u7B7E</div>');
      content.push('      <div class="ai-wizard-tag-grid">');
      content.push('        <span class="ai-wizard-tag-cat">\u7A7A\u95F4\u6C1B\u56F4</span>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="parallax">\u89C6\u5DEE\u5206\u5C42</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="fog">\u96FE\u6C14\u98D8\u52A8</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="cloud">\u4E91\u5C42\u6F02\u79FB</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="dof">\u666F\u6DF1\u6A21\u7CCA</button>');
      content.push('        <span class="ai-wizard-tag-cat">\u5149\u5F71\u6548\u679C</span>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="gradient-breath">\u6E10\u53D8\u547C\u5438</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="light-scan">\u5149\u7EBF\u626B\u63CF</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="glow">\u5149\u6655\u5F25\u6563</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="pulse">\u8109\u52A8\u95EA\u70C1</button>');
      content.push('        <span class="ai-wizard-tag-cat">\u7C92\u5B50\u6D41\u4F53</span>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="particle">\u7C92\u5B50\u6F02\u6D6E</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="ripple">\u6D9F\u6F2A\u6CE2\u7EB9</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="snow">\u96EA\u82B1\u98D8\u843D</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="fire">\u706B\u7130\u95EA\u70C1</button>');
      content.push('        <span class="ai-wizard-tag-cat">\u56FE\u5F62\u51E0\u4F55</span>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="svg">SVG \u56FE\u5F62</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="canvas">Canvas \u6E32\u67D3</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="3d">3D \u900F\u89C6</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="geom">\u51E0\u4F55\u53D8\u6362</button>');
      content.push('        <span class="ai-wizard-tag-cat">\u81EA\u7136\u6A21\u62DF</span>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="sway">\u690D\u88AB\u6447\u66F3</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="starline">\u661F\u7A7A\u8FDE\u7EBF</button>');
      content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="petal">\u82B1\u74E3\u98D8\u843D</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u89C6\u89C9\u7EB5\u6DF1</div>');
      content.push('      <div class="ai-wizard-opt-row">');
      content.push('        <button class="ai-wizard-opt" data-group="layers" data-val="one">\u5E73\u9762</button>');
      content.push('        <button class="ai-wizard-opt active" data-group="layers" data-val="two">\u8FDC\u8FD1</button>');
      content.push('        <button class="ai-wizard-opt" data-group="layers" data-val="three">\u7EB5\u6DF1</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u955C\u5934\u8BED\u8A00</div>');
      content.push('      <div class="ai-wizard-opt-row">');
      content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="zoom">\u7F13\u6162\u63A8\u62C9</button>');
      content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="pan">\u6A2A\u79FB\u8FD0\u955C</button>');
      content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="focus">\u7126\u70B9\u5207\u6362</button>');
      content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="angle">\u4FEF\u4EF0\u89C6\u89D2</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u6784\u56FE\u7248\u5F0F</div>');
      content.push('      <div class="ai-wizard-tag-grid">');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="center">\u5C45\u4E2D</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="symmetry">\u5BF9\u79F0</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="diagonal">\u5BF9\u89D2\u7EBF</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="circle">\u5706\u5F62</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="ring">\u73AF\u5F62</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="rule-of-thirds">\u4E09\u5206\u6CD5</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="golden-ratio">\u9EC4\u91D1\u5206\u5272</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="frame">\u6846\u67B6\u5F0F</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="radial">\u653E\u5C04\u7EBF</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="s-curve">S \u5F62</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="triangle">\u4E09\u89D2\u5F62</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="scatter">\u6563\u70B9\u5F0F</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="full-bleed">\u6EE1\u7248</button>');
      content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="whitespace">\u7559\u767D</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push('    <div class="ai-wizard-opt-group">');
      content.push('      <div class="ai-wizard-opt-label">\u6027\u80FD\u53D6\u5411</div>');
      content.push('      <div class="ai-wizard-opt-row">');
      content.push('        <button class="ai-wizard-opt active" data-group="perf" data-val="smooth">\u6D41\u7545\u4F18\u5148</button>');
      content.push('        <button class="ai-wizard-opt" data-group="perf" data-val="quality">\u6548\u679C\u4F18\u5148</button>');
      content.push("      </div>");
      content.push("    </div>");
      content.push("  </div>");
      content.push('  <div class="ai-wizard-desc-hint">Ctrl+Enter \u5FEB\u901F\u751F\u6210</div>');
      content.push('  <div class="ai-wizard-btn-row">');
      content.push('    <button class="ai-wizard-btn primary" id="wizNext1">\u751F\u6210 AI \u63D0\u793A\u8BCD \u2192</button>');
      content.push("  </div>");
      content.push("</div>");
      content.push('<div class="ai-wizard-body" id="wizardStep2" style="display:none">');
      content.push('  <div class="ai-wizard-hint">\u5C06\u4EE5\u4E0B\u63D0\u793A\u8BCD\u590D\u5236\u7ED9 AI\uFF08\u5982 WorkBuddy\u3001Claude\u3001GPT\uFF09\uFF0CAI \u4F1A\u5E2E\u4F60\u5199\u51FA\u5B8C\u6574\u7684\u4E3B\u9898\u4EE3\u7801\u3002</div>');
      content.push('  <div class="ai-wizard-prompt" id="wizPrompt"></div>');
      content.push('  <div class="ai-wizard-btn-row">');
      content.push('    <button class="ai-wizard-btn secondary" id="wizBack2">\u2190 \u8FD4\u56DE\u4FEE\u6539</button>');
      content.push('    <button class="ai-wizard-btn primary" id="wizCopy">\u{1F4CB} \u590D\u5236\u5230\u526A\u8D34\u677F</button>');
      content.push("  </div>");
      content.push("</div>");
      content.push('<div class="ai-wizard-body" id="wizardStep3" style="display:none">');
      content.push('  <div class="ai-wizard-done-icon">\u2705</div>');
      content.push('  <h3 class="ai-wizard-done-title">\u63D0\u793A\u8BCD\u5DF2\u590D\u5236</h3>');
      content.push('  <div class="ai-wizard-done-steps">');
      content.push('    <div class="ai-wizard-done-step">');
      content.push('      <span class="ai-wizard-done-num">1</span>');
      content.push("      <span>\u5C06\u63D0\u793A\u8BCD\u7C98\u8D34\u7ED9 AI\uFF0C\u83B7\u53D6\u5B8C\u6574 <code>.js</code> \u4EE3\u7801</span>");
      content.push("    </div>");
      content.push('    <div class="ai-wizard-done-step">');
      content.push('      <span class="ai-wizard-done-num">2</span>');
      content.push('      <span>\u5728 Vault \u7684 <code>\u7AF9\u6797\u590D\u76D8\u4E3B\u9898/</code> \u6587\u4EF6\u5939\u4E2D\u4FDD\u5B58\u4E3A <code id="wizFileName">\u4E3B\u9898.js</code></span>');
      content.push("    </div>");
      content.push('    <div class="ai-wizard-done-step">');
      content.push('      <span class="ai-wizard-done-num">3</span>');
      content.push("      <span>\u56DE\u5230\u8FD9\u91CC\uFF0C\u5728\u300C\u4E3B\u9898\u52A8\u6548\u300D\u9762\u677F\u4E2D\u5207\u6362\u4F60\u521B\u5EFA\u7684\u4E3B\u9898</span>");
      content.push("    </div>");
      content.push("  </div>");
      content.push('  <div class="ai-wizard-btn-row">');
      content.push('    <button class="ai-wizard-btn secondary" id="wizBack3">\u2190 \u8FD4\u56DE\u67E5\u770B\u63D0\u793A\u8BCD</button>');
      content.push('    <button class="ai-wizard-btn primary" id="wizDone">\u5B8C\u6210</button>');
      content.push("  </div>");
      content.push("</div>");
      content.push("</div>");
      PanelManager.open("ai-wizard", "AI \u8F85\u52A9\u521B\u5EFA\u4E3B\u9898", content.join("\n"), {
        width: "460px",
        onClose: function() {
        }
      });
      var panel = byId("panel-ai-wizard");
      if (!panel) return;
      function generatePrompt(name, desc, opts, adv) {
        var darkModeInstructions = "";
        if (opts.darkMode === "auto") {
          darkModeInstructions = "\u4F7F\u7528 var(--theme-lum)\uFF08\u4EAE=80%, \u6697=22%\uFF09\u548C var(--theme-sat)\uFF08\u4EAE=35%, \u6697=25%\uFF09\u81EA\u52A8\u9002\u914D\u660E\u6697\uFF0C\u5199\u4E00\u5957\u4EE3\u7801\u5373\u53EF\u3002";
        } else if (opts.darkMode === "fine") {
          darkModeInstructions = '\u4F7F\u7528 [data-theme-mode="dark"] \u5C5E\u6027\u9009\u62E9\u5668\u5206\u522B\u7F16\u5199\u4EAE\u8272\u548C\u6697\u8272\u4E24\u5957 CSS\uFF0C\u4EAE\u8272\u7528\u6D45\u8272\u80CC\u666F\u3001\u6DF1\u8272\u6587\u5B57\uFF0C\u6697\u8272\u7528\u6DF1\u8272\u80CC\u666F\u3001\u6D45\u8272\u6587\u5B57\u3002wrapper \u5143\u7D20\u4E0A\u8BBE\u6709 data-theme-mode="light"|"dark"\u3002';
        } else {
          darkModeInstructions = "\u4E0D\u9700\u8981\u5904\u7406\u6697\u8272\u6A21\u5F0F\uFF0C\u4FDD\u6301\u56FA\u5B9A\u989C\u8272\u5373\u53EF\u3002";
        }
        var animInstructions = "";
        if (opts.anim === "none") {
          animInstructions = "\u4E0D\u9700\u8981\u4EFB\u4F55\u52A8\u753B\u6548\u679C\uFF0C\u7EAF\u9759\u6001\u753B\u9762\u3002";
        } else if (opts.anim === "light") {
          animInstructions = "\u4F7F\u7528 1-2 \u4E2A\u7B80\u5355\u7684 CSS animation\uFF08\u5982\u6DE1\u5165\u3001\u7F13\u6162\u6F02\u79FB\u3001\u547C\u5438\u6548\u679C\uFF09\uFF0C\u4E0D\u4F7F\u7528\u590D\u6742\u7684\u7C92\u5B50\u7CFB\u7EDF\u6216\u7269\u7406\u6A21\u62DF\u3002";
        } else {
          animInstructions = "\u53EF\u4EE5\u4F7F\u7528\u4E30\u5BCC\u7684\u52A8\u753B\u6548\u679C\uFF1ACSS animation\u3001requestAnimationFrame \u5FAA\u73AF\u3001\u7C92\u5B50\u6548\u679C\u7B49\uFF0C\u8FFD\u6C42\u89C6\u89C9\u51B2\u51FB\u529B\u3002";
        }
        var complexityInstructions = "";
        if (opts.complexity === "simple") {
          complexityInstructions = "\u4FDD\u6301\u753B\u9762\u7B80\u7EA6\uFF0C\u7528\u7EAF\u8272\u6E10\u53D8\u548C\u5927\u8272\u5757\uFF0C\u5143\u7D20\u6570\u91CF\u63A7\u5236\u5728 3 \u4E2A\u4EE5\u5185\uFF0C\u4EE3\u7801\u7B80\u6D01\u3002";
        } else if (opts.complexity === "medium") {
          complexityInstructions = "\u753B\u9762\u5C42\u6B21\u9002\u4E2D\uFF0C\u53EF\u4EE5\u6709 4-8 \u4E2A\u89C6\u89C9\u5143\u7D20\uFF0C\u4F7F\u7528\u6E10\u53D8\u8272\u548C\u7B80\u5355\u51E0\u4F55\u56FE\u5F62\u3002";
        } else {
          complexityInstructions = "\u753B\u9762\u5143\u7D20\u4E30\u5BCC\uFF0C\u53EF\u4EE5\u7528\u591A\u5C42\u6E10\u53D8\u3001SVG \u56FE\u5F62\u3001\u7EB9\u7406\u7B49\u590D\u6742\u89C6\u89C9\u624B\u6BB5\u3002";
        }
        var advParts = [];
        if (adv.techniques && adv.techniques.length > 0) {
          var techMap = {
            "parallax": "\u89C6\u5DEE\u5206\u5C42\uFF08\u591A\u4E2A\u5143\u7D20\u4EE5\u4E0D\u540C\u901F\u5EA6\u8FD0\u52A8\u4EA7\u751F\u6DF1\u5EA6\u611F\uFF09",
            "fog": "\u96FE\u6C14\u98D8\u52A8\uFF08\u534A\u900F\u660E\u906E\u7F69\u5C42\u7F13\u6162\u5E73\u79FB\uFF0C\u5236\u9020\u6726\u80E7\u6C1B\u56F4\uFF09",
            "cloud": "\u4E91\u5C42\u6F02\u79FB\uFF08\u5927\u9762\u79EF\u67D4\u548C\u5F62\u72B6\u6A2A\u5411\u79FB\u52A8\uFF09",
            "dof": "\u666F\u6DF1\u6A21\u7CCA\uFF08\u524D\u666F/\u80CC\u666F\u6A21\u7CCA\uFF0C\u7A81\u51FA\u4E2D\u95F4\u4E3B\u4F53\uFF09",
            "gradient-breath": "\u6E10\u53D8\u547C\u5438\uFF08\u80CC\u666F\u8272\u5468\u671F\u6027\u6DF1\u6D45\u53D8\u5316\uFF09",
            "light-scan": "\u5149\u7EBF\u626B\u63CF\uFF08\u4E00\u9053\u5149\u675F\u626B\u8FC7\u753B\u9762\uFF09",
            "glow": "\u5149\u6655\u5F25\u6563\uFF08\u5149\u6E90\u5468\u56F4\u67D4\u548C\u7684\u5F84\u5411\u6E10\u53D8\u5149\u6655\uFF09",
            "pulse": "\u8109\u52A8\u95EA\u70C1\uFF08\u5143\u7D20\u5468\u671F\u6027\u660E\u6697\u6216\u5927\u5C0F\u53D8\u5316\uFF09",
            "particle": "\u7C92\u5B50\u6F02\u6D6E\uFF08\u5927\u91CF\u5C0F\u5706\u70B9\u6216\u5176\u4ED6\u5F62\u72B6\u968F\u673A\u6F02\u6D6E\u4E0A\u5347\uFF09",
            "ripple": "\u6D9F\u6F2A\u6CE2\u7EB9\uFF08\u4ECE\u4E2D\u5FC3\u5411\u5916\u6269\u6563\u7684\u5706\u5F62\u6CE2\u7EB9\uFF09",
            "snow": "\u96EA\u82B1\u98D8\u843D\uFF08\u767D\u8272\u7C92\u5B50\u4ECE\u9876\u90E8\u7F13\u6162\u4E0B\u843D\u5E76\u6C34\u5E73\u6F02\u79FB\uFF09",
            "fire": "\u706B\u7130\u95EA\u70C1\uFF08\u4E0D\u89C4\u5219\u5F62\u72B6\u7684\u6A59\u7EA2\u6696\u8272\u95EA\u70C1\u6548\u679C\uFF09",
            "svg": "SVG \u56FE\u5F62\uFF08\u7528\u5185\u8054 SVG \u7ED8\u5236\u51E0\u4F55\u56FE\u5F62\uFF09",
            "canvas": "Canvas \u6E32\u67D3\uFF08\u7528 JS Canvas \u7ED8\u5236\u590D\u6742\u52A8\u6001\u753B\u9762\uFF09",
            "3d": "3D \u900F\u89C6\uFF08CSS 3D transform \u8425\u9020\u7A7A\u95F4\u7EB5\u6DF1\u611F\uFF09",
            "geom": "\u51E0\u4F55\u53D8\u6362\uFF08\u56FE\u5F62\u7684\u65CB\u8F6C\u3001\u7F29\u653E\u3001\u4F4D\u79FB\u7EC4\u5408\uFF09",
            "sway": "\u690D\u88AB\u6447\u66F3\uFF08\u6811\u679D/\u8349\u53F6\u7684\u5468\u671F\u6027\u5F2F\u66F2\u6446\u52A8\uFF09",
            "starline": "\u661F\u7A7A\u8FDE\u7EBF\uFF08\u661F\u661F\u4E4B\u95F4\u7684\u8FDE\u7EBF\u3001\u661F\u5EA7\u56FE\u6548\u679C\uFF09",
            "petal": "\u82B1\u74E3\u98D8\u843D\uFF08\u82B1\u74E3\u5F62\u7C92\u5B50\u65CB\u8F6C\u98D8\u843D\uFF09"
          };
          var techDesc = adv.techniques.map(function(t) {
            return techMap[t] || t;
          });
          advParts.push("\u6280\u6CD5\uFF1A" + techDesc.join("\u3001"));
        }
        if (adv.layers) {
          var layerMap = { "one": "\u5355\u5C42\u5E73\u94FA\uFF0C\u6240\u6709\u5143\u7D20\u5728\u540C\u4E00\u5E73\u9762", "two": "\u53CC\u5C42\u7ED3\u6784\uFF1A\u4E3B\u4F53\u5C42 + \u80CC\u666F\u5C42", "three": "\u4E09\u5C42\u7ED3\u6784\uFF1A\u524D\u666F\u5C42 + \u4E3B\u4F53\u5C42 + \u80CC\u666F\u5C42\uFF0C\u5C42\u5C42\u53E0\u52A0\u4EA7\u751F\u7A7A\u95F4\u6DF1\u5EA6" };
          advParts.push("\u89C6\u89C9\u7EB5\u6DF1\uFF1A" + (layerMap[adv.layers] || "\u53CC\u5C42"));
        }
        if (adv.composition && adv.composition.length > 0) {
          var compMap = {
            "center": "\u5C45\u4E2D\u6784\u56FE\uFF08\u4E3B\u4F53\u4F4D\u4E8E\u753B\u9762\u6B63\u4E2D\u592E\uFF0C\u7A33\u5B9A\u3001\u805A\u7126\uFF09",
            "symmetry": "\u5BF9\u79F0\u6784\u56FE\uFF08\u5DE6\u53F3\u955C\u50CF\u5BF9\u79F0\uFF0C\u5E73\u8861\u3001\u5E84\u91CD\uFF09",
            "diagonal": "\u5BF9\u89D2\u7EBF\u6784\u56FE\uFF08\u5143\u7D20\u6CBF\u5BF9\u89D2\u7EBF\u5206\u5E03\uFF0C\u52A8\u611F\u3001\u5F20\u529B\uFF09",
            "circle": "\u5706\u5F62\u6784\u56FE\uFF08\u5143\u7D20\u56F4\u7ED5\u4E2D\u5FC3\u73AF\u5F62\u6392\u5217\uFF0C\u5FAA\u73AF\u3001\u805A\u7126\uFF09",
            "ring": "\u73AF\u5F62\u6784\u56FE\uFF08\u5143\u7D20\u6CBF\u73AF\u5F62\u8DEF\u5F84\u5206\u5E03\u8FD0\u52A8\uFF0C\u6D41\u52A8\u3001\u5FAA\u73AF\u611F\uFF09",
            "rule-of-thirds": "\u4E09\u5206\u6CD5\u6784\u56FE\uFF08\u4E5D\u5BAB\u683C\uFF0C\u4E3B\u4F53\u5728\u4EA4\u53C9\u70B9\uFF0C\u81EA\u7136\u8212\u9002\uFF09",
            "golden-ratio": "\u9EC4\u91D1\u5206\u5272\u6784\u56FE\uFF08\u5143\u7D20\u6CBF\u9EC4\u91D1\u6BD4\u4F8B\u7EBF\u5206\u5E03\uFF0C\u7ECF\u5178\u7F8E\u611F\uFF09",
            "frame": "\u6846\u67B6\u5F0F\u6784\u56FE\uFF08\u7528\u524D\u666F\u5143\u7D20\u6846\u4F4F\u4E3B\u4F53\uFF0C\u5982\u7A97\u6846\u3001\u6811\u679D\u3001\u62F1\u95E8\uFF09",
            "radial": "\u653E\u5C04\u7EBF\u6784\u56FE\uFF08\u4ECE\u4E2D\u5FC3\u5411\u5916\u8F90\u5C04\uFF0C\u89C6\u89C9\u7206\u53D1\u529B\uFF09",
            "s-curve": "S \u5F62\u6784\u56FE\uFF08\u5143\u7D20\u873F\u8712\u6D41\u52A8\u5206\u5E03\uFF0C\u4F18\u96C5\u3001\u5F15\u5BFC\u89C6\u7EBF\uFF09",
            "triangle": "\u4E09\u89D2\u5F62\u6784\u56FE\uFF08\u5143\u7D20\u5F62\u6210\u4E09\u89D2\u7A33\u5B9A\u7ED3\u6784\uFF09",
            "scatter": "\u6563\u70B9\u5F0F\u6784\u56FE\uFF08\u5143\u7D20\u5206\u6563\u81EA\u7531\u5206\u5E03\uFF0C\u8F7B\u677E\u81EA\u7136\uFF09",
            "full-bleed": "\u6EE1\u7248\u6784\u56FE\uFF08\u5143\u7D20\u586B\u6EE1\u6574\u4E2A\u753B\u9762\uFF0C\u9971\u6EE1\u3001\u6C89\u6D78\uFF09",
            "whitespace": "\u7559\u767D\u6784\u56FE\uFF08\u5927\u9762\u79EF\u7A7A\u767D\uFF0C\u6781\u7B80\u3001\u547C\u5438\u611F\uFF09"
          };
          var compDesc = adv.composition.map(function(c) {
            return compMap[c] || c;
          });
          advParts.push("\u6784\u56FE\u7248\u5F0F\uFF1A" + compDesc.join("\u3001"));
        }
        if (adv.camera && adv.camera.length > 0) {
          var camMap = {
            "zoom": "\u7F13\u6162\u63A8\u62C9\uFF08\u753B\u9762\u5468\u671F\u6027zoom in/out\uFF09",
            "pan": "\u6A2A\u79FB\u8FD0\u955C\uFF08\u753B\u9762\u5185\u5BB9\u6A2A\u5411\u5E73\u79FB\uFF09",
            "focus": "\u7126\u70B9\u5207\u6362\uFF08\u4E0D\u540C\u5143\u7D20\u95F4\u8F6E\u6D41\u805A\u7126/\u5931\u7126\uFF09",
            "angle": "\u4FEF\u4EF0\u89C6\u89D2\uFF08\u900F\u89C6\u89D2\u5EA6\u53D8\u5316\uFF0C\u4FEF\u77B0\u6216\u4EF0\u89C6\u611F\uFF09"
          };
          var camDesc = adv.camera.map(function(c) {
            return camMap[c] || c;
          });
          advParts.push("\u955C\u5934\u8BED\u8A00\uFF1A" + camDesc.join("\u3001"));
        }
        if (adv.perf) {
          advParts.push("\u6027\u80FD\u53D6\u5411\uFF1A" + (adv.perf === "smooth" ? "\u6D41\u7545\u4F18\u5148\uFF0C\u63A7\u5236\u5E27\u7387\u548C\u8BA1\u7B97\u91CF\uFF0C\u907F\u514D\u5361\u987F" : "\u6548\u679C\u4F18\u5148\uFF0C\u4E0D\u9650\u5236\u8BA1\u7B97\u590D\u6742\u5EA6\uFF0C\u8FFD\u6C42\u6781\u81F4\u89C6\u89C9\u6548\u679C"));
        }
        var advancedSection = advParts.length > 0 ? "\n\u3010\u9AD8\u7EA7\u8981\u6C42\u3011\n" + advParts.map(function(p) {
          return "- " + p;
        }).join("\n") + "\n" : "";
        return [
          "\u4F60\u662F\u4E00\u4F4D\u524D\u7AEF\u52A8\u6548\u4E13\u5BB6\uFF0C\u64C5\u957F CSS \u52A8\u753B\u548C\u89C6\u89C9\u6548\u679C\u3002\u8BF7\u5E2E\u6211\u521B\u5EFA\u4E00\u4E2A\u7AF9\u6797\u590D\u76D8\u63D2\u4EF6\u7684\u81EA\u5B9A\u4E49\u4E3B\u9898\u52A8\u6548\u6587\u4EF6\u3002",
          "",
          "\u3010\u6211\u7684\u9700\u6C42\u3011",
          "\u4E3B\u9898\u540D\u79F0\uFF1A" + name,
          "\u98CE\u683C\u63CF\u8FF0\uFF1A" + desc,
          "",
          "\u3010\u63A5\u53E3\u89C4\u8303\uFF08\u4E25\u683C\u9075\u5B88\uFF09\u3011",
          "- \u6587\u4EF6\u540D\uFF1A" + name + ".js",
          "- \u53D8\u91CF\u540D\uFF1Awindow.__bamboo_theme_" + name + " = { theme\u5BF9\u8C61 }",
          "- theme \u5BF9\u8C61\u5FC5\u987B\u5305\u542B\uFF1Aname\uFF08\u5B57\u7B26\u4E32\uFF09\u3001render()\uFF08\u8FD4\u56DE HTML \u5B57\u7B26\u4E32\uFF0C\u4F5C\u4E3A\u52A8\u6548\u5BB9\u5668\u7684 innerHTML\uFF09",
          "- \u53EF\u9009\uFF1Ainit(container)\uFF08\u521D\u59CB\u5316\u903B\u8F91\uFF0C\u5E73\u53F0\u4F20\u5165\u6839\u5143\u7D20\uFF09\u3001destroy()\uFF08\u6E05\u7406\u903B\u8F91\uFF0C\u5FC5\u987B\u6E05\u6240\u6709\u5B9A\u65F6\u5668\u548C GSAP tweens\uFF09",
          "- \u793A\u4F8B\u7ED3\u6784\uFF1A",
          "```js",
          "const theme = {",
          '  name: "' + name + '",',
          "  render() { return `<div>...</div>`; },",
          "  init(container) {},",
          "  destroy() {}",
          "};",
          "window.__bamboo_theme_" + name + " = theme;",
          "```",
          "",
          "\u3010\u8DDF\u968F\u4E3B\u9898\u8272\u3011",
          "- \u8272\u76F8\u8DDF\u968F\uFF1Ahsl(var(--accent-hue), \u9971\u548C\u5EA6%, \u660E\u5EA6%)",
          "- \u660E\u5EA6\u504F\u79FB\uFF1Acalc(L% + var(--accent-lightness-offset))",
          "",
          "\u3010\u5E73\u53F0 CSS \u53D8\u91CF\uFF08\u5FC5\u987B\u4F7F\u7528\uFF0C\u7981\u6B62\u786C\u7F16\u7801\uFF09\u3011",
          "- --theme-inner-radius\uFF1A\u5185\u6846\u5706\u89D2\uFF08\u5F53\u524D=26px\uFF09\uFF0C\u5BB9\u5668 border-radius \u5FC5\u987B\u7528 var(--theme-inner-radius)\uFF0C\u5916\u5C42\u6539\u5927\u65F6\u81EA\u52A8\u5BF9\u9F50",
          "- --accent-hue\uFF1A\u8272\u76F8\uFF08\u8DDF\u968F\u7528\u6237\u8272\u76F8\u6ED1\u5757\uFF09",
          "- --accent-lightness-offset\uFF1A\u660E\u5EA6\u504F\u79FB",
          "- --theme-lum\uFF1A\u660E\u6697\u81EA\u9002\u5E94\uFF08\u4EAE=80%, \u6697=22%\uFF09",
          "- --theme-sat\uFF1A\u9971\u548C\u5EA6\u81EA\u9002\u5E94\uFF08\u4EAE=35%, \u6697=25%\uFF09",
          "",
          "\u3010\u660E\u6697\u6A21\u5F0F\u3011",
          darkModeInstructions,
          "",
          "\u3010\u52A8\u6548\u7A0B\u5EA6\u3011",
          animInstructions,
          "",
          "\u3010\u753B\u9762\u590D\u6742\u5EA6\u3011",
          complexityInstructions,
          advancedSection,
          "\u3010\u8F93\u51FA\u8981\u6C42\u3011",
          "- \u53EA\u8F93\u51FA\u5B8C\u6574\u7684 .js \u6587\u4EF6\u5185\u5BB9\uFF0C\u6211\u53EF\u4EE5\u76F4\u63A5\u4FDD\u5B58\u4F7F\u7528",
          "- \u4E0D\u8981\u5305\u542B\u4EFB\u4F55\u89E3\u91CA\u3001\u6CE8\u91CA\u4E4B\u5916\u7684\u591A\u4F59\u6587\u5B57",
          "- HTML \u4F7F\u7528\u5185\u8054 style \u62FC\u63A5\uFF0C\u53EF\u4EE5\u5305\u542B <style> \u6807\u7B7E",
          "- \u52A8\u6548\u4F7F\u7528 requestAnimationFrame \u6216 CSS animation/@keyframes",
          "- \u5BB9\u5668\u5BBD\u5EA6\u5FC5\u987B\u4E3A 100%\uFF08\u81EA\u9002\u5E94\u7236\u7EA7\uFF0C\u7236\u7EA7\u5BBD\u5EA6 400~1600px \u52A8\u6001\u53D8\u5316\uFF09\uFF0C\u9AD8\u5EA6\u56FA\u5B9A 250~400px",
          "- \u5BB9\u5668 border-radius \u5FC5\u987B\u4F7F\u7528 var(--theme-inner-radius)\uFF08\u5E73\u53F0\u53D8\u91CF\uFF09\uFF0C\u7981\u6B62\u786C\u7F16\u7801\u5177\u4F53 px \u503C",
          "- \u5BB9\u5668\u5FC5\u987B\u8BBE\u7F6E overflow: hidden\uFF0C\u9632\u6B62\u52A8\u6548\u7A7F\u900F\u5706\u89D2\u8FB9\u754C",
          "- \u63A8\u8350\u52A0 contain: paint \u9694\u79BB\u7ED8\u5236\uFF0C\u63D0\u5347\u6E32\u67D3\u6027\u80FD",
          "- \u6240\u6709\u6C34\u5E73\u5B9A\u4F4D\u5FC5\u987B\u7528\u767E\u5206\u6BD4\u6216\u52A8\u6001\u8BA1\u7B97\uFF08container.offsetWidth\uFF09\uFF0C\u7981\u6B62\u4F7F\u7528\u56FA\u5B9A px \u5BBD\u5EA6",
          "- \u786E\u4FDD\u4EE3\u7801\u53EF\u4EE5\u76F4\u63A5\u8FD0\u884C\uFF0C\u4E0D\u4F7F\u7528\u672A\u58F0\u660E\u7684\u53D8\u91CF",
          "",
          "\u5F00\u59CB\u7F16\u5199\u3002"
        ].join("\n");
      }
      function showStep(n) {
        step = n;
        for (var i = 1; i <= 3; i++) {
          var body = panel.querySelector("#wizardStep" + i);
          if (body) body.style.display = i === n ? "" : "none";
        }
        var dots = panel.querySelectorAll(".ai-wizard-dot");
        dots.forEach(function(d, idx) {
          d.classList.toggle("active", idx + 1 <= n);
          d.classList.toggle("done", idx + 1 < n);
        });
        var stepsEl = panel.querySelector(".ai-wizard-steps");
        if (stepsEl) stepsEl.setAttribute("data-step", n);
      }
      var next1 = panel.querySelector("#wizNext1");
      if (next1) {
        next1.addEventListener("click", function() {
          var name = (panel.querySelector("#wizName").value || "").trim();
          var desc = (panel.querySelector("#wizDesc").value || "").trim();
          if (!name || !desc) {
            Toast.showToast("\u8BF7\u586B\u5199\u4E3B\u9898\u540D\u79F0\u548C\u98CE\u683C\u63CF\u8FF0", "warning");
            return;
          }
          var getOptVal = function(group) {
            var activeBtn = panel.querySelector('.ai-wizard-opt.active[data-group="' + group + '"]');
            return activeBtn ? activeBtn.dataset.val : "";
          };
          var getMultiVals = function(group) {
            var vals = [];
            panel.querySelectorAll('.ai-wizard-tag.active[data-group="' + group + '"]').forEach(function(b) {
              vals.push(b.dataset.val);
            });
            return vals;
          };
          var opts = {
            darkMode: getOptVal("darkMode") || "auto",
            anim: getOptVal("anim") || "light",
            complexity: getOptVal("complexity") || "medium"
          };
          var adv = {
            techniques: getMultiVals("technique"),
            layers: getOptVal("layers") || "two",
            composition: getMultiVals("comp"),
            camera: getMultiVals("camera"),
            perf: getOptVal("perf") || "smooth"
          };
          promptText = generatePrompt(name, desc, opts, adv);
          panel.querySelector("#wizPrompt").textContent = promptText;
          panel.querySelector("#wizFileName").textContent = name + ".js";
          showStep(2);
        });
      }
      function copyToClipboard(text, cb) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(cb).catch(function() {
            fallbackCopy(text, cb);
          });
        } else {
          fallbackCopy(text, cb);
        }
      }
      function fallbackCopy(text, cb) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        modalMount().appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        cb();
      }
      var copyBtn = panel.querySelector("#wizCopy");
      if (copyBtn) {
        copyBtn.addEventListener("click", function() {
          copyToClipboard(promptText, function() {
            Toast.showToast("\u63D0\u793A\u8BCD\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F", "success");
            showStep(3);
          });
        });
      }
      var back2 = panel.querySelector("#wizBack2");
      if (back2) {
        back2.addEventListener("click", function() {
          showStep(1);
        });
      }
      var back3 = panel.querySelector("#wizBack3");
      if (back3) {
        back3.addEventListener("click", function() {
          showStep(2);
        });
      }
      var doneBtn = panel.querySelector("#wizDone");
      if (doneBtn) {
        doneBtn.addEventListener("click", function() {
          PanelManager.close();
        });
      }
      var wizDesc = panel.querySelector("#wizDesc");
      if (wizDesc) {
        wizDesc.addEventListener("keydown", function(e) {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            var n1 = panel.querySelector("#wizNext1");
            if (n1) n1.click();
          }
        });
      }
      panel.querySelectorAll(".ai-wizard-opt").forEach(function(btn) {
        btn.addEventListener("click", function() {
          var group = btn.dataset.group;
          var isActive = btn.classList.contains("active");
          panel.querySelectorAll('.ai-wizard-opt[data-group="' + group + '"]').forEach(function(b) {
            b.classList.remove("active");
          });
          if (!isActive) {
            btn.classList.add("active");
          }
        });
      });
      panel.querySelectorAll(".ai-wizard-tag").forEach(function(btn) {
        btn.addEventListener("click", function() {
          btn.classList.toggle("active");
        });
      });
      var advToggle = panel.querySelector("#advToggle");
      var advBody = panel.querySelector("#advBody");
      if (advToggle && advBody) {
        advToggle.addEventListener("click", function() {
          var isOpen = advBody.style.display !== "none";
          if (isOpen) {
            advBody.querySelectorAll(".ai-wizard-tag.active").forEach(function(t) {
              t.classList.remove("active");
            });
            advBody.querySelectorAll(".ai-wizard-opt.active").forEach(function(o) {
              o.classList.remove("active");
            });
          }
          advBody.style.display = isOpen ? "none" : "";
          advToggle.innerHTML = "\u2699 \u9AD8\u7EA7\u9009\u9879 " + (isOpen ? "\u25B8" : "\u25BE");
        });
      }
    },
    destroy() {
      if (this._modeObserver) {
        this._modeObserver.disconnect();
        this._modeObserver = null;
        this._modeObserverActive = false;
      }
      this._intervals.forEach((id) => clearInterval(id));
      this._intervals = [];
    },
    /** 打开主题选择面板（FAB 菜单入口） */
    showThemePanel() {
      const themeList = this.getThemeList();
      const current = this.currentTheme;
      const cards = themeList.map((t) => `
            <button class="theme-panel-card ${t.id === current ? "active" : ""}"
                    data-theme="${t.id}"
                    title="${t.name}">
                <span class="theme-panel-card-name">${t.name}</span>
            </button>
        `).join("");
      var mode = this._getCurrentMode();
      var modeLabel = mode === "dark" ? "\u6697\u8272" : "\u4EAE\u8272";
      var cur = this._getModeSetting(current, mode);
      var hasTune = cur.hue !== null || cur.lightness !== null;
      var content = [
        '<div class="theme-panel-grid">',
        cards,
        "</div>",
        '<div class="theme-panel-tune">',
        '<div class="theme-tune-header">',
        '<span class="theme-tune-header-label">\u5F53\u524D\u4E3B\u9898\u989C\u8272 \xB7 ' + modeLabel + "</span>",
        hasTune ? '<button class="theme-tune-reset-all-btn" id="tuneResetAll">\u8DDF\u968F\u5168\u5C40</button>' : "",
        "</div>",
        '<div class="theme-tune-row">',
        '<label class="theme-tune-name">\u8272\u76F8</label>',
        '<input type="range" class="theme-tune-slider" id="tuneHue" min="0" max="359" value="' + (cur.hue !== null ? cur.hue : "") + '" data-key="hue">',
        '<span class="theme-tune-val" id="tuneHueVal">' + (cur.hue !== null ? cur.hue + "\xB0" : "\u81EA\u52A8") + "</span>",
        '<button class="theme-tune-reset" id="tuneHueReset" style="display:' + (cur.hue !== null ? "" : "none") + '">\u590D\u4F4D</button>',
        "</div>",
        '<div class="theme-tune-row">',
        '<label class="theme-tune-name">\u660E\u5EA6</label>',
        '<input type="range" class="theme-tune-slider" id="tuneLight" min="-30" max="30" value="' + (cur.lightness !== null ? cur.lightness : "0") + '" data-key="lightness">',
        '<span class="theme-tune-val" id="tuneLightVal">' + (cur.lightness !== null ? (cur.lightness > 0 ? "+" : "") + cur.lightness + "%" : "\u81EA\u52A8") + "</span>",
        '<button class="theme-tune-reset" id="tuneLightReset" style="display:' + (cur.lightness !== null ? "" : "none") + '">\u590D\u4F4D</button>',
        "</div>",
        "</div>",
        '<div class="theme-panel-help">',
        '<button class="theme-panel-help-btn" id="themeHelpBtn">',
        "<span>\u5982\u4F55\u5236\u4F5C\u81EA\u5B9A\u4E49\u4E3B\u9898\uFF1F</span>",
        "</button>",
        "</div>"
      ].join("\n");
      PanelManager.open("theme", "\u4E3B\u9898\u52A8\u6548", content, {
        width: "400px",
        onClose: () => {
        }
      });
      var panel = byId("panel-theme");
      if (!panel) return;
      var el = this;
      panel.querySelectorAll(".theme-panel-card").forEach(function(btn) {
        btn.addEventListener("click", function() {
          var themeName = btn.dataset.theme;
          if (!themeName || themeName === el.currentTheme) return;
          el.switchTheme(themeName);
          PanelManager.close();
        });
      });
      var helpBtn = panel.querySelector("#themeHelpBtn");
      if (helpBtn) {
        helpBtn.addEventListener("click", function() {
          PanelManager.close();
          el.showThemeGuide();
        });
      }
      function setupSlider(sliderId, resetId, valId, key) {
        var slider = panel.querySelector(sliderId);
        var resetBtn = panel.querySelector(resetId);
        var valEl = panel.querySelector(valId);
        if (!slider) return;
        slider.addEventListener("input", function() {
          var v = parseInt(slider.value, 10);
          el._setThemeSetting(current, key, v);
          if (valEl) {
            if (key === "hue") valEl.textContent = v + "\xB0";
            else valEl.textContent = (v > 0 ? "+" : "") + v + "%";
          }
          if (resetBtn) resetBtn.style.display = "";
          var resetAllEl = panel.querySelector("#tuneResetAll");
          if (resetAllEl) resetAllEl.style.display = "";
        });
        if (resetBtn) {
          resetBtn.addEventListener("click", function() {
            el._setThemeSetting(current, key, null);
            slider.value = key === "lightness" ? "0" : "";
            if (valEl) valEl.textContent = "\u81EA\u52A8";
            resetBtn.style.display = "none";
            var curMode = el._getModeSetting(current, el._getCurrentMode());
            if (curMode.hue === null && curMode.lightness === null) {
              var resetAllEl = panel.querySelector("#tuneResetAll");
              if (resetAllEl) resetAllEl.style.display = "none";
            }
          });
        }
      }
      setupSlider("#tuneHue", "#tuneHueReset", "#tuneHueVal", "hue");
      setupSlider("#tuneLight", "#tuneLightReset", "#tuneLightVal", "lightness");
      var resetAllBtn2 = panel.querySelector("#tuneResetAllBtn");
      if (resetAllBtn2) {
        resetAllBtn2.addEventListener("click", function() {
          var s = el._themeSettings[current];
          if (s) {
            if (s.light) {
              s.light.hue = null;
              s.light.lightness = null;
            }
            if (s.dark) {
              s.dark.hue = null;
              s.dark.lightness = null;
            }
          }
          el._applyThemeVars(current);
          el._saveSettings();
          var hueSlider = panel.querySelector("#tuneHue");
          var lightSlider = panel.querySelector("#tuneLight");
          if (hueSlider) hueSlider.value = "";
          if (lightSlider) lightSlider.value = "0";
          var hv = panel.querySelector("#tuneHueVal");
          var lv = panel.querySelector("#tuneLightVal");
          if (hv) hv.textContent = "\u81EA\u52A8";
          if (lv) lv.textContent = "\u81EA\u52A8";
          var hr = panel.querySelector("#tuneHueReset");
          var lr = panel.querySelector("#tuneLightReset");
          if (hr) hr.style.display = "none";
          if (lr) lr.style.display = "none";
          resetAllBtn2.style.display = "none";
        });
      }
      if (!hasTune) {
        var ra = panel.querySelector("#tuneResetAll");
        if (ra) ra.style.display = "none";
      }
    }
  };
  window.ThemeEffects = ThemeEffects2;

  // assets/scripts/utils/NoisePlayer.js
  var NoisePlayer_exports = {};
  __export(NoisePlayer_exports, {
    NoisePlayer: () => NoisePlayer2
  });
  var NoisePlayer2 = {
    audioCtx: null,
    gainNode: null,
    sourceNode: null,
    filterNode: null,
    isPlaying: false,
    currentType: null,
    volume: 1,
    // 新增：音量控制 (0-1)
    _fadeTimer: null,
    // 初始化
    init() {
      this.currentType = StorageAdapter.get(StorageKeys.WHITENOISE_TYPE) || "bamboo";
      window.addEventListener("beforeunload", () => {
        if (this.audioCtx) {
          try {
            this.audioCtx.close();
          } catch (e) {
          }
          this.audioCtx = null;
        }
      });
    },
    // 获取或创建 AudioContext
    getAudioCtx() {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    },
    // 播放音效
    async play(typeId, noiseType, audioBuffer) {
      if (this.currentType === typeId && this.isPlaying) {
        return;
      }
      this.stop();
      const ctx = this.getAudioCtx();
      this.sourceNode = ctx.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.loop = true;
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = noiseType.filterType || "lowpass";
      this.filterNode.frequency.value = noiseType.filterFreq || 2e4;
      this.filterNode.Q.value = noiseType.filterQ || 0.1;
      this.gainNode = ctx.createGain();
      this.gainNode.gain.value = this.volume;
      this.sourceNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(ctx.destination);
      this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.3);
      this.sourceNode.start();
      this.currentType = typeId;
      StorageAdapter.set(StorageKeys.WHITENOISE_TYPE, typeId);
      StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, "true");
      this.isPlaying = true;
      return true;
    },
    // 暂停（淡出后停止）
    pause() {
      if (!this.isPlaying) return;
      this.isPlaying = false;
      StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, "false");
      const ctx = this.getAudioCtx();
      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      }
      if (this._fadeTimer) clearTimeout(this._fadeTimer);
      this._fadeTimer = setTimeout(() => {
        this._fadeTimer = null;
        if (!this.isPlaying) {
          this.stop();
        }
      }, 350);
    },
    // 停止播放
    stop() {
      if (this._fadeTimer) {
        clearTimeout(this._fadeTimer);
        this._fadeTimer = null;
      }
      if (this.sourceNode) {
        try {
          this.sourceNode.stop();
        } catch (e) {
        }
        this.sourceNode = null;
      }
      if (this.filterNode) {
        try {
          this.filterNode.disconnect();
        } catch (e) {
        }
        this.filterNode = null;
      }
      this.gainNode = null;
      this.isPlaying = false;
      StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, "false");
    },
    // 设置音量 (0-1)
    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1, vol));
      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(this.volume, this.getAudioCtx().currentTime + 0.1);
      }
    },
    // 获取当前音量
    getVolume() {
      return this.volume;
    },
    // 淡出并停止（用于定时器到期）
    fadeOut(durationSec = 2) {
      if (!this.isPlaying) return;
      const ctx = this.getAudioCtx();
      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec);
      }
      this.isPlaying = false;
      StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, "false");
      this._fadeTimer = setTimeout(() => {
        this.stop();
        this._fadeTimer = null;
      }, durationSec * 1e3 + 100);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => NoisePlayer2.init());
  } else {
    NoisePlayer2.init();
  }
  window.NoisePlayer = NoisePlayer2;

  // assets/scripts/utils/NoiseGenerator.js
  var NoiseGenerator_exports = {};
  __export(NoiseGenerator_exports, {
    NoiseGenerator: () => NoiseGenerator2
  });
  var NoiseGenerator2 = {
    _cache: /* @__PURE__ */ new Map(),
    // 生成（或从缓存获取）音效音频缓冲区
    generate(typeId, ctx) {
      if (this._cache.has(typeId)) return this._cache.get(typeId);
      const bufferSize = 5 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const sr = ctx.sampleRate;
      const generator = this._GENERATORS[typeId];
      if (generator) {
        generator(data, bufferSize, sr);
      } else {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        }
      }
      this._cache.set(typeId, buffer);
      return buffer;
    },
    // 优化后的音效生成算法
    _GENERATORS: {
      // 竹林：风声 + 竹叶摩擦 + 偶尔的鸟鸣
      bamboo(data, len, sr) {
        let windPhase = 0;
        for (let i = 0; i < len; i++) {
          const t = i / sr;
          const windLfo = 0.5 + 0.5 * Math.sin(t * 0.5) * Math.sin(t * 0.3);
          data[i] = (Math.random() * 2 - 1) * 0.25 * windLfo;
          windPhase++;
        }
        for (let pos = 0; pos < len; pos += Math.floor(sr * (0.1 + Math.random() * 0.3))) {
          const rustleLen = Math.floor(sr * (0.03 + Math.random() * 0.05));
          const intensity = 0.3 + Math.random() * 0.4;
          for (let j = 0; j < rustleLen && pos + j < len; j++) {
            const env = Math.sin(Math.PI * j / rustleLen) * intensity;
            data[pos + j] += (Math.random() * 2 - 1) * env;
          }
        }
        for (let i = 0; i < 3; i++) {
          const birdPos = Math.floor(Math.random() * (len - sr * 0.5));
          const birdFreq = 2e3 + Math.random() * 2e3;
          const birdLen = Math.floor(sr * 0.05);
          for (let j = 0; j < birdLen && birdPos + j < len; j++) {
            const env = Math.sin(Math.PI * j / birdLen) * 0.08;
            data[birdPos + j] += Math.sin(2 * Math.PI * birdFreq * j / sr) * env;
          }
        }
        let last = 0;
        for (let i = 0; i < len; i++) {
          data[i] = data[i] * 0.7 + last * 0.3;
          last = data[i];
        }
      },
      // 溪流：流水声 + 随机水滴 + 立体声效果
      stream(data, len, sr) {
        for (let i = 0; i < len; i++) {
          const t = i / sr;
          const flowLfo = 0.6 + 0.4 * Math.sin(t * 0.8) * Math.sin(t * 0.5);
          data[i] = (Math.random() * 2 - 1) * 0.4 * flowLfo;
        }
        let filtered = 0;
        for (let i = 0; i < len; i++) {
          filtered = filtered * 0.95 + data[i] * 0.05;
          data[i] = filtered;
        }
        for (let pos = 0; pos < len; pos += Math.floor(sr * (0.2 + Math.random() * 0.8))) {
          if (Math.random() < 0.4) {
            const dropLen = Math.floor(sr * 0.02);
            const dropFreq = 3e3 + Math.random() * 4e3;
            for (let j = 0; j < dropLen && pos + j < len; j++) {
              const env = Math.exp(-j / (dropLen * 0.3)) * 0.2;
              data[pos + j] += Math.sin(2 * Math.PI * dropFreq * j / sr) * env;
            }
          }
        }
        for (let i = 0; i < 5; i++) {
          const gurglePos = Math.floor(Math.random() * (len - sr * 0.3));
          const gurgleLen = Math.floor(sr * 0.15);
          const gurgleFreq = 100 + Math.random() * 150;
          for (let j = 0; j < gurgleLen && gurglePos + j < len; j++) {
            const env = Math.sin(Math.PI * j / gurgleLen) * 0.15;
            data[gurglePos + j] += Math.sin(2 * Math.PI * gurgleFreq * j / sr) * env;
          }
        }
      },
      // 夜虫：多种虫鸣模式 + 随机间隔 + 立体声效果
      crickets(data, len, sr) {
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.05;
        }
        const cricketPatterns = [
          { freq: 3800, interval: 0.15, count: 3 },
          // 蟋蟀A
          { freq: 4200, interval: 0.18, count: 4 },
          // 蟋蟀B
          { freq: 3500, interval: 0.22, count: 2 },
          // 蛐蛐
          { freq: 4500, interval: 0.12, count: 5 }
          // 蝈蝈
        ];
        cricketPatterns.forEach((pattern) => {
          const pulseInterval = Math.floor(sr * pattern.interval);
          const pulseLen = Math.floor(sr * 0.035);
          const freq = pattern.freq + (Math.random() - 0.5) * 200;
          for (let start = Math.floor(Math.random() * sr); start + pulseLen < len; start += pulseInterval * (0.8 + Math.random() * 0.4)) {
            const count = pattern.count + Math.floor(Math.random() * 2);
            for (let n = 0; n < count; n++) {
              const offset = start + n * Math.floor(sr * 0.01);
              if (offset + pulseLen >= len) break;
              for (let j = 0; j < pulseLen; j++) {
                const env = Math.sin(Math.PI * j / pulseLen) * 0.2;
                data[offset + j] += Math.sin(2 * Math.PI * freq * j / sr) * env;
              }
            }
            start += Math.floor((Math.random() - 0.5) * sr * 0.3);
          }
        });
        for (let i = 0; i < 2; i++) {
          const chirpPos = Math.floor(Math.random() * (len - sr * 0.5));
          const chirpLen = Math.floor(sr * 0.4);
          const chirpFreq = 5e3 + Math.random() * 1e3;
          for (let j = 0; j < chirpLen && chirpPos + j < len; j++) {
            const freqMod = chirpFreq + Math.sin(2 * Math.PI * j / sr * 10) * 500;
            const env = Math.sin(Math.PI * j / chirpLen) * 0.1;
            data[chirpPos + j] += Math.sin(2 * Math.PI * freqMod * j / sr) * env;
          }
        }
      },
      // 篝火：噼啪声 + 低频嗡嗡声 + 火焰摇曳
      campfire(data, len, sr) {
        let rolling = 0;
        const smooth = 0.98;
        for (let i = 0; i < len; i++) {
          const raw = (Math.random() * 2 - 1) * 0.5;
          rolling = rolling * smooth + raw * (1 - smooth);
          data[i] = rolling * 0.6;
        }
        for (let i = 0; i < len; i++) {
          const t = i / sr;
          const flicker = 1 + 0.3 * Math.sin(t * 3.5) * Math.sin(t * 2.1);
          data[i] *= flicker;
        }
        const crackleCount = 15 + Math.floor(Math.random() * 10);
        for (let n = 0; n < crackleCount; n++) {
          const pos = Math.floor(Math.random() * (len - sr * 0.05));
          const crackLen = Math.floor(sr * (3e-3 + Math.random() * 0.015));
          const crackAmp = 0.3 + Math.random() * 0.5;
          for (let j = 0; j < crackLen && pos + j < len; j++) {
            const env = Math.exp(-j / (crackLen * 0.2)) * crackAmp;
            data[pos + j] += (Math.random() * 2 - 1) * env;
          }
        }
        for (let i = 0; i < len; i++) {
          const t = i / sr;
          const humFreq = 60 + Math.sin(t * 0.5) * 10;
          data[i] += Math.sin(2 * Math.PI * humFreq * i / sr) * 0.08;
        }
        let last = 0;
        for (let i = 0; i < len; i++) {
          data[i] = data[i] * 0.8 + last * 0.2;
          last = data[i];
        }
      }
    }
  };
  window.NoiseGenerator = NoiseGenerator2;

  // assets/scripts/utils/NoisePanel.js
  var NoisePanel_exports = {};
  __export(NoisePanel_exports, {
    NoisePanel: () => NoisePanel2
  });
  var NoisePanel2 = {
    panelEl: null,
    panelVisible: false,
    _keydownHandler: null,
    _outsideClickHandler: null,
    // 显示面板
    show() {
      if (!this.panelEl) {
        this.create();
      }
      this.panelEl.classList.add("active");
      this.panelVisible = true;
      if (!this._keydownHandler) {
        this._keydownHandler = (e) => {
          if (e.key === "Escape" && this.panelVisible) {
            e.preventDefault();
            this.hide();
          }
        };
      }
      document.addEventListener("keydown", this._keydownHandler);
      this._rebuild();
    },
    // 隐藏面板
    hide() {
      if (this.panelEl) {
        this.panelEl.classList.remove("active");
      }
      this.panelVisible = false;
      if (this._keydownHandler) {
        document.removeEventListener("keydown", this._keydownHandler);
        this._keydownHandler = null;
      }
    },
    // 切换面板显示/隐藏
    toggle() {
      if (this.panelVisible) {
        this.hide();
      } else {
        this.show();
      }
    },
    // 创建面板DOM
    create() {
      this.panelEl = document.createElement("div");
      this.panelEl.className = "wn-panel";
      let overlay = byId("bamboo-floating-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "bamboo-floating-overlay";
        overlay.className = "bamboo-floating-overlay";
        modalMount().appendChild(overlay);
      }
      overlay.appendChild(this.panelEl);
      this.panelEl.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      this._outsideClickHandler = (e) => {
        if (this.panelVisible && this.panelEl && !eventInTargets2(e, this.panelEl)) {
          this.hide();
        }
      };
      setTimeout(() => {
        document.addEventListener("click", this._outsideClickHandler);
      }, 10);
      this._rebuild();
    },
    // 渲染面板HTML
    renderHTML() {
      const currentType = NoisePlayer.currentType;
      const isPlaying = NoisePlayer.isPlaying;
      const customNoises = WhiteNoiseManager.customNoises || [];
      const builtinItems = WhiteNoiseManager.NOISE_TYPES.map((t) => {
        const isActive = currentType === t.id && isPlaying;
        return '<button class="wn-type-btn ' + (isActive ? "active" : "") + '" data-type="' + t.id + '"><span>' + t.name + "</span></button>";
      }).join("");
      const builtinSection = '<div class="wn-section"><div class="wn-type-grid">' + builtinItems + "</div></div>";
      const customItems = customNoises.map((t) => {
        const isActive = currentType === t.id && isPlaying;
        return '<button class="wn-type-btn ' + (isActive ? "active" : "") + '" data-type="' + t.id + '"><span class="wn-btn-content"><span class="wn-btn-text">' + t.name + '</span><span class="wn-btn-group"><span class="wn-rename-btn" data-rename="' + t.id + '" title="\u91CD\u547D\u540D">' + LucideUtils.createIcon("edit", { size: 10 }) + '</span><span class="wn-delete-btn" data-delete="' + t.id + '">' + LucideUtils.createIcon("trash", { size: 10 }) + "</span></span></span></button>";
      }).join("");
      const customSection = '<div class="wn-section"><div class="wn-section-header"><span>\u81EA\u5B9A\u4E49</span><button class="wn-add-custom-btn" id="wnAddCustomBtn" title="\u6DFB\u52A0\u81EA\u5B9A\u4E49\u97F3\u6E90">' + LucideUtils.createIcon("plus", { size: 12 }) + '</button></div><div class="wn-type-grid">' + customItems + "</div></div>";
      const volumeSection = '<div class="wn-section wn-volume-section"><div class="wn-section-header">' + LucideUtils.createIcon("volume", { size: 12 }) + '<span>\u97F3\u91CF</span></div><div class="wn-volume-control"><input type="range" class="wn-volume-slider" id="wnVolumeSlider" min="0" max="100" value="' + Math.round(NoisePlayer.getVolume() * 100) + '"><span class="wn-volume-label" id="wnVolumeLabel">' + Math.round(NoisePlayer.getVolume() * 100) + "%</span></div></div>";
      const timerMinutes = WhiteNoiseManager.timerMinutes || 0;
      const timerText = timerMinutes > 0 ? this._formatTimerDisplay(WhiteNoiseManager.getTimerRemaining()) : "\u5173\u95ED";
      const timerSection = '<div class="wn-section wn-timer-section"><div class="wn-section-header">' + LucideUtils.createIcon("clock", { size: 12 }) + '<span>\u5B9A\u65F6</span></div><div class="wn-timer-control"><button class="wn-timer-btn" id="wnTimerBtn" title="\u70B9\u51FB\u5207\u6362\u5B9A\u65F6\u65F6\u957F">' + timerText + '</button><button class="wn-timer-change-btn" id="wnTimerPrev" title="\u51CF\u5C11\u65F6\u957F">\u2212</button><button class="wn-timer-change-btn" id="wnTimerNext" title="\u589E\u52A0\u65F6\u957F">+</button></div></div>';
      return '<div class="wn-header"><div class="wn-header-left">' + LucideUtils.createIcon("volume", { size: 16 }) + '<span>\u767D\u566A\u97F3</span></div><button class="wn-close-btn" id="wnCloseBtn">' + LucideUtils.createIcon("x", { size: 14 }) + '</button></div><div class="wn-body">' + builtinSection + customSection + volumeSection + timerSection + "</div>";
    },
    // 更新面板UI（局部更新，避免全量重建DOM）
    updateUI() {
      if (!this.panelEl || !this.panelVisible) return;
      const currentType = NoisePlayer.currentType;
      const isPlaying = NoisePlayer.isPlaying;
      this.panelEl.querySelectorAll(".wn-type-btn[data-type]").forEach((btn) => {
        const typeId = btn.dataset.type;
        const isActive = currentType === typeId && isPlaying;
        btn.classList.toggle("active", isActive);
      });
    },
    // 更新定时器UI（不重建整个面板）
    updateTimerUI() {
      const timerBtn = this.panelEl && this.panelEl.querySelector("#wnTimerBtn");
      if (!timerBtn) {
        if (this.panelEl) this._rebuild();
        return;
      }
      const timerMinutes = WhiteNoiseManager.timerMinutes || 0;
      if (timerMinutes > 0) {
        const remaining = WhiteNoiseManager.getTimerRemaining();
        timerBtn.textContent = this._formatTimerDisplay(remaining);
        timerBtn.classList.add("wn-timer-active");
      } else {
        timerBtn.textContent = "\u5173\u95ED";
        timerBtn.classList.remove("wn-timer-active");
      }
    },
    // 格式化倒计时显示 (mm:ss)
    _formatTimerDisplay(totalSec) {
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return m + ":" + String(s).padStart(2, "0");
    },
    // 全量重建面板（仅在列表数据变化时调用）
    _rebuild() {
      if (!this.panelEl) return;
      this.panelEl.innerHTML = this.renderHTML();
      this._bindEvents();
    },
    // 绑定面板事件
    _bindEvents() {
      if (!this.panelEl) return;
      this.panelEl.querySelectorAll(".wn-type-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const renameBtn = e.target.closest(".wn-rename-btn");
          if (renameBtn) {
            e.stopPropagation();
            WhiteNoiseManager.renameCustomNoise(renameBtn.dataset.rename);
            return;
          }
          const deleteBtn = e.target.closest(".wn-delete-btn");
          if (deleteBtn) {
            e.stopPropagation();
            WhiteNoiseManager.removeCustomNoise(deleteBtn.dataset.delete);
            return;
          }
          const typeId = btn.dataset.type;
          if (NoisePlayer.isPlaying && NoisePlayer.currentType === typeId) {
            WhiteNoiseManager.pause();
          } else {
            WhiteNoiseManager.play(typeId);
          }
        });
      });
      const addBtn = this.panelEl.querySelector("#wnAddCustomBtn");
      if (addBtn) {
        addBtn.addEventListener("click", () => WhiteNoiseManager.addCustomNoise());
      }
      const closeBtn = this.panelEl.querySelector("#wnCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.hide());
      }
      const volumeSlider = this.panelEl.querySelector("#wnVolumeSlider");
      if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
          const vol = parseInt(e.target.value) / 100;
          NoisePlayer.setVolume(vol);
          const label = this.panelEl.querySelector("#wnVolumeLabel");
          if (label) label.textContent = Math.round(vol * 100) + "%";
        });
      }
      const timerBtn = this.panelEl.querySelector("#wnTimerBtn");
      if (timerBtn) {
        timerBtn.addEventListener("click", () => {
          const opts = WhiteNoiseManager.TIMER_OPTIONS;
          const curr = WhiteNoiseManager.timerMinutes || 0;
          const idx = opts.indexOf(curr);
          const next = opts[(idx + 1) % opts.length];
          WhiteNoiseManager.setTimer(next);
        });
      }
      const timerPrev = this.panelEl.querySelector("#wnTimerPrev");
      const timerNext = this.panelEl.querySelector("#wnTimerNext");
      if (timerPrev) {
        timerPrev.addEventListener("click", (e) => {
          e.stopPropagation();
          const curr = WhiteNoiseManager.timerMinutes || 15;
          const step = curr >= 30 ? 15 : 5;
          WhiteNoiseManager.setTimer(Math.max(5, curr - step));
        });
      }
      if (timerNext) {
        timerNext.addEventListener("click", (e) => {
          e.stopPropagation();
          const curr = WhiteNoiseManager.timerMinutes || 0;
          const step = curr >= 30 ? 15 : 5;
          WhiteNoiseManager.setTimer(Math.min(120, curr + step));
        });
      }
    }
  };
  window.NoisePanel = NoisePanel2;

  // assets/scripts/utils/whiteNoiseManager.js
  var whiteNoiseManager_exports = {};
  __export(whiteNoiseManager_exports, {
    WhiteNoiseManager: () => WhiteNoiseManager2
  });
  var WhiteNoiseManager2 = {
    NOISE_TYPES: [
      {
        id: "bamboo",
        name: "\u7AF9\u6797",
        filterType: "bandpass",
        filterFreq: 1200,
        filterQ: 0.4
      },
      {
        id: "stream",
        name: "\u6EAA\u6D41",
        filterType: "lowpass",
        filterFreq: 800,
        filterQ: 0.3
      },
      {
        id: "crickets",
        name: "\u591C\u866B",
        filterType: "bandpass",
        filterFreq: 3500,
        filterQ: 1.2
      },
      {
        id: "campfire",
        name: "\u7BDD\u706B",
        filterType: "lowpass",
        filterFreq: 500,
        filterQ: 0.5
      }
    ],
    customNoises: [],
    _ticketStubEl: null,
    timerMinutes: 0,
    // 定时分钟数，0=关闭
    _timerInterval: null,
    // setInterval id
    _timerEndAt: null,
    // 定时到期时间戳
    // 初始化
    async init() {
      if (typeof storageManager !== "undefined" && storageManager.getCustomNoises) {
        try {
          await storageManager.initPromise;
        } catch (e) {
        }
        const saved = storageManager.getCustomNoises();
        this.customNoises = Array.isArray(saved) ? saved : [];
      } else {
        this.customNoises = JSON.parse(StorageAdapter.get(StorageKeys.WHITENOISE_CUSTOM) || "[]");
      }
      this._ticketStubEl = $(".ticket-stub");
      setTimeout(() => {
        this.updateTicketControlDisplay();
      }, 500);
      NoisePlayer.init();
      if (StorageAdapter.get(StorageKeys.WHITENOISE_PLAYING) === "true") {
        const savedType = NoisePlayer.currentType || "bamboo";
        setTimeout(() => {
          this.play(savedType).then(() => {
            this._restoreTimer();
          }).catch((e) => {
            console.warn("[Bamboo] \u6062\u590D\u767D\u566A\u97F3\u64AD\u653E\u5931\u8D25:", e);
            StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, "false");
          });
        }, 300);
      } else {
        this._restoreTimer();
      }
    },
    // 播放音效
    async play(typeId) {
      const noiseType = [...this.NOISE_TYPES, ...this.customNoises].find((t) => t.id === typeId);
      if (!noiseType) return;
      const ctx = NoisePlayer.getAudioCtx();
      let buffer;
      if (noiseType.source === "url") {
        try {
          Toast.showToast("\u6B63\u5728\u52A0\u8F7D\u5916\u90E8\u97F3\u6E90...", "info");
          const proxyUrl = location.origin + "/bamboo-audio-proxy?url=" + encodeURIComponent(noiseType.data);
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error("\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25");
          const arrayBuffer = await response.arrayBuffer();
          buffer = await ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
          console.error("Failed to load audio source:", e);
          if (e.name === "TimeoutError" || e.name === "AbortError") {
            Toast.showToast("\u97F3\u6E90\u52A0\u8F7D\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u72B6\u51B5", "error");
          } else if (e.message && e.message.includes("decode")) {
            Toast.showToast("\u97F3\u9891\u6587\u4EF6\u5DF2\u635F\u574F\u6216\u683C\u5F0F\u4E0D\u517C\u5BB9", "error");
          } else if (e.message && e.message.includes("fetch")) {
            Toast.showToast("\u65E0\u6CD5\u8FDE\u63A5\u97F3\u6E90\uFF0C\u94FE\u63A5\u53EF\u80FD\u5DF2\u5931\u6548", "error");
          } else {
            Toast.showToast("\u65E0\u6CD5\u64AD\u653E\u8BE5\u97F3\u6E90\uFF0C\u8BF7\u786E\u8BA4\u94FE\u63A5\u6709\u6548\u4E14\u652F\u6301\u8DE8\u57DF", "error");
          }
          return;
        }
      } else if (noiseType.source === "file") {
        try {
          Toast.showToast("\u6B63\u5728\u8BFB\u53D6\u672C\u5730\u6587\u4EF6...", "info");
          const isVaultPath = !noiseType.data.startsWith("/") && !noiseType.data.includes(":\\");
          const dataUrl = isVaultPath ? await this._requestVaultFileRead(noiseType.data) : await this._requestFileRead(noiseType.data);
          const response = await fetch(dataUrl);
          if (!response.ok) throw new Error("\u8BFB\u53D6\u5931\u8D25");
          const arrayBuffer = await response.arrayBuffer();
          buffer = await ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
          console.error("Failed to load local file:", e);
          if (e.message && e.message.includes("\u8D85\u65F6")) {
            Toast.showToast("\u8BFB\u53D6\u672C\u5730\u6587\u4EF6\u8D85\u65F6\uFF0C\u6587\u4EF6\u53EF\u80FD\u8FC7\u5927", "error");
          } else if (e.message && e.message.includes("decode")) {
            Toast.showToast("\u672C\u5730\u97F3\u9891\u6587\u4EF6\u5DF2\u635F\u574F\u6216\u683C\u5F0F\u4E0D\u517C\u5BB9", "error");
          } else {
            Toast.showToast("\u65E0\u6CD5\u8BFB\u53D6\u672C\u5730\u6587\u4EF6\uFF0C\u8BF7\u786E\u8BA4\u6587\u4EF6\u8DEF\u5F84\u6B63\u786E\u4E14\u4E3A\u6709\u6548\u97F3\u9891", "error");
          }
          return;
        }
      } else {
        buffer = NoiseGenerator.generate(typeId, ctx);
      }
      await NoisePlayer.play(typeId, noiseType, buffer);
      this.updateTicketStubState(true);
      NoisePanel.updateUI();
      this.updateTicketControlDisplay();
    },
    // 暂停
    pause() {
      NoisePlayer.pause();
      this.updateTicketStubState(false);
      NoisePanel.updateUI();
      this.updateTicketControlDisplay();
    },
    // 停止
    stop() {
      NoisePlayer.stop();
      this.updateTicketStubState(false);
      NoisePanel.updateUI();
      this.updateTicketControlDisplay();
    },
    // 切换播放/暂停
    toggle() {
      if (NoisePlayer.isPlaying) {
        this.pause();
      } else {
        const type = NoisePlayer.currentType || "bamboo";
        this.play(type);
      }
    },
    // 上一个
    prev() {
      const all = [...this.NOISE_TYPES, ...this.customNoises];
      if (all.length === 0) return;
      const currentIndex = all.findIndex((t) => t.id === NoisePlayer.currentType);
      const newIndex = currentIndex <= 0 ? all.length - 1 : currentIndex - 1;
      this.play(all[newIndex].id);
    },
    // 下一个
    next() {
      const all = [...this.NOISE_TYPES, ...this.customNoises];
      if (all.length === 0) return;
      const currentIndex = all.findIndex((t) => t.id === NoisePlayer.currentType);
      const newIndex = currentIndex < 0 || currentIndex >= all.length - 1 ? 0 : currentIndex + 1;
      this.play(all[newIndex].id);
    },
    // 显示面板
    showPanel() {
      NoisePanel.show();
    },
    // 隐藏面板
    hidePanel() {
      NoisePanel.hide();
    },
    // 切换面板
    togglePanel() {
      NoisePanel.toggle();
    },
    // 更新悬浮菜单状态
    updateTicketStubState(isPlaying) {
      if (!this._ticketStubEl) {
        this._ticketStubEl = $(".ticket-stub");
      }
      if (this._ticketStubEl) {
        if (isPlaying) {
          this._ticketStubEl.classList.add("playing");
        } else {
          this._ticketStubEl.classList.remove("playing");
        }
      }
    },
    // 更新悬浮菜单显示
    updateTicketControlDisplay() {
      const noiseType = [...this.NOISE_TYPES, ...this.customNoises].find((t) => t.id === NoisePlayer.currentType);
      const nameEls = $$(".stub-nc-name");
      if (noiseType) {
        nameEls.forEach((el) => {
          el.textContent = noiseType.name;
        });
      }
    },
    // ===== 定时停止 =====
    // 定时选项（分钟）
    TIMER_OPTIONS: [0, 15, 30, 45, 60],
    // 设置/切换定时器
    setTimer(minutes) {
      this.clearTimer();
      this.timerMinutes = minutes;
      if (minutes <= 0) {
        StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
        NoisePanel.updateTimerUI();
        return;
      }
      this._timerEndAt = Date.now() + minutes * 6e4;
      StorageAdapter.set(StorageKeys.WHITENOISE_TIMER, JSON.stringify({ minutes, endAt: this._timerEndAt }));
      this._timerInterval = setInterval(() => {
        const remaining = Math.max(0, this._timerEndAt - Date.now());
        if (remaining <= 0) {
          this._onTimerExpired();
          return;
        }
        NoisePanel.updateTimerUI();
      }, 1e3);
      NoisePanel.updateTimerUI();
      Toast.showToast(`\u5DF2\u8BBE\u7F6E ${minutes} \u5206\u949F\u5B9A\u65F6\u505C\u6B62`, "info");
    },
    // 清除定时器
    clearTimer() {
      if (this._timerInterval) {
        clearInterval(this._timerInterval);
        this._timerInterval = null;
      }
      this.timerMinutes = 0;
      this._timerEndAt = null;
      StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
    },
    // 获取剩余秒数
    getTimerRemaining() {
      if (!this._timerEndAt) return 0;
      return Math.max(0, Math.ceil((this._timerEndAt - Date.now()) / 1e3));
    },
    // 定时器到期
    _onTimerExpired() {
      this.clearTimer();
      NoisePlayer.fadeOut(2);
      this.updateTicketStubState(false);
      this.updateTicketControlDisplay();
      NoisePanel.updateTimerUI();
      Toast.showToast("\u5B9A\u65F6\u7ED3\u675F\uFF0C\u5DF2\u505C\u6B62\u64AD\u653E", "info");
    },
    // 从 localStorage 恢复定时器（页面刷新后）
    _restoreTimer() {
      const saved = StorageAdapter.get(StorageKeys.WHITENOISE_TIMER);
      if (!saved) return;
      try {
        const { minutes, endAt } = JSON.parse(saved);
        if (!minutes || !endAt) return;
        const remaining = endAt - Date.now();
        if (remaining <= 0) {
          StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
          return;
        }
        if (NoisePlayer.isPlaying) {
          this.timerMinutes = minutes;
          this._timerEndAt = endAt;
          this._timerInterval = setInterval(() => {
            const r = Math.max(0, this._timerEndAt - Date.now());
            if (r <= 0) {
              this._onTimerExpired();
              return;
            }
            NoisePanel.updateTimerUI();
          }, 1e3);
          NoisePanel.updateTimerUI();
        } else {
          StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
        }
      } catch (e) {
        StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
      }
    },
    // 添加自定义音源
    async addCustomNoise() {
      const result = await this._showAddNoiseModal();
      if (!result) return;
      const { name, source, url, filepath } = result;
      if (!name.trim()) return;
      let data, sourceType;
      if (source === "file") {
        data = filepath.trim();
        sourceType = "file";
      } else {
        data = url.trim();
        sourceType = "url";
      }
      if (!data) return;
      const formatErr = this._checkAudioFormat(data);
      if (formatErr) {
        Toast.showToast(formatErr, "error");
        return;
      }
      Toast.showToast("\u6B63\u5728\u9A8C\u8BC1\u97F3\u6E90...", "info");
      const validateResult = await this._validateAudioSource(data, sourceType);
      if (!validateResult.ok) {
        Toast.showToast(validateResult.reason, "error");
        return;
      }
      Toast.showToast("\u97F3\u6E90\u9A8C\u8BC1\u901A\u8FC7\uFF0C\u6B63\u5728\u4FDD\u5B58...", "info");
      const newNoise = {
        id: "custom_" + Date.now(),
        name: name.trim(),
        category: "custom",
        source: sourceType,
        data
      };
      try {
        if (!Array.isArray(this.customNoises)) {
          this.customNoises = [];
        }
        this.customNoises.push(newNoise);
        this._saveCustomNoises();
        NoisePanel._rebuild();
        this.updateTicketControlDisplay();
        Toast.showToast("\u97F3\u6E90\u5DF2\u6210\u529F\u52A0\u5165\u81EA\u5B9A\u4E49", "success");
      } catch (err) {
        Toast.showToast("\u4FDD\u5B58\u5931\u8D25", "error");
      }
    },
    // 重命名自定义音源
    async renameCustomNoise(id) {
      const noise = this.customNoises.find((n) => n.id === id);
      if (!noise) return;
      const newName = await this._showRenameModal(noise.name);
      if (!newName || newName === noise.name) return;
      noise.name = newName;
      this._saveCustomNoises();
      NoisePanel._rebuild();
      this.updateTicketControlDisplay();
    },
    // 重命名弹窗
    _showRenameModal(currentName) {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "wn-file-picker-overlay";
        overlay.innerHTML = `
                <div class="wn-file-picker" style="max-width:320px;">
                    <div class="wn-file-picker-header">
                        <span>\u91CD\u547D\u540D\u97F3\u6548</span>
                        <button class="wn-file-picker-close" id="wnreClose">&times;</button>
                    </div>
                    <div class="wn-file-picker-body" style="padding:16px;">
                        <label class="wnfp-field">
                            <span class="wnfp-label">\u97F3\u6548\u540D\u79F0</span>
                            <input type="text" id="wnreName" value="${currentName.replace(/"/g, "&quot;")}" style="width:100%;box-sizing:border-box;">
                        </label>
                    </div>
                    <div class="wn-file-picker-footer">
                        <button class="wnfp-btn wnfp-btn-cancel" id="wnreCancel">\u53D6\u6D88</button>
                        <button class="wnfp-btn wnfp-btn-add" id="wnreConfirm">\u4FDD\u5B58</button>
                    </div>
                </div>
            `;
        modalMount().appendChild(overlay);
        const input = byId("wnreName");
        input.focus();
        input.select();
        const close = (result) => {
          overlay.remove();
          resolve(result);
        };
        overlay.querySelector("#wnreClose").addEventListener("click", () => close(null));
        overlay.querySelector("#wnreCancel").addEventListener("click", () => close(null));
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) close(null);
        });
        overlay.querySelector("#wnreConfirm").addEventListener("click", () => {
          const val = input.value.trim();
          close(val || null);
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const val = input.value.trim();
            close(val || null);
          }
          if (e.key === "Escape") close(null);
        });
      });
    },
    // 删除自定义音源
    async removeCustomNoise(id) {
      const confirmed = await Confirm.danger({
        title: "\u5220\u9664\u97F3\u6548",
        message: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u81EA\u5B9A\u4E49\u767D\u566A\u97F3\u5417\uFF1F",
        confirmText: "\u5220\u9664",
        cancelText: "\u53D6\u6D88"
      });
      if (!confirmed) return;
      this.customNoises = this.customNoises.filter((n) => n.id !== id);
      this._saveCustomNoises();
      if (NoisePlayer.currentType === id) {
        this.stop();
      }
      NoisePanel._rebuild();
    },
    // 持久化自定义音源（优先桥接到插件 storage，克服 localStorage port-scoped 问题）
    _saveCustomNoises() {
      const data = JSON.stringify(this.customNoises);
      if (typeof storageManager !== "undefined" && storageManager.saveCustomNoises) {
        storageManager.saveCustomNoises(this.customNoises);
      }
      try {
        StorageAdapter.set(StorageKeys.WHITENOISE_CUSTOM, data);
      } catch (e) {
      }
    },
    // 检验文件格式（扩展名白名单）
    _checkAudioFormat(data) {
      const SUPPORTED = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".webm", ".opus"];
      const lower = data.toLowerCase().replace(/\?.*$/, "");
      if (!SUPPORTED.some((ext) => lower.endsWith(ext))) {
        return "\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u683C\u5F0F\u3002\u8BF7\u4F7F\u7528 mp3 / wav / ogg / flac / m4a / aac / webm / opus \u683C\u5F0F\u7684\u97F3\u9891\u6587\u4EF6";
      }
      return null;
    },
    // 实际加载并解码音频，验证音源可用
    async _validateAudioSource(data, sourceType) {
      const ctx = NoisePlayer.getAudioCtx();
      try {
        let arrayBuffer;
        if (sourceType === "url") {
          const proxyUrl = location.origin + "/bamboo-audio-proxy?url=" + encodeURIComponent(data);
          const resp = await fetch(proxyUrl, {
            signal: AbortSignal.timeout(2e4)
            // 20s 超时
          });
          if (!resp.ok) {
            return { ok: false, reason: `\u94FE\u63A5\u8BBF\u95EE\u5931\u8D25 (HTTP ${resp.status})\uFF0C\u8BF7\u68C0\u67E5 URL \u662F\u5426\u6709\u6548` };
          }
          const ct = resp.headers.get("Content-Type") || "";
          if (ct && !ct.includes("audio") && !ct.includes("octet-stream") && !ct.includes("video")) {
            console.warn("[Bamboo] \u97F3\u6E90 Content-Type \u975E\u97F3\u9891:", ct);
          }
          arrayBuffer = await resp.arrayBuffer();
        } else {
          const isVaultPath = !data.startsWith("/") && !data.includes(":\\");
          const dataUrl = isVaultPath ? await this._requestVaultFileRead(data) : await this._requestFileRead(data);
          const resp = await fetch(dataUrl);
          if (!resp.ok) {
            return { ok: false, reason: "\u672C\u5730\u6587\u4EF6\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u6587\u4EF6\u8DEF\u5F84\u662F\u5426\u6B63\u786E" };
          }
          arrayBuffer = await resp.arrayBuffer();
        }
        await ctx.decodeAudioData(arrayBuffer.slice(0));
        return { ok: true };
      } catch (e) {
        if (e.name === "TimeoutError" || e.name === "AbortError") {
          return { ok: false, reason: "\u97F3\u6E90\u52A0\u8F7D\u8D85\u65F6\uFF0820s\uFF09\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u72B6\u51B5\u6216\u97F3\u6E90\u5927\u5C0F" };
        }
        if (e.name === "EncodingError" || e.message && e.message.includes("decode")) {
          return { ok: false, reason: "\u65E0\u6CD5\u89E3\u7801\u8BE5\u97F3\u9891\u6587\u4EF6\uFF0C\u6587\u4EF6\u53EF\u80FD\u5DF2\u635F\u574F\u6216\u7F16\u7801\u683C\u5F0F\u4E0D\u517C\u5BB9" };
        }
        if (e.name === "TypeError" && e.message && e.message.includes("fetch")) {
          return { ok: false, reason: "\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u652F\u6301\u8DE8\u57DF\u8BBF\u95EE\uFF08CORS\uFF09" };
        }
        return { ok: false, reason: "\u97F3\u6E90\u9A8C\u8BC1\u5931\u8D25\uFF1A" + (e.message || "\u672A\u77E5\u9519\u8BEF") };
      }
    },
    // 从库中选择文件的自定义 Modal
    async _showAddNoiseModal() {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "wn-file-picker-overlay";
        overlay.innerHTML = `
                <div class="wn-file-picker">
                    <div class="wn-file-picker-header">
                        <span>\u6DFB\u52A0\u81EA\u5B9A\u4E49\u97F3\u6E90</span>
                        <button class="wn-file-picker-close" id="wnfpClose">&times;</button>
                    </div>
                    <div class="wn-file-picker-body">
                        <label class="wnfp-field">
                            <span class="wnfp-label">\u97F3\u6548\u540D\u79F0</span>
                            <input type="text" id="wnfpName" placeholder="\u81EA\u5B9A\u4E49\u6C1B\u56F4" style="width:100%;box-sizing:border-box;">
                        </label>
                        <div class="wnfp-source-tabs">
                            <button class="wnfp-tab wnfp-tab-active" data-source="url">\u7F51\u7EDC\u94FE\u63A5</button>
                            <button class="wnfp-tab" data-source="file">\u4ECE\u5E93\u4E2D\u9009\u62E9</button>
                        </div>
                        <div class="wnfp-source-content">
                            <div class="wnfp-url-section" id="wnfpUrlSection">
                                <input type="text" id="wnfpUrl" placeholder="https://example.com/audio.mp3" style="width:100%;box-sizing:border-box;">
                            </div>
                            <div class="wnfp-file-section" id="wnfpFileSection" style="display:none;">
                                <div class="wnfp-file-picker-row">
                                    <button class="wnfp-browse-btn" id="wnfpBrowse">\u6D4F\u89C8\u5E93\u5185\u6587\u4EF6</button>
                                    <span class="wnfp-selected-file" id="wnfpSelected">\u672A\u9009\u62E9</span>
                                </div>
                                <div class="wnfp-file-hint">
                                    \u{1F4A1} \u63A8\u8350\u97F3\u6E90\uFF1A<a href="https://freesound.org" target="_blank">Freesound.org</a>\uFF0872\u4E07+\u514D\u8D39\u97F3\u6548\uFF09\uFF0C\u4E0B\u8F7D\u540E\u653E\u5165\u5E93\u5185\u5373\u53EF\u6DFB\u52A0
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="wn-file-picker-footer">
                        <button class="wnfp-btn wnfp-btn-cancel" id="wnfpCancel">\u53D6\u6D88</button>
                        <button class="wnfp-btn wnfp-btn-add" id="wnfpAdd">\u6DFB\u52A0</button>
                    </div>
                </div>
            `;
        modalMount().appendChild(overlay);
        let activeSource = "url";
        let pickedFile = "";
        let picking = false;
        const close = (result) => {
          overlay.remove();
          resolve(result);
        };
        overlay.querySelectorAll(".wnfp-tab").forEach((tab) => {
          tab.addEventListener("click", () => {
            activeSource = tab.dataset.source;
            overlay.querySelectorAll(".wnfp-tab").forEach((t) => t.classList.toggle("wnfp-tab-active", false));
            tab.classList.add("wnfp-tab-active");
            byId("wnfpUrlSection").style.display = activeSource === "url" ? "block" : "none";
            byId("wnfpFileSection").style.display = activeSource === "file" ? "block" : "none";
          });
        });
        const urlInput = byId("wnfpUrl");
        urlInput.addEventListener("input", () => {
          const val = urlInput.value.trim();
          const nameInput = byId("wnfpName");
          if (val && !nameInput.value) {
            try {
              const pathName = new URL(val).pathname;
              const fileName = decodeURIComponent(pathName.split("/").pop().replace(/\.[^.]+$/, ""));
              nameInput.value = fileName || "";
            } catch (e) {
            }
          }
        });
        byId("wnfpBrowse").addEventListener("click", async () => {
          if (picking) return;
          picking = true;
          const btn = byId("wnfpBrowse");
          btn.textContent = "\u626B\u63CF\u4E2D...";
          btn.disabled = true;
          try {
            pickedFile = await this._pickVaultFile();
            byId("wnfpSelected").textContent = pickedFile || "\u672A\u9009\u62E9";
            if (pickedFile) {
              const fileName = pickedFile.split("/").pop().replace(/\.[^.]+$/, "");
              byId("wnfpName").value = fileName || "";
            }
          } catch (e) {
            console.error("[Bamboo] \u626B\u63CF\u5E93\u5185\u97F3\u9891\u6587\u4EF6\u5931\u8D25:", e);
            Toast.showToast(e.message || "\u626B\u63CF\u5E93\u6587\u4EF6\u5931\u8D25", "error");
          } finally {
            btn.textContent = "\u6D4F\u89C8\u5E93\u5185\u6587\u4EF6";
            btn.disabled = false;
            picking = false;
          }
        });
        overlay.querySelector("#wnfpClose").addEventListener("click", () => close(null));
        overlay.querySelector("#wnfpCancel").addEventListener("click", () => close(null));
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) close(null);
        });
        overlay.querySelector("#wnfpAdd").addEventListener("click", () => {
          const name = byId("wnfpName").value.trim();
          if (!name) {
            Toast.showToast("\u8BF7\u8F93\u5165\u97F3\u6548\u540D\u79F0", "error");
            return;
          }
          let source, url, filepath;
          if (activeSource === "url") {
            source = "url";
            url = byId("wnfpUrl").value.trim();
            if (!url) {
              Toast.showToast("\u8BF7\u8F93\u5165\u97F3\u9891\u94FE\u63A5", "error");
              return;
            }
            filepath = "";
          } else {
            source = "file";
            if (!pickedFile) {
              Toast.showToast("\u8BF7\u4ECE\u5E93\u4E2D\u9009\u62E9\u4E00\u4E2A\u97F3\u9891\u6587\u4EF6", "error");
              return;
            }
            url = "";
            filepath = pickedFile;
          }
          close({ name, source, url, filepath });
        });
      });
    },
    // 扫描库内音频文件并弹出选择器
    async _pickVaultFile() {
      const files = await this._requestVaultFileList();
      if (!files || files.length === 0) {
        Toast.showToast("\u5E93\u5185\u672A\u627E\u5230\u97F3\u9891\u6587\u4EF6\uFF0C\u8BF7\u5148\u5C06 MP3/WAV \u7B49\u6587\u4EF6\u653E\u5165\u5E93\u4E2D", "info");
        return "";
      }
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "wn-file-picker-overlay";
        const formatSize = (bytes) => {
          if (bytes < 1024) return bytes + "B";
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
          return (bytes / (1024 * 1024)).toFixed(1) + "MB";
        };
        const fileItems = files.map((f) => `
                <div class="wnfp-vf-item" data-path="${HTMLUtils.escapeHtmlAttr(f.path)}" title="${HTMLUtils.escapeHtmlAttr(f.path)}">
                    <span class="wnfp-vf-icon">\u{1F3B5}</span>
                    <span class="wnfp-vf-name">${HTMLUtils.escapeHtml(f.name)}</span>
                    <span class="wnfp-vf-meta">${HTMLUtils.escapeHtml(f.ext)} \xB7 ${formatSize(f.size)}</span>
                    <span class="wnfp-vf-path">${HTMLUtils.escapeHtml(f.path)}</span>
                </div>
            `).join("");
        overlay.innerHTML = `
                <div class="wnfp-vf-panel">
                    <div class="wnfp-vf-header">
                        <span>\u9009\u62E9\u5E93\u5185\u97F3\u9891\u6587\u4EF6 (${files.length})</span>
                        <button class="wnfp-vf-close">&times;</button>
                    </div>
                    <div class="wnfp-vf-body">
                        ${files.length === 0 ? '<div class="wnfp-vf-empty">\u5E93\u5185\u672A\u627E\u5230\u97F3\u9891\u6587\u4EF6</div>' : fileItems}
                    </div>
                </div>
            `;
        modalMount().appendChild(overlay);
        const close = (path) => {
          overlay.remove();
          resolve(path || "");
        };
        overlay.querySelector(".wnfp-vf-close").addEventListener("click", () => close(""));
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) close("");
        });
        overlay.querySelectorAll(".wnfp-vf-item").forEach((item) => {
          item.addEventListener("click", () => close(item.dataset.path));
        });
      });
    },
    // 向插件请求扫描库内音频文件
    _requestVaultFileList() {
      return new Promise((resolve, reject) => {
        const requestId = "vault_list_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
        const handler = (event) => {
          const msg = event.data;
          if (!msg || msg.id !== requestId) return;
          window.removeEventListener("message", handler);
          if (msg.error) {
            console.warn("[Bamboo] \u63D2\u4EF6\u8FD4\u56DE\u626B\u63CF\u9519\u8BEF:", msg.error);
            reject(new Error(msg.error));
          } else {
            const files = msg.payload && msg.payload.files;
            console.debug("[Bamboo] \u626B\u63CF\u5230\u5E93\u5185\u97F3\u9891\u6587\u4EF6:", files ? files.length : 0, "\u4E2A");
            resolve(files);
          }
        };
        window.addEventListener("message", handler);
        console.debug("[Bamboo] \u8BF7\u6C42\u626B\u63CF\u5E93\u5185\u97F3\u9891\u6587\u4EF6, requestId:", requestId);
        setTimeout(() => {
          window.removeEventListener("message", handler);
          console.warn("[Bamboo] \u626B\u63CF\u5E93\u6587\u4EF6\u8D85\u65F6 (15s), requestId:", requestId);
          reject(new Error("\u626B\u63CF\u5E93\u6587\u4EF6\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u63D2\u4EF6\u662F\u5426\u5DF2\u6B63\u786E\u52A0\u8F7D"));
        }, 15e3);
        window.parent.postMessage({
          type: "app:listVaultAudioFiles",
          id: requestId
        }, "*");
      });
    },
    // 直接构造 HTTP URL，通过服务器流式代理读取（绕过 postMessage 大文件限制）
    _requestVaultFileRead(relativePath) {
      return Promise.resolve(location.origin + "/bamboo-audio?path=" + encodeURIComponent(relativePath));
    },
    // 向插件请求读取本地文件（保留兼容旧音源，绝对路径）
    _requestFileRead(filePath) {
      return new Promise((resolve, reject) => {
        const requestId = "file_read_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
        const handler = (event) => {
          const msg = event.data;
          if (!msg || msg.id !== requestId) return;
          window.removeEventListener("message", handler);
          if (msg.error) {
            reject(new Error(msg.error));
          } else {
            resolve(msg.payload && msg.payload.data);
          }
        };
        window.addEventListener("message", handler);
        setTimeout(() => {
          window.removeEventListener("message", handler);
          reject(new Error("\u8BFB\u53D6\u672C\u5730\u6587\u4EF6\u8D85\u65F6"));
        }, 1e4);
        window.parent.postMessage({
          type: "app:readLocalFile",
          id: requestId,
          payload: { path: filePath }
        }, "*");
      });
    },
    // 通用输入型 Modal
    _showInputModal({ title, fields, confirmText = "\u786E\u5B9A", cancelText = "\u53D6\u6D88" }) {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        const fieldsHtml = fields.map((f) => {
          const fieldKey = HTMLUtils.escapeHtml(f.key);
          const fieldLabel = HTMLUtils.escapeHtml(f.label);
          const isSelect = f.type === "select" && Array.isArray(f.options);
          const showOnAttr = f.showOn ? `data-show-on="${HTMLUtils.escapeHtmlAttr(f.showOn.key + ":" + f.showOn.value)}"` : "";
          let inputHtml = "";
          if (isSelect) {
            const opts = f.options.map(
              (o) => '<option value="' + HTMLUtils.escapeHtmlAttr(o.value) + '">' + HTMLUtils.escapeHtml(o.label) + "</option>"
            ).join("");
            inputHtml = '<select data-key="' + fieldKey + '" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--border-medium,#d1d5db);border-radius:var(--radius-md,8px);font-size:13px;background:var(--input-bg,#fff);color:var(--text-primary,#333);outline:none;transition:border-color 0.2s;">' + opts + "</select>";
          } else {
            inputHtml = '<input type="text" data-key="' + fieldKey + '" placeholder="' + HTMLUtils.escapeHtmlAttr(f.placeholder || "") + '" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--border-medium,#d1d5db);border-radius:var(--radius-md,8px);font-size:13px;background:var(--input-bg,#fff);color:var(--text-primary,#333);outline:none;transition:border-color 0.2s;" autocomplete="off" spellcheck="false">';
          }
          return '<div style="margin-bottom:14px;" data-field="' + fieldKey + '" ' + showOnAttr + '><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary,#666);margin-bottom:6px;letter-spacing:0.3px;">' + fieldLabel + "</label>" + inputHtml + "</div>";
        }).join("");
        const dialog = document.createElement("div");
        dialog.className = "confirm-dialog";
        dialog.innerHTML = '<div class="confirm-header"><h3 class="confirm-title">' + HTMLUtils.escapeHtml(title) + '</h3></div><div class="confirm-body" style="padding-top:4px;">' + fieldsHtml + '</div><div class="confirm-footer"><button class="btn btn-secondary confirm-cancel-btn">' + HTMLUtils.escapeHtml(cancelText) + '</button><button class="btn btn-primary confirm-confirm-btn">' + HTMLUtils.escapeHtml(confirmText) + "</button></div>";
        overlay.appendChild(dialog);
        modalMount().appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add("confirm-visible"));
        const updateFieldVisibility = () => {
          fields.forEach((f) => {
            if (!f.showOn) return;
            const triggerEl = dialog.querySelector('[data-key="' + f.showOn.key + '"]');
            const targetWrap = dialog.querySelector('[data-field="' + f.key + '"]');
            if (!triggerEl || !targetWrap) return;
            const visible = triggerEl.value === f.showOn.value;
            targetWrap.style.display = visible ? "" : "none";
          });
        };
        fields.forEach((f) => {
          if (!f.showOn) return;
          const triggerEl = dialog.querySelector('[data-key="' + f.showOn.key + '"]');
          if (triggerEl) triggerEl.addEventListener("change", updateFieldVisibility);
        });
        setTimeout(updateFieldVisibility, 0);
        dialog.querySelectorAll("input, select").forEach((el) => {
          el.addEventListener("focus", () => {
            el.style.borderColor = "var(--bamboo-primary)";
            el.style.boxShadow = "0 0 0 2px rgba(var(--primary-rgb),0.12)";
          });
          el.addEventListener("blur", () => {
            el.style.borderColor = "var(--border-medium,#d1d5db)";
            el.style.boxShadow = "none";
          });
        });
        const close = (result) => {
          overlay.classList.remove("confirm-visible");
          overlay.classList.add("confirm-hiding");
          setTimeout(() => overlay.remove(), 200);
          resolve(result);
        };
        const getValues = () => {
          const values = {};
          dialog.querySelectorAll("[data-key]").forEach((el) => {
            const key = el.dataset.key;
            if (!key) return;
            values[key] = el.value;
          });
          return values;
        };
        dialog.querySelector(".confirm-confirm-btn").addEventListener("click", () => close(getValues()));
        dialog.querySelector(".confirm-cancel-btn").addEventListener("click", () => close(null));
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) close(null);
        });
        dialog.addEventListener("keydown", (e) => {
          if (e.key === "Escape") close(null);
          if (e.key === "Enter" && e.target.tagName !== "SELECT" && e.target.tagName !== "TEXTAREA") close(getValues());
        });
        const firstInput = dialog.querySelector("input, select");
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
      });
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => WhiteNoiseManager2.init());
  } else {
    WhiteNoiseManager2.init();
  }
  window.WhiteNoiseManager = WhiteNoiseManager2;

  // assets/scripts/renderers/renderers.js
  var renderers_exports = {};
  __export(renderers_exports, {
    PERIOD_HOURS: () => PERIOD_HOURS,
    PERIOD_LABELS: () => PERIOD_LABELS,
    PERIOD_ORDER: () => PERIOD_ORDER,
    _iconSvg: () => _iconSvg,
    buildBambooNodeHTML: () => buildBambooNodeHTML,
    buildBambooPathHTML: () => buildBambooPathHTML,
    buildPeriodDotsHTML: () => buildPeriodDotsHTML,
    buildStubBackHTML: () => buildStubBackHTML,
    buildTicketHTML: () => buildTicketHTML,
    computeActiveDuration: () => computeActiveDuration,
    createDefaultSection: () => createDefaultSection,
    escapeRegex: () => escapeRegex,
    getActivePeriod: () => getActivePeriod,
    getPeriodDotStates: () => getPeriodDotStates,
    highlightText: () => highlightText,
    isCurrentPeriod: () => isCurrentPeriod,
    renderAll: () => renderAll2,
    renderDate: () => renderDate,
    renderGoalsSection: () => renderGoalsSection,
    renderHistoryList: () => renderHistoryList,
    renderSearchResults: () => renderSearchResults,
    renderSkeleton: () => renderSkeleton,
    renderTimelineSection: () => renderTimelineSection,
    renderTodoSection: () => renderTodoSection,
    renderUndoRedoBar: () => renderUndoRedoBar,
    setupBambooTooltips: () => setupBambooTooltips,
    setupTimelineHoverEffects: () => setupTimelineHoverEffects,
    stubIconClock: () => stubIconClock,
    stubIconFlip: () => stubIconFlip,
    stubIconList: () => stubIconList
  });
  var renderDate = () => {
    const { currentDate } = store.getState();
    const dateDisplay = byId("currentDate");
    const weekdayDisplay = byId("currentWeekday");
    if (dateDisplay) dateDisplay.textContent = getChineseDateDisplay(currentDate);
    if (weekdayDisplay) weekdayDisplay.textContent = getChineseWeekday(currentDate);
  };
  var _renderDebounceTimer = null;
  var _isRendering = false;
  var _pendingRender = false;
  var _renderedSectionIds = /* @__PURE__ */ new Set();
  var renderSkeleton = () => {
    const sectionsContainer = byId("sectionsContainer");
    if (!sectionsContainer) return;
    sectionsContainer.innerHTML = `
        <div class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
        </div>
    `;
  };
  var renderAll2 = () => {
    if (_renderDebounceTimer) {
      clearTimeout(_renderDebounceTimer);
    }
    _renderDebounceTimer = setTimeout(() => {
      if (_isRendering) {
        _pendingRender = true;
        return;
      }
      _isRendering = true;
      try {
        const data = store.getCurrentDayData();
        renderDate();
        const sectionsContainer = byId("sectionsContainer");
        if (!sectionsContainer) {
          console.error("sectionsContainer \u4E0D\u5B58\u5728!");
          return;
        }
        if (_renderedSectionIds.size === 0) {
          sectionsContainer.innerHTML = "";
        }
        const sections = SectionRegistry.getVisible();
        const newSectionIds = new Set(sections.map((s) => s.id));
        _renderedSectionIds.forEach((id) => {
          if (!newSectionIds.has(id)) {
            const el = sectionsContainer.querySelector(`[data-section-id="${id}"]`);
            if (el) el.remove();
          }
        });
        const savedThemeWrapper = byId("themeEffectSection");
        const sectionElements = [];
        sections.forEach((section, index) => {
          if (section.id === "themeEffect" && savedThemeWrapper) {
            savedThemeWrapper.setAttribute("data-section-id", "themeEffect");
            savedThemeWrapper.style.animationDelay = `${index * 0.05}s`;
            sectionElements.push(savedThemeWrapper);
            return;
          }
          const existingEl = sectionsContainer.querySelector(`[data-section-id="${section.id}"]`);
          const sectionElement = createDefaultSection(section, data, index);
          if (sectionElement) {
            sectionElement.setAttribute("data-section-id", section.id);
            sectionElement.style.animationDelay = `${index * 0.05}s`;
            sectionElements.push(sectionElement);
          }
        });
        sectionsContainer.innerHTML = "";
        sectionElements.forEach((el) => sectionsContainer.appendChild(el));
        _renderedSectionIds = newSectionIds;
        renderUndoRedoBar();
        if (typeof Todo !== "undefined") {
          Todo._syncCollapsedState();
        }
        setupTimelineHoverEffects();
        setupBambooTooltips();
      } catch (e) {
        console.error("\u6E32\u67D3\u51FA\u9519:", e);
      } finally {
        _isRendering = false;
        if (_pendingRender) {
          _pendingRender = false;
          renderAll2();
        }
      }
    }, 50);
  };
  var createDefaultSection = (section, data, index) => {
    let sectionElement = null;
    switch (section.id) {
      case "themeEffect":
        const themeHtml = window.ThemeEffects.render(section.theme || "bamboo");
        const tempThemeDiv = document.createElement("div");
        tempThemeDiv.innerHTML = themeHtml;
        const wrapper = document.createElement("div");
        wrapper.id = "themeEffectSection";
        while (tempThemeDiv.firstChild) {
          wrapper.appendChild(tempThemeDiv.firstChild);
        }
        sectionElement = wrapper;
        setTimeout(() => {
          window.ThemeEffects.init(section.theme || "bamboo");
        }, 100);
        break;
      case "timeline":
        sectionElement = renderTimelineSection(data);
        break;
      case "goals":
        sectionElement = renderGoalsSection();
        break;
      case "todo":
        sectionElement = renderTodoSection();
        break;
    }
    if (sectionElement) {
      sectionElement.style.animationDelay = `${index * 0.05}s`;
    }
    return sectionElement;
  };
  var _iconSvg = {
    clock: LucideUtils.createIcon("clock", { size: 20 }),
    checkCircle: LucideUtils.createIcon("checkCircle", { size: 20 }),
    search: LucideUtils.createIcon("search", { size: 20 })
  };
  var computeActiveDuration = (timeline) => {
    const allTimes = [];
    timeline.forEach((period) => {
      if (period.items && Array.isArray(period.items)) {
        period.items.forEach((item) => {
          const parsed = parseTime(item.time);
          if (parsed) allTimes.push(parsed);
        });
      }
    });
    if (allTimes.length < 2) return null;
    allTimes.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    const first = allTimes[0];
    const last = allTimes[allTimes.length - 1];
    const diffMin = last.hour * 60 + last.minute - (first.hour * 60 + first.minute);
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (hours > 0 && mins > 0) return `${hours}h${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };
  var stubIconClock = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  var stubIconList = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
  var stubIconFlip = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  var buildStubBackHTML = (data) => {
    const { activeCount, totalPeriods, totalEvents, activeDuration } = data;
    const pct = totalPeriods > 0 ? Math.round(activeCount / totalPeriods * 100) : 0;
    return `
        <div class="ticket-stub-content stub-back-content">
            <div class="stub-back-title-box">
                <div class="stub-back-row">
                    <div class="stub-back-left">
                        <div class="stub-back-ring" style="--ring-pct: ${pct};">
                            <span class="stub-back-ring-text">${pct}%</span>
                        </div>
                        <div class="stub-back-caption">\u6D3B\u529B\u503C</div>
                    </div>
                    <div class="stub-back-divider"></div>
                    <div class="stub-back-right">
                        ${activeDuration ? `<div class="stub-back-stat">${stubIconClock}<span class="stub-back-stat-value">${activeDuration}</span></div>` : '<div class="stub-back-stat">' + stubIconClock + '<span class="stub-back-stat-value">--</span></div>'}
                        <div class="stub-back-stat">${stubIconList}<span class="stub-back-stat-value">${totalEvents}\u9879</span></div>
                    </div>
                </div>
            </div>
            <div class="stub-noise-ctrl" id="stub-noise-ctrl-back">
                <svg class="stub-nc-icon stub-nc-prev" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-prev"><path d="m15 18-6-6 6-6"/></svg>
                <span class="stub-nc-name" data-action="white-noise-panel">\u7AF9\u6797</span>
                <svg class="stub-nc-icon stub-nc-next" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-next"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </div>`;
  };
  var buildTicketHTML = (checkInTimes, activePeriod, dotStates, stubBackData) => `
        <div class="designer-ticket" role="list" aria-label="\u6D3B\u52A8\u7EDF\u8BA1">
            <div class="ticket-main">
                <div class="ticket-body">
                    <div class="ticket-time-block ticket-start-block">
                        <div class="ticket-time-name">\u542F\u7A0B\u51FA\u53D1</div>
                        <div class="ticket-time-value">${checkInTimes.firstCheckIn}</div>
                    </div>
                    <div class="ticket-highlight">
                        <div class="ticket-highlight-value">${activePeriod}</div>
                        <div class="ticket-highlight-label">\u7CBE\u5F69\u65F6\u523B</div>
                    </div>
                    <div class="ticket-time-block ticket-end-block">
                        <div class="ticket-time-name">\u5E73\u7A33\u843D\u5730</div>
                        <div class="ticket-time-value">${checkInTimes.lastCheckIn}</div>
                    </div>
                </div>
                ${buildPeriodDotsHTML(dotStates)}
                <div class="ticket-decorations">
                    <div class="ticket-decoration left"></div>
                    <div class="ticket-slogan">\u4E00\u8282\u4E00\u7A0B\uFF0C\u6210\u7AF9\u5728\u5FC3</div>
                    <div class="ticket-decoration right"></div>
                </div>
            </div>
            <div class="ticket-stub">
                <div class="ticket-flip-container">
                    <div class="ticket-flip-front">
                        <div class="ticket-stub-content">
                            <div class="ticket-stub-title-box" data-action="white-noise-toggle">
                                <div class="stub-title-cn">\u5BC4\u60C5</div>
                                <div class="stub-title-cn">\u5C71\u6C34</div>
                                <div class="ticket-stub-date">${(/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN")}</div>
                            </div>
                            <div class="stub-noise-ctrl" id="stub-noise-ctrl">
                                <svg class="stub-nc-icon stub-nc-prev" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-prev"><path d="m15 18-6-6 6-6"/></svg>
                                <span class="stub-nc-name" data-action="white-noise-panel">\u7AF9\u6797</span>
                                <svg class="stub-nc-icon stub-nc-next" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-next"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </div>
                    </div>
                    <div class="ticket-flip-back">
                        ${buildStubBackHTML(stubBackData)}
                    </div>
                </div>
                <div class="flip-stub-btn" data-action="ticket-flip" title="\u67E5\u770B\u6570\u636E" aria-label="\u7FFB\u5230\u80CC\u9762">
                    ${stubIconFlip}
                </div>
            </div>
        </div>`;
  var PERIOD_HOURS = { lateNight: [0, 4], dawn: [4, 5.5], earlyMorning: [5.5, 7], morning: [7, 12], midday: [12, 13], afternoon: [13, 17], dusk: [17, 18.5], evening: [18.5, 22], night: [22, 24] };
  var PERIOD_ORDER = ["lateNight", "dawn", "earlyMorning", "morning", "midday", "afternoon", "dusk", "evening", "night"];
  var PERIOD_LABELS = ["\u51CC\u6668", "\u62C2\u6653", "\u6E05\u6668", "\u4E0A\u5348", "\u5348\u95F4", "\u4E0B\u5348", "\u508D\u665A", "\u665A\u95F4", "\u6DF1\u591C"];
  var getPeriodDotStates = (timeline) => {
    const activeKeys = new Set((timeline || []).filter((p) => p.items && p.items.length > 0).map((p) => p.period));
    const now = /* @__PURE__ */ new Date();
    const t = now.getHours() + now.getMinutes() / 60;
    return PERIOD_ORDER.map((key, i) => {
      const range = PERIOD_HOURS[key];
      const isCurrent = range && t >= range[0] && t < range[1];
      return { key, label: PERIOD_LABELS[i], hasData: activeKeys.has(key), isCurrent };
    });
  };
  var buildPeriodDotsHTML = (dotStates) => {
    const dots = dotStates.map((s) => {
      let cls = "ticket-dot";
      if (s.hasData) cls += " has-data";
      if (s.isCurrent) cls += " current";
      const tip = s.isCurrent ? `${s.label} \xB7 \u5F53\u524D\u65F6\u6BB5` : s.hasData ? `${s.label} \xB7 \u6709\u8BB0\u5F55` : s.label;
      return `<span class="${cls}" data-tip="${tip}" aria-hidden="true"></span>`;
    }).join("");
    return `<div class="ticket-period-dots" role="img" aria-label="\u65F6\u6BB5\u6D3B\u8DC3\u5EA6">${dots}</div>`;
  };
  var isCurrentPeriod = (periodKey) => {
    const now = /* @__PURE__ */ new Date();
    const t = now.getHours() + now.getMinutes() / 60;
    const range = PERIOD_HOURS[periodKey];
    return range && t >= range[0] && t < range[1];
  };
  var buildBambooNodeHTML = (period, index) => {
    const _isFocus = isCurrentPeriod(period.period);
    const focus = _isFocus ? "focus-now" : "";
    const count = period.items?.length || 0;
    let hint = "";
    if (count === 0) {
      hint = "\u8FD9\u4E2A\u65F6\u6BB5\u8FD8\u6CA1\u6709\u8BB0\u5F55\u6D3B\u52A8";
    } else if (count === 1) {
      hint = `\u8FD9\u4E2A\u65F6\u6BB5\u6709 1 \u6761\u6D3B\u52A8\u8BB0\u5F55`;
    } else {
      hint = `\u8FD9\u4E2A\u65F6\u6BB5\u6709 ${count} \u6761\u6D3B\u52A8\u8BB0\u5F55`;
    }
    return `
        <div class="bamboo-node ${focus}" style="animation-delay: ${index * 0.1}s">
            <div class="bamboo-card ${period.period}">
                <div class="bamboo-card-header" data-action="timeline-toggle" data-index="${index}" style="cursor: pointer;">
                    <div class="bamboo-left">
                        <div class="bamboo-info">
                            <div class="bamboo-icon">${LucideUtils.createIcon(period.icon, { size: 15 })}</div>
                            <div class="bamboo-title">
                                <div class="bamboo-name">${escapeHtml(period.name)}</div>
                                <div class="bamboo-time">${escapeHtml(period.time)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="bamboo-right">
                        <span class="bamboo-count" data-count="${count}" data-hint="${hint}">${count}</span>
                        <div class="bamboo-chevron${!_isFocus ? " collapsed" : ""}" id="chevron-${index}">${_isFocus ? "\u25BC" : "\u25B6"}</div>
                    </div>
                    <div class="bamboo-leaf"></div>
                </div>
                <div class="bamboo-card-content${!_isFocus ? " collapsed" : ""}" id="timeline-content-${index}">
                    <div class="bamboo-items">
                        ${(period.items || []).map((item) => `
                            <div class="bamboo-item">
                                <div class="bamboo-item-time">${escapeHtml(item.time)}</div>
                                <div class="bamboo-item-content">
                                    <div class="bamboo-item-task">${escapeHtml(item.task)}</div>
                                    ${item.eval ? `<div class="bamboo-item-eval ${item.eval === "warn" ? "warn" : ""}">${escapeHtml(item.eval)}</div>` : ""}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        </div>`;
  };
  var buildBambooPathHTML = (data) => {
    if (!data.timeline || data.timeline.length === 0) {
      return `<div class="empty-state-card">
            <div class="empty-state-icon">${_iconSvg.clock}</div>
            <div class="empty-state-title">\u8BB0\u5F55\u4F60\u7684\u6D3B\u52A8\u65F6\u95F4\u7EBF</div>
            <div class="empty-state-desc">\u5B8C\u6210\u5F85\u529E\u4EFB\u52A1\u540E\u81EA\u52A8\u8BB0\u5F55</div>
        </div>`;
    }
    return data.timeline.map((period, i) => buildBambooNodeHTML(period, i)).join("");
  };
  var getActivePeriod = (timeline) => {
    let maxCount = 0, best = null;
    timeline.forEach((p) => {
      const n = p.items && p.items.length || 0;
      if (n > maxCount) {
        maxCount = n;
        best = p;
      }
    });
    return best ? best.name || best.time || "-" : "-";
  };
  var renderTimelineSection = (data) => {
    const section = document.createElement("section");
    section.className = "timeline-section";
    section.setAttribute("role", "region");
    section.setAttribute("aria-labelledby", "timeline-title");
    const timeline = data.timeline || [];
    const checkInTimes = calculateCheckInTimes(timeline);
    const activePeriod = timeline.length > 0 ? getActivePeriod(timeline) : "-";
    const dotStates = getPeriodDotStates(timeline);
    const activeCount = dotStates.filter((s) => s.hasData).length;
    const stubBackData = {
      activeCount,
      totalPeriods: 9,
      totalEvents: timeline.reduce((sum, p) => sum + (p.items?.length || 0), 0),
      activeDuration: computeActiveDuration(timeline)
    };
    section.innerHTML = `
        <div class="timeline-wrapper">
            ${buildTicketHTML(checkInTimes, activePeriod, dotStates, stubBackData)}
            <div class="timeline-bamboo-path" id="timelinePath" role="list" aria-label="\u6D3B\u52A8\u65F6\u95F4\u7EBF">
                ${buildBambooPathHTML(data)}
            </div>
        </div>`;
    setTimeout(() => setupTimelineHoverEffects(), 0);
    return section;
  };
  var renderGoalsSection = () => {
    const section = document.createElement("section");
    section.className = "goal-section";
    section.setAttribute("role", "region");
    section.setAttribute("aria-labelledby", "goals-title");
    section.innerHTML = `
        <div class="goal-map-container">
            <div class="goal-list" id="goalList" role="list" aria-label="\u76EE\u6807\u5217\u8868"></div>
        </div>
    `;
    if (typeof GoalsRenderer !== "undefined") {
      GoalsRenderer.render(null, section.querySelector(".goal-list"));
    }
    return section;
  };
  var renderTodoSection = () => {
    const section = document.createElement("section");
    section.className = "todo-section";
    section.setAttribute("role", "region");
    section.setAttribute("aria-labelledby", "todo-title");
    let goalTasks = [];
    if (typeof GoalsRenderer !== "undefined") {
      goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
    }
    const completedCount = goalTasks.filter((t) => t.completed).length;
    const totalCount = goalTasks.length;
    const renderTodoItem = (todo, isCompleted) => {
      const completedClass = isCompleted ? "todo-item-completed" : "";
      const goalTaskClass = "todo-item-goal";
      const archivedClass = todo.isArchived ? "todo-item-archived" : "";
      let goalMetaLabel = "";
      if (todo.isArchived) {
        goalMetaLabel = `<span class="todo-goal-archived">\u5DF2\u5F52\u6863</span>`;
      }
      if (todo.dailyMin > 0) {
        goalMetaLabel += `<span class="todo-goal-daily">\u6BCF\u65E5${todo.dailyMin}</span>`;
      } else if (todo.hasValues && todo.incrementValue > 0) {
        goalMetaLabel += `<span class="todo-goal-daily">+${parseFloat(todo.incrementValue).toFixed(1)}</span>`;
      }
      if (todo.hasValues) {
        const currentVal = parseFloat(todo.currentValue) || 0;
        const targetVal = parseFloat(todo.targetValue) || 0;
        goalMetaLabel += `<span class="todo-goal-progress">${currentVal.toFixed(1)}/${targetVal}</span>`;
      }
      const toggleDataAttrs = `data-action="todo-toggle" data-todo-id="${escapeHtml(todo.id)}" data-type="goal_task" data-goal-id="${todo.goalId || ""}" data-item-idx="${todo.itemIdx !== void 0 ? todo.itemIdx : ""}" data-is-completed="${isCompleted}"`;
      return `
            <div class="todo-item ${completedClass} ${goalTaskClass} ${archivedClass}" data-todo-id="${escapeHtml(todo.id)}">
                <button class="todo-checkbox ${isCompleted ? "checked" : ""}" 
                        ${toggleDataAttrs}
                        aria-label="${isCompleted ? "\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210" : "\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210"}">
                    ${isCompleted ? LucideUtils.createIcon("check", { size: 9 }) : ""}
                </button>
                <div class="todo-content">
                    ${todo.description ? `<span class="todo-desc">${escapeHtml(todo.description)} - </span>` : ""}
                    <span class="todo-title">${escapeHtml(todo.title)}</span>
                </div>
                <div class="todo-meta">
                    ${goalMetaLabel}
                </div>
            </div>
        `;
    };
    section.innerHTML = `
        <div id="todoContent" role="article" aria-label="\u5F85\u529E\u4EFB\u52A1">
            ${goalTasks.length === 0 ? `
                <div class="empty-state-card">
                    <div class="empty-state-icon">${LucideUtils.createIcon("target", { size: 48, strokeWidth: 1.5 })}</div>
                    <div class="empty-state-title">\u4ECA\u65E5\u76EE\u6807\u4EFB\u52A1</div>
                    <div class="empty-state-desc">\u5728\u76EE\u6807\u7BA1\u7406\u4E2D\u8BBE\u7F6E\u6BCF\u65E5\u4EFB\u52A1</div>
                    <div class="empty-state-hint">\u524D\u5F80\u76EE\u6807\u9875\u9762\u6DFB\u52A0\u4EFB\u52A1</div>
                </div>
            ` : (() => {
      const pending = goalTasks.filter((t) => !t.completed);
      const completed = goalTasks.filter((t) => t.completed);
      const progressPercent = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
      return `
                    <div class="todo-stats">
                        <div class="todo-stat-item">
                            <span class="todo-stat-num">${pending.length}</span>
                            <span class="todo-stat-label">\u5F85\u5B8C\u6210</span>
                        </div>
                        <div class="todo-stat-item">
                            <span class="todo-stat-num">${completed.length}</span>
                            <span class="todo-stat-label">\u5DF2\u5B8C\u6210</span>
                        </div>
                        <div class="todo-stat-item">
                            <span class="todo-stat-num">${progressPercent}%</span>
                            <span class="todo-stat-label">\u5B8C\u6210\u7387</span>
                        </div>
                    </div>
                    <div class="todo-progress-bar">
                        <div class="todo-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    ${pending.length > 0 ? `
                        <div class="todo-group todo-group-goal">
                            <div class="todo-group-header">
                                <div class="todo-group-label">
                                    ${LucideUtils.createIcon("target", { size: 16 })}
                                    <span>\u76EE\u6807\u4EFB\u52A1</span>
                                    <span class="todo-group-badge">${pending.length}</span>
                                </div>
                            </div>
                            <div class="todo-group-items">
                                ${pending.map((todo) => renderTodoItem(todo, false)).join("")}
                            </div>
                        </div>
                    ` : ""}
                    ${completed.length > 0 ? `
                        <div class="todo-group todo-group-completed collapsed" id="todoCompletedGroup">
                            <div class="todo-group-header">
                                <div class="todo-group-label" data-action="todo-toggle-completed-group">
                                    <span class="todo-group-chevron">${LucideUtils.createIcon("chevronDown", { size: 14 })}</span>
                                    \u5DF2\u5B8C\u6210 (${completed.length})
                                </div>
                            </div>
                            <div class="todo-group-items">
                                ${completed.map((todo) => renderTodoItem(todo, true)).join("")}
                            </div>
                        </div>
                    ` : ""}
                `;
    })()}
        </div>
    `;
    return section;
  };
  var renderUndoRedoBar = () => {
    let bar = $(".undo-redo-bar");
    const canUndo = store.canUndo();
    const canRedo = store.canRedo();
    if (bar) {
      const undoBtn = bar.querySelector(".undo-btn");
      const redoBtn = bar.querySelector(".redo-btn");
      const indicator = bar.querySelector(".undo-redo-indicator");
      if (undoBtn) undoBtn.disabled = !canUndo;
      if (redoBtn) redoBtn.disabled = !canRedo;
      if (indicator) {
        const { undoStack, redoStack } = store.getState();
        indicator.textContent = `${undoStack.length}/${redoStack.length}`;
      }
    }
  };
  var renderHistoryList = () => {
    const container = byId("historyList");
    if (!container) return;
    const { data, currentDate } = store.getState();
    const dates = Object.keys(data).sort().reverse();
    const currentKey = store.getDateKey(currentDate);
    if (dates.length === 0) {
      container.innerHTML = '<div class="history-empty">\u6682\u65E0\u5386\u53F2\u8BB0\u5F55</div>';
      return;
    }
    container.innerHTML = dates.map((dateKey) => {
      const day = data[dateKey];
      const isCurrent = dateKey === currentKey;
      return `
            <div class="history-item ${isCurrent ? "current" : ""}" data-action="select-history-date" data-date="${dateKey}">
                <div class="history-date">
                    <div class="history-date-main">${day.date}</div>
                    <div class="history-date-weekday">${day.weekday || ""}</div>
                </div>
                <div class="history-info">
                    <div class="history-kpi">
                        <span>${LucideUtils.createIcon("clock", { size: 14 })} ${(day.metrics || day).activeTime || "-"}</span>
                        <span>${_iconSvg.checkCircle} ${(day.metrics || day).completedTasks || "-"}</span>
                        <span>${LucideUtils.createIcon("messageCircle", { size: 14 })} ${(day.metrics || day).inspirationCount || "0"}</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
  };
  var highlightText = (text, query) => {
    if (!query || !text) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapeRegex(escapedQuery)})`, "gi");
    return escapedText.replace(regex, '<mark style="background: var(--bamboo-primary); color: white; padding: 0 4px; border-radius: 4px;">$1</mark>');
  };
  var escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  var renderSearchResults = (results, query) => {
    const container = byId("searchResults");
    if (!container) return;
    if (results.length === 0) {
      container.innerHTML = `
            <div class="history-empty" style="padding: 32px 16px; text-align: center; color: var(--text-secondary);">
                <div style="margin-bottom: 12px;">${_iconSvg.search}</div>
                <div>\u6CA1\u6709\u627E\u5230\u76F8\u5173\u8BB0\u5F55</div>
            </div>
        `;
      return;
    }
    container.innerHTML = `
        <div style="padding: 8px 0 16px 0; font-size: 12px; color: var(--text-secondary);">
            \u627E\u5230 ${results.length} \u6761\u76F8\u5173\u8BB0\u5F55
        </div>
        ${results.map((result) => {
      const isCurrent = result.date === store.getDateKey();
      return `
                <div class="history-item ${isCurrent ? "current" : ""}" data-action="select-history-date" data-date="${result.date}">
                    <div class="history-date">
                        <div class="history-date-main">${result.date}</div>
                        <div class="history-date-weekday">${result.weekday || ""}</div>
                    </div>
                    <div class="history-info">
                        ${result.matches.length > 0 ? `
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                ${result.matches.map((m) => `<div>${m.field}: ${highlightText(m.value, query)}</div>`).join("")}
                            </div>
                        ` : ""}
                    </div>
                </div>
            `;
    }).join("")}
    `;
  };
  ActionDispatcher.registerMany({
    "white-noise-toggle": () => {
      if (typeof WhiteNoiseManager !== "undefined") WhiteNoiseManager.toggle();
    },
    "white-noise-prev": () => {
      if (typeof WhiteNoiseManager !== "undefined") WhiteNoiseManager.prev();
    },
    "white-noise-next": () => {
      if (typeof WhiteNoiseManager !== "undefined") WhiteNoiseManager.next();
    },
    "white-noise-panel": () => {
      if (typeof WhiteNoiseManager !== "undefined") WhiteNoiseManager.showPanel();
    },
    "ticket-flip": (_data, target) => {
      const stub = target.closest(".ticket-stub");
      if (stub) {
        const container = stub.querySelector(".ticket-flip-container");
        if (container) container.classList.toggle("flipped");
      }
    },
    "timeline-toggle": (data) => Timeline.toggle(parseInt(data.index)),
    "todo-toggle": (data) => Todo.toggle(data.todoId, data.type, data.goalId, data.itemIdx, data.isCompleted === "true"),
    "todo-toggle-completed-group": () => Todo.toggleCompletedGroup(),
    "select-history-date": (data) => Handlers.selectHistoryDate(data.date)
  });
  window.renderSkeleton = renderSkeleton;
  window.renderAll = renderAll2;
  window.createDefaultSection = createDefaultSection;
  var setupTimelineHoverEffects = () => {
    const container = byId("sectionsContainer");
    if (!container || container._hoverBound) return;
    container.addEventListener("mousemove", (e) => {
      const header = e.target.closest(".bamboo-card-header");
      if (!header) return;
      const rect = header.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 100;
      const y = (e.clientY - rect.top) / rect.height * 100;
      header.style.setProperty("--mouse-x", `${x}%`);
      header.style.setProperty("--mouse-y", `${y}%`);
    });
    container.addEventListener("mouseleave", (e) => {
      const header = e.target.closest(".bamboo-card-header");
      if (!header) return;
      header.style.setProperty("--mouse-x", "50%");
      header.style.setProperty("--mouse-y", "50%");
    }, true);
    container._hoverBound = true;
  };
  window.setupTimelineHoverEffects = setupTimelineHoverEffects;
  var setupBambooTooltips = (container = getDomRoot()) => {
    if (container._tooltipBound) return;
    container._tooltipBound = true;
    let tooltip = $(".bamboo-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "bamboo-tooltip";
      modalMount().appendChild(tooltip);
    }
    const counts = $$(".bamboo-count");
    counts.forEach((count) => {
      count.addEventListener("mouseenter", () => {
        const hint = count.dataset.hint;
        if (!hint) return;
        tooltip.textContent = hint;
        tooltip.style.opacity = "1";
        const rect = count.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top - tooltipRect.height - 8;
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
        top = Math.max(8, top);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      });
      count.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
      });
      count.addEventListener("mousemove", () => {
        const rect = count.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top - tooltipRect.height - 8;
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
        top = Math.max(8, top);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      });
    });
  };
  window.setupBambooTooltips = setupBambooTooltips;
  window.renderDate = renderDate;
  window.computeActiveDuration = computeActiveDuration;
  window.buildStubBackHTML = buildStubBackHTML;
  window.buildTicketHTML = buildTicketHTML;
  window.getPeriodDotStates = getPeriodDotStates;
  window.buildPeriodDotsHTML = buildPeriodDotsHTML;
  window.isCurrentPeriod = isCurrentPeriod;
  window.buildBambooNodeHTML = buildBambooNodeHTML;
  window.buildBambooPathHTML = buildBambooPathHTML;
  window.getActivePeriod = getActivePeriod;
  window.renderTimelineSection = renderTimelineSection;
  window.renderGoalsSection = renderGoalsSection;
  window.renderTodoSection = renderTodoSection;
  window.renderUndoRedoBar = renderUndoRedoBar;
  window.renderHistoryList = renderHistoryList;
  window.highlightText = highlightText;
  window.escapeRegex = escapeRegex;
  window.renderSearchResults = renderSearchResults;

  // assets/scripts/handlers/navigation.js
  var navigation_exports = {};
  __export(navigation_exports, {
    Navigation: () => Navigation2
  });
  var Navigation2 = {
    _initialized: false,
    init() {
      if (this._initialized) {
        return;
      }
      this._initialized = true;
      this.setupDateNavigation();
    },
    setupDateNavigation() {
      byId("prevDay")?.addEventListener("click", () => {
        store.navigateDate(-1);
        renderAll();
      });
      byId("nextDay")?.addEventListener("click", () => {
        store.navigateDate(1);
        renderAll();
      });
    },
    openDatePicker() {
      Handlers.openDatePicker();
    }
  };
  window.Navigation = Navigation2;

  // assets/scripts/handlers/keyboard.js
  var keyboard_exports = {};
  __export(keyboard_exports, {
    Keyboard: () => Keyboard2
  });
  var Keyboard2 = {
    _initialized: false,
    init() {
      if (this._initialized) {
        return;
      }
      this._initialized = true;
      this.setupKeyboardShortcuts();
    },
    setupKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        const modal = $(".modal-content");
        if (modal) {
          if (e.key === "Tab" || e.key === "Escape") {
            Handlers.setupModalFocusTrap(e);
            return;
          }
        }
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case "s":
              e.preventDefault();
              store.scheduleAutoSave();
              Toast.showToast("\u5DF2\u81EA\u52A8\u4FDD\u5B58", "success");
              return;
          }
        }
        switch (e.key.toLowerCase()) {
          case "arrowleft":
            store.navigateDate(-1);
            renderAll();
            break;
          case "arrowright":
            store.navigateDate(1);
            renderAll();
            break;
          case "escape":
            if (FABManager.isOpen) {
              FABManager.close();
            }
            break;
          case "?":
            e.preventDefault();
            this.showKeyboardHelp();
            break;
          case "h":
            if (!e.ctrlKey && !e.metaKey) {
              this.showKeyboardHelp();
            }
            break;
          case "t":
            Handlers.goToToday();
            break;
          // 目标地图快捷键（无组合键，非输入框中触发）
          case "a":
            if (!e.ctrlKey && !e.metaKey) {
              if (byId("goalList")) {
                e.preventDefault();
                if (typeof GoalsEditor !== "undefined" && GoalsEditor.startAddInline) {
                  GoalsEditor.startAddInline();
                }
              }
            }
            break;
          case "s":
            if (!e.ctrlKey && !e.metaKey) {
              if (byId("goalList")) {
                e.preventDefault();
                if (typeof StatsModal !== "undefined" && StatsModal.open) {
                  StatsModal.open();
                }
              }
            }
            break;
        }
      });
    },
    showKeyboardHelp() {
      const shortcuts = [
        { key: "\u2190 / \u2192", desc: "\u5207\u6362\u65E5\u671F\uFF08\u524D\u4E00\u5929/\u540E\u4E00\u5929\uFF09" },
        { key: "T", desc: "\u8DF3\u8F6C\u5230\u4ECA\u5929" },
        { key: "Ctrl+S", desc: "\u4FDD\u5B58" },
        { key: "Esc", desc: "\u5173\u95ED\u5F39\u7A97\u6216\u83DC\u5355" },
        { key: "? / H", desc: "\u663E\u793A\u5FEB\u6377\u952E\u5E2E\u52A9" },
        { key: "Tab", desc: "\u5207\u6362\u7126\u70B9\uFF08\u5728\u5F39\u7A97\u4E2D\uFF09" }
      ];
      const content = `
            <div class="help-section">
                <div class="help-title" style="font-size: 18px; font-weight: 700; color: var(--bamboo-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                    ${typeof LucideUtils !== "undefined" ? LucideUtils.createIcon("keyboard", { size: 24 }) : ""} \u952E\u76D8\u5FEB\u6377\u952E
                </div>
                <div style="display: grid; gap: 12px;">
                    ${shortcuts.map((s) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: linear-gradient(135deg, hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.08), hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.03)); border-radius: 12px;">
                            <div style="font-weight: 600; color: var(--text-primary);">${s.desc}</div>
                            <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 6px 12px; background: var(--bamboo-primary); color: white; border-radius: 8px; font-weight: 600;">${s.key}</div>
                        </div>
                    `).join("")}
                </div>
                <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, rgba(135, 206, 235, 0.1), hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.05)); border-radius: 12px; border: 1px dashed hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.2);">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u63D0\u793A</div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                        \u53EF\u4EE5\u968F\u65F6\u6309 <strong style="color: var(--bamboo-primary);">?</strong> \u6216 <strong style="color: var(--bamboo-primary);">H</strong> \u663E\u793A\u6B64\u5E2E\u52A9\u9762\u677F
                    </div>
                </div>
            </div>
        `;
      Handlers.openModal(content, "\u5FEB\u6377\u952E\u6307\u5357");
    }
  };
  window.Keyboard = Keyboard2;

  // assets/scripts/handlers/gestures.js
  var gestures_exports = {};
  __export(gestures_exports, {
    Gestures: () => Gestures2
  });
  var Gestures2 = {
    minSwipeDistance: 50,
    swipeEnabled: true,
    startY: 0,
    isScrolling: false,
    init() {
      this.loadSettings();
      this.setupSwipeGestures();
    },
    loadSettings() {
      const saved = StorageAdapter.get(StorageKeys.ENABLE_SWIPE);
      this.swipeEnabled = saved !== "false";
    },
    setupSwipeGestures() {
      const container = byId("reviewContainer") || byId("sectionsContainer");
      if (!container) return;
      let startX = 0;
      let diffX = 0;
      container.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.isScrolling = false;
      }, { passive: true });
      container.addEventListener("touchmove", (e) => {
        const diffY = Math.abs(e.touches[0].clientY - this.startY);
        if (diffY > 10) {
          this.isScrolling = true;
        }
      }, { passive: true });
      container.addEventListener("touchend", (e) => {
        if (!this.swipeEnabled || this.isScrolling) return;
        diffX = e.changedTouches[0].clientX - startX;
        if (Math.abs(diffX) > this.minSwipeDistance) {
          e.preventDefault();
          if (diffX > 0) {
            store.navigateDate(-1);
            renderAll();
          } else {
            store.navigateDate(1);
            renderAll();
          }
        }
      }, { passive: false });
    },
    scrollToSection(id) {
      const el = byId(id);
      if (!el || !el.isConnected) return;
      let rect;
      try {
        rect = el.getBoundingClientRect();
      } catch (e) {
        return;
      }
      if (!rect || rect.width === 0 && rect.height === 0) return;
      const headerOffset = 100;
      const elementPosition = rect.top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  window.Gestures = Gestures2;

  // assets/scripts/handlers/quickNav.js
  var quickNav_exports = {};
  __export(quickNav_exports, {
    QuickNav: () => QuickNav2
  });
  var QuickNav2 = {
    sections: [
      { id: "timelinePath", icon: "clock", label: "\u6D3B\u52A8\u65F6\u95F4\u7EBF" },
      { id: "goalList", icon: "map", label: "\u76EE\u6807\u5730\u56FE" }
    ],
    actions: [
      { id: "achievements", icon: "trophy", label: "\u6211\u7684\u6210\u5C31", action: "stats-modal-open-achievements" }
    ],
    init() {
      this.setupQuickNavigation();
      this.setupScrollSpy();
      this.setupKeyboardNav();
    },
    setupQuickNavigation() {
      const container = byId("reviewContainer");
      if (!container) return;
      let nav = $(".quick-nav");
      if (nav) {
        nav.remove();
      }
      nav = document.createElement("nav");
      nav.className = "quick-nav";
      nav.setAttribute("aria-label", "\u5FEB\u901F\u5BFC\u822A");
      let buttonsHtml = `<button class="quick-nav-toggle" data-action="quick-nav-toggle" title="\u5C55\u5F00/\u6536\u8D77\u5BFC\u822A">${typeof LucideUtils !== "undefined" ? LucideUtils.createIcon("bookOpen", { size: 18 }) : ""}</button>`;
      this.sections.forEach((section) => {
        buttonsHtml += `
                <button class="quick-nav-btn" data-action="quick-nav-scroll-to" data-section-id="${section.id}" title="${section.label}" data-section="${section.id}">
                    ${typeof LucideUtils !== "undefined" ? LucideUtils.createIcon(section.icon, { size: 18 }) : ""}
                    <span class="quick-nav-btn-tooltip">${section.label}</span>
                </button>
            `;
      });
      if (this.actions && this.actions.length > 0) {
        buttonsHtml += `<div class="quick-nav-divider"></div>`;
        this.actions.forEach((act) => {
          buttonsHtml += `
                    <button class="quick-nav-btn quick-nav-action-btn" data-action="${act.action}" title="${act.label}">
                        ${typeof LucideUtils !== "undefined" ? LucideUtils.createIcon(act.icon, { size: 18 }) : ""}
                        <span class="quick-nav-btn-tooltip">${act.label}</span>
                    </button>
                `;
        });
      }
      nav.innerHTML = buttonsHtml;
      modalMount().appendChild(nav);
    },
    toggle(e) {
      if (e) e.stopPropagation();
      const nav = $(".quick-nav");
      nav.classList.toggle("expanded");
      const btn = nav.querySelector(".quick-nav-toggle");
      btn.innerHTML = typeof LucideUtils !== "undefined" ? LucideUtils.createIcon(nav.classList.contains("expanded") ? "bookClosed" : "bookOpen", { size: 18 }) : "";
    },
    scrollToSection(id) {
      scrollToSection(id);
    },
    setupScrollSpy() {
      let scrollTimeout;
      const updateActiveSection = () => {
        const scrollPos = window.scrollY + 300;
        const buttons = $$(".quick-nav-btn");
        let currentSection = null;
        this.sections.forEach((section) => {
          const el = byId(section.id);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              currentSection = section.id;
            }
          }
        });
        buttons.forEach((btn) => {
          const isActive = btn.dataset.section === currentSection;
          btn.classList.toggle("active", isActive);
        });
      };
      const onScroll = () => {
        if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(updateActiveSection);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      updateActiveSection();
    },
    setupKeyboardNav() {
      document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        const num = parseInt(e.key);
        if (num >= 1 && num <= this.sections.length) {
          this.scrollToSection(this.sections[num - 1].id);
        }
        if (e.key === "Escape") {
          const nav = $(".quick-nav");
          if (nav.classList.contains("expanded")) {
            this.toggle();
          }
        }
      });
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  ActionDispatcher.registerMany({
    "quick-nav-toggle": (ds, target, e) => QuickNav2.toggle(e),
    "quick-nav-scroll-to": (ds) => QuickNav2.scrollToSection(ds.sectionId)
  });
  window.QuickNav = QuickNav2;

  // assets/scripts/handlers/fabManager.js
  var fabManager_exports = {};
  __export(fabManager_exports, {
    FABManager: () => FABManager2
  });
  var FABManager2 = {
    container: null,
    mainBtn: null,
    actions: null,
    isOpen: false,
    _initialized: false,
    init() {
      if (this._initialized) return;
      this._initialized = true;
      this.container = $(".fab-container");
      this.mainBtn = byId("fabMain");
      this.actions = byId("fabActions");
      if (!this.container || !this.mainBtn || !this.actions) return;
      this.container.style.display = "flex";
      this.container.style.opacity = "1";
      this.container.style.visibility = "visible";
      this.loadSavedPosition();
      this.setupDrag();
      this.setupKeyboardSupport();
      this.setupOutsideClick();
      this.setupResponsive();
    },
    loadSavedPosition() {
      const saved = StorageAdapter.get(StorageKeys.FAB_POSITION);
      if (saved) {
        const { right, bottom } = JSON.parse(saved);
        this.container.style.right = right + "px";
        this.container.style.bottom = bottom + "px";
      }
    },
    savePosition() {
      const r = parseInt(this.container.style.right) || 16;
      const b = parseInt(this.container.style.bottom) || 20;
      StorageAdapter.set(StorageKeys.FAB_POSITION, JSON.stringify({ right: r, bottom: b }));
    },
    getViewport() {
      const vv = window.visualViewport;
      if (vv) {
        return { width: vv.width, height: vv.height };
      }
      return { width: window.innerWidth, height: window.innerHeight };
    },
    setupResponsive() {
      const update = () => {
        const w = window.innerWidth;
        let bs = 52, bt = 20, rt = 16;
        if (w >= 1024) {
          bs = 56;
          bt = 24;
          rt = 20;
        }
        if (!StorageAdapter.get(StorageKeys.FAB_POSITION)) {
          this.container.style.bottom = bt + "px";
          this.container.style.right = rt + "px";
        }
        this.mainBtn.style.width = bs + "px";
        this.mainBtn.style.height = bs + "px";
        if (this.isOpen) this.positionPanel();
      };
      update();
      window.addEventListener("resize", update);
      window.addEventListener("orientationchange", update);
    },
    setupDrag() {
      let isDragging = false;
      let startX = 0, startY = 0;
      let startRight = 0, startBottom = 0;
      let hasMoved = false;
      const onStart = (x, y) => {
        isDragging = true;
        hasMoved = false;
        startX = x;
        startY = y;
        startRight = parseInt(this.container.style.right) || 16;
        startBottom = parseInt(this.container.style.bottom) || 20;
        if (this.isOpen) this.close();
        this.container.classList.add("dragging");
      };
      const onMove = (x, y) => {
        if (!isDragging) return;
        const dx = startX - x;
        const dy = startY - y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
        const sz = parseInt(this.mainBtn.style.width) || 56;
        const vp = this.getViewport();
        this.container.style.right = Math.max(0, Math.min(vp.width - sz, startRight + dx)) + "px";
        this.container.style.bottom = Math.max(0, Math.min(vp.height - sz, startBottom + dy)) + "px";
      };
      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        this.container.classList.remove("dragging");
        if (hasMoved) this.savePosition();
      };
      this.mainBtn.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        onStart(e.clientX, e.clientY);
      });
      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        onMove(e.clientX, e.clientY);
      });
      document.addEventListener("mouseup", onEnd);
      this.mainBtn.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        const t = e.touches[0];
        onStart(t.clientX, t.clientY);
      }, { passive: false });
      document.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const t = e.touches[0];
        onMove(t.clientX, t.clientY);
      }, { passive: false });
      document.addEventListener("touchend", onEnd);
      this.mainBtn.addEventListener("click", () => {
        if (hasMoved) {
          hasMoved = false;
          return;
        }
        this.toggle();
      });
    },
    setupKeyboardSupport() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          e.preventDefault();
          this.close();
          this.mainBtn.focus();
          return;
        }
        if (!this.isOpen) return;
        const buttons = this.getMenuButtons();
        const currentIndex = buttons.indexOf(document.activeElement);
        switch (e.key) {
          case "ArrowDown":
          case "ArrowRight":
            e.preventDefault();
            const nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
            buttons[nextIndex].focus();
            break;
          case "ArrowUp":
          case "ArrowLeft":
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
            buttons[prevIndex].focus();
            break;
          case "Home":
            e.preventDefault();
            if (buttons.length > 0) buttons[0].focus();
            break;
          case "End":
            e.preventDefault();
            if (buttons.length > 0) buttons[buttons.length - 1].focus();
            break;
          case "Tab":
            e.preventDefault();
            if (e.shiftKey) {
              const prevIdx = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
              buttons[prevIdx].focus();
            } else {
              const nextIdx = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
              buttons[nextIdx].focus();
            }
            break;
        }
      });
    },
    getMenuButtons() {
      return Array.from(this.actions.querySelectorAll(".fab-action-btn"));
    },
    // Shadow DOM 下事件 e.target 会被 retarget 成 host，故用 composedPath()
    // 取真实路径（含 shadow 内节点）判断点击是否落在容器内，兼容 kill-switch 回退。
    _eventInside(e, node) {
      if (!node) return false;
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      return path.length ? path.includes(node) : node.contains(e.target);
    },
    setupOutsideClick() {
      document.addEventListener("click", (e) => {
        if (this.isOpen && !this._eventInside(e, this.container)) this.close();
      });
    },
    toggle() {
      this.isOpen ? this.close() : this.open();
    },
    positionPanel() {
      if (!this.mainBtn || !this.mainBtn.isConnected) return;
      let btnRect;
      try {
        btnRect = this.mainBtn.getBoundingClientRect();
      } catch (e) {
        return;
      }
      if (!btnRect || btnRect.width === 0 && btnRect.height === 0) {
        return;
      }
      const vp = this.getViewport();
      const spaceAbove = btnRect.top;
      const spaceBelow = vp.height - btnRect.bottom;
      const spaceToLeft = btnRect.left;
      const gap = 8;
      const panelW = this.actions.scrollWidth || 220;
      const panelH = this.actions.scrollHeight || 200;
      this.container.classList.remove("fab-below", "fab-align-left");
      if (spaceAbove < panelH + gap && spaceBelow > spaceAbove) {
        this.container.classList.add("fab-below");
        this.actions.style.maxHeight = Math.min(vp.height * 0.8, spaceBelow - gap) + "px";
      } else {
        this.actions.style.maxHeight = Math.min(vp.height * 0.8, spaceAbove - gap) + "px";
      }
      if (spaceToLeft < panelW) {
        this.container.classList.add("fab-align-left");
      }
      const maxW = Math.min(panelW, vp.width - 12);
      this.actions.style.width = maxW + "px";
    },
    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.positionPanel();
      this.mainBtn.classList.add("open");
      this.mainBtn.setAttribute("aria-expanded", "true");
      this.actions.classList.add("open");
      this.container.classList.add("fab-open");
      requestAnimationFrame(() => {
        const buttons = this.getMenuButtons();
        if (buttons.length > 0) {
          buttons[0].focus();
        }
      });
    },
    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.mainBtn.classList.remove("open");
      this.mainBtn.setAttribute("aria-expanded", "false");
      this.actions.classList.remove("open");
      this.container.classList.remove("fab-open");
      this.container.classList.remove("fab-below", "fab-align-left");
      this.actions.style.maxHeight = "";
      this.actions.style.width = "";
    }
  };
  window.FABManager = FABManager2;

  // assets/scripts/handlers/handlers.js
  var handlers_exports = {};
  __export(handlers_exports, {
    Handlers: () => Handlers2
  });
  var Handlers2 = {
    modalFocusStack: [],
    lastFocusedElement: null,
    _modalFocusCache: null,
    _modalObserver: null,
    _initialized: false,
    init() {
      if (this._initialized) {
        return;
      }
      this._initialized = true;
      this.setupGlobalErrorHandler();
      Navigation.init();
      this.setupFabMenu();
      Keyboard.init();
      Gestures.init();
      QuickNav.init();
      ThemeSelector.updateDarkModeButton();
      if (typeof WeatherRenderer !== "undefined" && typeof WeatherRenderer.init === "function") {
        try {
          WeatherRenderer.init();
        } catch (e) {
        }
      }
      if (typeof QuoteRenderer !== "undefined" && typeof QuoteRenderer.init === "function") {
        try {
          QuoteRenderer.init();
        } catch (e) {
        }
      }
    },
    setupGlobalErrorHandler() {
      window.addEventListener("error", (e) => {
        const message = e.message || "\u672A\u77E5\u9519\u8BEF";
        const source = e.filename || "";
        const line = e.lineno || 0;
        console.error(`[Error] ${message} at ${source}:${line}`);
        if (!message.includes("ResizeObserver") && !message.includes("Script error") && !message.includes("getBoundingClientRect") && source) {
          Toast.showToast(`\u51FA\u73B0\u4E86\u5C0F\u95EE\u9898\uFF0C\u8BF7\u5237\u65B0\u9875\u9762`, "error");
        }
      });
      window.addEventListener("unhandledrejection", (e) => {
        console.error("[Unhandled Promise Rejection]", e.reason);
        if (e.reason && typeof e.reason === "string" && !e.reason.includes("ResizeObserver")) {
          Toast.showToast(`\u7F51\u7EDC\u4E0D\u7A33\u5B9A\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5`, "error");
        }
      });
    },
    setupFabMenu() {
      FABManager.init();
    },
    openModal(content, title = "\u7F16\u8F91") {
      this.lastFocusedElement = document.activeElement;
      const container = byId("modalContainer");
      if (!container) return;
      const titleId = "modal-title-" + Date.now();
      container.innerHTML = `
            <div class="modal-overlay" data-action="close-modal-overlay" role="presentation">
                <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="${titleId}" data-stop-propagation>
                    <div class="modal-header">
                        <div class="modal-title" id="${titleId}"></div>
                        <button class="modal-close" data-action="close-modal" aria-label="\u5173\u95ED\u5F39\u7A97">${LucideUtils.createIcon("x", { size: 16 })}</button>
                    </div>
                    <div class="modal-body" id="modalBody" role="document">
                        ${content}
                    </div>
                </div>
            </div>
        `;
      const titleEl = container.querySelector(".modal-title");
      if (titleEl) titleEl.textContent = title;
      const closeBtn = container.querySelector(".modal-close");
      const modal = container.querySelector(".modal-content");
      this.updateModalFocusCache();
      this._setupModalContentObserver(modal);
      const focusable = this._modalFocusCache;
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else if (closeBtn) {
        closeBtn.focus();
      }
      this.modalFocusStack = [closeBtn];
      const _scrollHost = getHost() || document.body;
      _scrollHost.style.overflow = "hidden";
    },
    closeModal(event) {
      if (event && event.target) {
        const overlayEl = event.target.closest(".modal-overlay") || event.target;
        if (event.target !== overlayEl) return;
      }
      if (this._modalObserver) {
        this._modalObserver.disconnect();
        this._modalObserver = null;
      }
      const container = byId("modalContainer");
      if (container) container.innerHTML = "";
      this._modalFocusCache = null;
      const _scrollHost = getHost() || document.body;
      _scrollHost.style.overflow = "";
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }
    },
    setupModalFocusTrap(e) {
      const focusable = this._modalFocusCache;
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === "Escape") {
        this.closeModal();
      }
    },
    updateModalFocusCache() {
      const modal = $(".modal-content");
      if (!modal) {
        this._modalFocusCache = null;
        return;
      }
      this._modalFocusCache = modal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    },
    _setupModalContentObserver(modal) {
      if (this._modalObserver) {
        this._modalObserver.disconnect();
      }
      this._modalObserver = new MutationObserver(() => {
        requestAnimationFrame(() => {
          this.updateModalFocusCache();
        });
      });
      this._modalObserver.observe(modal, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["tabindex", "disabled"]
      });
    },
    openDatePicker() {
      DatePicker.open();
    },
    goToSelectedDate() {
      DatePicker.goToSelectedDate();
    },
    goToToday() {
      DatePicker.goToToday();
    },
    selectHistoryDate(dateStr) {
      store.goToDate(dateStr);
      renderAll();
      this.closeModal();
    },
    openSettingsModal() {
      SettingsModal.open();
    },
    setDarkMode(isDark) {
      store.setDarkMode(isDark);
      if (typeof ThemeSelector !== "undefined") {
        ThemeSelector.updateDarkModeButton();
      }
    },
    updateDarkModeButton() {
      if (typeof ThemeSelector !== "undefined") {
        ThemeSelector.updateDarkModeButton();
      }
    },
    handleImportFile(event) {
      DataIO.handleImportFile(event);
    },
    importDataFromTextarea() {
      DataIO.importFromTextarea();
    }
  };
  ActionDispatcher.registerMany({
    "close-modal": () => Handlers2.closeModal(),
    "close-modal-overlay": (data, target, e) => Handlers2.closeModal(e),
    "export-data": () => DataIO.exportData(),
    "import-from-textarea": () => DataIO.importFromTextarea(),
    "toggle-dark-mode": () => {
      store.setDarkMode();
      Handlers2.updateDarkModeButton();
    },
    "open-date-picker": () => Handlers2.openDatePicker(),
    "fab-strategy": () => {
      if (typeof GoalsRenderer !== "undefined") GoalsRenderer.openHealthScoreDetail();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-shop": () => {
      if (typeof ShopManager !== "undefined") ShopManager.open();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-archive": () => {
      if (typeof GoalsRenderer !== "undefined") GoalsRenderer.openArchiveManager();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-sections": () => {
      if (typeof SectionManager !== "undefined") SectionManager.openManager();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-achievements": () => {
      if (typeof StatsModal !== "undefined") StatsModal.openAchievements();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-dark-mode": () => {
      store.setDarkMode();
      if (typeof ThemeSelector !== "undefined") ThemeSelector.updateDarkModeButton();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-white-noise": () => {
      if (typeof WhiteNoiseManager !== "undefined") WhiteNoiseManager.togglePanel();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-settings": () => {
      if (typeof SettingsModal !== "undefined") SettingsModal.open();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-display": () => {
      if (typeof DisplayManager !== "undefined") DisplayManager.toggle();
      if (typeof FABManager !== "undefined") FABManager.close();
    },
    "fab-theme": () => {
      if (typeof window.ThemeEffects !== "undefined") window.ThemeEffects.showThemePanel();
      if (typeof FABManager !== "undefined") FABManager.close();
    }
  });
  window.Handlers = Handlers2;

  // assets/scripts/handlers/datePicker.js
  var datePicker_exports = {};
  window.DatePicker = {
    _currentYear: 0,
    _currentMonth: 0,
    _datesWithTasks: null,
    // 缓存有任务的日期
    open() {
      const { currentDate } = store.getState();
      this._currentYear = currentDate.getFullYear();
      this._currentMonth = currentDate.getMonth();
      this._datesWithTasks = this._getDatesWithTasks();
      const today = /* @__PURE__ */ new Date();
      const content = `
            <div class="wn-section">
                <div class="wn-date-header">
                    <button class="wn-date-nav" data-action="calendar-prev-month" aria-label="\u4E0A\u4E00\u6708">
                        ${LucideUtils.createIcon("chevronLeft", { size: 16 })}
                    </button>
                    <span class="wn-date-title" id="calendarMonth">${this._currentYear}\u5E74${this._currentMonth + 1}\u6708</span>
                    <button class="wn-date-nav" data-action="calendar-next-month" aria-label="\u4E0B\u4E00\u6708">
                        ${LucideUtils.createIcon("chevronRight", { size: 16 })}
                    </button>
                </div>
                <div class="wn-date-weekdays" role="row" aria-label="\u661F\u671F\u6807\u9898">
                    <span role="columnheader">\u65E5</span>
                    <span role="columnheader">\u4E00</span>
                    <span role="columnheader">\u4E8C</span>
                    <span role="columnheader">\u4E09</span>
                    <span role="columnheader">\u56DB</span>
                    <span role="columnheader">\u4E94</span>
                    <span role="columnheader">\u516D</span>
                </div>
                <div class="wn-date-grid" id="calendarDays" role="grid" aria-label="\u65E5\u5386\u7F51\u683C">
                    ${this._generateCalendarDays()}
                </div>
            </div>
            
            <div class="wn-section">
                <div style="display: flex; gap: 6px;" role="group" aria-label="\u5FEB\u6377\u65E5\u671F\u9009\u62E9">
                    <button class="wn-type-btn" data-action="quick-select-date" data-date="${this._formatDate(this._addDays(today, -7))}" data-label="\u4E0A\u5468" aria-label="\u8DF3\u8F6C\u5230\u4E0A\u5468">
                        ${LucideUtils.createIcon("chevronLeft", { size: 14 })}
                        <span>\u4E0A\u5468</span>
                    </button>
                    <button class="wn-type-btn active" data-action="quick-select-date" data-date="${this._formatDate(today)}" data-label="\u4ECA\u5929" aria-label="\u8DF3\u8F6C\u5230\u4ECA\u5929">
                        ${LucideUtils.createIcon("calendar", { size: 14 })}
                        <span>\u4ECA\u5929</span>
                    </button>
                    <button class="wn-type-btn" data-action="quick-select-date" data-date="${this._formatDate(this._addDays(today, 7))}" data-label="\u4E0B\u5468" aria-label="\u8DF3\u8F6C\u5230\u4E0B\u5468">
                        ${LucideUtils.createIcon("chevronRight", { size: 14 })}
                        <span>\u4E0B\u5468</span>
                    </button>
                </div>
            </div>
        `;
      PanelManager.open("date-picker", LucideUtils.createIcon("calendar", { size: 16 }) + "\u9009\u62E9\u65E5\u671F", content);
    },
    _formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },
    _addDays(date, days) {
      const result = new Date(date);
      result.setDate(date.getDate() + days);
      return result;
    },
    /**
     * 获取有任务/活动的日期列表
     * 用于在日历上显示标记点
     */
    _getDatesWithTasks() {
      const datesWithTasks = /* @__PURE__ */ new Set();
      const state = store.getState();
      if (state.data) {
        Object.keys(state.data).forEach((dateKey) => {
          const dayData = state.data[dateKey];
          const hasTimeline = dayData.timeline && dayData.timeline.length > 0;
          const hasGoalTasks = dayData.goalTaskCompletions && Object.keys(dayData.goalTaskCompletions).length > 0;
          if (hasTimeline || hasGoalTasks) {
            datesWithTasks.add(dateKey);
          }
        });
      }
      return datesWithTasks;
    },
    _generateCalendarDays() {
      const firstDay = new Date(this._currentYear, this._currentMonth, 1);
      const lastDay = new Date(this._currentYear, this._currentMonth + 1, 0);
      const startDay = firstDay.getDay();
      const totalDays = lastDay.getDate();
      const today = /* @__PURE__ */ new Date();
      const todayStr = this._formatDate(today);
      const { currentDate } = store.getState();
      const currentStr = this._formatDate(currentDate);
      let html = "";
      for (let i = 0; i < startDay; i++) {
        html += '<div class="wn-date-day wn-date-empty" role="gridcell" aria-hidden="true"></div>';
      }
      for (let day = 1; day <= totalDays; day++) {
        const dateStr = this._formatDate(new Date(this._currentYear, this._currentMonth, day));
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === currentStr;
        const hasTask = this._datesWithTasks && this._datesWithTasks.has(dateStr);
        let tooltipText = `${this._currentYear}\u5E74${this._currentMonth + 1}\u6708${day}\u65E5`;
        if (hasTask) {
          tooltipText += " - \u6709\u4EFB\u52A1\u8BB0\u5F55";
        }
        if (isToday) {
          tooltipText += " - \u4ECA\u5929";
        }
        if (isSelected) {
          tooltipText += " - \u5F53\u524D\u9009\u4E2D";
        }
        html += `
                <div class="wn-date-day ${isToday ? "wn-date-today" : ""} ${isSelected ? "wn-date-selected" : ""} ${hasTask ? "wn-date-has-task" : ""}"
                     data-action="quick-select-date" 
                     data-date="${dateStr}" 
                     data-label="${this._currentYear}\u5E74${this._currentMonth + 1}\u6708${day}\u65E5"
                     role="gridcell"
                     aria-label="${tooltipText}"
                     tabindex="${isSelected ? "0" : "-1"}"
                     title="${tooltipText}">
                    <span class="wn-date-num">${day}</span>
                    ${hasTask ? '<span class="wn-date-dot" aria-hidden="true"></span>' : ""}
                </div>
            `;
      }
      return html;
    },
    _updateCalendar(direction) {
      if (direction === "prev") {
        if (this._currentMonth === 0) {
          this._currentMonth = 11;
          this._currentYear--;
        } else {
          this._currentMonth--;
        }
      } else {
        if (this._currentMonth === 11) {
          this._currentMonth = 0;
          this._currentYear++;
        } else {
          this._currentMonth++;
        }
      }
      const calendarDays = byId("calendarDays");
      const calendarMonth = byId("calendarMonth");
      if (calendarDays) {
        calendarDays.innerHTML = this._generateCalendarDays();
      }
      if (calendarMonth) {
        calendarMonth.textContent = `${this._currentYear}\u5E74${this._currentMonth + 1}\u6708`;
      }
    },
    quickSelect(dateStr, label) {
      const input = byId("date-picker-input");
      if (input) {
        input.value = dateStr;
      }
      const [y, m, d] = dateStr.split("-").map(Number);
      const newDate = new Date(y, m - 1, d);
      if (!this._validateDate(newDate)) {
        Toast.showToast("\u65E5\u671F\u65E0\u6548", "error");
        return;
      }
      store.goToDate(newDate);
      renderAll();
      PanelManager.close();
      Toast.showToast(`\u5DF2\u8DF3\u8F6C\u5230${label}`, "success");
    },
    goToSelectedDate() {
      const input = byId("date-picker-input");
      if (!input || !input.value) {
        Toast.showToast("\u8BF7\u9009\u62E9\u65E5\u671F", "warning");
        return;
      }
      const [y, m, d] = input.value.split("-").map(Number);
      const newDate = new Date(y, m - 1, d);
      if (!this._validateDate(newDate)) {
        Toast.showToast("\u8BF7\u8F93\u5165\u6709\u6548\u7684\u65E5\u671F", "error");
        return;
      }
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      newDate.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 365);
      if (newDate > maxDate) {
        Toast.showToast("\u65E5\u671F\u4E0D\u80FD\u8D85\u8FC7\u4E00\u5E74\u540E", "warning");
        return;
      }
      store.goToDate(newDate);
      renderAll();
      PanelManager.close();
      Toast.showToast("\u5DF2\u8DF3\u8F6C\u5230\u9009\u62E9\u7684\u65E5\u671F", "success");
    },
    goToToday() {
      const today = /* @__PURE__ */ new Date();
      store.goToDate(today);
      renderAll();
      PanelManager.close();
      Toast.showToast("\u5DF2\u56DE\u5230\u4ECA\u5929", "success");
    },
    close() {
      PanelManager.close();
    },
    _validateDate(date) {
      return date instanceof Date && !isNaN(date.getTime());
    }
  };
  ActionDispatcher.registerMany({
    "quick-select-date": (data) => DatePicker.quickSelect(data.date, data.label),
    "goto-today": () => DatePicker.goToToday(),
    "goto-selected-date": () => DatePicker.goToSelectedDate(),
    "calendar-prev-month": () => DatePicker._updateCalendar("prev"),
    "calendar-next-month": () => DatePicker._updateCalendar("next")
  });

  // assets/scripts/handlers/themeSelector.js
  var themeSelector_exports = {};
  window.ThemeSelector = {
    setDarkMode(isDark) {
      store.setDarkMode(isDark);
      this.updateDarkModeButton();
    },
    updateDarkModeButton() {
      const icon = byId("darkModeIcon");
      const text = byId("darkModeText");
      if (icon && text) {
        const { ui } = store.getState();
        if (ui.isDarkMode) {
          icon.innerHTML = LucideUtils.createIcon("sun", { size: 18 });
          text.textContent = "\u65E5\u95F4\u6A21\u5F0F";
        } else {
          icon.innerHTML = LucideUtils.createIcon("moon", { size: 18 });
          text.textContent = "\u591C\u95F4\u6A21\u5F0F";
        }
      }
    }
  };

  // assets/scripts/handlers/dataIO.js
  var dataIO_exports = {};
  window.DataIO = {
    /**
     * 导出全部数据为 JSON 文件（从 store 迁入）
     */
    async exportData() {
      let data = null;
      try {
        data = await storageManager.exportAllData();
      } catch (e) {
        console.warn("storageManager.exportAllData failed, using state directly:", e);
      }
      if (!data || Object.keys(data).length === 0 || !data.days) {
        const s = store.getState();
        data = {
          version: DATA_VERSION,
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          storageType: "state-fallback",
          days: s.data,
          goals: s.globalGoals || [],
          purchaseHistory: s.purchaseHistory,
          incomeHistory: s.incomeHistory,
          settings: {
            theme: s.ui.isDarkMode ? "dark" : "light",
            colorTheme: s.ui.currentTheme || "bamboo",
            balance: s.balance,
            shopStats: s.stats
          }
        };
      }
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `daily-review-data-${store.getDateKey()}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    /**
     * 导入数据（从 store 迁入）
     */
    async importData(backupData, options = {}) {
      try {
        const data = typeof backupData === "string" ? JSON.parse(backupData) : backupData;
        if (!data || typeof data !== "object") {
          throw new Error("\u65E0\u6548\u7684\u5907\u4EFD\u6587\u4EF6");
        }
        const hasAnyData = data.days || data.data || data.goals || data.globalGoals || data.settings || data.purchaseHistory || data.incomeHistory;
        if (!hasAnyData) {
          throw new Error("\u5907\u4EFD\u6587\u4EF6\u4E3A\u7A7A");
        }
        await storageManager.importData(data, options);
        await store.loadFromStorage();
        store._recalibrateStats();
        await storageManager.putSetting("shopStats", store.getState().stats);
        return { success: true };
      } catch (e) {
        console.error("importData failed:", e);
        return { success: false, error: e.message };
      }
    },
    openExport() {
      const content = `
            <div class="form-group">
                <label class="form-label">\u5BFC\u51FA\u6570\u636E</label>
                <button class="btn btn-block btn-primary" data-action="export-data">
                    \u5BFC\u51FA\u4E3A JSON \u6587\u4EF6
                </button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">\u5173\u95ED</button>
            </div>
        `;
      Handlers.openModal(content, "\u5BFC\u51FA\u5206\u4EAB");
    },
    openImport() {
      const content = `
            <div class="form-group">
                <label class="form-label">\u9009\u62E9\u8981\u5BFC\u5165\u7684JSON\u6587\u4EF6</label>
                <input type="file" class="form-input" id="importFileInput" accept=".json,application/json">
            </div>
            <div class="form-group" style="margin-top: 20px;">
                <label class="form-label">\u6216\u8005\u7C98\u8D34JSON\u5185\u5BB9</label>
                <textarea class="form-textarea" id="importTextarea" rows="6" placeholder="\u7C98\u8D34JSON\u6570\u636E..."></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">\u53D6\u6D88</button>
                <button class="btn btn-primary" data-action="import-from-textarea">\u4ECE\u6587\u672C\u6846\u5BFC\u5165</button>
            </div>
        `;
      Handlers.openModal(content, "\u5BFC\u5165\u6570\u636E");
      const fileInput = byId("importFileInput");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => this.handleImportFile(e));
      }
    },
    handleImportFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = await this.importData(e.target.result);
        if (result.success) {
          renderAll();
          Handlers.closeModal();
          Toast.showToast("\u6570\u636E\u5BFC\u5165\u6210\u529F", "success");
        } else {
          Toast.showToast("JSON\u683C\u5F0F\u9519\u8BEF: " + result.error, "error");
        }
      };
      reader.readAsText(file);
    },
    async importFromTextarea() {
      const textarea = byId("importTextarea");
      if (!textarea?.value.trim()) {
        Toast.showToast("\u8BF7\u8F93\u5165\u8981\u5BFC\u5165\u7684JSON\u6570\u636E", "warning");
        return;
      }
      const result = await this.importData(textarea.value);
      if (result.success) {
        renderAll();
        Handlers.closeModal();
        Toast.showToast("\u6570\u636E\u5BFC\u5165\u6210\u529F", "success");
      } else {
        Toast.showToast("JSON\u683C\u5F0F\u9519\u8BEF: " + result.error, "error");
      }
    },
    quickImportFromFile() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const result = await this.importData(event.target.result);
            if (result.success) {
              Toast.showToast("\u6570\u636E\u5BFC\u5165\u6210\u529F", "success");
              renderAll();
            } else {
              Toast.showToast("\u5BFC\u5165\u5931\u8D25: " + result.error, "error");
            }
          } catch (err) {
            Toast.showToast("\u5BFC\u5165\u5931\u8D25: " + err.message, "error");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  };

  // assets/scripts/utils/cultivationData.js
  var cultivationData_exports = {};
  __export(cultivationData_exports, {
    CultivationData: () => CultivationData2
  });
  var CultivationData2 = (() => {
    const REALM_CONFIG = [
      { name: "\u51E1\u5C18", start: 1, end: 10, interval: 1 },
      { name: "\u7EC3\u6C14", start: 11, end: 20, interval: 1.5 },
      { name: "\u7B51\u57FA", start: 21, end: 30, interval: 2.5 },
      { name: "\u91D1\u4E39", start: 31, end: 40, interval: 4 },
      { name: "\u5143\u5A74", start: 41, end: 50, interval: 6 },
      { name: "\u5316\u795E", start: 51, end: 60, interval: 8 },
      { name: "\u8FD4\u865A", start: 61, end: 70, interval: 12 },
      { name: "\u5408\u9053", start: 71, end: 80, interval: 17 },
      { name: "\u5927\u4E58", start: 81, end: 90, interval: 23 },
      { name: "\u98DE\u5347", start: 91, end: 100, interval: 28 }
    ];
    const TITLES = {
      1: "\u521D\u5165\u51E1\u5C18",
      2: "\u5FC3\u6709\u6240\u5411",
      3: "\u7075\u6839\u521D\u73B0",
      4: "\u9053\u5FC3\u840C\u52A8",
      5: "\u5929\u5730\u611F\u5E94",
      6: "\u660E\u5FC3\u89C1\u6027",
      7: "\u521D\u5FC3\u4E0D\u6539",
      8: "\u8D85\u51E1\u8131\u4FD7",
      9: "\u5927\u5F7B\u5927\u609F",
      10: "\u51E1\u5C18\u5706\u6EE1",
      11: "\u5F15\u6C14\u5165\u4F53",
      12: "\u6C14\u611F\u521D\u751F",
      13: "\u7075\u6C14\u8FD0\u8F6C",
      14: "\u5410\u7EB3\u5929\u5730",
      15: "\u6C14\u8D2F\u767E\u8109",
      16: "\u5185\u6C14\u5145\u76C8",
      17: "\u6C14\u51DD\u4E39\u7530",
      18: "\u6C14\u5316\u771F\u5143",
      19: "\u771F\u6C14\u5927\u6210",
      20: "\u7EC3\u6C14\u5706\u6EE1",
      21: "\u9053\u57FA\u521D\u7B51",
      22: "\u6D17\u9AD3\u4F10\u9AA8",
      23: "\u56FA\u672C\u57F9\u5143",
      24: "\u6839\u57FA\u7A33\u56FA",
      25: "\u767E\u70BC\u6210\u94A2",
      26: "\u9053\u57FA\u5C0F\u6210",
      27: "\u539A\u79EF\u8584\u53D1",
      28: "\u9053\u57FA\u5927\u6210",
      29: "\u8131\u80CE\u6362\u9AA8",
      30: "\u7B51\u57FA\u5706\u6EE1",
      31: "\u4E39\u706B\u521D\u71C3",
      32: "\u51DD\u4E39\u4E4B\u6CD5",
      33: "\u4E39\u80DA\u521D\u6210",
      34: "\u4E39\u706B\u6DEC\u70BC",
      35: "\u4E5D\u8F6C\u4E39\u6210",
      36: "\u4E39\u5FC3\u4E0D\u706D",
      37: "\u91D1\u4E39\u5165\u8179",
      38: "\u4E39\u9053\u5927\u6210",
      39: "\u91D1\u5149\u62A4\u4F53",
      40: "\u91D1\u4E39\u5706\u6EE1",
      41: "\u5143\u795E\u521D\u9192",
      42: "\u9B42\u9B44\u51DD\u5F62",
      43: "\u795E\u8BC6\u521D\u5F00",
      44: "\u5143\u795E\u51FA\u7A8D",
      45: "\u9068\u6E38\u592A\u865A",
      46: "\u5143\u795E\u58EE\u5927",
      47: "\u5206\u795E\u5316\u5FF5",
      48: "\u4E07\u5FF5\u5F52\u4E00",
      49: "\u5143\u795E\u5927\u6210",
      50: "\u5143\u5A74\u5706\u6EE1",
      51: "\u5316\u795E\u4E4B\u521D",
      52: "\u795E\u8BC6\u901A\u5929",
      53: "\u4E00\u5FF5\u5343\u91CC",
      54: "\u5316\u8EAB\u4E07\u5343",
      55: "\u795E\u6E38\u516B\u6781",
      56: "\u4E07\u8C61\u7686\u660E",
      57: "\u795E\u8BC6\u65E0\u8FB9",
      58: "\u795E\u901A\u5E7F\u5927",
      59: "\u5316\u795E\u5927\u6210",
      60: "\u5316\u795E\u5706\u6EE1",
      61: "\u8FD4\u749E\u5F52\u771F",
      62: "\u5927\u9053\u81F3\u7B80",
      63: "\u865A\u5BA4\u751F\u767D",
      64: "\u5929\u4EBA\u611F\u5E94",
      65: "\u9053\u6CD5\u81EA\u7136",
      66: "\u65E0\u4E3A\u800C\u6CBB",
      67: "\u4E0A\u5584\u82E5\u6C34",
      68: "\u548C\u5149\u540C\u5C18",
      69: "\u8FD4\u865A\u5927\u6210",
      70: "\u8FD4\u865A\u5706\u6EE1",
      71: "\u4EE5\u8EAB\u5408\u9053",
      72: "\u9053\u5FC3\u901A\u660E",
      73: "\u4E07\u6CD5\u5F52\u5B97",
      74: "\u5929\u5730\u540C\u5BFF",
      75: "\u9053\u5370\u51DD\u7ED3",
      76: "\u6CD5\u5219\u638C\u63A7",
      77: "\u65F6\u7A7A\u6D1E\u6089",
      78: "\u56E0\u679C\u6D1E\u660E",
      79: "\u5408\u9053\u5927\u6210",
      80: "\u5408\u9053\u5706\u6EE1",
      81: "\u5927\u4E58\u521D\u5883",
      82: "\u4E07\u52AB\u4E0D\u706D",
      83: "\u529F\u5FB7\u65E0\u91CF",
      84: "\u6CD5\u529B\u65E0\u8FB9",
      85: "\u8D85\u8131\u8F6E\u56DE",
      86: "\u4E0D\u751F\u4E0D\u706D",
      87: "\u4E07\u53E4\u957F\u5B58",
      88: "\u5927\u9053\u4E3B\u5BB0",
      89: "\u5927\u4E58\u5706\u6EE1",
      90: "\u534A\u6B65\u98DE\u5347",
      91: "\u7834\u788E\u865A\u7A7A",
      92: "\u4E09\u754C\u9068\u6E38",
      93: "\u4E5D\u5929\u4E4B\u4E0A",
      94: "\u4ED9\u5E1D\u4E4B\u59FF",
      95: "\u4E07\u4ED9\u6765\u671D",
      96: "\u6DF7\u6C8C\u521D\u7AA5",
      97: "\u5F00\u5929\u8F9F\u5730",
      98: "\u9053\u4E4B\u672C\u6E90",
      99: "\u6C38\u6052\u4E0D\u673D",
      100: "\u8D85\u8131\u5929\u9053"
    };
    const layers = [];
    let goal = 0;
    for (const rc of REALM_CONFIG) {
      for (let i = rc.start; i <= rc.end; i++) {
        layers.push({
          layer: i,
          realm: rc.name,
          title: TITLES[i],
          goal: Math.round(goal)
        });
        goal += rc.interval;
      }
    }
    return {
      LAYERS: layers,
      /** 根据已完成目标数查当前境界 */
      getRealmData(completedGoals) {
        let current = layers[0];
        let next = null;
        for (let i = layers.length - 1; i >= 0; i--) {
          if (completedGoals >= layers[i].goal) {
            current = layers[i];
            next = layers[i + 1] || null;
            break;
          }
        }
        const layersInCurrentRealm = layers.filter((l) => l.realm === current.realm);
        return { current, next, layersInCurrentRealm, allLayers: layers };
      },
      /** 检测境界突破并 toast 提示 */
      checkBreakthrough(oldCompleted, newCompleted) {
        const oldData = this.getRealmData(oldCompleted);
        const newData = this.getRealmData(newCompleted);
        if (newData.current.layer > oldData.current.layer) {
          const isRealmBreak = newData.current.realm !== oldData.current.realm;
          if (isRealmBreak) {
            Toast.showToast(
              `\u7A81\u7834${newData.current.realm}\u5883 \xB7 ${newData.current.title}`,
              "success"
            );
          } else {
            Toast.showToast(
              `\u7B2C${newData.current.layer}\u5C42 \xB7 ${newData.current.title}`,
              "success"
            );
          }
        }
      }
    };
  })();
  window.CultivationData = CultivationData2;

  // assets/scripts/services/goalStatsCalculator.js
  var goalStatsCalculator_exports = {};
  __export(goalStatsCalculator_exports, {
    GoalStatsCalculator: () => GoalStatsCalculator2
  });
  var GoalStatsCalculator2 = {
    calculate(goals) {
      const now = /* @__PURE__ */ new Date();
      const totalGoals = goals.length;
      const completedGoals = goals.filter((g) => (g.progress || 0) >= 100).length;
      const inProgressGoals = goals.filter((g) => (g.progress || 0) > 0 && (g.progress || 0) < 100).length;
      const notStartedGoals = goals.filter((g) => (g.progress || 0) === 0).length;
      const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / totalGoals) : 0;
      const categories = window.GOAL_CATEGORIES || [];
      let totalSubItems = 0;
      let completedSubItems = 0;
      goals.forEach((g) => {
        if (g.items && g.items.length) {
          g.items.forEach((item) => {
            totalSubItems++;
            const current = Number(item.currentValue) || 0;
            const target = Number(item.targetValue) || 0;
            if (target > 0 && current >= target) {
              completedSubItems++;
            }
          });
        }
      });
      const highPriorityGoals = goals.filter((g) => g.priority === "high");
      const highPriorityCompleted = highPriorityGoals.filter((g) => (g.progress || 0) >= 100).length;
      const activeGoals = goals.filter((g) => (g.progress || 0) > 0).length;
      const highPriorityRate = highPriorityGoals.length > 0 ? Math.round(highPriorityCompleted / highPriorityGoals.length * 100) : 0;
      const DEFAULT_CATEGORY_COLORS = {
        "work": "var(--bamboo-primary)",
        "personal": "#5A8A9A",
        "health": "#9A5A5A",
        "study": "#9A8A5A",
        "finance": "#5A5A9A",
        "other": "#8A8A8A"
      };
      const catStats = categories.map((cat) => {
        const catGoals = goals.filter((g) => g.category === cat.id);
        const avgProg = catGoals.length > 0 ? Math.round(catGoals.reduce((s, g) => s + (g.progress || 0), 0) / catGoals.length) : 0;
        const color = cat.color || DEFAULT_CATEGORY_COLORS[cat.id] || "var(--bamboo-primary)";
        return { category: { ...cat, color }, avgProgress: avgProg, goalCount: catGoals.length };
      }).filter((s) => s.goalCount > 0);
      const upcomingGoals = [];
      const urgentGoals = [];
      const overdueGoals = [];
      const recentlyCompleted = [];
      goals.forEach((goal) => {
        const isCompleted = (goal.progress || 0) >= 100;
        if (isCompleted) {
          recentlyCompleted.push(goal);
        }
        if (goal.endDate) {
          const endDate = new Date(goal.endDate);
          const daysToEnd = Math.ceil((endDate - now) / (1e3 * 60 * 60 * 24));
          if (daysToEnd < 0) {
            if ((goal.progress || 0) < 100) {
              overdueGoals.push({ ...goal, daysOverdue: -daysToEnd });
            }
          } else if (daysToEnd <= 3) {
            urgentGoals.push({ ...goal, daysLeft: daysToEnd });
          } else if (daysToEnd <= 7) {
            upcomingGoals.push({ ...goal, daysLeft: daysToEnd });
          }
        }
      });
      const progressTiers = {
        tier0_25: goals.filter((g) => (g.progress || 0) >= 0 && (g.progress || 0) <= 25).length,
        tier26_50: goals.filter((g) => (g.progress || 0) > 25 && (g.progress || 0) <= 50).length,
        tier51_75: goals.filter((g) => (g.progress || 0) > 50 && (g.progress || 0) <= 75).length,
        tier76_99: goals.filter((g) => (g.progress || 0) > 75 && (g.progress || 0) < 100).length,
        tier100: completedGoals
      };
      const stagnantGoals = goals.filter((g) => {
        if ((g.progress || 0) >= 100) return false;
        if (!g.startDate) return true;
        const startDate = new Date(g.startDate);
        const daysSinceStart = Math.ceil((now - startDate) / (1e3 * 60 * 60 * 24));
        return daysSinceStart > 14;
      });
      const subItemCompletionRate = totalSubItems > 0 ? Math.round(completedSubItems / totalSubItems * 100) : 0;
      const timeSpanStats = {
        shortTerm: 0,
        mediumTerm: 0,
        longTerm: 0
      };
      goals.forEach((g) => {
        if (g.startDate && g.endDate) {
          const start = new Date(g.startDate);
          const end = new Date(g.endDate);
          const days = Math.ceil((end - start) / (1e3 * 60 * 60 * 24));
          if (days < 30) timeSpanStats.shortTerm++;
          else if (days <= 90) timeSpanStats.mediumTerm++;
          else timeSpanStats.longTerm++;
        }
      });
      return {
        totalGoals,
        completedGoals,
        inProgressGoals,
        notStartedGoals,
        avgProgress,
        catStats,
        upcomingGoals,
        urgentGoals,
        overdueGoals,
        recentlyCompleted,
        progressTiers,
        stagnantGoals,
        totalSubItems,
        completedSubItems,
        subItemCompletionRate,
        timeSpanStats,
        activeGoals,
        highPriorityRate
      };
    }
  };
  window.GoalStatsCalculator = GoalStatsCalculator2;

  // assets/scripts/handlers/statsModal.js
  var statsModal_exports = {};
  __export(statsModal_exports, {
    StatsModal: () => StatsModal2
  });
  var StatsModal2 = {
    open() {
      const content = this.renderStatsHTML();
      PanelManager.open("stats", LucideUtils.createIcon("target", { size: 16 }) + "\u6218\u7565\u590D\u76D8", content);
    },
    openAchievements() {
      const content = this._renderCultivationHTML();
      PanelManager.open("achievements", LucideUtils.createIcon("mountain", { size: 16 }) + "\u7AF9\u6797\u4FEE\u4ED9", content);
    },
    renderStatsHTML() {
      const stats = this._getGoalStats();
      return `
            <div class="stats-overview-container">
                <div class="stats-section">
                    <div class="stats-section-title">
                        \u6838\u5FC3\u6307\u6807
                    </div>
                    <div class="core-metrics-grid">
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.totalGoals}</div>
                            <div class="stat-label">\u603B\u76EE\u6807</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.completedGoals}</div>
                            <div class="stat-label">\u5DF2\u5B8C\u6210</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.inProgressGoals}</div>
                            <div class="stat-label">\u8FDB\u884C\u4E2D</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.avgProgress}%</div>
                            <div class="stat-label">\u5E73\u5747\u8FDB\u5EA6</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.totalSubItems}</div>
                            <div class="stat-label">\u5B50\u9879\u603B\u6570</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.subItemCompletionRate}%</div>
                            <div class="stat-label">\u5B50\u9879\u5B8C\u6210\u7387</div>
                        </div>
                    </div>
                </div>

                ${stats.totalGoals > 0 ? `
                <div class="stats-section">
                    <div class="stats-section-title">
                        \u65F6\u95F4\u9884\u8B66
                    </div>
                    <div class="time-alerts-cards">
                        ${stats.urgentGoals.length > 0 ? `
                        <div class="alert-card urgent-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon urgent-icon">
                                    ${LucideUtils.createIcon("flame", { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.urgentGoals.length}</div>
                            </div>
                            <div class="alert-card-title">\u7D27\u6025\u5230\u671F</div>
                            <div class="alert-card-desc">3\u5929\u5185\u9700\u8981\u5173\u6CE8</div>
                            <div class="alert-card-projects">
                                ${stats.urgentGoals.slice(0, 3).map((g) => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + "..." : g.title}</div>`).join("")}
                                ${stats.urgentGoals.length > 3 ? `<div class="alert-card-project">...\u8FD8\u6709${stats.urgentGoals.length - 3}\u4E2A</div>` : ""}
                            </div>
                        </div>
                        ` : ""}
                        ${stats.overdueGoals.length > 0 ? `
                        <div class="alert-card overdue-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon overdue-icon">
                                    ${LucideUtils.createIcon("alertTriangle", { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.overdueGoals.length}</div>
                            </div>
                            <div class="alert-card-title">\u5DF2\u903E\u671F</div>
                            <div class="alert-card-desc">\u9700\u8981\u7ACB\u5373\u5904\u7406</div>
                            <div class="alert-card-projects">
                                ${stats.overdueGoals.slice(0, 3).map((g) => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + "..." : g.title}</div>`).join("")}
                                ${stats.overdueGoals.length > 3 ? `<div class="alert-card-project">...\u8FD8\u6709${stats.overdueGoals.length - 3}\u4E2A</div>` : ""}
                            </div>
                        </div>
                        ` : ""}
                        ${stats.upcomingGoals.length > 0 ? `
                        <div class="alert-card warning-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon warning-icon">
                                    ${LucideUtils.createIcon("clock", { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.upcomingGoals.length}</div>
                            </div>
                            <div class="alert-card-title">\u5373\u5C06\u5230\u671F</div>
                            <div class="alert-card-desc">7\u5929\u5185\u9700\u8981\u51C6\u5907</div>
                            <div class="alert-card-projects">
                                ${stats.upcomingGoals.slice(0, 3).map((g) => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + "..." : g.title}</div>`).join("")}
                                ${stats.upcomingGoals.length > 3 ? `<div class="alert-card-project">...\u8FD8\u6709${stats.upcomingGoals.length - 3}\u4E2A</div>` : ""}
                            </div>
                        </div>
                        ` : ""}
                        ${stats.stagnantGoals.length > 0 ? `
                        <div class="alert-card stagnant-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon stagnant-icon">
                                    ${LucideUtils.createIcon("pause", { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.stagnantGoals.length}</div>
                            </div>
                            <div class="alert-card-title">\u505C\u6EDE\u9884\u8B66</div>
                            <div class="alert-card-desc">\u8D85\u8FC714\u5929\u65E0\u8FDB\u5C55</div>
                            <div class="alert-card-projects">
                                ${stats.stagnantGoals.slice(0, 3).map((g) => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + "..." : g.title}</div>`).join("")}
                                ${stats.stagnantGoals.length > 3 ? `<div class="alert-card-project">...\u8FD8\u6709${stats.stagnantGoals.length - 3}\u4E2A</div>` : ""}
                            </div>
                        </div>
                        ` : ""}
                        ${stats.urgentGoals.length === 0 && stats.upcomingGoals.length === 0 && stats.overdueGoals.length === 0 && stats.stagnantGoals.length === 0 ? `
                        <div class="all-good-card">
                            <div class="all-good-icon">
                                ${LucideUtils.createIcon("sparkles", { size: 36, strokeWidth: 1.8 })}
                            </div>
                            <div class="all-good-title">\u4E00\u5207\u987A\u5229</div>
                            <div class="all-good-desc">\u6240\u6709\u76EE\u6807\u8FDB\u5EA6\u826F\u597D</div>
                        </div>
                        ` : ""}
                    </div>
                </div>

                <div class="stats-section">
                    <div class="stats-section-title">
                        \u8FDB\u5EA6\u68AF\u961F\u5206\u5E03
                    </div>
                    <div class="progress-tiers-grid">
                        <div class="tier-card high">
                            <div class="tier-header">
                                <span class="tier-label">100% \u5B8C\u6210</span>
                                <span class="tier-count">${stats.progressTiers.tier100}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? stats.progressTiers.tier100 / stats.totalGoals * 100 : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card high">
                            <div class="tier-header">
                                <span class="tier-label">76-99%</span>
                                <span class="tier-count">${stats.progressTiers.tier76_99}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? stats.progressTiers.tier76_99 / stats.totalGoals * 100 : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card medium">
                            <div class="tier-header">
                                <span class="tier-label">51-75%</span>
                                <span class="tier-count">${stats.progressTiers.tier51_75}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? stats.progressTiers.tier51_75 / stats.totalGoals * 100 : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card medium">
                            <div class="tier-header">
                                <span class="tier-label">26-50%</span>
                                <span class="tier-count">${stats.progressTiers.tier26_50}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? stats.progressTiers.tier26_50 / stats.totalGoals * 100 : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card low">
                            <div class="tier-header">
                                <span class="tier-label">0-25%</span>
                                <span class="tier-count">${stats.progressTiers.tier0_25}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? stats.progressTiers.tier0_25 / stats.totalGoals * 100 : 0}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                ${stats.catStats.length > 0 ? `
                <div class="stats-section">
                    <div class="stats-section-title">
                        \u5206\u7C7B\u8FDB\u5EA6
                    </div>
                    <div class="category-progress">
                        ${stats.catStats.map((s) => `
                        <div class="category-item">
                            <span class="category-name">${s.category.name}</span>
                            <div class="category-bar-wrapper">
                                <div class="category-bar" style="width:${s.avgProgress}%;background:${s.category.color};"></div>
                            </div>
                            <span class="category-value">${s.avgProgress}%</span>
                        </div>
                        `).join("")}
                    </div>
                </div>
                ` : ""}

                <div class="stats-section">
                    <div class="stats-section-title">
                        \u65F6\u95F4\u8DE8\u5EA6\u5206\u5E03
                    </div>
                    <div class="time-span-horizontal">
                        <div class="time-span-card short" 
                            data-time-span="short" 
                            tabindex="0" 
                            role="button"
                            aria-label="\u7B5B\u9009\u77ED\u671F\u76EE\u6807\uFF08\u5C0F\u4E8E30\u5929\uFF09\uFF0C\u5F53\u524D\u6709${stats.timeSpanStats.shortTerm}\u4E2A"
                            onclick="StatsModal._filterByTimeSpan('short')"
                            onkeydown="if(event.key === 'Enter' || event.key === ' ') { StatsModal._filterByTimeSpan('short'); event.preventDefault(); }">
                            <div class="time-span-info">
                                <div class="time-span-label">\u77ED\u671F\u76EE\u6807</div>
                                <div class="time-span-desc">&lt;30\u5929</div>
                            </div>
                            <div class="time-span-value">${stats.timeSpanStats.shortTerm}</div>
                            <div class="time-span-percent">${stats.totalGoals > 0 ? Math.round(stats.timeSpanStats.shortTerm / stats.totalGoals * 100) : 0}%</div>
                        </div>
                        <div class="time-span-card medium" 
                            data-time-span="medium" 
                            tabindex="0" 
                            role="button"
                            aria-label="\u7B5B\u9009\u4E2D\u671F\u76EE\u6807\uFF0830-90\u5929\uFF09\uFF0C\u5F53\u524D\u6709${stats.timeSpanStats.mediumTerm}\u4E2A"
                            onclick="StatsModal._filterByTimeSpan('medium')"
                            onkeydown="if(event.key === 'Enter' || event.key === ' ') { StatsModal._filterByTimeSpan('medium'); event.preventDefault(); }">
                            <div class="time-span-info">
                                <div class="time-span-label">\u4E2D\u671F\u76EE\u6807</div>
                                <div class="time-span-desc">30-90\u5929</div>
                            </div>
                            <div class="time-span-value">${stats.timeSpanStats.mediumTerm}</div>
                            <div class="time-span-percent">${stats.totalGoals > 0 ? Math.round(stats.timeSpanStats.mediumTerm / stats.totalGoals * 100) : 0}%</div>
                        </div>
                        <div class="time-span-card long" 
                            data-time-span="long" 
                            tabindex="0" 
                            role="button"
                            aria-label="\u7B5B\u9009\u957F\u671F\u76EE\u6807\uFF08\u5927\u4E8E90\u5929\uFF09\uFF0C\u5F53\u524D\u6709${stats.timeSpanStats.longTerm}\u4E2A"
                            onclick="StatsModal._filterByTimeSpan('long')"
                            onkeydown="if(event.key === 'Enter' || event.key === ' ') { StatsModal._filterByTimeSpan('long'); event.preventDefault(); }">
                            <div class="time-span-info">
                                <div class="time-span-label">\u957F\u671F\u76EE\u6807</div>
                                <div class="time-span-desc">&gt;90\u5929</div>
                            </div>
                            <div class="time-span-value">${stats.timeSpanStats.longTerm}</div>
                            <div class="time-span-percent">${stats.totalGoals > 0 ? Math.round(stats.timeSpanStats.longTerm / stats.totalGoals * 100) : 0}%</div>
                        </div>
                    </div>
                </div>

                <div class="stats-two-col-grid">
                    <div class="stats-section">
                        <div class="stats-section-title">
                            \u6D3B\u8DC3\u6307\u6807
                        </div>
                        <div class="activity-metrics">
                            <div class="activity-item">
                                <span class="activity-label">\u6D3B\u8DC3\u76EE\u6807</span>
                                <span class="activity-value">${stats.activeGoals}</span>
                            </div>
                            <div class="activity-item">
                                <span class="activity-label">\u9AD8\u4F18\u5148\u7EA7\u5B8C\u6210\u7387</span>
                                <span class="activity-value">${stats.highPriorityRate}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="stats-section">
                        <div class="stats-section-title">
                            \u76EE\u6807\u5BF9\u6BD4\u5206\u6790
                        </div>
                        <div class="comparison-stats">
                            <div class="comparison-item">
                                <div class="comparison-row">
                                    <span class="comparison-label">\u5DF2\u5B8C\u6210</span>
                                    <span class="comparison-value">${stats.completedGoals}</span>
                                </div>
                                <div class="comparison-bar">
                                    <div class="comparison-bar-fill completed" style="width:${stats.totalGoals > 0 ? stats.completedGoals / stats.totalGoals * 100 : 0}%;"></div>
                                </div>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-row">
                                    <span class="comparison-label">\u8FDB\u884C\u4E2D</span>
                                    <span class="comparison-value">${stats.inProgressGoals}</span>
                                </div>
                                <div class="comparison-bar">
                                    <div class="comparison-bar-fill in-progress" style="width:${stats.totalGoals > 0 ? stats.inProgressGoals / stats.totalGoals * 100 : 0}%;"></div>
                                </div>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-row">
                                    <span class="comparison-label">\u672A\u5F00\u59CB</span>
                                    <span class="comparison-value">${stats.notStartedGoals}</span>
                                </div>
                                <div class="comparison-bar">
                                    <div class="comparison-bar-fill not-started" style="width:${stats.totalGoals > 0 ? stats.notStartedGoals / stats.totalGoals * 100 : 0}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="stats-section" style="text-align:center;padding:40px;">
                    <div style="font-size:32px;margin-bottom:12px;">${LucideUtils.createIcon("target", { size: 32, strokeWidth: 1.8 })}</div>
                    <div style="font-size:14px;color:var(--text-secondary);">\u6682\u65E0\u76EE\u6807\u6570\u636E</div>
                    <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px;">\u5F00\u59CB\u521B\u5EFA\u4F60\u7684\u7B2C\u4E00\u4E2A\u76EE\u6807\u5427</div>
                </div>
                `}

                <div style="margin-top:8px; display:flex; gap:8px;">
                    <button class="btn btn-secondary btn-block" data-action="stats-export-report-md" style="font-size:11px;">
                        ${LucideUtils.createIcon("download", { size: 12, strokeWidth: 1.8 })} \u5BFC\u51FA\u7EDF\u8BA1\u62A5\u544A
                    </button>
                </div>
            </div>
        `;
    },
    _getGoalStats() {
      return GoalStatsCalculator.calculate(store.getGlobalGoals());
    },
    _filterByTimeSpan(timeSpan) {
      const cards = $$(".time-span-card");
      cards.forEach((card) => card.classList.remove("active"));
      const targetCard = $(`.time-span-card[data-time-span="${timeSpan}"]`);
      if (targetCard) targetCard.classList.add("active");
      const goalItems = $$(".health-goal-item");
      goalItems.forEach((item) => {
        const goalTitle = item.querySelector(".health-goal-title")?.textContent;
        const goals = store.getGlobalGoals();
        const targetGoal = goals.find((g) => g.title === goalTitle);
        if (targetGoal && targetGoal.startDate && targetGoal.endDate) {
          const start = new Date(targetGoal.startDate);
          const end = new Date(targetGoal.endDate);
          const days = Math.ceil((end - start) / (1e3 * 60 * 60 * 24));
          let match = false;
          if (timeSpan === "short" && days < 30) match = true;
          else if (timeSpan === "medium" && days >= 30 && days <= 90) match = true;
          else if (timeSpan === "long" && days > 90) match = true;
          item.style.display = match ? "block" : "none";
        } else {
          item.style.display = "none";
        }
      });
      const diagTab = $('.fab-panel-tab[data-tab="diagnosis"]');
      if (diagTab) diagTab.click();
    },
    getRealmData(completedGoals) {
      return CultivationData.getRealmData(completedGoals);
    },
    _checkBreakthrough(oldCompleted, newCompleted) {
      return CultivationData.checkBreakthrough(oldCompleted, newCompleted);
    },
    _renderCultivationHTML() {
      const goals = store.getGlobalGoals();
      const completedGoals = goals.filter((g) => (g.progress || 0) >= 100).length;
      const totalGoals = goals.length;
      const { current, next, allLayers } = this.getRealmData(completedGoals);
      const toNextLayer = next ? Math.max(0, next.goal - completedGoals) : 0;
      const nextRealmFirstLayer = allLayers.find((l) => l.realm !== current.realm && allLayers.indexOf(l) > allLayers.indexOf(current));
      const toNextRealm = nextRealmFirstLayer ? Math.max(0, nextRealmFirstLayer.goal - completedGoals) : 0;
      const realmList = [...new Set(allLayers.map((l) => l.realm))];
      const currentRealmIdx = realmList.indexOf(current.realm);
      const progressPercent = next ? Math.min(100, Math.round((completedGoals - current.goal) / (next.goal - current.goal) * 100)) : 100;
      return `
            <div class="cultivation-container">
                <div class="cultivation-header">
                    <div class="cultivation-realm-badge">
                        <span class="cultivation-realm-name">${current.realm}\u5883 \xB7 \u7B2C${current.layer}\u5C42</span>
                    </div>
                    <h2 class="cultivation-title">${current.title}</h2>
                    <span class="cultivation-layer-tag">${current.layer}/100</span>
                    ${next ? `
                    <div class="cultivation-progress-section">
                        <div class="cultivation-progress-info">
                            <span class="cultivation-progress-label">\u4FEE\u4E3A\u57FA\u7840\uFF1A${completedGoals} \u4E2A\u76EE\u6807</span>
                            <span class="cultivation-progress-next">\u4E0B\u4E00\u5C42\uFF1A${next.title} \xB7 \u8FD8\u9700 ${toNextLayer} \u4E2A</span>
                        </div>
                        <div class="cultivation-progress-bar-wrap">
                            <div class="cultivation-progress-bar" style="width:${progressPercent}%"></div>
                        </div>
                        <div class="cultivation-progress-range">
                            <span>${current.goal}</span><span>${next.goal}</span>
                        </div>
                    </div>
                    ` : `<div class="cultivation-max-badge">\u5DF2\u8FBE\u5DC5\u5CF0 / ${completedGoals} \u4E2A\u76EE\u6807\u6210\u5C31\u4FEE\u4ED9\u4F20\u5947</div>`}
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">\u4FEE\u884C\u603B\u89C8</div>
                    <div class="cultivation-summary-grid">
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${completedGoals}</span>
                            <span class="cultivation-summary-label">\u7D2F\u8BA1\u5B8C\u6210</span>
                        </div>
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${current.layer}/100</span>
                            <span class="cultivation-summary-label">\u5F53\u524D\u5C42\u6570</span>
                        </div>
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${totalGoals}</span>
                            <span class="cultivation-summary-label">\u603B\u521B\u5EFA\u76EE\u6807</span>
                        </div>
                        ${toNextRealm > 0 ? `
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${toNextRealm}</span>
                            <span class="cultivation-summary-label">\u8DDD\u4E0B\u4E00\u91CD\u5929</span>
                        </div>` : ""}
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">\u4FEE\u4ED9\u4E4B\u8DEF \xB7 \u5DF2\u70B9\u4EAE ${current.layer} \u5C42</div>
                    <div class="cultivation-roadmap">
                        ${realmList.map((realm) => {
        const realmLayers = allLayers.filter((l) => l.realm === realm);
        const realmIdx = realmList.indexOf(realm);
        const isCurrent = realmIdx === currentRealmIdx;
        const isPast = realmIdx < currentRealmIdx;
        return `
                            <div class="cultivation-realm-row ${isCurrent ? "is-current" : ""} ${isPast ? "is-past" : ""}">
                                <div class="cultivation-realm-label">
                                    <span>${realm}</span>
                                </div>
                                <div class="cultivation-realm-layers">
                                    ${realmLayers.map((l) => {
          const unlocked = completedGoals >= l.goal;
          const active = l.layer === current.layer;
          return `<span class="cultivation-layer-dot ${unlocked ? "unlocked" : ""} ${active ? "active" : ""}" title="${l.title} \xB7 ${l.goal}\u4E2A"></span>`;
        }).join("")}
                                </div>
                                <span class="cultivation-realm-goal">${realmLayers[0].goal}</span>
                            </div>`;
      }).join("")}
                    </div>
                    <div class="cultivation-legend">
                        <span><span class="legend-dot unlocked"></span> \u5DF2\u7A81\u7834</span>
                        <span><span class="legend-dot active"></span> \u5F53\u524D</span>
                        <span><span class="legend-dot locked"></span> \u672A\u5230\u8FBE</span>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">\u5341\u91CD\u5929\u5883\u754C\u4F53\u7CFB</div>
                    <div class="cultivation-realm-table">
                        ${realmList.map((realm, idx) => {
        const realmLayers = allLayers.filter((l) => l.realm === realm);
        const isCurrent = idx === currentRealmIdx;
        const isPast = idx < currentRealmIdx;
        return `
                            <div class="cultivation-realm-table-row ${isCurrent ? "is-current" : ""} ${isPast ? "is-past" : ""}">
                                <span>${realm}</span>
                                <span>${realmLayers[0].layer}-${realmLayers[realmLayers.length - 1].layer}\u5C42</span>
                                <span>${realmLayers[0].goal}-${realmLayers[realmLayers.length - 1].goal}</span>
                                <span class="realm-table-status">${isPast ? "\u5DF2\u901A" : isCurrent ? "\u5F53\u524D" : "\u672A\u8FBE"}</span>
                            </div>`;
      }).join("")}
                    </div>
                </div>
            </div>
        `;
    },
    exportReportMD() {
      const stats = this._getGoalStats();
      const now = /* @__PURE__ */ new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const lines = [];
      const add = (...args) => lines.push(args.join(""));
      add("# \u{1F4CA} \u76EE\u6807\u7EDF\u8BA1\u62A5\u544A");
      add("");
      add(`> \u751F\u6210\u65F6\u95F4\uFF1A${dateStr} ${timeStr}`);
      add("");
      add("## \u{1F3AF} \u6838\u5FC3\u6307\u6807");
      add("");
      add("| \u6307\u6807 | \u6570\u503C |");
      add("|------|------|");
      add(`| \u603B\u76EE\u6807 | ${stats.totalGoals} |`);
      add(`| \u2705 \u5DF2\u5B8C\u6210 | ${stats.completedGoals} |`);
      add(`| \u{1F504} \u8FDB\u884C\u4E2D | ${stats.inProgressGoals} |`);
      add(`| \u{1F4C8} \u5E73\u5747\u8FDB\u5EA6 | ${stats.avgProgress}% |`);
      add(`| \u{1F4CB} \u5B50\u9879\u603B\u6570 | ${stats.totalSubItems} |`);
      add(`| \u{1F4CB} \u5B50\u9879\u5B8C\u6210\u7387 | ${stats.subItemCompletionRate}% |`);
      add("");
      if (stats.totalGoals === 0) {
        add("> \u6682\u65E0\u76EE\u6807\u6570\u636E\uFF0C\u5F00\u59CB\u521B\u5EFA\u4F60\u7684\u7B2C\u4E00\u4E2A\u76EE\u6807\u5427\uFF01");
        this._downloadMD(lines.join("\n"), dateStr);
        return;
      }
      const hasAlerts = stats.urgentGoals.length > 0 || stats.overdueGoals.length > 0 || stats.upcomingGoals.length > 0 || stats.stagnantGoals.length > 0;
      add("## \u26A0\uFE0F \u65F6\u95F4\u9884\u8B66");
      add("");
      if (hasAlerts) {
        add("| \u7C7B\u578B | \u6570\u91CF | \u8BF4\u660E |");
        add("|------|------|------|");
        if (stats.urgentGoals.length > 0)
          add(`| \u{1F525} \u7D27\u6025\u5230\u671F | ${stats.urgentGoals.length} | 3\u5929\u5185\u9700\u8981\u5173\u6CE8 |`);
        if (stats.overdueGoals.length > 0)
          add(`| \u{1F6A8} \u5DF2\u903E\u671F | ${stats.overdueGoals.length} | \u9700\u8981\u7ACB\u5373\u5904\u7406 |`);
        if (stats.upcomingGoals.length > 0)
          add(`| \u23F0 \u5373\u5C06\u5230\u671F | ${stats.upcomingGoals.length} | 7\u5929\u5185\u9700\u8981\u51C6\u5907 |`);
        if (stats.stagnantGoals.length > 0)
          add(`| \u23F8\uFE0F \u505C\u6EDE\u9884\u8B66 | ${stats.stagnantGoals.length} | \u8D85\u8FC714\u5929\u65E0\u8FDB\u5C55 |`);
        add("");
      } else {
        add("> \u2728 \u4E00\u5207\u987A\u5229\uFF0C\u6240\u6709\u76EE\u6807\u8FDB\u5EA6\u826F\u597D\uFF01");
        add("");
      }
      add("## \u{1F4CA} \u8FDB\u5EA6\u68AF\u961F\u5206\u5E03");
      add("");
      add("| \u8FDB\u5EA6\u533A\u95F4 | \u6570\u91CF | \u5360\u6BD4 |");
      add("|----------|------|------|");
      const tiers = [
        ["100% \u5B8C\u6210", stats.progressTiers.tier100],
        ["76-99%", stats.progressTiers.tier76_99],
        ["51-75%", stats.progressTiers.tier51_75],
        ["26-50%", stats.progressTiers.tier26_50],
        ["0-25%", stats.progressTiers.tier0_25]
      ];
      tiers.forEach(([label, count]) => {
        const pct = stats.totalGoals > 0 ? Math.round(count / stats.totalGoals * 100) : 0;
        add(`| ${label} | ${count} | ${pct}% |`);
      });
      add("");
      if (stats.catStats.length > 0) {
        add("## \u{1F4C1} \u5206\u7C7B\u8FDB\u5EA6");
        add("");
        add("| \u5206\u7C7B | \u76EE\u6807\u6570 | \u5E73\u5747\u8FDB\u5EA6 |");
        add("|------|--------|----------|");
        stats.catStats.forEach((s) => {
          add(`| ${s.category.name} | ${s.goalCount} | ${s.avgProgress}% |`);
        });
        add("");
      }
      add("## \u{1F4C5} \u65F6\u95F4\u8DE8\u5EA6\u5206\u5E03");
      add("");
      add("| \u7C7B\u578B | \u6570\u91CF | \u5360\u6BD4 |");
      add("|------|------|------|");
      const spans = [
        ["\u77ED\u671F\u76EE\u6807\uFF08<30\u5929\uFF09", stats.timeSpanStats.shortTerm],
        ["\u4E2D\u671F\u76EE\u6807\uFF0830-90\u5929\uFF09", stats.timeSpanStats.mediumTerm],
        ["\u957F\u671F\u76EE\u6807\uFF08>90\u5929\uFF09", stats.timeSpanStats.longTerm]
      ];
      spans.forEach(([label, count]) => {
        const pct = stats.totalGoals > 0 ? Math.round(count / stats.totalGoals * 100) : 0;
        add(`| ${label} | ${count} | ${pct}% |`);
      });
      add("");
      add("## \u{1F4C8} \u6D3B\u8DC3\u6307\u6807");
      add("");
      add(`- **\u6D3B\u8DC3\u76EE\u6807**\uFF1A${stats.activeGoals} \u4E2A`);
      add(`- **\u9AD8\u4F18\u5148\u7EA7\u5B8C\u6210\u7387**\uFF1A${stats.highPriorityRate}%`);
      add("");
      add("## \u{1F4CA} \u76EE\u6807\u5BF9\u6BD4\u5206\u6790");
      add("");
      add("| \u72B6\u6001 | \u6570\u91CF | \u5360\u6BD4 |");
      add("|------|------|------|");
      const comparison = [
        ["\u2705 \u5DF2\u5B8C\u6210", stats.completedGoals],
        ["\u{1F504} \u8FDB\u884C\u4E2D", stats.inProgressGoals],
        ["\u23F3 \u672A\u5F00\u59CB", stats.notStartedGoals]
      ];
      comparison.forEach(([label, count]) => {
        const pct = stats.totalGoals > 0 ? Math.round(count / stats.totalGoals * 100) : 0;
        add(`| ${label} | ${count} | ${pct}% |`);
      });
      add("");
      add("---");
      add("");
      add("*\u672C\u62A5\u544A\u7531\u300CBamboo Immortals\u300D\u81EA\u52A8\u751F\u6210*");
      this._downloadMD(lines.join("\n"), dateStr);
      Toast.showToast("\u7EDF\u8BA1\u62A5\u544A\u5DF2\u5BFC\u51FA", "success");
    },
    _downloadMD(content, dateStr) {
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `\u76EE\u6807\u7EDF\u8BA1\u62A5\u544A_${dateStr}.md`;
      modalMount().appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };
  ActionDispatcher.registerMany({
    "stats-export-report-md": () => StatsModal2.exportReportMD(),
    "stats-modal-open-achievements": () => StatsModal2.openAchievements()
  });
  window.StatsModal = StatsModal2;

  // assets/scripts/handlers/settingsModal.js
  var settingsModal_exports = {};
  __export(settingsModal_exports, {
    SettingsModal: () => SettingsModal2
  });
  var SettingsModal2 = {
    enableSwipe: true,
    autoSaveInterval: 2e3,
    // ---- Tab 内容渲染 ----
    _renderGeneralTab() {
      const swipeChecked = this.enableSwipe ? "checked" : "";
      const currentInterval = this.autoSaveInterval;
      const { ui } = store.getState();
      const syncChecked = ui.autoSyncTheme ? "checked" : "";
      return `
            <div class="fab-tab-content active" id="tab-content-general">
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">\u663E\u793A</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u81EA\u52A8\u8DDF\u968F Obsidian \u4E3B\u9898</div>
                            <div class="settings-item-desc">\u5F00\u542F\u540E\uFF0C\u968F Obsidian \u4E3B\u9898\u81EA\u52A8\u5207\u6362\u660E/\u6697\u6A21\u5F0F</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${syncChecked} data-action="settings-toggle-sync-theme">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u663E\u793A\u5929\u6C14</div>
                            <div class="settings-item-desc">\u5728\u9875\u9762\u5934\u90E8\u663E\u793A\u5F53\u524D\u5929\u6C14\uFF0C\u6570\u636E\u6765\u6E90 Open-Meteo\uFF0C\u514D\u6CE8\u518C</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${store.state.ui.weatherEnabled ? "checked" : ""} data-action="settings-toggle-weather">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u9ED8\u8BA4\u57CE\u5E02</div>
                            <div class="settings-item-desc">\u5929\u6C14\u663E\u793A\u7684\u9ED8\u8BA4\u57CE\u5E02\uFF0C\u91CD\u542F\u540E\u4FDD\u7559</div>
                        </div>
                        <input type="text" id="defaultCityInput" class="form-input" style="max-width:180px;"
                            value="${store.state.ui.weatherCity || ""}"
                            placeholder="\u57CE\u5E02\u540D\uFF0C\u56DE\u8F66\u4FDD\u5B58">
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u9ED8\u8BA4\u5C55\u5F00\u5929\u6C14</div>
                            <div class="settings-item-desc">\u52A0\u8F7D\u9875\u9762\u65F6\uFF0C\u5929\u6C14\u80F6\u56CA\u81EA\u52A8\u5C55\u5F00\u8BE6\u60C5</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${store.state.ui.weatherExpanded ? "checked" : ""} data-action="settings-toggle-weather-expanded">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u663E\u793A\u8BED\u5F55</div>
                            <div class="settings-item-desc">\u5728\u5934\u90E8\u53F3\u4FA7\u663E\u793A\u4E00\u53E5\u968F\u673A\u7684\u7AF9\u6797\u4E03\u8D24\u8BED\u5F55\uFF0C\u70B9\u51FB\u53EF\u6362\u4E00\u6761</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${store.state.ui.quoteEnabled ? "checked" : ""} data-action="settings-toggle-quote">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u8BED\u5F55\u6765\u6E90\u7B14\u8BB0</div>
                            <div class="settings-item-desc">\u6307\u5B9A Obsidian \u7B14\u8BB0\u540D\u4F5C\u4E3A\u81EA\u5B9A\u4E49\u8BED\u5F55\u6765\u6E90\uFF0C\u7559\u7A7A\u4F7F\u7528\u5185\u7F6E\u4E03\u8D24\u8BED\u5F55</div>
                        </div>
                        <input type="text" id="quoteSourceInput" class="form-input" style="max-width:220px;"
                            value="${store.state.ui.quoteSource || ""}"
                            placeholder="\u5982 \u7AF9\u6797\u8BED\u5F55.md">
                    </div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">\u4EA4\u4E92\u884C\u4E3A</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u6ED1\u52A8\u5207\u6362\u65E5\u671F</div>
                            <div class="settings-item-desc">\u5DE6\u53F3\u6ED1\u52A8\u5207\u6362\u65E5\u671F</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${swipeChecked} data-action="settings-toggle-swipe">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">\u81EA\u52A8\u4FDD\u5B58\u95F4\u9694</div>
                            <div class="settings-item-desc">\u6570\u636E\u4FEE\u6539\u540E\u5EF6\u8FDF\u4FDD\u5B58\u7684\u65F6\u95F4</div>
                        </div>
                        <select class="form-input settings-select-sm" id="autoSaveInterval" data-action="settings-set-autosave-interval">
                            <option value="1000" ${currentInterval === 1e3 ? "selected" : ""}>1\u79D2</option>
                            <option value="2000" ${currentInterval === 2e3 ? "selected" : ""}>2\u79D2</option>
                            <option value="5000" ${currentInterval === 5e3 ? "selected" : ""}>5\u79D2</option>
                            <option value="10000" ${currentInterval === 1e4 ? "selected" : ""}>10\u79D2</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },
    _renderDataTab() {
      const dataCount = Object.keys(store.getState().data).length;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return `
            <div class="fab-tab-content" id="tab-content-data">
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">\u5BFC\u5165\u5BFC\u51FA</div>
                    <div class="settings-action-grid">
                        <button class="btn btn-sm btn-secondary btn-block" data-action="settings-export-data">
                            ${LucideUtils.createIcon("download", { size: 12 })} \u5BFC\u51FA\u5907\u4EFD
                        </button>
                        <button class="btn btn-sm btn-secondary btn-block" data-action="settings-import-data">
                            ${LucideUtils.createIcon("upload", { size: 12 })} \u5BFC\u5165\u6570\u636E
                        </button>
                    </div>
                </div>

                <div class="fab-panel-section fab-section-danger">
                    <div class="fab-panel-section-title">\u6E05\u7406\u6BCF\u65E5\u8BB0\u5F55</div>
                    <div class="settings-item-info" style="margin-bottom: 10px;">
                        <div class="settings-item-label">\u6309\u65E5\u671F\u88C1\u526A\u5386\u53F2\u8BB0\u5F55</div>
                        <div class="settings-item-desc">\u5F53\u524D ${dataCount} \u5929\uFF0C\u5220\u9664\u6307\u5B9A\u65E5\u671F\u4E4B\u524D\u7684\u6240\u6709\u8BB0\u5F55</div>
                    </div>
                    <div class="settings-clear-row">
                        <input type="date" class="form-input settings-date-input" id="clearBeforeDate" max="${today}" placeholder="\u9009\u62E9\u622A\u6B62\u65E5\u671F">
                        <button class="btn btn-sm btn-danger" data-action="settings-confirm-clear-data">
                            ${LucideUtils.createIcon("trash", { size: 12 })} \u6E05\u7406
                        </button>
                    </div>
                </div>

                <div class="fab-panel-section fab-section-danger">
                    <div class="fab-panel-section-title">\u91CD\u7F6E\u6240\u6709</div>
                    <div class="settings-item-info" style="margin-bottom: 10px;">
                        <div class="settings-item-label">\u6E05\u7A7A\u5168\u90E8\u6570\u636E\u5E76\u6062\u590D\u521D\u59CB\u72B6\u6001</div>
                        <div class="settings-item-desc">\u5305\u62EC\u6BCF\u65E5\u8BB0\u5F55\u3001\u76EE\u6807\u3001\u4F59\u989D\u3001\u6D88\u8D39\u5386\u53F2\u7B49\u6240\u6709\u6570\u636E</div>
                    </div>
                    <button class="btn btn-sm btn-danger btn-block" data-action="settings-show-reset-modal">
                        ${LucideUtils.createIcon("alertTriangle", { size: 12 })} \u91CD\u7F6E\u6240\u6709\u6570\u636E
                    </button>
                </div>
            </div>
        `;
    },
    _renderAboutTab() {
      return `
            <div class="fab-tab-content" id="tab-content-about">
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">\u63D2\u4EF6\u7B80\u4ECB</div>
                    <div class="about-description">Bamboo Immortals\uFF08\u7AF9\u6797\u4FEE\u4ED9\u4F20\uFF09\u662F\u4E00\u6B3E\u57FA\u4E8E\u82CF\u8054\u63A7\u5236\u8BBA\u4E4B\u7236\u7EF4\u514B\u6258\xB7\u683C\u5362\u4EC0\u79D1\u592B\u63D0\u51FA\u7684"OGAS"\u7406\u5FF5\uFF0C\u4E13\u4E3A\u4E2A\u4EBA\u6253\u9020\u7684\u4E2D\u56FD\u98CE\u76EE\u6807\u81EA\u52A8\u5316\u5206\u914D\u7BA1\u7406\u7CFB\u7EDF\u3002</div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">\u4F5C\u8005\u4ECB\u7ECD</div>
                    <div class="about-author">
                        <div class="about-author-avatar"></div>
                        <div>
                            <div class="about-author-name">\u7FBD\u9CDE\u541B</div>
                            <div class="about-author-role">\u55B5\u5B57\u9986 \u521B\u59CB\u4EBA</div>
                        </div>
                    </div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">Obsidian \u63D2\u4EF6\u4F5C\u54C1</div>
                    <div class="about-works">
                        <span class="about-work-tag" onclick="window.open('https://github.com/miaoziguan/obsidian-Bamboo-Darts', '_blank')" style="cursor:pointer">\u7AF9\u53F6\u98DE\u5203</span>
                        <span class="about-work-tag" style="cursor:default">\u7AF9\u6797\u4FEE\u4ED9\u4F20</span>
                    </div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">\u8054\u7CFB\u65B9\u5F0F</div>
                    <div class="about-contact">
                        <div class="about-contact-item">\u90AE\u7BB1\uFF1Ayanyulin2100@qq.com</div>
                        <div class="about-contact-item">\u5FAE\u4FE1\uFF1Ayanhu94</div>
                    </div>
                </div>
            </div>
        `;
    },
    // ---- 打开面板 ----
    open() {
      const generalHtml = this._renderGeneralTab();
      const dataHtml = this._renderDataTab();
      const aboutHtml = this._renderAboutTab();
      const content = generalHtml + dataHtml + aboutHtml;
      PanelManager.open("settings", LucideUtils.createIcon("settings", { size: 16 }) + "\u8BBE\u7F6E", content, {
        tabs: [
          { id: "general", label: "\u901A\u7528" },
          { id: "data", label: "\u6570\u636E" },
          { id: "about", label: "\u5173\u4E8E" }
        ],
        onOpen: () => {
          const intervalSelect = byId("autoSaveInterval");
          if (intervalSelect) {
            intervalSelect.addEventListener("change", (e) => {
              this.setAutoSaveInterval(e.target.value);
            });
          }
          const cityInput = byId("defaultCityInput");
          if (cityInput) {
            const saveCity = () => {
              const val = (cityInput.value || "").trim();
              this.setWeatherCity(val.length > 0 ? val : "");
            };
            cityInput.addEventListener("blur", saveCity);
            cityInput.addEventListener("change", saveCity);
            cityInput.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                cityInput.blur();
              }
            });
          }
          const quoteInput = byId("quoteSourceInput");
          if (quoteInput) {
            const saveQuote = () => {
              const val = (quoteInput.value || "").trim();
              this.setQuoteSource(val);
            };
            quoteInput.addEventListener("blur", saveQuote);
            quoteInput.addEventListener("change", saveQuote);
            quoteInput.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                quoteInput.blur();
              }
            });
          }
        }
      });
    },
    // ---- 通用 Tab 操作 ----
    toggleSwipe(enabled) {
      this.enableSwipe = enabled;
      StorageAdapter.set(StorageKeys.ENABLE_SWIPE, enabled ? "true" : "false");
      if (typeof storageManager !== "undefined" && storageManager.putSetting) {
        storageManager.putSetting("enableSwipe", enabled ? "true" : "false").catch(() => {
        });
      }
      Toast.showToast(enabled ? "\u6ED1\u52A8\u5207\u6362\u5DF2\u542F\u7528" : "\u6ED1\u52A8\u5207\u6362\u5DF2\u5173\u95ED", "success");
    },
    setAutoSaveInterval(value) {
      const num = parseInt(value);
      this.autoSaveInterval = num;
      StorageAdapter.set(StorageKeys.AUTO_SAVE_INTERVAL, value);
      if (typeof storageManager !== "undefined" && storageManager.putSetting) {
        storageManager.putSetting("autoSaveInterval", num).catch(() => {
        });
      }
      Toast.showToast(`\u81EA\u52A8\u4FDD\u5B58\u95F4\u9694\u8BBE\u4E3A ${num / 1e3} \u79D2`, "success");
    },
    // ---- 通用 Tab 操作（主题同步）----
    async toggleSyncTheme(enabled) {
      await store.setSyncTheme(enabled);
      if (enabled && typeof window !== "undefined") {
        window.postMessage({ type: "app:theme:sync" }, "*");
      }
      this._refreshTab("general");
    },
    async toggleWeather(enabled) {
      await store.setWeatherEnabled(enabled);
      if (typeof WeatherRenderer !== "undefined") {
        WeatherRenderer.refresh();
      }
      this._refreshTab("general");
    },
    async setWeatherCity(city) {
      await store.setWeatherCity(city);
      if (typeof WeatherRenderer !== "undefined") {
        WeatherRenderer.refresh(true);
      }
      if (typeof Toast !== "undefined" && typeof Toast.showToast === "function") {
        const trimmed = (city || "").trim();
        Toast.showToast(trimmed.length > 0 ? "\u9ED8\u8BA4\u57CE\u5E02\uFF1A" + trimmed : "\u9ED8\u8BA4\u57CE\u5E02\u5DF2\u6E05\u9664", "success");
      }
    },
    async toggleWeatherExpanded(expanded) {
      await store.setWeatherExpanded(expanded);
      if (typeof WeatherRenderer !== "undefined") {
        WeatherRenderer.refresh();
      }
      this._refreshTab("general");
    },
    async toggleQuoteEnabled(enabled) {
      await store.setQuoteEnabled(enabled);
      if (typeof QuoteRenderer !== "undefined") {
        QuoteRenderer.refresh();
      }
      this._refreshTab("general");
    },
    async setQuoteSource(source) {
      await store.setQuoteSource(source);
      if (typeof QuoteRenderer !== "undefined") {
        QuoteRenderer.refresh();
      }
      if (typeof Toast !== "undefined" && typeof Toast.showToast === "function") {
        const trimmed = (source || "").trim();
        Toast.showToast(trimmed.length > 0 ? "\u8BED\u5F55\u6765\u6E90\uFF1A" + trimmed : "\u8BED\u5F55\u6765\u6E90\u5DF2\u6E05\u9664", "success");
      }
      this._refreshTab("general");
    },
    // ---- 数据 Tab 操作 ----
    exportData() {
      DataIO.exportData();
    },
    openImportPreview() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const backup = JSON.parse(event.target.result);
            const daysKey = backup.days ? "days" : backup.data ? "data" : null;
            const goalsKey = backup.goals ? "goals" : backup.globalGoals ? "globalGoals" : null;
            if (!daysKey && !goalsKey) {
              throw new Error("\u65E0\u6548\u7684\u5907\u4EFD\u6587\u4EF6");
            }
            this._pendingImportData = backup;
            this.showImportPreview(backup);
          } catch (error) {
            Toast.showToast("\u6587\u4EF6\u89E3\u6790\u5931\u8D25: " + error.message, "error");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    showImportPreview(backup) {
      const daysData = backup.days || backup.data;
      const goalsData = backup.goals || backup.globalGoals;
      const dataKeys = daysData ? Array.isArray(daysData) ? daysData.map((_, i) => i) : Object.keys(daysData) : [];
      const goalCount = goalsData ? goalsData.length : 0;
      const hasData = dataKeys.length > 0;
      const hasGoals = goalCount > 0;
      const currentGoalCount = store.getState().globalGoals.length;
      const currentDataKeys = Object.keys(store.getState().data);
      const hasCurrentData = currentDataKeys.length > 0;
      const hasCurrentGoals = currentGoalCount > 0;
      const backupTime = backup.timestamp ? new Date(backup.timestamp).toLocaleString() : backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : "\u672A\u77E5";
      const content = `
            <div class="form-group">
                <label class="form-label">\u5907\u4EFD\u4FE1\u606F</label>
                <div class="import-preview-info">
                    <div class="import-preview-row">
                        <span class="import-preview-label">\u7248\u672C</span>
                        <span class="import-preview-value">${backup.version || "\u672A\u77E5"}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">\u5907\u4EFD\u65F6\u95F4</span>
                        <span class="import-preview-value">${backupTime}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">\u6BCF\u65E5\u8BB0\u5F55</span>
                        <span class="import-preview-value">${hasData ? dataKeys.length + " \u5929" : "\u65E0"}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">\u76EE\u6807\u6570\u636E</span>
                        <span class="import-preview-value">${hasGoals ? goalCount + " \u4E2A" : "\u65E0"}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">\u6D88\u8D39/\u6536\u5165\u5386\u53F2</span>
                        <span class="import-preview-value">${backup.purchaseHistory || backup.incomeHistory ? "\u6709" : "\u65E0"}</span>
                    </div>
                </div>
            </div>

            ${hasCurrentData || hasCurrentGoals ? `
            <div class="form-group">
                <label class="form-label">\u5BFC\u5165\u7B56\u7565</label>
                <div class="import-strategy-options">
                    <label class="import-strategy-option">
                        <input type="radio" name="importStrategy" value="overwrite" checked>
                        <div class="import-strategy-card">
                            <div class="import-strategy-title">\u5168\u91CF\u8986\u76D6</div>
                            <div class="import-strategy-desc">\u7528\u5907\u4EFD\u6570\u636E\u66FF\u6362\u5F53\u524D\u6240\u6709\u6570\u636E</div>
                        </div>
                    </label>
                    <label class="import-strategy-option">
                        <input type="radio" name="importStrategy" value="merge">
                        <div class="import-strategy-card">
                            <div class="import-strategy-title">\u8FFD\u52A0\u5408\u5E76</div>
                            <div class="import-strategy-desc">\u4FDD\u7559\u5F53\u524D\u6570\u636E\uFF0C\u5C06\u5907\u4EFD\u6570\u636E\u5408\u5E76\u8FDB\u6765\uFF08\u51B2\u7A81\u65F6\u4EE5\u5907\u4EFD\u4E3A\u51C6\uFF09</div>
                        </div>
                    </label>
                </div>
            </div>
            ` : ""}

            <div class="import-warning">
                \u5BFC\u5165\u524D\u5EFA\u8BAE\u5148\u5BFC\u51FA\u5F53\u524D\u6570\u636E\u4F5C\u4E3A\u5907\u4EFD
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">\u53D6\u6D88</button>
                <button class="btn btn-primary" data-action="settings-confirm-import">\u786E\u8BA4\u5BFC\u5165</button>
            </div>
        `;
      Handlers.openModal(content, "\u5BFC\u5165\u6570\u636E\u9884\u89C8");
    },
    async confirmImport() {
      const backup = this._pendingImportData;
      if (!backup) return;
      const strategyRadio = $('input[name="importStrategy"]:checked');
      const strategy = strategyRadio ? strategyRadio.value : "overwrite";
      try {
        const result = await DataIO.importData(backup, { strategy });
        if (result.success) {
          Handlers.closeModal();
          renderAll();
          Toast.showToast(strategy === "overwrite" ? "\u6570\u636E\u5DF2\u8986\u76D6\u5BFC\u5165" : "\u6570\u636E\u5DF2\u5408\u5E76\u5BFC\u5165", "success");
        } else {
          Toast.showToast("\u5BFC\u5165\u5931\u8D25: " + (result.error || "\u672A\u77E5\u9519\u8BEF"), "error");
        }
      } catch (error) {
        Toast.showToast("\u5BFC\u5165\u5931\u8D25: " + error.message, "error");
      }
      this._pendingImportData = null;
    },
    confirmClearData() {
      const input = byId("clearBeforeDate");
      if (!input || !input.value) {
        Toast.showToast("\u8BF7\u9009\u62E9\u65E5\u671F", "error");
        return;
      }
      const dateStr = input.value;
      const clearDate = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
      const data = store.getState().data;
      let clearedCount = 0;
      Object.keys(data).forEach((dateKey) => {
        const dataDate = /* @__PURE__ */ new Date(dateKey + "T00:00:00");
        if (dataDate < clearDate) {
          delete data[dateKey];
          clearedCount++;
        }
      });
      store.scheduleAutoSave();
      Toast.showToast(`\u5DF2\u6E05\u7406 ${clearedCount} \u6761\u8BB0\u5F55`, "success");
      renderAll();
      this._refreshTab("data");
    },
    showResetModal() {
      const content = `
            <div style="padding: 14px; background: rgba(220, 53, 69, 0.08); border: 1px solid rgba(220, 53, 69, 0.2); border-radius: 10px; margin-bottom: 14px; text-align: center;">
                <div style="font-size: 42px; margin-bottom: 10px; color: var(--danger-color);">${LucideUtils.createIcon("alertTriangle", { size: 42 })}</div>
                <div style="font-weight: 600; margin-bottom: 6px; font-size: 15px;">\u5371\u9669\u64CD\u4F5C</div>
                <div style="color: var(--text-secondary); font-size: 12px; line-height: 1.6;">\u6B64\u64CD\u4F5C\u5C06\u5220\u9664\u6240\u6709\u6570\u636E\uFF0C\u4E14\u65E0\u6CD5\u6062\u590D\uFF01<br>\u5305\u62EC\u6BCF\u65E5\u8BB0\u5F55\u3001\u76EE\u6807\u3001\u4F59\u989D\u3001\u6D88\u8D39\u5386\u53F2\u7B49</div>
            </div>
            <div style="margin-bottom: 14px;">
                <div class="settings-item-label" style="margin-bottom: 6px;">\u8F93\u5165 "\u786E\u8BA4\u91CD\u7F6E" \u4EE5\u7EE7\u7EED</div>
                <input type="text" class="form-input" id="resetConfirmInput" placeholder="\u786E\u8BA4\u91CD\u7F6E">
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn btn-sm btn-secondary" data-action="settings-cancel-reset">\u53D6\u6D88</button>
                <button class="btn btn-sm btn-danger" data-action="settings-confirm-reset">\u786E\u8BA4\u91CD\u7F6E</button>
            </div>
        `;
      PanelManager.open("settings-reset", LucideUtils.createIcon("alertTriangle", { size: 16 }) + "\u786E\u8BA4\u91CD\u7F6E", content);
    },
    cancelReset() {
      PanelManager.close();
    },
    async confirmReset() {
      const input = byId("resetConfirmInput");
      if (!input || input.value !== "\u786E\u8BA4\u91CD\u7F6E") {
        Toast.showToast("\u8F93\u5165\u4E0D\u6B63\u786E", "error");
        return;
      }
      StorageAdapter.remove(StorageKeys.DAILY_REVIEW_DATA);
      StorageAdapter.remove(StorageKeys.AUTO_BACKUPS);
      try {
        await storageManager.clearAll();
      } catch (e) {
        console.error("Failed to clear storage:", e);
      }
      const s = store.getState();
      s.data = {};
      s.globalGoals = [];
      s.undoStack = [];
      s.redoStack = [];
      s.balance = 0;
      s.purchaseHistory = { records: [], archive: {} };
      s.incomeHistory = { records: [], archive: {} };
      s.stats = { todayEarnings: 0, totalSpent: 0, totalEarnings: 0 };
      s._statsDate = "";
      store.scheduleAutoSave();
      PanelManager.close();
      renderAll();
      Toast.showToast("\u6240\u6709\u6570\u636E\u5DF2\u91CD\u7F6E", "success");
    },
    // ---- 内部工具 ----
    _refreshTab(tabId) {
      const panel = PanelManager.activePanel;
      if (!panel) return;
      const container = panel.querySelector(`#tab-content-${tabId}`);
      if (!container) return;
      let newHtml;
      switch (tabId) {
        case "general":
          newHtml = this._renderGeneralTab();
          break;
        case "data":
          newHtml = this._renderDataTab();
          break;
        case "about":
          newHtml = this._renderAboutTab();
          break;
        default:
          return;
      }
      const temp = document.createElement("div");
      temp.innerHTML = newHtml;
      const newContent = temp.querySelector(`#tab-content-${tabId}`);
      if (newContent) {
        container.replaceWith(newContent);
      }
    },
    // ---- 初始化 ----
    async init() {
      if (typeof storageManager !== "undefined" && storageManager.getSetting) {
        try {
          const bridgeInterval = await storageManager.getSetting("autoSaveInterval");
          if (bridgeInterval && typeof bridgeInterval === "number") {
            this.autoSaveInterval = bridgeInterval;
          }
        } catch {
        }
      }
      if (this.autoSaveInterval === 2e3) {
        const savedInterval = StorageAdapter.get(StorageKeys.AUTO_SAVE_INTERVAL);
        if (savedInterval) {
          this.autoSaveInterval = parseInt(savedInterval);
        }
      }
      if (StorageAdapter.get(StorageKeys.ENABLE_SWIPE) === "false") {
        this.enableSwipe = false;
      }
    }
  };
  ActionDispatcher.registerMany({
    "settings-toggle-swipe": (_ds, target) => SettingsModal2.toggleSwipe(target.checked),
    "settings-set-autosave-interval": (_ds, target) => SettingsModal2.setAutoSaveInterval(target.value),
    "settings-toggle-sync-theme": (_ds, target) => SettingsModal2.toggleSyncTheme(target.checked),
    "settings-toggle-weather": (_ds, target) => SettingsModal2.toggleWeather(target.checked),
    "settings-toggle-weather-expanded": (_ds, target) => SettingsModal2.toggleWeatherExpanded(target.checked),
    "settings-toggle-quote": (_ds, target) => SettingsModal2.toggleQuoteEnabled(target.checked),
    "settings-export-data": () => SettingsModal2.exportData(),
    "settings-import-data": () => SettingsModal2.openImportPreview(),
    "settings-confirm-import": () => SettingsModal2.confirmImport(),
    "settings-confirm-clear-data": () => SettingsModal2.confirmClearData(),
    "settings-show-reset-modal": () => SettingsModal2.showResetModal(),
    "settings-cancel-reset": () => SettingsModal2.cancelReset(),
    "settings-confirm-reset": () => SettingsModal2.confirmReset()
  });
  window.SettingsModal = SettingsModal2;

  // assets/scripts/handlers/displayManager.js
  var displayManager_exports = {};
  __export(displayManager_exports, {
    DisplayManager: () => DisplayManager2
  });
  var DisplayManager2 = {
    _initialized: false,
    _panelEl: null,
    _sliderEl: null,
    _valueLabelEl: null,
    _fontSliderEl: null,
    _fontValueLabelEl: null,
    _gapSliderEl: null,
    _gapValueLabelEl: null,
    _hueSliderEl: null,
    _hueValueLabelEl: null,
    _lightnessSliderEl: null,
    _lightnessValueLabelEl: null,
    _saveTimer: null,
    _transitionTimer: null,
    /* ===== 预设档位 ===== */
    PRESETS: [
      { label: "\u7A84", value: 600, title: "\u4E13\u6CE8\u5199\u4F5C" },
      { label: "\u6807\u51C6", value: 800, title: "\u65E5\u5E38\u590D\u76D8" },
      { label: "\u5BBD", value: 1200, title: "\u6570\u636E\u89C6\u56FE" }
    ],
    /* ===== 字号预设档位 ===== */
    FONT_PRESETS: [
      { label: "\u5C0F", value: 0.85, title: "\u7D27\u51D1\u9605\u8BFB" },
      { label: "\u6807\u51C6", value: 1, title: "\u9ED8\u8BA4\u5B57\u53F7" },
      { label: "\u5927", value: 1.15, title: "\u8212\u9002\u9605\u8BFB" },
      { label: "\u7279\u5927", value: 1.3, title: "\u65E0\u969C\u788D" }
    ],
    /* ===== 字号滑块范围 ===== */
    FONT_MIN: 0.7,
    FONT_MAX: 1.6,
    DEFAULT_FONT_SCALE: 1,
    /* ===== 板块间距预设档位 ===== */
    GAP_PRESETS: [
      { label: "\u7D27\u51D1", value: 0.5, title: "\u4FE1\u606F\u5BC6\u96C6" },
      { label: "\u6807\u51C6", value: 0.8, title: "\u9ED8\u8BA4\u95F4\u8DDD" },
      { label: "\u5BBD\u677E", value: 1.2, title: "\u547C\u5438\u611F\u5F3A" },
      { label: "\u5F00\u9614", value: 1.6, title: "\u6781\u5BBD\u677E" }
    ],
    /* ===== 板块间距滑块范围 ===== */
    GAP_MIN: 0.2,
    GAP_MAX: 2,
    DEFAULT_GAP_SCALE: 0.8,
    /* ===== 滑块范围 ===== */
    MIN_WIDTH: 400,
    MAX_WIDTH: 1600,
    // 滑块上限，实际值可超过此值用全屏
    DEFAULT_WIDTH: 800,
    /* ===== 色相调节 ===== */
    HUE_MIN: 0,
    HUE_MAX: 360,
    DEFAULT_HUE: 120,
    // 竹青绿
    HUE_PRESETS: [
      { label: "\u5AE9\u7EFF", value: 90, title: "\u6625\u82BD\u5AE9\u7EFF" },
      { label: "\u7AF9\u9752", value: 120, title: "\u7AF9\u6797\u6E05\u97F5\uFF08\u9ED8\u8BA4\uFF09" },
      { label: "\u677E\u82B1", value: 140, title: "\u677E\u82B1\u7EFF" },
      { label: "\u78A7\u8272", value: 160, title: "\u78A7\u8272\u5982\u7389" },
      { label: "\u9752\u78A7", value: 180, title: "\u9752\u78A7\u5929\u5149" }
    ],
    /* ===== 明度调节 ===== */
    LIGHTNESS_MIN: -15,
    LIGHTNESS_MAX: 15,
    DEFAULT_LIGHTNESS: 0,
    LIGHTNESS_PRESETS: [
      { label: "\u6697\u6C89", value: -12, title: "\u6DF1\u8272\u8D28\u611F" },
      { label: "\u67D4\u548C", value: -5, title: "\u67D4\u5149\u6C1B\u56F4" },
      { label: "\u9ED8\u8BA4", value: 0, title: "\u6807\u51C6\u660E\u5EA6" },
      { label: "\u660E\u4EAE", value: 8, title: "\u6E05\u65B0\u4EAE\u4E3D" }
    ],
    /* HSL → RGB 转换辅助函数 */
    _hslToRgb(h, s, l) {
      s /= 100;
      l /= 100;
      const k = (n) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)].join(", ");
    },
    /* ===== 初始化 ===== */
    async init() {
      if (this._initialized) return;
      this._initialized = true;
      await this._loadAndApply();
      this._buildPanel();
      this._bindEvents();
    },
    /* ===== 加载并应用设置 ===== */
    async _loadAndApply() {
      try {
        const savedWidth = await storageManager.getSetting("displayWidth");
        if (savedWidth !== null && savedWidth !== void 0) {
          const val = Number(savedWidth);
          if (!isNaN(val) && val >= this.MIN_WIDTH && val <= 9999) {
            this._applyWidth(val, false);
          }
        }
      } catch (e) {
        console.warn("[DisplayManager] Failed to load width setting:", e.message);
      }
      try {
        const savedFont = await storageManager.getSetting("displayFontScale");
        if (savedFont !== null && savedFont !== void 0) {
          const val = Number(savedFont);
          if (!isNaN(val) && val >= this.FONT_MIN && val <= this.FONT_MAX) {
            this._applyFontScale(val, false);
          }
        }
      } catch (e) {
        console.warn("[DisplayManager] Failed to load font scale setting:", e.message);
      }
      try {
        const savedGap = await storageManager.getSetting("displayGapScale");
        if (savedGap !== null && savedGap !== void 0) {
          const val = Number(savedGap);
          if (!isNaN(val) && val >= this.GAP_MIN && val <= this.GAP_MAX) {
            this._applyGapScale(val, false);
          }
        }
      } catch (e) {
        console.warn("[DisplayManager] Failed to load gap scale setting:", e.message);
      }
      try {
        const savedHue = await storageManager.getSetting("displayHue");
        const hue = savedHue !== null && savedHue !== void 0 ? Number(savedHue) : this.DEFAULT_HUE;
        if (!isNaN(hue) && hue >= this.HUE_MIN && hue <= this.HUE_MAX) {
          this._applyHue(hue);
        } else {
          this._applyHue(this.DEFAULT_HUE);
        }
      } catch (e) {
        console.warn("[DisplayManager] Failed to load hue setting:", e.message);
        this._applyHue(this.DEFAULT_HUE);
      }
      try {
        const savedLightness = await storageManager.getSetting("displayLightness");
        const lightness = savedLightness !== null && savedLightness !== void 0 ? Number(savedLightness) : this.DEFAULT_LIGHTNESS;
        if (!isNaN(lightness) && lightness >= this.LIGHTNESS_MIN && lightness <= this.LIGHTNESS_MAX) {
          this._applyLightness(lightness);
        } else {
          this._applyLightness(this.DEFAULT_LIGHTNESS);
        }
      } catch (e) {
        console.warn("[DisplayManager] Failed to load lightness setting:", e.message);
        this._applyLightness(this.DEFAULT_LIGHTNESS);
      }
    },
    /* ===== 应用宽度到 CSS ===== */
    _applyWidth(value, animate) {
      const root = getCssVarRoot();
      const container = byId("reviewContainer");
      const mainContainer = byId("main-container");
      if (!container) return;
      if (animate) {
        container.classList.add("display-transition");
        clearTimeout(this._transitionTimer);
        this._transitionTimer = setTimeout(() => {
          container.classList.remove("display-transition");
        }, 300);
      }
      if (value === 0) {
        value = this.DEFAULT_WIDTH;
      }
      root.style.setProperty("--content-max-width", value + "px");
      root.style.setProperty("--content-max-width-wide", value + "px");
      container.classList.remove("display-fullscreen");
      if (mainContainer) mainContainer.classList.remove("display-fullscreen");
      const effectiveWidth = value;
      container.classList.toggle("display-compact", effectiveWidth <= 600);
      container.classList.toggle("display-ultra-compact", effectiveWidth <= 480);
      container.classList.remove(
        "rw-620",
        "rw-520",
        "rw-460",
        "rw-420",
        "rw-360"
      );
      if (value <= 620) container.classList.add("rw-620");
      if (value <= 520) container.classList.add("rw-520");
      if (value <= 460) container.classList.add("rw-460");
      if (value <= 420) container.classList.add("rw-420");
      if (value <= 360) container.classList.add("rw-360");
      this._syncUI(value);
    },
    /* ===== 同步面板 UI 状态 ===== */
    _syncUI(value) {
      if (this._sliderEl) {
        this._sliderEl.value = Math.min(value, this.MAX_WIDTH);
      }
      if (this._valueLabelEl) {
        this._valueLabelEl.textContent = value + "px";
      }
      if (this._panelEl) {
        const presetBtns = this._panelEl.querySelectorAll(".display-preset-btn");
        presetBtns.forEach((btn) => {
          const pv = Number(btn.dataset.value);
          btn.classList.toggle("active", pv === value);
        });
      }
    },
    /* ===== 应用字号缩放到 CSS ===== */
    _applyFontScale(scale, animate) {
      const root = getCssVarRoot();
      const container = byId("reviewContainer");
      if (!root) return;
      if (animate && container) {
        container.classList.add("display-transition");
        clearTimeout(this._fontTransitionTimer);
        this._fontTransitionTimer = setTimeout(() => {
          container.classList.remove("display-transition");
        }, 300);
      }
      root.style.setProperty("--font-size-scale", scale);
      this._syncFontUI(scale);
    },
    /* ===== 同步字号面板 UI 状态 ===== */
    _syncFontUI(scale) {
      if (this._fontSliderEl) {
        this._fontSliderEl.value = scale;
      }
      if (this._fontValueLabelEl) {
        this._fontValueLabelEl.textContent = Math.round(scale * 100) + "%";
      }
      if (this._panelEl) {
        const fontPresetBtns = this._panelEl.querySelectorAll(".display-font-preset-btn");
        fontPresetBtns.forEach((btn) => {
          const pv = Number(btn.dataset.value);
          btn.classList.toggle("active", Math.abs(pv - scale) < 1e-3);
        });
      }
    },
    /* ===== 应用板块间距缩放到 CSS ===== */
    _applyGapScale(scale, animate) {
      const root = getCssVarRoot();
      const container = byId("reviewContainer");
      if (!root) return;
      if (animate && container) {
        container.classList.add("display-transition");
        clearTimeout(this._gapTransitionTimer);
        this._gapTransitionTimer = setTimeout(() => {
          container.classList.remove("display-transition");
        }, 300);
      }
      root.style.setProperty("--section-gap-scale", scale);
      this._syncGapUI(scale);
    },
    /* ===== 同步板块间距面板 UI 状态 ===== */
    _syncGapUI(scale) {
      if (this._gapSliderEl) {
        this._gapSliderEl.value = scale;
      }
      if (this._gapValueLabelEl) {
        this._gapValueLabelEl.textContent = Math.round(scale * 100) + "%";
      }
      if (this._panelEl) {
        const gapPresetBtns = this._panelEl.querySelectorAll(".display-gap-preset-btn");
        gapPresetBtns.forEach((btn) => {
          const pv = Number(btn.dataset.value);
          btn.classList.toggle("active", Math.abs(pv - scale) < 1e-3);
        });
      }
    },
    /* ===== 持久化（防抖） ===== */
    _scheduleSave(value) {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(async () => {
        try {
          await storageManager.putSetting("displayWidth", value);
        } catch (e) {
          console.warn("[DisplayManager] Failed to save setting:", e.message);
        }
      }, 500);
    },
    _scheduleSaveFont(value) {
      clearTimeout(this._fontSaveTimer);
      this._fontSaveTimer = setTimeout(async () => {
        try {
          await storageManager.putSetting("displayFontScale", value);
        } catch (e) {
          console.warn("[DisplayManager] Failed to save font setting:", e.message);
        }
      }, 500);
    },
    _scheduleSaveGap(value) {
      clearTimeout(this._gapSaveTimer);
      this._gapSaveTimer = setTimeout(async () => {
        try {
          await storageManager.putSetting("displayGapScale", value);
        } catch (e) {
          console.warn("[DisplayManager] Failed to save gap setting:", e.message);
        }
      }, 500);
    },
    _scheduleSaveHue(value) {
      clearTimeout(this._hueSaveTimer);
      this._hueSaveTimer = setTimeout(async () => {
        try {
          await storageManager.putSetting("displayHue", value);
        } catch (e) {
          console.warn("[DisplayManager] Failed to save hue setting:", e.message);
        }
      }, 500);
    },
    _scheduleSaveLightness(value) {
      clearTimeout(this._lightnessSaveTimer);
      this._lightnessSaveTimer = setTimeout(async () => {
        try {
          await storageManager.putSetting("displayLightness", value);
        } catch (e) {
          console.warn("[DisplayManager] Failed to save lightness setting:", e.message);
        }
      }, 500);
    },
    /* ===== 应用明度 ===== */
    _applyLightness(val) {
      const root = getCssVarRoot();
      if (!root) return;
      root.style.setProperty("--accent-lightness-offset", val + "%");
      this._syncLightnessUI(val);
      this._maybeSyncPalette();
    },
    /**
     * 如果开启了"将调色同步到 Obsidian"，则向父窗口发送当前调色值
     */
    _maybeSyncPalette() {
      if (typeof storageManager === "undefined" || !storageManager.syncPaletteToObsidian) return;
      const cs = getGlobalComputedStyle();
      const hue = parseInt(cs.getPropertyValue("--accent-hue").trim()) || this.DEFAULT_HUE;
      const offsetStr = cs.getPropertyValue("--accent-lightness-offset").trim();
      const lightnessOffset = parseInt(offsetStr) || 0;
      const isDark = document.documentElement.classList.contains("dark");
      try {
        window.parent.postMessage({
          type: "theme:syncPalette",
          id: "dm_" + Date.now(),
          payload: { hue, lightnessOffset, isDark }
        }, "*");
      } catch (e) {
      }
    },
    _syncLightnessUI(val) {
      if (this._lightnessSliderEl) {
        this._lightnessSliderEl.value = val;
      }
      if (this._lightnessValueLabelEl) {
        this._lightnessValueLabelEl.textContent = (val >= 0 ? "+" : "") + val + "%";
      }
      if (this._panelEl) {
        const btns = this._panelEl.querySelectorAll(".display-lightness-preset-btn");
        btns.forEach((btn) => {
          const pv = Number(btn.dataset.value);
          btn.classList.toggle("active", pv === val);
        });
      }
    },
    /* 用户手动设定的色相（用于关闭主题联动后恢复），默认竹青绿 */
    _userHue: 120,
    /**
     * 应用色相
     * @param {number} hue 色相值 0–360
     * @param {boolean} [fromTheme=false] 是否来自 Obsidian 主题联动。
     *        为 true 时跳过回写 Obsidian（防止死循环），且不覆盖用户手动色记录
     */
    _applyHue(hue, fromTheme = false) {
      const root = getCssVarRoot();
      if (!root) return;
      if (!fromTheme) this._userHue = hue;
      root.style.setProperty("--accent-hue", hue);
      if (!fromTheme) this._maybeSyncPalette();
      const primaryRgb = this._hslToRgb(hue, 27, 48);
      root.style.setProperty("--primary-rgb", primaryRgb);
      const deepRgb = this._hslToRgb(hue - 7, 40, 25);
      root.style.setProperty("--deep-rgb", deepRgb);
      root.style.setProperty("--bamboo-deep-rgb", deepRgb);
      const paleRgb = this._hslToRgb(hue, 35, 75);
      root.style.setProperty("--pale-rgb", paleRgb);
      const ticketStubRgb = this._hslToRgb(hue, 36, 68);
      root.style.setProperty("--ticket-stub-bg-rgb", ticketStubRgb);
      const primaryAltRgb = this._hslToRgb(hue, 28, 55);
      root.style.setProperty("--primary-alt-rgb", primaryAltRgb);
      const greenPaleRgb = this._hslToRgb(hue, 27, 83);
      root.style.setProperty("--green-pale-rgb", greenPaleRgb);
      const greenBrightRgb = this._hslToRgb(hue, 47, 70);
      root.style.setProperty("--green-bright-rgb", greenBrightRgb);
      const greenAltRgb = this._hslToRgb(hue - 16, 44, 75);
      root.style.setProperty("--green-alt-rgb", greenAltRgb);
      const greenVeryBrightRgb = this._hslToRgb(hue, 72, 79);
      root.style.setProperty("--green-very-bright-rgb", greenVeryBrightRgb);
      const surfaceDarkRgb = this._hslToRgb(hue, 18, 10);
      root.style.setProperty("--surface-dark-rgb", surfaceDarkRgb);
      const surfaceDarkMidRgb = this._hslToRgb(hue, 18, 13);
      root.style.setProperty("--surface-dark-rgb-mid", surfaceDarkMidRgb);
      const surfaceDarkEndRgb = this._hslToRgb(hue, 18, 16);
      root.style.setProperty("--surface-dark-rgb-end", surfaceDarkEndRgb);
      const surfaceDeepRgb = this._hslToRgb(hue, 14, 8);
      root.style.setProperty("--surface-deep-rgb", surfaceDeepRgb);
      const surfaceDeepAltRgb = this._hslToRgb(hue, 17, 10);
      root.style.setProperty("--surface-deep-alt-rgb", surfaceDeepAltRgb);
      const paleGreenRgbDark = this._hslToRgb(hue, 18, 10);
      root.style.setProperty("--pale-green-rgb-dark", paleGreenRgbDark);
      const paleGreenAltRgbDark = this._hslToRgb(hue, 18, 13);
      root.style.setProperty("--pale-green-alt-rgb-dark", paleGreenAltRgbDark);
      this._syncHueUI(hue);
    },
    /**
     * 恢复用户手动设定的色相（关闭「跟随 Obsidian 主题配色」时调用）
     * 优先用内存记录，缺失时回退持久化设置，再回退默认竹青绿
     */
    async _restoreUserHue() {
      let hue = this._userHue;
      if (hue === null || hue === void 0 || isNaN(hue)) {
        try {
          const saved = await storageManager.getSetting("displayHue");
          hue = saved !== null && saved !== void 0 ? Number(saved) : this.DEFAULT_HUE;
        } catch (e) {
          hue = this.DEFAULT_HUE;
        }
      }
      if (isNaN(hue) || hue < this.HUE_MIN || hue > this.HUE_MAX) hue = this.DEFAULT_HUE;
      this._applyHue(hue, false);
    },
    /**
     * 用 Obsidian 侧边栏背景色温（"r, g, b"）覆盖插件卡片底色
     * 保留原有的两层透明度：--card-bg 较透（0.60），--card-glass 更实（0.84）
     * @param {string} rgb "r, g, b" 三元组
     * @param {boolean} [fromTheme=false] 来自主题联动时为 true（不回写 Obsidian）
     */
    _applyObsidianBg(rgb, fromTheme = false) {
      const root = getCssVarRoot();
      if (!root) return;
      if (!rgb) return;
      root.style.setProperty("--obsidian-sidebar-rgb", rgb);
      root.style.setProperty("--card-bg", `rgba(${rgb}, 0.60)`);
      root.style.setProperty("--card-glass", `rgba(${rgb}, 0.84)`);
    },
    /**
     * 恢复卡片底色（关闭「跟随 Obsidian 主题配色」时调用）
     * 移除内联覆盖，回退到 variables.css 的明暗模式默认卡片底色
     */
    _restoreUserBg() {
      const root = getCssVarRoot();
      if (!root) return;
      root.style.removeProperty("--obsidian-sidebar-rgb");
      root.style.removeProperty("--card-bg");
      root.style.removeProperty("--card-glass");
    },
    /**
     * 用 Obsidian 文字色温覆盖插件文字色变量
     * - 主文字 --text-normal → --ink-dark / --ink-medium（主/次强调）
     * - 弱化文字 --text-muted → --ink-light / --ink-pale（辅助/弱化）
     * 暗色模式下插件原文字带 --accent-hue 绿调，覆盖后即贴近 Obsidian 中性文字色温
     * @param {string} [normalRgb] "r, g, b" 主文字三元组
     * @param {string} [mutedRgb] "r, g, b" 弱化文字三元组
     * @param {boolean} [fromTheme=false] 来自主题联动时为 true（不回写 Obsidian）
     */
    _applyObsidianText(normalRgb, mutedRgb, fromTheme = false) {
      const root = getCssVarRoot();
      if (!root) return;
      if (normalRgb) {
        root.style.setProperty("--ink-dark", `rgb(${normalRgb})`);
        root.style.setProperty("--ink-medium", `rgb(${normalRgb})`);
      }
      if (mutedRgb) {
        root.style.setProperty("--ink-light", `rgb(${mutedRgb})`);
        root.style.setProperty("--ink-pale", `rgb(${mutedRgb})`);
      }
    },
    /**
     * 恢复文字色（关闭「跟随 Obsidian 主题配色」时调用）
     * 移除内联覆盖，回退到 variables.css 的明暗模式默认文字色
     */
    _restoreUserText() {
      const root = getCssVarRoot();
      if (!root) return;
      root.style.removeProperty("--ink-dark");
      root.style.removeProperty("--ink-medium");
      root.style.removeProperty("--ink-light");
      root.style.removeProperty("--ink-pale");
    },
    _syncHueUI(hue) {
      if (this._hueSliderEl) {
        this._hueSliderEl.value = hue;
      }
      if (this._hueValueLabelEl) {
        this._hueValueLabelEl.textContent = hue + "\xB0";
      }
      if (this._panelEl) {
        const huePresetBtns = this._panelEl.querySelectorAll(".display-hue-preset-btn");
        huePresetBtns.forEach((btn) => {
          const pv = Number(btn.dataset.value);
          btn.classList.toggle("active", pv === hue);
        });
      }
    },
    /* ===== 构建面板 DOM ===== */
    _buildPanel() {
      const panel = document.createElement("div");
      panel.className = "display-panel";
      panel.id = "displayPanel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "\u663E\u793A\u8BBE\u7F6E");
      panel.hidden = true;
      const header = document.createElement("div");
      header.className = "display-panel-header";
      header.innerHTML = `
            <span class="display-panel-title">\u663E\u793A\u8BBE\u7F6E</span>
            <button class="display-panel-close" aria-label="\u5173\u95ED" title="\u5173\u95ED">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
      panel.appendChild(header);
      const widthSection = document.createElement("div");
      widthSection.className = "display-section";
      const widthLabel = document.createElement("div");
      widthLabel.className = "display-section-label";
      widthLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3"/><path d="M21 3v4"/><path d="M3 3v4"/><path d="M21 21H3"/><path d="M21 21v-4"/><path d="M3 21v-4"/><path d="M12 3v18"/></svg>
            <span>\u5185\u5BB9\u5BBD\u5EA6</span>
        `;
      widthSection.appendChild(widthLabel);
      const sliderRow = document.createElement("div");
      sliderRow.className = "display-slider-row";
      const slider = document.createElement("input");
      slider.type = "range";
      slider.className = "display-slider";
      slider.min = this.MIN_WIDTH;
      slider.max = this.MAX_WIDTH;
      slider.step = 20;
      slider.value = this.DEFAULT_WIDTH;
      slider.setAttribute("aria-label", "\u5185\u5BB9\u5BBD\u5EA6");
      this._sliderEl = slider;
      const valueLabel = document.createElement("span");
      valueLabel.className = "display-value-label";
      valueLabel.textContent = this.DEFAULT_WIDTH + "px";
      this._valueLabelEl = valueLabel;
      sliderRow.appendChild(slider);
      sliderRow.appendChild(valueLabel);
      widthSection.appendChild(sliderRow);
      const presetRow = document.createElement("div");
      presetRow.className = "display-preset-row";
      this.PRESETS.forEach((preset) => {
        const btn = document.createElement("button");
        btn.className = "display-preset-btn";
        btn.dataset.value = preset.value;
        btn.title = preset.title;
        btn.textContent = preset.label;
        btn.setAttribute("aria-label", `${preset.label} (${preset.title})`);
        presetRow.appendChild(btn);
      });
      widthSection.appendChild(presetRow);
      panel.appendChild(widthSection);
      const fontSection = document.createElement("div");
      fontSection.className = "display-section";
      const fontLabel = document.createElement("div");
      fontLabel.className = "display-section-label";
      fontLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
            <span>\u5B57\u53F7</span>
        `;
      fontSection.appendChild(fontLabel);
      const fontSliderRow = document.createElement("div");
      fontSliderRow.className = "display-slider-row";
      const fontSlider = document.createElement("input");
      fontSlider.type = "range";
      fontSlider.className = "display-slider";
      fontSlider.min = this.FONT_MIN;
      fontSlider.max = this.FONT_MAX;
      fontSlider.step = 0.05;
      fontSlider.value = this.DEFAULT_FONT_SCALE;
      fontSlider.setAttribute("aria-label", "\u5B57\u53F7");
      this._fontSliderEl = fontSlider;
      const fontValueLabel = document.createElement("span");
      fontValueLabel.className = "display-value-label";
      fontValueLabel.textContent = Math.round(this.DEFAULT_FONT_SCALE * 100) + "%";
      this._fontValueLabelEl = fontValueLabel;
      fontSliderRow.appendChild(fontSlider);
      fontSliderRow.appendChild(fontValueLabel);
      fontSection.appendChild(fontSliderRow);
      const fontPresetRow = document.createElement("div");
      fontPresetRow.className = "display-preset-row";
      this.FONT_PRESETS.forEach((preset) => {
        const btn = document.createElement("button");
        btn.className = "display-font-preset-btn";
        btn.dataset.value = preset.value;
        btn.title = preset.title;
        btn.textContent = preset.label;
        btn.setAttribute("aria-label", `${preset.label} (${preset.title})`);
        fontPresetRow.appendChild(btn);
      });
      fontSection.appendChild(fontPresetRow);
      panel.appendChild(fontSection);
      const gapSection = document.createElement("div");
      gapSection.className = "display-section";
      const gapLabel = document.createElement("div");
      gapLabel.className = "display-section-label";
      gapLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6H3"/><path d="M21 12H3"/><path d="M21 18H3"/></svg>
            <span>\u677F\u5757\u95F4\u8DDD</span>
        `;
      gapSection.appendChild(gapLabel);
      const gapSliderRow = document.createElement("div");
      gapSliderRow.className = "display-slider-row";
      const gapSlider = document.createElement("input");
      gapSlider.type = "range";
      gapSlider.className = "display-slider";
      gapSlider.min = this.GAP_MIN;
      gapSlider.max = this.GAP_MAX;
      gapSlider.step = 0.1;
      gapSlider.value = this.DEFAULT_GAP_SCALE;
      gapSlider.setAttribute("aria-label", "\u677F\u5757\u95F4\u8DDD");
      this._gapSliderEl = gapSlider;
      const gapValueLabel = document.createElement("span");
      gapValueLabel.className = "display-value-label";
      gapValueLabel.textContent = Math.round(this.DEFAULT_GAP_SCALE * 100) + "%";
      this._gapValueLabelEl = gapValueLabel;
      gapSliderRow.appendChild(gapSlider);
      gapSliderRow.appendChild(gapValueLabel);
      gapSection.appendChild(gapSliderRow);
      const gapPresetRow = document.createElement("div");
      gapPresetRow.className = "display-preset-row";
      this.GAP_PRESETS.forEach((preset) => {
        const btn = document.createElement("button");
        btn.className = "display-gap-preset-btn";
        btn.dataset.value = preset.value;
        btn.title = preset.title;
        btn.textContent = preset.label;
        btn.setAttribute("aria-label", `${preset.label} (${preset.title})`);
        gapPresetRow.appendChild(btn);
      });
      gapSection.appendChild(gapPresetRow);
      panel.appendChild(gapSection);
      const hueSection = document.createElement("div");
      hueSection.className = "display-section";
      const hueLabel = document.createElement("div");
      hueLabel.className = "display-section-label";
      hueLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <span>\u4E3B\u9898\u8272\u76F8</span>
        `;
      hueSection.appendChild(hueLabel);
      const hueSliderRow = document.createElement("div");
      hueSliderRow.className = "display-slider-row";
      const hueSlider = document.createElement("input");
      hueSlider.type = "range";
      hueSlider.className = "display-slider display-hue-slider";
      hueSlider.min = this.HUE_MIN;
      hueSlider.max = this.HUE_MAX;
      hueSlider.step = 1;
      hueSlider.value = this.DEFAULT_HUE;
      hueSlider.setAttribute("aria-label", "\u4E3B\u9898\u8272\u76F8");
      this._hueSliderEl = hueSlider;
      const hueValueLabel = document.createElement("span");
      hueValueLabel.className = "display-value-label";
      hueValueLabel.textContent = this.DEFAULT_HUE + "\xB0";
      this._hueValueLabelEl = hueValueLabel;
      hueSliderRow.appendChild(hueSlider);
      hueSliderRow.appendChild(hueValueLabel);
      hueSection.appendChild(hueSliderRow);
      const huePresetRow = document.createElement("div");
      huePresetRow.className = "display-preset-row";
      this.HUE_PRESETS.forEach((preset) => {
        const btn = document.createElement("button");
        btn.className = "display-hue-preset-btn";
        btn.dataset.value = preset.value;
        btn.title = preset.title;
        btn.textContent = preset.label;
        btn.setAttribute("aria-label", `${preset.label} (${preset.title})`);
        huePresetRow.appendChild(btn);
      });
      hueSection.appendChild(huePresetRow);
      const resetBtn = document.createElement("button");
      resetBtn.className = "display-hue-reset-btn";
      resetBtn.textContent = "\u6062\u590D\u9ED8\u8BA4";
      resetBtn.title = "\u6062\u590D\u5230\u9ED8\u8BA4\u7AF9\u9752\u7EFF\u8272";
      resetBtn.setAttribute("aria-label", "\u6062\u590D\u9ED8\u8BA4\u4E3B\u9898\u8272\u76F8");
      hueSection.appendChild(resetBtn);
      panel.appendChild(hueSection);
      const lightnessSection = document.createElement("div");
      lightnessSection.className = "display-section";
      const lightnessLabel = document.createElement("div");
      lightnessLabel.className = "display-section-label";
      lightnessLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <span>\u660E\u5EA6</span>
        `;
      lightnessSection.appendChild(lightnessLabel);
      const lightnessSliderRow = document.createElement("div");
      lightnessSliderRow.className = "display-slider-row";
      const lightnessSlider = document.createElement("input");
      lightnessSlider.type = "range";
      lightnessSlider.className = "display-slider";
      lightnessSlider.min = this.LIGHTNESS_MIN;
      lightnessSlider.max = this.LIGHTNESS_MAX;
      lightnessSlider.step = 1;
      lightnessSlider.value = this.DEFAULT_LIGHTNESS;
      lightnessSlider.setAttribute("aria-label", "\u660E\u5EA6");
      this._lightnessSliderEl = lightnessSlider;
      const lightnessValueLabel = document.createElement("span");
      lightnessValueLabel.className = "display-value-label";
      lightnessValueLabel.textContent = this.DEFAULT_LIGHTNESS >= 0 ? "+" + this.DEFAULT_LIGHTNESS + "%" : this.DEFAULT_LIGHTNESS + "%";
      this._lightnessValueLabelEl = lightnessValueLabel;
      lightnessSliderRow.appendChild(lightnessSlider);
      lightnessSliderRow.appendChild(lightnessValueLabel);
      lightnessSection.appendChild(lightnessSliderRow);
      const lightnessPresetRow = document.createElement("div");
      lightnessPresetRow.className = "display-preset-row";
      this.LIGHTNESS_PRESETS.forEach((preset) => {
        const btn = document.createElement("button");
        btn.className = "display-lightness-preset-btn";
        btn.dataset.value = preset.value;
        btn.title = preset.title;
        btn.textContent = preset.label;
        btn.setAttribute("aria-label", preset.title);
        lightnessPresetRow.appendChild(btn);
      });
      lightnessSection.appendChild(lightnessPresetRow);
      panel.appendChild(lightnessSection);
      modalMount().appendChild(panel);
      this._panelEl = panel;
    },
    /* ===== 绑定事件 ===== */
    _bindEvents() {
      if (!this._panelEl) return;
      const closeBtn = this._panelEl.querySelector(".display-panel-close");
      closeBtn.addEventListener("click", () => this.close());
      this._sliderEl.addEventListener("input", (e) => {
        const val = Number(e.target.value);
        this._applyWidth(val, false);
      });
      this._sliderEl.addEventListener("change", (e) => {
        const val = Number(e.target.value);
        this._scheduleSave(val);
      });
      const presetBtns = this._panelEl.querySelectorAll(".display-preset-btn");
      presetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.dataset.value);
          this._applyWidth(val, true);
          this._scheduleSave(val);
        });
      });
      if (this._fontSliderEl) {
        this._fontSliderEl.addEventListener("input", (e) => {
          const val = Number(e.target.value);
          this._applyFontScale(val, false);
        });
        this._fontSliderEl.addEventListener("change", (e) => {
          const val = Number(e.target.value);
          this._scheduleSaveFont(val);
        });
      }
      const fontPresetBtns = this._panelEl.querySelectorAll(".display-font-preset-btn");
      fontPresetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.dataset.value);
          this._applyFontScale(val, true);
          this._scheduleSaveFont(val);
        });
      });
      if (this._gapSliderEl) {
        this._gapSliderEl.addEventListener("input", (e) => {
          const val = Number(e.target.value);
          this._applyGapScale(val, false);
        });
        this._gapSliderEl.addEventListener("change", (e) => {
          const val = Number(e.target.value);
          this._scheduleSaveGap(val);
        });
      }
      const gapPresetBtns = this._panelEl.querySelectorAll(".display-gap-preset-btn");
      gapPresetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.dataset.value);
          this._applyGapScale(val, true);
          this._scheduleSaveGap(val);
        });
      });
      if (this._hueSliderEl) {
        this._hueSliderEl.addEventListener("input", (e) => {
          const val = Number(e.target.value);
          this._applyHue(val);
        });
        this._hueSliderEl.addEventListener("change", (e) => {
          const val = Number(e.target.value);
          this._scheduleSaveHue(val);
        });
      }
      const huePresetBtns = this._panelEl.querySelectorAll(".display-hue-preset-btn");
      huePresetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.dataset.value);
          this._applyHue(val);
          this._scheduleSaveHue(val);
        });
      });
      const hueResetBtn = this._panelEl.querySelector(".display-hue-reset-btn");
      if (hueResetBtn) {
        hueResetBtn.addEventListener("click", () => {
          this._applyHue(this.DEFAULT_HUE);
          this._scheduleSaveHue(this.DEFAULT_HUE);
        });
      }
      if (this._lightnessSliderEl) {
        this._lightnessSliderEl.addEventListener("input", (e) => {
          const val = Number(e.target.value);
          this._applyLightness(val);
        });
        this._lightnessSliderEl.addEventListener("change", (e) => {
          const val = Number(e.target.value);
          this._scheduleSaveLightness(val);
        });
      }
      const lightnessPresetBtns = this._panelEl.querySelectorAll(".display-lightness-preset-btn");
      lightnessPresetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.dataset.value);
          this._applyLightness(val);
          this._scheduleSaveLightness(val);
        });
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen()) {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      });
      document.addEventListener("click", (e) => {
        if (!this.isOpen()) return;
        const panel = this._panelEl;
        const fabContainer = $(".fab-container");
        if (!eventInTargets2(e, panel) && !(fabContainer && eventInTargets2(e, fabContainer))) {
          this.close();
        }
      });
    },
    /* ===== 打开/关闭面板 ===== */
    toggle() {
      this.isOpen() ? this.close() : this.open();
    },
    open() {
      if (!this._panelEl || this.isOpen()) return;
      this._panelEl.hidden = false;
      this._positionPanel();
      requestAnimationFrame(() => {
        this._panelEl.classList.add("open");
      });
    },
    close() {
      if (!this._panelEl || !this.isOpen()) return;
      this._panelEl.classList.remove("open");
      setTimeout(() => {
        if (this._panelEl) this._panelEl.hidden = true;
      }, 200);
    },
    isOpen() {
      return this._panelEl && !this._panelEl.hidden;
    },
    /* ===== 面板定位 ===== */
    _positionPanel() {
      const fab = byId("fabMain");
      if (!fab || !this._panelEl) return;
      const fabRect = fab.getBoundingClientRect();
      const vp = { width: window.innerWidth, height: window.innerHeight };
      const panelW = 280;
      const panelH = this._panelEl.scrollHeight || 180;
      const gap = 12;
      let left = fabRect.left - panelW - gap;
      let top = fabRect.top + fabRect.height / 2 - panelH / 2;
      if (left < 8) {
        left = Math.max(8, fabRect.left + fabRect.width / 2 - panelW / 2);
        top = fabRect.top - panelH - gap;
      }
      if (top < 8) {
        top = fabRect.bottom + gap;
      }
      if (left + panelW > vp.width - 8) {
        left = vp.width - panelW - 8;
      }
      if (top + panelH > vp.height - 8) {
        top = vp.height - panelH - 8;
      }
      this._panelEl.style.left = Math.max(8, left) + "px";
      this._panelEl.style.top = Math.max(8, top) + "px";
    },
    /* ===== 重置为默认宽度 ===== */
    async reset() {
      this._applyWidth(this.DEFAULT_WIDTH, true);
      try {
        await storageManager.putSetting("displayWidth", this.DEFAULT_WIDTH);
      } catch (e) {
        console.warn("[DisplayManager] Failed to reset setting:", e.message);
      }
    }
  };
  window.DisplayManager = DisplayManager2;

  // assets/scripts/utils/weatherService.js
  var weatherService_exports = {};
  __export(weatherService_exports, {
    CACHE_KEY: () => CACHE_KEY,
    CACHE_TTL: () => CACHE_TTL,
    WEATHER_ICONS: () => WEATHER_ICONS,
    WEATHER_LABELS: () => WEATHER_LABELS,
    WeatherService: () => WeatherService2,
    clearCache: () => clearCache,
    getManualCity: () => getManualCity,
    readCache: () => readCache,
    setManualCity: () => setManualCity,
    writeCache: () => writeCache,
    wttrCodeToType: () => wttrCodeToType
  });
  function wttrCodeToType(code) {
    const c = String(code);
    if (c === "113") return "clear";
    if (c === "116") return "partlyCloudy";
    if (c === "119" || c === "122") return "cloudy";
    if (c === "143" || c === "248" || c === "260") return "fog";
    if (["176", "182", "185", "263", "266", "281", "284", "293", "296", "299", "302", "305", "308", "311", "314", "317", "320", "353", "356", "359", "362", "365"].indexOf(c) >= 0) return "rain";
    if (["179", "227", "230", "323", "326", "329", "332", "335", "338", "350", "368", "371", "374", "377", "392", "395"].indexOf(c) >= 0) return "snow";
    if (["200", "386", "389"].indexOf(c) >= 0) return "thunderstorm";
    return "unknown";
  }
  var WEATHER_ICONS = {
    clear: "\u2600\uFE0F",
    partlyCloudy: "\u26C5",
    cloudy: "\u2601\uFE0F",
    fog: "\u{1F32B}\uFE0F",
    rain: "\u{1F327}\uFE0F",
    snow: "\u2744\uFE0F",
    thunderstorm: "\u26C8\uFE0F",
    unknown: "\u{1F324}\uFE0F"
  };
  var WEATHER_LABELS = {
    clear: "\u6674",
    partlyCloudy: "\u591A\u4E91",
    cloudy: "\u9634",
    fog: "\u96FE",
    rain: "\u96E8",
    snow: "\u96EA",
    thunderstorm: "\u96F7\u66B4",
    unknown: ""
  };
  var CACHE_KEY = "weather-cache";
  var CACHE_TTL = 2 * 60 * 60 * 1e3;
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.fetchedAt) return null;
      if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null;
      return parsed;
    } catch {
      return null;
    }
  }
  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
    }
  }
  function clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
    }
  }
  function getManualCity() {
    try {
      if (typeof store !== "undefined" && store.state && store.state.ui && store.state.ui.weatherCity) {
        return store.state.ui.weatherCity;
      }
      return StorageAdapter.get(StorageKeys.WEATHER_CITY) || null;
    } catch {
      return null;
    }
  }
  function setManualCity(name) {
    try {
      if (name) StorageAdapter.set(StorageKeys.WEATHER_CITY, name);
      else StorageAdapter.remove(StorageKeys.WEATHER_CITY);
    } catch {
    }
  }
  async function fetchWithTimeout(url, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
  async function fetchFromWttr(cityName) {
    const encoded = encodeURIComponent(cityName || "Beijing");
    const url = "https://wttr.in/" + encoded + "?format=j1";
    try {
      const json = await fetchWithTimeout(url, 8e3);
      const cur = json.current_condition && json.current_condition[0];
      if (!cur) return null;
      const today = json.weather && json.weather[0];
      const type = wttrCodeToType(cur.weatherCode);
      return {
        cityName: cityName || "Beijing",
        temperature: parseInt(cur.temp_C, 10),
        apparentTemperature: parseInt(cur.FeelsLikeC, 10),
        weatherCode: cur.weatherCode,
        humidity: parseInt(cur.humidity, 10),
        windSpeed: Math.round(parseFloat(cur.windspeedKmph) * 0.62),
        // km/h → mph no, 显示保持 km/h
        windSpeedKmph: parseInt(cur.windspeedKmph, 10),
        tempMax: today ? parseInt(today.maxtempC, 10) : null,
        tempMin: today ? parseInt(today.mintempC, 10) : null,
        fetchedAt: Date.now(),
        icon: WEATHER_ICONS[type] || WEATHER_ICONS.unknown,
        label: WEATHER_LABELS[type] || "",
        source: "wttr.in"
      };
    } catch (err) {
      return null;
    }
  }
  async function fetchFromOpenMeteo(cityName) {
    try {
      const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(cityName || "Beijing") + "&count=1&language=zh";
      const geo = await fetchWithTimeout(geoUrl, 6e3);
      if (!geo || !geo.results || !geo.results.length) return null;
      const loc = geo.results[0];
      const lat = loc.latitude, lon = loc.longitude;
      const fUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1";
      const f = await fetchWithTimeout(fUrl, 6e3);
      const cur = f.current || {};
      const daily = f.daily || {};
      const omCode = String(cur.weather_code);
      let type = "unknown";
      const c = parseInt(omCode, 10);
      if (c === 0) type = "clear";
      else if (c >= 1 && c <= 2) type = "partlyCloudy";
      else if (c === 3) type = "cloudy";
      else if (c === 45 || c === 48) type = "fog";
      else if (c >= 51 && c <= 67 || c >= 80 && c <= 82) type = "rain";
      else if (c >= 71 && c <= 77) type = "snow";
      else if (c >= 95 && c <= 99) type = "thunderstorm";
      return {
        cityName: loc.name || cityName || "",
        temperature: Math.round(cur.temperature_2m),
        apparentTemperature: Math.round(cur.apparent_temperature),
        weatherCode: cur.weather_code,
        humidity: cur.relative_humidity_2m,
        windSpeedKmph: Math.round(cur.wind_speed_10m),
        windSpeed: Math.round(cur.wind_speed_10m),
        tempMax: daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : null,
        tempMin: daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : null,
        fetchedAt: Date.now(),
        icon: WEATHER_ICONS[type] || WEATHER_ICONS.unknown,
        label: WEATHER_LABELS[type] || "",
        source: "open-meteo"
      };
    } catch (err) {
      return null;
    }
  }
  var WeatherService2 = {
    async getWeather(opts) {
      const options = opts || {};
      if (!options.forceRefresh) {
        const cached = readCache();
        if (cached) return cached;
      }
      if (options.forceRefresh) clearCache();
      const city = options.manualCity || getManualCity() || "\u5317\u4EAC";
      let result = await fetchFromWttr(city);
      if (result) {
        writeCache(result);
        return result;
      }
      result = await fetchFromOpenMeteo(city);
      if (result) {
        writeCache(result);
        return result;
      }
      return null;
    },
    formatSummary(data) {
      if (!data) return null;
      return {
        icon: data.icon || WEATHER_ICONS.unknown,
        label: data.label || "",
        temperature: data.temperature,
        text: (data.icon || WEATHER_ICONS.unknown) + " " + data.temperature + "\xB0"
      };
    },
    formatDetail(data) {
      if (!data) return null;
      return {
        icon: data.icon || WEATHER_ICONS.unknown,
        label: data.label || "",
        temperature: data.temperature,
        apparentTemperature: data.apparentTemperature,
        tempMax: data.tempMax,
        tempMin: data.tempMin,
        humidity: data.humidity,
        windSpeed: data.windSpeedKmph || data.windSpeed,
        cityName: data.cityName || ""
      };
    },
    getLast() {
      return readCache();
    },
    setManualCity(name) {
      setManualCity(name);
      clearCache();
    },
    getManualCity() {
      return getManualCity();
    }
  };
  window.WeatherService = WeatherService2;

  // assets/scripts/utils/quoteService.js
  var quoteService_exports = {};
  __export(quoteService_exports, {
    QuoteService: () => QuoteService2
  });
  var QuoteService2 = {
    _builtinQuotes: [
      { text: "\u76EE\u9001\u5F52\u9E3F\uFF0C\u624B\u6325\u4E94\u5F26\u3002", author: "\u5D47\u5EB7" },
      { text: "\u4FEF\u4EF0\u81EA\u5F97\uFF0C\u6E38\u5FC3\u592A\u7384\u3002", author: "\u5D47\u5EB7" },
      { text: "\u606F\u5F92\u5170\u5703\uFF0C\u79E3\u9A6C\u534E\u5C71\u3002", author: "\u5D47\u5EB7" },
      { text: "\u6D41\u78FB\u5E73\u768B\uFF0C\u5782\u7EB6\u957F\u5DDD\u3002", author: "\u5D47\u5EB7" },
      { text: "\u5F26\u4EE5\u56ED\u5BA2\u4E4B\u4E1D\uFF0C\u5FBD\u4EE5\u949F\u5C71\u4E4B\u7389\u3002", author: "\u5D47\u5EB7" },
      { text: "\u98CE\u9A70\u7535\u901D\uFF0C\u8E51\u666F\u8FFD\u98DE\u3002", author: "\u5D47\u5EB7" },
      { text: "\u8D8A\u540D\u6559\u800C\u4EFB\u81EA\u7136\u3002", author: "\u5D47\u5EB7" },
      { text: "\u8D35\u5F97\u8086\u5FD7\uFF0C\u7EB5\u5FC3\u65E0\u6094\u3002", author: "\u5D47\u5EB7" },
      { text: "\u8F7B\u8086\u76F4\u8A00\uFF0C\u9047\u4E8B\u5373\u53D1\uFF0C\u521A\u80A0\u5AC9\u6076\u3002", author: "\u5D47\u5EB7" },
      { text: "\u4EBA\u65E0\u5FD7\uFF0C\u975E\u4EBA\u4E5F\u3002", author: "\u5D47\u5EB7" },
      { text: "\u81EA\u975E\u91CD\u6028\uFF0C\u4E0D\u81F3\u4E8E\u6B64\u4E5F\u3002", author: "\u5D47\u5EB7" },
      { text: "\u75BE\u800C\u4E0D\u901F\uFF0C\u7559\u800C\u4E0D\u6EDE\u3002", author: "\u5D47\u5EB7" },
      { text: "\u50B2\u7768\u6ED1\u7A3D\uFF0C\u631F\u667A\u4EFB\u672F\u3002", author: "\u5D47\u5EB7" },
      { text: "\u4EA4\u4E0D\u4E3A\u5229\uFF0C\u4ED5\u4E0D\u8C0B\u7984\u3002", author: "\u5D47\u5EB7" },
      { text: "\u5609\u5F7C\u9493\u53DF\uFF0C\u5F97\u9C7C\u5FD8\u7B4C\u3002", author: "\u5D47\u5EB7" },
      { text: "\u90E2\u4EBA\u901D\u77E3\uFF0C\u8C01\u4E0E\u5C3D\u8A00\uFF1F", author: "\u5D47\u5EB7" },
      { text: "\u51CC\u5389\u4E2D\u539F\uFF0C\u987E\u76FC\u751F\u59FF\u3002", author: "\u5D47\u5EB7" },
      { text: "\u5FAA\u6027\u800C\u52A8\uFF0C\u5404\u9644\u6240\u5B89\u3002", author: "\u5D47\u5EB7" },
      { text: "\u592B\u4EBA\u4E4B\u76F8\u77E5\uFF0C\u8D35\u8BC6\u5176\u5929\u6027\uFF0C\u56E0\u800C\u6D4E\u4E4B\u3002", author: "\u5D47\u5EB7" },
      { text: "\u9E3F\u9E44\u76F8\u968F\u98DE\uFF0C\u98DE\u98DE\u9002\u8352\u88D4\u3002", author: "\u962E\u7C4D" },
      { text: "\u6797\u4E2D\u6709\u5947\u9E1F\uFF0C\u81EA\u8A00\u662F\u51E4\u51F0\u3002", author: "\u962E\u7C4D" },
      { text: "\u6E05\u671D\u996E\u91B4\u6CC9\uFF0C\u65E5\u5915\u6816\u5C71\u5188\u3002", author: "\u962E\u7C4D" },
      { text: "\u9AD8\u9E23\u5F7B\u4E5D\u5DDE\uFF0C\u5EF6\u9888\u671B\u516B\u8352\u3002", author: "\u962E\u7C4D" },
      { text: "\u9002\u9022\u5546\u98CE\u8D77\uFF0C\u7FBD\u7FFC\u81EA\u6467\u85CF\u3002", author: "\u962E\u7C4D" },
      { text: "\u4E00\u53BB\u6606\u4ED1\u897F\uFF0C\u4F55\u65F6\u590D\u56DE\u7FD4\u3002", author: "\u962E\u7C4D" },
      { text: "\u4F46\u6068\u5904\u975E\u4F4D\uFF0C\u6006\u60A2\u4F7F\u5FC3\u4F24\u3002", author: "\u962E\u7C4D" },
      { text: "\u8C01\u8A00\u4E07\u4E8B\u8270\uFF0C\u900D\u9065\u53EF\u7EC8\u751F\u3002", author: "\u962E\u7C4D" },
      { text: "\u65F6\u65E0\u82F1\u96C4\uFF0C\u4F7F\u7AD6\u5B50\u6210\u540D\u3002", author: "\u962E\u7C4D" },
      { text: "\u4EBA\u751F\u82E5\u5C18\u9732\uFF0C\u5929\u9053\u9088\u60A0\u60A0\u3002", author: "\u962E\u7C4D" },
      { text: "\u5B64\u9E3F\u53F7\u5916\u91CE\uFF0C\u7FD4\u9E1F\u9E23\u5317\u6797\u3002", author: "\u962E\u7C4D" },
      { text: "\u591C\u4E2D\u4E0D\u80FD\u5BD0\uFF0C\u8D77\u5750\u5F39\u9E23\u7434\u3002", author: "\u962E\u7C4D" },
      { text: "\u8584\u5E37\u9274\u660E\u6708\uFF0C\u6E05\u98CE\u5439\u6211\u895F\u3002", author: "\u962E\u7C4D" },
      { text: "\u5F98\u5F8A\u5C06\u4F55\u89C1\uFF1F\u5FE7\u601D\u72EC\u4F24\u5FC3\u3002", author: "\u962E\u7C4D" },
      { text: "\u671D\u9633\u4E0D\u518D\u76DB\uFF0C\u767D\u65E5\u5FFD\u897F\u5E7D\u3002", author: "\u962E\u7C4D" },
      { text: "\u7E41\u534E\u6709\u6194\u60B4\uFF0C\u5802\u4E0A\u751F\u8346\u675E\u3002", author: "\u962E\u7C4D" },
      { text: "\u7EC8\u8EAB\u5C65\u8584\u51B0\uFF0C\u8C01\u77E5\u6211\u5FC3\u7126\u3002", author: "\u962E\u7C4D" },
      { text: "\u751F\u547D\u51E0\u4F55\u65F6\uFF0C\u6177\u6168\u5404\u52AA\u529B\u3002", author: "\u962E\u7C4D" },
      { text: "\u6614\u674E\u65AF\u4E4B\u53D7\u7F6A\u516E\uFF0C\u53F9\u9EC4\u72AC\u800C\u957F\u541F\u3002", author: "\u5411\u79C0" },
      { text: "\u542C\u9E23\u7B1B\u4E4B\u6177\u6168\u516E\uFF0C\u5999\u58F0\u7EDD\u800C\u590D\u5BFB\u3002", author: "\u5411\u79C0" },
      { text: "\u505C\u9A7E\u8A00\u5176\u5C06\u8FC8\u516E\uFF0C\u9042\u63F4\u7FF0\u800C\u5199\u5FC3\u3002", author: "\u5411\u79C0" },
      { text: "\u6D4E\u9EC4\u6CB3\u4EE5\u6CDB\u821F\u516E\uFF0C\u7ECF\u5C71\u9633\u4E4B\u65E7\u5C45\u3002", author: "\u5411\u79C0" },
      { text: "\u4EE5\u5929\u5730\u4E3A\u4E00\u671D\uFF0C\u4E07\u671F\u4E3A\u987B\u81FE\u3002", author: "\u5218\u4F36" },
      { text: "\u65E5\u6708\u4E3A\u6243\u7256\uFF0C\u516B\u8352\u4E3A\u5EAD\u8862\u3002", author: "\u5218\u4F36" },
      { text: "\u5E55\u5929\u5E2D\u5730\uFF0C\u7EB5\u610F\u6240\u5982\u3002", author: "\u5218\u4F36" },
      { text: "\u9759\u542C\u4E0D\u95FB\u96F7\u9706\u4E4B\u58F0\uFF0C\u719F\u89C6\u4E0D\u7779\u6CF0\u5C71\u4E4B\u5F62\u3002", author: "\u5218\u4F36" },
      { text: "\u884C\u65E0\u8F99\u8FF9\uFF0C\u5C45\u65E0\u5BA4\u5E90\u3002", author: "\u5218\u4F36" },
      { text: "\u6B62\u5219\u64CD\u536E\u6267\u89DA\uFF0C\u52A8\u5219\u6308\u69BC\u63D0\u58F6\u3002", author: "\u5218\u4F36" },
      { text: "\u552F\u9152\u662F\u52A1\uFF0C\u7109\u77E5\u5176\u4F59\uFF1F", author: "\u5218\u4F36" },
      { text: "\u4FEF\u89C2\u4E07\u7269\uFF0C\u6270\u6270\u7109\u5982\u6C5F\u6C49\u4E4B\u8F7D\u6D6E\u840D\u3002", author: "\u5218\u4F36" },
      { text: "\u4E8C\u8C6A\u4F8D\u4FA7\u7109\uFF0C\u5982\u873E\u8803\u4E4B\u4E0E\u879F\u86C9\u3002", author: "\u5218\u4F36" },
      { text: "\u5140\u7136\u800C\u9189\uFF0C\u8C41\u5C14\u800C\u9192\u3002", author: "\u5218\u4F36" },
      { text: "\u65E0\u601D\u65E0\u8651\uFF0C\u5176\u4E50\u9676\u9676\u3002", author: "\u5218\u4F36" },
      { text: "\u5723\u4EBA\u5FD8\u60C5\uFF0C\u6700\u4E0B\u4E0D\u53CA\u60C5\u3002", author: "\u738B\u620E" },
      { text: "\u60C5\u4E4B\u6240\u949F\uFF0C\u6B63\u5728\u6211\u8F88\u3002", author: "\u738B\u620E" },
      { text: "\u89C6\u4E4B\u867D\u8FD1\uFF0C\u9088\u82E5\u5C71\u6CB3\u3002", author: "\u738B\u620E" },
      { text: "\u672A\u80FD\u514D\u4FD7\uFF0C\u804A\u590D\u5C14\u8033\u3002", author: "\u962E\u54B8" }
    ],
    parseQuoteText(raw) {
      if (!raw) return [];
      const lines = String(raw).split(/\r?\n/);
      const out = [];
      for (let i = 0; i < lines.length; i++) {
        const line = (lines[i] || "").trim();
        if (!line) continue;
        if (line.startsWith("#")) continue;
        const m = line.match(/^(.+?)[\s—\-·\-–—]+(.+?)$/);
        if (m) {
          out.push({ text: m[1].trim(), author: m[2].trim() });
        } else {
          out.push({ text: line, author: "" });
        }
      }
      return out;
    },
    async getUserQuotesFromNote(noteName) {
      const name = (noteName || "").trim();
      if (!name) return null;
      if (typeof storageManager !== "undefined" && typeof storageManager.getFile === "function") {
        try {
          const content = await storageManager.getFile(name);
          if (content && content.length > 0) {
            const lines = this.parseQuoteText(content);
            if (lines.length > 0) return lines;
          }
        } catch (e) {
          console.warn("[QuoteService] \u8BFB\u53D6\u7B14\u8BB0\u5931\u8D25:", e.message || e);
        }
      }
      return null;
    },
    async getRandomQuote() {
      const source = typeof store !== "undefined" && store.state && store.state.ui && store.state.ui.quoteSource || "";
      if (source) {
        const userQuotes = await this.getUserQuotesFromNote(source);
        if (userQuotes && userQuotes.length > 0) {
          const idx2 = Math.floor(Math.random() * userQuotes.length);
          return userQuotes[idx2];
        }
      }
      const builtin = this._builtinQuotes;
      const idx = Math.floor(Math.random() * builtin.length);
      return builtin[idx];
    }
  };
  window.QuoteService = QuoteService2;

  // assets/scripts/handlers/weatherModal.js
  var weatherModal_exports = {};
  __export(weatherModal_exports, {
    QuoteRenderer: () => QuoteRenderer2,
    WeatherRenderer: () => WeatherRenderer2
  });
  var WeatherRenderer2 = {
    _expanded: false,
    _lastData: null,
    _lastClickTime: 0,
    init() {
      if (typeof store === "undefined" || !store.state || !store.state.ui) return;
      if (store.state.ui.weatherEnabled) {
        this._expanded = !!store.state.ui.weatherExpanded;
        this.refresh();
      }
    },
    async refresh(forceRefresh) {
      const widget = byId("weatherWidget");
      if (!widget) return;
      if (typeof store !== "undefined" && store.state && store.state.ui && !store.state.ui.weatherEnabled) {
        widget.hidden = true;
        widget.innerHTML = "";
        return;
      }
      if (typeof store !== "undefined" && store.state && store.state.ui && typeof store.state.ui.weatherExpanded !== "undefined") {
        this._expanded = !!store.state.ui.weatherExpanded;
      }
      widget.hidden = false;
      widget.innerHTML = '<div class="weather-core"><span class="weather-loading">\u22EF</span></div>';
      widget.setAttribute("aria-label", "\u5929\u6C14\u52A0\u8F7D\u4E2D");
      widget.title = "\u5929\u6C14\u52A0\u8F7D\u4E2D\u2026";
      widget.onclick = null;
      widget.ondblclick = null;
      if (typeof WeatherService === "undefined") {
        this._renderFailed(widget, "\u5929\u6C14\u7EC4\u4EF6\u672A\u52A0\u8F7D");
        return;
      }
      try {
        const data = await WeatherService.getWeather({ forceRefresh: !!forceRefresh });
        if (!data) {
          this._renderFailed(widget, "\u83B7\u53D6\u5931\u8D25");
          return;
        }
        this._lastData = data;
        this._renderNormal(widget, data);
      } catch (e) {
        this._renderFailed(widget, "\u83B7\u53D6\u5931\u8D25");
      }
    },
    _renderFailed(widget, msg) {
      widget.innerHTML = '<div class="weather-core weather-failed"><span class="weather-icon">\u26A0</span><span class="weather-temp">' + msg + "</span></div>";
      widget.setAttribute("aria-label", "\u5929\u6C14" + msg);
      widget.title = msg + "\uFF0C\u70B9\u51FB\u91CD\u8BD5";
      widget.classList.add("weather-widget-error");
      const self = this;
      widget.onclick = function(ev) {
        if (ev) ev.stopPropagation();
        self.refresh(true);
      };
    },
    _renderNormal(widget, data) {
      const summary = WeatherService.formatSummary(data);
      const d = WeatherService.formatDetail(data);
      widget.classList.remove("weather-widget-error");
      widget.setAttribute("aria-label", summary.label + " " + summary.temperature + "\u5EA6");
      widget.title = "\u70B9\u51FB\u5C55\u5F00 \xB7 \u53CC\u51FB\u57CE\u5E02\u540D\u5207\u6362\u57CE\u5E02 \xB7 \u5C55\u5F00\u6001\u7A7A\u767D\u5904\u70B9\u51FB\u5237\u65B0";
      const hasRange = d.tempMin !== null && d.tempMin !== void 0;
      const hasHumidity = d.humidity !== void 0 && d.humidity !== null;
      const city = d.cityName && String(d.cityName).trim() ? String(d.cityName).trim() : "";
      const coreHtml = '<span class="weather-icon" aria-hidden="true">' + summary.icon + '</span><span class="weather-temp">' + summary.temperature + "\xB0</span>";
      const expandHtml = (city ? '<span class="weather-city" data-role="city-name" title="\u53CC\u51FB\u5207\u6362\u57CE\u5E02">' + city + "</span>" : "") + '<span class="weather-sep">\xB7</span><span class="weather-label">' + summary.label + "</span>" + (hasRange ? '<span class="weather-sep">\xB7</span><span class="weather-range">' + d.tempMin + "\xB0~" + d.tempMax + "\xB0</span>" : "") + (hasHumidity ? '<span class="weather-sep">\xB7</span><span class="weather-meta">\u6E7F\u5EA6 ' + d.humidity + "%</span>" : "");
      widget.innerHTML = '<div class="weather-core">' + coreHtml + '</div><div class="weather-expand">' + expandHtml + "</div>";
      if (this._expanded) {
        widget.classList.add("weather-open");
      }
      const self = this;
      widget.onclick = function(ev) {
        if (!ev) return;
        const target = ev.target;
        if (target) {
          const input = target.closest && target.closest("input");
          if (input) return;
          const button = target.closest && target.closest("button");
          if (button) return;
        }
        ev.stopPropagation();
        const core = target.closest && target.closest(".weather-core");
        if (core) {
          self._toggleExpand(widget);
          return;
        }
        const expand = target.closest && target.closest(".weather-expand");
        if (expand) {
          const cityEl = target.closest && target.closest('[data-role="city-name"]');
          if (cityEl) return;
          self.refresh(true);
          return;
        }
        self._toggleExpand(widget);
      };
      widget.ondblclick = function(ev) {
        if (!ev) return;
        const target = ev.target;
        const cityEl = target.closest && target.closest('[data-role="city-name"]');
        if (!cityEl) return;
        ev.stopPropagation();
        self._showCityEditor(widget);
      };
    },
    _toggleExpand(widget) {
      this._expanded = !this._expanded;
      if (this._expanded) {
        widget.classList.add("weather-open");
        const self = this;
        setTimeout(function() {
          document.addEventListener("click", function outsideClose(e) {
            if (!self._expanded) {
              document.removeEventListener("click", outsideClose);
              return;
            }
            const w = byId("weatherWidget");
            if (!w || !eventInTargets2(e, w)) {
              self._expanded = false;
              if (w) w.classList.remove("weather-open");
              document.removeEventListener("click", outsideClose);
            }
          });
        }, 0);
      } else {
        widget.classList.remove("weather-open");
      }
    },
    _showCityEditor(widget) {
      const expand = widget.querySelector(".weather-expand");
      if (!expand) return;
      const manualCity = typeof WeatherService !== "undefined" && typeof WeatherService.getManualCity === "function" ? WeatherService.getManualCity() : "";
      expand.innerHTML = '<input type="text" class="weather-city-inline" placeholder="\u57CE\u5E02\u540D\uFF0C\u56DE\u8F66\u4FDD\u5B58" value="' + (manualCity || "") + '" /><span class="weather-actions"><button class="weather-btn weather-btn-active" data-role="submit-city" title="\u786E\u8BA4" aria-label="\u786E\u8BA4"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button><button class="weather-btn" data-role="cancel-city" title="\u53D6\u6D88" aria-label="\u53D6\u6D88"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></span>';
      const input = expand.querySelector(".weather-city-inline");
      if (input) {
        input.focus();
        input.select && input.select();
      }
      const self = this;
      const submit = function() {
        const val = input ? (input.value || "").trim() : "";
        if (typeof WeatherService !== "undefined" && typeof WeatherService.setManualCity === "function") {
          WeatherService.setManualCity(val.length > 0 ? val : null);
        }
        if (typeof store !== "undefined" && typeof store.setWeatherCity === "function") {
          store.setWeatherCity(val.length > 0 ? val : "");
        }
        self.refresh(true);
      };
      const cancel = function() {
        if (self._lastData) self._renderNormal(widget, self._lastData);
      };
      const submitBtn = expand.querySelector('[data-role="submit-city"]');
      if (submitBtn) submitBtn.addEventListener("click", function(ev) {
        ev.stopPropagation();
        submit();
      });
      const cancelBtn = expand.querySelector('[data-role="cancel-city"]');
      if (cancelBtn) cancelBtn.addEventListener("click", function(ev) {
        ev.stopPropagation();
        cancel();
      });
      if (input) {
        input.addEventListener("keydown", function(ev) {
          ev.stopPropagation();
          if (ev.key === "Enter") submit();
          else if (ev.key === "Escape") cancel();
        });
        input.addEventListener("click", function(ev) {
          ev.stopPropagation();
        });
      }
    },
    closeDetail() {
      const widget = byId("weatherWidget");
      if (widget) widget.classList.remove("weather-open");
      this._expanded = false;
    }
  };
  ActionDispatcher.registerMany({
    "toggle-weather": async function() {
      const next = !store.state.ui.weatherEnabled;
      await store.setWeatherEnabled(next);
      WeatherRenderer2.refresh();
      if (typeof Toast !== "undefined" && typeof Toast.showToast === "function") {
        Toast.showToast(next ? "\u5DF2\u6253\u5F00\u5929\u6C14\u663E\u793A" : "\u5DF2\u5173\u95ED\u5929\u6C14\u663E\u793A", "success");
      }
    },
    "refresh-weather": async function() {
      WeatherRenderer2.closeDetail();
      WeatherRenderer2.refresh(true);
    }
  });
  window.WeatherRenderer = WeatherRenderer2;
  var QuoteRenderer2 = {
    _lastQuote: null,
    init() {
      if (typeof store === "undefined" || !store.state || !store.state.ui) return;
      if (store.state.ui.quoteEnabled) this.refresh();
    },
    async refresh() {
      const widget = byId("quoteWidget");
      if (!widget) return;
      if (typeof store !== "undefined" && store.state && store.state.ui && !store.state.ui.quoteEnabled) {
        widget.hidden = true;
        widget.innerHTML = "";
        return;
      }
      if (typeof QuoteService === "undefined") {
        widget.hidden = true;
        return;
      }
      widget.hidden = false;
      widget.setAttribute("aria-label", "\u8BED\u5F55");
      widget.title = "\u70B9\u51FB\u6362\u4E00\u6761";
      const quote = await QuoteService.getRandomQuote();
      this._lastQuote = quote;
      const text = quote && quote.text ? String(quote.text) : "";
      const author = quote && quote.author ? String(quote.author) : "";
      if (!text) {
        widget.hidden = true;
        return;
      }
      widget.innerHTML = '<span class="quote-text"><span class="quote-mark quote-open">\u300C</span><span class="quote-content">' + text + '</span><span class="quote-mark quote-close">\u300D</span></span>' + (author ? '<span class="quote-author">\u2014 ' + author + "</span>" : "");
      const self = this;
      widget.onclick = function(ev) {
        if (ev) ev.stopPropagation();
        self.refresh();
      };
    }
  };
  window.QuoteRenderer = QuoteRenderer2;

  // _bundle_entry.js
  [shadowBootstrap_exports, constants_exports, storageAdapter_exports, lucideUtils_exports, helpers_exports, goalCalculations_exports, popupPositioner_exports, eventBus_exports, actionDispatcher_exports, panelManager_exports, shopManager_exports, htmlUtils_exports, toast_exports, bridge_exports, dataValidator_exports, _m15, searchService_exports, store_exports, TimelineService_exports, GoalService_exports, TodoService_exports, WalletService_exports, CustomTemplateManager_exports, healthScore_exports, confirmDialog_exports, registry_exports, sectionSettings_exports, sectionDragDrop_exports, renderer_exports, editor_exports, timeline_exports, dateRangePicker_exports, priorityPicker_exports, categoryPicker_exports, categoryManager_exports, archiver_exports, inlineEditService_exports, renderer_exports2, editor_exports2, goals_exports, renderer_exports3, todo_exports, bamboo_garden_exports, manager_exports, theme_effects_exports, NoisePlayer_exports, NoiseGenerator_exports, NoisePanel_exports, whiteNoiseManager_exports, renderers_exports, navigation_exports, keyboard_exports, gestures_exports, quickNav_exports, fabManager_exports, handlers_exports, datePicker_exports, themeSelector_exports, dataIO_exports, cultivationData_exports, goalStatsCalculator_exports, statsModal_exports, settingsModal_exports, displayManager_exports, weatherService_exports, quoteService_exports, weatherModal_exports].forEach(function(mod) {
    Object.keys(mod).forEach(function(key) {
      window[key] = mod[key];
    });
  });
  window.__WEBAPP_BUNDLE_READY = true;
})();
