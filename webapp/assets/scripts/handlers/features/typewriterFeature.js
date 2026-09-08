/**
 * typewriterFeature.js — 画中卷·复古寻呼机打字应用
 * （视觉移植自 v0「Vintage Pager」的 Motorola Beeper：绿壳 + 黑屏荧光绿 + 橙钮）
 *
 * 作为「画中卷」容器（ScrollManager）注册的独立功能挂载。自包含：
 * 拥有独立 DOM 与全部交互（黑屏荧光绿输入 → 点 PRINT → 生成纸条卡片 →
 * 逐字打出 → 卡片拖拽）。
 *
 * 交互：
 *  - 绿色外壳寻呼机（#8cc63f）+ 近黑屏幕（#0a1205）+ 荧光绿文字（#33ff00）；
 *  - 圆形黑键（相机/字体切换/清除）+ 橙色 PRINT 大钮 + MOTOROLA 品牌标；
 *  - 输入文字 → 点 PRINT（或 Ctrl/Cmd+Enter）→ 画布生成一张米白纸条；
 *  - 卡片逐字缓慢打出（50ms），带脉冲光标；可拖拽到任意位置；可移除。
 *
 * 持久化：写好的便签经 bridge → VaultStorage 落盘到 vault（独立 typewriter-notes.json），
 * 下次打开画中卷自动重建（直接显示全文，不重放打字动画），最多保留 NOTE_CAP 张。
 *
 * 隐私兼容：工作台根 class 为 .scroll-workbench，PrivacyMode.markText 会照常补打
 * data-private-text，进而被 base.css 隐私模糊规则命中（纳入模糊）。
 */

// 存储契约收敛到 TypewriterStore（schema/版本/校验/备份/读后写，绕开只认数组的专用方法）
import { TypewriterStore } from '../../services/TypewriterStore.js';

// —— 内联单色 SVG 图标（stroke=currentColor，跟随按钮配色） ——
// 便签样式切换：层叠纸张，表达「多种纸样循环」
const ICON_LAYERS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/></svg>`;
const ICON_FONT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M12 6v13"/></svg>`;
const ICON_TRASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>`;
const ICON_PRINT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2"/><path d="M4 14h16"/><path d="M9 9V4h6v5"/></svg>`;
const ICON_X = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
// —— 外围工具条图标：统一 24 视框 + 1.5 描边 ——
// 不用 A− / A+ 这类文本字符当控件：字体渲染在不同系统下基线、字重、符号长度都不同，
// 是廉价感的主要来源。全部换成统一几何的 SVG，小尺寸下的细描边也更精致。
const ICON_FONT_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 7.6 5.5 11.2 16"/><path d="M5.4 12h4.4"/><path d="M17.5 7.5v7"/><path d="m14.8 12.2 2.7 2.7 2.7-2.7"/></svg>`;
const ICON_FONT_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 7.6 5.5 11.2 16"/><path d="M5.4 12h4.4"/><path d="M17.5 15.5v-7"/><path d="m14.8 11.2 2.7-2.7 2.7 2.7"/></svg>`;
// 缩放用放大镜 +/−：业界「zoom」通用符号，与字号 A↓/A↑ 区分清晰
const ICON_ZOOM_OUT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.2" y1="15.2" x2="20" y2="20"/><line x1="7.5" y1="10.5" x2="13.5" y2="10.5"/></svg>`;
const ICON_ZOOM_IN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.2" y1="15.2" x2="20" y2="20"/><line x1="10.5" y1="7.5" x2="10.5" y2="13.5"/><line x1="7.5" y1="10.5" x2="13.5" y2="10.5"/></svg>`;
// 切换便签样式：扁平「叠纸」，与工具条其它图标同一语言（线性、stroke 1.5）。
// 不用寻呼机上的 ICON_LAYERS：那是等轴测 3D 造型且描边 2.0，
// 是为大圆钮设计的，放进 1.5 描边的线性工具条里会明显更重、不成系统。
const ICON_PAPER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3.5" width="11" height="11" rx="2"/><path d="M15 8.5H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7"/></svg>`;

// 编辑：双击便签进入编辑（见 _bindEdit），工具条不再放铅笔按钮

// 旋转：环形回带箭头，表达「可绕中心转」
const ICON_ROTATE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="m21 4-4 1.6L19.5 9"/></svg>`;
// 连线：链条，表达「与另一张便签建立关联」
const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 17H7a5 5 0 0 1 0-10h2.5"/><path d="M14.5 7H17a5 5 0 0 1 0 10h-2.5"/><path d="M8 12h8"/></svg>`;

// 吐纸位叠放：新纸一律落在出纸口正上方，只做小幅纵向错位，像纸一张张叠出来。
// 每档 24px、共 6 档，整叠以吐纸位为中心上下各展 60px，避免单向漂移顶出画布。
const STACK_STEP = 24;     // 每张新纸相对上一张的上移错位量(px)
const STACK_LEVELS = 6;    // 叠放档位数：超过后回到最底层重新叠
const TYPE_SPEED = 50;   // 每字间隔(ms)：缓慢打出的节奏（对齐 pager 原版）
const MAX_LEN = 500;     // 单卡最大字数
const NOTE_CAP = 50;     // 便签上限：防 vault 文件无限膨胀（超出删最早）
const SAVE_DEBOUNCE = 350; // 写盘防抖(ms)，合并拖拽/删除等连续操作
// 手动缩放范围：0.6x（约 180px 宽的小签）~ 2.4x（铺满画布的大签）
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.08;  // ⌘/Ctrl+滚轮 每格步进（乘性，手感均匀）
// 字级档位：离散而非连续 —— 中文排版对字号容错很窄，任意值容易破坏版式。
// 只作用于文字（--tw-text-zoom），与整张便签等比缩放的 ZOOM 正交叠加。
// 以「标准」为中心、约 1.18 倍等比递进：向下 3 档、向上 4 档，
// 足以覆盖「小纸写一句话用大字」到「大纸贴长文用小字」两种反向需求。
const FONT_SCALES = [0.6, 0.72, 0.85, 1, 1.18, 1.4, 1.65, 1.95];
const FONT_SCALE_DEFAULT_IDX = 3;
const FONT_SCALE_LABELS = [
  '极小 60%', '很小 72%', '偏小 85%',
  '标准 100%',
  '偏大 118%', '很大 140%', '特大 165%', '超大 195%',
];
// 便签尺寸档位（整张纸等比）：右下角手柄仍是连续拖拽，这里是离散快捷入口，
// 两者共用同一个 zoom 值 —— 拖出来的任意尺寸不会被档位「吸附」掉。
const CARD_SCALES = [0.7, 1, 1.35, 1.8];
const CARD_SCALE_LABELS = ['S 小', 'M 标准', 'L 大', 'XL 特大'];
const CARD_SCALE_DEFAULT_IDX = 1;

const FONTS = ["classic", "modern", "kai"];
const FONT_LABELS = { classic: "宋 A", modern: "黑 B", kai: "楷 C" };
const FONT_FEEDBACK = { classic: "SERIF 宋体", modern: "SANS 黑体", kai: "KAI 楷体" };

// 便签纸张样式：与 base.css 的 .tw-card[data-paper="x"] 一一对应。
// 新增一种纸 = 这里加一项 + CSS 加一条同名的 [data-paper] 规则。
const PAPERS = ["plain", "night", "zhuye", "shuyan", "redsilk", "ruoshui", "tengyun", "juhuo", "yingyue"];
const PAPER_LABELS = { plain: "素笺", night: "夜光", zhuye: "竹叶", shuyan: "书燕", redsilk: "红绸", ruoshui: "若水", tengyun: "腾云", juhuo: "举火", yingyue: "映月" };
const PAPER_FEEDBACK = { plain: "素笺 PLAIN", night: "夜光 NIGHT", zhuye: "竹叶 ZHUYE", shuyan: "书燕 SHUYAN", redsilk: "红绸 REDSILK", ruoshui: "若水 RUOSHUI", tengyun: "腾云 TENGYUN", juhuo: "举火 JUHUO", yingyue: "映月 YINGYUE" };
// 卡片抬头随纸样变化，增强「换了台不同的打印机」的代入感
const PAPER_TITLES = { plain: "Bamboo Immortals", night: "Bamboo Immortals", zhuye: "BAMBOO IMMORTALS", shuyan: "BAMBOO IMMORTALS", redsilk: "BAMBOO IMMORTALS", ruoshui: "BAMBOO IMMORTALS", tengyun: "BAMBOO IMMORTALS", juhuo: "BAMBOO IMMORTALS", yingyue: "BAMBOO IMMORTALS" };

export const TypewriterFeature = {
  _el: null,
  _canvas: null,
  _input: null,
  _case: null,
  _timers: [],           // 所有卡片打字计时器，供 unmount 精确清理
  _zTop: 10,
  _spawnIdx: 0,
  _fontIdx: 0,
  _paperIdx: 0,
  _msgTimer: null,
  _saveTimer: null,      // 写盘防抖计时器
  _restored: false,      // 防重复加载：mount 一次只读盘一次
  _fitDone: false,       // 恢复后是否已做过「把便签带进视野」自检（每次 mount 重置）
  _fitRo: null,          // 画布尚未布局时，用于延迟自检的一次性 ResizeObserver
  _audioCtx: null,       // 吐纸音效的 Web Audio 上下文（轻量合成，无需外部音频文件）
  _links: [],            // 便签连线：[{from,to}] 便签 id 对（端点坐标实时算，不入档）
  _linkSvg: null,        // 连线 SVG 层（画布坐标系，随画布平移自动跟随）
  _linkRaf: 0,           // 重绘节流（拖动/旋转/缩放时合并为每帧一次）
  _linkRo: null,         // 观察卡片尺寸变化 → 自动重绘连线
  _dragLink: null,       // 正在拖拽的临时连线 {fromId, temp}
  _hoverLink: null,      // 当前悬浮的连线 {from,to}（用于在其上挂控件）
  _hoverTimer: null,     // 收起悬浮控件的防抖
  _ctlHover: false,      // 指针是否停在连线的控件上（是则不收起）

  /** 接入画中卷功能舞台 */
  async mount(stageEl) {
    if (this._el) return;
    this._ensureDom(stageEl);
    this._makeCanvasDraggable();
    this._bindInput();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    // 对齐原版：打开即聚焦输入框，便于直接键入
    if (this._input) this._input.focus();
    // 异步加载已保存便签并重建（直接显示全文，不重放动画）
    await this._restore();
  },

  /** 退出：清理全部打字计时器与 DOM 监听，释放引用 */
  unmount() {
    this._timers.forEach((t) => { try { clearInterval(t); } catch (_) { /* 忽略 */ } });
    this._timers = [];
    if (this._msgTimer) { try { clearTimeout(this._msgTimer); } catch (_) { /* 忽略 */ } this._msgTimer = null; }
    // 【P0】退出前无条件落盘一次（fire-and-forget：宿主仍在，bridge 可用）。
    // 原先只在 _saveTimer 存在时才写，若用户恰好在打字动画途中关闭/切走视图，
    // 这张便签可能从未排过保存 → 静默丢失。此处统一兜底（配合 pendingText 拿到全文）。
    if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
    this._saveNow();
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._el = null;
    this._canvas = null;
    this._input = null;
    this._case = null;
    this._tip = null;
    this._tipEl = null;
    this._zTop = 10;
    this._spawnIdx = 0;
    this._fontIdx = 0;
    this._paperIdx = 0;
    this._restored = false;
    if (this._audioCtx) { try { this._audioCtx.close(); } catch (_) { /* 忽略 */ } this._audioCtx = null; }
    if (this._linkRo) { this._linkRo.disconnect(); this._linkRo = null; }
    if (this._fitRo) { this._fitRo.disconnect(); this._fitRo = null; }
    this._fitDone = false;
    if (this._linkRaf) { cancelAnimationFrame(this._linkRaf); this._linkRaf = 0; }
    this._linkSvg = null;
    this._links = [];
    this._dragLink = null;
    clearTimeout(this._hoverTimer);
    this._hoverTimer = null;
    this._hoverLink = null;
    this._ctlHover = false;
  },

  _ensureDom(stageEl) {
    if (this._el) return;
    const wrap = document.createElement('div');
    wrap.className = 'scroll-typewriter-feature';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', '复古寻呼机打字');

    wrap.innerHTML = `
      <div class="tw-canvas" id="twCanvas" role="region" aria-label="卡片画布"></div>

      <div class="tw-beeper">
        <div class="tw-case">
          <div class="tw-case-label">
            <span class="tw-dot"></span><span class="tw-brand">竹林中国</span>
            <span class="tw-case-right">BAMBOO IMMORTALS</span>
          </div>

          <div class="tw-screen">
            <div class="tw-screen-glare" aria-hidden="true"></div>
            <div class="tw-screen-top">
              <span>凝墨成笺</span>
              <span class="tw-screen-font">FONT: <b id="twFontLabel">${FONT_LABELS.classic}</b> · <b id="twPaperLabel">${PAPER_LABELS.plain}</b></span>
            </div>
            <div class="tw-screen-input-wrap">
              <div class="tw-screen-msg" id="twScreenMsg"></div>
              <textarea class="tw-input" id="twInput" maxlength="${MAX_LEN}" placeholder="输入文字打印便签..." spellcheck="false" aria-label="输入文字打印便签"></textarea>
              <span class="tw-cursor" id="twCursor" aria-hidden="true"></span>
            </div>
          </div>

          <div class="tw-controls">
            <div class="tw-keys-left">
              <button type="button" class="tw-rbtn" id="twPaper" title="切换便签样式" aria-label="切换便签样式">${ICON_LAYERS}</button>
              <button type="button" class="tw-rbtn" id="twFont" title="切换字体" aria-label="切换字体">${ICON_FONT}</button>
              <button type="button" class="tw-rbtn" id="twClear" title="清除" aria-label="清除">${ICON_TRASH}</button>
            </div>
            <div class="tw-grill" aria-hidden="true"><i></i><i></i><i></i></div>
            <button type="button" class="tw-print" id="twPrint" title="打印" aria-label="打印">${ICON_PRINT}</button>
          </div>
        </div>
        <div class="tw-desk-shadow" aria-hidden="true"></div>
      </div>`;

    stageEl.appendChild(wrap);
    this._el = wrap;
    this._canvas = wrap.querySelector('.tw-canvas');
    this._input = wrap.querySelector('.tw-input');
    this._case = wrap.querySelector('.tw-case');
    // 点画布空白处取消钉住（工具条收起）；点在便签上由各自的拖拽逻辑处理
    this._canvas.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tw-card')) return;
      this._pinOnly(null);
      this._exitAllEdits(); // 点空白：退出正在编辑的便签并落盘
    });
    this._observeScale();
  },

  /** 以设备实际渲染宽度驱动 .tw-case 根字号，实现「单一根字号 + em」连续流式缩放。
      不依赖 cqi（当前 Electron 不支持），改用 ResizeObserver 直接量取侧栏真实宽度，兼容性最稳；
      内部所有尺寸已是 em，根字号一变，整台机器等比缩放，永不溢出。 */
  _observeScale() {
    const DESIGN = 420;    // 设计稿设备宽度（max-width）
    const BASE = 14.5;     // 设计稿机身根字号(px)
    const BTN_BASE = 28;   // 设计稿按钮根字号(px)：球体按钮需要比机身字号大得多
    // 整机缩放下限提到 0.75：CSS 用 max() 兜底字号下限（保 12px 可读），
    // 但卡片整体不应再继续缩到比 0.75x 更小（约 315px），
    // 否则布局/留白比例失衡（字号不缩但卡片缩 → 文字撑满）。
    const MIN = 0.75;
    const MAX = 1;         // 上限即设计稿
    const apply = () => {
      if (!this._case || !this._case.isConnected) {
        if (this._ro) this._ro.disconnect();
        return;
      }
      const w = this._case.getBoundingClientRect().width;
      if (!w) return;
      const scale = Math.min(MAX, Math.max(MIN, w / DESIGN));
      const caseFontPx = BASE * scale;
      const btnPx = BTN_BASE * scale;
      this._case.style.fontSize = caseFontPx.toFixed(2) + 'px';
      // 把缩放比写进 --tw-scale，供其余 em 尺寸跟随（本环境不支持 cqi）。
      // 同时写到包裹层 this._el：卡片画布 .tw-canvas 是 .tw-case 的兄弟节点，
      // 不继承 case 上的变量，必须让根层也持有 --tw-scale，卡片字号才能跟随机身缩放。
      this._case.style.setProperty('--tw-scale', scale.toFixed(3));
      this._el.style.setProperty('--tw-scale', scale.toFixed(3));
      // 窄栏正方形构图：量得机身宽度 ≤400px 时切换（本环境不支持 @container，用 class 触发）
      this._case.classList.toggle('tw-square', w <= 400);
      // 直接给按钮写像素尺寸/字号（inline 优先级最高），彻底绕开 <button> 不继承字号、
      // 以及 calc(var()) 在本环境可能的兼容问题——按钮独立字号，保证球体有足够尺寸呈现光影
      const rbtns = Array.from(this._case.querySelectorAll('.tw-rbtn'));
      rbtns.forEach((b) => {
        b.style.width = (btnPx * 1.07).toFixed(2) + 'px';
        b.style.height = (btnPx * 1.07).toFixed(2) + 'px';
        b.style.fontSize = btnPx.toFixed(2) + 'px';
      });
      const printBtn = this._case.querySelector('.tw-print');
      if (printBtn) {
        printBtn.style.width = (btnPx * 1.07).toFixed(2) + 'px';
        printBtn.style.height = (btnPx * 1.07).toFixed(2) + 'px';
        printBtn.style.fontSize = btnPx.toFixed(2) + 'px';
      }
      // 卡片悬浮工具条按钮/图标同样内联像素，绕开 calc(var()) 在本环境的兼容问题
      // （与设备圆钮同策略）：否则 --tw-tools-size 整体失效 → 按钮 width 退回 auto、
      // SVG 拿不到 --tw-tools-icon，相邻图标间距/点击区会被撑乱。
      const toolBtns = this._el.querySelectorAll('.tw-card-tools button');
      toolBtns.forEach((b) => {
        b.style.width = (20 * scale).toFixed(2) + 'px';
        b.style.height = (20 * scale).toFixed(2) + 'px';
      });
      const toolSvgs = this._el.querySelectorAll('.tw-card-tools svg');
      toolSvgs.forEach((s) => {
        s.style.width = (18 * scale).toFixed(2) + 'px';
        s.style.height = (18 * scale).toFixed(2) + 'px';
      });
    };
    apply();
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(apply);
      this._ro.observe(this._case);
    }
  },

  _bindInput() {
    const input = this._input;
    const cursor = this._el.querySelector('#twCursor');
    input.addEventListener('focus', () => cursor.classList.add('on'));
    input.addEventListener('blur', () => cursor.classList.remove('on'));

    const doPrint = () => this._spawn(input.value.trim());
    this._el.querySelector('#twPrint').addEventListener('click', doPrint);
    input.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        doPrint();
      }
    });

    // 字体切换：循环 classic/modern/kai，并更新屏幕 FONT 标签
    this._el.querySelector('#twFont').addEventListener('click', () => {
      this._fontIdx = (this._fontIdx + 1) % FONTS.length;
      const f = FONTS[this._fontIdx];
      this._el.querySelector('#twFontLabel').textContent = FONT_LABELS[f];
      this._showScreenMsg('FONT: ' + FONT_FEEDBACK[f], 1000);
    });

    // 清除输入
    this._el.querySelector('#twClear').addEventListener('click', () => {
      input.value = '';
      input.focus();
    });

    // 便签样式切换：循环全部 PAPERS（素笺/牛皮/夜光/朱砂），并更新屏幕 PAPER 标签。
    // 只影响「之后打印」的卡片，已生成的卡片保持其打印时的样式（各自 data-paper 固定）。
    this._el.querySelector('#twPaper').addEventListener('click', () => {
      this._paperIdx = (this._paperIdx + 1) % PAPERS.length;
      const p = PAPERS[this._paperIdx];
      this._el.querySelector('#twPaperLabel').textContent = PAPER_LABELS[p];
      this._showScreenMsg('PAPER: ' + PAPER_FEEDBACK[p], 1000);
    });
  },

  /** 屏幕系统消息浮层（TRANSMITTING / FONT 反馈） */
  _showScreenMsg(text, duration = 1400) {
    const msg = this._el.querySelector('#twScreenMsg');
    msg.textContent = text;
    msg.classList.add('on');
    if (this._msgTimer) clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(() => msg.classList.remove('on'), duration);
  },

  /** 构建一张卡片 DOM（不含定位与文本填充），绑定删除与拖拽。
   *  note: { id, font, paper, date } —— 数据属性写入 dataset 供落盘收集。 */
  _createCardEl(note) {
    const id = note.id || Math.random().toString(36).slice(2, 8).toUpperCase();
    const font = note.font || 'classic';
    const paper = note.paper || 'plain';
    const date = note.date || this._now();
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.setAttribute('role', 'note');
    card.dataset.id = id;
    card.dataset.font = font;
    card.dataset.paper = paper;
    card.dataset.date = date;
    // 手动缩放：读落盘值（旧数据无 zoom → 默认 1，观感与历史便签一致）
    this._applyZoom(card, note.zoom);
    this._applyRot(card, note.rot);
    card.innerHTML = `
      <div class="tw-card-edge tw-card-edge-top" aria-hidden="true"></div>
      <div class="tw-card-main">
        <div class="tw-card-noise" aria-hidden="true"></div>
        <div class="tw-card-head">
          <span class="tw-card-title">${PAPER_TITLES[paper] || PAPER_TITLES.plain}</span>
        </div>
        <div class="tw-card-meta">
          <span class="tw-card-date"></span>
        </div>
        <div class="tw-card-text"></div>
      </div>
      <div class="tw-card-edge tw-card-edge-bottom" aria-hidden="true"></div>
      <div class="tw-card-tools">
        <button type="button" class="tw-card-paper" aria-label="切换便签样式">${ICON_PAPER}</button>
        <button type="button" class="tw-card-font tw-card-font-down" aria-label="缩小字号">${ICON_FONT_DOWN}</button>
        <button type="button" class="tw-card-font tw-card-font-up" aria-label="放大字号">${ICON_FONT_UP}</button>
        <button type="button" class="tw-card-zoom-out" aria-label="缩小便签">${ICON_ZOOM_OUT}</button>
        <button type="button" class="tw-card-zoom-in" aria-label="放大便签">${ICON_ZOOM_IN}</button>
        <button type="button" class="tw-card-del" aria-label="移除卡片">${ICON_X}</button>
      </div>`;

    // 工具条按钮/图标内联像素尺寸（与 apply() 中同策略），新卡片立即定型，
    // 不依赖 CSS 的 calc(var()) 在本环境是否可靠。
    const _ctScale = parseFloat(this._el.style.getPropertyValue('--tw-scale')) || 1;
    card.querySelectorAll('.tw-card-tools button').forEach((b) => {
      b.style.width = (20 * _ctScale).toFixed(2) + 'px';
      b.style.height = (20 * _ctScale).toFixed(2) + 'px';
    });
    card.querySelectorAll('.tw-card-tools svg').forEach((s) => {
      s.style.width = (18 * _ctScale).toFixed(2) + 'px';
      s.style.height = (18 * _ctScale).toFixed(2) + 'px';
    });

    card.querySelector('.tw-card-date').textContent = date;

    // 纸样：写入抬头与按钮提示（显示当前纸样名）
    this._applyPaper(card, paper);
    // 字级档位：旧数据无 fontScale → 落到默认档（1.0）
    this._applyFontScale(card, this._fontIdxOf(note.fontScale, paper));
    this._bindFontSteps(card);
    this._bindZoomSteps(card);
    this._bindPaperSwitch(card);
    this._bindTools(card);
    this._bindTips(card);
    this._bindEdit(card);

    card.querySelector('.tw-card-del').addEventListener('click', (e) => {
      e.stopPropagation();
      this._removeLinksOf(card.dataset.id);   // 级联删掉与它相连的连线，避免悬空线
      card.remove();
      this._scheduleSave();
    });
    this._makeDraggable(card);
    this._makeResizable(card);
    this._makeRotatable(card);
    this._makeLinkable(card);
    this._watchCardSize(card);
    return card;
  },

  /** 生成一张纸条卡片：逐字打字 + 可拖拽 + 落盘 */
  _spawn(text) {
    if (!text) {
      if (typeof Toast !== 'undefined') Toast.showToast('请先输入文字', 'error');
      return;
    }
    this._showScreenMsg('TRANSMITTING...', 1500);
    // 吐纸音效（在用户手势内触发：点 PRINT / Cmd+Enter 已建立并 resume 音频上下文）
    this._ensureAudio();
    this._playFeedSound();
    const canvas = this._canvas;

    // 首次生成卡片时移除画布提示
    const hint = canvas.querySelector('.tw-canvas-hint');
    if (hint) hint.remove();

    const font = FONTS[this._fontIdx];
    const paper = PAPERS[this._paperIdx];
    const date = this._now();
    const card = this._createCardEl({ font, paper, date });

    // 以打字机（设备）中轴线为期望落点居中吐纸；垂直停在画布中央略偏上
    card.style.zIndex = String(++this._zTop);
    canvas.appendChild(card);
    const cr = canvas.getBoundingClientRect();
    const beeperEl = this._el.querySelector('.tw-beeper');
    const br = beeperEl.getBoundingClientRect();
    const deviceCenterX = br.left + br.width / 2 - cr.left;
    const cw = card.offsetWidth || 340;
    const ch = card.offsetHeight || 200;
    // 吐纸位叠放：新纸一律落在出纸口正上方（寻呼机中轴、画布中央略偏上），
    // 只逐张做小幅上错位 —— 像纸一张张叠出来，能看到下面还压着纸。
    // 刻意不做「互不重叠」的搬移：那样纸就不是从打印机吐出来的了，
    // 且画布下方紧邻机身（机身 z-index 30 > 便签 20），往下搬会被机身挡住。
    const stackIdx = this._spawnIdx++ % STACK_LEVELS;
    const stackOffset = ((STACK_LEVELS - 1) / 2 - stackIdx) * STACK_STEP;  // 新纸逐张上叠
    card.style.left = (deviceCenterX - cw / 2) + 'px';
    card.style.top = ((cr.height - ch) / 2 - 24 + stackOffset) + 'px';
    card.style.bottom = 'auto';

    // 吐纸入场：从打印口下方弹入就位（.tw-feed 关键帧在 base.css）。
    // 仅新打的便签挂此 class；_restore 重建历史便签不挂，故重开不重放动画。
    card.classList.add('tw-feed');
    card.addEventListener('animationend', () => card.classList.remove('tw-feed'), { once: true });

    const textEl = card.querySelector('.tw-card-text');
    textEl.classList.add('is-typing');

    // 【P0】落盘与打字动画解耦：把「目标全文」先写进 dataset.pendingText 并立刻排一次落盘，
    // 使便签在动画刚开始时就已经落盘（_collectNotes 优先读 pendingText）。
    // 否则若用户在打字途中关闭/切走视图，磁盘上根本没有这张便签 → 静默丢数据。
    card.dataset.pendingText = text;
    this._scheduleSave();

    // 逐字缓慢打出；打完即补齐全文并落盘
    let i = 0;
    const timer = setInterval(() => {
      if (i >= text.length) { this._finishTyping(card); return; }
      textEl.textContent += text[i++];
    }, TYPE_SPEED);
    card._typing = { timer, textEl, text };
    this._timers.push(timer);

    // 清空输入，便于连续生成
    this._input.value = '';
    this._input.focus();

    // 超出上限删最早（DOM 顺序即时间序），并在落盘时同步
    this._enforceCap();
  },

  /** 结束某张卡片的打字动画：停表、补齐全文、清 pendingText 并落盘。
   *  动画自然结束、或用户中途进入编辑时调用 —— 后者若不先补齐，
   *  逐字写入会持续覆写 contentEditable，光标被打飞、内容残缺。 */
  _finishTyping(card) {
    const t = card._typing;
    if (!t) return;
    card._typing = null;
    try { clearInterval(t.timer); } catch (_) { /* 忽略 */ }
    const k = this._timers.indexOf(t.timer);
    if (k >= 0) this._timers.splice(k, 1);
    t.textEl.textContent = t.text;          // 补齐全文，杜绝残留半截字
    t.textEl.classList.remove('is-typing');
    delete card.dataset.pendingText;        // 全文已进 DOM，之后以 DOM（可编辑）为准
    this._scheduleSave();
  },

  // —— 吐纸音效（Web Audio 轻量合成，无需外部音频文件，对齐 incense 火折子音效范式） ——
  /** 提前在用户手势（点 PRINT / Cmd+Enter）内创建并恢复音频上下文，
   *  保证随后的吐纸音效能正常出声（自动播放策略：非手势内 resume 会被拒绝 → 静音）。 */
  _ensureAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      if (this._audioCtx.state === 'suspended') { try { this._audioCtx.resume(); } catch (_) { /* 忽略 */ } }
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /** 吐纸音效：模拟齿轮棘轮逐齿送纸的"咔哒"——几声极轻的带通噪声脉冲 + 高频金属"哒"，
   *  末声稍重作"出纸落定"。整体增益很低（极轻），不打断打字专注。 */
  _playFeedSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* 忽略 */ } }
      const now = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.13;            // 整体增益（较明显但不刺耳）
      out.connect(ctx.destination);

      // 棘轮：4 齿轻咔 + 末声落定，间隔 ~70ms 似纸张被逐齿送出
      const teeth = 4;
      const gap = 0.07;
      for (let k = 0; k < teeth; k++) this._feedTick(ctx, out, now + k * gap, false);
      this._feedTick(ctx, out, now + teeth * gap + 0.05, true);
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /** 单声"咔"：极短带通噪声脉冲（机械感）叠一个高频方波"哒"（金属齿感）。
   *  @param {AudioContext} ctx
   *  @param {GainNode} dest 总输出增益
   *  @param {number} t 起始时间(ctx.currentTime 偏移)
   *  @param {boolean} settle 末声：更沉更重，作纸张送抵落定 */
  _feedTick(ctx, dest, t, settle) {
    const dur = settle ? 0.05 : 0.028;
    // 机械噪声脉冲（带通，短促）
    const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = settle ? 1500 : 2200;
    bp.Q.value = 7;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(settle ? 0.9 : 0.5, t + 0.002);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(ng); ng.connect(dest);
    src.start(t); src.stop(t + dur + 0.01);
    // 高频"哒"（齿轮金属齿感）
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(settle ? 2400 : 3000, t);
    osc.frequency.exponentialRampToValueAtTime(settle ? 1100 : 1500, t + dur);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(settle ? 0.22 : 0.12, t + 0.001);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(og); og.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.01);
  },

  /** 卡片拖拽：相对画布定位，限制在画布范围内；松手即落盘 */
  _makeDraggable(card) {
    const canvas = this._canvas;
    let dragging = false;
    let offX = 0;
    let offY = 0;
    let startX = 0;
    let startY = 0;
    let moved = false;   // 区分「轻点」与「拖动」：轻点 = 钉住外围工具条
    const onMove = (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) moved = true;
      // 无限画布：坐标相对 .tw-canvas（含其 transform 平移），不 clamp，
      // 便签可拖到画布任意远处；画布本身可平移来查看（见 _makeCanvasDraggable）
      const root = canvas;
      const cr = root.getBoundingClientRect();
      const cRect = card.getBoundingClientRect();
      const cw = cRect.width;
      const ch = cRect.height;
      let x = e.clientX - cr.left - offX;
      let y = e.clientY - cr.top - offY;
      card.style.left = x + 'px';
      card.style.top = y + 'px';
      this._scheduleRenderLinks();   // 便签移动，连线端点跟随
    };
    const onUp = () => {
      dragging = false;
      card.classList.remove('dragging');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (moved) this._scheduleSave();  // 真拖动才落盘
      else this._pinOnly(card);         // 轻点：钉住工具条（触屏无 hover 时的入口）
    };
    const onDown = (e) => {
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link')) return; // 删除/字级/缩放/连线锚点不触发拖拽
      // 编辑态下点在文本区不拖拽（让浏览器处理选字/光标）；点标题或纸边仍可移动便签
      if (card.classList.contains('editing') && e.target.closest('.tw-card-text')) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = card.getBoundingClientRect();
      offX = e.clientX - rect.left;
      offY = e.clientY - rect.top;
      card.classList.add('dragging');
      card.style.zIndex = String(++this._zTop);
      // 拖拽置顶后同步层叠快照，避免 mouseleave 时把便签回落回旧层级
      if (card.dataset.zLifted === '1') card._zPrev = card.style.zIndex;
      e.preventDefault();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };
    card.addEventListener('pointerdown', onDown);
  },

  /** 画布桌面整体拖拽：机身(.tw-beeper)固定在文档流不动，便签桌面(.tw-canvas)用 transform 平移，
      便签作为画布子元素自然跟随。点便签(.tw-card)或按钮时交给各自逻辑，不触发画布拖动。 */
  _makeCanvasDraggable() {
    const canvas = this._canvas;
    const root = this._el;
    if (!canvas || !root) return;
    let dragging = false;
    let startX = 0, startY = 0;
    let baseX = 0, baseY = 0;
    const onMove = (e) => {
      if (!dragging) return;
      // 真无限画布：不做 clamp，画布可平移到任意远处，靠双击空白 fit-all 找回
      let x = baseX + (e.clientX - startX);
      let y = baseY + (e.clientY - startY);
      canvas.style.transform = `translate(${x}px, ${y}px)`;
      this._canvasOffset = { x, y };
    };
    const onUp = () => {
      dragging = false;
      root.classList.remove('dragging');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      this._scheduleSave();   // 持久化画布偏移
    };
    // 双击空白：归位所有便签到视野中心(fit-all)；无便签则复位画布
    root.addEventListener('dblclick', (e) => {
      if (e.target.closest('.tw-card, button, .tw-card-resize, input, textarea')) return;
      this._fitAllNotes();
    });
    const onDown = (e) => {
      if (e.target.closest('.tw-card')) return;   // 点便签：交给便签拖拽
      // 交互控件不触发画布拖动（按钮/输入框/缩放手柄），其余整块区域全局可平移画布
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link, input, textarea')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      baseX = (this._canvasOffset && this._canvasOffset.x) || 0;
      baseY = (this._canvasOffset && this._canvasOffset.y) || 0;
      root.classList.add('dragging');
      e.preventDefault();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };
    // 监听挂在功能根(wrap)而非 canvas：机身区(绿壳空白处)也能拖动画布，实现全局平移
    root.addEventListener('pointerdown', onDown);
  },

  /** 把画布平移到指定偏移并持久化 */
  _setCanvasOffset(x, y) {
    this._canvasOffset = { x, y };
    this._canvas.style.transform = `translate(${x}px, ${y}px)`;
    this._scheduleSave();
  },

  /** 双击空白：归位所有便签到视野中心(fit-all)；无便签则复位画布到原点 */
  _fitAllNotes() {
    const canvas = this._canvas;
    if (!canvas) return;
    const cards = Array.from(canvas.querySelectorAll('.tw-card'));
    const cr = canvas.getBoundingClientRect();
    if (!cards.length) { this._setCanvasOffset(0, 0); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cards.forEach((c) => {
      const left = parseFloat(c.style.left) || 0;
      const top = parseFloat(c.style.top) || 0;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + (c.offsetWidth || 0));
      maxY = Math.max(maxY, top + (c.offsetHeight || 0));
    });
    const bcx = (minX + maxX) / 2;
    const bcy = (minY + maxY) / 2;
    this._setCanvasOffset(cr.width / 2 - bcx, cr.height / 2 - bcy);
  },

  /** 恢复后自检：若便签整体（或中心）落在可视区之外，自动归位到视野中心。
   *  背景：便签坐标按「画布尺寸比例」落盘，而画布平移是绝对 px —— 两者量纲不同，
   *  一旦画布尺寸在再次挂载时与落盘时不同（切换视图 / 侧栏宽高变化），
   *  便签位置会按比例重算、平移量却原样套用，整体就被推到视野外，
   *  此前只能靠手动双击空白 fit-all 才看得到内容。
   *  这里只在「确实看不见」时才归位，用户主动平移后的视角仍予保留。
   *  画布尚未布局（宽高为 0，如功能页刚挂载）时，挂一次性 ResizeObserver 等它拿到尺寸再判。 */
  _ensureNotesVisible() {
    const canvas = this._canvas;
    if (!canvas || this._fitDone) return;
    const cr = canvas.getBoundingClientRect();
    if (!cr.width || !cr.height) {
      if (this._fitRo || typeof ResizeObserver === 'undefined') return;
      this._fitRo = new ResizeObserver(() => {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (this._fitRo) { this._fitRo.disconnect(); this._fitRo = null; }
        this._ensureNotesVisible();
      });
      this._fitRo.observe(canvas);
      return;
    }
    this._fitDone = true;
    const cards = Array.from(canvas.querySelectorAll('.tw-card'));
    if (!cards.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cards.forEach((c) => {
      const left = parseFloat(c.style.left) || 0;
      const top = parseFloat(c.style.top) || 0;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + (c.offsetWidth || 0));
      maxY = Math.max(maxY, top + (c.offsetHeight || 0));
    });
    // 画布内容被 translate(ox,oy)，故便签在「画布可视窗口」内的坐标要加上这个平移
    const ox = (this._canvasOffset && this._canvasOffset.x) || 0;
    const oy = (this._canvasOffset && this._canvasOffset.y) || 0;
    const sx0 = minX + ox, sx1 = maxX + ox;
    const sy0 = minY + oy, sy1 = maxY + oy;
    const intersects = !(sx1 < 0 || sx0 > cr.width || sy1 < 0 || sy0 > cr.height);
    const cx = (sx0 + sx1) / 2, cy = (sy0 + sy1) / 2;
    const centerVisible = cx >= 0 && cx <= cr.width && cy >= 0 && cy <= cr.height;
    if (!intersects || !centerVisible) this._fitAllNotes();
  },

  // ===== 手动调整大小 =====

  /** 缩放系数安全化：非法值回落 1（默认尺寸），并夹到 [ZOOM_MIN, ZOOM_MAX] */
  _clampZoom(z) {
    const n = Number(z);
    if (!isFinite(n) || n <= 0) return 1;
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, n));
  },

  /** 应用缩放：只写 --tw-card-zoom。卡片内所有尺寸都由 em 推导，
      改这一个变量即整体等比（框宽、字号、留白、装饰全部同步）。 */
  _applyZoom(card, zoom) {
    const z = this._clampZoom(zoom);
    card.dataset.zoom = z.toFixed(3);
    if (z === 1) card.style.removeProperty('--tw-card-zoom');
    else card.style.setProperty('--tw-card-zoom', z.toFixed(3));
    // 拖拽手柄 / ⌘+滚轮 改完缩放后，尺寸档位按钮的可用态也要跟着更新
    this._syncCardScaleButtons(card);
    return z;
  },

  /** 当前 zoom 最接近哪一档（拖拽出来的连续值也能给出可读的档位名） */
  _zoomIdxOf(zoom) {
    const z = this._clampZoom(zoom);
    let idx = CARD_SCALE_DEFAULT_IDX;
    let bestD = Infinity;
    CARD_SCALES.forEach((s, i) => {
      const d = Math.abs(s - z);
      if (d < bestD) { bestD = d; idx = i; }
    });
    return idx;
  },

  /** 尺寸档位步进：从当前值（哪怕是被拖出来的连续值）跳到相邻的下一档 */
  _stepCardScale(card, dir) {
    const z = this._clampZoom(card.dataset.zoom);
    let idx = -1;
    if (dir > 0) {
      for (let i = 0; i < CARD_SCALES.length; i++) {
        if (CARD_SCALES[i] > z + 0.01) { idx = i; break; }
      }
    } else {
      for (let i = CARD_SCALES.length - 1; i >= 0; i--) {
        if (CARD_SCALES[i] < z - 0.01) { idx = i; break; }
      }
    }
    if (idx < 0) return false;
    this._applyZoom(card, CARD_SCALES[idx]);
    return true;
  },

  /** 同步 ⊟/⊞ 的可用态与提示文案 */
  _syncCardScaleButtons(card) {
    const out = card.querySelector('.tw-card-zoom-out');
    const inc = card.querySelector('.tw-card-zoom-in');
    if (!out || !inc) return;
    const z = this._clampZoom(card.dataset.zoom);
    const label = CARD_SCALE_LABELS[this._zoomIdxOf(z)];
    out.disabled = (z <= CARD_SCALES[0] + 0.01);
    inc.disabled = (z >= CARD_SCALES[CARD_SCALES.length - 1] - 0.01);
    out._tipText = `缩小便签（当前：${label}）`;
    inc._tipText = `放大便签（当前：${label}）`;
    this._refreshTip();
  },

  /** ⊟/⊞ 步进便签尺寸档位（S/M/L/XL） */
  _bindZoomSteps(card) {
    const step = (dir) => {
      if (!this._stepCardScale(card, dir)) return;
      this._scheduleSave();
    };
    const out = card.querySelector('.tw-card-zoom-out');
    const inc = card.querySelector('.tw-card-zoom-in');
    if (out) out.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    if (inc) inc.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    this._syncCardScaleButtons(card);
  },

  /** 写入便签纸样：更新 dataset、抬头与按钮提示（提示里带当前纸样名）。
   *  只作用于这一张便签 —— 与寻呼机上的 PAPER 键（只影响「之后打印」的便签）互不干扰。 */
  _applyPaper(card, paper) {
    const p = (PAPERS.indexOf(paper) >= 0) ? paper : 'plain';
    card.dataset.paper = p;
    const title = card.querySelector('.tw-card-title');
    if (title) title.textContent = PAPER_TITLES[p] || PAPER_TITLES.plain;
    const btn = card.querySelector('.tw-card-paper');
    if (btn) btn._tipText = `切换便签样式（当前：${PAPER_LABELS[p] || p}）`;
    this._refreshTip();
    return p;
  },

  /** 切换纸样：在这张便签上循环 PAPERS。
   *  两处副作用必须一并处理：
   *   1) 定版纸样（竹叶/书燕等）字级封顶更低，切过去要把字级夹回新上限；
   *   2) 纸样会改变卡片尺寸/比例，连线端点要重算。 */
  _bindPaperSwitch(card) {
    const btn = card.querySelector('.tw-card-paper');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cur = card.dataset.paper || 'plain';
      const next = PAPERS[(PAPERS.indexOf(cur) + 1) % PAPERS.length];
      this._applyPaper(card, next);
      this._applyFontScale(card, Number(card.dataset.fontIdx));  // ① 夹回新纸样的字级上限
      this._scheduleRenderLinks();                                // ② 尺寸/比例变了，端点重算
      this._scheduleSave();
      if (typeof Toast !== 'undefined') {
        Toast.showToast('已切换为「' + (PAPER_LABELS[next] || next) + '」', 'success');
      }
    });
  },

  /** 字级档位上限：定版纸样（竹叶/书燕）的文本区是按百分比预留的、纸面高度固定，
      字放太大撑出留白区会破坏版式，故封顶「很大 140%」（文本区已加 overflow 兜底）；
      流式纸样字变大纸自然变长，可一路到最大档。 */
  _maxFontIdx(paper) {
    return (paper === 'zhuye' || paper === 'shuyan' || paper === 'redsilk' || paper === 'ruoshui' || paper === 'tengyun' || paper === 'juhuo' || paper === 'yingyue') ? 5 : FONT_SCALES.length - 1;
  },

  /** 落盘值 → 档位索引：取最接近的一档（兼容浮点误差与历史数据） */
  _fontIdxOf(scale, paper) {
    const max = this._maxFontIdx(paper);
    const n = Number(scale);
    let idx = FONT_SCALE_DEFAULT_IDX;
    if (isFinite(n) && n > 0) {
      let bestD = Infinity;
      FONT_SCALES.forEach((s, i) => {
        if (i > max) return;
        const d = Math.abs(s - n);
        if (d < bestD) { bestD = d; idx = i; }
      });
    }
    return Math.min(max, idx);
  },

  /** 应用字级：只写 --tw-text-zoom（→ --tw-type-fs），纸面大小与留白不动 */
  _applyFontScale(card, idx) {
    const max = this._maxFontIdx(card.dataset.paper);
    const raw = Number(idx);
    const i = Math.min(max, Math.max(0, isFinite(raw) ? raw : FONT_SCALE_DEFAULT_IDX));
    card.dataset.fontIdx = String(i);
    card.dataset.fontScale = String(FONT_SCALES[i]);
    card.style.setProperty('--tw-text-zoom', String(FONT_SCALES[i]));
    const down = card.querySelector('.tw-card-font-down');
    const up = card.querySelector('.tw-card-font-up');
    const label = FONT_SCALE_LABELS[i];
    if (down) {
      down.disabled = (i === 0);
      down._tipText = `缩小字号（当前：${label}）`;
    }
    if (up) {
      up.disabled = (i >= max);
      up._tipText = `放大字号（当前：${label}）`;
    }
    this._refreshTip();
    return i;
  },

  /** A−/A+ 步进：点一次走一档，到边界自动置灰，改完即落盘 */
  _bindFontSteps(card) {
    const step = (dir) => {
      const cur = Number(card.dataset.fontIdx);
      const next = isFinite(cur) ? cur + dir : FONT_SCALE_DEFAULT_IDX;
      if (this._applyFontScale(card, next) === cur) return;
      this._scheduleSave();
    };
    const down = card.querySelector('.tw-card-font-down');
    const up = card.querySelector('.tw-card-font-up');
    if (down) down.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    if (up) up.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  },

  /** 外围工具条的配套行为：
      1) hover/钉住时把便签临时提到最上层 —— 否则贴在纸外的工具条会被相邻便签盖住；
      2) 便签贴画布顶部时工具条翻到下方，避免被画布裁掉；
      3) 轻点便签（未拖动）钉住工具条，点画布空白处取消 —— 触屏没有 hover 也能用。 */
  _bindTools(card) {
    const placeTools = () => {
      const canvas = this._canvas;
      if (!canvas) return;
      const cr = canvas.getBoundingClientRect();
      const kr = card.getBoundingClientRect();
      card.classList.toggle('tw-tools-below', (kr.top - cr.top) < 46);
    };
    const lift = () => {
      placeTools();
      if (card.dataset.zLifted === '1') return;
      card.dataset.zLifted = '1';
      card._zPrev = card.style.zIndex;
      card.style.zIndex = '5000';
    };
    const drop = () => {
      if (card.dataset.zLifted !== '1') return;
      // 钉住态与拖拽中保持置顶，不回落
      if (card.classList.contains('is-pinned') || card.classList.contains('dragging')) return;
      card.dataset.zLifted = '';
      card.style.zIndex = card._zPrev || '';
    };
    card.addEventListener('mouseenter', lift);
    card.addEventListener('mouseleave', drop);
    card.addEventListener('focusin', lift);
    card.addEventListener('focusout', drop);
  },

  /** 只钉住某张便签（传 null = 全部取消）；同时把其余便签的临时置顶还原 */
  _pinOnly(card) {
    const canvas = this._canvas;
    if (!canvas) return;
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => {
      if (c === card) return;
      c.classList.remove('is-pinned');
      if (c.dataset.zLifted === '1' && !c.classList.contains('dragging')) {
        c.dataset.zLifted = '';
        c.style.zIndex = c._zPrev || '';
      }
    });
    if (!card) return;
    card.classList.add('is-pinned');
    card.dataset.zLifted = '1';
    card._zPrev = card._zPrev || card.style.zIndex;
    card.style.zIndex = '5000';
  },

  // ===== 二次编辑 =====

  /** 入口：双击便签 = 进入编辑（编辑态内双击交给浏览器选词）；
      工具条已无铅笔按钮，编辑只靠双击触发。 */
  _bindEdit(card) {
    card.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate')) return;
      if (card.classList.contains('editing')) return;
      this._enterEdit(card);
    });
  },

  /** 同一时刻只编辑一张：进入新卡片前先收起其它正在编辑的 */
  _exitAllEdits() {
    if (!this._canvas) return;
    Array.from(this._canvas.querySelectorAll('.tw-card.editing')).forEach((c) => this._exitEdit(c));
  },

  _enterEdit(card) {
    if (card.classList.contains('editing')) return;
    this._exitAllEdits();
    const text = card.querySelector('.tw-card-text');
    if (!text) return;
    // 若还在打字动画中就进入编辑：先补齐全文并停表。
    // 否则逐字写入会持续覆写 contentEditable —— 光标被打飞、用户输入与动画互覆，
    // 且 pendingText 一除，落盘就会拿到「半截 + 手输」的残缺内容。
    this._finishTyping(card);
    card.classList.add('editing');
    text.setAttribute('contenteditable', 'true'); // 所见即所得：直接在纸样内改，样式已就位
    text.focus();
    // 光标落到末尾
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    text.addEventListener('input', this._onEditInput);
    text.addEventListener('keydown', this._onEditKey);
    text.addEventListener('paste', this._onEditPaste);
  },

  _exitEdit(card) {
    if (!card.classList.contains('editing')) return;
    const text = card.querySelector('.tw-card-text');
    card.classList.remove('editing');
    if (text) {
      text.removeAttribute('contenteditable');
      text.removeEventListener('input', this._onEditInput);
      text.removeEventListener('keydown', this._onEditKey);
      text.removeEventListener('paste', this._onEditPaste);
      if (window.getSelection) window.getSelection().removeAllRanges();
      this._scheduleSave(); // 落盘：_collectNotes 读的是 .tw-card-text 内容
    }
  },

  _onEditInput() { this._scheduleSave(); },

  _onEditKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      const card = e.currentTarget.closest('.tw-card');
      if (card) this._exitEdit(card);
    }
    // Enter 不拦截：contenteditable 内回车即多行便签
  },

  _onEditPaste(e) {
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, t); // 只粘纯文本，不把网页样式带进便签
  },

  /** 右下角手柄拖拽缩放 + 双击手柄复位 + ⌘/Ctrl 滚轮微调。
      缩放以卡片左上角为锚（left/top 不变，向右下生长），与拖拽定位逻辑一致。 */
  _makeResizable(card) {
    const handle = document.createElement('div');
    handle.className = 'tw-card-resize';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '调整便签大小');
    handle.title = '拖动调整大小 · 双击复位 · ⌘/Ctrl+滚轮微调';
    card.appendChild(handle);

    let resizing = false;
    let startX = 0;
    let startY = 0;
    let baseW = 1;      // zoom=1 时的卡片宽度：拖拽位移统一折算到这个基准上
    let startZoom = 1;

    const onMove = (e) => {
      if (!resizing) return;
      // 对角手势：向右下拖 = 放大（横向与纵向位移都计入，手感更自然）
      const delta = (e.clientX - startX) + (e.clientY - startY);
      this._applyZoom(card, ((baseW + delta) / baseW) * startZoom);
      this._scheduleRenderLinks();   // 尺寸变化会移动端点
    };
    const onUp = () => {
      if (!resizing) return;
      resizing = false;
      card.classList.remove('is-resizing');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      this._scheduleSave(); // 落盘新尺寸
    };

    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startZoom = this._clampZoom(card.dataset.zoom);
      const w = card.getBoundingClientRect().width || card.offsetWidth;
      baseW = (w || 340) / startZoom;
      card.classList.add('is-resizing');
      card.style.zIndex = String(++this._zTop);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._applyZoom(card, 1);
      this._scheduleSave();
    });

    // 滚轮：Shift = 调字级（档位多，滚轮比连点快）；⌘/Ctrl = 整张等比缩放（乘性步进，手感对称）
    card.addEventListener('wheel', (e) => {
      if (e.shiftKey && !(e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const cur = Number(card.dataset.fontIdx);
        const base = isFinite(cur) ? cur : FONT_SCALE_DEFAULT_IDX;
        if (this._applyFontScale(card, base + (e.deltaY > 0 ? -1 : 1)) !== base) this._scheduleSave();
        return;
      }
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      const cur = this._clampZoom(card.dataset.zoom);
      this._applyZoom(card, cur * (e.deltaY > 0 ? (1 - ZOOM_STEP) : (1 + ZOOM_STEP)));
      this._scheduleSave();
    }, { passive: false });
  },

  /** 应用旋转：只写 --tw-card-rot（与 hover 微放 --tw-card-scale 同处一张 transform 上，互不覆盖）。
   *  角度归一化到 (-180, 180]，便签无论转多少圈都落在可读区间。 */
  _applyRot(card, deg) {
    let d = Number(deg);
    if (!isFinite(d)) d = 0;
    d = ((d % 360) + 540) % 360 - 180;   // 归一到 (-180, 180]
    card.dataset.rot = d.toFixed(2);
    card.style.setProperty('--tw-card-rot', d + 'deg');
    return d;
  },

  /** 底部中央旋转握柄：拖动绕卡片中心自由旋转；Shift 吸附 15°；双击握柄归零。 */
  _makeRotatable(card) {
    const handle = document.createElement('div');
    handle.className = 'tw-card-rotate';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '旋转便签');
    handle.title = '拖动旋转 · Shift 吸附 15° · 双击归零';
    handle.innerHTML = ICON_ROTATE;
    card.appendChild(handle);

    let rotating = false;
    let lastAngle = 0;
    const centerOf = () => {
      const r = card.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const angleOf = (cx, cy, px, py) => Math.atan2(py - cy, px - cx) * 180 / Math.PI;

    const onMove = (e) => {
      if (!rotating) return;
      const c = centerOf();
      let a = angleOf(c.x, c.y, e.clientX, e.clientY);
      let delta = a - lastAngle;
      // 跨越 ±180° 时 atan2 会跳变，归一化增量避免「猛地多转一圈」
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      lastAngle = a;
      let next = (Number(card.dataset.rot) || 0) + delta;
      if (e.shiftKey) next = Math.round(next / 15) * 15;   // Shift 吸附到 15° 网格
      this._applyRot(card, next);
      this._scheduleRenderLinks();   // 旋转后端点沿旋转矩形重算
    };
    const onUp = () => {
      if (!rotating) return;
      rotating = false;
      card.classList.remove('is-rotating');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      this._scheduleSave();   // 落盘新角度
    };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rotating = true;
      const c = centerOf();
      lastAngle = angleOf(c.x, c.y, e.clientX, e.clientY);
      card.classList.add('is-rotating');
      card.style.zIndex = String(++this._zTop);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
    // 双击握柄归零（stopPropagation 避免冒泡到卡片/画布触发编辑或 fit-all）
    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._applyRot(card, 0);
      this._scheduleSave();
    });
  },

  // ===== 便签连线（节点-线图） =====

  /** 连线层：挂在 .tw-canvas 内，与便签同一坐标系 —— 画布 transform 平移时线自然跟随。
   *  SVG 设 overflow:visible（见 CSS），可画到负坐标/任意远处，适配无限画布。 */
  _ensureLinkLayer() {
    if (this._linkSvg && this._linkSvg.isConnected && this._linkSvg.parentNode === this._canvas) {
      return this._linkSvg;
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tw-links');
    svg.setAttribute('aria-hidden', 'true');
    this._canvas.appendChild(svg);
    this._linkSvg = svg;
    return svg;
  },

  /** 重绘节流：拖动/旋转/缩放时每帧至多重绘一次，避免逐事件重排 */
  _scheduleRenderLinks() {
    if (this._linkRaf) return;
    this._linkRaf = requestAnimationFrame(() => {
      this._linkRaf = 0;
      this._renderLinks();
    });
  },

  /** 求「从卡片中心朝 (tx,ty) 方向」与旋转后矩形边界的交点 —— 线止于纸边，不穿进卡片。
   *  做法：方向向量反向旋转回卡片局部坐标 → 与未旋转矩形求交 → 交点转回全局。
   *  offsetLeft/Top/Width/Height 是布局值，不受 transform:rotate 影响，故中心恒定。 */
  _edgePoint(card, tx, ty) {
    const cx = card.offsetLeft + card.offsetWidth / 2;
    const cy = card.offsetTop + card.offsetHeight / 2;
    const hw = card.offsetWidth / 2;
    const hh = card.offsetHeight / 2;
    let dx = tx - cx;
    let dy = ty - cy;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const rot = (Number(card.dataset.rot) || 0) * Math.PI / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    // 反向旋转到卡片局部坐标（旋转 -rot）
    const lx = dx * cos + dy * sin;
    const ly = -dx * sin + dy * cos;
    const tx2 = Math.abs(lx) > 1e-6 ? hw / Math.abs(lx) : Infinity;
    const ty2 = Math.abs(ly) > 1e-6 ? hh / Math.abs(ly) : Infinity;
    const t = Math.min(tx2, ty2);
    const plx = lx * t;
    const ply = ly * t;
    // 交点转回全局坐标（旋转 +rot）
    return {
      x: cx + (plx * cos - ply * sin),
      y: cy + (plx * sin + ply * cos),
    };
  },

  /** 画全部连线。路由分两层（对齐国际前沿做法）：
   *   1) 选边 —— 按两卡片相对位置自动挑 上/右/下/左 出线边（JSON Canvas 的 fromSide/toSide、
   *      GoJS 的 fromSpot/toSpot），线垂直于该边射出：并排即「右→左」水平直连；
   *   2) 路线 —— bezier(曲线，默认) / straight(直线)：可逐条切换，并支持拖中点弯曲。
   *  悬空连线（任一端便签已删）自动跳过。 */
  _renderLinks() {
    if (!this._canvas) return;
    const svg = this._ensureLinkLayer();
    // 只清正式连线，保留正在拖拽的临时线（is-temp）
    Array.from(svg.children).forEach((ch) => {
      if (!ch.classList || !ch.classList.contains('is-temp')) svg.removeChild(ch);
    });
    const byId = new Map();
    this._canvas.querySelectorAll('.tw-card').forEach((c) => byId.set(c.dataset.id, c));
    this._links.forEach((l) => {
      const a = byId.get(l.from);
      const b = byId.get(l.to);
      if (!a || !b) return;
      const ca = { x: a.offsetLeft + a.offsetWidth / 2, y: a.offsetTop + a.offsetHeight / 2 };
      const cb = { x: b.offsetLeft + b.offsetWidth / 2, y: b.offsetTop + b.offsetHeight / 2 };
      // ① 选边：端点落在自动挑出的边上，出线方向为该边的外法线
      const A = this._anchorOn(a, cb);
      const B = this._anchorOn(b, ca);
      const p1 = A.p;
      const p2 = B.p;
      // ② 路线：曲线（默认）或直线（手动切换后存 route）
      const mode = (l.route === 'straight') ? 'straight' : 'bezier';
      const { d, tip } = this._routePath(A.p, A.u, B.p, B.u, mode, Number(l.bend) || 0);
      // 统一工厂：线/端点/箭头都带 data-from/to，供「关联高亮」一起提亮
      const mk = (tag, cls) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        el.setAttribute('class', cls);
        el.setAttribute('data-from', l.from);
        el.setAttribute('data-to', l.to);
        return el;
      };

      // 隐形命中层：可见线只有 1.5px，直接点几乎选不中。
      // 叠一条同路径、16px 宽、完全透明的线专收事件（Figma / tldraw 的标准做法）：
      // 视觉上完全看不见，但命中宽度从 1.5px 放大到 16px。
      const hit = mk('path', 'tw-link-hit');
      hit.setAttribute('d', d);
      hit.addEventListener('mouseenter', () => {
        clearTimeout(this._hoverTimer);
        this._hoverLink = { from: l.from, to: l.to };
        this._setLinkActive(l.from, l.to, true);
        this._renderLinkControls(l.from, l.to);
      });
      hit.addEventListener('mouseleave', () => this._scheduleEndHover());
      hit.addEventListener('dblclick', (e) => {
        e.stopPropagation();   // 避免冒泡到画布触发 fit-all
        this._endLinkHover();
        this._removeLink(l.from, l.to);
        this._scheduleSave();
      });
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = '双击删除 · 拖中点改走向 · 点圆点切线型';
      hit.appendChild(title);
      svg.appendChild(hit);

      const path = mk('path', 'tw-link');
      path.setAttribute('d', d);
      svg.appendChild(path);

      // 端点：源端实心圆点；目标端实心小三角（filled triangle，React Flow / Figma 默认端点）。
      //  三角尖端指向目标便签（沿 -B.u 入纸边），线尾被三角填充盖住、不穿心。两端都带 data-from/to 供高亮。
      const src = mk('circle', 'tw-link-dot tw-link-dot-src');
      src.setAttribute('cx', p1.x); src.setAttribute('cy', p1.y); src.setAttribute('r', '3.6');
      svg.appendChild(src);
      // 箭头轴 = 曲线末端切线 tip（与线身同方向），而非卡片外法线 B.u：
      // 曲线带 bow 时入线方向与卡片边成角，若箭头按 B.u 画（垂直卡片）二者方向不一致，
      // 衔接处出现折角。改用 tip 后箭头与线身共线、无缝收尾；尖端落在 p2，线尾被三角盖住。
      const ah = 8, aw = 7;   // 三角高 / 半宽
      const apx = -tip.y, apy = tip.x;                          // 垂直于入线方向
      const bx = p2.x - tip.x * ah, by = p2.y - tip.y * ah;     // 底边中心（朝源侧退 ah）
      const ab1 = { x: bx + apx * aw / 2, y: by + apy * aw / 2 };
      const ab2 = { x: bx - apx * aw / 2, y: by - apy * aw / 2 };
      const arrow = mk('path', 'tw-link-arrow-end');
      arrow.setAttribute('d', `M ${p2.x} ${p2.y} L ${ab1.x} ${ab1.y} L ${ab2.x} ${ab2.y} Z`);
      svg.appendChild(arrow);
    });
    // 重绘后补回悬浮控件（拖动弯曲时每帧都会重绘）
    if (this._hoverLink) this._renderLinkControls(this._hoverLink.from, this._hoverLink.to);
  },

  // ===== 连线路由：选边 → 路线 =====

  /** 选边（JSON Canvas 的 fromSide/toSide、GoJS 的 fromSpot/toSpot）：
   *  把目标中心换算到本卡片局部坐标，按「归一化到半宽/半高」的超限比例挑 上/右/下/左；
   *  端点落在该边上（沿边方向按目标偏移，限 45% 内避免贴角），出线方向 = 该边的外法线。
   *  @returns {{p:{x:number,y:number}, u:{x:number,y:number}}} 端点与出线单位向量（画布局部坐标） */
  _anchorOn(card, target) {
    const cx = card.offsetLeft + card.offsetWidth / 2;
    const cy = card.offsetTop + card.offsetHeight / 2;
    const hw = card.offsetWidth / 2 || 1;
    const hh = card.offsetHeight / 2 || 1;
    const rot = (Number(card.dataset.rot) || 0) * Math.PI / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const dx = target.x - cx;
    const dy = target.y - cy;
    const lx = dx * cos + dy * sin;     // 目标 → 卡片局部（逆向旋转）
    const ly = -dx * sin + dy * cos;
    let px, py, ux, uy;
    if (Math.abs(lx) / hw >= Math.abs(ly) / hh) {
      const s = lx >= 0 ? 1 : -1;       // 右 / 左
      px = s * hw;
      py = Math.max(-hh * 0.45, Math.min(hh * 0.45, ly));
      ux = s; uy = 0;
    } else {
      const s = ly >= 0 ? 1 : -1;       // 下 / 上
      py = s * hh;
      px = Math.max(-hw * 0.45, Math.min(hw * 0.45, lx));
      ux = 0; uy = s;
    }
    return {
      p: { x: cx + (px * cos - py * sin), y: cy + (px * sin + py * cos) },   // 局部 → 全局
      u: { x: ux * cos - uy * sin, y: ux * sin + uy * cos },
    };
  },

  /** 生成路径。mode: bezier | straight；bend: 沿法线的额外弯曲量(px，拖中点手柄改，随线存盘)
   *  @returns {{d:string, tip:{x:number,y:number}}} 路径与末端切线单位向量（供箭头定向） */
  _routePath(p1, ua, p2, ub, mode, bend) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (mode === 'straight') {
      return { d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`, tip: { x: dx / dist, y: dy / dist } };
    }
    // bezier：控制点 = 端点 + 出线方向外推 + 法线弓形（含用户 bend）
    const k = Math.min(60, dist * 0.30);
    const bow = Math.min(34, Math.max(10, dist * 0.12)) + bend;
    const nx = -dy / dist;
    const ny = dx / dist;
    const c1 = { x: p1.x + ua.x * k + nx * bow, y: p1.y + ua.y * k + ny * bow };
    const c2 = { x: p2.x + ub.x * k + nx * bow, y: p2.y + ub.y * k + ny * bow };
    const tx = p2.x - c2.x;
    const ty = p2.y - c2.y;
    const tl = Math.hypot(tx, ty) || 1;
    return {
      d: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`,
      tip: { x: tx / tl, y: ty / tl },
    };
  },

  // ===== 连线上的悬浮控件（中点弯曲手柄 + 线型切换） =====

  _clearLinkControls() {
    const svg = this._linkSvg;
    if (!svg) return;
    // 关键修复：同时复位「指针停在控件上」标记。控件 DOM 被移除（拖动/缩放/旋转便签、新建连线、
    // ResizeObserver 触发重绘）时其 mouseleave 不会触发，若不复位 _ctlHover 会卡在 true，
    // 导致 end-hover 定时器永久 bail、连线永远回不到常态（悬浮后偶尔无法恢复）。
    this._ctlHover = false;
    Array.from(svg.querySelectorAll('.tw-link-ctl')).forEach((el) => el.remove());
  },

  _endLinkHover() {
    const cur = this._hoverLink;
    this._hoverLink = null;
    this._clearLinkControls();
    if (cur) this._setLinkActive(cur.from, cur.to, false);
  },

  /** 收起悬浮控件前留一点余量：允许指针从线移到控件上而不中断 */
  _scheduleEndHover() {
    clearTimeout(this._hoverTimer);
    this._hoverTimer = setTimeout(() => {
      // 指针仍停在控件上：稍后重试，而非永久卡死（双重保险，配合 _clearLinkControls 复位 _ctlHover）
      if (this._ctlHover) { this._scheduleEndHover(); return; }
      this._endLinkHover();
    }, 80);
  },

  /** hover 连线时在线上浮现两个控件（tldraw elbowMidPoint 的做法）：
   *  中点「弯曲手柄」可拖动改变走向；约 1/4 处「线型按钮」点击在 曲线/直线 间循环。
   *  位置用 getPointAtLength 精确取在曲线上。 */
  _renderLinkControls(from, to) {
    this._clearLinkControls();
    const svg = this._linkSvg;
    if (!svg) return;
    const line = Array.from(svg.querySelectorAll('.tw-link')).find((el) =>
      el.getAttribute('data-from') === from && el.getAttribute('data-to') === to);
    const link = this._links.find((l) => l.from === from && l.to === to);
    if (!line || !link || typeof line.getTotalLength !== 'function') return;
    const len = line.getTotalLength();
    if (!len) return;
    const cardById = (id) => Array.from(this._canvas.querySelectorAll('.tw-card'))
      .find((c) => c.dataset.id === id);

    const mkCtl = (cls, pt, label) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      el.setAttribute('class', cls);
      el.setAttribute('cx', pt.x);
      el.setAttribute('cy', pt.y);
      el.setAttribute('r', '5');
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t.textContent = label;
      el.appendChild(t);
      // 指针停在控件上时不收起悬浮态
      el.addEventListener('mouseenter', () => { clearTimeout(this._hoverTimer); this._ctlHover = true; });
      el.addEventListener('mouseleave', () => { this._ctlHover = false; this._scheduleEndHover(); });
      svg.appendChild(el);
      return el;
    };

    // ① 中点弯曲手柄：拖动把线沿法线推弯，弯曲量随线存盘
    const handle = mkCtl('tw-link-ctl tw-link-bend', line.getPointAtLength(len / 2), '拖动改变连线走向');
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const cardA = cardById(from);
      const cardB = cardById(to);
      if (!cardA || !cardB) return;
      this._ctlHover = true;   // 拖动期间不收起控件
      const rect = this._canvas.getBoundingClientRect();
      const cA = { x: cardA.offsetLeft + cardA.offsetWidth / 2, y: cardA.offsetTop + cardA.offsetHeight / 2 };
      const cB = { x: cardB.offsetLeft + cardB.offsetWidth / 2, y: cardB.offsetTop + cardB.offsetHeight / 2 };
      const A = this._anchorOn(cardA, cB);
      const B = this._anchorOn(cardB, cA);
      const base = { x: (A.p.x + B.p.x) / 2, y: (A.p.y + B.p.y) / 2 };
      const vx = B.p.x - A.p.x;
      const vy = B.p.y - A.p.y;
      const vl = Math.hypot(vx, vy) || 1;
      const nx = -vy / vl;
      const ny = vx / vl;
      const onMove = (ev) => {
        const mx = ev.clientX - rect.left;
        const my = ev.clientY - rect.top;
        link.bend = Math.round((mx - base.x) * nx + (my - base.y) * ny);
        this._renderLinks();
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        this._ctlHover = false;
        this._scheduleSave();
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    // ② 线型切换按钮：点击在 曲线 → 直线 间循环（React Flow 的 edge type 思路）
    const modeBtn = mkCtl('tw-link-ctl tw-link-mode', line.getPointAtLength(len * 0.28),
      '点击切换线型（曲线 / 直线）');
    modeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const order = ['bezier', 'straight'];
      const cur = (link.route === 'straight') ? 'straight' : 'bezier';
      link.route = order[(order.indexOf(cur) + 1) % order.length];
      this._renderLinks();
      this._scheduleSave();
    });

    // ③ 删除按钮：hover 连线时浮现于约 3/4 处（与 1/4 线型按钮、中点弯曲手柄三者错开，互不干扰）。
    //  位置用线法线偏移 15px，使 × 落在连线侧旁而非压在线上；用 cx/cy 定位（非 transform 属性），
    //  避免 CSS hover 的 scale(1.25) 覆盖 translate 导致控件跳动。
    const f = 0.72;
    const mPt = line.getPointAtLength(len * f);
    const aT = line.getPointAtLength(Math.max(0, len * f - 1));
    const bT = line.getPointAtLength(Math.min(len, len * f + 1));
    const tdx = bT.x - aT.x, tdy = bT.y - aT.y;
    const tl = Math.hypot(tdx, tdy) || 1;
    const nx = -tdy / tl, ny = tdx / tl;                 // 线法线
    const dx = mPt.x + nx * 15, dy = mPt.y + ny * 15;
    const keep = () => { clearTimeout(this._hoverTimer); this._ctlHover = true; };
    const release = () => { this._ctlHover = false; this._scheduleEndHover(); };
    const onDel = (e) => {
      e.stopPropagation();
      this._endLinkHover();          // 收起控件 + 取消关联高亮
      this._removeLink(from, to);
      this._scheduleSave();
    };
    const del = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    del.setAttribute('class', 'tw-link-ctl tw-link-del');
    const delBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    delBg.setAttribute('class', 'tw-link-del-bg');
    delBg.setAttribute('cx', dx); delBg.setAttribute('cy', dy); delBg.setAttribute('r', '8');
    const delX = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    delX.setAttribute('class', 'tw-link-del-x');
    delX.setAttribute('d', `M ${dx - 3} ${dy - 3} L ${dx + 3} ${dy + 3} M ${dx - 3} ${dy + 3} L ${dx + 3} ${dy - 3}`);
    del.appendChild(delBg); del.appendChild(delX);
    const delT = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    delT.textContent = '点击删除连线';
    del.appendChild(delT);
    del.addEventListener('mouseenter', keep);
    del.addEventListener('mouseleave', release);
    del.addEventListener('click', onDel);
    svg.appendChild(del);
  },

  /** 建立连线：A→B 与 B→A 视为同一条（去重），自连忽略 */
  _addLink(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return false;
    const dup = this._links.some((l) =>
      (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId));
    if (dup) return false;
    this._links.push({ from: fromId, to: toId, route: 'auto', bend: 0 });
    this._renderLinks();
    this._scheduleSave();
    return true;
  },

  /** 删除指定连线 */
  _removeLink(fromId, toId) {
    const before = this._links.length;
    this._links = this._links.filter((l) =>
      !((l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId)));
    if (this._links.length !== before) this._renderLinks();
  },

  /** 删除便签时级联清理：凡涉及该便签的连线全部移除，杜绝悬空线 */
  _removeLinksOf(cardId) {
    if (!cardId) return;
    const before = this._links.length;
    this._links = this._links.filter((l) => l.from !== cardId && l.to !== cardId);
    if (this._links.length !== before) { this._renderLinks(); this._scheduleSave(); }
  },

  /** 卡片尺寸变化（改字号/缩放/窗口 resize）会移动端点，用 ResizeObserver 统一兜底重绘 */
  _watchCardSize(card) {
    if (typeof ResizeObserver === 'undefined') return;
    if (!this._linkRo) {
      this._linkRo = new ResizeObserver(() => this._scheduleRenderLinks());
    }
    this._linkRo.observe(card);
  },

  /** 命中测试：返回指针下的便签（排除 exclude，通常是拖拽起点那张）。
   *  应用跑在 shadow root 内，document.elementFromPoint 可能只返回宿主元素而取不到便签，
   *  故优先用 __bambooShadowRoot.elementFromPoint（与 actionDispatcher 一致）；
   *  再兜一层几何判定：点 → 画布局部坐标 → 逆向旋转到卡片局部坐标 → 判断是否落在旋转矩形内。
   *  几何兜底不依赖命中测试，任何遮挡/shadow 边界情况下都能稳定取到目标。 */
  _cardAtPoint(cx, cy, exclude) {
    const sr = window.__bambooShadowRoot;
    if (sr && typeof sr.elementFromPoint === 'function') {
      try {
        const el = sr.elementFromPoint(cx, cy);
        const hit = (el && el.closest) ? el.closest('.tw-card') : null;
        if (hit && hit !== exclude) return hit;
      } catch (_) { /* 取不到就走几何兜底 */ }
    }
    const canvas = this._canvas;
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    const px = cx - r.left;      // 画布仅有 translate，无缩放：屏幕→画布局部直接相减
    const py = cy - r.top;
    let best = null;
    let bestZ = -Infinity;
    canvas.querySelectorAll('.tw-card').forEach((c) => {
      if (c === exclude) return;
      const dx = px - (c.offsetLeft + c.offsetWidth / 2);
      const dy = py - (c.offsetTop + c.offsetHeight / 2);
      const rot = (Number(c.dataset.rot) || 0) * Math.PI / 180;
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const lx = dx * cos + dy * sin;      // 逆向旋转到卡片局部坐标
      const ly = -dx * sin + dy * cos;
      if (Math.abs(lx) <= c.offsetWidth / 2 && Math.abs(ly) <= c.offsetHeight / 2) {
        const z = Number(c.style.zIndex) || 0;   // 叠放时取最上面那张
        if (z >= bestZ) { bestZ = z; best = c; }
      }
    });
    return best;
  },

  /** 关联高亮：hover 某张便签时，与它相连的线/端点/箭头一起提亮（Heptabase 的招牌交互）。
   *  只提亮不加粗，让线始终退在背景里、不抢便签风头。 */
  _highlightLinksOf(cardId, on) {
    const svg = this._linkSvg;
    if (!svg || !cardId) return;
    Array.from(svg.querySelectorAll('[data-from]')).forEach((el) => {
      if (el.getAttribute('data-from') === cardId || el.getAttribute('data-to') === cardId) {
        el.classList.toggle('is-active', !!on);
      }
    });
  },

  /** 单条连线的 hover 态（由隐形命中层触发）：提亮该线的线体 / 端点 / 箭头 */
  _setLinkActive(from, to, on) {
    const svg = this._linkSvg;
    if (!svg) return;
    Array.from(svg.querySelectorAll('[data-from]')).forEach((el) => {
      if (el.getAttribute('data-from') === from && el.getAttribute('data-to') === to) {
        el.classList.toggle('is-active', !!on);
      }
    });
  },

  /** 右侧中央连线锚点：按住拖到另一张便签松手即建立连线；落在空白处作废。 */
  _makeLinkable(card) {
    const anchor = document.createElement('div');
    anchor.className = 'tw-card-link';
    anchor.setAttribute('role', 'button');
    anchor.setAttribute('aria-label', '拖到另一张便签建立连线');
    anchor.title = '拖到另一张便签建立连线';
    anchor.innerHTML = ICON_LINK;
    card.appendChild(anchor);

    // 关联高亮：hover 便签时，与它相连的线一起提亮
    card.addEventListener('mouseenter', () => this._highlightLinksOf(card.dataset.id, true));
    card.addEventListener('mouseleave', () => this._highlightLinksOf(card.dataset.id, false));

    anchor.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();          // 不触发卡片拖拽、也不触发画布平移
      const svg = this._ensureLinkLayer();
      const fromId = card.dataset.id;
      const temp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      temp.setAttribute('class', 'tw-link is-temp');
      svg.appendChild(temp);
      card.style.zIndex = String(++this._zTop);
      let target = null;
      // 屏幕坐标 → 画布局部坐标（画布仅有 translate，无缩放，故直接相减即可）
      const toCanvas = (cx, cy) => {
        const r = this._canvas.getBoundingClientRect();
        return { x: cx - r.left, y: cy - r.top };
      };
      const onMove = (ev) => {
        const p = toCanvas(ev.clientX, ev.clientY);
        const p1 = this._edgePoint(card, p.x, p.y);
        temp.setAttribute('d', `M ${p1.x} ${p1.y} L ${p.x} ${p.y}`);
        // 临时线 pointer-events:none，不会挡住命中检测
        const next = this._cardAtPoint(ev.clientX, ev.clientY, card);
        if (target && target !== next) target.classList.remove('is-link-target');
        if (next) next.classList.add('is-link-target');
        target = next;
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        if (target) target.classList.remove('is-link-target');
        if (temp.parentNode) temp.parentNode.removeChild(temp);
        if (target) {
          const ok = this._addLink(fromId, target.dataset.id);
          if (ok && typeof Toast !== 'undefined') Toast.showToast('已建立连线', 'success');
        }
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  },

  // ===== 自绘 tooltip =====

  /** 整块画布共用一个浮层（挂在功能根元素上），不每张便签各建一个 */
  _ensureTip() {
    if (this._tip && this._tip.isConnected) return this._tip;
    const tip = document.createElement('div');
    tip.className = 'tw-tip';
    tip.setAttribute('role', 'tooltip');
    this._el.appendChild(tip);
    this._tip = tip;
    return tip;
  },

  /** 定位在按钮正上方、6px 偏移处；顶部放不下则翻到下方 */
  _positionTip(el) {
    const tip = this._tip;
    if (!tip) return;
    const r = el.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    const maxLeft = (window.innerWidth || document.documentElement.clientWidth) - tr.width - 6;
    let left = r.left + r.width / 2 - tr.width / 2;
    left = Math.max(6, Math.min(left, maxLeft));
    let top = r.top - tr.height - 6;
    if (top < 6) top = r.bottom + 6;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  },

  /** 文案存在 el._tipText 上 —— 档位一变就能就地刷新，
      避免提示还写着「当前：M」而实际已经变成 L。 */
  _bindTips(card) {
    const targets = [
      [card.querySelector('.tw-card-paper'), '切换便签样式'],
      [card.querySelector('.tw-card-font-down'), '缩小字号'],
      [card.querySelector('.tw-card-font-up'), '放大字号'],
      [card.querySelector('.tw-card-zoom-out'), '缩小便签'],
      [card.querySelector('.tw-card-zoom-in'), '放大便签'],
      [card.querySelector('.tw-card-del'), '移除便签'],
    ];
    targets.forEach(([el, fallback]) => {
      if (!el) return;
      const show = () => {
        const tip = this._ensureTip();
        this._tipEl = el;
        tip.textContent = el._tipText || fallback;
        tip.classList.add('on');
        this._positionTip(el);
      };
      const hide = () => {
        if (this._tipEl === el) this._tipEl = null;
        if (this._tip) this._tip.classList.remove('on');
      };
      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);
      el.addEventListener('click', show); // 点完立刻用新文案重画
    });
  },

  /** 档位变化后就地刷新当前显示的提示 */
  _refreshTip() {
    const tip = this._tip;
    if (!tip || !this._tipEl || !tip.classList.contains('on')) return;
    const el = this._tipEl;
    const text = el._tipText || el.getAttribute('aria-label');
    if (!text) return;
    tip.textContent = text;
    this._positionTip(el);
  },

  // ===== 持久化 =====

  /** 从 vault 加载已保存便签并重建（直接显示全文，不重放打字动画） */
  async _restore() {
    if (this._restored) return;
    this._restored = true;
    // 存储契约收敛到 TypewriterStore：便签(新 schema) + 画布偏移，含版本/校验/备份/读后校验
    const { notes, canvasOffset, links } = await TypewriterStore.load();
    this._links = Array.isArray(links) ? links : [];
    const canvas = this._canvas;
    const hint = canvas.querySelector('.tw-canvas-hint');
    if (notes.length && hint) hint.remove();
    const cr = canvas.getBoundingClientRect();
    const w = cr.width || 1;
    const h = cr.height || 1;

    notes.forEach((note) => {
      const n = note || {};
      const card = this._createCardEl({
        id: n.id,
        font: n.font,
        paper: n.paper,
        date: n.date,
        zoom: n.zoom,
        fontScale: n.fontScale,
        rot: n.rot,
      });
      card.style.zIndex = String(++this._zTop);
      canvas.appendChild(card);
      const cw = card.offsetWidth || 340;
      const ch = card.offsetHeight || 200;
      const x = (typeof n.x === 'number') ? n.x * w : (w - cw) / 2;
      const y = (typeof n.y === 'number') ? n.y * h : 24;
      card.style.left = x + 'px';
      card.style.top = y + 'px';
      card.style.bottom = 'auto';
      // 直接显示全文（用户要求：不重放动画）
      const textEl = card.querySelector('.tw-card-text');
      textEl.textContent = (typeof n.text === 'string') ? n.text : '';
    });
    if (canvasOffset) {
      this._canvasOffset = { x: Number(canvasOffset.x) || 0, y: Number(canvasOffset.y) || 0 };
      this._canvas.style.transform = `translate(${this._canvasOffset.x}px, ${this._canvasOffset.y}px)`;
    }
    this._renderLinks();   // 便签就位后再画连线（端点依赖布局尺寸）
    this._ensureNotesVisible();  // 便签若在视野外，自动归位（不必再手动双击空白）
  },

  /** 收集画布上所有卡片为落盘数据（坐标存相对画布比例，可超出 0~1 以支持无限画布） */
  _collectNotes() {
    const canvas = this._canvas;
    if (!canvas) return [];
    const cr = canvas.getBoundingClientRect();
    const w = cr.width || 1;
    const h = cr.height || 1;
    // 画布还没布局（功能页被隐藏 / 刚挂载）时不要落盘比例坐标：
    // 一旦用 w=1 把 left 当比例存进去，下次还原会再乘回真实宽度，便签被甩出几万 px。
    if (w < 2 || h < 2) return null;
    return Array.from(canvas.querySelectorAll('.tw-card')).map((card) => {
      const left = parseFloat(card.style.left) || 0;
      const top = parseFloat(card.style.top) || 0;
      return {
        id: card.dataset.id,
        // 打字动画进行中以「目标全文」为准：此刻 DOM 里只有半截字，
        // 若直接读 innerText 会把没打完的残缺内容落盘（详见 _spawn 里的 pendingText）。
        text: card.dataset.pendingText
          || ((card.querySelector('.tw-card-text') || {}).innerText) || '',
        font: card.dataset.font || 'classic',
        paper: card.dataset.paper || 'plain',
        date: card.dataset.date || '',
        zoom: this._clampZoom(card.dataset.zoom),
        fontScale: Number(card.dataset.fontScale) || 1,
        rot: Number(card.dataset.rot) || 0,
        x: left / w,
        y: top / h,
      };
    });
  },

  /** 防抖写盘：合并拖拽/删除/新增等连续操作 */
  _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this._saveNow();
    }, SAVE_DEBOUNCE);
  },

  /** 立即写盘（fire-and-forget） */
  async _saveNow() {
    if (!this._canvas) return;
    const notes = this._collectNotes();
    // 画布尚未布局时 _collectNotes 返回 null：跳过本次落盘，避免写入失真坐标覆盖好数据
    if (!notes) return;
    // 存储契约收敛到 TypewriterStore：便签走自管 schema(putSetting)，画布偏移独立 KV。
    // 彻底绕开只认数组的 putTypewriterNotes，TS 端再也无法因结构假设清空便签。
    await TypewriterStore.save(notes, this._canvasOffset || { x: 0, y: 0 }, this._links);
  },

  /** 超出上限删最早（canvas 子节点顺序即时间序） */
  _enforceCap() {
    const canvas = this._canvas;
    if (!canvas) return;
    const cards = Array.from(canvas.querySelectorAll('.tw-card'));
    if (cards.length <= NOTE_CAP) return;
    const overflow = cards.slice(0, cards.length - NOTE_CAP);
    overflow.forEach((c) => { this._removeLinksOf(c.dataset.id); c.remove(); });
    this._scheduleSave();
  },

  _now() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },
};

window.TypewriterFeature = TypewriterFeature;
