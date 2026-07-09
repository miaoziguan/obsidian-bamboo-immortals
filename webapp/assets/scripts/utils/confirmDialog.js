import { modalMount } from './domRef.js';
export class ConfirmDialog {
    constructor() {
        this.defaults = {
            title: '确认操作',
            message: '确定要执行此操作吗？',
            confirmText: '确定',
            cancelText: '取消',
            confirmClass: 'btn-primary',
            cancelClass: 'btn-secondary',
            danger: false,
            modal: true,
            closeOnConfirm: true,
            closeOnCancel: true,
            closeOnBackdrop: true,
            focusTrap: true
        };
        this.currentDialog = null;
    }

    show(options = {}) {
        const config = { ...this.defaults, ...options };

        return new Promise((resolve) => {
            if (this.currentDialog) {
                this.closeCurrent();
            }

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
                    <p class="confirm-message">${config.message || ''}</p>
                    ${this._renderExtraOptions(config.extraOptions)}
                </div>
                <div class="confirm-footer">
                    <button class="btn ${HTMLUtils.escapeHtmlAttr(config.cancelClass)} confirm-cancel-btn">
                        ${HTMLUtils.escapeHtml(config.cancelText)}
                    </button>
                    <button class="btn ${HTMLUtils.escapeHtmlAttr(config.confirmClass)} confirm-confirm-btn ${config.danger ? 'btn-danger' : ''}">
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
                this.trapFocus(dialog, confirmBtn);
            }

            confirmBtn.focus();
        });
    }

    trapFocus(dialog, initialFocus) {
        const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const trapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                this.closeCurrent();
            }
        };

        dialog.addEventListener('keydown', trapHandler);
        dialog._focusTrapHandler = trapHandler;
    }

    closeCurrent() {
        if (!this.currentDialog) return;

        const { overlay, dialog, resolve, config } = this.currentDialog;
        const alreadyResolved = this._currentResolved;

        if (dialog._focusTrapHandler) {
            dialog.removeEventListener('keydown', dialog._focusTrapHandler);
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
            confirmClass: 'btn-danger'
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