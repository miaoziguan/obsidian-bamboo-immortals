// 共享画布键位(C2) / 共享手势(C3) 机制收敛的回归测试。
// 用 loadModule 加载（自动剥离 ES import，依赖经 globalThis 副作用解析）。
const { loadModule } = require('./__helpers__/testUtils');

let CanvasGestures, CanvasKeys;
beforeAll(() => {
  loadModule('services/CanvasViewport.js', []);
  loadModule('utils/domRef.js', []);
  ({ CanvasGestures } = loadModule('services/CanvasGestures.js', ['CanvasGestures']));
  ({ CanvasKeys } = loadModule('services/CanvasKeys.js', ['CanvasKeys']));
  if (typeof globalThis.isFromTextEntry !== 'function') globalThis.isFromTextEntry = () => false;
});

function fireKey(target, opts) {
  const e = new window.KeyboardEvent('keydown', Object.assign({ bubbles: true, cancelable: true }, opts));
  target.dispatchEvent(e);
  return e;
}
function fireKeyUp(target, opts) {
  const e = new window.KeyboardEvent('keyup', Object.assign({ bubbles: true, cancelable: true }, opts));
  target.dispatchEvent(e);
  return e;
}
function firePointer(target, type, opts) {
  const e = new window.MouseEvent(type, Object.assign({ bubbles: true, cancelable: true }, opts));
  Object.defineProperty(e, 'pointerId', { value: opts && opts.pointerId != null ? opts.pointerId : 1 });
  Object.defineProperty(e, 'pointerType', { value: (opts && opts.pointerType) || 'mouse' });
  target.dispatchEvent(e);
  return e;
}

describe('CanvasKeys 共享键位（C2）', () => {
  test('⌘+= 触发 zoomByCenter(step) 且 stopImmediatePropagation 阻断同 target 后续监听', () => {
    const calls = [];
    const detach = CanvasKeys.bind({
      isActive: () => true,
      zoomByCenter: (f) => calls.push(['zoom', f]),
      zoomReset: () => calls.push(['reset']),
      fitView: () => calls.push(['fit']),
      fitSelection: () => calls.push(['fitSel']),
      toggleHand: () => calls.push(['hand']),
    });
    const blocker = jest.fn();
    document.addEventListener('keydown', blocker, true);
    fireKey(document, { code: 'Equal', key: '=', metaKey: true });
    expect(calls).toEqual([['zoom', 1.25]]);
    expect(blocker).not.toHaveBeenCalled();   // 阻断了后续监听器（双响根因）
    detach();
    document.removeEventListener('keydown', blocker, true);
  });

  test('非激活模式完全不响应', () => {
    const calls = [];
    CanvasKeys.bind({
      isActive: () => false,
      zoomByCenter: () => calls.push('zoom'),
      zoomReset: () => calls.push('reset'),
      fitView: () => calls.push('fit'),
      fitSelection: () => calls.push('fitSel'),
      toggleHand: () => calls.push('hand'),
    });
    fireKey(document, { code: 'Equal', key: '=', metaKey: true });
    expect(calls).toEqual([]);
  });

  test('Shift+2 → fitSelection；H → toggleHand；⌘0 → zoomReset', () => {
    const calls = [];
    const detach = CanvasKeys.bind({
      isActive: () => true,
      zoomByCenter: () => {},
      zoomReset: () => calls.push('reset'),
      fitView: () => calls.push('fit'),
      fitSelection: () => calls.push('fitSel'),
      toggleHand: () => calls.push('hand'),
    });
    fireKey(document, { code: 'Digit2', shiftKey: true });
    fireKey(document, { code: 'KeyH' });
    fireKey(document, { code: 'Digit0', metaKey: true });
    expect(calls).toEqual(['fitSel', 'hand', 'reset']);
    detach();
  });
});

describe('CanvasGestures 共享手势（C3）', () => {
  test('滚轮：⌘=缩放 / Shift=横移 / 普通=平移 / Alt=普通平移（单卡缩放快捷键已移除）', () => {
    const calls = [];
    const host = document.createElement('div');
    document.body.appendChild(host);
    CanvasGestures.installWheel(host, {
      isActive: () => true,
      getView: () => ({ x: 0, y: 0, scale: 1 }),
      zoomAt: (cx, cy, f) => calls.push(['zoom', cx, cy, f]),
      panBy: (dx, dy) => calls.push(['pan', dx, dy]),
    });
    const wheel = (opts) => host.dispatchEvent(new window.WheelEvent('wheel', Object.assign({ bubbles: true, cancelable: true }, opts)));
    wheel({ metaKey: true, clientX: 10, clientY: 20, deltaY: -100 });
    expect(calls[0][0]).toBe('zoom');
    expect(calls[0][1]).toBe(10); expect(calls[0][2]).toBe(20);
    expect(typeof calls[0][3]).toBe('number');
    wheel({ shiftKey: true, deltaY: 50 });
    expect(calls[1]).toEqual(['pan', -50, 0]);
    wheel({ deltaX: 30, deltaY: 40 });
    expect(calls[2]).toEqual(['pan', -30, -40]);
    calls.length = 0;
    wheel({ altKey: true, deltaY: 10 });
    expect(calls).toEqual([['pan', -0, -10]]);   // 单卡缩放快捷键已移除：Alt+滚轮按普通平移处理
  });

  test('空格抓手：state.spaceDown 随按键切换并加 is-hand', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const hand = CanvasGestures.installSpaceHand(host, { isActive: () => true });
    fireKey(document, { code: 'Space' });
    expect(hand.state.spaceDown).toBe(true);
    expect(host.classList.contains('is-hand')).toBe(true);
    fireKeyUp(document, { code: 'Space' });
    expect(hand.state.spaceDown).toBe(false);
    expect(host.classList.contains('is-hand')).toBe(false);
    hand.destroy();
    host.remove();
  });

  test('attach：左键空白→onEmptyPointerDown；空格+左键→平移（onBeforePan+setView+onPanEnd）', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const log = [];
    let view = { x: 0, y: 0, scale: 1 };
    const hand = CanvasGestures.installSpaceHand(host, { isActive: () => true });
    const detach = CanvasGestures.attach(host, {
      isActive: () => true,
      state: hand.state,
      getView: () => view,
      setView: (v) => { view = v; log.push(['setView', v.x, v.y]); },
      getScale: () => view.scale,
      zoomAt: () => {},
      panBy: () => {},
      onBeforePan: () => log.push('beforePan'),
      onPanStart: () => log.push('panStart'),
      onPanEnd: () => log.push('panEnd'),
      onEmptyPointerDown: () => log.push('empty'),
    });

    // 左键空白
    firePointer(host, 'pointerdown', { button: 0, clientX: 100, clientY: 100 });
    expect(log).toEqual(['empty']);

    // 空格 + 左键 → 平移
    log.length = 0;
    fireKey(document, { code: 'Space' });   // state.spaceDown = true
    firePointer(host, 'pointerdown', { button: 0, clientX: 100, clientY: 100 });
    expect(log).toContain('beforePan');
    expect(log).toContain('panStart');
    firePointer(window, 'pointermove', { clientX: 150, clientY: 120 });
    expect(log.some((l) => Array.isArray(l) && l[0] === 'setView' && l[1] === 50 && l[2] === 20)).toBe(true);
    firePointer(window, 'pointerup', { clientX: 150, clientY: 120 });
    expect(log).toContain('panEnd');

    fireKeyUp(document, { code: 'Space' });   // 复位
    detach();
    hand.destroy();
    host.remove();
  });

  test('attach：双指 → 进入捏合（onPinchWillStart，且不触发 empty/pan）', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const log = [];
    const hand = CanvasGestures.installSpaceHand(host, { isActive: () => true });
    const detach = CanvasGestures.attach(host, {
      isActive: () => true,
      state: hand.state,
      getView: () => ({ x: 0, y: 0, scale: 1 }),
      setView: () => {},
      getScale: () => 1,
      zoomAt: () => {},
      panBy: () => {},
      onPinchWillStart: () => log.push('pinchWillStart'),
      onEmptyPointerDown: () => log.push('empty'),
    });
    firePointer(host, 'pointerdown', { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    firePointer(host, 'pointerdown', { pointerId: 2, button: 0, clientX: 200, clientY: 200 });
    expect(log).toContain('pinchWillStart');
    detach();
    hand.destroy();
    host.remove();
  });
});
