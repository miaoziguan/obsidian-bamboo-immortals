/**
 * @jest-environment jsdom
 */
// P8 视口剔除「全路径审计」回归锁：几何/命中/导出/居中/重排必须读模型真源，
// 不能读活 DOM——离屏卡已被剔除（c.el 为 null / 不在 querySelectorAll 结果里），
// 读 DOM 会崩或只作用于可见卡。本文件把这些回归锁死。
const { loadModule } = require('./__helpers__/testUtils');

// MindmapFeature 在测试环境未加载：_refreshScreenMeta 顶部会读 MindmapFeature.isActive，先桩掉
global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };

const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);
// WritingDoc 被 loadModule 剥离了 import，但 reflow/arrange 内部调用 WritingDoc.* —— 注入全局供其解析
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
// 同 WritingDoc：loadModule 剥离了 import，_syncLayoutGeo 等新路径会 new SpatialIndex()，
// 注入全局供测试环境解析（生产环境由模块 import 提供）。
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.SpatialIndex = SpatialIndex;
global.GeoCache = GeoCache;
// B1 抽取债：ViewportCuller 从 feature 抽出，import 被 loadModule 剥离，需注入全局供 feature 委托调用解析
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);
global.ViewportCuller = ViewportCuller;
// B1 抽取债（综合）：feature 把 4 个子系统委托给 CardViewManager/CardInteractions/
// ModeController/PersistenceCoordinator；这些子系统方法体内引用的共享常量（twConfig 加载时挂
// globalThis）与服务在 loadModule 剥离 import 后需从全局解析。
loadModule('handlers/features/twConfig.js', []); // 副作用：把全部共享常量挂到 globalThis
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
// feature 是模块单例，帧预算用例会把 _applyZoom 换成 jest.fn()。几何用例要调真方法，
// 故在此存一份真身供其还原（否则打不上失效标记，且会误判为「已合帧」）。
const REAL_APPLY_ZOOM = feature._applyZoom;
// 真身 _measureCard（纯几何重测，_syncLayoutGeo 复用）；前序用例可能把它换成 mock，几何回归用例需还原。
const REAL_MEASURE = feature._measureCard;

// 造一个「全离屏」现场：_mountedCards 空、_geo 空 → 所有卡 c.el 为 null
function culledFixture() {
  feature._canvas = document.createElement('div');
  feature._el = document.createElement('div');
  feature._el.innerHTML = '<span id="twCardCount"></span><span id="twLinkCount"></span>';
  feature._notes = [
    { id: 'a', x: 0, y: 0, text: '甲', level: 'h1' },
    { id: 'b', x: 0, y: 5000, text: '乙', level: 'p' },
    { id: 'c', x: 0, y: 10000, text: '丙', level: 'p' },
  ];
  feature._links = [];
  feature._selected = new Set();
  feature._geo = new GeoCache();
  feature._mountedCards = new Map(); // 空 → 全部离屏
  feature._undoStack = null;
  // 桩掉会触碰其它子系统（连线层/落盘/重挂载）的调度，隔离本次断言
  feature._scheduleRenderLinks = () => {};
  feature._scheduleSave = () => {};
  feature._scheduleCull = () => {};
  feature._refreshWriteOrder = () => {};
  feature._setCanvasOffset = () => {};
  feature._showScreenMsg = () => {};   // 屏显元素在 fixture 里不存在，桩掉避免 null.textContent
}

describe('P8 剔除态全路径审计', () => {
  test('_buildCardsMarkdown 离屏卡(c.el=null)走模型真源，不崩且正确', () => {
    culledFixture();
    const ordered = feature._orderCards();        // 全部卡（模型派生，el 均为 null）
    expect(ordered.every((c) => c.el === null)).toBe(true);
    let out = '';
    expect(() => { out = feature._buildCardsMarkdown(ordered); }).not.toThrow();
    expect(out).toContain('# 甲');                 // h1 来自模型 level
    expect(out).toContain('乙');
    expect(out).toContain('丙');
  });

  test('_buildCardsMarkdown 优先用打字中途的 pendingText', () => {
    culledFixture();
    // 模拟一张正在打字动画中（在屏）的卡：el 有 pendingText，模型 text 还是旧的
    const fakeEl = document.createElement('div');
    fakeEl.dataset.pendingText = '刚打的全文';
    feature._mountedCards.set('a', fakeEl);
    feature._notes[0].text = '旧全文';
    const ordered = feature._orderCards();
    const out = feature._buildCardsMarkdown(ordered);
    expect(out).toContain('刚打的全文');
    expect(out).not.toContain('旧全文');
  });

  test('_refreshScreenMeta 卡片计数读模型 _notes.length（剔除态不全为可见卡）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._refreshScreenMeta();
    expect(feature._el.querySelector('#twCardCount').textContent).toBe('3');
  });

  test('_recenterNotes 按模型+缓存算包围盒，剔除态不偏（不抛、居中全量）', () => {
    culledFixture();
    feature._canvas.clientWidth = 1000;
    feature._canvas.clientHeight = 800;
    let off = null;
    feature._setCanvasOffset = (x, y) => { off = { x, y }; };
    expect(() => feature._recenterNotes()).not.toThrow();
    // 包围盒应覆盖到 y=10000 的离屏卡（maxY 远大于可见范围），而非只按可见卡
    expect(off).not.toBeNull();
    // 居中目标 x 应落在 0 附近（所有卡 x=0），说明按模型坐标而非 DOM 0 张
    expect(Math.abs(off.x)).toBeLessThan(1000);
  });

  test('_reflowWriteOrder 重排作用于全部卡（含离屏），不只可见卡', () => {
    culledFixture();
    const beforeY = feature._notes.map((n) => n.y);   // [0, 5000, 10000]
    feature._reflowWriteOrder();
    const afterY = feature._notes.map((n) => ({ id: n.id, y: n.y }));
    // 离屏卡 c 原 y=10000 必须被改掉（旧实现只排可见 DOM → y 不变）
    const c = afterY.find((n) => n.id === 'c');
    expect(c.y).not.toBe(10000);
    // 三张卡按文章顺序竖向顺流：y 递增且互不相等
    expect(afterY[0].y).toBeLessThan(afterY[1].y);
    expect(afterY[1].y).toBeLessThan(afterY[2].y);
  });

  test('_arrangeNotes 排版作用于全部卡（含离屏），不只可见卡', () => {
    culledFixture();
    const beforeY = feature._notes.map((n) => n.y);
    feature._arrangeNotes();
    const afterY = feature._notes.map((n) => ({ id: n.id, y: n.y }));
    const c = afterY.find((n) => n.id === 'c');
    expect(c.y).not.toBe(10000);                       // 离屏卡也被排版
    // 全部卡都进入了网格（x/y 被改写）
    expect(afterY.every((n) => n.y !== beforeY.find((b) => b.id === n.id))).toBe(true);
  });

  test('getSeedSource 导图播种读模型真源，剔除态不漏离屏卡', () => {
    culledFixture();
    // 全部卡离屏（_mountedCards 空），种子必须仍包含 3 张（旧实现 querySelectorAll 只拿可见卡）
    const src = feature.getSeedSource();
    expect(src.cards).toHaveLength(3);
    expect(src.cards.map((c) => c.id).sort()).toEqual(['a', 'b', 'c']);
    expect(src.cards.find((c) => c.id === 'a').text).toBe('甲');
    expect(src.links).toEqual([]);
  });
});

describe('LOD 分级渲染（对标 tldraw Level of Detail）', () => {
  // 本应用画布固定 100% 不缩放（无相机 zoom），故 LOD 不按缩放档位触发，
  // 而按「交互态(drag) + 可见密度(dense)」触发。
  function lodFixture() {
    culledFixture();
    feature._lodDragging = false;
    feature._lodDense = false;
    feature._lodDrag = false;
    feature._canvas.className = 'tw-canvas';
  }
  const bigMounted = () => {
    const m = new Map();
    for (let i = 0; i < 500; i++) m.set('n' + i, document.createElement('div'));
    return m;
  };

  test('常态 full：不加降级 class，且 _mountedCards 为 null 也不抛', () => {
    lodFixture();
    feature._mountedCards = null;
    expect(() => feature._applyLod()).not.toThrow();
    expect(feature._canvas.classList.contains('tw-lod-dense')).toBe(false);
    expect(feature._canvas.classList.contains('tw-lod-drag')).toBe(false);
  });

  test('在屏卡数超阈值 → dense 降级；回落少量卡 → 自动摘掉', () => {
    lodFixture();
    feature._mountedCards = bigMounted();
    feature._applyLod();
    expect(feature._canvas.classList.contains('tw-lod-dense')).toBe(true);

    feature._mountedCards = new Map([['a', document.createElement('div')]]);
    feature._applyLod();
    expect(feature._canvas.classList.contains('tw-lod-dense')).toBe(false);
  });

  test('画布平移拖拽 → drag 降级；松手 → 立刻恢复满细节', () => {
    lodFixture();
    feature._setLodDragging(true);
    expect(feature._canvas.classList.contains('tw-lod-drag')).toBe(true);
    feature._setLodDragging(false);
    expect(feature._canvas.classList.contains('tw-lod-drag')).toBe(false);
  });

  test('幂等：档位未变不重复写 class（连续调用无副作用）', () => {
    lodFixture();
    feature._setLodDragging(true);
    const cls = feature._canvas.className;
    feature._applyLod();
    feature._applyLod();
    expect(feature._canvas.className).toBe(cls);
  });

  test('降级只切 canvas 档位 class，绝不改动卡片 DOM（正文不丢）', () => {
    lodFixture();
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.innerHTML = '<div class="tw-card-text">正文不可丢</div>';
    feature._canvas.appendChild(card);
    const before = feature._canvas.children.length;

    feature._mountedCards = bigMounted();
    feature._setLodDragging(true);          // dense + drag 双档齐下

    expect(feature._canvas.classList.contains('tw-lod-dense')).toBe(true);
    expect(feature._canvas.classList.contains('tw-lod-drag')).toBe(true);
    expect(feature._canvas.children.length).toBe(before);
    expect(card.querySelector('.tw-card-text').textContent).toBe('正文不可丢');
  });
});

describe('帧预算：连续手势 rAF 合流（对标 tldraw batched store updates）', () => {
  let rafQueue = [];
  const flush = () => { const q = rafQueue; rafQueue = []; q.forEach((cb) => cb()); };

  function frameFixture() {
    feature._applyZoom = jest.fn();      // 先装 mock：后续任何遗留回调都打到它上面，不会误调真方法
    // 手势监听挂在 document 上，上一用例若未松手会泄漏到本例 → 先清场再开工
    document.body.innerHTML = '';
    document.dispatchEvent(new MouseEvent('pointerup', {}));
    feature._applyZoom.mockClear();
    culledFixture();
    feature._applyZoom = jest.fn();      // 只数调用次数，不真改样式/模型
    feature._scheduleRenderLinks = () => {};
    feature._measureCard = () => {};
    feature._scheduleSave = () => {};
    feature._zTop = 0;
    // 手动掌控 rAF：不自动执行，才能断言「合帧一次」而非「每事件一次」
    rafQueue = [];
    global.requestAnimationFrame = (cb) => { rafQueue.push(cb); return rafQueue.length; };
    global.cancelAnimationFrame = () => {};
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.zoom = '1';
    document.body.appendChild(card);
    return card;
  }

  test('缩放手柄拖拽：5 次 pointermove 只合帧落一次，不是每事件一次', () => {
    const card = frameFixture();
    feature._makeResizable(card);
    const handle = card.querySelector('.tw-card-resize');
    handle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100, clientY: 100, bubbles: true }));
    for (let i = 1; i <= 5; i++) {
      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 100 + i * 20, clientY: 100 + i * 20 }));
    }
    expect(feature._applyZoom).not.toHaveBeenCalled();   // 期间一次都没同步落
    expect(rafQueue.length).toBe(1);                      // 只排了一帧
    flush();
    expect(feature._applyZoom).toHaveBeenCalledTimes(1);
    expect(feature._applyZoom.mock.calls[0][1]).toBeGreaterThan(1);   // 且确实放大了
  });

  test('缩放手柄松手补写末帧，不丢最后一次增量', () => {
    const card = frameFixture();
    feature._makeResizable(card);
    const handle = card.querySelector('.tw-card-resize');
    handle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 0, clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 300, clientY: 300 }));  // 故意不 flush
    document.dispatchEvent(new MouseEvent('pointerup', {}));
    expect(feature._applyZoom).toHaveBeenCalledTimes(1);            // 松手补写
    expect(feature._applyZoom.mock.calls[0][1]).toBeGreaterThan(1);  // 末尾增量没丢
  });

  test('⌘/Ctrl+滚轮缩放：一帧内多次 wheel 只落一次，且步进全部累计不丢', () => {
    const card = frameFixture();
    feature._makeResizable(card);
    const wheel = () => card.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, metaKey: true, bubbles: true }));
    wheel(); wheel(); wheel();
    expect(feature._applyZoom).not.toHaveBeenCalled();
    expect(rafQueue.length).toBe(1);
    flush();
    expect(feature._applyZoom).toHaveBeenCalledTimes(1);
    // 三次步进必须都累积上：若基准误读 dataset.zoom 旧值，只会落出一次步进（≈1.08）
    expect(feature._applyZoom.mock.calls[0][1]).toBeGreaterThan(1.1);
  });
});

describe('几何缓存失效系统化（对标 tldraw geometry caching）', () => {
  let rafQueue = [];
  const flush = () => { const q = rafQueue; rafQueue = []; q.forEach((cb) => cb()); };

  function geoFixture() {
    culledFixture();
    rafQueue = [];
    global.requestAnimationFrame = (cb) => { rafQueue.push(cb); return rafQueue.length; };
    global.cancelAnimationFrame = () => {};
    feature._applyZoom = REAL_APPLY_ZOOM;      // 还原真身（帧预算用例可能留了 mock）
    feature._measureCard = jest.fn();          // 只数重测次数，不做真测量
    feature._scheduleRenderLinks = () => {};
    feature._syncCardScaleButtons = () => {};
    feature._refreshTip = () => {};
    feature._refreshLevelSteps = () => {};
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'a';
    card.dataset.zoom = '1';
    card.dataset.paper = 'plain';
    card.dataset.level = 'p';
    card.dataset.fontIdx = '3';
    return card;
  }

  test('缩放改了尺寸 → 打失效标记并合帧重测，且不同步重测', () => {
    const card = geoFixture();
    feature._mountedCards.set('a', card);
    feature._applyZoom(card, 1.5);
    expect(feature._measureCard).not.toHaveBeenCalled();   // 当场不 reflow
    expect(rafQueue.length).toBe(1);
    flush();
    expect(feature._measureCard).toHaveBeenCalledTimes(1);
    expect(feature._measureCard).toHaveBeenCalledWith(card);
  });

  test('缩放/字级/级别/纸样 四个失效点合并成一帧一次重测', () => {
    const card = geoFixture();
    feature._mountedCards.set('a', card);
    feature._applyZoom(card, 1.2);
    feature._applyFontScale(card, 4);
    feature._applyLevel(card, 'h2');
    feature._applyPaper(card, 'plain');
    expect(rafQueue.length).toBe(1);          // 只排了一帧
    flush();
    expect(feature._measureCard).toHaveBeenCalledTimes(1);
  });

  test('离屏卡的失效标记不会炸，也不会被误测', () => {
    geoFixture();                              // 刻意不挂进 _mountedCards
    feature._invalidateGeo('a');
    expect(() => flush()).not.toThrow();
    expect(feature._measureCard).not.toHaveBeenCalled();
  });

  test('_invalidateGeoAll 让全体几何失效，但只重测在屏卡', () => {
    const card = geoFixture();
    feature._mountedCards.set('a', card);
    feature._geo.set('b', { x: 0, y: 0, w: 10, h: 10, rot: 0 });   // 离屏卡
    feature._invalidateGeoAll();
    expect(feature._geo._dirty.has('a')).toBe(true);
    expect(feature._geo._dirty.has('b')).toBe(true);
    flush();
    expect(feature._measureCard).toHaveBeenCalledTimes(1);   // 只有 a 在屏
  });
});

describe('性能埋点（对标 tldraw PerformanceManager）', () => {
  function perfFixture() {
    culledFixture();
    feature._zTop = 0;
    feature._measureCard = jest.fn();
    feature._createCardEl = () => {
      const el = document.createElement('div');
      el.innerHTML = '<div class="tw-card-text"></div>';
      return el;
    };
    feature._perfOn = false;
    feature._perf = null;
    global.requestAnimationFrame = (cb) => { cb(); return 1; };   // 同步执行便于断言
  }

  test('关闭时不采样：_perfBegin 返回 0，报告为空（热路径零开销）', () => {
    perfFixture();
    feature._setPerf(false);
    expect(feature._perfBegin()).toBe(0);
    feature._mountCard({ id: 'x', x: 0, y: 0, text: 't' });
    expect(feature._perfReport()).toEqual({});
  });

  test('开启后 _mountCard 计入 mount 样本（DOM 池化决策的判据）', () => {
    perfFixture();
    feature._setPerf(true);
    feature._mountCard({ id: 'x', x: 0, y: 0, text: 't' });
    feature._mountCard({ id: 'y', x: 0, y: 0, text: 't' });
    const r = feature._perfReport();
    expect(r.mount.n).toBe(2);
    expect(typeof r.mount.avg).toBe('number');
    expect(r.mount.max).toBeGreaterThanOrEqual(r.mount.avg);
  });

  test('_flushGeo 计入独立样本', () => {
    perfFixture();
    feature._setPerf(true);
    feature._geo.markAllDirty(['a']);
    feature._mountedCards.set('a', document.createElement('div'));
    feature._flushGeo();
    expect(feature._perfReport().geoFlush.n).toBe(1);
  });

  test('_perfReset 清零；开关与读数 API 齐备', () => {
    perfFixture();
    feature._setPerf(true);
    feature._mountCard({ id: 'x', x: 0, y: 0, text: 't' });
    expect(feature._perfReport().mount.n).toBe(1);
    feature._perfReset();
    expect(feature._perfReport()).toEqual({});
    // 调试出口 window.__twPerf 挂在构造函数里（本 harness 的 feature 未走构造，故不断言它）
    expect(typeof feature._setPerf).toBe('function');
    expect(typeof feature._perfReport).toBe('function');
    expect(typeof feature._perfReset).toBe('function');
  });
});

describe('几何缓存：重排/排版后必须刷新（修复「线断在半空」）', () => {
  // 复现卡片写作模式顺流重排（_reflowWriteOrder）/ 一键排版（_arrangeNotes）/ 上移下移（_moveCardInOrder）后，
  // 连线端点在视觉上「断在半空」的根因：布局写操作只改了 style.left/top（在屏）与模型（全部），
  // 却漏刷 _geo 与空间索引，导致剔除按旧位置挂载、连线端点指向重排前的幽灵位置。
  // 这三类入口都在 _syncLayoutGeo 补齐：在屏卡纯几何重测、离屏卡按模型刷新 x/y。本组把回归锁死。

  test('_reflowWriteOrder 后：离屏卡几何缓存刷新到新竖排位置（端点不再指向幽灵位）', () => {
    culledFixture();
    feature._measureCard = REAL_MEASURE;             // 还原真方法（前序用例可能留 mock）
    // 模拟卡片先前已在屏、测量过，缓存里是「重排前」的散乱位置（剔除态：后被卸载）
    feature._geo.set('a', { x: 0, y: 0, w: 300, h: 120, rot: 0 });
    feature._geo.set('b', { x: 800, y: 5000, w: 300, h: 120, rot: 0 });
    feature._geo.set('c', { x: -200, y: 10000, w: 300, h: 120, rot: 0 });
    feature._spatial.update('a', 0, 0, 300, 120, 0);
    feature._spatial.update('b', 800, 5000, 300, 120, 0);
    feature._spatial.update('c', -200, 10000, 300, 120, 0);

    feature._reflowWriteOrder();

    // 缓存必须反映重排后的竖排：x 收拢到 0、y 递增
    const ga = feature._geo.get('a'), gb = feature._geo.get('b'), gc = feature._geo.get('c');
    expect(ga.x).toBe(0); expect(ga.y).toBe(0);
    expect(gb.x).toBe(0); expect(gb.y).toBeGreaterThan(ga.y);   // b 在 a 下方
    expect(gc.x).toBe(0); expect(gc.y).toBeGreaterThan(gb.y);   // c 在 b 下方
    // 空间索引同步：按新位置查询三张都在；旧散乱位置(800,5000)不再有卡
    const nowVisible = feature._spatial.queryRect(-300, -300, 300, 15000);
    expect(nowVisible.has('a')).toBe(true);
    expect(nowVisible.has('b')).toBe(true);
    expect(nowVisible.has('c')).toBe(true);
    const staleBucket = feature._spatial.queryRect(700, 4900, 900, 5100);
    expect(staleBucket.has('b')).toBe(false);
  });

  test('_reflowWriteOrder 后：在屏卡几何缓存重写 left/top（端点跟真位置）', () => {
    culledFixture();
    feature._measureCard = REAL_MEASURE;
    const elA = document.createElement('div'); elA.dataset.id = 'a'; elA.style.left = '1000px'; elA.style.top = '7000px';
    const elB = document.createElement('div'); elB.dataset.id = 'b'; elB.style.left = '-500px'; elB.style.top = '3000px';
    feature._mountedCards.set('a', elA);
    feature._mountedCards.set('b', elB);
    feature._geo.set('a', { x: 1000, y: 7000, w: 300, h: 120, rot: 0 });
    feature._geo.set('b', { x: -500, y: 3000, w: 300, h: 120, rot: 0 });
    feature._spatial.update('a', 1000, 7000, 300, 120, 0);
    feature._spatial.update('b', -500, 3000, 300, 120, 0);

    feature._reflowWriteOrder();

    expect(feature._geo.get('a').x).toBe(0);  // 重排后竖排 x=0
    expect(feature._geo.get('a').y).toBe(0);
    expect(feature._geo.get('b').x).toBe(0);
    expect(feature._geo.get('b').y).toBeGreaterThan(0);
    expect(feature._spatial.queryRect(-50, -50, 350, 100000).has('a')).toBe(true);
    expect(feature._spatial.queryRect(-50, -50, 350, 100000).has('b')).toBe(true);
  });

  test('_arrangeNotes 后：几何缓存/空间索引刷新到网格位置', () => {
    culledFixture();
    feature._measureCard = REAL_MEASURE;
    feature._geo.set('a', { x: 999, y: 0, w: 300, h: 120, rot: 0 });
    feature._geo.set('b', { x: 0, y: 8888, w: 300, h: 120, rot: 0 });
    feature._spatial.update('a', 999, 0, 300, 120, 0);
    feature._spatial.update('b', 0, 8888, 300, 120, 0);

    feature._arrangeNotes();

    // 两张卡进网格后，x/y 必须被改写为网格坐标（不再停在 999 / 8888 散乱位）
    expect(feature._geo.get('a').x).not.toBe(999);
    expect(feature._geo.get('b').y).not.toBe(8888);
    const nowVisible = feature._spatial.queryRect(-1000, -1000, 5000, 5000);
    expect(nowVisible.has('a')).toBe(true);
    expect(nowVisible.has('b')).toBe(true);
    // 旧的散乱位(999,0)不应再命中
    expect(feature._spatial.queryRect(900, -50, 1100, 50).has('a')).toBe(false);
  });
});

describe('导出编号回归（修复 #A：ol 有序列表错位）', () => {
  test('ol 用跨卡连续序号，不取全局阅读序下标', () => {
    culledFixture();
    // 模型：一张 p、一张 ol(三行)、一张 h2、一张 ol(两行)。
    // 旧 bug：编号取卡的全局阅读序下标 i → o1(第2张)三行全是 "2."、o2(第4张)两行全是 "4."。
    feature._notes = [
      { id: 'p1', x: 0, y: 0, text: '普通段落', level: 'p' },
      { id: 'o1', x: 0, y: 100, text: '甲\n乙\n丙', level: 'ol' },
      { id: 'h1', x: 0, y: 200, text: '小标题', level: 'h2' },
      { id: 'o2', x: 0, y: 300, text: '丁\n戊', level: 'ol' },
    ];
    const ordered = feature._orderCards();          // 阅读序 p1,o1,h1,o2（全部 el=null，走模型真源）
    const out = feature._buildCardsMarkdown(ordered);
    // 修复后：o1 → 1. 2. 3.，o2 跨卡续 4. 5.
    expect(out).toMatch(/1\. 甲/);
    expect(out).toMatch(/3\. 丙/);
    expect(out).toMatch(/5\. 戊/);
    // 严格排除旧 bug 的错位写法（bug 下才是这些）
    expect(out).not.toMatch(/2\. 甲/);   // bug: o1 三行全是 "2."
    expect(out).not.toMatch(/4\. 戊/);   // bug: o2 两行全是 "4."
  });
});

describe('监听器生命周期回归（修复 #B：_levelKeyHandler 泄漏）', () => {
  test('unmount 对称移除 _levelKeyHandler（每次开关视图不再堆叠 document keydown 监听）', () => {
    // 桩掉 unmount 里会触碰其它子系统/DOM 的副作用，聚焦「文档级监听移除」契约
    const realHide = feature._hideLevelMenu;
    feature._hideLevelMenu = () => {};
    const realTeardown = global.MindmapFeature && global.MindmapFeature.teardown;
    if (global.MindmapFeature) global.MindmapFeature.teardown = () => {};
    const realSaveNow = feature._saveNow;
    feature._saveNow = () => {};
    const realInv = global.TypewriterStore && global.TypewriterStore.invalidateWritingIndex;
    if (global.TypewriterStore) global.TypewriterStore.invalidateWritingIndex = () => {};

    const handler = () => {};
    feature._levelKeyHandler = handler;   // 模拟 mount 时 _bindLevelKeys 挂上的监听
    feature._selKeyHandler = null;        // 隔离：只验证 levelKeyHandler 分支
    feature._marquee = null;

    const removed = [];
    const realRemove = document.removeEventListener.bind(document);
    document.removeEventListener = (type, fn) => {
      if (type === 'keydown') removed.push(fn);
      return realRemove(type, fn);
    };
    try {
      feature.unmount();
    } finally {
      document.removeEventListener = realRemove;
      feature._hideLevelMenu = realHide;
      if (global.MindmapFeature) global.MindmapFeature.teardown = realTeardown;
      feature._saveNow = realSaveNow;
      if (global.TypewriterStore) global.TypewriterStore.invalidateWritingIndex = realInv;
    }
    expect(removed).toContain(handler);   // 修复点：unmount 必须摘掉 _levelKeyHandler
  });
});

describe('顺序一等数据（seq）：写入档规模稳定性', () => {
  test('orderCards 按 seq 排序，不再由连线/坐标现推（升维后顺序冻结）', () => {
    culledFixture();
    feature._mode = 'write';
    // 造一份「已升维」的数据：seq 已定，坐标与连线故意与之矛盾
    feature._notes = [
      { id: 'a', seq: 2, x: 0, y: 999 },
      { id: 'b', seq: 0, x: 500, y: 0 },
      { id: 'c', seq: 1, x: 0, y: 500 },
    ];
    feature._links = [];
    expect(feature._orderCards().map((c) => c.id)).toEqual(['b', 'c', 'a']);   // 只认 seq
  });

  test('新建卡接文末：走真实建卡路径（_spawn），seq = max+1（修复「新卡序号显示 1」）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._linkLayer = {
      makeLinkable: () => {}, watchSize: () => {}, highlightFor: () => {},
      clearControls: () => {}, render: () => {}, scheduleRender: () => {}, removeLinksOf: () => {},
    };
    // 前面有用例把 _createCardEl 换成了桩（单例污染）→ 还原真身
    feature._createCardEl = (note) => CardViewManager.createCardEl({ state: feature._state, ctrl: feature }, note);
    feature._ensureAudio = () => {};
    feature._playFeedSound = () => {};
    feature._showScreenMsg = () => {};
    feature._measureCard = () => {};
    feature._scheduleSave = () => {};
    feature._ensureCardVisible = () => {};
    feature._enforceCap = () => {};
    feature._input = { value: '', focus: () => {} };
    feature._el.innerHTML += '<div class="tw-beeper"></div>';   // 无锚点时落点会读它
    feature._links = [];
    // 已有 15 张（seq 0..14）——复现用户现场：新建应为「第 16 位」
    feature._notes = Array.from({ length: 15 }, (_, i) => ({
      id: 'c' + i, seq: i, x: 0, y: i * 100, text: 't' + i, level: 'p',
    }));

    feature._spawn('新卡', 'p');

    const added = feature._notes.find((n) => n.text === '新卡');
    expect(added).toBeTruthy();
    // 修复点：手写建卡字面量补了 seq = max+1（旧 bug：无 seq → 被当作最前，徽标显示 1 而非 16）
    expect(added.seq).toBe(15);
  });

  test('防御：模型里缺 seq 的卡排序到末尾（绝不会顶到第 1 位）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._links = [];
    feature._notes = [
      { id: 'a', seq: 0, x: 0, y: 0 },
      { id: 'nos', x: 0, y: 50 },      // 缺 seq（模拟上游漏写）
      { id: 'b', seq: 1, x: 0, y: 100 },
    ];
    const ids = feature._orderCards().map((c) => c.id);
    expect(ids[0]).not.toBe('nos');    // 不排最前
    expect(ids[ids.length - 1]).toBe('nos');   // 排末尾（最小伤害）
  });

  test('连线定序：新增连线后 seq 按「连线优先」重算（B 接到 A 之后）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._links = [];
    // 初始顺序 = 阅读序（按 y）：a0 b1 c2
    feature._notes = [
      { id: 'a', seq: 0, x: 0, y: 0 },
      { id: 'b', seq: 1, x: 0, y: 100 },
      { id: 'c', seq: 2, x: 0, y: 200 },
    ];
    // 连 b→a：等价于「a 紧跟 b」，重算后 a 应排到 b 之后
    feature._addLink('b', 'a');
    const ids = feature._orderCards().map((c) => c.id);
    expect(ids.indexOf('a')).toBe(ids.indexOf('b') + 1);
  });

  test('拖动不改顺序：只改坐标，seq 与顺序不变', () => {
    culledFixture();
    feature._mode = 'write';
    feature._links = [];
    feature._notes = [
      { id: 'a', seq: 0, x: 0, y: 0 },
      { id: 'b', seq: 1, x: 0, y: 100 },
    ];
    const before = feature._orderCards().map((c) => c.id);
    // 模拟拖动：把 a 拖到很下方（坐标剧变）
    feature._notes = WritingDoc.setPos(feature._notes, 'a', 900, 9000);
    const after = feature._orderCards().map((c) => c.id);
    expect(after).toEqual(before);   // 顺序不受坐标影响
  });

  test('文末卡被剔除时仍能接续文章流（不再跳到出纸口）', () => {
    culledFixture();
    feature._mode = 'write';
    // 文末卡 b 离屏（未挂载，el === null），但其模型坐标 known
    feature._notes = [
      { id: 'a', seq: 0, x: 0, y: 0 },
      { id: 'b', seq: 1, x: 0, y: 500 },
    ];
    feature._geo.set('b', { x: 0, y: 500, w: 340, h: 160, rot: 0 });
    // exclude 是「刚 append 进 DOM 的新卡」元素（真实流程中非 null）
    const newCard = document.createElement('div');
    newCard.className = 'tw-card';
    newCard.dataset.id = 'new';
    feature._canvas.appendChild(newCard);
    const anchor = feature._spawnAnchorCard(newCard);
    expect(anchor).not.toBeNull();
    // 旧实现此处返回 null（el 为 null）→ 新卡落到出纸口；修复后按模型坐标接续
    expect(anchor.x).toBe(0);
    expect(anchor.y).toBe(500);
    expect(anchor.h).toBe(160);   // 高度取自几何缓存
  });

  test('剔除后刷新徽标：序号未变则不写 DOM（卡片多时不再每帧 O(N) 写）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._notes = [
      { id: 'a', seq: 0, x: 0, y: 0 },
      { id: 'b', seq: 1, x: 0, y: 300 },
    ];
    const mkCard = (id) => {
      const el = document.createElement('div');
      el.className = 'tw-card';
      el.dataset.id = id;
      feature._canvas.appendChild(el);
      feature._mountedCards.set(id, el);
      return el;
    };
    const ea = mkCard('a');
    // culledFixture 把 _refreshWriteOrder 桩成了空函数，而本测试要验证的正是它 → 还原真身
    feature._refreshWriteOrder = () =>
      PersistenceCoordinator.refreshWriteOrder({ state: feature._state, ctrl: feature });
    feature._refreshWriteOrder();
    const badgeA = ea.querySelector('.tw-card-order');
    expect(badgeA.textContent).toBe('1');
    // 给徽标装一个写入探针：第二次刷新若序号未变，不应再写 textContent
    let writes = 0;
    Object.defineProperty(badgeA, 'textContent', {
      set() { writes++; }, get() { return '1'; }, configurable: true,
    });
    feature._refreshWriteOrder();          // 模拟剔除触发的重复刷新
    expect(writes).toBe(0);                // 修复点：未变则零写入
  });
});

describe('框选覆盖视口之外（离屏卡按需挂载并选中）', () => {
  test('selectInRect 选中离屏卡（不在 mountedCards，但在 spatial/noteIndex），挂载后进入 _selected', () => {
    const spatial = new global.SpatialIndex(512);
    const geo = new global.GeoCache();
    const mountedCards = new Map();
    const noteIndex = new Map();

    // 可见卡：已挂载
    const vis = document.createElement('div');
    vis.dataset.id = 'vis';
    vis.style.left = '10px'; vis.style.top = '10px';
    mountedCards.set('vis', vis);
    spatial.insert('vis', 10, 10, 200, 100);
    geo.set('vis', { x: 10, y: 10, w: 200, h: 100, rot: 0 });

    // 离屏卡：索引里有，但未挂载
    const OX = 5000, OY = 5000, OW = 200, OH = 100;
    spatial.insert('off', OX, OY, OW, OH);
    geo.set('off', { x: OX, y: OY, w: OW, h: OH, rot: 0 });
    noteIndex.set('off', { id: 'off', x: OX, y: OY, text: '离屏', level: 'p' });

    // 框选矩形覆盖两张卡（含视口外）
    const r = { x: 0, y: 0, w: OX + OW, h: OY + OH };

    const selected = new Set();
    let mountedOff = false;
    const ctrl = {
      _spatial: spatial,
      _mountedCards: mountedCards,
      _geo: geo,
      _selected: selected,
      _clearSelection() { selected.clear(); },
      _noteIndex() { return noteIndex; },
      _mountCard(note) {
        mountedOff = true;
        const el = document.createElement('div');
        el.dataset.id = note.id;
        el.style.left = note.x + 'px';
        el.style.top = note.y + 'px';
        mountedCards.set(note.id, el);
        geo.set(note.id, { x: note.x, y: note.y, w: OW, h: OH, rot: 0 });
        return el;
      },
      _updateSelBar() {},
    };

    global.CardInteractions.selectInRect({ state: {}, ctrl }, r);

    expect(mountedOff).toBe(true);                              // 离屏卡被按需挂载
    expect(mountedCards.has('off')).toBe(true);                 // 已进挂载表
    expect(selected.has(mountedCards.get('off'))).toBe(true);   // 已进入选中集
    expect(selected.has(vis)).toBe(true);                      // 可见卡照常选中
  });

  test('selectInRect 不选中矩形外的卡（即使它离屏且在索引里）', () => {
    const spatial = new global.SpatialIndex(512);
    const geo = new global.GeoCache();
    const mountedCards = new Map();
    const noteIndex = new Map();

    const OX = 5000, OY = 5000;
    spatial.insert('off', OX, OY, 200, 100);
    geo.set('off', { x: OX, y: OY, w: 200, h: 100, rot: 0 });
    noteIndex.set('off', { id: 'off', x: OX, y: OY, text: '离屏', level: 'p' });

    // 矩形只在可见区，够不到离屏卡
    const r = { x: 0, y: 0, w: 300, h: 300 };

    const selected = new Set();
    const ctrl = {
      _spatial: spatial, _mountedCards: mountedCards, _geo: geo, _selected: selected,
      _clearSelection() { selected.clear(); },
      _noteIndex() { return noteIndex; },
      _mountCard(note) {
        const el = document.createElement('div');
        el.dataset.id = note.id; el.style.left = note.x + 'px'; el.style.top = note.y + 'px';
        mountedCards.set(note.id, el); return el;
      },
      _updateSelBar() {},
    };

    global.CardInteractions.selectInRect({ state: {}, ctrl }, r);
    expect(selected.size).toBe(0);                  // 矩形外的离屏卡不应被挂载/选中
    expect(mountedCards.has('off')).toBe(false);
  });
});

describe('写作档不做视口剔除（根因：卡片 DOM 反复重建导致闪烁）', () => {
  // culledFixture 把 _scheduleCull 桩成了空函数（会让本组用例假绿）→ 还原真身
  const realCull = () => ViewportCuller.scheduleCull({ state: feature._state, ctrl: feature });

  test('写入档且规模在阈值内：不排剔除帧（卡片常驻，不再销毁重建）', () => {
    culledFixture();
    feature._scheduleCull = realCull;
    feature._mode = 'write';
    feature._notes = Array.from({ length: 20 }, (_, i) => ({ id: 'c' + i, seq: i, x: 0, y: i * 100 }));
    let raf = 0;
    global.requestAnimationFrame = () => { raf += 1; return raf; };
    feature._cullRaf = 0;
    feature._scheduleCull();
    expect(raf).toBe(0);            // 修复点：写作档不排帧
    expect(feature._cullRaf).toBe(0);
  });

  test('便签档仍照常剔除（不能误伤虚拟化本来的收益）', () => {
    culledFixture();
    feature._scheduleCull = realCull;
    feature._mode = 'notes';
    let raf = 0;
    global.requestAnimationFrame = () => { raf += 1; return raf; };
    feature._cullRaf = 0;
    feature._scheduleCull();
    expect(raf).toBe(1);            // 便签档保持原行为
  });

  test('写入档超阈值时回退剔除（安全兜底，防超长文档拖垮）', () => {
    culledFixture();
    feature._scheduleCull = realCull;
    feature._mode = 'write';
    feature._notes = Array.from({ length: 301 }, (_, i) => ({ id: 'c' + i, seq: i, x: 0, y: i * 100 }));
    let raf = 0;
    global.requestAnimationFrame = () => { raf += 1; return raf; };
    feature._cullRaf = 0;
    feature._scheduleCull();
    expect(raf).toBe(1);            // 超阈值 → 回退剔除
  });
});

describe('拖动画布不闪烁（每帧路径的两处治理）', () => {
  test('LOD 滞回：在屏卡数在阈值附近波动，dense 档位不翻转', () => {
    culledFixture();
    feature._lodDense = false;
    feature._lodDrag = false;
    feature._lodDragging = false;
    const mk = (n) => {
      const m = new Map();
      for (let i = 0; i < n; i += 1) m.set('n' + i, document.createElement('div'));
      return m;
    };
    const has = () => feature._canvas.classList.contains('tw-lod-dense');

    feature._mountedCards = mk(121);
    feature._applyLod();
    expect(has()).toBe(true);                 // 超 120 → 进入

    // 在 120/121 之间反复抖动（拖动画布时卡片进出视口的真实形态）
    feature._mountedCards = mk(118);
    feature._applyLod();
    expect(has()).toBe(true);                 // 滞回带内：保持（旧实现会翻回 false = 闪烁）
    feature._mountedCards = mk(121);
    feature._applyLod();
    expect(has()).toBe(true);

    // 掉到退出阈值以下才退出
    feature._mountedCards = mk(99);
    feature._applyLod();
    expect(has()).toBe(false);
  });

  test('徽标刷新完全幂等：值未变时零写入（含 disabled / _tipText）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._linkLayer = {
      makeLinkable: () => {}, watchSize: () => {}, highlightFor: () => {},
      clearControls: () => {}, render: () => {}, scheduleRender: () => {}, removeLinksOf: () => {},
    };
    feature._createCardEl = (note) => CardViewManager.createCardEl({ state: feature._state, ctrl: feature }, note);
    feature._notes = [
      { id: 'a', seq: 0, x: 0, y: 0 },
      { id: 'b', seq: 1, x: 0, y: 300 },
    ];
    ['a', 'b'].forEach((id) => {
      const card = feature._createCardEl({ id, font: 'classic', paper: 'plain', date: '', zoom: 1, fontScale: 1, level: 'p' });
      feature._canvas.appendChild(card);
      feature._mountedCards.set(id, card);
    });
    feature._refreshWriteOrder = () =>
      PersistenceCoordinator.refreshWriteOrder({ state: feature._state, ctrl: feature });
    feature._refreshWriteOrder();   // 首次：建徽标 + 写按钮态

    // 给两张卡的按钮装写入探针（disabled 是 accessor，用 defineProperty 计数）
    let writes = 0;
    ['a', 'b'].forEach((id) => {
      const card = feature._mountedCards.get(id);
      ['up', 'down'].forEach((d) => {
        const btn = card.querySelector('.tw-card-move-' + d);
        if (!btn) return;
        let v = btn.disabled;
        Object.defineProperty(btn, 'disabled', {
          get: () => v,
          set: (nv) => { writes += 1; v = nv; },
          configurable: true,
        });
      });
    });

    feature._refreshWriteOrder();   // 第二次：值未变
    expect(writes).toBe(0);         // 修复点：零写入（旧实现无条件全量写）
  });
});

describe('语义与呈现解耦：渲染路径不得触发顺序徽标刷新', () => {
  test('_scheduleRenderLinks 不再顺带刷新徽标（拖拽/尺寸变化的高频路径已解耦）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._linkLayer = { scheduleRender: () => {}, render: () => {}, makeLinkable: () => {}, watchSize: () => {} };
    let calls = 0;
    feature._refreshWriteOrder = () => { calls += 1; };
    // 模拟高频渲染入口被连打 10 次（拖拽 pointermove / 卡片 ResizeObserver 的真实频率）
    for (let i = 0; i < 10; i += 1) feature._scheduleRenderLinks();
    expect(calls).toBe(0);   // 修复点：语义不再被渲染拖着跑
  });

  test('顺序真变时仍会刷新徽标（加/删连线走显式调用，不依赖渲染路径）', () => {
    culledFixture();
    feature._mode = 'write';
    feature._links = [];
    feature._notes = [
      { id: 'a', seq: 0, x: 0, y: 0 },
      { id: 'b', seq: 1, x: 0, y: 100 },
    ];
    let calls = 0;
    feature._refreshWriteOrder = () => { calls += 1; };
    feature._addLink('b', 'a');          // 连线定序 → 顺序真变
    expect(calls).toBeGreaterThan(0);
  });
});

describe('P4 写入档画布降级为纯视图（禁用旋转 / 纸样 / 吐纸错位）', () => {
  const mkCard = (mode) => {
    culledFixture();
    feature._mode = mode;
    // 建卡会用到连线层（_makeLinkable / _watchCardSize），本 fixture 无真实 LinkLayer，桩掉
    feature._linkLayer = {
      makeLinkable: () => {}, watchSize: () => {}, highlightFor: () => {},
      clearControls: () => {}, render: () => {}, scheduleRender: () => {}, removeLinksOf: () => {},
    };
    // 直接调真实模块方法：本文件前面有用例把 feature._createCardEl 换成了桩（单例污染会延续到后面）
    return CardViewManager.createCardEl(
      { state: feature._state, ctrl: feature },
      { id: 'x', font: 'classic', paper: 'plain', date: '', zoom: 1, fontScale: 1, rot: 30, level: 'p' }
    );
  };

  test('写入档：不建旋转手柄、角度归零、纸样钮隐藏', () => {
    const card = mkCard('write');
    expect(card.querySelector('.tw-card-rotate')).toBeNull();     // 无旋转手柄
    expect(Number(card.dataset.rot || 0)).toBe(0);                 // 文章里没有斜放的段落
    const pb = card.querySelector('.tw-card-paper');
    expect(pb).not.toBeNull();
    expect(pb.hidden).toBe(true);                                  // 纸样钮隐藏（非删除，模型值保留）
  });

  test('便签档不受影响：旋转手柄仍在、纸样钮可见（防止过度禁用）', () => {
    const card = mkCard('notes');
    expect(card.querySelector('.tw-card-rotate')).not.toBeNull();
    const pb = card.querySelector('.tw-card-paper');
    expect(pb && pb.hidden).toBe(false);
  });

  test('只关呈现不动模型：写入档渲染归零，但 note.rot / note.paper 原值保留', () => {
    culledFixture();
    feature._mode = 'write';
    feature._linkLayer = {
      makeLinkable: () => {}, watchSize: () => {}, highlightFor: () => {},
      clearControls: () => {}, render: () => {}, scheduleRender: () => {}, removeLinksOf: () => {},
    };
    // 模型里这张卡是「旋转 30° + 夜航纸」
    const note = { id: 'x', x: 0, y: 0, text: 't', rot: 30, paper: 'night' };
    feature._notes = [note];                 // 模型由调用方维护（_mountCard 只建 DOM）
    const card = feature._mountCard(note);
    expect(Number(card.dataset.rot || 0)).toBe(0);        // 呈现：归零
    const inModel = feature._notes.find((n) => n.id === 'x');
    expect(inModel.rot).toBe(30);                          // 模型：原值未被动
    expect(inModel.paper).toBe('night');
  });
});

describe('切档空窗期不得露出上一份文档的旧卡（修复：导图→卡片档闪档）', () => {
  test('_loadDoc 被同步调用时画布已清空（异步载入期间不闪旧档卡片）', async () => {
    // 现场：当前在导图档，画布里残留着「上一次载入的写作档」卡片（含 .tw-card-order 顺序徽标）
    culledFixture();
    const mmPrev = global.MindmapFeature;
    global.MindmapFeature = {
      isActive: () => false, stats: () => ({ count: 0, links: 0 }),
      deactivate: () => {}, activate: () => {},
    };

    feature._mode = 'mindmap';
    feature._canvas.hidden = true;
    // 造两张写作档旧卡（带 .tw-card-order 徽标 = 写作模式专属 DOM，视觉上就是「闪回写作模式」的来源）
    ['w1', 'w2'].forEach((id) => {
      const card = document.createElement('div');
      card.className = 'tw-card';
      card.dataset.id = id;
      const badge = document.createElement('span');
      badge.className = 'tw-card-order';
      card.appendChild(badge);
      feature._canvas.appendChild(card);
      feature._mountedCards.set(id, card);
    });
    expect(feature._canvas.querySelectorAll('.tw-card').length).toBe(2);   // 前置：确实有残留旧卡

    // 桩掉切档流程里与本次断言无关的副作用
    feature._ensureAudio = () => {};
    feature._playGearSound = () => {};
    feature._persistDoc = async () => {};
    feature._exitAllEdits = () => {};
    feature._clearSelection = () => {};
    feature._applyModeChrome = jest.fn();
    feature._scheduleRenderLinks = () => {};
    feature._showScreenMsg = () => {};
    feature._switching = false;
    feature._undoStack = null;

    // 关键探针：_loadDoc 被同步调用的那一刻（= 异步空窗期开始）画布上还剩几张卡
    let cardsAtLoadTime = -1;
    let chromeCallsAtLoad = -1;
    feature._loadDoc = jest.fn(async () => {
      cardsAtLoadTime = feature._canvas.querySelectorAll('.tw-card').length;
      chromeCallsAtLoad = feature._applyModeChrome.mock.calls.length;
    });

    try {
      await feature._setMode('notes');
    } finally {
      global.MindmapFeature = mmPrev;
    }

    expect(feature._loadDoc).toHaveBeenCalledWith('notes');
    // 修复点：载入前已清空 → 空窗期露的是空画布，而不是上一份文档（写作档）的卡片
    expect(cardsAtLoadTime).toBe(0);
    // 增益：语义在 await 之前已换过一次（不再出现「导图外壳 + 空画布」），载入后再刷一次取新文档真值
    expect(chromeCallsAtLoad).toBe(1);
    expect(feature._applyModeChrome.mock.calls.length).toBe(2);
  });

  test('切档窗口内剔除不得按旧模型把上一份文档的卡回填', async () => {
    culledFixture();
    const mmPrev = global.MindmapFeature;
    global.MindmapFeature = {
      isActive: () => false, stats: () => ({ count: 0, links: 0 }),
      deactivate: () => {}, activate: () => {},
    };
    feature._mode = 'mindmap';
    feature._canvas.hidden = true;
    // 卡片创建会用到连线层（_makeLinkable / _watchCardSize），本 fixture 无真实 LinkLayer，桩掉以便挂卡能走完
    feature._linkLayer = {
      makeLinkable: () => {}, watchSize: () => {}, highlightFor: () => {},
      clearControls: () => {}, render: () => {}, scheduleRender: () => {}, removeLinksOf: () => {},
    };
    // 画布必须可测量：jsdom 默认 rect 全 0，会让 _buildCards / updateCulling 提前 return
    feature._canvas.getBoundingClientRect = () => ({
      width: 800, height: 600, left: 0, top: 0, right: 800, bottom: 600,
    });
    feature._restored = true;
    // 上一份载入的文档 = 写作档（真实闪现的场景：便签→写作→导图→便签）
    feature._notes = [
      { id: 'w1', x: 0, y: 0, text: '写作档甲', level: 'h2' },
      { id: 'w2', x: 0, y: 300, text: '写作档乙', level: 'ol' },
    ];
    feature._seedSpatial();          // 空间索引同样是写作档的（_buildCards([]) 不清它）
    feature._notes.forEach((n) => {
      const card = document.createElement('div');
      card.className = 'tw-card';
      card.dataset.id = n.id;
      feature._canvas.appendChild(card);
      feature._mountedCards.set(n.id, card);
    });
    feature._ensureAudio = () => {};
    feature._playGearSound = () => {};
    feature._persistDoc = async () => {};
    feature._exitAllEdits = () => {};
    feature._clearSelection = () => {};
    feature._applyModeChrome = () => {};
    feature._scheduleRenderLinks = () => {};
    feature._showScreenMsg = () => {};
    feature._switching = false;
    feature._undoStack = null;

    let cardsAfterCull = -1;
    feature._loadDoc = jest.fn(async () => {
      // 复现真实触发源：画布 hidden→可见使尺寸 0→非零，观察到画布的 ResizeObserver(_cullRo)
      // → _scheduleCull → rAF 恰在 await 期间到点，执行 _updateCulling 并按旧模型尝试挂卡
      feature._updateCulling();
      cardsAfterCull = feature._canvas.querySelectorAll('.tw-card').length;
    });

    try { await feature._setMode('notes'); } finally { global.MindmapFeature = mmPrev; }
    // 修复点：_switching 窗口内禁止重挂载 → 画布保持空，不会闪出上一份文档(写作档)的卡片
    expect(cardsAfterCull).toBe(0);
  });

  test('空窗期不得残留上一份文档的连线层（连接线/端点圆点/箭头等小元件）', async () => {
    culledFixture();
    const mmPrev = global.MindmapFeature;
    global.MindmapFeature = {
      isActive: () => false, stats: () => ({ count: 0, links: 0 }),
      deactivate: () => {}, activate: () => {},
    };
    feature._mode = 'mindmap';
    feature._canvas.hidden = true;
    feature._linkLayer = { clearControls: () => {}, render: () => {}, scheduleRender: () => {} };
    // 上一份文档留在画布里的连线层：_buildCards 只清 .tw-card，够不到这个 SVG
    const SVGNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'tw-links');
    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('class', 'tw-link');
    svg.appendChild(path);
    feature._canvas.appendChild(svg);
    feature._ensureAudio = () => {};
    feature._playGearSound = () => {};
    feature._persistDoc = async () => {};
    feature._exitAllEdits = () => {};
    feature._clearSelection = () => {};
    feature._applyModeChrome = () => {};
    feature._scheduleRenderLinks = () => {};
    feature._showScreenMsg = () => {};
    feature._switching = false;
    feature._undoStack = null;

    let svgAtLoad = -1;
    feature._loadDoc = jest.fn(async () => {
      svgAtLoad = feature._canvas.querySelectorAll('svg').length;
    });
    try { await feature._setMode('notes'); } finally { global.MindmapFeature = mmPrev; }
    // 修复点：载入前连线层已摘掉 → 不会闪出上一份文档的连线/圆点/箭头
    expect(svgAtLoad).toBe(0);
  });
});
