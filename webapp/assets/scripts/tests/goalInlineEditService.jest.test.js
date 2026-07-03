/**
 * @jest-environment jsdom
 *
 * GoalInlineEditService 回归测试
 *
 * 核心约束（防止以后重构把待办同步链路打回原形）：
 * 1. editType='name' / 'title' → 必须调 TodoRenderer._invalidateCache + renderAll
 * 2. 其他类型（currentValue / status / ...）→ 走 renderSingleGoal，不动 todo
 * 3. value 与旧值相等 → 不算 changed，不应触发任何刷新
 * 4. name 修改必须真的写入 goal.items[subIdx].name
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('GoalInlineEditService', () => {
    let GoalInlineEditService;
    let mocks;

    beforeEach(() => {
        jest.resetModules();

        // 跟踪调用
        const renderAll = jest.fn();
        const invalidateCache = jest.fn();
        const updateGlobalGoal = jest.fn().mockResolvedValue(undefined);

        // mock store（在 loadModule 注入 globalThis）
        globalThis.store = {
            getGlobalGoals: jest.fn(),
            updateGlobalGoal
        };
        globalThis.TodoRenderer = { _invalidateCache: invalidateCache };
        globalThis.renderAll = renderAll;

        // mock 依赖
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

        mocks = { renderAll, invalidateCache, updateGlobalGoal, deps };
    });

    function seedGoal(items = []) {
        const goal = { id: 'g1', title: '原标题', category: '学习', priority: '高', items };
        globalThis.store.getGlobalGoals.mockReturnValue([goal]);
        return goal;
    }

    // ──────────────── name（子项文案）───────────────

    test('editType=name：新值与旧值不同时应更新 item.name 并触发 renderAll + 失效缓存', async () => {
        const stale = seedGoal([{ name: '旧子项' }]);
        await GoalInlineEditService.commit(stale, 0, 'name', '新子项', mocks.deps);

        // 1. 数据写入
        expect(stale.items[0].name).toBe('新子项');
        // 2. 持久化
        expect(mocks.updateGlobalGoal).toHaveBeenCalledWith('g1', stale);
        // 3. todo 缓存失效
        expect(mocks.invalidateCache).toHaveBeenCalledTimes(1);
        // 4. 触发全局重渲染（todo 会重新读 store）
        expect(mocks.renderAll).toHaveBeenCalledTimes(1);
        // 5. 不应走局部刷新
        expect(mocks.deps.renderSingleGoal).not.toHaveBeenCalled();
    });

    test('editType=name：值未变时不应触发任何刷新', async () => {
        const stale = seedGoal([{ name: '原值' }]);
        await GoalInlineEditService.commit(stale, 0, 'name', '原值', mocks.deps);

        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
        expect(mocks.invalidateCache).not.toHaveBeenCalled();
        expect(mocks.renderAll).not.toHaveBeenCalled();
    });

    // ──────────────── title（主体文案）───────────────

    test('editType=title：应更新 goal.title 并触发 renderAll', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'title', '新主体', mocks.deps);

        expect(stale.title).toBe('新主体');
        expect(mocks.updateGlobalGoal).toHaveBeenCalledWith('g1', stale);
        expect(mocks.invalidateCache).toHaveBeenCalledTimes(1);
        expect(mocks.renderAll).toHaveBeenCalledTimes(1);
    });

    test('editType=title：空字符串不写入（防止误清空）', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'title', '', mocks.deps);

        expect(stale.title).toBe('原标题');
        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
    });

    // ──────────────── category / priority（结构变化，也走 renderAll）───────────────

    test('editType=category：应触发 renderAll（影响全局布局）', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'category', '工作', mocks.deps);

        expect(stale.category).toBe('工作');
        expect(mocks.renderAll).toHaveBeenCalledTimes(1);
    });

    test('editType=priority：应触发 renderAll', async () => {
        const stale = seedGoal();
        await GoalInlineEditService.commit(stale, null, 'priority', '中', mocks.deps);

        expect(stale.priority).toBe('中');
        expect(mocks.renderAll).toHaveBeenCalledTimes(1);
    });

    // ──────────────── status / currentValue（不影响 todo，走 renderSingleGoal）───────────────

    test('editType=status：只改 detail，不应触发 renderAll', async () => {
        const stale = seedGoal([{ name: '子项', detail: '' }]);
        await GoalInlineEditService.commit(stale, 0, 'status', '进行中', mocks.deps);

        expect(stale.items[0].detail).toBe('进行中');
        expect(mocks.updateGlobalGoal).toHaveBeenCalled();
        // status 改的是 detail（备注），不影响 todo 标题，所以走局部刷新
        expect(mocks.renderAll).not.toHaveBeenCalled();
        expect(mocks.deps.renderSingleGoal).toHaveBeenCalledWith('g1');
    });

    test('editType=currentValue：值合法时应更新 currentValue 并走 renderSingleGoal', async () => {
        const stale = seedGoal([{ name: '子项', startValue: '0', targetValue: '100', currentValue: '0' }]);
        await GoalInlineEditService.commit(stale, 0, 'currentValue', '50', mocks.deps);

        expect(stale.items[0].currentValue).toBe('50');
        expect(stale.items[0].percent).toBe(50);
        expect(mocks.deps.autoCalcEndDate).toHaveBeenCalled();
        expect(mocks.deps.autoCalcGoalDateRange).toHaveBeenCalled();
        expect(mocks.renderAll).not.toHaveBeenCalled();
        expect(mocks.deps.renderSingleGoal).toHaveBeenCalledWith('g1');
    });

    // ──────────────── _invalidateCache 触发条件 ────────────────

    test('changed=false（值未变）时不应调 _invalidateCache', async () => {
        const stale = seedGoal([{ name: '原值' }]);
        await GoalInlineEditService.commit(stale, 0, 'name', '原值', mocks.deps);

        // changed=false 整个 if 块都不进
        expect(mocks.invalidateCache).not.toHaveBeenCalled();
    });

    test('changed=true（任意 editType）时都会调 _invalidateCache', async () => {
        const stale = seedGoal([{ name: 'x', detail: 'old' }]);
        await GoalInlineEditService.commit(stale, 0, 'status', 'new', mocks.deps);

        // status 不是 name/title 也不是 category/priority，但 changed=true 仍会失效
        expect(mocks.invalidateCache).toHaveBeenCalledTimes(1);
    });

    // ──────────────── 防御性 ────────────────

    test('goal 不存在时应静默返回', async () => {
        // store 找不到对应 id
        globalThis.store.getGlobalGoals.mockReturnValue([]);
        const stale = { id: 'missing' };

        await GoalInlineEditService.commit(stale, 0, 'name', '新值', mocks.deps);

        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
        expect(mocks.renderAll).not.toHaveBeenCalled();
    });

    test('subIdx 越界时 name/status 不应崩溃', async () => {
        const stale = seedGoal([{ name: '唯一子项' }]);
        // items 只有 1 个，但传 subIdx=99
        await GoalInlineEditService.commit(stale, 99, 'name', '新值', mocks.deps);

        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
        expect(mocks.renderAll).not.toHaveBeenCalled();
    });

    // ──────────────── 全局桥接（防 ESM 转译时漏挂 window）───────────────

    test('应挂到 window.GoalInlineEditService（renderer.js 直接引用 window 版本）', () => {
        // 模拟 renderer.js 在浏览器里的引用方式：GoalInlineEditService.commit(...)
        // 只有当 export 被挂到 window 时才能在跨模块调用中找到
        expect(typeof globalThis.GoalInlineEditService).toBe('object');
        expect(typeof globalThis.GoalInlineEditService.commit).toBe('function');
    });
});
