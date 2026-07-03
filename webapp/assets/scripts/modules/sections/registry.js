export const SectionRegistry = {
    sections: {},
    customSections: [],
    defaultOrder: ['themeEffect', 'todo', 'timeline', 'goals'],
    
    themes: {
        bamboo: { name: '竹林清韵', icon: 'TreePine' }
    },
    
    register(id, config) {
        this.sections[id] = {
            id,
            name: config.name || id,
            icon: config.icon || 'FileText',
            description: config.description || '',
            enabled: config.enabled !== false,
            visible: config.visible !== false,
            order: config.order !== undefined ? config.order : this.defaultOrder.indexOf(id),
            className: config.className || '',
            renderer: config.renderer,
            editor: config.editor,
            dataKey: config.dataKey || id,
            isCustom: config.isCustom || false,
            theme: config.theme || 'bamboo'
        };
    },
    
    get(id) {
        return this.sections[id];
    },
    
    getAll() {
        return Object.values(this.sections);
    },
    
    getEnabled() {
        return this.getAll().filter(s => s.enabled);
    },
    
    getVisible() {
        return this.getEnabled().filter(s => s.visible).sort((a, b) => a.order - b.order);
    },
    
    updateOrder(order) {
        order.forEach((id, index) => {
            if (this.sections[id]) {
                this.sections[id].order = index;
            }
        });
        this.save();
    },

    /** 更新排序但不触发 save（用于 load 恢复时避免循环写入） */
    _updateOrderSilent(order) {
        order.forEach((id, index) => {
            if (this.sections[id]) {
                this.sections[id].order = index;
            }
        });
    },

    toggle(id) {
        if (this.sections[id]) {
            this.sections[id].enabled = !this.sections[id].enabled;
            this.save();
        }
    },
    
    setVisible(id, visible) {
        if (this.sections[id]) {
            this.sections[id].visible = visible;
            this.save();
        }
    },

    addCustom(config) {
        const id = config.id || `custom_${Date.now()}`;
        this.register(id, {
            ...config,
            id,
            isCustom: true,
            order: this.getAll().length
        });
        this.customSections.push(id);
        this.save();
        return id;
    },

    remove(id) {
        if (this.sections[id] && this.sections[id].isCustom) {
            delete this.sections[id];
            this.customSections = this.customSections.filter(cid => cid !== id);
            this.save();
            return true;
        }
        return false;
    },

    update(id, config) {
        if (this.sections[id]) {
            Object.assign(this.sections[id], config);
            this.save();
        }
    },

    save() {
        const state = {
            order: this.getVisible().map(s => s.id),
            // enabled 已 deprecated，与 visible 语义一致，保留仅为向后兼容旧数据
            enabled: this.getAll().filter(s => s.visible).map(s => s.id),
            visible: this.getAll().filter(s => s.visible).map(s => s.id),
            custom: this.customSections.map(id => this.sections[id]),
            themes: Object.fromEntries(this.getAll().filter(s => s.theme).map(s => [s.id, s.theme]))
        };
        // 通过 bridge 持久化到插件层 (Obsidian data.json)
        if (typeof storageManager !== 'undefined' && storageManager.saveSectionConfig) {
            storageManager.saveSectionConfig(state).catch(e => {
                console.error('[SectionRegistry] Bridge save failed:', e);
            });
        }
        // localStorage 作为同会话缓存
        try {
            StorageAdapter.set(StorageKeys.SECTION_CONFIG, JSON.stringify(state));
        } catch (e) {
            console.error('[SectionRegistry] Failed to save config:', e);
        }
    },

    load() {
        // 1. 优先从 bridge 读取（跨重载持久化）
        let saved = null;
        if (typeof storageManager !== 'undefined' && storageManager.getSectionConfig) {
            saved = storageManager.getSectionConfig();
        }

        // 2. 回退到 localStorage（同会话内有效）
        if (!saved) {
            try {
                const raw = StorageAdapter.get(StorageKeys.SECTION_CONFIG);
                if (raw) saved = JSON.parse(raw);
            } catch (e) {
                console.error('[SectionRegistry] Failed to load config:', e);
                saved = null;
            }
        }

        if (saved) {
            // 恢复可见性（enabled 已 deprecated，跟随 visible）
            if (saved.visible && Array.isArray(saved.visible)) {
                Object.keys(this.sections).forEach(id => {
                    this.sections[id].visible = saved.visible.includes(id);
                    this.sections[id].enabled = this.sections[id].visible;
                });
            }

            // 恢复排序（用静默模式，不触发 save，避免在 load 中途写入）
            if (saved.order && Array.isArray(saved.order)) {
                this._updateOrderSilent(saved.order);
            }

            // 恢复自定义板块
            if (saved.custom && Array.isArray(saved.custom)) {
                this.customSections = [];
                saved.custom.forEach(cfg => {
                    this.register(cfg);
                    this.customSections.push(cfg.id);
                });
            }

            // 恢复主题选择
            if (saved.themes) {
                Object.keys(saved.themes).forEach(id => {
                    if (this.sections[id]) {
                        this.sections[id].theme = saved.themes[id];
                    }
                });
            }
        } else {
            // 首次使用：全部可见，默认排序
            const defaultSectionIds = ['themeEffect', 'todo', 'timeline', 'goals'];
            defaultSectionIds.forEach(id => {
                if (this.sections[id]) {
                    this.sections[id].visible = true;
                    this.sections[id].enabled = true;
                }
            });
            // 用完整 updateOrder 触发一次 save，初始化持久化数据
            this.updateOrder(this.defaultOrder);
        }
    },

    /**
     * 桥接就绪后二次应用配置（处理 init 时序问题：bridge 异步，load() 同步执行时桥接未必就绪）
     */
    applyBridgeConfig() {
        if (typeof storageManager === 'undefined' || !storageManager.getSectionConfig) return;
        const saved = storageManager.getSectionConfig();
        if (!saved) return;

        if (saved.visible && Array.isArray(saved.visible)) {
            Object.keys(this.sections).forEach(id => {
                this.sections[id].visible = saved.visible.includes(id);
                this.sections[id].enabled = this.sections[id].visible;
            });
        }
        if (saved.order && Array.isArray(saved.order)) {
            this._updateOrderSilent(saved.order);
        }

        // 恢复主题选择（bridge 已就绪，自定义主题已注册）
        if (saved.themes) {
            Object.keys(saved.themes).forEach(id => {
                if (this.sections[id]) {
                    this.sections[id].theme = saved.themes[id];
                }
            });
        }

        // 触发重渲染
        if (typeof renderAll === 'function') {
            renderAll();
        }
    },
};

window.SectionRegistry = SectionRegistry;