# 官方审核规则对照（Obsidian 社区插件）

> 用途：送审 / 更新插件 listing 前自查，对照官方自动审核（Source review）规则确认本仓库合规状态。
> 维护：每次发版后更新「合规状态」表与版本号。

---

## 0. 信息来源与可信度

| 来源 | 状态 | 说明 |
|---|---|---|
| 官方文档《Submit your plugin》（docs.obsidian.md） | ✅ 已抓到原文 | 提交流程、版本/Tag 一致性、自动审核阻塞安装等规则——**逐字引用** |
| 审核机器人 `obsidianmd/obsidian-reviews` README | ⚠️ 本环境网络拦截 | `raw.githubusercontent` / `api.github.com` / `jsDelivr` 均不可达，**未能抓到逐字清单** |
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
| **`dependency installation failed`（Error，阻塞项）** | 阻塞自动审核 | ⚠️ 环境性，见 §4 | 仓库侧已加固 |

版本与 Tag：当前 `3.24.12`，Tag `3.24.12`（无 `v`），`manifest.json`/`package.json`/`versions.json` 一致 ✅。

---

## 4. 「依赖安装失败」根因与仓库侧加固

**根因（环境性，非仓库缺陷）**：机器人沙箱大概率无法访问 npm registry（无网络/无缓存），或用了旧 Node + `engine-strict`（`@typescript-eslint@7.18` 要求 node ≥18.18）。证据：
- 本仓库 `release.yml` CI 每次用 **Node 20 跑 `npm ci` 成功** → 仓库可正常安装；
- `package-lock.json` 已与 `package.json`(3.24.12) 同步、`lockfileVersion: 2`、无 git/link/私有依赖；
- 仓库无自定义 `.npmrc`（本机 `~/.npmrc` 指向 npmmirror 只影响本地，不影响云端机器人）。

**已做的仓库侧加固（已推 `main`）**：
- `package-lock.json` 根版本同步到 `3.24.12`（消除 lockfile 失配）；
- `prepare` 脚本改为 `husky || true`（非 git 检出里安装不因 husky 失败）；
- `.nvmrc` → `20`（若机器人读取，避开 EBADENGINE / engine-strict）。

> 注意：机器人很可能当初审的是**更早的提交**（那时 lockfile 根版本停在 `3.17.3`）。重审 `3.24.12` 即拿到同步后的 lockfile 与全部修复。

---

## 5. 下次送审 / 更新清单

- [ ] `manifest.json` 版本号 = `package.json` = 本次发版号（格式 `x.y.z`）。
- [ ] 打 GitHub Release Tag（**无 `v` 前缀**），与版本号一致。
- [ ] 确认 `fetch`/`!important` 零出现（见 §3）。
- [ ] 在**社区插件目录送审后台**更新插件版本（指向本次发版号），触发 `obsidian-reviews` 机器人用修好的代码重跑审核；后台「Source review」结果刷新即为重审输出。
- [ ] 若重跑仍报 `dependency installation failed`：属机器人基础设施瞬时/网络故障，在 `obsidianmd/obsidian-reviews` 对该 submission 触发 **re-run / retry**；可参考其 issues 是否为共性故障。仓库侧已无可改。
- [ ] 本地验证：`npm ci`（Node 20）可过 → 仓库健康。

---

*本文件由 AI 助理依据官方文档与送审反馈整理；代码级条目因官方审核仓库 README 在本环境不可达，未能逐字引用，请以 `obsidianmd/obsidian-reviews` 最新 README 为准。*
