/**
 * 时间线时段卡的展开/折叠（v3.33.0 瘦身）。
 *
 * 时间线渲染早已由 renderers.js 的 renderTimelineSection 承担
 * （createDefaultSection 的 case 'timeline'）——本文件原有的 render() /
 * _renderItems() / _periodsCache / setupHoverEffects / setupTooltips
 * 均为被取代后的遗留死代码，已删除。
 *
 * 仅保留 toggle()：它仍被 daily 视图时段卡的 `timeline-toggle` 动作调用
 * （renderers.js 的动作表 → Timeline.toggle），操作 renderers.js 产出的
 * #timeline-content-N / #chevron-N。
 *
 * 历史注：toggle 原有一段 data-empty 懒填充分支（从 _periodsCache 补渲染），
 * 但 renderers.js 从不设置 data-empty，render() 删除后缓存也无来源 ——
 * 该分支不可达，随之删除。
 */
import { byId } from '../../utils/domRef.js';

export const TimelineRenderer = {
    toggle(index) {
        const content = byId(`timeline-content-${index}`);
        const chevron = byId(`chevron-${index}`);
        if (!content || !chevron) return;

        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            chevron.classList.remove('collapsed');
            chevron.innerHTML = LucideUtils.createIcon('chevronDown', { size: 14 });
        } else {
            content.classList.add('collapsed');
            chevron.classList.add('collapsed');
            chevron.innerHTML = LucideUtils.createIcon('chevronRight', { size: 14 });
        }
    },
};
