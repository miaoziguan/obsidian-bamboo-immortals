export const StatsModal = {
    open() {
        const content = this.renderStatsHTML();

        PanelManager.open('stats', LucideUtils.createIcon('target', { size: 16 }) + '战略复盘', content);
    },

    openAchievements() {
        const content = this._renderCultivationHTML();
        PanelManager.open('achievements', LucideUtils.createIcon('mountain', { size: 16 }) + '竹林修仙', content);
    },

    renderStatsHTML() {
        const stats = this._getGoalStats();
        return `
            <div class="stats-overview-container">
                <div class="stats-section">
                    <div class="stats-section-title">
                        核心指标
                    </div>
                    <div class="core-metrics-grid">
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.totalGoals}</div>
                            <div class="stat-label">总目标</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.completedGoals}</div>
                            <div class="stat-label">已完成</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.inProgressGoals}</div>
                            <div class="stat-label">进行中</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.avgProgress}%</div>
                            <div class="stat-label">平均进度</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.totalSubItems}</div>
                            <div class="stat-label">子项总数</div>
                        </div>
                        <div class="core-metric-card">
                            <div class="stat-value">${stats.subItemCompletionRate}%</div>
                            <div class="stat-label">子项完成率</div>
                        </div>
                    </div>
                </div>

                ${stats.totalGoals > 0 ? `
                <div class="stats-section">
                    <div class="stats-section-title">
                        时间预警
                    </div>
                    <div class="time-alerts-cards">
                        ${stats.urgentGoals.length > 0 ? `
                        <div class="alert-card urgent-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon urgent-icon">
                                    ${LucideUtils.createIcon('flame', { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.urgentGoals.length}</div>
                            </div>
                            <div class="alert-card-title">紧急到期</div>
                            <div class="alert-card-desc">3天内需要关注</div>
                            <div class="alert-card-projects">
                                ${stats.urgentGoals.slice(0, 3).map(g => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + '...' : g.title}</div>`).join('')}
                                ${stats.urgentGoals.length > 3 ? `<div class="alert-card-project">...还有${stats.urgentGoals.length - 3}个</div>` : ''}
                            </div>
                        </div>
                        ` : ''}
                        ${stats.overdueGoals.length > 0 ? `
                        <div class="alert-card overdue-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon overdue-icon">
                                    ${LucideUtils.createIcon('alert-triangle', { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.overdueGoals.length}</div>
                            </div>
                            <div class="alert-card-title">已逾期</div>
                            <div class="alert-card-desc">需要立即处理</div>
                            <div class="alert-card-projects">
                                ${stats.overdueGoals.slice(0, 3).map(g => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + '...' : g.title}</div>`).join('')}
                                ${stats.overdueGoals.length > 3 ? `<div class="alert-card-project">...还有${stats.overdueGoals.length - 3}个</div>` : ''}
                            </div>
                        </div>
                        ` : ''}
                        ${stats.upcomingGoals.length > 0 ? `
                        <div class="alert-card warning-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon warning-icon">
                                    ${LucideUtils.createIcon('clock', { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.upcomingGoals.length}</div>
                            </div>
                            <div class="alert-card-title">即将到期</div>
                            <div class="alert-card-desc">7天内需要准备</div>
                            <div class="alert-card-projects">
                                ${stats.upcomingGoals.slice(0, 3).map(g => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + '...' : g.title}</div>`).join('')}
                                ${stats.upcomingGoals.length > 3 ? `<div class="alert-card-project">...还有${stats.upcomingGoals.length - 3}个</div>` : ''}
                            </div>
                        </div>
                        ` : ''}
                        ${stats.stagnantGoals.length > 0 ? `
                        <div class="alert-card stagnant-card">
                            <div class="alert-card-top">
                                <div class="alert-card-icon stagnant-icon">
                                    ${LucideUtils.createIcon('pause', { size: 24, strokeWidth: 1.8 })}
                                </div>
                                <div class="alert-card-count">${stats.stagnantGoals.length}</div>
                            </div>
                            <div class="alert-card-title">停滞预警</div>
                            <div class="alert-card-desc">超过14天无进展</div>
                            <div class="alert-card-projects">
                                ${stats.stagnantGoals.slice(0, 3).map(g => `<div class="alert-card-project">${g.title.length > 12 ? g.title.substring(0, 12) + '...' : g.title}</div>`).join('')}
                                ${stats.stagnantGoals.length > 3 ? `<div class="alert-card-project">...还有${stats.stagnantGoals.length - 3}个</div>` : ''}
                            </div>
                        </div>
                        ` : ''}
                        ${stats.urgentGoals.length === 0 && stats.upcomingGoals.length === 0 && stats.overdueGoals.length === 0 && stats.stagnantGoals.length === 0 ? `
                        <div class="all-good-card">
                            <div class="all-good-icon">
                                ${LucideUtils.createIcon('sparkles', { size: 36, strokeWidth: 1.8 })}
                            </div>
                            <div class="all-good-title">一切顺利</div>
                            <div class="all-good-desc">所有目标进度良好</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="stats-section">
                    <div class="stats-section-title">
                        进度梯队分布
                    </div>
                    <div class="progress-tiers-grid">
                        <div class="tier-card high">
                            <div class="tier-header">
                                <span class="tier-label">100% 完成</span>
                                <span class="tier-count">${stats.progressTiers.tier100}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? (stats.progressTiers.tier100 / stats.totalGoals * 100) : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card high">
                            <div class="tier-header">
                                <span class="tier-label">76-99%</span>
                                <span class="tier-count">${stats.progressTiers.tier76_99}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? (stats.progressTiers.tier76_99 / stats.totalGoals * 100) : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card medium">
                            <div class="tier-header">
                                <span class="tier-label">51-75%</span>
                                <span class="tier-count">${stats.progressTiers.tier51_75}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? (stats.progressTiers.tier51_75 / stats.totalGoals * 100) : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card medium">
                            <div class="tier-header">
                                <span class="tier-label">26-50%</span>
                                <span class="tier-count">${stats.progressTiers.tier26_50}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? (stats.progressTiers.tier26_50 / stats.totalGoals * 100) : 0}%;"></div>
                            </div>
                        </div>
                        <div class="tier-card low">
                            <div class="tier-header">
                                <span class="tier-label">0-25%</span>
                                <span class="tier-count">${stats.progressTiers.tier0_25}</span>
                            </div>
                            <div class="tier-bar">
                                <div class="tier-bar-fill" style="width:${stats.totalGoals > 0 ? (stats.progressTiers.tier0_25 / stats.totalGoals * 100) : 0}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                ${stats.catStats.length > 0 ? `
                <div class="stats-section">
                    <div class="stats-section-title">
                        分类进度
                    </div>
                    <div class="category-progress">
                        ${stats.catStats.map(s => `
                        <div class="category-item">
                            <span class="category-name">${s.category.name}</span>
                            <div class="category-bar-wrapper">
                                <div class="category-bar" style="width:${s.avgProgress}%;background:${s.category.color};"></div>
                            </div>
                            <span class="category-value">${s.avgProgress}%</span>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="stats-section">
                    <div class="stats-section-title">
                        时间跨度分布
                    </div>
                    <div class="time-span-horizontal">
                        <div class="time-span-card short" 
                            data-time-span="short" 
                            tabindex="0" 
                            role="button"
                            aria-label="筛选短期目标（小于30天），当前有${stats.timeSpanStats.shortTerm}个"
                            onclick="StatsModal._filterByTimeSpan('short')"
                            onkeydown="if(event.key === 'Enter' || event.key === ' ') { StatsModal._filterByTimeSpan('short'); event.preventDefault(); }">
                            <div class="time-span-info">
                                <div class="time-span-label">短期目标</div>
                                <div class="time-span-desc">&lt;30天</div>
                            </div>
                            <div class="time-span-value">${stats.timeSpanStats.shortTerm}</div>
                            <div class="time-span-percent">${stats.totalGoals > 0 ? Math.round(stats.timeSpanStats.shortTerm / stats.totalGoals * 100) : 0}%</div>
                        </div>
                        <div class="time-span-card medium" 
                            data-time-span="medium" 
                            tabindex="0" 
                            role="button"
                            aria-label="筛选中期目标（30-90天），当前有${stats.timeSpanStats.mediumTerm}个"
                            onclick="StatsModal._filterByTimeSpan('medium')"
                            onkeydown="if(event.key === 'Enter' || event.key === ' ') { StatsModal._filterByTimeSpan('medium'); event.preventDefault(); }">
                            <div class="time-span-info">
                                <div class="time-span-label">中期目标</div>
                                <div class="time-span-desc">30-90天</div>
                            </div>
                            <div class="time-span-value">${stats.timeSpanStats.mediumTerm}</div>
                            <div class="time-span-percent">${stats.totalGoals > 0 ? Math.round(stats.timeSpanStats.mediumTerm / stats.totalGoals * 100) : 0}%</div>
                        </div>
                        <div class="time-span-card long" 
                            data-time-span="long" 
                            tabindex="0" 
                            role="button"
                            aria-label="筛选长期目标（大于90天），当前有${stats.timeSpanStats.longTerm}个"
                            onclick="StatsModal._filterByTimeSpan('long')"
                            onkeydown="if(event.key === 'Enter' || event.key === ' ') { StatsModal._filterByTimeSpan('long'); event.preventDefault(); }">
                            <div class="time-span-info">
                                <div class="time-span-label">长期目标</div>
                                <div class="time-span-desc">&gt;90天</div>
                            </div>
                            <div class="time-span-value">${stats.timeSpanStats.longTerm}</div>
                            <div class="time-span-percent">${stats.totalGoals > 0 ? Math.round(stats.timeSpanStats.longTerm / stats.totalGoals * 100) : 0}%</div>
                        </div>
                    </div>
                </div>

                <div class="stats-two-col-grid">
                    <div class="stats-section">
                        <div class="stats-section-title">
                            活跃指标
                        </div>
                        <div class="activity-metrics">
                            <div class="activity-item">
                                <span class="activity-label">活跃目标</span>
                                <span class="activity-value">${stats.activeGoals}</span>
                            </div>
                            <div class="activity-item">
                                <span class="activity-label">高优先级完成率</span>
                                <span class="activity-value">${stats.highPriorityRate}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="stats-section">
                        <div class="stats-section-title">
                            目标对比分析
                        </div>
                        <div class="comparison-stats">
                            <div class="comparison-item">
                                <div class="comparison-row">
                                    <span class="comparison-label">已完成</span>
                                    <span class="comparison-value">${stats.completedGoals}</span>
                                </div>
                                <div class="comparison-bar">
                                    <div class="comparison-bar-fill completed" style="width:${stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals * 100) : 0}%;"></div>
                                </div>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-row">
                                    <span class="comparison-label">进行中</span>
                                    <span class="comparison-value">${stats.inProgressGoals}</span>
                                </div>
                                <div class="comparison-bar">
                                    <div class="comparison-bar-fill in-progress" style="width:${stats.totalGoals > 0 ? (stats.inProgressGoals / stats.totalGoals * 100) : 0}%;"></div>
                                </div>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-row">
                                    <span class="comparison-label">未开始</span>
                                    <span class="comparison-value">${stats.notStartedGoals}</span>
                                </div>
                                <div class="comparison-bar">
                                    <div class="comparison-bar-fill not-started" style="width:${stats.totalGoals > 0 ? (stats.notStartedGoals / stats.totalGoals * 100) : 0}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="stats-section" style="text-align:center;padding:40px;">
                    <div style="font-size:32px;margin-bottom:12px;">${LucideUtils.createIcon('target', { size: 32, strokeWidth: 1.8 })}</div>
                    <div style="font-size:14px;color:var(--text-secondary);">暂无目标数据</div>
                    <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px;">开始创建你的第一个目标吧</div>
                </div>
                `}

                <div style="margin-top:8px; display:flex; gap:8px;">
                    <button class="btn btn-secondary btn-block" data-action="stats-export-report-md" style="font-size:11px;">
                        ${LucideUtils.createIcon('download', { size: 12, strokeWidth: 1.8 })} 导出统计报告
                    </button>
                </div>
            </div>
        `;
    },

    _getGoalStats() {
        return GoalStatsCalculator.calculate(store.getGlobalGoals());
    },

    _filterByTimeSpan(timeSpan) {
        const cards = document.querySelectorAll('.time-span-card');
        cards.forEach(card => card.classList.remove('active'));
        
        const targetCard = document.querySelector(`.time-span-card[data-time-span="${timeSpan}"]`);
        if (targetCard) targetCard.classList.add('active');
        
        const goalItems = document.querySelectorAll('.health-goal-item');
        goalItems.forEach(item => {
            const goalTitle = item.querySelector('.health-goal-title')?.textContent;
            const goals = store.getGlobalGoals();
            const targetGoal = goals.find(g => g.title === goalTitle);
            
            if (targetGoal && targetGoal.startDate && targetGoal.endDate) {
                const start = new Date(targetGoal.startDate);
                const end = new Date(targetGoal.endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                
                let match = false;
                if (timeSpan === 'short' && days < 30) match = true;
                else if (timeSpan === 'medium' && days >= 30 && days <= 90) match = true;
                else if (timeSpan === 'long' && days > 90) match = true;
                
                item.style.display = match ? 'block' : 'none';
            } else {
                item.style.display = 'none';
            }
        });
        
        const diagTab = document.querySelector('.fab-panel-tab[data-tab="diagnosis"]');
        if (diagTab) diagTab.click();
    },

    getRealmData(completedGoals) {
        return CultivationData.getRealmData(completedGoals);
    },

    _checkBreakthrough(oldCompleted, newCompleted) {
        return CultivationData.checkBreakthrough(oldCompleted, newCompleted);
    },

    _renderCultivationHTML() {
        const goals = store.getGlobalGoals();
        const completedGoals = goals.filter(g => (g.progress || 0) >= 100).length;
        const totalGoals = goals.length;
        const { current, next, allLayers } = this.getRealmData(completedGoals);

        const toNextLayer = next ? Math.max(0, next.goal - completedGoals) : 0;

        const nextRealmFirstLayer = allLayers.find(l => l.realm !== current.realm && allLayers.indexOf(l) > allLayers.indexOf(current));
        const toNextRealm = nextRealmFirstLayer ? Math.max(0, nextRealmFirstLayer.goal - completedGoals) : 0;

        const realmList = [...new Set(allLayers.map(l => l.realm))];
        const currentRealmIdx = realmList.indexOf(current.realm);
        const progressPercent = next ? Math.min(100, Math.round((completedGoals - current.goal) / (next.goal - current.goal) * 100)) : 100;

        return `
            <div class="cultivation-container">
                <div class="cultivation-header">
                    <div class="cultivation-realm-badge">
                        <span class="cultivation-realm-name">${current.realm}境 · 第${current.layer}层</span>
                    </div>
                    <h2 class="cultivation-title">${current.title}</h2>
                    <span class="cultivation-layer-tag">${current.layer}/100</span>
                    ${next ? `
                    <div class="cultivation-progress-section">
                        <div class="cultivation-progress-info">
                            <span class="cultivation-progress-label">修为基础：${completedGoals} 个目标</span>
                            <span class="cultivation-progress-next">下一层：${next.title} · 还需 ${toNextLayer} 个</span>
                        </div>
                        <div class="cultivation-progress-bar-wrap">
                            <div class="cultivation-progress-bar" style="width:${progressPercent}%"></div>
                        </div>
                        <div class="cultivation-progress-range">
                            <span>${current.goal}</span><span>${next.goal}</span>
                        </div>
                    </div>
                    ` : `<div class="cultivation-max-badge">已达巅峰 / ${completedGoals} 个目标成就修仙传奇</div>`}
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">修行总览</div>
                    <div class="cultivation-summary-grid">
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${completedGoals}</span>
                            <span class="cultivation-summary-label">累计完成</span>
                        </div>
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${current.layer}/100</span>
                            <span class="cultivation-summary-label">当前层数</span>
                        </div>
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${totalGoals}</span>
                            <span class="cultivation-summary-label">总创建目标</span>
                        </div>
                        ${toNextRealm > 0 ? `
                        <div class="cultivation-summary-item">
                            <span class="cultivation-summary-value">${toNextRealm}</span>
                            <span class="cultivation-summary-label">距下一重天</span>
                        </div>` : ''}
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">修仙之路 · 已点亮 ${current.layer} 层</div>
                    <div class="cultivation-roadmap">
                        ${realmList.map(realm => {
                            const realmLayers = allLayers.filter(l => l.realm === realm);
                            const realmIdx = realmList.indexOf(realm);
                            const isCurrent = realmIdx === currentRealmIdx;
                            const isPast = realmIdx < currentRealmIdx;
                            return `
                            <div class="cultivation-realm-row ${isCurrent ? 'is-current' : ''} ${isPast ? 'is-past' : ''}">
                                <div class="cultivation-realm-label">
                                    <span>${realm}</span>
                                </div>
                                <div class="cultivation-realm-layers">
                                    ${realmLayers.map(l => {
                                        const unlocked = completedGoals >= l.goal;
                                        const active = l.layer === current.layer;
                                        return `<span class="cultivation-layer-dot ${unlocked ? 'unlocked' : ''} ${active ? 'active' : ''}" title="${l.title} · ${l.goal}个"></span>`;
                                    }).join('')}
                                </div>
                                <span class="cultivation-realm-goal">${realmLayers[0].goal}</span>
                            </div>`;
                        }).join('')}
                    </div>
                    <div class="cultivation-legend">
                        <span><span class="legend-dot unlocked"></span> 已突破</span>
                        <span><span class="legend-dot active"></span> 当前</span>
                        <span><span class="legend-dot locked"></span> 未到达</span>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">十重天境界体系</div>
                    <div class="cultivation-realm-table">
                        ${realmList.map((realm, idx) => {
                            const realmLayers = allLayers.filter(l => l.realm === realm);
                            const isCurrent = idx === currentRealmIdx;
                            const isPast = idx < currentRealmIdx;
                            return `
                            <div class="cultivation-realm-table-row ${isCurrent ? 'is-current' : ''} ${isPast ? 'is-past' : ''}">
                                <span>${realm}</span>
                                <span>${realmLayers[0].layer}-${realmLayers[realmLayers.length-1].layer}层</span>
                                <span>${realmLayers[0].goal}-${realmLayers[realmLayers.length-1].goal}</span>
                                <span class="realm-table-status">${isPast ? '已通' : isCurrent ? '当前' : '未达'}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    exportReportMD() {
        const stats = this._getGoalStats();
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const lines = [];
        const add = (...args) => lines.push(args.join(''));

        // ========== 标题 ==========
        add('# 📊 目标统计报告');
        add('');
        add(`> 生成时间：${dateStr} ${timeStr}`);
        add('');

        // ========== 核心指标 ==========
        add('## 🎯 核心指标');
        add('');
        add('| 指标 | 数值 |');
        add('|------|------|');
        add(`| 总目标 | ${stats.totalGoals} |`);
        add(`| ✅ 已完成 | ${stats.completedGoals} |`);
        add(`| 🔄 进行中 | ${stats.inProgressGoals} |`);
        add(`| 📈 平均进度 | ${stats.avgProgress}% |`);
        add(`| 📋 子项总数 | ${stats.totalSubItems} |`);
        add(`| 📋 子项完成率 | ${stats.subItemCompletionRate}% |`);
        add('');

        if (stats.totalGoals === 0) {
            add('> 暂无目标数据，开始创建你的第一个目标吧！');
            this._downloadMD(lines.join('\n'), dateStr);
            return;
        }

        // ========== 时间预警 ==========
        const hasAlerts = stats.urgentGoals.length > 0 || stats.overdueGoals.length > 0
            || stats.upcomingGoals.length > 0 || stats.stagnantGoals.length > 0;

        add('## ⚠️ 时间预警');
        add('');
        if (hasAlerts) {
            add('| 类型 | 数量 | 说明 |');
            add('|------|------|------|');
            if (stats.urgentGoals.length > 0)
                add(`| 🔥 紧急到期 | ${stats.urgentGoals.length} | 3天内需要关注 |`);
            if (stats.overdueGoals.length > 0)
                add(`| 🚨 已逾期 | ${stats.overdueGoals.length} | 需要立即处理 |`);
            if (stats.upcomingGoals.length > 0)
                add(`| ⏰ 即将到期 | ${stats.upcomingGoals.length} | 7天内需要准备 |`);
            if (stats.stagnantGoals.length > 0)
                add(`| ⏸️ 停滞预警 | ${stats.stagnantGoals.length} | 超过14天无进展 |`);
            add('');
        } else {
            add('> ✨ 一切顺利，所有目标进度良好！');
            add('');
        }

        // ========== 进度梯队分布 ==========
        add('## 📊 进度梯队分布');
        add('');
        add('| 进度区间 | 数量 | 占比 |');
        add('|----------|------|------|');
        const tiers = [
            ['100% 完成', stats.progressTiers.tier100],
            ['76-99%', stats.progressTiers.tier76_99],
            ['51-75%', stats.progressTiers.tier51_75],
            ['26-50%', stats.progressTiers.tier26_50],
            ['0-25%', stats.progressTiers.tier0_25]
        ];
        tiers.forEach(([label, count]) => {
            const pct = stats.totalGoals > 0 ? Math.round(count / stats.totalGoals * 100) : 0;
            add(`| ${label} | ${count} | ${pct}% |`);
        });
        add('');

        // ========== 分类进度 ==========
        if (stats.catStats.length > 0) {
            add('## 📁 分类进度');
            add('');
            add('| 分类 | 目标数 | 平均进度 |');
            add('|------|--------|----------|');
            stats.catStats.forEach(s => {
                add(`| ${s.category.name} | ${s.goalCount} | ${s.avgProgress}% |`);
            });
            add('');
        }

        // ========== 时间跨度分布 ==========
        add('## 📅 时间跨度分布');
        add('');
        add('| 类型 | 数量 | 占比 |');
        add('|------|------|------|');
        const spans = [
            ['短期目标（<30天）', stats.timeSpanStats.shortTerm],
            ['中期目标（30-90天）', stats.timeSpanStats.mediumTerm],
            ['长期目标（>90天）', stats.timeSpanStats.longTerm]
        ];
        spans.forEach(([label, count]) => {
            const pct = stats.totalGoals > 0 ? Math.round(count / stats.totalGoals * 100) : 0;
            add(`| ${label} | ${count} | ${pct}% |`);
        });
        add('');

        // ========== 活跃指标 & 目标对比 ==========
        add('## 📈 活跃指标');
        add('');
        add(`- **活跃目标**：${stats.activeGoals} 个`);
        add(`- **高优先级完成率**：${stats.highPriorityRate}%`);
        add('');

        add('## 📊 目标对比分析');
        add('');
        add('| 状态 | 数量 | 占比 |');
        add('|------|------|------|');
        const comparison = [
            ['✅ 已完成', stats.completedGoals],
            ['🔄 进行中', stats.inProgressGoals],
            ['⏳ 未开始', stats.notStartedGoals]
        ];
        comparison.forEach(([label, count]) => {
            const pct = stats.totalGoals > 0 ? Math.round(count / stats.totalGoals * 100) : 0;
            add(`| ${label} | ${count} | ${pct}% |`);
        });
        add('');

        // ========== 页脚 ==========
        add('---');
        add('');
        add('*本报告由「Bamboo Immortals」自动生成*');

        this._downloadMD(lines.join('\n'), dateStr);
        Toast.showToast('统计报告已导出', 'success');
    },

    _downloadMD(content, dateStr) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `目标统计报告_${dateStr}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

ActionDispatcher.registerMany({
    'stats-export-report-md': () => StatsModal.exportReportMD(),
    'stats-modal-open-achievements': () => StatsModal.openAchievements()
});

window.StatsModal = StatsModal;
