/**
 * @jest-environment jsdom
 */
// 回归：框选一批「离屏卡」时，不得逐卡回退到 offsetWidth/offsetHeight 读取（每次读都触发同步重排）。
// 旧行为：_mountCard(note) 同步挂载后立即读几何，但 _geo 尚未填充 → 回退 card.offsetWidth → N 次重排。
// 新行为：两趟——先批量 defer 挂载，再 flushMountMeasure() 一次，第二趟只用 _geo 判相交（零 DOM 读）。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
loadModule('handlers/features/twConfig.js', []);
const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('services/SpatialIndex.js', 'SpatialIndex');
_b1mod('services/GeoCache.js', 'GeoCache');
_b1mod('services/ViewportCuller.js', 'ViewportCuller');
_b1mod('handlers/features/writingDoc.js', 'WritingDoc');
_b1mod('handlers/features/CardInteractions.js', 'CardInteractions');

const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions']);

function makeCtrl(ids) {
  const notes = new Map();
  const geo = new Map();
  let offsetReads = 0;

  const mounted = new Map();
  ids.forEach((id, i) => {
    notes.set(id, { id, x: i * 10, y: i * 10 });
  });

  const ctrl = {
    _mountedCards: mounted,
    _geo: geo,
    _selected: new Set(),
    _noteIndex: () => notes,
    _spatial: { queryRect: () => ids.slice() },
    _materialMarket: null,
    _clearSelection: () => { ctrl._selected.clear(); },
    _flushMountMeasure: () => {
      // 真实实现：一次性量完所有 pending 卡写入 _geo（只此一次 reflow）
      mounted.forEach((card, id) => {
        if (!geo.has(id)) geo.set(id, { x: card._x, y: card._y, w: 100, h: 40 });
      });
    },
    _mountCard: (note, opts) => {
      const id = note.id;
      const card = {
        dataset: { id },
        _x: note.x,
        _y: note.y,
        style: { left: note.x + 'px', top: note.y + 'px' },
        classList: { add() {}, remove() {}, contains: () => false },
        get offsetWidth() { offsetReads += 1; return 100; },
        get offsetHeight() { offsetReads += 1; return 40; },
      };
      mounted.set(id, card);
      card._deferred = !!(opts && opts.defer);
      return card;
    },
  };

  return { ctrl, getReads: () => offsetReads };
}

describe('框选不得逐卡同步测量', () => {
  test('5 张离屏卡：选中全部，且 offsetWidth 读取为 0', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const { ctrl, getReads } = makeCtrl(ids);

    CardInteractions.selectInRect({ state: {}, ctrl }, { x: -1000, y: -1000, w: 5000, h: 5000 }, false);

    expect(ctrl._selected.size).toBe(5);
    // 旧实现：每张卡回退读 offsetWidth → 5 次；新实现应为 0（全部走 _geo）
    expect(getReads()).toBe(0);
  });
});
