/**
 * @jest-environment jsdom
 */
// 回归锁：便签模式「统一选区」——卡片与贴纸进同一个 ctrl._selected，框选 / Delete / 拖动一视同仁。
// 验证：① 框选矩形相交的贴纸被纳入选区；② 未相交的贴纸不纳入；③ Delete 删除被选贴纸（DOM + 记录一起移除）；
//       ④ 整体拖动混合选区时，贴纸随动且 rec.x/rec.y 落盘（分型落盘路径）。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.SpatialIndex = SpatialIndex; global.GeoCache = GeoCache;
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);
global.ViewportCuller = ViewportCuller;
const { CanvasViewport } = loadModule('services/CanvasViewport.js', ['CanvasViewport']);
global.CanvasViewport = CanvasViewport;
loadModule('handlers/features/twConfig.js', []); // 副作用：FONT_SCALES / PAPERS 等挂 globalThis
const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/CardInteractions.js', 'CardInteractions');

// 不加载真实 MaterialMarket：统一选区只用到 _canvasStickers / recForEl / removeStickerEl / _saveStickers，用桩接管即可。
function buildCtrl(notes) {
  const { CardInteractions } = global;
  const state = {};
  const canvas = document.createElement('div');
  const mm = {
    _canvasStickers: [],
    recForEl(el) { return this._canvasStickers.find((s) => s.el === el) || null; },
    removeStickerEl(el) {
      const rec = this.recForEl(el);
      if (!rec) return false;
      const i = this._canvasStickers.indexOf(rec);
      if (i >= 0) this._canvasStickers.splice(i, 1);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      return true;
    },
    _saveStickers() {},
  };
  let ctrl;
  ctrl = {
    _notes: notes,
    _selected: new Set(),
    _spatial: { queryRect: () => [] },   // 本测试不挂真实卡片，框选只验贴纸收集
    _geo: new Map(),
    _mountedCards: new Map(),
    _canvas: canvas,
    _state: state,
    _zTop: 0,
    _undoStack: null,
    _materialMarket: mm,
    _scheduleSave: () => {},
    _scheduleRenderLinks: () => {},
    _scheduleCull: () => {},
    _measureCard: () => {},
    _pinOnly: () => {},
    _removeCard: (el) => {
      const id = el.dataset && el.dataset.id;
      if (id) ctrl._notes = ctrl._notes.filter((n) => n.id !== id);
      if (el.parentNode) el.parentNode.removeChild(el);
      ctrl._selected.delete(el);
    },
    _selectOnly: (el) => {
      ctrl._selected.clear();
      Array.from(document.querySelectorAll('.selected')).forEach((n) => n.classList.remove('selected'));
      ctrl._selected.add(el);
      el.classList.add('selected');
    },
    _toggleSelect: (el) => {
      if (ctrl._selected.has(el)) { ctrl._selected.delete(el); el.classList.remove('selected'); }
      else { ctrl._selected.add(el); el.classList.add('selected'); }
    },
    _clearSelection: () => { ctrl._selected.forEach((el) => el.classList.remove('selected')); ctrl._selected.clear(); },
    _updateSelBar: () => {},
  };
  return ctrl;
}

function buildSticker(x, y, w, h) {
  const el = document.createElement('div');
  el.className = 'bm-sticker';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  return { el, x, y, w, h, z: 0 };
}

describe('便签模式统一选区：贴纸纳入', () => {
  test('框选矩形相交的贴纸被纳入选区（.selected + Set）', () => {
    const ctrl = buildCtrl([]);
    const rec = buildSticker(50, 50, 30, 30);
    ctrl._materialMarket._canvasStickers.push(rec);
    CardInteractions.selectInRect({ state: {}, ctrl }, { x: 0, y: 0, w: 200, h: 200 });
    expect(ctrl._selected.has(rec.el)).toBe(true);
    expect(rec.el.classList.contains('selected')).toBe(true);
  });

  test('框选未相交的贴纸不被纳入', () => {
    const ctrl = buildCtrl([]);
    const rec = buildSticker(500, 500, 30, 30);
    ctrl._materialMarket._canvasStickers.push(rec);
    CardInteractions.selectInRect({ state: {}, ctrl }, { x: 0, y: 0, w: 100, h: 100 });
    expect(ctrl._selected.has(rec.el)).toBe(false);
  });

  test('Delete 删除被选贴纸：DOM 摘除 + 记录移除', () => {
    const ctrl = buildCtrl([]);
    const rec = buildSticker(50, 50, 30, 30);
    ctrl._materialMarket._canvasStickers.push(rec);
    document.body.appendChild(rec.el);
    ctrl._selected.add(rec.el);
    rec.el.classList.add('selected');
    const removed = CardInteractions.deleteSelected({ state: {}, ctrl });
    expect(removed).toBe(true);
    expect(ctrl._materialMarket._canvasStickers.length).toBe(0);
    expect(rec.el.parentNode).toBeNull();
    expect(ctrl._selected.has(rec.el)).toBe(false);
  });

  test('整体拖动混合选区：贴纸随动且 rec 落盘', () => {
    const ctrl = buildCtrl([]);
    const rec = buildSticker(50, 50, 30, 30);
    ctrl._materialMarket._canvasStickers.push(rec);
    document.body.appendChild(rec.el);
    ctrl._selected.add(rec.el);
    rec.el.classList.add('selected');
    const rAF = global.requestAnimationFrame;
    global.requestAnimationFrame = (cb) => { cb(); return 0; };   // 同步执行 apply，便于断言
    try {
      CardInteractions.startGroupDrag({ state: {}, ctrl }, new MouseEvent('pointerdown', { clientX: 100, clientY: 100 }), rec.el);
      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 160, clientY: 120 }));  // 位移 (60,20)
      document.dispatchEvent(new MouseEvent('pointerup', { clientX: 160, clientY: 120 }));
    } finally {
      global.requestAnimationFrame = rAF;
    }
    // 缩放比为 1：贴纸 left/top = 起点(50,50) + 位移(60,20)
    expect(parseFloat(rec.el.style.left)).toBeCloseTo(110);
    expect(parseFloat(rec.el.style.top)).toBeCloseTo(70);
    expect(rec.x).toBeCloseTo(110);
    expect(rec.y).toBeCloseTo(70);
  });
});
