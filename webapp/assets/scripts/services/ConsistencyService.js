/**
 * ConsistencyService — 启动自洽校验与自动修复
 *
 * 解决「目标任务待办 ↔ 时间线活动 ↔ 目标进度 ↔ 竹币收支」四方数据不一致。
 * 典型损坏场景：saveToStorage 边缘失败导致当日 goalTaskCompletions / timeline / 竹币
 * 未落 Vault，表现为「待办面板看不到完成，但时间线有记录」「完成了却没竹币」等。
 *
 * 修复维度：
 *   1) 每日：goalTaskCompletions（待办完成态）与时间线活动双向对齐
 *   2) 目标：item.percent / goal.progress 按 currentValue 派生重算，保证内部自洽
 *   3) 钱包：补齐今日完成任务缺失的竹币收入记录，并保守校准余额/统计
 *
 * 设计原则：对已一致数据零副作用；对损坏数据尽力修复；任何异常不影响启动。
 * 依赖通过 globalThis 取用（运行时由对应服务模块挂载），避免与 store 形成循环依赖。
 */
export const ConsistencyService = {

    /**
     * 启动自检与修复。
     * @param {object} store 全局 store 实例
     * @returns {Promise<{days:string[], goals:boolean, wallet:boolean, errors:string[]}>}
     */
    async repair(store) {
        const report = { days: [], goals: false, wallet: false, errors: [] };
        try {
            const goals = this._getGoals(store);
            const { textToId, idToText } = this._buildMaps(goals);

            // 1) 每日：goalTaskCompletions <-> timeline 双向对齐
            const data = (store && store.state && store.state.data) || {};
            for (const dateKey of Object.keys(data)) {
                const dayData = data[dateKey];
                if (!dayData) continue;
                if (this._repairDay(dayData, textToId, idToText)) {
                    if (typeof store.markDayDirty === 'function') store.markDayDirty(dateKey);
                    report.days.push(dateKey);
                }
            }

            // 2) 目标内部自洽（item.percent / goal.progress 派生重算）
            if (this._repairGoals(store && store.state && store.state.globalGoals)) {
                if (store && store._goalsDirty !== undefined) store._goalsDirty = true;
                report.goals = true;
            }

            // 3) 钱包（今日缺失收入记录 + 保守校准余额）
            if (await this._repairWallet(store, idToText)) {
                report.wallet = true;
            }

            if (report.days.length || report.goals || report.wallet) {
                if (typeof store.scheduleAutoSave === 'function') store.scheduleAutoSave();
            }
        } catch (e) {
            report.errors.push(String((e && e.message) || e));
            if (typeof console !== 'undefined') console.error('[ConsistencyService] repair failed:', e);
        }
        return report;
    },

    _getGoals(store) {
        try {
            if (store && typeof store.getGlobalGoals === 'function') return store.getGlobalGoals() || [];
            if (store && store.state && store.state.globalGoals) return store.state.globalGoals;
        } catch (e) { /* ignore */ }
        return [];
    },

    _buildMaps(goals) {
        const textToId = {};
        const idToText = {};
        for (const g of (goals || [])) {
            (g.items || []).forEach((it, idx) => {
                if (!it || !it.name) return;
                const text = `${g.title} - ${it.name}`;
                textToId[text] = { goalId: g.id, itemIdx: idx };
                idToText[`${g.id}::${idx}`] = text;
            });
        }
        return { textToId, idToText };
    },

    /**
     * 单日修复：goalTaskCompletions 与时间线活动双向对齐。
     * 返回是否发生变更。
     */
    _repairDay(dayData, textToId, idToText) {
        let changed = false;
        const completions = dayData.goalTaskCompletions || {};
        if (!dayData.timeline) dayData.timeline = [];

        // 时间线中已完成且能匹配目标的 task 文本
        const timelineDone = new Set();
        for (const period of dayData.timeline) {
            for (const item of (period.items || [])) {
                if (item.eval === '完成' && textToId[item.task]) {
                    timelineDone.add(item.task);
                }
            }
        }

        // 反向：时间线已完成的 -> 补齐 goalTaskCompletions 完成态
        // 注意：仅当该条目「从未记录过」(undefined) 时补齐；若已是显式 false
        // （用户主动取消完成），必须尊重用户选择，绝不能覆盖回 true，否则
        // 「取消完成态后重启又变回完成」的 bug 会复现。
        for (const task of timelineDone) {
            const { goalId, itemIdx } = textToId[task];
            if (!dayData.goalTaskCompletions) dayData.goalTaskCompletions = {};
            if (!dayData.goalTaskCompletions[goalId]) dayData.goalTaskCompletions[goalId] = {};
            if (dayData.goalTaskCompletions[goalId][itemIdx] === undefined) {
                dayData.goalTaskCompletions[goalId][itemIdx] = true;
                changed = true;
            }
        }

        // 正向：goalTaskCompletions 完成的 -> 补齐时间线活动
        const TS = globalThis.TimelineService;
        for (const [gid, items] of Object.entries(completions)) {
            for (const [idx, done] of Object.entries(items)) {
                if (!done) continue;
                const text = idToText[`${gid}::${idx}`];
                if (!text) continue; // 目标可能已删除
                if (!timelineDone.has(text)) {
                    if (TS && typeof TS.addEvent === 'function') {
                        TS.addEvent(dayData, text, '完成');
                    } else {
                        this._pushTimelineItem(dayData, text);
                    }
                    timelineDone.add(text);
                    changed = true;
                }
            }
        }
        return changed;
    },

    _pushTimelineItem(dayData, text) {
        if (!dayData.timeline) dayData.timeline = [];
        let period = dayData.timeline.find(p => p.period === 'evening');
        if (!period) {
            period = { period: 'evening', name: '晚上', time: '18:30 - 22:00', icon: 'coffee', eval: 'good', items: [] };
            dayData.timeline.push(period);
        }
        if (!period.items) period.items = [];
        period.items.push({ time: this._now(), task: text, eval: '完成' });
    },

    _now() {
        try {
            return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '--:--';
        }
    },

    /**
     * 目标内部自洽：item.percent 由 currentValue 派生重算，goal.progress 取 items 均值。
     * 返回是否发生变更。
     */
    _repairGoals(globalGoals) {
        let changed = false;
        for (const g of (globalGoals || [])) {
            let goalChanged = false;
            for (const it of (g.items || [])) {
                const start = parseFloat(it.startValue);
                const target = parseFloat(it.targetValue);
                const cur = parseFloat(it.currentValue);
                if (!isNaN(start) && !isNaN(target) && !isNaN(cur) && target !== start) {
                    const covered = Math.abs(cur - start);
                    const dist = Math.abs(target - start);
                    const expected = Math.min(100, Math.max(0, Math.round((covered / dist) * 100)));
                    if (it.percent !== expected) {
                        it.percent = expected;
                        goalChanged = true;
                    }
                }
            }
            if (g.items && g.items.length) {
                const mean = Math.round(g.items.reduce((s, it) => s + (it.percent || 0), 0) / g.items.length);
                if (g.progress !== mean) {
                    g.progress = mean;
                    goalChanged = true;
                }
            }
            if (goalChanged) changed = true;
        }
        return changed;
    },

    /**
     * 钱包修复：补齐今日完成任务缺失的竹币收入记录；保守校准余额/统计。
     * 返回是否发生变更。
     */
    async _repairWallet(store, idToText) {
        let changed = false;
        if (!store || !store.state) return changed;
        const WS = globalThis.WalletService;
        const todayKey = typeof store.getDateKey === 'function' ? store.getDateKey() : null;
        const dayData = todayKey ? ((store.state.data || {})[todayKey]) : null;
        const completions = dayData && dayData.goalTaskCompletions;

        if (completions && WS) {
            const ih = store.state.incomeHistory || { records: [] };
            const todayStr = new Date().toDateString();
            for (const [gid, items] of Object.entries(completions)) {
                for (const [idx, done] of Object.entries(items)) {
                    if (!done) continue;
                    const entry = idToText[`${gid}::${idx}`];
                    if (!entry) continue;
                    const desc = `完成：${entry}`;
                    const exists = (ih.records || []).some(
                        r => r.desc === desc && new Date(r.date).toDateString() === todayStr
                    );
                    if (!exists && typeof WS.addIncomeHistory === 'function') {
                        // 仅补收入记录；余额由下方 recalibrateStats 统一校正为派生值，避免重复累加。
                        // 日期用 todayKey 对应的当日本地日期（本地风格串，toDateString 恒为该日），避免保存时刻跨天错记
                        const repairDate = `${todayKey}T12:00:00`;
                        await WS.addIncomeHistory({ amount: 1, type: 'task_complete', desc, date: repairDate });
                        changed = true;
                    }
                }
            }
        }

        if (WS && typeof WS.recalibrateStats === 'function') {
            const before = store.state.balance;
            try {
                await WS.recalibrateStats();
            } catch (e) { /* ignore */ }
            if (store.state.balance !== before) changed = true;
        }
        return changed;
    }
};

if (typeof window !== 'undefined') window.ConsistencyService = ConsistencyService;
