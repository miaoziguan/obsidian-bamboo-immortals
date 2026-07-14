import { byId, $, getHost } from '../utils/domRef.js';
export const Handlers = {
    modalFocusStack: [],
    lastFocusedElement: null,
    _modalFocusCache: null,
    _modalObserver: null,
    _initialized: false,

    init() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;

        this.setupGlobalErrorHandler();
        Navigation.init();
        this.setupFabMenu();
        Keyboard.init();
        Gestures.init();
        QuickNav.init();
        ThemeSelector.updateDarkModeButton();

        // 初始化天气渲染（仅在 weatherEnabled 为 true 时才显示）
        if (typeof WeatherRenderer !== 'undefined' && typeof WeatherRenderer.init === 'function') {
            try { WeatherRenderer.init(); } catch (e) { /* 静默失败，不影响主流程 */ }
        }
        // 初始化语录渲染（仅在 quoteEnabled 为 true 时才显示）
        if (typeof QuoteRenderer !== 'undefined' && typeof QuoteRenderer.init === 'function') {
            try { QuoteRenderer.init(); } catch (e) { /* 静默失败，不影响主流程 */ }
        }
    },

    setupGlobalErrorHandler() {
        window.addEventListener('error', (e) => {
            const message = e.message || '未知错误';
            const source = e.filename || '';
            const line = e.lineno || 0;
            console.error(`[Error] ${message} at ${source}:${line}`);
            if (!message.includes('ResizeObserver') &&
                !message.includes('Script error') &&
                !message.includes('getBoundingClientRect') &&
                source) {
                Toast.showToast(`出现了小问题，请刷新页面`, 'error');
            }
        });
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[Unhandled Promise Rejection]', e.reason);
            if (e.reason && typeof e.reason === 'string' && !e.reason.includes('ResizeObserver')) {
                Toast.showToast(`网络不稳定，请稍后再试`, 'error');
            }
        });
    },

    setupFabMenu() {
        FABManager.init();
    },

    openModal(content, title = '编辑') {
        this.lastFocusedElement = document.activeElement;
        const container = byId('modalContainer');
        if (!container) return;
        const titleId = 'modal-title-' + Date.now();

        container.innerHTML = `
            <div class="modal-overlay" data-action="close-modal-overlay" role="presentation">
                <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="${titleId}" data-stop-propagation>
                    <div class="modal-header">
                        <div class="modal-title" id="${titleId}"></div>
                        <button class="modal-close" data-action="close-modal" aria-label="关闭弹窗">${LucideUtils.createIcon('x', { size: 16 })}</button>
                    </div>
                    <div class="modal-body" id="modalBody" role="document">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        const titleEl = container.querySelector('.modal-title');
        if (titleEl) titleEl.textContent = title;
        const closeBtn = container.querySelector('.modal-close');
        const modal = container.querySelector('.modal-content');

        this.updateModalFocusCache();
        this._setupModalContentObserver(modal);

        const focusable = this._modalFocusCache;
        if (focusable && focusable.length > 0) {
            focusable[0].focus();
        } else if (closeBtn) {
            closeBtn.focus();
        }

        this.modalFocusStack = [closeBtn];
        const _scrollHost = getHost() || document.body;
        _scrollHost.style.overflow = 'hidden';
    },

    closeModal(event) {
        if (event && event.target) {
            const overlayEl = event.target.closest('.modal-overlay') || event.target;
            if (event.target !== overlayEl) return;
        }

        if (this._modalObserver) {
            this._modalObserver.disconnect();
            this._modalObserver = null;
        }

        const container = byId('modalContainer');
        if (container) container.innerHTML = '';

        this._modalFocusCache = null;

        const _scrollHost = getHost() || document.body;
        _scrollHost.style.overflow = '';
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    },

    setupModalFocusTrap(e) {
        const focusable = this._modalFocusCache;
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
        if (e.key === 'Escape') {
            this.closeModal();
        }
    },

    updateModalFocusCache() {
        const modal = $('.modal-content');
        if (!modal) {
            this._modalFocusCache = null;
            return;
        }
        this._modalFocusCache = modal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    },

    _setupModalContentObserver(modal) {
        if (this._modalObserver) {
            this._modalObserver.disconnect();
        }

        this._modalObserver = new MutationObserver(() => {
            requestAnimationFrame(() => {
                this.updateModalFocusCache();
            });
        });

        this._modalObserver.observe(modal, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['tabindex', 'disabled']
        });
    },

    openDatePicker() {
        DatePicker.open();
    },

    goToSelectedDate() {
        DatePicker.goToSelectedDate();
    },

    goToToday() {
        DatePicker.goToToday();
    },

    selectHistoryDate(dateStr) {
        store.goToDate(dateStr);
        renderAll();
        this.closeModal();
    },

    openSettingsModal() {
        SettingsModal.open();
    },

    setDarkMode(isDark) {
        store.setDarkMode(isDark);
        if (typeof ThemeSelector !== 'undefined') {
            ThemeSelector.updateDarkModeButton();
        }
    },

    updateDarkModeButton() {
        if (typeof ThemeSelector !== 'undefined') {
            ThemeSelector.updateDarkModeButton();
        }
    },

    handleImportFile(event) {
        DataIO.handleImportFile(event);
    },

    importDataFromTextarea() {
        DataIO.importFromTextarea();
    }
};

ActionDispatcher.registerMany({
    'close-modal': () => Handlers.closeModal(),
    'close-modal-overlay': (data, target, e) => Handlers.closeModal(e),
    'export-data': () => DataIO.exportData(),
    'import-from-textarea': () => DataIO.importFromTextarea(),
    'toggle-dark-mode': () => {
        store.setDarkMode();
        store.setSyncTheme(false);
        Handlers.updateDarkModeButton();
    },
    'open-date-picker': () => Handlers.openDatePicker(),
    'fab-strategy': () => { 
        if (typeof GoalsRenderer !== 'undefined') GoalsRenderer.openHealthScoreDetail(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-shop': () => { 
        if (typeof ShopManager !== 'undefined') ShopManager.open(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-archive': () => { 
        if (typeof GoalsRenderer !== 'undefined') GoalsRenderer.openArchiveManager(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-sections': () => { 
        if (typeof SectionManager !== 'undefined') SectionManager.openManager(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-achievements': () => { 
        if (typeof StatsModal !== 'undefined') StatsModal.openAchievements(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-dark-mode': () => { 
        store.setDarkMode();
        store.setSyncTheme(false);
        if (typeof ThemeSelector !== 'undefined') ThemeSelector.updateDarkModeButton();
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-white-noise': () => { 
        if (typeof WhiteNoiseManager !== 'undefined') WhiteNoiseManager.togglePanel(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-settings': () => { 
        if (typeof SettingsModal !== 'undefined') SettingsModal.open(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-display': () => { 
        if (typeof DisplayManager !== 'undefined') DisplayManager.toggle(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-theme': () => {
        if (typeof window.ThemeEffects !== 'undefined') window.ThemeEffects.showThemePanel();
        if (typeof FABManager !== 'undefined') FABManager.close();
    }
});

window.Handlers = Handlers;
