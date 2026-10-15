/**
 * @jest-environment jsdom
 */
// P0-2 回归锁：思维导图的撤销栈必须「一组一份」——切组 / 建组 / 删组后都要清空。
//
// 现场（数据覆盖）：switchGroup / newGroup / deleteGroup 只做「落盘 + 换 _groupId + load()」，
// **从不 reset _undoStack**。于是栈里残留的是上一组的快照；切到新组后按 Cmd+Z，
// _restoreSnapshot（mindmapFeature.js:1367）把旧组节点写进 _nodes，再随 _scheduleSave()
// 落到 **当前（新）组** 的文件上 → 静默覆盖新组内容。redo 只在内存里，再操作一次即清空，
// 覆盖不可逆。便签/写作档切档一直有 reset（ModeController 7 处），导图此前是唯一漏掉的。
//
// 本测试把 load / render / save 全部替身，只隔离出「是否 reset」这一件事。
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

/** 最小脚手架：只保留被测路径所需状态，其余副作用全部替身 */
function fixture(groupId = 'groupA') {
  const MM = MindmapFeature;
  MM._el = document.createElement('div');
  MM._nodes = [{ id: 'n1', text: 'A组节点', x: 0, y: 0, color: '' }];
  MM._links = [];
  MM._view = null;
  MM._style = 0;
  MM._groupId = groupId;
  MM._editId = null;
  MM._msg = () => {};
  MM._scheduleSave = () => {};
  MM.load = jest.fn().mockResolvedValue(undefined);
  MM.render = jest.fn();
  MM._applyStyleClass = jest.fn();
  MM._saveNow = jest.fn();
  MM._commitEdit = jest.fn();
  // 每个用例都重建，故 reset 计数从 0 开始
  MM._undoStack = { reset: jest.fn(), push: () => {}, undo: () => false, redo: () => false };
  return MM;
}

describe('P0-2 导图撤销栈按组隔离', () => {
  beforeEach(() => {
    STORE.setMindmapCurrent.mockResolvedValue(undefined);
    STORE.createMindmapGroup.mockResolvedValue({ id: 'groupB' });
    STORE.deleteMindmapGroup.mockResolvedValue({ current: 'groupC' });
  });

  test('switchGroup：切到新组后清空撤销栈（旧组快照不得在新组复活）', async () => {
    const MM = fixture('groupA');
    await MM.switchGroup('groupB');
    expect(MM._groupId).toBe('groupB');
    expect(MM._undoStack.reset).toHaveBeenCalledTimes(1);
  });

  test('newGroup：新建组后清空撤销栈', async () => {
    const MM = fixture('groupA');
    await MM.newGroup();
    expect(MM._undoStack.reset).toHaveBeenCalledTimes(1);
  });

  test('deleteGroup：删组载入另一份文档后清空撤销栈', async () => {
    const MM = fixture('groupA');
    await MM.deleteGroup('groupA');
    expect(MM._undoStack.reset).toHaveBeenCalledTimes(1);
  });

  test('切到当前所在的同一组是 no-op：不清栈（避免误伤）', async () => {
    const MM = fixture('groupA');
    await MM.switchGroup('groupA');
    expect(MM._undoStack.reset).not.toHaveBeenCalled();
  });
});
