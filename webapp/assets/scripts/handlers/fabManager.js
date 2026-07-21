import { byId, $ } from '../utils/domRef.js';
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
        this.setupDrag();
        this.setupOutsideClick();
        this.setupResponsive();
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
            const w = window.innerWidth;
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
            if (this.isOpen) this.close();
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
            if (hasMoved) this.savePosition();
        };

        this.mainBtn.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            onStart(e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            onMove(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', onEnd);

        this.mainBtn.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            e.preventDefault();
            const t = e.touches[0];
            onStart(t.clientX, t.clientY);
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const t = e.touches[0];
            onMove(t.clientX, t.clientY);
        }, { passive: false });

        document.addEventListener('touchend', onEnd);

        this.mainBtn.addEventListener('click', () => {
            if (hasMoved) { hasMoved = false; return; }
            this.toggle();
        });

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
        this.actions.classList.add('open');
        this.container.classList.add('fab-open');
        
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
    }
};

window.FABManager = FABManager;
