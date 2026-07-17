# 实现计划：删除「批量重建已规划笔记的目标」命令

日期：2026-07-18
基于设计文档：`2026-07-18-remove-rebuild-command-design.md`
流程：superpowers Phase 3（Subagent-Driven Build / TDD）

> 工具说明：当前环境无 `sessions_spawn` 通用实现子代理，改用主代理直接执行 +
> 严格 TDD 纪律（先锁回归测试 → 删除 → 全绿）。纯删除无天然 red 阶段，以
> 「现有套件作为回归门禁 + 移除验证」作为等价证据链。

## 任务清单（每个 2–5 分钟）

### Task 1 — 锁回归测试（先于删除，watch pass）
- 目标：确认现有套件在删除前是绿的，作为后续「删除没破坏东西」的基线。
- 动作：运行 `npx jest`（或项目测试脚本），记录全绿。
- 验证：`idempotency.test.ts`、`markdownPlanner.test.ts`、`e2e.singlegoal`、`e2e.multigoal` 通过。
- 提交：不自动提交（见设计文档 / Phase 5 让用户选）。

### Task 2 — 删除命令注册
- 文件：`main.ts:147-151`
- 删除 `addCommand({ id: 'ai-rebuild-goals', name: 'AI 规划：批量重建已规划笔记的目标', callback: ... })` 整块。
- 验证：`grep -rn "ai-rebuild-goals" src/` 无结果（main.js 是产物，不算）。

### Task 3 — 删除 `rebuildAiGoals()` 方法
- 文件：`main.ts:456-511`
- 删除整个方法（含上方 JSDoc）。
- 验证：`grep -rn "rebuildAiGoals" src/` 无结果。

### Task 4 — 收拾死参数 `silent`
- 文件：`main.ts` 的 `writeAiGoals`（约 385-454）
- 4a. 签名去掉 `silent = false` 第 4 参数。
- 4b. 删除 JSDoc `@param silent` 行。
- 4c. 第 406 行 `if (!silent && shouldSkipPlanned(...))` → `if (shouldSkipPlanned(...))`。
- 4d. 第 400-402 行注释精简为「幂等：同一笔记+相同内容已规划过且目标仍全部存在 → 跳过」。
- 4e. 第 451 行 `if (!silent) { new Notice(...) }` → 直接 `new Notice(...)`。
- 验证：`grep -rn "silent" src/main.ts` 无结果（其余文件的 silent 是无关代码）。

### Task 5 — 类型检查 + lint 门禁
- `npx tsc --noEmit` 通过（无未定义/未使用）。
- `npx eslint src/main.ts` 0 error。
- 验证：两项均 EXIT 0。

### Task 6 — 全量回归（watch pass）
- 再次运行 `npx jest`，必须全绿（证明删除 + 去 silent 未破坏 `writeAiGoals` 既有行为）。
- 验证：全绿，特别关注 `idempotency.test.ts`（幂等跳过路径仍在）。

### Task 7 — 构建同步（END-TO-END 证明）
- `bash sync.sh`：CSS 门禁 → tsc → eslint → webapp 构建 → esbuild 打包 → 拷贝产物。
- 验证：EXIT 0；`main.js` 重新生成且不含 `rebuildAiGoals`。

## Phase 4（Review）核对点
- 无残留引用（grep 三连）。
- `writeAiGoals` 行为对正常调用方完全不变（仅移除 silent 分支，正常路径本就走 `!silent` 分支）。

## Phase 5（Finish Branch）给用户的选择
当前在 `main` 分支且已有大量未提交改动（框架打磨等）。
- A. 本地 merge/继续累积（不提交，保持 working tree）
- B. 提交本次删除（含两份计划文档）为一个 commit
- C. push + 开 PR
- D. 丢弃本次改动
（默认不自动提交，尊重仓库安全规则；由用户拍板。）
