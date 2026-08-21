import { byId } from '../../utils/domRef.js';

/**
 * 桌面端横向布局模式
 * - 在 #sectionsContainer（首页板块容器）上切换 `horizontal-layout` class，
 *   将首页板块从纵向流式改为多列网格，列数按可见板块数均分（每行 2 个）。
 * - 仅为会话内的临时视图：每次进入默认纵向，手动切到横向才生效，不做持久化。
 * - 沿用现有 SectionRegistry.order 顺序，只改变排版方向，不触碰板块顺序逻辑。
 * - 紧凑适配：切换后主动让 DisplayManager 按「列宽」重算 compact/ultra/rw 响应式类，
 *   保证时间线票/票根等在窄列下进入堆叠紧凑形态。
 */
export const LayoutMode = {
    _active: false,
    _columns: 2,

    isActive() {
        return this._active;
    },

    /** 当前横向模式列数（供 DisplayManager 按列宽做紧凑适配）；非横向模式返回 1 */
    getColumns() {
        return this._active ? this._columns : 1;
    },

    /**
     * 平台守卫：横向布局是桌面端体验（多列均分、鼠标操作）。
     * 移动端（bridge 标记 __bambooIsMobile）或窗口跌破桌面断点（600px，
     * 与 CSS 的 .desktop-only / @media 断点一致，亦与 display-compact ≤600
     * 的窄栏语义对齐）一律禁止，避免窄屏下内联 grid 样式撑出多列导致挤压。
     */
    _isDesktop() {
        if (window.__bambooIsMobile) return false;
        return (window.innerWidth || document.documentElement.clientWidth) >= 600;
    },

    toggle() {
        // 平台守卫：移动端/窄窗口/窄内容宽度不允许开启横向布局。
        // 容器实际宽度受显示设置的内容宽度（--content-max-width）约束——
        // 窗口够宽但内容宽度调小（如 400px）时，容器实际很窄，也应禁止。
        if (!this._active && !this._isDesktop()) {
            if (typeof Toast !== 'undefined') {
                Toast.showToast('横向布局仅桌面端可用', 'info');
            }
            return;
        }
        const container = byId('reviewContainer');
        if (!this._active && container) {
            let cw = 0;
            try { cw = container.getBoundingClientRect().width; } catch (e) { cw = 0; }
            if (cw > 0 && cw < 600) {
                if (typeof Toast !== 'undefined') {
                    Toast.showToast('内容宽度过窄，无法开启横向布局', 'info');
                }
                return;
            }
        }
        const el = byId('sectionsContainer');
        if (!el) return;
        this._active = !this._active;
        el.classList.toggle('horizontal-layout', this._active);
        // 激活时监听窗口宽度：跌破桌面断点自动退出，避免内联 grid 在窄屏残留
        this._bindResizeGuard();

        if (this._active) {
            // 按可见板块数均分列数：每行 2 个板块 → 列数 = ceil(板块数 / 2)。
            // 4 板块→2 列、6→3 列、8→4 列；用 1fr 均分天然规避容器宽度问题——
            // 无论容器多宽都铺满、不挤压不留空。
            const visibleCount = (typeof SectionRegistry !== 'undefined' && SectionRegistry.getVisible)
                ? SectionRegistry.getVisible().length
                : el.children.length;
            const columns = Math.max(1, Math.ceil(visibleCount / 2));
            this._columns = columns;
            el.style.display = 'grid';
            el.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            el.style.alignItems = 'start';
            el.style.gridAutoFlow = 'row';
        } else {
            el.style.display = '';
            el.style.gridTemplateColumns = '';
            el.style.alignItems = '';
            el.style.gridAutoFlow = '';
        }

        // .sections-container 变 grid 不改变 .container 自身尺寸，DisplayManager 的
        // ResizeObserver（观察容器）不会触发；主动重算 compact/ultra/rw 响应式类，
        // 让它们按「列宽」判定（列宽 = 容器宽/列数，远窄于容器总宽）。
        if (typeof DisplayManager !== 'undefined' && DisplayManager._applyResponsiveClasses) {
            try { DisplayManager._applyResponsiveClasses(); } catch (e) { /* 不阻塞布局切换 */ }
        }
        if (typeof Toast !== 'undefined') {
            Toast.showToast(this._active ? '已切换为横向布局' : '已恢复纵向布局', 'info');
        }
    },

    /**
     * resize 兜底：横向模式激活期间监听窗口宽度，跌破桌面断点（1024px）
     * 自动退出，防止桌面开横向后缩窄窗口/侧栏导致内联 grid 撑多列挤压。
     * 退出后移除监听；重复调用不叠加。
     */
    _bindResizeGuard() {
        if (this._resizeGuardBound) return;
        this._resizeGuardBound = true;
        window.addEventListener('resize', () => {
            if (!this._active) return;
            if (!this._isDesktop()) {
                this._forceOff();
            }
        });
    },

    /**
     * 内容宽度守卫：横向模式激活时，若容器实际宽度跌破桌面断点（600px，
     * 与 CSS/.desktop-only/display-compact 语义一致）则自动退出。
     * 由 DisplayManager._applyResponsiveClasses 在内容宽度变化时调用
     * （内容宽度由 --content-max-width 约束，窗口宽度不变也能触发）。
     * @param {number} containerWidth 容器实际渲染宽度
     */
    checkAndExitIfNarrow(containerWidth) {
        if (!this._active) return;
        if (containerWidth > 0 && containerWidth < 600) {
            this._forceOff();
        }
    },

    _forceOff() {
        if (!this._active) return;
        this._active = false;
        const el = byId('sectionsContainer');
        if (el) {
            el.classList.remove('horizontal-layout');
            el.style.display = '';
            el.style.gridTemplateColumns = '';
            el.style.alignItems = '';
            el.style.gridAutoFlow = '';
        }
        if (typeof DisplayManager !== 'undefined' && DisplayManager._applyResponsiveClasses) {
            try { DisplayManager._applyResponsiveClasses(); } catch (e) { /* 不阻塞 */ }
        }
        if (typeof Toast !== 'undefined') {
            Toast.showToast('已退出横向布局（窗口过窄）', 'info');
        }
    }
};

window.LayoutMode = LayoutMode;
