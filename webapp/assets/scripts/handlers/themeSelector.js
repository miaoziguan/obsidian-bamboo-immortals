/**
 * ThemeSelector - 明暗模式切换
 *
 * 主题配色选择已移至 SettingsModal 外观 Tab，
 * 此模块仅保留明暗模式切换和 FAB 按钮状态更新。
 */
window.ThemeSelector = {
    setDarkMode(isDark) {
        store.setDarkMode(isDark);
        this.updateDarkModeButton();
    },

    updateDarkModeButton() {
        const icon = document.getElementById('darkModeIcon');
        const text = document.getElementById('darkModeText');
        if (icon && text) {
            const { ui } = store.getState();
            if (ui.isDarkMode) {
                icon.innerHTML = LucideUtils.createIcon('sun', { size: 18 });
                text.textContent = '日间模式';
            } else {
                icon.innerHTML = LucideUtils.createIcon('moon', { size: 18 });
                text.textContent = '夜间模式';
            }
        }
    }
};
