export const Todo = {
    Renderer: TodoRenderer,
    _completedCollapsed: true,
    _keydownBound: false,
    _eventUnsubs: [],

    init() {
        this._bindServiceEvents();
    },

    render(data) {
        TodoRenderer.render(data);
        // 渲染后恢复用户的折叠/展开偏好
        this._syncCollapsedState();
    },

    _syncCollapsedState() {
        const group = document.getElementById('todoCompletedGroup');
        if (group) {
            group.classList.toggle('collapsed', this._completedCollapsed);
        }
    },

    _bindServiceEvents() {
        if (typeof EventBus === 'undefined') return;
        this._eventUnsubs.push(
            EventBus.on('todo:toggled', (payload) => {
                if (payload && !payload.wasCompleted && payload.isNowCompleted) {
                    this._animateJustCompleted(payload.todoId);
                }
            })
        );
    },

    _animateJustCompleted(todoId) {
        requestAnimationFrame(() => {
            const el = document.querySelector(`[data-todo-id="${CSS.escape(todoId)}"]`);
            if (el) {
                el.classList.add('just-completed');
                el.addEventListener('animationend', () => el.classList.remove('just-completed'), { once: true });
            }
        });
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
    },

    destroy() {
        if (this._eventUnsubs) {
            this._eventUnsubs.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
            this._eventUnsubs = [];
        }
    }
};

window.Todo = Todo;
