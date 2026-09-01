/**
 * scrollManager.js — 画中卷容器（百宝箱）
 *
 * 画中卷定位为「百宝箱」容器，承载多个独立功能（如香道、未来的茶道/花道…）。
 * 功能选择发生在悬浮菜单（FAB 的「画中卷」项点击后弹出的选择浮层，见 scrollFeaturePicker.js），
 * 选定后才打开本视图；本模块只负责：外壳舞台、功能注册/激活、主题跟随与生命周期转发。
 * 各功能的具体 DOM 与交互由对应 feature 模块实现（见 ./features/）。
 *
 * 香道是注册的第一个功能（./features/incenseFeature.js）。
 *
 * 隐私兼容：工作台根 class 为 .scroll-workbench（非 .modal-panel），故 PrivacyMode.markText
 * 会照常给文字补打 data-private-text，进而被 base.css 的隐私模糊规则命中（纳入模糊）。
 */

import { getDomRoot } from '../utils/domRef.js';
import { IncenseFeature } from './features/incenseFeature.js';

const ScrollManager = {
  _el: null,            // 外壳（.scroll-workbench）
  _stageEl: null,       // 功能舞台（.scroll-feature-stage）
  _features: null,      // Map<key, def>
  _activeKey: null,     // 当前激活功能 key
  _featureInst: null,   // 当前功能实例
  _hostEl: null,        // shadow host（用于加 scroll-workbench-host 类）
  _onThemeMessage: null,  // 宿主主题广播监听
  _onFeatureMessage: null, // 宿主发来的「打开指定功能」指令

  /**
   * 入口：画中卷以独立视图形态呈现（由宿主 openScroll 打开的独立中央页签）。
   * 视图加载完成后构建外壳、注册功能，并默认激活香道（功能选择已在悬浮菜单侧完成）。
   */
  async mountView() {
    this._ensureShell();
    this._registerFeatures();
    // 监听宿主主题广播（theme:changed），直接应用明暗到画中卷 DOM，
    // 绕开 store（画中卷未加载 store 且不依赖 userThemeChosen 抑制）。
    this._onThemeMessage = (e) => {
      if (!e.data) return;
      if (e.data.type === 'theme:changed' && e.data.payload && typeof e.data.payload.isDark === 'boolean') {
        this._applyDark(e.data.payload.isDark);
      }
    };
    window.addEventListener('message', this._onThemeMessage);
    // 监听悬浮菜单发来的「打开指定功能」指令（扩展点：未来新增功能可由 FAB 选择浮层指定）
    this._onFeatureMessage = (e) => {
      if (e.data && e.data.type === 'scroll:open-feature' && e.data.payload && e.data.payload.key) {
        this._activateFeature(e.data.payload.key);
      }
    };
    window.addEventListener('message', this._onFeatureMessage);
    // 主动向宿主请求当前明暗主题（宿主回 theme:changed），确保画中卷跟随当前亮暗
    if (typeof storageManager !== 'undefined' && storageManager.requestTheme) {
      storageManager.requestTheme();
    }
    // 默认激活香道（功能选择已在悬浮菜单的 FAB 侧完成）
    await this._activateFeature('incense');
  },

  /** 构建外壳：给 shadow host 挂 flex 类，并创建功能舞台 */
  _ensureShell() {
    if (this._el) return;
    // 必须挂进 shadow root 内部（与其他视图一致）：getDomRoot() 在 shadow 模式返回
    // shadowRoot，无 shadow 时回退 document。挂错位置（如 light DOM body）会因 shadow
    // 样式隔离导致工作台完全无样式、视觉上「点了没反应」。
    const mount = getDomRoot();
    // 给 shadow host 加标记类，CSS 中用它把 :host 拉成 flex 容器，
    // 这样 .scroll-workbench 才能用 flex:1 精确填满 Obsidian 侧边栏/面板。
    if (mount && mount.host) {
      mount.host.classList.add('scroll-workbench-host');
      this._hostEl = mount.host;
    }

    const wrap = document.createElement('div');
    wrap.className = 'scroll-workbench scroll-workbench--view';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', '画中卷');
    wrap.innerHTML = `
      <div class="scroll-feature-stage"></div>
    `;
    mount.appendChild(wrap);
    this._el = wrap;
    this._stageEl = wrap.querySelector('.scroll-feature-stage');
  },

  /** 注册画中卷内的功能。香道为首个可用功能；未来功能在此追加即可。 */
  _registerFeatures() {
    this._features = new Map();
    this._features.set('incense', {
      key: 'incense',
      placeholder: false,
      factory: () => IncenseFeature,
    });
  },

  /**
   * 进入功能：挂载功能到舞台。占位功能不进入。已激活功能不重复挂载。
   */
  async _activateFeature(key) {
    const def = this._features && this._features.get(key);
    if (!def || def.placeholder) return;
    if (this._activeKey === key && this._featureInst) return;
    // 卸载当前功能（先摘 DOM，避免与新风功能叠加）
    if (this._featureInst) {
      try { this._featureInst.unmount(); } catch (e) { console.warn('[Scroll] feature unmount failed:', e && e.message); }
      this._featureInst = null;
    }
    this._activeKey = key;
    if (this._stageEl) this._stageEl.innerHTML = '';
    const inst = def.factory();
    this._featureInst = inst;
    await inst.mount(this._stageEl);
  },

  /** 应用明暗：dark 类需同时存在于 shadow host / html / body，暗色规则才完整命中 */
  _applyDark(isDark) {
    const host = document.getElementById('bamboo-shadow-host');
    const els = [document.documentElement, document.body, host].filter(Boolean);
    els.forEach((el) => el.classList.toggle('dark', !!isDark));
  },

  /**
   * 关闭视图：卸载当前功能并解绑全部外部监听。
   * 火折子等 document 级监听由 feature.unmount() 负责清理。
   */
  close() {
    // 卸载当前功能（停表、解绑 document 级监听、释放 DOM 引用）
    if (this._featureInst) {
      try { this._featureInst.unmount(); } catch (e) { console.warn('[Scroll] feature unmount failed:', e && e.message); }
      this._featureInst = null;
    }
    if (this._onThemeMessage) {
      window.removeEventListener('message', this._onThemeMessage);
      this._onThemeMessage = null;
    }
    if (this._onFeatureMessage) {
      window.removeEventListener('message', this._onFeatureMessage);
      this._onFeatureMessage = null;
    }
    // 移除给 shadow host 加的标记类，避免影响下一个挂到同 host 的视图
    if (this._hostEl) {
      this._hostEl.classList.remove('scroll-workbench-host');
      this._hostEl = null;
    }
    // 释放缓存的容器 DOM 引用
    this._el = null;
    this._stageEl = null;
    this._features = null;
    this._activeKey = null;
  },
};

window.ScrollManager = ScrollManager;

// 画中卷以「独立视图」形态运行（scroll.html）：bridge 就绪后自动挂载全屏内容。
// 仅当文档中存在独立视图容器 #scroll-view-root（scroll.html 特有）时才挂载，
// 避免被首页/主视图（app.html）误加载后渲染到不该出现的位置。
function _shouldMountScroll() {
  if (typeof document === 'undefined') return false;
  // shadow 模式下 #scroll-view-root 已被 shadowBootstrap 搬入 shadow root，
  // document.getElementById 不会穿透 shadow boundary 查找，故必须在 getDomRoot()（shadow root）内查。
  try {
    return !!(getDomRoot().getElementById && getDomRoot().getElementById('scroll-view-root')) ||
           !!document.getElementById('scroll-view-root');
  } catch (e) {
    return !!document.getElementById('scroll-view-root');
  }
}

if (_shouldMountScroll()) {
  // mountView 防重入：事件触发与兜底定时器只会真正挂载一次
  let _scrollMounted = false;
  const _doMountScroll = () => {
    if (_scrollMounted) return;
    _scrollMounted = true;
    try { ScrollManager.mountView(); } catch (e) { console.warn('[Scroll] mountView failed:', e && e.message); }
  };

  if (typeof EventBus !== 'undefined' && typeof EventBus.on === 'function') {
    EventBus.on('storage:initialized', _doMountScroll);
  }

  // 兜底挂载：storage:initialized 由 bridge.initialize 在 await app:ready（等待宿主响应）
  // 之后才 emit；若宿主在独立视图页签未响应（如 openScroll 打开的中央页签通信未就绪），
  // 事件可能永不触发，导致画中卷白板。此处超时主动渲染 UI（StorageAdapter 缺失时回退默认）。
  setTimeout(_doMountScroll, 1500);
}
