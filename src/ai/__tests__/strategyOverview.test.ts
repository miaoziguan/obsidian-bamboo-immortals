import { describe, it, expect } from 'vitest';
import { buildStrategyOverview } from '../strategyOverview';
import { buildCache } from '../DeviationCalculator';
import { TUNING } from '../healthScore';
import type { GoalItem } from '../../types/data';

/**
 * buildStrategyOverview 契约与边界（该纯函数此前零单测，且是「战略复盘」唯一的权威聚合出口）。
 * 重点锁定：脏 progress 的钳制、title 缺失回落、updatedAt 与基准日同源、空集不炸。
 */
const TODAY = new Date('2026-06-01T00:00:00Z');

function goal(over: Partial<GoalItem> = {}): GoalItem {
  return {
    id: 'g1',
    title: '目标一',
    progress: 50,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    ...over,
  } as unknown as GoalItem;
}

describe('buildStrategyOverview', () => {
  it('空目标集：不抛错，聚合为全零且 health 结构完整', () => {
    const ov = buildStrategyOverview([], buildCache([], []), TODAY);
    expect(ov.goals).toEqual([]);
    expect(ov.results).toEqual([]);
    expect(ov.overview.totalGoals).toBe(0);
    expect(ov.overview.avgProgress).toBe(0);
    expect(ov.health).toBeTruthy();
  });

  it('updatedAt 与注入的基准日严格同源（不再偷偷取 new Date()）', () => {
    const g = goal();
    const ov = buildStrategyOverview([g], buildCache([g], []), TODAY);
    expect(ov.updatedAt).toBe(TODAY.toISOString());
  });

  it.each([
    [NaN, 0],
    [undefined, 0],
    [null, 0],
    ['80', 80],
    ['abc', 0],
    [-20, 0],
    [150, 100],
    [0, 0],
    [100, 100],
  ])('progress=%j 被钳制为 %i', (raw, expected) => {
    const g = goal({ progress: raw as never });
    const ov = buildStrategyOverview([g], buildCache([g], []), TODAY);
    expect(ov.goals[0].progress).toBe(expected);
  });

  it('title 缺失回落「(未命名目标)」而非 undefined', () => {
    const g = goal({ title: undefined });
    const ov = buildStrategyOverview([g], buildCache([g], []), TODAY);
    expect(ov.goals[0].title).toBe('(未命名目标)');
  });

  it('goals 与 results 一一对应（results 带 goalId，消费方按 id 配对齐）', () => {
    const gs = [goal({ id: 'a' }), goal({ id: 'b' }), goal({ id: 'c' })];
    const ov = buildStrategyOverview(gs, buildCache(gs, []), TODAY);
    expect(ov.goals.map((g) => g.id)).toEqual(['a', 'b', 'c']);
    expect(ov.results).toHaveLength(ov.goals.length);
    // 关键：results 必须携带 goalId，webapp 按 id 匹配而非数组下标
    expect(ov.results.map((r) => r.goalId)).toEqual(['a', 'b', 'c']);
  });

  it('hints 为宿主生成的目标集层面诊断提示（非空数组）', () => {
    const gs = [goal({ id: 'a', progress: 30 })];
    const ov = buildStrategyOverview(gs, buildCache(gs, []), TODAY);
    expect(Array.isArray(ov.hints)).toBe(true);
    expect(ov.hints.length).toBeGreaterThan(0);
    expect(ov.hints[0]).toHaveProperty('type');
    expect(ov.hints[0]).toHaveProperty('text');
    expect(ov.hints[0]).toHaveProperty('action');
  });

  it('缺起止日期的目标不抛错（走中性基准）', () => {
    const g = goal({ startDate: undefined, endDate: undefined });
    expect(() => buildStrategyOverview([g], buildCache([g], []), TODAY)).not.toThrow();
  });

  it('日期非法（无法解析）时不抛错', () => {
    const g = goal({ startDate: 'not-a-date', endDate: '' });
    expect(() => buildStrategyOverview([g], buildCache([g], []), TODAY)).not.toThrow();
  });

  it('健康卡字段齐全且分数在 0..100', () => {
    const g = goal();
    const ov = buildStrategyOverview([g], buildCache([g], []), TODAY);
    const card = ov.goals[0];
    expect(card.score).toBeGreaterThanOrEqual(0);
    expect(card.score).toBeLessThanOrEqual(100);
    expect(typeof card.statusText).toBe('string');
    expect(card.statusText.length).toBeGreaterThan(0);
    expect(typeof card.label).toBe('string');
    expect(typeof card.color).toBe('string');
  });

  it('STAGNATION_WINDOW 与前端口径一致（60 天）——宿主窗口对齐的前提', () => {
    expect(TUNING.STAGNATION_WINDOW).toBe(60);
  });
});
