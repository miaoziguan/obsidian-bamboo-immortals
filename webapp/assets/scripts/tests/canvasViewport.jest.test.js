/**
 * @jest-environment jsdom
 */
// CanvasViewport 单元测试：画布视口（平移 + 缩放）的坐标换算与焦点缩放。
//
// 契约（改动这些用例前请先确认是有意变更）：
//  · 变换为 translate(tx,ty) scale(s) + transform-origin:0 0
//  · screenToCanvas = (clientX - rect.left) / s   —— rect 已含变换
//  · zoomAt 必须让「光标/双指中点下方的画布内容」保持不动（否则手感是坏的）
//  · 平移量 tx 作用在 scale 之前，故 panBy 用屏幕像素、无需除以 s
const { loadModule } = require('./__helpers__/testUtils');

const LAYOUT_W = 800, LAYOUT_H = 600;

/** 搭一个带画布的 ctrl；rect 按当前 offset/scale 模拟 transform 后的结果（布局原点 0,0）。 */
function setup(initial) {
  const canvas = document.createElement('div');
  document.body.appendChild(canvas);
  const ctrl = {
    _canvas: canvas,
    _canvasOffset: initial || { x: 0, y: 0, scale: 1 },
    _scheduleCull: () => {},
    _scheduleSave: () => {},
  };
  canvas.getBoundingClientRect = () => {
    const o = ctrl._canvasOffset || {};
    const s = o.scale || 1;
    return { left: o.x || 0, top: o.y || 0, width: LAYOUT_W * s, height: LAYOUT_H * s };
  };
  const { CanvasViewport } = loadModule('services/CanvasViewport.js', ['CanvasViewport']);
  return { ctrl, canvas, CanvasViewport, ctx: { state: {}, ctrl } };
}

test('clamp：上下限生效，非法值一律回退 1', () => {
  const { CanvasViewport } = setup();
  expect(CanvasViewport.clamp(1.5)).toBeCloseTo(1.5, 6);
  expect(CanvasViewport.clamp(0.01)).toBe(CanvasViewport.MIN);
  expect(CanvasViewport.clamp(999)).toBe(CanvasViewport.MAX);
  expect(CanvasViewport.clamp(0)).toBe(1);
  expect(CanvasViewport.clamp(-2)).toBe(1);
  expect(CanvasViewport.clamp(NaN)).toBe(1);
  expect(CanvasViewport.clamp(Infinity)).toBe(1);
});

test('screenToCanvas / canvasToScreen 往返一致（1x / 0.5x / 2x）', () => {
  [1, 0.5, 2].forEach((s) => {
    const { CanvasViewport, ctx } = setup({ x: 120, y: -40, scale: s });
    const p = CanvasViewport.screenToCanvas(ctx, 400, 300);
    const back = CanvasViewport.canvasToScreen(ctx, p.x, p.y);
    expect(back.x).toBeCloseTo(400, 6);
    expect(back.y).toBeCloseTo(300, 6);
  });
});

test('screenToCanvas 按缩放比换算：屏幕走 200px 在 2x 下等于 100 画布 px', () => {
  const { CanvasViewport, ctx } = setup({ x: 0, y: 0, scale: 2 });
  const a = CanvasViewport.screenToCanvas(ctx, 0, 0);
  const b = CanvasViewport.screenToCanvas(ctx, 200, 200);
  expect(b.x - a.x).toBeCloseTo(100, 6);
  expect(b.y - a.y).toBeCloseTo(100, 6);
});

test('zoomAt：光标下方的画布内容保持不动（焦点缩放，非中心缩放）', () => {
  const { CanvasViewport, ctx, ctrl } = setup({ x: 30, y: 20, scale: 1 });
  const ax = 500, ay = 400;
  const before = CanvasViewport.screenToCanvas(ctx, ax, ay);
  CanvasViewport.zoomAt(ctx, ax, ay, 2);
  expect(CanvasViewport.getScale(ctrl)).toBeCloseTo(2, 6);
  const after = CanvasViewport.screenToCanvas(ctx, ax, ay);
  expect(after.x).toBeCloseTo(before.x, 6);
  expect(after.y).toBeCloseTo(before.y, 6);
});

test('zoomAt 连续缩放后锚点依旧不动（累积不漂移）', () => {
  const { CanvasViewport, ctx } = setup({ x: 10, y: 10, scale: 1 });
  const ax = 300, ay = 250;
  const before = CanvasViewport.screenToCanvas(ctx, ax, ay);
  CanvasViewport.zoomAt(ctx, ax, ay, 1.3);
  CanvasViewport.zoomAt(ctx, ax, ay, 1.3);
  CanvasViewport.zoomAt(ctx, ax, ay, 0.7);
  const after = CanvasViewport.screenToCanvas(ctx, ax, ay);
  expect(after.x).toBeCloseTo(before.x, 6);
  expect(after.y).toBeCloseTo(before.y, 6);
});

test('zoomAt 受上下限钳制', () => {
  const { CanvasViewport, ctx, ctrl } = setup({ x: 0, y: 0, scale: 1 });
  CanvasViewport.zoomAt(ctx, 100, 100, 100);      // 远超上限
  expect(CanvasViewport.getScale(ctrl)).toBe(CanvasViewport.MAX);
  CanvasViewport.zoomAt(ctx, 100, 100, 0.001);    // 远低于下限
  expect(CanvasViewport.getScale(ctrl)).toBe(CanvasViewport.MIN);
});

test('panBy 保留缩放比；平移量按屏幕像素累加', () => {
  const { CanvasViewport, ctx, ctrl } = setup({ x: 10, y: 10, scale: 1.5 });
  CanvasViewport.panBy(ctx, 50, -20);
  expect(CanvasViewport.getScale(ctrl)).toBeCloseTo(1.5, 6);
  expect(CanvasViewport.getOffset(ctrl)).toEqual({ x: 60, y: -10 });
});

test('apply 写出的 transform 含 scale 与 translate', () => {
  const { CanvasViewport, ctx, canvas } = setup({ x: 5, y: 6, scale: 2 });
  CanvasViewport.apply(ctx);
  expect(canvas.style.transform).toBe('translate(5px, 6px) scale(2)');
});

test('通用 toCanvas / zoomedView：思维子弹复用同一套数学（view 为普通对象）', () => {
  const { CanvasViewport } = setup();
  const canvas = document.createElement('div');
  document.body.appendChild(canvas);
  // 导图侧 view 是普通对象 {x,y,scale}，不经过 ctrl
  let view = { x: 40, y: -10, scale: 1.5 };
  canvas.getBoundingClientRect = () => ({
    left: view.x, top: view.y, width: 800 * view.scale, height: 600 * view.scale,
  });

  const p = CanvasViewport.toCanvas(canvas, view, 400, 300);
  expect(p.x).toBeCloseTo((400 - 40) / 1.5, 6);
  expect(p.y).toBeCloseTo((300 - (-10)) / 1.5, 6);

  // 焦点缩放：锚点下方内容不动
  const before = CanvasViewport.toCanvas(canvas, view, 400, 300);
  view = CanvasViewport.zoomedView(canvas, view, 400, 300, 2);
  expect(CanvasViewport.scaleOf(view)).toBeCloseTo(3, 6);
  const after = CanvasViewport.toCanvas(canvas, view, 400, 300);
  expect(after.x).toBeCloseTo(before.x, 6);
  expect(after.y).toBeCloseTo(before.y, 6);
});

test('fitView：大内容缩小以适配视口，小内容不放大超过 100%', () => {
  const { CanvasViewport } = setup();
  const canvas = document.createElement('div');
  document.body.appendChild(canvas);
  Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
  Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

  // 大内容 → 必须缩小到能装进视口
  const v = CanvasViewport.fitView(canvas, { minX: 0, minY: 0, maxX: 2000, maxY: 1500 });
  expect(v.scale).toBeLessThan(1);
  expect(v.scale).toBeGreaterThanOrEqual(CanvasViewport.MIN);
  expect(2000 * v.scale).toBeLessThanOrEqual(800);
  expect(1500 * v.scale).toBeLessThanOrEqual(600);

  // 小内容 → 不放大（否则一两颗子弹会被放到很怪的大尺寸）
  const v2 = CanvasViewport.fitView(canvas, { minX: 0, minY: 0, maxX: 100, maxY: 80 });
  expect(v2.scale).toBe(1);
});

test('CanvasZoomUI：+/−/重置/适应 经 adapter 生效，百分比同步', () => {
  const { CanvasViewport } = setup();
  const { CanvasZoomUI } = loadModule('services/CanvasZoomUI.js', ['CanvasZoomUI']);
  const host = document.createElement('div');
  document.body.appendChild(host);
  let view = { x: 0, y: 0, scale: 1 };
  const calls = [];
  const ui = CanvasZoomUI.mount(host, {
    getCanvas: () => null,
    getView: () => view,
    setView: (v) => { view = v; },
    zoomAtCenter: (f) => { calls.push(f); view = Object.assign({}, view, { scale: CanvasViewport.clamp(view.scale * f) }); },
    reset: () => { calls.push('reset'); view = Object.assign({}, view, { scale: 1 }); },
    fit: () => { calls.push('fit'); },
  });
  expect(ui).toBeTruthy();
  const bar = host.querySelector('.tw-zoom-bar');
  expect(bar.querySelector('.tw-zoom-val').textContent).toBe('100%');

  bar.querySelector('[data-act="in"]').click();
  expect(calls[0]).toBe(CanvasZoomUI.STEP);
  ui.sync();
  expect(bar.querySelector('.tw-zoom-val').textContent).toBe('125%');

  bar.querySelector('[data-act="reset"]').click();
  expect(view.scale).toBe(1);
  bar.querySelector('[data-act="fit"]').click();
  expect(calls).toContain('fit');
});

test('CanvasZoomUI：宿主后代里已有缩放条时仍要创建自己的（便签 wrap 内含导图层）', () => {
  const { CanvasViewport } = setup();
  const { CanvasZoomUI } = loadModule('services/CanvasZoomUI.js', ['CanvasZoomUI']);
  const wrap = document.createElement('div');
  const layer = document.createElement('div');       // 模拟挂在 wrap 里的 .tw-mm 导图层
  wrap.appendChild(layer);
  document.body.appendChild(wrap);

  const mkAdapter = () => ({
    getCanvas: () => null,
    getView: () => ({ x: 0, y: 0, scale: 1 }),
    setView: () => {}, zoomAtCenter: () => {}, reset: () => {}, fit: () => {},
  });

  // 导图先挂载：缩放条落在 layer 内，即 wrap 的后代
  expect(CanvasZoomUI.mount(layer, mkAdapter())).toBeTruthy();
  expect(layer.querySelector('.tw-zoom-bar')).toBeTruthy();

  // 便签后挂载到 wrap：不能因为「后代里能搜到缩放条」就跳过
  // （历史 bug：守卫用 querySelector 搜后代 → 便签侧永远不创建 → 只有导图模式看得到控件）
  const ui = CanvasZoomUI.mount(wrap, mkAdapter());
  expect(ui).toBeTruthy();
  const own = Array.prototype.filter.call(wrap.children, (c) => c.classList.contains('tw-zoom-bar'));
  expect(own.length).toBe(1);
});

test('viewToStore/viewFromStore：scale 往返保留（思维子弹 P0-2 回归）', () => {
  const { CanvasViewport } = setup();
  const v = { x: 12, y: -3, scale: 2.5 };
  const s = CanvasViewport.viewToStore(v);
  expect(s).toEqual({ x: 12, y: -3, scale: 2.5 });
  // 再经存储层读回，scale 不丢
  expect(CanvasViewport.viewFromStore(s)).toEqual({ x: 12, y: -3, scale: 2.5 });
  // 空视野（无位移且 100%）回退为 null，避免写入无意义的占位
  expect(CanvasViewport.viewToStore({ x: 0, y: 0, scale: 1 })).toBe(null);
  // 读档侧非法 scale 回退到 1
  expect(CanvasViewport.viewFromStore({ x: 1, y: 2, scale: 'x' })).toEqual({ x: 1, y: 2, scale: 1 });
});

test('读取缺失/损坏的 offset 时安全回退（缩放=1、平移=0）', () => {
  const { CanvasViewport, ctrl } = setup(null);
  ctrl._canvasOffset = null;
  expect(CanvasViewport.getScale(ctrl)).toBe(1);
  expect(CanvasViewport.getOffset(ctrl)).toEqual({ x: 0, y: 0 });
  ctrl._canvasOffset = { x: 'x', y: NaN, scale: 'bad' };
  expect(CanvasViewport.getScale(ctrl)).toBe(1);
  expect(CanvasViewport.getOffset(ctrl)).toEqual({ x: 0, y: 0 });
});
