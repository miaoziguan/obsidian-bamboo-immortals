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

    test('携带 {type, id, payload}，目标为通配符 *（跨平台安全可达）', () => {
      mod.storageManager._send('storage:readDay', { dateKey: '2026-07-14' });
      expect(spy).toHaveBeenCalledTimes(1);
      const [msg, target] = spy.mock.calls[0];
      expect(msg.type).toBe('storage:readDay');
      expect(msg.payload).toEqual({ dateKey: '2026-07-14' });
      expect(typeof msg.id).toBe('string');
      // 统一用 '*'：安卓 blob 源下 window.parent.origin 为字符串 'null'，
      // postMessage(msg, 'null') 会抛 SyntaxError；'*' 在所有平台（桌面/安卓/ios）
      // 安全可达，宿主侧校验 event.source（contentWindow 对象）而非 origin 字符串。
      expect(target).toBe('*');
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

// 【防丢数据】app:beforeDetach 必须同时兜住画中卷·打字机。
// 根因：TypewriterFeature.unmount() 内含 _saveNow 兜底落盘，但生产代码从未被调用
// （scrollManager 只 mount、宿主 onClose 只 detach iframe），scroll bundle 又不加载
// store.js —— 于是关闭视图时防抖窗口内（便签/写作 350ms、子弹 400ms）的最后一次编辑
// 随 iframe 销毁而永久丢失。宿主 detach() 已留 400ms 回传窗口，故只需在此同步触发。
describe('app:beforeDetach 兜住打字机防抖窗口', () => {
  let unmountSpy;

  beforeEach(() => {
    unmountSpy = jest.fn();
    globalThis.TypewriterFeature = { _el: {}, unmount: unmountSpy };
  });

  afterEach(() => {
    delete globalThis.TypewriterFeature;
  });

  test('已挂载（_el 存在）→ 调 unmount（触发 _saveNow 兜底落盘 + 断 observer）', () => {
    const evt = new MessageEvent('message', { source: window, data: { type: 'app:beforeDetach' } });
    window.dispatchEvent(evt);
    expect(unmountSpy).toHaveBeenCalledTimes(1);
  });

  test('未挂载（_el 为空）→ 不调 unmount（避免对未初始化单例做完整卸载）', () => {
    globalThis.TypewriterFeature = { _el: null, unmount: unmountSpy };
    const evt = new MessageEvent('message', { source: window, data: { type: 'app:beforeDetach' } });
    window.dispatchEvent(evt);
    expect(unmountSpy).not.toHaveBeenCalled();
  });

  test('unmount 抛错不阻断卸载流程（不得向上抛）', () => {
    globalThis.TypewriterFeature = {
      _el: {},
      unmount: () => { throw new Error('boom'); },
    };
    const evt = new MessageEvent('message', { source: window, data: { type: 'app:beforeDetach' } });
    expect(() => window.dispatchEvent(evt)).not.toThrow();
  });

  test('打字机模块不存在（纯香道视图）→ 静默跳过', () => {
    delete globalThis.TypewriterFeature;
    const evt = new MessageEvent('message', { source: window, data: { type: 'app:beforeDetach' } });
    expect(() => window.dispatchEvent(evt)).not.toThrow();
  });
});

/**
 * 【防丢数据 · 回执契约】app:beforeDetachDone 必须在**落盘真的完成之后**才发。
 *
 * 这条是「关闭视图 100% 不丢」的关键：宿主 detach() 会 await 这个回执，收到就销毁 iframe。
 * 若在落盘 Promise resolve 之前回执（或干脆不回执），宿主就会在保存请求还在路上时
 * 把 iframe 拆掉 —— 正是 0 字节事故与「丢最后一次编辑」的成因。
 */
describe('app:beforeDetach 回执时序（宿主等它才销毁 iframe）', () => {
  let posted;

  const dispatchDetach = () => {
    window.dispatchEvent(new MessageEvent('message', { source: window, data: { type: 'app:beforeDetach' } }));
  };
  const doneCount = () => posted.filter((m) => m && m.type === 'app:beforeDetachDone').length;
  const flush = () => new Promise((r) => setTimeout(r, 0));

  beforeEach(() => {
    posted = [];
    jest.spyOn(window, 'postMessage').mockImplementation((msg) => { posted.push(msg); });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete globalThis.TypewriterFeature;
    delete globalThis.store;
  });

  test('落盘未完成 → 不回执；完成后才回执一次', async () => {
    let resolveSave;
    globalThis.TypewriterFeature = {
      _el: {},
      unmount: () => new Promise((r) => { resolveSave = r; }),
    };

    dispatchDetach();
    await flush();
    expect(doneCount()).toBe(0);          // 关键：还没写完，绝不能放行宿主

    resolveSave();
    await flush();
    expect(doneCount()).toBe(1);
  });

  test('主存储 flushPendingSave 未完成时也不回执（等的是「全部写完」）', async () => {
    let resolveStore;
    globalThis.store = {
      flushPendingSave: () => new Promise((r) => { resolveStore = r; }),
    };
    globalThis.TypewriterFeature = { _el: {}, unmount: () => Promise.resolve() };

    dispatchDetach();
    await flush();
    expect(doneCount()).toBe(0);

    resolveStore();
    await flush();
    expect(doneCount()).toBe(1);
  });

  test('unmount 抛错也必须回执 —— 否则宿主只能等满超时，关视图变慢', async () => {
    globalThis.TypewriterFeature = {
      _el: {},
      unmount: () => { throw new Error('boom'); },
    };

    dispatchDetach();
    await flush();
    expect(doneCount()).toBe(1);
  });

  test('没有打字机（纯香道视图）也要回执', async () => {
    dispatchDetach();
    await flush();
    expect(doneCount()).toBe(1);
  });
});
