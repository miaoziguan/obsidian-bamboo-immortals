import { describe, it, expect } from 'vitest';
import {
  fmt,
  buildHolidays,
  getHolidays,
  isWorkday,
  countWorkdays,
  workdaysBetween,
} from '../workdayCalendar';

describe('workdayCalendar.getHolidays', () => {
  it('返回 Set 且按年缓存（同 year 返回同一引用）', () => {
    const h1 = getHolidays(2026);
    expect(h1).toBeInstanceOf(Set);
    const h2 = getHolidays(2026);
    expect(h1).toBe(h2); // 缓存命中，同一引用
  });

  it('含元旦与春节（2026）等关键节假日', () => {
    const h = getHolidays(2026);
    expect(h.has('2026-01-01')).toBe(true); // 元旦
    expect(h.has('2026-02-16')).toBe(true); // 春节起
    expect(h.has('2026-02-22')).toBe(true); // 春节止
  });

  it('不同年份返回不同引用', () => {
    expect(getHolidays(2025)).not.toBe(getHolidays(2026));
  });

  it('buildHolidays 纯函数：不依赖缓存', () => {
    const h = buildHolidays(2026);
    expect(h.has('2026-10-01')).toBe(true); // 国庆
  });
});

describe('workdayCalendar.isWorkday', () => {
  const h = getHolidays(2026);
  it('周末为假', () => {
    expect(isWorkday(new Date(2026, 1, 21), h)).toBe(false); // 周六
    expect(isWorkday(new Date(2026, 1, 22), h)).toBe(false); // 周日
  });
  it('法定节假日为假', () => {
    expect(isWorkday(new Date(2026, 0, 1), h)).toBe(false); // 元旦(周四)
  });
  it('普通工作日为假', () => {
    expect(isWorkday(new Date(2026, 0, 2), h)).toBe(true); // 周五
  });
});

describe('workdayCalendar.fmt', () => {
  it('零填充 YYYY-MM-DD', () => {
    expect(fmt(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(fmt(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('workdayCalendar.countWorkdays — 节假日感知', () => {
  it('单日是法定节假日 → 0', () => {
    const h = getHolidays(2026);
    expect(countWorkdays(new Date(2026, 0, 1), new Date(2026, 0, 1), h)).toBe(0); // 元旦
  });

  it('整段春节工作日（2026-02-16~02-20 均为节假日）→ 0', () => {
    const h = getHolidays(2026);
    expect(countWorkdays(new Date(2026, 1, 16), new Date(2026, 1, 20), h)).toBe(0);
  });

  it('普通周一~周五（无节假日）→ 5', () => {
    const h = getHolidays(2026);
    expect(countWorkdays(new Date(2026, 2, 2), new Date(2026, 2, 6), h)).toBe(5);
  });

  it('跨周末正确排除（周五~周日 → 1）', () => {
    const h = getHolidays(2026);
    expect(countWorkdays(new Date(2026, 1, 27), new Date(2026, 2, 1), h)).toBe(1); // 仅 02-27 周五
  });

  it('起止颠倒 → 0', () => {
    const h = getHolidays(2026);
    expect(countWorkdays(new Date(2026, 0, 10), new Date(2026, 0, 1), h)).toBe(0);
  });
});

describe('workdayCalendar.workdaysBetween', () => {
  const h = getHolidays(2026);
  it('正向与 countWorkdays 一致', () => {
    expect(workdaysBetween(new Date(2026, 2, 2), new Date(2026, 2, 6), h)).toBe(5);
  });
  it('反向返回负值（符号翻转）', () => {
    expect(workdaysBetween(new Date(2026, 2, 6), new Date(2026, 2, 2), h)).toBe(-5);
  });
});
