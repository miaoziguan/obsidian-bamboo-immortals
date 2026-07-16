import { App, normalizePath, TFile, Notice } from 'obsidian';
import { ImportValidator } from './ImportValidator';
import type {
  DayData,
  GoalItem,
  AppSettings,
  PurchaseHistory,
  IncomeHistory,
  ExportShape,
} from '../types/data';

/**
 * VaultStorage - 封装 Obsidian Vault adapter 的文件操作
 *
 * Vault 目录结构:
 *   {basePath}/
 *     data/          -> 每日 JSON 数据
 *     goals.json     -> 全局目标
 *     settings.json  -> 应用设置
 *     themes/        -> 自定义主题 (预留)
 *     reports/       -> 报告 (预留)
 *     reviews/       -> Markdown 摘要
 */
export class VaultStorage {
  private app: App;
  private basePath: string;
  /** 写守卫：已警告过的路径，第二次写入放行（用户确认意图） */
  private _warnedPaths = new Set<string>();

  constructor(app: App, basePath = 'bamboo-review') {
    this.app = app;
    this.basePath = normalizePath(basePath);
  }

  /** 确保目录存在 */
  private async ensureDir(dir: string): Promise<void> {
    const path = normalizePath(`${this.basePath}/${dir}`);
    if (!(await this.app.vault.adapter.exists(path))) {
      await this.app.vault.adapter.mkdir(path);
    }
  }

  /** 确保基础目录结构存在 */
  async ensureStructure(): Promise<void> {
    if (!(await this.app.vault.adapter.exists(this.basePath))) {
      await this.app.vault.adapter.mkdir(this.basePath);
    }
    await this.ensureDir('data');
    await this.ensureDir('reviews');
  }

  /**
   * 原子方式写入 vault 文件（替代 adapter.write）。
   * - 文件已在 vault 缓存 → vault.process（原子更新，避免竞态丢数据）
   * - 新文件 → vault.create（同时写入磁盘和 Obsidian 缓存）
   * - 历史遗留（磁盘有但缓存无）→ adapter.remove + vault.create（迁移进缓存）
   */
  private async vaultWrite(path: string, content: string): Promise<void> {
    const normalized = normalizePath(path);
    const abstract = this.app.vault.getAbstractFileByPath(normalized);

    if (abstract instanceof TFile) {
      await this.app.vault.process(abstract, () => content);
      return;
    }

    const parentPath = normalized.substring(0, normalized.lastIndexOf('/'));
    if (parentPath && !(await this.app.vault.adapter.exists(parentPath))) {
      await this.app.vault.adapter.mkdir(parentPath);
    }

    if (await this.app.vault.adapter.exists(normalized)) {
      await this.app.vault.adapter.remove(normalized);
    }

    await this.app.vault.create(normalized, content);
  }

  // ---- 每日数据 (days) ----

  private dayPath(dateKey: string): string {
    return normalizePath(`${this.basePath}/data/${dateKey}.json`);
  }

  async getDay(dateKey: string): Promise<DayData | null> {
    const path = this.dayPath(dateKey);
    if (!(await this.app.vault.adapter.exists(path))) {
      return null;
    }
    try {
      const content: string = await this.app.vault.adapter.read(path);
      return JSON.parse(content) as DayData;
    } catch (e) {
      console.warn(`[BambooReview] 日期数据文件损坏，将跳过: ${path}`, e);
      return null;
    }
  }

  async getAllDays(): Promise<Record<string, DayData>> {
    await this.ensureDir('data');
    const dataDir = normalizePath(`${this.basePath}/data`);
    const files = await this.app.vault.adapter.list(dataDir);
    const days: Record<string, DayData> = {};

    const reads = files.files
      .filter(f => f.endsWith('.json'))
      .map(async (file) => {
        const dateKey = file.split('/').pop()?.replace('.json', '');
        if (!dateKey) return;
        try {
          const content: string = await this.app.vault.adapter.read(file);
          days[dateKey] = JSON.parse(content) as DayData;
        } catch (e) {
          console.warn(`Failed to parse day file: ${file}`, e);
        }
      });

    await Promise.all(reads);
    return days;
  }

  /** 获取所有日期 key（按日期降序，最新在前） */
  async getDayKeys(): Promise<string[]> {
    await this.ensureDir('data');
    const dataDir = normalizePath(`${this.basePath}/data`);
    const files = await this.app.vault.adapter.list(dataDir);
    const keys: string[] = [];
    for (const file of files.files) {
      if (file.endsWith('.json')) {
        const dateKey = file.split('/').pop()?.replace('.json', '');
        if (dateKey) keys.push(dateKey);
      }
    }
    keys.sort().reverse(); // 降序：最新日期在前
    return keys;
  }

  /**
   * 分页加载日期数据
   * @param page 页码（从 0 开始）
   * @param pageSize 每页数量
   * @returns { days, total, page, pageSize, hasMore }
   */
  async getDaysPaginated(page = 0, pageSize = 30): Promise<{
    days: Record<string, DayData>;
    keys: string[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    const allKeys = await this.getDayKeys();
    const total = allKeys.length;
    const start = page * pageSize;
    const pageKeys = allKeys.slice(start, start + pageSize);
    const days: Record<string, DayData> = {};

    const reads = pageKeys.map(async (dateKey) => {
      try {
        const data = await this.getDay(dateKey);
        if (data) days[dateKey] = data;
      } catch (e) {
        console.warn(`Failed to load day: ${dateKey}`, e);
      }
    });
    await Promise.all(reads);

    return {
      days,
      keys: pageKeys,
      total,
      page,
      pageSize,
      hasMore: start + pageKeys.length < total,
    };
  }

  async putDay(dayData: DayData): Promise<void> {
    await this.ensureDir('data');
    const dateKey = dayData.date;
    if (!dateKey) {
      throw new Error('DayData must have a date field');
    }
    const path = this.dayPath(dateKey);

    // 写守卫：检测数据量悬崖（多条时间线 → 近乎空壳）
    if (!this._warnedPaths.has(path)) {
      const newTimelineLen = Array.isArray(dayData.timeline) ? dayData.timeline.length : 0;
      if (newTimelineLen <= 1) {
        try {
          if (await this.app.vault.adapter.exists(path)) {
            const existing = JSON.parse(await this.app.vault.adapter.read(path)) as DayData;
            const existingTimelineLen = Array.isArray(existing.timeline) ? existing.timeline.length : 0;
            if (existingTimelineLen > 10) {
              new Notice(
                `⚠️ 检测到 ${dateKey} 数据异常清空（${existingTimelineLen} 条 → ${newTimelineLen} 条），已自动拦截。\n如果确实要清空该日数据，请再次操作。`
              );
              this._warnedPaths.add(path);
              return;
            }
          }
        } catch { /* 文件损坏或不存在，继续正常写入 */ }
      }
    }

    await this.vaultWrite(path, JSON.stringify(dayData, null, 2));
  }

  async deleteDay(dateKey: string): Promise<void> {
    const path = this.dayPath(dateKey);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }

  // ---- 全局目标 (goals) ----

  private goalsPath(): string {
    return normalizePath(`${this.basePath}/goals.json`);
  }

  async getGoals(): Promise<GoalItem[]> {
    const path = this.goalsPath();
    if (!(await this.app.vault.adapter.exists(path))) {
      return [];
    }
    const content: string = await this.app.vault.adapter.read(path);
    return JSON.parse(content) as GoalItem[];
  }

  async putGoals(goals: GoalItem[]): Promise<void> {
    const path = this.goalsPath();

    // 写守卫：检测数据量悬崖（N条目标 → 空数组）
    if (goals.length === 0 && !this._warnedPaths.has(path)) {
      try {
        if (await this.app.vault.adapter.exists(path)) {
          const existing = JSON.parse(await this.app.vault.adapter.read(path)) as GoalItem[];
          if (Array.isArray(existing) && existing.length > 0) {
            new Notice(
              `⚠️ 检测到目标数据异常清空（${existing.length} 条 → 空），已自动拦截。\n如果确实要清空所有目标，请再次操作。`
            );
            this._warnedPaths.add(path);
            return;
          }
        }
      } catch { /* 文件损坏或不存在，继续正常写入 */ }
    }

    await this.vaultWrite(path, JSON.stringify(goals, null, 2));
  }

  // ---- AI 规划侧车索引（plans-map.json）----
  // 结构：{ "<vaultPath>#<contentHash>": string[] (goalIds) }
  // 用途：同一笔记重复规划时按 contentHash 幂等，避免目标重复追加。

  private plansIndexPath(): string {
    return normalizePath(`${this.basePath}/plans-map.json`);
  }

  async getPlansIndex(): Promise<Record<string, string[]>> {
    const path = this.plansIndexPath();
    if (!(await this.app.vault.adapter.exists(path))) return {};
    try {
      const content = await this.app.vault.adapter.read(path);
      const parsed = JSON.parse(content) as unknown;
      if (parsed && typeof parsed === 'object') return parsed as Record<string, string[]>;
      return {};
    } catch {
      return {};
    }
  }

  async putPlansIndex(map: Record<string, string[]>): Promise<void> {
    await this.vaultWrite(this.plansIndexPath(), JSON.stringify(map, null, 2));
  }

  // ---- 设置 (settings) ----

  private settingsPath(): string {
    return normalizePath(`${this.basePath}/settings.json`);
  }

  async getSetting(key: string): Promise<unknown> {
    const settings = await this.getAllSettings();
    return settings[key] ?? null;
  }

  async putSetting(key: string, value: unknown): Promise<void> {
    const path = normalizePath(this.settingsPath());
    const abstract = this.app.vault.getAbstractFileByPath(path);

    if (abstract instanceof TFile) {
      // vault.process 原子 read-modify-write，杜绝竞态丢数据
      await this.app.vault.process(abstract, (data) => {
        const settings: Record<string, unknown> = JSON.parse(data) as Record<string, unknown>;
        settings[key] = value;
        return JSON.stringify(settings, null, 2);
      });
    } else {
      await this.vaultWrite(path, JSON.stringify({ [key]: value }, null, 2));
    }
  }

  async getAllSettings(): Promise<AppSettings> {
    const path = this.settingsPath();
    if (!(await this.app.vault.adapter.exists(path))) {
      return {};
    }
    try {
      const content: string = await this.app.vault.adapter.read(path);
      return JSON.parse(content) as AppSettings;
    } catch {
      return {};
    }
  }

  // ---- 购买历史 (purchase-history.json) ----

  private purchaseHistoryPath(): string {
    return normalizePath(`${this.basePath}/purchase-history.json`);
  }

  async getPurchaseHistory(): Promise<PurchaseHistory | null> {
    const path = this.purchaseHistoryPath();
    if (!(await this.app.vault.adapter.exists(path))) {
      return null;
    }
    const content: string = await this.app.vault.adapter.read(path);
    return JSON.parse(content) as PurchaseHistory;
  }

  async putPurchaseHistory(data: PurchaseHistory): Promise<void> {
    const path = this.purchaseHistoryPath();
    await this.vaultWrite(path, JSON.stringify(data, null, 2));
  }

  // ---- 收入历史 (income-history.json) ----

  private incomeHistoryPath(): string {
    return normalizePath(`${this.basePath}/income-history.json`);
  }

  async getIncomeHistory(): Promise<IncomeHistory | null> {
    const path = this.incomeHistoryPath();
    if (!(await this.app.vault.adapter.exists(path))) {
      return null;
    }
    const content: string = await this.app.vault.adapter.read(path);
    return JSON.parse(content) as IncomeHistory;
  }

  async putIncomeHistory(data: IncomeHistory): Promise<void> {
    const path = this.incomeHistoryPath();
    await this.vaultWrite(path, JSON.stringify(data, null, 2));
  }

  // ---- 导出/导入 ----

  async exportAllData(): Promise<ExportShape> {
    const [days, goals, settings, purchaseHistory, incomeHistory] = await Promise.all([
      this.getAllDays(),
      this.getGoals(),
      this.getAllSettings(),
      this.getPurchaseHistory(),
      this.getIncomeHistory(),
    ]);

    return {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      storageType: 'vault',
      days,
      goals,
      settings,
      purchaseHistory,
      incomeHistory,
      themes: [],
      reports: [],
    };
  }

  async importData(data: unknown, options: { strategy?: 'overwrite' | 'merge' } = {}): Promise<void> {
    await this.ensureStructure();
    const strategy = options.strategy ?? 'overwrite';

    // P2：导入前校验 + 字段补齐；损坏文件在此被拒绝，不污染 Vault
    const record = ImportValidator.validate(data);

    if (record.days !== undefined) {
      // 防御：days 必须是对象；空对象表示清空全部日数据（仅 overwrite 语义下允许）
      const days = (record.days && typeof record.days === 'object' && !Array.isArray(record.days))
        ? record.days
        : {};
      if (strategy === 'overwrite') {
        await this.clearAllDays();
      }
      for (const day of Object.values(days)) {
        await this.putDay(day);
      }
    }

    if (record.goals !== undefined) {
      const incoming: GoalItem[] = Array.isArray(record.goals) ? record.goals : [];
      if (strategy === 'merge') {
        // 合并：保留现有目标，导入目标按 id 覆盖；空数组不触发清空
        const existing = (await this.getGoals()) || [];
        const merged = new Map(existing.map((g) => [g.id, g]));
        for (const goal of incoming) {
          if (goal && goal.id) merged.set(goal.id, goal);
        }
        await this.putGoals(Array.from(merged.values()));
      } else {
        // overwrite：整体替换（空数组 = 清空，符合预期语义）
        await this.putGoals(incoming);
      }
    }

    if (record.settings !== undefined && record.settings && typeof record.settings === 'object') {
      const incoming = record.settings;
      let toWrite: AppSettings;
      if (strategy === 'merge') {
        const existing = (await this.getAllSettings()) || {};
        toWrite = { ...existing, ...incoming };
      } else {
        toWrite = incoming;
      }
      await this.vaultWrite(this.settingsPath(), JSON.stringify(toWrite, null, 2));
    }

    if (record.purchaseHistory !== undefined) {
      await this.putPurchaseHistory(record.purchaseHistory);
    }
    if (record.incomeHistory !== undefined) {
      await this.putIncomeHistory(record.incomeHistory);
    }
  }

  /** 仅清空所有日数据（overwrite 导入 days 前调用，不影响 goals/settings） */
  async clearAllDays(): Promise<void> {
    const dataDir = normalizePath(`${this.basePath}/data`);
    if (await this.app.vault.adapter.exists(dataDir)) {
      await this.app.vault.adapter.rmdir(dataDir, true);
    }
    await this.ensureDir('data');
  }

  /** 仅清空设置文件（overwrite 导入 settings 前调用） */
  async clearAllSettings(): Promise<void> {
    const path = this.settingsPath();
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }

  async clearAll(): Promise<void> {
    if (await this.app.vault.adapter.exists(this.basePath)) {
      await this.app.vault.adapter.rmdir(this.basePath, true);
    }
    await this.ensureStructure();
  }

  // ---- Markdown 摘要 ----

  private reviewPath(dateKey: string): string {
    return normalizePath(`${this.basePath}/reviews/${dateKey}.md`);
  }

  async writeMarkdownReview(dateKey: string, markdown: string): Promise<void> {
    await this.ensureDir('reviews');
    const path = this.reviewPath(dateKey);
    await this.vaultWrite(path, markdown);
  }

  async deleteMarkdownReview(dateKey: string): Promise<void> {
    const path = this.reviewPath(dateKey);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }
}
