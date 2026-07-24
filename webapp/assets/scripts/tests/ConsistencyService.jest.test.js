/**
 * @jest-environment jsdom
 *
 * ConsistencyService 回归测试：覆盖「待办/时间线/进度/竹币 四方一致性」的
 * 启动自检与自动修复 —— 双向对齐、已一致零副作用、目标重算、钱包补齐。
 * 源码为 ESM，经 testUtils.loadModule 剥离 export 前缀后加载。
 */
const { loadModule } = require('./__helpers__/testUtils');

const { ConsistencyService } = loadModule('services/ConsistencyService.js', ['ConsistencyService']);

function makeStore(opts = {}) {
    return {
        state: {
            data: opts.data || {},
            globalGoals: opts.globalGoals || [],
            incomeHistory: opts.incomeHistory || { records: [] },
            balance: opts.balance ?? 0,
            purchaseHistory: opts.purchaseHistory || []
        },
        getGlobalGoals() { return this.state.globalGoals; },
        getDateKey() { return opts.todayKey || '2026-07-24'; },
        markDayDirty() {},
        scheduleAutoSave() {}
    };
}

describe('ConsistencyService 数据自洽校验/修复', () => {
    let capturedStore;

    beforeEach(() => {
        capturedStore = makeStore();
        globalThis.TimelineService = {
            addEvent(dayData, text, evalLabel) {
                if (!dayData.timeline) dayData.timeline = [];
                let period = dayData.timeline.find(p => p.period === 'evening');
                if (!period) {
                    period = { period: 'evening', name: '晚上', time: '18:30 - 22:00', icon: 'coffee', eval: 'good', items: [] };
                    dayData.timeline.push(period);
                }
                if (!period.items) period.items = [];
                period.items.push({ time: '20:00', task: text, eval: evalLabel });
            }
        };
        globalThis.WalletService = {
            addIncomeHistory(rec) { capturedStore.state.incomeHistory.records.unshift(rec); },
            recalibrateStats() { /* 各用例按需覆盖 */ }
        };
    });

    afterEach(() => {
        delete globalThis.TimelineService;
        delete globalThis.WalletService;
    });

    test('goalTaskCompletions 完成但时间线缺 -> 补齐时间线活动（正向对齐）', async () => {
        const goals = [{ id: 'g1', title: '阅读计划', items: [{ name: '阅读书籍' }] }];
        const data = { '2026-07-24': { goalTaskCompletions: { g1: { '0': true } }, timeline: [] } };
        const store = makeStore({ data, globalGoals: goals });

        const report = await ConsistencyService.repair(store);

        expect(report.days).toContain('2026-07-24');
        const items = store.state.data['2026-07-24'].timeline.flatMap(p => p.items);
        expect(items).toContainEqual(expect.objectContaining({ task: '阅读计划 - 阅读书籍', eval: '完成' }));
        expect(store.state.data['2026-07-24'].goalTaskCompletions.g1['0']).toBe(true);
    });

    test('时间线已完成但 goalTaskCompletions 缺 -> 补齐完成态（反向对齐）', async () => {
        const goals = [{ id: 'g1', title: '阅读计划', items: [{ name: '阅读书籍' }] }];
        const data = {
            '2026-07-24': {
                goalTaskCompletions: {},
                timeline: [{ period: 'evening', items: [{ time: '20:00', task: '阅读计划 - 阅读书籍', eval: '完成' }] }]
            }
        };
        const store = makeStore({ data, globalGoals: goals });

        const report = await ConsistencyService.repair(store);

        expect(report.days).toContain('2026-07-24');
        expect(store.state.data['2026-07-24'].goalTaskCompletions.g1['0']).toBe(true);
    });

    test('已一致数据零副作用', async () => {
        const goals = [{
            id: 'g1', title: '阅读计划', progress: 10,
            items: [{ name: '阅读书籍', startValue: '0', targetValue: '100', currentValue: '10', percent: 10 }]
        }];
        const data = {
            '2026-07-24': {
                goalTaskCompletions: { g1: { '0': true } },
                timeline: [{ period: 'evening', items: [{ task: '阅读计划 - 阅读书籍', eval: '完成' }] }]
            }
        };
        const incomeHistory = {
            records: [{ amount: 1, type: 'task_complete', desc: '完成：阅读计划 - 阅读书籍', date: new Date().toISOString() }]
        };
        const store = makeStore({ data, globalGoals: goals, incomeHistory });

        const report = await ConsistencyService.repair(store);

        expect(report).toEqual({ days: [], goals: false, wallet: false, errors: [] });
    });

    test('目标进度内部自洽重算（percent/progress 派生修正）', async () => {
        const goals = [{
            id: 'g1', title: '阅读计划', progress: 5,
            items: [{ name: 'A', startValue: '0', targetValue: '100', currentValue: '9.9', percent: 5 }]
        }];
        const store = makeStore({ data: {}, globalGoals: goals });

        const report = await ConsistencyService.repair(store);

        expect(report.goals).toBe(true);
        // percent = round(|9.9-0|/(100-0)*100) = 10
        expect(goals[0].items[0].percent).toBe(10);
        expect(goals[0].progress).toBe(10);
    });

    test('今日完成任务缺失竹币收入 -> 补齐收入记录并校准余额', async () => {
        const goals = [{ id: 'g1', title: '阅读计划', items: [{ name: '阅读书籍' }] }];
        const data = { '2026-07-24': { goalTaskCompletions: { g1: { '0': true } }, timeline: [] } };
        const incomeHistory = { records: [] };
        let recalCalled = false;
        capturedStore = makeStore({ data, globalGoals: goals, incomeHistory, balance: 100 });
        globalThis.WalletService = {
            addIncomeHistory(rec) { capturedStore.state.incomeHistory.records.unshift(rec); },
            recalibrateStats() { recalCalled = true; capturedStore.state.balance = 101; }
        };

        const report = await ConsistencyService.repair(capturedStore);

        expect(report.wallet).toBe(true);
        expect(capturedStore.state.incomeHistory.records[0]).toMatchObject({
            type: 'task_complete', desc: '完成：阅读计划 - 阅读书籍', amount: 1
        });
        expect(recalCalled).toBe(true);
        expect(capturedStore.state.balance).toBe(101);
    });

    test('异常不抛出，错误记入 report.errors', async () => {
        // 用抛错的 state.data getter 强制触发内部异常，验证 repair 捕获而非崩溃
        const store = {
            state: {
                globalGoals: [{ id: 'g1', title: 'T', items: [{ name: 'X' }] }],
                get data() { throw new Error('boom: data access failed'); }
            },
            getGlobalGoals() { return this.state.globalGoals; },
            getDateKey() { return '2026-07-24'; },
            markDayDirty() {}, scheduleAutoSave() {}
        };
        let report;
        await expect((async () => { report = await ConsistencyService.repair(store); })()).resolves.toBeUndefined();
        expect(report.days).toEqual([]);
        expect(report.errors.length).toBeGreaterThan(0);
        expect(report.errors[0]).toContain('boom');
    });
});
