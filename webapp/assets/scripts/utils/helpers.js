import { byId, getScrollHost } from './domRef.js';
import { formatDate } from './dateUtils.js';

export const scrollToSection = (id) => {
    const el = byId(id);
    if (!el || !el.isConnected) return;
    let rect;
    try {
        rect = el.getBoundingClientRect();
    } catch (e) {
        return;
    }
    if (!rect || (rect.width === 0 && rect.height === 0)) return;
    const headerOffset = 100;
    // shadow 模式下滚动容器是 host（不是 window）：①要用容器的 scrollTop 而非 pageYOffset；
    // ②rect.top 是相对视口的，换算成「相对容器内容顶端」还需减掉容器自身的视口偏移；
    // ③要滚的是 host。原实现三点都按 window 走，在 shadow 模式下整段失效（点了没反应）。
    const host = getScrollHost();
    const isDocScroll = !host || host === document.scrollingElement;
    const originTop = isDocScroll ? 0 : host.getBoundingClientRect().top;
    // 文档滚动时 window.scrollY 即权威值（浏览器中与 scrollingElement.scrollTop 等价）；
    // shadow 模式下必须读容器自身 —— window.scrollY 恒为 0。
    const scrolled = isDocScroll ? (window.scrollY || window.pageYOffset || 0) : host.scrollTop;
    const offsetPosition = rect.top - originTop + scrolled - headerOffset;
    const target = Math.max(0, offsetPosition);
    if (isDocScroll) window.scrollTo({ top: target, behavior: 'smooth' });
    else host.scrollTo({ top: target, behavior: 'smooth' });
};

// 实现已收敛到 utils/dateUtils.js（dateKeyOf + 「非法输入 → ''」契约），此处仅转发，
// 以保持 helpers 的公开面（文件尾 window 全局桥）与既有调用方不变。
export { formatDate };

export const getChineseDateDisplay = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
};

export const getChineseWeekday = (date) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
};

/**
 * 解析时间字符串里的**首个** `HH:MM`。
 *
 * 口径说明（C 轮统一）：条目时间是自由文本输入（modules/timeline/editor.js 的
 * placeholder 就写着「例如: 09:00 - 12:00」），因此允许前后空格与夹带文本，取第一个时间点。
 * 此前 helpers 用「不 trim + 整串锚定」的严格匹配、services/TimelineService.js 自带一份
 * 「trim + 非锚定」实现，两条路径分别写/读同一份 data.metrics，同一条目会得到不同打卡时间；
 * 现统一到本实现（TimelineService.parseTime 已改为转发）。
 *
 * 注意：返回值是单值，区间「09:00 - 12:00」只取起点，区间终点不参与首末打卡计算。
 *
 * @param {string} timeStr
 * @returns {{hour: number, minute: number}|null}
 */
export const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const match = timeStr.trim().match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
};

export const calculateCheckInTimes = (timeline) => {
    if (!timeline || !Array.isArray(timeline)) {
        return { firstCheckIn: '--:--', lastCheckIn: '--:--' };
    }

    const allTimes = [];
    timeline.forEach(period => {
        if (period.items && Array.isArray(period.items)) {
            period.items.forEach(item => {
                const parsed = parseTime(item.time);
                if (parsed) allTimes.push(parsed);
            });
        }
    });

    if (allTimes.length === 0) {
        return { firstCheckIn: '--:--', lastCheckIn: '--:--' };
    }

    allTimes.sort((a, b) => {
        if (a.hour !== b.hour) return a.hour - b.hour;
        return a.minute - b.minute;
    });

    const formatTime = (t) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;

    return {
        firstCheckIn: formatTime(allTimes[0]),
        lastCheckIn: formatTime(allTimes[allTimes.length - 1])
    };
};

window.scrollToSection = scrollToSection;
window.formatDate = formatDate;
window.getChineseDateDisplay = getChineseDateDisplay;
window.getChineseWeekday = getChineseWeekday;
window.parseTime = parseTime;
window.calculateCheckInTimes = calculateCheckInTimes;
