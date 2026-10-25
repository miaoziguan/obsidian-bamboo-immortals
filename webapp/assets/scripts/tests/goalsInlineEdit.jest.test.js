/**
 * GoalsRenderer._startInlineEdit 特征测试（P2-6 Round 1 · 迁移前锁定行为）。
 *
 * 背景：该方法 360 行、此前**零测试**，是画中卷目标行内编辑的唯一入口。
 * 计划把方法体逐字搬到 modules/goals/inlineEditService.js 的 startInlineEdit(ctx, el)
 * （ctx 传渲染器自身，故 this.→ctx. 为纯文本替换，行为不变）；
 * 本文件先把关键行为钉住，迁移后同一批用例必须原样通过。
 *
 * 覆盖：
 *   · 三道守卫（无此目标 / 已归档 / 已在编辑）
 *   · 输入框构造（title / name 前缀剥离 / 未知类型不替换）
 *   · blur 提交链路（_validateInlineEdit → _commitInlineEdit → 重渲染 → 闪烁反馈）
 *   · 校验失败：红框 + Toast + 不提交
 *   · picker 类分支（category / status / dateRange 无 subIdx）
 */
const { loadModule } = require('./__helpers__/testUtils');

const tick = () => new Promise((r) => setTimeout(r, 0));

function setup(opts = {}) {
    document.body.innerHTML = '<div id="host"></div>';
    const toasts = [];
    const commits = [];
    const pickers = {};

    const G = {
        ActionDispatcher: { registerMany: () => {} },
        HTMLUtils: { escapeHtmlAttr: (s) => String(s), escapeHtml: (s) => String(s) },
        LucideUtils: { createIcon: () => '<svg></svg>' },
        Toast: { showToast: (m) => toasts.push(m) },
        num: (v) => Number(v) || 0,
        escapeHtml: (s) => String(s),
        PanelManager: { open: () => {} },
        StatsModal: { renderStatsHTML: () => '' },
        store: { getGlobalGoals: () => opts.goals || [] },
        GoalService: { calcSuggestedDaily: () => null, calcDaysRemaining: () => null },
        byId: (id) => document.getElementById(id),
        modalMount: () => document.body,
        eventInTargets: () => false,
    };
    Object.assign(global, G);
    window.GoalHealthScore = {};

    const { GoalsRenderer } = loadModule('modules/goals/renderer.js', ['GoalsRenderer'], G);

    // 依赖方法一律打桩：本文件只测「入口方法自身的行为」
    GoalsRenderer._commitInlineEdit = (goal, subIdx, type, val) => {
        commits.push([goal.id, subIdx, type, val]);
        return Promise.resolve();
    };
    GoalsRenderer.renderSingleGoal = () => {};
    GoalsRenderer._flashEditedElement = () => {};
    GoalsRenderer._showCategoryPicker = (o) => { pickers.category = o; };
    GoalsRenderer._showPriorityPicker = (o) => { pickers.priority = o; };
    GoalsRenderer._showDateRangePicker = (o) => { pickers.dateRange = o; };

    const mount = (dataset, text = '') => {
        const el = document.createElement('span');
        Object.assign(el.dataset, dataset);
        el.textContent = text;
        document.getElementById('host').appendChild(el);
        return el;
    };

    return { GoalsRenderer, toasts, commits, pickers, mount };
}

const goalFixture = (over = {}) => ({ id: 'g1', title: '旧标题', archived: false, items: [], ...over });

describe('_startInlineEdit 守卫', () => {
    test('目标不存在 → 直接返回，不创建输入框', () => {
        const { GoalsRenderer, mount } = setup({ goals: [] });
        const el = mount({ inlineEdit: 'title', goalId: 'missing' }, 'x');
        GoalsRenderer._startInlineEdit(el);
        expect(document.querySelector('#host input')).toBeNull();
    });

    test('已归档目标 → Toast 警告且不进入编辑', () => {
        const { GoalsRenderer, toasts, mount } = setup({ goals: [goalFixture({ archived: true })] });
        const el = mount({ inlineEdit: 'title', goalId: 'g1' }, 'x');
        GoalsRenderer._startInlineEdit(el);
        expect(document.querySelector('#host input')).toBeNull();
        expect(toasts.join()).toContain('已归档');
    });

    test('元素内已有输入控件 → 不重复进入编辑', () => {
        const { GoalsRenderer, mount } = setup({ goals: [goalFixture()] });
        const el = mount({ inlineEdit: 'title', goalId: 'g1' }, 'x');
        el.innerHTML = '<input class="existing">';
        GoalsRenderer._startInlineEdit(el);
        expect(document.querySelectorAll('#host input')).toHaveLength(1);   // 仍是原来那个
    });
});

describe('_startInlineEdit 输入框构造', () => {
    test('title：创建文本框并以去白空的文本为初值', () => {
        const { GoalsRenderer, mount } = setup({ goals: [goalFixture()] });
        const el = mount({ inlineEdit: 'title', goalId: 'g1' }, '  旧标题  ');
        GoalsRenderer._startInlineEdit(el);

        const input = document.querySelector('#host input');
        expect(input).not.toBeNull();
        expect(input.type).toBe('text');
        expect(input.value).toBe('旧标题');
        expect(input.className).toContain('goal-inline-edit-input');
    });

    test('name：剥离行首 ✓ / ⏸ 标记后再作为初值', () => {
        const { GoalsRenderer, mount } = setup({ goals: [goalFixture()] });
        const el = mount({ inlineEdit: 'name', goalId: 'g1' }, '✓ 读书半小时');
        GoalsRenderer._startInlineEdit(el);
        expect(document.querySelector('#host input').value).toBe('读书半小时');
    });

    test('未知 editType → default 分支返回，元素不被替换', () => {
        const { GoalsRenderer, mount } = setup({ goals: [goalFixture()] });
        const el = mount({ inlineEdit: 'not-a-type', goalId: 'g1' }, 'x');
        GoalsRenderer._startInlineEdit(el);
        expect(document.querySelector('#host input')).toBeNull();
        expect(el.isConnected).toBe(true);
    });
});

describe('_startInlineEdit 提交链路', () => {
    test('blur 且校验通过 → 以 (goal, subIdx, type, 新值) 提交并重渲染', async () => {
        const { GoalsRenderer, commits, mount } = setup({ goals: [goalFixture()] });
        const rendered = [];
        GoalsRenderer.renderSingleGoal = (id) => rendered.push(id);
        GoalsRenderer._validateInlineEdit = () => ({ valid: true });

        const el = mount({ inlineEdit: 'title', goalId: 'g1' }, '旧标题');
        GoalsRenderer._startInlineEdit(el);
        const input = document.querySelector('#host input');
        input.value = '新标题';
        input.dispatchEvent(new Event('blur'));
        await tick();

        expect(commits[0]).toEqual(['g1', null, 'title', '新标题']);
        expect(rendered).toContain('g1');
    });

    test('校验失败 → 标红 + Toast 错误 + 不提交', async () => {
        const { GoalsRenderer, commits, toasts, mount } = setup({ goals: [goalFixture()] });
        GoalsRenderer._validateInlineEdit = () => ({ valid: false, message: '超出允许范围' });

        const el = mount({ inlineEdit: 'currentValue', goalId: 'g1' }, '1');
        GoalsRenderer._startInlineEdit(el);
        const input = document.querySelector('#host input');
        input.value = '99999';
        input.dispatchEvent(new Event('blur'));
        await tick();

        expect(commits).toHaveLength(0);
        expect(input.classList.contains('goal-inline-edit-input-error')).toBe(true);
        expect(toasts.join()).toContain('超出允许范围');
    });
});

describe('_startInlineEdit picker 类分支', () => {
    test('category → 以 dataset.category 作为当前分类打开选择器', () => {
        const { GoalsRenderer, pickers, mount } = setup({ goals: [goalFixture()] });
        const el = mount({ inlineEdit: 'category', goalId: 'g1', category: 'c9' }, 'x');
        GoalsRenderer._startInlineEdit(el);
        expect(pickers.category).toBeDefined();
        expect(pickers.category.currentCatId).toBe('c9');
    });

    test('status（子项）→ 在「已搁置」与空之间切换并提交', async () => {
        const { GoalsRenderer, commits, mount } = setup({
            goals: [goalFixture({ items: [{ detail: '' }] })],
        });
        const el = mount({ inlineEdit: 'status', goalId: 'g1', subIdx: '0' }, 'x');
        GoalsRenderer._startInlineEdit(el);
        await tick();
        expect(commits[0]).toEqual(['g1', 0, 'status', '已搁置']);
    });

    test('dateRange 且无 subIdx → 提示并返回，不打开日期选择器', () => {
        const { GoalsRenderer, toasts, pickers, mount } = setup({ goals: [goalFixture()] });
        const el = mount({ inlineEdit: 'dateRange', goalId: 'g1' }, 'x');
        GoalsRenderer._startInlineEdit(el);
        expect(pickers.dateRange).toBeUndefined();
        expect(toasts.join()).toContain('自动计算');
    });
});
