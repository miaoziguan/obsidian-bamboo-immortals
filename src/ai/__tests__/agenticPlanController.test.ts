import { describe, it, expect, vi } from 'vitest';
import { AgenticPlanController, type AgenticPlanOptions } from '../AgenticPlanController';

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
