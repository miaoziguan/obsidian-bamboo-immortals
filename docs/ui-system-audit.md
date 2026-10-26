# UI 系统梳理 · 地基审计报告

> 目标：为 webapp UI 系统重塑提供「现状地图 + token 架构 + 护栏」。
> **深度优先于广度**——本报告只做客观盘点，不做改版/美化。
> 配套工具：`scripts/ui-token-audit.py`（token 审计）、`scripts/ui-component-inventory.py`（组件盘点）、
> `scripts/ui-contrast-audit.py`（对比度）、`scripts/ui-visual-baseline.mjs`（视觉基线）。
> 收敛方案（交付物 ④）见 [`docs/ui-token-proposal.md`](ui-token-proposal.md)；
> 活体样式指南见 `docs/ui-styleguide.html`。

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
4. R1 视觉回归基线已建立（见 §7），但**仅覆盖 `app.html` 外壳**的 4 个主题态；`scroll`/`archive` 与各面板需注入种子数据后才能纳入。

---

## 7. 视觉回归基线（R1）

### 关键实现要点

- webapp 用 `attachShadow(open)`，**整套 UI 在 shadow 内** → 对 iframe / DOM 外层截图只会得到空白，必须穿透 `shadowRoot`（`window.__bambooShadowRoot`）。
- `app.html` 是自包含产物（内联 CSS+JS），可 `file://` 直开独立渲染；仅存储桥接不可用（控制台一条 `Failed to load from storage`，无害，不影响样式）。
- 主题切换即在 shadow host（`.bamboo-shadow-host`）上加 `dark` / `privacy-on` 类，与生产 `:host(.dark)` / `:host(.privacy-on)` 机制**完全一致**。
- 截图用 `reducedMotion: 'reduce'` 抑制动画，保证可复现。

### 基线清单（`docs/ui-baseline/`）

| 文件 | 状态 |
|---|---|
| `app-light.png` | 亮色（默认） |
| `app-dark.png` | 暗色（`host.dark`） |
| `app-privacy.png` | 隐私模糊（`host.privacy-on`） |
| `app-dark-privacy.png` | 暗色 + 隐私 |

### 基线本身暴露的现状（有价值的一手观察）

- **每日箴言按主题分流**：亮色「繁华有憔悴，堂上生荆杞」/ 暗色「俯仰自得，游心太玄」——不是同一份文案，说明存在按明暗切换的文案表。
- 暗色画布是**浅色竹纹 + 暖色日轮**压在深竹背景上，属于「反相纸张」设计，不是简单变暗。
- 隐私态是整体高斯模糊，**UI 骨架（尺寸/布局）不变**。

### 未覆盖（诚实声明）

- `scroll.html`（画中卷三模式）与 `archive.html` 在无数据时近乎空白（仅页面圆点），需先注入种子文档。
- FAB 展开 / `display-panel` / `modal-panel` 的内容由 `moduleManager` 等依宿主数据动态生成，独立运行时为空，截图与 light 态相同 → 面板级基线待二阶段（注入种子数据）。

### 复现

```bash
# playwright 体积大且会触发浏览器下载，故不列入项目依赖，避免 CI 的 npm ci 拉浏览器
npm --prefix /tmp/uirig i playwright@1.49.1   # Node 18 需 ≤1.49；1.64 起要求 Node 20
BAMBOO_REPO=<repo 根> cp scripts/ui-visual-baseline.mjs /tmp/uirig/
(cd /tmp/uirig && node ui-visual-baseline.mjs)
```

---

## 8. 对比度审计（D，`scripts/ui-contrast-audit.py`）

### 方法

- 从 `variables.css` 解析 token 求值。暗色 token 不是写死十六进制，而是
  `hsl(calc(var(--accent-hue) - 7), min(100%, calc(40% * var(--accent-saturation-ui, 1))), calc(25% + var(--accent-lightness-offset)))`
  这类表达式，**必须自行求值**；脚本内置了 `calc()`/`min()`/`var()` 的求值器。
  默认取产品默认值 `--accent-hue=120`、`--accent-saturation-ui=1`、`--accent-lightness-offset=0%`。
- 半透明背景（如 `--card-bg: rgba(255,255,255,.6)`）按 alpha 合成到该主题 `--surface-solid` 再算。
- 用 WCAG 2.1 相对亮度公式，阈值：AAA 7:1 / AA 4.5:1 / 大字与 UI 组件 3:1。

> 解析坑：必须先剥注释。注释里出现的 `--surface-solid: #1c2a1e，写死色…`
> 会被当成真实定义覆盖真值，导致暗色主题整块解析失败。

### 默认态结果：全部达标 ✅

| 主题 | 最低对比度 | 出现位置 | 整体 |
|---|---|---|---|
| 亮色 | 4.49 | `--ink-pale` on `--bg-gradient-end` | 其余多为 AAA / AA |
| 暗色 | 4.49 | `--ink-pale` on `--bamboo-background` | 其余多为 AAA / AA |

20 组/主题全部 ≥3:1。

### ⚠️ 关键发现：明度滑块会击穿对比度

用户可拖动 DisplayManager 明度滑块（注释标明范围 **~-15% ~ +15%**）。
扫描 `色相{0,60,120,180,240,300} × 明度{-15%,0%,+15%}`：

| 主题 | <3:1（不合格） | 未达 AA(4.5) |
|---|---|---|
| 亮色 | **4** 组 | 22 / 360 |
| 暗色 | **9** 组 | 35 / 360（最低 **2.39**） |

全部集中在 `--ink-pale`（最浅文字档）。

**根因（两个方向相反，却是同一类错误：文字阶梯与表面阶梯未耦合）**

- **暗色**：`--ink-pale = hsl(hue, 6%, calc(60% + offset))` → offset `-15%` 时明度降到 45%，
  文字变成 `rgb(108,122,108)`（**更暗**），而背景未同步变亮 → 对比度跌至 **2.39**。
- **亮色**：`--ink-pale` 是**写死的 `#707070` 完全不动**，而 `--bg-gradient-* = hsl(..., 95% + offset)`
  随滑块变暗 → 对比度跌至 **2.83**。

即：调主题明度时，文字与表面**各自为政**，其比值不守恒——这正是「视觉能量守恒」被破坏的实例。

### ✅ 已实施修复（2026-10-27，治本）

**原则**：可读性不应随装饰性滑块漂移；文字阶梯与表面阶梯必须**解耦并各自设界**。

改动（`variables.css`）：

| 主题 | 改动 | 目的 |
|---|---|---|
| 暗色 | `--ink-dark/medium/light/pale` 去掉 `+ var(--accent-lightness-offset)`；`--ink-pale` 60%→64% | 文字不再跟滑块漂移；最浅档提亮以跨过 AA |
| 暗色 | `--bg-gradient-*` 明度加 `min()` 上限（18/12/21/15%）；`--card-bg` / `--card-glass` 上限 13% | 滑块 +15% 时表面不会提亮到逼近文字 |
| 亮色 | `--bg-gradient-*` 明度加 `max()` 下限（92/90/86/91%） | 滑块 −15% 时纸面不会暗到逼近文字 |
| 亮色 | `--ink-pale` `#707070` → `#666666` | 最浅文字档加深，跨过 AA |
| 暗色 | `--bamboo-text-muted/secondary` 改为 `var(--ink-pale)` / `var(--ink-medium)` | 废弃别名跟随，避免两处公式不同步 |

**复核结果**（色相 {0,60,120,180,240,300} × 明度 {−15%,0%,+15%}，共 720 组）：

| 主题 | 修复前最低 | 修复后最低 | <3:1 | <4.5 |
|---|---|---|---|---|
| 亮色 | 2.83（4 组不合格） | **4.51** | 0 | **0 ✅** |
| 暗色 | 2.39（9 组不合格） | **4.66** | 0 | **0 ✅** |

且暗色数值在 −15% / 0% / +15% 三档**完全相同** → 证明文字与滑块已彻底解耦。
默认态亦提升：暗色 `--ink-pale` 由 4.49 → 5.08~7.09；亮色由 4.49 → 5.20~5.74。

**代价（有意取舍）**：明度滑块对大块表面的作用范围被收窄（亮色纸面只在 91~96% 间变化，暗色表面有上限）；强调色仍可自由调整。即"可读性优先于装饰"。

---

## 9. 活体样式指南（E，`docs/ui-styleguide.html`）

### 为什么叫「活体」

不是手写副本、也不是离线近似：

- 页面创建 `div.bamboo-shadow-host` + `attachShadow`，用 `<link>` 加载**真实的**
  `../webapp/assets/styles/variables.css`；
- 主题切换 = 给 host 加 `.dark` 类，与生产 `:host(.dark)` 走**完全同一条** CSS 路径；
- 所有色值经 `getComputedStyle` 解析，对比度用浏览器算出的真实 RGB 现算。

### 内容

墨色阶梯 / 表面纸面 / **实时对比度矩阵** / 字号刻度（17 档）/ 间距刻度（8 档）/
圆角刻度（16 个代表项）/ 组件示例（真实 class 渲染）；
顶部另有**色相、明度偏移滑块**——拖动即可看到对比度实时变化。

打开方式：浏览器直接打开 `docs/ui-styleguide.html`（需与 `webapp/` 同级目录结构）。

### 它当场抓到了审计脚本的盲区（E 的最大价值）

初版 `ui-contrast-audit.py` 只测 **5** 个表面（surface-solid / card-bg /
bamboo-background / bg-gradient-start / end），而指南测 **8** 个。浏览器实测发现：

| 主题 | 明度偏移 | 实测最低 |
|---|---|---|
| 亮色 | −15% | **4.25**（未达 AA） |
| 暗色 | +15% | **4.12**（未达 AA） |

根因：`--bg-gradient-mid2` 的明度界最宽（亮色下限 86%、暗色上限 21%），
而它**不在脚本的覆盖面里**。补齐表面列表（→ 576 组）后复现为 3.95 / 4.09。

### 修正

- 亮色 `mid1` 下限 90% → **91%**；`mid2` 下限 86% → **91%**
- 暗色 `mid2` 上限 21% → **18%**

复核（脚本 576 组 + 浏览器双通道）：

| 主题 | 脚本最低 | 浏览器最低（各偏移） | <4.5 |
|---|---|---|---|
| 亮色 | 4.51 | 4.76 ~ 5.40 | **0** |
| 暗色 | 4.66 | 4.66 ~ 5.08 | **0** |

**教训**：单一工具的覆盖率就是它的盲区。活体指南走真实渲染路径、离线脚本做
全网格穷举，两者互为校验——这正是「除了你我的判断，还有什么能证明结果是对的」的答案。
