# 对话式规划代理（Agentic Planning）实现计划

> 日期：2026-07-16 ｜ 关联：Phase 1-3 已落地的 One-shot 目标拆解
> 目标：把"一次性出 JSON → 手动删改"升级为"AI 出初版 → 自然语言对话打磨 → 列表实时刷新 → 确认写入"。

## 设计要点（已与用户对齐）

1. **全量 JSON 协议**：AI 每轮返回完整 `goals` 数组（外加可选 `reply` 一句话说明改动），前端做新旧对比高亮。不设计增量 diff 协议——模型犯错成本最低，且复用现有 `parseGoals`。
2. **单一数据源**：`session.goals` 是工作副本（source of truth）。手动编辑直接 mutate `session.goals`，并调用 `applyLocalEdit(note)` 把改动写进对话历史，防止 AI 下轮把改动覆盖回去。
3. **容错优先**：坏 JSON → `messages.pop()` 回滚本轮、气泡提示"没听懂"、**绝不破坏当前工作副本**。这比首版 one-shot 更关键。

## 文件级改动

| 文件 | 改动 |
|---|---|
| `src/ai/MarkdownPlanner.ts` | 抽取 `extractChatText(resp)`（OpenAI wrapper + 纯文本兼容），`planFromNote` 复用；导出供 Session 用 |
| `src/ai/PlanningSession.ts` | **新增**：纯逻辑会话对象，`init/send/applyLocalEdit/reset` + 对话历史维护 |
| `src/ai/GoalCardValidator.ts` | 迁入 `extractUnit`（从 PlanConfirmModal 复用，避免重复） |
| `src/ai/AgenticPlanModal.ts` | **新增**：左侧可编辑目标树 + 右侧对话区 + diff 高亮 + 重置初版 |
| `src/main.ts` | `aiPlanFromNote` / `aiPlanFromSelection` 改为建 `AgenticPlanModal`（内部持有 Session 并 init） |
| `styles.css` | 对话面板相关样式 |
| `src/ai/__tests__/planningSession.test.ts` | **新增**：TDD 纯逻辑单测 |

## PlanningSession 职责（零 Obsidian 依赖，可注入 fetchFn）

- `constructor(content, settings, fetchFn?)`：用 `buildPrompt` 生成 system+user，追加"对话式规划"指令（要求返回 `reply` + 全量 `goals`）。
- `init(): Promise<GoalItem[]>`：首轮，保存 `initialGoals` 供 reset。
- `send(text): Promise<{reply:string; goals:GoalItem[]}>`：push user → 调 LLM → 全量替换 `goals`；坏 JSON 回滚并抛错。
- `applyLocalEdit(note)`：push system note（AI 上下文）。
- `reset()`：回到 `initialGoals` + 清空对话。

## 测试（TDD，vitest）

- 首轮 init 返回 goals；
- 发送"去掉跑步"后 `goals` 不含跑步；
- 坏 JSON 时 `send` 抛错且 `goals` 不变（容错核心）；
- `applyLocalEdit` 后下一次请求体包含该 system note；
- reset 回到初版。

## 验证

```
npx vitest run src/ai/__tests__/planningSession.test.ts
npx tsc --noEmit
```
