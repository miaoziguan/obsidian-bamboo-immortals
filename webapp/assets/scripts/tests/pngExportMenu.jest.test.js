/**
 * @jest-environment jsdom
 *
 * 便签 PNG 导出方式菜单（三项）回归锁：
 *  1) 三项动作齐全且互斥，菜单挂在功能根上而非 hover 工具条内；
 *  2) 「默认」标注来自原生设置（同步快照打底 + 异步校正）；
 *  3) 点选项把动作原样交给 _exportCardPng 并收起菜单；
 *  4) Esc / 点外部收起（Shadow DOM 场景用 composedPath 判定）。
 *
 * 历史缺陷：旧实现点一下无条件「落盘 + 复制」，用户既躲不开多余文件，
 * 也会丢掉剪贴板里原有的文字。
 */
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []); // 副作用：共享常量挂到 globalThis
const { CardViewManager } = loadModule('handlers/features/CardViewManager.js', ['CardViewManager']);

function makeHarness(syncAct = 'save', asyncAct = syncAct) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  window.SettingsModal = { pngExportFolder: '便签', pngExportAction: 'both' };
  window.storageManager = {
    getExportActionSync: jest.fn(() => syncAct),
    getExportAction: jest.fn(async () => asyncAct),
    getExportFolder: jest.fn(async () => '画中卷/便签图片'),
  };
  const ctx = { state: {}, ctrl: null };
  const ctrl = {
    _el: root,
    _exportCardPng: jest.fn(),
    _ensurePngMenu: () => CardViewManager.ensurePngMenu(ctx),
    _markPngDefault: (a) => CardViewManager.markPngDefault(ctx, a),
    _updatePngFolder: () => CardViewManager.updatePngFolder(ctx),
    _showPngMenu: (card, btn) => CardViewManager.showPngMenu(ctx, card, btn),
    _hidePngMenu: () => CardViewManager.hidePngMenu(ctx),
    _isInPngMenu: (ev) => CardViewManager.isInPngMenu(ctx, ev),
  };
  ctx.ctrl = ctrl;
  const card = document.createElement('div');
  card.className = 'tw-card';
  root.appendChild(card);
  const btn = document.createElement('button');
  btn.className = 'tw-card-export-png';
  root.appendChild(btn);
  return { ctx, ctrl, root, card, btn };
}

afterEach(() => {
  document.body.innerHTML = '';
});

test('菜单三项齐全、初始隐藏，且挂在功能根元素上', () => {
  const { ctrl, root } = makeHarness();
  ctrl._ensurePngMenu();
  const menu = ctrl._pngMenu;
  expect(menu.parentElement).toBe(root);
  expect(menu.hidden).toBe(true);
  expect(Array.from(menu.querySelectorAll('[data-png-act]')).map((b) => b.dataset.pngAct))
    .toEqual(['save', 'copy', 'both']);
  expect(menu.querySelector('[data-png-act="save"] .tw-png-menu-label').textContent).toBe('导出到指定位置');
  expect(menu.querySelector('[data-png-act="copy"] .tw-png-menu-label').textContent).toBe('复制 PNG 到剪贴板');
});

test('打开时按同步快照标注默认项，目录子标题异步显示真实目录', async () => {
  const h = makeHarness('save');
  h.ctrl._showPngMenu(h.card, h.btn);
  const menu = h.ctrl._pngMenu;
  expect(menu.hidden).toBe(false);
  expect(menu.querySelector('.tw-png-menu-item.is-default').dataset.pngAct).toBe('save');
  expect(Array.from(menu.querySelectorAll('.tw-png-menu-default')).filter((b) => !b.hidden)).toHaveLength(1);
  await new Promise((r) => setTimeout(r, 0));
  expect(menu.querySelector('.tw-png-menu-sub').textContent).toContain('画中卷/便签图片');
  h.ctrl._hidePngMenu();
});

test('原生设置在握手后被改动 → 异步校正默认标注', async () => {
  const h = makeHarness('save', 'copy');
  h.ctrl._showPngMenu(h.card, h.btn);
  expect(h.ctrl._pngMenu.querySelector('.is-default').dataset.pngAct).toBe('save');
  await new Promise((r) => setTimeout(r, 0));
  expect(h.ctrl._pngMenu.querySelector('.is-default').dataset.pngAct).toBe('copy');
  h.ctrl._hidePngMenu();
});

test('点选项把动作原样交给 _exportCardPng，并立即收起菜单', () => {
  const h = makeHarness();
  h.ctrl._showPngMenu(h.card, h.btn);
  h.ctrl._pngMenu.querySelector('[data-png-act="copy"]').click();
  expect(h.ctrl._exportCardPng).toHaveBeenCalledWith(h.card, 'copy');
  expect(h.ctrl._pngMenu.hidden).toBe(true);
  expect(h.ctrl._pngMenuCard).toBe(null);
});

test('Esc 与点击外部都能收起菜单', () => {
  const h = makeHarness();
  h.ctrl._showPngMenu(h.card, h.btn);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(h.ctrl._pngMenu.hidden).toBe(true);

  h.ctrl._showPngMenu(h.card, h.btn);
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  expect(h.ctrl._pngMenu.hidden).toBe(true);
});

test('点在触发按钮上不算外部点击（交给按钮自己 toggle）', () => {
  const h = makeHarness();
  h.ctrl._showPngMenu(h.card, h.btn);
  expect(h.ctrl._isInPngMenu({ composedPath: () => [h.btn, h.root] })).toBe(true);
  h.ctrl._hidePngMenu();
});
