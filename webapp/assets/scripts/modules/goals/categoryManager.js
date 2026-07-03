/**
 * 分类管理器（modal）
 * 纯 DOM 弹层，从 GoalsRenderer._showCategoryManager 提取。
 * 接受 initialCategories / onSaveCategories / onPromptMigration 三个回调解耦 this 引用。
 */
export const CategoryManager = {
    show({ initialCategories, onSaveCategories, onPromptMigration, onClose }) {
        let categories = initialCategories.map(c => ({ ...c }));

        const container = document.createElement('div');
        container.className = 'category-manager';
        container.innerHTML = `
            <div class="catm-overlay"></div>
            <div class="catm-container">
                <div class="catm-header">
                    <span class="catm-title">管理分类</span>
                    <button class="catm-close-btn">&times;</button>
                </div>
                <div class="catm-body">
                    <div class="catm-list"></div>
                    <div class="catm-add-section">
                        <div class="catm-form-row">
                            <input type="text" class="catm-input catm-name-input" placeholder="分类名称">
                            <button class="catm-add-btn">+ 添加</button>
                        </div>
                    </div>
                </div>
                <div class="catm-footer">
                    <button class="catm-done-btn">完成</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        requestAnimationFrame(() => {
            const modal = container.querySelector('.catm-container');
            modal.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;`;
        });

        const renderList = () => {
            const listEl = container.querySelector('.catm-list');
            listEl.innerHTML = categories.map((cat, idx) => `
                <div class="catm-item" data-idx="${idx}">
                    <span class="catm-item-name">${escapeHtml(cat.name)}</span>
                    <div class="catm-item-actions">
                        <button class="catm-edit-btn" title="编辑">${LucideUtils.createIcon('edit', { size: 14 })}</button>
                        <button class="catm-delete-btn" title="删除">${LucideUtils.createIcon('trash', { size: 14 })}</button>
                    </div>
                </div>
            `).join('');

            listEl.querySelectorAll('.catm-edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemEl = btn.closest('.catm-item');
                    const idx = parseInt(itemEl.dataset.idx);
                    const cat = categories[idx];
                    const nameSpan = itemEl.querySelector('.catm-item-name');
                    const actionsDiv = itemEl.querySelector('.catm-item-actions');

                    nameSpan.innerHTML = `<input type="text" class="catm-inline-input" value="${HTMLUtils.escapeHtmlAttr(cat.name)}" style="width:120px;">`;
                    actionsDiv.innerHTML = `<button class="catm-save-btn">${LucideUtils.createIcon('check', { size: 14 })}</button><button class="catm-cancel-btn">${LucideUtils.createIcon('x', { size: 14 })}</button>`;

                    const saveBtn = actionsDiv.querySelector('.catm-save-btn');
                    const cancelBtn = actionsDiv.querySelector('.catm-cancel-btn');

                    saveBtn.addEventListener('click', () => {
                        const newName = itemEl.querySelector('.catm-inline-input').value.trim();
                        if (!newName) return;
                        categories[idx] = { ...cat, name: newName };
                        onSaveCategories(categories);
                        renderList();
                    });

                    cancelBtn.addEventListener('click', () => renderList());
                });
            });

            listEl.querySelectorAll('.catm-delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const itemEl = btn.closest('.catm-item');
                    const idx = parseInt(itemEl.dataset.idx);
                    const cat = categories[idx];
                    if (!cat) return;

                    const affected = GoalService.getGoalsByCategory(cat.id);
                    const affectedCount = affected.length;
                    const fallbackCats = categories.filter(c => c.id !== cat.id);

                    const message = affectedCount > 0
                        ? `分类「${cat.name}」正在被 <strong style="color:var(--bamboo-error)">${affectedCount}</strong> 个目标使用。删除后这些目标需要重新归类。`
                        : `确定删除分类「${cat.name}」吗？此操作不影响现有目标。`;

                    const result = await ConfirmDialog.danger({
                        title: '确认删除分类',
                        message,
                        confirmText: '删除',
                        cancelText: '取消',
                        extraOptions: affectedCount > 0 ? {
                            key: 'fallback',
                            label: '受影响目标处理方式',
                            choices: [
                                { value: 'unclassified', label: '设为未分类（推荐）', default: true },
                                ...(fallbackCats.length > 0 ? [{
                                    value: '__choose__',
                                    label: '迁移到其他分类…'
                                }] : [])
                            ]
                        } : null
                    });
                    if (!result || result.confirmed !== true) return;

                    let fallbackCategoryId = '';
                    if (affectedCount > 0 && result.extraValues && result.extraValues.fallback === '__choose__') {
                        const picked = await onPromptMigration(fallbackCats, cat.name);
                        if (picked === null) return;
                        fallbackCategoryId = picked;
                    } else if (affectedCount > 0 && result.extraValues && result.extraValues.fallback === 'unclassified') {
                        fallbackCategoryId = '';
                    }

                    categories.splice(idx, 1);
                    await onSaveCategories(categories);

                    if (affectedCount > 0) {
                        const migrated = await GoalService.reassignGoalsCategory(cat.id, fallbackCategoryId);
                        const targetName = fallbackCategoryId
                            ? (fallbackCats.find(c => c.id === fallbackCategoryId)?.name || '其他')
                            : '未分类';
                        Toast.showToast(`「${cat.name}」已删除，${migrated} 个目标已归入「${targetName}」`, 'success');
                    } else {
                        Toast.showToast(`「${cat.name}」已删除`, 'success');
                    }

                    renderList();
                });
            });
        };

        renderList();

        const closeManager = () => {
            container.remove();
            if (onClose) onClose();
        };

        container.querySelector('.catm-overlay').addEventListener('click', closeManager);
        container.querySelector('.catm-close-btn').addEventListener('click', closeManager);
        container.querySelector('.catm-done-btn').addEventListener('click', closeManager);

        container.querySelector('.catm-add-btn').addEventListener('click', () => {
            const nameInput = container.querySelector('.catm-name-input');
            const name = nameInput.value.trim();
            if (!name) {
                Toast.showToast('请输入分类名称', 'error');
                return;
            }
            const id = 'cat_' + Date.now();
            categories.push({ id, name });
            onSaveCategories(categories);
            nameInput.value = '';
            renderList();
        });
    }
};

window.CategoryManager = CategoryManager;
