# 代码质量待办清单（src TypeScript）

> 范围：`src/**/*.ts` + 入口 `main.ts`
> 方法：静态分析（grep + 引用追踪），未修改任何文件。
> 已排除误报：Obsidian 生命周期必需项（onload/onunload/display/getViewType）、对外公开给 webapp 的 postMessage 协议类型（messages.ts）、插件宿主直接调用的入口。
>
> **执行状态（2026-07-09）**：✅ 已完成的低风险投资——`ThemeBridge.isDarkMode()` 收敛为 `private`（2.0.4）；3 处 `console.log` 降级为 `console.debug`（2.0.4）。⏸ 重复代码抽取（路径防护/音频校验/MIME 列表等 6 处）经评估**暂不改**（需改动公开逻辑、收益待评估），本清单不再作为待办。

---

## 一、死代码 / 未使用导出

**未发现孤立文件**（每个 .ts 至少被 main.ts 或兄弟模块 import 一次）。

| 文件:行号 | 项目 | 说明 / 建议 |
|-----------|------|-------------|
| `src/bridge/ThemeBridge.ts:39` | `isDarkMode()` public 方法 | 仅类内部 `pushTheme()` 使用，无外部调用方。建议改为 `private`。 |
| `src/bridge/ThemeBridge.ts:58` | `onThemeChanged()` | 仅无条件转发到 `pushTheme()`（DailyReviewView:174 调用），是别名包装。建议内联合并到 `pushTheme()`。 |
| `src/storage/VaultStorage.ts:11-13` | `themes/`、`reports/` 预留目录 | 注释标注为"预留"，但无对应读写实现（`exportAllData` 返回空数组）。属未完成功能，非死代码，仅提示。 |

---

## 二、重复 / 冗余代码

| 文件:行号 + 函数 | 重复内容 | 建议 |
|------------------|----------|------|
| `src/server/LocalServer.ts:92` 与 `:300` | 路径穿越防护 `path.normalize().replace(/^(\.\.[/\\])+/,'')`，两处实现且防护强度不一致（300 行额外检查 `startsWith('..')`/`'/'`） | 抽成统一 `sanitizeRelativePath()` |
| `src/server/LocalServer.ts:207` 与 `:295` | 音频扩展名校验：`.some/endsWith` vs `.includes/extname` 两种实现 | 统一为单一校验函数 |
| `src/views/DailyReviewView.ts:158`、`:221` + `src/settings/PluginSettings.ts:160` + `main.ts:186` | `(this.app.vault.adapter as any).basePath` 被 4 处 inline 获取并 `|| ''` | 抽成 VaultStorage / 工具方法 |
| `src/bridge/ThemeBridge.ts:58` 与 `:44` | `onThemeChanged()` ≡ `pushTheme()` 别名 | 内联合并（见一类） |
| `src/bridge/BridgeService.ts:271`、`:299` | `readVaultFile` 与 `readLocalFile` 各自重复"校验扩展名→校验存在"序列 | 合并为共享校验辅助 |
| `src/server/LocalServer.ts:141` 与 `src/constants/audio.ts:20` | 静态资源扩展名列表内联 vs `MIME_TYPES` 已定义 | 复用 `MIME_TYPES` 键集合，避免两处列表漂移 |

---

## 三、调试残留 / TODO

### 3.1 console.log（调试残留，建议降级或删除）

| 文件:行号 | 内容 | 建议 |
|-----------|------|------|
| `src/views/DailyReviewView.ts:254` | `[BambooReview] 发现 N 个自定义主题:` | 降级 `console.debug` 或删除 |
| `src/views/DailyReviewView.ts:257` | `扫描自定义主题时出错:` | 错误已有 `console.error`(249)，此 log 重复，删除 |
| `src/server/LocalServer.ts:46` | `Local server started on port ...` | 保留或降级 `console.info` |
| `src/server/LocalServer.ts:57` | `Local server stopped` | 同上 |
| `main.ts:157` | `Downloading webapp from release ...` | 下载流程调试日志，降级或删除 |

> 区分：`console.warn` / `console.error`（BridgeService:171、StorageBridge:30、VaultStorage:83/103/152、LocalServer:248/263/269/340、DailyReviewView:112/241/249、main.ts:166/201）属合理运行时警告/错误上报，**不列入待办**。

### 3.2 TODO / FIXME / XXX
**未发现**（0 条）。

### 3.3 @ts-ignore / @ts-nocheck / @ts-expect-error
**未发现**（0 条）。补充提示：存在多处 `as any` 断言（`main.ts:184/186`、`DailyReviewView.ts:158/221`、`PluginSettings.ts:159/160`）会掩盖类型问题，可后续类型完善，但不属本次硬性清单。

---

## 汇总

- **死代码**：1 处可私有化（`isDarkMode`）、1 处可内联（`onThemeChanged`）、若干预留目录占位。
- **重复/冗余**：6 处，集中在路径防护、音频校验、库根路径获取、ThemeBridge 别名、MIME 列表漂移。
- **调试残留**：5 处 `console.log`；TODO/FIXME/XXX 与 @ts-ignore 类注释均为 0。
- **整体评价**：代码质量良好，无孤立死文件、无明显技术债堆积；上述均为可顺手清理的"小美化"项，零行为风险。
