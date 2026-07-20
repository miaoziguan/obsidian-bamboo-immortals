/**
 * strategyOverview.ts — 战略复盘总览聚合（插件侧，供竹杖芒鞋消费）
 *
 * 把「逐目标健康分（healthScore 纯引擎）」与「数据概览（goalStats 纯聚合）」
 * 打包成一份结构化快照 StrategyOverview，由 BambooReviewPlugin.getStrategyOverview()
 * 在每次被调用时即时重算（零 AI、确定性），即竹杖芒鞋「一键重新诊断」的底层实现。
 */

import type { GoalItem } from "../types/data";
import { computeGoalHealth, computeHealthSet } from "./healthScore";
import type { HealthLevel, HealthResult, HealthSet } from "./healthScore";
import { calculateGoalStats, type GoalStats } from "./goalStats";
import type { DeviationCache } from "./DeviationCalculator";

/** 单目标健康卡（竹杖芒鞋侧栏/抽屉直接消费的精简形状） */
export interface GoalHealthCard {
  id: string;
  title: string;
  level: HealthLevel;
  label: string;
  color: string;
  score: number;
  l1: number;
  l2: number;
  l3: number;
  progress: number;
  statusText: string;
}

/** 战略复盘总览快照 */
export interface StrategyOverview {
  /** ISO 时间戳，竹杖芒鞋据此展示「更新于 xx:xx」 */
  updatedAt: string;
  /** 逐目标健康卡 */
  goals: GoalHealthCard[];
  /** 数据概览聚合 */
  overview: GoalStats;
  /** 权威整体健康分（由 computeHealthSet 即时算出，竹杖芒鞋直接消费，避免二次平均） */
  health: HealthSet;
  /**
   * 逐目标完整健康分明细（含 L1/L2/L3 子项 hint）。
   * 供 webapp「健康分详情」弹窗消费，与竹杖芒鞋同源同算、单一数据源，
   * 避免插件与前端各维护一份引擎导致的漂移。
   */
  results: HealthResult[];
}

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

/** 由健康明细推导一句状态文案（停滞 > 进度时效 > 等级） */
function deriveStatusText(h: HealthResult): string {
  const parts: string[] = [];
  if (h.L3.stagnation.penalty > 0 && h.L3.stagnation.hint) {
    parts.push(h.L3.stagnation.hint);
  }
  if (h.L1.onTime.hint) parts.push(h.L1.onTime.hint);
  const txt = parts.filter(Boolean).join(" · ");
  return txt || h.label;
}

/**
 * 聚合战略复盘快照。
 * @param goals 目标数组（来自 goals.json）
 * @param cache DeviationCalculator.buildCache 产出的偏离缓存（来自每日执行数据）
 * @param today 计算基准日（注入，便于单测）
 */
export function buildStrategyOverview(
  goals: GoalItem[],
  cache: DeviationCache,
  today: Date,
): StrategyOverview {
  const goalHealths: GoalHealthCard[] = [];
  const results: HealthResult[] = [];
  for (const g of goals) {
    const h = computeGoalHealth(g, cache, today);
    results.push(h);
    const progress = clamp(Number(g.progress) || 0, 0, 100);
    goalHealths.push({
      id: g.id,
      title: g.title ?? "(未命名目标)",
      level: h.level,
      label: h.label,
      color: h.color,
      score: h.score,
      l1: h.L1.score,
      l2: h.L2.score,
      l3: h.L3.score,
      progress,
      statusText: deriveStatusText(h),
    });
  }

  const overview = calculateGoalStats(goals);
  const set = computeHealthSet(goals, cache, today);

  return {
    updatedAt: new Date().toISOString(),
    goals: goalHealths,
    overview,
    health: set,
    results,
  };
}
