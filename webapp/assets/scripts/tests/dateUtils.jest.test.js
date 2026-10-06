/**
 * utils/dateUtils 本地日历口径单测
 *
 * 用例约定（重要）：基准时刻一律用**显式本地分量**构造（如 new Date(2026, 9, 6, 2, 0)），
 * 不用 `new Date('...Z')` / `toISOString()`。这样用例在 UTC 与非 UTC 时区下必须得出同一结论
 * （CI 跑 UTC、本机跑 CST），否则「8 小时错档」这一半缺陷在 CI 里根本测不出来。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('dateUtils 本地日历口径', () => {
  let parseLocalDate;
  let startOfLocalDay;
  let startOfLocalMonth;
  let addMonthsClamped;
  let diffLocalDays;
  let dateKeyOf;
  let isTodayKey;
  let formatSlashDate;

  beforeAll(() => {
    const m = loadModule('utils/dateUtils.js', [
      'parseLocalDate',
      'startOfLocalDay',
      'startOfLocalMonth',
      'addMonthsClamped',
      'diffLocalDays',
      'dateKeyOf',
      'isTodayKey',
      'formatSlashDate',
    ]);
    parseLocalDate = m.parseLocalDate;
    startOfLocalDay = m.startOfLocalDay;
    startOfLocalMonth = m.startOfLocalMonth;
    addMonthsClamped = m.addMonthsClamped;
    diffLocalDays = m.diffLocalDays;
    dateKeyOf = m.dateKeyOf;
    isTodayKey = m.isTodayKey;
    formatSlashDate = m.formatSlashDate;
  });

  // ---- parseLocalDate：纯日期串必须落在本地午夜，而不是 UTC 午夜 ----
  describe('parseLocalDate', () => {
    test("'YYYY-MM-DD' 解析为本地 00:00（不是 UTC 午夜）", () => {
      const d = parseLocalDate('2026-10-06');
      expect(d.getTime()).toBe(new Date(2026, 9, 6).getTime());
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(9);
      expect(d.getDate()).toBe(6);
      expect(d.getHours()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getSeconds()).toBe(0);
      expect(d.getMilliseconds()).toBe(0);
    });

    test('带时间的无时区串按本地时间解析', () => {
      const d = parseLocalDate('2026-10-06T09:30:00');
      expect(d.getHours()).toBe(9);
      expect(d.getMinutes()).toBe(30);
      expect(d.getDate()).toBe(6);
    });

    test('拒绝不存在的日期（构造会静默溢出的假日期）', () => {
      expect(parseLocalDate('2026-02-31')).toBeNull();
      expect(parseLocalDate('2026-13-01')).toBeNull();
      expect(parseLocalDate('2026-00-10')).toBeNull();
    });

    test('空值 / 垃圾串 / 非法 Date 一律 null', () => {
      expect(parseLocalDate('')).toBeNull();
      expect(parseLocalDate(null)).toBeNull();
      expect(parseLocalDate(undefined)).toBeNull();
      expect(parseLocalDate('abc')).toBeNull();
      expect(parseLocalDate(new Date('nope'))).toBeNull();
    });

    test('Date 输入返回副本（不改动调用方对象）', () => {
      const src = new Date(2026, 9, 6, 8, 0);
      const copy = parseLocalDate(src);
      expect(copy).not.toBe(src);
      expect(copy.getTime()).toBe(src.getTime());
      copy.setFullYear(1999);
      expect(src.getFullYear()).toBe(2026);
    });
  });

  // ---- 归零点 ----
  describe('startOfLocalDay / startOfLocalMonth', () => {
    test('startOfLocalDay 丢弃时分秒毫秒，保留本地日历日', () => {
      expect(startOfLocalDay(new Date(2026, 9, 6, 23, 59, 59, 999)).getTime())
        .toBe(new Date(2026, 9, 6).getTime());
      expect(startOfLocalDay(new Date(2026, 9, 6, 0, 0, 0, 1)).getTime())
        .toBe(new Date(2026, 9, 6).getTime());
    });

    test('startOfLocalMonth 归一为当月 1 日 00:00', () => {
      const d = startOfLocalMonth(new Date(2026, 9, 31, 8, 30, 15, 500));
      expect(d.getTime()).toBe(new Date(2026, 9, 1).getTime());
      expect(startOfLocalMonth('2026-01-31').getTime()).toBe(new Date(2026, 0, 1).getTime());
    });

    test('非法输入返回 null（调用方据此回退，不再让 Invalid Date 流进渲染）', () => {
      expect(startOfLocalDay('abc')).toBeNull();
      expect(startOfLocalMonth('2026-02-31')).toBeNull();
    });
  });

  // ---- A14-1：月末加月回归 ----
  describe('addMonthsClamped（A14-1 月末缺陷）', () => {
    const at = (y, m, d, h = 0, min = 0) => addMonthsClamped(new Date(y, m, d, h, min), 1);

    test('1/31 +1 → 2/28（原生 setMonth 会溢出到 3/3，跳过一个整月）', () => {
      expect(at(2026, 0, 31).getTime()).toBe(new Date(2026, 1, 28).getTime());
    });

    test('闰年 1/31 +1 → 2/29', () => {
      expect(at(2024, 0, 31).getTime()).toBe(new Date(2024, 1, 29).getTime());
    });

    test('5/31 +1 → 6/30（30 天月 + 31 号同样中招，原生会溢出到 7/1）', () => {
      expect(at(2026, 4, 31).getTime()).toBe(new Date(2026, 5, 30).getTime());
    });

    test('3/31 -1 → 2/28（原生 setMonth(-1) 会算回 3/3，表现为按钮无反应）', () => {
      const d = addMonthsClamped(new Date(2026, 2, 31), -1);
      expect(d.getTime()).toBe(new Date(2026, 1, 28).getTime());
      expect(d.getMonth()).toBe(1);
    });

    test('目标月有此日号则不夹取（语义不变：1/15 → 2/15）', () => {
      expect(at(2026, 0, 15).getTime()).toBe(new Date(2026, 1, 15).getTime());
    });

    test('跨年：12/31 +1 → 次年 1/31（1 月有 31 天，不夹取）', () => {
      expect(at(2026, 11, 31).getTime()).toBe(new Date(2027, 0, 31).getTime());
    });

    test('保留时分秒毫秒', () => {
      const d = addMonthsClamped(new Date(2026, 0, 31, 9, 30, 15, 250), 1);
      expect(d.getTime()).toBe(new Date(2026, 1, 28, 9, 30, 15, 250).getTime());
    });

    test('负数跨度：1/15 -13 个月 → 上年 12/15', () => {
      const d = addMonthsClamped(new Date(2026, 0, 15), -13);
      expect(d.getTime()).toBe(new Date(2024, 11, 15).getTime());
    });

    test('月首翻月（dateRangePicker 实际用法）不受影响', () => {
      expect(addMonthsClamped(new Date(2026, 0, 1), 1).getTime()).toBe(new Date(2026, 1, 1).getTime());
      expect(addMonthsClamped(new Date(2026, 2, 1), -1).getTime()).toBe(new Date(2026, 1, 1).getTime());
    });

    test('非法输入返回 null', () => {
      expect(addMonthsClamped('abc', 1)).toBeNull();
      expect(addMonthsClamped('2026-02-31', 1)).toBeNull();
    });
  });

  // ---- A14-2：日历日差（判定口径）----
  describe('diffLocalDays（A14-2 判定口径）', () => {
    test('同一日恒为 0，且不返回 -0（-0 < 0 为 false 会漏判「逾期不足一天」）', () => {
      const r = diffLocalDays(new Date(2026, 9, 6, 2, 0), parseLocalDate('2026-10-06'));
      expect(r).toBe(0);
      expect(Object.is(r, -0)).toBe(false);
      expect(Object.is(diffLocalDays(new Date(2026, 9, 6, 0, 1), new Date(2026, 9, 6, 23, 59)), -0)).toBe(false);
    });

    test('本地凌晨基准下：今天到期 = 0、昨天到期 = -1（旧实现两者都是 -0）', () => {
      const now = new Date(2026, 9, 6, 2, 0);
      expect(diffLocalDays(now, parseLocalDate('2026-10-06'))).toBe(0);
      expect(diffLocalDays(now, parseLocalDate('2026-10-05'))).toBe(-1);
      expect(diffLocalDays(now, parseLocalDate('2026-10-04'))).toBe(-2);
    });

    test('本地凌晨基准下：+3 天 = 3、+4 天 = 4（旧实现整体 +1，会从 urgent 掉进 upcoming）', () => {
      const now = new Date(2026, 9, 6, 2, 0);
      expect(diffLocalDays(now, parseLocalDate('2026-10-09'))).toBe(3);
      expect(diffLocalDays(now, parseLocalDate('2026-10-10'))).toBe(4);
    });

    test('跨月/跨年按日历日计（不含时长误差）', () => {
      expect(diffLocalDays(parseLocalDate('2026-01-31'), parseLocalDate('2026-03-01'))).toBe(29);
      expect(diffLocalDays(parseLocalDate('2025-12-31'), parseLocalDate('2026-01-01'))).toBe(1);
      expect(diffLocalDays(parseLocalDate('2026-12-31'), parseLocalDate('2027-01-01'))).toBe(1);
    });

    test('与「时长差」的分水岭：跨午夜但不足 24h 记 1 天（决策 3 的文案口径）', () => {
      const r = diffLocalDays(new Date(2026, 9, 5, 23, 0), new Date(2026, 9, 6, 8, 0));
      expect(r).toBe(1); // 时长仅 9h，Math.floor(9h/24h) 会得 0 → 误显示「今天」
    });

    test('反向调用取负，且不出现 -0', () => {
      const a = parseLocalDate('2026-10-01');
      const b = parseLocalDate('2026-10-11');
      expect(diffLocalDays(b, a)).toBe(-diffLocalDays(a, b));
      expect(diffLocalDays(a, a)).toBe(0);
    });

    test('任一端非法返回 null（不再靠 NaN 静默穿透）', () => {
      expect(diffLocalDays('abc', parseLocalDate('2026-10-06'))).toBeNull();
      expect(diffLocalDays(parseLocalDate('2026-10-06'), null)).toBeNull();
      expect(diffLocalDays('2026-02-31', new Date(2026, 9, 6))).toBeNull();
    });
  });

  // ---- A10：把「今天」与「正在渲染哪天」解耦的判定原语 ----
  describe('isTodayKey（A10 当前时段判定的前提）', () => {
    const noon = new Date(2026, 9, 6, 10, 30);

    test('同一本地日历日恒为真（不受时刻影响）', () => {
      expect(isTodayKey('2026-10-06', noon)).toBe(true);
      expect(isTodayKey('2026-10-06', new Date(2026, 9, 6, 0, 0, 0, 1))).toBe(true);
      expect(isTodayKey('2026-10-06', new Date(2026, 9, 6, 23, 59, 59, 999))).toBe(true);
    });

    test('本地凌晨基准下仍与「今天」一致（旧写法按 UTC 解析会把日界挪到 08:00）', () => {
      const early = new Date(2026, 9, 6, 2, 0);
      expect(isTodayKey('2026-10-06', early)).toBe(true);
      expect(isTodayKey('2026-10-05', early)).toBe(false);
    });

    test('昨天 / 明天为假', () => {
      expect(isTodayKey('2026-10-05', noon)).toBe(false);
      expect(isTodayKey('2026-10-07', noon)).toBe(false);
    });

    test('跨月 / 跨年边界', () => {
      expect(isTodayKey('2026-10-01', new Date(2026, 9, 1))).toBe(true);
      expect(isTodayKey('2026-10-31', new Date(2026, 9, 31))).toBe(true);
      expect(isTodayKey('2026-12-31', new Date(2026, 11, 31, 23, 30))).toBe(true);
      expect(isTodayKey('2025-12-31', new Date(2026, 0, 1))).toBe(false);
    });

    test('缺省 / 非法 / 非补零格式一律 false（宁可不高亮，也不谎称「当前」）', () => {
      expect(isTodayKey(null, noon)).toBe(false);
      expect(isTodayKey(undefined, noon)).toBe(false);
      expect(isTodayKey('', noon)).toBe(false);
      expect(isTodayKey('2026-9-6', noon)).toBe(false);
      expect(isTodayKey('2026-02-31', noon)).toBe(false);
      expect(isTodayKey(20261006, noon)).toBe(false);
      expect(isTodayKey(new Date(2026, 9, 6), noon)).toBe(false);
    });
  });

  describe('dateKeyOf / formatSlashDate', () => {
    test('dateKeyOf 取本地日历日期并补零（与 day 文件名同口径）', () => {
      expect(dateKeyOf(new Date(2026, 9, 6, 10, 30))).toBe('2026-10-06');
      expect(dateKeyOf(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
      expect(dateKeyOf(new Date(2026, 9, 6, 23, 59, 59, 999))).toBe('2026-10-06');
    });

    test('dateKeyOf 在本地凌晨不与 UTC 串位', () => {
      expect(dateKeyOf(new Date(2026, 9, 6, 0, 0))).toBe('2026-10-06');
      expect(dateKeyOf(new Date(2026, 9, 6, 2, 0))).toBe('2026-10-06');
    });

    test('dateKeyOf 接受日期串，非法输入返回 null', () => {
      expect(dateKeyOf('2026-10-06')).toBe('2026-10-06');
      expect(dateKeyOf('2026-02-31')).toBeNull();
      expect(dateKeyOf('abc')).toBeNull();
      expect(dateKeyOf(null)).toBeNull();
    });

    test('formatSlashDate 保形 2026/10/6（不补零，与 toLocaleDateString("zh-CN") 一致）', () => {
      expect(formatSlashDate('2026-10-06')).toBe('2026/10/6');
      expect(formatSlashDate('2026-01-01')).toBe('2026/1/1');
      expect(formatSlashDate('2026-12-31')).toBe('2026/12/31');
    });

    test('formatSlashDate 非法/缺省返回空串（渲染层不出现 Invalid Date）', () => {
      expect(formatSlashDate(null)).toBe('');
      expect(formatSlashDate('')).toBe('');
      expect(formatSlashDate('abc')).toBe('');
      expect(formatSlashDate('2026-02-31')).toBe('');
    });
  });
});
