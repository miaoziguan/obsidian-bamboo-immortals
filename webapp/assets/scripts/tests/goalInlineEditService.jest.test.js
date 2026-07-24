/**
 * @jest-environment jsdom
 *
 * GoalInlineEditService 回归测试
 *
 * 核心约束（防止以后重构把待办同步链路打回原形）：
 * 1. editType='name' / 'title' → 必须调 TodoRenderer._invalidateCache + markSectionDirty(goals+todo)
 * 2. editType='category' / 'priority' → 只 markSectionDirty(goals)
 * 3. 其他类型（currentValue / status / ...）→ 走 renderSingleGoal，不动 todo
 * 4. value 与旧值相等 → 不算 changed，不应触发任何刷新
 * 5. name 修改必须真的写入 goal.items[subIdx].name
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('GoalInlineEditService', () => {
    let GoalInlineEditService;
    let mocks;

    beforeEach(() => {
        jest.resetModules();

        const markSectionDirty = jest.fn();
        const invalidateCache = jest.fn();
        const updateGlobalGoal = jest.fn().mockResolvedValue(undefined);

        globalThis.store = {
            getGlobalGoals: jest.fn(),
            updateGlobalGoal
        };
        globalThis.TodoRenderer = { _invalidateCache: invalidateCache };
        globalThis.markSectionDirty = markSectionDirty;

        const deps = {
            calcProgress: jest.fn().mockReturnValue(42),
            autoCalcEndDate: jest.fn(),
            autoCalcGoalDateRange: jest.fn(),
            renderSingleGoal: jest.fn()
        };

        ({ GoalInlineEditService } = loadModule(
            'modules/goals/inlineEditService.js',
            ['GoalInlineEditService']
        ));

        mocks = { markSectionDirty, invalidateCache, updateGlobalGoal, deps };
    });

    function seedGoal(items = []) {
        const goal = { id: 'g1', title: '原标题', category: '学习', priority: '高', items };
        globalThis.store.getGlobalGoals.mockReturnValue([goal]);
        return goal;
    }

    function wasMarkedDirty(sectionId) {
        return mocks.markSectionDirty.mock.calls.some(call => call[0] === sectionId);
    }

    // ──────────────── name（子项文案）───────────────

    test('editType=name：新值与旧值不同时应更新 item.name 并触发 goals+todo 脏标记 + 失效缓存', async () => {
        const stale = seedGoal([{ name: '旧子项' }]);
        await GoalInlineEditService.commit(stale, 0, 'name', '新子项', mocks.deps);

        expect(stale.items[0].name).toBe('新子项');
        expect(mocks.updateGlobalGoal).toHaveBeenCalledWith('g1', stale);
        expect(mocks.invalidateCache).toHaveBeenCalledTimes(1);
        expect(wasMarkedDirty('goals')).toBe(true);
        expect(wasMarkedDirty('todo')).toBe(true);
        expect(mocks.deps.renderSingleGoal).not.toHaveBeenCalled();
    });

    test('editType=name：值未变时不应触发任何刷新', async () => {
        const stale = seedGoal([{ name: '原值' }]);
        await GoalInlineEditService.commit(stale, 0, 'name', '原值', mocks.deps);

        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
        expect(mocks.invalidateCache).not.toHaveBeenCalled();
        expect(mocks.markSectionDirty).not.toHaveBeenCalled();
    });

    // ──────────────── title（主体文案）───────────────

    test('editType=title：应更新 goal.title 并触发 goals+todo 脏标记', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'title', '新主体', mocks.deps);

        expect(stale.title).toBe('新主体');
        expect(mocks.updateGlobalGoal).toHaveBeenCalledWith('g1', stale);
        expect(mocks.invalidateCache).toHaveBeenCalledTimes(1);
        expect(wasMarkedDirty('goals')).toBe(true);
        expect(wasMarkedDirty('todo')).toBe(true);
    });

    test('editType=title：空字符串不写入（防止误清空）', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'title', '', mocks.deps);

        expect(stale.title).toBe('原标题');
        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
    });

    // ──────────────── category / priority（结构变化，只刷新 goals）───────────────

    test('editType=category：应触发 goals 脏标记（影响全局布局）', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'category', '工作', mocks.deps);

        expect(stale.category).toBe('工作');
        expect(wasMarkedDirty('goals')).toBe(true);
        expect(wasMarkedDirty('todo')).toBe(false);
    });

    test('editType=priority：应触发 goals 脏标记', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'priority', '中', mocks.deps);

        expect(stale.priority).toBe('中');
        expect(wasMarkedDirty('goals')).toBe(true);
        expect(wasMarkedDirty('todo')).toBe(false);
    });

    // ──────────────── status / currentValue（不影响 todo，走 renderSingleGoal）───────────────

    test('editType=status：只改 detail，不应触发 section 脏标记', async () => {
        const stale = seedGoal([{ name: '子项', detail: '' }]);
        await GoalInlineEditService.commit(stale, 0, 'status', '进行中', mocks.deps);

        expect(stale.items[0].detail).toBe('进行中');
        expect(mocks.updateGlobalGoal).toHaveBeenCalled();
        expect(mocks.markSectionDirty).not.toHaveBeenCalled();
        expect(mocks.deps.renderSingleGoal).toHaveBeenCalledWith('g1');
    });

    test('editType=currentValue：值合法时应更新 currentValue 并走 renderSingleGoal', async () => {
        const stale = seedGoal([{ name: '子项', startValue: '0', targetValue: '100', currentValue: '0' }]);
        await GoalInlineEditService.commit(stale, 0, 'currentValue', '50', mocks.deps);

        expect(stale.items[0].currentValue).toBe('50');
        expect(stale.items[0].percent).toBe(50);
        expect(mocks.deps.autoCalcEndDate).toHaveBeenCalled();
        expect(mocks.deps.autoCalcGoalDateRange).toHaveBeenCalled();
        expect(mocks.markSectionDirty).not.toHaveBeenCalled();
        expect(mocks.deps.renderSingleGoal).toHaveBeenCalledWith('g1');
    });

    // ──────────────── _invalidateCache 触发条件 ────────────────

    test('changed=false（值未变）时不应调 _invalidateCache', async () => {
        const stale = seedGoal([{ name: '原值' }]);
        await GoalInlineEditService.commit(stale, 0, 'name', '原值', mocks.deps);

        expect(mocks.invalidateCache).not.toHaveBeenCalled();
    });

    test('changed=true（任意 editType）时都会调 _invalidateCache', async () => {
        const stale = seedGoal([{ name: 'x', detail: 'old' }]);
        await GoalInlineEditService.commit(stale, 0, 'status', 'new', mocks.deps);

        expect(mocks.invalidateCache).toHaveBeenCalledTimes(1);
    });

    // ──────────────── 防御性 ────────────────

    test('goal 不存在时应静默返回', async () => {
        globalThis.store.getGlobalGoals.mockReturnValue([]);
        const stale = { id: 'missing' };

        await GoalInlineEditService.commit(stale, 0, 'name', '新值', mocks.deps);

        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
        expect(mocks.markSectionDirty).not.toHaveBeenCalled();
    });

    test('subIdx 越界时 name/status 不应崩溃', async () => {
        const stale = seedGoal([{ name: '唯一子项' }]);
        await GoalInlineEditService.commit(stale, 99, 'name', '新值', mocks.deps);

        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
        expect(mocks.markSectionDirty).not.toHaveBeenCalled();
    });

    // ──────────────── 全局桥接（防 ESM 转译时漏挂 window）───────────────

    test('应挂到 window.GoalInlineEditService（renderer.js 直接引用 window 版本）', () => {
        expect(typeof globalThis.GoalInlineEditService).toBe('object');
        expect(typeof globalThis.GoalInlineEditService.commit).toBe('function');
    });
});
