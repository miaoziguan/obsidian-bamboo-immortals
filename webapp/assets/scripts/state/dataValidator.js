/**
 * 数据校验与清理
 *
 * 抽自 store.js（原 1101 行）—— 纯工具，零运行时依赖。
 * 浏览器 + Node 测试都可用。
 */
export var DataValidator = {

    VALID_METRICS: ['firstCheckIn', 'completedTasks', 'inspirationCount', 'lastCheckIn', 'activeTime', 'emptySlots'],

    validateDayData: function(data) {
        var errors = [];

        if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
            errors.push('无效日期格式: ' + data.date);
        }

        if (data.metrics) {
            Object.keys(data.metrics).forEach(function(key) {
                if (DataValidator.VALID_METRICS.indexOf(key) === -1) {
                    errors.push('未知指标: ' + key);
                }
            });
        }

        if (data.goals && Array.isArray(data.goals)) {
            data.goals.forEach(function(goal, i) {
                if (!goal.title || typeof goal.title !== 'string') errors.push('goals[' + i + '] 缺少有效 title');
                if (goal.items && !Array.isArray(goal.items)) errors.push('goals[' + i + '] items 必须是数组');
                if (goal.items && Array.isArray(goal.items)) {
                    goal.items.forEach(function(item, j) {
                        if (!item.name || typeof item.name !== 'string') errors.push('goals[' + i + '].items[' + j + '] 缺少有效 name');
                        if (typeof item.percent !== 'number' || item.percent < 0 || item.percent > 100) {
                            errors.push('goals[' + i + '].items[' + j + '] percent 应为 0-100 的数字');
                        }
                    });
                }
            });
        }

        return errors;
    },

    sanitizeDayData: function(data) {
        if (data.metrics) {
            Object.keys(data.metrics).forEach(function(key) {
                if (DataValidator.VALID_METRICS.indexOf(key) === -1) {
                    delete data.metrics[key];
                }
            });
        }
        return data;
    },

    migrateToV2: function(dayData) {
        if (dayData.metrics) return dayData;

        var metrics = {
            firstCheckIn: dayData.firstCheckIn || '--:--',
            completedTasks: dayData.completedTasks || '0/0',
            inspirationCount: dayData.inspirationCount || '0',
            lastCheckIn: dayData.lastCheckIn || '--:--',
            activeTime: dayData.activeTime || '0h',
            emptySlots: dayData.emptySlots || '0'
        };

        var result = Object.assign({}, dayData, { metrics: metrics });
        // 清理旧扁平字段
        delete result.firstCheckIn;
        delete result.completedTasks;
        delete result.inspirationCount;
        delete result.lastCheckIn;
        delete result.activeTime;
        delete result.emptySlots;
        delete result.kpi;
        return result;
    },

    validateGoals: function(goals) {
        var errors = [];
        if (!Array.isArray(goals)) return errors;
        var seenIds = {};
        goals.forEach(function(goal, i) {
            if (!goal.id) errors.push('goals[' + i + '] 缺少 id');
            else if (seenIds[goal.id]) errors.push('goals[' + i + '] id 重复: ' + goal.id);
            else seenIds[goal.id] = true;
            if (goal.items && Array.isArray(goal.items)) {
                goal.items.forEach(function(item, j) {
                    var start = parseFloat(item.startValue);
                    var target = parseFloat(item.targetValue);
                    var current = parseFloat(item.currentValue);
                    if (!isNaN(start) && !isNaN(target) && !isNaN(current)) {
                        var minVal = Math.min(start, target);
                        var maxVal = Math.max(start, target);
                        if (current < minVal || current > maxVal) {
                            errors.push('goals[' + i + '].items[' + j + '] currentValue ' + current + ' 超出 [' + minVal + ', ' + maxVal + '] 范围');
                        }
                    }
                });
            }
        });
        return errors;
    },

    sanitizeGoals: function(goals) {
        if (!Array.isArray(goals)) return goals;
        var seenIds = {};
        goals.forEach(function(goal) {
            if (!goal.id) {
                goal.id = 'goal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            }
            if (seenIds[goal.id]) {
                goal.id = 'goal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            }
            seenIds[goal.id] = true;
            if (goal.items && Array.isArray(goal.items)) {
                goal.items.forEach(function(item) {
                    var start = parseFloat(item.startValue);
                    var target = parseFloat(item.targetValue);
                    var current = parseFloat(item.currentValue);
                    if (!isNaN(start) && !isNaN(target) && !isNaN(current)) {
                        var minVal = Math.min(start, target);
                        var maxVal = Math.max(start, target);
                        if (current < minVal) item.currentValue = String(minVal);
                        else if (current > maxVal) item.currentValue = String(maxVal);
                    }
                });
            }
        });
        return goals;
    },

    cleanupTimeline: function(dayData) {
        if (!dayData.timeline || !Array.isArray(dayData.timeline)) {
            dayData.timeline = [];
            return dayData;
        }

        var PERIOD_MAP = {
            lateNight:    { name: '凌晨', time: '00:00 - 04:00', icon: 'moon' },
            dawn:         { name: '黎明', time: '04:00 - 05:30', icon: 'sunrise' },
            earlyMorning: { name: '清晨', time: '05:30 - 07:00', icon: 'sun' },
            morning:      { name: '上午', time: '07:00 - 12:00', icon: 'briefcase' },
            midday:       { name: '中午', time: '12:00 - 13:00', icon: 'utensils' },
            afternoon:    { name: '下午', time: '13:00 - 17:00', icon: 'sun' },
            dusk:         { name: '傍晚', time: '17:00 - 18:30', icon: 'sunset' },
            evening:      { name: '晚上', time: '18:30 - 22:00', icon: 'coffee' },
            night:        { name: '深夜', time: '22:00 - 24:00', icon: 'moon' }
        };

        var VALID_PERIODS = Object.keys(PERIOD_MAP);

        dayData.timeline = dayData.timeline.filter(function(period) {
            return period.period && VALID_PERIODS.indexOf(period.period) !== -1;
        });

        dayData.timeline.forEach(function(period) {
            var correctConfig = PERIOD_MAP[period.period];
            if (correctConfig) {
                // 只在字段缺失时才填充默认值，不覆盖用户编辑的内容
                if (!period.name) period.name = correctConfig.name;
                if (!period.time) period.time = correctConfig.time;
                if (!period.icon) period.icon = correctConfig.icon;
            }
        });

        dayData.timeline = dayData.timeline.filter(function(period) {
            return period.items && period.items.length > 0;
        });

        return dayData;
    }

};

// 双导出
if (typeof window !== 'undefined') {
    window.DataValidator = DataValidator;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataValidator;
}
