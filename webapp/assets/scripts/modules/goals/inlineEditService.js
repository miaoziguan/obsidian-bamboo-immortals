/**
 * GoalInlineEditService — 目标行内编辑提交逻辑
 * 从 GoalsRenderer._commitInlineEdit 中抽取，与渲染层解耦。
 * 
 * 只负责「修改 goal/items 数据 + 调 store 持久化」，不触碰 DOM。
 */

/**
 * 手动截止日 × 数值变化的「知情选择」（P0-1 配套）。
 *
 * 背景：P0-1 修掉了「改数值时静默覆盖用户手动设的截止日」。但那也带来副作用 ——
 * 手动日期一旦设定就永久锁定，之后改当前值/目标值时截止日不再跟随变化，用户
 * 可能反过来觉得"我改了目标值，截止日怎么不动"。
 *
 * 这里补一个知情选择：发现是手动日期时，先**预览**若按新数值重算会是哪一天，
 * 再询问用户。确认才清除手动标记并正式重算；取消则保留用户设定的日期。
 *
 * 高频性：仅在 item.manuallySetDate 为真时询问；未手动设过日期的子项完全不受打扰。
 * 预览与还原：临时解除标记算出 preview 后立刻还原，确认前绝不改动 item。
 */
async function negotiateManualEndDate(item, deps, editLabel) {
    // 不再把「手动标记」当作触发门槛。
    // 原因：manuallySetDate 只有一个来源（下方 dateRange 行内编辑），而新建目标时
    // editor.js 自动补的默认日期并不打标记 —— 用户看到的日期常常是默认值，
    // 却以为自己"手动设过"，于是永远等不到询问（表现为「改数值没反应」）。
    // 现在标记只用于**记录用户选择**：选「保持不变」才置位（以后自动推导不再动它）。
    if (!item) return;
    if (typeof deps.autoCalcEndDate !== 'function') return;
    // 未注入询问能力（如单测环境）→ 保守保持原日期，绝不擅自改动
    if (typeof deps.confirmRecalcEndDate !== 'function') return;

    const savedEnd = item.endDate;
    const savedManual = item.manuallySetDate;

    // 预览：临时解除标记 → 算 → 原样还原（这一步绝不留下副作用）
    delete item.manuallySetDate;
    deps.autoCalcEndDate(item);
    const preview = item.endDate;
    item.endDate = savedEnd;
    if (savedManual) item.manuallySetDate = savedManual;

    // 推算不出（_autoCalcEndDate 需要 targetValue 有效 + dailyMin>0，缺任一个直接 return）
    // → 说明原因，别让截止日默默不动。（仅手动日期时才会走到这里）
    const canCalc = !!(parseFloat(item.targetValue) && parseFloat(item.dailyMin) > 0);
    if (!canCalc) {
        if (typeof deps.notifyEndDateStatic === 'function') {
            deps.notifyEndDateStatic(savedEnd, editLabel);
        }
        return;
    }

    // 手动日期存在即询问。它有两重价值：
    //   ① 重算成哪一天；
    //   ② 是否解除「手动锁定」——解除后，以后改数值截止日会自动跟随。
    // 因此**即便推算结果与当前相同**（_autoCalcEndDate 按天数取整，小幅改值常常算不出
    // 不同的日期），也值得问一次；否则用户改了数值却收不到任何反馈，正是「没反应」的来源。
    const same = preview === savedEnd;
    const ok = await deps.confirmRecalcEndDate(savedEnd, preview || savedEnd, editLabel, same);
    if (ok) {
        delete item.manuallySetDate;
        deps.autoCalcEndDate(item);                  // 正式重算（标记已清，守卫放行）
    } else if (!savedManual) {
        // 用户明确选择「保持不变」→ 置位标记，以后改数值自动推导不再动这个日期。
        // （原本就有标记时保持原样即可，无需重复设置）
        item.manuallySetDate = true;
    }
}

export const GoalInlineEditService = {
    /**
     * @param {object} staleGoal — 编辑前的 goal 快照
     * @param {number|null} subIdx — 子项索引
     * @param {string} editType — 编辑类型
     * @param {string} value — 新值
     * @param {object} deps — 依赖注入
     * @param {function} deps.calcProgress
     * @param {function} deps.autoCalcEndDate
     * @param {function} deps.autoCalcGoalDateRange
     * @param {function} deps.renderSingleGoal
     * @param {function} [deps.confirmRecalcEndDate] — (savedEnd, preview, editLabel) => Promise<boolean>
     *        手动截止日遇到数值变化时询问是否重算；未注入则保守保持手动日期。
     */
    async commit(staleGoal, subIdx, editType, value, deps) {
        const goals = store.getGlobalGoals();
        const goal = goals.find(g => g.id === staleGoal.id);
        if (!goal) return;

        let changed = false;

        switch (editType) {
            case 'category':
                if (value && value !== goal.category) { goal.category = value; changed = true; }
                break;
            case 'priority':
                if (value && value !== goal.priority) { goal.priority = value; changed = true; }
                break;
            case 'title':
                if (value && value !== goal.title) { goal.title = value; changed = true; }
                break;
            case 'meta':
                if (value !== goal.meta) { goal.meta = value; changed = true; }
                break;
            case 'name':
                if (subIdx !== null && goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    if (value && value !== item.name) { item.name = value; changed = true; }
                }
                break;
            case 'status':
                if (subIdx !== null && goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    const newStatus = value || '';
                    if (newStatus !== (item.detail || '')) { item.detail = newStatus; changed = true; }
                }
                break;
            case 'currentValue':
                if (subIdx !== null && goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    const newVal = parseFloat(value);
                    if (!isNaN(newVal) && String(newVal) !== String(item.currentValue || item.startValue || 0)) {
                        const start = parseFloat(item.startValue) || 0;
                        const target = parseFloat(item.targetValue) || 0;
                        const clamped = Math.max(Math.min(start, target), Math.min(Math.max(start, target), newVal));
                        item.currentValue = String(clamped);
                        if (item.startValue && item.targetValue && target !== start) {
                            item.percent = Math.min(100, Math.max(0, Math.round((Math.abs(clamped - start) / Math.abs(target - start)) * 100)));
                        }
                        // 【P0-1】手动截止日不再被静默覆盖：改数值时先预览重算结果并询问是否重算
                        await negotiateManualEndDate(item, deps, '当前值');
                        deps.autoCalcEndDate(item);
                        deps.autoCalcGoalDateRange(goal);
                        changed = true;
                    }
                }
                break;
            case 'targetValue':
                if (subIdx !== null && goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    const newTarget = parseFloat(value);
                    // 校验失败抛错，由调用方（renderer）负责向用户展示反馈
                    if (isNaN(newTarget)) {
                        throw new Error('目标值必须为数字');
                    }
                    if (newTarget <= 0) {
                        throw new Error('目标值必须大于 0');
                    }
                    const start = parseFloat(item.startValue) || 0;
                    if (newTarget === start) {
                        throw new Error('目标值不能等于起始值');
                    }
                    item.targetValue = String(newTarget);
                    const current = parseFloat(item.currentValue) || start;
                    item.percent = Math.min(100, Math.max(0, Math.round((Math.abs(current - start) / Math.abs(newTarget - start)) * 100)));
                    // 同上（P0-1）：改目标值时同样先预览并询问，不擅自抹除手动日期
                    await negotiateManualEndDate(item, deps, '目标值');
                    deps.autoCalcEndDate(item);
                    deps.autoCalcGoalDateRange(goal);
                    changed = true;
                }
                break;
            case 'dailyMin':
                if (subIdx !== null && goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    const newMin = parseFloat(value);
                    if (!isNaN(newMin) && newMin > 0) {
                        item.dailyMin = String(newMin);
                        deps.autoCalcEndDate(item);
                        deps.autoCalcGoalDateRange(goal);
                        changed = true;
                    } else if (value === '') {
                        delete item.dailyMin;
                        deps.autoCalcGoalDateRange(goal);
                        changed = true;
                    }
                }
                break;
            case 'dateRange':
                if (subIdx !== null && goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    const match = value.match(/(\d{4}-\d{2}-\d{2})\s*→\s*(\d{4}-\d{2}-\d{2})/);
                    if (match) {
                        item.startDate = match[1];
                        item.endDate = match[2];
                        item.manuallySetDate = true;
                        changed = true;
                        deps.autoCalcGoalDateRange(goal);
                    }
                }
                break;
        }

        if (changed) {
            goal.progress = deps.calcProgress(goal);
            await store.updateGlobalGoal(goal.id, goal);
            if (typeof TodoRenderer !== 'undefined') TodoRenderer._invalidateCache();
            // category/priority 影响全局布局，name/title/currentValue 影响待办显示文案
            if (editType === 'category' || editType === 'priority') {
                if (typeof markSectionDirty === 'function') {
                    markSectionDirty('goals');
                    markSectionDirty('timeline');
                } else if (typeof window.markSectionDirty === 'function') {
                    window.markSectionDirty('goals');
                    window.markSectionDirty('timeline');
                }
            } else if (editType === 'name' || editType === 'title') {
                if (typeof markSectionDirty === 'function') {
                    markSectionDirty('goals');
                    markSectionDirty('todo');
                    markSectionDirty('timeline');
                } else if (typeof window.markSectionDirty === 'function') {
                    window.markSectionDirty('goals');
                    window.markSectionDirty('todo');
                    window.markSectionDirty('timeline');
                }
            } else {
                deps.renderSingleGoal(goal.id);
            }
        }
    }
};
window.GoalInlineEditService = GoalInlineEditService;
