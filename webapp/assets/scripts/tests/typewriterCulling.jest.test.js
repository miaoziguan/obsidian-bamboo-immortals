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
// feature 是模块单例，帧预算用例会把 _applyZoom 换成 jest.fn()。几何用例要调真方法，
// 故在此存一份真身供其还原（否则打不上失效标记，且会误判为「已合帧」）。
const REAL_APPLY_ZOOM = feature._applyZoom;

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
  feature._geo = new Map();
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
    feature._geoDirty = null;
    feature._geoFlushRaf = 0;
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
    expect(feature._geoDirty.has('a')).toBe(true);
    expect(feature._geoDirty.has('b')).toBe(true);
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
    feature._geoDirty = new Set(['a']);
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
