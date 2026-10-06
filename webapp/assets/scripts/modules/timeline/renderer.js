import { byId } from '../../utils/domRef.js';
export const TimelineRenderer = {
    _periodsCache: [],

    render(data) {
        const container = byId('timelinePath');
        if (!container) return;

        if (!data.timeline || data.timeline.length === 0) {
            const iconHtml = typeof LucideUtils !== 'undefined'
                ? LucideUtils.createIcon('treePine', { size: 48 })
                : '';
            container.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-icon">${iconHtml}</div>
                    <div class="empty-state-title">记录你的活动时间线</div>
                    <div class="empty-state-desc">完成目标任务后自动记录</div>
                    <div class="empty-state-hint">按凌晨、黎明、清晨、上午、中午、下午、傍晚、晚上、深夜九个时段记录</div>
                </div>
            `;
            return;
        }

        const hasTasks = data.timeline.some(period => period.items && period.items.length > 0);
        if (!hasTasks) {
            const iconHtml = typeof LucideUtils !== 'undefined'
                ? LucideUtils.createIcon('treePine', { size: 48 })
                : '';
            container.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-state-icon">${iconHtml}</div>
                    <div class="empty-state-title">记录你的活动时间线</div>
                    <div class="empty-state-desc">完成目标任务后自动记录</div>
                    <div class="empty-state-hint">按凌晨、黎明、清晨、上午、中午、下午、傍晚、晚上、深夜九个时段记录</div>
                </div>
            `;
            return;
        }

        container.innerHTML = data.timeline.map((period, index) => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTime = currentHour + currentMinute / 60;
            
            const periodHours = {
                lateNight: [0, 4],
                dawn: [4, 5.5],
                earlyMorning: [5.5, 7],
                morning: [7, 12],
                midday: [12, 13],
                afternoon: [13, 17],
                dusk: [17, 18.5],
                evening: [18.5, 22],
                night: [22, 24]
            };
            
            const isFocus = period.period && periodHours[period.period] && (
                currentTime >= periodHours[period.period][0] && currentTime < periodHours[period.period][1]
            );
            
            const count = period.items?.length || 0;
            let hint = '';
            if (count === 0) {
                hint = '这个时段还没有记录活动';
            } else if (count === 1) {
                hint = `这个时段有 1 条活动记录`;
            } else {
                hint = `这个时段有 ${count} 条活动记录`;
            }

            const itemsHtml = isFocus ? this._renderItems(period.items) : '';
            
            return `
                <div class="bamboo-node ${isFocus ? 'focus-now' : ''}" style="animation-delay: ${index * 0.1}s">
                    <div class="bamboo-card ${HTMLUtils.escapeHtmlAttr(period.period || '')}" role="button" tabindex="0" aria-label="${HTMLUtils.escapeHtmlAttr(period.name)}时间段" data-action="timeline-toggle" data-index="${num(index)}">
                        <div class="bamboo-card-header">
                            <div class="bamboo-left">
                                <div class="bamboo-info">
                                    <div class="bamboo-icon">${LucideUtils.createIcon(period.icon, { size: 15 })}</div>
                                    <div class="bamboo-title">
                                        <div class="bamboo-name">${escapeHtml(period.name)}</div>
                                        <div class="bamboo-time">${escapeHtml(period.time)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="bamboo-right">
                                <span class="bamboo-count" data-count="${num(count)}" data-hint="${HTMLUtils.escapeHtmlAttr(hint)}">${count}</span>
                                <div class="bamboo-chevron${!isFocus ? ' collapsed' : ''}" id="chevron-${index}">${LucideUtils.createIcon(isFocus ? 'chevronDown' : 'chevronRight', { size: 14 })}</div>
                            </div>
                            <div class="bamboo-leaf">
                                ${LucideUtils.createIcon('leaf', { size: 16 })}
                            </div>
                        </div>
                        <div class="bamboo-card-content${!isFocus ? ' collapsed' : ''}" id="timeline-content-${index}"${!isFocus ? ' data-empty="true"' : ''}>
                            ${itemsHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this._periodsCache = data.timeline;
        this.setupHoverEffects();
        this.setupTooltips();
    },

    _renderItems(items) {
        if (!items || items.length === 0) return '';
        return `<div class="bamboo-items">
            ${items.map(item => `
                <div class="bamboo-item">
                    <div class="bamboo-item-time">${escapeHtml(item.time)}</div>
                    <div class="bamboo-item-content">
                        <div class="bamboo-item-task">${escapeHtml(item.task)}</div>
                        ${item.eval ? `<div class="bamboo-item-eval ${item.eval === 'warn' ? 'warn' : ''}">${escapeHtml(item.eval)}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>`;
    },

    toggle(index) {
        const content = byId(`timeline-content-${index}`);
        const chevron = byId(`chevron-${index}`);
        if (!content || !chevron) return;

        if (content.classList.contains('collapsed')) {
            if (content.dataset.empty === 'true') {
                const period = this._periodsCache[index];
                if (period) {
                    content.innerHTML = this._renderItems(period.items);
                    delete content.dataset.empty;
                }
            }
            content.classList.remove('collapsed');
            chevron.classList.remove('collapsed');
            chevron.innerHTML = LucideUtils.createIcon('chevronDown', { size: 14 });
        } else {
            content.classList.add('collapsed');
            chevron.classList.add('collapsed');
            chevron.innerHTML = LucideUtils.createIcon('chevronRight', { size: 14 });
        }
    },

    setupHoverEffects() {
        if (this._hoverCleanup) this._hoverCleanup();
        const container = byId('timelinePath');
        if (!container) return;

        const onMouseMove = (e) => {
            const header = e.target.closest('.bamboo-card-header');
            if (!header) return;
            const rect = header.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            header.style.setProperty('--mouse-x', `${x}%`);
            header.style.setProperty('--mouse-y', `${y}%`);
        };
        const onMouseLeave = (e) => {
            const header = e.target.closest('.bamboo-card-header');
            if (!header) return;
            header.style.setProperty('--mouse-x', '50%');
            header.style.setProperty('--mouse-y', '50%');
        };

        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);
        this._hoverCleanup = () => {
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseleave', onMouseLeave);
        };
    },

    /**
     * 委托给全局 tooltip 系统（renderers.js 的 setupBambooTooltips）。
     *
     * 时间线原本在这里自建一套 mousemove/mouseover/mouseout 监听；而全局那套是绑在 DOM 根
     * （getDomRoot()）上的事件委托，#timelinePath 正是它的后代 —— 同一次鼠标移动命中两套
     * 处理器、操作同一个 .bamboo-tooltip 元素：4 次 rect 读 + 4 次 style 写，读写交替即每个
     * mousemove 两次强制重排。交给全局系统后行为完全一致，代价减半。
     */
    setupTooltips() {
        if (typeof window.setupBambooTooltips === 'function') {
            window.setupBambooTooltips(); // 内部有 container._tooltipBound 幂等保护
            return;
        }
        console.warn('[Timeline] 全局 tooltip 处理器不可用，时间线计数提示未启用');
    },
};

ActionDispatcher.registerMany({
    'timeline-toggle': (ds) => TimelineRenderer.toggle(parseInt(ds.index))
});

window.TimelineRenderer = TimelineRenderer;