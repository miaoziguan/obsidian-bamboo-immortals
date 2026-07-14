import { byId, $, $$, modalMount, getDomRoot } from '../utils/domRef.js';
export const renderDate = () => {
    const { currentDate } = store.getState();
    const dateDisplay = byId('currentDate');
    const weekdayDisplay = byId('currentWeekday');
    if (dateDisplay) dateDisplay.textContent = getChineseDateDisplay(currentDate);
    if (weekdayDisplay) weekdayDisplay.textContent = getChineseWeekday(currentDate);
};

let _renderDebounceTimer = null;
let _isRendering = false;
let _pendingRender = false;
let _renderedSectionIds = new Set();

export const renderSkeleton = () => {
    const sectionsContainer = byId('sectionsContainer');
    if (!sectionsContainer) return;

    sectionsContainer.innerHTML = `
        <div class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
        </div>
    `;
};

export const renderAll = () => {
    // 防抖动 - 50ms 内只执行一次
    if (_renderDebounceTimer) {
        clearTimeout(_renderDebounceTimer);
    }

    _renderDebounceTimer = setTimeout(() => {
        if (_isRendering) {
            _pendingRender = true;
            return;
        }

        _isRendering = true;

        try {
            const data = store.getCurrentDayData();
            renderDate();

            const sectionsContainer = byId('sectionsContainer');
            if (!sectionsContainer) {
                console.error('sectionsContainer 不存在!');
                return;
            }

            // 首次渲染时清空骨架屏占位
            if (_renderedSectionIds.size === 0) {
                sectionsContainer.innerHTML = '';
            }

            const sections = SectionRegistry.getVisible();
            const newSectionIds = new Set(sections.map(s => s.id));

            // 移除不再可见的 section
            _renderedSectionIds.forEach(id => {
                if (!newSectionIds.has(id)) {
                    const el = sectionsContainer.querySelector(`[data-section-id="${id}"]`);
                    if (el) el.remove();
                }
            });

            // 收集所有需要渲染的 section 元素，按正确顺序排列
            // 性能优化：themeEffect section 仅首次创建，后续渲染复用已存在的 DOM
            const savedThemeWrapper = byId('themeEffectSection');
            const sectionElements = [];
            sections.forEach((section, index) => {
                if (section.id === 'themeEffect' && savedThemeWrapper) {
                    savedThemeWrapper.setAttribute('data-section-id', 'themeEffect');
                    savedThemeWrapper.style.animationDelay = `${index * 0.05}s`;
                    sectionElements.push(savedThemeWrapper);
                    return;
                }
                const existingEl = sectionsContainer.querySelector(`[data-section-id="${section.id}"]`);
                const sectionElement = createDefaultSection(section, data, index);
                if (sectionElement) {
                    sectionElement.setAttribute('data-section-id', section.id);
                    sectionElement.style.animationDelay = `${index * 0.05}s`;
                    sectionElements.push(sectionElement);
                }
            });

            // 清空并重新按正确顺序插入所有 section（解决 DOM 顺序与 sections 顺序不一致的问题）
            sectionsContainer.innerHTML = '';
            sectionElements.forEach(el => sectionsContainer.appendChild(el));

            _renderedSectionIds = newSectionIds;

            renderUndoRedoBar();

            // 恢复已完成组的折叠/展开状态
            if (typeof Todo !== 'undefined') {
                Todo._syncCollapsedState();
            }

            setupTimelineHoverEffects();
            setupBambooTooltips();
        } catch (e) {
            console.error('渲染出错:', e);
        } finally {
            _isRendering = false;
            if (_pendingRender) {
                _pendingRender = false;
                renderAll();
            }
        }
    }, 50);
};

export const createDefaultSection = (section, data, index) => {
    let sectionElement = null;
    
    switch (section.id) {
        case 'themeEffect':
            const themeHtml = window.ThemeEffects.render(section.theme || 'bamboo');
            const tempThemeDiv = document.createElement('div');
            tempThemeDiv.innerHTML = themeHtml;
            // 将主题内容包在统一 wrapper 中，以便 switchTheme 替换
            const wrapper = document.createElement('div');
            wrapper.id = 'themeEffectSection';
            while (tempThemeDiv.firstChild) {
                wrapper.appendChild(tempThemeDiv.firstChild);
            }
            sectionElement = wrapper;
            setTimeout(() => {
                window.ThemeEffects.init(section.theme || 'bamboo');
            }, 100);
            break;
        case 'timeline':
            sectionElement = renderTimelineSection(data);
            break;
        case 'goals':
            sectionElement = renderGoalsSection();
            break;
        case 'todo':
            sectionElement = renderTodoSection();
            break;
    }
    
    if (sectionElement) {
        sectionElement.style.animationDelay = `${index * 0.05}s`;
    }
    return sectionElement;
};

export const _iconSvg = {
    clock: LucideUtils.createIcon('clock', { size: 20 }),
    checkCircle: LucideUtils.createIcon('checkCircle', { size: 20 }),
    search: LucideUtils.createIcon('search', { size: 20 })
};


export const computeActiveDuration = (timeline) => {
    const allTimes = [];
    timeline.forEach(period => {
        if (period.items && Array.isArray(period.items)) {
            period.items.forEach(item => {
                const parsed = parseTime(item.time);
                if (parsed) allTimes.push(parsed);
            });
        }
    });
    if (allTimes.length < 2) return null;
    allTimes.sort((a, b) => {
        if (a.hour !== b.hour) return a.hour - b.hour;
        return a.minute - b.minute;
    });
    const first = allTimes[0];
    const last = allTimes[allTimes.length - 1];
    const diffMin = (last.hour * 60 + last.minute) - (first.hour * 60 + first.minute);
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (hours > 0 && mins > 0) return `${hours}h${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
};

export const stubIconClock = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
export const stubIconList = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
export const stubIconFlip = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
export const buildStubBackHTML = (data) => {
    const { activeCount, totalPeriods, totalEvents, activeDuration } = data;
    const pct = totalPeriods > 0 ? Math.round((activeCount / totalPeriods) * 100) : 0;

    return `
        <div class="ticket-stub-content stub-back-content">
            <div class="stub-back-title-box">
                <div class="stub-back-row">
                    <div class="stub-back-left">
                        <div class="stub-back-ring" style="--ring-pct: ${pct};">
                            <span class="stub-back-ring-text">${pct}%</span>
                        </div>
                        <div class="stub-back-caption">活力值</div>
                    </div>
                    <div class="stub-back-divider"></div>
                    <div class="stub-back-right">
                        ${activeDuration ? `<div class="stub-back-stat">${stubIconClock}<span class="stub-back-stat-value">${activeDuration}</span></div>` : '<div class="stub-back-stat">' + stubIconClock + '<span class="stub-back-stat-value">--</span></div>'}
                        <div class="stub-back-stat">${stubIconList}<span class="stub-back-stat-value">${totalEvents}项</span></div>
                    </div>
                </div>
            </div>
            <div class="stub-noise-ctrl" id="stub-noise-ctrl-back">
                <svg class="stub-nc-icon stub-nc-prev" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-prev"><path d="m15 18-6-6 6-6"/></svg>
                <span class="stub-nc-name" data-action="white-noise-panel">竹林</span>
                <svg class="stub-nc-icon stub-nc-next" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-next"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </div>`;
};

export const buildTicketHTML = (checkInTimes, activePeriod, dotStates, stubBackData) => `
        <div class="designer-ticket" role="list" aria-label="活动统计">
            <div class="ticket-main">
                <div class="ticket-body">
                    <div class="ticket-time-block ticket-start-block">
                        <div class="ticket-time-name">启程出发</div>
                        <div class="ticket-time-value">${checkInTimes.firstCheckIn}</div>
                    </div>
                    <div class="ticket-highlight">
                        <div class="ticket-highlight-value">${activePeriod}</div>
                        <div class="ticket-highlight-label">精彩时刻</div>
                    </div>
                    <div class="ticket-time-block ticket-end-block">
                        <div class="ticket-time-name">平稳落地</div>
                        <div class="ticket-time-value">${checkInTimes.lastCheckIn}</div>
                    </div>
                </div>
                ${buildPeriodDotsHTML(dotStates)}
                <div class="ticket-decorations">
                    <div class="ticket-decoration left"></div>
                    <div class="ticket-slogan">一节一程，成竹在心</div>
                    <div class="ticket-decoration right"></div>
                </div>
            </div>
            <div class="ticket-stub">
                <div class="ticket-flip-container">
                    <div class="ticket-flip-front">
                        <div class="ticket-stub-content">
                            <div class="ticket-stub-title-box" data-action="white-noise-toggle">
                                <div class="stub-title-cn">寄情</div>
                                <div class="stub-title-cn">山水</div>
                                <div class="ticket-stub-date">${new Date().toLocaleDateString('zh-CN')}</div>
                            </div>
                            <div class="stub-noise-ctrl" id="stub-noise-ctrl">
                                <svg class="stub-nc-icon stub-nc-prev" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-prev"><path d="m15 18-6-6 6-6"/></svg>
                                <span class="stub-nc-name" data-action="white-noise-panel">竹林</span>
                                <svg class="stub-nc-icon stub-nc-next" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-action="white-noise-next"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </div>
                    </div>
                    <div class="ticket-flip-back">
                        ${buildStubBackHTML(stubBackData)}
                    </div>
                </div>
                <div class="flip-stub-btn" data-action="ticket-flip" title="查看数据" aria-label="翻到背面">
                    ${stubIconFlip}
                </div>
            </div>
        </div>`;

export const PERIOD_HOURS = { lateNight: [0,4], dawn: [4,5.5], earlyMorning: [5.5,7], morning: [7,12], midday: [12,13], afternoon: [13,17], dusk: [17,18.5], evening: [18.5,22], night: [22,24] };

export const PERIOD_ORDER = ['lateNight', 'dawn', 'earlyMorning', 'morning', 'midday', 'afternoon', 'dusk', 'evening', 'night'];

export const PERIOD_LABELS = ['凌晨', '拂晓', '清晨', '上午', '午间', '下午', '傍晚', '晚间', '深夜'];

export const getPeriodDotStates = (timeline) => {
    const activeKeys = new Set((timeline || []).filter(p => p.items && p.items.length > 0).map(p => p.period));
    const now = new Date();
    const t = now.getHours() + now.getMinutes() / 60;
    return PERIOD_ORDER.map((key, i) => {
        const range = PERIOD_HOURS[key];
        const isCurrent = range && t >= range[0] && t < range[1];
        return { key, label: PERIOD_LABELS[i], hasData: activeKeys.has(key), isCurrent };
    });
};

export const buildPeriodDotsHTML = (dotStates) => {
    const dots = dotStates.map(s => {
        let cls = 'ticket-dot';
        if (s.hasData) cls += ' has-data';
        if (s.isCurrent) cls += ' current';
        const tip = s.isCurrent ? `${s.label} · 当前时段`
            : s.hasData ? `${s.label} · 有记录`
            : s.label;
        return `<span class="${cls}" data-tip="${tip}" aria-hidden="true"></span>`;
    }).join('');
    return `<div class="ticket-period-dots" role="img" aria-label="时段活跃度">${dots}</div>`;
};

export const isCurrentPeriod = (periodKey) => {
    const now = new Date();
    const t = now.getHours() + now.getMinutes() / 60;
    const range = PERIOD_HOURS[periodKey];
    return range && t >= range[0] && t < range[1];
};

export const buildBambooNodeHTML = (period, index) => {
    const _isFocus = isCurrentPeriod(period.period);
    const focus = _isFocus ? 'focus-now' : '';
    const count = period.items?.length || 0;
    let hint = '';
    if (count === 0) {
        hint = '这个时段还没有记录活动';
    } else if (count === 1) {
        hint = `这个时段有 1 条活动记录`;
    } else {
        hint = `这个时段有 ${count} 条活动记录`;
    }
    
    return `
        <div class="bamboo-node ${focus}" style="animation-delay: ${index * 0.1}s">
            <div class="bamboo-card ${period.period}">
                <div class="bamboo-card-header" data-action="timeline-toggle" data-index="${index}" style="cursor: pointer;">
                    <div class="bamboo-left">
                        <div class="bamboo-info">
                            <div class="bamboo-icon">${LucideUtils.createIcon(period.icon, { size: 15 })}</div>
                            <div class="bamboo-title">
                                <div class="bamboo-name">${escapeHtml(period.name)}</div>
                                <div class="bamboo-time">${escapeHtml(period.time)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="bamboo-right">
                        <span class="bamboo-count" data-count="${count}" data-hint="${hint}">${count}</span>
                        <div class="bamboo-chevron${!_isFocus ? ' collapsed' : ''}" id="chevron-${index}">${_isFocus ? '▼' : '▶'}</div>
                    </div>
                    <div class="bamboo-leaf"></div>
                </div>
                <div class="bamboo-card-content${!_isFocus ? ' collapsed' : ''}" id="timeline-content-${index}">
                    <div class="bamboo-items">
                        ${(period.items || []).map(item => `
                            <div class="bamboo-item">
                                <div class="bamboo-item-time">${escapeHtml(item.time)}</div>
                                <div class="bamboo-item-content">
                                    <div class="bamboo-item-task">${escapeHtml(item.task)}</div>
                                    ${item.eval ? `<div class="bamboo-item-eval ${item.eval === 'warn' ? 'warn' : ''}">${escapeHtml(item.eval)}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>`;
};

export const buildBambooPathHTML = (data) => {
    if (!data.timeline || data.timeline.length === 0) {
        return `<div class="empty-state-card">
            <div class="empty-state-icon">${_iconSvg.clock}</div>
            <div class="empty-state-title">记录你的活动时间线</div>
            <div class="empty-state-desc">完成待办任务后自动记录</div>
        </div>`;
    }
    return data.timeline.map((period, i) => buildBambooNodeHTML(period, i)).join('');
};

export const getActivePeriod = (timeline) => {
    let maxCount = 0, best = null;
    timeline.forEach(p => {
        const n = (p.items && p.items.length) || 0;
        if (n > maxCount) { maxCount = n; best = p; }
    });
    return best ? (best.name || best.time || '-') : '-';
};

export const renderTimelineSection = (data) => {
    const section = document.createElement('section');
    section.className = 'timeline-section';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-labelledby', 'timeline-title');

    const timeline = data.timeline || [];
    const checkInTimes = calculateCheckInTimes(timeline);
    const activePeriod = timeline.length > 0 ? getActivePeriod(timeline) : '-';
    const dotStates = getPeriodDotStates(timeline);
    const activeCount = dotStates.filter(s => s.hasData).length;
    const stubBackData = {
        activeCount,
        totalPeriods: 9,
        totalEvents: timeline.reduce((sum, p) => sum + (p.items?.length || 0), 0),
        activeDuration: computeActiveDuration(timeline)
    };

    section.innerHTML = `
        <div class="timeline-wrapper">
            ${buildTicketHTML(checkInTimes, activePeriod, dotStates, stubBackData)}
            <div class="timeline-bamboo-path" id="timelinePath" role="list" aria-label="活动时间线">
                ${buildBambooPathHTML(data)}
            </div>
        </div>`;
    setTimeout(() => setupTimelineHoverEffects(), 0);
    return section;
};

export const renderGoalsSection = () => {
    const section = document.createElement('section');
    section.className = 'goal-section';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-labelledby', 'goals-title');
    
    section.innerHTML = `
        <div class="goal-map-container">
            <div class="goal-list" id="goalList" role="list" aria-label="目标列表"></div>
        </div>
    `;
    
    if (typeof GoalsRenderer !== 'undefined') {
        GoalsRenderer.render(null, section.querySelector('.goal-list'));
    }
    
    return section;
};

export const renderTodoSection = () => {
    const section = document.createElement('section');
    section.className = 'todo-section';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-labelledby', 'todo-title');
    
    let goalTasks = [];
    if (typeof GoalsRenderer !== 'undefined') {
        goalTasks = GoalsRenderer.getTodayGoalTasks(store.getDateKey());
    }
    
    const completedCount = goalTasks.filter(t => t.completed).length;
    const totalCount = goalTasks.length;

    const renderTodoItem = (todo, isCompleted) => {
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
            goalMetaLabel += `<span class="todo-goal-daily">+${parseFloat(todo.incrementValue).toFixed(1)}</span>`;
        }
        if (todo.hasValues) {
            const currentVal = parseFloat(todo.currentValue) || 0;
            const targetVal = parseFloat(todo.targetValue) || 0;
            goalMetaLabel += `<span class="todo-goal-progress">${currentVal.toFixed(1)}/${targetVal}</span>`;
        }
        
        const toggleDataAttrs = `data-action="todo-toggle" data-todo-id="${escapeHtml(todo.id)}" data-type="goal_task" data-goal-id="${todo.goalId || ''}" data-item-idx="${todo.itemIdx !== undefined ? todo.itemIdx : ''}" data-is-completed="${isCompleted}"`;

        return `
            <div class="todo-item ${completedClass} ${goalTaskClass} ${archivedClass}" data-todo-id="${escapeHtml(todo.id)}">
                <button class="todo-checkbox ${isCompleted ? 'checked' : ''}" 
                        ${toggleDataAttrs}
                        aria-label="${isCompleted ? '标记为未完成' : '标记为已完成'}">
                    ${isCompleted ? LucideUtils.createIcon('check', { size: 9 }) : ''}
                </button>
                <div class="todo-content">
                    ${todo.description ? `<span class="todo-desc">${escapeHtml(todo.description)} - </span>` : ''}
                    <span class="todo-title">${escapeHtml(todo.title)}</span>
                </div>
                <div class="todo-meta">
                    ${goalMetaLabel}
                </div>
            </div>
        `;
    };
    
    section.innerHTML = `
        <div id="todoContent" role="article" aria-label="待办任务">
            ${goalTasks.length === 0 ? `
                <div class="empty-state-card">
                    <div class="empty-state-icon">${LucideUtils.createIcon('target', { size: 48, strokeWidth: 1.5 })}</div>
                    <div class="empty-state-title">今日目标任务</div>
                    <div class="empty-state-desc">在目标管理中设置每日任务</div>
                    <div class="empty-state-hint">前往目标页面添加任务</div>
                </div>
            ` : (() => {
                const pending = goalTasks.filter(t => !t.completed);
                const completed = goalTasks.filter(t => t.completed);
                const progressPercent = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
                
                return `
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
                            <span class="todo-stat-num">${progressPercent}%</span>
                            <span class="todo-stat-label">完成率</span>
                        </div>
                    </div>
                    <div class="todo-progress-bar">
                        <div class="todo-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    ${pending.length > 0 ? `
                        <div class="todo-group todo-group-goal">
                            <div class="todo-group-header">
                                <div class="todo-group-label">
                                    ${LucideUtils.createIcon('target', { size: 16 })}
                                    <span>目标任务</span>
                                    <span class="todo-group-badge">${pending.length}</span>
                                </div>
                                <button class="todo-lottery-btn" data-action="todo-lottery-start"
                                        title="随机抽选一个任务来执行"
                                        aria-label="任务抽签">
                                    ${LucideUtils.createIcon('dice5', { size: 16 })}
                                </button>
                            </div>
                            <div class="todo-group-items">
                                ${pending.map(todo => renderTodoItem(todo, false)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${completed.length > 0 ? `
                        <div class="todo-group todo-group-completed collapsed" id="todoCompletedGroup">
                            <div class="todo-group-header">
                                <div class="todo-group-label" data-action="todo-toggle-completed-group">
                                    <span class="todo-group-chevron">${LucideUtils.createIcon('chevronDown', { size: 14 })}</span>
                                    已完成 (${completed.length})
                                </div>
                            </div>
                            <div class="todo-group-items">
                                ${completed.map(todo => renderTodoItem(todo, true)).join('')}
                            </div>
                        </div>
                    ` : ''}
                `;
            })()}
        </div>
    `;
    
    return section;
};

export const renderUndoRedoBar = () => {
    let bar = $('.undo-redo-bar');
    const canUndo = store.canUndo();
    const canRedo = store.canRedo();
    
    if (bar) {
        const undoBtn = bar.querySelector('.undo-btn');
        const redoBtn = bar.querySelector('.redo-btn');
        const indicator = bar.querySelector('.undo-redo-indicator');
        if (undoBtn) undoBtn.disabled = !canUndo;
        if (redoBtn) redoBtn.disabled = !canRedo;
        if (indicator) {
            const { undoStack, redoStack } = store.getState();
            indicator.textContent = `${undoStack.length}/${redoStack.length}`;
        }
    }
};

export const renderHistoryList = () => {
    const container = byId('historyList');
    if (!container) return;
    
    const { data, currentDate } = store.getState();
    const dates = Object.keys(data).sort().reverse();
    const currentKey = store.getDateKey(currentDate);
    
    if (dates.length === 0) {
        container.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }
    
    container.innerHTML = dates.map(dateKey => {
        const day = data[dateKey];
        const isCurrent = dateKey === currentKey;
        return `
            <div class="history-item ${isCurrent ? 'current' : ''}" data-action="select-history-date" data-date="${dateKey}">
                <div class="history-date">
                    <div class="history-date-main">${day.date}</div>
                    <div class="history-date-weekday">${day.weekday || ''}</div>
                </div>
                <div class="history-info">
                    <div class="history-kpi">
                        <span>${LucideUtils.createIcon('clock', { size: 14 })} ${(day.metrics || day).activeTime || '-'}</span>
                        <span>${_iconSvg.checkCircle} ${(day.metrics || day).completedTasks || '-'}</span>
                        <span>${LucideUtils.createIcon('messageCircle', { size: 14 })} ${(day.metrics || day).inspirationCount || '0'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

export const highlightText = (text, query) => {
    if (!query || !text) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapeRegex(escapedQuery)})`, 'gi');
    return escapedText.replace(regex, '<mark style="background: var(--bamboo-primary); color: white; padding: 0 4px; border-radius: 4px;">$1</mark>');
};

export const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const renderSearchResults = (results, query) => {
    const container = byId('searchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="history-empty" style="padding: 32px 16px; text-align: center; color: var(--text-secondary);">
                <div style="margin-bottom: 12px;">${_iconSvg.search}</div>
                <div>没有找到相关记录</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="padding: 8px 0 16px 0; font-size: 12px; color: var(--text-secondary);">
            找到 ${results.length} 条相关记录
        </div>
        ${results.map(result => {
            const isCurrent = result.date === store.getDateKey();
            return `
                <div class="history-item ${isCurrent ? 'current' : ''}" data-action="select-history-date" data-date="${result.date}">
                    <div class="history-date">
                        <div class="history-date-main">${result.date}</div>
                        <div class="history-date-weekday">${result.weekday || ''}</div>
                    </div>
                    <div class="history-info">
                        ${result.matches.length > 0 ? `
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                ${result.matches.map(m => `<div>${m.field}: ${highlightText(m.value, query)}</div>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('')}
    `;
};
ActionDispatcher.registerMany({
    'white-noise-toggle': () => { if (typeof WhiteNoiseManager !== 'undefined') WhiteNoiseManager.toggle(); },
    'white-noise-prev': () => { if (typeof WhiteNoiseManager !== 'undefined') WhiteNoiseManager.prev(); },
    'white-noise-next': () => { if (typeof WhiteNoiseManager !== 'undefined') WhiteNoiseManager.next(); },
    'white-noise-panel': () => { if (typeof WhiteNoiseManager !== 'undefined') WhiteNoiseManager.showPanel(); },
    'ticket-flip': (_data, target) => {
        const stub = target.closest('.ticket-stub');
        if (stub) {
            const container = stub.querySelector('.ticket-flip-container');
            if (container) container.classList.toggle('flipped');
        }
    },
    'timeline-toggle': (data) => Timeline.toggle(parseInt(data.index)),
    'todo-toggle': (data) => Todo.toggle(data.todoId, data.type, data.goalId, data.itemIdx, data.isCompleted === 'true'),
    'todo-toggle-completed-group': () => Todo.toggleCompletedGroup(),
    'todo-lottery-start': () => { console.log('[抽签] 骰子按钮被点击(r2)'); Todo.startLottery(); },
    'todo-lottery-start-task': (data) => Todo.startLotteryTask(data.todoId),
    'select-history-date': (data) => Handlers.selectHistoryDate(data.date)
});
window.renderSkeleton = renderSkeleton;
window.renderAll = renderAll;
window.createDefaultSection = createDefaultSection;

export const setupTimelineHoverEffects = () => {
    const container = byId('sectionsContainer');
    if (!container || container._hoverBound) return;

    // 使用事件委托，避免重复绑定监听器
    container.addEventListener('mousemove', (e) => {
        const header = e.target.closest('.bamboo-card-header');
        if (!header) return;

        const rect = header.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        header.style.setProperty('--mouse-x', `${x}%`);
        header.style.setProperty('--mouse-y', `${y}%`);
    });

    container.addEventListener('mouseleave', (e) => {
        const header = e.target.closest('.bamboo-card-header');
        if (!header) return;
        
        header.style.setProperty('--mouse-x', '50%');
        header.style.setProperty('--mouse-y', '50%');
    }, true); // 使用 capture 确保能捕获到离开

    container._hoverBound = true;
};
window.setupTimelineHoverEffects = setupTimelineHoverEffects;

export const setupBambooTooltips = (container = getDomRoot()) => {
    if (container._tooltipBound) return;
    container._tooltipBound = true;

    let tooltip = $('.bamboo-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'bamboo-tooltip';
        modalMount().appendChild(tooltip);
    }

    const counts = $$('.bamboo-count');
    counts.forEach(count => {
        count.addEventListener('mouseenter', () => {
            const hint = count.dataset.hint;
            if (!hint) return;

            tooltip.textContent = hint;
            tooltip.style.opacity = '1';

            const rect = count.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
            let top = rect.top - tooltipRect.height - 8;

            left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
            top = Math.max(8, top);

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        });

        count.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        count.addEventListener('mousemove', () => {
            const rect = count.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
            let top = rect.top - tooltipRect.height - 8;

            left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
            top = Math.max(8, top);

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        });
    });
};
window.setupBambooTooltips = setupBambooTooltips;
window.renderDate = renderDate;
window.computeActiveDuration = computeActiveDuration;
window.buildStubBackHTML = buildStubBackHTML;
window.buildTicketHTML = buildTicketHTML;
window.getPeriodDotStates = getPeriodDotStates;
window.buildPeriodDotsHTML = buildPeriodDotsHTML;
window.isCurrentPeriod = isCurrentPeriod;
window.buildBambooNodeHTML = buildBambooNodeHTML;
window.buildBambooPathHTML = buildBambooPathHTML;
window.getActivePeriod = getActivePeriod;
window.renderTimelineSection = renderTimelineSection;
window.renderGoalsSection = renderGoalsSection;
window.renderTodoSection = renderTodoSection;
window.renderUndoRedoBar = renderUndoRedoBar;
window.renderHistoryList = renderHistoryList;
window.highlightText = highlightText;
window.escapeRegex = escapeRegex;
window.renderSearchResults = renderSearchResults;
