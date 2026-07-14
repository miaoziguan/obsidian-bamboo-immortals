# 架构改进路线图 · 实施计划 (ARCHITECTURE ROADMAP)

> 创建日期：2026-07-14
> 适用项目：`obsidian-bamboo-review`（Obsidian 插件「竹林修仙传」宿主 + 内嵌 webapp）
> 状态：**计划文档（尚未改动代码）**
> 关联文档：`docs/ARCHITECTURE.md`、`docs/window-globals.md`、`docs/BUILD.md`

---

## 0. 为什么是这份计划（核心论点）

技术债的核心**不是**「没用框架」，而是 **host 与 webapp 之间、webapp 内部之间，都没有编译期可验证的契约**。

- 顶层（window 全量摊平）只是「丑」——最多静默覆盖，可定位。
- 底层（协议无契约、测试≈0、类型缺失）才是「咬人」的：宿主 `main.js` 升级后，用户本地的 `app.html`/webapp 可能还是旧版，`postMessage` 字段悄悄失配，**线上静默失败**。

因此路线图是**倒金字塔**：先补底层契约与测试，顶层形态（框架与否）最后再评估。

### 已完成的地基（本计划不重复造）

| 已有资产 | 位置 | 说明 |
|---|---|---|
| 全局挂载点清单 | `docs/window-globals.md` | 70 个 `window.X` 挂载点 / 42 文件，阶段1 的直接输入 |
| nav/action 类型化门面 | `src/host/WebappController.ts` | `CommandType` 联合类型 + 语义方法，阶段1 部分落地 |
| WebappController 单测 | `src/host/__tests__/webappController.test.ts` | vitest，锁定「方法→线协议 type」映射 |
| 主题沙箱安全审计 | `webapp/.../tests/themeAudit.jest.test.js` | 拦截自定义主题逃逸 iframe，**任何阶段都不得破坏** |
| 双轨测试基建 | `vitest.config.ts`（node, `src/**/*.test.ts`）+ jest（jsdom, webapp） | 已就绪，可扩展 |

---

## 1. 当前协议真实清单（核到的硬事实）

消息格式统一为 `{ type, id?, payload? }`，经 `postMessage` 跨 iframe 边界传递。
来源校验现状：**不一致**——`AppAPI` 未校验 `event.source`；`bridge.js:414` 校验 `event.source === window.parent`；`settingsModal.js:269` 甚至用 `window.postMessage` 发给自己（见 §3 风险）。

### 1.1 Webapp → Host（iframe → 父窗口，由 `AppAPI.messageHandler` 接收）

| type | payload | 发送方（webapp） |
|---|---|---|
| `app:ready` | — | `bridge.js`（生命周期握手） |
| `app:close` | — | `bridge.js` |
| `app:saveSectionConfig` | `Record<string,unknown>` | `handlers.js` |
| `app:saveCustomNoises` | `NoiseItem[]` | `handlers.js` |
| `app:theme:sync` | — | `settingsModal.js` ⚠️ 走 `window.postMessage`（疑似失效，见 §3） |
| `theme:syncPalette` | `{hue,lightnessOffset,isDark}` | `displayManager.js` |
| `app:listVaultAudioFiles` | — | `whiteNoiseManager.js` |
| `app:readVaultFile` | `{path}` | `whiteNoiseManager.js` |
| `app:readLocalFile` | `{path}` | `whiteNoiseManager.js` |
| `app:proxyAudioUrl` | `{url}` | `whiteNoiseManager.js` |
| `storage:*` | 见下表 | `bridge.js`（`BridgeStorage`） |

### 1.2 `storage:*` 子类型（共 17 个，`AppAPI.handleStorageMessage` 委托 `VaultStorage`）

`storage:readDay` `storage:writeDay` `storage:listDays` `storage:deleteDay`
`storage:getSetting` `storage:putSetting` `storage:getAllSettings`
`storage:getGoals` `storage:putGoals` `storage:getPurchaseHistory` `storage:putPurchaseHistory`
`storage:getIncomeHistory` `storage:putIncomeHistory` `storage:getDayKeys`
`storage:getDaysPaginated` `storage:exportAll` `storage:importAll` `storage:clearAll`

### 1.3 Host → Webapp（父窗口 → iframe）

| type | 发送方（host） | 接收方（webapp） |
|---|---|---|
| `nav:prevDay` / `nav:nextDay` / `nav:today` | `DailyReviewView.sendCommand` → `WebappController` | `bridge.js:421-429` |
| `action:openStats` / `action:openSettings` | 同上 | `bridge.js:430-435` |
| `theme:changed` | `ThemeBridge.ts`、`PluginSettings.ts` | webapp 主题监听 |
| `theme:followDisabled` | `PluginSettings.ts` | webapp 主题监听 |
| `theme:syncPaletteEnabled` | `PluginSettings.ts` | webapp 主题监听 |
| `{id, payload}` 响应 | `AppAPI.respond` | `bridge.js`（按 id 匹配） |

> 现状：以上**全部为字符串字面量，无联合类型、无集中定义、无版本号**，散落在 ≥6 个文件（`AppAPI.ts`、`DailyReviewView.ts`、`ThemeBridge.ts`、`PluginSettings.ts`、`bridge.js`、`displayManager.js`、`whiteNoiseManager.js`、`settingsModal.js`）。改任一 `type` 字符串，编译期查不到任何使用方。

---

## 2. 四阶段路线图

```mermaid
flowchart LR
  A["现在<br/>无契约·双轨测试·覆盖≈0<br/>已有 WebappController 雏形"]
  B["阶段1 · 收口<br/>显式 Facade 替代全量摊平<br/>+ 重名告警 + 命令类型补全"]
  C["阶段2 · 类型化<br/>webapp JSDoc/TS<br/>store/bridge/renderer 单测"]
  D["阶段3 · 契约化（最高杠杆）<br/>共享 protocol.ts<br/>+ 版本协商 + 来源校验集中"]
  E["阶段4 · 形态演进<br/>仅当 UI 越线才评估框架<br/>Vite iife 内联 · 多实例 viewId"]

  A --> B --> C --> D --> E
  style A fill:#5b2333,stroke:#fff,color:#fff
  style B fill:#7a4a1e,stroke:#fff,color:#fff
  style C fill:#2d5a3d,stroke:#fff,color:#fff
  style D fill:#1f4e6b,stroke:#fff,color:#fff
  style E fill:#3a3a5c,stroke:#fff,color:#fff
```

顺序理由：**先收口→再类型化→再契约化→最后才考虑形态**。任一靠前的阶段都是后一阶段的前置，不能跳步。

---

## 3. 阶段 1 · 收口（低风险，地基已半成）

**目标**：把隐式 window 全量摊平改为显式门面，让依赖图可见、消除静默覆盖，并补全命令类型。

**范围 IN**
- 构建单一显式门面 `window.WebApp = { store, Handlers, Navigation, ... }`，替代 70 个平铺 `window.X`。
- 在 bootstrap 挂载阶段加入**重名 key 告警**（重复挂载即 console.error + 测试可断言）。
- `index.html` 内联 `<script>` 对 `renderAll` / `Handlers.init` 等入口的调用改为走门面。
- 校验 `DailyReviewView.sendCommand` 仅发出 nav:/action: 5 种类型（已覆盖），确认无遗漏。

**范围 OUT**：框架迁移、webapp 全量 TS 重写（那是阶段2/4）。

**任务（TDD，每任务 2–5 分钟）**
- T1：写测试，断言 `window.WebApp` 暴露 `store`/`Handlers`/`Navigation`，且既有调用点（`renderAll`、`Handlers.init`）仍可解析。
- T2：实现门面 + 重名 key 守卫；迁移 `index.html` 内联调用。
- T3：为门面挂载过程写「重复 key 触发告警」的单测。

**验收标准**
- ✅ 全部 70 个原挂载点仍可经 `window.WebApp.*` 访问；`sync.sh` 全链路（tsc/eslint/esbuild/bundle）通过。
- ✅ 除门面注册点外，无新增散落 `window.X = X`。
- ✅ 重名守卫在测试中断言可触发。
- ✅ `themeAudit.jest.test.js` 仍绿（沙箱边界不动）。

---

## 4. 阶段 2 · 类型化（webapp 加类型 + 核心单测）

**目标**：webapp 获得编译期类型，核心中枢模块有单测护体。

**范围 IN**
- 为 `store.js` / `Handlers` / `bridge.js` / `renderers.js` 增加 JSDoc typedef（或增量迁移到 TS，构建仍出 IIFE 保 Obsidian 兼容）。
- 单测：`store.js`（navigateDate / goToDate / 状态迁移）、`bridge.js`（消息分发 + `event.source` 过滤）、`renderers.js`（renderSkeleton / renderAll，jsdom）、`GoalService`（CRUD + 计算）。

**范围 OUT**：一次性全量重写；动既有运行时行为。

**任务（TDD）**
- T1：为 `store.navigateDate(-1/+1)`、`goToDate` 写 jsdom 单测（先红后绿）。
- T2：为 `bridge.js` 的 `_messageHandler` 写「非 `window.parent` 来源被丢弃」单测。
- T3：为 `renderers.renderSkeleton` 写 DOM 结构断言单测。
- T4：为 `GoalService` 写纯计算断言单测。

**验收标准**
- ✅ jest（jsdom）新测试全绿；`store`/`bridge`/至少一个 `renderer` 被覆盖。
- ✅ 新增类型不含逃逸 `any`（TSDoc 或 TS 严格模式）。
- ✅ 构建产物体积无显著回归。

---

## 5. 阶段 3 · 契约化（最高杠杆，必做）

**目标**：单一事实源定义所有 `postMessage` 类型 + payload schema + 版本协商 + 集中来源校验。

**范围 IN**
- 新建 `src/shared/protocol.ts`（host 与 webapp 共用），定义判别联合 `AppMessage`，覆盖 §1 全部类型。
- 每个消息定义 payload schema（zod 或手写类型）。
- **版本协商**：`app:ready` 携带 `protocolVersion`；`AppAPI` 校验兼容性，开发环境对不匹配给出可见告警（直击「main.js 升级但 webapp 缓存旧版」发布风险）。
- **来源校验集中化**：单一 `isValidSource(event, iframe)` 被 `AppAPI` 与 `bridge.js` 接收端共用（消除 §1 中 `settingsModal.js:269` 用 `window.postMessage` 自我投递、永远到不了宿主的潜在 bug——本阶段顺带修复并补测试）。
- host/webapp 双方 import 同一份联合类型；`type === 'app:ready'` 式裸比较改为类型收窄。

**范围 OUT**：改变消息语义；引入框架（那是阶段4）。

**任务（TDD）**
- T1：写 `protocol.test.ts`，断言未知 `type` 不满足 `AppMessage` 类型（用 `expectTypeOf` 或编译期）。
- T2：实现 `protocol.ts` 联合 + payload schema + `isValidSource`。
- T3：host 侧 `AppAPI` / `ThemeBridge` / `PluginSettings` 改为引用 `AppMessage`；补版本协商告警单测。
- T4：webapp 侧 `bridge.js` 接收端 + `sendCommand` 改用类型；修复 `settingsModal.js:269` 改为 `window.parent.postMessage` 并补「`app:theme:sync` 实际抵达 host」集成测试。

**验收标准**
- ✅ 单一 `protocol.ts` 被全部 ≥6 个发送点 + 2 个接收点引用。
- ✅ `tsc --noEmit` 在任一发送方使用未知 `type` 时**编译失败**。
- ✅ 协议版本不匹配在 dev 触发可见告警。
- ✅ `settingsModal.js:269` bug 修复且有测试证明 `app:theme:sync` 抵达宿主。
- ✅ `themeAudit.jest.test.js` 仍绿。

---

## 6. 阶段 4 · 形态演进（仅当 UI 复杂度真越线才触发）

**目标**：**仅当** UI 状态-视图同步复杂度确实越过阈值，才评估框架；否则不引入。

**范围 IN（条件式）**
- 若采纳：用 **Vite library 模式输出 IIFE 仍内联**（保 Obsidian 兼容）；源码选 **Preact** 而非 React（iife 体积更小、iframe 重绘更敏感）。
- 可抽独立 npm 包复用。
- 若需多实例视图：协议增加 `viewId` 路由字段。

**范围 OUT**：为「现代化」硬上 React；破坏沙箱边界（themeAudit 必须仍绿）。

**验收标准**
- ✅ `viewId` 判别生效（多视图不串数据）。
- ✅ `themeAudit.jest.test.js` 仍绿。
- ✅ bundle 体积仍在 Obsidian 插件可接受范围。

---

## 7. 发布风险备忘

1. **host 升级 / webapp 缓存旧版失配**：阶段3 版本协商直接对症。
2. **`settingsModal.js:269` 自我投递 bug**：`app:theme:sync` 大概率永不到达宿主，阶段3 修复。
3. **来源校验不一致**：阶段3 集中到 `isValidSource` 消除。
4. **沙箱边界不可破**：任何阶段改动 `bridge.js` / 主题加载，必须保证 `themeAudit.jest.test.js` 绿。

---

## 8. 执行方式建议

- 本计划按 superpowers 流程推进：每阶段先写失败测试 → 实现 → 测试转绿 → 提交。
- 阶段间有依赖，**不可跳步**；阶段1 已完成约 40%（WebappController + 清单），可直接接 T1。
- 建议从**阶段1 的 T1/T2** 起步（低风险、可逆、立即提升可见性）。

> 下一步：确认是否开始执行「阶段1 · T1/T2」，或先 git 提交本计划文档。

---

## 9. 执行进度（Checkpoint 日志）

### 2026-07-14 · 阶段1 第一批（门面收口·加性切片）✅ 完成

**交付物**
- 新增 `webapp/assets/scripts/utils/facade.js`：ES module，导出 `createFacade()`（带重名守卫，`register` 同键二次挂载时 `console.error` 告警并记录 `duplicates`）+ `buildFacadeFromWindow(names, win)`，并把两者挂到 `window` 供入口调用。
- 新增测试 `webapp/assets/scripts/tests/facade.jest.test.js`：4 个用例（挂载/读取、重名告警、来源复制、跳过缺失成员）。
- `webapp/index.html`：入口前加载 `facade.js`；init 循环之后以 `try/catch` 把核心 10 个全局（`store`/`Handlers`/`Navigation`/`SectionManager`/`Todo`/`SettingsModal`/`ActionDispatcher`/`DisplayManager`/`renderAll`/`renderSkeleton`）收敛进 `window.WebApp`。**加性、零行为变更**。

**验证（均通过）**
| 检查 | 命令 | 结果 |
|---|---|---|
| 门面单测 | `npx jest facade` | 4/4 通过 |
| 全套回归 | `npx jest` | 15 suite / 133 passed，themeAudit 沙箱测试仍绿 |
| 静态检查 | `npx eslint facade.js` | 0 errors |
| 打包集成 | `npm run build:webapp` | 成功，facade.js 入 bundle（68 模块），app.html 重新生成 |

**本批刻意不做（控制风险）**
- 未迁移 42 个 `window.X = X` 挂载文件（完整收口留待后续批次）。
- 未把 `window.WebApp` 改为「活代理」（当前为 init 时刻快照，够本批目标）。
- 未破坏沙箱边界（themeAudit 必须保持绿，已验证）。

**剩余阶段1 工作（后续批次）**
- [ ] 把 `index.html` 入口的裸调用（`store.initPromise` 等）逐步改走 `window.WebApp.*`（可选、低风险）。
- [ ] 视情况将重名守卫从「门面层」下沉到「window 挂载层」（需拦截 `window.X = X`，改动较大，单独评估）。
- [ ] 命令行类型补全：确认 `DailyReviewView.sendCommand` 仅发 nav:/action: 5 种（已覆盖），无遗漏；若新增命令类型，同步 `WebappController.CommandType`。

### 2026-07-14 · 阶段2 第一批（bridge.js 协议边界单测）✅ 完成

**交付物**
- 新增 `webapp/assets/scripts/tests/bridge.jest.test.js`（9 用例）：
  - 接收端：`nav:prevDay/nextDay/today`、`action:openStats/openSettings` 正确分发到 `store`/`Handlers`/`StatsModal`；来源非 `window.parent` 被拒绝。
  - 发送端：`_send` 携带 `{type,id,payload}`，目标使用 `window.parent.origin`（非空时优先于 `'*'`，比通配符更安全）；连续 id 唯一。
- TDD 过程中**纠正了一个错误假设**：原本以为 jsdom 中 `window.parent.origin` 为空会回退 `'*'`，实测为 `http://localhost`——说明实际发送目标用的是真实 origin，安全性更好。

**验证**：`npx jest bridge` → 9/9 通过；bridge.js 此前零单测，本批为协议边界建立首道锁。

**阶段2 现状盘点**
- 已覆盖：store（`store.jest.test.js` 覆盖 navigateDate/goToDate/subscribe 等）、dataValidator、helpers、TimelineService、searchService、eventBus、GoalService?、themeAudit 等。
- 仍可能缺口：renderers（`renderSkeleton`/`renderAll`）、GoalService 纯计算等——视情况补。

### 2026-07-14 · 阶段3 第一批（protocol.js 单一事实源 + 集中校验）✅ 完成

**交付物**
- 新增 `webapp/assets/scripts/utils/protocol.js`（ES module，挂到 `window.AppProtocol`）：
  - `APP_MESSAGE_TYPES`：§1 全部已知 message type 的集中清单（替代散落字符串）；
  - `parseAppMessage(event, expectedSource)`：统一「来源校验 + type 合法性」，替代 bridge.js 三处裸 `event.source` 比较；
  - `PROTOCOL_VERSION` + `isKnownType`（storage:* 按前缀放行）。
- 新增 `protocol.jest.test.js`（8 用例）：类型清单覆盖、parse 来源/type 校验、`protocolVersion` 透传。
- `bridge.js` 三处接收端统一走 `window.AppProtocol.parseAppMessage`（防御式：缺失时回退旧语义，行为不变）；`app:ready` 握手带上 `protocolVersion`（版本协商种子）。
- `index.html` 加载 `protocol.js`（CRLF 行尾难题：用 perl 在 `</body>` 前插入；`git checkout` 因 `.husky/_` 的 `post-checkout` 钩子卡死，改用 `git show HEAD: >` 还原）。

**验证**：`npx jest bridge protocol` → 17/17 通过；`build:webapp` → 69 模块（含 protocol.js）。
**TDD 收益**：jsdom 中 `window.parent.origin` 为 `http://localhost`（非空），发送目标用真实 origin 而非通配符，安全性更好。

### 待启动
- [ ] 阶段2 后续：补 renderers / GoalService 等缺口单测（可选）
- [ ] 阶段3 后续：host 侧 TS 并行维护类型镜像 + 版本协商告警（dev 环境版本不匹配可见告警）
- [ ] 阶段4 · 形态演进（仅当 UI 越线）
