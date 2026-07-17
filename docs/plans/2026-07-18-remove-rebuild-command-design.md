# 设计文档：删除「批量重建已规划笔记的目标」命令

日期：2026-07-18
流程：superpowers（Brainstorm → Plan → Subagent Build TDD → Review → Finish）

## 1. 背景与决策

`AI 规划：批量重建已规划笔记的目标`（`id: ai-rebuild-goals`）是一个放在命令面板里的一等命令，
其实现为 `main.ts` 的 `rebuildAiGoals()`。经分析（见对话），它价值低且有害：

- **恢复不了真正的东西**：AI 规划是非确定的，重建拿回的是一份全新拆解，且不会还原 `currentValue` 进度。
- **会覆盖手改**：用确定性 ID 原地覆盖，若目标仍在，会用 AI 新结果盖掉用户手动调过的 `dailyMin/targetValue`。
- **触发场景极窄**：仅解决「目标被清空 + plans-map 残留旧哈希」这种内部不一致状态，正常用户几乎遇不到。
- **成本不透明**：遍历所有历史笔记每篇一次 AI 调用，无二次确认。

用户已选定 **方案 A：直接删除**。

## 2. 删除范围（精准牵连分析）

通过全仓搜索确认：

| 符号 | 引用位置 | 处理 |
|---|---|---|
| 命令注册 `ai-rebuild-goals` | `main.ts:147-151` | 删除 |
| `rebuildAiGoals()` 定义 | `main.ts:456-511` | 删除 |
| `rebuildAiGoals()` 调用 | `main.ts:150` | 随命令注册一起删除 |
| `silent` 第 4 参数（`writeAiGoals`） | `main.ts:388,394,400-402,406,451` | 删除（全仓仅 `rebuildAiGoals` 传 `true`，删后成死参） |
| `main.js`（编译产物） | 整个文件 | 由 `sync.sh` 重新生成，不手动改 |
| 测试 | `src/**` 下 0 处引用 | 无需改测试 |

`writeAiGoals` 其余所有调用方（如 `aiPlanFromNote`、`aiPlanFromSelection`、诊断闭环）均只传 3 个参数，
删除 `silent` 后行为不变：正常执行幂等跳过（`shouldSkipPlanned`）与通知。

## 3. 具体改动清单

1. 删除 `main.ts:147-151` 的 `addCommand({ id: 'ai-rebuild-goals', ... })` 整块。
2. 删除 `main.ts:456-511` 的 `rebuildAiGoals()` 方法整块。
3. `writeAiGoals` 签名去掉 `silent = false` 第 4 参数，并：
   - 删除 JSDoc `@param silent` 行及其说明。
   - 第 406 行 `if (!silent && shouldSkipPlanned(...))` → `if (shouldSkipPlanned(...))`。
   - 第 400-402 行关于「批量重建模式强制重写」的注释精简为仅描述幂等跳过。
   - 第 451 行 `if (!silent) { new Notice(...) }` → 直接 `new Notice(...)`。

## 4. 验收标准（Evidence over claims）

- `grep` 全仓无 `rebuildAiGoals` / `ai-rebuild-goals` / `recoverLegacy`（除历史计划文档）。
- `tsc` 类型检查通过（无未定义/未使用报错）。
- `eslint` 0 error。
- 现有 jest 套件全绿（回归门禁，重点 `idempotency.test.ts`、`markdownPlanner.test.ts`、`e2e.*`）。
- `bash sync.sh` 构建通过，`main.js` 重新生成且不残留该方法。

## 5. 不在范围内（YAGNI）

- 不新增「高级/危险操作」入口（方案 B 已否决）。
- 不保留 `silent` 参数（方案 C 已否决）。
- 不动 `plans-map`/幂等索引逻辑本身。
