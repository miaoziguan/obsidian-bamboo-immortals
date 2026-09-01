/**
 * NoisePlayer - 白噪音播放引擎
 * 负责 AudioContext 管理、音频播放/停止/暂停
 */
export const NoisePlayer = {
    audioCtx: null,
    gainNode: null,
    sourceNode: null,
    filterNode: null,
    isPlaying: false,
    currentType: null,
    volume: 1,  // 新增：音量控制 (0-1)
    _fadeTimer: null,

    // 初始化
    init() {
        this.currentType = StorageAdapter.get(StorageKeys.WHITENOISE_TYPE) || 'bamboo';
        // 页面卸载时关闭 AudioContext
        window.addEventListener('beforeunload', () => {
            if (this.audioCtx) {
                try { this.audioCtx.close(); } catch(e) {}
                this.audioCtx = null;
            }
        });
        // 恢复播放由 WhiteNoiseManager.init() 统一处理，
        // 因为它需要走完完整的音源解析 → 生成 → 播放流程
    },

    // 获取或创建 AudioContext
    getAudioCtx() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            // resume() 返回 Promise，无用户手势时会被浏览器拒绝（自动播放策略），
            // 这里不能 await（调用方都是同步取 ctx），失败由 ensureRunning() 兜底。
            try {
                const p = this.audioCtx.resume();
                if (p && typeof p.catch === 'function') p.catch(() => {});
            } catch (e) { /* 忽略，ensureRunning 会兜底 */ }
        }
        return this.audioCtx;
    },

    /**
     * 确保 AudioContext 真的在出声。
     * 场景：页面刷新后 WhiteNoiseManager.init() 会自动恢复播放，但此时没有用户手势，
     * 浏览器会拒绝 resume() → UI 显示"正在播放"却听不到声音。
     * 这里检测到仍处于 suspended 时挂一次性手势监听，用户首次交互立刻恢复。
     */
    ensureRunning() {
        if (!this.audioCtx || this.audioCtx.state === 'running') return;
        const tryResume = () => {
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                try {
                    const p = this.audioCtx.resume();
                    if (p && typeof p.catch === 'function') p.catch(() => {});
                } catch (e) { /* 仍被拒绝则等下一次手势 */ }
            }
        };
        tryResume();
        if (this.audioCtx.state !== 'running') {
            const events = ['pointerdown', 'keydown', 'touchstart'];
            const handler = () => {
                tryResume();
                events.forEach(ev => window.removeEventListener(ev, handler));
            };
            events.forEach(ev => window.addEventListener(ev, handler));
        }
    },

    // 播放音效
    async play(typeId, noiseType, audioBuffer) {
        // 点击当前正在播放的音效不做任何操作
        if (this.currentType === typeId && this.isPlaying) {
            return;
        }

        // 停止当前播放
        this.stop();

        const ctx = this.getAudioCtx();

        this.sourceNode = ctx.createBufferSource();
        this.sourceNode.buffer = audioBuffer;
        this.sourceNode.loop = true;

        // 创建滤波器
        this.filterNode = ctx.createBiquadFilter();
        this.filterNode.type = noiseType.filterType || 'lowpass';
        this.filterNode.frequency.value = noiseType.filterFreq || 20000;
        this.filterNode.Q.value = noiseType.filterQ || 0.1;

        // 创建增益节点（用于音量控制和淡入淡出）
        this.gainNode = ctx.createGain();
        this.gainNode.gain.value = this.volume;

        // 连接音频节点
        this.sourceNode.connect(this.filterNode);
        this.filterNode.connect(this.gainNode);
        this.gainNode.connect(ctx.destination);

        // 淡入效果（避免爆音）
        this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.3);

        this.sourceNode.start();
        this.currentType = typeId;
        StorageAdapter.set(StorageKeys.WHITENOISE_TYPE, typeId);
        StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, 'true');
        this.isPlaying = true;

        // 无用户手势时（刷新后自动恢复）ctx 可能还是 suspended，兜底挂手势监听
        this.ensureRunning();

        return true;
    },

    // 暂停（淡出后停止）
    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, 'false');

        const ctx = this.getAudioCtx();
        if (this.gainNode) {
            this.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        }

        // 350ms 后完全停止
        if (this._fadeTimer) clearTimeout(this._fadeTimer);
        this._fadeTimer = setTimeout(() => {
            this._fadeTimer = null;
            if (!this.isPlaying) {
                this.stop();
            }
        }, 350);
    },

    // 停止播放
    stop() {
        // 清除淡出定时器（如果用户手动停止）
        if (this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = null;
        }
        if (this.sourceNode) {
            try { this.sourceNode.stop(); } catch(e) {}
            try { this.sourceNode.disconnect(); } catch(e) {}
            this.sourceNode = null;
        }
        if (this.filterNode) {
            try { this.filterNode.disconnect(); } catch(e) {}
            this.filterNode = null;
        }
        // 必须断开：gainNode 连着 ctx.destination，只把引用置 null 的话节点仍挂在
        // 音频图上，每播放一次就残留一个，切换音源频繁时会持续累积。
        if (this.gainNode) {
            try { this.gainNode.disconnect(); } catch(e) {}
            this.gainNode = null;
        }
        this.isPlaying = false;
        StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, 'false');
    },

    // 设置音量 (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.gainNode) {
            this.gainNode.gain.linearRampToValueAtTime(this.volume, this.getAudioCtx().currentTime + 0.1);
        }
    },

    // 获取当前音量
    getVolume() {
        return this.volume;
    },

    // 淡出并停止（用于定时器到期）
    fadeOut(durationSec = 2) {
        if (!this.isPlaying) return;

        const ctx = this.getAudioCtx();
        // 先撤掉可能待执行的旧淡出定时器（如 pause() 的 350ms 那个）。
        // 否则旧的仍会在中途触发 stop()，把旧定时器之后才开始的新播放一并停掉。
        if (this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = null;
        }
        if (this.gainNode) {
            this.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec);
        }

        this.isPlaying = false;
        StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, 'false');

        // 淡出完成后彻底停止
        this._fadeTimer = setTimeout(() => {
            this.stop();
            this._fadeTimer = null;
        }, durationSec * 1000 + 100);
    }
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NoisePlayer.init());
} else {
    NoisePlayer.init();
}

window.NoisePlayer = NoisePlayer;
