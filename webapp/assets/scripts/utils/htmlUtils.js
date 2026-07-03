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
    }
};

window.HTMLUtils = HTMLUtils;
window.escapeHtml = HTMLUtils.escapeHtml;