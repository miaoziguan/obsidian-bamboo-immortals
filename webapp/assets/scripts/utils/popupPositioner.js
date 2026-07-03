/**
 * 弹层定位工具
 *
 * 抽自 goals/renderer.js 中三个 Picker（_showDateRangePicker / _showCategoryPicker / _showPriorityPicker）
 * 重复的"等下一帧测尺寸 + 边界适配"逻辑。
 *
 * 职责：
 * 1. 在下一帧测量弹层尺寸
 * 2. 给出"理想位置"（默认在触发元素下方，或居中）
 * 3. 边界适配：下方溢出翻上方、上方仍不够贴顶 + 启用滚动、右溢出贴右、左溢出贴左
 * 4. 直接把 position 写到元素 style 上
 *
 * 注意：DateRange 原本没"左溢出贴左"分支 —— 这里统一加上，行为更稳，不影响视觉。
 */
export const PopupPositioner = (function () {
    'use strict';

    const DEFAULT_PADDING = 8;
    const DEFAULT_FALLBACK_W = 300;
    const DEFAULT_FALLBACK_H = 400;

    /**
     * 测量元素尺寸（已 append 到 DOM 后才能量）
     * @param {HTMLElement} el
     * @returns {DOMRect|null} 拿不到（hidden / detached）返回 null
     */
    function measure(el) {
        try {
            const r = el.getBoundingClientRect();
            if (r && (r.width > 0 || r.height > 0)) return r;
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * 把位置写到 style 上
     * @param {HTMLElement} el
     * @param {{top: number, left: number, maxHeight?: number}} pos
     */
    function applyPosition(el, pos) {
        const parts = [
            'position:fixed',
            `top:${Math.round(pos.top)}px`,
            `left:${Math.round(pos.left)}px`,
            'z-index:10000',
        ];
        el.style.cssText = parts.join(';');
        if (pos.maxHeight) {
            el.style.maxHeight = pos.maxHeight + 'px';
            el.style.overflowY = 'auto';
        }
    }

    /**
     * 在下一帧（DOM 已渲染完）执行定位
     *
     * @param {Object} opts
     * @param {HTMLElement} opts.popupElement  要定位的弹层（已 append 到 body）
     * @param {DOMRect|null} opts.anchorRect   触发元素 rect；null/undefined 时居中显示
     * @param {Object} [opts.anchor]           触发元素位置策略
     * @param {'below-center'|'below-left'} [opts.anchor.placement='below-left']
     *   - below-center: 弹层水平居中于触发元素
     *   - below-left:   弹层左对齐触发元素
     * @param {Object} [opts.fallbackSize]     拿不到尺寸时的兜底（用于提前算位置）
     * @param {number} [opts.fallbackSize.width=300]
     * @param {number} [opts.fallbackSize.height=400]
     * @param {number} [opts.padding=8]        屏幕边缘留白
     * @param {boolean} [opts.flipUpWhenTooLow=true] 下方空间不够时翻到上方
     * @returns {DOMRect|null} 实测得到的 popupRect（同时已写入 style）
     */
    function positionNextFrame(opts) {
        const {
            popupElement,
            anchorRect = null,
            anchor = {},
            fallbackSize = {},
            padding = DEFAULT_PADDING,
            flipUpWhenTooLow = true,
        } = opts;

        if (!popupElement) return null;

        // 同步执行：测量 + 写位置。调用方通常包在 requestAnimationFrame 里，
        // 但这里不强制要求 —— 拿到能拿到的尺寸立即定位。
        const pickerRect = measure(popupElement);
        const fallbackW = fallbackSize.width || DEFAULT_FALLBACK_W;
        const fallbackH = fallbackSize.height || DEFAULT_FALLBACK_H;
        const effectiveW = pickerRect ? pickerRect.width : fallbackW;
        const effectiveH = pickerRect ? pickerRect.height : fallbackH;
        const placement = anchor.placement || 'below-left';

        // 1. 算理想位置
        let top, left;
        const hasAnchor = anchorRect && (anchorRect.width > 0 || anchorRect.height > 0);

        if (hasAnchor) {
            top = anchorRect.bottom + padding;
            if (placement === 'below-center') {
                left = anchorRect.left + anchorRect.width / 2 - effectiveW / 2;
            } else {
                // below-left
                left = anchorRect.left;
            }
        } else {
            top = window.innerHeight / 2 - effectiveH / 2;
            left = window.innerWidth / 2 - effectiveW / 2;
        }

        // 2. 边界适配（只有拿到 pickerRect 才精确做）
        let maxHeight = null;
        if (pickerRect) {
            // 垂直：下方溢出 → 翻上方（如果允许）
            if (flipUpWhenTooLow && top + pickerRect.height > window.innerHeight - padding) {
                top = hasAnchor ? anchorRect.top - pickerRect.height - padding : padding;
            }
            // 上方也不够 → 贴顶 + 启用内部滚动
            if (top < padding) {
                top = padding;
                maxHeight = window.innerHeight - padding * 2;
            }

            // 水平：右溢出贴右
            if (left + pickerRect.width > window.innerWidth - padding) {
                left = window.innerWidth - pickerRect.width - padding;
            }
            // 左溢出贴左
            if (left < padding) left = padding;
        } else {
            // 没拿到 pickerRect，至少别贴边
            top = Math.max(padding, top);
            left = Math.max(padding, left);
        }

        applyPosition(popupElement, { top, left, maxHeight });
        return pickerRect;
    }

    /**
     * 包装 requestAnimationFrame + positionNextFrame 的便捷方法
     * @param {Object} opts 同 positionNextFrame
     */
    function positionOnNextFrame(opts) {
        requestAnimationFrame(() => positionNextFrame(opts));
    }

    return {
        measure,
        positionNextFrame,
        positionOnNextFrame,
    };
})();

// 浏览器 + Node 双导出
if (typeof window !== 'undefined') {
    window.PopupPositioner = PopupPositioner;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PopupPositioner;
}
