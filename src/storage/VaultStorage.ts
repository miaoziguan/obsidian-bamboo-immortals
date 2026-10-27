import { App, normalizePath, TFile, Notice, parseYaml, stringifyYaml } from 'obsidian';
import { ImportValidator } from './ImportValidator';
import { assertSafeAssetId } from '../utils/assetId';
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
 * 文档 id 安全校验（画中卷·写作档 / 思维子弹 / 便签组）。
 *
 * id 直接参与文件路径拼接（`typewriter-writing/<id>.json` 等），而 Obsidian 的
 * normalizePath 只做斜杠归一、不解析 `..`。若不加约束，形如 `../../.obsidian/x`
 * 或 `a/b` 的 id 会拼出越界路径 —— 读写删都可能落在「画中卷数据目录」之外
 * （路径遍历）。此处统一收敛为「仅字母数字、下划线、短横线，1~64 字符」，
 * 非法 id 一律抛错（fail-fast，与 putTypewriterNotes 的契约一致）。
 */
export function assertSafeDocId(id: string): string {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    throw new Error(`非法文档 id：${typeof id === 'string' ? JSON.stringify(id) : String(id)}`);
  }
  return id;
}

/**
 * 日期键安全校验（每日数据 `data/<dateKey>.json`）。
 *
 * dateKey 同样直接参与路径拼接，且来自 webapp 传参（storage:readDay / writeDay /
 * deleteDay）—— 与文档 id 是同一类风险：`../../x` 会拼出越界路径，
 * **读可读到库内任意 .json，删更可直接删掉任意 .json**。
 *
 * 字符集与 assertSafeDocId 一致：放行 `2026-01-05`（以及 `2026-1-5` 这类手建文件名），
 * 拦掉斜杠、点号等一切可构成路径的成分。getAllDays / getDayKeys 等是直接读文件名、
 * 不经本函数，故历史上手建的怪文件名仍能被正常列出。
 */
function assertSafeDateKey(dateKey: string): string {
  if (typeof dateKey !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(dateKey)) {
    throw new Error(`非法 dateKey：${typeof dateKey === 'string' ? JSON.stringify(dateKey) : String(dateKey)}`);
  }
  return dateKey;
}

/** 将 unknown 收窄为普通对象（含字符串索引），非对象/数组/null 返回 null */
function asPlainObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** 合并日数据时的宽松视图类型（时间线条目字段不固定） */
interface MergeItem {
  id?: string;
  time?: string;
  task?: string;
  text?: string;
  eval?: string;
  [k: string]: unknown;
}
interface MergePeriod {
  period: string;
  items?: MergeItem[];
  [k: string]: unknown;
}
interface GoalCompMap {
  [gid: string]: Record<string, boolean>;
}

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
 */
export class VaultStorage {
  private app: App;
  private basePath: string;
  /** 便签档存储目录（相对 basePath 的子目录），由 AppAPI 注入，默认 typewriter-notes */
  private _notesFolder: string;
  /** 思维子弹档存储目录（相对 basePath 的子目录），由 AppAPI 注入，默认 typewriter-mindmap */
  private _mindmapFolder: string;
  /** 写守卫：已警告过的路径，第二次写入放行（用户确认意图） */
  private _warnedPaths = new Set<string>();
  /**
   * 「存在但读不出来」的路径集合。推广自 18199922 画中卷的 docFailed 范式：
   * adapter.read 抛错而 exists 为 true 时置位，读成功自动解除（不会永久锁死保存）。
   * 置位期间禁止写入该文件 —— 读不出内容就无法留档，此时写入即不可逆覆盖。
   */
  private _ioFailedPaths = new Set<string>();
  /** 上一条的 Notice 去重：状态未变时不重复打扰（守卫仍生效，只是不再弹） */
  private _ioNoticed = new Set<string>();

  constructor(
    app: App,
    basePath = 'bamboo-review',
    writingFolder = 'typewriter-writing',
    notesFolder = 'typewriter-notes',
    mindmapFolder = 'typewriter-mindmap'
  ) {
    this.app = app;
    // 兜底：basePath 绝不允许为空 / '.' / '/' —— 那等于指向 Vault 根，
    // 届时 clearAll() 的 rmdir(basePath, true) 会把整个库删掉（数据安全红线）。
    const bp = normalizePath(basePath || 'bamboo-review');
    this.basePath = !bp || bp === '.' || bp === '/' ? 'bamboo-review' : bp;
    this._writingFolder = normalizePath(writingFolder || 'typewriter-writing');
    this._notesFolder = normalizePath(notesFolder || 'typewriter-notes');
    this._mindmapFolder = normalizePath(mindmapFolder || 'typewriter-mindmap');
  }

  /**
   * 逐级创建目录：adapter.mkdir 只建最后一层，祖先不存在时会失败。
   *
   * dataPath 允许嵌套（如「画中卷/数据」——normalizeDirInput 明确放行、设置页也宣称
   * 支持任意 Vault 相对路径），若只用单层 mkdir，首次 ensureStructure / vaultWrite
   * 就会因祖先目录缺失而抛错，整个数据根建不起来。
   * 与 AppAPI.mkdirP 同一套防护（即便某些版本 mkdir 本身递归，本函数也只是无害空转）。
   */
  private async mkdirP(dir: string): Promise<void> {
    const n = normalizePath(dir);
    if (!n || n === '.') return;
    const parts = n.split('/');
    for (let i = 1; i <= parts.length; i++) {
      const d = parts.slice(0, i).join('/');
      if (await this.app.vault.adapter.exists(d)) continue;
      try { await this.app.vault.adapter.mkdir(d); } catch { /* 已存在则忽略 */ }
    }
  }

  /** 确保目录存在 */
  private async ensureDir(dir: string): Promise<void> {
    await this.mkdirP(normalizePath(`${this.basePath}/${dir}`));
  }

  /** 确保基础目录结构存在 */
  async ensureStructure(): Promise<void> {
    await this.mkdirP(this.basePath);
    await this.ensureDir('data');
    await this.ensureDir('templates');
  }

  /**
   * 原子方式写入 vault 文件（替代 adapter.write）。
   * - 文件已在 vault 缓存 → vault.process（原子更新，避免竞态丢数据）
   * - 新文件 → vault.create（同时写入磁盘和 Obsidian 缓存）
   * - 历史遗留（磁盘有但缓存无）→ adapter.remove + vault.create（迁移进缓存）
   */
  /**
   * 唯一的写入汇聚点。返回 false = 本次写入被守卫拦截（未落盘）。
   *
   * 守卫 ⓪（读失败保护）：文件存在、但上一次读取抛错 —— 内容无法确认，且读不出来所以无法留档，
   * 此时写入就是不可逆覆盖。旧实现把「读失败」与「不存在/空白」一视同仁当成「可安全写入」，
   * 于是读盘失败（权限 / 并发删除 / 同步冲突）后的任意一次自动保存都会抹掉真实数据。
   * 与 18199922 的 docFailed 一致：读成功即解除，不会永久锁死保存。
   */
  private async vaultWrite(path: string, content: string): Promise<boolean> {
    const normalized = normalizePath(path);

    if (this._ioFailedPaths.has(normalized)) {
      if (!this._ioNoticed.has(normalized)) {
        this._ioNoticed.add(normalized);
        new Notice(
          `⚠️ 无法读取 ${normalized.slice(normalized.lastIndexOf('/') + 1)}，已暂停写入以防覆盖。` +
            '\n请检查文件权限或是否被其它程序占用，恢复后会自动继续保存。',
        );
      }
      return false;
    }

    const abstract = this.app.vault.getAbstractFileByPath(normalized);

    if (abstract instanceof TFile) {
      await this.app.vault.process(abstract, () => content);
      return true;
    }

    const parentPath = normalized.substring(0, normalized.lastIndexOf('/'));
    if (parentPath) await this.mkdirP(parentPath);

    // 历史遗留分支（磁盘有文件但 Obsidian 缓存没有）：vault.create 要求目标不存在，故先 remove。
    // 但「先删后建」一旦 create 失败（磁盘满 / 权限），原内容就没了 —— 先读出兜底，
    // 失败时立即恢复，把丢失窗口从「原文件已删」缩到「恢复也失败」这一极端情况。
    let prev: string | null = null;
    if (await this.app.vault.adapter.exists(normalized)) {
      prev = await this.app.vault.adapter.read(normalized).catch(() => null);
      await this.app.vault.adapter.remove(normalized);
    }
    try {
      await this.app.vault.create(normalized, content);
    } catch (e) {
      if (prev !== null) {
        try { await this.app.vault.adapter.write(normalized, prev); } catch { /* 恢复也失败：只能抛给上层 */ }
      }
      throw e;
    }
    return true;
  }

  // ---- 每日数据 (days) ----

  private dayPath(dateKey: string): string {
    // dateKey 来自 webapp 传参，必须先校验再拼路径（防路径遍历：读/写/删越界 .json）
    return normalizePath(`${this.basePath}/data/${assertSafeDateKey(dateKey)}.json`);
  }

  async getDay(dateKey: string): Promise<DayData | null> {
    const path = this.dayPath(dateKey);
    if (!(await this.app.vault.adapter.exists(path))) {
      return null;
    }
    // 解析失败先隔离留档，再按「无数据」返回：
    // 否则 webapp 拿到 null 后会当新数据写入，把损坏内容静默覆盖掉。
    const parsed = await this.readJsonFile(path, '日数据');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as DayData;
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
        // 与 getDay 一致：解析失败先隔离留档，避免「看不见又被静默覆盖」
        const parsed = await this.readJsonFile(file, '日数据');
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          days[dateKey] = parsed as DayData;
        }
      });

    await Promise.all(reads);
    return days;
  }

  /**
   * 只读 fromKey（含）之后的日记文件。
   *
   * 与 getAllDays() 的唯一差别是**先按 key 过滤、再读内容**：
   * getAllDays 会把 vault 里全部日记逐个读进来，调用方再在窗口外丢弃 —— 使用年限越长
   * 浪费越大（几百上千次 IPC）。此处只 list 一次拿到 key 集合，筛出落在窗口内的才发起
   * 读取。返回内容与 getAllDays 的对应子集完全一致（键取自文件名，解析失败同样跳过）。
   */
  async getDaysSince(fromKey: string): Promise<Record<string, DayData>> {
    if (!fromKey) return this.getAllDays();
    await this.ensureDir('data');
    const dataDir = normalizePath(`${this.basePath}/data`);
    const files = await this.app.vault.adapter.list(dataDir);
    const days: Record<string, DayData> = {};
    const targets = files.files.filter((f) => {
      if (!f.endsWith('.json')) return false;
      const dateKey = f.split('/').pop()?.replace('.json', '');
      return typeof dateKey === 'string' && dateKey >= fromKey;
    });

    const reads = targets.map(async (file) => {
      const dateKey = file.split('/').pop()?.replace('.json', '');
      if (!dateKey) return;
      try {
        const content: string = await this.app.vault.adapter.read(file);
        days[dateKey] = JSON.parse(content) as DayData;
      } catch {
        // 解析失败跳过该文件（与 getAllDays 行为一致）
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
    // 入参归一化：pageSize=0 / 负数 / 非数字会导致 slice 返回空页却 hasMore=true → 前端分页死循环（H4）
    page = Math.max(0, Math.floor(Number(page)) || 0);
    pageSize = Math.max(1, Math.floor(Number(pageSize)) || 30);
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
    const timeline = day.timeline;
    if (Array.isArray(timeline)) {
      for (const period of timeline) {
        const items = period.items;
        if (Array.isArray(items)) score += items.length;
      }
    }

    // 待办勾选：按 key 存在计数（含 false —— 代表用户显式操作过，不能丢）
    const gtc = asPlainObject(day.goalTaskCompletions);
    if (gtc) {
      for (const gid of Object.keys(gtc)) {
        const sub = asPlainObject(gtc[gid]);
        if (sub) score += Object.keys(sub).length;
      }
    }

    // 目标进度快照
    const gp = asPlainObject(day.goalProgress);
    if (gp) score += Object.keys(gp).length;

    // 指标(metrics)是衍生/汇总值(时间线、待办完成等),不作为内容判断依据；
    // 否则 createEmptyDayData 的默认占位值("--:--"/"0/0"/"0h"/"0")会使写守卫失效,
    // 导致空壳覆盖磁盘真实数据(周末待办丢失根因)。

    // 备注
    const note = day.note;
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
    // 【IPC 合并】原实现对同一个文件发起两轮 exists + read（一轮判空壳、一轮判合并），
    // 单次 putDay 最多 5 次 IPC。这里只读磁盘一次，两份守卫共用这一份内容。
    // 两条失败路径的语义分别保留：
    //   · 文件缺失（exists=false）→ existing 为 null，写流程照常往下走（可新建文件）；
    //   · 文件损坏（exists=true 但读取/解析抛错）→ newScore===0 时绝不写（保护现有文件，
    //     留给人工/备份修复），newScore>0 时用本次数据落库（本次内容优先）。
    let existing: DayData | null = null;
    let readFailed = false;
    try {
      if (await this.app.vault.adapter.exists(path)) {
        existing = JSON.parse(await this.app.vault.adapter.read(path)) as DayData;
      }
    } catch {
      readFailed = true;
      existing = null;
    }
    const existingScore = existing ? this.dayContentScore(existing) : 0;

    // 写守卫（空壳拦截）：本次为空壳、而磁盘现有文件有内容 → 拦下，
    // 避免当日时间线/待办勾选被「吃到一半的内存态」清空。
    if (newScore === 0) {
      if (readFailed) return;
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

    // 本次有内容时，若磁盘已有内容，则「合并」而非整文件替换——
    // 防止 webapp 内存态变成磁盘的子集(部分丢失)时，把磁盘上多出的时间线/待办勾选静默抹掉。
    let finalData: DayData = dayData;
    if (newScore > 0 && existing && existingScore > 0) {
      finalData = this.mergeDayData(dayData, existing);
    }

    await this.vaultWrite(path, JSON.stringify(finalData, null, 2));
  }

  /**
   * 合并两次日数据：以 incoming 为准，但保留磁盘(existing)中「incoming 未提及」的内容，
   * 避免部分写入覆盖导致已存在的时间线/待办勾选被静默丢弃。
   * - timeline：按 (period, time, task/text) 并集去重，incoming 已有条目以 incoming 为准
   * - goalTaskCompletions / goalProgress：并集 key，incoming 提及的 key 以 incoming 为准
   * - note：incoming 为空则沿用磁盘
   * - 其余字段(metrics/weekday/weather/date)以 incoming 为准
   */
  private mergeDayData(incoming: DayData, existing: DayData): DayData {
    const inv = incoming as unknown as {
      timeline?: MergePeriod[];
      goalTaskCompletions?: GoalCompMap;
      goalProgress?: GoalCompMap;
      note?: string;
    };
    const exv = existing as unknown as {
      timeline?: MergePeriod[];
      goalTaskCompletions?: GoalCompMap;
      goalProgress?: GoalCompMap;
      note?: string;
    };

    const result: DayData = { ...(incoming as object) } as DayData;

    const inTimeline: MergePeriod[] = Array.isArray(inv.timeline) ? inv.timeline : [];
    const exTimeline: MergePeriod[] = Array.isArray(exv.timeline) ? exv.timeline : [];
    if (exTimeline.length > 0) {
      const merged: MergePeriod[] = inTimeline.map((p) => ({ ...p, items: [...(p.items ?? [])] }));
      const seen = new Set<string>();
      const keyOf = (period: string, it: MergeItem): string =>
        `${period}|${it?.time ?? ''}|${it?.task ?? it?.text ?? ''}`;
      for (const p of merged) {
        for (const it of (p.items ?? [])) seen.add(keyOf(p.period, it));
      }
      for (const p of exTimeline) {
        let target: MergePeriod | undefined = merged.find((m) => m.period === p.period);
        if (!target) {
          // 新建时段 items 留空，由下方循环统一追加，避免与既有 items 重复
          target = { ...p, items: [] };
          merged.push(target);
        }
        for (const it of (p.items ?? [])) {
          const k = keyOf(p.period, it);
          if (!seen.has(k)) {
            seen.add(k);
            target.items = [...(target.items ?? []), it];
          }
        }
      }
      (result as unknown as { timeline?: MergePeriod[] }).timeline = merged;
    }

    (result as unknown as { goalTaskCompletions?: GoalCompMap }).goalTaskCompletions =
      this.mergeGoalRecord(inv.goalTaskCompletions, exv.goalTaskCompletions);
    (result as unknown as { goalProgress?: GoalCompMap }).goalProgress =
      this.mergeGoalRecord(inv.goalProgress, exv.goalProgress);

    const inNote = inv.note;
    if ((!inNote || !`${inNote}`.trim()) && exv.note) {
      (result as unknown as { note?: string }).note = exv.note;
    }

    return result;
  }

  /** 并集目标记录：incoming 提及的 key 以 incoming 为准，磁盘独有 key 保留 */
  private mergeGoalRecord(
    incoming: GoalCompMap | undefined,
    existing: GoalCompMap | undefined,
  ): GoalCompMap {
    const i = asPlainObject(incoming) as GoalCompMap | null;
    const e = asPlainObject(existing) as GoalCompMap | null;
    const out: GoalCompMap = i ? { ...i } : {};
    if (e) {
      for (const gid of Object.keys(e)) {
        const subE = asPlainObject(e[gid]) as Record<string, boolean> | null;
        if (!subE) continue;
        const subI = asPlainObject(out[gid]) as Record<string, boolean> | null;
        const mergedSub: Record<string, boolean> = subI ? { ...subI } : {};
        for (const k of Object.keys(subE)) {
          if (!(k in mergedSub)) mergedSub[k] = subE[k];
        }
        out[gid] = mergedSub;
      }
    }
    return out;
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

    let content: string;
    try {
      content = await this.app.vault.adapter.read(path);
    } catch {
      // 读盘失败（权限 / 并发删除）：按空返回以免拖垮上层，但**必须标记该文件不可写入** ——
      // 调用方（runDiagnosis 的合并写入就会）拿空数组做基底后回写，等于覆盖读不出来的真实数据。
      this._ioFailedPaths.add(normalizePath(path));
      return [];
    }
    this._ioFailedPaths.delete(normalizePath(path));

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // 截断/语法损坏：绝不抛错——exportAllData / importData / runDiagnosis 都直接 await 本方法，
      // 一处 SyntaxError 会连锁拖垮「导出备份 / 导入 / AI 诊断」（H11 只兜住了「非数组」）。
      // 原文件一字不改地隔离留档后返回空，既不丢数据也不中断调用方。
      await this.quarantineCorruptGoals(path, content);
      return [];
    }

    // 损坏为非数组（null/{}数字）时返回 []，避免下游 as GoalItem[] 后 .map/.length 抛错（H11）
    return Array.isArray(parsed) ? (parsed as GoalItem[]) : [];
  }

  async putGoals(goals: GoalItem[]): Promise<void> {
    const path = this.goalsPath();
    const existing = await this.readExistingGoalsText(path);

    if (existing !== null) {
      let parsed: unknown;
      let corrupt = false;
      try {
        parsed = JSON.parse(existing);
      } catch {
        corrupt = true;
      }

      // 守卫 ①（损坏保护）：文件存在但无法解析 → 绝不覆盖。
      // 旧实现把这种情况写在 catch 里、注释「文件损坏或不存在，继续正常写入」，把「损坏」误判成「不存在」：
      // 于是任何一次写入（含 load 拿到空数组后的迁移回写）都会把用户目标永久抹掉。
      // 这里改为：隔离留档后跳过本次写入，交由用户修复，或由下次读取拿到空数据后重建。
      if (corrupt) {
        await this.quarantineCorruptGoals(path, existing);
        return;
      }

      // 守卫 ②：检测数据量悬崖（N条目标 → 空数组）
      if (goals.length === 0 && Array.isArray(parsed) && parsed.length > 0 && !this._warnedPaths.has(path)) {
        new Notice(
          `⚠️ 检测到目标数据异常清空（${parsed.length} 条 → 空），已自动拦截。\n如果确实要清空所有目标，请再次操作。`
        );
        this._warnedPaths.add(path);
        return;
      }
    }

    await this.vaultWrite(path, JSON.stringify(goals, null, 2));
  }

  /** 读取既有 goals.json 原文；不存在/读取失败/空白内容返回 null（空白视为无数据，可安全写入） */
  private async readExistingGoalsText(path: string): Promise<string | null> {
    try {
      if (!(await this.app.vault.adapter.exists(path))) return null;
      const raw = await this.app.vault.adapter.read(path);
      // 读成功：解除标记（不会永久锁死保存）
      this._ioFailedPaths.delete(normalizePath(path));
      return raw.trim() === '' ? null : raw;
    } catch {
      // 与「不存在 / 空白」区分开：那两种可以安全写入，读失败不行 ——
      // 内容无法确认，且读不出来所以连隔离留档都做不了，写入即不可逆覆盖。
      this._ioFailedPaths.add(normalizePath(path));
      return null;
    }
  }

  /**
   * 把「存在但无法解析」的 goals.json 隔离留档为 goals.json.corrupt-<时间戳>。
   *
   * 为什么不能只「返回 []」了事：GoalService.load() 拿到空数组会走 day 数据迁移 → _save() 回写，
   * 而旧守卫的 catch 又把损坏当「不存在」放行 → 损坏文件被覆盖，用户目标永久丢失。
   * 所以先写备份、再移除原文件：内容一字不改地留在 vault 里（用户可手动找回），
   * 规范路径腾空后，读取不再反复报错、写入也不再冒险覆盖。
   */
  private async quarantineCorruptGoals(path: string, content: string): Promise<void> {
    await this.quarantineCorruptFile(path, content, '目标数据');
  }

  /**
   * 把「存在但无法解析」的文件隔离留档为 <path>.corrupt-<时间戳>，再移除原文件。
   *
   * 泛化自 goals 的处理。完整 rationale（goals 专属，保留备查）：
   *   为什么不能只「返回 []」了事 —— GoalService.load() 拿到空数组会走 day 数据迁移 → _save() 回写，
   *   而旧守卫的 catch 又把损坏当「不存在」放行 → 损坏文件被覆盖，用户目标永久丢失。
   * 所以：先写备份、再移除原文件。内容一字不改地留在 vault 里（用户可手动找回），
   * 规范路径腾空后，读取不再反复报错、写入也不再冒险覆盖。
   *
   * 备份失败时**不删原文件**（宁可重复留一份，也不冒险丢内容）。
   */
  private async quarantineCorruptFile(path: string, content: string, label: string): Promise<void> {
    const backup = normalizePath(`${path}.corrupt-${this.corruptStamp(new Date())}`);
    const name = backup.slice(backup.lastIndexOf('/') + 1);
    try {
      await this.app.vault.adapter.write(backup, content);
      await this.app.vault.adapter.remove(path);
      new Notice(`⚠️ ${label}文件已损坏（无法解析），原文件已备份为 ${name}。`);
    } catch {
      new Notice(`⚠️ ${label}文件已损坏（无法解析），且自动备份失败，请手动检查 ${name.replace(/\.corrupt-.*$/, '')}。`);
    }
  }

  /**
   * 读并解析一个 JSON 文件；读失败或解析失败一律返回 null。
   * 与裸 read+JSON.parse 的关键区别：**解析失败会先把原文件隔离留档**，
   * 否则调用方按「无数据」处理后，下一次写入会把损坏内容静默覆盖 → 永久丢失且无从恢复。
   */
  private async readJsonFile(path: string, label: string): Promise<unknown> {
    let content: string;
    try {
      content = await this.app.vault.adapter.read(path);
    } catch {
      // 读失败分两种：「文件不存在」可安全写入；「存在但读不出来」绝不可覆盖。
      // 诚实标注：当前 7 个调用方在调用本方法前都已先查 exists，所以这条 catch
      // 实际只会遇到后者，下面的 exists 判断属于防御未来 —— 一旦有人新增调用方时漏查
      // exists，无条件标记就会让「首次写入」被守卫⓪ 静默拦下（用户第一次保存凭空消失）。
      // 该防御分支因此无法被测试覆盖（不可达），不要误以为它有回归保护。
      const stillExists = await this.app.vault.adapter.exists(path).catch(() => false);
      if (stillExists) this._ioFailedPaths.add(normalizePath(path));
      return null;
    }
    this._ioFailedPaths.delete(normalizePath(path));
    try {
      return JSON.parse(content) as unknown;
    } catch {
      await this.quarantineCorruptFile(path, content, label);
      return null;
    }
  }

  /** 备份文件名的本地时间戳：YYYYMMDD-HHmmss */
  private corruptStamp(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }

  // ---- AI 规划侧车索引（plans-map.json）----
  // 结构：{ "<vaultPath>#<contentHash>": string[] (goalIds) }
  // 用途：同一笔记重复规划时按 contentHash 幂等，避免目标重复追加。

  private plansIndexPath(): string {
    return normalizePath(`${this.basePath}/plans-map.json`);
  }

  // ---- 画中卷·便签（typewriter notes）----
  // 独立 JSON 文件，与 settings/goals 解耦，避免大数组膨胀配置；上限由 webapp 侧控制。
  private typewriterNotesPath(): string {
    return normalizePath(`${this.basePath}/typewriter-notes.json`);
  }

  async getTypewriterNotes(): Promise<Record<string, unknown>[]> {
    const path = this.typewriterNotesPath();
    if (!(await this.app.vault.adapter.exists(path))) return [];
    try {
      const content = await this.app.vault.adapter.read(path);
      const parsed: unknown = content ? JSON.parse(content) : [];
      this._ioFailedPaths.delete(normalizePath(path));
      return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
    } catch {
      // exists 已确认（上面有短路），所以这里是「存在但读/解析失败」：标记不可写入
      this._ioFailedPaths.add(normalizePath(path));
      return [];
    }
  }

  async putTypewriterNotes(notes: unknown): Promise<void> {
    // fail-fast：非法输入直接抛错，绝不静默降级为 []（否则会清空用户便签且无感知）。
    // 正常调用方应传数组；契约由 webapp 的 TypewriterStore 收敛保证。
    if (!Array.isArray(notes)) {
      throw new Error(`putTypewriterNotes: payload must be an array, got ${notes == null ? 'null' : typeof notes}`);
    }
    await this.vaultWrite(this.typewriterNotesPath(), JSON.stringify(notes, null, 2));
  }

  // ---- 画中卷·写作档（多组卡片：每组独立文件 + 轻量索引）----
  // 索引(仅 groups 元信息：id/title/updatedAt/current)放 settings.json 的 typewriter:writing-index（极小）；
  // 每组卡片(重，且无上限)放独立文件 typewriter-writing/<id>.json。
  // 这样「保存」只重写该组文件，不再把多组卡片塞进 settings.json 导致每次保存全量重写（性能隐患的根源）。
  // 旧版曾把整组写作数据塞进 settings.json 的 typewriter:writing，由 webapp 侧首启自动迁移（见 TypewriterStore._migrateLegacyWriting）。
  // 写作档存储目录：原生设置 writeStoreFolder（相对 basePath 的子目录，默认 typewriter-writing），
  // 由 AppAPI 构造时注入（与 dataPath 同源）。兼容上一版直接写入 bamboo-review/settings.json 的旧值（getSetting 回退）。
  private _writingFolder: string;           // 注入值（已 normalizePath）
  private _writingFolderResolved = false;   // 旧键回退是否已尝试
  private _writingMigrated = false;

  /** 解析写作档存储目录（相对 basePath 的子路径）；注入值优先，缺省/默认态回落上一版遗留键。 */
  private async resolveWritingFolder(): Promise<string> {
    if (this._writingFolder && this._writingFolder !== 'typewriter-writing') return this._writingFolder;
    // 回落：上一版曾把 writeStoreFolder 直接写入 bamboo-review/settings.json，沿用旧值避免孤儿档
    if (!this._writingFolderResolved) {
      this._writingFolderResolved = true;
      try {
        const s = await this.getSetting('writeStoreFolder');
        const norm = typeof s === 'string' && s.trim() ? this.safeSubFolder(s.trim()) : '';
        if (norm && norm !== 'typewriter-writing') this._writingFolder = norm;
      } catch { /* 读不到就用注入的默认值 */ }
    }
    return this._writingFolder || 'typewriter-writing';
  }

  /** 把用户填写的目录收敛为安全子路径：去反斜杠/前导斜杠、禁 ..、去尾斜杠；非法返回 '' */
  private safeSubFolder(name: string): string {
    const n = name.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    if (!n || n.includes('..')) return '';
    return n;
  }

  /**
   * 目录切换时把旧默认目录 typewriter-writing/ 里的写作档复制到新目录（一次性，会话内只跑一次）。
   * 只搬「新目录里还没有」的文件，已存在则跳过 —— 可重复执行、幂等。复制式（不删旧档），零丢失优先。
   */
  private async ensureWritingFolderMigrated(): Promise<void> {
    if (this._writingMigrated) return;
    this._writingMigrated = true;
    try {
      const folder = await this.resolveWritingFolder();
      if (folder === 'typewriter-writing') return; // 默认目录，无需迁移
      const base = normalizePath(this.basePath);
      const oldDir = normalizePath(`${base}/typewriter-writing`);
      if (!(await this.app.vault.adapter.exists(oldDir))) return;
      const list = await this.app.vault.adapter.list(oldDir);
      for (const oldPath of list.files) {
        if (!oldPath.endsWith('.json')) continue;
        const id = oldPath.split('/').pop()?.replace(/\.json$/, '');
        if (!id) continue;
        let safeId: string;
        try { safeId = assertSafeDocId(id); } catch { continue; }
        const newPath = normalizePath(`${base}/${folder}/${safeId}.json`);
        if (await this.app.vault.adapter.exists(newPath)) continue;
        try {
          const content = await this.app.vault.adapter.read(oldPath);
          await this.vaultWrite(newPath, content); // 仅复制，不删旧档（零丢失）
        } catch { /* 单档失败跳过 */ }
      }
    } catch { /* 迁移不应阻断正常读写 */ }
  }

  private async typewriterWritingDocPath(id: string): Promise<string> {
    const folder = await this.resolveWritingFolder();
    return normalizePath(`${this.basePath}/${folder}/${assertSafeDocId(id)}.json`);
  }

  async getTypewriterWritingIndex(): Promise<unknown> {
    return this.getSetting('typewriter:writing-index');
  }

  async putTypewriterWritingIndex(idx: unknown): Promise<void> {
    await this.putSetting('typewriter:writing-index', idx);
  }

  async getTypewriterWritingDoc(id: string): Promise<{ version: number; notes: unknown[]; links: unknown[]; canvasOffset: { x: number; y: number } | null } | null> {
    await this.ensureWritingFolderMigrated();
    const path = await this.typewriterWritingDocPath(id);
    if (!(await this.app.vault.adapter.exists(path))) return null;
    // 解析失败先隔离留档：否则 webapp 会按「无此档」新建并覆盖，损坏内容永久丢失
    const parsed = await this.readJsonFile(path, '写作档');
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as Record<string, unknown>).notes)) return null;
    return parsed as { version: number; notes: unknown[]; links: unknown[]; canvasOffset: { x: number; y: number } | null };
  }

  async putTypewriterWritingDoc(id: string, doc: unknown): Promise<void> {
    // vaultWrite 会自动创建不存在的父目录（可配置目录），无需预先 mkdir
    await this.ensureWritingFolderMigrated();
    await this.vaultWrite(await this.typewriterWritingDocPath(id), JSON.stringify(doc, null, 2));
  }

  async deleteTypewriterWritingDoc(id: string): Promise<void> {
    const path = await this.typewriterWritingDocPath(id);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }

  // ---- 画中卷·思维子弹（多组导图：每组独立文件 + 轻量索引）----
  // 与写作档完全同构：索引(轻量)走 settings.json；每组文档放独立文件 <mindmapFolder>/<id>.json，
  // 避免多组 + 大文档把 settings.json 撑大、每次保存整文件重写（性能悬崖）。
  // 存储目录：原生设置 mindmapStoreFolder（相对 basePath 的子目录，默认 typewriter-mindmap），由 AppAPI 注入。
  private typewriterMindmapDocPath(id: string): string {
    return normalizePath(`${this.basePath}/${this._mindmapFolder}/${assertSafeDocId(id)}.json`);
  }

  async getTypewriterMindmapDoc(id: string): Promise<{ version: number; nodes: unknown[]; links: unknown[]; view: { x: number; y: number } | null; style: number } | null> {
    const path = this.typewriterMindmapDocPath(id);
    if (!(await this.app.vault.adapter.exists(path))) return null;
    // 解析失败先隔离留档（与写作档一致）
    const parsed = await this.readJsonFile(path, '思维子弹档');
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as Record<string, unknown>).nodes)) return null;
    return parsed as { version: number; nodes: unknown[]; links: unknown[]; view: { x: number; y: number } | null; style: number };
  }

  async putTypewriterMindmapDoc(id: string, doc: unknown): Promise<void> {
    // vaultWrite 会自动创建不存在的父目录（mindmapStoreFolder 目录），无需预先 mkdir
    await this.vaultWrite(this.typewriterMindmapDocPath(id), JSON.stringify(doc, null, 2));
  }

  async deleteTypewriterMindmapDoc(id: string): Promise<void> {
    const path = this.typewriterMindmapDocPath(id);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }

  // 便签组文档：每组独立文件，索引(轻量)放 settings.json（与写作/导图同构）
  // 存储目录：原生设置 notesStoreFolder（相对 basePath 的子目录，默认 typewriter-notes），由 AppAPI 注入。
  private typewriterNotesDocPath(id: string): string {
    return normalizePath(`${this.basePath}/${this._notesFolder}/${assertSafeDocId(id)}.json`);
  }
  async getTypewriterNotesDoc(id: string): Promise<{ version: number; notes: unknown[]; links: unknown[]; canvasOffset: { x: number; y: number; scale?: number } | null } | null> {
    const path = this.typewriterNotesDocPath(id);
    if (!(await this.app.vault.adapter.exists(path))) return null;
    // 解析失败先隔离留档（与写作档一致）
    const parsed = await this.readJsonFile(path, '便签档');
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as Record<string, unknown>).notes)) return null;
    return parsed as { version: number; notes: unknown[]; links: unknown[]; canvasOffset: { x: number; y: number; scale?: number } | null };
  }
  async putTypewriterNotesDoc(id: string, doc: unknown): Promise<void> {
    await this.vaultWrite(this.typewriterNotesDocPath(id), JSON.stringify(doc, null, 2));
  }
  async deleteTypewriterNotesDoc(id: string): Promise<void> {
    const path = this.typewriterNotesDocPath(id);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
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

    // 盘上内容损坏时绝不能照旧写入 —— 两个分支都算：
    //   · TFile 分支：旧实现在 process 回调里把损坏当空对象 → 写入 {key: value}，
    //     把「其它所有设置键」一起抹掉（主题 / 音源 / 市场安装记录全没）；
    //   · 非 TFile 分支：走 vaultWrite 整体替换 → 同样抹掉。
    // 统一先隔离留档，再按全新文件重建这一个键。
    const cur = await this.app.vault.adapter.read(path).catch(() => null);
    if (cur !== null && cur.trim()) {
      let ok = false;
      try {
        const p: unknown = JSON.parse(cur);
        ok = !!p && typeof p === 'object' && !Array.isArray(p);
      } catch { ok = false; }
      if (!ok) {
        await this.quarantineCorruptFile(path, cur, '设置');
        await this.vaultWrite(path, JSON.stringify({ [key]: value }, null, 2));
        return;
      }
    }

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

  /**
   * 批量写设置：**一次读 + 一次原子写**。
   *
   * 用途：切换布局时 layoutMode 与 displayWidth 成对写入；若各自调用 putSetting，
   * 就是 2×(读整份 settings.json + 解析 + 原子写回)。批量接口把这类"成对写入"压到 1 次全量读写。
   * 损坏文件沿用与 putSetting 相同的隔离重建策略。
   */
  async putSettings(values: Record<string, unknown>): Promise<void> {
    const entries = Object.entries(values || {});
    if (entries.length === 0) return;
    const path = normalizePath(this.settingsPath());

    const cur = await this.app.vault.adapter.read(path).catch(() => null);
    if (cur !== null && cur.trim()) {
      let ok = false;
      try {
        const p: unknown = JSON.parse(cur);
        ok = !!p && typeof p === 'object' && !Array.isArray(p);
      } catch { ok = false; }
      if (!ok) {
        await this.quarantineCorruptFile(path, cur, '设置');
        await this.vaultWrite(path, JSON.stringify(Object.fromEntries(entries), null, 2));
        return;
      }
    }

    const abstract = this.app.vault.getAbstractFileByPath(path);
    if (abstract instanceof TFile) {
      await this.app.vault.process(abstract, (data) => {
        let settings: Record<string, unknown> = {};
        if (data && data.trim()) {
          try {
            settings = JSON.parse(data) as Record<string, unknown>;
          } catch {
            settings = {};
          }
        }
        for (const [k, v] of entries) settings[k] = v;
        return JSON.stringify(settings, null, 2);
      });
      return;
    }

    // 非 TFile：保留盘上已有内容后整体写入
    let base: Record<string, unknown> = {};
    if (cur && cur.trim()) {
      try {
        const parsed: unknown = JSON.parse(cur);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          base = parsed as Record<string, unknown>;
        }
      } catch { base = {}; }
    }
    for (const [k, v] of entries) base[k] = v;
    await this.vaultWrite(path, JSON.stringify(base, null, 2));
  }

  async getAllSettings(): Promise<AppSettings> {
    const path = this.settingsPath();
    if (!(await this.app.vault.adapter.exists(path))) {
      return {};
    }
    // 解析失败先隔离留档再按空设置返回：否则 putSetting 会把其它设置键一起抹掉
    const parsed = await this.readJsonFile(path, '设置');
    // parse 成功但非对象（如 "abc" / 数字 / 数组）会被 {...existing} 展开导致合并错乱，按损坏兜底
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as AppSettings;
  }

  /**
   * 解析历史文件内容，保证返回结构的 `records` 始终为数组。
   * 磁盘文件损坏（JSON 解析失败 / 非对象 / records 非数组）时归一化为空记录，
   * 以免 webapp 遍历 records 抛出 "s.records is not iterable" 而使首页全空白。
   */
  private static normalizeHistory(parsed: unknown): PurchaseHistory | IncomeHistory {
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      && Array.isArray((parsed as Record<string, unknown>).records)) {
      return parsed as PurchaseHistory;
    }
    return { records: [] };
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
    // 解析失败先隔离留档再归一化为空记录：否则下次 putPurchaseHistory 会静默覆盖掉损坏内容
    return VaultStorage.normalizeHistory(await this.readJsonFile(path, '购买历史'));
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
    // 解析失败先隔离留档再归一化为空记录（同上，避免被静默覆盖）
    return VaultStorage.normalizeHistory(await this.readJsonFile(path, '收入历史'));
  }

  async putIncomeHistory(data: IncomeHistory): Promise<void> {
    const path = this.incomeHistoryPath();
    await this.vaultWrite(path, JSON.stringify(data, null, 2));
  }

  // ---- 导出/导入 ----

  /** 读出指定目录下全部 .json 文档：key = 文件名去扩展名，value = 解析后的对象（单个损坏文件跳过） */
  private async readDocsIn(folder: string): Promise<Record<string, unknown>> {
    const dir = normalizePath(`${this.basePath}/${folder}`);
    if (!(await this.app.vault.adapter.exists(dir))) return {};
    const list = await this.app.vault.adapter.list(dir);
    const out: Record<string, unknown> = {};
    for (const file of list.files) {
      if (!file.endsWith('.json')) continue;
      const id = file.split('/').pop()?.replace(/\.json$/, '') ?? '';
      if (!id) continue;
      try {
        const parsed: unknown = JSON.parse(await this.app.vault.adapter.read(file));
        if (parsed && typeof parsed === 'object') out[id] = parsed;
      } catch { /* 单个文件损坏：跳过，不阻塞整包导出 */ }
    }
    return out;
  }

  /**
   * 删除目录下「不在 keep 集合中」的指定扩展名文件。
   *
   * 用于「先写后清」的收尾：先把新数据全部写入（同名自然覆盖），再删掉备份里没有的旧文件。
   * 相比「先清后写」（rmdir 整个目录再逐条写），中途失败的最坏结果从
   * 「旧数据已删、新数据未写完 → 净丢失」降级为「新旧混合、一条不丢」。
   */
  private async removeStaleIn(dir: string, keep: Set<string>, ext: string): Promise<void> {
    if (!(await this.app.vault.adapter.exists(dir))) return;
    const list = await this.app.vault.adapter.list(dir);
    await Promise.all(
      list.files
        .filter((f) => f.toLowerCase().endsWith(ext))
        .map((f) => {
          const name = f.split('/').pop()?.replace(new RegExp(`\\${ext}$`, 'i'), '') ?? '';
          if (!name || keep.has(name)) return Promise.resolve();
          return this.app.vault.adapter.remove(f).catch(() => { /* 已删除则忽略 */ });
        })
    );
  }

  async exportAllData(): Promise<ExportShape> {
    const writingFolder = await this.resolveWritingFolder();
    const [
      days, goals, settings, purchaseHistory, incomeHistory, customTemplates,
      typewriterWritingDocs, typewriterNotesDocs, typewriterMindmapDocs, typewriterNotes,
    ] = await Promise.all([
      this.getAllDays(),
      this.getGoals(),
      this.getAllSettings(),
      this.getPurchaseHistory(),
      this.getIncomeHistory(),
      this.getCustomTemplates(),
      this.readDocsIn(writingFolder),
      this.readDocsIn(this._notesFolder),
      this.readDocsIn(this._mindmapFolder),
      this.getTypewriterNotes(),
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
      customTemplates,
      // 画中卷三模式的程序数据（此前备份完全不含，重置/换设备后无法恢复 —— 历史缺口）
      typewriterWritingDocs,
      typewriterNotesDocs,
      typewriterMindmapDocs,
      typewriterNotes,
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
      // 先写后清：overwrite 语义 = 「最终只剩备份里的这些天」。
      // 旧实现先 rmdir(data) 再逐条写，中途失败（磁盘满 / 重载 / 某天异常）会留下
      // 「旧数据已删、新数据未写完」的净丢失；先写后清最坏只是新旧混合，一条不丢。
      for (const day of Object.values(days)) {
        await this.putDay(day);
      }
      if (strategy === 'overwrite') {
        await this.removeStaleIn(normalizePath(`${this.basePath}/data`), new Set(Object.keys(days)), '.json');
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

    if (record.customTemplates !== undefined) {
      const incoming: CustomTemplate[] = Array.isArray(record.customTemplates)
        ? record.customTemplates
        : [];
      // 先写后清（同上：避免「已删未写」的净丢失）
      for (const tpl of incoming) {
        if (tpl && tpl.id) await this.putCustomTemplate(tpl);
      }
      if (strategy === 'overwrite') {
        await this.removeStaleIn(this.templateDir(), new Set(incoming.map((t) => t.id)), '.md');
      }
    }

    // ── 画中卷三模式的程序数据（早期版本备份完全不含这些，属历史缺口）──
    // id 由 ImportValidator.normalizeDocMap 收敛为安全字符集；put* 内部还会再 assert 一次。
    const writingFolder = await this.resolveWritingFolder();
    if (record.typewriterWritingDocs !== undefined) {
      const docs = ImportValidator.normalizeDocMap(record.typewriterWritingDocs);
      // 先写后清（同上）
      for (const [id, doc] of Object.entries(docs)) {
        await this.putTypewriterWritingDoc(id, doc);
      }
      if (strategy === 'overwrite') {
        await this.removeStaleIn(normalizePath(`${this.basePath}/${writingFolder}`), new Set(Object.keys(docs)), '.json');
      }
    }
    if (record.typewriterNotesDocs !== undefined) {
      const docs = ImportValidator.normalizeDocMap(record.typewriterNotesDocs);
      for (const [id, doc] of Object.entries(docs)) {
        await this.putTypewriterNotesDoc(id, doc);
      }
      if (strategy === 'overwrite') {
        await this.removeStaleIn(normalizePath(`${this.basePath}/${this._notesFolder}`), new Set(Object.keys(docs)), '.json');
      }
    }
    if (record.typewriterMindmapDocs !== undefined) {
      const docs = ImportValidator.normalizeDocMap(record.typewriterMindmapDocs);
      for (const [id, doc] of Object.entries(docs)) {
        await this.putTypewriterMindmapDoc(id, doc);
      }
      if (strategy === 'overwrite') {
        await this.removeStaleIn(normalizePath(`${this.basePath}/${this._mindmapFolder}`), new Set(Object.keys(docs)), '.json');
      }
    }
    if (record.typewriterNotes !== undefined) {
      // 旧版单文件便签存储：仅接受数组；非数组视为无数据，避免把盘上内容覆盖成 null
      await this.putTypewriterNotes(Array.isArray(record.typewriterNotes) ? record.typewriterNotes : []);
    }

    // 导入代表一次全新数据集合，旧 plans-map.json 的 contentHash→goalIds 映射已不可信；
    // 重置幂等索引，避免「AI 规划显示已规划却不写入目标」的孤儿阻塞（H3）
    await this.putPlansIndex({});
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
    // id 直接参与路径拼接：模板 id 可能来自外部消息，未校验则 `../x` 可越界写/删任意 .md
    return normalizePath(`${this.templateDir()}/${assertSafeAssetId(id, '模板 id')}.md`);
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

}
