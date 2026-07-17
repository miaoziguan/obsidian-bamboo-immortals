# 设计文档：AI 诊断 → 行动闭环（MVP-1）

- 日期：2026-07-16
- 状态：设计已批准（用户确认「搞」）
- 关联：`2026-07-16-agentic-planning-design.md`（Agentic 规划能力已落地）、`2026-07-16-roadmap-choose.md`（③/⑤ 选型讨论）

---

## 1. 背景与问题

现有「竹林修仙传」飞轮存在**两半割裂**：

- **战略复盘（已有，webapp 侧）**：`webapp/.../goals/healthScore.js` 的 `GoalHealthScore` 本地算三层健康分（L1 执行力 45% / L2 动力指数 30% / L3 可持续度 25%）+ 规则化 hint。**只「发现」问题，不归因、不行动**，且为纯本地算法（无 AI 调用，见 `renderer.js` 的 `openHealthScoreDetail`）。
- **Agentic 规划（已做，插件侧）**：`PlanningSession` + `AgenticPlanModal` 从笔记自然语言「规划」目标树，**只「向前规划」**，不回头看执行数据。

中间缺一块：**诊断 → 行动**。诊断产出的建议目前没有任何落点，人得手动再去改 `dailyMin`、加子项。本方案用一根轻量桥接把两者串起来——**诊断建议一键喂给已验证的 Agentic 编辑链路**，形成闭环。

> 经讨论确认：③「孤立 AI 诊断」降级为冗余（本地诊断已覆盖「发现」），⑤「流式 SSE」是体验优化且背 CORS 暗礁，均后置。本方案才是当前最高杠杆的一步。

---

## 2. 方案概述（路径 A：建议 → Agentic 指令流）

**不做**结构化直改（路径 B，协议重、跨 webapp/插件数据边界风险高）。把诊断建议作为自然语言指令直接 `PlanningSession.send()` 给已加载「真实目标树」的 `AgenticPlanModal`，**完全复用其已验证的「AI 改树 → 树状 diff 审阅 → 写入目标」全链路**。

```
命令 ai-diagnose
   │  读 goals.json + 最近 N 天 data/*.json
   ▼
DeviationCalculator（新·纯函数）
   │  基于 goalTaskCompletions / goalProgress 推算每目标偏差率、停滞标记、趋势
   ▼
GoalDiagnoser（新·纯逻辑）
   │  buildDiagnosisMessages(硬指标 + 14天趋势)
   │  diagnose()：复用 extractChatText + requestUrl 绕 CORS 调 AI
   │  parseDiagnosis()：结构化 JSON（坏 JSON → 纯文本回退）
   ▼
DiagnosisModal（新·只读报告）
   │  展示 红黄绿状态 + 每条建议带「应用」按钮
   ▼ （用户点「应用」）
AgenticPlanModal（改造：支持从现树加载 + 预填指令）
   │  session.loadGoals(真实树) → session.send(建议指令)
   │  树状 diff 实时刷新，用户审阅
   ▼
用户点「写入目标」→ onConfirm → putGoals 落库（完全复用现有）
   │  webapp.notifyGoalsChanged() 刷新常驻视图
```

---

## 3. 复用的真实接口（已逐行核实）

| 用途 | 接口 | 出处 |
|---|---|---|
| 读目标树 | `VaultStorage.getGoals(): Promise<GoalItem[]>` | `src/storage/VaultStorage.ts:222` |
| 读单日 | `getDay(dateKey): Promise<DayData \| null>` | `VaultStorage.ts:85` |
| 近日键（降序） | `getDayKeys(): Promise<string[]>` | `VaultStorage.ts:123` |
| 落库目标 | `putGoals(goals): Promise<void>`（含空数组守卫） | `VaultStorage.ts:231` |
| 落盘报告 | `writeMarkdownReview(dateKey, md): Promise<void>` → `reviews/` | `VaultStorage.ts:469` |
| 抽文本 | `extractChatText(resp): string` | `MarkdownPlanner.ts:236` |
| AI 调用范式 | `requestUrl` + `chat/completions` + `response_format:{type:'json_object'}` | `PlanningSession.call()` `PlanningSession.ts:129` |
| 解析校验 | `parseGoals(obj)`、`validateGoals(raw)` | `MarkdownPlanner.ts` / `GoalCardValidator.ts` |
| 会话 | `PlanningSession`（`init/send/applyLocalEdit/reset/getMessages/goals`） | `PlanningSession.ts` |
| 审阅台 | `AgenticPlanModal(app, opts)`（`opts.onConfirm(goals)`） | `AgenticPlanModal.ts` |
| 设置 | `PlannerSettings = { aiApiKey, aiBaseUrl, aiModel, aiDecomposeDepth }`；门禁 `settings.aiEnabled` | `MarkdownPlanner.ts:39` / `main.ts:151` |

**关键数据信号（插件侧可直读）**：`getDay()` 返回完整 `DayData`，其索引签名 `[key:string]: unknown`（`data.ts:93`）包含 webapp 写入的 `goalTaskCompletions[goalId]{active, completions}` 与 `goalProgress[goalId]`。这正是 `GoalHealthScore._buildDataCache`（`healthScore.js:177`）使用的真信号——插件侧 `DeviationCalculator` 可镜像计算真实偏差，无需跨 webapp 边界。

---

## 4. 需改造 / 新增（明确范围）

### 4.1 新增 `src/ai/DeviationCalculator.ts`（纯函数）
- `buildCache(goals, days, windowDays=60)`：镜像 `GoalHealthScore._buildDataCache`，输出 `{ byDateKey, goalIds }`。
- `computeGoalDeviation(goal, cache)`：返回 `{ expectedProgress, actualProgress, deviationRate, status, stagnation, recentActivity }`。
  - `expectedProgress`：仿 `_scoreOnTime`，按 `startDate→endDate` 工作日历比例推算（缺日期则给保守默认）。
  - `actualProgress`：优先 `goal.progress`，否则由 `goalProgress` 近期值推算。
  - `deviationRate = (actual - expected) / expected`（clamp -1~1）。
  - `status`：`on_track | behind | stuck | done | at_risk`（阈值与 `_scoreOnTime` hints 对齐）。
  - `stagnation`：最近 `STAGNATION_WINDOW` 天内 `goalTaskCompletions` 无任何 active → true。
- `summarize(goals, cache)`: 产出给 `GoalDiagnoser` 的紧凑指标文本（每目标一行：标题/状态/偏差率/停滞/近7天活动趋势）。

### 4.2 新增 `src/ai/GoalDiagnoser.ts`（纯逻辑）
- `buildDiagnosisMessages(summary: string): ChatMessage[]`：
  - system：要求「只输出 JSON；status 取枚举 on_track|behind|stuck|done|at_risk；suggestions 为可操作自然语言指令（可直接交给另一个 AI 改目标树，如『将子项「每天跑步」的 dailyMin 从 30 降到 15』）」。
  - user：注入 `DeviationCalculator.summarize` 文本 + 近 14 天 `completedTasks/emptySlots` 趋势。
- `parseDiagnosis(text: string): Diagnosis`：
  - 合法 JSON → 校验 `status` 枚举、补全缺失字段（`summary`、`goals[]`、`nextActions[]`）。
  - 坏 JSON / 非对象 → 返回 `{ rawText: text }`，由 Modal 显示纯文本、不崩。
- `async diagnose(goals, days, settings, fetchFn?): Promise<Diagnosis>`：编排 `buildCache → summarize → buildDiagnosisMessages → fetchFn(chat/completions) → extractChatText → parseDiagnosis`（复用 `PlanningSession.call()` 的请求形态）。

### 4.3 改造 `PlanningSession`（小）
新增 `loadGoals(goals: GoalItem[])`：
```ts
private mode: 'note' | 'edit' = 'note';
private editSystemContent = '';

loadGoals(goals: GoalItem[]): void {
  this.goals = JSON.parse(JSON.stringify(goals));
  this.initialGoals = JSON.parse(JSON.stringify(goals));
  this.mode = 'edit';
  this.editSystemContent =
    '你是目标卡片编辑器。用户已有一个目标树（如下 JSON）：\n' +
    JSON.stringify(goals, null, 2) +
    '\n用户会用自然语言提出「增/删/改」指令，你每次回复都必须返回【当前完整的最新 goals JSON 全量】，保持量化铁律（纯数字 dailyMin、日颗粒度、可数代理指标）。只输出 JSON，不要 markdown 围栏。';
  this.messages = [{ role: 'system', content: this.editSystemContent + AGENT_SUFFIX }];
}
```
`reset()` 改为按 `mode` 分支：`edit` 模式回到 `clone(initialGoals)` + 重建 edit system；`note` 模式保持原 `buildPrompt` 行为。单测覆盖 `loadGoals` 后 `reset()` 还原真实首版。

### 4.4 改造 `AgenticPlanModal`（小）
`AgenticPlanOptions` 增加可选字段：
- `goals?: GoalItem[]` —— 提供时 `initPlan()` 走 `session.loadGoals(goals)` 而非 `session.init()`。
- `initialInstruction?: string` —— 载入后自动 `session.send(initialInstruction)` 并 `rebuildTree(true)`（供「应用建议」预填，失败提示「⚠ 应用建议失败，请手动调整」）。
`initPlan()` 增加 `if (this.opts.goals)` 分支，`init()` 原流程保持。

### 4.5 新增 `src/ai/DiagnosisModal.ts`（UI）
- 只读报告 Modal：顶部 `summary`，每目标卡片含**红黄绿状态徽标**（按 `status`）+ AI 诊断文案 + `suggestions[]` 每条一个「应用」按钮。
- 点「应用」→ `close()` 自身 → 打开 `AgenticPlanModal({ goals: 真实树, initialInstruction: 该目标 suggestions 拼接成一段指令, settings, onConfirm })`。
- 样式复用 `.bamboo-ai-chat-*` / `.bamboo-ai-plan-*`。

### 4.6 新增命令 `ai-diagnose`（`main.ts` 注册）
编排：`settings.aiEnabled` 门禁 → `getGoals()`（空则 `Notice('你还没有目标，先跑一次 AI 规划')`）→ `getDayKeys()` 取最近 14 天 → `getDay()` 批量 → `GoalDiagnoser.diagnose(...)` → 打开 `DiagnosisModal`。`onConfirm` 复用 `writeAiGoals` 的落库+`notifyGoalsChanged` 逻辑（不新写）。

---

## 5. 诊断 JSON Schema
```jsonc
{
  "summary": "3 个目标中 1 个达标、2 个落后",
  "goals": [{
    "title": "健康减重",
    "completion": 62,            // 0-100，相对时间线
    "status": "behind",          // on_track|behind|stuck|done|at_risk
    "bottleneck": "跑步子项连续 9 天 0 打卡，dailyMin=30 偏激进",
    "suggestions": [             // 每条一句可操作指令，可直接 send
      "将子项「每天跑步」的 dailyMin 从 30 降到 15",
      "新增子项「每周游泳 3 次」替代部分跑步"
    ]
  }],
  "nextActions": ["将两个落后目标的 dailyMin 整体下调约 20%"]
}
```
> 坏 JSON 时 `parseDiagnosis` 返回 `{ rawText }`，`DiagnosisModal` 显示纯文本，不崩。

---

## 6. 容错与边界

| 情况 | 处理 |
|---|---|
| 无目标 | 不调 AI，`Notice('你还没有目标，先跑一次 AI 规划')` |
| 子项缺 `startDate`/`dailyMin` | 不生成理论值，`summary` 标注「按累计估算」，AI 仅定性判断 |
| AI 返回乱码/非 JSON | `parseDiagnosis` 回退 `{rawText}`，Modal 显示纯文本 |
| `send(建议)` 失败 | `PlanningSession.send` 已回滚本轮 messages、工作副本不变，Modal 提示「应用失败，请手动调整」 |
| 用户拒绝某条建议 | 仅未点「应用」的不送；已审阅的仍可在弹窗手动改 |

---

## 7. 风险与缓解
- **Agentic「从现树加载」语义漂移**：`loadGoals` 深拷贝并重置 messages，避免污染首版快照（`reset` 仍回真首版）。→ 单测覆盖。
- **建议指令被 AI 误执行**：`validateGoals` 兜底 + 树状 diff 审阅，**人工确认是最后闸门**。MVP-1 每条建议都过人审。
- **CORS**：全程复用 `requestUrl`（插件原生层），零新增网络风险（对比 ⑤ 的 `fetch` 流式）。

---

## 8. YAGNI（本方案明确不做）
- ❌ **不做 ⑤ raw SSE 逐字流式**（CORS 暗礁 + 伪需求：诊断是单次 JSON 调用，逐字吐的是 JSON 残片，用户无法阅读；结构化报告也无法渲染半成品）。详见 `2026-07-17-diagnosis-phased-progress.md`——以**分阶段进度指示**替代，轻量、零新协议、零 CORS 风险。
- ❌ 不做路径 B 结构化直改（协议重、跨 webapp/插件数据边界）
- ❌ 不跨 webapp 边界集成（先在插件侧闭环跑通，入口为命令；后续再接战略复盘面板）
- ✅ **MVP-2 一键批量已交付**（见 `2026-07-17-mvp2-batch-apply.md`）：原 §8「不做 MVP-2」已推翻。

---

## 9. 测试策略（TDD，每任务红→绿→commit）
详见同目录 `2026-07-16-diagnosis-action-loop.md`。纯函数（DeviationCalculator / parseDiagnosis / buildDiagnosisMessages）先行，UI/命令后行，全部可注入 `fetchFn` 单测。
