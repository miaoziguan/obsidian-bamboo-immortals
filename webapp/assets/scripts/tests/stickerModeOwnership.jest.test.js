/**
 * @jest-environment jsdom
 */
// P0 回归：贴纸是「便签档专属装饰」，不得出现在写作 / 导图档画布上。
// 实证三条路径：
//   ① 非便签档恢复 → 被档位闸门拦下；
//   ② 启动竞态（读盘 await 期间档位被切走）→ 复检后放弃挂载；
//   ③ 离开便签档 → detachStickers 摘除 DOM，且不覆写该组已存数据。
const { loadModule } = require('./__helpers__/testUtils');

const StoreMock = {
  getCurrentNotesGroup: jest.fn().mockResolvedValue({ id: 'g1' }),
  setNotesCurrent: jest.fn().mockResolvedValue(undefined),
};
loadModule('handlers/features/twConfig.js', []);   // 副作用：共享常量挂 globalThis
global.CanvasViewport = { scaleOf: () => 1 };
global.SvgIsolate = { isolate: (s) => s };
global.LinkLayer = class { constructor() {} clear() {} render() {} };
global.MindmapFeature = { mount: jest.fn() };
const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket']);
// TypewriterStore.js 尾部有 window.TypewriterStore = TypewriterStore 的副作用，
// 而 loadModule 加载 materialMarket 时会递归求值该依赖 → 必须**加载之后**再覆盖，
// 否则 _stickerKey() 走真实实现（去读 notes-index），key 会退化成 notesStickers:default。
global.TypewriterStore = StoreMock;
global.MaterialMarket = MaterialMarket;

const STICKER = {
  id: 'm1', name: '贴纸A', type: 'sticker', version: '1.0.0',
  render: () => '<svg viewBox="0 0 100 100"></svg>',
  preview: '<svg viewBox="0 0 100 100"></svg>',
};
const REC = { id: 's1', material: 'm1', x: 10, y: 20 };

function mockStorage(initial = {}) {
  const settings = Object.assign({}, initial);
  window.storageManager = {
    getSetting: jest.fn(async (k) => (k in settings ? settings[k] : null)),
    putSetting: jest.fn(async (k, v) => { settings[k] = v; }),
  };
  return settings;
}

function fakeCtrl(mode) {
  const canvas = document.createElement('div');
  document.body.appendChild(canvas);
  return { _mode: mode, _canvas: canvas, _zTop: 10 };
}

function bind(ctrl) {
  MaterialMarket._ctrl = ctrl;
  MaterialMarket._installed = { m1: STICKER };
  MaterialMarket._canvasStickers = [];
}

beforeEach(() => {
  document.body.innerHTML = '';
  MaterialMarket._ctrl = null;
  MaterialMarket._installed = {};
  MaterialMarket._canvasStickers = [];
});

test('便签档：按组恢复贴纸并挂到画布', async () => {
  mockStorage({ 'notesStickers:g1': [REC] });
  const ctrl = fakeCtrl('notes');
  bind(ctrl);

  await MaterialMarket.reloadStickers();

  expect(ctrl._canvas.querySelectorAll('.bm-sticker').length).toBe(1);
  expect(MaterialMarket._canvasStickers.length).toBe(1);

  // P1：挂在便签档装饰层内，而不是直写共享画布
  const layer = ctrl._canvas.querySelector('.tw-deco-layer[data-mode="notes"]');
  expect(layer && layer.querySelectorAll('.bm-sticker').length).toBe(1);
  const direct = Array.from(ctrl._canvas.children).filter((c) => c.classList.contains('bm-sticker'));
  expect(direct.length).toBe(0);
});

test('P1：装饰层跟随档位显隐（非便签档整层隐藏）', async () => {
  mockStorage({ 'notesStickers:g1': [REC] });
  const ctrl = fakeCtrl('notes');
  bind(ctrl);
  await MaterialMarket.reloadStickers();

  const layer = ctrl._canvas.querySelector('.tw-deco-layer[data-mode="notes"]');
  expect(layer.hidden).toBe(false);
  MaterialMarket.syncDecoLayer('write');
  expect(layer.hidden).toBe(true);
  MaterialMarket.syncDecoLayer('mindmap');
  expect(layer.hidden).toBe(true);
  MaterialMarket.syncDecoLayer('notes');
  expect(layer.hidden).toBe(false);
});

test('写作档：恢复被闸门拦下，画布上不出现贴纸', async () => {
  mockStorage({ 'notesStickers:g1': [REC] });
  const ctrl = fakeCtrl('write');
  bind(ctrl);

  await MaterialMarket.reloadStickers();

  expect(ctrl._canvas.querySelectorAll('.bm-sticker').length).toBe(0);
  expect(MaterialMarket._canvasStickers.length).toBe(0);
});

test('启动竞态：读盘 await 期间切到写作档 → 不挂载', async () => {
  const settings = { 'notesStickers:g1': [REC] };
  const ctrl = fakeCtrl('notes');
  bind(ctrl);
  window.storageManager = {
    // 模拟「贴纸恢复晚于档位恢复」：读盘返回时档位已被切走
    getSetting: jest.fn(async () => { ctrl._mode = 'write'; return settings['notesStickers:g1']; }),
    putSetting: jest.fn(async () => {}),
  };

  await MaterialMarket.reloadStickers();

  expect(ctrl._canvas.querySelectorAll('.bm-sticker').length).toBe(0);
  expect(MaterialMarket._canvasStickers.length).toBe(0);
});

test('离开便签档：摘除 DOM，且不得用空数组覆盖该组已存贴纸', async () => {
  const settings = mockStorage({ 'notesStickers:g1': [REC] });
  const ctrl = fakeCtrl('notes');
  bind(ctrl);
  await MaterialMarket.reloadStickers();
  expect(ctrl._canvas.querySelectorAll('.bm-sticker').length).toBe(1);

  await MaterialMarket.detachStickers();
  expect(ctrl._canvas.querySelectorAll('.bm-sticker').length).toBe(0);
  expect(MaterialMarket._canvasStickers.length).toBe(0);
  expect(settings['notesStickers:g1'].length).toBe(1);      // 数据仍在盘上

  // 连续切档（便签→写作→导图）时已无贴纸，第二次 detach 不得写盘覆盖
  const before = settings['notesStickers:g1'];
  await MaterialMarket.detachStickers();
  expect(settings['notesStickers:g1']).toBe(before);
  expect(window.storageManager.putSetting).toHaveBeenCalledTimes(1);
});
