export const Timeline = {
    Renderer: TimelineRenderer,
    Editor: TimelineEditor,

    render(data) {
        TimelineRenderer.render(data);
    },

    openEditor() {
        TimelineEditor.open();
    },

    toggle(index) {
        TimelineRenderer.toggle(index);
    }
};

window.Timeline = Timeline;