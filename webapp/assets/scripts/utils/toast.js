export class ToastManager {
    constructor() {
        this.container = null;
        this.queue = [];
        this.defaultDuration = 3000;
        this.maxVisible = 3;
        this.init();
    }

    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', '通知');
        document.body.appendChild(this.container);
    }

    show(options = {}) {
        const toast = {
            id: options.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: options.message || '',
            type: options.type || 'info',
            title: options.title || '',
            duration: options.duration !== undefined ? options.duration : this.defaultDuration,
            dismissible: options.dismissible !== false,
            actions: options.actions || [],
            onShow: options.onShow,
            onHide: options.onHide,
            onClick: options.onClick
        };

        if (this.queue.length >= this.maxVisible) {
            this.hideOldest();
        }

        this.queue.push(toast);
        this.render();
    }

    hideOldest() {
        if (this.queue.length > 0) {
            const oldest = this.queue.shift();
            this.removeToastElement(oldest.id);
        }
    }

    render() {
        this.cleanup();

        this.queue.forEach((toast, index) => {
            if (!document.getElementById(toast.id)) {
                const element = this.createToastElement(toast);
                this.container.appendChild(element);

                requestAnimationFrame(() => {
                    element.classList.add('toast-visible');
                });

                if (toast.onShow) {
                    toast.onShow(element);
                }

                if (toast.duration > 0) {
                    toast.timeoutId = setTimeout(() => {
                        this.hide(toast.id);
                    }, toast.duration);
                }
            }
        });
    }

    createToastElement(toast) {
        const element = document.createElement('div');
        element.id = toast.id;
        element.className = `toast toast-${toast.type}`;
        element.setAttribute('role', 'alert');

        if (toast.onClick) {
            element.style.cursor = 'pointer';
            element.addEventListener('click', () => {
                if (toast.onClick) {
                    toast.onClick(toast);
                }
            });
        }

        const icon = this.getIcon(toast.type);
        const titleHtml = toast.title ? `<div class="toast-title">${HTMLUtils.escapeHtml(toast.title)}</div>` : '';
        const messageHtml = `<div class="toast-message">${HTMLUtils.escapeHtml(toast.message)}</div>`;

        let actionsHtml = '';
        if (toast.actions.length > 0) {
            actionsHtml = '<div class="toast-actions">';
            toast.actions.forEach(action => {
                actionsHtml += `<button class="toast-action-btn" data-action="${HTMLUtils.escapeHtmlAttr(action.id)}">${HTMLUtils.escapeHtml(action.label)}</button>`;
            });
            actionsHtml += '</div>';
        }

        const closeBtn = toast.dismissible
            ? `<button class="toast-close-btn" aria-label="关闭" data-action="toast-hide" data-toast-id="${toast.id}">×</button>`
            : '';

        element.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <div class="toast-body">
                    ${titleHtml}
                    ${messageHtml}
                    ${actionsHtml}
                </div>
            </div>
            ${closeBtn}
        `;

        if (toast.actions.length > 0) {
            element.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('.toast-action-btn');
                if (actionBtn) {
                    const actionId = actionBtn.dataset.action;
                    const action = toast.actions.find(a => a.id === actionId);
                    if (action && action.callback) {
                        action.callback(toast);
                    }
                }
            });
        }

        return element;
    }

    getIcon(type) {
        const icons = {
            success: LucideUtils.createIcon('check', { size: 16 }),
            error: LucideUtils.createIcon('x', { size: 16 }),
            warning: LucideUtils.createIcon('alertTriangle', { size: 16 }),
            info: LucideUtils.createIcon('info', { size: 16 }),
            loading: LucideUtils.createIcon('refreshCw', { size: 16 })
        };
        return icons[type] || icons.info;
    }

    hide(id) {
        const index = this.queue.findIndex(t => t.id === id);
        if (index === -1) return;

        const toast = this.queue[index];
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }

        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('toast-visible');
            element.classList.add('toast-hiding');

            setTimeout(() => {
                this.removeToastElement(id);
            }, 300);
        }

        this.queue.splice(index, 1);

        if (toast.onHide) {
            toast.onHide();
        }
    }

    removeToastElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    cleanup() {
        const elements = this.container.querySelectorAll('.toast');
        elements.forEach(el => {
            if (!this.queue.find(t => t.id === el.id)) {
                el.remove();
            }
        });
    }

    clear() {
        this.queue.forEach(toast => {
            if (toast.timeoutId) {
                clearTimeout(toast.timeoutId);
            }
        });
        this.queue = [];
        this.container.innerHTML = '';
    }

    success(message, options = {}) {
        return this.show({ ...options, message, type: 'success' });
    }

    error(message, options = {}) {
        return this.show({ ...options, message, type: 'error', duration: options.duration || 5000 });
    }

    warning(message, options = {}) {
        return this.show({ ...options, message, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show({ ...options, message, type: 'info' });
    }

    loading(message, options = {}) {
        return this.show({ ...options, message, type: 'loading', dismissible: false });
    }

    /**
     * 无障碍播报：向 sr-announcements 区域写入消息
     */
    announce(message, priority = 'polite') {
        const announcer = document.getElementById('sr-announcements');
        if (announcer) {
            announcer.setAttribute('aria-live', priority);
            announcer.textContent = message;
            setTimeout(() => { announcer.textContent = ''; }, 1000);
        }
    }

    /**
     * 向后兼容的便捷方法：Toast.showToast(message, type)
     * 替代原 store.showToast(message, type)
     */
    showToast(message, type = 'success') {
        const durationMap = { success: 3000, error: 5000, warning: 4000, info: 3000 };
        const announcePriority = type === 'error' ? 'assertive' : 'polite';
        this.announce(message, announcePriority);
        return this.show({ message, type, duration: durationMap[type] || 3000 });
    }
}

export const Toast = new ToastManager();
ActionDispatcher.registerMany({
    'toast-hide': (ds) => Toast.hide(ds.toastId)
});

window.Toast = Toast;
