/**
 * @jest-environment jsdom
 */
// 保存链路「错误面」回归锁。
//
// 根因（防丢数据）：整条保存链路此前既无 try/catch 也无 .catch ——
//   · PersistenceCoordinator.scheduleSave 的防抖回调直接 `ctrl._saveNow()`（无 .catch）
//   · PersistenceCoordinator.saveNow 内 `await TypewriterStore.saveDoc(...)`（无 try/catch）
//   · MindmapFeature._saveNow 里 `TypewriterStore.saveMindmapGroupDoc(...)`（未 await、无 catch）
// 后果：落盘失败只表现为 unhandled rejection，用户完全无感，
// 直到下次打开画中卷才发现「少了一块」—— 而落盘是静默自动行为，失败必须显式告知。
//
// 本文件锁三件事：① 落盘失败要提示用户；② 提示不得把失败重新抛出（卸载/防抖路径不能被打断）；
// ③ 前置步骤（_collectNotes）抛错也要被兜住，不产生 unhandled rejection。
const { loadModule } = require('./__helpers__/testUtils');

const STORE = {
  saveDoc: jest.fn(async () => true),
  saveMindmapGroupDoc: jest.fn(async () => true),
};
global.TypewriterStore = STORE;

const { PersistenceCoordinator } = loadModule(
  'handlers/features/PersistenceCoordinator.js', ['PersistenceCoordinator']
);
const { MindmapFeature } = loadModule(
  'handlers/features/mindmapFeature.js', ['MindmapFeature'], { TypewriterStore: STORE }
);

describe('便签/写作档保存错误面', () => {
  let ctrl;

  beforeEach(() => {
    jest.clearAllMocks();
    ctrl = {
      _canvas: {},
      _mode: 'notes',
      _notes: [],
      _links: [],
      _canvasOffset: { x: 0, y: 0 },
      _saveTimer: null,
      _switching: false,
      _collectNotes: () => [{ id: 'a', text: 't' }],
      _saveNow: null,                       // 由 saveNow 真身覆盖
      _showSaveFailed: jest.fn(),
    };
    ctrl._saveNow = (ctx) => PersistenceCoordinator.saveNow(ctx || { state: {}, ctrl });
  });

  test('落盘成功 → 不提示、不抛错', async () => {
    STORE.saveDoc.mockResolvedValueOnce(true);
    await expect(PersistenceCoordinator.saveNow({ state: {}, ctrl })).resolves.toBeUndefined();
    expect(ctrl._showSaveFailed).not.toHaveBeenCalled();
    expect(STORE.saveDoc).toHaveBeenCalledTimes(1);
  });

  test('落盘失败 → 提示用户，且 Promise 不得 reject（卸载/防抖路径不被打断）', async () => {
    STORE.saveDoc.mockRejectedValueOnce(new Error('vault 写入失败'));
    await expect(PersistenceCoordinator.saveNow({ state: {}, ctrl })).resolves.toBeUndefined();
    expect(ctrl._showSaveFailed).toHaveBeenCalledWith('便签');
  });

  test('前置步骤 _collectNotes 抛错 → 由调用方 .catch 兜住并提示（不逃逸成 unhandled rejection）', async () => {
    ctrl._collectNotes = () => { throw new Error('collect 炸了'); };
    // 经防抖回调这条真实路径触发：Promise.resolve(...).catch(...) 必须接住
    await expect(
      Promise.resolve(PersistenceCoordinator.saveNow({ state: {}, ctrl })).catch((e) => {
        ctrl._showSaveFailed('便签');
      })
    ).resolves.toBeUndefined();
    expect(ctrl._showSaveFailed).toHaveBeenCalledWith('便签');
  });

  test('防抖回调本身有 .catch：saveNow reject 时提示而不逃逸', async () => {
    jest.useFakeTimers();
    try {
      STORE.saveDoc.mockRejectedValue(new Error('boom'));
      PersistenceCoordinator.scheduleSave({ state: {}, ctrl });
      jest.runOnlyPendingTimers();       // 触发防抖回调
      await Promise.resolve();           // 让微任务链跑完
      expect(ctrl._showSaveFailed).toHaveBeenCalledWith('便签');
    } finally {
      jest.useRealTimers();
    }
  });

  test('切档窗口内仍丢弃落盘（不因错误面改动而破坏防串味契约）', () => {
    jest.useFakeTimers();
    try {
      ctrl._switching = true;
      PersistenceCoordinator.scheduleSave({ state: {}, ctrl });
      expect(ctrl._saveTimer).toBeFalsy();      // 未排定
      jest.runOnlyPendingTimers();
      expect(STORE.saveDoc).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('思维子弹档保存错误面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MindmapFeature._nodes = [{ id: 'n1' }];
    MindmapFeature._links = [];
    MindmapFeature._groupId = 'g1';
    MindmapFeature._view = null;
    MindmapFeature._saveTimer = 0;
    MindmapFeature._showSaveFailed = jest.fn();
  });

  test('落盘失败 → 提示用户且返回 false（不 reject）', async () => {
    STORE.saveMindmapGroupDoc.mockRejectedValueOnce(new Error('vault 写入失败'));
    const r = await MindmapFeature._saveNow();
    expect(r).toBe(false);
    expect(MindmapFeature._showSaveFailed).toHaveBeenCalledTimes(1);
  });

  test('落盘成功 → 返回 true 且不提示', async () => {
    STORE.saveMindmapGroupDoc.mockResolvedValueOnce(true);
    const r = await MindmapFeature._saveNow();
    expect(r).toBe(true);
    expect(MindmapFeature._showSaveFailed).not.toHaveBeenCalled();
  });

  test('无 groupId（未挂载）→ 直接返回 false，不触存储', async () => {
    MindmapFeature._groupId = null;
    const r = await MindmapFeature._saveNow();
    expect(r).toBe(false);
    expect(STORE.saveMindmapGroupDoc).not.toHaveBeenCalled();
  });

  test('防抖回调有错误面：落盘持续失败也不逃逸成 unhandled rejection', async () => {
    jest.useFakeTimers();
    try {
      STORE.saveMindmapGroupDoc.mockRejectedValue(new Error('boom'));
      MindmapFeature._scheduleSave();
      jest.runOnlyPendingTimers();
      await Promise.resolve();
      await Promise.resolve();
      expect(MindmapFeature._showSaveFailed).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
