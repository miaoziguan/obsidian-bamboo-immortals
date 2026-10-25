/**
 * Perf 测量器单测（P1-5 基础设施自身的回归锁）。
 *
 * 说明：测量器必须「极轻且绝不影响功能」，因此这里覆盖三类关键性质：
 *   ① 记录与统计正确（分位数/最值/均值）；
 *   ② 有界（每个 label 只留最近 CAP 个样本，长会话不涨内存）；
 *   ③ 健壮（非法输入忽略；环境缺 performance 时退回 Date.now 且不抛错）。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

function freshPerf() {
    return loadModule('utils/perf.js', ['Perf']).Perf;
}

describe('Perf 记录与统计', () => {
    test('start/stop 记录样本并返回非负耗时', () => {
        const Perf = freshPerf();
        const stop = Perf.start('op');
        const dt = stop();
        expect(typeof dt).toBe('number');
        expect(dt).toBeGreaterThanOrEqual(0);
        const rows = Perf.summary();
        expect(rows).toHaveLength(1);
        expect(rows[0].label).toBe('op');
        expect(rows[0].count).toBe(1);
    });

    test('summary 分位数/最值/均值正确（已知样本 10~50）', () => {
        const Perf = freshPerf();
        for (const v of [10, 50, 20, 40, 30]) Perf.record('x', v);
        const [row] = Perf.summary();
        expect(row).toMatchObject({
            label: 'x',
            count: 5,
            p50: 30,
            p95: 50,
            max: 50,
            avg: 30,
        });
    });

    test('summary 按 p95 降序（最慢的排最前）', () => {
        const Perf = freshPerf();
        Perf.record('fast', 1);
        Perf.record('fast', 2);
        Perf.record('slow', 100);
        Perf.record('slow', 200);
        const rows = Perf.summary();
        expect(rows.map((r) => r.label)).toEqual(['slow', 'fast']);
    });

    test('非法耗时被忽略（NaN / Infinity / 非数字）', () => {
        const Perf = freshPerf();
        Perf.record('x', NaN);
        Perf.record('x', Infinity);
        Perf.record('x', 'abc');
        Perf.record('x', null);
        expect(Perf.summary()).toEqual([]);
    });
});

describe('Perf 有界性', () => {
    test('每个 label 只保留最近 CAP 个样本', () => {
        const Perf = freshPerf();
        for (let i = 0; i < Perf.CAP + 50; i++) Perf.record('x', i);
        const [row] = Perf.summary();
        expect(row.count).toBe(Perf.CAP);
        // 保留的是最近的样本：最大值应为最后一个被记录的值
        expect(row.max).toBe(Perf.CAP + 49);
    });

    test('不同 label 互不干扰', () => {
        const Perf = freshPerf();
        for (let i = 0; i < Perf.CAP + 10; i++) Perf.record('a', i);
        Perf.record('b', 1);
        const rows = Perf.summary();
        expect(rows.find((r) => r.label === 'a').count).toBe(Perf.CAP);
        expect(rows.find((r) => r.label === 'b').count).toBe(1);
    });
});

describe('Perf 开关与健壮性', () => {
    test('setEnabled(false) 后不再记录；重新开启可记录', () => {
        const Perf = freshPerf();
        Perf.setEnabled(false);
        Perf.record('x', 5);
        expect(Perf.summary()).toEqual([]);

        Perf.setEnabled(true);
        Perf.record('x', 5);
        expect(Perf.summary()).toHaveLength(1);
    });

    test('reset 清空全部样本', () => {
        const Perf = freshPerf();
        Perf.record('x', 1);
        Perf.record('y', 1);
        Perf.reset();
        expect(Perf.summary()).toEqual([]);
    });

    test('环境缺 performance 时退回 Date.now 且不抛错', () => {
        const original = global.performance;
        try {
            // @ts-ignore 故意移除
            delete global.performance;
            delete globalThis.performance;
            const Perf = freshPerf();
            const stop = Perf.start('no-perf');
            expect(() => stop()).not.toThrow();
            expect(Perf.summary()[0].count).toBe(1);
            expect(() => Perf.mark('m')).not.toThrow();
        } finally {
            global.performance = original;
            globalThis.performance = original;
        }
    });

    test('mark 在缺 performance.mark 的环境不抛错', () => {
        const original = global.performance;
        try {
            global.performance = { now: () => 1 };
            const Perf = freshPerf();
            expect(() => Perf.mark('x')).not.toThrow();
        } finally {
            global.performance = original;
        }
    });
});

/**
 * 插桩点守卫：性能测量只有在「确实插在关键路径上」才有意义。
 * 这些断言很轻（读源码找关键子串），但能在重构时阻止测量被静默移除——
 * 那会让后续所有「优化了多少」的讨论重新失去依据。
 */
describe('关键路径插桩点仍在', () => {
    const ROOT = path.resolve(__dirname, '..');
    const CASES = [
        ['modules/layout/layoutMode.js', "Perf.start('layout:enter')"],
        ['modules/layout/layoutMode.js', "Perf.start('layout:off')"],
        ['renderers/renderScheduler.js', "Perf.start('render:flush')"],
        ['renderers/renderScheduler.js', "Perf.record('boot:first-render'"],
        ['handlers/features/PersistenceCoordinator.js', "Perf.start('save:'"],
    ];

    test.each(CASES)('%s 含 %s', (file, needle) => {
        const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
        expect(src).toContain(needle);
    });

    test('perf.js 发布全局名（loadModule 剥离 import 后调用方按全局解析）', () => {
        const src = fs.readFileSync(path.join(ROOT, 'utils/perf.js'), 'utf8');
        expect(src).toContain('globalThis.Perf');
    });
});

/**
 * 集成验证：静态守卫只能证明「文本还在」，这里跑一次真实切档流程，
 * 证明插桩确实产出了样本（否则报表永远是空的，等同于没插）。
 */
describe('插桩在真实流程中生效', () => {
    test('进入看板后记录到 layout:enter 样本', () => {
        document.body.innerHTML =
            '<div id="sectionsContainer"><div class="section"></div></div><div id="main-container"></div>';
        global.requestAnimationFrame = (cb) => { cb(); return 0; };
        global.byId = (id) => document.getElementById(id);
        global.EventBus = { on: () => {} };
        global.Toast = { showToast: () => {} };
        global.SectionRegistry = { getVisible: () => Array.from(document.querySelectorAll('.section')) };
        global.DisplayManager = {
            _currentWidth: 800,
            DEFAULT_WIDTH: 800,
            MIN_WIDTH: 400,
            _applyWidth: () => {},
            _applyResponsiveClasses: () => {},
            _scheduleResponsive: () => {},
        };
        global.storageManager = { putSetting: () => {}, getSetting: async () => null };
        global.window.__bambooIsMainLeaf = true;
        global.window.__bambooCameFromSidebar = false;

        const { LayoutMode } = loadModule('modules/layout/layoutMode.js', ['LayoutMode']);
        // 从「冷启动」状态进入看板
        LayoutMode._mode = 'none';
        LayoutMode._restoring = false;
        LayoutMode._movingToCenter = false;
        LayoutMode._collapseRequested = false;
        LayoutMode._collapsedRightSidebar = false;

        LayoutMode._enter('kanban');

        const row = globalThis.Perf.summary().find((r) => r.label === 'layout:enter');
        // 应记录到 layout:enter 样本（未记录时 row 为 undefined，下一行会因取属性而失败）
        expect(row).toBeDefined();
        expect(row.count).toBeGreaterThanOrEqual(1);
        expect(row.max).toBeGreaterThanOrEqual(0);
    });
});
