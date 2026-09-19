# 竹林修仙传 — 架构文档

## 整体架构

```
Obsidian Plugin (main.ts)
  └── DailyReviewView (ItemView)
       ├── AppHost (blob URL 构建 + webapp 资源注入)
       ├── AppAPI  (postMessage 通信 + 存储/主题桥接)
       └── iframe (blob URL 加载 webapp)
            └── shadowBootstrap.js (Shadow DOM 隔离)
                 ├── CSS 变量系统 (variables.css)
                 ├── Bundle (70+ JS 模块打包为 IIFE)
                 └── BridgeStorage (postMessage → AppAPI)
```

## 关键组件

### AppHost (`src/host/AppHost.ts`)
- 读取 `webapp/` 目录下的 `index.html`、CSS、JS
- CSS 内联为 `<style>` 标签
- JS 检测 `webapp/assets/scripts/bundle.js` 并加载
- 构建自包含的 blob URL HTML，通过 iframe 加载

### AppAPI (`src/host/AppAPI.ts`)
- 监听来自 webapp 的 `postMessage`
- 路由存储操作（读/写/列表/导入/导出）到 `VaultStorage`
- 主题同步（明暗切换、配色联动）
- 音频文件扫描和读取

### Bundle (`scripts/bundle-webapp.mjs`)
- 构建时工具：自动解析 `index.html` 中 `<script src>` 顺序
- 用 esbuild 将所有 JS 模块打包为 IIFE 格式
- 所有导出自动暴露到 `window` 全局

### shadowBootstrap.js (`webapp/assets/scripts/utils/shadowBootstrap.js`)
- 创建 Shadow DOM 宿主
- 将 CSS 和 body 内容移入 shadowRoot
- 确保 `:host` 选择器正常工作
- 提供 `window.__bambooShadowRoot` 供 `domRef.js` 使用

### domRef.js (`webapp/assets/scripts/utils/domRef.js`)
- 应用层 DOM 查询抽象
- Shadow 模式下查询走 `shadowRoot`
- 非 Shadow 模式回退到 `document`

## webapp 内部架构（便签画布）

便签画布的 feature 巨型单例（`TypewriterFeature` + 一批 `export const X = {}` /
`class` 子模块）在 P8 阶段做了三处解耦收口，本节能作为后续改动的「地图」。

### 1. 共享状态单主 —— NotesState（B5 / 复盘 4.2）

原先 `_notes / _geo / _spatial / _mountedCards / _links / _selected / _canvasOffset / _mode`
等 8 个字段直接挂在 `TypewriterFeature` 上，与「方法集合」混在一起，新增字段要同时动
`_resetState` + 所有触碰它的模块，且易产生镜像漂移。

现统一收口到 `services/NotesState.js` 的 `NotesState` 类，它是这 8 个字段的**唯一真源**。
`TypewriterFeature` 通过 `Object.defineProperties` 把 `this._notes` 等 8 个访问器代理到
`this._state.*`：

```js
Object.defineProperties(TypewriterFeature, {
  _notes:  { get() { return this._state.notes; },  set(v) { this._state.notes = v; } },
  _geo:    { get() { return this._state.geo; },    set(v) { this._state.geo = v; } },
  // ……其余 6 个字段同构
});
TypewriterFeature._resetState();   // 存取器定义之后才调用，赋值才会走 setter 落到 _state
```

要点：
- 读取/写入 `this._notes` 一律经存取器命中 `this._state`，**不存在任何平行副本**。
- `_resetState()` 是字段唯一初始化入口（模块加载 + unmount 结尾各调一次），新增字段只改这一处。
- 子模块拿到的是 `state`（NotesState 实例），直接读写 `state.notes / state.geo …`，与 feature 同源。

### 2. 几何单源 —— GeoCache + SpatialIndex（B2 / 复盘 A4）

卡片几何 `id → {x,y,w,h,rot}` 是连线端点、命中测试、框选、视口剔除的共同依赖，必须
「随卡片位置/尺寸变化及时刷新，且离屏卡保留最后测量值」。

- `services/GeoCache.js`：Map 兼容接口（`get/set/delete/has/forEach/clear/size`）+ 失效集
  （`markDirty/takeDirty`）+ 合帧句柄（`flushRaf`）。feature 既有 `this._geo.get(...)` 零改动复用。
- `services/SpatialIndex.js`：空间命中索引，供 cull / 框选 / 命中 O(可视)。
- `ViewportCuller.setGeom / removeGeom` 是**唯一写入入口**，一次同时刷新 GeoCache
  （`state.geo`）与 SpatialIndex（`state.spatial`），杜绝「只改一处导致另一处停在旧位置」的漂移
  （连线端点指幽灵位置、剔除按旧位置挂卸）。

### 3. 模块接收 state 而非穿透 this（P8 解耦核心）

feature 不再用 `Module.method.call(this, ...)` 调用子模块，而是统一经委托壳注入上下文：

```js
// feature 委托壳
_makeDraggable(card) { return CardInteractions.makeDraggable({ state: this._state, ctrl: this }, card); }

// 子模块方法首参收 ctx
export const CardInteractions = {
  makeDraggable(ctx, card) {
    const { state, ctrl } = ctx;
    // 共享数据读写 → state.*（不穿透宿主）
    // 宿主行为/字段依赖 → ctrl._xxx（如 ctrl._scheduleRenderLinks / ctrl._canvas）
    // 模块内互相调用 → this.method(ctx, …)
  }
};
```

约定（每个方法首参 `ctx = { state, ctrl }`）：
- `state`：`NotesState` 实例，对共享**数据**的读写全走 `state.*`。
- `ctrl`：宿主 `TypewriterFeature`，对宿主**行为/字段**的访问走 `ctrl._xxx`（如 `_createCardEl`、
  `_scheduleRenderLinks`、`_canvas`、`_zTop`…）。
- 模块内互调：`this.method(ctx, …)`；跨子系统回宿主委托：`ctrl._delegate()`。
- 这样模块不再假设 `this` 隐式等于宿主，数据真源在 NotesState、行为真源在宿主，二者皆显式注入。

已按此约定迁移的模块（全部接收 `ctx`）：

| 模块 | 路径 | 职责 |
|------|------|------|
| `ViewportCuller` | `services/ViewportCuller.js` | 视口剔除 + 几何缓存 + 卡片挂载/卸载/释放 |
| `CardInteractions` | `handlers/features/CardInteractions.js` | 拖拽 / 选择 / 框选 / 删除 |
| `CardViewManager` | `handlers/features/CardViewManager.js` | 卡片元素创建 / 锚点卡生成 |
| `ModeController` | `handlers/features/ModeController.js` | 模式切换 / 写作序 / Markdown 导出 |
| `PersistenceCoordinator` | `handlers/features/PersistenceCoordinator.js` | 存读盘 / 快照 / 顺序 |

**刻意不动的子模块**（它们本就解耦，不应改成 ctx 风格）：
- `LinkLayer`（`services/LinkLayer.js`，`class`，经构造参数 `getLinks/setLinks/…` 注入，不穿透宿主）；
- `WritingDoc`（`handlers/features/writingDoc.js`，纯逻辑单例，无 DOM/存储/副作用）；
- `UndoStack`（`services/undoStack.js`，实例）。

**已收口、但属特例的子模块**：
- `MindmapFeature`（`handlers/features/mindmapFeature.js`，单例，独立文档子系统）：其 `mount(ctx, wrap)` 入口已改为接收
  `ctx = { state, ctrl }`，仅从 `ctx.ctrl` 取宿主行为（`_refreshScreenMeta` / `getSeedSource` / `_showScreenMsg`），
  其余仍由自身 `this._nodes/_links` 等字段维护独立文档状态（不走 NotesState）。属「边界对齐 ctx、内部自治」式收口，
  不参与「数据走 state」部分。

  **D2 抽离的纯模块**（同目录，无 DOM、可脱离 UI 单测，覆盖见 `tests/mindmapLayoutExport.jest.test.js`）：
  - `MindmapLayout`（`mindmapLayout.js`）：`compute(mode, nodes, links) → Map<id,{x,y}>`，从 `_computeLayout` 提升的纯布局
    （树 / 水平树 / 放射 / 网格 / 环形），`autoLayout` 改调它；
  - `MindmapExport`（`mindmapExport.js`）：`build(nodes, links, selIds) → {content,title}`，从 `buildMarkdown` 提升的纯导出
    （YAML frontmatter + 大纲，支持选中分支），`MindmapFeature.buildMarkdown` 仅作公开 API 委托壳。

  **D3 状态归属定界**：导图文档状态自持于 `MindmapFeature` 实例字段（见其文件顶部「状态归属」注释），是刻意独立于
  `NotesState` 的「独立文档子系统」选择——不并入便签单一真源，避免把一颗思维子弹图和整张便签画布耦合进同一状态树。
  撤销栈同理：导图自带 `_undoStack`，与便签那份互不干扰。

## 目标闭环（飞轮）

竹林修仙传的核心闭环由三段串成，本仓库分阶段落地：

1. **规划（Agentic）**：笔记/选区 → `PlanningSession` + `AgenticPlanModal` 从笔记拆解目标树，审阅后写入 `goals.json`。
2. **执行（webapp）**：每日打卡写 `data/*.json`，`GoalHealthScore` 本地算三层健康分（L1/L2/L3）+ 规则诊断（`webapp/.../goals/healthScore.js`），在「战略复盘」面板展示。
3. **诊断 → 行动（MVP-1）**：`ai-diagnose` 命令读取 `goals.json` + 近 14 天 `data/*.json`，`DeviationCalculator` 算硬指标（偏差/停滞/趋势），`GoalDiagnoser` 调 AI 做因果归因并产出可操作建议；`DiagnosisModal` 只读展示，「应用」按钮把某目标的建议作为自然语言指令喂给已加载真实树的 `AgenticPlanModal`（`loadGoals` + `initialInstruction`），AI 改树后人工审阅「写入目标」落库。

```
命令 ai-diagnose
   │  getGoals() + getDayKeys()/getDay()（近 14 天）
   ▼
DeviationCalculator（硬指标：偏差率/停滞/趋势）
   ▼
GoalDiagnoser.diagnose（AI 归因 + 可操作建议，复用 requestUrl 绕 CORS）
   ▼
DiagnosisModal（只读报告，「应用」按钮）
   ▼ （点应用）
AgenticPlanModal（loadGoals 真实树 + initialInstruction 预填）
   ▼ AI 改树 → 树状 diff 审阅 → 写入目标（putGoals + 刷新 webapp）
```

设计要点：诊断只做「为什么 + 怎么调」，不重算分（本地算法已覆盖「发现」）；建议以自然语言指令直送已验证的 Agentic 编辑链路，零新增 CORS 风险；AI 调用失败 / 坏 JSON 均回退纯文本不崩。

## 数据流

```
webapp (bridge.js)
  │  postMessage('storage:readDay', {dateKey})
  ▼
AppAPI (onMessage)
  │  VaultStorage.getDay(dateKey)
  ▼
VaultStorage (Obsidian Vault API)
  │  app.vault.adapter.read(...)
  ▼
obsidian-vault/.obsidian/.../data/2026-07-13.json
```

## 通信协议

webapp 与插件通过 `postMessage` 通信，消息格式：

```json
{ "type": "storage:readDay", "id": "req_xxx", "payload": { "dateKey": "2026-07-13" } }
```

响应：

```json
{ "id": "req_xxx", "payload": { /* DayData */ } }
```

## 存储结构

```
{obsidian-vault}/
  .obsidian/plugins/bamboo-immortals/
    main.js          ← 插件入口（TypeScript 编译产物）
    styles.css       ← 插件 UI 样式
    manifest.json    ← 插件清单
    webapp/          ← 前端应用
      index.html
      assets/styles/   ← CSS 文件（运行时内联）
      assets/scripts/  ← JS 文件（构建时打包为 bundle.js）

  bamboo-review/    ← 插件数据目录
    data/           ← 每日 JSON 数据
    reviews/        ← Markdown 摘要
    goals.json      ← 全局目标
    settings.json   ← 应用设置
    purchase-history.json
    income-history.json
```

## 构建流程

```
sync.sh
  1. CSS 令牌校验
  2. tsc --noEmit (类型检查)
  3. eslint (代码质量)
  4. esbuild main.ts → main.js (TypeScript 编译)
  5. bundle-webapp.mjs (webapp JS 打包)
  6. 同步到 Obsidian 插件目录
```
