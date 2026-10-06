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
        // 夹具的 month 也按本地日历造（与写入侧 localMonthKey 同口径）；
        // recalibrateStats 虽不读 month，但夹具不应复制已修掉的 UTC 切片口径
        const _n = new Date();
        const month = `${_n.getFullYear()}-${String(_n.getMonth() + 1).padStart(2, '0')}`;
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

describe('WalletService 记账月份锚定本地日历（月首凌晨不错归上月）', () => {
    // 期望值由本地分量推导，断言与运行时时区无关；在 Asia/Shanghai（本项目开发/CI 环境）下，
    // 旧实现 new Date(effDate).toISOString().slice(0, 7) 对「月首凌晨」会得到上一个月 → 用例变红。
    const localMonthOf = (s) => {
        const d = new Date(s);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    test.each([
        ['2026-11-01T00:30:00'], // 月首凌晨：UTC 仍是 10-31
        ['2026-11-01T07:59:00'], // 跨月边界前一刻
        ['2026-11-01T08:00:00'], // 边界之后（此时 UTC 才进入 11 月）
        ['2026-12-01T00:30:00'],
        ['2026-07-23T01:14:00'], // 既有用例的月中时刻，防回退
    ])('updateBalance 于 %s 完成时，month 应为该时刻的本地月', async (completionDate) => {
        const { store } = makeGlobals(baseState());
        store.state.incomeHistory.records = [];
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        await WalletService.updateBalance(1, 'task_complete', '完成 章节', completionDate);

        const rec = store.state.incomeHistory.records[0];
        expect(rec.date).toBe(completionDate);
        expect(rec.month).toBe(localMonthOf(completionDate));
    });
});

describe('WalletService 消费记账（与收入侧对称）', () => {
    test('addPurchaseHistory 尊重传入 date，且 month 按本地月归属', async () => {
        const { store } = makeGlobals(baseState());
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        const at = '2026-11-01T00:30:00'; // 月首凌晨
        await WalletService.addPurchaseHistory({ id: 'snack', name: '美味零食', price: 50, date: at });

        const rec = store.state.purchaseHistory.records[0];
        expect(rec.date).toBe(at);         // 旧实现会被 new Date().toISOString() 覆盖
        expect(rec.month).toBe('2026-11'); // 旧实现取 UTC 月 → '2026-10'
    });

    test('未传 date 时回退保存时刻，month 与该时刻的本地月一致', async () => {
        const { store } = makeGlobals(baseState());
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        await WalletService.addPurchaseHistory({ id: 'cola', name: '可乐', price: 20 });

        const rec = store.state.purchaseHistory.records[0];
        const d = new Date(rec.date);
        expect(rec.month).toBe(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
});

describe('WalletService.archiveOldRecords 归属月按 date 推导', () => {
    test('date 属近月但 month 被记成旧月时，应保留在 records 而不误归档', async () => {
        const now = new Date();
        const state = baseState();
        state.purchaseHistory = {
            records: [{ id: 'snack', name: '零食', price: 50, date: now.toISOString(), month: '2000-01' }],
            archive: {}
        };
        const { store } = makeGlobals(state);
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        await WalletService.archiveOldRecords();

        // 旧实现信任 record.month → 会把这条近月记录归进 2000-01
        expect(store.state.purchaseHistory.records.length).toBe(1);
        expect(store.state.purchaseHistory.archive['2000-01']).toBeUndefined();
    });

    test('既无 date 也无 month 的记录保留在 records，不落进空键归档桶', async () => {
        const state = baseState();
        state.incomeHistory = { records: [{ amount: 5, desc: '完成 任务X' }], archive: {} };
        const { store } = makeGlobals(state);
        const { WalletService } = loadModule('services/WalletService.js', ['WalletService']);

        await WalletService.archiveOldRecords();

        // 旧实现 record.date.slice(...) 会直接抛 TypeError；即便不抛也不该落进 ''
        expect(store.state.incomeHistory.records.length).toBe(1);
        expect(store.state.incomeHistory.archive['']).toBeUndefined();
    });
});
