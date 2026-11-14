/**
 * 写作档徽标回归锁（2026-11-14 用户反馈两轮）。
 *
 * 第一轮：.tw-card-order（顺序数字）原本贴在**本卡**左下角 left:-8px / bottom:-8px，
 * .tw-card-level（层级标签）浮在**本卡**上方左端 bottom:calc(100% + 4px) / left:0。
 * 顺流卡间距只有 WRITE_FLOW_GAP=24px，「上一张卡的数字」与「下一张卡的层级标签」
 * 实测重叠 20×8px —— 层级标签盖住序号。用户明确要求**层级徽章保持原位**。
 *
 * 第二轮：把数字改到「层级徽章右侧同一行」后虽不重叠，但它浮在卡片上方那条窄缝里，
 * 与层级徽章(z61)、hover 工具条(z60)、相邻卡片争层叠空间；.tw-card 带 transform 自成
 * 层叠上下文，卡内 z-index:30 压不过邻卡/工具条，且卡片贴顶时徽章会超出画布上边界
 * （placeTools 的 .tw-tools-below 只保护工具条）。表现为数字徽章「偶尔不出现」。
 *
 * 终局（用户拍板）：数字徽章贴在**卡片右下角** bottom:-8px / right:-8px。
 * 它落在卡片自身区域内，远离上方所有争位元素，层叠与视口位置都不再影响可见性。
 * 真实 Chromium 实测：旧方案徽章中心点命中画布（tw-canvas），新方案命中卡片自身（tw-card）。
 *
 * 这里直接解析 CSS 文本做结构断言（与 levelTint / modeCssContract 同一套路），
 * 不依赖 jsdom 的级联计算（jsdom 不实现布局）。
 */
const fs = require('fs');
const path = require('path');

const NOTES_CSS = fs.readFileSync(
  path.join(__dirname, '../../styles/notes.css'), 'utf8'
);

function ruleOf(selector) {
  // 先剥注释：规则体里的说明文字也可能出现 left:-8px 之类的字样，会污染数值解析
  const css = NOTES_CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (css.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}')) || [])[1] || '';
}
function numOf(rule, prop) {
  const m = new RegExp('(?:^|;)\\s*' + prop + ':\\s*(-?[\\d.]+)(?:px)?\\s*(?:;|$)', 'm').exec(rule);
  return m ? Number(m[1]) : NaN;
}

describe('写作档：层级徽标保持原位，顺序数字贴右下角', () => {
  const level = ruleOf('.tw-canvas.tw-mode-write .tw-card-level');
  const order = ruleOf('.tw-canvas.tw-mode-write .tw-card-order');

  test('层级徽章 left:0 不动（主信息）', () => {
    expect(numOf(level, 'left')).toBe(0);
    expect(level).toMatch(/bottom:\s*calc\(100% \+ 4px\)/);
  });

  test('数字徽章贴右下角，不再浮在卡片上方', () => {
    expect(order).toMatch(/bottom:\s*-8px/);
    expect(order).toMatch(/right:\s*-8px/);
    expect(order).toMatch(/left:\s*auto/);          // 不能同时有 left 数值，否则徽章被拉宽
    expect(order).not.toMatch(/bottom:\s*calc\(100%/);
    expect(order).not.toMatch(/var\(--tw-scale/);  // 不再依赖字级偏移
  });

  test('数字徽章保持免点击与卡内层叠，不干扰右下角握柄', () => {
    expect(order).toMatch(/pointer-events:\s*none/);
    expect(order).toMatch(/z-index:\s*30/);
    expect(numOf(order, 'min-width')).toBe(18);
  });

  test('数字徽章：line-height 与 height 等高，保证数字光学居中', () => {
    // font: 600 11px/1 让行盒(11px)小于字体自然行高（系统字体 13px / 中文楷体 16px），
    // 行盒溢出后 align-items:center 按溢出行盒居中，数字墨迹偏下。
    // 真实 Chromium 实测：/1 偏移 +0.5px，改成与 height 相同的 18px 后为 0px（楷体 -0.1px）。
    const m = /font:\s*600 11px\/(\d+)px/.exec(order);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBe(numOf(order, 'height'));
  });

  test('亮色：基础规则把底色压到 65% 混墨，保证白字过 AA', () => {
    // 亮色实测：100% 色底 + 白字最低对比度 2.94、12 层级里 5 个不过 AA；
    // 65% 色 + 本模式墨色后最低 5.15、全过 AA，色相仍可辨。
    expect(order).toMatch(
      /background:\s*color-mix\(in srgb, var\(--lv-color, #94A3B8\) 65%, var\(--tw-write-ink\)\)/
    );
  });

  test('暗色：徽章底色压到 35% 提可读性，且不用 border 破坏数字居中', () => {
    // 实测（12 个层级）：满饱和实底 + 白字最低对比度仅 1.67、底色亮度 0.302~0.579；
    // 35% 同色 + 暗表面后对比度 6.48~8.5、亮度 0.073~0.112。
    const dark = ruleOf(':host(.dark) .tw-canvas.tw-mode-write .tw-card-order');
    expect(dark).toMatch(/color-mix\(in srgb, var\(--lv-color\) 35%, var\(--surface-solid\)\)/);
    expect(dark).toMatch(/box-shadow:[\s\S]*inset 0 0 0 1px/);
    expect(dark).not.toMatch(/border:\s*1px/);   // border 会吃掉内容高度、破坏 18px 行盒居中
  });
});
