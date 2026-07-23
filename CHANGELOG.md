# Changelog

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
