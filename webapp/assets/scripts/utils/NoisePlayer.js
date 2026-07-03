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
            this.audioCtx.resume();
        }
        return this.audioCtx;
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
            this.sourceNode = null;
        }
        if (this.filterNode) {
            try { this.filterNode.disconnect(); } catch(e) {}
            this.filterNode = null;
        }
        this.gainNode = null;
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
