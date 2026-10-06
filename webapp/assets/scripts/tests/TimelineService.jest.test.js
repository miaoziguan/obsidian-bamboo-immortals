/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

// C 轮去重：TimelineService 的 parseTime / calculateCheckInTimes 已委托 utils/helpers.js，
// loadModule 剥离 import 后这两个名字只能经 globalThis 解析，故此处注入真实实现
// （loadTimelineService 的 overrides 可换成探针，见文件末的去重守卫用例）。
const { formatDate } = loadModule('utils/dateUtils.js', ['formatDate']);
const helpers = loadModule('utils/helpers.js', ['parseTime', 'calculateCheckInTimes'], { formatDate });

function loadTimelineService(overrides = {}) {
    return loadModule('services/TimelineService.js', ['TimelineService'], {
        parseTimeUtil: helpers.parseTime,
        calculateCheckInTimesUtil: helpers.calculateCheckInTimes,
        ...overrides
    }).TimelineService;
}

describe('TimelineService.parseTime', () => {
    let TimelineService;

    beforeEach(() => {
        jest.resetModules();
        TimelineService = loadTimelineService();
    });

    test('应正确解析时间字符串', () => {
        expect(TimelineService.parseTime('08:30')).toEqual({ hour: 8, minute: 30 });
        expect(TimelineService.parseTime('14:05')).toEqual({ hour: 14, minute: 5 });
        expect(TimelineService.parseTime('9:00')).toEqual({ hour: 9, minute: 0 });
    });

    test('无效输入应返回 null', () => {
        expect(TimelineService.parseTime(null)).toBeNull();
        expect(TimelineService.parseTime('')).toBeNull();
        expect(TimelineService.parseTime('abc')).toBeNull();
        expect(TimelineService.parseTime('25:00')).toEqual({ hour: 25, minute: 0 });
    });
});

describe('TimelineService.calculateCheckInTimes', () => {
    let TimelineService;

    beforeEach(() => {
        jest.resetModules();
        TimelineService = loadTimelineService();
    });

    test('应从时间线提取首末打卡时间', () => {
        const timeline = [
            { period: 'morning', items: [
                { time: '08:30', task: 'A' },
                { time: '09:00', task: 'B' }
            ]},
            { period: 'evening', items: [
                { time: '18:00', task: 'C' }
            ]}
        ];
        const result = TimelineService.calculateCheckInTimes(timeline);
        expect(result).toEqual({ firstCheckIn: '08:30', lastCheckIn: '18:00' });
    });

    test('空时间线应返回占位符', () => {
        expect(TimelineService.calculateCheckInTimes([])).toEqual({ firstCheckIn: '--:--', lastCheckIn: '--:--' });
        expect(TimelineService.calculateCheckInTimes(null)).toEqual({ firstCheckIn: '--:--', lastCheckIn: '--:--' });
        expect(TimelineService.calculateCheckInTimes(undefined)).toEqual({ firstCheckIn: '--:--', lastCheckIn: '--:--' });
    });

    test('区间写法取起点（与 editor 写入侧同一实现，不再是旧副本语义）', () => {
        const timeline = [{ items: [{ time: '09:00 - 12:00' }, { time: '13:00 - 18:00' }] }];
        const result = TimelineService.calculateCheckInTimes(timeline);
        expect(result.firstCheckIn).toBe('09:00');
        expect(result.lastCheckIn).toBe('13:00');
    });
});

describe('去重守卫：TimelineService 不得再内联副本', () => {
    test('parseTime / calculateCheckInTimes 必须调用 helpers 的实现', () => {
        const parseSpy = jest.fn(() => ({ hour: 1, minute: 2 }));
        const calcSpy = jest.fn(() => ({ firstCheckIn: '01:02', lastCheckIn: '01:02' }));
        const TL = loadTimelineService({ parseTimeUtil: parseSpy, calculateCheckInTimesUtil: calcSpy });

        expect(TL.parseTime('x')).toEqual({ hour: 1, minute: 2 });
        expect(parseSpy).toHaveBeenCalledWith('x');

        expect(TL.calculateCheckInTimes([])).toEqual({ firstCheckIn: '01:02', lastCheckIn: '01:02' });
        expect(calcSpy).toHaveBeenCalledWith([]);
    });
});
