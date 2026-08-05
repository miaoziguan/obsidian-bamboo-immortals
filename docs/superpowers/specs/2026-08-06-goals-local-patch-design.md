# Goals 区块局部差异更新（Local Patch）设计

日期：2026-08-06
状态：已批准
关联版本：下一个 patch（3.0.5）

## 目标

在「勾选/取消待办目标任务」时，避免 goals 区块（目标地图 + 健康分卡片）整块 innerHTML 重建，改为局部差异更新，提升高频交互的流畅度。**视觉与功能完全不变。**

## 背景

### 当前行为

勾选/取消待办 → `TodoService.toggle`（services/TodoService.js）：

```js
async toggle(todoId, type, goalId, itemIdx, isCompleted) {
    await GoalService.completeGoalTask(goalId, parseInt(itemIdx), store.getDateKey(), isCompleted);
    markSectionDirty('goals');      // 整块重建目标地图 + 健康分
    markSectionDirty('timeline');
    // todo 已走局部 patch（patchToggle）
}
```

`markSectionDirty('goals')` → `_doPartialRender` → `GoalsRenderer.render` **整块重建** `#goalList`（所有目标行 + 健康分卡片 + 底部按钮）。目标越多、子项目越多，重建成本越高。

### 数据变更范围（completeGoalTask 实际改了什么）

勾选/取消一个待办后，`completeGoalTask` 修改：

- 被勾选目标的 `progress`（总进度）
- 被勾选目标子项的 `currentValue` / `percent`（数值与进度）
- 健康分（L1 履约能力基于 dailyMin 完成度）

目标集合结构（顺序/数量）不变。其他目标不受影响。

### 现状：局部更新机制已内置

`GoalsRenderer` 已存在两个局部更新方法（供行内编辑使用）：

- `renderSingleGoal(goalId)`（renderer.js:143）：只重建**单个目标行**（`.goal-row[data-goal-id]`），用 `renderGoalView` 生成整行后 `replaceWith`。
- `refreshHealthCard()`（renderer.js:428）：只刷新健康分卡片（`#goalHealthOverviewHost`）。

两者都用容器级事件委托 + 防重复绑定，重绑开销极小。

## 方案

修改 `TodoService.toggle`，在 `completeGoalTask` 之后对 goals 走局部更新，失败回退全量：

```js
async toggle(todoId, type, goalId, itemIdx, isCompleted) {
    await GoalService.completeGoalTask(goalId, parseInt(itemIdx), store.getDateKey(), isCompleted);
    markSectionDirty('timeline');
    // todo 局部 patch（已有）
    let patched = false;
    if (typeof TodoRenderer !== 'undefined' && typeof TodoRenderer.patchToggle === 'function') {
        patched = TodoRenderer.patchToggle(todoId);
    }
    if (!patched) markSectionDirty('todo');
    // goals 局部 patch（新增）
    const goalsPatched = this._patchGoals(goalId);
    if (!goalsPatched) markSectionDirty('goals');
    if (!isCompleted && navigator.vibrate) navigator.vibrate(30);
}
```

### `_patchGoals(goalId)` 实现

```js
_patchGoals(goalId) {
    try {
        if (typeof GoalsRenderer === 'undefined') return false;
        // 仅当目标行已渲染且存在时走局部；否则回退全量
        const container = byId('goalList');
        if (!container) return false;
        if (!container.querySelector(`.goal-row[data-goal-id="${goalId}"]`)) return false;
        // 重建该目标行 + 刷新健康分
        GoalsRenderer.renderSingleGoal(goalId);
        if (typeof GoalsRenderer.refreshHealthCard === 'function') {
            GoalsRenderer.refreshHealthCard();
        }
        return true;
    } catch (e) {
        return false; // 任何异常回退全量
    }
}
```

### 回退机制

`_patchGoals` 返回 false 的情况（触发 `markSectionDirty('goals')` 全量）：
- goals 尚未渲染（`#goalList` 不存在）
- 目标行不存在（`.goal-row[data-goal-id]` 未找到，例如首次渲染或 DOM 被清）
- 任何异常（try/catch）

## 数据流

1. 用户勾选 checkbox → `todo-toggle` action → `Todo.toggle` → `TodoService.toggle`
2. `completeGoalTask` 完成数据变更（progress/currentValue/percent/健康分/竹币）
3. `TodoRenderer.patchToggle` 局部更新 todo（已有）
4. `_patchGoals(goalId)` 局部更新该目标行 + 健康分（新增）；失败回退 `markSectionDirty('goals')`
5. `markSectionDirty('timeline')` 全量更新 timeline（成本低，保持现状）

## 错误处理

- 所有局部更新失败场景统一回退 `markSectionDirty('goals')`，保证 UI 与数据一致。
- `renderSingleGoal` 无返回值，通过前置 `.goal-row[data-goal-id]` 检查判断可行性。

## 测试

更新 `webapp/assets/scripts/tests/business-flows.jest.test.js`（或新增用例），验证：

- 勾选待办后，被勾选目标的 DOM 正确更新（progress/percent）
- 健康分卡片被刷新
- 目标行不存在时回退全量（不抛异常）

## 不做的范围

- 不改 `renderSingleGoal` / `refreshHealthCard` 本身（现成机制）。
- 不做 timeline 局部更新（此前已评估：节点少，收益/风险比不佳，放弃）。
- 不做虚拟 DOM 级改造（过度工程）。
