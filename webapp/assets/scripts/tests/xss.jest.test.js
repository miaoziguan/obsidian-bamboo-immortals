/**
 * @jest-environment jsdom
 *
 * XSS 防护回归：恶意负载在渲染层（innerHTML）不产生可执行元素。
 * 通过最小化桩驱动 GoalsRenderer.renderGoalView，验证
 * escapeHtml / escapeHtmlAttr 对用户输入字段的转义有效性。
 */
const { loadModule } = require('./__helpers__/testUtils');

// 建立 window.HTMLUtils / window.escapeHtml 全局
loadModule('utils/htmlUtils.js', []);

const LucideStub = { createIcon: () => '' };
// ActionDispatcher.registerMany(...) 在模块顶层调用，提供无操作桩
const ActionDispatcherStub = new Proxy({}, { get: () => () => {} });
const { GoalsRenderer } = loadModule('modules/goals/renderer.js', ['GoalsRenderer'], {
  LucideUtils: LucideStub,
  ActionDispatcher: ActionDispatcherStub,
});

// 最小化内部依赖桩
GoalsRenderer.getCategories = () => [];
GoalsRenderer.calcProgress = () => 0;
GoalsRenderer.calcDaysRemaining = () => null;
GoalsRenderer.renderDateRangeTag = () => '';
GoalsRenderer.renderSubDateTag = () => '';
GoalsRenderer.isDailyCompleted = () => false;
GoalsRenderer.calcProgressFromValues = () => 0;
GoalsRenderer._formatNumber = (v) => ({ displayValue: String(v), fullValue: String(v) });

describe('目标渲染 XSS 防护', () => {
  it('恶意标题/子项名/值不注入 HTML 元素', () => {
    const goal = {
      id: 'g1',
      title: '<img src=x onerror=alert(1)>标题',
      items: [
        {
          name: '<script>alert(1)</script>子项',
          currentValue: '<svg onload=alert(1)>',
          dailyMin: '<b>每日</b>',
        },
      ],
    };
    const html = GoalsRenderer.renderGoalView(goal, 0);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    expect(tmp.querySelector('img')).toBeNull();
    expect(tmp.querySelector('script')).toBeNull();
    expect(tmp.querySelector('svg')).toBeNull();
    expect(tmp.querySelector('b')).toBeNull();
    // 文本被转义保留
    expect(tmp.textContent).toContain('标题');
    expect(tmp.textContent).toContain('子项');
  });

  it('categoryId / goalId 属性值被 escapeHtmlAttr 转义', () => {
    const goal = {
      id: '"><img src=x onerror=alert(1)>',
      title: 'normal',
      category: '"><img src=x>',
      items: [],
    };
    const html = GoalsRenderer.renderGoalView(goal, 0);
    // 属性中不应出现未转义的 ">" 导致标签提前闭合
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
  });
});
