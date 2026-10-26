# UI token 收敛方案（交付物 ④）

> 目标：把「有体系但漂移」收敛为「体系可强制」。
> 所有结论均来自 `scripts/ui-token-audit.py` 与 `scripts/ui-component-inventory.py` 的实测数据，
> 刻度取值来自 `webapp/assets/styles/variables.css` 的真实值。

---

## 1. 根因：刻度盖不住实际用的值

这是采用率低下的**真正原因**，不是"开发者不守规矩"。

### 间距

现有 `--space-1..8` = **4 / 8 / 12 / 16 / 20 / 24 / 28 / 32**（4px 步进）。
但硬编码里实际用得最多的是：

| 值 | 次数 | 是否在现有刻度上 |
|---|---|---|
| 6px | **298** | ❌ |
| 8px | 280 | ✅ |
| 10px | **228** | ❌ |
| 4px | 194 | ✅ |
| 12px | 192 | ✅ |
| 2px | **138** | ❌ |
| 16px | 88 | ✅ |
| 14px | **88** | ❌ |
| 3px | **74** | ❌ |
| 5px | **62** | ❌ |
| 1px | **50** | ❌ |
| 20px | 48 | ✅ |
| 7px | 20 | ❌ |
| 24px | 18 | ✅ |

**用得最多的 6px 不在刻度上**，2/3/5/10/14 也不在。开发者想用 6px 只能裸写——
采用率 28% 由此而来。

### 字号：两族并行 + 5 组完全重复

现有 18 个 `--type-*`，实际只有 **13 个不同取值**，存在 5 组完全重复：

| 重复组 | 取值 |
|---|---|
| `--type-base` = `--type-body` | clamp(13,2.8vw,15) |
| `--type-md` = `--type-lead` | clamp(14,3.2vw,17) |
| `--type-xl` = `--type-large` | clamp(18,4.8vw,24) |
| `--type-2xl` = `--type-hero` | clamp(20,5.5vw,28) |
| `--type-display` = `--type-mega` | clamp(24,7vw,36) |

### 圆角：26 个 token，其中 9 个是 ad-hoc 数字名

`--radius-1` `--radius-2-5` `--radius-3` `--radius-4` `--radius-5` `--radius-7`
`--radius-9` `--radius-26` `--radius-38` —— 直接用像素值当名字，属临时补救。
另有 4 个语义别名（card/control/modal/panel/tooltip）是**好的设计**，应保留并推广。

### 阴影与动效

- 阴影：**87 处硬编码，0 个 token**
- 动效：`--motion-*` / `--dur-*` **0 个定义、0 处引用**

---

## 2. 收敛原则

1. **先增量、后替换**：新增 token 不改旧值 → 零视觉变化；迁移另做。
2. **值命名优先于序号命名**：`--space-6` = 6px，无需查表，迁移也可机械化。
3. **原语 + 语义别名两层**：原语管取值，语义别名管用途（card/control/panel/modal）。
4. **护栏先行**：没有 lint 拦截，收敛完还会再漂。

---

## 3. 各刻度族方案

### 3.1 间距：值命名，覆盖全部观测值

**方案 A（推荐先行，零视觉变化）** —— 名字 = px 值，15 档：

```css
--space-1: 1px;  --space-2: 2px;  --space-3: 3px;  --space-4: 4px;
--space-5: 5px;  --space-6: 6px;  --space-7: 7px;  --space-8: 8px;
--space-10: 10px; --space-12: 12px; --space-14: 14px; --space-16: 16px;
--space-20: 20px; --space-24: 24px; --space-32: 32px;
```

覆盖上表全部 Top14 值 → 迁移纯机械（`6px` → `var(--space-6)`）。

**方案 B（后续可选，真收敛）** —— 压到 9 档（2/4/6/8/12/16/20/24/32），
把 1/3/5/7/10/14 吸附到临近档。刻度更干净，但有轻微视觉变化，需基线 diff 验证。

> ⚠️ 冲突处理：现有 `--space-1..8` 是**序号**命名（=4/8/…/32），与值命名冲突。
> 需一次性重映射（385 处引用，脚本化）：`--space-1→--space-4`、`--space-2→--space-8`…`--space-8→--space-32`。

### 3.2 圆角：26 → 8 个原语 + 5 个语义别名

```css
/* 原语 */
--radius-2xs: 2px;  --radius-xs: 4px;  --radius-sm: 8px;
--radius-md: 12px;  --radius-lg: 16px; --radius-xl: 20px;
--radius-2xl: 24px; --radius-pill: 9999px;
/* 语义别名（沿用现有良好设计） */
--radius-card: var(--radius-lg);
--radius-control: var(--radius-sm);
--radius-panel: var(--radius-xl);
--radius-modal: var(--radius-2xl);
--radius-tooltip: var(--radius-xs);
```

迁移映射：1 / 2.5 / 3 → `2xs(2)` 或 `xs(4)`；5 / 7 / 9 → `sm(8)`；
26 → `2xl(24)`；38 → `pill`（38px 已属全圆量级）。

### 3.3 字号：18 → 10 个原语 + 8 个废弃别名

**原语（保留一条族）**：

| token | 取值 |
|---|---|
| `--type-mini` | clamp(8,1.8vw,10) |
| `--type-xs` | clamp(10,2.2vw,12) |
| `--type-sm` | clamp(12,2.6vw,13) |
| `--type-base` | clamp(13,2.8vw,15) |
| `--type-md` | clamp(14,3.2vw,17) |
| `--type-lg` | clamp(15,3.8vw,20) |
| `--type-xl` | clamp(18,4.8vw,24) |
| `--type-2xl` | clamp(20,5.5vw,28) |
| `--type-display` | clamp(24,7vw,36) |
| `--type-display-big` | clamp(32,9vw,48) |

**废弃别名（指向原语，保持兼容，新代码禁用）**：
`--type-body→base`、`--type-caption→sm`、`--type-lead→md`、`--type-large→xl`、
`--type-heading→lg`、`--type-hero→2xl`、`--type-mega→display`、`--type-micro→mini`

### 3.4 阴影：新增 4 级 + inset（首个阴影 token）

从现有 87 处硬编码提取代表值：

```css
--bm-shadow-xs: 0 1px 2px rgba(16,24,40,.16);
--bm-shadow-sm: 0 1px 3px rgba(16,24,40,.18);
--bm-shadow-md: 0 6px 18px rgba(16,24,40,.18);
--bm-shadow-lg: 0 8px 24px -6px rgba(16,24,40,.28);
--bm-shadow-inset: inset 0 0 1px rgba(90,82,74,.4);
```

用 `--bm-` 前缀（符合 lint R10）。

### 3.5 动效：从 0 建立

```css
--bm-dur-fast: 120ms;
--bm-dur-base: 200ms;
--bm-dur-slow: 320ms;
--bm-ease-standard: cubic-bezier(.4, 0, .2, 1);
```

> TODO：动效具体取值需再统计一次现有 `transition` / `animation` 的时长分布后回填，
> 不要凭空定（与 §1 同样的原则：刻度必须来自实际值）。

### 3.6 颜色

- 新增语义 token 覆盖 Top 硬编码色（`#fff` ×37、`rgba(0,0,0,.18)` ×28、
  `rgba(16,24,40,.16)` ×15 等）—— 这些都是 `variables.css` 明文禁止的裸写。
- 新增色一律 `--bm-*` 前缀。

### 3.7 命名规则冲突（需裁定）

lint R10：新增自定义属性须用 `--bm-*` / `--bamboo-*`；`variables.css` **整体豁免**，
旧无前缀名走 `R10_ALLOWLIST` 白名单。

建议：
- 既有刻度族（`--space-*` / `--radius-*` / `--type-*`）保留原名 —— 白名单已放行，
  且分别有 385 / 371 / 526 处引用，重命名收益不抵风险；
- **新增族**（阴影 / 动效 / 颜色语义）用 `--bm-*` 前缀，符合 R10。

---

## 4. 迁移策略（分阶段，可回滚）

| 阶段 | 动作 | 视觉风险 |
|---|---|---|
| **0. 护栏先行** | 扩展 `scripts/lint-css-tokens.mjs`：新增规则禁止裸写 spacing / radius / font-size / box-shadow（定义处豁免） | 无 |
| **1. 纯增量** | 只新增 token，不改任何旧值、不替换任何使用处 | **零** |
| **2. 机械迁移** | 脚本批量把硬编码替换为 `var()`，按文件分批 | 低（但有） |
| **3. 废弃旧名** | 删除 `--radius-1/2-5/3/26/38/4/5/7/9`、`--type-body/lead/large/hero/mega` 等 | 低 |
| **4. 清理** | 112 个未使用 token 删除；35 个 fallback token 显式化或标注为外部契约 | 无 |

**阶段 2 的硬性要求**：每批迁移后必须跑
`scripts/ui-visual-baseline.mjs` 重新生成截图并与基线 diff，且 `npm run preflight` 全绿，
方可进入下一批。

---

## 5. 护栏（防复发，否则收敛完还会漂回去）

1. **lint 拦截裸写**（阶段 0）—— 最关键，没有它一切白做。
2. **活体指南 + 对比度审计进 CI**：任何 token 改动都跑
   `ui-contrast-audit.py`（576 组网格）与浏览器实测，双向校验。
3. **视觉基线 diff**：`docs/ui-baseline/` 作为回归锚点。

---

## 6. 风险与代价（诚实声明）

- **阶段 2 是唯一有视觉风险的环节**，必须分批 + 基线 diff；不可一次性全量替换。
- **间距值命名会与既有序号命名冲突**，需一次性重映射 385 处引用（脚本化，但仍需视觉验证）。
- **方案 B（间距压到 9 档）会改变布局**，必须单独排期并走完整基线验证，不在本方案第一阶段。
- 本方案**只做设计与新增**，不含迁移执行；执行前需逐阶段确认。
