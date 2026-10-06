/**
 * A10：时间线渲染里的「今天 / 当前时段」必须按**正在渲染的那一天**判定。
 *
 * 背景：应用支持日期导航（navigation.js prevDay/nextDay、handlers/datePicker.js goToDate →
 * store.currentDate），渲染层拿到的 data 是所选那天的数据（sectionRenderFns.timeline →
 * store.getCurrentDayData()）。若渲染器直接读实时时钟，回头看 9/15 时就会出现
 * 「票根背面是 9/15 的汇总、正面印着今天」以及「用现在几点点亮 9/15 的时段」。
 *
 * 本文件锁两条不变量：
 *   1. 非今天（含无日期上下文）→ 不存在「当前时段」：圆点不标 current、节点不带 focus-now、无 tooltip；
 *   2. 票根正面日期来自 data.date，不是实时时钟。
 */
const { loadModule } = require('./__helpers__/testUtils.js');

const TODAY = '2026-10-06';
const PAST = '2026-09-15';

describe('时间线渲染：今天/当前时段按「所渲染那天」判定（A10）', () => {
    let R;

    // 注入 renderers.js 求值期与调用期需要的外部全局（被剥离 import 后靠全局解析）。
    // dateUtils 走真实的模块加载（同 goalStatsCalculator/archiver 用例的惯例），不造假实现。
    const loadRenderer = () => loadModule(
        'renderers/renderers.js',
        ['getPeriodDotStates', 'isCurrentPeriod', 'buildTicketHTML', 'buildBambooPathHTML'],
        {
            ...loadModule('utils/dateUtils.js', ['isTodayKey', 'formatSlashDate']),
            HTMLUtils: { escapeHtmlAttr: (s) => String(s), escapeHtml: (s) => String(s) },
            LucideUtils: new Proxy({}, { get: () => () => '<svg></svg>' }),
            escapeHtml: (s) => String(s),
            num: (v) => String(v),
            store: { subscribe: () => {}, getDateKey: () => TODAY },
            RenderScheduler: { config: () => {} },
            ActionDispatcher: { registerMany: () => {}, register: () => {} },
        },
    );

    beforeEach(() => {
        jest.useFakeTimers();
        // 本地 2026-10-06 10:30 —— 落在 morning(7~12) 内，用来制造「今天确实有当前时段」
        jest.setSystemTime(new Date(2026, 9, 6, 10, 30));
        R = loadRenderer();
    });

    afterEach(() => {
        jest.useRealTimers();
        delete globalThis.store;
    });

    const timelineFixture = () => ([
        { period: 'morning', name: '上午', time: '07:00-12:00', icon: 'sun', items: [{ time: '09:12', task: '写代码' }] },
        { period: 'afternoon', name: '下午', time: '13:00-17:00', icon: 'sun', items: [] },
    ]);

    test('今天（2026-10-06）10:30 → 上午是当前时段', () => {
        expect(R.isCurrentPeriod('morning', TODAY)).toBe(true);
        expect(R.isCurrentPeriod('afternoon', TODAY)).toBe(false);
    });

    test('看历史某天（2026-09-15）→ 任何时段都不是当前时段', () => {
        expect(R.isCurrentPeriod('morning', PAST)).toBe(false);
        expect(R.isCurrentPeriod('afternoon', PAST)).toBe(false);
    });

    test('无日期上下文 / 非法日期键 → 一律不判定为当前（宁可不高亮）', () => {
        expect(R.isCurrentPeriod('morning', null)).toBe(false);
        expect(R.isCurrentPeriod('morning', undefined)).toBe(false);
        expect(R.isCurrentPeriod('morning', '')).toBe(false);
        expect(R.isCurrentPeriod('morning', '2026-9-15')).toBe(false);
        expect(R.isCurrentPeriod('morning', '2026-02-31')).toBe(false);
        // 关键回归：`null >= 0` 为 true，若只写范围比较会把「非今天」判成当前时段
        expect(R.isCurrentPeriod('lateNight', PAST)).toBe(false);
    });

    test('时段圆点：今天恰好一个 current；历史某天全为 false（且非 undefined）', () => {
        const today = R.getPeriodDotStates(timelineFixture(), TODAY);
        expect(today.filter(s => s.isCurrent).map(s => s.key)).toEqual(['morning']);

        const past = R.getPeriodDotStates(timelineFixture(), PAST);
        expect(past.some(s => s.isCurrent)).toBe(false);
        expect(past.every(s => typeof s.isCurrent === 'boolean')).toBe(true);
        // 「有记录」仍来自所选那天的数据，不受日期基准影响
        expect(past.find(s => s.key === 'morning').hasData).toBe(true);
    });

    test('票根正面印所渲染那天的日期，不是今天', () => {
        const dots = R.getPeriodDotStates(timelineFixture(), PAST);
        const html = R.buildTicketHTML(
            { firstCheckIn: '09:12', lastCheckIn: '09:12' },
            '上午',
            dots,
            { activeCount: 1, totalPeriods: 9, totalEvents: 1, activeDuration: '1小时' },
            '2026/9/15',
        );
        expect(html).toContain('ticket-stub-date">2026/9/15<');
        expect(html).not.toContain('2026/10/6');
    });

    test('竹子节点：历史某天不得带 focus-now，今天恰好高亮当前时段', () => {
        const past = R.buildBambooPathHTML({ date: PAST, timeline: timelineFixture() });
        expect(past).not.toContain('focus-now');

        const today = R.buildBambooPathHTML({ date: TODAY, timeline: timelineFixture() });
        expect(today).toContain('focus-now');
    });

    test('data.date 缺失时回落到 store.getDateKey()（与数据来源同一个 key）', () => {
        expect(R.buildBambooPathHTML({ timeline: timelineFixture() })).toContain('focus-now');
    });
});
