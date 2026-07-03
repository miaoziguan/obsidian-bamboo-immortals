/**
 * @jest-environment jsdom
 *
 * 目标纯计算工具单测 —— 通过 require 直接加载源文件。
 * goalCalculations.js 同时导出 CommonJS（Node/jest）和挂 window（浏览器）。
 */
const { loadModule } = require('./__helpers__/testUtils');
const g = loadModule('utils/goalCalculations.js', ['GoalCalculations']).GoalCalculations;

describe('goalCalculations 工具函数', () => {
    // ===== formatNumber =====
    describe('formatNumber', () => {
        test('null / undefined / 空字符串应返回两个空字段', () => {
            expect(g.formatNumber(null)).toEqual({ displayValue: '', fullValue: '' });
            expect(g.formatNumber(undefined)).toEqual({ displayValue: '', fullValue: '' });
            expect(g.formatNumber('')).toEqual({ displayValue: '', fullValue: '' });
        });

        test('非数字字符串原样返回', () => {
            expect(g.formatNumber('abc')).toEqual({ displayValue: 'abc', fullValue: 'abc' });
        });

        test('< 10000 显示千位分隔符的完整值', () => {
            const r = g.formatNumber(1234);
            expect(r.displayValue).toBe(r.fullValue);
            expect(r.fullValue).toContain('1,234');
        });

        test('10000-999999 用 K 缩写', () => {
            const r = g.formatNumber(12345);
            expect(r.displayValue).toBe('12.3K');
        });

        test('1000000-999999999 用 M 缩写', () => {
            const r = g.formatNumber(1500000);
            expect(r.displayValue).toBe('1.50M');
        });

        test('>= 1e9 用 B 缩写', () => {
            const r = g.formatNumber(2500000000);
            expect(r.displayValue).toBe('2.50B');
        });

        test('负数支持', () => {
            const r = g.formatNumber(-1500000);
            expect(r.displayValue).toBe('-1.50M');
        });

        test('字符串数字能解析', () => {
            const r = g.formatNumber('12345');
            expect(r.displayValue).toBe('12.3K');
        });
    });

    // ===== formatDate =====
    describe('formatDate', () => {
        test('Date 对象格式化为 yyyy-mm-dd', () => {
            expect(g.formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
            expect(g.formatDate(new Date(2026, 11, 31))).toBe('2026-12-31');
        });

        test('非法 Date 返回空字符串', () => {
            expect(g.formatDate(new Date('xxx'))).toBe('');
            expect(g.formatDate(null)).toBe('');
            expect(g.formatDate(undefined)).toBe('');
        });
    });

    // ===== autoCalcGoalDateRange =====
    describe('autoCalcGoalDateRange', () => {
        test('空 items 不修改', () => {
            const goal = { startDate: '2026-01-01', endDate: '2026-12-31' };
            const r = g.autoCalcGoalDateRange(goal);
            expect(r).toBe(false);
            expect(goal.startDate).toBe('2026-01-01');
            expect(goal.endDate).toBe('2026-12-31');
        });

        test('取子项目最早 startDate', () => {
            const goal = {
                items: [
                    { startDate: '2026-03-01' },
                    { startDate: '2026-01-15' },
                    { startDate: '2026-02-20' },
                ],
            };
            g.autoCalcGoalDateRange(goal);
            expect(goal.startDate).toBe('2026-01-15');
        });

        test('取子项目最晚 endDate', () => {
            const goal = {
                items: [
                    { endDate: '2026-06-01' },
                    { endDate: '2026-12-15' },
                    { endDate: '2026-09-20' },
                ],
            };
            g.autoCalcGoalDateRange(goal);
            expect(goal.endDate).toBe('2026-12-15');
        });

        test('子项目日期全清空时,目标日期也清空', () => {
            const goal = {
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                items: [{ name: 'a' }, { name: 'b' }],
            };
            g.autoCalcGoalDateRange(goal);
            expect(goal.startDate).toBe('');
            expect(goal.endDate).toBe('');
        });

        test('子项目目标日期已一致时返回 false', () => {
            const goal = {
                startDate: '2026-01-15',
                endDate: '2026-12-15',
                items: [
                    { startDate: '2026-01-15', endDate: '2026-12-15' },
                ],
            };
            const r = g.autoCalcGoalDateRange(goal);
            expect(r).toBe(false);
        });

        test('需要回填时返回 true', () => {
            const goal = {
                startDate: '',
                endDate: '',
                items: [
                    { startDate: '2026-02-01', endDate: '2026-11-01' },
                ],
            };
            const r = g.autoCalcGoalDateRange(goal);
            expect(r).toBe(true);
            expect(goal.startDate).toBe('2026-02-01');
            expect(goal.endDate).toBe('2026-11-01');
        });

        test('混合:有 startDate 没 endDate 的子项目', () => {
            const goal = {
                items: [
                    { startDate: '2026-02-01' },
                    { endDate: '2026-11-01' },
                ],
            };
            g.autoCalcGoalDateRange(goal);
            expect(goal.startDate).toBe('2026-02-01');
            expect(goal.endDate).toBe('2026-11-01');
        });

        test('非法日期字符串被忽略', () => {
            const goal = {
                items: [
                    { startDate: 'not-a-date' },
                    { startDate: '2026-03-01' },
                ],
            };
            g.autoCalcGoalDateRange(goal);
            expect(goal.startDate).toBe('2026-03-01');
        });
    });
});
