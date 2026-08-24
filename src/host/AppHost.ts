import { App, DataAdapter, normalizePath, requestUrl, Notice } from 'obsidian';
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
      p = host.ensureWebapp(app.vault.adapter).catch(() => {
        // 后台预拉取失败不阻断，打开视图时会重试
      });
      AppHost.prefetchCache.set(key, p);
    }
    return p;
  }

  async buildBlobUrl(entryFile: string = 'app.html'): Promise<string> {
    const adapter = this.app.vault.adapter;

    // 自愈：版本不符时从对应版本 Release 自举下载并解压覆盖。
    // 下载失败（多为网络/防火墙问题）不静默吞掉——明确告知用户是网络导致、
    // 建议开启魔法后重试，但仍用本地已有旧版打开视图（不阻断使用）。
    try {
      await this.ensureWebapp(adapter);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      new Notice(
        '竹仙 webapp 自检更新失败（网络问题）：' + msg +
        '。请检查网络或开启代理（魔法）后，在设置中重新打开本视图即可重试更新。当前仍使用本地旧版。',
        10000
      );
    }

    const appHtmlPath = normalizePath(`${this.webappDir}/${entryFile}`);
    let html: string;
    try {
      html = await adapter.read(appHtmlPath);
    } catch {
      throw new Error(`无法读取 webapp/${entryFile}，且自动下载失败。请尝试在 Obsidian 中重新安装本插件，或手动放置 webapp/ 目录`);
    }

    // 整页 HTML 已自包含（CSS 内联 + bundle 内联为静态 <script>），直接 blob 交给 iframe。
    // 运行时不创建、不拼接任何 script 元素。
    const pageBlob = new Blob([html], { type: 'text/html' });
    const pageUrl = URL.createObjectURL(pageBlob);
    this.blobUrls.push(pageUrl);
    return pageUrl;
  }

  /**
   * 自愈（版本守卫）：确保磁盘 webapp 与当前插件版本一致。
   *   - 版本戳缺失（git-clone 开发机 / 老安装）：信任本地，不联网，避免覆盖未发布改动；
   *   - 本地版本 >= 当前版本：视为同版或开发版，不下载；
   *   - 本地版本 < 当前版本：明确过期（插件已升级但 webapp 未跟随），从对应版本
   *     GitHub Release 重新自举下载 webapp.zip 并解压覆盖，使移动端/终端用户的
   *     webapp 能随插件版本经 GitHub Release 送达更新。
   */
  private async ensureWebapp(adapter: DataAdapter): Promise<void> {
    const appHtmlPath = normalizePath(`${this.webappDir}/app.html`);
    const htmlExists = await this.fileExists(adapter, appHtmlPath);

    if (!htmlExists) {
      // 完全缺失（首次安装 / 文件被误删）：自举下载兜底
      return this._downloadAndExtract(adapter);
    }

    // 版本戳：webapp/.webapp-version 由 bundle-webapp.mjs 生成，随 webapp.zip 分发。
    // 开发者 git-clone（.gitignore 忽略该文件）本地无戳 → 信任本地不联网。
    const stampPath = normalizePath(`${this.webappDir}/.webapp-version`);
    let localVersion: string | null = null;
    try {
      localVersion = (await adapter.read(stampPath)).trim();
    } catch {
      localVersion = null; // 戳缺失
    }

    // 戳缺失 → 信任本地（开发机 / 历史遗留）
    if (!localVersion) {
      return;
    }
    // 本地版本 >= 当前版本 → 同版或开发版，不下载
    if (AppHost._compareVersion(localVersion, this.version) >= 0) {
      return;
    }
    // 本地版本 < 当前版本 → 过期，联网更新
    return this._downloadAndExtract(adapter);
  }

  /** 下载对应版本 webapp.zip 并解压覆盖；失败抛错由调用方处理 */
  private async _downloadAndExtract(adapter: DataAdapter): Promise<void> {
    if (!this.version) return;
    const url = `https://github.com/${this.repo}/releases/download/${this.version}/webapp.zip`;
    try {
      const resp = await requestUrl({ url, method: 'GET' });
      if (resp.status < 200 || resp.status >= 300 || !resp.arrayBuffer) {
        throw new Error(`下载返回异常状态 ${resp.status}`);
      }
      await this.extractZip(adapter, resp.arrayBuffer);
    } catch (e) {
      throw new Error(
        `无法自动获取 webapp（${e instanceof Error ? e.message : '未知错误'}）。` +
        '多为网络/防火墙问题：请检查网络或开启代理（魔法）后重试；' +
        '也可在 Obsidian 中重新安装本插件。'
      );
    }
  }

  /**
   * 版本比较：a > b 返回正数，a === b 返回 0，a < b 返回负数。
   * 仅比较主.次.修的数字段，非数字段忽略。
   */
  private static _compareVersion(a: string, b: string): number {
    const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
    const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const va = pa[i] || 0;
      const vb = pb[i] || 0;
      if (va !== vb) return va - vb;
    }
    return 0;
  }



  private async extractZip(adapter: DataAdapter, buffer: ArrayBuffer): Promise<void> {
    // fflate 零依赖（无 setimmediate 之类会动态创建 <script> 的传递依赖），
    // 返回的 entries 仅含文件（不含目录条目），目录由 ensureParentDirSafe 按需创建。
    const files = unzipSync(new Uint8Array(buffer));
    const entries: { target: string; content: Uint8Array }[] = [];
    for (const [rawPath, content] of Object.entries(files)) {
      const rel = normalizePath(rawPath.replace(/^\.?\//, ''));
      if (!rel) continue;
      if (rel.endsWith('/')) continue; // 目录占位条目，无需写出
      entries.push({ target: normalizePath(`${this.webappDir}/${rel}`), content });
    }

    // 第一遍：先建好所有父目录。若某一级已被同名文件占用（zip 目录占位条目、
    // 或本地残留的坏文件），先删除再建目录，避免后续 writeBinary 触发 ENOTDIR。
    for (const { target } of entries) {
      await this.ensureParentDirSafe(adapter, target);
    }

    // 第二遍：写文件。若某条目路径已被当作目录写入（占位文件与真实目录冲突），
    // 跳过该占位文件，不覆盖为文件，保证 assets/scripts/* 等嵌套文件能正常落盘。
    for (const { target, content } of entries) {
      if (await this.isFolder(adapter, target)) continue;
      // Uint8Array → 独立 ArrayBuffer，避免共享底层 buffer 导致越界
      await adapter.writeBinary(target, content.slice().buffer);
    }
  }

  /**
   * 逐级确保父目录存在；遇到「同名文件占位」时先删除再 mkdir，
   * 解决 zip 占位条目 / 本地坏文件导致 writeBinary 抛 ENOTDIR 的问题。
   */
  private async ensureParentDirSafe(adapter: DataAdapter, filePath: string): Promise<void> {
    const parts = filePath.split('/');
    let acc = '';
    for (let i = 0; i < parts.length - 1; i++) {
      acc += (acc ? '/' : '') + parts[i];
      if (!acc) continue;
      const kind = await this.statKind(adapter, acc);
      if (kind === 'folder') continue; // 已是目录，跳过
      if (kind === 'file') {
        try {
          await adapter.remove(acc);
        } catch {
          // 删除失败也不阻断，交由下方 mkdir 暴露真实错误
        }
      }
      try {
        await adapter.mkdir(acc);
      } catch {
        // 可能已被其他条目先行创建，忽略
      }
    }
  }

  /** 返回路径类型：'file' | 'folder' | 'none'（不存在或无法判定） */
  private async statKind(adapter: DataAdapter, path: string): Promise<'file' | 'folder' | 'none'> {
    try {
      const st = await adapter.stat(path);
      if (!st) return 'none';
      return st.type === 'folder' ? 'folder' : 'file';
    } catch {
      return 'none';
    }
  }

  private async isFolder(adapter: DataAdapter, path: string): Promise<boolean> {
    return (await this.statKind(adapter, path)) === 'folder';
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
