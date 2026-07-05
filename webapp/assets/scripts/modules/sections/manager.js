export const SectionManager = {
    draggedItem: null,
    draggedOverItem: null,
    hasPendingChanges: false,

    init() {
        this.registerDefaultSections();
        SectionRegistry.load();
    },

    registerDefaultSections() {
        SectionRegistry.register('themeEffect', {
            name: '主题动效',
            icon: 'Palette',
            description: '动态主题背景，竹林、海洋、森林等',
            className: 'theme-effect-section',
            isCustom: false,
            renderer: window.ThemeEffects,
            dataKey: 'themeEffect',
            theme: 'bamboo'
        });

        SectionRegistry.register('timeline', {
            name: '今日活动',
            icon: 'TreePine',
            description: '时间线记录一天活动',
            className: 'timeline-section',
            renderer: TimelineRenderer,
            dataKey: 'timeline'
        });

        SectionRegistry.register('goals', {
            name: '目标地图',
            icon: 'Map',
            description: '目标追踪和进度',
            className: 'goal-section',
            renderer: GoalsRenderer,
            editor: GoalsEditor,
            dataKey: 'goals'
        });

        SectionRegistry.register('todo', {
            name: '待办任务',
            icon: 'List',
            description: '每日待办任务管理',
            className: 'todo-section',
            renderer: TodoRenderer
        });
    },

    openSectionSettings(sectionId) {
        SectionSettings.open(sectionId);
    },

    hideFromSettings(sectionId) {
        SectionRegistry.setVisible(sectionId, false);
        renderAll();
        Toast.showToast('板块已隐藏', 'info');
        Handlers.closeModal();
    },

    openManagerFromSettings() {
        Handlers.closeModal();
        this.openManager();
    },

    openManager() {
        const allSections = SectionRegistry.getAll();
        const visible = allSections.filter(s => s.visible).sort((a, b) => a.order - b.order);
        const hidden = allSections.filter(s => !s.visible).sort((a, b) => a.order - b.order);

        const batchShowBtn = hidden.length > 1
            ? `<button class="sm-batch-show-btn" data-action="section-manager-show-all">${LucideUtils.createIcon('eye', { size: 13 })} 全部显示</button>`
            : '';

        const content = `
            <div class="sm-actions-bar">
                <div class="sm-actions-bar-tip">调整顺序或显示后，点击<span class="sm-apply-link" data-action="section-manager-apply-changes" title="将当前的顺序和显示设置应用到主页面">应用更改</span></div>
            </div>
            <div class="fab-panel-section">
                <div class="fab-panel-section-title">显示的板块 (${visible.length})</div>
                <div class="sm-list" id="smVisibleList">
                    ${visible.length > 0 ? visible.map(section => this.renderSectionItem(section)).join('') : `
                        <div class="sm-empty">暂无显示的板块</div>
                    `}
                </div>
            </div>

            <div class="fab-panel-section">
                <div class="fab-panel-section-title">
                    隐藏的板块 (${hidden.length})
                    ${batchShowBtn}
                </div>
                <div class="sm-list sm-list-hidden" id="smHiddenList">
                    ${hidden.length > 0 ? hidden.map(section => this.renderHiddenSectionItem(section)).join('') : `
                        <div class="sm-empty">所有板块都已显示</div>
                    `}
                </div>
            </div>
        `;

        PanelManager.open('sections', LucideUtils.createIcon('layoutGrid', { size: 16 }) + '板块管理', content, {
            onOpen: () => {
                SectionManager.hasPendingChanges = false;
                SectionManager._updateApplyBtnState();
                const list = document.getElementById('smVisibleList');
                if (list) SectionDragDrop.init(list, SectionManager._getDragDropConfig());
            }
        });
    },

    renderSectionItem(section) {
        return `
            <div class="sm-item" data-id="${section.id}" draggable="true">
                <div class="sm-drag-handle">${LucideUtils.createIcon('gripVertical', { size: 14 })}</div>
                <div class="sm-info">
                    <div class="sm-name">${escapeHtml(section.name)}</div>
                    <div class="sm-desc">${escapeHtml(section.description)}</div>
                </div>
                <div class="sm-actions">
                    <button class="sm-btn sm-btn-hide" data-action="section-manager-hide-section" data-section-id="${section.id}" title="隐藏">
                        ${LucideUtils.createIcon('eyeOff', { size: 16 })}
                    </button>
                </div>
            </div>
        `;
    },

    renderHiddenSectionItem(section) {
        return `
            <div class="sm-item sm-item-hidden" data-id="${section.id}">
                <div class="sm-info">
                    <div class="sm-name">${escapeHtml(section.name)}</div>
                </div>
                <div class="sm-actions">
                    <button class="sm-btn sm-btn-show" data-action="section-manager-show-section" data-section-id="${section.id}" title="显示">
                        ${LucideUtils.createIcon('eye', { size: 16 })}
                    </button>
                </div>
            </div>
        `;
    },

    hideSection(id) {
        SectionRegistry.setVisible(id, false);
        this.hasPendingChanges = true;
        this._updateManagerUI();
        this._updateApplyBtnState();
    },

    showSection(id) {
        SectionRegistry.setVisible(id, true);
        this.hasPendingChanges = true;
        this._updateManagerUI();
        this._updateApplyBtnState();
    },

    showAll() {
        SectionRegistry.getAll().forEach(s => {
            if (!s.visible) SectionRegistry.setVisible(s.id, true);
        });
        this.hasPendingChanges = true;
        this._updateManagerUI();
        this._updateApplyBtnState();
    },

    applyChanges() {
        SectionRegistry.save();
        renderAll();
        this.hasPendingChanges = false;
        this._updateApplyBtnState();
        Toast.showToast('布局已更新', 'success');
    },

    /**
     * 统一的拖拽回调配置 — 拖拽完成后标记有未应用更改
     */
    _getDragDropConfig() {
        const self = this;
        return {
            onOrderChange: () => {
                self.hasPendingChanges = true;
                self._updateApplyBtnState();
            }
        };
    },

    /**
     * 就地更新管理面板 UI（不重建整个面板）
     * 依赖：PanelManager.activeId === 'sections' 且面板 DOM 已渲染
     */
    _updateManagerUI() {
        if (!PanelManager.activePanel || PanelManager.activeId !== 'sections') {
            return;
        }
        const panel = PanelManager.activePanel;
        const visibleList = panel.querySelector('#smVisibleList');
        const hiddenList = panel.querySelector('#smHiddenList');
        if (!visibleList || !hiddenList) return;

        const allSections = SectionRegistry.getAll();
        const visible = allSections.filter(s => s.visible).sort((a, b) => a.order - b.order);
        const hidden = allSections.filter(s => !s.visible).sort((a, b) => a.order - b.order);

        const visibleTitle = panel.querySelectorAll('.fab-panel-section-title')[0];
        const hiddenTitle = panel.querySelectorAll('.fab-panel-section-title')[1];

        // 刷新可见板块列表（保留拖拽容器 ID）
        visibleList.innerHTML = visible.length > 0
            ? visible.map(s => this.renderSectionItem(s)).join('')
            : '<div class="sm-empty">暂无显示的板块</div>';

        // 刷新隐藏板块列表 + 标题中的"全部显示"按钮
        const batchBtn = hidden.length > 1
            ? `<button class="sm-batch-show-btn" data-action="section-manager-show-all">${LucideUtils.createIcon('eye', { size: 13 })} 全部显示</button>`
            : '';

        hiddenList.innerHTML = hidden.length > 0
            ? hidden.map(s => this.renderHiddenSectionItem(s)).join('')
            : '<div class="sm-empty">所有板块都已显示</div>';

        if (visibleTitle) visibleTitle.innerHTML = `显示的板块 (${visible.length})`;
        if (hiddenTitle) hiddenTitle.innerHTML = `隐藏的板块 (${hidden.length})${batchBtn}`;

        // 重新初始化拖拽
        SectionDragDrop.init(visibleList, this._getDragDropConfig());

        // 确保按钮状态是最新的
        this._updateApplyBtnState();
    },

    _updateApplyBtnState() {
        // 文本链接模式，无需更新按钮状态
    },


};

ActionDispatcher.registerMany({
    'section-manager-hide-section': (ds) => SectionManager.hideSection(ds.sectionId),
    'section-manager-show-section': (ds) => SectionManager.showSection(ds.sectionId),
    'section-manager-show-all': () => SectionManager.showAll(),
    'section-manager-apply-changes': () => SectionManager.applyChanges()
});

window.SectionManager = SectionManager;