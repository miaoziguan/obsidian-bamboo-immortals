/**
 * @jest-environment jsdom
 */
// 系统层级审计的回归锁，四条都对应「真实存在、已核实」的缺陷：
//
// 1) 子弹文本编辑不入撤销栈：_commitEdit 此前直接改 _nodes、绕开 _mutate（唯一 push 撤销快照的入口），
//    于是改完字按 Cmd+Z 撤到的是更早的快照（常把刚建的子弹一起撤掉）。
//    修复后纳入撤销，且只在文本真变时入栈（MindmapDoc.setText 无条件返回新数组，
//    不判等会把每次 blur 都压成一条空撤销帧）。
// 2) 切组 / 建组 / 删组不收起笔记卡片：只处理了 _editId，卡片会滞留并指向已随旧文档消失的节点
//    （_positionNoteCard 因 !el 早退 → 冻在旧位置）。
// 3) 卸载不保存未提交的笔记：teardown 此前只认 _editId，而笔记是「失焦才写回」，
//    移除 DOM 不保证触发 blur → 硬关闭时已输入未失焦的笔记静默丢失。
// 4) _nodeGeo 只增不减：删除节点时几何缓存没清（注意 _unmountNode 写缓存是给「离屏剔除」用的，
//    那批节点仍在文档里，连线要靠缓存画；只有真删除才该清）。
const { loadModule } = require('./__helpers__/testUtils');

const STORE = {
  loadMindmapGroupDoc: jest.fn(), saveMindmapGroupDoc: jest.fn(),
  ensureMindmapIndex: jest.fn(), createMindmapGroup: jest.fn(),
  setMindmapCurrent: jest.fn(), deleteMindmapGroup: jest.fn(), renameMindmapGroup: jest.fn(),
};
global.TypewriterStore = STORE;

const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/mindmapDoc.js', 'MindmapDoc');
_b1mod('services/SpatialIndex.js', 'SpatialIndex');   // teardown / new SpatialIndex()
const { MindmapFeature } = loadModule(
  'handlers/features/mindmapFeature.js', ['MindmapFeature'],
  { TypewriterStore: STORE, SpatialIndex: global.SpatialIndex }
);

// ── 1) 文本编辑入撤销栈 ────────────────────────────────────────────────
function editFixture(oldText, newText) {
  return {
    _editId: 'n1',
    _editKey: null, _editBlur: null,
    _nodes: [{ id: 'n1', text: oldText }],     // 模型：setText 要在这上面跑
    _els: new Map([['n1', {
      _text: { innerText: newText, contentEditable: 'true' },
      classList: { remove: jest.fn() },
    }]]),
    _nodeById: (id) => (id === 'n1' ? { id: 'n1', text: oldText } : null),
    _mutate: jest.fn((fn) => fn()),
    _scheduleSave: jest.fn(),
    renderNodes: jest.fn(),
  };
}

describe('文本编辑纳入撤销栈（_commitEdit）', () => {
  test('文本真的变了 → 走 _mutate（入撤销栈）并写回模型', () => {
    const f = editFixture('旧文本', '新文本');
    MindmapFeature._commitEdit.call(f);
    expect(f._mutate).toHaveBeenCalledTimes(1);
    expect(f._nodes[0].text).toBe('新文本');
  });

  test('文本没变（仅 blur / 切选中）→ 不入栈，避免压出空撤销帧', () => {
    const f = editFixture('同一段', '同一段');
    MindmapFeature._commitEdit.call(f);
    expect(f._mutate).not.toHaveBeenCalled();
    expect(f._nodes[0].text).toBe('同一段');
    expect(f._scheduleSave).toHaveBeenCalled();   // 落盘照旧
  });

  test('cancel=true（Esc 刻意取消）→ 既不入栈也不写回，模型保持旧文本', () => {
    const f = editFixture('旧', '新');
    MindmapFeature._commitEdit.call(f, true);
    expect(f._mutate).not.toHaveBeenCalled();
    expect(f._nodes[0].text).toBe('旧');
    expect(f._scheduleSave).not.toHaveBeenCalled();
  });
});

// ── 2) 组操作收起笔记卡片 ──────────────────────────────────────────────
function groupFixture(groupId = 'groupA') {
  const MM = MindmapFeature;
  MM._el = document.createElement('div');
  MM._nodes = [{ id: 'n1', text: 'A组节点', x: 0, y: 0, color: '' }];
  MM._links = [];
  MM._view = null;
  MM._style = 0;
  MM._groupId = groupId;
  MM._editId = null;
  MM._noteCards = new Map([['n1', { box: { hidden: false }, input: { value: '半截笔记' } }]]);  // 笔记卡片正开着
  MM._closeNoteEditor = jest.fn();
  MM._msg = () => {};
  MM._scheduleSave = () => {};
  MM.load = jest.fn().mockResolvedValue(undefined);
  MM.render = jest.fn();
  MM._applyStyleClass = jest.fn();
  MM._saveNow = jest.fn();
  MM._commitEdit = jest.fn();
  MM._undoStack = { reset: jest.fn(), push: () => {}, undo: () => false, redo: () => false };
  return MM;
}

describe('组操作前先收起笔记卡片', () => {
  beforeEach(() => {
    STORE.setMindmapCurrent.mockResolvedValue(undefined);
    STORE.createMindmapGroup.mockResolvedValue({ id: 'groupB' });
    STORE.deleteMindmapGroup.mockResolvedValue({ current: 'groupC' });
  });

  test('switchGroup：收起卡片，且发生在落盘之前', async () => {
    const MM = groupFixture('groupA');
    await MM.switchGroup('groupB');
    expect(MM._closeNoteEditor).toHaveBeenCalledTimes(1);
    expect(MM._closeNoteEditor.mock.invocationCallOrder[0])
      .toBeLessThan(MM._saveNow.mock.invocationCallOrder[0]);
  });

  test('newGroup：收起卡片', async () => {
    const MM = groupFixture('groupA');
    await MM.newGroup();
    expect(MM._closeNoteEditor).toHaveBeenCalledTimes(1);
  });

  test('deleteGroup：收起卡片', async () => {
    const MM = groupFixture('groupA');
    await MM.deleteGroup('groupA');
    expect(MM._closeNoteEditor).toHaveBeenCalledTimes(1);
  });

  test('没有打开笔记卡片时不做多余动作', async () => {
    const MM = groupFixture('groupA');
    MM._noteCards = new Map();
    await MM.switchGroup('groupB');
    expect(MM._closeNoteEditor).not.toHaveBeenCalled();
  });
});

// ── 3) 卸载兜底保存未提交的笔记 ────────────────────────────────────────
describe('teardown 兜底写回未失焦的笔记', () => {
  test('有打开笔记卡片 → 先 _persistNote（在 _el 被弃之前）', () => {
    const MM = MindmapFeature;
    MM._el = document.createElement('div');
    MM._active = true;
    MM._editId = null;
    MM._noteCards = new Map([['n1', { box: { hidden: false }, input: { value: '未失焦的笔记' } }]]);
    MM._persistNote = jest.fn();
    MM._commitEdit = jest.fn();
    MM._scheduleSave = jest.fn();
    MM._saveNow = jest.fn();
    MM._saveTimer = 0;
    MM._undoStack = { reset: jest.fn(), push: () => {}, undo: () => false, redo: () => false };
    MM._hand = null;
    MM.teardown();
    expect(MM._persistNote).toHaveBeenCalledTimes(1);
  });

  test('没有打开笔记卡片 → 不调用 _persistNote', () => {
    const MM = MindmapFeature;
    MM._el = document.createElement('div');
    MM._active = true;
    MM._editId = null;
    MM._noteCards = new Map();
    MM._persistNote = jest.fn();
    MM._saveNow = jest.fn();
    MM._saveTimer = 0;
    MM._undoStack = { reset: jest.fn(), push: () => {}, undo: () => false, redo: () => false };
    MM.teardown();
    expect(MM._persistNote).not.toHaveBeenCalled();
  });
});

// ── 5) 浮动工具条不再每帧重复查询 / 量尺寸 ─────────────────────────────
// _updateToolbar 由 _applyView 每帧调用（平移/缩放）。原先每次都 querySelector 一次，
// 并在 hidden=false 后读 offsetWidth/offsetHeight —— 后者会强制一次同步回流。
// 工具条内容是固定的（按钮行 + 色盘），尺寸不会随平移变化，故缓存。
describe('浮动工具条缓存（_updateToolbar 热路径）', () => {
  test('_initToolbar 缓存「节点笔记」按钮，并把尺寸缓存置空待首次量取', () => {
    const layer = document.createElement('div');
    const MM = MindmapFeature;
    MM._initToolbar(layer);
    expect(MM._tbNoteBtn).toBeTruthy();
    expect(MM._tbNoteBtn.dataset.act).toBe('note');
    expect(MM._tbSize).toBeNull();
  });

  test('_updateToolbar 复用缓存按钮：不再每次 querySelector', () => {
    const MM = MindmapFeature;
    const layer = document.createElement('div');
    MM._initToolbar(layer);
    const tb = MM._toolbar;
    const spy = jest.spyOn(tb, 'querySelector');

    const nodeEl = document.createElement('div');
    MM._el = document.createElement('div');
    MM._selId = 'n1';
    MM._selSet = null;
    MM._editId = null;
    MM._els = new Map([['n1', nodeEl]]);
    MM._nodeById = () => ({ id: 'n1', text: 'a', note: '' });

    MM._updateToolbar();
    MM._updateToolbar();
    expect(spy).not.toHaveBeenCalled();
    expect(MM._tbSize).not.toBeNull();   // 首次已量取并入缓存
    spy.mockRestore();
  });
});

// ── 6) 删除节点时清掉几何缓存 ──────────────────────────────────────────
function deleteFixture(ids) {
  const geo = new Map();
  ids.forEach((id) => geo.set(id, { cx: 0, cy: 0, hw: 10, hh: 5, rot: 0 }));
  return {
    geo,
    _mutate: (fn) => fn(),
    _nodes: ids.map((id) => ({ id, text: 'x', x: 0, y: 0, color: '' })),
    _links: [],
    _nodeGeo: geo,
    _unmountNode: jest.fn(),
    _refreshEmpty: jest.fn(),
    _scheduleSave: jest.fn(),
    _linkLayer: { render: jest.fn() },
    _paintSelection: jest.fn(),
    _msg: jest.fn(),
    _exitConnectMode: jest.fn(),
    _selId: ids[0],
    _selSet: new Set(),
  };
}

describe('删除节点时清理 _nodeGeo（防只增不减）', () => {
  test('_deleteSel：几何缓存不再残留被删节点', () => {
    const f = deleteFixture(['n1', 'n2']);
    MindmapFeature._deleteSel.call(f);
    expect(f._nodeGeo.has('n1')).toBe(false);
    expect(f._nodeGeo.has('n2')).toBe(true);   // 未删的节点不受影响
  });

  test('_deleteMulSel：每个被删节点的几何都清掉', () => {
    const f = deleteFixture(['n1', 'n2', 'n3']);
    f._selSet = new Set(['n1', 'n2']);
    MindmapFeature._deleteMulSel.call(f);
    expect(f._nodeGeo.has('n1')).toBe(false);
    expect(f._nodeGeo.has('n2')).toBe(false);
    expect(f._nodeGeo.has('n3')).toBe(true);
  });
});
