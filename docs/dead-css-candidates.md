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
| `week` | 18 | **建议删（整簇真死）** | `week-*` 类名全分区 0；`week` 命中仅为 `currentWeekday`(id)、`weekdays`(数组)、`drp-weekdays`/`wn-date-weekdays`(异前缀) → 疑似已移除周视图 UI |
| `kpi` | 10 | **建议删（整簇真死）** | `kpi-*` 类名全 0；`kpi` 命中仅 `result.kpi`(数据字段) → 疑似已移除 KPI 卡片 UI |
| `cs` | 5 | **建议删（类名真死）** | 源 JS 89 处 `cs-` 实为 `var(--cs-1..4)` **CSS 变量**；`cs-liantai/stone/yezi/mei/bianshan` 类名 0 引用 → incense 主题类名残留 |
| `ai`（ai-wizard*） | 28 | **建议删（整簇真死）** | 全分区 0，含打包 html 非 style 处亦 0 → 疑似未实现 AI 向导 UI 残留 |
| `achievement(s)` | 34 | **建议删（整簇真死）** | 源 JS 仅 4 处非 class 引用；无任何 `achievement-*` 类名使用 → 疑似已移除成就系统 UI |
| `history` | 11 | **建议删（整簇真死）** | `history-*` 无任 class 令牌使用 → 疑似已移除历史视图 UI |
| `status` | 10 | **建议删（整簇真死）** | `status-*` 无任 class 令牌（注意：状态徽标若真需保留须在源码补 class 引用，否则视为残留） |
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

#### 单名死类长尾（无连字符，共 20 个，逐条见 AUTO-GENERATED 生成区）

多为动画/工具类。**其中 11 个是 `@keyframes` 动画名**（`breathePink`/`breatheSky`/`dotBreath`/`fadeIn`/`fadeInUp`/`heartbeat`/`highlight`/`lotteryPickedGlow`/`moonGlow`/`nodeGlow`/`slideUp`）：**这些 class 本身死，但其 `@keyframes` 必须保留**，删 `.name` class 即可、勿删 keyframes。其余纯死 class（可删）：`breakthrough`/`future`/`jpg`/`large`/`neutral`/`secondary`/`small`/`subtitle`/`tomorrow`。

### 核查方法论（避免误判的关键）
- **变量 ≠ 类名**：`cs-` 命中 89 处实是 `var(--cs-*)`，类名本身仍死——切忌把 CSS 变量引用当类名使用。
- **前缀拼接陷阱**：`week-`/`kpi-` 为 0 是「整簇真死」；而 `goal-`/`sm-`/`gho-` 虽前缀大量出现，但活的是**其它具体类名**，死的是**特定旧名**——必须用 AUTO-GENERATED 的逐类名清单删，不能整簇删。
- **打包 html 含 CSS 定义**：`kpi-card` 在打包 `<style>` 内出现 2 次是 CSS 定义本身，非使用；已用「剥离 `<style>` 后计数」区分。
- **动态赋类盲区（classList / className / 模板）**：本清单初版只比对 `class="x"` / `className='x'` 字面量令牌，会漏掉通过 `el.classList.add('x')` / `el.className = '…x…'` / `` class=`…${x}…` `` 施加的类。状态类（`edit-mode-active` 等）尤其危险。删除前必须**全仓（含产物 html / host TS）用边界正则 `(?<![-\w])x(?![-\w])` 复核**，确认无动态引用。已执行的 `action`/`edit` 簇均通过此复核。

---

<!-- AUTO-GENERATED:dead-css START -->
> 本节由 `scripts/check-dead-css.mjs` **自动生成，勿手改**。改完代码执行：
> `node scripts/check-dead-css.mjs --update`（CI 跑默认模式校验漂移）。
>
> 扫描：定义 `webapp/assets/styles/**/*.css`；使用 `webapp/assets/scripts/**/*.js`(排除 tests) + `webapp/*src*.html`/`index.html`（刻意排除 4 个打包产物 html，避免把 CSS 定义当使用）。
> 误判防护：十六进制颜色值过滤；动态拼接类名（`prefix`+n）移至「疑似动态」列，不计入判定。

**确认死类名：587　疑似动态（已剔除）：3　死 ID 选择器：3**

### 按首段聚类（确认死类名）

| 前缀簇 | 数量 | 样例 |
|---|---|---|
| `goal` | 126 | `goal-title`, `goal-text`, `goal-row-meta-empty`, `goal-action-cancel`, `goal-action-btn`, `goal-editor-v2`, … |
| `ai` | 28 | `ai-wizard`, `ai-wizard-steps`, `ai-wizard-dot`, `ai-wizard-line`, `ai-wizard-body`, `ai-wizard-label`, … |
| `achievement` | 24 | `achievement-icon-wrapper`, `achievement-icon-wrapper-horizontal`, `achievement-card-full`, `achievement-icon-wrapper-full`, `achievement-content-full`, `achievement-title-full`, … |
| `week` | 18 | `week-view`, `week-header`, `week-nav`, `week-nav-btn`, `week-title`, `week-today-btn`, … |
| `settings` | 15 | `settings-section`, `settings-section-title`, `settings-backup-status`, `settings-theme-grid`, `settings-theme-card`, `settings-theme-preview`, … |
| `template` | 15 | `template-tabs`, `template-tab`, `template-grid`, `template-card`, `template-card-icon`, `template-card-content`, … |
| `scroll` | 14 | `scroll-note-title`, `scroll-note-meta`, `scroll-notes-empty`, `scroll-top-btn`, `scroll-incense-feature`, `scroll-btn`, … |
| `theme` | 14 | `theme-panel-grid`, `theme-panel-card`, `theme-panel-card-name`, `theme-unloaded`, `theme-panel-card-badge`, `theme-loading`, … |
| `bamboo` | 13 | `bamboo-controls`, `bamboo-garden-btn`, `bamboo-garden-section`, `bamboo-progress-fill`, `bamboo-progress-minimal`, `bamboo-progress-main`, … |
| `legend` | 13 | `legend-item-new`, `legend-dot-new`, `legend-text-new`, `legend-label-new`, `legend-value-new`, `legend-item-horizontal`, … |
| `priority` | 13 | `priority-grid`, `priority-card`, `priority-header`, `priority-indicator`, `priority-label`, `priority-value`, … |
| `sm` | 13 | `sm-container`, `sm-section`, `sm-section-header`, `sm-count`, `sm-btn-edit`, `sm-btn-delete`, … |
| `section` | 12 | `section-title`, `section-desc`, `section-toggle`, `section-settings-trigger`, `section-action-trigger`, `section-settings-btn-edit`, … |
| `stats` | 12 | `stats-section-primary`, `stats-section-warning`, `stats-card-value`, `stats-grid`, `stats-modal`, `stats-header`, … |
| `history` | 11 | `history-close`, `history-item`, `history-modal`, `history-content`, `history-header`, `history-title`, … |
| `achievements` | 10 | `achievements-container`, `achievements-grid-full`, `achievements-summary-grid`, `achievements-empty-state`, `achievements-empty-icon`, `achievements-empty-title`, … |
| `kpi` | 10 | `kpi-card`, `kpi-grid`, `kpi-icon`, `kpi-label`, `kpi-value`, `kpi-delta`, … |
| `status` | 10 | `status-distribution-new`, `status-legend-new`, `status-distribution-vertical`, `status-legend-horizontal`, `status-distribution`, `status-pending`, … |
| `alert` | 9 | `alert-item`, `alert-icon-wrapper`, `alert-content`, `alert-title`, `alert-meta`, `alert-days`, … |
| `bm` | 8 | `bm-btn--md`, `bm-btn--lg`, `bm-btn--outline`, `bm-btn--ghost`, `bm-btn--success`, `bm-btn--loading`, … |
| `completed` | 7 | `completed-legend`, `completed-horizontal`, `completed-item`, `completed-icon`, `completed-title`, `completed-more`, … |
| `todo` | 7 | `todo-item-text`, `todo-item-action`, `todo-item-row`, `todo-item-name`, `todo-item-hint`, `todo-section-title`, … |
| `btn` | 6 | `btn-sm`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-danger`, `btn-success` |
| `empty` | 6 | `empty-state`, `empty-state-text`, `empty-state-btn`, `empty-icon`, `empty-text`, `empty-desc` |
| `time` | 6 | `time-alerts-grid`, `time-alert`, `time-span-item`, `time-alert-list`, `time-span-stats`, `time-input` |
| `arch` | 5 | `arch-date-input`, `arch-sep`, `arch-select-progress`, `arch-date-range`, `arch-date-err` |
| `cs` | 5 | `cs-liantai`, `cs-stone`, `cs-bianshan`, `cs-yezi`, `cs-mei` |
| `gho` | 5 | `gho-stat-today`, `gho-svg-bg`, `gho-hero-inner`, `gho-hero-ring`, `gho-hero-score` |
| `stub` | 5 | `stub-back-title`, `stub-name`, `stub-caption`, `stub-value`, `stub-title-en` |
| `ticket` | 5 | `ticket-sub-label`, `ticket-body-text`, `ticket-text`, `ticket-notch`, `ticket-pattern` |
| `timeline` | 5 | `timeline-entry`, `timeline-stat`, `timeline-stats-row`, `timeline-stat-label`, `timeline-stat-value` |
| `toast` | 5 | `toast-success`, `toast-error`, `toast-warning`, `toast-info`, `toast-loading` |
| `icon` | 4 | `icon-option`, `icon-picker`, `icon-picker-sm`, `icon-option-sm` |
| `keyboard` | 4 | `keyboard-hint`, `keyboard-hint-icon`, `keyboard-hint-text`, `keyboard-hint-close` |
| `progress` | 4 | `progress-tier`, `progress-fill-green`, `progress-tiers`, `progress-fill` |
| `touch` | 4 | `touch-target-sm`, `touch-friendly`, `touch-active`, `touch-target` |
| `tw` | 4 | `tw-signal`, `tw-batt`, `tw-auto`, `tw-canvas-hint` |
| `card` | 3 | `card-title`, `card-desc`, `card-edit-hint` |
| `diagnosis` | 3 | `diagnosis-group`, `diagnosis-tag`, `diagnosis-card` |
| `editor` | 3 | `editor-modal`, `editor-title-input`, `editor-content-textarea` |
| `fab` | 3 | `fab-archive-top`, `fab-left`, `fab-top` |
| `focus` | 3 | `focus-box`, `focus-label`, `focus-text` |
| `normal` | 3 | `normal-row`, `normal-label`, `normal-content` |
| `pie` | 3 | `pie-container`, `pie-container-vertical`, `pie-chart-wrapper` |
| `shortcut` | 3 | `shortcut-item`, `shortcut-key`, `shortcut-desc` |
| `stat` | 3 | `stat-card`, `stat-number`, `stat-icon` |
| `category` | 2 | `category-empty-state`, `category-empty-state-text` |
| `catm` | 2 | `catm-item-icon`, `catm-icon-input` |
| `chart` | 2 | `chart-canvas`, `chart-container` |
| `color` | 2 | `color-picker`, `color-option` |
| `form` | 2 | `form-textarea`, `form-actions` |
| `glow` | 2 | `glow-pulse`, `glow-pulse-fade` |
| `has` | 2 | `has-advanced`, `has-pending` |
| `heatmap` | 2 | `heatmap-container`, `heatmap-day` |
| `highlight` | 2 | `highlight`, `highlight-subitem` |
| `inprogress` | 2 | `inprogress-legend`, `inprogress-horizontal` |
| `item` | 2 | `item-complete`, `item-action-btn` |
| `modal` | 2 | `modal-hero-big-number`, `modal-actions` |
| `notstarted` | 2 | `notstarted-legend`, `notstarted-horizontal` |
| `tier` | 2 | `tier-bar-wrapper`, `tier-info` |
| `animations` | 1 | `animations-paused` |
| `bad` | 1 | `bad` |
| `badge` | 1 | `badge-info` |
| `balance` | 1 | `balance-jump` |
| `bar` | 1 | `bar-complete` |
| `big` | 1 | `big-display-number` |
| `breakthrough` | 1 | `breakthrough` |
| `breathePink` | 1 | `breathePink` |
| `breatheSky` | 1 | `breatheSky` |
| `confirm` | 1 | `confirm-dialog-content` |
| `date` | 1 | `date-picker-btn` |
| `detail` | 1 | `detail-complete` |
| `display` | 1 | `display-follow-theme-section` |
| `dotBreath` | 1 | `dotBreath` |
| `dropdown` | 1 | `dropdown-arrow` |
| `effect` | 1 | `effect-offscreen` |
| `emoji` | 1 | `emoji-decorative` |
| `expand` | 1 | `expand-btn` |
| `fadeIn` | 1 | `fadeIn` |
| `fadeInUp` | 1 | `fadeInUp` |
| `future` | 1 | `future` |
| `glows` | 1 | `glows-disabled` |
| `goose` | 1 | `goose-body` |
| `header` | 1 | `header-quick-btn` |
| `health` | 1 | `health-tips-list` |
| `heartbeat` | 1 | `heartbeat` |
| `high` | 1 | `high-priority` |
| `input` | 1 | `input-error` |
| `is` | 1 | `is-typing` |
| `jpg` | 1 | `jpg` |
| `just` | 1 | `just-completed` |
| `large` | 1 | `large` |
| `list` | 1 | `list-item-row` |
| `loading` | 1 | `loading-spinner` |
| `lotteryPickedGlow` | 1 | `lotteryPickedGlow` |
| `low` | 1 | `low-priority` |
| `medium` | 1 | `medium-priority` |
| `moonGlow` | 1 | `moonGlow` |
| `neutral` | 1 | `neutral` |
| `nodeGlow` | 1 | `nodeGlow` |
| `onboarding` | 1 | `onboarding-highlight` |
| `period` | 1 | `period-content` |
| `philosophy` | 1 | `philosophy-icon` |
| `pulse` | 1 | `pulse-glow` |
| `secondary` | 1 | `secondary` |
| `shop` | 1 | `shop-currency` |
| `shortcuts` | 1 | `shortcuts-list` |
| `slideUp` | 1 | `slideUp` |
| `subtitle` | 1 | `subtitle` |
| `swipe` | 1 | `swipe-hint` |
| `text` | 1 | `text-block` |
| `tomorrow` | 1 | `tomorrow` |
| `tooltip` | 1 | `tooltip-close` |
| `urgent` | 1 | `urgent` |
| `view` | 1 | `view-toggle-btn-sm` |
| `wallet` | 1 | `wallet-action` |
| `weather` | 1 | `weather-text` |

### 疑似动态拼接（已从判定剔除，待人工确认）

`rw-768` `tw-mm-style-1` `tw-mm-style-3`

### 死 ID 选择器

`#goalProgressChart` `#panel-date-picker` `#twClear`
<!-- AUTO-GENERATED:dead-css END -->
