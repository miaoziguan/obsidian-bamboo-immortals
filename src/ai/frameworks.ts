/**
 * frameworks — Layer A 框架选择（Phase 3）
 *
 * 这是规划器"下游"的第一道专业分诊：在「意图澄清（Layer 0）」之后、
 * 「量化拆解（Layer B / MarkdownPlanner）」之前，按目标类型挑选一套
 * 更专业的分解框架，而不是把任何目标都套进「总量÷天数」的单一习惯框架。
 *
 * 设计原则（与 Layer 0 一致）：
 *  - 纯数据 + 纯函数，零 Obsidian 依赖，便于单测与 webapp 复用；
 *  - 向后兼容：framework 缺省（不传 / 'quantify'）时，MarkdownPlanner
 *    的提示词与今天【完全一致】，老路径 ai-plan-from-note / selection 不受影响；
 *  - 专业框架【追加】在通用量化铁律之后（而非替换），并要求仍产出
 *    纯数字 dailyMin（保留代理进度），以兼容 GoalSubItem 数据模型与健康引擎。
 */

import type { GoalBrief, GoalKind } from '../types/data';

/** 可选择的分解框架类型 */
export type FrameworkType = 'quantify' | 'habit' | 'milestone' | 'stage';

/** 一个专业框架的定义 */
export interface FrameworkDef {
  id: FrameworkType;
  /** UI 展示名 */
  label: string;
  /** 适用目标类型（Layer0 的 goalKind 命中即自动选，仅作提示/校验用） */
  appliesTo: GoalKind[];
  /** 一句话说明（给用户看，也用于弹窗选项描述） */
  description: string;
  /**
   * 注入到规划提示词的专业框架指引（追加在通用量化铁律之后）。
   * 空串 = 不追加（即默认量化日级框架本身）。
   */
  fragment: string;
}

/** 框架注册表（单一数据源） */
export const FRAMEWORKS: Record<FrameworkType, FrameworkDef> = {
  quantify: {
    id: 'quantify',
    label: '量化日级框架',
    appliesTo: ['unclear', 'vision', 'borrowed'],
    description:
      '默认。把目标量化到日颗粒度，按「总量 ÷ 可工作天数」反推每日量。是 vision/borrowed/unclear 的统一回落框架。',
    fragment: '',
  },

  habit: {
    id: 'habit',
    label: '习惯回路框架',
    appliesTo: ['habit'],
    description:
      '面向习惯型：靠日复一日重复养成，无明确交付物。强调最小可行量 + 习惯回路（触发→动作→反馈），而非里程碑拆分。',
    fragment: `
# 本目标适用的专业框架：习惯回路（习惯型）
本目标被识别为「习惯型」——靠日复一日的重复养成，没有明确的"交付物"，成功 = 持续做而非做完。请按以下方式拆解：
- 子项代表【可重复的原子动作】，而非里程碑 / 交付物。例：「每天读书(页)」「每天运动(分钟)」「每天冥想(分钟)」。习惯靠"每天都做"推进，不是靠"做完一件事"。
- 用「习惯回路」锚定：routine（要养成的动作）最好挂在一个【已有的稳定日常】之后（习惯堆叠，如"晚饭后→读书"），让触发自然发生；用可数指标记录 reward（如连续打卡天数 / 累计量），让进度可见。name 可提示触发场景（如"晚饭后·每天读书(页)"）。
- 最小可行量（降低启动门槛）：dailyMin 取"小到不可能失败"的量（如每天 1 页 / 5 分钟），而非贪大（别一上来就 30 页）。若目标宏大，先在 reason 说明"先养成节奏，稳定后再逐步加码"，dailyMin 从微起步。
- 通常只需 1 个贯穿全程的日级子项（或"动作 + 追踪指标"两个）；不必硬拆成多段里程碑。taskDayType 默认 daily（习惯是每天）。
- 仍须遵守通用铁律：纯数字 dailyMin、必须直接服务该习惯、禁止"坚持 / 自律 / 更自律"等不可数伪量化词。`,
  },

  milestone: {
    id: 'milestone',
    label: '项目里程碑框架',
    appliesTo: ['project'],
    description:
      '面向项目型：拆成可交付的里程碑 / 工作流，每个里程碑有自己的窗口与每日推进量，而非简单「总量 ÷ 天数」。',
    fragment: `
# 本项目适用的专业框架：里程碑拆解（项目型）
本目标被识别为「项目型」——有明确交付物与里程碑，不应只做「总量 ÷ 总天数」的均摊，而应按【可交付里程碑】推进。
- 子项代表【可交付的里程碑 / 工作流节点】，而非笼统的每日动作。例：「完成需求评审」「上线 v1 模块」「交付设计稿」「通过验收测试」。
- 每个里程碑配【自己的窗口】：startDate / endDate 填该里程碑的起止日（应落在目标大区间之内），dailyMin 由【该窗口工期】反推（如"评审 10 天、需处理约 20 项 → 每天 2 项"），并在 reason 写明工期与计算依据，让用户可核实。
- 节奏允许非每日：动作天然按周 / 月推进（如"每周对齐一次"）时，taskDayType 用 weekly / monthly，dailyMin 按该周期语义填（如 weekly 填 "3" = 每周 3 次）；其余仍以 daily 为主。
- 里程碑的 targetValue 填【可交付标准】（如"通过评审的需求文档 v1"），currentValue 留空待推进；name 体现该里程碑的产出物而非动作。
- 仍须遵守通用铁律：每个子项纯数字 dailyMin、必须直接服务目标、禁止"努力 / 坚持"等伪量化词。`,
  },

  stage: {
    id: 'stage',
    label: '创作阶段框架',
    appliesTo: ['creative'],
    description:
      '面向创作型（小说 / 产品 / 课程）：按创作阶段（大纲→初稿→修订→发布）推进，而非「每天写 N 字」的粗暴除法。每阶段配可数代理指标。',
    fragment: `
# 本创作适用的专业框架：阶段推进（创作型）
本目标被识别为「创作型」（小说 / 产品 / 课程等）——它应按【创作阶段】推进，而不是「总量÷天数 = 每天写 N 字」的粗暴除法。请按以下方式拆解：
- 子项代表【创作阶段】：如「大纲与结构」「初稿写作」「修订打磨」「润色定稿」「投稿 / 发布」。让每个阶段成为可勾选的推进节点。
- 每个阶段配一个【可数代理指标】作为 dailyMin（保持通用数据模型兼容）：
  · 大纲阶段 → "每天梳理章节(个)" / "每天列提纲(条)"
  · 初稿阶段 → "每天写初稿(字)"（按该阶段工期反推，而非全书总字数均摊）
  · 修订阶段 → "每天精修(千字)" / "每天改章节(个)"
  · 发布阶段 → "每天投稿 / 运营(次)"
- 每个阶段子项要有自己的 endDate（该阶段截止日）+ 由其反推的 dailyMin，reason 说明阶段工期与日进度。
- 仍遵守通用铁律：纯数字 dailyMin、必须直接服务创作目标、禁止"提升文笔"等不可数伪量化词。`,
  },
};

/** 所有框架 id（含默认），供 UI 枚举 */
export const FRAMEWORK_IDS: FrameworkType[] = ['quantify', 'habit', 'milestone', 'stage'];

/**
 * 纯函数：根据 Layer0 简报选择专业框架。
 *  - goalKind 命中某专业框架的 appliesTo → 选它；
 *  - goalKind 缺失 / 未命中（含 habit / unclear / vision / borrowed）→ 回落默认量化框架。
 */
export function selectFramework(brief: GoalBrief): FrameworkType {
  const kind = brief.goalKind;
  if (!kind) return 'quantify';
  for (const def of Object.values(FRAMEWORKS)) {
    if (def.id === 'quantify') continue;
    if (def.appliesTo.includes(kind)) return def.id;
  }
  return 'quantify';
}

/** 取框架展示名（UI 用） */
export function frameworkLabel(f: FrameworkType): string {
  return FRAMEWORKS[f].label;
}
