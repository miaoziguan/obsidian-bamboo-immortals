# 竹林复盘 · 主题动效开发指南

> 版本：1.2 · 最后更新：2026-07-23

本文档面向开发者，指导你为「竹林复盘」插件创建自定义主题动效。遵循此指南，你的主题将与平台外观无缝融合。

---

## 快速开始

1. 在 Vault 中创建主题文件夹（默认路径 `竹林复盘主题/`，可在插件设置中修改）
2. 新建 `我的主题.js` 文件
3. 粘贴下方模板，修改代码
4. 回到竹林的「主题动效」面板即可切换（面板右上角悬浮菜单 → 主题动效）

---

## 接口规范

```js
// 文件名: 我的主题.js  →  全局变量: __bamboo_theme_我的主题

const theme = {
  name: '我的主题',        // 必填：在面板中显示的名称
  render() {              // 必填：返回一段 HTML 字符串
    return '<div>...</div>';
  },
  init(container) {},     // 可选：DOM 挂载后调用，container 是根元素
  destroy() {}            // 必读（见下方"异步安全"）— 切换主题时调用
};

window.__bamboo_theme_我的主题 = theme;
```

**`init(container)`** — 平台传入你 `render()` 产出的根 DOM 元素，可以在此绑定事件、启动动画。

**命名规则**：变量名 = `__bamboo_theme_` + 文件名（不含 `.js` 扩展名）。

---

## 容器适配规范

你的主题会被渲染在平台提供的 `#themeEffectSection` 容器内。

| 属性 | 要求 | 说明 |
|------|------|------|
| `width` | `100%` | 父级宽度 400~1600px，跟随容器动态变化 |
| `height` | 250~400px | 推荐 300px，不超出此区间 |
| `border-radius` | `var(--theme-inner-radius)` | **必须用平台变量，禁止硬编码 px** |
| `overflow` | `hidden` | **必须设置**，防止动效穿透圆角边界 |
| 水平定位 | 百分比 / JS 动态计算 | 禁止固定 px 宽度 |

```css
/* ✅ 正确 */
.my-theme-container {
  width: 100%;
  height: 300px;
  border-radius: var(--theme-inner-radius);
  overflow: hidden;
}

/* ❌ 错误 — 硬编码圆角会随平台升级错位 */
.my-theme-container {
  border-radius: 16px;  /* 不要这样做 */
}
```

### 为何圆角必须用变量

外层容器的圆角会随设计迭代而调整（当前 38px）。平台自动计算内框圆角 = 外层圆角 − padding（当前 26px），并通过 `--theme-inner-radius` 暴露给主题。`#themeEffectSection > *` 上有 `!important` 兜底强制，但主动使用变量是最佳实践。

---

## 平台 CSS 变量

以下 CSS 自定义属性由平台提供，可直接在主题中使用：

| 变量 | 亮色 | 暗色 | 用途 |
|------|------|------|------|
| `--theme-inner-radius` | 26px | 26px | **内框圆角** — 容器 border-radius 必须使用此值 |
| `--accent-hue` | 动态 | 动态 | 色相 — 跟随用户色相滑块（0~359） |
| `--accent-lightness-offset` | 动态 | 动态 | 明度偏移 — 跟随用户明度滑块（-30%~+30%） |
| `--theme-lum` | 80% | 22% | 明暗自适应 — 写一套代码适配亮暗模式 |
| `--theme-sat` | 35% | 25% | 饱和度自适应 — 跟随亮暗切换 |

### z-index 层级体系

平台提供统一 `--z-layer-*` 变量，主题内浮层、遮罩等 z-index 应使用这些变量而非硬编码数字：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--z-layer-below` | -2 | 装饰层/背景装饰 |
| `--z-layer-behind` | -1 | 背景伪元素 |
| `--z-layer-base` | 0 | 正常流 |
| `--z-layer-raised` | 1 | 轻微抬起（card hover） |
| `--z-layer-floating` | 2 | 浮动元素 |
| `--z-layer-dropdown` | 100 | 下拉菜单/颜色面板 |
| `--z-layer-keyboard-hint` | 900 | 键盘快捷键提示 |
| `--z-layer-tooltip` | 9999 | tooltip / 悬浮预览 |
| `--z-layer-overlay` | 10000 | 通用遮罩层 |
| `--z-layer-modal` | 10001 | 模态容器 |
| `--z-layer-toast` | 10010 | Toast 通知 |
| `--z-layer-max` | 11000 | 最顶层（搜索/日期选择器） |

### 用法示例

```css
/* 跟随色相 + 明度 */
background: hsl(var(--accent-hue), var(--theme-sat), var(--theme-lum));

/* 带明度偏移 */
color: hsl(var(--accent-hue), 30%, calc(80% + var(--accent-lightness-offset)));

/* 内框圆角 */
border-radius: var(--theme-inner-radius);
```

### 暗色模式精细控制

如需为亮色/暗色写不同样式，使用 `data-theme-mode` 属性选择器。此属性由平台设置在 `#themeEffectSection` 上，你的主题根元素在其内部，选择器从祖先匹配：

```css
.my-element {
  background: #f5f0e8;  /* 亮色默认 */
}
[data-theme-mode="dark"] .my-element {
  background: #1a1a2e;  /* 暗色覆盖 */
}
```

---

## 异步安全（重要）

这是最容易出 bug 的地方。主题切换时 `destroy()` 被调用，但异步回调（`setTimeout`/`requestAnimationFrame`/`gsap.onComplete`）可能仍在队列中，回调触发时 DOM 已被清空。

### 必须做到的三件事

1. **所有 `setTimeout` 保存 ID**，`destroy()` 中 `clearTimeout` 全部清掉
2. **所有异步回调入口加 null 防护**：`if (!this._container) return;`
3. **`init()` 中存 `this._container = container`**，`destroy()` 中 `this._container = null`

```js
const theme = {
  init(container) {
    this._container = container;
    this._timers = [];
    this._scheduleAnimation();
  },

  _scheduleAnimation() {
    var self = this;
    var id = setTimeout(function() {
      if (!self._container) return;  // ← 必须
      // ... DOM 操作 ...
      self._scheduleAnimation();
    }, 2000);
    this._timers.push(id);
  },

  destroy() {
    // 清理所有定时器
    for (var i = 0; i < (this._timers || []).length; i++) {
      clearTimeout(this._timers[i]);
    }
    // 如有 GSAP，也 kill tweens
    if (window.gsap && this._container) {
      gsap.killTweensOf(this._container.querySelectorAll('*'));
    }
    this._container = null;
  }
};
```

### GSAP 注意事项

如果主题内使用 GSAP：
- `destroy()` 中调用 `gsap.killTweensOf(container)` 清理进行中的 tween
- `gsap.onComplete` 回调入口同样需要 `!this._container` 检查
- GSAP 通过 `window.gsap` 全局可用，主题无需也不能自己 bundle GSAP

---

## 性能约束

| 要求 | 必需/推荐 | 原因 |
|------|-----------|------|
| `overflow: hidden` | **必需** | 防止粒子/雾气等动效溢出圆角边界 |
| `contain: paint` | 推荐 | 隔离绘制层，减少重绘范围，提升帧率 |
| `requestAnimationFrame` | 推荐 | 比 `setInterval` 更高效，与浏览器帧率同步 |
| 避免大面积模糊 | 推荐 | `blur(20px+)` 在暗色模式下有已知的 GPU 伪影 |
| 削减 DOM 节点数 | 推荐 | 大量动效元素尽量用 CSS animation 或 GSAP，避免每帧 JS 遍历读写 DOM |

```css
.my-theme-container {
  overflow: hidden;          /* 必需 */
  contain: paint;            /* 推荐，隔离绘制 */
}
```

---

## 完整模板

```js
const theme = {
  name: '我的主题',

  render() {
    return `<div style="
      width:100%;
      height:300px;
      overflow:hidden;
      border-radius:var(--theme-inner-radius);
      position:relative;
      background:linear-gradient(180deg,
        hsl(calc(var(--accent-hue) + 10), var(--theme-sat), var(--theme-lum)),
        hsl(var(--accent-hue), var(--theme-sat), calc(var(--theme-lum) * 0.85)),
        hsl(calc(var(--accent-hue) - 10), var(--theme-sat), calc(var(--theme-lum) * 0.6))
      );
      display:flex;
      align-items:center;
      justify-content:center">
      <h2 style="color:rgba(255,255,255,.85);text-shadow:0 2px 8px rgba(0,0,0,.2)">
        我的主题
      </h2>
    </div>`;
  },

  init(container) {
    this._container = container;
    this._timers = [];
    // 主题挂载后调用 — 绑定事件、启动动画
  },

  destroy() {
    // 清理所有定时器
    for (var i = 0; i < (this._timers || []).length; i++) {
      clearTimeout(this._timers[i]);
    }
    this._container = null;
  }
};

window.__bamboo_theme_我的主题 = theme;
```

---

## 常见问题

**Q: 我的圆角为什么被覆盖了？**
A: 平台 CSS `#themeEffectSection > *` 使用 `!important` 强制**直接子元素**圆角为 `var(--theme-inner-radius)`。这是设计意图——确保所有主题的双框倒角一致。请在源码中也使用此变量。

**Q: 动效粒子跑到了圆角外面？**
A: 检查容器是否设置了 `overflow: hidden`。Chromium 中 mix-blend-mode 等 GPU 合成层效果会穿透 `overflow`，可尝试给子元素也加 `contain: paint`。

**Q: 暗色模式下颜色很奇怪？**
A: 使用 `--theme-lum`（亮=80%, 暗=22%）和 `--theme-sat`（亮=35%, 暗=25%）自动适配，或通过 `[data-theme-mode="dark"]` 手动调色。

**Q: 切换主题时报 `Cannot read properties of null`？**
A: 见上方"异步安全"一节。你的 `setTimeout`/`gsap.onComplete` 回调里缺少 `this._container` null 检查。

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2 | 2026-07-23 | 新增 `--z-layer-*` 层级体系（12 个变量）；移除已删除的 undo/redo 功能引用 |
| 1.1 | 2026-07-01 | 修正 `--theme-lum` 暗色值 (15%→22%)；`init()` 加 container 参数；新增"异步安全"章节；GSAP 使用说明；更新模板含 timer 清理 |
| 1.0 | 2026-06-27 | 初始发布：圆角变量化、平台变量清单、性能约束、完整模板 |

