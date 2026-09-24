import { byId, $, modalMount } from '../utils/domRef.js';
export const ThemeEffects = {
    currentTheme: 'bamboo',
    _intervals: [],
    /** 每个主题独立的色相/明度设置，分亮/暗两套
     *  新格式：{ light:{hue,lightness}, dark:{hue,lightness} }
     *  旧格式（兼容）：{ hue, lightness } → 迁移为 light 的值，dark 初始跟随 light
     */
    _themeSettings: {},

    /** 外部主题清单（仅登记名字 + meta，代码未加载）。key=主题名，value={name,icon,description,loaded} */
    availableExternal: {},
    /** 进行中的懒加载 Promise（防止重复请求同名主题） */
    _loadingThemes: {},

    themes: {
        bamboo: {
            name: '竹林清韵',
            icon: 'tree-pine',
            author: '羽鳞君',
            license: '竹林用户专享 · 未经授权禁止使用（含个人使用） © 2026 羽鳞君 保留所有权利',
            // 设计画布：正方形基准 480×480（1:1）；
            // 场景内所有写死 px（月亮 60px、山体、竹林高度等）都以此尺寸为基准，缩放后完全一致。
            design: { w: 480, h: 480 },
            render() {
                return BambooGarden.render();
            },
            init() {
                BambooGarden.init();
            },
            // 明暗切换钩子：由 ThemeEffects 统一观察者驱动，替代各主题自行挂 MutationObserver
            updateTheme() {
                if (typeof BambooGarden !== 'undefined' && BambooGarden.updateTheme) {
                    BambooGarden.updateTheme();
                }
            }
        }
    },

    render(themeName = 'bamboo') {
        let theme = this.themes[themeName];
        if (!theme) {
            // 外部主题代码尚未注册：先回退默认竹林（保证一定能正常显示，绝不留空白占位）；
            // 若该主题确为已激活外部主题，app:ready 会随握手同步下发其代码并注册；即便时序更早，
            // init 的懒加载完成后也会重新挂载真实主题，不会停留在竹林占位。
            console.debug('Theme not found, falling back to bamboo:', themeName);
            theme = this.themes.bamboo;
        }
        const inner = theme.render();

        // ===== 设计画布契约（框架级）=====
        // 主题声明 design:{w,h} → 视觉盒按该比例定高，主题内容放进固定尺寸的 .theme-canvas，
        // 由框架按「盒宽 / 设计宽」整体等比缩放。主题因此可放心用固定 px 绘制，
        // 构图在任意容器尺寸下都保持一致（不会出现放大后细节不跟随的形变）。
        // 未声明 design 的主题退回默认 1:1（正方形）视觉盒且不缩放，保持向后兼容。
        const design = theme.design;
        const visualAttr = design
            ? ' style="aspect-ratio:' + design.w + '/' + design.h + '"'
            : '';
        const visualInner = design
            ? '<div class="theme-canvas" data-design-w="' + design.w + '"' +
              ' style="width:' + design.w + 'px;height:' + design.h + 'px">' + inner + '</div>'
            : inner;
        // 共享「配套」：诗词+日期条（原竹林专属，现全主题统一）+ 布局自适应视觉容器。
        // 结构：.theme-card(.theme-visual + .bamboo-poem-strip)，与竹林主题完全一致。
        const mode = (typeof LayoutMode !== 'undefined' && LayoutMode.isKanban && LayoutMode.isKanban()) ? 'kanban' : 'horizontal';
        let poem = '';
        if (typeof BambooPoem !== 'undefined') {
            const p = BambooPoem.render(mode);
            if (p) poem = p;
        }
        return '<div class="theme-card">' +
            '<div class="theme-visual"' + visualAttr + '>' + visualInner + '</div>' +
            poem +
            '</div>';
    },

    init(themeName = 'bamboo') {
        var section = byId('themeEffectSection');
        if (!section) return;
        // 外部主题懒加载恢复：代码未注册（含清单未达的竞态）→ 先用 bamboo 占位，加载完成再真正初始化
        if (themeName && themeName !== 'bamboo' && !this.themes[themeName]) {
            const self = this;
            this.init('bamboo');
            this._ensureLoaded(themeName).then(function (ok) {
                // 代码就绪后必须重新「渲染 + 挂载」：此前 render 因主题未注册而回退成了竹林标记，
                // 若只 destroy+init 不重渲染，页面会停在竹林（表现为「重启后主题没加载出来」）。
                if (ok && self.themes[themeName]) self._mountTheme(themeName);
            });
            return;
        }
        // 同步「当前主题」状态：启动/重载时 init 直接拿到已注册主题（非懒加载路径），
        // 若不在此更新 currentTheme，它会一直停留在硬编码初值 'bamboo'
        // → 主题面板高亮 / 色相滑块作用对象都会与实际渲染的主题不符。
        this.currentTheme = themeName;
        // 主题根现被共享外壳 .theme-card > .theme-visual 包裹，init 传入视觉容器
        var container = section.querySelector('.theme-visual') || section.firstElementChild;
        const theme = this.themes[themeName];
        if (theme && typeof theme.init === 'function') {
            theme.init(container);
        }
        this._setupCanvasScaler();
        this._applyThemeVars(themeName);
        this._syncThemeMode();
        this._initThemeModeObserver();
    },

    /** 渲染并挂载指定主题：清空旧 DOM → 挂新 DOM → 销毁旧主题 → 初始化新主题。
     *  switchTheme 与「外部主题懒加载完成后的补渲染」共用，避免两处逻辑漂移。 */
    _mountTheme(themeName) {
        var section = byId('themeEffectSection');
        if (!section) return;
        var oldTheme = this.themes[this.currentTheme];
        var newEl = this.createElement(this.render(themeName));
        section.innerHTML = '';
        section.appendChild(newEl);
        if (oldTheme && typeof oldTheme.destroy === 'function') {
            try { oldTheme.destroy(); } catch (e) {
                console.warn('[ThemeEffects] 旧主题 destroy 失败:', e.message);
            }
        }
        this.destroy();
        this.currentTheme = themeName;
        this.init(themeName);
    },

    /** 设计画布缩放：把固定尺寸的 .theme-canvas 等比缩放到视觉盒宽度。
     *  主题只需声明 design 并按该尺寸绘制，无需自己处理任何尺寸变化。 */
    _setupCanvasScaler() {
        var section = byId('themeEffectSection');
        var visual = section && section.querySelector('.theme-visual');
        if (this._scalerRO) { this._scalerRO.disconnect(); this._scalerRO = null; }
        if (!visual) return;
        var canvas = visual.querySelector('.theme-canvas');
        if (!canvas) return; // 主题未声明设计画布 → 不缩放（由主题自行适配）
        var designW = parseFloat(canvas.getAttribute('data-design-w'));
        if (!designW) return;
        var apply = function () {
            var w = visual.clientWidth;
            if (!w) return;
            canvas.style.transform = 'scale(' + (w / designW).toFixed(5) + ')';
        };
        apply();
        if (typeof ResizeObserver !== 'undefined') {
            this._scalerRO = new ResizeObserver(apply);
            this._scalerRO.observe(visual);
        }
        // 首帧布局可能尚未稳定（clientWidth=0）→ 下一帧再兜底计算一次
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(apply);
    },

    switchTheme(themeName) {
        if (!themeName || themeName === this.currentTheme) return;
        // 外部主题懒加载：清单在、代码未注册 → 先拉取再切换
        if (!this.themes[themeName] && this.availableExternal[themeName]) {
            const self = this;
            this._ensureLoaded(themeName).then(function (ok) {
                if (ok) {
                    self.switchTheme(themeName);
                } else {
                    const label = self.availableExternal[themeName] ? self.availableExternal[themeName].name : themeName;
                    Toast.showToast('主题「' + label + '」加载失败', 'error');
                }
            });
            return;
        }
        if (!this.themes[themeName]) return;

        var section = byId('themeEffectSection');
        if (!section) return;
        // 确保切换有渐变（淡出→替换→淡入），避免 opacity 瞬断造成白闪观感
        section.style.transition = 'opacity 0.25s ease';

        // 淡出 → 替换内容 → 淡入，消除 innerHTML 瞬间白屏
        var self = this;
        // doSwap 在淡出动画结束后才执行：先把新主题 DOM 挂载进 section，
        // 再清理旧主题并初始化新主题。BambooGarden.init 等依赖 #farBamboo / #leafContainer
        // 等新 DOM（byId 查找），必须在 DOM 就位后才能跑，否则会 early-return 导致
        // 竹丛/落叶等动效缺失、显示不全。
        var doSwap = function() {
            self._mountTheme(themeName);
            Toast.showToast('已切换至「' + self.themes[themeName].name + '」', 'success');
            // 新内容就位后立即恢复不透明度
            requestAnimationFrame(function() {
                section.style.opacity = '1';
            });
        };

        // 安装 transitionend 监听器，确保动画完成后才替换
        var onTransitionEnd = function(e) {
            if (e.target !== section) return;
            if (e.propertyName !== 'opacity') return;
            section.removeEventListener('transitionend', onTransitionEnd);
            doSwap();
        };
        section.addEventListener('transitionend', onTransitionEnd);

        // 降级保护：400ms 超时兜底，防止 transitionend 不触发（如 prefers-reduced-motion）
        var fallbackTimer = setTimeout(function() {
            section.removeEventListener('transitionend', onTransitionEnd);
            if (section.style.opacity === '0') {
                doSwap();
            }
        }, 400);

        // 在 doSwap 中也清理 fallback
        var originalDoSwap = doSwap;
        doSwap = function() {
            clearTimeout(fallbackTimer);
            originalDoSwap();
        };

        section.style.opacity = '0';

        if (typeof SectionRegistry !== 'undefined') {
            SectionRegistry.update('themeEffect', { theme: themeName });
        }
    },

    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        // 如果有多个顶层节点，返回 fragment 包含所有
        if (template.content.children.length > 1) {
            const frag = document.createDocumentFragment();
            while (template.content.firstChild) {
                frag.appendChild(template.content.firstChild);
            }
            return frag;
        }
        return template.content.firstChild;
    },

    /** 在 #themeEffectSection 上覆盖 --accent-hue / --accent-lightness-offset（仅当前模式） */
    _applyThemeVars(themeName) {
        var section = byId('themeEffectSection');
        if (!section) return;
        // 懒加载
        if (!this._settingsLoaded) {
            this._loadSettings();
            this._settingsLoaded = true;
        }
        var mode = this._getCurrentMode();
        var s = this._getModeSetting(themeName, mode);
        // 使用 important 优先级，确保覆盖 Obsidian 全局 :root 上可能的 !important
        if (s && s.hue !== null) {
            section.style.setProperty('--accent-hue', s.hue, 'important');
        } else {
            section.style.removeProperty('--accent-hue');
        }
        if (s && s.lightness !== null) {
            section.style.setProperty('--accent-lightness-offset', s.lightness + '%', 'important');
        } else {
            section.style.removeProperty('--accent-lightness-offset');
        }
    },

    /** 同步明暗模式到 #themeEffectSection 的 CSS 变量和 data 属性 */
    _syncThemeMode() {
        var section = byId('themeEffectSection');
        if (!section) return;
        var isDark = document.documentElement.classList.contains('dark');
        section.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
        // --theme-lum: 亮80%/暗22%，叠加主题明度偏移。暗色提到22%让色相变化可见
        section.style.setProperty('--theme-lum',
            'calc(' + (isDark ? '22%' : '80%') + ' + var(--accent-lightness-offset, 0%))', 'important');
        // --theme-sat: 亮35%/暗25%
        section.style.setProperty('--theme-sat', isDark ? '25%' : '35%', 'important');

        // 重新应用当前主题的色相/明度（切换模式后读新模式的设置）
        this._applyThemeVars(this.currentTheme);

        // 如果主题面板正打开，刷新滑块值和模式标签
        var panel = $('.panel[active-panel="theme"]');
        if (panel) {
            var mode = this._getCurrentMode();
            var modeLabel = mode === 'dark' ? '暗色' : '亮色';
            var headerLabel = panel.querySelector('.theme-tune-header-label');
            if (headerLabel) headerLabel.textContent = '当前主题颜色 · ' + modeLabel;
            var cur = this._getModeSetting(this.currentTheme, mode);
            var hueSlider = panel.querySelector('#tuneHue');
            var lightSlider = panel.querySelector('#tuneLight');
            var hv = panel.querySelector('#tuneHueVal');
            var lv = panel.querySelector('#tuneLightVal');
            if (hueSlider) hueSlider.value = cur.hue !== null ? cur.hue : '';
            if (lightSlider) lightSlider.value = cur.lightness !== null ? cur.lightness : '0';
            if (hv) hv.textContent = cur.hue !== null ? cur.hue + '°' : '自动';
            if (lv) lv.textContent = cur.lightness !== null ? (cur.lightness > 0 ? '+' : '') + cur.lightness + '%' : '自动';
            var hr = panel.querySelector('#tuneHueReset');
            var lr = panel.querySelector('#tuneLightReset');
            if (hr) hr.style.display = cur.hue !== null ? '' : 'none';
            if (lr) lr.style.display = cur.lightness !== null ? '' : 'none';
        }

        // 统一通知当前主题刷新（合并 observer：明暗切换只需这一个观察者驱动）
        this._notifyThemeUpdate();
    },

    /** 通知当前主题的 updateTheme 钩子（明暗切换后刷新背景等） */
    _notifyThemeUpdate() {
        var theme = this.themes[this.currentTheme];
        if (theme && typeof theme.updateTheme === 'function') {
            try { theme.updateTheme(); } catch (e) {
                console.warn('[ThemeEffects] 主题 updateTheme 失败:', e && e.message);
            }
        }
    },

    /** 监听 Obsidian 明暗模式切换（html.dark class 变化） */
    _initThemeModeObserver() {
        if (this._modeObserverActive) return;
        this._modeObserverActive = true;
        var el = this;
        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    el._syncThemeMode();
                    break;
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        this._modeObserver = observer;
    },
    _getCurrentMode() {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    },

    /** 读取某主题某模式下的设置，带 fallback */
    _getModeSetting(themeName, mode) {
        var s = this._themeSettings[themeName];
        if (!s) return { hue: null, lightness: null };
        // 新格式
        if (s.light && s.dark) return { hue: s[mode].hue, lightness: s[mode].lightness };
        // 旧格式兼容
        return { hue: s.hue !== undefined ? s.hue : null, lightness: s.lightness !== undefined ? s.lightness : null };
    },

    /** 设置当前主题当前模式的独立色相/明度，null 表示跟随全局 */
    _setThemeSetting(themeName, key, val) {
        var mode = this._getCurrentMode();
        if (!this._themeSettings[themeName]) {
            this._themeSettings[themeName] = { light: { hue: null, lightness: null }, dark: { hue: null, lightness: null } };
        }
        // 兼容旧格式
        if (!this._themeSettings[themeName].light) {
            this._themeSettings[themeName] = { light: { hue: null, lightness: null }, dark: { hue: null, lightness: null } };
        }
        this._themeSettings[themeName][mode][key] = val;
        if (this.currentTheme === themeName) {
            this._applyThemeVars(themeName);
        }
        this._saveSettings();
    },

    /** 从 localStorage 加载主题设置，兼容旧格式 */
    _loadSettings() {
        try {
            var raw = StorageAdapter.get(StorageKeys.THEME_SETTINGS);
            if (raw) {
                var parsed = JSON.parse(raw);
                // 迁移旧格式 { hue, lightness } → 新格式 { light:{hue,lightness}, dark:{hue,lightness} }
                var migrated = {};
                var keys = Object.keys(parsed);
                for (var i = 0; i < keys.length; i++) {
                    var themeName = keys[i];
                    var val = parsed[themeName];
                    if (val && typeof val === 'object' && !val.light && !val.dark && ('hue' in val || 'lightness' in val)) {
                        // 旧格式
                        migrated[themeName] = {
                            light: { hue: val.hue !== undefined ? val.hue : null, lightness: val.lightness !== undefined ? val.lightness : null },
                            dark: { hue: val.hue !== undefined ? val.hue : null, lightness: val.lightness !== undefined ? val.lightness : null }
                        };
                    } else {
                        migrated[themeName] = val;
                    }
                }
                this._themeSettings = migrated;
            }
        } catch (e) {
            console.warn('[ThemeEffects] 加载主题设置失败:', e);
        }
    },

    /** 保存到 localStorage */
    _saveSettings() {
        try {
            StorageAdapter.set(StorageKeys.THEME_SETTINGS, JSON.stringify(this._themeSettings));
        } catch (e) {
            console.warn('[ThemeEffects] 保存主题设置失败:', e);
        }
    },

    getThemeList() {
        const builtin = Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name,
            icon: this.themes[key].icon,
            loaded: true,
            author: this.themes[key].author || '',
            license: this.themes[key].license || ''
        }));
        const external = Object.keys(this.availableExternal)
            .filter(name => !this.themes[name]) // 仅未注册（待加载）的外部主题
            .map(name => ({
                id: name,
                name: this.availableExternal[name].name || name,
                icon: this.availableExternal[name].icon || 'palette',
                loaded: false,
                author: this.availableExternal[name].author || '',
                license: this.availableExternal[name].license || ''
            }));
        return builtin.concat(external);
    },

    /** 登记外部自定义主题清单（仅名字 + meta，不加载代码）；代码经 switchTheme/启动恢复时按需拉取 */
    registerExternalManifest(name, meta = {}) {
        if (!name) return;
        if (this.themes[name]) return; // 已注册（内置/已加载）不重复登记为待加载项
        this.availableExternal[name] = {
            name: (meta && meta.name) || name,
            icon: (meta && meta.icon) || 'palette',
            description: (meta && meta.description) || '',
            author: (meta && meta.author) || '',
            license: (meta && meta.license) || '',
            loaded: false
        };
    },

    /** 确保某外部主题代码已加载并注册；返回 Promise<boolean> */
    _ensureLoaded(name) {
        const self = this;
        if (this.themes[name]) return Promise.resolve(true);
        // 注意：不依赖 availableExternal 是否已登记。视图重建（横向布局首次进入 moveToCenter
        // 触发宿主重建 webview）后重新初始化时，init 可能跑在 app:ready 清单到达之前，此时
        // availableExternal 尚为空；但宿主侧始终持有主题代码缓存，直接 requestThemeCode 取回即可，
        // 避免恢复外部主题时因清单时序竞态而静默回退默认竹林。
        this._loadingThemes = this._loadingThemes || {};
        if (this._loadingThemes[name]) return this._loadingThemes[name];
        const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
        if (!mgr || !mgr.requestThemeCode) return Promise.resolve(false);
        const p = mgr.requestThemeCode(name).then(function (code) {
            if (!code) return false;
            self.registerExternal(name, code);
            if (self.availableExternal[name]) self.availableExternal[name].loaded = true;
            return !!self.themes[name];
        }).catch(function () { return false; });
        this._loadingThemes[name] = p;
        p.finally(function () { if (self._loadingThemes) delete self._loadingThemes[name]; });
        return p;
    },

    /** 注册外部自定义主题 */
    registerExternal(name, code) {
        if (!name || !code) return;
        if (this.themes[name]) {
            console.warn('[ThemeEffects] 主题 "' + name + '" 已存在，跳过注册');
            return;
        }

        // 沙箱执行：通过 IIFE 提取主题对象
        const themeObj = this._evalTheme(name, code);
        if (!themeObj) return;

        // 验证必备字段
        if (typeof themeObj.name !== 'string' || typeof themeObj.render !== 'function') {
            console.warn('[ThemeEffects] 主题 "' + name + '" 缺少必要的 name/render 字段，跳过注册');
            return;
        }

        // 注册
        // 设计画布契约：可选，声明 {w,h} 后由框架统一等比缩放；未声明则退回 16:10 盒且不缩放
        const design = (themeObj.design && typeof themeObj.design === 'object'
            && +themeObj.design.w > 0 && +themeObj.design.h > 0)
            ? { w: +themeObj.design.w, h: +themeObj.design.h }
            : null;

        this.themes[name] = {
            name: themeObj.name || name,
            icon: themeObj.icon || 'palette',
            description: themeObj.description || '',
            author: themeObj.author || '',
            license: themeObj.license || '',
            design,
            render() { return themeObj.render(); },
            init(container) { if (typeof themeObj.init === 'function') themeObj.init(container); },
            destroy() { if (typeof themeObj.destroy === 'function') themeObj.destroy(); }
        };

        console.debug('[ThemeEffects] 自定义主题 "' + this.themes[name].name + '" 注册成功');
    },

    /** 安全执行主题代码并提取主题对象 */
    _evalTheme(name, code) {
        try {
            // name 可能是短名（如 'orbit'）或完整变量名（如 '__bamboo_theme_orbit'）
            const varName = name.startsWith('__bamboo_theme_') ? name : '__bamboo_theme_' + name;

            // 静态审计：扫描危险 API 调用
            const blocked = this._auditThemeCode(name, code);
            if (blocked) return null;

            // 记录执行前的 window 属性快照（用于清理泄漏）
            const beforeKeys = Object.getOwnPropertyNames(window);

            // 受限环境（data: URL 的 webview）里 localStorage/sessionStorage/indexedDB 是「读取即抛
            // SecurityError」的 getter：既不能读取原值、也不能被 Object.defineProperty 重定义。
            // 因此对它们的处理与「越权能力」分开：
            //   ① 越权能力（parent/top/opener/fetch/XHR/WebSocket/eval/import）仍清空，收敛逃逸/外联；
            //   ② 存储三件套改为注入内存垫片（见下方 new Function 形参），主题内部的裸引用走垫片，
            //      既不触达真实存储（安全意图不变），也不会在受限环境抛错。
            const BLANK = ['parent', 'top', 'opener', 'fetch', 'XMLHttpRequest', 'WebSocket', 'eval', 'import'];
            const makeStorage = () => {
                const m = {};
                return {
                    getItem: (k) => (Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null),
                    setItem: (k, v) => { m[k] = String(v); },
                    removeItem: (k) => { delete m[k]; },
                    clear: () => { for (const k in m) delete m[k]; },
                    key: (i) => Object.keys(m)[i] ?? null,
                    get length() { return Object.keys(m).length; },
                };
            };
            const lsShim = makeStorage();
            const ssShim = makeStorage();

            const saved = {};
            for (const key of BLANK) {
                try { saved[key] = window[key]; } catch (_) { saved[key] = undefined; }
                try { Object.defineProperty(window, key, { value: undefined, configurable: true, writable: false }); } catch (_) {}
            }

            let result = null;
            try {
                // storage 三件套通过形参注入（裸引用优先命中局部形参，而非被 data: URL 限制的全局 getter）
                const func = new Function('window', 'self', 'localStorage', 'sessionStorage', 'indexedDB',
                    code + '; return typeof ' + varName + ' !== "undefined" ? ' + varName + ' : null;');
                result = func(window, window, lsShim, ssShim, undefined);
            } finally {
                // 恢复被屏蔽的全局变量
                for (const key of BLANK) {
                    try { Object.defineProperty(window, key, { value: saved[key], configurable: true, writable: true }); } catch (_) {}
                }
            }

            if (result) return result;

            // 兜底：扫描 window 上的 __bamboo_theme_* 变量
            const afterKeys = Object.getOwnPropertyNames(window);
            const leaked = afterKeys.filter(k => !beforeKeys.includes(k) && !BLANK.includes(k));
            const themeVar = window[varName];
            // 清理主题代码可能泄漏到 window 上的非必要属性
            for (const k of leaked) {
                if (!k.startsWith('__bamboo_theme_')) {
                    try { delete window[k]; } catch (_) {}
                }
            }
            return themeVar || null;
        } catch (e) {
            console.error('[ThemeEffects] 执行自定义主题 "' + name + '" 时出错:', e.message);
            return null;
        }
    },

    /** 静态审计主题代码，检测危险 API 调用 */
    _auditThemeCode(name, code) {
        // 先剥离字符串字面量（单/双引号/模板串），避免「说明文字里提到 window.top」
        // 这类无害内容被误判为危险调用。字符串本身不会执行危险 API，
        // 真正调用会以裸 `eval(` / `window.top` 等形式出现在代码里，仍会被下方规则命中。
        const noStrings = code
            .replace(/`(?:\\.|[^`\\])*`/g, '``')   // 模板字符串
            .replace(/'(?:\\.|[^'\\])*'/g, "''")     // 单引号字符串
            .replace(/"(?:\\.|[^"\\])*"/g, '""');    // 双引号字符串

        // 再剥离注释，避免注释中的关键词误触发
        const stripped = noStrings
            .replace(/\/\*[\s\S]*?\*\//g, '')  // 多行注释
            .replace(/\/\/.*$/gm, '');           // 单行注释

        const rules = [
            { pattern: /\bwindow\.parent\b/,        msg: 'window.parent' },
            { pattern: /\bwindow\.top\b/,            msg: 'window.top' },
            { pattern: /\bwindow\.opener\b/,         msg: 'window.opener' },
            { pattern: /\bfetch\s*\(/,               msg: 'fetch()' },
            { pattern: /\bXMLHttpRequest\b/,          msg: 'XMLHttpRequest' },
            { pattern: /\bWebSocket\b/,               msg: 'WebSocket' },
            // 注：localStorage/sessionStorage/indexedDB 已通过 new Function 形参注入内存垫片，
            // 主题内部引用不再触达真实存储（安全意图不变），故不再拦截，避免误杀合规主题。
            { pattern: /\bdocument\.cookie\b/,        msg: 'document.cookie' },
            { pattern: /\beval\s*\(/,                msg: 'eval()' },
            { pattern: /\bnew\s+Function\s*\(/,      msg: 'new Function()' },
            { pattern: /\bimport\s*\(/,              msg: 'import()' },
            { pattern: /\bimport\s+/,                msg: 'import statement' },
            { pattern: /\bnavigator\.sendBeacon\b/,  msg: 'navigator.sendBeacon' },
        ];
        for (const rule of rules) {
            if (rule.pattern.test(stripped)) {
                console.warn('[ThemeEffects] 主题 "' + name + '" 包含危险 API 调用: ' + rule.msg + '，已拒绝加载');
                return true;
            }
        }
        return false;
    },


    destroy() {
        if (this._modeObserver) {
            this._modeObserver.disconnect();
            this._modeObserver = null;
            this._modeObserverActive = false;
        }
        if (this._scalerRO) {
            this._scalerRO.disconnect();
            this._scalerRO = null;
        }
        this._intervals.forEach(id => clearInterval(id));
        this._intervals = [];
    },

    /** 打开主题选择面板（FAB 菜单入口） */
    showThemePanel() {
        const themeList = this.getThemeList();
        const current = this.currentTheme;

        const cards = themeList.map(t => `
            <button class="theme-panel-card ${t.id === current ? 'active' : ''} ${t.loaded ? '' : 'theme-unloaded'}"
                    data-theme="${t.id}"
                    data-loaded="${t.loaded ? '1' : '0'}"
                    title="${t.name}">
                <span class="theme-panel-card-name">${t.name}</span>
                ${t.license && t.license.indexOf('专享') !== -1 ? '<span class="theme-exclusive-badge">专享</span>' : ''}
                ${t.loaded ? '' : '<span class="theme-panel-card-badge">待加载</span>'}
            </button>
        `).join('');

        // 当前主题的独立设置（按当前模式读取）
        var mode = this._getCurrentMode();
        var modeLabel = mode === 'dark' ? '暗色' : '亮色';
        var cur = this._getModeSetting(current, mode);
        var hasTune = cur.hue !== null || cur.lightness !== null;

        var content = [
            '<div class="theme-panel-market-entry">',
                '<button class="theme-market-open-btn" id="openMarketBtn">逛竹林主题市场</button>',
            '</div>',

            '<div class="theme-panel-grid">',
                cards,
            '</div>',

            '<div class="theme-panel-tune">',
                '<div class="theme-tune-header">',
                    '<span class="theme-tune-header-label">当前主题颜色 · ' + modeLabel + '</span>',
                    hasTune ? '<button class="theme-tune-reset-all-btn" id="tuneResetAll">跟随全局</button>' : '',
                '</div>',
                '<div class="theme-tune-row">',
                    '<label class="theme-tune-name">色相</label>',
                    '<input type="range" class="theme-tune-slider" id="tuneHue" min="0" max="359" value="' + (cur.hue !== null ? cur.hue : '') + '" data-key="hue">',
                    '<span class="theme-tune-val" id="tuneHueVal">' + (cur.hue !== null ? cur.hue + '°' : '自动') + '</span>',
                    '<button class="theme-tune-reset" id="tuneHueReset" style="display:' + (cur.hue !== null ? '' : 'none') + '">复位</button>',
                '</div>',
                '<div class="theme-tune-row">',
                    '<label class="theme-tune-name">明度</label>',
                    '<input type="range" class="theme-tune-slider" id="tuneLight" min="-30" max="30" value="' + (cur.lightness !== null ? cur.lightness : '0') + '" data-key="lightness">',
                    '<span class="theme-tune-val" id="tuneLightVal">' + (cur.lightness !== null ? (cur.lightness > 0 ? '+' : '') + cur.lightness + '%' : '自动') + '</span>',
                    '<button class="theme-tune-reset" id="tuneLightReset" style="display:' + (cur.lightness !== null ? '' : 'none') + '">复位</button>',
                '</div>',
            '</div>',

        ].join('\n');

        PanelManager.open('theme', '主题动效', content, {
            width: '400px',
            onClose: () => {}
        });

        var panel = byId('panel-theme');
        if (!panel) return;

        var el = this;

        // 主题卡片点击
        panel.querySelectorAll('.theme-panel-card').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                var themeName = btn.dataset.theme;
                if (!themeName || themeName === el.currentTheme) return;
                // 待加载外部主题：原地显示加载态，不关闭面板，加载完成再切换
                if (btn.dataset.loaded === '0' && !el.themes[themeName]) {
                    if (btn.classList.contains('theme-loading')) return;
                    btn.classList.add('theme-loading');
                    btn.textContent = '加载中…';
                    const ok = await el._ensureLoaded(themeName);
                    if (ok) {
                        el.switchTheme(themeName);
                        PanelManager.close();
                    } else {
                        const label = el.availableExternal[themeName] ? el.availableExternal[themeName].name : themeName;
                        btn.classList.remove('theme-loading');
                        btn.textContent = '';
                        var span = document.createElement('span');
                        span.className = 'theme-panel-card-name';
                        span.textContent = label;
                        btn.appendChild(span);
                        Toast.showToast('主题「' + label + '」加载失败', 'error');
                    }
                    return;
                }
                el.switchTheme(themeName);
                PanelManager.close();
            });
        });

        // 逛市场入口
        var marketBtn = panel.querySelector('#openMarketBtn');
        if (marketBtn) {
            marketBtn.addEventListener('click', function() {
                el.showMarketPanel();
            });
        }

        // ===== 滑块事件 =====
        function setupSlider(sliderId, resetId, valId, key) {
            var slider = panel.querySelector(sliderId);
            var resetBtn = panel.querySelector(resetId);
            var valEl = panel.querySelector(valId);
            if (!slider) return;

            // 滑动时
            slider.addEventListener('input', function() {
                var v = parseInt(slider.value, 10);
                el._setThemeSetting(current, key, v);
                if (valEl) {
                    if (key === 'hue') valEl.textContent = v + '°';
                    else valEl.textContent = (v > 0 ? '+' : '') + v + '%';
                }
                if (resetBtn) resetBtn.style.display = '';
                // 显示重置全部
                var resetAllEl = panel.querySelector('#tuneResetAll');
                if (resetAllEl) resetAllEl.style.display = '';
            });

            // 重置单个
            if (resetBtn) {
                resetBtn.addEventListener('click', function() {
                    el._setThemeSetting(current, key, null);
                    slider.value = key === 'lightness' ? '0' : '';
                    if (valEl) valEl.textContent = '自动';
                    resetBtn.style.display = 'none';
                    // 检查当前模式是否全部重置，隐藏"跟随全局"按钮
                    var curMode = el._getModeSetting(current, el._getCurrentMode());
                    if (curMode.hue === null && curMode.lightness === null) {
                        var resetAllEl = panel.querySelector('#tuneResetAll');
                        if (resetAllEl) resetAllEl.style.display = 'none';
                    }
                });
            }
        }

        setupSlider('#tuneHue', '#tuneHueReset', '#tuneHueVal', 'hue');
        setupSlider('#tuneLight', '#tuneLightReset', '#tuneLightVal', 'lightness');

        // 重置全部（亮暗两套都重置）
        var resetAllBtn2 = panel.querySelector('#tuneResetAllBtn');
        if (resetAllBtn2) {
            resetAllBtn2.addEventListener('click', function() {
                var s = el._themeSettings[current];
                if (s) {
                    if (s.light) { s.light.hue = null; s.light.lightness = null; }
                    if (s.dark) { s.dark.hue = null; s.dark.lightness = null; }
                }
                el._applyThemeVars(current);
                el._saveSettings();
                var hueSlider = panel.querySelector('#tuneHue');
                var lightSlider = panel.querySelector('#tuneLight');
                if (hueSlider) hueSlider.value = '';
                if (lightSlider) lightSlider.value = '0';
                var hv = panel.querySelector('#tuneHueVal');
                var lv = panel.querySelector('#tuneLightVal');
                if (hv) hv.textContent = '自动';
                if (lv) lv.textContent = '自动';
                var hr = panel.querySelector('#tuneHueReset');
                var lr = panel.querySelector('#tuneLightReset');
                if (hr) hr.style.display = 'none';
                if (lr) lr.style.display = 'none';
                resetAllBtn2.style.display = 'none';
            });
        }

        // 如果当前没有独立设置，"跟随全局"按钮保持隐藏
        if (!hasTune) {
            var ra = panel.querySelector('#tuneResetAll');
            if (ra) ra.style.display = 'none';
        }
    },

    showMarketPanel() {
        const el = this;
        if (byId('panel-market')) return; // 已打开则不重复
        const content = '<div class="market-loading">正在从竹林主题市场加载…</div>';
        PanelManager.open('market', '竹林主题市场', content, { width: '560px' });
        const panel = byId('panel-market');
        if (!panel) return;
        const body = panel.querySelector('.fab-panel-body');
        if (!body) return;
        const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
        if (!mgr || typeof mgr.fetchMarketManifest !== 'function') {
            body.innerHTML = '<div class="market-empty">市场功能暂不可用</div>';
            return;
        }
        mgr.fetchMarketManifest().then(function(manifest) {
            if (!manifest || !Array.isArray(manifest.themes) || manifest.themes.length === 0) {
                body.innerHTML = '<div class="market-empty">市场暂无主题</div>';
                return;
            }
            el._renderMarketBody(body, manifest.themes, manifest.installed || {});
        }).catch(function() {
            body.innerHTML = '<div class="market-empty">市场加载失败，请稍后重试</div>';
        });
    },

    /**
     * 渲染市场列表。
     * @param {Array} themes manifest 中的主题条目（含 version）
     * @param {Object} installed 宿主持久化的「已安装版本表」：id → { version }
     */
    _renderMarketBody(body, themes, installed) {
        const el = this;
        installed = installed || {};
        const cards = themes.map(function(t) {
            // 已安装：主题文件被扫进清单（待加载）或已注册（当前/已加载）
            const isInstalled = !!el.availableExternal[t.id] || !!el.themes[t.id];
            const exclusive = t.license && t.license.indexOf('专享') !== -1;
            const ver = t.version || '';
            const rec = installed[t.id];
            // 可更新：已安装 且线上声明了版本 且（无安装记录 = 老版本遗留 / 记录版本与线上不一致）
            const hasUpdate = isInstalled && !!ver && (!rec || rec.version !== ver);
            const act = 'data-id="' + t.id + '"';
            let btn;
            if (!isInstalled) {
                btn = '<button class="market-btn install" ' + act + ' data-action="install" data-url="' +
                    (t.url || '') + '" data-version="' + ver + '">安装</button>';
            } else if (hasUpdate) {
                btn = '<button class="market-btn install" ' + act + ' data-action="update" data-url="' +
                    (t.url || '') + '" data-version="' + ver + '">更新</button>' +
                    '<button class="market-btn uninstall" ' + act + '>卸载</button>';
            } else {
                btn = '<button class="market-btn uninstall" ' + act + '>卸载</button>';
            }
            return '<div class="market-card' + (isInstalled ? ' installed' : '') + '">' +
                '<div class="market-card-main">' +
                    '<div class="market-card-head">' +
                        '<span class="market-card-name">' + (t.name || t.id) + '</span>' +
                        (exclusive ? '<span class="theme-exclusive-badge">专享</span>' : '') +
                        (hasUpdate ? '<span class="market-update-badge">可更新 v' + ver + '</span>' : '') +
                    '</div>' +
                    (t.author ? '<div class="market-card-author">作者：' + t.author + (ver ? ' · v' + ver : '') + '</div>' : '') +
                '</div>' +
                '<div class="market-card-actions">' + btn + '</div>' +
            '</div>';
        }).join('');
        body.innerHTML = '<div class="market-list">' + cards + '</div>';

        body.querySelectorAll('.market-btn.install').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = btn.getAttribute('data-id');
                const url = btn.getAttribute('data-url');
                const ver = btn.getAttribute('data-version') || '';
                const isUpdate = btn.getAttribute('data-action') === 'update';
                const entry = themes.find(function(x) { return x.id === id; });
                if (btn.disabled) return;
                btn.disabled = true;
                btn.textContent = isUpdate ? '更新中…' : '安装中…';
                window.storageManager.installMarketTheme(id, url, ver).then(function(ok) {
                    if (ok) {
                        el.registerExternalManifest(id, entry || {});
                        installed[id] = { version: ver };
                        // 更新且该主题正在显示：内存里注册的还是旧代码 → 注销后重新拉取并挂载，让新版本立即生效
                        if (isUpdate && el.currentTheme === id) {
                            const oldT = el.themes[id];
                            if (oldT && typeof oldT.destroy === 'function') {
                                try { oldT.destroy(); } catch (e) { /* 旧主题清理失败不阻塞更新 */ }
                            }
                            delete el.themes[id];
                            el._ensureLoaded(id).then(function (ok2) {
                                if (ok2) el._mountTheme(id);
                            });
                        }
                        el._renderMarketBody(body, themes, installed);
                        Toast.showToast('「' + (entry ? entry.name : id) + '」' +
                            (isUpdate ? '已更新' : '已安装，可在主题面板切换'), 'success');
                    } else {
                        btn.disabled = false;
                        btn.textContent = isUpdate ? '更新失败，重试' : '安装失败，重试';
                    }
                });
            });
        });
        body.querySelectorAll('.market-btn.uninstall').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = btn.getAttribute('data-id');
                if (btn.disabled) return;
                btn.disabled = true; btn.textContent = '卸载中…';
                window.storageManager.uninstallMarketTheme(id).then(function(ok) {
                    if (ok) {
                        if (el.currentTheme === id) { try { el.switchTheme('bamboo'); } catch (e) {} }
                        if (el.availableExternal[id]) delete el.availableExternal[id];
                        delete installed[id];
                        el._renderMarketBody(body, themes, installed);
                        Toast.showToast('「' + id + '」已卸载', 'success');
                    } else {
                        btn.disabled = false; btn.textContent = '卸载失败，重试';
                    }
                });
            });
        });
    },

};

window.ThemeEffects = ThemeEffects;
