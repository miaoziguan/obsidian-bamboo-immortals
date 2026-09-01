// DataValidator / DATA_VERSION / DEFAULT_DATA / createEmptyDayData
// 已抽至 state/dataValidator.js 和 state/defaultData.js（通过 window 访问）

import { MigrationService } from './migrationService.js';
import { ConsistencyService } from '../services/ConsistencyService.js';
import { WalletService } from '../services/WalletService.js';

export class Store {
    constructor() {
        this.state = {
            currentDate: new Date(),
            ui: {
                isDarkMode: false,
                currentTheme: 'bamboo',
                autoSyncTheme: true,
                // 用户是否在 webapp 内手动选择过明暗；未选择时遵循「默认浅色优先」，
                // 不被宿主（Obsidian/iOS 跟随系统）的暗色推送覆盖
                userThemeChosen: false,
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
        this._goalsLoaded = false; // 标记 goals 是否已从 Vault 加载完成（防止首屏保存竞态写出空数组）
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
            await storageManager.initPromise;
            
            await this.handleDataMigration();
            await this.loadFromStorage();
            // 2.8.5：启动后做数据自洽校验与自动修复（待办/时间线/进度/竹币 四方一致性）
            try {
                await ConsistencyService.repair(this);
            } catch (e) {
                console.error('[ConsistencyService] startup repair failed:', e);
            }
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
        this.loadGlobalGoals().then(() => { this._goalsLoaded = true; }).catch(e => {
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
            if (phData && Array.isArray(phData.records)) {
                this.state.purchaseHistory = phData;
            }
            if (ihData && Array.isArray(ihData.records)) {
                const seen = new Set();
                const deduped = [];
                for (const inc of (ihData.records || [])) {
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
                if (deduped.length !== (ihData.records || []).length) {
                    this.state.incomeHistory.records = deduped;
                    await storageManager.putIncomeHistory(this.state.incomeHistory);
                } else {
                    this.state.incomeHistory = ihData;
                }
            }

            // 自动归档旧月数据（延后到 idle 执行，不阻塞首屏初始化）
            const runIdleArchive = () => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => WalletService.archiveOldRecords().catch(e => console.warn('[Store] idle archive failed:', e)));
                } else {
                    setTimeout(() => WalletService.archiveOldRecords().catch(e => console.warn('[Store] idle archive failed:', e)), 1000);
                }
            };
            runIdleArchive();

            // ── Phase 2: 加载日数据（此时 balance 已正确，saveToStorage 不会再覆盖） ──
            let dayKeys = [];
            try {
                dayKeys = await storageManager.getDayKeys();
            } catch (e) {
                console.warn('[Store] getDayKeys failed, falling back to getAllDays:', e.message);
                try {
                    const all = await storageManager.getAllDays();
                    dayKeys = Object.keys(all || {}).sort().reverse();
                } catch (fallbackErr) {
                    console.warn('[Store] getAllDays fallback also failed:', fallbackErr.message);
                    dayKeys = [];
                }
            }
            this.state.dayKeys = dayKeys;

            const PAGE_SIZE = 30;
            let paginated;
            try {
                paginated = await storageManager.getDaysPaginated(0, PAGE_SIZE);
            } catch (e) {
                console.warn('[Store] getDaysPaginated failed, falling back to getAllDays:', e.message);
                let fallbackDays = {};
                try {
                    fallbackDays = await storageManager.getAllDays();
                } catch (fallbackErr) {
                    console.warn('[Store] getAllDays fallback also failed:', fallbackErr.message);
                }
                paginated = {
                    days: fallbackDays || {},
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
            } else if (dayKeys.length === 0) {
                // 仅在「确实没有任何历史日数据」时才写入默认数据（全新安装）。
                // 若 dayKeys 非空却分页返回空（瞬时读取异常），绝不能用 DEFAULT_DATA 覆盖并保存，
                // 否则会整片抹掉磁盘上的历史日数据。
                Object.assign(this.state.data, DEFAULT_DATA);
                await this.saveToStorage();
            } else {
                console.warn('[Store] 分页返回空但存在 dayKeys，跳过默认数据写入以避免覆盖历史数据。dayKeys=', dayKeys.length);
            }
            
            // ── Phase 3: Goals + Stats + 设置（并行加载，缩短首屏等待） ──
            const settingsPromise = Promise.all([
                storageManager.getSetting('theme'),
                storageManager.getSetting('autoSyncTheme'),
                storageManager.getSetting('weatherEnabled'),
                storageManager.getSetting('weatherCity'),
                storageManager.getSetting('weatherExpanded'),
                storageManager.getSetting('quoteSource'),
                storageManager.getSetting('quoteEnabled'),
                storageManager.getSetting('userThemeChosen'),
            ]).catch(e => {
                console.error('[Store] Failed to load settings:', e);
                return [null, null, null, null, null, null, null, null];
            });

            const goalsPromise = this.loadGlobalGoals().catch(e => {
                console.error('[Store] loadGlobalGoals failed, continuing with rest of init:', e);
            });

            const [[theme, autoSyncThemeRaw, weatherEnabledRaw, weatherCityRaw, weatherExpandedRaw, quoteSourceRaw, quoteEnabledRaw, userThemeChosenRaw]] = await Promise.all([
                settingsPromise,
                goalsPromise
            ]);
            // goals 已从 Vault 加载完成，解除首次保存强制写 goals 的门控
            this._goalsLoaded = true;

            await WalletService.recalibrateStats();
            storageManager.putSetting('shopStats', this.state.stats).catch(e => console.warn('[Store] shopStats save failed:', e));

            // autoSyncTheme：vault 读不到时回退 localStorage 耐久缓存（防 bridge 写丢失）
            let autoSyncLocal = null;
            try {
                if (typeof StorageAdapter !== 'undefined' && typeof StorageAdapter.get === 'function') {
                    autoSyncLocal = StorageAdapter.get(StorageKeys.AUTO_SYNC_THEME);
                }
            } catch (_) { /* localStorage 不可用时忽略，仅 vault 为准 */ }
            this.state.ui.autoSyncTheme =
                autoSyncThemeRaw !== null && autoSyncThemeRaw !== undefined
                    ? autoSyncThemeRaw !== 'false'
                    : autoSyncLocal !== 'false';
            this.state.ui.weatherEnabled = weatherEnabledRaw === 'true';
            this.state.ui.weatherCity = (weatherCityRaw && weatherCityRaw.length > 0) ? weatherCityRaw : null;
            this.state.ui.weatherExpanded = weatherExpandedRaw === 'true';
            this.state.ui.quoteSource = (quoteSourceRaw && quoteSourceRaw.length > 0) ? quoteSourceRaw : '';
            this.state.ui.quoteEnabled = quoteEnabledRaw === 'false' ? false : true;

            if (theme === 'dark') {
                this.state.ui.isDarkMode = true;
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                const host = document.getElementById('bamboo-shadow-host');
                if (host) host.classList.add('dark');
            }
            // 注意：userThemeChosen 仅表示「用户是否在 webapp 内 *手动* 选择过明暗」，
            // 必须由 setDarkMode(!fromHost) 置位并持久化，绝不能由「加载了明暗偏好」推导——
            // 否则只要存档里 theme 是 light/dark（必然如此），自动跟随 Obsidian 明暗就会被永久锁死。
            // 它的 localStorage 兜底读取放在下方 idle 同步之前，vault 值为权威源。
            this.state.ui.userThemeChosen = userThemeChosenRaw === 'true';

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

            // Layer 3: Vault 是唯一事实源，同步到 localStorage 作为离线缓存（延后到 idle）
            const runIdleSync = () => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => this._syncVaultToLocalCache());
                } else {
                    setTimeout(() => this._syncVaultToLocalCache(), 1000);
                }
            };
            runIdleSync();
            
            // [诊断] 数据加载完成，记录状态
            console.log('[Store] init complete: balance=' + this.state.balance +
                ' ph_records=' + (this.state.purchaseHistory.records || []).length +
                ' ih_records=' + (this.state.incomeHistory.records || []).length);
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
                if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
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
            document.body.classList.add('dark');
            const host = document.getElementById('bamboo-shadow-host');
            if (host) host.classList.add('dark');
        }
        // 与 init 路径保持一致：userThemeChosen 仅由手动切换置位并持久化，
        // 不能由加载了明暗偏好推导，否则会锁死「自动跟随 Obsidian 明暗」。
        let chosenLocal = null;
        try {
            if (typeof StorageAdapter !== 'undefined' && typeof StorageAdapter.get === 'function') {
                chosenLocal = StorageAdapter.get(StorageKeys.USER_THEME_CHOSEN);
            }
        } catch (_) { /* localStorage 不可用时忽略 */ }
        this.state.ui.userThemeChosen = chosenLocal === 'true';

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
        const trySet = (maxDays) => {
            const recent = {};
            const keys = Object.keys(this.state.data).sort().reverse().slice(0, maxDays);
            for (const k of keys) {
                if (this.state.data[k]) recent[k] = this.state.data[k];
            }
            StorageAdapter.set(StorageKeys.DAILY_REVIEW_DATA, JSON.stringify(recent));
            StorageAdapter.set('br_goals_cache', JSON.stringify(this.state.globalGoals));
            StorageAdapter.set('br_balance_cache', String(this.state.balance));
            StorageAdapter.set('br_purchase_history_cache', JSON.stringify(this.state.purchaseHistory));
            StorageAdapter.set('br_income_history_cache', JSON.stringify(this.state.incomeHistory));
            StorageAdapter.set('br_shop_stats_cache', JSON.stringify(this.state.stats));
        };

        try {
            trySet(60);
        } catch (e) {
            try { trySet(30); }
            catch (e2) {
                try { trySet(14); }
                catch (e3) { /* 缓存非关键路径，静默忽略 */ }
            }
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

            // 首次保存强制写 goals，但必须等 goals 真正从 Vault 加载完成，
            // 否则并行加载阶段 globalGoals 仍为默认 [] 会被误写成空数组，
            // 触发 VaultStorage 的“异常清空”拦截误报。
            const goalsDirty = this._goalsDirty || (!this._didInitialSave && this._goalsLoaded);

            // 3) 分批保存，互不牵连 —— 关键容错修复
            //    原实现用 Promise.all([dayData, settings, goals]) 一次性提交，
            //    任一（如某次 putSetting 边缘失败）reject 就会整体 catch 落到
            //    saveToStorageLegacy() 写 localStorage，而 localStorage 与 Vault 不互通，
            //    导致「当日 timeine/日数据只进了 localStorage，Vault 的当日文件始终为空」——
            //    表现即「时间线卡片今日活动丢失，而 income 历史完好」（income 走独立的
            //    putIncomeHistory，不受影响）。
            //    现改为：dayData（时间线/日数据）优先且独立落 Vault，settings/goals 各自
            //    try/catch，任一步失败都不会牵连 dayData 的持久化。
            const errors = [];

            // 3a) dayData —— 最关键，优先独立保存
            if (dirtyDays.length > 0) {
                try {
                    if (typeof storageManager.putDaysBatch === 'function') {
                        await storageManager.putDaysBatch(dirtyDays);
                    } else {
                        for (const d of dirtyDays) await storageManager.putDay(d);
                    }
                } catch (e) {
                    errors.push(`dayData: ${e && e.message}`);
                    console.error('[Store] 日数据保存失败:', e);
                }
            }

            // 3b) goals
            if (goalsDirty && typeof storageManager.putGoals === 'function') {
                try {
                    await storageManager.putGoals(this.state.globalGoals);
                } catch (e) {
                    errors.push(`goals: ${e && e.message}`);
                    console.error('[Store] 目标保存失败:', e);
                }
            }

            // 3c) settings
            if (Object.keys(dirtySettings).length > 0) {
                try {
                    if (typeof storageManager.putSettingsBatch === 'function') {
                        await storageManager.putSettingsBatch(dirtySettings);
                    } else {
                        for (const [k, v] of Object.entries(dirtySettings)) {
                            await storageManager.putSetting(k, v);
                        }
                    }
                } catch (e) {
                    errors.push(`settings: ${e && e.message}`);
                    console.error('[Store] 设置保存失败:', e);
                }
            }

            if (errors.length > 0) {
                // 仅当 dayData 也失败时，才兜底写 localStorage（与 Vault 不互通，属最后手段）
                console.warn('[Store] 部分保存失败，兜底写入 localStorage:', errors.join('; '));
                this.saveToStorageLegacy();
            }

            // 4) 全部尝试完成后清脏标记（dayData 已优先落 Vault，不受 settings/goals 失败牵连）
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
            // 读路径：仅创建内存占位，供渲染与就地 mutation 引用。
            // **不要**标记脏、**不要**触发自动保存 —— 否则在 loadFromStorage
            // 完成前访问尚未加载进内存的日期，会把空壳写入 Vault，触发「空数据覆盖」
            // 拦截（见 2026-07-27 案例）。真正的持久化由用户产生真实改动时的
            // updateDayData / updateDayDataByDate 负责（putDay 还会与磁盘既有内容合并，
            // 不会整片抹掉历史数据）。
            this.state.data[key] = createEmptyDayData(key);
        }
        return this.state.data[key];
    }

    getDataByDate(dateStr) {
        if (!dateStr) return createEmptyDayData(this.getDateKey());
        if (!this.state.data[dateStr]) {
            // 读路径：仅创建内存占位，**不**标记脏、**不**触发自动保存（理由同上）。
            this.state.data[dateStr] = createEmptyDayData(dateStr);
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
            // 若该日期已存在于磁盘（dayKeys 已登记）但内存尚未加载，先拉取真实数据，
            // 再叠加用户改动。否则在空壳上写入、随后 loadFromStorage 的 Object.assign
            // 又覆盖内存，会导致本次编辑在内存中丢失（磁盘侧由 putDay 合并保护，
            // 但为彻底消除竞态仍在此预拉取）。
            if (this.state.dayKeys && this.state.dayKeys.includes(key)) {
                try {
                    const existing = await storageManager.getDay(key);
                    if (existing) this.state.data[key] = existing;
                } catch (e) {
                    console.warn('[Store] updateDayData 预拉取失败，基于空壳写入:', key, e.message);
                }
            }
            if (!this.state.data[key]) {
                this.state.data[key] = createEmptyDayData(key);
            }
        }
        Object.assign(this.state.data[key], updates);

        const errors = DataValidator.validateDayData(this.state.data[key]);
        if (errors.length > 0) {
            console.warn('数据验证警告:', errors);
            DataValidator.sanitizeDayData(this.state.data[key]);
        }

        if (updates.goalTaskCompletions || updates.goalProgress) {
            if (typeof GoalHealthScore !== 'undefined' && GoalHealthScore.invalidateCache) {
                GoalHealthScore.invalidateCache();
            } else if (window.GoalHealthScore && window.GoalHealthScore.invalidateCache) {
                window.GoalHealthScore.invalidateCache();
            }
        }

        this.markDayDirty(key);
        this.scheduleAutoSave();
    }

    async updateDayDataByDate(dateStr, updates) {
        if (!this.state.data[dateStr]) {
            // 同 updateDayData：若该日期已在磁盘登记但内存未加载，先预拉取真实数据再叠加改动。
            if (this.state.dayKeys && this.state.dayKeys.includes(dateStr)) {
                try {
                    const existing = await storageManager.getDay(dateStr);
                    if (existing) this.state.data[dateStr] = existing;
                } catch (e) {
                    console.warn('[Store] updateDayDataByDate 预拉取失败，基于空壳写入:', dateStr, e.message);
                }
            }
            if (!this.state.data[dateStr]) {
                this.state.data[dateStr] = createEmptyDayData(dateStr);
            }
        }
        Object.assign(this.state.data[dateStr], updates);

        const errors = DataValidator.validateDayData(this.state.data[dateStr]);
        if (errors.length > 0) {
            console.warn('数据验证警告:', errors);
            DataValidator.sanitizeDayData(this.state.data[dateStr]);
        }

        if (updates.goalTaskCompletions || updates.goalProgress) {
            if (typeof GoalHealthScore !== 'undefined' && GoalHealthScore.invalidateCache) {
                GoalHealthScore.invalidateCache();
            } else if (window.GoalHealthScore && window.GoalHealthScore.invalidateCache) {
                window.GoalHealthScore.invalidateCache();
            }
        }

        this.markDayDirty(dateStr);
        this.scheduleAutoSave();
    }

    setCurrentDate(date) {
        this.setState({ currentDate: new Date(date) });
        // 异步补读当前日期的数据（存在于 dayKeys 但未加载时）
        this._ensureCurrentDateLoaded();
    }

    /** 将 Date 格式化为 YYYY-MM-DD key（必须用本地日期，与写入侧 getDateKey 一致；
     *  旧实现用 toISOString() 得到 UTC 日期，凌晨时段会比本地早一天，导致懒加载补读错日期、
     *  当天数据读不进内存，进而被空壳覆盖丢失） */
    _dateKey(date) {
        return this.getDateKey(date);
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

    async setDarkMode(isDark, fromHost = false) {
        const currentMode = this.state.ui.isDarkMode;
        const newMode = (typeof isDark === 'boolean') ? isDark : !currentMode;

        if (newMode === currentMode) {
            this.notify();
            return;
        }

        // 用户手动切换（非宿主推送）→ 标记为已选择，后续不再被宿主暗色推送覆盖；
        // 同时持久化（双写 vault 权威源 + localStorage 即时缓存），使手动选择跨重启保留，
        // 且「自动跟随 Obsidian 明暗」在「用户未手动选过」时正确生效。
        if (!fromHost) {
            this.state.ui.userThemeChosen = true;
            try { StorageAdapter.set(StorageKeys.USER_THEME_CHOSEN, 'true'); } catch (_) {}
            if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
                storageManager.putSetting('userThemeChosen', 'true').catch(() => {});
            }
        }

        // 立即更新本地状态和 DOM
        this.state.ui.isDarkMode = newMode;
        // dark 类需要同时存在于三处，暗色规则才完整命中：
        //  - <html> / <body>：body 带 .bamboo-immortals-root，需 .dark 命中 body 内规则
        //  - shadow host(#bamboo-shadow-host)：:host(.dark) 规则需要 host 自身带 .dark
        const darkEls = [document.documentElement, document.body, document.getElementById('bamboo-shadow-host')].filter(Boolean);
        darkEls.forEach((el) => el.classList.toggle('dark', !!newMode));

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

        // 用户手动切换（非宿主推送）→ 广播给宿主，由宿主转发给所有视图（含画中卷独立 iframe）。
        // 否则画中卷只跟随 Obsidian 系统主题，应用内切夜间模式时无法感知。
        if (!fromHost) {
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage(
                        { type: 'theme:appDarkMode', id: 'appDark_' + Date.now(), payload: { isDark: !!newMode } },
                        '*'
                    );
                }
            } catch (_) { /* 跨域/无宿主时静默 */ }
        }
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
        const val = enabled ? 'true' : 'false';
        // 双写：vault（权威事实源）+ localStorage（即时耐久缓存，防 iframe 卸载竞态丢写）
        if (typeof StorageAdapter !== 'undefined' && typeof StorageAdapter.set === 'function') {
            try { StorageAdapter.set(StorageKeys.AUTO_SYNC_THEME, val); } catch (_) {}
        }
        if (typeof storageManager !== 'undefined' && typeof storageManager.putSetting === 'function') {
            try {
                await storageManager.putSetting('autoSyncTheme', val);
            } catch (e) {
                // 忽略持久化失败（localStorage 兜底已先行写入）
            }
        }
        this.notify();
    }

    async exportData() { return DataIO.exportData(); }
    async importData(data, opts) { return DataIO.importData(data, opts); }
}

export const store = new Store();

window.store = store;

window.Store = Store;
