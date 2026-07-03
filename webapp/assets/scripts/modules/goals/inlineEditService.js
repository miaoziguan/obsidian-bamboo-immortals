/**
 * GoalInlineEditService — 目标行内编辑提交逻辑
 * 从 GoalsRenderer._commitInlineEdit 中抽取，与渲染层解耦。
 * 
 * 只负责「修改 goal/items 数据 + 调 store 持久化」，不触碰 DOM。
 */
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
                        delete item.manuallySetDate;
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
                    if (!isNaN(newTarget) && newTarget > 0) {
                        const start = parseFloat(item.startValue) || 0;
                        if (newTarget !== start) {
                            item.targetValue = String(newTarget);
                            const current = parseFloat(item.currentValue) || start;
                            item.percent = Math.min(100, Math.max(0, Math.round((Math.abs(current - start) / Math.abs(newTarget - start)) * 100)));
                            delete item.manuallySetDate;
                            deps.autoCalcEndDate(item);
                            deps.autoCalcGoalDateRange(goal);
                            changed = true;
                        } else {
                            Toast.showToast('目标值不能等于起始值', 'error');
                        }
                    }
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
            if (editType === 'category' || editType === 'priority' || editType === 'name' || editType === 'title') {
                if (typeof renderAll === 'function') renderAll();
            } else {
                deps.renderSingleGoal(goal.id);
            }
        }
    }
};
window.GoalInlineEditService = GoalInlineEditService;
