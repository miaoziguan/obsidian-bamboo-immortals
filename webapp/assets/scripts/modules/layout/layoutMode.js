import { byId } from '../../utils/domRef.js';

/**
 * 桌面端多列布局模式（单按钮循环：纵向 → 横向 → 看板 → 纵向）
 * - 横向（horizontal-layout）：列数 = 每行 2 个板块（ceil(板块数/2)，最少 2 列）
 * - 看板（kanban-layout）：列数 = min(板块数, 4)，一行全排开
 * - 仅为会话内的临时视图：每次进入默认纵向，手动切换才生效，不做持久化。
 * - 沿用现有 SectionRegistry.order 顺序，只改变排版方向，不触碰板块顺序逻辑。
 * - 宽度自动适配：内容宽度不足时临时放宽（横向<600→800，看板<1200→1200），
 *   退出时恢复原宽度。
 * - 紧凑适配：切换后主动让 DisplayManager 按「列宽」重算 compact/ultra/rw 响应式类。
 */
export const LayoutMode = {
    _mode: 'none', // 'none' | 'horizontal' | 'kanban'
    _columns: 2,
    _savedWidth: null, // 进入时临时放宽内容宽度后记录的原宽度，退出时恢复
    _justEntered: false, // 进入流程保护期：避开刚进入时浏览器未回流导致守卫读到旧宽

    isActive() {
        return this._mode !== 'none';
    },

    /** 是否看板模式（供 BambooPoem 选择竖排短句等） */
    isKanban() {
        return this._mode === 'kanban';
    },

    /** 当前布局列数（供 DisplayManager 按列宽做紧凑适配）；非多列模式返回 1 */
    getColumns() {
        return this._mode === 'none' ? 1 : this._columns;
    },

    /** 公开退出入口：供「恢复纵向」按钮调用 */
    exit() {
        this._forceOff();
    },

    /**
     * 平台守卫：多列布局是桌面端体验。移动端（bridge 标记 __bambooIsMobile）
     * 或窗口跌破桌面断点（600px）一律禁止，避免窄屏下内联 grid 样式撑出多列挤压。
     */
    _isDesktop() {
        if (window.__bambooIsMobile) return false;
        return (window.innerWidth || document.documentElement.clientWidth) >= 600;
    },

    /** 单按钮循环：纵向 → 横向 → 看板 → 纵向 */
    toggle() {
        const el = byId('sectionsContainer');
        if (!el) return;

        // 平台守卫：非桌面不允许开启多列模式
        if (this._mode === 'none' && !this._isDesktop()) {
            if (typeof Toast !== 'undefined') {
                Toast.showToast('多列布局仅桌面端可用', 'info');
            }
            return;
        }

        // 循环推进
        if (this._mode === 'none') {
            this._enter('horizontal');
        } else if (this._mode === 'horizontal') {
            this._enter('kanban');
        } else {
            this._forceOff();
        }
    },

    /**
     * 进入指定模式
     * @param {'horizontal'|'kanban'} mode
     */
    _enter(mode) {
        const el = byId('sectionsContainer');
        if (!el) return;

        const container = byId('reviewContainer');
        const visibleCount = (typeof SectionRegistry !== 'undefined' && SectionRegistry.getVisible)
            ? SectionRegistry.getVisible().length
            : el.children.length;

        // 各模式的目标列数
        let columns, minWidth, autoBumpTo, label;
        if (mode === 'kanban') {
            // 看板：一行全排开，最多 4 列（避免过窄挤压）
            columns = Math.max(1, Math.min(visibleCount, 4));
            minWidth = 1200;
            autoBumpTo = 1200;
            label = '看板模式';
        } else {
            // 横向：每行 2 个板块，最少 2 列
            columns = Math.max(2, Math.ceil(visibleCount / 2));
            minWidth = 600;
            autoBumpTo = 800;
            label = '横向布局';
        }

        // 内容宽度自动适配：内容宽度（--content-max-width）不足时，
        // 自动临时放宽到该模式的最小舒适宽度再进入（不持久化，退出时恢复）。
        let widthAutoBumped = false;
        if (container) {
            let cw = 0;
            try { cw = container.getBoundingClientRect().width; } catch (e) { cw = 0; }
            let widthSetting = (typeof DisplayManager !== 'undefined' && DisplayManager._currentWidth)
                ? DisplayManager._currentWidth : 0;
            if (cw < minWidth && widthSetting < minWidth) {
                this._savedWidth = widthSetting > 0 ? widthSetting : null;
                if (typeof DisplayManager !== 'undefined' && DisplayManager._applyWidth) {
                    DisplayManager._applyWidth(autoBumpTo, true);
                    widthAutoBumped = true;
                }
            }
        }

        this._mode = mode;
        this._columns = columns;
        // 进入流程保护：避开刚进入时浏览器未回流、_applyResponsiveClasses 读到旧宽
        // 误触发守卫退出。下帧后清标志，守卫恢复生效。
        this._justEntered = true;
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => { this._justEntered = false; });
        } else {
            setTimeout(() => { this._justEntered = false; }, 50);
        }
        // 移除旧模式 class，设置新模式 class
        el.classList.remove('horizontal-layout', 'kanban-layout');
        el.classList.add(mode === 'kanban' ? 'kanban-layout' : 'horizontal-layout');
        this._bindResizeGuard();

        // 分列：横向=交替入列；看板=一行全排开
        this._columns = columns;
        if (mode === 'kanban') {
            this._reflowKanban(el);
        } else {
            this._reflowHorizontal(el);
        }

        // 主动重算 compact/ultra/rw 响应式类（按列宽判定；_justEntered 期间守卫跳过）
        if (typeof DisplayManager !== 'undefined' && DisplayManager._applyResponsiveClasses) {
            try { DisplayManager._applyResponsiveClasses(); } catch (e) { /* 不阻塞布局切换 */ }
        }
        this._updateButtonText();
        // 仅一个 toast
        if (typeof Toast !== 'undefined') {
            Toast.showToast(widthAutoBumped ? `已临时放宽宽度进入${label}` : `已切换为${label}`, 'info');
        }
    },

    /** 退出多列模式（供「恢复纵向」按钮 / 边界守卫 / 离开视图调用） */
    _forceOff() {
        if (this._mode === 'none') return;
        this._mode = 'none';
        const el = byId('sectionsContainer');
        if (el) {
            el.classList.remove('horizontal-layout', 'kanban-layout');
            el.style.display = '';
            // 拆掉列 wrapper：把板块移回容器直接子元素（恢复纵向流式）
            this._unreflow(el);
        }
        // 退出横向/看板：无条件恢复默认内容宽度 400px（多列模式是临时放大，
        // 退出回到窄布局默认态），不保留进入前宽度
        if (typeof DisplayManager !== 'undefined' && DisplayManager._applyWidth) {
            try { DisplayManager._applyWidth(400, true); } catch (e) { /* 不阻塞 */ }
        }
        this._savedWidth = null;
        if (typeof DisplayManager !== 'undefined' && DisplayManager._applyResponsiveClasses) {
            try { DisplayManager._applyResponsiveClasses(); } catch (e) { /* 不阻塞 */ }
        }
        this._updateButtonText();
        if (typeof Toast !== 'undefined') {
            Toast.showToast('已恢复纵向布局', 'info');
        }
    },

    /**
     * 瀑布流分列：把容器子元素（板块）均衡交替分入 N 个 .layout-col wrapper。
     * 每列 flex column 独立高度，列间互不牵制；渲染系统重建 DOM 后可再次调用。
     * @param {HTMLElement} container #sectionsContainer
     */
    /** 渲染系统重建 DOM 后重新分列（按当前模式分发） */
    reflow() {
        const el = byId('sectionsContainer');
        if (!el) return;
        if (this._mode === 'kanban') this._reflowKanban(el);
        else if (this._mode === 'horizontal') this._reflowHorizontal(el);
    },

    /** 横向分列：交替均衡入列（每行 2 个板块的瀑布流） */
    _reflowHorizontal(container) {
        if (!container) return;
        this._unreflow(container);
        const cols = this._columns > 0 ? this._columns : 2;
        const items = Array.from(container.children);
        const wrappers = [];
        for (let i = 0; i < cols; i++) {
            const col = document.createElement('div');
            col.className = 'layout-col';
            container.appendChild(col);
            wrappers.push(col);
        }
        items.forEach((item, idx) => {
            wrappers[idx % cols].appendChild(item);
        });
        const colInfo = wrappers.map((w, i) => `col${i + 1}=[${Array.from(w.children).map(c => c.getAttribute('data-section-id') || c.className || '?').join(',')}]`).join(' | ');
        console.log(`[LayoutMode] reflowHorizontal cols=${cols} ${colInfo}`);
    },

    /** 看板分列：一行全排开，每个板块独占一列（列数 = min(板块数, 4)） */
    _reflowKanban(container) {
        if (!container) return;
        this._unreflow(container);
        const cols = this._columns > 0 ? this._columns : 1;
        const items = Array.from(container.children);
        const wrappers = [];
        for (let i = 0; i < cols; i++) {
            const col = document.createElement('div');
            col.className = 'layout-col kanban-col';
            container.appendChild(col);
            wrappers.push(col);
        }
        items.forEach((item, idx) => {
            // 每个板块一列；板块数超过列数（>4）时，多余板块按顺序追加到各列尾（不丢板块）
            const target = idx < cols ? wrappers[idx] : wrappers[idx % cols];
            target.appendChild(item);
        });
        const colInfo = wrappers.map((w, i) => `col${i + 1}=[${Array.from(w.children).map(c => c.getAttribute('data-section-id') || c.className || '?').join(',')}]`).join(' | ');
        console.log(`[LayoutMode] reflowKanban cols=${cols} ${colInfo}`);
    },

    /** 拆掉列 wrapper：把板块移回容器直接子元素（恢复纵向流式） */
    _unreflow(container) {
        if (!container) return;
        const wrappers = Array.from(container.querySelectorAll(':scope > .layout-col'));
        wrappers.forEach((w) => {
            const items = Array.from(w.children);
            items.forEach((it) => container.appendChild(it));
            w.remove();
        });
    },

    /** 同步循环按钮文案：纵向→「横向布局」、横向→「看板模式」、看板→「恢复纵向」 */
    _updateButtonText() {
        const textEl = byId('fabLayoutToggleText');
        if (!textEl) return;
        if (this._mode === 'horizontal') textEl.textContent = '看板模式';
        else if (this._mode === 'kanban') textEl.textContent = '恢复纵向';
        else textEl.textContent = '横向布局';
    },

    /**
     * resize 兜底：多列模式激活期间监听窗口宽度，跌破桌面断点（600px）
     * 自动退出，防止桌面开多列后缩窄窗口/侧栏导致内联 grid 撑多列挤压。
     */
    _bindResizeGuard() {
        if (this._resizeGuardBound) return;
        this._resizeGuardBound = true;
        window.addEventListener('resize', () => {
            if (this._mode === 'none') return;
            if (!this._isDesktop()) {
                this._forceOff();
            }
        });
    },

    /**
     * 内容宽度守卫：多列模式激活时，若内容宽度设置跌破桌面断点（600px）
     * 则自动退出。由 DisplayManager._applyResponsiveClasses 在内容宽度变化时调用。
     * @param {number} settingWidth 内容宽度设置（非容器实际宽，避免 iframe 截断误判）
     */
    checkAndExitIfNarrow(settingWidth) {
        if (this._mode === 'none') return;
        // 进入流程保护期：避免进入瞬间浏览器未回流误判触发退出
        if (this._justEntered) return;
        if (settingWidth > 0 && settingWidth < 600) {
            this._forceOff();
        }
    }
};

window.LayoutMode = LayoutMode;
