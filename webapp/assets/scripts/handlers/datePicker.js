import { byId } from '../utils/domRef.js';
import { formatDate } from '../utils/dateUtils.js';
/**
 * DatePicker - 日期选择器面板
 * 使用 PanelManager 实现与竹林商店一致的 fab-panel 风格
 */
window.DatePicker = {
    _currentYear: 0,
    _currentMonth: 0,
    _datesWithTasks: null, // 缓存有任务的日期

    open() {
        const { currentDate } = store.getState();
        this._currentYear = currentDate.getFullYear();
        this._currentMonth = currentDate.getMonth();
        this._kbdCursor = null;   // 【P1-1】每次打开重置键盘游标（roving tabindex 从选中日开始）

        // 获取有任务的日期列表
        this._datesWithTasks = this._getDatesWithTasks();

        const today = new Date();

        const content = `
            <div class="wn-section">
                <div class="wn-date-header">
                    <button class="wn-date-nav" data-action="calendar-prev-month" aria-label="上一月">
                        ${LucideUtils.createIcon('chevronLeft', { size: 16 })}
                    </button>
                    <span class="wn-date-title" id="calendarMonth">${this._currentYear}年${this._currentMonth + 1}月</span>
                    <button class="wn-date-nav" data-action="calendar-next-month" aria-label="下一月">
                        ${LucideUtils.createIcon('chevronRight', { size: 16 })}
                    </button>
                </div>
                <div class="wn-date-weekdays" role="row" aria-label="星期标题">
                    <span role="columnheader">日</span>
                    <span role="columnheader">一</span>
                    <span role="columnheader">二</span>
                    <span role="columnheader">三</span>
                    <span role="columnheader">四</span>
                    <span role="columnheader">五</span>
                    <span role="columnheader">六</span>
                </div>
                <div class="wn-date-grid" id="calendarDays" role="grid" aria-label="日历网格">
                    ${this._generateCalendarDays()}
                </div>
            </div>
            
            <div class="wn-section">
                <div style="display: flex; gap: 6px;" role="group" aria-label="快捷日期选择">
                    <button class="wn-type-btn" data-action="quick-select-date" data-date="${HTMLUtils.escapeHtmlAttr(this._formatDate(this._addDays(today, -7)))}" data-label="上周" aria-label="跳转到上周">
                        ${LucideUtils.createIcon('chevronLeft', { size: 14 })}
                        <span>上周</span>
                    </button>
                    <button class="wn-type-btn active" data-action="quick-select-date" data-date="${HTMLUtils.escapeHtmlAttr(this._formatDate(today))}" data-label="今天" aria-label="跳转到今天">
                        ${LucideUtils.createIcon('calendar', { size: 14 })}
                        <span>今天</span>
                    </button>
                    <button class="wn-type-btn" data-action="quick-select-date" data-date="${HTMLUtils.escapeHtmlAttr(this._formatDate(this._addDays(today, 7)))}" data-label="下周" aria-label="跳转到下周">
                        ${LucideUtils.createIcon('chevronRight', { size: 14 })}
                        <span>下周</span>
                    </button>
                </div>
            </div>
        `;

        // 使用 PanelManager 打开面板，与竹林商店风格一致
        PanelManager.open('date-picker', LucideUtils.createIcon('calendar', { size: 16 }) + '选择日期', content);
    },

    _formatDate(date) {
        // 委托 utils/dateUtils.formatDate（唯一实现）；顺带获得「非法输入 → ''」守卫
        return formatDate(date);
    },

    _addDays(date, days) {
        const result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    },

    /**
     * 获取有任务/活动的日期列表
     * 用于在日历上显示标记点
     */
    _getDatesWithTasks() {
        const datesWithTasks = new Set();
        const state = store.getState();
        
        // 检查所有日期数据
        if (state.data) {
            Object.keys(state.data).forEach(dateKey => {
                const dayData = state.data[dateKey];
                // 检查是否有时间线事件或目标任务完成记录
                const hasTimeline = dayData.timeline && dayData.timeline.length > 0;
                const hasGoalTasks = dayData.goalTaskCompletions && 
                    Object.keys(dayData.goalTaskCompletions).length > 0;
                
                if (hasTimeline || hasGoalTasks) {
                    datesWithTasks.add(dateKey);
                }
            });
        }
        
        return datesWithTasks;
    },

    _generateCalendarDays() {
        const firstDay = new Date(this._currentYear, this._currentMonth, 1);
        const lastDay = new Date(this._currentYear, this._currentMonth + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        const today = new Date();
        const todayStr = this._formatDate(today);
        
        const { currentDate } = store.getState();
        const currentStr = this._formatDate(currentDate);
        
        let html = '';
        
        for (let i = 0; i < startDay; i++) {
            html += '<div class="wn-date-day wn-date-empty" role="gridcell" aria-hidden="true"></div>';
        }
        
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = this._formatDate(new Date(this._currentYear, this._currentMonth, day));
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === currentStr;
            const hasTask = this._datesWithTasks && this._datesWithTasks.has(dateStr);
            
            // 生成tooltip内容
            let tooltipText = `${this._currentYear}年${this._currentMonth + 1}月${day}日`;
            if (hasTask) {
                tooltipText += ' - 有任务记录';
            }
            if (isToday) {
                tooltipText += ' - 今天';
            }
            if (isSelected) {
                tooltipText += ' - 当前选中';
            }
            
            html += `
                <div class="wn-date-day ${isToday ? 'wn-date-today' : ''} ${isSelected ? 'wn-date-selected' : ''} ${hasTask ? 'wn-date-has-task' : ''}"
                     data-action="quick-select-date" 
                     data-date="${HTMLUtils.escapeHtmlAttr(dateStr)}" 
                     data-label="${num(this._currentYear)}年${this._currentMonth + 1}月${num(day)}日"
                     role="gridcell"
                     aria-label="${HTMLUtils.escapeHtmlAttr(tooltipText)}"
                     tabindex="${(this._kbdCursor || currentStr) === dateStr ? '0' : '-1'}"
                     title="${HTMLUtils.escapeHtmlAttr(tooltipText)}">
                    <span class="wn-date-num">${day}</span>
                    ${hasTask ? '<span class="wn-date-dot" aria-hidden="true"></span>' : ''}
                </div>
            `;
        }
        
        return html;
    },

    _updateCalendar(direction) {
        if (direction === 'prev') {
            if (this._currentMonth === 0) {
                this._currentMonth = 11;
                this._currentYear--;
            } else {
                this._currentMonth--;
            }
        } else {
            if (this._currentMonth === 11) {
                this._currentMonth = 0;
                this._currentYear++;
            } else {
                this._currentMonth++;
            }
        }
        
        const calendarDays = byId('calendarDays');
        const calendarMonth = byId('calendarMonth');
        
        if (calendarDays) {
            calendarDays.innerHTML = this._generateCalendarDays();
        }
        
        if (calendarMonth) {
            calendarMonth.textContent = `${this._currentYear}年${this._currentMonth + 1}月`;
        }
    },

    quickSelect(dateStr, label) {
        // 面板里已不存在日期输入框（模板只剩 calendarDays / calendarMonth），
        // 原先回填 byId('date-picker-input') 的两处读写均已移除。
        const [y, m, d] = dateStr.split('-').map(Number);
        const newDate = new Date(y, m - 1, d);
        
        if (!this._validateDate(newDate)) {
            Toast.showToast('日期无效', 'error');
            return;
        }
        
        const { currentDate } = store.getState();
        const direction = newDate >= currentDate ? 1 : -1;
        RenderScheduler.startDateTransition(direction, () => {
            store.goToDate(newDate);
            renderDate();
            markSectionDirty('timeline');
            markSectionDirty('todo');
        });
        PanelManager.close();
    },

    // 说明：原有 goToSelectedDate（读取 byId('date-picker-input') 的输入框值跳转）已删除。
    // 该输入框在面板模板里已不存在（模板只剩 calendarDays / calendarMonth），
    // 方法体恒在首个 if 处提前 return（Toast + return），是完整的死逻辑；
    // 跳转能力由 quickSelect（日历格点击）与 goToToday 承担。



    goToToday() {
        const today = new Date();
        const { currentDate } = store.getState();
        const direction = today >= currentDate ? 1 : -1;
        RenderScheduler.startDateTransition(direction, () => {
            store.goToDate(today);
            renderDate();
            markSectionDirty('timeline');
            markSectionDirty('todo');
        });
        PanelManager.close();
    },

    close() {
        PanelManager.close();
    },

    /** 【P1-1】键盘游标：role="grid" 声明了 roving tabindex 契约，此前却零 keydown 实现，
     *  键盘用户只能 Tab 到「当前选中日」一格，其余 30 格 tabindex=-1 完全不可达。 */
    _kbdCursor: null,

    /** 移动键盘游标（自动跨月），重绘后把焦点落回对应格 */
    _moveKbdCursor(deltaDays) {
        const base = this._kbdCursor
            ? new Date(this._kbdCursor + 'T00:00:00')
            : new Date(store.getState().currentDate);
        if (isNaN(base.getTime())) return;
        base.setDate(base.getDate() + deltaDays);

        const y = base.getFullYear();
        const m = base.getMonth();
        if (y !== this._currentYear || m !== this._currentMonth) {
            // 跨月：先把视图切到目标月，游标再落上去
            this._currentYear = y;
            this._currentMonth = m;
        }
        this._kbdCursor = this._formatDate(base);
        this._refreshGrid();
        this._focusKbdCursor();
    },

    /** 重绘日历格与月份标题 */
    _refreshGrid() {
        const grid = byId('calendarDays');
        if (grid) grid.innerHTML = this._generateCalendarDays();
        const month = byId('calendarMonth');
        if (month) month.textContent = `${this._currentYear}年${this._currentMonth + 1}月`;
    },

    /** 把 tabindex=0 与实际焦点交给游标所在格 */
    _focusKbdCursor() {
        if (!this._kbdCursor) return;
        const grid = byId('calendarDays');
        const cell = grid && grid.querySelector(`[data-date="${this._kbdCursor}"]`);
        if (cell) {
            cell.tabIndex = 0;
            cell.focus();
        }
    },

    /** 日历键盘导航：方向键移动 / PageUp-Down 翻月 / Enter-Space 选中 */
    _onCalendarKeydown(e) {
        const grid = byId('calendarDays');
        if (!grid || !grid.contains(e.target)) return;   // 面板未打开或焦点不在日历上

        const step = (e.key === 'ArrowLeft') ? -1
            : (e.key === 'ArrowRight') ? 1
            : (e.key === 'ArrowUp') ? -7
            : (e.key === 'ArrowDown') ? 7
            : 0;

        if (step !== 0) {
            e.preventDefault();
            this._moveKbdCursor(step);
            return;
        }
        if (e.key === 'PageUp' || e.key === 'PageDown') {
            e.preventDefault();
            this._updateCalendar(e.key === 'PageUp' ? 'prev' : 'next');
            this._focusKbdCursor();
            return;
        }
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            const target = this._kbdCursor || e.target.getAttribute('data-date');
            if (!target) return;
            const cell = grid.querySelector(`[data-date="${target}"]`);
            this.quickSelect(target, (cell && cell.getAttribute('data-label')) || target);
        }
    },

    _validateDate(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
};

// 【P1-1】绑定一次即可：#calendarDays 的 innerHTML 会被重建，但监听挂在 document 上不受影响；
// 面板未打开时 calendarDays 不存在，_onCalendarKeydown 会直接 return。
document.addEventListener('keydown', (e) => DatePicker._onCalendarKeydown(e));

ActionDispatcher.registerMany({
    'quick-select-date': (data) => DatePicker.quickSelect(data.date, data.label),
    'calendar-prev-month': () => DatePicker._updateCalendar('prev'),
    'calendar-next-month': () => DatePicker._updateCalendar('next')
});