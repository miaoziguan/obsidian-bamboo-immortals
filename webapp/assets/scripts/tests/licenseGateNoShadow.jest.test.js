/**
 * @jest-environment jsdom
 *
 * 激活遮罩在「无 Shadow DOM」下的挂载回归测试。
 *
 * 【缺陷】bridge.js 传入 root = window.__bambooShadowRoot || document。
 * kill-switch（__BAMBOO_NO_SHADOW__ = true）与不支持 attachShadow 的浏览器下，
 * __bambooShadowRoot 为 null → root 退化为 document → mountLicenseGate 里
 * document.appendChild(wrap) 抛 HierarchyRequestError，被 bridge 的 try/catch
 * 吞成一句 warn，遮罩根本不出现 —— 未激活用户功能全开，付费门失效。
 *
 * 【断言策略】
 *   1. root 传 document 时必须挂到 document.body（不再抛错）；
 *   2. 挂到 light DOM 后样式必须同步进 document.head，否则得到一团无样式 DOM；
 *   3. 幂等：重复挂载不产生第二份遮罩 / 第二份样式。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('激活遮罩：noShadow（kill-switch）路径', () => {
    let gate;

    beforeEach(() => {
        jest.resetModules();
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        gate = loadModule('utils/licenseGate.js', ['mountLicenseGate', 'isLicenseGateActive']);
    });

    afterEach(() => {
        delete window.__BAMBOO_NO_SHADOW__;
    });

    test('root 传 document 时挂到 body，不再抛 HierarchyRequestError', () => {
        expect(() => gate.mountLicenseGate({
            root: document,
            activate: async () => ({ ok: true }),
        })).not.toThrow();

        const el = document.getElementById('bamboo-license-gate');
        expect(el).toBeTruthy();
        expect(el.parentElement).toBe(document.body);
        expect(gate.isLicenseGateActive()).toBe(true);
    });

    test('root 缺省时同样落到 body', () => {
        gate.mountLicenseGate({ activate: async () => ({ ok: true }) });
        const el = document.getElementById('bamboo-license-gate');
        expect(el).toBeTruthy();
        expect(el.parentElement).toBe(document.body);
    });

    test('重复挂载不产生第二份遮罩', () => {
        const opts = { root: document, activate: async () => ({ ok: true }) };
        gate.mountLicenseGate(opts);
        gate.mountLicenseGate(opts);
        expect(document.querySelectorAll('#bamboo-license-gate').length).toBe(1);
    });

    test('kill-switch 下模块加载即把遮罩样式注入 document.head（幂等）', () => {
        window.__BAMBOO_NO_SHADOW__ = true;
        // 模块顶层会执行 initShadow()，此处验证的正是「加载即注入」的真实路径
        loadModule('utils/shadowBootstrap.js', []);

        const style = document.head.querySelector('#bamboo-license-gate-style');
        expect(style).toBeTruthy();
        expect(style.textContent).toContain('.bamboo-license-gate');
        expect(style.textContent).toContain('.blg-card');
        expect(window.__bambooShadowRoot).toBeNull();
        expect(document.head.querySelectorAll('#bamboo-license-gate-style').length).toBe(1);
    });
});
