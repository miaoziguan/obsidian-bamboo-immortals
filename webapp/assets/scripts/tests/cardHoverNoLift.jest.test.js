/**
 * 回归锁（option 2）：悬停/钉住便签不再「临时置顶」(z-index:5000)，也不再搬工具条到浮层。
 *
 * 背景：曾试过「工具条 portal 到顶层浮层」方案，但它把工具条 DOM 搬出卡片，并让
 * `card.querySelector('.tw-card-level')` 查不到 —— 因为 `.tw-card-level` 是 `.tw-card-tools`
 * 的**兄弟节点**（模板里紧挨在工具条之前，并不在工具条内），一旦用「工具条域内查询」就会
 * 返回 null，直接把写作模式的 H1/正文切换打坏。故回退为最小改动：只删掉 z 提层，
 * 工具条留在卡内、可见性交给 CSS `.tw-card:hover/.is-pinned`。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils.js');

const { CardViewManager } = loadModule('handlers/features/CardViewManager.js', ['CardViewManager'], {
  TypewriterStore: function () {}, SpatialIndex: function () {}, GeoCache: function () {},
  WritingDoc: {}, byId: () => null, num: (x) => x,
});
const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions'], {
  byId: (id) => document.getElementById(id),
  WritingDoc: { setPos: jest.fn(), setText: jest.fn(), setOrder: jest.fn(), orderIds: jest.fn(() => []) },
  CanvasViewport: { getScale: () => 1, getOffset: () => ({ x: 0, y: 0, scale: 1 }) },
  ModePolicy: { manualCardSize: (m) => m === 'notes', linksDefineOrder: () => false },
  fitCardText: jest.fn(), MAX_LEN: 1000,
});

function mkCard(id) {
  const card = document.createElement('div');
  card.className = 'tw-card';
  card.dataset.id = id || 'n1';
  // 真实模板结构：level 钮是工具条「兄弟」，工具条内含各功能钮
  const level = document.createElement('button');
  level.className = 'tw-card-level';
  card.appendChild(level);
  const tools = document.createElement('div');
  tools.className = 'tw-card-tools';
  card.appendChild(tools);
  return { card, tools, level };
}

test('悬停便签不再临时置顶：mouseenter 不写 zIndex=5000', () => {
  const { card } = mkCard();
  const ctrl = { _canvas: document.createElement('div') };
  CardViewManager.bindTools({ state: {}, ctrl }, card);
  expect(card.style.zIndex).toBe('');
  card.dispatchEvent(new Event('mouseenter'));
  expect(card.style.zIndex).toBe(''); // 关键回归：hover 不再把卡片抬到最前
});

test('钉住便签不再升级层级：pinOnly 只加 is-pinned，不写 zIndex', () => {
  const { card } = mkCard('a');
  const canvas = document.createElement('div');
  canvas.appendChild(card);
  CardInteractions.pinOnly({ state: {}, ctrl: { _canvas: canvas } }, card);
  expect(card.classList.contains('is-pinned')).toBe(true);
  expect(card.style.zIndex).toBe(''); // 关键回归：钉住不再 z-index:5000
});

test('切换钉住：旧卡取消 is-pinned，且不残留 z-index 提层', () => {
  const a = mkCard('a').card, b = mkCard('b').card;
  const canvas = document.createElement('div');
  canvas.appendChild(a); canvas.appendChild(b);
  const ctrl = { _canvas: canvas };
  CardInteractions.pinOnly({ state: {}, ctrl }, a);
  CardInteractions.pinOnly({ state: {}, ctrl }, b);
  expect(a.classList.contains('is-pinned')).toBe(false);
  expect(a.style.zIndex).toBe('');
});

test('静态守卫：源码不得再出现 _toolRoot / portal 提层（防写作模式姊妹节点查询回归）', () => {
  const src = ['handlers/features/CardViewManager.js', 'handlers/features/CardInteractions.js']
    .map((p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8')).join('\n');
  expect(src).not.toMatch(/_toolRoot|_portalTools|_unportalTools|_detachToolsToCard/);
  expect(src).not.toMatch(/zIndex\s*=\s*'5000'/);
});
