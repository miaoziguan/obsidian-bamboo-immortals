/**
 * runDiagnosis — 「AI 诊断 → 行动闭环」命令编排（纯逻辑，可单测）
 *
 * 只负责流程决策，不持有任何 Obsidian / DOM 依赖：
 *  - aiEnabled 门禁 → 无目标 → 读 goals + 近 N 天 days → diagnose → 打开只读报告；
 *  - 报告里点「应用」→ 打开 AgenticPlanModal（载入真实树 + 预填建议指令）；
 *  - Agentic 确认 → writeGoals 落库。
 * 所有副作用（读存储 / 打开 Modal / Notice / 落库）均通过 deps 注入，便于单测。
 */
import type { PlannerSettings } from './MarkdownPlanner';
import type { GoalItem, DayData } from '../types/data';
import { diagnose, type DiagnosisResult, type GoalDiagnosis } from './GoalDiagnoser';
import type { AgenticPlanOptions } from './AgenticPlanModal';

export interface DiagnosisStorage {
  getGoals(): Promise<GoalItem[]>;
  getDayKeys(): Promise<string[]>;
  getDay(key: string): Promise<DayData | null>;
}

export interface DiagnosisDeps {
  aiEnabled: boolean;
  plannerSettings: PlannerSettings;
  storage: DiagnosisStorage;
  diagnose: typeof diagnose;
  openDiagnosis: (opts: { diagnosis: DiagnosisResult; onApply: (goal: GoalDiagnosis) => void }) => void;
  openAgentic: (opts: AgenticPlanOptions) => void;
  writeGoals: (goals: GoalItem[]) => Promise<void> | void;
  notice: (msg: string) => void;
  recentDays?: number;
}

export async function runDiagnosis(deps: DiagnosisDeps): Promise<void> {
  if (!deps.aiEnabled) {
    deps.notice('AI 诊断未启用：请先在插件设置中开启并填写 API Key');
    return;
  }

  const goals = await deps.storage.getGoals();
  if (goals.length === 0) {
    deps.notice('你还没有目标，先跑一次 AI 规划');
    return;
  }

  const keys = (await deps.storage.getDayKeys()).slice(0, deps.recentDays ?? 14);
  const days: DayData[] = [];
  for (const k of keys) {
    const d = await deps.storage.getDay(k);
    if (d) days.push(d);
  }

  const result = await deps.diagnose(goals, days, deps.plannerSettings);

  deps.openDiagnosis({
    diagnosis: result,
    onApply: (goal) => {
      deps.openAgentic({
        content: '',
        scope: 'note',
        settings: deps.plannerSettings,
        goals,
        initialInstruction: goal.suggestions.join('；'),
        onConfirm: (finalGoals) => void deps.writeGoals(finalGoals),
      });
    },
  });
}
