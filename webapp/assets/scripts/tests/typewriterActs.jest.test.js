/**
 * @jest-environment jsdom
 */
// 分幕（acts）排版回归锁：写作档「顺流竖排 ⇄ 分幕」轮换的实现要点：
//   · splitActs 自动探测幕层级（取出现次数 ≥2 的最浅标题层级，而非死定 H1）；
//   · 且无 ≥2 个同级标题时降级为顺流竖排（_layoutMode='acts' 也不强行分幕）；
//   · reflowWriteOrder 的 acts 分支保持文章顺序（y 单调）、按网格换行、交替写 data-act 标出幕边界；
//   · _cycleWriteLayout 只切档位、实际布局仍走 _reflowWriteOrder（撤销/落盘/几何/提示只有一份实现）。
// 本文件把这些锁死。harness 沿用 typewriterCulling 的全局注入套路。
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

// 造「分幕」现场：卡全部在屏（挂 fake el，便于断言 data-act 与 DOM 同步），尺寸走默认 340x200。
function actsFixture(notes, layoutMode = 'acts', canvasW = 400) {
  feature._canvas = document.createElement('div');
  Object.defineProperty(feature._canvas, 'clientWidth', { value: canvasW, configurable: true });
  Object.defineProperty(feature._canvas, 'clientHeight', { value: 800, configurable: true });
  feature._el = document.createElement('div');
  feature._notes = notes;
  feature._state = { notes };                 // _noteIndex 读 state.notes
  feature._links = [];
  feature._selected = new Set();
  feature._geo = new GeoCache();              // 空 → sizeOf 走 DOM 实测(jsdom 为 0) → 默认 340x200
  feature._mountedCards = new Map();
  notes.forEach((n) => {
    const el = document.createElement('div');
    el.dataset.id = n.id;
    feature._mountedCards.set(n.id, el);
  });
  feature._undoStack = { push: () => {} };    // reflow 开头 push() 留档
  feature._layoutMode = layoutMode;
  // 隔离会触碰其它子系统的调度
  feature._syncLayoutGeo = () => {};
  feature._scheduleRenderLinks = () => {};
  feature._scheduleSave = () => {};
  feature._scheduleCull = () => {};
  feature._refreshWriteOrder = () => {};
  feature._setCanvasOffset = () => {};
  feature._showScreenMsg = () => {};
}

const pos = (id) => feature._notes.find((n) => n.id === id);
const elOf = (id) => feature._mountedCards.get(id);

describe('分幕：splitActs 幕层级自动探测', () => {
  test('1 个 H1 + 若干 H2 → 用 H2 分幕（而非死定 H1）', () => {
    actsFixture([
      { id: 'a', level: 'h2', text: '第一章' },
      { id: 'b', level: 'p' },
      { id: 'c', level: 'h2', text: '第二章' },
      { id: 'd', level: 'p' },
    ], 'flow');
    const r = PersistenceCoordinator.splitActs({ state: feature._state, ctrl: feature }, feature._notes);
    expect(r.level).toBe(2);
    expect(r.groups.length).toBe(2);
    expect(r.groups[0].cards.map((c) => c.id)).toEqual(['a', 'b']);
    expect(r.groups[1].cards.map((c) => c.id)).toEqual(['c', 'd']);
  });

  test('若干 H1（≥2）→ 用 H1 分幕', () => {
    actsFixture([
      { id: 'a', level: 'h1' },
      { id: 'b', level: 'h1' },
      { id: 'c', level: 'p' },
    ], 'flow');
    const r = PersistenceCoordinator.splitActs({ state: feature._state, ctrl: feature }, feature._notes);
    expect(r.level).toBe(1);
    expect(r.groups.map((g) => g.cards.map((c) => c.id))).toEqual([['a'], ['b', 'c']]);
  });

  test('同级标题不足 2 个 → level=0（不可分幕）', () => {
    actsFixture([
      { id: 'a', level: 'h1' },
      { id: 'b', level: 'p' },
      { id: 'c', level: 'p' },
    ], 'flow');
    const r = PersistenceCoordinator.splitActs({ state: feature._state, ctrl: feature }, feature._notes);
    expect(r.level).toBe(0);
    expect(r.groups).toEqual([]);
  });
});

describe('分幕：reflowWriteOrder acts 分支布局', () => {
  const notes4 = [
    { id: 'a', level: 'h2', text: '第一章' },
    { id: 'b', level: 'p' },
    { id: 'c', level: 'h2', text: '第二章' },
    { id: 'd', level: 'p' },
  ];

  test('窄画布单列：文章顺序保持（y 严格递增）+ 交替 data-act', () => {
    actsFixture(notes4, 'acts', 400);
    feature._reflowWriteOrder();
    ['a', 'b', 'c', 'd'].forEach((id) => expect(pos(id).x).toBe(0));   // 单列全左对齐
    expect(pos('a').y).toBeLessThan(pos('b').y);
    expect(pos('b').y).toBeLessThan(pos('c').y);
    expect(pos('c').y).toBeLessThan(pos('d').y);
    expect(elOf('a').dataset.act).toBe('0');
    expect(elOf('b').dataset.act).toBe('0');
    expect(elOf('c').dataset.act).toBe('1');   // 第 2 幕交替明暗
    expect(elOf('d').dataset.act).toBe('1');
  });

  test('宽画布多列：第 2 幕换到右列（x 偏移），同幕同列', () => {
    actsFixture(notes4, 'acts', 2000);
    feature._reflowWriteOrder();
    expect(pos('a').x).toBe(0);
    expect(pos('c').x).toBeGreaterThan(0);     // 第 2 幕移到右侧
    expect(pos('c').x).toBe(pos('d').x);        // 同幕同列
    expect(elOf('c').dataset.act).toBe('1');
  });

  test('_cycleWriteLayout 只切档位并触发重排', () => {
    actsFixture(notes4, 'flow');
    const spy = jest.spyOn(feature, '_reflowWriteOrder');   // 记录调用且不破坏真方法，自动还原
    feature._cycleWriteLayout();
    expect(feature._layoutMode).toBe('acts');
    expect(spy).toHaveBeenCalledTimes(1);
    feature._cycleWriteLayout();
    expect(feature._layoutMode).toBe('flow');
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  test('无 ≥2 同级标题时：acts 档位也降级走顺流竖排', () => {
    actsFixture([
      { id: 'a', level: 'p' },
      { id: 'b', level: 'p' },
    ], 'acts');
    feature._reflowWriteOrder();
    expect(pos('a').x).toBe(0);
    expect(pos('b').x).toBe(0);
    expect(pos('a').y).toBeLessThan(pos('b').y);
    expect(elOf('a').dataset.act).toBe('0');    // 单幕：清掉分幕底色
  });

  test('引子块不计入「幕」数：actCountInfo 只数真幕并标出引子', () => {
    const withIntro = [
      { id: 'p', level: 'p' }, { id: 'a', level: 'h2' }, { id: 'b', level: 'p' },
      { id: 'c', level: 'h2' }, { id: 'd', level: 'p' },
    ];
    feature._state = { notes: withIntro };
    const r1 = PersistenceCoordinator.splitActs({ state: feature._state, ctrl: feature }, withIntro);
    expect(PersistenceCoordinator.actCountInfo(r1)).toEqual({ actCount: 2, hasIntro: true });
    const noIntro = [
      { id: 'a', level: 'h2' }, { id: 'b', level: 'p' },
      { id: 'c', level: 'h2' }, { id: 'd', level: 'p' },
      { id: 'e', level: 'h2' }, { id: 'f', level: 'p' },
    ];
    feature._state = { notes: noIntro };
    const r2 = PersistenceCoordinator.splitActs({ state: feature._state, ctrl: feature }, noIntro);
    expect(PersistenceCoordinator.actCountInfo(r2)).toEqual({ actCount: 3, hasIntro: false });
  });

  test('引子块存在时 reflow 不崩且正常落位', () => {
    actsFixture([
      { id: 'p', level: 'p' },
      { id: 'a', level: 'h2', text: '第一章' },
      { id: 'b', level: 'p' },
      { id: 'c', level: 'h2', text: '第二章' },
      { id: 'd', level: 'p' },
    ], 'acts');
    expect(() => feature._reflowWriteOrder()).not.toThrow();
    expect(pos('a').x).toBe(0);                 // 引子与第 1 幕同列首排
    expect(pos('a').y).toBeLessThan(pos('c').y);
  });
});
