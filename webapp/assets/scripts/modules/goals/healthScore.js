/**
 * 目标健康分评分系统 — 三层评分体系
 *
 * L1 基础健康分（履约能力）45%
 *   - 按时完成率 30%：按时(0~-3天)得100，拖延扣分
 *   - 适度提前率 10%：提前1~3天得80，过度超前扣分
 *   - 周活跃度 5%：近7天有推进的天数占比
 *
 * L2 趋势动力分（成长能力）30%
 *   - 进度趋势 20%：近期进度增速
 *   - 完成趋势 10%：近期子项完成速率
 *
 * L3 可持续性分（健康程度）25%
 *   - 停滞惩罚(动态)：指数增长 (days/5)^1.5
 *   - 负荷均衡度 10%：子项进度标准差
 *   - 过度超前惩罚(动态)：min(50, daysEarly×5)
 *   - 拖延惩罚(动态)：min(30, |daysLate|×3)
 *
 * 自动跳过周末和法定节假日
 */
/* =========================================================================
 *  算法参数区 — 所有"调参在此集中管理，不开放给用户
 *  含义见本文件顶部注释
 * ========================================================================= */
export const TUNING = {
    // 三层总分权重（100% = L1 + L2 + L3
    WEIGHT_L1: 0.45,
    WEIGHT_L2: 0.30,
    WEIGHT_L3: 0.25,

    // L1 内部子项权重（占 L1 的 45% 总权重
    L1_ON_TIME: 0.30,
    L1_MODERATE_EARLY: 0.10,
    L1_WEEKLY_ACTIVE: 0.05,

    // L2 内部子项权重（占 L2 的 30% 总权重
    L2_PROGRESS_TREND: 0.20,
    L2_COMPLETION_TREND: 0.10,

    // L3 内部平衡分权重（占 L3 的 25% 总权重
    L3_BALANCE: 0.10,  // 进度均衡度（剩余部分来自各种惩罚

    // 周活跃度 / 进度趋势的回溯天数
    RECENT_DAYS: 7,

    // 停滞检测的最大回溯天数
    STAGNATION_WINDOW: 60,

    // 过度超前 / 拖延的宽容天数与惩罚系数
    TOLERANCE_EARLY_DAYS: 3,     // 超过此天数开始算"过度超前"
    OVER_EARLY_PENALTY_MAX: 50,
    OVER_EARLY_PENALTY_RATE: 5,
    TOLERANCE_DELAY_DAYS: 3,
    DELAY_PENALTY_MAX: 30,
    DELAY_PENALTY_RATE: 3,

    // 停滞惩罚的指数曲线（days / 5) ^ 1.5
    STAGNATION_EXPONENT: 1.5,
    STAGNATION_DIVISOR: 5,
    STAGNATION_PENALTY_MAX: 40,

    // 平衡分惩罚系数（stdDev * X 作为扣减
    BALANCE_PENALTY_RATE: 1.5,

    // L2 进度趋势的判定阈值
    TREND_ACCEL_THRESHOLD: 5,    // diff > 5 算"加速"

    // 建议系统阈值
    SUGGESTION_LOW: 60,
    SUGGESTION_HIGH: 85,

    // 综合趋势映射
    TREND_STRONG_HIGH: 75,
    TREND_WEAK_HIGH: 60,
    TREND_STRONG_LOW: 40,
    TREND_WEAK_LOW: 55,

    // 等级划分阈值
    LEVEL_EXCELLENT: 85,
    LEVEL_GOOD: 70,
    LEVEL_WARNING: 50,

    // 诊断系统阈值
    HINT_L1: 70,
    HINT_L2: 60,
    HINT_L3: 70,
    HINT_LATE_GOAL_SCORE: 60,
    HINT_STAGNATION_PENALTY: 15,
    HINT_BALANCE_SCORE: 60,
    HINT_HIGH_SCORE: 90
};

export const GoalHealthScore = {
    LEVELS: {
        excellent: { label: '优秀', min: TUNING.LEVEL_EXCELLENT, color: 'var(--bamboo-primary)' },
        good:      { label: '良好', min: TUNING.LEVEL_GOOD, color: 'var(--bamboo-light)' },
        warning:   { label: '需关注', min: TUNING.LEVEL_WARNING, color: '#f59e0b' },
        risk:      { label: '风险', min: 0,  color: '#dc3545' }
    },

    HOLIDAYS: (() => {
        const h = new Set();
        const addForYear = (year, m, d) => h.add(`${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
        const currentYear = new Date().getFullYear();
        // 覆盖当前年和下一年，确保跨年目标假日判断不失效
        [currentYear, currentYear + 1].forEach(y => {
            const add = (m, d) => addForYear(y, m, d);
            add(1,1);
            add(5,1); add(5,2); add(5,3);
            add(10,1); add(10,2); add(10,3); add(10,4); add(10,5); add(10,6); add(10,7);
            add(4,4); add(4,5); add(4,6);
            add(6,9); add(6,10);
            add(9,14); add(9,15); add(9,16);
        });
        // 春节日期（农历，每年不同）— 2025 和 2026
        if (currentYear <= 2025 && 2025 <= currentYear + 1) {
            ['2025-01-28','2025-01-29','2025-01-30','2025-01-31',
             '2025-02-01','2025-02-02','2025-02-03','2025-02-04'].forEach(d => h.add(d));
        }
        if (currentYear <= 2026 && 2026 <= currentYear + 1) {
            ['2026-02-16','2026-02-17','2026-02-18','2026-02-19',
             '2026-02-20','2026-02-21','2026-02-22'].forEach(d => h.add(d));
        }
        return h;
    })(),

    _isWorkday(d) {
        const day = d.getDay();
        if (day === 0 || day === 6) return false;
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return !this.HOLIDAYS.has(key);
    },

    _countWorkdays(from, to) {
        let count = 0;
        const cur = new Date(from);
        cur.setHours(0,0,0,0);
        const end = new Date(to);
        end.setHours(0,0,0,0);
        while (cur < end) {
            if (this._isWorkday(cur)) count++;
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    },

    _workdaysBetween(from, to) {
        const a = new Date(from); a.setHours(0,0,0,0);
        const b = new Date(to); b.setHours(0,0,0,0);
        if (b >= a) return this._countWorkdays(a, b);
        return -this._countWorkdays(b, a);
    },

    _today() {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    },

    _fmt(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    _clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); },

    /**
     * 预处理缓存：一次性扫描目标所需的 N 天历史数据，避免每个目标反复扫描 store.state.data
     *
     * cache = {
     *   byDateKey: {
     *     "2026-06-10": { goalId1: { active: true/false, completions: N, progress: num|undefined }, goalId2: ... }
     *     ... 最多覆盖 STAGNATION_WINDOW 天
     *   },
     *   goalIds: [goalId1, goalId2, ...]
     * }
     */
    _buildDataCache(goals, days) {
        days = days || TUNING.STAGNATION_WINDOW;
        const today = this._today();
        const byDateKey = {};
        const goalIds = (goals || []).map(g => g.id);

        // 1) 先按天遍历一次，从 store 读原始数据
        const allData = (store && store.getState && store.getState() && store.getState().data) || {};
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = this._fmt(d);
            const dayData = allData[key];
            if (!dayData) continue;

            const completionsByGoal = dayData.goalTaskCompletions;
            const progressMap = dayData.goalProgress;
            if (!completionsByGoal && !progressMap) continue;

            const entry = {};
            for (let j = 0; j < goalIds.length; j++) {
                const gid = goalIds[j];
                let active = false;
                let count = 0;
                if (completionsByGoal && completionsByGoal[gid]) {
                    const vals = Object.values(completionsByGoal[gid]);
                    for (let k = 0; k < vals.length; k++) {
                        if (vals[k]) { active = true; count++; }
                    }
                }
                const prog = progressMap ? progressMap[gid] : undefined;
                if (active || prog !== undefined) {
                    entry[gid] = { active: active, completions: count, progress: prog };
                }
            }
            if (Object.keys(entry).length > 0) {
                byDateKey[key] = entry;
            }
        }

        return { byDateKey: byDateKey, goalIds: goalIds, today: today };
    },

    /**
     * 基于缓存快速获取某个 goal 在某一天的活跃状态（是否有完成记录）
     */
    _cacheActiveOnDate(cache, goalId, dateKey) {
        if (!cache || !cache.byDateKey) return false;
        const day = cache.byDateKey[dateKey];
        if (!day) return false;
        const entry = day[goalId];
        return !!entry && !!entry.active;
    },

    /**
     * 基于缓存快速获取某个 goal 在某一天的子项完成数
     */
    _cacheCompletionsOnDate(cache, goalId, dateKey) {
        if (!cache || !cache.byDateKey) return 0;
        const day = cache.byDateKey[dateKey];
        if (!day) return 0;
        const entry = day[goalId];
        return entry ? (entry.completions || 0) : 0;
    },

    /**
     * 基于缓存快速获取某个 goal 在某一天的进度快照
     */
    _cacheProgressOnDate(cache, goalId, dateKey) {
        if (!cache || !cache.byDateKey) return undefined;
        const day = cache.byDateKey[dateKey];
        if (!day) return undefined;
        const entry = day[goalId];
        return entry ? entry.progress : undefined;
    },

    compute(goal, cache) {
        if (!goal) return this._empty();
        const items = Array.isArray(goal.items) ? goal.items : [];
        const progress = this._clamp(Number(goal.progress) || 0, 0, 100);
        const isComplete = progress >= 100;

        const L1 = this._scoreL1(goal, items, progress, isComplete, cache);
        const L2 = this._scoreL2(goal, items, progress, isComplete, cache);
        const L3 = this._scoreL3(goal, items, progress, isComplete, cache);

        const score = this._clamp(Math.round(
            L1.score * TUNING.WEIGHT_L1 +
            L2.score * TUNING.WEIGHT_L2 +
            L3.score * TUNING.WEIGHT_L3
        ), 0, 100);
        const level = this._levelFor(score);

        return {
            score,
            level,
            label: this.LEVELS[level].label,
            color: this.LEVELS[level].color,
            L1, L2, L3
        };
    },

    /**
     * Compute aggregate health metrics for a set of goals.
     *
     * @param {Array} goals - list of goal objects
     * @param {Object|null} preComputedOrCache - either:
     *   - null/undefined: auto-build cache and compute results from scratch
     *   - Object with .score fields (pre-computed results array — one per goal, same order);
     *     if so these are used directly (0 extra store reads).
     *   - else treated as dataCache object: builds results using it.
     */
    computeSet(goals, preComputedOrCache) {
        if (!goals || goals.length === 0) {
            return { avgScore: 0, avgLevel: 'risk', avgLabel: '—', avgColor: '#999', count: 0, L1: 0, L2: 0, L3: 0, trend: 0 };
        }

        let results;
        if (Array.isArray(preComputedOrCache) && preComputedOrCache.length === goals.length && preComputedOrCache[0] && typeof preComputedOrCache[0].score === 'number') {
            // Pre-computed results array — reuse directly, no recomputation needed.
            results = preComputedOrCache;
        } else {
            // Cache or nothing — build and/or use the cache.
            const dataCache = (preComputedOrCache && !Array.isArray(preComputedOrCache))
                ? preComputedOrCache
                : this._buildDataCache(goals, TUNING.STAGNATION_WINDOW);
            results = goals.map(g => this.compute(g, dataCache));
        }

        const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
        const avgL1 = Math.round(results.reduce((s, r) => s + r.L1.score, 0) / results.length);
        const avgL2 = Math.round(results.reduce((s, r) => s + r.L2.score, 0) / results.length);
        const avgL3 = Math.round(results.reduce((s, r) => s + r.L3.score, 0) / results.length);
        const avgLevel = this._levelFor(avgScore);

        // 计算趋势：基于 L2 动力分的综合表现
        let trend = 0;
        const avgL2Score = results.reduce((s, r) => s + r.L2.score, 0) / results.length;
        if (avgL2Score >= TUNING.TREND_STRONG_HIGH) trend = 3;
        else if (avgL2Score >= TUNING.TREND_WEAK_HIGH) trend = 1;
        else if (avgL2Score < TUNING.TREND_STRONG_LOW) trend = -3;
        else if (avgL2Score < TUNING.TREND_WEAK_LOW) trend = -1;

        return {
            avgScore,
            avgLevel,
            avgLabel: this.LEVELS[avgLevel].label,
            avgColor: this.LEVELS[avgLevel].color,
            count: goals.length,
            L1: avgL1,
            L2: avgL2,
            L3: avgL3,
            trend
        };
    },

    // ─── L1 基础健康分（履约能力）45% ───
    _scoreL1(goal, items, progress, isComplete, cache) {
        const onTime = this._scoreOnTime(goal, progress, isComplete);
        const moderateEarly = this._scoreModerateEarly(goal, progress, isComplete);
        const weeklyActive = this._scoreWeeklyActive(goal, items, cache);
        const score = this._clamp(Math.round(
            (onTime.score * TUNING.L1_ON_TIME +
             moderateEarly.score * TUNING.L1_MODERATE_EARLY +
             weeklyActive.score * TUNING.L1_WEEKLY_ACTIVE) /
            (TUNING.L1_ON_TIME + TUNING.L1_MODERATE_EARLY + TUNING.L1_WEEKLY_ACTIVE)
        ), 0, 100);
        return { score: Math.round(score), onTime, moderateEarly, weeklyActive };
    },

    _scoreOnTime(goal, progress, isComplete) {
        if (!goal.endDate) return { score: 70, hint: '未设截止日期' };
        if (goal.startDate && goal.endDate) {
            const s = new Date(goal.startDate + 'T00:00:00');
            const e = new Date(goal.endDate + 'T00:00:00');
            if (s > e) return { score: 0, hint: '日期范围异常' };
        }
        const today = this._today();
        const end = new Date(goal.endDate + 'T00:00:00'); end.setHours(0,0,0,0);
        const daysToDeadline = this._workdaysBetween(today, end);

        if (isComplete) {
            if (daysToDeadline >= -TUNING.TOLERANCE_DELAY_DAYS && daysToDeadline <= 0) return { score: 100, hint: '按时完成' };
            if (daysToDeadline > 0) return { score: 100, hint: '提前完成' };
            const late = Math.abs(daysToDeadline);
            const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
            return { score: this._clamp(100 - penalty, 0, 100), hint: `拖延${late}个工作日` };
        }

        if (daysToDeadline < -TUNING.TOLERANCE_DELAY_DAYS) {
            const late = Math.abs(daysToDeadline);
            const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
            return { score: this._clamp(70 - penalty, 0, 100), hint: `已逾期${late}个工作日` };
        }

        if (!goal.startDate) return { score: 65, hint: '未设开始日期' };
        const start = new Date(goal.startDate + 'T00:00:00'); start.setHours(0,0,0,0);
        if (today < start) return { score: 80, hint: '尚未开始' };

        const totalWorkdays = this._countWorkdays(start, end);
        const elapsedWorkdays = this._countWorkdays(start, today);
        const expected = totalWorkdays > 0 ? (elapsedWorkdays / totalWorkdays) * 100 : 50;
        const diff = progress - expected;

        if (diff >= 0) return { score: 100, hint: '进度达标' };
        if (diff > -15) return { score: this._clamp(85 + diff, 0, 100), hint: '轻微落后' };
        if (diff > -30) return { score: this._clamp(60 + diff * 0.5, 0, 100), hint: '明显落后' };
        return { score: this._clamp(40 + diff * 0.2, 0, 100), hint: '严重落后' };
    },

    _scoreModerateEarly(goal, progress, isComplete) {
        if (!goal.endDate) return { score: 70, hint: '未设截止日期' };
        const today = this._today();
        const end = new Date(goal.endDate + 'T00:00:00'); end.setHours(0,0,0,0);
        const daysToDeadline = this._workdaysBetween(today, end);

        if (isComplete) {
            if (daysToDeadline >= 1 && daysToDeadline <= TUNING.TOLERANCE_EARLY_DAYS) return { score: 80, hint: '适度提前' };
            if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS) {
                const penalty = Math.min(TUNING.OVER_EARLY_PENALTY_MAX, daysToDeadline * TUNING.OVER_EARLY_PENALTY_RATE);
                return { score: this._clamp(80 - penalty, 0, 100), hint: `过度超前${daysToDeadline}天` };
            }
            return { score: 100, hint: '按时完成' };
        }

        if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS && progress >= 90) return { score: 75, hint: '接近完成' };
        return { score: 70, hint: '进行中' };
    },

    _scoreWeeklyActive(goal, items, cache) {
        const today = this._today();
        let activeDays = 0;
        for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            if (!this._isWorkday(d)) continue;
            const key = this._fmt(d);
            if (cache) {
                if (this._cacheActiveOnDate(cache, goal.id, key)) activeDays++;
            } else {
                const allData = (store.getState && store.getState() && store.getState().data) || {};
                const dayData = allData[key];
                if (dayData && dayData.goalTaskCompletions && dayData.goalTaskCompletions[goal.id]) {
                    const completions = dayData.goalTaskCompletions[goal.id];
                    if (Object.values(completions).some(v => v)) activeDays++;
                }
            }
        }
        let workdaysThisWeek = 0;
        for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            if (this._isWorkday(d)) workdaysThisWeek++;
        }
        const ratio = workdaysThisWeek > 0 ? activeDays / workdaysThisWeek : 0;
        return { score: this._clamp(Math.round(ratio * 100), 0, 100), hint: activeDays > 0 ? `周活跃${activeDays}天` : '本周无推进' };
    },

    // ─── L2 趋势动力分（成长能力）30% ───
    _scoreL2(goal, items, progress, isComplete, cache) {
        const progressTrend = this._scoreProgressTrend(goal, items, progress, isComplete, cache);
        const completionTrend = this._scoreCompletionTrend(goal, items, isComplete, cache);
        const score = this._clamp(Math.round(
            (progressTrend.score * TUNING.L2_PROGRESS_TREND +
             completionTrend.score * TUNING.L2_COMPLETION_TREND) /
            (TUNING.L2_PROGRESS_TREND + TUNING.L2_COMPLETION_TREND)
        ), 0, 100);
        return { score: Math.round(score), progressTrend, completionTrend };
    },

    _scoreProgressTrend(goal, items, progress, isComplete, cache) {
        if (isComplete) return { score: 100, hint: '已完成' };
        if (!goal.startDate || !goal.endDate) return { score: 60, hint: '缺少日期信息' };
        if (goal.startDate && goal.endDate) {
            const s = new Date(goal.startDate + 'T00:00:00');
            const e = new Date(goal.endDate + 'T00:00:00');
            if (s > e) return { score: 0, hint: '日期范围异常' };
        }

        const today = this._today();
        const start = new Date(goal.startDate + 'T00:00:00'); start.setHours(0,0,0,0);
        if (today <= start) return { score: 50, hint: '尚未开始' };

        const recentDays = TUNING.RECENT_DAYS;
        let recentProgress = 0;
        let olderProgress = 0;
        let recentHasData = false;
        let olderHasData = false;

        if (cache) {
            // 使用缓存快速查找
            for (let i = 0; i < recentDays; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                const p = this._cacheProgressOnDate(cache, goal.id, key);
                if (p !== undefined) {
                    recentProgress = p;
                    recentHasData = true;
                    break;
                }
            }
            for (let i = recentDays; i < recentDays * 2; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                const p = this._cacheProgressOnDate(cache, goal.id, key);
                if (p !== undefined) {
                    olderProgress = p;
                    olderHasData = true;
                    break;
                }
            }
        } else {
            const allData = (store.getState && store.getState() && store.getState().data) || {};
            for (let i = 0; i < recentDays; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                if (allData[key] && allData[key].goalProgress && allData[key].goalProgress[goal.id] !== undefined) {
                    recentProgress = allData[key].goalProgress[goal.id];
                    recentHasData = true;
                    break;
                }
            }
            for (let i = recentDays; i < recentDays * 2; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                if (allData[key] && allData[key].goalProgress && allData[key].goalProgress[goal.id] !== undefined) {
                    olderProgress = allData[key].goalProgress[goal.id];
                    olderHasData = true;
                    break;
                }
            }
        }

        if (!recentHasData && !olderHasData) {
            const end = new Date(goal.endDate + 'T00:00:00'); end.setHours(0,0,0,0);
            const totalWd = this._countWorkdays(start, end);
            const elapsedWd = this._countWorkdays(start, today);
            const expected = totalWd > 0 ? (elapsedWd / totalWd) * 100 : 50;
            const diff = progress - expected;
            if (diff >= 0) return { score: 80, hint: '进度正常' };
            if (diff > -20) return { score: 60, hint: '稍有落后' };
            return { score: 40, hint: '进度偏慢' };
        }

        if (!olderHasData) return { score: 65, hint: '数据不足' };

        const diff = recentProgress - olderProgress;
        if (diff > TUNING.TREND_ACCEL_THRESHOLD) return { score: 90, hint: '进度加速' };
        if (diff > 0) return { score: 75, hint: '稳步推进' };
        if (diff === 0) return { score: 50, hint: '进度停滞' };
        return { score: 30, hint: '进度倒退' };
    },

    _scoreCompletionTrend(goal, items, isComplete, cache) {
        if (isComplete) return { score: 100, hint: '已完成' };
        if (!items || items.length === 0) return { score: 60, hint: '无子项' };

        const today = this._today();
        let recentCompletions = 0;
        let olderCompletions = 0;

        if (cache) {
            for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                recentCompletions += this._cacheCompletionsOnDate(cache, goal.id, key);
            }
            for (let i = TUNING.RECENT_DAYS; i < TUNING.RECENT_DAYS * 2; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                olderCompletions += this._cacheCompletionsOnDate(cache, goal.id, key);
            }
        } else {
            const allData = (store.getState && store.getState() && store.getState().data) || {};
            for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                if (allData[key] && allData[key].goalTaskCompletions && allData[key].goalTaskCompletions[goal.id]) {
                    Object.values(allData[key].goalTaskCompletions[goal.id]).forEach(v => { if (v) recentCompletions++; });
                }
            }

            for (let i = TUNING.RECENT_DAYS; i < TUNING.RECENT_DAYS * 2; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                if (allData[key] && allData[key].goalTaskCompletions && allData[key].goalTaskCompletions[goal.id]) {
                    Object.values(allData[key].goalTaskCompletions[goal.id]).forEach(v => { if (v) olderCompletions++; });
                }
            }
        }

        if (recentCompletions === 0 && olderCompletions === 0) return { score: 50, hint: '近期无完成' };
        if (recentCompletions > olderCompletions) return { score: 85, hint: '完成加速' };
        if (recentCompletions === olderCompletions) return { score: 65, hint: '完成稳定' };
        return { score: 40, hint: '完成放缓' };
    },

    // ─── L3 可持续性分（健康程度）25% ───
    _scoreL3(goal, items, progress, isComplete, cache) {
        const stagnation = this._scoreStagnation(goal, items, progress, isComplete, cache);
        const balance = this._scoreBalance(items, isComplete);
        const overEarly = this._scoreOverEarly(goal, progress, isComplete);
        const delay = this._scoreDelay(goal, progress, isComplete);

        let score = 100;
        score -= stagnation.penalty;
        // 应用平衡分权重（剩余的 90% 来自其他部分，10% 来自均衡度）
        score = (score * (1.0 - TUNING.L3_BALANCE) + balance.score * TUNING.L3_BALANCE);
        score -= overEarly.penalty;
        score -= delay.penalty;

        return {
            score: this._clamp(Math.round(score), 0, 100),
            stagnation,
            balance,
            overEarly,
            delay
        };
    },

    _scoreStagnation(goal, items, progress, isComplete, cache) {
        if (isComplete) return { penalty: 0, hint: '已完成' };
        if (!goal.startDate) return { penalty: 0, hint: '无开始日期' };

        const today = this._today();
        const start = new Date(goal.startDate + 'T00:00:00'); start.setHours(0,0,0,0);
        if (today <= start) return { penalty: 0, hint: '尚未开始' };

        let lastActiveDate = null;
        if (cache) {
            for (let i = 0; i < TUNING.STAGNATION_WINDOW; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                if (this._cacheActiveOnDate(cache, goal.id, key)) {
                    lastActiveDate = d;
                    break;
                }
            }
        } else {
            const allData = (store.getState && store.getState() && store.getState().data) || {};
            for (let i = 0; i < TUNING.STAGNATION_WINDOW; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = this._fmt(d);
                if (allData[key] && allData[key].goalTaskCompletions && allData[key].goalTaskCompletions[goal.id]) {
                    const completions = allData[key].goalTaskCompletions[goal.id];
                    if (Object.values(completions).some(v => v)) {
                        lastActiveDate = d;
                        break;
                    }
                }
            }
        }

        if (!lastActiveDate) {
            const stagnantDays = this._workdaysBetween(start, today);
            const penalty = Math.min(TUNING.STAGNATION_PENALTY_MAX,
                Math.pow(stagnantDays / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT));
            return { penalty: Math.round(penalty), hint: `从未推进(${stagnantDays}天)` };
        }

        const stagnantDays = this._workdaysBetween(lastActiveDate, today);
        if (stagnantDays <= 2) return { penalty: 0, hint: '近期有推进' };
        const penalty = Math.min(TUNING.STAGNATION_PENALTY_MAX,
            Math.pow(stagnantDays / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT));
        return { penalty: Math.round(penalty), hint: `停滞${stagnantDays}个工作日` };
    },

    _scoreBalance(items, isComplete) {
        if (isComplete) return { score: 100, hint: '已完成' };
        if (!items || items.length <= 1) return { score: 80, hint: '子项不足' };

        const progresses = items.map(it => {
            const tar = parseFloat(it.targetValue);
            if (tar === 0) {
                const cur = parseFloat(it.currentValue) || 0;
                return cur === 0 ? 100 : 0;
            }
            const tarSafe = tar || 100;
            const cur = parseFloat(it.currentValue) || 0;
            return (cur / tarSafe) * 100;
        });

        const avg = progresses.reduce((s, v) => s + v, 0) / progresses.length;
        const variance = progresses.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / progresses.length;
        const stdDev = Math.sqrt(variance);

        const score = this._clamp(Math.round(100 - stdDev * TUNING.BALANCE_PENALTY_RATE), 0, 100);
        return { score, hint: stdDev > 30 ? '进度不均衡' : (stdDev > 15 ? '进度略有差异' : '进度均衡') };
    },

    _scoreOverEarly(goal, progress, isComplete) {
        if (!goal.endDate || !isComplete) return { penalty: 0, hint: '' };
        const today = this._today();
        const end = new Date(goal.endDate + 'T00:00:00'); end.setHours(0,0,0,0);
        const daysEarly = this._workdaysBetween(today, end);
        if (daysEarly > TUNING.TOLERANCE_EARLY_DAYS) {
            const penalty = Math.min(TUNING.OVER_EARLY_PENALTY_MAX, daysEarly * TUNING.OVER_EARLY_PENALTY_RATE);
            return { penalty: Math.round(penalty), hint: `过度超前${daysEarly}天` };
        }
        return { penalty: 0, hint: '' };
    },

    _scoreDelay(goal, progress, isComplete) {
        if (!goal.endDate) return { penalty: 0, hint: '' };
        const today = this._today();
        const end = new Date(goal.endDate + 'T00:00:00'); end.setHours(0,0,0,0);
        const daysLate = this._workdaysBetween(end, today);
        if (daysLate > TUNING.TOLERANCE_DELAY_DAYS) {
            const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, daysLate * TUNING.DELAY_PENALTY_RATE);
            return { penalty: Math.round(penalty), hint: `拖延${daysLate}天` };
        }
        return { penalty: 0, hint: '' };
    },

    // ─── 渲染 ───
    renderOverviewCard(goals) {
        if (!goals || goals.length === 0) {
            return `
                <div class="goal-health-overview goal-health-empty" role="region" aria-label="健康分空状态">
                    <div class="gho-empty-icon">${LucideUtils.createIcon('target', { size: 14 })}</div>
                    <span class="gho-empty-text">暂无健康数据</span>
                </div>
            `;
        }

        const set = this.computeSet(goals);
        const colors = {
            excellent: { start: 'var(--bamboo-primary)', end: 'var(--bamboo-light)' },
            good:      { start: 'var(--bamboo-light)', end: 'var(--bamboo-pale)' },
            warning:   { start: '#E6A252', end: '#F0C88A' },
            risk:      { start: '#E47878', end: '#F0A0A0' }
        }[set.avgLevel] || { start: 'var(--bamboo-light)', end: 'var(--bamboo-pale)' };

        const stroke = 4.5;
        const size = 52;
        const r = (size - stroke) / 2;
        const c = 2 * Math.PI * r;
        const off = c - (set.avgScore / 100) * c;

        // 生成健康建议
        const suggestion = this._generateSuggestion(set);
        const gradientId = 'hlg-' + Math.random().toString(36).slice(2, 8);

        return `
            <div class="goal-health-overview"
                 style="--health-color:${colors.start};--ring-stroke:${colors.start}"
                 role="button"
                 tabindex="0"
                 aria-label="综合健康分 ${set.avgScore} 分，${set.avgLabel}，共 ${set.count} 个目标。点击查看详细分析"
                 aria-haspopup="dialog"
                 aria-pressed="false">
                <div class="gho-left">
                    <div class="gho-ring">
                        <svg class="gho-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
                            <defs>
                                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="${colors.start}"/>
                                    <stop offset="100%" stop-color="${colors.end}"/>
                                </linearGradient>
                            </defs>
                            <circle class="gho-bg" cx="${size/2}" cy="${size/2}" r="${r}" fill="none"/>
                            <circle class="gho-progress" cx="${size/2}" cy="${size/2}" r="${r}" fill="none"
                                stroke="url(#${gradientId})" stroke-width="${stroke}" stroke-linecap="round"
                                style="stroke-dasharray:${c};stroke-dashoffset:${off}"/>
                        </svg>
                        <div class="gho-center">
                            <span class="gho-score">${set.avgScore}</span>
                        </div>
                    </div>
                    <span class="gho-label">${set.avgLabel}</span>
                </div>
                <div class="gho-divider"></div>
                <div class="gho-metrics">
                    <div class="gho-metric">
                        <span class="gho-metric-dot" style="background:${colors.start}"></span>
                        <span class="gho-metric-name">执行</span>
                        <span class="gho-metric-val">${set.L1}</span>
                    </div>
                    <div class="gho-metric">
                        <span class="gho-metric-dot" style="background:var(--bamboo-light)"></span>
                        <span class="gho-metric-name">动力</span>
                        <span class="gho-metric-val">${set.L2}</span>
                    </div>
                    <div class="gho-metric">
                        <span class="gho-metric-dot" style="background:#8B7355"></span>
                        <span class="gho-metric-name">节奏</span>
                        <span class="gho-metric-val">${set.L3}</span>
                    </div>
                </div>
                <div class="gho-divider"></div>
                <div class="gho-suggestion" title="${suggestion.tip}">
                    <span class="gho-suggestion-icon">${LucideUtils.createIcon(suggestion.icon, { size: 12 })}</span>
                    <span class="gho-suggestion-text">${suggestion.text}</span>
                </div>
                <div class="gho-divider"></div>
                <div class="gho-right">
                    <div class="gho-stat">
                        <span class="gho-stat-icon">${LucideUtils.createIcon('target', { size: 11 })}</span>
                        <span class="gho-stat-val">${set.count}</span>
                        <span class="gho-stat-label">目标</span>
                    </div>
                </div>
                <button class="gho-review-btn" title="战略复盘">
                    ${LucideUtils.createIcon('barChart', { size: 13 })}
                    <span>复盘</span>
                </button>
            </div>
        `;
    },

    _generateSuggestion(set) {
        const suggestions = [];

        // 根据各维度分数生成建议
        if (set.L1 < TUNING.SUGGESTION_LOW) {
            suggestions.push({ icon: 'alertTriangle', text: '执行分偏低', tip: '算法检测到执行能力不足，建议增加专注时间投入' });
        } else if (set.L1 >= TUNING.SUGGESTION_HIGH) {
            suggestions.push({ icon: 'checkCircle', text: '执行优秀', tip: '执行能力处于高水平，继续保持' });
        }

        if (set.L2 < TUNING.SUGGESTION_LOW) {
            suggestions.push({ icon: 'zap', text: '动力不足', tip: '近期进度增量低于历史平均，建议完成简单子项激活惯性' });
        } else if (set.L2 >= TUNING.SUGGESTION_HIGH) {
            suggestions.push({ icon: 'flame', text: '动力充沛', tip: '动力指数优秀，趁势推进更多任务' });
        }

        if (set.L3 < TUNING.SUGGESTION_LOW) {
            suggestions.push({ icon: 'clock', text: '节奏失衡', tip: '检测到项目停滞或进度不均，建议关注边缘子项' });
        } else if (set.L3 >= TUNING.SUGGESTION_HIGH) {
            suggestions.push({ icon: 'waves', text: '节奏稳定', tip: '进度分布均衡，可持续发展能力强' });
        }
        
        // 如果所有指标都良好，给出综合鼓励
        if (suggestions.length === 0) {
            const compliments = [
                { icon: 'sparkles', text: '状态极佳', tip: '所有维度表现优秀，继续保持良好状态' },
                { icon: 'trophy', text: '战略健康', tip: '整体战略执行能力处于极高水平' },
                { icon: 'heart', text: '健康满分', tip: '目标健康度优秀，继续保持' }
            ];
            return compliments[Math.floor(Math.random() * compliments.length)];
        }
        
        return suggestions[0];
    },

    _levelFor(score) {
        if (score >= TUNING.LEVEL_EXCELLENT) return 'excellent';
        if (score >= TUNING.LEVEL_GOOD) return 'good';
        if (score >= TUNING.LEVEL_WARNING) return 'warning';
        return 'risk';
    },

    _empty() {
        return { score: 0, level: 'risk', label: '—', color: '#999', L1: { score: 0 }, L2: { score: 0 }, L3: { score: 0 } };
    },

    /**
     * 生成基于算法的动态诊断建议
     * @param {Object} set computeSet 计算出的结果集
     * @param {Array} results 所有目标的详细计算结果
     */
    generateDynamicHints(set, results) {
        const hints = [];

        // 1. L1 履约能力诊断 (算法依据：endDate, startDate, progress)
        if (set.L1 < TUNING.HINT_L1) {
            const lateGoals = results.filter(r => r.L1.onTime.score < TUNING.HINT_LATE_GOAL_SCORE);
            if (lateGoals.length > 0) {
                hints.push({
                    type: 'danger',
                    icon: 'calendar',
                    text: `算法检测到 ${lateGoals.length} 个项目进度严重落后于计划。`,
                    action: '根据当前完成速率，建议调整截止日期或精简任务子项。'
                });
            } else if (set.L1 < 50) {
                hints.push({
                    type: 'warning',
                    icon: 'zap',
                    text: '系统监测到本周活跃天数未达标。',
                    action: '数据表明：小步快跑的频率比单次长时间投入更有助于维持目标健康。'
                });
            }
        }

        // 2. L2 趋势动力诊断 (算法依据：近期 progress 增量对比)
        if (set.L2 < TUNING.HINT_L2) {
            hints.push({
                type: 'warning',
                icon: 'trending-up',
                text: '动力指数下降：近期进度增量低于历史平均水平。',
                action: '诊断：执行动力进入瓶颈期，建议通过完成一个简单的子项来重新激活惯性。'
            });
        }

        // 3. L3 可持续性诊断 (算法依据：stagnantDays, stdDev)
        if (set.L3 < TUNING.HINT_L3) {
            const stagnantGoals = results.filter(r => r.L3.stagnation.penalty > TUNING.HINT_STAGNATION_PENALTY);
            if (stagnantGoals.length > 0) {
                hints.push({
                    type: 'danger',
                    icon: 'clock',
                    text: `检测到 ${stagnantGoals.length} 个项目已停滞超过预期阈值。`,
                    action: '警告：长期停滞会显著降低完成概率，建议立即复查项目可行性。'
                });
            }

            const unbalancedGoals = results.filter(r => r.L3.balance.score < TUNING.HINT_BALANCE_SCORE);
            if (unbalancedGoals.length > 0) {
                hints.push({
                    type: 'warning',
                    icon: 'scale',
                    text: '子项方差过大：项目内部进度分布严重不均。',
                    action: '建议：关注被长期忽略的边缘子项，防止项目后期出现结构性崩塌。'
                });
            }
        }

        // 4. 高分正面激励 (算法依据：综合得分)
        if (set.avgScore >= TUNING.HINT_HIGH_SCORE) {
            hints.push({
                type: 'success',
                icon: 'sparkles',
                text: '算法评估：战略执行力处于极高水平。',
                action: '当前数据模型显示你已建立稳固的习惯闭环，建议保持现状。'
            });
        } else if (hints.length === 0) {
            hints.push({
                type: 'success',
                icon: 'check-circle',
                text: '系统评估：各维度数据指标平稳。',
                action: '建议：当前节奏可持续，可尝试逐步增加任务负荷。'
            });
        }

        return hints;
    }
};

window.GoalHealthScore = GoalHealthScore;

window.TUNING = TUNING;
