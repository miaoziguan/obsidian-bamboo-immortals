import { describe, it, expect, vi } from 'vitest';
import {
  buildElicitPrompt,
  buildSplitPrompt,
  parseElicitation,
  elicitGoal,
  briefToPlanningText,
  type AiResponse,
} from '../GoalElicitor';
import type { GoalBrief } from '../../types/data';

const settings = { aiApiKey: 'k', aiBaseUrl: 'https://x', aiModel: 'm' };
const fakeApp: any = { workspace: {} };

/** 构造一个假的 AiFetchFn（直接回 json 对象，绕过 requestUrl） */
function fakeFetch(resp: AiResponse): typeof import('obsidian').requestUrl {
  return (vi.fn() as any).mockResolvedValue(resp);
}

describe('parseElicitation', () => {
  it('解析通过态：diseases 空 + 结构化字段', () => {
    const r = parseElicitation(
      JSON.stringify({
        goalKind: 'creative',
        diseases: [],
        questions: [],
        summary: '想写小说',
        clarifiedOutcome: '10 万字恋爱小说',
        successMeasure: '完稿且通读无硬伤',
        ownedSlice: '每天写一章草稿',
        constraints: '2 个月内',
        domain: '创作',
      })
    );
    expect(r.goalKind).toBe('creative');
    expect(r.diseases).toEqual([]);
    expect(r.questions).toEqual([]);
    expect(r.clarifiedOutcome).toBe('10 万字恋爱小说');
    expect(r.domain).toBe('创作');
  });

  it('解析缺口态：保留 disease 标签与追问', () => {
    const r = parseElicitation({
      goalKind: 'vision',
      diseases: ['vague', 'non_owned'],
      questions: [
        { disease: 'vague', question: '第一按什么算？' },
        { disease: 'non_owned', question: '你能控制哪块？' },
      ],
      summary: '想成为行业第一',
    });
    expect(r.diseases).toEqual(['vague', 'non_owned']);
    expect(r.questions).toHaveLength(2);
    expect(r.questions[0].disease).toBe('vague');
  });

  it('过滤未知 disease 与空 question', () => {
    const r = parseElicitation(
      JSON.stringify({
        diseases: ['vague', 'totally_made_up'],
        questions: [{ disease: 'vague', question: '' }, { disease: 'vague', question: '具体点？' }],
      })
    );
    expect(r.diseases).toEqual(['vague']);
    expect(r.questions).toHaveLength(1);
    expect(r.questions[0].question).toBe('具体点？');
  });

  it('容忍 ```json 围栏与前后废话', () => {
    const r = parseElicitation(
      '好的，这是结果：\n```json\n{"diseases":["no_commit"],"questions":[{"disease":"no_commit","question":"何时？"}]}\n```\n以上。'
    );
    expect(r.diseases).toEqual(['no_commit']);
  });
});

describe('buildElicitPrompt', () => {
  it('系统提示词覆盖五类病 + 原始意图进入 user', () => {
    const { system, user } = buildElicitPrompt('成为行业第一');
    expect(system).toContain('vague');
    expect(system).toContain('non_owned');
    expect(system).toContain('means_as_end');
    expect(system).toContain('no_commit');
    expect(system).toContain('outcome_as_input');
    expect(user).toContain('成为行业第一');
  });

  it('多轮：user 携带已进行对话历史', () => {
    const { user } = buildElicitPrompt('成为行业第一', [
      { q: '第一按什么算？', a: '营收第一' },
    ]);
    expect(user).toContain('第1轮');
    expect(user).toContain('营收第一');
  });

  it('系统提示词注入 goalKind 判别准则（防 creative 被误判 project）', () => {
    const { system } = buildElicitPrompt('想写本小说');
    expect(system).toContain('goalKind 判别');
    expect(system).toContain('写一本小说');
    expect(system).toContain('孕育/打磨一件新作品');
    expect(system).toContain('执行一个已有计划');
  });
});

describe('buildSplitPrompt', () => {
  const base: GoalBrief = {
    rawIntent: 'RAW',
    reliabilityStatus: 'clarified',
    diseases: [],
    questions: [],
    round: 2,
  };

  it('系统提示词含 goalKind 判别准则与 project/creative 反例', () => {
    const { system } = buildSplitPrompt(base);
    expect(system).toContain('goalKind 判别');
    // 关键反例：写小说必须归 creative，不是 project
    expect(system).toContain('写一本小说');
    expect(system).toContain('减重 5kg');
    // 判据句
    expect(system).toContain('执行一个已有计划');
    expect(system).toContain('孕育/打磨一件新作品');
  });

  it('user 透传已澄清简报；system 要求按相互独立目标拆分', () => {
    const { system, user } = buildSplitPrompt(base);
    expect(user).toContain('用户已澄清的总目标简报：');
    expect(system).toContain('相互独立');
  });
});

describe('elicitGoal', () => {
  it('解析 AI 回执（json 对象）', async () => {
    const fetchFn = fakeFetch({
      status: 200,
      json: { diseases: ['vague'], questions: [{ disease: 'vague', question: '?' }] },
    } as AiResponse);
    const r = await elicitGoal('成为行业第一', settings, fetchFn as any);
    expect(r.diseases).toEqual(['vague']);
  });

  it('首次失败则重试一次', async () => {
    const seq = [
      { status: 500, json: undefined } as AiResponse,
      { status: 200, json: { diseases: [], questions: [] } } as AiResponse,
    ];
    let i = 0;
    const fetchFn = (vi.fn() as any).mockImplementation(async () => seq[i++]);
    const r = await elicitGoal('具体目标', settings, fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(r.diseases).toEqual([]);
  });

  it('两次都失败则抛错', async () => {
    const fetchFn = (vi.fn() as any).mockResolvedValue({ status: 500 } as AiResponse);
    await expect(elicitGoal('x', settings, fetchFn)).rejects.toThrow(/AI 澄清失败/);
  });
});

describe('briefToPlanningText', () => {
  it('编译通过态简报为可规划文本', () => {
    const brief: GoalBrief = {
      rawIntent: '成为行业第一',
      goalKind: 'creative',
      clarifiedOutcome: '10 万字小说',
      successMeasure: '完稿',
      ownedSlice: '每天写一章',
      constraints: '2 个月',
      domain: '创作',
      reliabilityStatus: 'clarified',
      diseases: [],
      questions: [
        { disease: 'vague', question: '第一按什么算？', answer: '完稿且通读无硬伤' },
      ],
      summary: '写小说',
      round: 2,
    };
    const text = briefToPlanningText(brief);
    expect(text).toContain('【目标简报 · AI 已澄清】');
    expect(text).toContain('具体成果：10 万字小说');
    expect(text).toContain('成功口径：完稿');
    expect(text).toContain('我可控的抓手：每天写一章');
    expect(text).toContain('约束（期限/资源）：2 个月');
    expect(text).toContain('问：第一按什么算？');
    expect(text).toContain('答：完稿且通读无硬伤');
    expect(text).toContain('请基于以上简报进行拆解。');
  });

  it('无结构化字段时仍输出问答', () => {
    const brief: GoalBrief = {
      rawIntent: '成为行业第一',
      reliabilityStatus: 'forced',
      diseases: ['vague'],
      questions: [{ disease: 'vague', question: '具体点？', answer: '营收第一' }],
      round: 1,
    };
    const text = briefToPlanningText(brief);
    // 空字段不渲染占位行（实现刻意省略），但问答会保留
    expect(text).not.toContain('我可控的抓手：');
    expect(text).toContain('答：营收第一');
  });
});

// 占位：让 fakeApp 被引用，避免未使用变量告警（与现有测试风格一致）
void fakeApp;
