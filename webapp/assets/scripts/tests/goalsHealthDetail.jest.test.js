/**
 * GoalsRenderer.openHealthScoreDetail 特征测试（P2-6 Round 1 · 迁移前锁定行为）。
 *
 * 背景：该方法 313 行，其中约 90% 是静态 HTML 模板拼装。计划把模板抽成
 * modules/goals/healthDetailView.js 里的纯函数；本文件先把**当前行为**钉住，
 * 迁移后同一批用例必须原样通过 —— 这是「抽模板不改输出」的判据。
 *
 * 断言策略：不比对整段 HTML（任何注释/空格变动都会误报），只锁**结构性事实**：
 * 面板 id / 标题 / tab 集合 / 目标条目的关键文本与属性 / 未就绪时的自愈分支。
 */
const { loadModule } = require('./__helpers__/testUtils');

function makeHealth() {
    return {
        health: { avgScore: 88, avgColor: '#4caf50', avgLabel: '良好', trend: 3, L1: 90, L2: 85, L3: 80 },
        results: [
            {
                goalId: 'g1',
                score: 88,
                label: '良好',
                color: '#4caf50',
                L1: { onTime: { hint: '按时完成' } },
                L3: { stagnation: { hint: '' } },
            },
        ],
        hints: [{ type: 'stagnation', level: 'warn', text: '有目标停滞' }],
        overview: { updatedAt: 1700000000000 },
    };
}

function setup(opts = {}) {
    document.body.innerHTML = '';
    const opened = [];
    const toasts = [];

    const G = {
        ActionDispatcher: { registerMany: () => {} },
        HTMLUtils: { escapeHtmlAttr: (s) => String(s), escapeHtml: (s) => String(s) },
        LucideUtils: { createIcon: () => '<svg class="ico"></svg>' },
        Toast: { showToast: (m) => toasts.push(m) },
        num: (v) => Number(v) || 0,
        escapeHtml: (s) => String(s),
        PanelManager: {
            open: (id, title, content, o) => opened.push({ id, title, content, opts: o }),
        },
        StatsModal: { renderStatsHTML: () => '<div class="stats-stub"></div>' },
        store: { getGlobalGoals: () => opts.goals ?? [] },
        byId: (id) => document.getElementById(id),
        modalMount: () => document.body,
        eventInTargets: () => false,
    };
    Object.assign(global, G);
    window.GoalHealthScore = {};

    const { GoalsRenderer } = loadModule('modules/goals/renderer.js', ['GoalsRenderer'], G);
    return { GoalsRenderer, opened, toasts };
}

describe('openHealthScoreDetail（迁移前行为锁）', () => {
    test('就绪时：以 health-score 面板打开，含 3 个 tab，标题带「战略复盘」', () => {
        const { GoalsRenderer, opened } = setup({ goals: [{ id: 'g1', title: '读书计划', archived: false }] });
        GoalsRenderer._remoteHealth = makeHealth();

        GoalsRenderer.openHealthScoreDetail();

        expect(opened).toHaveLength(1);
        const panel = opened[0];
        expect(panel.id).toBe('health-score');
        expect(panel.title).toContain('战略复盘');
        expect(panel.opts.tabs.map((t) => t.id)).toEqual(['overview', 'diagnosis', 'system']);
        expect(typeof panel.opts.onOpen).toBe('function');
    });

    test('内容包含目标条目关键文本与健康分环形结构', () => {
        const { GoalsRenderer, opened } = setup({ goals: [{ id: 'g1', title: '读书计划', archived: false }] });
        GoalsRenderer._remoteHealth = makeHealth();

        GoalsRenderer.openHealthScoreDetail();
        const html = opened[0].content;

        expect(html).toContain('读书计划');           // 目标标题
        expect(html).toContain('88分');               // 目标分
        expect(html).toContain('health-score-ring');  // 分数环
        expect(html).toContain('data-goal-id="g1"');  // AI 改进按钮所需的 data 属性
        expect(html).toContain('按时完成');            // L1 hint
        expect(html).toContain('核心体检');            // 深度诊断 tab 分区标题
        expect(html).toContain('tab-content-overview'); // 三个 tab 内容容器之一（标签在 opts.tabs，不在 content）
    });

    test('归档目标不进入条目（getGlobalGoals 已过滤 archived，但仍校验不渲染）', () => {
        const { GoalsRenderer, opened } = setup({
            goals: [
                { id: 'g1', title: '活跃目标', archived: false },
                { id: 'g2', title: '已归档目标', archived: true },
            ],
        });
        GoalsRenderer._remoteHealth = makeHealth();
        // 模拟 store 未过滤的情形：方法自身会再 filter 一次
        GoalsRenderer.openHealthScoreDetail();
        const html = opened[0].content;
        expect(html).toContain('活跃目标');
        expect(html).not.toContain('已归档目标');
    });

    test('健康分未就绪：提示 + 触发一次远端拉取自愈，且不打开面板', () => {
        const { GoalsRenderer, opened, toasts } = setup({ goals: [{ id: 'g1', title: 'x', archived: false }] });
        const requested = [];
        GoalsRenderer._requestRemoteHealth = (goals) => requested.push(goals);
        GoalsRenderer._remoteHealth = null;

        GoalsRenderer.openHealthScoreDetail();

        expect(opened).toHaveLength(0);
        expect(toasts[0]).toContain('健康分尚未就绪');
        expect(requested).toHaveLength(1);
    });

    test('window.GoalHealthScore 缺失时静默返回（不动 store、不开面板）', () => {
        const { GoalsRenderer, opened } = setup({ goals: [] });
        window.GoalHealthScore = undefined;
        GoalsRenderer._remoteHealth = makeHealth();

        expect(() => GoalsRenderer.openHealthScoreDetail()).not.toThrow();
        expect(opened).toHaveLength(0);
    });
});
