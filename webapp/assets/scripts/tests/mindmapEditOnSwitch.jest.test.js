/**
 * @jest-environment jsdom
 */
// A13 回归锁：切档不得丢掉「刚打字、还没 blur」的半截编辑。
//
// 现场：ModeController 切档时对导图档调 MindmapFeature.deactivate()，其注释自陈「半截编辑先提交」，
// 实现却是 _commitEdit(true)（cancel）→ 文本既不进 _nodes，deactivate 末尾 _saveNow() 落的还是旧模型；
// 切回导图档 load() 再从磁盘读回旧文本 = 静默丢字。
//
// 为什么点旋钮不复现：mousedown 先让正文失焦 → _editBlur → _commitEdit()（非 cancel）已提交，
// 进 deactivate 时 _editId 已为 null，cancel 那一步空转。
// 只有旋钮滚轮拨档不改焦点、不触发 blur，才真正走到「取消」那一步 —— 这正是它长期未被发现的原因。
//
// 同时锁住反向语义：Esc 的「取消编辑」必须保留，不能为了修 A13 而改成一律提交。
const { loadModule } = require('./__helpers__/testUtils');

const STORE = {
  loadMindmapGroupDoc: jest.fn(), saveMindmapGroupDoc: jest.fn(),
  ensureMindmapIndex: jest.fn(), createMindmapGroup: jest.fn(),
  setMindmapCurrent: jest.fn(), deleteMindmapGroup: jest.fn(), renameMindmapGroup: jest.fn(),
};
global.TypewriterStore = STORE;

const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/mindmapDoc.js', 'MindmapDoc');
_b1mod('services/SpatialIndex.js', 'SpatialIndex');   // teardown 里 new SpatialIndex()
const { MindmapFeature } = loadModule(
  'handlers/features/mindmapFeature.js', ['MindmapFeature'],
  { TypewriterStore: STORE, SpatialIndex: global.SpatialIndex }
);

/** 最小脚手架：挂一颗子弹并备好工具条（_enterEdit→_select 会刷新工具条） */
function fixture(text = '旧文本') {
  const layer = document.createElement('div');
  const nodeBox = document.createElement('div');
  nodeBox.className = 'tw-mm-nodes';
  layer.appendChild(nodeBox);

  const MMP = MindmapFeature;
  MMP._el = layer;
  MMP._nodeBox = nodeBox;
  MMP._els = new Map();
  MMP._linkLayer = {
    makeLinkable: () => {}, watchSize: () => {}, highlightFor: () => {},
    clearControls: () => {}, render: () => {}, scheduleRender: () => {}, removeLinksOf: () => {},
  };
  MMP._nodes = [{ id: 'n1', text, x: 0, y: 0, color: '' }];
  MMP._links = [];
  MMP._view = null;
  MMP._style = 0;
  MMP._groupId = 'default';
  MMP._undoStack = null;
  MMP._msg = () => {};
  MMP._selId = 'n1';
  MMP._selSet = null;
  MMP._editId = null;
  MMP._active = true;

  MMP._initToolbar(layer);
  MMP._mountNode(MMP._nodes[0]);
  const el = MMP._els.get('n1');
  if (!el || !el._text) throw new Error('脚手架失效：节点未挂出文本节点');
  return { MMP, el };
}

/** 模拟「可编辑区已敲入但尚未 blur」：jsdom 未实现 innerText，显式定义以忠实复现 _commitEdit 的读数点 */
function type(el, text) {
  Object.defineProperty(el._text, 'innerText', { value: text, writable: true, configurable: true });
}

const textOf = (MMP, id = 'n1') => (MMP._nodes.find((n) => n.id === id) || {}).text;

beforeEach(() => {
  STORE.saveMindmapGroupDoc.mockClear();
});

afterEach(() => {
  clearTimeout(MindmapFeature._saveTimer);   // 清掉 _scheduleSave 挂起的防抖，避免跨用例回写
  MindmapFeature._saveTimer = 0;
});

test('A13 滚轮拨档（无 blur）必须提交半截编辑：模型更新，且落盘的就是新文本', () => {
  const { MMP, el } = fixture();
  MMP._enterEdit('n1');
  type(el, '刚打的半截文字');
  expect(MMP._editId).toBe('n1');   // 前置：编辑仍开着 = 没经过 blur（滚轮现场）

  MMP.deactivate();                 // 与 ModeController 切档同一个调用

  expect(textOf(MMP)).toBe('刚打的半截文字');   // 修复前：仍是「旧文本」
  const [groupId, doc] = STORE.saveMindmapGroupDoc.mock.calls.at(-1);
  expect(groupId).toBe('default');
  expect(doc.nodes.find((n) => n.id === 'n1').text).toBe('刚打的半截文字');   // 落盘即新文本
});

test('反向锁：Esc 仍是刻意的「取消编辑」，半截文本不得写回模型', () => {
  const { MMP, el } = fixture();
  MMP._enterEdit('n1');
  type(el, '这段不该被保存');

  el._text.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  expect(MMP._editId).toBeNull();          // 确实退出了编辑
  expect(textOf(MMP)).toBe('旧文本');       // 但没提交
});

test('对照：点击旋钮路径（blur 先行）本就提交，随后切档仍不丢字', () => {
  const { MMP, el } = fixture();
  MMP._enterEdit('n1');
  type(el, '点击路径的文字');

  el._text.dispatchEvent(new Event('blur'));   // mousedown 先失焦 → _editBlur → 提交
  expect(MMP._editId).toBeNull();
  expect(textOf(MMP)).toBe('点击路径的文字');

  MMP.deactivate();                            // 再切档：cancel 早已空转，文本保持
  expect(textOf(MMP)).toBe('点击路径的文字');
});

test('未在编辑态时 deactivate 仍安全：不写脏数据，且自身的落盘照常发生', () => {
  const { MMP } = fixture();
  STORE.saveMindmapGroupDoc.mockClear();

  MMP.deactivate();

  expect(textOf(MMP)).toBe('旧文本');
  expect(STORE.saveMindmapGroupDoc).toHaveBeenCalledTimes(1);   // deactivate 的「落盘」职责未被削弱
});

// ============================================================================
// A13 同类缺口：另外三个「会替换/丢弃当前文档」的入口 + 卸载与隐藏兜底
//
// 这些入口目前的触发物都是 <button> 点击（mousedown 先让内容失焦 → 已提交），
// 所以今天不可达；但同一份代码里只要 blur 因任何原因没发生（将来新增非鼠标入口、
// 程序化调用，或某处 pointerdown 被 preventDefault），它们都会拿旧模型落盘 = 静默丢字。
// 以下用例直接以「编辑态未收 + 调方法」钉住这份防御。
// ============================================================================
describe('A13 同类：组操作与卸载路径不得丢半截编辑', () => {
  /** 组操作随后会 load()/render()，本组用例只关心「提交与落盘」，其余重绘打桩 */
  const stubChrome = (MMP) => {
    MMP.load = async () => {};
    MMP.render = () => {};
    MMP._applyStyleClass = () => {};
  };
  const setVisibility = (v) => Object.defineProperty(document, 'visibilityState', { value: v, configurable: true });

  beforeEach(() => {
    STORE.saveMindmapGroupDoc.mockClear();
    STORE.loadMindmapGroupDoc.mockReset().mockResolvedValue(null);
    STORE.ensureMindmapIndex.mockReset().mockResolvedValue({ groups: [], current: 'default' });
  });

  test('switchGroup：先写回「旧组」再切组（修复前：落的还是旧文本，并随载入目标组丢弃）', async () => {
    const { MMP, el } = fixture();
    stubChrome(MMP);
    STORE.setMindmapCurrent.mockResolvedValue();
    MMP._enterEdit('n1');
    type(el, '切组前刚打的字');
    expect(MMP._editId).toBe('n1');

    await MMP.switchGroup('g2');

    expect(MMP._editId).toBeNull();
    const [gid, doc] = STORE.saveMindmapGroupDoc.mock.calls[0];
    expect(gid).toBe('default');                                 // 必须落进旧组
    expect(doc.nodes.find((n) => n.id === 'n1').text).toBe('切组前刚打的字');
  });

  test('newGroup：新组会整体清空 _nodes，半截编辑必须先落进旧组', async () => {
    const { MMP, el } = fixture();
    stubChrome(MMP);
    STORE.createMindmapGroup.mockResolvedValue({ id: 'g-new' });
    MMP._enterEdit('n1');
    type(el, '新建组前的字');

    await MMP.newGroup();

    const [gid, doc] = STORE.saveMindmapGroupDoc.mock.calls[0];
    expect(gid).toBe('default');
    expect(doc.nodes.find((n) => n.id === 'n1').text).toBe('新建组前的字');
    expect(MMP._nodes).toEqual([]);                              // 之后才切到新组的空文档
  });

  test('deleteGroup：删除动作前先把半截编辑写回当前组', async () => {
    const { MMP, el } = fixture();
    stubChrome(MMP);
    STORE.deleteMindmapGroup.mockResolvedValue({ current: 'default' });
    MMP._enterEdit('n1');
    type(el, '删除前一刻写的字');

    await MMP.deleteGroup('g-other');

    const [gid, doc] = STORE.saveMindmapGroupDoc.mock.calls[0];
    expect(gid).toBe('default');
    expect(doc.nodes.find((n) => n.id === 'n1').text).toBe('删除前一刻写的字');
  });

  test('teardown（关视图/重挂载）：提交半截编辑并立即落盘，同时解绑兜底监听', () => {
    const { MMP, el } = fixture();
    MMP._bindFlushGuard();
    MMP._enterEdit('n1');
    type(el, '关视图前一刻写的字');
    STORE.saveMindmapGroupDoc.mockClear();

    MMP.teardown();

    const [gid, doc] = STORE.saveMindmapGroupDoc.mock.calls[0];
    expect(gid).toBe('default');
    expect(doc.nodes.find((n) => n.id === 'n1').text).toBe('关视图前一刻写的字');
    expect(MMP._flushGuard).toBeNull();                          // 兜底监听已解绑，重挂载不叠加
  });

  test('teardown：无待落盘内容时不写盘（不拿空文档覆盖盘上数据）', () => {
    const { MMP } = fixture();
    STORE.saveMindmapGroupDoc.mockClear();

    MMP.teardown();

    expect(STORE.saveMindmapGroupDoc).not.toHaveBeenCalled();
  });

  test('落盘兜底：pagehide 时提交半截编辑并立刻落盘（便签侧那份对导图是空转）', () => {
    const { MMP, el } = fixture();
    MMP._bindFlushGuard();
    MMP._enterEdit('n1');
    type(el, '页面要走时写的字');
    STORE.saveMindmapGroupDoc.mockClear();

    window.dispatchEvent(new Event('pagehide'));

    expect(MMP._editId).toBeNull();                              // 页面真要走了：提交
    const [gid, doc] = STORE.saveMindmapGroupDoc.mock.calls[0];
    expect(gid).toBe('default');
    expect(doc.nodes.find((n) => n.id === 'n1').text).toBe('页面要走时写的字');
    MMP._unbindFlushGuard();
  });

  test('落盘兜底：切到后台只落盘、不打断编辑；切回可见则完全不处理', () => {
    const { MMP, el } = fixture();
    MMP._bindFlushGuard();
    MMP._enterEdit('n1');
    type(el, '切后台时正在敲的字');
    MMP._scheduleSave();                                         // 模拟已提交过、仍在 400ms 防抖窗口内
    STORE.saveMindmapGroupDoc.mockClear();

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(STORE.saveMindmapGroupDoc).not.toHaveBeenCalled();    // 切回可见：不处理

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(MMP._editId).toBe('n1');                              // 编辑态保留，不打断用户
    expect(STORE.saveMindmapGroupDoc).toHaveBeenCalledTimes(1);  // 但待落盘内容写下去了

    MMP._unbindFlushGuard();
  });

  test('落盘兜底：非导图档 / 无待落盘内容时都不写盘', () => {
    const { MMP } = fixture();
    MMP._bindFlushGuard();
    MMP._scheduleSave();
    MMP._active = false;                                         // 已切到便签档

    STORE.saveMindmapGroupDoc.mockClear();
    window.dispatchEvent(new Event('pagehide'));
    expect(STORE.saveMindmapGroupDoc).not.toHaveBeenCalled();

    MMP._active = true;
    MMP._saveTimer = 0;                                          // 无待落盘内容
    window.dispatchEvent(new Event('pagehide'));
    expect(STORE.saveMindmapGroupDoc).not.toHaveBeenCalled();

    MMP._unbindFlushGuard();
  });
});
