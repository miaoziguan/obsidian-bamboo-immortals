# UI 系统梳理 · 地基审计报告

> 目标：为 webapp UI 系统重塑提供「现状地图 + token 架构 + 护栏」。
> **深度优先于广度**——本报告只做客观盘点，不做改版/美化。
> 配套工具：`scripts/ui-token-audit.py`（token 审计）、`scripts/ui-component-inventory.py`（组件盘点）。

---

## 1. 资产全貌

| 项 | 值 |
|---|---|
| CSS 文件数 | 37 |
| CSS 总行数 | 25,137 |
| 最大的文件 | `timeline.css` 2169 / `notes.css` 1939 / `modal-panels.css` 1824 / `dark.css` 1684 |

### 关键前提：项目已有体系，问题是漂移

`variables.css` 头部**已写明**一套三层 token 架构与禁令：

- 基础色板层 `--{palette}-{shade}`、语义层 `--{semantic}-{variant}`、组件层 `--{component}-{property}`
- RGB 通道 `--{name}-rgb`、刻度族 `--space-*` / `--radius-*` / `--type-*`
- lint R10 强制 `--bm-*` / `--bamboo-*` 前缀
- **明文禁令**：禁止裸写 `#fff` / `#000` / `rgb(255,255,255)`；禁止裸写 px 圆角与 px 字号

→ 因此本项目的正确姿势是**收敛回自家规范**，而非另造一套设计系统。

---

## 2. token 审计（`ui-token-audit.py`）

### 总量

| 指标 | 值 |
|---|---|
| 自定义属性定义 | 812 处 |
| 去重后 token 种类 | 421 |
| 被 `var()` 引用 | 357 |
| 重复定义（>1 处） | 219 |
| 定义但未使用 | 112 |
| 使用但未定义 | 48 → **35**（两轮修复后） |

### 魔法数（未走 token 的硬编码）

| 类别 | 处数 |
|---|---|
| 颜色 | 274 |
| 间距 | 987 |
| 字号 | 94 |
| 圆角 | 105 |
| 阴影 | 87 |
| 归一化后不同颜色值 | 113 |
| 近重复颜色簇（距离 ≤12） | 17 |

最刺眼： **`#fff` 出现 37 次**——而 `variables.css` 头部明文禁止裸写 `#fff`。

### 刻度采用率（口径：token 引用次数 vs 硬编码 px 出现次数）

| 刻度族 | 定义 | token 引用 | 硬编码 | 采用率 |
|---|---|---|---|---|
| `--space-*` | 8 | 385 | 987 | **≈28%** ❌ 最大洼地 |
| `--radius-*` | 26 | 371 | 105 | ≈78% |
| `--type-*` | 18 | 526 | 94 | ≈85% |
| `--z-layer-*` | 12 | 24 | — | 低但合理 |
| `--motion-*` / `--dur-*` | **0** | **0** | — | **完全没有** ❌ |

> 口径说明：硬编码按「px 出现次数」计（非声明数）。若按声明数计，圆角/字号硬编码分别为 46 / 86 处，结论不变：**间距是最大洼地，动效 token 为零**。

### 顺带发现（冗余刻度）

`--type-*` 存在**两条并行命名族**，是收敛对象：

- `--type-xs / sm / base / md / lg / xl / 2xl / display`
- `--type-mini / micro / caption / body / lead / heading / large / hero / mega`

---

## 3. 失效 token 定性（48 个「使用但未定义」的处置）

### 已修 · A 组：真失效（无 fallback，`var()` 永不解析）

| token | 引用 | 替换为 | 依据 |
|---|---|---|---|
| `--card-border` | 6 | `--border-light` | 既有通用边框 token（明暗各一版） |
| `--type-2xs` | 4 | `--type-mini` | 刻度无 `2xs` 档；`mini` 典型视口 10px，与原 `var(--type-2xs, 10px)` 的 fallback 一致 |
| `--bg-tertiary` | 1 | `rgba(var(--primary-rgb), 0.1)` | 全仓 75 次的主流轻微底纹写法 |

### 已修 · Obsidian 原生变量 10 个 / 26 处

**机制实证**（不是推测）：

1. iframe 是**独立文档**（`data:` / blob URL），Obsidian 的 CSS 变量**不会跨文档继承**；
2. 宿主 `ThemeBridge` 确实用 `getComputedStyle` 读取 `--text-normal` / `--text-muted` / `--interactive-accent` / `--background-primary`，但经 **postMessage** 推的是**值**；
3. webapp 收到后 `DisplayManager._applyObsidianText()` 写入的是项目自有的
   `--ink-dark` / `--ink-medium` / `--ink-light` / `--ink-pale`，**并非同名变量**。

→ 故这些 `var()` 在 webapp 内永不解析。

| Obsidian 变量 | → 自有 token |
|---|---|
| `--text-normal` | `--text-primary` |
| `--text-muted` | `--text-secondary` |
| `--text-faint` / `--text-quaternary` | `--text-tertiary` |
| `--text-accent` | `--bamboo-primary` |
| `--font-ui` | `--font-family`（苹方/雅黑中文栈，优于原 `system-ui`） |
| `--border-medium` | `--border-light` |
| `--text-secondary-rgb` | `--primary-rgb`（保留 `rgba(...,0.5)` 结构） |
| `--background-modifier-hover` | `rgba(var(--primary-rgb), 0.1)` |
| `--background-tertiary` | `--bamboo-background` |

顺带把 tooltip 滚动圆点三态落成墨色阶梯（tertiary / secondary / primary），不再写死三个 rgba，且可跟随 `--accent-hue`。

### ⚠️ 一处更正（勿再当 bug 处理）

**`--border-dark-rgb` 引用 17 处，但全部带 fallback `(60,70,60)`**，实际渲染 `rgba(60,70,60,α)`，工作正常。曾误判为「真失效」，实为 B 组（优雅降级 / 外部主题契约），**未改动**。

### 待办 · B 组 35 个：有 fallback 的优雅降级项

永远走兜底值，属「留了扩展点但从未有人填」。两种处置：

1. 在 `variables.css` 显式定义；或
2. 在本文档明确标注为**外部主题契约**（C3：外部主题经 `getStyleMount()` 注入）。

**不可当死代码删除**——外部主题可能正靠它们覆写。

---

## 4. 组件盘点（`ui-component-inventory.py`）

### 方法修正（重要）

初版直接扫全文计数，得出 `left`×311、`org`×45、`w3`×43——**全是噪声**（`org`/`w3` 来自 URL `w3.org`，`left` 来自 `{left:0}` 属性名）。
改为**只在字符串字面量内计数**（CSS 类在 JS 中必然以字符串出现），并把裸单词类与命名空间类分开统计。

### 复用率

| 分类 | 总数 | 存活 | 复用(≥2处) | 一次性 | 复用率 |
|---|---|---|---|---|---|
| 命名空间类（可靠） | 1289 | 1261 | 646 | 55 | **51.2%** |
| 裸单词类（噪声高，参考） | 85 | 84 | 79 | 2 | 94.0% |
| 死类 | — | — | — | — | 28 |

### 各组件族的「系统化程度」

| 命名空间 | 存活类数 | 族内复用率 | 判读 |
|---|---|---|---|
| `todo` | 37 | 97.3% | 最系统化 |
| `fab` | 35 | 74.3% | 良好 |
| `is`（状态类） | 43 | 72.1% | 良好 |
| `bamboo` | 37 | 67.6% | 良好 |
| `bm` | 33 | 63.6% | 良好 |
| `tw`（画中卷核心） | 139 | 54.7% | 最大族，中等 |
| `drp` | 32 | 50.0% | 中等 |
| `shop` | 69 | 49.3% | 中等 |
| `wn` | 41 | 39.0% | 偏低 |
| `arch` | 48 | 37.5% | 偏低 |
| `scroll` | 43 | 34.9% | 偏低 |
| **`goal`** | **78** | **26.9%** | **全族最低，最大洼地** |

→ 组件化的**优先目标是 `goal` 族**，而非最大的 `tw` 族（`tw` 复用率尚可且是画布核心、风险高）。

### 高频真组件 Top

```
tw-card ×85 · bamboo-license-gate ×48 · tw-card-text ×45 · bm-sticker ×41
fab-panel-section ×27 · market-btn ×26 · drp-quick-btn ×20 · tw-canvas ×20
fab-action-btn ×19 · bm-btn ×18 · fab-panel-section-title ×16 · bamboo-card-header ×15
tw-card-resize ×15 · goal-row ×14 · market-card ×14 · tw-mm-node ×14
```

### 一次性样式清单（55 个，需打折看）

按族分布：`tw` 31 · `drp` 5 · `goal` 5 · `is` 2 · `modal` 2 · `sm` 2 · `status` 2 · 其余各 1

**修正**：其中 25 个实为 3 个完整子族，仅因从同一模板函数生成才各计 1 次：

- `tw-link-*`（11）= 连线控件
- `tw-doc-*`（10）= 文档列表
- `drp-day-*`（4）= 日期选择器

→ **真实一次性样式约 30 个**，其余是静态计数的固有局限。

---

## 5. 度量基线（当前值）

| 指标 | 当前 | 目标 |
|---|---|---|
| token 种类数 | 421（未用 112） | 收敛后待定 |
| 间距刻度采用率 | ≈28% | 显著提升 |
| 动效 token | 0 | 建立刻度 |
| 未定义引用 | 35（均为带 fallback） | 显式化 |
| 组件复用率 | 51.2% | 提升（优先 goal 族） |
| `app.html` 载荷 | 347,616 B | 收敛后应下降 |
| 对比度达标率 | 未测（待 D） | WCAG AA |

---

## 6. 已知局限（诚实声明）

1. **原子层级分类是关键词启发式**，426 个未分类，只能当初筛，不能当结论，需人工校正。
2. **静态计数无法区分**「写死一处」与「模板内复用 100 次」，故「一次性样式」是**上界**。
3. 硬编码处数按 px 出现次数计，与声明数口径不同（圆角 105 vs 46、字号 94 vs 86）。
4. R1（穿透 shadow DOM 的视觉回归基线）尚未建立，目前**无客观视觉基线**，后续任何视觉改动都无法自动验证。
