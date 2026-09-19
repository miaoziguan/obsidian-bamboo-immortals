/**
 * @jest-environment jsdom
 */

// 验证打字机便签连线的「实线/虚线」切换逻辑：点击 dash 控件后，
// 对应连线的 .tw-link path 应在 is-dashed 类之间正确切换，且状态随 _links 持久化。
const { loadModule } = require('./__helpers__/testUtils');
const { LinkLayer } = loadModule('services/LinkLayer.js', ['LinkLayer']);
// B1 抽取债：feature 把视口/几何逻辑委托给 ViewportCuller（loadModule 剥离了 import）；
// 其方法体内 new GeoCache()/new SpatialIndex() 与 ViewportCuller 本身都需从全局解析。
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.GeoCache = GeoCache;
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
global.SpatialIndex = SpatialIndex;
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);
global.ViewportCuller = ViewportCuller;

// jsdom 不实现 SVG 几何方法，桩掉
beforeAll(() => {
  SVGElement.prototype.getTotalLength = function () { return 100; };
  SVGElement.prototype.getPointAtLength = function (len) { return { x: len, y: 0 }; };
});

const TypewriterStoreMock = {
  KEY_LINKS: 'typewriter:links',
  load: jest.fn().mockResolvedValue({ notes: [], canvasOffset: null, links: [] }),
  save: jest.fn().mockResolvedValue(undefined),
  _sanitizeLinks: (l) => l,
};
// B1 抽取债（综合）：feature 把 4 个子系统委托给 CardViewManager/CardInteractions/
// ModeController/PersistenceCoordinator；这些子系统方法体内引用的共享常量（twConfig 加载时挂
// globalThis）与服务在 loadModule 剥离 import 后需从全局解析。
// 注意：feature 以 { TypewriterStore: TypewriterStoreMock } 注入 mock，子模块经全局解析，故此处同步挂全局。
global.TypewriterStore = TypewriterStoreMock;
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

function makeCard(id, x, y) {
  const c = document.createElement('div');
  c.className = 'tw-card';
  c.dataset.id = id;
  c.dataset.rot = '0';
  ['offsetLeft', 'offsetTop', 'offsetWidth', 'offsetHeight'].forEach((p, i) => {
    Object.defineProperty(c, p, { value: [x, y, 200, 120][i], configurable: true });
  });
  c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 });
  return c;
}

function setup() {
  const Tw = loadModule(
    'handlers/features/typewriterFeature.js',
    ['TypewriterFeature'],
    { TypewriterStore: TypewriterStoreMock }
  ).TypewriterFeature;
  const canvas = document.createElement('div');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 });
  canvas.appendChild(makeCard('a', 100, 100));
  canvas.appendChild(makeCard('b', 400, 100));
  Tw._canvas = canvas;
  // 【P8 抽取债】连线渲染已抽到 LinkLayer；孤立加载本模块时构造函数不跑，必须手动接线。
  // 刻意不注入 getGeom：卡片在 DOM 里，让 LinkLayer 走 DOM 回退取端点。
  Tw._linkLayer = new LinkLayer({
    container: canvas,
    nodeSelector: '.tw-card',
    getLinks: () => Tw._links,
    setLinks: (v) => { Tw._links.length = 0; Tw._links.push(...v); },
    addLink: () => true,
    removeLink: () => {},
    removeLinksOf: () => {},
    onChange: () => {},
  });
  Tw._links = [{ from: 'a', to: 'b', route: 'bezier', bend: 0, dash: 'dashed' }];
  Tw._hoverLink = { from: 'a', to: 'b' };
  Tw._hoverTimer = null;
  Tw._ctlHover = false;
  return Tw;
}

// 连线 svg 现在由 LinkLayer 持有（P8 抽取），不再挂在 feature._linkSvg
function dashButton(Tw) {
  // hover 控件建在独立的 _ctlSvg 上（与线身 _svg 分开），不能到 _svg 里找
  return Tw._linkLayer._ctlSvg.querySelector('.tw-link-dash');
}
function pathHasDash(Tw) {
  return Tw._linkLayer._svg.querySelector('.tw-link').classList.contains('is-dashed');
}

test('点击 dash 控件将虚线切回实线', () => {
  const Tw = setup();
  Tw._renderLinks();
  Tw._renderLinkControls('a', 'b');
  expect(pathHasDash(Tw)).toBe(true);          // 初始虚线
  const btn = dashButton(Tw);
  expect(btn).not.toBeNull();
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(Tw._links[0].dash).toBe('solid');     // 状态已切换
  expect(pathHasDash(Tw)).toBe(false);         // 线身变实线
});

test('再点一次从实线切回虚线', () => {
  const Tw = setup();
  Tw._links[0].dash = 'solid';
  Tw._renderLinks();
  Tw._renderLinkControls('a', 'b');
  expect(pathHasDash(Tw)).toBe(false);
  const btn = dashButton(Tw);
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(Tw._links[0].dash).toBe('dashed');
  expect(pathHasDash(Tw)).toBe(true);
});
