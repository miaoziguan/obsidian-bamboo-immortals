import { describe, it, expect, vi } from 'vitest';
import { viewFileRoutes } from '../handlers/viewFileHandlers';
import { base64ToArrayBuffer, arrayBufferToBase64 } from '../../utils/base64';

/**
 * 便签导出 PNG 的宿主侧回归锁：
 *  - 路径校验（遍历 / 后缀）与 base64 校验（非空 / 大小 / 字符集）不能退化；
 *  - base64 → ArrayBuffer 必须与正向编码互为逆操作（移动端无 Node Buffer）。
 */

type Resp = { ok?: boolean; path?: string } | { error?: string };

function makeCtx() {
  const responses: { id: string; payload?: Resp }[] = [];
  const errors: { id: string; msg: string }[] = [];
  const writeVaultBinary = vi.fn(async (path: string) => path);
  const ctx = {
    respond: (id: string, payload: Resp) => responses.push({ id, payload }),
    respondError: (id: string, msg: string) => errors.push({ id, msg }),
    writeVaultBinary,
  };
  return { ctx, responses, errors, writeVaultBinary };
}

const call = (ctx: ReturnType<typeof makeCtx>['ctx'], payload: unknown) =>
  viewFileRoutes['app:exportPng'](ctx as never, 'req_1', payload as never);

const VALID_B64 = 'iVBORw0KGgoAAAANSUhEUg==';

describe('app:exportPng handler 校验', () => {
  it('正常写入并回执归一化路径', async () => {
    const { ctx, responses, errors, writeVaultBinary } = makeCtx();
    await call(ctx, { path: '便签/测试 20261106.png', base64: VALID_B64 });
    expect(errors).toHaveLength(0);
    expect(writeVaultBinary).toHaveBeenCalledWith('便签/测试 20261106.png', VALID_B64);
    expect(responses[0].payload).toEqual({ ok: true, path: '便签/测试 20261106.png' });
  });

  it('路径为空 / 非字符串 → 报错，不写盘', async () => {
    for (const p of [undefined, '', '   ', 42]) {
      const c = makeCtx();
      await call(c.ctx, { path: p, base64: VALID_B64 });
      expect(c.errors[0].msg).toBe('未提供文件路径');
      expect(c.writeVaultBinary).not.toHaveBeenCalled();
    }
  });

  it('路径遍历被拒绝', async () => {
    const c = makeCtx();
    await call(c.ctx, { path: '../逃逸.png', base64: VALID_B64 });
    expect(c.errors[0].msg).toBe('路径遍历禁止');
    expect(c.writeVaultBinary).not.toHaveBeenCalled();
  });

  it('非 .png 后缀被拒绝（含伪装后缀）', async () => {
    for (const p of ['a.md', 'a.jpg', 'a.png.exe']) {
      const c = makeCtx();
      await call(c.ctx, { path: p, base64: VALID_B64 });
      expect(c.errors[0].msg).toBe('导出文件必须是 .png');
      expect(c.writeVaultBinary).not.toHaveBeenCalled();
    }
  });

  it('大写 .PNG 后缀允许', async () => {
    const c = makeCtx();
    await call(c.ctx, { path: 'a.PNG', base64: VALID_B64 });
    expect(c.errors).toHaveLength(0);
    expect(c.writeVaultBinary).toHaveBeenCalled();
  });

  it('base64 为空 / 非字符串 → 报错', async () => {
    for (const b of [undefined, '', null, 123]) {
      const c = makeCtx();
      await call(c.ctx, { path: 'a.png', base64: b });
      expect(c.errors[0].msg).toBe('图片数据为空');
    }
  });

  it('base64 含非法字符 → 报错', async () => {
    const c = makeCtx();
    await call(c.ctx, { path: 'a.png', base64: 'AAAA<script>' });
    expect(c.errors[0].msg).toBe('图片数据格式非法');
    expect(c.writeVaultBinary).not.toHaveBeenCalled();
  });

  it('base64 超过 8MB → 报错', async () => {
    const c = makeCtx();
    await call(c.ctx, { path: 'a.png', base64: 'A'.repeat(8 * 1024 * 1024 + 1) });
    expect(c.errors[0].msg).toBe('图片数据过大');
    expect(c.writeVaultBinary).not.toHaveBeenCalled();
  });

  it('写盘抛错时转成 respondError，不产生未处理异常', async () => {
    const c = makeCtx();
    c.writeVaultBinary.mockRejectedValueOnce(new Error('磁盘已满'));
    await call(c.ctx, { path: 'a.png', base64: VALID_B64 });
    expect(c.errors[0].msg).toBe('磁盘已满');
  });
});

describe('base64ToArrayBuffer / arrayBufferToBase64', () => {
  it('与正向编码互为逆操作', () => {
    const bytes = new Uint8Array([0, 1, 2, 127, 128, 255, 80, 78, 71]);
    const b64 = arrayBufferToBase64(bytes.buffer);
    const back = new Uint8Array(base64ToArrayBuffer(b64));
    expect(Array.from(back)).toEqual(Array.from(bytes));
  });

  it('大数组不丢字节', () => {
    const bytes = new Uint8Array(200000);
    for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256;
    const back = new Uint8Array(base64ToArrayBuffer(arrayBufferToBase64(bytes.buffer)));
    expect(back.length).toBe(bytes.length);
    expect(back[199999]).toBe(bytes[199999]);
  });

  it('PNG 魔数可正确还原', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const back = new Uint8Array(base64ToArrayBuffer(arrayBufferToBase64(png.buffer)));
    expect(Array.from(back)).toEqual(Array.from(png));
  });
});
