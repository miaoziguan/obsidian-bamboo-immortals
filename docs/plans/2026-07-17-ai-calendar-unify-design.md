# 2026-07-17 AI 规划模块治理：统一工作日口径 + 清理孤儿模块 + 提示词锁定

> 本文档是 2026-07-16 复盘结论的落地计划（superpowers 流程 Phase 2）。
> 范围已与用户确认：#1 统一工作日口径、#2 删孤儿模块、#3 仅做状态机注释 + prompt 快照测试。
> 流式 SSE（原 #5）经用户判定为伪需求，明确不排期。

## 背景与根因

诊断报告里「预期进度%」（来自 `DeviationCalculator`）与健康分「按时分」（来自 `healthScore`）曾用两套日历基准：

- `DeviationCalculator.countWorkdays`（原 105-117 行）：只排周末、**不排法定节假日**；
- `healthScore.countWorkdays`（原 209 行）：排周末 + 法定节假日。

同一个目标，用户可能同时看到「健康分说进度达标」与「偏差率显示落后 10%」——两套基准互相打架，侵蚀报告可信度。

## 设计决策

抽出一个**唯一事实来源** `src/ai/workdayCalendar.ts`（零 Obsidian 依赖、可单测），`healthScore` 与 `DeviationCalculator` 都从它 import 同一份 `getHolidays` / `countWorkdays` / `workdaysBetween` / `isWorkday` / `buildHolidays`。

- 不产生循环依赖：`healthScore` 对 `DeviationCalculator` 只是 `import type`，新模块不依赖二者。
- `healthScore` 原导出的 `buildHolidays` 经 `export { buildHolidays } from './workdayCalendar'` 保留，避免改 `healthScore.test.ts`。

## 任务拆解（每个任务 2~5 分钟，TDD：先写失败测试再实现）

### Task 1 — 新建 `workdayCalendar.ts` + 测试
- 写 `src/ai/__tests__/workdayCalendar.test.ts`：
  - 含节假日端点（如 2026-01-01 周四且为元旦）计数为 0；
  - 春节整段（2026-02-16~02-20 全在 holidays 集合）计数为 0；
  - 普通周末被正确排除、节假日正确排除；
  - `getHolidays` 按年缓存（同 year 返回同一引用）。
- 实现 `src/ai/workdayCalendar.ts`：`fmt` / `buildHolidays` / `getHolidays`（带缓存）/ `isWorkday` / `countWorkdays` / `workdaysBetween`。
- 验证该测试由红转绿。

### Task 2 — 重构 `healthScore.ts`
- 删除本地 `fmt`/`buildHolidays`/`_getHolidays`/`isWorkday`/`countWorkdays`/`workdaysBetween`（167-226 行）。
- 顶部改为 `import { getHolidays, isWorkday, fmt, countWorkdays, workdaysBetween } from './workdayCalendar';` 并 `export { buildHolidays } from './workdayCalendar';`。
- 第 673 行 `_getHolidays(t.getFullYear())` → `getHolidays(t.getFullYear())`。
- 运行 `healthScore.test.ts` 保持全绿。

### Task 3 — 重构 `DeviationCalculator.ts`（带节假日口径）
- 先写失败测试：在 `deviationCalculator.test.ts` 增「节假日降低预期进度」用例——目标跨 2026 春节（start 2026-02-10 / end 2026-03-01 / today 2026-02-18），`expectedProgress` 应为节假日感知值（约 44），而非无节假日口径的 50。当前（未改）代码会因不含节假日而给出 50 → 测试先红。
- 删除本地 `countWorkdays`（105-117 行）。
- 顶部 `import { getHolidays, countWorkdays } from './workdayCalendar';`。
- `computeGoalDeviation` 内 `const holidays = getHolidays(today.getFullYear());`，把 `countWorkdays(start, end)` → `countWorkdays(start, end, holidays)`、`countWorkdays(start, today)` → `countWorkdays(start, today, holidays)`。
- `buildItemEvidence` 内同样传入 `holidays`。
- 既有「严重落后 / 停滞 / 缺日期 / 达标」用例因日期跨度对称、比例不变，仍应全绿。
- 验证 Task 3 测试由红转绿。

### Task 4 — ⛔ 已取消：这两个模块**不是**孤儿，不能删

> **重要更正（执行中发现）**：原计划依据"早前搜索全代码库零 import"判定它们为孤儿。
> 但该搜索路径在 `src/` 内、漏掉了根目录的 `main.ts`。实际 `main.ts` 真正使用了二者：
> - `shouldSkipPlanned`（第 261 行）：同一笔记内容未变时，**跳过重复规划写入**（幂等）；
> - `deriveStableGoalId`（第 285 行）：由「笔记路径 + 标题」派生**稳定 goalId**，重规划时**原地更新**而非追加重复目标（兼容历史随机 id）。
>
> 删除它们会直接破坏已上线的幂等规划 + 稳定 ID 功能，因此 **Task 4 取消**，4 个文件已从 git 恢复。
> 之前"删孤儿"的建议属于误判，向用户致歉并更正。

### Task 4（替代）— 补一条"非孤儿"的锁定测试，防止未来再误删
- 在 `main.ts` 调用点附近（或 `runDiagnosis`/`MarkdownPlanner` 测试）加注释 + 断言：
  `main.ts` 的规划命令依赖 `shouldSkipPlanned` 与 `deriveStableGoalId`，二者非死代码。
- 目的：把"这两个模块被 main 使用"的事实固化，避免后人重蹈"搜索漏根目录 → 误删"的覆辙。

### Task 5 — `runDiagnosis.ts` 顶部补「双路径出口」状态机注释
- 在不改动运行时逻辑前提下，于文件顶部补一段注释：描述编排的两条出口——
  1. 确定性改写（`applySuggestion`/`applySuggestions`）→ `openApplyPreview` → `onConfirm` 写库；
  2. 人工闸门里可选 `onEscalateAI` → `openAgentic` 让 AI 再打磨 → 写库。
- 目的：让新人一眼看全「确定性落库 / 升级 Agentic」双路径，治理复盘提到的「三重 AI 链路看不见全貌」。

### Task 6 — GoalDiagnoser 加 prompt 快照测试（锁铁律 token）
- 在 `goalDiagnoser.test.ts` 增 `describe('GoalDiagnoser.buildDiagnosisMessages — 铁律快照')`，断言 `buildDiagnosisMessages` 输出**同时包含**以下关键 token（任一条被改丢，测试即红）：
  - 三维：`L1` / `L2` / `L3`
  - 等级：`excellent` / `good` / `warning` / `risk`
  - 反直觉价值观：`领先` / `停滞` / `均衡` / `最弱维度`
  - 禁编造：`严禁编造` / `清单`
  - 确定性改写：`确定性程序`
  - 结构化动作：`adjust_dailyMin` / `remove_subitem` / `add_subitem`
  - 健康分注入：`healthScore` / `weakest`
- 目的：治理复盘提到的「文档与代码不同步」「改动任一铁律需同步多份文档」——以后谁改 prompt，测试挡住「把铁律改丢」。

### Task 7 — 全量验证
- `npx tsc --noEmit`（src 类型检查）
- `npm run test:host`（vitest 跑 `src/**/*.test.ts`）
- 全部转绿后再收尾。

## 不在范围内（明确排除）
- 流式 SSE（伪需求，已否）；
- 稳定 goalId / 幂等能力接入（若日后需要单独评估，不混入本次）；
- `temperature` 抽常量（小优化，未要求，留待后续）。
