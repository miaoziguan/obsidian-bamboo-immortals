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
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- 允许 webapp/导入透传的任意节奏字符串，运行时由 cleanDailyMin/sanitize 回落合法值
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
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- 允许 webapp/导入透传的任意分类字符串，运行时由 sanitizeGoal 回落合法值
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

// =====================================================================
// Layer 0：意图澄清（目标简报）
//
// 这套类型是「规划前门」的数据契约：在把笔记/选区丢给 AI 拆解之前，
// 先用压力测试（stressTest）+ 苏格拉底追问（socratic）把模糊/借来/愿景型
// 目标 sharpen 成一份具体、自属、有承诺的 GoalBrief，再交给下游框架拆解。
// 设计原则：纯数据、零 Obsidian 依赖，便于单测与 webapp 复用。
// =====================================================================

/**
 * 目标类型（粗略分诊，供 Layer A 框架选择参考，本层只产出、不消费）。
 *  - habit   习惯型（每天重复原子动作，dailyMin 即其专业框架）
 *  - project 项目型（有明确交付物与里程碑）
 *  - creative 创作型（小说/产品，按阶段而非字数推进）
 *  - vision   愿景型（尚未落地，需澄清）
 *  - borrowed 借来型（老板/社会给的，非用户自属）
 *  - unclear  无法判定
 */
export type GoalKind = 'habit' | 'project' | 'creative' | 'vision' | 'borrowed' | 'unclear';

/**
 * 不可靠目标五类「病」（压力测试的诊断标签）：
 *  - vague          太虚 / 愿景型，缺具体成功口径（"成为第一""写本神作"）
 *  - non_owned      非自属 / 借来的目标，用户找不到自己可控的那块
 *  - means_as_end   手段当目的（给的是 means，"每天读10页"，ends 没说清）
 *  - no_commit      零承诺，无期限 / 无资源投入，只是愿望
 *  - outcome_as_input 把结果当输入（"行业第一"由市场决定，却当可控项）
 */
export type DiseaseType =
  | 'vague'
  | 'non_owned'
  | 'means_as_end'
  | 'no_commit'
  | 'outcome_as_input';

/** 一条苏格拉底追问（绑定某种 disease，供下一轮重新评估） */
export interface BriefQuestion {
  disease: DiseaseType;
  question: string;
  answer?: string;
}

/** 简报可靠性状态：draft=草稿 / clarified=通过澄清 / forced=用户强制跳过 */
export type ReliabilityStatus = 'draft' | 'clarified' | 'forced';

/**
 * 目标简报：Layer 0 的产出物。
 * 是下游「框架选择（Layer A）」与「量化执行（Layer B）」的输入契约——
 * 它回答的不是"每天做多少"，而是"这到底是个什么目标、成功怎么算、你能掌控哪块"。
 */
export interface GoalBrief {
  /** 用户原始意图（笔记/选区原文） */
  rawIntent: string;
  /** 粗略分诊类型（AI 给出，供框架选择参考） */
  goalKind?: GoalKind;
  /** 具体成果：用户最终想产出什么（一句话） */
  clarifiedOutcome?: string;
  /** 成功口径：用什么可验证指标证明"达成" */
  successMeasure?: string;
  /** 可控抓手：用户个人能直接控制的那一小块（剔除市场/他人决定项） */
  ownedSlice?: string;
  /** 约束：期限 / 资源投入 */
  constraints?: string;
  /** 领域（工作/学习/创作…自由文本，供框架选择参考） */
  domain?: string;
  /** 可靠性状态 */
  reliabilityStatus: ReliabilityStatus;
  /** 压力测试查出的、尚未解决的病（空=通过） */
  diseases: DiseaseType[];
  /** 追问历史（含用户回答） */
  questions: BriefQuestion[];
  /** 一句话归纳当前意图（AI 产出，仅展示） */
  summary?: string;
  /** 澄清轮次（从第 1 轮起） */
  round: number;
}
