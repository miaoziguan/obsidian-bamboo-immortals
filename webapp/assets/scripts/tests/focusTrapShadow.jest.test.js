/**
 * @jest-environment jsdom
 *
 * Shadow DOM 焦点陷阱回归测试。
 *
 * 【缺陷】focusTrap.js 与 confirmDialog.js 各自的焦点陷阱都用 `document.activeElement`
 * 判定当前焦点。但 shadow 模式下焦点位于 shadow 树内时，document.activeElement 恒为
 * shadow host（retarget），于是 `active === firstElement` / `dialog.contains(active)`
 * 恒不成立——旧实现里 `!dialog.contains(active)` 恒为**真**，表现为「焦点在弹窗内也
 * 前进不了，每次 Tab 都被强制弹回第一个元素」。
 *
 * 【为什么这个文件能抓到它】既有的 confirmDialog 测试全部跑在 light DOM 下，此时
 * document.activeElement 就是目标元素，判定恰好成立，缺陷不可见。本文件把整个应用挂进
 * 真实 shadow root（jsdom 20 的 document.activeElement / shadowRoot.activeElement 语义
 * 与浏览器一致），缺陷才暴露。
 *
 * 【断言策略】区分新旧实现的唯一可观测信号是「是否 preventDefault」：
 *   焦点在容器内且不在回绕边界 →  新实现不干预（交还浏览器推进）
 *                                旧实现 preventDefault 并强制回首元素
 * 「从 last 回绕到 first」这类断言新旧结果相同，只能作行为锁定，不能当回归依据。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('Shadow DOM 焦点陷阱', () => {
    let Confirm;
    let host;
    let shadowRoot;
    let deepActiveElement;

    beforeEach(() => {
        jest.resetModules();
        window.HTMLUtils = { escapeHtml: (s) => s, escapeHtmlAttr: (s) => s };
        window.escapeHtml = (s) => s;

        // 模拟 shadowBootstrap：整个应用挂进 shadow root
        host = document.createElement('div');
        document.body.appendChild(host);
        shadowRoot = host.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = '<div id="modalContainer"></div>';

        // 注入真实实现（loadModule 剥离 import 后，依赖只能经 globalThis 解析）
        ({ deepActiveElement } = loadModule('utils/domRef.js', ['deepActiveElement']));
        ({ Confirm } = loadModule('utils/confirmDialog.js', ['Confirm'], {
            modalMount: () => shadowRoot.getElementById('modalContainer'),
            deepActiveElement,
        }));
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    // 真实按键的 KeyboardEvent 是 composed 的，能从 shadow 树内捕获到 document；
    // 合成事件必须显式带 composed: true，否则到不了 document 上的捕获监听。
    // cancelable: true 同样必需——UIEvent 的 cancelable 默认是 false，
    // 而 preventDefault() 对不可取消事件是空操作，defaultPrevented 会恒为 false。
    const keyEvent = (init) => new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        cancelable: true,
        ...init,
    });

    // 从弹窗内部派发，模拟「焦点在 shadow 树内时用户按键」；返回是否被 preventDefault
    const pressTab = (shiftKey = false) => {
        const dialog = shadowRoot.querySelector('.confirm-dialog');
        const evt = keyEvent({ key: 'Tab', shiftKey });
        dialog.dispatchEvent(evt);
        return evt.defaultPrevented;
    };
    const pressEscape = () => {
        const dialog = shadowRoot.querySelector('.confirm-dialog');
        dialog.dispatchEvent(keyEvent({ key: 'Escape' }));
    };

    const cancelBtn = () => shadowRoot.querySelector('.confirm-cancel-btn');
    const confirmBtn = () => shadowRoot.querySelector('.confirm-confirm-btn');

    test('前置：jsdom 忠实复现根因——shadow 内聚焦时 document.activeElement 是 host', () => {
        const probe = document.createElement('button');
        shadowRoot.appendChild(probe);
        probe.focus();

        expect(document.activeElement).toBe(host);
        expect(document.activeElement).not.toBe(probe);
        expect(deepActiveElement()).toBe(probe);
    });

    test('deepActiveElement 在 light DOM 下退化为 document.activeElement（kill-switch 兼容）', () => {
        const btn = document.createElement('button');
        document.body.appendChild(btn);
        btn.focus();
        expect(deepActiveElement()).toBe(btn);
    });

    // ---- 以下为真正的回归断言：可区分新旧实现 ----

    test('回归：焦点在首个元素上按 Tab 不应被拦截（旧实现会强制弹回首元素）', () => {
        Confirm.confirm({ title: '测试', message: '消息' });
        cancelBtn().focus();
        expect(shadowRoot.activeElement).toBe(cancelBtn());

        // 旧实现在此 preventDefault 并把焦点拉回首元素 → 焦点在弹窗内也无法前进
        expect(pressTab()).toBe(false);
    });

    test('回归：焦点在末个元素上按 Tab 应被拦截', () => {
        Confirm.confirm({ title: '测试', message: '消息' });
        confirmBtn().focus();

        expect(pressTab()).toBe(true);
        // 行为锁定（回绕目标）：新旧一致
        expect(shadowRoot.activeElement).toBe(cancelBtn());
    });

    test('回归：焦点在容器外时按 Tab 应被拦截并拉回首元素', () => {
        Confirm.confirm({ title: '测试', message: '消息' });
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        outside.focus();
        expect(document.activeElement).toBe(outside);

        // 焦点在 shadow 树外时事件同样要能被 document 捕获监听收到
        const evt = keyEvent({ key: 'Tab' });
        shadowRoot.querySelector('.confirm-dialog').appendChild(outside);
        outside.dispatchEvent(evt);
        expect(evt.defaultPrevented).toBe(true);
    });

    // ---- 以下为行为锁定：新旧一致，不能当回归依据 ----

    test('Shift+Tab 在首个元素上回绕到末个元素', () => {
        Confirm.confirm({ title: '测试', message: '消息' });
        cancelBtn().focus();

        expect(pressTab(true)).toBe(true);
        expect(shadowRoot.activeElement).toBe(confirmBtn());
    });

    // ---- 其余行为保证 ----

    test('shadow 内按 Escape 仍能关闭弹窗并 resolve false', async () => {
        const promise = Confirm.confirm({ title: '测试', message: '消息' });
        confirmBtn().focus();

        pressEscape();
        expect(await promise).toBe(false);
    });

    test('弹窗关闭后不应残留焦点陷阱监听（避免后续弹窗叠加）', () => {
        Confirm.confirm({ title: '第一个', message: '消息' });
        const dialog = Confirm.currentDialog.dialog;
        expect(typeof dialog._focusTrapHandler).toBe('function');

        // 监听注册在 document 捕获阶段，而非 dialog 自身
        Confirm.closeCurrent();
        expect(dialog._focusTrapHandler).toBeNull();
        expect(Confirm.currentDialog).toBeNull();
    });
});
