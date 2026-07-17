import { describe, it, expect } from 'vitest';
import {
  FRAMEWORKS,
  FRAMEWORK_IDS,
  selectFramework,
  frameworkLabel,
  type FrameworkType,
} from '../frameworks';
import { buildPrompt } from '../MarkdownPlanner';
import type { GoalBrief, GoalKind } from '../../types/data';

/** 造一份最小 GoalBrief（只填要测的字段） */
function brief(over: Partial<GoalBrief> = {}): GoalBrief {
  return {
    rawIntent: 'x',
    reliabilityStatus: 'clarified',
    diseases: [],
    questions: [],
    round: 1,
    ...over,
  };
}

describe('selectFramework', () => {
  it('project → milestone', () => {
    expect(selectFramework(brief({ goalKind: 'project' }))).toBe('milestone');
  });
  it('creative → stage', () => {
    expect(selectFramework(brief({ goalKind: 'creative' }))).toBe('stage');
  });
  it('habit → habit（专属框架，不再回落 quantify）', () => {
    expect(selectFramework(brief({ goalKind: 'habit' }))).toBe('habit');
  });
  it('unclear / vision / borrowed / 缺失 → 回落默认 quantify', () => {
    const kinds: (GoalKind | undefined)[] = ['unclear', 'vision', 'borrowed', undefined];
    for (const k of kinds) {
      expect(selectFramework(brief({ goalKind: k }))).toBe('quantify');
    }
  });
});

describe('framework 注册表与标签', () => {
  it('四个框架齐全且默认在其中', () => {
    expect(FRAMEWORK_IDS).toEqual(['quantify', 'habit', 'milestone', 'stage']);
    for (const id of FRAMEWORK_IDS) {
      expect(FRAMEWORKS[id].label.length).toBeGreaterThan(0);
      expect(FRAMEWORKS[id].description.length).toBeGreaterThan(0);
    }
  });
  it('frameworkLabel 返回展示名', () => {
    expect(frameworkLabel('milestone' as FrameworkType)).toBe('项目里程碑框架');
    expect(frameworkLabel('stage' as FrameworkType)).toBe('创作阶段框架');
    expect(frameworkLabel('habit' as FrameworkType)).toBe('习惯回路框架');
    expect(frameworkLabel('quantify' as FrameworkType)).toBe('量化日级框架');
  });
});

describe('buildPrompt 框架注入（向后兼容）', () => {
  it('不传 framework → 与历史版本一致，不含专业框架指引', () => {
    const { system } = buildPrompt('x', '中');
    expect(system).not.toContain('里程碑拆解');
    expect(system).not.toContain('阶段推进');
    // 通用量化铁律仍在
    expect(system).toContain('量化');
  });

  it("framework='milestone' → 追加项目里程碑指引", () => {
    const { system } = buildPrompt('3 个月上线 v2', '中', 'note', 'milestone');
    expect(system).toContain('里程碑拆解');
    expect(system).toContain('可交付');
  });

  it("framework='stage' → 追加创作阶段指引", () => {
    const { system } = buildPrompt('写一部长篇小说', '中', 'note', 'stage');
    expect(system).toContain('阶段推进');
    expect(system).toContain('初稿写作');
  });

  it("framework='quantify' 显式传入 → 不追加（等同缺省）", () => {
    const { system } = buildPrompt('x', '中', 'note', 'quantify');
    expect(system).not.toContain('里程碑拆解');
    expect(system).not.toContain('阶段推进');
  });

  it("framework='habit' → 追加工厂回路指引", () => {
    const { system } = buildPrompt('每天早起读书', '中', 'note', 'habit');
    expect(system).toContain('习惯回路');
    expect(system).toContain('最小可行量');
  });
});
