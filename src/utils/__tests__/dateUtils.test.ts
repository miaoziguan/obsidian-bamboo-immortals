/**
 * src/utils/dateUtils 本地日历口径单测（webapp `tests/dateUtils.jest.test.js` 的 TS 孪生）
 *
 * 基准时刻一律用**显式本地分量**构造（不用 new Date('...Z') / toISOString()），
 * 保证 UTC（CI）与非 UTC（本机 CST）时区下结论一致。
 */
import { describe, it, expect } from 'vitest';
import {
  parseLocalDate,
  startOfLocalDay,
  startOfLocalMonth,
  addMonthsClamped,
  diffLocalDays,
} from '../dateUtils';

const ts = (v: Date | null) => (v === null ? null : v.getTime());

describe('parseLocalDate', () => {
  it("'YYYY-MM-DD' 解析为本地 00:00（不是 UTC 午夜）", () => {
    const d = parseLocalDate('2026-10-06')!;
    expect(d.getTime()).toBe(new Date(2026, 9, 6).getTime());
    expect(d.getHours()).toBe(0);
    expect(d.getDate()).toBe(6);
  });

  it('带时间的无时区串按本地时间解析', () => {
    const d = parseLocalDate('2026-10-06T09:30:00')!;
    expect([d.getHours(), d.getMinutes()]).toEqual([9, 30]);
  });

  it('拒绝不存在的日期（构造会静默溢出的假日期）', () => {
    expect(parseLocalDate('2026-02-31')).toBeNull();
    expect(parseLocalDate('2026-13-01')).toBeNull();
    expect(parseLocalDate('2026-00-10')).toBeNull();
  });

  it('空值 / 垃圾串 / 非法 Date 一律 null', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate(null)).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
    expect(parseLocalDate('abc')).toBeNull();
    expect(parseLocalDate(new Date('nope'))).toBeNull();
  });

  it('Date 输入返回副本', () => {
    const src = new Date(2026, 9, 6, 8, 0);
    const copy = parseLocalDate(src)!;
    expect(copy).not.toBe(src);
    copy.setFullYear(1999);
    expect(src.getFullYear()).toBe(2026);
  });
});

describe('startOfLocalDay / startOfLocalMonth', () => {
  it('丢弃时分秒毫秒，保留本地日历日', () => {
    expect(ts(startOfLocalDay(new Date(2026, 9, 6, 23, 59, 59, 999)))).toBe(
      new Date(2026, 9, 6).getTime(),
    );
  });

  it('归一为当月 1 日 00:00', () => {
    expect(ts(startOfLocalMonth(new Date(2026, 9, 31, 8, 30)))).toBe(
      new Date(2026, 9, 1).getTime(),
    );
    expect(ts(startOfLocalMonth('2026-01-31'))).toBe(new Date(2026, 0, 1).getTime());
  });

  it('非法输入返回 null', () => {
    expect(startOfLocalDay('abc')).toBeNull();
    expect(startOfLocalMonth('2026-02-31')).toBeNull();
  });
});

describe('addMonthsClamped（A14-1 月末缺陷）', () => {
  const plus1 = (y: number, m: number, d: number, h = 0, min = 0) =>
    ts(addMonthsClamped(new Date(y, m, d, h, min), 1));

  it('1/31 +1 → 2/28（原生 setMonth 会溢出到 3/3，跳过整个 2 月）', () => {
    expect(plus1(2026, 0, 31)).toBe(new Date(2026, 1, 28).getTime());
  });

  it('闰年 1/31 +1 → 2/29', () => {
    expect(plus1(2024, 0, 31)).toBe(new Date(2024, 1, 29).getTime());
  });

  it('5/31 +1 → 6/30（30 天月 + 31 号，原生会溢出到 7/1）', () => {
    expect(plus1(2026, 4, 31)).toBe(new Date(2026, 5, 30).getTime());
  });

  it('3/31 -1 → 2/28（原生会算回 3/3，表现为按钮无反应）', () => {
    const d = addMonthsClamped(new Date(2026, 2, 31), -1)!;
    expect(d.getTime()).toBe(new Date(2026, 1, 28).getTime());
    expect(d.getMonth()).toBe(1);
  });

  it('目标月有此日号则不夹取（1/15 → 2/15）', () => {
    expect(plus1(2026, 0, 15)).toBe(new Date(2026, 1, 15).getTime());
  });

  it('跨年 12/31 +1 → 次年 1/31；保留时分毫秒', () => {
    expect(plus1(2026, 11, 31)).toBe(new Date(2027, 0, 31).getTime());
    expect(ts(addMonthsClamped(new Date(2026, 0, 31, 9, 30), 1))).toBe(
      new Date(2026, 1, 28, 9, 30).getTime(),
    );
  });

  it('负数跨度 1/15 -13 → 上年 12/15', () => {
    expect(ts(addMonthsClamped(new Date(2026, 0, 15), -13))).toBe(
      new Date(2024, 11, 15).getTime(),
    );
  });

  it('月首翻月（dateRangePicker 用法）不受影响', () => {
    expect(ts(addMonthsClamped(new Date(2026, 0, 1), 1))).toBe(new Date(2026, 1, 1).getTime());
    expect(ts(addMonthsClamped(new Date(2026, 2, 1), -1))).toBe(new Date(2026, 1, 1).getTime());
  });

  it('非法输入返回 null', () => {
    expect(addMonthsClamped('abc', 1)).toBeNull();
    expect(addMonthsClamped('2026-02-31', 1)).toBeNull();
  });
});

describe('diffLocalDays（A14-2 判定口径）', () => {
  it('同一日恒为 0，且不返回 -0（-0 < 0 为 false 会漏判「逾期不足一天」）', () => {
    const r = diffLocalDays(new Date(2026, 9, 6, 2, 0), parseLocalDate('2026-10-06')!)!;
    expect(r).toBe(0);
    expect(Object.is(r, -0)).toBe(false);
    expect(Object.is(diffLocalDays(new Date(2026, 9, 6, 0, 1), new Date(2026, 9, 6, 23, 59)), -0)).toBe(false);
  });

  it('本地凌晨基准：今天 = 0、昨天 = -1、前天 = -2（旧实现全是 -0）', () => {
    const now = new Date(2026, 9, 6, 2, 0);
    expect(diffLocalDays(now, parseLocalDate('2026-10-06')!)).toBe(0);
    expect(diffLocalDays(now, parseLocalDate('2026-10-05')!)).toBe(-1);
    expect(diffLocalDays(now, parseLocalDate('2026-10-04')!)).toBe(-2);
  });

  it('本地凌晨基准：+3 = 3、+4 = 4（旧实现整体 +1，会从 urgent 掉进 upcoming）', () => {
    const now = new Date(2026, 9, 6, 2, 0);
    expect(diffLocalDays(now, parseLocalDate('2026-10-09')!)).toBe(3);
    expect(diffLocalDays(now, parseLocalDate('2026-10-10')!)).toBe(4);
  });

  it('跨月/跨年按日历日计', () => {
    expect(diffLocalDays(parseLocalDate('2026-01-31')!, parseLocalDate('2026-03-01')!)).toBe(29);
    expect(diffLocalDays(parseLocalDate('2025-12-31')!, parseLocalDate('2026-01-01')!)).toBe(1);
  });

  it('与「时长差」的分水岭：跨午夜但不足 24h 记 1 天（BambooReaderView 文案口径）', () => {
    expect(diffLocalDays(new Date(2026, 9, 5, 23, 0), new Date(2026, 9, 6, 8, 0))).toBe(1);
  });

  it('反向调用取负；任一端非法返回 null', () => {
    const a = parseLocalDate('2026-10-01')!;
    const b = parseLocalDate('2026-10-11')!;
    expect(diffLocalDays(b, a)).toBe(-(diffLocalDays(a, b) as number));
    expect(diffLocalDays('abc', parseLocalDate('2026-10-06')!)).toBeNull();
    expect(diffLocalDays(parseLocalDate('2026-10-06')!, null as never)).toBeNull();
    expect(diffLocalDays('2026-02-31', new Date(2026, 9, 6))).toBeNull();
  });
});
