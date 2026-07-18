/**
 * PlanningSession — 对话式规划会话（Agentic，Phase 4）
 *
 * 与 Phase1 `planFromNote`（一次性）不同，本类维护一段多轮对话：
 *  - 首轮 init()：AI 从笔记拆解初版 goals；
 *  - 后续 send(text)：用户用自然语言增 / 删 / 改，AI 返回【全量】最新 goals；
 *  - 手动编辑：直接 mutate `goals`（工作副本），并用 applyLocalEdit 把改动
 *    写进对话历史，防止 AI 下轮把用户手动改动覆盖回去；
 *  - reset()：回到 AI 首版，清空对话。
 *
 * 设计原则（与产品哲学一致）：
 *  - 单一数据源：this.goals 是工作副本（source of truth）。
 *  - 容错优先：坏 JSON → 回滚本轮 messages、this.goals 不变、抛错由上层提示。
 *
 * 零 Obsidian 依赖，fetchFn 可注入，便于单测（参考 markdownPlanner.test.ts）。
 */

import { type GoalItem } from '../types/data';
import {
  buildPrompt,
  buildMultiPrompt,
  extractChatText,
  parseGoals,
  AI_TEMPERATURE,
  obsidianRequestFetch,
  type AiFetchFn,
  type AiResponse,
  type PlannerSettings,
  type PlanTarget,
} from './MarkdownPlanner';
import { type FrameworkType } from './frameworks';
import { validateGoals as _validate } from './GoalCardValidator';

/** 对话消息（对齐 OpenAI chat/completions messages） */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** send() 的返回值：本轮 AI 概要 + 最新全量 goals */
export interface SendResult {
  reply: string;
  goals: GoalItem[];
}

/** 对话式规划追加到 system 的指令（复用 buildPrompt 的量化铁律） */
const AGENT_SUFFIX = `

# 对话式规划模式（你正与用户多轮打磨规划）
这是对话式规划：用户会在此基础上提出「增 / 删 / 改」等自然语言指令。
- 每次回复都必须返回【当前完整的最新 goals JSON 全量】，**不要只回增量、不要回 diff**。
- 顶层增加可选字段 "reply"（字符串，≤30 字中文）：用一句话说明你这次做了什么改动；若用户只是提问也请简要回答。
- 保持上文所有量化铁律：纯数字 dailyMin、日颗粒度、严格围绕目标、可数代理指标、禁止"努力/坚持"等伪量化词。
- 只输出 JSON，不要任何额外解释文字、不要 markdown 围栏。
输出格式示例：
{ "reply": "已删除跑步，新增每周游泳3次", "goals": [ ... 同上文结构 ... ] }`;

export class PlanningSession {
  private messages: ChatMessage[] = [];
  /** 工作副本（单一数据源），AI 与手动编辑都作用其上 */
  goals: GoalItem[] = [];
  /** 首版快照，供 reset() 还原 */
  private initialGoals: GoalItem[] = [];
  /** 会话模式：'note' 由笔记拆解首版；'edit' 由 loadGoals 载入现有树 */
  private mode: 'note' | 'edit' = 'note';
  /** edit 模式的 system 上下文（含载入树 JSON），供 reset 还原 */
  private editSystemContent = '';
  /** 多目标多框架（Phase 5）：每条目标各自 content + framework */
  private targets?: PlanTarget[];

  constructor(
    private content: string,
    private settings: PlannerSettings,
    private fetchFn: AiFetchFn = obsidianRequestFetch,
    private scope: 'note' | 'selection' = 'note',
    private framework?: FrameworkType,
    targets?: PlanTarget[]
  ) {
    this.targets = targets && targets.length > 0 ? targets : undefined;
    if (this.targets) {
      // 多目标多框架：通用铁律只放一份 system，各目标专属框架指引在 user 段
      const { system, user } = buildMultiPrompt(this.targets, settings.aiDecomposeDepth);
      this.messages.push({ role: 'system', content: system + AGENT_SUFFIX });
      this.messages.push({ role: 'user', content: user });
    } else {
      const { system, user } = buildPrompt(content, settings.aiDecomposeDepth, scope, framework);
      this.messages.push({ role: 'system', content: system + AGENT_SUFFIX });
      this.messages.push({ role: 'user', content: user });
    }
  }

  /** 首轮规划：返回初版 goals 并保存快照 */
  async init(): Promise<GoalItem[]> {
    const text = extractChatText(await this.call());
    const obj = JSON.parse(text) as Record<string, unknown>;
    this.goals = this.callParse(parseGoals(obj));
    // 深拷贝首版快照，避免后续手动 edit 工作副本污染 initialGoals（note 模式 reset 依赖它）
    this.initialGoals = JSON.parse(JSON.stringify(this.goals)) as GoalItem[];
    return this.goals;
  }

  /**
   * 用户自然语言改一轮：返回 { reply, goals }，并全量替换工作副本。
   * 坏 JSON / 结构非法 → 回滚本轮、goals 保持不变、抛错（由上层提示）。
   */
  async send(userText: string): Promise<SendResult> {
    this.messages.push({ role: 'user', content: userText });
    try {
      const resp = await this.call();
      const text = extractChatText(resp);
      const obj = JSON.parse(text) as Record<string, unknown>;
      const goals = this.callParse(parseGoals(obj));
      // 成功：全量替换工作副本
      this.goals = goals;
      return {
        reply: typeof obj.reply === 'string' ? obj.reply : '',
        goals,
      };
    } catch (err) {
      // 容错核心：回滚本轮 user 消息，绝不动工作副本
      this.messages.pop();
      throw err instanceof Error ? err : new Error('AI 返回无法解析');
    }
  }

  /**
   * 用户手动编辑后调用：把改动写进对话历史（system note），
   * 让 AI 下轮"知道你改过"，不会再把被删的子项加回来。
   * 真正的 mutate 已在外部直接作用在 this.goals 上。
   */
  applyLocalEdit(note: string): void {
    this.messages.push({ role: 'system', content: `[用户手动改动] ${note}` });
  }

  /** 回到 AI 首版，清空对话历史 */
  reset(): void {
    if (this.mode === 'edit') {
      this.goals = JSON.parse(JSON.stringify(this.initialGoals)) as GoalItem[];
      this.messages = [{ role: 'system', content: this.editSystemContent + AGENT_SUFFIX }];
      return;
    }
    this.goals = JSON.parse(JSON.stringify(this.initialGoals)) as GoalItem[];
    if (this.targets) {
      const { system, user } = buildMultiPrompt(this.targets, this.settings.aiDecomposeDepth);
      this.messages = [
        { role: 'system', content: system + AGENT_SUFFIX },
        { role: 'user', content: user },
      ];
      return;
    }
    const { system, user } = buildPrompt(
      this.content,
      this.settings.aiDecomposeDepth,
      this.scope,
      this.framework
    );
    this.messages = [
      { role: 'system', content: system + AGENT_SUFFIX },
      { role: 'user', content: user },
    ];
  }

  /**
   * 编辑现有目标树（不调 AI）：深拷贝为工作副本，把对话重置为「编辑」上下文，
   * 让后续 send() 的 AI 在现有树基础上增删改，而非从笔记重新拆解。
   * 首版快照 = 传入树，reset() 回到真实首版（不被污染）。
   */
  loadGoals(goals: GoalItem[]): void {
    const clone = JSON.parse(JSON.stringify(goals)) as GoalItem[];
    this.goals = clone;
    this.initialGoals = JSON.parse(JSON.stringify(goals)) as GoalItem[];
    this.mode = 'edit';
    this.editSystemContent =
      '你是目标卡片编辑器。用户已有一个目标树（如下 JSON）：\n' +
      JSON.stringify(goals, null, 2) +
      '\n用户会用自然语言提出「增/删/改」指令，你每次回复都必须返回【当前完整的最新 goals JSON 全量】，保持量化铁律（纯数字 dailyMin、日颗粒度、可数代理指标）。只输出 JSON，不要 markdown 围栏。';
    this.messages = [{ role: 'system', content: this.editSystemContent + AGENT_SUFFIX }];
  }

  /** 当前对话消息（只读用途，如调试 / 测试断言） */
  getMessages(): ChatMessage[] {
    return this.messages;
  }

  private async call(): Promise<AiResponse> {
    const url = `${this.settings.aiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
    return this.fetchFn({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.settings.aiApiKey}`,
      },
      body: JSON.stringify({
        model: this.settings.aiModel,
        messages: this.messages,
        response_format: { type: 'json_object' },
        temperature: AI_TEMPERATURE,
      }),
    });
  }

  /** 解析 + 校验：parseGoals 做字段映射，validateGoals 兜底补默认 */
  private callParse(raw: GoalItem[]): GoalItem[] {
    return _validate(raw);
  }
}
