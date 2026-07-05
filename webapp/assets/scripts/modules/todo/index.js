export const Todo = {
    Renderer: TodoRenderer,
    _completedCollapsed: true,
    _keydownBound: false,

    render(data) {
        TodoRenderer.render(data);
        this._syncCollapsedState();
    },

    _syncCollapsedState() {
        const group = document.getElementById('todoCompletedGroup');
        if (group) {
            group.classList.toggle('collapsed', this._completedCollapsed);
        }
    },

    toggle(todoId, type, goalId, itemIdx, isCompleted) {
        TodoService.toggle(todoId, type, goalId, itemIdx, isCompleted);
    },

    toggleCompletedGroup() {
        this._completedCollapsed = !this._completedCollapsed;
        const group = document.getElementById('todoCompletedGroup');
        if (group) {
            group.classList.toggle('collapsed', this._completedCollapsed);
        }
    }
};

window.Todo = Todo;
