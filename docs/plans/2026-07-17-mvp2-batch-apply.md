# 实现计划：MVP-2 一键批量应用诊断建议

- 日期：2026-07-17
- 关联：#7 建议结构化命中具体子项（确定性改写 + 聚焦预览）、`2026-07-16-diagnosis-action-loop-design.md` §8（原 YAGNI：不做 MVP-2 一键批量）
- 执行策略：TDD（红 → 绿 → 提交），复用 #7 已落地的 `applySuggestions` + `SuggestionApplyModal`

---

## 背景

#7 已交付：
- 每条建议「应用」→ 确定性改写 + 聚焦预览（`onApply(goal, suggestion)`）
- 单目标内「应用全部」→ 该目标全部建议一次性确定性应用（`onApplyAll(goal)`）

但**报告级「一键应用全部建议」**仍缺：用户要对 N 个目标的几十条建议逐一点，体验割裂。
MVP-2 目标：在报告顶部加一个醒目主 CTA，一次点击把所有目标的全部建议**确定性批量改写**，
经**单次预览 / 人工闸门**确认后落库——保留 diagnosis-action-loop-design §7「人工确认是最后闸门」。

---

## 设计要点

1. **零新协议**：完全复用 #7 的 `applySuggestions(list, goals)`（跨多目标，每条带 `goalRef`）+
   `SuggestionApplyModal`（before→after 预览，每条建议一行）。无需 AI 二次猜测。
2. **新增报告级回调** `onApplyAllDiagnosis?: () => void`（区别于 per-goal 的 `onApplyAll(goal)`）。
3. **按钮可见性**：仅当报告内存在 ≥1 条建议时显示，避免空操作。
4. **按钮位置**：报告 header 下方独立工具条（`.bamboo-diag-batchbar`），主按钮样式，与逐条「应用」视觉区分。
5. **交互**：点「一键应用全部建议」→ 关闭诊断弹窗 → 打开 `SuggestionApplyModal`
   （title=`一键应用全部建议`，列出全部建议的命中/改值预览）→ 用户确认 → `writeGoals` 落库。
6. **容错**：若全部建议均未命中目标/子项（`applied=false`）→ `notice` 不打开预览、不落库。

---

## T2 · DiagnosisModal（UI）

**改** `src/ai/DiagnosisModal.ts` + 扩展 `src/ai/__tests__/diagnosisModal.test.ts`

红（DOM 断言）：
- 提供 `onApplyAllDiagnosis` 且报告存在 ≥1 建议 → header 下方出现按钮「一键应用全部建议」；
  点击 → 触发 `onApplyAllDiagnosis` 并 `close()`。
- 未提供 `onApplyAllDiagnosis` → 不出现该按钮（逐条「应用」/ per-goal「应用全部」仍正常）。
- 报告 0 条建议时即使提供回调也不显示按钮。

绿：
- `DiagnosisModalOptions` 增 `onApplyAllDiagnosis?: () => void;`
- `onOpen` 中：计算 `totalSuggestions = d.goals.reduce(...suggestions.length)`，
  若 `this.opts.onApplyAllDiagnosis && totalSuggestions > 0` → 渲染 `.bamboo-diag-batchbar` 含主按钮。

---

## T3 · runDiagnosis（编排）

**改** `src/ai/runDiagnosis.ts` + 扩展 `src/ai/__tests__/runDiagnosis.test.ts`

红（集成断言，mock `openApplyPreview`/`writeGoals`）：
- 触发 `onApplyAllDiagnosis` → `openApplyPreview` 被调用，其 `after` 反映**全部**目标的全部建议改动；
  `before` 为原树；`suggestions` 为跨所有目标的扁平列表。
- 全部建议均未命中 → `notice` 且 `openApplyPreview` 不被调用、`writeGoals` 不被调用。

绿：
- `openDiagnosis` 的 opts 增 `onApplyAllDiagnosis`：
  ```ts
  onApplyAllDiagnosis: () => {
    const all = result.goals.flatMap((g) => g.suggestions ?? []);
    if (all.length === 0) return;
    const res = applySuggestions(all, goals);
    if (!res.applied) { deps.notice('所有建议均未匹配到目标/子项，未改动'); return; }
    deps.openApplyPreview({
      suggestions: all,
      before: goals,
      after: res.goals,
      onConfirm: (final) => void deps.writeGoals(final),
      onEscalateAI: (final) => deps.openAgentic({...}),
      title: '一键应用全部建议',
    });
  }
  ```
- `main.ts` 无需改动（`onApplyAllDiagnosis` 在 `openDiagnosis` opts 内注入，已通过 `openApplyPreview` 依赖闭环）。

---

## T4 · CSS

**改** `styles.css`：新增 `.bamboo-diag-batchbar`（工具条：flex 右对齐 / 分隔 / 上边距）+
  `.bamboo-diag-batch-btn`（主 CTA，复用 `bamboo-ai-plan-btn-primary` 视觉，更大圆角与强调）。
  与逐条「应用」（次级）视觉层次拉开。

---

## T5 · 验证闸门

- `npx tsc --noEmit` 0 error
- `npx eslint` 0 error
- `CI=1 npx vitest run` 全绿（host，含新增/扩展用例）
- `npx jest` 全绿（webapp，无回归）
- `bash sync.sh` 通过（CSS 令牌门禁 + 构建 + 同步 vault）
- 本地提交（不推送）

---

## 完成判据

- [ ] T2 `DiagnosisModal` 报告级按钮 + 测试绿
- [ ] T3 `runDiagnosis` 批量编排 + 测试绿
- [ ] T4 CSS 样式就位
- [ ] T5 全量闸门绿 + 本地提交
- [ ] 行为：报告顶部「一键应用全部建议」→ 单次预览 → 确认落库，跨多目标确定生效
