/**
 * @jest-environment jsdom
 */
// 合并卡片回归锁：WritingDoc.mergeNotes 纯数据契约 + _mergeSelected 端到端。
// 设计（多选后合并，splitNote 的自然逆操作）：
//   · 锚 = 选中里 seq 最小者，其余并入；正文按读序 \n\n 拼接；
//   · 连线：被并卡(非锚)端点改写为锚，两端都被并→自环丢弃，去重；锚自身连线保留；
//   · seq 压紧为唯一连续（红线不破）。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };

const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.SpatialIndex = SpatialIndex;
global.GeoCache = GeoCache;
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);
global.ViewportCuller = ViewportCuller;
loadModule('handlers/features/twConfig.js', []);
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

function makeCard(id, text) {
  const el = document.createElement('div');
  el.dataset.id = id;
  el.className = 'tw-card';
  const t = document.createElement('div');
  t.className = 'tw-card-text';
  t.textContent = text;
  el.appendChild(t);
  return el;
}

function mergeFixture(notes, mode = 'notes') {
  feature._canvas = document.createElement('div');
  Object.defineProperty(feature._canvas, 'clientWidth', { value: 400, configurable: true });
  Object.defineProperty(feature._canvas, 'clientHeight', { value: 800, configurable: true });
  feature._el = document.createElement('div');
  feature._state = { notes: notes.slice(), geo: new GeoCache(), spatial: new SpatialIndex(512), mountedCards: new Map(), links: [] };
  feature._notes = notes.slice();
  feature._links = [];
  feature._selected = new Set();
  feature._geo = feature._state.geo;
  feature._mode = mode;
  feature._layoutMode = 'flow';
  feature._syncLayoutGeo = () => {};
  feature._scheduleRenderLinks = () => {};
  feature._scheduleSave = () => {};
  feature._scheduleCull = () => {};
  feature._refreshWriteOrder = () => {};
  feature._setCanvasOffset = () => {};
  feature._showScreenMsg = () => {};
  feature._measureCard = () => {};
  feature._disposeCard = () => {};
  feature._seedSpatial = () => {};
  feature._updateCulling = () => {};
  notes.forEach((n) => { feature._mountedCards.set(n.id, makeCard(n.id, n.text)); });
  feature._undoStack = { push: () => {} };
}

describe('WritingDoc.mergeNotes 纯数据契约', () => {
  test('合并两张：锚=小seq，正文\\n\\n拼接，被并卡移除，seq 连续', () => {
    const notes = [
      { id: 'a', seq: 0, level: 'p', text: '段落一' },
      { id: 'b', seq: 1, level: 'p', text: '段落二' },
      { id: 'c', seq: 2, level: 'p', text: '尾' },
    ];
    const r = WritingDoc.mergeNotes(notes, [], ['a', 'b']);
    expect(r.anchorId).toBe('a');
    expect(r.notes.length).toBe(2);            // a(合并后) + c
    const a = r.notes.find((n) => n.id === 'a');
    expect(a.text).toBe('段落一\n\n段落二');
    expect(a.level).toBe('p');                  // 锚视觉属性保留
    expect(r.notes.find((n) => n.id === 'b')).toBeUndefined();
    expect(r.notes.map((n) => n.seq)).toEqual([0, 1]);
  });

  test('乱序传入仍按读序(seq)拼接三张', () => {
    const notes = [
      { id: 'a', seq: 0, text: '一' },
      { id: 'b', seq: 1, text: '二' },
      { id: 'c', seq: 2, text: '三' },
    ];
    const r = WritingDoc.mergeNotes(notes, [], ['c', 'a', 'b']);
    expect(r.notes.length).toBe(1);
    expect(r.notes[0].text).toBe('一\n\n二\n\n三');
  });

  test('连线：被并卡端点改写为锚，自环丢弃，锚自身连线保留', () => {
    const notes = [
      { id: 'a', seq: 0, text: 'A' },
      { id: 'b', seq: 1, text: 'B' },
      { id: 'x', seq: 2, text: 'X' },
    ];
    const links = [
      { from: 'a', to: 'P' },     // 锚自身外部连线 → 保留
      { from: 'b', to: 'Q' },     // 被并卡 → 改写为 a→Q
      { from: 'b', to: 'a' },     // 两端都被并(锚a+被并b) → 自环 → 丢弃
      { from: 'x', to: 'R' },     // 与合并无关 → 保留
    ];
    const r = WritingDoc.mergeNotes(notes, links, ['a', 'b']);
    const has = (f, t) => r.links.some((l) => l.from === f && l.to === t);
    expect(r.links.length).toBe(3);             // a→P, a→Q, x→R（b→a 自环丢弃）
    expect(has('a', 'P')).toBe(true);
    expect(has('a', 'Q')).toBe(true);
    expect(has('x', 'R')).toBe(true);
    expect(has('b', 'Q')).toBe(false);          // 已改写为 a
    expect(has('b', 'a')).toBe(false);          // 自环丢弃
  });

  test('不足两张返回原样、anchorId 为 null', () => {
    const notes = [{ id: 'a', seq: 0, text: 'x' }];
    const r = WritingDoc.mergeNotes(notes, [], ['a']);
    expect(r.anchorId).toBeNull();
    expect(r.notes).toBe(notes);
  });
});

describe('多选合并 _mergeSelected 端到端', () => {
  test('选中两张合并：_notes 减少、锚文本拼接、被并卡清 DOM/选中', () => {
    mergeFixture([
      { id: 'a', seq: 0, level: 'p', text: '段落一' },
      { id: 'b', seq: 1, level: 'p', text: '段落二' },
      { id: 'c', seq: 2, level: 'p', text: '尾' },
    ]);
    feature._selected.add(feature._mountedCards.get('a'));
    feature._selected.add(feature._mountedCards.get('b'));
    feature._mergeSelected();
    expect(feature._notes.length).toBe(2);
    const a = feature._notes.find((n) => n.id === 'a');
    expect(a.text).toBe('段落一\n\n段落二');
    expect(feature._mountedCards.has('b')).toBe(false);
    expect(feature._selected.has(feature._mountedCards.get('b'))).toBe(false);
    expect(feature._mountedCards.has('a')).toBe(true);
  });

  test('不足两张不合并、不进撤销栈', () => {
    let pushed = 0;
    mergeFixture([{ id: 'a', seq: 0, text: 'x' }, { id: 'b', seq: 1, text: 'y' }]);
    feature._undoStack = { push: () => { pushed += 1; } };
    feature._selected.add(feature._mountedCards.get('a'));   // 仅 1 张
    feature._mergeSelected();
    expect(feature._notes.length).toBe(2);
    expect(pushed).toBe(0);
  });

  test('被并卡的外部连线改写到锚', () => {
    mergeFixture([
      { id: 'a', seq: 0, text: 'A' },
      { id: 'b', seq: 1, text: 'B' },
    ]);
    feature._links = [{ from: 'b', to: 'Q' }, { from: 'a', to: 'P' }];
    feature._selected.add(feature._mountedCards.get('a'));
    feature._selected.add(feature._mountedCards.get('b'));
    feature._mergeSelected();
    const has = (f, t) => feature._links.some((l) => l.from === f && l.to === t);
    expect(has('a', 'Q')).toBe(true);
    expect(has('a', 'P')).toBe(true);
    expect(has('b', 'Q')).toBe(false);
  });
});
