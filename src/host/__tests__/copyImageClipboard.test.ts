import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * 剪贴板分层降级的回归锁：
 *  1) 桌面端 Electron clipboard.writeImage 优先（不依赖 user activation）；
 *  2) 无 Electron 时退回 ClipboardItem + clipboard.write；
 *  3) 两者都不可用必须抛错（调用方据此提示手动复制），不得静默成功。
 *
 * webapp 处于 data: opaque origin，navigator.clipboard 不可用，
 * 因此复制动作必须由宿主执行 —— 这条链路坏掉时用户只会看到「没有复制」而无提示。
 */

const B64 = 'iVBORw0KGgoAAAANSUhEUg==';

type ClipboardFace = { copyImageToClipboard: (b64: string) => Promise<string> };

function makeApi() {
  const mock = createMockApp();
  const api = new AppAPI(
    mock.app as never,
    { dataPath: 'bamboo-review' } as never,
    async () => {},
    'noise',
    '.obsidian',
    { isActive: () => false } as never,
  );
  return (api as unknown as { ctx: ClipboardFace }).ctx;
}

describe('AppAPI.copyImageToClipboard', () => {
  const g = globalThis as Record<string, unknown>;
  const saved = { window: g.window, navigator: g.navigator, Blob: g.Blob };

  beforeEach(() => {
    g.window = {};
    g.navigator = {};
  });

  afterEach(() => {
    g.window = saved.window;
    g.navigator = saved.navigator;
    g.Blob = saved.Blob;
    vi.restoreAllMocks();
  });

  it('桌面端优先走 Electron clipboard.writeImage', async () => {
    const writeImage = vi.fn();
    const createFromBuffer = vi.fn((buf: Uint8Array) => ({ buf }));
    (g.window as Record<string, unknown>).require = (id: string) =>
      id === 'electron' ? { clipboard: { writeImage }, nativeImage: { createFromBuffer } } : {};
    const ctx = makeApi();
    await expect(ctx.copyImageToClipboard(B64)).resolves.toBe('electron');
    expect(createFromBuffer).toHaveBeenCalledTimes(1);
    expect(writeImage).toHaveBeenCalledTimes(1);
    // 必须传解码后的 PNG 字节，而不是 base64 字符串
    const arg = createFromBuffer.mock.calls[0][0] as Uint8Array;
    expect(Array.from(arg.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('Electron 模块缺失时退回 ClipboardItem', async () => {
    const write = vi.fn(async () => {});
    g.navigator = { clipboard: { write } };
    g.window = {
      require: () => {
        throw new Error('require is not available');
      },
      ClipboardItem: class {
        constructor(public items: Record<string, Blob>) {}
      },
    };
    const ctx = makeApi();
    await expect(ctx.copyImageToClipboard(B64)).resolves.toBe('clipboard-item');
    expect(write).toHaveBeenCalledTimes(1);
    const items = (write.mock.calls[0] as unknown as [unknown[]])[0];
    expect(items).toHaveLength(1);
  });

  it('两种通道都不可用 → 抛错（不得静默成功）', async () => {
    const ctx = makeApi();
    await expect(ctx.copyImageToClipboard(B64)).rejects.toThrow('当前环境不支持图片剪贴板');
  });

  it('Electron 写入抛错时继续降级而非直接失败', async () => {
    const writeImage = vi.fn(() => {
      throw new Error('clipboard locked');
    });
    (g.window as Record<string, unknown>).require = () => ({
      clipboard: { writeImage },
      nativeImage: { createFromBuffer: (buf: Uint8Array) => ({ buf }) },
    });
    const write = vi.fn(async () => {});
    g.navigator = { clipboard: { write } };
    (g.window as Record<string, unknown>).ClipboardItem = class {
      constructor(public items: Record<string, Blob>) {}
    };
    const ctx = makeApi();
    await expect(ctx.copyImageToClipboard(B64)).resolves.toBe('clipboard-item');
    expect(writeImage).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1);
  });
});
