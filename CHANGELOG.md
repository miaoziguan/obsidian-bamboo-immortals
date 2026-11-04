# Changelog

## [3.33.11] — 2026-11-05

> 便签模式交互修复：贴纸挂到便签上、恰好盖住左侧旋转握柄时，便签几乎无法旋转。
> 这是层级漏配，不是手势逻辑问题——缩放手柄早有 `z-index:40`，旋转与连线握柄漏了。

### Fixed
- **挂靠贴纸压住卡片交互控件**：`materialMarket._attachSticker` 用
  `card.appendChild(rec.el)` 把贴纸插到便签卡片**末尾**，而 `.tw-card-rotate` /
  `.tw-card-link` 也是卡片内的绝对定位兄弟节点；同为 `z-index:auto` 时按 DOM 顺序
  **后插入者在上**。贴纸的 `filter: drop-shadow` 还会创建独立堆叠上下文，令它作为
  一整块参与卡片内排序 → 握柄收不到绑在自身上的 `pointerdown`，表现为「难以旋转」。
  `.tw-card` 不做 `overflow:hidden`（否则外部控件会被裁），贴纸可溢出到卡片左外侧，
  正好覆盖 `left: calc(-0.9em - 12px)` 的旋转握柄。
- **统一控件层级**：新增 `--bm-card-control-z: 40`（`--bm-` 前缀以满足
  `lint-css-tokens` R10），`.tw-card-rotate` / `.tw-card-link` 补上引用，
  `.tw-card-resize` 由硬编码 40 改为同一变量；工具条 `.tw-card-tools` 的 60 保持不变。
  握柄只在 hover / 选中 / 旋转中 `pointer-events:auto`，因此提权只在需要操作时生效，
  静止态贴纸的拖拽、缩放、菜单完全不受影响。
- 说明：`40 > 2`（贴纸内部手柄），即使拖动期 `.dragging` 临时去掉 filter、堆叠上下文
  消失，握柄仍稳在上层。贴纸自身保持不设 z-index（auto≈0）。
- 回归锁：新增 `noteCardControlZ.jest.test.js` 5 例 —— 根因锁（挂靠确实 append 到卡片）、
  变量定义与取值、三个握柄统一引用、贴纸自身不设 z-index、工具条层级未误改。
  测试里的 `ruleOf` 只匹配顶格规则定义，避免误命中后代选择器。

## [3.33.10] — 2026-11-03

> 3.33.9 关掉了「0 字节文件 → 判损坏 → 删原文件」这条链之后，继续补掉剩余三类窗口：
> ① 半截文件（非空但被截断）仍会被隔离删除；② 写入被拦时上层以为成功、还会降级写错 key；
> ③ 结构性变更压在 350ms 防抖窗口里，硬杀即永久丢失。全部按「要么完整、要么不留痕、失败必须可见」处理。

### Fixed
- **写入被拦截必须显式失败**：`vaultWrite` 返回 `false`（读失败后暂停落盘）此前被 `put*Doc`
  的 `Promise<void>` 吞掉，`_saveCardDoc` 会把 `wroteDoc` 置 true —— 用户继续编辑、每次都静默不落盘。
  现新增 `assertWritten`，三档（写作 / 便签 / 思维子弹）写入被拦一律抛「写入被暂停」，由
  `PersistenceCoordinator` 的保存失败提示（Toast）呈现。
- **写入失败不再降级到旧单文档 key**：`legacyFallback` 的定位只服务「宿主没有这个桥」（webapp/宿主版本
  不匹配）。此前写入抛错也会走降级，把本组数据塞进 `typewriter:notes` 那套旧格式——用户下次仍读新文件、
  仍是空的，表现为「数据丢了」，且没人知道它躺在旧 key 里。现区分「桥缺失（降级）」与「写入失败（抛）」。
- **已存在文件也做写后校验**：`vault.process` 内部是「读 → 回调 → 截断重写」，进程在重写阶段被杀会留下
  半截 JSON，下次读取照样判损坏。现在落盘后立即读回比对，不一致先原样重写一次，仍不一致即抛错，
  绝不再把「没写完整」当成功返回（代价：每次保存多一次读，文档档 2–50 KB，可忽略）。
- **损坏的文档档不再自动删除**：便签 / 写作 / 思维子弹三档改为「写备份 + **保留原文件** + 暂停写入 +
  明确提示」，保留 Obsidian「文件恢复」与人工修复的对照物；同一原文件只留一份 `.corrupt-*`（不再堆积）。
  `goals` / `settings` / 日数据 / 收支历史仍维持「备份 + 移除原文件」——它们是单一全局文件，
  必须能继续重建，否则整个插件瘫掉。
- **结构性变更跳过防抖立即落盘**：新增 `flushSave`，接到「新建卡片 / 段落拆分合并 / 卡片拖拽落位 /
  单卡删除 / 批量删除」五个点。其中**单卡删除此前完全不落盘**，要等下一次任意保存，期间硬杀会让
  被删的卡片「复活」。
- **落盘串行化**：新增 `_saveChain`，防抖保存 / 立即保存 / 切档前持久化统一排队，消除「并发写同一
  文件、后完成的旧内容把先完成的新内容盖掉」。
- 回归锁：`emptyWriteGuard` 扩到 11 例（保留原文件、写入被拒、备份去重、写后校验不一致、三档参数校验、
  删文件后自动恢复）；新增 `saveChainAndNoFallback` 5 例（flushSave 跳防抖、串行不并发、切档丢弃、
  单次失败不断链、写入失败不写旧 key）。

## [3.33.9] — 2026-11-03

> 数据安全修复：一个便签组文件被写成 0 字节后，读侧把它当「损坏」隔离（备份同样是 0 字节）
> 并删掉原文件，用户看到「数据损坏」而正文已不可恢复。四条护栏把这条链整段堵死。

### Fixed
- **写侧拒绝空内容**：`vaultWrite` 入口校验 `typeof content !== 'string' || !content.trim()`
  直接抛错。历史事故起点是 `putTypewriterNotesDoc(id, undefined)` →
  `JSON.stringify(undefined)` 返回 `undefined`（不是字符串）→ 写入层建出 0 字节占位文件。
- **写侧校验文档参数**：新增 `assertDocObject`，写作档 / 便签档 / 思维子弹档三个 `put*Doc`
  在 `doc` 为 `undefined` / `null` / 数组时立即抛错，把「静默产出一个坏文件」变成
  「当次保存显式失败」（走已有的保存失败提示），不再无声无息。
- **新建文件失败清理残件 + 写后校验**：`vault.create` 是「先建文件、再写内容」，
  中途失败/中断会留下 0 字节文件。现在首次创建失败（`prev === null`）会用 `removeIfEmpty`
  清掉空残件；创建成功后读回比对内容，不一致同样清残件再抛 —— 要么完整写入，要么盘上不留痕。
  已存在文件仍走 `vault.process`（Obsidian 的读改写出口），不引入 `adapter.rename`
  以免破坏 vault 文件缓存一致性（那会造出「磁盘有文件但 Obsidian 看不到」的历史遗留分支）。
- **读侧区分「空文件」与「损坏」**：0 字节/纯空白的文件不再走 `quarantineCorruptFile`
  （备份 0 字节毫无可恢复内容，却谎称「已备份」），改为：不隔离、不删原文件、返回 `null`、
  提示「内容为空（上次保存可能被中断）」并加入 `_ioFailedPaths` **暂停写入** ——
  否则加载出的空档会在下一次自动保存时被写成「看起来正常的空组」，用户再也分不清是丢了还是本来就空。
  真正的损坏（非空又解析不出）仍照旧隔离留档，一个字节都不改。
- **暂停状态可解除**：`vaultWrite` 发现被标记的路径**文件已不存在**（用户按提示删掉空文件）
  时自动解除暂停并本次按新建处理，不必重启插件；读成功也会自动解除。
- 回归锁：新增 `src/storage/__tests__/emptyWriteGuard.test.ts` 8 例 —— doc 非法拒写
  （三档）、create 失败不留 0 字节残件、0 字节读成 null 且不产生 `.corrupt-` 也不删原文件、
  空文件后禁止覆盖写、用户删空文件后自动恢复保存、真损坏仍隔离且一字不改。

## [3.33.8] — 2026-11-02

> 纯发布合规修正，无行为变化。

### Fixed
- **obsidian-releases CSS lint：`Unexpected duplicate "overflow"`（mindmap.css:19）**：
  3.33.7 为兼容老内核把画布裁剪写成 `overflow: hidden` + `overflow: clip` 两行回退，
  功能正确（后者覆盖前者），但 `declaration-block-no-duplicate-properties` 只看
  「同名属性出现两次」就会告警。本仓库 timeline / dark / goals-stats / components-kpi
  四处本来就直接单写 `overflow: clip`（Electron/Chromium 与 iOS16+ WKWebView 均支持），
  故删掉被覆盖的 `hidden` 行，只留 `overflow: clip`，行为零变化。
- 回归锁 `mindmapNodeWidth` 的第三条断言继续守住「`.tw-mm` 必须是 `overflow: clip`」。

## [3.33.7] — 2026-11-02

> 修掉移动端思维子弹「把子弹拖到画布边缘后整排变形」：有的变成竖排（一字一行）、
> 有的位置被弹回、有的整张图突然重新居中。桌面端不复现，因为三条根因都需要触屏。
> 三条全部按代码证据定位，并用回归测试钉住。

### Fixed
- **子弹突然变成竖排（宽度塌陷）**：`.tw-mm-node` 是绝对定位且没有 `width`，宽度走
  shrink-to-fit = `min(max-content, max(min-content, 可用宽度))`，而「可用宽度」=
  画布宽 − `left`。`left` 是**画布坐标**（屏幕位置由 `.tw-mm-canvas` 的 transform 承担），
  移动端画布仅 ~390px，把子弹拖到右缘（或先平移视口再拖）`left` 就会超过画布宽 →
  可用宽度 ≤ 0 → 宽度退化到 `min-content`（一个汉字宽）→ `word-break` 逐字断行 → 竖排。
  现显式 `width: max-content`（只由内容决定，与 `left` 无关），`max-width: 220px`
  仍负责超长换行。**不能用 `fit-content`**：其公式同样含「可用宽度」，照样会塌。
- **拖拽被捏合抢走后位置不落库**：触屏拖到边缘时第二指（掌根）落下会起捏合，
  `onPinchWillStart` 取消节点拖拽，但取消路径只 `flush()` 写 DOM 的 `left/top`，
  没有写回 `_nodes` 模型 —— 之后任何一次 `_placeNode`（剔除后重挂载 / render / 撤销）
  都会按旧坐标把子弹摆回去，表现为「一放手自己弹回原位」。现取消路径同样写回模型并落盘。
- **触屏误触「双击空白 = 全图归位」**：双击判定只有 450ms / 12px，且拖完不重置基准；
  手指连点/抖动极易命中 → `_centerView()` 把全部子弹重新居中（= 用户眼中的「重新排版」）。
  现真正拖动过即作废双击基准，且触屏（`pointerType` 为 `touch`/`pen`）不再触发全图归位；
  桌面鼠标语义不变，移动端仍可用缩放条上的「适应内容」手动归位。
- **画布用 `overflow: hidden` 当裁剪的副作用**：hidden 会让 `.tw-mm` 成为「可滚动容器」，
  子弹拖出边界撑大 `scrollWidth/Height` 后，`contenteditable` 的 `focus` / 移动端软键盘的
  `scrollIntoView` 会把容器滚出 `scrollLeft/Top ≠ 0`，整块画布视觉偏移且无法滚回。
  改用 `overflow: clip`（只裁切、不产生滚动机制），`hidden` 留作老内核回退。
- 回归锁：新增 `mindmapNodeWidth`（3 例：必须 `width: max-content`、禁用
  `fit-content/stretch/auto`、`.tw-mm` 必须 `overflow: clip`）；`mindmapNodeDrag`
  新增 3 例（取消拖拽写回模型、拖动作废双击基准、触屏不归位 / 鼠标仍归位）。

## [3.33.6] — 2026-11-02

> 修掉目标卡里「每日」那枚每日量徽章**点不动、打不进字**：点开后输入框既看不见、也没拿到焦点。
> 三层根因叠加，全部在真实浏览器里复现验证（不是推断）。

### Fixed
- **「每日」无法设置 · 焦点丢失（直接原因）**：`startInlineEdit` 先在
  `el.replaceWith(input)` 后 `input.focus()`，而 `dailyMin` 分支随后为了挂
  「💡 点击填入 1.1/天」建议浮层，把输入框重新挂进新 wrapper
  （`replaceChild(wrapper, input)` + `wrapper.appendChild(input)`）—— 节点重新挂载即失焦。
  后果不止「打字打不进框」：回车分支走 `input.blur()`，对无焦点元素是空操作，
  所以**回车也保存不了**，整枚徽章等于不可用。
  现改为在函数末尾统一补焦点（`input.isConnected && document.activeElement !== input`
  → `focus({preventScroll}) + select()`）；title / name / currentValue 等被「提示 anchor」
  重挂载的分支同时受益。
- **每日量编辑态不可见**：未设置每日量时输入框是 `width:20px / border:none /
  background:transparent / 无 placeholder`，还被全局 `:where(input){min-height:var(--touch-target)}`
  顶成 45px 高 ——「每日」占位符消失后原地只剩一个透明空盒子，看不出哪里可以输入。
  现补 `placeholder="每日"` + 44px 最小宽度 + 下划线 + 8% 底色，并显式 `min-height:16px`
  压回单行高度（否则编辑时整行跳到 44px）。
- **关闭建议浮层抛异常**：`inlineEditStarter.js` 用了 `eventInTargets` 却漏掉 import
  （从 renderer.js 搬出时漏的），真实浏览器点空白处抛
  `Uncaught ReferenceError: eventInTargets is not defined`，浮层关不掉。已补 import。
- 回归锁：`goalsInlineEdit` 新增 4 例（编辑态可见性 / 浮层包 wrapper 后焦点不丢 /
  打字+回车提交 / `eventInTargets` 依赖声明静态断言 —— loadModule 会剥离 import，
  这类漏依赖只能由源码断言锁住）。回退源码实测这 4 例全红。

## [3.33.5] — 2026-11-02

> 修掉「贴纸旋转过之后，拖动不跟手（全程不动、松手瞬移），要重启 Obsidian 才恢复」。
> 这不是性能问题，是旋转手势把拖动所依赖的 transform 覆盖掉了。

### Fixed
- **自由贴纸旋转后拖动失效**：自由态贴纸的拖动依赖 transform 里的
  `translate(var(--tw-drag-x), var(--tw-drag-y))`（拖动期每帧只改这两个 CSS 变量，
  由合成器位移、不触发布局）。而旋转手势与「双击 ↻ 归零」此前直接写
  `transform = 'rotate(Ndeg)'`，把 translate 整段抹掉 —— 之后拖动再写变量也不产生位移，
  表现为「贴纸一帧不动、松手才瞬移」，且会一直坏到 DOM 重建（重启）为止。
  现收敛出唯一真源 `MaterialMarket._stickerTransform(rec, deg)`：自由态带 translate、
  依附态只 `rotate`（父卡片已有位移，叠加会二次位移），`_applyStickerBox` / 旋转手势 /
  双击归零三处共用，杜绝同类漂移。
  实测（真实画中卷 + 观鱼素材）：旋转一次后拖动跟手位移 0px → 84px；连续 5 轮
  「旋转 → 拖动」位移恒为 84px，transform 始终保留拖动变量。
- 回归锁：`stickerGesturePerf` 新增 4 例（旋转后仍带拖动变量 / 双击归零后仍带 /
  依附态不得带 translate / `_stickerTransform` 两态断言）。

## [3.33.4] — 2026-11-02

> 便签档「拖动卡顿」排查收口：新增拖拽帧率探针，把「顺不顺」变成可报数的分位数；并清掉启动期刷屏的诊断日志。
> （3.33.3 的 tag 因发版闸门 `check-window-globals` 未登记新挂载点而中止、未产出 Release，本版补齐后重发。）

### Added
- **拖拽帧率探针**（`webapp/assets/scripts/utils/dragPerf.js`）：卡片与贴纸共用的
  `CardInteractions.startGroupDrag` 在按下时起一个 rAF 采样循环、松手汇总
  `p50 / p90 / max / 掉帧数`。超出阈值（p90 > 24ms 或掉帧率 > 20%）才出声——
  console 每次记录、Toast 每会话只一次，不刷屏。现场入口
  `__twDragPerf.report() / last() / off()`，用于排查「跑一阵就卡、重启才恢复」这类
  只有长会话才能复现的退化（干净会话测不出来）。
  安全约束：环形缓冲只留最近 20 次、单次采样上限 600 帧、连续零间隔（rAF 被同步实现）
  自动停，绝不把测量本身变成故障源。

### Changed
- **启动期诊断日志降噪**：`[MaterialMarket] 已恢复素材` 不再把全部素材名 join 出来
  （装几十个素材时会一次刷出几十行），只保留数量摘要；它与 `[Store] init complete`
  一并降为 `console.debug`（DevTools 默认 Verbose 关闭时不可见，需要时仍可查看）。

### 说明
- 同轮用真实代码 + 真实素材做的 A/B 否证了两条原计划方案：拖动期给内容层加
  `content-visibility: visible` + `contain`、以及 `CSS.registerProperty(inherits:false)`
  改造 `--tw-drag-*`——实测均无收益甚至更差（style 重算 63~77ms → 82~85ms），故未引入，
  并在 `notes.css` 与 `stickerDragPerf` 单测里留下「别再重复该实验」的反向锁。
  实测结论：正常环境下拖动每帧总成本约 0.5ms（占 16.7ms 预算的 3%），
  掉帧必然来自宿主环境（同进程其他视图抢主线程 / GPU 加速降级 / 内存压力），
  后续定位依赖上面的探针取现场数据。

## [3.32.5] — 2026-10-27

> 死代码系统性清理收官（JS 与 CSS 全线），并修掉「开启 AI 但 Key 为空」时只报看不懂 401 的体验问题。

### Changed
- **死代码闸门 + JS 死代码删除**：新增死代码检测闸门，并删除确认无引用的 JS 死代码
  （`appendToRoot` / `fallbackQuestion`）与 `action` / `edit` / `verify` / `history` / `status` /
  `week` 六个真死簇（特性级整块删除，含补删遗漏的 habit CSS）。
- **CSS 死类清理（四批，共约 230 个死类名）**：`scripts/delete-dead-css.py` 升级为
  「保守模式 + 受控激进模式」，死类名总数由 506 降至 29，净删 CSS 约 2300 行。
  安全护栏：含活类的规则永不删、`:host/:root` 全局变量块零误删、动态拼接类名族
  （`cs-*` / `icon-*` 等）经全前缀扫描排除、零活类被孤立。

### Fixed
- **AI 入口空凭据不再报 cryptic 401**：原先只校验「启用 AI」开关，若开启但未填
  API Key / Base URL，请求会带着空 `Authorization` 打到服务端，最终只弹出
  `Request failed, status 401`，无法判断缺什么。现新增统一校验，缺 Key / 缺 Base URL
  分别给出明确提示，覆盖 AI 规划、AI 澄清、AI 诊断等 9 个入口。

## [3.32.4] — 2026-10-26

> 修复第二次源码审核退回的 6 个 Warning —— 并把教训落成闸门，防止同类问题复发。

### Fixed
- **冗余联合类型 5 处**（`T | string` 中 `string` 吞掉字面量联合，官方判冗余）：
  · `types/data.ts`：`taskDayType` / 两处 `category` → 收敛为 `string`（类型语义完全等价，
    字面量取值仍由 `TaskDayType` / `GoalCategory` 常量与注释文档化）；
  · `ai/GoalCardValidator.ts` / `ai/MarkdownPlanner.ts`：局部标注去掉冗余联合。
  连带清理 2 个不再使用的 `GoalCategory` 类型导入。
- **多余断言 1 处**（`ai/MarkdownPlanner.ts`）：`raw as { goals?: unknown }` 中收窄后的 `raw`
  本就可赋值给返回类型，断言冗余，已去掉。

### Added
- **启用 `no-redundant-type-constituents`（error）**：本地对齐官方规则，同类问题提交前即拦。
- **审核闸门新增第 ⑤ 条**：`eslint-disable` 只能指向**本地已启用**的规则（经 ESLint API 取真实生效配置）。
  —— 根因：`--report-unused-disable-directives` 会把「指向未启用规则的 disable」误判为"无用"，
  上轮据此删除 6 条，但它们抑制的是**官方规则**，导致本次 6 个告警。该闸门使这类误判不可能再发生。

### 事后复盘
- `AGENTS.md` 实证来源表新增 1 行：**删除 disable 前必须确认对应规则本地已启用**。

## [3.32.3] — 2026-10-26

> 修复 3.32.2 的 CI 阻断（该 tag 未产出 Release，故顺延一个补丁版本重发，不移动旧 tag）。

### Fixed
- **覆盖率门禁过严（会误判环境抖动为回归）**：绝对已覆盖语句数存在**环境相关抖动** ——
  同一份代码 CI 报 8705、本地报 8708（总数一致 18817，属条件分支走了不同路径），
  被门禁误判为「覆盖率回归」并阻断 Release。
  现引入**容差（0.1%，至少 5 条）**：抖动放行，真实回归（删测试/整块逻辑失去覆盖，
  通常数十至数百条）仍会被拦下。已双向证伪：基线 +3 放行、基线 +300 拦截。

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
