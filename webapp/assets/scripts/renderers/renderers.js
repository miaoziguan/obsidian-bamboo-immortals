import { byId, $, $$, modalMount, getDomRoot } from '../utils/domRef.js';
import { RenderScheduler } from './renderScheduler.js';
import { TodoRenderer } from '../modules/todo/renderer.js';
import { isTodayKey, formatSlashDate } from '../utils/dateUtils.js';

export const renderDate = () => {
    const { currentDate } = store.getState();
    const dateDisplay = byId('currentDate');
    const weekdayDisplay = byId('currentWeekday');
    const dateText = getChineseDateDisplay(currentDate);
    if (dateDisplay) {
        dateDisplay.textContent = dateText;
        dateDisplay.setAttribute('aria-label', dateText);
    }
    if (weekdayDisplay) weekdayDisplay.textContent = getChineseWeekday(currentDate);
};

let _renderedSectionIds = new Set();

/**
 * 「正在渲染哪一天」的唯一出口。
 *
 * 【为什么需要】应用支持日期导航（navigation.js 的 prevDay/nextDay、handlers/datePicker.js 的
 * goToDate → store.currentDate），渲染层拿到的 data 是**所选那天**的数据（定时刷新路径见文件末尾
 * sectionRenderFns.timeline → store.getCurrentDayData()）。因此「今天」这类语义必须以 data.date
 * 为基准，绝不能直接读实时时钟 —— 否则回头看 9/15 时会出现「背面是 9/15 的汇总、正面印着今天」。
 *
 * 【兜底理由】date 在宿主侧是必填（src/types/data.ts DayData.date），写侧 putDay 无 date 直接抛错，
 * 故本插件写出的日文件必带 date；只有 VaultStorage.getDay 的裸 JSON.parse 路径对手改/极老文件不设防，
 * 此时回落到 store.getDateKey()（与数据来源同一个 key，不会错位）。
 */
const resolveRenderedDateKey = (data) => {
    if (data && typeof data.date === 'string' && data.date) return data.date;
    if (typeof store !== 'undefined' && store && typeof store.getDateKey === 'function') {
        return store.getDateKey();
    }
    return null;
};

/**
 * 当前时刻在一天中的小时数（带小数）；**仅当 dateKey 就是今天**时才返回数值。
 * 非今天 → null，语义是「这一天不存在所谓『当前时段』」。
 */
const currentHourFractionIfToday = (dateKey) => {
    if (!isTodayKey(dateKey)) return null;
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
};

const _renderSectionSkeleton = (rows = 3) => {
    const rowHtml = Array(rows).fill(0).map(() => `
        <div class="skeleton-row">
            <div class="skeleton-dot"></div>
            <div class="skeleton-line medium"></div>
        </div>
    `).join('');
    return `
        <div class="skeleton-section">
            <div class="skeleton-header">
                <div class="skeleton-icon"></div>
                <div class="skeleton-title-group">
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line medium" style="height: 12px;"></div>
                </div>
            </div>
            <div class="skeleton-body">
                ${rowHtml}
            </div>
        </div>
    `;
};

export const renderSkeleton = () => {
    const sectionsContainer = byId('sectionsContainer');
    if (!sectionsContainer) return;

    sectionsContainer.innerHTML =
        _renderSectionSkeleton(5) +
        _renderSectionSkeleton(4) +
        _renderSectionSkeleton(3) +
        _renderSectionSkeleton(2);
};

export const _doFullRender = () => {
    const data = store.getCurrentDayData();
    renderDate();

    const sectionsContainer = byId('sectionsContainer');
    if (!sectionsContainer) {
        console.error('sectionsContainer 不存在!');
        return;
    }

    const scrollHost = getDomRoot();
    const scrollTop = scrollHost ? scrollHost.scrollTop : 0;
    const activeEl = document.activeElement;
    const activeAction = activeEl ? activeEl.dataset?.action : null;
    const activeTodoId = activeEl ? activeEl.dataset?.todoId : null;

    if (_renderedSectionIds.size === 0) {
        sectionsContainer.innerHTML = '';
    }

    const sections = SectionRegistry.getVisible();
    const newSectionIds = new Set(sections.map(s => s.id));

    _renderedSectionIds.forEach(id => {
        if (!newSectionIds.has(id)) {
            const el = sectionsContainer.querySelector(`[data-section-id="${id}"]`);
            if (el) el.remove();
        }
    });

    const savedThemeWrapper = byId('themeEffectSection');
    const sectionElements = [];
    sections.forEach((section, index) => {
        if (section.id === 'themeEffect' && savedThemeWrapper) {
            savedThemeWrapper.setAttribute('data-section-id', 'themeEffect');
            savedThemeWrapper.style.animationDelay = `${index * 0.05}s`;
            sectionElements.push(savedThemeWrapper);
            return;
        }
        const sectionElement = createDefaultSection(section, data, index);
        if (sectionElement) {
            sectionElement.setAttribute('data-section-id', section.id);
            sectionElement.style.animationDelay = `${index * 0.05}s`;
            sectionElements.push(sectionElement);
        }
    });

    sectionsContainer.innerHTML = '';
    sectionElements.forEach(el => sectionsContainer.appendChild(el));

    _renderedSectionIds = newSectionIds;

    if (typeof Todo !== 'undefined') {
        Todo._syncCollapsedState();
    }

    if (scrollHost) {
        scrollHost.scrollTop = scrollTop;
    }

    if (activeAction) {
        const restoredEl = activeTodoId
            ? document.querySelector(`[data-action="${activeAction}"][data-todo-id="${activeTodoId}"]`)
            : document.querySelector(`[data-action="${activeAction}"]`);
        if (restoredEl) restoredEl.focus();
    }

    setupTimelineHoverEffects();
    setupBambooTooltips();
};

export const renderAll = () => {
    RenderScheduler.markAllDirty();
};

export const markSectionDirty = (sectionId) => {
    RenderScheduler.markDirty(sectionId);
};

/**
 * 把 store 的发布/订阅接到渲染调度器 —— 闭合「异步状态变更 → DOM」链路。
 *
 * 【为什么需要这条桥】store 一直实现了 subscribe/notify（且有单测覆盖），
 * 但生产代码从未订阅过，导致 notify() 沦为空操作。后果：
 * store._ensureCurrentDateLoaded() 补读「不在最近 30 天窗口内」的某日数据后
 * 调用 notify()，却无人接收；而调用方（navigation/datePicker/gestures）
 * 已在同步路径上 markSectionDirty 过，那一刻数据还没到，于是渲染出一份空壳，
 * 之后再也不更新 —— 表现为「向前翻越过第 30 天后时间线与待办空白，且不会自愈」。
 *
 * 【为什么放在渲染层而不是 store 里】保持依赖单向（renderers → store）：
 * store 无需知道渲染器存在，window.markSectionDirty / window.store 在调用时才解析，
 * 避免 store ↔ renderers 的循环 import。
 */
function connectStoreToRenderScheduler() {
    if (typeof window === 'undefined') return;
    const s = window.store;
    if (!s || typeof s.subscribe !== 'function') {
        // 理论上 store.js 先于本文件加载（见 index.html 的 script 顺序）；
        // 万一顺序变了，下一宏任务重试一次，避免静默失去订阅。
        setTimeout(connectStoreToRenderScheduler, 0);
        return;
    }
    if (s.__renderBridgeBound) return;
    s.__renderBridgeBound = true;
    s.subscribe(() => {
        // 异步补读只影响当日数据相关的两个板块。
        // markDirty 幂等，与 navigation/datePicker 里已有的 markSectionDirty 不会重复渲染。
        markSectionDirty('timeline');
        markSectionDirty('todo');
    });
}
connectStoreToRenderScheduler();

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
    if (hours > 0 && mins > 0) return `${hours}时${mins}分`;
    if (hours > 0) return `${hours}时`;
    return `${mins}分`;
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
                        <div class="stub-back-ring" style="--ring-pct: ${num(pct)};">
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

/**
 * 票根（正面日期 + 时段圆点 + 背面汇总）。
 *
 * 【不变量】`stubDateText` 必须由**正在渲染的那一天**算出（renderTimelineSection 传
 * formatSlashDate(dateKey)），不能用 `new Date()`：背面 stubBackData 来自 data.timeline，
 * 是所选那天的真实汇总，正面若读实时时钟就会自相矛盾。
 */
export const buildTicketHTML = (checkInTimes, activePeriod, dotStates, stubBackData, stubDateText = '') => `
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
                                <div class="ticket-stub-date">${stubDateText}</div>
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

export const PERIOD_LABELS = ['凌晨', '黎明', '清晨', '上午', '中午', '下午', '傍晚', '晚上', '深夜'];

/**
 * 时段圆点状态。
 * @param {Array} timeline 该日的时间线
 * @param {string|null} dateKey 正在渲染的那天（YYYY-MM-DD）；非今天则不判定「当前时段」
 */
export const getPeriodDotStates = (timeline, dateKey = null) => {
    const activeKeys = new Set((timeline || []).filter(p => p.items && p.items.length > 0).map(p => p.period));
    const t = currentHourFractionIfToday(dateKey);
    return PERIOD_ORDER.map((key, i) => {
        const range = PERIOD_HOURS[key];
        // 必须显式写 t !== null：`null >= 0` 为 true，只靠范围比较会把「非今天」判成当前时段
        const isCurrent = t !== null && !!range && t >= range[0] && t < range[1];
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
        return `<span class="${HTMLUtils.escapeHtmlAttr(cls)}" data-tip="${HTMLUtils.escapeHtmlAttr(tip)}" aria-hidden="true"></span>`;
    }).join('');
    return `<div class="ticket-period-dots" role="img" aria-label="时段活跃度">${dots}</div>`;
};

/**
 * 某时段现在是否正在进行。
 * @param {string} periodKey
 * @param {string|null} dateKey 正在渲染的那天；非今天恒为 false（这一天的「现在」不存在）
 */
export const isCurrentPeriod = (periodKey, dateKey = null) => {
    const t = currentHourFractionIfToday(dateKey);
    const range = PERIOD_HOURS[periodKey];
    return t !== null && !!range && t >= range[0] && t < range[1];
};

export const buildBambooNodeHTML = (period, index, dateKey = null) => {
    const _isFocus = isCurrentPeriod(period.period, dateKey);
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
        <div class="bamboo-node ${HTMLUtils.escapeHtmlAttr(focus)}" style="animation-delay: ${index * 0.1}s">
            <div class="bamboo-card ${HTMLUtils.escapeHtmlAttr(period.period || '')}">
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
                        <span class="bamboo-count" data-count="${num(count)}" data-hint="${HTMLUtils.escapeHtmlAttr(hint)}">${count}</span>
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
                                    ${item.eval ? `<div class="bamboo-item-eval ${item.eval === 'warn' ? 'warn' : (item.eval === '取消完成' ? 'cancel' : '')}">${escapeHtml(item.eval)}</div>` : ''}
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
    // 「当前时段」高亮必须先知道这是哪一天：看历史某天时不该有任何节点带 focus-now
    const dateKey = resolveRenderedDateKey(data);
    return data.timeline.map((period, i) => buildBambooNodeHTML(period, i, dateKey)).join('');
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
    // 本区块内一切「今天/当前」语义都以这一天为准（data.date），不用实时时钟
    const dateKey = resolveRenderedDateKey(data);
    const checkInTimes = calculateCheckInTimes(timeline);
    const activePeriod = timeline.length > 0 ? getActivePeriod(timeline) : '-';
    const dotStates = getPeriodDotStates(timeline, dateKey);
    const activeCount = dotStates.filter(s => s.hasData).length;
    const stubBackData = {
        activeCount,
        totalPeriods: 9,
        totalEvents: timeline.reduce((sum, p) => sum + (p.items?.length || 0), 0),
        activeDuration: computeActiveDuration(timeline)
    };

    section.innerHTML = `
        <div class="timeline-wrapper">
            ${buildTicketHTML(checkInTimes, activePeriod, dotStates, stubBackData, formatSlashDate(dateKey))}
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
    section.setAttribute('aria-label', '目标地图');

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
        
        const toggleDataAttrs = `data-action="todo-toggle" data-todo-id="${HTMLUtils.escapeHtmlAttr(todo.id)}" data-type="goal_task" data-goal-id="${HTMLUtils.escapeHtmlAttr(todo.goalId || '')}" data-item-idx="${todo.itemIdx !== undefined ? todo.itemIdx : ''}" data-is-completed="${isCompleted}"`;

        return `
            <div class="todo-item ${HTMLUtils.escapeHtmlAttr(completedClass)} ${HTMLUtils.escapeHtmlAttr(goalTaskClass)} ${HTMLUtils.escapeHtmlAttr(archivedClass)}" data-todo-id="${HTMLUtils.escapeHtmlAttr(todo.id)}">
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
                // 单目标聚焦：只保留该目标下的任务（选中下拉后其余目标被筛掉）
                const focusGoalId = (typeof Todo !== 'undefined' && Todo.getFocusGoalId) ? Todo.getFocusGoalId() : null;
                if (focusGoalId) {
                    goalTasks = goalTasks.filter(t => t.goalId === focusGoalId);
                }
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
                        <div class="todo-progress-fill" style="width: ${num(progressPercent)}%"></div>
                    </div>
                    ${pending.length > 0 ? `
                        <div class="todo-group todo-group-goal">
                        <div class="todo-group-header">
                            <div class="todo-group-label">
                                ${LucideUtils.createIcon('target', { size: 16 })}
                                <span>目标任务</span>
                                <span class="todo-group-badge">${pending.length}</span>
                            </div>
                            <div class="todo-group-actions">
                            ${TodoRenderer.renderFocusSelect(pending)}
                            <button class="todo-lottery-btn" data-action="todo-lottery-start"
                                        title="随机抽选一个任务来执行"
                                        aria-label="任务抽签">
                                    ${LucideUtils.createIcon('dice5', { size: 16 })}
                                </button>
                            </div>
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
                                    已完成 (<span class="todo-completed-count">${completed.length}</span>)
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
    'todo-focus-toggle': (_data, target) => {
        const wrap = target.closest('.todo-focus-wrap');
        if (!wrap) return;
        const isOpen = wrap.classList.toggle('open');
        if (isOpen) {
            // 点击外部关闭
            const onDocClick = (ev) => {
                if (!wrap.contains(ev.target)) {
                    wrap.classList.remove('open');
                    document.removeEventListener('click', onDocClick, true);
                }
            };
            // 延迟注册，避免本次 click 立即触发关闭
            setTimeout(() => document.addEventListener('click', onDocClick, true), 0);
        }
    },
    'todo-focus-item': (data) => {
        const goalId = data.goalId || '';
        if (goalId) Todo.setFocusGoal(goalId);
        else Todo.clearFocusGoal();
        const wrap = getDomRoot().querySelector('.todo-focus-wrap.open');
        if (wrap) wrap.classList.remove('open');
    },
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
    //
    // rect 缓存：同一次 hover 内 header 的布局矩形势必不变（除非发生滚动 / 尺寸变化 /
    // 入场动画）。原实现每个 mousemove 都读一次 getBoundingClientRect()，而它紧跟在上一次
    // 的 style 写之后 —— 读-写-读交替 = 每个鼠标移动事件一次强制同步重排。
    let hoverRect = null;
    const invalidateHoverRect = () => { hoverRect = null; };

    container.addEventListener('mousemove', (e) => {
        const header = e.target.closest('.bamboo-card-header');
        if (!header) return;

        const now = Date.now();
        if (!hoverRect || hoverRect.el !== header || now - hoverRect.t > 500) {
            hoverRect = { el: header, rect: header.getBoundingClientRect(), t: now };
        }
        const rect = hoverRect.rect;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        header.style.setProperty('--mouse-x', `${x}%`);
        header.style.setProperty('--mouse-y', `${y}%`);
    });

    container.addEventListener('mouseleave', (e) => {
        const header = e.target.closest('.bamboo-card-header');
        if (!header) return;

        invalidateHoverRect();
        header.style.setProperty('--mouse-x', '50%');
        header.style.setProperty('--mouse-y', '50%');
    }, true); // 使用 capture 确保能捕获到离开

    // 缓存失效的时机：滚动容器是 shadow host（非 window），故 scroll 用捕获阶段接收；
    // 另有 500ms 的时间上限兜住入场/退场动画等未监听到的布局变化。
    window.addEventListener('scroll', invalidateHoverRect, true);
    window.addEventListener('resize', invalidateHoverRect);

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

    /** 定位 tooltip 到指定元素上方 */
    const positionTooltip = (count) => {
        const rect = count.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top - tooltipRect.height - 8;
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
        top = Math.max(8, top);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };

    // 容器级事件委托：动态匹配 .bamboo-count，timeline 重建后仍有效
    const onMouseEnter = (e) => {
        const count = e.target.closest('.bamboo-count');
        if (!count) return;
        const hint = count.dataset.hint;
        if (!hint) return;
        tooltip.textContent = hint;
        tooltip.style.opacity = '1';
        positionTooltip(count);
    };
    const onMouseLeave = (e) => {
        if (!e.target.closest('.bamboo-count')) return;
        tooltip.style.opacity = '0';
    };
    const onMouseMove = (e) => {
        const count = e.target.closest('.bamboo-count');
        if (!count || tooltip.style.opacity !== '1') return;
        positionTooltip(count);
    };
    // 移动端（无 hover）：tap 显示/隐藏提示，并阻止冒泡避免触发 header 折叠
    const onTouchClick = (e) => {
        const count = e.target.closest('.bamboo-count');
        if (!count) return;
        e.stopPropagation();
        const hint = count.dataset.hint;
        if (!hint) { tooltip.style.opacity = '0'; return; }
        if (tooltip.style.opacity === '1' && tooltip._count === count) {
            tooltip.style.opacity = '0';
            tooltip._count = null;
        } else {
            tooltip.textContent = hint;
            tooltip.style.opacity = '1';
            positionTooltip(count);
            tooltip._count = count;
        }
    };

    container.addEventListener('mouseover', onMouseEnter);
    container.addEventListener('mouseout', onMouseLeave);
    container.addEventListener('mousemove', onMouseMove);
    // 移动端/触摸设备（无 hover）才加 tap 触达
    if (typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches) {
        container.addEventListener('click', onTouchClick);
    }
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
window.escapeHtml = escapeHtml;

RenderScheduler.config({
    fullRenderFn: _doFullRender,
    sectionRenderFns: {
        timeline: (section, index) => renderTimelineSection(store.getCurrentDayData()),
        goals: (section, index) => renderGoalsSection(),
        todo: (section, index) => renderTodoSection(),
        themeEffect: (section, index) => {
            const themeHtml = window.ThemeEffects.render(section.theme || 'bamboo');
            const tempThemeDiv = document.createElement('div');
            tempThemeDiv.innerHTML = themeHtml;
            const wrapper = document.createElement('div');
            wrapper.id = 'themeEffectSection';
            while (tempThemeDiv.firstChild) {
                wrapper.appendChild(tempThemeDiv.firstChild);
            }
            setTimeout(() => {
                window.ThemeEffects.init(section.theme || 'bamboo');
            }, 100);
            return wrapper;
        }
    },
    hoverEffectFn: setupTimelineHoverEffects,
    tooltipFn: setupBambooTooltips,
    todoCollapseFn: () => { if (typeof Todo !== 'undefined') Todo._syncCollapsedState(); }
});

window.RenderScheduler = RenderScheduler;
window.markSectionDirty = markSectionDirty;
