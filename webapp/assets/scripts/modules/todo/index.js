import { byId } from '../../utils/domRef.js';
export const Todo = {
    Renderer: TodoRenderer,
    _completedCollapsed: true,
    _keydownBound: false,

    init() {},

    render(data) {
        TodoRenderer.render(data);
        this._syncCollapsedState();
    },

    _syncCollapsedState() {
        const group = byId('todoCompletedGroup');
        if (group) {
            group.classList.toggle('collapsed', this._completedCollapsed);
        }
    },

    toggle(todoId, type, goalId, itemIdx, isCompleted) {
        TodoService.toggle(todoId, type, goalId, itemIdx, isCompleted);
    },

    toggleCompletedGroup() {
        this._completedCollapsed = !this._completedCollapsed;
        const group = byId('todoCompletedGroup');
        if (group) {
            group.classList.toggle('collapsed', this._completedCollapsed);
        }
    }
};

window.Todo = Todo;
