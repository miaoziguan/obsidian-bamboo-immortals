import { byId } from '../utils/domRef.js';
export const Navigation = {
    _initialized: false,

    init() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        
        this.setupDateNavigation();
    },

    setupDateNavigation() {
        byId('prevDay')?.addEventListener('click', () => {
            const direction = -1;
            RenderScheduler.startDateTransition(direction, () => {
                store.navigateDate(direction);
                renderDate();
                markSectionDirty('timeline');
                markSectionDirty('todo');
            });
        });

        byId('nextDay')?.addEventListener('click', () => {
            const direction = 1;
            RenderScheduler.startDateTransition(direction, () => {
                store.navigateDate(direction);
                renderDate();
                markSectionDirty('timeline');
                markSectionDirty('todo');
            });
        });

        // 【P1-7】#dateDisplay 自带 role="button" + aria-label="点击回到今天"，
        // 但此前全仓没有任何处理器 —— 屏幕上最主要的日期元素给出了无法兑现的承诺：
        // 鼠标点了没反应，键盘 Enter 也没反应。这里补上接线，键盘一并支持。
        const dateDisplay = byId('dateDisplay');
        if (dateDisplay) {
            const goToday = () => {
                if (typeof DatePicker !== 'undefined' && typeof DatePicker.goToToday === 'function') {
                    DatePicker.goToToday();
                }
            };
            dateDisplay.addEventListener('click', goToday);
            dateDisplay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    goToday();
                }
            });
        }
    },

    openDatePicker() {
        Handlers.openDatePicker();
    }
};

window.Navigation = Navigation;