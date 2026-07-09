/**
 * 核心数据层类型定义（B 档：消除数据层 any）
 *
 * 这些类型被 VaultStorage / ImportValidator / MarkdownSync / StorageBridge 共用，
 * 确保"导入校验"与"实际落盘结构"在编译期保持一致——
 * 以后改 DayData 结构时，TS 会强制同步 ImportValidator 的校验逻辑。
 */

/** 单日时间轴的一个时段 */
export interface TimelinePeriod {
  period: string;
  name: string;
  time: string;
  icon?: string;
  eval?: string;
  items?: Array<{ time: string; task: string; eval?: string }>;
}

/** 目标项（goals 下的一项进度） */
export interface GoalSubItem {
  name: string;
  percent?: number;
  detail?: string;
}

/** 单个目标 */
export interface GoalItem {
  id: string;
  title: string;
  icon?: string;
  meta?: string;
  items?: GoalSubItem[];
}

/** 单日复盘数据 */
export interface DayData {
  date: string;
  weekday?: string;
  metrics?: {
    firstCheckIn?: string;
    lastCheckIn?: string;
    completedTasks?: string;
    inspirationCount?: string;
    activeTime?: string;
    emptySlots?: string;
    [key: string]: string | undefined;
  };
  timeline?: TimelinePeriod[];
  goals?: GoalItem[];
  [key: string]: unknown;
}

/** 应用设置（落 settings.json） */
export interface AppSettings {
  theme?: 'light' | 'dark';
  balance?: number;
  colorTheme?: string;
  [key: string]: unknown;
}

/** 购买历史 / 收入历史（结构宽松，仅做透传） */
export interface HistoryRecord {
  id?: string;
  [key: string]: unknown;
}

export interface PurchaseHistory {
  records?: HistoryRecord[];
  archive?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface IncomeHistory {
  records?: HistoryRecord[];
  archive?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 导出 / 导入的完整数据结构 */
export interface ExportShape {
  version: string;
  exportedAt?: string;
  storageType?: string;
  days: Record<string, DayData>;
  goals: GoalItem[];
  settings: AppSettings;
  purchaseHistory: PurchaseHistory | null;
  incomeHistory: IncomeHistory | null;
  themes?: unknown[];
  reports?: unknown[];
}
