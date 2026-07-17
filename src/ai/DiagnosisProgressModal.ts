/**
 * DiagnosisProgressModal — AI 诊断分阶段进度指示（替代 ⑤ 流式 SSE 逐字）
 *
 * 设计语言与 DiagnosisModal / AgenticPlanModal 统一（主题色 / 圆角 / 8pt 网格）。
 * 只做「知道卡在哪一步」的轻量进度，不做逐字流式、不解析半成品 JSON。
 *
 * 用法：
 *   const progress = new DiagnosisProgressModal(app); progress.open();
 *   runDiagnosis({ onPhase: (p, l) => progress.setPhase(p, l), ... });
 *   // 报告弹窗打开时 progress.close()
 */
import { Modal, type App } from 'obsidian';
import { DIAGNOSIS_PHASE_LABEL, type DiagnosisPhase } from './runDiagnosis';

/** 进度步骤的展示顺序（不含 done） */
const PHASE_ORDER: DiagnosisPhase[] = ['collect', 'analyze', 'ai', 'render'];

export class DiagnosisProgressModal extends Modal {
  private stepsEl?: HTMLElement;
  private current: DiagnosisPhase | null = null;
  private labels: Partial<Record<DiagnosisPhase, string>> = {};

  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', {
      text: 'AI 诊断进行中',
      cls: 'bamboo-progress-title',
    });
    contentEl.createEl('p', {
      text: '正在复盘你的目标执行情况，请稍候',
      cls: 'bamboo-progress-sub',
    });
    this.stepsEl = contentEl.createDiv({ cls: 'bamboo-progress-steps' });
    this.current = null;
    this.renderSteps();
  }

  /** 由 runDiagnosis 在各编排边界调用，驱动步骤状态机 */
  setPhase(phase: DiagnosisPhase, label?: string): void {
    if (label) this.labels[phase] = label;
    this.current = phase;
    this.renderSteps();
  }

  private renderSteps(): void {
    const stepsEl = this.stepsEl;
    if (!stepsEl) return;
    stepsEl.empty();
    const idx = this.current ? PHASE_ORDER.indexOf(this.current) : -1;
    PHASE_ORDER.forEach((p, i) => {
      const state =
        this.current == null
          ? 'is-pending'
          : i < idx
            ? 'is-done'
            : i === idx
              ? 'is-current'
              : 'is-pending';
      const step = stepsEl.createDiv({ cls: `bamboo-progress-step ${state}` });
      step.dataset['phase'] = p;
      step.createDiv({ cls: 'bamboo-progress-dot' });
      step.createDiv({
        cls: 'bamboo-progress-label',
        text: this.labels[p] ?? DIAGNOSIS_PHASE_LABEL[p],
      });
    });
  }
}
