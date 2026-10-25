import { byId } from '../../utils/domRef.js';

/**
 * 桌面端多列布局模式（单按钮循环：纵向 ⇄ 看板；横向模式已移除）
 * - 看板（kanban-layout）：列数 = 板块数（每板块独占一列），一行全排开
 * - 跨重启持久化：进入多列模式即写入 settings.layoutMode，重启后 init() 自动恢复（并移回主工作区宽度）。
 * - 沿用现有 SectionRegistry.order 顺序，只改变排版方向，不触碰板块顺序逻辑。
 * - 宽度自动适配：进入看板固定放宽到 1240px，退出时恢复原宽度。
 * - 紧凑适配：切换后主动让 DisplayManager 按「列宽」重算 compact/ultra/rw 响应式类。
 * - 兼容：历史值 'horizontal'（老设置 / 旧视图状态）一律按看板处理，见 _enter / _loadPersistedMode。
 */
export const LayoutMode = {
    _mode: 'none', // 'none' | 'kanban'（'horizontal' 仅作旧值兼容，进入时归一为 kanban）
    _columns: 2,
    _justEntered: false, // 进入流程保护期：避开刚进入时浏览器未回流导致守卫读到旧宽
    _restoring: false, // 重建视图后恢复模式中：跳过 moveToCenter 请求（已在中央）
    _collapsedRightSidebar: false, // 右侧栏是否由本模块折叠（退出时据此对称展开，不动用户原有状态）
    _collapseRequested: false, // 本次多列会话是否已请求过折叠（防重复 IPC；每次退出复位）
    _movingToCenter: false, // 「侧栏 → 中央」进行中：旧面板不再分列/不吃多列紧凑类（即将被替换）
    _lastPersist: {}, // 本会话已写过的键值（宿主 putSetting 是「读整份设置→解析→写回」，同值必须跳过）

    /**
     * 【性能】只在值真正变化时写盘。
     * 宿主的 putSetting 每次都要 read + JSON.parse + vault.process 写回整份 settings.json，
     * 而切换布局会连续写 layoutMode / displayWidth 两三个键 —— 不去重就是每次切换 2~3 次全量磁盘读写。
     */
    _persistOnce(key, value) {
        if (typeof storageManager === 'undefined' || !storageManager.putSetting) return;
        if (!this._lastPersist) this._lastPersist = {};
        if (this._lastPersist[key] === value) return;
        this._lastPersist[key] = value;
        try { storageManager.putSetting(key, value); } catch (e) { /* 不阻塞 */ }
    },

    /**
     * 【性能】批量写设置（同值跳过）：layoutMode + displayWidth 这类成对写入一次发完。
     * 宿主的 putSetting 每次都要「读整份 settings.json → 解析 → 原子写回」；
     * 原先切换布局要写 4 次（进出各两次），现压到 2 次，未来可再合并为 1 次。
     */
    _persistBatch(pairs) {
        if (typeof storageManager === 'undefined') return;
        if (!this._lastPersist) this._lastPersist = {};
        const todo = {};
        let any = false;
        Object.keys(pairs || {}).forEach((k) => {
            if (this._lastPersist[k] === pairs[k]) return;
            this._lastPersist[k] = pairs[k];
            todo[k] = pairs[k];
            any = true;
        });
        if (!any) return;
        try {
            if (typeof storageManager.putSettings === 'function') {
                storageManager.putSettings(todo);
            } else {
                // 老宿主：退化为逐键写入
                Object.keys(todo).forEach((k) => storageManager.putSetting(k, todo[k]));
            }
        } catch (e) { /* 不阻塞 */ }
    },
    _switchTimer: 0, // layout-switching 过渡类的收尾定时器

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
     * 初始化：webapp 启动时由外部调用。检测「侧边栏移中央」重建后待恢复的布局模式
     * （宿主 app:ready 带回），自动进入对应模式。恢复模式时已在中央视图，不再请求移动。
     */
    /**
     * 初始化：webapp 启动时由外部调用。
     * - 模式以 settings.layoutMode 为权威来源（跨重启持久化）。
     * - 宿主侧 pendingLayoutMode 仅用于「同会话移中央重建」时跳过重复移动；它不参与跨重启
     *   恢复，因为在「横向→看板」手动切换时该字段不会更新（停留 'horizontal'），且重启后
     *   Obsidian 视图状态带回的是 stale 值——若拿它当模式，看板会被错误恢复成横向。
     * 移动端不恢复多列（_isDesktop 守卫）。
     */
    async init() {
        const pending = window.__bambooPendingLayoutMode;
        window.__bambooPendingLayoutMode = null;
        // 移动端不支持多列，保持纵向
        if (!this._isDesktop()) return;
        // 模式权威来源 = settings.layoutMode；仅当 settings 为空（极早期/竞态）才回退 pending
        let mode = null;
        try { mode = await this._loadPersistedMode(); } catch (e) { mode = null; }
        // pending 来自宿主视图状态（可由 webapp 消息写入），未受白名单约束，
        // 必须在这里收口；同时兼容旧值 'horizontal'（横向模式已移除 → 视为看板）。
        const pendingMode = pending === 'horizontal' ? 'kanban' : pending;
        if (!mode && pendingMode === 'kanban') mode = pendingMode;
        // _restoring（跳过 moveToCenter）仅在「同会话移中央重建且视图已在主工作区」时成立；
        // 重启即使 pending 非空（stale），若视图在侧栏仍需重新移回中央，故须绑定 __bambooIsMainLeaf
        this._restoring = !!(pending && window.__bambooIsMainLeaf);
        try {
            if (mode === 'kanban') this._enter('kanban');
        } finally {
            this._restoring = false;
        }
    },

    /** 从持久化设置读回上次布局模式（跨重启恢复）；仅接受合法值，否则返回 null */
    async _loadPersistedMode() {
        if (typeof storageManager === 'undefined' || !storageManager.getSetting) return null;
        try {
            const v = await storageManager.getSetting('layoutMode');
            // 横向模式已移除：历史值 'horizontal' 迁移为看板
            if (v === 'kanban' || v === 'horizontal') return 'kanban';
        } catch (e) { /* 读取失败不阻塞 */ }
        return null;
    },

    /**
     * 平台守卫：多列布局是桌面端体验。移动端（bridge 标记 __bambooIsMobile）
     * 或窗口跌破桌面断点（600px）一律禁止，避免窄屏下内联 grid 样式撑出多列挤压。
     */
    _isDesktop() {
        // 仅按宿主平台判断（不看窗口/iframe 宽度）：桌面端即使 iframe 窄（如侧边栏 ~300px）
        // 也允许进入多列，因为窄场景会自动移动到中央视图并放宽内容宽度。移动端平台才禁止。
        // 注意：本函数**不做**宽度断点判定。真正的窄屏保护在 checkAndExitIfNarrow()，
        // 且它刻意只看「用户设置的内容宽度」而非容器实际渲染宽度——后者会被 iframe
        // 物理宽度截断（主工作区视图本身可能只有 ~551px），用它判定会一进入就误退出。
        if (window.__bambooIsMobile) return false;
        return true;
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

        // 循环推进（横向模式已移除：只有 纵向 ⇄ 看板）
        if (this._mode === 'none') {
            this._enter('kanban');
        } else {
            this._forceOff();
        }
    },

    /**
     * 进入多列模式（现只剩「看板」一种）。
     * 兼容：旧版本持久化 / 视图状态里的 'horizontal' 一律按看板处理（横向模式已移除）。
     */
    _enter(mode) {
        // 兼容旧值：横向模式已移除，历史 settings / 视图状态里的 'horizontal' 归一到看板
        if (mode === 'horizontal') mode = 'kanban';
        // 白名单收口：本函数是唯一会把 layoutMode 写进 settings 的出口
        if (mode !== 'kanban') return;
        // 「移中央」进行中：忽略新的进入请求。否则会在即将被替换的旧面板上白做一次
        // 分列 / 宽度调整 / 过渡动画（纯开销），而新视图恢复的仍是旧的 mode → 状态不一致。
        if (this._movingToCenter) return;
        const el = byId('sectionsContainer');
        if (!el) return;

        const visibleCount = (typeof SectionRegistry !== 'undefined' && SectionRegistry.getVisible)
            ? SectionRegistry.getVisible().length
            : el.children.length;

        // 先判断「本次是否需要移到中央」：若是，则**不在旧面板上**做宽度/分列（纯浪费，
        // 而且会让仍在侧栏里的旧面板被撑到 1240px → 溢出变形），全部交给中央新视图渲染。
        const prevMode = this._mode;
        const inSidebar = typeof window !== 'undefined' && window.__bambooIsMainLeaf === false;
        const willMove = !this._restoring && prevMode === 'none' && inSidebar
            && typeof storageManager !== 'undefined' && storageManager.moveToCenter;

        // 看板：一行全排开，每板块独占一列（列数=板块数），保证所有板块顶部对齐。
        const columns = Math.max(1, visibleCount);
        const autoBumpTo = 1240;
        const label = '看板模式';

        // 进入看板固定 1240px（用户指定内容宽度）：无条件设为 1240，不再"仅不足时放宽"。
        // 顺带省掉一次 container.getBoundingClientRect()（强制同步布局）。
        // 不做宽度过渡：max-width 动画会让浏览器在 250ms 内持续重排，
        // 与紧接着的分列 DOM 重构叠加 → 明显掉帧。
        let widthAutoBumped = false;
        if (!willMove && typeof DisplayManager !== 'undefined' && DisplayManager._applyWidth) {
            if (DisplayManager._currentWidth !== autoBumpTo) {
                try { DisplayManager._applyWidth(autoBumpTo, false); } catch (e) { /* 不阻塞 */ }
                // 宽度持久化并入下面的批量写（layoutMode + displayWidth 一次发完）
                widthAutoBumped = true;
            }
        }

        this._mode = mode;
        // 持久化（批量一次写）：layoutMode + 本次是否改过宽度，供跨重启恢复（init 读回 settings.layoutMode）
        this._persistBatch(widthAutoBumped ? { layoutMode: mode, displayWidth: autoBumpTo } : { layoutMode: mode });
        // 进入流程保护：避开刚进入时浏览器未回流、_applyResponsiveClasses 读到旧宽
        // 误触发守卫退出。下帧后清标志，守卫恢复生效。
        this._justEntered = true;
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => { this._justEntered = false; });
        } else {
            setTimeout(() => { this._justEntered = false; }, 50);
        }
        // 【防闪关键：不要把多列布局套到「还在侧栏里的旧面板」上】
        // 侧栏宽度远小于多列所需（800 / 1240px），先套上去会立刻被挤压 / 溢出 → 视觉上先闪一下；
        // 移中央是「重建视图并直接揭示新视图」，旧面板一旦被替换即消失、不会长时间停留，
        // 故保持旧面板原样（仍是纵向），只请求宿主移到中央；
        // 真正的多列渲染交给中央的新视图（其 init 恢复模式时会完整跑一遍 _enter）。
        if (willMove) {
            try {
                const p = storageManager.moveToCenter(mode);
                // 折叠右侧栏不在此发起：本面板即将被销毁，其 promise 永远不会回调（宿主销毁后 respond 直接 return）。
                // 改由「新面板」在宿主通知 layout:revealed 时折叠 —— 既不会提前藏掉旧面板，也不会丢回执。
                if (p && typeof p.catch === 'function') {
                    p.catch((e) => console.warn('[LayoutMode] moveToCenter err', e && e.message));
                }
            } catch (e) { console.warn('[LayoutMode] moveToCenter throw', e && e.message); }
            this._updateButtonText();
            // 旧面板保持纵向原样，等中央新视图接管；期间：
            // · 列数按 1 计 —— 避免期间响应式重算按「多列」给仍在纵向的旧面板套紧凑类（字号/间距缩水）
            // · 禁止 reflow 提前分列 —— 否则先变形再被替换，等于多闪一下
            this._columns = 1;
            this._movingToCenter = true;
            // 兜底：移动若失败（宿主未注入/异常），3s 后解除封锁，避免面板永久卡在「半切换」状态
            if (typeof setTimeout === 'function') setTimeout(() => { this._movingToCenter = false; }, 3000);
            return true;
        }

        // 移除旧模式 class，设置新模式 class（横向模式已移除，只有看板）
        el.classList.remove('horizontal-layout', 'kanban-layout');
        el.classList.add('kanban-layout');
        // 多列（横向/看板）会把视图移到中央：给外层容器加标记，交给 CSS 做垂直居中。
        // 否则 #main-container 默认 align-items:flex-start + .container 下边距为 0 → 内容贴顶、偏上。
        const mainWrap = byId('main-container');
        if (mainWrap) mainWrap.classList.add('layout-multicol');
        // 布局切换后让诗词卡按新模式重渲染（看板用竖排无破折号模板，避免残留旧模板）
        if (typeof window !== 'undefined' && window.BambooGarden && typeof window.BambooGarden.rerenderPoem === 'function') {
            window.BambooGarden.rerenderPoem();
        }

        // 分列：看板=一行全排开（列数由 reflow 内部按当前板块数最终确定）
        this._columns = columns;
        this._reflowKanban(el);

        // 注：这里**不再**发 moveToCenter —— 「侧栏 → 中央」已由上方 willMove 早退分支处理，
        // 而「已在中央」时宿主 moveToCenter 本身也是 no-op。原来的这段是重复请求（每次白发一次 IPC），已删除。

        // 进入多列（看板）→ 请求宿主折叠 Obsidian 右侧栏，为多列布局腾出横向宽度。
        // 记账规则：只有「进入前未折叠、本次由我们折叠」才记 `_collapsedRightSidebar`（退出时对称展开）；
        // 若进入前本就折叠着（wasCollapsed=true），不记账、退出也不动它 —— 避免擅自展开用户原本折叠的侧栏。
        // 宿主未注入或移动端无右侧栏时，折叠请求会静默失败，无副作用。
        this._requestCollapseIfNeeded();

        this._updateButtonText();

        // 以下为非阻塞的收尾工作，统一延后到下一帧：
        // 此刻刚完成分列，同帧再 getBoundingClientRect() 会强制同步布局，而 _applyWidth
        // 内部已经算过一次响应式类；下一帧布局已稳定，读到的宽度更准，也少一轮重排。
        // Toast 同理延后，让切帧先呈现给用户。
        const toastMsg = widthAutoBumped ? `已临时放宽宽度进入${label}` : `已切换为${label}`;
        const finish = () => {
            // 走合帧调度：本帧 ResizeObserver 也会请求重算，合并后只跑一次强制布局
            if (typeof DisplayManager !== 'undefined' && DisplayManager._scheduleResponsive) {
                try { DisplayManager._scheduleResponsive(); } catch (e) { /* 不阻塞布局切换 */ }
            }
            if (typeof Toast !== 'undefined') {
                Toast.showToast(toastMsg, 'info');
            }
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(finish);
        else setTimeout(finish, 16);

        // 切换后播放一次轻量淡入，消除瞬间跳变的生硬感。
        // 重建视图的恢复路径（_restoring）跳过：新视图刚加载，首帧本就晚，
        // 再叠一次淡入等于把「空白/半透明」时段拉长，应让它一绘制就完整呈现。
        if (!this._restoring) this._playSwitchTransition(el);
    },

    /**
     * 布局切换过渡：给容器加一次性的 layout-switching 类（CSS 里是 opacity/transform
     * 动画，走合成层不触发重排）。用 rAF 跨帧添加，既保证动画能从初始态播起，
     * 又不需要 void offsetWidth 那种强制同步布局。
     */
    _playSwitchTransition(el) {
        if (!el) return;
        el.classList.remove('layout-switching');
        const add = () => {
            el.classList.add('layout-switching');
            clearTimeout(this._switchTimer);
            this._switchTimer = setTimeout(() => el.classList.remove('layout-switching'), 300);
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(add);
        else setTimeout(add, 16);
    },

    /**
     * 进入多列模式 → 请求宿主折叠 Obsidian 右侧栏，为多列布局腾出横向宽度。
     * 记账 _collapsedRightSidebar：恢复纵向时据此对称展开。
     *
     * 调用时机很重要：若在「新面板尚未揭示」时折叠，会把仍在显示的旧面板（位于右栏）一起藏掉 →
     * 出现一段谁都没画面的空白 → 观感闪烁。故「侧栏 → 中央」的场景由 _enter 在移中央完成之后再调。
     */
    _requestCollapseIfNeeded() {
        if (this._restoring || this._collapseRequested) return;
        if (typeof storageManager === 'undefined' || !storageManager.collapseRightSidebar) return;
        this._collapseRequested = true;
        try {
            const pr = storageManager.collapseRightSidebar();
            if (pr && typeof pr.then === 'function') {
                pr.then((res) => {
                    // 只有「此前未折叠、本次由我们折叠」才记账 → 退出时对称展开。
                    // wasCollapsed=true 说明用户进入前本就折叠着，不能记 → 否则退出会擅自展开。
                    if (res && res.wasCollapsed === false) this._collapsedRightSidebar = true;
                }).catch((e) => console.warn('[LayoutMode] collapseRightSidebar err', e && e.message));
            }
            // 无 Promise 返回（老宿主）→ 保守不记账：宁可不展开，也不擅自改用户布局
        } catch (e) { console.warn('[LayoutMode] collapseRightSidebar throw', e && e.message); }
    },

    /** 退出多列模式（供「恢复纵向」按钮 / 边界守卫 / 离开视图调用） */
    _forceOff() {
        if (this._mode === 'none') return;
        // 重建恢复途中不响应退出：否则会与「移中央」形成两条交叉的重建路径
        if (this._restoring) return;
        // 移中央进行中：退出请求会与正在进行的重建交叉（旧面板即将销毁，退出毫无意义）
        if (this._movingToCenter) return;
        this._mode = 'none';
        this._movingToCenter = false;
        // 清掉切换过渡的收尾定时器（面板即将被重建替换，定时器不应再跑）
        if (this._switchTimer) { clearTimeout(this._switchTimer); this._switchTimer = 0; }
        // 【B3】本视图是由系统从侧栏移来的 → 退出时宿主一定会把它移回侧栏（= 重建整个 webview）。
        // 于是"拆列 / 复位宽度 / 重算响应式类"这些打在**即将销毁的视图**上的工作可以整体跳过：
        // 新的侧栏视图会按纵向重新渲染，旧视图保留原样直到被销毁即可（省一次 O(N) DOM 搬移 + 两次强制布局）。
        const willRebuild = typeof window !== 'undefined' && window.__bambooCameFromSidebar === true;

        // ① 本地清理（拆列 / 摘标记 / 复位宽度 / 诗词模板）：仅当本视图**不会被重建替换**时才做。
        // willRebuild（本视图即将被原地 detach）时若还在"将死视图"上做这些，会出现一帧
        // "多列突然摊开成单列"（用户感知为"先放大再消失"）；直接交给宿主 detach 旧 leaf，
        // 新侧栏视图以自身纵向布局出现，即干净的硬切换。
        const exitWidth = (typeof DisplayManager !== 'undefined' && DisplayManager.MIN_WIDTH) || 400;
        if (!willRebuild) {
            const el = byId('sectionsContainer');
            const mainWrap = byId('main-container');
            if (mainWrap) mainWrap.classList.remove('layout-multicol');
            if (el) {
                el.classList.remove('horizontal-layout', 'kanban-layout');
                el.style.display = '';
                // 拆掉列 wrapper：把板块移回容器直接子元素（恢复纵向流式）
                this._unreflow(el);
            }
            // 退出多列后诗词卡恢复纵向/横向模板（带「——」）
            if (typeof window !== 'undefined' && window.BambooGarden && typeof window.BambooGarden.rerenderPoem === 'function') {
                window.BambooGarden.rerenderPoem();
            }
            // 退出横向/看板：恢复默认内容宽度（多列模式是临时放大，退出回到窄布局默认态）。
            // 不做宽度过渡：刚拆完列 wrapper，再叠宽度动画会掉帧。
            if (typeof DisplayManager !== 'undefined' && DisplayManager._applyWidth) {
                try { DisplayManager._applyWidth(exitWidth, false); } catch (e) { /* 不阻塞 */ }
            }
        }
        // 持久化必须跟上：_enter 已把 1240 写进 settings.displayWidth；不落盘则重启后宽度会读回 1240 —— 与「退出即回到纵向默认宽度」矛盾。
        // 与 layoutMode 合并成**一次批量写**（原先两次 putSetting = 两次全量 settings.json 读+写）。
        this._persistBatch({ layoutMode: 'none', displayWidth: exitWidth });
        this._updateButtonText();
        this._collapseRequested = false;   // 复位，供下次进入重新请求折叠

        // ② 先展开右侧栏（仅当此前由本模块折叠），再移回侧栏。
        //    顺序反过来会让面板落进一个「正在展开」的侧栏 → 位置跳动。
        if (this._collapsedRightSidebar) {
            this._collapsedRightSidebar = false;
            if (typeof storageManager !== 'undefined' && storageManager.expandRightSidebar) {
                try {
                    const pr = storageManager.expandRightSidebar();
                    if (pr && typeof pr.then === 'function') {
                        pr.catch((e) => console.warn('[LayoutMode] expandRightSidebar err', e && e.message));
                    }
                } catch (e) { console.warn('[LayoutMode] expandRightSidebar throw', e && e.message); }
            }
        }

        // ③ 最后请求宿主移回右侧栏（宿主仅当视图由系统从侧栏移来才执行）
        if (typeof storageManager !== 'undefined' && storageManager.moveToSidebar) {
            try { storageManager.moveToSidebar(); } catch (e) { /* 不阻塞 */ }
        }

        // 与进入时对称：响应式类重算和 Toast 延后到下一帧，等拆列后的布局稳定
        const finish = () => {
            // willRebuild 时本视图即将被替换，重算响应式类（含一次 getBoundingClientRect）纯属浪费 → 跳过。
            // 否则走合帧调度：与 ResizeObserver 的请求合并，每帧最多一次强制布局。
            if (!willRebuild && typeof DisplayManager !== 'undefined' && DisplayManager._scheduleResponsive) {
                try { DisplayManager._scheduleResponsive(); } catch (e) { /* 不阻塞 */ }
            }
            if (typeof Toast !== 'undefined') {
                Toast.showToast('已恢复纵向布局', 'info');
            }
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(finish);
        else setTimeout(finish, 16);
        // 注意：退出不再播 layout-switching 淡入 —— 面板即将被重建替换，
        // 淡入看不见，反而会与新面板叠加造成一次闪烁。
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
        // 「移中央」进行中：旧面板保持纵向原样，不要抢先分列（否则先变形再被替换 = 闪一下）
        if (this._movingToCenter) return;
        if (this._mode === 'kanban') this._reflowKanban(el);
    },

    /**
     * 取待分列的板块元素，按「权威顺序」排列。
     *
     * 绝不能直接用 container.children 的顺序：_unreflow() 摊平列 wrapper 后得到的是
     * **列优先**顺序（col1 全部 → col2 全部 → …），而不是板块的真实顺序。
     * 横向模式再按 idx % cols 交替回填，等于把列优先序列再交错一次 ——
     * 结果是 reflow 不幂等：第一次 [A,B,C,D] → col1=[A,C] col2=[B,D]（视觉 A B / C D，正确）；
     * 摊平后是 [A,C,B,D]，第二次回填得 col1=[A,B] col2=[C,D]（视觉 A C / B D，错序）。
     * 于是每渲染一次（renderScheduler 的局部渲染由勾选待办等触发）板块顺序就跳一次，来回抖。
     *
     * 权威顺序来自 SectionRegistry.getVisible()（拖拽排序后的唯一真源）；
     * 取不到注册表、或元素上没有 data-section-id 时回退 DOM 顺序。
     */
    _orderedItems(container) {
        const kids = Array.from(container.children);
        let ids = null;
        try {
            if (typeof SectionRegistry !== 'undefined' && SectionRegistry.getVisible) {
                ids = SectionRegistry.getVisible().map((s) => (s && s.id) || s);
            }
        } catch (e) { ids = null; }
        if (!ids || !ids.length) return kids;

        const map = new Map();
        kids.forEach((el) => {
            const id = el && el.getAttribute ? el.getAttribute('data-section-id') : null;
            if (id) map.set(id, el);
        });
        if (map.size === 0) return kids;   // 元素无 data-section-id（测试桩等）→ 沿用 DOM 顺序

        const out = [];
        const used = new Set();
        ids.forEach((id) => {
            const el = map.get(id);
            if (el && !used.has(el)) { out.push(el); used.add(el); }
        });
        // 未被注册表收录的元素：按 DOM 顺序补在末尾，绝不丢板块
        kids.forEach((el) => { if (!used.has(el)) out.push(el); });
        return out;
    },

    /** 看板分列：一行全排开，每个板块独占一列 */
    _reflowKanban(container) {
        if (!container) return;
        this._unreflow(container);
        // 同样走权威顺序：局部渲染会把新板块 appendChild 到容器顶层，
        // 直接用 DOM 顺序会让新板块被排到列尾而非其应在的位置。
        const items = this._orderedItems(container);
        // 尚无板块（init 恢复时板块还没渲染）：不做任何 DOM 工作，等渲染完 reflow 再分列。
        // 否则会先建一个空列 wrapper 再被下一次 reflow 拆掉 —— 白做一次 DOM 变更与重排。
        if (items.length === 0) { this._columns = 1; return; }
        // 看板：一行全排开，每板块独占一列（列数 = 板块数）。
        // 必须按「当前」板块数重算：init() 恢复看板时板块尚未渲染（visibleCount=0），
        // 沿用那时算出的 _columns=1 会把所有板块塞进 1 列 → 视觉上等同纵向，
        // 表现为「看板没有恢复」。渲染系统渲染完后调 reflow() 重算即可纠正。
        const cols = Math.max(1, items.length);
        this._columns = cols;
        const frag = document.createDocumentFragment();
        const wrappers = [];
        for (let i = 0; i < cols; i++) {
            const col = document.createElement('div');
            col.className = 'layout-col kanban-col';
            wrappers.push(col);
            frag.appendChild(col);
        }
        items.forEach((item, idx) => {
            // 每个板块一列（cols === items.length，故 idx % cols === idx）。
            // 保留取模是为了 cols 被外力改小（如极端降级）时仍不丢板块——多余板块按顺序追加到各列尾。
            wrappers[idx % cols].appendChild(item);
        });
        container.appendChild(frag);
        this._logReflow('reflowKanban', cols, wrappers);
    },

    /**
     * 分列调试输出。默认关闭：webview 的 console 要跨进程传给宿主，而这里会拼出
     * 包含全部板块 id/class 的长字符串，在切换路径上属于纯浪费。
     * 需要排查分列结果时执行 window.__bambooDebugLayout = true 打开。
     */
    _logReflow(name, cols, wrappers) {
        if (typeof window === 'undefined' || !window.__bambooDebugLayout) return;
        const colInfo = wrappers.map((w, i) => `col${i + 1}=[${Array.from(w.children).map(c => c.getAttribute('data-section-id') || c.className || '?').join(',')}]`).join(' | ');
        console.log(`[LayoutMode] ${name} cols=${cols} ${colInfo}`);
    },

    /** 拆掉列 wrapper：把板块移回容器直接子元素（恢复纵向流式） */
    _unreflow(container) {
        if (!container) return;
        const wrappers = Array.from(container.querySelectorAll(':scope > .layout-col'));
        if (wrappers.length === 0) return;
        // 先把所有板块搬进 Fragment（内存中完成，不触发重排），拆掉空 wrapper，
        // 再一次性挂回容器 —— 整段只让布局失效一次。
        const frag = document.createDocumentFragment();
        wrappers.forEach((w) => {
            while (w.firstChild) frag.appendChild(w.firstChild);
            w.remove();
        });
        container.appendChild(frag);
    },

    /** 同步循环按钮文案：纵向→「看板模式」、看板→「恢复纵向」 */
    _updateButtonText() {
        const textEl = byId('fabLayoutToggleText');
        if (!textEl) return;
        if (this._mode === 'kanban') textEl.textContent = '恢复纵向';
        else textEl.textContent = '看板模式';
    },

    /**
     * 内容宽度守卫：多列模式激活时，若内容宽度设置跌破桌面断点（600px）
     * 则自动退出。由 DisplayManager._applyResponsiveClasses 调用，
     * 后者又由「宽度变化」与 ResizeObserver（容器实际尺寸变化）双双驱动，
     * 因此窗口/侧栏缩放导致的变窄同样能走到这里 —— 无需额外的 window resize 监听。
     * （此前确有 _bindResizeGuard 常驻 window resize，但它判的是 _isDesktop()，
     *   而后者只取决于宿主平台标志、resize 中恒定，故那个监听永远不会触发退出，已移除。）
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

// webapp 启动：bridge 就绪（storage:initialized）后，检测并恢复「侧边栏移中央」待恢复的布局模式
(function () {
    if (typeof EventBus !== 'undefined' && typeof EventBus.on === 'function') {
        EventBus.on('storage:initialized', () => {
            try { LayoutMode.init(); } catch (e) { /* 不阻塞启动 */ }
        });
        // 「移中央」完成后宿主通知本面板已揭示 → 此时才折叠右侧栏：
        // 既不提前藏掉旧面板，也不会像旧面板那样因销毁而丢回执。
        EventBus.on('layout:revealed', () => {
            try {
                if (!LayoutMode.isActive()) return;
                if (LayoutMode._restoring) {
                    // 极少数情况下 revealed 早于 init 的异步设置读取完成（_restoring 仍为 true）：
                    // 下一拍重试一次，避免折叠请求被静默吞掉、右栏永不折叠。
                    setTimeout(() => { try { LayoutMode._requestCollapseIfNeeded(); } catch (e) { /* 不阻塞 */ } }, 0);
                    return;
                }
                LayoutMode._requestCollapseIfNeeded();
            } catch (e) { /* 不阻塞 */ }
        });
    } else {
        setTimeout(() => {
            try { LayoutMode.init(); } catch (e) { /* 不阻塞启动 */ }
        }, 300);
    }
})();
