import { describe, it, expect } from 'vitest';
import { parseDiagnosis, buildDiagnosisMessages, diagnose } from '../GoalDiagnoser';
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
