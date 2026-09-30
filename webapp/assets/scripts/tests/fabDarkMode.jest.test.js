/**
 * @jest-environment jsdom
 */
// 悬浮菜单「夜间模式」语义回归锁：
// 该按钮应切换【Obsidian 整体明暗】（经 app:toggleObsidianTheme 请宿主改基础主题），
// 而不是只切应用内部夜间模式、更不应顺手关闭「跟随 Obsidian」。
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

// handlers.js 顶层会执行 ActionDispatcher.registerMany(...) → 先备好桩并捕获注册表
let actions = {};
global.ActionDispatcher = {
  register: () => {},
  registerMany: (map) => { actions = Object.assign(actions, map); },
};

const { Handlers } = loadModule('handlers/handlers.js', ['Handlers']);

/** 冲掉 fire-and-forget 的微任务链（fab 处理器用 void 调用异步方法） */
function flush() { return new Promise((r) => setTimeout(r, 0)); }

describe('悬浮菜单「夜间模式」→ 切换 Obsidian 明暗', () => {
  let toggleSpy, setDarkSpy, syncSpy, updateBtnSpy, closeSpy, toastSpy;

  beforeEach(() => {
    toggleSpy = jest.fn(async () => ({ ok: true, isDark: true }));
    setDarkSpy = jest.fn(async () => {});
    syncSpy = jest.fn(async () => {});
    updateBtnSpy = jest.fn();
    closeSpy = jest.fn();
    toastSpy = jest.fn();
    window.storageManager = { toggleObsidianTheme: toggleSpy };
    global.store = {
      setDarkMode: setDarkSpy,
      setSyncTheme: syncSpy,
      getState: () => ({ ui: { isDarkMode: false } }),
    };
    global.ThemeSelector = { updateDarkModeButton: updateBtnSpy };
    global.FABManager = { close: closeSpy };
    global.Toast = { showToast: toastSpy };
  });

  afterEach(() => {
    delete window.storageManager;
    delete global.store;
    delete global.ThemeSelector;
    delete global.FABManager;
    delete global.Toast;
  });

  test('fab-dark-mode 请求宿主切换 OB 主题（无参 → 由宿主按自身真实主题取反）', async () => {
    actions['fab-dark-mode']();
    await flush();
    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy).toHaveBeenCalledWith();   // 不传 isDark，交给宿主判断
    expect(closeSpy).toHaveBeenCalled();
  });

  test('不再调用 store.setSyncTheme(false)（保持「跟随 Obsidian」不被该按钮破坏）', async () => {
    actions['fab-dark-mode']();
    await flush();
    expect(syncSpy).not.toHaveBeenCalled();
  });

  test('切换成功后把面板明暗对齐到宿主返回的真实值（跟随关闭时按钮仍有可见效果）', async () => {
    await Handlers.toggleObsidianTheme();
    // fromHost=true：不广播 theme:appDarkMode、不置 userThemeChosen
    expect(setDarkSpy).toHaveBeenCalledWith(true, true);
    expect(updateBtnSpy).toHaveBeenCalled();
  });

  test('宿主失败时不误对齐本地明暗，并给出提示', async () => {
    toggleSpy.mockResolvedValueOnce({ ok: false });
    await Handlers.toggleObsidianTheme();
    expect(setDarkSpy).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalled();
  });

  test('桥缺失（纯浏览器调试 / 非 Obsidian）退回应用内明暗切换', async () => {
    window.storageManager = {};
    await Handlers.toggleObsidianTheme();
    expect(setDarkSpy).toHaveBeenCalledWith();   // 无参 → 本地取反
  });

  test('源码回归：fab-dark-mode 不得再走本地 setDarkMode + setSyncTheme(false)', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'handlers', 'handlers.js'), 'utf8'
    );
    const start = src.indexOf("'fab-dark-mode':");
    expect(start).toBeGreaterThan(-1);
    const block = src.slice(start, src.indexOf('},', start) + 2);
    expect(block).toContain('toggleObsidianTheme');
    expect(block).not.toContain('setSyncTheme(false)');
    expect(block).not.toContain('store.setDarkMode()');
  });
});
