import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('部分写入(磁盘子集) 合并而非覆盖：incoming 含磁盘没有的新条目，磁盘独有条目也被保留', async () => {
    // 先写入磁盘：lateNight[a] + morning[b]
    const onDisk = {
      date: '2026-07-26', weekday: '周日', metrics: {},
      timeline: [
        { period: 'lateNight', items: [{ id: 'a', text: '字库岩茶体' }] },
        { period: 'morning', items: [{ id: 'b', text: '阅读书籍' }] },
      ],
    } as unknown as DayData;
    await storage.putDay(onDisk);
    // 内存态退化：只拿到 lateNight[c]（与磁盘 a 不同），若整文件替换会丢 a 与 b
    const partial = {
      date: '2026-07-26', weekday: '周日', metrics: {},
      timeline: [
        { period: 'lateNight', items: [{ id: 'c', text: '字库轻风体' }] },
      ],
    } as unknown as DayData;
    await storage.putDay(partial);
    const back = await storage.getDay('2026-07-26');
    const allItems = (back!.timeline as any[]).flatMap((p) => p.items ?? []);
    // 并集：a、b（磁盘独有）保留，c（本次新）也写入，共 3 条，不丢不重
    expect(allItems.length).toBe(3);
    const texts = allItems.map((it: any) => it.text).sort();
    expect(texts).toEqual(['字库岩茶体', '字库轻风体', '阅读书籍']);
  });

  it('部分写入合并目标勾选：incoming 仅含 g1 且取消 g1.1，磁盘含 g1+g2 → g1 改动生效且 g2 保留', async () => {
    const onDisk = {
      date: '2026-07-27', weekday: '周一', metrics: {}, timeline: [],
      goalTaskCompletions: { g1: { '0': true, '1': true }, g2: { '0': true } },
    } as unknown as DayData;
    await storage.putDay(onDisk);
    const partial = {
      date: '2026-07-27', weekday: '周一', metrics: {}, timeline: [],
      goalTaskCompletions: { g1: { '0': true, '1': false } }, // 取消 g1.1，且未提及 g2
    } as unknown as DayData;
    await storage.putDay(partial);
    const gtc = (await storage.getDay('2026-07-27'))!.goalTaskCompletions as any;
    expect(gtc.g1['1']).toBe(false); // 本次改动生效
    expect(gtc.g2['0']).toBe(true);  // 磁盘独有 key 被合并保留
  });

  it('磁盘文件损坏时，本次有内容仍正常写入且不抛错（不丢本次、不冒险读损坏文件）', async () => {
    // 手工写入损坏 JSON 到日文件路径
    await (storage as any).vaultWrite((storage as any).dayPath('2026-07-28'), '{ bad json');
    const incoming = {
      date: '2026-07-28', weekday: '周二', metrics: {},
      timeline: [{ period: 'morning', items: [{ id: 'x', text: '晨间打卡' }] }],
    } as unknown as DayData;
    await expect(storage.putDay(incoming)).resolves.toBeUndefined();
    const back = await storage.getDay('2026-07-28');
    expect((back!.timeline as any[]).length).toBe(1);
  });
});

describe('VaultStorage goals 损坏容错：截断 JSON 不再连锁抛错（A7）', () => {
  let storage: VaultStorage;
  let mock: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    mock = createMockApp();
    storage = new VaultStorage(mock.app as any, 'bamboo-review');
  });

  // 模拟写入中途被截断：合法 JSON 的前缀
  const TRUNCATED = '{"goals":[{"id":"g1","title":"读';
  const STAMP = '20261006-153012';

  /** 备份文件名含本地时间戳，固定系统时间以便断言 */
  const frozen = async <T>(fn: () => Promise<T>): Promise<T> => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 6, 15, 30, 12));
    try {
      return await fn();
    } finally {
      vi.useRealTimers();
    }
  };

  it('getGoals：截断 JSON 返回 [] 而非抛 SyntaxError（旧实现直接抛，拖垮导出/导入/诊断）', async () => {
    const path = (storage as any).goalsPath();
    await mock.adapter.write(path, TRUNCATED);
    await frozen(async () => {
      await expect(storage.getGoals()).resolves.toEqual([]);
    });
  });

  it('getGoals：损坏原文件被一字不改地备份为 goals.json.corrupt-<ts>，规范路径腾空', async () => {
    const path = (storage as any).goalsPath();
    await mock.adapter.write(path, TRUNCATED);
    await frozen(async () => {
      await storage.getGoals();
    });
    const backup = `${path}.corrupt-${STAMP}`;
    expect(await mock.adapter.exists(backup)).toBe(true);
    expect(await mock.adapter.read(backup)).toBe(TRUNCATED); // 内容留档，可人工找回
    expect(await mock.adapter.exists(path)).toBe(false); // 规范路径已腾空
  });

  it('putGoals：既有文件损坏时拒绝覆盖（即使本次是非空写入）', async () => {
    const path = (storage as any).goalsPath();
    await mock.adapter.write(path, TRUNCATED);
    await frozen(async () => {
      await storage.putGoals([{ id: 'new', title: '新目标', subItems: [], category: '学习' } as GoalItem]);
    });
    // 本次写入被跳过：规范路径未被写入新内容
    expect(await mock.adapter.exists(path)).toBe(false);
    // 原内容仍完整躺在备份里
    expect(await mock.adapter.read(`${path}.corrupt-${STAMP}`)).toBe(TRUNCATED);
  });

  it('隔离备份之后写入恢复正常（损坏不再卡死目标数据流）', async () => {
    const path = (storage as any).goalsPath();
    await mock.adapter.write(path, TRUNCATED);
    await frozen(async () => {
      await storage.getGoals(); // 触发隔离备份
      await storage.putGoals([{ id: 'g2', title: '恢复后的目标', subItems: [], category: '学习' } as GoalItem]);
      expect((await storage.getGoals()).map((g) => g.id)).toEqual(['g2']);
    });
  });

  it('重构后「数据量悬崖」守卫仍生效：2 条 → 空数组被拦截，用户确认后放行', async () => {
    await storage.putGoals([
      { id: 'g1', title: '读书', subItems: [], category: '学习' } as GoalItem,
      { id: 'g2', title: '跑步', subItems: [], category: '健康' } as GoalItem,
    ]);
    await storage.putGoals([]); // 第一次：拦截
    expect((await storage.getGoals()).length).toBe(2);
    await storage.putGoals([]); // 用户确认意图：放行
    expect(await storage.getGoals()).toEqual([]);
  });

  it('非数组内容（H11）仍返回 []，且不被误判为损坏而挪走文件', async () => {
    const path = (storage as any).goalsPath();
    await mock.adapter.write(path, '{"not":"an array"}');
    expect(await storage.getGoals()).toEqual([]);
    expect(await mock.adapter.exists(path)).toBe(true); // 合法 JSON 只是结构不符，保留原地
  });
});
