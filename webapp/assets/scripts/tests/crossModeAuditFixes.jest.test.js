/**
 * @jest-environment jsdom
 */
// 跨模式体系层级审计的回归锁（三档共享层）。
//
// 1) 【数据安全】读盘失败护栏：_loadCardDoc 的 catch 吞异常后返回空 notes，
//    此前**没有**置任何失败标记 → 随后的自动落盘会用空数组覆盖磁盘真实数据。
//    索引级护栏（loadFailed）早就存在，正文这一半漏了。现在正文读失败也置位并阻断落盘。
// 2) 导图分组操作补 _switching 锁（此前只置 _docBusy，而 setMode 只认 _switching），
//    并把分组窗口内残留的 _pendingModeDir 就地丢弃。
// 3) 导图 _scheduleSave 与便签/写作用一对称：_switching 窗口内不排新的防抖落盘。
// 4) 保存失败提示不再硬编码「便签」（saveNow 同时服务 write 与 notes）。
const { loadModule } = require('./__helpers__/testUtils');

const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('services/CanvasViewport.js', 'CanvasViewport');
global.Toast = { showToast: jest.fn() };

const { TypewriterStore } = loadModule('services/TypewriterStore.js', ['TypewriterStore']);
const { ModeController } = loadModule(
  'handlers/features/ModeController.js', ['ModeController'],
  {
    ModePolicy: {
      of: () => ({ msg: '', msgMs: 0 }),
      next: (m, step) => (step > 0 ? 'write' : 'notes'),
      ownsStickers: () => false,
    },
    MindmapFeature: { switchGroup: jest.fn(), newGroup: jest.fn(), deleteGroup: jest.fn() },
    TypewriterStore: {
      getCurrentMindmapGroup: jest.fn(async () => ({ id: 'g1' })),
      ensureMindmapIndex: jest.fn(async () => ({ groups: { g1: { id: 'g1' } } })),
    },
  }
);
const { PersistenceCoordinator } = loadModule(
  'handlers/features/PersistenceCoordinator.js', ['PersistenceCoordinator']
);

/** 造一个 storageManager：getBridge 可配置为抛错（模拟桥接超时 / 读失败） */
function storageManager(over = {}) {
  return Object.assign({
    getSetting: jest.fn(async () => null),
    putSetting: jest.fn(async () => true),
    getTypewriterNotesDoc: jest.fn(async () => ({ version: 2, notes: [{ id: 'n1', text: '真实内容' }], links: [] })),
    putTypewriterNotesDoc: jest.fn(async () => true),
    getTypewriterWritingDoc: jest.fn(async () => ({ version: 2, notes: [{ id: 'w1', text: '真实草稿' }], links: [] })),
    putTypewriterWritingDoc: jest.fn(async () => true),
    getTypewriterMindmapDoc: jest.fn(async () => ({ version: 1, nodes: [], links: [] })),
    putTypewriterMindmapDoc: jest.fn(async () => true),
  }, over);
}

beforeEach(() => {
  TypewriterStore.invalidateWritingIndex();   // 复位全部失败标记与缓存
  global.Toast.showToast.mockClear();
});

// ── 1) 读盘失败 → 阻断落盘 ────────────────────────────────────────────
describe('读盘失败护栏（防空内容覆盖真实数据）', () => {
  test('便签：读取抛错 → docFailed 置位，随后 saveDoc 不再写盘', async () => {
    const sm = storageManager({
      getTypewriterNotesDoc: jest.fn(async () => { throw new Error('桥接超时'); }),
    });
    global.window.storageManager = sm;

    await TypewriterStore.loadDoc('notes');
    expect(TypewriterStore.docLoadFailed('notes')).toBe(true);

    await TypewriterStore.saveDoc('notes', [], { x: 0, y: 0 }, []);
    expect(sm.putTypewriterNotesDoc).not.toHaveBeenCalled();   // 关键：空内容没有落盘
  });

  test('便签：读取成功 → 标记清除，saveDoc 正常写盘', async () => {
    const sm = storageManager();
    global.window.storageManager = sm;
    await TypewriterStore.loadDoc('notes');
    expect(TypewriterStore.docLoadFailed('notes')).toBe(false);
    await TypewriterStore.saveDoc('notes', [{ id: 'n1', text: 'x' }], { x: 0, y: 0 }, []);
    expect(sm.putTypewriterNotesDoc).toHaveBeenCalled();
  });

  test('写作档：读取抛错 → 同样阻断落盘', async () => {
    const sm = storageManager({
      getTypewriterWritingDoc: jest.fn(async () => { throw new Error('读失败'); }),
    });
    global.window.storageManager = sm;
    await TypewriterStore.loadDoc('write');
    expect(TypewriterStore.docLoadFailed('write')).toBe(true);
    await TypewriterStore.saveDoc('write', [], { x: 0, y: 0 }, []);
    expect(sm.putTypewriterWritingDoc).not.toHaveBeenCalled();
  });

  test('思维导图：读取抛错 → saveMindmapGroupDoc 不再写盘', async () => {
    const sm = storageManager({
      getTypewriterMindmapDoc: jest.fn(async () => { throw new Error('读失败'); }),
    });
    global.window.storageManager = sm;
    await TypewriterStore.loadMindmapGroupDoc('g1');
    expect(TypewriterStore.docLoadFailed('mindmap')).toBe(true);
    const ok = await TypewriterStore.saveMindmapGroupDoc('g1', { nodes: [], links: [], view: null, style: 0 });
    expect(ok).toBe(false);
    expect(sm.putTypewriterMindmapDoc).not.toHaveBeenCalled();
  });

  test('读成功一次后自动解除封锁（不会永久卡住保存）', async () => {
    const sm = storageManager();
    global.window.storageManager = sm;
    await TypewriterStore.loadDoc('notes');
    expect(TypewriterStore.docLoadFailed('notes')).toBe(false);
    await TypewriterStore.saveDoc('notes', [{ id: 'n1', text: 'x' }], { x: 0, y: 0 }, []);
    expect(sm.putTypewriterNotesDoc).toHaveBeenCalledTimes(1);
  });
});

// ── 2) 导图分组操作的 _switching 锁 + pendingModeDir 清理 ──────────────
describe('导图分组操作：切组窗口锁 + 丢弃残留连拨', () => {
  function ctrlStub() {
    return {
      _mode: 'mindmap', _docBusy: false, _switching: false, _pendingModeDir: 2,
      _hideDocPanel: jest.fn(), _refreshDocBtnLabel: jest.fn(async () => {}),
      _renderDocPanel: jest.fn(async () => {}), _showScreenMsg: jest.fn(),
      _exitAllEdits: jest.fn(), _el: null,
    };
  }

  test('switchDocGroup(mindmap)：窗口内置 _switching，结束后复位', async () => {
    const ctrl = ctrlStub();
    let seen = null;
    global.MindmapFeature.switchGroup = jest.fn(async () => { seen = ctrl._switching; });
    await ModeController.switchDocGroup({ state: {}, ctrl }, 'mindmap', 'g2');
    expect(seen).toBe(true);                 // 切组进行中：setMode 被挡住
    expect(ctrl._switching).toBe(false);
    expect(ctrl._docBusy).toBe(false);
  });

  test('分组窗口内拨旋钮累积的净步数被就地丢弃（不残留到下次切档）', async () => {
    const ctrl = ctrlStub();
    global.MindmapFeature.switchGroup = jest.fn(async () => {});
    await ModeController.switchDocGroup({ state: {}, ctrl }, 'mindmap', 'g2');
    expect(ctrl._pendingModeDir).toBe(0);
  });

  test('createDocGroup(mindmap)：同样置锁并清理', async () => {
    const ctrl = ctrlStub();
    global.MindmapFeature.newGroup = jest.fn(async () => {});
    await ModeController.createDocGroup({ state: {}, ctrl }, 'mindmap');
    expect(ctrl._switching).toBe(false);
    expect(ctrl._pendingModeDir).toBe(0);
  });
});

// ── 3) 导图 _scheduleSave 的 _switching 守卫 ──────────────────────────
const { MindmapFeature } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);

describe('导图防抖落盘的 _switching 守卫（与便签/写作对称）', () => {
  test('切档/切组窗口内不排新的防抖落盘', () => {
    MindmapFeature._ctrl = { _switching: true };
    MindmapFeature._saveTimer = 0;
    MindmapFeature._scheduleSave();
    expect(MindmapFeature._saveTimer).toBe(0);
  });

  test('非窗口期正常排防抖落盘', () => {
    MindmapFeature._ctrl = { _switching: false };
    MindmapFeature._saveTimer = 0;
    MindmapFeature._scheduleSave();
    expect(MindmapFeature._saveTimer).not.toBe(0);
    clearTimeout(MindmapFeature._saveTimer);
    MindmapFeature._saveTimer = 0;
  });
});

// ── 4) 档位短名（保存失败提示不再一律「便签」） ─────────────────────────
describe('档位中文短名', () => {
  test('write / notes / mindmap 各自取对应名字', () => {
    expect(PersistenceCoordinator.modeLabel('write')).toBe('写作');
    expect(PersistenceCoordinator.modeLabel('notes')).toBe('便签');
    expect(PersistenceCoordinator.modeLabel('mindmap')).toBe('思维子弹');
  });
});
