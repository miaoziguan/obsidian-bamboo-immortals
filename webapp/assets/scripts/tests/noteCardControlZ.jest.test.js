/**
 * @jest-environment jsdom
 */
// 便签：挂到卡片上的贴纸不能压住卡片的交互控件（旋转 / 连线 / 缩放）。
//
// 实机问题：贴纸恰好盖住旋转握柄时，便签几乎无法旋转。
// 根因链：materialMarket._attachSticker 是 card.appendChild(rec.el) —— 贴纸被插到卡片**末尾**，
// 而 .tw-card-rotate / .tw-card-link 也是卡片内的绝对定位兄弟节点；同为 z-index:auto 时
// 按 DOM 顺序后插入者在上。贴纸的 filter:drop-shadow 还会创建独立堆叠上下文，
// 让它作为一整块参与卡片内排序 → 握柄收不到 pointerdown（事件绑在握柄自身）。
// 缩放手柄 .tw-card-resize 早就有 z-index:40，所以只有旋转/连线被压住 —— 属漏配。
const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(__dirname, '..', '..', 'styles', 'notes.css');
const MARKET_PATH = path.join(__dirname, '..', 'handlers', 'features', 'materialMarket.js');

/** 取某个选择器的**顶格定义**规则块（去掉注释；必须顶格，否则
 *  `.tw-card:focus-within .tw-card-rotate {` 这类后代选择器会被误当成主定义命中）。 */
function ruleOf(css, selector) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('(?:^|\\n)[ \\t]*' + esc + '\\s*\\{', 'm').exec(clean);
  if (!m) return '';
  const j = clean.indexOf('}', m.index);
  return clean.slice(m.index, j + 1);
}

describe('便签：挂靠贴纸不遮挡卡片交互控件', () => {
  const css = fs.readFileSync(CSS_PATH, 'utf8');

  test('根因锁：挂靠确实把贴纸 append 到卡片末尾（DOM 顺序晚于握柄）', () => {
    const src = fs.readFileSync(MARKET_PATH, 'utf8');
    expect(src).toMatch(/card\.appendChild\(rec\.el\)/);
  });

  test('.tw-card 定义控件层级变量，且值高于贴纸内部手柄(2)与贴纸自身(auto≈0)', () => {
    const rule = ruleOf(css, '.tw-card');
    const m = rule.match(/--bm-card-control-z:\s*(\d+)/);
    expect(m).toBeTruthy();
    expect(Number(m[1])).toBeGreaterThan(2);   // 拖动期 filter:none 时贴纸手柄会跨层比较
  });

  test('旋转 / 连线 / 缩放握柄统一引用该变量（不能再漏配某一个）', () => {
    for (const sel of ['.tw-card-rotate', '.tw-card-link', '.tw-card-resize']) {
      const rule = ruleOf(css, sel);
      expect(rule).not.toBe('');
      expect(rule).toMatch(/z-index:\s*var\(--bm-card-control-z\)/);
    }
  });

  test('贴纸自身不设 z-index：保持 auto 才能被控件变量整体压住', () => {
    const rule = ruleOf(css, '.bm-sticker');
    expect(rule).not.toBe('');
    expect(rule).not.toMatch(/z-index\s*:/);
  });

  test('工具条层级(60)未被误改，仍高于控件层', () => {
    const rule = ruleOf(css, '.tw-card-tools');
    expect(rule).toMatch(/z-index:\s*60/);
  });
});
