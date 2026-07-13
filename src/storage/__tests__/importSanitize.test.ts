import { describe, it, expect } from 'vitest';
import { ImportValidator } from '../ImportValidator';
import type { GoalItem, DayData } from '../../types/data';

/**
 * 锁定导入层 XSS 纵深防御：所有导入字符串在落盘前被递归净化，
 * 剥离 HTML 标签 / 事件属性 / javascript: / data: 伪协议。
 */
describe('ImportValidator 字符串净化（XSS 纵深防御）', () => {
  it('目标标题中的 <img onerror> 被剥离为纯文本', () => {
    const res = ImportValidator.validate({
      goals: [{ id: 'g1', title: '<img src=x onerror=alert(1)>恶意' }],
    });
    const goal = res.goals![0] as GoalItem;
    expect(goal.title).toBe('恶意');
    expect(goal.title).not.toContain('<img');
    expect(goal.title).not.toContain('onerror');
  });

  it('子项名 / 当前值中的脚本被清除', () => {
    const res = ImportValidator.validate({
      goals: [{ id: 'g', items: [{ name: '<script>alert(1)</script>x', currentValue: '<svg onload=alert(1)>' }] }],
    });
    const goal = res.goals![0] as GoalItem;
    const item = goal.items![0] as any;
    expect(item.name).not.toContain('<script');
    expect(item.currentValue).not.toContain('<svg');
  });

  it('javascript: 伪协议被清除', () => {
    const res = ImportValidator.validate({
      goals: [{ id: 'g', title: '<a href="javascript:alert(1)">x</a>' }],
    });
    const goal = res.goals![0] as GoalItem;
    expect(goal.title).not.toContain('javascript:');
  });

  it('日数据文本字段被净化', () => {
    const res = ImportValidator.validate({
      days: { '2026-07-13': { date: '2026-07-13', note: '<img src=x onerror=alert(1)>' } },
    });
    const day = (res.days!['2026-07-13'] as DayData) as any;
    expect(day.note).not.toContain('<img');
  });

  it('正常中文 / 数字文本不受影响', () => {
    const res = ImportValidator.validate({
      goals: [{ id: 'g', title: '读书 100 本', items: [{ name: '每天 30 分钟', currentValue: '30' }] }],
    });
    const goal = res.goals![0] as GoalItem;
    expect(goal.title).toBe('读书 100 本');
    expect(goal.items![0].name).toBe('每天 30 分钟');
  });

  it('嵌套对象 / 数组中的字符串均被净化', () => {
    const res = ImportValidator.validate({
      settings: { noiseItems: [{ name: '<img src=x onerror=alert(1)>噪音' }] },
    });
    const settings = res.settings as any;
    expect(settings.noiseItems[0].name).not.toContain('<img');
  });
});
