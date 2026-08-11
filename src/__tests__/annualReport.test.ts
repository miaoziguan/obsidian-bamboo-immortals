import { describe, it, expect } from 'vitest';
import { aggregate } from '../annualReport';
import type { DayData, GoalItem, LifeEvent } from '../types/data';

function day(date: string, withCompletion: boolean): DayData {
  const completions: Record<string, Record<number, boolean>> = {};
  if (withCompletion) completions['g1'] = { 0: true };
  return { date, goalTaskCompletions: completions } as unknown as DayData;
}

const goals: GoalItem[] = [
  { id: 'g1', title: '目标一', category: 'work', progress: 100 } as GoalItem,
  { id: 'g2', title: '目标二', category: 'health', progress: 40 } as GoalItem,
];

const events: LifeEvent[] = [
  { id: 'c1', type: 'completed', goalId: 'g1', title: '目标一', category: 'work', date: '2026-03-01', progressAtEvent: 100, layerDelta: 2, realmBefore: { realm: '凡尘', layer: 1 }, realmAfter: { realm: '凡尘', layer: 3 } },
  { id: 'a1', type: 'abandoned', goalId: 'g2', title: '目标二', category: 'health', date: '2026-06-15', progressAtEvent: 20 },
];

describe('annualReport.aggregate', () => {
  it('聚合年度指标：活跃/连胜/停摆', () => {
    const days: DayData[] = [
      day('2026-01-01', true),
      day('2026-01-02', true),
      day('2026-01-03', false),
      day('2026-01-04', false),
      day('2026-01-05', false),
      day('2026-01-06', false),
      day('2026-01-07', false),
      day('2026-01-08', false),
      day('2026-01-09', false), // day3-9 连续7天无达标 → 1次停摆
    ];
    const r = aggregate(2026, days, goals, events);
    expect(r.activeDays).toBe(2);
    expect(r.daysTracked).toBe(9);
    expect(r.longestStreak).toBe(2);
    expect(r.stagnationSpells).toBe(1);
    expect(r.activeRate).toBe(Math.round((2 / 9) * 100));
  });

  it('走了几境 = 年内层增量累计', () => {
    const r = aggregate(2026, [day('2026-05-01', true)], goals, events);
    expect(r.realmLayerGain).toBe(2);
    // 年末境界由当前累计完成数(current=1)推导 → 凡尘第2层
    expect(r.realmEnd).toEqual({ realm: '凡尘', layer: 2 });
    expect(r.realmStart).toEqual({ realm: '凡尘', layer: 1 });
  });

  it('最叛逆放弃 = progressAtEvent 最低', () => {
    const r = aggregate(2026, [day('2026-05-01', true)], goals, events);
    expect(r.mostRebelliousAbandon).not.toBeNull();
    expect(r.mostRebelliousAbandon!.progressAtEvent).toBe(20);
    expect(r.mostRebelliousAbandon!.title).toBe('目标二');
  });

  it('最强维度按 category 平均完成率', () => {
    const r = aggregate(2026, [day('2026-05-01', true)], goals, events);
    expect(r.strongestCategory).not.toBeNull();
    // work(100%) > health(40%)
    expect(r.strongestCategory!.key).toBe('work');
    expect(r.strongestCategory!.rate).toBe(100);
  });

  it('非本年度事件被过滤', () => {
    const other: LifeEvent[] = [{ ...events[0], date: '2025-12-31' }];
    const r = aggregate(2026, [day('2026-05-01', true)], goals, other);
    expect(r.realmLayerGain).toBe(0);
    expect(r.completionsInYear).toBe(0);
  });
});
