/**
 * bridge.js - iframe 内通信层
 *
 * 替代 storageManager.js，将所有存储操作通过 postMessage
 * 转发给 Obsidian 主插件的 BridgeService 处理。
 *
 * 接口与 storageManager.js 完全一致，Store 类无需任何修改。
 *
 * 用法：在 index.html 中，在 storageManager.js 之前加载此文件，
 * 或者用此文件替换 storageManager.js。
 */
import { bootstrapLicenseGate } from '../utils/licenseGate.js';
// 精简视图（画中卷）内没有 DisplayManager，收到主题调色时用它直接写 CSS 变量
import { setGlobalCssVar } from '../utils/domRef.js';
// 画中卷等无 DisplayManager 的 iframe 也复用此工具，重算由色相派生的 20 个 RGB 通道，
// 使寻呼机（使用 --*-rgb 静态通道）跟随主题色相与明度。
import { applyDerivedRgb } from '../utils/palette.js';

// 画中卷 iframe 缓存最近一次收到的色相/明度，供后续单独的色相或明度变更重算派生 RGB 通道使用。
let _pagerHue = null;
let _pagerLightness = null;

export class BridgeStorage {
  constructor() {
    this.ready = false;
    this.fallbackMode = false;
    this._pendingRequests = new Map();
    this._goalWriteChain = Promise.resolve();
    this.sectionConfig = null;  // 从插件持久化层恢复的板块配置
    this.customNoises = null;   // 从插件持久化层恢复的自定义音源
    this._messageHandler = this._onMessage.bind(this);

    // 开始监听来自父窗口的响应
    window.addEventListener('message', this._messageHandler);

    // 初始化必须在 _pendingRequests 之后
    this.initPromise = this.initialize();
  }

  async initialize() {
    // 在 Obsidian ItemView 中始终通过 blob URL iframe 运行
    this.ready = true;
    // 提前锁定宿主引用（父窗口）：运行期某些 webview 上下文 window.parent 可能临时
    // 不可达，导致「Cannot read properties of undefined (reading 'postMessage')」。
    // 在初始化（握手前）捕获稳定引用，供 _send / _onMessage 使用。
    this._host = (typeof window !== 'undefined' && (window.parent || window.top || window)) || null;
    try {
      const readyResp = await this._send('app:ready', {
        protocolVersion: window.AppProtocol ? window.AppProtocol.PROTOCOL_VERSION : 1,
      });
      if (readyResp && readyResp.sectionConfig) {
        this.sectionConfig = readyResp.sectionConfig;
      }
      // 处理插件推送的自定义主题
      if (readyResp && readyResp.customThemes && Array.isArray(readyResp.customThemes)) {
        this._handleCustomThemes(readyResp.customThemes, readyResp.activeTheme || null);
      }
      // 处理插件推送的自定义音源
      if (readyResp && readyResp.customNoises && Array.isArray(readyResp.customNoises)) {
        this.customNoises = readyResp.customNoises;
        // 同步到 WhiteNoiseManager 并刷新面板（弥补 init 的时序竞态）
        if (typeof WhiteNoiseManager !== 'undefined') {
          WhiteNoiseManager.customNoises = this.customNoises;
          if (typeof NoisePanel !== 'undefined' && NoisePanel.panelVisible) {
            NoisePanel._rebuild();
          }
        }
      }
      // 是否将调色同步到 Obsidian
      if (readyResp && typeof readyResp.syncPaletteToObsidian === 'boolean') {
        this.syncPaletteToObsidian = readyResp.syncPaletteToObsidian;
      }
      // 平台感知：宿主是否为移动端（Obsidian 手机 App）。webapp 内无法直接
      // import obsidian 的 Platform，由宿主在 app:ready 时注入。
      // 供各模块做平台分支（如移动端隐藏拖拽提示、精简动画、抽屉适配）。
      if (readyResp && typeof readyResp.isMobile === 'boolean') {
        window.__bambooIsMobile = readyResp.isMobile;
        this.isMobile = readyResp.isMobile;
        // 同步给 shadow host：触发 shadowBootstrap 的 platform-mobile 类
        // （mirror 每次重读 __bambooIsMobile，此处手动触发一次让类立即生效）
        try {
          const sr = window.__bambooShadowRoot;
          if (sr && sr.host) {
            if (readyResp.isMobile) sr.host.classList.add('platform-mobile');
            else sr.host.classList.remove('platform-mobile');
          }
        } catch (_) {}
      }
      // 视图位置感知：当前视图是否在主工作区（中央）。侧边栏时为 false，
      // webapp 进入横向/看板模式时据此请求宿主把视图移动到中央。
      if (readyResp && typeof readyResp.isMainLeaf === 'boolean') {
        window.__bambooIsMainLeaf = readyResp.isMainLeaf;
      }
      // 重建视图（侧边栏移中央）后待恢复的布局模式
      if (readyResp && readyResp.pendingLayoutMode) {
        window.__bambooPendingLayoutMode = readyResp.pendingLayoutMode;
      }

      // 激活门控：未激活时挂全屏激活遮罩（密钥在宿主侧，本模块仅转发激活码）
      if (readyResp && readyResp.licenseActive === false) {
        try {
          const root = (typeof window !== 'undefined' && window.__bambooShadowRoot) || document;
          bootstrapLicenseGate(false, root, (code) => this.activateLicense(code), (backup) => this.importBackup(backup));
        } catch (e) {
          console.warn('[Bridge] 激活遮罩挂载失败:', e && e.message);
        }
      }
    } catch (e) {
      console.warn('[Bridge] Failed to get sectionConfig from plugin:', e.message);
    }

    // 桥接就绪后，二次应用板块配置
    if (typeof SectionRegistry !== 'undefined' && SectionRegistry.applyBridgeConfig) {
      SectionRegistry.applyBridgeConfig();
    }

    // 首屏补发「调色 → 写回 Obsidian 原生界面」：DisplayManager.init 与 bridge 就绪是
    // 两条异步链路，若 DisplayManager 早于本 readyResp 完成加载，开关值尚未到位，
    // 故延迟一拍（等 DisplayManager._loadAndApply 应用完色相/明度）主动补发一次。
    // 注：本补发只影响「是否写回 Obsidian」；跨 iframe 视图的调色广播不受此开关限制——
    // _maybeSyncPalette 已无条件上报，由宿主广播，使画中卷等始终跟随主视图配色。
    if (this.syncPaletteToObsidian) {
      setTimeout(() => {
        if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._maybeSyncPalette) {
          window.DisplayManager._maybeSyncPalette();
        }
      }, 60);
    }

    // 首屏调色同步：让无 DisplayManager 的精简视图（画中卷）打开即跟随主视图配色
    await this._applySavedPalette();

    // 延迟触发 storage:initialized，确保所有模块脚本已注册监听器
    setTimeout(() => {
      if (typeof EventBus !== 'undefined') {
        EventBus.emit('storage:initialized', {
          adapter: 'bridge',
          fallback: false,
        });
      }
    }, 0);
  }

  /**
   * 首屏调色同步：拉取持久化的色相/明度并写入 CSS 变量。
   *
   * 仅对「没有 DisplayManager」的精简视图（画中卷）生效——主视图由
   * DisplayManager._loadAndApply 自行读取，这里再写一遍虽幂等但无必要。
   * 画中卷的 bundle 不含 displayManager.js，若不在此处主动拉取，它就永远停在
   * variables.css 的默认值（色相 120 / 明度 0%），只有等用户在主视图动一次滑块、
   * 经宿主广播过来才会变色。
   *
   * 注：本方法在 initialize() 内部调用，故直接用 _send 而非 getSetting，
   * 避免与 ensureReady()/initPromise 产生任何时序耦合。
   */
  async _applySavedPalette() {
    if (typeof window.DisplayManager !== 'undefined') return; // 主视图自行处理
    try {
      const [hue, lightness] = await Promise.all([
        this._send('storage:getSetting', { key: 'displayHue' }),
        this._send('storage:getSetting', { key: 'displayLightness' }),
      ]);
      // 未存过档时返回 null（typeof 为 object），自动跳过、保留 variables.css 默认值
      if (typeof hue === 'number' && Number.isFinite(hue)) {
        setGlobalCssVar('--accent-hue', String(hue));
      }
      if (typeof lightness === 'number' && Number.isFinite(lightness)) {
        setGlobalCssVar('--accent-lightness-offset', lightness + '%');
      }
    } catch (e) {
      // 读取失败（超时等）不影响渲染，保持默认配色
    }
  }

  /** 发送请求到父窗口并等待响应 */
  _send(type, payload) {
    return new Promise((resolve, reject) => {
      const id = 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

      const timeout = setTimeout(() => {
        this._pendingRequests.delete(id);
        reject(new Error(`Bridge request timeout: ${type}`));
      }, 10000);

      this._pendingRequests.set(id, { resolve, reject, timeout });

      // 宿主引用：initialize() 已锁定 this._host（window.parent || window.top ||
      // window）。运行期部分 webview 上下文 window.parent 会临时不可达，提前使用稳定
      // 引用；若仍无可达目标，则干净 reject 让上层（如市场清单拉取）走降级，而非抛出
      // 未捕获异常（Cannot read properties of undefined (reading 'postMessage')）。
      const target = this._host
        || (typeof window !== 'undefined' && (window.parent || window.top || window))
        || null;
      if (!target || typeof target.postMessage !== 'function') {
        clearTimeout(timeout);
        this._pendingRequests.delete(id);
        reject(new Error('Bridge host unreachable (no postMessage target)'));
        return;
      }

      // 统一用 '*' 作 targetOrigin。
      // 注意：在安卓 Obsidian（Capacitor WebView）中，blob 源 iframe 的
      // window.parent.origin 返回字符串 'null'，postMessage(msg, 'null') 会抛
      // SyntaxError（'null' 既非 '*' 也非合法 origin）；而 '*' 在所有平台（桌面/安卓/ios）
      // 都安全且可达——宿主侧校验的是 event.source（contentWindow 对象），不依赖 origin 字符串。
      try {
        target.postMessage({ type, id, payload }, '*');
      } catch (e) {
        clearTimeout(timeout);
        this._pendingRequests.delete(id);
        reject(e instanceof Error ? e : new Error('Bridge postMessage failed: ' + e));
      }
    });
  }

  /** 接收父窗口的响应 */
  _onMessage(event) {
    // 统一来源校验 + type 合法性（阶段3 · 契约化，替代裸 event.source 比较）
    const expectedSource = this._host || (typeof window !== 'undefined' && window.parent) || null;
    const data = (window.AppProtocol
      ? window.AppProtocol.parseAppMessage(event, expectedSource)
      : (event.source === expectedSource ? event.data : null));
    if (!data) return;

    // 调色联动开关更新
    if (data.type === 'theme:syncPaletteEnabled' && data.payload) {
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
      pending.resolve(data.payload !== undefined ? data.payload : null);
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
    return this._send('storage:readDay', { dateKey: date });
  }

  async getAllDays() {
    await this.ensureReady();
    return this._send('storage:listDays', {});
  }

  /** 获取所有日期 key（降序，最新在前）— 轻量，只返回 key 列表 */
  async getDayKeys() {
    await this.ensureReady();
    return this._send('storage:getDayKeys', {});
  }

  /**
   * 分页加载日期数据
   * @param {number} page - 页码（从 0 开始）
   * @param {number} pageSize - 每页数量，默认 30
   * @returns {Promise<{ days: Object, keys: string[], total: number, page: number, pageSize: number, hasMore: boolean }>}
   */
  async getDaysPaginated(page = 0, pageSize = 30) {
    await this.ensureReady();
    return this._send('storage:getDaysPaginated', { page, pageSize });
  }

  async putDay(dayData) {
    await this.ensureReady();
    return this._send('storage:writeDay', {
      dateKey: dayData.date,
      data: dayData,
    });
  }

  async deleteDay(date) {
    await this.ensureReady();
    return this._send('storage:deleteDay', { dateKey: date });
  }

  async getSetting(key) {
    await this.ensureReady();
    return this._send('storage:getSetting', { key });
  }

  async getTypewriterNotes() {
    await this.ensureReady();
    return this._send('storage:getTypewriterNotes', {});
  }

  async putTypewriterNotes(notes) {
    await this.ensureReady();
    return this._send('storage:putTypewriterNotes', { notes });
  }

  // ---- 画中卷·写作档（多组卡片：每组独立文件 + 轻量索引）----
  // 索引极小，走 settings；每组卡片走独立文件，避免多组 + 无上限时撑大 settings.json。
  async getTypewriterWritingIndex() {
    await this.ensureReady();
    return this._send('storage:getTypewriterWritingIndex', {});
  }

  async putTypewriterWritingIndex(idx) {
    await this.ensureReady();
    return this._send('storage:putTypewriterWritingIndex', { idx });
  }

  async getTypewriterWritingDoc(id) {
    await this.ensureReady();
    return this._send('storage:getTypewriterWritingDoc', { id });
  }

  async putTypewriterWritingDoc(id, doc) {
    await this.ensureReady();
    return this._send('storage:putTypewriterWritingDoc', { id, doc });
  }

  async deleteTypewriterWritingDoc(id) {
    await this.ensureReady();
    try {
      return await this._send('storage:deleteTypewriterWritingDoc', { id });
    } catch (e) {
      console.warn('[Bridge] deleteTypewriterWritingDoc 不可用:', e && e.message);
    }
  }
  // 思维子弹组文档：与写作档同构，每组独立文件（typewriter-mindmap/<id>.json），不进 settings.json
  async getTypewriterMindmapDoc(id) {
    await this.ensureReady();
    return this._send('storage:getTypewriterMindmapDoc', { id });
  }
  async putTypewriterMindmapDoc(id, doc) {
    await this.ensureReady();
    return this._send('storage:putTypewriterMindmapDoc', { id, doc });
  }
  async deleteTypewriterMindmapDoc(id) {
    await this.ensureReady();
    try {
      return await this._send('storage:deleteTypewriterMindmapDoc', { id });
    } catch (e) {
      console.warn('[Bridge] deleteTypewriterMindmapDoc 不可用:', e && e.message);
    }
  }
  async getTypewriterNotesDoc(id) {
    await this.ensureReady();
    return this._send('storage:getTypewriterNotesDoc', { id });
  }
  async putTypewriterNotesDoc(id, doc) {
    await this.ensureReady();
    return this._send('storage:putTypewriterNotesDoc', { id, doc });
  }
  async deleteTypewriterNotesDoc(id) {
    await this.ensureReady();
    try {
      return await this._send('storage:deleteTypewriterNotesDoc', { id });
    } catch (e) {
      console.warn('[Bridge] deleteTypewriterNotesDoc 不可用:', e && e.message);
    }
  }

  async putSetting(key, value) {
    await this.ensureReady();
    return this._send('storage:putSetting', { key, value });
  }

  async getAllSettings() {
    await this.ensureReady();
    return this._send('storage:getAllSettings', {});
  }

  async getGoals() {
    await this.ensureReady();
    return this._send('storage:getGoals', {});
  }

  async putGoals(goals) {
    await this.ensureReady();
    return this._send('storage:putGoals', { goals });
  }

  async putGoal(goal) {
    await this.ensureReady();
    this._goalWriteChain = this._goalWriteChain.then(async () => {
      const goals = (await this.getGoals()) || [];
      const index = goals.findIndex(g => g.id === goal.id);
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
      const goals = (await this.getGoals()) || [];
      const filtered = goals.filter(g => g.id !== goalId);
      return this.putGoals(filtered);
    });
    return this._goalWriteChain;
  }

  async getPurchaseHistory() {
    await this.ensureReady();
    return this._send('storage:getPurchaseHistory', {});
  }

  async putPurchaseHistory(data) {
    await this.ensureReady();
    return this._send('storage:putPurchaseHistory', { data });
  }

  async getIncomeHistory() {
    await this.ensureReady();
    return this._send('storage:getIncomeHistory', {});
  }

  async putIncomeHistory(data) {
    await this.ensureReady();
    return this._send('storage:putIncomeHistory', { data });
  }

  async exportAllData() {
    await this.ensureReady();
    return this._send('storage:exportAll', {});
  }

  async importData(data, options = {}) {
    await this.ensureReady();
    return this._send('storage:importAll', { data, options });
  }

  /** 激活码校验：转发给宿主（宿主持密钥，用 Web Crypto 异步校验并写盘） */
  async activateLicense(code) {
    await this.ensureReady();
    return this._send('app:activateLicense', { code });
  }

  /** 备份码导出：转发给宿主（仅已激活设备可导出，返回 BRIBACK- 前缀的封装串） */
  async exportBackup() {
    await this.ensureReady();
    return this._send('app:exportBackup', {});
  }

  /** 备份码导入：转发给宿主（解包备份码后走标准激活流程，换设备/换仓库用） */
  async importBackup(backup) {
    await this.ensureReady();
    return this._send('app:importBackup', { backup });
  }

  /** 请求宿主把当前视图移动到主工作区（侧边栏 → 中央）；携带当前布局模式供宿主恢复 */
  async moveToCenter(mode) {
    await this.ensureReady();
    return this._send('app:moveToCenter', { mode });
  }

  /** 请求宿主把当前视图移回右侧栏（恢复纵向时；宿主仅当视图由系统从侧栏移来才执行） */
  async moveToSidebar() {
    await this.ensureReady();
    return this._send('app:moveToSidebar', {});
  }

  /** 请求宿主折叠 Obsidian 右侧栏（进入横向/看板多列模式时腾出横向宽度）
   *  @returns {Promise<{ok:boolean, wasCollapsed:boolean}>} wasCollapsed=折叠前是否已折叠
   *           （webapp 据此判断恢复纵向时是否需对称展开，避免动用户原有状态） */
  async collapseRightSidebar() {
    await this.ensureReady();
    return this._send('app:collapseRightSidebar', {});
  }

  /** 请求宿主展开 Obsidian 右侧栏（恢复纵向时对称还原） */
  async expandRightSidebar() {
    await this.ensureReady();
    return this._send('app:expandRightSidebar', {});
  }

  async clearAll() {
    await this.ensureReady();
    return this._send('storage:clearAll', {});
  }

  // ---- 板块配置持久化 ----

  getSectionConfig() {
    return this.sectionConfig;
  }

  async saveSectionConfig(config) {
    this.sectionConfig = config;
    try {
      return await this._send('app:saveSectionConfig', config);
    } catch (e) {
      // 桥接不可用时回退到 localStorage
      if (typeof localStorage !== 'undefined') {
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
      return await this._send('app:saveCustomNoises', noises);
    } catch (e) {
      // 桥接不可用时回退到 localStorage
      if (typeof localStorage !== 'undefined') {
        StorageAdapter.set(StorageKeys.WHITENOISE_CUSTOM, JSON.stringify(noises));
      }
    }
  }

  // ---- 自定义目标模板持久化（vault templates/*.md；桥接不可用时回退 localStorage）----

  _loadLocalTemplates() {
    try {
      const raw = StorageAdapter.get(StorageKeys.CUSTOM_TEMPLATES);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  async getCustomTemplates() {
    try {
      return await this._send('storage:getCustomTemplates', {});
    } catch (e) {
      return null; // 桥接不可用时由调用方回退 localStorage
    }
  }

  async saveCustomTemplate(template) {
    try {
      return await this._send('storage:putCustomTemplate', { template });
    } catch (e) {
      if (typeof localStorage !== 'undefined') {
        const list = this._loadLocalTemplates();
        const idx = list.findIndex(t => t.id === template.id);
        if (idx >= 0) list[idx] = template;
        else list.push(template);
        StorageAdapter.set(StorageKeys.CUSTOM_TEMPLATES, JSON.stringify(list));
      }
    }
  }

  async deleteCustomTemplate(id) {
    try {
      return await this._send('storage:deleteCustomTemplate', { id });
    } catch (e) {
      if (typeof localStorage !== 'undefined') {
        const list = this._loadLocalTemplates().filter(t => t.id !== id);
        StorageAdapter.set(StorageKeys.CUSTOM_TEMPLATES, JSON.stringify(list));
      }
    }
  }

  /**
   * 健康分权威快照（单一数据源）。
   * 插件用 getStrategyOverview() 即时重算并返回 { health, goals, results }，
   * webapp 的「综合健康分」环与「健康分详情」弹窗统一消费这份数据，
   * 不再自行用前端引擎计算，从而与竹杖芒鞋 100% 一致。
   * 失败（非 Obsidian 环境 / 通道异常）返回 null，由调用方降级到本地计算。
   */
  async getHealthOverview() {
    await this.ensureReady();
    try {
      return await this._send('app:getHealthOverview', {});
    } catch (e) {
      console.warn('[Bridge] app:getHealthOverview 不可用，降级为本地计算:', e && e.message);
      return null;
    }
  }

  /** 当前修行境界（竹杖芒鞋侧栏常驻展示，单一数据源来自插件） */
  async getCultivationRealm() {
    await this.ensureReady();
    try {
      return await this._send('app:getCultivationRealm', {});
    } catch (e) {
      console.warn('[Bridge] app:getCultivationRealm 不可用，降级为 null:', e && e.message);
      return null;
    }
  }

  /** 当前竹币余额（竹杖芒鞋侧栏常驻展示，单一数据源来自插件） */
  async getBambooCoinBalance() {
    await this.ensureReady();
    try {
      return await this._send('app:getBambooCoinBalance', {});
    } catch (e) {
      console.warn('[Bridge] app:getBambooCoinBalance 不可用，降级为 0:', e && e.message);
      return 0;
    }
  }

  /** 当前可用竹币余额（与 webapp 商店界面对齐，单一数据源来自插件） */
  async getBambooCoinAvailableBalance() {
    await this.ensureReady();
    try {
      return await this._send('app:getBambooCoinAvailableBalance', {});
    } catch (e) {
      console.warn('[Bridge] app:getBambooCoinAvailableBalance 不可用，降级为 0:', e && e.message);
      return 0;
    }
  }

  // ---- 读取 Obsidian Vault 内的文件 ----

  async getFile(filename) {
    const name = (filename || '').trim();
    if (!name) return '';
    await this.ensureReady();
    try {
      const content = await this._send('file:get', { filename: name });
      return (typeof content === 'string') ? content : '';
    } catch (e) {
      console.warn('[Bridge] getFile(' + name + ') failed:', e.message);
      return '';
    }
  }

  /** 写文本到 Vault（落库）：经宿主 file:write 写入，作用域限制在画中卷目录内。
   *  @returns {Promise<{ok:boolean}|null>} 成功返回宿主响应；桥不可用/超时返回 null（由调用方兜底）。 */
  async writeFile(path, content) {
    const p = (path || '').trim();
    if (!p) return null;
    await this.ensureReady();
    try {
      return await this._send('file:write', { path: p, content: typeof content === 'string' ? content : '' });
    } catch (e) {
      console.warn('[Bridge] writeFile 不可用:', e && e.message);
      return null;
    }
  }

  /** 思维子弹导出：写 Markdown 到 Vault 任意相对路径（宿主 app:exportMindmap，不受画中卷限制）。
   *  @returns {Promise<{ok:boolean,path?:string}|null>} 桥不可用/超时返回 null（调用方兜底下载）。 */
  async exportMindmap(path, content) {
    const p = (path || '').trim();
    if (!p) return null;
    await this.ensureReady();
    try {
      return await this._send('app:exportMindmap', { path: p, content: typeof content === 'string' ? content : '' });
    } catch (e) {
      console.warn('[Bridge] exportMindmap 不可用:', e && e.message);
      return null;
    }
  }

  /** 画中卷·打字机「一键全屏」：折叠/恢复 Obsidian 左右侧栏（宿主记录进入前状态，退出按原状恢复）。
   *  @returns {Promise<boolean>} 切换后是否处于全屏态 */
  async toggleZen() {
    await this.ensureReady();
    try {
      const res = await this._send('app:toggleZen', {});
      return !!(res && res.zen);
    } catch (e) {
      console.warn('[Bridge] toggleZen 不可用:', e && e.message);
      return false;
    }
  }

  /** 请求宿主打开「画中卷」独立中央视图（不影响日报视图） */
  async openScrollView(feature) {
    await this.ensureReady();
    try {
      return await this._send('app:openScroll', { feature: feature || null });
    } catch (e) {
      console.warn('[Bridge] app:openScroll 不可用:', e && e.message);
    }
  }

  /** 请求宿主把「画中卷」以左侧边栏形态打开（百宝箱首个功能默认入口） */
  async openScrollLeftSidebar(feature) {
    await this.ensureReady();
    try {
      return await this._send('app:openScrollLeftSidebar', { feature: feature || null });
    } catch (e) {
      console.warn('[Bridge] app:openScrollLeftSidebar 不可用:', e && e.message);
    }
  }

  /** 主动请求宿主当前明暗主题（画中卷加载后自行拉取，确保跟随亮暗） */
  async requestTheme() {
    await this.ensureReady();
    try {
      return await this._send('app:getTheme', {});
    } catch (e) {
      console.warn('[Bridge] app:getTheme 不可用:', e && e.message);
    }
  }

  /** 切换 Obsidian 明暗主题（画中卷打字机机身开关）。isDark 为期望明暗值。
   *  @returns {Promise<{ok:boolean,isDark?:boolean}|null>} 桥不可用/超时返回 null，由调用方兜底。 */
  async toggleObsidianTheme(isDark) {
    try {
      await this.ensureReady();
      return await this._send('app:toggleObsidianTheme', { isDark: !!isDark });
    } catch (e) {
      console.warn('[Bridge] app:toggleObsidianTheme 不可用:', e && e.message);
      return null;
    }
  }

  /** 在 Obsidian 原生打开指定 vault 文件 */
  async openFile(path) {
    await this.ensureReady();
    try {
      return await this._send('app:openFile', { path });
    } catch (e) {
      console.warn('[Bridge] app:openFile 不可用:', e && e.message);
    }
  }

  getCurrentAdapterType() {
    return 'bridge';
  }

  /** 登记插件推送的自定义主题清单（仅名字 + meta，不含代码）；代码按需经 theme:load 取回。
   *  activeTheme 为「当前已激活外部主题」的代码（随 app:ready 同步下发），用于视图重建后
   *  立即注册，避免 init 异步懒加载因 iframe 绑定/路由竞态失败而掉回默认竹林。 */
  _handleCustomThemes(themes, activeTheme = null) {
    if (!themes || themes.length === 0) return;
    if (typeof ThemeEffects === 'undefined') return;

    for (const t of themes) {
      try {
        window.ThemeEffects.registerExternalManifest(t.name, t.meta || {});
      } catch (e) {
        console.warn(`[Bridge] 自定义主题清单 "${t.name}" 登记失败:`, e.message);
      }
    }

    // 立即注册当前激活的外部主题（若有）：清单 + 代码随握手同步到达，init 跑前即已就绪，
    // 彻底规避重建视图后异步 theme:load 竞态。其余主题仍走按需懒加载。
    if (activeTheme && activeTheme.name && typeof activeTheme.code === 'string') {
      try {
        if (!window.ThemeEffects.themes[activeTheme.name]) {
          window.ThemeEffects.registerExternal(activeTheme.name, activeTheme.code);
        }
      } catch (e) {
        console.warn(`[Bridge] 激活主题 "${activeTheme.name}" 注册失败:`, e.message);
      }
    }
  }

  /** 按需向宿主请求某个外部主题的完整代码（懒加载：清单先行，点选/恢复时才取回） */
  async requestThemeCode(name) {
    await this.ensureReady();
    try {
      const resp = await this._send('theme:load', { name });
      if (resp && resp.ok && typeof resp.code === 'string') return resp.code;
      return null;
    } catch (e) {
      console.warn('[Bridge] 主题代码加载失败:', name, e && e.message);
      return null;
    }
  }

  /** 主题市场：拉取清单（宿主侧 fetch 公开仓库的 manifest.json） */
  async fetchMarketManifest() {
    await this.ensureReady();
    try {
      const resp = await this._send('market:manifest', {});
      if (resp && resp.ok && resp.manifest) {
        const m = resp.manifest;
        // 宿主随清单带回「已安装版本表」（id → { version }），供面板比对出「可更新」
        m.installed = resp.installed || {};
        return m;
      }
      return null;
    } catch (e) {
      console.warn('[Bridge] 市场清单拉取失败:', e && e.message);
      return null;
    }
  }

  /** 主题市场：安装（宿主下载 .js 写入主题文件夹）；version 用于后续更新检测 */
  async installMarketTheme(id, url, version) {
    await this.ensureReady();
    try {
      const resp = await this._send('market:install', { id, url, version: version || '' });
      return !!(resp && resp.ok);
    } catch (e) {
      console.warn('[Bridge] 主题安装失败:', id, e && e.message);
      return false;
    }
  }

  /** 主题市场：卸载（宿主删除主题文件夹中的 .js） */
  async uninstallMarketTheme(id) {
    await this.ensureReady();
    try {
      const resp = await this._send('market:uninstall', { id });
      return !!(resp && resp.ok);
    } catch (e) {
      console.warn('[Bridge] 主题卸载失败:', id, e && e.message);
      return false;
    }
  }

  isFallbackMode() {
    return this.fallbackMode;
  }

  destroy() {
    window.removeEventListener('message', this._messageHandler);
    this._pendingRequests.clear();
  }
}

// ---- 主题消息监听 ----

window.addEventListener('message', (event) => {
  // 只接受来自父窗口的消息
  if (event.source !== window.parent) return;

  const data = event.data;
  if (!data) return;

  // 关闭主题联动 → 恢复用户手动调色、卡片底色与文字色
  if (data.type === 'theme:followDisabled') {
    if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._restoreUserHue) {
      window.DisplayManager._restoreUserHue();
    }
    if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._restoreUserBg) {
      window.DisplayManager._restoreUserBg();
    }
    if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._restoreUserText) {
      window.DisplayManager._restoreUserText();
    }
    return;
  }

  // 目标库变更 → 重读 goals.json 并局部刷新（不触发全局重绘）
  if (data.type === 'goals:changed') {
    if (typeof window.GoalService !== 'undefined' && window.GoalService.load) {
      window.GoalService.load();
    }
    return;
  }

  if (data.type !== 'theme:changed') return;

  // 同步 Obsidian 的明暗模式到 iframe 内部（仅在自动跟随开启时）
  if (data.payload && typeof data.payload.isDark === 'boolean') {
    if (typeof store !== 'undefined') {
      const state = store.getState ? store.getState() : store.state;
      const ui = state && state.ui;
      // autoSyncTheme === false 才视为「跟随关闭」。
      // 跟随开启时必须以 Obsidian 为准直接跟随——userThemeChosen 只在「跟随关闭、用户手动选过」
      // 时才有意义；开跟随时它若仍为真（例如用户曾手动切过明暗、开关却一直开着），
      // 会永久阻断 theme:changed，导致「跟随 Obsidian 主题配色」彻底失效。
      if (!(ui && ui.autoSyncTheme === false)) {
        store.setDarkMode(data.payload.isDark, true);
      }
    } else {
      // 极简环境（画中卷等未加载 store 的视图）：直接把 .dark 同步到 shadow host，
      // 使 :host(.dark) 主题变量与背景规则生效，从而跟随 Obsidian 亮暗模式。
      const host = document.getElementById('bamboo-shadow-host');
      if (host) host.classList.toggle('dark', data.payload.isDark);
      // 双保险：同步到文档根，避免任何 :root/.dark 规则遗漏
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.toggle('dark', data.payload.isDark);
      }
    }
  }

  // 意境/调色联动：主题推来色相与明度时，驱动插件整盘配色。
  // fromTheme=true → 不回写 Obsidian，杜绝 iframe→Obsidian→iframe 死循环。
  // 画中卷等无 DisplayManager 的精简 iframe：直接写变量并重算派生 RGB 通道，
  // 使寻呼机（使用 --*-rgb 静态通道）同时跟随色相与明度——此前画中卷的 -rgb 通道
  // 从未被重算，停在默认竹青绿；仅靠 --accent-hue 派生的背景/卡片会变、寻呼机不变。
  const tHue = data.payload && typeof data.payload.hue === 'number' ? data.payload.hue : null;
  const tLight = data.payload && typeof data.payload.lightnessOffset === 'number' ? data.payload.lightnessOffset : null;
  if (tHue !== null || tLight !== null) {
    if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._applyHue) {
      // 主视图：经 DisplayManager 应用，顺带刷新由色相派生的一组 RGB 变量与滑块 UI
      if (tHue !== null) window.DisplayManager._applyHue(tHue, true);
      if (tLight !== null) window.DisplayManager._applyLightness(tLight, true);
    } else if (typeof setGlobalCssVar === 'function') {
      if (tHue !== null) {
        setGlobalCssVar('--accent-hue', String(tHue));
        _pagerHue = tHue;
      }
      if (tLight !== null) {
        setGlobalCssVar('--accent-lightness-offset', tLight + '%');
        _pagerLightness = tLight;
      }
      // 重算 20 个 -rgb 通道（直接传入明度偏移数值，避免 getComputedStyle 读取代理对象抛错），
      // 让寻呼机跟随主题色相与明度
      if (_pagerHue !== null) applyDerivedRgb(_pagerHue, _pagerLightness);
    }
  }

  // 侧边栏色温联动：主题推来背景 rgb 时，驱动插件卡片底色贴近 Obsidian
  // fromTheme=true → 不回写 Obsidian，避免循环
  if (data.payload && typeof data.payload.bg === 'string') {
    if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._applyObsidianBg) {
      window.DisplayManager._applyObsidianBg(data.payload.bg, true);
    }
  }

  // 文字色温联动：主题推来 --text-normal / --text-muted 时，驱动插件文字贴近 Obsidian
  // fromTheme=true → 不回写 Obsidian，避免循环
  if (data.payload && (typeof data.payload.textNormal === 'string' || typeof data.payload.textMuted === 'string')) {
    if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._applyObsidianText) {
      window.DisplayManager._applyObsidianText(data.payload.textNormal, data.payload.textMuted, true);
    }
  }
});

// ---- 导航消息监听 ----

window.addEventListener('message', (event) => {
  // 只接受来自父窗口的消息
  if (event.source !== window.parent) return;

  const data = event.data;

  if (typeof store === 'undefined' || typeof Handlers === 'undefined') return;

  switch (data.type) {
    case 'nav:prevDay':
      store.navigateDate(-1);
      break;
    case 'nav:nextDay':
      store.navigateDate(1);
      break;
    case 'nav:today':
      store.goToDate(new Date());
      break;
    case 'action:openStats':
      if (typeof StatsModal !== 'undefined') StatsModal.open();
      break;
    case 'action:openSettings':
      if (typeof SettingsModal !== 'undefined') Handlers.openSettingsModal();
      break;
  }
});

// ---- 初始化 ----

export const storageManager = new BridgeStorage();
window.storageManager = storageManager;

