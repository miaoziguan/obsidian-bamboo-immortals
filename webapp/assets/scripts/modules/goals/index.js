export const GOAL_STATUSES = ['已搁置', '进行中', '已完成'];

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
