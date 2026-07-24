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
    },

    openDatePicker() {
        Handlers.openDatePicker();
    }
};

window.Navigation = Navigation;