/**
 * @jest-environment jsdom
 */
// 思维子弹：子弹宽度必须由内容决定，不能退化为 min-content（逐字竖排）。
// 背景（移动端实机回归）：.tw-mm-node 是绝对定位且原先没有 width，宽度走 shrink-to-fit
// = min(max-content, max(min-content, 可用宽度))，而「可用宽度」= 包含块宽(.tw-mm-nodes) − left。
// left 是**画布坐标**（屏幕位置由 .tw-mm-canvas 的 transform 平移），移动端画布仅 ~390px，
// 把子弹拖到右缘 / 平移视口后再拖，left 很容易超过画布宽 → 可用宽度 ≤ 0 → 宽度塌到
// min-content（一个汉字宽）→ 文本逐字换行，看起来就是「子弹突然变成竖排」。
// 修法是 width: max-content（只由内容决定，与 left 无关）；fit-content 无效（公式同样含可用宽度）。
const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(__dirname, '..', '..', 'styles', 'mindmap.css');

/** 取某个选择器的第一条规则块（去掉注释，避免注释里的示例文字影响断言） */
function ruleOf(css, selector) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const i = clean.indexOf(selector + ' {');
  if (i < 0) return '';
  const j = clean.indexOf('}', i);
  return clean.slice(i, j + 1);
}

describe('思维子弹：节点宽度不随 left 塌陷（移动端竖排回归）', () => {
  const css = fs.readFileSync(CSS_PATH, 'utf8');

  test('.tw-mm-node 显式声明 width: max-content（不依赖包含块可用宽度）', () => {
    const rule = ruleOf(css, '.tw-mm-node');
    expect(rule).not.toBe('');
    expect(rule).toMatch(/width:\s*max-content/);
  });

  test('不使用 fit-content / stretch 之类的「含可用宽度」关键字（同样会塌成竖排）', () => {
    const rule = ruleOf(css, '.tw-mm-node');
    expect(rule).not.toMatch(/width:\s*fit-content/);
    expect(rule).not.toMatch(/width:\s*stretch/);
    expect(rule).not.toMatch(/width:\s*auto/);
  });

  test('.tw-mm 用 overflow: clip 裁切（hidden 会变成可滚动容器，focus 时整块画布被滚偏）', () => {
    const rule = ruleOf(css, '.tw-mm');
    expect(rule).toMatch(/overflow:\s*clip/);
  });
});
