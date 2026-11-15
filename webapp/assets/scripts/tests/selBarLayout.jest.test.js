/**
 * 多选浮动操作条「按钮变竖排」回归锁（2026-11-15 用户反馈）。
 *
 * 根因：.tw-sel-bar 是绝对定位 + left(选区中心) + translateX(-50%)，shrink-to-fit 宽度
 * 被「包含块右边界 − left」钳住；选区越靠右可用宽度越小，按钮 min-width:0 又允许收缩 →
 * 被压到 1 字宽，中文「合并 3 张」逐字折成 4 行竖排。
 *
 * 真实 Chromium 实测（left:500px / 画布 600px）：
 *   修复前 bar 101px、按钮 32×60、4 行文字；
 *   修复后 bar 398px（含 5 个按钮）、按钮 71×26、全部单行；
 *   left=0/100/300/500/900 与 400px 窄画布下结果一致。
 *
 * 这里解析 CSS 文本做结构断言（jsdom 不实现 shrink-to-fit 布局，测不了实际折行）。
 */
const fs = require('fs');
const path = require('path');

const NOTES_CSS = fs.readFileSync(
  path.join(__dirname, '../../styles/notes.css'), 'utf8'
);

function ruleOf(selector) {
  const css = NOTES_CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (css.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}')) || [])[1] || '';
}

describe('多选浮动操作条：标签保持单行', () => {
  const bar = ruleOf('.tw-sel-bar');
  const btn = ruleOf('.tw-sel-bar button');

  test('条按内容定宽，不受 left 钳制', () => {
    expect(bar).toMatch(/width:\s*max-content/);
    expect(bar).toMatch(/transform:\s*translateX\(-50%\)/);   // 仍是居中锚的定位方式
  });

  test('按钮禁止折行与被 flex 压缩', () => {
    expect(btn).toMatch(/white-space:\s*nowrap/);
    expect(btn).toMatch(/flex:\s*none/);
    expect(btn).toMatch(/min-width:\s*0/);                    // 仍需压过全局触控地板
  });
});
