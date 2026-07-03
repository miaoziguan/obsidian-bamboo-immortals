export const CUSTOM_TEMPLATES_KEY = 'bamboo_goal_custom_templates_v1';
export const MAX_CUSTOM_TEMPLATES = 20;

export const CustomTemplateManager = {
    _cache: null,

    _loadFromStorage() {
        if (this._cache) return this._cache;
        try {
            const raw = StorageAdapter.get(StorageKeys.CUSTOM_TEMPLATES);
            this._cache = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(this._cache)) this._cache = [];
        } catch (e) {
            console.error('Failed to load custom templates:', e);
            this._cache = [];
        }
        return this._cache;
    },

    _saveToStorage() {
        try {
            StorageAdapter.setJSON(StorageKeys.CUSTOM_TEMPLATES, this._cache || []);
        } catch (e) {
            console.error('Failed to save custom templates:', e);
            Toast.showToast('保存模板失败', 'error');
        }
    },

    getAll() {
        return this._loadFromStorage();
    },

    getAllAsTemplates() {
        return this._loadFromStorage().map(t => ({
            id: t.id,
            name: t.name,
            desc: t.desc || '我的自定义模板',
            icon: LucideUtils.createIcon(t.iconName || 'star', { size: 32, strokeWidth: 1.5 }),
            data: t.data,
            isCustom: true
        }));
    },

    add({ name, desc, iconName, data }) {
        if (!name || !data) {
            throw new Error('模板名称和数据不能为空');
        }
        const list = this._loadFromStorage();
        if (list.length >= MAX_CUSTOM_TEMPLATES) {
            throw new Error(`自定义模板已达上限（${MAX_CUSTOM_TEMPLATES}个）`);
        }
        const template = {
            id: 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            name: String(name).trim().slice(0, 30),
            desc: String(desc || '').trim().slice(0, 60),
            iconName: iconName || 'star',
            data: {
                icon: data.icon || '',
                title: data.title || name,
                meta: data.meta || '',
                category: data.category || 'work',
                progress: 0,
                items: (data.items || []).map(it => ({
                    name: it.name || '新子项目',
                    percent: 0,
                    detail: it.detail || '',
                    startValue: it.startValue || '0',
                    targetValue: it.targetValue || '100',
                    currentValue: it.currentValue || '0',
                    dailyMin: it.dailyMin || '',
                    taskDayType: it.taskDayType || 'daily',
                    taskDayConfig: it.taskDayConfig || ''
                }))
            },
            createdAt: new Date().toISOString()
        };
        list.push(template);
        this._saveToStorage();
        return template;
    },

    remove(id) {
        const list = this._loadFromStorage();
        const idx = list.findIndex(t => t.id === id);
        if (idx >= 0) {
            list.splice(idx, 1);
            this._saveToStorage();
            return true;
        }
        return false;
    },

    clear() {
        this._cache = [];
        this._saveToStorage();
    },

    count() {
        return this._loadFromStorage().length;
    }
};

window.CustomTemplateManager = CustomTemplateManager;
