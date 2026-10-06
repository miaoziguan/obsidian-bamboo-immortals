/**
 * @jest-environment jsdom
  */
const { loadModule } = require('./__helpers__/testUtils');
describe('ConfirmDialog', () => {
    beforeEach(() => {
        jest.resetModules();
        delete window.Confirm;
        delete window.ConfirmDialog;
        window.HTMLUtils = {
            escapeHtml: jest.fn(s => s),
            escapeHtmlAttr: jest.fn(s => s)
        };
        window.escapeHtml = jest.fn(s => s);
        document.body.innerHTML = '<div id="modalContainer"></div>';
        // loadModule 会剥离 import 并把依赖挂到 globalThis，故confirmDialog 依赖的
        // domRef 成员必须以全局 mock 注入。这里注入**真实实现**（而非 stub），
        // 使 deepActiveElement 的 shadow 下钻逻辑真正被测到。
        const { deepActiveElement: realDeepActive } = loadModule('utils/domRef.js', ['deepActiveElement']);
        // 镜像生产打包行为：导出经 window[key]=mod[key] 暴露为 window.Confirm，
        // 且被 import 剥离的 modalMount 以全局 mock 注入。
        const { Confirm } = loadModule('utils/confirmDialog.js', ['Confirm'], {
            modalMount: () => document.getElementById('modalContainer'),
            deepActiveElement: realDeepActive,
        });
        window.Confirm = Confirm;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('confirm() 应返回 Promise', () => {
        const result = window.Confirm.confirm({ title: '测试', message: '消息' });
        expect(result).toBeInstanceOf(Promise);
        result.catch(() => {});
    });

    test('confirm() 应创建模态框 DOM 元素', () => {
        window.Confirm.confirm({ title: '测试', message: '消息' });
        const overlay = document.querySelector('.confirm-overlay');
        expect(overlay).not.toBeNull();
        expect(overlay.getAttribute('role')).toBe('dialog');
        expect(overlay.getAttribute('aria-modal')).toBe('true');
    });

    test('confirm() 点击确认按钮应 resolve true', async () => {
        const promise = window.Confirm.confirm({ title: '测试', message: '消息' });
        const confirmBtn = document.querySelector('.confirm-confirm-btn');
        confirmBtn.click();
        const result = await promise;
        expect(result).toBe(true);
    });

    test('confirm() 点击取消按钮应 resolve false', async () => {
        const promise = window.Confirm.confirm({ title: '测试', message: '消息' });
        const cancelBtn = document.querySelector('.confirm-cancel-btn');
        cancelBtn.click();
        const result = await promise;
        expect(result).toBe(false);
    });

    test('alert() 应只显示确认按钮', () => {
        window.Confirm.alert({ title: '提示', message: '注意' });
        expect(window.Confirm.currentDialog.config.showCancel).toBe(false);
    });

    test('danger() 应使用危险样式', () => {
        window.Confirm.danger({ title: '危险', message: '小心' });
        const dialog = document.querySelector('.confirm-dialog');
        expect(dialog.classList.contains('confirm-danger')).toBe(true);
    });

    test('confirmDelete() 应使用删除确认文案', () => {
        window.Confirm.confirmDelete();
        const config = window.Confirm.currentDialog.config;
        expect(config.title).toBe('确认删除');
        expect(config.confirmText).toBe('删除');
        expect(config.danger).toBe(true);
    });

    // ---- Escape 关闭路径（此前完全无覆盖，正是 A2 悬挂 bug 得以存活的原因）----

    const pressEscape = () => document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );

    test('Escape 应 resolve false（dismissed）', async () => {
        const promise = window.Confirm.confirm({ title: '测试', message: '消息' });
        pressEscape();
        expect(await promise).toBe(false);
    });

    test('回归：上次弹窗已 resolve 后，Escape 仍应 resolve false', async () => {
        // 旧实现中 _currentResolved 一旦被置 true 就永不复位，
        // 导致「第二次弹窗按 Esc」走 alreadyResolved 分支而跳过 resolve，
        // 调用方 await 永久悬挂（如 whiteNoiseManager 删除自定义音源）。
        const first = window.Confirm.confirm({ title: '第一次', message: '消息' });
        document.querySelector('.confirm-confirm-btn').click();
        expect(await first).toBe(true);

        const second = window.Confirm.confirm({ title: '第二次', message: '消息' });
        pressEscape();
        // 若未修复，await 会永久挂起 → jest 超时失败
        expect(await second).toBe(false);
    });

    test('回归：连续两次 Escape 关闭两个弹窗，均应 resolve', async () => {
        const a = window.Confirm.confirm({ title: 'A', message: '消息' });
        pressEscape();
        expect(await a).toBe(false);
        const b = window.Confirm.confirm({ title: 'B', message: '消息' });
        pressEscape();
        expect(await b).toBe(false);
    });
});
