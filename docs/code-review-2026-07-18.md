# 代码复盘报告：obsidian-bamboo-review（全面 bug 审查）

> 审查日期：2026-07-18
> 范围：`src/` 全部模块（`ai` 40 / `host` 13 / `views` / `storage` / `bridge` / `settings` / `types` / `constants`）+ `main.ts`
> 方法：5 路并行审查子代理（按模块拆分）+ 高危 claim 源码交叉验证
> 统计（初版）：**高危 17 · 中危 20 · 低危 31**（含 4 条「确认安全/非 bug」说明）
> **2026-07-18 二次逐条源码核验结论**：
> - **高危 17**：误报 2（H2、H5）已剔除；其余部分属实但需修正描述/行号或降级；确凿必修 **H3**（note 模式快照污染）、**H7**（跨年节假日漏算）、**H14**（`putSetting` 无 catch）、**H15**（设置对象校验）。
> - **中危 20**：误报 4（M2/M3/M8/M12）已剔除；确认 9（M1/M4/M7/M9/M13/M15/M16/M17/M18）；部分属实/夸大 7（M5/M6/M10/M11/M14/M19/M20）；确凿必修 **M9/M13/M15/M16/M14/M4/M18**。
> - **低危 31**：**误报 6（L2/L7/L8/L11/L23/L26，均源于错误前提）**、确认 14（L3/L4/L9/L10/L12/L13/L14/L20/L24/L25/L27/L28/L29/L30）、部分属实/夸大 11（L1/L5/L6/L15/L16/L17/L18/L19/L21/L22/L31）。
> - **三档合计误报 12 条已剔除，多条行号被修正。** H5 误报源于把设计选择当 bug，H2 误报源于误认「子项日期影响进度计算」（实际进度只用大目标级字段）；低危误报多源于错误前提（误认 React key、独立 reason 字段、缺 done 为遗漏、id 仅 counter 等）。

---

## 一、高危（High）— 数据丢失 / 崩溃 / 安全 / 计算错误

> **核验说明（2026-07-18 二次审查）**：初版 17 条高危经逐条源码交叉验证后，结论为 **H2/H5 为误报**，**H1/H3/H4/H6/H7/H8/H9/H10/H11/H12/H13/H14/H15/H16/H17 部分属实但描述/行号/严重度需修正**。真实「高优先级必修」仅 H7（跨年节假日）、H15（设置对象校验）、H14 的 `putSetting` 无 catch、H3（note 模式快照污染）等少数几条；多数原「高危」实为健壮性问题或理论风险，已下调。

### 规划核心（`src/ai` + `main.ts`）

- **[H1] ⚠️ 部分属实（机制成立但触发条件窄，原描述夸大）** — 根因在 `main.ts:408-409`，非 419-423
  机制属实：`writeAiGoals` 先无条件 `merged.set(g.id, g)` 并入**全部** `existing`（408-409），再按 `byRefTitle` 找旧 id（419-423）。若用户在规划台改了某目标标题，新标题查不到旧 id → 派生新稳定 id，旧标题目标因已被无条件并入 `merged` 而残留，形成新旧两条。
  *但*：须同时满足「笔记正文已变（触发重新规划）+ 用户在规划台改标题」才会发生；若正文未变，`shouldSkipPlanned`（`idempotency.ts:8-14`）会直接跳过规划，根本不走到改 id 分支。属真实缺陷，但非「泛指改标题即重复」。
  *建议*：合并时除按 id 外，对 `existing` 中未匹配的旧目标按 `sourceRef + 新标题` 复用其 id（或显式把标题变更视为重命名）。

- **[H2] ❌ 误报（已坐实）** — `src/ai/MarkdownPlanner.ts:358-403`（`backfillItemDates`）
  > **先明确（设计意图，非 bug）**：第 343-356 行 `aggregateGoalRange`（阶段 1）实现「大目标区间 = 子项最早起点 / 最晚结束点」的反推，是既定设计、与 web 端口径一致。**「大目标时间由子项最早/最晚自动计算」是有意为之，不是 bug。**
  >
  > H2 原称「阶段 2 给未填 daily 子项均分日期会与已填子项重叠 → 时间错乱污染进度」——**误报**。源码证实进度计算（`DeviationCalculator.ts:131-133`、`healthScore.ts:616`）只用大目标级 `goal.progress` 与 `goal.startDate/endDate`，**从不读取任何子项日期**；daily 子项活动窗口本就可重叠（各自「在窗口内每天做 X」）。子项日期仅用于展示/排期可视化，对偏差率、健康分无任何影响。H2 不构成 bug，移除。

- **[H3] ✅ 确认属实（行号/描述需修正）** — 污染源在 `PlanningSession.ts:97`
  `note` 模式 `init()` 的 `this.initialGoals = this.goals`（97 行）为**引用赋值**，使 `goals` 与 `initialGoals` 指向同一数组；用户手动 edit 工作副本即污染 `initialGoals`，`reset()`（141 行）`this.goals = this.initialGoals` 只是把已被污染的同一引用指回，**回不到 AI 首版**。对比 `edit` 模式 `loadGoals`（168/170 行）做了深拷贝，不受此缺陷影响。**缺陷仅限 note 模式**。
  *修正*：原「`reset()` 都是引用赋值」不准确——reset 的 note 分支（141）是引用赋值，edit 分支（137）是深拷贝。

### 诊断 / 健康 / 偏差（`src/ai`）

- **[H4] ⚠️ 部分属实（真实但不一致被夸大）** — `DeviationCalculator.ts:154-161`
  `cutoff = today - 7` + `d >= cutoff` 实际覆盖 **8 个自然日**，而 `healthScore`（`RECENT_DAYS=7`，`for i in 0..6`）为 **7 天 `[0,7)`**，两边差 1 天属实。但 `DeviationCalculator.recentActivity`（近 7 天完成数）与 `healthScore` 的周活跃是**不同指标、不同用途**，源码未声明须一致；recentActivity 仅作辅助计数，不参与 L3 计算。属轻微边界不一致，非系统级冲突。**降级为低危/中危边界问题。**

- **[H5] ❌ 误报** — `src/ai/healthScore.ts:587-591`
  源码：`score=100; score-=stagnation.penalty; score = score*(1-B)+balance.score*B; score-=overEarly.penalty; score-=delay.penalty`（B=0.1）。四项惩罚**均为线性独立加减，无任何相乘耦合**；balance 混合在「扣 stagnation 后」是作者有意设计（调节已扣停滞后的残分），当 stagnation/overEarly/delay 均为 0 时 `score=100*0.9+balance.score*0.1` 仍接近 100，不存在「永远拉不回」。属设计选择，非 bug。**移除。**

- **[H6] ⚠️ 部分属实（架构风险真实但被夸大）** — `src/ai/runDiagnosis.ts:100,145`
  事实属实：`goals` 在启动时（100 行）一次性 `getGoals()` 得到并贯穿诊断；`onConfirm`（145 行）写回的是基于该快照 `clone` 后**仅精确改写被建议命中目标**的 `res.goals`，写回前未重新拉库。
  *但*：`applySuggestion`（`Suggestion.ts:89-144`）是确定性精确改写（按 goalId/title+子项名命中），只改匹配目标的 `dailyMin/items`，其余目标原样保留于整数组中——**并非覆盖整库**。真正的丢失仅发生在「诊断-确认期间用户对其它（未被命中）目标做了外部修改」时。属真实并发覆盖缺陷，但非「必然/全量数据丢失」。**降为中危。**

- **[H7] ✅ 确认属实（真实且影响计算）** — `src/ai/healthScore.ts:620` + `workdayCalendar.ts:38-53`
  `getHolidays(year)` 单年缓存，`countWorkdays(from,to,holidays)` 只接收一个单年假期集合；调用点 `getHolidays(today.getFullYear())`（DeviationCalculator:134 / healthScore:620）。当目标区间跨年（start 跨入上一年或 end 跨入下一年）时，非当前年的法定节假日未被剔除，工作日计数偏高 → 影响 expectedProgress / 健康分判定。仅跨年目标触发，但确为真实计算错误。**保留高危。**

### 宿主 / 桥接（`src/host`, `src/bridge`）

- **[H8] ⚠️ 部分属实（机制真，但「卸载时永久挂起」被夸大）** — `src/host/AppAPI.ts:146-156`
  `respond/respondError` 在 `this.iframe?.contentWindow` 为 falsy 时静默 `return`、从不 reject，且无超时兜底——**机制属实**。但视图正常卸载时 webapp 随 iframe 一并销毁，`await` 的 Promise 随之失效，**不存在可观测的残留永久挂起**。真正风险是「监听已激活但 iframe 尚未绑定/已解绑的瞬时窗口」（见 H10）。**降级为低危（缺超时兜底的设计瑕疵）。**

- **[H9] ✅ 确认属实（描述需修正）** — `src/bridge/ThemeBridge.ts:22`
  `_suppressed` 确为**静态成员**（22 行）；但 `_paletteSyncTimer` 实为**实例字段**（8 行），原描述「两者都是静态」有误。因 `_suppressed` 为静态，分屏多 ThemeBridge 实例会共享抑制标记：一个视图的 `restoreDefaults`（213 行）会把静态 `_suppressed=true`，跨实例阻止其他视图 `applyPalette` 的防抖写入（203 行）。「永久抑制」不成立——下次 `applyPalette` 会把 `_suppressed=false`（201 行）解除，属「跨实例窗口期干扰」，非死锁。**保留中危/高危，但修正描述。**

- **[H10] ⚠️ 部分属实（低风险设计瑕疵，非可利用漏洞）** — `src/host/AppAPI.ts:164` + `DailyReviewView.ts:98,110`
  时序属实：`startListening`（DailyReviewView:98）先于 `bindIframe`（110）注册，初始化窗口内 `this.iframe` 为 null → 164 行来源校验整支被短路，仅依赖前缀白名单（167 行）与消息类型白名单（177+）。但该窗口极短（仅 blob URL 构建到 iframe 创建的瞬间）、且后续仍有前缀+类型多层校验，**不构成可被利用的跨源安全漏洞**。属低风险设计瑕疵。**降级为低危。**

### 存储 / 视图（`src/storage`, `src/views`）

- **[H11] ⚠️ 部分属实（无数组校验属实，崩溃链被夸大）** — `src/storage/VaultStorage.ts:222-229`
  `getGoals` 确无 `Array.isArray` 校验，`goals.json` 损坏为非数组（null/{}数字）时直接 `as GoalItem[]` 返回。*但*：下游并非全部崩溃——`writeAiGoals` 的 `existing.map`（main.ts:408）与 `importData` merge（VaultStorage:408）会抛 TypeError（属实）；而 `requestAiImprove`/`openPlanEditorForGoals` 只用 `.length` 比较，非数组会静默漏报空目标（不崩）；部分路径还有 `|| []` 兜底。空文件被 `exists` 检测先拦返回 `[]`，概率低于初版描述。属真实健壮性缺陷，**降为中危**，建议返回值 `Array.isArray` 兜底为 `[]`。

- **[H12] ⚠️ 部分属实（理论竞态，非已证实并发丢失）** — `src/storage/VaultStorage.ts` + `main.ts:382-425`
  `writeAiGoals`（main.ts:389 读 + 408-425 合并 + 425 写）确为读-合并-写三段 async，未收拢进单次 `vault.process` 原子回调。*但*：JS 单线程事件循环下，async 函数 `await` 间不被抢占，真正「webapp 经 `storage:putGoals` 全量落库 与 AI 规划落库同时发生且时序精确交错」的概率极低；且 `putGoals` 本身并非 read-modify-write（它不读旧值），真正读改写在 `writeAiGoals`。属理论竞态，**降为低危**，建议将读-合并-写收进一次 `vault.process`。

- **[H13] ⚠️ 部分属实（实为二次确认机制，描述需修正）** — `src/storage/VaultStorage.ts:235-248`
  `_warnedPaths` 首次拦截后放行后续空写，是**设计意图的「二次确认」**（注释 27 行），并非「形同虚设」。import 的 overwrite/merge（412/415 行）确实共用同一守卫；仅当「导入数据 goals 为空数组 且 vault 已有目标」时，首次清空型导入会被拦截一次——且会**弹出 Notice 提示**（240-242 行），非「静默丢失」。正常非空导入不触发。**降为低危/非 bug（设计行为）。**

- **[H14] ✅ 确认属实（描述需修正）** — `src/storage/VaultStorage.ts:295-299`
  `putSetting` 的 TFile 分支（295-299）`JSON.parse` 无 try-catch，损坏时向上抛异常——**属实**。*但*：`getSetting`（284-287）借 `getAllSettings` 的 catch 兜底不会因损坏抛错（原「getSetting 无 catch」需修正）；且 TFile 下 `vault.process` 失败不写盘，**旧设置不丢**。真正会「丢失全部旧设置」的是 else 分支（300-301）：当 settings.json 不在 Obsidian 缓存中时，`vaultWrite` 用 `remove+create` 只写单键值，覆盖旧设置。**保留中危，修正描述。**

- **[H15] ✅ 确认属实** — `src/storage/VaultStorage.ts:305-316`
  `getAllSettings` 仅 `JSON.parse` 抛错时兜底为 `{}`，对「parse 成功但类型非对象」（如 `"abc"`/数字）未校验；merge 策略下 `|| {}` 只对 falsy 兜底，真值非对象（字符串/数字）会被 `{...existing, ...incoming}` 展开导致合并错乱。触发条件：settings.json 内容为 `"abc"`/`123` 等真值非对象 + 走 merge 策略。**保留高危（设置损坏致数据错乱）。**

### 入口（`main.ts`）

- **[H16] ⚠️ 部分属实（void 未 await 属实，红条风险被夸大）** — `main.ts:122-156`
  6 个 AI 命令回调 `() => void this.xxx()` 用 `void` 显式丢弃 Promise、未 await——**属实**。*但*：Obsidian 命令回调类型本支持 `Promise`，`void` 仅为抑制 floating-promise 警告；且各 async 方法内部已用 `new Notice` 覆盖全部已知失败分支（main.ts:199/205/213/217/397/441 等），用户反馈基本有兜底；仅深层未预料的 rejection 会以 unhandledRejection 红条呈现，概率低。属代码风格/健壮性瑕疵，**降为中危**。

- **[H17] ⚠️ 部分属实（理论隐患，且路径描述有误）** — `main.ts:382-442`
  `writeAiGoals` 确为无锁读改写——**属实**。*但*：`requestAiImprove`（`onAiImproveGoal`，main.ts:491-530）落库走的是 `writeDiagnosedGoals`（529 行），**不是 `writeAiGoals`**，原「AppAPI onAiImproveGoal 列为并发路径」不准确；真实并发入口主要是 note/selection 两条规划链路，且 JS 单线程 + 用户操作串行下几乎不可能精确交错。**降为低危（理论风险）。**

---

> **修正后高危结论**：原 17 条中，**误报剔除 2 条（H2、H5）**，**降级 9 条（H1/H4/H6/H8/H10/H11/H12/H13/H16/H17）**，**保留为确凿高危/中危必修的仅 H3（note 模式快照污染）、H7（跨年节假日）、H14 的 putSetting 无 catch、H15（设置对象校验）**，其余 H1/H9/H6 等视严重度并入中/低危跟踪。详见下方修正优先级。

## 二、中危（Medium）

> **核验说明（2026-07-18 二次源码核验）**：20 条中危逐条核验后 —— **误报 4 条（M2/M3/M8/M12，已剔除）**；**确认属实 9 条（M1/M4/M7/M9/M13/M15/M16/M17/M18，部分需修正行号）**；**部分属实或夸大 7 条（M5/M6/M10/M11/M14/M19/M20）**。真正值得修的确凿项：M15/M16（导入校验误伤/透传）、M9（重名目标证据覆盖）、M13（大文件 OOM）、M4（UTC 取今天偏移）、M14（改设置未持久化）、M18（冗余断言屏蔽类型检查）。

**规划核心**
- [M1] ✅ 确认属实（措辞收窄）— `AgenticPlanController.ts:152`（initPlan 调用）
  `initPlan` 无 `disposed`/取消守卫，Modal 关闭后 await 续作仍执行——但 `rebuildTree`/`renderChat` 有 `if(!el) return` 空值守卫，不会抛 DOM 异常；真实后果是「续作仍跑 + 可能重复 `requestClose` + 向已失效 chatLog 推送」，非「操作已销毁 DOM 崩溃」。
- [M2] ❌ 误报 — `GoalElicitorModal.ts:138-156`
  catch 分支仅 `loading=false` + 渲染错误/重试，**从不写 `turns`/`qa`**；提交路径另有 `if(this.loading) return` 守卫。无污染路径，移除。
- [M3] ❌ 误报 — `frameworks.ts:108-116`
  四种专业框架的 `appliesTo` 集合**互不相交**且 `quantify` 被 `continue` 跳过，每个 kind 至多唯一命中，遍历顺序无关，结果确定可复现。移除。
- [M4] ✅ 确认属实（行号需修正）— `GoalElicitor.ts:171/379` + `MarkdownPlanner.ts:175/218`
  `new Date().toISOString().slice(0,10)` 取 UTC 日期，本地跨午夜时「今天」偏移一天。**修正：`frameworks.ts` 中并无此用法**，正确位置为 GoalElicitor.ts:171/379、MarkdownPlanner.ts:175/218。
- [M5] ⚠️ 部分属实/夸大（行号错）— `GoalElicitor.ts`（通过判定 `runRound:132`）
  通过条件仅查 `diseases.length===0`，确实不校验结构化字段非空。但「空壳简报」夸大——`briefToPlanningText` 对每个字段有 `if` 空值守卫、拆分/规划有 base 继承兜底，弱输出只是「信息稀薄」不崩。**原行号 321（实为过滤已答问题）/438（不存在）均错。**

**诊断/健康**
- [M6] ⚠️ 部分属实/夸大 — `runDiagnosis.ts:113-115`
  本层对 `getDayKeys()` 结果仅 `.slice(0,windowDays)`，未排序/未过滤未来日期——属实。但「取到陈旧/未来数据」取决于 `storage.getDayKeys()` 的返回顺序（不在本文件），属**潜在风险非已证 bug**；且大窗口是为停滞判定的设计意图。
- [M7] ✅ 确认属实 — `DeviationCalculator.ts:171-173`
  `!hasDates` 分支短路优先于 `stuck` 分支，缺日期目标只返回 behind/on_track，`stagnation` 即便为 true 也不会标 stuck/at_risk，可能掩盖真实停滞。
- [M8] ❌ 误报 — `SuggestionApplyModal.ts:34-46`
  `findItem` 仅**只读**用于生成预览文案，`after` 快照在 Modal 构造前已固定；真正改写在 `Suggestion.ts` 的确定性 `applySuggestions`，不在本 Modal 累积 index。移除。
- [M9] ✅ 确认属实 — `DeviationCalculator.ts:264` + `DiagnosisModal.ts:157`
  `buildItemEvidenceMap` 以 `g.title` 为 key 直接赋值，重名目标子项证据互相覆盖只剩最后一条。确凿，建议改用 goalId 为 key。
- [M10] ⚠️ 部分属实/夸大（行号修正）— `GoalDiagnoser.ts:174-176`（非 182）
  缺/非法 `status` 兜底为 `'behind'`，可能把 AI 漏写 status 的目标误标落后，污染 UI 徽标——属实。但「污染下游应用入口」夸大：应用只消费 `suggestions`，不消费 `goal.status`。

**宿主/桥接**
- [M11] ⚠️ 部分属实/夸大 — `protocol.ts:22,40`
  `storage:*` 注释写 17 实际 18（笔误）属实；`INBOUND_PREFIXES` 含 `file:` 但无对应类型属实。但「错误归类为 storage 消息」夸大——`file:` 不会作为真实消息进入 `handleMessage`，仅为白名单冗余项，无运行时误分类。
- [M12] ❌ 误报 — `AppHost.ts:38,62`
  真正防重下载机制在 `ensureWebapp` 的本地存在性 + 版本戳守卫（`ensureWebapp:94-99`），非 `prefetchCache`；`buildBlobUrl` 直接调 `ensureWebapp` 时守卫可避免重复下载。无确证双重写盘。移除。
- [M13] ✅ 确认属实 — `AppAPI.ts:401-438`（入口分发 249-258）
  `handleReadVaultFile`/`handleReadLocalFile` 无体积上限，整文件 `readBinary` + base64（膨胀 ~33%）一次性入内存并 postMessage 回传，大音频文件有 OOM 风险。建议加 `stat.size` 上限。
- [M14] ⚠️ 部分属实/夸大 — `AppAPI.ts:140-143`
  `onThemeChanged` 改 `settings.followObsidianTheme` 后**未 `saveSettings()`**（对比同文件 saveSectionConfig/saveCustomNoises 均持久化）——确凿中危。「语义混淆」夸大：命名/参数语义不够贴切，但逻辑自洽非错误。

**存储/视图**
- [M15] ✅ 确认属实 — `ImportValidator.ts:36-46`
  `sanitizeString` 正则 `/<[^>]*>/g` 会误剥 `"a < b"`，`/data:/gi` 会清空合法 `data:` URI，造成合法数据丢失。
- [M16] ✅ 确认属实 — `ImportValidator.ts:149-150`
  `normalizeGoals` 对非对象项 `return raw as GoalItem` 原样透传，随 `validate()` 落盘污染 Vault goals 数组。
- [M9/M15/M16 为本区确凿必修]

**入口**
- [M17] ✅ 确认属实（描述微调）— `main.ts:545-550`
  `setViewState` 后立即清空 `pendingPlanOpts`，异步时序窗口下视图工厂可能读到 `undefined` → 由 `PlanEditorView.render` 兜底显示**占位页**（非纯白屏）。
- [M18] ✅ 确认属实 — `main.ts:460-464`
  `diagnose as unknown as typeof diagnose` 是对已是该类型的值做冗余双重断言，`as unknown as` 会屏蔽未来签名变更的编译期报错。建议删除断言。
- [M19] ⚠️ 部分属实/夸大（归因行号修正）— `main.ts:480-485`（`writeDiagnosedGoals`，非 491-531）
  `notifyGoalsChanged` 经 `getTarget()?.` 在 DailyReviewView 未打开时静默无操作——机制属实。但触发点在 `writeDiagnosedGoals`（onConfirm 落库回调），非 `requestAiImprove` 函数体本身。
- [M20] ⚠️ 部分属实/夸大 — `main.ts:302-312`
  多目标分支 `frameworks[i]` 长度不一致会得 undefined，但被 `?? 'quantify'`（310 行）兜底仅标签降级；仅单目标分支 `frameworks[0]`（312 行）无 `??` 兜底。原「均无兜底」笼统。

---

## 三、低危（Low）

> **核验说明（2026-07-18 二次源码核验）**：31 条低危逐条核验后 —— **误报 6 条（L2/L7/L8/L11/L23/L26，已剔除）**，均源于错误前提（误认 React key、误认存在独立 reason 字段、误认缺 done 为遗漏、误认 id 仅 counter 等）；**确认属实 14 条（L3/L4/L9/L10/L12/L13/L14/L20/L24/L25/L27/L28/L29/L30）**；**部分属实或夸大 11 条（L1/L5/L6/L15/L16/L17/L18/L19/L21/L22/L31）**。低危整体危害小，本节仅记录结论与行号修正，不展开修复建议。

**规划核心**
- [L1] ⚠️ 部分属实（非真实 null 风险）— `AgenticPlanController.ts:209-210`\n  先 `input?.value.trim()` 再 `!input` 判空——因用了可选链 `?.`，`input` 为 null 时 `text` 直接 `undefined` 不会抛错，纯代码风格瑕疵，无真实崩溃风险。
- [L2] ❌ 误报 — `MarkdownPlanner.ts:412-435`\n  本函数仅一次 `JSON.stringify(data)` 单向兜底输出，无任何 `JSON.parse`，不存在「stringify 往返」。剔除。
- [L3] ✅ 确认属实（行号修正）— `PlanningSession.ts:95`（非 95/110）\n  `init` 的 `JSON.parse`（95 行）无 try-catch，损坏即裸抛；`send`（110 行）外层已有 try/catch 容错。仅 `init` 缺。
- [L4] ✅ 确认属实 — `GoalCardValidator.ts:27-35`\n  括号正则 `[一-龥]+` 只匹配中文，`(5km)` 等含拉丁/数字的单位无法捕获，返回 `''` 致显示偏差。
- [L5] ⚠️ 部分属实（非整条漏报）— `GoalDiagnoser.ts:255-260`\n  三维摘要要求 `penalty>0 && hint` 才展示，hint 为空时该行不显示——属实；但归因另由 `generateHealthHints` 生成，不能算整条诊断漏报。
- [L6] ⚠️ 部分属实/夸大（行号修正）— `Suggestion.ts:103-112`\n  「无上限」属实（仅 `Math.max(0, Math.round(v))`）；但负值已被 `v < 0` 前置校验 + `Math.max(0,...)` 双重阻断，不会成负值。行号实为 103-112 分支。
- [L7] ❌ 误报 — `DiagnosisProgressModal.ts:15-16`（PHASE_ORDER）\n  注释明确「展示顺序（不含 done）」，done 是终态本就不展示；`PHASE_ORDER` 字面量无重复元素，无「重复 phase 渲染异常」。剔除。
- [L8] ❌ 误报 — `PlanConfirmModal.ts:247-249`\n  `GoalSubItem` 类型（data.ts:43-57）无独立 `reason` 字段，AI 的 `reason` 在 MarkdownPlanner:290 已映射进 `detail`；删 `detail` 即删干净，无残留。剔除。
- [L9] ✅ 确认属实 — `DiagnosisModal.ts:296-299`\n  Modal 层应用按钮直接 `onApply`+`close`，无 `applied` 标记/禁用；因点击即关闭，实际需重开报告才触发，影响有限。
- [L10] ✅ 确认属实 — `runDiagnosis.ts:145`（及 167/194/152/174/201）\n  `onConfirm: (final) => void deps.writeGoals(final)` 一律 `void` 包裹无 `.catch`，`writeGoals` 拒绝时异常被静默吞掉。
- [L11] ❌ 误报 — `DeviationCalculator.ts:31-35,84-85`\n  项目无 `.tsx`、非 React 应用，不存在 React `key` 复用机制；下标仅作数据聚合缓存键（确定性映射），与 React key 稳定性无关。剔除。
- [L12] ✅ 确认属实（关联 H7）— `workdayCalendar.ts:38-44`\n  `_holidayCache` 以单年 `year` 为键、只缓存单年集合；跨年/长周期目标漏算非缓存年侧节假日，与 H7 同根。

**宿主/桥接**
- [L13] ✅ 确认属实 — `AppAPI.ts:159-161`\n  `onMessage` 入口 `!msg.id` 直接 `return`，全程无日志，缺 id 消息被静默丢弃极难排查。
- [L14] ✅ 确认属实 — `AppAPI.ts:339-397`\n  `scanVaultAudioFiles` 递归仅受 `depth>maxDepth` 限制，无取消/销毁感知，`detach` 后仍在跑。
- [L15] ⚠️ 部分属实/夸大 — `ThemeBridge.ts:41-63`\n  正则仅支持 hex/rgb，hsl/var 返回 null——属实；但仅 `pushTheme` 中基于 CSS 变量反推的 `hue/bg/text` 衍生字段被静默跳过，主题明暗跟随本身不受影响。
- [L16] ⚠️ 部分属实/夸大 — `AppAPI.ts:146-156`\n  用 `postMessage(payload,'*')` 通配属实；但 iframe 为同源 blob、`onMessage` 有 `event.source` 校验，实际无跨源泄露面，属不良实践。
- [L17] ⚠️ 部分属实/夸大 — `WebappController.ts:62-64`\n  `notifyGoalsChanged`/`sendCommand` 无 `app:ready` 握手门控——属实；但仅为「iframe 刚创建、webapp 尚未注册监听」竞态窗口内可能丢消息，非必然。
- [L18] ⚠️ 需修正行号（结论属实）— `AppAPI.ts:183-186`（非 protocol.ts）\n  版本不匹配仅 `console.warn`，用户不可见——属实；但 `console.warn` 在 `app:ready` 处理分支（AppAPI.ts:183），`protocol.ts` 仅定义 `PROTOCOL_VERSION` 常量。

**存储/视图/类型/常量**
- [L19] ⚠️ 部分属实/夸大 — `VaultStorage.ts:324-331,344-351`\n  「无 try-catch/对象校验」属实；但损坏时 `adapter.read`/`JSON.parse` 直接**抛异常**（非返回非数组），会中断调用链。
- [L20] ✅ 确认属实 — `VaultStorage.ts:431-436`\n  import 时 `purchaseHistory/incomeHistory` 仅 `sanitizeValue` 净化、直接 `putPurchaseHistory/IncomeHistory` 透传，无结构归一化。
- [L21] ⚠️ 部分属实/夸大（行号修正）— `VaultStorage.ts:422-424`（settings merge）\n  merge 直接 `{...existing,...incoming}` 展开、未对业务字段归一化——属实；但已用 `|| {}` 与 catch 兜底防空/异常展开，非「必然错乱」。行号 407 实为 goals merge，settings merge 在 422-424。
- [L22] ⚠️ 部分属实/夸大 — `PlanEditorView.ts:59,68`\n  reload 新建 ctrl 前未 `unmount` 旧 ctrl——属实；但 `render` 先 `container.empty()` 清除了旧 DOM 及绑定其上的监听，不会叠加；仅旧 ctrl 对象（含 session）未即时置空的轻微整洁性问题。
- [L23] ❌ 误报 — `DailyReviewView.ts:54,58,112-114`\n  `children[1]` 脆弱属实；但「重复注册监听无防御」不实——`css-change` 监听已用 `cssChangeRef` 保存并在 `onClose` 以 `offref` 注销，有防御。剔除。
- [L24] ✅ 确认属实 — `PluginSettings.ts:313-332`\n  头像读取 `void (async()=>{...})()` fire-and-forget 并发无锁；且用 `Buffer.from(...)`（Node `Buffer`），移动端 Obsidian 可能不可用。
- [L25] ✅ 确认属实（行号修正）— `types/data.ts:99-105`（非 130-134）\n  `AppSettings`（data.ts:99-105）与 `BambooReviewSettings`（PluginSettings.ts:19-46）独立无约束，导入无编译期强校验。原行号 130-134 实为 `ExportShape`。
- [L26] ❌ 误报 — `ImportValidator.ts:154`\n  生成 id 为 `goal_import_${counter++}_${Date.now().toString(36)}`，**含 `Date.now()` 时间戳熵**，非「仅 counter」；且 purchase/income 不经此 id 生成。剔除。
- [L27] ✅ 确认属实（非缺陷）— `constants/audio.ts:13`\n  `.m4a→audio/mp4` 映射本身正确（业界通用）；「部分环境兼容性问题」属合理风险提示，非代码错误。

**入口**
- [L28] ✅ 确认属实 — `main.ts:191-193`\n  `onunload` 仅调 `ThemeBridge.restoreDefaults()`；`ThemeBridge` 无 `setInterval`，仅 `applyPalette` 内单次 50ms `setTimeout` 防抖且被静态 `_suppressed` 兜底，无泄漏、对称安全。
- [L29] ✅ 确认属实（文档问题）— `main.ts:33-40` + `src/ai/goalId.ts:9-25`\n  `hashContent`=djb2、`deriveStableGoalId`=FNV-1a，算法不同、命名易混，纯可读性/文档问题。
- [L30] ✅ 确认属实 — `main.ts:606-609`\n  `Object.assign` 浅合并；嵌套字段会整体覆盖，但 `sectionConfig`/`noiseItems` 设计上整存整取、其余为标量，当前安全。
- [L31] ⚠️ 部分属实/需修正描述 — `main.ts:281-327`\n  `runElicit` 函数本身活跃（两处调用），但其第三形参 `_scope` 函数体内**完全未引用**（下划线前缀 + `no-unused-vars` 抑制注释佐证），确为死参。原「已确认非死代码」表述混淆——应明确「函数活跃但参数死」，结论「可简化移除」正确。

---

## 四、确认安全 / 无问题区域

- `src/ai/goalId.ts`（`fnv1a` 实现正确）、`src/ai/idempotency.ts`（`shouldSkipPlanned` 逻辑闭合）
- `src/ai/AgenticPlanModal.ts`（薄壳透传无自有逻辑）
- `main.ts` 导航命令（`getTarget()?.sendCommand` 可选链安全）、`onload`/`onunload` 生命周期对称、`rebuildAiGoals` 死引用已彻底清除、`writeAiGoals` 幂等核心（id 复用/索引失效清理）逻辑正确、`activateView`、`openPlanEditorForGoals`、AI 规划前置校验、`WebappController` 门面
- `src/host/WebappController.ts`、`src/host/protocol.ts` 常量定义本身无逻辑错误（仅一致性瑕疵见 M11/L18）

**用户明确的设计意图（非 bug，特记于此）**：
- `src/ai/MarkdownPlanner.ts:343-356` `aggregateGoalRange`（阶段 1）：「大目标的时间区间 = 子项最早起点 / 最晚结束点自动计算」是既定设计（与 web 端口径一致），**不是缺陷**。任何对「大目标时间由子项反推」的质疑均不成立（见 H2 上方说明）。

---

## 五、修复优先级建议（按核验结论修正）

1. **P0（确凿数据/设置完整性）**：
   - H15（`getAllSettings` 无对象校验 → merge 策略下设置损坏致数据错乱）— 真高危，必修
   - H14 `putSetting` TFile 分支无 catch + else 分支 `remove+create` 覆盖旧设置 — 真中危，必修
   - H3（note 模式 `initialGoals` 引用赋值污染快照，reset 回不到 AI 首版）— 真高危，限于 note 模式
   - H7（跨年目标节假日漏算，工作日/健康分计算失真）— 真高危，限于跨年目标
2. **P1（真实但需降级的缺陷）**：H1（改标题重复目标，触发条件窄）、H6（诊断写回陈旧快照，仅影响诊断期间外部改动的目标）、H9（静态 `_suppressed` 跨视图窗口期干扰）、H11（getGoals 无数组校验）
3. **P2（理论/低风险，按资源决定）**：H12/H17（理论并发竞态）、H8（响应无超时兜底）、H10（iframe 绑定前来源校验短路，低风险）、H13（空写守卫实为二次确认）、H16（void 未 await，内部已 Notice 兜底）、H4（近7天窗口口径差 1 天）
4. **已剔除（误报，非 bug）**：H2（子项日期不影响进度，重叠非错乱）、H5（四项惩罚线性独立加减，balance 为有意设计）

> 注：本报告经两轮审查（初版静态审查 + 2026-07-18 逐条源码核验）。未运行测试、未修改任何文件。对 P0 每项建议先补回归测试再修复。

---

## 六、修复执行记录（2026-07-18 第二轮）

**范围**：确凿高危 4 条（H3 / H7 / H14 / H15）+ 中危必修 7 条（M4 / M9 / M13 / M14 / M15 / M16 / M18）。共 11 项，已全部落地。

| 项 | 文件 / 行号 | 改动 |
|---|---|---|
| H3 | `PlanningSession.ts:97,141` | init 与 note 模式 `reset` 改用 `JSON.parse(JSON.stringify(...))` 深拷贝首版快照，避免后续 edit 污染 `initialGoals` |
| H7 | `workdayCalendar.ts` + `healthScore.ts:620` + `DeviationCalculator.ts:134/233` | 新增 `getHolidaysForRange(from,to)` 合并区间所有年份节假日；两处调用点改用之，跨年目标不再漏算 |
| H14 | `VaultStorage.ts:296` | `putSetting` TFile 分支 `JSON.parse` 加 try-catch，损坏时以空对象兜底、不抛错中断 |
| H15 | `VaultStorage.ts:312` | `getAllSettings` 校验 `parsed` 非对象/为数组则返回 `{}`，避免 `{...existing}` 展开错乱 |
| M4 | `GoalElicitor.ts:171,379` + `MarkdownPlanner.ts:175,218` | UTC `toISOString().slice(0,10)` 改为本地日期格式化，避免跨午夜偏移 |
| M9 | `DeviationCalculator.ts:264` + `DiagnosisModal.ts:157` + `runDiagnosis.ts` + `GoalDiagnoser.ts` | 证据 map 改用 `goal.id`；`GoalDiagnosis` 加 `id?`；`runDiagnosis` 按 title 补全原目标 id；`itemEvidence` 双写 `id`+`title`（title 作回退），解决重名目标证据互相覆盖 |
| M13 | `AppAPI.ts:415,433` | 新增 `MAX_AUDIO_FILE_BYTES`(50MB)，库内/本地文件读取前做体积上限检查（本地文件 `stat` 不可用时降级跳过检查） |
| M14 | `AppAPI.ts:142` | `onThemeChanged` 改设置后加 `void this.saveSettings()` 持久化，与同文件其他 save 行为一致 |
| M15 | `ImportValidator.ts:39,44` | 收紧净化正则：`/<[^>]*>/`→`/<\/?[a-zA-Z][^>]*>/`（保留 `a < b` 文本）；`/data:/`→仅移除可执行类型（保留 `data:image/png` 等合法资源） |
| M16 | `ImportValidator.ts:149` | `normalizeGoals` 非对象项返回 `null` 并 `.filter` 跳过，不污染 Vault `goals` 数组 |
| M18 | `main.ts:464` | 删除 `diagnose as unknown as typeof diagnose` 冗余双重类型断言 |

**验证**
- `npx tsc --noEmit` 通过（0 错误）。
- `npx jest`：**217 passed / 0 failed**（23 套件通过、1 跳过），无回归。

**说明**：本轮未对 `src/ai` 等核心逻辑补专项单测（现有 jest 仅覆盖 `webapp/` 目录）。如需更高保险，可后续补 H7 跨年、H15 非对象、M16 非对象三项针对性单测。P0 之外的 H1/H6/H9/H11（P1）等尚未处理，按需跟进。

---

## 七、P1 修复 + 核心逻辑单测补全（2026-07-18 第三轮）

**P1 四项（确凿高危降级项）全部修复**

| 项 | 文件 / 行号 | 改动 |
|---|---|---|
| H1 | `main.ts:408` | `writeAiGoals` 合并前跳过「同笔记且标题已不在本次规划新标题集」的旧目标，视为被重命名，由新目标以新派生 id 上位，避免「旧标题残留 + 新标题」双条 |
| H6 | `runDiagnosis.ts:100/145/167/194` + `DiagnosisStorage.getGoals` | 三处 `onConfirm` 写回前重新 `getGoals()` 拉最新库，仅以「被建议命中的目标（按 `goalRef.goalId`）」覆盖；`final` 兼容单对象/数组并保持回写形状，避免覆盖诊断期间外部改动（陈旧快照问题） |
| H9 | `ThemeBridge.ts:22/201/203/212` + `main.ts:192` + `PluginSettings.ts:209` | `_suppressed` 由静态成员改为**实例字段**；`restoreDefaults` 改实例方法并新增进程单例 `ThemeBridge.default`；`onunload` 与设置面板改调 `ThemeBridge.default.restoreDefaults()`，避免分屏多实例互相抑制 |
| H11 | `VaultStorage.ts:222` | `getGoals` 解析后校验 `Array.isArray`，非数组返回 `[]`，避免下游 `.map`/`.length` 抛错 |

**核心逻辑单测（vitest，覆盖 `src/**/__tests__/*.test.ts`）补全**

第二轮已确认核心逻辑单测走 **vitest**（`test:host`），非 jest（jest 仅覆盖 `webapp/`）。本轮为本次修复补充针对性回归用例，并修复因 H6/M9 语义变更而需更新的断言：

| 测试文件 | 新增/变更 | 锁定项 |
|---|---|---|
| `src/ai/__tests__/runDiagnosis.test.ts` | 更新诊断断言（验证 M9 补全 `id`）、写回断言改异步等待；**新增 H6 专项**：模拟诊断期间外部增删，验证写回仅覆盖命中目标且尊重外部改动 | M9 / H6 |
| `src/ai/__tests__/workdayCalendar.test.ts` | **新增 `getHolidaysForRange` 跨年合并**用例：区间同时含起始年与结束年节假日，对照单年 `getHolidays` 确认不漏算 | H7 |
| `src/ai/__tests__/planningSession.test.ts` | **新增 H3 深拷贝**用例：init 后篡改工作副本，reset 回到首版（未被污染） | H3 |
| `src/host/__tests__/vaultStorage.test.ts` | **新增 H11** 用例：损坏为非数组时 `getGoals` 返回 `[]` 不抛错 | H11 |
| `src/storage/__tests__/importSanitize.test.ts` | **新增 M15**（保留 `a < b` 文本与合法 `data:image/png`）、**M16**（非对象 goal 项被过滤不污染数组）用例 | M15 / M16 |

**验证**
- `npx tsc --noEmit` 通过（0 错误）。
- `npx vitest run`：**32 文件 / 312 用例全部通过**，无回归。
- `npx jest`（webapp）：217 passed / 0 failed，无回归。

**说明**：P0 与 P1 全部闭环。报告所列「确认属实 / 部分属实」低危项中仍有若干未处理（如 L10 诊断写回 `void` 吞错误、L12 跨年节假日已随 H7 解决、L14 扫描无取消、L24 头像读取 fire-and-forget 等），按需跟进即可。

## 八、P2 低危跟进（2026-07-18 第四轮）

本轮处理第七轮说明中遗留的「确认属实」低危项 **L10 / L14 / L24**，并补回归测试。L12 已随 H7 解决，不在本轮。

| 项 | 文件 / 行号 | 改动 |
|---|---|---|
| **L10** | `runDiagnosis.ts:100/145/167/194` | 诊断写回 `onConfirm` 原为 `void deps.writeGoals(...)`（及 `writeMergedWithLatest` 内 `await deps.writeGoals` 无 catch），`writeGoals` 失败时异常被 fire-and-forget 静默吞掉。新增 `writeGoalsSafe`（`Promise.resolve().then(f).catch → deps.notice`）供三处 escalate 回调使用；`writeMergedWithLatest` 整体包 `try/catch`，写回失败转成用户可见提示 `应用 AI 建议失败：<原因>`，不再丢错。 |
| **L14** | `AppAPI.ts:70/116/339-360` | 新增实例字段 `disposed`；`detach()` 置 `true`、`startListening()`（重新 attach）复位 `false`；`scanVaultAudioFiles` 在入口与噪声目录 `await adapter.list` 之后各加 `if (this.disposed) return results` 提前终止，避免视图关闭后全库扫描仍在跑、空耗。 |
| **L24** | `PluginSettings.ts:313` + 新增 `src/utils/base64.ts` | 头像读取 `Buffer.from(avatarData).toString('base64')` 依赖 Node `Buffer`，移动端 Obsidian 不可用。抽取跨平台 `arrayBufferToBase64`（浏览器标准 `btoa` 分块，避免大文件调用栈溢出）至 `src/utils/base64.ts`，AppAPI 与原地读取均改用之；桌面/移动端一致可用。**注**：原 fire-and-forget 并发本身保留——头像着色属非关键 UI，适合异步、失败不阻断，本轮仅修正跨平台 base64。 |

**回归测试（vitest）新增**

| 测试文件 | 新增 | 锁定 |
|---|---|---|
| `src/ai/__tests__/runDiagnosis.test.ts` | L10：单条应用写回失败 → 经 `notice` 暴露而非静默吞掉；L10：escalate(AI 接管)写回失败 → 同样经 `notice` 暴露 | L10 |
| `src/utils/__tests__/base64.test.ts` | 小数据 / 单字节边界 / 跨 `0x8000` 分块大文件，结果均与 Node `Buffer` 基准一致 | L24 |
| `src/host/__tests__/audio.test.ts` | L14：已 `detach` → 扫描直接返回空且不再读库（`list` 未被调用）；L14：扫描进行中 `detach` → 提前终止（`list` 执行时置 `disposed`，返回文件不被收集） | L14 |

**验证**
- `npx tsc --noEmit`：0 错误。
- `npx vitest run`：**33 文件 / 319 用例全部通过**（较上一轮 +7：L10×2、base64×3、L14×2），无回归。
- `npx jest`（webapp）：217 passed / 0 failed，无回归。

**说明**：至此报告所列 P0（11 项）、P1（4 项）、P2 低危确认项（L10/L14/L24）全部闭环。其余「部分属实/夸大」低危项（L1/L3/L4/L5/L6/L9/L12/L13/L16/L17/L18/L19/L20/L21/L22/L25/L27/L28/L29/L30 等）多为健壮性问题或理论风险，按需再跟进。
