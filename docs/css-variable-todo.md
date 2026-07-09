# CSS 变量化待办清单（webapp）

> 范围：`webapp/assets/styles/*.css`
> 现状：插件本体 `styles.css` 已 100% 使用 Obsidian 原生变量，无需改动。本清单只针对 webapp 内部样式。
> `variables.css` 已是集中变量池（含 `--bamboo-*` HSL 动态变量 + 大量 `--*-rgb` 与具体色值变量如 `--leaf-green:#6B8E23`、`--gold:#D4AF37`、`--cinnabar:#C9483B`、`--sky-azure:#87CEEB` 等）。
> 各组件 CSS 仍大量直接写死十六进制 / rgb()，未走变量。
>
> 符号说明：
> - ✅ = `variables.css` 已有精确对应的语义变量，可直接替换
> - 🔶 = `variables.css` 有**相近但不等**的值，需近似或先在 variables.css 新增变量
> - ➕ = `variables.css` 无对应，需新增语义变量后再替换

---

## 一、可直接替换（variables.css 已有精确变量）

| 文件 | 写死颜色 | 次数 | 建议替换 | 备注 |
|------|----------|------|----------|------|
| goals-map.css | `#4285f4` | 多 | `rgb(var(--info-blue-rgb))` | `--info-blue-rgb:66,133,244` = #4285f4 ✅ |
| goals-stats.css | `#E74C3C` | 多 | `rgb(var(--danger-alt-rgb))` | `--danger-alt-rgb:231,76,60` = #E74C3C ✅ |
| goals-editor.css | `#e74c3c` | 多 | `rgb(var(--danger-alt-rgb))` | 同上 ✅ |
| section-manager.css | `#B48C64` | 多 | `rgb(var(--amber-brown-rgb))` | `--amber-brown-rgb:180,140,100` = #B48C64 ✅ |
| modal-settings.css | `#1a1a1a` | 多 | `var(--ink-dark)` | `--ink-dark:#1A1A1A` ✅ |
| toast.css | `#c82333` 等危险色 | 少 | `rgb(var(--danger-rgb))` / `--cinnabar` | 需核对（见下方 🔶） |

## 二、需新增变量或近似（variables.css 无精确对应）

| 文件 | 写死颜色 | 次数 | 现状 | 建议 |
|------|----------|------|------|------|
| bamboo-garden.css | `#6B8E23` 系竹绿 | 102 处（全局最多） | 已有 `--leaf-green:#6B8E23` ✅ | **刻意保留，不变量化**（部分装饰色为设计意图写死，勿改） |
| bamboo-garden.css | `rgba(255,234,167,...)` 暖光 | 3 | variables 无 | **刻意保留，不变量化** |
| timeline.css | 多类竹绿/金/红 | 83 | 部分有近似 `--bamboo-*` | 🔶 近似或按组件语义新增 |
| dark.css | 暗色背景/边框 | 65 | `--surface-deep-rgb`(=#141f14) 近似 `#1e2e1e` | 🔶 用 `--surface-deep-rgb` 近似或 ➕ 新增 `--surface-deep-custom` |
| goals-health.css | 成功/警告/危险 | 37 | `--health-success-rgb` 等部分有 | 🔶 核对 |
| goals-stats.css | 紫/红/绿 | 38 | `--purple-rgb:#9A5A9A` ✅ 对应 `#9A5A9A` | 紫色 ✅，其余 🔶 |
| modal-panels.css | `#ff4d4f` | 38 | 接近 `--danger-bright-rgb`(#EF4444) 但不等 | ➕ 新增或近似 |
| goals-map.css | `#BDC3C7` 灰 | 24 | 无直接对应 | ➕ 新增 `--gray-light` |
| display.css | 金/绿渐变 | 24 | `--gold` 部分有 | 🔶 |
| toast.css | `#c82333` | - | `--cinnabar:#C9483B` 近似但不等 | 🔶 近似或 ➕ |
| date-nav.css | `#C94859` | 3 | 接近 `--cinnabar:#C9483B` | 🔶 近似 `--cinnabar` |
| weather-quotes.css | `#d9534f` | 3 | 接近 `--bamboo-error:#dc3545` | 🔶 近似 |
| forms.css | `#e57368` | 3 | 接近 `--cinnabar` 更亮 | ➕ 新增浅红 |
| goals-widgets.css | `#ecedea` | 3 | 无 | ➕ 新增浅灰底 |
| modal-settings.css | `#d1d5db` 灰边框 | 5 | 无 | ➕ 新增 `--border-medium` |
| goals-editor.css | `#3eb370`/`#369e63` 竹绿 fallback | 多 | 旧色调，接近 `--bamboo-primary` | 🔶 近似或 ➕ |
| goals-editor.css | `#4ade80` success | 多 | 无 | ➕ 新增 `--success-bright` |
| 多个文件 | `#fff` / `#ffffff` 纯白 | 多 | variables 无纯白变量（玻璃高光是 rgba） | ➕ 新增 `--pure-white` 复用 |

---

## 三、执行建议（供决策）

1. **低风险的快速收益**：先替换"✅ 精确对应"的颜色（goals-map 的 #4285f4、goals-stats/editor 的 #E74C3C、section-manager 的 #B48C64、modal-settings 的 #1a1a1a、goals-stats 的 #9A5A9A）→ 这些零歧义，可直接批量替换。
2. ~~**中等收益**：把 `bamboo-garden.css`（102 处）里能对应 `--leaf-green` 的写死色替换掉~~ — **已决定：bamboo-garden 刻意保留，不变量化。**
3. **需先扩变量池**：🔶/➕ 类先在 `variables.css` 补语义变量（如 `--pure-white`、`--border-medium`、`--success-bright`、`--gray-light`），再回头替换，避免散落硬编码。
4. **验证**：webapp 改完需重新 `npm run build` 并打 webapp.zip 验证主题色相滑块 / 暗色模式覆盖正常。

> 注：以上为静态分析推断，实际每行替换需打开文件逐处核对上下文（如 rgba 的透明度、渐变端点的语义），避免误替换。
>
> **执行状态（2026-07-09）**：✅ 精确对应部分已在 **2.0.4** 全部完成（goals-map / section-manager / modal-settings / goals-stats 共 8 处）。🔶/➕ 近似与需新增变量部分、以及 bamboo-garden.css 的批量写死色，**经评估决定保留（部分装饰色为设计意图写死）**，本清单不再作为待办。
