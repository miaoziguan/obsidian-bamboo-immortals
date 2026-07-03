# obsidian-bamboo-review 项目复盘

> 2026-06-18，虎子

---

## 一、项目概览

| 维度 | 数据 |
|---|---|
| 项目名 | **竹林复盘** |
| 定位 | Obsidian 每日复盘插件 |
| 技术栈 | TS + esbuild (Obsidian) + Vanilla JS (webapp) |
| webapp 规模 | 69 个 JS 文件，~19,500 行业务代码 |
| 测试 | 11 套件，141 测试，0 失败 |
| index.html | 72 个 `<script>` 标签，93 个 `<link>` + CSS 类 |
| 构建 | `sync.sh` 一键编译+部署，自动统一版本号 |

---

## 二、文件规模 Top 10

| 文件 | 行数 | 评级 |
|---|---|---|
| goals/renderer.js | 2202 | 🟢 已拆（原 3233，-31.9%） |
| goals/healthScore.js | 928 | 🟡 偏重但内聚 |
| handlers/statsModal.js | 788 | 🟢 已拆（原 986） |
| utils/whiteNoiseManager.js | 763 | 🟡 白噪音引擎，内聚 |
| state/store.js | 763 | 🟢 已拆（原 1101） |
| renderers/renderers.js | 749 | 🟡 渲染入口，薄壳 |
| handlers/shopManager.js | 707 | 🟡 商店逻辑，内聚 |
| storage/storageManager.js | 666 | 🟢 存储适配器 |
| handlers/displayManager.js | 643 | 🟡 显示设置 |
| handlers/settingsModal.js | 598 | 🟡 设置面板 |

> 最大文件从 3233 → 2202，没有 1000+ 的文件。

---

## 三、重构成果

### 四个核心文件

| 文件 | 原行数 | 现行数 | 减少 |
|---|---|---|---|
| renderer.js | 3233 | 2202 | -1031 |
| store.js | 1101 | 763 | -338 |
| statsModal.js | 986 | 788 | -198 |
| handlers.js | 835 | 541 | -294 |
| **合计** | **6155** | **4294** | **-1861** |

### 新模块（12 个）

| 模块 | 行数 | 来源 |
|---|---|---|
| dateRangePicker.js | 545 | renderer |
| goalCalculations.js | 140 | renderer |
| popupPositioner.js | 161 | renderer |
| priorityPicker.js | 67 | renderer |
| categoryPicker.js | 70 | renderer |
| categoryManager.js | 166 | renderer |
| dataValidator.js | 181 | store |
| defaultData.js | 126 | store |
| searchService.js | 103 | store |
| goalStatsCalculator.js | 129 | statsModal |
| cultivationData.js | 97 | statsModal |
| quickStartGuide.js | 77 | handlers |

### 死代码清理

| 项目 | 内容 |
|---|---|
| featureTooltips（~119 行 + 包装方法） | 引导气泡从未激活 |
| constants.js | 39→13 行，5/6 常量无人引用 |
| 3 个过期 bug 审计报告 | 行号全部基于重构前代码 |

### 基础设施改进

| 项目 | 改前 | 改后 |
|---|---|---|
| index.html 版本号 | 23 种 `?v=N` 手动维护 | sync.sh 自动统一时间戳 |
| htmlUtils.js | 2 个方法 | 7 个方法（补全） |
| 测试失败 | 2 套件 baseline fail | **0 fail** |

---

## 四、架构评价

**好的：**
- renderer.js 从 3233 单一巨石拆成 6 个模块 + 2202 行主体，-31.9%
- 12 个拆分全是零回归提取（纯函数优先，回调解耦次之）
- 测试从 7→11 套件，3 fail→0 fail
- 构建自动化（sync.sh 一键编译+部署+版本号）

**不改的：**
- renderer.js 的 archive（644L）和 inlineEdit（450L）——天然内聚代码簇
- window 全局通信——架构选择，不是 bug
- ESM / 框架引入——Obsidian 插件生态不需要

---

## 五、建议

1. `git init` 保底
2. 顺手跑 `sync.sh` 保持部署同步
3. 加新功能时沿用"纯计算优先提取"的模式
