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

  test('窄可见视口：分幕仍铺成多列网格（不卡死单列），同幕同列 + 顺序/幕标正确', () => {
    actsFixture(notes4, 'acts', 400);
    feature._reflowWriteOrder();
    expect(pos('a').x).toBe(0);                 // 第 1 幕在首列
    expect(pos('c').x).toBeGreaterThan(0);      // 第 2 幕移到右列
    expect(pos('a').x).toBe(pos('b').x);        // 同幕同列
    expect(pos('c').x).toBe(pos('d').x);
    expect(pos('a').y).toBeLessThan(pos('b').y); // 同幕内顺序保持（y 单调递增）
    expect(pos('c').y).toBeLessThan(pos('d').y);
    expect(elOf('a').dataset.act).toBe('0');
    expect(elOf('c').dataset.act).toBe('1');    // 第 2 幕交替明暗
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

  test('引子块存在时 reflow 不崩且正常落位（同幕同列、幕内顺序保持）', () => {
    actsFixture([
      { id: 'p', level: 'p' },
      { id: 'a', level: 'h2', text: '第一章' },
      { id: 'b', level: 'p' },
      { id: 'c', level: 'h2', text: '第二章' },
      { id: 'd', level: 'p' },
    ], 'acts');
    expect(() => feature._reflowWriteOrder()).not.toThrow();
    expect(pos('a').x).toBe(pos('b').x);        // 同幕同列
    expect(pos('a').y).toBeLessThan(pos('b').y);
    expect(pos('c').x).toBe(pos('d').x);
    expect(pos('c').y).toBeLessThan(pos('d').y);
  });

  // 用户反馈的两条：① 排版会把别的卡片信息遮挡掉 ② 分幕之间的间距没自适应。
  test('编辑后长卡按真实高度排，不再拿编辑前的几何缓存压住下一张', () => {
    actsFixture([
      { id: 'a', level: 'h2', text: '第一章' },
      { id: 'b', level: 'p' },
    ], 'flow');
    // 编辑前缓存：两张都是 200 高；编辑后 a 变成 600 高（长文 / 表格）
    feature._geo.set('a', { x: 0, y: 0, w: 340, h: 200, rot: 0 });
    feature._geo.set('b', { x: 0, y: 224, w: 340, h: 200, rot: 0 });
    Object.defineProperty(elOf('a'), 'offsetHeight', { value: 600, configurable: true });
    Object.defineProperty(elOf('b'), 'offsetHeight', { value: 200, configurable: true });
    // 复现 _syncLayoutGeo 的语义：排前批量重测所有挂载卡并刷进几何缓存
    feature._syncLayoutGeo = () => {
      feature._mountedCards.forEach((el, id) => {
        feature._geo.set(id, {
          x: pos(id).x || 0, y: pos(id).y || 0,
          w: el.offsetWidth || 340, h: el.offsetHeight || 200, rot: 0,
        });
      });
    };
    feature._reflowWriteOrder();
    // 若没做排前重测，b 会落在 200+24=224，被 600 高的 a 盖住
    expect(pos('a').y).toBe(0);
    expect(pos('b').y).toBeGreaterThanOrEqual(600);
  });

  test('幕间距随各幕实测宽度自适应，列按实际宽度推进（不再等宽块 + 死 48px）', () => {
    const notes6 = [
      { id: 'a', level: 'h2', text: '第一章' }, { id: 'b', level: 'p' },
      { id: 'c', level: 'h2', text: '第二章' }, { id: 'd', level: 'p' },
      { id: 'e', level: 'h2', text: '第三章' }, { id: 'f', level: 'p' },
    ];
    actsFixture(notes6, 'acts');
    // 幕 1 / 3 是普通卡 340px，幕 2 是表格卡 880px
    [['a', 340], ['b', 340], ['c', 880], ['d', 880], ['e', 340], ['f', 340]]
      .forEach(([id, w]) => Object.defineProperty(elOf(id), 'offsetWidth', { value: w, configurable: true }));
    feature._reflowWriteOrder();

    const gap1 = pos('c').x - (pos('a').x + 340);   // 幕 1 → 幕 2
    const gap2 = pos('e').x - (pos('c').x + 880);   // 幕 2 → 幕 3
    expect(gap1).toBe(48);       // 2 × 卡间距（与旧的固定 48px 一致，常规观感不变）
    expect(gap2).toBe(96);       // 宽幕按自身体量放大，走到 4 × 卡间距上限
    expect(pos('e').x).toBe(1364);
  });

  test('机身键轮换忽略残留选区：整篇落位，未选中的卡不会被压住', () => {
    const notes4 = [
      { id: 'a', level: 'h2', text: '第一章' }, { id: 'b', level: 'p' },
      { id: 'c', level: 'h2', text: '第二章' }, { id: 'd', level: 'p' },
    ];
    actsFixture(notes4, 'flow');
    const scattered = notes4.map((n, i) => Object.assign({}, n, { x: 9999, y: i * 5000 }));
    feature._notes = scattered;
    feature._state.notes = scattered;   // 只换 notes，别冲掉 state 上的 mountedCards/geo 代理
    feature._selected = new Set([elOf('a'), elOf('b')]);   // 框选没取消就点了机身键
    feature._cycleWriteLayout();                            // flow → acts（整篇分幕）
    // 未选中的 c/d 也参与落位；否则它们留在 (9999, …) 而 a/b 从 (0,0) 铺起 → 遮挡
    expect(pos('c').x).toBeGreaterThan(0);
    expect(pos('d').x).toBe(pos('c').x);
    expect(pos('c').x).not.toBe(9999);
  });

  test('actCountInfo：用「派生卡对象(无 level)」作 target 也能数真幕（修复前恒 0）', () => {
    // 真实场景下 target 是 _orderCards() 派生的 {el,id,seq,x,y}，本无 level 字段；
    // 旧实现直接读 g.cards[0].level → 恒 undefined → 幕数恒显示 0。修复后 splitActs 把幕级标题
    // 的 level 挂到每幕首卡，actCountInfo 据此正确计数。
    const ctrl = { _noteIndex: () => new Map([
      ['a', { level: '' }], ['b', { level: 'h2' }], ['c', { level: '' }], ['d', { level: 'h2' }],
    ]) };
    const target = [
      { id: 'a', el: null, seq: 0, x: 0, y: 0 },
      { id: 'b', el: null, seq: 1, x: 0, y: 10 },
      { id: 'c', el: null, seq: 2, x: 0, y: 20 },
      { id: 'd', el: null, seq: 3, x: 0, y: 30 },
    ];
    const acts = PersistenceCoordinator.splitActs({ ctrl }, target);
    expect(acts.level).toBe(2);
    const info = PersistenceCoordinator.actCountInfo(acts);
    expect(info.actCount).toBe(2);   // 2 个 h2 真幕
    expect(info.hasIntro).toBe(true); // 有引子块 a
  });
});
