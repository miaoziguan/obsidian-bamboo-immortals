import { describe, it, expect } from 'vitest';
import {
  buildCache,
  computeGoalDeviation,
  summarize,
  buildItemEvidence,
  buildItemEvidenceMap,
  formatItemEvidenceForPrompt,
  type DayCacheEntry,
} from '../DeviationCalculator';
import { countWorkdays, getHolidays } from '../workdayCalendar';
import type { DayData, GoalItem } from '../../types/data';

function dayWithCompletion(date: string, gid: string, done = true): DayData {
  return {
    date,
    goalTaskCompletions: { [gid]: { sub1: done } },
    goalProgress: { [gid]: 5 },
  } as unknown as DayData;
}

describe('DeviationCalculator.buildCache', () => {
  it('mirrors webapp _buildDataCache: 按天聚合 goalId 活跃/完成/进度', () => {
    const goals: GoalItem[] = [{ id: 'g1', title: 'A' }];
    const days = [
      dayWithCompletion('2026-01-01', 'g1'),
      dayWithCompletion('2026-01-02', 'g1'),
      dayWithCompletion('2026-01-03', 'g1'),
    ];
    const cache = buildCache(goals, days);
    expect(cache.goalIds).toEqual(['g1']);
    expect(Object.keys(cache.byDateKey).sort()).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
    const e: DayCacheEntry = cache.byDateKey['2026-01-01']['g1'];
    expect(e.active).toBe(true);
    expect(e.completions).toBe(1);
    expect(e.progress).toBe(5);
  });

  it('无 goalTaskCompletions/goalProgress 的日期被跳过', () => {
    const goals: GoalItem[] = [{ id: 'g1', title: 'A' }];
    const days: DayData[] = [{ date: '2026-01-01' } as unknown as DayData];
    const cache = buildCache(goals, days);
    expect(Object.keys(cache.byDateKey)).toEqual([]);
  });
});

describe('DeviationCalculator.computeGoalDeviation', () => {
  const today = new Date('2026-01-11T00:00:00');

  it('严重落后：10 工作日窗口、progress=5 → expected≈100, deviationRate≈-0.95, status=behind', () => {
    const goals: GoalItem[] = [
      {
        id: 'g1',
        title: '减重',
        startDate: '2026-01-01',
        endDate: '2026-01-11',
        progress: 5,
      },
    ];
    const cache = buildCache(goals, []);
    const d = computeGoalDeviation(goals[0], cache, today);
    expect(d.expectedProgress).toBe(100);
    expect(d.actualProgress).toBe(5);
    expect(d.deviationRate).toBeCloseTo(-0.95, 2);
    // 截止日=今天且大幅落后 → at_risk（时间已耗尽）
    expect(d.status).toBe('at_risk');
  });

  it('停滞：窗口内无任何 active → stagnation=true', () => {
    const goals: GoalItem[] = [
      { id: 'g2', title: '阅读', startDate: '2026-01-01', endDate: '2026-02-01', progress: 10 },
    ];
    // 提供有数据但 g2 不活跃的日期
    const days = [
      dayWithCompletion('2026-01-05', 'g1'),
      dayWithCompletion('2026-01-06', 'g1'),
    ];
    const cache = buildCache(goals, days);
    const d = computeGoalDeviation(goals[0], cache, today);
    expect(d.stagnation).toBe(true);
    expect(d.status).toBe('stuck');
  });

  it('缺 startDate/endDate：不抛错，expected 取保守默认且不标 stuck/at_risk', () => {
    const goals: GoalItem[] = [{ id: 'g3', title: '无日期', progress: 0 }];
    const cache = buildCache(goals, []);
    expect(() => computeGoalDeviation(goals[0], cache, today)).not.toThrow();
    const d = computeGoalDeviation(goals[0], cache, today);
    expect(d.expectedProgress).toBe(50);
    expect(['on_track', 'behind']).toContain(d.status);
    expect(d.stagnation).toBe(false);
  });

  it('达标：progress>=100 → done', () => {
    const goals: GoalItem[] = [
      { id: 'g4', title: '完成', startDate: '2026-01-01', endDate: '2026-01-11', progress: 100 },
    ];
    const cache = buildCache(goals, []);
    const d = computeGoalDeviation(goals[0], cache, today);
    expect(d.status).toBe('done');
  });
});

describe('DeviationCalculator.summarize', () => {
  it('产出每目标一行可读指标文本', () => {
    const goals: GoalItem[] = [
      { id: 'g1', title: '减重', startDate: '2026-01-01', endDate: '2026-01-11', progress: 5 },
    ];
    const cache = buildCache(goals, []);
    const text = summarize(goals, cache, new Date('2026-01-11T00:00:00'));
    expect(text).toContain('减重');
    expect(text).toContain('at_risk');
  });
});

describe('DeviationCalculator.buildCache — 子项级完成计数', () => {
  it('按天累计 itemCompletions / itemLastDone（下标 ↔ items.index）', () => {
    const goals: GoalItem[] = [
      { id: 'g1', title: '字库研发', items: [{ name: 'x' }, { name: 'y' }] },
    ];
    const days: DayData[] = [
      { date: '2026-07-10', goalTaskCompletions: { g1: { '0': true, '1': false } } } as unknown as DayData,
      { date: '2026-07-11', goalTaskCompletions: { g1: { '0': true } } } as unknown as DayData,
    ];
    const cache = buildCache(goals, days);
    expect(cache.itemCompletions['g1']).toEqual({ '0': 2 });
    expect(cache.itemCompletions['g1']['1']).toBeUndefined();
    expect(cache.itemLastDone['g1']['0']).toBe('2026-07-11');
    expect(cache.itemLastDone['g1']['1']).toBeUndefined();
  });
});

describe('DeviationCalculator.buildItemEvidence', () => {
  const today = new Date('2026-07-16T00:00:00');
  const goal: GoalItem = {
    id: 'g1',
    title: '字库研发',
    startDate: '2026-01-01',
    endDate: '2027-05-24',
    items: [
      {
        name: '喵字摇滚体',
        percent: 34,
        dailyMin: '10',
        startDate: '2026-01-01',
        endDate: '2027-03-21',
        currentValue: '2320',
        targetValue: '6763',
      },
      {
        name: '未来甲骨文', // 无 percent → 应从 current/target 推导
        dailyMin: '5',
        currentValue: '1163',
        targetValue: '3708',
      },
    ],
  };
  const days: DayData[] = [
    { date: '2026-07-14', goalTaskCompletions: { g1: { '0': true } } } as unknown as DayData,
    { date: '2026-07-15', goalTaskCompletions: { g1: { '0': true } } } as unknown as DayData,
  ];

  it('输出每真实子项的节奏偏差 + 完成证据', () => {
    const cache = buildCache([goal], days);
    const ev = buildItemEvidence(goal, cache, today);
    expect(ev).toHaveLength(2);

    const e0 = ev[0];
    expect(e0.name).toBe('喵字摇滚体');
    expect(e0.dailyMin).toBe('10');
    expect(e0.percent).toBe(34);
    expect(e0.pacePct).toBeGreaterThan(0);
    expect(e0.pacePct).toBeLessThanOrEqual(100);
    // 落后节奏 → 负数（四舍五入整数）
    expect(e0.paceDeviation).toBeLessThan(0);
    expect(typeof e0.paceDeviation).toBe('number');
    expect(e0.doneDays).toBe(2);
    expect(e0.lastDone).toBe('2026-07-15');

    // 无 percent 时由 currentValue/targetValue 推导
    expect(ev[1].percent).toBeCloseTo((1163 / 3708) * 100, 0);
  });

  it('归档/缺日期子项：pacePct 为 null，不抛错', () => {
    const g2: GoalItem = { id: 'g2', title: '无日期', items: [{ name: 'z', dailyMin: '1' }] };
    const cache = buildCache([g2], []);
    expect(() => buildItemEvidence(g2, cache, today)).not.toThrow();
    const ev = buildItemEvidence(g2, cache, today);
    expect(ev[0].pacePct).toBeNull();
    expect(ev[0].paceDeviation).toBeNull();
    expect(ev[0].doneDays).toBe(0);
    expect(ev[0].lastDone).toBeNull();
  });
});

describe('DeviationCalculator.buildItemEvidenceMap / formatItemEvidenceForPrompt', () => {
  const today = new Date('2026-07-16T00:00:00');
  const goal: GoalItem = {
    id: 'g1',
    title: '字库研发',
    startDate: '2026-01-01',
    endDate: '2027-05-24',
    items: [
      { name: '喵字摇滚体', percent: 34, dailyMin: '10' },
      { name: '未来甲骨文', dailyMin: '5' },
    ],
  };

  it('buildItemEvidenceMap 按 goal.title 索引', () => {
    const cache = buildCache([goal], []);
    const map = buildItemEvidenceMap([goal], cache, today);
    expect(map['字库研发']).toHaveLength(2);
    expect(map['字库研发'][0].name).toBe('喵字摇滚体');
  });

  it('formatItemEvidenceForPrompt 含真实子项名与 dailyMin', () => {
    const cache = buildCache([goal], []);
    const text = formatItemEvidenceForPrompt([goal], cache, today);
    expect(text).toContain('喵字摇滚体');
    expect(text).toContain('dailyMin=10');
    expect(text).toContain('未来甲骨文');
  });

  it('formatItemEvidenceForPrompt 标注 goalId 与子项 [index]（供结构化引用）', () => {
    const cache = buildCache([goal], []);
    const text = formatItemEvidenceForPrompt([goal], cache, today);
    expect(text).toContain('goalId=g1');
    expect(text).toContain('[0] 喵字摇滚体');
    expect(text).toContain('[1] 未来甲骨文');
  });

  it('formatItemEvidenceForPrompt 空目标 → 占位说明', () => {
    expect(formatItemEvidenceForPrompt([], buildCache([], []), today)).toContain('无子项');
  });
});

describe('DeviationCalculator.computeGoalDeviation — 节假日感知（统一口径）', () => {
  const today = new Date('2026-02-18T00:00:00');
  const goal: GoalItem = {
    id: 'g1',
    title: '跨春节目标',
    startDate: '2026-02-10',
    endDate: '2026-03-01',
    progress: 0,
  };
  it('预期进度排除法定节假日（春节整段被扣减），与共享函数口径一致', () => {
    const cache = buildCache([goal], []);
    const d = computeGoalDeviation(goal, cache, today);
    const holidays = getHolidays(2026);
    const start = new Date('2026-02-10T00:00:00');
    const end = new Date('2026-03-01T00:00:00');
    const expectedWd = countWorkdays(start, end, holidays);
    const elapsedWd = countWorkdays(start, today, holidays);
    const expected = expectedWd > 0 ? Math.round((elapsedWd / expectedWd) * 100) : 50;
    // 与共享 workdayCalendar 计算完全一致（不重复造轮子）
    expect(d.expectedProgress).toBe(expected);
    // 关键回归锁：该窗口含春节（02-16~02-20 全为节假日），
    // 不含节假日的旧口径会给出 50，统一后应更低
    expect(d.expectedProgress).toBeLessThan(50);
  });
});
