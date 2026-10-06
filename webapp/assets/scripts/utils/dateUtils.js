/**
 * 通用日期工具（统一「本地日历」口径）
 *
 * 为什么必须有这个文件（两类同源缺陷的唯一收敛点）：
 *  1. `new Date('YYYY-MM-DD')` 按 **UTC 午夜** 解析，而业务里的 now 是本机时钟 ——
 *     东八区下等价于把「日界」从本地 00:00 挪到本地 08:00，所有「还剩/逾期/停滞」
 *     判定在本地 00:00–07:59 整体错 1 档；并且同一时刻会算出 `-0`，而
 *     `-0 < 0 === false`，导致「逾期不足一天」永远进不了逾期档。
 *  2. `setMonth(m + 1)` 在月末会**溢出**（1/31 + 1 月 → 3/3），翻月时会跳过整月；
 *     往回翻则可能算回同月，表现为「按钮点了没反应」。
 *
 * 因此本文件是这两类运算的唯一入口：一律用本地年月日分量构造、一律走显式加月夹取。
 * 口径依据：WalletService.js「本子系统其他『按天判定』都用本地日历」。
 *
 * 零依赖：不碰 DOM / store / 事件，无 globalThis 副作用，浏览器与 Node 测试都可用。
 */

/** 一天的毫秒数。仅用于「已归零到本地午夜」的两个时刻做差，跨 DST 的 ±1h 由 Math.round 吸收。 */
const MS_PER_DAY = 86400000;

/**
 * 把常见日期输入解析为 Date，并对纯日期串使用**本地日历**口径。
 *
 * - `'YYYY-MM-DD'` → 该日本地 00:00（**不是** UTC 午夜，这是本模块存在的首要理由）
 * - `'YYYY-MM-DDTHH:mm...'` 等带时间串 → 交给原生解析（无时区标记即按本地时间）
 * - `Date` → 复制一份（不改动调用方对象）
 * - `number` → 时间戳
 * - 非法日期（含 `'2026-02-31'` 这类构造会溢出的假日期）→ `null`
 *
 * @param {string|number|Date|null|undefined} value
 * @returns {Date|null} 合法返回 Date，否则 null（调用方必须显式判空，不再依赖 NaN 静默穿透）
 */
export function parseLocalDate(value) {
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
        // 反查拒绝溢出日期：new Date(2026, 1, 31) 会静默变成 3/3，垃圾输入不该被当成合法到期日
        if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
        return d;
    }

    const fallback = new Date(str);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * 归零到**本地**当日 00:00（保留日历日，丢弃时分秒毫秒）。
 * @param {string|number|Date} value
 * @returns {Date|null}
 */
export function startOfLocalDay(value) {
    const d = value instanceof Date ? value : parseLocalDate(value);
    if (!d || Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * 归零到**本地**当月 1 日 00:00。
 * 用途：月份指针（如日历弹层的 displayMonth）只应携带年月，日号是纯负债 ——
 * 携带日号才会在翻月时踩月末溢出，归一到月首可从模型上根除该类缺陷。
 * @param {string|number|Date} value
 * @returns {Date|null}
 */
export function startOfLocalMonth(value) {
    const d = value instanceof Date ? value : parseLocalDate(value);
    if (!d || Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * 加 N 个月，**同号 + 目标月无此日则夹到月末**（保留时分秒毫秒）。
 *
 * 这是 `setMonth()` 的正确替代：原生 `setMonth` 在目标月缺少该日号时会溢出到下月上旬。
 *   1/31 +1 → 2/28（原生：3/3）   3/31 -1 → 2/28（原生：3/3，看起来「没反应」）
 *   5/31 +1 → 6/30（原生：7/1）   1/15 +1 → 2/15（无夹取，语义不变）
 *
 * @param {string|number|Date} value
 * @param {number} months 可为负
 * @returns {Date|null}
 */
export function addMonthsClamped(value, months) {
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
        d.getMilliseconds()
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
 * 所以「昨天 23:00 → 今天 08:00」是 1 天而非 0 天，判「今天/昨天」不会错档。
 * 跨 DST 日（23h / 25h）由 Math.round 吸收。
 *
 * 返回值恒不为 `-0`（已显式归位到 `0`）——调用方大量使用 `days < 0` 判逾期，
 * 而 `-0 < 0 === false`，负零会让「逾期不足一天」静默漏判。
 *
 * @param {string|number|Date} from
 * @param {string|number|Date} to
 * @returns {number|null} 任一端非法则 null
 */
export function diffLocalDays(from, to) {
    const a = startOfLocalDay(from);
    const b = startOfLocalDay(to);
    if (!a || !b) return null;
    const days = Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
    return days === 0 ? 0 : days;
}

/**
 * 把日期格式化为**本地**日期键 `YYYY-MM-DD`（与 store.getDateKey / day 文件名同口径）。
 * @param {Date|string|number} [date=new Date()]
 * @returns {string|null}
 */
export function dateKeyOf(date = new Date()) {
    const d = date instanceof Date ? date : parseLocalDate(date);
    if (!d || Number.isNaN(d.getTime())) return null;
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * 日期 → `YYYY-MM-DD`，**非法输入返回空串**。
 *
 * 这是本仓库「日期格式化」的唯一实现入口：`dateKeyOf` 负责口径（本地日历日 + 非法返回 null），
 * 这里只加一层空串适配，以兼容既有调用方把 `''` 当作「无日期/清空」语义的约定。
 *
 * 收敛历史（C 轮）：utils/helpers.js、utils/goalCalculations.js、
 * handlers/datePicker.js._formatDate、modules/goals/dateRangePicker.js 曾各有一份同源实现；
 * 其中前两处对非法输入返回 ''，后两处漏了守卫、会输出 `NaN-NaN-NaN`。统一到此处后行为一致。
 *
 * @param {Date|string|number} [date]
 * @returns {string} 'YYYY-MM-DD'；非法输入为 ''
 */
export const formatDate = (date) => {
    // null / undefined 必须显式挡掉：dateKeyOf 的默认参数只对 undefined 生效，
    // 若直接透传，undefined 会变成「今天」、null 会走 parseLocalDate(null)。
    // 历史实现（helpers / goalCalculations）对两者都返回 ''，此处保持该契约。
    if (date === null || date === undefined) return '';
    return dateKeyOf(date) ?? '';
};

/**
 * 给定的日期键是否就是**今天**（本地日历口径）。
 *
 * 用途：把「当前时段」「今天」这类**只对今天成立**的语义，与「正在渲染哪一天」解耦开来。
 * 应用支持日期导航（navigation / datePicker → store.currentDate），若渲染器直接读 `new Date()`
 * 判断「当前」，回头看 9/15 时会用「现在几点」去点亮 9/15 的时段 —— 数据是那天的，标注却是今天的。
 *
 * 非法/缺省输入一律返回 false：宁可不高亮，也不要在无日期上下文时谎称「当前」。
 *
 * @param {string|null|undefined} dateKey `YYYY-MM-DD`
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 */
export function isTodayKey(dateKey, now = new Date()) {
    if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
    return dateKey === dateKeyOf(now);
}

/**
 * 日期键 → 斜杠短日期 `2026/10/6`（**不补零**，与 `toLocaleDateString('zh-CN')` 形状一致）。
 *
 * 刻意保留该形状而非改用中文长日期：票根正面是窄条小字号，只修「印的是哪一天」这个事实性错误，
 * 不顺手改视觉。非法/缺省输入返回空串（调用方自行决定占位）。
 * @param {string|null|undefined} dateKey `YYYY-MM-DD`
 * @returns {string}
 */
export function formatSlashDate(dateKey) {
    const d = parseLocalDate(dateKey);
    if (!d) return '';
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
