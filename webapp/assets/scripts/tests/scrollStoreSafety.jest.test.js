/**
 * @jest-environment jsdom
 */
// 画中卷·打字机存储安全回归锁（对应一次系统性审查的 P1 结论）：
//  1. 索引「读取失败」与「索引不存在」必须分开处理 —— 读失败时绝不能构造空索引回写，
//     否则磁盘上全部卡片组条目会被「只含当前组」的新索引覆盖（数据文件还在，却成孤儿）。
//  2. 首启迁移必须只在目标组文件不存在时才写 —— 否则索引丢失导致迁移重跑时，
//     会把已积累的内容回滚成迁移前的旧快照（不可逆丢数据）。
//  3. 反向锁定：正常路径下索引更新依然生效（防护不能把功能整条关掉）。
const { loadModule } = require('./__helpers__/testUtils');
const { TypewriterStore } = loadModule('services/TypewriterStore.js', ['TypewriterStore']);

describe('TypewriterStore 索引读失败不覆盖磁盘索引', () => {
  let mem;
  let failGet;

  beforeEach(() => {
    mem = {};
    failGet = false;
    TypewriterStore.invalidateWritingIndex();
    global.window = global.window || {};
    global.window.storageManager = {
      getSetting: jest.fn(async (k) => {
        if (failGet) throw new Error('bridge down');
        return mem[k];
      }),
      putSetting: jest.fn(async (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); }),
      // 写作档文档（每组独立文件）
      putTypewriterWritingDoc: jest.fn(async (id, doc) => { mem[`wdoc:${id}`] = JSON.parse(JSON.stringify(doc)); }),
      getTypewriterWritingDoc: jest.fn(async (id) => mem[`wdoc:${id}`] || null),
      // 便签组文档
      putTypewriterNotesDoc: jest.fn(async (id, doc) => { mem[`ndoc:${id}`] = JSON.parse(JSON.stringify(doc)); }),
      getTypewriterNotesDoc: jest.fn(async (id) => mem[`ndoc:${id}`] || null),
      getTypewriterNotes: jest.fn(async () => []),
    };
  });

  test('索引读失败：保留磁盘上的多组索引，不回写只含当前组的新索引', async () => {
    mem['typewriter:writing-index'] = {
      version: 1,
      current: 'a',
      groups: { a: { id: 'a', title: 'A', updatedAt: 1 }, b: { id: 'b', title: 'B', updatedAt: 2 } },
    };
    TypewriterStore.invalidateWritingIndex();
    failGet = true;

    await TypewriterStore.saveWriting([{ id: 'n1' }], { x: 0, y: 0 }, [], 'c');

    // 磁盘索引纹丝不动：b 组仍在（若按旧逻辑会被覆盖成只有 c 组）
    expect(mem['typewriter:writing-index'].groups).toHaveProperty('b');
    expect(mem['typewriter:writing-index'].groups).toHaveProperty('a');
    expect(window.storageManager.putSetting).not.toHaveBeenCalledWith(
      'typewriter:writing-index',
      expect.anything()
    );
    // 文档本体仍然照常落盘（索引失败不阻断主写入）
    expect(mem['wdoc:c'].notes).toHaveLength(1);
  });

  test('索引读失败：ensureWritingIndex 返回内存占位索引，但绝不落盘', async () => {
    TypewriterStore.invalidateWritingIndex();
    failGet = true;
    const idx = await TypewriterStore.ensureWritingIndex();
    expect(idx && idx.groups).toBeTruthy();                       // 契约不变：仍返回对象
    expect(window.storageManager.putSetting).not.toHaveBeenCalled();
  });

  test('反向锁定：索引正常时，新组照常写入索引且保留既有组', async () => {
    mem['typewriter:writing-index'] = {
      version: 1,
      current: 'a',
      groups: { a: { id: 'a', title: 'A', updatedAt: 1 } },
    };
    TypewriterStore.invalidateWritingIndex();

    await TypewriterStore.saveWriting([{ id: 'n1' }], { x: 0, y: 0 }, [], 'b');

    expect(mem['typewriter:writing-index'].groups).toHaveProperty('a');
    expect(mem['typewriter:writing-index'].groups).toHaveProperty('b');
  });
});

describe('TypewriterStore 迁移不覆盖已存在的组文档（防数据回滚）', () => {
  let mem;

  beforeEach(() => {
    mem = {};
    TypewriterStore.invalidateWritingIndex();
    global.window = global.window || {};
    global.window.storageManager = {
      getSetting: jest.fn(async (k) => mem[k]),
      putSetting: jest.fn(async (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); }),
      putTypewriterNotesDoc: jest.fn(async (id, doc) => { mem[`ndoc:${id}`] = JSON.parse(JSON.stringify(doc)); }),
      getTypewriterNotesDoc: jest.fn(async (id) => mem[`ndoc:${id}`] || null),
      getTypewriterNotes: jest.fn(async () => mem.__legacyArray || []),
    };
  });

  test('default 组文档已存在：只补索引 + 清旧 key，不覆盖现有内容', async () => {
    mem[`ndoc:default`] = { version: 2, notes: [{ id: 'new1' }], links: [], canvasOffset: null };
    mem[TypewriterStore.KEY_NOTES] = { version: 2, notes: [{ id: 'old1' }] };

    const moved = await TypewriterStore._migrateLegacyNotes();

    expect(moved).toBe(true);
    // 关键：现有内容未被迁移前的旧快照回滚
    expect(mem[`ndoc:default`].notes.map((n) => n.id)).toEqual(['new1']);
    expect(mem[TypewriterStore.KEY_NOTES]).toBeNull();   // 旧 key 已清理
  });

  test('default 组文档不存在：正常迁移旧数据进独立文件', async () => {
    mem[TypewriterStore.KEY_NOTES] = { version: 2, notes: [{ id: 'old1' }] };

    const moved = await TypewriterStore._migrateLegacyNotes();

    expect(moved).toBe(true);
    expect(mem[`ndoc:default`].notes.map((n) => n.id)).toEqual(['old1']);
  });

  test('旧数据读取抛错时迁移安全返回 false，不冲穿调用方', async () => {
    window.storageManager.getSetting = jest.fn(async () => { throw new Error('bridge down'); });
    await expect(TypewriterStore._migrateLegacyNotes()).resolves.toBe(false);
  });
});
