import { describe, it, expect } from 'vitest';
import { arrayBufferToBase64 } from '../base64';

describe('arrayBufferToBase64（跨平台，不依赖 Node Buffer）', () => {
  it('小数据正确编码（与 Node Buffer 基准一致）', () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    expect(arrayBufferToBase64(bytes.buffer)).toBe('AAECAw==');
    expect(arrayBufferToBase64(bytes.buffer)).toBe(Buffer.from(bytes).toString('base64'));
  });

  it('单字节边界值正确', () => {
    const bytes = new Uint8Array([0xff]);
    expect(arrayBufferToBase64(bytes.buffer)).toBe('/w==');
  });

  it('跨越 0x8000 分块边界的大文件编码仍与 Node Buffer 一致', () => {
    const size = 0x8000 + 5; // 触发第二段分块
    const bytes = new Array(size).fill(0x41); // 'A' * size
    const buf = new Uint8Array(bytes).buffer;
    const expected = Buffer.from(new Uint8Array(bytes)).toString('base64'); // 仅测试环境用 Node Buffer 作基准
    expect(arrayBufferToBase64(buf)).toBe(expected);
  });
});
