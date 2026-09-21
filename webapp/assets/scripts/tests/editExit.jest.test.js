/**
 * @jest-environment jsdom
 */
// 验证「双击进入编辑后，点便签外的任意处（空白画布 / 机身区 / 其它便签 / 纸边）都能退出编辑」。
// 关键根因：画布平移的 pointerdown 调了 e.preventDefault()，会抑制默认失焦，导致 blur 兜底失效；
// 故退出逻辑必须挂在捕获阶段、先于 preventDefault 生效。
const { loadModule } = require('./__helpers__/testUtils');
// 【P8 抽取债】_exitEdit 改走 WritingDoc 原语同步模型；孤立加载本模块时 import 被剥离，
// 需注入全局供其解析（否则抛 ReferenceError: WritingDoc is not defined）。
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
// GeoCache 被 loadModule 剥离了 import，feature 体内 new GeoCache() 需从全局解析（与 SpatialIndex 同处理）
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.GeoCache = GeoCache;
// B1 抽取债：feature 把视口/几何逻辑委托给 ViewportCuller（loadModule 剥离了 import）；
// 其方法体内 new SpatialIndex() 同样走全局解析，故此处一并注入 SpatialIndex 与 ViewportCuller。
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
global.SpatialIndex = SpatialIndex;
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);
global.ViewportCuller = ViewportCuller;

const StoreMock = {
  KEY_LINKS: 'typewriter:links',
  load: jest.fn().mockResolvedValue({ notes: [], canvasOffset: null, links: [] }),
  save: jest.fn().mockResolvedValue(undefined),
  _sanitizeLinks: (l) => l,
};
// B1 抽取债（综合）：feature 把 4 个子系统委托给 CardViewManager/CardInteractions/
// ModeController/PersistenceCoordinator；这些子系统方法体内引用的共享常量（twConfig 加载时挂
// globalThis）与服务在 loadModule 剥离 import 后需从全局解析。
// 注意：feature 以 { TypewriterStore: StoreMock } 注入 mock，子模块经全局解析，故此处同步挂全局。
global.TypewriterStore = StoreMock;
loadModule('handlers/features/twConfig.js', []); // 副作用：把全部共享常量挂到 globalThis
const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/CardViewManager.js', 'CardViewManager');
_b1mod('handlers/features/CardInteractions.js', 'CardInteractions');
_b1mod('handlers/features/ModeController.js', 'ModeController');
_b1mod('handlers/features/PersistenceCoordinator.js', 'PersistenceCoordinator');
_b1mod('services/TypewriterStore.js', 'TypewriterStore');
_b1mod('services/SpatialIndex.js', 'SpatialIndex');
_b1mod('services/GeoCache.js', 'GeoCache');
_b1mod('services/undoStack.js', 'UndoStack');
_b1mod('handlers/features/writingDoc.js', 'WritingDoc');
_b1mod('handlers/features/mindmapFeature.js', 'MindmapFeature');
_b1mod('services/LinkLayer.js', 'LinkLayer');
_b1mod('services/ViewportCuller.js', 'ViewportCuller');
_b1mod('utils/domRef.js', 'isFromTextEntry');

function makeCard(id) {
  const c = document.createElement('div');
  c.className = 'tw-card';
  c.dataset.id = id;
  const text = document.createElement('div');
  text.className = 'tw-card-text';
  c.appendChild(text);
  ['offsetLeft', 'offsetTop', 'offsetWidth', 'offsetHeight'].forEach((p, i) =>
    Object.defineProperty(c, p, { value: [0, 0, 200, 120][i], configurable: true }));
  c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 120 });
  return c;
}

function setup() {
  const Tw = loadModule(
    'handlers/features/typewriterFeature.js',
    ['TypewriterFeature'],
    { TypewriterStore: StoreMock }
  ).TypewriterFeature;
  const el = document.createElement('div');
  const canvas = document.createElement('div');
  canvas.className = 'tw-canvas';
  const beeper = document.createElement('div');
  beeper.className = 'tw-beeper';
  el.appendChild(canvas);
  el.appendChild(beeper);
  document.body.appendChild(el);
  const card = makeCard('a');
  canvas.appendChild(card);
  Tw._el = el;
  Tw._canvas = canvas;
  Tw._zTop = 0;
  Tw._notes = [];   // _exitEdit 会用 WritingDoc.setText 同步模型，规范模型须先就位
  Tw._scheduleSave = jest.fn();
  Tw._finishTyping = jest.fn();
  Tw._makeCanvasDraggable(); // 注册根级指针监听（含本次修复的捕获退出逻辑）
  return { Tw, card, canvas, beeper };
}

test('进入编辑后，点画布空白(非卡片)退出', () => {
  const { Tw, card, canvas } = setup();
  Tw._enterEdit(card);
  expect(card.classList.contains('editing')).toBe(true);
  const blank = document.createElement('div');
  canvas.appendChild(blank);
  blank.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  expect(card.classList.contains('editing')).toBe(false);
});

test('进入编辑后，点机身区(beeper，画布外)也能退出', () => {
  const { Tw, card, beeper } = setup();
  Tw._enterEdit(card);
  expect(card.classList.contains('editing')).toBe(true);
  beeper.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  expect(card.classList.contains('editing')).toBe(false);
});

test('进入编辑后，点另一张便签退出当前编辑', () => {
  const { Tw, card, canvas } = setup();
  const other = makeCard('b');
  canvas.appendChild(other);
  Tw._enterEdit(card);
  other.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  expect(card.classList.contains('editing')).toBe(false);
});

test('编辑态下点文本内不退出', () => {
  const { Tw, card } = setup();
  Tw._enterEdit(card);
  const text = card.querySelector('.tw-card-text');
  text.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  expect(card.classList.contains('editing')).toBe(true);
});

test('未进入编辑时，点空白不抛错', () => {
  const { Tw, canvas } = setup();
  const blank = document.createElement('div');
  canvas.appendChild(blank);
  expect(() => blank.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))).not.toThrow();
});

// 「点空白取消选中」必须与「点空白退出编辑」一样挂在功能根(root)，不能挂 .tw-canvas：
// .tw-canvas 只是 wrap 里 flex:1 的一小块且 overflow:visible，机身区等大片空白的命中目标是 wrap，
// 挂在 canvas 上时点那些区域收不到事件 → 框选后无论怎么点空白都取消不掉选中态。
describe('点空白取消选中（含 canvas 之外的空白区域）', () => {
  function select(Tw, list) {
    Tw._selected = new Set(list);
    list.forEach((c) => c.classList.add('selected'));
  }

  test('点画布空白处 → 取消选中', () => {
    const { Tw, card, canvas } = setup();
    select(Tw, [card]);
    const blank = document.createElement('div');
    canvas.appendChild(blank);
    blank.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(Tw._selected.size).toBe(0);
    expect(card.classList.contains('selected')).toBe(false);
  });

  test('回归：点 canvas 之外的空白（机身区/wrap 背景）也能取消选中', () => {
    const { Tw, card, beeper } = setup();
    select(Tw, [card]);
    beeper.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(Tw._selected.size).toBe(0);              // 旧实现挂 canvas，此断言会失败（正是本 bug）
    expect(card.classList.contains('selected')).toBe(false);
  });

  test('点功能根自身（最外层空白）也能取消选中', () => {
    const { Tw, card, canvas } = setup();
    select(Tw, [card]);
    Tw._el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(Tw._selected.size).toBe(0);
    expect(card.classList.contains('selected')).toBe(false);
  });

  test('点便签本身不清空（交给便签自己的选中逻辑）', () => {
    const { Tw, card } = setup();
    select(Tw, [card]);
    card.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(Tw._selected.size).toBe(1);
    expect(card.classList.contains('selected')).toBe(true);
  });

  test('点按钮/输入框等控件不清空（维持既有行为）', () => {
    const { Tw, card, beeper } = setup();
    select(Tw, [card]);
    const btn = document.createElement('button');
    beeper.appendChild(btn);
    btn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(Tw._selected.size).toBe(1);
    expect(card.classList.contains('selected')).toBe(true);
  });
});
