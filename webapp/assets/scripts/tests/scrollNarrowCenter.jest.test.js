/**
 * @jest-environment jsdom
 */
// 画中卷窄栏排版回归锁。
//
// 根因：.tw-screen-top 是 flex `space-between` + `nowrap` —— 窄栏（.scroll-body ≤340px，
// 由 scrollManager 的 ResizeObserver 加 .is-narrow）下，标题与 FONT/纸张信息被推向两端，
// 放不下时直接溢出屏幕，既不居中也不好看。
// 修复：窄栏下改居中 + 允许两块之间折行（单块内仍保持 nowrap，避免「凝墨成笺FONT:」粘连）。
const { readFileSync } = require('fs');
const { join } = require('path');

const CSS = readFileSync(
  join(__dirname, '..', '..', '..', 'assets', 'styles', 'scroll-pager.css'),
  'utf8'
);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function ruleOf(css, selector) {
  // 必须锚定「选择器出现在行首」，否则会先命中 `.theme-dark .tw-screen-top`
  // 这类组合选择器（本文件里暗色规则排在前面），拿到错误的规则体。
  const m = new RegExp('(?:^|\\n)\\s*' + escapeRe(selector) + '\\s*\\{([^}]*)\\}').exec(css);
  return m ? m[1] : null;
}

describe('画中卷窄栏：顶栏居中排版', () => {
  test('宽栏下 .tw-screen-top 仍是两端对齐（不破坏宽栏排版）', () => {
    const body = ruleOf(CSS, '.tw-screen-top');
    expect(body).not.toBeNull();
    expect(body).toMatch(/justify-content:\s*space-between/);
  });

  test('窄栏下 .tw-screen-top 必须居中且允许两块之间折行', () => {
    const body = ruleOf(CSS, '.scroll-body.is-narrow .tw-screen-top');
    expect(body).not.toBeNull();
    expect(body).toMatch(/justify-content:\s*center/);
    expect(body).toMatch(/flex-wrap:\s*wrap/);
  });

  test('窄栏规则须挂在 .scroll-body.is-narrow 下（与 base.css 既有窄栏约定一致）', () => {
    expect(CSS).toMatch(/\.scroll-body\.is-narrow\s+\.tw-screen-top/);
  });

  test('单块内仍保持 nowrap（避免标题与 FONT 信息粘连）', () => {
    expect(CSS).toMatch(
      /\.tw-screen-top\s*>\s*span,\s*\.tw-screen-font\s*\{\s*white-space:\s*nowrap/
    );
  });
});
