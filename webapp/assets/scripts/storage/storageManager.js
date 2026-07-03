export class StorageManager {
    constructor() {
        this.adapters = {
            indexedDB: null,
            localStorage: null
        };
        this.currentAdapter = null;
        this.fallbackMode = false;
        this.ready = false;
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
            this.adapters.indexedDB = new IndexedDBAdapter();
            await this.adapters.indexedDB.init();
            this.currentAdapter = this.adapters.indexedDB;
        } catch (error) {
            console.warn('IndexedDB initialization failed, falling back to localStorage:', error);
            this.fallbackMode = true;
            this.adapters.localStorage = new LocalStorageAdapter();
            this.currentAdapter = this.adapters.localStorage;
        }
        
        this.ready = true;
        EventBus.emit('storage:initialized', {
            adapter: this.fallbackMode ? 'localStorage' : 'indexedDB',
            fallback: this.fallbackMode
        });
    }

    async getDay(date) {
        await this.ensureReady();
        return this.currentAdapter.getDay(date);
    }

    async getAllDays() {
        await this.ensureReady();
        return this.currentAdapter.getAllDays();
    }

    /** 获取所有日期 key（降序，最新在前）— IndexedDB 全量在本地，直接内存提取 */
    async getDayKeys() {
        await this.ensureReady();
        const days = await this.currentAdapter.getAllDays();
        return Object.keys(days).sort().reverse();
    }

    /**
     * 分页加载日期数据（IndexedDB 模式：全量读取后内存分页）
     * @param {number} page - 页码（从 0 开始）
     * @param {number} pageSize - 每页数量，默认 30
     */
    async getDaysPaginated(page = 0, pageSize = 30) {
        await this.ensureReady();
        const days = await this.currentAdapter.getAllDays();
        const keys = Object.keys(days).sort().reverse();
        const total = keys.length;
        const start = page * pageSize;
        const pageKeys = keys.slice(start, start + pageSize);
        const result = {};
        for (const k of pageKeys) {
            result[k] = days[k];
        }
        return {
            days: result,
            keys: pageKeys,
            total,
            page,
            pageSize,
            hasMore: start + pageKeys.length < total,
        };
    }

    async putDay(dayData) {
        await this.ensureReady();
        return this.currentAdapter.putDay(dayData);
    }

    async deleteDay(date) {
        await this.ensureReady();
        return this.currentAdapter.deleteDay(date);
    }

    async getSetting(key) {
        await this.ensureReady();
        return this.currentAdapter.getSetting(key);
    }

    async putSetting(key, value) {
        await this.ensureReady();
        return this.currentAdapter.putSetting(key, value);
    }

    /**
     * 批量写入多个 setting — 一次 IPC 一次 IndexedDB transaction，
     * 替代 6 次独立 putSetting 串行 await。
     * @param {Object<string,*>} entries
     */
    async putSettingsBatch(entries) {
        await this.ensureReady();
        if (!entries || typeof entries !== 'object') return;
        const keys = Object.keys(entries);
        if (keys.length === 0) return;
        if (typeof this.currentAdapter.putSettingsBatch === 'function') {
            return this.currentAdapter.putSettingsBatch(entries);
        }
        // fallback：单 key 仍调 putSetting
        for (const key of keys) {
            await this.currentAdapter.putSetting(key, entries[key]);
        }
    }

    /**
     * 批量写入多天数据 — 一次 transaction。
     * @param {Array<{date:string}>} days
     */
    async putDaysBatch(days) {
        await this.ensureReady();
        if (!Array.isArray(days) || days.length === 0) return;
        if (typeof this.currentAdapter.putDaysBatch === 'function') {
            return this.currentAdapter.putDaysBatch(days);
        }
        // fallback
        for (const day of days) {
            await this.currentAdapter.putDay(day);
        }
    }

    async getAllSettings() {
        await this.ensureReady();
        return this.currentAdapter.getAllSettings();
    }

    async exportAllData() {
        await this.ensureReady();
        return this.currentAdapter.exportAllData();
    }

    async importData(data, options = {}) {
        await this.ensureReady();
        return this.currentAdapter.importData(data, options);
    }

    async getGoals() {
        await this.ensureReady();
        return this.currentAdapter.getGoals();
    }

    async putGoal(goal) {
        await this.ensureReady();
        return this.currentAdapter.putGoal(goal);
    }

    async deleteGoal(goalId) {
        await this.ensureReady();
        return this.currentAdapter.deleteGoal(goalId);
    }

    async putGoals(goals) {
        await this.ensureReady();
        return this.currentAdapter.putGoals(goals);
    }

    async getPurchaseHistory() {
        await this.ensureReady();
        return this.currentAdapter.getPurchaseHistory();
    }

    async putPurchaseHistory(data) {
        await this.ensureReady();
        return this.currentAdapter.putPurchaseHistory(data);
    }

    async getIncomeHistory() {
        await this.ensureReady();
        return this.currentAdapter.getIncomeHistory();
    }

    async putIncomeHistory(data) {
        await this.ensureReady();
        return this.currentAdapter.putIncomeHistory(data);
    }

    async clearAll() {
        await this.ensureReady();
        return this.currentAdapter.clearAll();
    }

    getCurrentAdapterType() {
        return this.fallbackMode ? 'localStorage' : 'indexedDB';
    }

    isFallbackMode() {
        return this.fallbackMode;
    }

    async ensureReady() {
        if (!this.ready) {
            await this.initPromise;
        }
    }
}

export class IndexedDBAdapter {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.DB_NAME = 'DailyReviewDB';
        this.DB_VERSION = 4;
        this.STORES = {
            days: 'days',
            settings: 'settings',
            goals: 'goals',
            purchaseHistory: 'purchaseHistory',
            incomeHistory: 'incomeHistory'
        };
    }

    async init() {
        if (this.initialized || this.initFailed) return;

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.initFailed = true;
                reject(new Error('IndexedDB initialization timeout'));
            }, 5000);

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                clearTimeout(timeout);
                this.initFailed = true;
                console.error('IndexedDB open error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                clearTimeout(timeout);
                this.db = request.result;
                this.initialized = true;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(this.STORES.days)) {
                    const dayStore = db.createObjectStore(this.STORES.days, { keyPath: 'date' });
                    dayStore.createIndex('date', 'date', { unique: true });
                }

                if (!db.objectStoreNames.contains(this.STORES.settings)) {
                    db.createObjectStore(this.STORES.settings, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(this.STORES.goals)) {
                    db.createObjectStore(this.STORES.goals, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(this.STORES.purchaseHistory)) {
                    db.createObjectStore(this.STORES.purchaseHistory, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(this.STORES.incomeHistory)) {
                    db.createObjectStore(this.STORES.incomeHistory, { keyPath: 'id' });
                }
            };
        });
    }

    async getDay(date) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.days, 'readonly', store => store.get(date));
    }

    async getAllDays() {
        await this.ensureInitialized();
        return this.transaction(this.STORES.days, 'readonly', store => store.getAll())
            .then(results => {
                const days = {};
                results.forEach(day => { days[day.date] = day; });
                return days;
            });
    }

    async putDay(dayData) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.days, 'readwrite', store => store.put(dayData));
    }

    async deleteDay(date) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.days, 'readwrite', store => store.delete(date));
    }

    async getSetting(key) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.settings, 'readonly', store => store.get(key))
            .then(result => result?.value ?? null);
    }

    async putSetting(key, value) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.settings, 'readwrite', store => store.put({ key, value }));
    }

    /**
     * 一次 transaction 写入多个 setting。
     * @param {Object<string,*>} entries
     */
    async putSettingsBatch(entries) {
        await this.ensureInitialized();
        const keys = Object.keys(entries);
        if (keys.length === 0) return;
        return this.transaction(this.STORES.settings, 'readwrite', store => {
            for (const key of keys) {
                store.put({ key, value: entries[key] });
            }
        });
    }

    /**
     * 一次 transaction 写入多天数据。
     * @param {Array<{date:string}>} days
     */
    async putDaysBatch(days) {
        await this.ensureInitialized();
        if (!Array.isArray(days) || days.length === 0) return;
        return this.transaction(this.STORES.days, 'readwrite', store => {
            for (const day of days) {
                store.put(day);
            }
        });
    }

    async getAllSettings() {
        await this.ensureInitialized();
        return this.transaction(this.STORES.settings, 'readonly', store => store.getAll())
            .then(results => {
                const settings = {};
                results.forEach(item => { settings[item.key] = item.value; });
                return settings;
            });
    }

    async getGoals() {
        await this.ensureInitialized();
        return this.transaction(this.STORES.goals, 'readonly', store => store.getAll());
    }

    async putGoal(goal) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.goals, 'readwrite', store => store.put(goal));
    }

    async deleteGoal(goalId) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.goals, 'readwrite', store => store.delete(goalId));
    }

    async putGoals(goals) {
        await this.ensureInitialized();
        const tx = this.db.transaction([this.STORES.goals], 'readwrite');
        const store = tx.objectStore(this.STORES.goals);
        store.clear();
        goals.forEach(goal => store.put(goal));
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async getPurchaseHistory() {
        await this.ensureInitialized();
        return this.transaction(this.STORES.purchaseHistory, 'readonly', store => store.get('main'))
            .then(result => result?.data || null);
    }

    async putPurchaseHistory(data) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.purchaseHistory, 'readwrite', store => store.put({ id: 'main', data }));
    }

    async getIncomeHistory() {
        await this.ensureInitialized();
        return this.transaction(this.STORES.incomeHistory, 'readonly', store => store.get('main'))
            .then(result => result?.data || null);
    }

    async putIncomeHistory(data) {
        await this.ensureInitialized();
        return this.transaction(this.STORES.incomeHistory, 'readwrite', store => store.put({ id: 'main', data }));
    }

    async exportAllData() {
        const [days, settings, goals, purchaseHistory, incomeHistory] = await Promise.all([
            this.getAllDays(),
            this.getAllSettings(),
            this.getGoals(),
            this.getPurchaseHistory(),
            this.getIncomeHistory()
        ]);

        return {
            version: '3.0',
            exportedAt: new Date().toISOString(),
            storageType: 'indexedDB',
            days,
            settings,
            goals,
            purchaseHistory,
            incomeHistory
        };
    }

    async importData(data, options = {}) {
        const strategy = options.strategy || 'overwrite';

        // 旧格式兼容：data → days, globalGoals → goals
        const normalized = { ...data };
        if (!normalized.days && normalized.data) normalized.days = normalized.data;
        if (!normalized.goals && normalized.globalGoals) normalized.goals = normalized.globalGoals;

        const operations = [];

        // 工具函数：在单个 transaction 中 clear + put 多条记录
        const clearAndPut = async (storeName, items, putFn) => {
            const arr = items ? (Array.isArray(items) ? items : Object.values(items)) : [];
            await this.transaction(storeName, 'readwrite', store => {
                store.clear();
                let lastReq;
                arr.forEach(item => { lastReq = putFn(store, item); });
                return lastReq || store.clear();
            });
        };

        if (strategy === 'overwrite') {
            if (normalized.days) operations.push(clearAndPut(this.STORES.days, normalized.days, (s, d) => s.put(d)));
            if (normalized.settings) operations.push(clearAndPut(this.STORES.settings, Object.entries(normalized.settings), (s, [k, v]) => s.put({ key: k, value: v })));
            if (normalized.goals) operations.push(clearAndPut(this.STORES.goals, normalized.goals, (s, g) => s.put(g)));
            if (normalized.purchaseHistory) operations.push(this.putPurchaseHistory(normalized.purchaseHistory));
            if (normalized.incomeHistory) operations.push(this.putIncomeHistory(normalized.incomeHistory));
        } else {
            // merge：保留现有数据，备份数据的 key 覆盖同 key 数据
            if (normalized.days) Object.values(normalized.days).forEach(day => operations.push(this.putDay(day)));
            if (normalized.settings) Object.entries(normalized.settings).forEach(([key, value]) => operations.push(this.putSetting(key, value)));
            if (normalized.goals) {
                operations.push((async () => {
                    const existing = await this.getGoals() || [];
                    const merged = new Map(existing.map(g => [g.id, g]));
                    normalized.goals.forEach(goal => merged.set(goal.id, goal));
                    await this.putGoals(Array.from(merged.values()));
                })());
            }
            if (normalized.purchaseHistory) {
                operations.push((async () => {
                    const existing = await this.getPurchaseHistory() || { records: [], archive: {} };
                    const recordMap = new Map(existing.records.map(r => [r.id || `${r.date}-${r.itemId}-${Math.random()}`, r]));
                    normalized.purchaseHistory.records.forEach(r => {
                        const k = r.id || `${r.date}-${r.itemId || 'item'}`;
                        recordMap.set(k, r);
                    });
                    const mergedArchive = { ...(existing.archive || {}) };
                    Object.entries(normalized.purchaseHistory.archive || {}).forEach(([month, data]) => {
                        mergedArchive[month] = data;
                    });
                    await this.putPurchaseHistory({ records: Array.from(recordMap.values()), archive: mergedArchive });
                })());
            }
            if (normalized.incomeHistory) {
                operations.push((async () => {
                    const existing = await this.getIncomeHistory() || { records: [], archive: {} };
                    const recordMap = new Map(existing.records.map(r => [r.id || `${r.date}-${r.desc}-${Math.random()}`, r]));
                    normalized.incomeHistory.records.forEach(r => {
                        const k = r.id || `${r.date}-${r.desc || 'income'}`;
                        recordMap.set(k, r);
                    });
                    const mergedArchive = { ...(existing.archive || {}) };
                    Object.entries(normalized.incomeHistory.archive || {}).forEach(([month, data]) => {
                        mergedArchive[month] = data;
                    });
                    await this.putIncomeHistory({ records: Array.from(recordMap.values()), archive: mergedArchive });
                })());
            }
        }

        await Promise.all(operations);
    }

    async clearAll() {
        const stores = Object.values(this.STORES);
        for (const storeName of stores) {
            await this.transaction(storeName, 'readwrite', store => store.clear());
        }
    }

    async transaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            const request = operation(store);

            // 必须在 transaction.oncomplete 上 resolve，而非 request.onsuccess。
            // IndexedDB 的 request 成功不保证事务已提交，事务仍可因约束/超时中止。
            transaction.oncomplete = () => resolve(request.result);
            transaction.onabort = () => reject(transaction.error || new Error('Transaction aborted'));
            transaction.onerror = () => reject(transaction.error || new Error('Transaction error'));
            request.onerror = () => reject(request.error);
        });
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }
}

export class LocalStorageAdapter {
    constructor() {
        this.PREFIX = 'dr_';
        this.KEYS = {
            days: 'days',
            settings: 'settings',
            goals: 'goals',
            purchaseHistory: 'purchaseHistory',
            incomeHistory: 'incomeHistory'
        };
    }

    async init() {
        if (typeof localStorage === 'undefined') {
            throw new Error('localStorage is not available');
        }
    }

    async getDay(date) {
        const days = await this.getAllDays();
        return days[date] || null;
    }

    async getAllDays() {
        const data = localStorage.getItem(this.PREFIX + this.KEYS.days);
        return data ? JSON.parse(data) : {};
    }

    async putDay(dayData) {
        const days = await this.getAllDays();
        days[dayData.date] = dayData;
        localStorage.setItem(this.PREFIX + this.KEYS.days, JSON.stringify(days));
    }

    async deleteDay(date) {
        const days = await this.getAllDays();
        delete days[date];
        localStorage.setItem(this.PREFIX + this.KEYS.days, JSON.stringify(days));
    }

    async getSetting(key) {
        const settings = await this.getAllSettings();
        return settings[key] !== undefined ? settings[key] : null;
    }

    async putSetting(key, value) {
        const settings = await this.getAllSettings();
        settings[key] = value;
        localStorage.setItem(this.PREFIX + this.KEYS.settings, JSON.stringify(settings));
    }

    async getAllSettings() {
        const data = localStorage.getItem(this.PREFIX + this.KEYS.settings);
        return data ? JSON.parse(data) : {};
    }

    async getGoals() {
        const data = localStorage.getItem(this.PREFIX + this.KEYS.goals);
        return data ? JSON.parse(data) : [];
    }

    async putGoal(goal) {
        const goals = await this.getGoals();
        const index = goals.findIndex(g => g.id === goal.id);
        if (index >= 0) {
            goals[index] = goal;
        } else {
            goals.push(goal);
        }
        localStorage.setItem(this.PREFIX + this.KEYS.goals, JSON.stringify(goals));
    }

    async deleteGoal(goalId) {
        const goals = await this.getGoals();
        const filtered = goals.filter(g => g.id !== goalId);
        localStorage.setItem(this.PREFIX + this.KEYS.goals, JSON.stringify(filtered));
    }

    async putGoals(goals) {
        localStorage.setItem(this.PREFIX + this.KEYS.goals, JSON.stringify(goals));
    }

    async getPurchaseHistory() {
        const data = localStorage.getItem(this.PREFIX + this.KEYS.purchaseHistory);
        return data ? JSON.parse(data) : null;
    }

    async putPurchaseHistory(data) {
        localStorage.setItem(this.PREFIX + this.KEYS.purchaseHistory, JSON.stringify(data));
    }

    async getIncomeHistory() {
        const data = localStorage.getItem(this.PREFIX + this.KEYS.incomeHistory);
        return data ? JSON.parse(data) : null;
    }

    async putIncomeHistory(data) {
        localStorage.setItem(this.PREFIX + this.KEYS.incomeHistory, JSON.stringify(data));
    }

    async exportAllData() {
        const [days, settings, goals, purchaseHistory, incomeHistory] = await Promise.all([
            this.getAllDays(),
            this.getAllSettings(),
            this.getGoals(),
            this.getPurchaseHistory(),
            this.getIncomeHistory()
        ]);

        return {
            version: '3.0',
            exportedAt: new Date().toISOString(),
            storageType: 'localStorage',
            days,
            settings,
            goals,
            purchaseHistory,
            incomeHistory
        };
    }

    async importData(data, options = {}) {
        const strategy = options.strategy || 'overwrite';

        // 旧格式兼容：data → days, globalGoals → goals
        const normalized = { ...data };
        if (!normalized.days && normalized.data) normalized.days = normalized.data;
        if (!normalized.goals && normalized.globalGoals) normalized.goals = normalized.globalGoals;

        const safeGet = (key, fallback) => {
            try {
                const raw = localStorage.getItem(this.PREFIX + key);
                if (!raw) return fallback;
                return JSON.parse(raw);
            } catch {
                return fallback;
            }
        };
        const safeSet = (key, val) => {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(val));
        };

        if (strategy === 'overwrite') {
            if (normalized.days) safeSet(this.KEYS.days, normalized.days);
            if (normalized.settings) safeSet(this.KEYS.settings, normalized.settings);
            if (normalized.goals) safeSet(this.KEYS.goals, normalized.goals);
            if (normalized.purchaseHistory) safeSet(this.KEYS.purchaseHistory, normalized.purchaseHistory);
            if (normalized.incomeHistory) safeSet(this.KEYS.incomeHistory, normalized.incomeHistory);
        } else {
            // merge
            if (normalized.days) {
                const existing = safeGet(this.KEYS.days, {});
                safeSet(this.KEYS.days, { ...existing, ...normalized.days });
            }
            if (normalized.settings) {
                const existing = safeGet(this.KEYS.settings, {});
                safeSet(this.KEYS.settings, { ...existing, ...normalized.settings });
            }
            if (normalized.goals) {
                const existing = safeGet(this.KEYS.goals, []);
                const merged = new Map(existing.map(g => [g.id, g]));
                normalized.goals.forEach(goal => merged.set(goal.id, goal));
                safeSet(this.KEYS.goals, Array.from(merged.values()));
            }
            if (normalized.purchaseHistory) {
                const existing = safeGet(this.KEYS.purchaseHistory, { records: [], archive: {} });
                const recordMap = new Map(existing.records.map(r => [r.id || `${r.date}-${r.itemId}-${Math.random()}`, r]));
                normalized.purchaseHistory.records.forEach(r => {
                    const k = r.id || `${r.date}-${r.itemId || 'item'}`;
                    recordMap.set(k, r);
                });
                const mergedArchive = { ...(existing.archive || {}) };
                Object.entries(normalized.purchaseHistory.archive || {}).forEach(([month, data]) => {
                    mergedArchive[month] = data;
                });
                safeSet(this.KEYS.purchaseHistory, { records: Array.from(recordMap.values()), archive: mergedArchive });
            }
            if (normalized.incomeHistory) {
                const existing = safeGet(this.KEYS.incomeHistory, { records: [], archive: {} });
                const recordMap = new Map(existing.records.map(r => [r.id || `${r.date}-${r.desc}-${Math.random()}`, r]));
                normalized.incomeHistory.records.forEach(r => {
                    const k = r.id || `${r.date}-${r.desc || 'income'}`;
                    recordMap.set(k, r);
                });
                const mergedArchive = { ...(existing.archive || {}) };
                Object.entries(normalized.incomeHistory.archive || {}).forEach(([month, data]) => {
                    mergedArchive[month] = data;
                });
                safeSet(this.KEYS.incomeHistory, { records: Array.from(recordMap.values()), archive: mergedArchive });
            }
        }
    }

    async clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(this.PREFIX + key);
        });
    }
}

export const storageManager = new StorageManager();
window.storageManager = storageManager;
window.StorageManager = StorageManager;

window.IndexedDBAdapter = IndexedDBAdapter;

window.LocalStorageAdapter = LocalStorageAdapter;
