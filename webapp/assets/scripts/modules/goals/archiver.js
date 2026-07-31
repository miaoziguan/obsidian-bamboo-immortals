import { $, modalMount } from '../../utils/domRef.js';
import { DateRangePicker } from './dateRangePicker.js';
/**
 * GoalsArchiver — 目标归档管理面板
 *
 * 从 GoalsRenderer 中拆出，负责归档目标的筛选、查看、批量恢复/删除、撤销等操作。
 * 通过 _renderer 回调与 GoalsRenderer 解耦。
 */
export const GoalsArchiver = {
    /** 回引 GoalsRenderer，用于调用 render() / calcProgress() */
    _renderer: null,

    /** 独立页根容器 */
    _standaloneRoot: null,

    /** 是否为独立页模式 */
    _isStandalone: false,

    _state: {
        filter: { category: 'all', keyword: '', dateStart: '', dateEnd: '' },
        availableCategories: [],
        selection: new Set(),
        selectAll: false
    },

    /** 初始化，绑定对 GoalsRenderer 的依赖 */
    init(renderer) {
        this._renderer = renderer;
    },

    // ========== 入口 ==========

    openArchiveManager() {
        this._isStandalone = false;
        this._standaloneRoot = null;
        this._loadArchiveFilter();
        this._renderArchivePanel();
    },

    /**
     * 独立页入口：直接渲染归档管理器到指定根容器。
     * 不依赖 PanelManager，操作完成后通过 postMessage 通知宿主目标库已变更。
     */
    openStandalone(root) {
        if (!root) return;
        this._isStandalone = true;
        this._standaloneRoot = root;
        this._loadArchiveFilter();
        this._renderArchivePanel();
    },

    // ========== 筛选状态持久化 ==========

    _loadArchiveFilter() {
        try {
            const saved = StorageAdapter.get(StorageKeys.ARCHIVE_FILTER);
            if (saved) {
                const parsed = JSON.parse(saved);
                delete parsed.date;
                delete parsed.progress;
                this._state.filter = {
                    category: 'all', keyword: '',
                    dateStart: '', dateEnd: '', ...parsed
                };
                return;
            }
        } catch (e) { /* ignore */ }
        this._state.filter = { category: 'all', keyword: '', dateStart: '', dateEnd: '' };
    },

    _saveArchiveFilter() {
        try {
            StorageAdapter.set(StorageKeys.ARCHIVE_FILTER, JSON.stringify(this._state.filter));
        } catch (e) {
            console.error('Failed to save archive filter:', e);
        }
    },

    // ========== 筛选栏 HTML ==========

    _buildArchiveFilterHTML() {
        const filter = this._state.filter;
        const categories = GoalService.getCategories();
        this._state.availableCategories = [...new Set(categories.map(c => c.name))];

        return `
            <div class="arch-filter-bar">
                <div class="arch-filter-toolbar">
                    <div class="arch-filter-search">
                        ${LucideUtils.createIcon('search', { size: 14 })}
                        <input type="text" class="arch-filter-input" data-filter-key="keyword" placeholder="搜索目标..." value="${escapeHtml(filter.keyword)}">
                        ${filter.keyword ? `<button class="arch-icon-btn" data-action="arch-clear-keyword" title="清除">${LucideUtils.createIcon('x', { size: 12 })}</button>` : ''}
                    </div>
                    <div class="arch-filter-field arch-filter-field-select">
                        ${LucideUtils.createIcon('folderOpen', { size: 14 })}
                        <select class="arch-select arch-select-category" data-filter-key="category">
                            <option value="all" ${filter.category === 'all' ? 'selected' : ''}>全部分类</option>
                            ${categories.map(c => `<option value="${escapeHtml(c.name)}" ${filter.category === c.name ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="arch-filter-field arch-filter-field-date arch-date-trigger" data-action="arch-open-date-picker" title="选择归档日期范围">
                        ${LucideUtils.createIcon('calendar', { size: 14 })}
                        <span class="arch-date-label">${filter.dateStart || filter.dateEnd ? `${escapeHtml(filter.dateStart || '开始')} ~ ${escapeHtml(filter.dateEnd || '结束')}` : '选择日期范围'}</span>
                        ${filter.dateStart || filter.dateEnd ? `<button class="arch-icon-btn" data-action="arch-clear-date" title="清除日期">${LucideUtils.createIcon('x', { size: 12 })}</button>` : ''}
                    </div>
                    ${filter.category !== 'all' || filter.dateStart || filter.dateEnd ? `<button class="arch-reset-btn" data-action="arch-reset-filter">重置</button>` : ''}
                </div>
            </div>
        `;
    },

    // ========== 过滤逻辑 ==========

    /**
     * 验证并自动修复归档目标的数据完整性
     */
    async _validateArchivedGoals(goals) {
        let needsSave = false;
        const fixedGoals = [];

        for (const g of goals) {
            if (!g.archivedAt) {
                g.archivedAt = g.startDate ? new Date(g.startDate).toISOString() : new Date().toISOString();
                fixedGoals.push(g.title || g.id);
                needsSave = true;
            }
        }

        if (needsSave) {
            try {
                await GoalService._save();
                console.warn(`[Bamboo] 自动修复了 ${fixedGoals.length} 个归档目标的 archivedAt 字段`);
            } catch (e) {
                console.error('[Bamboo] 保存修复失败:', e);
            }
        }

        return goals;
    },

    _filterArchivedGoals(goals) {
        const filter = this._state.filter;
        const keyword = (filter.keyword || '').trim().toLowerCase();

        return goals.filter(g => {
            if (keyword && !g.title.toLowerCase().includes(keyword)) return false;
            if (filter.category !== 'all') {
                const cat = GoalService.getCategories().find(c => c.id === g.category);
                if (!cat || cat.name !== filter.category) return false;
            }
            if (filter.dateStart) {
                const d = new Date(g.archivedAt || g.startDate);
                if (d < new Date(filter.dateStart)) return false;
            }
            if (filter.dateEnd) {
                const d = new Date(g.archivedAt || g.startDate);
                if (d > new Date(filter.dateEnd + 'T23:59:59')) return false;
            }
            return true;
        });
    },

    // ========== 面板渲染 ==========

    _renderArchiveCard(goal, highlightKeyword) {
        const progress = this._renderer ? this._renderer.calcProgress(goal) : 0;
        const isComplete = progress >= 100;
        const archivedDate = goal.archivedAt
            ? new Date(goal.archivedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
            : '';
        const category = GoalService.getCategories().find(c => c.id === goal.category);
        const categoryLabel = category ? category.name : '';

        const highlightText = (text) => {
            if (!highlightKeyword || !text) return escapeHtml(text || '');
            const regex = new RegExp(`(${highlightKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return escapeHtml(text).replace(regex, '<mark class="arch-highlight">$1</mark>');
        };

        const hasItems = goal.items && goal.items.length > 0;
        let itemsPreview = '';
        if (hasItems) {
            itemsPreview = `
                <div class="arch-items">
                    ${goal.items.map(item => {
                        const itemProgress = GoalService.calcProgressFromValues(item);
                        const isItemDone = itemProgress >= 100;
                        return `
                            <div class="arch-item">
                                <span class="arch-item-name">${highlightText(item.name)}</span>
                                <span class="arch-item-progress ${isItemDone ? 'done' : ''}">${itemProgress}%${isItemDone ? ' ✓' : ''}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        return `
            <div class="arch-card ${isComplete ? 'done' : ''}" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                <label class="arch-check">
                    <input type="checkbox" class="arch-cb" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                    <span class="arch-cb-box"></span>
                </label>
                <div class="arch-body">
                    <div class="arch-head">
                        <span class="arch-title">${highlightText(goal.title)}</span>
                        <span class="arch-pct ${isComplete ? 'done' : ''}">${progress}%</span>
                    </div>
                    <div class="arch-meta">
                        <span class="arch-date">归档于 ${archivedDate}</span>
                    </div>
                    <div class="arch-expand">
                        ${categoryLabel ? `<div class="arch-expand-row"><span class="arch-tag">${escapeHtml(categoryLabel)}</span></div>` : ''}
                        ${itemsPreview}
                        <div class="arch-expand-actions">
                            <button class="arch-act-btn" data-action="archive-restore" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="恢复到活跃列表">${LucideUtils.createIcon('rotateCcw', { size: 13 })} 恢复</button>
                            <button class="arch-act-btn arch-act-del" data-action="archive-delete" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" title="永久删除">${LucideUtils.createIcon('trash', { size: 13 })} 删除</button>
                        </div>
                    </div>
                </div>
                <span class="arch-toggle-icon">${LucideUtils.createIcon('chevronDown', { size: 14 })}</span>
            </div>
        `;
    },

    _buildArchiveContentHTML(archived) {
        const filter = this._state.filter;
        const keyword = filter.keyword;
        const filtered = this._filterArchivedGoals(archived);

        return `
            ${this._buildArchiveFilterHTML()}
            <div class="arch-list">
                <div class="arch-scroll">
                    ${filtered.length === 0 ? `
                        <div class="arch-empty">没有匹配的归档目标</div>
                    ` : filtered.map(goal => this._renderArchiveCard(goal, keyword)).join('')}
                </div>
                <div class="arch-bar">
                    <label class="arch-sel-all">
                        <input type="checkbox" class="arch-cb-all" data-action="archive-toggle-all">
                        <span class="arch-cb-box"></span>
                        <span>全选</span>
                    </label>
                    <div class="arch-bar-actions">
                        <button class="arch-bar-btn" data-action="archive-batch-restore" disabled>${LucideUtils.createIcon('refreshCw', { size: 13 })} 恢复已选</button>
                        <button class="arch-bar-btn" data-action="archive-batch-delete" disabled>${LucideUtils.createIcon('trash', { size: 13 })} 删除已选</button>
                    </div>
                </div>
            </div>
        `;
    },

    _renderArchivePanel() {
        const archived = store.getArchivedGoals();
        this._validateArchivedGoals(archived);

        if (this._isStandalone && this._standaloneRoot) {
            // 独立页模式：直接渲染到根容器
            if (archived.length === 0) {
                this._standaloneRoot.innerHTML = this._renderArchiveStandaloneHeader() + this._renderArchiveEmptyState();
            } else {
                this._standaloneRoot.innerHTML = this._renderArchiveStandaloneHeader() + this._buildArchiveContentHTML(archived);
            }
            this._bindEvents(this._standaloneRoot);
            return;
        }

        if (archived.length === 0) {
            PanelManager.open('archive', LucideUtils.createIcon('archive', { size: 16 }) + '目标归档', this._renderArchiveEmptyState());
            return;
        }

        const content = this._buildArchiveContentHTML(archived);
        PanelManager.open('archive', LucideUtils.createIcon('archive', { size: 16 }) + '目标归档', content, {
            onOpen: (panel) => this._bindEvents(panel)
        });
    },

    _renderArchiveStandaloneHeader() {
        return `
            <div class="archive-standalone-header">
                <div class="archive-standalone-title">
                    ${LucideUtils.createIcon('archive', { size: 20 })}
                    <span>目标归档</span>
                </div>
                <div class="archive-standalone-sub">完成或删除的目标会汇集在这里，可随时恢复或清理</div>
            </div>
        `;
    },

    _renderArchiveEmptyState() {
        return `
            <div class="arch-empty-state">
                <div class="arch-empty-icn">${LucideUtils.createIcon('archive', { size: 40, strokeWidth: 1 })}</div>
                <div class="arch-empty-txt">暂无归档目标</div>
                <div class="arch-empty-sub">完成或删除的目标会出现在这里</div>
            </div>
        `;
    },

    // ========== 事件绑定 ==========

    _bindEvents(root) {
        // 面板模式下取面板内容区；独立页模式下直接操作根容器
        const body = root.querySelector('.fab-panel-body') || root;
        if (!body) return;

        // 搜索输入 — 防抖
        const searchInput = body.querySelector('.arch-filter-input');
        if (searchInput) {
            let timer;
            searchInput.addEventListener('input', () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    this._state.filter.keyword = searchInput.value;
                    this._saveArchiveFilter();
                    this._refreshContent();
                }, 250);
            });
        }

        // 清除关键词
        body.onpointerdown = (e) => {
            const t = e.target;
            if (t.matches('[data-action="arch-clear-keyword"]')) {
                this._state.filter.keyword = '';
                this._saveArchiveFilter();
                this._refreshContent();
            } else if (t.matches('[data-action="arch-reset-filter"]')) {
                this._state.filter = { category: 'all', keyword: '', dateStart: '', dateEnd: '' };
                this._saveArchiveFilter();
                this._refreshContent();
            } else if (t.matches('[data-action="arch-clear-date"]')) {
                this._state.filter.dateStart = '';
                this._state.filter.dateEnd = '';
                this._saveArchiveFilter();
                this._refreshContent();
            } else if (t.matches('[data-action="arch-toggle-items"]')) {
                const items = t.closest('.arch-items');
                if (items) items.querySelectorAll('.arch-item-collapsed').forEach(el => el.classList.remove('arch-item-collapsed'));
                t.remove();
            } else if (t.matches('.arch-cb')) {
                // 复选框在 change 中处理
            }
        };

        // 下拉筛选
        body.querySelectorAll('.arch-select').forEach(sel => {
            sel.addEventListener('change', () => {
                this._state.filter[sel.dataset.filterKey] = sel.value;
                this._saveArchiveFilter();
                this._refreshContent();
            });
        });

        // 日期范围选择器
        const dateTrigger = body.querySelector('.arch-date-trigger');
        if (dateTrigger) {
            dateTrigger.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="arch-clear-date"]')) return;
                DateRangePicker.show({
                    el: dateTrigger,
                    currentStart: this._state.filter.dateStart,
                    currentEnd: this._state.filter.dateEnd,
                    onSelect: (start, end) => {
                        this._state.filter.dateStart = start;
                        this._state.filter.dateEnd = end;
                        this._saveArchiveFilter();
                        this._refreshContent();
                    },
                    onCancel: () => {}
                });
            });
        }

        // 卡片复选框
        body.querySelectorAll('.arch-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) this._state.selection.add(cb.dataset.goalId);
                else this._state.selection.delete(cb.dataset.goalId);
                this._updateBar(body);
            });
        });

        // 全选
        const allCb = body.querySelector('.arch-cb-all');
        if (allCb) {
            allCb.addEventListener('change', () => {
                this._state.selectAll = allCb.checked;
                body.querySelectorAll('.arch-cb').forEach(cb => {
                    cb.checked = allCb.checked;
                    if (allCb.checked) this._state.selection.add(cb.dataset.goalId);
                    else this._state.selection.delete(cb.dataset.goalId);
                });
                this._updateBar(body);
            });
        }

        // 卡片点击展开/折叠（排除复选框和操作按钮区域）
        body.addEventListener('click', (e) => {
            const card = e.target.closest('.arch-card');
            if (!card) return;
            // 点击复选框、操作按钮时不触发折叠
            if (e.target.closest('.arch-check')) return;
            if (e.target.closest('.arch-expand-actions')) return;

            card.classList.toggle('arch-card-expanded');
        });

        // 操作按钮（恢复/删除）— 使用事件委托
        body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action^="archive-"]');
            if (!btn) return;

            switch (btn.dataset.action) {
                case 'archive-restore':
                    this.unarchiveGoal(btn.dataset.goalId);
                    break;
                case 'archive-delete':
                    this.deleteArchivedGoal(btn.dataset.goalId);
                    break;
                case 'archive-batch-restore':
                    this._batchUnarchive([...this._state.selection]);
                    break;
                case 'archive-batch-delete':
                    this._batchDeleteArchived([...this._state.selection]);
                    break;
            }
        });

        this._updateBar(body);
    },

    _updateBar(body) {
        const bar = body.querySelector('.arch-bar');
        if (!bar) return;
        const count = this._state.selection.size;
        const restoreBtn = bar.querySelector('[data-action="archive-batch-restore"]');
        const deleteBtn = bar.querySelector('[data-action="archive-batch-delete"]');
        if (restoreBtn) restoreBtn.disabled = count === 0;
        if (deleteBtn) deleteBtn.disabled = count === 0;
    },

    // ========== 内容刷新 ==========

    _refreshContent() {
        this._saveArchiveFilter();

        // 独立页模式：直接刷新根容器
        if (this._isStandalone && this._standaloneRoot) {
            this._state.selection.clear();
            this._state.selectAll = false;

            const archived = store.getArchivedGoals();
            if (archived.length === 0) {
                this._standaloneRoot.innerHTML = this._renderArchiveStandaloneHeader() + this._renderArchiveEmptyState();
            } else {
                this._standaloneRoot.innerHTML = this._renderArchiveStandaloneHeader() + this._buildArchiveContentHTML(archived);
            }
            this._bindEvents(this._standaloneRoot);
            return;
        }

        let panel = PanelManager.activePanel;
        if (!panel || !panel.id.includes('archive')) {
            this.openArchiveManager();
            return;
        }

        const body = panel.querySelector('.fab-panel-body');
        if (!body) return;

        this._state.selection.clear();
        this._state.selectAll = false;

        const archived = store.getArchivedGoals();
        if (archived.length === 0) {
            body.innerHTML = this._renderArchiveEmptyState();
            return;
        }

        body.innerHTML = this._buildArchiveContentHTML(archived);
        this._bindEvents(panel);
    },

    // ========== 批量操作 ==========

    async _batchUnarchive(goalIds) {
        let successCount = 0;
        for (const id of goalIds) {
            try {
                await store.unarchiveGoal(id);
                successCount++;
            } catch (e) {
                console.error('[Bamboo] 恢复失败:', id, e.message);
            }
        }
        this._state.selection.clear();
        this._refreshContent();
        if (this._renderer) this._renderer.render();
        this._notifyGoalsChanged();
        Toast.showToast(`已恢复 ${successCount} 个目标`, 'success');
    },

    async _batchDeleteArchived(goalIds) {
        const confirmed = await ConfirmDialog.confirmDelete(`确定要永久删除选中的 ${goalIds.length} 个归档目标吗？`);
        if (!confirmed) return;

        const allGoals = store.getGlobalGoals();
        const deletedGoals = goalIds.map(id => allGoals.find(g => g.id === id)).filter(Boolean).map(g => JSON.parse(JSON.stringify(g)));

        let deletedCount = 0;
        for (const id of goalIds) {
            try {
                await store.deleteGlobalGoal(id);
                deletedCount++;
            } catch (e) {
                console.error('[Bamboo] 删除失败:', id, e.message);
            }
        }

        this._state.selection.clear();
        this._refreshContent();
        if (typeof TodoRenderer !== 'undefined') TodoRenderer._invalidateCache();
        this._notifyGoalsChanged();
        this._showUndoToast(`已删除 ${deletedCount} 个目标`, deletedGoals);
    },

    // ========== 单项操作 ==========

    async unarchiveGoal(goalId) {
        await store.unarchiveGoal(goalId);
        this._refreshContent();
        if (this._renderer) this._renderer.render();
        this._notifyGoalsChanged();
        Toast.showToast('目标已恢复到活跃列表', 'success');
    },

    async deleteArchivedGoal(goalId) {
        const confirmed = await ConfirmDialog.confirmDelete('确定要永久删除这个归档目标吗？');
        if (!confirmed) return;

        const goal = store.getGlobalGoals().find(g => g.id === goalId);
        const deletedGoal = goal ? JSON.parse(JSON.stringify(goal)) : null;

        await store.deleteGlobalGoal(goalId);
        this._state.selection.clear();
        this._refreshContent();
        if (typeof TodoRenderer !== 'undefined') TodoRenderer._invalidateCache();
        this._notifyGoalsChanged();
        this._showUndoToast('目标已永久删除', deletedGoal ? [deletedGoal] : []);
    },

    /**
     * 通知宿主插件目标库已变更。
     * 面板模式下由 GoalsRenderer.render() 局部刷新；独立页模式下需显式 postMessage。
     */
    _notifyGoalsChanged() {
        if (!this._isStandalone) return;
        try {
            window.parent.postMessage({ type: 'goals:changed', id: 'notify_' + Date.now() }, '*');
        } catch (e) {
            console.warn('[Archive] 通知宿主目标变更失败:', e);
        }
    },

    // ========== 撤销 Toast ==========

    _showUndoToast(message, deletedGoals) {
        let container = $('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            modalMount().appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast success toast-undo';
        const iconHtml = typeof LucideUtils !== 'undefined'
            ? LucideUtils.createIcon('trash', { size: 18 }) : '';

        toast.innerHTML = `
            <span class="toast-icon">${iconHtml}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-undo-btn">撤销</button>
        `;

        let undone = false;
        const undoBtn = toast.querySelector('.toast-undo-btn');

        const dismiss = () => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
                if (container.children.length === 0) container.remove();
            }, 300);
        };

        const self = this;
        undoBtn.addEventListener('click', async () => {
            if (undone) return;
            undone = true;

            for (const g of deletedGoals) {
                try {
                    g.archived = true;
                    if (!g.archivedAt) g.archivedAt = new Date().toISOString();
                    await GoalService.add(g);
                } catch (e) {
                    console.error('[Bamboo] 撤销恢复失败:', g.id, e.message);
                }
            }

            self._refreshContent();
            if (typeof TodoRenderer !== 'undefined') TodoRenderer._invalidateCache();
            if (self._renderer) self._renderer.render();
            self._notifyGoalsChanged();
            dismiss();
            Toast.showToast(`已撤销删除，恢复了 ${deletedGoals.length} 个归档目标`, 'success');
        });

        container.appendChild(toast);
        setTimeout(() => { if (!undone) dismiss(); }, 5000);
    }
};

window.GoalsArchiver = GoalsArchiver;
