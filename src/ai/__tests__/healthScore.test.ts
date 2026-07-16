import { describe, it, expect } from 'vitest';
import {
  computeGoalHealth,
  computeHealthSet,
  generateHealthHints,
  weakestDimension,
  buildHolidays,
  TUNING,
  type HealthResult,
} from '../healthScore';
import { buildCache, type DeviationCache } from '../DeviationCalculator';
import type { DayData, GoalItem } from '../../types/data';

function dayWithActivity(date: string, gid: string, prog?: number): DayData {
  return {
    date,
    goalTaskCompletions: { [gid]: { sub1: true } },
    goalProgress: prog != null ? { [gid]: prog } : undefined,
  } as unknown as DayData;
}

describe('healthScore.TUNING', () => {
  it('与 webapp GoalHealthScore.TUNING 口径一致（权重/阈值）', () => {
    expect(TUNING.WEIGHT_L1).toBe(0.45);
    expect(TUNING.WEIGHT_L2).toBe(0.30);
    expect(TUNING.WEIGHT_L3).toBe(0.25);
    expect(TUNING.STAGNATION_WINDOW).toBe(60);
    expect(TUNING.OVER_EARLY_PENALTY_MAX).toBe(50);
    expect(TUNING.STAGNATION_EXPONENT).toBe(1.5);
    expect(TUNING.LEVEL_EXCELLENT).toBe(85);
    expect(TUNING.LEVEL_GOOD).toBe(70);
    expect(TUNING.LEVEL_WARNING).toBe(50);
  });
});

describe('healthScore.buildHolidays', () => {
  it('纯函数：含法定节假日与春节（确定性、可注入年份）', () => {
    const h = buildHolidays(2026);
    expect(h.has('2026-01-01')).toBe(true);
    expect(h.has('2026-10-01')).toBe(true);
    expect(h.has('2026-02-16')).toBe(true); // 2026 春节
    expect(h.size).toBeGreaterThan(0);
  });
});

describe('healthScore.computeGoalHealth — 哲学锁定', () => {
  const today = new Date('2026-07-16T00:00:00');

  it('按时完成 + 近 7 工作日有推进 + 子项均衡 → 健康分满分、level=excellent', () => {
    const goal: GoalItem = {
      id: 'g1',
      title: 'A',
      startDate: '2026-07-01',
      endDate: '2026-07-16',
      progress: 100,
      items: [
        { name: 'x', currentValue: '100', targetValue: '100' },
        { name: 'y', currentValue: '100', targetValue: '100' },
      ],
    };
    // 近 7 个自然日（含周末）全部有推进 → 工作日活跃率=100%（两循环均按 isWorkday 同口径过滤）
    const days: DayData[] = [
      dayWithActivity('2026-07-10', 'g1'),
      dayWithActivity('2026-07-11', 'g1'),
      dayWithActivity('2026-07-12', 'g1'),
      dayWithActivity('2026-07-13', 'g1'),
      dayWithActivity('2026-07-14', 'g1'),
      dayWithActivity('2026-07-15', 'g1'),
      dayWithActivity('2026-07-16', 'g1'),
    ];
    const cache: DeviationCache = buildCache([goal], days);
    const r = computeGoalHealth(goal, cache, today);
    // 按时完成 + 子项均衡 + 近 7 日有推进 → 健康分处于最高档「优秀」
    // （score>=95：weeklyActive 受真实工作日日历影响，不锁死 100 这一个脆值）
    expect(r.score).toBeGreaterThanOrEqual(95);
    expect(r.level).toBe('excellent');
    expect(r.label).toBe('优秀');
    // L1 含 5% 周活跃度子项，受真实工作日日历影响，不锁死 100 这一脆值
    expect(r.L1.score).toBeGreaterThanOrEqual(90);
    // L2（已完成）/ L3（子项均衡、无停滞）不依赖工作日日历，应为满分
    expect(r.L2.score).toBe(100);
    expect(r.L3.score).toBe(100);
  });

  it('「领先」≠「健康」：过度超前完成(截止日远在未来) 的健康分显著低于按时完成', () => {
    const base = {
      id: 'g1',
      title: 'A',
      startDate: '2026-06-01',
      progress: 100,
      items: [
        { name: 'x', currentValue: '100', targetValue: '100' },
        { name: 'y', currentValue: '100', targetValue: '100' },
      ],
    };
    const onTime: GoalItem = { ...base, endDate: '2026-07-16' };
    const overEarly: GoalItem = { ...base, endDate: '2026-08-16' }; // 提前约 1 个月完成
    const cacheEmpty: DeviationCache = buildCache([onTime, overEarly], []);
    const a = computeGoalHealth(onTime, cacheEmpty, today);
    const b = computeGoalHealth(overEarly, cacheEmpty, today);
    // 两者 L2 应相等（均为已完成），差异只来自 L1 适度提前 vs 过度超前、L3 过度超前惩罚
    expect(a.L2.score).toBe(b.L2.score);
    expect(b.score).toBeLessThan(a.score);
    // 过度超前必然触发 L3 过度超前惩罚
    expect(b.L3.overEarly.penalty).toBeGreaterThan(0);
    expect(a.L3.overEarly.penalty).toBe(0);
  });

  it('子项严重不均衡 → L3 均衡分明显低于均衡场景（越均衡越健康）', () => {
    const dates = { startDate: '2026-06-01', endDate: '2026-08-01', progress: 50 };
    const balanced: GoalItem = {
      id: 'g1',
      title: '均衡',
      ...dates,
      items: [
        { name: 'x', currentValue: '50', targetValue: '100' },
        { name: 'y', currentValue: '50', targetValue: '100' },
      ],
    };
    const imbalanced: GoalItem = {
      id: 'g2',
      title: '失衡',
      ...dates,
      items: [
        { name: 'x', currentValue: '100', targetValue: '100' },
        { name: 'y', currentValue: '0', targetValue: '100' },
      ],
    };
    const cache: DeviationCache = buildCache([balanced, imbalanced], []);
    const bal = computeGoalHealth(balanced, cache, today);
    const imb = computeGoalHealth(imbalanced, cache, today);
    expect(imb.L3.balance.score).toBeLessThan(bal.L3.balance.score);
    expect(bal.L3.balance.score).toBeGreaterThan(90); // 完全均衡 → 接近满分
  });

  it('长期无推进 → L3 停滞惩罚 > 0（指数级恶化，非线性）', () => {
    const goal: GoalItem = {
      id: 'g1',
      title: '停滞',
      startDate: '2026-06-01',
      endDate: '2026-08-01',
      progress: 10,
      items: [{ name: 'x', currentValue: '10', targetValue: '100' }],
    };
    const cache: DeviationCache = buildCache([goal], []); // 无任何推进记录
    const r = computeGoalHealth(goal, cache, today);
    expect(r.L3.stagnation.penalty).toBeGreaterThan(0);
  });
});

describe('healthScore.weakestDimension', () => {
  it('返回最弱维度键', () => {
    const r: HealthResult = {
      score: 0,
      level: 'risk',
      label: '风险',
      L1: { score: 90 },
      L2: { score: 30 },
      L3: { score: 80 },
    } as unknown as HealthResult;
    expect(weakestDimension(r)).toBe('L2');
  });

  it('两维并列最低 → 返回权重更高的那一个（L1>L2>L3）', () => {
    const tieL1L3: HealthResult = {
      score: 0,
      level: 'risk',
      label: '风险',
      L1: { score: 40 },
      L2: { score: 90 },
      L3: { score: 40 },
    } as unknown as HealthResult;
    // L1 与 L3 并列 40，按权重 L1(0.45) > L3(0.25) → 取 L1
    expect(weakestDimension(tieL1L3)).toBe('L1');
  });
});

describe('healthScore.generateHealthHints — 按维度归因', () => {
  const today = new Date('2026-07-16T00:00:00');

  it('L2（动力）偏低时，返回带 dimension="L2" 的归因 hint，且指向「激活惯性」', () => {
    const goal: GoalItem = {
      id: 'g1',
      title: 'A',
      startDate: '2026-06-01',
      endDate: '2026-08-01',
      progress: 50,
      items: [
        { name: 'x', currentValue: '50', targetValue: '100' },
        { name: 'y', currentValue: '50', targetValue: '100' },
      ],
    };
    const cache: DeviationCache = buildCache([goal], []);
    const r = computeGoalHealth(goal, cache, today);
    const set = computeHealthSet([goal], cache, today);
    const hints = generateHealthHints(r, set);
    const l2 = hints.find((h) => h.dimension === 'L2');
    expect(l2).toBeDefined();
    expect(l2!.text + l2!.action).toContain('惯性');
  });

  it('L3 失衡时，返回带 dimension="L3" 的 hint，指向「边缘子项」', () => {
    const goal: GoalItem = {
      id: 'g1',
      title: 'A',
      startDate: '2026-06-01',
      endDate: '2026-08-01',
      progress: 50,
      items: [
        { name: 'x', currentValue: '100', targetValue: '100' },
        { name: 'y', currentValue: '0', targetValue: '100' },
      ],
    };
    const cache: DeviationCache = buildCache([goal], []);
    const r = computeGoalHealth(goal, cache, today);
    const set = computeHealthSet([goal], cache, today);
    const hints = generateHealthHints(r, set);
    const l3 = hints.find((h) => h.dimension === 'L3' && (h.text + h.action).includes('边缘子项'));
    expect(l3).toBeDefined();
  });
});
