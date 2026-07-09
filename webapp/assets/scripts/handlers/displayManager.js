import { byId, $, modalMount, eventInTargets, getCssVarRoot, getGlobalComputedStyle } from '../utils/domRef.js';
/**
 * DisplayManager — 显示设置管理器
 *
 * 职责：
 * 1. 管理内容区宽度（滑块 + 预设按钮）
 * 2. 未来扩展：字号调节、内容密度/间距
 * 3. 通过 storageManager 持久化到 Vault settings.json
 * 4. 通过 CSS 自定义属性实现即时预览
 *
 * 宽度范围：400px — 100%（全屏）
 * 预设档位：窄(600px) / 标准(800px) / 宽(1100px) / 全屏(100%)
 */
export const DisplayManager = {
    _initialized: false,
    _panelEl: null,
    _sliderEl: null,
    _valueLabelEl: null,
    _fontSliderEl: null,
    _fontValueLabelEl: null,
    _gapSliderEl: null,
    _gapValueLabelEl: null,
    _hueSliderEl: null,
    _hueValueLabelEl: null,
    _lightnessSliderEl: null,
    _lightnessValueLabelEl: null,
    _saveTimer: null,
    _transitionTimer: null,

    /* ===== 预设档位 ===== */
    PRESETS: [
        { label: '窄',   value: 600,  title: '专注写作' },
        { label: '标准', value: 800,  title: '日常复盘' },
        { label: '宽',   value: 1200, title: '数据视图' },
    ],

    /* ===== 字号预设档位 ===== */
    FONT_PRESETS: [
        { label: '小',   value: 0.85, title: '紧凑阅读' },
        { label: '标准', value: 1.0,  title: '默认字号' },
        { label: '大',   value: 1.15, title: '舒适阅读' },
        { label: '特大', value: 1.3,  title: '无障碍' },
    ],

    /* ===== 字号滑块范围 ===== */
    FONT_MIN: 0.7,
    FONT_MAX: 1.6,
    DEFAULT_FONT_SCALE: 1.0,

    /* ===== 板块间距预设档位 ===== */
    GAP_PRESETS: [
        { label: '紧凑', value: 0.5, title: '信息密集' },
        { label: '标准', value: 0.8, title: '默认间距' },
        { label: '宽松', value: 1.2, title: '呼吸感强' },
        { label: '开阔', value: 1.6, title: '极宽松' },
    ],

    /* ===== 板块间距滑块范围 ===== */
    GAP_MIN: 0.2,
    GAP_MAX: 2.0,
    DEFAULT_GAP_SCALE: 0.8,

    /* ===== 滑块范围 ===== */
    MIN_WIDTH: 400,
    MAX_WIDTH: 1600,   // 滑块上限，实际值可超过此值用全屏
    DEFAULT_WIDTH: 800,

    /* ===== 色相调节 ===== */
    HUE_MIN: 0,
    HUE_MAX: 360,
    DEFAULT_HUE: 120,  // 竹青绿

    HUE_PRESETS: [
        { label: '嫩绿', value: 90,  title: '春芽嫩绿' },
        { label: '竹青', value: 120, title: '竹林清韵（默认）' },
        { label: '松花', value: 140, title: '松花绿' },
        { label: '碧色', value: 160, title: '碧色如玉' },
        { label: '青碧', value: 180, title: '青碧天光' },
    ],

    /* ===== 明度调节 ===== */
    LIGHTNESS_MIN: -15,
    LIGHTNESS_MAX: 15,
    DEFAULT_LIGHTNESS: 0,

    LIGHTNESS_PRESETS: [
        { label: '暗沉', value: -12, title: '深色质感' },
        { label: '柔和', value: -5,  title: '柔光氛围' },
        { label: '默认', value: 0,   title: '标准明度' },
        { label: '明亮', value: 8,   title: '清新亮丽' },
    ],

    /* HSL → RGB 转换辅助函数 */
    _hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)].join(', ');
    },

    /* ===== 初始化 ===== */
    async init() {
        if (this._initialized) return;
        this._initialized = true;

        // 从 Vault 设置中恢复
        await this._loadAndApply();

        // 构建面板 DOM
        this._buildPanel();

        // 绑定事件
        this._bindEvents();
    },

    /* ===== 加载并应用设置 ===== */
    async _loadAndApply() {
        try {
            const savedWidth = await storageManager.getSetting('displayWidth');
            if (savedWidth !== null && savedWidth !== undefined) {
                const val = Number(savedWidth);
                if (!isNaN(val) && val >= this.MIN_WIDTH && val <= 9999) {
                    this._applyWidth(val, false);
                }
            }
        } catch (e) {
            console.warn('[DisplayManager] Failed to load width setting:', e.message);
        }

        try {
            const savedFont = await storageManager.getSetting('displayFontScale');
            if (savedFont !== null && savedFont !== undefined) {
                const val = Number(savedFont);
                if (!isNaN(val) && val >= this.FONT_MIN && val <= this.FONT_MAX) {
                    this._applyFontScale(val, false);
                }
            }
        } catch (e) {
            console.warn('[DisplayManager] Failed to load font scale setting:', e.message);
        }

        try {
            const savedGap = await storageManager.getSetting('displayGapScale');
            if (savedGap !== null && savedGap !== undefined) {
                const val = Number(savedGap);
                if (!isNaN(val) && val >= this.GAP_MIN && val <= this.GAP_MAX) {
                    this._applyGapScale(val, false);
                }
            }
        } catch (e) {
            console.warn('[DisplayManager] Failed to load gap scale setting:', e.message);
        }

        try {
            const savedHue = await storageManager.getSetting('displayHue');
            const hue = (savedHue !== null && savedHue !== undefined) ? Number(savedHue) : this.DEFAULT_HUE;
            if (!isNaN(hue) && hue >= this.HUE_MIN && hue <= this.HUE_MAX) {
                this._applyHue(hue);
            } else {
                this._applyHue(this.DEFAULT_HUE);
            }
        } catch (e) {
            console.warn('[DisplayManager] Failed to load hue setting:', e.message);
            this._applyHue(this.DEFAULT_HUE);
        }

        try {
            const savedLightness = await storageManager.getSetting('displayLightness');
            const lightness = (savedLightness !== null && savedLightness !== undefined) ? Number(savedLightness) : this.DEFAULT_LIGHTNESS;
            if (!isNaN(lightness) && lightness >= this.LIGHTNESS_MIN && lightness <= this.LIGHTNESS_MAX) {
                this._applyLightness(lightness);
            } else {
                this._applyLightness(this.DEFAULT_LIGHTNESS);
            }
        } catch (e) {
            console.warn('[DisplayManager] Failed to load lightness setting:', e.message);
            this._applyLightness(this.DEFAULT_LIGHTNESS);
        }
    },

    /* ===== 应用宽度到 CSS ===== */
    _applyWidth(value, animate) {
        const root = getCssVarRoot();
        const container = byId('reviewContainer');
        const mainContainer = byId('main-container');

        if (!container) return;

        // 添加过渡类（用于动画）
        if (animate) {
            container.classList.add('display-transition');
            clearTimeout(this._transitionTimer);
            this._transitionTimer = setTimeout(() => {
                container.classList.remove('display-transition');
            }, 300);
        }

        if (value === 0) {
            // 兼容旧数据：如果存储了 0（全屏），回退到默认宽度
            value = this.DEFAULT_WIDTH;
        }

        // 具体像素值
        root.style.setProperty('--content-max-width', value + 'px');
        root.style.setProperty('--content-max-width-wide', value + 'px');
        container.classList.remove('display-fullscreen');
        if (mainContainer) mainContainer.classList.remove('display-fullscreen');

        // 紧凑模式：容器变窄时触发票/票根的堆叠布局
        const effectiveWidth = value;
        container.classList.toggle('display-compact', effectiveWidth <= 600);
        container.classList.toggle('display-ultra-compact', effectiveWidth <= 480);

        // ===== 基于内容宽度的响应式类 =====
        container.classList.remove(
            'rw-620', 'rw-520', 'rw-460', 'rw-420', 'rw-360'
        );
        if (value <= 620) container.classList.add('rw-620');
        if (value <= 520) container.classList.add('rw-520');
        if (value <= 460) container.classList.add('rw-460');
        if (value <= 420) container.classList.add('rw-420');
        if (value <= 360) container.classList.add('rw-360');

        // 同步滑块和标签
        this._syncUI(value);
    },

    /* ===== 同步面板 UI 状态 ===== */
    _syncUI(value) {
        if (this._sliderEl) {
            this._sliderEl.value = Math.min(value, this.MAX_WIDTH);
        }

        if (this._valueLabelEl) {
            this._valueLabelEl.textContent = value + 'px';
        }

        // 高亮匹配的预设按钮
        if (this._panelEl) {
            const presetBtns = this._panelEl.querySelectorAll('.display-preset-btn');
            presetBtns.forEach(btn => {
                const pv = Number(btn.dataset.value);
                btn.classList.toggle('active', pv === value);
            });
        }
    },

    /* ===== 应用字号缩放到 CSS ===== */
    _applyFontScale(scale, animate) {
        const root = getCssVarRoot();
        const container = byId('reviewContainer');
        if (!root) return;

        if (animate && container) {
            container.classList.add('display-transition');
            clearTimeout(this._fontTransitionTimer);
            this._fontTransitionTimer = setTimeout(() => {
                container.classList.remove('display-transition');
            }, 300);
        }

        root.style.setProperty('--font-size-scale', scale);
        this._syncFontUI(scale);
    },

    /* ===== 同步字号面板 UI 状态 ===== */
    _syncFontUI(scale) {
        if (this._fontSliderEl) {
            this._fontSliderEl.value = scale;
        }
        if (this._fontValueLabelEl) {
            this._fontValueLabelEl.textContent = Math.round(scale * 100) + '%';
        }
        if (this._panelEl) {
            const fontPresetBtns = this._panelEl.querySelectorAll('.display-font-preset-btn');
            fontPresetBtns.forEach(btn => {
                const pv = Number(btn.dataset.value);
                btn.classList.toggle('active', Math.abs(pv - scale) < 0.001);
            });
        }
    },

    /* ===== 应用板块间距缩放到 CSS ===== */
    _applyGapScale(scale, animate) {
        const root = getCssVarRoot();
        const container = byId('reviewContainer');
        if (!root) return;

        if (animate && container) {
            container.classList.add('display-transition');
            clearTimeout(this._gapTransitionTimer);
            this._gapTransitionTimer = setTimeout(() => {
                container.classList.remove('display-transition');
            }, 300);
        }

        root.style.setProperty('--section-gap-scale', scale);
        this._syncGapUI(scale);
    },

    /* ===== 同步板块间距面板 UI 状态 ===== */
    _syncGapUI(scale) {
        if (this._gapSliderEl) {
            this._gapSliderEl.value = scale;
        }
        if (this._gapValueLabelEl) {
            this._gapValueLabelEl.textContent = Math.round(scale * 100) + '%';
        }
        if (this._panelEl) {
            const gapPresetBtns = this._panelEl.querySelectorAll('.display-gap-preset-btn');
            gapPresetBtns.forEach(btn => {
                const pv = Number(btn.dataset.value);
                btn.classList.toggle('active', Math.abs(pv - scale) < 0.001);
            });
        }
    },

    /* ===== 持久化（防抖） ===== */
    _scheduleSave(value) {
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(async () => {
            try {
                await storageManager.putSetting('displayWidth', value);
            } catch (e) {
                console.warn('[DisplayManager] Failed to save setting:', e.message);
            }
        }, 500);
    },

    _scheduleSaveFont(value) {
        clearTimeout(this._fontSaveTimer);
        this._fontSaveTimer = setTimeout(async () => {
            try {
                await storageManager.putSetting('displayFontScale', value);
            } catch (e) {
                console.warn('[DisplayManager] Failed to save font setting:', e.message);
            }
        }, 500);
    },

    _scheduleSaveGap(value) {
        clearTimeout(this._gapSaveTimer);
        this._gapSaveTimer = setTimeout(async () => {
            try {
                await storageManager.putSetting('displayGapScale', value);
            } catch (e) {
                console.warn('[DisplayManager] Failed to save gap setting:', e.message);
            }
        }, 500);
    },

    _scheduleSaveHue(value) {
        clearTimeout(this._hueSaveTimer);
        this._hueSaveTimer = setTimeout(async () => {
            try {
                await storageManager.putSetting('displayHue', value);
            } catch (e) {
                console.warn('[DisplayManager] Failed to save hue setting:', e.message);
            }
        }, 500);
    },

    _scheduleSaveLightness(value) {
        clearTimeout(this._lightnessSaveTimer);
        this._lightnessSaveTimer = setTimeout(async () => {
            try {
                await storageManager.putSetting('displayLightness', value);
            } catch (e) {
                console.warn('[DisplayManager] Failed to save lightness setting:', e.message);
            }
        }, 500);
    },

    /* ===== 应用明度 ===== */
    _applyLightness(val) {
        const root = getCssVarRoot();
        if (!root) return;
        root.style.setProperty('--accent-lightness-offset', val + '%');
        this._syncLightnessUI(val);
        this._maybeSyncPalette();
    },

    /**
     * 如果开启了"将调色同步到 Obsidian"，则向父窗口发送当前调色值
     */
    _maybeSyncPalette() {
        if (typeof storageManager === 'undefined' || !storageManager.syncPaletteToObsidian) return;
        // 读取当前调色值（从生效根的计算样式，保证准确性）
        const cs = getGlobalComputedStyle();
        const hue = parseInt(cs.getPropertyValue('--accent-hue').trim()) || this.DEFAULT_HUE;
        const offsetStr = cs.getPropertyValue('--accent-lightness-offset').trim();
        const lightnessOffset = parseInt(offsetStr) || 0;
        const isDark = document.documentElement.classList.contains('dark');
        try {
            window.parent.postMessage({
                type: 'theme:syncPalette',
                id: 'dm_' + Date.now(),
                payload: { hue, lightnessOffset, isDark }
            }, '*');
        } catch (e) {
            // 跨域静默
        }
    },

    _syncLightnessUI(val) {
        if (this._lightnessSliderEl) {
            this._lightnessSliderEl.value = val;
        }
        if (this._lightnessValueLabelEl) {
            this._lightnessValueLabelEl.textContent = (val >= 0 ? '+' : '') + val + '%';
        }
        if (this._panelEl) {
            const btns = this._panelEl.querySelectorAll('.display-lightness-preset-btn');
            btns.forEach(btn => {
                const pv = Number(btn.dataset.value);
                btn.classList.toggle('active', pv === val);
            });
        }
    },

    /* ===== 应用色相 ===== */
    _applyHue(hue) {
        const root = getCssVarRoot();
        if (!root) return;

        root.style.setProperty('--accent-hue', hue);

        this._maybeSyncPalette();

        // 同步更新所有绿色系 RGB 变量（用于 rgba() 半透明色）
        // 竹青绿主色 hsl(hue, 27%, 48%) → #5A9A5A
        const primaryRgb = this._hslToRgb(hue, 27, 48);
        root.style.setProperty('--primary-rgb', primaryRgb);

        // 竹青深色 hsl(hue-7, 40%, 25%) → #2D5A27
        const deepRgb = this._hslToRgb(hue - 7, 40, 25);
        root.style.setProperty('--deep-rgb', deepRgb);
        root.style.setProperty('--bamboo-deep-rgb', deepRgb);  // 票面文案 RGB 变量

        // 竹青浅色 hsl(hue, 35%, 75%) → #A8D5A8
        const paleRgb = this._hslToRgb(hue, 35, 75);
        root.style.setProperty('--pale-rgb', paleRgb);

        // 票根背景 hsl(hue, 36%, 68%) → #94C694
        const ticketStubRgb = this._hslToRgb(hue, 36, 68);
        root.style.setProperty('--ticket-stub-bg-rgb', ticketStubRgb);

        // 主色变体 hsl(hue, 28%, 55%) → #6BAE6B
        const primaryAltRgb = this._hslToRgb(hue, 28, 55);
        root.style.setProperty('--primary-alt-rgb', primaryAltRgb);

        // 浅绿 hsl(hue, 27%, 83%) → #C8E0C8
        const greenPaleRgb = this._hslToRgb(hue, 27, 83);
        root.style.setProperty('--green-pale-rgb', greenPaleRgb);

        // 亮绿 hsl(hue, 47%, 70%) → #8FD88F
        const greenBrightRgb = this._hslToRgb(hue, 47, 70);
        root.style.setProperty('--green-bright-rgb', greenBrightRgb);

        // 次绿 hsl-16, 44%, 75% → #B4DCA5 (hue 偏移较大，保留偏移)
        const greenAltRgb = this._hslToRgb(hue - 16, 44, 75);
        root.style.setProperty('--green-alt-rgb', greenAltRgb);

        // 极亮绿 hsl(hue, 72%, 79%) → #C8FF96
        const greenVeryBrightRgb = this._hslToRgb(hue, 72, 79);
        root.style.setProperty('--green-very-bright-rgb', greenVeryBrightRgb);

        // 暗色模式表面色（卡片、面板背景等）
        // 暗色表面 hsl(hue, 18%, 10%) → 极暗的色调基底
        const surfaceDarkRgb = this._hslToRgb(hue, 18, 10);
        root.style.setProperty('--surface-dark-rgb', surfaceDarkRgb);
        // 暗色表面中调 hsl(hue, 18%, 13%)
        const surfaceDarkMidRgb = this._hslToRgb(hue, 18, 13);
        root.style.setProperty('--surface-dark-rgb-mid', surfaceDarkMidRgb);
        // 暗色表面亮调 hsl(hue, 18%, 16%)
        const surfaceDarkEndRgb = this._hslToRgb(hue, 18, 16);
        root.style.setProperty('--surface-dark-rgb-end', surfaceDarkEndRgb);
        // 更深的暗色表面 hsl(hue, 14%, 8%)
        const surfaceDeepRgb = this._hslToRgb(hue, 14, 8);
        root.style.setProperty('--surface-deep-rgb', surfaceDeepRgb);
        const surfaceDeepAltRgb = this._hslToRgb(hue, 17, 10);
        root.style.setProperty('--surface-deep-alt-rgb', surfaceDeepAltRgb);

        // 暗色模式淡绿基底（表面色）hsl(hue, 18%, 10%)
        const paleGreenRgbDark = this._hslToRgb(hue, 18, 10);
        root.style.setProperty('--pale-green-rgb-dark', paleGreenRgbDark);
        // 暗色模式淡绿变体 hsl(hue, 18%, 13%)
        const paleGreenAltRgbDark = this._hslToRgb(hue, 18, 13);
        root.style.setProperty('--pale-green-alt-rgb-dark', paleGreenAltRgbDark);

        this._syncHueUI(hue);
    },

    _syncHueUI(hue) {
        if (this._hueSliderEl) {
            this._hueSliderEl.value = hue;
        }
        if (this._hueValueLabelEl) {
            this._hueValueLabelEl.textContent = hue + '°';
        }
        if (this._panelEl) {
            const huePresetBtns = this._panelEl.querySelectorAll('.display-hue-preset-btn');
            huePresetBtns.forEach(btn => {
                const pv = Number(btn.dataset.value);
                btn.classList.toggle('active', pv === hue);
            });
        }
    },

    /* ===== 构建面板 DOM ===== */
    _buildPanel() {
        const panel = document.createElement('div');
        panel.className = 'display-panel';
        panel.id = 'displayPanel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', '显示设置');
        panel.hidden = true;

        // 标题行
        const header = document.createElement('div');
        header.className = 'display-panel-header';
        header.innerHTML = `
            <span class="display-panel-title">显示设置</span>
            <button class="display-panel-close" aria-label="关闭" title="关闭">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
        panel.appendChild(header);

        // 宽度控制区
        const widthSection = document.createElement('div');
        widthSection.className = 'display-section';

        const widthLabel = document.createElement('div');
        widthLabel.className = 'display-section-label';
        widthLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3"/><path d="M21 3v4"/><path d="M3 3v4"/><path d="M21 21H3"/><path d="M21 21v-4"/><path d="M3 21v-4"/><path d="M12 3v18"/></svg>
            <span>内容宽度</span>
        `;
        widthSection.appendChild(widthLabel);

        // 滑块行
        const sliderRow = document.createElement('div');
        sliderRow.className = 'display-slider-row';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'display-slider';
        slider.min = this.MIN_WIDTH;
        slider.max = this.MAX_WIDTH;
        slider.step = 20;
        slider.value = this.DEFAULT_WIDTH;
        slider.setAttribute('aria-label', '内容宽度');
        this._sliderEl = slider;

        const valueLabel = document.createElement('span');
        valueLabel.className = 'display-value-label';
        valueLabel.textContent = this.DEFAULT_WIDTH + 'px';
        this._valueLabelEl = valueLabel;

        sliderRow.appendChild(slider);
        sliderRow.appendChild(valueLabel);
        widthSection.appendChild(sliderRow);

        // 预设按钮行
        const presetRow = document.createElement('div');
        presetRow.className = 'display-preset-row';

        this.PRESETS.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'display-preset-btn';
            btn.dataset.value = preset.value;
            btn.title = preset.title;
            btn.textContent = preset.label;
            btn.setAttribute('aria-label', `${preset.label} (${preset.title})`);
            presetRow.appendChild(btn);
        });

        widthSection.appendChild(presetRow);
        panel.appendChild(widthSection);

        // 字号控制区
        const fontSection = document.createElement('div');
        fontSection.className = 'display-section';

        const fontLabel = document.createElement('div');
        fontLabel.className = 'display-section-label';
        fontLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
            <span>字号</span>
        `;
        fontSection.appendChild(fontLabel);

        // 字号滑块行
        const fontSliderRow = document.createElement('div');
        fontSliderRow.className = 'display-slider-row';

        const fontSlider = document.createElement('input');
        fontSlider.type = 'range';
        fontSlider.className = 'display-slider';
        fontSlider.min = this.FONT_MIN;
        fontSlider.max = this.FONT_MAX;
        fontSlider.step = 0.05;
        fontSlider.value = this.DEFAULT_FONT_SCALE;
        fontSlider.setAttribute('aria-label', '字号');
        this._fontSliderEl = fontSlider;

        const fontValueLabel = document.createElement('span');
        fontValueLabel.className = 'display-value-label';
        fontValueLabel.textContent = Math.round(this.DEFAULT_FONT_SCALE * 100) + '%';
        this._fontValueLabelEl = fontValueLabel;

        fontSliderRow.appendChild(fontSlider);
        fontSliderRow.appendChild(fontValueLabel);
        fontSection.appendChild(fontSliderRow);

        // 字号预设按钮行
        const fontPresetRow = document.createElement('div');
        fontPresetRow.className = 'display-preset-row';

        this.FONT_PRESETS.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'display-font-preset-btn';
            btn.dataset.value = preset.value;
            btn.title = preset.title;
            btn.textContent = preset.label;
            btn.setAttribute('aria-label', `${preset.label} (${preset.title})`);
            fontPresetRow.appendChild(btn);
        });

        fontSection.appendChild(fontPresetRow);
        panel.appendChild(fontSection);

        // 板块间距控制区
        const gapSection = document.createElement('div');
        gapSection.className = 'display-section';

        const gapLabel = document.createElement('div');
        gapLabel.className = 'display-section-label';
        gapLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6H3"/><path d="M21 12H3"/><path d="M21 18H3"/></svg>
            <span>板块间距</span>
        `;
        gapSection.appendChild(gapLabel);

        // 板块间距滑块行
        const gapSliderRow = document.createElement('div');
        gapSliderRow.className = 'display-slider-row';

        const gapSlider = document.createElement('input');
        gapSlider.type = 'range';
        gapSlider.className = 'display-slider';
        gapSlider.min = this.GAP_MIN;
        gapSlider.max = this.GAP_MAX;
        gapSlider.step = 0.1;
        gapSlider.value = this.DEFAULT_GAP_SCALE;
        gapSlider.setAttribute('aria-label', '板块间距');
        this._gapSliderEl = gapSlider;

        const gapValueLabel = document.createElement('span');
        gapValueLabel.className = 'display-value-label';
        gapValueLabel.textContent = Math.round(this.DEFAULT_GAP_SCALE * 100) + '%';
        this._gapValueLabelEl = gapValueLabel;

        gapSliderRow.appendChild(gapSlider);
        gapSliderRow.appendChild(gapValueLabel);
        gapSection.appendChild(gapSliderRow);

        // 板块间距预设按钮行
        const gapPresetRow = document.createElement('div');
        gapPresetRow.className = 'display-preset-row';

        this.GAP_PRESETS.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'display-gap-preset-btn';
            btn.dataset.value = preset.value;
            btn.title = preset.title;
            btn.textContent = preset.label;
            btn.setAttribute('aria-label', `${preset.label} (${preset.title})`);
            gapPresetRow.appendChild(btn);
        });

        gapSection.appendChild(gapPresetRow);
        panel.appendChild(gapSection);

        // ======== 色相调节区 ========
        const hueSection = document.createElement('div');
        hueSection.className = 'display-section';

        const hueLabel = document.createElement('div');
        hueLabel.className = 'display-section-label';
        hueLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <span>主题色相</span>
        `;
        hueSection.appendChild(hueLabel);

        // 色相滑块行
        const hueSliderRow = document.createElement('div');
        hueSliderRow.className = 'display-slider-row';

        const hueSlider = document.createElement('input');
        hueSlider.type = 'range';
        hueSlider.className = 'display-slider display-hue-slider';
        hueSlider.min = this.HUE_MIN;
        hueSlider.max = this.HUE_MAX;
        hueSlider.step = 1;
        hueSlider.value = this.DEFAULT_HUE;
        hueSlider.setAttribute('aria-label', '主题色相');
        this._hueSliderEl = hueSlider;

        const hueValueLabel = document.createElement('span');
        hueValueLabel.className = 'display-value-label';
        hueValueLabel.textContent = this.DEFAULT_HUE + '\u00B0';
        this._hueValueLabelEl = hueValueLabel;

        hueSliderRow.appendChild(hueSlider);
        hueSliderRow.appendChild(hueValueLabel);
        hueSection.appendChild(hueSliderRow);

        // 色相预设按钮行
        const huePresetRow = document.createElement('div');
        huePresetRow.className = 'display-preset-row';

        this.HUE_PRESETS.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'display-hue-preset-btn';
            btn.dataset.value = preset.value;
            btn.title = preset.title;
            btn.textContent = preset.label;
            btn.setAttribute('aria-label', `${preset.label} (${preset.title})`);
            huePresetRow.appendChild(btn);
        });

        hueSection.appendChild(huePresetRow);

        // 重置按钮
        const resetBtn = document.createElement('button');
        resetBtn.className = 'display-hue-reset-btn';
        resetBtn.textContent = '恢复默认';
        resetBtn.title = '恢复到默认竹青绿色';
        resetBtn.setAttribute('aria-label', '恢复默认主题色相');
        hueSection.appendChild(resetBtn);

        panel.appendChild(hueSection);

        // ======== 明度调节区 ========
        const lightnessSection = document.createElement('div');
        lightnessSection.className = 'display-section';

        const lightnessLabel = document.createElement('div');
        lightnessLabel.className = 'display-section-label';
        lightnessLabel.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <span>明度</span>
        `;
        lightnessSection.appendChild(lightnessLabel);

        const lightnessSliderRow = document.createElement('div');
        lightnessSliderRow.className = 'display-slider-row';

        const lightnessSlider = document.createElement('input');
        lightnessSlider.type = 'range';
        lightnessSlider.className = 'display-slider';
        lightnessSlider.min = this.LIGHTNESS_MIN;
        lightnessSlider.max = this.LIGHTNESS_MAX;
        lightnessSlider.step = 1;
        lightnessSlider.value = this.DEFAULT_LIGHTNESS;
        lightnessSlider.setAttribute('aria-label', '明度');
        this._lightnessSliderEl = lightnessSlider;

        const lightnessValueLabel = document.createElement('span');
        lightnessValueLabel.className = 'display-value-label';
        lightnessValueLabel.textContent = this.DEFAULT_LIGHTNESS >= 0 ? '+' + this.DEFAULT_LIGHTNESS + '%' : this.DEFAULT_LIGHTNESS + '%';
        this._lightnessValueLabelEl = lightnessValueLabel;

        lightnessSliderRow.appendChild(lightnessSlider);
        lightnessSliderRow.appendChild(lightnessValueLabel);
        lightnessSection.appendChild(lightnessSliderRow);

        const lightnessPresetRow = document.createElement('div');
        lightnessPresetRow.className = 'display-preset-row';

        this.LIGHTNESS_PRESETS.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'display-lightness-preset-btn';
            btn.dataset.value = preset.value;
            btn.title = preset.title;
            btn.textContent = preset.label;
            btn.setAttribute('aria-label', preset.title);
            lightnessPresetRow.appendChild(btn);
        });

        lightnessSection.appendChild(lightnessPresetRow);
        panel.appendChild(lightnessSection);

        // 挂载到 body
        modalMount().appendChild(panel);
        this._panelEl = panel;
    },

    /* ===== 绑定事件 ===== */
    _bindEvents() {
        if (!this._panelEl) return;

        // 关闭按钮
        const closeBtn = this._panelEl.querySelector('.display-panel-close');
        closeBtn.addEventListener('click', () => this.close());

        // 滑块 input 事件（实时预览）
        this._sliderEl.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            this._applyWidth(val, false);
        });

        // 滑块 change 事件（松手持久化）
        this._sliderEl.addEventListener('change', (e) => {
            const val = Number(e.target.value);
            this._scheduleSave(val);
        });

        // 预设按钮
        const presetBtns = this._panelEl.querySelectorAll('.display-preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = Number(btn.dataset.value);
                this._applyWidth(val, true);
                this._scheduleSave(val);
            });
        });

        // 字号滑块 input 事件（实时预览）
        if (this._fontSliderEl) {
            this._fontSliderEl.addEventListener('input', (e) => {
                const val = Number(e.target.value);
                this._applyFontScale(val, false);
            });

            // 字号滑块 change 事件（松手持久化）
            this._fontSliderEl.addEventListener('change', (e) => {
                const val = Number(e.target.value);
                this._scheduleSaveFont(val);
            });
        }

        // 字号预设按钮
        const fontPresetBtns = this._panelEl.querySelectorAll('.display-font-preset-btn');
        fontPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = Number(btn.dataset.value);
                this._applyFontScale(val, true);
                this._scheduleSaveFont(val);
            });
        });

        // 板块间距滑块 input 事件（实时预览）
        if (this._gapSliderEl) {
            this._gapSliderEl.addEventListener('input', (e) => {
                const val = Number(e.target.value);
                this._applyGapScale(val, false);
            });

            // 板块间距滑块 change 事件（松手持久化）
            this._gapSliderEl.addEventListener('change', (e) => {
                const val = Number(e.target.value);
                this._scheduleSaveGap(val);
            });
        }

        // 板块间距预设按钮
        const gapPresetBtns = this._panelEl.querySelectorAll('.display-gap-preset-btn');
        gapPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = Number(btn.dataset.value);
                this._applyGapScale(val, true);
                this._scheduleSaveGap(val);
            });
        });

        // 色相滑块 input 事件（实时预览）
        if (this._hueSliderEl) {
            this._hueSliderEl.addEventListener('input', (e) => {
                const val = Number(e.target.value);
                this._applyHue(val);
            });

            // 色相滑块 change 事件（松手持久化）
            this._hueSliderEl.addEventListener('change', (e) => {
                const val = Number(e.target.value);
                this._scheduleSaveHue(val);
            });
        }

        // 色相预设按钮
        const huePresetBtns = this._panelEl.querySelectorAll('.display-hue-preset-btn');
        huePresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = Number(btn.dataset.value);
                this._applyHue(val);
                this._scheduleSaveHue(val);
            });
        });

        // 重置默认色相按钮
        const hueResetBtn = this._panelEl.querySelector('.display-hue-reset-btn');
        if (hueResetBtn) {
            hueResetBtn.addEventListener('click', () => {
                this._applyHue(this.DEFAULT_HUE);
                this._scheduleSaveHue(this.DEFAULT_HUE);
            });
        }

        // 明度滑块 input 事件（实时预览）
        if (this._lightnessSliderEl) {
            this._lightnessSliderEl.addEventListener('input', (e) => {
                const val = Number(e.target.value);
                this._applyLightness(val);
            });

            this._lightnessSliderEl.addEventListener('change', (e) => {
                const val = Number(e.target.value);
                this._scheduleSaveLightness(val);
            });
        }

        // 明度预设按钮
        const lightnessPresetBtns = this._panelEl.querySelectorAll('.display-lightness-preset-btn');
        lightnessPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = Number(btn.dataset.value);
                this._applyLightness(val);
                this._scheduleSaveLightness(val);
            });
        });

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            }
        });

        // 点击面板外关闭
        document.addEventListener('click', (e) => {
            if (!this.isOpen()) return;
            const panel = this._panelEl;
            const fabContainer = $('.fab-container');
            if (!eventInTargets(e, panel) && !(fabContainer && eventInTargets(e, fabContainer))) {
                this.close();
            }
        });
    },

    /* ===== 打开/关闭面板 ===== */
    toggle() {
        this.isOpen() ? this.close() : this.open();
    },

    open() {
        if (!this._panelEl || this.isOpen()) return;
        this._panelEl.hidden = false;

        // 定位：在 FAB 按钮旁边弹出
        this._positionPanel();

        requestAnimationFrame(() => {
            this._panelEl.classList.add('open');
        });
    },

    close() {
        if (!this._panelEl || !this.isOpen()) return;
        this._panelEl.classList.remove('open');
        setTimeout(() => {
            if (this._panelEl) this._panelEl.hidden = true;
        }, 200);
    },

    isOpen() {
        return this._panelEl && !this._panelEl.hidden;
    },

    /* ===== 面板定位 ===== */
    _positionPanel() {
        const fab = byId('fabMain');
        if (!fab || !this._panelEl) return;

        const fabRect = fab.getBoundingClientRect();
        const vp = { width: window.innerWidth, height: window.innerHeight };
        const panelW = 280;
        const panelH = this._panelEl.scrollHeight || 180;
        const gap = 12;

        // 优先放在 FAB 左侧
        let left = fabRect.left - panelW - gap;
        let top = fabRect.top + fabRect.height / 2 - panelH / 2;

        // 如果左侧空间不够，放在上方
        if (left < 8) {
            left = Math.max(8, fabRect.left + fabRect.width / 2 - panelW / 2);
            top = fabRect.top - panelH - gap;
        }

        // 如果上方也没空间，放在下方
        if (top < 8) {
            top = fabRect.bottom + gap;
        }

        // 确保不超出右边界
        if (left + panelW > vp.width - 8) {
            left = vp.width - panelW - 8;
        }

        // 确保不超出下边界
        if (top + panelH > vp.height - 8) {
            top = vp.height - panelH - 8;
        }

        this._panelEl.style.left = Math.max(8, left) + 'px';
        this._panelEl.style.top = Math.max(8, top) + 'px';
    },

    /* ===== 重置为默认宽度 ===== */
    async reset() {
        this._applyWidth(this.DEFAULT_WIDTH, true);
        try {
            await storageManager.putSetting('displayWidth', this.DEFAULT_WIDTH);
        } catch (e) {
            console.warn('[DisplayManager] Failed to reset setting:', e.message);
        }
    }
};

window.DisplayManager = DisplayManager;
