/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

function setupGlobals() {
    global.formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    global.getChineseWeekday = (date) => {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()];
    };

    global.storageManager = {
        initPromise: Promise.resolve(),
        getSetting: jest.fn().mockResolvedValue(null),
        putSetting: jest.fn().mockResolvedValue(undefined),
        getAllDays: jest.fn().mockResolvedValue({}),
        putDay: jest.fn().mockResolvedValue(undefined),
        getGoals: jest.fn().mockResolvedValue([]),
        putGoals: jest.fn().mockResolvedValue(undefined),
        getPurchaseHistory: jest.fn().mockResolvedValue(null),
        putPurchaseHistory: jest.fn().mockResolvedValue(undefined),
        getIncomeHistory: jest.fn().mockResolvedValue(null),
        putIncomeHistory: jest.fn().mockResolvedValue(undefined),
        exportAllData: jest.fn().mockResolvedValue(null),
        importData: jest.fn().mockResolvedValue(undefined)
    };

    global.indexedDBStore = { initPromise: Promise.resolve() };

    global.CONSTANTS = {
        STORAGE: { UNDO_STACK_MAX: 50 },
    };

    global.EventBus = { on: jest.fn(), emit: jest.fn(), off: jest.fn() };

    global.HTMLUtils = { escapeHtml: jest.fn(s => s) };

    global.escapeHtml = jest.fn(s => s);

    global.generateWeeklyReport = jest.fn().mockReturnValue({});
    global.generateMonthlyReport = jest.fn().mockReturnValue({});

    // store.js 初始化时依赖以下服务 mock
    global.Toast = { showToast: jest.fn(), announce: jest.fn() };

    global.GoalService = {
        getAll: jest.fn().mockReturnValue([]),
        getArchived: jest.fn().mockReturnValue([]),
        load: jest.fn().mockResolvedValue(undefined),
        _save: jest.fn().mockResolvedValue(undefined),
        add: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
        reorder: jest.fn().mockResolvedValue(undefined),
        archive: jest.fn().mockResolvedValue(undefined),
        unarchive: jest.fn().mockResolvedValue(undefined)
    };

    global.WalletService = {
        updateBalance: jest.fn().mockResolvedValue(undefined),
        addIncomeHistory: jest.fn().mockResolvedValue(undefined),
        removeIncomeHistory: jest.fn().mockResolvedValue(undefined),
        addPurchaseHistory: jest.fn().mockResolvedValue(undefined),
        archiveOldRecords: jest.fn().mockResolvedValue(undefined),
        getPurchaseCounts: jest.fn().mockReturnValue({}),
        getAvailableBalance: jest.fn().mockReturnValue(0),
        recalibrateStats: jest.fn()
    };

    global.DataIO = {
        exportData: jest.fn().mockResolvedValue(undefined),
        importData: jest.fn().mockResolvedValue({ success: true })
    };

    global.ActionDispatcher = { register: jest.fn(), registerMany: jest.fn() };
    global.TimelineService = { addEvent: jest.fn(), removeEvent: jest.fn() };
}

function cleanupGlobals() {
    delete global.formatDate;
    delete global.getChineseWeekday;
    delete global.storageManager;
    delete global.indexedDBStore;
    delete global.CONSTANTS;
    delete global.EventBus;
    delete global.HTMLUtils;
    delete global.escapeHtml;
    delete global.generateWeeklyReport;
    delete global.generateMonthlyReport;
    delete global.Toast;
    delete global.GoalService;
    delete global.WalletService;
    delete global.DataIO;
    delete global.ActionDispatcher;
    delete global.TimelineService;
    delete window.DataValidator;
    delete window.store;
}

describe('DataValidator', () => {
    beforeEach(() => {
        jest.resetModules();
        cleanupGlobals();
        setupGlobals();
        loadModule('state/dataValidator.js', []);
    });

    afterEach(() => {
        cleanupGlobals();
    });

    test('validateDayData 有效日期应返回空错误数组', () => {
        const data = {
            date: '2026-05-18',
            metrics: { firstCheckIn: '08:30', completedTasks: '8/12' }
        };
        expect(window.DataValidator.validateDayData(data)).toEqual([]);
    });

    test('validateDayData 无效日期格式应报错', () => {
        const data = { date: '2026/05/18', metrics: {} };
        const errors = window.DataValidator.validateDayData(data);
        expect(errors).toContain('无效日期格式: 2026/05/18');
    });

    test('validateDayData 未知指标应报错', () => {
        const data = { date: '2026-05-18', metrics: { unknownMetric: 'value' } };
        const errors = window.DataValidator.validateDayData(data);
        expect(errors).toContain('未知指标: unknownMetric');
    });

    test('sanitizeDayData 应删除未知指标', () => {
        const data = {
            date: '2026-05-18',
            metrics: { firstCheckIn: '08:30', unknownMetric: 'value' }
        };
        window.DataValidator.sanitizeDayData(data);
        expect(data.metrics.unknownMetric).toBeUndefined();
        expect(data.metrics.firstCheckIn).toBe('08:30');
    });

    test('sanitizeDayData 应保留有效指标', () => {
        const data = {
            date: '2026-05-18',
            metrics: { firstCheckIn: '08:30', lastCheckIn: '18:00' }
        };
        window.DataValidator.sanitizeDayData(data);
        expect(data.metrics).toEqual({ firstCheckIn: '08:30', lastCheckIn: '18:00' });
    });

    test('migrateToV2 应将旧格式迁移到 metrics 对象', () => {
        const oldData = {
            date: '2026-05-18',
            firstCheckIn: '08:30',
            completedTasks: '8/12',
            inspirationCount: '3',
            lastCheckIn: '18:00',
            activeTime: '8h',
            emptySlots: '2'
        };
        const result = window.DataValidator.migrateToV2(oldData);
        expect(result.metrics).toBeDefined();
        expect(result.metrics.firstCheckIn).toBe('08:30');
        expect(result.metrics.completedTasks).toBe('8/12');
        expect(result.firstCheckIn).toBeUndefined();
        expect(result.completedTasks).toBeUndefined();
    });

    test('migrateToV2 已有 metrics 的数据应保持不变', () => {
        const data = {
            date: '2026-05-18',
            metrics: { firstCheckIn: '08:30', completedTasks: '8/12' }
        };
        const result = window.DataValidator.migrateToV2(data);
        expect(result).toBe(data);
    });
});
