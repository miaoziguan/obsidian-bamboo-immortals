# 死方法候选清单（零引用对象方法）

> 本清单由 `scripts/check-dead-methods.mjs` 自动生成 + 人工裁决。
> 背景：_showInputModal（零调用存活）、timeline editor（唯一消费者自身已死）
> 两起事故后补的方法级扫描。参见 docs/ui-debt-decisions.md「接线三问」。

## 闸门意图

任何「新增的零引用方法」触发 CI 失败（强制评审）。已知局限见脚本头部注释
（同名共享判定、属性键不覆盖、动态派发假设）——宁可漏报，不误伤。

---

<!-- AUTO-GENERATED:dead-methods START -->
> 本节由 `scripts/check-dead-methods.mjs` **自动生成，勿手改**。改完代码执行：
> `node scripts/check-dead-methods.mjs --update`（CI 跑默认模式校验漂移）。

**零引用方法合计：52**

| 方法 | 位置 |
|---|---|
| `cancelMarquee` | `webapp/assets/scripts/handlers/features/CardInteractions.js:497` |
| `linksOf` | `webapp/assets/scripts/handlers/features/mindmapDoc.js:122` |
| `_sizeCardKnobs` | `webapp/assets/scripts/handlers/features/typewriterFeature.js:363` |
| `setFont` | `webapp/assets/scripts/handlers/features/writingDoc.js:459` |
| `clampOffset` | `webapp/assets/scripts/handlers/features/writingDoc.js:540` |
| `scrollToTop` | `webapp/assets/scripts/handlers/gestures.js:71` |
| `setupModalFocusTrap` | `webapp/assets/scripts/handlers/handlers.js:190` |
| `destroyMounted` | `webapp/assets/scripts/handlers/moduleManager.js:444` |
| `_loadSortPreference` | `webapp/assets/scripts/handlers/shopManager.js:115` |
| `openEditor` | `webapp/assets/scripts/modules/goals/index.js:15` |
| `addGoalTaskToTimeline` | `webapp/assets/scripts/modules/goals/renderer.js:74` |
| `removeGoalTaskFromTimeline` | `webapp/assets/scripts/modules/goals/renderer.js:78` |
| `_persistOnce` | `webapp/assets/scripts/modules/layout/layoutMode.js:28` |
| `exit` | `webapp/assets/scripts/modules/layout/layoutMode.js:79` |
| `openSectionSettings` | `webapp/assets/scripts/modules/sections/manager.js:52` |
| `addCustom` | `webapp/assets/scripts/modules/sections/registry.js:76` |
| `destroyAll` | `webapp/assets/scripts/modules/sections/sectionDragDrop.js:281` |
| `getInstance` | `webapp/assets/scripts/modules/sections/sectionDragDrop.js:321` |
| `getActiveDraggable` | `webapp/assets/scripts/modules/sections/sectionDragDrop.js:325` |
| `getThemeList` | `webapp/assets/scripts/modules/theme-effects.js:720` |
| `syncOrder` | `webapp/assets/scripts/renderers/renderScheduler.js:244` |
| `removeSection` | `webapp/assets/scripts/renderers/renderScheduler.js:272` |
| `isRendering` | `webapp/assets/scripts/renderers/renderScheduler.js:279` |
| `isDateTransitioning` | `webapp/assets/scripts/renderers/renderScheduler.js:394` |
| `canvasToScreen` | `webapp/assets/scripts/services/CanvasViewport.js:86` |
| `queryPoint` | `webapp/assets/scripts/services/SpatialIndex.js:118` |
| `bounds` | `webapp/assets/scripts/services/SpatialIndex.js:126` |
| `getPeriodConfig` | `webapp/assets/scripts/services/TimelineService.js:37` |
| `getAllPeriodConfigs` | `webapp/assets/scripts/services/TimelineService.js:41` |
| `loadWriting` | `webapp/assets/scripts/services/TypewriterStore.js:416` |
| `saveNotes` | `webapp/assets/scripts/services/TypewriterStore.js:697` |
| `markSettingDirty` | `webapp/assets/scripts/state/store.js:575` |
| `markGoalsDirty` | `webapp/assets/scripts/state/store.js:579` |
| `toggleDarkMode` | `webapp/assets/scripts/state/store.js:866` |
| `putGoal` | `webapp/assets/scripts/storage/bridge.js:471` |
| `getCurrentAdapterType` | `webapp/assets/scripts/storage/bridge.js:832` |
| `isFallbackMode` | `webapp/assets/scripts/storage/bridge.js:1181` |
| `hasListeners` | `webapp/assets/scripts/utils/eventBus.js:65` |
| `getListenerCount` | `webapp/assets/scripts/utils/eventBus.js:74` |
| `getEvents` | `webapp/assets/scripts/utils/eventBus.js:82` |
| `getFocusable` | `webapp/assets/scripts/utils/focusTrap.js:144` |
| `setSafeContent` | `webapp/assets/scripts/utils/htmlUtils.js:19` |
| `setSafeHTML` | `webapp/assets/scripts/utils/htmlUtils.js:27` |
| `createSafeElement` | `webapp/assets/scripts/utils/htmlUtils.js:31` |
| `sanitizeHTML` | `webapp/assets/scripts/utils/htmlUtils.js:48` |
| `stripAllTags` | `webapp/assets/scripts/utils/htmlUtils.js:52` |
| `replaceEmojiWithIcon` | `webapp/assets/scripts/utils/lucideUtils.js:159` |
| `renderIconForData` | `webapp/assets/scripts/utils/lucideUtils.js:164` |
| `getJSON` | `webapp/assets/scripts/utils/storageAdapter.js:39` |
| `setJSON` | `webapp/assets/scripts/utils/storageAdapter.js:56` |
| `getLast` | `webapp/assets/scripts/utils/weatherService.js:241` |
| `hidePanel` | `webapp/assets/scripts/utils/whiteNoiseManager.js:300` |
<!-- AUTO-GENERATED:dead-methods END -->
