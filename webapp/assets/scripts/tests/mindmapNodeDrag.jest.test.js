/**
 * @jest-environment jsdom
 */
// 思维子弹「节点拖拽 vs 双指捏合」互斥（对齐 Excalidraw）：
// 1) 节点拖拽只认起始 pointerId，第二指（捏合）事件不驱动节点；
// 2) 第二指落下（onPinchWillStart）取消进行中的节点拖拽，让位给捏合；
// 3) 取消后节点停在当前拖到的位置（不回弹），且拖放连线副作用不触发。
const { loadModule } = require('./__helpers__/testUtils');

// 让 rAF 同步执行，便于断言 flush 后的节点落点
global.requestAnimationFrame = (cb) => { cb(0); return 1; };
global.cancelAnimationFrame = () => {};
if (!global.CanvasViewport) global.CanvasViewport = { scaleOf: (v) => (v && v.scale != null ? v.scale : 1) };

const { MindmapFeature } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);

function mkNodeEl() {
  const el = document.createElement('div');
  el.dataset.id = 'a';
  el.style.left = '100px';
  el.style.top = '50px';
  el.classList.add('tw-mm-node');
  return el;
}

function mkDragThis(nodeEl) {
  const els = new Map();
  els.set('a', nodeEl);
  return {
    _selSet: null,
    _select: () => {},
    _view: { x: 0, y: 0, scale: 1 },
    _els: els,
    _canvas: document.createElement('div'),
    _toolbar: { hidden: false },
    _linkLayer: { render: jest.fn() },
    _nodes: [],
    _dragSet: null,
    _nodeDragCancel: null,
    _mutate: (fn) => fn(),
    _scheduleSave: () => {},
    _updateToolbar: () => {},
    _msg: () => {},
    _elementFromPoint: () => null,
    renderNodes: () => {},
    _nodeById: () => null,
  };
}

function firePointer(type, pid, x, y) {
  const ev = new Event(type);
  ev.clientX = x; ev.clientY = y; ev.pointerId = pid;
  document.dispatchEvent(ev);
}

describe('思维子弹：节点拖拽 vs 捏合（对齐 Excalidraw，互斥）', () => {
  test('拖拽只认起始 pointerId；第二指事件不驱动节点', () => {
    const nodeEl = mkNodeEl();
    const t = mkDragThis(nodeEl);
    const e = { pointerId: 1, clientX: 100, clientY: 50, preventDefault: () => {} };
    MindmapFeature._beginMoveDrag.call(t, e, nodeEl);

    // 第二指（pid=2）大幅移动：节点不应移动
    firePointer('pointermove', 2, 1000, 1000);
    expect(nodeEl.style.left).toBe('100px');
    expect(nodeEl.style.top).toBe('50px');

    // 起始指（pid=1）移动：节点应跟随（除以 zoom=1：dx=100, dy=100）
    firePointer('pointermove', 1, 200, 150);
    expect(nodeEl.style.left).toBe('200px');
    expect(nodeEl.style.top).toBe('150px');

    firePointer('pointerup', 1, 200, 150);   // 收尾，清掉 document 监听，避免污染后续用例
  });

  test('onPinchWillStart 取消进行中的节点拖拽（让位给捏合）', () => {
    const nodeEl = mkNodeEl();
    const t = mkDragThis(nodeEl);
    const e = { pointerId: 1, clientX: 100, clientY: 50, preventDefault: () => {} };
    MindmapFeature._beginMoveDrag.call(t, e, nodeEl);
    expect(typeof t._nodeDragCancel).toBe('function');   // 可取消

    // 制造捏合配置：mock 手势层，捕获 attach 的 config，并补齐 _bindLayer 需要的桩
    let cfg = null;
    global.CanvasGestures = {
      attach: (_layer, c) => { cfg = c; return () => {}; },
      installSpaceHand: () => ({ destroy() {}, state: {} }),
      installWheel: () => () => {},
    };
    global.CanvasKeys = { bind: () => () => {} };
    t._el = document.createElement('div');
    t._active = true;
    t._cancelMarquee = jest.fn();
    t._bindFlushGuard = () => {};
    t._zoomByCenter = jest.fn(); t._zoomReset = jest.fn();
    t._fitToView = jest.fn(); t._fitSelectionToView = jest.fn();
    t._hand = { toggleHand: () => {} };
    MindmapFeature._bindLayer.call(t);
    expect(cfg).toBeDefined();

    cfg.onPinchWillStart({});
    expect(t._cancelMarquee).toHaveBeenCalled();
    expect(t._nodeDragCancel).toBeNull();   // 节点拖拽被取消（cancel 会自清空），让位给捏合
  });

  test('取消节点拖拽：节点停在当前位置（不回弹），且不触发拖放连线', () => {
    const nodeEl = mkNodeEl();
    const t = mkDragThis(nodeEl);
    let mutated = null;
    t._mutate = (fn) => { mutated = fn; };   // 捕获是否执行了 mutate（拖放连线/落位副作用）
    const e = { pointerId: 1, clientX: 100, clientY: 50, preventDefault: () => {} };
    MindmapFeature._beginMoveDrag.call(t, e, nodeEl);

    firePointer('pointermove', 1, 300, 250);   // 先把节点拖到 (300,250)
    expect(nodeEl.style.left).toBe('300px');

    t._nodeDragCancel();   // 第二指落下 → 取消拖拽（让位捏合）
    expect(t._nodeDragCancel).toBeNull();              // 已清理
    expect(nodeEl.style.left).toBe('300px');            // 停在拖到的位置，不回弹
    expect(mutated).toBeNull();                        // 未执行 mutate：拖放连线/落位副作用不触发
  });
});
