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
    // 层级配色开关（写作档专属）：所有层级卡按 data-level 铺低饱和底色。
    // 只有 adapter 提供 onTint 时才生成 —— 便签/导图不传 → 不出现；即便出现，
    // applyModeChrome 也会按档位 hidden（写作档才露出），避免「模式开关混在缩放组里」。
    // 图标：六段色环 —— 六段分别是色板里的 h1/h3/h4/h5/h6/quote 色相，直接用业务色板绘制。
    // 为什么不是「三条递减横线」：那读起来是「列表/对齐」，说不到「颜色」上；用户明确要求图标
    // 要跟配色对得上。色环的六段就是卡面实际会出现的色相，图标即功能预览。
    // 描边 2（其余图标 1.7）——色环是多段共圆，笔画太细会在 18px 上被切成虚线。
    // stroke 用 var(--bm-tint-*) 而非 currentColor：暗色块换了提亮版色板，图标自动跟随。
    const tintBtn = (typeof adapter.onTint === 'function')
      ? '<button type="button" class="tw-zoom-btn tw-zoom-tint" data-act="tint" title="层级配色：按卡片级别（H1–H6 / 引用 / 列表）铺不同底色（默认关）" aria-label="层级配色开关"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke-width="2" stroke-linecap="round"><path d="M19.78 12.54A7.8 7.8 0 0 1 16.36 18.47" stroke="var(--bm-tint-h1)"/><path d="M15.42 19.01A7.8 7.8 0 0 1 8.58 19.01" stroke="var(--bm-tint-h3)"/><path d="M7.64 18.47A7.8 7.8 0 0 1 4.22 12.54" stroke="var(--bm-tint-h4)"/><path d="M4.22 11.46A7.8 7.8 0 0 1 7.64 5.53" stroke="var(--bm-tint-h5)"/><path d="M8.58 4.99A7.8 7.8 0 0 1 15.42 4.99" stroke="var(--bm-tint-h6)"/><path d="M16.36 5.53A7.8 7.8 0 0 1 19.78 11.46" stroke="var(--bm-tint-quote)"/></svg></button>'
      : '';
    // 全部节点笔记（思维子弹专属）：一键展开/收起所有带笔记的节点卡片。
    // 只有导图 adapter 传 onToggleAllNotes → 其它档不生成（便签/写作没有节点笔记）。
    // 图标用「带折角的文稿」，刻意不同于工具条那枚纯横线的「节点笔记」键：
    // 工具条管「当前选中的这一个」，这里管「全部一起」，文稿轮廓表示「一批」。
    // 位置放在最左（与写作档的层级配色键同槽）——两个键互斥出现，视觉位置一致。
    const notesBtn = (typeof adapter.onToggleAllNotes === 'function')
      ? '<button type="button" class="tw-zoom-btn tw-zoom-notes" data-act="notes" title="全部节点笔记：一键展开 / 收起（只含有笔记的节点）" aria-label="展开或收起全部节点笔记"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.2z"/><path d="M13.5 3.5v4.2a1.5 1.5 0 0 0 1.5 1.5h4.2"/><path d="M8.8 13h6.4M8.8 16.4h4.2"/></svg></button>'
      : '';
    // 文章连线（写作档专属）：一个 toggle 键管「一键成链 ⇄ 一键清空」。
    // 为什么不是一个动作一个键：全篇粒度下「有连线 / 无连线」本就是互斥两态，
    // 两个并列按钮等于把同一个开关的两态摊成两个键，既占位又要读两遍才能决定点谁。
    // 图标随状态切换（未连线=链条，已连线=断链），title / aria-label 同步——点之前就知道会做什么。
    // 与 onTint 同一套 adapter 协议：只有传回调的档位才生成按钮，导图/便签的 bar 天然没有。
    const linkToggleBtn = (typeof adapter.onLinkToggle === 'function')
      ? '<button type="button" class="tw-zoom-btn tw-zoom-link-toggle" data-act="link-toggle" title="一键连线：按文章顺序把全部卡片连成一条链（可撤销）" aria-label="一键连线">'
        + '<svg class="tw-zoom-icon-link" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a4 4 0 0 0 5.66 0l2-2a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 11a4 4 0 0 0-5.66 0l-2 2A4 4 0 0 0 12 18.66l1-1"/></svg>'
        + '<svg class="tw-zoom-icon-unlink" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a4 4 0 0 0 5.66 0l2-2a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 11a4 4 0 0 0-5.66 0l-2 2A4 4 0 0 0 12 18.66l1-1"/><path d="M3 3l18 18"/></svg>'
        + '</button>'
      : '';
    // 卡片模糊跳转（便签 / 写作）：打开画布内的搜索浮层。
    // 只有传 onSearch 的档位才生成 —— 导图的节点搜索走它自己的工具栏。
    const searchBtn = (typeof adapter.onSearch === 'function')
      ? '<button type="button" class="tw-zoom-btn tw-zoom-search" data-act="search" title="跳转卡片：按内容模糊搜索并定位" aria-label="搜索并跳转卡片"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg></button>'
      : '';
    bar.innerHTML = notesBtn + tintBtn + handBtn + `
      <button type="button" class="tw-zoom-btn" data-act="out"  title="缩小" aria-label="缩小">−</button>
      <button type="button" class="tw-zoom-val" data-act="reset" title="点击重置为 100%" aria-label="重置缩放为 100%">100%</button>
      <button type="button" class="tw-zoom-btn" data-act="in"   title="放大" aria-label="放大">+</button>
      <button type="button" class="tw-zoom-btn" data-act="fit"  title="适应内容" aria-label="适应内容">⤢</button>` + marketBtn + linkToggleBtn + searchBtn;
    host.appendChild(bar);

    const valEl = bar.querySelector('.tw-zoom-val');
    const handEl = bar.querySelector('.tw-zoom-hand');
    const tintEl = bar.querySelector('.tw-zoom-tint');
    const notesEl = bar.querySelector('.tw-zoom-notes');
    const linkEl = bar.querySelector('.tw-zoom-link-toggle');
    const sync = () => {
      const s = CanvasViewport.scaleOf(adapter.getView());
      const txt = Math.round(s * 100) + '%';
      if (valEl.textContent !== txt) valEl.textContent = txt;
      // 抓手开启态：由 adapter 提供 isHandActive（导图传 handTool 真值），复用同一 sync 刷新
      if (handEl && typeof adapter.isHandActive === 'function') {
        handEl.classList.toggle('active', !!adapter.isHandActive());
      }
      // 层级配色开启态：与抓手同一套 .active 高亮（notes.css 的 .tw-zoom-bar button.active）
      if (tintEl && typeof adapter.isTintActive === 'function') {
        tintEl.classList.toggle('active', !!adapter.isTintActive());
      }
      // 全部笔记开启态：「所有带笔记的节点都展开着」才算开（局部展开不亮，避免误读）
      if (notesEl && typeof adapter.isAllNotesOpen === 'function') {
        notesEl.classList.toggle('active', !!adapter.isAllNotesOpen());
      }
      // 连线 toggle：有连线 → 断链图标（点击清空）；无连线 → 链条图标（点击成链）。
      // 图标与 title 一起切，避免「看着是连、点下去却是断」。
      if (linkEl && typeof adapter.isLinked === 'function') {
        const linked = !!adapter.isLinked();
        linkEl.classList.toggle('is-linked', linked);
        const label = linked ? '一键删除连线' : '一键连线';
        if (linkEl.getAttribute('aria-label') !== label) {
          linkEl.setAttribute('aria-label', label);
          linkEl.title = linked
            ? '一键删除连线：清空所有连线，文章顺序保持不变（可撤销）'
            : '一键连线：按文章顺序把全部卡片连成一条链（可撤销）';
        }
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
        else if (act === 'tint' && typeof adapter.onTint === 'function') adapter.onTint();
        else if (act === 'notes' && typeof adapter.onToggleAllNotes === 'function') adapter.onToggleAllNotes();
        else if (act === 'link-toggle' && typeof adapter.onLinkToggle === 'function') adapter.onLinkToggle();
        else if (act === 'search' && typeof adapter.onSearch === 'function') adapter.onSearch();
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
