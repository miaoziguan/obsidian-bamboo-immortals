import { byId, getDomRoot } from '../utils/domRef.js';

export const RenderScheduler = {
    _dirtySections: new Set(),
    _renderAllDirty: false,
    _timer: null,
    _isRendering: false,
    _pendingFlush: false,
    _debounceMs: 30,
    _fullRenderFn: null,
    _sectionRenderFns: {},
    _hoverEffectFn: null,
    _tooltipFn: null,
    _todoCollapseFn: null,
    _dateTransitioning: false,
    _dateTransitionTimer: null,
    _dateTransitionRaf: null,
    _exitAnimationMs: 280,
    _enterAnimationMs: 420,

    config(opts = {}) {
        if (opts.fullRenderFn) this._fullRenderFn = opts.fullRenderFn;
        if (opts.sectionRenderFns) this._sectionRenderFns = { ...this._sectionRenderFns, ...opts.sectionRenderFns };
        if (opts.hoverEffectFn) this._hoverEffectFn = opts.hoverEffectFn;
        if (opts.tooltipFn) this._tooltipFn = opts.tooltipFn;
        if (opts.todoCollapseFn) this._todoCollapseFn = opts.todoCollapseFn;
    },

    markDirty(sectionId) {
        if (this._renderAllDirty) return;
        this._dirtySections.add(sectionId);
        this.schedule();
    },

    markAllDirty() {
        this._renderAllDirty = true;
        this._dirtySections.clear();
        this.schedule();
    },

    schedule() {
        if (this._timer) return;
        this._timer = setTimeout(() => {
            this._timer = null;
            this.flush();
        }, this._debounceMs);
    },

    flush() {
        if (this._isRendering) {
            this._pendingFlush = true;
            return;
        }

        this._isRendering = true;

        try {
            const needsFullRender = this._renderAllDirty;
            const dirtyIds = new Set(this._dirtySections);

            this._renderAllDirty = false;
            this._dirtySections.clear();

            if (needsFullRender) {
                this._doFullRender();
            } else if (dirtyIds.size > 0) {
                this._doPartialRender(dirtyIds);
            }
        } catch (e) {
            console.error('[RenderScheduler] 渲染出错:', e);
        } finally {
            this._isRendering = false;
            if (this._pendingFlush) {
                this._pendingFlush = false;
                this.flush();
            }
        }
    },

    _doFullRender() {
        if (this._fullRenderFn) {
            this._fullRenderFn();
        }
        // 多列（瀑布流）模式下重新分列（全量渲染清空重建了容器）
        if (typeof LayoutMode !== 'undefined' && LayoutMode.isActive && LayoutMode.isActive()) {
            try { LayoutMode.reflow(); } catch (e) { /* noop */ }
        }
    },

    _doPartialRender(dirtyIds) {
        const sectionsContainer = byId('sectionsContainer');
        if (!sectionsContainer) return;

        const scrollHost = getDomRoot();
        const scrollTop = scrollHost ? scrollHost.scrollTop : 0;
        const activeEl = document.activeElement;
        const activeAction = activeEl ? activeEl.dataset?.action : null;
        const activeTodoId = activeEl ? activeEl.dataset?.todoId : null;

        const allSections = (typeof SectionRegistry !== 'undefined' && SectionRegistry.getVisible)
            ? SectionRegistry.getVisible()
            : [];

        const hasThemeEffect = dirtyIds.has('themeEffect');

        dirtyIds.forEach(sectionId => {
            if (sectionId === 'themeEffect') return;

            const section = (typeof SectionRegistry !== 'undefined' && SectionRegistry.get)
                ? SectionRegistry.get(sectionId)
                : null;
            if (!section || !section.visible) return;

            const renderFn = this._sectionRenderFns[sectionId];
            if (!renderFn) return;

            const oldEl = sectionsContainer.querySelector(`[data-section-id="${sectionId}"]`);
            const sectionIndex = allSections.findIndex(s => s.id === sectionId);
            const newEl = renderFn(section, sectionIndex);

            if (newEl) {
                newEl.setAttribute('data-section-id', sectionId);
                newEl.style.animationDelay = `${sectionIndex * 0.05}s`;
                if (oldEl) {
                    oldEl.replaceWith(newEl);
                } else {
                    this._insertInOrder(sectionsContainer, newEl, sectionId, allSections);
                }
            }
        });

        if (hasThemeEffect) {
            const themeSection = (typeof SectionRegistry !== 'undefined' && SectionRegistry.get)
                ? SectionRegistry.get('themeEffect')
                : null;
            if (themeSection && themeSection.visible) {
                const themeRenderFn = this._sectionRenderFns['themeEffect'];
                if (themeRenderFn) {
                    const sectionIndex = allSections.findIndex(s => s.id === 'themeEffect');
                    const newThemeEl = themeRenderFn(themeSection, sectionIndex);
                    if (newThemeEl) {
                        newThemeEl.setAttribute('data-section-id', 'themeEffect');
                        newThemeEl.style.animationDelay = `${sectionIndex * 0.05}s`;
                        const oldThemeEl = sectionsContainer.querySelector('[data-section-id="themeEffect"]');
                        if (oldThemeEl) {
                            oldThemeEl.replaceWith(newThemeEl);
                        } else {
                            this._insertInOrder(sectionsContainer, newThemeEl, 'themeEffect', allSections);
                        }
                    }
                }
            }
        }

        if (this._todoCollapseFn) {
            try { this._todoCollapseFn(); } catch (e) { /* noop */ }
        }

        if (scrollHost) {
            scrollHost.scrollTop = scrollTop;
        }

        if (activeAction) {
            const restoredEl = activeTodoId
                ? document.querySelector(`[data-action="${activeAction}"][data-todo-id="${activeTodoId}"]`)
                : document.querySelector(`[data-action="${activeAction}"]`);
            if (restoredEl) restoredEl.focus();
        }

        if (dirtyIds.has('timeline') && this._hoverEffectFn) {
            try { this._hoverEffectFn(); } catch (e) { /* noop */ }
        }
        if (this._tooltipFn) {
            try { this._tooltipFn(); } catch (e) { /* noop */ }
        }

        // 多列（瀑布流）模式下，渲染可能把板块插回容器顶层（绕开列 wrapper），
        // 重新分列保持列独立高度布局
        if (typeof LayoutMode !== 'undefined' && LayoutMode.isActive && LayoutMode.isActive()) {
            try { LayoutMode.reflow(); } catch (e) { /* noop */ }
        }
    },

    _insertInOrder(container, newEl, sectionId, allSections) {
        // 多列（瀑布流/看板）模式下：板块被分入 .layout-col wrapper，container 的
        // insertBefore 参照节点在 wrapper 内（非 container 直接子）会抛 NotFoundError。
        // 此时跳过按序插入，交由 reflow() 在渲染末尾统一重新分列。
        if (typeof LayoutMode !== 'undefined' && LayoutMode.isActive && LayoutMode.isActive()) {
            container.appendChild(newEl);
            return;
        }
        const sectionIndex = allSections.findIndex(s => s.id === sectionId);
        let inserted = false;
        for (let i = sectionIndex + 1; i < allSections.length; i++) {
            const nextEl = container.querySelector(`[data-section-id="${allSections[i].id}"]`);
            if (nextEl) {
                container.insertBefore(newEl, nextEl);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            container.appendChild(newEl);
        }
    },

    syncOrder() {
        const sectionsContainer = byId('sectionsContainer');
        if (!sectionsContainer) return;

        const sections = (typeof SectionRegistry !== 'undefined' && SectionRegistry.getVisible)
            ? SectionRegistry.getVisible()
            : [];
        const savedThemeWrapper = byId('themeEffectSection');
        const sectionElements = [];

        sections.forEach((section, index) => {
            if (section.id === 'themeEffect' && savedThemeWrapper) {
                savedThemeWrapper.setAttribute('data-section-id', 'themeEffect');
                savedThemeWrapper.style.animationDelay = `${index * 0.05}s`;
                sectionElements.push(savedThemeWrapper);
                return;
            }
            const existingEl = sectionsContainer.querySelector(`[data-section-id="${section.id}"]`);
            if (existingEl) {
                existingEl.style.animationDelay = `${index * 0.05}s`;
                sectionElements.push(existingEl);
            }
        });

        sectionsContainer.innerHTML = '';
        sectionElements.forEach(el => sectionsContainer.appendChild(el));
    },

    removeSection(sectionId) {
        const sectionsContainer = byId('sectionsContainer');
        if (!sectionsContainer) return;
        const el = sectionsContainer.querySelector(`[data-section-id="${sectionId}"]`);
        if (el) el.remove();
    },

    isRendering() {
        return this._isRendering;
    },

    cancel() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    },

    firstPaintProgressive() {
        const sectionsContainer = byId('sectionsContainer');
        if (!sectionsContainer) {
            this.markAllDirty();
            this.flush();
            return;
        }

        // 清除骨架卡片（renderSkeleton 创建的占位 DOM 没有 data-section-id，
        // _doPartialRender 只会插入不会替换它们，导致 4 个多余空白卡残留）
        sectionsContainer.innerHTML = '';

        const allVisible = (typeof SectionRegistry !== 'undefined' && SectionRegistry.getVisible)
            ? SectionRegistry.getVisible()
            : [];

        const priorityIds = ['timeline', 'todo'];
        const deferredIds = allVisible
            .map(s => s.id)
            .filter(id => !priorityIds.includes(id));

        priorityIds.forEach(id => this.markDirty(id));
        this.flush();

        // 为第二帧才渲染的区块插入占位元素，预留布局高度，
        // 避免 timeline/todo 已渲染、goals 等区块迟到导致的布局抖动（CLS）。
        // 占位 div 带 data-section-id，第二帧 _doPartialRender 会用真实 section 替换它。
        deferredIds.forEach(id => {
            if (sectionsContainer.querySelector(`[data-section-id="${id}"]`)) return;
            const placeholder = document.createElement('div');
            placeholder.setAttribute('data-section-id', id);
            placeholder.className = 'section-placeholder';
            placeholder.setAttribute('aria-hidden', 'true');
            this._insertInOrder(sectionsContainer, placeholder, id, allVisible);
        });

        requestAnimationFrame(() => {
            deferredIds.forEach(id => this.markDirty(id));
            this.flush();
        });
    },

    startDateTransition(direction, renderCallback) {
        const sectionsContainer = byId('sectionsContainer');
        if (!sectionsContainer) {
            if (renderCallback) renderCallback();
            return;
        }

        // 中断进行中的过渡：清理类名 + 取消挂起的 timer 与 rAF，
        // 避免快速连续点击导致动画队列堆积，以及旧 rAF 回调串扰新过渡（UI Audit 4.5.1）
        if (this._dateTransitioning) {
            this._clearDateTransition();
        }

        this._dateTransitioning = true;
        const dir = direction >= 0 ? 'next' : 'prev';

        sectionsContainer.classList.remove('date-enter', 'next', 'prev');
        sectionsContainer.classList.add('date-transitioning', dir);

        this._dateTransitionTimer = setTimeout(() => {
            if (renderCallback) renderCallback();

            this.flush();

            this._dateTransitionRaf = requestAnimationFrame(() => {
                this._dateTransitionRaf = null;
                sectionsContainer.classList.remove('date-transitioning');
                sectionsContainer.classList.add('date-enter', dir);

                this._dateTransitionTimer = setTimeout(() => {
                    sectionsContainer.classList.remove('date-enter', 'next', 'prev');
                    this._dateTransitioning = false;
                    this._dateTransitionTimer = null;
                }, this._enterAnimationMs + 50);
            });
        }, this._exitAnimationMs);
    },

    _clearDateTransition() {
        const sectionsContainer = byId('sectionsContainer');
        if (sectionsContainer) {
            sectionsContainer.classList.remove('date-transitioning', 'date-enter', 'next', 'prev');
        }
        if (this._dateTransitionTimer) {
            clearTimeout(this._dateTransitionTimer);
            this._dateTransitionTimer = null;
        }
        if (this._dateTransitionRaf) {
            cancelAnimationFrame(this._dateTransitionRaf);
            this._dateTransitionRaf = null;
        }
        this._dateTransitioning = false;
    },

    isDateTransitioning() {
        return this._dateTransitioning;
    }
};
