/**
 * @jest-environment jsdom
 *
 * 核心业务流测试
 *
 * 这些测试直接加载生产脚本，覆盖目标任务、待办任务和存储适配器的真实行为。
 */

const { loadModule } = require('./__helpers__/testUtils');

const makeCheckInTimes = (timeline) => {
    const times = [];
    (timeline || []).forEach(period => {
        (period.items || []).forEach(item => {
            const match = String(item.time || '').match(/(\d{1,2}):(\d{2})/);
            if (match) {
                times.push({
                    hour: Number(match[1]),
                    minute: Number(match[2])
                });
            }
        });
    });

    if (times.length === 0) {
        return { firstCheckIn: '--:--', lastCheckIn: '--:--' };
    }

    times.sort((a, b) => (a.hour - b.hour) || (a.minute - b.minute));
    const format = (time) => `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
    return {
        firstCheckIn: format(times[0]),
        lastCheckIn: format(times[times.length - 1])
    };
};

const makeStoreMock = ({ goals = [], dayDataByDate = {}, currentDay } = {}) => {
    const today = currentDay || dayDataByDate['2026-05-17'] || {
        date: '2026-05-17',
        weekday: '周日',
        metrics: {},
        todos: [],
        timeline: []
    };

    const store = {
        goals,
        dayDataByDate,
        currentDay: today,
        getGlobalGoals: jest.fn(() => store.goals),
        getDataByDate: jest.fn((dateStr) => {
            if (!store.dayDataByDate[dateStr]) {
                store.dayDataByDate[dateStr] = {
                    date: dateStr,
                    weekday: '周日',
                    metrics: {},
                    todos: [],
                    timeline: []
                };
            }
            return store.dayDataByDate[dateStr];
        }),
        // 渲染路径用的只读版本 — 返回空 dayData 但不写入 store
        peekDataByDate: jest.fn((dateStr) => {
            if (!store.dayDataByDate[dateStr]) {
                return {
                    date: dateStr,
                    weekday: '周日',
                    metrics: {},
                    todos: [],
                    timeline: []
                };
            }
            return store.dayDataByDate[dateStr];
        }),
        getCurrentDayData: jest.fn(() => store.currentDay),
        getDateKey: jest.fn(() => '2026-05-17'),
        updateDayData: jest.fn(async (updates) => {
            Object.assign(store.currentDay, updates);
            return true;
        }),
        updateDayDataByDate: jest.fn(async (dateStr, updates) => {
            store.dayDataByDate[dateStr] = updates;
            return true;
        }),
        updateGlobalGoal: jest.fn(async (goalId, updatedGoal) => {
            const index = store.goals.findIndex(goal => goal.id === goalId);
            if (index >= 0) store.goals[index] = updatedGoal;
            return true;
        }),
        saveToStorage: jest.fn(async () => true),
        updateBalance: jest.fn(async () => true),
        removeIncomeHistory: jest.fn(async () => true),
        notify: jest.fn(),
        showToast: jest.fn()
    };

    return store;
};

const installBrowserGlobals = (store) => {
    global.store = store;
    window.store = store;
    global.storageManager = {
        getSetting: jest.fn(async () => null),
        putSetting: jest.fn(async () => true)
    };
    window.storageManager = global.storageManager;
    global.escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    global.calculateCheckInTimes = makeCheckInTimes;
    global.renderAll = jest.fn();
    window.renderAll = global.renderAll;
    global.Todo = { _editingTodoId: null };
    window.Todo = global.Todo;
    global.TodoRenderer = { render: jest.fn() };
    global.LucideUtils = { createIcon: jest.fn(() => '<svg></svg>') };
    global.ConfirmDialog = { confirmDelete: jest.fn(() => Promise.resolve(false)) };
    window.ConfirmDialog = global.ConfirmDialog;
    Object.defineProperty(global.navigator, 'vibrate', {
        configurable: true,
        value: jest.fn()
    });
};

const installServices = () => {
    global.ActionDispatcher = { register: jest.fn(), registerMany: jest.fn(), unregister: jest.fn() };
    window.ActionDispatcher = global.ActionDispatcher;
    global.Toast = { showToast: jest.fn(), announce: jest.fn() };
    window.Toast = global.Toast;
    global.WalletService = {
        updateBalance: jest.fn().mockResolvedValue(undefined),
        addIncomeHistory: jest.fn().mockResolvedValue(undefined),
        removeIncomeHistory: jest.fn().mockResolvedValue(undefined),
        recalibrateStats: jest.fn()
    };
    window.WalletService = global.WalletService;
    loadModule('services/TimelineService.js', []);
    loadModule('services/GoalService.js', []);
    loadModule('services/TodoService.js', []);
    // GoalService._formatDate 已委托给 goalCalculations
    loadModule('utils/goalCalculations.js', []);
};

const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('核心业务流', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-05-17T10:15:00+08:00'));
        localStorage.clear();
        document.body.innerHTML = '';
        delete window.GoalsRenderer;
        delete window.Todo;
        delete window.TodoRenderer;
        delete window.TimelineService;
        delete window.GoalService;
        delete window.TodoService;
        delete window.ConfirmDialog;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('目标模块应只生成今天需要执行且未完成的目标任务', () => {
        const dayData = {
            date: '2026-05-17',
            goalTaskCompletions: {
                goal_1: { 0: true }
            },
            timeline: []
        };
        const store = makeStoreMock({
            dayDataByDate: { '2026-05-17': dayData },
            goals: [
                {
                    id: 'goal_1',
                    icon: '🎯',
                    title: '项目推进',
                    items: [
                        {
                            name: '开发实现',
                            startDate: '2026-05-01',
                            endDate: '2026-05-31',
                            startValue: '0',
                            currentValue: '60',
                            targetValue: '100',
                            dailyMin: '2',
                            taskDayType: 'daily'
                        },
                        {
                            name: '已完成事项',
                            startValue: '0',
                            currentValue: '100',
                            targetValue: '100',
                            dailyMin: '1',
                            taskDayType: 'daily'
                        },
                        {
                            name: '搁置事项',
                            detail: '已搁置',
                            startValue: '0',
                            currentValue: '10',
                            targetValue: '100',
                            dailyMin: '1',
                            taskDayType: 'daily'
                        },
                        {
                            name: '工作日事项',
                            startValue: '0',
                            currentValue: '10',
                            targetValue: '100',
                            dailyMin: '1',
                            taskDayType: 'workday'
                        }
                    ]
                },
                {
                    id: 'archived_goal',
                    archived: true,
                    icon: '📦',
                    title: '已归档目标',
                    items: [
                        {
                            name: '不应出现',
                            dailyMin: '1',
                            taskDayType: 'daily'
                        }
                    ]
                }
            ]
        });
        installBrowserGlobals(store);
        installServices();
        loadModule('modules/goals/renderer.js', []);

        const tasks = window.GoalsRenderer.getTodayGoalTasks('2026-05-17');

        expect(tasks).toHaveLength(1);
        expect(tasks[0]).toMatchObject({
            id: 'goal_goal_1_0',
            goalId: 'goal_1',
            itemIdx: 0,
            title: '开发实现',
            description: '🎯 项目推进',
            dailyMin: 2,
            currentValue: '60',
            targetValue: '100',
            completed: true,
            type: 'goal_task'
        });
    });

    test('完成目标任务应更新当日完成记录、目标进度和时间线', () => {
        const dayData = {
            date: '2026-05-17',
            metrics: {},
            timeline: [],
            goalTaskCompletions: {}
        };
        const goal = {
            id: 'goal_1',
            icon: '🎯',
            title: '项目推进',
            items: [
                {
                    name: '开发实现',
                    startValue: '0',
                    currentValue: '4',
                    targetValue: '10',
                    dailyMin: '2',
                    percent: 40,
                    taskDayType: 'daily'
                }
            ]
        };
        const store = makeStoreMock({
            goals: [goal],
            dayDataByDate: { '2026-05-17': dayData }
        });
        installBrowserGlobals(store);
        installServices();
        loadModule('modules/goals/renderer.js', []);

        window.GoalsRenderer.completeGoalTask('goal_1', 0, '2026-05-17', false);

        expect(dayData.goalTaskCompletions.goal_1[0]).toBe(true);
        expect(goal.items[0].currentValue).toBe('6');
        expect(goal.items[0].percent).toBe(60);
        expect(dayData.timeline[0]).toMatchObject({ period: 'morning', name: '上午' });
        expect(dayData.timeline[0].items[0]).toMatchObject({
            time: '10:15',
            task: '项目推进 - 开发实现',
            eval: '完成'
        });
        expect(dayData.metrics).toMatchObject({
            firstCheckIn: '10:15',
            lastCheckIn: '10:15'
        });
        expect(store.updateDayDataByDate).toHaveBeenCalledWith('2026-05-17', dayData);
        expect(store.updateGlobalGoal).toHaveBeenCalledWith('goal_1', goal);
    });

    test('取消完成目标任务应回退进度并移除对应时间线记录', () => {
        const dayData = {
            date: '2026-05-17',
            metrics: {},
            goalTaskCompletions: { goal_1: { 0: true } },
            timeline: [
                {
                    period: 'morning',
                    name: '上午',
                    time: '08:00 - 12:00',
                    icon: '💼',
                    eval: 'good',
                    items: [
                        { time: '10:15', task: '项目推进 - 开发实现', eval: '完成' }
                    ]
                }
            ]
        };
        const goal = {
            id: 'goal_1',
            icon: '🎯',
            title: '项目推进',
            items: [
                {
                    name: '开发实现',
                    startValue: '0',
                    currentValue: '6',
                    targetValue: '10',
                    dailyMin: '2',
                    percent: 60,
                    taskDayType: 'daily'
                }
            ]
        };
        const store = makeStoreMock({
            goals: [goal],
            dayDataByDate: { '2026-05-17': dayData }
        });
        installBrowserGlobals(store);
        installServices();
        loadModule('modules/goals/renderer.js', []);

        window.GoalsRenderer.completeGoalTask('goal_1', 0, '2026-05-17', true);

        expect(dayData.goalTaskCompletions.goal_1[0]).toBe(false);
        expect(goal.items[0].currentValue).toBe('4');
        expect(goal.items[0].percent).toBe(40);
        expect(dayData.timeline).toHaveLength(0);
        expect(dayData.metrics).toMatchObject({
            firstCheckIn: '--:--',
            lastCheckIn: '--:--'
        });
    });
});

describe('StorageManager localStorage 兜底', () => {
    beforeEach(() => {
        jest.resetModules();
        localStorage.clear();
        global.localStorage = window.localStorage;
        global.EventBus = { emit: jest.fn() };
        window.EventBus = global.EventBus;
        // 模拟 indexedDB.open 抛异常，迫使 storageManager 降级到 localStorage
        global.indexedDB = { open: jest.fn(() => { throw new Error('IndexedDB not available'); }) };
        window.indexedDB = global.indexedDB;
        delete window.storageManager;
    });

    test('IndexedDB 不可用时应降级到 localStorage 并支持导入导出', async () => {
        loadModule('storage/storageManager.js', []);
        await window.storageManager.initPromise;

        expect(window.storageManager.getCurrentAdapterType()).toBe('localStorage');

        await window.storageManager.putDay({
            date: '2026-05-17',
            metrics: { firstCheckIn: '10:15' },
            timeline: []
        });
        await window.storageManager.putSetting('theme', 'dark');
        await window.storageManager.putGoals([
            { id: 'goal_1', title: '项目推进', items: [] }
        ]);

        const exported = await window.storageManager.exportAllData();

        expect(exported).toMatchObject({
            version: '3.0',
            storageType: 'localStorage'
        });
        expect(exported.days['2026-05-17'].metrics.firstCheckIn).toBe('10:15');
        expect(exported.settings.theme).toBe('dark');
        expect(exported.goals[0].title).toBe('项目推进');

        await window.storageManager.clearAll();
        await window.storageManager.importData({
            days: {
                '2026-05-18': {
                    date: '2026-05-18',
                    metrics: { firstCheckIn: '09:00' }
                }
            },
            settings: { colorTheme: 'ocean' },
            goals: [{ id: 'goal_2', title: '学习计划' }]
        });

        expect((await window.storageManager.getDay('2026-05-18')).metrics.firstCheckIn).toBe('09:00');
        expect(await window.storageManager.getSetting('colorTheme')).toBe('ocean');
        expect((await window.storageManager.getGoals())[0].title).toBe('学习计划');
    });

    test('clearAll 应清除所有存储数据', async () => {
        loadModule('storage/storageManager.js', []);
        await window.storageManager.initPromise;

        await window.storageManager.putDay({
            date: '2026-05-17',
            metrics: { firstCheckIn: '10:15' },
            timeline: []
        });
        await window.storageManager.putSetting('theme', 'dark');
        await window.storageManager.putGoals([
            { id: 'goal_1', title: '项目推进', items: [] }
        ]);

        await window.storageManager.clearAll();

        const allDays = await window.storageManager.getAllDays();
        expect(Object.keys(allDays).length).toBe(0);

        const theme = await window.storageManager.getSetting('theme');
        expect(theme).toBeNull();

        const goals = await window.storageManager.getGoals();
        expect(goals.length).toBe(0);
    });

    test('clearAll 后应能重新写入数据', async () => {
        loadModule('storage/storageManager.js', []);
        await window.storageManager.initPromise;

        await window.storageManager.putDay({
            date: '2026-05-17',
            metrics: { firstCheckIn: '10:15' },
            timeline: []
        });

        await window.storageManager.clearAll();

        await window.storageManager.putDay({
            date: '2026-05-18',
            metrics: { firstCheckIn: '09:00' },
            timeline: []
        });

        const day = await window.storageManager.getDay('2026-05-18');
        expect(day).not.toBeNull();
        expect(day.metrics.firstCheckIn).toBe('09:00');

        const oldDay = await window.storageManager.getDay('2026-05-17');
        expect(oldDay).toBeNull();
    });
});
