import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';
import { PROTOCOL_VERSION } from '../protocol';

/**
 * 锁定 AppAPI.postMessage 路由：来源校验 + 消息类型白名单。
 * 防止任意网页（非本插件 iframe）伪造消息读写 Vault 数据。
 */
describe('AppAPI 消息路由与来源校验', () => {
  let api: AppAPI;
  type Resp = { id: string; payload?: unknown; error?: string };
  let captured: Resp | null;
  let iframeContentWindow: { postMessage: (msg: Resp) => void };

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
  });

  const send = (source: unknown, data: { type?: string; id?: string; payload?: unknown }) => {
    captured = null;
    return (api as any).onMessage({ data, source });
  };

  it('来源非 iframe 的消息被静默忽略', async () => {
    await send({}, { type: 'storage:listDays', id: 'x1', payload: {} });
    expect(captured).toBeNull();
  });

  it('白名单外的消息前缀被忽略', async () => {
    await send(iframeContentWindow, { type: 'evil:exfiltrate', id: 'x2', payload: {} });
    expect(captured).toBeNull();
  });

  it('缺少 type/id 的消息被忽略', async () => {
    await send(iframeContentWindow, { id: 'x3', payload: {} } as any);
    expect(captured).toBeNull();
    await send(iframeContentWindow, { type: 'storage:listDays', payload: {} } as any);
    expect(captured).toBeNull();
  });

  it('合法来源 + 合法前缀的消息被路由并响应', async () => {
    await send(iframeContentWindow, { type: 'storage:listDays', id: 'x4', payload: {} });
    expect(captured).not.toBeNull();
    expect(captured!.id).toBe('x4');
    expect(captured!.error).toBeUndefined();
  });

  it('app:ready 回传配置（含自定义主题/音源）', async () => {
    (api as any).customThemes = [{ name: 't', code: 'x' }];
    (api as any).settings = { noiseItems: [{ name: 'n' }] };
    await send(iframeContentWindow, { type: 'app:ready', id: 'x5', payload: {} });
    expect(captured!.error).toBeUndefined();
    const p = captured!.payload as any;
    expect(p.customThemes).toEqual([{ name: 't', code: 'x' }]);
    expect(p.customNoises).toEqual([{ name: 'n' }]);
  });

  // ---- 阶段3 · 契约化：版本协商 ----

  it('app:ready 协议版本匹配时不告警', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await send(iframeContentWindow, {
        type: 'app:ready',
        id: 'x6',
        payload: { protocolVersion: PROTOCOL_VERSION },
      });
      expect(captured!.error).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('app:ready 协议版本不匹配时 console.warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await send(iframeContentWindow, {
        type: 'app:ready',
        id: 'x7',
        payload: { protocolVersion: 999 },
      });
      expect(captured!.error).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('协议版本不匹配');
      expect(warn.mock.calls[0][0]).toContain(String(PROTOCOL_VERSION));
    } finally {
      warn.mockRestore();
    }
  });

  it('app:ready 无 protocolVersion（老版 webapp）不告警', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await send(iframeContentWindow, {
        type: 'app:ready',
        id: 'x8',
        payload: {},
      });
      expect(captured!.error).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
