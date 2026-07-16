/**
 * @jest-environment jsdom
 *
 * openHealthScoreDetail 的「用 AI 改进」按钮：
 * 点击 → window.parent.postMessage({type:'app:aiImproveGoal', payload:{goalId,title,hints}})
 * 把目标（含本地健康分 hints）喂给插件侧 Agentic 编辑链路。
 */
const { loadModule } = require('./__helpers__/testUtils');

// 建立 window.HTMLUtils / escapeHtml 全局
loadModule('utils/htmlUtils.js', []);

const LucideStub = { createIcon: () => '' };
const ActionDispatcherStub = new Proxy({}, { get: () => () => {} });

const postSpy = jest.fn();
const ToastStub = { showToast: jest.fn() };
const PanelManagerStub = {
  open: jest.fn((_title, _icon, content, opts) => {
    const panel = document.createElement('div');
    panel.innerHTML = content;
    document.body.appendChild(panel);
    if (opts && typeof opts.onOpen === 'function') opts.onOpen(panel);
    return panel;
  }),
};
const storeStub = {
  getGlobalGoals: () => [{ id: 'g-x', title: '健康减重', archived: false, items: [] }],
};
const GoalHealthScoreStub = {
  _buildDataCache: () => ({}),
  compute: () => ({
    score: 62,
    label: '需关注',
    color: '#f59e0b',
    L1: { onTime: { hint: 'L1 拖延提示' } },
    L3: { stagnation: { hint: 'L3 停滞提示' } },
  }),
  computeSet: () => ({
    avgScore: 62,
    avgLabel: '需关注',
    avgColor: '#f59e0b',
    trend: 0,
    L1: 70,
    L2: 60,
    L3: 40,
  }),
  generateDynamicHints: () => [],
};

const { GoalsRenderer } = loadModule('modules/goals/renderer.js', ['GoalsRenderer'], {
  LucideUtils: LucideStub,
  ActionDispatcher: ActionDispatcherStub,
  store: storeStub,
  PanelManager: PanelManagerStub,
  GoalHealthScore: GoalHealthScoreStub,
  Toast: ToastStub,
});

describe('健康分详情 · 用 AI 改进按钮', () => {
  beforeEach(() => {
    postSpy.mockClear();
    ToastStub.showToast.mockClear();
    PanelManagerStub.open.mockClear();
    document.body.innerHTML = '';
    window.parent.postMessage = postSpy;
  });

  it('渲染每个目标一个「用 AI 改进」按钮，带 goalId/title/hints 数据', () => {
    GoalsRenderer.openHealthScoreDetail();
    const btn = document.querySelector('.health-goal-improve');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('data-goal-id')).toBe('g-x');
    expect(btn.getAttribute('data-goal-title')).toBe('健康减重');
    expect(btn.getAttribute('data-hints')).toBe('L1 拖延提示；L3 停滞提示');
  });

  it('点击按钮 → 向插件 postMessage app:aiImproveGoal（含目标标识与 hints）', () => {
    GoalsRenderer.openHealthScoreDetail();
    const btn = document.querySelector('.health-goal-improve');
    btn.click();
    expect(postSpy).toHaveBeenCalledTimes(1);
    const msg = postSpy.mock.calls[0][0];
    expect(msg.type).toBe('app:aiImproveGoal');
    expect(msg.payload).toEqual({
      goalId: 'g-x',
      title: '健康减重',
      hints: 'L1 拖延提示；L3 停滞提示',
    });
    expect(ToastStub.showToast).toHaveBeenCalled();
  });
});
