/**
 * @jest-environment jsdom
 */

// 验证打字机便签连线的「实线/虚线」切换逻辑：点击 dash 控件后，
// 对应连线的 .tw-link path 应在 is-dashed 类之间正确切换，且状态随 _links 持久化。
const { loadModule } = require('./__helpers__/testUtils');

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
  Tw._links = [{ from: 'a', to: 'b', route: 'bezier', bend: 0, dash: 'dashed' }];
  Tw._hoverLink = { from: 'a', to: 'b' };
  Tw._hoverTimer = null;
  Tw._ctlHover = false;
  return Tw;
}

function dashButton(Tw) {
  return Tw._linkSvg.querySelector('.tw-link-dash');
}
function pathHasDash(Tw) {
  return Tw._linkSvg.querySelector('.tw-link').classList.contains('is-dashed');
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
