Object.defineProperty(window, 'GOAL_CATEGORIES', {
    get() { return GoalsRenderer.getCategories(); },
    set(v) { Object.defineProperty(window, 'GOAL_CATEGORIES', { value: v, writable: true, configurable: true }); },
    configurable: true
});

