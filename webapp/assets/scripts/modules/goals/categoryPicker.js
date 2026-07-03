/**
 * 分类选择器（popup） + 优先级选择器
 * 纯 DOM 弹层，从 GoalsRenderer._showCategoryPicker 提取。
 */
export const CategoryPicker = {
    show({ el, categories, currentCatId, onSelect, onCancel, onManageCategories }) {
        if (!el || !document.contains(el)) return;
        let rect;
        try {
            rect = el.getBoundingClientRect();
        } catch (e) {
            rect = null;
        }

        const container = document.createElement('div');
        container.className = 'category-picker';
        container.innerHTML = `
            <div class="catp-overlay"></div>
            <div class="catp-container">
                <div class="catp-header">
                    <span class="catp-title">选择分类</span>
                    <button class="catp-close-btn">&times;</button>
                </div>
                <div class="catp-body">
                    ${categories.map(cat => `
                        <div class="catp-item ${cat.id === currentCatId ? 'catp-item-selected' : ''}" data-cat-id="${HTMLUtils.escapeHtmlAttr(cat.id)}">
                            <span class="catp-item-name">${escapeHtml(cat.name)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="catp-footer">
                    <button class="catp-manage-btn">管理分类</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        PopupPositioner.positionOnNextFrame({
            popupElement: container.querySelector('.catp-container'),
            anchorRect: rect,
            anchor: { placement: 'below-left' },
            fallbackSize: { width: 200, height: 300 },
        });

        const closePicker = () => {
            container.remove();
            onCancel();
        };

        container.querySelector('.catp-overlay').addEventListener('click', closePicker);
        container.querySelector('.catp-close-btn').addEventListener('click', closePicker);

        container.querySelectorAll('.catp-item').forEach(item => {
            item.addEventListener('click', () => {
                const catId = item.dataset.catId;
                container.remove();
                onSelect(catId);
            });
        });

        if (onManageCategories) {
            container.querySelector('.catp-manage-btn').addEventListener('click', () => {
                container.remove();
                onManageCategories();
            });
        }
    }
};

window.CategoryPicker = CategoryPicker;
