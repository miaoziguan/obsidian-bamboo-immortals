import { describe, it, expect } from 'vitest';
import {
  buildCache,
  computeGoalDeviation,
  summarize,
  type DayCacheEntry,
} from '../DeviationCalculator';
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
