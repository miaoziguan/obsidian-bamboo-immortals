window.DataIO = {

    /**
     * 导出全部数据为 JSON 文件（从 store 迁入）
     */
    async exportData() {
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

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `daily-review-data-${store.getDateKey()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    /**
     * 导入数据（从 store 迁入）
     */
    async importData(backupData, options = {}) {
        try {
            const data = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;

            if (!data || (typeof data !== 'object')) {
                throw new Error('无效的备份文件');
            }
            const hasAnyData = data.days || data.data || data.goals || data.globalGoals || data.settings || data.purchaseHistory || data.incomeHistory;
            if (!hasAnyData) {
                throw new Error('备份文件为空');
            }

            await storageManager.importData(data, options);
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

    openExport() {
        const content = `
            <div class="form-group">
                <label class="form-label">导出数据</label>
                <button class="btn btn-block btn-primary" data-action="export-data">
                    导出为 JSON 文件
                </button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">关闭</button>
            </div>
        `;
        Handlers.openModal(content, '导出分享');
    },

    openImport() {
        const content = `
            <div class="form-group">
                <label class="form-label">选择要导入的JSON文件</label>
                <input type="file" class="form-input" id="importFileInput" accept=".json,application/json">
            </div>
            <div class="form-group" style="margin-top: 20px;">
                <label class="form-label">或者粘贴JSON内容</label>
                <textarea class="form-textarea" id="importTextarea" rows="6" placeholder="粘贴JSON数据..."></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">取消</button>
                <button class="btn btn-primary" data-action="import-from-textarea">从文本框导入</button>
            </div>
        `;
        Handlers.openModal(content, '导入数据');
        const fileInput = document.getElementById('importFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleImportFile(e));
        }
    },

    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = await this.importData(e.target.result);
            if (result.success) {
                renderAll();
                Handlers.closeModal();
                Toast.showToast('数据导入成功', 'success');
            } else {
                Toast.showToast('JSON格式错误: ' + result.error, 'error');
            }
        };
        reader.readAsText(file);
    },

    async importFromTextarea() {
        const textarea = document.getElementById('importTextarea');
        if (!textarea?.value.trim()) {
            Toast.showToast('请输入要导入的JSON数据', 'warning');
            return;
        }
        const result = await this.importData(textarea.value);
        if (result.success) {
            renderAll();
            Handlers.closeModal();
            Toast.showToast('数据导入成功', 'success');
        } else {
            Toast.showToast('JSON格式错误: ' + result.error, 'error');
        }
    },

    quickImportFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const result = await this.importData(event.target.result);
                    if (result.success) {
                        Toast.showToast('数据导入成功', 'success');
                        renderAll();
                    } else {
                        Toast.showToast('导入失败: ' + result.error, 'error');
                    }
                } catch (err) {
                    Toast.showToast('导入失败: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
};
