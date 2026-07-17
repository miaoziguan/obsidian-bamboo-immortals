/**
 * AgenticPlanModal — 对话式规划审阅台（Phase 4，弹窗形态）
 *
 * 薄壳：全部 UI 逻辑已抽到 AgenticPlanController，本类只负责把控制器
 * 挂到 Modal 的 contentEl 上，并在关闭时卸载。
 * 中央窗口形态见 views/PlanEditorView。
 *
 * 保留本类是为了兼容既有（测试）对 `new AgenticPlanModal(app, opts)`、
 * `.session` 注入与 `.initPlan()` 的调用约定。
 */

import { Modal, App } from 'obsidian';
import type { PlanningSession } from './PlanningSession';
import {
  AgenticPlanController,
  type AgenticPlanOptions,
} from './AgenticPlanController';

export type { AgenticPlanOptions } from './AgenticPlanController';

export class AgenticPlanModal extends Modal {
  private ctrl: AgenticPlanController;

  constructor(app: App, opts: AgenticPlanOptions) {
    super(app);
    this.ctrl = new AgenticPlanController(opts);
  }

  onOpen(): void {
    this.ctrl.mount(this.contentEl, 'modal');
  }

  onClose(): void {
    this.ctrl.unmount();
    this.contentEl.empty();
  }

  // —— 兼容测试：透传 session 注入 / initPlan 调用 ——
  get session(): PlanningSession {
    return this.ctrl.session;
  }
  set session(v: PlanningSession) {
    this.ctrl.session = v;
  }
  initPlan(): Promise<void> {
    return this.ctrl.initPlan();
  }
}
