import { describe, it, expect, beforeEach } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../../storage/VaultStorage';

describe('VaultStorage 存储操作', () => {
  let storage: VaultStorage;

  beforeEach(async () => {
    const { app } = createMockApp();
    storage = new VaultStorage(app as any, 'bamboo-review');
    await storage.ensureStructure();
  });

  it('ensureStructure 创建 data 和 reviews 目录', async () => {
    const day = {
      date: '2026-07-13',
      metrics: { completedTasks: '3/5' },
      timeline: [],
      goals: [],
    } as const;
    await storage.putDay(day as any);
    const result = await storage.getDay('2026-07-13');
    expect(result).not.toBeNull();
    expect(result!.date).toBe('2026-07-13');
  });

  it('putDay 和 getDay 基本读写', async () => {
    const day = {
      date: '2026-07-14',
      metrics: { completedTasks: '1/2', inspirationCount: '3' },
      timeline: [{ period: 'morning', name: '晨间', time: '06:00-08:00', items: [] }],
      goals: [],
    } as const;
    await storage.putDay(day as any);
    const result = await storage.getDay('2026-07-14');
    expect(result).not.toBeNull();
    expect(result!.metrics!.completedTasks).toBe('1/2');
    expect(result!.timeline![0].period).toBe('morning');
  });

  it('getDay 对不存在的日期返回 null', async () => {
    const result = await storage.getDay('2099-01-01');
    expect(result).toBeNull();
  });

  it('deleteDay 删除已存在日期', async () => {
    await storage.putDay({
      date: '2026-07-15',
      metrics: { completedTasks: '0/0' },
      timeline: [],
      goals: [],
    } as any);
    await storage.deleteDay('2026-07-15');
    const result = await storage.getDay('2026-07-15');
    expect(result).toBeNull();
  });

  it('goals 读写', async () => {
    const goals = [
      { id: 'g1', title: '目标一', items: [] },
      { id: 'g2', title: '目标二', items: [{ name: '子任务', percent: 50 }] },
    ];
    await storage.putGoals(goals);
    const result = await storage.getGoals();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('g1');
  });

  it('settings 读写', async () => {
    await storage.putSetting('theme', 'dark');
    const theme = await storage.getSetting('theme');
    expect(theme).toBe('dark');
  });

  it('getAllSettings 返回空对象当文件不存在', async () => {
    const settings = await storage.getAllSettings();
    expect(settings).toEqual({});
  });

  it('exportAllData 包含所有数据', async () => {
    await storage.putDay({
      date: '2026-07-16',
      metrics: { completedTasks: '5/5' },
      timeline: [],
      goals: [],
    } as any);
    await storage.putGoals([{ id: 'g1', title: '测试目标', items: [] }]);
    await storage.putSetting('balance', 100);

    const exported = await storage.exportAllData();
    expect(exported.version).toBe('3.0');
    expect(exported.days['2026-07-16']).toBeDefined();
    expect(exported.goals![0].id).toBe('g1');
    expect(exported.settings!.balance).toBe(100);
  });

  it('clearAll 清空所有数据', async () => {
    await storage.putDay({
      date: '2026-07-17',
      metrics: { completedTasks: '1/1' },
      timeline: [],
      goals: [],
    } as any);
    await storage.clearAll();
    const keys = await storage.getDayKeys();
    expect(keys).toHaveLength(0);
  });
});
