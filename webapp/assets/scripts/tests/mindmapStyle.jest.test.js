/**
 * @jest-environment jsdom
 */
// 思维子弹：子弹样式「经典」已下架 —— 循环切换不再落在它上面，且老文档（样式索引已落盘）
// 停在经典时要自动迁到首档。
// 【关键约束】样式索引随导图文档落盘，故「索引 ↔ 视觉」映射必须冻结：绝不能把 1..5 重编号成 0..4，
// 否则老文档的子弹样式会整体错位变样。本组测试同时守住「不下架错位」与「经典不再出现」两端。
const { loadModule } = require('./__helpers__/testUtils');

const STORE = {
  loadMindmapGroupDoc: jest.fn().mockResolvedValue({ nodes: [], links: [], style: 0 }),
  saveMindmapGroupDoc: jest.fn().mockResolvedValue(undefined),
  ensureMindmapIndex: jest.fn().mockResolvedValue({ current: 'default', groups: {} }),
  createMindmapGroup: jest.fn().mockResolvedValue({ id: 'g1' }),
};
global.TypewriterStore = STORE;

const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/mindmapDoc.js', 'MindmapDoc');
const { MindmapFeature } = loadModule(
  'handlers/features/mindmapFeature.js',
  ['MindmapFeature'],
  { TypewriterStore: STORE }
);

function setup(startStyle) {
  const el = document.createElement('div');
  el.className = 'tw-mm';
  document.body.appendChild(el);
  MindmapFeature._el = el;
  MindmapFeature._active = true;
  MindmapFeature._groupId = 'default';
  MindmapFeature._scheduleSave = jest.fn();
  MindmapFeature._style = startStyle;
  return { MM: MindmapFeature, el };
}

test('循环切换永不落在已下架的档位（0 经典 / 4 草图 / 5 玻璃）', () => {
  const { MM } = setup(1);
  const seen = [];
  for (let i = 0; i < 12; i++) { MM.cycleStyle(); seen.push(MM._style); }
  expect(seen).not.toContain(0);
  expect(seen).not.toContain(4);
  expect(seen).not.toContain(5);
  expect(new Set(seen)).toEqual(new Set([1, 2, 3]));   // 在售只有方角/终端/胶囊点
});

test('老文档停在经典(0)时，切一次即落到首档（方角）', () => {
  const { MM } = setup(0);
  MM.cycleStyle();
  expect(MM._style).toBe(1);
});

test('老文档停在已下架的草图(4)/玻璃(5)时，切一次即落到首档', () => {
  const { MM } = setup(4);
  MM.cycleStyle();
  expect(MM._style).toBe(1);
  const { MM: MM2 } = setup(5);
  MM2.cycleStyle();
  expect(MM2._style).toBe(1);
});

test('load 把停在下架经典的老文档迁到首档', async () => {
  const { MM } = setup(0);
  STORE.loadMindmapGroupDoc.mockResolvedValue({ nodes: [], links: [], style: 0 });
  await MM.load();
  expect(MM._style).toBe(1);       // 不再是 0（已下架）
});

test('load 把停在下架的草图(4)/玻璃(5)也迁到首档', async () => {
  const { MM } = setup(0);
  for (const retired of [0, 4, 5]) {
    STORE.loadMindmapGroupDoc.mockResolvedValue({ nodes: [], links: [], style: retired });
    await MM.load();
    expect(MM._style).toBe(1);
  }
});

test('load 不误迁：在售档位原样保留（索引↔视觉映射冻结）', async () => {
  const { MM } = setup(0);
  for (const s of [1, 2, 3]) {
    STORE.loadMindmapGroupDoc.mockResolvedValue({ nodes: [], links: [], style: s });
    await MM.load();
    expect(MM._style).toBe(s);     // 重编号会让这里错位，是必须防的回归
  }
});

test('load 对越界/非法索引也回落到首档', async () => {
  const { MM } = setup(0);
  STORE.loadMindmapGroupDoc.mockResolvedValue({ nodes: [], links: [], style: 99 });
  await MM.load();
  expect(MM._style).toBe(1);
  STORE.loadMindmapGroupDoc.mockResolvedValue({ nodes: [], links: [] });   // 缺字段
  await MM.load();
  expect(MM._style).toBe(1);
});

test('样式 class 正确落到根元素，且不带已下架的 0 号 class', () => {
  const { MM, el } = setup(2);
  MM._applyStyleClass();
  expect(el.classList.contains('tw-mm-style-2')).toBe(true);
  expect(el.classList.contains('tw-mm-style-0')).toBe(false);
});
