# Changelog

## [2.8.0] — 2026-07-24

### Added
- **渲染调度器（RenderScheduler）**：脏标记 + 防抖 + 全量/局部渲染调度，日期切换带方向过渡动画（新增 `renderers/renderScheduler.js`）
- **精细化分区骨架屏**：替代简单全局骨架占位

### Changed
- **渲染层重构**：`renderers.js` 接入 RenderScheduler 做局部渲染；各模块（goals/editor、inlineEditService、renderer、GoalService、TodoService、handler 层）改用 `markSectionDirty` 局部刷新
- **日期切换过渡**：datePicker / navigation / gestures / handlers 统一走 `RenderScheduler.startDateTransition`（带方向滑入/滑出动画）
- **时间线非焦点内容懒加载**：仅聚焦时段渲染条目，降低首屏与切换开销
- **商店品牌化**：货币符号 ¥ →「竹」（竹币）；目标模板标题微调（健身计划→健身锻炼、写作计划→写作创作、储蓄目标→储蓄理财）
- **样式增强**：`base.css` 新增 GPU 合成层提示（`will-change`/`contain`）、骨架屏、日期切换过渡动画

### Fixed
- **健康分工作日计算更精确**：重写为「整周×5 + 余数工作日 − 区间内节假日」
- **首屏优化**：旧月数据归档延后到 `requestIdleCallback`、设置与 goals/stats 并行加载；缓存写入多档降级（60/30/14 字符）容错；数据变更联动失效健康分缓存与搜索索引

### Performance
- **搜索倒排索引**：token→dateKey 倒排索引 + 增量维护（`invalidateIndex`）+ 结果缓存，搜索更快更准（指标/时间线/目标更细匹配）
- **健康分缓存**：结果缓存 + 全局数据缓存（按 goalIds+days+version）避免重复计算
- **时间线 hover**：改用 CSS 变量（`--mouse-x/y`）驱动并 cleanup，避免泄漏

---

## [2.7.0] — 2026-07-23

### Added
- **内联搜索面板**：`Ctrl+K` / `/` 唤起，实时搜索日记内容（新增 `modules/search-ui.js`）
- **FAB 悬浮菜单键盘导航与无障碍**：方向键循环、`Tab`/`Shift+Tab` 焦点陷阱、`Home`/`End`、`Escape` 关闭

### Changed
- **Shadow DOM 事件兼容**：事件监听统一走 `getDomRoot()`（样式隔离下事件仍可正确路由）— `actionDispatcher` / `fabManager`
- **CSS token 规范化**：批量收敛 `styles/*.css` 到设计变量（`variables.css`），强化 `scripts/lint-css-tokens.mjs` 校验；更新 `docs/theme-dev-guide.md`，新增 `docs/css-variable-todo.md`

### Fixed
- **暗色模式前景色明度校正**：切换暗色时重算色相派生 RGB 变量（`DisplayManager.reapplyHueForDarkMode`），确保文字/按钮/卡片在深色背景上可见

### Removed
- 移除撤销/重做能力（`UndoRedoManager` 及相关状态与测试），精简 `store`

---

## [2.1.7] — 2026-07-13

### Changed
- **架构迁移**：从 HTTP 服务器 + iframe 改为 blob URL + iframe + Bundle，消除 Node.js 依赖
- `main.ts` 精简 60%，删除 `LocalServer`、`BridgeService`、`StorageBridge`
- 新增 `AppHost`（webapp 资源加载）和 `AppAPI`（统一通信接口）
- 移除所有 Node.js 内置模块依赖（fs/path/zlib/https/http/net）
- 启用移动端支持：`isDesktopOnly` → `false`

### Added
- `scripts/bundle-webapp.mjs`：自动从 index.html 扫描脚本并打包为 IIFE
- `sync.sh` 构建流程加入 webapp JS 打包步骤

### Removed
- `src/server/LocalServer.ts`、`src/bridge/BridgeService.ts`、`src/bridge/StorageBridge.ts`
- `src/types/messages.ts`（205 行死代码）
- `docs/code-quality-todo.md`（严重过时）

---

## [2.1.6]

- 之前版本（完整日志待补充）
