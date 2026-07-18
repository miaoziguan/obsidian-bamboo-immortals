import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockApp, __setRequestUrlHandler } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * 锁定音频读取路径：库内文件 / 本地文件 / 外部链接均通过 postMessage
 * 回传 base64 data URL，不依赖 adapter.basePath、不依赖 HTTP 路由。
 * 防止回退到「仅桌面可用 / 移动端 basePath 静默失败」的旧实现。
 */
describe('AppAPI 音频读取', () => {
  let api: AppAPI;
  let adapter: ReturnType<typeof createMockApp>['adapter'];
  type Resp = { id: string; payload?: unknown; error?: string };
  let captured: Resp | null;

  /** 将一段字节写入内存文件系统 */
  const putBinary = async (path: string, bytes: number[]) => {
    await adapter.writeBinary(path, new Uint8Array(bytes).buffer);
  };

  /** 直接调用私有 handler 并捕获通过 iframe 回传的响应 */
  const call = async (method: string, id: string, payload: unknown): Promise<Resp | null> => {
    captured = null;
    await (api as unknown as Record<string, (...a: unknown[]) => Promise<void>>)[method](id, payload);
    return captured;
  };

  beforeEach(() => {
    const mock = createMockApp();
    adapter = mock.adapter;
    api = new AppAPI(mock.app as any, {} as any, async () => {}, 'noise', '.obsidian');
    // 伪 iframe：捕获 respond/respondError 通过 postMessage 发出的数据
    (api as any).iframe = {
      contentWindow: {
        postMessage: (msg: { id: string; payload?: unknown; error?: string }) => {
          captured = msg;
        },
      },
    };
  });

  it('readVaultFile 读取库内文件并回传正确 MIME 的 data URL', async () => {
    await putBinary('sounds/rain.mp3', [0x00, 0x01, 0x02, 0x03]);
    const res = await call('handleReadVaultFile', 'r1', { path: 'sounds/rain.mp3' });
    expect(res!.id).toBe('r1');
    expect(res!.error).toBeUndefined();
    expect((res!.payload as any).data).toBe('data:audio/mpeg;base64,AAECAw==');
  });

  it('readVaultFile 不同扩展名映射对应 MIME', async () => {
    await putBinary('a.ogg', [0x61]); // 'a'
    const res = await call('handleReadVaultFile', 'r2', { path: 'a.ogg' });
    expect((res!.payload as any).data).toBe('data:audio/ogg;base64,YQ==');
  });

  it('readVaultFile 拒绝不支持的扩展名', async () => {
    await putBinary('note.txt', [0x00]);
    const res = await call('handleReadVaultFile', 'r3', { path: 'note.txt' });
    expect(res!.payload).toBeUndefined();
    expect(res!.error).toContain('不支持的音频格式');
  });

  it('readVaultFile 拒绝路径遍历', async () => {
    const res = await call('handleReadVaultFile', 'r4', { path: '../secret.mp3' });
    expect(res!.error).toContain('路径遍历禁止');
  });

  it('readVaultFile 对不存在文件返回错误', async () => {
    const res = await call('handleReadVaultFile', 'r5', { path: 'missing.mp3' });
    expect(res!.error).toContain('文件不存在');
  });

  it('readVaultFile 缺少路径返回错误', async () => {
    const res = await call('handleReadVaultFile', 'r6', { path: '' });
    expect(res!.error).toContain('未提供文件路径');
  });

  it('readLocalFile 读取绝对路径文件并回传 data URL', async () => {
    await putBinary('/abs/path/song.wav', [0xff, 0xfe]);
    const res = await call('handleReadLocalFile', 'l1', { path: '/abs/path/song.wav' });
    expect(res!.error).toBeUndefined();
    expect((res!.payload as any).data).toBe('data:audio/wav;base64,//4=');
  });

  it('readLocalFile 拒绝不支持的扩展名', async () => {
    const res = await call('handleReadLocalFile', 'l2', { path: '/abs/x.bin' });
    expect(res!.error).toContain('不支持的音频格式');
  });

  it('proxyAudioUrl 通过 requestUrl 代理并按响应 content-type 回传', async () => {
    __setRequestUrlHandler(async () => ({
      status: 200,
      arrayBuffer: new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer,
      headers: { 'content-type': 'audio/mpeg' },
    }));
    const res = await call('handleProxyAudioUrl', 'p1', { url: 'https://example.com/a.mp3' });
    expect(res!.error).toBeUndefined();
    expect((res!.payload as any).data).toBe('data:audio/mpeg;base64,AAECAw==');
  });

  it('proxyAudioUrl 非 2xx 返回错误', async () => {
    __setRequestUrlHandler(async () => ({
      status: 404,
      arrayBuffer: new ArrayBuffer(0),
      headers: {},
    }));
    const res = await call('handleProxyAudioUrl', 'p2', { url: 'https://example.com/missing.mp3' });
    expect(res!.error).toContain('HTTP 404');
  });

  it('proxyAudioUrl 缺少/非法 URL 返回错误', async () => {
    const res = await call('handleProxyAudioUrl', 'p3', { url: '' });
    expect(res!.error).toContain('非法音源链接');
    const res2 = await call('handleProxyAudioUrl', 'p4', { url: 'file:///etc/passwd' });
    expect(res2!.error).toContain('非法音源链接');
  });

  it('大文件 base64 分块编码正确（跨越 0x8000 分块边界）', async () => {
    const size = 0x8000 + 5;
    const bytes = new Array(size).fill(0x41); // 'A' * size
    await putBinary('big.flac', bytes);
    const res = await call('handleReadVaultFile', 'big1', { path: 'big.flac' });
    const expected =
      'data:audio/flac;base64,' + Buffer.from(new Uint8Array(bytes)).toString('base64');
    expect((res!.payload as any).data).toBe(expected);
  });

  it('L14 已 detach → 扫描直接返回空且不再读库', async () => {
    const listSpy = vi.spyOn(adapter, 'list');
    (api as any).disposed = true;
    captured = null;
    await (api as any).handleMessage('app:listVaultAudioFiles', 'scan1', {});
    expect((captured!.payload as any).files).toEqual([]);
    expect(listSpy).not.toHaveBeenCalled();
  });

  it('L14 扫描进行中 detach → 提前终止（list 执行时置 disposed，文件不被收集）', async () => {
    const listSpy = vi.spyOn(adapter, 'list').mockImplementation(
      async () => {
        (api as any).disposed = true; // 模拟扫描中途用户关闭面板
        return { folders: [], files: ['a.mp3'] } as any;
      },
    );
    captured = null;
    await (api as any).handleMessage('app:listVaultAudioFiles', 'scan2', {});
    expect((captured!.payload as any).files).toEqual([]); // 已开始 list，但被 disposed 中止
    expect(listSpy).toHaveBeenCalledTimes(1);
  });
});
