# 实现计划：让 AI 诊断「说健康分的语言」

> 关联设计：`2026-07-16-health-score-diagnosis-design.md`
> 执行方式：每个任务 TDD（先写失败测试 → 看失败 → 实现 → 看通过 → 跑全量）。

## 任务 T1 — `src/ai/healthScore.ts`（健康分 TS 引擎，新增）

**先写测试** `src/ai/__tests__/healthScore.test.ts`：
- `TUNING` 常量与 webapp 一致（断言关键权重/阈值）。
- `computeGoalHealth`：
  - 按时完成（endDate 内、进度 100）→ `level==='excellent'`，`score===100`。
  - 过度超前完成（endDate 后 >3 工作日）→ score 显著低于按时完成（验证「领先≠健康」）。
  - 多子项进度严重不均衡 → L3.balance.score 明显低于均衡场景。
  - 长期无推进 → L3.stagnation.penalty > 0。
  - `L1/L2/L3` 字段齐全且 0..100；`weakestDimension` 返回最弱维度键。
- `generateHealthHints(result, set)` 返回按维度（L1/L2/L3）组织的归因 hints。
- 确定性：`today` 注入，节假日列表 `buildHolidays(year)` 纯函数可测。

**再实现** `healthScore.ts`：
- 移植 `TUNING`、`LEVELS`、`_isWorkday`/`_countWorkdays`/`_workdaysBetween`、`_scoreOnTime`/`_scoreModerateEarly`/`_scoreWeeklyActive`、`_scoreProgressTrend`/`_scoreCompletionTrend`、`_scoreStagnation`/`_scoreBalance`/`_scoreOverEarly`/`_scoreDelay`、`computeGoalHealth`、`computeHealthSet`、`_levelFor`。
- 缓存复用 `DeviationCalculator.buildCache` 产物（`DeviationCache` 的 `byDateKey[dateKey][goalId].{active,completions,progress}` 形状与 webapp 一致），不读全局 `store`。
- `today` 作为必填参数注入；`buildHolidays(refYear)` 纯函数（移植 webapp 法定节假日 + 春节）。
- 导出类型：`HealthLevel`、`HealthResult`、`HealthSet`、`HealthHint`、`HealthDimension`。

## 任务 T2 — `src/ai/GoalDiagnoser.ts`（接入健康分）

**先写/扩展测试** `goalDiagnoser.test.ts`：
- `parseDiagnosis` 解析并保留 `healthScore/level/L1/L2/L3/weakest`；旧字段回退不变。
- `buildHealthSummary(goals, cache, today)` 输出含 `score/level/L1/L2/L3/weakest` + 维度 hints 文本。
- `buildDiagnosisMessages` 的 system 注入：三维框架、健康分哲学硬约束（领先≠健康/失衡看边缘子项/L2弱先激活惯性/加速不必恐慌式调 dailyMin）、新 JSON schema（`level` + `weakest` + `L1/L2/L3`）；user 含 `buildHealthSummary` 文本。
- `diagnose` 用健康缓存（60 天）并把健康摘要注入提示词（捕获 body 校验）。

**再实现**：
- 扩展 `GoalDiagnosis` 接口（新可选字段）+ 类型 `HealthLevel`/`HealthDimension`。
- `normalizeGoal`/`parseDiagnosis` 读取新字段（缺省回退，零崩溃）。
- 新增 `buildHealthSummary`。
- 重写 `buildDiagnosisMessages`（三维 + 哲学约束 + 新 schema）。
- `diagnose` 内部 `buildCache` 拉满 `STAGNATION_WINDOW` 天（从 `TUNING` 取 60），构造健康摘要注入。

## 任务 T3 — `src/ai/DiagnosisModal.ts`（渲染对齐健康分）

**先写/扩展测试** `diagnosisModal.test.ts`：
- 有健康字段时：渲染等级标签（优秀/良好/需关注/风险）+ 三维指标（执行/动力/节奏数值）。
- 无健康字段（旧数据）→ 降级到旧 status 标签渲染，不崩。
- 建议行带维度标签（当 `weakest` 存在）。

**再实现**：
- `STATUS_LABEL` 增加 `level`→中文标签映射（`excellent→优秀` 等）。
- `renderGoal` 优先用 `g.level`/`g.L1/L2/L3` 渲染健康卡式头部（等级 + 三维度 chip），无则降级 status。
- 建议行增加维度标签（来自 `g.weakest` 或 AI 返回 `dimension`）。

## 任务 T4 — `src/ai/runDiagnosis.ts`（拉取足够历史）

- `recentDays ?? 14` 改为 `Math.max(deps.recentDays ?? 14, TUNING.STAGNATION_WINDOW)`，确保 `diagnose` 内 `buildCache` 有 60 天历史供 L3 判定。
- 扩展 `runDiagnosis.test.ts` 断言 `getDayKeys` 拉取上限≥60。

## 收尾 — 验证门禁

- `npx tsc --noEmit`（类型门禁）
- `npx eslint .`（lint 门禁，生产代码零 any/未用变量/console）
- `npx vitest run`（TDD 全量单测）
- 可选：`npm run test`（jest webapp 侧不受影响）
