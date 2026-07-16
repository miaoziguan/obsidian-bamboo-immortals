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
import { buildCache, summarize } from './DeviationCalculator';
import type { DayData, GoalItem } from '../types/data';

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

/**
 * 构造诊断提示词：system 强制「只输出 JSON / status 取枚举 / suggestions 为可操作指令」；
 * user 注入 DeviationCalculator 算好的硬指标文本。
 */
export function buildDiagnosisMessages(summary: string): ChatMessage[] {
  const system = [
    '你是「战略复盘」教练。用户已有一棵目标树，并提供了各目标的执行偏差硬指标。',
    '请基于这些硬指标做因果归因（为什么落后/停滞），并给出可操作建议。',
    '严格要求：',
    '- 只输出一个 JSON 对象，不要 markdown 围栏、不要任何额外解释文字。',
    '- JSON 结构：{ "summary": string, "goals": [ { "title": string, "completion": number(0-100), "status": "on_track"|"behind"|"stuck"|"done"|"at_risk", "bottleneck": string, "suggestions": string[] } ], "nextActions": string[] }',
    '- status 必须取自给定枚举。',
    '- suggestions 每条必须是一句【可直接交给另一个 AI 去改目标树】的自然语言指令，例如「将子项『每天跑步』的 dailyMin 从 30 降到 15」「为目标『健康减重』新增子项『每周游泳 3 次』」。不要写空泛建议。',
  ].join('\n');
  const user = `各目标执行偏差如下：\n${summary}\n请据此诊断并给出可应用建议。`;
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
  fetchFn: AiFetchFn = requestUrl as unknown as AiFetchFn
): Promise<DiagnosisResult> {
  const cache = buildCache(goals, days);
  const summary = summarize(goals, cache);
  const messages = buildDiagnosisMessages(summary);
  try {
    const resp = await callAi(messages, settings, fetchFn);
    const text = extractChatText(resp);
    return parseDiagnosis(text);
  } catch (e) {
    return { ok: false, rawText: e instanceof Error ? e.message : 'AI 诊断调用失败' };
  }
}

