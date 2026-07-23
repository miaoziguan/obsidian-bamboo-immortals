// DataValidator / DATA_VERSION / DEFAULT_DATA / createEmptyDayData
// 已抽至 state/dataValidator.js 和 state/defaultData.js（通过 window 访问）

import { MigrationService } from './migrationService.js';

export class Store {
    constructor() {
        this.state = {
            currentDate: new Date(),
            ui: {
                isDarkMode: false,
                currentTheme: 'bamboo',
                autoSyncTheme: true,
                weatherEnabled: true,
                weatherCity: null,
                weatherExpanded: true,
                quoteSource: '',
                quoteEnabled: true
            },
            data: {},
            dayKeys: [],           // 所有可用日期 key（降序，最新在前）
            globalGoals: [],
            balance: 0,
            purchaseHistory: { records: [], archive: {} },
            incomeHistory: { records: [], archive: {} },
            _statsDate: '',
            stats: {
                todayEarnings: 0,
                totalSpent: 0,
                totalEarnings: 0
            },
            autoSaveTimer: null,
            isDirty: false
        };
        this.listeners = [];
        this._migration = new MigrationService(this.state);
        this.storageType = 'indexeddb';
        this._dirtyDays = new Set(); // 脏标记：跟踪哪些天数据需要保存
        this._dirtySettings = new Set(); // 脏标记：跟踪哪些 setting 需要保存（balance/shopStats/dataVersion/purchaseHistory/incomeHistory）
        this._goalsDirty = false; // 标记 goals 是否需要保存
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
            await storageManager.initPromise;
            
            await this.handleDataMigration();
            await this.loadFromStorage();
        } catch (e) {
            console.error('Storage initialization failed, entering offline read-only mode:', e);
            // 弹出可见警告，不再静默降级
            if (typeof Toast !== 'undefined' && typeof Toast.showToast === 'function') {
                Toast.showToast('插件通信异常，当前为离线模式。编辑不会保存到 Vault，请检查插件状态。', 'warning');
            }
            this.storageType = 'localstorage-offline';
            this.loadFromLocalStorage();
        }
        
        this.notify();
    }

    async handleDataMigration() { return this._migration.handleDataMigration(); }
    async migrateFromV1() { return this._migration.migrateFromV1(); }
    async migrateFromV1ToV2() { return this._migration.migrateFromV1ToV2(); }
    async migrateDayDataToV2() { return this._migration._migrateDayDataToV2(); }
    async migrateFromLocalStorage() { return this._migration._migrateFromLocalStorage(); }
    async _migrateHistoryToFiles() { return this._migration._migrateHistoryToFiles(); }

    loadFromLocalStorage() {
        this.loadFromStorageLegacy();
        // 优先通过 bridge 加载 goals，失败则从 localStorage 缓存恢复
        this.loadGlobalGoals().catch(e => {
            console.error('Failed to load global goals from bridge, trying localStorage cache:', e);
            try {
                const cached = StorageAdapter.get('br_goals_cache');
                if (cached) {
                    this.state.globalGoals = JSON.parse(cached);
                }
            } catch (cacheErr) {
                console.error('Failed to load goals from localStorage cache:', cacheErr);
            }
        });
    }

    getState() {
        return this.state;
    }

    async ready() {
        await this.initPromise;
        return this;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    setState(updates) {
        Object.assign(this.state, updates);
        this.notify();
    }

    async loadFromStorage() {
        try {
            // ── Phase 1: 并行加载商店关键数据（必须在任何 saveToStorage 之前） ──
            let balance, phData, ihData;
            try {
                [balance, phData, ihData] = await Promise.all([
                    storageManager.getSetting('balance'),
                    storageManager.getPurchaseHistory(),
                    storageManager.getIncomeHistory(),
                ]);
            } catch (e) {
                console.error('[Store] Failed to preload shop data:', e);
            }

            if (balance !== null) {
                this.state.balance = parseFloat(balance) || 0;
            }
            if (phData) {
                this.state.purchaseHistory = phData;
            }
            if (ihData) {
                const seen = new Set();
                const deduped = [];
                for (const inc of ihData.records) {
                    if (inc.desc && inc.amount > 0) {
                        const incDay = new Date(inc.date).toDateString();
                        const key = `${incDay}::${inc.desc}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            deduped.push(inc);
                        }
                    } else {
                        deduped.push(inc);
                    }
                }
                if (deduped.length !== ihData.records.length) {
                    this.state.incomeHistory.records = deduped;
                    await storageManager.putIncomeHistory(this.state.incomeHistory);
                } else {
                    this.state.incomeHistory = ihData;
                }
            }

            // 自动归档旧月数据（依赖已加载的 purchaseHistory/incomeHistory）
            await WalletService.archiveOldRecords();

            // ── Phase 2: 加载日数据（此时 balance 已正确，saveToStorage 不会再覆盖） ──
            let dayKeys = [];
            try {
                dayKeys = await storageManager.getDayKeys();
            } catch (e) {
                console.warn('[Store] getDayKeys failed, falling back to getAllDays:', e.message);
                const all = await storageManager.getAllDays();
                dayKeys = Object.keys(all).sort().reverse();
            }
            this.state.dayKeys = dayKeys;

            const PAGE_SIZE = 30;
            let paginated;
            try {
                paginated = await storageManager.getDaysPaginated(0, PAGE_SIZE);
            } catch (e) {
                console.warn('[Store] getDaysPaginated failed, falling back to getAllDays:', e.message);
                paginated = {
                    days: await storageManager.getAllDays(),
                    keys: dayKeys.slice(0, PAGE_SIZE),
                    total: dayKeys.length,
                    page: 0,
                    pageSize: PAGE_SIZE,
                    hasMore: dayKeys.length > PAGE_SIZE,
                };
            }

            const days = paginated.days;
            this.state._loadedPages = new Set([0]);
            this.state._hasMoreDays = paginated.hasMore;

            if (Object.keys(days).length > 0) {
                Object.assign(this.state.data, days);
                let needSave = false;
                Object.keys(days).forEach(dateKey => {
                    if (!this.state.data[dateKey]) return;
                    const originalLength = this.state.data[dateKey].timeline ? this.state.data[dateKey].timeline.length : 0;
                    DataValidator.cleanupTimeline(this.state.data[dateKey]);
                    const newLength = this.state.data[dateKey].timeline ? this.state.data[dateKey].timeline.length : 0;
                    if (originalLength !== newLength) {
                        needSave = true;
                    }
                });
                if (needSave) {
                    await this.saveToStorage();
                }
            } else {
                Object.assign(this.state.data, DEFAULT_DATA);
                await this.saveToStorage();
            }
            
            // ── Phase 3: Goals + Stats（依赖已加载的余额和历史） ──
            try {
                await this.loadGlobalGoals();
            } catch (e) {
                console.error('[Store] loadGlobalGoals failed, continuing with rest of init:', e);
            }

            WalletService.recalibrateStats();
            await storageManager.putSetting('shopStats', this.state.stats);

            // 天气字段异步拉取（不阻塞加载，失败静默）
            if (this.state.ui.weatherEnabled && typeof WeatherService !== 'undefined') {
                const self = this;
                WeatherService.getWeather().then(function(w) {
                    if (!w) return;
                    const todayKey = new Date().toISOString().slice(0, 10);
                    if (!self.state.data[todayKey]) {
                        self.state.data[todayKey] = {
                            date: todayKey,
                            weekday: ['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()],
                            metrics: {},
                            timeline: []
                        };
                    }
                    try {
                        const detail = WeatherService.formatDetail(w);
                        self.state.data[todayKey].weather = {
                            temperature: w.temperature,
                            weatherCode: w.weatherCode,
                            label: detail ? detail.label : '',
                            fetchedAt: w.fetchedAt
                        };
                        self.scheduleAutoSave();
                    } catch (e) { /* 静默 */ }
                }).catch(function() {});
            }

            const [theme, autoSyncThemeRaw, weatherEnabledRaw, weatherCityRaw, weatherExpandedRaw, quoteSourceRaw, quoteEnabledRaw] = await Promise.all([
                storageManager.getSetting('theme'),
                storageManager.getSetting('autoSyncTheme'),
                storageManager.getSetting('weatherEnabled'),
                storageManager.getSetting('weatherCity'),
                storageManager.getSetting('weatherExpanded'),
                storageManager.getSetting('quoteSource'),
                storageManager.getSetting('quoteEnabled'),
            ]);

            this.state.ui.autoSyncTheme = autoSyncThemeRaw !== 'false';
            this.state.ui.weatherEnabled = weatherEnabledRaw === 'true';
            this.state.ui.weatherCity = (weatherCityRaw && weatherCityRaw.length > 0) ? weatherCityRaw : null;
            this.state.ui.weatherExpanded = weatherExpandedRaw === 'true';
            this.state.ui.quoteSource = (quoteSourceRaw && quoteSourceRaw.length > 0) ? quoteSourceRaw : '';
            this.state.ui.quoteEnabled = quoteEnabledRaw === 'false' ? false : true;

            if (theme === 'dark') {
                this.state.ui.isDarkMode = true;
                document.documentElement.classList.add('dark');
            }

            // 统一规范化主题为 bamboo，并清理任何旧的 theme-xxx 类
            const htmlEl = document.documentElement;
            for (let i = htmlEl.classList.length - 1; i >= 0; i--) {
                const cls = htmlEl.classList[i];
                if (cls.startsWith('theme-') && cls !== 'theme-bamboo') {
                    htmlEl.classList.remove(cls);
                }
            }
            htmlEl.classList.add('theme-bamboo');
            this.state.ui.currentTheme = 'bamboo';

            // Layer 3: Vault 是唯一事实源，同步到 localStorage 作为离线缓存
            this._syncVaultToLocalCache();
            
            // [诊断] 数据加载完成，记录状态
            console.log('[Store] init complete: balance=' + this.state.balance +
                ' ph_records=' + this.state.purchaseHistory.records.length +
                ' ih_records=' + this.state.incomeHistory.records.length);
            
        } catch (e) {
            console.error('Failed to load from storage:', e);
            this.loadFromStorageLegacy();
        }
    }

    loadFromStorageLegacy() {
        try {
            const saved = StorageAdapter.get(StorageKeys.DAILY_REVIEW_DATA);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Object.keys(parsed).length > 0) {
                Object.assign(this.state.data, parsed);
            } else {
                Object.assign(this.state.data, DEFAULT_DATA);
                this.saveToStorageLegacy();
            }
            } else {
                Object.assign(this.state.data, DEFAULT_DATA);
                this.saveToStorageLegacy();
            }
        } catch (e) {
            console.error('Failed to load data:', e);
            Object.assign(this.state.data, DEFAULT_DATA);
            this.saveToStorageLegacy();
        }

        // 从 localStorage 缓存恢复商店数据（桥接不可用时的兜底）
        try {
            const cachedBalance = StorageAdapter.get('br_balance_cache');
            if (cachedBalance !== null) {
                this.state.balance = parseFloat(cachedBalance) || 0;
            }
            const cachedPH = StorageAdapter.get('br_purchase_history_cache');
            if (cachedPH) {
                this.state.purchaseHistory = JSON.parse(cachedPH);
            }
            const cachedIH = StorageAdapter.get('br_income_history_cache');
            if (cachedIH) {
                this.state.incomeHistory = JSON.parse(cachedIH);
            }
            const cachedStats = StorageAdapter.get('br_shop_stats_cache');
            if (cachedStats) {
                this.state.stats = JSON.parse(cachedStats);
            }
        } catch (e) {
            // 缓存恢复失败降级为空数据
            console.error('Failed to restore shop data from cache:', e);
        }

        const theme = StorageAdapter.get(StorageKeys.THEME);
        if (theme === 'dark') {
            this.state.ui.isDarkMode = true;
            document.documentElement.classList.add('dark');
        }

        // legacy: 统一规范化为 bamboo 主题并清理旧的 theme-* 类
        const htmlElLegacy = document.documentElement;
        for (let i = htmlElLegacy.classList.length - 1; i >= 0; i--) {
            const cls = htmlElLegacy.classList[i];
            if (cls.startsWith('theme-') && cls !== 'theme-bamboo') {
                htmlElLegacy.classList.remove(cls);
            }
        }
        htmlElLegacy.classList.add('theme-bamboo');
        this.state.ui.currentTheme = 'bamboo';

        }

    /**
     * Layer 3: 将 Vault 数据同步到 localStorage 缓存。
     * Vault 赢 — localStorage 永远是跟班，不参与决策。
     * 缓存最近 60 天 + goals，避免 localStorage 配额溢出。
     */
    _syncVaultToLocalCache() {
        try {
            const recent = {};
            const keys = Object.keys(this.state.data).sort().reverse().slice(0, 60);
            for (const k of keys) {
                if (this.state.data[k]) recent[k] = this.state.data[k];
            }
            StorageAdapter.set(StorageKeys.DAILY_REVIEW_DATA, JSON.stringify(recent));
            StorageAdapter.set('br_goals_cache', JSON.stringify(this.state.globalGoals));
            // 商店数据缓存：桥接不可用时从 localStorage 恢复
            StorageAdapter.set('br_balance_cache', String(this.state.balance));
            StorageAdapter.set('br_purchase_history_cache', JSON.stringify(this.state.purchaseHistory));
            StorageAdapter.set('br_income_history_cache', JSON.stringify(this.state.incomeHistory));
            StorageAdapter.set('br_shop_stats_cache', JSON.stringify(this.state.stats));
        } catch (e) {
            // 缓存是非关键路径，静默忽略
        }
    }

    async saveToStorage() {
        // 离线模式：跳过 bridge 写入，只写 localStorage 缓存
        if (this.storageType === 'localstorage-offline') {
            this.saveToStorageLegacy();
            return;
        }

        try {
            // 1) 收集脏 days
            let dirtyDays = [];
            if (this._dirtyDays.size > 0) {
                for (const dateKey of this._dirtyDays) {
                    const dayData = this.state.data[dateKey];
                    if (dayData) dirtyDays.push(dayData);
                }
            } else if (!this._didInitialSave) {
                // 首次保存或全量保存（如迁移后）
                dirtyDays = Object.values(this.state.data);
            }

            // 2) 收集脏 settings（仅写实际变化的 key）
            const dirtySettings = {};
            const settingsMap = {
                balance: this.state.balance,
                shopStats: this.state.stats,
                dataVersion: DATA_VERSION,
                purchaseHistory: this.state.purchaseHistory,
                incomeHistory: this.state.incomeHistory
            };
            if (this._dirtySettings.size > 0) {
                for (const key of this._dirtySettings) {
                    if (key in settingsMap) dirtySettings[key] = settingsMap[key];
                }
            } else if (!this._didInitialSave) {
                Object.assign(dirtySettings, settingsMap);
            }

            const goalsDirty = this._goalsDirty || !this._didInitialSave;

            // 3) 一次 IPC 批量提交 — 替代原本 6+ 次串行 await
            const tasks = [];
            if (dirtyDays.length > 0) {
                tasks.push(typeof storageManager.putDaysBatch === 'function'
                    ? storageManager.putDaysBatch(dirtyDays)
                    : (async () => { for (const d of dirtyDays) await storageManager.putDay(d); })());
            }
            if (goalsDirty && typeof storageManager.putGoals === 'function') {
                tasks.push(storageManager.putGoals(this.state.globalGoals));
            }
            if (Object.keys(dirtySettings).length > 0) {
                tasks.push(typeof storageManager.putSettingsBatch === 'function'
                    ? storageManager.putSettingsBatch(dirtySettings)
                    : (async () => { for (const [k, v] of Object.entries(dirtySettings)) await storageManager.putSetting(k, v); })());
            }

            if (tasks.length > 0) {
                await Promise.all(tasks);
            }

            // 4) 全部成功后才清脏标记
            this._dirtyDays.clear();
            this._dirtySettings.clear();
            this._goalsDirty = false;
            this._didInitialSave = true;
            this.state.isDirty = false;
        } catch (e) {
            console.error('Failed to save to storage:', e);
            this.saveToStorageLegacy();
        }
    }

    /**
     * 标记某个 setting 字段为脏，下次 saveToStorage 会写入
     */
    markSettingDirty(key) {
        this._dirtySettings.add(key);
    }

    markGoalsDirty() {
        this._goalsDirty = true;
    }

    markDayDirty(dateKey) {
        this._dirtyDays.add(dateKey);
    }

    saveToStorageLegacy() {
        try {
            StorageAdapter.set(StorageKeys.DAILY_REVIEW_DATA, JSON.stringify(this.state.data));
            this.state.isDirty = false;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                if (typeof Toast !== 'undefined') Toast.showToast('存储空间不足，请导出数据后清理历史记录', 'error');
            }
        }
    }

    scheduleAutoSave() {
        this.state.isDirty = true;
        if (this.state.autoSaveTimer) {
            clearTimeout(this.state.autoSaveTimer);
        }
        // 离线模式：拉长 debounce 到 10s（反正写不进 Vault，避免无效等待）
        const defaultInterval = this.storageType === 'localstorage-offline' ? 10000 : 2000;
        const interval = (typeof SettingsModal !== 'undefined' && SettingsModal.autoSaveInterval)
            ? SettingsModal.autoSaveInterval
            : defaultInterval;
        this.state.autoSaveTimer = setTimeout(async () => {
            if (this.storageType === 'indexeddb') {
                await this.saveToStorage();
            } else {
                this.saveToStorageLegacy();
            }
        }, interval);
    }

    getDateKey(date = this.state.currentDate) {
        const d = date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getCurrentDayData() {
        if (!this.initPromise) return createEmptyDayData(this.getDateKey());
        const key = this.getDateKey();
        if (!this.state.data[key]) {
            this.state.data[key] = createEmptyDayData(key);
            this.markDayDirty(key);
            this.scheduleAutoSave();
        }
        return this.state.data[key];
    }

    getDataByDate(dateStr) {
        if (!dateStr) return createEmptyDayData(this.getDateKey());
        if (!this.state.data[dateStr]) {
            this.state.data[dateStr] = createEmptyDayData(dateStr);
            this.markDayDirty(dateStr);
        }
        DataValidator.cleanupTimeline(this.state.data[dateStr]);
        return this.state.data[dateStr];
    }

    /**
     * 只读获取指定日期数据 — 缺失时返回空 dayData 但**不**写入 store，
     * 也**不**触发 markDayDirty / scheduleAutoSave。
     * 适用于纯渲染场景（todo 列表、统计预览等）。
     */
    peekDataByDate(dateStr) {
        if (!dateStr) return createEmptyDayData(this.getDateKey());
        if (!this.state.data[dateStr]) {
            return createEmptyDayData(dateStr);
        }
        return this.state.data[dateStr];
    }

    // ── Goal CRUD 向后兼容桥接：实际逻辑已迁入 GoalService ──
    getGlobalGoals() { return GoalService.getAll(); }
    getArchivedGoals() { return GoalService.getArchived(); }
    async loadGlobalGoals() { return GoalService.load(); }
    async saveGlobalGoals() { return GoalService._save(); }
    async addGlobalGoal(goal) { return GoalService.add(goal); }
    async updateGlobalGoal(id, updates) { return GoalService.update(id, updates); }
    async deleteGlobalGoal(id) { return GoalService.delete(id); }
    async reorderGlobalGoals(ids) { return GoalService.reorder(ids); }
    async archiveGoal(id) { return GoalService.archive(id); }
    async unarchiveGoal(id) { return GoalService.unarchive(id); }

    // ── 钱包 CRUD 向后兼容桥接：实际逻辑已迁入 WalletService ──
    async updateBalance(amount, type, desc) { return WalletService.updateBalance(amount, type, desc); }
    async addIncomeHistory(income) { return WalletService.addIncomeHistory(income); }
    async removeIncomeHistory(desc) { return WalletService.removeIncomeHistory(desc); }
    async addPurchaseHistory(purchase) { return WalletService.addPurchaseHistory(purchase); }
    getPurchaseCounts() { return WalletService.getPurchaseCounts(); }
    getAvailableBalance() { return WalletService.getAvailableBalance(); }
    _recalibrateStats() { return WalletService.recalibrateStats(); }

    async updateDayData(updates) {
        const key = this.getDateKey();
        if (!this.state.data[key]) {
            this.state.data[key] = createEmptyDayData(key);
        }
        Object.assign(this.state.data[key], updates);

        const errors = DataValidator.validateDayData(this.state.data[key]);
        if (errors.length > 0) {
            console.warn('数据验证警告:', errors);
            DataValidator.sanitizeDayData(this.state.data[key]);
        }

        this.markDayDirty(key);
        this.scheduleAutoSave();
    }

    async updateDayDataByDate(dateStr, updates) {
        if (!this.state.data[dateStr]) {
            this.state.data[dateStr] = createEmptyDayData(dateStr);
        }
        Object.assign(this.state.data[dateStr], updates);

        const errors = DataValidator.validateDayData(this.state.data[dateStr]);
        if (errors.length > 0) {
            console.warn('数据验证警告:', errors);
            DataValidator.sanitizeDayData(this.state.data[dateStr]);
        }

        this.markDayDirty(dateStr);
        this.scheduleAutoSave();
    }
    


    setCurrentDate(date) {
        this.setState({ currentDate: new Date(date) });
        // 异步补读当前日期的数据（存在于 dayKeys 但未加载时）
        this._ensureCurrentDateLoaded();
    }

    /** 将 Date 格式化为 YYYY-MM-DD key */
    _dateKey(date) {
        return date.toISOString().slice(0, 10);
    }

    /** 如果当前日期有数据但未加载，异步补读并 notify */
    async _ensureCurrentDateLoaded() {
        const key = this._dateKey(this.state.currentDate);
        if (!this.state.dayKeys.includes(key)) return;
        if (this.state.data[key]) return;
        try {
            const day = await storageManager.getDay(key);
            if (day) {
                this.state.data[key] = day;
                this.notify();
            }
        } catch (e) {
            console.warn('[Store] 补读日期失败:', key, e.message);
        }
    }

    /**
     * 加载下一页日期数据（滚动到旧日期时调用）
     * @returns {Promise<boolean>} 是否还有更多数据
     */
    async loadMoreDays() {
        if (!this.state._hasMoreDays) return false;
        if (this.state._loadingMore) return false; // 防重复调用
        this.state._loadingMore = true;

        const pages = [...this.state._loadedPages];
        const nextPage = pages.length > 0 ? Math.max(...pages) + 1 : 0;
        if (this.state._loadedPages.has(nextPage)) {
            this.state._loadingMore = false;
            return this.state._hasMoreDays;
        }

        try {
            const paginated = await storageManager.getDaysPaginated(nextPage, 30);
            Object.assign(this.state.data, paginated.days);
            this.state._loadedPages.add(nextPage);
            this.state._hasMoreDays = paginated.hasMore;
            this.notify();
            return paginated.hasMore;
        } catch (e) {
            console.warn('[Store] 加载更多日期失败:', e.message);
            return false;
        } finally {
            this.state._loadingMore = false;
        }
    }

    navigateDate(delta) {
        const newDate = new Date(this.state.currentDate);
        newDate.setDate(newDate.getDate() + delta);
        this.setCurrentDate(newDate);
    }

    goToDate(date) {
        this.setCurrentDate(date);
    }

    async setDarkMode(isDark) {
        const currentMode = this.state.ui.isDarkMode;
        const newMode = (typeof isDark === 'boolean') ? isDark : !currentMode;

        if (newMode === currentMode) {
            this.notify();
            return;
        }

        // 立即更新本地状态和 DOM
        this.state.ui.isDarkMode = newMode;
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 重新计算前景色变量（暗色模式需要更高明度）
        if (typeof window.DisplayManager !== 'undefined' && window.DisplayManager.reapplyHueForDarkMode) {
            window.DisplayManager.reapplyHueForDarkMode();
        }

        // 持久化（不等待 bridge 响应，防止循环
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('theme', newMode ? 'dark' : 'light');
            } catch (e) {
                // 忽略持久化失败
            }
        }
        this.notify();
    }

    async toggleDarkMode() {
        return this.setDarkMode();
    }

    async setWeatherEnabled(enabled) {
        this.state.ui.weatherEnabled = !!enabled;
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('weatherEnabled', enabled ? 'true' : 'false');
            } catch (e) {
                // 忽略持久化失败
            }
        } else {
            StorageAdapter.set(StorageKeys.WEATHER_ENABLED, enabled ? 'true' : 'false');
        }
    }

    async setWeatherCity(city) {
        const cleaned = (city || '').trim();
        this.state.ui.weatherCity = cleaned.length > 0 ? cleaned : null;
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('weatherCity', cleaned.length > 0 ? cleaned : '');
            } catch (e) {
                // 忽略持久化失败
            }
        }
        // 同步更新 WeatherService 缓存（立即生效）
        if (typeof WeatherService !== 'undefined' && typeof WeatherService.setManualCity === 'function') {
            WeatherService.setManualCity(cleaned.length > 0 ? cleaned : null);
        }
    }

    async setWeatherExpanded(expanded) {
        this.state.ui.weatherExpanded = !!expanded;
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('weatherExpanded', expanded ? 'true' : 'false');
            } catch (e) {
                // 忽略持久化失败
            }
        } else {
            StorageAdapter.set(StorageKeys.WEATHER_EXPANDED, expanded ? 'true' : 'false');
        }
    }

    async setQuoteSource(source) {
        const cleaned = (source || '').trim();
        this.state.ui.quoteSource = cleaned;
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('quoteSource', cleaned);
            } catch (e) {
                // 忽略持久化失败
            }
        } else {
            StorageAdapter.set(StorageKeys.QUOTE_SOURCE, cleaned);
        }
    }

    async setQuoteEnabled(enabled) {
        this.state.ui.quoteEnabled = !!enabled;
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('quoteEnabled', enabled ? 'true' : 'false');
            } catch (e) {
                // 忽略持久化失败
            }
        } else {
            StorageAdapter.set(StorageKeys.QUOTE_ENABLED, enabled ? 'true' : 'false');
        }
    }

    async setSyncTheme(enabled) {
        this.state.ui.autoSyncTheme = enabled;
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('autoSyncTheme', enabled ? 'true' : 'false');
            } catch (e) {
                // 忽略持久化失败
            }
        }
        this.notify();
    }

    async exportData() { return DataIO.exportData(); }
    async importData(data, opts) { return DataIO.importData(data, opts); }

    searchData(query) {
        return SearchService.search(this.state.data, this.state.globalGoals, query);
    }
}

export const store = new Store();

window.store = store;

window.Store = Store;
