/**
 * 目标相关纯计算工具
 *
 * 抽自 goals/renderer.js（原文件 3233 行）—— 把纯函数集中此处，renderer 只剩 DOM 渲染。
 * 零依赖：只读 goal/item 对象，不碰 store、DOM、事件。
 * 浏览器 + Node 测试都可用。
 */
export const GoalCalculations = (function () {
    'use strict';

    /**
     * 数值格式化 - K/M/B 缩写 + 千位分隔符完整值
     * 抽自 GoalsRenderer._formatNumber (renderer.js L7-34)
     *
     * @param {number|string|null|undefined} value
     * @returns {{displayValue: string, fullValue: string}}
     *   - displayValue: 缩写展示（B/M/K/原值）
     *   - fullValue:    千位分隔符的完整值
     */
    function formatNumber(value) {
        if (value === null || value === undefined || value === '') return { displayValue: '', fullValue: '' };
        const num = parseFloat(value);
        if (isNaN(num)) return { displayValue: String(value), fullValue: String(value) };

        const absNum = Math.abs(num);
        let displayValue;

        // 千位分隔符格式化完整值
        const fullValue = num.toLocaleString('zh-CN', {
            maximumFractionDigits: 10,
            useGrouping: true,
        });

        // 根据数值大小选择显示方式
        if (absNum >= 1e9) {
            displayValue = (num / 1e9).toFixed(2) + 'B';
        } else if (absNum >= 1e6) {
            displayValue = (num / 1e6).toFixed(2) + 'M';
        } else if (absNum >= 1e4) {
            displayValue = (num / 1e3).toFixed(1) + 'K';
        } else {
            // < 10,000 保持精确显示（含千位分隔符），不缩写以保留精度
            displayValue = fullValue;
        }

        return { displayValue, fullValue };
    }

    /**
     * 把 Date 格式化为 yyyy-mm-dd
     * 与 GoalService._formatDate 实现完全一致 —— 抽出后两边都应调用此处。
     * 抽自 GoalsRenderer._formatDate (renderer.js L129-134) 和 GoalService._formatDate (GoalService.js L503-508)
     *
     * @param {Date} date
     * @returns {string} 'YYYY-MM-DD'
     */
    function formatDate(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 根据子项目的最早 startDate 和最晚 endDate，自动回填目标的 startDate / endDate。
     * 若子项目日期全被清空，对应目标日期也清空。
     * 抽自 GoalsRenderer.autoCalcGoalDateRange (renderer.js L70-115)
     *
     * 注意：此函数**原地修改 goal 对象**（mutates），与原行为一致。
     *
     * @param {object} goal { items?: Array<{startDate?: string, endDate?: string}>, startDate?: string, endDate?: string }
     * @returns {boolean} true 表示目标日期有变化，调用方据此决定是否需要持久化
     */
    function autoCalcGoalDateRange(goal) {
        if (!goal || !goal.items || goal.items.length === 0) return false;

        let earliestStart = null;
        let latestEnd = null;

        for (const item of goal.items) {
            if (item.startDate) {
                const startDate = new Date(item.startDate + 'T00:00:00');
                if (!isNaN(startDate.getTime()) && (!earliestStart || startDate < earliestStart)) {
                    earliestStart = startDate;
                }
            }
            if (item.endDate) {
                const endDate = new Date(item.endDate + 'T00:00:00');
                if (!isNaN(endDate.getTime()) && (!latestEnd || endDate > latestEnd)) {
                    latestEnd = endDate;
                }
            }
        }

        let changed = false;

        if (earliestStart) {
            const newStart = formatDate(earliestStart);
            if (goal.startDate !== newStart) {
                goal.startDate = newStart;
                changed = true;
            }
        } else if (goal.startDate) {
            // 所有子项目的开始日期都已清空，清除目标的开始日期
            goal.startDate = '';
            changed = true;
        }

        if (latestEnd) {
            const newEnd = formatDate(latestEnd);
            if (goal.endDate !== newEnd) {
                goal.endDate = newEnd;
                changed = true;
            }
        } else if (goal.endDate) {
            // 所有子项目的结束日期都已清空，清除目标的结束日期
            goal.endDate = '';
            changed = true;
        }

        return changed;
    }

    return {
        formatNumber,
        formatDate,
        autoCalcGoalDateRange,
    };
})();

// 浏览器环境挂到 window；Node（jest 测试）跳过
if (typeof window !== 'undefined') {
    window.GoalCalculations = GoalCalculations;
}

// CommonJS 导出（Node / jest 用），不污染浏览器全局
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoalCalculations;
}
