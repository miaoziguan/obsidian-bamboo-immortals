# 运行时覆盖率扫描（死代码的「执行证据」）

> 定位：**分析工具，不是门禁**。不进入 `preflight` / CI，不建基线锁，随时可跑。
> 脚本：`scripts/scan-runtime-coverage.mjs`
> 快照：2026-10-27（提交 `48c50fc` 之后）

## 1. 为什么需要它

现有的死代码门禁全部是**文本计数**——「代码里有没有人提到这个名字」：

| 门禁 | 量什么 |
|---|---|
| `check:dead-exports` | 导出符号的消费者数 |
| `check:dead-methods` | 方法名的非声明行命中数 |
| `check:dead-css` | 类名是否出现在 JS/HTML |
| `check:window-globals` / `check:message-contract` | 全局名 / bridge 消息名双向核对 |

文本计数有两个天然盲区：

1. **可达性**——「有人提到」≠「能走到」。handler 注册了，但模板永远不产生那个按钮；方法被调用一次，但调用点本身不可达。
2. **动态派发**——`this[action]()`、`data-action` 字符串、CustomEvent 名。本项目靠「字符串派发点都在源内」这一点侥幸让文本计数准确，但这是运气，不是保证。

覆盖率给的是**执行证据**：每个函数在真实流程里被调用几次。

## 2. 怎么做

- **CDP 精确覆盖率**：`Profiler.startPreciseCoverage({callCount:true, detailed:true})` → 遍历 → `takePreciseCoverage`。拿到每个函数的 `functionName` 与每条 range 的调用次数。
- **加载源页面，不加载构建产物**：`app.html` 把全部 JS 内联成一个 bundle（url 为空、无 sourcemap），覆盖率无法映射回源文件；`*-src.html` 逐模块加载，url 即文件路径。代价是 `file://` 下 ESM 被 CORS 拦死，所以脚本自带一个静态服务器（随机端口）。
- **四类 flow**：
  1. **派发全部 action**（77 个）——直接覆盖 `data-action` 字符串派发空间；
  2. **真实点击页面上出现的 `[data-action]`**（3 轮广度，面板展开后新出现的按钮也点到）；
  3. **画中卷三档领域 flow**——scroll 页默认挂「香道」，打字机必须显式 `_mountTypewriter()`（生产由宿主 `scroll:feature` 注入）；随后用 `_input` + `_commitInput()` 造 5 条便签、切写作档写 3 段 MD、切导图档造 3 颗子弹、切回便签，并覆盖「恢复期挂起 → `_flushPendingPrint` 补打」这条分支；
  4. **鼠标交互 flow**——卡片拖拽、双击进入编辑并键入、画布框选、滚轮缩放、Delete 删除。
- **语料比对**：与 `check-dead-methods` 同口径（webapp JS + src TS + `main.ts` + 源视图 HTML，剔除 tests），对零执行函数算文本引用数。

## 3. 结果快照

```
命名函数 2164 个，执行过 1065 个（49.2%），零执行 1099 个
  A. 双重死（零执行 + 文本零引用）: 0
  B. 仅零执行（文本有引用）: 1099
```

- **A = 0**：当前代码库里不存在「运行时从没跑过 且 文本零引用」的方法。方法级清单已在 `48c50fc` 清零，覆盖率独立复核了这一点——**文本扫描没有漏网点**。
- **B = 1099**：其中大头是 `lucideUtils` 的图标 map 条目（惰性查表的属性值，不是方法，文本引用数恒为 1 = 自身定义），其余是需要特定数据/交互才走到的渲染与编辑分支。**B 不能据此删除**——它只说明「本次流程没走到」。
- **文件级**：没有任何一个函数数 ≥10 的模块处于 0% 覆盖（最低是 `CardInteractions` 17%、`mindmapFeature` 30%、`scrollManager` 23%），即不存在「整模块被装载但一次都没跑」的情况。

## 4. 事后验证：`48c50fc` 删掉的 57 个方法，运行时跑过吗

用 `git worktree` 检出删除前的提交（`48c50fc^`），跑同一套 flow：

| 指标 | 删除前版本 |
|---|---|
| 命名函数 / 执行过 | 2220 / 1063（47.9%） |
| A（零执行 + 零引用） | **53** |
| 删除清单（52 条快照 + 5 个级联/浮出） | 57 项 |
| 删除项中落在 A 集合内 | **53 项（全部）** |
| 删除项在覆盖率数据中的调用次数 | **57/57 全为 0** |

结论：**没有一个被删的方法是运行时真正执行过的**。删除决策拿到了运行时背书，而不是仅凭文本计数。

### 4.1 反过来：A 抓不到、人工抓到的 4 个

```
exit           layoutMode.js      ← 文本扫描漏收 src TS 语料导致的假阳性，修复 walk 后才浮出
toScreen       CanvasViewport.js  ← 级联孤儿（唯一调用者 canvasToScreen 被删后才死）
removeEvent    TimelineService.js ← 级联孤儿（唯一调用者 removeGoalTaskToTimeline）
getIconName    lucideUtils.js     ← 级联孤儿（唯一调用者 replaceEmojiWithIcon）
```

这 4 个在删除前都是「运行时零执行，但文本仍有引用」（因为引用者是它们自己即将被删的主方法）。**覆盖率看不见「马上要死」，只有删完重扫才看得见**——所以本工具的正确用法是：删完一轮后重跑，把 A 的变化当作级联复查的提示。

## 5. 局限（读结论前必看）

1. **覆盖率取决于流程厚度**。空 vault 下大量渲染/编辑分支不执行，B 组数量大不等于「死」。任何用 B 组支撑删除决策的尝试都是错的。
2. **流程有非确定性**：bridge 无宿主时 `restore` 长挂、10s 超时与 flow 步骤竞态，同一版本两次运行的 exec 计数差 ±1%（实测 1056 / 1063）。判断单个方法「从未执行」建议连跑两次取交集。
3. **只覆盖 webapp 侧**。宿主 `src/` 的 TS（后台任务、视图生命周期、命令回调）不在覆盖率里，仍只能靠文本扫描 + 框架约定核对（`onOpen`/`onClose`/`onunload`/`registerEvent` 这类反射调用永远是「零引用」）。
4. **无宿主降级路径的两个 `pageerror`**：首页在空数据下直派 action 会抛 `toggle ... classList`（目标元素未渲染）与 `quickSelect ... split`（同上）。两者都是 harness 绕过 UI、在面板未展开时直接派发 action 的时序产物，生产由真实点击驱动，不触发。

5. **本工具曾抓到并已修复的真实缺陷**：`Store._ensureCurrentDateLoaded: this.state.dayKeys.includes is not a function`。根因是 bridge 的自回环——无宿主时 `window.parent === window`，`_send` 把请求 postMessage 给自己，自己的 message 监听器把它当成宿主请求，回了一个 `{}`，于是 `_send` 把 `{}` 当作成功响应 resolve。`store` 直接把它赋给 `state.dayKeys`，`.includes` 随即崩。修复是在 `_init` 做形状收窄（非数组按 `[]` 处理），并给 `paginated.days` 加了同样的兜底（缺失时 `Object.keys(undefined)` 会中断整个 init）。回归用例见 `tests/store.jest.test.js` 的「Store 对 bridge 异常响应形状的兜底」。生产环境宿主返回 `string[]`，不触发该路径，但宿主异常/未就绪时同样可能返回畸形响应，因此兜底保留在消费侧。

## 6. 复现

```bash
# playwright 有意不进 devDependencies（否则 CI 每次 npm ci 都要拖浏览器）
npm i --no-save playwright && npx playwright install chromium
node scripts/scan-runtime-coverage.mjs                 # 全视图，约 40s
node scripts/scan-runtime-coverage.mjs --only-app       # 只扫首页
node scripts/scan-runtime-coverage.mjs --json=/tmp/cov.json

# 事后验证某个历史版本的删除决策
git worktree add /tmp/before 48c50fc^
PLAYWRIGHT_HOME=<装了 playwright 的目录> \
  SCAN_ROOT=/tmp/before node scripts/scan-runtime-coverage.mjs --json=/tmp/before.json
git worktree remove /tmp/before --force
```

`PLAYWRIGHT_HOME` 指向任意装过 playwright 的目录；仓库内未安装时用它复用已下载的浏览器。
