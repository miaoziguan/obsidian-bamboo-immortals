# 路线分叉：③ AI 闭环复盘诊断 vs ⑤ 流式 SSE + function-calling

> 日期：2026-07-16 ｜ 前置：对话式规划代理（AgenticPlanModal + PlanningSession）已落地
> 目标：在两条候选路线间定方向。**本文只给方案与可行性，不落地代码**（superpowers 硬门槛：设计未批准不动手）。

## 已确认的约束（来自代码库实测）

| 项 | 现状 | 影响 |
|---|---|---|
| AI 后端 | `aiBaseUrl` 默认 `https://api.deepseek.com/v1`，`aiModel` 默认 `deepseek-chat`，OpenAI 兼容 | 支持 `tools`（function-calling） |
| 网络层 | `AiFetchFn` = Obsidian `requestUrl` 封装，返回完整 `AiResponse`（status/json/text） | **`requestUrl` 不支持流式/SSE**；改用原生 `fetch` 有 CORS 风险 |
| 目标数据 | `GoalItem`：`progress` / `startDate` / `endDate` / `items[].{currentValue,targetValue,dailyMin,taskDayType}` | ③ 可直接算出完成度、卡点 |
| 打卡数据 | `data/YYYY-MM-DD.json`：`DayData` 含 `metrics.{completedTasks,...}`、`timeline[]`、`goals[]` | ③ 可喂最近 N 天 |
| 复盘落盘 | `VaultStorage.writeMarkdownReview(dateKey, md)` 已能写 `reviews/YYYY-MM-DD.md` | ③ 可复用，零新增存储逻辑 |
| AI 对话协议 | PlanningSession 用「全量 JSON + reply」协议，坏 JSON 回滚 | ⑤ 若要改协议会冲击刚落地的 Agentic |

---

## 方案 ③：AI 闭环复盘诊断（推荐先做）

### 目标
新增命令「AI 诊断我的目标」，读取当前全部 `GoalItem` + 最近 N 天 `DayData`，让 AI 产出结构化诊断报告：
- 每个目标的**完成度评估**（对比 `currentValue/targetValue` 与 `dailyMin×已过天数`）
- **卡点识别**（某子项持续 0 打卡 / 进度远低于时间线）
- **下一步建议**（调 `dailyMin` / 拆新子项 / 暂停目标）

### 可行性：高 ✅
纯复用现有 AI 链路（`AiFetchFn` / `extractChatText` / `buildPrompt` 模式），**不依赖任何后端新能力**，无 CORS 风险。

### 改动面（小、局部）
| 文件 | 改动 |
|---|---|
| `src/ai/GoalDiagnoser.ts` | **新增**：纯逻辑 `diagnose(goals, recentDays) → DiagnosisReport`；`buildDiagnosisPrompt` + `parseDiagnosis`（坏 JSON 回退到文本摘要，复用容错思路） |
| `src/ai/__tests__/goalDiagnoser.test.ts` | **新增**：TDD——prompt 含目标/打卡、坏 JSON 不崩、解析字段映射 |
| `src/ai/DiagnosisModal.ts`（或复用 AgenticPlanModal 的聊天样式做只读报告） | **新增**：展示 markdown 报告 + 「写入 reviews/诊断-YYYY-MM-DD.md」按钮 |
| `main.ts` | 注册命令 `ai-diagnose-goals` |
| `styles.css` | 复用 `.bamboo-ai-chat-*` 气泡样式，几乎零新增 |

### 收益 / 风险
- 收益：把"规划→执行→复盘"闭环补上最后一块；可见、可演示、复用一切现有能力。
- 风险：低。唯一变量是 prompt 质量，可迭代。

---

## 方案 ⑤：流式 SSE + function-calling

### 目标
把 AI 调用从「一次性返回全量 JSON」升级为：
- **流式输出**：token 逐字显示（对话气泡逐字生长），体验更顺。
- **function-calling**：定义 `updateGoal` / `addSubItem` / `removeSubItem` 等工具，让模型用工具调用改目标，替代「每轮返回全量 JSON」协议。

### 可行性：中低 ⚠️（有真实技术风险）
1. **SSE**：`requestUrl` 不支持流式。必须换原生 `fetch` + `ReadableStream` 解析 `data:` 帧。但 Obsidian 里原生 `fetch` 受 CORS 限制——DeepSeek 等自建/第三方端点若不返回 `Access-Control-Allow-Origin`，调用会直接失败，**破坏现有能绕过 CORS 的 `requestUrl` 方案**。需保留 `requestUrl` 作为非流式回退，复杂度上升。
2. **function-calling**：DeepSeek 支持 `tools`，但模型对工具调用的稳定性弱于「直接输出 JSON」，且与刚落地的 PlanningSession 全量 JSON 协议冲突——要么重写 Session，要么双协议并存，易滋生 bug。
3. **收益间接**：当前 Agentic MVP 已能用（整段 JSON 一次性返回，毫秒级），流式主要是"体感"提升，不是功能缺口。

### 改动面（大、核心链路）
| 文件 | 改动 |
|---|---|
| `src/ai/streamingFetch.ts` | **新增**：原生 `fetch` SSE 解析 + `requestUrl` 回退 |
| `src/ai/PlanningSession.ts` | **改写**：`send` 返回 `AsyncIterable<string>` 流；协议从全量 JSON 迁到 tool-calls |
| `src/ai/AgenticPlanModal.ts` | **改写**：气泡逐字渲染、工具调用结果应用 |
| `MarkdownPlanner.ts` | 可能增加 `tools` 定义与解析分支 |
| 测试 | 流式解析、工具调用解析需补，且要 mock `fetch` 的 ReadableStream |

### 收益 / 风险
- 收益：对话更"活"、编辑可能更精准（工具调用）。
- 风险：高。CORS 回退、协议迁移冲击刚落地的 Agentic、模型工具调用不稳定。

---

## 推荐

**先做 ③，⑤ 后置。**

- ③ 是"闭环最后一块拼图"，收益确定、风险近乎为零、复用一切现有能力，且能与刚做的 Agentic 规划形成「规划→执行→诊断→再规划」完整飞轮。
- ⑤ 是"体验增强"，当前 Agentic MVP 已可用，SSE 又有 CORS 硬伤；等用户真实抱怨"等得久/想看过程"再上，且届时优先只做 SSE（不动 function-calling 协议），把风险压到最低。

## 下一步
你定方向后，我按 superpowers 流程：写该方案的详细实现计划（任务级 TDD）→ 逐任务 subagent 落地 → 评审 → 收尾。
