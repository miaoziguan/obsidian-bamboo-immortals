/**
 * 目标健康分 —— webapp 侧（仅渲染，评分算法 + 诊断文案均已整体迁至宿主）
 *
 * 【单一数据源 · M2 方案 B】评分引擎与系统诊断提示的唯一事实来源是宿主
 * `src/ai/healthScore.ts`（computeGoalHealth / computeHealthSet / buildSetHints）。
 * webapp 只保留一份**纯展示**职责：
 *   - renderOverviewCard(goals, precomputedSet)：把宿主算好的 HealthSet 画成综合健康分环；
 * 数据一律来自插件 `app:getHealthOverview`（renderer.js 的 `_remoteHealth`），
 * 系统诊断提示由宿主 buildSetHints 生成、随 hints 字段下发，webapp 只按 type 上色渲染。
 *
 * 已删除（曾为镜像副本，如今会漂移）：compute / computeSet / _score 系列 / _levelFor / _empty /
 * _buildDataCache / _getGlobalDataCache / _cache* / HOLIDAYS / _isWorkday / _countWorkdays /
 * _countHolidaysInRange / _workdaysBetween / _today / _fmt / _clamp / LEVELS / generateDynamicHints。
 *
 * TUNING 保留：仅剩 _generateSuggestion 读的阈值（SUGGESTION_LOW / SUGGESTION_HIGH），
 * 由 src/ai/__tests__/tuningParity.test.ts 与宿主 TUNING 做全量深比较，防止漂移。
 */

/* =========================================================================
 *  算法参数区 —— 与宿主 src/ai/healthScore.ts 的 TUNING 逐字一致（parity 测试锁定）
 * ========================================================================= */
export const TUNING = {
    WEIGHT_L1: 0.45,
    WEIGHT_L2: 0.30,
    WEIGHT_L3: 0.25,

    L1_ON_TIME: 0.30,
    L1_MODERATE_EARLY: 0.10,
    L1_WEEKLY_ACTIVE: 0.05,

    L2_PROGRESS_TREND: 0.20,
    L2_COMPLETION_TREND: 0.10,

    L3_BALANCE: 0.10,

    RECENT_DAYS: 7,
    STAGNATION_WINDOW: 60,

    TOLERANCE_EARLY_DAYS: 3,
    OVER_EARLY_PENALTY_MAX: 50,
    OVER_EARLY_PENALTY_RATE: 5,
    TOLERANCE_DELAY_DAYS: 3,
    DELAY_PENALTY_MAX: 30,
    DELAY_PENALTY_RATE: 3,

    STAGNATION_EXPONENT: 1.5,
    STAGNATION_DIVISOR: 5,
    STAGNATION_PENALTY_MAX: 40,

    BALANCE_PENALTY_RATE: 1.5,

    TREND_ACCEL_THRESHOLD: 5,

    SUGGESTION_LOW: 60,
    SUGGESTION_HIGH: 85,

    TREND_STRONG_HIGH: 75,
    TREND_WEAK_HIGH: 60,
    TREND_STRONG_LOW: 40,
    TREND_WEAK_LOW: 55,

    LEVEL_EXCELLENT: 85,
    LEVEL_GOOD: 70,
    LEVEL_WARNING: 50,

    HINT_L1: 70,
    HINT_L2: 60,
    HINT_L3: 70,
    HINT_LATE_GOAL_SCORE: 60,
    HINT_STAGNATION_PENALTY: 15,
    HINT_BALANCE_SCORE: 60,
    HINT_HIGH_SCORE: 90
};

export const GoalHealthScore = {
    /**
     * 兼容 store.js / GoalService.js 的失效调用。
     * 评分已移到宿主、前端无本地缓存，此方法保留为空实现（接口不破，语义降级为 no-op）。
     */
    invalidateCache() {
        /* no-op：前端不再持有评分缓存 */
    },

    /**
     * 渲染「综合健康分」环。
     * @param {Array} goals 未归档目标（仅用于判空与 count 展示）
     * @param {Object} precomputedSet 宿主 app:getHealthOverview 返回的 HealthSet（必填）。
     *   缺失（权威快照尚未就绪 / 无插件环境）时渲染「暂不可用」占位，不再本地计算。
     */
    renderOverviewCard(goals, precomputedSet) {
        if (!goals || goals.length === 0) {
            return `
                <div class="goal-health-overview goal-health-empty" role="region" aria-label="健康分空状态">
                    <div class="gho-empty-icon">${LucideUtils.createIcon('target', { size: 14 })}</div>
                    <span class="gho-empty-text">暂无健康数据</span>
                </div>
            `;
        }
        if (!precomputedSet) {
            return `
                <div class="goal-health-overview goal-health-empty" role="region" aria-label="健康分暂不可用">
                    <div class="gho-empty-icon">${LucideUtils.createIcon('clock', { size: 14 })}</div>
                    <span class="gho-empty-text">健康分暂不可用</span>
                </div>
            `;
        }

        const set = precomputedSet;
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

        if (suggestions.length === 0) {
            const compliments = [
                { icon: 'sparkles', text: '状态极佳', tip: '所有维度表现优秀，继续保持良好状态' },
                { icon: 'trophy', text: '战略健康', tip: '整体战略执行能力处于极高水平' },
                { icon: 'heart', text: '健康满分', tip: '目标健康度优秀，继续保持' }
            ];
            return compliments[Math.floor(Math.random() * compliments.length)];
        }

        return suggestions[0];
    }
};

window.GoalHealthScore = GoalHealthScore;
