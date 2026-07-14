/**
 * UndoRedoManager 撤销/重做栈单测
 * 栈操作纯逻辑，无 DOM 依赖。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('UndoRedoManager 撤销/重做栈', () => {
  let mod;
  let mgr;

  beforeAll(() => {
    // Node < 17 无 structuredClone，polyfill（jest per-file sandbox，不会 leak）
    if (typeof globalThis.structuredClone !== 'function') {
      globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
    }
  });

  const freshState = () => ({
    data: {
      '2026-07-14': { mood: 'happy', note: 'day1' },
      '2026-07-15': { mood: 'calm', note: 'day2' },
    },
    undoStack: [],
    redoStack: [],
  });

  beforeEach(() => {
    mod = loadModule('state/undoRedoManager.js', ['UndoRedoManager']);
  });

  // ---- 基础结构 ----
  test('UndoRedoManager 类存在并可实例化', () => {
    expect(mod.UndoRedoManager).toBeDefined();
    const state = freshState();
    const instance = new mod.UndoRedoManager(state);
    expect(instance.canUndo()).toBe(false);
    expect(instance.canRedo()).toBe(false);
  });

  // ---- push ----
  test('push 后 undoStack 有记录，redoStack 被清空', () => {
    const state = freshState();
    state.redoStack.push({ key: '2026-07-10', data: {} });
    mgr = new mod.UndoRedoManager(state);

    mgr.push('2026-07-14', state.data['2026-07-14']);
    expect(state.undoStack.length).toBe(1);
    expect(state.undoStack[0].key).toBe('2026-07-14');
    expect(state.undoStack[0].data).toEqual({ mood: 'happy', note: 'day1' });
    // push 后 redoStack 被清空
    expect(state.redoStack.length).toBe(0);
  });

  test('push 使用 structuredClone 深拷贝（修改原对象不影响栈内数据）', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    const mutable = { mood: 'happy', note: 'day1' };
    mgr.push('2026-07-14', mutable);
    mutable.mood = 'changed!';

    expect(state.undoStack[0].data.mood).toBe('happy');
  });

  test('push 超过 50 条时移除最旧记录（FIFO）', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    for (let i = 0; i < 60; i++) {
      mgr.push(`2026-07-${String(i).padStart(2, '0')}`, { index: i });
    }

    expect(state.undoStack.length).toBe(50);
    // 最旧的（index 0-9）已被 shift 掉，保留 index 10-59
    expect(state.undoStack[0].data.index).toBe(10);
    expect(state.undoStack[49].data.index).toBe(59);
  });

  test('push 时回调 onChange', () => {
    const state = freshState();
    const onChange = jest.fn();
    mgr = new mod.UndoRedoManager(state, onChange);

    mgr.push('2026-07-14', state.data['2026-07-14']);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // ---- undo ----
  test('undo 从空栈返回 null', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    expect(mgr.undo('2026-07-14')).toBeNull();
  });

  test('undo 弹出上一条快照，当前数据推入 redoStack', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    mgr.push('2026-07-14', { mood: 'happy', note: 'day1' });
    mgr.push('2026-07-14', { mood: 'sad', note: 'day1-edit' });

    // state.data 模拟当前值
    state.data['2026-07-14'] = { mood: 'angry', note: 'day1-edit2' };

    const undone = mgr.undo('2026-07-14');
    expect(undone).not.toBeNull();
    expect(undone.key).toBe('2026-07-14');
    expect(undone.data.mood).toBe('sad'); // 上一条快照

    // redoStack 应保存当前的 angry
    expect(state.redoStack.length).toBe(1);
    expect(state.redoStack[0].data.mood).toBe('angry');
    expect(state.undoStack.length).toBe(1); // 还剩 happy 那条
  });

  test('undo 后回调 onChange', () => {
    const state = freshState();
    const onChange = jest.fn();
    mgr = new mod.UndoRedoManager(state, onChange);

    mgr.push('2026-07-14', { mood: 'a' });
    mgr.undo('2026-07-14');
    expect(onChange).toHaveBeenCalledTimes(2); // push + undo 各一次
  });

  // ---- redo ----
  test('redo 从空栈返回 null', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    expect(mgr.redo('2026-07-14')).toBeNull();
  });

  test('redo 弹出 redoStack 栈顶，当前数据推回 undoStack', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    mgr.push('2026-07-14', { mood: 'a' });
    mgr.push('2026-07-14', { mood: 'b' });
    state.data['2026-07-14'] = { mood: 'current' };

    mgr.undo('2026-07-14'); // undoStack: [a], redoStack: [current]
    const redone = mgr.redo('2026-07-14'); // redoStack pop → current

    expect(redone).not.toBeNull();
    expect(redone.key).toBe('2026-07-14');
    expect(redone.data.mood).toBe('current');
    // 'current' 回到 undoStack
    expect(state.undoStack.length).toBe(2);
    expect(state.redoStack.length).toBe(0);
  });

  // ---- canUndo / canRedo ----
  test('canUndo/canRedo 正确反映栈状态', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    expect(mgr.canUndo()).toBe(false);
    expect(mgr.canRedo()).toBe(false);

    mgr.push('2026-07-14', { mood: 'a' });
    expect(mgr.canUndo()).toBe(true);
    expect(mgr.canRedo()).toBe(false);

    state.data['2026-07-14'] = { mood: 'b' };
    mgr.undo('2026-07-14');
    expect(mgr.canUndo()).toBe(false); // 只有一条，undo 后 empty
    expect(mgr.canRedo()).toBe(true);

    mgr.redo('2026-07-14');
    expect(mgr.canUndo()).toBe(true);
    expect(mgr.canRedo()).toBe(false);
  });

  // ---- 边界 ----
  test('跨日期 undo/redo 不影响其他日期', () => {
    const state = freshState();
    mgr = new mod.UndoRedoManager(state);

    mgr.push('2026-07-14', { mood: 'a' });
    mgr.push('2026-07-15', { mood: 'x' });
    state.data['2026-07-14'] = { mood: 'a2' };
    state.data['2026-07-15'] = { mood: 'x2' };

    const undone = mgr.undo('2026-07-15');
    expect(undone.data.mood).toBe('x'); // 07-15 的上一条

    // redoStack 只有 x2（当前 07-15 快照），不含 07-14 的数据
    expect(state.redoStack.length).toBe(1);
    expect(state.redoStack[0].key).toBe('2026-07-15');
    expect(state.undoStack.length).toBe(1); // 只剩 07-14 的
    expect(state.undoStack[0].key).toBe('2026-07-14');
  });
});
