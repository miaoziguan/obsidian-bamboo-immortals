/**
 * DiagnosisModal — AI 诊断只读报告（MVP-1）
 *
 * 展示：标题 + 摘要 + 每目标「红黄绿状态徽标」+ 瓶颈 + 每条建议一个「应用」按钮。
 * 点「应用」→ 调用 onApply(该目标诊断) 并关闭自身（由上层打开 AgenticPlanModal 预填指令）。
 * 坏 JSON 回退（rawText）→ 直接展示纯文本，不崩。
 *
 * 自身只负责 UI；诊断数据由 GoalDiagnoser 产出，落库由上层 onApply→AgenticPlanModal→onConfirm 完成。
 */
import { Modal, App } from 'obsidian';
import type { DiagnosisResult, GoalDiagnosis } from './GoalDiagnoser';

const STATUS_LABEL: Record<string, string> = {
  on_track: '✅ 达标',
  behind: '🟡 落后',
  stuck: '🔴 停滞',
  done: '✅ 已完成',
  at_risk: '🟠 临期风险',
};

export interface DiagnosisModalOptions {
  diagnosis: DiagnosisResult;
  onApply: (goal: GoalDiagnosis) => void;
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

    contentEl.createEl('h2', { text: this.opts.title ?? 'AI 诊断 · 目标执行复盘' });

    const d = this.opts.diagnosis;
    if (!d.ok) {
      contentEl.createEl('p', { text: d.rawText, cls: 'bamboo-diag-raw' });
      return;
    }

    if (d.summary) {
      contentEl.createEl('p', { text: d.summary, cls: 'bamboo-diag-summary' });
    }

    for (const g of d.goals) {
      const card = contentEl.createDiv({ cls: 'bamboo-diag-goal' });
      card.createEl('div', { text: g.title, cls: 'bamboo-diag-goal-title' });
      card.createEl('div', {
        text: STATUS_LABEL[g.status] ?? g.status,
        cls: `bamboo-diag-status bamboo-diag-${g.status}`,
      });
      if (g.bottleneck) {
        card.createEl('div', { text: g.bottleneck, cls: 'bamboo-diag-bottleneck' });
      }
      for (const s of g.suggestions) {
        const row = card.createDiv({ cls: 'bamboo-diag-sugg' });
        row.createEl('span', { text: s });
        const btn = row.createEl('button', { text: '应用', cls: 'bamboo-diag-apply' });
        btn.addEventListener('click', () => {
          this.opts.onApply(g);
          this.close();
        });
      }
    }

    if (d.nextActions.length > 0) {
      contentEl.createEl('p', {
        text: '下一步：' + d.nextActions.join('；'),
        cls: 'bamboo-diag-next',
      });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
