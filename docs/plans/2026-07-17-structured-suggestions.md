# 计划：诊断建议结构化命中具体子项（#7）

> 日期：2026-07-17 ｜ 关联：`2026-07-16-diagnosis-action-loop-design.md` §7（"建议指令被 AI 误执行"风险）
> 目标：把 `DiagnosisModal` 的"应用"从「整 goal 全部建议拼成自然语言 → 交给 AgenticPlanModal 的 AI 二次猜着改树」升级为「每条建议是结构化对象 → 确定性改写 → 精准命中具体子项 → 人工确认落库」。

## 背景与问题

当前 `GoalDiagnosis.suggestions: string[]` 是自然语言（如「将子项『每天跑步』的 dailyMin 从 30 降到 15」）。`runDiagnosis` 的 `onApply(goal)` 把**该 goal 的全部建议** `join('；')` 作为指令丢给 `AgenticPlanModal`，靠 `PlanningSession.send` 的 AI **重新理解**并改树。

两个问题：
1. **不逐条**：点任意一条建议 = 应用该 goal 全部建议，粒度粗。
2. **不保证命中**：AI 二次解释自然语言，可能改错/漏改具体子项（`diagnosis-action-loop-design.md` §7 已标注此风险）。

子项数据现实：`GoalItem.id` 存在，但 `GoalSubItem` **无 id**（只有 `name`），因此确定性匹配必须按**子项名（或 index）**。

## 方案概述（路径：结构化 + 确定性改写）

```
AI 诊断 → suggestions: Suggestion[]（结构化：action + goalRef + target + params）
   │  DiagnosisModal 每条建议独立「应用」按钮
   ▼（点单条）
applySuggestion(suggestion, goals)  ← 纯函数，按子项名确定性改写，零 AI 猜测
   │  找不到目标/子项 → applied=false，原树不动
   ▼
SuggestionApplyModal（聚焦预览：命中了哪个目标/子项、改了什么）
   │  用户确认
   ▼
writeDiagnosedGoals（写 goals.json + notifyGoalsChanged）  ← 完全复用现有落库
```

保留人工闸门（与 §7 一致），且不引入 CORS / 新网络。

---

## 文件级改动

### F1 新增 `src/ai/Suggestion.ts`（纯函数，核心）
```ts
export type SuggestionAction = 'adjust_dailyMin' | 'remove_subitem' | 'add_subitem' | 'note';
export interface SuggestionTarget { subItemName?: string; subItemIndex?: number; }
export interface SuggestionParams { dailyMin?: number; name?: string; taskDayType?: string; detail?: string; }
export interface Suggestion {
  id?: string;
  action: SuggestionAction;
  goalRef: { goalId?: string; goalTitle: string };
  target?: SuggestionTarget;
  params?: SuggestionParams;
  text: string;            // 人类可读文案（展示）
  rationale?: string;
  dimension?: 'L1' | 'L2' | 'L3';
}
export interface ApplyResult { goals: GoalItem[]; applied: boolean; message?: string; }

export function applySuggestion(s: Suggestion, goals: GoalItem[]): ApplyResult
export function applySuggestions(list: Suggestion[], goals: GoalItem[]): ApplyResult
```
`applySuggestion`（immutable，深拷贝）：
- 找目标：`goals.find(g => (s.goalRef.goalId && g.id===goalId) || g.title===goalTitle)`；无 → `{goals, applied:false, message:'未找到目标'}`。
- `adjust_dailyMin`：按 `target.subItemName`（或 `subItemIndex`）在 `goal.items` 命中子项；`params.dailyMin` 为有限数且 ≥0 → `dailyMin = String(Math.max(0, Math.round(v)))`；命中且合法 → `applied=true`；否则 `false`。
- `remove_subitem`：按名/index 过滤；移除数>0 → `applied=true`。
- `add_subitem`：`params.name` 存在且不被同名占用 → 追加 `{name, dailyMin?, taskDayType?, detail?}`；`applied=true`；否则 `false`。
- `note`：`applied=false`（无结构改动）。
- 返回**新数组**（替换该 goal 的克隆），绝不 mutate 入参。

### F2 `src/ai/GoalDiagnoser.ts`（结构化产出 + 向后兼容解析）
- `GoalDiagnosis.suggestions: Suggestion[]`（原 `string[]`）。
- `normalizeGoal`：suggestions 元素
  - 字符串 → `{ action:'note', text, goalRef:{goalTitle: g.title} }`（旧数据兼容）。
  - 对象 → 解析 `id/action(枚举默认 'note')/goalRef{goalId?, goalTitle ?? obj.goalRef?.goalTitle ?? g.title}/target{subItemName?, subItemIndex?}/params{dailyMin?, name?, taskDayType?, detail?}/text/rationale/dimension`。
- `buildDiagnosisMessages`：system 的 suggestions schema 改为结构化对象数组（含 `action/goalRef/target/params/text/dimension`），要求 `target.subItemName` **必须是真实子项清单里的精确名**、`adjust_dailyMin` 给具体数值 `params.dailyMin`、`add_subitem` 仅在确需时用且填 `params.name+dailyMin`；保留"禁止编造清单外子项"约束。
- `formatItemEvidenceForPrompt`：每条目标行加 `（goalId=xxx）`，子项行加 `[index]` 前缀，供 AI 填 `goalRef.goalId` / `target.subItemIndex`。

### F3 `src/ai/DiagnosisModal.ts`（逐条应用 + 应用全部）
- `DiagnosisModalOptions.onApply: (goal, suggestion) => void`；新增可选 `onApplyAll?: (goal) => void`。
- `renderSuggestions`：标题保留「建议（N）」+ 聚焦维度；若有 `onApplyAll` 则加「应用全部」按钮（调用它）。
- `renderSuggestionRow(parent, s: Suggestion, goal)`：展示 `s.text`；若 `s.dimension` 显示维度标签；「应用」按钮 → `onApply(goal, s)`（单条结构化）。

### F4 新增 `src/ai/SuggestionApplyModal.ts`（聚焦预览 + 人工闸门）
- 入参 `{ suggestions: Suggestion[]; before: GoalItem[]; after: GoalItem[]; onConfirm: (g)=>void; onEscalateAI?: (g)=>void }`。
- 渲染：标题「应用诊断建议」；每条建议一行「命中：目标<goalTitle> / 子项<target> / 动作<action 中文>」+ `s.text`；对 `adjust_dailyMin` 额外显示「dailyMin 旧值 → 新值」（从 before/after 取）。
- 按钮：「确认写入」→ `onConfirm(after)`；「用 AI 调整」（可选，onEscalateAI 提供时显示）→ `onEscalateAI(after)` 打开 `AgenticPlanModal` 编辑模式继续精修；「取消」→ close。

### F5 `src/ai/runDiagnosis.ts`（编排接线）
- `DiagnosisDeps` 新增 `openApplyPreview: (opts) => void`。
- `openDiagnosis` opts 的 `onApply` 改为 `(goal, suggestion) => void`，新增 `onApplyAll?: (goal) => void`。
- `onApply(goal, s)`：`const res = applySuggestion(s, goals);` 若 `!res.applied` → `notice('该建议未匹配到目标/子项，未改动')`；否则 `openApplyPreview({suggestions:[s], before:goals, after:res.goals, onConfirm: writeGoals, onEscalateAI: (f)=>openAgentic({goals:f, scope:'note', settings, onConfirm:writeGoals})})`。
- `onApplyAll(goal)`：`applySuggestions(goal.suggestions, goals)` → 同上预览（多条）。

### F6 `main.ts`
- `aiDiagnose` 的 `runDiagnosis` deps 增加 `openApplyPreview: (o) => new SuggestionApplyModal(this.app, o).open()`。
- 复用现有 `writeDiagnosedGoals` 作为 `onConfirm`。

---

## 测试（TDD，每文件先红后绿）

- **`src/ai/__tests__/suggestion.test.ts`（新增）**
  - adjust_dailyMin：仅命中子项 dailyMin 变更、其他子项不变；按名 / 按 index 命中；负/非数 dailyMin → applied=false、原树不动。
  - remove_subitem：按名移除；未命中 → 不动。
  - add_subitem：追加 + 同名去重；缺 name → 不动。
  - note → 不动。
  - applySuggestions：折叠应用多条；中间一条非法不影响其余。
  - 不可变性：入参 goals 不被 mutate（深比较）。
- **`goalDiagnoser.test.ts`（扩展）**：对象 suggestions → 解析为 Suggestion（action/goalRef/target/params）；字符串 → note 包裹；非法 action → 默认 note。
- **`DeviationCalculator` 证据测试（扩展）**：`formatItemEvidenceForPrompt` 含 `goalId` 与子项 `[index]`。
- **`diagnosisModal.test.ts`（扩展）**：渲染结构化建议；「应用」传递**该条** suggestion（spy 断言 `onApply(goal, s)`）；有 `onApplyAll` 时显示「应用全部」并调用它。
- **`runDiagnosis.test.ts`（扩展）**：`onApply` 单条 → `applySuggestion` 应用 → `openApplyPreview` 收到 before/after；未命中 → `notice` 且不打开预览；`onApplyAll` 应用全部。

## YAGNI（本计划明确不做）
- ❌ 不改 `AgenticPlanModal` 的 diff 高亮（聚焦预览由 SuggestionApplyModal 承担）。
- ❌ 不做 `pause_goal`/`resume_goal`（需新增数据字段 + webapp 适配，独立议题）。
- ❌ 不改 webapp `requestAiImprove`（那是独立"改进"入口，结构化可后续复用本 `Suggestion` 类型）。
- ❌ 不做 MVP-2 一键批量跨 goal（本计划已是逐条人审 + 单 goal 内"应用全部"）。

## 验证闸门
```
npx vitest run                                   # host 单测全绿（含新增/扩展）
npx tsc --noEmit                                # 类型 0 error
npx eslint src/ai/Suggestion.ts src/ai/GoalDiagnoser.ts src/ai/DiagnosisModal.ts src/ai/SuggestionApplyModal.ts src/ai/runDiagnosis.ts main.ts   # 0 error
bash sync.sh                                      # 构建 + 同步 vault
```
