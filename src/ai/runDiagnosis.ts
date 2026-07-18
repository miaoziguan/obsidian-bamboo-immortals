/**
 * runDiagnosis — 「AI 诊断 → 行动闭环」命令编排（纯逻辑，可单测）
 *
 * 只负责流程决策，不持有任何 Obsidian / DOM 依赖：
 *  - aiEnabled 门禁 → 无目标 → 读 goals + 近 N 天 days → diagnose → 打开只读报告；
 *  - 报告里点「应用」→ 打开 AgenticPlanModal（载入真实树 + 预填建议指令）；
 *  - Agentic 确认 → writeGoals 落库。
 * 所有副作用（读存储 / 打开 Modal / Notice / 落库）均通过 deps 注入，便于单测。
 *
 * ── 双路径出口状态机（应用建议时）───────────────────────────────────
 * 入口：报告里 onApply / onApplyAll / onApplyAllDiagnosis
 *    │
 *    ▼
 * ① 确定性改写（applySuggestion / applySuggestions，纯函数、按子项名/下标精准命中）
 *    │  res.applied === false → Notice 退出（未改动）
 *    ▼
 * ② openApplyPreview（聚焦 diff 预览 + 人工闸门）
 *    │
 *    ├─ onConfirm     → writeGoals 落库           【主路径：确定性落库，结束】
 *    │
 *    └─ onEscalateAI → openAgentic（载入改写后树，让 AI 再打磨）
 *                        │
 *                        ▼
 *                     Agentic 确认 → writeGoals 落库   【可选路径：AI 再打磨，结束】
 *
 * 设计意图：AI 只「提建议」，确定性程序「保准确」；升级 Agentic 是可选项，
 * 不是确定性应用后的默认下一步（避免双重确认疲劳）。
 * ─────────────────────────────────────────────────────────────────────
 */
import type { PlannerSettings } from './MarkdownPlanner';
import type { GoalItem, DayData } from '../types/data';
import { diagnose, type DiagnosisResult, type GoalDiagnosis } from './GoalDiagnoser';
import { applySuggestion, applySuggestions, type Suggestion } from './Suggestion';
import { buildCache, buildItemEvidenceMap, type ItemEvidence } from './DeviationCalculator';
import { TUNING } from './healthScore';
import type { AgenticPlanOptions } from './AgenticPlanModal';

export interface DiagnosisStorage {
  getGoals(): Promise<GoalItem[]>;
  getDayKeys(): Promise<string[]>;
  getDay(key: string): Promise<DayData | null>;
}

/** 诊断编排阶段（用于分阶段进度指示，替代 ⑤ 流式 SSE 逐字） */
export type DiagnosisPhase = 'collect' | 'analyze' | 'ai' | 'render' | 'done';

/** 阶段中文标签（与 DiagnosisProgressModal 共用，保持单一来源） */
export const DIAGNOSIS_PHASE_LABEL: Record<DiagnosisPhase, string> = {
  collect: '收集目标与执行记录',
  analyze: '计算三维健康分与偏差',
  ai: '调用 AI 诊断中…',
  render: '解析诊断结果',
  done: '完成',
};

/** SuggestionApplyModal 的入参（聚焦预览 + 人工闸门） */
export interface ApplyPreviewOpts {
  suggestions: Suggestion[];
  before: GoalItem[];
  after: GoalItem[];
  onConfirm: (goals: GoalItem[]) => void;
  onEscalateAI?: (goals: GoalItem[]) => void;
  title?: string;
}

export interface DiagnosisDeps {
  aiEnabled: boolean;
  plannerSettings: PlannerSettings;
  storage: DiagnosisStorage;
  diagnose: typeof diagnose;
  openDiagnosis: (opts: {
    diagnosis: DiagnosisResult;
    itemEvidence?: Record<string, ItemEvidence[]>;
    /** 逐条应用：点某条建议传入 (goal, suggestion)（#7 结构化） */
    onApply: (goal: GoalDiagnosis, suggestion: Suggestion) => void;
    /** 可选：应用该 goal 全部建议 */
    onApplyAll?: (goal: GoalDiagnosis) => void;
    /** 可选：报告级「一键应用全部建议」（MVP-2），跨所有目标批量 */
    onApplyAllDiagnosis?: () => void;
  }) => void;
  /** 确定性改写后的聚焦预览（#7） */
  openApplyPreview: (opts: ApplyPreviewOpts) => void;
  openAgentic: (opts: AgenticPlanOptions) => void;
  writeGoals: (goals: GoalItem[]) => Promise<void> | void;
  notice: (msg: string) => void;
  recentDays?: number;
  /** 可选：分阶段进度指示（替代 ⑤ 流式 SSE 逐字），编排各边界发事件 */
  onPhase?: (phase: DiagnosisPhase, label: string) => void;
}

export async function runDiagnosis(deps: DiagnosisDeps): Promise<void> {
  const emit = (p: DiagnosisPhase) => deps.onPhase?.(p, DIAGNOSIS_PHASE_LABEL[p]);

  // H6：写回前重新拉取最新目标库，仅以「被本次建议命中的目标」覆盖，
  // 写回失败时转成用户可见提示，避免 fire-and-forget 的 void 调用吞掉写入异常（#L10）
  const writeGoalsSafe = (goals: GoalItem[]) =>
    Promise.resolve()
      .then(() => deps.writeGoals(goals))
      .catch((e) =>
        deps.notice(`应用 AI 建议失败：${e instanceof Error ? e.message : '写入目标库出错'}`),
      );

  // 写回前重新拉取最新目标库，仅覆盖本次诊断命中的目标，避免陈旧快照覆盖外部改动（诊断快照陈旧问题）。
  // final 可能为单对象（单条应用）或数组（批量应用），需保持入参形状回写。
  const writeMergedWithLatest = async (final: GoalItem | GoalItem[], hitGoalIds: string[]): Promise<void> => {
    try {
      const hit = new Set(hitGoalIds);
      if (hit.size === 0) {
        await deps.writeGoals(final as GoalItem[]);
        return;
      }
      const latest = await deps.storage.getGoals().catch(() => null);
      if (!latest) {
        await deps.writeGoals(final as GoalItem[]);
        return;
      }
      const finals = Array.isArray(final) ? final : [final];
      const finalById = new Map(finals.map((g) => [g.id, g]));
      const merged = latest.map((g) => (hit.has(g.id) ? (finalById.get(g.id) ?? g) : g));
      // 仅追加 final 中「被命中且 latest 不存在」的新目标（如 AI 新增），未命中目标不追加以尊重外部删除
      for (const g of finals) {
        if (hit.has(g.id) && !merged.some((m) => m.id === g.id)) merged.push(g);
      }
      // 保持 onConfirm 入参形状：单对象则回写对应单对象（兼容历史单对象写回），否则回写合并数组
      if (!Array.isArray(final)) {
        const only = merged.find((g) => g.id === final.id) ?? final;
        await deps.writeGoals(only as unknown as GoalItem[]);
      } else {
        await deps.writeGoals(merged);
      }
    } catch (e) {
      deps.notice(`应用 AI 建议失败：${e instanceof Error ? e.message : '写入目标库出错'}`);
    }
  };

  if (!deps.aiEnabled) {
    deps.notice('AI 诊断未启用：请先在插件设置中开启并填写 API Key');
    return;
  }

  emit('collect'); // ① 收集目标与执行记录
  const all = await deps.storage.getGoals();
  if (all.length === 0) {
    deps.notice('你还没有目标，先跑一次 AI 规划');
    return;
  }

  // 只诊断进行中的目标，已归档目标（archived=true）不参与
  const goals = all.filter((g) => !g.archived);
  if (goals.length === 0) {
    deps.notice('当前没有进行中的目标（已归档目标不参与诊断）');
    return;
  }

  // 健康分停滞判定需回溯 STAGNATION_WINDOW(60) 个工作日，故拉取窗口不小于此
  const windowDays = Math.max(deps.recentDays ?? 14, TUNING.STAGNATION_WINDOW);
  const keys = (await deps.storage.getDayKeys()).slice(0, windowDays);
  const days: DayData[] = [];
  for (const k of keys) {
    const d = await deps.storage.getDay(k);
    if (d) days.push(d);
  }

  // 基于真实子项 + 完成记录，给报告弹窗提供证据
  emit('analyze'); // ② 计算三维健康分与偏差
  const cache = buildCache(goals, days);
  const itemEvidence = buildItemEvidenceMap(goals, cache);

  emit('ai'); // ③ 调用 AI 诊断（主要耗时）
  const result = await deps.diagnose(goals, days, deps.plannerSettings);

  emit('render'); // ④ 解析诊断结果
  // 补全每条诊断结果的原目标 id，供报告弹窗按 id 索引子项证据（解决重名目标证据互相覆盖 #M9）
  const idByTitle = new Map(goals.map((g) => [g.title, g.id]));
  const diagnosisResult: DiagnosisResult =
    result.ok
      ? { ...result, goals: result.goals.map((g) => ({ ...g, id: idByTitle.get(g.title) ?? g.title })) }
      : result;
  deps.openDiagnosis({
    diagnosis: diagnosisResult,
    itemEvidence,
    onApply: (goal, suggestion) => {
      // #7：确定性改写，按子项名精准命中，不再交给 AI 二次猜测
      const res = applySuggestion(suggestion, goals);
      if (!res.applied) {
        deps.notice('该建议未匹配到目标/子项，未改动');
        return;
      }
      const hitIds = [suggestion.goalRef.goalId].filter(Boolean) as string[];
      deps.openApplyPreview({
        suggestions: [suggestion],
        before: goals,
        after: res.goals,
        onConfirm: (final) => void writeMergedWithLatest(final, hitIds),
        onEscalateAI: (final) =>
          deps.openAgentic({
            content: '',
            scope: 'note',
            settings: deps.plannerSettings,
            goals: final,
            onConfirm: (f) => void writeGoalsSafe(f),
          }),
        title: `应用建议 · ${goal.title}`,
      });
    },
    onApplyAll: (goal) => {
      const res = applySuggestions(goal.suggestions, goals);
      if (!res.applied) {
        deps.notice('该目标建议未匹配到目标/子项，未改动');
        return;
      }
      const hitIds = goal.suggestions.map((s) => s.goalRef.goalId).filter(Boolean) as string[];
      deps.openApplyPreview({
        suggestions: goal.suggestions,
        before: goals,
        after: res.goals,
        onConfirm: (final) => void writeMergedWithLatest(final, hitIds),
        onEscalateAI: (final) =>
          deps.openAgentic({
            content: '',
            scope: 'note',
            settings: deps.plannerSettings,
            goals: final,
            onConfirm: (f) => void writeGoalsSafe(f),
          }),
        title: `应用建议 · ${goal.title}`,
      });
    },
    onApplyAllDiagnosis: () => {
      // 坏 JSON 回退形态无 goals，直接退出
      if (!result.ok) return;
      // MVP-2：跨所有目标，把全部建议一次性确定性批量改写
      const all = result.goals.flatMap((g) => g.suggestions ?? []);
      if (all.length === 0) return;
      const res = applySuggestions(all, goals);
      if (!res.applied) {
        deps.notice('所有建议均未匹配到目标/子项，未改动');
        return;
      }
      const hitIds = all.map((s) => s.goalRef.goalId).filter(Boolean) as string[];
      deps.openApplyPreview({
        suggestions: all,
        before: goals,
        after: res.goals,
        onConfirm: (final) => void writeMergedWithLatest(final, hitIds),
        onEscalateAI: (final) =>
          deps.openAgentic({
            content: '',
            scope: 'note',
            settings: deps.plannerSettings,
            goals: final,
            onConfirm: (f) => void writeGoalsSafe(f),
          }),
        title: '一键应用全部建议',
      });
    },
  });
}
