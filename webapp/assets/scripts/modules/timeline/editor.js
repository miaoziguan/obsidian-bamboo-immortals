export const TimelineEditor = {
    editingIndex: -1,

    open() {
        this.renderList();
    },

    renderList() {
        const data = store.getCurrentDayData();
        const timeline = data.timeline || [];

        const content = `
            <div class="item-list" id="timelineEditorList">
                ${timeline.map((item, index) => `
                    <div class="item-card">
                        <div class="item-card-content">
                            <div class="item-card-title">${item.icon} ${escapeHtml(item.name)}</div>
                            <div class="item-card-subtitle">${escapeHtml(item.time)} - ${item.items ? item.items.length : 0}个活动</div>
                        </div>
                        <div class="item-card-actions">
                            <button class="btn btn-secondary btn-sm" data-action="timeline-editor-edit-item" data-index="${index}">编辑</button>
                            <button class="btn btn-danger btn-sm" data-action="timeline-editor-delete-item" data-index="${index}">删除</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="add-btn" data-action="timeline-editor-add-item">+ 添加时段</button>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">关闭</button>
            </div>
        `;
        Handlers.openModal(content, '编辑活动时间线');
    },

    addItem() {
        const data = store.getCurrentDayData();
        if (!data.timeline) data.timeline = [];

        data.timeline.push({
            period: 'morning',
            name: '新时段',
            time: '07:00 - 12:00',
            icon: 'briefcase',
            eval: 'good',
            items: []
        });

        this.editingIndex = data.timeline.length - 1;
        const checkInTimes = calculateCheckInTimes(data.timeline);
        if (!data.metrics) data.metrics = {};
        data.metrics.firstCheckIn = checkInTimes.firstCheckIn;
        data.metrics.lastCheckIn = checkInTimes.lastCheckIn;
        store.updateDayData({ timeline: data.timeline, metrics: data.metrics }).then(() => {
            renderAll();
            this.renderForm();
        }).catch(e => console.error('[Bamboo] 保存时间线失败:', e));
    },

    editItem(index) {
        this.editingIndex = index;
        this.renderForm();
    },

    renderForm() {
        const data = store.getCurrentDayData();
        const item = data.timeline[this.editingIndex];
        if (!item) return;

        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">时段名称</label>
                    <input type="text" class="form-input" id="tl-name" value="${escapeHtml(item.name)}">
                </div>
                <div class="form-group">
                    <label class="form-label">时段类型</label>
                    <select class="form-select" id="tl-period">
                        <option value="lateNight" ${item.period === 'lateNight' ? 'selected' : ''}>凌晨</option>
                        <option value="dawn" ${item.period === 'dawn' ? 'selected' : ''}>黎明</option>
                        <option value="earlyMorning" ${item.period === 'earlyMorning' ? 'selected' : ''}>清晨</option>
                        <option value="morning" ${item.period === 'morning' ? 'selected' : ''}>上午</option>
                        <option value="midday" ${item.period === 'midday' ? 'selected' : ''}>中午</option>
                        <option value="afternoon" ${item.period === 'afternoon' ? 'selected' : ''}>下午</option>
                        <option value="dusk" ${item.period === 'dusk' ? 'selected' : ''}>傍晚</option>
                        <option value="evening" ${item.period === 'evening' ? 'selected' : ''}>晚上</option>
                        <option value="night" ${item.period === 'night' ? 'selected' : ''}>深夜</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">时间范围</label>
                    <input type="text" class="form-input" id="tl-time" value="${escapeHtml(item.time)}" placeholder="例如: 09:00 - 12:00">
                </div>
                <div class="form-group">
                    <label class="form-label">图标</label>
                    <input type="text" class="form-input" id="tl-icon" value="${item.icon}" placeholder="例如: 💼">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">活动列表</label>
                <div id="activityListEditor">
                    ${this.renderActivityEditor(item.items || [])}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="timeline-editor-render-list">返回</button>
                <button class="btn btn-primary" data-action="timeline-editor-save">保存</button>
            </div>
        `;
        document.getElementById('modalBody').innerHTML = content;
        document.querySelector('.modal-title').textContent = this.editingIndex >= 0 ? '编辑时段' : '添加时段';
    },

    renderActivityEditor(items) {
        return `
            <div style="max-height: 200px; overflow-y: auto; margin-bottom: 12px;">
                ${items.map((act, idx) => `
                    <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                        <input type="text" class="form-input" style="width: 60px;" value="${escapeHtml(act.time)}" placeholder="时间" data-activity-time="${idx}">
                        <input type="text" class="form-input" style="flex: 1;" value="${escapeHtml(act.task)}" placeholder="任务内容" data-activity-task="${idx}">
                        <input type="text" class="form-input" style="flex: 1;" value="${escapeHtml(act.eval || '')}" placeholder="评价(可选)" data-activity-eval="${idx}">
                        <button class="btn btn-danger btn-sm" data-action="remove-period-item" data-item-idx="${idx}">✕</button>
                    </div>
                `).join('')}
            </div>
            <button class="add-btn" data-action="timeline-editor-add-activity">+ 添加活动</button>
        `;
    },

    addActivity() {
        const data = store.getCurrentDayData();
        const item = data.timeline[this.editingIndex];
        if (!item.items) item.items = [];
        item.items.push({ time: '', task: '', eval: '' });
        store.scheduleAutoSave();
        const container = document.getElementById('activityListEditor');
        if (container) container.innerHTML = this.renderActivityEditor(item.items);
    },

    removeActivity(index) {
        const data = store.getCurrentDayData();
        const item = data.timeline[this.editingIndex];
        if (!item.items) return;
        item.items.splice(index, 1);
        store.scheduleAutoSave();
        const container = document.getElementById('activityListEditor');
        if (container) container.innerHTML = this.renderActivityEditor(item.items);
    },

    save() {
        const data = store.getCurrentDayData();
        const item = data.timeline[this.editingIndex];
        if (!item) return;

        item.name = document.getElementById('tl-name').value;
        item.period = document.getElementById('tl-period').value;
        item.time = document.getElementById('tl-time').value;
        item.icon = document.getElementById('tl-icon').value;

        const timeInputs = document.querySelectorAll('[data-activity-time]');
        const taskInputs = document.querySelectorAll('[data-activity-task]');
        const evalInputs = document.querySelectorAll('[data-activity-eval]');

        item.items = [];
        for (let i = 0; i < timeInputs.length; i++) {
            const taskValue = taskInputs[i].value.trim();
            if (taskValue) {
                item.items.push({
                    time: timeInputs[i].value,
                    task: taskValue,
                    eval: evalInputs[i].value
                });
            }
        }

        const checkInTimes = calculateCheckInTimes(data.timeline);
        if (!data.metrics) data.metrics = {};
        data.metrics.firstCheckIn = checkInTimes.firstCheckIn;
        data.metrics.lastCheckIn = checkInTimes.lastCheckIn;

        store.updateDayData({ timeline: data.timeline, metrics: data.metrics }).then(() => {
            renderAll();
            this.renderList();
            Toast.showToast('时段已保存', 'success');
        }).catch(e => console.error('[Bamboo] 保存时间线失败:', e));
    },

    deleteItem(index) {
        ConfirmDialog.confirmDelete('确定删除这个时段吗？此操作无法撤销。').then((confirmed) => {
            if (!confirmed) return;
        const data = store.getCurrentDayData();
        data.timeline.splice(index, 1);
        const checkInTimes = calculateCheckInTimes(data.timeline);
        if (!data.metrics) data.metrics = {};
        data.metrics.firstCheckIn = checkInTimes.firstCheckIn;
        data.metrics.lastCheckIn = checkInTimes.lastCheckIn;
        store.updateDayData({ timeline: data.timeline, metrics: data.metrics }).then(() => {
            renderAll();
            this.renderList();
        }).catch(e => console.error('[Bamboo] 删除时间线时段失败:', e));
        });
    }
};

ActionDispatcher.registerMany({
    'timeline-editor-edit-item': (ds) => TimelineEditor.editItem(parseInt(ds.index)),
    'timeline-editor-delete-item': (ds) => TimelineEditor.deleteItem(parseInt(ds.index)),
    'timeline-editor-add-item': () => TimelineEditor.addItem(),
    'timeline-editor-render-list': () => TimelineEditor.renderList(),
    'timeline-editor-save': () => TimelineEditor.save(),
    'remove-period-item': (ds) => TimelineEditor.removeActivity(parseInt(ds.itemIdx)),
    'timeline-editor-add-activity': () => TimelineEditor.addActivity()
});

window.TimelineEditor = TimelineEditor;