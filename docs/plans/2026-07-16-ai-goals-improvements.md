# AI 目标规划改进实施计划（2026-07-16）

> 背景：用户反馈 AI 规划出的卡片「只抄标题、没有归纳分析」，且重复规划会让目标越积越多。
> 经调试还发现 `recoverLegacyAiGoals` 是恒为空的死代码，且本次修复（「目标丢失后重写」「写前剥离 icon」）缺回归测试。

## 目标
A. 让 AI 真正「归纳 + 分析」：新增 `analysis` 字段并展示。
B. 确定性目标 ID：根治重复规划导致的目标累积。
C. 新增「重建全部 AI 目标」命令，批量找回丢失目标。
D. 删除死代码 `recoverLegacyAiGoals`。
E. 为修复逻辑补单元测试（锁定行为、防回归）。
F. plans-map 失效清理（索引不再无限增长）。

## 任务（TDD：每任务先写失败测试或依赖纯函数，再实现）

1. **D 删死代码** — 删除 `main.ts` 中 `recoverLegacyAiGoals` 方法、`onload`/`writeAiGoals` 中的调用与注释。（独立、无依赖）
2. **B 确定性 ID + 幂等判定**
   - 新建 `src/ai/goalId.ts`：`deriveStableGoalId(seed)`（FNV-1a 纯函数）。
   - 新建 `src/ai/idempotency.ts`：`shouldSkipPlanned(plannedIds, existingIds)`。
   - `main.ts#writeAiGoals`：用稳定 ID 派生 + 旧随机 ID 兼容复用；改用 `shouldSkipPlanned`。
3. **A analysis 字段**
   - `data.ts`：`GoalItem.analysis?: string`。
   - `MarkdownPlanner.buildPrompt`：JSON 示例 + 规则 13（≤40 字归纳分析）；规则 10 注明 analysis 例外。
   - `parseGoals`：映射 `analysis`。
   - `GoalCardValidator.sanitizeGoal`：保留 `analysis`（否则被丢未知字段静默丢弃）。
   - `PlanConfirmModal.renderGoal` + `renderer.js` + CSS：展示 analysis。
4. **C 重建命令** — `main.ts` 注册 `ai-rebuild-goals`，读 plans-map → 逐篇重规划 → `writeAiGoals(silent=true)` → 统一通知。
5. **E 单元测试** — `sanitizeGoal` 保留 analysis / 丢弃 icon；`deriveStableGoalId` 稳定不碰撞；`shouldSkipPlanned` 各分支。
6. **F 索引清理** — `writeAiGoals` 写索引前剔除「全部 id 已不在最终目标库」的 entry。

## 验证
- `npx tsc --noEmit`（类型）
- `npm run test:host`（vitest，src/**/*.test.ts，目标 105+ 不降）
- `node scripts/bundle-webapp.mjs`（webapp）
- `bash sync.sh`（同步 main.js / styles.css 到库目录）

## 落地顺序
D → B → A → C → E → F（每步可独立验证）。
