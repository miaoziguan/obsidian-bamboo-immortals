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
            let target = this._findClosestAttr(e, 'data-action');
            // Fallback：浏览器命中测试有时会把点击事件派发到带 transform 的父元素而非子按钮
            // （如 .todo-item:hover 的 translateX），导致 composedPath 中缺失真正的 data-action 元素。
            // 此时用真实坐标从 shadow DOM 重新取最顶层元素补齐。
            if (!target && typeof e.clientX === 'number') {
                try {
                    const sr = window.__bambooShadowRoot;
                    const topEl = sr && sr.elementFromPoint
                        ? sr.elementFromPoint(e.clientX, e.clientY)
                        : document.elementFromPoint(e.clientX, e.clientY);
                    if (topEl && topEl.nodeType === 1) {
                        const closest = topEl.closest ? topEl.closest('[data-action]') : null;
                        target = closest || (topEl.getAttribute && topEl.getAttribute('data-action') ? topEl : target);
                    }
                } catch (_) {}
            }
            if (target) {
                const action = target.dataset.action;
                const handler = this._handlers[action];
                if (handler) {
                    const isToggleInput = target.tagName === 'INPUT' && (target.type === 'checkbox' || target.type === 'radio');
                    // <select> 等表单控件靠 change 事件触发，click 阶段不能 preventDefault，
                    // 否则原生下拉框无法正常展开
                    const isFormControl = target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
                    if (!isToggleInput && !isFormControl) {
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

        // <select> 等表单控件靠 change 事件触发，而非 click/keydown
        getDomRoot().addEventListener('change', (e) => {
            const target = this._findClosestAttr(e, 'data-action');
            if (!target) return;
            // checkbox/radio 的状态切换已由 click 监听器派发，若此处再派发会双触发
            // （一次 .click() 在浏览器/jsdom 中同时产生 click + change 两个事件）。
            // 故 change 仅服务于 <select>/<textarea> 等需 change 的控件，跳过 toggle input。
            if (target.tagName === 'INPUT' && (target.type === 'checkbox' || target.type === 'radio')) {
                return;
            }

            const action = target.dataset.action;
            const handler = this._handlers[action];
            if (!handler) return;

            e.stopImmediatePropagation();
            handler(target.dataset, target, e);
        });
    }
};

window.ActionDispatcher = ActionDispatcher;
