import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * 布局板块宿主侧路由回归锁（布局板块此前在宿主侧零单测覆盖）：
 *  - app:moveToCenter 的 mode 必须白名单收口：它会被写进视图状态并随 workspace 布局
 *    跨重启持久化，重启后又经 app:ready 注入 webapp 兜底恢复，放任任意值会污染恢复源；
 *  - app:moveToSidebar 正常转发；
 *  - iframe 绑定前的消息一律丢弃（AppAPI.onMessage 来源校验收紧后的回归锁）。
 */
describe('AppAPI 布局板块路由', () => {
  let api: AppAPI;
  let captured: { id: string; payload?: any; error?: string } | null;
  let iframeContentWindow: { postMessage: (msg: any) => void };

  beforeEach(() => {
    const mock = createMockApp();
    captured = null;
    iframeContentWindow = { postMessage: (msg: any) => { captured = msg; } };
    api = new AppAPI(mock.app as any, {} as any, async () => {}, 'noise', '.obsidian', { isActive: () => false } as any);
  });

  const send = (source: unknown, data: { type?: string; id?: string; payload?: unknown }) => {
    captured = null;
    return (api as any).onMessage({ data, source });
  };

  /** 绑定 iframe（模拟 bindIframe 之后） */
  const bind = () => { (api as any).iframe = { contentWindow: iframeContentWindow }; };

  it.each([
    ['kanban', 'kanban'],
    ['horizontal', 'horizontal'],
    ['evil-mode', 'horizontal'],     // 非法值 → 回落默认
    ['', 'horizontal'],
    ['KANBAN', 'horizontal'],        // 大小写敏感，不做隐式归一
  ])('app:moveToCenter：payload.mode=%j → 回调收到 %j（白名单收口）', async (input, expected) => {
    bind();
    const spy = vi.fn();
    api.moveToCenter = spy;
    await send(iframeContentWindow, { type: 'app:moveToCenter', id: 'm1', payload: { mode: input } });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expected);
    expect((captured!.payload as any).ok).toBe(true);
  });

  it('app:moveToCenter：未注入回调时响应 ok:false 且不抛异常', async () => {
    bind();
    await send(iframeContentWindow, { type: 'app:moveToCenter', id: 'm2', payload: { mode: 'kanban' } });
    expect((captured!.payload as any).ok).toBe(false);
    expect((captured!.error ?? (captured!.payload as any).error)).toBeTruthy();
  });

  it('app:moveToSidebar：正常转发到回调', async () => {
    bind();
    const spy = vi.fn();
    api.moveToSidebar = spy;
    await send(iframeContentWindow, { type: 'app:moveToSidebar', id: 'm3', payload: {} });
    expect(spy).toHaveBeenCalledTimes(1);
    expect((captured!.payload as any).ok).toBe(true);
  });

  it('iframe 未绑定（startListening 之后、bindIframe 之前）的消息一律丢弃', async () => {
    const center = vi.fn();
    const sidebar = vi.fn();
    api.moveToCenter = center;
    api.moveToSidebar = sidebar;
    // 来源伪装成 iframe 的 contentWindow 也不行：this.iframe 尚为 null
    await send(iframeContentWindow, { type: 'app:moveToSidebar', id: 'm4', payload: {} });
    expect(sidebar).not.toHaveBeenCalled();
    expect(center).not.toHaveBeenCalled();
    expect(captured).toBeNull();

    // 绑定后同一条消息即可正常路由（证明上一步的丢弃来自「未绑定」而非其它原因）
    bind();
    await send(iframeContentWindow, { type: 'app:moveToSidebar', id: 'm5', payload: {} });
    expect(sidebar).toHaveBeenCalledTimes(1);
  });
});
