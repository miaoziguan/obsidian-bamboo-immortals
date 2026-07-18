/**
 * SuggestionApplyModal — 结构化建议的「改动预览 / 人工闸门」（#7）
 *
 * 区别于 AgenticPlanModal：这里不做 AI 再解释，只是把 applySuggestion 的
 * 确定性结果**原样呈现**给用户看「到底命中了哪个目标/子项、改了什么」，
 * 由用户确认后落库。保留 diagnosis-action-loop-design §7 的「人工确认是最后闸门」。
 *
 * 可选「用 AI 调整」：把已确定性改写的树交给 AgenticPlanModal 继续精修
 * （仅当用户想要时，默认走确定性路径，不引入 AI 猜测）。
 */
import { Modal, App } from 'obsidian';
import type { GoalItem } from '../types/data';
import type { Suggestion, SuggestionAction } from './Suggestion';

const ACTION_LABEL: Record<SuggestionAction, string> = {
  adjust_dailyMin: '调整每日量',
  remove_subitem: '删除子项',
  add_subitem: '新增子项',
  note: '备注',
};

export interface SuggestionApplyOptions {
  suggestions: Suggestion[];
  /** 改写前（用于显示 before→after 差值） */
  before: GoalItem[];
  /** 确定性改写后（确认即落库） */
  after: GoalItem[];
  onConfirm: (goals: GoalItem[]) => void;
  /** 可选：用 AI 在已改写树上继续精修 */
  onEscalateAI?: (goals: GoalItem[]) => void;
  title?: string;
}

/** 取某 goal 下、按 suggestion.target 命中的子项 */
function findItem(goals: GoalItem[], s: Suggestion): { name: string; dailyMin?: string } | null {
  const goal = goals.find(
    (g) => (s.goalRef.goalId != null && g.id === s.goalRef.goalId) || g.title === s.goalRef.goalTitle
  );
  if (!goal) return null;
  const items = goal.items ?? [];
  let idx = -1;
  const target = s.target;
  if (target && target.subItemName != null) idx = items.findIndex((i) => i.name === target.subItemName);
  else if (s.target?.subItemIndex != null) idx = s.target.subItemIndex;
  if (idx < 0 || idx >= items.length) return null;
  return { name: items[idx].name, dailyMin: items[idx].dailyMin };
}

function describeHit(before: GoalItem[], after: GoalItem[], s: Suggestion): string {
  const target = s.target?.subItemName
    ? s.target.subItemName
    : s.target?.subItemIndex != null
      ? `第 ${s.target.subItemIndex} 个子项`
      : '（目标级）';
  const parts = [
    `目标「${s.goalRef.goalTitle ?? '(未命名目标)'}」`,
    `子项「${target}」`,
    ACTION_LABEL[s.action],
  ];
  if (s.action === 'adjust_dailyMin') {
    const b = findItem(before, s);
    const a = findItem(after, s);
    const oldV = b?.dailyMin ?? '?';
    const newV = a?.dailyMin ?? '?';
    parts.push(`dailyMin ${oldV} → ${newV}`);
  } else if (s.action === 'add_subitem' && s.params?.name) {
    parts.push(
      `新增「${s.params.name}」${s.params.dailyMin != null ? ` dailyMin=${s.params.dailyMin}` : ''}`
    );
  } else if (s.action === 'remove_subitem') {
    parts.push('将移除该子项');
  }
  return parts.join(' · ');
}

export class SuggestionApplyModal extends Modal {
  private opts: SuggestionApplyOptions;

  constructor(app: App, opts: SuggestionApplyOptions) {
    super(app);
    this.opts = opts;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bamboo-sugg-apply-modal');

    contentEl.createEl('h2', { text: this.opts.title ?? '应用诊断建议' });
    contentEl.createEl('p', {
      text: '以下为确定性改写预览（已精准命中具体子项），确认后写入目标库。',
      cls: 'bamboo-sugg-apply-desc',
    });

    const list = contentEl.createDiv({ cls: 'bamboo-sugg-apply-list' });
    for (const s of this.opts.suggestions) {
      const row = list.createDiv({ cls: 'bamboo-sugg-apply-row' });
      row.createSpan({ text: s.text, cls: 'bamboo-sugg-apply-text' });
      row.createSpan({
        text: describeHit(this.opts.before, this.opts.after, s),
        cls: 'bamboo-sugg-apply-hit',
      });
    }

    const footer = contentEl.createDiv({ cls: 'bamboo-sugg-apply-footer' });
    const confirm = footer.createEl('button', {
      text: '确认写入',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-primary',
    });
    confirm.addEventListener('click', () => {
      this.opts.onConfirm(this.opts.after);
      this.close();
    });

    if (this.opts.onEscalateAI) {
      const ai = footer.createEl('button', {
        text: '用 AI 调整',
        cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost',
      });
      ai.addEventListener('click', () => {
        this.opts.onEscalateAI?.(this.opts.after);
        this.close();
      });
    }

    const cancel = footer.createEl('button', {
      text: '取消',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost',
    });
    cancel.addEventListener('click', () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
