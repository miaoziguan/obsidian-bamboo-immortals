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

  test('便签/写作档 _toggleHand：翻转 handTool 并同步缩放条 + 提示', () => {
    const tw = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']).TypewriterFeature;
    const state = { handTool: false };
    const zoomUI = { sync: jest.fn() };
    const feature = {
      _hand: { state, toggleHand() { state.handTool = !state.handTool; return state.handTool; } },
      _zoomUI: zoomUI,
      _showScreenMsg: jest.fn(),
    };
    tw._toggleHand.call(feature);
    expect(state.handTool).toBe(true);
    expect(zoomUI.sync).toHaveBeenCalled();
    expect(feature._showScreenMsg).toHaveBeenCalled();
    tw._toggleHand.call(feature);
    expect(state.handTool).toBe(false);
  });

  test('便签/写作档 _toggleHand：无 _hand 时 no-op', () => {
    const tw = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']).TypewriterFeature;
    const feature = { _showScreenMsg: jest.fn() };
    expect(() => tw._toggleHand.call(feature)).not.toThrow();
    expect(feature._showScreenMsg).not.toHaveBeenCalled();
  });
});

describe('节点备注：画布标记', () => {
  test('有备注 → has-note 且标记显示；清空 → 移除并隐藏标记', () => {
    const el = document.createElement('div');
    el.innerHTML = '<span class="tw-mm-text"></span><button class="tw-mm-note-mark" hidden></button>';
    el._text = el.querySelector('.tw-mm-text');
    el._noteMark = el.querySelector('.tw-mm-note-mark');
    const fake = { _editId: null, NODE_MAX_W: 220 };
    MindmapFeature._paintNode.call(fake, el, { id: 'a', text: 'x', note: '有' });
    expect(el.classList.contains('has-note')).toBe(true);
    expect(el._noteMark.hidden).toBe(false);
    MindmapFeature._paintNode.call(fake, el, { id: 'a', text: 'x', note: '' });
    expect(el.classList.contains('has-note')).toBe(false);
    expect(el._noteMark.hidden).toBe(true);
  });
});

describe('备注卡片：多实例（可同时展开多个节点笔记）', () => {
  function mkMark() {
    return { classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }, title: '展开节点笔记', hidden: true };
  }
  function makeMM() {
    return {
      _noteLayer: document.createElement('div'),
      _noteCards: new Map(),
      _selId: 'a',
      _els: new Map([['a', { _noteMark: mkMark() }], ['b', { _noteMark: mkMark() }]]),
      _nodeById: (id) => ({ id, note: id === 'a' ? '已有备注A' : '已有备注B' }),
      _autoGrowNote: jest.fn(),
      _positionNoteCard: jest.fn(),
      _makeNoteCard: MindmapFeature._makeNoteCard,
      _isNoteOpen: MindmapFeature._isNoteOpen,
      _openNoteEditor: MindmapFeature._openNoteEditor,
    };
  }

  test('打开 a 再打开 b：两张同时展开，a 不被关闭（核心回归）', () => {
    const mm = makeMM();
    mm._openNoteEditor('a');
    mm._openNoteEditor('b');
    expect(mm._noteCards.size).toBe(2);
    expect(mm._noteCards.get('a').box.hidden).toBe(false);
    expect(mm._noteCards.get('b').box.hidden).toBe(false);
    expect(mm._noteCards.get('a').input.value).toBe('已有备注A');
    expect(mm._noteCards.get('b').input.value).toBe('已有备注B');
    expect(mm._autoGrowNote).toHaveBeenCalledTimes(2);
    expect(mm._positionNoteCard).toHaveBeenCalledTimes(2);
    expect(mm._els.get('a')._noteMark.classList.add).toHaveBeenCalledWith('is-open');
    expect(mm._els.get('b')._noteMark.classList.add).toHaveBeenCalledWith('is-open');
  });

  test('再点同一节点 = 只收起该张（toggle），另一张不受影响', () => {
    const mm = makeMM();
    mm._nodeById = (id) => ({ id, note: '' });
    mm._mutate = (fn) => fn();
    mm._nodes = [];
    mm._paintNode = jest.fn();
    mm._scheduleSave = jest.fn();
    mm._updateToolbar = jest.fn();
    mm._closeNoteEditor = MindmapFeature._closeNoteEditor;
    mm._openNoteEditor('a');
    mm._openNoteEditor('b');
    expect(mm._noteCards.size).toBe(2);
    mm._openNoteEditor('a');   // toggle a → 只收起 a
    expect(mm._noteCards.has('a')).toBe(false);
    expect(mm._noteCards.has('b')).toBe(true);
    expect(mm._els.get('a')._noteMark.classList.remove).toHaveBeenCalledWith('is-open');
    expect(mm._els.get('a')._noteMark.title).toBe('展开节点笔记');
  });
});
