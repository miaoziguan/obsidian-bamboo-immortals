/**
 * @jest-environment jsdom
 */
// 实证「切便签组是否重建画布节点 / 是否让 drop 监听失效」这一事实（决定修复方案范围）。
// 关键结论预期：当前代码中切组既不重建 .tw-canvas，也不重跑 MaterialMarket.init，
// drop 监听在 switch 前后挂在同一个 canvas 节点上、_installed 永不清空 → drop 始终有效。
const { loadModule } = require('./__helpers__/testUtils');

const StoreMock = {
  loadDoc: jest.fn().mockResolvedValue({ notes: [], links: [], canvasOffset: { x: 0, y: 0 }, version: 2 }),
  loadNotes: jest.fn().mockResolvedValue({ notes: [], canvasOffset: null, links: [] }),
  save: jest.fn().mockResolvedValue(undefined),
  getCurrentNotesGroup: jest.fn().mockResolvedValue({ id: 'g1' }),
  setNotesCurrent: jest.fn().mockResolvedValue(undefined),
};
global.TypewriterStore = StoreMock;
loadModule('handlers/features/twConfig.js', []); // 副作用：共享常量挂 globalThis
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

// materialMarket 依赖
global.CanvasViewport = { scaleOf: () => 1 };
global.SvgIsolate = { isolate: (s) => s };
// materialMarket 现走带缓存的隔离（stickerIsolateCache），loadModule 会剥离其 import：
const _sic2 = loadModule('utils/stickerIsolateCache.js', ['isolateStickerHtml', 'evictStickerIsolate']);
global.isolateStickerHtml = _sic2.isolateStickerHtml;
global.evictStickerIsolate = _sic2.evictStickerIsolate;
global.LinkLayer = class { constructor() {} clear() {} render() {} };
global.MindmapFeature = { mount: jest.fn() };
const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket']);
global.MaterialMarket = MaterialMarket;

const Tw = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], { TypewriterStore: StoreMock }).TypewriterFeature;

// 切组路径会触碰的 feature 方法 —— 与「画布是否重建 / drop 是否失效」无关，全部桩掉
Tw._mode = 'notes';
Tw._docBusy = false;
Tw._switching = false;
Tw._state = { notesGroupId: 'g1' };
Tw._timers = [];
Tw._canvasOffset = { x: 0, y: 0 };
Tw._clearSelection = jest.fn();
Tw._applyCanvasTransform = jest.fn();
Tw._buildCards = jest.fn();
Tw._renderLinks = jest.fn();
Tw._ensureNotesVisible = jest.fn();
Tw._scheduleSave = jest.fn();
Tw._seedSpatial = jest.fn();
Tw._observeScale = jest.fn();
Tw._mountZoomUI = jest.fn();
Tw._applyModeChrome = jest.fn();
Tw._exitAllEdits = jest.fn();
Tw._hideDocPanel = jest.fn();
Tw._persistDoc = jest.fn().mockResolvedValue(undefined);
Tw._scheduleRenderLinks = jest.fn();
Tw._refreshDocBtnLabel = jest.fn().mockResolvedValue(undefined);
Tw._renderDocPanel = jest.fn().mockResolvedValue(undefined);
Tw._showScreenMsg = jest.fn();
Tw._undoStack = { reset: jest.fn() };
// _initMaterialMarket 在 _ensureDom 中被调：改为真实 MaterialMarket.init，便于观察只绑一次
Tw._initMaterialMarket = () => MaterialMarket.init(Tw, Tw._el);

function setup() {
  const stage = document.createElement('div');
  document.body.appendChild(stage);
  Tw._ensureDom(stage); // 真实挂载：仅此处创建一次 .tw-canvas
  return stage;
}

function dropOnCanvas(canvas, payloadId) {
  const before = canvas.querySelectorAll('.bm-sticker').length;
  const ev = new Event('drop', { bubbles: true });
  ev.dataTransfer = { getData: () => JSON.stringify({ id: payloadId }), types: ['text/plain'] };
  ev.clientX = 10; ev.clientY = 10; ev.preventDefault = () => {};
  canvas.dispatchEvent(ev);
  return canvas.querySelectorAll('.bm-sticker').length - before;
}

test('切便签组不重建画布节点、drop 监听前后均有效且不累加', async () => {
  setup();
  const c0 = Tw._canvas;
  expect(c0).toBeTruthy();
  expect(c0.className).toContain('tw-canvas');

  // 模拟「已从市场下载」了一个贴纸素材
  MaterialMarket._installed['st1'] = { type: 'sticker', name: 'test-sticker', __code: '' };
  // 等 _restoreAll（init 内异步）落定，避免与手动注入竞争
  await new Promise((r) => setTimeout(r, 0));

  // —— 切组前 drop 一次 ——
  const before = dropOnCanvas(c0, 'st1');
  expect(before).toBe(1); // 生效，生成 1 个贴纸

  // —— 真实切组路径（ModeController.switchNotesGroup）——
  await ModeController.switchNotesGroup({ state: Tw._state, ctrl: Tw }, 'g2');

  // 关键事实①：画布节点未被重建（同一引用）
  expect(Tw._canvas).toBe(c0);
  expect(Tw._canvas.isConnected).toBe(true);

  // 关键事实②：切组后 drop 仍生效，且因 init 只绑一次、未累加 → 仍是 1 个
  const after = dropOnCanvas(Tw._canvas, 'st1');
  expect(after).toBe(1);
});
