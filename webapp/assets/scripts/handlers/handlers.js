import { byId, $, getHost, getDomRoot } from '../utils/domRef.js';
import { FocusTrap } from '../utils/focusTrap.js';
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
        this.setupPrivacyMode();
        this.setupGlobalKeyboardShortcuts();
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

    /** 隐私模式：恢复上次模糊强度，并给内容容器打 data-private 标记 */
    setupPrivacyMode() {
        // 给承载用户数据的内容容器打标，UI 骨架（FAB/导航/图标）不受影响。
        const contentRoot = byId('sectionsContainer') || byId('reviewContainer');
        if (contentRoot && !contentRoot.hasAttribute('data-private')) {
            contentRoot.setAttribute('data-private', '');
        }
        if (typeof PrivacyMode !== 'undefined') PrivacyMode.init();
    },

    setupGlobalKeyboardShortcuts() {
        getDomRoot().addEventListener('keydown', (e) => {
            // 编辑中不触发全局快捷键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
            // 模态框打开时不触发（已有自己的键盘处理）
            const modalContainer = byId('modalContainer');
            if (modalContainer && !modalContainer.classList.contains('no-keybind')) return;

            // 全局快捷键槽位：当前未启用任何快捷键
        });
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

        // 激活焦点陷阱与 Escape 关闭（传入打开前的焦点元素，关闭时归还）
        FocusTrap.activate(modal, {
            onEscape: () => Handlers.closeModal(),
            previouslyFocused: this.lastFocusedElement
        });
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

        // 关闭焦点陷阱
        FocusTrap.deactivate();

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
        const newDate = dateStr instanceof Date ? dateStr : new Date(dateStr);
        const { currentDate } = store.getState();
        const direction = newDate >= currentDate ? 1 : -1;
        RenderScheduler.startDateTransition(direction, () => {
            store.goToDate(dateStr);
            renderDate();
            markSectionDirty('timeline');
            markSectionDirty('todo');
        });
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
    'open-archive-page': () => {
        if (typeof openArchivePage === 'function') openArchivePage();
    },
    'fab-strategy': () => { 
        if (typeof GoalsRenderer !== 'undefined') GoalsRenderer.openHealthScoreDetail(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-shop': () => { 
        if (typeof ShopManager !== 'undefined') ShopManager.open(); 
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-archive': () => { 
        if (typeof openArchivePage === 'function') openArchivePage();
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
    },
    'fab-privacy': () => {
        if (typeof PrivacyMode !== 'undefined') {
            const on = PrivacyMode.toggle();
            FABManager.updatePrivacyButton && FABManager.updatePrivacyButton(on);
        }
        if (typeof FABManager !== 'undefined') FABManager.close();
    },
    'fab-layout-toggle': () => {
        if (typeof LayoutMode !== 'undefined') {
            // 单按钮循环：纵向 → 横向 → 看板 → 纵向（toggle 内部循环推进）
            LayoutMode.toggle();
        }
        if (typeof FABManager !== 'undefined') FABManager.close();
    }
});

window.Handlers = Handlers;
