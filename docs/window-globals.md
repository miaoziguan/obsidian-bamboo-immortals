# Window 全局挂载点清单

> 2026-06-17 梳理。所有 `window.X = X` 按文件 + 功能域分组。
> 总计 **70 个挂载点**，分布在 **42 个文件**中。

---

## 状态 & 存储

| 文件 | 挂载点 | 说明 |
|---|---|---|
| `state/store.js` | `window.store` | Store 单例（核心） |
| `state/dataValidator.js` | `window.DataValidator` | 数据校验/清理/迁移 |
| `state/defaultData.js` | `window.DATA_VERSION` | 数据版本号 `'3.0'` |
| | `window.DEFAULT_DATA` | 默认示例数据 |
| | `window.createEmptyDayData` | 空日数据工厂函数 |
| `storage/storageManager.js` | `window.storageManager` | IndexedDB 存储管理 |
| `storage/bridge.js` | `window.storageManager` | iframe 桥接版存储 |

---

## 服务层

| 文件 | 挂载点 | 说明 |
|---|---|---|
| `services/GoalService.js` | `window.GoalService` | 目标 CRUD + 计算 |
| `services/TimelineService.js` | `window.TimelineService` | 时间线事件增删查 |
| `services/TodoService.js` | `window.TodoService` | 待办任务管理 |
| `services/WalletService.js` | `window.WalletService` | 竹币经济/商店/收入/消费 |
| `services/CustomTemplateManager.js` | `window.CustomTemplateManager` | 自定义模板管理 |
| `services/searchService.js` | `window.SearchService` | 跨日/目标搜索 |

---

## 工具函数

| 文件 | 挂载点 | 说明 |
|---|---|---|
| `utils/helpers.js` | `window.formatDate` | 日期格式化 |
| | `window.getChineseDateDisplay` | 中文日期显示 |
| | `window.getChineseWeekday` | 中文星期 |
| | `window.debounce` | 防抖 |
| | `window.throttle` | 节流 |
| | `window.createElement` | DOM 工厂 |
| | `window.parseTime` | 时间解析 |
| | `window.calculateCheckInTimes` | 打卡时间计算 |
| | `window.scrollToSection` | 滚动到板块 |
| `utils/lucideUtils.js` | `window.LucideUtils` | Lucide 图标 SVG 生成 |
| `utils/htmlUtils.js` | `window.HTMLUtils` | HTML 安全工具 |
| | `window.escapeHtml` | 同上（同一指向） |
| `utils/toast.js` | `window.Toast` | Toast 通知 |
| `utils/confirmDialog.js` | `window.Confirm` | 确认弹窗 |
| | `window.ConfirmDialog` | 确认弹窗（别名） |
| `utils/eventBus.js` | `window.EventBus` | 发布订阅事件总线 |
| `utils/actionDispatcher.js` | `window.ActionDispatcher` | 全局 action 调度 |
| `utils/modalStack.js` | `window.ModalStack` | 模态层 z-index 管理 |
| `utils/panelManager.js` | `window.PanelManager` | 面板管理 |
| `utils/weatherService.js` | `window.WeatherService` | 天气 API 服务 |
| `utils/quoteService.js` | `window.QuoteService` | 名言/语录服务 |
| `utils/goalCalculations.js` | `window.GoalCalculations` | 目标纯计算工具 |
| `utils/popupPositioner.js` | `window.PopupPositioner` | 弹层定位工具 |

---

## 渲染模块

| 文件 | 挂载点 | 说明 |
|---|---|---|
| `modules/goals/renderer.js` | `window.GoalsRenderer` | 目标卡片 renderer（3060 行） |
| `modules/goals/editor.js` | `window.GoalsEditor` | 目标编辑器 |
| `modules/goals/healthScore.js` | `window.GoalHealthScore` | 目标健康分 |
| `modules/goals/index.js` | `window.Goals` | 目标模块入口 |
| | `window.GOAL_STATUSES` | 目标状态常量 |
| `modules/timeline/renderer.js` | `window.TimelineRenderer` | 时间线 renderer |
| `modules/timeline/editor.js` | `window.TimelineEditor` | 时间线编辑器 |
| `modules/timeline/index.js` | `window.Timeline` | 时间线模块入口 |
| `modules/todo/renderer.js` | `window.TodoRenderer` | 待办 renderer |
| `modules/todo/index.js` | `window.Todo` | 待办模块入口 |
| `modules/other/editor.js` | `window.OtherModule` | 其他板块编辑器 |
| `modules/other/index.js` | `window.Other` | 其他板块入口 |
| `modules/bamboo-garden.js` | `window.BambooGarden` | 竹林花园 |
| `modules/theme-effects.js` | `window.ThemeEffects` | 主题特效 |
| `modules/sections/registry.js` | `window.SectionRegistry` | 板块注册表 |
| `modules/sections/manager.js` | `window.SectionManager` | 板块管理器 |
| `modules/sections/sectionSettings.js` | `window.SectionSettings` | 板块设置 |
| `modules/sections/sectionDragDrop.js` | `window.SectionDragDrop` | 拖拽排序 |
| `modules/index.js` | `window.Modules` | 模块总入口 |
| `renderers/renderers.js` | `window.renderSkeleton` | 骨架屏渲染 |
| | `window.renderAll` | 全量重新渲染 |
| | `window.createDefaultSection` | 默认板块创建 |
| | `window.setupTimelineHoverEffects` | 时间线 hover |
| | `window.setupBambooTooltips` | 竹币 tooltips |

---

## 交互 & 事件处理

| 文件 | 挂载点 | 说明 |
|---|---|---|
| `handlers/handlers.js` | `window.Handlers` | 事件处理总入口 |
| `handlers/navigation.js` | `window.Navigation` | 日期导航（上/下一天） |
| `handlers/keyboard.js` | `window.Keyboard` | 键盘快捷键 |
| `handlers/gestures.js` | `window.Gestures` | 手势（滑动切日期） |
| `handlers/quickNav.js` | `window.QuickNav` | 快速导航 |
| `handlers/fabManager.js` | `window.FABManager` | 悬浮按钮管理 |
| `handlers/validation.js` | `window.Validation` | 表单校验 |
| `handlers/datePicker.js` | `window.DatePicker` | 日期选择器 |
| `handlers/themeSelector.js` | `window.ThemeSelector` | 主题选择器 |
| `handlers/displayManager.js` | `window.DisplayManager` | 显示设置 |
| `handlers/settingsModal.js` | `window.SettingsModal` | 设置面板 |
| `handlers/statsModal.js` | `window.StatsModal` | 统计面板 |
| `handlers/shopManager.js` | `window.ShopManager` | 商店管理 |
| `handlers/modalEditors.js` | `window.ModalEditors` | 模态编辑器 |
| `handlers/dataIO.js` | `window.DataIO` | 数据导入导出 |
| `handlers/weatherModal.js` | `window.WeatherRenderer` | 天气渲染 |
| | `window.QuoteRenderer` | 名言渲染 |

---

## 全局函数（从 helpers 直接暴露）

这些是**纯函数**，不封装在对象里，直接挂 `window`：

| 函数 | 来源 |
|---|---|
| `formatDate()` | helpers.js |
| `getChineseDateDisplay()` | helpers.js |
| `getChineseWeekday()` | helpers.js |
| `escapeHtml()` | htmlUtils.js |
| `debounce()` | helpers.js |
| `throttle()` | helpers.js |
| `createElement()` | helpers.js |
| `parseTime()` | helpers.js |
| `calculateCheckInTimes()` | helpers.js |
| `scrollToSection()` | helpers.js |
| `renderSkeleton()` | renderers/renderers.js |
| `renderAll()` | renderers/renderers.js |
| `createEmptyDayData()` | state/defaultData.js |

---

## 已知问题

1. **`createEmptyDayData` 同时作为 window 函数和 store 内联使用** — 调用方可能混乱
2. **47% 的挂载点在 handlers/ 目录** — 事件处理层最分散
3. **`renderAll` / `Handlers.init` 等入口函数被 index.html 内联 `<script>` 直接调用** — 这是"靠 window 通信"的典型模式
