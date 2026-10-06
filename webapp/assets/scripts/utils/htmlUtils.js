export const HTMLUtils = {
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    escapeHtmlAttr(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    setSafeContent(el, html, allowHtml) {
        if (allowHtml) {
            el.innerHTML = html;
        } else {
            el.textContent = html;
        }
    },

    setSafeHTML(el, html) {
        el.textContent = html;
    },

    createSafeElement(tag, attrs = {}, text) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'onClick') {
                el.addEventListener('click', value);
            } else if (key.startsWith('data-')) {
                el.setAttribute(key, value);
            } else {
                el[key] = value;
            }
        });
        if (text !== undefined) el.textContent = text;
        return el;
    },

    sanitizeHTML(html) {
        return this.escapeHtml(html);
    },

    stripAllTags(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || '';
    },

    /**
     * 数值强制器：把任意值收敛为有限数字，供属性上下文使用。
     *
     * 用途有二：
     *  1. 让属性插值可被静态判定为安全（scripts/check-html-escape.mjs 认可 num()），
     *     从而把「运行时才知道是不是数字」的值移出豁免清单；
     *  2. 顺带修掉真实缺陷——布局计算一旦出现 NaN / undefined，
     *     直接插值会产出 style="left:undefined%" 或 "width:NaN%" 这类非法 CSS，
     *     浏览器静默丢弃整条声明；收敛为 0 至少是确定行为。
     */
    num(v) {
        const n = typeof v === 'number' ? v : parseFloat(v);
        return Number.isFinite(n) ? n : 0;
    }
};

window.HTMLUtils = HTMLUtils;
window.escapeHtml = HTMLUtils.escapeHtml;
window.num = HTMLUtils.num;