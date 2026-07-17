# 规划台健壮性改造（①②③）实现计划

日期：2026-07-17
关联设计评审：前序对话已确认三点说法成立，本计划据此落地。

## 背景与问题

`PlanEditorView`（中央窗口形态的对话式规划审阅台）当前存在：

1. **重启僵尸标签页（必修 Bug）**：`main.ts` 的视图工厂用
   `this.pendingPlanOpts!` 强断言消费一个仅在“打开时”赋值的实例字段。
   `pendingPlanOpts` 是运行时字段，每次插件重载都为 `undefined`。
   Obsidian 会把打开的 ItemView 按 `viewType` 持久化进 `workspace.json`，
   重启恢复时调用工厂 → 实际拿到 `undefined`。构造器把它塞进 `this.opts`，
   `render()` 的 `if (!this.opts) return;` 兜住不崩，但留下一个标题为
   “AI 规划台”的空白页，需多点一下才能关。另：`pendingPlanOpts` 用完不清理。

2. **onDismiss 不分确认/取消（可选增强）**：控制器 `onDismiss?: () => void`
   无原因参数，`confirm()` 落库后和取消按钮都走同一回调 → 中央窗口“写入即关”。
   多轮打磨场景希望确认后保留标签页。

3. **命令面板无法手动打开空规划台（可选增强）**：已有 `VaultStorage.getGoals()`
   与控制器内置的 `goals` 编辑模式（`session.loadGoals`），但命令面板没有入口。
   加一条命令“打开规划台编辑当前目标库”，读 `goals.json` → 以 `goals` 编辑模式打开
   → 确认走 `writeDiagnosedGoals` 落库。不依赖笔记，随时可调用。

## 设计决策（已与用户确认）

- ① 必做；②③ 顺手一起做。
- ① 修复方式：工厂参数改可选；`setViewState` 消费后 `pendingPlanOpts = undefined`；
  `render()` 无 opts 时渲染“遗留占位页”（说明 + 关闭此标签页按钮，复用 detach）。
- ② `onDismiss` 签名改为 `(reason: 'confirm' | 'cancel') => void`；
  `confirm()` 调 `requestClose('confirm')`，取消/失败默认 `'cancel'`。
  `PlanEditorView` 在 `confirm` 时弹 Notice 并保留标签页，`cancel` 时 detach。
  向后兼容：`AgenticPlanModal`（弹窗）不使用 `onDismiss`，不受影响。
- ③ 新增命令 `open-plan-editor-goals`，复用现有 `openPlanEditor` 与 `writeDiagnosedGoals`。

## 任务拆分（TDD，每任务 2–5 分钟）

### 任务 1 — 测试先行：onDismiss 原因透传
- 新建 `src/ai/__tests__/agenticPlanController.test.ts`
- 用例：
  - `requestClose('confirm')` → `onDismiss` 收到 `'confirm'`
  - `requestClose()` 默认 → `onDismiss` 收到 `'cancel'`
  - `confirm()` 有保留目标 → `onConfirm` 被调用且 `onDismiss('confirm')`
  - `confirm()` 无保留目标 → `onConfirm` 不调用且 `onDismiss('cancel')`
- 运行 `npx vitest run src/ai/__tests__/agenticPlanController.test.ts` → 预期**红**（当前无 reason 透传）。

### 任务 2 — 实现 ② onDismiss 原因
- `AgenticPlanController.ts`：
  - `onDismiss?: (reason: 'confirm' | 'cancel') => void;`
  - `requestClose(reason: 'confirm' | 'cancel' = 'cancel')`
  - `confirm()` 末尾改 `this.requestClose('confirm');`
- `PlanEditorView.ts`：
  - `import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';`
  - `onDismiss` 改为 `(reason) => { reason==='confirm' ? Notice(保留提示) : detach(); }`
- 运行测试 → 预期**绿**。

### 任务 3 — 实现 ① 重启僵尸标签页兜底
- `main.ts` 工厂：`this.pendingPlanOpts`（去掉 `!`）。
- `openPlanEditor`：`await leaf.setViewState(...)` 后 `this.pendingPlanOpts = undefined;`
- `PlanEditorView.ts`：
  - 构造器 `opts?: AgenticPlanOptions`
  - `render()`：无 opts → 渲染遗留占位页（标题 + 说明 + 关闭按钮 detach）
- 运行 `tsc --noEmit` 确认类型收紧无误。

### 任务 4 — 实现 ③ 命令面板打开目标库编辑器
- `main.ts`：注册命令 `open-plan-editor-goals`
- 新增私有方法 `openPlanEditorForGoals()`：
  - `getGoals()`；空则 Notice 提示并返回；
  - `openPlanEditor({ content:'', scope:'note', settings, goals, subtitle, onConfirm: writeDiagnosedGoals })`

### 任务 5 — 样式补充
- `styles.css`：为遗留占位页 `.bamboo-plan-editor-legacy` 加最小居中样式（复用既有按钮类）。

### 任务 6 — 全量验证
- `npx vitest run`（全部现有测试不回归）
- `npx tsc --noEmit -skipLibCheck`
- `npx eslint .`

## 验收标准
- 重启后不再有空白“AI 规划台”标签页；若有遗留则显示占位页+关闭按钮。
- 中央窗口确认写入后保留标签页并提示；取消则关闭。
- 命令面板可随时打开“编辑当前目标库”规划台。
- 所有既有测试通过，lint 无新增错误。
