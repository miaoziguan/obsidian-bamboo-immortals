# 死导出候选清单（D 类）

> 本清单由 `scripts/check-dead-exports.mjs` 自动生成 + 人工裁决。分两档：
> - **内部使用（冗余 export）**：代码活着，仅 `export` 关键字多余 → 建议去掉 export（低优先，改善 tree-shaking 信号）。
> - **零引用 / 仅测试引用**：真死候选（A 级）或测试专用契约（C 级）→ 按审计定级处理，不盲目删。

## 闸门意图

任何「新增的零消费者运行时导出」都会触发 CI 失败（强制评审）。已存在的条目由本区块快照；
清理一条后跑 `--update` 即可从快照移除。

## A 级真死（审计已定，待删除 PR）

| 导出 | 文件 | 处置 |
|---|---|---|
| `appendToRoot` | `webapp/assets/scripts/utils/domRef.js` | ✅ 已删除（commit 见下） |
| `fallbackQuestion` + 私有 `DISEASE_QUESTION` | `src/ai/GoalElicitor.ts` | ✅ 已删除（C 传递死，同逻辑单元） |

---

<!-- AUTO-GENERATED:dead-exports START -->
> 本节由 `scripts/check-dead-exports.mjs` **自动生成，勿手改**。改完代码执行：
> `node scripts/check-dead-exports.mjs --update`（CI 跑默认模式校验漂移）。
>
> 扫描：webapp JS(排除 tests) + src TS(排除 __tests__) + 根 main.ts（插件入口）；排除 TS type/interface/declare。
> 判定：生产代码零消费者（标识符 + 引号内字符串键）即记为死导出。非单词名($/$$)用专用边界。

**零消费者运行时导出合计：67**

| 导出名 | 状态 | 内部/测试引用 |
|---|---|---|
| `computeGoalDeviation` | 内部使用(冗余export) | 内部:1 测试:1 |
| `DEFAULT_TASK_DAY_TYPE` | 内部使用(冗余export) | 内部:1 测试:1 |
| `sanitizeGoal` | 内部使用(冗余export) | 内部:1 测试:1 |
| `sanitizeSubItem` | 内部使用(冗余export) | 内部:1 测试:1 |
| `buildDiagnosisMessages` | 内部使用(冗余export) | 内部:1 测试:1 |
| `buildHealthSummary` | 内部使用(冗余export) | 内部:1 测试:1 |
| `parseDiagnosis` | 内部使用(冗余export) | 内部:1 测试:1 |
| `buildSplitPrompt` | 内部使用(冗余export) | 内部:1 测试:1 |
| `GOAL_KIND_RUBRIC` | 内部使用(冗余export) | 内部:2 测试:0 |
| `parseSplit` | 内部使用(冗余export) | 内部:2 测试:1 |
| `backfillItemDates` | 内部使用(冗余export) | 内部:2 测试:1 |
| `getHolidays` | 内部使用(冗余export) | 内部:3 测试:2 |
| `isValidAudioUrl` | 内部使用(冗余export) | 内部:1 测试:1 |
| `ALL_MESSAGE_TYPES` | 内部使用(冗余export) | 内部:3 测试:1 |
| `normalizeUserIdentity` | 仅测试引用 | 内部:0 测试:1 |
| `CENSER_BASE` | 内部使用(冗余export) | 内部:1 测试:0 |
| `CENSER_DEFS` | 内部使用(冗余export) | 内部:1 测试:0 |
| `MODE_POLICY` | 内部使用(冗余export) | 内部:4 测试:2 |
| `allFonts` | 内部使用(冗余export) | 内部:1 测试:0 |
| `allPapers` | 内部使用(冗余export) | 内部:1 测试:0 |
| `GOAL_TEMPLATES` | 内部使用(冗余export) | 内部:1 测试:0 |
| `_iconSvg` | 内部使用(冗余export) | 内部:1 测试:0 |
| `buildBambooNodeHTML` | 内部使用(冗余export) | 内部:2 测试:0 |
| `buildBambooPathHTML` | 内部使用(冗余export) | 内部:2 测试:1 |
| `buildPeriodDotsHTML` | 内部使用(冗余export) | 内部:2 测试:0 |
| `buildStubBackHTML` | 内部使用(冗余export) | 内部:2 测试:0 |
| `buildTicketHTML` | 内部使用(冗余export) | 内部:2 测试:1 |
| `computeActiveDuration` | 内部使用(冗余export) | 内部:2 测试:0 |
| `createDefaultSection` | 内部使用(冗余export) | 内部:2 测试:0 |
| `getActivePeriod` | 内部使用(冗余export) | 内部:2 测试:0 |
| `getPeriodDotStates` | 内部使用(冗余export) | 内部:2 测试:1 |
| `isCurrentPeriod` | 内部使用(冗余export) | 内部:2 测试:1 |
| `PERIOD_HOURS` | 内部使用(冗余export) | 内部:2 测试:0 |
| `PERIOD_LABELS` | 内部使用(冗余export) | 内部:1 测试:0 |
| `PERIOD_ORDER` | 内部使用(冗余export) | 内部:1 测试:0 |
| `renderGoalsSection` | 内部使用(冗余export) | 内部:3 测试:0 |
| `renderTimelineSection` | 内部使用(冗余export) | 内部:4 测试:0 |
| `renderTodoSection` | 内部使用(冗余export) | 内部:3 测试:0 |
| `setupTimelineHoverEffects` | 内部使用(冗余export) | 内部:4 测试:0 |
| `stubIconClock` | 内部使用(冗余export) | 内部:1 测试:0 |
| `stubIconFlip` | 内部使用(冗余export) | 内部:1 测试:0 |
| `stubIconList` | 内部使用(冗余export) | 内部:1 测试:0 |
| `MAX_CUSTOM_TEMPLATES` | 内部使用(冗余export) | 内部:2 测试:0 |
| `ICON_LINK` | 内部使用(冗余export) | 内部:2 测试:0 |
| `PERIOD_CONFIG` | 内部使用(冗余export) | 内部:3 测试:0 |
| `BridgeStorage` | 内部使用(冗余export) | 内部:1 测试:3 |
| `computeFitScale` | 内部使用(冗余export) | 内部:1 测试:1 |
| `MIN_FIT_SCALE` | 内部使用(冗余export) | 内部:4 测试:1 |
| `CONSTANTS` | 仅测试引用 | 内部:0 测试:2 |
| `getShadowRoot` | 内部使用(冗余export) | 内部:2 测试:0 |
| `createFacade` | 内部使用(冗余export) | 内部:3 测试:1 |
| `isLicenseGateActive` | 内部使用(冗余export) | 内部:1 测试:0 |
| `mountLicenseGate` | 内部使用(冗余export) | 内部:2 测试:0 |
| `APP_MESSAGE_TYPES` | 内部使用(冗余export) | 内部:3 测试:1 |
| `isKnownType` | 内部使用(冗余export) | 内部:2 测试:1 |
| `compareSemver` | 内部使用(冗余export) | 内部:1 测试:1 |
| `parseSemver` | 内部使用(冗余export) | 内部:4 测试:1 |
| `initShadow` | 内部使用(冗余export) | 内部:3 测试:0 | 重导出
| `ToastManager` | 内部使用(冗余export) | 内部:1 测试:0 |
| `CACHE_KEY` | 内部使用(冗余export) | 内部:3 测试:0 |
| `CACHE_TTL` | 内部使用(冗余export) | 内部:1 测试:0 |
| `clearCache` | 内部使用(冗余export) | 内部:2 测试:0 |
| `readCache` | 内部使用(冗余export) | 内部:2 测试:0 |
| `WEATHER_ICONS` | 内部使用(冗余export) | 内部:5 测试:0 |
| `WEATHER_LABELS` | 内部使用(冗余export) | 内部:2 测试:0 |
| `writeCache` | 内部使用(冗余export) | 内部:2 测试:0 |
| `wttrCodeToType` | 内部使用(冗余export) | 内部:1 测试:0 |
<!-- AUTO-GENERATED:dead-exports END -->
