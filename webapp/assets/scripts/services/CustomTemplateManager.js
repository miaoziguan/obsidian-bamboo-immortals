export const MAX_CUSTOM_TEMPLATES = 20;

/**
 * 自定义目标模板管理器（Option B：模板存为 vault 内 templates/<id>.md 的 frontmatter，
 * 经 bridge → VaultStorage 持久化；localStorage 仅在桥接不可用时兜底，绝非数据源）。
 *
 * 启动自 init() 从 vault 拉取；首次运行会把旧 localStorage 模板迁移进 vault，避免用户已有的模板丢失。
 * 这堵住了「vault 是唯一数据来源」原则的漏洞：模板与日复盘/目标一样，落盘到 vault 而非 iframe localStorage。
 */
export const CustomTemplateManager = {
  _cache: null, // CustomTemplate[] | null；null 表示尚未从 vault 加载

  /** 启动时从 vault 加载；桥接不可用时回退 localStorage；并迁移旧 localStorage 模板 */
  async init() {
    if (this._cache !== null) return; // 已加载（含空数组）
    let loaded = false;
    try {
      await storageManager.initPromise;
      const remote = await storageManager.getCustomTemplates();
      if (Array.isArray(remote)) {
        const local = this._loadLocal();
        if (remote.length === 0 && local.length > 0) {
          // 迁移：把旧 localStorage 模板写入 vault
          for (const t of local) {
            try { await storageManager.saveCustomTemplate(t); } catch (e) { /* 忽略单个失败 */ }
          }
        }
        this._cache = remote.length > 0 ? remote : local;
        loaded = true;
      }
    } catch (e) {
      // 桥接失败，回退 localStorage
    }
    if (!loaded) {
      this._cache = this._loadLocal();
    }
    this._saveLocal(this._cache); // 刷新本地兜底缓存
  },

  _loadLocal() {
    try {
      const raw = StorageAdapter.get(StorageKeys.CUSTOM_TEMPLATES);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  },

  _saveLocal(list) {
    try {
      StorageAdapter.set(StorageKeys.CUSTOM_TEMPLATES, JSON.stringify(list || []));
    } catch (e) { /* 兜底写入失败不影响内存 */ }
  },

  /** 同步读取（优先内存缓存，未加载则回退 localStorage） */
  getAll() {
    return this._cache !== null ? this._cache : this._loadLocal();
  },

  count() {
    return this.getAll().length;
  },

  getAllAsTemplates() {
    return this.getAll().map(t => ({
      id: t.id,
      name: t.name,
      desc: t.desc || '我的自定义模板',
      icon: LucideUtils.createIcon(t.iconName || 'star', { size: 32, strokeWidth: 1.5 }),
      data: t.data,
      isCustom: true
    }));
  },

  async add({ name, desc, iconName, data }) {
    if (!name || !data) {
      throw new Error('模板名称和数据不能为空');
    }
    const list = this.getAll();
    if (list.length >= MAX_CUSTOM_TEMPLATES) {
      Toast.showToast(`自定义模板已达上限（${MAX_CUSTOM_TEMPLATES}个）`, 'error');
      return null;
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
    const next = [...list, template];
    this._cache = next;
    this._saveLocal(next);
    try {
      await storageManager.saveCustomTemplate(template);
    } catch (e) {
      // 桥接失败时 _saveLocal 已兜底
    }
    return template;
  },

  async remove(id) {
    const next = this.getAll().filter(t => t.id !== id);
    this._cache = next;
    this._saveLocal(next);
    try {
      await storageManager.deleteCustomTemplate(id);
    } catch (e) { /* 忽略 */ }
  },

  async clear() {
    const list = this.getAll();
    this._cache = [];
    this._saveLocal([]);
    for (const t of list) {
      try { await storageManager.deleteCustomTemplate(t.id); } catch (e) { /* 忽略 */ }
    }
  }
};

// 自启动：与 WhiteNoiseManager 一致，DOM 就绪后从 vault 加载模板（含旧 localStorage 迁移）
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CustomTemplateManager.init());
  } else {
    CustomTemplateManager.init();
  }
}

window.CustomTemplateManager = CustomTemplateManager;
