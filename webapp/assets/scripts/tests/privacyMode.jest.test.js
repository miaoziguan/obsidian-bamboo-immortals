/**
 * PrivacyMode 单测 — 防偷窥模糊（UI 偏好，与业务数据解耦）
 * 验证：强度读取/边界/apply/持久化/toggle 翻转。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('PrivacyMode 防偷窥模糊', () => {
  let PrivacyMode;

  beforeAll(() => {
    PrivacyMode = loadModule('utils/privacyMode.js', ['PrivacyMode']).PrivacyMode;
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--privacy-blur');
    document.body.classList.remove('privacy-on');
  });

  test('默认强度为 10，未设置时返回默认', () => {
    expect(PrivacyMode.getLevel()).toBe(10);
  });

  test('读取非法值回退默认', () => {
    localStorage.setItem(PrivacyMode.KEY, 'abc');
    expect(PrivacyMode.getLevel()).toBe(10);
  });

  test('强度被钳制在 0..20', () => {
    expect(PrivacyMode.setLevel(-5)).toBe(0);
    expect(PrivacyMode.setLevel(999)).toBe(20);
  });

  test('setLevel 持久化 + 写入 --privacy-blur 变量（root 与 shadow host）', () => {
    PrivacyMode.setLevel(12);
    expect(localStorage.getItem(PrivacyMode.KEY)).toBe('12');
    expect(document.documentElement.style.getPropertyValue('--privacy-blur')).toBe('12px');
    // 若处于 shadow 模式（__bambooShadowRoot 存在），host 也应被设变量
    const sr = window.__bambooShadowRoot;
    if (sr && sr.host) {
      expect(sr.host.style.getPropertyValue('--privacy-blur')).toBe('12px');
    }
  });

  test('apply: 强度>0 时 body 带 privacy-on，=0 时移除', () => {
    PrivacyMode.apply(8);
    expect(document.body.classList.contains('privacy-on')).toBe(true);
    PrivacyMode.apply(0);
    expect(document.body.classList.contains('privacy-on')).toBe(false);
  });

  test('toggle 在「默认强度」与「关闭(0)」间翻转', () => {
    // 初始默认开启（getLevel=10>0）
    expect(PrivacyMode.isOn()).toBe(true);
    // 开启 → toggle 关闭
    expect(PrivacyMode.toggle()).toBe(false);
    expect(PrivacyMode.isOn()).toBe(false);
    expect(PrivacyMode.getLevel()).toBe(0);
    // 关闭 → toggle 回到默认强度 10
    expect(PrivacyMode.toggle()).toBe(true);
    expect(PrivacyMode.getLevel()).toBe(10);
  });

  test('isOn 仅在强度>0 时为 true', () => {
    PrivacyMode.setLevel(0);
    expect(PrivacyMode.isOn()).toBe(false);
    PrivacyMode.setLevel(6);
    expect(PrivacyMode.isOn()).toBe(true);
  });
});
