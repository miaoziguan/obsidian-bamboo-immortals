import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * detach 的「落盘回执」契约（防丢数据）。
 *
 * 事故背景：`typewriter-writing/doc-mwg8w48jw1yu.json`（用了两天的真实文档）在重载插件的
 * 一瞬被清成 0 字节。链条是——`vault.process` 非原子（截断 → 重写）+ `onClose` 在
 * `detach()` 之后**立即** `iframe.remove()`：flush 消息还在队列里 iframe 就没了，
 * 落盘代码一次都没跑过。
 *
 * 修法：`detach()` 发请求后**等 webapp 回执**（app:beforeDetachDone）再 resolve，
 * 调用方 await 它才销毁 iframe。超时兜底，绝不让「关视图」被无回应的 webapp 卡住。
 */
describe('AppAPI.detach 等待落盘回执', () => {
  let api: AppAPI;
  let iframeContentWindow: { postMessage: (msg: unknown) => void };
  let posted: Array<{ type?: string }>;

  const send = (data: unknown) =>
    (api as any).onMessage({ data, source: iframeContentWindow });

  beforeEach(() => {
    // node 环境下 detach 用到的两个浏览器全局
    (globalThis as any).window = {
      setTimeout: (fn: () => void, ms?: number) => setTimeout(fn, ms),
      clearTimeout: (id: any) => clearTimeout(id),
    };
    (globalThis as any).activeDocument = { defaultView: null };

    const mock = createMockApp();
    posted = [];
    iframeContentWindow = { postMessage: (msg: any) => { posted.push(msg); } };
    api = new AppAPI(mock.app as any, {} as any, async () => {}, 'noise', '.obsidian', {
      isActive: () => false,
    } as any);
    (api as any).iframe = { contentWindow: iframeContentWindow };
    (api as any).themeBridge = { attachIframe: () => {}, detachIframe: () => {}, pushTheme: () => {} };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as any).window;
    delete (globalThis as any).activeDocument;
  });

  it('没有 iframe（从未挂载）→ 立即完成，不发任何消息', async () => {
    (api as any).iframe = null;
    await expect(api.detach()).resolves.toBeUndefined();
    expect(posted.length).toBe(0);
  });

  it('有 iframe → 先发出 app:beforeDetach 请求，且此时尚未完成', async () => {
    let settled = false;
    const p = api.detach().then(() => { settled = true; });

    expect(posted.some((m) => m.type === 'app:beforeDetach')).toBe(true);
    await Promise.resolve();
    expect(settled).toBe(false);        // 关键：不等回执就销毁 iframe 就是丢数据的成因

    send({ type: 'app:beforeDetachDone', id: 'done1' });
    await p;
    expect(settled).toBe(true);
  });

  it('收到回执后放行（webapp 已把防抖窗口内的改动写完）', async () => {
    const p = api.detach();
    send({ type: 'app:beforeDetachDone', id: 'done2' });
    await expect(p).resolves.toBeUndefined();
  });

  it('webapp 一直不回执 → 超时兜底完成，不把关闭视图卡死', async () => {
    vi.useFakeTimers();
    let settled = false;
    const p = api.detach().then(() => { settled = true; });

    await vi.advanceTimersByTimeAsync(1400);
    expect(settled).toBe(false);        // 还没到上限

    await vi.advanceTimersByTimeAsync(200);
    await p;
    expect(settled).toBe(true);         // 1500ms 兜底放行
  });

  it('回执幂等：重复到达不会重复收尾或抛错', async () => {
    const p = api.detach();
    send({ type: 'app:beforeDetachDone', id: 'd1' });
    expect(() => send({ type: 'app:beforeDetachDone', id: 'd2' })).not.toThrow();
    await expect(p).resolves.toBeUndefined();
  });

  it('回执不会落到 handleMessage 被当成未知类型回包', async () => {
    const p = api.detach();
    const before = posted.length;
    send({ type: 'app:beforeDetachDone', id: 'd3' });
    await p;
    // 除了 beforeDetach 请求本身，不应再产生任何响应消息
    expect(posted.length).toBe(before);
  });
});
