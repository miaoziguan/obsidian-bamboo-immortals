/**
 * 优先级选择器（popup）
 * 纯 DOM 弹层，从 GoalsRenderer._showPriorityPicker 提取。
 */
export const PriorityPicker = {
    show({ el, currentPriority, onSelect, onCancel }) {
        if (!el || !document.contains(el)) return;
        let rect;
        try {
            rect = el.getBoundingClientRect();
        } catch (e) {
            rect = null;
        }

        const container = document.createElement('div');
        container.className = 'priority-picker';
        container.innerHTML = `
            <div class="prio-overlay"></div>
            <div class="prio-container">
                <div class="prio-header">
                    <span class="prio-title">选择优先级</span>
                    <button class="prio-close-btn">&times;</button>
                </div>
                <div class="prio-body">
                    <div class="prio-item ${currentPriority === 'high' ? 'prio-item-selected' : ''}" data-priority="high">
                        <span class="prio-dot high"></span>
                        <span class="prio-name">高优先级</span>
                    </div>
                    <div class="prio-item ${currentPriority === 'medium' ? 'prio-item-selected' : ''}" data-priority="medium">
                        <span class="prio-dot medium"></span>
                        <span class="prio-name">中优先级</span>
                    </div>
                    <div class="prio-item ${currentPriority === 'low' ? 'prio-item-selected' : ''}" data-priority="low">
                        <span class="prio-dot low"></span>
                        <span class="prio-name">低优先级</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        PopupPositioner.positionOnNextFrame({
            popupElement: container.querySelector('.prio-container'),
            anchorRect: rect,
            anchor: { placement: 'below-left' },
            fallbackSize: { width: 240, height: 240 },
        });

        const closePicker = () => {
            container.remove();
            onCancel();
        };

        container.querySelector('.prio-overlay').addEventListener('click', closePicker);
        container.querySelector('.prio-close-btn').addEventListener('click', closePicker);

        container.querySelectorAll('.prio-item').forEach(item => {
            item.addEventListener('click', () => {
                const priority = item.dataset.priority;
                container.remove();
                onSelect(priority);
            });
        });
    }
};

window.PriorityPicker = PriorityPicker;
