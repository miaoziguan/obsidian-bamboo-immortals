/**
 * @jest-environment jsdom
 */
// 模拟数据压测（千级便签 + 连续平移）：量化「每步挂载次数 / 单次卡片 DOM 构建成本」，
// 用作「DOM 卡节点池化值不值得做」的判据 —— 用数据代替印象。
// 【只断言算法量】次数/比例是确定性的、CI 安全；绝对耗时随机器波动，只打印不断言。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };

const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.WritingDoc = WritingDoc;
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

const N = 1000;      // 模拟便签总数
const COLS = 40;     // 网格列数 → 卡间距 400×300 px
const VW = 800, VH = 600;
const MARGIN = 240;  // 与线上一致的剔除预取边距
const STEPS = 40;    // 连续平移步数

function stressSetup() {
  document.body.innerHTML = '';
  const canvas = document.createElement('div');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: VW, height: VH });
  document.body.appendChild(canvas);
  feature._canvas = canvas;
  feature._el = document.createElement('div');
  feature._restored = true;
  feature._mountedCards = new Map();
  feature._geo = new GeoCache();
  feature._spatial = new SpatialIndex(512);
  feature._CULL_MARGIN = MARGIN;
  feature._zTop = 0;
  feature._notes = [];
  for (let i = 0; i < N; i++) {
    feature._notes.push({
      id: 'n' + i,
      x: (i % COLS) * 400,
      y: Math.floor(i / COLS) * 300,
      text: '压测便签 ' + i,
      level: 'p', paper: 'plain', zoom: 1, fontScale: 1, rot: 0, font: '', date: '',
    });
  }
  feature._seedSpatial();   // 按模型坐标入格，压测无需真建上千 DOM
  feature._scheduleRenderLinks = () => {};
  feature._scheduleSave = () => {};
  feature._refreshWriteOrder = () => {};
  // 压测不关心连线渲染：万能 no-op 桩（Proxy 兜住所有方法，不必逐个补全）
  feature._linkLayer = new Proxy({}, { get: () => () => {} });
  feature._setPerf(true);
  feature._perfReset();
}

test('千级卡片连续平移压测：剔除后的挂载量 / 剔除耗时', () => {
  stressSetup();
  const t0 = Date.now();
  for (let s = 0; s < STEPS; s++) {
    feature._canvasOffset = { x: -s * 200, y: -s * 150 };
    feature._updateCulling();
  }
  const elapsed = Date.now() - t0;
  const r = feature._perfReport();
  const mount = r.mount || { n: 0, avg: 0, max: 0, total: 0 };
  const cull = r.cull || { n: 0, avg: 0, max: 0, total: 0 };
  // eslint-disable-next-line no-console
  console.log('[STRESS] ' + JSON.stringify({
    notes: N, steps: STEPS, viewport: `${VW}x${VH}`, margin: MARGIN,
    elapsedMs: elapsed,
    mount, cull,
    mountPerStep: +(mount.n / STEPS).toFixed(2),
    mountedNow: feature._mountedCards.size,
    domCardsNow: feature._canvas.querySelectorAll('.tw-card').length,
  }));

  // 算法量断言（确定性）：每步都跑了一次剔除；在屏卡数被压到远小于总量
  expect(cull.n).toBe(STEPS);
  expect(feature._mountedCards.size).toBeLessThan(N * 0.1);
  expect(mount.n).toBeGreaterThan(0);
});

test('单卡 DOM 构建成本（池化的理论收益上限）', () => {
  stressSetup();
  const K = 50;
  const t0 = Date.now();
  for (let i = 0; i < K; i++) {
    const el = feature._createCardEl({
      id: 'z' + i, font: '', paper: 'plain', date: '',
      zoom: 1, fontScale: 1, rot: 0, level: 'p',
    });
    document.body.appendChild(el);
  }
  const avg = (Date.now() - t0) / K;
  // eslint-disable-next-line no-console
  console.log('[CARD-BUILD] ' + JSON.stringify({ n: K, avgMs: +avg.toFixed(3) }));
  expect(avg).toBeGreaterThanOrEqual(0);
});
