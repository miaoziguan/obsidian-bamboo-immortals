/**
 * PlanConfirmModal — AI 规划结果审阅弹窗（Phase 3）
 *
 * 形态：审阅式（非表单）。展示树状拆解（目标 → 子项）：
 *  - 目标：行内改名、领域 chip 下拉（6 分类）、thin 标 ⚠、删除目标；
 *  - 子项：勾选保留/删除、行内改名、每日量(dailyMin)补填、AI reason 仅灰色小字展示不持久化。
 *
 * 确认回调返回最终 GoalItem[]（已剔除 reason/detail，保留用户编辑与 sourceRef）。
 */

import { Modal, App, Notice } from 'obsidian';
import {
  GOAL_CATEGORIES,
  type GoalItem,
  type GoalSubItem,
} from '../types/data';
import { classifyCompleteness, extractUnit } from './GoalCardValidator';

interface ItemEntry {
  item: GoalSubItem;
  keep: boolean;
}
interface GoalEntry {
  goal: GoalItem;
  items: ItemEntry[];
  keep: boolean;
}

export class PlanConfirmModal extends Modal {
  private entries: GoalEntry[];
  private onConfirm: (goals: GoalItem[]) => void;
  private subtitle?: string;

  constructor(
    app: App,
    goals: GoalItem[],
    onConfirm: (goals: GoalItem[]) => void,
    subtitle?: string
  ) {
    super(app);
    this.onConfirm = onConfirm;
    this.subtitle = subtitle;
    this.entries = goals.map((goal) => ({
      goal,
      keep: true,
      items: (goal.items ?? []).map((item) => ({ item, keep: true })),
    }));
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bamboo-ai-plan-modal');

    contentEl.createEl('h2', { text: 'AI 规划审阅' });
    contentEl.createEl('p', {
      text: '核对并调整 AI 拆解，可改名、改领域、改日期、改节奏、补每日量，确认后写入「竹林修仙传」目标库。',
      cls: 'bamboo-ai-plan-desc',
    });

    if (this.subtitle) {
      contentEl.createEl('p', {
        text: this.subtitle,
        cls: 'bamboo-ai-plan-subtitle',
      });
    }

    const list = contentEl.createDiv({ cls: 'bamboo-ai-plan-list' });
    this.entries.forEach((entry, gi) => this.renderGoal(list, entry, gi));

    // 底部操作
    const footer = contentEl.createDiv({ cls: 'bamboo-ai-plan-footer' });
    footer.createEl('button', {
      text: '取消',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost',
    }).addEventListener('click', () => this.close());

    footer.createEl('button', {
      text: '写入目标',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-primary',
    }).addEventListener('click', () => this.confirm());
  }

  private renderGoal(parent: HTMLElement, entry: GoalEntry, gi: number): void {
    const card = parent.createDiv({ cls: 'bamboo-ai-plan-goal' });

    const head = card.createDiv({ cls: 'bamboo-ai-plan-goal-head' });

    const titleInput = head.createEl('input', {
      cls: 'bamboo-ai-plan-goal-title',
      attr: { value: entry.goal.title, placeholder: '目标标题' },
    });
    titleInput.addEventListener('input', () => {
      entry.goal.title = titleInput.value.trim() || `目标${gi + 1}`;
    });

    // AI 归纳分析（灰色小字，仅展示，不持久化）。随标题换行独占一行。
    if (entry.goal.analysis) {
      head.createEl('div', {
        text: `AI 分析：${entry.goal.analysis}`,
        cls: 'bamboo-ai-plan-analysis',
      });
    }

    // 领域 chip 下拉
    const catSelect = head.createEl('select', { cls: 'bamboo-ai-plan-cat' });
    GOAL_CATEGORIES.forEach((c) => {
      const opt = catSelect.createEl('option', {
        text: `${c.icon} ${c.name}`,
        value: c.id,
      });
      if (c.id === entry.goal.category) opt.selected = true;
    });
    catSelect.addEventListener('change', () => {
      entry.goal.category = catSelect.value;
      this.refreshThinBadge(card, entry);
    });

    // 开始日输入（endDate 推算锚点）。"—" 已天然区分起止，"起" 字多余
    const startWrap = head.createDiv({ cls: 'bamboo-ai-plan-daterange' });
    const startInput = startWrap.createEl('input', {
      cls: 'bamboo-ai-plan-daterange-input',
      attr: { type: 'date', value: entry.goal.startDate ?? '' },
    });
    startInput.addEventListener('change', () => {
      entry.goal.startDate = startInput.value;
    });

    // 截止日输入（量化目标必须有终点，用于进度/今日任务推算）
    startWrap.createSpan({ text: '—', cls: 'bamboo-ai-plan-daterange-sep' });
    const endInput = startWrap.createEl('input', {
      cls: 'bamboo-ai-plan-daterange-input',
      attr: { type: 'date', value: entry.goal.endDate ?? '' },
    });
    endInput.addEventListener('change', () => {
      entry.goal.endDate = endInput.value;
      this.refreshThinBadge(card, entry);
    });

    // thin 角标
    card.createDiv({ cls: 'bamboo-ai-plan-badge' });
    this.refreshThinBadge(card, entry);

    // 删除目标
    const del = head.createEl('button', {
      text: '✕',
      cls: 'bamboo-ai-plan-del',
      attr: { title: '删除该目标' },
    });
    del.addEventListener('click', () => {
      entry.keep = false;
      card.toggleClass('bamboo-ai-plan-goal-removed', true);
    });

    // 子项列表
    const itemsWrap = card.createDiv({ cls: 'bamboo-ai-plan-items' });
    (entry.goal.items ?? []).forEach((_, ii) => {
      const itemEntry = entry.items[ii];
      if (!itemEntry) return;
      this.renderItem(itemsWrap, entry, itemEntry, ii);
    });
  }

  private refreshThinBadge(card: HTMLElement, entry: GoalEntry): void {
    const badge = card.querySelector('.bamboo-ai-plan-badge');
    if (!badge) return;
    const { level, missing } = classifyCompleteness(entry.goal);
    badge.empty();
    if (level === 'thin') {
      badge.setText(`⚠ 待补填：${missing.join('、')}`);
      badge.addClass('bamboo-ai-plan-badge-thin');
    } else {
      badge.setText('✓ 已量化，可写入');
      badge.removeClass('bamboo-ai-plan-badge-thin');
    }
  }

  private renderItem(
    parent: HTMLElement,
    entry: GoalEntry,
    itemEntry: ItemEntry,
    ii: number
  ): void {
    const row = parent.createDiv({ cls: 'bamboo-ai-plan-item' });

    // 自定义墨绿勾选（方框+填充+白色对勾，替代默认 checkbox 视觉突兀）
    const cb = row.createEl('input', { type: 'checkbox', cls: 'bamboo-ai-plan-item-cb' });
    cb.checked = itemEntry.keep;
    cb.addEventListener('change', () => {
      itemEntry.keep = cb.checked;
      row.toggleClass('bamboo-ai-plan-item-off', !cb.checked);
    });

    const nameInput = row.createEl('input', {
      cls: 'bamboo-ai-plan-item-name',
      attr: { value: itemEntry.item.name, placeholder: '子项名' },
    });
    nameInput.addEventListener('input', () => {
      itemEntry.item.name = nameInput.value.trim() || `子项${ii + 1}`;
      unitChip.setText(extractUnit(nameInput.value));
    });

    // 每日量 = 标签 + 数字 + 单位 chip（一体边框）。节奏默认 daily，标题已含"每天"故不单列 chip
    if (!itemEntry.item.taskDayType) itemEntry.item.taskDayType = 'daily';
    const dailyWrap = row.createDiv({ cls: 'bamboo-ai-plan-item-daily' });
    dailyWrap.createSpan({ text: '每日量', cls: 'bamboo-ai-plan-item-label' });
    const dailyInput = dailyWrap.createEl('input', {
      cls: 'bamboo-ai-plan-item-daily-input',
      attr: { value: itemEntry.item.dailyMin ?? '', placeholder: '数字', type: 'text', inputmode: 'decimal' },
    });
    const unitChip = dailyWrap.createSpan({ cls: 'bamboo-ai-plan-item-unit-chip' });
    unitChip.setText(extractUnit(itemEntry.item.name));
    // 不可量化提示：明确告诉用户「删除或改写」，而不是只红框
    const dailyWarn = row.createEl('div', {
      cls: 'bamboo-ai-plan-item-warn',
      text: '⚠ 不可量化，建议删除或改写为可计数动作',
    });
    const markDaily = () => {
      const quantified = /^\d+(\.\d+)?$/.test((itemEntry.item.dailyMin ?? '').trim());
      dailyWrap.toggleClass('bamboo-ai-plan-item-no-daily', !quantified);
      dailyWarn.toggleClass('bamboo-ai-plan-item-warn-show', !quantified);
    };
    markDaily();
    dailyInput.addEventListener('input', () => {
      itemEntry.item.dailyMin = dailyInput.value.trim();
      markDaily();
      this.refreshThinBadge(parent.closest('.bamboo-ai-plan-goal') as HTMLElement, entry);
    });

    // AI reason（灰色小字，不持久化）
    if (itemEntry.item.detail) {
      row.createEl('div', {
        text: `AI：${itemEntry.item.detail}`,
        cls: 'bamboo-ai-plan-item-reason',
      });
    }
  }

  private confirm(): void {
    const finalGoals: GoalItem[] = [];
    for (const entry of this.entries) {
      if (!entry.keep) continue;
      const keptItems: GoalSubItem[] = entry.items
        .filter((it) => it.keep)
        .map((it) => {
          // 剔除 reason/detail（不持久化）；保留其它可落地字段
          const { detail: _detail, ...rest } = it.item;
          return rest;
        });
      finalGoals.push({ ...entry.goal, items: keptItems });
    }

    if (finalGoals.length === 0) {
      new Notice('未保留任何目标，已取消写入');
      this.close();
      return;
    }
    this.onConfirm(finalGoals);
    this.close();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
