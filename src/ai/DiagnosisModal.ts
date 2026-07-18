/**
 * DiagnosisModal — AI 诊断只读报告（MVP-1 + UI v2）
 *
 * 设计语言：与 AI 规划模块（AgenticPlanModal）统一
 *   - 主题色：var(--interactive-accent)
 *   - 圆角：10-12px
 *   - 间距：8pt 网格
 *   - 状态语义：保留（绿/黄/红/橙），但柔和化（透明背景 + 字色）
 *
 * 信息层级：
 *   L1 焦点：标题 + 摘要（一屏可见）
 *   L2 主体：建议列表（每条独立行动卡 → 醒目 CTA）— 用户来这里的真正目的
 *   L3 细节：子项证据（默认折叠，点击展开紧凑表格）— 支撑数据
 *
 * 坏 JSON 回退（rawText）→ 直接展示纯文本，不崩。
 */
import { Modal, App } from 'obsidian';
import type { DiagnosisResult, GoalDiagnosis } from './GoalDiagnoser';
import type { Suggestion } from './Suggestion';
import type { ItemEvidence } from './DeviationCalculator';

const STATUS_LABEL: Record<string, string> = {
  on_track: '达标',
  behind: '落后',
  stuck: '停滞',
  done: '已完成',
  at_risk: '临期风险',
};

/** 健康等级文案（与 webapp 健康卡片同词汇） */
const LEVEL_LABEL: Record<string, string> = {
  excellent: '优秀',
  good: '良好',
  warning: '需关注',
  risk: '风险',
};

/** 三维健康分短标签（履约 / 动力 / 节奏，对齐健康卡片） */
const DIM_LABEL: Record<string, string> = {
  L1: '履约',
  L2: '动力',
  L3: '节奏',
};

export interface DiagnosisModalOptions {
  diagnosis: DiagnosisResult;
  /** 逐条应用：点某条建议时传入该 goal + 具体 suggestion（#7 结构化） */
  onApply: (goal: GoalDiagnosis, suggestion: Suggestion) => void;
  /** 可选：提供时，建议区顶部显示「应用全部」按钮（应用该 goal 全部建议） */
  onApplyAll?: (goal: GoalDiagnosis) => void;
  /** 可选：报告级「一键应用全部建议」（MVP-2），跨所有目标批量确定性应用 */
  onApplyAllDiagnosis?: () => void;
  /** 真实子项证据（按 goal.id 索引，title 为回退），默认折叠，展开后是紧凑表格 */
  itemEvidence?: Record<string, ItemEvidence[]>;
  title?: string;
}

export class DiagnosisModal extends Modal {
  private opts: DiagnosisModalOptions;

  constructor(app: App, opts: DiagnosisModalOptions) {
    super(app);
    this.opts = opts;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bamboo-diag-modal');

    // ===== Header =====
    const header = contentEl.createDiv({ cls: 'bamboo-diag-header' });
    header.createEl('h2', { text: this.opts.title ?? 'AI 诊断 · 目标执行复盘' });

    const d = this.opts.diagnosis;
    if (!d.ok) {
      // 坏 JSON 兜底：只展示纯文本，不渲染任何目标卡
      contentEl.createEl('p', { text: d.rawText, cls: 'bamboo-diag-raw' });
      return;
    }

    // ===== MVP-2：报告级「一键应用全部建议」（跨所有目标批量） =====
    const totalSuggestions = d.goals.reduce((n, g) => n + (g.suggestions?.length ?? 0), 0);
    if (this.opts.onApplyAllDiagnosis && totalSuggestions > 0) {
      const bar = contentEl.createDiv({ cls: 'bamboo-diag-batchbar' });
      const batchBtn = bar.createEl('button', {
        text: '一键应用全部建议',
        cls: 'bamboo-diag-batch-btn',
      });
      batchBtn.addEventListener('click', () => {
        this.opts.onApplyAllDiagnosis?.();
        this.close();
      });
      bar.createSpan({
        text: `共 ${totalSuggestions} 条建议，确认后将一次性改写并写入目标`,
        cls: 'bamboo-diag-batch-hint',
      });
    }

    // ===== Summary =====
    if (d.summary) {
      contentEl.createEl('p', { text: d.summary, cls: 'bamboo-diag-summary' });
    }

    // ===== Goal 卡片列表 =====
    for (const g of d.goals) {
      this.renderGoal(contentEl, g);
    }
    // nextActions 已废弃：与每条 suggestions 重复（"恢复每日执行"是建议的元描述），
    // 保留数据字段以保持向后兼容，但不在 UI 渲染。
  }

  onClose(): void {
    this.contentEl.empty();
  }

  // ---------- 内部渲染辅助 ----------

  private renderGoal(parent: HTMLElement, g: GoalDiagnosis): void {
    // 有健康分时以「等级」为语义主色；否则回退旧 status（向后兼容）
    const hasHealth = !!g.level;
    const card = parent.createDiv({
      cls: hasHealth
        ? `bamboo-diag-goal bamboo-diag-goal-level-${g.level}`
        : `bamboo-diag-goal bamboo-diag-goal-${g.status}`,
    });

    // Header：标题 + 徽标（健康等级 或 旧状态）
    const goalHeader = card.createDiv({ cls: 'bamboo-diag-goal-header' });
    goalHeader.createEl('h3', { text: g.title, cls: 'bamboo-diag-goal-title' });
    if (hasHealth) {
      const badge = `${LEVEL_LABEL[g.level as string] ?? g.level}${
        typeof g.healthScore === 'number' ? ` · ${g.healthScore}分` : ''
      }`;
      goalHeader.createSpan({
        text: badge,
        cls: `bamboo-diag-level bamboo-diag-level-${g.level} bamboo-diag-healthscore`,
      });
    } else {
      goalHeader.createSpan({
        text: STATUS_LABEL[g.status] ?? g.status,
        cls: `bamboo-diag-status bamboo-diag-status-${g.status}`,
      });
    }

    // 三维健康指标（履约/动力/节奏），最弱维度高亮
    if (hasHealth) {
      this.renderDimensions(card, g);
    }

    // 瓶颈（一行灰字）
    if (g.bottleneck) {
      card.createEl('p', { text: g.bottleneck, cls: 'bamboo-diag-bottleneck' });
    }

    // ----- 真实子项证据：默认折叠，点击展开 -----
    const evList = this.opts.itemEvidence?.[g.id ?? g.title];
    if (evList && evList.length > 0) {
      this.renderEvidence(card, evList);
    }

    // ----- 建议列表：每条独立行动卡（核心 CTA） -----
    if (g.suggestions && g.suggestions.length > 0) {
      this.renderSuggestions(card, g);
    }
  }

  private renderDimensions(parent: HTMLElement, g: GoalDiagnosis): void {
    const wrap = parent.createDiv({ cls: 'bamboo-diag-dims' });
    const dims: Array<{ key: 'L1' | 'L2' | 'L3'; score?: number }> = [
      { key: 'L1', score: g.L1 },
      { key: 'L2', score: g.L2 },
      { key: 'L3', score: g.L3 },
    ];
    for (const d of dims) {
      const isWeak = g.weakest === d.key;
      const score = typeof d.score === 'number' ? String(d.score) : '—';
      wrap.createDiv({
        text: `${DIM_LABEL[d.key]} ${score}`,
        cls: `bamboo-diag-dim bamboo-diag-dim-${d.key}${isWeak ? ' bamboo-diag-dim-weakest' : ''}`,
      });
    }
  }

  private renderEvidence(parent: HTMLElement, evList: ItemEvidence[]): void {
    // 汇总统计：多少子项、平均完成度、平均节奏偏差
    const stats = summarize(evList);

    const details = parent.createEl('details', { cls: 'bamboo-diag-evidence' });
    const summary = details.createEl('summary', { cls: 'bamboo-diag-evidence-summary' });

    // 左侧：chevron + 子项数
    const left = summary.createDiv({ cls: 'bamboo-diag-evidence-summary-left' });
    left.createSpan({ text: '▸', cls: 'bamboo-diag-evidence-chevron' });
    left.createSpan({
      text: `${evList.length} 个子项 · ${stats.label}`,
    });

    // 右侧：可执行摘要
    summary.createSpan({
      text: stats.headline,
      cls: `bamboo-diag-evidence-headline bamboo-diag-evidence-headline-${stats.level}`,
    });

    // 展开后：紧凑表格
    const list = details.createDiv({ cls: 'bamboo-diag-evidence-list' });
    for (const e of evList) {
      this.renderEvidenceRow(list, e);
    }
  }

  private renderEvidenceRow(parent: HTMLElement, e: ItemEvidence): void {
    const row = parent.createDiv({ cls: 'bamboo-diag-evidence-row' });

    // 名字
    row.createSpan({ text: e.name, cls: 'bamboo-diag-evidence-name' });

    // dailyMin
    row.createSpan({
      text: e.dailyMin || '?',
      cls: 'bamboo-diag-evidence-cell bamboo-diag-evidence-daily',
    });

    // 完成度：色点 + 百分比
    const pctEl = row.createSpan({ cls: 'bamboo-diag-evidence-cell' });
    const pctLevel = percentLevel(e.percent);
    pctEl.createSpan({ cls: `bamboo-diag-dot bamboo-diag-dot-${pctLevel}` });
    pctEl.createSpan({
      text: e.percent != null ? `${e.percent}%` : '?',
      cls: `bamboo-diag-evidence-pct bamboo-diag-evidence-pct-${pctLevel}`,
    });

    // 节奏偏差：色点 + ±pt
    const paceEl = row.createSpan({ cls: 'bamboo-diag-evidence-cell' });
    const paceLevel = paceLevelOf(e.paceDeviation);
    paceEl.createSpan({ cls: `bamboo-diag-dot bamboo-diag-dot-${paceLevel}` });
    paceEl.createSpan({
      text: e.paceDeviation != null ? `${fmtSigned(e.paceDeviation)}pt` : '?',
      cls: `bamboo-diag-evidence-pace bamboo-diag-evidence-pace-${paceLevel}`,
    });

    // 元信息
    row.createSpan({
      text: `${e.doneDays} 天${e.lastDone ? ' · ' + e.lastDone : ''}`,
      cls: 'bamboo-diag-evidence-foot',
    });
  }

  private renderSuggestions(parent: HTMLElement, goal: GoalDiagnosis): void {
    const suggWrap = parent.createDiv({ cls: 'bamboo-diag-suggestions' });
    const title = suggWrap.createEl('h4', {
      text: `建议（${goal.suggestions.length}）`,
      cls: 'bamboo-diag-suggestions-title',
    });
    // 维度标签：建议应围绕最弱维度展开（来自 g.weakest；无则旧数据，不显示）
    if (goal.weakest && DIM_LABEL[goal.weakest]) {
      title.createSpan({
        text: `聚焦${DIM_LABEL[goal.weakest]}`,
        cls: `bamboo-diag-focus-dim bamboo-diag-focus-dim-${goal.weakest}`,
      });
    }
    // 「应用全部」：一次性应用该 goal 的全部建议（#7，确定性逐条应用）
    if (this.opts.onApplyAll && goal.suggestions.length > 0) {
      const allBtn = suggWrap.createEl('button', {
        text: '应用全部',
        cls: 'bamboo-diag-apply-all',
      });
      allBtn.addEventListener('click', () => {
        this.opts.onApplyAll?.(goal);
        this.close();
      });
    }
    for (const s of goal.suggestions) {
      this.renderSuggestionRow(suggWrap, s, goal);
    }
  }

  private renderSuggestionRow(
    parent: HTMLElement,
    s: Suggestion,
    goal: GoalDiagnosis
  ): void {
    const row = parent.createDiv({ cls: 'bamboo-diag-suggestion' });
    row.createDiv({ text: s.text, cls: 'bamboo-diag-suggestion-text' });
    // 维度标签（建议聚焦维度）
    if (s.dimension && DIM_LABEL[s.dimension]) {
      row.createSpan({
        text: DIM_LABEL[s.dimension],
        cls: `bamboo-diag-focus-dim bamboo-diag-focus-dim-${s.dimension}`,
      });
    }
    const btn = row.createEl('button', {
      text: '应用',
      cls: 'bamboo-diag-apply',
    });
    btn.addEventListener('click', () => {
      this.opts.onApply(goal, s);
      this.close();
    });
  }
}

// ---------- 纯函数辅助 ----------

type Level = 'low' | 'mid' | 'high' | 'neutral' | 'pos' | 'neg';

function percentLevel(p: number | null): Level {
  if (p == null) return 'neutral';
  if (p < 30) return 'low';
  if (p < 70) return 'mid';
  return 'high';
}

function paceLevelOf(p: number | null): Level {
  if (p == null) return 'neutral';
  if (p > 0) return 'pos';
  if (p < 0) return 'neg';
  return 'neutral';
}

function fmtSigned(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/** 证据汇总：用于折叠态下的一行概览 */
function summarize(evList: ItemEvidence[]): {
  label: string;
  headline: string;
  level: 'good' | 'warn' | 'bad' | 'neutral';
} {
  const pcts = evList.map((e) => e.percent).filter((p): p is number => p != null);
  const paces = evList
    .map((e) => e.paceDeviation)
    .filter((p): p is number => p != null);
  if (pcts.length === 0) {
    return { label: '无数据', headline: '无数据', level: 'neutral' };
  }
  const avgPct = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  const avgPace =
    paces.length > 0
      ? Math.round(paces.reduce((a, b) => a + b, 0) / paces.length)
      : 0;
  const allZero = evList.every((e) => e.doneDays === 0);
  if (allZero) {
    return {
      label: '近 7 天 0 完成',
      headline: '全部停滞',
      level: 'bad',
    };
  }
  if (avgPct >= 70) {
    return {
      label: `平均完成度 ${avgPct}%`,
      headline: '整体达标',
      level: 'good',
    };
  }
  if (avgPace < -10) {
    return {
      label: `平均完成度 ${avgPct}% · 节奏 ${fmtSigned(avgPace)}pt`,
      headline: '严重滞后',
      level: 'bad',
    };
  }
  return {
    label: `平均完成度 ${avgPct}% · 节奏 ${fmtSigned(avgPace)}pt`,
    headline: '需要关注',
    level: 'warn',
  };
}
