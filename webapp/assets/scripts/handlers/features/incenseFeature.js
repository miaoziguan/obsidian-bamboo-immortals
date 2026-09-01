/**
 * incenseFeature.js — 画中卷·香道（番茄钟）功能模块
 *
 * 作为「画中卷」容器（ScrollManager）注册的第一个独立功能挂载。
 * 本模块自包含：拥有独立 DOM 与全部香道交互/计时逻辑，通过 mount(stageEl)/unmount()
 * 接入/退出画中卷的功能舞台，不依赖容器之外的全局状态。
 *
 * 画中卷定位为「百宝箱」容器，香道是其中第一个功能；未来可在 ScrollManager 注册更多功能。
 *
 * 隐私兼容：工作台根 class 为 .scroll-workbench（非 .modal-panel），故 PrivacyMode.markText
 * 会照常给文字补打 data-private-text，进而被 base.css 的隐私模糊规则命中（纳入模糊）。
 */

import { CENSER_STYLES, DEFAULT_CENSER, censerSvg } from '../censerStyles.js';

const POMODORO_MS = 60 * 60 * 1000; // 一炷香默认燃烧 1 小时
const SEG_MS = 10 * 60 * 1000;       // 每燃烧 10 分钟，一段香灰随风化雁
const STICK_TOP = 30;                // 香身顶距 incense 顶（px）
const STICK_H = 560;                 // 香身全长（px，对应 60 分钟）
const DUR_KEY = 'incenseDuration';    // 设置项：香总时长（分钟）
const GOOSE_KEY = 'incenseGooseInterval'; // 设置项：化雁间隔（分钟）
const CENSER_KEY = 'incenseCenserStyle';  // 设置项：香插样式（画中卷内切换，存 localStorage）
const DUR_MIN = 1, DUR_MAX = 240;    // 总时长允许范围（分钟）
const GOOSE_MIN = 1, GOOSE_MAX = 120;// 化雁间隔允许范围（分钟）

export const IncenseFeature = {
  _timer: null,          // 番茄钟 interval
  _remaining: POMODORO_MS,
  _running: false,
  _el: null,             // 功能根 DOM（.scroll-incense-feature）
  _ashDroppedSegs: 0,     // 已化雁的香灰段数（每 _gooseMs +1）
  _durationMs: POMODORO_MS, // 香总燃烧时长（可设置）
  _gooseMs: SEG_MS,          // 化雁间隔（可设置）

  // ---- DOM 引用缓存 ----
  _incenseEl: null,
  _timerEl: null,
  _firebrandEl: null,
  _censerEl: null,
  _svgBack: null,
  _svgFront: null,

  // ---- 几何 / 拖拽状态 ----
  _incenseGeo: null,
  _flameAnchor: null,
  _dragStart: null,
  _dragOrigin: null,
  _dragOffset: null,
  _litTriggered: false,
  _litHoldActive: false,
  _litThisHold: false,   // 本次握持火折子是否真正点着过香（与 _litTriggered 解耦，专管松手盖帽判定）
  _firebrandDragging: false,
  _lastBurnWrite: 0,
  _lastNear: null,
  _lastDx: 0,
  _lastDy: 0,
  _pendingDx: 0,
  _pendingDy: 0,
  _resizePending: false,
  _wasRunning: false,
  _startTs: 0,
  _startRemaining: 0,
  _lastClockSec: null,
  _lastDragEnd: 0,
  _dragEnd: null,

  // ---- 香插 ----
  _censerStyle: null,
  _lastCenserKey: null,

  // ---- 监听 / 动画句柄（供 unmount 精确解绑）----
  _onResize: null,
  _onVisibility: null,
  _onFirebrandMove: null,
  _onFirebrandUp: null,
  _moveRaf: 0,
  _lightTimers: null,
  _audioCtx: null,        // 拔帽/盖回声效的 Web Audio 上下文（轻量合成，无需外部音频文件）

  /** 接入画中卷功能舞台：读取设置 → 构建 DOM → 渲染计时 → 提示隐私标记 */
  async mount(stageEl) {
    if (this._el) return;
    // 先读取用户设置（香总时长 / 化雁间隔），再据以初始化计时
    await this._loadSettings();
    this._remaining = this._durationMs;
    this._ensureDom(stageEl);
    this._renderTimer();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
  },

  /**
   * 退出功能舞台：停表、解绑全部外部监听、取消延时回调、释放 DOM 引用并移除根节点。
   * 之前只解绑了 message/resize，而火折子的 mousemove/touchmove/mouseup/touchend
   * 绑在 document 上——视图关闭后监听残留、闭包持续持有香插/火折子 DOM，
   * 既造成内存泄漏，又让后续每次全局 mousemove 都白白执行一次回调。
   */
  unmount() {
    this._stopTimer();
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
    // 引燃/续燃/吹熄的延时回调（最长 2.4s）：必须一并取消，否则舞台关闭后仍会执行，
    // 闭包持续持有香 DOM（与下方释放 DOM 引用的意图相悖），并对已卸载节点继续写样式。
    if (this._lightTimers) { this._lightTimers.forEach(clearTimeout); this._lightTimers = []; }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    if (this._onVisibility) {
      document.removeEventListener('visibilitychange', this._onVisibility);
      this._onVisibility = null;
    }
    // 移除功能根 DOM（容器 close 前先将其从舞台摘下）
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    // 释放缓存的 DOM 引用，避免闭包长期持有已卸载节点
    this._censerEl = null;
    this._svgBack = null;
    this._svgFront = null;
    this._el = null;
    this._incenseEl = null;
    this._firebrandEl = null;
    this._timerEl = null;
    // 重置交互/燃烧状态，避免跨挂载残留
    this._incenseGeo = null;
    this._flameAnchor = null;
    this._dragStart = null;
    this._dragOrigin = null;
    this._dragOffset = null;
    this._litTriggered = false;
    this._litHoldActive = false;
    this._firebrandDragging = false;
    this._ashDroppedSegs = 0;
    this._lastBurnWrite = 0;
    this._lastNear = null;
    this._lastDx = 0;
    this._lastDy = 0;
    this._pendingDx = 0;
    this._pendingDy = 0;
    this._resizePending = false;
    this._wasRunning = false;
    this._startTs = 0;
    this._startRemaining = 0;
    this._lastClockSec = null;
    this._lastDragEnd = 0;
    this._dragEnd = null;
    this._censerStyle = null;
    this._lastCenserKey = null;
  },

  _ensureDom(stageEl) {
    if (this._el) return;
    // 功能根：承载原「单栏香道番茄钟」全部 DOM。挂在容器传入的舞台节点内，
    // 不再自行挂到 shadow root（避免与容器外壳重复、破坏布局隔离）。
    const wrap = document.createElement('div');
    wrap.className = 'scroll-incense-feature';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', '香道');
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
                    <!-- 单股烟缕：形态固定，流动感由「姿态变化 + 明暗起伏」两条合成动画
                         叠加产生（见 base.css 的 scroll-smoke-drift / scroll-smoke-fade）。
                         路径写死在 d 属性上（而非 CSS d），兼顾不支持 CSS d 属性的浏览器。 -->
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
                    现为可点击控件：左键单击切换款式、右键重置计时（role=button 提供键盘可达性）。 -->
                <div class="scroll-censer" role="button" tabindex="0" aria-label="更换香插：左键单击切换，右键重置计时" title="点击更换香插 · 右键重置计时">
                  <div class="scroll-censer-reflect"></div>
                  <div class="scroll-censer-shadow"></div>
                  <svg class="scroll-censer-svg scroll-censer-svg-back" viewBox="0 0 112 80" fill="none"></svg>
                  <svg class="scroll-censer-svg scroll-censer-svg-front" viewBox="0 0 112 80" fill="none"></svg>
                </div>
              </div>


              <!-- 火折子：竹制吹筒 + 可拔竹帽，拔帽方显火绒，拖到香头点燃 -->
              <div class="scroll-firebrand" data-action="scroll-firebrand" aria-label="火折子">
                <svg viewBox="0 0 48 96" fill="none">
                  <!-- 竹身（吹筒）：颜色由 base.css .scroll-firebrand 的 --fb-* 派生（随主体色相 + 明度）。
                       SVG 呈现属性不支持 var()，故 fill/stroke 改由 CSS 类施加（见 base.css）。 -->
                  <rect class="fb-body" x="14" y="34" width="20" height="56" rx="3" fill="url(#fbBamboo)" stroke-width="1.2"/>
                  <rect x="16" y="36" width="5" height="52" rx="2" fill="#eef4f0" opacity="0.3"/>
                  <!-- 竹节横纹 -->
                  <path class="fb-stroke" d="M14 52 Q24 49 34 52" stroke-width="0.8" fill="none" opacity="0.6"/>
                  <path class="fb-stroke" d="M14 70 Q24 67 34 70" stroke-width="0.8" fill="none" opacity="0.6"/>
                  <path class="fb-stroke" d="M14 86 Q24 84 34 86" stroke-width="0.8" fill="none" opacity="0.6"/>
                  <ellipse class="fb-top" cx="24" cy="34" rx="10" ry="3"/>
                  <ellipse cx="24" cy="34" rx="10" ry="3" fill="url(#fbHi)"/>
                  <!-- 火绒（帽下，默认隐藏，拔帽方显）。
                       火苗跳动与火星上飘改用 CSS 动画并默认 paused：原 SMIL 常驻播放，
                       未拔帽（火绒不可见）时仍在持续消耗 CPU。见 base.css .flame-* 规则。 -->
                  <g class="flame">
                    <path class="flame-outer" d="M24 34 Q19 23 24 11 Q29 23 24 34" opacity="0.92"/>
                    <path class="flame-inner" d="M24 34 Q22 27 24 18 Q26 27 24 34" opacity="0.85"/>
                    <circle class="flame-spark spark-a" cx="28" cy="22" r="1.2" opacity="0.8"/>
                    <circle class="flame-spark spark-b" cx="20" cy="24" r="0.8" opacity="0.7"/>
                  </g>
                  <!-- 可拔竹帽：圆润钟形竹笠 + 顶钮 + 微外扩帽檐 -->
                  <g class="scroll-firebrand-cap">
                    <path class="fb-cap-body" d="M11 30 Q11 19 24 17 Q37 19 37 30 Q31 33 24 33 Q17 33 11 30 Z" fill="url(#fbCap)" stroke-width="1.2"/>
                    <path class="fb-cap-stroke" d="M11 29 Q24 26 37 29" stroke-width="0.8" fill="none" opacity="0.55"/>
                    <ellipse class="fb-cap-edge" cx="24" cy="33" rx="13" ry="2.6" opacity="0.55"/>
                    <path class="fb-cap-knob" d="M24 17 Q21 11 24 8 Q27 11 24 17 Z" stroke-width="0.9"/>
                    <ellipse class="fb-cap-knob" cx="24" cy="8" rx="3" ry="1.6"/>
                  </g>
                  <defs>
                    <linearGradient id="fbBamboo" x1="0" y1="0" x2="1" y2="0"><stop offset="0%"/><stop offset="45%"/><stop offset="100%"/></linearGradient>
                    <linearGradient id="fbCap" x1="0" y1="0" x2="1" y2="0"><stop offset="0%"/><stop offset="50%"/><stop offset="100%"/></linearGradient>
                    <linearGradient id="fbHi" x1="0.2" y1="0" x2="0.8" y1="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;
    stageEl.appendChild(wrap);
    this._el = wrap;
    // 缓存高频访问的 DOM 引用，避免每帧/每次 mousemove 都 querySelector 遍历
    this._incenseEl = wrap.querySelector('.scroll-incense');
    this._timerEl = wrap.querySelector('#scrollTimer');
    this._firebrandEl = wrap.querySelector('.scroll-firebrand');

    // 火折子拖拽点香
    this._bindFirebrand();
    // 香插样式：渲染当前款式
    this._renderCenser();
    // 香插本体：左键单击切换 / 右键重置计时；线香：单击掐灭暂停（再次单击续燃）
    this._bindCenserInteractions();
    this._bindIncensePinch();

    // 测量并缓存几何基准（供点燃判定做纯算术），仅在挂载与窗口尺寸变化时读取布局；
    // 拖拽过程中不再调用 getBoundingClientRect，避免强制同步布局。
    this._measureGeometry();
    if (!this._onResize) {
      // resize 会高频触发（拖动窗口时每秒数十次），直接读布局会造成布局抖动。
      // 用 rAF 合并：一帧内多次 resize 只测一次几何。
      this._onResize = () => {
        if (this._resizePending) return;
        this._resizePending = true;
        requestAnimationFrame(() => {
          this._resizePending = false;
          this._measureGeometry();
        });
      };
      window.addEventListener('resize', this._onResize);
    }
    // 页面切到后台时暂停计时心跳：剩余时间按 performance.now 时间戳推算，
    // 回到前台重启即自动补算（不会走慢），后台期间不再空转省电。
    if (!this._onVisibility) {
      this._onVisibility = () => {
        if (document.hidden) {
          if (this._running) { this._wasRunning = true; this._stopTimer(); }
        } else if (this._wasRunning) {
          this._wasRunning = false;
          this._startTimer();
        }
      };
      document.addEventListener('visibilitychange', this._onVisibility);
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
    // 心跳频率 250ms（4Hz）：--burn 写入已节流到 250ms，时钟按整秒刷新、化雁按分钟计，
    // 且 CSS 侧有 0.9s 线性过渡负责补间，4Hz 完全够用，JS 唤醒次数比 10Hz 再省六成。
    this._startTs = performance.now();
    this._startRemaining = this._remaining;
    this._lastClockSec = null;
    this._tick();
    this._timer = setInterval(() => this._tick(), 250);
  },

  /** 计时心跳：按时间戳推算剩余 → 驱动燃烧进度，整秒变化才刷新时钟文字 */
  _tick() {
    if (!this._running) return;
    const elapsed = performance.now() - this._startTs;
    const rem = this._startRemaining - elapsed;
    if (rem <= 0) {
      this._remaining = 0;
      // 先按剩余 0 刷新一次：让最后一段香灰化雁（与燃烧中同节奏），再收烬。
      this._updateIncense(true);
      this._renderClock();
      this._stopTimer();
      // 燃尽收烬：熄灭余烬与青烟、清掉燃烧阶段类与残留雁、复位香灰堆。
      // 并复位点燃标记，使火折子可以直接重新点燃，不必先「吹熄」一次。
      const incense = this._incenseEl;
      if (incense) {
        incense.classList.remove('is-lit', 'kissing', 'lighting', 'glowing');
        incense.querySelectorAll('.scroll-wild-goose').forEach((n) => n.remove());
        incense.style.removeProperty('--ash-top');
      }
      if (this._lightTimers) { this._lightTimers.forEach(clearTimeout); this._lightTimers = []; }
      this._litTriggered = false;
      this._litHoldActive = false;
      this._ashDroppedSegs = 0;
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
    this._litThisHold = false;
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
    // --burn 驱动的是 top/height（布局属性），写入即触发数个元素的重排；CSS 侧已有
    // 0.9s linear 过渡负责补间，故写入频率由 100ms 降到 250ms（10Hz→4Hz），
    // 视觉依旧连续，却把持续的样式重算/布局开销压掉约 6 成。
    if (force || !this._lastBurnWrite || now - this._lastBurnWrite >= 250) {
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
      // 填充色交由 CSS 变量 --goose-fill 控制：暗色模式提亮为浅色，
      // 否则深灰褐的雁在深色背景上几乎不可见。
      '<path class="goose-body" d="M13 10 Q7 2 1 5 Q6 6.5 13 10 Q20 2 25 5 Q19 6.5 13 10 Z"/>' +
      '</svg>';
    incense.appendChild(goose);

    // 化雁声效：一片雁飘落配一声缥缈雁鸣；节流避免后台补算多段时连响成片
    const gsNow = Date.now();
    if (!this._lastGooseSound || gsNow - this._lastGooseSound > 1200) {
      this._lastGooseSound = gsNow;
      this._playCapSound('goose');
    }

    // 0%→16%：在香头处凝形飘离（微缩淡入+轻抬），似香灰化出（#1）
    // 之后沿 S 形风路径远去：先主向、中途回摆、终没入天际，整体渐小渐淡（#3）
    // 暗色模式下雁身原本在深底上几乎不可见：峰值不透明度只有 0.85，且一路衰减到 0 的同时
    // 还急剧缩小到 0.12（末段仅约 3px）。故暗色下改为「淡出更晚 + 缩小更缓」，
    // 让它在整个飞行过程中都保持可辨识；亮色沿用原节奏，避免雁过于抢眼。
    const isDark = document.documentElement.classList.contains('dark') ||
                   (document.body && document.body.classList.contains('dark'));
    const fade = isDark ? [0, 1, 0.95, 0.88, 0] : [0, 0.85, 0.72, 0.5, 0];
    const shrink = isDark ? [0.5, 1, 0.74, 0.52, 0.3] : [0.5, 1, 0.6, 0.34, 0.12];
    const anim = goose.animate(
      [
        { transform: `translate(0,0) scale(${shrink[0]})`, opacity: fade[0], offset: 0 },
        { transform: `translate(0,-6px) scale(${shrink[1]})`, opacity: fade[1], offset: 0.16 },
        { transform: `translate(${baseX * 0.55}px, ${-flyUp * 0.45}px) scale(${shrink[2]}) rotate(${dir * 4}deg)`, opacity: fade[2], offset: 0.45 },
        { transform: `translate(${(baseX - swayX) * 0.82}px, ${-flyUp * 0.72}px) scale(${shrink[3]}) rotate(${dir * 7}deg)`, opacity: fade[3], offset: 0.74 },
        { transform: `translate(${baseX * 1.15}px, ${-flyUp}px) scale(${shrink[4]}) rotate(${dir * 10}deg)`, opacity: fade[4], offset: 1 },
      ],
      { duration: 5000, easing: 'cubic-bezier(.36,.5,.5,1)' }
    );
    anim.onfinish = () => goose.remove();
  },

  // ---------------- 火折子交互：拔帽 → 拖动到香头点燃 ----------------

  _bindFirebrand() {
    const firebrand = this._el && this._el.querySelector('.scroll-firebrand');
    if (!firebrand) return;
    const isCapOff = () => firebrand.classList.contains('cap-off');

    const openCap = () => {
      if (isCapOff()) return;
      this._litTriggered = false;
    this._litHoldActive = false;
      this._litThisHold = false;   // 新一次握持开始：尚未点香
      firebrand.classList.add('cap-off');
      this._playCapSound('open');
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
      // 提前在用户手势内激活音频上下文：后续在 mousemove 中触发的点燃/吹熄
      // 才能正常出声（非手势内的 resume 会被自动播放策略拒绝 → 静音）。
      this._ensureAudio();
      // 清掉松手归位遗留的内联过渡，确保本次拖拽跟手（不被缓动拖慢）
      firebrand.style.transition = '';
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
      // 锚点在 viewBox(0 0 48 96) 中位于 y≈30（竹筒口）。按 SVG 实际渲染高度换算成像素，
      // 而非写死常量——否则调整火折子 CSS 尺寸后，此处会失配导致点燃判定偏移。
      // 用 svg 自身的矩形（非外层容器），避免容器留出其他内容高度时算错比例。
      const svgEl = firebrand.querySelector('svg');
      const svgBox = (svgEl || firebrand).getBoundingClientRect();
      this._flameAnchor = { x: svgBox.left + svgBox.width / 2, y: svgBox.top + (svgBox.height / 96) * 30 };
      this._lastDx = 0;
      this._lastDy = 0;
      this._lastNear = null; // 重置靠近状态，确保新一次握持的首帧会同步一次高亮
      // 帽未开：先不拔帽也不拖拽，仅记录起点，松开判定为「拔帽」
      if (isCapOff()) {
        this._firebrandDragging = true;
        firebrand.classList.add('dragging');
      }
    };
    /**
     * 应用一次拖拽位移（rAF 中每帧最多执行一次）。
     * 靠近判定走纯算术（_tryLight），不读布局；near 高亮类只在状态翻转时写一次，
     * 避免高刷屏下每次 mousemove 都产生无意义的 class 写入。
     */
    const applyMove = (dx, dy) => {
      // 拖拽中保持拔帽后的 45° 斜举（translate 会覆盖 CSS transform，故此处显式带 rotate）
      // 注：不限制拖拽范围，火折子可自由拖动画面；溢出由 CSS overflow-x:clip 裁切，
      // 且不创建滚动容器（详见 base.css 中 .scroll-left/.scroll-body/.scroll-screen 注释）。
      firebrand.style.transform = `translate(${dx}px, ${dy}px) rotate(-45deg)`;
      // 本次握持已触发点燃/吹熄：继续保持跟随，但不再重复触发（由 onUp 松手归位）
      if (this._litHoldActive) return;
      // 记录位移，供松手时 onUp 复算判定，同样无需读布局
      this._lastDx = dx;
      this._lastDy = dy;
      const near = this._tryLight(dx, dy);
      const incense = this._incenseEl;
      if (near) {
        // 靠近即点燃/吹熄（无需等到松手）。near 高亮不保留，避免与点燃瞬间的高亮叠加。
        this._applyFirebrandTouch(incense, firebrand);
        this._litHoldActive = true;
        return;
      }
      // 未靠近：仅在状态由「近」翻转为「远」时清一次高亮，之后不再写 DOM
      if (this._lastNear !== false) {
        this._lastNear = false;
        firebrand.classList.remove('near');
        if (incense) incense.classList.remove('near');
      }
    };
    const onMove = (e) => {
      if (!isCapOff() || !this._firebrandDragging) return;
      const p = this._pointer(e);
      this._pendingDx = p.clientX - this._dragOrigin.x - this._dragOffset.x;
      this._pendingDy = p.clientY - this._dragOrigin.y - this._dragOffset.y;
      // rAF 合并：mousemove 可能远超 60Hz，一帧内多次事件只应用最后一次位移
      if (this._moveRaf) return;
      this._moveRaf = requestAnimationFrame(() => {
        this._moveRaf = 0;
        applyMove(this._pendingDx, this._pendingDy);
      });
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
        this._playCapSound('close');
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
    // 保存 document 级监听引用，供 unmount() 精确解绑（否则视图关闭后残留）
    this._onFirebrandMove = onMove;
    this._onFirebrandUp = onUp;
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

  /**
   * 提前在用户手势（按下火折子）内创建并恢复音频上下文。
   * 关键：点燃/吹熄是在 mousemove/touchmove 中触发的，而移动事件不属于"用户手势"，
   * 浏览器自动播放策略会拒绝在非手势内 resume 上下文 → 静音。故在按下（mousedown）时
   * 就激活上下文，保证随后拖动靠近香头时的点燃/吹熄也能正常出声。
   */
  _ensureAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      if (this._audioCtx.state === 'suspended') { try { this._audioCtx.resume(); } catch (_) { /* 忽略 */ } }
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /**
   * 火折子音效（Web Audio 轻量合成，无需外部音频文件）。
   *  - open   拔帽：清脆竹木"嗒" + 火绒露出的高频气流"嘶"
   *  - close  盖回：略闷的木"嗒"
   *  - ignite 点香：极轻的引燃"噗/嘶"（火苗窜起），比拔帽更柔更短、不打断专注
   *  - blow   吹熄：柔和的"呼"气流声（呼气渐弱），比点燃稍长
   * 均在用户手势内触发：拔帽已建立/resume 音频上下文；点燃/吹熄因前置必拔帽，上下文已 running。
   * @param {'open'|'close'|'ignite'|'blow'} kind
   */
  _playCapSound(kind) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* 忽略 */ } }
      const now = ctx.currentTime;
      const isOpen = kind === 'open';
      const isClose = kind === 'close';

      // 木质"嗒"（拔帽/盖回）：triangle 频率下滑 + 指数衰减包络
      if (isOpen || isClose) {
        const dur = isOpen ? 0.14 : 0.11;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(isOpen ? 0.45 : 0.32, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        gain.connect(ctx.destination);
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        const f0 = isOpen ? 420 : 300;
        osc.frequency.setValueAtTime(f0, now);
        osc.frequency.exponentialRampToValueAtTime(f0 * 0.55, now + dur);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + dur);
      }

      // 拔帽：火绒露出的高频气流"嘶"
      if (isOpen) this._noisePuff(ctx, now, { dur: 0.09, freq: 2600, q: 0.8, peak: 0.18 });

      // 点香：极轻的引燃"噗/嘶"（火苗窜起）——低频闷"噗" + 中高频"嘶"
      if (kind === 'ignite') {
        const pg = ctx.createGain();
        pg.gain.setValueAtTime(0.0001, now);
        pg.gain.exponentialRampToValueAtTime(0.28, now + 0.01);
        pg.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);
        pg.connect(ctx.destination);
        const po = ctx.createOscillator();
        po.type = 'triangle';
        po.frequency.setValueAtTime(170, now);
        po.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        po.connect(pg);
        po.start(now); po.stop(now + 0.1);
        this._noisePuff(ctx, now, { dur: 0.18, freq: 2200, q: 0.7, peak: 0.24 });
      }

      // 吹熄：柔和的"呼"气流声（呼气渐弱，比点燃稍长）。用中频带通保留"气感"，
      // 避免纯 lowpass 在小型扬声器上发闷听不清；再叠一层极弱低频"噗"让吹灭更实。
      if (kind === 'blow') {
        this._noisePuff(ctx, now, { dur: 0.46, freq: 1300, q: 0.5, peak: 0.58, type: 'bandpass', sweep: true });
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.0001, now);
        bg.gain.exponentialRampToValueAtTime(0.26, now + 0.01);
        bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        bg.connect(ctx.destination);
        const bo = ctx.createOscillator();
        bo.type = 'sine';
        bo.frequency.setValueAtTime(140, now);
        bo.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        bo.connect(bg);
        bo.start(now); bo.stop(now + 0.12);
      }

      // 掐灭线香（单击暂停）：极轻柔的"噗"（火星捏灭），比吹熄更短更轻
      if (kind === 'pinch') {
        this._noisePuff(ctx, now, { dur: 0.16, freq: 700, q: 0.6, peak: 0.26, type: 'bandpass' });
        const pg2 = ctx.createGain();
        pg2.gain.setValueAtTime(0.0001, now);
        pg2.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
        pg2.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        pg2.connect(ctx.destination);
        const po2 = ctx.createOscillator();
        po2.type = 'sine';
        po2.frequency.setValueAtTime(150, now);
        po2.frequency.exponentialRampToValueAtTime(90, now + 0.1);
        po2.connect(pg2);
        po2.start(now); po2.stop(now + 0.1);
      }

      // 化雁：缥缈的远空雁鸣（基频+五度轻颤、整体高→低滑落）+ 极轻风声，克制不扰专注
      if (kind === 'goose') {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.13, now + 0.07);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        g.connect(ctx.destination);
        const fund = 880;
        [fund, fund * 1.5].forEach((f, i) => {
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.setValueAtTime(f * 1.06, now);
          o.frequency.exponentialRampToValueAtTime(f * 0.8, now + 0.55); // 高→低滑落，似远处雁鸣收尾
          // 轻颤音（vibrato）
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 5.5;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = f * 0.012;
          lfo.connect(lfoGain); lfoGain.connect(o.frequency);
          const og = ctx.createGain();
          og.gain.value = i === 0 ? 1 : 0.45; // 五度弱一些
          o.connect(og); og.connect(g);
          o.start(now); o.stop(now + 0.58);
          lfo.start(now); lfo.stop(now + 0.58);
        });
        // 极轻风声（雁翅掠风）
        this._noisePuff(ctx, now, { dur: 0.42, freq: 1150, q: 0.6, peak: 0.05, type: 'bandpass', sweep: true });
      }

      // 切换香插：清脆悦耳的瓷磬/玉击声（基频 + 高八度泛音，短促柔衰减），与器物转动同步
      if (kind === 'censer') {
        const make = (freq, peak, delay) => {
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, now + delay);
          g.gain.exponentialRampToValueAtTime(peak, now + delay + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.4);
          g.connect(ctx.destination);
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + delay);
          o.frequency.exponentialRampToValueAtTime(freq * 0.985, now + delay + 0.4); // 极微下滑，似玉磬余韵
          o.connect(g);
          o.start(now + delay); o.stop(now + delay + 0.42);
        };
        make(1320, 0.2, 0);        // 主音：清亮"叮"
        make(2640, 0.07, 0.01);    // 高八度泛音，极轻，添"瓷光"质感
      }
    } catch (_) { /* 音频不可用时静默，不影响交互 */ }
  },

  /**
   * 生成一段带包络的滤波噪声脉冲（火绒"嘶"、引燃"噗"、吹熄"呼"共用）。
   * @param {AudioContext} ctx
   * @param {number} now 起始时间(ctx.currentTime)
   * @param {object} o {dur, freq, q, peak, type, sweep}
   */
  _noisePuff(ctx, now, o) {
    const dur = o.dur || 0.1;
    const freq = o.freq || 2400;
    const q = o.q || 0.8;
    const peak = o.peak || 0.15;
    const type = o.type || 'bandpass';
    const nBuf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * dur)), ctx.sampleRate);
    const data = nBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * env * env; // 噪声 × 二次衰减包络
    }
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = nBuf;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(freq, now);
    if (o.sweep) filt.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 0.4), now + dur);
    filt.Q.value = q;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.exponentialRampToValueAtTime(peak, now + (o.sweep ? 0.06 : 0.012));
    ng.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    nSrc.connect(filt); filt.connect(ng); ng.connect(ctx.destination);
    nSrc.start(now);
    nSrc.stop(now + dur);
  },

  /** 火折子归位：清除拖拽位移/状态类，回到初始位置（松手时调用）。
   *  注意：不摘除 cap-off —— 归位只让火折子回到原位，不把帽子盖回；
   *  盖回帽子由「已开帽轻点」分支（用户明确意图）负责。否则点燃后松手会被误盖回，
   *  导致之后无法再点燃/吹熄（_tryLight 要求 cap-off），吹熄声永远不触发。
   *  归位用无过冲缓动滑回：base 的弹性 bezier(0.34,1.56,...) 在大位移时会过冲约 56%，
   *  拖得越远松手越像"窜过头再弹回"的跳动，故此处用独立 ease-out 过渡覆盖它。 */
  _releaseFirebrand(firebrand) {
    if (!firebrand) return;
    // 本次握持点着过香（_litThisHold）→ 松手归位自动盖回竹帽（熄灭火折子火焰），线香继续燃；
    // 未点着（或本次握持是吹熄）则保持拔帽，方便再次点燃。仅"本次握持点过香"才盖帽，
    // 与 _litTriggered（香是否在燃）解耦，避免吹熄/重置把标记清零而导致松手不盖帽。
    const wasLit = this._litThisHold;
    firebrand.style.transition = 'transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)';
    firebrand.style.transform = '';
    firebrand.classList.remove('dragging', 'near', 'lit');
    if (wasLit) {
      firebrand.classList.remove('cap-off');   // 盖回竹帽
      this._playCapSound('close');             // 与拔帽对称的"盖回"声
      this._litThisHold = false;               // 盖帽后核销本次握持标记
    }
    // 过渡结束后移除内联 transition，恢复 base 规则，确保下次拖拽仍跟手（不被缓动拖慢）
    clearTimeout(firebrand._relTid);
    firebrand._relTid = setTimeout(() => { if (firebrand) firebrand.style.transition = ''; }, 340);
  },

  /**
   * 点燃 / 重新引燃：大火光(lighting) → 微光闪烁(glowing) → 静态暗红余烬(is-lit)，青烟全程持续。
   * 由火折子靠近香头调用（_applyFirebrandTouch）。已燃的香再次靠近会重放引燃脉冲（不重开计时）。
   */
  _ignite(incense, firebrand) {
    // 火折子只做点燃：_litTriggered 表示香是否已在燃——
    // 在燃则本次为「重新引燃」（重放引燃脉冲，不重开计时）；不在燃则正常点燃。
    const alreadyLit = this._litTriggered;
    if (!(this._remaining > 0)) this._remaining = this._durationMs;
    this._litTriggered = true;
    this._litThisHold = true;   // 本次握持确实点着了香 → 松手应盖帽
    this._playCapSound('ignite');
    // 先进入「引燃」阶段：火苗由大收敛吻上香头、余烬由小点亮（#6 衔接），青烟渐显
    incense.classList.add('is-lit', 'kissing');
    if (!alreadyLit) this._startTimer();   // 已在燃则计时继续跑，不重开
    // 点燃后火折子不立即归位：留在用户手中继续跟随，待松手(onUp)才回原位
    // （不再加 .lit 类——该类会让火折子 opacity:0 隐藏，与"留在手中"需求冲突）
    incense.classList.remove('near');

    // 重排引燃/重燃动画：清掉上一次可能未到期的回调，避免与本次脉冲打架
    if (this._lightTimers) this._lightTimers.forEach(clearTimeout);
    this._lightTimers = [];
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
   * 火折子只负责「点燃」：暂停中的香 → 续燃；未燃 / 已燃 → 点燃 / 重新引燃。
   * 吹熄不再由火折子承担（改由单击线香掐灭、右键香插重置计时、或自然燃尽）。
   */
  _applyFirebrandTouch(incense, firebrand) {
    if (!incense) return;
    if (incense.classList.contains('paused')) this._resumeBurning();
    else this._ignite(incense, firebrand);
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
    // 缓存容器与两层 SVG 引用：切换款式时不再反复 querySelector
    if (!this._censerEl || !this._censerEl.isConnected) {
      this._censerEl = this._el.querySelector('.scroll-censer');
      this._svgBack = this._censerEl && this._censerEl.querySelector('.scroll-censer-svg-back');
      this._svgFront = this._censerEl && this._censerEl.querySelector('.scroll-censer-svg-front');
    }
    const censer = this._censerEl;
    if (!censer) return;
    const style = this._censerStyleObj();
    // 仅移除上一个款式的 class，省去每次切换遍历全部款式
    if (this._lastCenserKey && this._lastCenserKey !== style.key) {
      censer.classList.remove(`cs-${this._lastCenserKey}`);
    }
    censer.classList.add(`cs-${style.key}`);
    this._lastCenserKey = style.key;
    const { back, front } = censerSvg(style.key);
    if (this._svgBack) this._svgBack.innerHTML = back;
    if (this._svgFront) this._svgFront.innerHTML = front;
  },

  /**
   * 线香交互：燃烧中点一下线香（香身 / 香头 / 青烟，除香插外）→ 掐灭火星、暂停计时。
   * 再次引燃只能用火折子（本处不续燃）。未点燃态点击无动作。
   * 香插区域由自身监听处理（左键切换 / 右键重置），此处排除以免双重触发。
   */
  _bindIncensePinch() {
    const incense = this._incenseEl;
    if (!incense) return;
    incense.addEventListener('click', (e) => {
      const t = e.target;
      if (t instanceof Element && t.closest('.scroll-censer')) return; // 交给香插自身
      if (this._firebrandDragging) return;
      if (Date.now() - (this._lastDragEnd || 0) < 80) return;
      // 燃烧中点线香 → 掐灭火星、暂停计时；再次引燃只能用火折子（此处不续燃）
      if (incense.classList.contains('is-lit') && !incense.classList.contains('paused')) {
        this._playCapSound('pinch');
        this._pauseBurning();
      }
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
    // 切换款式时轻响一声（瓷器轻碰 / 玉磬），与器物转动同步；首次渲染(animate=false)静音
    this._playCapSound('censer');
    // 重启动画：先移除再强制回流，故无需在动画结束后清理 class
    const censer = this._el.querySelector('.scroll-censer');
    if (!censer) return;
    censer.classList.remove('turn-in');
    void censer.offsetWidth;
    censer.classList.add('turn-in');
  },

  /**
   * 香插本体交互：左键单击 = 立即循环切换款式（跟手，且仅切换款式，绝不触碰线香计时）。
   * 重置计时（重新开始一炷香）改由右键触发，与「连续单击切换」解耦，避免误把线香烧停。
   * 键盘 Enter/Space = 切换。
   */
  _bindCenserInteractions() {
    const censer = this._el && this._el.querySelector('.scroll-censer');
    if (!censer) return;

    // 左键单击：纯切换款式，不暂停 / 不重置线香燃烧
    censer.addEventListener('click', (e) => {
      e.stopPropagation();   // 阻断冒泡到线香的 click 监听，避免误触发掐灭暂停
      if (this._firebrandDragging) return;
      if (Date.now() - (this._lastDragEnd || 0) < 80) return;
      this._stepCenserStyle(1);
    });
    // 右键香插 = 重置计时（重新开始一炷香）。阻止原生菜单；与火折子右键（香炉选单）区域不同、互不冲突。
    censer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this._resetTimer();
    });
    // 键盘可达性：role=button，Enter / Space 触发切换
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
};

window.IncenseFeature = IncenseFeature;
