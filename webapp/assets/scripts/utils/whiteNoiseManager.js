import { byId, $, $$, modalMount } from './domRef.js';
/**
 * WhiteNoiseManager - 白噪音管理器（门面模式）
 * 保持原有API不变，内部调用 NoisePlayer / NoiseGenerator / NoisePanel
 */
export const WhiteNoiseManager = {
    NOISE_TYPES: [
        {
            id: 'bamboo', name: '竹林',
            filterType: 'bandpass', filterFreq: 1200, filterQ: 0.4
        },
        {
            id: 'stream', name: '溪流',
            filterType: 'lowpass', filterFreq: 800, filterQ: 0.3
        },
        {
            id: 'crickets', name: '夜虫',
            filterType: 'bandpass', filterFreq: 3500, filterQ: 1.2
        },
        {
            id: 'campfire', name: '篝火',
            filterType: 'lowpass', filterFreq: 500, filterQ: 0.5
        }
    ],

    customNoises: [],
    _ticketStubEl: null,
    timerMinutes: 0,     // 定时分钟数，0=关闭
    _timerInterval: null, // setInterval id
    _timerEndAt: null,    // 定时到期时间戳

    // 初始化
    async init() {
        // 加载自定义音效（优先从插件持久化层，克服 localStorage port-scoped 问题）
        if (typeof storageManager !== 'undefined' && storageManager.getCustomNoises) {
            // 等待 bridge 完成初始化（postMessage 异步往返），否则 this.customNoises 为空
            try { await storageManager.initPromise; } catch (e) { /* bridge 不可用时静默回退 */ }
            const saved = storageManager.getCustomNoises();
            this.customNoises = Array.isArray(saved) ? saved : [];
        } else {
            this.customNoises = JSON.parse(StorageAdapter.get(StorageKeys.WHITENOISE_CUSTOM) || '[]');
        }

        // 缓存 ticket-stub DOM 引用
        this._ticketStubEl = $('.ticket-stub');
        setTimeout(() => { this.updateTicketControlDisplay(); }, 500);

        // 初始化播放器
        NoisePlayer.init();

        // 页面刷新自动恢复播放（走完整的音源解析→生成→播放流程）
        if (StorageAdapter.get(StorageKeys.WHITENOISE_PLAYING) === 'true') {
            const savedType = NoisePlayer.currentType || 'bamboo';
            setTimeout(() => {
                this.play(savedType).then(() => {
                    // 播放成功后再恢复定时器，避免 isPlaying 仍为 false 导致定时器被误丢弃
                    this._restoreTimer();
                }).catch(e => {
                    console.warn('[Bamboo] 恢复白噪音播放失败:', e);
                    StorageAdapter.set(StorageKeys.WHITENOISE_PLAYING, 'false');
                });
            }, 300);
        } else {
            // 没有需要恢复的播放，直接恢复定时器（清理过期数据）
            this._restoreTimer();
        }
    },

    // 播放音效
    async play(typeId) {
        const noiseType = [...this.NOISE_TYPES, ...this.customNoises].find(t => t.id === typeId);
        if (!noiseType) return;

        const ctx = NoisePlayer.getAudioCtx();
        let buffer;

        // 根据音源类型加载音频
        if (noiseType.source === 'url') {
            // 外部链接 — 通过插件端代理，绕过 webview CORS 限制（桌面/移动一致）
            try {
                Toast.showToast('正在加载外部音源...', 'info');
                const dataUrl = await this._requestBinaryFile('app:proxyAudioUrl', { url: noiseType.data });
                const response = await fetch(dataUrl);
                if (!response.ok) throw new Error('网络请求失败');
                const arrayBuffer = await response.arrayBuffer();
                buffer = await ctx.decodeAudioData(arrayBuffer);
            } catch (e) {
                console.error('Failed to load audio source:', e);
                if (e.name === 'TimeoutError' || e.name === 'AbortError') {
                    Toast.showToast('音源加载超时，请检查网络状况', 'error');
                } else if (e.message && e.message.includes('decode')) {
                    Toast.showToast('音频文件已损坏或格式不兼容', 'error');
                } else if (e.message && e.message.includes('fetch')) {
                    Toast.showToast('无法连接音源，链接可能已失效', 'error');
                } else {
                    Toast.showToast('无法播放该音源，请确认链接有效且支持跨域', 'error');
                }
                return;
            }
        } else if (noiseType.source === 'file') {
            // 本地文件 — 库内相对路径走 readVaultFile，绝对路径走 readLocalFile
            try {
                Toast.showToast('正在读取本地文件...', 'info');
                const isVaultPath = !noiseType.data.startsWith('/') && !noiseType.data.includes(':\\');
                const dataUrl = isVaultPath
                    ? await this._requestVaultFileRead(noiseType.data)
                    : await this._requestFileRead(noiseType.data);
                const response = await fetch(dataUrl);
                if (!response.ok) throw new Error('读取失败');
                const arrayBuffer = await response.arrayBuffer();
                buffer = await ctx.decodeAudioData(arrayBuffer);
            } catch (e) {
                console.error('Failed to load local file:', e);
                if (e.message && e.message.includes('超时')) {
                    Toast.showToast('读取本地文件超时，文件可能过大', 'error');
                } else if (e.message && e.message.includes('decode')) {
                    Toast.showToast('本地音频文件已损坏或格式不兼容', 'error');
                } else {
                    Toast.showToast('无法读取本地文件，请确认文件路径正确且为有效音频', 'error');
                }
                return;
            }
        } else {
            // 内置音效：使用 NoiseGenerator 生成
            buffer = NoiseGenerator.generate(typeId, ctx);
        }

        // 调用播放器播放
        await NoisePlayer.play(typeId, noiseType, buffer);

        // 更新UI
        this.updateTicketStubState(true);
        NoisePanel.updateUI();
        this.updateTicketControlDisplay();
    },

    // 暂停
    pause() {
        NoisePlayer.pause();
        this.updateTicketStubState(false);
        NoisePanel.updateUI();
        this.updateTicketControlDisplay();
    },

    // 停止
    stop() {
        NoisePlayer.stop();
        this.updateTicketStubState(false);
        NoisePanel.updateUI();
        this.updateTicketControlDisplay();
    },

    // 切换播放/暂停
    toggle() {
        if (NoisePlayer.isPlaying) {
            this.pause();
        } else {
            const type = NoisePlayer.currentType || 'bamboo';
            this.play(type);
        }
    },

    // 上一个
    prev() {
        const all = [...this.NOISE_TYPES, ...this.customNoises];
        if (all.length === 0) return;
        const currentIndex = all.findIndex(t => t.id === NoisePlayer.currentType);
        const newIndex = currentIndex <= 0 ? all.length - 1 : currentIndex - 1;
        this.play(all[newIndex].id);
    },

    // 下一个
    next() {
        const all = [...this.NOISE_TYPES, ...this.customNoises];
        if (all.length === 0) return;
        const currentIndex = all.findIndex(t => t.id === NoisePlayer.currentType);
        const newIndex = (currentIndex < 0 || currentIndex >= all.length - 1) ? 0 : currentIndex + 1;
        this.play(all[newIndex].id);
    },

    // 显示面板
    showPanel() {
        NoisePanel.show();
    },

    // 隐藏面板
    hidePanel() {
        NoisePanel.hide();
    },

    // 切换面板
    togglePanel() {
        NoisePanel.toggle();
    },

    // 更新悬浮菜单状态
    updateTicketStubState(isPlaying) {
        if (!this._ticketStubEl) {
            this._ticketStubEl = $('.ticket-stub');
        }
        if (this._ticketStubEl) {
            if (isPlaying) {
                this._ticketStubEl.classList.add('playing');
            } else {
                this._ticketStubEl.classList.remove('playing');
            }
        }
    },

    // 更新悬浮菜单显示
    updateTicketControlDisplay() {
        const noiseType = [...this.NOISE_TYPES, ...this.customNoises].find(t => t.id === NoisePlayer.currentType);
        const nameEls = $$('.stub-nc-name');

        if (noiseType) {
            nameEls.forEach(el => { el.textContent = noiseType.name; });
        }
    },

    // ===== 定时停止 =====
    // 定时选项（分钟）
    TIMER_OPTIONS: [0, 15, 30, 45, 60],

    // 设置/切换定时器
    setTimer(minutes) {
        this.clearTimer();
        this.timerMinutes = minutes;
        if (minutes <= 0) {
            StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
            NoisePanel.updateTimerUI();
            return;
        }

        this._timerEndAt = Date.now() + minutes * 60000;
        StorageAdapter.set(StorageKeys.WHITENOISE_TIMER, JSON.stringify({ minutes, endAt: this._timerEndAt }));

        // 每秒更新倒计时显示
        this._timerInterval = setInterval(() => {
            const remaining = Math.max(0, this._timerEndAt - Date.now());
            if (remaining <= 0) {
                this._onTimerExpired();
                return;
            }
            NoisePanel.updateTimerUI();
        }, 1000);

        NoisePanel.updateTimerUI();
        Toast.showToast(`已设置 ${minutes} 分钟定时停止`, 'info');
    },

    // 清除定时器
    clearTimer() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
        this.timerMinutes = 0;
        this._timerEndAt = null;
        StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
    },

    // 获取剩余秒数
    getTimerRemaining() {
        if (!this._timerEndAt) return 0;
        return Math.max(0, Math.ceil((this._timerEndAt - Date.now()) / 1000));
    },

    // 定时器到期
    _onTimerExpired() {
        this.clearTimer();
        // 淡出 2 秒后停止
        NoisePlayer.fadeOut(2);
        this.updateTicketStubState(false);
        this.updateTicketControlDisplay();
        NoisePanel.updateTimerUI();
        Toast.showToast('定时结束，已停止播放', 'info');
    },

    // 从 localStorage 恢复定时器（页面刷新后）
    _restoreTimer() {
        const saved = StorageAdapter.get(StorageKeys.WHITENOISE_TIMER);
        if (!saved) return;
        try {
            const { minutes, endAt } = JSON.parse(saved);
            if (!minutes || !endAt) return;
            const remaining = endAt - Date.now();
            if (remaining <= 0) {
                // 已过期，清理
                StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
                return;
            }
            // 只有正在播放时才恢复定时器
            if (NoisePlayer.isPlaying) {
                this.timerMinutes = minutes;
                this._timerEndAt = endAt;
                this._timerInterval = setInterval(() => {
                    const r = Math.max(0, this._timerEndAt - Date.now());
                    if (r <= 0) {
                        this._onTimerExpired();
                        return;
                    }
                    NoisePanel.updateTimerUI();
                }, 1000);
                NoisePanel.updateTimerUI();
            } else {
                // 没在播放，清理过期定时器
                StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
            }
        } catch (e) {
            StorageAdapter.remove(StorageKeys.WHITENOISE_TIMER);
        }
    },

    // 添加自定义音源
    async addCustomNoise() {
        const result = await this._showAddNoiseModal();

        if (!result) return;
        const { name, source, url, filepath } = result;
        if (!name.trim()) return;

        let data, sourceType;
        if (source === 'file') {
            data = filepath.trim();
            sourceType = 'file';
        } else {
            data = url.trim();
            sourceType = 'url';
        }
        if (!data) return;

        // 1. 校验文件格式（扩展名白名单）
        const formatErr = this._checkAudioFormat(data);
        if (formatErr) {
            Toast.showToast(formatErr, 'error');
            return;
        }

        // 2. 实际加载并解码音频，验证音源可用
        Toast.showToast('正在验证音源...', 'info');
        const validateResult = await this._validateAudioSource(data, sourceType);
        if (!validateResult.ok) {
            Toast.showToast(validateResult.reason, 'error');
            return;
        }

        Toast.showToast('音源验证通过，正在保存...', 'info');

        // 保存自定义音效
        const newNoise = {
            id: 'custom_' + Date.now(),
            name: name.trim(),
            category: 'custom',
            source: sourceType,
            data: data
        };

        try {
            if (!Array.isArray(this.customNoises)) {
                this.customNoises = [];
            }
            this.customNoises.push(newNoise);
            this._saveCustomNoises();
            NoisePanel._rebuild();
            this.updateTicketControlDisplay();
            Toast.showToast('音源已成功加入自定义', 'success');
        } catch (err) {
            Toast.showToast('保存失败', 'error');
        }
    },

    // 重命名自定义音源
    async renameCustomNoise(id) {
        const noise = this.customNoises.find(n => n.id === id);
        if (!noise) return;

        const newName = await this._showRenameModal(noise.name);
        if (!newName || newName === noise.name) return;

        noise.name = newName;
        this._saveCustomNoises();
        NoisePanel._rebuild();
        this.updateTicketControlDisplay();
    },

    // 重命名弹窗
    _showRenameModal(currentName) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'wn-file-picker-overlay';
            overlay.innerHTML = `
                <div class="wn-file-picker" style="max-width:320px;">
                    <div class="wn-file-picker-header">
                        <span>重命名音效</span>
                        <button class="wn-file-picker-close" id="wnreClose">&times;</button>
                    </div>
                    <div class="wn-file-picker-body" style="padding:16px;">
                        <label class="wnfp-field">
                            <span class="wnfp-label">音效名称</span>
                            <input type="text" id="wnreName" value="${currentName.replace(/"/g, '&quot;')}" style="width:100%;box-sizing:border-box;">
                        </label>
                    </div>
                    <div class="wn-file-picker-footer">
                        <button class="wnfp-btn wnfp-btn-cancel" id="wnreCancel">取消</button>
                        <button class="wnfp-btn wnfp-btn-add" id="wnreConfirm">保存</button>
                    </div>
                </div>
            `;
            modalMount().appendChild(overlay);

            const input = byId('wnreName');
            input.focus();
            input.select();

            const close = (result) => {
                overlay.remove();
                resolve(result);
            };

            overlay.querySelector('#wnreClose').addEventListener('click', () => close(null));
            overlay.querySelector('#wnreCancel').addEventListener('click', () => close(null));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(null);
            });
            overlay.querySelector('#wnreConfirm').addEventListener('click', () => {
                const val = input.value.trim();
                close(val || null);
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = input.value.trim();
                    close(val || null);
                }
                if (e.key === 'Escape') close(null);
            });
        });
    },

    // 删除自定义音源
    async removeCustomNoise(id) {
        const confirmed = await Confirm.danger({
            title: '删除音效',
            message: '确定要删除这个自定义白噪音吗？',
            confirmText: '删除',
            cancelText: '取消'
        });
        if (!confirmed) return;

        this.customNoises = this.customNoises.filter(n => n.id !== id);
        this._saveCustomNoises();

        if (NoisePlayer.currentType === id) {
            this.stop();
        }

        NoisePanel._rebuild();
    },

    // 持久化自定义音源（优先桥接到插件 storage，克服 localStorage port-scoped 问题）
    _saveCustomNoises() {
        const data = JSON.stringify(this.customNoises);
        if (typeof storageManager !== 'undefined' && storageManager.saveCustomNoises) {
            storageManager.saveCustomNoises(this.customNoises);
        }
        // 兜底：同时写 localStorage（不做 port 切换时仍有效）
        try { StorageAdapter.set(StorageKeys.WHITENOISE_CUSTOM, data); } catch (e) {}
    },

    // 检验文件格式（扩展名白名单）
    _checkAudioFormat(data) {
        const SUPPORTED = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.webm', '.opus'];
        const lower = data.toLowerCase().replace(/\?.*$/, ''); // 去掉 URL 参数
        if (!SUPPORTED.some(ext => lower.endsWith(ext))) {
            return '不支持的文件格式。请使用 mp3 / wav / ogg / flac / m4a / aac / webm / opus 格式的音频文件';
        }
        return null;
    },

    // 实际加载并解码音频，验证音源可用
    async _validateAudioSource(data, sourceType) {
        const ctx = NoisePlayer.getAudioCtx();
        try {
            let arrayBuffer;

            if (sourceType === 'url') {
                // 网络音源：通过插件端代理，绕过 CORS
                const dataUrl = await this._requestBinaryFile('app:proxyAudioUrl', { url: data });
                const resp = await fetch(dataUrl, {
                    signal: AbortSignal.timeout(20000)  // 20s 超时
                });
                if (!resp.ok) {
                    return { ok: false, reason: `链接访问失败 (HTTP ${resp.status})，请检查 URL 是否有效` };
                }
                // 检查 Content-Type（仅警告，不阻断）
                const ct = resp.headers.get('Content-Type') || '';
                if (ct && !ct.includes('audio') && !ct.includes('octet-stream') && !ct.includes('video')) {
                    console.warn('[Bamboo] 音源 Content-Type 非音频:', ct);
                }
                arrayBuffer = await resp.arrayBuffer();
            } else {
                // 本地文件：库内路径走 readVaultFile，绝对路径走 readLocalFile
                const isVaultPath = !data.startsWith('/') && !data.includes(':\\');
                const dataUrl = isVaultPath
                    ? await this._requestVaultFileRead(data)
                    : await this._requestFileRead(data);
                const resp = await fetch(dataUrl);
                if (!resp.ok) {
                    return { ok: false, reason: '本地文件读取失败，请检查文件路径是否正确' };
                }
                arrayBuffer = await resp.arrayBuffer();
            }

            // 实际解码验证（这是最终的可靠性验证）
            await ctx.decodeAudioData(arrayBuffer.slice(0));
            return { ok: true };
        } catch (e) {
            if (e.name === 'TimeoutError' || e.name === 'AbortError') {
                return { ok: false, reason: '音源加载超时（20s），请检查网络状况或音源大小' };
            }
            if (e.name === 'EncodingError' || (e.message && e.message.includes('decode'))) {
                return { ok: false, reason: '无法解码该音频文件，文件可能已损坏或编码格式不兼容' };
            }
            if (e.name === 'TypeError' && e.message && e.message.includes('fetch')) {
                return { ok: false, reason: '网络请求失败，请检查链接是否支持跨域访问（CORS）' };
            }
            return { ok: false, reason: '音源验证失败：' + (e.message || '未知错误') };
        }
    },

    // 从库中选择文件的自定义 Modal
    async _showAddNoiseModal() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'wn-file-picker-overlay';
            overlay.innerHTML = `
                <div class="wn-file-picker">
                    <div class="wn-file-picker-header">
                        <span>添加自定义音源</span>
                        <button class="wn-file-picker-close" id="wnfpClose">&times;</button>
                    </div>
                    <div class="wn-file-picker-body">
                        <label class="wnfp-field">
                            <span class="wnfp-label">音效名称</span>
                            <input type="text" id="wnfpName" placeholder="自定义氛围" style="width:100%;box-sizing:border-box;">
                        </label>
                        <div class="wnfp-source-tabs">
                            <button class="wnfp-tab wnfp-tab-active" data-source="url">网络链接</button>
                            <button class="wnfp-tab" data-source="file">从库中选择</button>
                        </div>
                        <div class="wnfp-source-content">
                            <div class="wnfp-url-section" id="wnfpUrlSection">
                                <input type="text" id="wnfpUrl" placeholder="https://example.com/audio.mp3" style="width:100%;box-sizing:border-box;">
                            </div>
                            <div class="wnfp-file-section" id="wnfpFileSection" style="display:none;">
                                <div class="wnfp-file-picker-row">
                                    <button class="wnfp-browse-btn" id="wnfpBrowse">浏览库内文件</button>
                                    <span class="wnfp-selected-file" id="wnfpSelected">未选择</span>
                                </div>
                                <div class="wnfp-file-hint">
                                    💡 推荐音源：<a href="https://freesound.org" target="_blank">Freesound.org</a>（72万+免费音效），下载后放入库内即可添加
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="wn-file-picker-footer">
                        <button class="wnfp-btn wnfp-btn-cancel" id="wnfpCancel">取消</button>
                        <button class="wnfp-btn wnfp-btn-add" id="wnfpAdd">添加</button>
                    </div>
                </div>
            `;
            modalMount().appendChild(overlay);

            let activeSource = 'url';
            let pickedFile = '';
            let picking = false;

            const close = (result) => {
                overlay.remove();
                resolve(result);
            };

            // Tab 切换
            overlay.querySelectorAll('.wnfp-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    activeSource = tab.dataset.source;
                    overlay.querySelectorAll('.wnfp-tab').forEach(t => t.classList.toggle('wnfp-tab-active', false));
                    tab.classList.add('wnfp-tab-active');
                    byId('wnfpUrlSection').style.display = activeSource === 'url' ? 'block' : 'none';
                    byId('wnfpFileSection').style.display = activeSource === 'file' ? 'block' : 'none';
                });
            });

            // URL 输入时自动填充名称
            const urlInput = byId('wnfpUrl');
            urlInput.addEventListener('input', () => {
                const val = urlInput.value.trim();
                const nameInput = byId('wnfpName');
                if (val && !nameInput.value) {
                    try {
                        const pathName = new URL(val).pathname;
                        const fileName = decodeURIComponent(pathName.split('/').pop().replace(/\.[^.]+$/, ''));
                        nameInput.value = fileName || '';
                    } catch (e) { /* 非法 URL 忽略 */ }
                }
            });

            // 浏览文件
            byId('wnfpBrowse').addEventListener('click', async () => {
                if (picking) return;
                picking = true;
                const btn = byId('wnfpBrowse');
                btn.textContent = '扫描中...';
                btn.disabled = true;
                try {
                    pickedFile = await this._pickVaultFile();
                    byId('wnfpSelected').textContent = pickedFile || '未选择';
                    // 自动填充名称：取文件名（去扩展名）
                    if (pickedFile) {
                        const fileName = pickedFile.split('/').pop().replace(/\.[^.]+$/, '');
                        byId('wnfpName').value = fileName || '';
                    }
                } catch (e) {
                    console.error('[Bamboo] 扫描库内音频文件失败:', e);
                    Toast.showToast(e.message || '扫描库文件失败', 'error');
                } finally {
                    btn.textContent = '浏览库内文件';
                    btn.disabled = false;
                    picking = false;
                }
            });

            // 关闭
            overlay.querySelector('#wnfpClose').addEventListener('click', () => close(null));
            overlay.querySelector('#wnfpCancel').addEventListener('click', () => close(null));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(null);
            });

            // 添加
            overlay.querySelector('#wnfpAdd').addEventListener('click', () => {
                const name = byId('wnfpName').value.trim();
                if (!name) { Toast.showToast('请输入音效名称', 'error'); return; }
                let source, url, filepath;
                if (activeSource === 'url') {
                    source = 'url';
                    url = byId('wnfpUrl').value.trim();
                    if (!url) { Toast.showToast('请输入音频链接', 'error'); return; }
                    filepath = '';
                } else {
                    source = 'file';
                    if (!pickedFile) { Toast.showToast('请从库中选择一个音频文件', 'error'); return; }
                    url = '';
                    filepath = pickedFile;
                }
                close({ name, source, url, filepath });
            });
        });
    },

    // 扫描库内音频文件并弹出选择器
    async _pickVaultFile() {
        const files = await this._requestVaultFileList();
        if (!files || files.length === 0) {
            Toast.showToast('库内未找到音频文件，请先将 MP3/WAV 等文件放入库中', 'info');
            return '';
        }
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'wn-file-picker-overlay';

            const formatSize = (bytes) => {
                if (bytes < 1024) return bytes + 'B';
                if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
                return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
            };

            const fileItems = files.map(f => `
                <div class="wnfp-vf-item" data-path="${HTMLUtils.escapeHtmlAttr(f.path)}" title="${HTMLUtils.escapeHtmlAttr(f.path)}">
                    <span class="wnfp-vf-icon">🎵</span>
                    <span class="wnfp-vf-name">${HTMLUtils.escapeHtml(f.name)}</span>
                    <span class="wnfp-vf-meta">${HTMLUtils.escapeHtml(f.ext)} · ${formatSize(f.size)}</span>
                    <span class="wnfp-vf-path">${HTMLUtils.escapeHtml(f.path)}</span>
                </div>
            `).join('');

            overlay.innerHTML = `
                <div class="wnfp-vf-panel">
                    <div class="wnfp-vf-header">
                        <span>选择库内音频文件 (${files.length})</span>
                        <button class="wnfp-vf-close">&times;</button>
                    </div>
                    <div class="wnfp-vf-body">
                        ${files.length === 0 ? '<div class="wnfp-vf-empty">库内未找到音频文件</div>' : fileItems}
                    </div>
                </div>
            `;
            modalMount().appendChild(overlay);

            const close = (path) => {
                overlay.remove();
                resolve(path || '');
            };

            overlay.querySelector('.wnfp-vf-close').addEventListener('click', () => close(''));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close('');
            });

            overlay.querySelectorAll('.wnfp-vf-item').forEach(item => {
                item.addEventListener('click', () => close(item.dataset.path));
            });
        });
    },

    // 向插件请求扫描库内音频文件
    _requestVaultFileList() {
        return new Promise((resolve, reject) => {
            const requestId = 'vault_list_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
            const handler = (event) => {
                const msg = event.data;
                if (!msg || msg.id !== requestId) return;
                window.removeEventListener('message', handler);
                if (msg.error) {
                    console.warn('[Bamboo] 插件返回扫描错误:', msg.error);
                    reject(new Error(msg.error));
                } else {
                    const files = msg.payload && msg.payload.files;
                    console.debug('[Bamboo] 扫描到库内音频文件:', files ? files.length : 0, '个');
                    resolve(files);
                }
            };
            window.addEventListener('message', handler);
            console.debug('[Bamboo] 请求扫描库内音频文件, requestId:', requestId);
            setTimeout(() => {
                window.removeEventListener('message', handler);
                console.warn('[Bamboo] 扫描库文件超时 (15s), requestId:', requestId);
                reject(new Error('扫描库文件超时，请检查插件是否已正确加载'));
            }, 15000);
            window.parent.postMessage({
                type: 'app:listVaultAudioFiles',
                id: requestId
            }, '*');
        });
    },

    // 通用：通过插件 postMessage 读取二进制音频，返回 base64 data URL（桌面/移动一致，不依赖 location.origin）
    _requestBinaryFile(messageType, payload) {
        return new Promise((resolve, reject) => {
            const requestId = messageType + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
            const handler = (event) => {
                const msg = event.data;
                if (!msg || msg.id !== requestId) return;
                window.removeEventListener('message', handler);
                if (msg.error) {
                    reject(new Error(msg.error));
                } else {
                    resolve(msg.payload && msg.payload.data);
                }
            };
            window.addEventListener('message', handler);
            // 超时保护 20s（大文件 base64 回传较慢）
            setTimeout(() => {
                window.removeEventListener('message', handler);
                reject(new Error('读取文件超时，文件可能过大'));
            }, 20000);
            window.parent.postMessage({
                type: messageType,
                id: requestId,
                payload
            }, '*');
        });
    },

    // 库内相对路径文件
    _requestVaultFileRead(relativePath) {
        return this._requestBinaryFile('app:readVaultFile', { path: relativePath });
    },

    // 本机绝对路径文件（保留兼容旧音源）
    _requestFileRead(filePath) {
        return this._requestBinaryFile('app:readLocalFile', { path: filePath });
    },

    // 通用输入型 Modal
    _showInputModal({ title, fields, confirmText = '确定', cancelText = '取消' }) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');

            const fieldsHtml = fields.map(f => {
                const fieldKey = HTMLUtils.escapeHtml(f.key);
                const fieldLabel = HTMLUtils.escapeHtml(f.label);
                const isSelect = f.type === 'select' && Array.isArray(f.options);
                const showOnAttr = f.showOn ? `data-show-on="${HTMLUtils.escapeHtmlAttr(f.showOn.key + ':' + f.showOn.value)}"` : '';
                let inputHtml = '';
                if (isSelect) {
                    const opts = f.options.map(o =>
                        '<option value="' + HTMLUtils.escapeHtmlAttr(o.value) + '">' + HTMLUtils.escapeHtml(o.label) + '</option>'
                    ).join('');
                    inputHtml = '<select data-key="' + fieldKey + '" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--border-medium,#d1d5db);border-radius:var(--radius-md,8px);font-size:13px;background:var(--input-bg,#fff);color:var(--text-primary,#333);outline:none;transition:border-color 0.2s;">' + opts + '</select>';
                } else {
                    inputHtml = '<input type="text" data-key="' + fieldKey + '" placeholder="' + HTMLUtils.escapeHtmlAttr(f.placeholder || '') + '" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--border-medium,#d1d5db);border-radius:var(--radius-md,8px);font-size:13px;background:var(--input-bg,#fff);color:var(--text-primary,#333);outline:none;transition:border-color 0.2s;" autocomplete="off" spellcheck="false">';
                }
                return '<div style="margin-bottom:14px;" data-field="' + fieldKey + '" ' + showOnAttr + '>' +
                    '<label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary,#666);margin-bottom:6px;letter-spacing:0.3px;">' + fieldLabel + '</label>' +
                    inputHtml +
                '</div>';
            }).join('');

            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';
            dialog.innerHTML =
                '<div class="confirm-header"><h3 class="confirm-title">' + HTMLUtils.escapeHtml(title) + '</h3></div>' +
                '<div class="confirm-body" style="padding-top:4px;">' + fieldsHtml + '</div>' +
                '<div class="confirm-footer">' +
                    '<button class="btn btn-secondary confirm-cancel-btn">' + HTMLUtils.escapeHtml(cancelText) + '</button>' +
                    '<button class="btn btn-primary confirm-confirm-btn">' + HTMLUtils.escapeHtml(confirmText) + '</button>' +
                '</div>';

            overlay.appendChild(dialog);
            modalMount().appendChild(overlay);

            requestAnimationFrame(() => overlay.classList.add('confirm-visible'));

            // 动态显示/隐藏字段
            const updateFieldVisibility = () => {
                fields.forEach(f => {
                    if (!f.showOn) return;
                    const triggerEl = dialog.querySelector('[data-key="' + f.showOn.key + '"]');
                    const targetWrap = dialog.querySelector('[data-field="' + f.key + '"]');
                    if (!triggerEl || !targetWrap) return;
                    const visible = triggerEl.value === f.showOn.value;
                    targetWrap.style.display = visible ? '' : 'none';
                });
            };
            fields.forEach(f => {
                if (!f.showOn) return;
                const triggerEl = dialog.querySelector('[data-key="' + f.showOn.key + '"]');
                if (triggerEl) triggerEl.addEventListener('change', updateFieldVisibility);
            });
            setTimeout(updateFieldVisibility, 0);

            // 输入框样式
            dialog.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('focus', () => { el.style.borderColor = 'var(--bamboo-primary)'; el.style.boxShadow = '0 0 0 2px rgba(var(--primary-rgb),0.12)'; });
                el.addEventListener('blur', () => { el.style.borderColor = 'var(--border-medium,#d1d5db)'; el.style.boxShadow = 'none'; });
            });

            const close = (result) => {
                overlay.classList.remove('confirm-visible');
                overlay.classList.add('confirm-hiding');
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };

            const getValues = () => {
                const values = {};
                dialog.querySelectorAll('[data-key]').forEach(el => {
                    const key = el.dataset.key;
                    if (!key) return;
                    values[key] = el.value;
                });
                return values;
            };

            dialog.querySelector('.confirm-confirm-btn').addEventListener('click', () => close(getValues()));
            dialog.querySelector('.confirm-cancel-btn').addEventListener('click', () => close(null));
            overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') close(null);
                if (e.key === 'Enter' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') close(getValues());
            });

            // 自动聚焦
            const firstInput = dialog.querySelector('input, select');
            if (firstInput) setTimeout(() => firstInput.focus(), 50);
        });
    }
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WhiteNoiseManager.init());
} else {
    WhiteNoiseManager.init();
}

window.WhiteNoiseManager = WhiteNoiseManager;
