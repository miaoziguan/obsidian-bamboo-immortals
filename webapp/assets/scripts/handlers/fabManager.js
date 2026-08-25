import { byId, $, getDomRoot } from '../utils/domRef.js';
export const FABManager = {
    container: null,
    mainBtn: null,
    actions: null,
    isOpen: false,
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        this.container = $('.fab-container');
        this.mainBtn = byId('fabMain');
        this.actions = byId('fabActions');
        if (!this.container || !this.mainBtn || !this.actions) return;

        this.container.style.display = 'flex';
        this.container.style.opacity = '1';
        this.container.style.visibility = 'visible';

        this.loadSavedPosition();
        // 点击开合菜单是核心功能，任何平台都必须绑定（拆自 setupDrag，
        // 避免移动端禁用拖拽时连 click 也一起丢失导致菜单点不开）。
        this.setupClickToggle();
        // 全平台启用拖拽：setupDrag 的 touch 系列监听（touchstart/touchmove/
        // touchend）本就是为移动端设计的——仅拖拽位移后才 preventDefault
        // 抑制滚动，轻点不拦截，拖拽结束的合成 click 由 _dragEndAt 时间戳抑制。
        this.setupDrag();
        this.setupOutsideClick();
        this.setupResponsive();
        this.setupPrivacyShortcut();
        // 隐私按钮点击已改用 HTML 内联 onclick 兜底（绕过 Shadow DOM retarget
        // 与所有事件委托不确定性），这里只同步初始态。
        this._syncPrivacyButton();

        // 暴露到 window，供内联 onclick 同步按钮态与关闭菜单
        window.FABManager = this;
    },

    /** 隐私按钮点击 → 翻转模糊态。
     *  监听挂在 getDomRoot()（shadow 模式下即 shadowRoot，运行时取值确保拿到正确根），
     *  并用 composedPath() 取真实事件路径（含 shadow 内节点），兼容 Obsidian 下
     *  e.target 被 retarget 成 host 导致 closest 找不到按钮的情况——这正是此前
     *  「点了没反应、菜单也不关」的根因：this.actions 在 retarget 下 closest 返回 null
     *  提前 return，连 close 都没执行。
     *  作为 fab-privacy 的唯一处理方，避免与 ActionDispatcher 双触发。 */
    setupPrivacyAction() {
        const root = getDomRoot();
        if (!root) return;
        root.addEventListener('click', (e) => {
            const path = (typeof e.composedPath === 'function') ? e.composedPath() : [e.target];
            let btn = null;
            for (const node of path) {
                if (node && node.nodeType === 1 && typeof node.closest === 'function') {
                    const m = node.closest('[data-action="fab-privacy"]');
                    if (m) { btn = m; break; }
                }
            }
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            const PM = window.PrivacyMode;
            if (PM) {
                const on = PM.toggle();
                this.updatePrivacyButton(on);
            }
            this.close();
        });
    },

    /** 全局快捷键 Cmd/Ctrl + . 切换隐私模糊（输入框内不触发，避免干扰输入） */
    setupPrivacyShortcut() {
        const handler = (e) => {
            if (!(e.ctrlKey || e.metaKey) || e.key !== '.') return;
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            e.preventDefault();
            if (typeof PrivacyMode !== 'undefined') {
                const on = PrivacyMode.toggle();
                this.updatePrivacyButton(on);
            }
        };
        this._privacyKeyHandler = handler;
        getDomRoot().addEventListener('keydown', handler);
    },

    /** 同步隐私按钮视觉态（aria-pressed + 图标类）。on=true 表示隐私开启（模糊中） */
    updatePrivacyButton(on) {
        const btn = this.actions && this.actions.querySelector('[data-action="fab-privacy"]');
        if (!btn) return;
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.classList.toggle('active', !!on);
        const label = on ? '关闭隐私模糊' : '隐私模糊（防偷窥）';
        btn.setAttribute('aria-label', label);
    },

    /** 初始化时同步隐私按钮态（PrivacyMode.init 已 apply，这里只管图标） */
    _syncPrivacyButton() {
        if (typeof PrivacyMode === 'undefined') return;
        this.updatePrivacyButton(PrivacyMode.isOn());
    },

    loadSavedPosition() {
        const saved = StorageAdapter.get(StorageKeys.FAB_POSITION);
        if (saved) {
            const { right, bottom } = JSON.parse(saved);
            this.container.style.right = right + 'px';
            this.container.style.bottom = bottom + 'px';
        }
    },

    savePosition() {
        const r = parseInt(this.container.style.right) || 16;
        const b = parseInt(this.container.style.bottom) || 20;
        StorageAdapter.set(StorageKeys.FAB_POSITION, JSON.stringify({ right: r, bottom: b }));
    },

    getViewport() {
        const vv = window.visualViewport;
        if (vv) {
            return { width: vv.width, height: vv.height };
        }
        return { width: window.innerWidth, height: window.innerHeight };
    },

    setupResponsive() {
        const update = () => {
            // 统一用 visualViewport 口径（与 positionPanel 的 getViewport 一致），
            // 避免软键盘弹出时 innerWidth 与 visualViewport 不一致导致定位偏差。
            const w = this.getViewport().width;
            let bs = 52, bt = 20, rt = 16;
            if (w >= 1024) { bs = 56; bt = 24; rt = 20; }
            if (!StorageAdapter.get(StorageKeys.FAB_POSITION)) {
                this.container.style.bottom = bt + 'px';
                this.container.style.right = rt + 'px';
            }
            this.mainBtn.style.width = bs + 'px';
            this.mainBtn.style.height = bs + 'px';
            if (this.isOpen) this.positionPanel();
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);
    },

    setupDrag() {
        let isDragging = false;
        let startX = 0, startY = 0;
        let startRight = 0, startBottom = 0;
        let hasMoved = false;

        const onStart = (x, y) => {
            isDragging = true;
            hasMoved = false;
            startX = x;
            startY = y;
            startRight = parseInt(this.container.style.right) || 16;
            startBottom = parseInt(this.container.style.bottom) || 20;
            // 拖拽开始时不再直接 close；关闭逻辑统一在 click 中根据 isOpen 判断，
            // 避免 mousedown 关闭后 click 又触发 open() 导致菜单关不上。
            this.container.classList.add('dragging');
        };

        const onMove = (x, y) => {
            if (!isDragging) return;
            const dx = startX - x;
            const dy = startY - y;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
            const sz = parseInt(this.mainBtn.style.width) || 56;
            const vp = this.getViewport();
            this.container.style.right = Math.max(0, Math.min(vp.width - sz, startRight + dx)) + 'px';
            this.container.style.bottom = Math.max(0, Math.min(vp.height - sz, startBottom + dy)) + 'px';
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            this.container.classList.remove('dragging');
            if (hasMoved) {
                this.savePosition();
                // 拖拽位移后浏览器仍会派发合成 click，用时间戳让 setupClickToggle
                // 在短时间内忽略该 click，避免拖拽结束后菜单被误开/误关。
                this._dragEndAt = Date.now();
            }
        };

        this.mainBtn.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            // 注意：这里不能 preventDefault —— 桌面 mousedown 阻止默认不会吞 click，
            // 但移动端在 touchstart 中 preventDefault 会抑制合成 click，导致菜单点不开。
            // 故点击类操作保留默认行为，拖拽时才在 move 阶段抑制。
            onStart(e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            if (hasMoved) e.preventDefault();
            onMove(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', onEnd);

        this.mainBtn.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            // 关键：不能在此 preventDefault，否则移动端浏览器不再派发合成 click，
            // open()/close() 全部挂在 click 上，悬浮菜单将永远点不开。
            const t = e.touches[0];
            onStart(t.clientX, t.clientY);
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            // 仅在确认发生拖拽（hasMoved）时抑制滚动，保留轻点滚动的原生行为
            if (hasMoved) e.preventDefault();
            const t = e.touches[0];
            onMove(t.clientX, t.clientY);
        }, { passive: false });

        document.addEventListener('touchend', onEnd);

    },

    /** 点击主按钮开合菜单（核心功能，任何平台都必须绑定） */
    setupClickToggle() {
        const onClick = () => {
            // 拖拽进行中（dragging class）或刚结束 350ms 内：忽略合成 click，
            // 避免拖拽后菜单被误开/误关。
            if (this.container && this.container.classList.contains('dragging')) return;
            if (this._dragEndAt && Date.now() - this._dragEndAt < 350) return;
            if (this.isOpen) this.close(); else this.open();
        };
        this._clickHandler = onClick;
        this.mainBtn.addEventListener('click', onClick);
    },

    getMenuButtons() {
        return Array.from(this.actions.querySelectorAll('.fab-action-btn'));
    },

    // Shadow DOM 下事件 e.target 会被 retarget 成 host，故用 composedPath()
    // 取真实路径（含 shadow 内节点）判断点击是否落在容器内，兼容 kill-switch 回退。
    _eventInside(e, node) {
        if (!node) return false;
        const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
        return path.length ? path.includes(node) : node.contains(e.target);
    },

    setupOutsideClick() {
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this._eventInside(e, this.container)) this.close();
        });
    },

    /** ArrowKey 循环 + Tab/Shift+Tab 陷阱 + Escape 关闭 */
    _handleKeydown(e) {
        if (!this.isOpen) return;
        const buttons = this.getMenuButtons();
        if (buttons.length === 0) return;
        const idx = buttons.indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                if (idx < 0 || idx >= buttons.length - 1) {
                    buttons[0].focus();
                } else {
                    buttons[idx + 1].focus();
                }
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                if (idx <= 0) {
                    buttons[buttons.length - 1].focus();
                } else {
                    buttons[idx - 1].focus();
                }
                break;
            case 'Home':
                e.preventDefault();
                buttons[0].focus();
                break;
            case 'End':
                e.preventDefault();
                buttons[buttons.length - 1].focus();
                break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    if (idx <= 0) {
                        buttons[buttons.length - 1].focus();
                    } else {
                        buttons[idx - 1].focus();
                    }
                } else {
                    if (idx < 0 || idx >= buttons.length - 1) {
                        buttons[0].focus();
                    } else {
                        buttons[idx + 1].focus();
                    }
                }
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                this.close();
                break;
        }
    },

    toggle() { this.isOpen ? this.close() : this.open(); },

    positionPanel() {
        if (!this.mainBtn || !this.mainBtn.isConnected) return;
        let btnRect;
        try {
            btnRect = this.mainBtn.getBoundingClientRect();
        } catch (e) {
            return;
        }
        if (!btnRect || (btnRect.width === 0 && btnRect.height === 0)) {
            return;
        }
        const vp = this.getViewport();
        const spaceAbove = btnRect.top;
        const spaceBelow = vp.height - btnRect.bottom;
        const spaceToLeft = btnRect.left;
        const gap = 8;

        const panelW = this.actions.scrollWidth || 220;
        const panelH = this.actions.scrollHeight || 200;

        this.container.classList.remove('fab-below', 'fab-align-left');

        if (spaceAbove < panelH + gap && spaceBelow > spaceAbove) {
            this.container.classList.add('fab-below');
            this.actions.style.maxHeight = Math.min(vp.height * 0.8, spaceBelow - gap) + 'px';
        } else {
            this.actions.style.maxHeight = Math.min(vp.height * 0.8, spaceAbove - gap) + 'px';
        }

        if (spaceToLeft < panelW) {
            this.container.classList.add('fab-align-left');
        }

        const maxW = Math.min(panelW, vp.width - 12);
        this.actions.style.width = maxW + 'px';
    },

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.positionPanel();
        this.mainBtn.classList.add('open');
        this.mainBtn.setAttribute('aria-expanded', 'true');
        this.mainBtn.setAttribute('aria-label', '收起快捷菜单');
        this.actions.classList.add('open');
        this.container.classList.add('fab-open');

        // 绑定键盘导航
        this._boundKeydown = this._handleKeydown.bind(this);
        getDomRoot().addEventListener('keydown', this._boundKeydown);
        
        requestAnimationFrame(() => {
            const buttons = this.getMenuButtons();
            if (buttons.length > 0) {
                buttons[0].focus();
            }
        });
    },

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.mainBtn.classList.remove('open');
        this.mainBtn.setAttribute('aria-expanded', 'false');
        this.actions.classList.remove('open');
        this.container.classList.remove('fab-open');
        this.container.classList.remove('fab-below', 'fab-align-left');
        this.actions.style.maxHeight = '';
        this.actions.style.width = '';

        // 解绑键盘导航，归还焦点到主按钮
        if (this._boundKeydown) {
            getDomRoot().removeEventListener('keydown', this._boundKeydown);
            this._boundKeydown = null;
        }
        this.mainBtn.focus();
    }
};

window.FABManager = FABManager;
