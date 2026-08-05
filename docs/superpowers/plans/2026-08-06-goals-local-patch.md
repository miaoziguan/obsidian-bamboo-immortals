# Goals 区块局部差异更新 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在 `TodoService.toggle` 勾选/取消待办时，goals 区块走局部更新（`renderSingleGoal` + `refreshHealthCard`），避免整块重建；失败回退全量。

**架构：** 复用 `GoalsRenderer` 已内置的局部更新方法（`renderSingleGoal(goalId)` 重建单个目标行、`refreshHealthCard()` 刷新健康分）。`TodoService.toggle` 在 `completeGoalTask` 之后，先检查目标行 DOM 是否存在，存在则局部更新，否则回退 `markSectionDirty('goals')`。

**技术栈：** webapp ES modules（无框架），jest 测试。

**设计文档：** `docs/superpowers/specs/2026-08-06-goals-local-patch-design.md`

---

### 任务 1：修改 `TodoService.toggle` 接入 goals 局部更新

**文件：**
- 修改：`webapp/assets/scripts/services/TodoService.js`
- 测试：`webapp/assets/scripts/tests/business-flows.jest.test.js`

- [ ] **步骤 1：编写失败的测试**

在 `business-flows.jest.test.js` 中新增/更新测试，验证勾选待办后 goals 走局部更新（调用 `renderSingleGoal`），目标行 DOM 不存在时回退全量。当前 `TodoService.toggle` 总是 `markSectionDirty('goals')`，断言 `renderSingleGoal` 被调用会失败。

```js
test('勾选待办后 goals 走局部更新（renderSingleGoal + refreshHealthCard）', () => {
    // 构造 store + 已渲染的 goalList DOM
    // mock GoalsRenderer.renderSingleGoal / refreshHealthCard
    // 调用 TodoService.toggle
    // 断言 renderSingleGoal 被调用、且未 markSectionDirty('goals')
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx jest webapp --testPathPattern business-flows`
预期：新测试 FAIL（`renderSingleGoal` 未被调用）

- [ ] **步骤 3：实现 `TodoService.toggle` 局部更新**

```js
export const TodoService = {
    async toggle(todoId, type, goalId, itemIdx, isCompleted) {
        await GoalService.completeGoalTask(goalId, parseInt(itemIdx), store.getDateKey(), isCompleted);
        markSectionDirty('timeline');
        // todo 局部 patch（已有）
        let patched = false;
        if (typeof TodoRenderer !== 'undefined' && typeof TodoRenderer.patchToggle === 'function') {
            patched = TodoRenderer.patchToggle(todoId);
        }
        if (!patched) {
            markSectionDirty('todo');
        }
        // goals 局部 patch：复用 renderSingleGoal + refreshHealthCard，失败回退全量
        const goalsPatched = this._patchGoals(goalId);
        if (!goalsPatched) {
            markSectionDirty('goals');
        }
        if (!isCompleted && navigator.vibrate) {
            navigator.vibrate(30);
        }
    },

    /** goals 局部更新：仅重建被勾选目标行 + 刷新健康分；失败回退全量 */
    _patchGoals(goalId) {
        try {
            if (typeof GoalsRenderer === 'undefined') return false;
            const container = byId('goalList');
            if (!container) return false;
            if (!container.querySelector(`.goal-row[data-goal-id="${goalId}"]`)) return false;
            GoalsRenderer.renderSingleGoal(goalId);
            if (typeof GoalsRenderer.refreshHealthCard === 'function') {
                GoalsRenderer.refreshHealthCard();
            }
            return true;
        } catch (e) {
            return false;
        }
    }
};
```

注意：`byId` 需从 `domRef.js` 导入（若 TodoService 尚无该导入）。`GoalsRenderer` 通过全局 window 访问（`typeof GoalsRenderer !== 'undefined'`）。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx jest webapp --testPathPattern business-flows`
预期：PASS

- [ ] **步骤 5：运行全部 webapp 测试**

运行：`npx jest webapp`
预期：24 套件全绿

- [ ] **步骤 6：Commit**

```bash
git add webapp/assets/scripts/services/TodoService.js webapp/assets/scripts/tests/business-flows.jest.test.js
git commit -m "perf: goals 勾选待办走局部更新（renderSingleGoal + refreshHealthCard，失败回退全量）"
```

---

### 任务 2：验证构建并部署发版

**文件：** 无代码改动（仅构建产物 + 版本号）

- [ ] **步骤 1：lint 检查**

运行：`npm run build`（含 eslint）
预期：无错误

- [ ] **步骤 2：bump 版本到 3.0.5**

修改 `manifest.json` / `package.json` / `versions.json` 版本号 `3.0.4` → `3.0.5`

- [ ] **步骤 3：构建 + 部署到 vault**

```bash
npm run build
cp main.js manifest.json styles.css <vault>/plugins/bamboo-immortals/
cp webapp/app.html webapp/index.html webapp/archive.html <vault>/plugins/bamboo-immortals/webapp/
```

- [ ] **步骤 4：push main + tag + 触发 CI**

```bash
git -c http.proxy=http://127.0.0.1:7890 push origin main
git tag 3.0.5
git -c http.proxy=http://127.0.0.1:7890 push origin 3.0.5
```

- [ ] **步骤 5：确认 CI 成功 + Release 生成**
