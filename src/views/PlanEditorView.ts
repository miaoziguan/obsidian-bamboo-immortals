/**
 * PlanEditorView — 对话式规划审阅台（Phase 4，中央窗口形态）
 *
 * 与 AgenticPlanModal（弹窗形态）共用 AgenticPlanController：
 * 本视图只把控制器挂到 ItemView 的容器上，并接管「关闭请求」
 * （确认落库 / 点取消 / 出错时 → detach 本 leaf）。
 *
 * 占满整个编辑器区域，可像普通笔记一样停靠、分屏、关闭，
 * 不再受弹窗 1000px 宽度 / 视口高度约束。
 */

import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import {
  AgenticPlanController,
  type AgenticPlanOptions,
} from '../ai/AgenticPlanController';

export const VIEW_TYPE_PLAN_EDITOR = 'bamboo-plan-editor';

export class PlanEditorView extends ItemView {
  private ctrl?: AgenticPlanController;
  private opts?: AgenticPlanOptions;

  constructor(leaf: WorkspaceLeaf, opts?: AgenticPlanOptions) {
    super(leaf);
    this.opts = opts;
  }

  getViewType(): string {
    return VIEW_TYPE_PLAN_EDITOR;
  }

  getDisplayText(): string {
    return 'AI 规划台';
  }

  getIcon(): string {
    return 'leaf';
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async onClose(): Promise<void> {
    this.ctrl?.unmount();
    this.ctrl = undefined;
    this.opts = undefined;
  }

  /** 用新的 opts 重新挂载（复用已有 leaf 时调用，不新建标签页） */
  async reload(opts: AgenticPlanOptions): Promise<void> {
    this.opts = opts;
    await this.render();
  }

  private async render(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();

    // 遗留兜底：重启恢复时工厂拿不到 opts（pendingPlanOpts 为 undefined），
    // 渲染占位页而非空白，并提供一键关闭，避免留下无法交互的僵尸标签页。
    if (!this.opts) {
      this.renderLegacyPlaceholder(container);
      return;
    }

    this.ctrl = new AgenticPlanController(this.opts);
    this.ctrl.onDismiss = (reason) => {
      const leaf = this.leaf;
      if (reason === 'confirm') {
        // 中央窗口：确认落库后保留标签页，便于多轮打磨（手动关闭即可）
        new Notice('已写入目标库，可继续在规划台调整，或关闭此标签页。');
        return;
      }
      // 取消/失败：关闭本标签页（非强制 detach，交给 Obsidian 决定动画/历史）
      (leaf as unknown as { detach: () => void }).detach();
    };
    this.ctrl.mount(container, 'view');
  }

  /** 渲染「遗留标签页」占位页：说明 + 关闭按钮 */
  private renderLegacyPlaceholder(container: HTMLElement): void {
    container.addClass('bamboo-plan-editor-legacy');
    container.createEl('h2', { text: 'AI 规划台（遗留标签页）' });
    container.createEl('p', {
      text: '此标签页是上次会话遗留的空规划台，数据无法跨重启恢复，可安全关闭。',
      cls: 'bamboo-plan-editor-legacy-hint',
    });
    const btn = container.createEl('button', {
      text: '关闭此标签页',
      cls: 'bamboo-ai-plan-btn bamboo-ai-plan-btn-primary',
    });
    btn.addEventListener('click', () => {
      (this.leaf as unknown as { detach: () => void }).detach();
    });
  }
}
