import { byId } from '../utils/domRef.js';

export const TodoService = {
    /** 切换目标子任务的完成状态 */
    async toggle(todoId, type, goalId, itemIdx, isCompleted) {
        // 注意：第 5 参数 isCompleted 此处表示「目标态是否要变为完成」，
        // completeGoalTask 的第 4 参数 isUncompleting 语义相反，需取反。
        await GoalService.completeGoalTask(goalId, parseInt(itemIdx), store.getDateKey(), !isCompleted);
        markSectionDirty('timeline');
        // todo 优先走局部差异更新（避免整块重建）；结构性变化或异常时自动回退全量
        let patched = false;
        if (typeof TodoRenderer !== 'undefined' && typeof TodoRenderer.patchToggle === 'function') {
            patched = TodoRenderer.patchToggle(todoId);
        }
        if (!patched) {
            markSectionDirty('todo');
        }
        // goals 优先走局部更新：仅重建被勾选目标行 + 刷新健康分（避免整块重建）
        const goalsPatched = this._patchGoals(goalId);
        if (!goalsPatched) {
            markSectionDirty('goals');
        }
        if (!isCompleted && navigator.vibrate) {
            navigator.vibrate(30);
        }
    },

    /**
     * goals 局部差异更新：复用 GoalsRenderer 现成的 renderSingleGoal + refreshHealthCard，
     * 只更新被勾选目标的目标行与健康分卡片，避免整块 #goalList 重建。
     * 目标行未渲染/不存在或异常时返回 false，由调用方回退全量。
     * @returns {boolean} true=局部更新成功，false=需回退全量
     */
    _patchGoals(goalId) {
        try {
            if (typeof GoalsRenderer === 'undefined') return false;
            const container = byId('goalList');
            if (!container) return false;
            if (!container.querySelector(`.goal-row[data-goal-id="${goalId}"]`)) return false;
            GoalsRenderer.renderSingleGoal(goalId);
            if (typeof GoalsRenderer.refreshHealthCard === 'function') {
                GoalsRenderer.refreshHealthCard();
            }
            return true;
        } catch (e) {
            return false;
        }
    }
};

window.TodoService = TodoService;
