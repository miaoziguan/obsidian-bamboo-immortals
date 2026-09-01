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

  /** 静态缓存已编码的 data: URL（跨视图实例共享，消除切布局模式重建视图时
   *  反复同步 encodeURIComponent(1.5MB) 的主线程卡顿 / 白屏）。
   *  仅缓存 data: URL（blob: 会被 revokeObjectURL 失效，不可跨实例共享）。
   *  data: 字符串无资源泄漏，生命周期随进程，故 destroy 不清空。 */
  private static cachedPageUrl: string | null = null;
  private static cachedHtmlHash = -1;
  private readonly version: string;
  private readonly repo = 'miaoziguan/obsidian-bamboo-immortals';

  constructor(app: App, pluginDir: string, version: string) {
    this.app = app;
    this.webappDir = normalizePath(`${pluginDir}/webapp`);
    this.version = version;
  }

  // 下载去重锁：按 webapp 目录维度，保证 prefetch 与 buildBlobUrl 并发时仅真实下载一次。
  // 否则两路各自 new AppHost().ensureWebapp() 会交叉写同一目录，移动端极易出现 app.html 半截 → 空白。
  private static downloadLocks = new Map<string, Promise<void>>();

  /**
   * 后台预拉取：插件 onload 时调用，提前把缺失的 webapp 下载并解压到插件目录。
   * 正常安装（webapp/ 已随插件分发）时仅做一次存在性检查，几乎零开销。
   * 失败仅告警（不抛出），真正打开视图时 buildBlobUrl 会再次尝试；
   * 同一插件目录并发只触发一次下载（见 ensureWebapp 的 downloadLocks）。
   */
  /**
   * 后台预拉取：插件 onload 时调用，提前把缺失的 webapp 下载并解压到插件目录。
   * 用独立的 prefetchPromises 缓存（不写 downloadLocks），避免 prefetch 的 pending
   * 下载 Promise 阻塞视图打开时的独立下载；prefetch 失败仅告警，视图打开时会重试。
   */
  private static prefetchPromises = new Map<string, Promise<void>>();
  static prefetch(app: App, pluginDir: string, version: string): Promise<void> {
    const key = normalizePath(`${pluginDir}/webapp`);
    let p = AppHost.prefetchPromises.get(key);
    if (!p) {
      const host = new AppHost(app, pluginDir, version);
      p = host.ensureWebapp(app.vault.adapter).catch(() => {
        // 后台预拉取失败不阻断，视图打开时会重试
      });
      AppHost.prefetchPromises.set(key, p);
      void p.finally(() => { if (AppHost.prefetchPromises.get(key) === p) AppHost.prefetchPromises.delete(key); });
    }
    return p;
  }

  /**
   * 轻量内容哈希（djb2 变体），作为 data: URL 缓存的判据。
   * 不能用 html.length 代替：不同内容完全可能长度相同，那样会错误复用旧 URL，
   * 使 webapp 更新后视图仍加载上一版代码（现象诡异且极难定位）。
   * 遍历 1.5MB 字符串仅数毫秒，远小于重复 encodeURIComponent 的开销。
   */
  private static hashHtml(html: string): number {
    let h = 5381;
    for (let i = 0; i < html.length; i++) {
      h = ((h << 5) + h + html.charCodeAt(i)) | 0; // h * 33 + c
    }
    return h;
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

    // 整页 HTML 已自包含（CSS 内联 + bundle 内联为静态 <script>）。
    // 运行时不创建、不拼接任何 script 元素。
    // 统一用 data: URL 承载（而非 blob:）：
    //   鸿蒙 ArkWeb（及老旧安卓 WebView）对 blob: 源 iframe 加载 <script type=module> /
    //   Shadow DOM 有兼容性限制，data: URL 在桌面 Chromium / 安卓 WebView / 鸿蒙 ArkWeb
    //   三类平台上兼容性均 ≥ blob:，可绕开 blob 源 opaque origin 下的执行受限问题。
    //   编码用 encodeURIComponent（非 base64）以减小体积膨胀（~10-20% vs base64 ~33%）。
    // 内容长度未变时复用已编码的 data: URL，避免切布局模式重建视图时
    // 反复同步 encodeURIComponent(1.5MB) 造成主线程卡顿 / 白屏。
    const hash = AppHost.hashHtml(html);
    if (AppHost.cachedPageUrl && AppHost.cachedHtmlHash === hash) {
      return AppHost.cachedPageUrl;
    }
    const pageUrl = this.buildPageUrl(html);
    // 仅 data: URL 可安全缓存（blob: 会被 destroy 的 revokeObjectURL 失效，多视图共享会崩）
    if (pageUrl.startsWith('data:')) {
      AppHost.cachedPageUrl = pageUrl;
      AppHost.cachedHtmlHash = hash;
    }
    return pageUrl;
  }

  /**
   * 生成承载自包含 HTML 的 iframe src。
   * 优先 data: URL；当 data: 超长（部分环境对 URL 长度有上限）时回退 blob:
   * （桌面端原路径，兼容性兜底）。
   * @param html 自包含 HTML 字符串（CSS 内联 + bundle 内联）
   */
  private buildPageUrl(html: string): string {
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    // 极端环境对 data: URL 长度设限（通常 2MB+），超界回退 blob:。
    if (dataUrl.length > 2 * 1024 * 1024) {
      const blob = new Blob([html], { type: 'text/html' });
      return URL.createObjectURL(blob);
    }
    return dataUrl;
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
      const p = this._downloadGuarded(adapter);
      return p;
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

    // 戳缺失 → 默认信任本地（开发机 / 历史遗留），但本地 app.html 若明显损坏
    // （如历史并发下载留下的半截文件）则仍强制联网更新，避免持续空白。
    if (!localVersion) {
      const healthy = await this._isAppHtmlHealthy(adapter);
      if (healthy) {
        return;
      }
      const p = this._downloadGuarded(adapter);
      return p;
    }
    // 本地版本 >= 当前版本 → 同版或开发版，不下载
    if (AppHost._compareVersion(localVersion, this.version) >= 0) {
      return;
    }
    // 本地版本 < 当前版本 → 过期，联网更新（走去重锁，避免多路并发重复下载）
    const p = this._downloadGuarded(adapter);
    return p;
  }

  /** 经 downloadLocks 去重的下载入口：并发调用（prefetch / buildBlobUrl）共享同一 Promise */
  private _downloadGuarded(adapter: DataAdapter): Promise<void> {
    const key = this.webappDir;
    let p = AppHost.downloadLocks.get(key);
    if (!p) {
      p = this._downloadAndExtract(adapter).catch((e) => {
        // 下载失败立即清锁，允许视图打开/用户重试时重新触发下载，
        // 而不是拿到已落定的失败 Promise 而跳过（否则 webapp 永远缺失）。
        AppHost.downloadLocks.delete(key);
        throw e;
      });
      AppHost.downloadLocks.set(key, p);
      // Promise 落定（成功或失败）后释放锁，允许下次升级再触发；失败分支已在上面删除。
      void p.finally(() => { if (AppHost.downloadLocks.get(key) === p) AppHost.downloadLocks.delete(key); });
    }
    return p;
  }

  /** 下载对应版本 webapp.zip 并解压覆盖；失败抛错由调用方处理 */
  private async _downloadAndExtract(adapter: DataAdapter): Promise<void> {
    if (!this.version) return;
    const url = `https://github.com/${this.repo}/releases/download/${this.version}/webapp.zip`;
    try {
      // requestUrl 走 Obsidian 内置网络栈（不受浏览器 CORS 限制，国内访问 GitHub 比 fetch 稳）；
      // 但其类型不支持 timeout 字段，故用 Promise.race 包一层 15s 超时，避免连接挂起
      // 导致 _mountWebapp 的 await buildBlobUrl 永久挂起、iframe 永远无 src、视图被
      // Obsidian 判定 deferred view 超时抛弃而永久卡「加载中」。
      const TIMEOUT_MS = 15000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('下载超时（15s）')), TIMEOUT_MS);
      });
      const resp = await Promise.race([
        requestUrl({ url, method: 'GET' }),
        timeoutPromise,
      ]);
      if (resp.status < 200 || resp.status >= 300 || !resp.arrayBuffer) {
        throw new Error(`下载返回异常状态 ${resp.status}`);
      }
      await this.extractZip(adapter, resp.arrayBuffer);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误';
      const isTimeout = /超时|timeout/i.test(msg);
      throw new Error(
        `无法自动获取 webapp（${msg}）。` +
        (isTimeout
          ? '下载超时（15s）：多为网络/防火墙问题。请检查网络或开启代理（魔法）后，在设置中重新打开本视图即可重试。'
          : '多为网络/防火墙问题：请检查网络或开启代理（魔法）后重试；也可在 Obsidian 中重新安装本插件。')
      );
    }
  }

  /**
   * 轻量健康校验：本地 app.html 是否存在且为完整自包含页面。
   * 用于「版本戳缺失」场景兜底——历史并发下载可能留下半截/损坏文件，
   * 此时不应盲目信任本地，应触发联网更新。开发机正常完整页面一定通过。
   */
  private async _isAppHtmlHealthy(adapter: DataAdapter): Promise<boolean> {
    try {
      const html = await adapter.read(normalizePath(`${this.webappDir}/app.html`));
      if (typeof html !== 'string' || html.length < 1000) return false;
      // 自包含页面必含 <script（内联 bundle），无则视为损坏
      return html.includes('<script');
    } catch {
      return false;
    }
  }

  // 默认按文本用 adapter.write（UTF-8 字符串），仅已知二进制扩展名才 writeBinary。
  // 关键：app.html/css/js 等 1MB+ 文本若用 writeBinary 当二进制写，在安卓
  // CapacitorAdapter 下有不确定性（社区报告大 buffer 写入有 truncate/挂起风险），
  // 按语义用 write 更稳且规避该风险。隐藏文件（如 .webapp-version）无标准扩展名，
  // 默认走文本分支，安全。
  private static BINARY_EXT = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'avif',
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    'mp3', 'wav', 'ogg', 'mp4', 'webm',
    'zip',
  ]);
  private async _writeEntry(adapter: DataAdapter, target: string, content: Uint8Array): Promise<void> {
    const ext = target.split('.').pop()?.toLowerCase() || '';
    if (AppHost.BINARY_EXT.has(ext)) {
      await adapter.writeBinary(target, content.slice().buffer);
    } else {
      // Uint8Array → UTF-8 字符串（webapp 文本资源均为 UTF-8）
      const text = new TextDecoder('utf-8').decode(content);
      await adapter.write(target, text);
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
    const entries: { rel: string; target: string; content: Uint8Array }[] = [];
    for (const [rawPath, content] of Object.entries(files)) {
      const rel = normalizePath(rawPath.replace(/^\.?\//, ''));
      if (!rel) continue;
      if (rel.endsWith('/')) continue; // 目录占位条目，无需写出
      entries.push({ rel, target: normalizePath(`${this.webappDir}/${rel}`), content });
    }

    // 两段式写入，防止「写入过程中被读取方看到半截 app.html」导致移动端空白：
    //   ① 全部解压到临时目录 webapp/.dl/（与正式目录隔离，读取方毫不知情）；
    //   ② commit 阶段再把文件落到正式目录，且入口文件（app.html/archive.html）
    //      最后写，确保任何时刻入口文件要么完整旧版、要么完整新版。
    const tmpDir = normalizePath(`${this.webappDir}/.dl`);
    // 清空可能残留的临时目录
    await this.removeRecursivelySafe(adapter, tmpDir);
    for (const { rel, content } of entries) {
      const tmpTarget = normalizePath(`${tmpDir}/${rel}`);
      await this.ensureParentDirSafe(adapter, tmpTarget);
      if (await this.isFolder(adapter, tmpTarget)) continue;
      await this._writeEntry(adapter, tmpTarget, content);
    }

    // commit：assets 等先写，入口文件最后写
    const entryFiles = new Set(['app.html', 'archive.html']);
    const ordered = [...entries].sort((a, b) => {
      const aEntry = entryFiles.has(a.rel) ? 1 : 0;
      const bEntry = entryFiles.has(b.rel) ? 1 : 0;
      return aEntry - bEntry; // 0 在前（先写），1 在后（最后写入口文件）
    });
    for (const { target, content } of ordered) {
      await this.ensureParentDirSafe(adapter, target);
      if (await this.isFolder(adapter, target)) continue;
      await this._writeEntry(adapter, target, content);
    }

    // 清理临时目录
    await this.removeRecursivelySafe(adapter, tmpDir);
  }

  /** 递归删除目录（尽力而为，失败不阻断） */
  private async removeRecursivelySafe(adapter: DataAdapter, dir: string): Promise<void> {
    const kind = await this.statKind(adapter, dir);
    if (kind !== 'folder') return;
    try {
      const listed = await adapter.list(dir);
      const items: string[] = [...(listed.files || []), ...(listed.folders || [])];
      for (const item of items) {
        const child = normalizePath(`${dir}/${item}`);
        const childKind = await this.statKind(adapter, child);
        if (childKind === 'folder') {
          await this.removeRecursivelySafe(adapter, child);
        } else {
          try { await adapter.remove(child); } catch { /* 忽略 */ }
        }
      }
      try { await adapter.rmdir(dir, true); } catch { /* 忽略 */ }
    } catch {
      // 目录不可用（如不支持 list），忽略
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
    // 注意：cachedPageUrl 为静态字段（data: 字符串无资源泄漏、跨实例复用），
    // 不在 destroy 清空——避免切布局模式重建视图后丢失缓存、再次同步编码 1.5MB。
  }
}
