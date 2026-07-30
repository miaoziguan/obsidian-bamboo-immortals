# UI 审计修复执行计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 根据 `docs/ui-audit-report-2026-07-30.md` 逐项修复 P0–P2 UI/CSS/可访问性问题，保证每次修改后 `npm run lint` 与 `npm test` 通过，并更新审计文档状态。

**Architecture：** 按「先 P0 性能债 → 再 P1 可访问/响应式/组件一致性 → 最后 P2 细节优化」的顺序推进；CSS 改动优先用具体属性替换和语义变量，JS 改动聚焦焦点管理与事件逻辑，所有变更需通过 375px 浏览器验证。

**Tech Stack：** 纯 CSS/JS（Obsidian 插件 webapp），esbuild 打包，Jest 测试，Playwright 375px 验证。

## Global Constraints

- 不引入新的外部依赖。
- 不修改 Vault 数据层逻辑。
- 保持 Shadow DOM 隔离，动态浮层统一挂载到 shadow root。
- 每次任务完成后必须执行：`npm run build:webapp && npm run lint && npm test`。
- 更新 `docs/ui-audit-report-2026-07-30.md` 中对应条目的状态与量化数据。

---

## Task 1: 修复 FAB 主按钮点击关闭逻辑冲突（P1，浏览器验证遗留）

**Files：**
- Modify: `webapp/assets/scripts/handlers/fabManager.js`
- Test: `webapp/assets/scripts/tests/`（如有 FAB 测试则补充，否则通过浏览器验证）

**Interfaces：**
- Consumes: `FABManager.open()`, `FABManager.close()`, `fabMain` mousedown/click 事件
- Produces: 修复后的 `mousedown` 不直接 `close()`，`click` 根据 `hasMoved` 与 `isOpen` 决定 toggle/close

- [ ] **Step 1: 在 `fabManager.js` 添加拖拽状态标记**
  - `mousedown` 中仅记录起始坐标与 `hasMoved = false`，不调用 `close()`。
  - `mousemove` 中若移动超过阈值设置 `hasMoved = true`。
  - `click` 中判断：`hasMoved` 为真则忽略；`isOpen` 为真则 `close()`，否则 `open()`。
- [ ] **Step 2: 验证关闭行为**
  - 运行 `python3 scripts/browser-verify.py`，确认 FAB 菜单展开后点击主按钮可关闭。
- [ ] **Step 3: 运行 lint + test**
  - `npm run lint && npm test`
- [ ] **Step 4: 更新报告 4.8.2 状态**
  - 在 `docs/ui-audit-report-2026-07-30.md` 4.8.2 末尾添加「已修复」标记。

---

## Task 2: 全局治理 `transition: all`（P0）

**Files：**
- Modify: `webapp/assets/styles/*.css`（24 个文件中的 178 处）
- Modify: `scripts/lint-css-tokens.mjs`（新增检测规则）

**Interfaces：**
- Consumes: 现有 CSS 过渡声明
- Produces: 仅声明具体属性的 `transition`；lint 规则禁止新增 `transition: all`

- [ ] **Step 1: 统计高频文件**
  - `rg "transition:\s*all" webapp/assets/styles -n` 确认当前分布。
- [ ] **Step 2: 按文件批量替换**
  - `goals-map.css`（24 处）→ 替换为 `transform, opacity, box-shadow, border-color, background-color` 等具体属性。
  - `goals-editor.css`（22 处）→ 同上。
  - `modal-panels.css`（21 处）→ 同上。
  - 其余文件按风险从高到低处理。
- [ ] **Step 3: 在 lint 脚本中禁止 `transition: all`**
  - 在 `scripts/lint-css-tokens.mjs` 中新增检测项，返回非零退出码。
- [ ] **Step 4: 验证**
  - `npm run lint:css` 目标：0 处 `transition: all`。
  - `npm run build:webapp && npm run lint && npm test`
- [ ] **Step 5: 更新报告量化数据**
  - 报告 4.2.1、优先级矩阵第 1 项、checklist 1.2 中 transition: all 数量改为 0。

---

## Task 3: 审查并修复 30 处 `outline: none`（P1）

**Files：**
- Modify: `webapp/assets/styles/goals-editor.css`, `modal-panels.css`, `base.css`, `modal-settings.css`, `goals-map.css`, `display.css`, `date-nav.css` 等

**Interfaces：**
- Consumes: 现有 `:focus` / `outline: none` 规则
- Produces: 裸用 `outline: none` 补充 `:focus-visible` 或 `box-shadow` 焦点环

- [ ] **Step 1: 列出所有命中项**
  - `rg "outline:\s*none" webapp/assets/styles -n`
- [ ] **Step 2: 分类处理**
  - 已与 `:focus-visible` 配套或 `:focus:not(:focus-visible)` 的保留。
  - 裸用处补充：`.selector:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }`。
- [ ] **Step 3: 验证**
  - `npm run lint:css` 通过。
  - 375px 浏览器验证中 Tab 遍历可看到焦点环。
- [ ] **Step 4: 更新报告**
  - 报告 4.2.2、优先级矩阵第 2 项、checklist 1.2 中说明 30 处均已审查。

---

## Task 4: 模态框 ARIA 与焦点管理（P1）

**Files：**
- Modify: `webapp/assets/styles/modal-base.css`
- Modify: `src/ai/GoalElicitorModal.ts`
- Modify: `webapp/assets/scripts/handlers/handlers.js`
- Create: `webapp/assets/scripts/utils/focusTrap.js`（如不存在）

**Interfaces：**
- Consumes: `.modal-overlay`, `.modal-content`, 表单错误元素
- Produces: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, FocusTrap 工具

- [ ] **Step 1: CSS 层面补齐弹窗 ARIA 属性**
  - `.modal-content` 添加 `role="dialog"`, `aria-modal="true"`。
- [ ] **Step 2: `Handlers.openModal` 动态注入 `aria-labelledby`**
  - 生成唯一 title id 并设置 `aria-labelledby`。
- [ ] **Step 3: 创建 `FocusTrap` 工具**
  - 捕获 Tab，循环焦点于弹窗内；Shift+Tab 反向。
- [ ] **Step 4: `GoalElicitorModal` 表单错误关联**
  - `aria-invalid="true"` + `aria-describedby` 指向错误信息。
- [ ] **Step 5: 验证**
  - `npm test`；在浏览器验证中检查弹窗 ARIA 属性。
- [ ] **Step 6: 更新报告 4.3.1 / 4.3.2**

---

## Task 5: 颜色对比度保护（P1）

**Files：**
- Modify: `src/bridge/ThemeBridge.ts`
- Modify: `webapp/assets/styles/variables.css`（如需要）

**Interfaces：**
- Consumes: Obsidian 主题变量，玻璃拟态背景
- Produces: 对比度保护后的 text-secondary/text-muted 颜色

- [ ] **Step 1: 在 `ThemeBridge.ts` 增加对比度校验函数**
  - 对 `text-secondary`、`text-muted` 与背景组合做 WCAG 4.5:1 校验。
  - 不满足时自动提升明度/饱和度。
- [ ] **Step 2: 为玻璃拟态卡片添加 fallback 遮罩**
  - 在相关 CSS 中增加 `::before` 半透明遮罩或 fallback `background-color`。
- [ ] **Step 3: 验证**
  - 在明暗主题下截图，使用浏览器对比度工具抽样检查。
- [ ] **Step 4: 更新报告 4.3.3 / 4.7.2**

---

## Task 6: 响应式断点系统（P1）

**Files：**
- Modify: `webapp/assets/styles/variables.css`
- Modify: `webapp/assets/styles/display.css`, `modal-panels.css`, `goals-map.css`, `timeline.css`

**Interfaces：**
- Consumes: 现有固定宽度、max-width 规则
- Produces: `--bm-bp-sm/md/lg` 变量与 `min()` 宽度模式

- [ ] **Step 1: 在 `variables.css` 定义标准断点变量**
  - `--bm-bp-sm: 480px`, `--bm-bp-md: 768px`, `--bm-bp-lg: 1024px`。
- [ ] **Step 2: 替换固定宽度容器**
  - `width: min(100% - 2rem, var(--content-max))`。
- [ ] **Step 3: 为时间轴/目标地图添加窄屏策略**
  - 768px 以下启用横向滚动或纵向卡片流。
- [ ] **Step 4: 验证**
  - 375px 浏览器验证无水平滚动条。
- [ ] **Step 5: 更新报告 4.4.1**

---

## Task 7: 触控目标 44×44px（P1）

**Files：**
- Modify: `webapp/assets/styles/components-interaction.css`, `goals-map.css`, `modal-*.css`

**Interfaces：**
- Consumes: `.item-action-btn`, `.modal-close`, 复选框，行内编辑触发区
- Produces: 最小 44×44px 触控热区

- [ ] **Step 1: 检查所有 < 44px 的交互元素**
  - 重点检查 32–36px 的按钮/复选框。
- [ ] **Step 2: 通过 padding 或 `::before` 扩展热区**
  - 视觉可保持原尺寸，热区扩展到 44×44px。
- [ ] **Step 3: `@media (pointer: coarse)` 下加大间距**
- [ ] **Step 4: 验证**
  - 375px 浏览器验证中点击稳定。
- [ ] **Step 5: 更新报告 4.4.2**

---

## Task 8: CSS 变量命名空间统一（P1）

**Files：**
- Modify: `webapp/assets/styles/variables.css`, `dark.css`, 以及所有引用 `--primary` / `--bamboo-primary` / `--interactive-accent` 的文件
- Modify: `scripts/lint-css-tokens.mjs`

**Interfaces：**
- Consumes: 混用的 `--primary`, `--bamboo-primary`, `--interactive-accent`, `--primary-rgb`, `--bamboo-primary-rgb`
- Produces: 统一为 `--bm-{语义}` 或 `--bamboo-{语义}` 的变量体系

- [ ] **Step 1: 梳理当前变量映射**
  - `rg "--(bamboo-)?primary" webapp/assets/styles -n`。
- [ ] **Step 2: 统一命名空间**
  - 保留一个权威名称，其余添加 alias（不破坏现有引用）。
  - 新增变量必须带 `--bm-*` 或 `--bamboo-*` 前缀。
- [ ] **Step 3: lint 禁止新增无前缀变量**
- [ ] **Step 4: 验证**
  - `npm run lint:css`。
- [ ] **Step 5: 更新报告 4.1.2**

---

## Task 9: 选择器作用域收敛（P1）

**Files：**
- Modify: `webapp/assets/styles/base.css`, `forms.css`

**Interfaces：**
- Consumes: `button { ... }`, `input { ... }` 等全局标签选择器
- Produces: 限定在 `.bamboo-app *` 或 `:host` 作用域内的重置

- [ ] **Step 1: 将裸标签重置限定作用域**
  - `base.css` 中全局 reset 保持不变（`box-sizing` 等合理项）。
  - 对 `margin`, `font-size`, `color` 等不可继承属性加 `.bamboo-app` 或 `:host` 前缀。
- [ ] **Step 2: 验证**
  - `npm run lint:css`。
- [ ] **Step 3: 更新报告 4.1.3**

---

## Task 10: 行内编辑反馈增强（P1）

**Files：**
- Modify: `webapp/assets/scripts/modules/goals/inlineEditService.js`
- Modify: `webapp/assets/styles/goals-editor.css`

**Interfaces：**
- Consumes: `renderSingleGoal`, `markSectionDirty`, 编辑框 DOM
- Produces: 保存成功/失败视觉反馈，操作提示，数值范围校验

- [ ] **Step 1: 保存成功时显示绿色闪烁/Toast**
- [ ] **Step 2: 保存失败时保留编辑框并高亮错误**
- [ ] **Step 3: 在编辑框下方显示 `Enter 保存 · Esc 取消` 提示**
- [ ] **Step 4: 对 currentValue/targetValue 增加即时范围校验**
- [ ] **Step 5: 验证**
  - `npm test`；浏览器验证行内编辑场景。
- [ ] **Step 6: 更新报告 4.5.2**

---

## Task 11: 按钮系统统一（P1）

**Files：**
- Modify: `webapp/assets/styles/components-interaction.css` 或 `base.css`
- Modify: 所有使用 `.btn`, `.bamboo-elicit-btn`, `.modal-close`, `.item-action-btn` 的 HTML/JS 渲染代码

**Interfaces：**
- Consumes: 现有各类按钮类
- Produces: `.bm-btn` 基础类 + size/style/state 变体

- [ ] **Step 1: 定义 `.bm-btn` 基础类与变体**
  - `.bm-btn--sm/md/lg`, `.bm-btn--primary/secondary/ghost/danger`, `.bm-btn--loading`。
- [ ] **Step 2: 逐步替换旧类名**
  - 优先替换弹窗、表单、卡片中的按钮。
- [ ] **Step 3: 验证**
  - 375px 浏览器验证按钮样式一致。
- [ ] **Step 4: 更新报告 4.6.1

---

## Task 12: 卡片/面板圆角与阴影统一（P1）

**Files：**
- Modify: `webapp/assets/styles/variables.css`, 所有 `.bamboo-card`, `.item-card`, `.empty-state-card`, `.modal-content` 样式文件

**Interfaces：**
- Consumes: 现有不同圆角/阴影值
- Produces: 分层的 `--radius-card`, `--radius-panel`, `--shadow-card`, `--shadow-floating` 等语义变量

- [ ] **Step 1: 在 `variables.css` 定义层级变量**
- [ ] **Step 2: 替换硬编码圆角与阴影**
- [ ] **Step 3: 验证**
  - 视觉对比截图。
- [ ] **Step 4: 更新报告 4.6.2

---

## Task 13: 暗色模式覆盖补全（P1）

**Files：**
- Modify: `webapp/assets/styles/dark.css`
- Modify: `src/bridge/ThemeBridge.ts`

**Interfaces：**
- Consumes: 日间变量，暗色下异常组件
- Produces: 完整的 dark variant

- [ ] **Step 1: 审查 `goals-health.css`、`.swipe-hint` 等组件**
- [ ] **Step 2: 在 `dark.css` 补充缺失覆盖**
- [ ] **Step 3: `ThemeBridge.ts` 处理暗色下饱和度/亮度差异**
- [ ] **Step 4: 验证**
  - 明暗主题切换截图对比。
- [ ] **Step 5: 更新报告 4.7.1

---

## Task 14: tooltip 硬编码白色文字治理（P2）

**Files：**
- Modify: `webapp/assets/styles/goals-editor.css`, `goals-map.css`, `timeline.css`, `components-interaction.css`
- Modify: `webapp/assets/styles/variables.css`

**Interfaces：**
- Consumes: 10 处 `color: white` / `background: black`
- Produces: `--text-inverse`, `--surface-inverse` 等语义变量

- [ ] **Step 1: 新增语义变量**
- [ ] **Step 2: 替换 tooltip 中的硬编码色值**
- [ ] **Step 3: 移除 lint-disable 注释**
- [ ] **Step 4: 更新报告 4.1.1

---

## Task 15: `will-change` 动态策略（P2）

**Files：**
- Modify: 动画相关 CSS/JS（如 `.modal-content`、date transition、FAB 等）

**Interfaces：**
- Consumes: 常驻 `will-change`
- Produces: JS 在动画前后动态添加/移除 `will-change`

- [ ] **Step 1: 建立 `will-change` 白名单**
- [ ] **Step 2: 对关键动画元素在动画开始前添加、结束后移除**
- [ ] **Step 3: 更新报告 4.2.3

---

## Task 16: 日期切换边界与首屏 CLS（P2）

**Files：**
- Modify: `webapp/assets/scripts/renderers/renderScheduler.js`
- Modify: `webapp/assets/styles/*.css`

**Interfaces：**
- Consumes: `startDateTransition`, `firstPaintProgressive`
- Produces: 防抖/中断逻辑，骨架屏/占位高度

- [ ] **Step 1: 为快速连续点击添加防抖/中断**
- [ ] **Step 2: timeline 渲染后 goals 渲染前添加占位高度**
- [ ] **Step 3: 大量目标（>200）掉帧压力测试**
- [ ] **Step 4: 更新报告 4.5.1

---

## Task 17: 主题同步延迟优化（P2）

**Files：**
- Modify: `src/bridge/ThemeBridge.ts`

**Interfaces：**
- Consumes: `getComputedStyle`, `_paletteSyncTimer`
- Produces: 缓存解析结果，CSS 变量级联切换

- [ ] **Step 1: 缓存上一次解析结果**
- [ ] **Step 2: iframe 加载时立即推送一次主题**
- [ ] **Step 3: 使用 CSS 自定义属性级联而非逐变量注入**
- [ ] **Step 4: 更新报告 4.5.3

---

## Task 18: 图标系统统一（P2）与全局收尾

**Files：**
- Modify: 所有使用 Lucide/emoji/内联 SVG 的 JS/CSS
- Modify: `webapp/assets/styles/modal-base.css`

**Interfaces：**
- Consumes: 多源图标
- Produces: 统一 `Icon.render(name, options)` 入口

- [ ] **Step 1: 统一图标入口与尺寸（16/18/20/24）**
- [ ] **Step 2: SVG 使用 `currentColor`**
- [ ] **Step 3: 移除 CSS 中对 `svg` 标签的直接尺寸设置**
- [ ] **Step 4: 最终全量验证**
  - `npm run build:webapp && npm run lint && npm test`
  - `python3 scripts/browser-verify.py`
- [ ] **Step 5: 更新报告 4.6.3、结论与优先级矩阵状态**

---

## 执行建议

按 Task 1 → Task 2 → Task 3 → ... → Task 18 顺序推进。Task 2（transition: all）改动面最广，建议单独一个阶段；Task 4/5/6/7/10 涉及可访问与响应式，可并行但需避免冲突。每完成一个 Task 即提交一次 commit。
