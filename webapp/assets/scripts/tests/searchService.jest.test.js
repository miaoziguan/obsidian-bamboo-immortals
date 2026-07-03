/**
 * @jest-environment jsdom
 *
 * 搜索服务纯函数测试 — SearchService.search(data, globalGoals, query)
 */
const { loadModule } = require('./__helpers__/testUtils');
const SearchService = loadModule('services/searchService.js', ['SearchService']).SearchService;

// 构建测试数据
function makeDay(overrides = {}) {
    return {
        date: '2026-06-17',
        weekday: '周三',
        metrics: {
            firstCheckIn: '08:30',
            completedTasks: '5/10',
            inspirationCount: '2',
            lastCheckIn: '18:00',
        },
        timeline: [],
        goals: [],
        ...overrides,
    };
}

describe('SearchService 搜索服务', () => {
    test('空 data 返回空数组', () => {
        expect(SearchService.search(null, [], '测试')).toEqual([]);
        expect(SearchService.search({}, [], '测试')).toEqual([]);
    });

    test('空 query 返回空数组', () => {
        const data = { '2026-06-17': makeDay() };
        expect(SearchService.search(data, [], '')).toEqual([]);
    });

    test('按指标 firstCheckIn 匹配', () => {
        const data = { '2026-06-17': makeDay({ metrics: { firstCheckIn: '08:30', completedTasks: '3/5' } }) };
        const results = SearchService.search(data, [], '08:30');
        expect(results).toHaveLength(1);
        expect(results[0].date).toBe('2026-06-17');
        expect(results[0].matches).toContainEqual({ field: '首次打卡', value: '08:30' });
    });

    test('按时间线 task 匹配', () => {
        const data = {
            '2026-06-17': makeDay({
                timeline: [
                    { period: 'morning', name: '上午', items: [{ time: '09:00', task: '完成项目方案', eval: '效率很高' }] },
                ],
            }),
        };
        const results = SearchService.search(data, [], '项目方案');
        expect(results).toHaveLength(1);
        expect(results[0].matches).toContainEqual({ field: '活动', value: '完成项目方案' });
    });

    test('按时间线 period name 匹配', () => {
        const data = {
            '2026-06-17': makeDay({
                timeline: [
                    { period: 'morning', name: '上午', items: [{ time: '09:00', task: '开会', eval: '好' }] },
                ],
            }),
        };
        const results = SearchService.search(data, [], '上午');
        expect(results).toHaveLength(1);
        expect(results[0].matches).toContainEqual({ field: '活动', value: '上午' });
    });

    test('按当天 goals 匹配', () => {
        const data = {
            '2026-06-17': makeDay({
                goals: [{ id: 'g1', title: '项目推进' }, { id: 'g2', title: '技能提升' }],
            }),
        };
        const results = SearchService.search(data, [], '技能');
        expect(results).toHaveLength(1);
        expect(results[0].matches).toContainEqual({ field: '目标', value: '技能提升' });
    });

    test('当天无目标时从 globalGoals 兜底匹配', () => {
        const data = { '2026-06-17': makeDay() };
        const globalGoals = [{ title: '健身计划' }, { title: '读书计划' }];
        const results = SearchService.search(data, globalGoals, '健身');
        expect(results).toHaveLength(1);
        // 当天数据没有任何匹配，但 JSON.stringify 中也会无命中 → 结果落在全局目标匹配
        // 注意：matches 为空时才会查 globalGoals，所以 JSON 不影响的 case 会走到这里
        expect(results[0].matches).toContainEqual({ field: '目标', value: '健身计划' });
    });

    test('不计较大小写', () => {
        const data = { '2026-06-17': makeDay({ goals: [{ title: '项目推进' }] }) };
        expect(SearchService.search(data, [], '项')).toHaveLength(1);
        expect(SearchService.search(data, [], '推')).toHaveLength(1);
        expect(SearchService.search(data, [], '不存在的')).toHaveLength(0);
    });

    test('JSON 整体匹配兜底', () => {
        // 构造一个特殊字段（不在指标/目标/时间线覆盖范围内），通过 JSON 整体匹配
        const data = {
            '2026-06-17': {
                ...makeDay(),
                notes: '今天学习了很多新知识',
            },
        };
        const results = SearchService.search(data, [], '新知识');
        // JSON.stringify(day) 会包含 notes 字段
        expect(results).toHaveLength(1);
    });

    test('多天结果按日期降序排列', () => {
        const data = {
            '2026-06-10': makeDay({ date: '2026-06-10', weekday: '周三', goals: [{ title: '项目推进' }] }),
            '2026-06-17': makeDay({ date: '2026-06-17', weekday: '周三', goals: [{ title: '项目推进' }] }),
            '2026-06-05': makeDay({ date: '2026-06-05', weekday: '周四', goals: [{ title: '项目推进' }] }),
        };
        const results = SearchService.search(data, [], '项目推进');
        expect(results).toHaveLength(3);
        expect(results[0].date).toBe('2026-06-17');
        expect(results[1].date).toBe('2026-06-10');
        expect(results[2].date).toBe('2026-06-05');
    });

    test('matches 上限为 3 条', () => {
        // 构造多个匹配字段的超载场景
        const data = {
            '2026-06-17': {
                ...makeDay({
                    metrics: {
                        firstCheckIn: '匹配',
                        completedTasks: '匹配',
                        inspirationCount: '匹配',
                        lastCheckIn: '匹配',
                    },
                    timeline: [
                        { period: 'morning', name: '匹配', items: [{ time: '09:00', task: '匹配', eval: '好' }] },
                    ],
                    goals: [{ title: '匹配' }],
                }),
            },
        };
        const results = SearchService.search(data, [], '匹配');
        expect(results).toHaveLength(1);
        expect(results[0].matches.length).toBeLessThanOrEqual(3);
    });
});
