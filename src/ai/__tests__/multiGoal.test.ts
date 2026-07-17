/**
 * 多目标多框架（Phase 5）单元测试
 *  - buildMultiPrompt：每个目标各自框架指引注入其 user 段；通用铁律 system 单一来源
 *  - parseSplit / splitGoals：已澄清单 brief → 多条独立 GoalBrief（继承 + 各自 goalKind）
 *  - selectFramework 多类型组合
 */
import { describe, it, expect } from 'vitest';
import { buildPrompt, buildMultiPrompt, type AiFetchFn } from '../MarkdownPlanner';
import { parseSplit, splitGoals, type ElicitSettings } from '../GoalElicitor';
import { selectFramework, FRAMEWORKS } from '../frameworks';
import type { GoalBrief } from '../../types/data';

const baseBrief = (): GoalBrief => ({
  rawIntent: 'RAW',
  reliabilityStatus: 'clarified',
  diseases: [],
  questions: [{ disease: 'vague', question: 'q', answer: 'a' }],
  round: 2,
});

describe('buildMultiPrompt — 多目标多框架', () => {
  it('单目标 milestone：system 与 buildPrompt 通用铁律完全一致，框架指引只进 user 段', () => {
    const { system, user } = buildMultiPrompt([{ content: 'T1', framework: 'milestone' }]);
    expect(system).not.toContain('里程碑拆解');
    expect(system).toContain('你是一个目标拆解助手');
    expect(user).toContain('目标 1');
    expect(user).toContain(`采用「${FRAMEWORKS.milestone.label}」`);
    expect(user).toContain('里程碑拆解');
    // 与单目标 buildPrompt（不带框架）的 system 字节一致（单一来源）
    expect(system).toBe(buildPrompt('x', '中', 'note').system);
  });

  it('quantify 显式不注入任何专业框架指引', () => {
    const { user } = buildMultiPrompt([{ content: 'T', framework: 'quantify' }]);
    expect(user).toContain('量化日级框架（默认）');
    expect(user).not.toContain('里程碑拆解');
    expect(user).not.toContain('阶段推进');
  });

  it('混合多目标：各自框架标注与指引都出现', () => {
    const { user } = buildMultiPrompt([
      { content: 'A', framework: 'milestone' },
      { content: 'B', framework: 'stage' },
      { content: 'C' },
    ]);
    expect(user).toContain('目标 1');
    expect(user).toContain('目标 2');
    expect(user).toContain('目标 3');
    expect(user).toContain(`采用「${FRAMEWORKS.milestone.label}」`);
    expect(user).toContain(`采用「${FRAMEWORKS.stage.label}」`);
    expect(user).toContain('量化日级框架（默认）');
    expect(user).toContain('里程碑拆解');
    expect(user).toContain('阶段推进');
  });
});

describe('parseSplit / splitGoals — 单 brief → 多 brief', () => {
  const text =
    '{"goals":[' +
    '{"goalKind":"project","clarifiedOutcome":"P","successMeasure":"pm","ownedSlice":"po","constraints":"pc","domain":"pd","summary":"ps"},' +
    '{"goalKind":"creative","clarifiedOutcome":"C","summary":"cs"}' +
    ']}';

  it('parseSplit：拆成多条，继承原简报并填各自字段', () => {
    const out = parseSplit(text, baseBrief());
    expect(out).toHaveLength(2);

    expect(out[0].goalKind).toBe('project');
    expect(out[0].clarifiedOutcome).toBe('P');
    expect(out[0].summary).toBe('ps');
    expect(out[0].rawIntent).toBe('RAW');
    expect(out[0].reliabilityStatus).toBe('clarified');
    expect(out[0].round).toBe(2);
    expect(out[0].questions).toHaveLength(1);
    expect(out[0].questions[0].answer).toBe('a');

    expect(out[1].goalKind).toBe('creative');
    expect(out[1].clarifiedOutcome).toBe('C');
    expect(out[1].successMeasure).toBeUndefined();
  });

  it('splitGoals：fake fetch 集成，返回多条独立简报', async () => {
    const fake: AiFetchFn = async () => ({ status: 200, text });
    const settings: ElicitSettings = { aiApiKey: 'k', aiBaseUrl: 'http://x', aiModel: 'm' };
    const out = await splitGoals(baseBrief(), settings, fake);
    expect(out).toHaveLength(2);
    expect(out[0].goalKind).toBe('project');
    expect(out[1].goalKind).toBe('creative');
  });
});

describe('selectFramework — 多类型组合', () => {
  it('project→milestone / creative→stage / 其余→quantify', () => {
    expect(selectFramework({ ...baseBrief(), goalKind: 'project' })).toBe('milestone');
    expect(selectFramework({ ...baseBrief(), goalKind: 'creative' })).toBe('stage');
    expect(selectFramework({ ...baseBrief(), goalKind: 'habit' })).toBe('habit');
    expect(selectFramework({ ...baseBrief(), goalKind: 'unclear' })).toBe('quantify');
    expect(selectFramework(baseBrief())).toBe('quantify');
  });
});
