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

    test('契约：escapeHtml 只用于文本上下文（不转义引号），属性上下文必须用 escapeHtmlAttr', () => {
        // escapeHtml 基于 textContent→innerHTML，天然不转义引号；这是有意设计：
        // 引号只在 HTML 属性值里危险，而 escapeHtml 用于文本节点/文本插值。
        // 若有用户输入要放进属性（title="..." / data-* 等），必须用 escapeHtmlAttr。
        // 锁死此差异，避免有人「顺手把 escapeHtml 改成也转义引号」导致全站渲染变化。
        expect(window.HTMLUtils.escapeHtml('a"b\'c')).toBe('a"b\'c');          // 文本上下文：引号原样保留
        expect(window.HTMLUtils.escapeHtmlAttr('a"b\'c')).toBe('a&quot;b&#39;c'); // 属性上下文：引号被转义
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
