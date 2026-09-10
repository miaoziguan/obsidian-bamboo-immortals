/**
 * @jest-environment jsdom
 */
// 验证「双击进入编辑后，点便签外的任意处（空白画布 / 机身区 / 其它便签 / 纸边）都能退出编辑」。
// 关键根因：画布平移的 pointerdown 调了 e.preventDefault()，会抑制默认失焦，导致 blur 兜底失效；
// 故退出逻辑必须挂在捕获阶段、先于 preventDefault 生效。
const { loadModule } = require('./__helpers__/testUtils');

const StoreMock = {
  KEY_LINKS: 'typewriter:links',
  load: jest.fn().mockResolvedValue({ notes: [], canvasOffset: null, links: [] }),
  save: jest.fn().mockResolvedValue(undefined),
  _sanitizeLinks: (l) => l,
};

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
