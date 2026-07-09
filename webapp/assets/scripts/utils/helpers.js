import { byId, $ as _q, $$ as _qa } from './domRef.js';

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
    const elementPosition = rect.top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
};

export const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

export const debounce = (fn, delay = 300, immediate = false) => {
    let timer = null;
    return (...args) => {
        if (timer) clearTimeout(timer);
        if (immediate && !timer) {
            fn(...args);
        }
        timer = setTimeout(() => {
            if (!immediate) fn(...args);
            timer = null;
        }, delay);
    };
};

export const throttle = (fn, delay = 300, options = {}) => {
    let last = 0;
    let timer = null;
    const { leading = true, trailing = true } = options;

    return (...args) => {
        const now = Date.now();
        if (!last && !leading) last = now;

        if (now - last >= delay) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            fn(...args);
            last = now;
        } else if (!timer && trailing) {
            timer = setTimeout(() => {
                last = leading ? Date.now() : 0;
                timer = null;
                fn(...args);
            }, delay - (now - last));
        }
    };
};

export const createElement = (tag, className, innerHTML) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
};

export const $ = (selector) => _q(selector);
const $$ = (selector) => _qa(selector);

export const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    return { hour: parseInt(match[1]), minute: parseInt(match[2]) };
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
