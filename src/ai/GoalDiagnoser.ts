/**
 * GoalDiagnoser — AI 诊断（插件侧纯逻辑）
 *
 * 职责边界（与产品哲学一致）：
 *  - DeviationCalculator 算「硬指标」（偏差/停滞/趋势），本模块负责「为什么 + 怎么调」的归因；
 *  - 复用 PlanningSession 的 ChatMessage 类型与 extractChatText，全程 requestUrl 绕 CORS；
 *  - 坏 JSON → 回退 rawText 纯文本，绝不崩溃（与 PlanningSession 容错范式一致）。
 *
 * 零 Obsidian 依赖，fetchFn 可注入，便于单测。
 */
export type DiagnosisStatus = 'on_track' | 'behind' | 'stuck' | 'done' | 'at_risk';

export interface GoalDiagnosis {
  title: string;
  completion?: number;
  status: DiagnosisStatus;
  bottleneck?: string;
  suggestions: string[];
}

export interface Diagnosis {
  ok: true;
  summary: string;
  goals: GoalDiagnosis[];
  nextActions: string[];
}

export interface RawDiagnosis {
  ok: false;
  rawText: string;
}

export type DiagnosisResult = Diagnosis | RawDiagnosis;

const VALID_STATUS: ReadonlySet<string> = new Set([
  'on_track',
  'behind',
  'stuck',
  'done',
  'at_risk',
]);

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === 'string') as string[];
}

function normalizeGoal(raw: unknown): GoalDiagnosis {
  const g = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const status: DiagnosisStatus = typeof g.status === 'string' && VALID_STATUS.has(g.status)
    ? (g.status as DiagnosisStatus)
    : 'behind';
  const completion = typeof g.completion === 'number' ? g.completion : undefined;
  return {
    title: typeof g.title === 'string' ? g.title : '',
    completion,
    status,
    bottleneck: typeof g.bottleneck === 'string' ? g.bottleneck : undefined,
    suggestions: asStringArray(g.suggestions),
  };
}

/**
 * 解析 AI 诊断文本：合法 JSON → 结构化 Diagnosis（校验/补全字段）；
 * 坏 JSON / 非对象 → 回退 { ok:false, rawText }，绝不抛错。
 */
export function parseDiagnosis(text: string): DiagnosisResult {
  const trimmed = (text || '').trim();
  if (!trimmed) return { ok: false, rawText: trimmed };

  let obj: unknown;
  try {
    obj = JSON.parse(trimmed);
  } catch {
    return { ok: false, rawText: trimmed };
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, rawText: trimmed };
  }

  const o = obj as Record<string, unknown>;
  const goals = Array.isArray(o.goals)
    ? (o.goals as unknown[]).map(normalizeGoal)
    : [];
  return {
    ok: true,
    summary: typeof o.summary === 'string' ? o.summary : '',
    goals,
    nextActions: asStringArray(o.nextActions),
  };
}
