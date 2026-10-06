import { modalMount, deepActiveElement } from './domRef.js';
export class ConfirmDialog {
    constructor() {
        this.defaults = {
            title: '确认操作',
            message: '确定要执行此操作吗？',
            confirmText: '确定',
            cancelText: '取消',
            confirmClass: 'bm-btn--primary',
            cancelClass: 'bm-btn--secondary',
            danger: false,
            modal: true,
            closeOnConfirm: true,
            closeOnCancel: true,
            closeOnBackdrop: true,
            focusTrap: true
        };
        this.currentDialog = null;
        // 本次弹窗是否已 resolve 过。由 cleanupAndResolve 置 true，供 closeCurrent
        // 判断结束路径：按钮路径已 resolve，Esc/遮罩路径需补发 resolve(false)。
        // 每次 show() 必须复位——否则上次弹窗点过按钮后本标志恒为 true，
        // 新弹窗按 Esc 会因 alreadyResolved 而跳过 resolve，使调用方 await 永久悬挂。
        this._currentResolved = false;
    }

    show(options = {}) {
        const config = { ...this.defaults, ...options };

        return new Promise((resolve) => {
            if (this.currentDialog) {
                this.closeCurrent();
            }
            // 必须在 closeCurrent() 之后复位：旧弹窗的 closeCurrent 已同步把
            // _currentResolved 快照进 alreadyResolved 并据此决定是否补发 resolve，
            // 此处重置只影响本次新弹窗。
            this._currentResolved = false;

            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');

            const dialog = document.createElement('div');
            dialog.className = `confirm-dialog ${config.modal ? '' : 'confirm-inline'}`;

            if (config.danger) {
                dialog.classList.add('confirm-danger');
            }

            dialog.innerHTML = `
                <div class="confirm-header">
                    <h3 class="confirm-title">${HTMLUtils.escapeHtml(config.title)}</h3>
                </div>
                <div class="confirm-body">
                    <p class="confirm-message">${HTMLUtils.escapeHtml(config.message || '')}</p>
                    ${this._renderExtraOptions(config.extraOptions)}
                </div>
                <div class="confirm-footer">
                    <button class="bm-btn ${HTMLUtils.escapeHtmlAttr(config.cancelClass)} confirm-cancel-btn">
                        ${HTMLUtils.escapeHtml(config.cancelText)}
                    </button>
                    <button class="bm-btn ${HTMLUtils.escapeHtmlAttr(config.confirmClass)} confirm-confirm-btn ${config.danger ? 'bm-btn--danger' : ''}">
                        ${HTMLUtils.escapeHtml(config.confirmText)}
                    </button>
                </div>
            `;

            overlay.appendChild(dialog);
            modalMount().appendChild(overlay);
            this.currentDialog = { overlay, dialog, resolve, config };

            requestAnimationFrame(() => {
                overlay.classList.add('confirm-visible');
            });

            const confirmBtn = dialog.querySelector('.confirm-confirm-btn');
            const cancelBtn = dialog.querySelector('.confirm-cancel-btn');

            const collectExtraValues = () => {
                const values = {};
                if (!config.extraOptions) return values;
                if (Array.isArray(config.extraOptions)) {
                    config.extraOptions.forEach(group => {
                        const checked = dialog.querySelector(`input[name="${group.key}"]:checked`);
                        values[group.key] = checked ? checked.value : (group.choices.find(c => c.default) || {}).value;
                    });
                } else if (config.extraOptions.key) {
                    const checked = dialog.querySelector(`input[name="${config.extraOptions.key}"]:checked`);
                    values[config.extraOptions.key] = checked
                        ? checked.value
                        : (config.extraOptions.choices.find(c => c.default) || {}).value;
                }
                return values;
            };

            const cleanupAndResolve = (result) => {
                const hasExtra = !!config.extraOptions;
                if (result === true) {
                    this._currentResolved = true;
                    resolve(hasExtra
                        ? { confirmed: true, extraValues: collectExtraValues() }
                        : true);
                } else if (result && typeof result === 'object' && 'confirmed' in result) {
                    this._currentResolved = true;
                    resolve(result);
                } else {
                    this._currentResolved = true;
                    resolve(hasExtra
                        ? { confirmed: false, extraValues: {} }
                        : false);
                }
                this.closeCurrent();
            };

            confirmBtn.addEventListener('click', () => {
                if (config.onConfirm) {
                    const shouldClose = config.onConfirm();
                    if (shouldClose === false && !config.closeOnConfirm) return;
                }
                cleanupAndResolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                if (config.onCancel) {
                    const shouldClose = config.onCancel();
                    if (shouldClose === false && !config.closeOnCancel) return;
                }
                cleanupAndResolve(false);
            });

            if (config.closeOnBackdrop) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        cleanupAndResolve(false);
                    }
                });
            }

            if (config.focusTrap) {
                this.trapFocus(dialog);
            }

            confirmBtn.focus();
        });
    }

    trapFocus(dialog) {
        const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // 【为什么不能用 document.activeElement】shadow 模式下焦点在 shadow 树内时，
        // 它恒为 shadow host，与 firstElement/lastElement 永不相等、也不被 dialog.contains
        // 包含 → 两个分支都不成立 → Tab 焦点直接跑出弹窗（aria-modal 被违背），
        // 且焦点一旦离开 dialog，绑在 dialog 上的监听再也收不到 keydown，
        // 连 Escape 一起失效。真实元素见 domRef.deepActiveElement。
        //
        // 【为什么监听挂 document】陷阱的职责就是「保证焦点不出容器」，
        // 若把监听挂在可能被逃离的容器自身，就形成了「一旦失效便彻底失效」的死结。
        const trapHandler = (e) => {
            if (e.key === 'Tab') {
                const active = deepActiveElement();
                if (e.shiftKey) {
                    if (active === firstElement || !dialog.contains(active)) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (active === lastElement || !dialog.contains(active)) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                this.closeCurrent();
            }
        };

        document.addEventListener('keydown', trapHandler, true);
        dialog._focusTrapHandler = trapHandler;
    }

    closeCurrent() {
        if (!this.currentDialog) return;

        const { overlay, dialog, resolve, config } = this.currentDialog;
        const alreadyResolved = this._currentResolved;

        if (dialog._focusTrapHandler) {
            // 监听注册在 document 捕获阶段（见 trapFocus），解绑参数必须完全一致，
            // 否则关不掉、且下一个弹窗会叠加一个陷阱。
            document.removeEventListener('keydown', dialog._focusTrapHandler, true);
            dialog._focusTrapHandler = null;
        }

        overlay.classList.remove('confirm-visible');
        overlay.classList.add('confirm-hiding');

        setTimeout(() => {
            overlay.remove();
            if (!alreadyResolved) {
                const hasExtra = !!config.extraOptions;
                resolve(hasExtra
                    ? { confirmed: false, extraValues: {}, dismissed: true }
                    : false);
            }
        }, 200);

        this.currentDialog = null;
    }

    _renderExtraOptions(extraOptions) {
        if (!extraOptions) return '';
        const groups = Array.isArray(extraOptions) ? extraOptions : [extraOptions];
        return groups.map(group => {
            if (!group || !group.key) return '';
            const labelHtml = group.label
                ? `<div class="confirm-extra-label">${HTMLUtils.escapeHtml(group.label)}</div>`
                : '';
            const choicesHtml = (group.choices || []).map(choice => {
                const checked = choice.default ? 'checked' : '';
                return `
                    <label class="confirm-extra-choice">
                        <input type="radio" name="${HTMLUtils.escapeHtmlAttr(group.key)}" value="${HTMLUtils.escapeHtmlAttr(choice.value)}" ${checked}>
                        <span class="confirm-extra-choice-mark"></span>
                        <span class="confirm-extra-choice-label">${HTMLUtils.escapeHtml(choice.label)}</span>
                    </label>
                `;
            }).join('');
            return `<div class="confirm-extra">${labelHtml}<div class="confirm-extra-choices">${choicesHtml}</div></div>`;
        }).join('');
    }

    confirm(options = {}) {
        return this.show(options);
    }

    alert(options = {}) {
        return this.show({
            ...options,
            cancelText: options.okText || '确定',
            showCancel: false
        });
    }

    danger(options = {}) {
        return this.show({
            ...options,
            danger: true,
            confirmClass: 'bm-btn--danger'
        });
    }

    delete(itemName = '此项') {
        return this.danger({
            title: '确认删除',
            message: `确定要删除 ${HTMLUtils.escapeHtml(itemName)} 吗？此操作无法撤销。`,
            confirmText: '删除',
            cancelText: '取消'
        });
    }

    confirmDelete(message = '确定要删除此项目吗？此操作无法撤销。') {
        return this.danger({
            title: '确认删除',
            message,
            confirmText: '删除',
            cancelText: '取消'
        });
    }

    warning(title, message) {
        return this.show({
            title,
            message,
            confirmText: '继续',
            cancelText: '取消'
        });
    }
}

export const Confirm = new ConfirmDialog();
window.ConfirmDialog = ConfirmDialog;

ConfirmDialog.confirmDelete = (message) => Confirm.confirmDelete(message);
ConfirmDialog.delete = (itemName) => Confirm.delete(itemName);
ConfirmDialog.danger = (options) => Confirm.danger(options);
ConfirmDialog.confirm = (options) => Confirm.confirm(options);
ConfirmDialog.alert = (options) => Confirm.alert(options);
ConfirmDialog.warning = (title, message) => Confirm.warning(title, message);