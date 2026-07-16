import { describe, it, expect } from 'vitest';
import { parseDiagnosis, buildDiagnosisMessages, diagnose, buildHealthSummary } from '../GoalDiagnoser';
import { buildCache } from '../DeviationCalculator';
import type { AiFetchFn, AiResponse, PlannerSettings } from '../MarkdownPlanner';
import type { GoalItem, DayData } from '../../types/data';

describe('GoalDiagnoser.parseDiagnosis', () => {
  it('合法 JSON → 返回结构化 Diagnosis，并校验/补全字段', () => {
    const text = JSON.stringify({
      summary: '3 个目标 1 达标 2 落后',
      goals: [
        { title: '健康减重', completion: 62, status: 'behind', bottleneck: '跑步停滞', suggestions: ['将跑步 dailyMin 降到 15'] },
        { title: '阅读', status: 'invalid_enum', suggestions: [] },
      ],
      nextActions: ['整体下调 dailyMin 约 20%'],
    });
    const d = parseDiagnosis(text);
    expect(d.ok).toBe(true);
    if (!d.ok) return;
    expect(d.summary).toBe('3 个目标 1 达标 2 落后');
    expect(d.goals).toHaveLength(2);
    expect(d.goals[0].status).toBe('behind');
    expect(d.goals[0].suggestions).toEqual(['将跑步 dailyMin 降到 15']);
    // 非法 status 回退 behind
    expect(d.goals[1].status).toBe('behind');
    expect(d.nextActions).toEqual(['整体下调 dailyMin 约 20%']);
  });

  it('坏 JSON → 回退 rawText，不抛错', () => {
    const d = parseDiagnosis('{这不是合法 json');
    expect(d.ok).toBe(false);
    if (d.ok) return;
    expect(typeof d.rawText).toBe('string');
  });

  it('纯文本（非对象）→ 回退 rawText', () => {
    const d = parseDiagnosis('建议把跑步的每日量调小一些，别太激进。');
    expect(d.ok).toBe(false);
    if (d.ok) return;
    expect(d.rawText).toContain('跑步');
  });

  it('缺省字段被补全（空 summary / 空 goals / 空 nextActions）', () => {
    const d = parseDiagnosis(JSON.stringify({ goals: [{ title: 'X', status: 'on_track' }] }));
    expect(d.ok).toBe(true);
    if (!d.ok) return;
    expect(d.summary).toBe('');
    expect(d.goals[0].suggestions).toEqual([]);
    expect(d.nextActions).toEqual([]);
  });
});

describe('GoalDiagnoser.buildDiagnosisMessages', () => {
  it('system 强制 JSON / status 枚举 / suggestions 为可操作指令', () => {
    const msgs = buildDiagnosisMessages('- 减重｜status=behind');
    expect(msgs).toHaveLength(2);
    const sys = msgs[0].content;
    expect(sys).toContain('只输出一个 JSON');
    expect(sys).toContain('on_track');
    expect(sys).toContain('at_risk');
    expect(sys).toContain('可直接交给另一个 AI 去改目标树');
    expect(msgs[1].content).toContain('减重');
  });
});

describe('GoalDiagnoser.diagnose (注入 fetchFn)', () => {
  const settings: PlannerSettings = {
    aiApiKey: 'k',
    aiBaseUrl: 'https://x',
    aiModel: 'm',
    aiDecomposeDepth: '中',
  };
  const goals: GoalItem[] = [{ id: 'g1', title: '减重' }];
  const days: DayData[] = [];

  it('合法 AI 回执 → 结构化 Diagnosis', async () => {
    const aiResp: AiResponse = {
      status: 200,
      json: {
        summary: 'S',
        goals: [{ title: '减重', completion: 62, status: 'behind', suggestions: ['降 dailyMin'] }],
        nextActions: ['A'],
      },
    };
    const fetchFn: AiFetchFn = async () => aiResp;
    const d = await diagnose(goals, days, settings, fetchFn);
    expect(d.ok).toBe(true);
    if (!d.ok) return;
    expect(d.goals[0].title).toBe('减重');
    expect(d.nextActions).toEqual(['A']);
  });

  it('AI 调用失败 → 回退 rawText，不抛错', async () => {
    const fetchFn: AiFetchFn = async () => {
      throw new Error('network down');
    };
    const d = await diagnose(goals, days, settings, fetchFn);
    expect(d.ok).toBe(false);
    if (d.ok) return;
    expect(d.rawText).toContain('network down');
  });
});

describe('GoalDiagnoser.parseDiagnosis — evidenceRef', () => {
  it('保留 evidenceRef（聚焦的真实子项名）', () => {
    const text = JSON.stringify({
      summary: 's',
      goals: [
        { title: '字库研发', status: 'behind', evidenceRef: '喵字摇滚体', suggestions: ['把「喵字摇滚体」dailyMin 调低'] },
      ],
      nextActions: [],
    });
    const d = parseDiagnosis(text);
    expect(d.ok).toBe(true);
    if (!d.ok) return;
    expect(d.goals[0].evidenceRef).toBe('喵字摇滚体');
  });
});

describe('GoalDiagnoser.buildDiagnosisMessages — 真实子项上下文 + 禁编造', () => {
  it('system 注入「禁止编造」且保留 JSON/枚举/可操作要求', () => {
    const ctx = '目标「字库研发」：\n    - 喵字摇滚体｜dailyMin=10';
    const msgs = buildDiagnosisMessages('摘要文本', ctx);
    const sys = msgs[0].content;
    expect(sys).toContain('只输出一个 JSON');
    expect(sys).toContain('on_track');
    expect(sys).toContain('at_risk');
    expect(sys).toContain('可直接交给另一个 AI 去改目标树');
    expect(sys).toContain('禁止');
    expect(sys).toContain('清单');
    // user 同时含硬指标摘要与真实子项上下文
    const user = msgs[1].content;
    expect(user).toContain('摘要文本');
    expect(user).toContain('喵字摇滚体');
  });

  it('无上下文时（兜底）不抛错，system 仍要求 JSON', () => {
    const msgs = buildDiagnosisMessages('摘要文本');
    expect(msgs).toHaveLength(2);
    expect(msgs[0].content).toContain('只输出一个 JSON');
    expect(msgs[1].content).toContain('摘要文本');
  });
});

describe('GoalDiagnoser.buildHealthSummary — 三维健康分文本', () => {
  const today = new Date('2026-07-16T00:00:00');

  it('输出每目标健康分 + L1/L2/L3 三维 + 最弱维度（供 AI 按维度归因）', () => {
    const goals: GoalItem[] = [
      {
        id: 'g1',
        title: '字库研发',
        startDate: '2026-06-01',
        endDate: '2026-08-01',
        progress: 20,
        items: [
          { name: 'A', currentValue: '90', targetValue: '100' },
          { name: 'B', currentValue: '5', targetValue: '100' },
        ],
      },
    ];
    // 无任何活跃/进度缓存 → 停滞 + 落后，最弱维度可确定
    const cache = buildCache(goals, []);
    const text = buildHealthSummary(goals, cache, today);
    expect(text).toContain('字库研发');
    expect(text).toContain('健康分');
    expect(text).toContain('L1');
    expect(text).toContain('L2');
    expect(text).toContain('L3');
    expect(text).toContain('最弱维度');
  });

  it('空目标 → 兜底文本，不抛错', () => {
    const text = buildHealthSummary([], buildCache([], []), today);
    expect(typeof text).toBe('string');
  });
});

describe('GoalDiagnoser.buildDiagnosisMessages — 健康分哲学注入', () => {
  it('system 教入三维模型 + 反直觉价值观 + level/weakest 新 schema，且保留旧约束', () => {
    const msgs = buildDiagnosisMessages('摘要', '子项上下文', '目标「减重」健康分 62/100（需关注）');
    const sys = msgs[0].content;
    // 旧约束保留（向后兼容）
    expect(sys).toContain('只输出一个 JSON');
    expect(sys).toContain('on_track');
    expect(sys).toContain('at_risk');
    expect(sys).toContain('可直接交给另一个 AI 去改目标树');
    // 新：三维健康模型 + 反直觉价值观
    expect(sys).toContain('L1');
    expect(sys).toContain('L2');
    expect(sys).toContain('L3');
    expect(sys).toContain('领先');
    expect(sys).toContain('停滞');
    expect(sys).toContain('最弱维度');
    // 新 JSON schema 字段
    expect(sys).toContain('level');
    expect(sys).toContain('weakest');
    expect(sys).toContain('excellent');
    expect(sys).toContain('warning');
    // user 注入健康分摘要
    expect(msgs[1].content).toContain('健康分 62/100');
  });
});

describe('GoalDiagnoser.parseDiagnosis — 健康分字段', () => {
  it('解析 healthScore/level/weakest/L1/L2/L3', () => {
    const text = JSON.stringify({
      summary: 's',
      goals: [
        {
          title: '减重',
          status: 'behind',
          healthScore: 62,
          level: 'warning',
          weakest: 'L3',
          L1: 55,
          L2: 70,
          L3: 60,
          suggestions: ['激活惯性：先完成子项 B 一次'],
        },
      ],
      nextActions: [],
    });
    const d = parseDiagnosis(text);
    expect(d.ok).toBe(true);
    if (!d.ok) return;
    const g = d.goals[0];
    expect(g.healthScore).toBe(62);
    expect(g.level).toBe('warning');
    expect(g.weakest).toBe('L3');
    expect(g.L1).toBe(55);
    expect(g.L2).toBe(70);
    expect(g.L3).toBe(60);
  });

  it('非法 level/weakest → undefined（不污染结构）', () => {
    const text = JSON.stringify({
      goals: [{ title: 'X', status: 'on_track', level: 'super', weakest: 'L9' }],
    });
    const d = parseDiagnosis(text);
    expect(d.ok).toBe(true);
    if (!d.ok) return;
    expect(d.goals[0].level).toBeUndefined();
    expect(d.goals[0].weakest).toBeUndefined();
  });
});

describe('GoalDiagnoser.diagnose — 注入健康分摘要', () => {
  it('调用 AI 时 user 消息包含健康分三维摘要', async () => {
    const goals: GoalItem[] = [
      {
        id: 'g1',
        title: '字库研发',
        startDate: '2026-06-01',
        endDate: '2026-08-01',
        progress: 20,
        items: [{ name: '喵字摇滚体', dailyMin: '10' }],
      },
    ];
    const days: DayData[] = [];
    const settings: PlannerSettings = {
      aiApiKey: 'k',
      aiBaseUrl: 'https://x',
      aiModel: 'm',
      aiDecomposeDepth: '中',
    };
    let capturedBody = '';
    const fetchFn: AiFetchFn = async (opts) => {
      capturedBody = opts.body ?? '';
      return {
        status: 200,
        json: { summary: 's', goals: [{ title: '字库研发', status: 'behind', suggestions: [] }], nextActions: [] },
      };
    };
    const d = await diagnose(goals, days, settings, fetchFn, new Date('2026-07-16T00:00:00'));
    expect(d.ok).toBe(true);
    const body = JSON.parse(capturedBody);
    const userMsg = body.messages.find((m: { role: string }) => m.role === 'user');
    expect(userMsg.content).toContain('健康分');
  });
});

describe('GoalDiagnoser.diagnose — 透传真实子项上下文', () => {
  it('调用 AI 时，user 消息包含真实子项名（非幻觉）', async () => {
    const goals: GoalItem[] = [
      {
        id: 'g1',
        title: '字库研发',
        items: [{ name: '喵字摇滚体', dailyMin: '10', percent: 34 }],
      },
    ];
    const days: DayData[] = [];
    const settings: PlannerSettings = {
      aiApiKey: 'k',
      aiBaseUrl: 'https://x',
      aiModel: 'm',
      aiDecomposeDepth: '中',
    };
    let capturedBody = '';
    const fetchFn: AiFetchFn = async (opts) => {
      capturedBody = opts.body ?? '';
      return {
        status: 200,
        json: {
          summary: 's',
          goals: [{ title: '字库研发', status: 'behind', suggestions: ['降 dailyMin'] }],
          nextActions: [],
        },
      };
    };
    const d = await diagnose(goals, days, settings, fetchFn);
    expect(d.ok).toBe(true);
    const body = JSON.parse(capturedBody);
    const userMsg = body.messages.find((m: { role: string }) => m.role === 'user');
    expect(userMsg.content).toContain('喵字摇滚体');
  });
});
