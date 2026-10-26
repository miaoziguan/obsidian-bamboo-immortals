# A 级死代码删除计划（PR 级清单）

> 本文件描述**删除什么 / 证据 / 影响面 / 协议第 1-6 步执行计划**。
> **不在此处执行删除**——删除由独立的、可回退的 PR 完成，每条删后跑全部门禁。
> 所有「0 消费者」结论均经六形态枚举（import / 裸全局 / window / 字符串键 / CSS / 测试）复核，
> 并已排除非单词名 `\b` 失效（`$`/`$$` 曾被误判，此处不涉及）、根入口漏扫（已含 `main.ts`）等扫描陷阱。

## 通用删除协议（每条遵循）

1. `git commit` 打 checkpoint（删前干净点，便于回退）；
2. 删除**一条或一个极小逻辑单元**（见下，每个 PR 只动一个单元）；
3. 跑全部门禁：`npm run preflight && npm run test && npm run test:host`；
4. **解包产物**核验符号不再出现（`node scripts/check-html-escape.mjs --report` 解包 `webapp/app.html` 等，注意中文转 `\uXXXX`、标识符被 minify 改名，故以「源码 grep 0 命中 + 产物无字符串残留」双重确认）；
5. 真机打开相关入口（scroll-src / archive-src / module-src / index）走一遍功能；
6. 记录「删了什么 / 证据 / 影响面」到本文件对应条目，并 `node scripts/check-dead-exports.mjs --update` 更新快照（移除已删条目）。

---

## 单元 A1：`appendToRoot`（webapp 侧，单函数）　✅ 已删除（commit 9e...，见下）

| 项 | 内容 |
|---|---|
| 位置 | `webapp/assets/scripts/utils/domRef.js:64-66` |
| 删除对象 | 整个 `export function appendToRoot(node) { return getRootMount().appendChild(node); }` |
| 类别 | D（导出无消费者）→ A 级 |
| 证据 | 全仓（含 `main.ts`、4 个 html、`tests/**`）零字面出现；domRef 内部仅定义行 1 次出现；无 import / 裸名 / `window` / 字符串键 / 测试引用 |
| 影响面 | 仅依赖 `getRootMount()`（存活，未受影响）。无任何调用方，移除不影响运行 |
| 风险 | **低**。非对外 API（`$`/`$$`/`getShadowRoot` 等已确认被 import 消费，但本函数无） |

### A1 执行计划（逐条）
- checkpoint：`git commit -m "chore(dead-code): checkpoint before removing appendToRoot"`
- 删除 domRef.js 第 64-66 行（含上方注释可一并清理）；
- `npm run preflight && npm run test && npm run test:host`；
- 解包 `webapp/app.html` + `module.html`，确认无 `appendToRoot` 残留（注意 minify 改名，重点看解包文本）；
- 真机：打开任一入口，确认浮层/提示挂载正常（功能等价，因本函数本就未被调用）；
- 更新快照：`node scripts/check-dead-exports.mjs --update`（从清单移除 `appendToRoot`）；
- 提 PR，标题 `refactor(dead-code): remove unused appendToRoot`。

---

## 单元 A2：`fallbackQuestion` + 私有 `DISEASE_QUESTION`（host 侧，同一逻辑单元）　✅ 已删除（同 commit）

| 项 | 内容 |
|---|---|
| 位置 | `src/ai/GoalElicitor.ts:44-51`（DISEASE_QUESTION 定义）、`:335-338`（fallbackQuestion 定义） |
| 删除对象 | 1) `const DISEASE_QUESTION: Record<DiseaseType, string> = {...}`（L44-51）；<br>2) `export function fallbackQuestion(disease: DiseaseType): string { return DISEASE_QUESTION[disease]; }`（L335-338） |
| 类别 | D（fallbackQuestion 零引用）→ C 传递死（DISEASE_QUESTION 仅被 fallbackQuestion 引用）合并为同一单元 |
| 证据 | `fallbackQuestion` 生产+测试双零引用；`DISEASE_QUESTION` 全仓唯一消费点在 L337（即 fallbackQuestion 内部）；`DiseaseType` 为类型（不影响） |
| 影响面 | 仅这二者的相互引用。确认 AI 引导流程（`buildStrategyBrief` 等）不再调用 `fallbackQuestion` 兜底（审计中六形态已确认无引用）；删除后 `DiseaseType` 仍被其它代码使用，不受影响 |
| 风险 | **低**，但需确认语义：这是旧「病灶苏格拉底追问」设计的遗留。删前 grep 一次 `fallbackQuestion|DISEASE_QUESTION` 全仓 + 确认无 AI 引导兜底逻辑依赖 |

### A2 执行计划（逐条）
- checkpoint：`git commit -m "chore(dead-code): checkpoint before removing fallbackQuestion chain"`
- 删除 L44-51（`DISEASE_QUESTION`）与 L335-338（`fallbackQuestion`）；注意保留其周围的其它导出/函数边界（L52、L339 起不删）；
- 若 `DiseaseType` 仅在已删代码中使用 → 另行评估（当前已知 `DiseaseType` 仍被 `buildStrategyBrief` 等使用，**不删**）；
- `npm run preflight && npm run test && npm run test:host`；
- 解包产物 + 源码 grep 双重确认 `fallbackQuestion`/`DISEASE_QUESTION` 0 出现；
- 真机：打开复盘/AI 引导入口，走一遍「未填结构化字段」的追问流程，确认无报错（本函数本就未被调用，行为等价）；
- 更新快照：`node scripts/check-dead-exports.mjs --update`（从清单移除 `fallbackQuestion`）；
- 提 PR，标题 `refactor(dead-code): remove dead fallbackQuestion + DISEASE_QUESTION`。

---

## 不建议本次删除（B/C 级，仅记录）

- **F 类死 CSS（616 类）**：B 级，外部主题/模块可能按类名消费 → 见 `docs/dead-css-candidates.md` 逐簇人工裁决，不批量删。
- **65 个「冗余 export」**：代码活着，仅 `export` 关键字多余 → 可选去 export（非紧急），由 `check-dead-exports` 快照跟踪。
- **2 个「仅测试引用」导出**（`normalizeUserIdentity`、`CONSTANTS`）：保留（测试/契约用途）。
