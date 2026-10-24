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

/**
 * 多列（看板）下页眉必须按「容器宽」对齐。
 *
 * 背景：rw 系列与 compact 类是按「列宽」算的（列内卡片需要），看板 N 列时列宽很小（如 1200/6≈200px），
 * 于是整个 .container 被套上 .rw-460 —— 页眉这种**整宽元素**也被 `.rw-460 .header-left/-right
 * { justify-content: center }` 各自居到半区中部，表现为「天气既没左对齐、语录也没右对齐」；
 * 天气还会因 flex-shrink + max-width:100% 被裁成省略号（显示不全）。
 * 修复：DisplayManager 在多列时给容器加 .has-multicol，页眉据此恢复两端对齐、天气按自然宽度显示。
 */
describe('多列（看板）下页眉按容器宽对齐（.has-multicol 覆盖窄栏居中）', () => {
    test('.has-multicol 下 .header 恢复两端对齐', () => {
        const r = ruleOf(CSS, '.container.has-multicol .header');
        expect(r).not.toBeNull();
        expect(r).toMatch(/justify-content:\s*space-between/);
    });

    test('天气贴左、语录贴右', () => {
        expect(ruleOf(CSS, '.container.has-multicol .header-left')).toMatch(/justify-content:\s*flex-start/);
        expect(ruleOf(CSS, '.container.has-multicol .header-right')).toMatch(/justify-content:\s*flex-end/);
    });

    test('天气按自然宽度显示，展开内容不再被压成 60% 而截断', () => {
        expect(ruleOf(CSS, '.container.has-multicol .weather-widget')).toMatch(/flex-shrink:\s*0/);
        expect(ruleOf(CSS, '.container.has-multicol .weather-widget.weather-open .weather-expand'))
            .toMatch(/max-width:\s*520px/);
    });
});
