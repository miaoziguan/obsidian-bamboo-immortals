import { describe, it, expect } from 'vitest';
import { createMockApp, MemoryAdapter } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../VaultStorage';

/**
 * 0 字节文件事故回归（数据安全）。
 *
 * 实机事故：`note-mvryydkde4k9.json`（某个便签组）在盘上变成 0 字节，下次打开时
 * `JSON.parse('')` 抛错 → 被当作「文件损坏」隔离（备份同样是 0 字节）+ 删除原文件，
 * 用户看到「数据损坏」，而真实内容在写入失败那一刻就已经没了。
 *
 * 三条护栏（本文件逐条钉住）：
 *  ① 写侧：doc 非法 / 内容为空一律拒绝，绝不落盘；
 *  ② 写侧：新建文件失败时清掉 0 字节残件，不留「下次被误判成损坏」的地雷；
 *  ③ 读侧：空文件不判损坏、不隔离、不删原文件，改为「上次保存未完成」并暂停写入。
 */
const NOTES_PATH = 'bamboo-review/typewriter-notes/g1.json';

describe('画中卷文档：空内容 / 非法参数不落盘', () => {
  it('doc 为 undefined → 拒绝写入，盘上不产生文件', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');

    await expect(storage.putTypewriterNotesDoc('g1', undefined)).rejects.toThrow(/invalid-doc/);
    expect(await mock.adapter.exists(NOTES_PATH)).toBe(false);
  });

  it('doc 为数组 / null → 同样拒绝（不产生 0 字节占位）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');

    await expect(storage.putTypewriterNotesDoc('g1', [] as any)).rejects.toThrow(/invalid-doc/);
    await expect(storage.putTypewriterNotesDoc('g1', null as any)).rejects.toThrow(/invalid-doc/);
    expect(await mock.adapter.exists(NOTES_PATH)).toBe(false);
  });

  it('思维子弹 / 写作档同样受校验保护', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');

    await expect(storage.putTypewriterMindmapDoc('m1', undefined)).rejects.toThrow(/invalid-doc/);
    await expect(storage.putTypewriterWritingDoc('w1', undefined)).rejects.toThrow(/invalid-doc/);
  });

  it('新建文件失败（create 建出空文件后抛错）→ 清理残件，不留 0 字节地雷', async () => {
    const adapter = new MemoryAdapter();
    const app = {
      vault: {
        adapter,
        getAbstractFileByPath: () => null,
        process: async () => {},
        // 模拟真实 Obsidian：create 先建文件、再写内容；中途失败会留下 0 字节残件
        create: async (p: string) => {
          await adapter.write(p, '');
          throw new Error('create failed');
        },
      },
    };
    const storage = new VaultStorage(app as any, 'bamboo-review');

    await expect(
      storage.putTypewriterNotesDoc('g1', { version: 2, notes: [], links: [] }),
    ).rejects.toThrow(/create failed/);
    expect(await adapter.exists(NOTES_PATH)).toBe(false);
  });
});

describe('画中卷文档：空文件按「上次保存未完成」处理，不判损坏', () => {
  it('读到 0 字节 → 返回 null，不产生 .corrupt 备份，也不删除原文件', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-notes');
    await mock.adapter.write(NOTES_PATH, '');

    expect(await storage.getTypewriterNotesDoc('g1')).toBeNull();

    const keys = Object.keys(mock.adapter.snapshot());
    expect(keys.some((k) => k.includes('.corrupt-'))).toBe(false);   // 不再谎称「已备份」
    expect(await mock.adapter.exists(NOTES_PATH)).toBe(true);        // 原文件留给「文件恢复」
    expect(await mock.adapter.read(NOTES_PATH)).toBe('');
  });

  it('空文件读过后禁止写入（避免空档被自动保存覆盖成「看起来正常的空组」）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-notes');
    await mock.adapter.write(NOTES_PATH, '');

    await storage.getTypewriterNotesDoc('g1');                       // 读一次 → 进入「暂停写入」态
    await storage.putTypewriterNotesDoc('g1', { version: 2, notes: [], links: [] });

    expect(await mock.adapter.read(NOTES_PATH)).toBe('');            // 未被覆盖
  });

  it('用户按提示删掉空文件后，写入自动解除暂停（无需重启插件）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-notes');
    await mock.adapter.write(NOTES_PATH, '');

    await storage.getTypewriterNotesDoc('g1');                       // 读空文件 → 进入暂停态
    await mock.adapter.remove(NOTES_PATH);                           // 用户手动删掉空文件
    await storage.putTypewriterNotesDoc('g1', { version: 2, notes: [], links: [] });

    expect(await mock.adapter.exists(NOTES_PATH)).toBe(true);        // 已恢复保存
    expect(JSON.parse(await mock.adapter.read(NOTES_PATH)).notes).toEqual([]);
  });

  it('真正的损坏（非空又解析不出）仍然隔离留档，一个字节都不改', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-notes');
    const broken = '{ "version": 2, "notes": [ 被截断';
    await mock.adapter.write(NOTES_PATH, broken);

    expect(await storage.getTypewriterNotesDoc('g1')).toBeNull();

    const backup = Object.keys(mock.adapter.snapshot()).find((k) => k.includes('.corrupt-'));
    expect(backup).toBeTruthy();
    expect(await mock.adapter.read(backup!)).toBe(broken);           // 内容一字不改
    expect(await mock.adapter.exists(NOTES_PATH)).toBe(false);       // 规范路径腾空
  });
});
