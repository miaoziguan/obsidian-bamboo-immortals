import { describe, it, expect } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../VaultStorage';

/**
 * 画中卷文档「备份 / 恢复」回归测试（数据安全关键）。
 *
 * 背景：早期版本的 exportAllData() 完全不含 typewriter-writing / typewriter-notes /
 * typewriter-mindmap 里的档，导致「一键打包全部数据」名不副实，且重置前的自动备份
 * 也无法恢复画中卷数据。现已把三类文档 + 旧版单文件便签纳入备份与导入。
 */
describe('画中卷文档的备份 / 恢复', () => {
  const writingDoc = (notes: unknown[] = []) => ({ version: 1, notes, links: [], canvasOffset: null });

  it('exportAllData 应包含三类画中卷文档', async () => {
    const { app } = createMockApp();
    const storage = new VaultStorage(app as any, 'bamboo-review');

    await storage.putTypewriterWritingDoc('g1', writingDoc([{ id: 'a' }]));
    await storage.putTypewriterNotesDoc('g2', writingDoc());
    await storage.putTypewriterMindmapDoc('g3', { version: 1, nodes: [], links: [], view: null, style: 0 });

    const backup = await storage.exportAllData();

    expect(Object.keys(backup.typewriterWritingDocs ?? {})).toEqual(['g1']);
    expect(Object.keys(backup.typewriterNotesDocs ?? {})).toEqual(['g2']);
    expect(Object.keys(backup.typewriterMindmapDocs ?? {})).toEqual(['g3']);
    expect((backup.typewriterWritingDocs as Record<string, { notes: unknown[] }>).g1.notes).toHaveLength(1);
  });

  it('importData 应把备份里的画中卷文档写回磁盘，且 overwrite 先清空旧档', async () => {
    const { app } = createMockApp();
    const storage = new VaultStorage(app as any, 'bamboo-review');
    await storage.putTypewriterWritingDoc('old', writingDoc());

    await storage.importData({
      days: {},
      goals: [],
      settings: {},
      typewriterWritingDocs: { g1: writingDoc([{ id: 'x' }]) },
    });

    const back = await storage.getTypewriterWritingDoc('g1');
    expect(back).not.toBeNull();
    expect(back!.notes).toHaveLength(1);
    // overwrite 语义：旧档应被清掉，避免两批档混在一起
    expect(await storage.getTypewriterWritingDoc('old')).toBeNull();
  });

  it('旧版备份（无 typewriter 字段）导入不报错，且不动盘上画中卷数据', async () => {
    const { app } = createMockApp();
    const storage = new VaultStorage(app as any, 'bamboo-review');
    await storage.putTypewriterWritingDoc('keep', writingDoc());

    await storage.importData({ days: {}, goals: [], settings: {} });

    expect(await storage.getTypewriterWritingDoc('keep')).not.toBeNull();
  });

  it('非法文档 id（路径遍历）在导入时被丢弃，不会写出越界文件', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');

    await storage.importData({
      days: {},
      goals: [],
      settings: {},
      typewriterWritingDocs: {
        '../evil': writingDoc(),
        'ok/../x': writingDoc(),
        good: writingDoc(),
      },
    });

    const keys = Object.keys(mock.adapter.snapshot());
    expect(keys.some((k) => k.includes('evil'))).toBe(false);
    expect(keys.some((k) => k.endsWith('/x.json'))).toBe(false);
    expect(await storage.getTypewriterWritingDoc('good')).not.toBeNull();
  });

  it('merge 策略导入画中卷文档：不清空旧档，按 id 覆盖', async () => {
    const { app } = createMockApp();
    const storage = new VaultStorage(app as any, 'bamboo-review');
    await storage.putTypewriterWritingDoc('mine', writingDoc([{ id: 'mine' }]));

    await storage.importData(
      { days: {}, goals: [], settings: {}, typewriterWritingDocs: { theirs: writingDoc() } },
      { strategy: 'merge' }
    );

    expect(await storage.getTypewriterWritingDoc('mine')).not.toBeNull();   // 旧档保留
    expect(await storage.getTypewriterWritingDoc('theirs')).not.toBeNull(); // 新档写入
  });
});
