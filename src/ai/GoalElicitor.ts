/**
 * GoalElicitor — Layer 0 意图澄清器（目标级的压力测试 + 苏格拉底追问）
 *
 * 职责（单一、可单测）：
 *  - buildElicitPrompt：把「原始意图 + 已进行的澄清对话」翻译成系统/用户提示词。
 *  - parseElicitation：从模型回执中提取 JSON 并映射为 ElicitationResult（容忍 ```json 围栏）。
 *  - elicitGoal：编排网络请求（requestUrl 绕 CORS）+ 解析 + 失败重试一次。
 *  - briefToPlanningText：把通过的简报编译成一段「已澄清」文本，供下游规划器消费。
 *
 * 设计对齐 MarkdownPlanner：
 *  - 复用其 AI_TEMPERATURE / AiFetchFn / AiResponse / extractChatText，避免散落写死；
 *  - 网络层可注入（fetchFn），便于单测用 fake 替代真实 requestUrl，零 Obsidian 运行时依赖。
 *
 * 本模块只做「澄清」，不做「拆解」——那是下游 Layer A/B 的事。
 * 它回答的是：这个目标是具体的吗、是自属的吗、是有承诺的吗？而不是「每天做多少」。
 */

import { requestUrl } from 'obsidian';
import {
  AI_TEMPERATURE,
  type AiFetchFn,
  type AiResponse,
  extractChatText,
} from './MarkdownPlanner';

/** 再导出，便于测试与调用方复用（避免从 MarkdownPlanner 直接耦合） */
export type { AiResponse } from './MarkdownPlanner';
import type {
  BriefQuestion,
  DiseaseType,
  GoalBrief,
  GoalKind,
} from '../types/data';

/** 五类「病」对人类可读的标签（用于弹窗展示与测试断言） */
export const DISEASE_LABEL: Record<DiseaseType, string> = {
  vague: '目标太虚（愿景型，缺具体成功口径）',
  non_owned: '非自属（借来的目标，缺可控抓手）',
  means_as_end: '手段当目的（给的是 means，不是 ends）',
  no_commit: '缺乏承诺（无期限 / 无资源）',
  outcome_as_input: '把结果当输入（结果由他人/市场决定）',
};

/** 每种病的默认苏格拉底追问（AI 没返回针对性问题时作为兜底） */
const DISEASE_QUESTION: Record<DiseaseType, string> = {
  vague: '你说的"第一 / 最好 / 神作"这类词，具体按什么口径算达成？请用一句可验证的话描述成功。',
  non_owned: '这件事里，你个人能直接控制的那一小块是什么？其余（市场 / 他人）不在你手里，先放一边。',
  means_as_end: '你真正想要的结果是什么？"每天读 10 页"是手段，它要服务的那个 ends 是什么？',
  no_commit: '这件事最晚什么时候要看到结果？你愿意投入多少资源（时间 / 钱 / 精力）？',
  outcome_as_input: '"行业第一"是市场决定的结果，你手里哪个可控抓手能撬动它？',
};

const VALID_DISEASES = new Set<DiseaseType>([
  'vague',
  'non_owned',
  'means_as_end',
  'no_commit',
  'outcome_as_input',
]);

const VALID_KINDS = new Set<GoalKind>([
  'habit',
  'project',
  'creative',
  'vision',
  'borrowed',
  'unclear',
]);

/**
 * goalKind 判别准则（共享：澄清器 / 拆分器都注入，保证判定口径一致）。
 *
 * 这是「选框架」的前置分诊——判错会直接导致 creative 被当 project 套里程碑框，
 * 丢掉「大纲→初稿→修订」的创作阶段结构。与 Layer A 框架 fragment 话术无关，
 * 此处只定义「这到底是什么类型的目标」。
 *
 * 设计原则（与 Layer 0 一致）：纯文本常量，零依赖，便于单测断言与 webapp 复用。
 */
export const GOAL_KIND_RUBRIC = `# 如何判定 goalKind（决定下游拆解法，务必判准）
为每个目标选一个最贴切的类型：
- habit（习惯型）：靠日复一日重复养成，无明确"交付物"。如"每天早起""少刷手机""坚持阅读"。
- project（项目型）：有明确可交付成果 + 可计划的里程碑/工作流，达成 = 把事做完。如"减重 5kg""上线 v1 模块""读完 3 本书""考过某证"。核心是【执行一个已有计划拿到结果】。
- creative（创作型）：核心价值是产出一件【原创作品】，且作品天然按【创作阶段】展开（大纲→初稿→修订→定稿/发布），并非"执行计划拿到结果"。如"写一本小说""做一款产品""录一门课""画一组插画""写首歌"。核心是【孕育/打磨一件新作品】。
- vision（愿景型）：还很虚、缺具体成功口径，尚未落地（通常应在澄清阶段就拦下，拆分器里少见）。
- borrowed（借来型）：目标像是老板/社会给的，用户找不到自己可控的抓手。
- unclear（无法判定）：信息太少判不出。

# project 与 creative 的易混点（最常被判错，重点区分）
- "减重 5kg"是 project：成功 = 体重降到目标，靠执行饮食/运动计划达成，没有创作成分。
- "写一本小说"是 creative：成功 = 产出一部作品，必经大纲/初稿/修订等创作阶段，不能只按"写完 N 万字"粗暴量化。
- 判据（拿不准就问这句）：「达成它，是【执行一个已有计划】，还是【孕育/打磨一件新作品】？」前者 project，后者 creative。
- 反例纠正：不要把"写小说 / 做产品 / 录课 / 画画"误判为 project——它们虽有交付物，但交付物是【创作产物】、阶段属性强，必须归 creative。`;

/** 多轮澄清的对话历史（每一轮的一问一答） */
export interface ElicitTurn {
  q: string;
  a: string;
}

/** 单次 AI 澄清调用的产出（一轮） */
export interface ElicitationResult {
  goalKind?: GoalKind;
  /** 仍存在的缺口；空数组 = 通过 */
  diseases: DiseaseType[];
  /** 针对缺口的追问（通过时为空） */
  questions: BriefQuestion[];
  /** 一句话归纳当前意图（仅展示） */
  summary?: string;
  /** 通过时由 AI 填好的结构化字段（缺则留空串） */
  clarifiedOutcome?: string;
  successMeasure?: string;
  ownedSlice?: string;
  constraints?: string;
  domain?: string;
}

/** GoalElicitor 需要的 AI 设置（取 PlannerSettings 的子集，保持解耦） */
export interface ElicitSettings {
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
}

/**
 * 构造提示词。
 * @param rawIntent 用户原始意图（笔记/选区原文）
 * @param history 已进行的澄清对话；传入时要求 AI 基于回答重新评估剩余缺口
 * @returns { system, user } 两段消息
 */
export function buildElicitPrompt(
  rawIntent: string,
  history?: ElicitTurn[]
): { system: string; user: string } {
  const system = `你是一个「目标澄清教练」，不是目标拆解器。
用户给的往往是一句模糊愿望（如"成为行业第一""写本神作""今年要更自律"）。
你的任务只有一件：**压力测试**这个意图是否足够（a）具体、（b）自属、（c）有承诺，
并对缺口提出**苏格拉底式追问**——只问最关键的一两个问题，不要一次抛出五个。

# 五类「病」（用它们给缺口打标签）
1. vague（太虚/愿景型）：缺具体成功口径。"第一""神作""更好"这类词无法验证。
2. non_owned（非自属/借来）：目标像是别人（老板/社会）的，用户找不到自己能直接控制的那块。
3. means_as_end（手段当目的）：用户给的是手段（"每天读10页"），真正想要的 ends 没说清。
4. no_commit（零承诺）：没有期限、没有资源投入，只是愿望。
5. outcome_as_input（结果当输入）：把别人/市场决定的结果（"行业第一"）当成了自己可控的输入项。

# 追问原则（苏格拉底，不是审问）
- 一次只问 1-2 个最堵点的缺口，别贪多。
- 用日常、陪他想清楚的语气，别像填表。
- 每条问题必须绑定一个 disease 标签（用于你下次重新评估）。

# 什么时候算通过
当用户已能用一句话说清「具体成果 + 成功口径 + 自己可控的抓手 + 期限/资源」，diseases 返回空数组 []，并补填下方结构化字段。

# 输出格式（严格 JSON，不要任何解释、不要 markdown 围栏）
{
  "goalKind": "habit | project | creative | vision | borrowed | unclear（判定准则见下方 goalKind 判别）",
  "diseases": ["vague", "non_owned"],
  "questions": [
    { "disease": "vague", "question": "你具体想用什么指标证明'第一'？" }
  ],
  "summary": "一句话归纳用户当前意图（≤30字）",
  "clarifiedOutcome": "通过时填：用户最终想产出的具体成果（一句话）",
  "successMeasure": "通过时填：用什么可验证指标证明达成",
  "ownedSlice": "通过时填：用户个人能直接控制的那一小块",
  "constraints": "通过时填：期限 / 资源投入",
  "domain": "通过时填：领域（工作/学习/创作…，自由文本）"
}

${GOAL_KIND_RUBRIC}`;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; // YYYY-MM-DD（本地时区，避免 UTC 跨午夜偏移）
  let user = `今天是 ${today}。\n\n用户的原始意图：\n${rawIntent}`;

  if (history && history.length > 0) {
    const log = history
      .map((h, i) => `第${i + 1}轮\n问：${h.q}\n答：${h.a}`)
      .join('\n\n');
    user += `\n\n已进行的澄清对话：\n${log}\n\n请基于以上重新评估：用户目标现在是否通过？未通过则列出剩余 disease 与对应追问；通过则 diseases 返回 [] 并补填结构化字段。`;
  } else {
    user += '\n\n请先评估这段意图是否足够具体、自属、有承诺。';
  }

  return { system, user };
}

/** 从模型回执文本中提取 JSON 对象（容忍 ```json 围栏与前后废话） */
function extractJsonObject(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  let text = typeof raw === 'string' ? raw : JSON.stringify(raw);

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1];

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('回执中未找到 JSON 对象');
  }
  return JSON.parse(text.slice(start, end + 1));
}

/** 把模型回执解析为 ElicitationResult（纯函数，便于单测） */
export function parseElicitation(rawText: unknown): ElicitationResult {
  const obj = extractJsonObject(rawText);

  const goalKindRaw = typeof obj.goalKind === 'string' ? obj.goalKind : '';
  const goalKind = VALID_KINDS.has(goalKindRaw as GoalKind)
    ? (goalKindRaw as GoalKind)
    : undefined;

  const diseasesRaw = Array.isArray(obj.diseases) ? (obj.diseases as unknown[]) : [];
  const diseases = diseasesRaw
    .filter(
      (d): d is DiseaseType =>
        typeof d === 'string' && VALID_DISEASES.has(d as DiseaseType)
    )
    .map((d) => d as DiseaseType);

  const questionsRaw = Array.isArray(obj.questions)
    ? (obj.questions as Record<string, unknown>[])
    : [];
  const questions: BriefQuestion[] = questionsRaw
    .map((q): BriefQuestion | null => {
      const disease =
        typeof q.disease === 'string' && VALID_DISEASES.has(q.disease as DiseaseType)
          ? (q.disease as DiseaseType)
          : 'vague';
      const question = typeof q.question === 'string' ? q.question : '';
      return question ? { disease, question } : null;
    })
    .filter((q): q is BriefQuestion => q !== null);

  const strField = (k: string): string | undefined => {
    const v = obj[k];
    return typeof v === 'string' && v.trim() ? v : undefined;
  };

  return {
    goalKind,
    diseases,
    questions,
    summary: strField('summary'),
    clarifiedOutcome: strField('clarifiedOutcome'),
    successMeasure: strField('successMeasure'),
    ownedSlice: strField('ownedSlice'),
    constraints: strField('constraints'),
    domain: strField('domain'),
  };
}

/**
 * 澄清主流程：调用 AI → 解析 → 失败重试一次。
 * @param rawIntent 用户原始意图
 * @param settings AI 设置（key / baseUrl / model）
 * @param fetchFn 可注入的 fetch（默认 requestUrl，便于测试）
 * @param history 已进行的澄清对话（多轮）
 */
export async function elicitGoal(
  rawIntent: string,
  settings: ElicitSettings,
  fetchFn: AiFetchFn = requestUrl as unknown as AiFetchFn,
  history?: ElicitTurn[]
): Promise<ElicitationResult> {
  const url = `${settings.aiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
  const { system, user } = buildElicitPrompt(rawIntent, history);

  const attempt = async (): Promise<AiResponse> => {
    const resp = await fetchFn({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        temperature: AI_TEMPERATURE,
      }),
    });
    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(`AI 服务返回 HTTP ${resp.status}`);
    }
    return resp;
  };

  const parseOnce = (resp: AiResponse): ElicitationResult =>
    parseElicitation(extractChatText(resp));

  try {
    return parseOnce(await attempt());
  } catch (firstErr) {
    try {
      return parseOnce(await attempt());
    } catch {
      throw new Error(
        `AI 澄清失败：${firstErr instanceof Error ? firstErr.message : '无法解析返回结果'}。请检查 API Key / 网络，或重试。`
      );
    }
  }
}

/**
 * 把通过的简报编译成一段「已澄清」文本，供下游规划器当 content 消费。
 * 这样下游拆解器拿到的不再是"成为行业第一"这种模糊原句，而是被 sharpen 过的简报。
 * 纯函数、便于单测。
 */
export function briefToPlanningText(brief: GoalBrief): string {
  const lines: string[] = ['【目标简报 · AI 已澄清】'];
  if (brief.clarifiedOutcome) lines.push(`- 具体成果：${brief.clarifiedOutcome}`);
  if (brief.successMeasure) lines.push(`- 成功口径：${brief.successMeasure}`);
  if (brief.ownedSlice) lines.push(`- 我可控的抓手：${brief.ownedSlice}`);
  if (brief.constraints) lines.push(`- 约束（期限/资源）：${brief.constraints}`);
  if (brief.domain) lines.push(`- 领域：${brief.domain}`);

  // 把用户逐轮回答也带下去，作为拆解时的背景（尤其 force-skip 时结构化字段可能为空）
  const answered = brief.questions.filter((q) => q.answer && q.answer.trim());
  if (answered.length > 0) {
    lines.push('', '- 澄清问答：');
    for (const q of answered) {
      lines.push(`  · 问：${q.question}`);
      lines.push(`    答：${(q.answer ?? '').trim()}`);
    }
  }

  lines.push('', '请基于以上简报进行拆解。');
  return lines.join('\n');
}

/** 兜底：给未填结构化字段的追问生成默认文案（force-skip 时常用） */
export function fallbackQuestion(disease: DiseaseType): string {
  return DISEASE_QUESTION[disease];
}

/** 取字符串字段（trim 为空则 undefined），供 parseSplit 复用 */
function strFieldOf(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

/**
 * 多目标分诊（Phase 5）：把「已澄清的单个总目标」拆成若干个【相互独立】的子目标。
 * 这是 Layer 0 澄清之后的「分诊」能力——一篇笔记/一个意图往往含多个异质目标，
 * 每个目标应有各自的 goalKind 与拆解框架，而非被套进同一个框架。
 *
 * 设计：
 *  - 输入是已经过压力测试/苏格拉底澄清的单个 GoalBrief（含其问答背景）；
 *  - AI 据此判断它包含几个独立目标，并为每个子目标填好结构化字段 + 各自 goalKind；
 *  - 若原意图本就是单一目标，返回长度为 1 的数组（与原意一致，不硬拆）。
 */
export function buildSplitPrompt(brief: GoalBrief): { system: string; user: string } {
  const system = `你是「目标拆分器」。用户已经过澄清、拿到一份已 sharpen 的总目标简报，但这段意图可能包含多个相互独立的目标（例如既想"3个月减重5kg"又想"今年写完一本小说"）。你的任务：把这份已澄清的简报拆成若干个【相互独立】的子目标，每个子目标都按下方字段填好。

# 拆分原则
- 若原意图本就是单一目标（如"3个月减重5kg"），则只返回 1 个目标，与原意完全一致，不要硬拆。
- 若原意图确实包含多个目标，每个子目标都应是独立可执行的（不同领域 / 不同成功口径 / 不同类型的努力）。
- 每个子目标都要填好：goalKind（habit/project/creative/vision/borrowed/unclear）、clarifiedOutcome、successMeasure、ownedSlice、constraints、domain、summary。

# 输出格式（严格 JSON，不要任何解释、不要 markdown 围栏）
{
  "goals": [
    {
      "goalKind": "habit | project | creative | vision | borrowed | unclear（判定准则见下方 goalKind 判别）",
      "clarifiedOutcome": "该子目标的具体成果（一句话）",
      "successMeasure": "该子目标的可验证达成口径",
      "ownedSlice": "用户个人可控的那一小块",
      "constraints": "期限 / 资源投入",
      "domain": "领域",
      "summary": "一句话归纳该子目标（≤30字）"
    }
  ]
}

${GOAL_KIND_RUBRIC}`;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; // YYYY-MM-DD（本地时区，避免 UTC 跨午夜偏移）
  const user = `今天是 ${today}。\n\n用户已澄清的总目标简报：\n${briefToPlanningText(brief)}\n\n请判断它包含几个独立目标，并拆成对应数量的子目标简报。若只有一个目标就返回长度为 1 的数组。`;

  return { system, user };
}

/** 把「拆分回执」解析为多条 GoalBrief（继承原 brief 的可靠性/问答/原句） */
export function parseSplit(rawText: unknown, base: GoalBrief): GoalBrief[] {
  const obj = extractJsonObject(rawText) as Record<string, unknown>;
  const arr = Array.isArray(obj.goals) ? (obj.goals as Record<string, unknown>[]) : [];
  return arr.map((g): GoalBrief => ({
    rawIntent: base.rawIntent,
    goalKind:
      typeof g.goalKind === 'string' && VALID_KINDS.has(g.goalKind as GoalKind)
        ? (g.goalKind as GoalKind)
        : base.goalKind,
    clarifiedOutcome: strFieldOf(g.clarifiedOutcome) ?? base.clarifiedOutcome,
    successMeasure: strFieldOf(g.successMeasure) ?? base.successMeasure,
    ownedSlice: strFieldOf(g.ownedSlice) ?? base.ownedSlice,
    constraints: strFieldOf(g.constraints) ?? base.constraints,
    domain: strFieldOf(g.domain) ?? base.domain,
    reliabilityStatus: base.reliabilityStatus,
    diseases: [],
    questions: base.questions,
    summary: strFieldOf(g.summary) ?? base.summary,
    round: base.round,
  }));
}

/**
 * 拆分主流程：调用 AI → 解析 → 失败重试一次。
 * @param brief 已澄清的单个总目标简报（含问答背景）
 */
export async function splitGoals(
  brief: GoalBrief,
  settings: ElicitSettings,
  fetchFn: AiFetchFn = requestUrl as unknown as AiFetchFn
): Promise<GoalBrief[]> {
  const url = `${settings.aiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
  const { system, user } = buildSplitPrompt(brief);

  const attempt = async (): Promise<AiResponse> => {
    const resp = await fetchFn({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        temperature: AI_TEMPERATURE,
      }),
    });
    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(`AI 服务返回 HTTP ${resp.status}`);
    }
    return resp;
  };

  const parseOnce = (resp: AiResponse): GoalBrief[] =>
    parseSplit(extractChatText(resp), brief);

  try {
    return parseOnce(await attempt());
  } catch (firstErr) {
    try {
      return parseOnce(await attempt());
    } catch {
      throw new Error(
        `AI 目标拆分失败：${firstErr instanceof Error ? firstErr.message : '无法解析返回结果'}。请稍后重试，或保留单目标继续。`
      );
    }
  }
}
