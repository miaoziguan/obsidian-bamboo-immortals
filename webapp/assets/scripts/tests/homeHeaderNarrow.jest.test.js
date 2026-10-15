/**
 * 首页 header（天气 + 语录）窄栏居中回归锁。
 *
 * 背景：用户要求窄栏下首页顶部的「天气」与「语录」居中排版。
 * 根因：.header 用 space-between + .header-right 用 flex-end，窄栏换行后两块分居两端/右对齐，
 * 既不居中也不协调。修复复用 displayManager 基于「容器实际宽度」加的 .rw-460 类
 *（不是视口 media query —— Obsidian 窄侧栏在宽屏下视口 query 不触发），把两端对齐改为居中。
 *
 * 这些断言只校验静态 CSS 规则存在且取值正确，不依赖运行时 DOM。
 */
const fs = require('fs');
const path = require('path');

const CSS = fs.readFileSync(
    path.resolve(__dirname, '../../styles/base.css'),
    'utf8'
);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function ruleOf(css, selector) {
    // 锚定行首，避免命中组合选择器（如 .theme-dark .rw-460 …）
    const m = new RegExp('(?:^|\\n)\\s*' + escapeRe(selector) + '\\s*\\{([^}]*)\\}').exec(css);
    return m ? m[1] : null;
}

describe('首页 header 窄栏居中（.rw-460）', () => {
    test('宽栏默认仍是两端对齐（不破坏宽屏排版）', () => {
        const base = ruleOf(CSS, '.header');
        expect(base).not.toBeNull();
        expect(base).toMatch(/justify-content:\s*space-between/);
    });

    test('窄栏下 .header 改为居中', () => {
        const r = ruleOf(CSS, '.rw-460 .header');
        expect(r).not.toBeNull();
        expect(r).toMatch(/justify-content:\s*center/);
    });

    test('窄栏下 .header-left 与 .header-right 内容均居中', () => {
        const left = ruleOf(CSS, '.rw-460 .header-left');
        const right = ruleOf(CSS, '.rw-460 .header-right');
        expect(left).not.toBeNull();
        expect(right).not.toBeNull();
        expect(left).toMatch(/justify-content:\s*center/);
        expect(right).toMatch(/justify-content:\s*center/);
    });

    test('窄栏规则须挂在 .rw-460 下（与 displayManager 实际宽度断点一致，而非视口 query）', () => {
        // 确保不存在“裸”的 .header 居中规则（那会在宽栏也生效）
        const bareHeaderCenter = /(?:^|\n)\s*\.header\s*\{[^}]*justify-content:\s*center/.test(CSS);
        expect(bareHeaderCenter).toBe(false);
        // 确认 .rw-460 组合选择器确实存在
        expect(CSS).toMatch(/\.rw-460\s+\.header\s*\{/);
    });
});
