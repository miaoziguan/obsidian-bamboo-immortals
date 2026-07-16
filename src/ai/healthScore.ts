/**
 * healthScore.ts — 目标健康分评分系统（插件侧纯函数引擎，TS 移植）
 *
 * 与 webapp `GoalHealthScore` 100% 同口径，但：
 *  - 不读全局 `store`，缓存直接复用 `DeviationCalculator.buildCache` 的 `DeviationCache`
 *    （byDateKey[dateKey][goalId].{active, completions, progress} 形状完全一致）；
 *  - `today` 作为必填参数注入（可单测、确定性）；
 *  - 零 Obsidian 依赖，可单测。
 *
 * 三层评分体系（设计哲学见 docs/plans/2026-07-16-health-score-diagnosis-design.md）：
 *  L1 基础健康分（履约能力）45% — 按时 30% / 适度提前 10% / 周活跃 5%
 *  L2 趋势动力分（成长能力）30% — 进度趋势 20% / 完成趋势 10%
 *  L3 可持续性分（健康程度）25% — 停滞惩罚 / 均衡度 / 过度超前惩罚 / 拖延惩罚
 *
 * 反直觉价值观（AI 诊断必须接住）：
 *  - 「领先」≠「健康」：过度超前（提前 >3 工作日完成）被惩罚；
 *  - 停滞指数级恶化：(days/5)^1.5；
 *  - 子项越均衡越健康（进度标准差越小越好）；
 *  - 归因按「维度」而非「是否落后」。
 */

import type { DeviationCache } from './DeviationCalculator';
import type { GoalItem, GoalSubItem } from '../types/data';

export type HealthLevel = 'excellent' | 'good' | 'warning' | 'risk';
export type HealthDimension = 'L1' | 'L2' | 'L3';

export interface HealthSubScore {
  score: number;
  hint?: string;
}

export interface HealthL1 extends HealthSubScore {
  onTime: HealthSubScore;
  moderateEarly: HealthSubScore;
  weeklyActive: HealthSubScore;
}

export interface HealthL2 extends HealthSubScore {
  progressTrend: HealthSubScore;
  completionTrend: HealthSubScore;
}

export interface HealthStagnation {
  penalty: number;
  hint?: string;
}

export interface HealthL3 extends HealthSubScore {
  stagnation: HealthStagnation;
  balance: HealthSubScore;
  overEarly: HealthStagnation;
  delay: HealthStagnation;
}

export interface HealthResult {
  score: number;
  level: HealthLevel;
  label: string;
  color: string;
  L1: HealthL1;
  L2: HealthL2;
  L3: HealthL3;
}

export interface HealthSet {
  avgScore: number;
  avgLevel: HealthLevel;
  avgLabel: string;
  avgColor: string;
  count: number;
  L1: number;
  L2: number;
  L3: number;
  trend: number;
}

export type HealthHintType = 'danger' | 'warning' | 'success';

export interface HealthHint {
  /** 该归因指向的健康分维度（供诊断提示词按维度对齐建议） */
  dimension: HealthDimension;
  type: HealthHintType;
  icon: string;
  text: string;
  action: string;
}

export const TUNING = {
  // 三层总分权重
  WEIGHT_L1: 0.45,
  WEIGHT_L2: 0.3,
  WEIGHT_L3: 0.25,

  // L1 内部子项权重
  L1_ON_TIME: 0.3,
  L1_MODERATE_EARLY: 0.1,
  L1_WEEKLY_ACTIVE: 0.05,

  // L2 内部子项权重
  L2_PROGRESS_TREND: 0.2,
  L2_COMPLETION_TREND: 0.1,

  // L3 内部平衡分权重
  L3_BALANCE: 0.1,

  // 周活跃度 / 进度趋势回溯天数
  RECENT_DAYS: 7,
  // 停滞检测最大回溯天数
  STAGNATION_WINDOW: 60,

  // 过度超前 / 拖延宽容天数与惩罚系数
  TOLERANCE_EARLY_DAYS: 3,
  OVER_EARLY_PENALTY_MAX: 50,
  OVER_EARLY_PENALTY_RATE: 5,
  TOLERANCE_DELAY_DAYS: 3,
  DELAY_PENALTY_MAX: 30,
  DELAY_PENALTY_RATE: 3,

  // 停滞惩罚指数曲线
  STAGNATION_EXPONENT: 1.5,
  STAGNATION_DIVISOR: 5,
  STAGNATION_PENALTY_MAX: 40,

  // 平衡分惩罚系数
  BALANCE_PENALTY_RATE: 1.5,

  // L2 进度趋势判定阈值
  TREND_ACCEL_THRESHOLD: 5,

  // 建议系统阈值
  SUGGESTION_LOW: 60,
  SUGGESTION_HIGH: 85,

  // 综合趋势映射
  TREND_STRONG_HIGH: 75,
  TREND_WEAK_HIGH: 60,
  TREND_STRONG_LOW: 40,
  TREND_WEAK_LOW: 55,

  // 等级划分阈值
  LEVEL_EXCELLENT: 85,
  LEVEL_GOOD: 70,
  LEVEL_WARNING: 50,

  // 诊断系统阈值
  HINT_L1: 70,
  HINT_L2: 60,
  HINT_L3: 70,
  HINT_LATE_GOAL_SCORE: 60,
  HINT_STAGNATION_PENALTY: 15,
  HINT_BALANCE_SCORE: 60,
  HINT_HIGH_SCORE: 90,
};

const LEVELS: Record<HealthLevel, { label: string; min: number; color: string }> = {
  excellent: { label: '优秀', min: TUNING.LEVEL_EXCELLENT, color: 'var(--bamboo-primary)' },
  good: { label: '良好', min: TUNING.LEVEL_GOOD, color: 'var(--bamboo-light)' },
  warning: { label: '需关注', min: TUNING.LEVEL_WARNING, color: '#f59e0b' },
  risk: { label: '风险', min: 0, color: '#dc3545' },
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 纯函数：构造某年的法定节假日 + 春节集合（与 webapp 口径一致） */
export function buildHolidays(refYear: number): Set<string> {
  const h = new Set<string>();
  const add = (y: number, m: number, d: number) =>
    h.add(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  [refYear, refYear + 1].forEach((y) => {
    add(y, 1, 1);
    add(y, 5, 1); add(y, 5, 2); add(y, 5, 3);
    add(y, 10, 1); add(y, 10, 2); add(y, 10, 3); add(y, 10, 4); add(y, 10, 5); add(y, 10, 6); add(y, 10, 7);
    add(y, 4, 4); add(y, 4, 5); add(y, 4, 6);
    add(y, 6, 9); add(y, 6, 10);
    add(y, 9, 14); add(y, 9, 15); add(y, 9, 16);
  });
  if (refYear <= 2025 && 2025 <= refYear + 1) {
    ['2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31',
      '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04'].forEach((d) => h.add(d));
  }
  if (refYear <= 2026 && 2026 <= refYear + 1) {
    ['2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19',
      '2026-02-20', '2026-02-21', '2026-02-22'].forEach((d) => h.add(d));
  }
  return h;
}

let _holidayCache: { year: number; set: Set<string> } | null = null;
function _getHolidays(year: number): Set<string> {
  if (_holidayCache && _holidayCache.year === year) return _holidayCache.set;
  const set = buildHolidays(year);
  _holidayCache = { year, set };
  return set;
}

function isWorkday(d: Date, holidays: Set<string>): boolean {
  const day = d.getDay();
  if (day === 0 || day === 6) return false;
  return !holidays.has(fmt(d));
}

function countWorkdays(from: Date, to: Date, holidays: Set<string>): number {
  let count = 0;
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (cur > last) return 0;
  while (cur <= last) {
    if (isWorkday(cur, holidays)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function workdaysBetween(from: Date, to: Date, holidays: Set<string>): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (b >= a) return countWorkdays(a, b, holidays);
  return -countWorkdays(b, a, holidays);
}

function cacheActiveOnDate(cache: DeviationCache, goalId: string, dateKey: string): boolean {
  const day = cache.byDateKey[dateKey];
  if (!day) return false;
  const entry = day[goalId];
  return !!entry && !!entry.active;
}

function cacheCompletionsOnDate(cache: DeviationCache, goalId: string, dateKey: string): number {
  const day = cache.byDateKey[dateKey];
  if (!day) return 0;
  const entry = day[goalId];
  return entry ? (entry.completions || 0) : 0;
}

function cacheProgressOnDate(cache: DeviationCache, goalId: string, dateKey: string): number | undefined {
  const day = cache.byDateKey[dateKey];
  if (!day) return undefined;
  const entry = day[goalId];
  return entry ? entry.progress : undefined;
}

// ─── L1 基础健康分（履约能力）45% ───
function scoreOnTime(
  goal: GoalItem,
  progress: number,
  isComplete: boolean,
  holidays: Set<string>,
  today: Date
): HealthSubScore {
  if (!goal.endDate) return { score: 70, hint: '未设截止日期' };
  if (goal.startDate && goal.endDate) {
    const s = new Date(goal.startDate + 'T00:00:00');
    const e = new Date(goal.endDate + 'T00:00:00');
    if (s > e) return { score: 0, hint: '日期范围异常' };
  }
  const end = new Date(goal.endDate + 'T00:00:00');
  end.setHours(0, 0, 0, 0);
  const daysToDeadline = workdaysBetween(today, end, holidays);

  if (isComplete) {
    if (daysToDeadline >= -TUNING.TOLERANCE_DELAY_DAYS && daysToDeadline <= 0) {
      return { score: 100, hint: '按时完成' };
    }
    if (daysToDeadline > 0) return { score: 100, hint: '提前完成' };
    const late = Math.abs(daysToDeadline);
    const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
    return { score: clamp(100 - penalty, 0, 100), hint: `拖延${late}个工作日` };
  }

  if (daysToDeadline < -TUNING.TOLERANCE_DELAY_DAYS) {
    const late = Math.abs(daysToDeadline);
    const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
    return { score: clamp(70 - penalty, 0, 100), hint: `已逾期${late}个工作日` };
  }

  if (!goal.startDate) return { score: 65, hint: '未设开始日期' };
  const start = new Date(goal.startDate + 'T00:00:00');
  start.setHours(0, 0, 0, 0);
  if (today < start) return { score: 80, hint: '尚未开始' };

  const totalWorkdays = countWorkdays(start, end, holidays);
  const elapsedWorkdays = countWorkdays(start, today, holidays);
  const expected = totalWorkdays > 0 ? (elapsedWorkdays / totalWorkdays) * 100 : 50;
  const diff = progress - expected;

  if (diff >= 0) return { score: 100, hint: '进度达标' };
  if (diff > -15) return { score: clamp(85 + diff, 0, 100), hint: '轻微落后' };
  if (diff > -30) return { score: clamp(60 + diff * 0.5, 0, 100), hint: '明显落后' };
  return { score: clamp(40 + diff * 0.2, 0, 100), hint: '严重落后' };
}

function scoreModerateEarly(
  goal: GoalItem,
  progress: number,
  isComplete: boolean,
  holidays: Set<string>,
  today: Date
): HealthSubScore {
  if (!goal.endDate) return { score: 70, hint: '未设截止日期' };
  const end = new Date(goal.endDate + 'T00:00:00');
  end.setHours(0, 0, 0, 0);
  const daysToDeadline = workdaysBetween(today, end, holidays);

  if (isComplete) {
    if (daysToDeadline >= 1 && daysToDeadline <= TUNING.TOLERANCE_EARLY_DAYS) {
      return { score: 80, hint: '适度提前' };
    }
    if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS) {
      const penalty = Math.min(
        TUNING.OVER_EARLY_PENALTY_MAX,
        daysToDeadline * TUNING.OVER_EARLY_PENALTY_RATE
      );
      return { score: clamp(80 - penalty, 0, 100), hint: `过度超前${daysToDeadline}天` };
    }
    return { score: 100, hint: '按时完成' };
  }

  if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS && progress >= 90) {
    return { score: 75, hint: '接近完成' };
  }
  return { score: 70, hint: '进行中' };
}

function scoreWeeklyActive(
  goal: GoalItem,
  _items: GoalSubItem[],
  cache: DeviationCache,
  holidays: Set<string>,
  today: Date
): HealthSubScore {
  let activeDays = 0;
  for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (!isWorkday(d, holidays)) continue;
    const key = fmt(d);
    if (cacheActiveOnDate(cache, goal.id, key)) activeDays++;
  }
  let workdaysThisWeek = 0;
  for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (isWorkday(d, holidays)) workdaysThisWeek++;
  }
  const ratio = workdaysThisWeek > 0 ? activeDays / workdaysThisWeek : 0;
  return {
    score: clamp(Math.round(ratio * 100), 0, 100),
    hint: activeDays > 0 ? `周活跃${activeDays}天` : '本周无推进',
  };
}

function scoreL1(
  goal: GoalItem,
  items: GoalSubItem[],
  progress: number,
  isComplete: boolean,
  cache: DeviationCache,
  holidays: Set<string>,
  today: Date
): HealthL1 {
  const onTime = scoreOnTime(goal, progress, isComplete, holidays, today);
  const moderateEarly = scoreModerateEarly(goal, progress, isComplete, holidays, today);
  const weeklyActive = scoreWeeklyActive(goal, items, cache, holidays, today);
  const score = clamp(
    Math.round(
      (onTime.score * TUNING.L1_ON_TIME +
        moderateEarly.score * TUNING.L1_MODERATE_EARLY +
        weeklyActive.score * TUNING.L1_WEEKLY_ACTIVE) /
        (TUNING.L1_ON_TIME + TUNING.L1_MODERATE_EARLY + TUNING.L1_WEEKLY_ACTIVE)
    ),
    0,
    100
  );
  return { score: Math.round(score), onTime, moderateEarly, weeklyActive };
}

// ─── L2 趋势动力分（成长能力）30% ───
function scoreProgressTrend(
  goal: GoalItem,
  _items: GoalSubItem[],
  progress: number,
  isComplete: boolean,
  cache: DeviationCache,
  holidays: Set<string>,
  today: Date
): HealthSubScore {
  if (isComplete) return { score: 100, hint: '已完成' };
  if (!goal.startDate || !goal.endDate) return { score: 60, hint: '缺少日期信息' };
  if (goal.startDate && goal.endDate) {
    const s = new Date(goal.startDate + 'T00:00:00');
    const e = new Date(goal.endDate + 'T00:00:00');
    if (s > e) return { score: 0, hint: '日期范围异常' };
  }

  const start = new Date(goal.startDate + 'T00:00:00');
  start.setHours(0, 0, 0, 0);
  if (today < start) return { score: 50, hint: '尚未开始' };

  const recentDays = TUNING.RECENT_DAYS;
  let recentProgress = 0;
  let olderProgress = 0;
  let recentHasData = false;
  let olderHasData = false;

  for (let i = 0; i < recentDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    const p = cacheProgressOnDate(cache, goal.id, key);
    if (p !== undefined) {
      recentProgress = p;
      recentHasData = true;
      break;
    }
  }
  for (let i = recentDays; i < recentDays * 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    const p = cacheProgressOnDate(cache, goal.id, key);
    if (p !== undefined) {
      olderProgress = p;
      olderHasData = true;
      break;
    }
  }

  if (!recentHasData && !olderHasData) {
    const end = new Date(goal.endDate + 'T00:00:00');
    end.setHours(0, 0, 0, 0);
    const totalWd = countWorkdays(start, end, holidays);
    const elapsedWd = countWorkdays(start, today, holidays);
    const expected = totalWd > 0 ? (elapsedWd / totalWd) * 100 : 50;
    const diff = progress - expected;
    if (diff >= 0) return { score: 80, hint: '进度正常' };
    if (diff > -20) return { score: 60, hint: '稍有落后' };
    return { score: 40, hint: '进度偏慢' };
  }

  if (!olderHasData) return { score: 65, hint: '数据不足' };

  const diff = recentProgress - olderProgress;
  if (diff > TUNING.TREND_ACCEL_THRESHOLD) return { score: 90, hint: '进度加速' };
  if (diff > 0) return { score: 75, hint: '稳步推进' };
  if (diff === 0) return { score: 50, hint: '进度停滞' };
  return { score: 30, hint: '进度倒退' };
}

function scoreCompletionTrend(
  goal: GoalItem,
  _items: GoalSubItem[],
  isComplete: boolean,
  cache: DeviationCache,
  _holidays: Set<string>,
  today: Date
): HealthSubScore {
  if (isComplete) return { score: 100, hint: '已完成' };
  if (!goal.items || goal.items.length === 0) return { score: 60, hint: '无子项' };

  let recentCompletions = 0;
  let olderCompletions = 0;
  const recentDays = TUNING.RECENT_DAYS;

  for (let i = 0; i < recentDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    recentCompletions += cacheCompletionsOnDate(cache, goal.id, key);
  }
  for (let i = recentDays; i < recentDays * 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    olderCompletions += cacheCompletionsOnDate(cache, goal.id, key);
  }

  if (recentCompletions === 0 && olderCompletions === 0) {
    return { score: 50, hint: '近期无完成' };
  }
  if (recentCompletions > olderCompletions) return { score: 85, hint: '完成加速' };
  if (recentCompletions === olderCompletions) return { score: 65, hint: '完成稳定' };
  return { score: 40, hint: '完成放缓' };
}

function scoreL2(
  goal: GoalItem,
  items: GoalSubItem[],
  progress: number,
  isComplete: boolean,
  cache: DeviationCache,
  holidays: Set<string>,
  today: Date
): HealthL2 {
  const progressTrend = scoreProgressTrend(goal, items, progress, isComplete, cache, holidays, today);
  const completionTrend = scoreCompletionTrend(goal, items, isComplete, cache, holidays, today);
  const score = clamp(
    Math.round(
      (progressTrend.score * TUNING.L2_PROGRESS_TREND +
        completionTrend.score * TUNING.L2_COMPLETION_TREND) /
        (TUNING.L2_PROGRESS_TREND + TUNING.L2_COMPLETION_TREND)
    ),
    0,
    100
  );
  return { score: Math.round(score), progressTrend, completionTrend };
}

// ─── L3 可持续性分（健康程度）25% ───
function scoreStagnation(
  goal: GoalItem,
  _items: GoalSubItem[],
  _progress: number,
  isComplete: boolean,
  cache: DeviationCache,
  holidays: Set<string>,
  today: Date
): HealthStagnation {
  if (isComplete) return { penalty: 0, hint: '已完成' };
  if (!goal.startDate) return { penalty: 0, hint: '无开始日期' };

  const start = new Date(goal.startDate + 'T00:00:00');
  start.setHours(0, 0, 0, 0);
  if (today < start) return { penalty: 0, hint: '尚未开始' };

  let lastActiveDate: Date | null = null;
  for (let i = 0; i < TUNING.STAGNATION_WINDOW; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    if (cacheActiveOnDate(cache, goal.id, key)) {
      lastActiveDate = d;
      break;
    }
  }

  if (!lastActiveDate) {
    const stagnantDays = workdaysBetween(start, today, holidays);
    const penalty = Math.min(
      TUNING.STAGNATION_PENALTY_MAX,
      Math.pow(stagnantDays / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT)
    );
    return { penalty: Math.round(penalty), hint: `从未推进(${stagnantDays}天)` };
  }

  const stagnantDays = workdaysBetween(lastActiveDate, today, holidays);
  if (stagnantDays <= 2) return { penalty: 0, hint: '近期有推进' };
  const penalty = Math.min(
    TUNING.STAGNATION_PENALTY_MAX,
    Math.pow(stagnantDays / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT)
  );
  return { penalty: Math.round(penalty), hint: `停滞${stagnantDays}个工作日` };
}

function scoreBalance(items: GoalSubItem[], isComplete: boolean): HealthSubScore {
  if (isComplete) return { score: 100, hint: '已完成' };
  if (!items || items.length <= 1) return { score: 80, hint: '子项不足' };

  const progresses = items.map((it) => {
    const tar = parseFloat(it.targetValue ?? '0');
    if (tar === 0) {
      const cur = parseFloat(it.currentValue ?? '0') || 0;
      return cur === 0 ? 100 : 0;
    }
    const tarSafe = tar || 100;
    const cur = parseFloat(it.currentValue ?? '0') || 0;
    return (cur / tarSafe) * 100;
  });

  const avg = progresses.reduce((s, v) => s + v, 0) / progresses.length;
  const variance = progresses.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / progresses.length;
  const stdDev = Math.sqrt(variance);

  const score = clamp(Math.round(100 - stdDev * TUNING.BALANCE_PENALTY_RATE), 0, 100);
  return {
    score,
    hint: stdDev > 30 ? '进度不均衡' : stdDev > 15 ? '进度略有差异' : '进度均衡',
  };
}

function scoreOverEarly(
  goal: GoalItem,
  _progress: number,
  isComplete: boolean,
  holidays: Set<string>,
  today: Date
): HealthStagnation {
  if (!goal.endDate || !isComplete) return { penalty: 0, hint: '' };
  const end = new Date(goal.endDate + 'T00:00:00');
  end.setHours(0, 0, 0, 0);
  const daysEarly = workdaysBetween(today, end, holidays);
  if (daysEarly > TUNING.TOLERANCE_EARLY_DAYS) {
    const penalty = Math.min(
      TUNING.OVER_EARLY_PENALTY_MAX,
      daysEarly * TUNING.OVER_EARLY_PENALTY_RATE
    );
    return { penalty: Math.round(penalty), hint: `过度超前${daysEarly}天` };
  }
  return { penalty: 0, hint: '' };
}

function scoreDelay(
  goal: GoalItem,
  _progress: number,
  _isComplete: boolean,
  holidays: Set<string>,
  today: Date
): HealthStagnation {
  if (!goal.endDate) return { penalty: 0, hint: '' };
  const end = new Date(goal.endDate + 'T00:00:00');
  end.setHours(0, 0, 0, 0);
  const daysLate = workdaysBetween(end, today, holidays);
  if (daysLate > TUNING.TOLERANCE_DELAY_DAYS) {
    const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, daysLate * TUNING.DELAY_PENALTY_RATE);
    return { penalty: Math.round(penalty), hint: `拖延${daysLate}天` };
  }
  return { penalty: 0, hint: '' };
}

function scoreL3(
  goal: GoalItem,
  items: GoalSubItem[],
  progress: number,
  isComplete: boolean,
  cache: DeviationCache,
  holidays: Set<string>,
  today: Date
): HealthL3 {
  const stagnation = scoreStagnation(goal, items, progress, isComplete, cache, holidays, today);
  const balance = scoreBalance(items, isComplete);
  const overEarly = scoreOverEarly(goal, progress, isComplete, holidays, today);
  const delay = scoreDelay(goal, progress, isComplete, holidays, today);

  let score = 100;
  score -= stagnation.penalty;
  score = score * (1 - TUNING.L3_BALANCE) + balance.score * TUNING.L3_BALANCE;
  score -= overEarly.penalty;
  score -= delay.penalty;

  return {
    score: clamp(Math.round(score), 0, 100),
    stagnation,
    balance,
    overEarly,
    delay,
  };
}

function levelFor(score: number): HealthLevel {
  if (score >= TUNING.LEVEL_EXCELLENT) return 'excellent';
  if (score >= TUNING.LEVEL_GOOD) return 'good';
  if (score >= TUNING.LEVEL_WARNING) return 'warning';
  return 'risk';
}

/** 单目标健康分（含 L1/L2/L3 明细 + 总分 + 等级） */
export function computeGoalHealth(
  goal: GoalItem,
  cache: DeviationCache,
  today: Date
): HealthResult {
  const items = Array.isArray(goal.items) ? goal.items : [];
  const progress = clamp(Number(goal.progress) || 0, 0, 100);
  const isComplete = progress >= 100;
  // 统一归一为当日 0 点，避免 hours 偏差影响工作日/停滞判定
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const holidays = _getHolidays(t.getFullYear());

  const L1 = scoreL1(goal, items, progress, isComplete, cache, holidays, t);
  const L2 = scoreL2(goal, items, progress, isComplete, cache, holidays, t);
  const L3 = scoreL3(goal, items, progress, isComplete, cache, holidays, t);

  const score = clamp(
    Math.round(
      L1.score * TUNING.WEIGHT_L1 +
        L2.score * TUNING.WEIGHT_L2 +
        L3.score * TUNING.WEIGHT_L3
    ),
    0,
    100
  );
  const level = levelFor(score);

  return {
    score,
    level,
    label: LEVELS[level].label,
    color: LEVELS[level].color,
    L1,
    L2,
    L3,
  };
}

/** 目标集健康分聚合（多维平均分 + 综合趋势） */
export function computeHealthSet(
  goals: GoalItem[],
  cache: DeviationCache,
  today: Date
): HealthSet {
  if (!goals || goals.length === 0) {
    return {
      avgScore: 0,
      avgLevel: 'risk',
      avgLabel: '—',
      avgColor: '#999',
      count: 0,
      L1: 0,
      L2: 0,
      L3: 0,
      trend: 0,
    };
  }

  const results = goals.map((g) => computeGoalHealth(g, cache, today));
  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const avgL1 = Math.round(results.reduce((s, r) => s + r.L1.score, 0) / results.length);
  const avgL2 = Math.round(results.reduce((s, r) => s + r.L2.score, 0) / results.length);
  const avgL3 = Math.round(results.reduce((s, r) => s + r.L3.score, 0) / results.length);
  const avgLevel = levelFor(avgScore);

  let trend = 0;
  const avgL2Score = results.reduce((s, r) => s + r.L2.score, 0) / results.length;
  if (avgL2Score >= TUNING.TREND_STRONG_HIGH) trend = 3;
  else if (avgL2Score >= TUNING.TREND_WEAK_HIGH) trend = 1;
  else if (avgL2Score < TUNING.TREND_STRONG_LOW) trend = -3;
  else if (avgL2Score < TUNING.TREND_WEAK_LOW) trend = -1;

  return {
    avgScore,
    avgLevel,
    avgLabel: LEVELS[avgLevel].label,
    avgColor: LEVELS[avgLevel].color,
    count: goals.length,
    L1: avgL1,
    L2: avgL2,
    L3: avgL3,
    trend,
  };
}

/**
 * 按「维度」生成健康归因 hints（移植 webapp generateDynamicHints，
 * 每条额外标注 dimension，供诊断提示词按维度对齐建议）。
 */
export function generateHealthHints(result: HealthResult, _set?: HealthSet): HealthHint[] {
  const hints: HealthHint[] = [];

  if (result.L1.score < TUNING.HINT_L1) {
    if (result.L1.onTime.score < TUNING.HINT_LATE_GOAL_SCORE) {
      hints.push({
        dimension: 'L1',
        type: 'danger',
        icon: 'calendar',
        text: '算法检测到该目标进度严重落后于计划。',
        action: '根据当前完成速率，建议调整截止日期或精简任务子项。',
      });
    } else if (result.L1.score < 50) {
      hints.push({
        dimension: 'L1',
        type: 'warning',
        icon: 'zap',
        text: '系统监测到本周活跃天数未达标。',
        action: '数据表明：小步快跑的频率比单次长时间投入更有助于维持目标健康。',
      });
    }
  }

  if (result.L2.score < TUNING.HINT_L2) {
    hints.push({
      dimension: 'L2',
      type: 'warning',
      icon: 'trending-up',
      text: '动力指数下降：近期进度增量低于历史平均水平。',
      action: '执行动力进入瓶颈期，建议通过完成一个简单的子项来重新激活惯性。',
    });
  }

  // 按「子维度」各自触发（不卡 composite L3.score，否则单目标偏科会被掩盖）
  if (result.L3.stagnation.penalty > TUNING.HINT_STAGNATION_PENALTY) {
    hints.push({
      dimension: 'L3',
      type: 'danger',
      icon: 'clock',
      text: '检测到该目标已停滞超过预期阈值。',
      action: '长期停滞会显著降低完成概率，建议立即复查项目可行性。',
    });
  }
  if (result.L3.balance.score < TUNING.HINT_BALANCE_SCORE) {
    hints.push({
      dimension: 'L3',
      type: 'warning',
      icon: 'scale',
      text: '子项方差过大：项目内部进度分布严重不均。',
      action: '关注被长期忽略的边缘子项，防止项目后期出现结构性崩塌。',
    });
  }

  if (result.score >= TUNING.HINT_HIGH_SCORE) {
    hints.push({
      dimension: 'L1',
      type: 'success',
      icon: 'sparkles',
      text: '算法评估：战略执行力处于极高水平。',
      action: '当前数据模型显示你已建立稳固的习惯闭环，建议保持现状。',
    });
  } else if (hints.length === 0) {
    hints.push({
      dimension: 'L1',
      type: 'success',
      icon: 'check-circle',
      text: '系统评估：各维度数据指标平稳。',
      action: '当前节奏可持续，可尝试逐步增加任务负荷。',
    });
  }

  return hints;
}

/** 返回最弱维度键，并列最低时按权重取（L1 > L2 > L3） */
export function weakestDimension(r: HealthResult): HealthDimension {
  const arr: Array<{ dim: HealthDimension; score: number; weight: number }> = [
    { dim: 'L1', score: r.L1.score, weight: TUNING.WEIGHT_L1 },
    { dim: 'L2', score: r.L2.score, weight: TUNING.WEIGHT_L2 },
    { dim: 'L3', score: r.L3.score, weight: TUNING.WEIGHT_L3 },
  ];
  let min = arr[0];
  for (const x of arr) {
    if (x.score < min.score) min = x;
    else if (x.score === min.score && x.weight > min.weight) min = x;
  }
  return min.dim;
}
