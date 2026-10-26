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

});
