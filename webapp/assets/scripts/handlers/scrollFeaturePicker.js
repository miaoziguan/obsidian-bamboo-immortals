/**
 * scrollFeaturePicker.js — 画中卷功能选择浮层（悬浮菜单侧）
 *
 * 悬浮菜单（FAB）的「画中卷」项点击后，不直接打开画中卷视图，而是先弹出本浮层
 * 让用户选择功能（香道 / 更多意境·敬请期待）。选定香道后才请求宿主打开画中卷视图
 * （宿主以左侧边栏形态打开，默认进入香道）。功能列表在此集中维护，新增功能只需追加。
 *
 * 这样「功能选择」发生在悬浮菜单点击之后、打开视图之前，画中卷视图本身只承载单一功能。
 */

import { getDomRoot } from '../utils/domRef.js';

// 画中卷内的功能清单（香道为首个可用功能，更多意境为禁用占位）
// 统一使用 SVG 小图标，避免 emoji 被误读为情绪表达。
const INCENSE_ICON = `<svg class="scroll-pick-icon-svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 26h12a3 3 0 0 0-3-5H13a3 3 0 0 0-3 5z"/><line x1="16" y1="21" x2="16" y2="9"/><path d="M16 9c0-2 1.5-3 1.5-5"/></svg>`;
const MORE_ICON = `<svg class="scroll-pick-icon-svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 2l3.7 8.3L28 12l-7 6.8 1.7 9.2L16 22.8l-6.7 5.2 1.7-9.2L4 12l8.3-1.7L16 2z"/></svg>`;
const FEATURES = [
  { key: 'incense', title: '香道', icon: INCENSE_ICON, desc: '', placeholder: false },
  { key: 'more', title: '更多意境', icon: MORE_ICON, desc: '', placeholder: true },
];

export const ScrollFeaturePicker = {
  _el: null,

  /** 显示功能选择浮层（已显示则仅恢复） */
  open() {
    if (this._el) { this._el.hidden = false; return; }
    const root = getDomRoot();
    if (!root) return;

    const overlay = document.createElement('div');
    overlay.className = 'scroll-pick-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '画中卷 · 选择功能');
    overlay.innerHTML = `
      <div class="scroll-pick-panel" role="document">
        <div class="scroll-pick-head">
          <span class="scroll-pick-title">画中卷</span>
          <button type="button" class="scroll-pick-close" aria-label="关闭">×</button>
        </div>
        <p class="scroll-pick-sub">选择一个意境功能</p>
        <div class="scroll-pick-list" role="list"></div>
      </div>`;

    const list = overlay.querySelector('.scroll-pick-list');
    FEATURES.forEach((f) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'scroll-pick-card';
      card.setAttribute('role', 'listitem');
      card.dataset.key = f.key;
      card.title = f.title;
      const textHtml =
        `<span class="scroll-pick-text">` +
          `<span class="scroll-pick-name">${f.title}</span>` +
          (f.desc ? `<span class="scroll-pick-desc">${f.desc}</span>` : '') +
        `</span>`;
      if (f.placeholder) {
        card.classList.add('is-placeholder');
        card.disabled = true;
        card.innerHTML =
          `<span class="scroll-pick-icon">${f.icon}</span>` +
          textHtml +
          `<span class="scroll-pick-lock">敬请期待</span>`;
      } else {
        card.innerHTML =
          `<span class="scroll-pick-icon">${f.icon}</span>` +
          textHtml;
        card.addEventListener('click', () => this._choose(f.key));
      }
      list.appendChild(card);
    });

    // 关闭交互：点关闭按钮、点遮罩空白处均关闭浮层（不打开视图）
    overlay.querySelector('.scroll-pick-close').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
    // Esc 关闭
    overlay._onKey = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', overlay._onKey);

    root.appendChild(overlay);
    this._el = overlay;
    if (typeof PrivacyMode !== 'undefined') PrivacyMode.markText();
  },

  /** 选定功能：关闭浮层并请求宿主打开画中卷视图 */
  _choose(key) {
    this.close();
    if (typeof storageManager === 'undefined') return;
    if (storageManager.openScrollLeftSidebar) {
      storageManager.openScrollLeftSidebar();
    } else if (storageManager.openScrollView) {
      storageManager.openScrollView();
    }
  },

  /** 关闭并销毁浮层 */
  close() {
    if (this._el) {
      if (this._el._onKey) document.removeEventListener('keydown', this._el._onKey);
      if (this._el.parentNode) this._el.parentNode.removeChild(this._el);
      this._el = null;
    }
  },
};

window.ScrollFeaturePicker = ScrollFeaturePicker;
