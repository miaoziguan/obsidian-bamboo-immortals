/**
 * goalStats.ts — 目标数据概览聚合（插件侧纯函数引擎，TS 移植）
 *
 * 与 webapp `GoalStatsCalculator.calculate` 100% 同口径，但：
 *  - 只读 `goals` 数组（goals.json），不碰每日执行数据、无 Obsidian、无 DOM；
 *  - 分类色板改用具体 hex（避免依赖 webapp 的 --bamboo-primary 变量）；
 *  - 零 AI、可单测、确定性。
 *
 * 这是竹杖芒鞋「战略复盘报告」中「数据概览」一块的数据来源。
 */

import { GOAL_CATEGORIES } from "../types/data";
import type { GoalItem } from "../types/data";
import { parseLocalDate, diffLocalDays } from "../utils/dateUtils";

export interface ProgressTiers {
  tier0_25: number;
  tier26_50: number;
  tier51_75: number;
  tier76_99: number;
  tier100: number;
}

export interface GoalStatsCategoryEntry {
  category: { id: string; name: string; icon?: string; color: string };
  avgProgress: number;
  goalCount: number;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  notStartedGoals: number;
  avgProgress: number;
  catStats: GoalStatsCategoryEntry[];
  upcomingGoals: Array<{ id?: string; title?: string; daysLeft: number }>;
  urgentGoals: Array<{ id?: string; title?: string; daysLeft: number }>;
  overdueGoals: Array<{ id?: string; title?: string; daysOverdue: number }>;
  recentlyCompleted: Array<{ id?: string; title?: string }>;
  progressTiers: ProgressTiers;
  stagnantGoals: Array<{ id?: string; title?: string }>;
  totalSubItems: number;
  completedSubItems: number;
  subItemCompletionRate: number;
  timeSpanStats: { shortTerm: number; mediumTerm: number; longTerm: number };
  activeGoals: number;
  highPriorityRate: number;
}

const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  work: "#4a90d9",
  personal: "#5A8A9A",
  health: "#9A5A5A",
  study: "#9A8A5A",
  finance: "#5A5A9A",
  other: "#8A8A8A",
};

const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * 目标统计计算：纯数据聚合（移植自 webapp GoalStatsCalculator.calculate）
 *
 * 「按天判定」一律走 utils/dateUtils 的本地日历口径（与 webapp 孪生逐字对齐）：
 * `new Date('YYYY-MM-DD')` 按 UTC 午夜解析，东八区下等价于把日界挪到本地 08:00
 * （本地 00:00–07:59 的「还剩/逾期/停滞」整体错 1 档），并在当天算出 `-0` —— 而
 * `-0 < 0 === false`，「逾期不足一天」会静默落进「还剩 0 天」。
 *
 * @param now 基准时刻，默认当前；显式注入以便确定性单测（对齐 healthScore 的 today 注入惯例）
 */
export function calculateGoalStats(
  goals: GoalItem[],
  now: Date = new Date(),
): GoalStats {
  const categories = GOAL_CATEGORIES as ReadonlyArray<{
    id: string;
    name: string;
    icon: string;
  }>;

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => toNum(g.progress) >= 100).length;
  const inProgressGoals = goals.filter((g) => {
    const p = toNum(g.progress);
    return p > 0 && p < 100;
  }).length;
  const notStartedGoals = goals.filter((g) => toNum(g.progress) === 0).length;
  const avgProgress =
    totalGoals > 0
      ? Math.round(goals.reduce((s, g) => s + toNum(g.progress), 0) / totalGoals)
      : 0;

  let totalSubItems = 0;
  let completedSubItems = 0;
  goals.forEach((g) => {
    if (g.items && g.items.length) {
      g.items.forEach((item) => {
        totalSubItems++;
        const current = toNum(item.currentValue);
        const target = toNum(item.targetValue);
        if (target > 0 && current >= target) completedSubItems++;
      });
    }
  });

  const highPriorityGoals = goals.filter((g) => g.priority === "high");
  const highPriorityCompleted = highPriorityGoals.filter(
    (g) => toNum(g.progress) >= 100,
  ).length;
  const activeGoals = goals.filter((g) => toNum(g.progress) > 0).length;
  const highPriorityRate =
    highPriorityGoals.length > 0
      ? Math.round((highPriorityCompleted / highPriorityGoals.length) * 100)
      : 0;

  const catStats: GoalStatsCategoryEntry[] = categories
    .map((cat) => {
      const catGoals = goals.filter((g) => g.category === cat.id);
      const avgProg =
        catGoals.length > 0
          ? Math.round(
              catGoals.reduce((s, g) => s + toNum(g.progress), 0) /
                catGoals.length,
            )
          : 0;
      const color = DEFAULT_CATEGORY_COLORS[cat.id] || "#8A8A8A";
      return {
        category: { id: cat.id, name: cat.name, icon: cat.icon, color },
        avgProgress: avgProg,
        goalCount: catGoals.length,
      };
    })
    .filter((s) => s.goalCount > 0);

  const upcomingGoals: GoalStats["upcomingGoals"] = [];
  const urgentGoals: GoalStats["urgentGoals"] = [];
  const overdueGoals: GoalStats["overdueGoals"] = [];
  const recentlyCompleted: GoalStats["recentlyCompleted"] = [];

  goals.forEach((goal) => {
    const isCompleted = toNum(goal.progress) >= 100;
    if (isCompleted) recentlyCompleted.push({ id: goal.id, title: goal.title });

    if (goal.endDate) {
      const endDate = parseLocalDate(goal.endDate);
      const daysToEnd = endDate === null ? null : diffLocalDays(now, endDate);
      if (daysToEnd === null) return; // 非法日期串：跳过（原 NaN 比较的显式化）
      if (daysToEnd < 0) {
        if (toNum(goal.progress) < 100) {
          overdueGoals.push({
            id: goal.id,
            title: goal.title,
            daysOverdue: Math.abs(daysToEnd),
          });
        }
      } else if (daysToEnd <= 3) {
        urgentGoals.push({
          id: goal.id,
          title: goal.title,
          daysLeft: daysToEnd,
        });
      } else if (daysToEnd <= 7) {
        upcomingGoals.push({
          id: goal.id,
          title: goal.title,
          daysLeft: daysToEnd,
        });
      }
    }
  });

  const progressTiers: ProgressTiers = {
    tier0_25: goals.filter((g) => {
      const p = toNum(g.progress);
      return p >= 0 && p <= 25;
    }).length,
    tier26_50: goals.filter((g) => {
      const p = toNum(g.progress);
      return p > 25 && p <= 50;
    }).length,
    tier51_75: goals.filter((g) => {
      const p = toNum(g.progress);
      return p > 50 && p <= 75;
    }).length,
    tier76_99: goals.filter((g) => {
      const p = toNum(g.progress);
      return p > 75 && p < 100;
    }).length,
    tier100: completedGoals,
  };

  const stagnantGoals: GoalStats["stagnantGoals"] = goals.filter((g) => {
    if (toNum(g.progress) >= 100) return false;
    if (!g.startDate) return true;
    const startDate = parseLocalDate(g.startDate);
    const daysSinceStart =
      startDate === null ? null : diffLocalDays(startDate, now);
    return daysSinceStart !== null && daysSinceStart > 14;
  });

  const subItemCompletionRate =
    totalSubItems > 0
      ? Math.round((completedSubItems / totalSubItems) * 100)
      : 0;

  const timeSpanStats = { shortTerm: 0, mediumTerm: 0, longTerm: 0 };
  goals.forEach((g) => {
    if (g.startDate && g.endDate) {
      const start = parseLocalDate(g.startDate);
      const end = parseLocalDate(g.endDate);
      const days =
        start === null || end === null ? null : diffLocalDays(start, end);
      if (days === null) return; // 非法日期串：跳过（原 NaN 比较的显式化）
      if (days < 30) timeSpanStats.shortTerm++;
      else if (days <= 90) timeSpanStats.mediumTerm++;
      else timeSpanStats.longTerm++;
    }
  });

  return {
    totalGoals,
    completedGoals,
    inProgressGoals,
    notStartedGoals,
    avgProgress,
    catStats,
    upcomingGoals,
    urgentGoals,
    overdueGoals,
    recentlyCompleted,
    progressTiers,
    stagnantGoals,
    totalSubItems,
    completedSubItems,
    subItemCompletionRate,
    timeSpanStats,
    activeGoals,
    highPriorityRate,
  };
}
