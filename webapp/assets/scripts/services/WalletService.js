/**
 * WalletService — 余额 / 收支 / 归档 / 统计
 * 从 store.js 抽出的钱包子系统
 */

/**
 * 本地日历的 YYYY-MM —— 收入/消费归属月份的**唯一口径**。
 *
 * 必须用 getFullYear/getMonth（本地），不能用 toISOString().slice(0, 7)（UTC）：
 * 东八区下「月首 00:00–07:59」的时刻，其 UTC 仍在上一日/上一月，会被静默记进上个月，
 * 与同月的日记页 key、月报筛选、归档桶全部错位。本子系统其他「按天判定」都用本地日历
 * （new Date(x).toDateString()、store.getDateKey），口径必须对齐。
 * 无法解析时返回 ''，由调用方决定「保留」而非落入空键归档桶。
 */
function localMonthKey(input) {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const WalletService = {

    async updateBalance(amount, type = 'manual', desc = '', date = new Date().toISOString()) {
        const s = store.state;
        s.balance = parseFloat((s.balance + amount).toFixed(2));
        await storageManager.putSetting('balance', s.balance);

        // 增量更新统计缓存
        const today = new Date().toDateString();
        if (s._statsDate !== today) {
            s._statsDate = today;
            s.stats.todayEarnings = 0;
        }

        if (amount > 0) {
            s.stats.todayEarnings = parseFloat((s.stats.todayEarnings + amount).toFixed(2));
            s.stats.totalEarnings = parseFloat((s.stats.totalEarnings + amount).toFixed(2));
            // 竹币收入以「完成时刻对应的当日本地日期」记账，避免按保存时刻(toISOString/UTC)记账导致跨天错记
            await this.addIncomeHistory({
                amount,
                type,
                desc,
                date
            });
        } else if (amount < 0 && type !== 'task_cancel') {
            s.stats.totalSpent = parseFloat((s.stats.totalSpent + Math.abs(amount)).toFixed(2));
        }

        s.stats.date = today;
        await storageManager.putSetting('shopStats', s.stats);
        store.notify();
    },

    async addIncomeHistory(income) {
        const s = store.state;
        // 收入时间以传入的 income.date 为准（完成时刻对应的当日本地日期），不再强制用保存时刻，
        // 否则 UTC 时间戳被解析回本地时会跨天，导致「今日收益」统计错记到次日。
        const effDate = income.date || new Date().toISOString();
        // 去重：如果今日已有相同 desc 的正收入记录，先删除所有旧的再添加
        if (income.desc && income.amount > 0) {
            const today = new Date(effDate).toDateString();
            let adjustedEarnings = 0;
            const filtered = s.incomeHistory.records.filter(inc => {
                if (inc.desc === income.desc && inc.amount > 0 && new Date(inc.date).toDateString() === today) {
                    adjustedEarnings += inc.amount;
                    return false;
                }
                return true;
            });
            if (adjustedEarnings > 0) {
                s.incomeHistory.records = filtered;
                s.stats.todayEarnings = Math.max(0, parseFloat((s.stats.todayEarnings - adjustedEarnings).toFixed(2)));
            }
        }
        // 月份同样锚定本地日历（旧实现 toISOString().slice(0,7) 取 UTC 月，
        // 会让月首凌晨完成的收入错归上月 —— 见 localMonthKey 注释）
        const month = localMonthKey(effDate);
        s.incomeHistory.records.unshift({
            ...income,
            date: effDate,
            month
        });
        await storageManager.putIncomeHistory(s.incomeHistory);
    },

    async removeIncomeHistory(desc) {
        const s = store.state;
        const idx = s.incomeHistory.records.findIndex(inc => inc.desc === desc);
        if (idx === -1) return;

        const removed = s.incomeHistory.records[idx];
        s.incomeHistory.records.splice(idx, 1);
        await storageManager.putIncomeHistory(s.incomeHistory);

        if (removed.amount > 0) {
            const today = new Date().toDateString();
            if (s._statsDate === today) {
                s.stats.todayEarnings = Math.max(0, parseFloat((s.stats.todayEarnings - removed.amount).toFixed(2)));
            }
            s.stats.date = today;
            await storageManager.putSetting('shopStats', s.stats);
        }

        store.notify();
    },

    async addPurchaseHistory(purchase) {
        const s = store.state;
        // 与收入侧对称：尊重调用方传入的 date（消费发生时刻），缺失才回退保存时刻。
        // 旧实现把 date 写在展开之后 → 强制覆盖调用方传值；且 month 取 UTC 月。
        const effDate = purchase.date || new Date().toISOString();
        s.purchaseHistory.records.unshift({
            ...purchase,
            date: effDate,
            month: localMonthKey(effDate)
        });
        await storageManager.putPurchaseHistory(s.purchaseHistory);
        store.notify();
    },

    /** 自动归档：将非近月（当月+上月）的 records 移入 archive */
    async archiveOldRecords() {
        const s = store.state;
        if (!s) return;
        const now = new Date();
        const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
        const recentMonths = new Set([curMonth, prevMonth]);

        let phChanged = false;
        let ihChanged = false;

        // 购买历史归档
        // 归属月以 date 推导（本地日历）为准：record.month 可能是旧实现的 UTC 月，
        // 且 record.date.slice(0,7) 的口径还取决于 date 存的是 UTC ISO 还是本地串。
        // 两者都取不到时保留在 records —— 否则会落进 ('' 空键) 归档桶污染存档。
        const ph = s.purchaseHistory || { records: [], archive: {} };
        const phToArchive = [];
        const phToKeep = [];
        if (!Array.isArray(ph.records)) ph.records = [];
        for (const record of ph.records) {
            const m = localMonthKey(record.date) || record.month || '';
            if (!m || recentMonths.has(m)) {
                phToKeep.push(record);
            } else {
                phToArchive.push(record);
            }
        }
        if (phToArchive.length > 0) {
            for (const record of phToArchive) {
                const m = localMonthKey(record.date) || record.month || '';
                if (!ph.archive[m]) {
                    ph.archive[m] = { totalSpent: 0, totalCount: 0, items: {} };
                }
                const bucket = ph.archive[m];
                bucket.totalCount++;
                bucket.totalSpent += record.price;
                bucket.items[record.id] = bucket.items[record.id] || { count: 0, totalPrice: 0 };
                bucket.items[record.id].count++;
                bucket.items[record.id].totalPrice += record.price;
            }
            ph.records = phToKeep;
            phChanged = true;
        }

        // 收入历史归档（归属月同口径，见上）
        const ih = s.incomeHistory || { records: [], archive: {} };
        const ihToArchive = [];
        const ihToKeep = [];
        if (!Array.isArray(ih.records)) ih.records = [];
        for (const record of ih.records) {
            const m = localMonthKey(record.date) || record.month || '';
            if (!m || recentMonths.has(m)) {
                ihToKeep.push(record);
            } else {
                ihToArchive.push(record);
            }
        }
        if (ihToArchive.length > 0) {
            for (const record of ihToArchive) {
                const m = localMonthKey(record.date) || record.month || '';
                if (!ih.archive[m]) {
                    ih.archive[m] = { totalEarned: 0, totalCount: 0 };
                }
                ih.archive[m].totalCount++;
                ih.archive[m].totalEarned += record.amount;
            }
            ih.records = ihToKeep;
            ihChanged = true;
        }

        if (phChanged) await storageManager.putPurchaseHistory(ph);
        if (ihChanged) await storageManager.putIncomeHistory(ih);
    },

    /** 全量购买计数（records + archive） */
    getPurchaseCounts() {
        const s = store.state;
        const counts = {};
        for (const r of s.purchaseHistory.records) {
            counts[r.id] = (counts[r.id] || 0) + 1;
        }
        for (const monthData of Object.values(s.purchaseHistory.archive)) {
            for (const [id, info] of Object.entries(monthData.items || {})) {
                counts[id] = (counts[id] || 0) + info.count;
            }
        }
        return counts;
    },

    /** 当前可用余额（扣除冻结的今日收入） */
    getAvailableBalance() {
        const { balance, stats } = store.state;
        return Math.max(0, parseFloat((balance - (stats.todayEarnings || 0)).toFixed(2)));
    },

    /**
     * 基于 incomeHistory / purchaseHistory / balance 重新计算 stats，
     * 确保 stats 始终是派生事实，而非独立缓存。
     */
    /** 从收入/消费历史派生理论余额（含归档），用于校准可能损坏的 balance 持久化 */
    computeDerivedBalance() {
        const s = store.state;
        let income = 0;
        for (const r of (s.incomeHistory?.records || [])) income += (r.amount || 0);
        for (const month of Object.values(s.incomeHistory?.archive || {})) {
            income += (month.totalEarned || 0);
        }
        let spent = 0;
        for (const r of (s.purchaseHistory?.records || [])) spent += (r.price || 0);
        for (const month of Object.values(s.purchaseHistory?.archive || {})) {
            spent += (month.totalSpent || 0);
        }
        return parseFloat((income - spent).toFixed(2));
    },

    /**
     * 基于 incomeHistory / purchaseHistory / balance 重新计算 stats，
     * 确保 stats 始终是派生事实，而非独立缓存。
     *
     * 同时校准余额：balance 是「收入 − 消费」的派生事实（其唯一来源为任务完成 +1 /
     * 购买 −price / 取消 −1，且这些动作都已记入 income/purchase 历史）。若持久化损坏
     * 导致 balance 与派生值不符（如历史余额累计丢失、而收入/消费记录仍完好），以派生值
     * 校正，修复「余额归零 / 统计错乱」类数据丢失，避免依赖脆弱的逐步累加持久化。
     */
    async recalibrateStats() {
        const s = store.state;
        const today = new Date().toDateString();

        // 校准余额：以 income/purchase 派生值校正「余额归零/异常」类损坏。
        // 仅在余额 ≤ 0 但派生值应为正时介入——正对应「余额持久化丢失、而收入/消费
        // 记录仍完好」的损坏（如本次 0 vs 应有 273）。正常既有余额（>0 且与派生值一致）
        // 不受影响，避免误伤。
        const derivedBalance = this.computeDerivedBalance();
        if ((parseFloat(s.balance) || 0) <= 0 && derivedBalance > 0.001) {
            s.balance = derivedBalance;
            await storageManager.putSetting('balance', s.balance);
        }

        const todayIncomes = (s.incomeHistory?.records || []).filter(
            inc => new Date(inc.date).toDateString() === today
        );
        const todayEarnings = todayIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);

        let totalSpent = 0;
        const ph = s.purchaseHistory || { records: [], archive: {} };
        for (const r of ph.records) totalSpent += (r.price || 0);
        for (const monthData of Object.values(ph.archive || {})) {
            totalSpent += (monthData?.totalSpent || 0);
        }

        const balance = parseFloat(s.balance) || 0;
        s.stats = {
            todayEarnings,
            totalSpent,
            totalEarnings: parseFloat((balance + totalSpent).toFixed(2)),
            date: today
        };
        // 关键：同步 _statsDate，否则 reload 后首次 updateBalance 会误判跨天，
        // 把刚重算的今日收入清零，导致 getAvailableBalance 虚高（今日收入被错误释放）。
        // _statsDate 是纯内存字段、不持久化，recalibrate 后必须显式对齐到 today。
        s._statsDate = today;
    }
};

window.WalletService = WalletService;
