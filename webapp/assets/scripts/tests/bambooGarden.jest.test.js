const { loadModule } = require('./__helpers__/testUtils.js');

// 竹林模块此前有两处 document 级监听泄漏：
//  ① 调试 HUD 的 5 个监听（keydown/touchstart/touchmove/touchend/contextmenu）从不移除；
//  ② 切走竹林主题时 themes.bamboo 没有 destroy()，BambooGarden 的落叶 interval / 监听在
//     已脱离文档的 DOM 上继续跑。
// 本测试在 jsdom 下追踪 document 监听的增减，锁定「init 必须成对 removeEventListener」。

jest.useFakeTimers();

const { BambooGarden } = loadModule('modules/bamboo-garden.js', ['BambooGarden'], {
  // byId 一律返回 null → 多数 DOM 分支 early-return，聚焦监听增减；
  // getStyleMount 返回 document.head（仅叶子 keyframes 注入用到，不影响监听计数）；
  // num 是被剥离 import 后必须由全局补回的纯函数。
  byId: () => null,
  getStyleMount: () => document.head,
  num: (x) => x,
});

// 只包裹一次真实监听，避免 beforeEach 重复包裹导致计数翻倍（这是上一版测试失败的根因）。
const realAdd = document.addEventListener.bind(document);
const realRemove = document.removeEventListener.bind(document);
let counts;
function installTracking() {
  counts = {};
  document.addEventListener = (type, cb, opt) => { counts[type] = (counts[type] || 0) + 1; return realAdd(type, cb, opt); };
  document.removeEventListener = (type, cb, opt) => { counts[type] = (counts[type] || 0) - 1; return realRemove(type, cb, opt); };
}
function uninstallTracking() {
  document.addEventListener = realAdd;
  document.removeEventListener = realRemove;
}

beforeEach(() => { installTracking(); });
afterEach(() => { jest.clearAllTimers(); uninstallTracking(); });

const HUD_TYPES = ['keydown', 'touchstart', 'touchmove', 'touchend', 'contextmenu'];

test('init 挂 5 个 HUD 监听 + visibilitychange；destroy 全部移除', () => {
  BambooGarden.init();
  HUD_TYPES.forEach((t) => expect(counts[t]).toBe(1));
  expect(counts['visibilitychange']).toBe(1);

  BambooGarden.destroy();
  HUD_TYPES.forEach((t) => expect(counts[t]).toBe(0));
  expect(counts['visibilitychange']).toBe(0);
});

test('反复 init/destroy 不累加监听（每次主题切换的净增量恒为 0）', () => {
  for (let i = 0; i < 3; i++) { BambooGarden.init(); BambooGarden.destroy(); }
  HUD_TYPES.forEach((t) => expect(counts[t]).toBe(0));

  // 再来一次 init，应仍是 1 而非 3（证明没有泄漏累积）
  BambooGarden.init();
  HUD_TYPES.forEach((t) => expect(counts[t]).toBe(1));
  BambooGarden.destroy();
  HUD_TYPES.forEach((t) => expect(counts[t]).toBe(0));
});

test('destroy 清掉落叶 setInterval（切走竹林主题时 themes.bamboo.destroy 即走此路径）', () => {
  BambooGarden.init();
  expect(BambooGarden._leafIntervalId).not.toBeNull();
  BambooGarden.destroy();
  expect(BambooGarden._leafIntervalId).toBeNull();
});
