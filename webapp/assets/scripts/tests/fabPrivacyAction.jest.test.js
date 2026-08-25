/**
 * FABManager.setupPrivacyAction 专项测试：
 * 验证在 Obsidian 下 e.target 被 retarget 成 host（shadow 边界）时，
 * 仍能用 composedPath 命中 fab-privacy 并执行 toggle + close。
 * 复现 3.13.42 的「点了没反应、菜单也不关」根因（之前用 e.target.closest 在
 * retarget 下返回 null 提前 return）。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('setupPrivacyAction 在 retarget 下仍命中 fab-privacy', () => {
  let FAB;

  beforeAll(() => {
    const globals = { byId: () => null, $: () => null, getDomRoot: () => document.body };
    FAB = loadModule('handlers/fabManager.js', ['FABManager'], globals).FABManager;
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('e.target 被 retarget 成 host 时，composedPath 仍能命中并 toggle+close', () => {
    let toggled = 0, closed = 0;
    window.PrivacyMode = { toggle: () => { toggled++; return false; } };
    // 模拟 FABManager 实例依赖
    FAB.actions = {
      querySelector: () => ({ setAttribute() {}, classList: { toggle() {} } }),
    };
    FAB.updatePrivacyButton = () => {};
    FAB.close = () => { closed++; };
    FAB.isOpen = true;

    FAB.setupPrivacyAction();

    // 构造 retarget 场景：事件 target 是 host（document.body），
    // 但 composedPath 含真实 shadow 内按钮
    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'fab-privacy');
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    evt.composedPath = () => [btn, document.body];

    document.body.dispatchEvent(evt);

    expect(toggled).toBe(1);
    expect(closed).toBe(1);
  });

  test('点击非隐私按钮不触发 toggle/close', () => {
    let toggled = 0, closed = 0;
    window.PrivacyMode = { toggle: () => { toggled++; return false; } };
    FAB.actions = { querySelector: () => ({ setAttribute() {}, classList: { toggle() {} } }) };
    FAB.updatePrivacyButton = () => {};
    FAB.close = () => { closed++; };
    FAB.isOpen = true;

    FAB.setupPrivacyAction();

    const other = document.createElement('button');
    other.setAttribute('data-action', 'fab-theme');
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    evt.composedPath = () => [other, document.body];

    document.body.dispatchEvent(evt);

    expect(toggled).toBe(0);
    expect(closed).toBe(0);
  });
});
