/**
 * 搜索服务 — 带倒排索引优化
 *
 * 抽自 store.searchData（store.js 原 1101 行 line 1042-1096）。
 * 纯函数：接收 data / globalGoals / query，返回结果数组，不依赖 Store 实例。
 *
 * 性能优化：
 * - 倒排索引：token -> Set<dateKey>，首次搜索时构建
 * - 增量维护：数据变更时更新索引
 * - 缓存：同一 query 的结果短时间内复用
 */
export var SearchService = (function () {
    'use strict';

    var METRICS_FIELDS = [
        { key: 'firstCheckIn', label: '首次打卡' },
        { key: 'completedTasks', label: '完成任务' },
        { key: 'inspirationCount', label: '灵感' },
        { key: 'lastCheckIn', label: '末次打卡' },
    ];

    var FALLBACK_FIELDS = ['note', 'overall', 'checklist', 'diagnosis', 'actionPlan', 'deepReview'];

    var _invertedIndex = null;
    var _indexDataVersion = -1;
    var _dataVersionCounter = 0;
    var _resultCache = new Map();
    var _resultCacheVersion = -1;

    function _tokenize(text) {
        if (!text) return [];
        var str = String(text).toLowerCase();
        var tokens = new Set();
        var words = str.split(/[\s,，。、；;：:！!？?（）()【】\[\]《》""''/\\\-_—]+/).filter(Boolean);
        words.forEach(function (w) {
            if (w.length >= 1) tokens.add(w);
        });
        for (var i = 0; i < str.length; i++) {
            for (var len = 2; len <= Math.min(4, str.length - i); len++) {
                tokens.add(str.slice(i, i + len));
            }
        }
        return Array.from(tokens);
    }

    function _collectDayTokens(day) {
        var tokens = new Set();

        var metrics = day.metrics || day;
        METRICS_FIELDS.forEach(function (field) {
            var val = metrics[field.key];
            if (val) _tokenize(val).forEach(function (t) { tokens.add(t); });
        });

        var timeline = day.timeline || [];
        timeline.forEach(function (t) {
            if (t.name) _tokenize(t.name).forEach(function (tkn) { tokens.add(tkn); });
            (t.items || []).forEach(function (item) {
                if (item.task) _tokenize(item.task).forEach(function (tkn) { tokens.add(tkn); });
            });
        });

        (day.goals || []).forEach(function (g) {
            if (g.title) _tokenize(g.title).forEach(function (tkn) { tokens.add(tkn); });
        });

        FALLBACK_FIELDS.forEach(function (f) {
            var val = day[f];
            if (val) _tokenize(val).forEach(function (tkn) { tokens.add(tkn); });
        });

        return tokens;
    }

    function _buildInvertedIndex(data, globalGoals) {
        var index = {};

        Object.keys(data).forEach(function (dateKey) {
            var day = data[dateKey];
            var tokens = _collectDayTokens(day);
            tokens.forEach(function (token) {
                if (!index[token]) index[token] = new Set();
                index[token].add(dateKey);
            });
        });

        if (globalGoals) {
            globalGoals.forEach(function (g) {
                if (g.title) {
                    var goalTokens = _tokenize(g.title);
                    goalTokens.forEach(function (token) {
                        if (!index[token]) index[token] = new Set();
                        index[token].add('__global_goals__');
                    });
                }
            });
        }

        return index;
    }

    function _getInvertedIndex(data, globalGoals) {
        if (_invertedIndex && _indexDataVersion === _dataVersionCounter) {
            return _invertedIndex;
        }
        _invertedIndex = _buildInvertedIndex(data, globalGoals);
        _indexDataVersion = _dataVersionCounter;
        _resultCache.clear();
        _resultCacheVersion = _dataVersionCounter;
        return _invertedIndex;
    }

    function invalidateIndex() {
        _dataVersionCounter++;
    }

    function _dayContainsText(day, lowerQuery) {
        for (var i = 0; i < FALLBACK_FIELDS.length; i++) {
            var val = day[FALLBACK_FIELDS[i]];
            if (val && String(val).toLowerCase().indexOf(lowerQuery) !== -1) return true;
        }
        return false;
    }

    function _searchDay(day, dateKey, lowerQuery, globalGoals) {
        var matches = [];

        var metrics = day.metrics || day;
        METRICS_FIELDS.forEach(function (field) {
            var val = metrics[field.key];
            if (val && String(val).toLowerCase().indexOf(lowerQuery) !== -1) {
                matches.push({ field: field.label, value: String(val) });
            }
        });

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

        var matchedGoal = (day.goals || []).find(function (g) {
            return g.title && g.title.toLowerCase().indexOf(lowerQuery) !== -1;
        });
        if (matchedGoal) {
            matches.push({ field: '目标', value: matchedGoal.title });
        }

        if (matches.length === 0 && globalGoals) {
            var globalMatch = globalGoals.find(function (g) {
                return g.title && g.title.toLowerCase().indexOf(lowerQuery) !== -1;
            });
            if (globalMatch) {
                matches.push({ field: '目标', value: globalMatch.title });
            }
        }

        if (matches.length > 0 || _dayContainsText(day, lowerQuery)) {
            return {
                date: dateKey,
                weekday: day.weekday,
                matches: matches.slice(0, 3),
            };
        }
        return null;
    }

    function search(data, globalGoals, query) {
        if (!data || !query) return [];

        var lowerQuery = query.toLowerCase();

        var cacheKey = lowerQuery + '_' + _resultCacheVersion;
        if (_resultCache.has(cacheKey)) {
            return _resultCache.get(cacheKey);
        }

        var index = _getInvertedIndex(data, globalGoals);
        var queryTokens = _tokenize(lowerQuery);
        var candidateKeys = null;

        if (queryTokens.length > 0) {
            queryTokens.forEach(function (token) {
                var dates = index[token];
                if (dates) {
                    if (candidateKeys === null) {
                        candidateKeys = new Set(dates);
                    } else {
                        dates.forEach(function (d) { candidateKeys.add(d); });
                    }
                }
            });
        }

        var results = [];
        var searchKeys;

        if (candidateKeys !== null && candidateKeys.size > 0) {
            searchKeys = Array.from(candidateKeys).filter(function (k) { return k !== '__global_goals__'; });
        } else {
            searchKeys = Object.keys(data);
        }

        searchKeys.forEach(function (dateKey) {
            var day = data[dateKey];
            if (!day) return;
            var result = _searchDay(day, dateKey, lowerQuery, globalGoals);
            if (result) results.push(result);
        });

        if (candidateKeys && candidateKeys.has('__global_goals__')) {
            var globalMatch = (globalGoals || []).find(function (g) {
                return g.title && g.title.toLowerCase().indexOf(lowerQuery) !== -1;
            });
            if (globalMatch) {
                var hasGlobalInResults = results.some(function (r) {
                    return r.matches.some(function (m) { return m.field === '目标' && m.value === globalMatch.title; });
                });
                if (!hasGlobalInResults && results.length === 0) {
                    var latestDate = Object.keys(data).sort().reverse()[0];
                    if (latestDate) {
                        results.push({
                            date: latestDate,
                            weekday: data[latestDate]?.weekday || '',
                            matches: [{ field: '目标', value: globalMatch.title }],
                        });
                    }
                }
            }
        }

        results.sort(function (a, b) { return b.date.localeCompare(a.date); });

        if (results.length <= 200) {
            _resultCache.set(cacheKey, results);
        }

        return results;
    }

    return { search: search, invalidateIndex: invalidateIndex };
})();

if (typeof window !== 'undefined') {
    window.SearchService = SearchService;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchService;
}
