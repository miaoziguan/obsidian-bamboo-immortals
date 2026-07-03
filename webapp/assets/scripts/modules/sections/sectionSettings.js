export const SectionSettings = {
    open(sectionId) {
        const section = SectionRegistry.get(sectionId);
        if (!section) {
            console.error('[SectionSettings] Section not found:', sectionId);
            store?.showToast('板块未找到: ' + sectionId, 'error');
            return;
        }

        const content = this.renderSettingsContent(section);
        Handlers.openModal(content, LucideUtils.createIcon('settings', { size: 16 }) + '板块设置', 'section-settings-modal');
    },

    renderSettingsContent(section) {
        const sectionIcon = typeof LucideUtils !== 'undefined'
            ? LucideUtils.createIcon(section.icon, { size: 32 })
            : section.icon;

        return `
            <div class="section-settings-container">
                <div class="section-settings-header">
                    <div class="section-settings-icon">${sectionIcon}</div>
                    <div class="section-settings-title">${escapeHtml(section.name)}</div>
                    <div class="section-settings-desc">${escapeHtml(section.description)}</div>
                </div>
                <div class="section-settings-actions">
                    <button class="section-settings-btn section-settings-btn-hide" data-action="hide-section" data-section-id="${section.id}">
                        <span class="btn-icon">${LucideUtils.createIcon('xCircle', { size: 16 })}</span>
                        <span class="btn-text">隐藏板块</span>
                    </button>
                    <button class="section-settings-btn section-settings-btn-manage" data-action="open-section-manager">
                        <span class="btn-icon">${LucideUtils.createIcon('layoutGrid', { size: 16 })}</span>
                        <span class="btn-text">管理所有板块</span>
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">关闭</button>
            </div>
        `;
    },

};

ActionDispatcher.registerMany({
    'hide-section': (ds) => SectionManager.hideFromSettings(ds.sectionId),
    'open-section-manager': () => SectionManager.openManagerFromSettings()
});

window.SectionSettings = SectionSettings;