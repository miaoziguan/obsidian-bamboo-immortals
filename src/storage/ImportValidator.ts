/**
 * ImportValidator - 导入数据的校验与字段补齐（宿主侧，零依赖）
 *
 * 用途：在 VaultStorage.importData 落盘前拦截损坏文件、补齐缺失字段，
 * 避免半截/非法数据污染 Vault。
 *
 * 设计原则：
 *  - 仅做"结构层面的安全兜底"，不重写业务字段（如 metrics 的具体数值）。
 *  - 字段补齐优先用导入数据自身的 key / 内容，缺失时才用安全默认值。
 *  - 任何无法修复的结构性损坏都抛 ImportValidationError，由调用方提示用户。
 */

import type {
  DayData,
  GoalItem,
  AppSettings,
  PurchaseHistory,
  IncomeHistory,
} from '../types/data';

class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

const KNOWN_FIELDS = ['days', 'goals', 'settings', 'purchaseHistory', 'incomeHistory'] as const;

/**
 * 纵深防御：导入数据是不可信边界（可能来自他人分享/下载的备份）。
 * 在落盘前递归净化所有字符串叶子，剥离 HTML 标签、事件处理属性
 * 与 javascript:/data: 伪协议，避免恶意负载经 innerHTML 渲染触发 XSS。
 * 本项目无富文本需求，统一文本化是安全的。
 */
function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return input as string;
  const out = input
    .replace(/<[^>]*>/g, '') // 移除所有 HTML 标签
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '') // 移除 on*="..."
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '') // 移除 on*='...'
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '') // 移除 on*=value（无引号）
    .replace(/javascript:/gi, '') // 移除 javascript: 伪协议
    .replace(/data:/gi, ''); // 移除 data: 伪协议
  return out;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map((v) => sanitizeValue(v));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      out[key] = sanitizeValue((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value; // 数字 / 布尔 / null 等原样保留
}

interface ValidatedImport {
  days?: Record<string, DayData>;
  goals?: GoalItem[];
  settings?: AppSettings;
  purchaseHistory?: PurchaseHistory;
  incomeHistory?: IncomeHistory;
}

export const ImportValidator = {
  /**
   * 校验并补齐导入数据。
   * @returns 补齐后的干净数据（结构与输入一致，但字段完整）
   * @throws ImportValidationError 当结构损坏无法修复时
   */
  validate(data: unknown): ValidatedImport {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new ImportValidationError('备份文件格式无效：根节点必须是 JSON 对象');
    }

    const record = data as Record<string, unknown>;

    // 损坏文件拒绝：没有任何已知字段 → 视为损坏/无关文件
    const hasKnownField = KNOWN_FIELDS.some((f) => record[f] !== undefined);
    if (!hasKnownField) {
      throw new ImportValidationError(
        '备份文件无效：未找到任何可识别的数据字段（days / goals / settings / purchaseHistory / incomeHistory）'
      );
    }

    const result: ValidatedImport = {};

    if (record.days !== undefined) {
      result.days = sanitizeValue(ImportValidator.normalizeDays(record.days)) as Record<string, DayData>;
    }
    if (record.goals !== undefined) {
      result.goals = sanitizeValue(ImportValidator.normalizeGoals(record.goals)) as GoalItem[];
    }
    if (record.settings !== undefined) {
      result.settings = sanitizeValue(ImportValidator.normalizeSettings(record.settings)) as AppSettings;
    }
    if (record.purchaseHistory !== undefined) {
      result.purchaseHistory = sanitizeValue(record.purchaseHistory) as PurchaseHistory;
    }
    if (record.incomeHistory !== undefined) {
      result.incomeHistory = sanitizeValue(record.incomeHistory) as IncomeHistory;
    }

    return result;
  },

  /**
   * 归一化 days。
   *  - 必须是对象；非对象（如数组/字符串）→ 视为无日数据，返回空对象（不污染 Vault）
   *  - 每个 day 缺 date 时用其 key 补齐
   *  - 每个 day 缺 metrics/timeline/goals 时补空结构
   */
  normalizeDays(days: unknown): Record<string, DayData> {
    if (!days || typeof days !== 'object' || Array.isArray(days)) {
      return {};
    }
    const raw = days as Record<string, DayData>;
    const out: Record<string, DayData> = {};

    for (const key of Object.keys(raw)) {
      const day = raw[key];
      if (!day || typeof day !== 'object' || Array.isArray(day)) {
        continue; // 跳过非对象条目
      }
      const clean: DayData = { ...day };
      if (!clean.date) clean.date = key; // 用 key 补 date
      if (!clean.metrics || typeof clean.metrics !== 'object') clean.metrics = {};
      if (!clean.timeline || !Array.isArray(clean.timeline)) clean.timeline = [];
      if (!clean.goals || !Array.isArray(clean.goals)) clean.goals = [];
      out[key] = clean;
    }
    return out;
  },

  /**
   * 归一化 goals。
   *  - 必须是数组；非数组 → 返回空数组
   *  - 每个 goal 缺 id 时补一个稳定可复现的 id
   */
  normalizeGoals(goals: unknown): GoalItem[] {
    if (!Array.isArray(goals)) {
      return [];
    }
    let counter = 0;
    return goals.map((raw): GoalItem => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw as GoalItem;
      const obj = raw as Record<string, unknown>;
      const clean = { ...obj } as unknown as GoalItem;
      if (!clean.id) {
        clean.id = `goal_import_${counter++}_${Date.now().toString(36)}`;
      }
      if (clean.items && !Array.isArray(clean.items)) clean.items = [];
      return clean;
    });
  },

  /**
   * 归一化 settings。
   *  - 必须是对象；非对象 → 返回空对象
   */
  normalizeSettings(settings: unknown): AppSettings {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return {};
    }
    return settings as AppSettings;
  },
};
