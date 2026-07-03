/**
 * 快速入门引导 HTML 模板
 * 纯字符串生成，从 Handlers.showQuickStartGuide 提取。
 */
export const QuickStartGuide = {
    render() {
        return `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">${LucideUtils.createIcon('arrowUpFromLine', { size: 48 })}</div>
                <h2 style="margin-bottom: 8px;">Welcome to Bamboo Immortals</h2>
                <p style="color: var(--text-secondary);">开始记录你的每一天</p>
            </div>
            <div style="display: grid; gap: 16px; margin-bottom: 24px;">
                <div style="padding: 16px; background: hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.1); border-radius: 12px; text-align: left;">
                    <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">${LucideUtils.createIcon('calendar', { size: 24 })}</span>
                        日期导航
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                        • 点击左右箭头切换日期<br>
                        • 在手机上左右滑动也可以切换<br>
                        • 点击日期按钮跳转到指定日期
                    </div>
                </div>
                <div style="padding: 16px; background: hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.1); border-radius: 12px; text-align: left;">
                    <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">${LucideUtils.createIcon('edit', { size: 24 })}</span>
                        直接编辑
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                        • 点击任意内容区域即可直接编辑<br>
                        • 无需切换编辑模式，一步到位<br>
                        • 底部「+」菜单有更多快捷功能
                    </div>
                </div>
                <div style="padding: 16px; background: hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.1); border-radius: 12px; text-align: left;">
                    <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">${LucideUtils.createIcon('barChart', { size: 24 })}</span>
                        统计分析
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                        • 点击统计查看数据统计和图表<br>
                        • 查看目标和任务完成趋势<br>
                        • 数据自动保存和同步
                    </div>
                </div>
                <div style="padding: 16px; background: hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.1); border-radius: 12px; text-align: left;">
                    <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">${LucideUtils.createIcon('palette', { size: 24 })}</span>
                        主题切换
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                        • 切换多种漂亮的主题颜色<br>
                        • 支持明暗模式切换<br>
                        • 个性化你的使用体验
                    </div>
                </div>
                <div style="padding: 16px; background: hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.1); border-radius: 12px; text-align: left;">
                    <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">${LucideUtils.createIcon('keyboard', { size: 24 })}</span>
                        键盘快捷键
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                        • <kbd style="background: var(--card-bg); padding: 2px 6px; border-radius: 4px;">←</kbd> <kbd style="background: var(--card-bg); padding: 2px 6px; border-radius: 4px;">→</kbd> 切换日期<br>
                        • <kbd style="background: var(--card-bg); padding: 2px 6px; border-radius: 4px;">Ctrl</kbd>+<kbd style="background: var(--card-bg); padding: 2px 6px; border-radius: 4px;">Z</kbd> 撤销<br>
                        • <kbd style="background: var(--card-bg); padding: 2px 6px; border-radius: 4px;">Esc</kbd> 关闭弹窗
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" data-action="close-modal">开始使用</button>
            </div>
        `;
    }
};

window.QuickStartGuide = QuickStartGuide;
