/**
 * @jest-environment jsdom
 */
/**
 * 数字徽章「一键显示 / 隐藏」开关回归锁（2026-11-14 用户要求加在缩放条上）。
 *
 * 设计要点：
 *  · 开关只切画布 class（纯 CSS 隐藏），不增删徽章 DOM、不碰序号逻辑 —— 关掉再开无损；
 *  · 与「层级配色」开关同一套协议：adapter 回调决定生成按钮、sync 点亮 .active、设置通道持久化；
 *  · 只在写作档露出（.tw-card-order 是写作档专属）；
 *  · 默认显示，只有显式 false 才隐藏，重启后读回用户选择。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');
const MODE_CTRL_JS = fs.readFileSync(
  path.join(__dirname, '../handlers/features/ModeController.js'), 'utf8'
);

describe('缩放条：数字徽章开关按钮', () => {
  global.CanvasViewport = { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 };
  const { CanvasZoomUI } = loadModule('services/CanvasZoomUI.js', ['CanvasZoomUI']);
  const mkAdapter = (extra) => Object.assign({
    getCanvas: () => null,
    getView: () => ({ x: 0, y: 0, scale: 1 }),
    setView: () => {}, zoomAtCenter: () => {}, reset: () => {}, fit: () => {},
  }, extra);

  afterEach(() => { document.body.innerHTML = ''; });

  test('传了 onToggleOrderBadges 才生成按钮，点击触发回调', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const onToggleOrderBadges = jest.fn();
    CanvasZoomUI.mount(host, mkAdapter({
      onToggleOrderBadges,
      isOrderBadgesVisible: () => true,
      onLinkToggle: () => {}, isLinked: () => false,
      onSearch: () => {},
    }));
    const btn = host.querySelector('[data-act="order-badges"]');
    expect(btn).toBeTruthy();
    btn.click();
    expect(onToggleOrderBadges).toHaveBeenCalledTimes(1);
  });

  test('未传回调的档位（导图）不生成按钮', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    CanvasZoomUI.mount(host, mkAdapter());
    expect(host.querySelector('[data-act="order-badges"]')).toBeNull();
  });

  test('结构类开关聚在一起：连线 → 数字徽章 → 搜索', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    CanvasZoomUI.mount(host, mkAdapter({
      onLinkToggle: () => {}, isLinked: () => false,
      onToggleOrderBadges: () => {}, isOrderBadgesVisible: () => true,
      onSearch: () => {},
    }));
    const acts = Array.from(host.querySelector('.tw-zoom-bar').querySelectorAll('button'))
      .map((b) => b.dataset.act);
    expect(acts.indexOf('order-badges')).toBe(acts.indexOf('link-toggle') + 1);
    expect(acts.indexOf('search')).toBe(acts.indexOf('order-badges') + 1);
  });

  test('sync 按 isOrderBadgesVisible 切高亮、aria-label 与 title', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    let shown = true;
    const ui = CanvasZoomUI.mount(host, mkAdapter({
      onToggleOrderBadges: () => {},
      isOrderBadgesVisible: () => shown,
    }));
    const btn = host.querySelector('.tw-zoom-order');
    expect(btn.classList.contains('active')).toBe(true);
    expect(btn.getAttribute('aria-label')).toBe('隐藏数字徽章');

    shown = false;
    ui.sync();
    expect(btn.classList.contains('active')).toBe(false);
    expect(btn.getAttribute('aria-label')).toBe('显示数字徽章');
    expect(btn.title).toContain('已隐藏');
  });
});

describe('TypewriterFeature：开关状态 / 呈现 / 持久化', () => {
  loadModule('handlers/features/twConfig.js', []);
  const { TypewriterFeature: Tw } = loadModule(
    'handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
      FONTS: ['modern'], PAPERS: ['plain'], MARKET_FONTS: [],
      Toast: { showToast: jest.fn() },
      ViewportCuller: { setGeom: jest.fn(), removeGeom: jest.fn() },
      CanvasViewport: { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 },
      MindmapFeature: { teardown: jest.fn() },
      TypewriterStore: { invalidateWritingIndex: jest.fn() },
      MaterialMarket: { toggle: jest.fn() },
    }
  );

  let sm;
  beforeEach(() => {
    Tw._resetState();
    Tw._canvas = document.createElement('div');
    Tw._zoomUI = { sync: jest.fn() };
    Tw._showScreenMsg = jest.fn();
    sm = {
      putSetting: jest.fn().mockResolvedValue(undefined),
      getSetting: jest.fn().mockResolvedValue(undefined),
    };
    window.storageManager = sm;
  });
  afterEach(() => { delete window.storageManager; });

  test('默认显示；关一次加 class 并写 false，再开一次移除并写 true', () => {
    expect(Tw._orderBadges).toBe(true);
    expect(Tw._canvas.classList.contains('tw-hide-order-badges')).toBe(false);

    Tw._toggleOrderBadges();
    expect(Tw._canvas.classList.contains('tw-hide-order-badges')).toBe(true);
    expect(sm.putSetting).toHaveBeenCalledWith('typewriter:orderBadges', false);
    expect(Tw._showScreenMsg).toHaveBeenCalledWith('数字徽章：已隐藏', 1200);

    Tw._toggleOrderBadges();
    expect(Tw._canvas.classList.contains('tw-hide-order-badges')).toBe(false);
    expect(sm.putSetting).toHaveBeenLastCalledWith('typewriter:orderBadges', true);
  });

  test('读回：显式 false 才隐藏；读不到设置保持显示', async () => {
    sm.getSetting.mockResolvedValueOnce(false);
    await Tw._loadOrderBadges();
    expect(Tw._canvas.classList.contains('tw-hide-order-badges')).toBe(true);
    expect(Tw._zoomUI.sync).toHaveBeenCalled();

    sm.getSetting.mockResolvedValueOnce(undefined);
    await Tw._loadOrderBadges();
    expect(Tw._canvas.classList.contains('tw-hide-order-badges')).toBe(false);
  });

  test('读设置失败静默：沿用默认显示，不抛异常', async () => {
    sm.getSetting.mockRejectedValueOnce(new Error('桥超时'));
    await expect(Tw._loadOrderBadges()).resolves.toBeUndefined();
    expect(Tw._orderBadges).toBe(true);
  });

  test('_applyOrderBadges 幂等，且不改徽章 DOM', () => {
    const badge = document.createElement('span');
    badge.className = 'tw-card-order';
    badge.textContent = '3';
    Tw._canvas.appendChild(badge);
    Tw._orderBadges = false;
    Tw._applyOrderBadges();
    Tw._applyOrderBadges();
    expect(Tw._canvas.querySelectorAll('.tw-card-order').length).toBe(1);
    expect(badge.textContent).toBe('3');
    expect(Tw._canvas.classList.contains('tw-hide-order-badges')).toBe(true);
  });
});

describe('CSS / 档位显隐契约', () => {
  test('隐藏规则特异性压过写作档徽章定位规则', () => {
    expect(NOTES_CSS).toMatch(
      /\.tw-canvas\.tw-mode-write\.tw-hide-order-badges \.tw-card-order \{[^}]*display:\s*none/
    );
  });
  test('缩放条按钮支持 [hidden] 与两态图标', () => {
    expect(NOTES_CSS).toMatch(/\.tw-zoom-bar \.tw-zoom-order\[hidden\] \{[^}]*display:\s*none/);
    expect(NOTES_CSS).toMatch(/\.tw-zoom-order:not\(\.active\) \.tw-zoom-icon-order-off/);
  });
  test('applyModeChrome 只在写作档露出按钮', () => {
    expect(MODE_CTRL_JS).toMatch(/querySelector\('\.tw-zoom-order'\)/);
    expect(MODE_CTRL_JS).toMatch(/orderBadgeBtn\.hidden = P\.id !== 'write'/);
  });
});
