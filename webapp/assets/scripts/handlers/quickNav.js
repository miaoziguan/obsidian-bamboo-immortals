import { byId, $, $$, modalMount } from '../utils/domRef.js';
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
                <button class="quick-nav-btn" data-action="quick-nav-scroll-to" data-section-id="${section.id}" title="${section.label}" data-section="${section.id}">
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
                    <button class="quick-nav-btn quick-nav-action-btn" data-action="${act.action}" title="${act.label}">
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
        let scrollTimeout;

        const updateActiveSection = () => {
            const scrollPos = window.scrollY + 300;
            const buttons = $$('.quick-nav-btn');
            let currentSection = null;

            this.sections.forEach(section => {
                const el = byId(section.id);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
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
            if (scrollTimeout) {
                cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = requestAnimationFrame(updateActiveSection);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateActiveSection();
    },

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

ActionDispatcher.registerMany({
    'quick-nav-toggle': (ds, target, e) => QuickNav.toggle(e),
    'quick-nav-scroll-to': (ds) => QuickNav.scrollToSection(ds.sectionId)
});

window.QuickNav = QuickNav;