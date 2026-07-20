import { App, DataAdapter, normalizePath, requestUrl } from 'obsidian';
import { arrayBufferToBase64 } from '../utils/base64';
import { VaultStorage } from '../storage/VaultStorage';
import { ThemeBridge } from '../bridge/ThemeBridge';
import type { BambooReviewSettings, NoiseItem } from '../settings/PluginSettings';
import { ALLOWED_AUDIO_EXTENSIONS, MIME_TYPES } from '../constants/audio';
import type { DayData } from '../types/data';
import type { StrategyOverview } from '../ai/strategyOverview';
import type { CultivationRealm } from '../cultivation';
import { INBOUND_PREFIXES } from './protocol';

/** Obsidian 插件运行时注入的主窗口 document（非插件沙箱内的 document） */
declare const activeDocument: Document;

/** 扫描音频时默认跳过的目录名 */
const SKIP_DIRS = ['.trash', '.git', 'node_modules'];

/** 读取音频文件入内存前的体积上限（base64 再膨胀 ~33%，避免大文件 OOM） */
const MAX_AUDIO_FILE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * 校验音源代理 URL：仅允许 http/https 协议，限制长度，
 * 防止 `app:proxyAudioUrl` 成为运行在用户机器上的开放 fetch 代理。
 */
export function isValidAudioUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.length > 2048) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

// ArrayBuffer → base64 见 ../utils/base64（跨平台，不依赖 Node Buffer）

/**
 * AppAPI — 统一通信接口
 *
 * 替代旧的 BridgeService + StorageBridge + ThemeBridge 三层架构，
 * 将 postMessage 路由、存储操作、主题同步合并为单一 API。
 */
export class AppAPI {
  private storage: VaultStorage;
  private themeBridge: ThemeBridge;
  private settings: BambooReviewSettings;
  private saveSettings: () => Promise<void>;
  private iframe: HTMLIFrameElement | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  /**
   * 「战略复盘面板 → AI 改进」入口回调（由 DailyReviewView 注入，转发到插件 requestAiImprove）。
   * webapp 健康分详情点「用 AI 改进」时触发，参数为目标标识 + 本地 hints。
   */
  onAiImproveGoal?: (payload: { goalId: string; title?: string; hints?: string }) => void;

  /**
   * 健康分权威快照数据源（由 DailyReviewView 注入，转发到插件的 getStrategyOverview()）。
   * webapp 通过 app:getHealthOverview 向插件请求单一数据源的健康分套件，
   * 避免插件与前端各算一遍导致的分数漂移。
   */
  private strategyOverviewProvider?: () => Promise<StrategyOverview | null>;

  /** 注入健康分数据源（单一数据源） */
  setStrategyOverviewProvider(fn: () => Promise<StrategyOverview | null>): void {
    this.strategyOverviewProvider = fn;
  }

  /** 当前修行境界数据源（由 DailyReviewView 注入，转发到插件 getCultivationRealm()） */
  private cultivationRealmProvider?: () => Promise<CultivationRealm | null>;
  /** 当前竹币余额数据源（转发到插件 getBambooCoinBalance()） */
  private bambooCoinBalanceProvider?: () => Promise<number | null>;
  /** 当前可用竹币余额数据源（转发到插件 getBambooCoinAvailableBalance()） */
  private bambooCoinAvailableBalanceProvider?: () => Promise<number | null>;

  setCultivationRealmProvider(fn: () => Promise<CultivationRealm | null>): void {
    this.cultivationRealmProvider = fn;
  }
  setBambooCoinBalanceProvider(fn: () => Promise<number | null>): void {
    this.bambooCoinBalanceProvider = fn;
  }
  setBambooCoinAvailableBalanceProvider(fn: () => Promise<number | null>): void {
    this.bambooCoinAvailableBalanceProvider = fn;
  }

  private customThemes: Array<{ name: string; code: string }> = [];
  private vaultAdapter: DataAdapter;
  private noisePath: string;
  private configDir: string;
  /** 视图已 detach 后置 true，扫描等异步任务据此提前终止（#L14） */
  private disposed = false;

  constructor(
    app: App,
    settings: BambooReviewSettings,
    saveSettings: () => Promise<void>,
    noisePath: string,
    configDir: string
  ) {
    this.settings = settings;
    this.saveSettings = saveSettings;
    // 注意：webapp 读取目标的实际路径由此处决定（VaultStorage 默认 basePath = bamboo-review）。
    // writeAiGoals 必须写入同一路径，否则 AI 目标不显示。详见 main.ts writeAiGoals 的注释。
    this.storage = new VaultStorage(app);
    this.themeBridge = new ThemeBridge();
    this.vaultAdapter = app.vault.adapter;
    this.noisePath = noisePath;
    this.configDir = configDir;
  }

  /** 确保存储结构存在 */
  async ensureStructure(): Promise<void> {
    await this.storage.ensureStructure();
  }

  /** 设置自定义主题列表 */
  setCustomThemes(themes: Array<{ name: string; code: string }>): void {
    this.customThemes = themes;
  }

  /** 
   * 预注册 message 监听器。
   * 在 iframe 创建前调用，消除竞态窗口。
   * 使用 activeDocument.defaultView（主 Obsidian 窗口）而非插件沙箱 window。
   */
  startListening(): void {
    this.detach();
    this.messageHandler = (event: MessageEvent) => {
      void this.onMessage(event);
    };
    // bridge.js 的 postMessage 目标是 window.parent（主 Obsidian 窗口），
    // 必须在该窗口上监听才能收到消息（插件沙箱的 window 不是同一对象）。
    (activeDocument.defaultView || window).addEventListener('message', this.messageHandler);
    this.disposed = false; // 重新 attach 后恢复可扫描状态（detach 已置 true）
  }

  /** 
   * 绑定 iframe 引用并初始化主题桥接。
   * 在 iframe 元素创建后调用，供 respond() 获取 contentWindow。
   */
  bindIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
    this.themeBridge.attachIframe(iframe);
  }

  /** 绑定 iframe 并开始监听消息（一步到位，兼容旧调用） */
  attach(iframe: HTMLIFrameElement): void {
    this.startListening();
    this.bindIframe(iframe);
  }

  /** 解绑并停止监听 */
  detach(): void {
    this.disposed = true;
    if (this.messageHandler) {
      (activeDocument.defaultView || window).removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    this.themeBridge.detachIframe();
    this.iframe = null;
  }

  /** Obsidian 主题变化时触发（由 DailyReviewView 的 css-change 事件调用） */
  onThemeChanged(followObsidianTheme: boolean): void {
    this.settings.followObsidianTheme = followObsidianTheme;
    this.themeBridge.pushTheme(followObsidianTheme);
    void this.saveSettings(); // 与 saveSectionConfig/saveCustomNoises 一致，持久化主题跟随开关
  }

  /** 向 iframe 发送成功响应 */
  private respond(id: string, payload: unknown): void {
    if (!this.iframe?.contentWindow) return;
    // 必须带 type 字段：bridge.js 的 parseAppMessage 要求 typeof data.type === 'string'
    this.iframe.contentWindow.postMessage({ type: 'storage:response', id, payload }, '*');
  }

  /** 向 iframe 发送错误响应 */
  private respondError(id: string, error: string): void {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ type: 'storage:response', id, error }, '*');
  }

  /** 消息路由 */
  private async onMessage(event: MessageEvent): Promise<void> {
    const msg = event.data as { type?: string; id?: string; payload?: unknown };
    if (!msg || !msg.type || !msg.id) return;

    // 来源校验
    if (this.iframe && event.source !== this.iframe.contentWindow) return;

    // 消息类型白名单（阶段3 · 契约化：从 protocol.ts 集中定义）
    const type = msg.type;
    if (!INBOUND_PREFIXES.some((p) => type.startsWith(p))) return;



    try {
      await this.handleMessage(msg.type, msg.id, msg.payload ?? {});
    } catch (e) {
      this.respondError(msg.id, e instanceof Error ? e.message : 'Unknown error');
    }
  }

  /** 消息分发处理 */
  private async handleMessage(type: string, id: string, payload: unknown): Promise<void> {
    // ---- 生命周期 ----
    if (type === 'app:ready') {
      // 阶段3 · 契约化：版本协商 — 插件升级但 webapp 缓存旧版时，用户重新加载视图即可获取最新 webapp
      this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      this.respond(id, {
        ok: true,
        sectionConfig: this.settings.sectionConfig || null,
        customThemes: this.customThemes,
        customNoises: this.settings.noiseItems || [],
        syncPaletteToObsidian: this.settings.syncPaletteToObsidian || false,
      });
      return;
    }

    if (type === 'app:close') {
      this.respond(id, { ok: true });
      return;
    }

    // ---- 板块配置 ----
    if (type === 'app:saveSectionConfig') {
      this.settings.sectionConfig = payload as Record<string, unknown> | null;
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }

    // ---- 白噪音音源 ----
    if (type === 'app:saveCustomNoises') {
      this.settings.noiseItems = (Array.isArray(payload) ? payload : []) as NoiseItem[];
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }

    // ---- 调色同步（webapp → Obsidian）----
    if (type === 'theme:syncPalette') {
      const p = payload as { hue: number; lightnessOffset: number; isDark: boolean };
      if (this.settings.syncPaletteToObsidian) {
        this.themeBridge.applyPalette(p.hue, p.lightnessOffset, p.isDark);
      }
      this.respond(id, { ok: true });
      return;
    }

    // ---- 重新开启主题跟随（webapp → Obsidian）----
    if (type === 'app:theme:sync') {
      this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      this.respond(id, { ok: true });
      return;
    }

    // ---- 音频文件扫描 ----
    if (type === 'app:listVaultAudioFiles') {
      try {
        const files = await this.scanVaultAudioFiles();
        this.respond(id, { files });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : '扫描库文件失败');
      }
      return;
    }

    // ---- 读取库内音频 ----
    if (type === 'app:readVaultFile') {
      await this.handleReadVaultFile(id, payload);
      return;
    }

    // ---- 读取本机绝对路径音频（兼容旧音源）----
    if (type === 'app:readLocalFile') {
      await this.handleReadLocalFile(id, payload);
      return;
    }

    // ---- 代理外部音源链接（绕过 webview CORS，桌面/移动一致）----
    if (type === 'app:proxyAudioUrl') {
      await this.handleProxyAudioUrl(id, payload);
      return;
    }

    // ---- 战略复盘面板 → AI 改进入口 ----
    if (type === 'app:aiImproveGoal') {
      const p = payload as { goalId?: unknown; title?: unknown; hints?: unknown };
      if (typeof p.goalId !== 'string' || p.goalId.length === 0) {
        this.respondError(id, 'app:aiImproveGoal 缺少 goalId');
        return;
      }
      this.onAiImproveGoal?.({
        goalId: p.goalId,
        title: typeof p.title === 'string' ? p.title : undefined,
        hints: typeof p.hints === 'string' ? p.hints : undefined,
      });
      this.respond(id, { ok: true });
      return;
    }

    // ---- 健康分权威快照（单一数据源，供 webapp 健康分环/详情消费）----
    if (type === 'app:getHealthOverview') {
      const provider = this.strategyOverviewProvider;
      if (!provider) {
        this.respondError(id, 'app:getHealthOverview 未配置数据源');
        return;
      }
      try {
        const overview = await provider();
        if (!overview) {
          this.respondError(id, '暂无目标数据，无法计算健康分');
          return;
        }
        this.respond(id, {
          updatedAt: overview.updatedAt,
          health: overview.health,
          goals: overview.goals,
          results: overview.results,
        });
      } catch (e) {
        this.respondError(id, `app:getHealthOverview 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 当前修行境界（竹杖芒鞋侧栏常驻展示）----
    if (type === 'app:getCultivationRealm') {
      const provider = this.cultivationRealmProvider;
      if (!provider) {
        this.respondError(id, 'app:getCultivationRealm 未配置数据源');
        return;
      }
      try {
        this.respond(id, await provider());
      } catch (e) {
        this.respondError(id, `app:getCultivationRealm 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 当前竹币余额（竹杖芒鞋侧栏常驻展示）----
    if (type === 'app:getBambooCoinBalance') {
      const provider = this.bambooCoinBalanceProvider;
      if (!provider) {
        this.respondError(id, 'app:getBambooCoinBalance 未配置数据源');
        return;
      }
      try {
        this.respond(id, await provider());
      } catch (e) {
        this.respondError(id, `app:getBambooCoinBalance 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 当前可用竹币余额（竹杖芒鞋侧栏常驻展示，与 webapp 商店界面对齐）----
    if (type === 'app:getBambooCoinAvailableBalance') {
      const provider = this.bambooCoinAvailableBalanceProvider;
      if (!provider) {
        this.respondError(id, 'app:getBambooCoinAvailableBalance 未配置数据源');
        return;
      }
      try {
        this.respond(id, await provider());
      } catch (e) {
        this.respondError(id, `app:getBambooCoinAvailableBalance 计算失败: ${(e as Error)?.message ?? String(e)}`);
      }
      return;
    }

    // ---- 存储类消息（委托给 VaultStorage）----
    const result = await this.handleStorageMessage(type, payload);
    this.respond(id, result);
  }

  /** 存储消息处理 */
  private async handleStorageMessage(type: string, payload: unknown): Promise<unknown> {
    const p = payload as Record<string, unknown>;
    switch (type) {
      case 'storage:readDay':
        return await this.storage.getDay(p.dateKey as string);
      case 'storage:writeDay':
        return await this.storage.putDay(p.data as DayData);
      case 'storage:listDays':
        return await this.storage.getAllDays();
      case 'storage:deleteDay':
        return await this.storage.deleteDay(p.dateKey as string);
      case 'storage:getSetting':
        return await this.storage.getSetting(p.key as string);
      case 'storage:putSetting':
        return await this.storage.putSetting(p.key as string, p.value);
      case 'storage:getAllSettings':
        return await this.storage.getAllSettings();
      case 'storage:getGoals':
        return await this.storage.getGoals();
      case 'storage:putGoals':
        return await this.storage.putGoals(p.goals as never);
      case 'storage:getPurchaseHistory':
        return await this.storage.getPurchaseHistory();
      case 'storage:putPurchaseHistory':
        return await this.storage.putPurchaseHistory(p.data as never);
      case 'storage:getIncomeHistory':
        return await this.storage.getIncomeHistory();
      case 'storage:putIncomeHistory':
        return await this.storage.putIncomeHistory(p.data as never);
      case 'storage:getDayKeys':
        return await this.storage.getDayKeys();
      case 'storage:getDaysPaginated':
        return await this.storage.getDaysPaginated(
          (p.page as number) ?? 0,
          (p.pageSize as number) ?? 30
        );
      case 'storage:exportAll':
        return await this.storage.exportAllData();
      case 'storage:importAll':
        return await this.storage.importData(
          p.data,
          { strategy: (p.options as Record<string, unknown>)?.strategy as 'overwrite' | 'merge' | undefined }
        );
      case 'storage:clearAll':
        return await this.storage.clearAll();
      default:
        throw new Error(`Unknown storage message type: ${type}`);
    }
  }

  /** 扫描库内音频文件 */
  private async scanVaultAudioFiles(
    maxDepth = 5
  ): Promise<Array<{ path: string; name: string; size: number; ext: string }>> {
    const results: Array<{ path: string; name: string; size: number; ext: string }> = [];
    const adapter = this.vaultAdapter;

    // 视图已 detach 后提前终止（#L14）
    if (this.disposed) return results;

    if (this.noisePath) {
      try {
        const list = await adapter.list(this.noisePath);
        if (this.disposed) return results;
        for (const file of list.files) {
          if (file.startsWith('.')) continue;
          const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
          if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
            try {
              const fullPath = normalizePath(`${this.noisePath}/${file}`);
              const stat = await adapter.stat(fullPath);
              results.push({ path: fullPath, name: file, size: stat?.size ?? 0, ext });
            } catch { /* skip */ }
          }
        }
      } catch { /* skip */ }
      results.sort((a, b) => a.path.localeCompare(b.path));
      return results;
    }

    // 全库扫描（detach 后 this.disposed 置 true，提前终止避免无谓耗时）
    if (this.disposed) return results;
    const scanDir = async (relativeDir: string, depth: number): Promise<void> => {
      if (depth > maxDepth) return;
      if (this.disposed) return;
      let list;
      try {
        list = await adapter.list(relativeDir);
      } catch {
        return;
      }

      for (const folder of list.folders) {
        if (folder.startsWith('.')) continue;
        const skipSet = new Set([...SKIP_DIRS, ...(this.configDir ? [this.configDir] : [])]);
        if (skipSet.has(folder)) continue;
        const subPath = relativeDir ? normalizePath(`${relativeDir}/${folder}`) : folder;
        await scanDir(subPath, depth + 1);
        if (this.disposed) return;
      }

      for (const file of list.files) {
        if (file.startsWith('.')) continue;
        const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
        if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
          try {
            const relativePath = relativeDir ? normalizePath(`${relativeDir}/${file}`) : file;
            const stat = await adapter.stat(relativePath);
            results.push({ path: relativePath, name: file, size: stat?.size ?? 0, ext });
          } catch { /* skip */ }
        }
      }
    };

    await scanDir('', 0);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  }

  /** 读取库内音频文件，返回可播放的 base64 data URL（桌面/移动一致，不依赖 basePath） */
  private async handleReadVaultFile(id: string, payload: unknown): Promise<void> {
    try {
      const p = payload as { path: string };
      const relativePath = p.path || '';
      if (!relativePath) throw new Error('未提供文件路径');

      const ext = relativePath.substring(relativePath.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error('不支持的音频格式：' + ext);
      if (relativePath.includes('..')) throw new Error('路径遍历禁止');

      const adapter = this.vaultAdapter;
      const stat = await adapter.stat(relativePath);
      if (!stat || stat.type !== 'file') throw new Error('文件不存在：' + relativePath);
      if (stat.size > MAX_AUDIO_FILE_BYTES) throw new Error('音频文件过大，无法加载');

      const buffer = await adapter.readBinary(relativePath);
      this.respond(id, { data: this.toDataUrl(buffer, ext) });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : '读取文件失败');
    }
  }

  /** 读取本机绝对路径音频（兼容旧音源；移动端沙盒下可能不可读） */
  private async handleReadLocalFile(id: string, payload: unknown): Promise<void> {
    try {
      const p = payload as { path: string };
      const filePath = p.path || '';
      if (!filePath) throw new Error('未提供文件路径');

      const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error('不支持的音频格式：' + ext);
      if (filePath.includes('..')) throw new Error('路径遍历禁止');

      try {
        const st = await this.vaultAdapter.stat(filePath);
        if (st && st.size > MAX_AUDIO_FILE_BYTES) throw new Error('音频文件过大，无法加载');
      } catch (e) {
        // 沙盒下 stat 可能不可用；仅「过大」错误阻断，其余忽略继续读取
        if (e instanceof Error && e.message.includes('过大')) throw e;
      }

      const buffer = await this.vaultAdapter.readBinary(filePath);
      this.respond(id, { data: this.toDataUrl(buffer, ext) });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : '读取本地文件失败');
    }
  }

  /** 代理外部音源链接：插件端 requestUrl 不受 webview CORS 限制（桌面/移动均支持） */
  private async handleProxyAudioUrl(id: string, payload: unknown): Promise<void> {
    try {
      const p = payload as { url: string };
      const url = p.url || '';
      if (!isValidAudioUrl(url)) throw new Error('非法音源链接（仅支持 http/https）');

      const resp = await requestUrl({ url, method: 'GET' });
      if (resp.status < 200 || resp.status >= 300) {
        throw new Error('音源访问失败 (HTTP ' + resp.status + ')');
      }
      const buffer = resp.arrayBuffer;
      if (!buffer) throw new Error('音源响应为空');

      const mime = (resp.headers && resp.headers['content-type']) || 'application/octet-stream';
      this.respond(id, { data: `data:${mime};base64,${arrayBufferToBase64(buffer)}` });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : '代理音源失败');
    }
  }

  /** ArrayBuffer → 带 MIME 的 base64 data URL */
  private toDataUrl(buffer: ArrayBuffer, ext: string): string {
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    return `data:${mime};base64,${arrayBufferToBase64(buffer)}`;
  }
}
