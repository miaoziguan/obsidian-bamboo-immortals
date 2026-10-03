/**
 * ModuleManager - 竹林模块系统的 webapp 侧管理器
 *
 * 两套入口，共用同一套「取代码 → 审计 → 沙箱执行」管线：
 *  1. initModuleFab()   —— 主应用（app.html）：把已安装模块声明的按钮注入悬浮菜单。
 *     只消费宿主解析出的元数据，**不执行任何模块代码**（按需原则：用户没打开就别执行）。
 *  2. initModuleView()  —— 模块视图（module.html）：等宿主注入 moduleId → 取回代码 →
 *     沙箱执行 → 调模块的 mount(container, api) 渲染。
 *
 * 安全模型与主题系统完全一致（见 theme-effects.js _evalTheme / _auditThemeCode）：
 *  - 静态审计拦截 window.parent/top/opener、fetch、XHR、WebSocket、document.cookie、
 *    eval、new Function、import、sendBeacon；
 *  - 执行期清空上述越权全局量，并为 localStorage/sessionStorage/indexedDB 注入内存垫片
 *    （data: URL 下这三个是「读取即抛 SecurityError」的 getter，既读不到也不能重定义）；
 *  - 模块与宿主的通信只能走注入的 api（4 个能力），拿不到 postMessage 通道。
 */
import { byId } from '../utils/domRef.js';

export const ModuleManager = {
    /** 当前已挂载模块：{ id, mod, container } */
    _mounted: null,
    /** 模块视图：宿主注入的 moduleId（等待中的 promise） */
    _contextPromise: null,
    _contextResolve: null,

    // ===================== 主应用：悬浮菜单按钮注入 =====================

    /**
     * 把已安装模块声明的按钮注入 FAB 菜单。
     * 模块未声明 fab 时不注入（纯后台型模块，或作者未配）。
     */
    async initModuleFab() {
        const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
        if (!mgr || typeof mgr.listModules !== 'function') {
            // 诊断：存储层未就绪时无法拉取模块清单（通常不影响功能，下次打开 FAB 会刷新）
            console.warn('[ModuleManager] storageManager 不可用，跳过 FAB 注入');
            return;
        }

        let modules = [];
        try {
            modules = await mgr.listModules();
        } catch (e) {
            console.warn('[ModuleManager] listModules 失败:', e && e.message);
            return;
        }
        if (!modules || modules.length === 0) return;

        // 必须走 DOM 抽象层：shadow 模式下 FAB 位于 shadowRoot 内，
        // document.getElementById 取不到（表现为「日志有模块、却静默不注入」）。
        const actions = byId('fabActions');
        if (!actions) {
            console.warn(
                '[ModuleManager] 未找到 #fabActions（DOM 根：' +
                (typeof window !== 'undefined' && window.__bambooShadowRoot ? 'shadowRoot' : 'document') +
                '），跳过注入'
            );
            return;
        }

        // 幂等：重复调用（视图重建 / 重载）先清掉上一轮注入的分组，避免按钮重复堆叠
        const staleGroup = actions.querySelector('.fab-action-group[data-modules-group]');
        if (staleGroup) staleGroup.remove();

        const row = document.createElement('div');
        row.className = 'fab-action-row';
        row.setAttribute('data-modules', '1');

        for (const m of modules) {
            if (!m.fab || !m.fab.label) {
                console.warn('[ModuleManager] 模块「' + m.id + '」缺失 fab 声明，跳过按钮注入');
                continue;
            }
            row.appendChild(this._createFabButton(m));
        }

        // 没有任何模块声明按钮时不插入空行（避免 FAB 菜单多出一条空白）
        if (row.children.length === 0) return;
        // 放进独立分组：严格匹配现有「.fab-action-group > .fab-action-row > .fab-action-btn」
        // 结构，保证 CSS 渲染与静态按钮一致。若直接挂到 fabActions（缺 .fab-action-group 父级），
        // 部分布局/可见性规则会失效，表现为「注入了却看不见」。
        const group = document.createElement('div');
        group.className = 'fab-action-group';
        group.setAttribute('data-modules-group', '1');
        const label = document.createElement('div');
        label.className = 'fab-group-label';
        label.textContent = '竹林模块';
        group.appendChild(label);
        group.appendChild(row);
        // 模块市场入口：逛市场安装更多模块（与已装模块并列，便于发现）
        const marketBtn = document.createElement('button');
        // 保留 .fab-action-btn：键盘导航 getMenuButtons() 依赖该选择器；
        // 追加 .fab-market-btn 把它从「图标磁贴」改成无图标的文字按钮。
        marketBtn.className = 'fab-action-btn fab-market-btn';
        marketBtn.setAttribute('role', 'menuitem');
        marketBtn.setAttribute('aria-label', '逛模块市场');
        const mLabel = document.createElement('span');
        mLabel.className = 'fab-btn-label';
        mLabel.textContent = '逛模块市场';
        marketBtn.appendChild(mLabel);
        marketBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof FABManager !== 'undefined' && FABManager && typeof FABManager.close === 'function') {
                FABManager.close();
            }
            ModuleManager.showModuleMarketPanel();
        });
        group.appendChild(marketBtn);
        actions.appendChild(group);
        // 注入后重算菜单高度：open() 在 initModuleFab 异步完成前已按旧高度设过 maxHeight，
        // 新按钮可能因此被裁掉，这里补一次定位。
        if (typeof FABManager !== 'undefined' && FABManager && typeof FABManager.positionPanel === 'function') {
            FABManager.positionPanel();
        }
    },

    /** 造一个与既有 FAB 按钮同构的按钮（同 class，可被键盘导航 / 外部点击关闭逻辑接管） */
    _createFabButton(meta) {
        const btn = document.createElement('button');
        btn.className = 'fab-action-btn';
        btn.setAttribute('role', 'menuitem');
        btn.setAttribute('aria-label', meta.fab.label || meta.name || meta.id);
        btn.setAttribute('data-action', 'module-' + meta.id);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'fab-btn-icon';
        const iconName = meta.fab.icon || 'package';
        if (typeof LucideUtils !== 'undefined' && typeof LucideUtils.createIcon === 'function') {
            iconSpan.innerHTML = LucideUtils.createIcon(iconName, { size: 18 });
        } else {
            iconSpan.textContent = '◈';
        }

        const labelSpan = document.createElement('span');
        labelSpan.className = 'fab-btn-label';
        labelSpan.textContent = meta.fab.label || meta.name || meta.id;

        btn.appendChild(iconSpan);
        btn.appendChild(labelSpan);

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
            if (mgr && typeof mgr.openModule === 'function') {
                void mgr.openModule(meta.id, meta.location || 'left');
            }
            // 与既有菜单项一致：点完收起菜单
            if (typeof FABManager !== 'undefined' && FABManager && typeof FABManager.close === 'function') {
                FABManager.close();
            }
        });

        return btn;
    },

    // ===================== 模块市场面板 =====================
    /** 打开「竹林模块市场」面板：拉清单 → 渲染 清单/安装/更新/卸载（照主题市场的 showMarketPanel） */
    async showModuleMarketPanel() {
        const el = this;
        if (byId('panel-module-market')) return; // 已打开则不重复
        const content = '<div class="market-loading">正在从竹林模块市场加载…</div>';
        PanelManager.open('module-market', '竹林模块市场', content, { width: '560px' });
        const panel = byId('panel-module-market');
        if (!panel) return;
        const body = panel.querySelector('.fab-panel-body');
        if (!body) return;
        const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
        if (!mgr || typeof mgr.fetchModuleMarketManifest !== 'function') {
            body.innerHTML = '<div class="market-empty">模块市场功能暂不可用</div>';
            return;
        }
        try {
            const data = await mgr.fetchModuleMarketManifest();
            if (!data || !data.manifest || !Array.isArray(data.manifest.modules) || data.manifest.modules.length === 0) {
                body.innerHTML = '<div class="market-empty">模块市场暂无模块</div>';
                return;
            }
            el._renderModuleMarketBody(body, data.manifest.modules, data.installed || {});
        } catch (e) {
            body.innerHTML = '<div class="market-empty">模块市场加载失败，请稍后重试</div>';
        }
    },

    /** 渲染模块市场列表：清单/安装/更新/卸载（复用主题市场 market-* CSS） */
    _renderModuleMarketBody(body, modules, installed) {
        const el = this;
        installed = installed || {};
        const cards = (modules || []).map(function (t) {
            const isInstalled = !!installed[t.id];
            const ver = t.version || '';
            const rec = installed[t.id];
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
                        (hasUpdate ? '<span class="market-update-badge">可更新 v' + ver + '</span>' : '') +
                    '</div>' +
                    (t.author ? '<div class="market-card-author">作者：' + t.author + (ver ? ' · v' + ver : '') + '</div>' : '') +
                '</div>' +
                '<div class="market-card-actions">' + btn + '</div>' +
            '</div>';
        }).join('');
        body.innerHTML = '<div class="market-list">' + cards + '</div>';

        body.querySelectorAll('.market-btn.install').forEach(function (b) {
            b.addEventListener('click', function () {
                const id = b.getAttribute('data-id');
                const url = b.getAttribute('data-url');
                const ver = b.getAttribute('data-version') || '';
                const isUpdate = b.getAttribute('data-action') === 'update';
                if (b.disabled) return;
                b.disabled = true;
                b.textContent = isUpdate ? '更新中…' : '安装中…';
                window.storageManager.installMarketModule(id, url, ver).then(function (ok) {
                    if (ok) {
                        installed[id] = { version: ver };
                        el._renderModuleMarketBody(body, modules, installed);
                        Toast.showToast('「' + ((modules.find(function (x) { return x.id === id; }) || {}).name || id) +
                            '」已安装，悬浮菜单将出现入口', 'success');
                    } else {
                        b.disabled = false;
                        b.textContent = isUpdate ? '更新失败，重试' : '安装失败，重试';
                    }
                });
            });
        });
        body.querySelectorAll('.market-btn.uninstall').forEach(function (b) {
            b.addEventListener('click', function () {
                const id = b.getAttribute('data-id');
                if (b.disabled) return;
                b.disabled = true; b.textContent = '卸载中…';
                window.storageManager.uninstallMarketModule(id).then(function (ok) {
                    if (ok) {
                        delete installed[id];
                        el._renderModuleMarketBody(body, modules, installed);
                        Toast.showToast('「' + id + '」已卸载', 'success');
                    } else {
                        b.disabled = false; b.textContent = '卸载失败，重试';
                    }
                });
            });
        });
    },

    // ===================== 模块视图：加载与挂载 =====================

    /**
     * 模块视图入口：等宿主告知本 leaf 承载哪个模块 → 取代码 → 沙箱执行 → mount。
     * @param {HTMLElement} root 挂载容器（module.html 的 #module-view-root）
     */
    async initModuleView(root) {
        const moduleId = await this._waitForModuleContext();
        if (!moduleId) {
            if (root) {
                root.innerHTML =
                    '<div class="module-empty">未指定要加载的模块。<br>请从悬浮菜单的「模块市场」安装并打开模块。</div>';
            }
            return;
        }
        await this._mountModule(moduleId, root);
    },

    /** 等待宿主注入 module:context（iframe load 时一次，app:ready 握手再补发一次） */
    _waitForModuleContext(timeoutMs = 5000) {
        if (this._contextPromise) return this._contextPromise;
        const self = this;
        this._contextPromise = new Promise((resolve) => {
            const handler = (event) => {
                // 只认来自宿主窗口的消息（同 bridge.js 的来源判定）
                if (event.source !== window.parent) return;
                const d = event.data;
                if (d && d.type === 'module:context' && typeof d.moduleId === 'string') {
                    window.removeEventListener('message', handler);
                    resolve(d.moduleId);
                }
            };
            window.addEventListener('message', handler);
            // 兜底超时：宿主若始终未注入，给出可读提示而不是永远空白
            window.setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve('');
            }, timeoutMs);
        });
        return this._contextPromise;
    },

    /** 取代码 → 沙箱执行 → mount */
    async _mountModule(moduleId, root) {
        const mgr = (typeof window !== 'undefined' && window.storageManager) || null;
        if (!mgr) {
            root.innerHTML = '<div class="module-empty">通信层未就绪，无法加载模块。</div>';
            return;
        }

        const code = await mgr.loadModuleCode(moduleId);
        if (!code) {
            root.innerHTML =
                '<div class="module-empty">模块「' + this._esc(moduleId) +
                '」的代码不存在或已损坏。<br>可到「模块市场」重新安装。</div>';
            return;
        }

        if (this._auditModuleCode(moduleId, code)) {
            root.innerHTML =
                '<div class="module-empty">模块「' + this._esc(moduleId) +
                '」包含被禁止的 API 调用，已拒绝加载。</div>';
            return;
        }

        const mod = this._evalModule(moduleId, code);
        if (!mod || typeof mod.mount !== 'function') {
            root.innerHTML =
                '<div class="module-empty">模块「' + this._esc(moduleId) + '」格式不正确（缺少 mount 方法）。</div>';
            return;
        }

        const container = document.createElement('div');
        container.className = 'module-root';
        root.innerHTML = '';
        root.appendChild(container);

        const id = moduleId;
        this._mounted = { id, mod, container };
        try {
            mod.mount(container, this._buildApi(id, mod));
        } catch (e) {
            console.error('[ModuleManager] 模块 "' + id + '" mount 失败:', e && e.message);
            container.innerHTML =
                '<div class="module-empty">模块「' + this._esc(id) + '」渲染失败：' + this._esc(e && e.message) + '</div>';
        }
    },

    /** 交给模块的能力集合（唯一 outbound 通道；不含任何 postMessage / fetch 能力） */
    _buildApi(id, mod) {
        const mgr = window.storageManager;
        return {
            id,
            name: (mod && mod.name) || id,
            /** 列出指定目录下的 markdown 文件（默认按修改时间倒序） */
            listFiles: (folder, recursive) => mgr.moduleListFiles(folder, recursive),
            /** 读取 vault 文件正文 */
            readFile: (path) => mgr.moduleReadFile(path),
            /** 用 Obsidian 原生阅读视图打开文件（中央新页签，不抢占模块视图） */
            openFile: (path) => mgr.moduleOpenFile(path),
            /** 把 vault 内文件路径解析成可渲染的资源 URL（头像/封面等）；不存在则返回 null */
            resolveResource: (path) => mgr.moduleResolveResource(path),
            /** 把 markdown 渲染为 HTML（侧栏内置阅读视图用） */
            renderMarkdown: (opts) => mgr.moduleRenderMarkdown(opts),
            /** 写入 vault 文件（博客模块「一键应用竹杖芒鞋排版」用） */
            writeFile: (path, content) => mgr.moduleWriteFile(path, content),
            /** 在宿主自建的竹杖芒鞋式阅读视图打开文章（中央视图） */
            openReader: (path) => mgr.moduleOpenReader(path),
            /**
             * 切换 Obsidian 基础明暗（博客模块「快门」改作明暗开关用）。
             * 宿主侧与画中卷·打字机机身明暗开关同一实现，切换后整条主题管线即时跟随。
             * @param {boolean} [isDark] 指定目标明暗；省略则取反当前
             */
            toggleTheme: (isDark) => mgr.moduleToggleTheme(isDark),
            /** 持久化模块自己的数据（data: URL 下无 localStorage，由宿主代管） */
            saveData: (data) => mgr.saveModuleData(id, data),
            /** 读回模块自己的数据；无数据时为 null */
            loadData: () => mgr.loadModuleData(id),
        };
    },

    /** 卸载当前模块（模块声明了 destroy 则调用） */
    destroyMounted() {
        if (!this._mounted) return;
        try {
            if (typeof this._mounted.mod.destroy === 'function') this._mounted.mod.destroy();
        } catch (e) {
            console.warn('[ModuleManager] 模块 destroy 出错:', e && e.message);
        }
        if (this._mounted.container) this._mounted.container.innerHTML = '';
        this._mounted = null;
    },

    // ===================== 沙箱：审计 + 执行 =====================

    /** 静态审计：与主题同一套规则（详见 theme-effects.js _auditThemeCode 的注释） */
    _auditModuleCode(id, code) {
        const noStrings = code
            .replace(/`(?:\\.|[^`\\])*`/g, '``')
            .replace(/'(?:\\.|[^'\\])*'/g, "''")
            .replace(/"(?:\\.|[^"\\])*"/g, '""');
        const stripped = noStrings
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');

        const rules = [
            { pattern: /\bwindow\.parent\b/, msg: 'window.parent' },
            { pattern: /\bwindow\.top\b/, msg: 'window.top' },
            { pattern: /\bwindow\.opener\b/, msg: 'window.opener' },
            { pattern: /\bfetch\s*\(/, msg: 'fetch()' },
            { pattern: /\bXMLHttpRequest\b/, msg: 'XMLHttpRequest' },
            { pattern: /\bWebSocket\b/, msg: 'WebSocket' },
            { pattern: /\bdocument\.cookie\b/, msg: 'document.cookie' },
            { pattern: /\beval\s*\(/, msg: 'eval()' },
            { pattern: /\bnew\s+Function\s*\(/, msg: 'new Function()' },
            { pattern: /\bimport\s*\(/, msg: 'import()' },
            { pattern: /\bimport\s+/, msg: 'import statement' },
            { pattern: /\bnavigator\.sendBeacon\b/, msg: 'navigator.sendBeacon' },
        ];
        for (const rule of rules) {
            if (rule.pattern.test(stripped)) {
                console.warn('[ModuleManager] 模块 "' + id + '" 包含危险 API 调用: ' + rule.msg + '，已拒绝加载');
                return true;
            }
        }
        return false;
    },

    /**
     * 安全执行模块代码并取出模块对象。
     * 模块约定把对象赋给 __bamboo_module_<id>（与主题 __bamboo_theme_<name> 同构）。
     */
    _evalModule(id, code) {
        try {
            // id 可能含非法标识符字符（如 my-module），转成安全变量名
            const varName = '__bamboo_module_' + String(id).replace(/[^A-Za-z0-9_$]/g, '_');
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
                try {
                    Object.defineProperty(window, key, { value: undefined, configurable: true, writable: false });
                } catch (_) { /* 部分环境不可重定义，忽略 */ }
            }

            let result = null;
            try {
                const func = new Function(
                    'window', 'self', 'localStorage', 'sessionStorage', 'indexedDB',
                    code + '; return typeof ' + varName + ' !== "undefined" ? ' + varName + ' : null;'
                );
                result = func(window, window, lsShim, ssShim, undefined);
            } finally {
                for (const key of BLANK) {
                    try {
                        Object.defineProperty(window, key, {
                            value: saved[key], configurable: true, writable: true,
                        });
                    } catch (_) { /* 忽略 */ }
                }
            }
            return result;
        } catch (e) {
            console.error('[ModuleManager] 执行模块 "' + id + '" 时出错:', e && e.message);
            return null;
        }
    },

    _esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
};

window.ModuleManager = ModuleManager;

// 自启动（与 WhiteNoiseManager / CustomTemplateManager 同一约定）：
// 按页面形态分流——module.html 有 #module-view-root → 走模块视图挂载；
// 主应用（app.html）没有 → 只往悬浮菜单注入模块按钮。
// 两条路径内部都会 await 通信层就绪（bridge 的 ensureReady），故此处无需等待握手。
if (typeof document !== 'undefined') {
    const boot = () => {
        const root = document.getElementById('module-view-root');
        if (root) {
            void ModuleManager.initModuleView(root);
        } else {
            void ModuleManager.initModuleFab();
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}
