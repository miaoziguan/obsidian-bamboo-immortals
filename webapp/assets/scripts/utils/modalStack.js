export class ModalStack {
    constructor() {
        this.stack = [];
        this.backdrop = null;
        this.activeModal = null;
        this.lastFocusedElement = null;
        this.onModalChange = null;
        this.animationDuration = 300;
    }

    push(config) {
        const modalId = config.id || `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const modalConfig = {
            id: modalId,
            content: config.content,
            title: config.title || '',
            className: config.className || '',
            size: config.size || 'medium',
            dismissible: config.dismissible !== false,
            focusTrap: config.focusTrap !== false,
            onOpen: config.onOpen,
            onClose: config.onClose,
            onBeforeClose: config.onBeforeClose,
            onAfterClose: config.onAfterClose
        };

        this.stack.push(modalConfig);
        this.render();

        EventBus.emit('modal:opened', { modalId, config: modalConfig });

        return modalId;
    }

    pop() {
        if (this.stack.length === 0) return false;

        const currentModal = this.stack[this.stack.length - 1];

        if (currentModal.onBeforeClose) {
            const shouldClose = currentModal.onBeforeClose();
            if (shouldClose === false) return false;
        }

        return this.close(currentModal.id);
    }

    close(modalId) {
        const index = this.stack.findIndex(m => m.id === modalId);
        if (index === -1) return false;

        const modal = this.stack[index];

        if (modal.onBeforeClose) {
            const shouldClose = modal.onBeforeClose();
            if (shouldClose === false) return false;
        }

        const wasActive = index === this.stack.length - 1;

        if (wasActive && this.activeModal) {
            this.activeModal.classList.add('modal-closing');
        }

        setTimeout(() => {
            this.stack.splice(index, 1);

            if (modal.onClose) {
                modal.onClose();
            }

            EventBus.emit('modal:closed', { modalId, config: modal });

            if (wasActive) {
                this.render();
            }

            if (modal.onAfterClose) {
                modal.onAfterClose();
            }
        }, this.animationDuration);

        return true;
    }

    closeAll() {
        const modals = [...this.stack];

        modals.forEach((modal, index) => {
            setTimeout(() => {
                if (this.stack.find(m => m.id === modal.id)) {
                    this.close(modal.id);
                }
            }, index * 100);
        });
    }

    render() {
        if (this.stack.length === 0) {
            this.hideBackdrop();
            this.restoreFocus();
            return;
        }

        const currentModal = this.stack[this.stack.length - 1];
        this.showBackdrop();
        this.renderModal(currentModal);
    }

    showBackdrop() {
        if (!this.backdrop) {
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'modal-backdrop';
            this.backdrop.addEventListener('click', () => {
                const currentModal = this.stack[this.stack.length - 1];
                if (currentModal?.dismissible) {
                    this.pop();
                }
            });
            document.body.appendChild(this.backdrop);
        }

        this.backdrop.classList.remove('backdrop-hidden');
        this.backdrop.classList.add('backdrop-visible');
        this.backdrop.setAttribute('aria-hidden', 'false');
    }

    hideBackdrop() {
        if (this.backdrop) {
            this.backdrop.classList.remove('backdrop-visible');
            this.backdrop.classList.add('backdrop-hidden');
            this.backdrop.setAttribute('aria-hidden', 'true');

            setTimeout(() => {
                if (this.stack.length === 0 && this.backdrop) {
                    this.backdrop.remove();
                    this.backdrop = null;
                }
            }, this.animationDuration);
        }
    }

    renderModal(config) {
        if (this.activeModal) {
            this.activeModal.remove();
            this.activeModal = null;
        }

        const modal = document.createElement('div');
        modal.id = `modal-${config.id}`;
        modal.className = `modal modal-${config.size} ${config.className}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `modal-${config.id}-title`);
        modal.setAttribute('tabindex', '-1');

        const sizeClass = {
            small: 'modal-small',
            medium: 'modal-medium',
            large: 'modal-large',
            full: 'modal-full'
        }[config.size] || 'modal-medium';

        modal.innerHTML = `
            <div class="modal-content ${sizeClass}">
                ${config.title ? `
                    <div class="modal-header">
                        <h2 id="modal-${config.id}-title" class="modal-title">${escapeHtml(config.title)}</h2>
                        ${config.dismissible ? `
                            <button class="modal-close-btn"
                                    aria-label="关闭模态框"
                                    data-action="modal-stack-close" data-modal-id="${config.id}">
                                ${LucideUtils.createIcon('x', { size: 16 })}
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="modal-body" role="document">
                    ${config.content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            modal.classList.add('modal-visible');
            this.activeModal = modal;

            if (config.focusTrap) {
                this.setupFocusTrap(modal);
            }

            if (config.onOpen) {
                config.onOpen();
            }

            EventBus.emit('modal:rendered', { modalId: config.id, element: modal });
        }, 50);
    }

    setupFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const trapFocus = (e) => {
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
                const currentModal = this.stack[this.stack.length - 1];
                if (currentModal?.dismissible) {
                    this.pop();
                }
            }
        };

        modal.addEventListener('keydown', trapFocus);
        modal._focusTrapHandler = trapFocus;

        firstElement.focus();
    }

    removeFocusTrap(modal) {
        if (modal._focusTrapHandler) {
            modal.removeEventListener('keydown', modal._focusTrapHandler);
            modal._focusTrapHandler = null;
        }
    }

    saveFocus() {
        this.lastFocusedElement = document.activeElement;
    }

    restoreFocus() {
        if (this.lastFocusedElement && document.body.contains(this.lastFocusedElement)) {
            this.lastFocusedElement.focus();
        }
        this.lastFocusedElement = null;
    }

    getActiveModal() {
        return this.stack[this.stack.length - 1] || null;
    }

    getStackSize() {
        return this.stack.length;
    }

    isOpen(modalId) {
        return this.stack.some(m => m.id === modalId);
    }

    update(modalId, updates) {
        const index = this.stack.findIndex(m => m.id === modalId);
        if (index === -1) return false;

        const modal = this.stack[index];
        Object.assign(modal, updates);

        if (index === this.stack.length - 1) {
            this.render();
        }

        return true;
    }
}

ActionDispatcher.registerMany({
    'modal-stack-close': (ds) => ModalStack.close(ds.modalId)
});

window.ModalStack = new ModalStack();