import { describe, it, expect } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../VaultStorage';

/**
 * 写前滚动备份 + 空文件自愈（数据安全）。
 *
 * 实机事故：`typewriter-writing/doc-mwg8w48jw1yu.json`（标题「测试」，创建于两天前）在
 * 重载插件的一瞬被清成 0 字节 —— `vault.process` 底层是「截断 → 重写」，不是原子操作，
 * 进程死在两步之间就留下空文件。此后每次自动保存都被「读失败暂停写入」守卫拦下，
 * 用户继续编辑的内容全部没有落盘。
 *
 * 现在的双层护栏（本文件逐条钉住）：
 *  ① 写侧：覆盖前把**当前非空内容**留一份 `.bak`（空内容不备份，避免毁掉唯一的好备份）；
 *  ② 读侧：读到空文件时若 `.bak` 有效 → 自动写回并恢复，不再把用户挡在「暂停写入」外面。
 */
const DOC_PATH = 'bamboo-review/typewriter-writing/w1.json';
const BAK_PATH = DOC_PATH + '.bak';

const docOf = (text: string) => ({
  version: 2,
  notes: [{ id: 'n1', text }],
  links: [],
  canvasOffset: null,
});

describe('写前滚动备份', () => {
  it('覆盖已有文件时，把上一版内容留到 .bak', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');

    await storage.putTypewriterWritingDoc('w1', docOf('第一版'));
    const first = await mock.adapter.read(DOC_PATH);

    await storage.putTypewriterWritingDoc('w1', docOf('第二版'));

    // 主文件是新的，.bak 是上一版
    expect(JSON.parse(await mock.adapter.read(DOC_PATH)).notes[0].text).toBe('第二版');
    expect(await mock.adapter.read(BAK_PATH)).toBe(first);
  });

  it('当前内容为空时不写 .bak —— 否则 0 字节会覆盖掉唯一的好备份', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');

    // 先攒一份有效备份
    await storage.putTypewriterWritingDoc('w1', docOf('好内容'));
    await storage.putTypewriterWritingDoc('w1', docOf('更新的内容'));
    const goodBak = await mock.adapter.read(BAK_PATH);
    expect(JSON.parse(goodBak).notes[0].text).toBe('好内容');

    // 模拟「主文件已被写坏成 0 字节」，此时若再保存，不能把 .bak 冲成空
    await mock.adapter.write(DOC_PATH, '');
    await storage.putTypewriterWritingDoc('w1', docOf('再存一次'));

    expect(await mock.adapter.read(BAK_PATH)).toBe(goodBak);
  });

  it('超过大小上限的文件不备份（避免大档翻倍 IO）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');

    await storage.putTypewriterWritingDoc('w1', docOf('小档'));
    // 手工把主文件塞成超过 64KB，然后触发一次写入
    await mock.adapter.write(DOC_PATH, 'x'.repeat(70 * 1024));
    await mock.adapter.remove(BAK_PATH);
    await storage.putTypewriterWritingDoc('w1', docOf('之后'));

    expect(await mock.adapter.exists(BAK_PATH)).toBe(false);
  });
});

describe('空文件自愈（读到 0 字节 + .bak 有效）', () => {
  it('自动用 .bak 写回主文件，并返回恢复后的数据', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');

    const saved = JSON.stringify(docOf('被中断前的最后一版'), null, 2);
    await mock.adapter.write(BAK_PATH, saved);
    await mock.adapter.write(DOC_PATH, '');            // 事故现场：主文件被清空

    const doc = await storage.getTypewriterWritingDoc('w1');

    expect(doc).not.toBeNull();
    expect((doc as any).notes[0].text).toBe('被中断前的最后一版');
    // 主文件已被写回，不再需要用户手工删文件/重启
    expect(await mock.adapter.read(DOC_PATH)).toBe(saved);
  });

  it('自愈之后可以继续保存（暂停写入标记被解除）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');
    await mock.adapter.write(BAK_PATH, JSON.stringify(docOf('旧版')));
    await mock.adapter.write(DOC_PATH, '');

    await storage.getTypewriterWritingDoc('w1');       // 触发自愈
    await storage.putTypewriterWritingDoc('w1', docOf('恢复后继续写'));

    expect(JSON.parse(await mock.adapter.read(DOC_PATH)).notes[0].text).toBe('恢复后继续写');
  });

  it('.bak 也损坏时不硬来：返回 null，并保持「暂停写入」防止覆盖', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');
    await mock.adapter.write(BAK_PATH, '{ 坏掉的备份');
    await mock.adapter.write(DOC_PATH, '');

    expect(await storage.getTypewriterWritingDoc('w1')).toBeNull();
    expect(await mock.adapter.read(DOC_PATH)).toBe('');   // 没被坏备份污染
    await expect(
      storage.putTypewriterWritingDoc('w1', docOf('不该被写进去')),
    ).rejects.toThrow(/写入被暂停/);
  });

  it('没有 .bak 时保持原行为：返回 null + 暂停写入（不谎报恢复）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');
    await mock.adapter.write(DOC_PATH, '');

    expect(await storage.getTypewriterWritingDoc('w1')).toBeNull();
    await expect(
      storage.putTypewriterWritingDoc('w1', docOf('x')),
    ).rejects.toThrow(/写入被暂停/);
  });

  it('恢复只认「主文件为空」：非空但解析失败仍走隔离留档，不用备份顶替', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');

    await mock.adapter.write(BAK_PATH, JSON.stringify(docOf('备份的旧版')));
    const broken = '{ "version": 2, "notes": [ 截断';
    await mock.adapter.write(DOC_PATH, broken);

    expect(await storage.getTypewriterWritingDoc('w1')).toBeNull();
    // 原文件一字不改（可能比备份更新），只留 .corrupt 备份
    expect(await mock.adapter.read(DOC_PATH)).toBe(broken);
    const corrupt = Object.keys(mock.adapter.snapshot()).find((k) => k.includes('.corrupt-'));
    expect(corrupt).toBeTruthy();
  });
});
