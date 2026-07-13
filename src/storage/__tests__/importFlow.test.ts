import { describe, it, expect, beforeEach } from 'vitest';
import { VaultStorage } from '../VaultStorage';
import { createMockApp } from '../../../test/mocks/obsidian';

function makeStorage() {
  const { app, adapter } = createMockApp();
  const storage = new VaultStorage(app as any, 'bamboo-review');
  return { storage, adapter };
}

/** 构造一份"真实结构"的导出数据 */
function makeSampleData() {
  return {
    version: '3.0',
    days: {
      '2026-07-01': {
        date: '2026-07-01',
        metrics: { completedTasks: '3/5', inspirationCount: '2' },
        timeline: [{ period: 'morning', items: [{ text: 'a' }] }],
        goals: [],
      },
      '2026-07-02': {
        date: '2026-07-02',
        metrics: { completedTasks: '1/2' },
        timeline: [],
        goals: [],
      },
    },
    goals: [
      { id: 'g1', title: '目标A', items: [{ name: 'x', percent: 50 }] },
      { id: 'g2', title: '目标B' },
    ],
    settings: { theme: 'dark', balance: 100 },
    purchaseHistory: { records: [{ id: 'p1', price: 10 }] },
    incomeHistory: { records: [{ id: 'i1', amount: 20 }] },
  };
}

describe('VaultStorage 导入导出关键路径', () => {
  let ctx: ReturnType<typeof makeStorage>;

  beforeEach(() => {
    ctx = makeStorage();
  });

  it('黄金路径 overwrite：导入后与导出数据逐字段相等', async () => {
    const data = makeSampleData();
    await ctx.storage.importData(data, { strategy: 'overwrite' });

    const back = await ctx.storage.exportAllData();
    expect(back.days['2026-07-01']).toEqual(data.days['2026-07-01']);
    expect(back.days['2026-07-02']).toEqual(data.days['2026-07-02']);
    expect(back.goals).toEqual(data.goals);
    expect(back.settings).toEqual(data.settings);
    expect(back.purchaseHistory).toEqual(data.purchaseHistory);
    expect(back.incomeHistory).toEqual(data.incomeHistory);
    expect(Object.keys(back.days).length).toBe(2);
  });

  it('P0 回归 merge：导入不含 goals 的包，现有 goals 不丢', async () => {
    await ctx.storage.importData(
      { goals: [{ id: 'existing', title: '既有目标' }] },
      { strategy: 'overwrite' }
    );

    // 导入一个只有 days、没有 goals 的包（merge）
    await ctx.storage.importData(
      { days: { '2026-08-01': { date: '2026-08-01', metrics: {} } } },
      { strategy: 'merge' }
    );

    const goals = await ctx.storage.getGoals();
    expect(goals.find((g: any) => g.id === 'existing')).toBeTruthy();
  });

  it('P0 回归 merge：按 id 合并，不重复', async () => {
    await ctx.storage.importData(
      { goals: [{ id: 'a', title: '旧' }] },
      { strategy: 'overwrite' }
    );
    await ctx.storage.importData(
      { goals: [{ id: 'a', title: '新' }, { id: 'b', title: '新增' }] },
      { strategy: 'merge' }
    );

    const goals = await ctx.storage.getGoals();
    expect(goals.length).toBe(2);
    expect(goals.find((g: any) => g.id === 'a')!.title).toBe('新');
  });

  it('损坏文件经 importData 被拒绝，且不污染 Vault', async () => {
    // 先放一份正常数据
    await ctx.storage.importData(makeSampleData(), { strategy: 'overwrite' });

    const before = await ctx.storage.exportAllData();

    // 导入损坏数据（无已知字段）
    await expect(
      ctx.storage.importData({ foo: 'bar' } as any, { strategy: 'overwrite' })
    ).rejects.toThrow();

    // Vault 内容应未被损坏数据改动
    const after = await ctx.storage.exportAllData();
    expect(after.days).toEqual(before.days);
    expect(after.goals).toEqual(before.goals);
  });

  it('字段补齐：缺 date 的 day 落盘后自动补上', async () => {
    await ctx.storage.importData(
      { days: { '2026-09-01': { metrics: { completedTasks: '1/1' } } } },
      { strategy: 'overwrite' }
    );
    const day = await ctx.storage.getDay('2026-09-01');
    expect(day).not.toBeNull();
    expect((day as any).date).toBe('2026-09-01');
    expect(Array.isArray((day as any).timeline)).toBe(true);
    expect(Array.isArray((day as any).goals)).toBe(true);
  });

  it('overwrite 清空：导入空 days 应清除原有日数据', async () => {
    await ctx.storage.importData(makeSampleData(), { strategy: 'overwrite' });
    await ctx.storage.importData({ days: {} }, { strategy: 'overwrite' });

    const keys = await ctx.storage.getDayKeys();
    expect(keys.length).toBe(0);
  });
});
