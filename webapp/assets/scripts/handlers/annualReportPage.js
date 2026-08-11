import { $, $$, modalMount } from '../utils/domRef.js';
import { PanelManager } from '../utils/panelManager.js';

/**
 * 年度修为报告 —— webapp 全屏可视化页。
 * 数据由插件端 app:generateAnnualReport 聚合（与 vault Markdown 同一份），
 * 此处只负责把结构化 report 渲染成强可视化的 SVG/卡片，可截图分享。
 */
export const AnnualReportPage = {
  async open() {
    const year = new Date().getFullYear();
    const loading = `
      <div class="annual-report-loading">
        <div class="ar-spinner"></div>
        <div class="ar-loading-text">正在聚合一年修仙数据…</div>
      </div>`;
    PanelManager.open(
      'annual-report',
      LucideUtils.createIcon('scroll', { size: 16 }) + ` 年度修为报告 ${year}`,
      loading,
    );

    let result;
    try {
      result = await storageManager.requestAnnualReport(year);
    } catch (e) {
      PanelManager.open(
        'annual-report',
        '年度修为报告',
        `<div class="annual-report-error">生成失败：${(e && e.message) || e}</div>`,
      );
      return;
    }
    const { report, markdownPath } = result;
    PanelManager.open(
      'annual-report',
      LucideUtils.createIcon('scroll', { size: 16 }) + ` 年度修为报告 ${report.year}`,
      this._render(report, markdownPath),
    );
  },

  _render(r, markdownPath) {
    const partial = r.isPartial
      ? `<div class="ar-banner">本年度尚未结束 · 已修行 ${r.daysTracked} 天（进度快照）</div>`
      : '';
    const realmText = r.realmEnd
      ? `${r.realmEnd.realm} 第 ${r.realmEnd.layer} 层`
      : '—';

    const metricCards = [
      { v: `${r.activeDays}`, l: `活跃天 / ${r.daysTracked}`, sub: `达标率 ${r.activeRate}%` },
      { v: `${r.longestStreak}`, l: '最长连胜', sub: `当前 ${r.currentStreak} 天` },
      { v: `${r.stagnationSpells}`, l: '停摆次数', sub: '连续7天无达标记1次' },
      { v: `${r.realmLayerGain}`, l: '走了几境', sub: `年末 ${realmText}` },
      { v: r.strongestCategory ? `${r.strongestCategory.label}` : '—', l: '最强维度', sub: r.strongestCategory ? `${r.strongestCategory.rate}%` : '' },
      { v: `${r.completionsInYear}`, l: '达成目标', sub: `放弃 ${r.abandonmentsInYear}` },
    ]
      .map(
        (m) => `
        <div class="ar-metric-card">
          <div class="ar-metric-value">${m.v}</div>
          <div class="ar-metric-label">${m.l}</div>
          ${m.sub ? `<div class="ar-metric-sub">${m.sub}</div>` : ''}
        </div>`,
      )
      .join('');

    const lineSvg = this._monthlyLineSvg(r.monthlyActivity);
    const radarSvg = this._categoryRadarSvg(r.categoryRates);

    const rebel = r.mostRebelliousAbandon
      ? `<div class="ar-story-card ar-rebel">
           <div class="ar-story-title">🔥 最叛逆的一次放弃</div>
           <div class="ar-story-name">${this._esc(r.mostRebelliousAbandon.title)}</div>
           <div class="ar-story-desc">仅完成 <b>${r.mostRebelliousAbandon.progressAtEvent}%</b> 便放手（${r.mostRebelliousAbandon.category} · ${r.mostRebelliousAbandon.date}）。道心未稳，来日方长。</div>
         </div>`
      : `<div class="ar-story-card ar-rebel">
           <div class="ar-story-title">🔥 最叛逆的一次放弃</div>
           <div class="ar-story-desc">本年度暂无放弃记录 —— 心如磐石。</div>
         </div>`;

    const streakCard = `<div class="ar-story-card">
        <div class="ar-story-title">🏔️ 最长连胜 ${r.longestStreak} 天</div>
        <div class="ar-story-desc">${r.longestStreak >= 30 ? '一月有余未曾停摆，已具宗门长老之风。' : '连胜尚可加长，来年再战。'}</div>
      </div>`;

    const stagnationCard = `<div class="ar-story-card">
        <div class="ar-story-title">🕳️ 停摆黑洞 ${r.stagnationSpells} 次</div>
        <div class="ar-story-desc">${r.stagnationSpells === 0 ? '全年无一次长停摆，修行从未断档。' : '每次停摆都是蓄势，复盘后重新提剑上路。'}</div>
      </div>`;

    const dimTable = r.categoryRates.length
      ? `<table class="ar-dim-table"><tr><th>维度</th><th>完成率</th></tr>${r.categoryRates
          .map((c) => `<tr><td>${c.label}</td><td>${c.rate}%</td></tr>`)
          .join('')}</table>`
      : '';

    return `
      <div class="annual-report-page">
        ${partial}
        <div class="ar-metrics-grid">${metricCards}</div>
        <div class="ar-charts">
          <div class="ar-chart-box">
            <div class="ar-chart-title">月度活跃天数</div>
            ${lineSvg}
          </div>
          <div class="ar-chart-box">
            <div class="ar-chart-title">六维修为强度</div>
            ${radarSvg}
          </div>
        </div>
        <div class="ar-stories">
          ${rebel}
          ${streakCard}
          ${stagnationCard}
        </div>
        ${dimTable}
        <div class="ar-footer">
          <span>数据全部存于本地 vault，零上传、零隐私风险</span>
          ${markdownPath ? `<span class="ar-md-path">已生成：${this._esc(markdownPath)}</span>` : ''}
        </div>
      </div>`;
  },

  _monthlyLineSvg(months) {
    const W = 320, H = 140, pad = 24;
    const max = 31;
    const pts = months.map((m, i) => {
      const x = pad + (i * (W - 2 * pad)) / Math.max(1, months.length - 1);
      const y = H - pad - (m.activeDays / max) * (H - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const area = pts.length
      ? `M${pad},${H - pad} L${pts.join(' L')} L${(W - pad).toFixed(1)},${H - pad} Z`
      : '';
    const dots = months
      .map((m, i) => {
        const x = pad + (i * (W - 2 * pad)) / Math.max(1, months.length - 1);
        const y = H - pad - (m.activeDays / max) * (H - 2 * pad);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" class="ar-dot"/>`;
      })
      .join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="ar-line-svg" preserveAspectRatio="xMidYMid meet">
      <polyline points="${pts.join(' ')}" fill="none" class="ar-line"/>
      <path d="${area}" class="ar-area"/>
      ${dots}
    </svg>`;
  },

  _categoryRadarSvg(cats) {
    if (!cats.length) return '<div class="ar-empty">暂无维度数据</div>';
    const size = 200, c = size / 2, R = 70;
    const n = cats.length;
    const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const point = (i, val) => {
      const r = (val / 100) * R;
      return [c + r * Math.cos(angle(i)), c + r * Math.sin(angle(i))];
    };
    const axes = cats
      .map((_, i) => {
        const [x, y] = [c + R * Math.cos(angle(i)), c + R * Math.sin(angle(i))];
        return `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="ar-axis"/>`;
      })
      .join('');
    const labels = cats
      .map((cat, i) => {
        const [x, y] = [c + (R + 14) * Math.cos(angle(i)), c + (R + 14) * Math.sin(angle(i))];
        return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" class="ar-axis-label" text-anchor="middle">${cat.label}</text>`;
      })
      .join('');
    const poly = cats.map((cat, i) => point(i, cat.rate).map((v) => v.toFixed(1)).join(',')).join(' ');
    return `<svg viewBox="0 0 ${size} ${size}" class="ar-radar-svg" preserveAspectRatio="xMidYMid meet">
      ${axes}
      <polygon points="${poly}" class="ar-radar"/>
      ${labels}
    </svg>`;
  },

  _esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};

window.AnnualReportPage = AnnualReportPage;
