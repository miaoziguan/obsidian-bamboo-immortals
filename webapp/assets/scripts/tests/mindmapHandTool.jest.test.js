/**
 * @jest-environment jsdom
 */
// 对齐 Excalidraw：「抓手」放在画布顶部缩放条（CanvasZoomUI），而非机身按键排。
// 复用现有缩放条机制（可选 hand 键，仅导图传 onHand），内部复用 CanvasGestures 的 handTool。
const { loadModule } = require('./__helpers__/testUtils');

const { MindmapFeature } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);
const { ModePolicy } = loadModule('handlers/features/modePolicy.js', ['ModePolicy']);
const { CanvasZoomUI } = loadModule('services/CanvasZoomUI.js', ['CanvasZoomUI']);

function fakeZoomAdapter(over = {}) {
  let hand = false;
  return {
    getCanvas: () => document.createElement('div'),
    getView: () => ({ x: 0, y: 0, scale: 1 }),
    setView: () => {},
    zoomAtCenter: jest.fn(),
    reset: jest.fn(),
    fit: jest.fn(),
    onHand: jest.fn(() => { hand = !hand; }),
    isHandActive: () => hand,
    ...over,
    // 暴露可变开关给用例
    _setHand: (v) => { hand = v; },
  };
}

describe('思维子弹：抓手工具放在缩放条（对齐 Excalidraw）', () => {
  test('mindmap 机身键不再有 hand（已迁到缩放条）', () => {
    expect(ModePolicy.of('mindmap').buttons.hand).toBeUndefined();
  });

  test('CanvasZoomUI：传 onHand 时渲染 hand 键，点击触发 onHand', () => {
    const host = document.createElement('div');
    const a = fakeZoomAdapter();
    const ui = CanvasZoomUI.mount(host, a);
    expect(ui).not.toBeNull();
    const handBtn = ui.el.querySelector('[data-act="hand"]');
    expect(handBtn).not.toBeNull();
    expect(handBtn.querySelector('svg')).not.toBeNull();   // 有图标
    handBtn.click();
    expect(a.onHand).toHaveBeenCalledTimes(1);
  });

  test('CanvasZoomUI：未传 onHand（如便签档）不渲染 hand 键', () => {
    const host = document.createElement('div');
    const a = fakeZoomAdapter();
    delete a.onHand; delete a.isHandActive;
    const ui = CanvasZoomUI.mount(host, a);
    expect(ui.el.querySelector('[data-act="hand"]')).toBeNull();
  });

  test('CanvasZoomUI：sync 按 isHandActive 切换 hand 键高亮', () => {
    const host = document.createElement('div');
    const a = fakeZoomAdapter();
    const ui = CanvasZoomUI.mount(host, a);
    const handBtn = ui.el.querySelector('[data-act="hand"]');
    a._setHand(true);  ui.sync();
    expect(handBtn.classList.contains('active')).toBe(true);
    a._setHand(false); ui.sync();
    expect(handBtn.classList.contains('active')).toBe(false);
  });

  test('_toggleHand：翻转 handTool 并刷新缩放条高亮 + 提示', () => {
    const state = { handTool: false };
    const zoomUI = { sync: jest.fn() };
    const feature = {
      _hand: { state, toggleHand() { state.handTool = !state.handTool; return state.handTool; } },
      _zoomUI: zoomUI,
      _msg: jest.fn(),
    };
    MindmapFeature._toggleHand.call(feature);
    expect(state.handTool).toBe(true);
    expect(zoomUI.sync).toHaveBeenCalled();
    expect(feature._msg).toHaveBeenCalled();
    MindmapFeature._toggleHand.call(feature);
    expect(state.handTool).toBe(false);
  });

  test('_toggleHand：无 _hand（异常防护）时 no-op，不抛', () => {
    const feature = { _msg: jest.fn() };
    expect(() => MindmapFeature._toggleHand.call(feature)).not.toThrow();
    expect(feature._msg).not.toHaveBeenCalled();
  });

  test('_runModeAction 守卫：按 hand 不崩（hand 已非机身键）', () => {
    const tw = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']).TypewriterFeature;
    const feature = { _mode: 'mindmap', _el: document.createElement('div') };
    expect(() => tw._runModeAction.call(feature, 'hand')).not.toThrow();
  });
});
