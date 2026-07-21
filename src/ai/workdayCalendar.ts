/**
 * workdayCalendar — 共享的工作日 / 节假日计算（DeviationCalculator 与 healthScore 统一口径）
 *
 * 单一事实来源：两处原本各有一份 countWorkdays（一个不计节假日、一个计），
 * 曾导致诊断报告「预期进度%」(DeviationCalculator) 与健康分「按时分」(healthScore)
 * 用不同日历基准、结论打架。统一抽到这里，今后节假日口径只改一处。
 *
 * 零 Obsidian 依赖，可单测。
 */
export function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 纯函数：构造某年的法定节假日 + 春节集合（与 webapp 口径一致） */
export function buildHolidays(refYear: number): Set<string> {
  const h = new Set<string>();
  const add = (y: number, m: number, d: number) =>
    h.add(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  [refYear, refYear + 1].forEach((y) => {
    add(y, 1, 1);
    add(y, 5, 1); add(y, 5, 2); add(y, 5, 3);
    add(y, 10, 1); add(y, 10, 2); add(y, 10, 3); add(y, 10, 4); add(y, 10, 5); add(y, 10, 6); add(y, 10, 7);
    add(y, 4, 4); add(y, 4, 5); add(y, 4, 6);
    add(y, 6, 9); add(y, 6, 10);
    add(y, 9, 14); add(y, 9, 15); add(y, 9, 16);
  });
  if (refYear <= 2025 && 2025 <= refYear + 1) {
    ['2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31',
      '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04'].forEach((d) => h.add(d));
  }
  if (refYear <= 2026 && 2026 <= refYear + 1) {
    ['2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19',
      '2026-02-20', '2026-02-21', '2026-02-22'].forEach((d) => h.add(d));
  }
  return h;
}

let _holidayCache: { year: number; set: Set<string> } | null = null;
export function getHolidays(year: number): Set<string> {
  if (_holidayCache && _holidayCache.year === year) return _holidayCache.set;
  const set = buildHolidays(year);
  _holidayCache = { year, set };
  return set;
}

/**
 * 覆盖区间所有年份的节假日集合（含端点年的相邻年，因 buildHolidays 已多带 +1 年）。
 * 用于跨年目标：避免非当前年的法定节假日漏算导致工作日计数偏高。
 */
export function getHolidaysForRange(from: Date, to: Date): Set<string> {
  const lo = Number.isFinite(from.getFullYear()) ? from.getFullYear() : new Date().getFullYear();
  const hi = Number.isFinite(to.getFullYear()) ? to.getFullYear() : lo;
  const set = new Set<string>();
  for (let y = lo; y <= hi; y++) {
    for (const d of buildHolidays(y)) set.add(d);
  }
  return set;
}

export function isWorkday(d: Date, holidays: Set<string>): boolean {
  const day = d.getDay();
  if (day === 0 || day === 6) return false;
  return !holidays.has(fmt(d));
}

/**
 * 半开区间 [from, to) 的工作日计数（排除周末与法定节假日，不含 to 当日）。
 * 与 webapp 端 `GoalHealthScore._countWorkdays` 保持同一边界约定，
 * 避免「竹杖 vs 竹林修仙」因端点是否计入而差 1 分。
 */
export function countWorkdays(from: Date, to: Date, holidays: Set<string>): number {
  let count = 0;
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (cur >= last) return 0;
  while (cur < last) {
    if (isWorkday(cur, holidays)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function workdaysBetween(from: Date, to: Date, holidays: Set<string>): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (b >= a) return countWorkdays(a, b, holidays);
  return -countWorkdays(b, a, holidays);
}
