# 计划：战略复盘面板接入 AI 改进（health-score → Agentic 闭环）

- 日期：2026-07-17
- 状态：计划已批准（用户确认「制定计划，干」）
- 关联：
  - `2026-07-16-diagnosis-action-loop-design.md` §8（本项当时被显式列为「后续再接战略复盘面板」）
  - `2026-07-16-diagnosis-action-loop.md`（MVP-1 诊断→行动闭环，已落地）
  - `2026-07-16-agentic-planning-design.md`（AgenticPlanModal / PlanningSession 已落地）

---

## 1. 背景与要解决的问题

诊断→行动闭环（MVP-1）已在**插件侧**跑通：`ai-diagnose` 命令 → `DiagnosisModal` → 点「应用」→ `AgenticPlanModal` 预填 → 落库。入口只有**命令**。

但「发现」问题的最高频场景在 **webapp 战略复盘面板**（`openHealthScoreDetail`，本地 `GoalHealthScore` 三维健康分 + 规则化 hint）。用户在那里看到某个目标「L3 停滞」「L1 拖延」，却要**退出面板、回 Obsidian 跑命令**才能改进——两半仍割裂。

本计划把 webapp 健康分详情的「用 AI 改进」按钮，经既有 postMessage 桥直接喂给已验证的 `AgenticPlanModal` 编辑链路，**零新协议**。

---

## 2. 方案概述（复用既有链路，零新协议）

```
webapp · openHealthScoreDetail（每项目标有「✨ 用 AI 改进」按钮）
   │ 点击 → window.parent.postMessage({ type:'app:aiImproveGoal', id, payload:{goalId,title,hints} })
   ▼
插件 · AppAPI.onMessage（INBOUND_PREFIXES 已含 'app:'，放行）
   │ 调用注入回调 onAiImproveGoal(payload)
   ▼
DailyReviewView 接线 → BambooReviewPlugin.requestAiImprove(payload)
   │ ① aiEnabled 门禁；② VaultStorage.getGoals()；③ 按 goalId（回退 title）匹配目标
   │ ④ 构建 initialInstruction（标题 + 本地 hints 原文）
   ▼
AgenticPlanModal({ goals:真实树, initialInstruction, settings, onConfirm: writeDiagnosedGoals })
   │ 树状 diff 实时刷新，用户审阅
   ▼
点「写入目标」→ writeDiagnosedGoals → putGoals + notifyGoalsChanged（完全复用诊断闭环）
```

**复用的真实接口（已逐行核实）**
- 通信：`AppAPI.onMessage`（`src/host/AppAPI.ts:153`）+ `INBOUND_PREFIXES`（`src/host/protocol.ts:22`，含 `'app:'`）+ `DailyReviewView.sendCommand`/`appAPI`。
- 目标库：`VaultStorage.getGoals()`（`src/storage/VaultStorage.ts`）。
- 审阅台：`AgenticPlanModal(app, { goals, initialInstruction, settings, onConfirm })`（`src/ai/AgenticPlanModal.ts:35`），`initialInstruction` 已在诊断「应用建议」路径验证。
- 落库：`writeDiagnosedGoals(goals)`（`main.ts:394`，含 `putGoals` + `notifyGoalsChanged` + Notice）。
- 按钮容器：`openHealthScoreDetail` 用 `PanelManager.open(content, { onOpen:(panel)=>… })`（`renderer.js:627`），`panel` 为 DOM 元素，可挂事件委托。
- webapp→host 发消息范式：`window.parent.postMessage({type,id,payload}, '*')`（`bridge.js:93`，host 监听 `activeDocument.defaultView`）。

---

## 3. 需改造 / 新增（明确范围，TDD 红→绿）

### T1 协议契约（webapp + host 镜像）
- `webapp/assets/scripts/utils/protocol.js` `APP_MESSAGE_TYPES` 增加 `'app:aiImproveGoal'`。
- `src/host/protocol.ts` `ALL_MESSAGE_TYPES` 增加 `'app:aiImproveGoal'`（`INBOUND_PREFIXES` 的 `'app:'` 已覆盖，无需改前缀）。
- 新建 `src/host/__tests__/aiImprove.test.ts`：**红**——断言 `AppAPI` 收到 `app:aiImproveGoal` 消息时调用 `onAiImproveGoal` 回调且 `respond({ok:true})`；断言非法来源/缺字段被忽略。

### T2 AppAPI 处理分支
- `src/host/AppAPI.ts`：新增可注入字段
  `onAiImproveGoal?: (p: { goalId: string; title?: string; hints?: string }) => void;`
- `handleMessage` 增加分支 `app:aiImproveGoal`：校验 `payload.goalId` 存在 → 调 `onAiImproveGoal({goalId, title, hints})` → `respond(id,{ok:true})`；缺失则 `respondError`。
- **绿**：T1 测试通过。

### T3 webapp 按钮 + 发送
- `renderer.js` `openHealthScoreDetail`：
  - `goalsDetailHtml` 每项追加按钮
    `<button class="health-goal-improve" data-goal-id="${goal.id}" data-goal-title="${escapeHtml(goal.title)}" data-hints="${escapeHtml(hints)}">✨ 用 AI 改进</button>`
    （`hints` = 拼接 `healthScore.L1.onTime.hint` + `L3.stagnation.hint`）。
  - `onOpen(panel)` 内挂点击委托：读 `dataset` → `window.parent.postMessage({type:'app:aiImproveGoal', id:'ai_improve_'+Date.now(), payload:{goalId,title,hints}}, '*')` → `Toast.showToast('已在 Obsidian 中打开 AI 改进…','info')`。
- 样式：`.health-goal-improve`（小号、主色描边、hover 微动效），加到 `styles.css` 或 webapp CSS（跟现有 `.health-*` 风格）。
- 测试：webapp `protocol.jest.test.js` 已用 `toContain`，新增类型不破坏；另在 `bridge.jest.test.js` 或新建 `aiImprove.jest.test.js` 断言点击按钮 `postMessage` 出 `app:aiImproveGoal`（jsdom 环境）。

### T4 插件编排 `requestAiImprove`
- `main.ts` 新增 `async requestAiImprove(p)`：
  1. `aiEnabled` 门禁：未开 → `Notice('先到设置里开启 AI 规划')` 返回。
  2. `storage.getGoals()`；空 → `Notice('你还没有目标')` 返回。
  3. 匹配：`goals.find(g => g.id === p.goalId) ?? goals.find(g => g.title === p.title)`；未命中 → `Notice('未在目标库中找到该目标')` 返回。
  4. 构建指令：
     ```
     请根据以下健康分诊断，优化目标「${title}」：
     ${hints || '（无具体提示，请结合该目标当前子项与进度自行诊断并改进）'}
     要求：保持量化铁律（纯数字 dailyMin、日颗粒度、可数代理指标），只做必要的增删改。
     ```
  5. `new AgenticPlanModal(this.app, { goals, initialInstruction: instruction, settings: plannerSettings, subtitle: 'AI 改进 · '+title, onConfirm: (g)=>void this.writeDiagnosedGoals(g) }).open()`。
- `DailyReviewView` 接线：构造 `appAPI` 后设
  `this.appAPI.onAiImproveGoal = (p) => (this.plugin as { requestAiImprove?: (q:typeof p)=>void }).requestAiImprove?.(p);`

---

## 4. YAGNI（本计划明确不做）
- ❌ 不改 webapp `GoalHealthScore` 算法（仍只「发现」）。
- ❌ 不做 MVP-2 一键批量（仍逐条人审，复用诊断闭环语义）。
- ❌ 不新增任何 postMessage 字段类型以外的协议（纯复用既有 `app:` 通道 + `AgenticPlanModal`）。
- ❌ 不做 webapp 侧直接改树（必须经插件 `AgenticPlanModal` 人审，最后闸门不变）。

---

## 5. 风险与缓解
- **目标匹配失败**：webapp 目标恒带 `id`（`data-goal-id` 通用）；回退 title 匹配，仍未命中才 Notice，不崩。
- **AI 误改**：`validateGoals` + 树状 diff 人审，最后闸门不变。
- **协议失配**：`app:aiImproveGoal` 已入双向 `APP_MESSAGE_TYPES`/`ALL_MESSAGE_TYPES`，版本协商机制照常生效。

---

## 6. 测试策略（TDD，每任务红→绿→commit）
- 纯逻辑/路由优先：T1/T2 的 `aiImprove.test.ts`（mock `onMessage` 断言回调 + 来源/字段校验）。
- webapp：协议 `toContain` 不破坏；`aiImprove.jest.test.js` 断言按钮 `postMessage` 正确 type/payload（jsdom）。
- 验证闸门：`npx vitest run`（host）+ webapp `npm test`（jest）+ `tsc --noEmit` + `eslint` + `sync.sh`（构建/同步/CSS 令牌门禁）。
