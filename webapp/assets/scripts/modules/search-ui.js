/**
 * 搜索 UI 模块 —— 内联搜索面板
 * Ctrl+K 或 / 键唤起，输入关键词实时搜索日记内容
 */
import { byId, $ } from '../utils/domRef.js';

export const SearchUI = {
    _panel: null,
    _input: null,
    _results: null,
    _visible: false,

    init() {
        // 懒初始化，第一次 toggle 时创建
    },

    toggle() {
        if (this._visible) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        if (this._visible) return;
        this._ensurePanel();
        this._visible = true;
        this._panel.hidden = false;
        this._input.value = '';
        this._results.innerHTML = '';
        requestAnimationFrame(() => this._input.focus());

        // Escape 关闭
        this._boundEscHandler = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); this.close(); }
        };
        document.addEventListener('keydown', this._boundEscHandler);
    },

    close() {
        if (!this._visible) return;
        this._visible = false;
        if (this._panel) this._panel.hidden = true;
        if (this._boundEscHandler) {
            document.removeEventListener('keydown', this._boundEscHandler);
            this._boundEscHandler = null;
        }
    },

    _ensurePanel() {
        if (this._panel) return;

        const panel = document.createElement('div');
        panel.id = 'searchPanel';
        panel.className = 'search-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', '搜索日记');
        panel.hidden = true;
        panel.innerHTML = `
            <div class="search-panel-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                <input type="search" class="search-panel-input" placeholder="搜索关键词（支持目标、活动、指标...）" aria-label="搜索关键词">
                <button class="search-panel-close" aria-label="关闭搜索" data-action="close-search">&times;</button>
            </div>
            <div class="search-panel-results" id="searchResults"></div>
        `;

        // 挂载到 body（确保在 light DOM 中，byId 能通过 document.getElementById 找到）
        document.body.appendChild(panel);

        // 使用 panel.querySelector 查找（避免 byId 在 shadow 模式下走到 host.shadowRoot）
        const input = panel.querySelector('.search-panel-input');
        const results = panel.querySelector('#searchResults');
        const closeBtn = panel.querySelector('[data-action="close-search"]');

        if (!input || !results) {
            console.error('[SearchUI] 搜索面板初始化失败：无法找到输入框或结果容器');
            panel.remove();
            return;
        }

        this._panel = panel;
        this._input = input;
        this._results = results;

        // 输入事件 — 150ms 防抖
        let timer;
        this._input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => this._doSearch(), 150);
        });

        // 关闭按钮
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        // 点击结果项导航到对应日期
        this._results.addEventListener('click', (e) => {
            const item = e.target.closest('.search-result-item');
            if (item && item.dataset.date) {
                const d = new Date(item.dataset.date);
                store.setCurrentDate(d);
                this.close();
            }
        });
    },

    _doSearch() {
        const query = this._input.value.trim();
        if (!query) {
            this._results.innerHTML = '<div class="search-panel-empty">输入关键词开始搜索</div>';
            return;
        }
        if (query.length < 2) {
            this._results.innerHTML = '<div class="search-panel-empty">输入至少 2 个字符...</div>';
            return;
        }

        const results = store.searchData(query);
        if (!results || results.length === 0) {
            this._results.innerHTML = `<div class="search-panel-empty">未找到匹配 "${query}" 的结果</div>`;
            return;
        }

        this._results.innerHTML = results.map(r => {
            const matches = (r.matches || []).map(m =>
                `<span class="search-match">${m.field}: ${this._highlight(m.value, query)}</span>`
            ).join('');
            return `<div class="search-result-item" data-date="${r.date}" role="button" tabindex="0">
                <div class="search-result-date">${r.date}</div>
                <div class="search-result-matches">${matches}</div>
            </div>`;
        }).join('');
    },

    _highlight(text, query) {
        if (!text) return '';
        const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(re, '<mark>$1</mark>');
    }
};

window.SearchUI = SearchUI;
