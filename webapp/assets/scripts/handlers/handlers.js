import { byId, $, getHost, getDomRoot } from '../utils/domRef.js';
import { FocusTrap } from '../utils/focusTrap.js';
import { ScrollFeaturePicker } from './scrollFeaturePicker.js';
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
        // 给承载用户数据的内容容器打标（markText 现已全局扫描，此标记仅作语义兼容保留）。
        const contentRoot = byId('sectionsContainer') || byId('reviewContainer');
        if (contentRoot && !contentRoot.hasAttribute('data-private')) {
            contentRoot.setAttribute('data-private', '');
        }
        if (typeof PrivacyMode !== 'undefined') {
            PrivacyMode.init();
            // 动态渲染（AI 规划写入、切日期、待办/时间线回流等）后补标文字叶子，
            // 确保新出现的文字也被纳入模糊。观察整个 shadow root，覆盖任何位置的板块。
            // 增量 + 关闭时短路。
            // 原实现对每一批 mutation 都做一次「整个 shadow root 的全树 walk」：
            //   · 隐私关闭时（默认从未设置过 = 0）标记不会被任何样式消费 —— 马赛克由
            //     body/host 上的 .privacy-on 类驱动 —— 这笔开销对用户零产出；
            //   · 开启时真正需要处理的也只是新增节点，已标记过的节点不需要反复再扫。
            // 故这里先按 isOn() 短路，再把本次 addedNodes 交给 markText 增量处理。
            const mark = (mutations) => {
                if (!PrivacyMode.isOn()) return;
                const roots = [];
                for (const m of mutations || []) {
                    for (const n of m.addedNodes) {
                        if (n.nodeType === 1) roots.push(n);
                        else if (n.nodeType === 3 && n.parentElement) roots.push(n.parentElement);
                    }
                }
                if (roots.length) PrivacyMode.markText(roots);
            };
            const sr = window.__bambooShadowRoot;
            // 注意：ShadowRoot 没有 documentElement（那是 Document 的属性），必须直接用
            // sr 本身。写成 sr.documentElement 会恒为 undefined，从而静默退化成只观察
            // contentRoot —— 其内容之外新增的板块将永远拿不到 data-private-text。
            const observeTarget = sr || contentRoot || document.body;
            if (typeof MutationObserver === 'function' && observeTarget) {
                this._privacyObserver = new MutationObserver(mark);
                this._privacyObserver.observe(observeTarget, {
                    childList: true,
                    subtree: true,
                });
            }
            // 首屏渲染可能晚于 init（数据异步到达），下一帧再补一次全量。
            // 关闭时同样跳过（此时标记无用；从关切到开会由 setLevel 补一次全量）。
            requestAnimationFrame(() => { if (PrivacyMode.isOn()) PrivacyMode.markText(); });
        }
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
                <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="${HTMLUtils.escapeHtmlAttr(titleId)}" data-stop-propagation>
                    <div class="modal-header">
                        <div class="modal-title" id="${HTMLUtils.escapeHtmlAttr(titleId)}"></div>
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

    /** 切换 Obsidian 整体明暗（moonstone ↔ obsidian）。
     *
     *  悬浮菜单「夜间模式」的语义是「切换 Obsidian 外观明暗」，不是应用内部夜间模式：
     *  经桥请求宿主改基础主题，宿主改完重放 css-change → 各视图 theme:changed → 跟随刷新。
     *  不传 isDark 让宿主按自身真实主题取反（应用内关掉「跟随 Obsidian」时本地明暗
     *  可能与 OB 不一致，宿主侧判断更可靠）。
     *  非 Obsidian 环境（纯浏览器调试 / 桥缺失）退回应用内明暗切换，保证按钮仍可用。
     */
    async toggleObsidianTheme() {
        const sm = (typeof window !== 'undefined') ? window.storageManager : null;
        if (sm && typeof sm.toggleObsidianTheme === 'function') {
            const res = await sm.toggleObsidianTheme();
            if (res && res.ok !== false) {
                // 与宿主真实明暗对齐：跟随开启时 theme:changed 已处理（此处幂等兜底），
                // 跟随关闭时也能让面板与 OB 保持一致，避免按钮标签与实际主题脱节。
                if (typeof store !== 'undefined' && store.setDarkMode && typeof res.isDark === 'boolean') {
                    try { await store.setDarkMode(res.isDark, true); } catch (_) { /* 对齐失败不阻塞 */ }
                }
            } else if (typeof Toast !== 'undefined' && Toast.showToast) {
                Toast.showToast('明暗切换失败', 'warning');
            }
        } else if (typeof store !== 'undefined' && store.setDarkMode) {
            await store.setDarkMode();
        }
        if (typeof ThemeSelector !== 'undefined') ThemeSelector.updateDarkModeButton();
    },

    // 说明：这里原有 handleImportFile / importDataFromTextarea 两个纯转发包装，
    // 唯一调用方是已删除的 dataIO.openImport 弹窗（含其 file input 的 change 回调），已删除。
    // （原先直接调 DataIO.importFromTextarea 的 'import-from-textarea' 动作注册也已一并移除：
    //   真实恢复入口是设置面板 settings-import-data → SettingsModal.openImportPreview，
    //   它确认后直接 DataIO.importData(backup, { strategy, scope })，不经 DOM 动作派发。）
};

ActionDispatcher.registerMany({
    'close-modal': () => Handlers.closeModal(),
    'close-modal-overlay': (data, target, e) => Handlers.closeModal(e),
    'export-data': () => DataIO.exportData(),
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
    'fab-scroll': () => {
        // 悬浮菜单点击「画中卷」后，先弹出功能选择浮层（香道/更多意境），选定后再打开视图。
        if (typeof FABManager !== 'undefined') FABManager.close();
        ScrollFeaturePicker.open();
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
        // 切换 Obsidian 整体明暗（不再是应用内夜间模式、也不再关闭「跟随 Obsidian」）：
        // 宿主改基础主题后经主题管线驱动本面板与各独立视图（画中卷/归档）同步跟随。
        void Handlers.toggleObsidianTheme();
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
    'fab-layout-toggle': () => {
        if (typeof LayoutMode !== 'undefined') {
            // 单按钮循环：纵向 → 横向 → 看板 → 纵向（toggle 内部循环推进）
            LayoutMode.toggle();
        }
        if (typeof FABManager !== 'undefined') FABManager.close();
    }
});

window.Handlers = Handlers;
