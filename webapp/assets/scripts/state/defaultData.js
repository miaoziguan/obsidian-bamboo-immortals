/**
 * 默认数据 & 空日数据工厂
 *
 * 抽自 store.js（原 1101 行 line 1-287 中的常量定义）。
 * 依赖 helpers.js 中的 formatDate / getChineseWeekday（浏览器通过 window，需提前加载）。
 */
(function () {
    'use strict';

    var DATA_VERSION = '3.0';

    var _today = new Date();
    var _startOfMonth = new Date(_today.getFullYear(), _today.getMonth(), 1);
    var _endOfMonth = new Date(_today.getFullYear(), _today.getMonth() + 1, 0);
    var _startDateStr =
        _startOfMonth.getFullYear() +
        '-' +
        String(_startOfMonth.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(_startOfMonth.getDate()).padStart(2, '0');
    var _endDateStr =
        _endOfMonth.getFullYear() +
        '-' +
        String(_endOfMonth.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(_endOfMonth.getDate()).padStart(2, '0');

    var todayKey = formatDate(new Date());

    var DEFAULT_DATA = {};
    DEFAULT_DATA[todayKey] = {
        date: todayKey,
        weekday: getChineseWeekday(new Date()),
        metrics: {
            firstCheckIn: '08:30',
            completedTasks: '8/12',
            inspirationCount: '3',
            lastCheckIn: '18:30',
            activeTime: '8h',
            emptySlots: '2',
        },
        timeline: [
            { period: 'lateNight', name: '凌晨', time: '00:00 - 04:00', icon: 'moon', eval: 'good', items: [] },
            { period: 'dawn', name: '黎明', time: '04:00 - 05:30', icon: 'sunrise', eval: 'good', items: [] },
            {
                period: 'earlyMorning', name: '清晨', time: '05:30 - 07:00', icon: 'sun', eval: 'good',
                items: [{ time: '06:00', task: '早起冥想', eval: '身心舒畅' }],
            },
            {
                period: 'morning', name: '上午', time: '07:00 - 12:00', icon: 'briefcase', eval: 'good',
                items: [
                    { time: '07:00', task: '阅读30分钟', eval: '收获颇丰' },
                    { time: '08:00', task: '早餐', eval: '营养均衡' },
                    { time: '09:30', task: '完成项目方案', eval: '效率很高' },
                    { time: '10:30', task: '团队会议', eval: '进展顺利' },
                    { time: '11:30', task: '代码review', eval: '细致认真' },
                ],
            },
            {
                period: 'midday', name: '中午', time: '12:00 - 13:00', icon: 'utensils', eval: 'good',
                items: [{ time: '12:30', task: '午餐', eval: '适量' }],
            },
            {
                period: 'afternoon', name: '下午', time: '13:00 - 17:00', icon: 'sun', eval: 'warn',
                items: [
                    { time: '13:30', task: '功能开发', eval: '遇到小挑战' },
                    { time: '15:00', task: '休息散步', eval: '恢复精力' },
                    { time: '16:00', task: '继续开发', eval: '逐步推进' },
                ],
            },
            { period: 'dusk', name: '傍晚', time: '17:00 - 18:30', icon: 'sunset', eval: 'good', items: [] },
            {
                period: 'evening', name: '晚上', time: '18:30 - 22:00', icon: 'coffee', eval: 'good',
                items: [
                    { time: '18:30', task: '晚餐', eval: '健康饮食' },
                    { time: '19:30', task: '运动健身', eval: '坚持运动' },
                    { time: '21:00', task: '复盘总结', eval: '回顾一天' },
                ],
            },
            { period: 'night', name: '深夜', time: '22:00 - 24:00', icon: 'moon', eval: 'good', items: [] },
        ],
        goals: [
            {
                id: 'goal_default_1', icon: 'target', title: '项目推进', meta: 'Q2核心目标',
                category: 'work', startDate: _startDateStr, endDate: _endDateStr,
                items: [
                    { name: '方案设计', detail: '已完成', percent: 100, startDate: _startDateStr, endDate: _endDateStr, startValue: '0', targetValue: '100', currentValue: '100', dailyMin: '5', taskDayType: 'daily' },
                    { name: '开发实现', detail: '进行中', percent: 60, startDate: _startDateStr, endDate: _endDateStr, startValue: '0', targetValue: '100', currentValue: '60', dailyMin: '2', taskDayType: 'daily' },
                    { name: '测试上线', detail: '未开始', percent: 0, startDate: _startDateStr, endDate: _endDateStr, startValue: '0', targetValue: '100', currentValue: '0', dailyMin: '3', taskDayType: 'daily' },
                ],
            },
            {
                id: 'goal_default_2', icon: 'bookOpen', title: '技能提升', meta: '持续学习',
                category: 'study', startDate: _startDateStr, endDate: _endDateStr,
                items: [
                    { name: '阅读', detail: '进行中', percent: 80, startDate: _startDateStr, endDate: _endDateStr, startValue: '0', targetValue: '100', currentValue: '80', dailyMin: '1', taskDayType: 'daily' },
                    { name: '练习', detail: '进行中', percent: 40, startDate: _startDateStr, endDate: _endDateStr, startValue: '0', targetValue: '100', currentValue: '40', dailyMin: '30', taskDayType: 'daily' },
                    { name: '总结', detail: '未开始', percent: 20, startDate: _startDateStr, endDate: _endDateStr, startValue: '0', targetValue: '100', currentValue: '20', dailyMin: '1', taskDayType: 'daily' },
                ],
            },
        ],
    };

    function createEmptyDayData(dateKey) {
        // 校验 dateKey 格式：YYYY-MM-DD
        if (!dateKey || typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            console.warn('[Bamboo] createEmptyDayData: invalid dateKey:', dateKey);
            dateKey = new Date().toISOString().split('T')[0];
        }
        var date = new Date(dateKey + 'T00:00:00');
        var metrics = {
            firstCheckIn: '--:--',
            completedTasks: '0/0',
            inspirationCount: '0',
            lastCheckIn: '--:--',
            activeTime: '0h',
            emptySlots: '0',
        };
        return {
            date: dateKey,
            weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
            metrics: metrics,
            timeline: [],
        };
    }

    // 导出到 window
    window.DATA_VERSION = DATA_VERSION;
    window.DEFAULT_DATA = DEFAULT_DATA;
    window.createEmptyDayData = createEmptyDayData;
})();
