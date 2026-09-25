// CardInteractions — 从 typewriterFeature 巨型单例（B1 解耦）抽出的子系统。
// 方法体逐字搬运，所有内部调用经 ctrl._xxx 由 feature 委托壳自动解析回原对象。
// 共享常量（裸名引用由本 import 提供；测试 harness 剥离 import 时由 twConfig 挂 globalThis 兜底）
import { ICON_LAYERS, ICON_FONT, ICON_GRID, ICON_PRINT, ICON_X, ICON_FONT_DOWN, ICON_FONT_UP, ICON_ZOOM_OUT, ICON_ZOOM_IN, ICON_PAPER, ICON_EXPORT, ICON_PREVIEW, ICON_MOVE_UP, ICON_MOVE_DOWN, ICON_LV_UP, ICON_LV_DOWN, ICON_ROTATE } from './twConfig.js';
import { STACK_STEP, STACK_LEVELS, TYPE_SPEED, MAX_LEN, NOTE_CAP, WRITE_FLOW_GAP, SAVE_DEBOUNCE, LOD_DENSITY, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from './twConfig.js';
import { FONT_SCALES, FONT_SCALE_DEFAULT_IDX, FONT_SCALE_LABELS, CARD_SCALES, CARD_SCALE_LABELS, CARD_SCALE_DEFAULT_IDX } from './twConfig.js';
import { FONTS, FONT_LABELS, FONT_FEEDBACK } from './twConfig.js';
import { PAPERS, PAPER_LABELS, PAPER_FEEDBACK, PAPER_TITLES } from './twConfig.js';
import { LEVELS, LEVEL_LABELS, LEVEL_FEEDBACK, LEVEL_GROUPS, LEVEL_LADDER } from './twConfig.js';
import { TypewriterStore } from '../../services/TypewriterStore.js';
import { SpatialIndex } from '../../services/SpatialIndex.js';
import { GeoCache } from '../../services/GeoCache.js';
import { MindmapFeature } from './mindmapFeature.js';
import { LinkLayer } from '../../services/LinkLayer.js';
import { WritingDoc } from './writingDoc.js';
import { UndoStack } from '../../services/undoStack.js';
import { isFromTextEntry } from '../../utils/domRef.js';
import { CanvasViewport } from '../../services/CanvasViewport.js';
import { CanvasGestures } from '../../services/CanvasGestures.js';
import { CanvasKeys } from '../../services/CanvasKeys.js';

export const CardInteractions = {
  // (was _makeDraggable)
  makeDraggable(ctx, card) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    let dragging = false;
    let startX = 0, startY = 0;
    let moved = false;   // 区分「轻点」与「拖动」：轻点 = 钉住外围工具条
    let raf = 0;
    let dx = 0, dy = 0;     // 本帧位移（画布局部 px，已按缩放比换算）
    let dragSet = null;     // 拖动集合快照：[{card, lx, ly}]（成组移动用）
    const apply = () => {
      raf = 0;
      if (!dragSet) return;
      dragSet.forEach((d) => {
        d.card.style.left = (d.lx + dx) + 'px';
        d.card.style.top = (d.ly + dy) + 'px';
      });
      ctrl._scheduleRenderLinks();   // 便签移动，连线端点跟随
    };
    const onMove = (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) moved = true;
      // 无限画布：坐标相对 .tw-canvas（含其 transform 平移），不 clamp。
      // 画布带缩放后「屏幕位移 ≠ 局部位移」：必须除以缩放比，
      // 否则放大后拖不动（位移被放大）、缩小后拖过头。
      const s = CanvasViewport.getScale(ctrl);
      dx = (e.clientX - startX) / s;
      dy = (e.clientY - startY) / s;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      dragging = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (moved && dragSet) {
        dragSet.forEach((d) => {
          // 连续编辑改走 WritingDoc 原语：拖动结束即把最终落点写回规范模型
          ctrl._notes = WritingDoc.setPos(ctrl._notes, d.card.dataset.id,
            parseFloat(d.card.style.left) || 0, parseFloat(d.card.style.top) || 0);
        });
        dragSet.forEach((d) => ctrl._measureCard(d.card)); // 拖完重测几何→刷新 geo+空间索引（修复剔除/连线端点陈旧）
        ctrl._scheduleRenderLinks();
      }
      card.classList.remove('dragging');
      card.style.willChange = '';   // 拖拽结束撤掉合成层提升
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (moved) ctrl._scheduleSave();  // 真拖动落盘
      else ctrl._pinOnly(card);         // 轻点：钉住工具条（触屏无 hover 时的入口）
      ctrl._draggingSet = null;         // 拖拽结束：解除钉屏
      ctrl._scheduleCull();             // 重算挂载：被拖出视野的卡卸载
      dragSet = null;
    };
    const onDown = (e) => {
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link')) return; // 删除/字级/缩放/连线锚点不触发拖拽
      // 编辑态下点在文本区不拖拽（让浏览器处理选字/光标）；点标题或纸边仍可移动便签
      if (card.classList.contains('editing') && e.target.closest('.tw-card-text')) return;
      // Shift 点击 = 切换选中（不进入拖拽）；其余点击决定选择集
      if (e.shiftKey) { ctrl._toggleSelect(card); return; }
      if (!ctrl._selected || !ctrl._selected.has(card)) ctrl._selectOnly(card);
      // 拖动集合 = 当前选中集（含本卡）；若本卡未选中则上方已使其成为唯一选中
      const set = (ctrl._selected && ctrl._selected.size) ? ctrl._selected : new Set([card]);
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      dx = 0; dy = 0;
      dragSet = Array.from(set).map((c) => ({
        card: c,
        lx: parseFloat(c.style.left) || 0,
        ly: parseFloat(c.style.top) || 0,
      }));
      ctrl._draggingSet = new Set(dragSet.map((d) => d.card.dataset.id));  // 拖拽中：这些卡钉在屏上，剔除跳过
      card.classList.add('dragging');
      card.style.willChange = 'transform';   // 仅拖拽期间临时提升，松手即撤
      card.style.zIndex = String(++ctrl._zTop);
      // 拖拽置顶后同步层叠快照，避免 mouseleave 时把便签回落回旧层级
      if (card.dataset.zLifted === '1') card._zPrev = card.style.zIndex;
      e.preventDefault();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };
    card.addEventListener('pointerdown', onDown);
  
  },
  // (was _makeCanvasDraggable)
  // 画布级手势（平移 / 双指捏合 / 空格抓手 / 滚轮）统一走共享 CanvasGestures（C3 机制收敛），
  // 模式专属的「卡片拖拽 / 框选」经 onEmptyPointerDown 回调注入，避免三模式各自维护一份漂移。
  makeCanvasDraggable(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    const root = ctrl._el;
    if (!canvas || !root) return;
    // 幂等重挂载：先销毁上一次的共享接线（指针手势 / 滚轮 / 空格抓手）。
    // 关键：installSpaceHand 挂的是 document 级 keydown，不销毁会随 mount 次数叠加。
    if (ctrl._gestureDetach) { ctrl._gestureDetach(); ctrl._gestureDetach = null; }
    if (ctrl._wheelDetach) { ctrl._wheelDetach(); ctrl._wheelDetach = null; }
    if (ctrl._hand && typeof ctrl._hand.destroy === 'function') { ctrl._hand.destroy(); ctrl._hand = null; }

    // 双击空白：归位所有便签到视野中心(fit-all)；无便签则复位画布
    root.addEventListener('dblclick', (e) => {
      if (ctrl._mode === 'mindmap') return;                 // 导图模式：归位交互属于导图，便签不接手
      if (e.target.closest('.tw-card, button, .tw-card-resize, input, textarea')) return;
      ctrl._recenterNotes();
    });

    // 空格=临时抓手 / Hand 工具：统一接线（含状态对象 state，供 attach 读取）
    const hand = CanvasGestures.installSpaceHand(root, { isActive: () => ctrl._mode !== 'mindmap' });
    ctrl._hand = hand;

    // 滚轮：统一接线（⌘/Ctrl=缩放、Shift=横移、普通=平移；Alt+滚轮也走正常平移，单卡缩放快捷键已移除）
    ctrl._wheelDetach = CanvasGestures.installWheel(root, {
      isActive: () => ctrl._mode !== 'mindmap',
      getView: () => ({
        x: CanvasViewport.getOffset(ctrl).x,
        y: CanvasViewport.getOffset(ctrl).y,
        scale: CanvasViewport.getScale(ctrl),
      }),
      zoomAt: (cx, cy, f) => CanvasViewport.zoomAt(ctx, cx, cy, f),
      panBy: (dx, dy) => CanvasViewport.panBy(ctx, dx, dy),
    });

    // 平移 / 捏合 / 空白判定：统一接管；空缺点交给便签的「清选 + 框选」
    const detach = CanvasGestures.attach(root, {
      isActive: () => ctrl._mode !== 'mindmap',
      state: hand.state,
      getView: () => ({
        x: CanvasViewport.getOffset(ctrl).x,
        y: CanvasViewport.getOffset(ctrl).y,
        scale: CanvasViewport.getScale(ctrl),
      }),
      setView: (v) => CanvasViewport.set(ctx, v.x, v.y, v.scale),
      getScale: () => CanvasViewport.getScale(ctrl),
      zoomAt: (cx, cy, f) => CanvasViewport.zoomAt(ctx, cx, cy, f),
      panBy: (dx, dy) => CanvasViewport.panBy(ctx, dx, dy),
      onPointerDownAny: () => { if (ctrl._pinOnly) ctrl._pinOnly(null); },   // 点空白清钉
      onBeforePan: () => { if (ctrl._clearSelection) ctrl._clearSelection(); },
      onPanStart: () => {
        ctrl._setLodDragging(true);                 // 平移期间降级（对标 tldraw 相机移动时简化）
        canvas.style.willChange = 'transform';      // 仅平移期间临时提升合成层，松手即撤
        root.classList.add('dragging');
      },
      onPanEnd: () => {
        ctrl._setLodDragging(false);                // 松手即恢复满细节
        root.classList.remove('dragging');
        canvas.style.willChange = '';               // 撤掉合成层提升，避免常驻巨型层拖垮整页合成器
        ctrl._scheduleSave();                       // 持久化画布偏移
      },
      onPinchWillStart: () => { if (ctrl._cancelMarquee) ctrl._cancelMarquee(); },  // 取消可能已起的框选
      onPinchStart: () => {
        ctrl._setLodDragging(true);
        canvas.style.willChange = 'transform';
      },
      onPinchEnd: () => {
        ctrl._setLodDragging(false);
        canvas.style.willChange = '';
        ctrl._scheduleSave();
      },
      onEmptyPointerDown: (e) => {
        // Excalidraw 语义：拖空白 = 框选（Shift = 追加）；平移改由 空格/中键/抓手/滚轮/双指 承担
        if (!e.shiftKey && ctrl._clearSelection) ctrl._clearSelection();
        ctrl._startMarquee(e, e.shiftKey);
      },
    });
    ctrl._gestureDetach = detach;

    // 【根因修复·退不出编辑态】编辑态下，点便签文本/控件以外的任意处即退出编辑（捕获阶段，
    // 先于画布平移的 preventDefault 生效——否则 preventDefault 会抑制默认失焦、导致 blur 兜底失效）。
    root.addEventListener('pointerdown', (e) => {
      const editing = ctrl._canvas && ctrl._canvas.querySelector('.tw-card.editing');
      if (!editing) return;
      if (e.target.closest('.tw-card-text')) return;            // 仍在文本内：继续编辑
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link, input, textarea')) return;
      ctrl._exitAllEdits();
    }, true);
  },
  // (was _setCanvasOffset)
  setCanvasOffset(ctx, x, y) {
    const { state, ctrl } = ctx;
    // 只改平移、保留当前缩放比：缩放由 CanvasViewport.set / zoomAt 单独管理，
    // 避免「重排后居中」等只传 x/y 的调用把用户的缩放级别抹回 100%。
    CanvasViewport.set(ctx, x, y, CanvasViewport.getScale(ctrl));
  
  },
  // (was _applyCanvasTransform)
  applyCanvasTransform(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    // 平移 + 缩放的唯一写入口（内部已含 _scheduleCull 重算挂载）
    CanvasViewport.apply(ctx);
  
  },
  // (was _selectOnly)
  selectOnly(ctx, card) {
    const { state, ctrl } = ctx;
    if (!ctrl._selected) ctrl._selected = new Set();
    ctrl._selected.forEach((c) => { if (c !== card) c.classList.remove('selected'); });
    ctrl._selected.clear();
    if (card) { ctrl._selected.add(card); card.classList.add('selected'); ctrl._blurInput(); }
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _toggleSelect)
  toggleSelect(ctx, card) {
    const { state, ctrl } = ctx;
    if (!ctrl._selected) ctrl._selected = new Set();
    if (ctrl._selected.has(card)) { ctrl._selected.delete(card); card.classList.remove('selected'); }
    else { ctrl._selected.add(card); card.classList.add('selected'); ctrl._blurInput(); }
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _blurInput)
  blurInput(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._input && document.activeElement === ctrl._input) ctrl._input.blur();
  
  },
  // (was _clearSelection)
  clearSelection(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._selected) return;
    ctrl._selected.forEach((c) => c.classList.remove('selected'));
    ctrl._selected.clear();
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _removeCard)
  removeCard(ctx, card) {
    const { state, ctrl } = ctx;
    if (!card) return;
    ctrl._removeNoteById(card.dataset.id);
  
  },
  // (was _deleteSelected)
  deleteSelected(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._selected || !ctrl._selected.size) return false;
    if (ctrl._undoStack) ctrl._undoStack.push();   // 整批一次快照：撤销时一起回来
    // 先快照成数组再删：_removeCard 会改动 _selected，边遍历 Set 边删会漏
    Array.from(ctrl._selected).forEach((c) => ctrl._removeCard(c));
    ctrl._clearSelection();
    ctrl._scheduleSave();
    return true;
  
  },
  // (was _marqueeEdgeDir) 框选时指针相对「视口(固定、不随画布平移)」的边缘方向（Figma 式自动平移触发）
  //   ⚠️ 必须用视口 rect，绝不能用被 transform 的画布 rect：画布 rect 含 canvasOffset 偏移，
  //      偏移一偏触发区就错位 → 拖到视口内就误触发、且越平移越靠内 → 整块画布失控漂移。
  marqueeEdgeDir(clientX, clientY, vp, edge) {
    const lx = clientX - vp.left, ly = clientY - vp.top;
    let dx = 0, dy = 0;
    if (lx < edge) dx = 1; else if (lx > vp.width - edge) dx = -1;
    if (ly < edge) dy = 1; else if (ly > vp.height - edge) dy = -1;
    return (dx || dy) ? { dx, dy } : null;
  },
  // (was _startMarquee)  additive=true 表示 Shift 追加框选（不清空已有选中）
  startMarquee(ctx, e, additive) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    ctrl._marqueeCancelled = false;
    if (ctrl._marquee) ctrl._marquee.remove();
    const m = document.createElement('div');
    m.className = 'tw-marquee';
    const badge = document.createElement('span');
    badge.className = 'tw-marquee-count';
    m.appendChild(badge);
    canvas.appendChild(m);
    ctrl._marquee = m;
    ctrl._marqueeRect = null;

    // 框选起点（画布内容坐标，恒定）：走统一换算，自动扣除缩放比
    const p0 = CanvasViewport.screenToCanvas(ctx, e.clientX, e.clientY);
    const sx0 = p0.x;
    const sy0 = p0.y;
    // 视口（固定、不随画布平移）：边缘判定必须基于它，不能用被 transform 的画布 rect
    const vpRect = (canvas.parentElement || canvas).getBoundingClientRect();
    let lastX = e.clientX, lastY = e.clientY;
    let rafId = 0;

    const EDGE = 48;   // 距视口边缘多近开始自动平移
    const MAX = 26;    // 每帧最大平移像素

    // 用当前屏幕坐标刷新框选矩形：画布随平移移动后，内容坐标会自然外扩 → 框得够画布外
    const refresh = () => {
      const p1 = CanvasViewport.screenToCanvas(ctx, lastX, lastY);
      const sx1 = p1.x, sy1 = p1.y;   // 终点内容坐标（已按缩放比换算）
      const x = Math.min(sx0, sx1), y = Math.min(sy0, sy1);
      const w = Math.abs(sx1 - sx0), h = Math.abs(sy1 - sy0);
      m.style.left = x + 'px'; m.style.top = y + 'px';
      m.style.width = w + 'px'; m.style.height = h + 'px';
      const r = { x, y, w, h };
      ctrl._marqueeRect = r;
      badge.textContent = (ctrl._countInRect ? ctrl._countInRect(r) : 0) + '';
    };

    // 指针是否贴「视口」边缘 → 自动平移方向（在左/上缘往对应方向平移露出那侧内容）
    const edgeDir = () => CardInteractions.marqueeEdgeDir(lastX, lastY, vpRect, EDGE);

    // 贴边时持续平移（Figma 式）：画布滚动、矩形内容坐标外扩，松手即选中画布外那片
    const tick = () => {
      rafId = 0;
      const d = edgeDir();
      if (d) {
        const off = (state && state.canvasOffset) || { x: 0, y: 0 };
        ctrl._setCanvasOffset(off.x + d.dx * MAX, off.y + d.dy * MAX);
        refresh();
      }
      if (d) rafId = requestAnimationFrame(tick);
    };

    const move = (ev) => {
      lastX = ev.clientX; lastY = ev.clientY;
      refresh();
      if (edgeDir() && !rafId) rafId = requestAnimationFrame(tick);
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (rafId) cancelAnimationFrame(rafId);
      if (ctrl._marquee) { ctrl._marquee.remove(); ctrl._marquee = null; }
      // 被双指捏合接管（_cancelMarquee）：不做任何选中变更，避免捏合时把已选清空
      if (ctrl._marqueeCancelled) { ctrl._marqueeCancelled = false; ctrl._marqueeRect = null; return; }
      ctrl._selectInRect(ctrl._marqueeRect || { x: sx0, y: sy0, w: 0, h: 0 }, additive);
      ctrl._marqueeRect = null;
      if (ctrl._revealSelection) ctrl._revealSelection();   // 兜底：选区超视口则平移露出
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    refresh();
  },
  /** 取消进行中的框选（双指捏合接管时用） */
  cancelMarquee(ctx) {
    const { ctrl } = ctx;
    ctrl._marqueeCancelled = true;
    if (ctrl._marquee) { ctrl._marquee.remove(); ctrl._marquee = null; }
    ctrl._marqueeRect = null;
  },
  // (was _countInRect) 统计落在矩形内（含画布外）的卡片数，供框选实时数量提示（不挂载、不选中）
  countInRect(ctx, r) {
    const { state, ctrl } = ctx;
    const sp = ctrl._spatial;
    const hits = sp ? sp.queryRect(r.x, r.y, r.x + r.w, r.y + r.h) : [];
    const noteIdx = ctrl._noteIndex ? ctrl._noteIndex() : null;
    let n = 0;
    hits.forEach((id) => {
      const g = ctrl._geo ? ctrl._geo.get(id) : null;
      const note = noteIdx ? noteIdx.get(id) : null;
      const lx = g ? g.x : (note ? note.x : 0);
      const ly = g ? g.y : (note ? note.y : 0);
      const w = g ? g.w : (note && note.w ? note.w : 340);
      const h = g ? g.h : (note && note.h ? note.h : 120);
      if (lx + w >= r.x && lx <= r.x + r.w && ly + h >= r.y && ly <= r.y + r.h) n++;
    });
    return n;
  },
  // (was _selectInRect)
  selectInRect(ctx, r, additive) {
    const { state, ctrl } = ctx;
    if (!ctrl._spatial) ctrl._spatial = new SpatialIndex(512);
    // 候选由空间索引 queryRect 给出（O(命中)），不再全量读 DOM。关键点：空间索引在剔除卸载时
    // 不清空，故**候选含离屏卡**。离屏卡无 DOM，无法被选中 —— 先按需挂载（进入 _selected 后即被
    // pinnedIds 钉住，后续剔除不会再卸载它），再判相交选中。这样 Shift 框选就能覆盖视口之外的内容。
    const hits = ctrl._spatial.queryRect(r.x, r.y, r.x + r.w, r.y + r.h);
    if (!additive) ctrl._clearSelection();   // Shift 追加框选：保留已有选中
    if (!ctrl._mountedCards) return;
    const noteIdx = ctrl._noteIndex ? ctrl._noteIndex() : null;
    hits.forEach((id) => {
      let card = ctrl._mountedCards.get(id);
      if (!card && noteIdx) {
        const note = noteIdx.get(id);
        if (!note) return;
        card = ctrl._mountCard ? ctrl._mountCard(note) : null;   // 离屏卡按需挂载，使其可被选中
        if (!card) return;
      }
      if (!card) return;
      const g = ctrl._geo ? ctrl._geo.get(id) : null;
      const lx = g ? g.x : (parseFloat(card.style.left) || 0);
      const ly = g ? g.y : (parseFloat(card.style.top) || 0);
      const w = g ? g.w : (card.offsetWidth || 0);
      const h = g ? g.h : (card.offsetHeight || 0);
      if (lx + w >= r.x && lx <= r.x + r.w && ly + h >= r.y && ly <= r.y + r.h) {
        if (!ctrl._selected) ctrl._selected = new Set();
        ctrl._selected.add(card);
        card.classList.add('selected');
      }
    });
    if (ctrl._updateSelBar) ctrl._updateSelBar();
  
  },
  // (was _revealSelection)
  revealSelection(ctx) {
    const { state, ctrl } = ctx;
    const sel = ctrl._selected;
    const canvas = ctrl._canvas;
    if (!sel || !sel.size || !canvas) return;
    // 可见区换算成画布坐标：布局尺寸 / 缩放比
    const s = CanvasViewport.getScale(ctrl);
    const VW = canvas.clientWidth / s, VH = canvas.clientHeight / s;
    if (VW < 2 || VH < 2) return;
    const off = CanvasViewport.getOffset(ctrl);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, any = false;
    sel.forEach((card) => {
      const id = card.dataset && card.dataset.id;
      const g = ctrl._geo ? ctrl._geo.get(id) : null;
      const lx = g ? g.x : (parseFloat(card.style.left) || 0);
      const ly = g ? g.y : (parseFloat(card.style.top) || 0);
      const w = g ? g.w : (card.offsetWidth || 0);
      const h = g ? g.h : (card.offsetHeight || 0);
      minX = Math.min(minX, lx); minY = Math.min(minY, ly);
      maxX = Math.max(maxX, lx + w); maxY = Math.max(maxY, ly + h);
      any = true;
    });
    if (!any) return;
    // 选区完全在视口内：不动（避免无谓平移打断视线）
    const outX = minX < -off.x / s || maxX > VW - off.x / s;
    const outY = minY < -off.y / s || maxY > VH - off.y / s;
    if (outX || outY) {
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      // 平移到选区中心；平移量在 scale 之前生效，故需乘以 s（保留当前缩放比）
      ctrl._setCanvasOffset(s * (VW / 2 - cx), s * (VH / 2 - cy));
      if (ctrl._updateSelBar) ctrl._updateSelBar();        // 选区工具条跟随新视口重定位
    }
  },
  // (was _bindSelectionKeys)
  bindSelectionKeys(ctx) {
    const { state, ctrl } = ctx;
    const root = ctrl._el;
    if (!root) return;
    // 幂等：重复绑定时先摘掉旧监听，避免 document 级 keydown 叠加。
    if (ctrl._selKeyHandler) { document.removeEventListener('keydown', ctrl._selKeyHandler); ctrl._selKeyHandler = null; }
    ctrl._selKeyHandler = (e) => {
      // 不能直接判 e.target.tagName：机身输入框在 shadow 树内，事件穿出 shadow 边界后
      // target 会被重定向成 host(div)，该守卫会失效 → 在输入框里按退格会误删选中的便签、
      // 按 F 会触发归位。改用 composedPath() 取真实路径判定。
      if (isFromTextEntry(e)) {
        // 例外：焦点在全局打印框（twInput）且已选中卡片、且打印框为空时，
        // Delete/Backspace 视作「删卡」指令（空打印框退格本无意义）。
        // 打印框非空（正在打字）则保留原意：拦掉、让浏览器删字，避免误删选中的卡。
        // 主路径由「选中卡片时 _blurInput 让打印框失焦」保证，这里只是兜底。
        if ((e.key === 'Delete' || e.key === 'Backspace') && ctrl._selected && ctrl._selected.size) {
          const inp = ctrl._input;
          const inPrint = inp && e.composedPath && e.composedPath().some((n) => n === inp);
          if (inPrint && !inp.value) { e.preventDefault(); ctrl._deleteSelected(); }
        }
        return;
      }
      // 撤销 / 重做：Cmd/Ctrl+Z、Cmd/Ctrl+Shift+Z。
      // 导图模式下让位给 MindmapFeature（它有自己的文档与历史），否则一次按键会被两边各撤一次。
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        if (ctrl._mode === 'mindmap') return;
        e.preventDefault();
        ctrl._undoRedo(e.shiftKey ? 'redo' : 'undo');
        return;
      }
      // ⌘±/0、Shift+1/2、H 等「画布缩放/适应/抓手」键已统一收口到 CanvasKeys（C2）：
      // 便签与导图各注册一份、命中且本模式激活时 stopImmediatePropagation，杜绝双响。
      // 以下仅处理便签模式专属键（撤销/重做、删除、F 归位）。

      const cv = ctrl._canvas;
      if (!cv || !cv.isConnected || cv.getBoundingClientRect().width < 2) return;
      if (cv.querySelector('.tw-card.editing')) return;   // 编辑中不打断
      // 删除选中（仅当选中非空）
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (ctrl._selected && ctrl._selected.size) { e.preventDefault(); ctrl._deleteSelected(); }
        return;
      }
      // F：便签被拖出视野后，重新归位到视野中心
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); ctrl._recenterNotes(); }
    };
    document.addEventListener('keydown', ctrl._selKeyHandler);

    // 通用画布键位（⌘±/0、Shift+1/2、H）统一收口到 CanvasKeys（C2）：与导图共用同一份逻辑，
    // 命中且便签激活时 stopImmediatePropagation，避免事件继续到导图处理器造成双响。
    // 幂等：CanvasKeys 挂 document 级捕获监听，重复绑定会叠加（且旧 handler 先执行并
    // stopImmediatePropagation，会把新 handler 挡掉），故先销毁旧的。
    if (ctrl._canvasKeysDetach) { ctrl._canvasKeysDetach(); ctrl._canvasKeysDetach = null; }
    ctrl._canvasKeysDetach = CanvasKeys.bind({
      isActive: () => ctrl._mode !== 'mindmap',
      zoomByCenter: (f) => ctrl._zoomByCenter(f),
      zoomReset: () => ctrl._zoomReset(),
      fitView: () => ctrl._fitNotesToView(),
      fitSelection: () => ctrl._fitSelectionToView(),
      toggleHand: () => ctrl._hand.toggleHand(),
      zoomStep: 1.25,
    });
  },
  // (was _enforceEditLimit)
  enforceEditLimit(ctx, text) {
    const { state, ctrl } = ctx;
    if (!text) return;
    const full = text.innerText || '';
    if (full.length <= MAX_LEN) return;
    text.innerText = full.slice(0, MAX_LEN);
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(text);
      range.collapse(false);   // 光标落到末尾
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (typeof Toast !== 'undefined') Toast.showToast(`便签最多 ${MAX_LEN} 字`, 'info');
  
  },
  // (was _makeResizable)
  makeResizable(ctx, card) {
    const { state, ctrl } = ctx;
    // 写作档（MD可视化写作）：卡片尺寸由内容决定，不提供拖角缩放手柄——
    // 单卡缩放是便签维度，文章里没有这语义（与纸样 / 旋转在写作档被隐藏 / 归零同理）。
    if (ctrl._mode === 'write') return;
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
    // 【帧预算】缩放是重活：_applyZoom 会写 style + WritingDoc.setZoom（全量模型重写）
    // + _syncCardScaleButtons（DOM 查询）。pointermove 可达 120Hz，照原样每个事件同步跑一次
    // 会远超帧预算。故与旋转手势同一策略：目标值在本次手势内本地累计，rAF 合帧后每帧只落一次
    // （对标 tldraw 的 batched store updates）。
    let pendingZoom = 1;
    let raf = 0;
    // ⌘/Ctrl+滚轮缩放同理：触控板可在一帧内连发多次，需合帧
    const apply = () => {
      raf = 0;
      ctrl._applyZoom(card, pendingZoom);
      ctrl._scheduleRenderLinks();   // 尺寸变化会移动端点
    };
    const onMove = (e) => {
      if (!resizing) return;
      // 对角手势：向右下拖 = 放大（横向与纵向位移都计入，手感更自然）
      const delta = (e.clientX - startX) + (e.clientY - startY);
      pendingZoom = ((baseW + delta) / baseW) * startZoom;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (!resizing) return;
      resizing = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ctrl._applyZoom(card, pendingZoom);   // 补写最后一帧，避免丢掉末尾增量
      card.classList.remove('is-resizing');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      ctrl._measureCard(card); // 缩放手势结束重测几何→刷新 geo+空间索引
      ctrl._scheduleSave(); // 落盘新尺寸
    };

    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startZoom = ctrl._clampZoom(card.dataset.zoom);
      pendingZoom = startZoom;
      const w = card.getBoundingClientRect().width || card.offsetWidth;
      baseW = (w || 340) / startZoom;
      card.classList.add('is-resizing');
      card.style.zIndex = String(++ctrl._zTop);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ctrl._applyZoom(card, 1);
      ctrl._scheduleSave();
    });

    // 卡片滚轮快捷键已全部移除：
    //   · Alt+滚轮（单卡缩放）—— 移除，改由卡片上的 S/M/L/XL 档位按钮操作；
    //   · Shift+滚轮（调字号）—— 移除，改由卡片上的「放大/缩小字号」圆钮或右侧字号面板操作。
    // 所有滚轮事件一律放行给画布层做平移/缩放，卡片不再拦截滚轮。
  
  },
  // (was _makeRotatable)
  makeRotatable(ctx, card) {
    const { state, ctrl } = ctx;
    const handle = document.createElement('div');
    handle.className = 'tw-card-rotate';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '旋转便签');
    handle.title = '拖动旋转 · Shift 吸附 15° · 双击归零';
    handle.innerHTML = ICON_ROTATE;
    ctrl._applyKnobSize(handle);   // 内联像素：与右侧连线锚点严格等大
    card.appendChild(handle);

    let rotating = false;
    let lastAngle = 0;
    // 【性能】旋转是绕卡片中心的，中心在旋转下不变 → pointerdown 时取一次即可复用。
    // 原先每次 move 都 getBoundingClientRect()，且与 _applyRot 的写入交替 → 强制同步重排。
    let cx0 = 0;
    let cy0 = 0;
    // 目标角度在本次手势内本地累计：合帧后 _applyRot 每帧才写一次 dataset，
    // 若仍像原先那样「读 dataset.rot + 增量」，一帧内的第二个事件会读到未更新的旧值 → 丢增量。
    let pendingDeg = 0;
    let raf = 0;
    const angleOf = (ax, ay, px, py) => Math.atan2(py - ay, px - ax) * 180 / Math.PI;
    const apply = () => {
      raf = 0;
      ctrl._applyRot(card, pendingDeg);
      ctrl._scheduleRenderLinks();   // 旋转后端点沿旋转矩形重算
    };
    const onMove = (e) => {
      if (!rotating) return;
      const a = angleOf(cx0, cy0, e.clientX, e.clientY);
      let delta = a - lastAngle;
      // 跨越 ±180° 时 atan2 会跳变，归一化增量避免「猛地多转一圈」
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;
      lastAngle = a;
      pendingDeg += delta;
      // Shift 吸附到 15° 网格；吸附值写回累计量，保证松手后不回弹
      if (e.shiftKey) pendingDeg = Math.round(pendingDeg / 15) * 15;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = () => {
      if (!rotating) return;
      rotating = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ctrl._applyRot(card, pendingDeg);   // 补写最后一帧，避免丢掉末尾增量
      ctrl._measureCard(card);            // 旋转手势结束重测几何→刷新 geo+空间索引
      ctrl._scheduleRenderLinks();
      card.classList.remove('is-rotating');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      ctrl._scheduleSave();   // 落盘新角度
    };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rotating = true;
      const r = card.getBoundingClientRect();
      cx0 = r.left + r.width / 2;
      cy0 = r.top + r.height / 2;
      pendingDeg = Number(card.dataset.rot) || 0;
      lastAngle = angleOf(cx0, cy0, e.clientX, e.clientY);
      card.classList.add('is-rotating');
      card.style.zIndex = String(++ctrl._zTop);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
    // 双击握柄归零（stopPropagation 避免冒泡到卡片/画布触发编辑或 fit-all）
    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ctrl._applyRot(card, 0);
      ctrl._scheduleSave();
    });
  
  },
  // (was _bindEdit)
  bindEdit(ctx, card) {
    const { state, ctrl } = ctx;
    card.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate')) return;
      if (card.classList.contains('editing')) return;
      ctrl._enterEdit(card);
    });
  
  },
  // (was _exitAllEdits)
  exitAllEdits(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    Array.from(ctrl._canvas.querySelectorAll('.tw-card.editing')).forEach((c) => ctrl._exitEdit(c));
  
  },
  // (was _enterEdit)
  enterEdit(ctx, card) {
    const { state, ctrl } = ctx;
    if (card.classList.contains('editing')) return;
    ctrl._exitAllEdits();
    const text = card.querySelector('.tw-card-text');
    if (!text) return;
    // 若还在打字动画中就进入编辑：先补齐全文并停表。
    // 否则逐字写入会持续覆写 contentEditable —— 光标被打飞、用户输入与动画互覆，
    // 且 pendingText 一除，落盘就会拿到「半截 + 手输」的残缺内容。
    ctrl._finishTyping(card);
    card.classList.add('editing');
    ctrl._editingId = card.dataset.id;   // 编辑中：钉在屏上，剔除跳过
    text.setAttribute('contenteditable', 'true'); // 所见即所得：直接在纸样内改，样式已就位
    text.focus();
    // 光标落到末尾
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    // 【根因修复】事件回调必须用闭包绑定 this：浏览器触发 addEventListener 时 this 会指向
    // text 元素而非 feature 实例，否则 _exitEdit/_scheduleSave 变成 undefined ——
    // 表现为 Escape 退出失效、输入不自动落盘。处理器存到 card._editHandlers 以便对称移除。
    const onInput = (e) => {
      if (e && e.isComposing) { ctrl._scheduleSave(); return; }  // 输入法组字中：先不截断
      ctrl._enforceEditLimit(text);
      ctrl._notes = WritingDoc.setText(ctrl._notes, card.dataset.id, text.innerText);  // 连续编辑改走 WritingDoc 原语
      ctrl._scheduleSave();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        ctrl._exitEdit(card); // Enter 不拦截：contenteditable 内回车即多行便签
      }
    };
    const onPaste = (e) => {
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData('text/plain');
      const room = MAX_LEN - (text.innerText.length || 0);
      if (room <= 0) {
        if (typeof Toast !== 'undefined') Toast.showToast(`便签最多 ${MAX_LEN} 字`, 'info');
        return;
      }
      const allowed = t.length > room ? t.slice(0, room) : t;
      document.execCommand('insertText', false, allowed); // 只粘纯文本，不把网页样式带进便签
    };
    card._editHandlers = { onInput, onKey, onPaste };
    text.addEventListener('input', onInput);
    text.addEventListener('keydown', onKey);
    text.addEventListener('paste', onPaste);
    // 【根因修复·退不出编辑态】失焦即退出：点了便签以外的任何地方（空白画布 / 其它便签 /
    // 卡片纸边）都算「完成编辑」，避免卡在编辑态出不去。
    // 必须在 _exitEdit 里先移除本监听、再 removeAttribute('contenteditable')，
    // 否则移除 contenteditable 触发的 blur 会二次进入 _exitEdit。
    const onBlur = () => ctrl._exitEdit(card);
    card._editBlur = onBlur;
    text.addEventListener('blur', onBlur);
  
  },
  // (was _exitEdit)
  exitEdit(ctx, card) {
    const { state, ctrl } = ctx;
    if (!card.classList.contains('editing')) return;
    const text = card.querySelector('.tw-card-text');
    card.classList.remove('editing');
    if (ctrl._editingId === card.dataset.id) ctrl._editingId = null;   // 退出编辑：解除钉屏
    const h = card._editHandlers;
    card._editHandlers = null;
    if (text) {
      if (card._editBlur) { text.removeEventListener('blur', card._editBlur); card._editBlur = null; }
      text.removeAttribute('contenteditable');
      if (h) {
        text.removeEventListener('input', h.onInput);
        text.removeEventListener('keydown', h.onKey);
        text.removeEventListener('paste', h.onPaste);
      }
      if (window.getSelection) window.getSelection().removeAllRanges();
      ctrl._notes = WritingDoc.setText(ctrl._notes, card.dataset.id, text.innerText);  // 退出编辑：落盘前同步模型
      ctrl._scheduleSave(); // 落盘：_collectNotes 读的是 .tw-card-text 内容
      if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    }
    ctrl._invalidateGeo(card.dataset.id);   // 编辑可能改变了卡片高度 → 几何失效
  
  },
  // (was _pinOnly)
  pinOnly(ctx, card) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
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
  // (was _addLink)
  addLink(ctx, fromId, toId) {
    const { state, ctrl } = ctx;
    if (!fromId || !toId || fromId === toId) return false;
    const dup = ctrl._links.some((l) =>
      (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId));
    if (dup) return false;
    ctrl._links.push({ from: fromId, to: toId, route: 'bezier', bend: 0, dash: 'solid' });
    // 【连线定序】连线是文章顺序的输入之一：增/删连线后按 orderIds（连线优先 → 回退阅读序）
    // 重算一次 seq。真值仍落在 seq 上（读取方 O(1)、不每帧现推），连线只在变更瞬间参与推导。
    if (ctrl._mode === 'write') {
      ctrl._notes = WritingDoc.setOrder(ctrl._notes, WritingDoc.orderIds(ctrl._notes, ctrl._links));
      ctrl._refreshWriteOrder();   // 顺序真变了（连线定序）→ 显式刷徽标（已从渲染路径解耦）
    }
    return true;
  
  },
  // (was _removeLink)
  removeLink(ctx, fromId, toId) {
    const { state, ctrl } = ctx;
    ctrl._links = ctrl._links.filter((l) =>
      !((l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId)));
    // 【连线定序】删连线同样要重算 seq（连线是顺序输入之一），与 addLink 同一处理
    if (ctrl._mode === 'write') {
      ctrl._notes = WritingDoc.setOrder(ctrl._notes, WritingDoc.orderIds(ctrl._notes, ctrl._links));
      ctrl._refreshWriteOrder();
    }
  
  },
  // (was _removeLinksOfData)
  removeLinksOfData(ctx, cardId) {
    const { state, ctrl } = ctx;
    if (!cardId) return;
    ctrl._links = ctrl._links.filter((l) => l.from !== cardId && l.to !== cardId);
    // 【连线定序】级联删线同样重算 seq，与 addLink / removeLink 保持一致
    if (ctrl._mode === 'write') {
      ctrl._notes = WritingDoc.setOrder(ctrl._notes, WritingDoc.orderIds(ctrl._notes, ctrl._links));
      ctrl._refreshWriteOrder();
    }
  
  },
  // (was _ensureNotesVisible)
  ensureNotesVisible(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas || ctrl._fitDone) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    if (!VW || !VH) {
      if (ctrl._fitRo || typeof ResizeObserver === 'undefined') return;
      ctrl._fitRo = new ResizeObserver(() => {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (ctrl._fitRo) { ctrl._fitRo.disconnect(); ctrl._fitRo = null; }
        ctrl._ensureNotesVisible();
      });
      ctrl._fitRo.observe(canvas);
      return;
    }
    ctrl._fitDone = true;
    const cards = Array.from(canvas.querySelectorAll('.tw-card'));
    if (!cards.length) return;
    // 始终按当前视野宽高把便签群居中：侧边栏↔中央 重建后宽度变化，旧偏移不再适配，
    // 必须重新居中（否则便签偏在一侧，需手动双击空白才能归位）。
    // 运行中手动平移因 _fitDone 已置真、本函数不再触发，故视角仍被保留。
    ctrl._recenterNotes();
  
  },
  // (was _recenterNotes)
  recenterNotes(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    // 【P8 视口剔除】必须按模型真源算包围盒：离屏卡不在 DOM，querySelectorAll 只得到可见卡 → 居中偏掉。
    // 尺寸取几何缓存（已测量），未测量（罕见）回退默认尺寸。
    if (!ctrl._notes || !ctrl._notes.length) { ctrl._setCanvasOffset(0, 0); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of ctrl._notes) {
      const x = (typeof n.x === 'number') ? n.x : 0;
      const y = (typeof n.y === 'number') ? n.y : 0;
      const g = ctrl._geo ? ctrl._geo.get(n.id) : null;
      const w = g ? g.w : 340, h = g ? g.h : 200;
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
    }
    const bcx = (minX + maxX) / 2, bcy = (minY + maxY) / 2;
    // 缩放后：可见区宽（画布坐标）= 布局宽 / s。平移量 tx 作用在 scale 之前，
    // 故让包围盒中心落在视口中心的平移量 = 布局宽/2 - s * 中心。
    const s = CanvasViewport.getScale(ctrl);
    ctrl._setCanvasOffset(VW / 2 - s * bcx, VH / 2 - s * bcy);
  
  },
  // (was _arrangeNotes)
  arrangeNotes(ctx) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    // 导图有自己的文档与布局，排版只管便签：导图模式下直接提示，不静默切换模式（更不再丢弃导图）
    if (ctrl._mode === 'mindmap') { ctrl._showScreenMsg('先拨回便签画布再排版', 1200); return; }
    const seq = ctrl._orderCards();                        // 全部卡（模型，剔除态完整）
    const selCount = ctrl._selected ? ctrl._selected.size : 0;
    // 只有选中 ≥2 张才「对选中组」排版；选中 0 张或仅 1 张，都按全局排版处理。
    // 选中单张不再报错拒绝：单张排版本身没有意义（只会把它独自拽到网格原点），
    // 而用户在这个状态下点排版，意图多半是「整理整体」，直接排全部更符合预期。
    const selIds = new Set();
    if (selCount >= 2 && ctrl._selected) {
      ctrl._selected.forEach((c) => { const id = c.dataset && c.dataset.id; if (id) selIds.add(id); });
    }
    const target = (selCount >= 2) ? seq.filter((c) => selIds.has(c.id)) : seq;
    if (!target.length) { ctrl._showScreenMsg('无便签可排版', 1000); return; }

    // 一键排版会覆盖用户手工摆好的自由布局（位置即数据），不可逆 ——
    // 必须在任何变更（缩放 / 旋转 / 坐标）之前留档。此处所有提前 return 都已走完。
    if (ctrl._undoStack) ctrl._undoStack.push();
    // 重排即「标准化」：把每张便签的尺寸档位与旋转归零到标准态（S/M/L/XL→M、角度→0），
    // 让网格按统一标准尺寸排布；先复位再量尺寸，列宽/间距才准确。
    // 【P8 视口剔除】挂载卡走 DOM（_applyZoom/_applyRot 会重测几何），离屏卡只改模型，
    // 重挂载时按模型重建 —— 保证全部卡（含离屏）都被标准化、进网格。
    target.forEach((c) => {
      if (c.el) { ctrl._applyZoom(c.el, 1); ctrl._applyRot(c.el, 0); }
      ctrl._notes = WritingDoc.setZoom(ctrl._notes, c.id, 1);
      ctrl._notes = WritingDoc.setRot(ctrl._notes, c.id, 0);
    });

    const GAP = 24;                                       // 统一间距(px)
    const sizes = target.map((c) => {
      const g = ctrl._geo ? ctrl._geo.get(c.id) : null;
      return { w: (g ? g.w : (c.el ? c.el.offsetWidth : 340)) || 340, h: (g ? g.h : (c.el ? c.el.offsetHeight : 200)) || 200 };
    });
    const colW = Math.max(1, ...sizes.map((s) => s.w));   // 等宽网格：列宽取最大卡宽
    // 宽度自适应：按当前画布可用宽推算可容纳列数，窄栏自然落 1 列（竖排），
    // 宽栏在「√n」上限内尽量多列，避免单行铺太长。
    const availW = canvas.clientWidth || (colW + GAP);
    const fitCols = Math.max(1, Math.floor((availW + GAP) / (colW + GAP)));
    const cols = Math.min(fitCols, Math.max(1, Math.ceil(Math.sqrt(target.length))));

    let x = 0, y = 0, rowMaxH = 0;
    target.forEach((c, i) => {
      ctrl._notes = WritingDoc.setPos(ctrl._notes, c.id, x, y);  // 位置即数据：同步模型（含离屏卡）
      if (c.el) { c.el.style.left = x + 'px'; c.el.style.top = y + 'px'; }  // 在屏卡同步 DOM
      rowMaxH = Math.max(rowMaxH, sizes[i].h);
      if ((i + 1) % cols === 0 || i === target.length - 1) {   // 行末 → 换行
        x = 0;
        y += rowMaxH + GAP;
        rowMaxH = 0;
      } else {
        x += colW + GAP;
      }
    });

    ctrl._syncLayoutGeo();                          // 网格位置已改写 → 几何缓存/空间索引同步（否则连线端点指向幽灵位置）
    ctrl._scheduleRenderLinks();                            // 连线端点随位置更新
    ctrl._scheduleSave();                                  // 持久化新位置
    ctrl._scheduleCull();                                  // 网格排版后重算挂载：移出视野的卡卸载

    // 居中到排版后的便签群（按模型网格坐标 + 缓存尺寸算包围盒，含离屏卡）
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    x = 0; y = 0; rowMaxH = 0;
    target.forEach((c, i) => {
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + sizes[i].w); maxY = Math.max(maxY, y + sizes[i].h);
      rowMaxH = Math.max(rowMaxH, sizes[i].h);
      if ((i + 1) % cols === 0 || i === target.length - 1) { x = 0; y += rowMaxH + GAP; rowMaxH = 0; }
      else { x += colW + GAP; }
    });
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    // 【缩放标准化】一键排版即「回归标准态」：当前缩放只要不是 100%（无论放大或缩小，
    // 用户约定「偏离 100% 都算」），排版后把缩放比也拉回 100%。
    // 顺序关键：先 _zoomReset() 把 scale 拉回 1（保持视口中心内容点不动），再按 100% 居中排版后内容。
    // 不可先居中后重置——旧居中公式未乘 scale，在 scale≠1 时会算错位移，_zoomReset 再把错误中心锁死，
    // 导致要再点一次才归位（recenterNotes 的正确写法即居中需乘 s；scale=1 时 *s 等价本公式）。
    if (Math.abs(CanvasViewport.getScale(ctrl) - 1) > 1e-3) ctrl._zoomReset();
    // 此刻 scale=1，居中公式无需乘 s
    ctrl._setCanvasOffset(VW / 2 - (minX + maxX) / 2, VH / 2 - (minY + maxY) / 2);

    // 明确作用范围：单张/未选中时其实动了全部，不说明会让人困惑「我只选了一张，怎么全动了」
    const scope = selCount >= 2 ? '选中的 ' : '全部 ';
    ctrl._showScreenMsg('已排版' + scope + target.length + ' 张便签（尺寸/旋转已归零）', 1200);
  
  },
  // (was _moveCardInOrder)
  moveCardInOrder(ctx, card, dir) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas || ctrl._mode !== 'write') return;
    const seq = ctrl._orderCards();
    const i = seq.findIndex((c) => c.el === card);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= seq.length) {
      ctrl._showScreenMsg(dir < 0 ? '已经是最前面一张' : '已经是最后面一张', 1200);
      return;
    }
    const a = seq[i], b = seq[j];
    if (ctrl._undoStack) ctrl._undoStack.push();
    // 写作档开启视口剔除：相邻卡可能离屏（el === null）。位置即数据 —— 先交换模型坐标（含离屏卡），
    // 在屏卡再同步 DOM；离屏卡交由剔除按新模型坐标挂回，绝不手工搬（原代码直接读 b.style 会空指针崩溃）。
    const next = seq.slice();
    next[i] = seq[j]; next[j] = seq[i];       // 新顺序 = 相邻两位互换（供 _rewireChain 重接整条链）
    // 【顺序一等数据】顺序真值是 seq：坐标已退化为纯呈现，只换坐标不足以改变顺序，
    // 必须显式重写 seq，否则徽标 / 导出 / 预览仍按旧顺序（_orderCards 现按 seq 排序）。
    ctrl._notes = WritingDoc.setOrder(ctrl._notes, next.map((c) => c.id));
    const ax = a.x, ay = a.y, bx = b.x, by = b.y;
    ctrl._notes = WritingDoc.setPos(ctrl._notes, a.id, bx, by);
    ctrl._notes = WritingDoc.setPos(ctrl._notes, b.id, ax, ay);
    if (a.el && b.el) {
      const al = a.el.style.left, at = a.el.style.top;
      a.el.style.left = b.el.style.left; a.el.style.top = b.el.style.top;
      b.el.style.left = al; b.el.style.top = at;
    } else if (a.el) {
      a.el.style.left = bx + 'px'; a.el.style.top = by + 'px';   // a 在屏→搬去 b 的模型坐标
    } else if (b.el) {
      b.el.style.left = ax + 'px'; b.el.style.top = ay + 'px';   // b 在屏→搬去 a 的模型坐标
    }
    ctrl._syncLayoutGeo();                          // 两张卡位置互换 → 几何缓存/空间索引同步（否则连线端点指向幽灵位置）
    ctrl._rewireChain(next);
    ctrl._scheduleRenderLinks();
    ctrl._scheduleSave();
    ctrl._refreshWriteOrder();                // 徽标 + 上移/下移可用态
    ctrl._scheduleCull();                     // 上移/下移后重算挂载
    ctrl._showScreenMsg((dir < 0 ? '已上移到第 ' : '已下移到第 ') + (j + 1) + ' 位', 1400);
  
  },
  // (was _rewireChain)
  rewireChain(ctx, seq) {
    const { state, ctrl } = ctx;
    const L = ctrl._links || [];
    if (L.length < 1 || seq.length < 2) return false;
    const out = new Map(), inn = new Map();
    for (const l of L) {
      out.set(l.from, (out.get(l.from) || 0) + 1);
      inn.set(l.to, (inn.get(l.to) || 0) + 1);
      if (out.get(l.from) > 1 || inn.get(l.to) > 1) return false;   // 有分叉 → 不擅自动
    }
    const route = L[0].route || 'bezier';
    const dash = L[0].dash || 'solid';
    ctrl._links = seq.slice(0, -1).map((c, k) => ({
      from: seq[k].id, to: seq[k + 1].id, route, bend: 0, dash,
    }));
    return true;
  
  },
  // (was _bindOrderSteps)
  bindOrderSteps(ctx, card) {
    const { state, ctrl } = ctx;
    const go = (dir) => (e) => { e.stopPropagation(); ctrl._moveCardInOrder(card, dir); };
    const up = card.querySelector('.tw-card-move-up');
    const dn = card.querySelector('.tw-card-move-down');
    if (up) up.addEventListener('click', go(-1));
    if (dn) dn.addEventListener('click', go(1));
  
  },
};