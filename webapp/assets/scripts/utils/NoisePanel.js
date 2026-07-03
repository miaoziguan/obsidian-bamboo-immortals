/**
 * NoisePanel - 白噪音面板UI管理
 * 负责面板DOM操作、事件绑定、状态更新
 */
export const NoisePanel = {
    panelEl: null,
    panelVisible: false,
    _keydownHandler: null,
    _outsideClickHandler: null,

    // 显示面板
    show() {
        if (!this.panelEl) {
            this.create();
        }
        this.panelEl.classList.add('active');
        this.panelVisible = true;

        // 注册 keydown 监听
        if (!this._keydownHandler) {
            this._keydownHandler = (e) => {
                if (e.key === 'Escape' && this.panelVisible) {
                    e.preventDefault();
                    this.hide();
                }
            };
        }
        document.addEventListener('keydown', this._keydownHandler);

        // 全量渲染面板
        this._rebuild();
    },

    // 隐藏面板
    hide() {
        if (this.panelEl) {
            this.panelEl.classList.remove('active');
        }
        this.panelVisible = false;

        // 移除 keydown 监听
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
    },

    // 切换面板显示/隐藏
    toggle() {
        if (this.panelVisible) {
            this.hide();
        } else {
            this.show();
        }
    },

    // 创建面板DOM
    create() {
        this.panelEl = document.createElement('div');
        this.panelEl.className = 'wn-panel';

        // 挂载到专用浮层容器，避免受父级 overflow/transform 影响
        // position: fixed 在 iframe 或 transform 祖先下可能定位异常
        // 改为：浮层(position:fixed) + 面板(position:absolute) 的双层结构
        let overlay = document.getElementById('bamboo-floating-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'bamboo-floating-overlay';
            overlay.className = 'bamboo-floating-overlay';
            document.body.appendChild(overlay);
        }
        overlay.appendChild(this.panelEl);

        // 阻止面板内点击事件冒泡
        this.panelEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 点击面板外部关闭
        this._outsideClickHandler = (e) => {
            if (this.panelVisible && this.panelEl && !this.panelEl.contains(e.target)) {
                this.hide();
            }
        };
        setTimeout(() => {
            document.addEventListener('click', this._outsideClickHandler);
        }, 10);

        // 初始渲染
        this._rebuild();
    },

    // 渲染面板HTML
    renderHTML() {
        const currentType = NoisePlayer.currentType;
        const isPlaying = NoisePlayer.isPlaying;
        const customNoises = WhiteNoiseManager.customNoises || [];

        // 内置音效
        const builtinItems = WhiteNoiseManager.NOISE_TYPES.map(t => {
            const isActive = currentType === t.id && isPlaying;
            return '<button class="wn-type-btn ' + (isActive ? 'active' : '') + '" data-type="' + t.id + '">' +
                '<span>' + t.name + '</span>' +
            '</button>';
        }).join('');
        const builtinSection = '<div class="wn-section">' +
            '<div class="wn-type-grid">' + builtinItems + '</div>' +
        '</div>';

        // 自定义板块
        const customItems = customNoises.map(t => {
            const isActive = currentType === t.id && isPlaying;
            return '<button class="wn-type-btn ' + (isActive ? 'active' : '') + '" data-type="' + t.id + '">' +
                '<span class="wn-btn-content">' +
                    '<span class="wn-btn-text">' + t.name + '</span>' +
                    '<span class="wn-btn-group">' +
                        '<span class="wn-rename-btn" data-rename="' + t.id + '" title="重命名">' +
                            LucideUtils.createIcon('edit', { size: 10 }) +
                        '</span>' +
                        '<span class="wn-delete-btn" data-delete="' + t.id + '">' +
                            LucideUtils.createIcon('trash', { size: 10 }) +
                        '</span>' +
                    '</span>' +
                '</span>' +
            '</button>';
        }).join('');

        const customSection = '<div class="wn-section">' +
            '<div class="wn-section-header">' +
                '<span>自定义</span>' +
                '<button class="wn-add-custom-btn" id="wnAddCustomBtn" title="添加自定义音源">' +
                    LucideUtils.createIcon('plus', { size: 12 }) +
                '</button>' +
            '</div>' +
            '<div class="wn-type-grid">' + customItems + '</div>' +
        '</div>';

        // 音量控制
        const volumeSection = '<div class="wn-section wn-volume-section">' +
            '<div class="wn-section-header">' +
                LucideUtils.createIcon('volume', { size: 12 }) +
                '<span>音量</span>' +
            '</div>' +
            '<div class="wn-volume-control">' +
                '<input type="range" class="wn-volume-slider" id="wnVolumeSlider" min="0" max="100" value="' + Math.round(NoisePlayer.getVolume() * 100) + '">' +
                '<span class="wn-volume-label" id="wnVolumeLabel">' + Math.round(NoisePlayer.getVolume() * 100) + '%</span>' +
            '</div>' +
        '</div>';

        // 定时停止
        const timerMinutes = WhiteNoiseManager.timerMinutes || 0;
        const timerText = timerMinutes > 0 ? this._formatTimerDisplay(WhiteNoiseManager.getTimerRemaining()) : '关闭';
        const timerSection = '<div class="wn-section wn-timer-section">' +
            '<div class="wn-section-header">' +
                LucideUtils.createIcon('clock', { size: 12 }) +
                '<span>定时</span>' +
            '</div>' +
            '<div class="wn-timer-control">' +
                '<button class="wn-timer-btn" id="wnTimerBtn" title="点击切换定时时长">' + timerText + '</button>' +
                '<button class="wn-timer-change-btn" id="wnTimerPrev" title="减少时长">−</button>' +
                '<button class="wn-timer-change-btn" id="wnTimerNext" title="增加时长">+</button>' +
            '</div>' +
        '</div>';

        return '<div class="wn-header">' +
            '<div class="wn-header-left">' +
                LucideUtils.createIcon('volume', { size: 16 }) +
                '<span>白噪音</span>' +
            '</div>' +
            '<button class="wn-close-btn" id="wnCloseBtn">' +
                LucideUtils.createIcon('x', { size: 14 }) +
            '</button>' +
        '</div>' +
        '<div class="wn-body">' +
            builtinSection +
            customSection +
            volumeSection +
            timerSection +
        '</div>';
    },

    // 更新面板UI（局部更新，避免全量重建DOM）
    updateUI() {
        if (!this.panelEl || !this.panelVisible) return;

        const currentType = NoisePlayer.currentType;
        const isPlaying = NoisePlayer.isPlaying;

        // 更新各按钮的 active 状态
        this.panelEl.querySelectorAll('.wn-type-btn[data-type]').forEach(btn => {
            const typeId = btn.dataset.type;
            const isActive = currentType === typeId && isPlaying;
            btn.classList.toggle('active', isActive);
        });
    },

    // 更新定时器UI（不重建整个面板）
    updateTimerUI() {
        const timerBtn = this.panelEl && this.panelEl.querySelector('#wnTimerBtn');
        if (!timerBtn) {
            // 面板未渲染或按钮不存在，全量重建
            if (this.panelEl) this._rebuild();
            return;
        }

        const timerMinutes = WhiteNoiseManager.timerMinutes || 0;
        if (timerMinutes > 0) {
            const remaining = WhiteNoiseManager.getTimerRemaining();
            timerBtn.textContent = this._formatTimerDisplay(remaining);
            timerBtn.classList.add('wn-timer-active');
        } else {
            timerBtn.textContent = '关闭';
            timerBtn.classList.remove('wn-timer-active');
        }
    },

    // 格式化倒计时显示 (mm:ss)
    _formatTimerDisplay(totalSec) {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return m + ':' + String(s).padStart(2, '0');
    },

    // 全量重建面板（仅在列表数据变化时调用）
    _rebuild() {
        if (!this.panelEl) return;
        this.panelEl.innerHTML = this.renderHTML();
        this._bindEvents();
    },

    // 绑定面板事件
    _bindEvents() {
        if (!this.panelEl) return;

        // 音效按钮点击
        this.panelEl.querySelectorAll('.wn-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 重命名按钮
                const renameBtn = e.target.closest('.wn-rename-btn');
                if (renameBtn) {
                    e.stopPropagation();
                    WhiteNoiseManager.renameCustomNoise(renameBtn.dataset.rename);
                    return;
                }
                // 删除按钮
                const deleteBtn = e.target.closest('.wn-delete-btn');
                if (deleteBtn) {
                    e.stopPropagation();
                    WhiteNoiseManager.removeCustomNoise(deleteBtn.dataset.delete);
                    return;
                }

                // 播放/暂停切换
                const typeId = btn.dataset.type;
                if (NoisePlayer.isPlaying && NoisePlayer.currentType === typeId) {
                    WhiteNoiseManager.pause();
                } else {
                    WhiteNoiseManager.play(typeId);
                }
            });
        });

        // 添加自定义音源按钮
        const addBtn = this.panelEl.querySelector('#wnAddCustomBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => WhiteNoiseManager.addCustomNoise());
        }

        // 关闭按钮
        const closeBtn = this.panelEl.querySelector('#wnCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // 音量滑块
        const volumeSlider = this.panelEl.querySelector('#wnVolumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const vol = parseInt(e.target.value) / 100;
                NoisePlayer.setVolume(vol);
                const label = this.panelEl.querySelector('#wnVolumeLabel');
                if (label) label.textContent = Math.round(vol * 100) + '%';
            });
        }

        // 定时器按钮：点击切换时长
        const timerBtn = this.panelEl.querySelector('#wnTimerBtn');
        if (timerBtn) {
            timerBtn.addEventListener('click', () => {
                const opts = WhiteNoiseManager.TIMER_OPTIONS;
                const curr = WhiteNoiseManager.timerMinutes || 0;
                const idx = opts.indexOf(curr);
                const next = opts[(idx + 1) % opts.length];
                WhiteNoiseManager.setTimer(next);
            });
        }

        // 定时时长微调
        const timerPrev = this.panelEl.querySelector('#wnTimerPrev');
        const timerNext = this.panelEl.querySelector('#wnTimerNext');
        if (timerPrev) {
            timerPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                const curr = WhiteNoiseManager.timerMinutes || 15;
                const step = curr >= 30 ? 15 : 5;
                WhiteNoiseManager.setTimer(Math.max(5, curr - step));
            });
        }
        if (timerNext) {
            timerNext.addEventListener('click', (e) => {
                e.stopPropagation();
                const curr = WhiteNoiseManager.timerMinutes || 0;
                const step = curr >= 30 ? 15 : 5;
                WhiteNoiseManager.setTimer(Math.min(120, curr + step));
            });
        }
    }
};

window.NoisePanel = NoisePanel;
