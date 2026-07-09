import { byId } from '../utils/domRef.js';
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
                    <button class="wn-type-btn" data-action="quick-select-date" data-date="${this._formatDate(this._addDays(today, -7))}" data-label="上周" aria-label="跳转到上周">
                        ${LucideUtils.createIcon('chevronLeft', { size: 14 })}
                        <span>上周</span>
                    </button>
                    <button class="wn-type-btn active" data-action="quick-select-date" data-date="${this._formatDate(today)}" data-label="今天" aria-label="跳转到今天">
                        ${LucideUtils.createIcon('calendar', { size: 14 })}
                        <span>今天</span>
                    </button>
                    <button class="wn-type-btn" data-action="quick-select-date" data-date="${this._formatDate(this._addDays(today, 7))}" data-label="下周" aria-label="跳转到下周">
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
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
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
                     data-date="${dateStr}" 
                     data-label="${this._currentYear}年${this._currentMonth + 1}月${day}日"
                     role="gridcell"
                     aria-label="${tooltipText}"
                     tabindex="${isSelected ? '0' : '-1'}"
                     title="${tooltipText}">
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
        const input = byId('date-picker-input');
        if (input) {
            input.value = dateStr;
        }
        const [y, m, d] = dateStr.split('-').map(Number);
        const newDate = new Date(y, m - 1, d);
        
        if (!this._validateDate(newDate)) {
            Toast.showToast('日期无效', 'error');
            return;
        }
        
        store.goToDate(newDate);
        renderAll();
        PanelManager.close();
        Toast.showToast(`已跳转到${label}`, 'success');
    },

    goToSelectedDate() {
        const input = byId('date-picker-input');
        if (!input || !input.value) {
            Toast.showToast('请选择日期', 'warning');
            return;
        }

        const [y, m, d] = input.value.split('-').map(Number);
        const newDate = new Date(y, m - 1, d);
        
        if (!this._validateDate(newDate)) {
            Toast.showToast('请输入有效的日期', 'error');
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        newDate.setHours(0, 0, 0, 0);
        
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 365);
        
        if (newDate > maxDate) {
            Toast.showToast('日期不能超过一年后', 'warning');
            return;
        }

        store.goToDate(newDate);
        renderAll();
        PanelManager.close();
        Toast.showToast('已跳转到选择的日期', 'success');
    },

    goToToday() {
        const today = new Date();
        store.goToDate(today);
        renderAll();
        PanelManager.close();
        Toast.showToast('已回到今天', 'success');
    },

    close() {
        PanelManager.close();
    },

    _validateDate(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
};

ActionDispatcher.registerMany({
    'quick-select-date': (data) => DatePicker.quickSelect(data.date, data.label),
    'goto-today': () => DatePicker.goToToday(),
    'goto-selected-date': () => DatePicker.goToSelectedDate(),
    'calendar-prev-month': () => DatePicker._updateCalendar('prev'),
    'calendar-next-month': () => DatePicker._updateCalendar('next')
});