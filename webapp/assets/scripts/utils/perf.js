/**
 * 轻量性能测量器（P1-5：建立可复现的性能基线）。
 *
 * 背景：本仓库此前**没有任何性能测量**——「切换更跟手 / 首帧更快 / 保存更顺」全靠主观感受，
 * 优化前后无法给出数字。本模块只做三件事，且刻意做得极轻：
 *   1) `Perf.mark(name)`：往 DevTools Performance 时间轴打点（仅调 performance.mark）；
 *   2) `Perf.start(label)`：返回一个 stop 函数，记录该段耗时到内存环形缓冲；
 *   3) `Perf.report()`：按 p50/p95/max 汇总打印（console.table），用于「改前/改后」对比。
 *
 * 设计约束：
 *   · 零依赖、不联网、不上报；只存在内存里，随页面销毁；
 *   · 每个 label 只保留最近 CAP 个样本（默认 200），避免长会话内存增长；
 *   · 环境缺 performance 时退回 Date.now()，任何异常都不向上抛（测量绝不能影响功能）。
 */
const CAP = 200;
const store = new Map();   // label -> number[]（毫秒）
let enabled = true;

function now() {
    try {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            return performance.now();
        }
    } catch (_) { /* 忽略 */ }
    return Date.now();
}

function push(label, ms) {
    if (!enabled) return;
    let arr = store.get(label);
    if (!arr) { arr = []; store.set(label, arr); }
    arr.push(ms);
    if (arr.length > CAP) arr.splice(0, arr.length - CAP);
}

/** 分位数（线性插值取第 rank 个，样本少时也稳定） */
function percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    if (sorted.length === 1) return sorted[0];
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
    return sorted[idx];
}

export const Perf = {
    /** 每个 label 的样本上限（测试与报表用） */
    CAP,

    setEnabled(v) { enabled = !!v; },
    isEnabled() { return enabled; },

    /** DevTools Performance 时间轴打点（失败静默） */
    mark(name) {
        try {
            if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
                performance.mark(String(name));
            }
        } catch (_) { /* 忽略 */ }
    },

    /**
     * 开始计时。
     * @param {string} label 报表分组名
     * @returns {() => number} 调用即停止并记录，返回本次耗时（毫秒）
     */
    start(label) {
        const t0 = now();
        return () => {
            const dt = now() - t0;
            push(label, dt);
            return dt;
        };
    },

    /** 直接记录一个已测得的耗时 */
    record(label, ms) {
        if (typeof ms !== 'number' || !isFinite(ms)) return;
        push(label, ms);
    },

    /** 汇总：[{ label, count, p50, p95, max, avg }]，按 p95 降序（最慢的排最前） */
    summary() {
        const out = [];
        for (const [label, arr] of store.entries()) {
            if (arr.length === 0) continue;
            const sorted = [...arr].sort((a, b) => a - b);
            const sum = sorted.reduce((n, v) => n + v, 0);
            out.push({
                label,
                count: sorted.length,
                p50: +percentile(sorted, 0.5).toFixed(2),
                p95: +percentile(sorted, 0.95).toFixed(2),
                max: +sorted[sorted.length - 1].toFixed(2),
                avg: +(sum / sorted.length).toFixed(2),
            });
        }
        out.sort((a, b) => b.p95 - a.p95);
        return out;
    },

    /** 打印报表（控制台执行 BambooPerf.report() 查看） */
    report() {
        const rows = Perf.summary();
        if (typeof console !== 'undefined' && typeof console.table === 'function') {
            console.table(rows);
        } else {
            // eslint-disable-next-line no-console -- 无 console.table 的环境（旧 WebView）退回文本输出
            console.log(rows);
        }
        return rows;
    },

    reset() { store.clear(); },
};

// 便于在 Obsidian 控制台直接 `BambooPerf.report()` 查看（webapp 约定：调试入口挂 window）
if (typeof window !== 'undefined') {
    window.BambooPerf = Perf;
}
// 测试加载器（loadModule）会剥离 import/export，被剥离后的调用方按**全局名**解析依赖。
// 若不发布此处，所有 loadModule 了 layoutMode/renderScheduler/PersistenceCoordinator 的测试
// 都会因 `Perf is not defined` 失败（仓库既有 twConfig 挂 globalThis 的同款做法）。
if (typeof globalThis !== 'undefined') {
    globalThis.Perf = Perf;
}
