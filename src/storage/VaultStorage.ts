import { App, normalizePath, TFile, Notice, parseYaml, stringifyYaml } from 'obsidian';
import { ImportValidator } from './ImportValidator';
import type {
  DayData,
  GoalItem,
  AppSettings,
  PurchaseHistory,
  IncomeHistory,
  ExportShape,
  CustomTemplate,
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
    await this.ensureDir('templates');
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
    } catch {
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
        } catch {
          // 解析失败跳过该文件
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
      } catch {
        // 加载失败跳过该日
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

  /**
   * 计算单日「有效内容量」：时间线条目数 + 待办勾选项数 + 目标进度项 + 有值指标 + 备注。
   * 用于 putDay 写守卫，判断一次写入是否为「空壳」（会覆盖磁盘真实数据）。
   * 注意：weather 等装饰字段不计入内容，故纯天气写入在守卫中视为空壳，不会覆盖有内容的当日文件。
   */
  private dayContentScore(day: Partial<DayData> | null | undefined): number {
    if (!day || typeof day !== 'object') return 0;
    let score = 0;
    // 时间线：所有时段(period)下的 items 总数（timeline 本身按时段分组，最多 9 段，不能用其 length 判空）
    const timeline = (day as Record<string, unknown>).timeline;
    if (Array.isArray(timeline)) {
      for (const period of timeline) {
        const items = period && (period as Record<string, unknown>).items;
        if (Array.isArray(items)) score += items.length;
      }
    }
    // 待办勾选：按 key 存在计数（含 false —— 代表用户显式操作过，不能丢）
    const gtc = (day as Record<string, unknown>).goalTaskCompletions;
    if (gtc && typeof gtc === 'object') {
      for (const gid of Object.keys(gtc as Record<string, unknown>)) {
        const sub = (gtc as Record<string, unknown>)[gid];
        if (sub && typeof sub === 'object') score += Object.keys(sub as Record<string, unknown>).length;
      }
    }
    // 目标进度快照
    const gp = (day as Record<string, unknown>).goalProgress;
    if (gp && typeof gp === 'object') score += Object.keys(gp as Record<string, unknown>).length;
    // 指标：有实际值的字段
    const metrics = (day as Record<string, unknown>).metrics;
    if (metrics && typeof metrics === 'object') {
      for (const k of Object.keys(metrics as Record<string, unknown>)) {
        const v = (metrics as Record<string, unknown>)[k];
        if (v !== undefined && v !== null && v !== '') score += 1;
      }
    }
    // 备注
    const note = (day as Record<string, unknown>).note;
    if (typeof note === 'string' && note.trim() !== '') score += 1;
    return score;
  }

  async putDay(dayData: DayData): Promise<void> {
    await this.ensureDir('data');
    const dateKey = dayData.date;
    if (!dateKey) {
      throw new Error('DayData must have a date field');
    }
    const path = this.dayPath(dateKey);

    // 写守卫（修复「时间线/待办卡片今日活动丢失」根因）：
    // 旧实现用 timeline.length > 10 作阈值，但 timeline 是按时段(period)分组的数组、最多 9 段，
    // 该条件恒为 false → 守卫从不触发 → 空壳数据每次都能覆盖磁盘真实数据。
    // 新实现：按「有效内容量」判断——当本次写入为空壳(score=0)、而磁盘现有文件有内容(score>0)时，
    // 拦截写入，避免时间线/待办勾选被空数据覆盖丢失。
    const newScore = this.dayContentScore(dayData);
    if (newScore === 0) {
      try {
        if (await this.app.vault.adapter.exists(path)) {
          const existing = JSON.parse(await this.app.vault.adapter.read(path)) as DayData;
          const existingScore = this.dayContentScore(existing);
          if (existingScore > 0) {
            if (!this._warnedPaths.has(path)) {
              new Notice(
                `⚠️ 已拦截 ${dateKey} 的空数据覆盖（现有 ${existingScore} 项内容 → 空），已保护当日时间线/待办不丢失。`
              );
              this._warnedPaths.add(path);
            }
            return;
          }
        }
      } catch { /* 文件损坏或不存在，继续正常写入 */ }
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
    // 损坏为非数组（null/{}数字）时返回 []，避免下游 as GoalItem[] 后 .map/.length 抛错（H11）
    const parsed: unknown = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as GoalItem[]) : [];
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
        let settings: Record<string, unknown> = {};
        if (data && data.trim()) {
          try {
            settings = JSON.parse(data) as Record<string, unknown>;
          } catch {
            // 损坏的 settings.json：以空对象为基准继续，避免抛错中断且不丢旧盘（process 失败不写）
            settings = {};
          }
        }
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
      const parsed: unknown = JSON.parse(content);
      // parse 成功但非对象（如 "abc" / 数字 / 数组）会被 {...existing} 展开导致合并错乱，按损坏兜底
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
      return parsed as AppSettings;
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

  // ---- 自定义目标模板 (templates/<id>.md，frontmatter) ----

  private templateDir(): string {
    return normalizePath(`${this.basePath}/templates`);
  }

  private templatePath(id: string): string {
    return normalizePath(`${this.templateDir()}/${id}.md`);
  }

  /** 解析模板 markdown 的 frontmatter；损坏/无 frontmatter 返回 null */
  private parseTemplateFrontMatter(content: string): Partial<CustomTemplate> | null {
    const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!m) return null;
    try {
      return parseYaml(m[1]) as Partial<CustomTemplate>;
    } catch {
      return null;
    }
  }

  /** 读取全部自定义模板（按 createdAt 升序），桥接不可用时返回 [] */
  async getCustomTemplates(): Promise<CustomTemplate[]> {
    const dir = this.templateDir();
    if (!(await this.app.vault.adapter.exists(dir))) return [];
    const list = await this.app.vault.adapter.list(dir);
    const tpls: CustomTemplate[] = [];
    const reads = list.files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        try {
          const content = await this.app.vault.adapter.read(file);
          const parsed = this.parseTemplateFrontMatter(content);
          if (parsed && parsed.id) {
            tpls.push(parsed as CustomTemplate);
          }
        } catch {
          // 损坏文件跳过
        }
      });
    await Promise.all(reads);
    tpls.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    return tpls;
  }

  /** 写入/覆盖一个自定义模板（frontmatter + 可读正文） */
  async putCustomTemplate(t: CustomTemplate): Promise<void> {
    await this.ensureDir('templates');
    const front = ['---', stringifyYaml(t), '---', '', `# ${t.name}`, '', t.desc || '', ''].join('\n');
    await this.vaultWrite(this.templatePath(t.id), front);
  }

  /** 删除一个自定义模板 */
  async deleteCustomTemplate(id: string): Promise<void> {
    const path = this.templatePath(id);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
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
