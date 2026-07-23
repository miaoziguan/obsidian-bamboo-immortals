import { getDomRoot } from './domRef.js';

export const ActionDispatcher = {
    _handlers: {},

    register(action, handler) {
        this._handlers[action] = handler;
    },

    registerMany(map) {
        Object.assign(this._handlers, map);
    },

    // Shadow DOM 下事件 e.target 会被 retarget 成 host，故用 composedPath() 取
    // 真实路径（含 shadow 内节点）查找带 [data-action]/[data-stop-propagation] 的元素。
    _findClosestAttr(e, attr) {
        const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
        const list = path.length ? path : [e.target];
        for (const node of list) {
            if (node && node.nodeType === 1 && typeof node.closest === 'function') {
                const match = node.closest('[' + attr + ']');
                if (match) return match;
            }
        }
        return null;
    },

    init() {
        getDomRoot().addEventListener('click', (e) => {
            const target = this._findClosestAttr(e, 'data-action');
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

            const stopEl = this._findClosestAttr(e, 'data-stop-propagation');
            if (stopEl) {
                e.stopImmediatePropagation();
            }
        });

        getDomRoot().addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;

            const target = this._findClosestAttr(e, 'data-action');
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
