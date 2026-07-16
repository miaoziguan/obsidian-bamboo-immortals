import { describe, it, expect, vi } from 'vitest';
import { AgenticPlanModal, type AgenticPlanOptions } from '../AgenticPlanModal';
import type { GoalItem } from '../../types/data';

const settings = { aiApiKey: 'k', aiBaseUrl: 'https://x', aiModel: 'm', aiDecomposeDepth: '中' as const };
const fakeApp: any = { workspace: {} };

const existingTree: GoalItem[] = [{ id: 'g1', title: '减重', items: [{ name: '跑步', dailyMin: '30' }] }];

function makeModal(opts: Partial<AgenticPlanOptions>) {
  const full: AgenticPlanOptions = {
    content: '',
    scope: 'note',
    settings,
    onConfirm: () => {},
    ...opts,
  };
  const modal = new AgenticPlanModal(fakeApp, full);
  const session = {
    init: vi.fn().mockResolvedValue([{ id: 'g1', title: '减重' }]),
    loadGoals: vi.fn(),
    send: vi.fn().mockResolvedValue({ reply: 'ok', goals: [{ id: 'g1', title: '减重' }] }),
    goals: [],
  };
  (modal as any).session = session;
  return { modal, session };
}

describe('AgenticPlanModal.initPlan (编辑现有树模式)', () => {
  it('提供 goals → 走 loadGoals 而非 init', async () => {
    const { modal, session } = makeModal({ goals: existingTree });
    await (modal as any).initPlan();
    expect(session.loadGoals).toHaveBeenCalledWith(existingTree);
    expect(session.init).not.toHaveBeenCalled();
  });

  it('goals + initialInstruction → 自动 send 该指令', async () => {
    const { modal, session } = makeModal({ goals: existingTree, initialInstruction: '把跑步降到 15' });
    await (modal as any).initPlan();
    expect(session.send).toHaveBeenCalledWith('把跑步降到 15');
  });

  it('无 goals → 走原 init（笔记拆解）', async () => {
    const { modal, session } = makeModal({});
    await (modal as any).initPlan();
    expect(session.init).toHaveBeenCalled();
    expect(session.loadGoals).not.toHaveBeenCalled();
  });

  it('有 goals 但无 initialInstruction → 不自动 send', async () => {
    const { modal, session } = makeModal({ goals: existingTree });
    await (modal as any).initPlan();
    expect(session.send).not.toHaveBeenCalled();
  });

  it('initialInstruction 且 send 失败 → 不抛错（捕获并提示）', async () => {
    const { modal, session } = makeModal({ goals: existingTree, initialInstruction: 'x' });
    session.send = vi.fn().mockRejectedValue(new Error('boom'));
    await expect((modal as any).initPlan()).resolves.toBeUndefined();
  });
});
