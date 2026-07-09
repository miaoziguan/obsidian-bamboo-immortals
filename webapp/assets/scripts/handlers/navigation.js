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
            store.navigateDate(-1);
            renderAll();
        });

        byId('nextDay')?.addEventListener('click', () => {
            store.navigateDate(1);
            renderAll();
        });
    },

    openDatePicker() {
        Handlers.openDatePicker();
    }
};

window.Navigation = Navigation;