# 竹林修仙传 UI 审计 Checklist

**适用范围：** Obsidian 插件本体（`src/`）+ webapp（`webapp/`）  
**审计频率：** 每次涉及 UI/CSS/交互 的迭代前自检，重大版本发布前全量审计  
**更新日期：** 2026-07-30

---

## 使用说明

- [ ] 表示必查项；未通过必须在本轮修复或记录技术债务。
- 每项后附「检查方法」，优先使用可量化脚本或 Playwright 截图，减少主观判断。
- 本次审计发现的共性问题已纳入清单，后续新增组件/弹窗/动画应逐项过检。

---

## 一、CSS 架构与可维护性

### 1.1 正向实践（必查）

- [ ] **z-index 必须使用变量**：禁止裸数字，统一使用 `--z-layer-*` 体系。
  - 检查方法：`rg "z-index:\s*[0-9]+" webapp/assets/styles src` 无命中（除变量外）。
- [ ] **颜色必须使用语义变量或 CSS 变量**：禁止硬编码 `#fff`、`#000`、`white`、`black`。
  - 例外：tooltip 等带 `lint-disable` 设计意图的场景需单独审批。
  - 检查方法：`rg "color:\s*(#fff|#ffffff|white|#000|#000000|black)" webapp/assets/styles`。
- [ ] **transition 必须声明具体属性**：禁止 `transition: all`。
  - 检查方法：`rg "transition:\s*all" webapp/assets/styles`，目标为 0。
- [ ] **CSS 变量命名空间统一**：新增变量必须带 `--bm-*` 或 `--bamboo-*` 前缀，禁止无前缀变量。
  - 检查方法：review diff 中所有新增 `--` 变量。
- [ ] **选择器作用域受限**：禁止对裸标签设置 `margin`、`font-size`、`color` 等不可继承属性。
  - 检查方法：重点检查 `base.css`、`forms.css` 中的全局选择器。

### 1.2 量化指标（必查）

- [x] **`transition: all` 总数 = 0**：已治理 178 处；新增必须通过 `lint-css-tokens.mjs` R9 门禁。
- [ ] **`!important` 总数 ≤ 2**：当前基线 2，新增必须说明理由。
- [x] **`outline: none` 均有 `:focus-visible` 或可见焦点环配套**：原基线 30 处，实际 28 处（SearchUI 移除后减少）；22 处裸用已补充 `:focus-visible { box-shadow: var(--focus-ring); }`。
  - 检查方法：`rg "outline:\s*none" webapp/assets/styles -n`，逐处确认配套。
- [ ] **硬编码十六进制色值总数趋势下降**：当前基线 98（含注释与 rgb hex）。
- [ ] **`prefers-reduced-motion` 覆盖新增动画**：任何新增 CSS/JS 动画必须同步提供降运动分支。

### 1.3 lint-disable 意图（必查）

- [ ] **所有 `lint-disable` 必须带设计意图注释**：格式示例 `/* lint-disable: R7 — tooltip 白色文字，设计意图 */`。
- [ ] **lint-disable 必须关联具体规则编号**：禁止写「临时关闭」「先这样吧」等模糊描述。
- [ ] **每季度复核 lint-disable 清单**：确认是否仍存在真实约束，或已可被语义变量替代。

---

## 二、可访问性（a11y）

### 2.1 屏幕阅读器与键盘（必查）

- [ ] **所有交互元素具备可访问名称**：图标按钮必须有 `aria-label` 或隐藏文本。
- [ ] **弹窗/面板具备正确 ARIA**：`role="dialog"`、`aria-modal="true"`、`aria-labelledby` 指向标题。
- [ ] **焦点陷阱（Focus Trap）**：模态框打开时 Tab 焦点不能逃逸出模态框。
- [ ] **焦点恢复**：弹窗关闭后焦点归还触发源。
- [ ] **Escape 键行为一致**：
  - 弹窗/面板按 Escape 关闭；
  - 行内编辑按 Escape 取消；
  - 全局快捷键在 Shadow DOM 模式下仍生效（如有）。
- [ ] **表单错误提示**：使用 `aria-invalid="true"` + `aria-describedby` 指向错误信息。

### 2.2 焦点可见性（必查）

- [ ] **所有可聚焦元素具备 `:focus-visible` 样式**：按钮、链接、输入框、自定义控件均不可裸用 `outline: none`。
- [ ] **焦点环对比度 ≥ 3:1**（WCAG 2.2 AA 对 UI 组件要求）。

### 2.3 颜色对比度（必查）

- [ ] **正文文字与背景对比度 ≥ 4.5:1**。
- [ ] **大号文字/UI 组件对比度 ≥ 3:1**。
- [ ] **玻璃拟态卡片必须有不透明 fallback 背景**，确保复杂壁纸下可读。

---

## 三、响应式与移动端

### 3.1 375px 视口实测（必查）

- [ ] **首屏无水平滚动条**。
- [ ] **FAB 在右下角可见且可点击**。
- [ ] **FAB 菜单展开不超出视口**。
- [ ] **设置/统计弹窗在窄屏下自适应，无内容截断**。
- [ ] **行内编辑输入框不超出卡片边界**。

### 3.2 触控与断点（必查）

- [ ] **触控目标最小 44×44px**：视觉上可小，但热区通过 padding 或 `::before` 扩展。
- [ ] **标准断点变量存在且被使用**：`--bm-bp-sm`、`--bm-bp-md`、`--bm-bp-lg`。
- [ ] **容器宽度使用 `min()` 模式**：如 `min(100% - 2rem, var(--content-max))`。
- [ ] **`@media (pointer: coarse)` 下间距/热区进一步放大**。

---

## 四、性能与动画

### 4.1 动画性能（必查）

- [ ] **优先使用 `transform` 和 `opacity` 做动画**，避免触发 layout/paint。
- [ ] **关键滚动/列表容器使用 `contain: layout style paint`**。
- [ ] **避免常驻 `will-change`**：通过 JS 在动画前后动态添加/移除。
- [ ] **日期切换、首屏渲染需做掉帧测试**：连续快速操作不堆积动画队列。

### 4.2 加载性能（必查）

- [ ] **首屏渐进渲染处理占位高度**：避免 timeline 已渲染但 goals 未渲染期间的 CLS。
- [ ] **长列表（>200 目标）做虚拟滚动或分片渲染验证**。

---

## 五、Shadow DOM 与挂载一致性（新增必查）

> 本次浏览器验证发现：Shadow DOM 开启后，部分动态组件仍挂载到 `document.body`，导致样式丢失或事件监听失效。

- [ ] **动态浮层必须挂载到 shadow root 或统一挂载点**：
  - toast、confirm dialog、tooltip 等必须使用 `appendToRoot()` / `modalMount()`，禁止直接 `document.body.appendChild`。
- [ ] **全局键盘快捷键在 Shadow DOM 模式下生效**：
  - 检查方法：Playwright 375px 视口下测试已注册的全局快捷键（如 Escape）。
- [ ] **事件监听器绑定到正确根节点**：
  - Shadow DOM 内事件监听应使用 `getDomRoot()` 或 `document` + `composedPath()` 判断。
- [ ] **Shadow host 覆盖视口时，body 挂载的浮层 z-index 需高于 host 且不丢失样式**。

---

## 六、组件一致性

### 6.1 按钮与表单（必查）

- [ ] **新增按钮必须继承基础类**（如 `.bm-btn`），禁止从零写一套样式。
- [ ] **按钮具备统一 size/style/loading/disabled 变体**。
- [ ] **输入框、选择框、开关具备统一基础类**。

### 6.2 卡片与面板（必查）

- [ ] **圆角与阴影使用变量**：禁止硬编码 `border-radius`、`box-shadow`。
- [ ] **卡片层级规范**：基础卡片、可悬停卡片、浮动面板、高强调操作对应不同令牌。

### 6.3 图标（必查）

- [ ] **统一图标入口**：优先使用 `Icon.render(name, options)` 或 `LucideUtils.createIcon`。
- [ ] **图标通过 `currentColor` 继承文字色**。
- [ ] **禁止在 CSS 中直接对 `svg` 标签设置尺寸**。

---

## 七、主题与暗色模式

- [ ] **新增组件必须同时提供 dark variant**：`dark.css` 中新增对应变量覆盖。
- [ ] **ThemeBridge 同步主题后对比度保护逻辑生效**。
- [ ] **高对比度/降运动模式开关（如有）不破坏主题变量**。

---

## 八、本次审计新增关注项（2026-07-30）

以下问题来自浏览器验证与报告复核，后续审计需重点复测：

- [ ] **FAB 主按钮点击关闭逻辑**：当前 `mousedown` 中 `if (isOpen) close()` 与 `click` 中 `toggle()` 存在冲突，导致点击无法关闭菜单。
- [ ] **动态浮层挂载点检查**：确认 toast、confirm dialog、tooltip 等均挂载到 shadow root 或统一挂载点，而非 `document.body`。
- [ ] **全局快捷键 Shadow DOM 兼容性**：`handlers.js` 中 `getDomRoot().addEventListener('keydown', ...)` 在 shadow 模式下可能失效。
- [ ] **ARIA 快照检查**：FAB 主按钮 `aria-label`、skip-link、live region 是否完整。

---

## 九、检查脚本与工具

```bash
# 1. CSS 量化（在仓库根目录执行）
rg "transition:\s*all" webapp/assets/styles -c
rg "!important" webapp/assets/styles -c
rg "outline:\s*none" webapp/assets/styles -c
rg "color:\s*(#fff|#ffffff|white|#000|#000000|black)" webapp/assets/styles -c
rg "prefers-reduced-motion" webapp/assets/styles -c

# 2. 375px 浏览器验证（需先启动本地服务器）
python3 -m http.server 8001 --directory webapp &
python3 /Users/pokerhu/.trae-cn/work/6a6a5fde1297a868dc210f88/browser_verify.py

# 3. 屏幕阅读器快速检查（macOS VoiceOver）
# 打开 Safari/Chrome，按 Cmd+F5 启用 VoiceOver，按 Tab/方向键遍历 FAB、弹窗、行内编辑。
```

---

## 十、审计记录模板

每次审计后复制以下模板填写：

```markdown
## 审计记录 — YYYY-MM-DD

- 审计人：
- 范围：
- 量化结果：
  - transition: all: __ 处
  - outline: none: __ 处
  - !important: __ 处
  - 硬编码白/黑: __ 处
- 375px 实测：通过 / 未通过（附截图）
- 屏幕阅读器：通过 / 未通过（附发现）
- 新增 lint-disable: __ 处（附理由）
- 未修复项与排期：
```
