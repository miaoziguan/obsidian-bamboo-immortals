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
import { getHolidaysForRange, countWorkdays } from './workdayCalendar';

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
  /** 子项级完成计数：itemCompletions[goalId][index] = 该下标子项在窗口内完成的天数 */
  itemCompletions: Record<string, Record<string, number>>;
  /** 子项级最近完成日：itemLastDone[goalId][index] = 最近一次完成的日期(yyyy-mm-dd) */
  itemLastDone: Record<string, Record<string, string>>;
}

/** 单个真实子项的证据（供 AI 归因 + 弹窗展示） */
export interface ItemEvidence {
  index: number;
  name: string;
  dailyMin: string;
  /** 当前完成百分比（优先 items[].percent，否则由 currentValue/targetValue 推导） */
  percent: number | null;
  /** 按 startDate/endDate 与今日算出的「本应完成 %」（缺日期为 null） */
  pacePct: number | null;
  /** percent - pacePct（负数=落后节奏），缺日期为 null */
  paceDeviation: number | null;
  /** 窗口内该子项被标记完成的天数 */
  doneDays: number;
  /** 最近一次完成日期，无则为 null */
  lastDone: string | null;
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
  const itemCompletions: Record<string, Record<string, number>> = {};
  const itemLastDone: Record<string, Record<string, string>> = {};

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
        const gMap = completionsByGoal[gid];
        for (const [key, v] of Object.entries(gMap)) {
          if (v) {
            active = true;
            count++;
            // 子项级累计（key 即 items 下标）
            itemCompletions[gid] = itemCompletions[gid] || {};
            itemCompletions[gid][key] = (itemCompletions[gid][key] || 0) + 1;
            itemLastDone[gid] = itemLastDone[gid] || {};
            if (!itemLastDone[gid][key] || day.date > itemLastDone[gid][key]) {
              itemLastDone[gid][key] = day.date;
            }
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

  return { byDateKey, goalIds, totalDays: (days || []).length, itemCompletions, itemLastDone };
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
  const holidays = getHolidaysForRange(start ?? today, today);

  let expectedProgress: number;
  let hasDates = false;
  if (start && end && start <= end) {
    hasDates = true;
    const total = countWorkdays(start, end, holidays);
    const elapsed = countWorkdays(start, today, holidays);
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

/**
 * 子项级证据：把「真实子项 + 节奏偏差 + 完成记录」算出来，
 * 让 AI 诊断能基于真实数据归因，而不是凭空编造子项。
 */
export function buildItemEvidence(
  goal: GoalItem,
  cache: DeviationCache,
  today: Date = new Date()
): ItemEvidence[] {
  const items = goal.items ?? [];
  const gid = goal.id;
  return items.map((it, i) => {
    const idx = String(i);
    const done = cache.itemCompletions[gid]?.[idx] ?? 0;
    const last = cache.itemLastDone[gid]?.[idx] ?? null;

    let percent: number | null = null;
    if (typeof it.percent === 'number') {
      percent = it.percent;
    } else {
      const t = Number(it.targetValue);
      const c = Number(it.currentValue);
      if (t > 0) percent = clamp((c / t) * 100, 0, 100);
    }

    const start = parseDate(it.startDate ?? goal.startDate);
    const end = parseDate(it.endDate ?? goal.endDate);
    const holidays = getHolidaysForRange(start ?? today, today);
    let pacePct: number | null = null;
    if (start && end && start <= end) {
      const total = countWorkdays(start, end, holidays);
      const elapsed = countWorkdays(start, today, holidays);
      pacePct = total > 0 ? clamp((elapsed / total) * 100, 0, 100) : null;
    }
    const paceDeviation =
      percent != null && pacePct != null ? Math.round(percent - pacePct) : null;

    return {
      index: i,
      name: it.name,
      dailyMin: it.dailyMin ?? '',
      percent,
      pacePct,
      paceDeviation,
      doneDays: done,
      lastDone: last,
    };
  });
}

/** 按 goal.title 索引的子项证据（供 DiagnosisModal 展示） */
export function buildItemEvidenceMap(
  goals: GoalItem[],
  cache: DeviationCache,
  today: Date = new Date()
): Record<string, ItemEvidence[]> {
  const out: Record<string, ItemEvidence[]> = {};
  for (const g of goals || []) {
    const ev = buildItemEvidence(g, cache, today);
    out[g.id] = ev;
    out[g.title] = ev; // 双写：title 作为 AI 异常 title 时的回退索引
  }
  return out;
}

/** 给 AI 提示词的真实子项上下文文本（禁止编造的「白名单」） */
export function formatItemEvidenceForPrompt(
  goals: GoalItem[],
  cache: DeviationCache,
  today: Date = new Date()
): string {
  if (!goals || goals.length === 0) return '（无子项数据）';
  return goals
    .map((g) => {
      const evs = buildItemEvidence(g, cache, today);
      const lines = evs.length
        ? evs
            .map(
              (e) =>
                `    - [${e.index}] ${e.name}｜dailyMin=${e.dailyMin || '?'}｜完成度=${
                  e.percent != null ? e.percent + '%' : '?'
                }｜节奏应完成=${e.pacePct != null ? e.pacePct + '%' : '?'}｜节奏偏差=${
                  e.paceDeviation != null ? e.paceDeviation + 'pt' : '?'
                }｜窗口内完成 ${e.doneDays} 天（最近 ${e.lastDone ?? '无'}）`
            )
            .join('\n')
        : '    （无子项）';
      return `目标「${g.title}」（goalId=${g.id}）：\n${lines}`;
    })
    .join('\n');
}
