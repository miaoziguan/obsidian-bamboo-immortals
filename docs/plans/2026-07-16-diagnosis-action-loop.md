# 实现计划：AI 诊断 → 行动闭环（MVP-1）

- 设计文档：`2026-07-16-diagnosis-action-loop-design.md`（已批准、已 commit）
- 执行策略：**TDD**，每任务 写失败测试 → 看红 → 实现 → 看绿 → commit
- 测试基底：`vitest run`（host 侧，见 `src/ai/__tests__/`）
- 全程可注入 `fetchFn`（`AiFetchFn`）做单测，零真实网络

---

## T1 · 偏差计算 `DeviationCalculator`（纯函数）

**新增** `src/ai/DeviationCalculator.ts` + `src/ai/__tests__/deviationCalculator.test.ts`

红（测试）：
- `buildCache`：给定 goalId=`g1`，3 天 `goalTaskCompletions.g1={active:true,completions:2}`，返回 `byDateKey` 含 3 天、goalIds=['g1']。
- `computeGoalDeviation`：goal `startDate=2026-01-01,endDate=2026-01-11`（10 工作日），`progress=5`，今日=第 11 天 → `expectedProgress≈100`、`actualProgress=5`、`deviationRate≈-0.95`、`status='behind'`。
- `stagnation`：goal `g2` 在 `STAGNATION_WINDOW` 天内 `goalTaskCompletions` 全空 → `stagnation=true`。
- 缺 `startDate`/`endDate`：不抛错，`expectedProgress` 给保守默认（如 50），`status` 不取 `behind`。

绿（实现）：
- `buildCache(goals, days, windowDays=60)`：镜像 `healthScore.js:177` 的 `_buildDataCache`，读 `day.goalTaskCompletions[gid]` / `day.goalProgress[gid]`（经索引签名 `unknown` 强转）。
- `computeGoalDeviation(goal, cache, today?)`：工作日历比例算 `expectedProgress`（仿 `_scoreOnTime`）；`actualProgress` 优先 `goal.progress` 否则近期 `goalProgress` 均值；`deviationRate` clamp(-1,1)；`status` 枚举；`stagnation` 回溯窗口无 active。
- `summarize(goals, cache)`：每目标一行文本（标题/状态/偏差率/停滞/近7天活动趋势），供诊断 prompt。

commit：`test: deviation calculator (DeviationCalculator)`

---

## T2 · 诊断解析 `GoalDiagnoser.parseDiagnosis`（纯逻辑）

**新增** `src/ai/__tests__/goalDiagnoser.test.ts`（先写 parse 部分）

红：
- 合法 JSON → 返回 `Diagnosis`，校验 `status` 仅取枚举（非法值回退 `behind`）、补全缺省 `summary=''`、`goals=[]`、`nextActions=[]`。
- 坏 JSON（`'{不是json'`）→ 返回 `{ rawText }` 形态（即 `parsed.ok===false` 或含 `rawText`），不抛错。
- 非对象文本（纯中文建议）→ 回退 `rawText`。

绿：新增 `src/ai/GoalDiagnoser.ts`，实现 `parseDiagnosis(text): Diagnosis` + `Diagnosis` / `GoalDiagnosis` 类型。复用容错范式（参考 `PlanningSession.callParse`）。

commit：`test: diagnosis parser with fallback`

---

## T3 · 诊断 prompt 构造 `GoalDiagnoser.buildDiagnosisMessages`

红（同文件测试扩展）：
- system 含「只输出 JSON」「status 枚举 on_track|behind|stuck|done|at_risk」「suggestions 为可操作自然语言指令（可直接交给另一个 AI 改目标树）」。
- user 含 `DeviationCalculator.summarize` 注入的偏差率文本 + 近 14 天 `completedTasks`/`emptySlots` 趋势（mock days 提供）。

绿：实现 `buildDiagnosisMessages(summary): ChatMessage[]`（复用 `PlanningSession` 的 `ChatMessage` 类型）。另实现 `diagnose(goals, days, settings, fetchFn?)` 编排：`buildCache→summarize→buildDiagnosisMessages→fetchFn(chat/completions，请求形态同 PlanningSession.call)→extractChatText→parseDiagnosis`。

commit：`test: diagnosis prompt + diagnose orchestration`

---

## T4 · `PlanningSession.loadGoals`（改造）

**改** `src/ai/PlanningSession.ts` + 扩展 `src/ai/__tests__/planningSession.test.ts`

红：
- `loadGoals(g)` 后 `session.goals` 与 `session.initialGoals` 均为 `g` 的深拷贝（改工作副本不影响传入原对象）。
- `loadGoals(g)` 后 `getMessages()` 首条为「现有树」system 上下文（含 `JSON.stringify(g)`），而非笔记拆解。
- `loadGoals(g)` 后调用 `reset()` → `goals`/`initialGoals` 仍回传入快照（未被污染）；`getMessages()` 仍为首版 edit system。
- `note` 模式 `reset()` 行为不变（回归原 `buildPrompt`）。

绿：
- 新增 `private mode:'note'|'edit'='note'`、`private editSystemContent=''`。
- `loadGoals(goals)`：深拷贝、`mode='edit'`、构造 `editSystemContent`（含 JSON + 量化铁律）、`messages=[{system: editSystemContent+AGENT_SUFFIX}]`。
- `reset()` 按 `mode` 分支。

commit：`feat: PlanningSession.loadGoals (edit mode)`

---

## T5 · `AgenticPlanModal` 支持从现树加载（改造）

**改** `src/ai/AgenticPlanModal.ts` + 扩展测试（或新建 `agenticPlanModal.test.ts`，用 `doc`/`Modal` mock 或纯逻辑断言 `initPlan` 分支——host 测试已有 Modal 用例可参考）

红：
- `opts.goals` 提供时 `initPlan()` 走 `session.loadGoals(opts.goals)` 而非 `session.init()`；不触发 AI 首轮拆解。
- `opts.initialInstruction` 存在时：载入后自动 `session.send(instruction)` 并 `rebuildTree(true)`；`send` 失败不崩（捕获，留提示）。
- `opts.goals` 缺省时保持原 `init()` 行为（回归）。

绿：
- `AgenticPlanOptions` 增加 `goals?`、`initialInstruction?`。
- 构造函数保持；`initPlan()` 增加 `if (this.opts.goals)` 分支：调 `loadGoals`→设 `chatLog` 提示→`rebuildTree(false)`→（若有 `initialInstruction`）`send`+`rebuildTree(true)`。

commit：`feat: AgenticPlanModal accept existing goals + initial instruction`

---

## T6 · `DiagnosisModal`（UI，新增）

**新增** `src/ai/DiagnosisModal.ts` + 测试（DOM 断言，参考既有 Modal 测试手法；可注入 `onApply(goalDiagnosis)` 回调做单测）

红（DOM 断言）：
- 渲染 `summary` + 每目标卡片含**红黄绿状态徽标**（按 `status`）。
- 每目标 `suggestions[]` 各渲染一个「应用」按钮。
- 点「应用」→ 触发 `onApply(goalDiagnosis)`，父级据此关闭并打开 `AgenticPlanModal({goals, initialInstruction: suggestions 拼接})`。
- `rawText` 回退形态：显示纯文本、无崩溃。

绿：实现 `DiagnosisModal extends Modal`，样式复用 `.bamboo-ai-chat-*` / `.bamboo-ai-plan-*`。

commit：`feat: DiagnosisModal (read-only AI diagnosis report)`

---

## T7 · 命令 `ai-diagnose`（编排）

**改** `main.ts` + 扩展/新增 `main.test.ts`（mock `VaultStorage`/`GoalDiagnoser`，断言编排）

红（集成断言，mock fetchFn）：
- `settings.aiEnabled=false` → `Notice` 且不调诊断。
- 无目标（`getGoals()=[]`）→ `Notice('你还没有目标，先跑一次 AI 规划')`，不开 Modal。
- 有目标 → 产出 `DiagnosisModal` 且内部数据来自 `GoalDiagnoser.diagnose` 结果（mock 返回固定 Diagnosis 断言被渲染）。

绿：
- `main.ts` 注册 `addCommand({id:'ai-diagnose', name:'AI 诊断：分析目标执行并给出可应用建议', callback})`。
- 编排：`aiEnabled` 门禁 → `getGoals()`（空则 Notice）→ `getDayKeys()` 取最近 14 天 → `getDay()` 批量 → `GoalDiagnoser.diagnose(...)` → 打开 `DiagnosisModal`，`onApply` → 打开 `AgenticPlanModal({goals, initialInstruction, onConfirm: 复用 writeAiGoals 落库+notifyGoalsChanged})`。

commit：`feat: ai-diagnose command (diagnosis → action loop)`

---

## T8 · 文档 + 收尾

- 更新 `docs/ARCHITECTURE.md` 飞轮图：补「诊断→行动闭环」节点（战略复盘/AI 诊断 → Agentic 编辑 → 落库）。
- 全量测试：`npm run lint`（仅存量 warning 通过）、`npm test`（host 124 + webapp 212 全绿）。
- 确认未引入 CORS 新依赖（全程 `requestUrl`）。

commit：`docs: diagnosis-action-loop wiring + architecture update`

---

## 完成判据
- [ ] T1–T8 全绿，每个任务独立 commit
- [ ] `npm test`（host + webapp）全过
- [ ] `ai-diagnose` 命令可从空目标 → 有目标 → 诊断 → 应用建议 → 写入目标 全链路手动可走通
- [ ] 无新增 CORS / 网络风险
