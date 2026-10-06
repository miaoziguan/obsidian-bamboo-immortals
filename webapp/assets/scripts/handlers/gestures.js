import { byId } from '../utils/domRef.js';
import { scrollToSection as scrollToSectionImpl } from '../utils/helpers.js';

export const Gestures = {
    minSwipeDistance: 50,
    swipeEnabled: true,
    startY: 0,
    isScrolling: false,

    init() {
        this.loadSettings();
        this.setupSwipeGestures();
    },

    loadSettings() {
        const saved = StorageAdapter.get(StorageKeys.ENABLE_SWIPE);
        this.swipeEnabled = saved !== 'false';
    },

    setupSwipeGestures() {
        const container = byId('reviewContainer') || byId('sectionsContainer');
        if (!container) return;

        let startX = 0;
        let diffX = 0;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.isScrolling = false;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            const diffY = Math.abs(e.touches[0].clientY - this.startY);
            if (diffY > 10) {
                this.isScrolling = true;
            }
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (!this.swipeEnabled || this.isScrolling) return;
            
            diffX = e.changedTouches[0].clientX - startX;
            if (Math.abs(diffX) > this.minSwipeDistance) {
                e.preventDefault();
                const direction = diffX > 0 ? -1 : 1;
                RenderScheduler.startDateTransition(direction, () => {
                    store.navigateDate(direction);
                    renderDate();
                    markSectionDirty('timeline');
                    markSectionDirty('todo');
                });
            }
        }, { passive: false });
    },

    scrollToSection(id) {
        // 委托 utils/helpers.js 的唯一实现（含 headerOffset=100 与「元素不存在/零尺寸静默返回」守卫）。
        // 此前本文件与 helpers 各有一份逐字相同的副本，两处都活；现只保留 helpers 一份。
        scrollToSectionImpl(id);
    },

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.Gestures = Gestures;