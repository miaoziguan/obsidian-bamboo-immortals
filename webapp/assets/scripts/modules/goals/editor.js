export const GOAL_TEMPLATES = [
    {
        id: 'blank',
        name: '空白目标',
        desc: '从零开始创建',
        icon: LucideUtils.createIcon('plus', { size: 32, strokeWidth: 1.5 }),
        data: {
            icon: '',
            title: '',
            meta: '',
            category: 'work',
            progress: 0,
            items: []
        }
    },
    {
        id: 'reading',
        name: '阅读计划',
        desc: '设定阅读目标与进度追踪',
        icon: LucideUtils.createIcon('bookClosed', { size: 32, strokeWidth: 1.5 }),
        data: {
            icon: '',
            title: '阅读计划',
            meta: '',
            category: 'study',
            progress: 0,
            items: [
                { name: '阅读书籍', percent: 0, detail: '' },
                { name: '读书笔记', percent: 0, detail: '' }
            ]
        }
    },
    {
        id: 'fitness',
        name: '健身锻炼',
        desc: '制定运动计划与身体指标',
        icon: LucideUtils.createIcon('dumbbell', { size: 32, strokeWidth: 1.5 }),
        data: {
            icon: '',
            title: '健身计划',
            meta: '',
            category: 'health',
            progress: 0,
            items: [
                { name: '有氧运动', percent: 0, detail: '' },
                { name: '力量训练', percent: 0, detail: '' },
                { name: '拉伸放松', percent: 0, detail: '' }
            ]
        }
    },
    {
        id: 'project',
        name: '项目开发',
        desc: '软件项目里程碑与任务分解',
        icon: LucideUtils.createIcon('code', { size: 32, strokeWidth: 1.5 }),
        data: {
            icon: '',
            title: '项目开发',
            meta: '',
            category: 'work',
            progress: 0,
            items: [
                { name: '需求分析', percent: 0, detail: '' },
                { name: '原型设计', percent: 0, detail: '' },
                { name: '开发实现', percent: 0, detail: '' },
                { name: '测试验收', percent: 0, detail: '' }
            ]
        }
    },
    {
        id: 'writing',
        name: '写作创作',
        desc: '文章或内容创作的阶段规划',
        icon: LucideUtils.createIcon('edit', { size: 32, strokeWidth: 1.5 }),
        data: {
            icon: '',
            title: '写作计划',
            meta: '',
            category: 'personal',
            progress: 0,
            items: [
                { name: '选题构思', percent: 0, detail: '' },
                { name: '大纲撰写', percent: 0, detail: '' },
                { name: '内容写作', percent: 0, detail: '' },
                { name: '修改润色', percent: 0, detail: '' }
            ]
        }
    },
    {
        id: 'saving',
        name: '储蓄理财',
        desc: '财务目标与储蓄进度追踪',
        icon: LucideUtils.createIcon('dollarSign', { size: 32, strokeWidth: 1.5 }),
        data: {
            icon: '',
            title: '储蓄目标',
            meta: '',
            category: 'finance',
            progress: 0,
            items: [
                { name: '每月储蓄', percent: 0, detail: '', startValue: '0', targetValue: '5000' },
                { name: '投资学习', percent: 0, detail: '' }
            ]
        }
    },
    {
        id: 'language',
        name: '语言学习',
        desc: '词汇、听力、口语等分项训练',
        icon: LucideUtils.createIcon('messageCircle', { size: 32, strokeWidth: 1.5 }),
        data: {
            icon: '',
            title: '语言学习',
            meta: '',
            category: 'study',
            progress: 0,
            items: [
                { name: '词汇积累', percent: 0, detail: '' },
                { name: '听力训练', percent: 0, detail: '' },
                { name: '口语练习', percent: 0, detail: '' },
                { name: '阅读理解', percent: 0, detail: '' }
            ]
        }
    }
];

export const GoalsEditor = {
    open() {
        GoalsRenderer.render(null);
    },

    _ensureGoalDefaults(goal) {
        if (!goal.category) goal.category = 'work';
        if (goal.progress === undefined) goal.progress = 0;
        if (!goal.items) goal.items = [];
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const defaultStart = fmt(today);
        const defaultEnd = fmt(oneMonthLater);
        if (!goal.startDate) goal.startDate = defaultStart;
        if (!goal.endDate) goal.endDate = defaultEnd;
        goal.items.forEach(item => {
            if (!item.startDate) item.startDate = defaultStart;
            if (!item.endDate) item.endDate = defaultEnd;
            if (item.startValue === undefined || item.startValue === '') item.startValue = '0';
            if (item.targetValue === undefined || item.targetValue === '') item.targetValue = '100';
            if (item.currentValue === undefined || item.currentValue === '') item.currentValue = '0';
            if (!item.dailyMin) delete item.dailyMin;
            if (!item.taskDayType) item.taskDayType = 'daily';
            if (!item.taskDayConfig) item.taskDayConfig = '';
        });
        return goal;
    },

    async startAddInline() {
        if (GoalsRenderer._pendingEditPromise) {
            await GoalsRenderer._pendingEditPromise;
        }
        this._showTemplatePicker(async (template) => {
            const baseData = template ? JSON.parse(JSON.stringify(template.data)) : {
                icon: '',
                title: '',
                meta: '',
                progress: 0,
                items: [],
                category: 'work',
                startDate: '',
                endDate: ''
            };
            const goal = this._ensureGoalDefaults(baseData);
            if (!goal.title) goal.title = '新目标';

            try {
                GoalsRenderer.autoCalcGoalDateRange(goal);
                const newGoal = await store.addGlobalGoal(goal);
                GoalsRenderer._expandedGoals.add(newGoal.id);
                if (typeof renderAll === 'function') renderAll();
                else if (typeof window.renderAll === 'function') window.renderAll();

                // 双帧等待确保 DOM 完全渲染
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    const titleEl = document.querySelector(`[data-inline-edit="title"][data-goal-id="${CSS.escape(newGoal.id)}"]`);
                    if (titleEl) {
                        GoalsRenderer._startInlineEdit(titleEl);
                        titleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }));
            } catch (e) {
                console.error('Failed to create goal:', e);
                Toast.showToast('创建目标失败', 'error');
            }
        });
    },

    async quickAddSubItem(goalId) {
        if (GoalsRenderer._pendingEditPromise) {
            await GoalsRenderer._pendingEditPromise;
        }

        const goals = store.getGlobalGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        if (!goal.items) goal.items = [];
        const newIdx = goal.items.length;
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        goal.items.push({
            name: '新子项目',
            detail: '',
            percent: 0,
            startDate: fmt(today),
            endDate: fmt(oneMonthLater),
            startValue: '0',
            targetValue: '100',
            currentValue: '0',
            dailyMin: '',
            taskDayType: 'daily',
            taskDayConfig: ''
        });

        try {
            GoalsRenderer.autoCalcGoalDateRange(goal);
            goal.progress = GoalsRenderer.calcProgress(goal);
            await store.updateGlobalGoal(goalId, goal);
            GoalsRenderer._expandedGoals.add(goalId);
            if (typeof renderAll === 'function') renderAll();
            else if (typeof window.renderAll === 'function') window.renderAll();

            // 双帧等待确保 DOM 完全渲染
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const nameEl = document.querySelector(`[data-inline-edit="name"][data-goal-id="${CSS.escape(goalId)}"][data-sub-idx="${newIdx}"]`);
                if (nameEl) {
                    GoalsRenderer._startInlineEdit(nameEl);
                    nameEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }));
        } catch (e) {
            console.error('Failed to add sub-item:', e);
            Toast.showToast('添加子项目失败', 'error');
        }
    },

    async removeSubItem(goalId, subIdx) {
        if (GoalsRenderer._pendingEditPromise) {
            await GoalsRenderer._pendingEditPromise;
        }

        const goals = store.getGlobalGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.items || !goal.items[subIdx]) return;

        const itemName = goal.items[subIdx].name || '该子项目';
        const confirmed = await ConfirmDialog.confirmDelete(`确定删除「${itemName}」吗？此操作无法撤销。`);
        if (!confirmed) return;

        goal.items.splice(subIdx, 1);

        try {
            GoalsRenderer.autoCalcGoalDateRange(goal);
            goal.progress = GoalsRenderer.calcProgress(goal);
            await store.updateGlobalGoal(goalId, goal);
            if (typeof renderAll === 'function') renderAll();
            else if (typeof window.renderAll === 'function') window.renderAll();
        } catch (e) {
            console.error('Failed to remove sub-item:', e);
            Toast.showToast('删除子项目失败', 'error');
        }
    },

    _showTemplatePicker(onSelect) {
        const builtinTemplates = GOAL_TEMPLATES;
        const customTemplates = (window.CustomTemplateManager ? CustomTemplateManager.getAllAsTemplates() : []);
        const allTemplates = [...builtinTemplates, ...customTemplates];

        const container = document.createElement('div');
        container.className = 'template-picker';
        container.innerHTML = `
            <div class="tmpl-overlay"></div>
            <div class="tmpl-container">
                <div class="tmpl-header">
                    <span class="tmpl-title">选择目标模板</span>
                    <button class="tmpl-close-btn" aria-label="关闭">${LucideUtils.createIcon('x', { size: 16 })}</button>
                </div>
                <div class="tmpl-tabs">
                    <button class="tmpl-tab active" data-tab="builtin">内置模板</button>
                    <button class="tmpl-tab" data-tab="custom">我的模板${customTemplates.length > 0 ? ` (${customTemplates.length})` : ''}</button>
                </div>
                <div class="tmpl-body">
                    <div class="tmpl-list" data-pane="builtin">
                        ${builtinTemplates.map(t => `
                            <div class="tmpl-card" data-tmpl-id="${t.id}">
                                <div class="tmpl-card-icon">${t.icon}</div>
                                <div class="tmpl-card-info">
                                    <span class="tmpl-card-name">${HTMLUtils.escapeHtml(t.name)}</span>
                                    <span class="tmpl-card-desc">${HTMLUtils.escapeHtml(t.desc)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="tmpl-list tmpl-list-hidden" data-pane="custom">
                        ${customTemplates.length > 0 ? customTemplates.map(t => `
                            <div class="tmpl-card tmpl-card-custom" data-tmpl-id="${t.id}">
                                <div class="tmpl-card-icon">${t.icon}</div>
                                <div class="tmpl-card-info">
                                    <span class="tmpl-card-name">${HTMLUtils.escapeHtml(t.name)}</span>
                                    <span class="tmpl-card-desc">${HTMLUtils.escapeHtml(t.desc)}</span>
                                </div>
                                <button class="tmpl-card-delete" data-tmpl-del="${t.id}" title="删除模板">${LucideUtils.createIcon('trash', { size: 14 })}</button>
                            </div>
                        `).join('') : `
                            <div class="tmpl-empty">
                                ${LucideUtils.createIcon('filePlus', { size: 32, strokeWidth: 1.5 })}
                                <p>还没有自定义模板</p>
                                <p class="tmpl-empty-hint">创建目标后，在目标操作菜单中选择"保存为模板"</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        requestAnimationFrame(() => {
            const modal = container.querySelector('.tmpl-container');
            modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;';
        });

        const closePicker = () => container.remove();

        container.querySelector('.tmpl-overlay').addEventListener('click', closePicker);
        container.querySelector('.tmpl-close-btn').addEventListener('click', closePicker);

        container.querySelectorAll('.tmpl-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.tmpl-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                container.querySelectorAll('[data-pane]').forEach(pane => {
                    pane.classList.toggle('tmpl-list-hidden', pane.dataset.pane !== target);
                });
            });
        });

        container.querySelectorAll('.tmpl-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.tmpl-card-delete')) return;
                const tmplId = card.dataset.tmplId;
                const template = allTemplates.find(t => t.id === tmplId);
                if (!template) return;
                container.remove();
                onSelect(template);
            });
        });

        container.querySelectorAll('.tmpl-card-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const tmplId = btn.dataset.tmplDel;
                const template = customTemplates.find(t => t.id === tmplId);
                if (!template) return;
                const ok = await ConfirmDialog.confirmDelete(`确定删除自定义模板「${template.name}」吗？`);
                if (!ok) return;
                CustomTemplateManager.remove(tmplId);
                Toast.showToast('模板已删除', 'success');
                container.remove();
                this._showTemplatePicker(onSelect);
            });
        });
    },

    async saveAsTemplate(goalId) {
        const goals = store.getGlobalGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const result = await this._showSaveTemplateDialog(goal);
        if (!result) return;
        try {
            CustomTemplateManager.add({
                name: result.name,
                desc: result.desc,
                iconName: result.iconName,
                data: {
                    icon: goal.icon || '',
                    title: goal.title,
                    meta: goal.meta || '',
                    category: goal.category,
                    items: (goal.items || []).map(it => ({
                        name: it.name,
                        detail: it.detail || '',
                        startValue: it.startValue,
                        targetValue: it.targetValue,
                        currentValue: it.currentValue,
                        startDate: it.startDate || '',
                        endDate: it.endDate || '',
                        dailyMin: it.dailyMin,
                        taskDayType: it.taskDayType,
                        taskDayConfig: it.taskDayConfig
                    }))
                }
            });
            Toast.showToast(`已保存为模板「${result.name}」`, 'success');
        } catch (e) {
            Toast.showToast(e.message || '保存模板失败', 'error');
        }
    },

    _showSaveTemplateDialog(goal) {
        return new Promise((resolve) => {
            const iconOptions = [
                'star', 'heart', 'flag', 'target', 'bookClosed', 'dumbbell',
                'code', 'edit', 'dollarSign', 'messageCircle', 'sparkles',
                'briefcase', 'palette', 'leaf', 'mountain', 'music'
            ];
            let selectedIcon = iconOptions[0];

            const container = document.createElement('div');
            container.className = 'tstd-save-template';
            container.innerHTML = `
                <div class="tstd-overlay"></div>
                <div class="tstd-container">
                    <div class="tstd-header">
                        <span class="tstd-title">保存为自定义模板</span>
                        <button class="tstd-close-btn" aria-label="关闭">${LucideUtils.createIcon('x', { size: 16 })}</button>
                    </div>
                    <div class="tstd-body">
                        <div class="tstd-field">
                            <label class="tstd-label">模板名称</label>
                            <input type="text" class="tstd-input" maxlength="30" value="${HTMLUtils.escapeHtmlAttr(goal.title || '')}" placeholder="如：晨间计划">
                        </div>
                        <div class="tstd-field">
                            <label class="tstd-label">模板说明</label>
                            <input type="text" class="tstd-input tstd-desc" maxlength="60" placeholder="一句话描述这个模板的用途">
                        </div>
                        <div class="tstd-field">
                            <label class="tstd-label">选择图标</label>
                            <div class="tstd-icons">
                                ${iconOptions.map((name, i) => `
                                    <button class="tstd-icon-btn ${i === 0 ? 'active' : ''}" data-icon="${name}" title="${name}">
                                        ${LucideUtils.createIcon(name, { size: 18, strokeWidth: 1.5 })}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="tstd-preview">
                            <span class="tstd-preview-label">将保存 ${(goal.items || []).length} 个子项目</span>
                        </div>
                    </div>
                    <div class="tstd-footer">
                        <button class="tstd-cancel">取消</button>
                        <button class="tstd-save">保存模板</button>
                    </div>
                </div>
            `;
            document.body.appendChild(container);

            requestAnimationFrame(() => {
                const modal = container.querySelector('.tstd-container');
                modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;';
            });

            const close = (val) => {
                document.removeEventListener('keydown', handler);
                container.remove();
                resolve(val);
            };

            container.querySelector('.tstd-overlay').addEventListener('click', () => close(null));
            container.querySelector('.tstd-close-btn').addEventListener('click', () => close(null));
            container.querySelector('.tstd-cancel').addEventListener('click', () => close(null));

            container.querySelectorAll('.tstd-icon-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    container.querySelectorAll('.tstd-icon-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedIcon = btn.dataset.icon;
                });
            });

            container.querySelector('.tstd-save').addEventListener('click', () => {
                const name = container.querySelector('.tstd-input').value.trim();
                if (!name) {
                    Toast.showToast('请输入模板名称', 'warning');
                    return;
                }
                const desc = container.querySelector('.tstd-desc').value.trim();
                close({ name, desc, iconName: selectedIcon });
            });

            const handler = (e) => {
                if (e.key === 'Escape' && document.body.contains(container)) {
                    close(null);
                }
            };
            document.addEventListener('keydown', handler);
        });
    },

    async deleteGoal(goalId) {
        try {
            const confirmed = await ConfirmDialog.confirmDelete('确定删除这个目标吗？此操作无法撤销。');
            if (!confirmed) return;
            await store.deleteGlobalGoal(goalId);
            if (typeof renderAll === 'function') renderAll();
            else if (typeof window.renderAll === 'function') window.renderAll();
            Toast.showToast('目标已删除', 'info');
        } catch (e) {
            console.error('Failed to delete goal:', e);
            Toast.showToast('删除失败', 'error');
        }
    }
};

ActionDispatcher.registerMany({
    'goal-remove-subitem': (ds) => GoalsEditor.removeSubItem(ds.goalId, parseInt(ds.subIdx, 10))
});

window.GoalsEditor = GoalsEditor;

window.GOAL_TEMPLATES = GOAL_TEMPLATES;
