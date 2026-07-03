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
        loadModule('utils/confirmDialog.js', []);
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
});
