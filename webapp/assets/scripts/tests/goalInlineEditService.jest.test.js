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

    // ──────────────── targetValue 校验（新增：失败抛错，不再静默/Toast）───────────────

    test('editType=targetValue：合法值应更新 targetValue 并重算 percent', async () => {
        const stale = seedGoal([{ name: '子项', startValue: '0', targetValue: '100', currentValue: '20' }]);
        await GoalInlineEditService.commit(stale, 0, 'targetValue', '200', mocks.deps);

        expect(stale.items[0].targetValue).toBe('200');
        expect(stale.items[0].percent).toBe(10); // 20/200
        expect(mocks.updateGlobalGoal).toHaveBeenCalledWith('g1', stale);
        expect(mocks.deps.autoCalcEndDate).toHaveBeenCalled();
    });

    test('editType=targetValue：<= 0 应抛错且不写入、不持久化', async () => {
        const stale = seedGoal([{ name: '子项', startValue: '0', targetValue: '100', currentValue: '20' }]);
        await expect(GoalInlineEditService.commit(stale, 0, 'targetValue', '0', mocks.deps))
            .rejects.toThrow(/大于 0/);

        expect(stale.items[0].targetValue).toBe('100'); // 未被改写
        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
        expect(mocks.deps.autoCalcEndDate).not.toHaveBeenCalled();
    });

    test('editType=targetValue：等于起始值应抛错', async () => {
        const stale = seedGoal([{ name: '子项', startValue: '5', targetValue: '100', currentValue: '20' }]);
        await expect(GoalInlineEditService.commit(stale, 0, 'targetValue', '5', mocks.deps))
            .rejects.toThrow(/起始值/);

        expect(stale.items[0].targetValue).toBe('100');
        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
    });

    test('editType=targetValue：非数字应抛错', async () => {
        const stale = seedGoal([{ name: '子项', startValue: '0', targetValue: '100', currentValue: '20' }]);
        await expect(GoalInlineEditService.commit(stale, 0, 'targetValue', 'abc', mocks.deps))
            .rejects.toThrow(/数字/);

        expect(stale.items[0].targetValue).toBe('100');
        expect(mocks.updateGlobalGoal).not.toHaveBeenCalled();
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

    // ──────────────── P0-1：手动设定的截止日不得被静默吞掉 ────────────────
    // 现场：inlineEditService 在 currentValue / targetValue 分支 `delete item.manuallySetDate`，
    // 紧接着 autoCalcEndDate 按 `startDate + ceil(剩余/dailyMin) - 1` 重算并覆盖用户
    // 在日期选择器里亲手设的截止日 —— 改一个数字就把截止日吃了，用户全程不知情。
    // 修复：不再 delete，交回 _autoCalcEndDate 自带的 `if (manuallySetDate) return` 守卫。

    test('P0-1 改 currentValue 时保留 manuallySetDate（手动截止日不被重算覆盖）', async () => {
        const goal = seedGoal([{
            name: '子项', startValue: '0', currentValue: '10', targetValue: '100',
            endDate: '2026-12-31', manuallySetDate: true,
        }]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(goal.items[0].manuallySetDate).toBe(true);   // 标记仍在 → 自动推导跳过
        expect(goal.items[0].endDate).toBe('2026-12-31');   // 用户设的截止日未被吃
    });

    test('P0-1 改 targetValue 时同样保留手动截止日', async () => {
        const goal = seedGoal([{
            name: '子项', startValue: '0', currentValue: '10', targetValue: '100',
            endDate: '2026-12-31', manuallySetDate: true,
        }]);
        await GoalInlineEditService.commit(goal, 0, 'targetValue', '200', mocks.deps);

        expect(goal.items[0].manuallySetDate).toBe(true);
        expect(goal.items[0].endDate).toBe('2026-12-31');
    });

    // ───── P0-1 配套：手动截止日 × 数值变化的「知情选择」─────
    // P0-1 后手动日期不再被静默覆盖，但它也就此锁定、不跟随数值变化。
    // 于是补上：改数值时若发现是手动日期，先预览「重算后会是哪天」并询问用户，
    // 确认才重算（清标记），取消则保留用户设的日期。未手动设过的子项完全不受打扰。

    /** 模拟真实 _autoCalcEndDate：带手动守卫，且会改写 endDate（mock 默认不会，无法触发预览差异） */
    function withRealAutoCalc(previewEnd = '2026-11-15') {
        mocks.deps.autoCalcEndDate = jest.fn((item) => {
            if (item.manuallySetDate) return;
            item.endDate = previewEnd;
        });
    }

    function manualItem() {
        return {
            name: '子项', startValue: '0', currentValue: '10', targetValue: '100',
            dailyMin: '10',        // 必须给：_autoCalcEndDate 要求 dailyMin>0 才推算
            endDate: '2026-12-31', manuallySetDate: true,
        };
    }

    test('知情选择：确认重算 → 清除标记并按新数值重算', async () => {
        withRealAutoCalc('2026-11-15');
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(true);
        const goal = seedGoal([manualItem()]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(mocks.deps.confirmRecalcEndDate).toHaveBeenCalledTimes(1);
        // 询问时要把「现在的手动日期」和「重算后会变成哪天」都摊给用户
        expect(mocks.deps.confirmRecalcEndDate.mock.calls[0][0]).toBe('2026-12-31');
        expect(mocks.deps.confirmRecalcEndDate.mock.calls[0][1]).toBe('2026-11-15');
        expect(goal.items[0].manuallySetDate).toBeUndefined();   // 标记已清
        expect(goal.items[0].endDate).toBe('2026-11-15');        // 已重算
    });

    test('知情选择：取消 → 手动日期与标记都原样保留', async () => {
        withRealAutoCalc('2026-11-15');
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(false);
        const goal = seedGoal([manualItem()]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(goal.items[0].manuallySetDate).toBe(true);
        expect(goal.items[0].endDate).toBe('2026-12-31');
    });

    test('非手动日期（如新建时自动补的默认日期）→ 推算会变则仍询问', async () => {
        // 这是「改数值却没反应」的直接来源：新建目标的日期是 editor.js 自动补的，
        // 并不带 manuallySetDate。若把它当门槛，用户永远等不到询问。
        withRealAutoCalc('2026-11-15');
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(true);
        const goal = seedGoal([{
            name: '子项', startValue: '0', currentValue: '10', targetValue: '100',
            dailyMin: '10',
            endDate: '2026-12-31',          // 默认值，无 manuallySetDate
        }]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(mocks.deps.confirmRecalcEndDate).toHaveBeenCalledTimes(1);
        expect(goal.items[0].endDate).toBe('2026-11-15');   // 确认 → 更新
    });

    test('非手动日期 + 用户选「保持不变」→ 打上锁定标记，以后不再被动改动', async () => {
        withRealAutoCalc('2026-11-15');
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(false);
        const goal = seedGoal([{
            name: '子项', startValue: '0', currentValue: '10', targetValue: '100',
            dailyMin: '10',
            endDate: '2026-12-31',
        }]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(goal.items[0].endDate).toBe('2026-12-31');
        expect(goal.items[0].manuallySetDate).toBe(true);   // 记录用户的"保持不变"
    });

    test('推算结果与手动日期相同 → 仍询问（此时价值是「是否解除手动锁定」）', async () => {
        // _autoCalcEndDate 按天数取整，小幅改值常常算出同一天；此时不能静默，
        // 否则用户改了数值毫无反馈。询问转为「是否解除锁定，以后自动跟随」。
        mocks.deps.autoCalcEndDate = jest.fn((item) => {
            if (item.manuallySetDate) return;
            item.endDate = '2026-12-31';    // 与手动日期一致
        });
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(true);
        const goal = seedGoal([manualItem()]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(mocks.deps.confirmRecalcEndDate).toHaveBeenCalledTimes(1);
        expect(mocks.deps.confirmRecalcEndDate.mock.calls[0][3]).toBe(true);  // same=true
        expect(goal.items[0].manuallySetDate).toBeUndefined();   // 确认 → 解除锁定
        expect(goal.items[0].endDate).toBe('2026-12-31');
    });

    test('推算结果相同且用户取消 → 保持手动锁定', async () => {
        mocks.deps.autoCalcEndDate = jest.fn((item) => {
            if (item.manuallySetDate) return;
            item.endDate = '2026-12-31';
        });
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(false);
        const goal = seedGoal([manualItem()]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(goal.items[0].manuallySetDate).toBe(true);        // 锁定保持
        expect(goal.items[0].endDate).toBe('2026-12-31');
    });

    test('预览不留副作用：取消时 endDate 与标记回到询问前', async () => {
        withRealAutoCalc('2026-11-15');
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(false);
        const goal = seedGoal([manualItem()]);
        await GoalInlineEditService.commit(goal, 0, 'targetValue', '200', mocks.deps);

        expect(goal.items[0].endDate).toBe('2026-12-31');
        expect(goal.items[0].manuallySetDate).toBe(true);
    });

    test('推算不出新日期时说明原因（否则改数值会「毫无反应」）', async () => {
        // 复刻真实 _autoCalcEndDate（renderer.js:1490）：缺 targetValue / dailyMin 直接 return
        mocks.deps.autoCalcEndDate = jest.fn((item) => {
            if (item.manuallySetDate) return;
            if (!parseFloat(item.targetValue) || !(parseFloat(item.dailyMin) > 0)) return;
            item.endDate = '2026-11-15';
        });
        mocks.deps.confirmRecalcEndDate = jest.fn().mockResolvedValue(true);
        mocks.deps.notifyEndDateStatic = jest.fn();
        const goal = seedGoal([{
            name: '子项', startValue: '0', currentValue: '10',
            targetValue: '',            // 缺目标值 → 无法推算
            endDate: '2026-12-31', manuallySetDate: true,
        }]);
        await GoalInlineEditService.commit(goal, 0, 'currentValue', '20', mocks.deps);

        expect(mocks.deps.confirmRecalcEndDate).not.toHaveBeenCalled();  // 无从重算 → 不问
        expect(mocks.deps.notifyEndDateStatic).toHaveBeenCalledTimes(1); // 但必须说明原因
        expect(goal.items[0].endDate).toBe('2026-12-31');
        expect(goal.items[0].manuallySetDate).toBe(true);
    });
});
