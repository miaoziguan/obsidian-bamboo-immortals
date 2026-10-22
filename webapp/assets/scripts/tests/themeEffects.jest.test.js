const { loadModule } = require('./__helpers__/testUtils.js');

// theme-effects 从 domRef import 的 byId 被 loadModule 剥离后需由全局补回（等价于 jsdom 下的 getDomRoot→document）。
const { ThemeEffects } = loadModule('modules/theme-effects.js', ['ThemeEffects'], {
  byId: (id) => document.getElementById(id),
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
