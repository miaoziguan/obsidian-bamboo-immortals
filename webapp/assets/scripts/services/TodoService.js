export const TodoService = {
    /** 切换目标子任务的完成状态 */
    async toggle(todoId, type, goalId, itemIdx, isCompleted) {
        await GoalService.completeGoalTask(goalId, parseInt(itemIdx), store.getDateKey(), isCompleted);
        markSectionDirty('goals');
        markSectionDirty('timeline');
        // todo 优先走局部差异更新（避免整块重建）；结构性变化或异常时自动回退全量
        let patched = false;
        if (typeof TodoRenderer !== 'undefined' && typeof TodoRenderer.patchToggle === 'function') {
            patched = TodoRenderer.patchToggle(todoId);
        }
        if (!patched) {
            markSectionDirty('todo');
        }
        if (!isCompleted && navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
};

window.TodoService = TodoService;
