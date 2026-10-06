/**
 * MigrationService — 数据版本迁移
 * 从 store.js 中抽取，处理 localStorage → IndexedDB / v1 → v2 → v3 的数据迁移。
 */

/**
 * 本地日历的 YYYY-MM —— 迁移时补齐历史记录的 month。
 * 与 WalletService.localMonthKey 同口径：不能用 date.slice(0, 7) / toISOString()，
 * 那是 UTC 月，会让月首凌晨的历史记录被迁进上个月。
 * （date 缺失时仍回退「当前月」，只改口径、不改缺值语义。）
 */
function localMonthKey(input) {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export class MigrationService {
    /**
     * @param {object} storeState — Store 的 state 对象引用
     */
    constructor(storeState) {
        this._state = storeState;
    }

    async handleDataMigration() {
        const currentVersion = await storageManager.getSetting('dataVersion');
        
        if (!currentVersion) {
            await this.migrateFromV1();
        } else if (parseFloat(currentVersion) < 2) {
            await this.migrateFromV1ToV2();
        }
        
        if (currentVersion && parseFloat(currentVersion) < 3) {
            await this._migrateHistoryToFiles();
        } else if (!currentVersion) {
            await this._migrateHistoryToFiles();
        }
        
        await storageManager.putSetting('dataVersion', DATA_VERSION);
    }

    async migrateFromV1() {
        const migrated = await storageManager.getSetting('dataMigrated');
        if (!migrated) {
            await this._migrateFromLocalStorage();
        }
        await this._migrateDayDataToV2();
        await storageManager.putSetting('dataMigrated', true);
    }

    async migrateFromV1ToV2() {
        await this._migrateDayDataToV2();
    }

    async _migrateDayDataToV2() {
        const days = await storageManager.getAllDays();
        for (const [, dayData] of Object.entries(days)) {
            if (!dayData.metrics) {
                const migratedData = DataValidator.migrateToV2(dayData);
                await storageManager.putDay(migratedData);
            }
        }
    }

    async _migrateFromLocalStorage() {
        try {
            const savedData = StorageAdapter.get(StorageKeys.DAILY_REVIEW_DATA);
            if (savedData) {
                const data = JSON.parse(savedData);
                for (const [, dayData] of Object.entries(data)) {
                    await storageManager.putDay(dayData);
                }
            }
            const theme = StorageAdapter.get(StorageKeys.THEME);
            await storageManager.putSetting('theme', theme || 'light');
            await storageManager.putSetting('colorTheme', 'bamboo');
            await storageManager.putSetting('dataMigrated', true);
        } catch (e) {
            console.error('Data migration failed:', e);
        }
    }

    async _migrateHistoryToFiles() {
        const phExists = await storageManager.getPurchaseHistory();
        if (!phExists) {
            const oldPurchases = await storageManager.getSetting('purchaseHistory');
            if (oldPurchases && Array.isArray(oldPurchases) && oldPurchases.length > 0) {
                const records = oldPurchases.map(r => ({
                    ...r,
                    month: localMonthKey(r.date) || localMonthKey(new Date())
                }));
                this._state.purchaseHistory = { records, archive: {} };
                await storageManager.putPurchaseHistory(this._state.purchaseHistory);
            }
            await storageManager.putSetting('purchaseHistory', null);
        }

        const ihExists = await storageManager.getIncomeHistory();
        if (!ihExists) {
            const oldIncomes = await storageManager.getSetting('incomeHistory');
            if (oldIncomes && Array.isArray(oldIncomes) && oldIncomes.length > 0) {
                const records = oldIncomes.map(r => ({
                    ...r,
                    month: localMonthKey(r.date) || localMonthKey(new Date())
                }));
                this._state.incomeHistory = { records, archive: {} };
                await storageManager.putIncomeHistory(this._state.incomeHistory);
            }
            await storageManager.putSetting('incomeHistory', null);
        }
    }
}
