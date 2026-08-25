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

    /** 读取当前模糊强度（0=关，否则 px）。非法值回退默认。 */
    getLevel() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (raw === null) return this.DEFAULT_LEVEL;
            const n = parseInt(raw, 10);
            if (isNaN(n)) return this.DEFAULT_LEVEL;
            return Math.max(this.MIN_LEVEL, Math.min(this.MAX_LEVEL, n));
        } catch (_) {
            return this.DEFAULT_LEVEL;
        }
    },

    /** 上次使用的非零强度（关闭时记住，用于 toggle 恢复） */
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

    /** 持久化强度并立即应用到 DOM；强度>0 时同时记上次强度 */
    setLevel(level) {
        const n = Math.max(this.MIN_LEVEL, Math.min(this.MAX_LEVEL, Math.round(level)));
        try {
            localStorage.setItem(this.KEY, String(n));
            if (n > 0) localStorage.setItem(this.LAST_KEY, String(n));
        } catch (_) {}
        this.apply(n);
        return n;
    },

    /** 在「上次强度」与「关闭(0)」之间翻转，返回翻转后是否开启 */
    toggle() {
        const next = this.isOn() ? 0 : this.getLastLevel();
        this.setLevel(next);
        return next > 0;
    },

    /** 将强度写入 :root 的 --privacy-blur，并切换 body.privacy-on */
    apply(level) {
        const root = document.documentElement;
        if (!root) return;
        root.style.setProperty('--privacy-blur', level + 'px');
        const body = document.body;
        if (body) {
            if (level > 0) body.classList.add('privacy-on');
            else body.classList.remove('privacy-on');
        }
    },

    /** 视图初始化时调用：恢复上次状态 */
    init() {
        this.apply(this.getLevel());
    },
};

window.PrivacyMode = PrivacyMode;
