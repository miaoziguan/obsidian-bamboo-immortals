# Changelog

## [3.32.2] — 2026-10-26

> 把 Obsidian 官方审核规则**本地化**：不等退回，提交前就能自查。
> 无运行时行为变化（仅工具链 + 源码卫生）。

### Added
- **`scripts/check-review-rules.mjs`**（CI 第 5 道闸门，4 条确定性检查）：
  ① 禁止对 `no-console` 使用 eslint-disable（官方判 Error）；
  ② 所有 eslint-disable 必须带 `-- 描述`（官方 `undescribed-directive`）；
  ③ 注释里不得「散文式提及」指令字面量（扫描器按文本匹配，易误判）；
  ④ 禁止在字符串字面量里硬编码 `.obsidian`（官方 `no-hardcoded-config-dir`，应改用 `vault.configDir`）。
- **`npm run preflight`**：一条命令跑完「审核者视角自检」= lint（含无用 disable 检查）+ tsc + 4 道闸门。

### Changed
- 启用 `@typescript-eslint/no-unnecessary-type-assertion`（**error**），对齐官方审核
  —— 正是 3.32.0 被退回的那条 Warning。
- `npm run lint` 增加 `--report-unused-disable-directives`：无用 disable 现在直接报错。
- `AGENTS.md` 新增 §5.1「审核闭环」：官方每退回一条 → 立刻转成本地检查并演示"违规即失败"，
  不允许"下次记得注意"。

### Fixed
- 清理 3 处冗余 `as const`（`src/license/licenseStore.ts`，类型不变）。
- 清理 **6 条已失效的 eslint-disable 死指令**
  （`types/data.ts`×3、`ai/MarkdownPlanner.ts`×2、`ai/GoalCardValidator.ts`×1）。

## [3.32.1] — 2026-10-26

> 修复 Obsidian 官方源码审核（Source review）报出的 1 个 Error + 1 个 Warning。

### Fixed
- **Error · 禁止屏蔽 `no-console`**（`src/host/AppAPI.ts`）：`handleMessage` 兜底对未知消息类型的
  `console.warn` 使用了 `eslint-disable no-console`，而 Obsidian 发布校验不允许禁用该规则。
  已移除该告警与 disable 注释。该静默路径改由两道确定性闸门覆盖：
  契约测试（59 个类型逐一断言不会落到兜底）+ 协议镜像闸门（host/webapp 类型集合一致）。
- **Warning · 多余的类型断言**（`src/host/handlers/settingsHandlers.ts`）：
  `payload as Record<string, unknown> | null` 中 `payload` 本就是 `Record<string, unknown>`，
  断言冗余，已去掉。

## [3.32.0] — 2026-10-26

> 本版以**工程质量**为主：无用户可见的行为改动（除两处静默失效被修掉、一处协议注册表补全）。

### Added
- **覆盖率基建**：webapp 测试改为可插桩（`COVERAGE_EVAL=1`），并新增**绝对已覆盖语句数**门禁；
  当前基线 8705 条（解决「1016 个绿灯但覆盖率恒 0/0、无法评估」的盲区）。
- **性能测量**：新增 `utils/perf.js`（环形缓冲 + p50/p95）与 5 处关键路径插桩
  （`layout:enter` / `layout:off` / `render:flush` / `boot:first-render` / `save:*`）。
  控制台执行 `BambooPerf.report()` 可查看。此前全仓**零性能测量**。
- **两道 CI 闸门**：`check-message-contract`（协议镜像同步 / 路由键唯一 / 入站前缀合规）、
  `check-window-globals`（window 挂载点清单与源码一致）。连同既有 load-matrix 与覆盖率门禁，共 4 道。
- **`AGENTS.md`**：记录本仓库的工作守则与实证来源（含 8 类已踩过的坑）。

### Changed
- **AppAPI 拆分**：`AppAPI.ts` 2142 → 1547 行；`handleMessage` 由 950 行 / 31 个 if 分支
  降为 117 行（仅 `app:ready`），其余按领域拆入 `src/host/handlers/` 共 11 个模块，
  统一经 `HostContext` 门面访问宿主。
- **goals 渲染器拆分**：`goals/renderer.js` 1659 → 1059 行
  （健康详情模板 → `healthDetailView.js`；行内编辑编排 → `inlineEditStarter.js`）。
- **typewriter 模板抽出**：`typewriterFeature.js` 2223 → 2159 行（`_ensureDom` 113 → 49）。
- **依赖方向修正**：`EXPORT_FOLDER_DEFAULTS` 抽到中立模块 `settingsDefaults.ts`，
  消除 `PluginSettings ⇄ legacySettings` 的依赖环。

### Fixed
- **未匹配消息静默失效**：`handleMessage` 兜底对未知类型 `respond(undefined)` 且无日志，
  拼错类型表现为「点了没反应」。现在会打印告警（响应行为不变）。
- **协议注册表 6 处漂移**：host 侧补登记 `module:renderMarkdown` / `module:writeFile` /
  `module:openReader` / `app:beforeDetach`；webapp 侧补 `module:toggleTheme`、删除陈旧的
  `file:response`。两侧现各 103 项。

### Tests
- webapp 1016 → **1073** 用例；宿主 555 → **636** 用例（+138）。
  新增：AppAPI 契约（59 类型全覆盖）、module 特征测试、ready 载荷完整性、
  displayManager 真实加载、bridge 契约、perf、goals 健康详情 / 行内编辑、依赖环守卫。
- `docs/window-globals.md` 改为「手写说明 + 自动生成区块」（真实 130 个挂载点 / 84 文件；
  原文档自称 70 项，已严重失真）。

### Not changed（评估后有意不动）
- **三模式切档 reset 撤销栈**：确认为**有意设计**（notes/write 共栈必 reset 防串味；
  导图独立栈跨档保留），仅补契约测试锁定，不改行为。
- **`mindmapFeature.js`（2332 行）**：测绘后判定为「职责广度」而非「方法失控」
  （最大方法 139 行占 6%，已有 12 个专属测试），拆分收益低于风险，明确不拆。
- **`app:ready`（41 行）**：纯聚合代码，外置只会让门面更膨胀且动到最关键握手路径，不做。

## [3.31.2] — 2026-10-25

### Changed
- **看板模式内容宽度调整为 1240px**：进入看板时强制将内容宽度设为 1240px（原为 1200px），更贴合阅读与多列排布偏好；退出看板仍恢复进入前的宽度。

## [3.31.1] — 2026-10-25

### Fixed
- **消除 Obsidian 发布校验告警**：`AppAPI.ts` 处理 `app:moveToCenter` 时，`this.moveToCenter(mode)` 返回的 Promise 未显式处理，触发「Promises must be awaited / .catch / .then / 显式 `void` 标记」告警。改用 `void this.moveToCenter(mode)` 显式标记「有意忽略」（移动会销毁本视图 webview，await 结束前 iframe 已不存在 → 回执必丢，故本就刻意不 await），行为完全不变。

## [3.31.0] — 2026-10-25

### Changed
- **切换（纵向 ⇄ 看板）全面去握手、更直接利落**：移除「无闪烁交接」整套管程（`_armHandoff` / `_waitFrames` / `app:firstPaint` 首帧上报 / 隐藏预热 / 超时兜底）。移中央与恢复纵向现在都是 `setViewState` 激活新视图 + `detach` 旧视图，**代码显著简化**；热路径几乎无感，仅在冷加载（首次加载 webview）时新视图会先 blank 再填充极短一闪——换取约 70 行复杂协调逻辑的移除。进入看板时右侧栏仍由新面板收到 `app:revealed` 后自行折叠，行为不变。
- **恢复纵向改为「硬切换、不抽动」**：当视图由系统从侧栏移来（退出多列必重建）时，将死的中央看板视图上**不再做任何视觉变更**（不拆列 / 不复位宽度 / 不重渲染诗词），保持多列原样直到被原地销毁；新侧栏视图以自己的纵向布局出现。消除了此前「多列先摊开成单列（显大）再消失」那一帧抽动。

### Fixed
- **切换路径上的重复强制布局**：一次纵向⇄看板切换原本会让 `_applyResponsiveClasses()` 跑 3 次（各含一次 `getBoundingClientRect` 强制同步布局），其中 ResizeObserver 回调与布局切换 finish 几乎总落同一帧、白跑一次整页重排。新增 `_scheduleResponsive()` 合帧调度，把同帧请求收敛为一次；ResizeObserver 回调与两处 finish 全部改走它。
- **响应式类无效 mutation**：`rw-*` 断点类由「remove 全部再逐个 add」改为 `toggle(cls, bool)`——类集合无变化时零 mutation，不再触发多余样式失效。

### Chore
- 配色竞态、看板分列对齐、移除横向模式等本轮其它打磨一并随此版本发布。

### Fixed
- **看板 / 横向模式内容偏上、未垂直居中**：多列布局把视图移到中央工作区后，`#main-container` 仍是 `align-items: flex-start`（垂直贴顶），且 `.container` 上边距有、下边距为 0，导致内容偏上、下方留白更多。现进入多列时给 `#main-container` 加 `layout-multicol`，垂直居中并把上下边距补成对称；纵向布局不受影响（长内容仍从顶部起排），内容高于视口时自然退化为铺满。

## [3.30.0] — 2026-10-24

### Added
- **主题市场直接切换**：市场卡片主体点击即应用——已安装直接切换；未安装显示「安装并使用」，安装成功自动切换。新增「使用中」标记；切换后面板不再关闭。内置「竹林（默认）」常驻市场首位，随时可切回。
- **离线也能切换已安装主题**：`market:manifest` 网络失败时 fail-soft 返回本地已安装清单（`manifest:null` + 本地 id/版本表）；市场面板**本地优先**渲染已安装项（可切换/卸载），线上目录仅用于「可安装 / 可更新」增强；离线时提示「线上清单不可用，仅显示已安装的主题」。主题代码本就来自本地磁盘（`theme:load`），无需网络。
- **主题面板收敛为「只留调校」**：移除主题选择网格，仅保留色相 / 明度 / 饱和度与智能动效调校；切换入口改为「去主题市场切换主题」。

### Fixed
- **切换主题后主题面板自动关闭**：移除点击主题卡后显式调用的 `PanelManager.close()`（含外部主题加载成功分支），改为就地刷新「使用中」与调校滑块；顺带修正滑块刷新用了不存在的选择器（`.panel[active-panel="theme"]` → `#panel-theme`，此前为死代码）。

### Chore
- 主题市场卡片新增 `is-applicable` / `in-use` 修饰样式（仅主题市场，不影响模块市场）。

## [3.29.2] — 2026-10-24

### Changed
- **移除全仓 CSS 的 `!important`（改用 JS 驱动，消除 CSS lint 告警）**：此前 `bamboo-garden.css` 用 4 处 `!important` 暂停主题动画 / 清除静止档内联模糊（理由是要覆盖运行时注入主题的 `animation` 简写与元素内联 `filter`）。现改为 `ThemeEffects._applyPauseAndMotion()`：用 `Element.getAnimations({subtree:true}).pause()/play()` 直接控制动画对象（天然压过主题简写，无需 `!important`），静止档就地清除内联 `blur` 并保存原值以便离开静止档还原；系统「减少动效」改由 `_prefersReduced()` + `matchMedia` 变化监听实时处理。行为不变，全仓 `.css` 不再包含任何 `!important` 声明。

## [3.29.1] — 2026-10-24

### Fixed
- **可视化写作模式：卡片工具条离卡片过远**：写作档原先无条件把工具条抬到「级别徽章再上方 8px」（形成 卡片 → 徽章 → 工具条 两行），但宽卡片下徽章在左、工具条居中本不重叠，凭空空出一大截。改为仅当两者水平方向会相撞（卡片较窄）时才上抬——`bindTools` 的 `placeTools` 按徽章与工具条的实际矩形切换 `.tw-tools-raised`，宽卡片工具条紧贴卡片上沿。
- **CSS lint 清理**：`notes.css` 两处非法的 `::host(...)` 选择器改为 `:host(...)`（原写法被浏览器忽略，导致 `.tw-sel-attach` 暗色样式未生效）；`bamboo-garden.css` 四处正当的 `!important`（用于覆盖运行时注入主题的 `animation` 简写、以及元素内联 `filter`）补 `stylelint-disable-next-line declaration-no-important` 并注明理由。

## [3.29.0] — 2026-10-24

### Added
- **思维子弹：节点笔记支持同时展开多个**：此前备注卡片是单例——展开一个节点的笔记会自动收起上一个。现改为多实例，每个节点各有一张卡片，可同时展开、各自编辑；拖动节点或平移/缩放画布时所有已展开卡片实时跟随；删除节点只收起它自己那张，切组/撤销/切档等整体操作仍统一收起并提交。

### Chore
- 备注编辑器由 `_noteBox/_noteInput/_noteForId` 单例重构为 `_noteCards: Map<id,{box,input}>`；剔除时把「已展开笔记」的节点加入 pin 保活（卡片靠其 DOM 定位）。回归测试更新为多实例语义（同时展开两个节点笔记互不影响）。

## [3.28.25] — 2026-10-24

### Fixed
- **便签/贴纸悬停不再临时置顶**：移除鼠标悬停或钉住便签时把卡片 `z-index` 抬到 `5000` 的逻辑——此前鼠标掠过一张便签就会把它猛地盖到其他便签之上（视觉跳层）。工具条显隐仍由 CSS `:hover` / `.is-pinned` 驱动，观感不变。
- **竹林动效主题：切换主题不再泄漏监听 / 计时器**：`BambooGarden` 调试 HUD 的 5 个 `document` 级监听与 `requestAnimationFrame` 循环此前「只挂不摘」，且切走竹林主题时不销毁 `BambooGarden`（落叶 `setInterval`、可见性监听持续在已脱离文档的节点上空转）。现 `destroy()` 逐一移除监听并取消 rAF，且为 `themes.bamboo` 补 `destroy()`，切走时正确析构。

### Chore
- 新增 `cardHoverNoLift` / `bambooGarden` 回归测试（悬停/钉住不写 `z-index`、监听不随主题切换累加、`destroy` 清理、源码守卫禁止「工具条域内查询」回归）。

## [3.28.20] — 2026-10-17

### Changed
- **合规（Obsidian 审核建议）**：
  - 阅读器偏好（目录显隐 / 字号 / 阅读进度）由 `window.localStorage` 改为官方 `app.loadLocalStorage` / `app.saveLocalStorage`，不再直接触达浏览器存储（消除「Local Storage」提示）。
  - 链接解析改用 `metadataCache.getFirstLinkpathDest`；文章索引改为只递归博客根目录（`TFolder`）收集，不再 `vault.getMarkdownFiles()` 全量枚举（消除「Vault Enumeration」提示，也减少大 vault 遍历开销）。

## [3.28.19] — 2026-10-16

### Fixed
- **高危：数据安全**
  - `AppAPI.file:list` 对已是 vault 全路径的条目二次拼接目录（`画中卷/画中卷/x.md`）→ `stat` 失败、`mtime/size` 误为 0、回传 `path` 错误。现直接用 list 返回的全路径。
  - `store` 保存失败仍无条件清空全部脏标记 → Vault 侧改动永久丢失且无重试（静默丢最后一次编辑）。现仅「成功入 Vault」的类别清脏标记，失败者保留下次重试。
  - `AppHost` blob URL 漏登记 `blobUrls` → `destroy()` 的 `revokeObjectURL` 是死代码，每次重建视图泄漏一份（webapp 含大量中文易越过 2MB 阈值走 blob）。现生成即登记。
- **高危：功能失效**
  - 思维子弹拖放连线用 `document.elementFromPoint`，默认 Shadow DOM 下跨不过边界 → 命中恒 `null`、连线整体失效。现新增 shadow 感知的 `_elementFromPoint`（与 `LinkLayer` 同写法）。
  - 思维子弹 `_enterEdit` 先写 `_editId` 再 `_select`，使「切换编辑先提交」守卫恒失效 → 旧编辑不提交、`blur` 误关新编辑态、旧节点监听器泄漏。现已调序。
  - 思维子弹捏合手势开始时调 `_cancelMarquee`，但该方法未定义 → 框选不取消、松手误选一片。现新增 `_cancelMarquee` 并保存监听器引用以便精确移除。
- **高危：坐标纪律（缩放≠100% 才暴露）**
  - 便签新卡落点用含缩放的屏幕像素差当画布坐标、且缩放后高度与未缩放高度混用 → 错位并被持久化。现已按缩放比换算回画布坐标。
  - `ViewportCuller.ensureCardVisible` 归位约束漏乘缩放比（等价硬编码 `s=1`）→ 缩放≠100% 卡片不进视野。现已补 `s`。
- **中危**
  - 文档组（ModeController）`_docCorner/_docPanel` 未在 `unmount`/`_resetState` 归零 → 重挂载后右上角组切换入口永久消失；同步移除 `document` 捕获监听避免泄漏。
  - 便签档 `F` 快捷键无修饰键守卫 → 吞掉 `Cmd/Ctrl+F` 宿主查找。已加 meta/ctrl 守卫放行。
  - `AppHost` 健康校验识别不了「头部完整、尾部缺失」的半截文件 → 自愈永不触发、视图永久空白。已补 `</script>`/`</html>` 闭合判定。
  - `PersistenceCoordinator.actCountInfo` 读派生卡对象不存在的 `.level` → 幕数恒显示 0。已由 `splitActs` 把幕级标题 `level` 挂到每幕首卡修正。
  - 改尺寸拖拽基准含多余缩放 → 已缩放过的卡片再次拖拽手感失真。已改为视觉宽度基准。

## [3.28.18] — 2026-10-16

### Fixed
- **画中卷：画布放大后内容跑位（原地缩放失效）**：缩放条 `+` / `−`、点击百分比重置、键盘 `⌘±` / `⌘0` 这类「无光标位置」的入口，此前把缩放焦点取成了 `canvas.getBoundingClientRect()` 的中心 —— 那是**变换后**的包围盒（`rect.left` 已含平移 `tx`、`width` 已乘 `scale`），会随平移漂移；内容被拖到视野时该点常在屏幕外，于是放大后内容飞到一角，必须双击（走 fit，用布局盒居中）才回中。现统一改用新增的 `CanvasViewport.viewportCenter()`：返回画布**布局盒**中心的屏幕坐标，与 `fitView` / `recenter` / 一键排版同一基准，缩放后可见中心的内容保持不动。便签画布与思维子弹各 4 处；滚轮 / 双指本就以光标 / 中点为焦点，未改动。

### Chore
- **合并重复的 `_stamp` 定义**：`typewriterFeature.js` 里曾有两份同名 `_stamp`（无参版被有参版静默覆盖，成死代码），且若按无参版调用会因入参 `undefined` 抛 `TypeError`。现合并为唯一定义，入参可选（缺省取当前时间）。
- **构建告警清零**：`popupPositioner` / `goalCalculations` / `dataValidator` 三个文件顶部有 `export`（已是 ESM），尾部却保留 `if (module.exports)` 分支 —— ESM 里 `module` 未定义，该分支恒为假（死代码），且令 esbuild 每档报 `commonjs-variable-in-esm`。已删除（保留 `window.X` 挂点）；测试统一走 `loadModule`，不依赖 CommonJS 导出。

---

## [3.28.17] — 2026-10-15

### Fixed
- **无障碍（a11y）**：① 跳转链接（skip-link）原指向不存在的 `#main-content`，改为真实存在的 `#reviewContainer`，键盘首个 Tab 不再失效；② 画中卷操作反馈区（`#twScreenMsg`）加 `role="status" aria-live="polite"`，撤销/排版/换纸/导出等 40+ 处反馈对读屏可见；③ 日期选择器补完整键盘导航（←→±1天、↑↓±7天、PageUp/Down 翻月、Enter/Space 选中，roving tabindex 契约落地）；④ 主面板「全部保存失败」与「时间线保存/删除失败」此前只有 console.error、无任何用户提示，现补 Toast（成功有提示、失败也应有）。
- **画中卷暗色失效**：13 处孤立的 `.theme-dark` 规则补 `:host(.dark)` 并列兜底（scroll-pager 9 + toast 4），窄栏/暗色下不再"亮着"。
- **画中卷连线计数**：统计元素 id 由写作档专用的 `#twLinkCount` 改为导图档实际渲染的 `#twDepthCount`，计数不再恒为 0。
- **日期「回到今天」**：`dateDisplay` 接线 `DatePicker.goToToday()`，鼠标点击与键盘 Enter/Space 均生效，兑现其自带的 `aria-label` 承诺。
- **境界突破死代码**：删除从未触发的庆祝分支（`CultivationData.checkBreakthrough` + `StatsModal` 转发壳 + 4 条测试），境界可视化（100 层点 + 十重天表）保留。
- **「改数值提示是否重算截止日」无反应**：根因是 `manuallySetDate` 被误当成触发门槛——新建目标自动补的默认日期不带该标记，导致用户以为"设过日期"却永远等不到询问。现改为：只要有目标值+每日量且推算结果会变就必定弹窗；选「保持不变」才置位标记（以后自动推导不再动它）；推算不出时 Toast 说明原因而非静默。

### Changed
- **AI 目标规划校验**：量化子项缺起始/目标值时给出提醒（否则进度锁死 0% 却显示"已量化"）；习惯类不误报。重规划替换旧目标时 Notice 告知"替换了 N 个，其中 M 个已有进度未保留"。
- **窄栏居中**：画中卷顶栏（`.scroll-body.is-narrow`）与首页 header 天气+语录（容器实际宽度 ≤460px 的 `.rw-460`）在窄栏下由两端对齐改为居中；宽栏排版不变。首页居中基于面板真实宽度触发（非视口 query），Obsidian 窄侧栏在宽屏下也能正确生效。

---

## [3.28.16] — 2026-10-14

### Fixed
- 修复 Obsidian 发布校验的两条 lint（发布健康项）：① `src/utils/assetId.ts` 的 `eslint-disable-next-line no-control-regex` 补描述（`undescribed-directive` 规则要求）；② `src/host/AppAPI.ts` 的模块路径安全校验改用 `Vault#configDir` 替换硬编码 `.obsidian` —— 用户可自定义配置目录，硬编码会让「禁止访问配置目录」这条红线防护失效，故属**真实安全改进**而非单纯lint消音。

---

## [3.28.15] — 2026-10-14

### Chore
- **发布配置修复（重新发布）**：`3.28.14` 的 CI「webapp 加载矩阵防漂移」闸门因漏记画中卷 `toast.css` 基线而阻断发布（`release.yml` 仅在 tag push 触发且失败即中止后续打包）。现于 `main` 补齐基线（commit `9116aa3`），版本推进到 `3.28.15` 重新发布；**运行时代码与 `3.28.14` 完全一致**，仅发布产物因此得以正常产出。

---

## [3.28.14] — 2026-10-14

### Fixed
- **数据安全（重要）**：关闭/重载画中卷时，防抖窗口（便签/写作 350ms、思维子弹 400ms）内的最后一次编辑此前会随 iframe 销毁而**永久丢失**——`TypewriterFeature.unmount()` 在生产中从未被调用，宿主 `onClose` 只 `detach` iframe。现于 `app:beforeDetach` 同步触发卸载兜底落盘；三档（便签/写作/思维子弹）保存失败新增用户可见提示（此前失败仅表现为 unhandled rejection，用户无感）。
- **资源泄漏**：便签连线层 `LinkLayer` 的 `ResizeObserver` 此前只 `observe` 不 `unobserve`，写作档超剔除阈值后每轮 cull churn 都向共享观察器新增对**已销毁卡片**的强引用（无界增长）。现卡片卸载时配对解除；并删除 9 个随 B1 抽取遗留、归属已迁移却仍在 `TypewriterFeature` 占位、导致清理"打在空气上"的死字段。
- **便签卡片导出按钮**：此前在暗色模式下发黯、且与同排工具条按钮风格不统一。现纳入工具条五态（常规/hover/active/focus/dark），与「裸图标 + 语义色 hover」体系一致；顺带修复 `split` 按钮暗色 hover 不可见。

### Changed
- **便签张数取消上限**（`NOTE_CAP` 50 → 不限制）。原上限动机是「防 vault 文件膨胀」，实测 1000 张满卡仅 0.72MB / 落盘 1.2ms，且便签档视口剔除全程开启；真正的副作用是「超限静默删除最早 N 张」这一销毁性行为，不放即消除。上限机制保留可配置（传入有限值即可恢复）。

### Chore
- **早鸟价 ¥49 → ¥59**，同步 README 中英文与涨价记录表。
- 新增/加固回归测试 42 例，覆盖原零测试区（模式切换主流程、旋钮连拨累积、关闭 flush、连线层资源生命周期、便签上限、保存错误面），并修正 `ARCHITECTURE.md` 中 `ctrl._delegate()` 不存在的文档漂移。

---

## [3.28.8] — 2026-10-07

### Fixed
- **主题市场 / 模块市场：装不上**。两个市场的清单与文件此前只走 `raw.githubusercontent.com`，该域名在部分网络环境被 DNS 污染（解析到 0.0.0.0）直连即失败 —— 表现为清单拉不到、点安装后「安装失败，重试」。现改为多源回退：jsDelivr CDN → GitHub API（`Accept: application/vnd.github.raw`）→ 原 raw 链接（海外用户行为不变）；中文文件名（如「荷塘鱼影.js」）统一编码。
- **竹林模块市场：没有 UI 入口**。悬浮菜单里的「竹林模块」分组与「逛模块市场」按钮此前被两道「先有已装模块才注入」的判断挡住，新用户陷入「要装模块得先进市场、进市场得先有模块」的死锁；且模块清单拉取失败时也会直接 return。现市场入口始终可见（无已装模块时分组不占视觉高度）。
- **安装**：写入前确保目录存在（首次安装不再因目录缺失而失败）。
- **卸载**：删除前先判存在；文件已不在时按「已卸载」处理并照常清除版本记录，不再整条失败。
- **清单同步**：装/卸后向所有已打开的视图补发最新外部主题清单（此前只在 `app:ready` 下发一次，归档 / 画中卷等视图要重开才看得到新主题或卸载结果）。

---

## [3.28.7] — 2026-10-07

### Changed
- **构建期：内联 CSS 压缩**。各入口内联的样式此前是**原样**内联的（注释、缩进、换行全在），而它才是体积大头——archive 视图内联了 925KB 样式，JS 却只有 171KB。现改用 esbuild 的 CSS 压缩（只去空白与注释，不改语义；失败时告警并回退原始样式，不阻断构建）。
- **构建期：R1 gzip 包装改为自适应判定**。原固定阈值 `> 900KB` 存在倒挂：CSS 压缩后 archive 原始体积由 1130KB 降到 845KB、恰好跌破阈值 → 反而不再压缩 → 产物由 345KB 涨到 865KB。现改为「压缩后至少省 32KB 才包装」，CSS/JS 体积再怎么漂移都只会取更小的交付。

### Performance
- 产物体积：app.html 440KB→**359KB**、archive.html 353KB→**240KB**、scroll.html 762KB→**201KB**、module.html 120KB→**87KB**（合计 **−47%**）；webapp.zip 1.96MB→**1.74MB**（−11%）。
- 注：scroll.html（画中卷）现在同样走 gzip 包装，运行时依赖 `DecompressionStream`（Chromium 80+/iOS 16.4+）；不支持时显示明确提示页而非白屏，与主视图既有的包装路径一致。

---

## [3.28.6] — 2026-10-07

### Performance
- **渲染路径**：去掉多处「同一结果被反复计算 / 反复读布局」的开销 —— 时间线卡片辉光的 rect 在 hover 期间缓存（滚动/尺寸变化/超时失效）；tooltip 由两套监听合并为一套并把定位合帧；拖拽面板宽度改为按下时量取一次；画布挂载改为批量测量（挂 N 卡 = N 次强制重排 → 1 次）。
- **多选浮动条**：不再常驻逐帧轮询。已证明它挂在被施加 transform 的画布内、平移缩放天然跟随，故只在「手势进行中」与随后的收尾窗口内排帧，静止多选时开销归零。
- **宿主侧**：健康分请求按 60 天窗口读盘（先按日期键筛选再读文件）；`putDay` 合并两轮 exist+read（最多 5 次 IPC → 3 次）；诊断建议应用改用结构共享（不再每条建议全库深拷贝）；节假日集合复用年缓存并提到「每个目标一次」；设置面板落盘防抖 300ms（关面板时补写一次）。
- **隐私模糊**：关闭态（默认）不再遍历 shadow 树；开启态改为只处理新增节点，已标记内容不重复扫描。

### Fixed
- **快速导航**：shadow 模式下滚动容器是 host 而非 window，scrollspy 与「跳转板块 / 回到顶部」此前整段失效（window.scrollY 恒为 0）。三者统一改按真实滚动容器处理，并修正节流写法（原写法在连续滚动期间被无限推迟，只有停手才执行一次）。
- **画布手势**：三指落下不再叠加第二套捏合监听（缩放被连乘、平移被加倍）；补齐抬手 / 功能失活 / detach 三条路径的监听摘除，不再残留摘不掉的 window 监听。

### Removed
- 清理一批零调用者的死代码：导入 textarea 通道、`store.loadMoreDays` 分页簇（历史日期已由单日补读覆盖）、`app:getTheme` 拉取协议（首屏主题由「绑定即推」覆盖）、14 个永不命中的非音频 MIME 条目、四个视图中不可达的 `?? new LicenseStore` 兜底等。

---

## [3.27.0] — 2026-09-30

### Fixed
- **画中卷**：修复三圆点移动会自毁视图 / 误销毁异功能画中卷；收紧 iframe 绑定前的 postMessage 来源校验（堵死第三方插件驱动宿主存储/文件协议的无校验窗口）；文档 id 路径遍历防护；修复索引读取失败被「只含当前组」的空索引覆盖导致卡片组蒸发、写作档静默保存失败、迁移把已积累内容回滚成旧快照、恢复失败导致画布永久空白；握手时补发功能上下文，抗 scroll.html 体积超阈值被 gzip 包装导致的注入漏收。
- **布局**：修复横向列分列顺序随局部渲染反复抖动（reflow 改为按权威顺序、幂等）；退出多列后内容宽度不持久化、重启回弹到多列宽度；「恢复纵向」在面板已位于右栏时把面板整个关闭；布局模式值白名单防污染持久化。
- **战略复盘**：修复目标标题未转义导致的存储型 XSS（可经 postMessage 反向驱动宿主写盘）及脏数据下的渲染崩溃；概览与诊断口径统一（排除已归档目标）；宿主权威 `overview` 下发，收敛单一数据源；健康分数据窗口与 AI 诊断链路对齐到 60 天。
- **健康分引擎**：收敛宿主/前端双份镜像漂移——webapp 删除本地评分算法、改消费宿主权威快照（离线时安全降级）；诊断文案迁宿主并下发给「数据概览」；春节节假日改为表驱动，解除 2027 年起的硬编码时间炸弹。
- **明暗**：悬浮菜单「夜间模式」改为切换 **Obsidian 整体明暗**（moonstone ↔ obsidian），不再只切应用内夜间模式、也不再破坏「跟随 Obsidian」；删除本地夜间模式的死代码 `toggle-dark-mode`。

### Added
- 切组 / 新建组 / 删组（写作档 + 便签档）窗口加防抖落盘锁，杜绝「旧组画布内容写进新组文件」的串味。

---

## [3.19.0] — 2026-09-21

### Added
- **打字机写作档「分幕」排版**：轮换键（写作档下第三个键）在「顺流竖排 ⇄ 分幕」间切换。自动探测「出现 ≥2 次的最浅标题层级」作为幕界（1 个 H1 + 若干 H2 → 按 H2；若干 H1 → 按 H1），无 ≥2 同级标题时降级顺流。幕按可用宽度网格换行铺排、行高取该行最高幕，幕内保持文章顺序竖流（导出顺序红线不破）。视觉仅靠 `data-act` 交替底色（零新增 DOM），幕标题即该 H 卡本身；首个幕级标题之前的引子独立成块、不计入幕数。

---

## [3.3.19] — 2026-08-08

### Docs
- **README 购买流程补充微信号**：中英双段第 2 步「私聊发给作者」后加入微信号 yanhu94，方便客户付款后联系作者获取激活码。

---

## [3.3.18] — 2026-08-08

### Fixed
- **修复付款码无法显示**：`payment-wechat.png` 实际为 JPEG 格式，后缀与内容 MIME 不匹配导致浏览器无法渲染。已重命名为 `.jpg`，README 中英双段同步改为 Markdown 图片语法直接显示二维码。

---

## [3.3.17] — 2026-08-08

### Docs
- **README 嵌入产品理念全文**：将羽鳞君产品理念文章《反者道之动：竹林修仙传的产品理念》全文纳入 README 中文部分（含掷竹签冷启动、自动化流转、健康分反内卷、魏晋风度竹林趣味、格卢什科夫 OGAS 致敬）。

---

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
