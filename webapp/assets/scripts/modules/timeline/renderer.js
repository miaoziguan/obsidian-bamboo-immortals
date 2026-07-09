import { byId, $, $$, modalMount } from '../../utils/domRef.js';
export const TimelineRenderer = {
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
            
            return `
                <div class="bamboo-node ${isFocus ? 'focus-now' : ''}" style="animation-delay: ${index * 0.1}s">
                    <div class="bamboo-card ${period.period}" role="button" tabindex="0" aria-label="${period.name}时间段" data-action="timeline-toggle" data-index="${index}">
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
                                <span class="bamboo-count" data-count="${count}" data-hint="${hint}">${count}</span>
                                <div class="bamboo-chevron${!isFocus ? ' collapsed' : ''}" id="chevron-${index}">${LucideUtils.createIcon(isFocus ? 'chevronDown' : 'chevronRight', { size: 14 })}</div>
                            </div>
                            <div class="bamboo-leaf">
                                ${LucideUtils.createIcon('leaf', { size: 16 })}
                            </div>
                        </div>
                        <div class="bamboo-card-content${!isFocus ? ' collapsed' : ''}" id="timeline-content-${index}">
                            <div class="bamboo-items">
                                ${(period.items || []).map(item => `
                                    <div class="bamboo-item">
                                        <div class="bamboo-item-time">${escapeHtml(item.time)}</div>
                                        <div class="bamboo-item-content">
                                            <div class="bamboo-item-task">${escapeHtml(item.task)}</div>
                                            ${item.eval ? `<div class="bamboo-item-eval ${item.eval === 'warn' ? 'warn' : ''}">${escapeHtml(item.eval)}</div>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.setupHoverEffects();
        this.setupTooltips();
    },

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

    setupHoverEffects() {
        if (this._hoverCleanup) this._hoverCleanup();
        const cleanups = [];
        const headers = $$('.bamboo-card-header');
        headers.forEach(header => {
            const onMouseMove = (e) => {
                const rect = header.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                header.style.setProperty('--mouse-x', `${x}%`);
                header.style.setProperty('--mouse-y', `${y}%`);
            };
            const onMouseLeave = () => {
                header.style.setProperty('--mouse-x', '50%');
                header.style.setProperty('--mouse-y', '50%');
            };
            header.addEventListener('mousemove', onMouseMove);
            header.addEventListener('mouseleave', onMouseLeave);
            cleanups.push(() => {
                header.removeEventListener('mousemove', onMouseMove);
                header.removeEventListener('mouseleave', onMouseLeave);
            });
        });
        this._hoverCleanup = () => cleanups.forEach(fn => fn());
    },

    setupTooltips() {
        let tooltip = $('.bamboo-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'bamboo-tooltip';
            modalMount().appendChild(tooltip);
        }

        const counts = $$('.bamboo-count');
        counts.forEach(count => {
            count.addEventListener('mouseenter', () => {
                const hint = count.dataset.hint;
                if (!hint) return;

                tooltip.textContent = hint;
                tooltip.style.opacity = '1';

                const rect = count.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                let top = rect.top - tooltipRect.height - 8;

                left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
                top = Math.max(8, top);

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            });

            count.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });

            count.addEventListener('mousemove', () => {
                const rect = count.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                let top = rect.top - tooltipRect.height - 8;

                left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
                top = Math.max(8, top);

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            });
        });
    }
};

ActionDispatcher.registerMany({
    'timeline-toggle': (ds) => TimelineRenderer.toggle(parseInt(ds.index))
});

window.TimelineRenderer = TimelineRenderer;