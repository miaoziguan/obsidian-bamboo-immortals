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
 *  - 圆形黑键（相机/字体切换/一键排版）+ 橙色 PRINT 大钮 + MOTOROLA 品牌标；
 *  - 输入文字 → 点 PRINT（或 回车 / Ctrl·Cmd+Enter）→ 画布生成一张米白纸条；
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
// P8 空间索引：把「每张卡 occupy 的网格单元」建索引，cull/框选/命中从 O(n) 降到 O(可视)
import { SpatialIndex } from '../../services/SpatialIndex.js';
import { GeoCache } from '../../services/GeoCache.js';
import { NotesState } from '../../services/NotesState.js';
import { ViewportCuller } from '../../services/ViewportCuller.js';
// B1 解耦：从本巨型单例抽出的 4 个子系统（委托壳调用的目标），详见各模块头部注释
import { CardViewManager } from './CardViewManager.js';
import { CardInteractions } from './CardInteractions.js';
import { ModeController } from './ModeController.js';
import { PersistenceCoordinator } from './PersistenceCoordinator.js';
// 思维子弹（产品名，即原「思维导图」）是**独立文档**（自己的节点树 + 自己的视野），
// 只在旋钮拨到子弹位时挂载显示。便签侧因此彻底不用再管它：
// 不再有「进入导图前的自由布局快照」，也不再改写便签坐标。
import { MindmapFeature } from './mindmapFeature.js';
// 连线层（便签与思维子弹共用的「节点-线」渲染/交互/控件）
import { LinkLayer } from '../../services/LinkLayer.js';
// 写作档便签的纯逻辑数据模型（与 MindmapDoc 同构）：读档净化 / 不可变增改 / 落盘形状。
// 本 feature 以 this._notes 为规范模型，DOM 只是它的投影（详见 _collectNotes / _restore）。
import { WritingDoc } from './writingDoc.js';
// 文本输入来源判定（Shadow DOM 安全）：见 utils/domRef 的 isFromTextEntry 注释
import { isFromTextEntry } from '../../utils/domRef.js';
// 撤销/重做栈（快照式；便签与导图各持一份，见 services/undoStack.js）
import { UndoStack } from '../../services/undoStack.js';

// B1 单一真源：原内联常量（图标/堆叠/缩放/字级/纸样/级别）收敛到 twConfig.js，本文件改为导入，不再重复定义
import { ICON_LAYERS, ICON_FONT, ICON_GRID, ICON_PRINT, ICON_X, ICON_FONT_DOWN, ICON_FONT_UP, ICON_ZOOM_OUT, ICON_ZOOM_IN, ICON_PAPER, ICON_EXPORT, ICON_PREVIEW, ICON_MOVE_UP, ICON_MOVE_DOWN, ICON_LV_UP, ICON_LV_DOWN, ICON_ROTATE } from './twConfig.js';
import { STACK_STEP, STACK_LEVELS, TYPE_SPEED, MAX_LEN, NOTE_CAP, WRITE_FLOW_GAP, SAVE_DEBOUNCE, LOD_DENSITY, LOD_DENSITY_EXIT, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from './twConfig.js';
import { FONT_SCALES, FONT_SCALE_DEFAULT_IDX, FONT_SCALE_LABELS, CARD_SCALES, CARD_SCALE_LABELS, CARD_SCALE_DEFAULT_IDX } from './twConfig.js';
import { FONTS, FONT_LABELS, FONT_FEEDBACK } from './twConfig.js';
import { PAPERS, PAPER_LABELS, PAPER_FEEDBACK, PAPER_TITLES } from './twConfig.js';
import { LEVELS, LEVEL_LABELS, LEVEL_FEEDBACK, LEVEL_GROUPS, LEVEL_LADDER } from './twConfig.js';

export const TypewriterFeature = {
  /** 全部运行期字段的唯一初始化入口（模块加载 + unmount 结尾共用，替代原对象字面量顶部 40+ 条内联声明）。
   *  新增字段只改这里一处 —— 彻底消除「unmount 漏归零某字段导致跨会话/跨档串状态」这一类 bug
   *  （例如原先 _levelMenuDocHandler 在 unmount 里从未被重置）。 */
  _resetState() {
    if (!this._state) this._state = new NotesState();   // 共享状态单主（解耦 B5）：存取器代理到它，数据真源唯一
    this._el = null;
    this._canvas = null;
    this._input = null;
    this._case = null;
    this._timers = [];                 // 所有卡片打字计时器，供 unmount 精确清理
    this._zTop = 10;
    this._spawnIdx = 0;
    this._fontIdx = 0;
    this._paperIdx = 0;
    this._mode = 'notes';              // 红色齿轮旋钮三档权威状态（见 _setMode）
    this._layoutMode = 'flow';         // 写作档排版档位：'flow' 顺流竖排 / 'acts' 分幕（点 #twArrange 轮换）
    this._switching = false;           // 切档重入锁
    this._levelMenu = null;            // 类型选择浮层（全画布共用一个，按需创建）
    this._levelMenuCard = null;        // 浮层当前作用于哪张卡
    this._levelMenuDocHandler = null;  // 【B5 修复】原先 unmount 漏归零，现已收口到此处
    this._draft = { notes: '', write: '', mindmap: '' }; // 输入框草稿按模式各存一份
    this._msgTimer = null;
    this._saveTimer = null;            // 写盘防抖计时器
    this._restored = false;            // 防重复加载：mount 一次只读盘一次
    this._fitDone = false;             // 恢复后「把便签带进视野」自检（每次 mount 重置）
    this._fitRo = null;                // 画布尚未布局时延迟自检的一次性 ResizeObserver
    this._ro = null;                   // 联动缩放 ResizeObserver（_observeScale 创建，unmount/resetState 断开）
    this._audioCtx = null;             // 吐纸音效的 Web Audio 上下文
    this._links = [];                  // 便签连线：[{from,to}]
    this._linkSvg = null;              // 连线 SVG 层
    this._linkEls = [];                // 每条连线的 SVG 元素引用
    this._linkSigCache = '';           // 上次渲染的连线结构签名
    this._ctlEls = null;               // hover 控件的元素引用表
    this._linkRaf = 0;                 // 重绘节流
    this._linkRo = null;               // 观察卡片尺寸变化 → 自动重绘连线
    this._hoverLink = null;            // 当前悬浮的连线 {from,to}
    this._hoverTimer = null;           // 收起悬浮控件的防抖
    this._ctlHover = false;            // 指针是否停在连线的控件上
    this._selected = null;             // 多选集合：Set<HTMLElement>
    this._marquee = null;              // 框选矩形 DOM
    this._marqueeRect = null;          // 框选矩形几何
    this._selKeyHandler = null;        // 删除/缩放快捷键监听
    this._themeMo = null;              // 机型明暗开关 MutationObserver
    this._undoStack = null;            // 撤销/重做栈（仅便签这份文档）
    this._tip = null;                  // 提示条 DOM
    this._tipEl = null;                // 提示条文本节点
    this._notes = [];                  // 写作档便签规范数据模型
    this._mountedCards = null;         // id → 在屏 DOM 元素
    this._geo = null;                  // id → 几何缓存 {x,y,w,h,rot}（B2：GeoCache）
    this._spatial = null;                // 空间索引：cull/框选/命中 O(可视)；首次使用时懒建（见 _syncLayoutGeo 等守卫）
    this._noteById = null;             // 懒建 id→note 索引
    this._noteByIdSrc = null;
    this._lodDragging = false;         // 是否处于画布平移拖拽中
    this._lodDense = false;            // 当前是否已 dense 降级
    this._lodDrag = false;             // 当前是否已 drag 降级
    this._perfOn = false;              // 性能埋点开关
    this._perf = null;                 // key → { n, total, max }
    this._draggingSet = null;          // 拖拽中的卡 id 集（钉屏）
    this._typingIds = null;            // 打字动画中的卡 id 集（钉屏）
    this._editingId = null;            // 正在编辑的卡 id（钉屏）
    this._cullRaf = 0;
    this._CULL_MARGIN = 240;           // 视口外预取边距(px)
  },

  /** 接入画中卷功能舞台 */
  async mount(stageEl) {
    if (this._el) return;
    this._ensureDom(stageEl);
    this._initUndo();
    this._makeCanvasDraggable();
    this._bindSelectionKeys();
    this._bindLevelKeys();
    this._bindInput();
    this._bindThemeSwitch();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    // 对齐原版：打开即聚焦输入框，便于直接键入
    if (this._input) this._input.focus();
    // 异步加载已保存便签并重建（直接显示全文，不重放动画）
    await this._restore();
  },

  /** 退出：清理全部打字计时器与 DOM 监听，释放引用 */
  unmount() {
    // —— 先收尾副作用（清 timer / 落盘 / 断 observer / 移除监听 / teardown）——
    this._timers.forEach((t) => { try { clearInterval(t); } catch (_) { /* 忽略 */ } });
    this._timers = [];
    if (this._msgTimer) { try { clearTimeout(this._msgTimer); } catch (_) { /* 忽略 */ } this._msgTimer = null; }
    // 【P0】退出前无条件落盘一次（fire-and-forget：宿主仍在，bridge 可用）。
    // 原先只在 _saveTimer 存在时才写，若用户恰好在打字动画途中关闭/切走视图，
    // 这张便签可能从未排过保存 → 静默丢失。此处统一兜底（配合 pendingText 拿到全文）。
    if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
    this._saveNow();
    TypewriterStore.invalidateWritingIndex();   // 卸载后 settings 可能被外部改写，丢弃索引缓存
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._hideLevelMenu();                  // 先摘掉文档级监听，再移除浮层 DOM
    if (this._levelMenu) { this._levelMenu.remove(); this._levelMenu = null; }
    MindmapFeature.teardown();   // 导图层的 DOM 引用一并清掉，下次 mount 重建
    if (this._audioCtx) { try { this._audioCtx.close(); } catch (_) { /* 忽略 */ } this._audioCtx = null; }
    if (this._linkRo) { this._linkRo.disconnect(); this._linkRo = null; }
    if (this._fitRo) { this._fitRo.disconnect(); this._fitRo = null; }
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._themeMo) { this._themeMo.disconnect(); this._themeMo = null; }
    // 历史只属于本次会话的文档：卸载即弃，避免重挂载后把旧状态的快照带回来
    if (this._undoStack) { this._undoStack.reset(); this._undoStack = null; }
    if (this._linkRaf) { cancelAnimationFrame(this._linkRaf); this._linkRaf = 0; }
    if (this._geo && this._geo.flushRaf) cancelAnimationFrame(this._geo.flushRaf);
    // 调试出口：控制台可直接 __twPerf.on() → 操作一会儿 → __twPerf.report() 实测
    if (typeof window !== 'undefined') {
      window.__twPerf = {
        on: () => this._setPerf(true),
        off: () => this._setPerf(false),
        report: () => this._perfReport(),
        reset: () => this._perfReset(),
      };
    }
    if (this._cullRo) { this._cullRo.disconnect(); this._cullRo = null; }
    clearTimeout(this._hoverTimer);
    if (this._selKeyHandler) { document.removeEventListener('keydown', this._selKeyHandler); this._selKeyHandler = null; }
    // 【B 修复】_bindLevelKeys 在 mount 时挂的文档级 keydown 监听，此前 unmount 漏摘 →
    // 每开/关一次视图就多挂一个活监听器（单例 this 相同），Cmd/Ctrl+1..6 被 N 重触发。此处对称移除。
    if (this._levelKeyHandler) { document.removeEventListener('keydown', this._levelKeyHandler); this._levelKeyHandler = null; }
    if (this._marquee) { this._marquee.remove(); this._marquee = null; }
    // —— 纯字段归零统一走 _resetState()，不再逐字段散列（见 _resetState 注释）——
    this._resetState();
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
            <button type="button" class="tw-theme-switch" id="twThemeSwitch" role="switch" aria-checked="false" aria-label="切换 Obsidian 明暗" title="切换 Obsidian 明暗"><span class="tw-theme-switch-knob" aria-hidden="true"></span></button>
            <span class="tw-case-right">BAMBOO IMMORTALS</span>
          </div>

          <div class="tw-screen">
            <div class="tw-screen-glare" aria-hidden="true"></div>
            <div class="tw-screen-top">
              <span id="twScreenTitle">凝墨成笺</span>
              <span class="tw-screen-font">
                <span id="twMetaNotes">FONT: <b id="twFontLabel">${FONT_LABELS.classic}</b> · <b id="twPaperLabel">${PAPER_LABELS.plain}</b></span>
                <span id="twMetaWrite" hidden>卡片 <b id="twCardCount">0</b> · 连线 <b id="twLinkCount">0</b></span>
                <span id="twMetaMindmap" hidden>子弹 <b id="twNodeCount">0</b> · 连线 <b id="twDepthCount">0</b></span>
              </span>
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
              <button type="button" class="tw-rbtn" id="twArrange" title="一键排版：便签排网格 / 写作顺流重排 / 导图自动布局（选中≥2张时只排选中组，否则排全部）" aria-label="一键排版画布">${ICON_GRID}</button>
            </div>
            <div class="tw-grill" aria-hidden="true"><i></i><i></i><i></i></div>
            <button type="button" class="tw-print" id="twPrint" title="打印" aria-label="打印">${ICON_PRINT}</button>
          </div>

          <button type="button" class="tw-knob" id="twKnob" data-mode="notes" title="拨动齿轮：便签画布 / MD可视化写作 / 思维子弹" aria-label="切换模式：便签画布 / MD可视化写作 / 思维子弹" aria-pressed="false">
            <span class="tw-knob-wheel" aria-hidden="true">
              <i class="tw-knob-rim"></i>
              <i class="tw-knob-mark"></i>
            </span>
          </button>
        </div>
        <div class="tw-desk-shadow" aria-hidden="true"></div>
      </div>

      <!-- MD可视化写作模式：第一个机身键（#twPaper）打开的「整篇预览」弹窗。
           按连线顺序把卡片合成整篇 Markdown 展示（只读、不落盘），确认结构后再用第二个键导出。
           其余模式不开此弹窗（#twPaper 仍是切纸样/切子弹样式）。 -->
      <div class="tw-preview-modal" id="twPreviewModal" hidden>
        <div class="tw-preview-panel" role="dialog" aria-modal="true" aria-label="整篇预览">
          <div class="tw-preview-head">整篇预览 <span class="tw-preview-stat" id="twPreviewStat"></span></div>
          <p class="tw-preview-hint">按连线顺序合成后的整篇 Markdown（只读，不会改动卡片或落盘）。确认无误后用第二个键导出成文。</p>
          <textarea id="twPreviewBody" class="tw-preview-body" readonly spellcheck="false" aria-label="整篇 Markdown 预览"></textarea>
          <div class="tw-preview-actions">
            <button type="button" id="twPreviewClose" class="tw-preview-btn tw-preview-btn-go">关闭</button>
          </div>
        </div>
      </div>`;

    stageEl.appendChild(wrap);
    this._el = wrap;
    this._ensureDocCorner();
    this._canvas = wrap.querySelector('.tw-canvas');
    // 连线层（与思维子弹共用 LinkLayer：便签卡片之间的关联连线）
    this._linkLayer = new LinkLayer({
      container: this._canvas,
      nodeSelector: '.tw-card',
      getLinks: () => this._links,
      setLinks: (a) => { this._links = a; },
      addLink: (f, t) => this._addLink(f, t),
      removeLink: (f, t) => this._removeLink(f, t),
      removeLinksOf: (id) => this._removeLinksOfData(id),
      // 【P8 视口剔除】连线端点几何源：挂载卡读活 DOM、离屏卡读几何缓存，使剔除卸载 DOM 后连线不断
      getGeom: (id) => this._getGeom(id),
      onChange: () => this._scheduleSave(),
      anchorClass: 'tw-card-link',
      decorateAnchor: (a) => this._applyKnobSize(a),
    });
    this._input = wrap.querySelector('.tw-input');
    this._case = wrap.querySelector('.tw-case');
    // 点画布空白处取消钉住（工具条收起）；点在便签上由各自的拖拽逻辑处理
    this._canvas.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tw-card')) return;
      this._pinOnly(null);
      this._clearSelection();   // 点空白：清空多选
      this._exitAllEdits(); // 点空白：退出正在编辑的便签并落盘
    });
    // 导图层与便签画布互斥显示：同挂在 wrap 下、同为 flex:1，机身仍是底部那一项
    MindmapFeature.mount({ state: this._state, ctrl: this }, wrap);
    this._applyModeChrome();   // 首次挂载即把面板语义对齐（默认便签模式）
    this._observeScale();
    // 视口剔除（P8）：画布尺寸变化即重算挂载（离屏卡卸载、进屏卡重建）
    if (typeof ResizeObserver !== 'undefined' && this._canvas) {
      this._cullRo = new ResizeObserver(() => this._scheduleCull());
      this._cullRo.observe(this._canvas);
    }
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
      // 根字号一变，所有卡片的 em 尺寸同步变 → 全部几何一次性失效（合帧后统一重测）
      this._invalidateGeoAll();
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
      // 外围圆钮（旋转/连线）同策略内联像素：两钮必须严格等大，缩放变化时跟随刷新
      this._el.querySelectorAll('.tw-card-rotate, .tw-card-link').forEach((k) => this._applyKnobSize(k));
    };
    apply();
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(apply);
      this._ro.observe(this._case);
    }
  },

  /** 机身明暗开关：绑定点击并跟随主题变化同步状态。
   *  画中卷 iframe 内没有 store，bridge.js 的 theme:changed 走 else 分支无条件把 .dark
   *  同步到 <html>/<body>/#bamboo-shadow-host（见 bridge.js / scrollManager._applyDark）；
   *  观察这几个节点的 class 变化，即可让开关状态始终与实际主题一致。 */
  _bindThemeSwitch() {
    const sw = this._el && this._el.querySelector('#twThemeSwitch');
    if (!sw) return;
    sw.addEventListener('click', () => this._toggleObsidianTheme());
    this._syncThemeSwitch();
    if (typeof MutationObserver !== 'undefined') {
      this._themeMo = new MutationObserver(() => this._syncThemeSwitch());
      const opts = { attributes: true, attributeFilter: ['class'] };
      this._themeMo.observe(document.documentElement, opts);
      if (document.body) this._themeMo.observe(document.body, opts);
      const host = document.getElementById('bamboo-shadow-host');
      if (host) this._themeMo.observe(host, opts);
    }
  },

  /** 当前是否为暗色（与 bridge.js / scrollManager 的 .dark 落点保持一致） */
  _isDarkNow() {
    const host = typeof document !== 'undefined' ? document.getElementById('bamboo-shadow-host') : null;
    if (host && host.classList.contains('dark')) return true;
    if (document.documentElement.classList.contains('dark')) return true;
    return !!(document.body && document.body.classList.contains('dark'));
  },

  /** 把开关视觉状态同步到当前明暗（暗 = 拨到右侧并点亮） */
  _syncThemeSwitch() {
    const sw = this._el && this._el.querySelector('#twThemeSwitch');
    if (!sw) return;
    const dark = this._isDarkNow();
    sw.setAttribute('aria-checked', dark ? 'true' : 'false');
    sw.classList.toggle('is-dark', dark);
  },

  /** 切换 Obsidian 明暗：经 bridge 请求宿主改基础主题；宿主改完会重放 css-change，
   *  画中卷据此无条件跟随（本视图无 store，bridge 走 else 分支）。 */
  async _toggleObsidianTheme() {
    const sw = this._el && this._el.querySelector('#twThemeSwitch');
    const next = !this._isDarkNow();
    // 乐观更新：避免宿主往返期间开关「回弹」
    if (sw) {
      sw.setAttribute('aria-checked', next ? 'true' : 'false');
      sw.classList.toggle('is-dark', next);
    }
    const sm = (typeof window !== 'undefined') ? window.storageManager : null;
    if (!sm || typeof sm.toggleObsidianTheme !== 'function') {
      this._syncThemeSwitch();
      this._showScreenMsg('明暗切换不可用', 1200);
      return;
    }
    const res = await sm.toggleObsidianTheme(next);
    if (!res || res.ok === false) {
      this._syncThemeSwitch();
      this._showScreenMsg('明暗切换失败', 1200);
      return;
    }
    const applied = typeof res.isDark === 'boolean' ? res.isDark : next;
    if (sw) {
      sw.setAttribute('aria-checked', applied ? 'true' : 'false');
      sw.classList.toggle('is-dark', applied);
    }
    this._showScreenMsg(applied ? 'DARK MODE' : 'LIGHT MODE', 900);
  },

  _bindInput() {
    const input = this._input;
    const cursor = this._el.querySelector('#twCursor');
    input.addEventListener('focus', () => cursor.classList.add('on'));
    input.addEventListener('blur', () => cursor.classList.remove('on'));

    // 同一个「打印」动作按模式分流：便签模式打印便签，导图模式新建节点。
    // 否则导图里打字回车会打出一张落在隐藏画布上的便签 —— 屏幕上什么都没有。
    const doPrint = () => this._commitInput();
    this._el.querySelector('#twPrint').addEventListener('click', doPrint);
    // 回车即打印：便签模式吐纸条、导图模式射出子弹（Ctrl/Cmd+Enter 亦同）。
    // Shift+Enter 保留换行，便于在便签里写多行；空输入由 _commitInput 各自提示。
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.shiftKey) return;
      e.preventDefault();
      doPrint();
    });

    // 第二个键：便签模式=切换字体；思维子弹模式=导出为 Markdown 落库（两者互不干扰）。
    this._el.querySelector('#twFont').addEventListener('click', () => {
      if (this._mode === 'mindmap') { this._exportMindmap(); return; }   // 导图模式：第二个键改为「导出为 Markdown」
      // MD可视化写作模式：第二个键 = 保存快照（当前卡片合成整篇 Markdown，写入带时间戳的独立笔记，不覆盖源笔记）
      if (this._mode === 'write') { this._saveSnapshot(); return; }
      this._fontIdx = (this._fontIdx + 1) % FONTS.length;
      const f = FONTS[this._fontIdx];
      this._el.querySelector('#twFontLabel').textContent = FONT_LABELS[f];
      this._showScreenMsg('FONT: ' + FONT_FEEDBACK[f], 1000);
    });

    // 第三个键：便签模式=一键排版（网格）；思维子弹模式=一键自动布局（多种布局循环）。两者互不干扰。
    this._el.querySelector('#twArrange').addEventListener('click', () => {
      if (this._mode === 'mindmap') {
        const label = MindmapFeature.cycleLayout();
        this._showScreenMsg(label ? ('LAYOUT: ' + label) : '画布为空', 1400);
        return;
      }
      // MD可视化写作模式：第三个键 = 排版轮换（顺流竖排 ⇄ 分幕），画布即文章骨架
      if (this._mode === 'write') { this._cycleWriteLayout(); return; }
      this._arrangeNotes();
    });

    // 红色齿轮旋钮：三档循环。点一下拨一齿；在旋钮上滚轮同样拨齿（上滚=后退，下滚=前进），
    // 滚轮方向即拨动方向 —— 与真实旋钮一致，也顺手给了键盘/触控板之外的第三种拨法。
    const knobEl = this._el.querySelector('#twKnob');
    knobEl.addEventListener('click', () => { this._cycleMode(1); });
    knobEl.addEventListener('wheel', (e) => {
      e.preventDefault();                       // 阻止页面随之滚动（旋钮是控件，不是滚动区）
      this._cycleMode(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    // 便签样式切换：循环全部 PAPERS，并更新屏幕 PAPER 标签。
    // 只影响「之后打印」的卡片，已生成的卡片保持其打印时的样式（各自 data-paper 固定）。
    this._el.querySelector('#twPaper').addEventListener('click', () => {
      if (this._mode === 'write') { this._openPreviewModal(); return; }  // 写作档：第一个键改为「整篇预览」
      if (this._mode === 'mindmap') { MindmapFeature.cycleStyle(); return; }   // 导图模式：第一个键改为切换子弹样式
      this._paperIdx = (this._paperIdx + 1) % PAPERS.length;
      const p = PAPERS[this._paperIdx];
      this._el.querySelector('#twPaperLabel').textContent = PAPER_LABELS[p];
      this._showScreenMsg('PAPER: ' + PAPER_FEEDBACK[p], 1000);
    });

    // 「整篇预览」弹窗：写作档专用，便签/导图模式不绑定（#twPaper 仍是切纸样/子弹样式）
    const previewModal = this._el.querySelector('#twPreviewModal');
    if (previewModal) {
      previewModal.addEventListener('click', (e) => { if (e.target === previewModal) this._closePreviewModal(); });
      previewModal.querySelector('#twPreviewClose').addEventListener('click', () => this._closePreviewModal());
      // Esc 关闭：keydown 从只读框冒泡到弹窗，焦点在框内也生效
      previewModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); this._closePreviewModal(); }
      });
    }
  },

  /** 屏幕系统消息浮层（TRANSMITTING / FONT 反馈） */
  _showScreenMsg(text, duration = 1400) {
    const msg = this._el.querySelector('#twScreenMsg');
    msg.textContent = text;
    msg.classList.add('on');
    if (this._msgTimer) clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(() => msg.classList.remove('on'), duration);
  },

  /** 文件名时间戳：YYYYMMDD-HHMM（避免与导出头里的人类可读时间重复） */
  _stamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  },

  /** 思维子弹模式：第二个机身键 = 把子弹图导出为 Markdown 并落库到 Vault（画中卷/子弹笔记/）。
   *  便签模式不触发本方法（#twFont 在便签模式仍是切换字体），故完全不干扰便签功能。
   *  落库成功后在 Obsidian 打开该笔记；若桥不可用则兜底下载 .md 并复制到剪贴板。 */
    async _exportMindmap() { return ModeController.exportMindmap({ state: this._state, ctrl: this }); },

  /** 卡片按阅读顺序（自上而下、同排从左到右）—— 自动串联与「无连线」兜底都用它。 */
    _cardsByReadingOrder() { return PersistenceCoordinator.cardsByReadingOrder({ state: this._state, ctrl: this }); },

  /** MD可视化写作模式：按「连线顺序」把卡片串成文章。
   *  连线即写作顺序：从没有入边的卡出发，沿 from→to 深度优先走。
   *  完全没连线的卡退化为阅读顺序；成环只走一次、残留按阅读顺序补尾 ——
   *  保证任何连线形态下都不丢卡片、不死循环，且顺序稳定可复现。 */
    _orderCards() { return PersistenceCoordinator.orderCards({ state: this._state, ctrl: this }); },

  /** 写作档：按 _orderCards() 给每张卡贴顺序徽标（连线/阅读顺序）。
   *  非写作档不显示并清理遗留徽标。新增/删除/连线/拖动/切档都会触发刷新，
   *  保证徽标与「整篇预览 / 导出」的顺序严格一致，让文章顺序在画布上可见。 */
    _refreshWriteOrder() { return PersistenceCoordinator.refreshWriteOrder({ state: this._state, ctrl: this }); },

  /** 写作档新卡的落点锚：有选中卡时取「选中组里排在最末的那张」（新卡接其后 = 续写），
   *  否则取文章末尾那张。顺序取自 _orderCards()（优先连线、回退阅读顺序）—— 与徽标 /
   *  预览 / 导出同一套，故「末尾」是真·文末，而非画布上碰巧最靠下的那张。
   *  exclude：刚 append 进 DOM 的新卡必须排除，否则它会把自己当成锚点。 */
    _spawnAnchorCard(exclude) { return CardViewManager.spawnAnchorCard({ state: this._state, ctrl: this }, exclude); },

  /** 写作档：把卡片平移进视野 —— 仅在它确实看不见时才动，免得每打一张画布都跳一下。
   *  只调画布偏移，绝不改卡片坐标：坐标是「文章顺序」的真值，不能为了可见性去动它。 */
  _ensureCardVisible(cardOrId) { return ViewportCuller.ensureCardVisible({ state: this._state, ctrl: this }, cardOrId); },

  /** 把排好序的卡片渲染成 Markdown。
   *  - h1..h6：首行做标题；卡内若还有余下的行，紧跟着成段落
   *  - p：原文照排（卡内换行保留为软换行），卡片之间空一行分段
   *  - quote：逐行加 "> " 前缀 */
    _buildCardsMarkdown(ordered) { return ModeController.buildCardsMarkdown({ state: this._state, ctrl: this }, ordered); },

  /** 写作模式第 2 个键 = 保存快照：把当前卡片合成整篇 Markdown，写入一份「带时间戳」的独立笔记。
   *  每次都生成新文件（MD可视化写作/<组名> 快照 <时间>.md），互不覆盖，自然形成可回看的版本历史。 */
    async _saveSnapshot() { return PersistenceCoordinator.saveSnapshot({ state: this._state, ctrl: this }); },

  /** MD可视化写作模式：机身第三个键 —— 按「文章顺序」（优先连线、无连线回退阅读顺序，
   *  与顺序徽标/整篇预览/导出完全一致）把卡片顺成一条干净的竖向阅读流，让画布本身成为文章骨架。
   *  只改位置、不动卡片尺寸/旋转（非破坏性），原有连线保留（端点随位置更新）。
   *  与便签模式的「网格排版」区分：那边是无序网格，这边是有序竖列（顺序即文章顺序）。 */
    _reflowWriteOrder() { return PersistenceCoordinator.reflowWriteOrder({ state: this._state, ctrl: this }); },

  /** 写作档排版轮换：顺流竖排 ⇄ 分幕。只切档位，实际布局仍由 _reflowWriteOrder 统一执行，
   *  故撤销 / 落盘 / 几何同步 / 居中 / 提示等收尾动作只有一份实现。 */
  _cycleWriteLayout() {
    this._layoutMode = (this._layoutMode === 'acts') ? 'flow' : 'acts';
    this._reflowWriteOrder();
  },

  /** 兜底：把 Markdown 作为 .md 文件下载到本地（桥不可用环境） */
    _downloadMarkdown(filename, content) { return ModeController.downloadMarkdown({ state: this._state, ctrl: this }, filename, content); },

  /** MD可视化写作模式：第一个机身键打开的「整篇预览」。
   *  按连线顺序（无连线则回退阅读顺序）把卡片合成整篇 Markdown 展示，
   *  与保存快照（_saveSnapshot → _buildCardsMarkdown）共用同一套排序与合成逻辑，
   *  所以这里看到的内容与导出得到的完全一致 —— 导出前先确认结构，避免反复开文件核对。
   *  只读展示：不新建也不改动任何卡片，更不落盘，因此没有任何性能负担。 */
    _openPreviewModal() { return ModeController.openPreviewModal({ state: this._state, ctrl: this }); },

  /** 关闭整篇预览 */
    _closePreviewModal() { return ModeController.closePreviewModal({ state: this._state, ctrl: this }); },

  /** 提交输入框内容：按当前模式决定产出（便签 / 导图节点）。
   *  机身是同一台，但「敲字之后会得到什么」必须跟模式走 —— 这是打字机分模式工作的核心。 */
  _commitInput() {
    const input = this._input;
    if (!input) return;
    const text = input.value.trim();
    if (this._mode === 'mindmap') {
      if (!text) { this._showScreenMsg('先输入文字，再新建节点', 1200); return; }
      if (!MindmapFeature.addNodeFromInput(text)) { this._showScreenMsg('新建节点失败', 1200); return; }
      this._playBulletSound();   // 子弹从打字机射出时的音效（与飞出动画配对）
      input.value = '';
      this._draft.mindmap = '';
      this._showScreenMsg('已新建节点', 1000);
      this._refreshScreenMeta();
      return;
    }
    if (this._mode === 'write') {
      const { level, text: clean } = this._detectWriteLevel(text);
      this._spawn(clean, level);
    } else {
      this._spawn(text);
    }
  },

  /** 面板语义随模式切换：屏幕标题/右侧元信息、输入框 placeholder 与草稿、按钮可用性。
   *  纸样/字体/排版只对便签有意义，导图模式下必须置灰 —— 否则用户点了会作用到看不见的便签上，
   *  这正是「两个模式互相干扰」的典型表现。 */
    _applyModeChrome() { return ModeController.applyModeChrome({ state: this._state, ctrl: this }); },

  /** 屏幕右上角元信息按档回显：导图=子弹数/连线数；写作=卡片数/连线数；便签是静态的 FONT·PAPER。
   *  写作档的数字由 _refreshWriteOrder 驱动刷新 —— 它覆盖了增删卡/连线/拖动/切档全部时机。 */
    _refreshScreenMeta() { return ModeController.refreshScreenMeta({ state: this._state, ctrl: this }); },

  /** 构建一张卡片 DOM（不含定位与文本填充），绑定删除与拖拽。
   *  note: { id, font, paper, date, level } —— 数据属性写入 dataset 供落盘收集。 */
    _createCardEl(note) { return CardViewManager.createCardEl({ state: this._state, ctrl: this }, note); },

  /** 写作档：从输入框文本里嗅出结构级别（Markdown 行首前缀）。
   *  "# "→h1 … "###### "→h6、" > "→引用、" - "/" * "→无序、" 1. "/" 1)"→有序、
   *  " - [ ] "→待办；其余当正文。只解析首行，剥掉前缀后把余文交回正文。 */
    _detectWriteLevel(raw) { return CardViewManager.detectWriteLevel({ state: this._state, ctrl: this }, raw); },

  /** 生成一张纸条卡片：文本呈现 + 可拖拽 + 落盘。
   *  write 模式允许传入 level（由输入框的 Markdown 前缀推导，如 "# " → h1），
   *  便签/导图模式不传，落到默认正文。
   *  【呈现方式按模式分流】写作档一次性落全文（连续成文不该等字一个个蹦）；
   *  便签档才是逐字打字 —— 那是寻呼机的签名动效。 */
  _spawn(text, level) {
    if (!text) {
      if (typeof Toast !== 'undefined') Toast.showToast('请先输入文字', 'error');
      return;
    }
    this._showScreenMsg('TRANSMITTING...', 1500);
    // 吐纸音效（在用户手势内触发：点 PRINT / Cmd+Enter 已建立并 resume 音频上下文）
    this._ensureAudio();
    this._playFeedSound();
    const canvas = this._canvas;
    const font = FONTS[this._fontIdx];
    const paper = PAPERS[this._paperIdx];
    const date = this._now();
    const id = WritingDoc.newId();
    const card = this._createCardEl({ id, font, paper, date, level });

    // 落点按模式分流：
    //  便签档 —— 以打字机中轴线吐纸，垂直停在画布中央略偏上（纸是从机器里吐出来的）。
    //  写作档 —— 接在文章末尾（有选中卡时接在选中组之后）。
    //            画布此时是一篇自上而下的文章，新卡落在中央会打断成文流，
    //            每打一张都得手动归位（或重跑一次顺流重排）—— 这是本档最大的日常摩擦。
    card.style.zIndex = String(++this._zTop);
    canvas.appendChild(card);
    const cr = canvas.getBoundingClientRect();
    const cw = card.offsetWidth || 340;
    const ch = card.offsetHeight || 200;
    const anchor = (this._mode === 'write') ? this._spawnAnchorCard(card) : null;
    if (anchor) {
      // 文章流：与锚点卡左对齐、落在其下方 WRITE_FLOW_GAP 处（与顺流重排同一间距）。
      // 刻意不做吐纸堆叠错位：那是为了「看见下面压着纸」，文章里没有这个语义。
      // 锚点信息由 _spawnAnchorCard 给出：在屏取 DOM 实测值，离屏（被剔）取模型坐标 + 几何缓存高度。
      card.style.left = anchor.x + 'px';
      card.style.top = (anchor.y + (anchor.h || 0) + WRITE_FLOW_GAP) + 'px';
      card.style.bottom = 'auto';
    } else {
      const beeperEl = this._el.querySelector('.tw-beeper');
      const br = beeperEl.getBoundingClientRect();
      const deviceCenterX = br.left + br.width / 2 - cr.left;
      // 吐纸位叠放：新纸一律落在出纸口正上方（寻呼机中轴、画布中央略偏上），
      // 只逐张做小幅上错位 —— 像纸一张张叠出来，能看到下面还压着纸。
      // 刻意不做「互不重叠」的搬移：那样纸就不是从打印机吐出来的了，
      // 且画布下方紧邻机身（机身 z-index 30 > 便签 20），往下搬会被机身挡住。
      const stackIdx = this._spawnIdx++ % STACK_LEVELS;
      // 【P4】吐纸错位堆叠是「看见下面压着纸」的便签隐喻，文章里没有这个语义 ——
      // 写入档不做错位，新卡从文章流起点（或锚点）干净接续。
      const stackOffset = (this._mode === 'write')
        ? 0
        : ((STACK_LEVELS - 1) / 2 - stackIdx) * STACK_STEP;  // 新纸逐张上叠
      card.style.left = (deviceCenterX - cw / 2) + 'px';
      card.style.top = ((cr.height - ch) / 2 - 24 + stackOffset) + 'px';
      card.style.bottom = 'auto';
    }
    // 连续编辑改走 WritingDoc 原语：新卡即时进入规范模型（x/y 取刚算出的落点、
    // 视觉属性取卡片实际应用的 dataset 值），保存/撤销/导出自此同源。
    // 【顺序一等数据】必须带 seq = 当前最大 + 1（接文末）。
    //  漏掉会让新卡 seq === undefined，被 cardsByReadingOrder 按 0 参与排序 → 新卡被排到最前、
    //  徽标显示 1（而非应得的文末序号），这正是「新建卡序号不对」的根因。
    //  此处是手写对象字面量建卡，未走 WritingDoc.addNote，故 seq 必须在本地补上。
    const maxSeq = this._notes.reduce((m, n) => (Number.isFinite(n.seq) && n.seq > m ? n.seq : m), -1);
    this._notes = this._notes.concat([{
      id,
      seq: maxSeq + 1,
      text: text || '',
      x: parseFloat(card.style.left) || 0,
      y: parseFloat(card.style.top) || 0,
      font: card.dataset.font || 'classic',
      paper: card.dataset.paper || 'plain',
      level: card.dataset.level || 'p',
      date: card.dataset.date || '',
      zoom: parseFloat(card.dataset.zoom) || 1,
      fontScale: Number(card.dataset.fontScale) || 1,
      rot: Number(card.dataset.rot) || 0,
      }]);
      this._mountedCards.set(id, card);   // 登记到挂载表（视口剔除据此判断在屏/离屏；须早于任何 cull 触发，避免重复建卡）
      // 【P8 空间索引】新卡立刻进几何单源（落点 + 默认尺寸），否则打字中途的 cull pass 会把它误卸载；
      // 经 ViewportCuller.setGeom 同时刷 geo / spatial，挂载后 _measureCard 会覆盖为实测尺寸。
      ViewportCuller.setGeom({ state: this._state, ctrl: this }, id, {
        x: parseFloat(card.style.left) || 0,
        y: parseFloat(card.style.top) || 0,
        w: 340, h: 200,
        rot: Number(card.dataset.rot) || 0,
      });
    // 注：写作档的「把新卡带进视野」不在这里做 —— 此刻文本还没落、卡片高度是空卡高度，
    // 算出来的偏移会白校正一次。挪到下面文本写完之后（详见 write 分支内的调用）。

    // 吐纸入场：从打印口下方弹入就位（.tw-feed 关键帧在 base.css）。
    // 仅新打的便签挂此 class；_restore 重建历史便签不挂，故重开不重放动画。
    card.classList.add('tw-feed');
    card.addEventListener('animationend', () => card.classList.remove('tw-feed'), { once: true });

    const textEl = card.querySelector('.tw-card-text');

    // 吐字与否按模式分流：
    //  写作档 —— 卡片是「文章的一块」，逐字吐字（TYPE_SPEED=50ms/字，一张长卡要几秒）
    //            会拖慢连续成文，故直接落全文一次性展现。
    //            刻意保留吐纸入场 .tw-feed：它不是逐字累进，不拖慢阅读，且让新卡有
    //            「落到画布上」的存在感（_reflowWriteOrder 也依赖卡片已是最终尺寸）。
    //  便签档 —— 保留逐字打字的设备签名动效（PWM 脉冲光标 + 字一个个蹦出来）。
    if (this._mode === 'write') {
      textEl.textContent = text;
      this._scheduleSave();
      // 追加到文末的新卡多半在视野之外，且此刻文本刚落定、卡片才是最终高度 ——
      // 必须等到这里再校正，否则按空卡高度算是白校正一次（成文流会看着是断的）。
      this._ensureCardVisible(card);
    } else {
      textEl.classList.add('is-typing');

      // 【P0】落盘与打字动画解耦：把「目标全文」先写进 dataset.pendingText 并立刻排一次落盘，
      // 使便签在动画刚开始时就已经落盘（_collectNotes 优先读 pendingText）。
      // 否则若用户在打字途中关闭/切走视图，磁盘上根本没有这张便签 → 静默丢数据。
      card.dataset.pendingText = text;
      if (!this._typingIds) this._typingIds = new Set();
      this._typingIds.add(id);   // 打字中：钉在屏上，剔除跳过（避免动画被打断/焦点丢失）
      this._scheduleSave();
      // 新便签进画布

      // 逐字缓慢打出；打完即补齐全文并落盘
      let i = 0;
      const timer = setInterval(() => {
        if (i >= text.length) { this._finishTyping(card); return; }
        textEl.textContent += text[i++];
      }, TYPE_SPEED);
      card._typing = { timer, textEl, text };
      this._timers.push(timer);
    }

    // 清空输入，便于连续生成
    this._input.value = '';
    this._input.focus();

    this._measureCard(card);            // 文本已落定：量一次几何进缓存，连线/剔除都读它
    this._refreshWriteOrder();          // 新卡入画布：刷新写作档顺序徽标

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
    this._notes = WritingDoc.setText(this._notes, card.dataset.id, t.text);  // 打字完成：同步模型
    if (this._typingIds) this._typingIds.delete(card.dataset.id);
    this._measureCard(card);   // 全文落定，重测几何（尺寸变终值）
    this._scheduleSave();
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
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

  /** 子弹音效：打字机「射出」一颗子弹时的 "咔——咻"。
   *  先一声机械字锤击打（高频短噪），紧接一段快速下滑的方波 "pew"，极轻、短促，
   *  与齿轮转动音（呜+咔）、吐纸音（棘轮咔哒）都区分开，不淹没打字。 */
  _playBulletSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* 忽略 */ } }
      const now = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.14;
      out.connect(ctx.destination);

      // 字锤击打「咔」：极短高通噪声脉冲
      const tl = 0.035;
      const tlBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * tl), ctx.sampleRate);
      const td = tlBuf.getChannelData(0);
      for (let i = 0; i < td.length; i++) td[i] = (Math.random() * 2 - 1) * (1 - i / td.length);
      const ts = ctx.createBufferSource(); ts.buffer = tlBuf;
      const tf = ctx.createBiquadFilter(); tf.type = 'highpass'; tf.frequency.value = 2000;
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.5, now);
      tg.gain.exponentialRampToValueAtTime(0.001, now + tl);
      ts.connect(tf); tf.connect(tg); tg.connect(out);
      ts.start(now); ts.stop(now + tl + 0.01);

      // 子弹「咻」：快速下滑方波（pew）
      const osc = ctx.createOscillator(); osc.type = 'square';
      osc.frequency.setValueAtTime(820, now + 0.012);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.13);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, now + 0.012);
      og.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.connect(og); og.connect(out);
      osc.start(now + 0.012); osc.stop(now + 0.16);
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

  /** 齿轮转动音效：模拟拨动旋钮时齿轮转一齿的"呜——咔"。
   *  带通噪声随转动上扫再回落（机械呜声）+ 首尾两声金属"咔"（齿咬合），
   *  增益极轻，与吐纸音效同源但更短促，不打断打字。 */
  _playGearSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this._audioCtx) this._audioCtx = new AC();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* 忽略 */ } }
      const now = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.12;            // 整体增益（与吐纸音效同级，极轻）
      out.connect(ctx.destination);

      // 转动"呜"：带通噪声，频率随转动上扫再回落，像齿轮转半圈
      const dur = 0.16;
      const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(700, now);
      bp.frequency.exponentialRampToValueAtTime(1400, now + dur * 0.5);
      bp.frequency.exponentialRampToValueAtTime(800, now + dur);
      bp.Q.value = 3;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, now);
      ng.gain.exponentialRampToValueAtTime(0.6, now + 0.02);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(bp); bp.connect(ng); ng.connect(out);
      src.start(now); src.stop(now + dur + 0.01);

      // 两声金属"咔"（齿咬合）：落在转动的首尾
      this._feedTick(ctx, out, now, false);
      this._feedTick(ctx, out, now + dur - 0.03, true);
    } catch (_) { /* 音频不可用时静默 */ }
  },

  /** 卡片拖拽：相对画布定位，限制在画布范围内；松手即落盘 */
    _makeDraggable(card) { return CardInteractions.makeDraggable({ state: this._state, ctrl: this }, card); },

  /** 画布桌面整体拖拽：机身(.tw-beeper)固定在文档流不动，便签桌面(.tw-canvas)用 transform 平移，
      便签作为画布子元素自然跟随。点便签(.tw-card)或按钮时交给各自逻辑，不触发画布拖动。 */
    _makeCanvasDraggable() { return CardInteractions.makeCanvasDraggable({ state: this._state, ctrl: this }); },

  /** 把画布平移到指定偏移并持久化 */
    _setCanvasOffset(x, y) { return CardInteractions.setCanvasOffset({ state: this._state, ctrl: this }, x, y); },

  /** 画布 transform：仅平移（画布固定 100% 不缩放），transform-origin 固定 0,0（见 CSS） */
    _applyCanvasTransform() { return CardInteractions.applyCanvasTransform({ state: this._state, ctrl: this }); },

  /** 恢复后把便签群居中到当前视野（仅平移、不缩放）。
   *  画布固定 100% 不缩放；画布尚未布局时挂一次性 ResizeObserver 等拿到尺寸再居中。
   *  每次 mount（含「侧边栏↔中央」重建）都跑一次，保证切到更宽视图时便签重新居中；
   *  运行中手动平移因 _fitDone 已置真、本函数不再触发，故视角仍被保留。 */
    _ensureNotesVisible() { return CardInteractions.ensureNotesVisible({ state: this._state, ctrl: this }); },

  /** 把便签群归位到视野中心（仅平移、不缩放）：便签被拖出视野后，双击空白或按 F 找回 */
    _recenterNotes() { return CardInteractions.recenterNotes({ state: this._state, ctrl: this }); },

  /** 一键排版：把便签按创建顺序排成整齐网格（列数随画布可用宽自适应：窄栏单列竖排，宽栏至多√n列；列宽统一、行高随行内最高、间距统一、不重叠）；并顺带把尺寸档位与旋转归零到标准态。
   *  选中 ≥2 张时只对选中组排版；选中 0 或 1 张则对整个画布排版
   *  （单张排版本无意义，按用户「整理整体」的意图处理）；排完居中显示成果。 */
    _arrangeNotes() { return CardInteractions.arrangeNotes({ state: this._state, ctrl: this }); },

  /** 红色齿轮旋钮：三档循环 —— 便签画布 → MD可视化写作 → 思维子弹 → 便签画布。
   *  dir=+1 前进一齿，dir=-1 后退一齿。 */
    _cycleMode(dir) { return ModeController.cycleMode({ state: this._state, ctrl: this }, dir); },

  /** 拨到指定档位。
   *  【三份独立文档】便签 / MD可视化写作 / 思维子弹各存各的 key，互不可见。
   *  切档 = 先把画布写回「离开的那一份」，再清空画布、载入「进入的那一份」；
   *  于是两篇稿子永远不会混在一起，来回拨动也不会互相覆盖。 */
    async _setMode(mode) { return ModeController.setMode({ state: this._state, ctrl: this }, mode); },

  /** 导图「沿便签连线建树」的只读数据源：只读文本与连线快照，绝不回写便签 */
  getSeedSource() {
    // 【P8 视口剔除】卡片文本必须来自模型真源，不能读 querySelectorAll('.tw-card')：
    // 离屏卡被剔不在 DOM → 读 DOM 会漏掉这些卡，喂出的导图树残缺。
    // 仅「正在打字动画中」的卡用 dataset.pendingText（此时必在屏、被钉屏，不会是离屏卡）。
    const mounted = this._mountedCards || new Map();
    const cards = (this._notes || []).map((n) => {
      const el = mounted.get(n.id);
      const text = (el && el.dataset && el.dataset.pendingText != null)
        ? el.dataset.pendingText
        : (n.text || '');
      return { id: n.id, text };
    });
    return { cards, links: (this._links || []).slice() };
  },

  // ===== 多选 / 框选 / 成组操作 =====

  /** 仅选中一张（清空其余高亮） */
    _selectOnly(card) { return CardInteractions.selectOnly({ state: this._state, ctrl: this }, card); },

  /** Shift 点击：在选中集合里切换该卡 */
    _toggleSelect(card) { return CardInteractions.toggleSelect({ state: this._state, ctrl: this }, card); },

  /** 选中卡片后把全局打印框（twInput）交还焦点：避免随后按 Delete/Backspace 时
   *  isFromTextEntry 把事件判定成「在输入框删字」而删不掉卡片。
   *  仅当焦点确实停在打印框才 blur，绝不误伤卡片内编辑（contentEditable）等真实焦点。 */
    _blurInput() { return CardInteractions.blurInput({ state: this._state, ctrl: this }); },

  /** 清空全部选中 */
    _clearSelection() { return CardInteractions.clearSelection({ state: this._state, ctrl: this }); },

  /** 卡片从视图移除前的统一资源释放：打字 timer、编辑态事件监听、瞬时集合引用。
   *  所有「卡片销毁」路径（_removeCard 删除 / _unmountCard 剔除卸载 / 上限自动归档 / 撤销重建）
   *  都必须先经过它 —— 卡片视图持有 timer、事件监听等需显式释放的资源，销毁若不走统一入口，
   *  散落的清理极易遗漏（便签模式打字中删卡就曾因此漏清 setInterval，孤儿 tick 在 detached
   *  节点上跑完并写回幽灵几何到 _spatial）。
   *  只清「随 DOM 一起消失的视图资源与瞬时集合」，不动 _notes/_links 数据模型，
   *  也不动 _geo/_spatial 几何缓存（离屏卸载需保留供连线端点用，由调用方按语义决定删否）。 */
  _disposeCard(card) { return ViewportCuller.disposeCard({ state: this._state, ctrl: this }, card); },

  /** 删除单张便签（持有 DOM 元素时的便捷入口）：委托给 _removeNoteById。
   *  收敛成一处，是为了让「卡片工具条 ×」「多选快捷键删除」「超上限自动归档」
   *  三条删除路径共用同一套清理 —— 此前 × 按钮独自实现、漏掉撤销留档，
   *  于是点 × 删掉的便签 Cmd+Z 找不回来。 */
    _removeCard(card) { return CardInteractions.removeCard({ state: this._state, ctrl: this }, card); },

  /** 按 id 删除一张卡（删除路径的统一收口，兼容离屏卡：无 DOM 也安全）。
   *  数据模型 + 连线 + 几何缓存/空间索引/挂载表 + DOM 一并清理，
   *  供 _removeCard（持有 DOM 元素时）、_enforceCap（按模型序选最旧、可能命中离屏卡）共用。
   *  关键：删除谁由「模型真源 this._notes 的顺序」决定，而非 querySelectorAll('.tw-card')
   *  数 DOM 卡 —— 后者在视口剔除开启后只统计在屏卡，会导致上限失效/误删（见 _enforceCap）。 */
  _removeNoteById(id) {
    if (!id) return;
    this._removeLinksOf(id);   // 级联删掉与它相连的连线（DOM 层），避免悬空线
    // 连续编辑改走 WritingDoc 原语：从规范模型删卡 + 连带删相关连线
    const r = WritingDoc.removeNote(this._notes, this._links, id);
    this._notes = r.notes;
    this._links = r.links;
    // 视口剔除：从几何缓存/空间索引里清掉这张卡（统一走几何单源删除入口）
    ViewportCuller.removeGeom({ state: this._state, ctrl: this }, id); // 【P8 空间索引】删卡同步出索引
    // 视图资源统一释放（打字 timer / 编辑监听 / 瞬时集合）：有 DOM 才走 _disposeCard
    const card = this._mountedCards ? this._mountedCards.get(id) : null;
    if (card) {
      this._disposeCard(card);
      card.classList.remove('selected');
      card.remove();
    } else {
      // 离屏卡无 DOM：仅清指向它的瞬时集合引用（_disposeCard 无 card 时不处理集合）
      if (this._typingIds) this._typingIds.delete(id);
      if (this._editingId === id) this._editingId = null;
    }
    if (this._mountedCards) this._mountedCards.delete(id);
    if (this._linkLayer) this._linkLayer.clearControls();
    this._refreshWriteOrder();   // 卡片减少/重排：刷新写作档顺序徽标
  },

  /** 按段落拆分当前卡（手动触发，可撤销）：纯数据走 WritingDoc.splitNote，随后按模式刷新布局。
   *  写作档 → 顺流/分幕重排（reflowWriteOrder 内部已落盘+刷新+剔除）；便签档 → 新卡以级联偏移进屏。
   *  单段落卡（无空行可拆）仅提示、不改动、不进撤销栈。 */
  _splitCard(card) {
    const id = card && card.dataset && card.dataset.id;
    if (!id) return;
    // 以 DOM 当前文本为准（连续编辑时模型可能滞后一帧），先同步回模型再拆，保证拆的就是所见内容
    const textEl = card.querySelector ? card.querySelector('.tw-card-text') : null;
    if (textEl && typeof textEl.innerText === 'string') {
      this._notes = WritingDoc.setText(this._notes, id, textEl.innerText);
    }
    const seen = new Set(this._notes.map((n) => n.id));
    const next = WritingDoc.splitNote(this._notes, id);
    if (next.length === this._notes.length) { this._showScreenMsg('这张卡没有可拆的段落', 1400); return; }
    if (this._undoStack) this._undoStack.push();   // 变更前留档：Cmd+Z 一步还原（reflow 跳过它自己的 push）
    this._notes = next;
    const updated = next.find((n) => n.id === id);
    const added = next.filter((n) => !seen.has(n.id));
    // ① 原卡 DOM 文本同步为拆出的首段（否则画面看似「没反应」——模型变了但 DOM 还是全文）
    if (card) {
      const t = card.querySelector ? card.querySelector('.tw-card-text') : null;
      if (t && updated) { t.textContent = updated.text; this._measureCard(card); }
    }
    // ② 新卡必须显式建 DOM：写作档不做视口剔除（scheduleCull 在 write 档空转），
    //    只改模型不会有任何画面变化 —— 这正是「点了没反应」的根因。
    added.forEach((n) => { if (!this._mountedCards.has(n.id)) this._mountCard(n); });
    if (this._mode === 'write') {
      // 写作档：按新 seq 顺流/分幕重排（skipUndo 避免重复入栈，撤销点唯一）
      PersistenceCoordinator.reflowWriteOrder({ state: this._state, ctrl: this }, { skipUndo: true });
    } else {
      this._seedSpatial();
      this._updateCulling();                        // 便签档：新卡以级联位置进屏
      this._refreshWriteOrder();
      this._scheduleSave();
    }
    this._showScreenMsg('已按段落拆分为 ' + (added.length + 1) + ' 张卡', 1500);
  },


  /** 删除当前选中的所有便签（级联删连线） */
    _deleteSelected() { return CardInteractions.deleteSelected({ state: this._state, ctrl: this }); },

  /** 在画布上拉出框选矩形（Shift+空白拖拽触发） */
    _startMarquee(e) { return CardInteractions.startMarquee({ state: this._state, ctrl: this }, e); },

  /** 框选矩形与卡片求交，选中相交者（矩形与卡片任一角落入或相互包含即算） */
    _selectInRect(r) { return CardInteractions.selectInRect({ state: this._state, ctrl: this }, r); },

  /** 绑定快捷键：Delete/Backspace 删选中；F 将便签重新归位到视野中心 */
    _bindSelectionKeys() { return CardInteractions.bindSelectionKeys({ state: this._state, ctrl: this }); },

    /** 写作档快捷键：Cmd/Ctrl + 1..6 把选中卡设为 H1..H6。
    *  仅在写作档且已有选中卡时生效；与输入框的 Markdown 前缀（"# 标题"）互为补充——
    *  前缀用于「新卡即定级」，快捷键用于「事后改级」。 */
    _bindLevelKeys() {
    this._levelKeyHandler = (e) => {
    if (this._mode !== 'write') return;
    if (!(e.metaKey || e.ctrlKey)) return;
    if (!this._selected || !this._selected.size) return;
    const n = '123456'.indexOf(e.key);
    if (n < 0) return;
    e.preventDefault();   // 拦掉浏览器 Cmd/Ctrl+1..6（切标签页等）
    const lv = 'h' + (n + 1);
    this._selected.forEach((card) => this._applyLevel(card, lv));
    this._scheduleSave();
    this._showScreenMsg('LEVEL: ' + (LEVEL_LABELS[lv] || lv), 900);
    };
    document.addEventListener('keydown', this._levelKeyHandler);
    },

  // ===== 手动调整大小 =====

  /** 缩放系数安全化：非法值回落 1（默认尺寸），并夹到 [ZOOM_MIN, ZOOM_MAX] */
    _clampZoom(z) { return CardViewManager.clampZoom({ state: this._state, ctrl: this }, z); },

  /** 应用缩放：只写 --tw-card-zoom。卡片内所有尺寸都由 em 推导，
      改这一个变量即整体等比（框宽、字号、留白、装饰全部同步）。 */
    _applyZoom(card, zoom) { return CardViewManager.applyZoom({ state: this._state, ctrl: this }, card, zoom); },

  /** 当前 zoom 最接近哪一档（拖拽出来的连续值也能给出可读的档位名） */
    _zoomIdxOf(zoom) { return CardViewManager.zoomIdxOf({ state: this._state, ctrl: this }, zoom); },

  /** 尺寸档位步进：从当前值（哪怕是被拖出来的连续值）跳到相邻的下一档 */
    _stepCardScale(card, dir) { return CardViewManager.stepCardScale({ state: this._state, ctrl: this }, card, dir); },

  /** 同步 ⊟/⊞ 的可用态与提示文案 */
    _syncCardScaleButtons(card) { return CardViewManager.syncCardScaleButtons({ state: this._state, ctrl: this }, card); },

  /** ⊟/⊞ 步进便签尺寸档位（S/M/L/XL） */
    _bindZoomSteps(card) { return CardViewManager.bindZoomSteps({ state: this._state, ctrl: this }, card); },

  /** 写入便签纸样：更新 dataset、抬头与按钮提示（提示里带当前纸样名）。
   *  只作用于这一张便签 —— 与寻呼机上的 PAPER 键（只影响「之后打印」的便签）互不干扰。 */
    _applyPaper(card, paper) { return CardViewManager.applyPaper({ state: this._state, ctrl: this }, card, paper); },

  /** 切换纸样：在这张便签上循环 PAPERS。
   *  两处副作用必须一并处理：
   *   1) 定版纸样（书燕等）字级封顶更低，切过去要把字级夹回新上限；
   *   2) 纸样会改变卡片尺寸/比例，连线端点要重算。 */
    _bindPaperSwitch(card) { return CardViewManager.bindPaperSwitch({ state: this._state, ctrl: this }, card); },

  /** 写入结构级别：更新 dataset 与按钮文字标签。
   *  与纸样互不干扰 —— 纸样只管视觉，级别只管结构（两者彻底解耦）。 */
    _applyLevel(card, level) { return CardViewManager.applyLevel({ state: this._state, ctrl: this }, card, level); },

  /** 写作档：工具条「上移 / 下移」—— 把这张卡在文章顺序里与相邻卡互换一位。
   *  顺序的真值是 _orderCards()（优先连线、回退阅读顺序），故分两步走：
   *   1) 先交换相邻两张的位置 —— 无连线的常态下阅读顺序随之交换，这一步就够；
   *   2) 若画布已串成链，顺序由连线而非位置决定，只换位置顺序不变、按钮会像失灵 ——
   *      此时把连线按新顺序重接（_rewireChain 只在确认是单链时才动手，有分叉一律不碰，
   *      绝不替用户把分支拍平成一条链）。 */
    _moveCardInOrder(card, dir) { return CardInteractions.moveCardInOrder({ state: this._state, ctrl: this }, card, dir); },

  /** 若现有连线是一条单链（每卡最多一出、最多一入），按给定序列把整条链重接；否则原样返回 false。
   *  刻意不动分叉结构：那是用户有意为之的分支，重接会不可逆地把它拍平。 */
    _rewireChain(seq) { return CardInteractions.rewireChain({ state: this._state, ctrl: this }, seq); },

  /** 上移/下移的点击绑定。两个钮在非写作档被 CSS 隐藏，故无需再判模式。 */
    _bindOrderSteps(card) { return CardInteractions.bindOrderSteps({ state: this._state, ctrl: this }, card); },

  /** 层级 ± 的点击绑定：沿 LEVEL_LADDER 走一格，到边界时按钮已被 _refreshLevelSteps 置灰。 */
    _bindLevelSteps(card) { return CardViewManager.bindLevelSteps({ state: this._state, ctrl: this }, card); },

  /** 层级 ± 的可用态与提示：按 LEVEL_LADDER 夹边界。
   *  引用 / 列表不在梯子上（它们表达文本形态而非层级深度），两端置灰并说明改用类型菜单。 */
    _refreshLevelSteps(card) { return CardViewManager.refreshLevelSteps({ state: this._state, ctrl: this }, card); },

  /** 类型控件：点一下弹出分组菜单。
   *  11 种类型若还靠「点一下换一个」循环，最坏要连点 10 次，已不可用，故改为菜单一次点选。
   *  改的只是结构角色，纸样与位置一概不动。 */
    _bindLevelSwitch(card) { return CardViewManager.bindLevelSwitch({ state: this._state, ctrl: this }, card); },

  /** 类型菜单（全画布共用一个浮层，按需创建）。
   *  挂在功能根元素上：卡片在画布里带 transform、且 .tw-card-main 有 overflow:hidden，
   *  浮层若塞进卡片会被裁掉，也会被 z-index 更高的邻卡盖住。 */
    _ensureLevelMenu() { return CardViewManager.ensureLevelMenu({ state: this._state, ctrl: this }); },

  /** 在按钮旁展开菜单：优先贴下方，下方放不下翻到上方，再夹回视口内。 */
    _showLevelMenu(card, btn) { return CardViewManager.showLevelMenu({ state: this._state, ctrl: this }, card, btn); },

    _hideLevelMenu() { return CardViewManager.hideLevelMenu({ state: this._state, ctrl: this }); },

  // ===== 写作卡片组 / 思维导图组 切换器（列 / 选 / 新建 / 改名）=====
  // 复用 level-menu 的浮层范式：挂在功能根、absolute 定位、外部点击用 composedPath 判定
  // （Shadow DOM 事件重定向，closest 会失效，见 _isInLevelMenu 的坑）。
  // kind = 'write'（写作卡片组）| 'mindmap'（思维导图组）| null（便签模式不显示切换器）
    _getDocKind() { return ModeController.getDocKind({ state: this._state, ctrl: this }); },
    _ensureDocCorner() { return ModeController.ensureDocCorner({ state: this._state, ctrl: this }); },
    _ensureDocPanel() { return ModeController.ensureDocPanel({ state: this._state, ctrl: this }); },
    async _renderDocPanel() { return ModeController.renderDocPanel({ state: this._state, ctrl: this }); },
    async _showDocPanel() { return ModeController.showDocPanel({ state: this._state, ctrl: this }); },
    _hideDocPanel() { return ModeController.hideDocPanel({ state: this._state, ctrl: this }); },
    async _switchWritingGroup(id) { return ModeController.switchWritingGroup({ state: this._state, ctrl: this }, id); },
    async _createWritingGroup() { return ModeController.createWritingGroup({ state: this._state, ctrl: this }); },
    _beginRenameDoc(kind, id, nameEl) { return ModeController.beginRenameDoc({ state: this._state, ctrl: this }, kind, id, nameEl); },

    async _deleteWritingGroup(id, title) { return ModeController.deleteWritingGroup({ state: this._state, ctrl: this }, id, title); },

  // ===== 通用（写作 / 思维导图）组切换调度：按 kind 分流到各自实现 =====
    async _switchDocGroup(kind, id) { return ModeController.switchDocGroup({ state: this._state, ctrl: this }, kind, id); },
    async _createDocGroup(kind) { return ModeController.createDocGroup({ state: this._state, ctrl: this }, kind); },
    async _deleteDocGroup(kind, id, title) { return ModeController.deleteDocGroup({ state: this._state, ctrl: this }, kind, id, title); },
    async _deleteMindmapGroup(id, title) { return ModeController.deleteMindmapGroup({ state: this._state, ctrl: this }, id, title); },

    async _refreshDocBtnLabel() { return ModeController.refreshDocBtnLabel({ state: this._state, ctrl: this }); },

  /** 事件是否发生在类型菜单（或其触发徽章）内部。
   *  【坑·真根因】菜单在 Shadow DOM 内，事件冒泡到 document 时会被**重定向（retargeting）**：
   *  ev.target 变成影子宿主元素，于是 closest('.tw-level-menu') 恒为 null，
   *  「点菜单里的选项」被误判成「点空白处」而提前收起，随后 click 抵达时
   *  _levelMenuCard 已被清空 → 选项永远点不动。
   *  故必须用 composedPath() —— 它保留影子内部的真实节点链路。
   *  徽章一并纳入：让「再点徽章收起」由徽章自己的 click 处理，不被这里提前清掉。 */
    _isInLevelMenu(ev) { return CardViewManager.isInLevelMenu({ state: this._state, ctrl: this }, ev); },

  /** 写作档的专属外观开关：画布上挂一个类，切档时无需重建任何卡片 DOM。
   *  这个类同时管两件事：① 显示结构级别钮；② 启用写作档自己的国际化卡片体系
   *  （压过便签的纸样样式，见 notes.css 的 .tw-mode-write 段落）。 */
    _refreshWriteMode() { return ModeController.refreshWriteMode({ state: this._state, ctrl: this }); },

  /** 字级档位上限：定版纸样（书燕）的文本区是按百分比预留的、纸面高度固定，
      字放太大撑出留白区会破坏版式，故封顶「很大 140%」（文本区已加 overflow 兜底）；
      流式纸样字变大纸自然变长，可一路到最大档。 */
    _maxFontIdx(paper) { return CardViewManager.maxFontIdx({ state: this._state, ctrl: this }, paper); },

  /** 落盘值 → 档位索引：取最接近的一档（兼容浮点误差与历史数据） */
    _fontIdxOf(scale, paper) { return CardViewManager.fontIdxOf({ state: this._state, ctrl: this }, scale, paper); },

  /** 应用字级：只写 --tw-text-zoom（→ --tw-type-fs），纸面大小与留白不动 */
    _applyFontScale(card, idx) { return CardViewManager.applyFontScale({ state: this._state, ctrl: this }, card, idx); },

  /** A−/A+ 步进：点一次走一档，到边界自动置灰，改完即落盘 */
    _bindFontSteps(card) { return CardViewManager.bindFontSteps({ state: this._state, ctrl: this }, card); },

  /** 外围工具条的配套行为：
      1) hover/钉住时把便签临时提到最上层 —— 否则贴在纸外的工具条会被相邻便签盖住；
      2) 便签贴画布顶部时工具条翻到下方，避免被画布裁掉；
      3) 轻点便签（未拖动）钉住工具条，点画布空白处取消 —— 触屏没有 hover 也能用。 */
    _bindTools(card) { return CardViewManager.bindTools({ state: this._state, ctrl: this }, card); },

  /** 只钉住某张便签（传 null = 全部取消）；同时把其余便签的临时置顶还原 */
    _pinOnly(card) { return CardInteractions.pinOnly({ state: this._state, ctrl: this }, card); },

  // ===== 二次编辑 =====

  /** 入口：双击便签 = 进入编辑（编辑态内双击交给浏览器选词）；
      工具条已无铅笔按钮，编辑只靠双击触发。 */
    _bindEdit(card) { return CardInteractions.bindEdit({ state: this._state, ctrl: this }, card); },

  /** 同一时刻只编辑一张：进入新卡片前先收起其它正在编辑的 */
    _exitAllEdits() { return CardInteractions.exitAllEdits({ state: this._state, ctrl: this }); },

    _enterEdit(card) { return CardInteractions.enterEdit({ state: this._state, ctrl: this }, card); },

    _exitEdit(card) { return CardInteractions.exitEdit({ state: this._state, ctrl: this }, card); },

  /** 编辑态强制字数上限：超过则截断到 MAX_LEN，并把光标移到末尾。
   *  防单个便签文本无限增长撑爆 vault 文件（剪贴板/输入法超长、外部粘贴等场景）。 */
    _enforceEditLimit(text) { return CardInteractions.enforceEditLimit({ state: this._state, ctrl: this }, text); },

  /** 右下角手柄拖拽缩放 + 双击手柄复位 + ⌘/Ctrl 滚轮微调。
      缩放以卡片左上角为锚（left/top 不变，向右下生长），与拖拽定位逻辑一致。 */
    _makeResizable(card) { return CardInteractions.makeResizable({ state: this._state, ctrl: this }, card); },

  /** 应用旋转：只写 --tw-card-rot（与 hover 微放 --tw-card-scale 同处一张 transform 上，互不覆盖）。
   *  角度归一化到 (-180, 180]，便签无论转多少圈都落在可读区间。 */
    _applyRot(card, deg) { return CardViewManager.applyRot({ state: this._state, ctrl: this }, card, deg); },

  /** 外围圆钮（旋转 .tw-card-rotate / 连线 .tw-card-link）统一内联像素尺寸。
   *  【真根因】设计系统全局触控目标规则（base-foundation.css）把 [role="button"]
   *  地板到 min-width/min-height:44px，且 min-width 压过一切 width（含内联）——
   *  连线锚点(role=button)中招被撑到 44px，旋转握柄(role=slider)不命中 → 一大一小。
   *  故除 width/height 外还须内联同值 min-width/min-height，保证左右严格等大。 */
    _applyKnobSize(el) { return CardViewManager.applyKnobSize({ state: this._state, ctrl: this }, el); },

  /** 左侧中部旋转握柄（与右侧连线锚点对称，下方通道留给工具条）：
      拖动绕卡片中心自由旋转；Shift 吸附 15°；双击握柄归零。 */
    _makeRotatable(card) { return CardInteractions.makeRotatable({ state: this._state, ctrl: this }, card); },

  // ===== 便签连线（委托给共享 LinkLayer；与思维子弹共用同一套渲染/交互/控件） =====

  _ensureLinkLayer() { return this._linkLayer.ensureLayer(); },
  _scheduleRenderLinks() {
    // 【P0 解耦】此处原本在写入档顺带调 _refreshWriteOrder()，把「语义更新」焊死在「渲染路径」上，
    // 后果严重：本函数是极高频渲染入口 —— 拖拽时每次 pointermove 都调、卡片尺寸变化经
    // _linkRo(ResizeObserver 观察每张卡) 也调、挂载/卸载/缩放/旋转都调。于是写入档每帧都要跑
    // 一次全量 _refreshWriteOrder（O(N) 排序 + N 次 querySelector + 2N 次按钮属性写），
    // 卡片一多必然打爆帧预算 → 表现为「跳动闪烁」。（原先那句 try/catch 也是旁证：它被触发到
    // 需要兜底崩溃，说明调用频率极高。）
    // 徽标是语义（仅 seq 变化才需更新），连线重绘是呈现（几何变化才需更新），二者不应耦合。
    // 顺序真变的当事处（加卡/删卡/调序/增删连线/顺流重排/切档/挂载新卡）各自显式刷新即可。
    this._linkLayer.scheduleRender();
  },
  _edgePoint(c, tx, ty) { return this._linkLayer.edgePoint(c, tx, ty); },
  _renderLinks() { this._linkLayer.render(); },
  _buildLink(svg, it) { return this._linkLayer.buildLink(svg, it); },
  _linkGeom(it) { return this._linkLayer.linkGeom(it); },
  _applyLinkGeom(g, geo) { this._linkLayer.applyGeom(g, geo); },
  _anchorOn(c, t) { return this._linkLayer.anchorOn(c, t); },
  _routePath(p1, ua, p2, ub, mode, bend) { return this._linkLayer.routePath(p1, ua, p2, ub, mode, bend); },
  _clearLinkControls() { this._linkLayer.clearControls(); },
  _endLinkHover() { this._linkLayer.endHover(); },
  _scheduleEndHover() { this._linkLayer.scheduleEndHover(); },
  _renderLinkControls(f, t) { this._linkLayer.renderControls(f, t); },
  _linkOf(f, t) { return this._linkLayer.linkOf(f, t); },
  _buildLinkControls(svg, f, t, key) { return this._linkLayer.buildControls(svg, f, t, key); },
  _applyLinkControlsGeom(c) { this._linkLayer.applyControlsGeom(c); },
  _highlightLinksOf(cardId, on) { this._linkLayer.highlightFor(cardId, on); },
  _setLinkActive(f, t, on) { this._linkLayer.setActive(f, t, on); },
  _watchCardSize(card) { this._linkLayer.watchSize(card); },
  _cardAtPoint(cx, cy, exclude) { return this._linkLayer.nodeAtPoint(cx, cy, exclude); },
  _makeLinkable(card) { this._linkLayer.makeLinkable(card); },

  /** 连线数据原语（供 LinkLayer 的 addLink/removeLink/removeLinksOf 选项调用；不自带渲染/落盘） */
    _addLink(fromId, toId) { return CardInteractions.addLink({ state: this._state, ctrl: this }, fromId, toId); },
    _removeLink(fromId, toId) { return CardInteractions.removeLink({ state: this._state, ctrl: this }, fromId, toId); },
  _removeLinksOf(cardId) { this._linkLayer.removeLinksOf(cardId); },
    _removeLinksOfData(cardId) { return CardInteractions.removeLinksOfData({ state: this._state, ctrl: this }, cardId); },

  // ===== 自绘 tooltip =====

  /** 整块画布共用一个浮层（挂在功能根元素上），不每张便签各建一个 */
    _ensureTip() { return CardViewManager.ensureTip({ state: this._state, ctrl: this }); },

  /** 定位在按钮正上方、6px 偏移处；顶部放不下则翻到下方 */
    _positionTip(el) { return CardViewManager.positionTip({ state: this._state, ctrl: this }, el); },

  /** 文案存在 el._tipText 上 —— 档位一变就能就地刷新，
      避免提示还写着「当前：M」而实际已经变成 L。 */
    _bindTips(card) { return CardViewManager.bindTips({ state: this._state, ctrl: this }, card); },

  /** 档位变化后就地刷新当前显示的提示 */
    _refreshTip() { return CardViewManager.refreshTip({ state: this._state, ctrl: this }); },

  // ===== 持久化 =====

  /** 从 vault 加载已保存便签并重建（直接显示全文，不重放打字动画） */
    async _restore() { return PersistenceCoordinator.restore({ state: this._state, ctrl: this }); },

  /** 从便签数据数组重建卡片 DOM（被 _restore 与撤销重做复用）。
   *  ratioCoords=true 时 x/y 是「相对画布比例」，需按画布尺寸换算成绝对 px（v1 迁移）。 */
    _buildCards(notes, ratioCoords, w, h) { return PersistenceCoordinator.buildCards({ state: this._state, ctrl: this }, notes, ratioCoords, w, h); },

  /** 收集画布上所有卡片为落盘数据（坐标存绝对 px，与画布偏移量纲一致；可超出画布以支持无限画布） */
    _collectNotes() { return PersistenceCoordinator.collectNotes({ state: this._state, ctrl: this }); },

  // ===== 视口剔除（P8）=====
  // 卡片只挂载在屏内的；离屏卡从 DOM 卸载（模型/几何缓存仍留，连线照画），把 500+ 卡的布局成本压到视野内。
  // 被编辑 / 选中 / 拖拽中 / 打字中的卡「钉」在屏上，剔除跳过，避免焦点丢失 / 交互中断。

  /** 连线层取端点的几何源：挂载卡读活 DOM（与旧行为一致），离屏卡读几何缓存（最后测量值）。 */
  _getGeom(id) { return ViewportCuller.getGeom({ state: this._state, ctrl: this }, id); },

  /** 重排 / 排版 / 上移下移后同步几何缓存与空间索引（【P8 几何缓存】失效完备性补齐）。
   *  这类布局写操作只改了 style.left/top（在屏）与模型（全部），却没走 _measureCard / _invalidateGeo，
   *  导致 _geo 与空间索引停在旧位置。_geo 是空间索引（剔除据它决定挂/卸谁）与连线端点
   *  （_getGeom 给离屏卡用）的真源 —— 不刷新会让剔除按旧位置挂载、连线端点指向重排前的幽灵位置
   *  （视觉上「线断在半空」）。故这里统一补齐：
   *   · 在屏卡走纯几何的 _measureCard 重测（坐标取最新 style.left/top、尺寸取 offset*，
   *     无 z-index / textContent / 挂载副作用）；
   *   · 离屏卡无 DOM 可测，按重排已写回模型的 x/y 刷新 _geo，并同步进空间索引（尺寸沿用最后测量值）。
   *  与拖拽结束的 _measureCard、缩放/字级/级别/纸样/根字号变化的 _invalidateGeo 同一职责：
   *  凡是改写卡片位置（left/top）的入口都必须让 _geo 与 _spatial 跟上。 */
  _syncLayoutGeo() { return ViewportCuller.syncLayoutGeo({ state: this._state, ctrl: this }); },

  /** 把一张模型卡建回 DOM 并挂进挂载表 + 量几何。culling 进屏时调用。 */
  _mountCard(note) { return ViewportCuller.mountCard({ state: this._state, ctrl: this }, note); },

  /** 量一张卡进几何缓存（坐标取 style.left/top；尺寸取 offset*，一次 reflow 摊销）。 */
  _measureCard(card) { return ViewportCuller.measureCard({ state: this._state, ctrl: this }, card); },

  /** 离屏卡卸载 DOM（保留模型/几何缓存/连线）。 */
  _unmountCard(id) { return ViewportCuller.unmountCard({ state: this._state, ctrl: this }, id); },

  /** 懒建 id→note 索引（cull mount 时按 id 取 note 内容，避免每次 O(n) find）。
   *  _notes 引用变更（WritingDoc 不可变更新）即失效重建，O(n) 仅发生在数据变更、非每帧 cull。 */
  _noteIndex() { return ViewportCuller.noteIndex({ state: this._state, ctrl: this }); },

  /** 用模型坐标重建整张空间索引（默认尺寸占位；_buildCards 测量后精确入格）。
   *  保证「全量扫 _notes」只在加载/撤销时发生一次，而非每帧 cull。 */
  _seedSpatial() { return ViewportCuller.seedSpatial({ state: this._state, ctrl: this }); },

  /** 必须钉在屏上、剔除跳过的卡（编辑 / 选中 / 拖拽中 / 打字中）。 */
  _pinnedIds() { return ViewportCuller.pinnedIds({ state: this._state, ctrl: this }); },

  /** 【几何缓存失效】标记一张卡的几何已不可信（尺寸/比例可能变了），待合帧重测。
   *  _geo 是命中测试、连线端点、框选、剔除矩形的唯一真源 —— 任何会改变卡片尺寸的操作
   *  都必须走这里，否则缓存陈旧会让连线端点、框选、剔除全部错位。
   *  重测是 reflow，故这里只打标记，真正的测量合帧批量做
   *  （对标 tldraw 的 geometry caching：失效廉价、测量合批、只在 prop 变化时失效）。 */
  _invalidateGeo(id) { return ViewportCuller.invalidateGeo({ state: this._state, ctrl: this }, id); },

  /** 整机根字号变化 → 所有卡片的 em 尺寸全变 → 几何整体失效 */
  _invalidateGeoAll() { return ViewportCuller.invalidateGeoAll({ state: this._state, ctrl: this }); },

  _scheduleGeoFlush() { return ViewportCuller.scheduleGeoFlush({ state: this._state, ctrl: this }); },

  // ===== 性能埋点（对标 tldraw PerformanceManager / PerformanceApiAdapter）=====
  // 默认关闭：_perfBegin 在关闭时只做一次布尔判断，热路径零开销。
  // 用途：用真实数据判定瓶颈（例如「DOM 卡节点池化」到底值不值得做），不凭印象优化。

  /** 开/关采样（开启后累计，用 reset 清零） */
  _setPerf(on) {
    this._perfOn = !!on;
    if (this._perfOn && !this._perf) this._perf = new Map();
  },

  _perfBegin() {
    if (!this._perfOn) return 0;
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  },

  _perfEnd(key, t0) {
    if (!t0 || !this._perfOn || !this._perf) return;
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const ms = now - t0;
    const p = this._perf.get(key) || { n: 0, total: 0, max: 0 };
    p.n += 1; p.total += ms; if (ms > p.max) p.max = ms;
    this._perf.set(key, p);
  },

  /** 读数：{ key: { n, avg, max, total } }（ms） */
  _perfReport() {
    const out = {};
    if (!this._perf) return out;
    this._perf.forEach((p, k) => {
      out[k] = { n: p.n, avg: +(p.total / p.n).toFixed(3), max: +p.max.toFixed(3), total: +p.total.toFixed(2) };
    });
    return out;
  },

  _perfReset() { if (this._perf) this._perf.clear(); },

  /** 合帧重测所有失效卡。离屏卡不在 DOM 无法测，保持旧值即可 —— 重挂载时 _mountCard 会测。 */
  _flushGeo() { return ViewportCuller.flushGeo({ state: this._state, ctrl: this }); },

  _scheduleCull() { return ViewportCuller.scheduleCull({ state: this._state, ctrl: this }); },

  /** 重算挂载：离屏卸载、进屏重建。
   *  【P8 空间索引】可见集由索引 queryRect 直接给出（O(可视) 单元查询），不再全量扫 _notes；
   *  卸载只遍历挂载表（O(在屏)）。几何入格不读活 DOM，剔除态/虚拟化下照常工作。 */
  _updateCulling() { return ViewportCuller.updateCulling({ state: this._state, ctrl: this }); },

  /** LOD：按「交互态 + 可见密度」算出应有的降级档并应用。
   *  drag（画布平移中）> dense（在屏卡密集）> full（常态）。
   *  幂等：档位未变则不碰 DOM，避免每帧 classList 抖动。 */
  _applyLod() {
    if (!this._canvas) return;
    // 【滞回】在屏卡数在阈值附近波动时（拖动画布会让卡不断进出视口，计数逐帧变化），
    // 单一阈值会让 tw-lod-dense 每帧翻转 → 装饰（纸纹/工具条/投影）反复显隐 = 肉眼可见的闪烁。
    // 故用双阈值：未降级时超过 120 才进；已降级时要掉到 100 以下才退 —— 中间 20 张的滞回带内保持不变。
    const n = this._mountedCards ? this._mountedCards.size : 0;
    const dense = this._lodDense ? (n > LOD_DENSITY_EXIT) : (n > LOD_DENSITY);
    const drag = !!this._lodDragging;
    if (dense !== this._lodDense) {
      this._lodDense = dense;
      this._canvas.classList.toggle('tw-lod-dense', dense);
    }
    if (drag !== this._lodDrag) {
      this._lodDrag = drag;
      this._canvas.classList.toggle('tw-lod-drag', drag);
    }
  },

  /** 进入/退出「拖拽降级」：画布平移期间用最高降级，松手即恢复。
   *  幂等：状态未变则不触发 _applyLod。 */
  _setLodDragging(on) {
    const next = !!on;
    if (this._lodDragging === next) return;
    this._lodDragging = next;
    this._applyLod();
  },

  /** 防抖写盘：合并拖拽/删除/新增等连续操作 */
    _scheduleSave() { return PersistenceCoordinator.scheduleSave({ state: this._state, ctrl: this }); },

  /** 立即写盘（fire-and-forget）。
   *  【按档分流】便签写便签的 key、MD可视化写作写作的 key，两份文档永远不互相覆盖。
   *  导图档直接跳过（画布已隐藏、数据由 MindmapFeature 自管），避免空数据盖掉卡片。 */
    async _saveNow() { return PersistenceCoordinator.saveNow({ state: this._state, ctrl: this }); },

  /** 把画布现状写回「指定档位那份文档」（切档前调用）。
   *  与 _saveNow 的区别：这里显式指定档位 —— 切档时 this._mode 还没变，
   *  但为了不依赖调用顺序、且读的是「离开前」的 DOM，故由调用方点名档位。 */
    async _persistDoc(mode) { return PersistenceCoordinator.persistDoc({ state: this._state, ctrl: this }, mode); },

  /** 把「指定档位那份文档」载入画布：清空当前卡片后重建。
   *  与 _restore 的区别：这是切档热换 —— 不重置 _restored，也不做比例坐标迁移
   *  （写作档生而为 v2，没有 v1 历史包袱）。 */
    async _loadDoc(mode) { return PersistenceCoordinator.loadDoc({ state: this._state, ctrl: this }, mode); },

  // ===== 撤销 / 重做（快照式，见 services/undoStack.js） =====

  /** 建立撤销栈：capture / restore 直接复用现有的 _collectNotes / _buildCards，
   *  不引入第二套数据表示，避免两边悄悄不同步。 */
    _initUndo() { return PersistenceCoordinator.initUndo({ state: this._state, ctrl: this }); },

  /** 采集当前状态：便签 + 连线 + 画布偏移（画布尚未布局时返回 null，本次不入栈） */
    _snapshot() { return PersistenceCoordinator.snapshot({ state: this._state, ctrl: this }); },

  /** 用快照整体重建画布：先清场（含打字计时器），再按数据重建 */
    _restoreSnapshot(s) { return PersistenceCoordinator.restoreSnapshot({ state: this._state, ctrl: this }, s); },

  /**
   * 执行撤销 / 重做。
   * @param {'undo'|'redo'} kind
   */
    _undoRedo(kind) { return PersistenceCoordinator.undoRedo({ state: this._state, ctrl: this }, kind); },

  /** 超出上限删最早（以「模型真源 this._notes 的数组序」为时间序） */
  _enforceCap() { return ViewportCuller.enforceCap({ state: this._state, ctrl: this }, NOTE_CAP); },

  _now() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },
};

// 【解耦 B5 / 复盘 4.2】共享可变状态单主：下列 8 字段经存取器代理到 _state（NotesState 实例），
// 确保数据真源唯一、与「方法集合」解耦。后续模块解耦增量将直接接收本对象而非穿透 this。
Object.defineProperties(TypewriterFeature, {
  _notes: { get() { return this._state.notes; }, set(v) { this._state.notes = v; }, enumerable: true, configurable: true },
  _mountedCards: { get() { return this._state.mountedCards; }, set(v) { this._state.mountedCards = v; }, enumerable: true, configurable: true },
  _geo: { get() { return this._state.geo; }, set(v) { this._state.geo = v; }, enumerable: true, configurable: true },
  _spatial: { get() { if (typeof SpatialIndex !== 'undefined' && !this._state.spatial) this._state.spatial = new SpatialIndex(512); return this._state.spatial; }, set(v) { this._state.spatial = v; }, enumerable: true, configurable: true },
  _links: { get() { return this._state.links; }, set(v) { this._state.links = v; }, enumerable: true, configurable: true },
  _selected: { get() { return this._state.selected; }, set(v) { this._state.selected = v; }, enumerable: true, configurable: true },
  _canvasOffset: { get() { return this._state.canvasOffset; }, set(v) { this._state.canvasOffset = v; }, enumerable: true, configurable: true },
  _mode: { get() { return this._state.mode; }, set(v) { this._state.mode = v; }, enumerable: true, configurable: true },
});

// 模块加载即初始化全部字段（替代原对象字面量顶部内联声明）；唯一真源见 _resetState。
// 这样「新增字段」只改 _resetState 一处，unmount 永远不会再漏归零。
TypewriterFeature._resetState();
window.TypewriterFeature = TypewriterFeature;
