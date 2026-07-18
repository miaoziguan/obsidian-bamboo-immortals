/**
 * @jest-environment jsdom
 *
 * bridge.js 首屏调色同步补发：
 *   - syncPaletteToObsidian=true 时，app:ready 拿到开关后延迟 60ms
 *     主动调用一次 window.DisplayManager._maybeSyncPalette()，
 *     修复 DisplayManager 早于 bridge 就绪导致的首屏漏同步。
 *   - syncPaletteToObsidian=false 时不调度补发。
 *
 * 加载策略：bridge.js 在模块末尾自动 new BridgeStorage() 并触发 initialize()，
 * 故每个用例重新 loadModule（new Function 隔离），并通过 mock window.parent.postMessage
 * 立即回包 app:ready 响应来驱动 initialize 完成。
 */
const { loadModule } = require('./__helpers__/testUtils');

function setup(readyResponse) {
  jest.useFakeTimers();
  const spy = jest.fn();
  // DisplayManager 必须在补发 setTimeout 触发前就位
  window.DisplayManager = { _maybeSyncPalette: spy };

  const postSpy = jest.spyOn(window, 'postMessage').mockImplementation((msg) => {
    if (msg && msg.type === 'app:ready') {
      // 模拟父窗口对 app:ready 的响应（jsdom 中 window.parent === window）
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: { type: 'app:ready', id: msg.id, payload: readyResponse },
        })
      );
    }
  });

  const mod = loadModule('storage/bridge.js', ['storageManager']);
  return { mod, spy, postSpy };
}

describe('bridge.js 首屏调色同步补发', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
    window.DisplayManager = undefined;
  });

  test('syncPaletteToObsidian=true → 60ms 后补发 _maybeSyncPalette 一次', async () => {
    const { spy } = setup({ syncPaletteToObsidian: true });
    // 让 initialize 内 await _send(app:ready) 的微任务续体执行完（调度 setTimeout 60）
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(70);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('syncPaletteToObsidian=false → 不调度补发', async () => {
    const { spy } = setup({ syncPaletteToObsidian: false });
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(70);
    expect(spy).not.toHaveBeenCalled();
  });

  test('syncPaletteToObsidian 缺省（undefined）→ 不调度补发', async () => {
    const { spy } = setup({}); // 不含该字段
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(70);
    expect(spy).not.toHaveBeenCalled();
  });
});
