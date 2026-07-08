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
        const container = document.getElementById('reviewContainer') || document.getElementById('sectionsContainer');
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
                if (diffX > 0) {
                    store.navigateDate(-1);
                    renderAll();
                } else {
                    store.navigateDate(1);
                    renderAll();
                }
            }
        }, { passive: false });
    },

    scrollToSection(id) {
        const el = document.getElementById(id);
        if (!el || !document.contains(el)) return;
        let rect;
        try {
            rect = el.getBoundingClientRect();
        } catch (e) {
            return;
        }
        if (!rect || (rect.width === 0 && rect.height === 0)) return;
        const headerOffset = 100;
        const elementPosition = rect.top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    },

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.Gestures = Gestures;