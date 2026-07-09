Object.defineProperty(window, 'GOAL_CATEGORIES', {
    get() { return GoalsRenderer.getCategories(); },
    set(v) { Object.defineProperty(window, 'GOAL_CATEGORIES', { value: v, writable: true, configurable: true }); },
    configurable: true
});

export const Goals = {
    Renderer: GoalsRenderer,
    Editor: GoalsEditor,

    render(data, container) {
        GoalsRenderer.render(data, container);
    },

    openEditor() {
        GoalsEditor.startAddInline();
    }
};

window.Goals = Goals;
