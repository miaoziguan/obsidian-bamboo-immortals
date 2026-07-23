/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

function loadStore(globals) {
    return loadModule('state/store.js', ['Store'], globals);
}

// 从源码中提取 DATA_VERSION 供测试断言使用
const DATA_VERSION = '3.0';

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

    global.CONSTANTS = {
        STORAGE: { UNDO_STACK_MAX: 50 },
    };

    global.escapeHtml = jest.fn(s => s);
    global.generateWeeklyReport = jest.fn().mockReturnValue({});
    global.generateMonthlyReport = jest.fn().mockReturnValue({});
    global.ActionDispatcher = { register: jest.fn(), registerMany: jest.fn() };
    global.EventBus = { emit: jest.fn(), on: jest.fn() };
    global.TimelineService = { addEvent: jest.fn(), removeEvent: jest.fn() };

    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = jest.fn();

    global.Toast = {
        showToast: jest.fn(),
        announce: jest.fn()
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

    global.DataIO = {
        exportData: jest.fn(async () => {
            let data = null;
            try { data = await storageManager.exportAllData(); } catch(e) {}
            if (!data || Object.keys(data).length === 0 || !data.days) {
                const s = store.getState();
                data = {
                    version: window.DATA_VERSION || '3.0',
                    exportedAt: new Date().toISOString(),
                    storageType: 'state-fallback',
                    days: s.data,
                    goals: s.globalGoals || [],
                    purchaseHistory: s.purchaseHistory,
                    incomeHistory: s.incomeHistory,
                    settings: {
                        theme: s.ui.isDarkMode ? 'dark' : 'light',
                        colorTheme: s.ui.currentTheme || 'bamboo',
                        balance: s.balance,
                        shopStats: s.stats
                    }
                };
            }
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `daily-review-data-${store.getDateKey()}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
        }),
        importData: jest.fn(async (backupData, options = {}) => {
            try {
                const data = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
                if (!data || (typeof data !== 'object')) throw new Error('无效的备份文件');
                const hasAnyData = data.days || data.data || data.goals || data.globalGoals || data.settings || data.purchaseHistory || data.incomeHistory;
                if (!hasAnyData) throw new Error('备份文件为空');
                await storageManager.importData(data, options);
                await store.loadFromStorage();
                store._recalibrateStats();
                await storageManager.putSetting('shopStats', store.getState().stats);
                return { success: true };
            } catch (e) {
                return { success: false, error: e.message };
            }
        })
    };

    // 加载从 store.js 抽出的独立模块（依赖 formatDate/getChineseWeekday，已在上面 mock）
    loadModule('state/dataValidator.js', []);
    loadModule('state/defaultData.js', []);
    loadModule('services/searchService.js', []);

    global.DEFAULT_DATA = {};
    global.createEmptyDayData = (date) => ({ date, weekday: '周一', metrics: {}, timeline: [] });

    global.MigrationService = class {
        constructor() {}
        async handleDataMigration() {}
        async migrateFromV1() {}
        async migrateFromV1ToV2() {}
        async migrateDayDataToV2() {}
        async migrateFromLocalStorage() {}
        async _migrateHistoryToFiles() {}
    };
}

function cleanupGlobals() {
    delete global.formatDate;
    delete global.getChineseWeekday;
    delete global.storageManager;
    delete global.CONSTANTS;
    delete global.escapeHtml;
    delete global.generateWeeklyReport;
    delete global.generateMonthlyReport;
    delete global.ActionDispatcher;
    delete global.EventBus;
    delete global.TimelineService;
    delete global.Toast;
    delete global.WalletService;
    delete global.GoalService;
    delete global.DataIO;
    delete window.DataValidator;
    delete window.SearchService;
    delete window.DEFAULT_DATA;
    delete window.createEmptyDayData;
    delete window.store;
    delete window.DATA_VERSION;
}


function loadStoreModule() {
    return loadModule('state/store.js', ['Store']);
}

describe.skip('Store 核心功能', () => {
    let Store, store;

    beforeEach(async () => {
        jest.resetModules();
        cleanupGlobals();
        setupGlobals();
        document.documentElement.className = '';

        const module = loadStoreModule();
        Store = module.Store;
        store = module.store;
        // DataValidator 已由 setupGlobals 中的 require 挂到 window
        const DataValidator = window.DataValidator;

        await store.ready();
    });

    afterEach(() => {
        if (store && store.state.autoSaveTimer) {
            clearTimeout(store.state.autoSaveTimer);
        }
        cleanupGlobals();
        document.documentElement.className = '';
    });

    describe('数据验证', () => {
        test('validateDayData 有效数据应返回空错误数组', () => {
            const data = {
                date: '2026-05-18',
                metrics: { firstCheckIn: '08:30', completedTasks: '8/12' }
            };
            expect(DataValidator.validateDayData(data)).toEqual([]);
        });

        test('validateDayData 无效日期格式应报错', () => {
            const data = { date: '2026/05/18', metrics: {} };
            const errors = DataValidator.validateDayData(data);
            expect(errors).toContain('无效日期格式: 2026/05/18');
        });

        test('validateDayData goals 缺少 title 应报错', () => {
            const data = {
                date: '2026-05-18',
                goals: [{ items: [] }]
            };
            const errors = DataValidator.validateDayData(data);
            expect(errors.some(e => e.includes('缺少有效 title'))).toBe(true);
        });

        test('validateDayData goals percent 超范围应报错', () => {
            const data = {
                date: '2026-05-18',
                goals: [{
                    title: '测试目标',
                    items: [{ name: '任务', percent: 150 }]
                }]
            };
            const errors = DataValidator.validateDayData(data);
            expect(errors.some(e => e.includes('percent 应为 0-100 的数字'))).toBe(true);
        });

        test('validateDayData goals items 缺少 name 应报错', () => {
            const data = {
                date: '2026-05-18',
                goals: [{
                    title: '测试目标',
                    items: [{ percent: 50 }]
                }]
            };
            const errors = DataValidator.validateDayData(data);
            expect(errors.some(e => e.includes('缺少有效 name'))).toBe(true);
        });

        test('sanitizeDayData 应删除未知指标保留有效指标', () => {
            const data = {
                date: '2026-05-18',
                metrics: { firstCheckIn: '08:30', unknownMetric: 'value', lastCheckIn: '18:00' }
            };
            DataValidator.sanitizeDayData(data);
            expect(data.metrics.unknownMetric).toBeUndefined();
            expect(data.metrics.firstCheckIn).toBe('08:30');
            expect(data.metrics.lastCheckIn).toBe('18:00');
        });
    });

    describe('日期导航', () => {
        test('navigateDate 应按偏移量前进切换日期', () => {
            const before = new Date(store.state.currentDate);
            store.navigateDate(1);
            const after = store.state.currentDate;
            const expected = new Date(before);
            expected.setDate(expected.getDate() + 1);
            expect(after.getFullYear()).toBe(expected.getFullYear());
            expect(after.getMonth()).toBe(expected.getMonth());
            expect(after.getDate()).toBe(expected.getDate());
        });

        test('navigateDate 应按偏移量后退切换日期', () => {
            const before = new Date(store.state.currentDate);
            store.navigateDate(-1);
            const after = store.state.currentDate;
            const expected = new Date(before);
            expected.setDate(expected.getDate() - 1);
            expect(after.getFullYear()).toBe(expected.getFullYear());
            expect(after.getMonth()).toBe(expected.getMonth());
            expect(after.getDate()).toBe(expected.getDate());
        });

        test('goToDate 应跳转到指定日期', () => {
            store.goToDate('2026-01-15');
            expect(store.state.currentDate.getFullYear()).toBe(2026);
            expect(store.state.currentDate.getMonth()).toBe(0);
            expect(store.state.currentDate.getDate()).toBe(15);
        });

        test('getDateKey 应返回 YYYY-MM-DD 格式字符串', () => {
            store.goToDate('2026-03-05');
            expect(store.getDateKey()).toBe('2026-03-05');
        });
    });

    describe('数据更新', () => {
        test('updateDayData 应更新当前日期数据并保存', async () => {
            jest.useFakeTimers();
            storageManager.putDay.mockClear();
            await store.updateDayData({ metrics: { firstCheckIn: '09:00' } });
            const key = store.getDateKey();
            expect(store.state.data[key].metrics.firstCheckIn).toBe('09:00');
            // scheduleAutoSave 使用 2000ms 延迟，推进定时器触发保存
            await jest.advanceTimersByTimeAsync(2100);
            expect(storageManager.putDay).toHaveBeenCalled();
            jest.useRealTimers();
        });

        test('updateDayData 不存在的日期应创建空数据后更新', async () => {
            store.goToDate('2026-06-01');
            const key = store.getDateKey();
            expect(store.state.data[key]).toBeUndefined();

            await store.updateDayData({ metrics: { firstCheckIn: '07:00' } });
            expect(store.state.data[key]).toBeDefined();
            expect(store.state.data[key].metrics.firstCheckIn).toBe('07:00');
        });

        test('updateDayData 应验证和清理无效数据', async () => {
            await store.updateDayData({
                metrics: { firstCheckIn: '08:30', invalidField: 'test' }
            });
            const key = store.getDateKey();
            expect(store.state.data[key].metrics.invalidField).toBeUndefined();
            expect(store.state.data[key].metrics.firstCheckIn).toBe('08:30');
        });
    });

    describe('数据迁移', () => {
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
            const result = DataValidator.migrateToV2(oldData);
            expect(result.metrics).toBeDefined();
            expect(result.metrics.firstCheckIn).toBe('08:30');
            expect(result.metrics.completedTasks).toBe('8/12');
            expect(result.metrics.inspirationCount).toBe('3');
            expect(result.metrics.lastCheckIn).toBe('18:00');
            expect(result.metrics.activeTime).toBe('8h');
            expect(result.metrics.emptySlots).toBe('2');
            expect(result.firstCheckIn).toBeUndefined();
            expect(result.completedTasks).toBeUndefined();
            expect(result.inspirationCount).toBeUndefined();
        });

        test('migrateToV2 已有 metrics 应保持不变', () => {
            const data = {
                date: '2026-05-18',
                metrics: { firstCheckIn: '08:30', completedTasks: '8/12' }
            };
            const result = DataValidator.migrateToV2(data);
            expect(result).toBe(data);
        });

        test('migrateToV2 缺失字段应使用默认值', () => {
            const oldData = { date: '2026-05-18' };
            const result = DataValidator.migrateToV2(oldData);
            expect(result.metrics.firstCheckIn).toBe('--:--');
            expect(result.metrics.completedTasks).toBe('0/0');
            expect(result.metrics.inspirationCount).toBe('0');
            expect(result.metrics.lastCheckIn).toBe('--:--');
            expect(result.metrics.activeTime).toBe('0h');
            expect(result.metrics.emptySlots).toBe('0');
        });

        test('migrateToV2 应清除旧 kpi 字段', () => {
            const oldData = {
                date: '2026-05-18',
                firstCheckIn: '08:30',
                kpi: [{ name: '旧指标' }]
            };
            const result = DataValidator.migrateToV2(oldData);
            expect(result.kpi).toBeUndefined();
            expect(result.metrics).toBeDefined();
        });
    });

    describe('导出/导入', () => {
        test('exportData 应生成可序列化的 JSON 数据', async () => {
            storageManager.exportAllData.mockResolvedValueOnce(null);
            let exportedStr = null;
            const OrigBlob = global.Blob;
            global.Blob = jest.fn((parts) => {
                exportedStr = parts[0];
                return new OrigBlob(parts);
            });

            await store.exportData();

            expect(storageManager.exportAllData).toHaveBeenCalled();
            expect(exportedStr).toBeDefined();
            const parsed = JSON.parse(exportedStr);
            expect(parsed.version).toBe('3.0');
            expect(parsed.exportedAt).toBeDefined();
            expect(parsed.days).toBeDefined();
            expect(parsed.settings).toBeDefined();

            global.Blob = OrigBlob;
        });

        test('importData 成功导入应返回 success: true', async () => {
            const jsonData = JSON.stringify({ version: '2.0', days: {} });
            const result = await store.importData(jsonData);
            expect(result.success).toBe(true);
        });

        test('importData 无效 JSON 应返回 success: false', async () => {
            const result = await store.importData('not-valid-json{{{');
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('订阅与状态', () => {
        test('subscribe 应在状态变更时通知监听器', () => {
            const listener = jest.fn();
            store.subscribe(listener);
            store.navigateDate(1);
            expect(listener).toHaveBeenCalled();
        });

        test('subscribe 返回的取消函数应移除监听器', () => {
            const listener = jest.fn();
            const unsubscribe = store.subscribe(listener);
            unsubscribe();
            store.navigateDate(1);
            expect(listener).not.toHaveBeenCalled();
        });

        test('getState 应返回当前状态', () => {
            const state = store.getState();
            expect(state).toBeDefined();
            expect(state.ui).toBeDefined();
            expect(state.data).toBeDefined();
            expect(state.currentDate).toBeDefined();
        });
    });

    describe('搜索功能边界条件', () => {
        test('searchData 搜索目标时无匹配不应崩溃', () => {
            const key = store.getDateKey();
            store.state.data[key] = {
                date: key,
                goals: [{ title: '学习计划', items: [] }, { items: [] }],
                timeline: []
            };

            expect(() => store.searchData('不存在的关键词')).not.toThrow();
            const results = store.searchData('不存在的关键词');
            expect(results).toEqual([]);
        });

        test('searchData 搜索目标时应返回匹配的目标', () => {
            const key = store.getDateKey();
            store.state.data[key] = {
                date: key,
                goals: [{ title: '项目推进', items: [] }],
                timeline: []
            };

            const results = store.searchData('项目');
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].matches.some(m => m.field === '目标' && m.value === '项目推进')).toBe(true);
        });

        test('searchData 搜索时间线时应返回匹配的活动', () => {
            const key = store.getDateKey();
            store.state.data[key] = {
                date: key,
                timeline: [{
                    period: 'morning',
                    name: '早晨',
                    items: [{ task: '代码review', time: '09:00', eval: 'good' }]
                }]
            };

            const results = store.searchData('代码');
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].matches.some(m => m.field === '活动')).toBe(true);
        });

        test('searchData 空数据不应崩溃', () => {
            store.state.data = {};
            expect(() => store.searchData('任何关键词')).not.toThrow();
        });

        test('searchData goals 为 undefined 时不应崩溃', () => {
            const key = store.getDateKey();
            store.state.data[key] = { date: key };
            expect(() => store.searchData('测试')).not.toThrow();
        });
    });

    describe('scheduleAutoSave 间隔设置', () => {
        test('scheduleAutoSave 无 SettingsModal 时应使用默认 2000ms', () => {
            jest.useFakeTimers();
            store.scheduleAutoSave();
            expect(store.state.isDirty).toBe(true);
            expect(store.state.autoSaveTimer).toBeDefined();
            jest.useRealTimers();
        });

        test('scheduleAutoSave 有 SettingsModal.autoSaveInterval 时应使用自定义间隔', () => {
            jest.useFakeTimers();
            global.SettingsModal = { autoSaveInterval: 5000 };
            store.scheduleAutoSave();
            expect(store.state.isDirty).toBe(true);
            delete global.SettingsModal;
            jest.useRealTimers();
        });
    });

    describe('导出版本号一致性', () => {
        test('exportData fallback 数据应使用 DATA_VERSION', async () => {
            storageManager.exportAllData.mockResolvedValueOnce(null);
            let exportedStr = null;
            const OrigBlob = global.Blob;
            global.Blob = jest.fn((parts) => {
                exportedStr = parts[0];
                return new OrigBlob(parts);
            });

            await store.exportData();

            const parsed = JSON.parse(exportedStr);
            expect(parsed.version).toBe('3.0');

            global.Blob = OrigBlob;
        });

        test('importData 导入 V1 数据后应能正常处理', async () => {
            const v1Data = JSON.stringify({
                version: '1.0',
                days: { '2026-05-18': { date: '2026-05-18', metrics: {} } }
            });
            const result = await store.importData(v1Data);
            expect(result.success).toBe(true);
        });
    });
});
