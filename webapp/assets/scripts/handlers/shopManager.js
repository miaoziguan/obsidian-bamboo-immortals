/**
 * ShopManager - 竹林商店功能管理
 * 样式完全使用外部 CSS，详见 modal.css 中 "竹林商店 · 响应式样式体系" 部分
 */
export const ShopManager = {
    // 预设商品列表 - 分2类
    ITEMS: {
        food: [
            { id: 'milktea', name: '牛马咖啡', price: 30, icon: '☕', desc: '打工人续命必备' },
            { id: 'snack', name: '美味零食', price: 50, icon: '🍿', desc: '补充能量的小零嘴' },
            { id: 'coffee', name: '饮料果茶', price: 40, icon: '🥤', desc: '清爽解渴的午后之选' },
            { id: 'takeout', name: '点外卖', price: 60, icon: '🍱', desc: '犒劳自己一顿好的' },
            { id: 'bread', name: '面包', price: 30, icon: '🍞', desc: '简单又饱腹的选择' },
            { id: 'cola', name: '可乐', price: 20, icon: '🥤', desc: '快乐肥宅水' },
            { id: 'selftea', name: '自泡茶1杯', price: 1, icon: '🍵', desc: '悠闲品茗好时光' },
            { id: 'selfcoffee', name: '自泡牛奶1杯', price: 1, icon: '🥛', desc: '温暖又营养的一杯' },
            { id: 'brewcoffee', name: '自冲咖啡', price: 2, icon: '☕', desc: '手冲咖啡的仪式感' }
        ],
        entertainment: [
            { id: 'game', name: '游戏1小时', price: 15, icon: '🎮', desc: '尽情享受1小时游戏' },
            { id: 'movie', name: '看1部电影', price: 15, icon: '🎬', desc: '奖励自己一部好电影' },
            { id: 'study', name: '学习1小时', price: 1, icon: '📚', desc: '专注学习提升自己' },
            { id: 'bilibili', name: '刷B站1小时', price: 15, icon: '📺', desc: '快乐刷视频放松一下' },
            { id: 'drawing', name: '绘画1小时', price: 1, icon: '🎨', desc: '享受创作的乐趣' },
            { id: 'fitness', name: '健身30分钟', price: 1, icon: '💪', desc: '运动出汗释放压力' },
            { id: 'running', name: '跑步30分钟', price: 1, icon: '🏃', desc: '户外跑步呼吸新鲜空气' },
            { id: 'tidyroom', name: '整理房间30分钟', price: 1, icon: '🧹', desc: '收拾整洁心情也变好' },
            { id: 'meditation', name: '冥想30分钟', price: 1, icon: '🧘', desc: '静心冥想放空思绪' }
        ]
    },

    _itemIndex: null,
    _currentHistoryMonth: null,
    _sortBy: {
        food: 'default',
        entertainment: 'default'
    },
    _sortOutsideClickHandler: null,

    _ensureIndex() {
        if (this._itemIndex) return;
        const idx = {};
        for (const category of Object.values(this.ITEMS)) {
            for (const item of category) {
                idx[item.id] = item;
            }
        }
        this._itemIndex = idx;
    },

    _sortItems(items, sortBy, category) {
        const indexed = items.map((item, idx) => ({ ...item, _originalIdx: idx }));
        if (sortBy === 'price-desc') {
            indexed.sort((a, b) => b.price - a.price || a._originalIdx - b._originalIdx);
        } else {
            // 'default' 和 'price-asc' 均按价格升序
            indexed.sort((a, b) => a.price - b.price || a._originalIdx - b._originalIdx);
        }
        return indexed;
    },

    _getSortLabel(sortBy) {
        const labels = {
            'default': '默认',
            'price-asc': '价格↑',
            'price-desc': '价格↓'
        };
        return labels[sortBy] || '默认';
    },

    _renderSortButton(category) {
        const currentSort = this._sortBy[category] || 'default';
        const options = [
            { value: 'default', label: '默认' },
            { value: 'price-asc', label: '价格↑' },
            { value: 'price-desc', label: '价格↓' }
        ];
        const currentLabel = options.find(o => o.value === currentSort).label;
        return `
            <div class="shop-sort-dropdown">
                <button class="shop-sort-btn" data-sort-category="${category}">
                    <span class="shop-sort-label">${currentLabel}</span>
                    <span class="shop-sort-caret">▾</span>
                </button>
                <div class="shop-sort-menu" data-sort-menu="${category}">
                    ${options.map(o => `
                        <button class="shop-sort-option ${o.value === currentSort ? 'is-active' : ''}"
                                data-sort-option="${o.value}" data-sort-category="${category}">${o.label}</button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _saveSortPreference() {
        try {
            storageManager.putSetting('shopSortBy', this._sortBy);
        } catch (e) { /* ignore */ }
    },

    _loadSortPreference() {
        try {
            const saved = storageManager.getSetting('shopSortBy');
            if (saved) {
                this._sortBy = { food: saved.food || 'default', entertainment: saved.entertainment || 'default' };
            }
        } catch (e) { /* ignore */ }
    },

    _updateItemsList(panel) {
        const availableBalance = store.getAvailableBalance();
        const purchaseCounts = store.getPurchaseCounts();

        // 更新"吃喝享受"列表
        const foodList = panel.querySelector('#shop-items-food');
        if (foodList) {
            const sortedFood = this._sortItems(this.ITEMS.food, this._sortBy.food, 'food');
            foodList.innerHTML = sortedFood.map(item => this._renderItemCard(item, availableBalance, purchaseCounts)).join('');
        }

        // 更新"休闲娱乐"列表
        const entertainmentList = panel.querySelector('#shop-items-entertainment');
        if (entertainmentList) {
            const sortedEntertainment = this._sortItems(this.ITEMS.entertainment, this._sortBy.entertainment, 'entertainment');
            entertainmentList.innerHTML = sortedEntertainment.map(item => this._renderItemCard(item, availableBalance, purchaseCounts)).join('');
        }

        // 就地更新排序按钮状态（不替换 DOM，避免事件委托失效）
        ['food', 'entertainment'].forEach(category => {
            const menu = panel.querySelector(`[data-sort-menu="${category}"]`);
            if (menu) {
                menu.style.display = 'none'; // 关闭菜单
                // 更新选项高亮（使用 CSS 类 .is-active 替代内联样式）
                menu.querySelectorAll('.shop-sort-option').forEach(opt => {
                    opt.classList.toggle('is-active', opt.dataset.sortOption === this._sortBy[category]);
                });
            }
            // 更新按钮标签
            const btn = panel.querySelector(`.shop-sort-btn[data-sort-category="${category}"]`);
            if (btn) {
                const labelSpan = btn.querySelector('.shop-sort-label');
                if (labelSpan) {
                    labelSpan.textContent = this._getSortLabel(this._sortBy[category]);
                }
            }
        });
    },

    _updateBalanceDisplay(panel) {
        const availableBalance = store.getAvailableBalance();
        const balanceEl = panel.querySelector('#shopBalanceValue');
        if (balanceEl) {
            balanceEl.innerHTML = `<span class="shop-currency">¥</span>${availableBalance.toFixed(2)}`;
        }
    },

    _updateTodaySpentDisplay(panel) {
        // 重新从 store 拉取最新 purchaseHistory 计算今日消费
        const today = new Date().toDateString();
        const { purchaseHistory } = store.getState();
        const todayPurchases = (purchaseHistory.records || []).filter(r => new Date(r.date).toDateString() === today);
        const todaySpent = todayPurchases.reduce((sum, r) => sum + r.price, 0);

        // 更新今日消费数值（右侧指标区）
        const spentEl = panel.querySelector('#shop-today-spent-value');
        if (spentEl) {
            if (todaySpent > 0) {
                spentEl.textContent = `-¥${todaySpent.toFixed(2)}`;
            } else {
                spentEl.textContent = '¥0.00';
            }
        }

        // 更新今日消费明细（下方列表）
        const detailsEl = panel.querySelector('#shop-today-spent-details');
        if (detailsEl) {
            if (todayPurchases.length === 0) {
                detailsEl.style.display = 'none';
                detailsEl.innerHTML = '';
            } else {
                detailsEl.style.display = '';
                detailsEl.innerHTML = todayPurchases.map(p => `
                    <div class="shop-breakdown-row">
                        <span class="shop-breakdown-text">${p.icon || ''} ${p.name}</span>
                        <span class="shop-breakdown-amount is-spent">-¥${p.price.toFixed(2)}</span>
                    </div>
                `).join('');
            }
        }
    },

    open() {
        this._loadSortPreference();
        const { balance, purchaseHistory, incomeHistory, stats } = store.getState();

        // 从 incomeHistory.records 重新计算今日收入
        const today = new Date().toDateString();
        const todayIncomes = incomeHistory.records.filter(inc => new Date(inc.date).toDateString() === today);
        const todayEarnings = todayIncomes.reduce((sum, inc) => sum + inc.amount, 0);

        if (stats.todayEarnings !== todayEarnings) {
            stats.todayEarnings = todayEarnings;
            stats.date = today;
            storageManager.putSetting('shopStats', stats);
        }

        const totalSpent = stats.totalSpent || 0;
        const totalEarnings = stats.totalEarnings || 0;
        const availableBalance = store.getAvailableBalance();
        const purchaseCounts = store.getPurchaseCounts();
        const frozenAmount = todayEarnings;

        // 从 purchaseHistory.records 计算今日消费（与今日收入对称）
        const todayPurchases = (purchaseHistory.records || []).filter(r => new Date(r.date).toDateString() === today);
        const todaySpent = todayPurchases.reduce((sum, r) => sum + r.price, 0);

        const content = `
            <div id="tab-content-shop-items" class="fab-tab-content active">
                <!-- 余额展示 -->
                <div class="shop-balance-card">
                    <div class="shop-balance-amount-block shop-balance-amount-block--centered">
                        <div class="shop-balance-label">可用竹币</div>
                        <div id="shopBalanceValue" class="shop-balance-value">
                            <span class="shop-currency">¥</span>${availableBalance.toFixed(2)}
                        </div>
                        ${frozenAmount > 0 ? `<div class="shop-balance-frozen">冻结 ¥${frozenAmount.toFixed(2)}（今日收入次日可用）</div>` : ''}
                    </div>
                    <div class="shop-balance-metrics shop-balance-metrics--row">
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div class="shop-metric-value is-income-today">${todayEarnings > 0 ? '+¥' + todayEarnings.toFixed(2) : '¥0.00'}</div>
                            <div class="shop-metric-label">今日收入</div>
                        </div>
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div id="shop-today-spent-value" class="shop-metric-value is-spent-today">${todaySpent > 0 ? '-¥' + todaySpent.toFixed(2) : '¥0.00'}</div>
                            <div class="shop-metric-label">今日消费</div>
                        </div>
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div class="shop-metric-value is-income-total">+¥${totalEarnings.toFixed(2)}</div>
                            <div class="shop-metric-label">历史总收入</div>
                        </div>
                        <div class="shop-balance-metric shop-balance-metric--card">
                            <div class="shop-metric-value is-spent-total">¥${totalSpent.toFixed(2)}</div>
                            <div class="shop-metric-label">总消费</div>
                        </div>
                    </div>
                    <div class="shop-rules-hint">
                        💡 每完成一个<b>今日</b>子项任务可挣 1 竹币，今日收入次日可用<br>
                        📌 补完成历史日期的任务不奖励竹币
                    </div>
                    ${todayIncomes.length > 0 ? `
                    <div class="shop-breakdown">
                        <div class="shop-breakdown-header">今日收入明细</div>
                        ${todayIncomes.map(inc => `
                            <div class="shop-breakdown-row">
                                <span class="shop-breakdown-text">${inc.desc || inc.type}</span>
                                <span class="shop-breakdown-amount is-income">+¥${inc.amount.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    <div id="shop-today-spent-details" class="shop-breakdown">
                        <div class="shop-breakdown-header">今日消费明细</div>
                        ${todayPurchases.length > 0 ? todayPurchases.map(p => `
                            <div class="shop-breakdown-row">
                                <span class="shop-breakdown-text">${p.icon || ''} ${p.name}</span>
                                <span class="shop-breakdown-amount is-spent">-¥${p.price.toFixed(2)}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>

                <!-- 吃喝享受 -->
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">
                        <span>🍽️ 吃喝享受</span>
                        ${this._renderSortButton('food')}
                    </div>
                    <div class="shop-items-list" id="shop-items-food">
                        ${this._sortItems(this.ITEMS.food, this._sortBy.food, 'food').map(item => this._renderItemCard(item, availableBalance, purchaseCounts)).join('')}
                    </div>
                </div>

                <!-- 休闲娱乐 -->
                <div class="fab-panel-section">
                    <div class="fab-panel-section-title">
                        <span>🎮 休闲娱乐</span>
                        ${this._renderSortButton('entertainment')}
                    </div>
                    <div class="shop-items-list" id="shop-items-entertainment">
                        ${this._sortItems(this.ITEMS.entertainment, this._sortBy.entertainment, 'entertainment').map(item => this._renderItemCard(item, availableBalance, purchaseCounts)).join('')}
                    </div>
                </div>
            </div>

            <div id="tab-content-shop-history" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div id="history-content-container"></div>
                </div>
            </div>

            <div id="tab-content-shop-philosophy" class="fab-tab-content">
                <div class="shop-philosophy-hero">
                    <div class="shop-philosophy-icon">🎋</div>
                    <div class="shop-philosophy-title">反消费主义商店</div>
                    <div class="shop-philosophy-subtitle">越容易得到的，越贵<br>越需要付出行动的，越便宜</div>
                </div>

                <div class="fab-panel-section">
                    <div class="fab-panel-section-title"><span>💡 设计原则</span></div>
                    <div class="shop-principle-cards">
                        <div class="shop-principle-card is-warn">
                            <div class="shop-principle-icon">🛋️</div>
                            <div class="shop-principle-content">
                                <div class="shop-principle-heading">被动消耗 → 高价</div>
                                <div class="shop-principle-text">花钱消费、躺着不动就能做的事，代价最高。点外卖 60 竹币，刷B站 15 竹币——舒适圈是最贵的圈。</div>
                            </div>
                        </div>
                        <div class="shop-principle-card">
                            <div class="shop-principle-icon">🏃</div>
                            <div class="shop-principle-content">
                                <div class="shop-principle-heading">主动行动 → 低价</div>
                                <div class="shop-principle-text">自己动手做饭、出门跑步、整理房间、冥想……需要付出行动的事，只需 1-2 竹币。行动本身就是奖励。</div>
                            </div>
                        </div>
                        <div class="shop-principle-card">
                            <div class="shop-principle-icon">🧠</div>
                            <div class="shop-principle-content">
                                <div class="shop-principle-heading">核心逻辑</div>
                                <div class="shop-principle-text">竹币是行动力的度量，不是消费力的度量。商店的目的不是让你"买得起"，而是让你"动起来"。</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="fab-panel-section-title"><span>⚖️ 定价对比</span></div>
                    <div class="shop-price-rows">
                        <div class="shop-price-row is-warn">
                            <span class="shop-price-row-text">🍱 点外卖（花钱 + 不动）</span>
                            <span class="shop-price-row-value is-warn">60 竹币</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">🎮 游戏1小时（不动）</span>
                            <span class="shop-price-row-value">15 竹币</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">📺 刷B站1小时（不动）</span>
                            <span class="shop-price-row-value">15 竹币</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">🧹 整理房间30分钟（动手）</span>
                            <span class="shop-price-row-value">1 竹币</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">🏃 跑步30分钟（动手 + 出门）</span>
                            <span class="shop-price-row-value">1 竹币</span>
                        </div>
                        <div class="shop-price-row">
                            <span class="shop-price-row-text">🧘 冥想30分钟（动手 + 内心）</span>
                            <span class="shop-price-row-value">1 竹币</span>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="fab-panel-section-title"><span>🪙 竹币获取规则</span></div>
                    <div class="shop-coin-rules">
                        <div class="shop-coin-rule">
                            <span class="shop-coin-rule-mark">+1</span>
                            <span>每完成一个<b>今日</b>子项任务</span>
                        </div>
                        <div class="shop-coin-rule">
                            <span class="shop-coin-rule-mark is-muted">+0</span>
                            <span>补完成历史日期的任务（不奖励）</span>
                        </div>
                        <div class="shop-coin-rule">
                            <span class="shop-coin-rule-mark is-hint">⏳</span>
                            <span>今日收入次日可用（冻结机制）</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        PanelManager.open('shop', LucideUtils.createIcon('dollarSign', { size: 16 }) + '竹林商店', content, {
            tabs: [
                { id: 'shop-items', label: '商店兑换' },
                { id: 'shop-history', label: '消费历史' },
                { id: 'shop-philosophy', label: '设计哲学' }
            ],
            onOpen: (panel) => {
                this._bindShopEvents(panel);
                this._renderHistoryTab(panel);
            },
            onClose: () => {
                if (this._sortOutsideClickHandler) {
                    document.removeEventListener('mousedown', this._sortOutsideClickHandler);
                    this._sortOutsideClickHandler = null;
                }
            }
        });
    },

    _renderItemCard(item, balance, purchaseCounts) {
        const count = purchaseCounts[item.id] || 0;
        const purchased = count > 0;
        const locked = balance < item.price;
        const statusText = locked ? '余额不足'
            : purchased ? `已兑${count}次`
            : '兑换';
        const statusClass = locked ? 'is-locked'
            : purchased ? 'is-purchased'
            : 'is-available';
        return `
            <div class="shop-item-card ${locked ? 'is-locked' : ''}"
                 data-action="shop-buy" data-item-id="${item.id}" data-item-price="${item.price}" data-item-name="${item.name}" data-item-icon="${item.icon}">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.desc}</div>
                </div>
                <div class="shop-item-price-block">
                    <div class="shop-item-price">¥${item.price}</div>
                    <div class="shop-item-status ${statusClass}">${statusText}</div>
                </div>
            </div>
        `;
    },

    _bindShopEvents(panel) {
        // 清理之前的外部点击监听器
        if (this._sortOutsideClickHandler) {
            document.removeEventListener('mousedown', this._sortOutsideClickHandler);
            this._sortOutsideClickHandler = null;
        }

        // 事件委托：在面板上统一处理点击
        panel.addEventListener('click', async (e) => {
            // 排序按钮
            const sortBtn = e.target.closest('.shop-sort-btn');
            if (sortBtn) {
                e.stopPropagation();
                const category = sortBtn.dataset.sortCategory;
                const menu = panel.querySelector(`[data-sort-menu="${category}"]`);

                // 关闭其他菜单
                panel.querySelectorAll('.shop-sort-menu').forEach(m => {
                    if (m !== menu) m.style.display = 'none';
                });

                // 切换当前菜单
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                return;
            }

            // 排序选项
            const sortOption = e.target.closest('.shop-sort-option');
            if (sortOption) {
                e.stopPropagation();
                const category = sortOption.dataset.sortCategory;
                const sortBy = sortOption.dataset.sortOption;

                this._sortBy[category] = sortBy;
                this._saveSortPreference();
                this._updateItemsList(panel);
                return;
            }

            // 商品卡片购买
            const card = e.target.closest('.shop-item-card:not(.is-locked)');
            if (card) {
                const itemId = card.dataset.itemId;
                const price = parseFloat(card.dataset.itemPrice);
                const itemName = card.dataset.itemName;

                const item = this._findItem(itemId);
                if (!item) return;

                const confirmed = await ConfirmDialog.confirm({
                    title: '确认兑换',
                    message: `确定要花费 ¥${price} 兑换【${itemName}】吗？\n\n购买后余额：¥${(store.getState().balance - price).toFixed(2)}`,
                    confirmText: '确认兑换',
                    cancelText: '再想想'
                });

                if (confirmed) {
                    const availableBalance = store.getAvailableBalance();
                    if (availableBalance >= price) {
                        await store.updateBalance(-price);
                        await store.addPurchaseHistory({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            icon: item.icon,
                            date: new Date().toISOString()
                        });
                        Toast.showToast(`🎉 兑换成功！快去享受你的【${itemName}】吧~`, 'success');
                        this._updateBalanceDisplay(panel);
                        this._updateTodaySpentDisplay(panel);
                        this._updateItemsList(panel);
                    } else {
                        Toast.showToast('可用余额不足，今日收入次日才可使用哦', 'error');
                    }
                }
                return;
            }

            // 点击面板其他区域 - 关闭排序菜单
            panel.querySelectorAll('.shop-sort-menu').forEach(m => {
                m.style.display = 'none';
            });
        });

        // 外部点击关闭排序菜单
        this._sortOutsideClickHandler = (e) => {
            if (!e.target.closest('.shop-sort-dropdown')) {
                panel.querySelectorAll('.shop-sort-menu').forEach(m => {
                    m.style.display = 'none';
                });
            }
        };
        document.addEventListener('mousedown', this._sortOutsideClickHandler);

        // 月份选择器事件
        this._bindHistoryEvents(panel);
    },

    _bindHistoryEvents(panel) {
        const container = panel.querySelector('#history-content-container');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-history-action]');
            if (!btn) return;
            const action = btn.dataset.historyAction;
            const now = new Date();
            const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            if (action === 'prev-month') {
                const base = this._currentHistoryMonth || curMonth;
                const [y, m] = base.split('-').map(Number);
                const d = new Date(y, m - 2, 1);
                this._currentHistoryMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                this._renderHistoryTab(panel);
            } else if (action === 'next-month') {
                const base = this._currentHistoryMonth || curMonth;
                const [y, m] = base.split('-').map(Number);
                const d = new Date(y, m, 1);
                const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (nextMonth <= curMonth) {
                    this._currentHistoryMonth = nextMonth;
                    this._renderHistoryTab(panel);
                }
            } else if (action === 'all') {
                this._currentHistoryMonth = null;
                this._renderHistoryTab(panel);
            } else if (action.startsWith('month:')) {
                this._currentHistoryMonth = action.slice(6);
                this._renderHistoryTab(panel);
            }
        });
    },

    _renderHistoryTab(panel) {
        const container = panel.querySelector('#history-content-container');
        if (!container) return;

        const { purchaseHistory } = store.getState();
        const month = this._currentHistoryMonth;
        const now = new Date();
        const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // 月份标签
        const monthLabel = month
            ? (() => { const [y, mm] = month.split('-'); return `${parseInt(mm)}月 · ${y}`; })()
            : '全部记录';

        // 是否可以向前/后切换
        const canPrev = true; // 总是可以向前（从当月或当前选中月）
        const canNext = month !== null && month < curMonth;
        const icon = (name, size = 14) => typeof LucideUtils !== 'undefined' ? LucideUtils.createIcon(name, { size }) : '';

        // 过滤记录
        let records = purchaseHistory.records || [];
        let isArchived = false;
        let archiveData = null;

        if (month) {
            const filtered = records.filter(r => (r.month || r.date.slice(0, 7)) === month);
            if (filtered.length > 0) {
                records = filtered;
            } else if (purchaseHistory.archive && purchaseHistory.archive[month]) {
                isArchived = true;
                archiveData = purchaseHistory.archive[month];
                records = [];
            } else {
                records = [];
            }
        }

        // 月度汇总条
        let summaryHtml = '';
        if (month && !isArchived) {
            const totalSpent = records.reduce((s, r) => s + r.price, 0);
            summaryHtml = `
                <div class="shop-history-summary">
                    <span class="shop-history-summary-text">共 ${records.length} 笔消费</span>
                    <span class="shop-history-summary-amount">¥${totalSpent}</span>
                </div>`;
        } else if (isArchived && archiveData) {
            summaryHtml = `
                <div class="shop-history-summary">
                    <span class="shop-history-summary-text">归档汇总 · ${archiveData.totalCount} 笔</span>
                    <span class="shop-history-summary-amount">¥${archiveData.totalSpent}</span>
                </div>`;
        } else if (!month) {
            const totalAll = records.reduce((s, r) => s + r.price, 0);
            summaryHtml = `
                <div class="shop-history-summary">
                    <span class="shop-history-summary-text">近期 ${records.length} 笔</span>
                    <span class="shop-history-summary-amount">¥${totalAll}</span>
                </div>`;
        }

        // 记录列表
        let listHtml = '';
        if (isArchived && archiveData && archiveData.items) {
            listHtml = Object.entries(archiveData.items).map(([id, info]) => {
                const item = this._findItem(id);
                return `
                    <div class="shop-history-row">
                        <div class="shop-history-icon">${item ? item.icon : '🛍️'}</div>
                        <div class="shop-history-info">
                            <div class="shop-history-name">${item ? item.name : id}</div>
                            <div class="shop-history-meta">购买 ${info.count} 次</div>
                        </div>
                        <div class="shop-history-price">-¥${info.totalPrice}</div>
                    </div>`;
            }).join('');
        } else if (records.length > 0) {
            listHtml = records.map(record => {
                const d = new Date(record.date);
                const day = d.getDate();
                const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                return `
                    <div class="shop-history-row">
                        <div class="shop-history-icon">${record.icon || '🛍️'}</div>
                        <div class="shop-history-info">
                            <div class="shop-history-name">${record.name}</div>
                            <div class="shop-history-meta">${day}日 ${time}</div>
                        </div>
                        <div class="shop-history-price">-¥${record.price}</div>
                    </div>`;
            }).join('');
        } else {
            listHtml = `
                <div class="shop-history-empty">
                    <div class="shop-history-empty-icon">🍃</div>
                    <div class="shop-history-empty-text">${month ? '该月无消费记录' : '暂无消费记录'}</div>
                    <div class="shop-history-empty-hint">${month ? '' : '完成任务挣竹币，奖励自己吧'}</div>
                </div>`;
        }

        // 归档月份导航
        const archiveKeys = Object.keys(purchaseHistory.archive || {}).sort().reverse();
        let archiveNavHtml = '';
        if (archiveKeys.length > 0) {
            archiveNavHtml = `
                <div class="shop-archive-nav">
                    <div class="shop-archive-nav-header">归档月份</div>
                    <div class="shop-archive-nav-buttons">
                        ${archiveKeys.map(k => {
                            const a = purchaseHistory.archive[k];
                            const [, mm] = k.split('-');
                            const active = month === k;
                            return `<button class="shop-archive-month-btn ${active ? 'is-active' : ''}" data-history-action="month:${k}">${parseInt(mm)}月 · ¥${a.totalSpent}</button>`;
                        }).join('')}
                    </div>
                </div>`;
        }

        // 箭头按钮样式
        const arrowBtnBase = 'shop-history-arrow';

        container.innerHTML = `
            <!-- 月份导航 -->
            <div class="shop-history-nav">
                <button class="${arrowBtnBase}" data-history-action="prev-month" ${!canPrev ? 'disabled' : ''}>${icon('chevronLeft', 16)}</button>
                <span class="shop-history-month-label">${monthLabel}</span>
                <button class="${arrowBtnBase}" data-history-action="next-month" ${!canNext ? 'disabled' : ''}>${icon('chevronRight', 16)}</button>
                ${month ? `<button class="shop-history-all-btn" data-history-action="all">全部</button>` : `<span class="shop-history-current-tag">当前</span>`}
            </div>
            ${summaryHtml}
            <div class="purchase-history-list">
                ${listHtml}
            </div>
            ${archiveNavHtml}
        `;
    },

    _findItem(id) {
        this._ensureIndex();
        return this._itemIndex[id] || null;
    }
};

window.ShopManager = ShopManager;
