/**
 * goalStats「按天判定」本地日历口径单测（宿主侧，与 webapp tests/goalStatsCalculator.jest.test.js 对位）
 *
 * 基准一律用**显式本地时刻**构造（本地凌晨 2:00）。旧实现把 'YYYY-MM-DD' 按 UTC 午夜解析，
 * 等价于把日界挪到本地 08:00，此刻所有「还剩/逾期」判定整体错 1 档；当天还会算出 -0
 * （而 -0 < 0 === false，「逾期不足一天」会静默落进「还剩 0 天」）。
 */
import { describe, it, expect } from 'vitest';
import { calculateGoalStats } from '../goalStats';
import type { GoalItem } from '../../types/data';

const NOW = new Date(2026, 9, 6, 2, 0); // 本地 2026-10-06 02:00

const goal = (over: Partial<GoalItem>): GoalItem => ({
  id: 'g1',
  title: '测试目标',
  progress: 30,
  ...over,
});

const calc = (over: Partial<GoalItem>) => calculateGoalStats([goal(over)], NOW);

describe('calculateGoalStats 本地日历口径', () => {
  it('今天到期：归 urgent，daysLeft 为 0 且不是 -0', () => {
    const r = calc({ endDate: '2026-10-06' });
    expect(r.urgentGoals.length).toBe(1);
    expect(r.urgentGoals[0].daysLeft).toBe(0);
    expect(Object.is(r.urgentGoals[0].daysLeft, -0)).toBe(false);
    expect(r.overdueGoals.length).toBe(0);
  });

  it('昨天到期：归 overdue 1 天（旧实现算出 -0 → 误报「还剩 0 天」）', () => {
    const r = calc({ endDate: '2026-10-05' });
    expect(r.overdueGoals.length).toBe(1);
    expect(r.overdueGoals[0].daysOverdue).toBe(1);
    expect(r.urgentGoals.length).toBe(0);
  });

  it('前天到期：daysOverdue 为 2（旧实现少算 1 天）', () => {
    expect(calc({ endDate: '2026-10-04' }).overdueGoals[0].daysOverdue).toBe(2);
  });

  it('3 天后到期归 urgent（旧实现按 08:00 日界算成 4 天 → 掉进 upcoming）', () => {
    const r = calc({ endDate: '2026-10-09' });
    expect(r.urgentGoals.length).toBe(1);
    expect(r.urgentGoals[0].daysLeft).toBe(3);
    expect(r.upcomingGoals.length).toBe(0);
  });

  it('4 天后到期归 upcoming，天数为 4', () => {
    const r = calc({ endDate: '2026-10-10' });
    expect(r.upcomingGoals[0].daysLeft).toBe(4);
    expect(r.urgentGoals.length).toBe(0);
  });

  it('7 天档边界：7 天归 upcoming，8 天不归类', () => {
    expect(calc({ endDate: '2026-10-13' }).upcomingGoals.length).toBe(1);
    const r8 = calc({ endDate: '2026-10-14' });
    expect([r8.upcomingGoals.length, r8.urgentGoals.length, r8.overdueGoals.length]).toEqual([0, 0, 0]);
  });

  it('非法 endDate 串不归类（原为 NaN 静默穿透，现显式跳过）', () => {
    const r = calc({ endDate: '2026-02-31' });
    expect([r.overdueGoals.length, r.urgentGoals.length, r.upcomingGoals.length]).toEqual([0, 0, 0]);
  });

  it('停滞阈值按本地日历日：第 14 天不算，第 15 天算', () => {
    expect(calc({ startDate: '2026-09-22' }).stagnantGoals.length).toBe(0);
    expect(calc({ startDate: '2026-09-21' }).stagnantGoals.length).toBe(1);
  });

  it('跨度档位（30/90 天）在本地日历口径下不变', () => {
    expect(calc({ startDate: '2026-01-01', endDate: '2026-01-30' }).timeSpanStats.shortTerm).toBe(1);
    expect(calc({ startDate: '2026-01-01', endDate: '2026-04-01' }).timeSpanStats.mediumTerm).toBe(1);
    expect(calc({ startDate: '2026-01-01', endDate: '2026-04-02' }).timeSpanStats.longTerm).toBe(1);
  });
});
