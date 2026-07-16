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

/**
 * 目标领域枚举（与 webapp DEFAULT_CATEGORIES 保持一致）
 * work=工作 / personal=个人 / health=健康 / study=学习 / finance=财务 / other=其他
 */
export const GOAL_CATEGORIES = [
  { id: 'work', name: '工作', icon: '💼' },
  { id: 'personal', name: '个人', icon: '🌱' },
  { id: 'health', name: '健康', icon: '🏃' },
  { id: 'study', name: '学习', icon: '📚' },
  { id: 'finance', name: '财务', icon: '💰' },
  { id: 'other', name: '其他', icon: '🧩' },
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]['id'];

/** 子项节奏类型（与 webapp taskDayType 对齐） */
export type TaskDayType = 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * 目标项（goals 下的一项进度）
 * 字段向 webapp GoalService 期望的子项结构对齐（见 GoalService._migrateFromDayData / defaultData.js）：
 *  - dailyMin / taskDayType 驱动「今日任务」自动生成
 *  - startValue / targetValue / currentValue 驱动进度追踪
 */
export interface GoalSubItem {
  name: string;
  percent?: number;
  detail?: string;
  startDate?: string;
  endDate?: string;
  startValue?: string;
  targetValue?: string;
  currentValue?: string;
  /** 每日量（如 '30'、'2'），驱动今日任务增量；空则不生成今日任务 */
  dailyMin?: string;
  taskDayType?: TaskDayType | string;
  /** 规划来源标注（仅审阅展示/日报，可选） */
  sourceRef?: string;
}

/** 单个目标 */
export interface GoalItem {
  id: string;
  title: string;
  /** AI 对笔记的归纳分析（1-2 句主旨 + 拆解理由/关键风险），仅展示用，不持久化为子项 */
  analysis?: string;
  icon?: string;
  meta?: string;
  /** 领域（work/personal/health/study/finance/other），webapp 据此分组着色 */
  category?: GoalCategory | string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  priority?: string | number;
  /** 已归档（不参与进行中诊断） */
  archived?: boolean;
  archivedAt?: string;
  items?: GoalSubItem[];
  /** 规划来源：来源笔记的 vault 路径，用于日报标注 */
  sourceRef?: string;
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
