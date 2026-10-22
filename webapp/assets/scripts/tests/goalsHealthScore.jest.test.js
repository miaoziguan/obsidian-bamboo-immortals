const { loadModule } = require('./__helpers__/testUtils.js');

// healthScore.js 在 renderOverviewCard 内引用 LucideUtils / HTMLUtils / num（均为全局 helper）。
// 这些只在该方法体内使用，不在顶层求值；_generateSuggestion 纯逻辑、不依赖它们。
// 为能覆盖 renderOverviewCard 的空/暂不可用/正常三分支，注入最小 mock。
const { GoalHealthScore } = loadModule('modules/goals/healthScore.js', ['GoalHealthScore'], {
  LucideUtils: { createIcon: () => '<svg></svg>' },
  HTMLUtils: { escapeHtmlAttr: (s) => String(s) },
  num: (x) => x,
});

describe('GoalHealthScore._generateSuggestion（按 TUNING 阈值选建议文案）', () => {
  const base = { L1: 70, L2: 70, L3: 70 };   // 全部落在 [SUGGESTION_LOW, SUGGESTION_HIGH) 之间

  test('L1 低于阈值(60) → 「执行分偏低」', () => {
    expect(GoalHealthScore._generateSuggestion({ ...base, L1: 30 }).text).toBe('执行分偏低');
  });
  test('L1 达到高阈值(85) → 「执行优秀」', () => {
    expect(GoalHealthScore._generateSuggestion({ ...base, L1: 90 }).text).toBe('执行优秀');
  });
  test('L2 低于阈值(60) → 「动力不足」', () => {
    expect(GoalHealthScore._generateSuggestion({ ...base, L2: 40 }).text).toBe('动力不足');
  });
  test('L3 达到高阈值(85) → 「节奏稳定」', () => {
    expect(GoalHealthScore._generateSuggestion({ ...base, L3: 88 }).text).toBe('节奏稳定');
  });
  test('三维度均在 [60,85) → 返回赞美语（不再报问题）', () => {
    const r = GoalHealthScore._generateSuggestion(base);
    expect(['状态极佳', '战略健康', '健康满分']).toContain(r.text);
  });
  test('阈值边界 60 算「不低」（落入赞美分支而非「偏低」）', () => {
    const r = GoalHealthScore._generateSuggestion({ ...base, L1: 60 });
    expect(r.text).not.toBe('执行分偏低');
  });
});

describe('GoalHealthScore.renderOverviewCard（空 / 暂不可用 / 正常）', () => {
  const set = { avgScore: 72, avgLabel: '良好', avgLevel: 'good', L1: 70, L2: 70, L3: 70, count: 3 };

  test('无目标 → 渲染「暂无健康数据」空态', () => {
    const html = GoalHealthScore.renderOverviewCard([], set);
    expect(html).toContain('暂无健康数据');
    expect(html).toContain('goal-health-empty');
  });

  test('有目标但权威快照未就绪（precomputedSet 缺） → 渲染「健康分暂不可用」', () => {
    const html = GoalHealthScore.renderOverviewCard([{ id: 'g1' }], null);
    expect(html).toContain('健康分暂不可用');
  });

  test('正常：渲染分数环 + 三维度指标 + 复盘按钮', () => {
    const html = GoalHealthScore.renderOverviewCard([{ id: 'g1' }], set);
    expect(html).toContain('72');          // 综合分
    expect(html).toContain('目标');         // 目标数统计
    expect(html).toContain('执行');         // L1 指标名
    expect(html).toContain('动力');         // L2 指标名
    expect(html).toContain('节奏');         // L3 指标名
    expect(html).toContain('gho-review-btn'); // 复盘按钮
    expect(html).toContain('gho-suggestion-text'); // 建议区（赞美或问题都渲染）
  });
});
