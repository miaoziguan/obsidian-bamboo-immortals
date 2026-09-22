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

test('端到端：点击工具条色盘 → 目标节点 --mm-accent 落地（复现用户路径）', () => {
  const layer = document.createElement('div');
  const nodeBox = document.createElement('div');
  nodeBox.className = 'tw-mm-nodes';
  layer.appendChild(nodeBox);

  const MMP = MindmapFeature;
  MMP._el = layer;
  MMP._nodeBox = nodeBox;
  MMP._els = new Map();
  MMP._linkLayer = { makeLinkable() {} };
  MMP._nodes = [{ id: 'n1', text: 'hi', x: 0, y: 0, color: '' }];
  MMP._undoStack = null;
  MMP._scheduleSave = () => {};
  MMP._msg = () => {};
  MMP._selId = 'n1';
  MMP._selSet = null;
  MMP._editId = null;

  MMP._initToolbar(layer);
  MMP._mountNode(MMP._nodes[0]);
  const el = MMP._els.get('n1');
  expect(el).toBeTruthy();

  const sw = layer.querySelector('.tw-mm-swatch[data-color="#5b9bff"]');
  expect(sw).toBeTruthy();
  sw.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(el.style.getPropertyValue('--mm-accent')).toBe('#5b9bff');
  expect(MMP._nodes[0].color).toBe('#5b9bff');
});

test('回归：mindmapFeature 内不得出现裸 _mutate( 调用（必须 this._mutate）', () => {
  // 根因：_mutate 只是对象方法（MindmapFeature._mutate），模块作用域并无同名绑定；
  // 写成裸 _mutate(...) 会在运行时抛 ReferenceError（改色/删除/复制/布局/新建全部静默失效）。
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'handlers', 'features', 'mindmapFeature.js'), 'utf8'
  );
  const bad = src.split('\n').filter((l) =>
    /_mutate\s*\(/.test(l) && !/_mutate\s*\(fn\)/.test(l) && !/this\._mutate\s*\(/.test(l)
  );
  expect(bad).toEqual([]);
});
