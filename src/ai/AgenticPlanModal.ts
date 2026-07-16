/**
 * AgenticPlanModal — 对话式规划审阅台（Phase 4）
 *
 * 在 Phase3 PlanConfirmModal 的树状审阅基础上，右侧加一个对话区：
 *  - 左：可编辑目标树（工作副本），AI 每轮返回全量 goals 后实时刷新 + diff 高亮；
 *  - 右：自然语言对话，用户说"去掉X / 加Y / 把Z改成一三五"，AI 打磨规划；
 *  - 手动编辑直接作用到工作副本，并通过 session.applyLocalEdit 写入对话历史，
 *    防止 AI 下轮把用户手动改动覆盖回去；
 *  - 顶部「重置初版」回到 AI 首版；底部「写入目标」确认落库。
 *
 * 持有 PlanningSession（纯逻辑、零 Obsidian 依赖），自身只负责 UI 编排。
 */

import { Modal, App, Notice } from 'obsidian';
import {
  GOAL_CATEGORIES,
  type GoalItem,
  type GoalSubItem,
  type GoalCategory,
} from '../types/data';
import { classifyCompleteness, extractUnit } from './GoalCardValidator';
import { PlanningSession } from './PlanningSession';
import type { PlannerSettings } from './MarkdownPlanner';

interface ItemEntry {
  item: GoalSubItem;
  keep: boolean;
}
interface GoalEntry {
  goal: GoalItem;
  items: ItemEntry[];
  keep: boolean;
}

export interface AgenticPlanOptions {
  content: string;
  scope: 'note' | 'selection';
  settings: PlannerSettings;
  subtitle?: string;
  onConfirm: (goals: GoalItem[]) => void;
  /** 提供时：以「编辑现有树」模式打开（走 session.loadGoals 而非 init） */
  goals?: GoalItem[];
  /** 载入后自动作为指令发送给 AI（用于「应用诊断建议」预填） */
  initialInstruction?: string;
}

export class AgenticPlanModal extends Modal {
  private session: PlanningSession;
  private entries: GoalEntry[] = [];
  private subtitle?: string;
  private onConfirm: (goals: GoalItem[]) => void;
  private opts: AgenticPlanOptions;

  private listEl?: HTMLElement;
  private chatLogEl?: HTMLElement;
  private inputEl?: HTMLTextAreaElement;
  private sendBtn?: HTMLButtonElement;
  private footerCount?: HTMLElement;
  private chatLog: Array<{ role: 'user' | 'assistant'; text: string }> = [];
  private prevGoalTitles = new Set<string>();
  private prevItemKeys = new Set<string>();

  constructor(app: App, opts: AgenticPlanOptions) {
    super(app);
    this.subtitle = opts.subtitle;
    this.onConfirm = opts.onConfirm;
    this.opts = opts;
    this.session = new PlanningSession(opts.content, opts.settings, undefined, opts.scope);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bamboo-ai-plan-modal', 'bamboo-ai-agentic');

    contentEl.createEl('h2', { text: 'AI 规划助手 · 目标卡片审阅' });

    // 顶部操作：重置初版
    const topBar = contentEl.createDiv({ cls: 'bamboo-ai-agentic-topbar' });
    if (this.subtitle) {
      topBar.createEl('span', { text: this.subtitle, cls: 'bamboo-ai-plan-subtitle' });
    }
    const resetBtn = topBar.createEl('button', {
      text: '↺ 重置初版',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost',
    });
    resetBtn.addEventListener('click', () => this.onReset());

    contentEl.createEl('p', {
      text: '左侧核对/编辑目标，右侧用自然语言让 AI 增删改（如"去掉跑步""加每周游泳3次"）。确认后写入目标库。',
      cls: 'bamboo-ai-plan-desc',
    });

    // 主体：左树 + 右对话
    const body = contentEl.createDiv({ cls: 'bamboo-ai-agentic-body' });

    const left = body.createDiv({ cls: 'bamboo-ai-agentic-left' });
    this.listEl = left.createDiv({ cls: 'bamboo-ai-plan-list' });

    const right = body.createDiv({ cls: 'bamboo-ai-agentic-right' });
    this.chatLogEl = right.createDiv({ cls: 'bamboo-ai-chat' });
    const composer = right.createDiv({ cls: 'bamboo-ai-chat-composer' });
    this.inputEl = composer.createEl('textarea', {
      cls: 'bamboo-ai-chat-input',
      attr: { placeholder: '说点什么，如"把跑步去掉，换成游泳"…', rows: '2' },
    });
    this.sendBtn = composer.createEl('button', {
      text: '发送',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-primary',
    });
    this.sendBtn.addEventListener('click', () => void this.onSend());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void this.onSend();
      }
    });

    // 底部
    const footer = contentEl.createDiv({ cls: 'bamboo-ai-plan-footer' });
    footer.createEl('button', {
      text: '取消',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost',
    }).addEventListener('click', () => this.close());
    const writeBtn = footer.createEl('button', {
      text: '写入目标',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-primary',
    });
    writeBtn.addEventListener('click', () => this.confirm());
    this.footerCount = writeBtn;

    // 异步拉首版
    void this.initPlan();
  }

  private async initPlan(): Promise<void> {
    // 编辑现有树模式：载入真实目标树，不调 AI 拆解
    if (this.opts.goals) {
      this.session.loadGoals(this.opts.goals);
      this.chatLog = [{ role: 'assistant', text: '已载入你的现有目标树，可直接编辑或让我调整。' }];
      this.rebuildTree(false);
      this.renderChat();
      if (this.opts.initialInstruction) {
        const instruction = this.opts.initialInstruction;
        this.pushChat('user', instruction);
        this.setSending(true);
        try {
          const { reply } = await this.session.send(instruction);
          this.rebuildTree(true);
          this.pushChat('assistant', reply || '已应用建议。');
        } catch {
          this.pushChat('assistant', '⚠ 应用建议失败，请手动调整。');
        } finally {
          this.setSending(false);
        }
      }
      return;
    }

    this.pushChat('assistant', '⏳ AI 规划中…（正在拆解目标）');
    try {
      const goals = await this.session.init();
      if (goals.length === 0) {
        new Notice(
          'AI 未从笔记中识别出明确目标。\n试试这样的句式：「我想在 3 个月内减重 5kg，每天跑步 30 分钟、控制饮食」。'
        );
        this.close();
        return;
      }
      this.chatLog = [{ role: 'assistant', text: `已从笔记识别出 ${goals.length} 个目标，可直接编辑或让我调整。` }];
      this.rebuildTree(false);
      this.renderChat();
    } catch (e) {
      new Notice(e instanceof Error ? e.message : 'AI 规划失败');
      this.close();
    }
  }

  private async onSend(): Promise<void> {
    const input = this.inputEl;
    const text = input?.value.trim();
    if (!text || !this.sendBtn || !input) return;
    input.value = '';
    this.pushChat('user', text);
    this.setSending(true);
    try {
      const { reply, goals } = await this.session.send(text);
      this.rebuildTree(true);
      this.pushChat('assistant', reply || '已更新规划。');
      void goals;
    } catch {
      this.pushChat('assistant', '⚠ 没听懂，换个说法试试（当前规划未改动）。');
    } finally {
      this.setSending(false);
    }
  }

  private onReset(): void {
    this.session.reset();
    this.rebuildTree(false);
    this.pushChat('assistant', '↺ 已重置为 AI 初版。');
  }

  private setSending(on: boolean): void {
    if (this.sendBtn) this.sendBtn.disabled = on;
    if (this.inputEl) this.inputEl.disabled = on;
  }

  private pushChat(role: 'user' | 'assistant', text: string): void {
    this.chatLog.push({ role, text });
    this.renderChat();
  }

  private renderChat(): void {
    if (!this.chatLogEl) return;
    this.chatLogEl.empty();
    for (const m of this.chatLog) {
      const bubble = this.chatLogEl.createDiv({
        cls: `bamboo-ai-chat-bubble bamboo-ai-chat-${m.role}`,
      });
      bubble.setText(m.text);
      this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
    }
  }

  /** 依据 session.goals 重建左树；highlight=true 时对新出现的目标/子项打高亮 */
  private rebuildTree(highlight: boolean): void {
    if (!this.listEl) return;
    const prevGoals = this.prevGoalTitles;
    const prevItems = this.prevItemKeys;

    this.entries = this.session.goals.map((goal) => ({
      goal,
      keep: true,
      items: (goal.items ?? []).map((item) => ({ item, keep: true })),
    }));

    const list = this.listEl;
    list.empty();
    this.entries.forEach((entry, gi) => {
      const isNewGoal = highlight && !prevGoals.has(entry.goal.title);
      this.renderGoal(list, entry, gi, isNewGoal, highlight, prevItems);
    });

    this.prevGoalTitles = new Set(this.session.goals.map((g) => g.title));
    this.prevItemKeys = new Set(
      this.session.goals.flatMap((g) => (g.items ?? []).map((it) => `${g.title}::${it.name}`))
    );
    this.updateFooter();
  }

  private renderGoal(
    parent: HTMLElement,
    entry: GoalEntry,
    gi: number,
    isNewGoal: boolean,
    highlight: boolean,
    prevItems: Set<string>
  ): void {
    const card = parent.createDiv({ cls: 'bamboo-ai-plan-goal' });
    if (isNewGoal) card.addClass('bamboo-ai-plan-goal-updated');

    const head = card.createDiv({ cls: 'bamboo-ai-plan-goal-head' });

    const titleInput = head.createEl('input', {
      cls: 'bamboo-ai-plan-goal-title',
      attr: { value: entry.goal.title, placeholder: '目标标题' },
    });
    titleInput.addEventListener('input', () => {
      entry.goal.title = titleInput.value.trim() || `目标${gi + 1}`;
    });
    titleInput.addEventListener('change', () => {
      this.session.applyLocalEdit(`目标改名为「${entry.goal.title}」`);
    });

    if (entry.goal.analysis) {
      head.createEl('div', {
        text: `AI 分析：${entry.goal.analysis}`,
        cls: 'bamboo-ai-plan-analysis',
      });
    }

    const catSelect = head.createEl('select', { cls: 'bamboo-ai-plan-cat' });
    GOAL_CATEGORIES.forEach((c) => {
      const opt = catSelect.createEl('option', { text: `${c.icon} ${c.name}`, value: c.id });
      if (c.id === entry.goal.category) opt.selected = true;
    });
    catSelect.addEventListener('change', () => {
      entry.goal.category = catSelect.value as GoalCategory;
      this.session.applyLocalEdit(`目标「${entry.goal.title}」领域改为 ${catSelect.value}`);
      this.refreshThinBadge(card, entry);
    });

    const startWrap = head.createDiv({ cls: 'bamboo-ai-plan-daterange' });
    const startInput = startWrap.createEl('input', {
      cls: 'bamboo-ai-plan-daterange-input',
      attr: { type: 'date', value: entry.goal.startDate ?? '' },
    });
    startInput.addEventListener('change', () => {
      entry.goal.startDate = startInput.value;
      this.session.applyLocalEdit(`目标「${entry.goal.title}」开始日改为 ${startInput.value}`);
    });
    startWrap.createSpan({ text: '—', cls: 'bamboo-ai-plan-daterange-sep' });
    const endInput = startWrap.createEl('input', {
      cls: 'bamboo-ai-plan-daterange-input',
      attr: { type: 'date', value: entry.goal.endDate ?? '' },
    });
    endInput.addEventListener('change', () => {
      entry.goal.endDate = endInput.value;
      this.session.applyLocalEdit(`目标「${entry.goal.title}」截止日改为 ${endInput.value}`);
      this.refreshThinBadge(card, entry);
    });

    card.createDiv({ cls: 'bamboo-ai-plan-badge' });
    this.refreshThinBadge(card, entry);

    const del = head.createEl('button', {
      text: '✕',
      cls: 'bamboo-ai-plan-del',
      attr: { title: '删除该目标' },
    });
    del.addEventListener('click', () => {
      entry.keep = false;
      card.toggleClass('bamboo-ai-plan-goal-removed', true);
      this.session.applyLocalEdit(`删除了目标「${entry.goal.title}」`);
      this.updateFooter();
    });

    const itemsWrap = card.createDiv({ cls: 'bamboo-ai-plan-items' });
    (entry.goal.items ?? []).forEach((_, ii) => {
      const itemEntry = entry.items[ii];
      if (!itemEntry) return;
      const isNewItem = highlight && !prevItems.has(`${entry.goal.title}::${itemEntry.item.name}`);
      this.renderItem(itemsWrap, entry, itemEntry, ii, isNewItem);
    });
  }

  private refreshThinBadge(card: HTMLElement, entry: GoalEntry): void {
    const badge = card.querySelector('.bamboo-ai-plan-badge') as HTMLElement | null;
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
    ii: number,
    isNewItem: boolean
  ): void {
    const row = parent.createDiv({ cls: 'bamboo-ai-plan-item' });
    if (isNewItem) row.addClass('bamboo-ai-plan-item-updated');

    const cb = row.createEl('input', { type: 'checkbox', cls: 'bamboo-ai-plan-item-cb' });
    cb.checked = itemEntry.keep;
    cb.addEventListener('change', () => {
      itemEntry.keep = cb.checked;
      row.toggleClass('bamboo-ai-plan-item-off', !cb.checked);
      this.session.applyLocalEdit(
        `${cb.checked ? '保留' : '删除'}子项「${itemEntry.item.name}」`
      );
      this.refreshThinBadge(parent.closest('.bamboo-ai-plan-goal') as HTMLElement, entry);
      this.updateFooter();
    });

    const nameInput = row.createEl('input', {
      cls: 'bamboo-ai-plan-item-name',
      attr: { value: itemEntry.item.name, placeholder: '子项名' },
    });
    nameInput.addEventListener('input', () => {
      itemEntry.item.name = nameInput.value.trim() || `子项${ii + 1}`;
      unitChip.setText(extractUnit(nameInput.value));
    });
    nameInput.addEventListener('change', () => {
      this.session.applyLocalEdit(`子项改名为「${itemEntry.item.name}」`);
    });

    if (!itemEntry.item.taskDayType) itemEntry.item.taskDayType = 'daily';
    const dailyWrap = row.createDiv({ cls: 'bamboo-ai-plan-item-daily' });
    dailyWrap.createSpan({ text: '每日量', cls: 'bamboo-ai-plan-item-label' });
    const dailyInput = dailyWrap.createEl('input', {
      cls: 'bamboo-ai-plan-item-daily-input',
      attr: { value: itemEntry.item.dailyMin ?? '', placeholder: '数字', type: 'text', inputmode: 'decimal' },
    });
    const unitChip = dailyWrap.createSpan({ cls: 'bamboo-ai-plan-item-unit-chip' });
    unitChip.setText(extractUnit(itemEntry.item.name));
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
    dailyInput.addEventListener('change', () => {
      this.session.applyLocalEdit(`子项「${itemEntry.item.name}」每日量改为 ${itemEntry.item.dailyMin}`);
    });

    if (itemEntry.item.detail) {
      row.createEl('div', {
        text: `AI：${itemEntry.item.detail}`,
        cls: 'bamboo-ai-plan-item-reason',
      });
    }
  }

  private updateFooter(): void {
    if (!this.footerCount) return;
    const n = this.entries.filter((e) => e.keep).length;
    this.footerCount.setText(`写入目标（${n}）`);
  }

  private confirm(): void {
    const finalGoals: GoalItem[] = [];
    for (const entry of this.entries) {
      if (!entry.keep) continue;
      const keptItems: GoalSubItem[] = entry.items
        .filter((it) => it.keep)
        .map((it) => {
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
