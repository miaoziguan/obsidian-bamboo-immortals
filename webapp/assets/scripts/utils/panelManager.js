import { modalMount } from './domRef.js';
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
     */
    _initDraggable(panel) {
        const header = panel.querySelector('.fab-panel-header');
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseMove = (e) => {
            if (!isDragging) return;
            panel.style.left = (initialLeft + (e.clientX - startX)) + 'px';
            panel.style.top = (initialTop + (e.clientY - startY)) + 'px';
        };
        const onMouseUp = () => {
            isDragging = false;
            header.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.fab-panel-close')) return;

            isDragging = true;
            header.style.cursor = 'grabbing';

            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            panel.style.transform = 'none';
            panel.style.left = initialLeft + 'px';
            panel.style.top = initialTop + 'px';
            panel.style.margin = '0';

            startX = e.clientX;
            startY = e.clientY;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
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
