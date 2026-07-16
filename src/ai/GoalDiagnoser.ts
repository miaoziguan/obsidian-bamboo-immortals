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
import { requestUrl } from 'obsidian';
import type { ChatMessage } from './PlanningSession';
import { extractChatText } from './MarkdownPlanner';
import type { AiFetchFn, AiResponse, PlannerSettings } from './MarkdownPlanner';
import {
  buildCache,
  summarize,
  formatItemEvidenceForPrompt,
  type DeviationCache,
} from './DeviationCalculator';
import {
  computeGoalHealth,
  generateHealthHints,
  weakestDimension,
  type HealthLevel,
  type HealthDimension,
} from './healthScore';
import type { DayData, GoalItem } from '../types/data';

export type DiagnosisStatus = 'on_track' | 'behind' | 'stuck' | 'done' | 'at_risk';

/** 三维健康分维度中文标签（供提示词/摘要复用健康卡片词汇） */
const DIMENSION_LABEL: Record<HealthDimension, string> = {
  L1: '履约能力',
  L2: '趋势动力',
  L3: '可持续度',
};

export interface GoalDiagnosis {
  title: string;
  completion?: number;
  status: DiagnosisStatus;
  /** 健康分总分 0-100（来自三维健康模型，AI 归因应基于此而非「是否落后」） */
  healthScore?: number;
  /** 健康等级（优秀/良好/需关注/风险） */
  level?: HealthLevel;
  /** L1 履约能力分 */
  L1?: number;
  /** L2 趋势动力分 */
  L2?: number;
  /** L3 可持续度分 */
  L3?: number;
  /** 最弱维度：诊断与建议应聚焦于此 */
  weakest?: HealthDimension;
  bottleneck?: string;
  suggestions: string[];
  /** 本诊断聚焦的真实子项名（必须来自真实子项清单，禁止编造） */
  evidenceRef?: string;
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

const VALID_LEVEL: ReadonlySet<string> = new Set(['excellent', 'good', 'warning', 'risk']);
const VALID_DIMENSION: ReadonlySet<string> = new Set(['L1', 'L2', 'L3']);

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === 'string') as string[];
}

function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function normalizeGoal(raw: unknown): GoalDiagnosis {
  const g = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const status: DiagnosisStatus = typeof g.status === 'string' && VALID_STATUS.has(g.status)
    ? (g.status as DiagnosisStatus)
    : 'behind';
  const completion = typeof g.completion === 'number' ? g.completion : undefined;
  const level = typeof g.level === 'string' && VALID_LEVEL.has(g.level)
    ? (g.level as HealthLevel)
    : undefined;
  const weakest = typeof g.weakest === 'string' && VALID_DIMENSION.has(g.weakest)
    ? (g.weakest as HealthDimension)
    : undefined;
  return {
    title: typeof g.title === 'string' ? g.title : '',
    completion,
    status,
    healthScore: asNumber(g.healthScore),
    level,
    L1: asNumber(g.L1),
    L2: asNumber(g.L2),
    L3: asNumber(g.L3),
    weakest,
    bottleneck: typeof g.bottleneck === 'string' ? g.bottleneck : undefined,
    suggestions: asStringArray(g.suggestions),
    evidenceRef: typeof g.evidenceRef === 'string' ? g.evidenceRef : undefined,
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

/**
 * 构造「三维健康分」摘要文本（诊断的主信号）。
 *
 * 与 webapp 健康卡片同一套模型/词汇：
 *  - 每目标输出 健康分 + 等级（优秀/良好/需关注/风险）；
 *  - L1 履约能力 / L2 趋势动力 / L3 可持续度 三维分 + 关键子项 hint；
 *  - 最弱维度（诊断/建议应聚焦此维度）；
 *  - 按维度归因 hints（每条带 [L1]/[L2]/[L3] 前缀，供 AI 对齐建议维度）。
 *
 * 这是修复「AI 不理解健康分设计哲学」的核心：把三维模型 + 反直觉价值观
 * （领先≠健康 / 停滞指数级恶化 / 越均衡越健康）作为结构化事实喂给 AI。
 */
export function buildHealthSummary(
  goals: GoalItem[],
  cache: DeviationCache,
  today: Date
): string {
  if (!goals || goals.length === 0) return '（无目标数据）';
  const blocks = goals.map((goal) => {
    const r = computeGoalHealth(goal, cache, today);
    const weakest = weakestDimension(r);
    const dimLine = (key: HealthDimension, sub: string) =>
      `  · ${key} ${DIMENSION_LABEL[key]} ${r[key].score}分（${sub}）`;
    const l1sub = `按时:${r.L1.onTime.hint ?? '-'} / 适度:${r.L1.moderateEarly.hint ?? '-'} / 周活跃:${r.L1.weeklyActive.hint ?? '-'}`;
    const l2sub = `进度趋势:${r.L2.progressTrend.hint ?? '-'} / 完成趋势:${r.L2.completionTrend.hint ?? '-'}`;
    const l3subParts = [
      r.L3.stagnation.hint ? `停滞:${r.L3.stagnation.hint}` : '',
      r.L3.balance.hint ? `均衡:${r.L3.balance.hint}` : '',
      r.L3.overEarly.penalty > 0 && r.L3.overEarly.hint ? `超前:${r.L3.overEarly.hint}` : '',
      r.L3.delay.penalty > 0 && r.L3.delay.hint ? `拖延:${r.L3.delay.hint}` : '',
    ].filter(Boolean);
    const hints = generateHealthHints(r)
      .map((h) => `  归因[${h.dimension} ${DIMENSION_LABEL[h.dimension]}] ${h.text} → ${h.action}`)
      .join('\n');
    return [
      `目标「${goal.title}」健康分 ${r.score}/100（${r.label}）`,
      dimLine('L1', l1sub),
      dimLine('L2', l2sub),
      dimLine('L3', l3subParts.join(' / ') || '节奏健康'),
      `  最弱维度：${weakest} ${DIMENSION_LABEL[weakest]}`,
      hints,
    ].join('\n');
  });
  return blocks.join('\n\n');
}

/**
 * 构造诊断提示词：system 教入「三维健康分模型 + 反直觉价值观」，强制输出对齐健康卡片
 * 词汇（level/weakest）的 JSON；user 注入健康分三维摘要（主信号）+ 执行偏差 + 真实子项证据。
 *
 * 关键约束：下方「真实子项清单」是 AI 唯一允许引用的子项来源。
 * 任何建议都只能点名清单里真实存在的子项 + 真实 dailyMin/percent/节奏偏差，
 * 严禁凭空编造清单外的子项（如虚拟的「每日研发字量」）。
 */
export function buildDiagnosisMessages(
  summary: string,
  context?: string,
  healthSummary?: string
): ChatMessage[] {
  const contextBlock = context && context.trim() ? context : '（无子项数据）';
  const healthBlock = healthSummary && healthSummary.trim() ? healthSummary : '（无健康分数据）';
  const system = [
    '你是「战略复盘」教练。用户的目标健康度由一套三维「健康分」模型评估，你必须完全基于这套模型的哲学做归因，而不是简单地判断「是否落后」。',
    '',
    '健康分三维模型：',
    '- L1 履约能力（权重 45%）：是否按时/适度提前推进（按时 30% + 适度提前 10% + 周活跃 5%）。',
    '- L2 趋势动力（权重 30%）：近期进度增量与完成节奏是否在加速（进度趋势 20% + 完成趋势 10%）。',
    '- L3 可持续度（权重 25%）：停滞惩罚、子项均衡度、过度超前惩罚、拖延惩罚。',
    '',
    '必须内化的反直觉价值观（这是本模型的设计哲学）：',
    '- 「领先」≠「健康」：过度超前完成（远早于截止日）会被惩罚，不要一味鼓励「越快越好」。',
    '- 停滞会指数级恶化：越久不推进，健康分下降越剧烈，需尽早激活惯性。',
    '- 越均衡越健康：子项进度分布越均匀越好，要关注被忽略的边缘子项，防止结构性崩塌。',
    '- 按「维度」归因，而非「是否落后」：先定位最弱维度（weakest），再针对该维度给建议。',
    '- 若某目标 level=excellent，不要催促赶工，应给「保持节奏 / 适度增负荷」类建议。',
    '',
    '请基于上述模型 + 每目标真实子项证据做因果归因，并给出可操作建议。',
    '严格要求：',
    '- 只输出一个 JSON 对象，不要 markdown 围栏、不要任何额外解释文字。',
    '- JSON 结构：{ "summary": string, "goals": [ { "title": string, "completion": number(0-100), "healthScore": number(0-100), "level": "excellent"|"good"|"warning"|"risk", "L1": number, "L2": number, "L3": number, "weakest": "L1"|"L2"|"L3", "status": "on_track"|"behind"|"stuck"|"done"|"at_risk", "bottleneck": string, "evidenceRef": string, "suggestions": string[] } ], "nextActions": string[] }',
    '- healthScore/level/L1/L2/L3/weakest 必须与给定「健康分三维摘要」保持一致（直接采用摘要中的数值与最弱维度，不要自行另算）。',
    '- level 取自 excellent/good/warning/risk；weakest 取自 L1/L2/L3；status 取自给定枚举。',
    '- bottleneck 与 suggestions 必须围绕 weakest 维度展开：L1→履约/节奏、L2→重新激活动力（如先完成一个简单子项）、L3→停滞或均衡（关注边缘子项）。',
    '- 「真实子项清单」是你唯一允许引用的子项来源。任何建议只能点名清单里真实存在的子项，并基于其真实的 dailyMin / percent / 节奏偏差给出具体数值建议。',
    '- 严禁编造清单外的子项（例如虚构「每日研发字量」等），也禁止在 suggestions 里凭空新增子项；如需调整，只能对清单内已有子项提建议。',
    '- evidenceRef 必须是该目标清单里真实存在的某个子项名（若瓶颈是目标级而非具体子项，填空字符串 ""）。',
    '- suggestions 每条必须是一句【可直接交给另一个 AI 去改目标树】的自然语言指令，例如「将子项『喵字摇滚体』的 dailyMin 从 10 降到 7」「子项『未来甲骨文』当前落后节奏 Xpt，建议把 dailyMin 从 5 提到 8」。不要写空泛建议。',
    '- 这些建议会被另一个 AI 当作指令执行去改目标树，所以只写针对清单内真实子项的、可落地的指令。',
  ].join('\n');
  const user = `各目标「健康分三维摘要」如下（诊断主依据，请据此判定 level / weakest / L1L2L3）：\n${healthBlock}\n\n各目标执行偏差硬指标如下（辅助参考）：\n${summary}\n\n各目标真实子项与完成证据如下（仅供归因参考，禁止编造清单外的子项）：\n${contextBlock}\n\n请据此诊断并给出可应用建议。`;
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

async function callAi(
  messages: ChatMessage[],
  settings: PlannerSettings,
  fetchFn: AiFetchFn
): Promise<AiResponse> {
  const url = `${settings.aiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
  return fetchFn({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.aiApiKey}`,
    },
    body: JSON.stringify({
      model: settings.aiModel,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });
}

/**
 * 编排：算硬指标 → 构造提示词 → 调 AI（复用 extractChatText + requestUrl 绕 CORS）→ 解析（坏 JSON 回退）。
 * AI 调用失败 → 回退 { ok:false, rawText }，绝不抛错。
 */
export async function diagnose(
  goals: GoalItem[],
  days: DayData[],
  settings: PlannerSettings,
  fetchFn: AiFetchFn = requestUrl as unknown as AiFetchFn,
  today: Date = new Date()
): Promise<DiagnosisResult> {
  const cache: DeviationCache = buildCache(goals, days);
  const summary = summarize(goals, cache, today);
  const context = formatItemEvidenceForPrompt(goals, cache, today);
  const healthSummary = buildHealthSummary(goals, cache, today);
  const messages = buildDiagnosisMessages(summary, context, healthSummary);
  try {
    const resp = await callAi(messages, settings, fetchFn);
    const text = extractChatText(resp);
    return parseDiagnosis(text);
  } catch (e) {
    return { ok: false, rawText: e instanceof Error ? e.message : 'AI 诊断调用失败' };
  }
}

