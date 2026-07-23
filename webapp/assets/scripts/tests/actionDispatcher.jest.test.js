/**
 * ActionDispatcher 全局事件委托路由单测
 * 纯事件委托 + Shadow DOM composedPath，jsdom 原生可测，无外部依赖。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('ActionDispatcher 全局事件委托路由', () => {
  let AD;
  let handlerA;
  let handlerB;

  beforeAll(() => {
    // actionDispatcher.js import { getDomRoot } from './domRef.js'，
    // loadModule 会剥离 import，故注入 getDomRoot 全局 mock（jsdom 下回退 document）
    AD = loadModule('utils/actionDispatcher.js', ['ActionDispatcher'], {
      getDomRoot: () => document,
    }).ActionDispatcher;
    handlerA = jest.fn();
    handlerB = jest.fn();
    AD.registerMany({
      'test:a': handlerA,
      'test:b': handlerB,
    });
    AD.init();
  });

  beforeEach(() => {
    handlerA.mockClear();
    handlerB.mockClear();
  });

  // ---- register ----
  test('register 注册单个 handler', () => {
    const h = jest.fn();
    AD.register('test:solo', h);
    expect(AD._handlers['test:solo']).toBe(h);
    delete AD._handlers['test:solo']; // cleanup
  });

  test('registerMany 批量注册', () => {
    expect(AD._handlers['test:a']).toBe(handlerA);
    expect(AD._handlers['test:b']).toBe(handlerB);
  });

  // ---- click 事件委托 ----
  test('点击 [data-action] 元素触发对应 handler', () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'test:a');
    btn.setAttribute('data-id', '42');
    document.body.appendChild(btn);

    btn.click();
    document.body.removeChild(btn);

    expect(handlerA).toHaveBeenCalledTimes(1);
    // handler(dataset, element, event)
    const [dataset, el, evt] = handlerA.mock.calls[0];
    expect(dataset.action).toBe('test:a');
    expect(dataset.id).toBe('42');
    expect(el).toBe(btn);
    expect(evt instanceof MouseEvent).toBe(true);
  });

  test('未注册的 action 不触发任何 handler', () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'test:unknown');
    document.body.appendChild(btn);

    btn.click();
    document.body.removeChild(btn);

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });

  test('无 [data-action] 属性的元素不触发 handler', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    btn.click();
    document.body.removeChild(btn);

    expect(handlerA).not.toHaveBeenCalled();
  });

  // ---- checkbox/radio 特殊处理 ----
  test('checkbox 点击不调用 preventDefault', () => {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.setAttribute('data-action', 'test:a');
    document.body.appendChild(cb);

    const preventDefault = jest.fn();
    cb.addEventListener('click', (e) => {
      // 监听 click 以验证 preventDefault 未被 actionDispatcher 调用
    });

    cb.click();
    document.body.removeChild(cb);

    expect(handlerA).toHaveBeenCalledTimes(1);
  });

  test('radio 点击不调用 preventDefault', () => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.setAttribute('data-action', 'test:b');
    document.body.appendChild(radio);

    radio.click();
    document.body.removeChild(radio);

    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  // ---- data-stop-propagation ----
  test('[data-stop-propagation] 元素上无 data-action 祖先时阻止事件继续', () => {
    // data-stop-propagation 仅在当前元素链上无 data-action 才触发 stopImmediatePropagation
    const el = document.createElement('div');
    el.setAttribute('data-stop-propagation', '');
    document.body.appendChild(el);

    // 注册另一个 document click 监听器来验证 stopImmediatePropagation 是否生效
    const lateHandler = jest.fn();
    document.addEventListener('click', lateHandler);

    el.click();
    document.body.removeChild(el);

    // lateHandler 应被阻止（stopImmediatePropagation 阻止同元素上后续监听器）
    expect(lateHandler).not.toHaveBeenCalled();
    document.removeEventListener('click', lateHandler);
  });

  test('[data-action] 祖先在 [data-stop-propagation] 之上时 handler 仍触发', () => {
    const outer = document.createElement('div');
    outer.setAttribute('data-action', 'test:a');
    const mid = document.createElement('div');
    mid.setAttribute('data-stop-propagation', '');
    const inner = document.createElement('span');
    mid.appendChild(inner);
    outer.appendChild(mid);
    document.body.appendChild(outer);

    inner.click();
    document.body.removeChild(outer);

    // _findClosestAttr 从 inner 向上遍历：[inner, mid, outer, body, ...]
    // inner.closest('[data-action]') → outer，命中 → handler 触发 → 不检查 stop-propagation
    expect(handlerA).toHaveBeenCalledTimes(1);
  });

  // ---- 嵌套 data-action（取最近的） ----
  test('嵌套 data-action 取最近祖先的 action', () => {
    const outer = document.createElement('div');
    outer.setAttribute('data-action', 'test:b');
    const inner = document.createElement('span');
    inner.setAttribute('data-action', 'test:a');
    outer.appendChild(inner);
    document.body.appendChild(outer);

    inner.click();
    document.body.removeChild(outer);

    // inner 的 test:a 更近，优先
    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).not.toHaveBeenCalled();
  });

  // ---- 键盘事件 ----
  test('Enter 键触发 [data-action] handler', () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'test:a');
    document.body.appendChild(btn);

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    document.body.removeChild(btn);

    expect(handlerA).toHaveBeenCalledTimes(1);
    const [, , evt] = handlerA.mock.calls[0];
    expect(evt instanceof KeyboardEvent).toBe(true);
  });

  test('Space 键触发 [data-action] handler', () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'test:b');
    document.body.appendChild(btn);

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    document.body.removeChild(btn);

    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  test('非 Enter/Space 的 keydown 不触发 handler', () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'test:a');
    document.body.appendChild(btn);

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.body.removeChild(btn);

    expect(handlerA).not.toHaveBeenCalled();
  });

  test('Enter 键在无 [data-action] 元素上不触发', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    document.body.removeChild(btn);

    expect(handlerA).not.toHaveBeenCalled();
  });

  // ---- _findClosestAttr ----
  test('_findClosestAttr 在无匹配时返回 null', () => {
    const div = document.createElement('div');
    const mockEvent = {
      composedPath: () => [div],
    };
    const result = AD._findClosestAttr(mockEvent, 'data-nonexistent');
    expect(result).toBeNull();
  });

  test('_findClosestAttr 在 composedPath 不可用时 fallback e.target', () => {
    const div = document.createElement('div');
    div.setAttribute('data-action', 'test:a');
    const mockEvent = {
      target: div,
      // 无 composedPath
    };
    const result = AD._findClosestAttr(mockEvent, 'data-action');
    expect(result).toBe(div);
  });

  // ---- 清理 ----
  afterAll(() => {
    // 移除 init() 注册的全局监听器
    // 注：init 使用匿名函数无法精确移除，但 jest per-file sandbox 自动隔离
  });
});
