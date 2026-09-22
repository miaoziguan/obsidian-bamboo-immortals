/**
 * @jest-environment jsdom
 */
// 导图模式按钮焦点回归锁：v3.22.1
// 与机身键同款缺陷：色块/图标/搜索按钮鼠标点击后不交还焦点 → 按空格会再次激活它
// （重着色、重复制/重删选中、重翻页/重关搜索），且焦点框一直挂着 = 「激活态取消不掉」。
// 这里统一要求鼠标点击（detail>0）后 blur，键盘激活（detail=0）保留焦点。
const { loadModule } = require('./__helpers__/testUtils');

const STORE = {
  loadMindmapGroupDoc: jest.fn(), saveMindmapGroupDoc: jest.fn(),
  ensureMindmapIndex: jest.fn(), createMindmapGroup: jest.fn()
};
global.TypewriterStore = STORE;

const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/mindmapDoc.js', 'MindmapDoc');
const { MindmapFeature } = loadModule(
  'handlers/features/mindmapFeature.js', ['MindmapFeature'], { TypewriterStore: STORE }
);

function click(btn, detail) {
  btn.focus();
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));
}

test('导图色盘：鼠标点击色块后交还焦点（否则空格重着色 + 焦点框挂住）', () => {
  const layer = document.createElement('div');
  document.body.appendChild(layer);
  let hits = 0;
  MindmapFeature._setColorForSelection = () => { hits++; };
  MindmapFeature._initToolbar(layer);

  const sw = layer.querySelector('.tw-mm-swatch');
  expect(sw).toBeTruthy();

  click(sw, 1);
  expect(hits).toBe(1);
  expect(document.activeElement).not.toBe(sw);   // 鼠标点击交还焦点

  click(sw, 0);
  expect(hits).toBe(2);
  expect(document.activeElement).toBe(sw);       // 键盘激活保留焦点
});

test('导图工具条 dup/del 图标：鼠标点击后交还焦点（否则空格重复制/重删选中）', () => {
  const layer = document.createElement('div');
  document.body.appendChild(layer);
  let dups = 0, dels = 0;
  MindmapFeature._duplicateSel = () => { dups++; };
  MindmapFeature._deleteSel = () => { dels++; };
  MindmapFeature._initToolbar(layer);

  const dup = layer.querySelector('button[data-act="dup"]');
  const del = layer.querySelector('button[data-act="del"]');
  expect(dup && del).toBeTruthy();

  click(dup, 1);
  expect(dups).toBe(1);
  expect(document.activeElement).not.toBe(dup);

  click(del, 1);
  expect(dels).toBe(1);
  expect(document.activeElement).not.toBe(del);
});

test('导图搜索栏：鼠标点击翻页/关闭按钮后交还焦点（否则空格重翻/重关）', () => {
  const layer = document.createElement('div');
  document.body.appendChild(layer);
  let steps = 0, closed = 0;
  MindmapFeature._searchStep = () => { steps++; };
  MindmapFeature._closeSearch = () => { closed++; };
  MindmapFeature._initSearch(layer);

  const prev = layer.querySelector('.tw-mm-search-prev');
  const next = layer.querySelector('.tw-mm-search-next');
  const close = layer.querySelector('.tw-mm-search-close');
  expect(prev && next && close).toBeTruthy();

  click(prev, 1);
  expect(steps).toBe(1);
  expect(document.activeElement).not.toBe(prev);

  click(next, 1);
  expect(steps).toBe(2);
  expect(document.activeElement).not.toBe(next);

  click(close, 1);
  expect(closed).toBe(1);
  expect(document.activeElement).not.toBe(close);
});

test('回归：导图工具条与搜索栏点击必须交还焦点', () => {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'handlers', 'features', 'mindmapFeature.js'), 'utf8'
  );
  expect(src).toContain('swatch.blur()');   // 色块
  expect(src).toContain('b.blur()');        // dup/del 图标
  expect(src).toContain('e.currentTarget.blur()'); // 搜索翻页/关闭
});
