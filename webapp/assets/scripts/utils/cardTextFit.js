/**
 * 便签正文「字号自适应」—— 定框纸样（装饰画框固定、正文 overflow:auto）
 * 内容放不下时自动缩字号，尽量不出现滚动条。
 *
 * 背景：装饰性纸样（红笺/若水/腾云/举火/映月 + 市场插画纸样）的卡片是【定高画框】，
 * 美术不能动（一改比例插画就变形）。所以不采用"卡片随内容长高"，而是让字号微调去适配框。
 * 素笺/夜光这类【自适应高度】的正文 overflow 为 visible，本工具会直接跳过、不做任何改动。
 */

/** 缩放下限：再小就影响可读性，兜底仍允许滚动 */
export const MIN_FIT_SCALE = 0.7;

/**
 * 纯函数：根据「内容高 / 可视高」算出应缩到的比例（便于单测，不触碰 DOM）。
 * @param {number} scrollH 内容高度（el.scrollHeight）
 * @param {number} clientH 可视高度（el.clientHeight）
 * @param {number} [min] 最小比例
 * @returns {number} 1 表示无需缩放；否则返回 (min,1] 之间的比例
 */
export function computeFitScale(scrollH, clientH, min = MIN_FIT_SCALE) {
    const sh = Number(scrollH);
    const ch = Number(clientH);
    // 放得下，或拿不到布局信息（jsdom / 未挂载）→ 不缩放
    if (!(ch > 0) || !(sh > ch + 1)) return 1;
    const lo = Math.min(1, Math.max(0.1, Number(min) || MIN_FIT_SCALE));
    // 换行文本的高度与字号近似线性：先按可视/内容比估算，留 2% 余量
    const est = Math.min(1, (ch / sh) * 0.98);
    const s = Math.max(lo, est);
    return Math.round(s * 100) / 100;
}

/**
 * 让一张卡片的正文缩到能放进它的框里。
 * @param {HTMLElement} card 卡片元素
 * @param {number} [min] 最小比例
 * @returns {number} 实际应用的比例（1 = 未缩放）
 */
export function fitCardText(card, min = MIN_FIT_SCALE) {
    if (!card || typeof card.querySelector !== 'function') return 1;
    const el = card.querySelector('.tw-card-text');
    if (!el) return 1;

    // 只对「定框滚动」的正文生效。自适应高度的纸样（素笺/夜光）overflow 为 visible → 跳过并复原。
    let ov = '';
    try {
        ov = (typeof window !== 'undefined' && window.getComputedStyle)
            ? (window.getComputedStyle(el).overflowY || '') : '';
    } catch (e) {
        ov = '';
    }
    if (ov !== 'auto' && ov !== 'scroll') {
        el.style.fontSize = '';
        return 1;
    }

    // 先回到基准字号再测量（否则会基于上一次的缩放值反复叠加）
    el.style.fontSize = '';
    if (!(el.scrollHeight > el.clientHeight + 1)) return 1;   // 基准字号下就放得下

    let base = 16;
    try {
        base = parseFloat(window.getComputedStyle(el).fontSize) || 16;
    } catch (e) {
        base = 16;
    }

    let s = computeFitScale(el.scrollHeight, el.clientHeight, min);
    el.style.fontSize = (base * s).toFixed(2) + 'px';

    // 估算可能偏乐观（字号变化会改变换行数），最多再降几档直到真正放下
    const lo = Math.min(1, Math.max(0.1, Number(min) || MIN_FIT_SCALE));
    for (let i = 0; i < 8 && el.scrollHeight > el.clientHeight + 1 && s > lo; i++) {
        s = Math.max(lo, Math.round((s - 0.04) * 100) / 100);
        el.style.fontSize = (base * s).toFixed(2) + 'px';
    }
    return s;
}
