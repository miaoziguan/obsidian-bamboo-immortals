import { describe, it, expect } from 'vitest';
import type { GoalItem } from '../../types/data';
import {
  applySuggestion,
  applySuggestions,
  type Suggestion,
} from '../Suggestion';

function makeGoals(): GoalItem[] {
  return [
    {
      id: 'g1',
      title: '健康减重',
      items: [
        { name: '每天跑步', dailyMin: '30' },
        { name: '控制饮食', dailyMin: '5' },
      ],
    },
    {
      id: 'g2',
      title: '读完三本书',
      items: [{ name: '每天读 10 页', dailyMin: '10' }],
    },
  ];
}

describe('applySuggestion — adjust_dailyMin', () => {
  it('按子项名命中，仅改该子项 dailyMin，其他子项不变', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'adjust_dailyMin',
      goalRef: { goalId: 'g1', goalTitle: '健康减重' },
      target: { subItemName: '每天跑步' },
      params: { dailyMin: 15 },
      text: '把跑步降到 15',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(true);
    const g1 = r.goals.find((g) => g.id === 'g1')!;
    expect(g1.items![0].dailyMin).toBe('15');
    expect(g1.items![1].dailyMin).toBe('5'); // 未动
    expect(r.goals.find((g) => g.id === 'g2')!.items![0].dailyMin).toBe('10'); // 跨目标未动
  });

  it('按子项下标命中', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'adjust_dailyMin',
      goalRef: { goalTitle: '健康减重' },
      target: { subItemIndex: 1 },
      params: { dailyMin: 99 },
      text: '饮食调到 99',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(true);
    expect(r.goals.find((g) => g.id === 'g1')!.items![1].dailyMin).toBe('99');
  });

  it('dailyMin 负数/非数 → 不应用，原树不变', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'adjust_dailyMin',
      goalRef: { goalId: 'g1' },
      target: { subItemName: '每天跑步' },
      params: { dailyMin: -5 },
      text: '负数',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(false);
    expect(r.goals).toEqual(goals);

    const s2: Suggestion = { ...s, params: { dailyMin: NaN } };
    const r2 = applySuggestion(s2, goals);
    expect(r2.applied).toBe(false);
  });

  it('子项名未命中 → 不应用，原树不变', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'adjust_dailyMin',
      goalRef: { goalId: 'g1' },
      target: { subItemName: '不存在的子项' },
      params: { dailyMin: 1 },
      text: 'x',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(false);
    expect(r.goals).toEqual(goals);
  });

  it('目标未命中（goalId/title 都不匹配）→ 不应用', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'adjust_dailyMin',
      goalRef: { goalId: 'nope', goalTitle: '不存在' },
      target: { subItemName: '每天跑步' },
      params: { dailyMin: 1 },
      text: 'x',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(false);
    expect(r.message).toMatch(/未找到目标/);
  });
});

describe('applySuggestion — remove_subitem', () => {
  it('按名删除子项', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'remove_subitem',
      goalRef: { goalId: 'g1' },
      target: { subItemName: '每天跑步' },
      text: '去掉跑步',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(true);
    const items = r.goals.find((g) => g.id === 'g1')!.items!;
    expect(items.map((i) => i.name)).toEqual(['控制饮食']);
  });

  it('未命中 → 不变', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'remove_subitem',
      goalRef: { goalId: 'g1' },
      target: { subItemName: 'zzz' },
      text: 'x',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(false);
    expect(r.goals).toEqual(goals);
  });
});

describe('applySuggestion — add_subitem', () => {
  it('追加新子项（去重：同名不重复加）', () => {
    const goals = makeGoals();
    const s: Suggestion = {
      action: 'add_subitem',
      goalRef: { goalId: 'g1' },
      params: { name: '每周游泳 3 次', dailyMin: 3, taskDayType: 'weekly' },
      text: '加游泳',
    };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(true);
    const items = r.goals.find((g) => g.id === 'g1')!.items!;
    expect(items.map((i) => i.name)).toContain('每周游泳 3 次');
    expect(items.find((i) => i.name === '每周游泳 3 次')!.dailyMin).toBe('3');

    const r2 = applySuggestion(s, r.goals);
    expect(r2.applied).toBe(false); // 已存在 → 不去重再加
  });

  it('缺 name → 不应用', () => {
    const goals = makeGoals();
    const s: Suggestion = { action: 'add_subitem', goalRef: { goalId: 'g1' }, params: {}, text: 'x' };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(false);
  });
});

describe('applySuggestion — note / 不可变性', () => {
  it('note 动作不改动树', () => {
    const goals = makeGoals();
    const s: Suggestion = { action: 'note', goalRef: { goalTitle: '健康减重' }, text: '保持节奏' };
    const r = applySuggestion(s, goals);
    expect(r.applied).toBe(false);
    expect(r.goals).toEqual(goals);
  });

  it('不 mutate 入参（返回新数组/新对象）', () => {
    const goals = makeGoals();
    const snapshot = JSON.parse(JSON.stringify(goals));
    const s: Suggestion = {
      action: 'adjust_dailyMin',
      goalRef: { goalId: 'g1' },
      target: { subItemName: '每天跑步' },
      params: { dailyMin: 15 },
      text: 't',
    };
    const r = applySuggestion(s, goals);
    expect(goals).toEqual(snapshot); // 入参原样
    expect(r.goals).not.toBe(goals); // 新数组
    expect(r.goals.find((g) => g.id === 'g1')!.items).not.toBe(goals.find((g) => g.id === 'g1')!.items);
  });
});

describe('applySuggestions — 折叠多条', () => {
  it('逐条应用，单条非法不影响其余', () => {
    const goals = makeGoals();
    const list: Suggestion[] = [
      { action: 'adjust_dailyMin', goalRef: { goalId: 'g1' }, target: { subItemName: '每天跑步' }, params: { dailyMin: 15 }, text: 'a' },
      { action: 'adjust_dailyMin', goalRef: { goalId: 'g1' }, target: { subItemName: '不存在' }, params: { dailyMin: 1 }, text: 'bad' },
      { action: 'remove_subitem', goalRef: { goalId: 'g2' }, target: { subItemName: '每天读 10 页' }, text: 'b' },
    ];
    const r = applySuggestions(list, goals);
    expect(r.applied).toBe(true);
    expect(r.goals.find((g) => g.id === 'g1')!.items![0].dailyMin).toBe('15');
    expect(r.goals.find((g) => g.id === 'g2')!.items!.length).toBe(0);
  });
});
