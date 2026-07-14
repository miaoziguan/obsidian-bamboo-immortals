/**
 * @jest-environment jsdom
 *
 * bridge.js 协议接收端测试（阶段2 · 核心模块单测）：
 * - 锁定 nav:/action: 命令分发到正确的 store / Handlers / StatsModal；
 * - 锁定「来源过滤」：event.source !== window.parent 的消息被拒绝（沙箱边界前置）。
 *
 * 加载策略：bridge.js 在模块顶层注册 message 监听器，重复 load 会累积监听器，
 * 故只 loadModule 一次，每个用例通过重置 globalThis 上的 store/Handlers 等依赖来隔离。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('bridge.js 协议接收端', () => {
  let mod;
  let store, Handlers, StatsModal, SettingsModal;

  beforeAll(() => {
    const seedStore = { navigateDate: () => {}, goToDate: () => {} };
    const seedHandlers = { openSettingsModal: () => {} };
    const seedStats = { open: () => {} };
    const seedSettings = {};
    mod = loadModule(
      'storage/bridge.js',
      ['BridgeStorage', 'storageManager'],
      {
        store: seedStore,
        Handlers: seedHandlers,
        StatsModal: seedStats,
        SettingsModal: seedSettings,
      }
    );
  });

  beforeEach(() => {
    store = { navigateDate: jest.fn(), goToDate: jest.fn() };
    Handlers = { openSettingsModal: jest.fn() };
    StatsModal = { open: jest.fn() };
    SettingsModal = {};
    // 重置全局依赖（handler 在调用时从 global 读取这些名字）
    globalThis.store = store;
    globalThis.Handlers = Handlers;
    globalThis.StatsModal = StatsModal;
    globalThis.SettingsModal = SettingsModal;
  });

  /** 派发一条 message 事件；jsdom 中 window.parent === window，故 source 默认通过过滤 */
  function dispatch(type, payload, source) {
    const evt = new MessageEvent('message', {
      source: source ?? window,
      data: payload ? { type, payload } : { type },
    });
    window.dispatchEvent(evt);
  }

  test('nav:prevDay → store.navigateDate(-1)', () => {
    dispatch('nav:prevDay');
    expect(store.navigateDate).toHaveBeenCalledTimes(1);
    expect(store.navigateDate).toHaveBeenCalledWith(-1);
  });

  test('nav:nextDay → store.navigateDate(1)', () => {
    dispatch('nav:nextDay');
    expect(store.navigateDate).toHaveBeenCalledTimes(1);
    expect(store.navigateDate).toHaveBeenCalledWith(1);
  });

  test('nav:today → store.goToDate(期望日期对象)', () => {
    dispatch('nav:today');
    expect(store.goToDate).toHaveBeenCalledTimes(1);
    expect(store.goToDate).toHaveBeenCalledWith(expect.any(Date));
  });

  test('action:openStats → StatsModal.open()', () => {
    dispatch('action:openStats');
    expect(StatsModal.open).toHaveBeenCalledTimes(1);
  });

  test('action:openSettings → Handlers.openSettingsModal()', () => {
    dispatch('action:openSettings');
    expect(Handlers.openSettingsModal).toHaveBeenCalledTimes(1);
  });

  test('来源非父窗口（event.source !== window.parent）被拒绝', () => {
    dispatch('nav:nextDay', undefined, {});
    expect(store.navigateDate).not.toHaveBeenCalled();
  });

  test('storageManager 单例已挂载到 window', () => {
    expect(mod.storageManager).toBeDefined();
    expect(typeof mod.storageManager._send).toBe('function');
  });

  describe('sender（_send → window.parent.postMessage）', () => {
    let spy;
    beforeEach(() => {
      spy = jest.spyOn(window, 'postMessage').mockImplementation(() => {});
    });
    afterEach(() => spy.mockRestore());

    test('携带 {type, id, payload}，目标为 parent.origin 或 *', () => {
      mod.storageManager._send('storage:readDay', { dateKey: '2026-07-14' });
      expect(spy).toHaveBeenCalledTimes(1);
      const [msg, target] = spy.mock.calls[0];
      expect(msg.type).toBe('storage:readDay');
      expect(msg.payload).toEqual({ dateKey: '2026-07-14' });
      expect(typeof msg.id).toBe('string');
      // 目标使用 parent.origin（非空时优先于通配符 '*'，更安全）
      expect(target).toBe(window.parent.origin);
    });

    test('id 唯一（连续两次不同）', () => {
      mod.storageManager._send('x', {});
      mod.storageManager._send('x', {});
      const id1 = spy.mock.calls[0][0].id;
      const id2 = spy.mock.calls[1][0].id;
      expect(id1).not.toBe(id2);
    });
  });
});
