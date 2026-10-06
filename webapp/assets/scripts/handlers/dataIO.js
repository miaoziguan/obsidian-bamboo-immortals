import { TypewriterStore } from '../services/TypewriterStore.js';
window.DataIO = {

    /**
     * 导出全部数据
     */
    async exportData() {
        await this._doExport('daily-review-data', 'all');
    },

    /**
     * 仅导出商店数据（余额+历史）
     */
    async exportShopData() {
        await this._doExport('daily-review-shop', 'shopOnly');
    },

    /**
     * 静默自动备份（导入/重置前兜底）
     */
    async silentExport() {
        try {
            await this._doExport('daily-review-auto-backup', 'all');
        } catch (e) {
            console.warn('[DataIO] Auto-backup failed:', e);
        }
    },

    // ========== 单独导出（对齐 Vault 文件结构） ==========

    /** 导出 goaols.json */
    async exportGoals() { await this._exportSingle('goals', 'goals'); },

    /** 导出 settings.json */
    async exportSettings() { await this._exportSingle('settings', 'settings'); },

    /** 导出 purchase-history.json */
    async exportPurchaseHistory() { await this._exportSingle('purchaseHistory', 'purchase-history'); },

    /** 导出 income-history.json */
    async exportIncomeHistory() { await this._exportSingle('incomeHistory', 'income-history'); },

    /** 导出 data/ 目录（全部每日记录，打包为一个文件） */
    async exportDays() {
        let days = null;
        try {
            days = await storageManager.getAllDays();
        } catch (e) {
            console.warn('[DataIO] bridge getAllDays failed, using state fallback', e);
        }
        if (!days || Object.keys(days).length === 0) {
            days = store.getState().data || {};
        }

        const payload = { type: 'days', exportedAt: new Date().toISOString(), days };
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `days-${store.getDateKey()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);

        try {
            localStorage.setItem('br_last_export', JSON.stringify({
                name: link.download,
                time: new Date().toISOString(),
                scope: 'days',
            }));
        } catch (_) { /* ignore */ }
    },

    /**
     * 单独导出一个 Vault 文件
     * @param {'goals'|'settings'|'purchaseHistory'|'incomeHistory'} type
     * @param {string} fileNameKey  文件名前缀（与 vault 文件名对应）
     */
    async _exportSingle(type, fileNameKey) {
        let raw = null;
        try {
            switch (type) {
                case 'goals': raw = await storageManager.getGoals(); break;
                case 'settings': raw = await storageManager.getAllSettings(); break;
                case 'purchaseHistory': raw = await storageManager.getPurchaseHistory(); break;
                case 'incomeHistory': raw = await storageManager.getIncomeHistory(); break;
            }
        } catch (e) {
            console.warn(`[DataIO] bridge get ${type} failed, using state fallback`, e);
        }

        if (!raw || (Array.isArray(raw) && raw.length === 0) || (typeof raw === 'object' && !Array.isArray(raw) && Object.keys(raw).length === 0)) {
            const s = store.getState();
            switch (type) {
                case 'goals': raw = s.globalGoals || []; break;
                case 'settings':
                    raw = {
                        theme: s.ui.isDarkMode ? 'dark' : 'light',
                        colorTheme: s.ui.currentTheme || 'bamboo',
                        balance: s.balance,
                        shopStats: s.stats,
                        autoSyncTheme: s.ui.autoSyncTheme ? 'true' : 'false',
                        weatherEnabled: s.ui.weatherEnabled ? 'true' : 'false',
                        weatherCity: s.ui.weatherCity || '',
                        weatherExpanded: s.ui.weatherExpanded ? 'true' : 'false',
                        quoteSource: s.ui.quoteSource || '',
                        quoteEnabled: s.ui.quoteEnabled ? 'true' : 'false',
                        autoSaveInterval: '2000',
                        displayWidth: s.ui.displayWidth || '',
                        displayFontScale: s.ui.displayFontScale || '',
                        displayGapScale: s.ui.displayGapScale || '',
                        displayHue: s.ui.displayHue || '',
                        displayLightness: s.ui.displayLightness || '',
                        displayBackgroundEnabled: s.ui.displayBackgroundEnabled || '',
                    };
                    break;
                case 'purchaseHistory': raw = s.purchaseHistory || { records: [] }; break;
                case 'incomeHistory': raw = s.incomeHistory || { records: [] }; break;
            }
        }

        const json = JSON.stringify(raw, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileNameKey}-${store.getDateKey()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);

        try {
            localStorage.setItem('br_last_export', JSON.stringify({
                name: link.download,
                time: new Date().toISOString(),
                scope: type,
            }));
        } catch (_) { /* ignore */ }
    },

    // ========== 单独导入（对齐 Vault 文件结构） ==========

    /** 导入 goals.json */
    importGoalsFromFile() { this._pickAndImport('goals', '目标', () => {}); },

    /** 导入 settings.json */
    importSettingsFromFile() { this._pickAndImport('settings', '设置', () => {}); },

    /** 导入 purchase-history.json */
    importPurchaseHistoryFromFile() { this._pickAndImport('purchaseHistory', '商店购买记录', () => {}); },

    /** 导入 income-history.json */
    importIncomeHistoryFromFile() { this._pickAndImport('incomeHistory', '收入记录', () => {}); },

    /** 导入 data/ 目录（全部每日记录，merge 写入） */
    importDaysFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // 检测：完整备份 or days 单独文件
                const isFullBackup = !!(data.version && data.exportedAt && (data.days || data.data));
                const daysData = isFullBackup
                    ? (data.days || data.data)
                    : (data.days || data);

                if (!daysData || typeof daysData !== 'object' || Object.keys(daysData).length === 0) {
                    throw new Error('文件中没有每日记录数据');
                }

                // merge 写入：逐天 putDay，不清空已有
                const entries = Object.entries(daysData);
                for (const [dateKey, dayObj] of entries) {
                    if (dayObj) await storageManager.putDay(dayObj);
                }

                await store.loadFromStorage();
                store._recalibrateStats();
                await storageManager.putSetting('shopStats', store.getState().stats);
                renderAll();
                Toast.showToast('每日记录导入成功（' + entries.length + ' 天）', 'success');
            } catch (err) {
                Toast.showToast('每日记录导入失败: ' + err.message, 'error');
            }
        };
        input.click();
    },

    /**
     * 通用文件选择 → 按类型导入
     * @param {'goals'|'settings'|'purchaseHistory'|'incomeHistory'} type
     * @param {string} label  中文名称（用于 Toast）
     * @param {function} _unused
     */
    _pickAndImport(type, label) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // 检测：完整备份 or 单文件导出
                const isFullBackup = !!(data.version && data.exportedAt && (data.days || data.data));

                await this._importSingleType(type, isFullBackup ? data : null, isFullBackup ? null : data);
                await store.loadFromStorage();
                store._recalibrateStats();
                await storageManager.putSetting('shopStats', store.getState().stats);
                renderAll();
                Toast.showToast(label + '导入成功', 'success');
            } catch (err) {
                Toast.showToast(label + '导入失败: ' + err.message, 'error');
            }
        };
        input.click();
    },

    /**
     * 按类型写入数据到 Vault
     * @param {string} type
     * @param {object|null} fullBackup  完整备份对象（从中提取）
     * @param {object|null} directData  直接数据对象（单文件导出）
     */
    async _importSingleType(type, fullBackup, directData) {
        let target = directData;

        if (fullBackup) {
            // 从完整备份中提取对应字段
            switch (type) {
                case 'goals':
                    target = fullBackup.goals || fullBackup.globalGoals;
                    break;
                case 'settings':
                    target = fullBackup.settings;
                    break;
                case 'purchaseHistory':
                    target = fullBackup.purchaseHistory;
                    break;
                case 'incomeHistory':
                    target = fullBackup.incomeHistory;
                    break;
            }
        }

        if (!target || (Array.isArray(target) && target.length === 0) || (typeof target === 'object' && !Array.isArray(target) && Object.keys(target).length === 0)) {
            throw new Error('文件中没有' + (type === 'goals' ? '目标' : type === 'settings' ? '设置' : type === 'purchaseHistory' ? '购买记录' : '收入记录') + '数据');
        }

        switch (type) {
            case 'goals':
                if (!Array.isArray(target)) throw new Error('目标数据格式不正确（应为数组）');
                await storageManager.putGoals(target);
                break;
            case 'settings':
                if (typeof target !== 'object' || Array.isArray(target)) throw new Error('设置数据格式不正确（应为对象）');
                // 保留当前 UI 偏好不被导入覆盖
                const cur = store.getState();
                const uiKeys = ['theme', 'autoSyncTheme', 'userThemeChosen', 'weatherEnabled', 'weatherCity', 'weatherExpanded',
                    'quoteSource', 'quoteEnabled', 'colorTheme', 'autoSaveInterval',
                    'displayWidth', 'displayFontScale', 'displayGapScale', 'displayHue',
                    'displayLightness', 'displayBackgroundEnabled'];
                for (const [k, v] of Object.entries(target)) {
                    if (uiKeys.includes(k)) {
                        // 保留当前 UI 设置
                        const curVal = (() => {
                            switch (k) {
                                case 'theme': return cur.ui.isDarkMode ? 'dark' : 'light';
                                case 'autoSyncTheme': return cur.ui.autoSyncTheme ? 'true' : 'false';
                                case 'weatherEnabled': return cur.ui.weatherEnabled ? 'true' : 'false';
                                case 'weatherExpanded': return cur.ui.weatherExpanded ? 'true' : 'false';
                                case 'quoteEnabled': return cur.ui.quoteEnabled ? 'true' : 'false';
                                case 'colorTheme': return cur.ui.currentTheme || 'bamboo';
                                default: return cur.ui[k] || '';
                            }
                        })();
                        if (curVal !== '' && curVal !== null && curVal !== undefined) {
                            await storageManager.putSetting(k, curVal);
                        }
                    } else {
                        await storageManager.putSetting(k, v);
                    }
                }
                break;
            case 'purchaseHistory':
                await storageManager.putPurchaseHistory(target);
                break;
            case 'incomeHistory':
                await storageManager.putIncomeHistory(target);
                break;
        }
    },

    async _doExport(filenamePrefix, scope) {
        let data = null;
        try {
            data = await storageManager.exportAllData();
        } catch (e) {
            console.warn('storageManager.exportAllData failed, using state directly:', e);
        }
        if (!data || Object.keys(data).length === 0 || !data.days) {
            const s = store.getState();
            data = {
                version: DATA_VERSION,
                exportedAt: new Date().toISOString(),
                storageType: 'state-fallback',
                days: s.data,
                goals: s.globalGoals || [],
                purchaseHistory: s.purchaseHistory,
                incomeHistory: s.incomeHistory,
                settings: {
                    theme: s.ui.isDarkMode ? 'dark' : 'light',
                    colorTheme: s.ui.currentTheme || 'bamboo',
                    balance: s.balance,
                    shopStats: s.stats
                }
            };
        }

        // 仅商店数据：裁剪
        if (scope === 'shopOnly') {
            data = {
                version: data.version || DATA_VERSION,
                exportedAt: data.exportedAt || new Date().toISOString(),
                storageType: data.storageType || 'shop-only',
                purchaseHistory: data.purchaseHistory,
                incomeHistory: data.incomeHistory,
                settings: data.settings ? {
                    balance: data.settings.balance,
                    shopStats: data.settings.shopStats,
                } : undefined,
            };
        }

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filenamePrefix}-${store.getDateKey()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);

        // 记录最近导出，导入时引导用户
        try {
            localStorage.setItem('br_last_export', JSON.stringify({
                name: link.download,
                time: new Date().toISOString(),
                scope
            }));
        } catch (_) { /* ignore */ }
    },

    /**
     * 导入数据（从 store 迁入）
     * @param {object} backupData 备份 JSON 数据
     * @param {object} options
     * @param {string} options.strategy  'overwrite' | 'merge'
     * @param {string} options.scope     'all' | 'daysAndGoals' | 'shopOnly'
     */
    async importData(backupData, options = {}) {
        try {
            const data = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;

            if (!data || (typeof data !== 'object')) {
                throw new Error('无效的备份文件');
            }

            const scope = options.scope || 'all';

            // 按 scope 裁剪数据
            if (scope === 'daysAndGoals') {
                delete data.settings;
                delete data.purchaseHistory;
                delete data.incomeHistory;
            } else if (scope === 'shopOnly') {
                delete data.days;
                delete data.data;
                delete data.goals;
                delete data.globalGoals;
            }

            const hasAnyData = data.days || data.data || data.goals || data.globalGoals || data.settings || data.purchaseHistory || data.incomeHistory;
            if (!hasAnyData) {
                throw new Error('备份文件中没有所选范围的数据');
            }

            // 智能 settings 合并：保留当前 UI 偏好不被覆盖
            let savedUISettings = {};
            if (data.settings && (scope === 'all' || scope === 'shopOnly')) {
                const cur = store.getState();
                savedUISettings = {
                    theme: cur.ui.isDarkMode ? 'dark' : 'light',
                    autoSyncTheme: cur.ui.autoSyncTheme ? 'true' : 'false',
                    weatherEnabled: cur.ui.weatherEnabled ? 'true' : 'false',
                    weatherCity: cur.ui.weatherCity || '',
                    weatherExpanded: cur.ui.weatherExpanded ? 'true' : 'false',
                    quoteSource: cur.ui.quoteSource || '',
                    quoteEnabled: cur.ui.quoteEnabled ? 'true' : 'false',
                    colorTheme: cur.ui.currentTheme || 'bamboo',
                    autoSaveInterval: '2000',
                    displayWidth: cur.ui.displayWidth || '',
                    displayFontScale: cur.ui.displayFontScale || '',
                    displayGapScale: cur.ui.displayGapScale || '',
                    displayHue: cur.ui.displayHue || '',
                    displayLightness: cur.ui.displayLightness || '',
                    displayBackgroundEnabled: cur.ui.displayBackgroundEnabled || '',
                };
            }

            await storageManager.importData(data, options);
            // 导入会整体替换 settings.json，写作索引的内存缓存随之失效（否则读到导入前的旧组）
            if (TypewriterStore && typeof TypewriterStore.invalidateWritingIndex === 'function') {
                TypewriterStore.invalidateWritingIndex();
            }

            // 恢复 UI 设置
            if (Object.keys(savedUISettings).length > 0) {
                for (const [k, v] of Object.entries(savedUISettings)) {
                    if (v !== '' && v !== null && v !== undefined) {
                        await storageManager.putSetting(k, v);
                    }
                }
            }

            await store.loadFromStorage();

            // 导入后强制重新校准 stats，避免缓存与真实数据不一致
            store._recalibrateStats();
            await storageManager.putSetting('shopStats', store.getState().stats);

            return { success: true };
        } catch (e) {
            console.error('importData failed:', e);
            return { success: false, error: e.message };
        }
    },

    // 说明：这里原有 openExport（导出分享弹窗）与 openImport（导入数据弹窗）两个入口，
    // 但全仓已无任何触发点（无 data-action、无 onclick、无 JS 调用），属「UI 入口已移除、
    // 实现遗留」的死代码，已删除。

    // 导入/导出目前是一条完整闭环的**活**链路（取证自 settingsModal.js:167-253 / 741-766）：
    //   导出：settings-export-data → SettingsModal.exportData → DataIO.exportData
    //   导入：settings-import-data → SettingsModal.openImportPreview → 选 .json
    //        → showImportPreview → 确认 → silentExport（自动兜底备份）
    //        → DataIO.importData(backup, { strategy, scope })
    //   另有 9 个文件级按钮（goals/settings/purchase/income/days）走 exportXxx / importXxxFromFile。
    //   故下方 importData 有真实 UI 入口，切勿按「无 UI 入口」误判。

    // 说明：原有 handleImportFile（读本地文件后 importData）唯一调用方是已删除的 openImport 弹窗，已删除。

    // 说明：原有 quickImportFromFile（临时 <input type=file> 快速导入）无任何调用者，已删除。

    // 说明：原有 importFromTextarea（粘贴备份码文本框）对应的 UI 从未落地，真实恢复入口
    // （选 .json + 策略/范围选择，见上）功能严格强于它，全仓零调用者，已删除 ——
    // 连带 handlers.js 的 'import-from-textarea' 动作注册与 store.importData 转发一并移除。
};
