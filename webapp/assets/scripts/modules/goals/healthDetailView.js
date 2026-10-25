/**
 * 战略复盘面板（健康分详情）视图构建 — 纯函数、无副作用。
 *
 * 从 renderer.js 的 openHealthScoreDetail 抽出（P2-6 Round 1）。
 * 原方法 313 行里约 290 行是这一整块模板拼装；抽出后渲染器只留「取数 → 调用 → 挂载 → 绑事件」。
 *
 * 约定：
 *   · 保持与原实现**逐字一致**（含 HTML 结构与类名），行为等价性由
 *     tests/goalsHealthDetail.jest.test.js 的特征测试保证；
 *   · HTMLUtils / LucideUtils / num / escapeHtml / StatsModal 仍按全局解析
 *     （与原实现一致，不新增 import，避免改变测试加载器的依赖注入面）。
 *
 * @param {{ goals: Array<object>, resultsById: Map<string, object>, set: object, overview: unknown, dynamicHints: Array<object> }} input
 * @returns {string} 面板内容 HTML（三个 tab 的容器）
 */
export function buildHealthPanelContent({ goals, resultsById, set, overview, dynamicHints }) {
        let goalsDetailHtml = '';
        if (goals.length > 0) {
            goalsDetailHtml = goals.map((goal) => {
                const healthScore = resultsById.get(goal.id);
                if (!healthScore) return '';   // 该目标无健康分结果（异常数据）→ 跳过不渲染
                const hints = [
                    healthScore.L1.onTime.hint,
                    healthScore.L3.stagnation.hint,
                ].filter(Boolean).join('；');
                return `
                    <div class="health-goal-item" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}">
                        <div class="health-goal-title">${escapeHtml(goal.title)}</div>
                        <div class="health-goal-score" style="color: ${HTMLUtils.escapeHtmlAttr(healthScore.color)};">
                            ${healthScore.score}分 · ${healthScore.label}
                        </div>
                        <div class="health-goal-hints">
                            ${healthScore.L1.onTime.hint ? `<div class="health-goal-hint">${LucideUtils.createIcon('calendar', { size: 14, strokeWidth: 1.8 })} ${healthScore.L1.onTime.hint}</div>` : ''}
                            ${healthScore.L3.stagnation.hint ? `<div class="health-goal-hint">${LucideUtils.createIcon('clock', { size: 14, strokeWidth: 1.8 })} ${healthScore.L3.stagnation.hint}</div>` : ''}
                        </div>
                        <div class="health-goal-actions">
                            <button class="health-goal-improve" data-goal-id="${HTMLUtils.escapeHtmlAttr(goal.id)}" data-goal-title="${HTMLUtils.escapeHtmlAttr(goal.title)}" data-hints="${HTMLUtils.escapeHtmlAttr(hints)}">✨ 用 AI 改进</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const content = `
            <div id="tab-content-overview" class="fab-tab-content active">
                ${typeof StatsModal !== 'undefined'
                    ? StatsModal.renderStatsHTML(overview)
                    : ''}
            </div>

            <div id="tab-content-diagnosis" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div class="health-section-title">核心体检</div>
                    <div class="health-overview-large" style="--avg-color: ${HTMLUtils.escapeHtmlAttr(set.avgColor)};">
                        <div class="health-score-ring" style="--score: ${num(set.avgScore)}%;">
                            <div class="health-score-inner">
                                <div class="health-score-number" style="color: ${HTMLUtils.escapeHtmlAttr(set.avgColor)};">
                                    ${set.avgScore}
                                    ${set.trend !== 0 ? `
                                        <span class="score-trend" style="color: ${set.trend > 0 ? 'var(--bamboo-primary)' : '#dc3545'}">
                                            ${set.trend > 0 ? '↑' : '↓'}${Math.abs(set.trend)}
                                        </span>
                                    ` : ''}
                                </div>
                                <div class="health-score-label">健康分</div>
                                <div class="health-score-level">${set.avgLabel}</div>
                            </div>
                        </div>
                        <div class="health-layers-detail">
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: var(--bamboo-primary);"></div>
                                    <span class="health-layer-name">L1 执行力</span>
                                    <span class="health-layer-score" style="color: var(--bamboo-primary);">${set.L1}</span>
                                </div>
                                <div class="health-layer-desc">按时完成、适度提前、周活跃度</div>
                            </div>
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: var(--bamboo-light);"></div>
                                    <span class="health-layer-name">L2 动力指数</span>
                                    <span class="health-layer-score" style="color: var(--bamboo-light);">${set.L2}</span>
                                </div>
                                <div class="health-layer-desc">进度趋势、完成趋势、加速指数</div>
                            </div>
                            <div class="health-layer-item">
                                <div class="health-layer-header">
                                    <div class="health-layer-color" style="background: #c9a227;"></div>
                                    <span class="health-layer-name">L3 可持续度</span>
                                    <span class="health-layer-score" style="color: #c9a227;">${set.L3}</span>
                                </div>
                                <div class="health-layer-desc">停滞指数、负荷均衡、可持续度</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${goalsDetailHtml ? `
                    <div class="fab-panel-section">
                        <div class="health-section-title">项目诊断</div>
                        <div class="health-goals-list">
                            ${goalsDetailHtml}
                        </div>
                    </div>
                ` : ''}
                
                <div class="fab-panel-section">
                    <div class="health-section-title">系统战略诊断</div>
                    <div class="health-tips">
                        <div class="dynamic-hints-list">
                            ${dynamicHints.map(hint => `
                                <div class="dynamic-hint-item">
                                    <div class="dynamic-hint-content">
                                        <div class="dynamic-hint-text" style="color: ${hint.type === 'danger' ? '#dc3545' : (hint.type === 'warning' ? '#f59e0b' : 'var(--bamboo-primary)')};">
                                            ${hint.text}
                                        </div>
                                        <div class="dynamic-hint-action">
                                            ${hint.action}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div id="tab-content-system" class="fab-tab-content">
                <div class="fab-panel-section">
                    <div class="health-section-title">设计哲学</div>
                    <div class="philosophy-card">
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">三层评估体系</div>
                                <div class="philosophy-desc">从执行力、动力指数到可持续度的全方位诊断，模拟真实世界的目标管理逻辑。</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">时间价值导向</div>
                                <div class="philosophy-desc">重视按时完成，同时避免过度超前，找到时间管理的平衡点。</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">趋势重于结果</div>
                                <div class="philosophy-desc">不仅看当前进度，更关注变化趋势，小步快跑的正向反馈最重要。</div>
                            </div>
                        </div>
                        <div class="philosophy-item">
                            <div class="philosophy-content">
                                <div class="philosophy-title">可持续发展观</div>
                                <div class="philosophy-desc">警惕停滞和过载，鼓励稳定、均衡、可持续的推进节奏。</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">评分标准详解</div>
                    <div class="rating-card">
                        <div class="rating-tier excellent">
                            <div class="rating-badge">优秀</div>
                            <div class="rating-range">85-100分</div>
                            <div class="rating-desc">战略执行处于极高水平，已建立稳固的习惯闭环。保持当前节奏，可尝试逐步增加任务负荷。</div>
                        </div>
                        <div class="rating-tier good">
                            <div class="rating-badge">良好</div>
                            <div class="rating-range">70-84分</div>
                            <div class="rating-desc">整体执行状况良好，在某些维度还有提升空间。继续保持优势，关注诊断提示中的改进点。</div>
                        </div>
                        <div class="rating-tier warning">
                            <div class="rating-badge">需关注</div>
                            <div class="rating-range">50-69分</div>
                            <div class="rating-desc">存在一些需要关注的问题，可能出现进度落后或动力不足。建议根据诊断提示调整策略。</div>
                        </div>
                        <div class="rating-tier risk">
                            <div class="rating-badge">风险</div>
                            <div class="rating-range">0-49分</div>
                            <div class="rating-desc">系统检测到严重风险，项目可能面临停滞或失控。建议立即重新审视目标设定和执行策略。</div>
                        </div>
                    </div>
                </div>

                <div class="fab-panel-section">
                    <div class="health-section-title">三层指标体系</div>
                    <div class="layers-detail-card">
                        <div class="layer-detail-item primary">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L1 执行力</div>
                                    <div class="layer-detail-weight">权重：45%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">按时完成率</div>
                                    <div class="metric-weight">30%</div>
                                    <div class="metric-desc">按时（0~-3天）得100，拖延会扣分。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">适度提前率</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">提前1~3天得80，过度超前会扣分。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">周活跃度</div>
                                    <div class="metric-weight">5%</div>
                                    <div class="metric-desc">近7天有推进的工作日占比。</div>
                                </div>
                            </div>
                        </div>
                        <div class="layer-detail-item">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color" style="background: var(--bamboo-light);"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L2 动力指数</div>
                                    <div class="layer-detail-weight">权重：30%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">进度趋势</div>
                                    <div class="metric-weight">20%</div>
                                    <div class="metric-desc">近期进度增量与历史水平的对比。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">完成趋势</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">子任务完成速度的变化趋势。</div>
                                </div>
                            </div>
                        </div>
                        <div class="layer-detail-item">
                            <div class="layer-detail-header">
                                <div class="layer-detail-color" style="background: #c9a227;"></div>
                                <div class="layer-detail-title">
                                    <div class="layer-detail-name">L3 可持续度</div>
                                    <div class="layer-detail-weight">权重：25%</div>
                                </div>
                            </div>
                            <div class="layer-detail-metrics">
                                <div class="metric-item">
                                    <div class="metric-name">停滞惩罚</div>
                                    <div class="metric-weight">动态</div>
                                    <div class="metric-desc">无推进天数的指数级惩罚。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">负荷均衡度</div>
                                    <div class="metric-weight">10%</div>
                                    <div class="metric-desc">子任务进度的标准差。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">过度超前惩罚</div>
                                    <div class="metric-weight">动态</div>
                                    <div class="metric-desc">过度提前完成的线性惩罚。</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-name">拖延惩罚</div>
                                    <div class="metric-weight">动态</div>
                                    <div class="metric-desc">拖延的线性惩罚。</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    return content;
}

// 测试加载器（loadModule）会剥离 import/export，调用方按**全局名**解析依赖。
// 与 utils/perf.js 同款做法：否则所有 loadModule 了 goals/renderer.js 的测试都会因
// `buildHealthPanelContent is not defined` 失败。
if (typeof globalThis !== 'undefined') {
    globalThis.buildHealthPanelContent = buildHealthPanelContent;
}
