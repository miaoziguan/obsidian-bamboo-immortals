# Changelog

## [3.3.16] — 2026-08-08

### Docs
- **付费用户福利扩充**：README 付费福利节新增三项——① 作者个人人脉组建的各领域专家团队（付费用户可对接咨询）；② 仅付费用户可加入的独家高质量社群；③ 不定期推出的中国风主题动效持续更新（竹林玉案系列，付费用户免费领用）。

---

## [3.3.15] — 2026-08-08

### Docs
- **重定位 README 营销核心**：核心卖点从「AI 目标教练」调整为**独创「目标自动化流转」机制**（意图→目标卡片→每日待办自动生成→竹币联动时间线→修仙境界升级→复盘反哺），并明确 AI 仅为可选增强（默认纯本地、无需联网）。新增「专属中国风美学」与「付费用户福利」两节，中英文同步。

### Removed
- **移除未计划的 SearchUI 搜索模块**：该功能仅通过 `Ctrl+K` / `/` 快捷键唤起，无可见 UI 入口，确认不在当前产品计划内。删除 `modules/search-ui.js`、`services/searchService.js`、相关测试与样式，并从 `handlers.js`、`store.js`、`index.html` 中清理引用。同步更新 `app.html`、375px 浏览器验证脚本与审计文档。

---

## [2.8.5] — 2026-07-24

### Added
- **启动数据自洽校验与自动修复（ConsistencyService）**：新增 `services/ConsistencyService.js`，在 `store.initialize()` 加载数据后自动运行，从根上修复「目标任务待办 ↔ 时间线活动 ↔ 目标进度 ↔ 竹币收支」四方不一致。修复维度：(1) 每日 `goalTaskCompletions`（待办完成态）与时间线活动**双向对齐**（时间线有完成记录则补待办完成态，反之补时间线活动）；(2) 目标 `item.percent`/`goal.progress` 按 `currentValue` 派生**重算**，保证内部自洽；(3) 补齐今日已完成任务**缺失的竹币收入记录**并保守校准余额。设计原则：对已一致数据零副作用、任何异常不影响启动（错误记入 report 不抛出）
- **新增回归测试**：`ConsistencyService.jest.test.js` 覆盖正/反向对齐、已一致零副作用、目标进度重算、竹币补齐、异常捕获

### Background
- 修复此前边缘场景（saveToStorage 分支失败导致当日 `goalTaskCompletions`/timeline/竹币未同步落 Vault）造成的「待办面板看不到完成但时间线有记录」「完成了却没加竹币」等历史数据不一致，且今后每次启动都会自动自检修复

---

## [2.8.4] — 2026-07-24

### Fixed
- **时间线卡片今日活动丢失**：`store.saveToStorage` 原用 `Promise.all([dayData, settings, goals])` 一次性提交，任一分支（如某次 `putSetting` 边缘失败）reject 就会整体落到 `saveToStorageLegacy()` 写 localStorage——而 localStorage 与 Vault 不互通，导致当日 `timeline`/日数据只进了 localStorage、Vault 当日文件始终为加载时的空状态，表现为「时间线卡片今日活动丢失，而 income 历史完好」（income 走独立的 `putIncomeHistory` 不受影响）。改为 **dayData 优先且独立落 Vault**，`settings`/`goals` 各自 `try/catch`，任一步失败都不再牵连日数据持久化；仅当 dayData 本身失败才兜底写 localStorage
- **天气异步补读跨时区键**：天气补读用 `toISOString()`（UTC）日期键创建空 dayData，与 dayData 文件键（本地日期）不一致，跨时区下可能错配；统一改用 `getDateKey()` 本地键
- **新增回归测试**：`store.jest.test.js` 覆盖「putSetting 失败不牵连 dayData 落库」「putDay 失败才兜底 localStorage」「全部成功不触发兜底」

---

## [2.8.3] — 2026-07-24

### Fixed
- **竹林商店余额/统计数据丢失（余额归零）**：`balance` 本是「收入 − 消费」的派生事实，但其逐步累加的持久化在历史某刻损坏（余额被写成 0，而 `income-history.json` 280 条、`purchase-history.json` 7 条记录完好），且加载时首次全量保存又把读到的 0 写回覆盖。`WalletService.recalibrateStats` 新增余额校准：当余额 ≤ 0 但派生值应为正时，以 `income/purchase` 派生值校正并落盘，并据此修正 `shopStats.totalEarnings`。校准仅命中「余额归零 + 记录完好」的损坏场景，不影响任何正常既有余额
- **新增回归测试**：`WalletService.jest.test.js` 覆盖余额校准（派生 = 收入 − 消费）、冻结一致性、今日无收入、可用余额扣减

---

## [2.8.2] — 2026-07-24

### Fixed
- **可用竹币虚高（冻结机制错乱）**：`WalletService.recalibrateStats` 在加载时重算正确的今日收入，但旧代码未把 `_statsDate`（纯内存、不持久化）同步为今天，导致 reload 后首次 `updateBalance` 误判「跨天」把刚算好的今日收入清零，可用竹币（`balance − todayEarnings`）被错误释放而虚高。修复：recalibrate 末尾同步 `s._statsDate = today`，首次任务收入改为正确累加
- **新增回归测试**：`WalletService.jest.test.js` 覆盖 recalibrate→首次 updateBalance 的冻结一致性、今日无收入场景、可用余额扣减

---\n\n## [2.8.1] — 2026-07-24

### Fixed
- **目标数据「异常清空」误报**：修复 `store.saveToStorage` 首次保存时用 `!_didInitialSave` 强制写出 `globalGoals`，导致并行加载阶段（Phase 2 早于 Phase 3 `loadGlobalGoals`）把未加载的 `[]` 误写、触发 `VaultStorage.putGoals` 的清空拦截误报。新增 `_goalsLoaded` 标志，goals 真正从 Vault 加载完成后才允许首次强制写入（数据未丢失，仅消除告警）

---

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
