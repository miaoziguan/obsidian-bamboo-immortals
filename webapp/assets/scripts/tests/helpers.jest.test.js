/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

function loadHelpers() {
    return loadModule('utils/helpers.js', [
        'formatDate', 'getChineseDateDisplay', 'getChineseWeekday',
        'debounce', 'throttle', 'createElement', '$', '$$'
    ]);
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

    test('debounce 应延迟执行函数', () => {
        jest.useFakeTimers();
        const fn = jest.fn();
        const debounced = h.debounce(fn, 100);
        debounced('a');
        expect(fn).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledWith('a');
        expect(fn).toHaveBeenCalledTimes(1);
        jest.useRealTimers();
    });

    test('debounce immediate 模式应立即执行', () => {
        jest.useFakeTimers();
        const fn = jest.fn();
        const debounced = h.debounce(fn, 100, true);
        debounced('a');
        expect(fn).toHaveBeenCalledWith('a');
        expect(fn).toHaveBeenCalledTimes(1);
        jest.useRealTimers();
    });

    test('throttle 应限制函数调用频率', () => {
        jest.useFakeTimers();
        const fn = jest.fn();
        const throttled = h.throttle(fn, 100);
        throttled('a');
        expect(fn).toHaveBeenCalledWith('a');
        expect(fn).toHaveBeenCalledTimes(1);
        fn.mockClear();
        throttled('b');
        expect(fn).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledWith('b');
        jest.useRealTimers();
    });
});
