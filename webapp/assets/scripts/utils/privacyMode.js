/**
 * PrivacyMode — 防偷窥模糊（UI 偏好，与业务数据解耦）
 *
 * 设计原则：
 *  - 隐私强度是「UI 偏好」而非业务状态，存于独立 StorageKey（PRIVACY_BLUR_LEVEL），
 *    不进入复盘数据 store，备份/导出/同步均不带它。
 *  - 强度以 CSS 变量 --privacy-blur 驱动，所有 [data-private] 引用该变量做 blur，
 *    调节 = 改一个变量，无需重排样式表，且带 transition 跟手。
 *  - 0 表示关闭（清晰），>0 为模糊半径(px)；默认 10，上限 20（>20 重绘开销陡增无收益）。
 *  - 主视图与归档视图各自读同一 storage 键，初始化即生效（无需实时双向广播，避免 bridge 债务）。
 */
export const PrivacyMode = {
    KEY: 'privacy_blur_level',
    LAST_KEY: 'privacy_blur_last',
    DEFAULT_LEVEL: 10,
    MAX_LEVEL: 20,
    MIN_LEVEL: 0,

    /** 读取当前模糊强度（0=关，否则 px）。
     *  重要：未设置过（首次使用）返回 0 = 关，绝不默认开启隐私。 */
    getLevel() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (raw === null) return 0;
            const n = parseInt(raw, 10);
            if (isNaN(n)) return 0;
            return Math.max(this.MIN_LEVEL, Math.min(this.MAX_LEVEL, n));
        } catch (_) {
            return 0;
        }
    },

    /** 读取上次使用的非零强度（用于关闭后再开时恢复，不丢档位） */
    getLastLevel() {
        try {
            const raw = localStorage.getItem(this.LAST_KEY);
            const n = raw === null ? NaN : parseInt(raw, 10);
            if (isNaN(n)) return this.DEFAULT_LEVEL;
            return Math.max(this.MIN_LEVEL, Math.min(this.MAX_LEVEL, n)) || this.DEFAULT_LEVEL;
        } catch (_) {
            return this.DEFAULT_LEVEL;
        }
    },

    /** 当前是否处于隐私开启状态（强度 > 0） */
    isOn() {
        return this.getLevel() > 0;
    },

    /** 持久化强度并立即应用到 DOM；强度>0 时记住上次强度 */
    setLevel(level) {
        const n = Math.max(this.MIN_LEVEL, Math.min(this.MAX_LEVEL, Math.round(level)));
        try {
            localStorage.setItem(this.KEY, String(n));
            if (n > 0) localStorage.setItem(this.LAST_KEY, String(n));
        } catch (_) {}
        this.apply(n);
        return n;
    },

    /** 在「关」与「上次强度」之间翻转，返回翻转后是否开启 */
    toggle() {
        const next = this.isOn() ? 0 : this.getLastLevel();
        this.setLevel(next);
        return next > 0;
    },

    /** 将强度写入 --privacy-blur，并切换隐私态 class。
     *  - 变量同时设在 :root(html) 与 shadow host：自定义属性继承穿透 shadow 边界，
     *    但部分 WebView 对跨 shadow 继承有怪异，直接设到 host（[data-private] 的直接祖先）
     *    可 100% 可靠命中。
     *  - 隐私态 class 同时加在 body 与 shadow host 两处：不依赖 shadowBootstrap 的
     *    MutationObserver 异步镜像（其偶发漏镜像会导致关闭时 host 残留 .privacy-on 而使
     *    模糊无法消除）；这里直接双写，确保 :host(.privacy-on) 与 body.privacy-on 同时成立/撤销。
     *  - noShadow 回退时 host 为 null，仅 body 生效，与旧逻辑一致。 */
    apply(level) {
        const px = level + 'px';
        const root = document.documentElement;
        if (root) root.style.setProperty('--privacy-blur', px);
        const sr = window.__bambooShadowRoot;
        const host = sr && sr.host;
        if (host) {
            host.style.setProperty('--privacy-blur', px);
            // 直通同步：shadow 模式下模糊态由 :host(.privacy-on) 命中，必须确保 host 的 class 正确
            if (level > 0) host.classList.add('privacy-on');
            else host.classList.remove('privacy-on');
        }
        const body = document.body;
        if (body) {
            if (level > 0) body.classList.add('privacy-on');
            else body.classList.remove('privacy-on');
        }
    },

    /** 视图初始化时调用：恢复上次状态 */
    init() {
        this.markText();
        this.apply(this.getLevel());
    },

    /**
     * 给「纯文字叶子元素」批量补打 data-private-text 标记（全局扫描，零遗漏兜底）。
     * 扫描整个 shadow root（或 document）内含直接文本节点的叶子元素，排除 UI 骨架
     * （FAB/模态/导航/按钮/媒体/图标/进度条等），确保图片/图标保持清晰、而任何
     * 位置的文字（含待办/时间线板块、动态渲染内容）都被纳入模糊。
     * 仅处理尚未标记的元素，幂等可重复调用（配合动态渲染的 MutationObserver）。
     */
    markText() {
        // 作用域：shadow 模式扫 shadow root，无 shadow 回退 document
        const sr = window.__bambooShadowRoot;
        const scope = (sr && sr.documentElement) || document;
        if (!scope) return;
        // UI 骨架 / 结构型 / 媒体：整棵子树跳过，不被模糊
        const isSkeleton = (el) =>
            el.matches(
                'img, svg, video, canvas, audio, ' +
                'button, input, select, textarea, ' +
                '.fab-container, .fab-actions, .fab-action-btn, .fab-main, .fab-privacy-panel, ' +
                '.modal-container, .modal-base, .modal-panel, ' +
                '.nav, .navbar, .topnav, .quick-nav, .side-nav, ' +
                '.icon, .goal-progress, .progress-bar, .bamboo-progress, .todo-progress-bar, ' +
                '.tooltip, .fab-btn-icon, .bamboo-icon, .todo-lottery-btn'
            );
        const walk = (node) => {
            if (node.nodeType !== 1) return; // 仅元素
            if (isSkeleton(node)) return;    // 骨架/媒体：跳过整棵子树
            const hasText = Array.from(node.childNodes).some(
                (c) => c.nodeType === 3 && c.textContent.trim().length > 0
            );
            if (hasText && !node.hasAttribute('data-private-text')) {
                node.setAttribute('data-private-text', '');
            }
            for (const child of Array.from(node.children)) walk(child);
        };
        for (const child of Array.from(scope.children)) walk(child);
    },
};

window.PrivacyMode = PrivacyMode;
