/**
 * 通用日期工具（统一「本地日历」口径）—— webapp `utils/dateUtils.js` 的 TS 孪生。
 *
 * 两侧无法共享代码（webapp 跑在 data: URL 沙箱的 ESM 里，宿主是 Obsidian TS），
 * 故各存一份、语义逐字对齐（与既有 formatDate 在两侧各有一份同源同理）。
 *
 * 存在理由（两类同源缺陷的唯一收敛点）：
 *  1. `new Date('YYYY-MM-DD')` 按 **UTC 午夜** 解析，而 now 是本机时钟 —— 东八区下等价于
 *     把「日界」挪到本地 08:00，00:00–07:59 所有「还剩/逾期/停滞」判定错 1 档；且会算出
 *     `-0`，而 `-0 < 0 === false`，「逾期不足一天」永远进不了逾期档。
 *  2. `Math.floor((now - d) / 86400000)` 是**时长**差而非**日历日**差：昨天 23:00 → 今天
 *     08:00 会算成 0 天，于是「今天/昨天」文案错档。
 *
 * 口径参照：healthScore.ts（注入 `today: Date` + 本地解析）、workdayCalendar.ts（本地分量构造）。
 */

/** 一天的毫秒数。仅用于「已归零到本地午夜」的两个时刻做差，跨 DST 的 ±1h 由 Math.round 吸收。 */
const MS_PER_DAY = 86400000;

export type DateLike = string | number | Date;

/**
 * 把常见日期输入解析为 Date，并对纯日期串使用**本地日历**口径。
 *
 * - `'YYYY-MM-DD'` → 该日本地 00:00（**不是** UTC 午夜）
 * - 带时间的字符串 → 交给原生解析（无时区标记即按本地时间）
 * - `Date` → 复制一份（不改动调用方对象）
 * - 非法日期（含 `'2026-02-31'` 这类构造会溢出的假日期）→ `null`
 */
export function parseLocalDate(value: DateLike | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  if (typeof value === 'number') {
    const fromTs = new Date(value);
    return Number.isNaN(fromTs.getTime()) ? null : fromTs;
  }

  const str = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const d = new Date(year, month - 1, day);
    // 反查拒绝溢出日期：new Date(2026, 1, 31) 会静默变成 3/3
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return null;
    }
    return d;
  }

  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/** 归零到**本地**当日 00:00（保留日历日，丢弃时分秒毫秒）。 */
export function startOfLocalDay(value: DateLike): Date | null {
  const d = value instanceof Date ? value : parseLocalDate(value);
  if (!d || Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * 归零到**本地**当月 1 日 00:00。
 * 用途：月份指针只应携带年月，日号是纯负债 —— 携带日号才会在翻月时踩月末溢出。
 */
export function startOfLocalMonth(value: DateLike): Date | null {
  const d = value instanceof Date ? value : parseLocalDate(value);
  if (!d || Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * 加 N 个月，**同号 + 目标月无此日则夹到月末**（保留时分秒毫秒）。
 *
 * 这是 `setMonth()` 的正确替代：原生 `setMonth` 在目标月缺少该日号时会溢出到下月上旬。
 *   1/31 +1 → 2/28（原生：3/3）   3/31 -1 → 2/28（原生：3/3，看起来「没反应」）
 */
export function addMonthsClamped(value: DateLike, months: number): Date | null {
  const d = value instanceof Date ? value : parseLocalDate(value);
  if (!d || Number.isNaN(d.getTime())) return null;

  const delta = Number(months);
  if (!Number.isFinite(delta)) return new Date(d.getTime());

  const day = d.getDate();
  const base = new Date(
    d.getFullYear(),
    d.getMonth() + Math.trunc(delta),
    1,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds(),
  );
  // 目标月最后一天 = 次月「0 号」
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  base.setDate(Math.min(day, lastDay));
  return base;
}

/**
 * 两个时刻之间的**日历日差**（本地口径），返回 `to - from` 的整数天数。
 *
 * 与 `Math.floor((to - from) / 86400000)`（时长差）的区别：本函数先各自归零到本地午夜，
 * 所以「昨天 23:00 → 今天 08:00」是 1 天而非 0 天。跨 DST 日由 Math.round 吸收。
 * 返回值恒不为 `-0`（已显式归位到 `0`）—— `-0 < 0 === false` 会让「逾期不足一天」漏判。
 *
 * @returns 任一端非法则 `null`
 */
export function diffLocalDays(from: DateLike, to: DateLike): number | null {
  const a = startOfLocalDay(from);
  const b = startOfLocalDay(to);
  if (!a || !b) return null;
  const days = Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
  return days === 0 ? 0 : days;
}
