import { byId, $ } from '../utils/domRef.js';
export const SettingsModal = {
    // 注：滑动切换日期 / 自动保存间隔 / 一炷香总时长 / 化雁间隔 已迁至原生「外观」页，
    // 由 bridge.getAppSettingsSync()（及各消费方）直接读取原生设置，此处不再保留字段与 UI。
    // 以下三个导出目录仅作「桥不可用」时的回退值；真源是原生设置页（见 bridge.getExportFolder）
    mmExportFolder: '思维子弹', // 思维子弹导出为 Markdown 的落库目录（Vault 相对路径，默认落到 vault 根）
    noteExportFolder: '便签',  // 便签导出为 Markdown 的落库目录（Vault 相对路径，默认落到 vault 根）
    writeExportFolder: 'MD可视化写作', // 写作模式（MD可视化写作）整篇快照导出为 Markdown 的落库目录（Vault 相对路径）

    // ---- Tab 内容渲染 ----

    _renderGeneralTab() {
        const { ui } = store.getState();
        const syncChecked = ui.autoSyncTheme ? 'checked' : '';
        // 跨天自动刷新当前配置（从 CrossDayRefresh 全局读取，未就绪则用默认 0 点）
        const cd = (typeof window !== 'undefined' && window.CrossDayRefresh) ? window.CrossDayRefresh : null;
        const cdMode = cd ? cd._mode : '00:00';
        const cdCustom = cd ? cd._custom : '00:00';

        return `
            <div class="fab-tab-content active" id="tab-content-general">
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">显示</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">自动跟随 Obsidian 明暗</div>
                            <div class="settings-item-desc">开启后，随 Obsidian 明暗模式自动切换明/暗</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${syncChecked} data-action="settings-toggle-sync-theme">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">显示天气</div>
                            <div class="settings-item-desc">在页面头部显示当前天气，数据来源 Open-Meteo，免注册</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${store.state.ui.weatherEnabled ? 'checked' : ''} data-action="settings-toggle-weather">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">默认城市</div>
                            <div class="settings-item-desc">天气显示的默认城市，重启后保留</div>
                        </div>
                        <input type="text" id="defaultCityInput" class="form-input" style="max-width:180px;"
                            value="${HTMLUtils.escapeHtmlAttr(store.state.ui.weatherCity || '')}"
                            placeholder="城市名，回车保存">
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">默认展开天气</div>
                            <div class="settings-item-desc">加载页面时，天气胶囊自动展开详情</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${store.state.ui.weatherExpanded ? 'checked' : ''} data-action="settings-toggle-weather-expanded">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">显示语录</div>
                            <div class="settings-item-desc">在头部右侧显示一句随机的竹林七贤语录，点击可换一条</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${store.state.ui.quoteEnabled ? 'checked' : ''} data-action="settings-toggle-quote">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">语录来源笔记</div>
                            <div class="settings-item-desc">指定 Obsidian 笔记名作为自定义语录来源，留空使用内置七贤语录</div>
                        </div>
                        <input type="text" id="quoteSourceInput" class="form-input" style="max-width:220px;"
                            value="${HTMLUtils.escapeHtmlAttr(store.state.ui.quoteSource || '')}"
                            placeholder="如 竹林语录.md">
                    </div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">交互行为</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">跨天自动刷新</div>
                            <div class="settings-item-desc">到设定时刻自动刷新首页到当天；从后台切回也会检查</div>
                        </div>
                        <div class="settings-item-control-row">
                            <select class="form-input settings-select-sm" id="crossDayMode">
                                <option value="00:00" ${cdMode === '00:00' ? 'selected' : ''}>0 点（默认）</option>
                                <option value="custom" ${cdMode === 'custom' ? 'selected' : ''}>自定义时间</option>
                            </select>
                            <input type="time" class="form-input settings-time-sm" id="crossDayTime" value="${HTMLUtils.escapeHtmlAttr(cdCustom)}" ${cdMode === 'custom' ? '' : 'hidden'}>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _renderDataTab() {
        const dataCount = Object.keys(store.getState().data).length;
        const today = new Date().toISOString().split('T')[0];
        return `
            <div class="fab-tab-content" id="tab-content-data">
                <div class="fab-panel-section">
                    <div class="data-section-header">
                        ${LucideUtils.createIcon('upload', { size: 18 })} 导出备份
                    </div>
                    <div class="data-action-card">
                        <button class="btn-primary-action" data-action="settings-export-data">
                            ${LucideUtils.createIcon('package', { size: 16 })} 一键打包全部数据
                        </button>
                        <div class="data-subgroup-label">
                            ${LucideUtils.createIcon('file', { size: 12 })} 单独导出文件
                        </div>
                        <div class="data-file-grid">
                            <button class="data-file-tile" data-action="settings-export-goals" title="导出 goals.json">
                                ${LucideUtils.createIcon('target', { size: 18 })}
                                <span class="data-file-tile-name">goals</span>
                                <span class="data-file-tile-sub">目标数据</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-export-settings" title="导出 settings.json">
                                ${LucideUtils.createIcon('settings', { size: 18 })}
                                <span class="data-file-tile-name">settings</span>
                                <span class="data-file-tile-sub">应用设置</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-export-purchase" title="导出 purchase-history.json">
                                ${LucideUtils.createIcon('shopping-cart', { size: 18 })}
                                <span class="data-file-tile-name">purchase</span>
                                <span class="data-file-tile-sub">购买历史</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-export-income" title="导出 income-history.json">
                                ${LucideUtils.createIcon('trending-up', { size: 18 })}
                                <span class="data-file-tile-name">income</span>
                                <span class="data-file-tile-sub">收入历史</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-export-days" title="导出 data/ 全部每日记录">
                                ${LucideUtils.createIcon('calendar-days', { size: 18 })}
                                <span class="data-file-tile-name">days</span>
                                <span class="data-file-tile-sub">每日记录</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="data-section-header">
                        ${LucideUtils.createIcon('download', { size: 18 })} 导入恢复
                    </div>
                    <div class="data-action-card">
                        <button class="btn-primary-action" data-action="settings-import-data" style="background: var(--bamboo-light);">
                            ${LucideUtils.createIcon('file-up', { size: 16 })} 导入完整备份
                        </button>
                        ${(() => {
                            try {
                                const meta = JSON.parse(localStorage.getItem('br_last_export'));
                                if (!meta || !meta.name) return '';
                                const t = new Date(meta.time);
                                const now = new Date();
                                const isToday = t.toDateString() === now.toDateString();
                                const label = isToday ? '今天' : `${t.getMonth()+1}月${t.getDate()}日`;
                                const timeStr = t.toLocaleTimeString('zh-CN', { hour:'2-digit', minute:'2-digit' });
                                return `<div class="data-last-export">
                                    ${LucideUtils.createIcon('history', { size: 12 })} 最近备份：<code>${meta.name}</code> · ${label} ${timeStr}
                                </div>`;
                            } catch (_) { return ''; }
                        })()}
                        <div class="data-hint-card">
                            ${LucideUtils.createIcon('info', { size: 14 })}
                            <span>完整备份文件以 <code>daily-review-</code> 开头，扩展名为 <code>.json</code>，支持预览与策略选择</span>
                        </div>
                        <div class="data-subgroup-label">
                            ${LucideUtils.createIcon('file-input', { size: 12 })} 单独导入文件
                        </div>
                        <div class="data-file-grid">
                            <button class="data-file-tile" data-action="settings-import-goals" title="仅恢复目标">
                                ${LucideUtils.createIcon('target', { size: 18 })}
                                <span class="data-file-tile-name">仅目标</span>
                                <span class="data-file-tile-sub">goals</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-import-settings" title="仅恢复设置">
                                ${LucideUtils.createIcon('settings', { size: 18 })}
                                <span class="data-file-tile-name">仅设置</span>
                                <span class="data-file-tile-sub">settings</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-import-purchase" title="仅恢复购买记录">
                                ${LucideUtils.createIcon('shopping-cart', { size: 18 })}
                                <span class="data-file-tile-name">仅购买</span>
                                <span class="data-file-tile-sub">purchase</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-import-income" title="仅恢复收入记录">
                                ${LucideUtils.createIcon('trending-up', { size: 18 })}
                                <span class="data-file-tile-name">仅收入</span>
                                <span class="data-file-tile-sub">income</span>
                            </button>
                            <button class="data-file-tile" data-action="settings-import-days" title="仅恢复每日记录">
                                ${LucideUtils.createIcon('calendar-days', { size: 18 })}
                                <span class="data-file-tile-name">仅每日</span>
                                <span class="data-file-tile-sub">days</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="danger-zone">
                        <div class="danger-zone-header">
                            ${LucideUtils.createIcon('alert-triangle', { size: 16 })} 危险操作区
                        </div>
                        <div class="settings-item-info" style="margin-bottom: 12px;">
                            <div class="settings-item-label">按日期裁剪历史记录</div>
                            <div class="settings-item-desc">当前 ${dataCount} 天，删除指定日期之前的所有记录</div>
                        </div>
                        <div class="settings-clear-row">
                            <input type="date" class="form-input settings-date-input" id="clearBeforeDate" max="${HTMLUtils.escapeHtmlAttr(today)}" placeholder="选择截止日期">
                            <button class="bm-btn bm-btn--sm bm-btn--danger" data-action="settings-confirm-clear-data">
                                ${LucideUtils.createIcon('trash', { size: 12 })} 清理
                            </button>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section fab-section-danger">
                    <div class="fab-panel-section-title">重置所有</div>
                    <div class="settings-item-info" style="margin-bottom: 10px;">
                        <div class="settings-item-label">清空全部数据并恢复初始状态</div>
                        <div class="settings-item-desc">包括每日记录、目标、余额、消费历史等所有数据</div>
                    </div>
                    <button class="bm-btn bm-btn--sm bm-btn--danger btn-block" data-action="settings-show-reset-modal">
                        ${LucideUtils.createIcon('alertTriangle', { size: 12 })} 重置所有数据
                    </button>
                </div>
            </div>
        `;
    },

    _renderAboutTab() {
        return `
            <div class="fab-tab-content" id="tab-content-about">
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">插件简介</div>
                    <div class="about-description">Bamboo Immortals（竹林修仙传）是一款基于苏联控制论之父维克托·格卢什科夫提出的"OGAS"理念，专为个人打造的中国风目标自动化分配管理系统。</div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">作者介绍</div>
                    <div class="about-author">
                        <div class="about-author-avatar"></div>
                        <div>
                            <div class="about-author-name">羽鳞君</div>
                            <div class="about-author-role">喵字馆 创始人</div>
                        </div>
                    </div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">Obsidian 插件作品</div>
                    <div class="about-works">
                        <span class="about-work-tag" onclick="window.open('https://github.com/miaoziguan/obsidian-Bamboo-Darts', '_blank')" style="cursor:pointer">竹叶飞刃</span>
                        <span class="about-work-tag" style="cursor:default">竹林修仙传</span>
                    </div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">联系方式</div>
                    <div class="about-contact">
                        <div class="about-contact-item">邮箱：yanyulin2100@qq.com</div>
                        <div class="about-contact-item">微信：yanhu94</div>
                    </div>
                </div>
            </div>
        `;
    },

    // ---- 打开面板 ----

    open() {
        const generalHtml = this._renderGeneralTab();
        const dataHtml = this._renderDataTab();
        const aboutHtml = this._renderAboutTab();

        const content = generalHtml + dataHtml + aboutHtml;

        PanelManager.open('settings', LucideUtils.createIcon('settings', { size: 16 }) + '设置', content, {
            tabs: [
                { id: 'general', label: '通用' },
                { id: 'data', label: '数据' },
                { id: 'about', label: '关于' }
            ],
            onOpen: () => {
                this._bindGeneralTabInputs();
            }
        });
    },

    /**
     * 绑定「通用」Tab 内直接挂在元素上的监听器。
     *
     * 这些控件刻意不带 data-action（取值需经各自 setter 做清洗/钳制，如
     * 天气城市的空值处理），因此走不了 ActionDispatcher 的事件委托，
     * 只能逐元素绑定。
     *
     * 【必须与 DOM 同步】_refreshTab('general') 会用 innerHTML 整体替换
     * #tab-content-general，新节点是「裸」的——监听器随旧节点一并被丢弃。
     * onOpen 只在面板打开时执行一次，故每次 replaceWith 之后都要重新调用本方法，
     * 否则表现为「点过某个开关后，本页其余设置项改了没反应且无任何提示」。
     */
    _bindGeneralTabInputs() {
        const cityInput = byId('defaultCityInput');
        if (cityInput) {
            const saveCity = () => {
                const val = (cityInput.value || '').trim();
                this.setWeatherCity(val.length > 0 ? val : '');
            };
            cityInput.addEventListener('blur', saveCity);
            cityInput.addEventListener('change', saveCity);
            cityInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cityInput.blur();
                }
            });
        }
        const quoteInput = byId('quoteSourceInput');
        if (quoteInput) {
            const saveQuote = () => {
                const val = (quoteInput.value || '').trim();
                this.setQuoteSource(val);
            };
            quoteInput.addEventListener('blur', saveQuote);
            quoteInput.addEventListener('change', saveQuote);
            quoteInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    quoteInput.blur();
                }
            });
        }
        // 跨天自动刷新
        const cdMode = byId('crossDayMode');
        const cdTime = byId('crossDayTime');
        if (cdMode && cdTime) {
            const saveCrossDay = () => {
                const mode = (cdMode.value === 'custom') ? 'custom' : '00:00';
                cdTime.hidden = (mode !== 'custom');
                const custom = (mode === 'custom') ? (cdTime.value || '00:00') : '00:00';
                this.setCrossDaySchedule(mode, custom);
            };
            cdMode.addEventListener('change', saveCrossDay);
            cdTime.addEventListener('change', saveCrossDay);
        }
    },

    // ---- 通用 Tab 操作 ----

    setCrossDaySchedule(mode, custom) {
        // 持久化与定时器排期由独立引擎 CrossDayRefresh 负责
        if (typeof window !== 'undefined' && window.CrossDayRefresh && typeof window.CrossDayRefresh.setSchedule === 'function') {
            window.CrossDayRefresh.setSchedule(mode, custom);
        }
        const label = (mode === 'custom') ? `自定义时间 ${custom}` : '0 点（默认）';
        Toast.showToast(`跨天自动刷新设为 ${label}`, 'success');
    },

    // ---- 通用 Tab 操作（主题同步）----

    async toggleSyncTheme(enabled) {
        await store.setSyncTheme(enabled);
        // 开启同步时，立即跟随 Obsidian 当前主题
        if (enabled && typeof window !== 'undefined') {
            window.postMessage({ type: 'app:theme:sync' }, '*');
        }
        this._refreshTab('general');
    },

    async toggleWeather(enabled) {
        await store.setWeatherEnabled(enabled);
        if (typeof WeatherRenderer !== 'undefined') {
            WeatherRenderer.refresh();
        }
        this._refreshTab('general');
    },

    async setWeatherCity(city) {
        await store.setWeatherCity(city);
        // 保存后不要刷新 settings tab 的 DOM，避免破坏正在使用的输入框
        if (typeof WeatherRenderer !== 'undefined') {
            WeatherRenderer.refresh(true);
        }
        if (typeof Toast !== 'undefined' && typeof Toast.showToast === 'function') {
            const trimmed = (city || '').trim();
            Toast.showToast(trimmed.length > 0 ? ('默认城市：' + trimmed) : '默认城市已清除', 'success');
        }
    },

    async toggleWeatherExpanded(expanded) {
        await store.setWeatherExpanded(expanded);
        if (typeof WeatherRenderer !== 'undefined') {
            WeatherRenderer.refresh();
        }
        this._refreshTab('general');
    },

    async toggleQuoteEnabled(enabled) {
        await store.setQuoteEnabled(enabled);
        if (typeof QuoteRenderer !== 'undefined') {
            QuoteRenderer.refresh();
        }
        this._refreshTab('general');
    },

    async setQuoteSource(source) {
        await store.setQuoteSource(source);
        if (typeof QuoteRenderer !== 'undefined') {
            QuoteRenderer.refresh();
        }
        if (typeof Toast !== 'undefined' && typeof Toast.showToast === 'function') {
            const trimmed = (source || '').trim();
            Toast.showToast(trimmed.length > 0 ? ('语录来源：' + trimmed) : '语录来源已清除', 'success');
        }
        this._refreshTab('general');
    },

    // ---- 数据 Tab 操作 ----

    exportData() {
        DataIO.exportData();
    },

    // ---- 文件级导出 ----
    exportGoals() { DataIO.exportGoals(); },
    exportSettings() { DataIO.exportSettings(); },
    exportPurchaseHistory() { DataIO.exportPurchaseHistory(); },
    exportIncomeHistory() { DataIO.exportIncomeHistory(); },
    exportDays() { DataIO.exportDays(); },

    // ---- 文件级导入 ----
    importGoalsFromFile() { DataIO.importGoalsFromFile(); },
    importSettingsFromFile() { DataIO.importSettingsFromFile(); },
    importPurchaseHistoryFromFile() { DataIO.importPurchaseHistoryFromFile(); },
    importIncomeHistoryFromFile() { DataIO.importIncomeHistoryFromFile(); },
    importDaysFromFile() { DataIO.importDaysFromFile(); },

    openImportPreview() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backup = JSON.parse(event.target.result);
                    // 兼容 v3.0 (days/goals) 和旧格式 (data/globalGoals)
                    const daysKey = backup.days ? 'days' : (backup.data ? 'data' : null);
                    const goalsKey = backup.goals ? 'goals' : (backup.globalGoals ? 'globalGoals' : null);
                    if (!daysKey && !goalsKey) {
                        throw new Error('无效的备份文件');
                    }
                    this._pendingImportData = backup;
                    this.showImportPreview(backup);
                } catch (error) {
                    Toast.showToast('文件解析失败: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    showImportPreview(backup) {
        // 兼容 v3.0 和旧格式
        const daysData = backup.days || backup.data;
        const goalsData = backup.goals || backup.globalGoals;
        const dataKeys = daysData ? (Array.isArray(daysData) ? daysData.map((_, i) => i) : Object.keys(daysData)) : [];
        const goalCount = goalsData ? goalsData.length : 0;
        const hasData = dataKeys.length > 0;
        const hasGoals = goalCount > 0;

        // 解析商店数据
        const bal = backup.settings?.balance != null ? parseFloat(backup.settings.balance) : null;
        const phRecords = backup.purchaseHistory?.records || [];
        const ihRecords = backup.incomeHistory?.records || [];
        const hasShop = bal !== null || phRecords.length > 0 || ihRecords.length > 0;
        const totalSpent = hasShop ? phRecords.reduce((s, r) => s + (r.price || 0), 0) : 0;
        const totalEarnings = hasShop ? ihRecords.reduce((s, r) => s + (r.amount || 0), 0) : 0;

        const currentGoalCount = store.getState().globalGoals.length;
        const currentDataKeys = Object.keys(store.getState().data);
        const hasCurrentData = currentDataKeys.length > 0;
        const hasCurrentGoals = currentGoalCount > 0;

        const backupTime = backup.timestamp
            ? new Date(backup.timestamp).toLocaleString()
            : (backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : '未知');

        const content = `
            <div class="form-group">
                <label class="form-label">备份信息</label>
                <div class="import-preview-info">
                    <div class="import-preview-row">
                        <span class="import-preview-label">版本</span>
                        <span class="import-preview-value">${backup.version || '未知'}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">备份时间</span>
                        <span class="import-preview-value">${backupTime}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">每日记录</span>
                        <span class="import-preview-value">${hasData ? dataKeys.length + ' 天' : '无'}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">目标数据</span>
                        <span class="import-preview-value">${hasGoals ? goalCount + ' 个' : '无'}</span>
                    </div>
                    ${hasShop ? `
                    <div class="import-preview-divider"></div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">余额</span>
                        <span class="import-preview-value import-preview-value--highlight">${bal != null ? bal : '—'}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">历史总收入</span>
                        <span class="import-preview-value">${totalEarnings}</span>
                    </div>
                    <div class="import-preview-row">
                        <span class="import-preview-label">历史总消费</span>
                        <span class="import-preview-value">${totalSpent}</span>
                    </div>
                    ` : `
                    <div class="import-preview-row">
                        <span class="import-preview-label">商店数据</span>
                        <span class="import-preview-value" style="color: var(--text-secondary)">无商店数据</span>
                    </div>
                    `}
                </div>
            </div>

            ${(hasCurrentData || hasCurrentGoals) ? `
            <div class="form-group">
                <label class="form-label">导入策略</label>
                <div class="import-strategy-options">
                    <label class="import-strategy-option">
                        <input type="radio" name="importStrategy" value="overwrite" checked>
                        <div class="import-strategy-card">
                            <div class="import-strategy-title">全量覆盖</div>
                            <div class="import-strategy-desc">用备份数据替换当前所有数据</div>
                        </div>
                    </label>
                    <label class="import-strategy-option">
                        <input type="radio" name="importStrategy" value="merge">
                        <div class="import-strategy-card">
                            <div class="import-strategy-title">追加合并</div>
                            <div class="import-strategy-desc">保留当前数据，将备份数据合并进来（冲突时以备份为准）</div>
                        </div>
                    </label>
                </div>
            </div>
            ` : ''}

            <div class="form-group">
                <label class="form-label">导入范围</label>
                <div class="import-strategy-options">
                    <label class="import-strategy-option">
                        <input type="radio" name="importScope" value="all" checked>
                        <div class="import-strategy-card">
                            <div class="import-strategy-title">全部数据</div>
                            <div class="import-strategy-desc">日记录 + 目标 + 商店数据（余额/历史）</div>
                        </div>
                    </label>
                    <label class="import-strategy-option">
                        <input type="radio" name="importScope" value="daysAndGoals">
                        <div class="import-strategy-card">
                            <div class="import-strategy-title">仅日记录与目标</div>
                            <div class="import-strategy-desc">导入日记录和目标，不改变商店余额和历史</div>
                        </div>
                    </label>
                    ${hasShop ? `
                    <label class="import-strategy-option">
                        <input type="radio" name="importScope" value="shopOnly">
                        <div class="import-strategy-card">
                            <div class="import-strategy-title">仅商店数据</div>
                            <div class="import-strategy-desc">只恢复余额和消费/收入历史，不动日记录和目标</div>
                        </div>
                    </label>
                    ` : ''}
                </div>
            </div>

            <div class="import-warning">
                导入前已自动下载当前数据备份到下载目录
            </div>

            <div class="modal-footer">
                <button class="bm-btn bm-btn--secondary" data-action="close-modal">取消</button>
                <button class="bm-btn bm-btn--primary" data-action="settings-confirm-import">确认导入</button>
            </div>
        `;
        Handlers.openModal(content, '导入数据预览');
    },

    async confirmImport() {
        const backup = this._pendingImportData;
        if (!backup) return;

        const strategyRadio = $('input[name="importStrategy"]:checked');
        const strategy = strategyRadio ? strategyRadio.value : 'overwrite';

        const scopeRadio = $('input[name="importScope"]:checked');
        const scope = scopeRadio ? scopeRadio.value : 'all';

        // 自动备份当前数据，防止误操作丢失
        await DataIO.silentExport();

        try {
            const result = await DataIO.importData(backup, { strategy, scope });
            if (result.success) {
                Handlers.closeModal();
                renderAll();
                Toast.showToast(strategy === 'overwrite' ? '数据已覆盖导入' : '数据已合并导入', 'success');
            } else {
                Toast.showToast('导入失败: ' + (result.error || '未知错误'), 'error');
            }
        } catch (error) {
            Toast.showToast('导入失败: ' + error.message, 'error');
        }

        this._pendingImportData = null;
    },

    confirmClearData() {
        const input = byId('clearBeforeDate');
        if (!input || !input.value) {
            Toast.showToast('请选择日期', 'error');
            return;
        }
        const dateStr = input.value;
        const clearDate = new Date(dateStr + 'T00:00:00');
        const data = store.getState().data;
        let clearedCount = 0;

        Object.keys(data).forEach(dateKey => {
            const dataDate = new Date(dateKey + 'T00:00:00');
            if (dataDate < clearDate) {
                delete data[dateKey];
                clearedCount++;
            }
        });

        store.scheduleAutoSave();
        Toast.showToast(`已清理 ${clearedCount} 条记录`, 'success');
        renderAll();
        // 刷新数据 Tab 显示当前记录数
        this._refreshTab('data');
    },

    showResetModal() {
        const content = `
            <div style="padding: 14px; background: rgba(220, 53, 69, 0.08); border: 1px solid rgba(220, 53, 69, 0.2); border-radius: 10px; margin-bottom: 14px; text-align: center;">
                <div style="font-size: 42px; margin-bottom: 10px; color: var(--danger-color);">${LucideUtils.createIcon('alertTriangle', { size: 42 })}</div>
                <div style="font-weight: 600; margin-bottom: 6px; font-size: 15px;">危险操作</div>
                <div style="color: var(--text-secondary); font-size: 12px; line-height: 1.6;">此操作将删除所有数据，且无法恢复！<br>包括每日记录、目标、余额、消费历史等</div>
            </div>
            <div style="margin-bottom: 14px;">
                <div class="settings-item-label" style="margin-bottom: 6px;">输入 "确认重置" 以继续</div>
                <input type="text" class="form-input" id="resetConfirmInput" placeholder="确认重置">
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="bm-btn bm-btn--sm bm-btn--secondary" data-action="settings-cancel-reset">取消</button>
                <button class="bm-btn bm-btn--sm bm-btn--danger" data-action="settings-confirm-reset">确认重置</button>
            </div>
        `;
        PanelManager.open('settings-reset', LucideUtils.createIcon('alertTriangle', { size: 16 }) + '确认重置', content);
    },

    cancelReset() {
        PanelManager.close();
    },

    async confirmReset() {
        const input = byId('resetConfirmInput');
        if (!input || input.value !== '确认重置') {
            Toast.showToast('输入不正确', 'error');
            return;
        }

        // 自动备份当前数据，防止误操作丢失
        await DataIO.silentExport();

        StorageAdapter.remove(StorageKeys.DAILY_REVIEW_DATA);
        StorageAdapter.remove(StorageKeys.AUTO_BACKUPS);
        // 清理商店数据缓存（防止离线恢复残留）
        StorageAdapter.remove('br_balance_cache');
        StorageAdapter.remove('br_purchase_history_cache');
        StorageAdapter.remove('br_income_history_cache');
        StorageAdapter.remove('br_shop_stats_cache');

        try {
            await storageManager.clearAll();
        } catch (e) {
            console.error('Failed to clear storage:', e);
        }

        // 完整重置所有字段
        const s = store.getState();
        s.data = {};
        s.globalGoals = [];
        s.undoStack = [];
        s.redoStack = [];
        s.balance = 0;
        s.purchaseHistory = { records: [], archive: {} };
        s.incomeHistory = { records: [], archive: {} };
        s.stats = { todayEarnings: 0, totalSpent: 0, totalEarnings: 0 };
        s._statsDate = '';
        store.scheduleAutoSave();
        PanelManager.close();
        renderAll();
        Toast.showToast('所有数据已重置', 'success');
    },

    // ---- 内部工具 ----

    _refreshTab(tabId) {
        const panel = PanelManager.activePanel;
        if (!panel) return;
        const container = panel.querySelector(`#tab-content-${tabId}`);
        if (!container) return;

        let newHtml;
        switch (tabId) {
            case 'general': newHtml = this._renderGeneralTab(); break;
            case 'data': newHtml = this._renderDataTab(); break;
            case 'about': newHtml = this._renderAboutTab(); break;
            default: return;
        }

        const temp = document.createElement('div');
        temp.innerHTML = newHtml;
        const newContent = temp.querySelector(`#tab-content-${tabId}`);
        if (newContent) {
            container.replaceWith(newContent);
            // 原生 select 的展开列表由系统绘制，无法美化 → 升级为自绘下拉
            if (window.BambooSelect) window.BambooSelect.enhanceAll(newContent);
            // 旧节点连同其监听器一起被丢弃，新节点是裸的。
            // 「通用」Tab 的输入框不走事件委托，必须在此重新绑定，
            // 否则切走再回来（或点过任一开关触发本方法）后这些设置项静默失效。
            if (tabId === 'general') this._bindGeneralTabInputs();
        }
    },

    // 注：这里原本有 init() 负责"启动时把已存设置填回界面"，但它全仓从未被调用
    // （导出目录已改由 bridge.getExportFolder() 直接读原生设置；香道时长由 ScrollManager 自行读取），
    // 属死代码，已移除 —— 移除不改变任何运行时行为。
};

ActionDispatcher.registerMany({

    'settings-toggle-sync-theme': (_ds, target) => SettingsModal.toggleSyncTheme(target.checked),
    'settings-toggle-weather': (_ds, target) => SettingsModal.toggleWeather(target.checked),
    'settings-toggle-weather-expanded': (_ds, target) => SettingsModal.toggleWeatherExpanded(target.checked),
    'settings-toggle-quote': (_ds, target) => SettingsModal.toggleQuoteEnabled(target.checked),
    'settings-export-data': () => SettingsModal.exportData(),
    'settings-export-goals': () => SettingsModal.exportGoals(),
    'settings-export-settings': () => SettingsModal.exportSettings(),
    'settings-export-purchase': () => SettingsModal.exportPurchaseHistory(),
    'settings-export-income': () => SettingsModal.exportIncomeHistory(),
    'settings-export-days': () => SettingsModal.exportDays(),
    'settings-import-data': () => SettingsModal.openImportPreview(),
    'settings-import-goals': () => SettingsModal.importGoalsFromFile(),
    'settings-import-settings': () => SettingsModal.importSettingsFromFile(),
    'settings-import-purchase': () => SettingsModal.importPurchaseHistoryFromFile(),
    'settings-import-income': () => SettingsModal.importIncomeHistoryFromFile(),
    'settings-import-days': () => SettingsModal.importDaysFromFile(),
    'settings-confirm-import': () => SettingsModal.confirmImport(),
    'settings-confirm-clear-data': () => SettingsModal.confirmClearData(),
    'settings-show-reset-modal': () => SettingsModal.showResetModal(),
    'settings-cancel-reset': () => SettingsModal.cancelReset(),
    'settings-confirm-reset': () => SettingsModal.confirmReset()
});

window.SettingsModal = SettingsModal;
