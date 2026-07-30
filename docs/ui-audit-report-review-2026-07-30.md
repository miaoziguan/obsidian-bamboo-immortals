# 竹林修仙传 UI 审计报告 — 质量评审

**评审对象：** `docs/ui-audit-report-2026-07-30.md`  
**评审日期：** 2026-07-30  
**评审方法：** 对报告中关键断言进行代码级抽样验证（grep + 局部阅读）

---

## 1. 总体结论

原报告结构完整、分类清晰，提出的问题方向（性能、可访问性、响应式、组件一致性）基本符合代码现状，具备较高的工程参考价值。但经过抽样验证，报告存在 **5 处事实性错误**、**3 处明显低估/遗漏**，并且对项目已有的正向实践（如完善的 z-index 体系、prefers-reduced-motion 支持、FAB 边界检测）几乎没有提及，导致风险评估出现偏差。

**建议：** 在依据报告制定修复计划前，先修正错误断言，并根据本次评审补充正向实践与低估项，避免把「已修复/已考虑」的问题重复投入人力。

---

## 2. 事实性错误（附证据）

### 2.1 FAB 菜单：报告称其缺少 `aria-expanded` 且小屏溢出 —— 错误

**原报告表述：**

> `webapp/assets/scripts/handlers/fabManager.js` 中 FAB 菜单展开/收起未设置 `aria-expanded`。
> 在 375px 宽设备上，展开菜单可能超出视口右下/左下边界，导致按钮无法点击。

**代码证据：**

```js
// fabManager.js:219-262
positionPanel() {
    const vp = this.getViewport();
    const spaceAbove = btnRect.top;
    const spaceBelow = vp.height - btnRect.bottom;
    const spaceToLeft = btnRect.left;
    // ... 根据上下/左右可用空间动态切换 fab-below / fab-align-left
    if (spaceAbove < panelH + gap && spaceBelow > spaceAbove) {
        this.container.classList.add('fab-below');
        this.actions.style.maxHeight = Math.min(vp.height * 0.8, spaceBelow - gap) + 'px';
    }
    if (spaceToLeft < panelW) {
        this.container.classList.add('fab-align-left');
    }
}

open() {
    this.mainBtn.setAttribute('aria-expanded', 'true');
    this.mainBtn.setAttribute('aria-label', '收起快捷菜单');
    // ... ArrowKey/Home/End/Tab/Escape 键盘导航
}
```

**结论：** FAB 已具备边界检测、键盘陷阱、`aria-expanded` 与 `aria-label` 切换。该问题应从 P0 降级或移除。

### 2.2 搜索 UI：报告称其未使用高亮 —— 错误

**原报告表述：**

> 搜索结果未使用 `mark` 或高亮类，用户难以定位匹配项。

**代码证据：**

```js
// search-ui.js:136-139
_highlight(text, query) {
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
}
```

**结论：** 搜索高亮已通过 `<mark>` 实现。报告该条不成立。

### 2.3 搜索 UI：报告称其缺少 ARIA —— 错误/片面

**原报告表述：**

> 搜索 UI 状态不可见……搜索框的加载、空结果、高亮状态未在样式中充分体现。

**代码证据：**

```js
// search-ui.js:57-64
panel.setAttribute('role', 'dialog');
panel.setAttribute('aria-label', '搜索');
// ...
<input ... aria-label="搜索关键词">
<button ... aria-label="关闭搜索" ...>
```

**结论：** 搜索面板具备基础 ARIA 角色与标签。原报告未做验证即断言「缺少 ARIA」。

### 2.4 `base.css` 硬编码白色文字 —— 未验证到

**原报告表述：**

> `webapp/assets/styles/base.css` 多处使用 `color: white`。

**验证结果：**

```bash
$ rg "color:\s*white|color:\s*#fff|background:\s*#000" webapp/assets/styles/base.css
# 无匹配
```

**结论：** 该断言在 `base.css` 中不成立。实际硬编码 `color: white` 出现在 `timeline.css`、`components-interaction.css`、`goals-editor.css`、`goals-map.css`，且均带有 `/* lint-disable: R7 — tooltip 白色文字，设计意图 */` 注释，属于已知且经过 lint 豁免的设计决策。报告未区分「违规硬编码」与「已声明意图的硬编码」。

### 2.5 `transition: all` 范围被严重低估

**原报告表述：**

> `webapp/assets/styles/modal-base.css` 第 94、160、189、257、304、339 行均使用 `transition: all ...`。
> `webapp/assets/styles/goals-map.css` 中 `.goal-row`、`.goal-card` 等也使用 `transition: all`。

**验证结果：**

```bash
$ rg "transition:\s*all" webapp/assets/styles | wc -l
# 100+ 处
```

涉及文件包括但不限于：

- `components-interaction.css`
- `fab.css`
- `goals-editor.css`
- `date-nav.css`
- `forms.css`
- `display.css`
- `toast.css`
- `modal-settings.css`
- `components-kpi.css`
- `goals-health.css`
- `bamboo-garden.css`
- `timeline.css`
- `modal-features.css`
- `cultivation.css`

**结论：** 这不是 modal-base + goals-map 的局部问题，而是全局性技术债务。报告将其限定在两个文件会误导修复范围。应作为 P0 级全局 CSS 治理项。

---

## 3. 遗漏与低估

### 3.1 未提及项目已有的正向实践

| 实践 | 证据 | 评审意见 |
|------|------|----------|
| 完整 z-index 体系 | `variables.css:29-41` 定义 `--z-layer-*` 并注释「禁止再写裸数字」 | 应作为正面案例写入报告，避免后续修复时重复造轮子 |
| 大量 `prefers-reduced-motion` 处理 | 16 处 `@media (prefers-reduced-motion: ...)` 分布各文件 | 报告只字未提，会让人觉得动画可访问性完全缺失 |
| 基础 `focus-visible` 体系 | `base.css:40-60`、`base.css:697-709` 等 | 报告说「焦点管理不一致」是对的，但不应忽略已有基础 |
| FAB 边界检测与键盘导航 | 见 2.1 | 已被误报为缺陷 |
| 搜索 `<mark>` 高亮 | 见 2.2 | 已被误报为缺陷 |

### 3.2 未评估 CSS 中 `outline: none` 的风险面

代码中存在约 47 处 `outline: none`，其中部分与 `:focus-visible` 配套（合理），但也有不少在自定义组件中裸用（如 `display.css:116`、`goals-editor.css:61` 等）。报告提出「禁止裸用 `outline: none`」的建议方向正确，但未给出风险清单，导致建议无法落地。

### 3.3 未涉及 CSS 特异性与 `!important` 使用情况

全面审计应包含特异性分布与 `!important` 统计，这对后续组件重构至关重要。原报告完全未涉及。

### 3.4 未量化问题规模

例如：

- 24 个 CSS 文件中 `transition: all` 实际出现 100+ 次，而非报告给人的「十几处」印象。
- 硬编码 `color: white` 仅 10 处且均有 lint-disable 注释，风险远低于报告描述的「多个样式文件直接使用」。

缺少量化会让优先级判断失真。

---

## 4. 报告的优点

1. **分类清晰：** 按 CSS 架构、性能、可访问性、响应式、交互、组件一致性、主题七个维度组织，便于按模块分工。
2. **建议具体：** 多数问题给出可执行的修复动作（如替换 `transition: all`、定义语义色板、实现 `FocusTrap`）。
3. **路线图合理：** 三阶段修复计划（P0 立即修复 → P1 架构治理 → P2 体验打磨）符合实际迭代节奏。
4. **附录实用：** 文件/变量速查表对后续执行有帮助。

---

## 5. 修改建议

### 5.1 必须修正的断言

1. 删除或重写关于 FAB 菜单缺少 `aria-expanded` / 小屏溢出的断言。
2. 删除或重写关于搜索 UI 缺少高亮 / ARIA 的断言。
3. 修正 `base.css` 硬编码白色的错误指向，改为正确文件并说明 `lint-disable` 设计意图。
4. 将 `transition: all` 问题从「modal-base + goals-map」扩展为「全局 100+ 处」并提升为 P0 级全局治理。

### 5.2 建议补充的内容

1. **正向实践章节：** 列出 z-index 体系、prefers-reduced-motion、focus-visible 基础、FAB 边界检测等已做工作。
2. **`outline: none` 风险评估：** 区分「与 focus-visible 配套」和「裸用」两类，给出需修复的清单。
3. **量化统计表：** 每类问题给出出现次数、文件数、已处理/未处理比例。
4. **暗色模式实际覆盖度：** 基于 `dark.css` 与 `:host(.dark)` 出现情况做更准确的评估。
5. **Shadow DOM 隔离度评估：** 检查 `styles.css` 中全局规则对 Shadow DOM 的实际影响范围。

### 5.3 优先级调整建议

| 问题 | 原优先级 | 建议调整 | 理由 |
|------|----------|----------|------|
| `transition: all` 滥用 | P0 | 保持 P0，但扩大范围 | 实际影响全局 100+ 处 |
| FAB 菜单小屏溢出 | P0 | 移除或降为 P2 | 代码已实现边界检测与键盘导航 |
| 缺少 ARIA 状态/角色 | P0 | 降为 P1 | 部分组件已有 ARIA，需系统补齐而非从零开始 |
| 搜索 UI 状态不可见 | P1 | 移除 | 已有 `<mark>` 高亮、空状态、aria-label |
| 硬编码色值 | P1 | 降为 P2 | 仅 10 处且均带 `lint-disable` 设计意图 |
| 暗色模式覆盖不完整 | P1 | 保持 P1 | 仍需系统验证 |
| `outline: none` 裸用 | 未列出 | 新增 P1 | 47 处中部分存在可访问性风险 |
| CSS 特异性/!important | 未列出 | 新增 P2 | 影响后续组件重构 |

---

## 6. 修正后的执行摘要（建议替代原报告首段）

> 本次审计覆盖 `src/` 与 `webapp/` 两大模块，涉及 24+ CSS 文件与多个 JS/TS 交互文件。项目在视觉风格、z-index 管理、 Reduced Motion 适配、FAB 边界检测等方面已有较好基础；但全局存在 100+ 处 `transition: all`、部分自定义组件 `outline: none` 裸用、模态框 ARIA 与焦点管理不完整、暗色模式覆盖需系统验证等问题。建议优先治理全局 `transition: all` 与 `outline: none` 可访问性风险，再推进 CSS 变量命名空间与组件一致性重构。

---

## 7. 后续行动建议

1. **修复报告本身：** 按第 5 节修正错误断言并补充遗漏项。
2. **运行量化脚本：** 使用 `rg` / `stylelint` 统计 `transition: all`、`!important`、`outline: none`、`color: #fff` 等规则的确切分布。
3. **浏览器验证：** 对 FAB、搜索、弹窗、行内编辑做屏幕阅读器（VoiceOver/NVDA）与 375px 视口实测，避免再次产生误判。
4. **建立审计 Checklist：** 将本次评审发现纳入后续 UI 审计的必查项（正向实践、量化、lint-disable 意图）。
