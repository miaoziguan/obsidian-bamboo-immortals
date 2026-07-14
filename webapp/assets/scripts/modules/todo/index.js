import { byId, getDomRoot } from '../../utils/domRef.js';
import { Toast } from '../../utils/toast.js';
export const Todo = {
    Renderer: TodoRenderer,
    _completedCollapsed: true,
    _keydownBound: false,
    
    // 抽签状态
    _isSpinning: false,
    _getMaxDraws() {
        return this._getPendingTasks().length;
    },
    _pickedTaskId: null,

    init() {},

    render(data) {
        TodoRenderer.render(data);
        this._syncCollapsedState();
        this._restoreFocusState();
    },

    _syncCollapsedState() {
        const group = byId('todoCompletedGroup');
        if (group) {
            group.classList.toggle('collapsed', this._completedCollapsed);
        }
    },

    toggle(todoId, type, goalId, itemIdx, isCompleted) {
        TodoService.toggle(todoId, type, goalId, itemIdx, isCompleted);
        // 如果勾选的是当前聚焦任务，自动清除聚焦态
        const today = store ? store.getDateKey() : '';
        const focusedId = today && typeof StorageAdapter !== 'undefined' ? StorageAdapter.get('bamboo_focus_' + today) : null;
        if (focusedId === todoId) {
            this._clearFocusState();
        }
    },

    toggleCompletedGroup() {
        this._completedCollapsed = !this._completedCollapsed;
        const group = byId('todoCompletedGroup');
        if (group) {
            group.classList.toggle('collapsed', this._completedCollapsed);
        }
    },

    /* ========== 任务抽签 ========== */
    
    _getPendingTasks() {
        if (typeof GoalsRenderer === 'undefined') return [];
        const goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
        return goalTasks.filter(t => !t.completed && !t.isArchived);
    },

    _cleanupLotteryUI() {
        // 移除所有动画状态
        const root = getDomRoot();
        const container = root.querySelector('.todo-group-goal');
        if (!container) return;
        
        const spinningItems = container.querySelectorAll('.todo-item-lottery-spinning, .todo-item-lottery-picked');
        spinningItems.forEach(el => {
            el.classList.remove('todo-item-lottery-spinning', 'todo-item-lottery-picked');
            // 防御：抽中后未点行就再抽时，清除残留的 data-action
            if (el.dataset.action === 'todo-lottery-start-task') {
                el.removeAttribute('data-action');
            }
        });

        // 同时清理聚焦态
        this._clearFocusState();
    },

    _clearFocusState() {
        const root = getDomRoot();
        const focused = root.querySelectorAll('.todo-item-lottery-focus');
        focused.forEach(el => el.classList.remove('todo-item-lottery-focus'));
        
        const today = store ? store.getDateKey() : '';
        if (today && typeof StorageAdapter !== 'undefined') {
            StorageAdapter.remove('bamboo_focus_' + today);
        }
    },

    _focusTask(todoId) {
        const today = store ? store.getDateKey() : '';
        if (today && typeof StorageAdapter !== 'undefined') {
            StorageAdapter.set('bamboo_focus_' + today, todoId);
        }
        const root = getDomRoot();
        const el = root.querySelector(`.todo-group-goal .todo-item[data-todo-id="${todoId}"]`);
        if (el) {
            el.classList.remove('todo-item-lottery-picked');
            el.removeAttribute('data-action');   // 进入聚焦态后，行不再响应「开始做」
            el.classList.add('todo-item-lottery-focus');
        }
    },

    _restoreFocusState() {
        const today = store ? store.getDateKey() : '';
        if (!today) return;
        const focusedId = typeof StorageAdapter !== 'undefined' ? StorageAdapter.get('bamboo_focus_' + today) : null;
        if (!focusedId) return;

        const root = getDomRoot();
        const el = root.querySelector(`.todo-group-goal .todo-item[data-todo-id="${focusedId}"]`);
        if (el) {
            el.classList.add('todo-item-lottery-focus');
        }
    },

    _generateSpinSequence(itemCount, totalDuration) {
        // 从快到慢递减：~55ms 起始 → ~260ms 收尾
        const sequence = [];
        let elapsed = 0;
        let delay = 55;

        while (elapsed < totalDuration) {
            sequence.push(Math.round(delay));
            elapsed += delay;
            delay = Math.min(260, delay * 1.13);
        }
        
        return sequence;
    },

    _animateLottery(items, pickedIndex) {
        const spins = this._generateSpinSequence(items.length, 1600);
        const root = getDomRoot();
        
        let step = 0;
        const tick = () => {
            // 清除上一个高亮
            if (step > 0) {
                const prevIdx = (step - 1) % items.length;
                items[prevIdx].classList.remove('todo-item-lottery-spinning');
            }
            
            if (step < spins.length) {
                const curIdx = step % items.length;
                items[curIdx].classList.add('todo-item-lottery-spinning');
                step++;
                setTimeout(tick, spins[step - 1]);
            } else {
                // 动画结束，停在选中项
                const lastIdx = (step - 1) % items.length;
                if (items[lastIdx]) {
                    items[lastIdx].classList.remove('todo-item-lottery-spinning');
                }
                // 确保停在正确位置（如果动画路径刚好落在选中项上就用它，否则到选中项）
                const picked = items[pickedIndex];
                items.forEach(el => el.classList.remove('todo-item-lottery-spinning'));
                picked.classList.add('todo-item-lottery-picked');
                
                this._markPicked(picked);
                this._isSpinning = false;
                
                // 恢复骰子按钮
                const diceBtn = root.querySelector('.todo-lottery-btn');
                if (diceBtn) diceBtn.disabled = false;
            }
        };
        
        tick();
    },

    _markPicked(pickedEl) {
        // 整行可点 = 「开始做」；checkbox 自带 data-action=todo-toggle，机制天然隔离两者
        pickedEl.setAttribute('data-action', 'todo-lottery-start-task');
        pickedEl.classList.add('todo-item-lottery-picked');
    },

    _getDrawCount() {
        const today = store ? store.getDateKey() : '';
        return today ? parseInt((typeof StorageAdapter !== 'undefined' ? StorageAdapter.get('bamboo_lottery_' + today, '0') : '0'), 10) || 0 : 0;
    },

    _incDrawCount() {
        const today = store ? store.getDateKey() : '';
        if (!today) return;
        const cnt = this._getDrawCount() + 1;
        if (typeof StorageAdapter !== 'undefined') StorageAdapter.set('bamboo_lottery_' + today, String(cnt));
    },

    startLottery() {
        if (this._isSpinning) return;

        // [DEV] 暂禁上限：开发期间不限次数
        // if (this._getDrawCount() >= this._getMaxDraws()) {
        //     Toast.showToast('今日签运已尽，先把手头的事收了吧', 'warning');
        //     return;
        // }

        try {
            const pending = this._getPendingTasks();
            
            if (pending.length === 0) { console.log('[抽签] 无待选任务'); return; }

            const root = getDomRoot();
            // 清理上一轮
            this._cleanupLotteryUI();
            
            // 获取当前 DOM 中的待办项
            const items = Array.from(root.querySelectorAll('.todo-group-goal .todo-group-items .todo-item'));
            if (items.length === 0) { console.log('[抽签] DOM 中无 .todo-item 元素'); return; }
            
            // 确保 items 与 pending 对齐（按 DOM 顺序）
            const validItems = items.filter(el => {
                const id = el.dataset.todoId;
                return pending.some(t => t.id === id);
            });
            
            if (validItems.length === 0) { console.log('[抽签] 无有效待办项匹配'); return; }
            
            this._incDrawCount();
            this._isSpinning = true;
            
            // 抽签期间禁用骰子按钮
            const diceBtn = root.querySelector('.todo-lottery-btn');
            if (diceBtn) diceBtn.disabled = true;
            
            if (validItems.length === 1) {
                // 只有一个候选，直接高亮
                validItems[0].classList.add('todo-item-lottery-picked');
                this._pickedTaskId = validItems[0].dataset.todoId;
                this._markPicked(validItems[0]);
                this._isSpinning = false;
                if (diceBtn) diceBtn.disabled = false;
                return;
            }
            
            // 随机选中
            const pickedIndex = Math.floor(Math.random() * validItems.length);
            this._pickedTaskId = validItems[pickedIndex].dataset.todoId;
            this._animateLottery(validItems, pickedIndex);
        } catch (e) {
            console.error('[抽签] 异常:', e);
            this._isSpinning = false;
            const diceBtn = getDomRoot().querySelector('.todo-lottery-btn');
            if (diceBtn) diceBtn.disabled = false;
        }
    },

    startLotteryTask(todoId) {
        // 「开始做」不直接勾掉，而是进入聚焦态
        this._focusTask(todoId);
    },

};

window.Todo = Todo;
