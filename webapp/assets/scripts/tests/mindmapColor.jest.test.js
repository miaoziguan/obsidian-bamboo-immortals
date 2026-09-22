/**
 * @jest-environment jsdom
 */
// 思维子弹：子弹着色（悬浮工具条色盘）。
// 根因：JS 一直正确地把 --mm-accent 写到节点元素上，但方角(style-1)的 border 写死
// var(--border-strong)，特异性盖过基础规则里的 var(--mm-accent) → 默认样式下改色对边框无效，
// 只剩 14% 淡底（几乎看不出）=「没反应」。故用 CSS 文本断言守住「样式专属规则必须消费 --mm-accent」，
// 并用 JS 断言锁住数据路径（--mm-accent 落到元素与 _nodes 数据）。
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const STORE = { loadMindmapGroupDoc: jest.fn(), saveMindmapGroupDoc: jest.fn(), ensureMindmapIndex: jest.fn(), createMindmapGroup: jest.fn() };
global.TypewriterStore = STORE;

const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/mindmapDoc.js', 'MindmapDoc');
const { MindmapFeature } = loadModule(
  'handlers/features/mindmapFeature.js',
  ['MindmapFeature'],
  { TypewriterStore: STORE }
);

function ruleBlock(css, selector) {
  const i = css.indexOf(selector);
  if (i < 0) return null;
  const end = css.indexOf('}', i);
  return css.slice(i, end + 1);
}
const css = fs.readFileSync(path.join(__dirname, '..', '..', 'styles', 'mindmap.css'), 'utf8');

test('方角(style-1) 边框必须消费 --mm-accent（否则改色对边框无可视反应）', () => {
  const b = ruleBlock(css, '.tw-mm.tw-mm-style-1 .tw-mm-node');
  expect(b).not.toBeNull();
  expect(/border:\s*[^;}]*var\(--mm-accent/.test(b)).toBe(true);   // 回归：曾被写死 var(--border-strong)
  expect(b).not.toMatch(/var\(--border-strong\)\)\s*;?\s*$/);       // 同一条 border 不应只剩 border-strong
});

test('胶囊点(style-3) 左侧强调点必须消费 --mm-accent', () => {
  const b = ruleBlock(css, '.tw-mm.tw-mm-style-3 .tw-mm-node::before');
  expect(b).not.toBeNull();
  expect(/background:\s*[^;}]*var\(--mm-accent/.test(b)).toBe(true);
});

test('改色把 --mm-accent 写到节点元素且落到数据；恢复默认则清空（数据路径无误）', () => {
  MindmapFeature._active = true;
  MindmapFeature._nodes = [{ id: 'n1', text: 'a', x: 0, y: 0, color: '' }];
  const el = document.createElement('div');
  el.className = 'tw-mm-node';
  MindmapFeature._els = new Map([['n1', el]]);

  MindmapFeature._setNodeColor('n1', '#e6b450');
  expect(el.style.getPropertyValue('--mm-accent')).toBe('#e6b450');
  expect(MindmapFeature._nodes[0].color).toBe('#e6b450');

  MindmapFeature._setNodeColor('n1', '');            // 恢复默认色
  expect(el.style.getPropertyValue('--mm-accent')).toBe('');
  expect(MindmapFeature._nodes[0].color).toBe('');
});
