import { describe, it, expect, beforeEach } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * 卡片图片协议（file:readImage / file:writeBinary）回归锁。
 *
 * 这两条是「图片进得了卡、也存得下」的唯一通道：
 *  - readImage   ：vault 图片 → data URL（画中卷在 data: iframe 里，拼不出可用的 app:// 地址）；
 *  - writeBinary ：粘贴/拖入的 base64 → 画中卷目录下的真文件（不是把 base64 灌进 md）。
 * 锁的重点是**边界**：路径遍历、非图片后缀、伪 base64、超大体积都必须被拒。
 */

type Msg = { type: string; id: string; payload?: Record<string, unknown>; error?: string };

const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_B64 = 'iVBORw0KGgo=';

function makeApi() {
  const mock = createMockApp();
  const sent: Msg[] = [];
  const api = new AppAPI(
    mock.app as never,
    { dataPath: 'bamboo-review' } as never,
    async () => {},
    'noise',
    '.obsidian',
    { isActive: () => false } as never,
  );
  (api as unknown as { iframe: unknown }).iframe = {
    contentWindow: { postMessage: (m: Msg) => sent.push(m) },
  };
  const send = async (type: string, payload: Record<string, unknown>) => {
    await (api as unknown as { onMessage: (e: unknown) => Promise<void> }).onMessage({
      data: { type, id: 'req_1', payload },
      source: (api as unknown as { iframe: { contentWindow: unknown } }).iframe.contentWindow,
    });
    return sent[sent.length - 1];
  };
  return { api, sent, send, adapter: mock.adapter };
}

describe('file:writeBinary（粘贴/拖入图片落盘）', () => {
  let env: ReturnType<typeof makeApi>;
  beforeEach(() => { env = makeApi(); });

  it('base64 写进画中卷目录并回执归一化路径', async () => {
    const res = await env.send('file:writeBinary', { path: 'assets/pasted-1.png', content: PNG_B64 });
    expect(res.error).toBeUndefined();
    expect(res.payload).toEqual({ ok: true, path: '画中卷/assets/pasted-1.png' });
    const back = new Uint8Array(await env.adapter.readBinary('画中卷/assets/pasted-1.png'));
    expect(Array.from(back)).toEqual(Array.from(PNG_BYTES));   // 字节级还原，不走文本通道
  });

  it('data URL 前缀会被剥掉（前端直接传整串也不炸）', async () => {
    const res = await env.send('file:writeBinary', {
      path: 'assets/a.png', content: `data:image/png;base64,${PNG_B64}`,
    });
    expect(res.payload).toEqual({ ok: true, path: '画中卷/assets/a.png' });
  });

  it('路径遍历被拒', async () => {
    const res = await env.send('file:writeBinary', { path: '../../逃逸.png', content: PNG_B64 });
    expect(res.error).toBe('路径遍历禁止');
  });

  it('非图片后缀被拒（不能当通用写文件通道用）', async () => {
    for (const p of ['a.md', 'a.js', 'a.png.exe']) {
      const res = await env.send('file:writeBinary', { path: p, content: PNG_B64 });
      expect(res.error).toBe('仅支持图片文件');
    }
  });

  it('伪 base64 / 空数据被拒', async () => {
    for (const b of ['', 'AAAA<script>', undefined]) {
      const res = await env.send('file:writeBinary', { path: 'a.png', content: b });
      expect(res.error).toBeTruthy();
    }
  });

  it('超过 12MB 被拒（不写盘）', async () => {
    // base64 4 字符 → 3 字节：17MB 的 base64 解出来约 12.75MB，刚好越线
    const res = await env.send('file:writeBinary', {
      path: 'huge.png', content: 'A'.repeat(17 * 1024 * 1024),
    });
    expect(res.error).toContain('图片过大');
  });
});

describe('file:readImage（图片投影取 data URL）', () => {
  let env: ReturnType<typeof makeApi>;
  beforeEach(async () => {
    env = makeApi();
    await env.adapter.writeBinary('画中卷/assets/p.png', PNG_BYTES.buffer);
  });

  it('按 vault 路径读成 data URL', async () => {
    const res = await env.send('file:readImage', { path: '画中卷/assets/p.png' });
    expect(res.payload).toEqual({
      data: `data:image/png;base64,${PNG_B64}`,
      path: '画中卷/assets/p.png',
    });
  });

  it('相对写法自动补「画中卷/」（笔记里两种写法都有人写）', async () => {
    const res = await env.send('file:readImage', { path: 'assets/p.png' });
    expect(res.payload).toMatchObject({ path: '画中卷/assets/p.png' });
    expect(String(res.payload?.data)).toMatch(/^data:image\/png;base64,/);
  });

  it('vault 其他目录的图片也能读（附件目录很常见）', async () => {
    await env.adapter.writeBinary('附件/截图.png', PNG_BYTES.buffer);
    const res = await env.send('file:readImage', { path: '附件/截图.png' });
    expect(String(res.payload?.data)).toMatch(/^data:image\/png;base64,/);
  });

  it('读不到时回空串而不是报错（不投影，但 md 原文保留）', async () => {
    const res = await env.send('file:readImage', { path: 'nope.png' });
    expect(res.error).toBeUndefined();
    expect(res.payload).toEqual({ data: '', path: 'nope.png' });
  });

  it('路径遍历 / 非图片后缀被拒', async () => {
    expect((await env.send('file:readImage', { path: '../秘密.png' })).error).toBe('路径遍历禁止');
    await env.adapter.write('画中卷/a.md', '# hi');
    expect((await env.send('file:readImage', { path: '画中卷/a.md' })).error).toContain('不支持的图片格式');
  });
});
