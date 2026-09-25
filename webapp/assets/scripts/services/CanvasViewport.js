/**
 * CanvasViewport — 便签/写作画布视口（平移 + 缩放）的唯一真源。
 *
 * 背景：画布 .tw-canvas 此前只做平移（CardInteractions.applyCanvasTransform 仅写 translate），
 * 现按 Excalidraw 规范加入缩放。为保证「几何唯一真源」不被破坏，缩放被严格定义为
 * **视图变换**：模型坐标 notes[].x/y 与几何缓存 geo/spatial 一律保持未缩放原值，
 * 只有 .tw-canvas 这一个容器的 transform 变化；卡片、连线层、连线控件、框选矩形
 * 都是它的子元素，天然一起变换，无需分别处理。
 *
 * 变换约定（必须与 CSS 配合）：
 *   .tw-canvas { transform-origin: 0 0; transform: translate(tx, ty) scale(s); }
 *   → 画布坐标 p 映射到屏幕：screen = layoutOrigin + t + s * p
 *   → rect(canvas) 已含变换：rect.left = layoutOriginX + tx，rect.width = layoutWidth * s
 *   → 由此得逆变换：p = (clientX - rect.left) / s            ← screenToCanvas
 *   → 以屏幕点 (ax, ay) 为焦点缩放时：tx' = ax - layoutX - cx * s'（见 zoomAt）
 *
 * 所有涉及「屏幕坐标 ↔ 画布坐标」的换算必须走本模块，禁止各处自行除/乘缩放比
 * （历史上拖拽、框选、连线各自算一套，是坐标漂移的主要来源）。
 */
export const CanvasViewport = {
  /** 缩放上下限：低于 ~0.3 文字不可读，高于 3x 只剩单卡，对写作画布是无效区间。
   *  （Excalidraw 为绘图场景开放到几十倍，这里是有意收紧的偏离。） */
  MIN: 0.25,
  MAX: 3,

  /** 滚轮缩放灵敏度：exp(-clamp(deltaY) * K)，K 越小越慢。 */
  WHEEL_K: 0.002,
  /** 单帧 deltaY 截断（鼠标滚轮一格常为 100，触控板更碎），避免一格跨好几个档。 */
  WHEEL_CLAMP: 100,

  /** 钳制缩放比；非法值（0/负/NaN/Infinity）一律回退 1。 */
  clamp(s) {
    const n = Number(s);
    if (!isFinite(n) || n <= 0) return 1;
    return Math.min(this.MAX, Math.max(this.MIN, n));
  },

  /** 当前缩放比（缺省 1）。 */
  getScale(ctrl) {
    const o = ctrl && ctrl._canvasOffset;
    return this.clamp(o && typeof o.scale === 'number' ? o.scale : 1);
  },

  /** 当前平移量（屏幕像素，作用于 scale 之前）。 */
  getOffset(ctrl) {
    const o = ctrl && ctrl._canvasOffset;
    return { x: (o && Number(o.x)) || 0, y: (o && Number(o.y)) || 0 };
  },

  /** 写入视口（唯一入口）：落库 → 应用 transform → 触发重算挂载。 */
  set(ctx, x, y, scale) {
    const { ctrl } = ctx;
    if (!ctrl) return;
    const s = this.clamp(scale == null ? this.getScale(ctrl) : scale);
    ctrl._canvasOffset = { x, y, scale: s };
    this.apply(ctx);
    if (ctrl._scheduleSave) ctrl._scheduleSave();
  },

  /** 把 transform 写到画布（含 scale），并重算视口剔除。 */
  apply(ctx) {
    const { ctrl } = ctx;
    if (!ctrl || !ctrl._canvas) return;
    const off = this.getOffset(ctrl);
    const s = this.getScale(ctrl);
    ctrl._canvas.style.transform = `translate(${off.x}px, ${off.y}px) scale(${s})`;
    if (ctrl._scheduleCull) ctrl._scheduleCull();
    // 缩放变化后刷新「不随缩放变大」的控件（外围圆钮等），保持其屏幕尺寸恒定
    if (typeof ctrl._refreshKnobs === 'function') {
      try { ctrl._refreshKnobs(); } catch (_) { /* 不阻塞缩放 */ }
    }
    if (typeof ctrl._syncZoomUI === 'function') {
      try { ctrl._syncZoomUI(); } catch (_) { /* 不阻塞缩放 */ }
    }
  },

  /** 屏幕坐标 → 画布坐标（内容坐标，未缩放空间）。 */
  screenToCanvas(ctx, clientX, clientY) {
    const { ctrl } = ctx;
    return this.toCanvas(ctrl && ctrl._canvas, ctrl && ctrl._canvasOffset, clientX, clientY);
  },

  /** 画布坐标 → 屏幕坐标。 */
  canvasToScreen(ctx, x, y) {
    const { ctrl } = ctx;
    return this.toScreen(ctrl && ctrl._canvas, ctrl && ctrl._canvasOffset, x, y);
  },

  /** 以屏幕点 (clientX, clientY) 为焦点缩放：该点下方的画布内容保持不动。
   *  （Excalidraw / Figma 的滚轮缩放手感；不用中心缩放，否则「放大的东西跑没了」。） */
  zoomAt(ctx, clientX, clientY, factor) {
    const { ctrl } = ctx;
    const canvas = ctrl && ctrl._canvas;
    if (!canvas) return;
    const nv = this.zoomedView(canvas, ctrl._canvasOffset, clientX, clientY, factor);
    if (nv === ctrl._canvasOffset) return;   // 已达上下限
    this.set(ctx, nv.x, nv.y, nv.scale);
  },

  /** 平移（屏幕像素增量；tx 作用在 scale 之前，故无需除以缩放比）。 */
  panBy(ctx, dx, dy) {
    const { ctrl } = ctx;
    const off = this.getOffset(ctrl);
    this.set(ctx, off.x + dx, off.y + dy, this.getScale(ctrl));
  },

  // ── 通用纯函数（便签画布与思维子弹共用同一套数学，避免各写一份）──
  // 入参 view = {x, y, scale}；这些函数只读不写，由调用方自行落库。

  /** 由 view 取缩放比（缺省/非法 → 1）。 */
  scaleOf(view) {
    return this.clamp(view && typeof view.scale === 'number' ? view.scale : 1);
  },

  /** 屏幕 → 画布坐标（rect 已含 transform）。 */
  toCanvas(canvas, view, clientX, clientY) {
    if (!canvas) return { x: clientX, y: clientY };
    const r = canvas.getBoundingClientRect();
    const s = this.scaleOf(view);
    return { x: (clientX - r.left) / s, y: (clientY - r.top) / s };
  },

  /** 画布 → 屏幕坐标。 */
  toScreen(canvas, view, x, y) {
    if (!canvas) return { x, y };
    const r = canvas.getBoundingClientRect();
    const s = this.scaleOf(view);
    return { x: r.left + x * s, y: r.top + y * s };
  },

  /** 以屏幕点为焦点缩放，返回新 view（原 view 不变）。 */
  zoomedView(canvas, view, clientX, clientY, factor) {
    if (!canvas) return view;
    const s = this.scaleOf(view);
    const s2 = this.clamp(s * factor);
    if (Math.abs(s2 - s) < 1e-6) return view;
    const r = canvas.getBoundingClientRect();
    const vx = (view && Number(view.x)) || 0;
    const vy = (view && Number(view.y)) || 0;
    // rect.left = layoutOriginX + vx ⇒ layoutOriginX = rect.left - vx
    const layoutX = r.left - vx;
    const layoutY = r.top - vy;
    const cx = (clientX - r.left) / s;
    const cy = (clientY - r.top) / s;
    return { x: clientX - layoutX - cx * s2, y: clientY - layoutY - cy * s2, scale: s2 };
  },

  // ── 视口序列化（唯一入口）──
  // 历史上三条存储链路各自手写 view ↔ 存储 的转换，结果思维子弹那条漏了 scale，
  // 导致「导图缩放重启即丢」。统一走这两个函数后，任何一条链路都不可能再漏字段。

  /** view → 存储形态；全空（无位移且 100%）返回 null（与原「无存档视野」语义一致）。 */
  viewToStore(view, opts) {
    if (!view || typeof view !== 'object') return null;
    const keepEmpty = !!(opts && opts.keepEmpty);
    const x = Number(view.x) || 0;
    const y = Number(view.y) || 0;
    const s = this.scaleOf(view);
    if (!keepEmpty && !x && !y && s === 1) return null;
    return { x, y, scale: s };
  },

  /** 存储形态 → view；缺失/非法一律回退（scale 缺省 1）。 */
  viewFromStore(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.x !== 'number' && typeof raw.y !== 'number') return null;
    return { x: Number(raw.x) || 0, y: Number(raw.y) || 0, scale: this.clamp(raw.scale == null ? 1 : raw.scale) };
  },

  /** 由内容包围盒算出「适应内容」的 view（纯计算，不写回）。
   *  默认不放大超过 1（小品内容被放到 3x 会很难看），可用 opts.maxScale 放开。 */
  fitView(canvas, bb, opts) {
    const o = opts || {};
    const LW = (canvas && canvas.clientWidth) || o.fallbackW || 1;
    const LH = (canvas && canvas.clientHeight) || o.fallbackH || 1;
    const pad = o.pad == null ? 48 : o.pad;
    const bw = Math.max(1, (bb ? bb.maxX - bb.minX : 0) || 1);
    const bh = Math.max(1, (bb ? bb.maxY - bb.minY : 0) || 1);
    const maxS = o.maxScale == null ? 1 : o.maxScale;
    let s = Math.min((Math.max(1, LW - pad * 2)) / bw, (Math.max(1, LH - pad * 2)) / bh);
    if (!isFinite(s) || s <= 0) s = 1;
    s = this.clamp(Math.min(s, maxS));
    const cx = bb ? (bb.minX + bb.maxX) / 2 : 0;
    const cy = bb ? (bb.minY + bb.maxY) / 2 : 0;
    // 平移量在 scale 之前生效：让包围盒中心落在视口中心 → tx = LW/2 - s * 中心
    return { x: Math.round(LW / 2 - s * cx), y: Math.round(LH / 2 - s * cy), scale: s };
  },

  /** 滚轮增量 → 缩放因子（指数，保证上下滚手感对称；对触控板碎增量同样平滑）。 */
  wheelFactor(deltaY) {
    const d = Math.max(-this.WHEEL_CLAMP, Math.min(this.WHEEL_CLAMP, Number(deltaY) || 0));
    return Math.exp(-d * this.WHEEL_K);
  },
};

// 测试 harness（loadModule 剥离 import）兼容：挂到 globalThis，
// 供剥离 import 后的模块经全局解析（与 NotesState / twConfig 同处理）。
if (typeof globalThis !== 'undefined') {
  globalThis.CanvasViewport = CanvasViewport;
}
