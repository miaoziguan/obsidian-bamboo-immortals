import { byId } from '../../utils/domRef.js';
export const TodoRenderer = {
    _lastSnapshot: null,

    _snapshot(data) {
        let goalTasks = [];
        if (typeof GoalsRenderer !== 'undefined') {
            goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
        }
        // 轻量指纹替代全量 JSON.stringify：拼接影响渲染输出的关键字段，
        // 减少每次 render 的序列化开销。goalTasks 本身有缓存（引用稳定），
        // 仅当 goals/completions 变化时内容才会变，指纹随之变化触发重渲染。
        let hash = goalTasks.length + '|';
        for (let i = 0; i < goalTasks.length; i++) {
            const g = goalTasks[i];
            hash += g.id + ':' + (g.completed ? '1' : '0') + ':' + g.currentValue + ':' + g.dailyMin + ';';
        }
        // 目标名称/聚焦指纹：目标数据常晚于任务加载（store 初始化时序），
        // 若仅按任务数判等，会出现「首次渲染时目标未就绪 → 聚焦下拉未生成 →
        // 后续目标就绪但快照相同被跳过 → 下拉永久缺失」。把目标 id:name 纳入指纹，
        // 目标从空/未命名变为就绪即触发重渲染，确保聚焦下拉在目标数据到位后出现。
        if (typeof store !== 'undefined' && store.getGlobalGoals) {
            const goals = store.getGlobalGoals();
            hash += '#G' + goals.length + '|';
            for (let gi = 0; gi < goals.length; gi++) {
                const g = goals[gi];
                hash += g.id + ':' + (g.name || g.title || '') + ';';
            }
        }
        // 当前聚焦目标也纳入指纹：切换聚焦时应重渲染列表
        if (typeof Todo !== 'undefined' && Todo.getFocusGoalId) {
            hash += '#F' + (Todo.getFocusGoalId() || '');
        }
        return hash;
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

    /**
     * 勾选/取消单个待办后的局部差异更新。
     * 只更新统计数字、进度条、单行状态并移动到正确分组，
     * 避免整块 #todoContent 的 innerHTML 重建。
     * 任何无法可靠局部化的结构性变化（组新建/移除、DOM 缺失）→ 返回 false，
     * 由调用方回退到全量重建，保证 UI 一致性。
     * @returns {boolean} true=局部更新成功，false=需回退全量
     */
    patchToggle(todoId) {
        try {
            const container = byId('todoContent');
            if (!container) return false;

            let goalTasks = [];
            if (typeof GoalsRenderer !== 'undefined') {
                goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
            }
            if (goalTasks.length === 0) return false; // 空态结构简单，直接回退全量

            const todo = goalTasks.find(g => g.id === todoId);
            if (!todo) return false;

            const row = container.querySelector(`.todo-item[data-todo-id="${todoId}"]`);
            if (!row) return false;

            const isCompleted = !!todo.completed;
            const pending = goalTasks.filter(t => !t.completed);
            const completed = goalTasks.filter(t => t.completed);
            const completedCount = completed.length;
            const totalCount = goalTasks.length;
            const progressPercent = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;

            // ── 1. 统计数字 + 进度条（纯文本/宽度，零结构风险）──
            const countEl = byId('todoCount');
            if (countEl) countEl.textContent = `${completedCount}/${totalCount}`;
            const statNums = container.querySelectorAll('.todo-stat-num');
            if (statNums.length >= 3) {
                statNums[0].textContent = String(pending.length);
                statNums[1].textContent = String(completed.length);
                statNums[2].textContent = progressPercent + '%';
            }
            const fill = container.querySelector('.todo-progress-fill');
            if (fill) fill.style.width = `${progressPercent}%`;
            // 各分组标题里的数字：pending 组 badge / completed 组 (N)
            const pendingBadge = container.querySelector('.todo-group-goal .todo-group-badge');
            if (pendingBadge) pendingBadge.textContent = String(pending.length);
            const completedCountEl = container.querySelector('.todo-group-completed .todo-completed-count');
            if (completedCountEl) completedCountEl.textContent = String(completed.length);

            // ── 2. 判断是否需要跨组移动 ──
            // 目标组：勾选→completed 组；取消→pending 组
            const targetGroupSel = isCompleted ? '.todo-group-completed' : '.todo-group-goal';
            const srcGroupSel = isCompleted ? '.todo-group-goal' : '.todo-group-completed';
            const targetGroup = container.querySelector(targetGroupSel);
            const targetItems = targetGroup ? targetGroup.querySelector('.todo-group-items') : null;
            const srcItems = container.querySelector(`${srcGroupSel} .todo-group-items`);

            // 目标组不存在（completed 0→1 或 pending 0→1）→ 结构性变化，回退全量
            if (!targetGroup || !targetItems) return false;
            // 源组不存在（源组只剩这一项时移动后组应移除）→ 结构性变化，回退全量
            if (!srcItems || srcItems.children.length <= 1) return false;

            // ── 3. 更新行状态 ──
            row.classList.toggle('todo-item-completed', isCompleted);
            const cb = row.querySelector('.todo-checkbox');
            if (cb) {
                cb.classList.toggle('checked', isCompleted);
                cb.setAttribute('data-is-completed', String(isCompleted));
                cb.setAttribute('aria-label', isCompleted ? '标记为未完成' : '标记为已完成');
                cb.innerHTML = isCompleted ? LucideUtils.createIcon('check', { size: 9 }) : '';
            }

            // ── 4. 跨组移动行 ──
            srcItems.removeChild(row);
            targetItems.appendChild(row);

            // ── 5. 同步折叠/聚焦状态 ──
            if (typeof Todo !== 'undefined' && typeof Todo._syncCollapsedState === 'function') {
                Todo._syncCollapsedState();
            }

            // ── 6. 更新快照，避免后续 render 误判为「未变化」跳过 ──
            this._lastSnapshot = this._snapshot();
            return true;
        } catch (e) {
            // 任何异常都回退全量，绝不留下不一致的 UI
            return false;
        }
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

        // 单目标聚焦下拉：有待选任务且涉及多个目标时显示
        const focusSelectHtml = this.renderFocusSelect(pending);

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
                        ${focusSelectHtml}
                        <button class="todo-lottery-btn" data-action="todo-lottery-start"
                                title="随机抽选一个任务来执行"
                                aria-label="任务抽签">
                            ${LucideUtils.createIcon('dice5', { size: 16 })}
                        </button>
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
                            已完成 (<span class="todo-completed-count">${completed.length}</span>)
                        </div>
                    </div>
                    <div class="todo-group-items">
                        ${completed.map((todo, idx) => this.renderTodoItem(todo, idx, true)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    },

    renderFocusSelect(pendingTasks) {
        const tasks = pendingTasks || [];
        if (tasks.length === 0) return '';

        // 从实际待选任务反推涉及的目标（含已归档目标——它的任务此刻也在列表里，
        // 否则按 archived 过滤会把「归档但仍今日有任务」的目标漏掉，下拉消失）。
        const goalMap = new Map();
        for (const t of tasks) {
            if (!t.goalId || goalMap.has(t.goalId)) continue;
            let name = t.goalId;
            if (typeof store !== 'undefined' && store.getGlobalGoals) {
                const g = store.getGlobalGoals().find(gg => gg.id === t.goalId);
                if (g) name = g.name || g.title || t.goalId;
                else if (t.description) name = t.description.replace(/^\S+\s/, '');
            } else if (t.description) {
                name = t.description.replace(/^\S+\s/, '');
            }
            goalMap.set(t.goalId, name);
        }

        const current = (typeof Todo !== 'undefined' && Todo.getFocusGoalId)
            ? Todo.getFocusGoalId() : null;
        const currentLabel = current && goalMap.has(current)
            ? goalMap.get(current)
            : '全部目标';

        const menuItems = [`<div class="todo-focus-item${current ? '' : ' active'}" data-action="todo-focus-item" data-goal-id="">全部目标</div>`].concat(
            Array.from(goalMap.entries()).map(([gid, name]) => {
                const act = (gid === current) ? ' active' : '';
                return `<div class="todo-focus-item${act}" data-action="todo-focus-item" data-goal-id="${escapeHtml(gid)}">${escapeHtml(name)}</div>`;
            })
        ).join('');

        return `
            <div class="todo-focus-wrap" data-action="todo-focus-toggle" title="聚焦单个目标，随机抽签只在该目标内抽取">
                <span class="focus-current-label">${escapeHtml(currentLabel)}</span>
                <div class="todo-focus-menu" role="listbox">
                    ${menuItems}
                </div>
            </div>
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
    'todo-toggle': (data) => { Todo.toggle(data.todoId, data.type, data.goalId, data.itemIdx, data.isCompleted === 'true'); },
    'todo-toggle-completed-group': () => Todo.toggleCompletedGroup(),
    'todo-lottery-start': () => { console.log('[抽签] 骰子按钮被点击'); Todo.startLottery(); },
    'todo-lottery-start-task': (data) => Todo.startLotteryTask(data.todoId)
});

window.TodoRenderer = TodoRenderer;
