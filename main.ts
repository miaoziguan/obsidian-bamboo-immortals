import { Plugin, WorkspaceLeaf } from 'obsidian';
import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as https from 'https';
import { DailyReviewView, VIEW_TYPE_DAILY_REVIEW } from './src/views/DailyReviewView';
import { LocalServer } from './src/server/LocalServer';
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
/** 纯 Node.js ZIP 解压，不依赖系统 unzip/PowerShell */
function extractZip(source: string | Buffer, destDir: string): void {
  const buf = typeof source === 'string' ? fs.readFileSync(source) : source;
  let pos = 0;

  const read16 = () => { const v = buf.readUInt16LE(pos); pos += 2; return v; };
  const read32 = () => { const v = buf.readUInt32LE(pos); pos += 4; return v; };
  const skip = (n: number) => { pos += n; };

  // 扫描所有 local file header（签名 0x04034b50）
  while (pos < buf.length - 4) {
    const sig = buf.readUInt32LE(pos);
    if (sig !== 0x04034b50) break;

    pos += 4;
    read16(); // version
    const flags = read16();
    const method = read16();
    skip(4); // mod time, mod date
    const crc32 = read32();
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
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const data = buf.subarray(pos, pos + compressedSize);
    pos += compressedSize;

    if (method === 0) {
      // 无压缩
      fs.writeFileSync(outPath, data);
      continue;
    }

    if (method === 8) {
      // deflate
      try {
        const decompressed = zlib.inflateRawSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
        if (decompressed.length !== uncompressedSize) {
          fs.writeFileSync(outPath, decompressed.subarray(0, uncompressedSize));
        } else {
          fs.writeFileSync(outPath, decompressed);
        }
      } catch {
        fs.writeFileSync(outPath, zlib.inflateSync(data));
      }
      continue;
    }

    throw new Error(`Unsupported compression method: ` + method + ' (' + fileName + ')');
  }
}

/** 从 GitHub Release 下载 webapp.zip 并解压 */
function downloadAndExtractWebapp(pluginDir: string, destDir: string, version: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = `https://github.com/miaoziguan/obsidian-bamboo-immortals/releases/download/${version}/webapp.zip`;
    https.get(url, { headers: { 'User-Agent': 'obsidian-bamboo-immortals' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        https.get(res.headers.location || '', { headers: { 'User-Agent': 'obsidian-bamboo-immortals' } }, (redir) => {
          const chunks: Buffer[] = [];
          redir.on('data', (c: Buffer) => chunks.push(c));
          redir.on('end', () => {
            try {
              extractZip(Buffer.concat(chunks), destDir);
              resolve();
            } catch (e) { reject(e); }
          });
          redir.on('error', reject);
        }).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        try {
          extractZip(Buffer.concat(chunks), destDir);
          resolve();
        } catch (e) { reject(e); }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

export default class BambooReviewPlugin extends Plugin {
  settings: BambooReviewSettings = DEFAULT_SETTINGS;
  private localServer: LocalServer | null = null;
  private serverUrl = '';

  async onload(): Promise<void> {
    // 加载设置
    await this.loadSettings();

    // 启动本地 HTTP 服务器
    const pluginDir = (this.manifest as any).dir;
    if (pluginDir) {
      const vaultBasePath = (this.app.vault.adapter as any).basePath || '';
      const webappDir = path.join(vaultBasePath, pluginDir, 'webapp');
      const webappIndexPath = path.join(webappDir, 'index.html');
      this.localServer = new LocalServer(webappDir);

      // 确保 webapp 资源就绪：本地 zip → GitHub 下载
      if (!fs.existsSync(webappIndexPath)) {
        const webappZip = path.join(vaultBasePath, pluginDir, 'webapp.zip');
        try {
          fs.mkdirSync(webappDir, { recursive: true });

          if (fs.existsSync(webappZip)) {
            // 本地有 zip（从 release 下载或升级残留），直接解压
            extractZip(webappZip, webappDir);
            // 解压完成后删除 zip 释放空间
            try { fs.unlinkSync(webappZip); } catch {}
            new Notice('竹林修仙传: 已自动解压 webapp 资源', 4000);
          } else {
            // 插件市场安装没有 webapp，从 GitHub Release 下载
            const version = this.manifest.version;
            console.log('[BambooReview] Downloading webapp from release', version);
            await downloadAndExtractWebapp(pluginDir, webappDir, version);
            new Notice('竹林修仙传: 资源包安装完成，正在启动...', 4000);
          }
        } catch (e) {
          console.error('[BambooReview] Failed to setup webapp:', e);
          new Notice('竹林修仙传: 资源包安装失败，请检查网络后重试', 0);
        }
      }

      try {
        await this.localServer.start();
        this.serverUrl = this.localServer.getUrl();
        // 把库根目录传给 LocalServer，供 /bamboo-audio 音频代理使用
        this.localServer.setVaultBasePath(vaultBasePath);
      } catch (e) {
        console.error('[BambooReview] Failed to start local server:', e);
        new Notice('竹林修仙传: 本地服务启动失败，部分功能（白噪音、主题动效）可能不可用', 0);
      }
    }

    // 注册 View
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf: WorkspaceLeaf) => {
      return new DailyReviewView(leaf, this.serverUrl, this.settings, () => this.saveSettings());
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
    const iframe = (view as any).iframe as HTMLIFrameElement | null;
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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /** 保存设置 */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
