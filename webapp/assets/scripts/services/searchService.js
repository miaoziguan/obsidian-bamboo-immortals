/**
 * 搜索服务
 *
 * 抽自 store.searchData（store.js 原 1101 行 line 1042-1096）。
 * 纯函数：接收 data / globalGoals / query，返回结果数组，不依赖 Store 实例。
 */
export var SearchService = (function () {
    'use strict';

    var METRICS_FIELDS = [
        { key: 'firstCheckIn', label: '首次打卡' },
        { key: 'completedTasks', label: '完成任务' },
        { key: 'inspirationCount', label: '灵感' },
        { key: 'lastCheckIn', label: '末次打卡' },
    ];

    /**
     * @param {Object<string, Object>} data       日数据字典 (dateKey → dayData)
     * @param {Array}                 globalGoals 全局目标列表
     * @param {string}                query       搜索关键词
     * @returns {Array<{date: string, weekday: string, matches: Array}>} 结果按日期降序
     */
    var FALLBACK_FIELDS = ['note', 'overall', 'checklist', 'diagnosis', 'actionPlan', 'deepReview'];

    function _dayContainsText(day, lowerQuery) {
        for (var i = 0; i < FALLBACK_FIELDS.length; i++) {
            var val = day[FALLBACK_FIELDS[i]];
            if (val && String(val).toLowerCase().indexOf(lowerQuery) !== -1) return true;
        }
        return false;
    }

    function search(data, globalGoals, query) {
        if (!data || !query) return [];

        var results = [];
        var lowerQuery = query.toLowerCase();

        Object.keys(data).forEach(function (dateKey) {
            var day = data[dateKey];
            var matches = [];

            // 指标字段匹配
            var metrics = day.metrics || day;
            METRICS_FIELDS.forEach(function (field) {
                var val = metrics[field.key];
                if (val && String(val).toLowerCase().indexOf(lowerQuery) !== -1) {
                    matches.push({ field: field.label, value: String(val) });
                }
            });

            // 时间线匹配
            var timeline = day.timeline || [];
            var hasTimelineMatch = timeline.some(function (t) {
                if (t.name && t.name.toLowerCase().indexOf(lowerQuery) !== -1) return true;
                return (t.items || []).some(function (item) {
                    return item.task && item.task.toLowerCase().indexOf(lowerQuery) !== -1;
                });
            });

            if (hasTimelineMatch) {
                var matched = timeline.find(function (t) {
                    if (t.name && t.name.toLowerCase().indexOf(lowerQuery) !== -1) return true;
                    return (t.items || []).some(function (item) {
                        return item.task && item.task.toLowerCase().indexOf(lowerQuery) !== -1;
                    });
                });
                var matchedItem = (matched.items || []).find(function (item) {
                    return item.task && item.task.toLowerCase().indexOf(lowerQuery) !== -1;
                });
                matches.push({ field: '活动', value: matchedItem ? matchedItem.task : matched.name });
            }

            // 当天目标匹配
            var matchedGoal = (day.goals || []).find(function (g) {
                return g.title && g.title.toLowerCase().indexOf(lowerQuery) !== -1;
            });
            if (matchedGoal) {
                matches.push({ field: '目标', value: matchedGoal.title });
            }

            // 全局目标兜底匹配
            if (matches.length === 0 && globalGoals) {
                var globalMatch = globalGoals.find(function (g) {
                    return g.title && g.title.toLowerCase().indexOf(lowerQuery) !== -1;
                });
                if (globalMatch) {
                    matches.push({ field: '目标', value: globalMatch.title });
                }
            }

            if (matches.length > 0 || _dayContainsText(day, lowerQuery)) {
                results.push({
                    date: dateKey,
                    weekday: day.weekday,
                    matches: matches.slice(0, 3),
                });
            }
        });

        return results.sort(function (a, b) { return b.date.localeCompare(a.date); });
    }

    return { search: search };
})();

// 双导出
if (typeof window !== 'undefined') {
    window.SearchService = SearchService;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchService;
}
