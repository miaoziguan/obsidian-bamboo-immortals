import { byId, modalMount, eventInTargets } from '../../utils/domRef.js';
export const GoalsRenderer = {
    _expandedGoals: new Set(),
    _collapsedCompleted: new Set(),
    _pendingEditPromise: null,

    // 健康分单一数据源缓存：插件 app:getHealthOverview 返回的权威套件。
    // 同一份数据同时驱动「综合健康分」环与健康分详情弹窗，与竹杖芒鞋 100% 一致。
    _remoteHealth: null,        // { health, results, updatedAt } | null
    _remoteHealthLoading: false,
    _remoteHealthGoalKey: '',   // 已缓存快照对应的目标集合指纹，变化时失效重拉

    // 数值格式化 - 已抽至 utils/goalCalculations.formatNumber
    _formatNumber(value) {
        return GoalCalculations.formatNumber(value);
    },

    async loadCategories() {
        return GoalService.loadCategories();
    },

    getCategories() {
        return GoalService.getCategories();
    },

    async saveCategories(categories) {
        return GoalService.saveCategories(categories);
    },



    calcProgress(goal) {
        return GoalService.calcProgress(goal);
    },

    calcDays(startDate, endDate) {
        return GoalService.calcDays(startDate, endDate);
    },

    calcDaysRemaining(endDate) {
        return GoalService.calcDaysRemaining(endDate);
    },

    calcSuggestedDaily(item) {
        return GoalService.calcSuggestedDaily(item);
    },

    calcProgressFromValues(item) {
        return GoalService.calcProgressFromValues(item);
    },

    autoCalcGoalDateRange(goal) {
        return GoalCalculations.autoCalcGoalDateRange(goal);
    },

    isDailyCompleted(item, goalId, itemIdx, dateStr) {
        return GoalService.isDailyCompleted(item, goalId, itemIdx, dateStr);
    },

    isTodayTaskDay(item, dateStr) {
        return GoalService.isTodayTaskDay(item, dateStr);
    },

    getTodayGoalTasks(dateStr) {
        return GoalService.getTodayGoalTasks(dateStr);
    },

    completeGoalTask(goalId, itemIdx, dateStr, isUncompleting) {
        return GoalService.completeGoalTask(goalId, itemIdx, dateStr, isUncompleting);
    },

    addGoalTaskToTimeline(goal, item, dayData) {
        TimelineService.addEvent(dayData, `${goal.title} - ${item.name}`, '完成');
    },

    removeGoalTaskFromTimeline(goal, item, dayData) {
        TimelineService.removeEvent(dayData, `${goal.title} - ${item.name}`);
    },

    async render(data, container) {
        container = container || byId('goalList');
        if (!container) return;

        await this.loadCategories();

        const goals = store.getGlobalGoals().filter(g => !g.archived);
        
        // 防御性同步：确保所有目标的日期与子项目一致
        // 主修复路径（H2等）已在编辑时触发 autoCalcGoalDateRange，此处仅做兜底
        // 链式串行写入，避免并发冲突
        let dateSyncChain = Promise.resolve();
        for (const goal of goals) {
            const oldStart = goal.startDate;
            const oldEnd = goal.endDate;
            this.autoCalcGoalDateRange(goal);
            if (goal.startDate !== oldStart || goal.endDate !== oldEnd) {
                dateSyncChain = dateSyncChain.then(() =>
                    store.updateGlobalGoal(goal.id, goal).catch(e => console.warn('目标日期同步失败:', e))
                );
            }
        }

        if (!goals || goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card" data-action="goal-add-inline">
                    <div class="empty-state-icon">
                        ${LucideUtils.createIcon('target', { size: 48, strokeWidth: 1.5 })}
                    </div>
                    <div class="empty-state-title">设定你的目标</div>
                    <div class="empty-state-desc">长期目标拆分为可执行的里程碑</div>
                    <div class="empty-state-hint">明确的目标能让你走得更远</div>
                    <div class="empty-state-action">点击创建目标 →</div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="goal-health-shell">
                <div id="goalHealthOverviewHost"></div>
            </div>
            <div class="goal-list-body">
                ${goals.map((goal, idx) => this.renderGoalView(goal, idx)).join('')}
                <div class="goal-list-footer">
                    <button class="goal-inline-add-btn" data-action="goal-add-inline">+ 添加目标</button>
                </div>
            </div>
        `;

        const healthHost = container.querySelector('#goalHealthOverviewHost');
        if (healthHost && window.GoalHealthScore) {
            // 先用本地计算渲染（即时可见），随后若有插件权威套件到达会覆盖刷新
            healthHost.innerHTML = GoalHealthScore.renderOverviewCard(goals);
        }

        // 异步请求插件权威健康分（单一数据源）；到达后自动用同一份数据刷新环
        this._requestRemoteHealth(goals);

        this.bindViewEvents(container);
        this.setupHoverEffects(container);
    },

    renderSingleGoal(goalId) {
        const container = byId('goalList');
        if (!container) return;

        const goals = store.getGlobalGoals().filter(g => !g.archived);
        const goalIdx = goals.findIndex(g => g.id === goalId);
        if (goalIdx === -1) return;

        const goal = goals[goalIdx];
        const goalRow = container.querySelector(`.goal-row[data-goal-id="${CSS.escape(goalId)}"]`);
        if (!goalRow) return;

        const temp = document.createElement('div');
        temp.innerHTML = this.renderGoalView(goal, goalIdx);
        const newRow = temp.firstElementChild;
        goalRow.replaceWith(newRow);
        this.bindViewEvents(container);
        this.setupHoverEffects(container);
    },

    _renderSubItemContent(goal) {
        const hasItems = goal.items && goal.items.length > 0;
        let activeItemsHtml = '';
        let completedItemsHtml = '';
        let completedCount = 0;

        if (hasItems) {
            const sortedItems = goal.items.map((item, originalIdx) => ({ item, originalIdx, itemProgress: this.calcProgressFromValues(item) }));
            
            const activeItems = sortedItems.filter(item => item.itemProgress < 100);
            const completedItems = sortedItems.filter(item => item.itemProgress >= 100);
            completedCount = completedItems.length;

            const renderItem = ({ item, originalIdx, itemProgress }) => {
                const isItemComplete = itemProgress >= 100;
                const isPaused = item.detail === '已搁置';
                const dailyCompleted = this.isDailyCompleted(item, goal.id, originalIdx);
                const dateTagHtml = this.renderSubDateTag(item.startDate, item.endDate);
                
                const currentVal = (item.currentValue !== undefined && item.currentValue !== '' && item.currentValue !== null) ? item.currentValue : item.startValue;
                const targetVal = item.targetValue;
                const formatCurrent = (currentVal !== undefined && currentVal !== '' && currentVal !== null) ? this._formatNumber(currentVal) : null;
                const formatTarget = (targetVal !== undefined && targetVal !== '' && targetVal !== null) ? this._formatNumber(targetVal) : null;
                
                const valueInfo =
                    `<span class="goal-item-value">
                        <span class="goal-item-current-value" 
                              data-inline-edit="currentValue" 
                              data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" 
                              data-sub-idx="${originalIdx}"
                              ${formatCurrent && formatCurrent.displayValue !== formatCurrent.fullValue ? `title="${HTMLUtils.escapeHtmlAttr(formatCurrent.fullValue)}"` : ''}>
                            ${formatCurrent ? escapeHtml(formatCurrent.displayValue) : '<span class="goal-item-empty-placeholder">当前</span>'}
                        </span>
                        <span class="goal-item-value-sep">/</span>
                        <span class="goal-item-target-value" 
                              data-inline-edit="targetValue" 
                              data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" 
                              data-sub-idx="${originalIdx}"
                              ${formatTarget && formatTarget.displayValue !== formatTarget.fullValue ? `title="${HTMLUtils.escapeHtmlAttr(formatTarget.fullValue)}"` : ''}>
                            ${formatTarget ? escapeHtml(formatTarget.displayValue) : '<span class="goal-item-empty-placeholder">目标</span>'}
                        </span>
                    </span>`;
                const dailyBadge =
                    `<span class="goal-item-daily ${dailyCompleted ? 'goal-item-daily-complete' : ''}" data-inline-edit="dailyMin" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">${item.dailyMin ? `每日${escapeHtml(item.dailyMin)}` : '<span class="goal-item-empty-placeholder">每日</span>'}</span>`;
                const dateTag = `<span class="goal-item-date" data-inline-edit="dateRange" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">${dateTagHtml || '<span class="goal-item-empty-placeholder">设置日期</span>'}</span>`;
                // 剩余天数徽章
                let remainingBadge = '';
                if (item.endDate) {
                    const remaining = this.calcDaysRemaining(item.endDate);
                    if (remaining !== null) {
                        let rClass = 'goal-item-remaining';
                        let rText = '';
                        if (remaining < 0) {
                            rClass += ' goal-item-overdue';
                            rText = `超期${Math.abs(remaining)}天`;
                        } else if (remaining === 0) {
                            rClass += ' goal-item-remaining-urgent';
                            rText = '今天截止';
                        } else if (remaining <= 3) {
                            rClass += ' goal-item-remaining-urgent';
                            rText = `剩${remaining}天`;
                        } else {
                            rText = `剩${remaining}天`;
                        }
                        remainingBadge = `<span class="${rClass}">${rText}</span>`;
                    }
                }
                const statusIcon = isPaused
                    ? `<span class="goal-item-status" data-inline-edit="status" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}" title="点击切换状态">${LucideUtils.createIcon('pause', { size: 14 })}</span>`
                    : (isItemComplete ? `<span class="goal-item-status goal-item-status-complete" data-inline-edit="status" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}" title="点击切换状态">${LucideUtils.createIcon('check', { size: 14 })}</span>` : '');
                const hasDetail = item.dailyMin || dateTagHtml;
                return `
                <div class="goal-item-entry ${isItemComplete ? 'goal-item-complete' : ''} ${isPaused ? 'goal-item-paused' : ''}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">
                    <div class="goal-item-row">
                        ${statusIcon}
                        <span class="goal-item-name" data-inline-edit="name" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}">${escapeHtml(item.name)}</span>
                        <div class="goal-item-progress">
                            <div class="goal-item-bar">
                                <div class="goal-item-bar-fill ${isItemComplete ? 'goal-item-bar-complete' : ''}" style="width: ${Math.min(itemProgress, 100)}%"></div>
                            </div>
                            <span class="goal-item-percent ${isItemComplete ? 'goal-item-percent-complete' : ''}">${Math.min(itemProgress, 100)}%</span>
                        </div>
                        <button class="goal-item-delete-btn" data-action="goal-remove-subitem" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-sub-idx="${originalIdx}" title="删除子项目">
                            ${LucideUtils.createIcon('x', { size: 12 })}
                        </button>
                    </div>
                    <div class="goal-item-meta">
                        ${valueInfo}
                        ${hasDetail ? dailyBadge : ''}
                        ${hasDetail ? dateTag : ''}
                        ${!isItemComplete ? remainingBadge : ''}
                    </div>
                </div>
                `;
            };

            activeItemsHtml = activeItems.map(renderItem).join('');
            completedItemsHtml = completedItems.map(renderItem).join('');
        }

        const isCompletedCollapsed = this._collapsedCompleted.has(goal.id);
        const completedSection = completedItemsHtml ? `
            <div class="completed-items-container ${isCompletedCollapsed ? 'collapsed' : ''}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                <div class="completed-items-toggle" data-action="toggle-completed" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                    <span class="completed-items-toggle-icon">${LucideUtils.createIcon('chevronDown', { size: 12 })}</span>
                    <span>已完成 (${completedCount})</span>
                </div>
                <div class="completed-items-list">
                    ${completedItemsHtml}
                </div>
            </div>
        ` : '';

        return activeItemsHtml + completedSection + `
            <button class="goal-item-add-btn" data-action="goal-quick-add-subitem" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                ${LucideUtils.createIcon('plusCircle', { size: 16 })} 添加子项目
            </button>
        `;
    },

    renderGoalView(goal, idx) {
        const hasItems = goal.items && goal.items.length > 0;
        const progress = this.calcProgress(goal);
        const isComplete = progress >= 100;
        const categories = this.getCategories();
        const category = categories.find(c => c.id === goal.category);
        const dateTag = this.renderDateRangeTag(goal.startDate, goal.endDate, `data-inline-edit="dateRange" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}"`, isComplete);
        const categoryTag = category ? `<span class="goal-row-category" data-inline-edit="category" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-category="${HTMLUtils.escapeHtmlAttr(category.id)}">${escapeHtml(category.name)}</span>` : '';
        const priority = goal.priority || 'medium';
        const priorityLabel = priority === 'high' ? '高' : priority === 'medium' ? '中' : '低';
        
        const remaining = this.calcDaysRemaining(goal.endDate);
        const isOverdue = remaining !== null && remaining < 0;
        const isSoon = remaining !== null && remaining >= 0 && remaining <= 3;

        // 剩余天数（仅客观显示，不带背景框）
        let remainingBadge = '';
        if (!isComplete && goal.endDate && remaining !== null) {
            let rText = '';
            if (remaining < 0) {
                rText = `已超期${Math.abs(remaining)}天`;
            } else if (remaining === 0) {
                rText = '今天截止';
            } else {
                rText = `剩${remaining}天`;
            }
            remainingBadge = `<span class="goal-row-remaining">${rText}</span>`;
        }

        return `
        <div class="goal-row ${isComplete ? 'goal-complete' : ''} ${isOverdue ? 'goal-overdue' : ''} ${isSoon ? 'goal-soon' : ''}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-goal-idx="${idx}" onmouseenter="this.classList.add('is-hovered')" onmouseleave="this.classList.remove('is-hovered')">
            <div class="goal-row-main">
                <div class="goal-row-body">
                    <div class="goal-row-top-line">
                        <div class="goal-row-header">
                            ${categoryTag}
                            <span class="goal-row-title ${isComplete ? 'goal-title-complete' : ''}" data-inline-edit="title" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}"><span class="goal-row-title-text">${escapeHtml(goal.title)}</span></span>
                            <span class="goal-priority-tag ${priority}" data-inline-edit="priority" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                                <span class="goal-priority-dot ${priority}"></span>${priorityLabel}
                            </span>
                            <span class="goal-row-toggle">${LucideUtils.createIcon('chevronRight', { size: 14 })}</span>
                        </div>
                        
                        <div class="goal-row-actions">
                            <button class="goal-row-action-btn goal-row-action-btn-info" data-action="goal-save-template" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="保存为模板">
                                ${LucideUtils.createIcon('bookmark', { size: 14 })}
                            </button>
                            <button class="goal-row-action-btn goal-row-action-btn-success" data-action="goal-archive" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="归档">
                                ${LucideUtils.createIcon('archive', { size: 14 })}
                            </button>
                            <button class="goal-row-action-btn goal-row-action-btn-danger" data-action="goal-delete" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="删除">
                                ${LucideUtils.createIcon('trash', { size: 14 })}
                            </button>
                        </div>
                    </div>
                    <div class="goal-row-meta-row">
                        ${goal.meta ? `<span class="goal-row-meta" data-inline-edit="meta" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">${escapeHtml(goal.meta)}</span>` : ''}
                        ${goal.analysis ? `<span class="goal-row-analysis" title="AI 分析">${escapeHtml(goal.analysis)}</span>` : ''}
                        ${dateTag}
                        ${remainingBadge}
                        <span class="goal-row-percent ${isComplete ? 'goal-percent-complete' : ''}">${Math.min(progress, 100)}%</span>
                    </div>
                    <div class="goal-row-progress">
                        <div class="goal-row-bar">
                            <div class="goal-row-bar-fill ${isComplete ? 'goal-bar-complete' : ''}" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="goal-item-list ${hasItems ? (this._expandedGoals.has(goal.id) ? '' : 'collapsed') : 'collapsed'}">
                ${this._renderSubItemContent(goal)}
            </div>
        </div>
        `;
    },

    // ========== 归档管理（委托 GoalsArchiver） ==========

    openArchiveManager() {
        GoalsArchiver.openArchiveManager();
    },

    /** 单项恢复（供 ActionDispatcher 调用） */
    unarchiveGoal(goalId) {
        GoalsArchiver.unarchiveGoal(goalId);
    },

    /** 单项永久删除（供 ActionDispatcher 调用） */
    async deleteArchivedGoal(goalId) {
        return GoalsArchiver.deleteArchivedGoal(goalId);
    },

    // ────────────────────────────────────────────────────────────
    //  健康分单一数据源：优先消费插件 app:getHealthOverview 的权威套件
    // ────────────────────────────────────────────────────────────

    /** 目标集合指纹（用于判断缓存是否失效） */
    _goalSetKey(goals) {
        return (goals || []).map(g => g.id + ':' + (g.archived ? 'a' : 'n')).sort().join('|');
    },

    /**
     * 向插件请求权威健康分套件（单一数据源）。
     * 失败或不可用（非 Obsidian 环境）时静默跳过，沿用本地计算。
     */
    async _requestRemoteHealth(goals) {
        if (this._remoteHealthLoading) return;
        const key = this._goalSetKey(goals);
        // 目标集合变化 → 失效旧快照，重新拉取
        if (this._remoteHealth && this._remoteHealthGoalKey !== key) {
            this._remoteHealth = null;
        }
        if (this._remoteHealth) return;
        if (typeof window.storageManager === 'undefined' || !window.storageManager.getHealthOverview) return;
        this._remoteHealthLoading = true;
        try {
            const data = await window.storageManager.getHealthOverview();
            if (data && data.health) {
                this._remoteHealth = {
                    health: data.health,
                    results: data.results || null,
                    updatedAt: data.updatedAt || null,
                };
                this._remoteHealthGoalKey = key;
                this._renderRemoteHealthCard();
            }
        } catch (e) {
            // 静默降级：保留本地计算
            console.warn('[Bamboo] 远程健康分不可用，沿用本地计算:', e && e.message);
        } finally {
            this._remoteHealthLoading = false;
        }
    },

    /** 用插件权威 set 重渲染健康卡（仅替换环部分，不影响目标列表） */
    _renderRemoteHealthCard() {
        if (!this._remoteHealth || !window.GoalHealthScore) return;
        const host = byId('goalHealthOverviewHost');
        if (host) {
            const goals = store.getGlobalGoals().filter(g => !g.archived);
            host.innerHTML = GoalHealthScore.renderOverviewCard(goals, this._remoteHealth.health);
        }
    },

    openHealthScoreDetail() {
        if (!window.GoalHealthScore) return;

        const goals = store.getGlobalGoals().filter(g => !g.archived);

        // 单一数据源：优先使用插件 app:getHealthOverview 返回的权威套件（与竹杖芒鞋同源同算）。
        // 仅在远程不可用（非 Obsidian 环境 / 通道异常）时退化为本地计算。
        let results, set;
        if (this._remoteHealth && this._remoteHealth.results) {
            set = this._remoteHealth.health;
            results = this._remoteHealth.results;
        } else {
            // Build cache ONCE and reuse everywhere — one pass over last 60 days of store data
            const dataCache = GoalHealthScore._buildDataCache
                ? GoalHealthScore._buildDataCache(goals)
                : null;

            // Compute every goal ONCE (using shared cache → 1 pass over 60 days
            results = goals.map(g => GoalHealthScore.compute(g, dataCache));

            // Pass the precomputed results to computeSet — reuses them 0 extra store reads.
            set = GoalHealthScore.computeSet(goals, results);
        }
        const dynamicHints = GoalHealthScore.generateDynamicHints(set, results);

        let goalsDetailHtml = '';
        if (goals.length > 0) {
            goalsDetailHtml = goals.map((goal, idx) => {
                const healthScore = results[idx];
                const hints = [
                    healthScore.L1.onTime.hint,
                    healthScore.L3.stagnation.hint,
                ].filter(Boolean).join('；');
                return `
                    <div class="health-goal-item">
                        <div class="health-goal-title">${escapeHtml(goal.title)}</div>
                        <div class="health-goal-score" style="color: ${healthScore.color};">
                            ${healthScore.score}分 · ${healthScore.label}
                        </div>
                        <div class="health-goal-hints">
                            ${healthScore.L1.onTime.hint ? `<div class="health-goal-hint">${LucideUtils.createIcon('calendar', { size: 14, strokeWidth: 1.8 })} ${healthScore.L1.onTime.hint}</div>` : ''}
                            ${healthScore.L3.stagnation.hint ? `<div class="health-goal-hint">${LucideUtils.createIcon('clock', { size: 14, strokeWidth: 1.8 })} ${healthScore.L3.stagnation.hint}</div>` : ''}
                        </div>
                        <div class="health-goal-actions">
                            <button class="health-goal-improve" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-goal-title="${HTMLUtils.escapeHtmlAttr(goal.title)}" data-hints="${HTMLUtils.escapeHtmlAttr(hints)}">✨ 用 AI 改进</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const content = `
            <div id="tab-content-overview" class="fab-tab-content active">
                ${typeof StatsModal !== 'undefined' ? StatsModal.renderStatsHTML() : ''}
            </div>

            <div id="tab-content-diagnosis" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div class="health-section-title">核心体检</div>
                    <div class="health-overview-large" style="--avg-color: ${set.avgColor};">
                        <div class="health-score-ring" style="--score: ${set.avgScore}%;">
                            <div class="health-score-inner">
                                <div class="health-score-number" style="color: ${set.avgColor};">
                                    ${set.avgScore}
                                    ${set.trend !== 0 ? `
                                        <span class="score-trend" style="color: ${set.trend > 0 ? 'var(--bamboo-primary)' : '#dc3545'}">
                                            ${set.trend > 0 ? '↑' : '↓'}${Math.abs(set.trend)}
                                        </span>
                                    ` : ''}
                                </div>
                                <div class="health-score-label">健康分</div>
                                <div class="health-score-level">${set.avgLabel}</div>
                            </div>
                        </div>
                        <div class="health-layers-detail">
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: var(--bamboo-primary);"></div>
                                    <span class="health-layer-name">L1 执行力</span>
                                    <span class="health-layer-score" style="color: var(--bamboo-primary);">${set.L1}</span>
                                </div>
                                <div class="health-layer-desc">按时完成、适度提前、周活跃度</div>
                            </div>
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: var(--bamboo-light);"></div>
                                    <span class="health-layer-name">L2 动力指数</span>
                                    <span class="health-layer-score" style="color: var(--bamboo-light);">${set.L2}</span>
                                </div>
                                <div class="health-layer-desc">进度趋势、完成趋势、加速指数</div>
                            </div>
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: #c9a227;"></div>
                                    <span class="health-layer-name">L3 可持续度</span>
                                    <span class="health-layer-score" style="color: #c9a227;">${set.L3}</span>
                                </div>
                                <div class="health-layer-desc">停滞指数、负荷均衡、可持续度</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${goalsDetailHtml ? `
                    <div class="fab-panel-section">
                        <div class="health-section-title">项目诊断</div>
                        <div class="health-goals-list">
                            ${goalsDetailHtml}
                        </div>
                    </div>
                ` : ''}
                
                <div class="fab-panel-section">
                    <div class="health-section-title">系统战略诊断</div>
                    <div class="health-tips">
                        <div class="dynamic-hints-list">
                            ${dynamicHints.map(hint => `
                                <div class="dynamic-hint-item">
                                    <div class="dynamic-hint-content">
                                        <div class="dynamic-hint-text" style="color: ${hint.type === 'danger' ? '#dc3545' : (hint.type === 'warning' ? '#f59e0b' : 'var(--bamboo-primary)')};">
                                            ${hint.text}
                                        </div>
                                        <div class="dynamic-hint-action">
                                            ${hint.action}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div id="tab-content-system" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div class="health-section-title">设计哲学</div>
                    <div class="philosophy-card">
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">三层评估体系</div>
                                <div class="philosophy-desc">从执行力、动力指数到可持续度的全方位诊断，模拟真实世界的目标管理逻辑。</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">时间价值导向</div>
                                <div class="philosophy-desc">重视按时完成，同时避免过度超前，找到时间管理的平衡点。</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">趋势重于结果</div>
                                <div class="philosophy-desc">不仅看当前进度，更关注变化趋势，小步快跑的正向反馈最重要。</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">可持续发展观</div>
                                <div class="philosophy-desc">警惕停滞和过载，鼓励稳定、均衡、可持续的推进节奏。</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">评分标准详解</div>
                    <div class="rating-card">
                        <div class="rating-tier excellent">
                            <div class="rating-badge">优秀</div>
                            <div class="rating-range">85-100分</div>
                            <div class="rating-desc">战略执行处于极高水平，已建立稳固的习惯闭环。保持当前节奏，可尝试逐步增加任务负荷。</div>
                        </div>
                        <div class="rating-tier good">
                            <div class="rating-badge">良好</div>
                            <div class="rating-range">70-84分</div>
                            <div class="rating-desc">整体执行状况良好，在某些维度还有提升空间。继续保持优势，关注诊断提示中的改进点。</div>
                        </div>
                        <div class="rating-tier warning">
                            <div class="rating-badge">需关注</div>
                            <div class="rating-range">50-69分</div>
                            <div class="rating-desc">存在一些需要关注的问题，可能出现进度落后或动力不足。建议根据诊断提示调整策略。</div>
                        </div>
                        <div class="rating-tier risk">
                            <div class="rating-badge">风险</div>
                            <div class="rating-range">0-49分</div>
                            <div class="rating-desc">系统检测到严重风险，项目可能面临停滞或失控。建议立即重新审视目标设定和执行策略。</div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">三层指标体系</div>
                    <div class="layers-detail-card">
                        <div class="layer-detail-item primary">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L1 执行力</div>
                                    <div class="layer-detail-weight">权重：45%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">按时完成率</div>
                                    <div class="metric-weight">30%</div>
                                    <div class="metric-desc">按时（0~-3天）得100，拖延会扣分。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">适度提前率</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">提前1~3天得80，过度超前会扣分。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">周活跃度</div>
                                    <div class="metric-weight">5%</div>
                                    <div class="metric-desc">近7天有推进的工作日占比。</div>
                                </div>
                            </div>
                        </div>
                        <div class="layer-detail-item">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color" style="background: var(--bamboo-light);"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L2 动力指数</div>
                                    <div class="layer-detail-weight">权重：30%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">进度趋势</div>
                                    <div class="metric-weight">20%</div>
                                    <div class="metric-desc">近期进度增量与历史水平的对比。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">完成趋势</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">子任务完成速度的变化趋势。</div>
                                </div>
                            </div>
                        </div>
                        <div class="layer-detail-item">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color" style="background: #c9a227;"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L3 可持续度</div>
                                    <div class="layer-detail-weight">权重：25%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">停滞惩罚</div>
                                    <div class="metric-weight">动态</div>
                                    <div class="metric-desc">无推进天数的指数级惩罚。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">负荷均衡度</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">子任务进度的标准差。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">过度超前惩罚</div>
                                    <div class="metric-weight">动态</div>
                                    <div class="metric-desc">过度提前完成的线性惩罚。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">拖延惩罚</div>
                                    <div class="metric-weight">动态</div>
                                    <div class="metric-desc">拖延的线性惩罚。</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        PanelManager.open('health-score', LucideUtils.createIcon('target', { size: 16 }) + '战略复盘', content, {
            tabs: [
                { id: 'overview', label: '数据概览' },
                { id: 'diagnosis', label: '深度诊断' },
                { id: 'system', label: '评分体系' }
            ],
            onOpen: (panel) => {
                // 根据分数添加视觉动效类
                if (set.avgScore >= 90) {
                    panel.classList.add('status-excellent');
                } else if (set.avgScore < 60) {
                    panel.classList.add('status-risk');
                    const scoreEl = panel.querySelector('.health-score-number');
                    if (scoreEl) scoreEl.classList.add('shake-element');
                }

                // 「用 AI 改进」按钮：把目标喂给插件侧 Agentic 编辑链路
                panel.querySelectorAll('.health-goal-improve').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        const el = btn;
                        const goalId = el.getAttribute('data-goal-id') || '';
                        const title = el.getAttribute('data-goal-title') || '';
                        const hints = el.getAttribute('data-hints') || '';
                        window.parent.postMessage(
                            {
                                type: 'app:aiImproveGoal',
                                id: 'ai_improve_' + Date.now(),
                                payload: { goalId, title, hints },
                            },
                            '*'
                        );
                        if (typeof Toast !== 'undefined') {
                            Toast.showToast('已在 Obsidian 中打开 AI 改进…', 'info');
                        }
                    });
                });
            }
        });
    },



    /**
     * 归档目标（从主页移除，进入归档区）
     */
    async archiveGoal(goalId) {
        await store.archiveGoal(goalId);
        this.render();
        if (typeof TodoRenderer !== 'undefined') TodoRenderer._invalidateCache();
        if (typeof renderAll === 'function') renderAll();
        Toast.showToast('目标已归档，可在目标归档中查看', 'success');
    },

    /**
     * 就地编辑子项目名称
     */


    renderDateRangeTag(startDate, endDate, dataAttrs = '', isComplete = false) {
        if (!startDate && !endDate) return '';
        const days = this.calcDays(startDate, endDate);
        const remaining = this.calcDaysRemaining(endDate);
        let cls = 'goal-date-range';
        let inner = '';

        if (startDate && endDate) {
            inner = `${escapeHtml(startDate)} → ${escapeHtml(endDate)}`;
            if (days !== null) inner += ` (${days}天)`;
        } else if (startDate) {
            inner = `从 ${escapeHtml(startDate)} 起`;
        } else {
            inner = `截止 ${escapeHtml(endDate)}`;
        }

        // 已完成的目标不显示过期/即将到期警告样式
        if (!isComplete && remaining !== null) {
            if (remaining < 0) {
                cls += ' goal-date-overdue';
            } else if (remaining <= 3) {
                cls += ' goal-date-soon';
            }
        }

        return `
            <span class="${cls}"${dataAttrs ? ' ' + dataAttrs : ''}>
                ${inner}
                <div class="goal-date-tooltip">
                    <div class="goal-date-tooltip-arrow"></div>
                    <div class="goal-date-tooltip-content">
                        <div class="goal-date-tooltip-item">根据子项目自动计算</div>
                    </div>
                </div>
            </span>
        `;
    },

    renderSubDateTag(startDate, endDate) {
        if (!startDate && !endDate) return '';
        const days = this.calcDays(startDate, endDate);
        let text = '';
        if (startDate && endDate) {
            text = `${escapeHtml(startDate.slice(5))}→${escapeHtml(endDate.slice(5))}`;
            if (days !== null) text += ` ${days}天`;
        } else if (startDate) {
            text = `从${escapeHtml(startDate.slice(5))}`;
        } else {
            text = `截止${escapeHtml(endDate.slice(5))}`;
        }
        return text;
    },

    bindViewEvents(container) {
        if (container._goalClickHandler) {
            container.removeEventListener('click', container._goalClickHandler);
        }
        if (container._goalKeyHandler) {
            container.removeEventListener('keydown', container._goalKeyHandler);
        }

        container._goalClickHandler = (e) => {
            const t = e.target;

            // 点击健康分卡片
            const healthCard = t.closest('.goal-health-overview');
            if (healthCard) {
                e.stopPropagation();
                this.openHealthScoreDetail();
                return;
            }

            // 操作按钮
            if (t.closest('.goal-row-action-btn')) return;

            // 点击可内联编辑字段 → 仅编辑该字段
            const editable = t.closest('[data-inline-edit]');
            if (editable) {
                e.stopPropagation();
                this._startInlineEdit(editable);
                return;
            }

            // 折叠/展开通过箭头触发
            const toggleBtn = t.closest('.goal-row-toggle');
            if (toggleBtn) {
                const goalRow = toggleBtn.closest('.goal-row');
                if (goalRow) {
                    GoalsRenderer.toggleCollapse(goalRow);
                }
                return;
            }

            // 点击头部区域展开/折叠卡片
            const header = t.closest('.goal-row-header');
            if (header) {
                const goalRow = header.closest('.goal-row');
                if (goalRow) {
                    GoalsRenderer.toggleCollapse(goalRow);
                }
                return;
            }

            // 折叠/展开已完成子项目
            const completedToggle = t.closest('[data-action="toggle-completed"]');
            if (completedToggle) {
                const container = completedToggle.closest('.completed-items-container');
                const goalId = completedToggle.dataset.goalId;
                if (container && goalId) {
                    container.classList.toggle('collapsed');
                    if (container.classList.contains('collapsed')) {
                        GoalsRenderer._collapsedCompleted.add(goalId);
                    } else {
                        GoalsRenderer._collapsedCompleted.delete(goalId);
                    }
                }
                return;
            }

            // 点击操作按钮不触发其他行为
            const actionBtn = t.closest('[data-action]');
            if (actionBtn) return;

            // 点击子项目行不触发折叠
            const itemRow = t.closest('.goal-item-entry');
            if (itemRow) return;
        };

        container.addEventListener('click', container._goalClickHandler);
        
        // 键盘支持 - 无障碍增强
        container._goalKeyHandler = (e) => {
            const healthCard = e.target.closest('.goal-health-overview');
            if (!healthCard) return;
            
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.openHealthScoreDetail();
                
                // 更新 aria-pressed 状态
                const isPressed = healthCard.getAttribute('aria-pressed') === 'true';
                healthCard.setAttribute('aria-pressed', !isPressed);
            }
        };
        container.addEventListener('keydown', container._goalKeyHandler);
    },

    setupHoverEffects(container) {
        // 容器级事件委托：1 个 mousemove + 1 个 mouseleave 替代 N 行监听
        // Clean up previous listeners
        if (container._hoverCleanup) container._hoverCleanup();

        let currentRow = null;
        const onMouseMove = (e) => {
            const row = e.target.closest('.goal-row');
            if (!row || row === currentRow) return; // 同 row 不重复算
            currentRow = row;
            const rect = row.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            row.style.setProperty('--mouse-x', `${x}%`);
            row.style.setProperty('--mouse-y', `${y}%`);
        };
        const onMouseLeave = (e) => {
            // 离开当前 row 才重置
            if (currentRow && !container.contains(e.relatedTarget)) {
                currentRow.style.setProperty('--mouse-x', '50%');
                currentRow.style.setProperty('--mouse-y', '50%');
                currentRow = null;
            }
        };
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);

        container._hoverCleanup = () => {
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseleave', onMouseLeave);
        };
    },

    /**
     * 启动单体行内编辑 — 仅替换被点击的元素为输入框
     */
    _startInlineEdit(el) {
        const editType = el.dataset.inlineEdit;
        const goalId = el.dataset.goalId;
        const subIdx = el.dataset.subIdx !== undefined ? parseInt(el.dataset.subIdx) : null;

        // 防止重复进入编辑
        if (el.querySelector('input, textarea, select')) return;

        const goals = store.getGlobalGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        if (goal.archived) {
            Toast.showToast('已归档目标不可编辑，请先恢复', 'warning');
            return;
        }

        let input;
        let hint = null;
        let closeHintFn = null;
        const saveAndRender = () => {
            if (closeHintFn) { closeHintFn({ target: input }); closeHintFn = null; }
            const val = input.value.trim();
            if (val === '' && (editType === 'title' || editType === 'name')) { this.renderSingleGoal(goalId); return; }
            const doSave = () => {
                return this._commitInlineEdit(goal, subIdx, editType, val).then(() => {
                    this._pendingEditPromise = null;
                    this.renderSingleGoal(goalId);
                }).catch(e => {
                    this._pendingEditPromise = null;
                    console.error('Save failed:', e);
                    this.renderSingleGoal(goalId);
                });
            };
            if (this._pendingEditPromise) {
                this._pendingEditPromise = this._pendingEditPromise.then(doSave, doSave);
            } else {
                this._pendingEditPromise = doSave();
            }
        };
        const cancel = () => { if (closeHintFn) { closeHintFn({ target: input }); } this.renderSingleGoal(goalId); };

        switch (editType) {
            case 'title': {
                const current = el.textContent.trim();
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-weight:600;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:clamp(80px, 15vw, 160px);';
                break;
            }
            case 'meta': {
                const current = el.textContent.trim();
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-size:var(--font-size-xs);color:var(--text-secondary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:80px;';
                break;
            }
            case 'name': {
                const current = el.textContent.replace(/^[✓⏸]\s*/, '').trim();
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-weight:500;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:80px;';
                break;
            }
            case 'currentValue': {
                const rawVal = (subIdx !== null && goal.items && goal.items[subIdx]) 
                    ? (goal.items[subIdx].currentValue !== undefined && goal.items[subIdx].currentValue !== '' ? goal.items[subIdx].currentValue : goal.items[subIdx].startValue)
                    : el.textContent.trim();
                const current = rawVal;
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-weight:500;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:4px 8px;outline:none;background:var(--bamboo-background);min-width:44px;max-width:200px;text-align:right;box-sizing:border-box;';
                const updateCVWidth = () => {
                    const len = input.value.length || 1;
                    input.style.width = Math.max(44, Math.min(200, len * 10 + 24)) + 'px';
                };
                input.addEventListener('input', updateCVWidth);
                updateCVWidth();
                break;
            }
            case 'dailyMin': {
                const current = (subIdx !== null && goal.items && goal.items[subIdx]) ? (goal.items[subIdx].dailyMin || '') : '';
                input = document.createElement('input');
                input.type = 'number';
                input.value = current;
                input.step = 'any';
                input.placeholder = '';
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-size:var(--font-size-xs);color:var(--bamboo-warning);border:none;border-radius:0;padding:0;outline:none;background:transparent;min-width:20px;max-width:90px;text-align:left;box-sizing:border-box;font-weight:600;';
                const updateDMWidth = () => {
                    const len = input.value.length || 1;
                    input.style.width = Math.max(20, Math.min(90, len * 10)) + 'px';
                };
                input.addEventListener('input', updateDMWidth);
                updateDMWidth();
                break;
            }
            case 'targetValue': {
                const rawVal = (subIdx !== null && goal.items && goal.items[subIdx])
                    ? goal.items[subIdx].targetValue
                    : el.textContent.trim();
                const current = rawVal;
                input = document.createElement('input');
                input.type = 'text';
                input.value = current === '-' ? '' : current;
                input.placeholder = '目标';
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-size:var(--font-size-sm);color:var(--text-secondary);border:1px solid var(--bamboo-primary);border-radius:6px;padding:4px 8px;outline:none;background:var(--bamboo-background);min-width:60px;max-width:200px;text-align:center;box-sizing:border-box;';
                // 自动调整宽度适应内容
                const updateWidth = () => {
                    const len = input.value.length || 1;
                    input.style.width = Math.max(60, Math.min(200, len * 10 + 24)) + 'px';
                };
                input.addEventListener('input', updateWidth);
                updateWidth();
                break;
            }
            case 'category': {
                const currentCatId = el.dataset.category || '';
                this._showCategoryPicker({
                    el,
                    currentCatId,
                    onSelect: (catId) => {
                        this._pendingEditPromise = this._commitInlineEdit(goal, null, 'category', catId).then(() => {
                            this._pendingEditPromise = null;
                            this.renderSingleGoal(goalId);
                        }).catch(e => console.warn('[Bamboo] 目标分类保存失败:', e));
                    },
                    onCancel: () => this.renderSingleGoal(goalId)
                });
                return;
            }
            case 'priority': {
                const currentPriority = goal.priority || 'medium';
                this._showPriorityPicker({
                    el,
                    currentPriority,
                    onSelect: (priority) => {
                        this._pendingEditPromise = this._commitInlineEdit(goal, null, 'priority', priority).then(() => {
                            this._pendingEditPromise = null;
                            this.renderSingleGoal(goalId);
                        }).catch(e => console.warn('[Bamboo] 目标优先级保存失败:', e));
                    },
                    onCancel: () => this.renderSingleGoal(goalId)
                });
                return;
            }
            case 'status': {
                if (subIdx === null || !goal.items || !goal.items[subIdx]) return;
                const item = goal.items[subIdx];
                const currentStatus = item.detail || '';
                const nextStatus = currentStatus === '已搁置' ? '' : '已搁置';
                this._pendingEditPromise = this._commitInlineEdit(goal, subIdx, 'status', nextStatus).then(() => {
                    this._pendingEditPromise = null;
                    this.renderSingleGoal(goalId);
                }).catch(e => console.warn('[Bamboo] 目标状态保存失败:', e));
                return;
            }
            case 'dateRange': {
                if (subIdx === null) {
                    Toast.showToast('目标日期根据子项目自动计算', 'info');
                    return;
                }
                // 直接从数据中获取当前日期范围，而不是从显示文本解析
                let currentStart = '';
                let currentEnd = '';
                if (goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    currentStart = item.startDate || '';
                    currentEnd = item.endDate || '';
                }

                // 创建选择器容器
                this._showDateRangePicker({
                    el,
                    goal,
                    subIdx,
                    currentStart,
                    currentEnd,
                    onSelect: (startDate, endDate) => {
                        this._pendingEditPromise = this._commitInlineEdit(goal, subIdx, 'dateRange', `${startDate}→${endDate}`).then(() => {
                            this._pendingEditPromise = null;
                            this.renderSingleGoal(goalId);
                        }).catch(e => console.warn('[Bamboo] 目标日期范围保存失败:', e));
                    },
                    onCancel: () => this.renderSingleGoal(goalId)
                });
                return; // 不走下面的通用输入逻辑
            }
            default:
                return;
        }

        el.replaceWith(input);
        input.focus();
        input.select();

        // 如果是编辑每日值，显示建议提示
        if (editType === 'dailyMin' && subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            const suggested = GoalService.calcSuggestedDaily(item);
            const remainingDays = GoalService.calcDaysRemaining(item.endDate);
            const targetVal = parseFloat(item.targetValue) || 0;
            const currentVal = parseFloat(item.currentValue) || parseFloat(item.startValue) || 0;
            const remainingVal = targetVal - currentVal;
            
            if (suggested !== null && suggested > 0 && remainingVal > 0 && remainingDays !== null) {
                const suggestedVal = String(suggested);
                    
                    // 创建提示
                    const hint = document.createElement('div');
                    hint.className = 'goal-daily-hint';
                    hint.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;"><span>💡 点击填入<br><strong>${suggestedVal}/天</strong></span><span style="cursor:pointer;opacity:0.7;font-size:14px;line-height:1;" class="hint-close">✕</span></div><span style="font-size:10px;opacity:0.8;">剩余 ${remainingVal.toFixed(1)} / ${remainingDays} 天</span>`;
                    hint.style.cssText = 'position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:8px;padding:10px 14px;background:var(--bamboo-primary);color:white;border-radius:10px;font-size:12px;white-space:nowrap;z-index:1000;box-shadow:0 4px 16px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.3);line-height:1.4;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s,opacity:0.2s;';
                    hint.addEventListener('mouseenter', () => {
                        hint.style.transform = 'translateX(-50%) scale(1.05)';
                        hint.style.boxShadow = '0 6px 20px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.4)';
                    });
                    hint.addEventListener('mouseleave', () => {
                        hint.style.transform = 'translateX(-50%) scale(1)';
                        hint.style.boxShadow = '0 4px 16px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.3)';
                    });
                    
                    // 点击填入数值
                    hint.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                    });

                    // 点击页面其他区域关闭（提前定义以便各回调引用）
                    const closeHint = (e) => {
                        if (!eventInTargets(e, hint) && !eventInTargets(e, input)) {
                            hint.style.opacity = '0';
                            setTimeout(() => hint.remove(), 200);
                            document.removeEventListener('click', closeHint);
                        }
                    };
                    closeHintFn = closeHint;
                    
                    hint.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (e.target.classList.contains('hint-close')) return;
                        input.value = suggestedVal;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        hint.style.opacity = '0';
                        setTimeout(() => hint.remove(), 200);
                        document.removeEventListener('click', closeHint);
                        input.removeEventListener('blur', saveAndRender);
                        saveAndRender();
                    });
                    
                    // 关闭按钮
                    const closeBtn = hint.querySelector('.hint-close');
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        hint.style.opacity = '0';
                        setTimeout(() => hint.remove(), 200);
                        document.removeEventListener('click', closeHint);
                    });
                    
                    // 添加小箭头
                    const arrow = document.createElement('div');
                    arrow.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);border:7px solid transparent;border-bottom-color:var(--bamboo-primary);';
                    hint.appendChild(arrow);
                    
                    setTimeout(() => document.addEventListener('click', closeHint), 100);
                    
                    // 给 input 添加包装器
                    const wrapper = document.createElement('div');
                    wrapper.style.cssText = 'position:relative;display:inline-flex;';
                    input.parentNode.replaceChild(wrapper, input);
                    wrapper.appendChild(input);
                    wrapper.appendChild(hint);
            }
        }

        input.addEventListener('blur', saveAndRender, { once: true });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); input.blur(); }
            if (e.key === 'Escape') {
                e.preventDefault(); e.stopPropagation();
                input.removeEventListener('blur', saveAndRender);
                cancel();
            }
        });
    },

    /**
     * 提交单体行内编辑到 store
     */
    async _commitInlineEdit(staleGoal, subIdx, editType, value) {
        return window.GoalInlineEditService.commit(staleGoal, subIdx, editType, value, {
            calcProgress:           (g) => this.calcProgress(g),
            autoCalcEndDate:        (i) => this._autoCalcEndDate(i),
            autoCalcGoalDateRange:  (g) => this.autoCalcGoalDateRange(g),
            renderSingleGoal:       (id) => this.renderSingleGoal(id),
        });
    },

    /**
     * 根据剩余量、每日量、起始日期自动计算结束日期
     * 触发条件：targetValue / dailyMin / currentValue 变更时
     */
    _autoCalcEndDate(item) {
        if (item && item.manuallySetDate) return;
        const target = parseFloat(item.targetValue);
        const dailyMin = parseFloat(item.dailyMin);
        if (!target || !dailyMin || dailyMin <= 0) return;

        const start = parseFloat(item.startValue) || 0;
        const current = parseFloat(item.currentValue) || start;
        const remaining = Math.abs(target - current);
        if (remaining <= 0) return;

        const days = Math.ceil(remaining / dailyMin);
        const startDate = item.startDate ? new Date(item.startDate + 'T00:00:00') : (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
        if (isNaN(startDate.getTime())) return;

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days - 1);
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const newEndDate = fmt(endDate);

        if (item.endDate !== newEndDate) {
            item.endDate = newEndDate;
        }
    },

    /**
     * 显示日期范围选择器
     */
    _showDateRangePicker({ el, goal, subIdx, currentStart, currentEnd, onSelect, onCancel }) {
        return DateRangePicker.show({ el, goal, subIdx, currentStart, currentEnd, onSelect, onCancel });
    },

    /**
     * 显示分类选择器
     */
    _showCategoryPicker({ el, currentCatId, onSelect, onCancel }) {
        const categories = this.getCategories();
        CategoryPicker.show({
            el, categories, currentCatId, onSelect, onCancel,
            onManageCategories: () => {
                this._showCategoryManager(() => {
                    this._showCategoryPicker({ el, currentCatId, onSelect, onCancel });
                });
            }
        });
    },

    _showPriorityPicker({ el, currentPriority, onSelect, onCancel }) {
        return PriorityPicker.show({ el, currentPriority, onSelect, onCancel });
    },

    /**
     * 弹窗让用户从候选分类中选一个作为目标回退目标
     * 返回选中的分类 id，未选择则返回 null
     */
    _promptCategoryMigration(fallbackCats, fromCategoryName) {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            container.className = 'catm-migrate-picker';
            container.innerHTML = `
                <div class="cmp-overlay"></div>
                <div class="cmp-container">
                    <div class="cmp-header">
                        <span class="cmp-title">将「${HTMLUtils.escapeHtml(fromCategoryName)}」的目标迁移到</span>
                        <button class="cmp-close-btn" aria-label="关闭">${LucideUtils.createIcon('x', { size: 16 })}</button>
                    </div>
                    <div class="cmp-body">
                        ${fallbackCats.map(cat => `
                            <div class="cmp-item" data-cat-id="${HTMLUtils.escapeHtmlAttr(cat.id)}">
                                <span class="cmp-item-name">${HTMLUtils.escapeHtml(cat.name)}</span>
                                ${LucideUtils.createIcon('chevronRight', { size: 14 })}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            modalMount().appendChild(container);

            requestAnimationFrame(() => {
                const modal = container.querySelector('.cmp-container');
                modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;';
            });

            let escHandler = null;
            const close = (val) => {
                if (escHandler) {
                    document.removeEventListener('keydown', escHandler);
                    escHandler = null;
                }
                container.remove();
                resolve(val);
            };

            container.querySelector('.cmp-overlay').addEventListener('click', () => close(null));
            container.querySelector('.cmp-close-btn').addEventListener('click', () => close(null));
            container.querySelectorAll('.cmp-item').forEach(item => {
                item.addEventListener('click', () => close(item.dataset.catId));
            });

            setTimeout(() => {
                escHandler = (e) => {
                    if (e.key === 'Escape' && container.isConnected) {
                        close(null);
                    }
                };
                document.addEventListener('keydown', escHandler);
            }, 0);
        });
    },

    /**
     * 显示分类管理面板
     */
    _showCategoryManager(onClose) {
        CategoryManager.show({
            initialCategories: this.getCategories(),
            onSaveCategories: (categories) => this.saveCategories(categories),
            onPromptMigration: (fallbackCats, catName) => this._promptCategoryMigration(fallbackCats, catName),
            onClose
        });
    },

    toggleCollapse(card) {
        const list = card.querySelector('.goal-item-list');
        const toggle = card.querySelector('.goal-row-toggle');
        if (!list) return;
        const isCollapsed = list.classList.contains('collapsed');
        const goalId = card.dataset.goalId;
        if (isCollapsed) {
            list.classList.remove('collapsed');
            if (toggle) toggle.innerHTML = LucideUtils.createIcon('chevronDown', { size: 14 });
            if (goalId) this._expandedGoals.add(goalId);
        } else {
            list.classList.add('collapsed');
            if (toggle) toggle.innerHTML = LucideUtils.createIcon('chevronRight', { size: 14 });
            if (goalId) this._expandedGoals.delete(goalId);
        }
    }
};

ActionDispatcher.registerMany({
    'goal-add-inline': () => GoalsEditor.startAddInline(),
    'goal-archive': (data) => GoalsRenderer.archiveGoal(data.goalId),
    'goal-delete': (data) => GoalsEditor.deleteGoal(data.goalId),
    'goal-unarchive': (data) => GoalsRenderer.unarchiveGoal(data.goalId),
    'goal-delete-archived': (data) => GoalsRenderer.deleteArchivedGoal(data.goalId),
    'goal-remove-subitem': (data) => GoalsEditor.removeSubItem(data.goalId, parseInt(data.subIdx)),
    'goal-quick-add-subitem': (data) => GoalsEditor.quickAddSubItem(data.goalId),
    'goal-save-template': (data) => GoalsEditor.saveAsTemplate(data.goalId)
});

window.GoalsRenderer = GoalsRenderer;

// 注入到 GoalsArchiver
if (typeof GoalsArchiver !== 'undefined') {
    GoalsArchiver.init(GoalsRenderer);
}
