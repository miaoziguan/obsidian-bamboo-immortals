export const ThemeEffects = {
    currentTheme: 'bamboo',
    _intervals: [],
    /** 每个主题独立的色相/明度设置，分亮/暗两套
     *  新格式：{ light:{hue,lightness}, dark:{hue,lightness} }
     *  旧格式（兼容）：{ hue, lightness } → 迁移为 light 的值，dark 初始跟随 light
     */
    _themeSettings: {},

    themes: {
        bamboo: {
            name: '竹林清韵',
            icon: 'tree-pine',
            render() {
                return BambooGarden.render();
            },
            init() {
                BambooGarden.init();
            }
        }
    },

    render(themeName = 'bamboo') {
        const theme = this.themes[themeName];

        if (!theme) {
            console.debug('Theme not found, falling back to bamboo:', themeName);
            return this.themes.bamboo.render();
        }

        return theme.render();
    },

    init(themeName = 'bamboo') {
        var section = document.getElementById('themeEffectSection');
        if (!section) return;
        var container = section.firstElementChild;
        const theme = this.themes[themeName];
        if (theme && typeof theme.init === 'function') {
            theme.init(container);
        }
        this._applyThemeVars(themeName);
        this._syncThemeMode();
        this._initThemeModeObserver();
    },

    switchTheme(themeName) {
        if (!this.themes[themeName]) return;

        // 查找到主题动效 wrapper，替换其内部内容
        var section = document.getElementById('themeEffectSection');
        if (section) {
            var newEl = this.createElement(this.render(themeName));
            section.innerHTML = '';
            section.appendChild(newEl);
        }

        if (typeof SectionRegistry !== 'undefined') {
            SectionRegistry.update('themeEffect', { theme: themeName });
        }

        // 清理旧主题
        const oldTheme = this.themes[this.currentTheme];
        if (oldTheme && typeof oldTheme.destroy === 'function') {
            try { oldTheme.destroy(); } catch (e) {
                console.warn('[ThemeEffects] 旧主题 destroy 失败:', e.message);
            }
        }

        this.destroy();
        this.currentTheme = themeName;
        this.init(themeName);
        Toast.showToast('已切换至「' + this.themes[themeName].name + '」', 'success');
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
        var section = document.getElementById('themeEffectSection');
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
        var section = document.getElementById('themeEffectSection');
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
        var panel = document.querySelector('.panel[active-panel="theme"]');
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
    },

    /** 获取当前明暗模式：'light' | 'dark' */
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
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name,
            icon: this.themes[key].icon
        }));
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
        this.themes[name] = {
            name: themeObj.name || name,
            icon: themeObj.icon || 'palette',
            description: themeObj.description || '',
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

            // 暂存要屏蔽的危险全局变量（保留 document、location 供主题正常操作 DOM，通过审计拦截 document.cookie）
            const DANGEROUS = ['parent', 'top', 'opener', 'fetch', 'XMLHttpRequest',
                'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB',
                'eval', 'import'];
            const saved = {};
            for (const key of DANGEROUS) {
                saved[key] = window[key];
                try { Object.defineProperty(window, key, { value: undefined, configurable: true, writable: false }); } catch (_) {}
            }

            let result = null;
            try {
                const func = new Function('window', 'self',
                    code + '; return typeof ' + varName + ' !== "undefined" ? ' + varName + ' : null;');
                result = func(window, window);
            } finally {
                // 恢复被屏蔽的全局变量
                for (const key of DANGEROUS) {
                    try { Object.defineProperty(window, key, { value: saved[key], configurable: true, writable: true }); } catch (_) {}
                }
            }

            if (result) return result;

            // 兜底：扫描 window 上的 __bamboo_theme_* 变量
            const afterKeys = Object.getOwnPropertyNames(window);
            const leaked = afterKeys.filter(k => !beforeKeys.includes(k) && !DANGEROUS.includes(k));
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
        // 先剥离注释，避免注释中的关键词误触发
        const stripped = code
            .replace(/\/\*[\s\S]*?\*\//g, '')  // 多行注释
            .replace(/\/\/.*$/gm, '');           // 单行注释

        const rules = [
            { pattern: /\bwindow\.parent\b/,        msg: 'window.parent' },
            { pattern: /\bwindow\.top\b/,            msg: 'window.top' },
            { pattern: /\bwindow\.opener\b/,         msg: 'window.opener' },
            { pattern: /\bfetch\s*\(/,               msg: 'fetch()' },
            { pattern: /\bXMLHttpRequest\b/,          msg: 'XMLHttpRequest' },
            { pattern: /\bWebSocket\b/,               msg: 'WebSocket' },
            { pattern: /\blocalStorage\b/,            msg: 'localStorage' },
            { pattern: /\bsessionStorage\b/,          msg: 'sessionStorage' },
            { pattern: /\bindexedDB\b/,               msg: 'indexedDB' },
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

    /** 显示主题开发指南 */
    showThemeGuide() {
        var g = [];
        // AI 辅助创建入口
        g.push('<div class="theme-guide-ai-bar">');
        g.push('  <button class="theme-guide-ai-btn" id="aiWizardBtn">✨ AI 辅助创建</button>');
        g.push('  <span class="theme-guide-ai-hint">填个描述，AI 帮你写主题代码</span>');
        g.push('</div>');
        g.push('<div class="theme-guide">');
        g.push('<div class="theme-guide-section">');
        g.push('<h3>📁 文件位置</h3>');
        g.push('<p>在 Vault 根目录下创建 <code>竹林复盘主题/</code> 文件夹，放入 <code>.js</code> 文件。路径可在插件设置中修改。</p>');
        g.push('</div>');
        g.push('<div class="theme-guide-section">');
        g.push('<h3>📝 接口规范</h3>');
        g.push('<pre><code>// 文件名: 我的主题.js  →  变量名: __bamboo_theme_我的主题');
        g.push('const theme = {');
        g.push('  name: \'我的主题\',       // 必填：显示名称');
        g.push('  render() {              // 必填：返回 HTML');
        g.push('    return \'&lt;div&gt;...&lt;/div&gt;\';');
        g.push('  },');
        g.push('  init(container) {},     // 可选：平台传入根元素，存 this._container');
        g.push('  destroy() {}            // 必读：清理所有 setTimeout/RAF/GSAP tweens');
        g.push('};');
        g.push('window.__bamboo_theme_我的主题 = theme;</code></pre>');
        g.push('</div>');
        g.push('<div class="theme-guide-section">');
        g.push('<h3>🎨 跟随主题色</h3>');
        g.push('<p>使用 <code>hsl(var(--accent-hue), S%, L%)</code> 跟随色相滑块，<code>calc(L% + var(--accent-lightness-offset))</code> 跟随明度滑块。</p>');
        g.push('<p>使用 <code>var(--theme-lum)</code> 自动适配明暗模式：亮色时 = 80%，暗色时自动翻转为 22%。</p>');
        g.push('<p>需要精细控制时，使用 <code>[data-theme-mode="dark"]</code> 选择器分写两套 CSS。</p>');
        g.push('</div>');
        g.push('<div class="theme-guide-section">');
        g.push('<h3>🎯 平台 CSS 变量</h3>');
        g.push('<p>以下 CSS 自定义属性由平台提供，主题中可直接使用：</p>');
        g.push('<table class="theme-guide-var-table"><tr><th>变量名</th><th>用途</th><th>说明</th></tr>');
        g.push('<tr><td><code>--theme-inner-radius</code></td><td>内框圆角</td><td>当前 = 26px，外框 38px−padding 12px。外层改大时自动更新，<u>必须用此变量，禁止硬编码</u></td></tr>');
        g.push('<tr><td><code>--accent-hue</code></td><td>色相</td><td>跟随色相滑块，用 <code>hsl(var(--accent-hue), S%, L%)</code> 跟随</td></tr>');
        g.push('<tr><td><code>--accent-lightness-offset</code></td><td>明度偏移</td><td>跟随明度滑块，用 <code>calc(L% + var(--accent-lightness-offset))</code></td></tr>');
        g.push('<tr><td><code>--theme-lum</code></td><td>明暗自适应</td><td>亮色=80%，暗色自动翻转为 22%。用此变量写一套代码同时适配亮暗</td></tr>');
        g.push('<tr><td><code>--theme-sat</code></td><td>饱和度自适应</td><td>亮色=35%，暗色自动降为 25%。跟随亮暗切换</td></tr>');
        g.push('</table>');
        g.push('</div>');
        g.push('<div class="theme-guide-section">');
        g.push('<h3>📐 容器适配规范</h3>');
        g.push('<p><strong>宽度：父级 100%</strong> — 主题渲染区宽度由用户「内容宽度」滑块控制（400~1600px 动态变化），主题必须自适应。</p>');
        g.push('<p><strong>高度：固定 250~400px</strong> — 推荐 300px，不得超出此区间。</p>');
        g.push('<p><strong>圆角：使用平台变量</strong> — <code>border-radius: var(--theme-inner-radius)</code>，<u>禁止硬编码固定值</u>。平台外框圆角随时可能调大，变量值自动跟随，硬编码会导致双框倒角错位。</p>');
        g.push('<p><strong>溢出裁切：必须设置</strong> — 容器加 <code>overflow: hidden</code>，防止动效（粒子、雾气等）穿透圆角边界。</p>');
        g.push('<p><strong>水平定位必须自适应</strong> — 使用百分比（如 <code>left: 20%</code>）、<code>vw</code> 或 JS 动态计算（<code>container.offsetWidth</code>），<u>禁止使用固定 px 宽度</u>。</p>');
        g.push('</div>');
        g.push('<div class="theme-guide-section">');
        g.push('<h3>🛠️ 快速模板</h3>');
        g.push('<pre><code>const theme = {');
        g.push('  name: \'我的主题\',');
        g.push('  render() {');
        g.push('    // width:100% 自适应父级，height:300px 固定高度，overflow:hidden 防止动效溢出');
        g.push('    // border-radius 用平台变量 var(--theme-inner-radius)，禁止硬编码');
        g.push('    return \'&lt;div style="width:100%;height:300px;overflow:hidden;');
        g.push('      border-radius:var(--theme-inner-radius,26px);');
        g.push('      background:linear-gradient(180deg,');
        g.push('        hsl(calc(var(--accent-hue)+10),var(--theme-sat),var(--theme-lum)),');
        g.push('        hsl(var(--accent-hue),var(--theme-sat),calc(var(--theme-lum) * 0.85)),');
        g.push('        hsl(calc(var(--accent-hue)-10),var(--theme-sat),calc(var(--theme-lum) * 0.6)));');
        g.push('      display:flex;align-items:center;justify-content:center"&gt;');
        g.push('      &lt;h2 style="color:rgba(255,255,255,.85)"&gt;✨ 我的主题&lt;/h2&gt;');
        g.push('      &lt;/div&gt;\';');
        g.push('  }');
        g.push('};');
        g.push('window.__bamboo_theme_我的主题 = theme;</code></pre>');
        g.push('</div>');
        g.push('<div class="theme-guide-section">');
        g.push('<h3>⚠️ 异步安全</h3>');
        g.push('<p>切换主题时 <code>destroy()</code> 被调用，但异步回调（<code>setTimeout</code>/<code>requestAnimationFrame</code>/<code>gsap.onComplete</code>）可能仍在队列中，回调触发时 DOM 已被清空。</p>');
        g.push('<p><strong>必须做到：</strong></p>');
        g.push('<ol>');
        g.push('<li><code>init(container)</code> 里存 <code>this._container = container</code></li>');
        g.push('<li>所有 <code>setTimeout</code> 返回 ID 存入数组，<code>destroy()</code> 里 <code>clearTimeout</code> 全部清掉</li>');
        g.push('<li>所有异步回调入口加 <code>if (!this._container) return</code></li>');
        g.push('<li>如有 GSAP：<code>destroy()</code> 里 <code>gsap.killTweensOf(container.querySelectorAll(\'*\'))</code></li>');
        g.push('</ol>');
        g.push('<p>GSAP 通过 <code>window.gsap</code> 全局可用，主题无需 bundler，直接用。</p>');
        g.push('</div>');
        g.push('</div>');
        var guide = g.join('\n');

        PanelManager.open('theme-guide', '主题动效 · 开发指南', guide, {
            width: '500px',
            onClose: function() {}
        });

        // 绑定 AI 辅助创建按钮
        var el = this;
        var panel = document.getElementById('panel-theme-guide');
        if (panel) {
            var aiBtn = panel.querySelector('#aiWizardBtn');
            if (aiBtn) {
                aiBtn.addEventListener('click', function() {
                    PanelManager.close();
                    el.showAIWizard();
                });
            }
        }
    },

    /** AI 辅助创建主题 — 多步向导 */
    showAIWizard() {
        var el = this;
        var step = 1;
        var promptText = '';

        var content = [];
        // 步骤指示器
        content.push('<div class="ai-wizard">');
        content.push('<div class="ai-wizard-steps">');
        content.push('  <span class="ai-wizard-dot active"></span>');
        content.push('  <span class="ai-wizard-line"></span>');
        content.push('  <span class="ai-wizard-dot"></span>');
        content.push('  <span class="ai-wizard-line"></span>');
        content.push('  <span class="ai-wizard-dot"></span>');
        content.push('</div>');

        // 步骤 1: 输入信息 + 风格选项
        content.push('<div class="ai-wizard-body" id="wizardStep1">');
        content.push('  <label class="ai-wizard-label">主题名称</label>');
        content.push('  <input class="ai-wizard-input" id="wizName" placeholder="如：星空、深海、樱花" maxlength="20">');
        content.push('  <label class="ai-wizard-label">风格描述</label>');
        content.push('  <textarea class="ai-wizard-textarea" id="wizDesc" placeholder="用一句话描述你想要的视觉效果，如：深蓝色星空背景，有流星划过和星光闪烁" rows="2" maxlength="200"></textarea>');

        // 风格可选项
        content.push('  <div class="ai-wizard-options">');
        // 明暗适配
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">明暗适配</div>');
        content.push('      <div class="ai-wizard-opt-row">');
        content.push('        <button class="ai-wizard-opt active" data-group="darkMode" data-val="auto">自动适配</button>');
        content.push('        <button class="ai-wizard-opt" data-group="darkMode" data-val="fine">精细控制</button>');
        content.push('        <button class="ai-wizard-opt" data-group="darkMode" data-val="none">仅亮色</button>');
        content.push('      </div>');
        content.push('    </div>');
        // 动效程度
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">动效程度</div>');
        content.push('      <div class="ai-wizard-opt-row">');
        content.push('        <button class="ai-wizard-opt" data-group="anim" data-val="none">静态</button>');
        content.push('        <button class="ai-wizard-opt active" data-group="anim" data-val="light">轻量</button>');
        content.push('        <button class="ai-wizard-opt" data-group="anim" data-val="rich">丰富</button>');
        content.push('      </div>');
        content.push('    </div>');
        // 画面复杂度
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">画面复杂度</div>');
        content.push('      <div class="ai-wizard-opt-row">');
        content.push('        <button class="ai-wizard-opt" data-group="complexity" data-val="simple">简约</button>');
        content.push('        <button class="ai-wizard-opt active" data-group="complexity" data-val="medium">中等</button>');
        content.push('        <button class="ai-wizard-opt" data-group="complexity" data-val="rich">丰富</button>');
        content.push('      </div>');
        content.push('    </div>');
        content.push('  </div>');

        // 高级选项（折叠面板）
        content.push('  <button class="ai-wizard-adv-toggle" id="advToggle">⚙ 高级选项 ▸</button>');
        content.push('  <div class="ai-wizard-adv-body" id="advBody" style="display:none">');

        // 技法标签（多选）
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">技法标签</div>');
        content.push('      <div class="ai-wizard-tag-grid">');
        // 空间与氛围
        content.push('        <span class="ai-wizard-tag-cat">空间氛围</span>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="parallax">视差分层</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="fog">雾气飘动</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="cloud">云层漂移</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="dof">景深模糊</button>');
        // 光影效果
        content.push('        <span class="ai-wizard-tag-cat">光影效果</span>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="gradient-breath">渐变呼吸</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="light-scan">光线扫描</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="glow">光晕弥散</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="pulse">脉动闪烁</button>');
        // 粒子与流体
        content.push('        <span class="ai-wizard-tag-cat">粒子流体</span>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="particle">粒子漂浮</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="ripple">涟漪波纹</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="snow">雪花飘落</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="fire">火焰闪烁</button>');
        // 图形与几何
        content.push('        <span class="ai-wizard-tag-cat">图形几何</span>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="svg">SVG 图形</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="canvas">Canvas 渲染</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="3d">3D 透视</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="geom">几何变换</button>');
        // 自然模拟
        content.push('        <span class="ai-wizard-tag-cat">自然模拟</span>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="sway">植被摇曳</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="starline">星空连线</button>');
        content.push('        <button class="ai-wizard-tag" data-group="technique" data-val="petal">花瓣飘落</button>');
        content.push('      </div>');
        content.push('    </div>');

        // 视觉纵深（单选）
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">视觉纵深</div>');
        content.push('      <div class="ai-wizard-opt-row">');
        content.push('        <button class="ai-wizard-opt" data-group="layers" data-val="one">平面</button>');
        content.push('        <button class="ai-wizard-opt active" data-group="layers" data-val="two">远近</button>');
        content.push('        <button class="ai-wizard-opt" data-group="layers" data-val="three">纵深</button>');
        content.push('      </div>');
        content.push('    </div>');

        // 镜头语言（多选）
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">镜头语言</div>');
        content.push('      <div class="ai-wizard-opt-row">');
        content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="zoom">缓慢推拉</button>');
        content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="pan">横移运镜</button>');
        content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="focus">焦点切换</button>');
        content.push('        <button class="ai-wizard-tag" data-group="camera" data-val="angle">俯仰视角</button>');
        content.push('      </div>');
        content.push('    </div>');

        // 构图版式（多选）
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">构图版式</div>');
        content.push('      <div class="ai-wizard-tag-grid">');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="center">居中</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="symmetry">对称</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="diagonal">对角线</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="circle">圆形</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="ring">环形</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="rule-of-thirds">三分法</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="golden-ratio">黄金分割</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="frame">框架式</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="radial">放射线</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="s-curve">S 形</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="triangle">三角形</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="scatter">散点式</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="full-bleed">满版</button>');
        content.push('        <button class="ai-wizard-tag" data-group="comp" data-val="whitespace">留白</button>');
        content.push('      </div>');
        content.push('    </div>');

        // 性能取向（单选）
        content.push('    <div class="ai-wizard-opt-group">');
        content.push('      <div class="ai-wizard-opt-label">性能取向</div>');
        content.push('      <div class="ai-wizard-opt-row">');
        content.push('        <button class="ai-wizard-opt active" data-group="perf" data-val="smooth">流畅优先</button>');
        content.push('        <button class="ai-wizard-opt" data-group="perf" data-val="quality">效果优先</button>');
        content.push('      </div>');
        content.push('    </div>');

        content.push('  </div>');

        content.push('  <div class="ai-wizard-desc-hint">Ctrl+Enter 快速生成</div>');
        content.push('  <div class="ai-wizard-btn-row">');
        content.push('    <button class="ai-wizard-btn primary" id="wizNext1">生成 AI 提示词 →</button>');
        content.push('  </div>');
        content.push('</div>');

        // 步骤 2: 显示提示词
        content.push('<div class="ai-wizard-body" id="wizardStep2" style="display:none">');
        content.push('  <div class="ai-wizard-hint">将以下提示词复制给 AI（如 WorkBuddy、Claude、GPT），AI 会帮你写出完整的主题代码。</div>');
        content.push('  <div class="ai-wizard-prompt" id="wizPrompt"></div>');
        content.push('  <div class="ai-wizard-btn-row">');
        content.push('    <button class="ai-wizard-btn secondary" id="wizBack2">← 返回修改</button>');
        content.push('    <button class="ai-wizard-btn primary" id="wizCopy">📋 复制到剪贴板</button>');
        content.push('  </div>');
        content.push('</div>');

        // 步骤 3: 完成引导
        content.push('<div class="ai-wizard-body" id="wizardStep3" style="display:none">');
        content.push('  <div class="ai-wizard-done-icon">✅</div>');
        content.push('  <h3 class="ai-wizard-done-title">提示词已复制</h3>');
        content.push('  <div class="ai-wizard-done-steps">');
        content.push('    <div class="ai-wizard-done-step">');
        content.push('      <span class="ai-wizard-done-num">1</span>');
        content.push('      <span>将提示词粘贴给 AI，获取完整 <code>.js</code> 代码</span>');
        content.push('    </div>');
        content.push('    <div class="ai-wizard-done-step">');
        content.push('      <span class="ai-wizard-done-num">2</span>');
        content.push('      <span>在 Vault 的 <code>竹林复盘主题/</code> 文件夹中保存为 <code id="wizFileName">主题.js</code></span>');
        content.push('    </div>');
        content.push('    <div class="ai-wizard-done-step">');
        content.push('      <span class="ai-wizard-done-num">3</span>');
        content.push('      <span>回到这里，在「主题动效」面板中切换你创建的主题</span>');
        content.push('    </div>');
        content.push('  </div>');
        content.push('  <div class="ai-wizard-btn-row">');
        content.push('    <button class="ai-wizard-btn secondary" id="wizBack3">← 返回查看提示词</button>');
        content.push('    <button class="ai-wizard-btn primary" id="wizDone">完成</button>');
        content.push('  </div>');
        content.push('</div>');
        content.push('</div>');

        PanelManager.open('ai-wizard', 'AI 辅助创建主题', content.join('\n'), {
            width: '460px',
            onClose: function() {}
        });

        var panel = document.getElementById('panel-ai-wizard');
        if (!panel) return;

        // 生成提示词模板
        function generatePrompt(name, desc, opts, adv) {
            var darkModeInstructions = '';
            if (opts.darkMode === 'auto') {
                darkModeInstructions = '使用 var(--theme-lum)（亮=80%, 暗=22%）和 var(--theme-sat)（亮=35%, 暗=25%）自动适配明暗，写一套代码即可。';
            } else if (opts.darkMode === 'fine') {
                darkModeInstructions = '使用 [data-theme-mode="dark"] 属性选择器分别编写亮色和暗色两套 CSS，亮色用浅色背景、深色文字，暗色用深色背景、浅色文字。wrapper 元素上设有 data-theme-mode="light"|"dark"。';
            } else {
                darkModeInstructions = '不需要处理暗色模式，保持固定颜色即可。';
            }

            var animInstructions = '';
            if (opts.anim === 'none') {
                animInstructions = '不需要任何动画效果，纯静态画面。';
            } else if (opts.anim === 'light') {
                animInstructions = '使用 1-2 个简单的 CSS animation（如淡入、缓慢漂移、呼吸效果），不使用复杂的粒子系统或物理模拟。';
            } else {
                animInstructions = '可以使用丰富的动画效果：CSS animation、requestAnimationFrame 循环、粒子效果等，追求视觉冲击力。';
            }

            var complexityInstructions = '';
            if (opts.complexity === 'simple') {
                complexityInstructions = '保持画面简约，用纯色渐变和大色块，元素数量控制在 3 个以内，代码简洁。';
            } else if (opts.complexity === 'medium') {
                complexityInstructions = '画面层次适中，可以有 4-8 个视觉元素，使用渐变色和简单几何图形。';
            } else {
                complexityInstructions = '画面元素丰富，可以用多层渐变、SVG 图形、纹理等复杂视觉手段。';
            }

            // 高级选项
            var advParts = [];
            if (adv.techniques && adv.techniques.length > 0) {
                var techMap = {
                    'parallax': '视差分层（多个元素以不同速度运动产生深度感）',
                    'fog': '雾气飘动（半透明遮罩层缓慢平移，制造朦胧氛围）',
                    'cloud': '云层漂移（大面积柔和形状横向移动）',
                    'dof': '景深模糊（前景/背景模糊，突出中间主体）',
                    'gradient-breath': '渐变呼吸（背景色周期性深浅变化）',
                    'light-scan': '光线扫描（一道光束扫过画面）',
                    'glow': '光晕弥散（光源周围柔和的径向渐变光晕）',
                    'pulse': '脉动闪烁（元素周期性明暗或大小变化）',
                    'particle': '粒子漂浮（大量小圆点或其他形状随机漂浮上升）',
                    'ripple': '涟漪波纹（从中心向外扩散的圆形波纹）',
                    'snow': '雪花飘落（白色粒子从顶部缓慢下落并水平漂移）',
                    'fire': '火焰闪烁（不规则形状的橙红暖色闪烁效果）',
                    'svg': 'SVG 图形（用内联 SVG 绘制几何图形）',
                    'canvas': 'Canvas 渲染（用 JS Canvas 绘制复杂动态画面）',
                    '3d': '3D 透视（CSS 3D transform 营造空间纵深感）',
                    'geom': '几何变换（图形的旋转、缩放、位移组合）',
                    'sway': '植被摇曳（树枝/草叶的周期性弯曲摆动）',
                    'starline': '星空连线（星星之间的连线、星座图效果）',
                    'petal': '花瓣飘落（花瓣形粒子旋转飘落）'
                };
                var techDesc = adv.techniques.map(function(t) { return techMap[t] || t; });
                advParts.push('技法：' + techDesc.join('、'));
            }
            if (adv.layers) {
                var layerMap = { 'one': '单层平铺，所有元素在同一平面', 'two': '双层结构：主体层 + 背景层', 'three': '三层结构：前景层 + 主体层 + 背景层，层层叠加产生空间深度' };
                advParts.push('视觉纵深：' + (layerMap[adv.layers] || '双层'));
            }
            if (adv.composition && adv.composition.length > 0) {
                var compMap = {
                    'center': '居中构图（主体位于画面正中央，稳定、聚焦）',
                    'symmetry': '对称构图（左右镜像对称，平衡、庄重）',
                    'diagonal': '对角线构图（元素沿对角线分布，动感、张力）',
                    'circle': '圆形构图（元素围绕中心环形排列，循环、聚焦）',
                    'ring': '环形构图（元素沿环形路径分布运动，流动、循环感）',
                    'rule-of-thirds': '三分法构图（九宫格，主体在交叉点，自然舒适）',
                    'golden-ratio': '黄金分割构图（元素沿黄金比例线分布，经典美感）',
                    'frame': '框架式构图（用前景元素框住主体，如窗框、树枝、拱门）',
                    'radial': '放射线构图（从中心向外辐射，视觉爆发力）',
                    's-curve': 'S 形构图（元素蜿蜒流动分布，优雅、引导视线）',
                    'triangle': '三角形构图（元素形成三角稳定结构）',
                    'scatter': '散点式构图（元素分散自由分布，轻松自然）',
                    'full-bleed': '满版构图（元素填满整个画面，饱满、沉浸）',
                    'whitespace': '留白构图（大面积空白，极简、呼吸感）'
                };
                var compDesc = adv.composition.map(function(c) { return compMap[c] || c; });
                advParts.push('构图版式：' + compDesc.join('、'));
            }
            if (adv.camera && adv.camera.length > 0) {
                var camMap = {
                    'zoom': '缓慢推拉（画面周期性zoom in/out）',
                    'pan': '横移运镜（画面内容横向平移）',
                    'focus': '焦点切换（不同元素间轮流聚焦/失焦）',
                    'angle': '俯仰视角（透视角度变化，俯瞰或仰视感）'
                };
                var camDesc = adv.camera.map(function(c) { return camMap[c] || c; });
                advParts.push('镜头语言：' + camDesc.join('、'));
            }
            if (adv.perf) {
                advParts.push('性能取向：' + (adv.perf === 'smooth' ? '流畅优先，控制帧率和计算量，避免卡顿' : '效果优先，不限制计算复杂度，追求极致视觉效果'));
            }

            var advancedSection = advParts.length > 0 ? '\n【高级要求】\n' + advParts.map(function(p) { return '- ' + p; }).join('\n') + '\n' : '';

            return [
                '你是一位前端动效专家，擅长 CSS 动画和视觉效果。请帮我创建一个竹林复盘插件的自定义主题动效文件。',
                '',
                '【我的需求】',
                '主题名称：' + name,
                '风格描述：' + desc,
                '',
                '【接口规范（严格遵守）】',
                '- 文件名：' + name + '.js',
                '- 变量名：window.__bamboo_theme_' + name + ' = { theme对象 }',
                '- theme 对象必须包含：name（字符串）、render()（返回 HTML 字符串，作为动效容器的 innerHTML）',
                '- 可选：init(container)（初始化逻辑，平台传入根元素）、destroy()（清理逻辑，必须清所有定时器和 GSAP tweens）',
                '- 示例结构：',
                '```js',
                'const theme = {',
                '  name: "' + name + '",',
                '  render() { return `<div>...</div>`; },',
                '  init(container) {},',
                '  destroy() {}',
                '};',
                'window.__bamboo_theme_' + name + ' = theme;',
                '```',
                '',
                '【跟随主题色】',
                '- 色相跟随：hsl(var(--accent-hue), 饱和度%, 明度%)',
                '- 明度偏移：calc(L% + var(--accent-lightness-offset))',
                '',
                '【平台 CSS 变量（必须使用，禁止硬编码）】',
                '- --theme-inner-radius：内框圆角（当前=26px），容器 border-radius 必须用 var(--theme-inner-radius)，外层改大时自动对齐',
                '- --accent-hue：色相（跟随用户色相滑块）',
                '- --accent-lightness-offset：明度偏移',
                '- --theme-lum：明暗自适应（亮=80%, 暗=22%）',
                '- --theme-sat：饱和度自适应（亮=35%, 暗=25%）',
                '',
                '【明暗模式】',
                darkModeInstructions,
                '',
                '【动效程度】',
                animInstructions,
                '',
                '【画面复杂度】',
                complexityInstructions,
                advancedSection,
                '【输出要求】',
                '- 只输出完整的 .js 文件内容，我可以直接保存使用',
                '- 不要包含任何解释、注释之外的多余文字',
                '- HTML 使用内联 style 拼接，可以包含 <style> 标签',
                '- 动效使用 requestAnimationFrame 或 CSS animation/@keyframes',
                '- 容器宽度必须为 100%（自适应父级，父级宽度 400~1600px 动态变化），高度固定 250~400px',
                '- 容器 border-radius 必须使用 var(--theme-inner-radius)（平台变量），禁止硬编码具体 px 值',
                '- 容器必须设置 overflow: hidden，防止动效穿透圆角边界',
                '- 推荐加 contain: paint 隔离绘制，提升渲染性能',
                '- 所有水平定位必须用百分比或动态计算（container.offsetWidth），禁止使用固定 px 宽度',
                '- 确保代码可以直接运行，不使用未声明的变量',
                '',
                '开始编写。'
            ].join('\n');
        }

        // 切换到指定步骤
        function showStep(n) {
            step = n;
            for (var i = 1; i <= 3; i++) {
                var body = panel.querySelector('#wizardStep' + i);
                if (body) body.style.display = i === n ? '' : 'none';
            }
            // 更新步骤点
            var dots = panel.querySelectorAll('.ai-wizard-dot');
            dots.forEach(function(d, idx) {
                d.classList.toggle('active', idx + 1 <= n);
                d.classList.toggle('done', idx + 1 < n);
            });
            // 更新步骤行颜色
            var stepsEl = panel.querySelector('.ai-wizard-steps');
            if (stepsEl) stepsEl.setAttribute('data-step', n);
        }

        // 步骤 1→2: 生成提示词
        var next1 = panel.querySelector('#wizNext1');
        if (next1) {
            next1.addEventListener('click', function() {
                var name = (panel.querySelector('#wizName').value || '').trim();
                var desc = (panel.querySelector('#wizDesc').value || '').trim();
                if (!name || !desc) {
                    Toast.showToast('请填写主题名称和风格描述', 'warning');
                    return;
                }
                // 收集风格选项
                var getOptVal = function(group) {
                    var activeBtn = panel.querySelector('.ai-wizard-opt.active[data-group="' + group + '"]');
                    return activeBtn ? activeBtn.dataset.val : '';
                };
                // 收集多选标签值
                var getMultiVals = function(group) {
                    var vals = [];
                    panel.querySelectorAll('.ai-wizard-tag.active[data-group="' + group + '"]').forEach(function(b) {
                        vals.push(b.dataset.val);
                    });
                    return vals;
                };
                var opts = {
                    darkMode: getOptVal('darkMode') || 'auto',
                    anim: getOptVal('anim') || 'light',
                    complexity: getOptVal('complexity') || 'medium'
                };
                var adv = {
                    techniques: getMultiVals('technique'),
                    layers: getOptVal('layers') || 'two',
                    composition: getMultiVals('comp'),
                    camera: getMultiVals('camera'),
                    perf: getOptVal('perf') || 'smooth'
                };
                promptText = generatePrompt(name, desc, opts, adv);
                panel.querySelector('#wizPrompt').textContent = promptText;
                panel.querySelector('#wizFileName').textContent = name + '.js';
                showStep(2);
            });
        }

        function copyToClipboard(text, cb) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(cb).catch(function() {
                    fallbackCopy(text, cb);
                });
            } else {
                fallbackCopy(text, cb);
            }
        }

        function fallbackCopy(text, cb) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            cb();
        }

        // 步骤 2→3: 复制
        var copyBtn = panel.querySelector('#wizCopy');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                copyToClipboard(promptText, function() {
                    Toast.showToast('提示词已复制到剪贴板', 'success');
                    showStep(3);
                });
            });
        }

        // 步骤 2→1: 返回修改
        var back2 = panel.querySelector('#wizBack2');
        if (back2) {
            back2.addEventListener('click', function() { showStep(1); });
        }

        // 步骤 3→2: 返回查看
        var back3 = panel.querySelector('#wizBack3');
        if (back3) {
            back3.addEventListener('click', function() { showStep(2); });
        }

        // 完成
        var doneBtn = panel.querySelector('#wizDone');
        if (doneBtn) {
            doneBtn.addEventListener('click', function() {
                PanelManager.close();
            });
        }

        // 快捷键: Ctrl+Enter 快速生成
        var wizDesc = panel.querySelector('#wizDesc');
        if (wizDesc) {
            wizDesc.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    var n1 = panel.querySelector('#wizNext1');
                    if (n1) n1.click();
                }
            });
        }

        // 风格选项按钮切换（单选，支持点击取消）
        panel.querySelectorAll('.ai-wizard-opt').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var group = btn.dataset.group;
                var isActive = btn.classList.contains('active');
                // 同一组内取消全部
                panel.querySelectorAll('.ai-wizard-opt[data-group="' + group + '"]').forEach(function(b) {
                    b.classList.remove('active');
                });
                // 如果之前未选中，才选中当前；如果已选中则变为取消状态
                if (!isActive) {
                    btn.classList.add('active');
                }
            });
        });

        // 技法标签和镜头语言标签（多选切换）
        panel.querySelectorAll('.ai-wizard-tag').forEach(function(btn) {
            btn.addEventListener('click', function() {
                btn.classList.toggle('active');
            });
        });

        // 高级选项折叠切换（收起时清空所有高级选项）
        var advToggle = panel.querySelector('#advToggle');
        var advBody = panel.querySelector('#advBody');
        if (advToggle && advBody) {
            advToggle.addEventListener('click', function() {
                var isOpen = advBody.style.display !== 'none';
                if (isOpen) {
                    // 收起：清空所有高级选项选择
                    // 清除所有 tag active
                    advBody.querySelectorAll('.ai-wizard-tag.active').forEach(function(t) {
                        t.classList.remove('active');
                    });
                    // 清除所有 opt active（单选组）
                    advBody.querySelectorAll('.ai-wizard-opt.active').forEach(function(o) {
                        o.classList.remove('active');
                    });
                }
                advBody.style.display = isOpen ? 'none' : '';
                advToggle.innerHTML = '⚙ 高级选项 ' + (isOpen ? '▸' : '▾');
            });
        }
    },

    destroy() {
        this._intervals.forEach(id => clearInterval(id));
        this._intervals = [];
    },

    /** 打开主题选择面板（FAB 菜单入口） */
    showThemePanel() {
        const themeList = this.getThemeList();
        const current = this.currentTheme;

        const cards = themeList.map(t => `
            <button class="theme-panel-card ${t.id === current ? 'active' : ''}"
                    data-theme="${t.id}"
                    title="${t.name}">
                <span class="theme-panel-card-name">${t.name}</span>
            </button>
        `).join('');

        // 当前主题的独立设置（按当前模式读取）
        var mode = this._getCurrentMode();
        var modeLabel = mode === 'dark' ? '暗色' : '亮色';
        var cur = this._getModeSetting(current, mode);
        var hasTune = cur.hue !== null || cur.lightness !== null;

        var content = [
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

            '<div class="theme-panel-help">',
                '<button class="theme-panel-help-btn" id="themeHelpBtn">',
                    '<span>如何制作自定义主题？</span>',
                '</button>',
            '</div>'
        ].join('\n');

        PanelManager.open('theme', '主题动效', content, {
            width: '400px',
            onClose: () => {}
        });

        var panel = document.getElementById('panel-theme');
        if (!panel) return;

        var el = this;

        // 主题卡片点击
        panel.querySelectorAll('.theme-panel-card').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var themeName = btn.dataset.theme;
                if (!themeName || themeName === el.currentTheme) return;
                el.switchTheme(themeName);
                PanelManager.close();
            });
        });

        // 帮助按钮
        var helpBtn = panel.querySelector('#themeHelpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', function() {
                PanelManager.close();
                el.showThemeGuide();
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
};

window.ThemeEffects = ThemeEffects;
