import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';
import { ALL_MESSAGE_TYPES } from '../protocol';

/**
 * 锁定「战略复盘面板 → AI 改进」入口：
 * webapp 健康分详情点「用 AI 改进」→ postMessage(app:aiImproveGoal)
 * → AppAPI 路由到注入回调 onAiImproveGoal，把目标交给 AgenticPlanModal。
 */
describe('AppAPI · app:aiImproveGoal 路由', () => {
  let api: AppAPI;
  type Resp = { id: string; payload?: unknown; error?: string };
  let captured: Resp | null;
  let iframeContentWindow: { postMessage: (msg: Resp) => void };
  let onAiImproveGoal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mock = createMockApp();
    captured = null;
    iframeContentWindow = {
      postMessage: (msg: Resp) => {
        captured = msg;
      },
    };
    onAiImproveGoal = vi.fn();
    api = new AppAPI(mock.app as any, {} as any, async () => {}, 'noise', '.obsidian');
    (api as any).iframe = { contentWindow: iframeContentWindow };
    (api as any).onAiImproveGoal = onAiImproveGoal;
  });

  const send = (source: unknown, data: { type?: string; id?: string; payload?: unknown }) => {
    captured = null;
    return (api as any).onMessage({ data, source });
  };

  it('协议双向清单包含 app:aiImproveGoal', () => {
    expect(ALL_MESSAGE_TYPES).toContain('app:aiImproveGoal');
  });

  it('合法来源 + 合法 payload → 回调被调用且响应 ok', async () => {
    const payload = { goalId: 'g1', title: '健康减重', hints: 'L3 停滞' };
    await send(iframeContentWindow, { type: 'app:aiImproveGoal', id: 'x1', payload });
    expect(onAiImproveGoal).toHaveBeenCalledTimes(1);
    expect(onAiImproveGoal).toHaveBeenCalledWith(payload);
    expect(captured).not.toBeNull();
    expect(captured!.error).toBeUndefined();
    expect((captured!.payload as any).ok).toBe(true);
  });

  it('来源非 iframe → 忽略且不触发回调', async () => {
    await send({}, { type: 'app:aiImproveGoal', id: 'x2', payload: { goalId: 'g1' } });
    expect(captured).toBeNull();
    expect(onAiImproveGoal).not.toHaveBeenCalled();
  });

  it('缺失 goalId → 报错且不触发回调', async () => {
    await send(iframeContentWindow, { type: 'app:aiImproveGoal', id: 'x3', payload: { title: 'x' } });
    expect(onAiImproveGoal).not.toHaveBeenCalled();
    expect(captured).not.toBeNull();
    expect(captured!.error).toBeDefined();
  });
});
