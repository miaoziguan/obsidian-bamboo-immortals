/**
 * DeviationCalculator — 目标执行偏差计算（插件侧纯函数）
 *
 * 镜像 webapp `GoalHealthScore._buildDataCache` 的真实数据信号：
 *  - DayData.goalTaskCompletions[goalId] = { 子项key: 是否完成 }  → 活跃/完成数
 *  - DayData.goalProgress[goalId] = number                         → 当日进度
 * 插件侧 getDay() 经 DayData 的索引签名 [key:string]: unknown 也能读到这两个字段。
 *
 * 职责边界（与产品哲学一致）：
 *  - 本模块只算「硬指标」（偏差率 / 停滞 / 趋势），不做因果归因；
 *  - 归因与可操作建议交给 GoalDiagnoser（AI），避免重复造轮子。
 *
 * 零 Obsidian 依赖，纯函数可单测。
 */
import type { DayData, GoalItem } from '../types/data';

export type DeviationStatus = 'on_track' | 'behind' | 'stuck' | 'done' | 'at_risk';

export interface DayCacheEntry {
  active: boolean;
  completions: number;
  progress?: number;
}

export interface DeviationCache {
  byDateKey: Record<string, Record<string, DayCacheEntry>>;
  goalIds: string[];
  /** 传入的日数据条数（含不含本目标记录的日期），用于停滞判定 */
  totalDays: number;
}

/** 兼容 webapp 的 DayData 未列出的字段（通过索引签名透传） */
interface RichDayData extends DayData {
  goalTaskCompletions?: Record<string, Record<string, unknown>>;
  goalProgress?: Record<string, number>;
}

/** 镜像 webapp _buildDataCache：按天聚合每个 goal 的活跃/完成/进度 */
export function buildCache(goals: GoalItem[], days: DayData[]): DeviationCache {
  const goalIds = (goals || []).map((g) => g.id);
  const byDateKey: Record<string, Record<string, DayCacheEntry>> = {};

  for (const raw of days || []) {
    const day = raw as RichDayData;
    const completionsByGoal = day.goalTaskCompletions;
    const progressMap = day.goalProgress;
    if (!completionsByGoal && !progressMap) continue;

    const entry: Record<string, DayCacheEntry> = {};
    for (const gid of goalIds) {
      let active = false;
      let count = 0;
      if (completionsByGoal && completionsByGoal[gid]) {
        const vals = Object.values(completionsByGoal[gid]);
        for (const v of vals) {
          if (v) {
            active = true;
            count++;
          }
        }
      }
      const prog = progressMap ? progressMap[gid] : undefined;
      if (active || prog !== undefined) {
        entry[gid] = { active, completions: count, progress: prog };
      }
    }
    if (Object.keys(entry).length > 0) {
      byDateKey[day.date] = entry;
    }
  }

  return { byDateKey, goalIds, totalDays: (days || []).length };
}

/** 含端点的工作日计数（周一~周五） */
function countWorkdays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (cur > last) return 0;
  while (cur <= last) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

export interface GoalDeviation {
  goalId: string;
  title: string;
  expectedProgress: number; // 0-100
  actualProgress: number; // 0-100
  deviationRate: number; // -1..1
  status: DeviationStatus;
  stagnation: boolean;
  recentActivity: number; // 近 7 天完成数
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** 计算单目标偏差（today 可注入便于单测） */
export function computeGoalDeviation(
  goal: GoalItem,
  cache: DeviationCache,
  today: Date = new Date()
): GoalDeviation {
  const start = parseDate(goal.startDate);
  const end = parseDate(goal.endDate);
  const actualProgress = clamp(Number(goal.progress) || 0, 0, 100);

  let expectedProgress: number;
  let hasDates = false;
  if (start && end && start <= end) {
    hasDates = true;
    const total = countWorkdays(start, end);
    const elapsed = countWorkdays(start, today);
    expectedProgress = total > 0 ? clamp((elapsed / total) * 100, 0, 100) : 50;
  } else {
    expectedProgress = 50; // 缺日期：保守中性基准
  }

  const diff = actualProgress - expectedProgress;
  const deviationRate = expectedProgress > 0 ? clamp((actualProgress - expectedProgress) / expectedProgress, -1, 1) : 0;

  // 停滞：窗口有日期、但该 goal 全程无任何 active（任务完成）天（done 不算停滞）
  const hadDays = cache.totalDays > 0;
  let everActive = false;
  let recentActivity = 0;
  const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  cutoff.setDate(cutoff.getDate() - 7);
  for (const [dateKey, entry] of Object.entries(cache.byDateKey)) {
    const e = entry[goal.id];
    if (!e) continue;
    if (e.active) everActive = true;
    const d = parseDate(dateKey);
    if (d && d >= cutoff) recentActivity += e.completions || 0;
  }
  const stagnation = hadDays && !everActive && actualProgress < 100;

  // 状态判定
  let status: DeviationStatus;
  if (actualProgress >= 100) {
    status = 'done';
  } else if (stagnation && diff < 0) {
    status = 'stuck';
  } else if (!hasDates) {
    // 缺日期：只给轻量判定，不标 stuck/at_risk
    status = diff < 0 ? 'behind' : 'on_track';
  } else if (diff <= -15) {
    status = 'at_risk';
  } else if (diff < 0) {
    status = 'behind';
  } else {
    status = 'on_track';
  }

  return {
    goalId: goal.id,
    title: goal.title,
    expectedProgress: Math.round(expectedProgress),
    actualProgress: Math.round(actualProgress),
    deviationRate,
    status,
    stagnation,
    recentActivity,
  };
}

/** 产出给 GoalDiagnoser 的紧凑指标文本（每目标一行） */
export function summarize(goals: GoalItem[], cache: DeviationCache, today: Date = new Date()): string {
  if (!goals || goals.length === 0) return '（无目标）';
  return goals
    .map((g) => {
      const d = computeGoalDeviation(g, cache, today);
      const flag = d.stagnation ? ' [停滞]' : '';
      return `- ${g.title}｜状态=${d.status}${flag}｜预期进度=${d.expectedProgress}% 实际=${d.actualProgress}%｜偏差=${(d.deviationRate * 100).toFixed(0)}%｜近7天完成=${d.recentActivity}`;
    })
    .join('\n');
}
