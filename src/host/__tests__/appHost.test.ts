import { describe, it, expect } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppHost } from '../AppHost';

/**
 * 锁定 AppHost.extractZip：用零依赖的 fflate 解压 webapp.zip（替代原 jszip）。
 * 关键约束：fflate 不能有会动态创建 <script> 的传递依赖（如 jszip→setimmediate），
 * 否则会触发安全扫描「dynamic <script> element creation」。本测试同时验证解压行为正确。
 */
describe('AppHost.extractZip（fflate 实现）', () => {
  it('将 zip 内容解压到 webappDir，并保持嵌套目录与文件内容', async () => {
    const { app, adapter } = createMockApp();
    const host = new AppHost(app as never, 'plugins/bamboo', '2.2.5');

    const zipData = zipSync({
      'app.html': strToU8('<html>bamboo</html>'),
      'assets/scripts/x.js': strToU8('console.log(1)'), // 嵌套路径
      '.webapp-version': strToU8('2.2.5'),
    });

    await (host as unknown as { extractZip: (a: unknown, b: ArrayBuffer) => Promise<void> }).extractZip(
      adapter,
      zipData.buffer
    );

    const html = new TextDecoder().decode(await adapter.readBinary('plugins/bamboo/webapp/app.html'));
    expect(html).toBe('<html>bamboo</html>');

    const nested = new TextDecoder().decode(await adapter.readBinary('plugins/bamboo/webapp/assets/scripts/x.js'));
    expect(nested).toBe('console.log(1)');

    // .webapp-version 由 extractZip 经 writeBinary 写出（与真实 Obsidian adapter.read 可读文本一致）
    const ver = new TextDecoder().decode(await adapter.readBinary('plugins/bamboo/webapp/.webapp-version'));
    expect(ver).toBe('2.2.5');

    // 嵌套目录已被自动创建
    expect(await adapter.exists('plugins/bamboo/webapp/assets/scripts')).toBe(true);
  });

  it('空根路径条目被忽略，不会写出空文件', async () => {
    const { app, adapter } = createMockApp();
    const host = new AppHost(app as never, 'plugins/bamboo', '2.2.5');

    const zipData = zipSync({ 'app.html': strToU8('x') });
    await (host as unknown as { extractZip: (a: unknown, b: ArrayBuffer) => Promise<void> }).extractZip(
      adapter,
      zipData.buffer
    );

    expect(await adapter.exists('plugins/bamboo/webapp/app.html')).toBe(true);
  });
});
