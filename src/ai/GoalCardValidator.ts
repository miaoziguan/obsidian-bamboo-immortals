/**
 * GoalCardValidator — AI 产出目标的校验与兜底（Phase 2）
 *
 * 对齐 webapp GoalService 期望的目标/子项结构：
 *  - 类型强转、缺失字段补默认、category 枚举非法回落 'other'；
 *  - 丢未知字段（避免 AI 乱塞字段污染 goals.json）；
 *  - classifyCompleteness 判定 complete / thin，并列出缺失维度，供审阅弹窗打 ⚠。
 *
 * 纯函数、零 Obsidian 依赖，便于单测。
 */

import {
  GOAL_CATEGORIES,
  type GoalItem,
  type GoalSubItem,
} from '../types/data';

export const DEFAULT_TASK_DAY_TYPE = 'daily';

const CATEGORY_SET = new Set<string>(GOAL_CATEGORIES.map((c) => c.id));

/**
 * 从子项名中提取单位（如"每天饮食热量上限(千卡)"→"千卡"，"每天阅读页数"→"页"），用于数字框后缀展示。
 * 被 AgenticPlanController（规划审阅台）复用。
 */
export function extractUnit(name: string): string {
  // 优先匹配括号中的单位："(千卡)" / "（小时）"
  const bracket = name.match(/[（(]([一-龥]+)[)）]/);
  if (bracket) return bracket[1];
  // 退化匹配：以"数"结尾（如"阅读页数"→"页"）
  const suffix = name.match(/每[一天日周月]?(.+?)数/);
  if (suffix) return suffix[1];
  return '';
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback;
}

/**
 * 清洗每日量为纯数字字符串（量化核心）。
 *  - "30" / "2.5" → 原样
 *  - "30分钟" / "7小时" / "200千卡" → 取前缀数字 "30" / "7" / "200"
 *  - "约30页" → 剥离非数字 → "30"
 *  - "每天坚持" / "" → ""（无法量化）
 * 目的：确保下游 parseInt 不产生 NaN，今日任务能正常生成。
 */
export function cleanDailyMin(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed;
  const prefix = trimmed.match(/^(\d+(?:\.\d+)?)/);
  if (prefix) return prefix[1];
  const stripped = trimmed.replace(/[^0-9.]/g, '');
  // 剥离后可能残留多余小数点（如 "3.5.2"），仅取首个合法数字
  const valid = stripped.match(/\d+(\.\d+)?/);
  return valid ? valid[0] : '';
}

/**
 * 【P0-3】排期节奏归一化：把 AI / 外部可能写出的节奏，映射到调度器**真正认得**的枚举。
 *
 * 背景：调度器 `GoalService.isTodayTaskDay` 只认
 *   daily / workday / weekend / custom_week / custom_month / interval
 * 六档，其余一律落到 `default: return true`。而提示词允许 AI 输出
 *   weekly / monthly / custom（MarkdownPlanner.ts:170,401）
 * —— 于是「每周体检一次」被当成每天任务派发，"每周"语义彻底丢失。
 * 同时 taskDayConfig 此前在 AI 侧根本不被携带，自定义排期无法表达。
 *
 * 映射（刻意**避开**依赖 startDate 的 interval：子项 startDate 常缺失，
 * 而 interval 分支遇 `!startDate` 会直接 return false，任务将**永不出现**，
 * 这比"每天出现"更糟）：
 *   weekly  → custom_week  + '1'   （每周一；只按星期几判定，不依赖 startDate）
 *   monthly → custom_month + '1'   （每月 1 号；只按日号判定，不依赖 startDate）
 *   custom  → daily                （无 config 可依，显式退化而非落 default 隐式兜底）
 */
export function normalizeTaskDay(
  rawType: unknown,
  rawConfig: unknown = ''
): { taskDayType: string; taskDayConfig: string } {
  const t = str(rawType).trim().toLowerCase();
  const c = str(rawConfig).trim();
  switch (t) {
    case 'workday': return { taskDayType: 'workday', taskDayConfig: '' };
    case 'weekend': return { taskDayType: 'weekend', taskDayConfig: '' };
    case 'weekly': return { taskDayType: 'custom_week', taskDayConfig: c || '1' };
    case 'monthly': return { taskDayType: 'custom_month', taskDayConfig: c || '1' };
    case 'custom_week':
    case 'custom_month':
    case 'interval':
      return { taskDayType: t, taskDayConfig: c };
    case 'custom':
    case 'daily':
    default:
      // custom 无 config 可依 → 显式 daily；其余未知值同 daily，不再让 default 分支隐式兜底
      return { taskDayType: 'daily', taskDayConfig: '' };
  }
}

/** 判断每日量是否已量化（纯数字，非空） */
function isQuantified(v: unknown): boolean {
  return typeof v === 'string' && /^\d+(\.\d+)?$/.test(v.trim());
}

/** 校验并补齐单个子项 */
export function sanitizeSubItem(raw: unknown, idx: number): GoalSubItem {
  const it = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const day = normalizeTaskDay(it.taskDayType ?? DEFAULT_TASK_DAY_TYPE, it.taskDayConfig);
  return {
    name: str(it.name) || `子项${idx + 1}`,
    percent: typeof it.percent === 'number' ? it.percent : undefined,
    detail: str(it.detail) || undefined,
    startDate: str(it.startDate),
    endDate: str(it.endDate),
    startValue: str(it.startValue),
    targetValue: str(it.targetValue),
    currentValue: str(it.currentValue),
    dailyMin: cleanDailyMin(it.dailyMin),
    taskDayType: day.taskDayType,
    taskDayConfig: day.taskDayConfig,
    sourceRef: str(it.sourceRef) || undefined,
  };
}

/** 校验并补齐单个目标（丢未知字段） */
export function sanitizeGoal(raw: unknown): GoalItem {
  const g = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const categoryRaw = str(g.category);
  const category = CATEGORY_SET.has(categoryRaw) ? categoryRaw : 'other';

  const itemsRaw = Array.isArray(g.items) ? g.items : [];
  const items = itemsRaw.map((it, i) => sanitizeSubItem(it, i));

  return {
    id: str(g.id) || `goal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title: str(g.title) || '未命名目标',
    // AI 归纳分析（仅展示用）：保留用户输入，避免被"丢未知字段"静默丢弃
    analysis: str(g.analysis) || undefined,
    // 严格禁止 AI 写入 icon 字段（icon 仅供手动创建的目标使用）
    meta: str(g.meta) || undefined,
    category,
    startDate: str(g.startDate),
    endDate: str(g.endDate),
    progress: num(g.progress, 0),
    priority: typeof g.priority === 'string' || typeof g.priority === 'number' ? g.priority : undefined,
    items,
    sourceRef: str(g.sourceRef) || undefined,
  };
}

/** 数组守卫 + 逐条 sanitize */
export function validateGoals(raw: unknown): GoalItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((g) => sanitizeGoal(g));
}

export interface CompletenessResult {
  level: 'complete' | 'thin';
  /** 缺失维度的人类可读标签：'每日量' / '截止日' / '分类' / '节奏' */
  missing: string[];
}

/**
 * 判定目标信息完整度。
 *
 * 产品哲学：目标必须「量化」，颗粒度为「日」。因此每日量的判据是
 * **所有子项都必须有纯数字 dailyMin**（而非"至少一个"），否则该子项
 * 无法生成今日任务，规划即失去核心价值。
 *
 * 缺失维度：
 *  - 每日量：存在未量化（非纯数字）子项 → `每日量（N 个子项未量化）`
 *  - 截止日：endDate 空
 *  - 分类：category 空
 *  - 节奏：存在 taskDayType 空的子项
 * 任一缺失即 thin（需在审阅弹窗补全）。
 */
export function classifyCompleteness(goal: GoalItem): CompletenessResult {
  const missing: string[] = [];

  if (!goal.category) missing.push('分类');

  if (!goal.endDate || goal.endDate.trim() === '') missing.push('截止日');

  const items = goal.items ?? [];
  if (items.length > 0) {
    const unquantified = items.filter((it) => !isQuantified(it.dailyMin)).length;
    if (unquantified > 0) missing.push(`每日量（${unquantified} 个子项未量化）`);

    // 【P1-6】起始值/目标值缺失 → 子项进度永远锁死 0%：
    // GoalService.completeGoalTask 的累加分支要求 startValue 或 targetValue 非空，
    // 否则勾选只加竹币、currentValue / percent 纹丝不动，目标永远无法 100%（也不计入境界）。
    // 而此前校验器不查这一项，审阅台照样显示「✓ 已量化，可写入」。
    // 仅对**已量化**的子项检查：纯习惯类目标（无 dailyMin）本就不走数值进度，不误报。
    const noTarget = items.filter(
      (it) =>
        isQuantified(it.dailyMin) &&
        str(it.startValue).trim() === '' &&
        str(it.targetValue).trim() === ''
    ).length;
    if (noTarget > 0) missing.push(`目标值（${noTarget} 个子项缺起始/目标值，进度将始终为 0%）`);

    const hasRhythm = items.every((it) => it.taskDayType && String(it.taskDayType).trim() !== '');
    if (!hasRhythm) missing.push('节奏');
  }

  return {
    level: missing.length > 0 ? 'thin' : 'complete',
    missing,
  };
}
