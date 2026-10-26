/**
 * 时间线对外出口（v3.33.0 瘦身）。
 *
 * 渲染由 renderers.js 的 renderTimelineSection 承担；编辑器 TimelineEditor
 * 自渲染迁移后从未有任何调用方（死代码），已随 editor.js 一并删除。
 *
 * 保留 toggle —— daily 视图时段卡的 timeline-toggle 动作入口
 * （renderers.js 动作表：'timeline-toggle' → Timeline.toggle）。
 */
import { TimelineRenderer } from './renderer.js';

export const Timeline = {
    toggle(index) {
        TimelineRenderer.toggle(index);
    },
};

window.Timeline = Timeline;
