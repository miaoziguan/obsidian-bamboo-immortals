/**
 * scrollManager.js — 画中卷（百宝箱首个独立功能：香道番茄钟）
 *
 * 单栏布局：香道番茄钟（纯前端计时 + 线香燃烧/青烟视觉，暂不联动竹币）。
 * 画中卷定位为「百宝箱」容器，本模块实现其中第一个独立功能——香道番茄钟。
 *
 * 隐私兼容：工作台根 class 为 .scroll-workbench（非 .modal-panel），故 PrivacyMode.markText
 * 会照常给文字补打 data-private-text，进而被 base.css 的隐私模糊规则命中（纳入模糊）。
 */

import { StorageKeys } from '../utils/storageAdapter.js';
import { getDomRoot } from '../utils/domRef.js';
import { CENSER_STYLES, DEFAULT_CENSER, censerSvg } from './censerStyles.js';

const POMODORO_MS = 60 * 60 * 1000; // 一炷香默认燃烧 1 小时
const SEG_MS = 10 * 60 * 1000;       // 每燃烧 10 分钟，一段香灰随风化雁
const STICK_TOP = 30;                // 香身顶距 incense 顶（px）
const STICK_H = 560;                 // 香身全长（px，对应 60 分钟）
const DUR_KEY = 'incenseDuration';    // 设置项：香总时长（分钟）
const GOOSE_KEY = 'incenseGooseInterval'; // 设置项：化雁间隔（分钟）
const CENSER_KEY = 'incenseCenserStyle';  // 设置项：香插样式（画中卷内切换，存 localStorage）
const DUR_MIN = 1, DUR_MAX = 240;    // 总时长允许范围（分钟）
const GOOSE_MIN = 1, GOOSE_MAX = 120;// 化雁间隔允许范围（分钟）

const ScrollManager = {
  _timer: null,          // 番茄钟 interval
  _remaining: POMODORO_MS,
  _running: false,
  _el: null,
  _onThemeMessage: null,  // 宿主主题广播监听
  _ashDroppedSegs: 0,     // 已化雁的香灰段数（每 _gooseMs +1）
  _durationMs: POMODORO_MS, // 香总燃烧时长（可设置）
  _gooseMs: SEG_MS,          // 化雁间隔（可设置）

  /**
   * 入口：画中卷以独立视图形态呈现（由宿主 openScroll 打开的独立中央页签）。
   * 视图加载完成后自动挂载画中卷内容（香道番茄钟），无需用户再点弹窗。
   */
  async mountView() {
    // 画中卷运行在 Obsidian 的 iframe 中，应让背景跟随 Obsidian 侧边栏/页签本身，
    // 而不是沿用 webapp 默认的 bamboo 深绿背景（否则亮色 Obsidian 下仍会显暗）。
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    // 画中卷位置选择器（左壁/中堂/右壁三圆点）需在任何功能（香道或打字机）下都常驻，
    // 故在功能选型之前挂载——否则选中打字机时走 _mountPendingFeature 提前 return 会跳过它。
    this._mountLocationDots();
    // 画中卷多意境：功能选择器若选中「打字机」，则挂载打字机并跳过香道
    if (await this._mountPendingFeature()) return;
    // 画中卷主题交由 webapp 全局 store 管理：store.init 据 Vault 的 theme 设定明暗，
    // 宿主转发的 theme:changed 也会经 bridge 同步到 store。不再自行监听宿主 theme:changed
    // 广播——其 isDark 来自「Obsidian 外观主题」，会覆盖用户在 webapp 首页手动选择的明暗，
    // 导致首页切亮色后画中卷仍被宿主按 Obsidian 外观判为暗。
    // 先读取用户设置（香总时长 / 化雁间隔），再据以初始化计时
    await this._loadSettings();
    this._remaining = this._durationMs;
    this._ensureDom();
    this._renderTimer();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    // 注意：3-dot 已在上方功能选型前挂载，此处不再调用
  },

  /**
   * 画中卷多意境功能：决定挂载哪个功能（同步、非阻塞，避免画中卷白屏）。
   * 优先级：① localStorage 暂存（data: iframe 常无权限，仅作兜底）
   *         ② 宿主注入（iframe load 后 postMessage；通常 <1.5s 已到达，同步读取 _hfResolved）
   * 选中「打字机」则挂载打字机并返回 true（调用方跳过香道），否则返回 false（走香道）。
   */
  async _mountPendingFeature() {
    // ① localStorage 暂存（data: iframe 通常无 localStorage 权限，抛错即忽略）
    let pending = null;
    try {
      if (typeof StorageAdapter !== 'undefined' && typeof StorageAdapter.get === 'function') {
        pending = StorageAdapter.get('scrollFeaturePending');
      }
    } catch (_) { /* data: iframe 常无 localStorage 权限，忽略 */ }
    if (pending === 'typewriter') return await this._mountTypewriter();

    // ② 宿主注入：非阻塞，直接读取已到达的 feature；不 await，避免画中卷长时间白屏
    if (ScrollManager._hfResolved === 'typewriter') return await this._mountTypewriter();
    return false;
  },

  /** 挂载打字机功能（自包含，跟随宿主明暗主题） */
  async _mountTypewriter() {
    const Tw = typeof window !== 'undefined' ? window.TypewriterFeature : null;
    if (!Tw || typeof Tw.mount !== 'function') {
      console.warn('[Scroll] 打字机模块未就绪，回退香道');
      return false;
    }
    try {
      // 画中卷主题交由 webapp 全局 store 管理，不自行请求宿主主题（其 isDark 来自 Obsidian 外观，
      // 会覆盖用户在首页手动选择的明暗），以免首页切亮色后画中卷仍被宿主判为暗。
      const mount = getDomRoot();
      const stage = document.createElement('div');
      stage.className = 'scroll-feature-stage';
      stage.classList.add('is-typewriter'); // 纵向撑满，将寻呼机推到底部
      mount.appendChild(stage);
      await Tw.mount(stage);
      // 选型已生效，清除暂存，避免下次直接打开画中卷仍回落打字机
      try {
        if (typeof StorageAdapter !== 'undefined' && StorageAdapter.set) StorageAdapter.set('scrollFeaturePending', null);
      } catch (_) { /* 忽略清除失败 */ }
      return true;
    } catch (e) {
      console.warn('[Scroll] 打字机挂载失败，回退香道:', e && e.message);
      return false;
    }
  },

  /** 应用明暗：dark 类需同时存在于 shadow host / html / body，暗色规则才完整命中 */
  _applyDark(isDark) {
    const host = document.getElementById('bamboo-shadow-host');
    const els = [document.documentElement, document.body, host].filter(Boolean);
    els.forEach((el) => el.classList.toggle('dark', !!isDark));
  },

  /** 主动拉取宿主当前主题并应用（消费 requestTheme 返回值，弥补仅监听广播会漏掉「首帧 / 主题未变化」的窗口） */
  async _syncTheme() {
    if (typeof storageManager === 'undefined' || !storageManager.requestTheme) return;
    try {
      const res = await storageManager.requestTheme();
      if (!res) return;
      const isDark = (typeof res.isDark === 'boolean') ? res.isDark
                   : (res.payload && typeof res.payload.isDark === 'boolean') ? res.payload.isDark
                   : undefined;
      if (typeof isDark === 'boolean') this._applyDark(isDark);
    } catch (_) { /* 取不到就沿用当前主题 */ }
  },

  /**
   * 关闭视图：停表并解绑全部外部监听。
   * 之前只解绑了 message/resize，而火折子的 mousemove/touchmove/mouseup/touchend
   * 绑在 document 上——视图关闭后监听残留、闭包持续持有香插/火折子 DOM，
   * 既造成内存泄漏，又让后续每次全局 mousemove 都白白执行一次回调。
   */
  close() {
    this._stopTimer();
    if (this._onThemeMessage) {
      window.removeEventListener('message', this._onThemeMessage);
      this._onThemeMessage = null;
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    if (this._onVisibility) {
      document.removeEventListener('visibilitychange', this._onVisibility);
      this._onVisibility = null;
    }
    // 火折子拖拽监听（document 级）
    if (this._onFirebrandMove) {
      document.removeEventListener('mousemove', this._onFirebrandMove);
      document.removeEventListener('touchmove', this._onFirebrandMove);
      this._onFirebrandMove = null;
    }
    if (this._onFirebrandUp) {
      document.removeEventListener('mouseup', this._onFirebrandUp);
      document.removeEventListener('touchend', this._onFirebrandUp);
      this._onFirebrandUp = null;
    }
    if (this._moveRaf) { cancelAnimationFrame(this._moveRaf); this._moveRaf = 0; }
    if (this._narrowRO) { this._narrowRO.disconnect(); this._narrowRO = null; }
    // 释放缓存的 DOM 引用，避免闭包长期持有已卸载节点
    this._censerEl = null;
    this._svgBack = null;
    this._svgFront = null;
  },

  _ensureDom() {
    if (this._el) return;
    // 必须挂进 shadow root 内部（与其他视图一致）：getDomRoot() 在 shadow 模式返回
    // shadowRoot，无 shadow 时回退 document。挂错位置（如 light DOM body）会因 shadow
    // 样式隔离导致工作台完全无样式、视觉上「点了没反应」。
    // 画中卷以独立视图形态呈现（非弹窗）：根容器直接铺满视图，无 backdrop 遮罩。
    const mount = getDomRoot();

    const wrap = document.createElement('div');
    wrap.className = 'scroll-workbench scroll-workbench--view';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', '画中卷');
    wrap.innerHTML = `
      <div class="scroll-body">
        <!-- 香道番茄钟（精致版：青瓷竹节香插 + SVG 青烟 + 暗红余烬） -->
        <aside class="scroll-left">
          <div class="scroll-screen">
            <div class="scroll-screen-glass"></div>
            <div class="scroll-scanlines"></div>
            <div class="scroll-screen-inner">
              <!-- 主视觉：青瓷竹节香插 -->
              <div class="scroll-incense">
                <!-- SVG 青烟：单缕锚定香头，靠路径 d 持续扭动（原地翻卷流动）营造上飘错觉，连续描边非虚线 -->
                <div class="scroll-incense-smoke">
                  <svg viewBox="0 0 32 64" fill="none" preserveAspectRatio="none">
                    <path class="scroll-smoke-wisp w1" d="M16,14 Q22,-4 14,-22 Q8,-40 18,-60 Q22,-72 15,-90" stroke="url(#scrollSmokeGrad)" stroke-width="2.0" stroke-linecap="round"/>
                    <defs><linearGradient id="scrollSmokeGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="var(--smoke-a)"/><stop offset="60%" stop-color="var(--smoke-b)"/><stop offset="100%" stop-color="var(--smoke-c)"/></linearGradient></defs>
                  </svg>
                </div>
                <!-- 余烬 -->
                <div class="scroll-incense-ember">
                  <span class="ember-core"></span>
                </div>
                <!-- 点燃瞬间的火光层（大火光 → 微光，由 .lighting/.glowing 驱动） -->
                <div class="scroll-incense-flare"></div>
                <!-- 线香（已燃/未燃比例，由 --burn 驱动） -->
                <div class="scroll-incense-stick">
                  <div class="scroll-incense-ash"></div>
                  <div class="scroll-incense-transition"></div>
                  <div class="scroll-incense-unburnt"></div>
                  <div class="scroll-incense-texture"></div>
                </div>
                <!-- 香插：SVG 内容与配色由 _renderCenser() 按当前样式注入（见 censerStyles.js）。
                     现为可点击控件：单击切换款式、双击重置计时（role=button 提供键盘可达性）。 -->
                <div class="scroll-censer" role="button" tabindex="0" aria-label="更换香插：单击切换，双击重置计时" title="点击更换香插 · 双击重置计时">
                  <div class="scroll-censer-reflect"></div>
                  <div class="scroll-censer-shadow"></div>
                  <svg class="scroll-censer-svg scroll-censer-svg-back" viewBox="0 0 112 80" fill="none"></svg>
                  <svg class="scroll-censer-svg scroll-censer-svg-front" viewBox="0 0 112 80" fill="none"></svg>
                </div>
              </div>


              <!-- 火折子：竹制吹筒 + 可拔竹帽，拔帽方显火绒，拖到香头点燃 -->
              <div class="scroll-firebrand" data-action="scroll-firebrand" aria-label="火折子">
                <svg viewBox="0 0 48 96" fill="none">
                  <!-- 竹身（吹筒） -->
                  <rect x="14" y="34" width="20" height="56" rx="3" fill="url(#fbBamboo)" stroke="#5e8b78" stroke-width="1.2"/>
                  <rect x="16" y="36" width="5" height="52" rx="2" fill="#eef4f0" opacity="0.3"/>
                  <!-- 竹节横纹 -->
                  <path d="M14 52 Q24 49 34 52" stroke="#5e8b78" stroke-width="0.8" fill="none" opacity="0.6"/>
                  <path d="M14 70 Q24 67 34 70" stroke="#5e8b78" stroke-width="0.8" fill="none" opacity="0.6"/>
                  <path d="M14 86 Q24 84 34 86" stroke="#5e8b78" stroke-width="0.8" fill="none" opacity="0.6"/>
                  <ellipse cx="24" cy="34" rx="10" ry="3" fill="#7fa593"/>
                  <ellipse cx="24" cy="34" rx="10" ry="3" fill="url(#fbHi)"/>
                  <!-- 火绒（帽下，默认隐藏，拔帽方显）。
                       火苗跳动与火星上飘改用 CSS 动画并默认 paused：原 SMIL 常驻播放，
                       未拔帽（火绒不可见）时仍在持续消耗 CPU。见 base.css .flame-* 规则。 -->
                  <g class="flame">
                    <path class="flame-outer" d="M24 34 Q19 23 24 11 Q29 23 24 34" fill="#ff8c42" opacity="0.92"/>
                    <path class="flame-inner" d="M24 34 Q22 27 24 18 Q26 27 24 34" fill="#ffd166" opacity="0.85"/>
                    <circle class="flame-spark spark-a" cx="28" cy="22" r="1.2" fill="#ffcc80" opacity="0.8"/>
                    <circle class="flame-spark spark-b" cx="20" cy="24" r="0.8" fill="#ffcc80" opacity="0.7"/>
                  </g>
                  <!-- 可拔竹帽：圆润钟形竹笠 + 顶钮 + 微外扩帽檐 -->
                  <g class="scroll-firebrand-cap">
                    <path d="M11 30 Q11 19 24 17 Q37 19 37 30 Q31 33 24 33 Q17 33 11 30 Z" fill="url(#fbCap)" stroke="#5e8b78" stroke-width="1.2"/>
                    <path d="M11 29 Q24 26 37 29" stroke="#4a7263" stroke-width="0.8" fill="none" opacity="0.55"/>
                    <ellipse cx="24" cy="33" rx="13" ry="2.6" fill="#6f9384" opacity="0.55"/>
                    <path d="M24 17 Q21 11 24 8 Q27 11 24 17 Z" fill="#7fa593" stroke="#4a7263" stroke-width="0.9"/>
                    <ellipse cx="24" cy="8" rx="3" ry="1.6" fill="#90b3a3"/>
                  </g>
                  <defs>
                    <linearGradient id="fbBamboo" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8fb3a4"/><stop offset="45%" stop-color="#aac8ba"/><stop offset="100%" stop-color="#7da593"/></linearGradient>
                    <linearGradient id="fbCap" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#7fa593"/><stop offset="50%" stop-color="#9bbfae"/><stop offset="100%" stop-color="#6f9384"/></linearGradient>
                    <linearGradient id="fbHi" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
                  </defs>
                </svg>
                <span class="scroll-firebrand-hint"></span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;
    mount.appendChild(wrap);
    this._el = wrap;
    // 缓存高频访问的 DOM 引用，避免每帧/每次 mousemove 都 querySelector 遍历
    this._incenseEl = wrap.querySelector('.scroll-incense');
    this._timerEl = wrap.querySelector('#scrollTimer');
    this._firebrandEl = wrap.querySelector('.scroll-firebrand');

    // 窄栏紧凑：量得 .scroll-body 宽度 ≤340px 时加 .is-narrow（本环境不支持 @container，用 class 触发）
    const scrollBody = wrap.querySelector('.scroll-body');
    if (scrollBody) {
      const applyNarrow = () => {
        const w = scrollBody.getBoundingClientRect().width;
        scrollBody.classList.toggle('is-narrow', w <= 340);
      };
      applyNarrow();
      if (typeof ResizeObserver !== 'undefined') {
        this._narrowRO = new ResizeObserver(applyNarrow);
        this._narrowRO.observe(scrollBody);
      }
    }

    // 火折子拖拽点香
    this._bindFirebrand();
    // 香插样式：渲染当前款式
    this._renderCenser();
    // 香插本体：单击切换 / 双击重置；线香：单击掐灭暂停（再次单击续燃）
    this._bindCenserInteractions();
    this._bindIncensePinch();

    // 测量并缓存几何基准（供点燃判定做纯算术），仅在挂载与窗口尺寸变化时读取布局；
    // 拖拽过程中不再调用 getBoundingClientRect，避免强制同步布局。
    this._measureGeometry();
    if (!this._onResize) {
      this._onResize = () => this._measureGeometry();
      window.addEventListener('resize', this._onResize);
    }
  },

  /**
   * 测量并缓存香容器几何：中心线与顶边。点燃判定据此用算术推算余烬位置，
   * 免去每次 mousemove 读取布局。
   */
  _measureGeometry() {
    const incense = this._incenseEl;
    if (!incense) return;
    const r = incense.getBoundingClientRect();
    this._incenseGeo = { cx: r.left + r.width / 2, top: r.top };
  },

  // ---------------- 香道番茄钟 ----------------

  _renderTimer() {
    const t = this._timerEl;
    if (t) t.textContent = this._fmtClock(this._remaining);
    this._updateIncense(true);
  },

  /** 仅刷新时钟文字（rAF 中整秒变化时才调用，避免每帧 DOM 写入） */
  _renderClock() {
    const t = this._timerEl;
    if (t) t.textContent = this._fmtClock(this._remaining);
  },

  _startTimer() {
    if (this._running) return;
    this._running = true;
    // 以 performance.now 为基准精确推算剩余（不受 interval 抖动与后台节流影响）。
    // 驱动频率由 rAF(60fps) 降为 100ms 心跳：--burn 自身带 0.9s 线性过渡，10Hz 写入
    // 已足够平滑，却省掉每秒约 50 次无谓的 JS 唤醒与样式重算。
    this._startTs = performance.now();
    this._startRemaining = this._remaining;
    this._lastClockSec = null;
    this._tick();
    this._timer = setInterval(() => this._tick(), 100);
  },

  /** 计时心跳：按时间戳推算剩余 → 驱动燃烧进度，整秒变化才刷新时钟文字 */
  _tick() {
    if (!this._running) return;
    const elapsed = performance.now() - this._startTs;
    const rem = this._startRemaining - elapsed;
    if (rem <= 0) {
      this._remaining = 0;
      this._updateIncense(true);
      this._renderClock();
      this._stopTimer();
      if (typeof Toast !== 'undefined') Toast.showToast('一炷香尽，歇息片刻 🍃', 'success');
      return;
    }
    this._remaining = rem;
    this._updateIncense(false);
    const sec = Math.ceil(rem / 1000);
    if (sec !== this._lastClockSec) {
      this._lastClockSec = sec;
      this._renderClock();
    }
  },

  _stopTimer() {
    this._running = false;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },

  _resetTimer() {
    this._stopTimer();
    this._remaining = this._durationMs;
    this._litTriggered = false;
    this._litHoldActive = false;
    if (this._lightTimers) { this._lightTimers.forEach(clearTimeout); this._lightTimers = []; }
    // 清空化雁状态与视觉
    this._ashDroppedSegs = 0;
    this._lastBurnWrite = 0;
    const incense = this._incenseEl;
    if (incense) {
      incense.classList.remove('is-lit', 'lighting', 'glowing', 'kissing');
      incense.style.removeProperty('--ash-top');
      incense.querySelectorAll('.scroll-wild-goose').forEach((n) => n.remove());
    }
    this._renderTimer();
  },

  /**
   * 读取用户设置：香总时长与化雁间隔（分钟）。
   * 优先 bridge(VaultStorage)，回退 localStorage；非法/缺失用默认值。
   */
  async _loadSettings() {
    const readMin = async (key, def) => {
      let raw = null;
      try {
        if (typeof storageManager !== 'undefined' && storageManager.getSetting) {
          raw = await storageManager.getSetting(key);
        }
      } catch (_) { /* 忽略 */ }
      if (raw == null && typeof StorageAdapter !== 'undefined') {
        raw = StorageAdapter.get(key);
      }
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n > 0 ? n : def;
    };
    const durMin = Math.min(DUR_MAX, Math.max(DUR_MIN, await readMin(DUR_KEY, 60)));
    const gooseMin = Math.min(GOOSE_MAX, Math.max(GOOSE_MIN, await readMin(GOOSE_KEY, 10)));
    // 化雁间隔不得超过总时长
    this._durationMs = durMin * 60 * 1000;
    this._gooseMs = Math.min(gooseMin, durMin) * 60 * 1000;
    // 香插样式：宿主设置面板无此项，直接读 localStorage（画中卷内切换时写入）
    let rawCenser = null;
    try {
      if (typeof StorageAdapter !== 'undefined') rawCenser = StorageAdapter.get(CENSER_KEY);
    } catch (_) { /* 忽略 */ }
    this._censerStyle = CENSER_STYLES.some((s) => s.key === rawCenser) ? rawCenser : DEFAULT_CENSER;
  },

  /**
   * 线香燃烧进度由剩余时间驱动：设置 --burn(剩余比例) 给 CSS 渲染香身/余烬/青烟。
   * @param {boolean} force 是否立即写入（初始化/重置/燃尽时必须立即写；rAF 每帧调用时靠节流）
   * 性能：--burn 驱动 6+ 元素的 calc/top/height，每帧写 DOM 代价高；CSS 已有 0.9s linear 过渡，
   * 故按 ~100ms 节流写入即可保持丝滑，样式重算频次降低约 6 倍。
   */
  _updateIncense(force) {
    const incense = this._incenseEl;
    if (!incense) return;
    const ratio = Math.max(0, Math.min(1, this._remaining / this._durationMs));
    const now = performance.now();
    if (force || !this._lastBurnWrite || now - this._lastBurnWrite >= 100) {
      incense.style.setProperty('--burn', String(ratio));
      this._lastBurnWrite = now;
    }

    // 每燃烧满一个「化雁间隔」，一段香灰随风化作大雁飞向远方天空
    if (this._litTriggered) {
      const burned = this._durationMs - this._remaining;
      const segs = Math.floor(burned / this._gooseMs);
      if (segs > this._ashDroppedSegs) {
        for (let s = this._ashDroppedSegs; s < segs; s++) this._releaseWildGoose(incense, ratio);
        // 保留的灰堆起点抬升到「最近一个整间隔点」，更早的段已随风化去
        const ashTop = Math.min(segs * (this._gooseMs / this._durationMs), 1);
        incense.style.setProperty('--ash-top', String(ashTop));
        this._ashDroppedSegs = segs;
      }
    }
  },

  /**
   * 将一段香灰化作大雁：先在香头处凝形飘离，再沿 S 形风路径振翅飞向远方天空，渐远渐淡。
   * @param {HTMLElement} incense 香容器
   * @param {number} ratio 剩余比例(1→0)，用于计算燃烧前沿像素位置
   */
  _releaseWildGoose(incense, ratio) {
    // 燃烧前沿当前像素（相对 incense 顶）
    const frontY = STICK_TOP + (1 - ratio) * STICK_H;
    const dir = this._ashDroppedSegs % 2 === 0 ? 1 : -1; // 左右交替，如雁阵分飞
    const baseX = dir * (50 + Math.random() * 60);   // 主漂移方向
    const swayX = dir * (16 + Math.random() * 14);    // 风中回摆幅度
    const flyUp = frontY + 160; // 飞越 incense 顶部，没入远方天空
    const goose = document.createElement('div');
    goose.className = 'scroll-wild-goose';
    goose.style.top = frontY + 'px';
    goose.innerHTML =
      '<svg viewBox="0 0 26 14" fill="none">' +
      '<path d="M13 10 Q7 2 1 5 Q6 6.5 13 10 Q20 2 25 5 Q19 6.5 13 10 Z" ' +
      'fill="rgba(86,80,74,0.82)"/></svg>';
    incense.appendChild(goose);

    // 0%→16%：在香头处凝形飘离（微缩淡入+轻抬），似香灰化出（#1）
    // 之后沿 S 形风路径远去：先主向、中途回摆、终没入天际，整体渐小渐淡（#3）
    const anim = goose.animate(
      [
        { transform: 'translate(0,0) scale(0.5)', opacity: 0, offset: 0 },
        { transform: 'translate(0,-6px) scale(1)', opacity: 0.85, offset: 0.16 },
        { transform: `translate(${baseX * 0.55}px, ${-flyUp * 0.45}px) scale(0.6) rotate(${dir * 4}deg)`, opacity: 0.72, offset: 0.45 },
        { transform: `translate(${(baseX - swayX) * 0.82}px, ${-flyUp * 0.72}px) scale(0.34) rotate(${dir * 7}deg)`, opacity: 0.5, offset: 0.74 },
        { transform: `translate(${baseX * 1.15}px, ${-flyUp}px) scale(0.12) rotate(${dir * 10}deg)`, opacity: 0, offset: 1 },
      ],
      { duration: 5000, easing: 'cubic-bezier(.36,.5,.5,1)' }
    );
    anim.onfinish = () => goose.remove();
  },

  // ---------------- 火折子交互：拔帽 → 拖动到香头点燃 ----------------

  _bindFirebrand() {
    const firebrand = this._el && this._el.querySelector('.scroll-firebrand');
    if (!firebrand) return;
    const hint = firebrand.querySelector('.scroll-firebrand-hint');
    const isCapOff = () => firebrand.classList.contains('cap-off');

    const openCap = () => {
      if (isCapOff()) return;
      this._litTriggered = false;
    this._litHoldActive = false;
      firebrand.classList.add('cap-off');
      if (hint) hint.textContent = '拖动点燃';
    };

    const onDown = (e) => {
      // 仅响应主键（左键）：右键留给香炉唤出香插选单，中键同理，都不应触发火折子逻辑。
      // 触摸事件没有 button 属性（undefined != null 为 false），正常放行。
      if (e.button != null && e.button !== 0) return;
      // 阻止默认行为（含原生文本选择）。mousedown 的 preventDefault 在部分平台/触摸
      // 路径下不足以完全抑制拖选，故再给根容器加 .scroll-dragging 全局禁用选择，
      // 避免拖拽火折子时选区高亮在画面中拖出一条多余的色带。
      e.preventDefault();
      this._el.classList.add('scroll-dragging');
      // preventDefault 同时取消了「mousedown 清除已有选区」的默认行为，若画面中残留
      // 选区，后续 mousemove 会将其扩展成一条高亮色带。故按下时主动清空选区。
      try {
        const sel = window.getSelection && window.getSelection();
        if (sel && !sel.isCollapsed) sel.removeAllRanges();
      } catch (_) { /* 选区 API 不可用则忽略 */ }
      const p = this._pointer(e);
      // 交互前刷新香容器几何基准：挂载时容器尺寸可能尚未确定（会测到 0 导致判定失准），
      // 按下时布局必定已就绪。此处是每次按下仅一次的低频读取。
      this._measureGeometry();
      const rect = firebrand.getBoundingClientRect();
      this._dragOrigin = { x: rect.left, y: rect.top };
      this._dragStart = { x: p.clientX, y: p.clientY };
      this._dragOffset = { x: p.clientX - rect.left, y: p.clientY - rect.top };
      // 火焰顶端（竹筒口）锚点：按下时测量这一次，拖拽中按位移推算即可，
      // 之后每次 mousemove 都不再读取布局。
      this._flameAnchor = { x: rect.left + rect.width / 2, y: rect.top + 24 };
      this._lastDx = 0;
      this._lastDy = 0;
      // 帽未开：先不拔帽也不拖拽，仅记录起点，松开判定为「拔帽」
      if (isCapOff()) {
        this._firebrandDragging = true;
        firebrand.classList.add('dragging');
      }
    };
    const onMove = (e) => {
      if (!isCapOff() || !this._firebrandDragging) return;
      const p = this._pointer(e);
      const dx = p.clientX - this._dragOrigin.x - this._dragOffset.x;
      const dy = p.clientY - this._dragOrigin.y - this._dragOffset.y;
      // 拖拽中保持拔帽后的 45° 斜举（translate 会覆盖 CSS transform，故此处显式带 rotate）
      // 注：不限制拖拽范围，火折子可自由拖动画面；溢出由 CSS overflow-x:clip 裁切，
      // 且不创建滚动容器（详见 base.css 中 .scroll-left/.scroll-body/.scroll-screen 注释）。
      firebrand.style.transform = `translate(${dx}px, ${dy}px) rotate(-45deg)`;
      // 本次握持已触发点燃/吹熄：继续保持跟随，但不再重复触发（由 onUp 松手归位）
      if (this._litHoldActive) return;
      // 记录位移，供松手时 onUp 复算判定，同样无需读布局
      this._lastDx = dx;
      this._lastDy = dy;
      // 实时靠近反馈；靠近香头即点燃（无需等到松手）。
      // 传入位移做纯算术判定：原实现在刚写入 transform 之后又 getBoundingClientRect，
      // 属于「先写后读」的强制同步布局（layout thrashing），是拖拽掉帧的主因。
      const near = this._tryLight(dx, dy);
      firebrand.classList.toggle('near', near);
      const incense = this._incenseEl;
      if (incense) incense.classList.toggle('near', near);
      if (near) {
        // 仅移除 near 高亮反馈；保留 dragging（让内联 transform 继续跟随，不被 idle 动画覆盖）
        firebrand.classList.remove('near');
        if (incense) incense.classList.remove('near');
        // 未点燃 → 点燃；已点燃 → 吹熄（火折子靠近香头即吹）
        this._applyFirebrandTouch(incense, firebrand);
        // 标记本次握持已触发动作，火折子继续跟随鼠标，待松手(onUp)才归位
        this._litHoldActive = true;
      }
    };
    const onUp = (e) => {
      // 仅响应主键：右键（香炉上用于唤出香插选单）也会派发 mouseup，
      // 若不设此闸，右键一次就会把火折子的帽子拨开或盖回。
      if (e.button != null && e.button !== 0) return;
      // 松手解除全局禁选（所有 return 分支之前统一清除，避免残留）
      this._el.classList.remove('scroll-dragging');
      // 必须是「按在火折子上」的那一次交互：onUp 绑在 document 上，
      // 点击香插菜单项等其它区域的 mouseup 同样会冒泡到此，若不设此闸，
      // 换一次香插就会顺带触发拔帽/归位。
      if (!this._dragStart) return;
      const p = this._pointer(e);
      const moved = this._dragStart
        ? Math.hypot(p.clientX - this._dragStart.x, p.clientY - this._dragStart.y)
        : 0;
      this._dragStart = null;
      // 帽未开 + 轻点 → 拔帽
      if (!isCapOff()) {
        if (moved < 8) openCap();
        return;
      }
      // 已开帽 + 轻点 → 盖回帽子并复位拖拽态
      if (moved < 8) {
        this._firebrandDragging = false;
        firebrand.classList.remove('cap-off', 'dragging', 'near');
        if (this._incenseEl) this._incenseEl.classList.remove('near');
        if (hint) hint.textContent = '';
        return;
      }
      if (!this._firebrandDragging) return;
      this._firebrandDragging = false;
      firebrand.classList.remove('dragging');
      this._lastDragEnd = Date.now();
      const incense = this._incenseEl;
      // 本次握持已触发点燃/吹熄：松手即归位（不再重复触发）
      if (this._litHoldActive) {
        this._litHoldActive = false;
        this._releaseFirebrand(firebrand);
        return;
      }
      // 兜底：松手瞬间仍靠近香头（move 未命中），按当前状态点燃/吹熄，否则归位。
      // 用最后一次位移复算，保持与拖拽中一致的判定且不读取布局。
      if (this._tryLight(this._lastDx || 0, this._lastDy || 0)) {
        if (incense) incense.classList.remove('near');
        this._applyFirebrandTouch(incense, firebrand);
        this._releaseFirebrand(firebrand);
      } else {
        firebrand.classList.remove('near');
        if (incense) incense.classList.remove('near');
        this._releaseFirebrand(firebrand);
      }
    };
    firebrand.addEventListener('mousedown', onDown);
    firebrand.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('mousemove', onMove);
    // onMove 不调用 preventDefault，touchmove 设为 passive 以不阻塞滚动/提升触控响应
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  },

  _pointer(e) {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    return t || e;
  },

  /** 火折子归位：清除拖拽位移/状态类/提示，回到初始位置（松手时调用） */
  _releaseFirebrand(firebrand) {
    if (!firebrand) return;
    firebrand.style.transform = '';
    firebrand.classList.remove('cap-off', 'dragging', 'near', 'lit');
    const hint = firebrand.querySelector('.scroll-firebrand-hint');
    if (hint) hint.textContent = '拔帽取火';
  },

  /**
   * 点燃演化：大火光(lighting) → 微光闪烁(glowing) → 静态暗红余烬(is-lit)，青烟全程持续。
   * 由 onMove / onUp 在进入香头范围时调用一次（_litTriggered 防重入）。
   */
  _ignite(incense, firebrand) {
    if (this._litTriggered) return;
    this._litTriggered = true;
    // 先进入「引燃」阶段：火苗由大收敛吻上香头、余烬由小点亮（#6 衔接），青烟渐显
    incense.classList.add('is-lit', 'kissing');
    this._startTimer();
    // 点燃后火折子不立即归位：留在用户手中继续跟随，待松手(onUp)才回原位
    // （不再加 .lit 类——该类会让火折子 opacity:0 隐藏，与"留在手中"需求冲突）
    incense.classList.remove('near');

    this._lightTimers = this._lightTimers || [];
    // 约 0.45s：引燃收尾，转入大火光强闪
    this._lightTimers.push(setTimeout(() => {
      incense.classList.add('lighting');
    }, 450));
    // 约 0.9s：引燃结束，转入微光闪烁（lighting 仍存，glowing 覆盖为微闪）
    this._lightTimers.push(setTimeout(() => {
      incense.classList.remove('kissing');
      incense.classList.add('glowing');
    }, 900));
    // 约 2.4s 后归于静态暗红余烬（移除阶段类，仅留 is-lit 静态态）
    this._lightTimers.push(setTimeout(() => {
      incense.classList.remove('lighting', 'glowing');
    }, 2400));
  },

  /**
   * 吹熄（#7）：火折子再次靠近已点燃的香头即吹熄。停表 + 加 .blowing 过渡类
   * （余烬暗灭、火光隐去、青烟被吹散淡出），约 1.15s 后硬重置回初始未燃态。
   */
  _blowOut(incense, firebrand) {
    if (!this._litTriggered) return;
    this._stopTimer();
    this._litTriggered = false;
    this._litHoldActive = false;
    if (this._lightTimers) { this._lightTimers.forEach(clearTimeout); this._lightTimers = []; }
    // 吹熄过渡：保留 is-lit 以便 .blowing 规则命中，移除一切燃烧阶段类
    incense.classList.add('blowing');
    incense.classList.remove('lighting', 'glowing', 'kissing');
    if (firebrand) {
      firebrand.classList.remove('cap-off', 'dragging', 'near', 'lit');
      firebrand.style.transform = '';
      const hint = firebrand.querySelector('.scroll-firebrand-hint');
      if (hint) hint.textContent = '拔帽取火';
    }
    incense.classList.remove('near');
    // 过渡收尾：彻底熄灭并复位（清化雁、复位 burn 与剩余）
    setTimeout(() => {
      incense.classList.remove('is-lit', 'blowing');
      incense.style.removeProperty('--ash-top');
      incense.querySelectorAll('.scroll-wild-goose').forEach((n) => n.remove());
      this._ashDroppedSegs = 0;
      this._remaining = this._durationMs;
      this._renderTimer();
    }, 1150);
  },

  /**
   * 火折子靠近香头的统一动作：暂停香 → 续燃；未燃 → 点燃；正常燃烧中 → 吹熄。
   * 把原先「已点燃即吹熄」的二分支升级为三分支，让手动掐灭的香可被火折子重新引燃。
   */
  _applyFirebrandTouch(incense, firebrand) {
    if (!incense) return;
    if (incense.classList.contains('paused')) this._resumeBurning();
    else if (!this._litTriggered) this._ignite(incense, firebrand);
    else this._blowOut(incense, firebrand);
  },

  /**
   * 判定火焰是否够到香头（燃烧前沿）。
   * 纯算术：火焰点 = 按下时锚点 + 当前位移；余烬点由缓存的香容器几何推算。
   * 原实现每次调用都 getBoundingClientRect 两次，且常在写入 transform 之后读取，
   * 属于强制同步布局（layout thrashing）——mousemove 可达 120Hz+，代价极高。
   * @param {number} dx 火折子当前水平位移
   * @param {number} dy 火折子当前垂直位移
   */
  _tryLight(dx = 0, dy = 0) {
    const firebrand = this._firebrandEl;
    if (!firebrand || !firebrand.classList.contains('cap-off')) return false; // 未拔帽则无火
    const anchor = this._flameAnchor;
    const geo = this._incenseGeo;
    if (!anchor || !geo) return false;
    const ratio = Math.max(0, Math.min(1, this._remaining / this._durationMs));
    // 与 CSS 保持一致：余烬 top = 22px + (1 - burn) * 560px，自身高 16 → 中心再 +8
    const ex = geo.cx;
    const ey = geo.top + 22 + (1 - ratio) * 560 + 8;
    return Math.hypot(anchor.x + dx - ex, anchor.y + dy - ey) < 80;
  },

  // ---------------- 香插样式（百宝匣选器） ----------------

  /** 当前生效的款式对象（键值非法时回退到首款） */
  _censerStyleObj() {
    return CENSER_STYLES.find((s) => s.key === this._censerStyle) || CENSER_STYLES[0];
  },

  /**
   * 渲染香插：注入当前款式 SVG 并挂上配色 class（cs-<key>）。
   * 渐变 id 带款式后缀（见 censerSvg），故与博古格里的微缩器物互不干扰。
   */
  _renderCenser() {
    if (!this._el) return;
    const censer = this._el.querySelector('.scroll-censer');
    if (!censer) return;
    const style = this._censerStyleObj();
    CENSER_STYLES.forEach((s) => censer.classList.remove(`cs-${s.key}`));
    censer.classList.add(`cs-${style.key}`);
    const { back, front } = censerSvg(style.key);
    const svgBack = censer.querySelector('.scroll-censer-svg-back');
    const svgFront = censer.querySelector('.scroll-censer-svg-front');
    if (svgBack) svgBack.innerHTML = back;
    if (svgFront) svgFront.innerHTML = front;
  },

  /**
   * 线香交互：燃烧中点一下线香（香身 / 香头 / 青烟，除香插外）→ 掐灭火星、暂停计时；
   * 已暂停时点一下 → 续燃。未点燃态点击无动作（用吹筒点香）。
   * 香插区域由自身监听处理（单击切换 / 双击重置），此处排除以免双重触发。
   */
  _bindIncensePinch() {
    const incense = this._incenseEl;
    if (!incense) return;
    incense.addEventListener('click', (e) => {
      const t = e.target;
      if (t instanceof Element && t.closest('.scroll-censer')) return; // 交给香插自身
      if (this._firebrandDragging) return;
      if (Date.now() - (this._lastDragEnd || 0) < 80) return;
      const isLit = incense.classList.contains('is-lit');
      const isPaused = incense.classList.contains('paused');
      if (isLit && !isPaused) this._pauseBurning();
      else if (isLit && isPaused) this._resumeBurning();
    });
  },

  /** 掐灭火星：停表但保留已燃进度（暂停，可续燃），熄灭余烬火光青烟 */
  _pauseBurning() {
    const incense = this._incenseEl;
    if (!incense || !incense.classList.contains('is-lit')) return;
    this._stopTimer();
    if (this._lightTimers) { this._lightTimers.forEach(clearTimeout); this._lightTimers = []; }
    incense.classList.add('paused');
    incense.classList.remove('lighting', 'glowing', 'kissing');
    // 保留 is-lit：表示这炷香已被点燃过，可再次续燃
  },

  /** 续燃：从暂停处继续计时，恢复暗红余烬微光（带引燃过渡，与点燃同节奏） */
  _resumeBurning() {
    const incense = this._incenseEl;
    if (!incense || !incense.classList.contains('is-lit')) return;
    this._stopTimer();           // 暂停时计时已停，这里再清一次确保干净重启
    incense.classList.remove('paused', 'lighting', 'glowing', 'kissing');
    incense.classList.add('kissing');
    this._startTimer();
    this._lightTimers = this._lightTimers || [];
    this._lightTimers.forEach(clearTimeout);
    this._lightTimers = [];
    // 引燃强闪 → 微光 → 静态余烬，与 _ignite 同节奏，视觉连续
    this._lightTimers.push(setTimeout(() => incense.classList.add('lighting'), 300));
    this._lightTimers.push(setTimeout(() => {
      incense.classList.remove('kissing');
      incense.classList.add('glowing');
    }, 800));
    this._lightTimers.push(setTimeout(() => {
      incense.classList.remove('lighting', 'glowing');
    }, 2300));
  },

  /** 按步长轮换款式（首尾循环） */
  _stepCenserStyle(step) {
    const i = CENSER_STYLES.findIndex((s) => s.key === this._censerStyleObj().key);
    const len = CENSER_STYLES.length;
    const next = CENSER_STYLES[(((i + step) % len) + len) % len];
    this._setCenserStyle(next.key, true);
  },

  /**
   * 切换并持久化香插样式。
   * @param {string} key 款式 key
   * @param {boolean} animate 是否播放器物转入动效（首次渲染不播）
   */
  _setCenserStyle(key, animate = false) {
    if (!CENSER_STYLES.some((s) => s.key === key)) return;
    this._censerStyle = key;
    try {
      if (typeof StorageAdapter !== 'undefined') StorageAdapter.set(CENSER_KEY, key);
    } catch (_) { /* 存储不可用时仅本次会话有效 */ }
    this._renderCenser();
    if (!animate || !this._el) return;
    // 重启动画：先移除再强制回流，故无需在动画结束后清理 class
    const censer = this._el.querySelector('.scroll-censer');
    if (!censer) return;
    censer.classList.remove('turn-in');
    void censer.offsetWidth;
    censer.classList.add('turn-in');
  },

  /**
   * 香插本体交互：单击 = 立即循环切换款式（跟手）；双击（两次点击 <300ms）= 重置计时。
   * 键盘 Enter/Space = 切换。为消除「单击延迟」，单击不再等待双击判定窗口：
   * 单击即时切换，若 300ms 内再来一次点击则判定为双击——撤销刚才那次切换、回到双击前
   * 款式并重置计时（瞬切、不重播转入动画，避免回退闪动）。这样单击零延迟、双击语义不变。
   */
  _bindCenserInteractions() {
    const censer = this._el && this._el.querySelector('.scroll-censer');
    if (!censer) return;
    let lastClick = 0;
    let prevKey = null;

    censer.addEventListener('click', () => {
      if (this._firebrandDragging) return;
      if (Date.now() - (this._lastDragEnd || 0) < 80) return;
      const now = Date.now();
      if (now - lastClick < 300) {
        // 双击：撤销刚才那次单击切换，回到双击前款式，并重置计时
        lastClick = 0;
        if (prevKey) this._setCenserStyle(prevKey, false);
        this._resetTimer();
        return;
      }
      lastClick = now;
      prevKey = this._censerStyleObj().key;
      this._stepCenserStyle(1);
    });
    // 键盘可达性：role=button，Enter / Space 触发切换（双击重置无键盘等价，依赖指针）
    censer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        this._stepCenserStyle(1);
      }
    });
  },

  // ---------------- 工具 ----------------

  _escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  _escapeAttr(s) { return this._escapeHtml(s); },

  _fmtClock(ms) {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  },

  /** 画布内位置选择器：右下角三个极简圆点（左壁/中堂/右壁），点击经 postMessage 切换停靠位置 */
  _locDots: null,
  _location: 'center',
  _mountLocationDots() {
    // 画中卷运行在 Shadow DOM 内：应用层 DOM 须挂到 shadowRoot（getDomRoot），
    // 否则挂到 document.body（shadow 之外）会被 shadow 内容盖住 / 样式隔离而不可见。
    let root = (typeof document !== 'undefined') ? getDomRoot() : null;
    if (root === document) root = document.body;
    if (!root) return;
    const bar = document.createElement('div');
    bar.className = 'tw-scroll-locdots';
    const defs = [['left', '左壁'], ['center', '中堂'], ['right', '右壁']];
    this._locDots = {};
    defs.forEach(([loc, title]) => {
      const dot = document.createElement('div');
      dot.className = 'tw-scroll-dot';
      dot.title = title;
      dot.setAttribute('aria-label', title);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        window.parent.postMessage({ type: 'app:moveScroll', id: 'scroll-move-' + Date.now(), payload: { location: loc } }, '*');
      });
      bar.appendChild(dot);
      this._locDots[loc] = dot;
    });
    root.appendChild(bar);
    this._highlightLocationDots(this._location);
  },
  _highlightLocationDots(loc) {
    if (!this._locDots) return;
    Object.keys(this._locDots).forEach((k) => {
      this._locDots[k].classList.toggle('is-active', k === loc);
    });
  },
};

window.ScrollManager = ScrollManager;

// 画中卷功能选型：宿主在 iframe 加载完成后 postMessage 注入（跨 webview 可靠通道）。
// 不依赖 data: URL 的 #hash——Obsidian 的 buildBlobUrl 实际返回 data: URL，fragment 不稳定会致视图闪烁/失败。
ScrollManager._hfResolved = null;
ScrollManager._hf = new Promise((resolve) => {
  let done = false;
  const t = setTimeout(() => { if (!done) { done = true; ScrollManager._hfResolved = null; resolve(null); } }, 2000);
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'scroll:feature') {
      if (done) return;
      done = true;
      clearTimeout(t);
      ScrollManager._hfResolved = e.data.feature || null;
      resolve(ScrollManager._hfResolved);
    }
  });
});

// 画中卷停靠位置广播：宿主在 iframe 加载后 / 移动后 postMessage 注入，用于点亮当前栏对应的点。
ScrollManager._location = 'center';
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'scroll:location') {
    const loc = e.data.location;
    if (loc === 'left' || loc === 'center' || loc === 'right') {
      ScrollManager._location = loc;
      ScrollManager._highlightLocationDots(loc);
    }
  }
});

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
