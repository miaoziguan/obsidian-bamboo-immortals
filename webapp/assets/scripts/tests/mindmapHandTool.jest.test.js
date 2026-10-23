/**
 * @jest-environment jsdom
 */
// 对齐 Excalidraw：思维子弹「抓手」按钮 / 模式（移动端替代双指捏合平移）。
// 复用现有工具栏机制（#twHand + ModePolicy.buttons.hand + _runModeAction + .tw-rbtn.active），
// 不另搞设计体系；内部复用桌面端 CanvasGestures 的 handTool 机制。
const { loadModule } = require('./__helpers__/testUtils');

const { MindmapFeature } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);
const { ModePolicy } = loadModule('handlers/features/modePolicy.js', ['ModePolicy']);
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);

function mkHandFeature(initialHand) {
  const root = document.createElement('div');
  const btn = document.createElement('button');
  btn.id = 'twHand';
  root.appendChild(btn);
  const state = { handTool: !!initialHand };
  const feature = {
    _el: root,
    _hand: {
      state,
      toggleHand() { state.handTool = !state.handTool; return state.handTool; },
    },
    _msg: jest.fn(),
  };
  return { feature, btn, state };
}

describe('思维子弹：抓手按钮 / 模式（对齐 Excalidraw）', () => {
  test('ModePolicy 契约：仅 mindmap 有 hand 键，且 action 指向已实现的 _toggleHand', () => {
    expect(ModePolicy.of('mindmap').buttons.hand).toBeDefined();
    expect(ModePolicy.of('mindmap').buttons.hand.action).toBe('_toggleHand');
    expect(ModePolicy.of('mindmap').buttons.hand.icon).toBeTruthy();
    // 便签 / 写作档没有抓手键（按钮在 applyModeChrome 里会被隐藏）
    expect(ModePolicy.of('notes').buttons.hand).toBeUndefined();
    expect(ModePolicy.of('write').buttons.hand).toBeUndefined();
    // 实现存在
    expect(typeof MindmapFeature._toggleHand).toBe('function');
  });

  test('_toggleHand：开 → handTool=true 且按钮高亮；再点 → 关', () => {
    const { feature, btn, state } = mkHandFeature(false);
    MindmapFeature._toggleHand.call(feature);
    expect(state.handTool).toBe(true);
    expect(btn.classList.contains('active')).toBe(true);
    MindmapFeature._toggleHand.call(feature);
    expect(state.handTool).toBe(false);
    expect(btn.classList.contains('active')).toBe(false);
  });

  test('_toggleHand：初始已开启时先关；且每次都给提示', () => {
    const { feature, btn, state } = mkHandFeature(true);
    MindmapFeature._toggleHand.call(feature);
    expect(state.handTool).toBe(false);
    expect(btn.classList.contains('active')).toBe(false);
    expect(feature._msg).toHaveBeenCalled();
  });

  test('_toggleHand：无 _hand（异常防护）时 no-op，不抛不碰按钮', () => {
    const root = document.createElement('div');
    const btn = document.createElement('button'); btn.id = 'twHand'; root.appendChild(btn);
    const feature = { _el: root, _msg: jest.fn() };
    expect(() => MindmapFeature._toggleHand.call(feature)).not.toThrow();
    expect(btn.classList.contains('active')).toBe(false);
    expect(feature._msg).not.toHaveBeenCalled();
  });

  test('_runModeAction 守卫：非 mindmap 模式按 hand 不崩、不调用未实现方法', () => {
    // 便签档没有 hand 键；守卫应在读 buttons.hand.action 前 return，而非抛 undefined.action。
    const tw = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']).TypewriterFeature;
    const feature = { _mode: 'notes', _el: document.createElement('div') };
    expect(() => tw._runModeAction.call(feature, 'hand')).not.toThrow();
    // 思维子弹档：hand 键存在，但本假 this 没有 _toggleHand 方法 → 守卫也不会误调用
    feature._mode = 'mindmap';
    expect(() => tw._runModeAction.call(feature, 'hand')).not.toThrow();
  });

  test('applyModeChrome：mindmap 显示 #twHand，其余档位隐藏', () => {
    function mkCtrl(mode) {
      const root = document.createElement('div');
      root.innerHTML =
        '<span id="twScreenTitle"></span>' +
        '<span id="twMetaNotes"></span><span id="twMetaWrite"></span><span id="twMetaMindmap"></span>' +
        '<button id="twPaper"></button><button id="twFont"></button><button id="twArrange"></button>' +
        '<button id="twHand" hidden></button>' +
        '<button id="twPrint"></button><button id="twDocCorner"></button>';
      document.body.appendChild(root);
      return {
        _el: root, _mode: mode, _input: document.createElement('input'), _draft: {},
        _ensureDocCorner() {}, _refreshDocBtnLabel() {}, _refreshScreenMeta() {}, _syncDecoLayer() {},
        _getDocKind() { return ModePolicy.docKind(this._mode); },
      };
    }
    document.body.innerHTML = '';
    const mm = mkCtrl('mindmap');
    ModeController.applyModeChrome({ state: {}, ctrl: mm });
    expect(mm._el.querySelector('#twHand').hidden).toBe(false);   // 思维子弹：显示
    document.body.innerHTML = '';
    const nt = mkCtrl('notes');
    ModeController.applyModeChrome({ state: {}, ctrl: nt });
    expect(nt._el.querySelector('#twHand').hidden).toBe(true);     // 便签：隐藏
  });
});
