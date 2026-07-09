import { byId } from '../../utils/domRef.js';
export const TodoRenderer = {
    _lastSnapshot: null,

    _snapshot(data) {
        let goalTasks = [];
        if (typeof GoalsRenderer !== 'undefined') {
            goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
        }
        return JSON.stringify({
            g: goalTasks.map(g => ({ i: g.id, ti: g.title, de: g.description, c: g.completed, dm: g.dailyMin, inc: g.incrementValue, cv: g.currentValue, tv: g.targetValue, hv: g.hasValues, ar: g.isArchived }))
        });
    },

    _shouldSkipRender(data) {
        const snap = this._snapshot(data);
        if (snap === this._lastSnapshot) return true;
        this._lastSnapshot = snap;
        return false;
    },

    _invalidateCache() {
        this._lastSnapshot = null;
    },

    render(data) {
        const container = byId('todoContent');
        if (!container) return;

        if (this._shouldSkipRender(data)) return;
        
        let goalTasks = [];
        if (typeof GoalsRenderer !== 'undefined') {
            goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
        }
        
        const completedCount = goalTasks.filter(t => t.completed).length;
        const totalCount = goalTasks.length;

        const countEl = byId('todoCount');
        if (countEl) countEl.textContent = `${completedCount}/${totalCount}`;

        if (goalTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-icon">
                        ${LucideUtils.createIcon('target', { size: 48, strokeWidth: 1.5 })}
                    </div>
                    <div class="empty-state-title">今日目标任务</div>
                    <div class="empty-state-desc">在目标管理中设置每日任务</div>
                    <div class="empty-state-hint">前往目标页面添加任务</div>
                </div>
            `;
            return;
        }

        const pending = goalTasks.filter(t => !t.completed);
        const completed = goalTasks.filter(t => t.completed);

        container.innerHTML = `
            <div class="todo-stats">
                <div class="todo-stat-item">
                    <span class="todo-stat-num">${pending.length}</span>
                    <span class="todo-stat-label">待完成</span>
                </div>
                <div class="todo-stat-item">
                    <span class="todo-stat-num">${completed.length}</span>
                    <span class="todo-stat-label">已完成</span>
                </div>
                <div class="todo-stat-item">
                    <span class="todo-stat-num">${totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0}%</span>
                    <span class="todo-stat-label">完成率</span>
                </div>
            </div>
            <div class="todo-progress-bar">
                <div class="todo-progress-fill" style="width: ${totalCount > 0 ? (completedCount / totalCount * 100) : 0}%"></div>
            </div>
            ${pending.length > 0 ? `
                <div class="todo-group todo-group-goal">
                    <div class="todo-group-header">
                        <div class="todo-group-label">
                            ${LucideUtils.createIcon('target', { size: 16 })}
                            <span>目标任务</span>
                            <span class="todo-group-badge">${pending.length}</span>
                        </div>
                    </div>
                    <div class="todo-group-items">
                        ${pending.map((todo, idx) => this.renderTodoItem(todo, idx, false)).join('')}
                    </div>
                </div>
            ` : ''}
            ${completed.length > 0 ? `
                <div class="todo-group todo-group-completed collapsed" id="todoCompletedGroup">
                    <div class="todo-group-header">
                        <div class="todo-group-label" data-action="todo-toggle-completed-group">
                            <span class="todo-group-chevron">${LucideUtils.createIcon('chevronDown', { size: 14 })}</span>
                            <span class="completed-label">${LucideUtils.createIcon('checkCircle', { size: 14 })}</span>
                            已完成 (${completed.length})
                        </div>
                    </div>
                    <div class="todo-group-items">
                        ${completed.map((todo, idx) => this.renderTodoItem(todo, idx, true)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    },

    renderTodoItem(todo, index, isCompleted) {
        const completedClass = isCompleted ? 'todo-item-completed' : '';
        const goalTaskClass = 'todo-item-goal';
        const archivedClass = todo.isArchived ? 'todo-item-archived' : '';
        
        let goalMetaLabel = '';
        if (todo.isArchived) {
            goalMetaLabel = `<span class="todo-goal-archived">已归档</span>`;
        }
        if (todo.dailyMin > 0) {
            goalMetaLabel += `<span class="todo-goal-daily">每日${todo.dailyMin}</span>`;
        } else if (todo.hasValues && todo.incrementValue > 0) {
            goalMetaLabel += `<span class="todo-goal-daily">+${todo.incrementValue}</span>`;
        }
        if (todo.hasValues) {
            goalMetaLabel += `<span class="todo-goal-progress">${todo.currentValue}/${todo.targetValue}</span>`;
        }
        if (todo.description) {
            goalMetaLabel += `<span class="todo-goal-source" title="${escapeHtml(todo.description)}">${escapeHtml(todo.description.length > 10 ? todo.description.slice(0, 10) + '…' : todo.description)}</span>`;
        }

        return `
            <div class="todo-item ${completedClass} ${goalTaskClass} ${archivedClass}" data-todo-index="${index}" data-todo-id="${escapeHtml(todo.id)}" data-todo-type="goal_task">
                <button class="todo-checkbox ${isCompleted ? 'checked' : ''}" 
                        data-action="todo-toggle" data-todo-id="${todo.id}" data-type="goal_task" data-goal-id="${todo.goalId || ''}" data-item-idx="${todo.itemIdx || ''}" data-is-completed="${isCompleted}"
                        aria-label="${isCompleted ? '标记为未完成' : '标记为已完成'}">
                    ${isCompleted ? LucideUtils.createIcon('check', { size: 9 }) : ''}
                </button>
                <div class="todo-content">
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ''}
                </div>
                <div class="todo-meta">
                    ${goalMetaLabel}
                </div>
            </div>
        `;
    }
};

ActionDispatcher.registerMany({
    'todo-toggle': (data) => Todo.toggle(data.todoId, data.type, data.goalId, data.itemIdx, data.isCompleted === 'true'),
    'todo-toggle-completed-group': () => Todo.toggleCompletedGroup()
});

window.TodoRenderer = TodoRenderer;
