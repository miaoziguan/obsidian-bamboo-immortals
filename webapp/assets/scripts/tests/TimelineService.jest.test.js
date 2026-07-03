/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

function loadTimelineService() {
    return loadModule('services/TimelineService.js', ['TimelineService']).TimelineService;
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
});
