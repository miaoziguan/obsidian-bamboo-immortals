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
