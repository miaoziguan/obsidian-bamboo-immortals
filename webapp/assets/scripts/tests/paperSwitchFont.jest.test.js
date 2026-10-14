/**
 * @jest-environment jsdom
 */
// 回归锁：切便签纸样时，字号必须基于「权威持久值 fontScale」派生，绝不依赖派生的 fontIdx 缓存。
// 历史上 bindPaperSwitch 读 Number(card.dataset.fontIdx)；一旦 fontIdx 缺失（NaN），applyFontScale 的
// isFinite 兜底只会把索引落回默认档，并随即把「默认字号」写回存储（WritingDoc.setFontScale），
// 静默把该卡字号写坏一次。修复改为读 card.dataset.fontScale 经 _fontIdxOf 派生索引（自带 isFinite 兜底）。
// 本用例复现「缺 fontIdx」现场，断言切纸样后 fontScale 仍由真实字号派生、不被写回默认档。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.SpatialIndex = SpatialIndex;
global.GeoCache = GeoCache;
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);
global.ViewportCuller = ViewportCuller;
// 副作用：FONT_SCALES / PAPERS / MARKET_PAPERS / PAPER_LABELS / PAPER_TITLES 等挂 globalThis
loadModule('handlers/features/twConfig.js', []);
const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/CardViewManager.js', 'CardViewManager');
_b1mod('handlers/features/CardInteractions.js', 'CardInteractions');
_b1mod('handlers/features/ModeController.js', 'ModeController');
_b1mod('handlers/features/PersistenceCoordinator.js', 'PersistenceCoordinator');
_b1mod('services/TypewriterStore.js', 'TypewriterStore');
_b1mod('services/undoStack.js', 'UndoStack');
_b1mod('handlers/features/mindmapFeature.js', 'MindmapFeature');
_b1mod('services/LinkLayer.js', 'LinkLayer');
_b1mod('services/ViewportCuller.js', 'ViewportCuller');
_b1mod('utils/domRef.js', 'isFromTextEntry');

function buildCtrl(baseNotes) {
  const { CardViewManager } = global;
  const state = {};
  let ctrl;
  ctrl = {
    _notes: baseNotes,
    _refreshTip: () => {},
    _invalidateGeo: () => {},
    _maxFontIdx: (paper) => CardViewManager.maxFontIdx({ state, ctrl }, paper),
    _fontIdxOf: (scale, paper) => CardViewManager.fontIdxOf({ state, ctrl }, scale, paper),
    _applyPaper: (card, p) => CardViewManager.applyPaper({ state, ctrl }, card, p),
    _applyFontScale: (card, idx) => CardViewManager.applyFontScale({ state, ctrl }, card, idx),
    _scheduleRenderLinks: () => {},
    _scheduleSave: () => {},
  };
  return ctrl;
}

function buildCard(id, paper, fontScale, fontIdx) {
  const card = document.createElement('div');
  card.dataset.id = id;
  card.dataset.paper = paper;
  card.dataset.fontScale = fontScale;
  if (fontIdx !== undefined) card.dataset.fontIdx = String(fontIdx);
  card.innerHTML =
    '<span class="tw-card-title"></span>' +
    '<button class="tw-card-paper"></button>' +
    '<button class="tw-card-font-down"></button>' +
    '<button class="tw-card-font-up"></button>';
  return card;
}

describe('bindPaperSwitch 字号不写坏回归', () => {
  test('fontIdx 缺失时切纸样，fontScale 仍由真实字号派生、不写回默认档', () => {
    const { CardViewManager } = global;
    const ctrl = buildCtrl([{ id: 'x', text: '', x: 0, y: 0, font: 'classic', paper: 'plain', level: 'p', date: '', zoom: 1, fontScale: 1, rot: 0 }]);
    // 真实字号 1.4（FONT_SCALES[5]，非默认档 1.0），故意不写 dataset.fontIdx
    const card = buildCard('x', 'plain', '1.4');

    CardViewManager.bindPaperSwitch({ state: {}, ctrl }, card);
    card.querySelector('.tw-card-paper').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // plain→night 均流式（上限 7），1.4 对应 index 5，字号应保持不变
    expect(card.dataset.fontScale).toBe('1.4');
    expect(card.dataset.fontIdx).toBe('5');
    const note = ctrl._notes.find((n) => n.id === 'x');
    expect(note.fontScale).toBe(1.4); // 关键：写回存储的是真实字号（setFontScale 存为数值）
    expect(note.fontScale).not.toBe(1); // 排除旧 bug：NaN→默认档写坏
  });

  test('fontIdx 与 fontScale 一致时，切纸样行为不退化', () => {
    const { CardViewManager } = global;
    const ctrl = buildCtrl([{ id: 'y', text: '', x: 0, y: 0, font: 'classic', paper: 'plain', level: 'p', date: '', zoom: 1, fontScale: 1, rot: 0 }]);
    const card = buildCard('y', 'plain', '1.4', 5); // fontIdx 与 fontScale 一致

    CardViewManager.bindPaperSwitch({ state: {}, ctrl }, card);
    card.querySelector('.tw-card-paper').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(card.dataset.fontScale).toBe('1.4');
    const note = ctrl._notes.find((n) => n.id === 'y');
    expect(note.fontScale).toBe(1.4);
  });
});
