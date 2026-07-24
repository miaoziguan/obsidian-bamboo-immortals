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

        await WalletService.recalibrateStats();

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

        await WalletService.recalibrateStats();
        expect(store.state._statsDate).toBe(new Date().toDateString());
        expect(store.state.stats.todayEarnings).toBe(0);

        await WalletService.updateBalance(1, 'task_complete', '完成 任务C');
        expect(store.state.stats.todayEarnings).toBe(1); // 从 0 累加，而非从残留值
    });

    test('getAvailableBalance 应正确扣除冻结的今日收入', async () => {
        const { store } = makeGlobals(baseState());
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        await WalletService.recalibrateStats();
        // balance(100) - frozen todayEarnings(5) = 95
        expect(WalletService.getAvailableBalance()).toBe(95);
    });

    test('recalibrateStats 应校准损坏的余额（派生 = 收入 − 消费）', async () => {
        const state = baseState();
        state.balance = 0; // 损坏：余额被持久化为 0
        const month = new Date().toISOString().slice(0, 7);
        const nowIso = new Date().toISOString();
        state.incomeHistory.records = Array.from({ length: 280 }, (_, i) => ({
            amount: 1, desc: `完成 任务${i}`, date: nowIso, month
        }));
        state.purchaseHistory.records = Array.from({ length: 7 }, (_, i) => ({
            price: 1, name: `商品${i}`, date: nowIso, month
        }));
        const { store } = makeGlobals(state);
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        await WalletService.recalibrateStats();

        // 280 − 7 = 273，余额应从损坏的 0 校准回 273
        expect(store.state.balance).toBe(273);
        expect(store.state.stats.totalSpent).toBe(7);
        expect(store.state.stats.totalEarnings).toBe(280); // 273 + 7
        expect(store.state._statsDate).toBe(new Date().toDateString());
    });
});

describe('WalletService 收入记账日期一致性（跨天不误记）', () => {
    test('updateBalance 传入 date 时，收入记录应使用该 date 而非保存时刻', async () => {
        const { store } = makeGlobals(baseState());
        store.state.incomeHistory.records = [];
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        const completionDate = '2026-07-23T01:14:00';
        await WalletService.updateBalance(1, 'task_complete', '完成 章节', completionDate);

        const rec = store.state.incomeHistory.records[0];
        expect(rec.date).toBe(completionDate); // 关键：尊重传入日期，不被 toISOString 覆盖
        expect(rec.month).toBe('2026-07'); // month 也由 effDate 推导
    });

    test('未传 date 时应回退到当前时刻（不破坏原有行为）', async () => {
        const { store } = makeGlobals(baseState());
        store.state.incomeHistory.records = [];
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        const before = Date.now();
        await WalletService.updateBalance(1, 'task_complete', '完成 任务D');
        const after = Date.now();

        const rec = store.state.incomeHistory.records[0];
        const t = new Date(rec.date).getTime();
        expect(t).toBeGreaterThanOrEqual(before - 1000);
        expect(t).toBeLessThanOrEqual(after + 1000);
    });

    test('去重按传入 date 的当日判断，昨日同 desc 记录不应被误删', async () => {
        const state = baseState();
        state.incomeHistory.records = [
            { amount: 1, desc: '完成 章节', date: '2026-07-23T01:14:00', month: '2026-07' }
        ];
        const { store } = makeGlobals(state);
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        // 今日再次完成同名任务，date 为今日
        const todayIso = new Date().toISOString();
        await WalletService.updateBalance(1, 'task_complete', '完成 章节', todayIso);

        // 昨日那条不同日，不应被去重删除；今日新增一条 => 共 2 条
        const chapterRecs = store.state.incomeHistory.records.filter(r => r.desc === '完成 章节');
        expect(chapterRecs.length).toBe(2);
    });
});
