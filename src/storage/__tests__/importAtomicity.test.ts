import { describe, it, expect } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../VaultStorage';

/**
 * 导入原子性回归测试（数据安全关键）。
 *
 * 背景：overwrite 导入旧实现是「先清后写」——先 rmdir 整个 data 目录，再逐条写回。
 * 中途任何失败（磁盘满 / 插件重载 / 某天数据异常）都会留下
 * 「旧数据已删、新数据未写完」的**净丢失**状态。
 * 现改为「先写后清」：先把新数据全部写入（同名自然覆盖），再删备份里没有的旧文件。
 * 中途失败的最坏结果降级为「新旧混合、一条不丢」。
 */
describe('导入的原子性（先写后清）', () => {
  const day = (date: string, note = 'ok') => ({ date, weekday: '周三', note, metrics: {}, timeline: [] }) as any;

  it('overwrite 导入中途失败：旧数据不会被删（关键断言）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await storage.putDay(day('2026-01-01', '旧数据'));

    // 让导入在写第二天时失败（模拟磁盘满 / 中断）。
    // 注入点选 vault.process / vault.create：低层 adapter.write 在测试桩里未被 await，
    // 从那里抛错会变成"未处理拒绝"而 importData 实际已 resolve，测不到想测的语义。
    const realProcess = mock.app.vault.process;
    const realCreate = mock.app.vault.create;
    let calls = 0;
    mock.app.vault.process = async (file: unknown, fn: (d: string) => string) => {
      calls++;
      if (calls === 2) throw new Error('disk full');
      return realProcess(file, fn);
    };
    mock.app.vault.create = async (p: string, c: string) => {
      calls++;
      if (calls === 2) throw new Error('disk full');
      return realCreate(p, c);
    };

    await expect(
      storage.importData({
        days: { '2026-01-01': day('2026-01-01', '新数据'), '2026-01-02': day('2026-01-02') },
        goals: [],
        settings: {},
      })
    ).rejects.toThrow(/disk full/);

    // 旧实现此处会先 rmdir(data) → 01-01 已被删，只剩半截新数据
    const back = await storage.getDay('2026-01-01');
    expect(back).not.toBeNull();
    expect(back!.note).toBe('新数据'); // 已写入的那部分也保留了
  });

  it('overwrite 导入成功：备份里没有的旧文件会被清掉', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await storage.putDay(day('2026-01-01'));
    await storage.putDay(day('2026-01-09')); // 备份里没有这一天

    await storage.importData({ days: { '2026-01-01': day('2026-01-01', '恢复') }, goals: [], settings: {} });

    expect((await storage.getDay('2026-01-01'))!.note).toBe('恢复');
    expect(await storage.getDay('2026-01-09')).toBeNull(); // 旧档已清
  });

  it('overwrite 导入空 days = 清空全部日数据（语义不变）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await storage.putDay(day('2026-01-01'));
    await storage.putDay(day('2026-01-02'));

    await storage.importData({ days: {}, goals: [], settings: {} });

    expect(Object.keys(await storage.getAllDays())).toHaveLength(0);
  });

  it('merge 策略不清除任何旧文件', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await storage.putDay(day('2026-01-01', '我的'));

    await storage.importData(
      { days: { '2026-01-02': day('2026-01-02', '他的') }, goals: [], settings: {} },
      { strategy: 'merge' }
    );

    expect((await storage.getDay('2026-01-01'))!.note).toBe('我的');
    expect((await storage.getDay('2026-01-02'))!.note).toBe('他的');
  });

  it('画中卷文档 overwrite 导入同样先写后清（中断不丢旧档）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await storage.putTypewriterWritingDoc('old', { version: 1, notes: [{ id: 'old' }], links: [], canvasOffset: null } as any);

    const realCreate = mock.app.vault.create;
    let calls = 0;
    mock.app.vault.create = async (p: string, c: string) => {
      calls++;
      if (calls === 2) throw new Error('disk full');
      return realCreate(p, c);
    };

    await expect(
      storage.importData({
        days: {}, goals: [], settings: {},
        typewriterWritingDocs: {
          old: { version: 1, notes: [{ id: 'new' }], links: [], canvasOffset: null },
          fresh: { version: 1, notes: [], links: [], canvasOffset: null },
        },
      })
    ).rejects.toThrow(/disk full/);

    // 旧档必须还在（先写后清：删除发生在全部写入成功之后）
    expect(await storage.getTypewriterWritingDoc('old')).not.toBeNull();
  });
});
