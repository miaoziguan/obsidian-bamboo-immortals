import { Plugin, WorkspaceLeaf, Notice } from 'obsidian';
import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as https from 'https';
import { DailyReviewView, VIEW_TYPE_DAILY_REVIEW } from './src/views/DailyReviewView';
import { LocalServer } from './src/server/LocalServer';
import { ThemeBridge } from './src/bridge/ThemeBridge';
import {
  PluginSettings,
  DEFAULT_SETTINGS,
  type BambooReviewSettings,
} from './src/settings/PluginSettings';

/**
 * BambooReviewPlugin - 竹林修仙传 Obsidian 插件入口
 *
 * 职责：
 * 1. 注册 View 类型
 * 2. 注册命令（打开复盘、前/后一天、统计面板）
 * 3. 注册设置面板
 * 4. 管理插件生命周期
 */
/** 纯 Node.js ZIP 解压，不依赖系统 unzip/PowerShell。异步读取+解压，仅字节解析保持同步。 */
async function extractZip(source: string | Buffer, destDir: string): Promise<void> {
  const buf = typeof source === 'string' ? await fs.promises.readFile(source) : source;
  let pos = 0;

  const read16 = () => { const v = buf.readUInt16LE(pos); pos += 2; return v; };
  const read32 = () => { const v = buf.readUInt32LE(pos); pos += 4; return v; };
  const skip = (n: number) => { pos += n; };

  const writes: Promise<void>[] = [];

  // 扫描所有 local file header（签名 0x04034b50）
  while (pos < buf.length - 4) {
    const sig = buf.readUInt32LE(pos);
    if (sig !== 0x04034b50) break;

    pos += 4;
    read16(); // version
    read16(); // flags
    const method = read16();
    skip(4); // mod time, mod date
    read32(); // crc32
    const compressedSize = read32();
    const uncompressedSize = read32();
    const nameLen = read16();
    const extraLen = read16();
    const fileName = buf.toString('utf-8', pos, pos + nameLen);
    pos += nameLen + extraLen;

    // 跳过目录条目
    if (fileName.endsWith('/') || fileName.endsWith('\\')) {
      pos += compressedSize;
      continue;
    }

    const outPath = path.join(destDir, fileName);
    const dir = path.dirname(outPath);

    const data = buf.subarray(pos, pos + compressedSize);
    pos += compressedSize;

    if (method === 0) {
      writes.push(fs.promises.mkdir(dir, { recursive: true }).then(() => fs.promises.writeFile(outPath, data)));
      continue;
    }

    if (method === 8) {
      writes.push((async () => {
        let bytes: Buffer;
        try {
          bytes = zlib.inflateRawSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
          if (bytes.length !== uncompressedSize) bytes = bytes.subarray(0, uncompressedSize);
        } catch {
          bytes = zlib.inflateSync(data);
        }
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(outPath, bytes);
      })());
      continue;
    }

    throw new Error(`Unsupported compression method: ` + method + ' (' + fileName + ')');
  }
}

/** 从 GitHub Release 下载 webapp.zip 并解压，内置 30 秒超时防止网络不通时永久挂起 */
function downloadAndExtractWebapp(_pluginDir: string, destDir: string, version: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const DOWNLOAD_TIMEOUT_MS = 30_000;
    const url = `https://github.com/miaoziguan/obsidian-bamboo-immortals/releases/download/${version}/webapp.zip`;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const clearTimer = () => { if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; } };
    const fail = (err: Error) => { clearTimer(); reject(err); };

    timeoutId = setTimeout(() => {
      fail(new Error(`下载超时（${DOWNLOAD_TIMEOUT_MS / 1000}s），请检查网络连通性: ${url}`));
    }, DOWNLOAD_TIMEOUT_MS);

    const fetchWithRedirect = (targetUrl: string, cb: (chunks: Buffer[]) => void): void => {
      https.get(targetUrl, { headers: { 'User-Agent': 'obsidian-bamboo-immortals' } }, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          const loc = res.headers.location;
          if (!loc) { fail(new Error('重定向缺少 Location 头')); return; }
          fetchWithRedirect(loc, cb);
          return;
        }
        if (res.statusCode !== 200) {
          fail(new Error(`HTTP ${res.statusCode}: ${targetUrl}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => { clearTimer(); cb(chunks); });
        res.on('error', (e) => fail(e instanceof Error ? e : new Error(String(e))));
      }).on('error', (e) => fail(e instanceof Error ? e : new Error(String(e))));
    };

    fetchWithRedirect(url, (chunks) => {
      extractZip(Buffer.concat(chunks), destDir).then(resolve).catch((e) => reject(e instanceof Error ? e : new Error(String(e))));
    });
  });
}

/** 后台异步初始化 webapp，不阻塞插件的 onload 返回 */
function setupWebappInBackground(
  this: BambooReviewPlugin,
  webappDir: string,
  pluginDir: string,
  vaultBasePath: string,
  currentVersion: string
): void {
  const webappVersionFile = path.join(webappDir, '.version');
  const needsUpdate = !fs.existsSync(webappVersionFile) ||
    (() => { try { return fs.readFileSync(webappVersionFile, 'utf-8').trim() !== currentVersion; } catch { return true; } })();

  if (!needsUpdate) {
    this.webappReady = true;
    return;
  }

  // 用 setImmediate / setTimeout 推迟到下一个 tick，确保 onload 先返回
  setImmediate(() => {
    void (async () => {
    try {
      if (fs.existsSync(webappDir)) {
        try { fs.rmSync(webappDir, { recursive: true, force: true }); } catch { /* 目录可能不存在，忽略 */ }
      }
      const webappZip = path.join(vaultBasePath, pluginDir, 'webapp.zip');
      fs.mkdirSync(webappDir, { recursive: true });

      if (fs.existsSync(webappZip)) {
        new Notice('竹林修仙传: 正在解压资源包…', 0);
        await extractZip(webappZip, webappDir);
        try { fs.unlinkSync(webappZip); } catch { /* 解压产物已就位，删除 zip 失败可忽略 */ }
        new Notice('竹林修仙传: 资源包已更新', 3000);
      } else {
        const downloadNotice = new Notice('竹林修仙传: 正在下载资源包…', 0);
        console.debug('[BambooReview] Downloading webapp from release', currentVersion);
        await downloadAndExtractWebapp(pluginDir, webappDir, currentVersion);
        downloadNotice.hide();
        new Notice('竹林修仙传: 资源包安装完成', 4000);
      }

      fs.writeFileSync(webappVersionFile, currentVersion, 'utf-8');
      this.webappReady = true;
    } catch (e) {
      console.error('[BambooReview] Webapp setup failed:', e);
        new Notice('竹林修仙传: 资源包安装失败，请检查网络后重启 Obsidian', 0);
    }
    })();
  });
}

export default class BambooReviewPlugin extends Plugin {
  settings: BambooReviewSettings = DEFAULT_SETTINGS;
  private localServer: LocalServer | null = null;
  private serverUrl = '';
  /** webapp 资源是否就绪（可用于首屏展示 loading 状态） */
  webappReady = false;

  async onload(): Promise<void> {
    // 加载设置
    await this.loadSettings();

    // 启动本地 HTTP 服务器
    const pluginDir = this.manifest.dir;
    if (pluginDir) {
      const vaultBasePath = (this.app.vault.adapter as unknown as { basePath: string }).basePath || '';
      const webappDir = path.join(vaultBasePath, pluginDir, 'webapp');
      const webappIndexPath = path.join(webappDir, 'index.html');
      this.localServer = new LocalServer(webappDir);

      // 立即启动服务器（即使 webapp 还没就绪），避免阻塞 onload
      try {
        await this.localServer.start();
        this.serverUrl = this.localServer.getUrl();
        this.localServer.setVaultBasePath(vaultBasePath);
        // 如果 webapp 已就绪，直接标记
        if (fs.existsSync(webappIndexPath)) {
          this.webappReady = true;
        }
      } catch (e) {
        console.error('[BambooReview] Failed to start local server:', e);
        new Notice('竹林修仙传: 本地服务启动失败，部分功能（白噪音、主题动效）可能不可用', 0);
      }

      // 版本跟踪 & webapp 下载放到后台，不阻塞 onload 返回
      setupWebappInBackground.call(this, webappDir, pluginDir, vaultBasePath, this.manifest.version);
    }

    // 注册 View
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf: WorkspaceLeaf) => {
      return new DailyReviewView(leaf, this.serverUrl, this, this.settings, () => this.saveSettings());
    });

    // 注册命令
    this.addCommand({
      id: 'open-daily-review',
      name: '打开今日复盘',
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: 'navigate-prev-day',
      name: '前一天',
      callback: () => this.sendToIframe('nav:prevDay'),
    });

    this.addCommand({
      id: 'navigate-next-day',
      name: '后一天',
      callback: () => this.sendToIframe('nav:nextDay'),
    });

    this.addCommand({
      id: 'navigate-today',
      name: '回到今天',
      callback: () => this.sendToIframe('nav:today'),
    });

    this.addCommand({
      id: 'open-stats',
      name: '打开统计分析',
      callback: () => this.sendToIframe('action:openStats'),
    });

    this.addCommand({
      id: 'open-settings-in-app',
      name: '打开应用设置',
      callback: () => this.sendToIframe('action:openSettings'),
    });

    // 注册设置面板
    this.addSettingTab(new PluginSettings(this.app, this));

    // 添加左侧 Ribbon 图标
    this.addRibbonIcon('leaf', '竹林修仙传', () => {
      void this.activateView();
    });
  }

  onunload(): void {
    ThemeBridge.restoreDefaults();
    void this.localServer?.stop();
    this.localServer = null;
  }

  /** 激活或创建复盘视图 */
  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);

    if (leaves.length > 0) {
      // 已有视图，直接聚焦
      leaf = leaves[0];
    } else {
      // 创建新视图
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        active: true,
      });
    }

    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }

  /** 向 iframe 发送导航/操作指令 */
  private sendToIframe(type: string): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length === 0) return;

    const view = leaves[0].view as DailyReviewView;
    const iframe = (view as unknown as { iframe: HTMLIFrameElement | null }).iframe;
    if (iframe?.contentWindow) {
      let origin = '*';
      try { origin = new URL(iframe.src).origin; } catch { /* keep '*' */ }
      iframe.contentWindow.postMessage(
        { type, id: 'cmd_' + Date.now() },
        origin
      );
    }
  }

  /** 加载设置 */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as BambooReviewSettings;
  }

  /** 保存设置 */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
