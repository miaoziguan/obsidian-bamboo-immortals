import { describe, it, expect, beforeEach } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../../storage/VaultStorage';
import type { DayData, GoalItem } from '../../types/data';

/**
 * VaultStorage 集成测试（基于内存 obsidian mock）。
 * 锁定：日数据读写/分页、目标读写、设置读写、删除与清空。
 */
describe('VaultStorage 数据读写', () => {
  let storage: VaultStorage;

  beforeEach(() => {
    const mock = createMockApp();
    storage = new VaultStorage(mock.app as any, 'bamboo-review');
  });

  const makeDay = (date: string, note = 'ok'): DayData =>
    ({ date, weekday: '周三', note, metrics: {}, timeline: [] } as unknown as DayData);

  it('putDay → getDay 往返保留字段', async () => {
    const day = makeDay('2026-07-13', '今天不错');
    await storage.putDay(day);
    const back = await storage.getDay('2026-07-13');
    expect(back).not.toBeNull();
    expect(back!.date).toBe('2026-07-13');
    expect((back as any).note).toBe('今天不错');
  });

  it('getDay 对不存在日期返回 null', async () => {
    expect(await storage.getDay('1999-01-01')).toBeNull();
  });

  it('putDay 缺少 date 抛错', async () => {
    await expect(storage.putDay({} as DayData)).rejects.toThrow(/date/);
  });

  it('getAllDays 汇总所有日数据', async () => {
    await storage.putDay(makeDay('2026-07-13'));
    await storage.putDay(makeDay('2026-07-14'));
    const all = await storage.getAllDays();
    expect(Object.keys(all).sort()).toEqual(['2026-07-13', '2026-07-14']);
  });

  it('getDayKeys 按日期降序', async () => {
    await storage.putDay(makeDay('2026-07-11'));
    await storage.putDay(makeDay('2026-07-13'));
    await storage.putDay(makeDay('2026-07-12'));
    expect(await storage.getDayKeys()).toEqual(['2026-07-13', '2026-07-12', '2026-07-11']);
  });

  it('getDaysPaginated 分页 + hasMore', async () => {
    for (let i = 1; i <= 5; i++) {
      await storage.putDay(makeDay(`2026-07-0${i}`));
    }
    const page0 = await storage.getDaysPaginated(0, 2);
    expect(page0.total).toBe(5);
    expect(Object.keys(page0.days).length).toBe(2);
    expect(page0.hasMore).toBe(true);
    const page2 = await storage.getDaysPaginated(2, 2); // 第 3 页
    expect(Object.keys(page2.days).length).toBe(1);
    expect(page2.hasMore).toBe(false);
  });

  it('putGoals → getGoals 往返', async () => {
    const goals: GoalItem[] = [
      { id: 'g1', title: '读书', subItems: [], category: '学习' } as GoalItem,
    ];
    await storage.putGoals(goals);
    const back = await storage.getGoals();
    expect(back).toHaveLength(1);
    expect(back[0].id).toBe('g1');
  });

  it('getGoals 无文件时返回空数组', async () => {
    expect(await storage.getGoals()).toEqual([]);
  });

  it('putSetting → getSetting 读写', async () => {
    await storage.putSetting('theme', 'bamboo');
    expect(await storage.getSetting('theme')).toBe('bamboo');
  });

  it('deleteDay 移除指定日数据', async () => {
    await storage.putDay(makeDay('2026-07-13'));
    await storage.deleteDay('2026-07-13');
    expect(await storage.getDay('2026-07-13')).toBeNull();
  });

  it('clearAll 清空整个存储', async () => {
    await storage.putDay(makeDay('2026-07-13'));
    await storage.putGoals([{ id: 'g1' } as GoalItem]);
    await storage.clearAll();
    expect(await storage.getDay('2026-07-13')).toBeNull();
    expect(await storage.getGoals()).toEqual([]);
  });

  it('H11 getGoals：文件内容非数组（损坏）时返回 [] 不抛错', async () => {
    const path = (storage as any).goalsPath();
    await (storage as any).app.vault.adapter.write(path, '{"not":"an array"}');
    const back = await storage.getGoals();
    expect(Array.isArray(back)).toBe(true);
    expect(back).toEqual([]);
  });
});

describe('VaultStorage putDay 写守卫：空壳不覆盖真实内容（时间线/待办丢失根因）', () => {
  let storage: VaultStorage;
  beforeEach(() => {
    storage = new VaultStorage(createMockApp().app as any, 'bamboo-review');
  });

  const dayWithTimeline = (date: string): DayData =>
    ({
      date,
      weekday: '周三',
      metrics: {},
      timeline: [
        { period: 'lateNight', items: [{ id: 'a', text: '写作' }, { id: 'b', text: '阅读' }] },
        { period: 'morning', items: [{ id: 'c', text: '梳理章节' }] },
      ],
    } as unknown as DayData);

  const emptyShell = (date: string): DayData =>
    ({ date, weekday: '周三', metrics: {}, timeline: [] } as unknown as DayData);

  it('空壳(score=0) 不覆盖磁盘上有时间线内容的当日文件', async () => {
    await storage.putDay(dayWithTimeline('2026-07-24'));
    // 模拟启动/天气回调写回空壳
    await storage.putDay(emptyShell('2026-07-24'));
    const back = await storage.getDay('2026-07-24');
    expect(back).not.toBeNull();
    expect(Array.isArray(back!.timeline)).toBe(true);
    // 时间线仍在，未被空壳覆盖
    expect(back!.timeline!.length).toBe(2);
  });

  it('空壳不覆盖仅有 goalTaskCompletions(待办勾选) 的当日文件', async () => {
    const dayWithCompletions = {
      date: '2026-07-24', weekday: '周三', metrics: {}, timeline: [],
      goalTaskCompletions: { g1: { '0': true, '1': false } },
    } as unknown as DayData;
    await storage.putDay(dayWithCompletions);
    await storage.putDay(emptyShell('2026-07-24'));
    const back = await storage.getDay('2026-07-24');
    expect((back as any).goalTaskCompletions).toBeDefined();
    expect((back as any).goalTaskCompletions.g1['0']).toBe(true);
  });

  it('纯天气写入(无时间线/待办)视为空壳，不覆盖有内容的当日文件', async () => {
    await storage.putDay(dayWithTimeline('2026-07-24'));
    const weatherOnly = {
      date: '2026-07-24', weekday: '周三', metrics: {}, timeline: [],
      weather: { temperature: 30, weatherCode: 1, label: '晴', fetchedAt: Date.now() },
    } as unknown as DayData;
    await storage.putDay(weatherOnly);
    const back = await storage.getDay('2026-07-24');
    expect(back!.timeline!.length).toBe(2);
  });

  it('部分内容(仍非空)可正常覆盖：取消一个待办后仍保留 key，不被拦截', async () => {
    const before = {
      date: '2026-07-24', weekday: '周三', metrics: {}, timeline: [],
      goalTaskCompletions: { g1: { '0': true, '1': true } },
    } as unknown as DayData;
    await storage.putDay(before);
    const after = {
      date: '2026-07-24', weekday: '周三', metrics: {}, timeline: [],
      goalTaskCompletions: { g1: { '0': true, '1': false } }, // 取消一个，仍有内容
    } as unknown as DayData;
    await storage.putDay(after);
    const back = await storage.getDay('2026-07-24');
    expect((back as any).goalTaskCompletions.g1['1']).toBe(false);
  });

  it('空壳可写入不存在的当日文件（全新一天，无内容可丢）', async () => {
    await storage.putDay(emptyShell('2026-07-25'));
    const back = await storage.getDay('2026-07-25');
    expect(back).not.toBeNull();
    expect(back!.date).toBe('2026-07-25');
  });
});
