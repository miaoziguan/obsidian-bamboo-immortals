/**
 * CanvasZoomUI — 画布缩放控件（便签画布与思维子弹共用同一套）
 *
 * 为什么必须有（不是"锦上添花"）：
 *  · **无障碍硬要求**：WCAG 2.5.1 规定多点手势（双指捏合）必须提供单指替代方案，
 *    只有捏合而没有按钮，在做无障碍合规时是不合格的；
 *  · **平板现实**：平板没有键盘，若只有 ⌘/Ctrl+滚轮，等于缩放入口不存在。
 *
 * 本组件只负责 UI 与事件，具体视口读写全部经 adapter 注入，
 * 因此便签（ctrl._canvasOffset）与思维子弹（_view）两套存储都能复用。
 */
import { CanvasViewport } from './CanvasViewport.js';

export const CanvasZoomUI = {
  STEP: 1.25,   // 每点一档的缩放倍率（与常见画布一致）

  /**
   * @param {HTMLElement} host    挂载容器（各模式的层根，控件绝对定位于其右下角）
   * @param {object} adapter      { getCanvas(), getView(), setView(v), zoomAtCenter(f), reset(), fit() }
   * @returns {{el: HTMLElement, sync: Function}|null}
   */
  mount(host, adapter) {
    if (!host || !adapter || typeof document === 'undefined') return null;
    // 幂等：只认「本宿主直接挂载」的那条。
    // 不能用 querySelector('.tw-zoom-bar')：它连后代一起搜，而导图层(.tw-mm)就挂在便签 wrap 里，
    // 于是便签侧会把导图先插好的缩放条误判成自己的 → 便签的缩放条永远不会被创建
    // （表现为「只有思维子弹模式看得到缩放控件」）。
    for (let i = 0; i < host.children.length; i++) {
      const c = host.children[i];
      if (c && c.classList && c.classList.contains('tw-zoom-bar')) return null;
    }

    const bar = document.createElement('div');
    bar.className = 'tw-zoom-bar';
    // 素材市场按钮：仅当 adapter 提供 onMarket 回调时才生成（导图层那条 bar 不传 → 不生成按钮，
    // 从根上避免「同一 wrap 下多条形 bar，querySelector 命中错按钮」的问题）。
    const marketBtn = (typeof adapter.onMarket === 'function')
      ? '<button type="button" class="tw-zoom-btn tw-zoom-market" data-act="market" title="素材市场" aria-label="素材市场"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/></svg></button>'
      : '';
    // 抓手（平移）按钮：仅当 adapter 提供 onHand 时才生成 —— 目前只有思维子弹传
    // （便签档没有 handTool 机制，不传 → 不出现）。图标沿用缩放条既有内联 SVG 规范
    // （viewBox 0 0 24 24 / width、height 18 / stroke 1.7 / currentColor），与素材市场键同款。
    const handBtn = (typeof adapter.onHand === 'function')
      ? '<button type="button" class="tw-zoom-btn tw-zoom-hand" data-act="hand" title="抓手：拖动画布平移（移动端替代双指捏合）" aria-label="抓手 / 平移画布"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></button>'
      : '';
    bar.innerHTML = handBtn + `
      <button type="button" class="tw-zoom-btn" data-act="out"  title="缩小" aria-label="缩小">−</button>
      <button type="button" class="tw-zoom-val" data-act="reset" title="点击重置为 100%" aria-label="重置缩放为 100%">100%</button>
      <button type="button" class="tw-zoom-btn" data-act="in"   title="放大" aria-label="放大">+</button>
      <button type="button" class="tw-zoom-btn" data-act="fit"  title="适应内容" aria-label="适应内容">⤢</button>` + marketBtn;
    host.appendChild(bar);

    const valEl = bar.querySelector('.tw-zoom-val');
    const handEl = bar.querySelector('.tw-zoom-hand');
    const sync = () => {
      const s = CanvasViewport.scaleOf(adapter.getView());
      const txt = Math.round(s * 100) + '%';
      if (valEl.textContent !== txt) valEl.textContent = txt;
      // 抓手开启态：由 adapter 提供 isHandActive（导图传 handTool 真值），复用同一 sync 刷新
      if (handEl && typeof adapter.isHandActive === 'function') {
        handEl.classList.toggle('active', !!adapter.isHandActive());
      }
    };

    // 控件上的指针事件不得冒泡到画布：否则点按钮会同时触发平移/取消选中
    bar.addEventListener('pointerdown', (e) => e.stopPropagation());
    bar.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const act = btn.dataset.act;
      try {
        if (act === 'in') adapter.zoomAtCenter(this.STEP);
        else if (act === 'out') adapter.zoomAtCenter(1 / this.STEP);
        else if (act === 'reset') adapter.reset();
        else if (act === 'fit') adapter.fit();
        else if (act === 'market' && typeof adapter.onMarket === 'function') adapter.onMarket();
        else if (act === 'hand' && typeof adapter.onHand === 'function') adapter.onHand();
      } catch (err) { /* 缩放控件失败不应影响画布 */ }
      sync();
    });

    sync();
    return { el: bar, sync };
  },
};

// 测试 harness（loadModule 剥离 import）兼容：挂到 globalThis。
if (typeof globalThis !== 'undefined') {
  globalThis.CanvasZoomUI = CanvasZoomUI;
}
