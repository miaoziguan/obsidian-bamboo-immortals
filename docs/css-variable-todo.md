# CSS 变量化待办清单（webapp）

> 范围：`webapp/assets/styles/*.css`
> 现状：插件本体 `styles.css` 已 100% 使用 Obsidian 原生变量，无需改动。本清单只针对 webapp 内部样式。
> `variables.css` 已是集中变量池（含 `--bamboo-*` HSL 动态变量 + 大量 `--*-rgb` 与具体色值变量如 `--leaf-green:#6B8E23`、`--gold:#D4AF37`、`--cinnabar:#C9483B`、`--sky-azure:#87CEEB` 等）。
> 各组件 CSS 仍大量直接写死十六进制 / rgb()，未走变量。
>
> 符号说明：
> - ✅ = `variables.css` 已有精确对应的语义变量，可直接替换
> - 🔶 = `variables.css` 有**相近但不等**的值，需近似或先在 variables.css 新增变量
> - ➕ = `variables.css` 无对应，需新增语义变量后再替换

---

## 一、可直接替换（variables.css 已有精确变量）

| 文件 | 写死颜色 | 次数 | 建议替换 | 备注 |
|------|----------|------|----------|------|
| goals-map.css | `#4285f4` | 多 | `rgb(var(--info-blue-rgb))` | `--info-blue-rgb:66,133,244` = #4285f4 ✅ |
| goals-stats.css | `#E74C3C` | 多 | `rgb(var(--danger-alt-rgb))` | `--danger-alt-rgb:231,76,60` = #E74C3C ✅ |
| goals-editor.css | `#e74c3c` | 多 | `rgb(var(--danger-alt-rgb))` | 同上 ✅ |
| section-manager.css | `#B48C64` | 多 | `rgb(var(--amber-brown-rgb))` | `--amber-brown-rgb:180,140,100` = #B48C64 ✅ |
| modal-settings.css | `#1a1a1a` | 多 | `var(--ink-dark)` | `--ink-dark:#1A1A1A` ✅ |
| toast.css | `#c82333` 等危险色 | 少 | `rgb(var(--danger-rgb))` / `--cinnabar` | 需核对（见下方 🔶） |

## 二、需新增变量或近似（variables.css 无精确对应）

| 文件 | 写死颜色 | 次数 | 现状 | 建议 |
|------|----------|------|------|------|
| bamboo-garden.css | `#6B8E23` 系竹绿 | 102 处（全局最多） | 已有 `--leaf-green:#6B8E23` ✅ | **刻意保留，不变量化**（部分装饰色为设计意图写死，勿改） |
| bamboo-garden.css | `rgba(255,234,167,...)` 暖光 | 3 | variables 无 | **刻意保留，不变量化** |
| timeline.css | 多类竹绿/金/红 | 83 | 部分有近似 `--bamboo-*` | 🔶 近似或按组件语义新增 |
| dark.css | 暗色背景/边框 | 65 | `--surface-deep-rgb`(=#141f14) 近似 `#1e2e1e` | 🔶 用 `--surface-deep-rgb` 近似或 ➕ 新增 `--surface-deep-custom` |
| goals-health.css | 成功/警告/危险 | 37 | `--health-success-rgb` 等部分有 | 🔶 核对 |
| goals-stats.css | 紫/红/绿 | 38 | `--purple-rgb:#9A5A9A` ✅ 对应 `#9A5A9A` | 紫色 ✅，其余 🔶 |
| modal-panels.css | `#ff4d4f` | 38 | 接近 `--danger-bright-rgb`(#EF4444) 但不等 | ➕ 新增或近似 |
| goals-map.css | `#BDC3C7` 灰 | 24 | 无直接对应 | ➕ 新增 `--gray-light` |
| display.css | 金/绿渐变 | 24 | `--gold` 部分有 | 🔶 |
| toast.css | `#c82333` | - | `--cinnabar:#C9483B` 近似但不等 | 🔶 近似或 ➕ |
| date-nav.css | `#C94859` | 3 | 接近 `--cinnabar:#C9483B` | 🔶 近似 `--cinnabar` |
| weather-quotes.css | `#d9534f` | 3 | 接近 `--bamboo-error:#dc3545` | 🔶 近似 |
| forms.css | `#e57368` | 3 | 接近 `--cinnabar` 更亮 | ➕ 新增浅红 |
| goals-widgets.css | `#ecedea` | 3 | 无 | ➕ 新增浅灰底 |
| modal-settings.css | `#d1d5db` 灰边框 | 5 | 无 | ➕ 新增 `--border-medium` |
| goals-editor.css | `#3eb370`/`#369e63` 竹绿 fallback | 多 | 旧色调，接近 `--bamboo-primary` | 🔶 近似或 ➕ |
| goals-editor.css | `#4ade80` success | 多 | 无 | ➕ 新增 `--success-bright` |
| 多个文件 | `#fff` / `#ffffff` 纯白 | 多 | variables 无纯白变量（玻璃高光是 rgba） | ➕ 新增 `--pure-white` 复用 |

---

## 三、执行建议（供决策）

1. **低风险的快速收益**：先替换"✅ 精确对应"的颜色（goals-map 的 #4285f4、goals-stats/editor 的 #E74C3C、section-manager 的 #B48C64、modal-settings 的 #1a1a1a、goals-stats 的 #9A5A9A）→ 这些零歧义，可直接批量替换。
2. ~~**中等收益**：把 `bamboo-garden.css`（102 处）里能对应 `--leaf-green` 的写死色替换掉~~ — **已决定：bamboo-garden 刻意保留，不变量化。**
3. **需先扩变量池**：🔶/➕ 类先在 `variables.css` 补语义变量（如 `--pure-white`、`--border-medium`、`--success-bright`、`--gray-light`），再回头替换，避免散落硬编码。
4. **验证**：webapp 改完需重新 `npm run build` 并打 webapp.zip 验证主题色相滑块 / 暗色模式覆盖正常。

> 注：以上为静态分析推断，实际每行替换需打开文件逐处核对上下文（如 rgba 的透明度、渐变端点的语义），避免误替换。
>
> **执行状态（2026-07-09）**：✅ 精确对应部分已在 **2.0.4** 全部完成（goals-map / section-manager / modal-settings / goals-stats 共 8 处）。🔶/➕ 近似与需新增变量部分、以及 bamboo-garden.css 的批量写死色，**经评估决定保留（部分装饰色为设计意图写死）**，本清单不再作为待办。
>
> ---
>
> ## 四、z-index 层级体系（2026-07-23 新增）
>
> **问题**：14 个 CSS 文件中共 79 处 z-index，其中 30 处为硬编码魔数（10000 × 7、9999 × 6、10001 × 3、999999 × 1 等），相同层级多处撞值，堆叠顺序依赖 DOM 顺序而非设计意图。
>
> **方案**：在 `variables.css` `:host` 下定义 `--z-layer-*` 变量体系：
>
> | 变量 | 值 | 用途 |
> |------|-----|------|
> | `--z-layer-below` | -2 | 装饰层/背景装饰 |
> | `--z-layer-behind` | -1 | 背景伪元素 |
> | `--z-layer-base` | 0 | 正常流 |
> | `--z-layer-raised` | 1 | 轻微抬起（card hover 等） |
> | `--z-layer-floating` | 2 | 浮动元素（日期悬浮等） |
> | `--z-layer-dropdown` | 100 | 下拉菜单/颜色面板 |
> | `--z-layer-keyboard-hint` | 900-1000 | 键盘快捷键提示 |
> | `--z-layer-tooltip` | 9999 | tooltip / 悬浮预览 / KPI 悬浮 |
> | `--z-layer-overlay` | 10000 | 通用遮罩层（FAB/modal-overlay/弹层底部） |
> | `--z-layer-modal` | 10001-10002 | 模态容器 / widget 覆盖 |
> | `--z-layer-toast` | 10010 | Toast 全屏通知 |
> | `--z-layer-max` | 11000 | 最顶层（搜索/日期选择器） |
>
> **执行**：已替换 14 个文件共 30 处硬编码 z-index → `var(--z-layer-*)`。局部层级（1/2/5/10/20/-1/-2/0）保留原值不变。
>
> ---
>
> ## 五、死代码清理记录（2026-07-23）
>
> ### undo/redo 全链路移除
>
> **背景**：`#21/#22`（暴露隐藏功能）曾将撤销/重做/搜索按钮注入 `.date-nav-right`，后移入底部浮动工具栏，最终因无价值全部移除。
>
> **清理范围**：
>
> | 文件 | 操作 | 行数 |
> |------|------|------|
> | `state/undoRedoManager.js` | 删除整个文件 | - |
> | `state/store.js` | 移除 `UndoRedoManager` 导入、`undoStack`/`redoStack` 状态字段、`pushUndo()`/`undo()`/`redo()`/`canUndo()`/`canRedo()` 方法 | ~40 |
> | `handlers/handlers.js` | 移除 Ctrl+Z / Ctrl+Shift+Z 快捷键 + undo/redo action handler | ~20 |
> | `renderers/renderers.js` | 移除 `renderUndoRedoBar()` 函数 + 调用 | ~25 |
> | `styles/date-nav.css` | 移除 `.undo-redo-bar`、`.undo-redo-indicator`、`.undo-redo-btn` 全套 CSS | ~80 |
> | `styles/base.css` | 移除选择器列表中 `.undo-redo-btn` | 1 |
> | `styles/components-interaction.css` | 移除选择器列表中 `.undo-redo-btn` | 1 |
> | `index.html` | 移除 `.undo-redo-bar`、`searchBtn` HTML 节点 | ~20 |
> | `tests/undoRedoManager.jest.test.js` | 删除测试文件 | - |
> | `tests/store.jest.test.js` | 移除 7 个 undo/redo 测试用例 | ~70 |
>
> ### historyList 死代码移除
>
> `renderHistoryList()` 引用 `byId('historyList')`，该元素不存在于 HTML 且无 JS 动态创建逻辑，函数静默无效。已移除函数体（~30 行）。
>
> ### date-nav-right 视觉修复
>
> `.date-nav-right` 的 `border-left` 竖线在只剩 `gotoDateBtn` 一个按钮时视觉多余，已移除。
>
> ---
>
> ## 六、暗色模式修复记录（2026-07-23）
>
> ### 根因修复：JS `_applyHue` setProperty 覆盖 `:host(.dark)`
>
> `displayManager._applyHue()` 通过 `root.style.setProperty()` 写入内联样式，优先级高于 `:host(.dark)` CSS 变量声明。在 `_applyHue` 中添加 `isDark` 检测逻辑，暗色下所有前景色变量 +10% 明度提升；新增 `reapplyHueForDarkMode()` 方法由 `store.setDarkMode()` 在 class 切换后调用。
>
> ### SearchUI `_ensurePanel` null 引用
>
> shadow 模式下 `byId('searchResults')` 走到 `host.shadowRoot` 而非 `document`，返回 null。改用 `panel.querySelector()` 直接查找。
>
> ### 暗色卡片背景补充覆盖
>
> `dark.css` 补充以下 `:host(.dark)` 规则：
> - `.core-metric-card:hover` — 暗色背景替换 `rgba(var(--white-rgb), 0.75)`
> - `.alert-item:hover` — 暗色阴影替换
> - `.achievement-card-full` / `:hover` — 暗色下裸 RGBA 字面量替换
> - `.stats-section-warning` — 暗色背景替换裸 `rgba(255,250,245,0.95)`
>
> ### 性能优化（#14, #17, #18）
>
> | 优化 | 内容 |
> |------|------|
> | #14 backdrop-filter 减层 | 移除 25 个冗余嵌套 `backdrop-filter`，保留最外层父级 |
> | #17 will-change 按需 | 4 个选择器从静态 CSS 移至 hover/focus 状态 |
> | #18 渐变预渲染 | `--glass-card-gradient` 提取为 CSS 变量 |
>
> ---
>
> ## 七、键盘事件 Shadow DOM 适配（2026-07-23）
>
> **问题**：全局键盘快捷键直接绑定在 `document` 上，Shadow DOM 启用后与 Obsidian 宿主隔离不彻底。
>
> **修复**：3 个文件共 6 处 `document.addEventListener('keydown', ...)` → `getDomRoot().addEventListener('keydown', ...)`：
> - `handlers/handlers.js` — 全局快捷键 + modal key handler
> - `handlers/fabManager.js` — FAB 菜单键盘导航
> - `utils/actionDispatcher.js` — click + Enter/Space 委托
