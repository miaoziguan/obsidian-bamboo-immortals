import * as fs from 'fs';
import * as path from 'path';
import { StorageBridge } from './StorageBridge';
import { ThemeBridge } from './ThemeBridge';
import type { AnyBridgeMessage, ThemeSyncPaletteMessage, AppToggleThemeMessage, AppSaveSectionConfigMessage, AppSaveCustomNoisesMessage } from '../types/messages';
import { ALLOWED_AUDIO_EXTENSIONS, AUDIO_MIME_TYPES } from '../constants/audio';
import type { BambooReviewSettings } from '../settings/PluginSettings';

/** 扫描音频文件时默认跳过的目录名（configDir 可通过 setConfigDir 自定义） */
const DEFAULT_SKIP_DIRS = ['.trash', '.git', 'node_modules'];

/**
 * BridgeService - postMessage 消息路由中心
 *
 * 监听 iframe 发来的 postMessage，分发到对应处理模块，
 * 然后将结果回传给 iframe。
 */
export class BridgeService {
    private storageBridge: StorageBridge;
    private themeBridge: ThemeBridge;
    private settings: BambooReviewSettings | null = null;
    private saveSettings: (() => Promise<void>) | null = null;
    private iframe: HTMLIFrameElement | null = null;
    private messageHandler: ((event: MessageEvent) => void) | null = null;
    private customThemes: Array<{ name: string; code: string }> = [];
    private vaultBasePath: string = '';
    private noisePath: string = '';
    private configDir: string = '.obsidian';
    private expectedOrigin = '';

    constructor(
        storageBridge: StorageBridge,
        themeBridge: ThemeBridge,
        settings?: BambooReviewSettings,
        saveSettings?: () => Promise<void>
    ) {
        this.storageBridge = storageBridge;
        this.themeBridge = themeBridge;
        this.settings = settings || null;
        this.saveSettings = saveSettings || null;
    }

  /** 绑定 iframe 并开始监听消息 */
  attach(iframe: HTMLIFrameElement): void {
    // 防止重复绑定
    this.detach();

    this.iframe = iframe;
    this.themeBridge.attachIframe(iframe);

    // 记录 expected origin，用于消息来源校验
    try {
      this.expectedOrigin = new URL(iframe.src).origin;
    } catch {
      this.expectedOrigin = '';
    }

    this.messageHandler = (event: MessageEvent) => {
      void this.onMessage(event);
    };
    window.addEventListener('message', this.messageHandler);
  }

  /** 设置自定义主题列表（供插件端扫描后调用） */
  setCustomThemes(themes: Array<{ name: string; code: string }>): void {
    this.customThemes = themes;
  }

  /** 设置库根目录路径（供库内音频文件读取使用） */
  setVaultBasePath(basePath: string): void {
    this.vaultBasePath = basePath;
  }

  /** 设置白噪音文件夹路径 */
  setNoisePath(noisePath: string): void {
    this.noisePath = noisePath;
  }

  /** 设置 Obsidian 配置目录名（默认 .obsidian，用户可自定义） */
  setConfigDir(dir: string): void {
    this.configDir = dir;
  }

  /** 扫描库内音频文件（支持指定文件夹或全库扫描） */
  private async _scanVaultAudioFiles(maxDepth = 5): Promise<Array<{ path: string; name: string; size: number; ext: string }>> {
    const results: Array<{ path: string; name: string; size: number; ext: string }> = [];
    const allowedExts = ALLOWED_AUDIO_EXTENSIONS;
    const basePath = this.vaultBasePath;
    if (!basePath) return results;

    // 检查 basePath 是否存在（异步）
    try {
      await fs.promises.stat(basePath);
    } catch {
      return results;
    }

    // 指定了白噪音文件夹，只扫描该文件夹（不递归）
    if (this.noisePath) {
      const targetDir = path.join(basePath, this.noisePath);
      try {
        const entries: fs.Dirent[] = await fs.promises.readdir(targetDir, { withFileTypes: true });
        for (const entry of entries as fs.Dirent[]) {
          if (entry.name.startsWith('.')) continue;
          if (!entry.isFile()) continue;
          const ext = path.extname(entry.name).toLowerCase();
          if (allowedExts.includes(ext)) {
            const stat: fs.Stats = await fs.promises.stat(path.join(targetDir, entry.name));
            results.push({ path: path.join(this.noisePath, entry.name), name: entry.name, size: stat.size, ext });
          }
        }
      } catch { /* skip */ }
      results.sort((a, b) => a.path.localeCompare(b.path));
      return results;
    }

    // 未指定文件夹，全库递归扫描（异步 + 深度限制）
    const scanDir = async (dirPath: string, relativePrefix: string, depth: number): Promise<void> => {
      if (depth > maxDepth) return;
      let entries: fs.Dirent[];
      try {
        entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      } catch { return; /* skip unreadable dirs */ }

      for (const entry of entries as fs.Dirent[]) {
        if (entry.name.startsWith('.')) continue;
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = relativePrefix ? path.join(relativePrefix, entry.name) : entry.name;

        if (entry.isDirectory()) {
          const skipDirs = new Set([...DEFAULT_SKIP_DIRS, this.configDir]);
          if (skipDirs.has(entry.name)) continue;
          await scanDir(fullPath, relativePath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (allowedExts.includes(ext)) {
            try {
              const stat: fs.Stats = await fs.promises.stat(fullPath);
              results.push({ path: relativePath, name: entry.name, size: stat.size, ext });
            } catch { /* skip */ }
          }
        }
      }
    };

    await scanDir(basePath, '', 0);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  }

  /** 解绑 iframe，停止监听 */
  detach(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    this.themeBridge.detachIframe();
    this.iframe = null;
  }

  /** 消息路由处理 */
  private async onMessage(event: MessageEvent): Promise<void> {
    const msg = event.data as AnyBridgeMessage;
    if (!msg || !msg.type || !msg.id) return;

    // 校验消息来源：source + origin 双重验证
    if (this.iframe && event.source !== this.iframe.contentWindow) {
      return;
    }
    if (this.expectedOrigin && event.origin !== this.expectedOrigin) {
      console.warn('[BridgeService] Ignored message from unknown origin:', event.origin);
      return;
    }

    // 只处理已知消息类型前缀
    if (!msg.type.startsWith('storage:') && !msg.type.startsWith('app:') && !msg.type.startsWith('file:') && !msg.type.startsWith('theme:')) {
      return;
    }

    // 生命周期消息
    if (msg.type === 'app:ready') {
      this.themeBridge.pushTheme();
      // 把持久化的 sectionConfig、自定义主题和自定义音源随 ready 响应发给 webapp
      this.respond(msg.id, {
        ok: true,
        sectionConfig: this.settings?.sectionConfig || null,
        customThemes: this.customThemes,
        customNoises: this.settings?.noiseItems || [],
        syncPaletteToObsidian: this.settings?.syncPaletteToObsidian || false,
      });
      return;
    }

    if (msg.type === 'app:close') {
      this.respond(msg.id, { ok: true });
      return;
    }

    // 板块配置持久化
    if (msg.type === 'app:saveSectionConfig') {
      if (this.settings) {
        const configMsg = msg as AppSaveSectionConfigMessage;
        this.settings.sectionConfig = configMsg.payload as Record<string, unknown> | null;
        if (this.saveSettings) await this.saveSettings();
      }
      this.respond(msg.id, { ok: true });
      return;
    }

    // 自定义白噪音音源持久化
    if (msg.type === 'app:saveCustomNoises') {
      if (this.settings) {
        const noisesMsg = msg as AppSaveCustomNoisesMessage;
        this.settings.noiseItems = noisesMsg.payload || [];
        if (this.saveSettings) await this.saveSettings();
      }
      this.respond(msg.id, { ok: true });
      return;
    }

    // 主题切换请求（iframe → Obsidian）
    if (msg.type === 'app:toggleTheme') {
      const themeMsg = msg as AppToggleThemeMessage;
      const targetIsDark = themeMsg.payload.isDark === true;
      const currentIsDark = activeDocument.body.classList.contains('theme-dark');
      if (targetIsDark !== currentIsDark) {
        if (targetIsDark) {
          activeDocument.body.classList.remove('theme-light');
          activeDocument.body.classList.add('theme-dark');
        } else {
          activeDocument.body.classList.remove('theme-dark');
          activeDocument.body.classList.add('theme-light');
        }
        // 通知 iframe 主题已切换
        this.themeBridge.pushTheme();
      }
      this.respond(msg.id, { ok: true, isDark: targetIsDark });
      return;
    }

    // 调色同步请求（webapp → Obsidian 原生界面）
    if (msg.type === 'theme:syncPalette') {
      if (this.settings?.syncPaletteToObsidian) {
        const paletteMsg = msg as ThemeSyncPaletteMessage;
        const { hue, lightnessOffset, isDark } = paletteMsg.payload;
        this.themeBridge.applyPalette(hue, lightnessOffset, isDark);
      }
      this.respond(msg.id, { ok: true });
      return;
    }

    // ===== 白噪音音源：库内音频文件 =====

    // 扫描库内所有音频文件（供 webapp 文件选择器使用）
    if (msg.type === 'app:listVaultAudioFiles') {
      try {
        if (!this.vaultBasePath) {
          throw new Error('无法获取库根目录路径，请尝试重新打开面板');
        }
        // _scanVaultAudioFiles() 内部已异步检查路径是否存在
        const files = await this._scanVaultAudioFiles();
        this.respond(msg.id, { files });
      } catch (error: any) {
        console.error('[Bamboo] 扫描库内音频文件失败:', error);
        this.respondError(msg.id, error.message || '扫描库文件失败');
      }
      return;
    }

    // 读取库内音频文件（通过库内相对路径）— 返回绝对路径，前端直接 fetch file://
    if (msg.type === 'app:readVaultFile') {
      try {
        const relativePath = msg.payload?.path || '';
        if (!relativePath) throw new Error('未提供文件路径');
        const ext = path.extname(relativePath).toLowerCase();
        if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error('不支持的音频格式：' + ext);
        if (!this.vaultBasePath) throw new Error('无法获取库根目录路径');
        const vaultBasePath = this.vaultBasePath;
        const fullPath = path.join(vaultBasePath, relativePath);
        // 路径遍历检查：确保解析后的路径未逃逸出 vault 根目录
        if (!fullPath.startsWith(vaultBasePath)) {
          throw new Error('路径遍历禁止：' + relativePath);
        }
        try {
          await fs.promises.stat(fullPath);
        } catch {
          throw new Error('文件不存在：' + relativePath);
        }
        this.respond(msg.id, { filePath: fullPath, name: path.basename(relativePath, ext) });
      } catch (error: any) {
        this.respondError(msg.id, error.message || '读取库文件失败');
      }
      return;
    }

    // 读取本地音频文件（绝对路径，直接回传路径由前端用 file:// 加载）
    if (msg.type === 'app:readLocalFile') {
      try {
        const filePath = msg.payload?.path || '';
        if (!filePath) throw new Error('未提供文件路径');
        // 安全检查：拒绝包含路径遍历字符的路径
        if (filePath.includes('..')) throw new Error('路径遍历禁止');
        const ext = path.extname(filePath).toLowerCase();
        if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error('不支持的音频格式：' + ext);
        try {
          await fs.promises.stat(filePath);
        } catch {
          throw new Error('文件不存在：' + filePath);
        }
        this.respond(msg.id, { filePath, name: path.basename(filePath, ext) });
      } catch (error: any) {
        this.respondError(msg.id, error.message || '读取文件失败');
      }
      return;
    }

    // 存储类消息
    try {
      const result = await this.storageBridge.handle(msg);
      this.respond(msg.id, result);
    } catch (error: any) {
      this.respondError(msg.id, error.message || 'Unknown error');
    }
  }

  /** 根据文件扩展名获取 MIME 类型 */
  private _getAudioMimeType(ext: string): string {
    return AUDIO_MIME_TYPES[ext] || 'application/octet-stream';
  }

  /** 向 iframe 发送成功响应 */
  private respond(id: string, payload: any): void {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ id, payload }, '*');
  }

  /** 向 iframe 发送错误响应 */
  private respondError(id: string, error: string): void {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ id, error }, '*');
  }
}
