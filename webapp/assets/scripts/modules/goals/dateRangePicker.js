/**
 * 日期范围选择器
 * 纯 DOM 弹层，不含 this. 引用，从 GoalsRenderer._showDateRangePicker 提取。
 */
export const DateRangePicker = {
    show({ el, goal, subIdx, currentStart, currentEnd, onSelect, onCancel }) {
        if (!el || !document.contains(el)) return;
        let rect;
        try {
            rect = el.getBoundingClientRect();
        } catch (e) {
            rect = null;
        }

        // 解析当前日期
        const parseDate = (str) => str ? new Date(str + 'T00:00:00') : null;
        let startDate = parseDate(currentStart);
        let endDate = parseDate(currentEnd);
        let currentTab = 'end';

        const getWeekNumber = (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            const yearStart = new Date(d.getFullYear(), 0, 1);
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        };

        const getWeekStart = (date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        };
        const getWeekEnd = (date) => {
            const start = getWeekStart(date);
            return new Date(start.getTime() + 6 * 86400000);
        };

        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const pickerHtml = `
            <div class="drp-overlay"></div>
            <div class="drp-container">
                <div class="drp-header">
                    <span class="drp-title">选择日期范围</span>
                    <button class="drp-close-btn">&times;</button>
                </div>
                <div class="drp-tabs">
                    <button class="drp-tab" data-tab="range">改范围</button>
                    <button class="drp-tab" data-tab="start">改开始</button>
                    <button class="drp-tab" data-tab="end">改结束</button>
                </div>
                <div class="drp-quick-area" data-tab-panel="range">
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-range="thisWeek">本周</button>
                        <button class="drp-quick-btn" data-range="nextWeek">下周</button>
                        <button class="drp-quick-btn" data-range="thisMonth">本月</button>
                        <button class="drp-quick-btn" data-range="nextMonth">下月</button>
                        <button class="drp-quick-btn" data-range="thisQuarter">本季</button>
                        <button class="drp-quick-btn" data-range="thisYear">本年</button>
                    </div>
                </div>
                <div class="drp-quick-area" data-tab-panel="start" style="display:none;">
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-start="today">今天</button>
                        <button class="drp-quick-btn" data-start="thisMonday">本周一</button>
                        <button class="drp-quick-btn" data-start="nextMonday">下周一</button>
                        <button class="drp-quick-btn" data-start="monthStart">本月1号</button>
                        <button class="drp-quick-btn" data-start="nextMonthStart">下月1号</button>
                    </div>
                </div>
                <div class="drp-quick-area" data-tab-panel="end" style="display:none;">
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-end="plus3">+3天</button>
                        <button class="drp-quick-btn" data-end="plus7">+7天</button>
                        <button class="drp-quick-btn" data-end="plus14">+14天</button>
                    </div>
                    <div class="drp-quick-row">
                        <button class="drp-quick-btn" data-end="thisFriday">本周五</button>
                        <button class="drp-quick-btn" data-end="thisSunday">本周日</button>
                        <button class="drp-quick-btn" data-end="monthEnd">本月底</button>
                        <button class="drp-quick-btn" data-end="quarterEnd">本季底</button>
                        <button class="drp-quick-btn" data-end="yearEnd">本年底</button>
                    </div>
                </div>
                <div class="drp-body">
                    <div class="drp-calendar" id="drp-cal">
                        <div class="drp-cal-header">
                            <button class="drp-nav-btn drp-prev-month">&lt;</button>
                            <span class="drp-month-label"></span>
                            <button class="drp-nav-btn drp-next-month">&gt;</button>
                        </div>
                        <div class="drp-weekdays">
                            <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
                        </div>
                        <div class="drp-days"></div>
                    </div>
                </div>
                <div class="drp-footer">
                    <div class="drp-selected-range">
                        <span class="drp-selected-label">起始:</span>
                        <input type="text" class="drp-input-start" value="${HTMLUtils.escapeHtmlAttr(currentStart || '')}" placeholder="YYYY-MM-DD">
                        <span class="drp-arrow">→</span>
                        <span class="drp-selected-label">结束:</span>
                        <input type="text" class="drp-input-end" value="${HTMLUtils.escapeHtmlAttr(currentEnd || '')}" placeholder="YYYY-MM-DD">
                    </div>
                    <div class="drp-actions">
                        <button class="drp-cancel-btn">取消</button>
                        <button class="drp-confirm-btn" ${!currentStart || !currentEnd ? 'disabled' : ''}>确定</button>
                    </div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.className = 'date-range-picker';
        container.innerHTML = pickerHtml;
        document.body.appendChild(container);

        PopupPositioner.positionOnNextFrame({
            popupElement: container.querySelector('.drp-container'),
            anchorRect: rect,
            anchor: { placement: 'below-center' },
            fallbackSize: { width: 300, height: 400 },
        });

        const renderCalendar = (calendarEl, baseDate) => {
            const year = baseDate.getFullYear();
            const month = baseDate.getMonth();
            const label = container.querySelector('.drp-month-label');
            label.textContent = `${year}年${month + 1}月`;

            const daysContainer = calendarEl.querySelector('.drp-days');
            daysContainer.innerHTML = '';

            const firstDay = new Date(year, month, 1);
            let startWeekday = firstDay.getDay() || 7;
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const prevMonth = new Date(year, month, 0);
            const prevMonthDays = prevMonth.getDate();
            for (let i = startWeekday - 1; i > 0; i--) {
                const dayEl = document.createElement('div');
                dayEl.className = 'drp-day drp-day-disabled';
                dayEl.textContent = prevMonthDays - i + 1;
                daysContainer.appendChild(dayEl);
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d);
                const dayEl = document.createElement('div');
                dayEl.className = 'drp-day';
                dayEl.textContent = d;
                dayEl.dataset.date = formatDate(date);

                if (date.getTime() === today.getTime()) {
                    dayEl.classList.add('drp-day-today');
                }
                if (startDate && date.getTime() === startDate.getTime()) {
                    dayEl.classList.add('drp-day-start');
                }
                if (endDate && date.getTime() === endDate.getTime()) {
                    dayEl.classList.add('drp-day-end');
                }
                if (startDate && endDate && date > startDate && date < endDate) {
                    dayEl.classList.add('drp-day-in-range');
                }

                daysContainer.appendChild(dayEl);
            }

            const remaining = 42 - (startWeekday - 1 + daysInMonth);
            for (let d = 1; d <= remaining; d++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'drp-day drp-day-disabled';
                dayEl.textContent = d;
                daysContainer.appendChild(dayEl);
            }
        };

        const updateSelectedDisplay = () => {
            const startInput = container.querySelector('.drp-input-start');
            const endInput = container.querySelector('.drp-input-end');
            if (startInput) startInput.value = startDate ? formatDate(startDate) : '';
            if (endInput) endInput.value = endDate ? formatDate(endDate) : '';
            const confirmBtn = container.querySelector('.drp-confirm-btn');
            confirmBtn.disabled = !startDate || !endDate;
        };

        const parseDateInput = (str) => {
            if (!str || !str.trim()) return null;
            str = str.trim();
            const formats = [
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
                /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                /^(\d{1,2})-(\d{1,2})$/,
                /^(\d{1,2})\/(\d{1,2})$/,
            ];
            for (const format of formats) {
                const match = str.match(format);
                if (match) {
                    let y, m, d;
                    if (match.length === 4) {
                        if (match[1].length === 4) {
                            y = parseInt(match[1]);
                            m = parseInt(match[2]);
                            d = parseInt(match[3]);
                        } else {
                            d = parseInt(match[1]);
                            m = parseInt(match[2]);
                            y = parseInt(match[3]);
                        }
                    } else {
                        y = new Date().getFullYear();
                        m = parseInt(match[1]);
                        d = parseInt(match[2]);
                    }
                    const date = new Date(y, m - 1, d);
                    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
                        date.setHours(0, 0, 0, 0);
                        return date;
                    }
                }
            }
            return null;
        };

        const enforceDateConstraint = () => {
            if (startDate && endDate && endDate < startDate) {
                if (currentTab === 'start') endDate = new Date(startDate);
                else if (currentTab === 'end') startDate = new Date(endDate);
                else {
                    const tmp = startDate;
                    startDate = endDate;
                    endDate = tmp;
                }
            }
        };

        const getQuarterEnd = (d) => {
            const q = Math.floor(d.getMonth() / 3);
            const endMonth = (q + 1) * 3;
            return new Date(d.getFullYear(), endMonth, 0);
        };

        let displayMonth = startDate ? new Date(startDate) : new Date();
        const calEl = container.querySelector('#drp-cal');
        renderCalendar(calEl, displayMonth);

        const setupInputHandlers = () => {
            const startInput = container.querySelector('.drp-input-start');
            const endInput = container.querySelector('.drp-input-end');

            if (startInput) {
                startInput.addEventListener('input', () => {
                    const parsed = parseDateInput(startInput.value);
                    if (parsed) {
                        startDate = parsed;
                        enforceDateConstraint();
                        displayMonth = new Date(startDate);
                        renderCalendar(calEl, displayMonth);
                        updateNavBtns();
                        updateSelectedDisplay();
                    }
                });
                startInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (startDate && endDate) {
                            container.remove();
                            onSelect(formatDate(startDate), formatDate(endDate));
                        }
                    }
                });
            }

            if (endInput) {
                endInput.addEventListener('input', () => {
                    const parsed = parseDateInput(endInput.value);
                    if (parsed) {
                        endDate = parsed;
                        enforceDateConstraint();
                        displayMonth = new Date(endDate);
                        renderCalendar(calEl, displayMonth);
                        updateNavBtns();
                        updateSelectedDisplay();
                    }
                });
                endInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (startDate && endDate) {
                            container.remove();
                            onSelect(formatDate(startDate), formatDate(endDate));
                        }
                    }
                });
            }
        };

        setupInputHandlers();

        const updateNavBtns = () => {
            const prevBtn = container.querySelector('.drp-prev-month');
            const nextBtn = container.querySelector('.drp-next-month');
            prevBtn.disabled = displayMonth.getFullYear() < 2020;
            nextBtn.disabled = displayMonth.getFullYear() > 2099;
        };
        updateNavBtns();

        const closePicker = () => {
            container.remove();
            onCancel();
        };

        container.querySelector('.drp-overlay').addEventListener('click', closePicker);
        container.querySelector('.drp-close-btn').addEventListener('click', closePicker);
        container.querySelector('.drp-cancel-btn').addEventListener('click', closePicker);

        const switchTab = (tab) => {
            currentTab = tab;
            container.querySelectorAll('.drp-tab').forEach(t => {
                t.classList.toggle('drp-tab-active', t.dataset.tab === tab);
            });
            container.querySelectorAll('[data-tab-panel]').forEach(panel => {
                panel.style.display = panel.dataset.tabPanel === tab ? '' : 'none';
            });
        };

        switchTab(currentTab);

        container.querySelectorAll('.drp-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        container.querySelectorAll('.drp-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                if (btn.dataset.range) {
                    const action = btn.dataset.range;
                    switch (action) {
                        case 'thisWeek':
                            startDate = getWeekStart(now);
                            endDate = getWeekEnd(now);
                            break;
                        case 'nextWeek':
                            startDate = getWeekStart(now);
                            startDate.setDate(startDate.getDate() + 7);
                            endDate = getWeekEnd(startDate);
                            break;
                        case 'thisMonth':
                            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                            break;
                        case 'nextMonth':
                            startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                            endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                            break;
                        case 'thisQuarter':
                            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                            endDate = getQuarterEnd(now);
                            break;
                        case 'thisYear':
                            startDate = new Date(now.getFullYear(), 0, 1);
                            endDate = new Date(now.getFullYear(), 11, 31);
                            break;
                    }
                    if (startDate) displayMonth = new Date(startDate);
                    renderCalendar(calEl, displayMonth);
                    updateNavBtns();
                    updateSelectedDisplay();
                    return;
                }

                if (btn.dataset.start) {
                    const action = btn.dataset.start;
                    switch (action) {
                        case 'today':
                            startDate = new Date(now);
                            break;
                        case 'thisMonday':
                            startDate = getWeekStart(now);
                            break;
                        case 'nextMonday': {
                            const ns = getWeekStart(now);
                            ns.setDate(ns.getDate() + 7);
                            startDate = ns;
                            break;
                        }
                        case 'monthStart':
                            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                            break;
                        case 'nextMonthStart':
                            startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                            break;
                    }
                    enforceDateConstraint();
                    if (startDate) displayMonth = new Date(startDate);
                    renderCalendar(calEl, displayMonth);
                    updateNavBtns();
                    updateSelectedDisplay();
                    return;
                }

                if (btn.dataset.end) {
                    const action = btn.dataset.end;
                    switch (action) {
                        case 'plus3':
                            endDate = new Date(now);
                            endDate.setDate(endDate.getDate() + 3);
                            break;
                        case 'plus7':
                            endDate = new Date(now);
                            endDate.setDate(endDate.getDate() + 7);
                            break;
                        case 'plus14':
                            endDate = new Date(now);
                            endDate.setDate(endDate.getDate() + 14);
                            break;
                        case 'thisFriday': {
                            const day = now.getDay();
                            const offset = (day === 5) ? 0 : ((5 - day + 7) % 7);
                            endDate = new Date(now);
                            endDate.setDate(endDate.getDate() + offset);
                            break;
                        }
                        case 'thisSunday': {
                            const day = now.getDay();
                            const offset = day === 0 ? 0 : 7 - day;
                            endDate = new Date(now);
                            endDate.setDate(endDate.getDate() + offset);
                            break;
                        }
                        case 'monthEnd':
                            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                            break;
                        case 'quarterEnd':
                            endDate = getQuarterEnd(now);
                            break;
                        case 'yearEnd':
                            endDate = new Date(now.getFullYear(), 11, 31);
                            break;
                    }
                    enforceDateConstraint();
                    if (endDate) displayMonth = new Date(endDate);
                    renderCalendar(calEl, displayMonth);
                    updateNavBtns();
                    updateSelectedDisplay();
                    return;
                }
            });
        });

        container.querySelector('.drp-prev-month').addEventListener('click', () => {
            displayMonth.setMonth(displayMonth.getMonth() - 1);
            renderCalendar(calEl, displayMonth);
            updateNavBtns();
        });
        container.querySelector('.drp-next-month').addEventListener('click', () => {
            displayMonth.setMonth(displayMonth.getMonth() + 1);
            renderCalendar(calEl, displayMonth);
            updateNavBtns();
        });

        const handleDayClick = (dayEl) => {
            if (dayEl.classList.contains('drp-day-disabled')) return;

            const clickedDate = new Date(dayEl.dataset.date + 'T00:00:00');

            if (currentTab === 'range') {
                if (!startDate || (startDate && endDate)) {
                    startDate = clickedDate;
                    endDate = null;
                } else {
                    if (clickedDate < startDate) {
                        endDate = startDate;
                        startDate = clickedDate;
                    } else {
                        endDate = clickedDate;
                    }
                }
                if (clickedDate) displayMonth = new Date(clickedDate);
                renderCalendar(calEl, displayMonth);
                updateNavBtns();
                updateSelectedDisplay();
                if (startDate && endDate) {
                    setTimeout(() => {
                        if (startDate && endDate && document.body.contains(container)) {
                            container.remove();
                            onSelect(formatDate(startDate), formatDate(endDate));
                        }
                    }, 800);
                }
                return;
            }

            if (currentTab === 'start') {
                startDate = clickedDate;
                enforceDateConstraint();
                displayMonth = new Date(clickedDate);
                renderCalendar(calEl, displayMonth);
                updateNavBtns();
                updateSelectedDisplay();
                return;
            }

            if (currentTab === 'end') {
                endDate = clickedDate;
                enforceDateConstraint();
                displayMonth = new Date(clickedDate);
                renderCalendar(calEl, displayMonth);
                updateNavBtns();
                updateSelectedDisplay();
                return;
            }
        };

        calEl.querySelector('.drp-days').addEventListener('click', (e) => {
            const dayEl = e.target.closest('.drp-day');
            if (dayEl) handleDayClick(dayEl);
        });

        container.querySelector('.drp-confirm-btn').addEventListener('click', () => {
            if (startDate && endDate) {
                container.remove();
                onSelect(formatDate(startDate), formatDate(endDate));
            }
        });
    }
};

window.DateRangePicker = DateRangePicker;
