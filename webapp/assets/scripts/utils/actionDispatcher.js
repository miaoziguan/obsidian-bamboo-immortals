export const ActionDispatcher = {
    _handlers: {},

    register(action, handler) {
        this._handlers[action] = handler;
    },

    registerMany(map) {
        Object.assign(this._handlers, map);
    },

    init() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (target) {
                const action = target.dataset.action;
                const handler = this._handlers[action];
                if (handler) {
                    const isToggleInput = target.tagName === 'INPUT' && (target.type === 'checkbox' || target.type === 'radio');
                    if (!isToggleInput) {
                        e.preventDefault();
                    }
                    e.stopImmediatePropagation();
                    handler(target.dataset, target, e);
                    return;
                }
            }

            const stopEl = e.target.closest('[data-stop-propagation]');
            if (stopEl) {
                e.stopImmediatePropagation();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;

            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const handler = this._handlers[action];
            if (!handler) return;

            e.preventDefault();
            handler(target.dataset, target, e);
        });
    }
};

window.ActionDispatcher = ActionDispatcher;
