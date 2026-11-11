/**
 * @jest-environment jsdom
 */
// 思维子弹：缩放条上的「全部节点笔记」一键展开 / 收起。
//
// 为什么入口放缩放条而不是工具条：工具条那枚「备注」键作用于**当前选中**节点，
// 这里是画布级视图动作（不依赖选中），与抓手/缩放同属「看整张图」的一组。
//
// 三个容易做错的地方，各有一条断言守着：
//   ① 批量打开时不能逐张抢焦点（最后落点会变成随机某个节点），故 _showNoteCard 支持 focus:false；
//   ② 视野外节点的卡片必须「隐藏但保持展开」，不能把 x 夹到画布边缘 —— 否则一键展开后
//      画布左右边框上会贴一串无主笔记；也不能直接卸载，那会让「是否展开」一起丢掉；
//   ③ 按钮高亮必须是「全部」而不是「至少一张」，局部展开不亮，避免误读成「已全展开」。
const { loadModule } = require('./__helpers__/testUtils');

const { MindmapFeature } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);
const { CanvasZoomUI } = loadModule('services/CanvasZoomUI.js', ['CanvasZoomUI']);

function mkMark() {
  return { classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }, title: '', hidden: true };
}

/** 造一个够用的 mm 实例：真实方法按需挂上，避免整条渲染链 */
function makeMM(nodes, opts = {}) {
  // 必须挂进 document：jsdom 里未连接文档的元素 .focus() 是空操作，
  // 那样「批量打开不抢焦点」会变成永远通过的假测试（实测漏检过）。
  const layer = document.createElement('div');
  document.body.appendChild(layer);
  const mm = {
    _noteLayer: layer,
    _noteCards: new Map(),
    _nodes: nodes,
    _els: new Map(),
    _msg: jest.fn(),
    _zoomUI: { sync: jest.fn() },
    _nodeMapSrc: nodes,          // 让 _nodeById 直接用 _nodeMap
    _nodeMap: new Map(nodes.map((n) => [n.id, n])),
    _mutate: (fn) => fn(),
    _scheduleSave: jest.fn(),
    _updateToolbar: jest.fn(),
    _paintNode: jest.fn(),
    _autoGrowNote: jest.fn(),
    _positionNoteCard: opts.realPosition ? MindmapFeature._positionNoteCard : jest.fn(),
    // 被剔除的节点重挂：真实实现会把 el 放进 _els，这里照样模拟
    _mountNode: jest.fn((n) => { mm._els.set(n.id, { _noteMark: mkMark() }); }),
    NOTE_BULK_MAX: opts.cap || MindmapFeature.NOTE_BULK_MAX,
  };
  ['_nodeById', '_makeNoteCard', '_isNoteOpen', '_showNoteCard', '_noteTargets',
    '_openAllNoteEditors', '_isAllNotesOpen', '_toggleAllNoteEditors', '_closeNoteEditor',
    '_closeAllNoteEditors', '_syncZoom', '_openNoteEditor', '_persistNote',
    '_countNodesWithNote'].forEach((k) => {
    mm[k] = MindmapFeature[k];
  });
  nodes.forEach((n) => mm._els.set(n.id, { _noteMark: mkMark() }));
  if (opts.noEls) mm._els.clear();
  return mm;
}

afterEach(() => { document.body.innerHTML = ''; });

const NODES = [
  { id: 'a', text: 'A', x: 0, y: 300, color: '', note: '下' },
  { id: 'b', text: 'B', x: 0, y: 0, color: '', note: '上' },
  { id: 'c', text: 'C', x: 0, y: 150, color: '', note: '' },      // 没笔记 → 不展开
  { id: 'd', text: 'D', x: 0, y: 150, color: '', note: '   ' },   // 空白笔记 → 不展开
];

describe('全部节点笔记：展开 / 收起', () => {
  test('只打开「有笔记」的节点，且按画布坐标从上到下排序', () => {
    const mm = makeMM(NODES);
    expect(mm._noteTargets().map((n) => n.id)).toEqual(['b', 'a']);   // y 小者在前
    const opened = mm._openAllNoteEditors();
    expect(opened).toBe(2);
    expect(Array.from(mm._noteCards.keys())).toEqual(['b', 'a']);
    expect(mm._noteCards.get('a').input.value).toBe('下');
  });

  test('批量打开不抢焦点（否则最后一张随机获得焦点）', () => {
    const mm = makeMM(NODES);
    mm._openAllNoteEditors();
    mm._noteCards.forEach((c) => expect(document.activeElement).not.toBe(c.input));
  });

  test('再点一次（已有卡片）→ 全部收起并提示', () => {
    const mm = makeMM(NODES);
    mm._toggleAllNoteEditors();
    expect(mm._noteCards.size).toBe(2);
    expect(mm._msg).toHaveBeenLastCalledWith('已展开 2 张节点笔记');

    mm._toggleAllNoteEditors();
    expect(mm._noteCards.size).toBe(0);
    expect(mm._msg).toHaveBeenLastCalledWith('已收起全部节点笔记');
    // 节点上的标记同步复位
    expect(mm._els.get('a')._noteMark.classList.remove).toHaveBeenCalledWith('is-open');
  });

  test('一个笔记都没有：不建卡片，给出可操作提示', () => {
    const mm = makeMM([{ id: 'x', text: 'X', x: 0, y: 0, note: '' }]);
    mm._toggleAllNoteEditors();
    expect(mm._noteCards.size).toBe(0);
    expect(mm._msg).toHaveBeenCalledTimes(1);
    expect(mm._msg.mock.calls[0][0]).toContain('还没有节点笔记');
  });

  test('超过上限时按顺序截断，且高亮仍判为「已全部展开」', () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ id: 'n' + i, text: 't', x: 0, y: i, note: '备注' + i }));
    const mm = makeMM(many, { cap: 40 });
    const opened = mm._openAllNoteEditors();
    expect(opened).toBe(40);
    expect(mm._isAllNotesOpen()).toBe(true);
    // 提示必须交代「被截断」，否则用户会以为剩下的 10 张笔记是空的
    mm._noteCards.clear();
    mm._toggleAllNoteEditors();
    expect(mm._msg.mock.calls[0][0]).toContain('共 50 张');
  });

  test('高亮判定：0 张 / 部分 / 全部', () => {
    const mm = makeMM(NODES);
    expect(mm._isAllNotesOpen()).toBe(false);        // 一张没开
    mm._openNoteEditor('b');                          // 只开一张
    expect(mm._isAllNotesOpen()).toBe(false);         // 局部展开不算「全部」
    mm._openAllNoteEditors();
    expect(mm._isAllNotesOpen()).toBe(true);
    mm._closeNoteEditor('a');                         // 收一张 → 不再算全部
    expect(mm._isAllNotesOpen()).toBe(false);
  });

  test('节点 DOM 被剔除时自动重挂，卡片才能定位', () => {
    const mm = makeMM(NODES, { noEls: true });
    const opened = mm._openAllNoteEditors();
    expect(opened).toBe(2);
    expect(mm._mountNode).toHaveBeenCalledTimes(2);
  });
});

describe('备注卡片的「逻辑展开」与「视野内可见」解耦', () => {
  test('_isNoteOpen 看逻辑态：box 被临时隐藏仍算展开', () => {
    const mm = makeMM(NODES);
    mm._openNoteEditor('a');
    const card = mm._noteCards.get('a');
    card.box.hidden = true;                 // 模拟平移到节点视野外
    expect(mm._isNoteOpen('a')).toBe(true);
  });

  test('节点整颗在视野外 → 只隐藏卡片，不把 x 夹到画布边缘', () => {
    const layer = document.createElement('div');
    layer.getBoundingClientRect = () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 });
    Object.defineProperty(layer, 'clientWidth', { value: 800 });
    Object.defineProperty(layer, 'clientHeight', { value: 600 });
    const el = document.createElement('div');
    // 完全在右侧视野外：旧实现会把 left 夹到 800-320-8 → 边框上多出一张无主卡片
    el.getBoundingClientRect = () => ({ left: 2000, top: 300, right: 2100, bottom: 340, width: 100, height: 40 });
    const box = document.createElement('div');
    const mm = {
      _el: layer,
      _els: new Map([['a', el]]),
      _noteCards: new Map([['a', { box, input: {}, open: true }]]),
    };
    MindmapFeature._positionNoteCard.call(mm, 'a');
    expect(box.hidden).toBe(true);
    expect(box.style.left).toBe('');

    // 平移回来 → 同一张卡片重新出现并落位
    el.getBoundingClientRect = () => ({ left: 100, top: 100, right: 200, bottom: 140, width: 100, height: 40 });
    MindmapFeature._positionNoteCard.call(mm, 'a');
    expect(box.hidden).toBe(false);
    expect(box.style.left).not.toBe('');
  });
});

describe('缩放条上的「全部节点笔记」键', () => {
  function adapter(over = {}) {
    return {
      getCanvas: () => document.createElement('div'),
      getView: () => ({ x: 0, y: 0, scale: 1 }),
      setView: () => {},
      zoomAtCenter: jest.fn(),
      reset: jest.fn(),
      fit: jest.fn(),
      onHand: jest.fn(),
      isHandActive: () => false,
      onToggleAllNotes: jest.fn(),
      isAllNotesOpen: () => false,
      ...over,
    };
  }

  test('传 onToggleAllNotes 才生成，点击触发回调', () => {
    const host = document.createElement('div');
    const a = adapter();
    const ui = CanvasZoomUI.mount(host, a);
    const btn = ui.el.querySelector('[data-act="notes"]');
    expect(btn).not.toBeNull();
    expect(btn.querySelector('svg')).not.toBeNull();
    btn.click();
    expect(a.onToggleAllNotes).toHaveBeenCalledTimes(1);
  });

  test('不传 onToggleAllNotes（便签/写作档）→ 不生成该键', () => {
    const host = document.createElement('div');
    const a = adapter();
    delete a.onToggleAllNotes;
    delete a.isAllNotesOpen;
    const ui = CanvasZoomUI.mount(host, a);
    expect(ui.el.querySelector('[data-act="notes"]')).toBeNull();
  });

  test('sync 按 isAllNotesOpen 切换高亮', () => {
    const host = document.createElement('div');
    let open = false;
    const ui = CanvasZoomUI.mount(host, adapter({ isAllNotesOpen: () => open }));
    const btn = ui.el.querySelector('[data-act="notes"]');
    expect(btn.classList.contains('active')).toBe(false);
    open = true; ui.sync();
    expect(btn.classList.contains('active')).toBe(true);
  });

  test('导图挂上的是真实回调：点击一次即展开全部', () => {
    const mm = makeMM(NODES);
    const host = document.createElement('div');
    const ui = CanvasZoomUI.mount(host, {
      getCanvas: () => document.createElement('div'),
      getView: () => ({ x: 0, y: 0, scale: 1 }),
      setView: () => {},
      zoomAtCenter: jest.fn(), reset: jest.fn(), fit: jest.fn(),
      onToggleAllNotes: () => mm._toggleAllNoteEditors(),
      isAllNotesOpen: () => mm._isAllNotesOpen(),
    });
    ui.el.querySelector('[data-act="notes"]').click();
    expect(mm._noteCards.size).toBe(2);
    expect(ui.el.querySelector('[data-act="notes"]').classList.contains('active')).toBe(true);
    ui.el.querySelector('[data-act="notes"]').click();
    expect(mm._noteCards.size).toBe(0);
    expect(ui.el.querySelector('[data-act="notes"]').classList.contains('active')).toBe(false);
  });
});
