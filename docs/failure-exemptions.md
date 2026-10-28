# 失败豁免登记（failure exemptions）

`npm run check:failure-visible` 的规则：`catch` 块内 `return null / [] / false / undefined`
时，必须满足其一，否则闸门变红：

1. 块内调用了失败标记（`_ioFailedPaths.add` / `markDocFailed` / `quarantineCorrupt` /
   `_showSaveFailed` / `respondError`）—— 失败已被记录，不会静默；
2. 在本表登记。

## 为什么要登记而不能只写注释

本仓已有一次教训：为了让闸门变绿而补的注释，理由可能是假的（「可安全返回空：不重要」）。
注释的审查成本趋近于零，等于没有约束。登记要求同时写清「理由」和「触发条件与后果」，
且改动时必须同步维护这张表——把敷衍的成本抬高到「要动第二个文件并解释」。

代价：函数改名或迁移文件时，这里要跟着改，否则闸门会红。这是刻意的。

## 现行豁免

| 文件 | 函数 | 理由 | 触发条件与后果 |
|---|---|---|---|
| `src/host/AppAPI.ts` | `isValidAudioUrl` | `new URL()` 解析失败 = 输入本身不合法，不是读取失败 | 用户传入非法地址 → 返回 false 表示「不是合法 URL」，没有数据会丢 |
| `src/host/AppHost.ts` | `_isAppHtmlHealthy` | 读不到产物就当「不健康」→ 触发重新下载 | 产物缺失/半截 → 多下一次文件；收益是不会把损坏产物当健康而让用户停在空白视图 |
| `src/host/AppHost.ts` | `fileExists` | 判断不了存在性时按「不存在」处理 → 触发重建 | `adapter.exists` 抛错（罕见）→ 多一次下载；不会把「判断不了」误当成「已存在」而跳过修复 |
| `src/storage/VaultStorage.ts` | `parseTemplateFrontMatter` | frontmatter 语法损坏视为「没有元数据」，模板正文仍在原文件里 | 用户手改模板 frontmatter 出错 → 该模板少了元数据；不触发任何回写，正文不受影响 |
| `src/license/obfuscate.ts` | `isBeingDebugged` | 探测本身失败按「未调试」处理（fail-open） | devtools 探测抛错（沙盒/受限环境）→ 少一层检测；宁可漏检也不误伤正版用户导致无法激活 |
| `src/license/obfuscate.ts` | `isFunctionTampered` | 取不到函数源码按「未篡改」处理（fail-open） | `fn.toString()` 抛错 → 少一层校验；同上，避免把探测异常误判成用户篡改 |
| `src/views/DailyReviewView.ts` | `onOpen` | 折叠右栏失败不影响布局切换 | `rightSplit.collapse()` 抛错 → 右栏没折叠，仅少一次布局副作用，无数据影响 |
| `src/settings/legacySettings.ts` | `normalizeLegacySettings` | **接受风险**：读 settings.json 失败时跳过迁移 | 读失败（权限/占用/损坏）与「新装无此文件」被合并处理 → 旧设置不迁移，用户看到默认值。**为什么不修**：唯一替代是抛错，但该函数在插件启动路径上，抛错会让整个插件加载失败——比「不迁移」严重得多。真正的修法要在启动流程里加容错分支，属于另一类改动 |

## 新增豁免的门槛

提交前请自问三条，任一答不上就不要登记，而应该改成「标记失败」：

1. 这个 `catch` 捕获的失败，**是否可能与「本来就没有数据」混淆**？会，就不能豁免。
2. 返回空值之后，**有没有任何路径会把空值回写成真实文件**？有，就不能豁免。
3. 这个失败**用户是否需要知道**？需要，就不能豁免（应走 Notice / 错误响应）。

三条都答「不会 / 没有 / 不需要」，才能进表。
