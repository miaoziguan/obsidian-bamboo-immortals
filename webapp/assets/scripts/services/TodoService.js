export const TodoService = {
    /** 切换目标子任务的完成状态 */
    async toggle(todoId, type, goalId, itemIdx, isCompleted) {
        await GoalService.completeGoalTask(goalId, parseInt(itemIdx), store.getDateKey(), isCompleted);
        renderAll();
        if (!isCompleted && navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
};

window.TodoService = TodoService;
