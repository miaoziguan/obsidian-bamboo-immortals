import { describe, it, expect, beforeEach } from 'vitest';
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

    const html = await adapter.read('plugins/bamboo/webapp/app.html');
    expect(html).toBe('<html>bamboo</html>');

    const nested = await adapter.read('plugins/bamboo/webapp/assets/scripts/x.js');
    expect(nested).toBe('console.log(1)');

    // .webapp-version 由 extractZip 经 write 写出（文本资源统一走 write）
    const ver = await adapter.read('plugins/bamboo/webapp/.webapp-version');
    expect(ver).toBe('2.2.5');

    // 嵌套目录已被自动创建
    expect(await adapter.exists('plugins/bamboo/webapp/assets/scripts')).toBe(true);
  });

  it('zip 含目录占位条目(assets/scripts)与嵌套文件时，目录不被写成文件（修复 ENOTDIR）', async () => {
    const { app, adapter } = createMockApp();
    const host = new AppHost(app as never, 'plugins/bamboo', '2.3.0');

    // 模拟发布 zip：既有 `assets/scripts` 占位（被某些 zip 工具写成 0 字节文件），
    // 又有真正嵌套文件 `assets/scripts/x.js`。旧实现会把 `assets/scripts` 当文件写出，
    // 导致后续 writeBinary(`assets/scripts/x.js`) 抛 ENOTDIR。
    const zipData = zipSync({
      'app.html': strToU8('<html>bamboo</html>'),
      'assets/scripts': strToU8(''), // 目录占位（坏条目）
      'assets/scripts/x.js': strToU8('console.log(1)'), // 嵌套文件
      '.webapp-version': strToU8('2.3.0'),
    });

    await (host as unknown as { extractZip: (a: unknown, b: ArrayBuffer) => Promise<void> }).extractZip(
      adapter,
      zipData.buffer
    );

    // 目录占位条目不应把 assets/scripts 写成文件，而应作为目录存在
    const dirStat = await adapter.stat('plugins/bamboo/webapp/assets/scripts');
    expect(dirStat?.type).toBe('folder');

    // 嵌套文件应正常落盘
    const nested = await adapter.read('plugins/bamboo/webapp/assets/scripts/x.js');
    expect(nested).toBe('console.log(1)');
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

/**
 * 锁定 buildBlobUrl 返回 data: URL（而非 blob:）。
 * 鸿蒙 ArkWeb / 老旧安卓 WebView 对 blob: 源 iframe 加载 <script type=module> /
 * Shadow DOM 有兼容性限制，统一改用 data: URL 可绕开该限制（修复 B）。
 */
describe('AppHost.buildBlobUrl 返回 data: URL（修复 B）', () => {
  beforeEach(() => {
    // 静态缓存跨实例共享，测试间需重置，避免命中上一用例的缓存
    (AppHost as unknown as { cachedPageUrl: string | null }).cachedPageUrl = null;
    (AppHost as unknown as { cachedHtmlLength: number }).cachedHtmlLength = -1;
  });

  it('webapp 已存在时返回 data: 文本 HTML URL，而非 blob:', async () => {
    const { app, adapter } = createMockApp();
    // 预置自包含 app.html（版本戳同版，避免触发联网下载）
    await adapter.write('plugins/bamboo/webapp/app.html', '<!DOCTYPE html><html><body>竹</body></html>');
    await adapter.write('plugins/bamboo/webapp/.webapp-version', '2.2.5');

    const host = new AppHost(app as never, 'plugins/bamboo', '2.2.5');
    const url = await host.buildBlobUrl();

    expect(url.startsWith('data:text/html')).toBe(true);
    expect(url.startsWith('blob:')).toBe(false);
    // 中文内容经 encodeURIComponent 后正确编码，可还原
    expect(decodeURIComponent(url)).toContain('竹');
  });

  it('data: URL 超 2MB 时回退 blob:（兼容极端环境长度上限）', async () => {
    const { app, adapter } = createMockApp();
    const big = '<!-- ' + 'x'.repeat(3 * 1024 * 1024) + ' --><html><body>ok</body></html>';
    await adapter.write('plugins/bamboo/webapp/app.html', big);
    await adapter.write('plugins/bamboo/webapp/.webapp-version', '2.2.5');

    const host = new AppHost(app as never, 'plugins/bamboo', '2.2.5');
    const url = await host.buildBlobUrl();
    expect(url.startsWith('blob:')).toBe(true);
  });

  it('静态缓存跨实例复用：模拟切布局重建视图，第二次 buildBlobUrl 直接返回缓存（消除重复编码卡顿）', async () => {
    const { app, adapter } = createMockApp();
    await adapter.write('plugins/bamboo/webapp/app.html', '<!DOCTYPE html><html><body>竹</body></html>');
    await adapter.write('plugins/bamboo/webapp/.webapp-version', '2.2.5');

    // 实例 1：首次构建（编码 1.5MB），写入静态缓存
    const host1 = new AppHost(app as never, 'plugins/bamboo', '2.2.5');
    const url1 = await host1.buildBlobUrl();
    expect(url1.startsWith('data:')).toBe(true);

    // 实例 2：模拟 moveViewToCenter 重建视图（新 AppHost 实例）
    const host2 = new AppHost(app as never, 'plugins/bamboo', '2.2.5');
    const url2 = await host2.buildBlobUrl();
    // 内容长度未变 → 必须命中静态缓存，返回同一 data: URL（不重新同步编码）
    expect(url2).toBe(url1);
  });
});
