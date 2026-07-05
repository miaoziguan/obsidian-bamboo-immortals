/**
 * localStorage 统一适配器
 * 所有 localStorage 操作通过此模块，集中管理 key 名和错误处理。
 */
export const StorageKeys = {
    SECTION_CONFIG:     'section_config',
    ENABLE_SWIPE:       'enableSwipe',
    WHITENOISE_TYPE:    'whitenoise_type',
    THEME_SETTINGS:     'bamboo_theme_settings',
    WHITENOISE_TIMER:   'whitenoise_timer',
    WHITENOISE_CUSTOM:  'whitenoise_custom',
    WHITENOISE_PLAYING: 'whitenoise_playing',
    DAILY_REVIEW_DATA:  'dailyReviewData',
    THEME:              'theme',
    FAB_POSITION:       'fab_position',
    ARCHIVE_FILTER:     'bamboo-archive-filter',
    AUTO_SAVE_INTERVAL: 'autoSaveInterval',
    WEATHER_CITY:       'weather-city',
    AUTO_BACKUPS:       'autoBackups',
    WEATHER_ENABLED:    'weatherEnabled',
    WEATHER_EXPANDED:   'weatherExpanded',
    QUOTE_SOURCE:       'quoteSource',
    QUOTE_ENABLED:      'quoteEnabled',
    CUSTOM_TEMPLATES:   'bamboo_custom_templates',
};

const StorageAdapter = {
    get(key, fallback = null) {
        try {
            const val = localStorage.getItem(key);
            return val !== null ? val : fallback;
        } catch (e) {
            return fallback;
        }
    },

    getJSON(key, fallback = null) {
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : fallback;
        } catch (e) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // quota exceeded or private browsing
        }
    },

    setJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            // quota exceeded or private browsing
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // private browsing
        }
    },
};

// 向后兼容：仍然暴露在 window 上，后续逐步改为 import
window.StorageAdapter = StorageAdapter;
window.StorageKeys = StorageKeys;
