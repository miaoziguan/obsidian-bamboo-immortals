export const DEFAULT_CATEGORIES = [
    { id: 'work', name: '工作' },
    { id: 'personal', name: '个人' },
    { id: 'health', name: '健康' },
    { id: 'study', name: '学习' },
    { id: 'finance', name: '财务' },
    { id: 'other', name: '其他' }
];

export const GoalService = {
    _customCategories: null,
    // 渲染缓存：getTodayGoalTasks 结果按 (dateStr, goals引用, completionsHash) 缓存
    _todayTasksCache: { key: null, result: null, goalsRef: null, completionsHash: null },

    // ── Goal CRUD（从 store.js 迁入）──

    getAll() {
        return store.state.globalGoals || [];
    },

    getArchived() {
        return this.getAll().filter(g => g.archived);
    },

    async load() {
        try {
            const goals = await storageManager.getGoals();
            if (goals && goals.length > 0) {
                const errors = DataValidator.validateGoals(goals);
                if (errors.length > 0) {
                    console.warn('目标数据校验警告:', errors);
                    DataValidator.sanitizeGoals(goals);
                }
                store.state.globalGoals = goals.map(goal => {
                    if (goal.archived && !goal.archivedAt) {
                        return { ...goal, archivedAt: new Date().toISOString() };
                    }
                    return goal;
                });
            } else {
                await this._migrateFromDayData();
            }
        } catch (e) {
            console.error('Failed to load global goals:', e);
            store.state.globalGoals = [];
        }
        store.notify();
        // store.notify() 目前无 listener 注册，主动触发全局刷新以保证 AI 写入目标后立即可见
        if (typeof renderAll === 'function') renderAll();
        else if (typeof window.renderAll === 'function') window.renderAll();
    },

    async _migrateFromDayData() {
        const dates = Object.keys(store.state.data).sort().reverse();
        let migrated = false;
        for (const dateKey of dates) {
            const dayData = store.state.data[dateKey];
            if (dayData.goals && dayData.goals.length > 0) {
                store.state.globalGoals = dayData.goals.map((goal, idx) => ({
                    ...goal,
                    id: goal.id || ('goal_' + dateKey + '_' + idx),
                    category: goal.category || 'work',
                    startDate: goal.startDate || '',
                    endDate: goal.endDate || goal.deadline || '',
                    items: (goal.items || []).map(item => ({
                        ...item,
                        startDate: item.startDate || '',
                        endDate: item.endDate || '',
                        startValue: item.startValue || '',
                        targetValue: item.targetValue || '',
                        currentValue: item.currentValue || '',
                        dailyMin: item.dailyMin || '',
                        taskDayType: item.taskDayType || 'daily',
                        taskDayConfig: item.taskDayConfig || ''
                    }))
                }));
                migrated = true;
                break;
            }
        }
        if (!migrated) {
            store.state.globalGoals = [];
        }
        await this._save();
    },

    async _save() {
        try {
            await storageManager.putGoals(store.state.globalGoals);
        } catch (e) {
            console.error('Failed to save global goals:', e);
        }
    },

    async add(goal) {
        if (!goal.id) {
            goal.id = 'goal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        }
        const existingIds = new Set(store.state.globalGoals.map(g => g.id));
        if (existingIds.has(goal.id)) {
            goal.id = 'goal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        }
        if (!goal.category) goal.category = 'work';
        if (!goal.startDate) goal.startDate = '';
        if (!goal.endDate) goal.endDate = '';
        if (goal.progress === undefined) goal.progress = 0;
        store.state.globalGoals.push(goal);
        await this._save();
        this._invalidateTasksCache();
        store.notify();
        return goal;
    },

    async update(goalId, updates) {
        const index = store.state.globalGoals.findIndex(g => g.id === goalId);
        if (index >= 0) {
            const { id, ...safeUpdates } = updates;
            store.state.globalGoals[index] = { ...store.state.globalGoals[index], ...safeUpdates, id: goalId };
            await this._save();
            this._invalidateTasksCache();
            store.notify();
        }
    },

    async delete(goalId) {
        store.state.globalGoals = store.state.globalGoals.filter(g => g.id !== goalId);
        await this._save();
        this._invalidateTasksCache();
        store.notify();
    },

    async reorder(goalIds) {
        const goalMap = {};
        store.state.globalGoals.forEach(g => { goalMap[g.id] = g; });
        store.state.globalGoals = goalIds.map(id => goalMap[id]).filter(Boolean);
        await this._save();
        this._invalidateTasksCache();
        store.notify();
    },

    async archive(goalId) {
        const index = store.state.globalGoals.findIndex(g => g.id === goalId);
        if (index >= 0) {
            store.state.globalGoals[index].archived = true;
            store.state.globalGoals[index].archivedAt = new Date().toISOString();
            await this._save();
            this._invalidateTasksCache();
            store.notify();
        }
    },

    async unarchive(goalId) {
        const index = store.state.globalGoals.findIndex(g => g.id === goalId);
        if (index >= 0) {
            store.state.globalGoals[index].archived = false;
            delete store.state.globalGoals[index].archivedAt;
            await this._save();
            this._invalidateTasksCache();
            store.notify();
        }
    },

    /**
     * 失效 getTodayGoalTasks 渲染缓存 — 在 goal 集合或 completions 变更后调用
     */
    _invalidateTasksCache() {
        this._todayTasksCache = { key: null, result: null, goalsRef: null, completionsHash: null };
    },

    async loadCategories() {
        if (this._customCategories !== null) return this._customCategories;
        try {
            const stored = await storageManager.getSetting('goalCategories');
            if (stored && Array.isArray(stored) && stored.length > 0) {
                this._customCategories = stored;
            } else {
                this._customCategories = [...DEFAULT_CATEGORIES];
            }
        } catch (e) {
            this._customCategories = [...DEFAULT_CATEGORIES];
        }
        window.GOAL_CATEGORIES = this._customCategories;
        return this._customCategories;
    },

    getCategories() {
        if (this._customCategories === null) {
            return [...DEFAULT_CATEGORIES];
        }
        return [...this._customCategories];
    },

    async saveCategories(categories) {
        const prevCategories = [...this._customCategories];
        const prevGlobal = window.GOAL_CATEGORIES;
        this._customCategories = [...categories];
        window.GOAL_CATEGORIES = this._customCategories;
        try {
            await storageManager.putSetting('goalCategories', this._customCategories);
        } catch (e) {
            this._customCategories = prevCategories;
            window.GOAL_CATEGORIES = prevGlobal;
            console.error('Failed to save categories:', e);
        }
    },

    calcProgress(goal) {
        if (!goal.items || goal.items.length === 0) return goal.progress || 0;
        const total = goal.items.reduce((sum, item) => sum + (item.percent || 0), 0);
        return Math.round(total / goal.items.length);
    },

    calcDays(startDate, endDate) {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
        const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff + 1 : null;
    },

    calcDaysRemaining(endDate) {
        if (!endDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(endDate + 'T00:00:00');
        if (isNaN(end.getTime())) return null;
        return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    },

    calcSuggestedDaily(item) {
        if (item.targetValue === undefined || item.targetValue === null || item.targetValue === '' ||
            item.startValue === undefined || item.startValue === null || item.startValue === '' ||
            !item.endDate) return null;
        const target = parseFloat(item.targetValue) || 0;
        const start = parseFloat(item.startValue) || 0;
        const currentRaw = parseFloat(item.currentValue);
        const current = (!isNaN(currentRaw) && item.currentValue !== undefined && item.currentValue !== '') ? currentRaw : start;
        const remainingDays = this.calcDaysRemaining(item.endDate);
        if (remainingDays === null || remainingDays <= 0) return null;
        const remaining = target - current;
        if (remaining <= 0) return null;
        return parseFloat((Math.ceil(remaining / remainingDays * 10) / 10).toFixed(1));
    },

    calcProgressFromValues(item) {
        if (item.targetValue === undefined || item.targetValue === null || item.targetValue === '' ||
            item.startValue === undefined || item.startValue === null || item.startValue === '') return item.percent || 0;
        const target = parseFloat(item.targetValue) || 0;
        const start = parseFloat(item.startValue) || 0;
        const currentRaw = parseFloat(item.currentValue);
        const current = (!isNaN(currentRaw) && item.currentValue !== undefined && item.currentValue !== '') ? currentRaw : start;
        if (target === start) return 100;
        // 支持递增和递减型目标：用绝对值计算进度比例
        const totalDistance = Math.abs(target - start);
        const covered = Math.abs(current - start);
        return Math.min(100, Math.max(0, Math.round((covered / totalDistance) * 100)));
    },

    isDailyCompleted(item, goalId, itemIdx, dateStr) {
        if (!item.dailyMin) return false;
        const dailyMin = parseFloat(item.dailyMin) || 0;
        if (dailyMin <= 0) return false;

        if (goalId !== undefined && itemIdx !== undefined) {
            const todayKey = dateStr || this._formatDate(new Date());
            const dayData = store.getDataByDate(todayKey);
            const completedToday = dayData?.goalTaskCompletions?.[goalId]?.[itemIdx] || false;
            if (completedToday) return true;
        }

        return false;
    },

    isTodayTaskDay(item, dateStr) {
        const date = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
        date.setHours(0, 0, 0, 0);

        const startDate = item.startDate ? new Date(item.startDate + 'T00:00:00') : null;
        const endDate = item.endDate ? new Date(item.endDate + 'T00:00:00') : null;

        if (startDate && !isNaN(startDate.getTime())) {
            startDate.setHours(0, 0, 0, 0);
            if (date < startDate) return false;
        }
        if (endDate && !isNaN(endDate.getTime())) {
            endDate.setHours(0, 0, 0, 0);
            if (date > endDate) return false;
        }

        const dayOfWeek = date.getDay();
        const taskDayType = item.taskDayType || 'daily';
        const config = (item.taskDayConfig || '').trim();

        switch (taskDayType) {
            case 'daily':
                return true;
            case 'workday':
                return dayOfWeek >= 1 && dayOfWeek <= 5;
            case 'weekend':
                return dayOfWeek === 0 || dayOfWeek === 6;
            case 'custom_week':
                if (!config) return false;
                const weekDays = config.split(',')
                    .map(d => parseInt(d.trim(), 10))
                    .filter(d => !isNaN(d));
                return weekDays.includes(dayOfWeek);
            case 'custom_month':
                if (!config) return false;
                const monthDays = config.split(',')
                    .map(d => parseInt(d.trim(), 10))
                    .filter(d => !isNaN(d) && (d >= 1 && d <= 31 || d === 99));

                const currentDay = date.getDate();
                const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

                if (monthDays.includes(99) && currentDay === lastDayOfMonth) return true;
                if (monthDays.includes(currentDay)) return true;

                const adjustedDays = monthDays.map(d => d >= 1 && d <= 31 ? Math.min(d, lastDayOfMonth) : d);
                return adjustedDays.includes(currentDay);
            case 'interval':
                const interval = parseInt(config, 10) || 2;
                if (interval <= 0) return false;
                if (!startDate || isNaN(startDate.getTime())) return false;
                startDate.setHours(0, 0, 0, 0);
                const diffDays = Math.round((date - startDate) / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && (diffDays % interval === 0);
            default:
                return true;
        }
    },

    getTodayGoalTasks(dateStr) {
        const goals = store.getGlobalGoals();
        const todayKey = dateStr || this._formatDate(new Date());

        // 缓存键：日期 + goals 数组引用 + 当天 completions 的快速 hash
        const dayData = store.peekDataByDate(todayKey);
        const completions = dayData?.goalTaskCompletions || {};
        // 轻量 hash：把 key 拼接起来。规模：≤ 目标数×子项数，正常使用 100 字符内。
        const completionsHash = JSON.stringify(completions);

        const cache = this._todayTasksCache;
        if (cache.key === todayKey
            && cache.goalsRef === goals
            && cache.completionsHash === completionsHash) {
            return cache.result;
        }

        const todayTasks = [];

        goals.forEach(goal => {
            if (!goal.items || goal.items.length === 0) return;

            goal.items.forEach((item, itemIdx) => {
                const progress = this.calcProgressFromValues(item);
                const isComplete = progress >= 100;
                const isPaused = item.detail === '已搁置';

                if (isPaused) return;

                const todayKey = dateStr || this._formatDate(new Date());
                // 读路径用 peek：缺失时返回空 dayData 但不写入 store、不触发自动保存
                const dayData = store.peekDataByDate(todayKey);
                const completedToday = dayData?.goalTaskCompletions?.[goal.id]?.[itemIdx] || false;

                // 已完成 100% 的任务：仅当日完成时保留显示，次日自动消失
                if (isComplete && !completedToday) return;

                // 已归档目标：已完成的任务保留，未完成的跳过
                if (goal.archived && !completedToday) return;

                const dailyMinValue = parseFloat(item.dailyMin);
                const hasDailyMin = item.dailyMin !== undefined && item.dailyMin !== null && item.dailyMin !== '' && dailyMinValue > 0;
                const hasTimeRange = !!(item.startDate || item.endDate);
                const hasCustomTaskDay = item.taskDayType && item.taskDayType !== 'daily';

                // 今日已完成的任务不检查日期范围和调度配置（可能 endDate 已过但仍需展示）
                if (!completedToday) {
                    const isToday = this.isTodayTaskDay(item, dateStr);
                    if (!isToday) return;

                    if (!hasDailyMin && !hasTimeRange && !hasCustomTaskDay) return;
                }

                let incrementValue = 0;
                if (hasDailyMin) {
                    incrementValue = dailyMinValue;
                } else if (item.targetValue !== undefined && item.targetValue !== null && item.targetValue !== '' &&
                           item.startValue !== undefined && item.startValue !== null && item.startValue !== '') {
                    const suggested = this.calcSuggestedDaily(item);
                    incrementValue = suggested !== null && suggested > 0 ? suggested : 1;
                }

                const hasValues = !!(item.startValue !== undefined && item.startValue !== null && item.startValue !== '' ||
                                     item.targetValue !== undefined && item.targetValue !== null && item.targetValue !== '');

                todayTasks.push({
                    id: `goal_${goal.id}_${itemIdx}`,
                    goalId: goal.id,
                    itemIdx: itemIdx,
                    title: item.name,
                    description: goal.icon ? `${goal.icon} ${goal.title}` : goal.title,
                    dailyMin: hasDailyMin ? dailyMinValue : 0,
                    incrementValue: incrementValue,
                    hasValues: hasValues,
                    currentValue: item.currentValue || item.startValue || '0',
                    targetValue: item.targetValue || '',
                    completed: completedToday,
                    type: 'goal_task',
                    isArchived: !!goal.archived
                });
            });
        });

        // 写缓存
        this._todayTasksCache = {
            key: todayKey,
            goalsRef: goals,
            completionsHash,
            result: todayTasks
        };
        return todayTasks;
    },

    async completeGoalTask(goalId, itemIdx, dateStr, isUncompleting) {
        const todayKey = dateStr || this._formatDate(new Date());
        const actualToday = this._formatDate(new Date());
        const isTodayTask = todayKey === actualToday;
        const dayData = store.getDataByDate(todayKey);

        if (!dayData.goalTaskCompletions) dayData.goalTaskCompletions = {};
        if (!dayData.goalTaskCompletions[goalId]) dayData.goalTaskCompletions[goalId] = {};

        const goals = store.getGlobalGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.items || !goal.items[itemIdx]) {
            store.updateDayDataByDate(todayKey, dayData);
            return;
        }

        const item = goal.items[itemIdx];
        const dailyMin = parseFloat(item.dailyMin) || 0;
        let incrementValue = dailyMin;

        if (!dailyMin && item.targetValue && item.startValue) {
            const suggested = this.calcSuggestedDaily(item);
            incrementValue = suggested !== null && suggested > 0 ? suggested : 1;
        } else if (!dailyMin) {
            incrementValue = 1;
        }

        if (isUncompleting) {
            dayData.goalTaskCompletions[goalId][itemIdx] = false;

            if (item.startValue !== undefined && item.startValue !== null && item.startValue !== '' ||
                item.targetValue !== undefined && item.targetValue !== null && item.targetValue !== '') {
                const currentRaw = parseFloat(item.currentValue);
                const current = (!isNaN(currentRaw) && item.currentValue !== undefined && item.currentValue !== '') ? currentRaw : (parseFloat(item.startValue) || 0);
                const totalStart = parseFloat(item.startValue) || 0;
                const totalTarget = parseFloat(item.targetValue) || totalStart;
                const isDescending = totalTarget < totalStart;
                // 取消完成时：递增目标应减少，递减目标应增加
                const newValue = isDescending ? current + incrementValue : current - incrementValue;
                const minVal = Math.min(totalStart, totalTarget);
                const maxVal = Math.max(totalStart, totalTarget);
                item.currentValue = parseFloat(Math.max(minVal, Math.min(maxVal, newValue)).toFixed(1)).toString();

                if (totalTarget !== totalStart) {
                    const totalDist = Math.abs(totalTarget - totalStart);
                    const covered = Math.abs(parseFloat(item.currentValue) - totalStart);
                    item.percent = Math.min(100, Math.max(0, Math.round((covered / totalDist) * 100)));
                }
            }

            TimelineService.removeEvent(dayData, `${goal.title} - ${item.name}`);
            TimelineService.updateMetrics(dayData);

            // 重算目标总进度和日期范围，确保进度条和境界突破检测使用最新数据
            goal.progress = this.calcProgress(goal);
            if (typeof GoalsRenderer !== 'undefined') {
                GoalsRenderer._autoCalcEndDate(item);
                GoalsRenderer.autoCalcGoalDateRange(goal);
            }

            store.updateDayDataByDate(todayKey, dayData);
            await store.updateGlobalGoal(goalId, goal);
            await store.saveToStorage();
            
            // 取消完成，仅今日任务退回竹币
            const cancelDesc = `完成：${goal.title} - ${item.name}`;
            if (isTodayTask) {
                await store.updateBalance(-1, 'task_cancel', `取消完成：${goal.title} - ${item.name}`);
                await store.removeIncomeHistory(cancelDesc);
            }
            Toast.showToast('目标任务已取消完成', 'info');
        } else {
            dayData.goalTaskCompletions[goalId][itemIdx] = true;

            if (item.startValue !== undefined && item.startValue !== null && item.startValue !== '' ||
                item.targetValue !== undefined && item.targetValue !== null && item.targetValue !== '') {
                const currentRaw = parseFloat(item.currentValue);
                const current = (!isNaN(currentRaw) && item.currentValue !== undefined && item.currentValue !== '') ? currentRaw : (parseFloat(item.startValue) || 0);
                const target = parseFloat(item.targetValue) || current;
                const newValue = current + incrementValue;
                item.currentValue = parseFloat((target >= current ? Math.min(target, newValue) : Math.max(target, newValue)).toFixed(1)).toString();

                const totalStart = parseFloat(item.startValue) || 0;
                const totalTarget = parseFloat(item.targetValue) || totalStart;
                if (totalTarget !== totalStart) {
                    const totalDist = Math.abs(totalTarget - totalStart);
                    const covered = Math.abs(parseFloat(item.currentValue) - totalStart);
                    item.percent = Math.min(100, Math.max(0, Math.round((covered / totalDist) * 100)));
                }
            }

            TimelineService.addEvent(dayData, `${goal.title} - ${item.name}`, '完成');
            TimelineService.updateMetrics(dayData);

            // 重算目标总进度和日期范围，确保进度条和境界突破检测使用最新数据
            goal.progress = this.calcProgress(goal);
            if (typeof GoalsRenderer !== 'undefined') {
                GoalsRenderer._autoCalcEndDate(item);
                GoalsRenderer.autoCalcGoalDateRange(goal);
            }

            store.updateDayDataByDate(todayKey, dayData);
            await store.updateGlobalGoal(goalId, goal);
            await store.saveToStorage();
            
            // 完成目标任务，仅今日任务奖励竹币
            if (isTodayTask) {
                await store.updateBalance(1, 'task_complete', `完成：${goal.title} - ${item.name}`);
                Toast.showToast('目标任务已完成，奖励 1 竹币', 'success');
            } else {
                Toast.showToast('目标任务已完成（非今日任务，不奖励竹币）', 'info');
            }

        }

        // completions 已变更，失效渲染缓存
        this._todayTasksCache = { key: null, result: null, goalsRef: null, completionsHash: null };
    },

    _formatDate(date) {
        // 委托给 utils/goalCalculations.formatDate，避免重复实现
        return GoalCalculations.formatDate(date);
    },

    /**
     * 获取使用指定分类的目标列表（含已归档）
     */
    getGoalsByCategory(categoryId) {
        return store.getGlobalGoals().filter(g => g.category === categoryId);
    },

    /**
     * 将一批目标的分类切换到新分类
     * - 用于分类被删除时对受影响目标做"软回退"
     * - toCategoryId 传空字符串则视为"未分类"
     */
    async reassignGoalsCategory(fromCategoryId, toCategoryId) {
        const goals = store.getGlobalGoals().filter(g => g.category === fromCategoryId);
        if (goals.length === 0) return 0;
        let successCount = 0;
        for (const goal of goals) {
            try {
                goal.category = toCategoryId || '';
                await store.updateGlobalGoal(goal.id, goal);
                successCount++;
            } catch (e) {
                console.error('Failed to reassign goal:', goal.id, e);
            }
        }
        return successCount;
    }
};

window.GoalService = GoalService;

