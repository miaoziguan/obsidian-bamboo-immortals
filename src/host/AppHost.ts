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
      p = host.ensureWebapp(app.vault.adapter).catch(() => {
        // 后台预拉取失败不阻断，打开视图时会重试
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
    }

    if (!this.version) {
      return;
    }

    const url = `https://github.com/${this.repo}/releases/download/${this.version}/webapp.zip`;
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
      } catch {
        // 写入版本戳失败不影响使用
      }
    } catch (e) {
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
