/**
 * DisplayManager 真实加载回归锁。
 *
 * 背景（P0-1 覆盖率摸底发现）：handlers/displayManager.js 共 1643 行，但**从未被任何测试加载**——
 * 既有测试都是往 global 塞一个 mock DisplayManager 对象，于是绿灯掩盖了「真实实现一次都没执行」。
 * 而本轮改动（_scheduleResponsive 合帧调度、rw-* 由 remove+add 改 toggle）恰恰落在这个文件里，
 * 属于「改了高风险代码却零验证」的状态。本文件用 loadModule **真实加载**该模块来锁住这些行为。
 *
 * 注意：displayManager 依赖 domRef/palette 的导出，但这两个模块不向 globalThis 发布，
 * 故必须经 loadModule 的第三参注入（否则剥离 import 后标识符解析不到）。
 */
const { loadModule } = require('./__helpers__/testUtils');

function setupDisplay() {
    document.body.innerHTML =
        '<div id="reviewContainer"></div><div id="main-container"></div>';

    const rafCbs = [];
    global.requestAnimationFrame = (cb) => { rafCbs.push(cb); return rafCbs.length; };
    global.cancelAnimationFrame = () => {};

    const globals = {
        byId: (id) => document.getElementById(id),
        getCssVarRoot: () => document.documentElement,
        $: (sel, ctx) => (ctx || document).querySelector(sel),
        modalMount: () => document.body,
        eventInTargets: () => false,
        getGlobalComputedStyle: () => ({}),
        getHost: () => window,
        applyDerivedRgb: () => {},
    };

    const { DisplayManager } = loadModule('handlers/displayManager.js', ['DisplayManager'], globals);

    // 每个用例从干净状态开始
    DisplayManager._currentWidth = null;
    DisplayManager._rwScheduled = false;
    DisplayManager._resizeObserver = null;
    DisplayManager._currentWidth = null;

    const flushRaf = () => {
        const cbs = rafCbs.splice(0, rafCbs.length);
        cbs.forEach((cb) => cb());
    };

    return { DM: DisplayManager, rafCbs, flushRaf };
}

const container = () => document.getElementById('reviewContainer');

describe('DisplayManager 真实加载（_applyWidth）', () => {
    test('设置宽度写入 --content-max-width 与 -wide，并记录 _currentWidth', () => {
        const { DM } = setupDisplay();
        DM._applyWidth(1000, false);
        expect(document.documentElement.style.getPropertyValue('--content-max-width')).toBe('1000px');
        expect(document.documentElement.style.getPropertyValue('--content-max-width-wide')).toBe('1000px');
        expect(DM._currentWidth).toBe(1000);
    });

    test('宽度传 0（旧数据全屏标记）回退到 DEFAULT_WIDTH 而非写入 0px', () => {
        const { DM } = setupDisplay();
        DM._applyWidth(0, false);
        expect(DM._currentWidth).toBe(DM.DEFAULT_WIDTH);
        expect(document.documentElement.style.getPropertyValue('--content-max-width')).toBe(DM.DEFAULT_WIDTH + 'px');
    });

    test('缺少 #reviewContainer 时安全返回，不抛错也不写变量', () => {
        const { DM } = setupDisplay();
        document.body.innerHTML = '';   // 移除容器
        expect(() => DM._applyWidth(900, false)).not.toThrow();
        expect(DM._currentWidth).toBeNull();
    });
});

describe('DisplayManager 真实加载（响应式类 rw-*）', () => {
    test('按有效宽度正确施加断点类：500 → 命中 rw-620/rw-520，不命更窄档', () => {
        const { DM } = setupDisplay();
        // jsdom 无布局，getBoundingClientRect().width 为 0 → 回退用 _currentWidth
        DM._currentWidth = 500;
        DM._applyResponsiveClasses();
        const cl = container().classList;
        expect(cl.contains('rw-620')).toBe(true);
        expect(cl.contains('rw-520')).toBe(true);
        expect(cl.contains('rw-460')).toBe(false);
        expect(cl.contains('rw-420')).toBe(false);
        expect(cl.contains('rw-360')).toBe(false);
    });

    test('紧凑类随宽度切换：600 内 compact，480 内 ultra-compact', () => {
        const { DM } = setupDisplay();
        DM._currentWidth = 700;
        DM._applyResponsiveClasses();
        expect(container().classList.contains('display-compact')).toBe(false);

        DM._currentWidth = 550;
        DM._applyResponsiveClasses();
        expect(container().classList.contains('display-compact')).toBe(true);
        expect(container().classList.contains('display-ultra-compact')).toBe(false);

        DM._currentWidth = 400;
        DM._applyResponsiveClasses();
        expect(container().classList.contains('display-ultra-compact')).toBe(true);
    });

    test('toggle 写法幂等：同宽度重复施加，类集合保持一致', () => {
        const { DM } = setupDisplay();
        DM._currentWidth = 500;
        DM._applyResponsiveClasses();
        const first = Array.from(container().classList).sort().join(',');
        DM._applyResponsiveClasses();
        const second = Array.from(container().classList).sort().join(',');
        expect(second).toBe(first);
    });
});

describe('DisplayManager 真实加载（_scheduleResponsive 合帧调度）', () => {
    test('同帧内多次请求只排队一次 rAF', () => {
        const { DM, rafCbs } = setupDisplay();
        DM._scheduleResponsive();
        DM._scheduleResponsive();
        DM._scheduleResponsive();
        expect(rafCbs.length).toBe(1);
        expect(DM._rwScheduled).toBe(true);
    });

    test('flush 后只执行一次 _applyResponsiveClasses，并复位调度标志', () => {
        const { DM, flushRaf } = setupDisplay();
        const spy = jest.fn();
        DM._applyResponsiveClasses = spy;

        DM._scheduleResponsive();
        DM._scheduleResponsive();
        DM._scheduleResponsive();
        flushRaf();

        expect(spy).toHaveBeenCalledTimes(1);   // 三次请求合并为一次执行
        expect(DM._rwScheduled).toBe(false);    // 标志复位，允许后续帧再次调度
    });

    test('_applyWidth 同步重算一次（必要），额外请求再走合帧补一次', () => {
        const { DM, rafCbs, flushRaf } = setupDisplay();
        const spy = jest.fn();
        DM._applyResponsiveClasses = spy;

        DM._applyWidth(1000, false);
        // 注意：_applyWidth 内的这一次重算**刻意是同步的**，不走合帧。
        // 原因：刚改完 --content-max-width，必须立刻得到匹配的响应式类；
        // 若也推迟到下一帧，会出现「宽度已变、类还没跟上」的一帧错配（表现为跳变）。
        // 合帧调度只用于 ResizeObserver / 布局切换 finish 那一路（它们天然落在同一帧）。
        expect(spy).toHaveBeenCalledTimes(1);
        expect(rafCbs.length).toBe(0);

        DM._scheduleResponsive();
        DM._scheduleResponsive();
        expect(rafCbs.length).toBe(1);   // 额外请求合并为一帧
        flushRaf();
        expect(spy).toHaveBeenCalledTimes(2);
    });
});
