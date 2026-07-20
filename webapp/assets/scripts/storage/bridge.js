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
    try {
      const readyResp = await this._send('app:ready', {
        protocolVersion: window.AppProtocol ? window.AppProtocol.PROTOCOL_VERSION : 1,
      });
      if (readyResp && readyResp.sectionConfig) {
        this.sectionConfig = readyResp.sectionConfig;
      }
      // 处理插件推送的自定义主题
      if (readyResp && readyResp.customThemes && Array.isArray(readyResp.customThemes)) {
        this._handleCustomThemes(readyResp.customThemes);
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
    } catch (e) {
      console.warn('[Bridge] Failed to get sectionConfig from plugin:', e.message);
    }

    // 桥接就绪后，二次应用板块配置
    if (typeof SectionRegistry !== 'undefined' && SectionRegistry.applyBridgeConfig) {
      SectionRegistry.applyBridgeConfig();
    }

    // 首屏补发调色同步：DisplayManager.init 与 bridge 就绪是两条异步链路，
    // 若 DisplayManager 早于本 readyResp 完成加载，其 _maybeSyncPalette 会因
    // storageManager.syncPaletteToObsidian 尚未赋值而提前 return，导致首屏漏同步。
    // 开关开启时，延迟一拍（等 DisplayManager._loadAndApply 应用完色相/明度）主动补发。
    if (this.syncPaletteToObsidian) {
      setTimeout(() => {
        if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._maybeSyncPalette) {
          window.DisplayManager._maybeSyncPalette();
        }
      }, 60);
    }

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

  /** 发送请求到父窗口并等待响应 */
  _send(type, payload) {
    return new Promise((resolve, reject) => {
      const id = 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

      const timeout = setTimeout(() => {
        this._pendingRequests.delete(id);
        reject(new Error(`Bridge request timeout: ${type}`));
      }, 10000);

      this._pendingRequests.set(id, { resolve, reject, timeout });

      // postMessage 使用 window.parent.origin 避免通配符
      try {
        window.parent.postMessage({ type, id, payload }, window.parent.origin || '*');
      } catch {
        window.parent.postMessage({ type, id, payload }, '*');
      }
    });
  }

  /** 接收父窗口的响应 */
  _onMessage(event) {
    // 统一来源校验 + type 合法性（阶段3 · 契约化，替代裸 event.source 比较）
    const data = (window.AppProtocol
      ? window.AppProtocol.parseAppMessage(event, window.parent)
      : (event.source === window.parent ? event.data : null));
    if (!data) return;

    // 处理来自父窗口的同步消息（非请求响应）
    if (data.type === 'app:theme') {
      if (typeof store !== 'undefined' && data.payload) {
        const state = store.getState ? store.getState() : store.state;
        if (state && state.ui && state.ui.autoSyncTheme === false) return;
        const isDark = data.payload.isDark;
        store.setDarkMode(isDark);
      }
      return;
    }

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

  getCurrentAdapterType() {
    return 'bridge';
  }

  /** 注册插件推送的自定义主题 */
  _handleCustomThemes(themes) {
    if (!themes || themes.length === 0) return;
    if (typeof ThemeEffects === 'undefined') return;

    for (const t of themes) {
      try {
        window.ThemeEffects.registerExternal(t.name, t.code);
      } catch (e) {
        console.warn(`[Bridge] 自定义主题 "${t.name}" 注册失败:`, e.message);
      }
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
      if (!(state && state.ui && state.ui.autoSyncTheme === false)) {
        store.setDarkMode(data.payload.isDark);
      }
    }
  }

  // 意境配色联动：主题推来色相时，驱动插件整盘配色
  // fromTheme=true → 不回写 Obsidian，杜绝 iframe→Obsidian→iframe 死循环
  if (data.payload && typeof data.payload.hue === 'number') {
    if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager._applyHue) {
      window.DisplayManager._applyHue(data.payload.hue, true);
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

