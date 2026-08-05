import { modalMount, eventInTargets } from './domRef.js';
/**
 * PanelManager - 统一管理悬浮菜单触发的面板
 */
export const PanelManager = {
    activePanel: null,
    activeId: null,

    /**
     * 打开一个面板
     * @param {string} id 面板唯一标识
     * @param {string} title 面板标题
     * @param {string} content 面板 HTML 内容
     * @param {Object} options 配置项 (width, onOpen, onClose, tabs)
     */
    open(id, title, content, options = {}) {
        if (this.activeId === id) {
            this.close();
            return;
        }

        this.close();

        const panel = document.createElement('div');
        panel.className = 'fab-panel';
        panel.id = `panel-${id}`;

        let tabsHtml = '';
        if (options.tabs && options.tabs.length > 0) {
            tabsHtml = `
                <div class="fab-panel-tabs">
                    ${options.tabs.map((tab, index) => `
                        <div class="fab-panel-tab ${index === 0 ? 'active' : ''}" data-tab="${tab.id}">
                            ${tab.label}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="fab-panel-header">
                <div class="fab-panel-title">
                    ${title}
                </div>
                <button class="fab-panel-close" aria-label="关闭">
                    ${LucideUtils.createIcon('x', { size: 14 })}
                </button>
            </div>
            ${tabsHtml}
            <div class="fab-panel-body">
                ${content}
            </div>
        `;

        modalMount().appendChild(panel);
        this.activePanel = panel;
        this.activeId = id;
        this._activeOptions = options;

        // 绑定标签切换
        if (options.tabs) {
            const tabs = panel.querySelectorAll('.fab-panel-tab');
            tabs.forEach(tab => {
                tab.onclick = () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const tabId = tab.getAttribute('data-tab');
                    const contents = panel.querySelectorAll('.fab-tab-content');
                    contents.forEach(c => {
                        c.classList.toggle('active', c.id === `tab-content-${tabId}`);
                    });
                };
            });
        }

        // 绑定关闭事件
        panel.querySelector('.fab-panel-close').onclick = () => this.close();
        
        // 阻止冒泡（除非是 ActionDispatcher 需要处理的动作）
        panel.onclick = (e) => {
            if (e.target.closest('[data-action]')) return;
            e.stopPropagation();
        };

        // 外部点击关闭
        this._outsideClickHandler = (e) => {
            if (this.activePanel && !eventInTargets(e, this.activePanel)) {
                this.close();
            }
        };
        setTimeout(() => document.addEventListener('click', this._outsideClickHandler), 10);

        // ESC 关闭
        this._escHandler = (e) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', this._escHandler);

        // 激活
        requestAnimationFrame(() => {
            panel.classList.add('active');
            this._initDraggable(panel);
            if (options.onOpen) options.onOpen(panel);
        });
    },

    /**
     * 初始化拖拽功能
     * 使用 Pointer Events 统一支持鼠标 / 触摸 / 触控笔，并限制边界防止面板被拖出屏幕无法找回。
     */
    _initDraggable(panel) {
        const header = panel.querySelector('.fab-panel-header');
        if (!header || typeof window.PointerEvent === 'undefined') return;

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        // 允许拖动的最小可见区域（面板不会完全拖出屏幕，至少保留这部分便于找回）
        const MIN_VISIBLE = 64;

        const clampToViewport = (left, top, rect) => {
            const maxLeft = window.innerWidth - MIN_VISIBLE;
            const maxTop = window.innerHeight - MIN_VISIBLE;
            return {
                left: Math.min(Math.max(left, MIN_VISIBLE - rect.width), maxLeft),
                top: Math.min(Math.max(top, MIN_VISIBLE), maxTop),
            };
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const left = initialLeft + (e.clientX - startX);
            const top = initialTop + (e.clientY - startY);
            const clamped = clampToViewport(left, top, panel.getBoundingClientRect());
            panel.style.left = clamped.left + 'px';
            panel.style.top = clamped.top + 'px';
        };
        const onPointerUp = () => {
            if (!isDragging) return;
            isDragging = false;
            header.style.cursor = 'grab';
            header.style.touchAction = 'auto';
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
        };

        header.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.fab-panel-close')) return;

            isDragging = true;
            header.style.cursor = 'grabbing';
            // 拖拽期间禁止浏览器原生手势（触摸滚动/缩放），避免与面板拖动冲突
            header.style.touchAction = 'none';

            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            panel.style.transform = 'none';
            panel.style.left = initialLeft + 'px';
            panel.style.top = initialTop + 'px';
            panel.style.margin = '0';

            startX = e.clientX;
            startY = e.clientY;

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointercancel', onPointerUp);
        });
    },

    close() {
        if (!this.activePanel) return;

        const panel = this.activePanel;
        panel.classList.remove('active');

        document.removeEventListener('click', this._outsideClickHandler);
        document.removeEventListener('keydown', this._escHandler);

        if (this._activeOptions && typeof this._activeOptions.onClose === 'function') {
            try { this._activeOptions.onClose(panel); } catch (e) { console.warn('onClose error:', e); }
        }
        this._activeOptions = null;

        setTimeout(() => {
            if (panel.parentNode) panel.parentNode.removeChild(panel);
        }, 300);

        this.activePanel = null;
        this.activeId = null;
    }
};

window.PanelManager = PanelManager;
