# 竹林修仙传（Bamboo Immortals）UI 全面审计报告（已修正）

**审计日期：** 2026-07-30  
**审计范围：** Obsidian 插件本体 + webapp 全量 UI/CSS/前端代码  
**审计目标：** 识别视觉一致性、可维护性、性能、可访问性、响应式与交互体验层面的问题，输出可执行的修复建议与优先级。

---

## 1. 执行摘要

本次审计覆盖 `src/`（插件本体）与 `webapp/`（独立界面）两大模块，涉及 24 个 CSS 文件、2 个 HTML 入口、以及多个 JS/TS 渲染/交互文件。项目在视觉风格、z-index 层级管理、Reduced Motion 适配、FAB 边界检测、搜索高亮等方面已有较好基础；但全局性 CSS 技术债务（尤其是 `transition: all`）和部分可访问性细节仍需治理。

### 关键量化数据

| 指标 | 数量 | 风险等级 | 说明 |
|------|------|----------|------|
| `transition: all` | **0 处**（已治理） | P0 | 24 个 CSS 文件已全部替换为具体属性；lint 已加 R9 门禁 |
| `outline: none` | **49 处**（均已审查） | P1 | 全部与 `:focus-visible`、`:focus`+box-shadow 或 `:focus:not(:focus-visible)` 配套，无裸用 |
| 硬编码 `white/black` | **10 处** | P2 | 均为 tooltip 白色文字，带 `lint-disable` 设计意图 |
| `!important` | **2 处** | 低 | 控制良好 |
| `prefers-reduced-motion` | **16 处** | 正面 | 动画可访问性已有基础 |
| `focus-visible` | **17 处** | 正面 | 焦点管理体系已有基础 |
| `contain` | **6 处** | 正面 | 性能隔离已有部分应用 |

### 风险等级定义

| 等级 | 含义 | 修复建议 |
|------|------|----------|
| P0 | 影响功能可用或造成明显视觉/性能回归 | 立即修复 |
| P1 | 影响体验一致性或可访问性 | 当前迭代修复 |
| P2 | 细节优化与技术债务 | 排入后续迭代 |

---

## 2. 审计范围

### 已审查文件清单

#### 插件本体（`src/`）

- `src/views/DailyReviewView.ts` — 视图容器、iframe/Shadow DOM 注入
- `src/bridge/ThemeBridge.ts` — 主题同步、颜色解析与注入
- `src/settings/PluginSettings.ts` — 设置面板 UI
- `src/ai/GoalElicitorModal.ts` — AI 目标澄清弹窗
- `styles.css` — 插件级全局样式

#### Webapp（`webapp/`）

- `webapp/index.html`
- `webapp/app.html`
- `webapp/assets/styles/*.css`（24 个样式文件）
- `webapp/assets/scripts/renderers/renderers.js`
- `webapp/assets/scripts/renderers/renderScheduler.js`
- `webapp/assets/scripts/handlers/handlers.js`
- `webapp/assets/scripts/handlers/fabManager.js`
- `webapp/assets/scripts/modules/goals/inlineEditService.js`

---

## 3. 项目已有的正向实践

在列出待修复问题前，先记录项目已做好的部分，避免重复投入或低估现有基础。

### 3.1 统一的 z-index 层级体系

`variables.css:29-41` 定义了完整的 `--z-layer-*` 变量体系，并明确注释「禁止再写裸数字」。弹窗、toast、overlay、tooltip 等层级清晰，是良好的工程实践。

### 3.2 Reduced Motion 适配

全项目共有 16 处 `@media (prefers-reduced-motion: ...)` 处理，分布在 `timeline.css`、`base.css`、`components-interaction.css` 等文件中。关键动画（如竹林生长、日期切换、FAB 展开）均已考虑系统降运动设置。

### 3.3 基础 focus-visible 体系

`base.css` 中已建立全局 `:focus-visible` 样式（`base.css:40-60`、`base.css:697-709`），并对 `:focus:not(:focus-visible)` 做了 outline 清理。后续只需查漏补缺，无需从零搭建。

### 3.4 FAB 边界检测与键盘导航

`fabManager.js` 已实现：

- 动态计算视口上下/左右可用空间，自动切换展开方向
- `aria-expanded`、`aria-label` 状态同步
- ArrowUp/Down/Left/Right、Home、End、Tab、Escape 键盘导航
- 打开时焦点移入首项，关闭时归还主按钮

### 3.5 CSS 包含隔离

`goals-map.css`（2 处）、`bamboo-garden.css`（2 处）、`base.css`（1 处）已使用 `contain` 属性限制重排/重绘范围。

---

## 4. 问题分类与详细发现

### 4.1 CSS 架构与可维护性

#### 4.1.1 硬编码色值与语义化变量缺失（P2）

**现象：** 全 `webapp/assets/styles` 目录中仅 10 处直接使用 `color: white` / `background: black` 等硬编码值，全部出现在 tooltip 场景，并带有 `/* lint-disable: R7 — tooltip 白色文字，设计意图 */` 注释。经量化，不存在普遍性的硬编码色值问题。

**分布：**

- `goals-editor.css`: 4 处
- `goals-map.css`: 3 处
- `timeline.css`: 2 处
- `components-interaction.css`: 1 处

**建议：**

1. 将 tooltip 白色文字统一为语义变量 `--text-inverse` 或 `--text-on-accent`，逐步移除 lint-disable。
2. 在 `lint-css-tokens.mjs` 中保留硬编码色值检测，但允许带设计意图注释的场景走审批流程。
3. 新增 `--surface-inverse` 等语义变量，为 tooltip 提供可主题化的背景色。

#### 4.1.2 CSS 变量层级与命名不一致（P1）

**现象：**

- 同一概念存在多个变量名：`--bamboo-primary`、`--primary`、`--interactive-accent`、`--accent-hue`。
- 部分组件使用 `--primary-rgb`，部分使用 `--bamboo-primary-rgb`。
- `variables.css` 与 `dark.css` 的变量声明顺序不同。

**建议：**

1. 统一命名空间：`--bm-{语义}` 或 `--bamboo-{语义}`，避免无前缀变量。
2. 将颜色变量收敛为「基础色板 + 语义色板 + 组件令牌」三层结构。
3. 引入 `stylelint` 规则禁止新增无命名空间变量。

#### 4.1.3 选择器权重与范围过大（P1）

**现象：**

- `webapp/assets/styles/base.css` 中常见 `button { ... }`、`input { ... }` 全局标签选择器重置。
- `webapp/assets/styles/forms.css` 中 `.form-input, .form-textarea, .form-select` 统一样式，但未考虑 Shadow DOM 外部污染风险。

**影响：**

- Shadow DOM 内部理论上已隔离，但 `styles.css` 中全局规则仍可能通过继承或 `:host` 穿透影响插件。
- 选择器宽泛导致后续覆盖需要更高权重，形成「权重竞赛」。

**建议：**

1. 重置样式限定在 `.bamboo-app *` 或 `:host` 作用域内。
2. 组件类名统一前缀，如 `.bm-btn`、`.bm-input`。
3. 禁止对裸标签设置 `margin`、`font-size`、`color` 等不可继承属性。

---

### 4.2 性能

#### 4.2.1 `transition: all` 滥用（P0）

**现象：**

经量化，`webapp/assets/styles` 目录中共有 **178 处** `transition: all`，遍布 24 个 CSS 文件。高频文件包括：

| 文件 | 次数 |
|------|------|
| `goals-map.css` | 24 |
| `goals-editor.css` | 22 |
| `modal-panels.css` | 21 |
| `date-nav.css` | 14 |
| `components-interaction.css` | 12 |
| `goals-stats.css` | 11 |
| `section-manager.css` | 9 |
| `modal-settings.css` | 7 |
| `modal-features.css` | 7 |
| `modal-base.css` | 6 |
| `fab.css` | 6 |

**影响：**

- 浏览器无法对「所有属性」做合成优化，滚动/缩放时触发频繁重绘。
- 与 `transform`、`opacity` 动画同时使用时会降低合成层效率。

**建议：**

1. 全部替换为具体属性：`transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease`。
2. 在 `lint-css-tokens.mjs` 中增加 `transition: all` 检测并标记为错误。
3. 对无需动画的属性（如 `border-color` 变化）单独声明过渡。
4. 按文件拆分修复任务，优先处理 `goals-map.css`、`goals-editor.css`、`modal-panels.css` 三个高频文件。

**修复状态：** 已修复（2026-07-30）。24 个 CSS 文件共 178 处 `transition: all` 已全部替换为具体属性组合；`scripts/lint-css-tokens.mjs` 新增 R9 `no-transition-all` 规则，当前 `npm run lint:css` 0 违规。

#### 4.2.2 `outline: none` 可访问性风险（P1）

**现象：**

全目录共有 **49 处** `outline: none`，分布：

| 文件 | 次数 |
|------|------|
| `goals-editor.css` | 16 |
| `modal-panels.css` | 8 |
| `goals-map.css` | 4 |
| `display.css` | 4 |
| `date-nav.css` | 4 |
| `modal-settings.css` | 3 |
| `base.css` | 3 |
| `weather-quotes.css` | 2 |
| `goals-widgets.css` | 2 |
| `modal-base.css` | 1 |
| `goals-health.css` | 1 |
| `fab.css` | 1 |

经逐行审查，49 处 `outline: none` 全部位于以下三类安全场景之一：
- `:focus-visible` 规则内部，使用 `box-shadow: var(--focus-ring)` 作为可见焦点环；
- `:focus` 规则内部，同时提供 `box-shadow` 或 `border-color` 作为焦点指示；
- `:focus:not(:focus-visible)` 全局清理规则。

不存在无配套焦点指示的裸用。

**建议：**

1. 后续新增 `outline: none` 必须配套 `:focus-visible` 或等效可见焦点环。
2. 在 lint 规则中禁止无配套焦点指示的 `outline: none`。

**修复状态：** 已审查（2026-07-30）。当前 49 处 `outline: none` 均有可见焦点环替代或位于 `:focus:not(:focus-visible)` 清理规则内，无裸用风险。

#### 4.2.3 未充分利用 `will-change` 与合成层策略（P2）

**现象：**

- 部分关键动画已加 `will-change`（如 `.modal-content`、date transition），但大量 hover/交互元素未做策略化管理。
- `will-change` 在静止状态未被移除，长期占用 GPU 内存。

**建议：**

1. 对频繁动画元素在动画开始前通过 JS 动态添加 `will-change`，动画结束后移除。
2. 建立 `will-change` 白名单，禁止在静态组件上常驻。
3. 推广 `contain: layout style paint` 到更多滚动容器。

#### 4.2.4 宽泛选择器与重排风险（P2）

**现象：**

- `base.css` 中 `*, *::before, *::after { box-sizing: border-box; }` 合理，但配合大量绝对定位元素与 `min-height: 100vh` 会触发整树重排。
- `.section`、`.container` 等容器使用 `width: 100%` + `max-width` 组合，窗口缩放时需要重新计算所有子元素。

**建议：**

1. 对长列表/滚动区域统一使用 `contain: layout style paint`。
2. 避免在 `resize` 事件中读取/写入会触发重排的属性，使用 `ResizeObserver` + `requestAnimationFrame` 节流。
3. 优先使用 `transform` 和 `opacity` 实现布局动画。

---

### 4.3 可访问性（a11y）

#### 4.3.1 模态框 ARIA 与焦点管理不完整（P1）

**现象：**

- `modal-base.css` 中 `.modal-overlay` / `.modal-content` 未设置 `role="dialog"`、`aria-modal="true"`、`aria-labelledby`。
- `GoalElicitorModal.ts` 中动态生成的 textarea、select 未绑定 `aria-describedby` 与错误提示。
- 多个自定义按钮（`.item-action-btn`、`.modal-close`）虽有基础样式，但部分未设置 `aria-label`。

**说明：** FAB 与搜索面板已具备基础 ARIA，问题集中在 Obsidian 弹窗与部分自定义组件。

**建议：**

1. 弹窗组件统一封装：`role="dialog"`、`aria-modal="true"`、打开时聚焦首焦、关闭时恢复焦点。
2. 图标按钮提供 `aria-label` 或隐藏文本。
3. 表单错误使用 `aria-invalid="true"` + `aria-describedby` 指向错误信息。
4. 实现 `FocusTrap` 工具，禁止 Tab 焦点逃逸出模态框。

**修复状态：** 已修复（2026-07-30）。新增 `webapp/assets/scripts/utils/focusTrap.js`，提供 `activate/deactivate/getFocusable` API，支持 Tab / Shift+Tab 循环与 Escape 回调，关闭时归还焦点到先前元素；`handlers.js` 已接入 `FocusTrap` 替换内联焦点陷阱；`GoalElicitorModal.ts` 为追问 textarea 增加 `aria-invalid` / `aria-describedby` 与动态错误提示，并在弹窗容器设置 `aria-labelledby` 关联标题。

#### 4.3.2 焦点管理不一致（P1）

**现象：**

- `modal-base.css` 中 `.form-input:focus` 有可见轮廓，但 `.btn:focus`、`.modal-close:focus` 未统一设置 `outline` 或 `box-shadow`。
- 部分 Obsidian 弹窗（如 `GoalElicitorModal`）打开后未显式管理焦点。

**建议：**

1. 所有可交互元素设置 `:focus-visible` 样式。
2. 弹窗打开时 `focus()` 到标题或第一个可交互元素；关闭时恢复触发源焦点。

**修复状态：** 已修复（2026-07-30）。`handlers.js` 的 `openModal` 保留首焦/关闭按钮回退与 `lastFocusedElement` 归还；`FocusTrap` 在 `deactivate` 时通过 `isConnected` 校验并归还焦点；`GoalElicitorModal.ts` 标题已设 id 并通过 `aria-labelledby` 与弹窗容器关联。

#### 4.3.3 颜色对比度风险（P1）

**现象：**

- 玻璃拟态背景（`rgba(var(--primary-rgb), 0.1)`）上叠加浅色文字，在部分壁纸/Obsidian 主题下对比度可能低于 4.5:1。
- `text-secondary` 等颜色未做对比度校验。

**建议：**

1. 使用 APCA 或 WCAG 对比度工具对所有 `text-secondary`、`text-muted` 与背景组合做校验。
2. 在 `ThemeBridge.ts` 同步 Obsidian 主题时增加对比度保护逻辑。
3. 为玻璃拟态卡片增加半透明遮罩层提升文字可读性。

**修复状态：** 已修复（2026-07-30）。`ThemeBridge.ts` 新增/公开 WCAG 对比度辅助方法 `luminance`、`contrastRatio`、`ensureContrast`（纯函数，不依赖 Obsidian API）；`computeObsidianVars` 中对 `textNormal` 与 `bgPrimary` 做 4.5:1、`textMuted` 与 `bgPrimary` 做 3:1 对比度校验，不满足时自动调整前景色明度；新增 `ThemeBridge.test.ts` 单测覆盖同灰度 1:1、黑白约 21:1、自动调整后满足 4.5:1 等场景。

---

### 4.4 响应式与移动端适配

#### 4.4.1 固定宽度与断点缺失（P1）

**现象：**

- `display.css`、部分 `.modal-content` 使用 `max-width: 90vw` 但缺少 `min()` 函数与断点调节。
- 时间轴、目标地图在 768px 以下未出现横向滚动或折叠策略，内容被挤压。
- 设置面板、统计弹窗在窄屏下出现水平滚动条。

**建议：**

1. 定义标准断点：`--bp-sm: 480px`、`--bp-md: 768px`、`--bp-lg: 1024px`。
2. 容器宽度使用 `min(100% - 2rem, var(--content-max))` 模式。
3. 时间轴/目标地图在窄屏下启用横向滚动或折叠为纵向卡片流。

**修复状态：** 已修复（2026-07-30）。`webapp/assets/styles/variables.css` 新增 `:host` 断点变量 `--bm-bp-sm: 480px`、`--bm-bp-md: 768px`、`--bm-bp-lg: 1024px` 与 `--content-max: 1200px`；`display.css` 主容器改用 `min(100% - 2rem, var(--content-max))`；`modal-panels.css`、`goals-map.css`、`timeline.css` 在 `@media (max-width: 768px)` 下将固定宽度面板/卡片改为 100% 宽度或启用横向滚动，时间轴统计栅格折叠为 2 列/1 列，目标地图子项允许折行；`goals-widgets.css` 中模板容器宽度使用 `min()` 收紧。`npm run lint:css`、`npm run build:webapp && npm run lint && npm test` 全部通过；`python3 scripts/browser-verify.py` 在 375×812 视口下验证文档 `scrollWidth == clientWidth`，生成的 3 张 375px 截图均无水平滚动条。

#### 4.4.2 触控区域过小（P1）

**现象：**

- `.item-action-btn`、`.modal-close`、部分复选框尺寸为 32–36px，接近但未稳定达到 44px 推荐值。
- 行内编辑触发区域（goal title、item name）未明确扩大触控热区。

**建议：**

1. 所有触控目标最小 44×44px；视觉上可小，但热区通过 `::before` 或 padding 扩展。
2. 行内编辑增加明确热区与 hover/focus 提示。
3. 在 `@media (pointer: coarse)` 下进一步放大按钮间距。

---

### 4.5 交互与用户体验

#### 4.5.1 日期切换与首屏渲染（P2）

**现状：**

- `renderScheduler.js` 已实现 `startDateTransition` 与 `firstPaintProgressive`，集成导航、手势、日期选择器、历史跳转 4 个入口。
- `goals-map.css` 已添加 `contain` 到滚动容器。

**待补：**

1. 在极低性能设备或大量目标（>200）场景下验证动画掉帧。
2. 日期切换过程中若用户连续快速点击，需要防抖/中断逻辑，避免动画队列堆积。
3. 首屏渐进渲染需处理「timeline 已渲染但 goals 尚未渲染」期间的骨架屏/占位高度，避免布局抖动（CLS）。

#### 4.5.2 行内编辑反馈不足（P1）

**现象：**

- `inlineEditService.js` 提交成功后仅调用 `renderSingleGoal` 或 `markSectionDirty`，缺少明确的保存成功/失败视觉反馈。
- 编辑框 Esc/Ctrl+Enter 等快捷键行为未在样式中体现提示。

**建议：**

1. 保存成功时显示短暂绿色闪烁或 Toast；失败时保留编辑框并高亮错误。
2. 在编辑框下方显示操作提示：`Enter 保存 · Esc 取消`。
3. 对 `currentValue`、`targetValue` 等数值输入增加范围校验即时反馈。

#### 4.5.3 主题切换与 Obsidian 同步存在延迟感（P2）

**现象：**

- `ThemeBridge.ts` 使用 `getComputedStyle` 读取 Obsidian 变量并反推色相，存在一帧延迟。
- 连续主题切换时可能因防抖定时器 `_paletteSyncTimer` 产生闪烁。

**建议：**

1. 缓存上一次解析结果，避免重复计算。
2. 在 iframe 加载时立即推送一次主题，减少首次渲染空白。
3. 使用 CSS 自定义属性级联切换，而非 JS 逐变量注入。

---

### 4.6 组件一致性

#### 4.6.1 按钮系统碎片化（P1）

**现象：**

- 存在 `.btn`、`.bamboo-elicit-btn`、`.modal-close`、`.item-action-btn` 多套按钮样式。
- 按钮尺寸、圆角、阴影、hover 位移不一致。

**建议：**

1. 统一按钮基础类 `.bm-btn`，定义 size variant（sm/md/lg）、style variant（primary/secondary/ghost/danger）、state（disabled/loading）。
2. 所有弹窗、表单、卡片中的按钮继承基础类，仅覆写布局属性。
3. 添加 `.bm-btn--loading` 状态。

#### 4.6.2 卡片/面板圆角与阴影不统一（P1）

**现象：**

- `.bamboo-card`、`.item-card`、`.empty-state-card`、`.modal-content` 使用不同圆角。
- 阴影变量使用场景混乱。

**建议：**

1. 定义卡片层级规范：基础卡片、可悬停卡片、浮动面板、高强调操作分别对应不同圆角与阴影。
2. 在 `variables.css` 注释中明确每个阴影的使用场景。

#### 4.6.3 图标系统依赖不统一（P2）

**现象：**

- 部分图标使用 Lucide，部分使用 emoji/字符，部分使用内联 SVG。
- `modal-base.css` 中直接对 `.modal-title svg`、`.modal-close svg` 设置宽高。

**建议：**

1. 统一图标入口 `Icon.render(name, options)`，统一尺寸（16/18/20/24）。
2. 所有 SVG 图标通过 `currentColor` 继承文字色。
3. 禁止在 CSS 中直接对 `svg` 标签设置尺寸。

---

### 4.7 暗色模式与主题

#### 4.7.1 暗色模式变量覆盖不完整（P1）

**现象：**

- `dark.css` 覆盖了主要变量，但部分组件（如 `goals-health.css`、`.swipe-hint`）仍使用日间变量，暗色下显示异常。
- `ThemeBridge.ts` 同步 `--interactive-accent` 到插件色相时，未处理暗色模式下饱和度/亮度差异。

**建议：**

1. 建立暗色模式审查清单，每次新增组件必须同时提供 dark variant。
2. 使用 `color-mix()` 或 HSL 函数根据明暗模式自动调整辅助色。
3. 在 CI 中增加暗色/浅色双主题截图对比。

#### 4.7.2 玻璃拟态可读性依赖背景（P2）

**现象：**

- 多处使用 `backdrop-filter: blur(...)` + 半透明背景，当 Obsidian 壁纸复杂时文字可读性下降。

**建议：**

1. 为背景层提供 fallback `background-color`。
2. 在玻璃卡片背后增加 `::before` 遮罩层提升对比度。
3. 考虑提供「高对比度」模式开关。

**修复状态：** 已修复（2026-07-30）。`webapp/assets/styles/variables.css` 新增 `--card-bg-fallback: var(--surface-solid)`（亮色 / 暗色均指向不透明表面色）；`webapp/assets/styles/base.css` 新增 `@supports not (backdrop-filter: blur(1px))` 规则，为 `.container`、`.bamboo-card`、`.modal-content`、`.skeleton-section` 等玻璃拟态容器在 backdrop-filter 不被支持或背景过透时切换回不透明 fallback 背景，保证文字对比度稳定，同时不破坏正常玻璃视觉效果。

---

### 4.8 浏览器验证实测发现（新增）

> 本节基于 2026-07-30 在 375×812 视口（iPhone SE 逻辑分辨率）下使用 Playwright + Chromium 的实测结果。

#### 4.8.1 已移除：未计划的 SearchUI 模块（原 P1 → 关闭）

**复核结论：**

- 经与产品确认，`SearchUI` 搜索功能不在当前产品计划内。
- 该模块为半成品/死代码：仅通过 `Ctrl+K` 或 `/` 快捷键唤起，无可见 UI 入口。
- 已在本次审计跟进中移除：
  - 删除 `webapp/assets/scripts/modules/search-ui.js`
  - 删除 `webapp/assets/scripts/services/searchService.js`
  - 删除 `webapp/assets/scripts/tests/searchService.jest.test.js`
  - 从 `index.html` 移除相关 `<script>` 引用
  - 从 `handlers.js` 移除 `Ctrl+K`/`/` 快捷键与 `open-search` 动作
  - 从 `store.js` 移除 `searchData()` 与 `SearchService.invalidateIndex` 调用
  - 从 `modal-panels.css` 移除 `.search-panel` 全部样式
  - 从 `store.jest.test.js` 移除搜索相关测试
  - 重新生成 `app.html`，`npm test` 与 `npm run lint` 均通过

**遗留检查：**

- toast、confirm dialog、tooltip 等动态浮层仍需统一挂载策略，避免直接 `document.body.appendChild` 导致 Shadow DOM 样式丢失。

#### 4.8.2 FAB 主按钮关闭逻辑冲突（P1）

**现象：**

- `fabManager.js:104-137` 同时监听 `mousedown` 与 `click`：
  - `mousedown`：若菜单已打开则调用 `close()`。
  - `click`：调用 `toggle()`。
- 在菜单打开状态下点击主按钮，`mousedown` 先关闭菜单，`click` 随后再次 `toggle()` 将菜单打开，导致用户无法通过点击主按钮关闭菜单。
- 实测结果：通过 Escape 键可正常关闭；通过再次点击主按钮无法关闭。

**影响：**

- 触控用户无法按直觉关闭 FAB 菜单，只能点击外部或依赖 Escape。

**建议：**

1. 区分「拖拽起始」与「点击关闭」：`mousedown` 仅记录拖拽状态，不调用 `close()`；`click` 中根据 `hasMoved` 与 `isOpen` 状态决定是否关闭。
2. 关闭菜单时焦点归还主按钮的行为保持不变。

**修复状态：** 已修复（2026-07-30）。`fabManager.js` 中 `mousedown` 不再直接调用 `close()`，`click` 根据 `isOpen` 显式调用 `close()` 或 `open()`；浏览器验证新增「FAB menu close (click main button)」用例并通过。**[已修复]**

#### 4.8.3 ARIA 快照完整性（P1）

**现象：**

- 375px 实测 ARIA 快照共采集 100 个带 `role`/`aria-*` 的元素。
- `fabMain` 本身未出现在快照中（shadow root 内查询未命中），说明 `aria-label` 实际存在但快照脚本需穿透 shadow host 才能捕获。
- `skip-link` 在 shadow root 内存在，但屏幕阅读器在 Shadow DOM 下的浏览顺序需进一步实测。

**建议：**

1. 将 `fab-container` 的 `role="navigation"` 与 `aria-label` 加入 ARIA 回归测试。
2. 在 VoiceOver / NVDA 中实测 Tab 顺序：skip-link → 日期导航 → 内容区 → FAB → 弹窗。

---

## 5. 优先级矩阵

| 编号 | 问题 | 分类 | 优先级 | 影响面 | 修复成本 | 量化依据 |
|------|------|------|--------|--------|----------|----------|
| 1 | `transition: all` 滥用 | 性能 | P0 | 24 个 CSS 文件 | 中 | 0 处（已治理） |
| 2 | `outline: none` 裸用 | 可访问性 | P1 | 12 个 CSS 文件 | 中 | 0 处裸用（49 处均已审查，均有焦点环替代） |
| 3 | 模态框 ARIA 与焦点管理 | 可访问性 | P1 | 全局组件 | 中 | 已修复（FocusTrap + aria-invalid/describedby） |
| 4 | 颜色对比度风险 | 可访问性 | P1 | 主题/玻璃拟态 | 中 | 已修复（ThemeBridge 4.5:1/3:1 自动校验 + 单测） |
| 5 | 固定宽度与断点缺失 | 响应式 | P1 | 布局系统 | 中 | 已修复（--bm-bp-* 断点变量 + min() 容器 + 375px 无水平滚动条） |
| 6 | 触控区域过小 | 响应式 | P1 | 移动端 | 低 | 多处 <44px |
| 7 | CSS 变量命名不一致 | CSS 架构 | P1 | 全局 CSS | 中 | 多命名空间混用 |
| 8 | 选择器权重过大 | CSS 架构 | P1 | 全局 CSS | 中 | 全局标签选择器 |
| 9 | 行内编辑反馈不足 | 交互 | P1 | Goals 模块 | 低 | 无保存反馈 |
| 10 | 按钮系统碎片化 | 组件一致性 | P1 | 全局组件 | 中 | 多套按钮类 |
| 11 | 卡片/面板圆角阴影不统一 | 组件一致性 | P1 | 全局 CSS | 低 | 变量使用混乱 |
| 12 | 暗色模式覆盖不完整 | 主题 | P1 | 全局 CSS | 中 | 部分组件未覆盖 |
| 13 | 硬编码 tooltip 白色文字 | CSS 架构 | P2 | 4 个 CSS 文件 | 低 | 10 处，均带 lint-disable |
| 14 | will-change 策略缺失 | 性能 | P2 | 动画相关 | 低 | 部分已使用 |
| 15 | 日期切换边界测试不足 | 交互 | P2 | Timeline/Goals | 中 | 需压力测试 |
| 16 | 主题同步延迟感 | 主题 | P2 | ThemeBridge | 中 | 一帧延迟 |
| 17 | 图标系统不统一 | 组件一致性 | P2 | 全局组件 | 中 | 多源混用 |
| 18 | 玻璃拟态可读性依赖背景 | 主题 | P2 | 全局 CSS | 低 | 已修复（--card-bg-fallback + @supports not backdrop-filter） |
| 19 | 全局选择器重排风险 | 性能 | P2 | 布局系统 | 中 | 需逐步优化 |

---

## 6. 修复建议与路线图

### 第一阶段：立即可修复（P0，2–3 天）

1. **禁用 `transition: all`**
   - 全局 178 处已按文件拆分并全部替换为具体属性；`lint-css-tokens.mjs` 新增 R9 规则防止回潮。
   - 当前 `transition: all` 数量为 0。
   - 在 `lint-css-tokens.mjs` 增加禁止规则。

### 第二阶段：架构治理（P1，1 周）

1. **`outline: none` 风险审查**
   - 逐处检查 49 个 `outline: none`，确认均有 `:focus-visible`、box-shadow 或 `:focus:not(:focus-visible)` 配套。
2. **模态框 ARIA 与焦点管理**
   - 统一弹窗封装：`role`、`aria-modal`、`aria-labelledby`、焦点陷阱。
3. **CSS 变量与命名空间统一**
   - 制定 `--bm-*` 命名规范。
4. **响应式断点与触控优化**
   - 定义标准断点变量，触控目标 ≥44px。
5. **组件体系重构**
   - 统一按钮、输入框、卡片、弹窗基础类。

### 第三阶段：体验打磨（P2，2 周）

1. tooltip 硬编码色值语义化。
2. 主题同步性能优化。
3. 图标系统统一。
4. 日期切换压力测试与骨架屏。
5. 暗色模式与高对比度模式完善。

---

## 7. 附录：文件与变量速查

### 7.1 高风险 CSS 规则（已量化）

| 文件 | transition: all | outline: none | 硬编码白/黑 |
|------|-----------------|---------------|-------------|
| `goals-editor.css` | 0 | 16 | 4 |
| `modal-panels.css` | 0 | 8 | 0 |
| `goals-map.css` | 0 | 4 | 3 |
| `display.css` | 0 | 4 | 0 |
| `date-nav.css` | 0 | 4 | 0 |
| `modal-settings.css` | 0 | 3 | 0 |
| `base.css` | 0 | 3 | 0 |
| `weather-quotes.css` | 0 | 2 | 0 |
| `goals-widgets.css` | 0 | 2 | 0 |
| `modal-base.css` | 0 | 1 | 0 |
| `goals-health.css` | 0 | 1 | 0 |
| `fab.css` | 0 | 1 | 0 |
| 其他 12 个文件 | 0 | 0 | ≤1 |

### 7.2 需要补充 ARIA 的组件

- `.modal-overlay`（Obsidian/webapp 弹窗统一）
- `GoalElicitorModal` 动态表单控件
- `.item-action-btn`
- `.goal-row`（行内编辑状态）

### 7.3 推荐新增变量

```css
/* 语义色板 */
--bm-text-on-accent: var(--white);
--bm-text-inverse: var(--white);
--bm-surface-inverse: var(--black);
--bm-focus-ring: 0 0 0 3px rgba(var(--primary-rgb), 0.25);

/* 响应式断点 */
--bm-bp-sm: 480px;
--bm-bp-md: 768px;
--bm-bp-lg: 1024px;

/* 层级阴影 */
--bm-shadow-surface: 0 1px 2px rgba(0,0,0,0.05);
--bm-shadow-card: 0 4px 12px rgba(0,0,0,0.08);
--bm-shadow-floating: 0 12px 32px rgba(0,0,0,0.12);
```

---

## 8. 浏览器验证结果摘要

2026-07-30 使用 Playwright 在 375×812 视口下完成实测，测试脚本位于 `scripts/browser-verify.py`，结果与截图保存于 `docs/browser-verify-output/`。

| 检查项 | 状态 | 说明 |
|--------|------|------|
| Shadow host 挂载 | 通过 | `#bamboo-shadow-host` 存在且内容在 shadow root 内。 |
| 375px 首屏截图 | 通过 | 页面无水平滚动，FAB、日期导航、内容区可见。 |
| FAB 主按钮 ARIA | 通过 | `aria-expanded`、`aria-label`、`aria-controls` 齐全。 |
| FAB 菜单展开 | 通过 | 10 个 `menuitem` 正常渲染，375px 下未超出视口。 |
| FAB 菜单关闭（Escape / 点击主按钮） | 通过 | Escape 键与再次点击主按钮均可关闭；4.8.2 已修复。 |
| 设置弹窗 | 通过 | `.fab-panel` 在 375px 下自适应，关闭正常。 |
| 行内编辑 | 未覆盖 | 独立浏览器缺少 Obsidian Vault 数据，目标列表未渲染；需在真实插件环境中补测。 |
| ARIA 快照 | 部分通过 | 100 个带 ARIA 属性的元素被采集；`skip-link` 与 live region 存在，但 FAB 主按钮未在快照中命中，需优化测试脚本穿透 shadow host。 |

## 9. 后续审计 Checklist

已将本次评审发现、正向实践、量化指标、lint-disable 意图、Shadow DOM 挂载一致性、375px 实测项等纳入 `docs/ui-audit-checklist.md`，作为后续 UI 审计的必查项。

## 10. 结论

竹林修仙传在视觉风格上已具备鲜明特色，且在 z-index 管理、Reduced Motion、FAB 边界检测等方面已有扎实基础。本次 375px 浏览器验证额外暴露出两个需要立即关注的问题：**未计划的 SearchUI 模块在 Shadow DOM 下挂载异常**（已按产品决策移除），以及 **FAB 主按钮点击关闭逻辑冲突**。

全局 **178 处 `transition: all` 已治理为 0**；**49 处 `outline: none` 已逐行审查，均无裸用风险**。当前剩余工作集中在模态框 ARIA 补齐、CSS 变量命名空间与组件一致性重构。建议按三阶段路线图推进，并在修复后通过屏幕阅读器与 375px 视口实测验证，对照 `docs/ui-audit-checklist.md` 逐项过检。
