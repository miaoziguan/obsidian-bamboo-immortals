import { byId, $, $$, modalMount, getScrollHost } from '../utils/domRef.js';
export const QuickNav = {
    sections: [
        { id: 'timelinePath', icon: 'clock', label: '活动时间线' },
        { id: 'goalList', icon: 'map', label: '目标地图' }
    ],

    actions: [
        { id: 'achievements', icon: 'trophy', label: '我的成就', action: 'stats-modal-open-achievements' }
    ],

    init() {
        this.setupQuickNavigation();
        this.setupScrollSpy();
    },

    setupQuickNavigation() {
        const container = byId('reviewContainer');
        if (!container) return;

        let nav = $('.quick-nav');
        if (nav) {
            nav.remove();
        }

        nav = document.createElement('nav');
        nav.className = 'quick-nav';
        nav.setAttribute('aria-label', '快速导航');

        let buttonsHtml = `<button class="quick-nav-toggle" data-action="quick-nav-toggle" title="展开/收起导航">${typeof LucideUtils !== 'undefined' ? LucideUtils.createIcon('bookOpen', { size: 18 }) : ''}</button>`;

        this.sections.forEach(section => {
            buttonsHtml += `
                <button class="quick-nav-btn" data-action="quick-nav-scroll-to" data-section-id="${HTMLUtils.escapeHtmlAttr(section.id)}" title="${HTMLUtils.escapeHtmlAttr(section.label)}" data-section="${HTMLUtils.escapeHtmlAttr(section.id)}">
                    ${typeof LucideUtils !== 'undefined' ? LucideUtils.createIcon(section.icon, { size: 18 }) : ''}
                    <span class="quick-nav-btn-tooltip">${section.label}</span>
                </button>
            `;
        });

        // 分隔线 + 动作按钮
        if (this.actions && this.actions.length > 0) {
            buttonsHtml += `<div class="quick-nav-divider"></div>`;
            this.actions.forEach(act => {
                buttonsHtml += `
                    <button class="quick-nav-btn quick-nav-action-btn" data-action="${HTMLUtils.escapeHtmlAttr(act.action)}" title="${HTMLUtils.escapeHtmlAttr(act.label)}">
                        ${typeof LucideUtils !== 'undefined' ? LucideUtils.createIcon(act.icon, { size: 18 }) : ''}
                        <span class="quick-nav-btn-tooltip">${act.label}</span>
                    </button>
                `;
            });
        }

        nav.innerHTML = buttonsHtml;
        modalMount().appendChild(nav);
    },

    toggle(e) {
        if (e) e.stopPropagation();
        const nav = $('.quick-nav');
        nav.classList.toggle('expanded');
        const btn = nav.querySelector('.quick-nav-toggle');
        btn.innerHTML = typeof LucideUtils !== 'undefined' ? LucideUtils.createIcon(nav.classList.contains('expanded') ? 'bookClosed' : 'bookOpen', { size: 18 }) : '';
    },

    scrollToSection(id) {
        scrollToSection(id);
    },

    setupScrollSpy() {
        let scrollRaf = 0;

        const updateActiveSection = () => {
            // shadow 模式下滚动发生在 shadow host 上，window.scrollY 恒为 0 —— 原实现因此
            // 整段失效（高亮永久停在第一段）。两种模式统一按「滚动容器的 scrollTop」判定。
            const host = getScrollHost();
            const isDocScroll = !host || host === document.scrollingElement;
            // 文档滚动用 window.scrollY；shadow 模式必须读容器自身（window.scrollY 恒为 0）。
            const scrollTop = isDocScroll ? (window.scrollY || window.pageYOffset || 0) : host.scrollTop;
            const originTop = isDocScroll ? 0 : host.getBoundingClientRect().top;
            const scrollPos = scrollTop + 300;
            const buttons = $$('.quick-nav-btn');
            let currentSection = null;

            this.sections.forEach(section => {
                const el = byId(section.id);
                if (el) {
                    // 统一换算成「相对滚动容器内容顶端」的偏移：offsetTop 是相对 offsetParent，
                    // 在 shadow 布局里与容器内的滚动坐标不是一回事。
                    const r = el.getBoundingClientRect();
                    const top = r.top - originTop + scrollTop;
                    const height = r.height;
                    if (scrollPos >= top && scrollPos < top + height) {
                        currentSection = section.id;
                    }
                }
            });

            buttons.forEach(btn => {
                const isActive = btn.dataset.section === currentSection;
                btn.classList.toggle('active', isActive);
            });
        };

        const onScroll = () => {
            // 原写法是「cancel 掉刚排的帧、再排一帧」：连续滚动时回调被无限推后，
            // 只有停手才执行一次。改为「已排队就丢弃」，保证每帧最多一次且滚动期间持续生效。
            if (scrollRaf) return;
            scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; updateActiveSection(); });
        };

        const host = getScrollHost();
        (host || window).addEventListener('scroll', onScroll, { passive: true });
        updateActiveSection();
    },

    scrollToTop() {
        // 与 scrollToSection / setupScrollSpy 同源：shadow 模式下要滚的是 host，
        // window.scrollTo 不会有任何效果。
        const host = getScrollHost();
        if (host && host !== document.scrollingElement) host.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

ActionDispatcher.registerMany({
    'quick-nav-toggle': (ds, target, e) => QuickNav.toggle(e),
    'quick-nav-scroll-to': (ds) => QuickNav.scrollToSection(ds.sectionId)
});

window.QuickNav = QuickNav;