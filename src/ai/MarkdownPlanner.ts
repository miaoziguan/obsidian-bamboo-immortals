/**
 * MarkdownPlanner — 笔记正文 → 目标卡片规划器（Phase 1）
 *
 * 职责（单一、可单测）：
 *  - buildPrompt：把笔记正文 + 拆解粒度翻译成系统/用户提示词（硬约束 JSON Schema）。
 *  - parseGoals：从模型回执文本中提取 JSON 数组并映射为 GoalItem[]（容忍 ```json 围栏）。
 *  - planFromNote：编排网络请求（requestUrl 绕 CORS）+ 解析 + 失败重试一次。
 *
 * 网络层可注入（fetchFn），便于单测用 fake 替代真实 requestUrl，保持零 Obsidian 运行时依赖。
 */

import { requestUrl } from 'obsidian';
import { GOAL_CATEGORIES, type GoalCategory, type GoalItem, type GoalSubItem } from '../types/data';
import { cleanDailyMin } from './GoalCardValidator';

/** 拆解粒度 → 建议子项数量区间描述 */
const DEPTH_HINT: Record<'粗' | '中' | '细', string> = {
  粗: '2-3',
  中: '3-6',
  细: '5-8',
};

/**
 * AI 推理温度（JSON 结构化输出场景下偏低，保证稳定可解析）。
 * 三处 LLM 调用（MarkdownPlanner / PlanningSession / GoalDiagnoser）共用此常量，
 * 避免散落写死、将来要调参时只改一处。
 */
export const AI_TEMPERATURE = 0.3;

/** AI 服务返回的最小结构（兼容 Obsidian requestUrl 的 ResponseData） */
export interface AiResponse {
  status: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
}

/** 可注入的 fetch 函数（默认 requestUrl）。签名对齐 Obsidian requestUrl 的最小子集。 */
export type AiFetchFn = (opts: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<AiResponse>;

export interface PlannerSettings {
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  aiDecomposeDepth: '粗' | '中' | '细';
}

const CATEGORY_IDS = GOAL_CATEGORIES.map((c) => c.id).join(' | ');

/**
 * 构造提示词。
 * @returns { system, user } 两段消息
 */
export function buildPrompt(
  content: string,
  depth: '粗' | '中' | '细' = '中',
  scope: 'note' | 'selection' = 'note'
): { system: string; user: string } {
  const count = DEPTH_HINT[depth] ?? DEPTH_HINT['中'];

  // 选中片段模式：明确告诉模型把它当完整意图，不要当成整篇笔记/假设还有其它内容。
  const scopeNote =
    scope === 'selection'
      ? '若输入是用户从笔记中选中的片段，请直接把它当作用户的完整意图来拆解，不要假设笔记里还有其它内容、也不要当成整篇笔记的摘要。'
      : '';

  const system = `你是一个目标拆解助手，服务于个人目标管理插件「竹林修仙传」。
输入是一篇 Markdown 笔记正文；你的任务是从中识别用户想要达成的目标（Goal），并把每个目标拆成多个可执行的子项（SubItem）。${scopeNote}

# 核心哲学（最重要，凌驾于一切）
本软件的核心价值是把目标「量化」，并落到「日」颗粒度。你的每一个子项都必须能回答一个问题：「今天要做多少？」
- 量化：每个子项必须有一个纯数字的每日量 dailyMin（如 "30"、"2"、"200"），不带任何单位或文字。
- 日颗粒度：把"结果型/宏大目标"翻译成"每天的可执行动作"。
  · "读完《XX》" → 子项"每天阅读页数"，dailyMin "30"
  · "减少零食" → 子项"每天零食热量上限(千卡)"，dailyMin "200"
  · "早睡" → 子项"每天睡眠时长(小时)"，dailyMin "7"
- 子项名 name 应包含量化维度（如"每天阅读页数"而非"读书"）。
- 拒绝模糊：绝不产出无法量化的子项（如"坚持""努力""保持"）；若一个想法无法量化，就改写成能量化的日级行为。
- **时间驱动规划（关键）**：当你能推断起止时间（startDate 和 endDate），应主动用它反推 dailyMin，而不是凭空猜：
  · 总天数 = endDate - startDate
  · 若 targetValue 可量化且可均摊：「3个月读完3本书，每本约300页」 → 900页÷90天=10页/天 → dailyMin "10"
  · 若 targetValue 不可直接均摊（如"减重5kg"体重非线性）：拆为可均摊的行动子项，如"每天运动消耗(千卡)"，dailyMin 取合理值
  · 用 reason 说明计算依据（如"900页÷90天≈10页/天"），让用户可核实
  · 若起止时间或总量确实无法推断，按常识给一个保守 dailyMin，不强行留空

# 子项相关性 & 可量化护栏（硬性要求，与核心哲学同等重要）
子项必须同时满足「围绕目标」与「可量化」两条铁律，缺一不可；任一不满足都不准产出。

## 铁律一：必须围绕目标（拒绝跑题）
- 每个子项都要能直接回答：「今天做这件事，是否推进了这个目标？」能推进才算相关。
- 严禁装饰性、泛化性、与目标弱相关的子项。例：目标是"3个月学会React"，子项"每天喝水8杯""每天散步"就属于离题，必须删除或改写成服务目标的动作（如"每天写React组件(个)"）。
- 若一个灵感只与目标弱相关，宁可丢弃也不要塞进规划——平庸堆砌会降低可执行性。
- 子项名应体现"目标维度"：减重目标的子项应围绕热量/运动/体重，而非无关的"每天读书"。

## 铁律二：必须可量化（拒绝难量化任务）
- 杜绝"难以量化"的任务：如"提升语感""增强自信""保持好心情""加深理解""提高审美"。这些词无法直接计数，且每日无法核验。
- 必须把"难量化"改写成"可计数/可度量"的日级行为（改写范式）：
  · "提升英语" → "每天背单词(个)" dailyMin "20"；或 "每天听力(分钟)" dailyMin "15"
  · "少玩手机" → "每天屏幕时长上限(小时)" dailyMin "3"
  · "多喝水" → "每天饮水量(杯)" dailyMin "8"（仅当该目标确属健康/减重相关时才作为子项，否则视为离题）
  · "保持好心态" → 改写为具体行为，如 "每天冥想(分钟)" dailyMin "10" / "每天记录感恩(条)" dailyMin "1"
  · "深入理解算法" → "每天刷题(道)" dailyMin "2" / "每天读技术文(篇)" dailyMin "1"
- 改写原则：找该目标的"可数代理指标"（页数/分钟/个数/杯数/千卡/次数），而非抽象感受。
- 若实在找不到任何可数代理指标，说明该目标本身不适合拆解——该 goal 的 items 留空（reason 说明原因），也不要用"努力""坚持"等伪量化词凑数。

# 输出格式（严格 JSON，不要任何解释、不要 markdown 围栏）
{
  "goals": [
    {
      "title": "目标标题（简洁，少于20字）",
      "analysis": "一句话归纳笔记主旨 + 拆解理由/关键风险（≤40字，仅展示用不持久化）",
      "category": "work | personal | health | study | finance | other",
      "startDate": "开始日期 YYYY-MM-DD。笔记未提及时必须填今天（与 user 消息中的“今天”一致），不要留空",
      "endDate": "截止日期 YYYY-MM-DD，未知留空串",
      "items": [
        {
          "name": "子项名（含量化维度的可落地动作，如'每天阅读页数'）",
          "targetValue": "可量化的目标值(字符串)，未知留空串",
          "currentValue": "当前已达成值(字符串)，未知留空串",
          "dailyMin": "每天需推进的量，必须是纯数字字符串(如 '30')，不带单位",
          "taskDayType": "daily",
          "reason": "为何这样拆（仅展示用，不持久化）"
        }
      ]
    }
  ]
}

# 规则
1. 只输出 JSON。若识别不出任何明确目标，返回 {"goals":[]}。
2. dailyMin 必须是纯数字字符串，禁止携带单位或文字（"30分钟"→"30"，"7-8小时"→取保守值"7"）。
3. 若无法直接推断每天做多少，请利用「起止时间 + 目标总量」反推 dailyMin（参见核心哲学第5条）；尽量不要留空。
4. 单位信息放进子项名或 targetValue（如 name:"每天睡眠时长(小时)"），dailyMin 只放数字。
5. targetValue / currentValue 未知可留空串 ""，但**绝不编造**精确数字。
6. category 必须取自枚举（${CATEGORY_IDS}），无法判断用 "other"。
7. taskDayType 默认 "daily"；仅当该行为天然不是每天做（如"每周体检"）才用 "weekly" / "monthly" / "custom"，并据此调整 dailyMin 语义。
8. 目标宏大或知识不足时，主动拆 ${count} 个子项（粗=2-3 / 中=3-6 / 细=5-8），偏向可落地行动；用 reason 说明依据。
9. **日期推算（重要）**：
   - **startDate**：笔记若未提及具体开始日期，必须填"今天"（即 user 消息中给出的日期），不要留空。仅当笔记明确说了"从X月X日开始"才用该日期。
   - **endDate**：笔记若提到相对时长（"3个月""半年""90天""到年底"等），必须用「startDate + 时长」推算成 YYYY-MM-DD 填入 endDate，不要留空。仅当笔记完全无时间线索时 endDate 才留空串。
   - 下方 user 消息中会给出今天的日期，请以该日期为准进行推算。
10. 除 analysis 字段外，不要包含 id / icon / progress 等字段，由插件补全（analysis 会被展示给用户）。
11. 子项硬性两关：必须（a）直接服务于该目标（不跑题）；（b）可用纯数字 dailyMin 表达每日进度。难量化或离题的子项一律不得产出；找不到可数代理指标时该 goal 的 items 留空，不得用"努力""坚持""保持"等伪量化词凑数。
12. **目标标题必须归纳命名（不要照抄笔记原文）**：
    - 标题是"目标的名字/项目名"，不是笔记原句的复述。必须从笔记内容中提炼出一个清晰、抽象、可独立成立的目标名。
    - 写法：动宾结构或名词短语，<20 字，去掉"我想""3个月""5kg"等具体数字与时间，只保留目标方向。
    - 改名示例（仅参考逻辑，不是死规则）：
      · 笔记「3个月减重 5kg」 → 标题「健康减重」或「体重管理」
      · 笔记「读完《XX 算法》」 → 标题「系统学习 XX」或「算法入门」
      · 笔记「每天跑步 30 分钟、控制饮食」 → 标题「养成运动习惯」
    - 反例（禁止）：标题与笔记首句逐字相同、保留原始"3个月"/"5kg"/"我想"等具体数字与时间限定。
13. **每个目标必须给出 analysis（归纳分析）**：用 1-2 句概括笔记主旨，并说明「为何这样拆、关键风险或注意点」，≤40 字。这是给用户的"归纳 + 分析"，不要只复述标题或留空。仅展示用，不持久化为子项。`;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const user =
    scope === 'selection'
      ? `今天是 ${today}。\n\n以下是用户在笔记中选中的一段文本，请直接把它作为一个/多个目标来拆解（不要当成整篇笔记）：\n${content}`
      : `今天是 ${today}。\n\n笔记正文：\n${content}`;

  return { system, user };
}

/** 从模型回执文本中提取 goals 数组（容忍 ```json 围栏与前后废话） */
function extractGoalsObject(raw: unknown): { goals?: unknown } {
  if (raw && typeof raw === 'object' && 'goals' in (raw as Record<string, unknown>)) {
    return raw as { goals?: unknown };
  }
  // raw 可能是字符串（resp.text 或已 stringify 的回执）
  let text = typeof raw === 'string' ? raw : JSON.stringify(raw);

  // 去 ```json ... ``` 围栏
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1];

  // 取第一个 { 到最后一个 } 之间的 JSON
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('回执中未找到 JSON 对象');
  }
  const parsed = JSON.parse(text.slice(start, end + 1));
  if (parsed && typeof parsed === 'object' && 'goals' in parsed) return parsed;
  throw new Error('JSON 中缺少 goals 字段');
}

/**
 * 把模型回执解析为 GoalItem[]。
 * 仅做结构提取与基础映射（生成 id、映射字段）；深度校验/补默认交由 GoalCardValidator。
 * @throws 当回执无法解析或结构非法
 */
export function parseGoals(rawText: unknown): GoalItem[] {
  const obj = extractGoalsObject(rawText);
  const goals = obj.goals;
  if (!Array.isArray(goals)) {
    throw new Error('goals 不是数组');
  }

  return goals.map((g, gi): GoalItem => {
    const goal = (g ?? {}) as Record<string, unknown>;
    const items = Array.isArray(goal.items)
      ? (goal.items as Record<string, unknown>[]).map((it, ii): GoalSubItem => {
          const item = it ?? {};
          return {
            name: typeof item.name === 'string' && item.name ? item.name : `子项${ii + 1}`,
            targetValue: typeof item.targetValue === 'string' ? item.targetValue : '',
            currentValue: typeof item.currentValue === 'string' ? item.currentValue : '',
            dailyMin: cleanDailyMin(item.dailyMin),
            taskDayType: typeof item.taskDayType === 'string' ? item.taskDayType : 'daily',
            detail: typeof item.reason === 'string' ? item.reason : undefined,
          };
        })
      : [];

    const categoryRaw = typeof goal.category === 'string' ? goal.category : '';
    const category: GoalCategory | string =
      GOAL_CATEGORIES.some((c) => c.id === categoryRaw) ? categoryRaw : 'other';

    return {
      id: `goal_${Date.now().toString(36)}_${gi}_${Math.random().toString(36).slice(2, 8)}`,
      title: typeof goal.title === 'string' && goal.title ? goal.title : `目标${gi + 1}`,
      analysis: typeof goal.analysis === 'string' && goal.analysis ? goal.analysis : undefined,
      category,
      startDate: typeof goal.startDate === 'string' ? goal.startDate : '',
      endDate: typeof goal.endDate === 'string' ? goal.endDate : '',
      progress: 0,
      items,
    };
  });
}

/**
 * 从 chat/completions 回执中提取模型输出的文本。
 * 兼容两种形态：
 *  - OpenAI 风格：{ choices:[{ message:{ content } }] }（json 或 text 均可能）
 *  - 直出：resp.json 已是对象 / resp.text 已是 JSON 文本
 * 提取失败（空 / 非 2xx）统一抛错，便于上层重试 / 提示。
 */
export function extractChatText(resp: AiResponse): string {
  if (resp.status < 200 || resp.status >= 300) {
    throw new Error(`AI 服务返回 HTTP ${resp.status}`);
  }
  let data: unknown = resp.json;
  if (data === undefined || data === null) {
    if (typeof resp.text === 'string' && resp.text.trim()) data = resp.text;
    else throw new Error('AI 回执为空');
  }

  // OpenAI 风格包装：choices[0].message.content 才是真正的 JSON/文本
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as Record<string, unknown>).choices)
  ) {
    const choices = (data as Record<string, unknown>).choices as Array<Record<string, unknown>>;
    const msg = choices[0]?.message as Record<string, unknown> | undefined;
    if (msg && typeof msg.content === 'string') return msg.content;
  }

  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}

/**
 * 规划主流程：调用 AI → 解析 → 失败重试一次。
 * @param content 笔记正文
 * @param settings AI 设置（key / baseUrl / model / depth）
 * @param fetchFn 可注入的 fetch（默认 requestUrl，便于测试）
 */
export async function planFromNote(
  content: string,
  settings: PlannerSettings,
  fetchFn: AiFetchFn = requestUrl as unknown as AiFetchFn,
  scope: 'note' | 'selection' = 'note'
): Promise<GoalItem[]> {
  const url = `${settings.aiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
  const { system, user } = buildPrompt(content, settings.aiDecomposeDepth, scope);

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

  const parseOnce = (resp: AiResponse): GoalItem[] => parseGoals(extractChatText(resp));

  try {
    return parseOnce(await attempt());
  } catch (firstErr) {
    // 重试一次（网络抖动 / 偶发坏 JSON）
    try {
      return parseOnce(await attempt());
    } catch {
      throw new Error(
        `AI 规划失败：${firstErr instanceof Error ? firstErr.message : '无法解析返回结果'}。请检查 API Key / 网络，或重试。`
      );
    }
  }
}
