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
        document.getElementById('prevDay')?.addEventListener('click', () => {
            store.navigateDate(-1);
            renderAll();
        });

        document.getElementById('nextDay')?.addEventListener('click', () => {
            store.navigateDate(1);
            renderAll();
        });
    },

    openDatePicker() {
        Handlers.openDatePicker();
    }
};

window.Navigation = Navigation;