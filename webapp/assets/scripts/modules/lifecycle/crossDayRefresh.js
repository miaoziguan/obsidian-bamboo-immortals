/**
 * 跨天自动刷新引擎（核心功能，独立于任何 UI 面板）
 *
 * 职责：每日在设定时刻（默认 0 点，可自定义 HH:MM）整页刷新首页到当天。
 * 双保险：
 *   ① setTimeout 计算到下一个设定时刻，到点刷新并自动排下一周期（不轮询，零性能开销）；
 *   ② visibilitychange 回到可见时比对「渲染日期 vs 真实今天」，若已跨天立即刷新
 *      （覆盖 overnight 挂着但午夜 tab 被节流、setTimeout 未触发的边缘情况）。
 *
 * 依赖（均为 window 全局，无需 import）：storageManager / window.store / window.formatDate / window.renderAll
 * UI 入口在 SettingsModal（核心功能「通用」Tab 的「交互行为」小节），通过 CrossDayRefresh.setSchedule() 写入配置。
 */

const CrossDayRefresh = {
    _mode: '00:00',        // '00:00'(默认) | 'custom'
    _custom: '00:00',      // 自定义时刻 HH:MM（仅 mode=custom 生效）
    _timer: null,
    _visibilityBound: false,

    async init() {
        // 从 Vault 恢复配置
        try {
            const saved = await storageManager.getSetting('autoRefreshTime');
            const mode = (saved === 'custom') ? 'custom' : '00:00';
            let custom = '00:00';
            if (mode === 'custom') {
                const customVal = await storageManager.getSetting('autoRefreshCustom');
                if (typeof customVal === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(customVal)) {
                    custom = customVal;
                }
            }
            this._mode = mode;
            this._custom = custom;
        } catch (e) {
            this._mode = '00:00';
            this._custom = '00:00';
        }
        this._arm();
    },

    /** UI 调用：更新刷新时刻并立即重排定时器 */
    async setSchedule(mode, custom) {
        this._mode = (mode === 'custom') ? 'custom' : '00:00';
        this._custom = (typeof custom === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(custom)) ? custom : '00:00';
        try {
            await storageManager.putSetting('autoRefreshTime', this._mode);
            if (this._mode === 'custom') {
                await storageManager.putSetting('autoRefreshCustom', this._custom);
            }
        } catch (e) { /* 持久化失败不阻塞 */ }
        this._arm();
    },

    _getTime() {
        return this._mode === 'custom' ? this._custom : '00:00';
    },

    _arm() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        // 可见性兜底：全局只绑一次
        if (!this._visibilityBound) {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this._checkAndRefresh();
                }
            });
            this._visibilityBound = true;
        }
        const [h, m] = this._getTime().split(':').map(Number);
        const now = new Date();
        const next = new Date(now);
        next.setHours(h, m, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1); // 已过今天设定时刻 → 明天
        const delay = next.getTime() - now.getTime();
        this._timer = setTimeout(() => {
            this._doRefresh();
            this._arm(); // 排下一周期
        }, delay);
    },

    _checkAndRefresh() {
        try {
            const store = (typeof window !== 'undefined' && window.store) || null;
            if (!store || !store.state) return;
            const fmt = (typeof window.formatDate === 'function') ? window.formatDate : null;
            if (!fmt) return;
            const shown = fmt(store.state.currentDate);
            const today = fmt(new Date());
            if (shown && today && shown !== today) {
                this._doRefresh();
            }
        } catch (e) { /* 不阻塞 */ }
    },

    _doRefresh() {
        try {
            const store = (typeof window !== 'undefined' && window.store) || null;
            if (!store || typeof store.goToDate !== 'function') return;
            store.goToDate(new Date()); // 切回真实今天
            if (typeof window.renderAll === 'function') {
                window.renderAll(); // 整页重渲染
            }
        } catch (e) {
            console.warn('[CrossDayRefresh] refresh failed:', e && e.message);
        }
    },
};

window.CrossDayRefresh = CrossDayRefresh;

// 自启动：bridge 就绪（storage:initialized）后初始化，与 LayoutMode 同范式
(function () {
    if (typeof EventBus !== 'undefined' && typeof EventBus.on === 'function') {
        EventBus.on('storage:initialized', () => {
            try { CrossDayRefresh.init(); } catch (e) { /* 不阻塞启动 */ }
        });
    } else {
        setTimeout(() => {
            try { CrossDayRefresh.init(); } catch (e) { /* 不阻塞启动 */ }
        }, 300);
    }
})();
