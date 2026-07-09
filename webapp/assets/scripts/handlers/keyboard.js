import { byId, $ } from '../utils/domRef.js';
export const Keyboard = {
    _initialized: false,
    
    init() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        
        this.setupKeyboardShortcuts();
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const modal = $('.modal-content');
            if (modal) {
                if (e.key === 'Tab' || e.key === 'Escape') {
                    Handlers.setupModalFocusTrap(e);
                    return;
                }
            }

            // Ctrl/Cmd 组合键
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        store.scheduleAutoSave();
                        Toast.showToast('已自动保存', 'success');
                        return;
                }
            }

            switch (e.key.toLowerCase()) {
                case 'arrowleft':
                    store.navigateDate(-1);
                    renderAll();
                    break;
                case 'arrowright':
                    store.navigateDate(1);
                    renderAll();
                    break;
                case 'escape':
                    if (FABManager.isOpen) {
                        FABManager.close();
                    }
                    break;
                case '?':
                    e.preventDefault();
                    this.showKeyboardHelp();
                    break;
                case 'h':
                    if (!e.ctrlKey && !e.metaKey) {
                        this.showKeyboardHelp();
                    }
                    break;
                case 't':
                    Handlers.goToToday();
                    break;

                // 目标地图快捷键（无组合键，非输入框中触发）
                case 'a':
                    if (!e.ctrlKey && !e.metaKey) {
                        // 如果目标地图板块存在，则添加新目标
                        if (byId('goalList')) {
                            e.preventDefault();
                            if (typeof GoalsEditor !== 'undefined' && GoalsEditor.startAddInline) {
                                GoalsEditor.startAddInline();
                            }
                        }
                    }
                    break;
                case 's':
                    if (!e.ctrlKey && !e.metaKey) {
                        if (byId('goalList')) {
                            e.preventDefault();
                            if (typeof StatsModal !== 'undefined' && StatsModal.open) {
                                StatsModal.open();
                            }
                        }
                    }
                    break;
            }
        });
    },

    showKeyboardHelp() {
        const shortcuts = [
            { key: '← / →', desc: '切换日期（前一天/后一天）' },
            { key: 'T', desc: '跳转到今天' },
            { key: 'Ctrl+S', desc: '保存' },
            { key: 'Esc', desc: '关闭弹窗或菜单' },
            { key: '? / H', desc: '显示快捷键帮助' },
            { key: 'Tab', desc: '切换焦点（在弹窗中）' }
        ];

        const content = `
            <div class="help-section">
                <div class="help-title" style="font-size: 18px; font-weight: 700; color: var(--bamboo-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                    ${typeof LucideUtils !== 'undefined' ? LucideUtils.createIcon('keyboard', { size: 24 }) : ''} 键盘快捷键
                </div>
                <div style="display: grid; gap: 12px;">
                    ${shortcuts.map(s => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: linear-gradient(135deg, hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.08), hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.03)); border-radius: 12px;">
                            <div style="font-weight: 600; color: var(--text-primary);">${s.desc}</div>
                            <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 6px 12px; background: var(--bamboo-primary); color: white; border-radius: 8px; font-weight: 600;">${s.key}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, rgba(135, 206, 235, 0.1), hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.05)); border-radius: 12px; border: 1px dashed hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.2);">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">提示</div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                        可以随时按 <strong style="color: var(--bamboo-primary);">?</strong> 或 <strong style="color: var(--bamboo-primary);">H</strong> 显示此帮助面板
                    </div>
                </div>
            </div>
        `;

        Handlers.openModal(content, '快捷键指南');
    }
};

window.Keyboard = Keyboard;