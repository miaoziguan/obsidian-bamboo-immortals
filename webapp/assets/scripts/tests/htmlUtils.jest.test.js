/**
 * @jest-environment jsdom
  */
const { loadModule } = require('./__helpers__/testUtils');
describe('HTMLUtils', () => {
    beforeEach(() => {
        jest.resetModules();
        delete window.HTMLUtils;
        delete window.escapeHtml;
        loadModule('utils/htmlUtils.js', ['HTMLUtils']);
    });

    test('escapeHtml 应转义 < > & 字符', () => {
        expect(window.HTMLUtils.escapeHtml('<div>&')).toBe('&lt;div&gt;&amp;');
    });

    test('escapeHtml null/undefined 应返回空字符串', () => {
        expect(window.HTMLUtils.escapeHtml(null)).toBe('');
        expect(window.HTMLUtils.escapeHtml(undefined)).toBe('');
    });

    test('escapeHtmlAttr 应转义 " \' < > & 字符', () => {
        expect(window.HTMLUtils.escapeHtmlAttr('"\'<>&')).toBe('&quot;&#39;&lt;&gt;&amp;');
    });

    test('setSafeContent allowHtml=false 应使用 textContent', () => {
        const el = document.createElement('div');
        window.HTMLUtils.setSafeContent(el, '<b>bold</b>', false);
        expect(el.textContent).toBe('<b>bold</b>');
        expect(el.querySelector('b')).toBeNull();
    });

    test('setSafeContent allowHtml=true 应使用 innerHTML', () => {
        const el = document.createElement('div');
        window.HTMLUtils.setSafeContent(el, '<b>bold</b>', true);
        expect(el.innerHTML).toBe('<b>bold</b>');
        expect(el.querySelector('b')).not.toBeNull();
    });

    test('setSafeHTML 应剥离所有 HTML 标签', () => {
        const el = document.createElement('div');
        window.HTMLUtils.setSafeHTML(el, '<b>bold</b>');
        expect(el.querySelector('b')).toBeNull();
        expect(el.textContent).toBe('<b>bold</b>');
    });

    test('createSafeElement 应创建带属性的 DOM 元素', () => {
        const el = window.HTMLUtils.createSafeElement('div', { className: 'test-class' }, 'Hello');
        expect(el.tagName).toBe('DIV');
        expect(el.className).toBe('test-class');
        expect(el.textContent).toBe('Hello');
    });

    test('createSafeElement data- 属性应使用 setAttribute', () => {
        const el = window.HTMLUtils.createSafeElement('div', { 'data-id': '123' });
        expect(el.getAttribute('data-id')).toBe('123');
    });

    test('createSafeElement onClick 应使用 addEventListener', () => {
        const handler = jest.fn();
        const el = window.HTMLUtils.createSafeElement('button', { onClick: handler });
        el.click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test('sanitizeHTML 应转义 HTML 标签', () => {
        expect(window.HTMLUtils.sanitizeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    test('stripAllTags 应移除所有 HTML 标签', () => {
        expect(window.HTMLUtils.stripAllTags('<b>bold</b> and <i>italic</i>')).toBe('bold and italic');
    });
});
