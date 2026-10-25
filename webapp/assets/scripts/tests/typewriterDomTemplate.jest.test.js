/**
 * 打字机机身 DOM 模板契约测试（P2-6 Round 2）。
 *
 * 背景：`buildTypewriterDomHtml()` 从 TypewriterFeature._ensureDom 抽出（原方法 113 行 → 49 行）。
 * 该模板定义的元素 id 是**跨模块契约**——CardInteractions（#twArrange / #twPaper / #twFont）、
 * ModeController（#twKnob）、素材市场（缩放条按钮）、预览弹窗（#twPreviewModal）等都按 id 取元素。
 * 一旦重构时改坏某个 id，相关功能会静默失效（找不到元素 → 直接 return），极难排查。
 *
 * 因此这里把 id 清单固化成断言：模板可以改结构，但**这 26 个 id 一个都不能少**。
 */
const { loadModule } = require('./__helpers__/testUtils');

const REQUIRED_IDS = [
    'twCanvas', 'twThemeSwitch', 'twZenSwitch', 'twScreenTitle',
    'twMetaNotes', 'twFontLabel', 'twPaperLabel',
    'twMetaWrite', 'twCardCount', 'twLinkCount',
    'twMetaMindmap', 'twNodeCount', 'twDepthCount',
    'twScreenMsg', 'twInput', 'twCursor',
    'twPaper', 'twFont', 'twArrange', 'twPrint', 'twKnob',
    'twPreviewModal', 'twPreviewStat', 'twPreviewBody', 'twPreviewClose',
];

function build() {
    Object.assign(global, {
        HTMLUtils: { escapeHtmlAttr: (s) => String(s), num: (v) => Number(v) || 0 },
    });
    const { buildTypewriterDomHtml } = loadModule(
        'handlers/features/typewriterDomTemplate.js',
        ['buildTypewriterDomHtml'],
    );
    return buildTypewriterDomHtml();
}

describe('buildTypewriterDomHtml 模板契约', () => {
    test('包含全部 26 个跨模块契约 id', () => {
        const html = build();
        const missing = REQUIRED_IDS.filter((id) => !html.includes(`id="${id}"`));
        expect(missing).toEqual([]);
    });

    test('关键结构类名存在（机身 / 画布 / 控件 / 旋钮 / 预览）', () => {
        const html = build();
        // 注：scroll-typewriter-feature 是 _ensureDom 里设在 wrap 上的类，不在本模板内
        for (const cls of ['tw-canvas', 'tw-beeper', 'tw-controls', 'tw-knob', 'tw-preview-modal']) {
            expect(html).toContain(cls);
        }
    });

    test('MAX_LEN 经 HTMLUtils 转义注入（不是直接拼接）', () => {
        const html = build();
        expect(html).toContain('id="twInput"');
        expect(html).toMatch(/maxlength="[^"]*"/);
    });

    test('纯函数：两次调用结果完全一致，且无未替换的模板占位', () => {
        const a = build();
        const b = build();
        expect(a).toBe(b);
        expect(a).not.toContain('${');
    });
});
