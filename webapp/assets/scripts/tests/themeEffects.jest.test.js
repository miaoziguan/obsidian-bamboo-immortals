const { loadModule } = require('./__helpers__/testUtils.js');

// theme-effects 从 domRef import 的 byId 被 loadModule 剥离后需由全局补回（等价于 jsdom 下的 getDomRoot→document）。
const { ThemeEffects } = loadModule('modules/theme-effects.js', ['ThemeEffects'], {
  byId: (id) => document.getElementById(id),
  // _renderMarketBody 用 HTMLUtils.escapeHtmlAttr 拼接卡片 html；测试注入最小实现
  HTMLUtils: { escapeHtmlAttr: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') },
});

// 确定性帧时钟：_autoTune 用 performance.now() 起算、requestAnimationFrame(t) 推进。
let clock = 0;
let nextDelta = () => 16;
let savedRAF = null;
let savedPerfNow = null;
function installClock(deltaFn) {
  clock = 0;
  nextDelta = deltaFn;
  savedRAF = global.requestAnimationFrame;
  savedPerfNow = performance.now;
  global.requestAnimationFrame = (cb) => { clock += nextDelta(); cb(clock); return 0; };
  performance.now = () => clock;
}
function uninstallClock() {
  if (savedRAF !== null) global.requestAnimationFrame = savedRAF;
  if (savedPerfNow !== null) performance.now = savedPerfNow;
}

// document.hidden 在 jsdom 是只读 getter，改为可变开关。
let hiddenFlag = false;
function installHidden() {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hiddenFlag });
}
function setHidden(v) { hiddenFlag = v; }

let savedIO = null;
function installIO() {
  savedIO = global.IntersectionObserver;
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
function uninstallIO() {
  if (savedIO !== undefined) global.IntersectionObserver = savedIO;
  delete global.IntersectionObserver;
}

beforeEach(() => {
  document.body.innerHTML = '<div id="themeEffectSection"><div class="theme-card"></div></div>';
  ThemeEffects._autoMotion = true;
  ThemeEffects._motionLevel = 'full';
  ThemeEffects._autoTuned = false;
  ThemeEffects._motionNotified = false;
  ThemeEffects._pauseCard = null;
  ThemeEffects._pauseIO = null;
  ThemeEffects._onVisibility = null;
  ThemeEffects._outOfView = false;
  hiddenFlag = false;
  installHidden();
});

afterEach(() => {
  ThemeEffects._teardownPauseWhenHidden();
  uninstallIO();
  uninstallClock();
});

function card() { return document.querySelector('.theme-card'); }

describe('P1-1 智能动效自适应降级（_autoTune）', () => {
  test('掉帧（p90 > 24ms）→ 自动由 full 降为 lite 并提示一次', () => {
    // 前 3 帧跳过，其后全部 25ms（> 24 阈值、且样本数 >= 60）
    installClock((n) => (n <= 3 ? 16 : 25));
    ThemeEffects._autoTune();
    expect(ThemeEffects._motionLevel).toBe('lite');
    expect(card().dataset.motion).toBe('lite');
    expect(ThemeEffects._motionNotified).toBe(true);   // 只提示一次
  });

  test('流畅（p90 <= 24ms）→ 保持 full，不降级', () => {
    installClock(() => 16);   // 全部 16ms
    ThemeEffects._autoTune();
    expect(ThemeEffects._motionLevel).toBe('full');
    expect(card().dataset.motion).toBeUndefined();
    expect(ThemeEffects._motionNotified).toBe(false);
  });

  test('关闭「智能动效」(_autoMotion=false) → 不采样、不降级', () => {
    ThemeEffects._autoMotion = false;
    installClock(() => 25);
    ThemeEffects._autoTune();
    expect(ThemeEffects._motionLevel).toBe('full');
    expect(ThemeEffects._autoTuned).toBe(false);
  });

  test('已降级后不再二次采样（_autoTuned 守卫）', () => {
    installClock(() => 25);
    ThemeEffects._motionLevel = 'lite';
    ThemeEffects._autoTune();
    expect(ThemeEffects._autoTuned).toBe(false);
  });
});

describe('P1-2 不可见即暂停（_setupPauseWhenHidden / _teardownPauseWhenHidden）', () => {
  test('可见 + 在视口内 → 不加 is-paused', () => {
    ThemeEffects._setupPauseWhenHidden();
    expect(card().classList.contains('is-paused')).toBe(false);
  });

  test('标签页隐藏（document.hidden）→ 加 is-paused；切回 → 移除', () => {
    ThemeEffects._setupPauseWhenHidden();
    setHidden(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(card().classList.contains('is-paused')).toBe(true);
    setHidden(false);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(card().classList.contains('is-paused')).toBe(false);
  });

  test('滚出视口（IntersectionObserver 非相交）→ 加 is-paused；回视口 → 移除', () => {
    installIO();
    ThemeEffects._setupPauseWhenHidden();
    ThemeEffects._pauseIO.cb([{ isIntersecting: false }]);
    expect(card().classList.contains('is-paused')).toBe(true);
    ThemeEffects._pauseIO.cb([{ isIntersecting: true }]);
    expect(card().classList.contains('is-paused')).toBe(false);
  });

  test('_teardownPauseWhenHidden → 移除 is-paused 并清空监听器', () => {
    installIO();
    ThemeEffects._setupPauseWhenHidden();
    setHidden(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(card().classList.contains('is-paused')).toBe(true);
    ThemeEffects._teardownPauseWhenHidden();
    expect(card().classList.contains('is-paused')).toBe(false);
    expect(ThemeEffects._pauseCard).toBeNull();
    expect(ThemeEffects._pauseIO).toBeNull();
    expect(ThemeEffects._onVisibility).toBeNull();
  });
});

// ── 切换主题：面板保持打开，市场「使用中」就地同步 ──
describe('切换主题后市场「使用中」就地刷新（面板不关闭）', () => {
  test('_syncThemeMode 把 .in-use 标到当前主题卡', () => {
    document.body.innerHTML =
      '<div id="themeEffectSection"><div class="theme-card"></div></div>' +
      '<div id="panel-market" class="fab-panel">' +
        '<div class="market-card is-applicable in-use" data-market-theme="a"></div>' +
        '<div class="market-card is-applicable" data-market-theme="b"></div>' +
      '</div>';
    const orig = {
      _applyThemeVars: ThemeEffects._applyThemeVars,
      _applyPaletteToGlobal: ThemeEffects._applyPaletteToGlobal,
      _notifyThemeUpdate: ThemeEffects._notifyThemeUpdate,
      _getModeSetting: ThemeEffects._getModeSetting,
      _getCurrentMode: ThemeEffects._getCurrentMode,
      currentTheme: ThemeEffects.currentTheme,
    };
    ThemeEffects._applyThemeVars = jest.fn();
    ThemeEffects._applyPaletteToGlobal = jest.fn();
    ThemeEffects._notifyThemeUpdate = jest.fn();
    ThemeEffects._getCurrentMode = () => 'light';
    ThemeEffects._getModeSetting = () => ({ hue: null, lightness: null, saturation: null });
    ThemeEffects.currentTheme = 'b';
    try {
      ThemeEffects._syncThemeMode();
    } finally {
      Object.assign(ThemeEffects, orig);
    }
    const a = document.querySelector('.market-card[data-market-theme="a"]');
    const b = document.querySelector('.market-card[data-market-theme="b"]');
    expect(b.classList.contains('in-use')).toBe(true);    // 使用中标到当前主题
    expect(a.classList.contains('in-use')).toBe(false);
  });
});

// ── 市场离线：目录不可用仍渲染「已安装」并可切换；目录可用时合并可装/可更新 ──
describe('主题市场：本地已安装优先（离线可切换）', () => {
  test('catalog=null 时渲染已安装卡 + 提示，无安装/更新按钮', () => {
    const body = document.createElement('div');
    const origAE = ThemeEffects.availableExternal;
    const origCur = ThemeEffects.currentTheme;
    try {
      ThemeEffects.availableExternal = { '枫林晚照': { name: '枫林晚照' } };
      ThemeEffects.currentTheme = 'bamboo';
      ThemeEffects._renderMarketBody(body, {
        catalog: null,
        installed: {},
        installedIds: ['枫林晚照'],
        notice: '线上清单不可用，仅显示已安装的主题',
      });
    } finally {
      ThemeEffects.availableExternal = origAE;
      ThemeEffects.currentTheme = origCur;
    }
    expect(body.textContent).toContain('线上清单不可用');
    const card = body.querySelector('.market-card[data-market-theme="枫林晚照"]');
    expect(card).not.toBeNull();
    expect(card.classList.contains('installed')).toBe(true);
    expect(card.querySelector('.market-btn.install')).toBeNull();       // 无目录 → 无安装/更新
    expect(card.querySelector('.market-btn.uninstall')).not.toBeNull(); // 仍可卸载
    expect(body.querySelector('.market-card[data-market-theme="bamboo"]')).not.toBeNull();
  });

  test('catalog 可用：已安装补「可更新」，未安装作为可装项', () => {
    const body = document.createElement('div');
    const origAE = ThemeEffects.availableExternal;
    const origCur = ThemeEffects.currentTheme;
    try {
      ThemeEffects.availableExternal = { a: { name: 'A' } };
      ThemeEffects.currentTheme = 'bamboo';
      ThemeEffects._renderMarketBody(body, {
        catalog: [
          { id: 'a', name: 'A', version: '2.0.0', url: 'https://x/a.js' },
          { id: 'b', name: 'B', version: '1.0.0', url: 'https://x/b.js' },
        ],
        installed: { a: { version: '1.0.0' } },
        installedIds: ['a'],
      });
    } finally {
      ThemeEffects.availableExternal = origAE;
      ThemeEffects.currentTheme = origCur;
    }
    const a = body.querySelector('.market-card[data-market-theme="a"]');
    const b = body.querySelector('.market-card[data-market-theme="b"]');
    expect(a.classList.contains('installed')).toBe(true);
    expect(a.querySelector('.market-update-badge')).not.toBeNull();   // 1.0.0 → 2.0.0 可更新
    expect(a.querySelector('.market-btn.install')).not.toBeNull();
    expect(b.classList.contains('installed')).toBe(false);
    expect(b.querySelector('.market-btn.install')).not.toBeNull();     // 可安装
  });
});

describe('市场面板「更新」按钮 —— 走更新分支，而不是被当成安装', () => {
  let savedAE, savedThemes, savedCur;
  beforeEach(() => {
    savedAE = ThemeEffects.availableExternal;
    savedThemes = ThemeEffects.themes;
    savedCur = ThemeEffects.currentTheme;
  });
  afterEach(() => {
    ThemeEffects.availableExternal = savedAE;
    ThemeEffects.themes = savedThemes;
    ThemeEffects.currentTheme = savedCur;
    delete global.Toast;
    delete window.storageManager;
  });

  // 渲染一张「正在显示且可更新」的卡片，返回其 install 按钮
  function renderUpdateButton(body) {
    ThemeEffects.availableExternal = { a: { name: 'A' } };
    ThemeEffects.themes = Object.assign({}, ThemeEffects.themes, {
      a: { name: 'A', render: function () { return ''; }, destroy: function () {} },
    });
    ThemeEffects.currentTheme = 'a'; // 正在显示 → 才进入更新分支
    ThemeEffects._renderMarketBody(body, {
      catalog: [{ id: 'a', name: 'A', version: '2.0.0', url: 'https://x/a.js' }],
      installed: { a: { version: '1.0.0' } },
      installedIds: ['a'],
    });
    return body.querySelector('.market-card[data-market-theme="a"] .market-btn.install');
  }

  it('可更新卡片的按钮带 data-action="update"（isUpdate 的唯一来源）', () => {
    const body = document.createElement('div');
    const btn = renderUpdateButton(body);
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('data-action')).toBe('update');
  });

  it('点击更新：重新加载并交由 _settleThemeUpdate 结算，不再走安装分支', async () => {
    global.Toast = { showToast: jest.fn() };
    window.storageManager = { installMarketTheme: () => Promise.resolve(true) };
    const settle = jest.spyOn(ThemeEffects, '_settleThemeUpdate').mockImplementation(() => {});
    const ensure = jest.spyOn(ThemeEffects, '_ensureLoaded').mockImplementation(() => Promise.resolve(true));
    try {
      const body = document.createElement('div');
      const btn = renderUpdateButton(body);
      btn.click();
      await new Promise((r) => setTimeout(r, 0)); // 等 installMarketTheme → _ensureLoaded 的 then 链

      expect(ensure).toHaveBeenCalledWith('a');            // 重新拉新代码
      expect(settle).toHaveBeenCalledWith('a', 'A', true); // 结果交给统一结算
    } finally {
      settle.mockRestore();
      ensure.mockRestore();
    }
  });
});

describe('更新正在显示的主题 —— 重新加载结果的结算', () => {
  afterEach(() => { delete global.Toast; });

  it('重新加载失败：回滚到内置竹林，且不谎报「已更新」', () => {
    global.Toast = { showToast: jest.fn() };
    const mount = jest.spyOn(ThemeEffects, '_mountTheme').mockImplementation(() => {});
    const sw = jest.spyOn(ThemeEffects, 'switchTheme').mockImplementation(() => {});
    try {
      const ok = ThemeEffects._settleThemeUpdate('t1', '测试主题', false);

      expect(ok).toBe(false);
      // 回滚：旧实例的 DOM 与动画会被 _mountTheme(bamboo) 的清空带走
      expect(sw).toHaveBeenCalledWith('bamboo');
      expect(mount).not.toHaveBeenCalled(); // 失败的主题绝不能挂载
      expect(global.Toast.showToast).toHaveBeenCalledTimes(1);
      expect(String(global.Toast.showToast.mock.calls[0][0])).toContain('失败');
      expect(global.Toast.showToast.mock.calls[0][1]).toBe('error');
    } finally {
      mount.mockRestore();
      sw.mockRestore();
    }
  });

  it('重新加载成功：挂载新版本、不回滚、提示成功', () => {
    global.Toast = { showToast: jest.fn() };
    const mount = jest.spyOn(ThemeEffects, '_mountTheme').mockImplementation(() => {});
    const sw = jest.spyOn(ThemeEffects, 'switchTheme').mockImplementation(() => {});
    try {
      const ok = ThemeEffects._settleThemeUpdate('t1', '测试主题', true);

      expect(ok).toBe(true);
      expect(mount).toHaveBeenCalledWith('t1');
      expect(sw).not.toHaveBeenCalled(); // 成功就不该回滚
      expect(global.Toast.showToast.mock.calls[0][1]).toBe('success');
    } finally {
      mount.mockRestore();
      sw.mockRestore();
    }
  });
});
