/**
 * dragPerf.js — 拖拽期「帧间隔」探针（现场诊断用）
 *
 * 为什么需要它：
 *   卡片 / 贴纸的拖拽性能反馈长期只能靠「感觉顺不顺」。本轮排查里最耗时的不是修复，
 *   而是「用户说卡、开发者复现不出来」——因为卡顿往往只在**长会话**（后台退化、进程抢
 *   主线程、GPU 降级）时出现，干净会话测不到。探针把「卡」变成可报数的 p50/p90/max。
 *
 * 设计：只做一件事——拖动开始挂一个 rAF 采样循环，松手汇总分位数。
 *   · 单次拖动的成本是一个 rAF/帧（与已有的拖拽 rAF 同频），只在手势期间存在；
 *   · 环形缓冲只留最近 20 次拖动，不随会话增长；
 *   · 阈值只在「明显掉帧」时出声，且**每会话只提示一次**，绝不刷屏；
 *   · 任何异常都不向上抛（测量绝不能影响功能）。
 *
 * 现场用法（画中卷 iframe 控制台）：
 *   __twDragPerf.report()   最近若干次拖动的分位数表
 *   __twDragPerf.last()     最近一次
 *   __twDragPerf.off()/on() 关/开采样
 */

/** 环形缓冲：最近 N 次拖动 */
const RING = 20;
/** 判定「明显掉帧」的阈值：p90 超过 24ms（≈1.5 帧）或掉帧率 > 20% */
const BAD_P90 = 24;
const BAD_DROP_RATE = 0.2;
/** 单帧超过该值即计入 dropped（>1.5 帧预算） */
const DROP_FRAME = 24;
/** 单次拖动的采样上限：10s@60fps —— 已足够判读，同时兜住「rAF 被替换成同步回调」这类
 *  异常实现（同步 rAF 会在同一调用栈里无限重排，必须设闸否则栈溢出）。 */
const MAX_SAMPLES = 600;

function nowMs() {
    try {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            return performance.now();
        }
    } catch (_) { /* 忽略 */ }
    return Date.now();
}

function percentile(sorted, p) {
    if (!sorted.length) return 0;
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
    return sorted[idx];
}

export const DragPerf = {
    _on: true,
    _ring: [],
    _live: null,
    _warned: false,

    setEnabled(v) { this._on = !!v; },
    isEnabled() { return this._on; },

    /** 测试用：清空历史与「已提示」标记 */
    reset() {
        this._ring.length = 0;
        this._warned = false;
        this._live = null;
    },

    /** 拖动开始：起一个 rAF 采样循环（手势结束前一直跑） */
    begin() {
        if (!this._on) return;
        if (this._live) this.end();      // 上一轮没正常收尾（手势被吞）→ 先收掉，避免双循环
        const s = { on: true, ts: nowMs(), gaps: [], rafId: 0 };
        this._live = s;
        if (typeof requestAnimationFrame !== 'function') return;
        let zero = 0;
        const tick = () => {
            if (!s.on) return;
            const t = nowMs();
            const gap = t - s.ts;
            s.ts = t;
            s.gaps.push(gap);
            // 闸①：连续零间隔 = rAF 被同步实现（异常环境 / 测试替身），立刻停，避免栈溢出
            if (gap <= 0) { zero++; if (zero >= 3) { s.on = false; return; } } else zero = 0;
            // 闸②：采样上限，防止超长拖动让缓冲无限增长
            if (s.gaps.length >= MAX_SAMPLES) { s.on = false; return; }
            s.rafId = requestAnimationFrame(tick);
        };
        s.rafId = requestAnimationFrame(tick);
    },

    /**
     * 拖动结束：汇总并返回本次样本（无有效帧则返回 null）。
     * @returns {{n:number,p50:number,p90:number,max:number,dropped:number}|null}
     */
    end() {
        const s = this._live;
        this._live = null;
        if (!s) return null;
        s.on = false;
        if (s.rafId && typeof cancelAnimationFrame === 'function') {
            try { cancelAnimationFrame(s.rafId); } catch (_) { /* 忽略 */ }
        }
        // 丢掉首帧：它含 pointerdown 当帧的准备（选层提升 / 阴影摘除）成本，不代表拖动稳态
        const gaps = s.gaps.slice(1);
        if (!gaps.length) return null;
        const sorted = gaps.slice().sort((a, b) => a - b);
        const rec = {
            n: gaps.length,
            p50: +percentile(sorted, 0.5).toFixed(1),
            p90: +percentile(sorted, 0.9).toFixed(1),
            max: +Math.max.apply(null, gaps).toFixed(1),
            dropped: gaps.filter((v) => v > DROP_FRAME).length,
        };
        this._ring.push(rec);
        if (this._ring.length > RING) this._ring.shift();
        this._reportIfBad(rec);
        return rec;
    },

    /** 最近一次拖动的样本（无则 null） */
    last() { return this._ring.length ? this._ring[this._ring.length - 1] : null; },

    /** 最近若干次拖动的样本（副本） */
    all() { return this._ring.slice(); },

    /** 分位数表：{ n, rows: [...], avgP90 } —— 供控制台 / 上报人工判读 */
    report() {
        const rows = this._ring.slice();
        if (!rows.length) return { n: 0, rows: [], avgP90: 0 };
        const avgP90 = +(rows.reduce((a, r) => a + r.p90, 0) / rows.length).toFixed(1);
        return { n: rows.length, rows, avgP90 };
    },

    /** 阈值判定：明显掉帧才出声，且每会话只提示一次（console 每次仍记录，便于事后取证） */
    _reportIfBad(rec) {
        const bad = rec.p90 > BAD_P90 || rec.dropped / rec.n > BAD_DROP_RATE;
        if (!bad) return;
        const line = '[拖拽帧率] p90 ' + rec.p90 + 'ms · max ' + rec.max + 'ms · 掉帧 '
            + rec.dropped + '/' + rec.n + '（__twDragPerf.report() 看历史）';
        try { console.warn(line); } catch (_) { /* 忽略 */ }
        if (this._warned) return;
        this._warned = true;
        if (typeof Toast !== 'undefined' && Toast && typeof Toast.showToast === 'function') {
            Toast.showToast('拖动卡顿：p90 ' + rec.p90 + 'ms（掉帧 ' + rec.dropped + '/' + rec.n + '）', 'info');
        }
    },
};

// 控制台现场诊断出口：webapp 跑在 iframe 里，需要 window 级入口
if (typeof window !== 'undefined') {
    window.__twDragPerf = {
        report: () => DragPerf.report(),
        last: () => DragPerf.last(),
        all: () => DragPerf.all(),
        on: () => DragPerf.setEnabled(true),
        off: () => DragPerf.setEnabled(false),
        reset: () => DragPerf.reset(),
    };
}

if (typeof globalThis !== 'undefined') {
    globalThis.DragPerf = DragPerf;
}
