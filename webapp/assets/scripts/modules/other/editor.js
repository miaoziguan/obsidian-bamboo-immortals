export const OtherModule = {
    openOtherEditor() {
        const data = store.getCurrentDayData();

        const content = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--text-primary);">验证清单</h4>
                    <div id="verifyItemsEditor">
                        ${VerifyEditor.renderEditor(data)}
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--text-primary);">诊断分析</h4>
                    <div id="diagnosisEditor">
                        ${DiagnosisEditor.renderEditor(data)}
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--text-primary);">行动方案</h4>
                    <div class="form-group">
                        <label class="form-label">今日分析</label>
                        ${ActionsEditor.renderDiagnosisEditor(data)}
                    </div>
                    <div id="actionNormalEditor">
                        ${ActionsEditor.renderNormalEditor(data)}
                    </div>
                    <div id="actionFocusEditor">
                        ${ActionsEditor.renderFocusEditor(data)}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">取消</button>
                <button class="btn btn-primary" data-action="other-editor-save">保存</button>
            </div>
        `;
        Handlers.openModal(content, '编辑其他内容');
    },

    save() {
        const data = store.getCurrentDayData();

        const verifyItems = [];
        document.querySelectorAll('[data-verify-title]')?.forEach((el, idx) => {
            const iconEl = document.querySelector(`[data-verify-icon="${idx}"]`);
            const detailEl = document.querySelector(`[data-verify-detail="${idx}"]`);
            const statusEl = document.querySelector(`[data-verify-status="${idx}"]`);
            if (el?.value.trim()) {
                verifyItems.push({
                    icon: iconEl?.value || 'check',
                    title: el.value,
                    detail: detailEl?.value || '',
                    status: statusEl?.value || 'ok',
                    tag: statusEl?.value === 'warn' ? 'tag-miss' : 'tag-execute',
                    tagText: statusEl?.value === 'warn' ? '待改进' : '已执行'
                });
            }
        });
        data.verifyItems = verifyItems;

        const diagnosis = [];
        document.querySelectorAll('[data-diagnosis-title]')?.forEach((el, idx) => {
            const typeEl = document.querySelector(`[data-diagnosis-type="${idx}"]`);
            if (el?.value.trim()) {
                const items = [];
                document.querySelectorAll(`[data-diagnosis-line^="${idx}-"]`)?.forEach(lineEl => {
                    if (lineEl?.value.trim()) items.push(lineEl.value);
                });
                diagnosis.push({
                    type: typeEl?.value || 'highlight',
                    title: el.value,
                    items
                });
            }
        });
        data.diagnosis = diagnosis;

        if (!data.actions) data.actions = {};
        data.actions.diagnosis = document.getElementById('action-diagnosis')?.value || '';

        const normalItems = [];
        document.querySelectorAll('[data-normal-label]')?.forEach((el, idx) => {
            const contentEl = document.querySelector(`[data-normal-content="${idx}"]`);
            if (el?.value.trim()) {
                normalItems.push({ label: el.value, content: contentEl?.value || '' });
            }
        });
        data.actions.normal = normalItems;

        const focusItems = [];
        document.querySelectorAll('[data-focus-title]')?.forEach((el, idx) => {
            const typeEl = document.querySelector(`[data-focus-type="${idx}"]`);
            const textEl = document.querySelector(`[data-focus-text="${idx}"]`);
            if (el?.value.trim()) {
                focusItems.push({
                    type: typeEl?.value || 'result',
                    title: el.value,
                    text: textEl?.value || ''
                });
            }
        });
        data.actions.focus = focusItems;

        store.updateDayData(data).then(() => {
            renderAll();
            Handlers.closeModal();
            Toast.showToast('其他内容已保存', 'success');
        }).catch(e => {
            console.error('[Bamboo] 保存其他内容失败:', e);
            Toast.showToast('保存失败，请重试', 'error');
        });
    }
};

ActionDispatcher.registerMany({
    'other-editor-save': () => OtherModule.save()
});

window.OtherModule = OtherModule;