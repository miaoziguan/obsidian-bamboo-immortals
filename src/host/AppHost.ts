import { App, DataAdapter, normalizePath, requestUrl } from 'obsidian';
import { unzipSync } from 'fflate';

/**
 * AppHost — webapp 资源加载与注入中心
 *
 * 加载策略（轻量、零内嵌）：
 *   1. 读取构建期生成的自包含 webapp/app.html（CSS 已内联、bundle 已内联为静态
 *      <script type="module"> 标签，无任何外部脚本、无占位符）。
 *   2. 将整页 HTML 以 blob URL 形式交给 iframe 加载。
 *
 * 由于所有 <script> 均在构建期（bundle-webapp.mjs）静态写入 app.html，运行时
 * main.js 不创建、不拼接任何 script 元素，规避安全扫描「动态注入脚本」误报。
 *
 * webapp 由发布流程打包为 webapp.zip 随版本分发（见 .github/workflows/release.yml），
 * 本地开发/内测通过 sync.sh 同步整个 webapp/ 目录（含 app.html），运行时直接读取，
 * 无需内嵌、无外部联网，main.js 保持轻量。
 *
 * 自愈（版本守卫）：运行时比对 webapp/.webapp-version 与当前插件版本。
 *   - 本地缺失 webapp/，或版本戳缺失（老 clone / 历史遗留）→ 信任磁盘或降级；
 *   - 版本不符（插件已升级但 webapp 未跟随）→ 重新从对应版本 GitHub Release
 *     自举下载 webapp.zip 并解压，使「webapp 更新经 GitHub 随插件版本送达」真正成立。
 */
export class AppHost {
  private app: App;
  private webappDir: string;
  private blobUrls: string[] = [];
  private readonly version: string;
  private readonly repo = 'miaoziguan/obsidian-bamboo-immortals';

  constructor(app: App, pluginDir: string, version: string) {
    this.app = app;
    this.webappDir = normalizePath(`${pluginDir}/webapp`);
    this.version = version;
  }

  // 后台预拉取的去重缓存：避免插件 onload 预拉取与视图打开时重复下载
  private static prefetchCache = new Map<string, Promise<void>>();

  /**
   * 后台预拉取：插件 onload 时调用，提前把缺失的 webapp 下载并解压到插件目录。
   * 正常安装（webapp/ 已随插件分发）时仅做一次存在性检查，几乎零开销。
   * 失败仅告警（不抛出），真正打开视图时 buildBlobUrl 会再次尝试；
   * 同一插件目录并发只触发一次下载。
   */
  static prefetch(app: App, pluginDir: string, version: string): Promise<void> {
    const key = normalizePath(`${pluginDir}/webapp`);
    let p = AppHost.prefetchCache.get(key);
    if (!p) {
      const host = new AppHost(app, pluginDir, version);
      p = host.ensureWebapp(app.vault.adapter).catch((e: unknown) => {
        console.warn(
          '[AppHost] 后台预拉取 webapp 失败（打开视图时将重试）：',
          e instanceof Error ? e.message : String(e)
        );
      });
      AppHost.prefetchCache.set(key, p);
    }
    return p;
  }

  async buildBlobUrl(): Promise<string> {
    const adapter = this.app.vault.adapter;

    // 自愈：webapp/ 缺失时从对应版本 Release 自举下载并解压
    await this.ensureWebapp(adapter);

    const appHtmlPath = normalizePath(`${this.webappDir}/app.html`);
    let html: string;
    try {
      html = await adapter.read(appHtmlPath);
    } catch {
      throw new Error('无法读取 webapp/app.html，且自动下载失败。请尝试在 Obsidian 中重新安装本插件，或手动放置 webapp/ 目录');
    }

    // 整页 HTML 已自包含（CSS 内联 + bundle 内联为静态 <script>），直接 blob 交给 iframe。
    // 运行时不创建、不拼接任何 script 元素。
    const pageBlob = new Blob([html], { type: 'text/html' });
    const pageUrl = URL.createObjectURL(pageBlob);
    this.blobUrls.push(pageUrl);
    return pageUrl;
  }

  /**
   * 自愈（版本守卫）：若本地 webapp 缺失，或已存在但版本戳与当前插件版本不符，
   * 则重新从 GitHub Release 下载对应版本的 webapp.zip 解压（覆盖）。
   * 正常安装（webapp/ 已随插件分发且版本匹配）完全不触发联网；仅缺失或过期时兜底。
   */
  private async ensureWebapp(adapter: DataAdapter): Promise<void> {
    const versionStampFile = '.webapp-version';
    const appHtmlPath = normalizePath(`${this.webappDir}/app.html`);
    const stampPath = normalizePath(`${this.webappDir}/${versionStampFile}`);

    if (await this.fileExists(adapter, appHtmlPath)) {
      // webapp/ 存在：仅当版本戳缺失（老 clone / 历史遗留）或版本不符时才重下，
      // 否则信任磁盘 —— BRAT / git-clone 随仓库同步的最新 webapp 即正确，无需联网。
      if (!(await this.fileExists(adapter, stampPath))) return;
      const local = await this.readVersionStamp(adapter, stampPath);
      if (local === this.version) return;
      console.log(
        `[AppHost] 本地 webapp 版本(${local}) 与插件版本(${this.version}) 不符，重新自举下载。`
      );
    }

    if (!this.version) {
      console.warn('[AppHost] 无法获取插件版本，跳过自举下载。请确认插件安装完整。');
      return;
    }

    const url = `https://github.com/${this.repo}/releases/download/${this.version}/webapp.zip`;
    console.log(`[AppHost] 未检测到匹配的本地 webapp，尝试自举下载：${url}`);
    try {
      const resp = await requestUrl({ url, method: 'GET' });
      if (resp.status < 200 || resp.status >= 300 || !resp.arrayBuffer) {
        throw new Error(`下载返回异常状态 ${resp.status}`);
      }
      await this.extractZip(adapter, resp.arrayBuffer);
      // webapp.zip 已携带 .webapp-version，解压后自动落盘；此处兜底再写一次，
      // 避免同版本反复重下。
      try {
        await adapter.write(stampPath, this.version);
      } catch (e) {
        console.warn('[AppHost] 写入 webapp 版本戳失败（不影响使用）：', e);
      }
      console.log('[AppHost] webapp 自举下载并解压完成。');
    } catch (e) {
      console.error('[AppHost] webapp 自举下载失败：', e);
      throw new Error(
        `无法自动获取 webapp（${e instanceof Error ? e.message : '未知错误'}）。` +
        '请检查网络后重试，或在 Obsidian 中重新安装本插件。'
      );
    }
  }

  private async readVersionStamp(adapter: DataAdapter, filePath: string): Promise<string | null> {
    try {
      return (await adapter.read(filePath)).trim();
    } catch {
      return null;
    }
  }

  private async extractZip(adapter: DataAdapter, buffer: ArrayBuffer): Promise<void> {
    // fflate 零依赖（无 setimmediate 之类会动态创建 <script> 的传递依赖），
    // 返回的 entries 仅含文件（不含目录条目），目录由 ensureParentDir 按需创建。
    const files = unzipSync(new Uint8Array(buffer));
    for (const [rawPath, content] of Object.entries(files)) {
      const rel = normalizePath(rawPath.replace(/^\.?\//, ''));
      if (!rel) continue;
      const target = normalizePath(`${this.webappDir}/${rel}`);
      await this.ensureParentDir(adapter, target);
      // Uint8Array → 独立 ArrayBuffer，避免共享底层 buffer 导致越界
      await adapter.writeBinary(target, content.slice().buffer);
    }
  }

  private async ensureParentDir(adapter: DataAdapter, filePath: string): Promise<void> {
    const parts = filePath.split('/');
    let acc = '';
    for (let i = 0; i < parts.length - 1; i++) {
      acc += (acc ? '/' : '') + parts[i];
      if (acc && !(await this.fileExists(adapter, acc))) {
        try {
          await adapter.mkdir(acc);
        } catch {
          // 可能已被其他条目先行创建，忽略
        }
      }
    }
  }

  private async fileExists(adapter: DataAdapter, path: string): Promise<boolean> {
    try {
      return await adapter.exists(path);
    } catch {
      return false;
    }
  }

  destroy(): void {
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];
  }
}
