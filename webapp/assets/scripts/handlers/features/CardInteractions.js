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
import { fitCardText } from '../../utils/cardTextFit.js';
import { CanvasViewport } from '../../services/CanvasViewport.js';
import { CanvasGestures } from '../../services/CanvasGestures.js';
import { CanvasKeys } from '../../services/CanvasKeys.js';
// 三档差异真源（P2 · A 类）：卡片交互归属 / 连线定序，一律查表
import { ModePolicy } from './modePolicy.js';

/** 【连线定序】连线是文章顺序的输入之一：增 / 删连线后按 orderIds（连线优先 → 回退阅读序）
 *  重算一次 seq，并显式刷徽标。真值仍落在 seq 上（读取方 O(1)、不每帧现推），
 *  连线只在变更瞬间参与推导。
 *  是否启用由策略表决定（linksDefineOrder）—— 原先这条规则连同 _mode === 'write'
 *  在 addLink / removeLink / removeLinksOfData 里各写一遍，加档位时极易只改其中一处。 */
function reseqByLinks(ctrl) {
  if (!ModePolicy.linksDefineOrder(ctrl._mode)) return;
  ctrl._notes = WritingDoc.setOrder(ctrl._notes, WritingDoc.orderIds(ctrl._notes, ctrl._links));
  ctrl._refreshWriteOrder();
}

export const CardInteractions = {
  // (was _makeDraggable)
  makeDraggable(ctx, card) {
    const { state, ctrl } = ctx;
    const onDown = (e) => {
      // 抓手/空格态：不在卡片上起拖拽，让位给画布平移（对齐 Excalidraw 手工具）。
      // 卡片触点本就不进 CanvasGestures 的 ptrs；若这里不拦，会「卡片拖拽 + 画布平移」同时发生
      // （卡片 pointerdown 在卡片上先于根节点的 CanvasGestures 触发）。
      if (ctrl._hand && ctrl._hand.state && (ctrl._hand.state.handTool || ctrl._hand.state.spaceDown)) return;
      // 双击 → 编辑：原生 dblclick 被 startGroupDrag 的 e.preventDefault() 抑制，这里手动判定。
      // 命中即进入编辑并 return，不再起拖拽（避免一次手势同时触发「双击编辑 + 拖拽」）。
      // 此分支在上面的「抓手早退」之后，故抓手态仍走原生 dblclick（无 preventDefault）。
      if (CardInteractions.cardDoubleTapHit(ctrl, card.dataset.id) &&
          !card.classList.contains('editing') &&
          !e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link')) {
        ctrl._enterEdit(card);
        return;
      }
      if (e.target.closest('button, .tw-card-resize, .tw-card-rotate, .tw-card-link')) return; // 删除/字级/缩放/连线锚点不触发拖拽
      // 编辑态下点在文本区不拖拽（让浏览器处理选字/光标）；点标题或纸边仍可移动便签
      if (card.classList.contains('editing') && e.target.closest('.tw-card-text')) return;
      // Shift 点击 = 切换选中（不进入拖拽）；其余点击决定选择集
      if (e.shiftKey) { ctrl._toggleSelect(card); return; }
      if (!ctrl._selected || !ctrl._selected.has(card)) ctrl._selectOnly(card);
      // 拖动集合 = 当前选中集（卡片 + 贴纸，统一选区）；startGroupDrag 内部处理整体平移与分类型落盘
      CardInteractions.startGroupDrag(ctx, e, card);
    };
    card.addEventListener('pointerdown', onDown);
  },

  /**
   * 统一选区的「整体拖动」：拖动 primaryEl 时把当前选中集（卡片 + 贴纸）一起平移。
   * 坐标在 .tw-canvas 内容空间（含 transform 平移 / 缩放），屏幕位移需除以缩放比。
   * 落盘分流：卡片 → WritingDoc.setPos + _scheduleSave；贴纸 → rec.x/rec.y + _saveStickers。
   * 供卡片（makeDraggable）与贴纸（MaterialMarket._makeStickerDraggable）共用，保证混合选区一视同仁。
   */
  startGroupDrag(ctx, e, primaryEl) {
    const ctrl = ctx.ctrl;
    // 已有进行中的卡片手势（拖拽/缩放/旋转）：先取消，避免两套 document 监听并存
    // （第二根手指落在另一张卡上会再起一套 startGroupDrag → 两张卡一起跑）。
    if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();
    const mm = ctrl._materialMarket || null;
    // 【对齐 Excalidraw】只认起始这一根手指；第二指的 move/up 不得驱动或掐断本次拖拽。
    const dragPointerId = e.pointerId;
    const captureEl = ctrl._canvas || primaryEl;
    if (captureEl && captureEl.setPointerCapture && dragPointerId != null) {
      try { captureEl.setPointerCapture(dragPointerId); } catch (_) {}
    }
    const set = (ctrl._selected && ctrl._selected.size) ? ctrl._selected : new Set([primaryEl]);
    let dragging = true, moved = false, startX = e.clientX, startY = e.clientY, dx = 0, dy = 0, raf = 0;
    let dragSet = Array.from(set).map((el) => ({
      el,
      lx: parseFloat(el.style.left) || 0,
      ly: parseFloat(el.style.top) || 0,
    }));
    // 拖拽中：选中的卡钉在屏上、剔除跳过（贴纸不在剔除系统内，其 undefined id 自然忽略）
    ctrl._draggingSet = new Set(dragSet.map((d) => d.el.dataset && d.el.dataset.id).filter(Boolean));
    primaryEl.classList.add('dragging');
    primaryEl.style.willChange = 'transform';   // 仅拖拽期间临时提升，松手即撤
    // 多选整体拖动：非主元素同样每帧改 transform，需一并提升合成层并挂 .dragging
    // （贴纸的 .dragging 会把 drop-shadow 置 none，否则内容复杂的贴纸会掉帧）。
    dragSet.forEach((d) => {
      if (d.el === primaryEl) return;
      d.el.classList.add('dragging');
      d.el.style.willChange = 'transform';
    });
    primaryEl.style.zIndex = String(++ctrl._zTop);
    const apply = () => {
      raf = 0;
      // 【性能】拖拽期只写 translate 变量：transform 走合成，不触发布局；
      // left/top 留到松手时一次性提交（见 onUp）。
      dragSet.forEach((d) => {
        d.el.style.setProperty('--tw-drag-x', dx + 'px');
        d.el.style.setProperty('--tw-drag-y', dy + 'px');
      });
      // 同一帧内同步重画连线：与卡片位移同帧完成，消除「卡片先动、连线冻住/慢一帧、松手才追」的滞后感
      if (ctrl._linkLayer && typeof ctrl._linkLayer.render === 'function') ctrl._linkLayer.render();
    };
    const onMove = (ev) => {
      if (!dragging) return;
      if (dragPointerId != null && ev.pointerId !== dragPointerId) return;   // 第二指不驱动本次拖拽
      if (!moved && (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4)) {
        moved = true;
        ctrl._lastCardTap = null;   // 真拖拽：作废刚记录的「单击」，否则拖完快速点一下会被误判成双击编辑
        if (ctrl._undoStack) ctrl._undoStack.push();   // 变更前留档：拖动位置可撤销（Cmd+Z 不再回退更早快照）
      }
      // 无限画布：坐标相对 .tw-canvas（含其 transform 平移），不 clamp。
      // 画布带缩放后「屏幕位移 ≠ 局部位移」：必须除以缩放比，否则放大后拖不动、缩小后拖过头。
      const s = CanvasViewport.getScale(ctrl);
      dx = (ev.clientX - startX) / s;
      dy = (ev.clientY - startY) / s;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    // 系统取消指针（触控板手势接管 / 失焦 / 来电）时也必须走同一收尾路径：
    // 否则 _draggingSet 永不复位 → 卡片永久钉屏（剔除不再卸载）、document 监听残留。
    const onUp = (ev) => {
      if (!dragging) return;
      if (ev && dragPointerId != null && ev.pointerId !== dragPointerId) return;   // 只认起始指抬起；第二指抬起不得掐断拖拽
      const cancelled = !!(ev && ev.type === 'pointercancel');
      dragging = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (moved && dragSet) {
        let stickerMoved = false;
        dragSet.forEach((d) => {
          // 拖拽期位移在 --tw-drag-* 上，这里一次性提交为 left/top 并清空变量
          // （顺序不可反：先写 left/top 再清变量，避免视觉闪回。
          const nx = d.lx + dx;
          const ny = d.ly + dy;
          d.el.style.left = nx + 'px';
          d.el.style.top = ny + 'px';
          d.el.style.removeProperty('--tw-drag-x');
          d.el.style.removeProperty('--tw-drag-y');
          if (d.el.classList && d.el.classList.contains('bm-sticker')) {
            const rec = mm && mm.recForEl(d.el);
            if (rec) { rec.x = nx; rec.y = ny; stickerMoved = true; }
          } else {
            const id = d.el.dataset && d.el.dataset.id;
            if (id) ctrl._notes = WritingDoc.setPos(ctrl._notes, id, nx, ny);
          }
        });
        // 卡片拖完重测几何 → 刷新 geo + 空间索引（修复剔除 / 连线端点陈旧）；贴纸不在剔除系统内，跳过
        dragSet.forEach((d) => { if (d.el.classList && !d.el.classList.contains('bm-sticker')) ctrl._measureCard(d.el); });
        ctrl._scheduleRenderLinks();   // 便签移动，连线端点跟随
        if (mm && stickerMoved) mm._saveStickers();
      }
      primaryEl.classList.remove('dragging');
      primaryEl.style.willChange = '';
      if (dragSet) dragSet.forEach((d) => {
        if (d.el === primaryEl) return;
        d.el.classList.remove('dragging');
        d.el.style.willChange = '';
      });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      if (moved) ctrl._scheduleSave();
      else if (!cancelled && primaryEl.classList.contains('tw-card')) ctrl._pinOnly(primaryEl);   // 轻点：钉住工具条（触屏无 hover 入口）；指针被取消时不钉
      ctrl._draggingSet = null;     // 拖拽结束：解除钉屏
      ctrl._scheduleCull();         // 重算挂载：被拖出视野的卡卸载
      // 兜底清空位移变量（无论是否真的移动过），避免残留 translate 造成「视觉位置 ≠ 模型 left/top」
      if (dragSet) {
        dragSet.forEach((d) => {
          if (d.el && d.el.style) {
            d.el.style.removeProperty('--tw-drag-x');
            d.el.style.removeProperty('--tw-drag-y');
          }
        });
      } else if (primaryEl && primaryEl.style) {
        primaryEl.style.removeProperty('--tw-drag-x');
        primaryEl.style.removeProperty('--tw-drag-y');
      }
      if (captureEl && captureEl.releasePointerCapture && dragPointerId != null && captureEl.hasPointerCapture && captureEl.hasPointerCapture(dragPointerId)) {
        try { captureEl.releasePointerCapture(dragPointerId); } catch (_) {}
      }
      if (ctrl._cardGestureCancel === cancel) ctrl._cardGestureCancel = null;
      dragSet = null;
    };
    // 供「第二指落下 / 捏合开始」取消：复用收尾路径（提交当前位置、不回弹），让位给捏合
    const cancel = () => { if (dragging) onUp({ type: 'pointercancel', pointerId: dragPointerId }); };
    e.preventDefault();
    ctrl._cardGestureCancel = cancel;
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
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
      // 导图有自己文档与手势：归位交互归导图，卡片侧不接手（判据查表，与 undo / 排版守卫同源）
      if (!ModePolicy.usesCardInteractions(ctrl._mode)) return;
      if (e.target.closest('.tw-card, button, .tw-card-resize, input, textarea')) return;
      ctrl._recenterNotes();
    });

    // 空格=临时抓手 / Hand 工具：统一接线（含状态对象 state，供 attach 读取）
    const hand = CanvasGestures.installSpaceHand(root, { isActive: () => ModePolicy.usesCardInteractions(ctrl._mode) });
    ctrl._hand = hand;

    // 滚轮：统一接线（⌘/Ctrl=缩放、Shift=横移、普通=平移；Alt+滚轮也走正常平移，单卡缩放快捷键已移除）
    ctrl._wheelDetach = CanvasGestures.installWheel(root, {
      isActive: () => ModePolicy.usesCardInteractions(ctrl._mode),
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
      isActive: () => ModePolicy.usesCardInteractions(ctrl._mode),
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
      onPinchWillStart: () => {
        // 二指起捏合：取消框选 + 取消进行中的卡片拖拽/缩放/旋转，让位给捏合
        if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();
        if (ctrl._cancelMarquee) ctrl._cancelMarquee();
      },
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
        // 第二根手指落在空白时若正在拖卡片/缩放/旋转：取消该手势并让位，绝不起框选、绝不吞掉选中。
        // （卡片在 CONTROL_SEL 内，其触点不进 ptrs；第二指落空白凑不成双指，会走到这里。）
        if (typeof ctrl._cardGestureCancel === 'function') { ctrl._cardGestureCancel(); return; }
        // Excalidraw 语义：拖空白 = 框选（Shift = 追加）；平移改由 空格/中键/抓手/滚轮/双指 承担
        // 阻止默认：避免拖拽触发原生「文本选择 / 自动滚动」与画布 transform 打架（表现为画面跳动）
        if (e.cancelable !== false && typeof e.preventDefault === 'function') e.preventDefault();
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
    if (ctrl._undoStack) ctrl._undoStack.push();   // 单卡删除同样可撤销（与批量删除一致）
    ctrl._removeNoteById(card.dataset.id);
    if (ctrl._updateSelBar) ctrl._updateSelBar();   // 删后刷新浮动条计数，避免残留「合并 N 张」
  },
  // (was _deleteSelected)
  deleteSelected(ctx) {
    const { state, ctrl } = ctx;
    const mm = ctrl._materialMarket || null;
    if (!ctrl._selected || !ctrl._selected.size) return false;
    if (ctrl._undoStack) ctrl._undoStack.push();   // 整批一次快照：撤销时一起回来
    // 先快照成数组再删：_removeCard / removeStickerEl 会改动 _selected 或 DOM，边遍历 Set 边删会漏
    // 统一选区：卡片走 _removeCard（含连线/子卡级联），贴纸走 MaterialMarket.removeStickerEl
    Array.from(ctrl._selected).forEach((el) => {
      if (el.classList && el.classList.contains('bm-sticker')) {
        if (mm) mm.removeStickerEl(el);
      } else {
        ctrl._removeCard(el);
      }
    });
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
  /** 边缘自动平移的「方向 + 步长」：步长随「深入边缘区的程度」渐变。
   *  刚跨入边缘区约 1px/帧，贴到边缘才到 max —— 避免 0→全速 的阶跃
   *  （阶跃会让画布看起来"跳/被甩走"，是框选时画布乱动的直接原因）。 */
  marqueeEdgeStep(clientX, clientY, vp, edge, max) {
    const d = CardInteractions.marqueeEdgeDir(clientX, clientY, vp, edge);
    if (!d) return null;
    const lx = clientX - vp.left;
    const ly = clientY - vp.top;
    const depth = (v, dir, size) => {
      if (!dir) return 0;
      const gap = dir > 0 ? v : (size - v);        // 距所选侧边缘的距离
      return Math.min(1, Math.max(0, (edge - gap) / edge));
    };
    const k = Math.max(depth(lx, d.dx, vp.width), depth(ly, d.dy, vp.height));
    return { dx: d.dx, dy: d.dy, step: Math.max(1, Math.round((Number(max) || 0) * k)) };
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
    let rafId = 0;         // 自动平移动画
    let refreshRaf = 0;    // 框选矩形刷新（rAF 合帧，与拖拽/缩放/选区条一致）

    const EDGE = 48;   // 距视口边缘多近开始自动平移
    const MAX = 14;    // 每帧最大平移像素（原 26：60fps 下约 1560px/s，且进入边缘区瞬间就全速 → 画布像被甩走）

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

    // rAF 合帧刷新：把一帧内多次 pointermove 收敛为一次 refresh（读 canvas rect + 写 4 样式 + 计数查询），
    // 与 group-drag/resize/选区条同模式，消除框选逐事件的 read-after-write 强制回流。
    const scheduleRefresh = () => { if (refreshRaf) return; refreshRaf = requestAnimationFrame(() => { refreshRaf = 0; refresh(); }); };

    // 指针是否贴「视口」边缘 → 自动平移方向 + 随深度渐变的步长（在左/上缘往对应方向平移露出那侧内容）
    const edgeStep = () => CardInteractions.marqueeEdgeStep(lastX, lastY, vpRect, EDGE, MAX);

    // 贴边时持续平移（Figma 式）：画布滚动、矩形内容坐标外扩，松手即选中画布外那片
    const tick = () => {
      rafId = 0;
      const s = edgeStep();
      if (s) {
        // 用「实际生效的偏移」getOffset（与 apply 写 transform 同源）：canvasOffset 初值为 null，
        // 若用 state.canvasOffset || {0,0} 兜底，第一帧会把画布直接搬到 (step,step) 附近 → 跳变。
        const off = CanvasViewport.getOffset(ctrl);
        ctrl._setCanvasOffset(off.x + s.dx * s.step, off.y + s.dy * s.step);
        refresh();
      }
      if (s) rafId = requestAnimationFrame(tick);
    };

    const move = (ev) => {
      lastX = ev.clientX; lastY = ev.clientY;
      scheduleRefresh();
      if (edgeStep() && !rafId) rafId = requestAnimationFrame(tick);
    };
    // 指针被系统取消 → 中止本次框选（不把半途矩形当成选中结果），并走统一收尾
    const onCancel = () => { ctrl._marqueeCancelled = true; up(); };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', onCancel);
      if (rafId) cancelAnimationFrame(rafId);
      if (refreshRaf) { cancelAnimationFrame(refreshRaf); refreshRaf = 0; }
      refresh();   // 松手前同步刷一次，保证 _marqueeRect 反映最新指针位置（_selectInRect 依赖它）
      if (ctrl._marquee) { ctrl._marquee.remove(); ctrl._marquee = null; }
      // 被双指捏合接管（_cancelMarquee）：不做任何选中变更，避免捏合时把已选清空
      if (ctrl._marqueeCancelled) { ctrl._marqueeCancelled = false; ctrl._marqueeRect = null; return; }
      ctrl._selectInRect(ctrl._marqueeRect || { x: sx0, y: sy0, w: 0, h: 0 }, additive);
      ctrl._marqueeRect = null;
      if (ctrl._revealSelection) ctrl._revealSelection();   // 兜底：选区超视口则平移露出
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', onCancel);
    refresh();
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
    // 【性能·两趟】第一趟：把离屏候选批量挂载（defer 测量）。
    // 旧实现是「挂一张 → 立刻读 offsetWidth 判相交」→ 每张离屏卡一次同步重排（N 次）。
    let deferredAny = false;
    if (noteIdx) {
      hits.forEach((id) => {
        if (ctrl._mountedCards.get(id)) return;
        const note = noteIdx.get(id);
        if (!note) return;
        const mounted = ctrl._mountCard ? ctrl._mountCard(note, { defer: true }) : null;
        if (mounted) deferredAny = true;
      });
    }
    // 集中量一次：所有新挂载卡在同一批里写入 _geo（只付一次 reflow）
    if (deferredAny && typeof ctrl._flushMountMeasure === 'function') ctrl._flushMountMeasure();

    // 第二趟：只用 _geo 判相交（零 DOM 读取）；仅当缓存缺失时才回退读 style/offset
    hits.forEach((id) => {
      const card = ctrl._mountedCards.get(id);
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
    // 贴纸：与卡片同一内容坐标系，矩形相交即纳入统一选区（便签档专属装饰，非便签档不挂载故无需判定档位）
    const mm = ctrl._materialMarket;
    if (mm && mm._canvasStickers) {
      for (const rec of mm._canvasStickers) {
        if (!rec.el) continue;
        const ix = rec.x + rec.w >= r.x && rec.x <= r.x + r.w && rec.y + rec.h >= r.y && rec.y <= r.y + r.h;
        if (ix) {
          if (!ctrl._selected) ctrl._selected = new Set();
          ctrl._selected.add(rec.el);
          rec.el.classList.add('selected');
        }
      }
    }
    if (ctrl._updateSelBar) ctrl._updateSelBar();

  },
  // (was _revealSelection)
  // 框选松手后「不」自动平移画布：选择期间画布保持原位，视野外被选中的内容由用户手动平移查看 ——
  // 彻底消除「松手瞬间整块移动」（此前的居中 / 最小平移都会让画面跳）。仅刷新选区工具条
  // （计数 / 合并入口随选中集变化），不触碰 canvasOffset。
  revealSelection(ctx) {
    const { ctrl } = ctx;
    if (ctrl._updateSelBar) ctrl._updateSelBar();
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
        if (!ModePolicy.usesCardInteractions(ctrl._mode)) return;
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
      // F：便签被拖出视野后，重新归位到视野中心（Cmd/Ctrl+F 是宿主查找快捷键，必须放行，不在此拦截）
      if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); ctrl._recenterNotes(); }
    };
    document.addEventListener('keydown', ctrl._selKeyHandler);

    // 通用画布键位（⌘±/0、Shift+1/2、H）统一收口到 CanvasKeys（C2）：与导图共用同一份逻辑，
    // 命中且便签激活时 stopImmediatePropagation，避免事件继续到导图处理器造成双响。
    // 幂等：CanvasKeys 挂 document 级捕获监听，重复绑定会叠加（且旧 handler 先执行并
    // stopImmediatePropagation，会把新 handler 挡掉），故先销毁旧的。
    if (ctrl._canvasKeysDetach) { ctrl._canvasKeysDetach(); ctrl._canvasKeysDetach = null; }
    ctrl._canvasKeysDetach = CanvasKeys.bind({
      isActive: () => ModePolicy.usesCardInteractions(ctrl._mode),
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
    if (!ModePolicy.manualCardSize(ctrl._mode)) return;
    const handle = document.createElement('div');
    handle.className = 'tw-card-resize';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', '调整便签大小');
    handle.title = '拖动调整大小 · 双击复位 · ⌘/Ctrl+滚轮微调';
    card.appendChild(handle);

    let resizing = false;
    let resizePointerId = null;
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
      if (resizePointerId != null && e.pointerId !== resizePointerId) return;   // 第二指不驱动本次缩放
      // 对角手势：向右下拖 = 放大（横向与纵向位移都计入，手感更自然）
      const delta = (e.clientX - startX) + (e.clientY - startY);
      pendingZoom = ((baseW + delta) / baseW) * startZoom;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onUp = (e) => {
      if (!resizing) return;
      if (e && resizePointerId != null && e.pointerId !== resizePointerId) return;   // 只认起始指抬起
      resizing = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ctrl._applyZoom(card, pendingZoom);   // 补写最后一帧，避免丢掉末尾增量
      card.classList.remove('is-resizing');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      const capEl = ctrl._canvas || card;
      if (capEl && capEl.releasePointerCapture && resizePointerId != null && capEl.hasPointerCapture && capEl.hasPointerCapture(resizePointerId)) {
        try { capEl.releasePointerCapture(resizePointerId); } catch (_) {}
      }
      if (ctrl._cardGestureCancel === cancel) ctrl._cardGestureCancel = null;
      ctrl._measureCard(card); // 缩放手势结束重测几何→刷新 geo+空间索引
      ctrl._scheduleSave(); // 落盘新尺寸
    };
    // 供「第二指落下 / 捏合开始」取消：复用收尾路径（在当前位置定住），让位给捏合
    const cancel = () => { if (resizing) onUp({ type: 'pointercancel', pointerId: resizePointerId }); };

    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();   // 取消其他进行中的手势
      const captureEl = ctrl._canvas || card;
      resizePointerId = e.pointerId;
      if (captureEl && captureEl.setPointerCapture && resizePointerId != null) {
        try { captureEl.setPointerCapture(resizePointerId); } catch (_) {}
      }
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startZoom = ctrl._clampZoom(card.dataset.zoom);
      pendingZoom = startZoom;
      // 基准 = 拖拽起始的「视觉宽度」(屏幕像素，已含画布缩放与卡片缩放)；pendingZoom 按视觉宽度比例变化，
      // 与画布缩放/卡片缩放解耦——此前多除了一次 startZoom，导致已缩放过的卡片再次拖拽时灵敏度翻 startZoom 倍。
      const w = card.getBoundingClientRect().width || card.offsetWidth;
      baseW = (w || 340);
      card.classList.add('is-resizing');
      card.style.zIndex = String(++ctrl._zTop);
      ctrl._cardGestureCancel = cancel;   // 供第二指/捏合取消
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);   // 系统取消指针时同样收尾，避免监听残留
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
    let rotatePointerId = null;
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
      if (rotatePointerId != null && e.pointerId !== rotatePointerId) return;   // 第二指不驱动本次旋转
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
    const onUp = (e) => {
      if (!rotating) return;
      if (e && rotatePointerId != null && e.pointerId !== rotatePointerId) return;   // 只认起始指抬起
      rotating = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ctrl._applyRot(card, pendingDeg);   // 补写最后一帧，避免丢掉末尾增量
      ctrl._measureCard(card);            // 旋转手势结束重测几何→刷新 geo+空间索引
      ctrl._scheduleRenderLinks();
      card.classList.remove('is-rotating');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      const capEl = ctrl._canvas || card;
      if (capEl && capEl.releasePointerCapture && rotatePointerId != null && capEl.hasPointerCapture && capEl.hasPointerCapture(rotatePointerId)) {
        try { capEl.releasePointerCapture(rotatePointerId); } catch (_) {}
      }
      if (ctrl._cardGestureCancel === cancel) ctrl._cardGestureCancel = null;
      ctrl._scheduleSave();   // 落盘新角度
    };
    // 供「第二指落下 / 捏合开始」取消：复用收尾路径（在当前位置定住），让位给捏合
    const cancel = () => { if (rotating) onUp({ type: 'pointercancel', pointerId: rotatePointerId }); };
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof ctrl._cardGestureCancel === 'function') ctrl._cardGestureCancel();   // 取消其他进行中的手势
      const captureEl = ctrl._canvas || card;
      rotatePointerId = e.pointerId;
      if (captureEl && captureEl.setPointerCapture && rotatePointerId != null) {
        try { captureEl.setPointerCapture(rotatePointerId); } catch (_) {}
      }
      rotating = true;
      const r = card.getBoundingClientRect();
      cx0 = r.left + r.width / 2;
      cy0 = r.top + r.height / 2;
      pendingDeg = Number(card.dataset.rot) || 0;
      lastAngle = angleOf(cx0, cy0, e.clientX, e.clientY);
      card.classList.add('is-rotating');
      card.style.zIndex = String(++ctrl._zTop);
      ctrl._cardGestureCancel = cancel;   // 供第二指/捏合取消
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);   // 系统取消指针时同样收尾，避免监听残留
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
  /**
   * 双击进入编辑的手动判定（绕开被抑制的原生 dblclick）。
   * startGroupDrag 在 pointerdown 上 e.preventDefault() —— 浏览器因此不再派发原生 dblclick，
   * 卡片上的「双击编辑」入口（bindEdit 的 dblclick 监听）在普通模式下永远不触发
   * （表现为「双击进不去编辑」，而开启抓手工具后因早退、没有 preventDefault，原生 dblclick 反而生效）。
   * 这里用「时间点 + 同卡片」手动判定；命中返回 true（调用方进入编辑并跳过拖拽）。
   * 抓手/空格态不走 makeDraggable 的 onDown（早退让位平移），那路没有 preventDefault，
   * 原生 dblclick 仍有效，故该态不依赖本判定。
   */
  cardDoubleTapHit(ctrl, id) {
    const now = Date.now();
    const last = ctrl._lastCardTap;
    if (last && last.id === id && (now - last.t) < 350) {
      ctrl._lastCardTap = null;
      return true;
    }
    ctrl._lastCardTap = { id, t: now };
    return false;
  },
  // (was _exitAllEdits)
  exitAllEdits(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._canvas) return;
    Array.from(ctrl._canvas.querySelectorAll('.tw-card.editing')).forEach((c) => ctrl._exitEdit(c));
  
  },
  /** 编辑输入的统一处理。
   *  【根因修复·字号自适应不及时】输入法组字中（isComposing）原先是「直接 return」，
   *  把 fitCardText 也一并跳过了 —— 中文打字全程都处在组字中，于是整个组字过程字号不缩、
   *  组字结束才跳一下，体感就是「不够及时」。现改为：组字中只跳过【截断 + 写模型】，
   *  字号自适应照常执行（它只读布局、不改模型，不会打断组字）。 */
  _handleEditInput(ctrl, card, e) {
    const text = card.querySelector('.tw-card-text');
    if (!text) return;
    const composing = !!(e && e.isComposing);
    if (!composing) {
      // innerText 是强制同步布局读：常规（未超限）只读一次；仅当超限才走截断+选区间恢复（罕见）
      let full = text.innerText;
      if (full.length > MAX_LEN) { ctrl._enforceEditLimit(text); full = text.innerText; }
      // 【撤销】一次编辑 = 一步撤销：在**首次真正改动前**留档，捕获「编辑前」状态。
      // 不放在 enterEdit 里 push —— 那会给「打开但一个字没改」的编辑也压一条空撤销帧。
      // 组字期间（composing）不写模型，故首个非组字 input（含组字结束那次）才留档，时机正确。
      if (!card._editUndoPushed) {
        card._editUndoPushed = true;
        if (ctrl._undoStack) ctrl._undoStack.push();
      }
      ctrl._notes = WritingDoc.setText(ctrl._notes, card.dataset.id, full);  // 连续编辑改走 WritingDoc 原语
    }
    ctrl._scheduleSave();
    fitCardText(card);   // 定框纸样：边打边把字号调进框里（组字期间也生效）
  },
  /** 粘贴：只粘纯文本；粘贴后立即做一次字号自适应（个别环境下 execCommand 不派发 input）。 */
  _handleEditPaste(ctrl, card, e) {
    e.preventDefault();
    const text = card.querySelector('.tw-card-text');
    const t = (e.clipboardData || window.clipboardData).getData('text/plain');
    const room = MAX_LEN - ((text && text.innerText ? text.innerText.length : 0) || 0);
    if (room <= 0) {
      if (typeof Toast !== 'undefined') Toast.showToast('便签最多 ' + MAX_LEN + ' 字', 'info');
      return;
    }
    const allowed = t.length > room ? t.slice(0, room) : t;
    document.execCommand('insertText', false, allowed); // 只粘纯文本，不把网页样式带进便签
    fitCardText(card);   // 兜底：粘贴后立即自适应一次
  },
  // (was _enterEdit)
  enterEdit(ctx, card) {
    const { state, ctrl } = ctx;
    if (card.classList.contains('editing')) return;
    ctrl._exitAllEdits();
    const text = card.querySelector('.tw-card-text');
    if (!text) return;
    card.classList.add('editing');
    ctrl._editingId = card.dataset.id;   // 编辑中：钉在屏上，剔除跳过
    card._editUndoPushed = false;   // 本次编辑会话是否已为撤销留档（首次真正改动时才 push）
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
    const onInput = (e) => this._handleEditInput(ctrl, card, e);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        ctrl._exitEdit(card); // Enter 不拦截：contenteditable 内回车即多行便签
      }
    };
    const onPaste = (e) => this._handleEditPaste(ctrl, card, e);
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
      card._editUndoPushed = false;   // 编辑会话结束：下次进入编辑重新留档
      ctrl._scheduleSave(); // 落盘：_collectNotes 读的是 .tw-card-text 内容
      if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
    }
    ctrl._invalidateGeo(card.dataset.id);   // 编辑可能改变了卡片高度 → 几何失效
    fitCardText(card);                      // 退出编辑再自适应一次：兜住最后一次输入/组字收尾的布局变化

  },
  // (was _pinOnly)
  pinOnly(ctx, card) {
    const { ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    // 取消其它卡片的钉住（不再把任何便签临时置顶；工具条可见性由 CSS `.is-pinned` 驱动）
    Array.from(canvas.querySelectorAll('.tw-card')).forEach((c) => {
      if (c === card) return;
      c.classList.remove('is-pinned');
    });
    if (!card) return;
    card.classList.add('is-pinned');
  },
  // (was _addLink)
  addLink(ctx, fromId, toId) {
    const { state, ctrl } = ctx;
    if (!fromId || !toId || fromId === toId) return false;
    const dup = ctrl._links.some((l) =>
      (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId));
    if (dup) return false;
    ctrl._links.push({ from: fromId, to: toId, route: 'bezier', bend: 0, dash: 'solid' });
    reseqByLinks(ctrl);   // 顺序真变了（连线定序）→ 重算 seq 并刷徽标
    return true;
  
  },
  // (was _removeLink)
  removeLink(ctx, fromId, toId) {
    const { state, ctrl } = ctx;
    ctrl._links = ctrl._links.filter((l) =>
      !((l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId)));
    // 【连线定序】删连线同样要重算 seq，与 addLink 同一处理（单一实现）
    reseqByLinks(ctrl);
  
  },
  // (was _removeLinksOfData)
  removeLinksOfData(ctx, cardId) {
    const { state, ctrl } = ctx;
    if (!cardId) return;
    ctrl._links = ctrl._links.filter((l) => l.from !== cardId && l.to !== cardId);
    // 【连线定序】级联删线同样重算 seq，与 addLink / removeLink 保持一致（单一实现）
    reseqByLinks(ctrl);
  
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
    if (!ModePolicy.usesCardInteractions(ctrl._mode)) { ctrl._showScreenMsg('先拨回便签画布再排版', 1200); return; }
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