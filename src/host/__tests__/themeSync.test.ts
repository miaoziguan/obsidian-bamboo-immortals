import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * app:theme:sync 处理测试。
 *
 * 该 handler 在用户于设置中重新开启「同步主题」时被 webapp 调用
 * （settingsModal.toggleSyncTheme），宿主应：
 *   1. 用当前 settings.followObsidianTheme 触发 themeBridge.pushTheme；
 *   2. 回传 { ok: true }。
 * 同时验证非 iframe 来源的消息被来源校验拦截。
 */
describe('AppAPI app:theme:sync 处理', () => {
  let api: AppAPI;
  type Resp = { id: string; payload?: unknown; error?: string };
  let captured: Resp | null;
  let iframeContentWindow: { postMessage: (msg: Resp) => void };
  let pushThemeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mock = createMockApp();
    captured = null;
    iframeContentWindow = {
      postMessage: (msg: Resp) => {
        captured = msg;
      },
    };
    api = new AppAPI(mock.app as any, {} as any, async () => {}, 'noise', '.obsidian');
    (api as any).iframe = { contentWindow: iframeContentWindow };
    // 替换 themeBridge 以便断言 pushTheme 的调用参数
    pushThemeSpy = vi.fn();
    (api as any).themeBridge = {
      attachIframe: () => {},
      detachIframe: () => {},
      pushTheme: pushThemeSpy,
    };
  });

  const send = (data: { type?: string; id?: string; payload?: unknown }) => {
    captured = null;
    return (api as any).onMessage({ data, source: iframeContentWindow });
  };

  it('合法 app:theme:sync 被路由并响应 { ok: true }', async () => {
    await send({ type: 'app:theme:sync', id: 'ts1', payload: {} });
    expect(captured).not.toBeNull();
    expect(captured!.id).toBe('ts1');
    expect((captured!.payload as any).ok).toBe(true);
    expect(captured!.error).toBeUndefined();
  });

  it('调用 themeBridge.pushTheme 且使用 settings.followObsidianTheme=true', async () => {
    (api as any).settings = { followObsidianTheme: true };
    await send({ type: 'app:theme:sync', id: 'ts2', payload: {} });
    expect(pushThemeSpy).toHaveBeenCalledTimes(1);
    expect(pushThemeSpy).toHaveBeenCalledWith(true);
  });

  it('followObsidianTheme=false 时同样把 false 传入 pushTheme', async () => {
    (api as any).settings = { followObsidianTheme: false };
    await send({ type: 'app:theme:sync', id: 'ts3', payload: {} });
    expect(pushThemeSpy).toHaveBeenCalledWith(false);
  });

  it('来源非 iframe 的 app:theme:sync 被静默忽略（不响应、不推主题）', async () => {
    captured = null;
    await (api as any).onMessage({
      data: { type: 'app:theme:sync', id: 'ts4', payload: {} },
      source: {},
    });
    expect(captured).toBeNull();
    expect(pushThemeSpy).not.toHaveBeenCalled();
  });
});
