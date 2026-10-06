/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

/**
 * 加载 helpers.js。
 *
 * 注意：loadModule 会剥离源码里的 import，被剥离的名字只能经 globalThis 解析，
 * 因此本文件必须注入两个依赖：
 *   - byId（domRef.js）—— scrollToSection 用；
 *   - getScrollHost（domRef.js）—— scrollToSection 需要知道「谁在滚」
 *     （shadow 模式是 host，文档模式是 window）；
 *   - formatDate（dateUtils.js）—— C 轮去重后 helpers 只转发实现，但文件尾的
 *     window 全局桥仍要写 formatDate，缺注入会在求值期直接抛 ReferenceError。
 */
const { formatDate: realFormatDate } = loadModule('utils/dateUtils.js', ['formatDate']);
const { getScrollHost: realGetScrollHost } = loadModule('utils/domRef.js', ['getScrollHost']);

function loadHelpers(globals = {}) {
    return loadModule('utils/helpers.js', [
        'scrollToSection', 'formatDate', 'getChineseDateDisplay', 'getChineseWeekday',
        'parseTime', 'calculateCheckInTimes'
    ], { formatDate: realFormatDate, getScrollHost: realGetScrollHost, ...globals });
}

function loadHelpersWithDom() {
    return loadHelpers({ byId: (id) => document.getElementById(id) });
}

describe('helpers 工具函数', () => {
    let h;

    beforeEach(() => {
        jest.resetModules();
        h = loadHelpers();
    });

    test('formatDate 应正确格式化日期对象为 YYYY-MM-DD', () => {
        const date = new Date(2026, 4, 18);
        expect(h.formatDate(date)).toBe('2026-05-18');
    });

    test('formatDate 应处理月份和日期的零填充', () => {
        const date = new Date(2026, 0, 5);
        expect(h.formatDate(date)).toBe('2026-01-05');
    });

    test('getChineseDateDisplay 应返回中文日期格式', () => {
        const date = new Date(2026, 4, 18);
        expect(h.getChineseDateDisplay(date)).toBe('2026年5月18日');
    });

    test('getChineseWeekday 应返回正确的中文星期', () => {
        const monday = new Date(2024, 0, 1);
        expect(h.getChineseWeekday(monday)).toBe('周一');
        const sunday = new Date(2024, 0, 7);
        expect(h.getChineseWeekday(sunday)).toBe('周日');
    });
});

describe('helpers.parseTime（产在用：renderers.js:245）', () => {
    let h;

    beforeEach(() => {
        jest.resetModules();
        h = loadHelpers();
    });

    test('解析 HH:MM 与 H:MM', () => {
        expect(h.parseTime('08:30')).toEqual({ hour: 8, minute: 30 });
        expect(h.parseTime('9:05')).toEqual({ hour: 9, minute: 5 });
    });

    test('空值 / 非字符串 / 非两位分钟 → null', () => {
        expect(h.parseTime(null)).toBeNull();
        expect(h.parseTime('')).toBeNull();
        expect(h.parseTime('abc')).toBeNull();
        expect(h.parseTime('8:5')).toBeNull();
    });

    test('契约：trim + 取首个 HH:MM（C 轮与 TimelineService 统一后的口径）', () => {
        // editor.js 的时间框是自由文本（placeholder 即「例如: 09:00 - 12:00」），
        // 故容忍前后空格与夹带文本，取第一个时间点；分钟仍须两位。
        expect(h.parseTime(' 08:30 ')).toEqual({ hour: 8, minute: 30 });
        expect(h.parseTime('约08:30')).toEqual({ hour: 8, minute: 30 });
        expect(h.parseTime('09:00 - 12:00')).toEqual({ hour: 9, minute: 0 });
        expect(h.parseTime('8:5')).toBeNull();
    });
});

describe('helpers.calculateCheckInTimes（产在用：renderers.js:480 + timeline/editor.js:50/179/196）', () => {
    let h;

    beforeEach(() => {
        jest.resetModules();
        h = loadHelpers();
    });

    test('跨时段取最早 / 最晚打卡并补零', () => {
        const timeline = [
            { period: 'morning', items: [{ time: '09:05' }, { time: '10:30' }] },
            { period: 'evening', items: [{ time: '08:00' }, { time: '23:59' }] },
        ];
        expect(h.calculateCheckInTimes(timeline)).toEqual({ firstCheckIn: '08:00', lastCheckIn: '23:59' });
    });

    test('单条记录时首末相同', () => {
        const timeline = [{ items: [{ time: '07:15' }] }];
        expect(h.calculateCheckInTimes(timeline)).toEqual({ firstCheckIn: '07:15', lastCheckIn: '07:15' });
    });

    test('区间写法（编辑器 placeholder 引导）取起点作为打卡时间', () => {
        // parseTime 返回单值：区间只取起点，终点不参与首末计算。此处钉住该确定行为。
        const timeline = [{ period: 'morning', items: [{ time: '09:00 - 12:00' }] }];
        expect(h.calculateCheckInTimes(timeline)).toEqual({ firstCheckIn: '09:00', lastCheckIn: '09:00' });
    });

    test('非数组 / 空数组 / 无有效时间 → 统一回退 --:--', () => {
        const empty = { firstCheckIn: '--:--', lastCheckIn: '--:--' };
        expect(h.calculateCheckInTimes(null)).toEqual(empty);
        expect(h.calculateCheckInTimes('nope')).toEqual(empty);
        expect(h.calculateCheckInTimes([])).toEqual(empty);
        expect(h.calculateCheckInTimes([{ items: [{ time: 'bad' }] }])).toEqual(empty);
    });

    test('容忍缺失 items 的时段与缺失 time 的条目', () => {
        const timeline = [{ items: null }, {}, { items: [{ time: '07:15' }, {}] }];
        expect(h.calculateCheckInTimes(timeline)).toEqual({ firstCheckIn: '07:15', lastCheckIn: '07:15' });
    });

    test('按数值排序而非字符串序（9:0x 早于 10:0x）', () => {
        const timeline = [{ items: [{ time: '9:05' }, { time: '10:02' }] }];
        expect(h.calculateCheckInTimes(timeline)).toEqual({ firstCheckIn: '09:05', lastCheckIn: '10:02' });
    });
});

describe('helpers.scrollToSection（产在用：quickNav.js:66-67 经 window 全局桥）', () => {
    let h;

    beforeEach(() => {
        jest.resetModules();
        h = loadHelpersWithDom();
    });

    test('在连元素：按 headerOffset = 100 计算目标位置并平滑滚动', () => {
        const el = document.createElement('div');
        el.id = 'section-todo';
        document.body.appendChild(el);
        el.getBoundingClientRect = () => ({ top: 300, width: 100, height: 50, bottom: 350, left: 0, right: 100 });
        Object.defineProperty(window, 'pageYOffset', { value: 120, configurable: true });
        const scrollTo = jest.fn();
        window.scrollTo = scrollTo;

        h.scrollToSection('section-todo');

        expect(scrollTo).toHaveBeenCalledWith({ top: 320, behavior: 'smooth' });
        el.remove();
    });

    test('元素不存在 → 静默返回，不滚动、不抛错', () => {
        const scrollTo = jest.fn();
        window.scrollTo = scrollTo;

        expect(() => h.scrollToSection('not-exist')).not.toThrow();
        expect(scrollTo).not.toHaveBeenCalled();
    });

    test('零尺寸（未布局 / 隐藏）→ 直接跳过', () => {
        const el = document.createElement('div');
        el.id = 'section-zero';
        document.body.appendChild(el);
        const scrollTo = jest.fn();
        window.scrollTo = scrollTo;

        h.scrollToSection('section-zero');

        expect(scrollTo).not.toHaveBeenCalled();
        el.remove();
    });
});
