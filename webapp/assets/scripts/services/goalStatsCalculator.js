import { parseLocalDate, diffLocalDays } from '../utils/dateUtils.js';

/**
 * 目标统计计算
 * 纯数据计算，无 DOM 操作，无 this. 引用。
 * 从 StatsModal._getGoalStats 提取。
 *
 * 「按天判定」一律走 utils/dateUtils.js 的本地日历口径：`new Date('YYYY-MM-DD')` 按 UTC 午夜
 * 解析，东八区下等价于把日界挪到本地 08:00（本地 00:00–07:59 所有「还剩/逾期/停滞」整体错 1 档），
 * 并在当天算出 `-0` —— 而 `-0 < 0 === false`，「逾期不足一天」会静默落进「还剩 0 天」。
 */
export const GoalStatsCalculator = {
    /**
     * @param {Array} goals 目标列表
     * @param {Date} [now=new Date()] 基准时刻（可显式注入以保证单测确定性；判定一律走本地日历口径）
     */
    calculate(goals, now = new Date()) {
        
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => (g.progress || 0) >= 100).length;
        const inProgressGoals = goals.filter(g => (g.progress || 0) > 0 && (g.progress || 0) < 100).length;
        const notStartedGoals = goals.filter(g => (g.progress || 0) === 0).length;
        const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / totalGoals) : 0;

        const categories = window.GOAL_CATEGORIES || [];
        
        let totalSubItems = 0;
        let completedSubItems = 0;
        goals.forEach(g => {
            if (g.items && g.items.length) {
                g.items.forEach(item => {
                    totalSubItems++;
                    const current = Number(item.currentValue) || 0;
                    const target = Number(item.targetValue) || 0;
                    if (target > 0 && current >= target) {
                        completedSubItems++;
                    }
                });
            }
        });
        
        const highPriorityGoals = goals.filter(g => g.priority === 'high');
        const highPriorityCompleted = highPriorityGoals.filter(g => (g.progress || 0) >= 100).length;
        const activeGoals = goals.filter(g => (g.progress || 0) > 0).length;
        const highPriorityRate = highPriorityGoals.length > 0 ? Math.round((highPriorityCompleted / highPriorityGoals.length) * 100) : 0;

        const DEFAULT_CATEGORY_COLORS = {
            'work': 'var(--bamboo-primary)',
            'personal': '#5A8A9A',
            'health': '#9A5A5A',
            'study': '#9A8A5A',
            'finance': '#5A5A9A',
            'other': '#8A8A8A'
        };

        const catStats = categories.map(cat => {
            const catGoals = goals.filter(g => g.category === cat.id);
            const avgProg = catGoals.length > 0 ? Math.round(catGoals.reduce((s, g) => s + (g.progress || 0), 0) / catGoals.length) : 0;
            const color = cat.color || DEFAULT_CATEGORY_COLORS[cat.id] || 'var(--bamboo-primary)';
            return { category: { ...cat, color }, avgProgress: avgProg, goalCount: catGoals.length };
        }).filter(s => s.goalCount > 0);

        const upcomingGoals = [];
        const urgentGoals = [];
        const overdueGoals = [];
        const recentlyCompleted = [];

        goals.forEach(goal => {
            const isCompleted = (goal.progress || 0) >= 100;
            
            if (isCompleted) {
                recentlyCompleted.push(goal);
            }

            if (goal.endDate) {
                const endDate = parseLocalDate(goal.endDate);
                const daysToEnd = endDate === null ? null : diffLocalDays(now, endDate);
                if (daysToEnd === null) return; // 非法日期串：跳过（原 NaN 比较的等价显式化）
                
                if (daysToEnd < 0) {
                    if ((goal.progress || 0) < 100) {
                        overdueGoals.push({ ...goal, daysOverdue: -daysToEnd });
                    }
                } else if (daysToEnd <= 3) {
                    urgentGoals.push({ ...goal, daysLeft: daysToEnd });
                } else if (daysToEnd <= 7) {
                    upcomingGoals.push({ ...goal, daysLeft: daysToEnd });
                }
            }
        });

        const progressTiers = {
            tier0_25: goals.filter(g => (g.progress || 0) >= 0 && (g.progress || 0) <= 25).length,
            tier26_50: goals.filter(g => (g.progress || 0) > 25 && (g.progress || 0) <= 50).length,
            tier51_75: goals.filter(g => (g.progress || 0) > 50 && (g.progress || 0) <= 75).length,
            tier76_99: goals.filter(g => (g.progress || 0) > 75 && (g.progress || 0) < 100).length,
            tier100: completedGoals
        };

        const stagnantGoals = goals.filter(g => {
            if ((g.progress || 0) >= 100) return false;
            if (!g.startDate) return true;
            const startDate = parseLocalDate(g.startDate);
            const daysSinceStart = startDate === null ? null : diffLocalDays(startDate, now);
            return daysSinceStart !== null && daysSinceStart > 14;
        });

        const subItemCompletionRate = totalSubItems > 0 ? Math.round((completedSubItems / totalSubItems) * 100) : 0;

        const timeSpanStats = {
            shortTerm: 0,
            mediumTerm: 0,
            longTerm: 0
        };
        goals.forEach(g => {
            if (g.startDate && g.endDate) {
                const start = parseLocalDate(g.startDate);
                const end = parseLocalDate(g.endDate);
                const days = start === null || end === null ? null : diffLocalDays(start, end);
                if (days === null) return; // 非法日期串：跳过（原 NaN 比较的等价显式化）
                if (days < 30) timeSpanStats.shortTerm++;
                else if (days <= 90) timeSpanStats.mediumTerm++;
                else timeSpanStats.longTerm++;
            }
        });

        return { 
            totalGoals, completedGoals, inProgressGoals, notStartedGoals, avgProgress, 
            catStats,
            upcomingGoals, urgentGoals, overdueGoals, recentlyCompleted,
            progressTiers, stagnantGoals,
            totalSubItems, completedSubItems, subItemCompletionRate,
            timeSpanStats,
            activeGoals,
            highPriorityRate
        };
    }
};

window.GoalStatsCalculator = GoalStatsCalculator;
