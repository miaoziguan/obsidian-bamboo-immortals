# 死 CSS 候选清单（F 类）

> 本清单由 `scripts/check-dead-css.mjs` 自动生成 + 人工裁决。属 **B 级（疑似）**，不直接删除。

## 为什么这是 B 级而非 A 级

CSS 类名是模块/主题扩展 API 的天然契约面：外部主题、外部模块（如 `materialMarket` 注入的模块 CSS）
完全可能按类名消费本仓库的样式（§4 默认「不判死」）。因此「源码全仓零文本命中」只能证明
**本仓库未使用**，不能证明**外部未使用**。每条删除前必须：

1. 确认该簇不是设计系统 / 扩展契约（如 `bm-*`、`sm-*`、`card-*` 疑似对外 API）；
2. 确认不是历史功能遗留（整簇呈 `goal-*`/`ai-wizard-*`/`achievement-*` 形态 → 多半是已删功能残留，可删）；
3. 删除后跑 `npm run preflight && npm run test && npm run test:host`，并解包产物核验类名不再出现。

## 逐簇裁决样例（删除前人工填写，下面是已核查的样本）

> 权威删除目标以 AUTO-GENERATED 区块里的**逐类名清单**为准，下表只是导航与抽样证据。
> 「删」均指**建议删**，实际删前须先确认非外部主题/模块契约（§4 默认不判死）。

| 前缀簇 | 数量 | 判定 | 证据（判定依据：源 JS 真实 class 令牌扫描；全分区类名 0 引用，除非注明） |
|---|---|---|---|
| `week` | 18 | **✅ 已删除**（commit 见下） | ⚠**实为纠缠型死特性，非干净整簇死**：`week-day` 基础类被 `.week-day.today`/`.selected`/`.future` 复合选择器引用（修饰符 `today`/`selected`/`future` 为活令牌，故这些复合规则不在死名清单内）。零 JS 引用确认整特性死，已按**特性级整块删除** `date-nav.css` L587-786（含 `@media` 与 NOTE 注释），无其它文件引用 |
| `kpi` | 10 | **纠缠型死特性（按特性级整块删）** | `kpi-card` 基础类零 JS 引用，但被 `.kpi-card.up`/`.down`/`.neutral`/`.breakthrough`/`.editable`/`.goal-kpi` 复合引用（修饰符为活令牌 → 这些复合规则不在死名清单内）。须整特性移除 `kpi-card` 全部规则（含复合/暗色/共享列表），非按名清单删 |
| `cs` | 5 | **纠缠型死特性（按特性级整块删）** | `cs-liantai/stone/yezi/mei/bianshan` 类名 0 引用，但出现于复合 `.scroll-censer.cs-liantai`；源 JS 89 处 `cs-` 实是 `var(--cs-1..4)` 变量；`cs-` 前缀还疑似动态拼接（`cs-` 在「疑似动态 3」名单）→ 删前须解除动态疑点并整特性移除 |
| `ai`（ai-wizard*） | 28 | **纠缠型死特性（按特性级整块删）** | 全分区 0（含打包 html 非 style 处），但与 `week` 同理可能为「死基础类 + 活修饰符」复合纠缠，须整特性移除而非按名清单删 |
| `achievement(s)` | 34 | **纠缠型死特性（按特性级整块删）** | 源 JS 仅 4 处非 class 引用，无 `achievement-*` 类名使用；但与 `week` 同理可能为复合纠缠，须整特性移除而非按名清单删 |
| `history` | 11 | **✅ 已删除**（commit 见下） | `history-*` 全分区 0 且全仓 classList/className/模板无动态引用；已从 `components-interaction.css` 移除整块 11 条死规则（含嵌套 `.history-modal.active`/`.history-item.active`），并从 `components-interaction.css`/`base.css` 两处共享选择器列表移除 `.history-close`/`.history-item` |
| `status` | 10 | **✅ 已删除**（commit 见下） | `status-*` 全分区 0 且全仓 classList/className/模板无动态引用；跨 4 文件删除：`goals-stats.css`（`.status-distribution`/`.rw-460 .status-distribution`/`.status-legend`）、`goals-editor.css`（4 条 `.goal-status-indicator.status-*` 复合规则，保留基础类）、`goals-health.css`（`.rw-360 .status-distribution`）、`dark.css`（5 处暗色覆盖含 `:host(.dark) .status-distribution`） |
| `verify` | 7 | **✅ 已删除**（commit 见下） | `verify-*` 全分区 0 且全仓 classList/className/模板无动态引用；已从 `components-interaction.css` 移除整块 7 条死规则（含嵌套 `.verify-item.ok/.warn`、`.verify-status.tag-execute/.tag-miss`） |
| `habit` | 6 | **✅ 已删除**（commit 见下） | `habit-*` 全仓 classList/className/模板无动态引用；已从 `section-manager.css` 移除整块死规则、从 `forms.css` 暗色模式共享列表移除 `.habit-progress-fill` |
| `edit` | 6 | **✅ 已删除**（commit 见下） | `edit-*` 全分区 0 且全仓 classList/className/模板无动态引用；已从 `components-interaction.css`/`forms.css`/`base.css` 移除 6 条死规则（含共享选择器列表中的 `.edit-btn` 与 `@keyframes slideDownFromTop`），保留异名活规则 `.catm-edit-btn`/`.card-edit-hint`/`.goal-inline-edit-hint` |
| `action` | 5 | **✅ 已删除**（commit f0f03cf） | `action-*` 全分区 0；已从 `components-interaction.css` 移除 5 条死规则，保留同区段活规则 `.normal-row`/`.normal-label`/`.normal-content`/`.focus-box` |
| `theme-guide` | (theme 内) | **建议删（子簇真死）** | `theme-guide*` 全 0；theme 簇整体 MIXED |

#### 部分删（MIXED：簇内有活类名，按 AUTO-GENERATED 精确死名逐条删，勿整簇删）

| 前缀簇 | 死数 | 活类名样例（证明簇活着） |
|---|---|---|
| `goal` | 126 | `goal-section`/`goal-list`/`todo-goal-*`(renderers.js) |
| `settings` | 15 | `settings-item`/`settings-clear-row` |
| `template` | 15 | `template-picker` |
| `scroll` | 14 | `scroll-body`/`scroll-censer` |
| `theme` | 14 | `theme-card`/`theme-canvas`（theme-guide 子簇另判死） |
| `bamboo` | 13 | `bamboo-card`(+动态 token `bamboo-card-content${...}`) |
| `legend` | 13 | `legend-dot` |
| `sm` | 13 | `sm-dragging`/`sm-item`(sectionDragDrop.js) |
| `priority` | 13 | `priority-picker` |
| `section` | 12 | `section`/`section-placeholder` |
| `stats` | 12 | `stats-section`/`stats-overview-container` |
| `alert` | 9 | `alert-card` |
| `todo` | 7 | `todo-content`/`todo-checkbox`(+动态 token) |
| `completed` | 7 | `completed`/`completed-items-list` |
| `time` | 6 | `time-span-card`/`time-alerts-cards` |
| `btn` | 6 | `btn-primary-action`/`btn-icon` |
| `empty` | 6 | `empty-state-action`/`empty-state-card` |
| `bm` | 8 | `bm-btn`/`bm-btn--danger`（**修正**：非纯设计系统，有活类名 → MIXED） |
| `arch` | 5 | `arch-act-btn`/`arch-bar`(归档功能活着) |
| `gho` | 5 | `gho-empty-icon`/`gho-left`(healthScore.js) |

> **✅ MIXED 首批 9 小簇已执行**（badge/tooltip/view/weather/confirm/category/catm/tier/btn）：共删 17 个精确死名（按首段聚类过滤）。执行工具 `scripts/delete-dead-css.py`（注释感知括号扫描 + 安全处理 `:is()/:where()` 分组：仅剔死参、保留活参；顶层直接死类才整体删；`@keyframes`/`@font-face` 原样保留）。关键安全核验：① 全改动 diff 净删除的类**全部属于死名集合、零活类误删**；② 隐私模式 `:host(.privacy-on) :is(...)` 分组仅剔 `.weather-text`、活成员全部保留；③ 解包 4 产物 html 死名 `.name` 选择器精确 0；④ `npm run preflight` 全绿、webapp jest 121 套件 / host vitest 全绿（`process_css` 重建器首字符复制 bug 已修复，曾致 31 测试失败）。
>
> **✅ MIXED 第二批 15 簇已执行**（settings/template/legend/sm/priority/section/stats/alert/todo/completed/time/empty/bm/arch/gho）：经保守模式工具删 93 个精确死名（范围 145，余 ~52 为「死类与活类复合纠缠」规则被保守保留）。工具升级为**保守模式**——顶层选择器只要含任一活类令牌（或 `:is()/:where()` 剔死参后仍有活参）即**整体保留**（死类令牌一并保留、绝不剥落/扩大）；仅当「零活类令牌」或「无 `.class` 令牌的结构性选择器」(`:host`/`:root`/`body`/`*`) 才保留时才删除。关键安全核验：① `:host,:root` 全局变量块**零误删**（曾因「无 .class 即当死」bug 被整体删除，已修）；② 曾误删的 4 个活类 `.urgent/.error/.danger/.count` 全部保留；③ 全改动 diff 净删除类全属死名集合、零活类误删；④ 解包产物死名选择器 0、括号平衡、无 `,,`/`:is((` 伪影；⑤ webapp jest 121 套件 / host vitest 57 文件全绿。
>
> **✅ MIXED 第三批 4 簇已执行**（goal/scroll/theme/bamboo）：保守模式工具删 ~120 个精确死名（范围 167，余 ~47 为「死类与活类复合纠缠」规则被保守保留），涉及 56 个 css 文件、478 规则块。安全核验：① diff 零 `.urgent/.error/.danger/.count` 删除行（活类规则完整保留）；② 全改动 diff 净删除类全属死名集合、零活类误删；③ `:host,:root` 全局块零误删；④ 解包产物死名选择器 0、括号平衡、无伪影；⑤ webapp jest 121 套件 / host vitest 57 文件全绿。至此 **MIXED 簇（非纠缠型特性）已全部执行完毕**。原余 `kpi/cs/ai/achievement` 4 个「死类与活类深度纠缠」特性簇，经核查（`cs-*` 为 `censer.classList.add(\`cs-${style.key}\`)` 动态活类须保留；`achievement-*`/`ai-wizard-*`/`kpi-*` 全仓 + host TS 零 JS 产出→真死）后，已在**第四批受控激进清理**中处理（见下）。
>
> **✅ 第四批 受控激进清理（覆盖 215 残留 + 4 纠缠簇死名）**：`scripts/delete-dead-css.py` 升级「受控激进模式」（`--aggressive`），并加【不孤立活类】安全阀——顶层选择器含死令牌即整体删，**仅当该选择器内所有活类令牌都出现在某条「零死令牌的干净规则」里（covered 集合）才删**，否则整条保留（杜绝 `.urgent` 被连坐的旧事故）。动态拼接种子经全前缀扫描识别（`cs-`/`icon-`/`theme-panel-card` 等 10 个族）并 `--exclude`，绝不误删。核查结论：① `cs-*`(5) 动态活类 → 保留；② `achievement-*`(34)/`ai-wizard-*`(28)/`kpi-*`(10) 真死 → 整批 takedown；③ 剩余 29 死名（含 `cs-*`/`icon-*` 动态保护族 + 安全阀保留的复利残留）按协议保留。安全核验：零活类孤立（净删除类全属死名 / 语料在用类零消失）、`:host,:root` 全局块零误删、括号平衡、无 `,,`/`:is((` 伪影；webapp jest 121 套件 / host vitest 57 文件全绿、preflight 全绿。死类从 ~293 降至 29。

#### 单名死类长尾（无连字符）—— ✅ 已全部执行完毕（commit 见下）

原估 20 个，经闸门精确复核（含 html 扫描 + 全仓 class 字符串边界复核）后实际为 **17 个真死**（无连字符）：
- **11 个 `@keyframes` 名**（删 `.name` class 规则、**保留 `@keyframes`** 与活规则里的 `animation:` 引用）：`breathePink`/`breatheSky`/`dotBreath`/`fadeIn`/`fadeInUp`/`heartbeat`/`highlight`/`lotteryPickedGlow`/`moonGlow`/`nodeGlow`/`slideUp`
- **6 个纯死 class**：`breakthrough`/`large`/`neutral`/`secondary`/`subtitle`/`tomorrow`

> **排除项（非死，勿删）**：`clickable` 在 `webapp/index.html` 是运行期活类（闸门正确排除）；`jpg` 是 `url('../images/author-avatar.jpg')` 被 `\.` 正则误提的**假阳性**，已在 `scripts/check-dead-css.mjs` 修复；原估的 `future`/`small` 实为 `.week-day.future`（随 week 特性删除，已无定义）与活类，不在死清单。

> **手术要点**：11 个 keyframes 名的 `.name{}` 类规则分布于共享选择器列表（base.css 减动块、modal-panels.css `:host(.platform-mobile)` 块、dark.css 暗色降级列表）与复合规则（`.kpi-card.breakthrough`、`.timeline-stat.heartbeat` 等），均按名精确移除并保留兄弟项与 `@keyframes`。

### 核查方法论（避免误判的关键）
- **变量 ≠ 类名**：`cs-` 命中 89 处实是 `var(--cs-*)`，类名本身仍死——切忌把 CSS 变量引用当类名使用。
- **前缀拼接陷阱**：`week-`/`kpi-` 为 0 是「整簇真死」；而 `goal-`/`sm-`/`gho-` 虽前缀大量出现，但活的是**其它具体类名**，死的是**特定旧名**——必须用 AUTO-GENERATED 的逐类名清单删，不能整簇删。
- **打包 html 含 CSS 定义**：`kpi-card` 在打包 `<style>` 内出现 2 次是 CSS 定义本身，非使用；已用「剥离 `<style>` 后计数」区分。
- **动态赋类盲区（classList / className / 模板）**：本清单初版只比对 `class="x"` / `className='x'` 字面量令牌，会漏掉通过 `el.classList.add('x')` / `el.className = '…x…'` / `` class=`…${x}…` `` 施加的类。状态类（`edit-mode-active` 等）尤其危险。删除前必须**全仓（含产物 html / host TS）用边界正则 `(?<![-\w])x(?![-\w])` 复核**，确认无动态引用。已执行的 `action`/`edit` 簇均通过此复核。
- **复合选择器孤儿陷阱（已修正原「整簇真死」误判）**：死名清单只按 class 令牌判死，会漏掉「死基础类 + 活修饰符」的复合规则（如 `.week-day.today`——`week-day` 死、`today` 活令牌却让该规则不被标死）。**结论：本仓 `week`/`kpi`/`cs`/`ai`/`achievement` 均非干净整簇死，而是纠缠型死特性**——删前须把含死名的所有规则（含复合/暗色/共享列表）按**特性级整体**移除，并确认修饰符（`today`/`selected`/`future` 等）不是别处的活特性依赖。已执行的 `week` 即按此整块删除 `date-nav.css` L587-786。
- **`url()` 假阳性盲区（已修复）**：CSS 选择器提取正则 `\.x` 会把 `url('../x.jpg')` 里的 `.jpg`、以及 `url('#frag')` 里的 `#frag` 误提成类/ID 选择器。已在 `scripts/check-dead-css.mjs` 提取前先 `css.replace(/url\([^)]*\)/g,' ')` 剥离 url 内容，消除此类假阳性（单名尾里的 `jpg` 即此例，已不再误标）。

---

<!-- AUTO-GENERATED:dead-css START -->
> 本节由 `scripts/check-dead-css.mjs` **自动生成，勿手改**。改完代码执行：
> `node scripts/check-dead-css.mjs --update`（CI 跑默认模式校验漂移）。
>
> 扫描：定义 `webapp/assets/styles/**/*.css`；使用 `webapp/assets/scripts/**/*.js`(排除 tests) + `webapp/*src*.html`/`index.html`（刻意排除 4 个打包产物 html，避免把 CSS 定义当使用）。
> 误判防护：十六进制颜色值过滤；动态拼接类名（`prefix`+n）移至「疑似动态」列，不计入判定。

**确认死类名：35　疑似动态（已剔除）：2　死 ID 选择器：3**

### 按首段聚类（确认死类名）

| 前缀簇 | 数量 | 样例 |
|---|---|---|
| `item` | 6 | `item-card`, `item-list`, `item-card-content`, `item-card-title`, `item-card-subtitle`, `item-card-actions` |
| `cs` | 5 | `cs-liantai`, `cs-stone`, `cs-bianshan`, `cs-yezi`, `cs-mei` |
| `alert` | 4 | `alert-icon-wrapper`, `alert-item`, `alert-days`, `alert-badge` |
| `icon` | 4 | `icon-option`, `icon-picker`, `icon-picker-sm`, `icon-option-sm` |
| `kpi` | 3 | `kpi-card`, `kpi-value`, `kpi-delta` |
| `focus` | 2 | `focus-box`, `focus-label` |
| `scroll` | 2 | `scroll-top-btn`, `scroll-workbench-host` |
| `arch` | 1 | `arch-date-range` |
| `form` | 1 | `form-select` |
| `glows` | 1 | `glows-disabled` |
| `goal` | 1 | `goal-item-status-icon` |
| `section` | 1 | `section-title` |
| `stat` | 1 | `stat-card` |
| `theme` | 1 | `theme-panel-card` |
| `time` | 1 | `time-alert` |
| `urgent` | 1 | `urgent` |

### 疑似动态拼接（已从判定剔除，待人工确认）

`tw-mm-style-1` `tw-mm-style-3`

### 死 ID 选择器

`#goalProgressChart` `#panel-date-picker` `#twClear`
<!-- AUTO-GENERATED:dead-css END -->
