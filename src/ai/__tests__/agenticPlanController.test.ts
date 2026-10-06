import { describe, it, expect, vi } from 'vitest';
import { AgenticPlanController, type AgenticPlanOptions } from '../AgenticPlanController';
import type { GoalItem } from '../../types/data';

const settings = { aiApiKey: 'k', aiBaseUrl: 'https://x', aiModel: 'm', aiDecomposeDepth: '中' as const };

function makeCtrl(opts: Partial<AgenticPlanOptions> = {}): AgenticPlanController {
  const full: AgenticPlanOptions = {
    content: '',
    scope: 'note',
    settings,
    onConfirm: () => {},
    ...opts,
  };
  return new AgenticPlanController(full);
}

describe('AgenticPlanController.onDismiss 原因透传（任务②）', () => {
  it('requestClose("confirm") 透传 reason=confirm', () => {
    const c = makeCtrl();
    const onDismiss = vi.fn();
    c.onDismiss = onDismiss;
    (c as unknown as { requestClose: (r: 'confirm' | 'cancel') => void }).requestClose('confirm');
    expect(onDismiss).toHaveBeenCalledWith('confirm');
  });

  it('requestClose() 默认 reason=cancel', () => {
    const c = makeCtrl();
    const onDismiss = vi.fn();
    c.onDismiss = onDismiss;
    (c as unknown as { requestClose: () => void }).requestClose();
    expect(onDismiss).toHaveBeenCalledWith('cancel');
  });

  it('confirm() 有保留目标 → onConfirm 被调用且 reason=confirm', () => {
    const c = makeCtrl({ goals: [{ id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] }] });
    const onDismiss = vi.fn();
    const onConfirm = vi.fn();
    c.onDismiss = onDismiss;
    (c as unknown as { opts: AgenticPlanOptions }).opts.onConfirm = onConfirm;
    // 直接注入已载入的工作副本（绕过 mount 的 DOM 依赖）
    (c as unknown as { entries: unknown[] }).entries = [
      {
        goal: { id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] },
        items: [{ item: { name: '跑步', dailyMin: '30' }, keep: true }],
        keep: true,
      },
    ];
    (c as unknown as { confirm: () => void }).confirm();
    expect(onConfirm).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledWith('confirm');
  });

  it('confirm() 无保留目标 → 不落库且 reason=cancel', () => {
    const c = makeCtrl();
    const onDismiss = vi.fn();
    const onConfirm = vi.fn();
    c.onDismiss = onDismiss;
    (c as unknown as { opts: AgenticPlanOptions }).opts.onConfirm = onConfirm;
    (c as unknown as { entries: unknown[] }).entries = [];
    (c as unknown as { confirm: () => void }).confirm();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledWith('cancel');
  });
});

// ---------------------------------------------------------------------------
// 自 AgenticPlanModal 薄壳删除后迁入（原先这些断言挂在那个壳上，但壳只是把 .session 透传给
// 本 controller、再调本 controller 的 initPlan()，被测行为一直在这里）。
// 壳删除后 initPlan 的覆盖不能净丢：此处直接注入会话替身 + 调 initPlan()。
// 注意 initPlan 内部的 rebuildTree/renderChat/pushChat/setSending 都有 `if (!el) return` 守卫，
// 故未挂载 DOM 时调用安全（与本文件其余用例「绕过 mount 的 DOM 依赖」同一手法）。
// ---------------------------------------------------------------------------
const existingTree: GoalItem[] = [{ id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] }];

function makeCtrlWithSession(opts: Partial<AgenticPlanOptions> = {}) {
  const c = makeCtrl(opts);
  const session = {
    init: vi.fn().mockResolvedValue([{ id: 'g1', title: '减重' }]),
    loadGoals: vi.fn(),
    send: vi.fn().mockResolvedValue({ reply: 'ok', goals: [{ id: 'g1', title: '减重' }] }),
    goals: [],
  };
  (c as unknown as { session: typeof session }).session = session;
  return { c, session };
}

describe('AgenticPlanController.initPlan（编辑现有树模式）', () => {
  it('提供 goals → 走 loadGoals 而非 init', async () => {
    const { c, session } = makeCtrlWithSession({ goals: existingTree });
    await c.initPlan();
    expect(session.loadGoals).toHaveBeenCalledWith(existingTree);
    expect(session.init).not.toHaveBeenCalled();
  });

  it('goals + initialInstruction → 自动 send 该指令', async () => {
    const { c, session } = makeCtrlWithSession({ goals: existingTree, initialInstruction: '把跑步降到 15' });
    await c.initPlan();
    expect(session.send).toHaveBeenCalledWith('把跑步降到 15');
  });

  it('无 goals → 走原 init（笔记拆解）', async () => {
    const { c, session } = makeCtrlWithSession({});
    await c.initPlan();
    expect(session.init).toHaveBeenCalled();
    expect(session.loadGoals).not.toHaveBeenCalled();
  });

  it('有 goals 但无 initialInstruction → 不自动 send', async () => {
    const { c, session } = makeCtrlWithSession({ goals: existingTree });
    await c.initPlan();
    expect(session.send).not.toHaveBeenCalled();
  });

  it('initialInstruction 且 send 失败 → 不抛错（捕获并提示）', async () => {
    const { c, session } = makeCtrlWithSession({ goals: existingTree, initialInstruction: 'x' });
    session.send = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(c.initPlan()).resolves.toBeUndefined();
  });
});
