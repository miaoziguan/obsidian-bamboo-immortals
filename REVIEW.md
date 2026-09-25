# 官方审核规则对照（Obsidian 社区插件）

> 用途：送审 / 更新插件 listing 前自查，对照官方自动审核（Source review）规则确认本仓库合规状态。
> 维护：每次发版后更新「合规状态」表与版本号。

---

## 0. 信息来源与可信度

| 来源 | 状态 | 说明 |
|---|---|---|
| 官方文档《Submit your plugin》（docs.obsidian.md） | ✅ 已抓到原文 | 提交流程、版本/Tag 一致性、自动审核阻塞安装等规则——**逐字引用** |
| 审核机器人机制（克隆→`npm ci`→ESLint/`tsc`/`build`） | ✅ 实测确认 | 经 3.24.17 发布实测通过：扫描器在 GitHub 沙箱 `npm ci` 装依赖、跑 `npm run build`/`npx tsc --noEmit`/ESLint 全量，**只能到 `registry.npmjs.org`**（故 lockfile 的 `resolved` 必须指向 npmjs，见 §4） |
| 官方文档别名页 `Developer policies` / `Submission requirements` | ⚠️ 已迁移 404 | 提交页的 `[[wikilink]]` 指向的 slug 在当前文档站已不存在 |
| 机器人实际报出的检查项 | ✅ 来自送审反馈 | `fetch`(×2)、`!important`(×3)、`dependency installation failed` 均为机器人原文输出 |

**结论**：下方「代码级规则」以 *机器人实际报出的检查 + 社区既定要求* 为依据；其中 `fetch`/`!important` 两条由送审反馈逐字确认。`manifest`/`Tag`/阻塞安装等规则来自官方文档原文。

---

## 1. 官方提交规则（docs.obsidian.md《Submit your plugin》原文要点）

> **Step 2: Create a release**
> 1. In `manifest.json`, update `version` to a new version that follows Semantic Versioning, e.g. `1.0.0`. Versions supported only in the format `x.y.z`.
> 2. Create a GitHub release. The "Tag version" of the release **must match the version in your `manifest.json`**.

> **Step 3: Submit your plugin to the community directory**
> The directory processes the `manifest.json` at the HEAD of your repository's default branch … When a user installs your plugin, Obsidian downloads `main.js`, `manifest.json`, and `styles.css` from the GitHub release whose tag matches the `version` in your manifest.

> **Step 4: Address review feedback**
> After you submit, your plugin is reviewed automatically and the directory shows guidance for anything that needs to be corrected … your plugin won't be installable from within Obsidian until any errors from the automated review are resolved.

提炼为本仓库须遵守的硬规则：
1. `manifest.json` 版本号必须为 `x.y.z`，且与 `package.json` 一致（CI 校验）。
2. **GitHub Release Tag 必须与 `manifest.json` 版本号完全一致**，且**不带 `v` 前缀**（本仓库 CI 触发模式为 `[0-9]*.*.*`）。
3. 默认分支 HEAD 的 `manifest.json` 必须准确。
4. 自动审核有未解决错误前，插件在 Obsidian 内不可安装。

---

## 2. 审核机器人工作流（`obsidianmd/obsidian-reviews`）

机器人对提交/PR 执行（**审核结果展示在 Obsidian 社区插件目录的送审后台「后台审核」**）：
1. 克隆仓库 → 跑 `npm ci` 安装依赖；
2. **安装失败 → 报 `Source review dependency installation failed. Checks which require resolved dependencies were skipped.` 并跳过所有「需要依赖」的检查（ESLint 全量）**；
3. 跑 ESLint（其配置）抓 `fetch` / `XMLHttpRequest` / `eval` / `console` / CSS `!important` 等。

> 推论：静态检查（`fetch`/`!important`，靠 grep/AST，**无需依赖**）在依赖安装失败后仍会报；
> 而 ESLint 全量阶段（含 `no-console` 等）被一并跳过——所以依赖安装失败时会「看不到」console 类告警。

---

## 3. 本仓库合规状态

| 检查项 | 机器人是否查 | 本仓库状态 | 处置 |
|---|---|---|---|
| `fetch` / `XMLHttpRequest` → 须用内置 `requestUrl`（`src/host/AppAPI.ts:762,785`） | 静态检查已报 | ✅ 已改用 `requestUrl` | 已修复 |
| CSS `!important`（`bamboo-garden.css:785,794`、`notes.css:1685`） | 静态检查已报 | ✅ 已移除（靠源顺序/选择器特异性胜出） | 已修复 |
| `console.log` 等调试日志（4 处，来自本仓库自身 eslint） | ESLint 全量阶段（被跳过，机器人未报） | ✅ 已清理 | 已修复（预防性） |
| **`dependency installation failed`（Error，阻塞项）** | 阻塞自动审核 | ✅ 已定位真因并修复（lockfile 的 `resolved` 指向 npmmirror，扫描器不可达）见 §4 | 已修复（3.24.15） |
| **Build verification 失败（`npm run build` 干净环境跑不通）** | 阻塞自动审核 | ✅ 撤销 3.24.14 的 `dev/` 工具链隔离（扫描器只 `npm ci` 装根依赖，根 build 去 `dev/` 找 `esbuild` 失败），回归标准 npm 布局见 §4.1 | 已修复（3.24.16） |
| **`no-unsafe-*` 类型告警**（`smtpSender.ts`/`VaultStorage.ts`/`AppAPI.ts`） | ESLint 全量阶段 | ✅ `Buffer`(@types/node)→`Uint8Array`/`TextEncoder`/`btoa`；`JSON.parse`/`resp.json` 加显式 `as` 断言见 §4.1 | 已修复（3.24.16） |
| **CI Type check 失败（`obsidian.d.ts` `Menu`/`Modal` 未实现 `HistoryHandler`）** | `npx tsc --noEmit` 步骤 | ✅ `tsconfig.json` 加 `skipLibCheck: true`（与本地 build 对齐）见 §4.1 | 已修复（3.24.17） |

**审核结果：PASSED（Health: Excellent）** —— 3.24.17 发布后扫描器全绿。

版本与 Tag：当前 `3.24.17`，Tag `3.24.17`（无 `v`），`manifest.json`/`package.json`/`versions.json` 一致 ✅。

---

## 4. 「依赖安装失败」根因（已定位并修复：lockfile 的 `resolved` 指向 npmmirror）

**真因（repo 侧，非环境性）**：`package-lock.json` 里每个包的 `resolved` URL 指向 `registry.npmmirror.com`
（中国镜像）。`npm ci` **严格按 lockfile 的 `resolved` 拉包**；而审核扫描器沙箱在 GitHub 基础设施、
只能访问 `registry.npmjs.org`（其他插件能过即证），**到不了 npmmirror** → 每个包拉取失败 →
报 `Source review dependency installation failed … checks skipped`。

为什么本地一直过、扫描器一直挂：
- 本机 `~/.npmrc` 指向 npmmirror，本地 `npm ci` 能拉到 → 一直 PASS（误以为仓库健康）；
- 扫描器沙箱无 npmmirror 出口 → 全 FAIL。

实证（修复前，3.24.14）：
- 根 `package-lock.json`：**30 个 `resolved` 为 npmmirror，0 个 npmjs**（3.24.14 曾短暂隔离进 `dev/` 另有 1094 处）。
- 本地 `npm ci --registry=https://registry.npmjs.org/` 在干净克隆能过（本机也能到 npmjs），但 lockfile 里
  仍是 npmmirror URL —— 扫描器用的是 lockfile URL，不是 `--registry` 参数，故仍失败。
- 砍到 11 个依赖（3.24.14）也没用：URL 还是 npmmirror，失败模式不变。这直接证伪了「装太多/超时」假说。

**已做的仓库侧修复（随 3.24.15 发布）**：
- 删除旧 lockfile，以 `--registry=https://registry.npmjs.org/` 重生**根 `package-lock.json`** →
  `resolved` 全部改为 npmjs.org（30 处 npmmirror 计数归零）；
- 新增仓库级 `.npmrc`：`registry=https://registry.npmjs.org/`，**钉死 registry**，防止本机 npmmirror
  配置在日后 `npm install` 时再次污染 lockfile（这是复发的唯一风险点）；
- **注意**：`.npmrc` 只设 `registry`，**不要加 `engine-strict`**（`obsidianmd/eslint-plugin#182`
  里 Grimoire 的坑：`engine-strict` + 版本错配会让扫描器 `EBADENGINE` 直接失败）；
- 验证：修复后本地 `npm ci`（根）exit 0，URL 全 npmjs。

> 注：`dev/` 工具链隔离实验在 3.24.16 已撤销——扫描器只 `npm ci` 装**根**依赖，故仓库必须保持单根 `package.json`+`package-lock.json` 标准布局（见 §4.1）。

> 参考 `obsidianmd/eslint-plugin#182`（扫描器依赖未解析时的误报机制）：其中 Grimoire 的坑是
> `.npmrc` 的 `engine-strict`，vault-audit-AI 的坑是 lockfile 失配——我们两者都不是，我们是
> **lockfile 的 registry URL 指向了扫描器不可达的镜像**。

---

## 4.1 其余三轮修复（3.24.16 / 3.24.17）—— 打通"装依赖 → 装工具链 → 构建 → 类型检查 → lint"全链路

3.24.15 把"依赖安装"这道阻塞项打通后，扫描器才会跑到后续检查，于是暴露出 3 个被 `checks skipped` 掩盖的问题。它们分属不同环节，必须同一份发版里对齐：

1. **Build verification 失败（`3.24.16`，阻塞项）**：上一轮"把工具链隔离进 `dev/`"反而破坏了扫描器预期的"标准 `npm ci` + `npm run build`"布局——扫描器只 `npm ci` 装**根**依赖，而根 `build` 脚本去 `dev/` 找 `esbuild` → `ERR_MODULE_NOT_FOUND`。**撤销 `dev/` 隔离**，把 `esbuild`/`eslint`/`jest`/`vitest` 等回归根 `devDependencies` + 根配置（与 3.24.13 CI 布局一致）。
2. **`no-unsafe-*` 告警（`3.24.16`）**：`smtpSender.ts` 用了 `@types/node` 的 `Buffer`（扫描器类型检查解析不到 `Buffer` → 整条链路变成 `any`/`error` 型）。改为 DOM 全局 `Uint8Array`/`TextEncoder`/`btoa`；`VaultStorage.ts` 的 `JSON.parse` 与 `AppAPI.ts` 的 `resp.json` 加显式 `as` 断言，消除 `any` 赋值/调用/访问告警。
3. **CI Type check 失败（`3.24.17`）**：`obsidian` 官方类型定义存在库内不一致（`Menu`/`Modal` 未实现 `HistoryHandler.onHistoryBack`），本地 `npm run build` 因带 `-skipLibCheck` 能过，但 `release.yml` 类型检查步是 `npx tsc --noEmit`（无该参数）把库错误暴露。在 `tsconfig.json` 加 `skipLibCheck: true`（Obsidian 插件标准做法），让 CI 与本地行为一致。

> 教训：**扫描器链路是"装依赖 → 装工具链 → 构建 → 类型检查 → lint"一条龙，任一处断都会卡住审核**。3.24.11~3.24.15 的多次尝试之所以"差一点"，是因为每次只修单点、没打通整条链路。

---

## 5. 下次送审 / 更新清单

- [x] `manifest.json` 版本号 = `package.json` = 本次发版号（格式 `x.y.z`）—— 3.24.17 一致 ✅。
- [x] 打 GitHub Release Tag（**无 `v` 前缀**），与版本号一致 —— `3.24.17` ✅。
- [x] `fetch`/`!important` 零出现（见 §3）—— 已清除 ✅。
- [x] 在**社区插件目录送审后台**更新插件版本（指向 `3.24.17`），触发 `obsidian-reviews` 机器人重跑审核 —— **Health: Excellent / Review: Passed** ✅。
- [ ] **lockfile 防复发（持续）**：日后在本仓库跑 `npm install` 前，确保 registry 为 npmjs（仓库级 `.npmrc` 已钉死 `registry=https://registry.npmjs.org/`；提交前 `git status` 看 `package-lock.json` 是否冒出 `registry.npmmirror.com`）。若 CI/扫描器再报「依赖安装失败」，先 `grep -c registry.npmmirror.com package-lock.json` 排查是否又被镜像污染。
- [x] 本地验证：`npm ci`（根）可过且 `resolved` 全为 npmjs → 仓库健康 ✅。

---

*本文件由 AI 助理依据官方文档、送审反馈与 3.24.17 实测通过整理。审核机器人 README 在本环境不可达，但机制已由 3.24.17 发布成功（Health: Excellent / Review: Passed）实证。*
