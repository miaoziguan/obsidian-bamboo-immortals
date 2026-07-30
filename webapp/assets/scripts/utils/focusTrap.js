/**
 * FocusTrap — 模态框焦点陷阱
 *
 * 将 Tab / Shift+Tab 焦点限制在指定 rootElement 内循环，
 * Escape 触发可选回调，deactivate 时归还焦点到 activate 前聚焦的元素。
 *
 * 用法：
 *   FocusTrap.activate(modalContent, { onEscape: () => Handlers.closeModal() });
 *   FocusTrap.deactivate();
 */

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button',
    'textarea',
    'input[type="text"]',
    'input[type="number"]',
    'input[type="search"]',
    'input[type="email"]',
    'input[type="password"]',
    'select',
    '[tabindex]:not([tabindex="-1"])'
].join(', ');

function getFocusableElements(root) {
    if (!root) return [];
    const elements = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR));
    return elements.filter((el) => {
        if (el.disabled) return false;
        if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
        const tabIndex = el.getAttribute('tabindex');
        if (tabIndex && Number(tabIndex) < 0) return false;
        return true;
    });
}

function isElementVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function trapContext() {
    if (typeof window === 'undefined') return null;
    if (!window.__bambooFocusTrap) {
        window.__bambooFocusTrap = {
            root: null,
            previouslyFocused: null,
            keyHandler: null,
            options: {}
        };
    }
    return window.__bambooFocusTrap;
}

function handleKeyDown(e) {
    const ctx = trapContext();
    if (!ctx || !ctx.root) return;

    if (e.key === 'Escape' && typeof ctx.options.onEscape === 'function') {
        e.preventDefault();
        ctx.options.onEscape();
        return;
    }

    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements(ctx.root).filter(isElementVisible);
    if (focusable.length === 0) {
        e.preventDefault();
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
        if (active === first || !ctx.root.contains(active)) {
            e.preventDefault();
            last.focus();
        }
    } else {
        if (active === last || !ctx.root.contains(active)) {
            e.preventDefault();
            first.focus();
        }
    }
}

export const FocusTrap = {
    /**
     * 激活焦点陷阱
     * @param {HTMLElement} rootElement — 焦点循环边界
     * @param {Object} [options]
     * @param {Function} [options.onEscape] — 按 Escape 时回调
     * @param {HTMLElement} [options.previouslyFocused] — 关闭后归还焦点的元素（默认取激活前 activeElement）
     */
    activate(rootElement, options = {}) {
        const ctx = trapContext();
        if (!ctx) return;

        this.deactivate();

        ctx.root = rootElement;
        ctx.options = options || {};
        ctx.previouslyFocused = options.previouslyFocused || document.activeElement;
        ctx.keyHandler = (e) => handleKeyDown(e);

        document.addEventListener('keydown', ctx.keyHandler, true);
    },

    /**
     * 关闭焦点陷阱并归还焦点
     */
    deactivate() {
        const ctx = trapContext();
        if (!ctx || !ctx.keyHandler) return;

        document.removeEventListener('keydown', ctx.keyHandler, true);
        ctx.keyHandler = null;
        ctx.root = null;
        ctx.options = {};

        if (ctx.previouslyFocused && typeof ctx.previouslyFocused.focus === 'function') {
            // 延迟一帧，避免弹窗 DOM 移除导致焦点被重置到 body
            requestAnimationFrame(() => {
                if (ctx.previouslyFocused && ctx.previouslyFocused.isConnected) {
                    ctx.previouslyFocused.focus();
                }
                ctx.previouslyFocused = null;
            });
        }
    },

    /**
     * 获取当前焦点陷阱内的可聚焦元素（供调用方做初始焦点）
     * @param {HTMLElement} [root] — 默认当前 root
     */
    getFocusable(root) {
        const ctx = trapContext();
        const target = root || (ctx && ctx.root);
        return target ? getFocusableElements(target).filter(isElementVisible) : [];
    }
};
