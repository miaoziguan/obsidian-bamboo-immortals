export const SettingsModal = {
    enableSwipe: true,
    autoSaveInterval: 2000,

    // ---- Tab 内容渲染 ----

    _renderGeneralTab() {
        const swipeChecked = this.enableSwipe ? 'checked' : '';
        const currentInterval = this.autoSaveInterval;
        const { ui } = store.getState();
        const syncChecked = ui.autoSyncTheme ? 'checked' : '';

        return `
            <div class="fab-tab-content active" id="tab-content-general">
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">显示</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">自动跟随 Obsidian 主题</div>
                            <div class="settings-item-desc">开启后，随 Obsidian 主题自动切换明/暗模式</div>
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
                            value="${store.state.ui.weatherCity || ''}"
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
                            value="${store.state.ui.quoteSource || ''}"
                            placeholder="如 竹林语录.md">
                    </div>
                </div>
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">交互行为</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">滑动切换日期</div>
                            <div class="settings-item-desc">左右滑动切换日期</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${swipeChecked} data-action="settings-toggle-swipe">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-label">自动保存间隔</div>
                            <div class="settings-item-desc">数据修改后延迟保存的时间</div>
                        </div>
                        <select class="form-input settings-select-sm" id="autoSaveInterval" data-action="settings-set-autosave-interval">
                            <option value="1000" ${currentInterval === 1000 ? 'selected' : ''}>1秒</option>
                            <option value="2000" ${currentInterval === 2000 ? 'selected' : ''}>2秒</option>
                            <option value="5000" ${currentInterval === 5000 ? 'selected' : ''}>5秒</option>
                            <option value="10000" ${currentInterval === 10000 ? 'selected' : ''}>10秒</option>
                        </select>
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
                    <div class="fab-panel-section-title">导入导出</div>
                    <div class="settings-action-grid">
                        <button class="btn btn-sm btn-secondary btn-block" data-action="settings-export-data">
                            ${LucideUtils.createIcon('download', { size: 12 })} 导出备份
                        </button>
                        <button class="btn btn-sm btn-secondary btn-block" data-action="settings-import-data">
                            ${LucideUtils.createIcon('upload', { size: 12 })} 导入数据
                        </button>
                    </div>
                </div>

                <div class="fab-panel-section fab-section-danger">
                    <div class="fab-panel-section-title">清理每日记录</div>
                    <div class="settings-item-info" style="margin-bottom: 10px;">
                        <div class="settings-item-label">按日期裁剪历史记录</div>
                        <div class="settings-item-desc">当前 ${dataCount} 天，删除指定日期之前的所有记录</div>
                    </div>
                    <div class="settings-clear-row">
                        <input type="date" class="form-input settings-date-input" id="clearBeforeDate" max="${today}" placeholder="选择截止日期">
                        <button class="btn btn-sm btn-danger" data-action="settings-confirm-clear-data">
                            ${LucideUtils.createIcon('trash', { size: 12 })} 清理
                        </button>
                    </div>
                </div>

                <div class="fab-panel-section fab-section-danger">
                    <div class="fab-panel-section-title">重置所有</div>
                    <div class="settings-item-info" style="margin-bottom: 10px;">
                        <div class="settings-item-label">清空全部数据并恢复初始状态</div>
                        <div class="settings-item-desc">包括每日记录、目标、余额、消费历史等所有数据</div>
                    </div>
                    <button class="btn btn-sm btn-danger btn-block" data-action="settings-show-reset-modal">
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
                const intervalSelect = document.getElementById('autoSaveInterval');
                if (intervalSelect) {
                    intervalSelect.addEventListener('change', (e) => {
                        this.setAutoSaveInterval(e.target.value);
                    });
                }
                const cityInput = document.getElementById('defaultCityInput');
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
                const quoteInput = document.getElementById('quoteSourceInput');
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
            }
        });
    },

    // ---- 通用 Tab 操作 ----

    toggleSwipe(enabled) {
        this.enableSwipe = enabled;
        StorageAdapter.set(StorageKeys.ENABLE_SWIPE, enabled ? 'true' : 'false');
        if (typeof storageManager !== 'undefined' && storageManager.putSetting) {
            storageManager.putSetting('enableSwipe', enabled ? 'true' : 'false').catch(() => {});
        }
        Toast.showToast(enabled ? '滑动切换已启用' : '滑动切换已关闭', 'success');
    },

    setAutoSaveInterval(value) {
        const num = parseInt(value);
        this.autoSaveInterval = num;
        StorageAdapter.set(StorageKeys.AUTO_SAVE_INTERVAL, value);
        if (typeof storageManager !== 'undefined' && storageManager.putSetting) {
            storageManager.putSetting('autoSaveInterval', num).catch(() => {});
        }
        Toast.showToast(`自动保存间隔设为 ${num / 1000} 秒`, 'success');
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
                    <div class="import-preview-row">
                        <span class="import-preview-label">消费/收入历史</span>
                        <span class="import-preview-value">${backup.purchaseHistory || backup.incomeHistory ? '有' : '无'}</span>
                    </div>
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

            <div class="import-warning">
                导入前建议先导出当前数据作为备份
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">取消</button>
                <button class="btn btn-primary" data-action="settings-confirm-import">确认导入</button>
            </div>
        `;
        Handlers.openModal(content, '导入数据预览');
    },

    async confirmImport() {
        const backup = this._pendingImportData;
        if (!backup) return;

        const strategyRadio = document.querySelector('input[name="importStrategy"]:checked');
        const strategy = strategyRadio ? strategyRadio.value : 'overwrite';

        try {
            const result = await DataIO.importData(backup, { strategy });
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
        const input = document.getElementById('clearBeforeDate');
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
                <button class="btn btn-sm btn-secondary" data-action="settings-cancel-reset">取消</button>
                <button class="btn btn-sm btn-danger" data-action="settings-confirm-reset">确认重置</button>
            </div>
        `;
        PanelManager.open('settings-reset', LucideUtils.createIcon('alertTriangle', { size: 16 }) + '确认重置', content);
    },

    cancelReset() {
        PanelManager.close();
    },

    async confirmReset() {
        const input = document.getElementById('resetConfirmInput');
        if (!input || input.value !== '确认重置') {
            Toast.showToast('输入不正确', 'error');
            return;
        }

        StorageAdapter.remove(StorageKeys.DAILY_REVIEW_DATA);
        StorageAdapter.remove(StorageKeys.AUTO_BACKUPS);

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
        }
    },

    // ---- 初始化 ----

    async init() {
        // 优先从 bridge (VaultStorage) 读取 autoSaveInterval
        if (typeof storageManager !== 'undefined' && storageManager.getSetting) {
            try {
                const bridgeInterval = await storageManager.getSetting('autoSaveInterval');
                if (bridgeInterval && typeof bridgeInterval === 'number') {
                    this.autoSaveInterval = bridgeInterval;
                }
            } catch {}
        }
        // fallback 到 localStorage
        if (this.autoSaveInterval === 2000) {
            const savedInterval = StorageAdapter.get(StorageKeys.AUTO_SAVE_INTERVAL);
            if (savedInterval) {
                this.autoSaveInterval = parseInt(savedInterval);
            }
        }
        if (StorageAdapter.get(StorageKeys.ENABLE_SWIPE) === 'false') {
            this.enableSwipe = false;
        }
    }
};

ActionDispatcher.registerMany({
    'settings-toggle-swipe': (_ds, target) => SettingsModal.toggleSwipe(target.checked),
    'settings-set-autosave-interval': (_ds, target) => SettingsModal.setAutoSaveInterval(target.value),
    'settings-toggle-sync-theme': (_ds, target) => SettingsModal.toggleSyncTheme(target.checked),
    'settings-toggle-weather': (_ds, target) => SettingsModal.toggleWeather(target.checked),
    'settings-toggle-weather-expanded': (_ds, target) => SettingsModal.toggleWeatherExpanded(target.checked),
    'settings-toggle-quote': (_ds, target) => SettingsModal.toggleQuoteEnabled(target.checked),
    'settings-export-data': () => SettingsModal.exportData(),
    'settings-import-data': () => SettingsModal.openImportPreview(),
    'settings-confirm-import': () => SettingsModal.confirmImport(),
    'settings-confirm-clear-data': () => SettingsModal.confirmClearData(),
    'settings-show-reset-modal': () => SettingsModal.showResetModal(),
    'settings-cancel-reset': () => SettingsModal.cancelReset(),
    'settings-confirm-reset': () => SettingsModal.confirmReset()
});

window.SettingsModal = SettingsModal;
