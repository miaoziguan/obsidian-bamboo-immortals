/**
 * @jest-environment jsdom
 */
// 落盘链加固的回归锁（数据安全）：
//  ① 结构性变更走 flushSave：跳过 350ms 防抖立即写盘（硬杀窗口从「一次操作」缩到「一次写」）；
//  ② 所有落盘出口串行排队（防抖 / 立即 / 切档前持久化），避免并发写同一文件时
//     「后完成的旧内容」覆盖「先完成的新内容」；
//  ③ 写入失败**绝不降级**到旧单文档 key（typewriter:notes）——那条降级只服务于「宿主没有桥」。
const { loadModule } = require('./__helpers__/testUtils');

const PersistenceCoordinator = loadModule(
  'handlers/features/PersistenceCoordinator.js', ['PersistenceCoordinator']
).PersistenceCoordinator;

function mkCtx(overrides) {
  const ctrl = Object.assign({
    _mode: 'notes',
    _switching: false,
    _saveTimer: null,
    _showSaveFailed: jest.fn(),
    _saveNow: null,
    _collectNotes: () => [{ id: 'a', text: 't' }],
    _canvasOffset: { x: 0, y: 0 },
  }, overrides || {});
  return { state: {}, ctrl };
}

describe('落盘串行链', () => {
  test('flushSave 跳过防抖：不挂 _saveTimer，立即执行', async () => {
    const calls = [];
    const ctx = mkCtx({ _saveNow: async () => { calls.push('save'); } });
    PersistenceCoordinator.flushSave(ctx);
    expect(ctx.ctrl._saveTimer).toBeNull();     // 没有挂起防抖定时器
    await PersistenceCoordinator._saveChain;
    expect(calls).toEqual(['save']);
  });

  test('连续 flushSave 串行执行，不并发写同一文件', async () => {
    let running = 0;
    let maxParallel = 0;
    const order = [];
    const ctx = mkCtx({
      _saveNow: async () => {
        running += 1;
        maxParallel = Math.max(maxParallel, running);
        await Promise.resolve();
        order.push(running);
        running -= 1;
      },
    });

    PersistenceCoordinator.flushSave(ctx);
    PersistenceCoordinator.flushSave(ctx);
    await PersistenceCoordinator._saveChain;

    expect(maxParallel).toBe(1);                // 任一时刻最多一个写在跑
    expect(order.length).toBe(2);
  });

  test('切档窗口内 flushSave 直接丢弃（不写新档 key）', async () => {
    const save = jest.fn();
    const ctx = mkCtx({ _switching: true, _saveNow: save });
    await PersistenceCoordinator.flushSave(ctx);
    expect(save).not.toHaveBeenCalled();
  });

  test('单次落盘失败不影响后续排队的任务', async () => {
    let n = 0;
    const ctx = mkCtx({
      _saveNow: async () => { n += 1; if (n === 1) throw new Error('boom'); },
    });
    PersistenceCoordinator.flushSave(ctx);
    PersistenceCoordinator.flushSave(ctx);
    await PersistenceCoordinator._saveChain;
    expect(n).toBe(2);                          // 第二个任务照常执行
    expect(ctx.ctrl._showSaveFailed).toHaveBeenCalled();
  });
});

describe('写入失败不降级到旧 key', () => {
  let TypewriterStore;
  let storage;

  beforeEach(() => {
    storage = {
      getSetting: jest.fn(async (k) => (
        k === 'typewriter:notes-index'
          ? { version: 1, current: 'g1', groups: { g1: { id: 'g1', title: '组' } } }
          : null
      )),
      putSetting: jest.fn(async () => {}),
      putTypewriterNotesDoc: jest.fn(async () => { throw new Error('写入被暂停'); }),
    };
    global.window = global.window || {};
    global.window.storageManager = storage;
    TypewriterStore = loadModule('services/TypewriterStore.js', ['TypewriterStore']).TypewriterStore;
    TypewriterStore.invalidateWritingIndex();
  });

  test('桥存在但写入失败 → 抛错，且不写 typewriter:notes', async () => {
    await expect(
      TypewriterStore.saveDoc('notes', [{ id: 'a', text: 't' }], { x: 0, y: 0 }, [])
    ).rejects.toThrow(/写入被暂停/);

    const keys = storage.putSetting.mock.calls.map((c) => c[0]);
    // 关键：数据没被塞进旧单文档 key（否则用户读新文件仍是空、却以为丢了）
    expect(keys).not.toContain('typewriter:notes');
    expect(keys).not.toContain('typewriter:notes:bak');
  });
});
