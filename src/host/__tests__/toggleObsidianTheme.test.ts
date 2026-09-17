import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * app:toggleObsidianTheme 处理测试（画中卷·打字机机身明暗开关）。
 *
 * 该消息由画中卷打字机机身上的滑动开关发出，宿主应：
 *   1. 按 payload.isDark（缺省则据当前明暗翻转）切换 Obsidian 基础主题
 *      —— 优先 App.changeTheme(mode)，回退 Vault.setConfig('theme', mode)；
 *   2. 显式重放 css-change，驱动各视图跟随；
 *   3. 回传 { ok: true, isDark }。
 */
describe('AppAPI app:toggleObsidianTheme 处理', () => {
  type Resp = { id: string; payload?: unknown; error?: string };
  let api: AppAPI;
  let captured: Resp | null;
  let iframeContentWindow: { postMessage: (msg: Resp) => void };
  let changeTheme: ReturnType<typeof vi.fn>;
  let trigger: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mock = createMockApp();
    changeTheme = vi.fn();
    trigger = vi.fn();
    (mock.app as unknown as Record<string, unknown>).changeTheme = changeTheme;
    (mock.app as unknown as Record<string, unknown>).workspace = { trigger };
    // 当前为暗色：不带 isDark 的消息应翻转为亮色
    vi.stubGlobal('activeDocument', {
      body: { classList: { contains: (c: string) => c === 'theme-dark' } },
    });

    captured = null;
    iframeContentWindow = {
      postMessage: (msg: Resp) => {
        captured = msg;
      },
    };
    api = new AppAPI(
      mock.app as never,
      {} as never,
      async () => {},
      'noise',
      '.obsidian',
      { isActive: () => false } as never
    );
    (api as unknown as { iframe: unknown }).iframe = { contentWindow: iframeContentWindow };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const send = (payload: unknown) => {
    captured = null;
    return (api as unknown as { onMessage: (e: unknown) => Promise<void> }).onMessage({
      data: { type: 'app:toggleObsidianTheme', id: 'ot1', payload },
      source: iframeContentWindow,
    });
  };

  it('isDark=false → 切到 moonstone 并回传 isDark=false', async () => {
    await send({ isDark: false });
    expect(changeTheme).toHaveBeenCalledWith('moonstone');
    expect(trigger).toHaveBeenCalledWith('css-change');
    expect(captured!.id).toBe('ot1');
    expect(captured!.payload).toEqual({ ok: true, isDark: false });
    expect(captured!.error).toBeUndefined();
  });

  it('isDark=true → 切到 obsidian 并回传 isDark=true', async () => {
    await send({ isDark: true });
    expect(changeTheme).toHaveBeenCalledWith('obsidian');
    expect(captured!.payload).toEqual({ ok: true, isDark: true });
  });

  it('不带 isDark → 据当前暗色翻转（当前暗 → moonstone）', async () => {
    await send({});
    expect(changeTheme).toHaveBeenCalledWith('moonstone');
    expect(captured!.payload).toEqual({ ok: true, isDark: false });
  });

  it('无 changeTheme 时回退 Vault.setConfig("theme", mode)', async () => {
    const appUnsafe = (api as unknown as { app: Record<string, unknown> }).app;
    delete appUnsafe.changeTheme;
    const setConfig = vi.fn();
    (appUnsafe.vault as Record<string, unknown>).setConfig = setConfig;
    await send({ isDark: true });
    expect(setConfig).toHaveBeenCalledWith('theme', 'obsidian');
    expect(captured!.payload).toEqual({ ok: true, isDark: true });
  });

  it('来源非 iframe 的消息被静默忽略', async () => {
    captured = null;
    await (api as unknown as { onMessage: (e: unknown) => Promise<void> }).onMessage({
      data: { type: 'app:toggleObsidianTheme', id: 'ot9', payload: { isDark: true } },
      source: {},
    });
    expect(captured).toBeNull();
    expect(changeTheme).not.toHaveBeenCalled();
  });
});
