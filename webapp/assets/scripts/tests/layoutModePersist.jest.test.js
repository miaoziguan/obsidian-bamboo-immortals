/**
 * @jest-environment jsdom
 */
// 布局模式跨重启持久化回归测试
//
// 背景：进入多列模式时把 layoutMode 写入 settings，init() 启动时回读恢复。
// 陷阱：宿主侧 pendingLayoutMode 在「横向→看板」手动切换时不会更新（仍停留 'horizontal'），
//   且重启后 Obsidian 视图状态带回该 stale 值。若拿它当恢复模式，看板会被错误恢复成横向
//   ——而横向因两端一致「看似」持久化，看板则丢失。
// 契约：settings.layoutMode 是权威恢复来源；pending 仅在 settings 为空时兜底。
const { loadModule } = require('./__helpers__/testUtils');

/**
 * 搭建一次「webapp 启动」场景。
 * @param {string|null} persisted  settings.layoutMode 的持久化值
 * @param {string|null} pending    宿主 app:ready 带回的 pendingLayoutMode（重启时可能为 stale）
 * @param {boolean}     isMainLeaf 视图是否已在主工作区（中央）
 */
function setup({ persisted, pending, isMainLeaf = true }) {
  document.body.innerHTML = `
    <div id="reviewContainer">
      <div id="sectionsContainer">
        <div class="section">a</div>
        <div class="section">b</div>
        <div class="section">c</div>
      </div>
    </div>
  `;

  global.byId = (id) => document.getElementById(id);
  // 屏蔽底部 IIFE 的 setTimeout 兜底分支（本测试显式调 init）
  global.EventBus = { on: () => {} };
  global.requestAnimationFrame = (cb) => { cb(); return 0; };
  global.window.__bambooIsMobile = false;          // 桌面端：允许多列
  global.window.__bambooIsMainLeaf = isMainLeaf;
  global.window.__bambooPendingLayoutMode = pending;
  global.Toast = { showToast: () => {} };
  global.SectionRegistry = { getVisible: () => Array.from(document.querySelectorAll('.section')) };
  global.DisplayManager = {
    _currentWidth: 1200,
    DEFAULT_WIDTH: 800,
    _applyWidth: () => {},
    _applyResponsiveClasses: () => {},
  };
  global.storageManager = {
    getSetting: async (key) => (key === 'layoutMode' ? persisted : null),
    putSetting: () => {},
    moveToCenter: () => {},
    collapseRightSidebar: () => {},
  };

  const { LayoutMode } = loadModule('modules/layout/layoutMode.js', ['LayoutMode']);
  // 每个用例从「冷启动」状态开始
  LayoutMode._mode = 'none';
  LayoutMode._restoring = false;
  LayoutMode._collapsedRightSidebar = false;
  LayoutMode._justEntered = false;
  LayoutMode._resizeGuardBound = false;
  return LayoutMode;
}

test('重启恢复：settings=kanban 且宿主 pending 为空 → 恢复为看板', async () => {
  const LM = setup({ persisted: 'kanban', pending: null });
  await LM.init();
  expect(LM._mode).toBe('kanban');
});

test('重启恢复：settings=kanban 且宿主 pending 为 stale 的 horizontal → 仍恢复为看板（不被降级成横向）', async () => {
  const LM = setup({ persisted: 'kanban', pending: 'horizontal' });
  await LM.init();
  expect(LM._mode).toBe('kanban');
});

test('重启恢复：settings=horizontal → 恢复为横向', async () => {
  const LM = setup({ persisted: 'horizontal', pending: 'horizontal' });
  await LM.init();
  expect(LM._mode).toBe('horizontal');
});

test('重启恢复：无持久化（上次为纵向）→ 不进入多列', async () => {
  const LM = setup({ persisted: null, pending: null });
  await LM.init();
  expect(LM._mode).toBe('none');
});

test('渲染后 reflow() 按实际板块数重算看板列数（init 时板块为 0 不许退化成 1 列）', async () => {
  // 真实时序：init() 恢复看板时板块尚未渲染（visibleCount=0），
  // 渲染系统随后渲染板块并调 reflow()（renderScheduler 行为）。
  // 若 reflow 沿用 init 时算出的 _columns=1，3 个板块会被塞进 1 列 → 视觉等同纵向。
  document.body.innerHTML = `
    <div id="reviewContainer">
      <div id="sectionsContainer"></div>
    </div>
  `;
  global.byId = (id) => document.getElementById(id);
  global.EventBus = { on: () => {} };
  global.requestAnimationFrame = (cb) => { cb(); return 0; };
  global.window.__bambooIsMobile = false;
  global.window.__bambooIsMainLeaf = true;
  global.window.__bambooPendingLayoutMode = null;
  global.Toast = { showToast: () => {} };
  global.SectionRegistry = { getVisible: () => [] };   // 尚未渲染
  global.DisplayManager = {
    _currentWidth: 1200, DEFAULT_WIDTH: 800,
    _applyWidth: () => {}, _applyResponsiveClasses: () => {},
  };
  global.storageManager = {
    getSetting: async (key) => (key === 'layoutMode' ? 'kanban' : null),
    putSetting: () => {}, moveToCenter: () => {}, collapseRightSidebar: () => {},
  };

  const { LayoutMode } = loadModule('modules/layout/layoutMode.js', ['LayoutMode']);
  LayoutMode._mode = 'none';
  LayoutMode._columns = 2;
  LayoutMode._restoring = false;
  LayoutMode._collapsedRightSidebar = false;
  LayoutMode._justEntered = false;
  LayoutMode._resizeGuardBound = false;

  await LayoutMode.init();
  expect(LayoutMode._mode).toBe('kanban');   // 模式已恢复

  // 渲染系统渲染出 3 个板块 → reflow()
  const sc = document.getElementById('sectionsContainer');
  sc.innerHTML = '<div class="section">a</div><div class="section">b</div><div class="section">c</div>';
  LayoutMode.reflow();

  expect(LayoutMode.getColumns()).toBe(3);                                  // 列数按实际板块数重算
  expect(sc.querySelectorAll('.layout-col.kanban-col').length).toBe(3);      // 每板块独占一列
});
