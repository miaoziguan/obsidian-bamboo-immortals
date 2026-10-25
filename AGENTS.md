<!--
  本文件是本仓库的 agent 工作守则（2026-10-26 由一轮完整复盘与实施后的实证结论固化而来）。
  用法：把它作为任何「深入」类任务的前缀约束。
  变更：若后续实操中又发现新的失败模式，请直接在此追加，并在下方「实证来源」区补记事件。
-->

# 任务：在 obsidian-bamboo-review 上做「深入」的工作

## 0. 范围纪律
「更深入」≠「规模更大」。禁止为了覆盖面而扩大改动；**"不做"是合法交付**，
但必须附证据（数据/测量/实测）说明为何不做。每项工作开始前先判断：
它属于「方法失控」（值得拆/改）还是「职责广度」（拆了只是搬家）？

## 1. 先证伪前提（动手前必须完成）
- backlog / 文档 / 注释里的结论**一律视为待验证假设**，不是事实。历史已证伪两例：
  · "PluginSettings ⇄ legacySettings 依赖环" → 其中一边是 `import type`，运行期无环；
  · "三个巨型文件都该拆" → 两个文件最大方法仅 139 行（占 6%），无巨型方法。
- 明确写出：这条结论的**证据是什么**、**我如何独立复核**、**复核结果**。

## 2. 先验证测量工具，再相信测量结果
- 任何静态扫描（正则/脚本）先用**已知样本**自检；解析数组用括号配对，禁 `indexOf('];')`
  （`] as const;` 会被吞掉，导致闸门假绿——已发生）。
- 统计方法体量时不写死缩进（仓库同时存在 2 空格与 4 空格文件）。
- 区分 `import type` 与值导入（前者编译期擦除，不构成运行时依赖边）。
- 扫描范围要覆盖**全部入口**（`webapp/assets/scripts/**` + `webapp/index.html`），
  只扫一部分会产出假阳性（已发生，10 条）。
- **报告数字时必须同时给出取数方式**，否则该数字不可信。

## 3. 只用一手材料
可用：源码当前状态（不信记忆里的行号）、`git ls-tree` 查文件占用、`src/host/protocol.ts`
↔ `webapp/.../protocol.js` 协议源、`loadModule` 加载器语义、构建/测试配置实况、
**解包后的真实产物**（`app.html` 的 `__bamboo_gz`；`main.js` 中 esbuild 把中文转成大写 `\uXXXX`）、
真实 Obsidian + 真实 vault。
禁用：AI 记忆/总结、`docs/ARCHITECTURE.md`、历史审计报告、**以及 backlog 条目本身**。

## 4. 必须遵守的项目特有约束（踩过的坑，勿重蹈）
- **新建文件前**：`git ls-tree -r HEAD | grep <文件名>` 确认未被占用（曾覆盖既有模块，靠 checkpoint 挽回）。
- **`loadModule` 会剥离 import/export**：给既有模块新增 import 时，需在被引入模块里发布
  `globalThis.<name>`，否则所有 `loadModule` 它的测试立刻失败。
- **`jest --coverage` 恒 0/0**（`transform:{}`）：真实覆盖率只有 `COVERAGE_EVAL=1` 路径。
- **静默失效的五类高发点**：协议镜像不同步 / 路由键重复（spread 覆盖）/ 入站前缀不在白名单 /
  未匹配消息 `respond(undefined)` / 忘记发布 window 全局。改动涉及这些区域时，同时补闸门。
- **构建产物 ≠ 源码**：改完必须 rebuild + `sync.sh`，并**在产物里核验**（注意转义形态）。

## 5. 方法与工具（实际使用，不能只提）
- 风险步骤前 `git commit` 一个 checkpoint（覆盖事故只靠它挽回）。
- 重构：**先写特征测试** → 脚本逐字搬运 → **同一批用例前后都必须绿**；不许边写边改。
- 证伪：注入缺陷 → 断言闸门/用例**确实失败** → 还原；**并验证注入真的落地**
  （曾两次注入静默失效而误判"检查没拦"）。
- 覆盖率门禁用**绝对已覆盖语句数**棘轮，不用百分比。
- 性能结论必须来自 `BambooPerf.report()` 的 p50/p95，不接受"感觉更快"。

### 5.1 审核闭环（已自动化，2026-10-26 起）

提交审核前**只需一条命令**：

```bash
npm run preflight   # lint(含无用 disable 检查) → tsc → 4 道闸门
```

| 闸门 | 覆盖 | 单跑命令 |
|---|---|---|
| load-matrix | 各入口 `<link>` 与矩阵一致；JS 类名 ↔ CSS 无漂移 | `npm run check:load-matrix` |
| message-contract | 协议镜像同步 / 路由键唯一 / 入站前缀合规 | `npm run check:message-contract` |
| window-globals | window 挂载点清单与源码一致 | `npm run check:window-globals` |
| review-rules | 禁屏蔽 `no-console` / disable 带描述 / 注释无散文式指令 / 无硬编码 `.obsidian` | `npm run check:review-rules` |
| coverage-baseline | 绝对已覆盖语句数不下降 | `npm run test:coverage` |

**闭环规则**：官方每退回一条 → **立刻**在 `check-review-rules.mjs` 加一条对应检查（或补一条 eslint 规则），
并当场演示"违规即失败"。**不允许"下次记得注意"** —— 靠记性等于没修。

**已本地化的官方规则**（`no-unnecessary-type-assertion` 已启用为 error；`no-console` 禁止屏蔽已闸门化；
`undescribed-directive` / `no-hardcoded-config-dir` 已闸门化；裸 `setTimeout` 由 eslint `no-restricted-globals` 覆盖）。

## 6. 交付要求
- 每个结论附：主张 / 证据 / **如何证伪它**（三行缺一不可）。
- 显著区分「已实证」与「推断」；推断必须标注，并给出验证它所需的最小实验。
- 新增或修改的闸门/测试，必须现场演示一次"违规即失败"。
- 改动清单里注明：哪些**没有改**以及原因。

## 7. 不做
- 不做无证据的重构；不为了行数好看而搬运代码。
- 不在缺少特征测试网时动核心交互（`_spawn` / `_beginMoveDrag` / `bindViewEvents` 等）。
- 不伪造证伪（注入未落地就当成功）。

---

## 附：本章守则的实证来源（2026-10-26 那一轮）

按守则第 6 条，这里登记这份文档自身的主张 / 证据 / 证伪方式，以及催生每条规则的**真实事故**。

| 规则 | 催生它的事故 | 证据 |
|---|---|---|
| §2 禁 `indexOf('];')` | `check-message-contract.mjs` 首版用它找数组结束，`] as const;` 导致把后面的 `ALL_MESSAGE_TYPES` 整个吞进前缀白名单 → 闸门"通过"但实际失效 | 输出里异常冗长的前缀列表 |
| §2 不写死缩进 | 用 4 空格正则测 `typewriterFeature.js`（实为 2 空格）→ 得出"1380 行在模块作用域"的错误结论 | 重写测绘脚本后 109 个方法 / 1588 行 |
| §2 区分 `import type` | 环检测把 `legacySettings → PluginSettings` 的 `import type` 当运行期边 → 误报 P1-4 依赖环 | 复核发现该边编译期擦除 |
| §2 覆盖全部入口 | 契约扫描只扫 `assets/scripts`，漏掉 `index.html` 内联发送 → 10 条"死消息"假阳性 | 补扫入口后归零 |
| §4 建文件前查占用 | 新建 `modules/goals/inlineEditService.js` 覆盖了既有同名模块（27 个测试覆盖） | 全量测试 27 例失败 → `git checkout` 还原 |
| §5 证伪需验证注入落地 | 两次注入失效（shell 反引号被替换；`replace(...,1)` 命中手写区）却误以为"检查能拦" | 输出为空才起疑，改为 assert 注入位置 |
| §5 覆盖率用绝对数 | 补测 `displayManager.js` 后语句覆盖率 47.27% → 45.49%（分母涨得更快），百分比门禁反而惩罚补测 | 改为绝对已覆盖语句棘轮（8524 → 8705） |
| §1 证伪前提 | P1-4 与 P2-6 两条 backlog 结论均被证伪 | 见上两行 |
| §5.1 审核闭环 | 3.32.0 被 Obsidian 官方退回 1 Error（屏蔽 no-console）+ 1 Warning（多余断言），本地 lint 全绿却毫无察觉 | 已本地化为 `review-rules` 闸门 + 启用 `no-unnecessary-type-assertion`；3.32.1 过审 |
| §5 禁散文式指令 | 我在 AppAPI 注释里写了「eslint-disable no-console」字面量，等同给扫描器递刀 | 已改写为自然语言，并加闸门（散文式提及即失败） |
| §5 lint 无死指令 | 6 条 disable 已不再抑制任何问题（规则早就不报了），纯噪音+审核面 | `--report-unused-disable-directives` 进 lint，清理 6 条 |

**当前基线（2026-10-26）**：webapp 121 套件 / 1073 用例；宿主 57 文件 / 636 用例；
覆盖率基线 8705 绝对语句；CI 四道闸门（load-matrix / message-contract / window-globals / coverage）。
