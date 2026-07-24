/**
 * @jest-environment jsdom
 *
 * WalletService 回归测试
 * 重点覆盖 recalibrateStats 与 reload 后首次 updateBalance 的「今日收入冻结」一致性。
 *
 * 背景 bug：_statsDate 是纯内存字段、不持久化。recalibrateStats 在加载时重算出正确的
 * 今日收入，但旧代码没同步 _statsDate，导致 reload 后首次 updateBalance 误判「跨天」
 * 把刚算好的今日收入清零，可用竹币虚高。
 */

const { loadModule } = require('./__helpers__/testUtils');

function makeGlobals(state) {
    const storageManager = {
        getSetting: jest.fn().mockResolvedValue(null),
        putSetting: jest.fn().mockResolvedValue(undefined),
        putIncomeHistory: jest.fn().mockResolvedValue(undefined),
        putPurchaseHistory: jest.fn().mockResolvedValue(undefined),
    };
    const store = { state, notify: jest.fn() };
    global.store = store;
    global.storageManager = storageManager;
    return { storageManager, store };
}

// 模拟 reload 后的内存态：_statsDate 为空（未持久化），但有今日收入记录
function baseState() {
    return {
        balance: 100,
        incomeHistory: {
            records: [{ amount: 5, desc: '完成 任务A', date: new Date().toISOString() }],
            archive: {}
        },
        purchaseHistory: { records: [], archive: {} },
        stats: { todayEarnings: 0, totalSpent: 0, totalEarnings: 0 },
        _statsDate: ''
    };
}

describe('WalletService.recalibrateStats 冻结一致性', () => {
    test('recalibrate 后 _statsDate 应同步为今天，且首次 updateBalance 不清零今日收入', async () => {
        const { store } = makeGlobals(baseState());
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        WalletService.recalibrateStats();

        const today = new Date().toDateString();
        expect(store.state._statsDate).toBe(today); // 关键：必须同步
        expect(store.state.stats.todayEarnings).toBe(5);

        // 模拟 reload 后用户首次完成任务
        await WalletService.updateBalance(1, 'task_complete', '完成 任务B');

        // 不应被清零成 1，而应累加到 6
        expect(store.state.stats.todayEarnings).toBe(6);
        expect(store.state.balance).toBe(101);
    });

    test('recalibrate 后今日无收入时 _statsDate 仍应为今天（避免首次任务触发清零下溢）', async () => {
        const state = baseState();
        state.incomeHistory.records = []; // 今日无收入
        const { store } = makeGlobals(state);
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        WalletService.recalibrateStats();
        expect(store.state._statsDate).toBe(new Date().toDateString());
        expect(store.state.stats.todayEarnings).toBe(0);

        await WalletService.updateBalance(1, 'task_complete', '完成 任务C');
        expect(store.state.stats.todayEarnings).toBe(1); // 从 0 累加，而非从残留值
    });

    test('getAvailableBalance 应正确扣除冻结的今日收入', () => {
        const { store } = makeGlobals(baseState());
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        WalletService.recalibrateStats();
        // balance(100) - frozen todayEarnings(5) = 95
        expect(WalletService.getAvailableBalance()).toBe(95);
    });
});
