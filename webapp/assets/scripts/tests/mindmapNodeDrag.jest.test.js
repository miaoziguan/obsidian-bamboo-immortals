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
// loadModule 会剥离 import，MindmapDoc 按全局解析：给一份纯逻辑桩（落位 + 连线）
global.MindmapDoc = {
  setPos: (nodes, id, x, y) => nodes.map((n) => (n.id === id ? Object.assign({}, n, { x, y }) : n)),
  addLink: () => null,
};

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
    _isNoteOpen: () => false,   // 拖拽时查询「该节点备注卡是否展开」，测试无备注
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

  test('取消节点拖拽：停在当前位置，且位置写回模型（不回弹、不触发拖放连线）', () => {
    const setPos = jest.fn((nodes, id, x, y) => nodes.map((n) => (n.id === id ? Object.assign({}, n, { x, y }) : n)));
    const addLink = jest.fn();
    global.MindmapDoc = { setPos, addLink };
    const nodeEl = mkNodeEl();
    const t = mkDragThis(nodeEl);
    t._nodes = [{ id: 'a', x: 100, y: 50 }];
    const e = { pointerId: 1, clientX: 100, clientY: 50, preventDefault: () => {} };
    MindmapFeature._beginMoveDrag.call(t, e, nodeEl);

    firePointer('pointermove', 1, 300, 250);   // 先把节点拖到 (300,250)
    expect(nodeEl.style.left).toBe('300px');

    t._nodeDragCancel();   // 第二指落下 → 取消拖拽（让位捏合）
    expect(t._nodeDragCancel).toBeNull();                    // 已清理
    expect(nodeEl.style.left).toBe('300px');                 // 停在拖到的位置，不回弹
    expect(setPos).toHaveBeenCalled();
    // 【位置即数据】被打断的拖拽也必须把 DOM 终态落进模型，否则后续 _placeNode 会按旧坐标弹回
    expect(t._nodes[0]).toMatchObject({ x: 300, y: 250 });
    expect(addLink).not.toHaveBeenCalled();                  // 拖放连线副作用不触发
  });

  test('真正拖动过之后作废双击基准（_lastDown 清空，避免松手连点被判成双击）', () => {
    const nodeEl = mkNodeEl();
    const t = mkDragThis(nodeEl);
    t._nodes = [{ id: 'a', x: 100, y: 50 }];
    t._lastDown = { t: 0, x: 100, y: 50 };
    const e = { pointerId: 1, clientX: 100, clientY: 50, preventDefault: () => {} };
    MindmapFeature._beginMoveDrag.call(t, e, nodeEl);

    firePointer('pointermove', 1, 200, 150);
    expect(t._lastDown).toBeNull();
    firePointer('pointerup', 1, 200, 150);
  });
});

describe('移动端防误触：触屏不做「双击空白 = 全图归位」', () => {
  function mkTapThis() {
    return { _centerView: jest.fn(), _createBulletAt: jest.fn() };
  }
  function tapEvent(pointerType) {
    return { pointerType, shiftKey: false, target: document.createElement('div') };
  }

  test('触屏双击空白：不归位（否则表现为子弹被重新排版）', () => {
    const t = mkTapThis();
    MindmapFeature._handleDoubleTap.call(t, tapEvent('touch'));
    expect(t._centerView).not.toHaveBeenCalled();
  });

  test('鼠标双击空白：仍归位（桌面语义不变）', () => {
    const t = mkTapThis();
    MindmapFeature._handleDoubleTap.call(t, tapEvent('mouse'));
    expect(t._centerView).toHaveBeenCalled();
  });
});
