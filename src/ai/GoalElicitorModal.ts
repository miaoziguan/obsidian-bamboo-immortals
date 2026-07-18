/* eslint-disable obsidianmd/prefer-create-el -- bot 误报：本文件全部使用 Obsidian 官方 createEl 助手，已是该规则鼓励写法；src/ 内无 document.createElement */
/**
 * GoalElicitorModal — Layer 0 意图澄清弹窗（压力测试 + 苏格拉底追问循环）
 *
 * 形态：对话式澄清台（非审阅、非表单）。
 *  - 第一轮：AI 对原始意图做压力测试，给出缺口（disease）+ 1-2 个苏格拉底追问；
 *  - 用户回答 → 重新评估，直到 diseases 为空（通过）或用户「强制跳过」；
 *  - 通过/跳过：渲染「目标简报」卡片，点「据此继续规划」把简报交给下游拆解器。
 *
 * 设计对齐现有 Modal 范式（PlanConfirmModal / DiagnosisModal）：
 *  - 主题色 var(--interactive-accent)、圆角 10-12px、8pt 网格；
 *  - 纯函数逻辑（buildElicitPrompt / parseElicitation / briefToPlanningText）已抽到 GoalElicitor，
 *    本类只负责 UI 编排与状态机。
 *
 * 坏 JSON / AI 失败：状态行提示 + 「重试」按钮，不崩。
 */

import { Modal, App, Notice } from 'obsidian';
import {
  elicitGoal,
  briefToPlanningText,
  splitGoals,
  type ElicitSettings,
  type ElicitTurn,
  type ElicitationResult,
} from './GoalElicitor';
import { DISEASE_LABEL } from './GoalElicitor';
import { selectFramework, FRAMEWORKS, FRAMEWORK_IDS, type FrameworkType } from './frameworks';
import type {
  BriefQuestion,
  DiseaseType,
  GoalBrief,
  GoalKind,
} from '../types/data';

const KIND_LABEL: Record<GoalKind, string> = {
  habit: '习惯型',
  project: '项目型',
  creative: '创作型',
  vision: '愿景型',
  borrowed: '借来型',
  unclear: '未判定',
};

export interface GoalElicitorOptions {
  rawIntent: string;
  settings: ElicitSettings;
  /** 通过或强制跳过后，把「目标简报数组 + 各自选定框架」交给调用方（转去下游规划） */
  onConfirm: (briefs: GoalBrief[], frameworks: FrameworkType[]) => void;
}

export class GoalElicitorModal extends Modal {
  private opts: GoalElicitorOptions;
  private round = 1;
  /** 累计问答（带答案），用于构建最终简报 */
  private qa: BriefQuestion[] = [];
  /** 传给 AI 的对话历史（{q,a} 列表） */
  private turns: ElicitTurn[] = [];
  /** 最近一次 AI 结果（通过时取其结构化字段） */
  private lastResult?: ElicitationResult;
  /** 防重复提交 */
  private loading = false;
  /** 当前展示的目标简报（支持单/多目标） */
  private briefs: GoalBrief[] = [];
  /** 与 briefs 对齐的框架选择（默认按各自 goalKind 自动选） */
  private chosen: FrameworkType[] = [];
  /** 拆分前的单目标简报（用于「合并回单目标」） */
  private singleBrief?: GoalBrief;
  /** 是否处于多目标视图 */
  private multi = false;

  constructor(app: App, opts: GoalElicitorOptions) {
    super(app);
    this.opts = opts;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bamboo-elicit-modal');

    contentEl.createEl('h2', { text: 'AI 目标澄清' });
    contentEl.createEl('p', {
      text: '在拆解之前，先确认这个目标是否具体、自属、有承诺。AI 会做压力测试并追问缺口——这比直接拆解更重要。',
      cls: 'bamboo-elicit-desc',
    });

    // 原始意图原文（只读展示）
    const rawWrap = contentEl.createDiv({ cls: 'bamboo-elicit-raw' });
    rawWrap.createSpan({ text: '原始意图：', cls: 'bamboo-elicit-raw-label' });
    rawWrap.createSpan({ text: this.opts.rawIntent, cls: 'bamboo-elicit-raw-text' });

    // 状态行（分析中 / 错误）
    contentEl.createEl('div', { cls: 'bamboo-elicit-status' });

    // 主体（问答 / 简报 动态渲染）
    contentEl.createDiv({ cls: 'bamboo-elicit-body' });

    void this.runRound();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  // ---------- 状态机 ----------

  /** 调用 AI 跑一轮压力测试（带重试由 GoalElicitor 内部负责） */
  private async runRound(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    const status = this.contentEl.querySelector('.bamboo-elicit-status') as HTMLElement;
    const body = this.contentEl.querySelector('.bamboo-elicit-body') as HTMLElement;
    if (status) {
      status.empty();
      status.setText('AI 分析中…');
      status.addClass('bamboo-elicit-status-loading');
    }
    if (body) body.empty();

    try {
      const result = await elicitGoal(
        this.opts.rawIntent,
        this.opts.settings,
        undefined,
        this.round === 1 ? undefined : this.turns
      );
      this.lastResult = result;
      if (status) {
        status.empty();
        status.removeClass('bamboo-elicit-status-loading');
      }
      if (result.diseases.length === 0) {
        const b = this.buildBrief('clarified');
        this.showBriefs([b], { single: b });
      } else {
        this.renderQuestions(result);
      }
    } catch (e) {
      this.loading = false;
      if (status) {
        status.removeClass('bamboo-elicit-status-loading');
        status.empty();
        status.createSpan({
          text: `澄清失败：${e instanceof Error ? e.message : '未知错误'}`,
          cls: 'bamboo-elicit-status-error',
        });
        const retry = status.createEl('button', {
          text: '重试',
          cls: 'bamboo-elicit-btn bamboo-elicit-btn-ghost',
        });
        retry.addEventListener('click', () => {
          this.loading = false;
          void this.runRound();
        });
      }
      return;
    }
    this.loading = false;
  }

  /** 渲染追问（每轮 1-2 题，带 disease 标签 + 输入框） */
  private renderQuestions(result: ElicitationResult): void {
    const body = this.contentEl.querySelector('.bamboo-elicit-body') as HTMLElement;
    if (!body) return;
    body.empty();

    if (result.summary) {
      body.createEl('p', {
        text: `AI 归纳：${result.summary}`,
        cls: 'bamboo-elicit-summary',
      });
    }

    // 缺口标签行
    const tags = body.createDiv({ cls: 'bamboo-elicit-tags' });
    tags.createSpan({ text: `第 ${this.round} 轮 · 待补齐：`, cls: 'bamboo-elicit-tags-label' });
    for (const d of result.diseases) {
      tags.createSpan({ text: DISEASE_LABEL[d], cls: 'bamboo-elicit-tag' });
    }

    // 问题列表（记录输入框引用，提交时读取）
    const inputs: { q: BriefQuestion; el: HTMLTextAreaElement }[] = [];
    const list = body.createDiv({ cls: 'bamboo-elicit-questions' });
    for (const q of result.questions) {
      const item = list.createDiv({ cls: 'bamboo-elicit-q' });
      item.createSpan({
        text: DISEASE_LABEL[q.disease],
        cls: 'bamboo-elicit-q-disease',
      });
      item.createEl('label', { text: q.question, cls: 'bamboo-elicit-q-text' });
      const ta = item.createEl('textarea', {
        cls: 'bamboo-elicit-q-input',
        attr: { rows: '2', placeholder: '写下你的回答…' },
      });
      inputs.push({ q, el: ta });
    }

    // 底部操作
    const footer = body.createDiv({ cls: 'bamboo-elicit-footer' });
    const skip = footer.createEl('button', {
      text: '跳过并强制提交',
      cls: 'bamboo-elicit-btn bamboo-elicit-btn-ghost',
      attr: { title: '不补齐缺口，直接以当前信息继续（简报会标注 forced）' },
    });
    skip.addEventListener('click', () => {
      // 把已填的回答也收进简报
      for (const { q, el } of inputs) {
        const a = el.value.trim();
        if (a) {
          q.answer = a;
          this.qa.push({ ...q });
          this.turns.push({ q: q.question, a });
        }
      }
      const b = this.buildBrief('forced');
      this.showBriefs([b], { single: b });
    });

    const submit = footer.createEl('button', {
      text: '提交回答',
      cls: 'bamboo-elicit-btn bamboo-elicit-btn-primary',
    });
    submit.addEventListener('click', () => {
      if (this.loading) return;
      // 收集本轮已填回答
      const answered = inputs.filter(({ el }) => el.value.trim());
      if (answered.length === 0) {
        new Notice('请至少回答一个问题，或选择「跳过并强制提交」');
        return;
      }
      for (const { q, el } of answered) {
        const a = el.value.trim();
        q.answer = a;
        this.qa.push({ ...q });
        this.turns.push({ q: q.question, a });
      }
      this.round += 1;
      void this.runRound();
    });
  }

  /** 进入「简报」态：设置单/多目标状态并渲染 */
  private showBriefs(briefs: GoalBrief[], opts?: { multi?: boolean; single?: GoalBrief }): void {
    this.briefs = briefs;
    this.chosen = briefs.map((b) => selectFramework(b));
    this.multi = opts?.multi ?? false;
    if (opts?.single) this.singleBrief = opts.single;
    this.renderBriefs();
  }

  /** 渲染目标简报（支持单/多目标，每张卡独立框架选择） */
  private renderBriefs(): void {
    const body = this.contentEl.querySelector('.bamboo-elicit-body') as HTMLElement;
    if (!body) return;
    body.empty();

    const primary = this.briefs[0];
    if (!primary) return;
    const ok = primary.reliabilityStatus === 'clarified';
    body.createEl('h3', {
      text: ok ? '✓ 目标已澄清' : '⚠ 已强制提交（未完全澄清）',
      cls: ok ? 'bamboo-elicit-brief-title-ok' : 'bamboo-elicit-brief-title-warn',
    });

    // 单目标且未拆分：提供「拆分为多个目标」入口（Phase 5）
    if (!this.multi && this.briefs.length === 1) {
      const splitBtn = body.createEl('button', {
        text: '↧ 这篇其实包含多个目标？拆成多个',
        cls: 'bamboo-elicit-btn bamboo-elicit-btn-ghost bamboo-elicit-split',
      });
      splitBtn.addEventListener('click', () => void this.doSplit());
    }

    // 逐条目标卡片（每张带各自框架选择器）
    this.briefs.forEach((brief, gi) => this.renderBrief(brief, gi));

    // 多目标时各卡继承自同一份问答，这里只展示一次
    if (!this.multi && primary.questions.length > 0) {
      const qaWrap = body.createDiv({ cls: 'bamboo-elicit-brief-qa' });
      qaWrap.createEl('div', { text: '澄清问答：', cls: 'bamboo-elicit-brief-label' });
      for (const q of primary.questions) {
        if (!q.answer) continue;
        qaWrap.createEl('div', { text: `· 问：${q.question}`, cls: 'bamboo-elicit-brief-qa-q' });
        qaWrap.createEl('div', { text: `  答：${q.answer}`, cls: 'bamboo-elicit-brief-qa-a' });
      }
    }

    // 底部操作
    const footer = body.createDiv({ cls: 'bamboo-elicit-footer' });
    const copy = footer.createEl('button', {
      text: '复制简报',
      cls: 'bamboo-elicit-btn bamboo-elicit-btn-ghost',
    });
    copy.addEventListener('click', () => {
      void (async () => {
        try {
          const all = this.briefs.map((b) => briefToPlanningText(b)).join('\n\n');
          await navigator.clipboard.writeText(all);
          new Notice('已复制目标简报到剪贴板');
        } catch {
          new Notice('复制失败，请手动选择文本复制');
        }
      })();
    });

    const again = footer.createEl('button', {
      text: '重新澄清',
      cls: 'bamboo-elicit-btn bamboo-elicit-btn-ghost',
    });
    again.addEventListener('click', () => {
      this.round = 1;
      this.qa = [];
      this.turns = [];
      this.lastResult = undefined;
      this.briefs = [];
      this.chosen = [];
      this.singleBrief = undefined;
      this.multi = false;
      void this.runRound();
    });

    if (this.multi) {
      const merge = footer.createEl('button', {
        text: '合并回单目标',
        cls: 'bamboo-elicit-btn bamboo-elicit-btn-ghost',
      });
      merge.addEventListener('click', () => {
        if (this.singleBrief) this.showBriefs([this.singleBrief]);
      });
    }

    const go = footer.createEl('button', {
      text: this.briefs.length > 1 ? `据此继续规划（${this.briefs.length} 个目标）` : '据此继续规划',
      cls: 'bamboo-elicit-btn bamboo-elicit-btn-primary',
    });
    go.addEventListener('click', () => {
      this.opts.onConfirm(this.briefs.slice(), this.chosen.slice());
      this.close();
    });
  }

  /** 渲染单张目标卡片（字段 + 各自框架选择器 + 多目标可删除） */
  private renderBrief(brief: GoalBrief, gi: number): void {
    const body = this.contentEl.querySelector('.bamboo-elicit-body') as HTMLElement;
    if (!body) return;
    const card = body.createDiv({ cls: 'bamboo-elicit-brief' });
    if (this.briefs.length > 1) {
      card.createEl('div', { text: `目标 ${gi + 1}`, cls: 'bamboo-elicit-brief-idx' });
    }
    const field = (label: string, value?: string) => {
      if (!value) return;
      const row = card.createDiv({ cls: 'bamboo-elicit-brief-row' });
      row.createSpan({ text: label, cls: 'bamboo-elicit-brief-label' });
      row.createSpan({ text: value, cls: 'bamboo-elicit-brief-value' });
    };
    if (brief.goalKind) {
      field('类型分诊', KIND_LABEL[brief.goalKind]);
    }
    field('具体成果', brief.clarifiedOutcome);
    field('成功口径', brief.successMeasure);
    field('可控抓手', brief.ownedSlice);
    field('约束（期限/资源）', brief.constraints);
    field('领域', brief.domain);

    // ----- Layer A：该目标各自的拆解框架（Phase 3 + 多目标 Phase 5）-----
    const chosen = this.chosen[gi] ?? selectFramework(brief);
    const fwWrap = card.createDiv({ cls: 'bamboo-elicit-framework' });
    fwWrap.createSpan({ text: '拆解框架：', cls: 'bamboo-elicit-framework-label' });
    const fwSel = fwWrap.createEl('select', { cls: 'bamboo-elicit-framework-select' });
    for (const id of FRAMEWORK_IDS) {
      const opt = fwSel.createEl('option', { text: FRAMEWORKS[id].label, value: id });
      if (id === chosen) opt.selected = true;
    }
    const fwDesc = fwWrap.createEl('div', {
      text: FRAMEWORKS[chosen].description,
      cls: 'bamboo-elicit-framework-desc',
    });
    fwSel.addEventListener('change', () => {
      this.chosen[gi] = fwSel.value as FrameworkType;
      fwDesc.setText(FRAMEWORKS[this.chosen[gi]].description);
    });

    if (this.multi && this.briefs.length > 1) {
      const del = card.createEl('button', {
        text: '删除此目标',
        cls: 'bamboo-elicit-btn bamboo-elicit-btn-ghost bamboo-elicit-brief-del',
      });
      del.addEventListener('click', () => {
        this.briefs = this.briefs.filter((_, i) => i !== gi);
        this.chosen = this.chosen.filter((_, i) => i !== gi);
        if (this.briefs.length === 0) this.multi = false;
        this.renderBriefs();
      });
    }
  }

  /** 把当前单目标简报拆成多个独立目标（Phase 5） */
  private async doSplit(): Promise<void> {
    if (!this.singleBrief || this.loading) return;
    this.loading = true;
    const status = this.contentEl.querySelector('.bamboo-elicit-status') as HTMLElement;
    const body = this.contentEl.querySelector('.bamboo-elicit-body') as HTMLElement;
    if (status) {
      status.empty();
      status.setText('AI 正在拆分目标…');
      status.addClass('bamboo-elicit-status-loading');
    }
    if (body) body.empty();
    try {
      const split = await splitGoals(this.singleBrief, this.opts.settings);
      if (split.length === 0) throw new Error('拆分结果为空');
      // 拆分出多条：用各自 goalKind 重选框架，进入多目标视图
      this.showBriefs(split, { multi: true, single: this.singleBrief });
    } catch (e) {
      new Notice(e instanceof Error ? e.message : '目标拆分失败');
      // 回退到原单目标视图，不阻断流程
      if (this.singleBrief) this.showBriefs([this.singleBrief]);
    } finally {
      this.loading = false;
      if (status) {
        status.empty();
        status.removeClass('bamboo-elicit-status-loading');
      }
    }
  }

  /** 由最近一轮结果 + 累计问答构建目标简报 */
  private buildBrief(status: 'clarified' | 'forced'): GoalBrief {
    const r = this.lastResult;
    return {
      rawIntent: this.opts.rawIntent,
      goalKind: r?.goalKind,
      clarifiedOutcome: r?.clarifiedOutcome,
      successMeasure: r?.successMeasure,
      ownedSlice: r?.ownedSlice,
      constraints: r?.constraints,
      domain: r?.domain,
      reliabilityStatus: status,
      diseases: status === 'forced' ? this.pendingDiseases() : [],
      questions: this.qa.slice(),
      summary: r?.summary,
      round: this.round,
    };
  }

  /** 强制跳过时，把「尚未补齐」的 disease 记录下来（取最近一轮的缺口） */
  private pendingDiseases(): DiseaseType[] {
    return (this.lastResult?.diseases ?? []).slice();
  }
}
