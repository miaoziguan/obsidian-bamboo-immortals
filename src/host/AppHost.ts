import { App, DataAdapter, normalizePath, requestUrl } from 'obsidian';
import JSZip from 'jszip';

/**
 * AppHost — webapp 资源加载与注入中心
 *
 * 策略：
 *   1. 若 webapp/assets/scripts/bundle.js 存在（构建产物），
 *      替换所有外部 module 脚本为单个 bundle <script>，零 import 问题。
 *   2. 若不存在，回退到逐个 blob URL + import 重写。
 *
 * webapp 由发布流程打包为 webapp.zip 随版本分发（见 .github/workflows/release.yml），
 * 本地开发/内测通过 sync.sh 同步整个 webapp/ 目录，运行时直接读取插件目录，
 * 无需内嵌、无外部联网，main.js 保持轻量。
 *
 * 自愈：若插件目录缺失 webapp/（例如从内嵌版 2.1.8/2.1.9 升级、而分发渠道
 * 未重新放置 webapp/），detect 到 index.html 缺失时自动从对应版本 GitHub Release
 * 下载 webapp.zip 并解压到插件目录，避免「加载失败」。
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

  async buildBlobUrl(): Promise<string> {
    const adapter = this.app.vault.adapter;

    // 自愈：webapp/ 缺失时从对应版本 Release 自举下载并解压
    await this.ensureWebapp(adapter);

    const indexPath = normalizePath(`${this.webappDir}/index.html`);
    let html: string;
    try {
      html = await adapter.read(indexPath);
    } catch {
      throw new Error('无法读取 webapp/index.html，且自动下载失败。请尝试在 Obsidian 中重新安装本插件，或手动放置 webapp/ 目录');
    }

    // 内联 CSS
    html = await this.inlineStyles(html, adapter);

    // JS 处理 — 优先使用 bundle
    html = await this.processScripts(html, adapter);

    // bridge.js 选择逻辑（仅非 bundle 模式需要）
    if (!await this.fileExists(adapter, normalizePath(`${this.webappDir}/assets/scripts/bundle.js`))) {
      html = this.fixBridgeSelection(html);
    }

    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    this.blobUrls.push(blobUrl);
    return blobUrl;
  }

  private async inlineStyles(html: string, adapter: DataAdapter): Promise<string> {
    const linkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi;
    const links: Array<{ full: string; href: string }> = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({ full: match[0], href: match[1] });
    }
    for (const { full, href } of links) {
      const cleanHref = href.split('?')[0];
      const cssPath = normalizePath(`${this.webappDir}/${cleanHref}`);
      try {
        const css = await adapter.read(cssPath);
        html = html.replace(full, `<style data-src="${cleanHref}">\n${css}\n</style>`);
      } catch (e) {
        console.warn(`[AppHost] 无法加载 CSS: ${cssPath}`, e);
      }
    }
    return html;
  }

  private async processScripts(html: string, adapter: DataAdapter): Promise<string> {
    const bundlePath = normalizePath(`${this.webappDir}/assets/scripts/bundle.js`);
    const hasBundle = await this.fileExists(adapter, bundlePath);

    if (hasBundle) {
      return await this.useBundle(html, adapter, bundlePath);
    }
    return await this.useIndividualScripts(html, adapter);
  }

  /**
   * 使用构建产物 bundle.js — 替换所有外部 module 脚本为单个脚本
   */
  private async useBundle(html: string, adapter: DataAdapter, bundlePath: string): Promise<string> {
    console.log('[AppHost] 使用 bundle.js');
    const bundleContent = await adapter.read(bundlePath);
    const blob = new Blob([bundleContent], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    this.blobUrls.push(blobUrl);

    // 替换所有外部 <script type="module" src="...">
    html = html.replace(/<script\s+[^>]*?src=["'][^"']+["'][^>]*?>\s*<\/script>/gi, '');

    // 在第一个 <script> 标签前插入 bundle（确保 globals 在 inline scripts 之前加载）
    const bundleTag = `<script src="${blobUrl}"></script>`;
    const firstScript = html.search(/<script/i);
    if (firstScript >= 0) {
      html = html.slice(0, firstScript) + bundleTag + '\n' + html.slice(firstScript);
    } else {
      html = html.replace('</body>', `${bundleTag}\n</body>`);
    }

    return html;
  }

  /**
   * 回退方案：逐个创建 blob URL + 重写 import 路径
   */
  private async useIndividualScripts(html: string, _adapter: DataAdapter): Promise<string> {
    // 回退方案：不处理（直接返回原始 HTML）
    console.warn('[AppHost] 未找到 bundle.js，跳过 JS 处理');
    return html;
  }

  private async fileExists(adapter: DataAdapter, path: string): Promise<boolean> {
    try {
      return await adapter.exists(path);
    } catch {
      return false;
    }
  }

  private fixBridgeSelection(html: string): string {
    const oldScript = /<script>\s*\/\/ Obsidian iframe 检测[\s\S]*?<\/script>/;
    html = html.replace(oldScript, '<script type="module" src="assets/scripts/storage/bridge.js?__BUILD__"></script>');
    return html;
  }

  /**
   * 自愈：若本地 webapp/index.html 不存在，则从 GitHub Release 下载对应版本的 webapp.zip 解压。
   * 正常安装（webapp/ 已随插件分发）完全不触发联网；仅缺失时兜底。
   */
  private async ensureWebapp(adapter: DataAdapter): Promise<void> {
    const indexPath = normalizePath(`${this.webappDir}/index.html`);
    if (await this.fileExists(adapter, indexPath)) return;

    if (!this.version) {
      console.warn('[AppHost] 无法获取插件版本，跳过自举下载。请确认插件安装完整。');
      return;
    }

    const url = `https://github.com/${this.repo}/releases/download/${this.version}/webapp.zip`;
    console.log(`[AppHost] 未检测到本地 webapp，尝试自举下载：${url}`);
    try {
      const resp = await requestUrl({ url, method: 'GET' });
      if (resp.status < 200 || resp.status >= 300 || !resp.arrayBuffer) {
        throw new Error(`下载返回异常状态 ${resp.status}`);
      }
      await this.extractZip(adapter, resp.arrayBuffer);
      console.log('[AppHost] webapp 自举下载并解压完成。');
    } catch (e) {
      console.error('[AppHost] webapp 自举下载失败：', e);
      throw new Error(
        `无法自动获取 webapp（${e instanceof Error ? e.message : '未知错误'}）。` +
        '请检查网络后重试，或在 Obsidian 中重新安装本插件。'
      );
    }
  }

  private async extractZip(adapter: DataAdapter, buffer: ArrayBuffer): Promise<void> {
    const zip = await JSZip.loadAsync(buffer);
    for (const [rawPath, entry] of Object.entries(zip.files)) {
      const rel = normalizePath(rawPath.replace(/^\.?\//, ''));
      if (!rel) continue;
      const target = normalizePath(`${this.webappDir}/${rel}`);
      if (entry.dir) {
        if (!(await this.fileExists(adapter, target))) {
          await adapter.mkdir(target);
        }
        continue;
      }
      await this.ensureParentDir(adapter, target);
      const content = await entry.async('arraybuffer');
      await adapter.writeBinary(target, content);
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

  destroy(): void {
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];
  }
}
