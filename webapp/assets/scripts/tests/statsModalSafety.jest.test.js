/**
 * @jest-environment jsdom
 */
// 战略复盘「数据概览」安全与口径回归锁：
//  1. 目标标题是用户自由输入，直接插值进 innerHTML 是真实注入链
//     （webapp 的 XSS 还能借 postMessage 反过来驱动宿主的 storage:/file: 写盘接口）；
//  2. title 缺失时原写法 `g.title.length` 抛 TypeError → 整个战略复盘面板渲染失败；
//  3. 统计口径必须与「综合健康分」一致：已归档目标不参与。
const { loadModule } = require('./__helpers__/testUtils');

// 建立 window.HTMLUtils / window.escapeHtml 全局（jsdom 下 window === global）
loadModule('utils/htmlUtils.js', []);

// 模块底部会用 ActionDispatcher.registerMany 注册交互，加载期即执行 → 先备好桩
global.ActionDispatcher = { register: () => { }, registerMany: () => { } };
global.LucideUtils = { createIcon: () => '' };
global.PanelManager = { open: () => { } };

const { StatsModal } = loadModule('handlers/statsModal.js', ['StatsModal']);

/** 与 GoalStatsCalculator.calculate 输出同形的最小桩 */
function cannedStats(gs) {
    return {
        totalGoals: gs.length,
        completedGoals: 0,
        inProgressGoals: gs.length,
        notStartedGoals: 0,
        activeGoals: gs.length,
        avgProgress: 0,
        totalSubItems: 0,
        subItemCompletionRate: 0,
        urgentGoals: gs.slice(),
        overdueGoals: [],
        upcomingGoals: [],
        stagnantGoals: [],
        progressTiers: { tier100: 0, tier76_99: 0, tier51_75: 0, tier26_50: 0, tier0_25: 0 },
        catStats: [],
        timeSpanStats: { shortTerm: 0, mediumTerm: 0, longTerm: 0 },
    };
}

describe('战略复盘·数据概览：目标标题安全渲染', () => {
    beforeEach(() => {
        global.LucideUtils = { createIcon: () => '' };
        global.GoalStatsCalculator = { calculate: cannedStats };
    });

    test('恶意标题被转义，不产生可执行标签', () => {
        global.store = { getGlobalGoals: () => [{ id: 'g1', title: '<img src=x onerror=alert(1)>' }] };
        const html = StatsModal.renderStatsHTML();
        expect(html).not.toContain('<img');
        expect(html).not.toContain('onerror=');
        expect(html).toContain('&lt;img');
    });

    test('标题含 & 与尖括号时全部转义（文本上下文）', () => {
        global.store = { getGlobalGoals: () => [{ id: 'g1', title: 'a&b<c>d' }] };
        const html = StatsModal.renderStatsHTML();
        expect(html).not.toContain('<c>');
        expect(html).toContain('a&amp;b');
        expect(html).toContain('&lt;c&gt;');
    });

    test('title 缺失时不抛错，回落「未命名目标」', () => {
        global.store = { getGlobalGoals: () => [{ id: 'g2' }] };
        expect(() => StatsModal.renderStatsHTML()).not.toThrow();
        expect(StatsModal.renderStatsHTML()).toContain('未命名目标');
    });

    test('超长标题截断后再转义（截断基于原文长度）', () => {
        global.store = { getGlobalGoals: () => [{ id: 'g3', title: '12345678901234567' }] };
        const html = StatsModal.renderStatsHTML();
        expect(html).toContain('123456789012...');
        expect(html).not.toContain('1234567890123');
    });
});

describe('战略复盘·数据概览：统计口径与数据源', () => {
    beforeEach(() => {
        global.LucideUtils = { createIcon: () => '' };
    });

    test('本地计算时排除已归档目标（与综合健康分同口径）', () => {
        let seen = null;
        global.GoalStatsCalculator = {
            calculate: (gs) => { seen = gs; return cannedStats(gs); },
        };
        global.store = {
            getGlobalGoals: () => [
                { id: 'archived', archived: true },
                { id: 'active' },
            ],
        };
        StatsModal.renderStatsHTML();
        expect(seen.map((g) => g.id)).toEqual(['active']);
    });

    test('传入宿主权威 overview 时直接消费，不再本地计算', () => {
        const spy = jest.fn(cannedStats);
        global.GoalStatsCalculator = { calculate: spy };
        global.store = { getGlobalGoals: () => [{ id: 'x' }] };
        const remote = cannedStats([]);
        remote.totalGoals = 99;

        const html = StatsModal.renderStatsHTML(remote);

        expect(spy).not.toHaveBeenCalled();
        expect(html).toContain('>99<');
    });
});
