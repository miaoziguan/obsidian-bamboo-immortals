# 计划：AI 诊断分阶段进度指示（替换 ⑤ 流式 SSE）

- 日期：2026-07-17
- 关联：`2026-07-16-roadmap-choose.md`（原 ⑤ 流式 SSE）、`2026-07-16-diagnosis-action-loop-design.md` §8（原 YAGNI：不做 ⑤ 流式 SSE / 不做 MVP-2）
- 背景：经评审，原 backlog 中的「#1 SSE 流式逐字」被判定为**伪需求**（详见会话论证）：
  - 诊断是单次 JSON 调用（`response_format: json_object`），流式吐的是 JSON 字符残片，用户无法阅读；
  - 报告是结构化渲染，半成品 JSON 无法成卡；
  - #7 / MVP-2 行动闭环基于**最终**结构化对象，流式需重做 action 逻辑；
  - 流式真正解决的只有「感知延迟」，而结构化诊断靠「知道卡在哪一步」即可安抚，无需逐字。
- 结论：**砍掉 ⑤ raw SSE 逐字**，改为**分阶段进度指示**（轻量、回调即可、零新协议、零 CORS 风险）。

## 目标
点「AI 诊断」后，用户立即看到进度弹窗，按阶段推进：

```
① 收集目标与执行记录 → ② 计算三维健康分与偏差 → ③ 调用 AI 诊断中… → ④ 解析诊断结果
```

诊断完成、报告弹窗打开时，进度弹窗自动关闭。

## 设计
### 纯逻辑层（runDiagnosis）
- 新增 `DiagnosisPhase` 类型：`'collect' | 'analyze' | 'ai' | 'render' | 'done'`。
- `DiagnosisDeps` 新增可选 `onPhase?: (phase: DiagnosisPhase, label: string) => void`。
- 在 `runDiagnosis` 自然边界发事件（不新增任何网络/传输层）：
  - 进入即 `collect`：收集目标与执行记录；
  - 指标算完、AI 调用前 `analyze`：计算三维健康分与偏差；
  - AI 调用前 `ai`：调用 AI 诊断中…（主要耗时，用户在此感知到「在跑」）；
  - `diagnose` 返回后、`openDiagnosis` 前 `render`：解析诊断结果；
  - 报告打开即视为 `done`（由 main.ts 在 openDiagnosis 时关闭弹窗）。
- `onPhase` 可选：不提供时完全无副作用，旧测试/命令零改动。

### UI 层（DiagnosisProgressModal）
- 新增 `src/ai/DiagnosisProgressModal.ts`：继承 Obsidian `Modal`，竖向步骤列表。
- `setPhase(phase, label)`：按 canonical 顺序渲染步骤，已完成步骤标 ✓、当前步骤高亮+微动效、未到步骤置灰。
- `ai` 阶段（最久）显示「进行中」态（脉冲点/省略号动画）。
- 不做逐字、不做流式渲染、不解析半成品 JSON。

### 接线（main.ts）
```ts
const progress = new DiagnosisProgressModal(this.app);
progress.open();
await runDiagnosis({
  ...,
  onPhase: (p, l) => progress.setPhase(p, l),
  openDiagnosis: (o) => { progress.close(); new DiagnosisModal(this.app, o).open(); },
});
progress.close(); // 安全兜底
```

## 范围与 YAGNI
- ✅ 分阶段进度弹窗（解决真实感知延迟）。
- ❌ 不做 raw SSE 逐字流式（伪需求，CORS 暗礁，无阅读价值）。
- ❌ 不做 function-calling 协议改造（与 ⑤ 解耦，本次只做进度指示）。
- ❌ 不碰 `diagnose` 内部单次调用结构（进度按编排边界发，不拆 AI 调用）。

## 测试策略（TDD）
- `runDiagnosis.test.ts`：
  - 提供 `onPhase` → 断言按序收到 `collect`→`analyze`→`ai`→`render`（label 正确）；
  - 不提供 `onPhase` → 断言 `runDiagnosis` 仍正常完成（可选字段无副作用）。
- `DiagnosisProgressModal`：用 FakeEl 验证 `setPhase` 步骤状态机（当前/已完成/未到）。
- 全量闸门：vitest + tsc + eslint + jest + sync.sh。

## 验证闸门
- `vitest`(host) 全绿（含新增）
- `jest`(webapp) 214/214 不受影响
- `tsc --noEmit` 0 · `eslint` 0 error
- `sync.sh` 通过（CSS 令牌门禁 + 构建 + 同步 vault）
- 本地提交（不推送）
