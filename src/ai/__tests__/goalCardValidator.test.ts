import { describe, it, expect } from 'vitest';
import {
  sanitizeGoal,
  sanitizeSubItem,
  validateGoals,
  classifyCompleteness,
  cleanDailyMin,
  DEFAULT_TASK_DAY_TYPE,
} from '../GoalCardValidator';
import { GOAL_CATEGORIES } from '../../types/data';

describe('cleanDailyMin', () => {
  it('纯数字原样返回（含小数）', () => {
    expect(cleanDailyMin('30')).toBe('30');
    expect(cleanDailyMin('2.5')).toBe('2.5');
  });

  it('带单位/前缀数字取前缀数字', () => {
    expect(cleanDailyMin('30分钟')).toBe('30');
    expect(cleanDailyMin('7小时')).toBe('7');
    expect(cleanDailyMin('200千卡')).toBe('200');
  });

  it('空/空白返回空串', () => {
    expect(cleanDailyMin('')).toBe('');
    expect(cleanDailyMin('   ')).toBe('');
  });

  it('无前缀数字时剥离非数字字符', () => {
    expect(cleanDailyMin('约30页')).toBe('30');
  });

  it('完全无数字返回空串', () => {
    expect(cleanDailyMin('每天坚持')).toBe('');
  });
});

describe('sanitizeGoal', () => {
  it('非法 category 回落 other，缺失字段补默认', () => {
    const g = sanitizeGoal({ title: '学前端', category: '魔法', items: [] });
    expect(g.category).toBe('other');
    expect(g.progress).toBe(0);
    expect(g.startDate).toBe('');
    expect(Array.isArray(g.items)).toBe(true);
  });

  it('合法 category 保留', () => {
    expect(sanitizeGoal({ category: 'study' }).category).toBe('study');
  });

  it('丢未知字段，只保留已知结构', () => {
    const g = sanitizeGoal({ title: 'x', hack: 'drop', items: [{ name: 'a', evil: 1 }] });
    expect((g as unknown as Record<string, unknown>).hack).toBeUndefined();
    expect(g.items![0]).not.toHaveProperty('evil');
  });

  it('缺 id 时生成 id', () => {
    expect(sanitizeGoal({ title: 'x' }).id).toMatch(/^goal_/);
  });

  it('子项补默认 taskDayType 与空字符串字段', () => {
    const it = sanitizeSubItem({ name: '读书' }, 0);
    expect(it.taskDayType).toBe(DEFAULT_TASK_DAY_TYPE);
    expect(it.dailyMin).toBe('');
    expect(it.targetValue).toBe('');
  });

  it('保留 analysis 字段（AI 归纳分析），不静默丢弃', () => {
    const g = sanitizeGoal({ title: 'x', analysis: '从笔记提炼出 3 个可执行目标' });
    expect(g.analysis).toBe('从笔记提炼出 3 个可执行目标');
  });

  it('严格丢弃 icon 字段（AI 不得写入 icon）', () => {
    const g = sanitizeGoal({ title: 'x', icon: '🌟' });
    expect((g as unknown as Record<string, unknown>).icon).toBeUndefined();
  });
});

describe('validateGoals', () => {
  it('非数组返回空数组（不抛）', () => {
    expect(validateGoals(null)).toEqual([]);
    expect(validateGoals({ goals: [] })).toEqual([]);
    expect(validateGoals('[]')).toEqual([]);
  });

  it('逐条 sanitize', () => {
    const out = validateGoals([{ title: 'a', category: 'bad' }, { title: 'b' }]);
    expect(out).toHaveLength(2);
    expect(out[0].category).toBe('other');
    expect(out[1].id).toMatch(/^goal_/);
  });
});

describe('classifyCompleteness', () => {
  const base = (over: Partial<ReturnType<typeof sanitizeGoal>> = {}) =>
    sanitizeGoal({
      title: 't',
      category: 'study',
      endDate: '2026-08-01',
      items: [{ name: 'sub', dailyMin: '2', taskDayType: 'daily' }],
      ...over,
    });

  it('信息齐全 → complete', () => {
    const r = classifyCompleteness(base());
    expect(r.level).toBe('complete');
    expect(r.missing).toEqual([]);
  });

  it('缺截止日 + 每日量 → thin 且列出缺失', () => {
    const r = classifyCompleteness(
      base({ endDate: '', items: [{ name: 'sub', dailyMin: '', taskDayType: 'daily' }] })
    );
    expect(r.level).toBe('thin');
    expect(r.missing).toContain('截止日');
    expect(r.missing.some((m) => m.startsWith('每日量'))).toBe(true);
  });

  it('部分子项未量化 → thin 且标出未量化数量', () => {
    const r = classifyCompleteness(
      base({
        items: [
          { name: 'a', dailyMin: '2', taskDayType: 'daily' },
          { name: 'b', dailyMin: '', taskDayType: 'daily' },
        ],
      })
    );
    expect(r.level).toBe('thin');
    expect(r.missing.some((m) => m.includes('未量化'))).toBe(true);
  });

  it('全部子项已量化（纯数字）→ 不缺每日量', () => {
    const r = classifyCompleteness(
      base({
        items: [
          { name: 'a', dailyMin: '2', taskDayType: 'daily' },
          { name: 'b', dailyMin: '30', taskDayType: 'daily' },
        ],
      })
    );
    expect(r.missing.some((m) => m.startsWith('每日量'))).toBe(false);
  });

  it('category 为空 → 缺分类', () => {
    const r = classifyCompleteness({
      id: 'g1',
      title: 't',
      category: '',
      endDate: '2026-08-01',
      items: [{ name: 's', dailyMin: '2', taskDayType: 'daily' }],
    });
    expect(r.missing).toContain('分类');
  });

  it('枚举合法但不含 other 时仍判完整（other 也是合法分类）', () => {
    const r = classifyCompleteness(base({ category: 'other' }));
    expect(r.level).toBe('complete');
  });

  it('GOAL_CATEGORIES 与 webapp 枚举一致（回归护栏）', () => {
    const ids = GOAL_CATEGORIES.map((c) => c.id).sort();
    expect(ids).toEqual(['finance', 'health', 'other', 'personal', 'study', 'work']);
  });
});
