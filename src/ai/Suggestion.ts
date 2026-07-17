/**
 * Suggestion — 诊断建议的结构化表示 + 确定性改写（#7）
 *
 * 设计意图：把「自然语言建议」升级为「结构化建议」，使其能**精准命中具体子项**，
 * 而不依赖 AgenticPlanModal 里 AI 对自然语言的二次猜测（diagnosis-action-loop-design §7 风险）。
 *
 * 关键约束：
 *  - 子项无 id，只能按「子项名（主）/ 下标（备）」确定性匹配；
 *  - applySuggestion 完全纯函数、不可变：返回新数组，绝不 mutate 入参；
 *  - 目标/子项未命中 → applied=false、原树不动（容错，绝不抛错）。
 *
 * 零 Obsidian 依赖，便于单测。
 */
import type { GoalItem, GoalSubItem } from '../types/data';

export type SuggestionAction =
  | 'adjust_dailyMin' // 改子项每日量
  | 'remove_subitem' // 删除子项
  | 'add_subitem' // 新增子项
  | 'note'; // 仅文案，无结构改动

export interface SuggestionTarget {
  /** 精确子项名（主匹配键，prompt 要求与真实清单一致） */
  subItemName?: string;
  /** 子项下标（备选匹配键） */
  subItemIndex?: number;
}

export interface SuggestionParams {
  /** adjust_dailyMin 的新值（纯数字，落到 GoalSubItem.dailyMin 字符串） */
  dailyMin?: number;
  /** add_subitem 的名称 */
  name?: string;
  /** add_subitem 的节奏类型 */
  taskDayType?: string;
  detail?: string;
}

export interface Suggestion {
  id?: string;
  action: SuggestionAction;
  /** 目标引用：优先 goalId，回退 title（可选，运行时按 goalId 或 title 命中） */
  goalRef: { goalId?: string; goalTitle?: string };
  /** 命中的具体子项 */
  target?: SuggestionTarget;
  params?: SuggestionParams;
  /** 人类可读文案（DiagnosisModal 展示用，保留） */
  text: string;
  rationale?: string;
  /** 聚焦维度（L1/L2/L3），仅供维度标签展示 */
  dimension?: 'L1' | 'L2' | 'L3';
}

export interface ApplyResult {
  goals: GoalItem[];
  /** 是否实际发生了结构改动 */
  applied: boolean;
  message?: string;
}

function clone(goals: GoalItem[]): GoalItem[] {
  return JSON.parse(JSON.stringify(goals)) as GoalItem[];
}

function findGoal(goals: GoalItem[], s: Suggestion): GoalItem | undefined {
  return goals.find(
    (g) =>
      (s.goalRef.goalId != null && g.id === s.goalRef.goalId) ||
      g.title === s.goalRef.goalTitle
  );
}

function findItemIndex(items: GoalSubItem[], t?: SuggestionTarget): number {
  if (!t) return -1;
  if (t.subItemName != null) {
    const i = items.findIndex((it) => it.name === t.subItemName);
    if (i >= 0) return i;
  }
  if (t.subItemIndex != null && t.subItemIndex >= 0 && t.subItemIndex < items.length) {
    return t.subItemIndex;
  }
  return -1;
}

/**
 * 确定性改写单条建议：返回**新** goals（不 mutate 入参）。
 * 未命中目标/子项 或 参数非法 → applied=false、原树不动。
 */
export function applySuggestion(s: Suggestion, goals: GoalItem[]): ApplyResult {
  const goal = findGoal(goals, s);
  if (!goal) {
    return { goals, applied: false, message: '未找到目标' };
  }

  const working = clone(goals);
  const g = working.find(
    (x) =>
      (s.goalRef.goalId != null && x.id === s.goalRef.goalId) ||
      x.title === s.goalRef.goalTitle
  )!;

  switch (s.action) {
    case 'adjust_dailyMin': {
      const items = g.items ?? [];
      const idx = findItemIndex(items, s.target);
      const v = s.params?.dailyMin;
      if (idx < 0 || typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
        return { goals, applied: false, message: '子项未命中或 dailyMin 非法' };
      }
      g.items = items.slice();
      g.items[idx] = { ...items[idx], dailyMin: String(Math.max(0, Math.round(v))) };
      return { goals: working, applied: true };
    }
    case 'remove_subitem': {
      const items = g.items ?? [];
      const idx = findItemIndex(items, s.target);
      if (idx < 0) {
        return { goals, applied: false, message: '子项未命中' };
      }
      g.items = items.filter((_, i) => i !== idx);
      return { goals: working, applied: true };
    }
    case 'add_subitem': {
      const name = s.params?.name;
      if (!name) {
        return { goals, applied: false, message: '新增子项缺 name' };
      }
      const items = g.items ?? [];
      if (items.some((it) => it.name === name)) {
        return { goals, applied: false, message: '子项已存在，跳过新增' };
      }
      const add: GoalSubItem = { name };
      if (typeof s.params?.dailyMin === 'number' && Number.isFinite(s.params.dailyMin)) {
        add.dailyMin = String(Math.max(0, Math.round(s.params.dailyMin)));
      }
      if (s.params?.taskDayType != null) add.taskDayType = s.params.taskDayType;
      if (s.params?.detail != null) add.detail = s.params.detail;
      g.items = [...items, add];
      return { goals: working, applied: true };
    }
    case 'note':
    default:
      return { goals, applied: false };
  }
}

/** 折叠应用多条建议（从左到右）；单条未命中不影响其余。 */
export function applySuggestions(list: Suggestion[], goals: GoalItem[]): ApplyResult {
  let current = goals;
  let appliedAny = false;
  for (const s of list) {
    const r = applySuggestion(s, current);
    if (r.applied) {
      appliedAny = true;
      current = r.goals;
    }
  }
  return { goals: current, applied: appliedAny };
}
