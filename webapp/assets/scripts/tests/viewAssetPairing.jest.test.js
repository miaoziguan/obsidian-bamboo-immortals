/**
 * @jest-environment node
 */
// 【视图资源配对】某个 JS 能力被视图用到时，它依赖的组件样式必须同时被该视图加载。
//
// 回归点（真实缺陷）：画中卷（scroll-src.html）与竹林模块（module-src.html）都用得到
// Toast，却只加载了 JS、漏了 toast.css。后果不是"提示不好看"这么轻：
//   .toast-container 的 position:fixed + top/right 全缺 → 容器退化成 shadow root
//   文档流里的普通块级元素 → 通知堆在画布左上角；.toast-icon / .toast-body /
//   .toast-close-btn 也无布局，关闭按钮变成裸的原生按钮。
// 这类"JS 在、CSS 缺"的缺口靠人眼很难发现（组件在别的视图里看起来完全正常），
// 所以用一条静态断言把它变成可检测的：按 import 闭包 + 真实调用点判断视图是否需要，
// 再要求它同时加载对应样式。
const fs = require('fs');
const path = require('path');

// __dirname = webapp/assets/scripts/tests → 上三级即 webapp/
const WEBAPP = path.resolve(__dirname, '../../..');
const VIEWS = ['index.html', 'scroll-src.html', 'archive-src.html', 'module-src.html'];

/** 视图里 <script src> 的脚本清单（去掉 ?__BUILD__ 查询串） */
function scriptsOf(html) {
  return [...html.matchAll(/<script[^>]*\bsrc="([^"?]+)/g)].map((m) => m[1]);
}

/** 视图里 <link rel="stylesheet"> 的样式清单（去掉查询串） */
function stylesOf(html) {
  return [...html.matchAll(/<link[^>]*\brel="stylesheet"[^>]*\bhref="([^"?]+)/g)].map((m) => m[1]);
}

/** 从入口脚本出发的静态 import 闭包（含 import() 动态形式），用于判断视图真正用到哪些能力 */
function reachable(entries) {
  const seen = new Set();
  const stack = entries.slice();
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    let src;
    try { src = fs.readFileSync(file, 'utf8'); } catch { continue; }   // 缺失文件直接跳过
    const re = /(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src))) stack.push(path.resolve(path.dirname(file), m[1]));
  }
  return seen;
}

const viewCache = new Map();
function view(name) {
  if (!viewCache.has(name)) {
    const html = fs.readFileSync(path.join(WEBAPP, name), 'utf8');
    const scripts = scriptsOf(html).map((s) => path.join(WEBAPP, s));
    viewCache.set(name, { html, styles: stylesOf(html), files: reachable(scripts) });
  }
  return viewCache.get(name);
}

/** 视图（含其可达文件）里是否存在真实的 Toast 调用 */
function usesToast(name) {
  for (const f of view(name).files) {
    let src;
    try { src = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (/\bToast\.showToast\s*\(/.test(src)) return true;
  }
  return false;
}

test('闭包解析有效（防止断言空转：正则一旦失效，下面几条会静默通过）', () => {
  // scroll 视图引了 typewriterFeature / mindmapFeature 等一大票文件
  expect(view('scroll-src.html').files.size).toBeGreaterThan(10);
  expect(usesToast('scroll-src.html')).toBe(true);
  expect(usesToast('module-src.html')).toBe(true);
});

test('用到 Toast 的视图必须同时加载 toast.css（回归：画中卷 / 竹林模块通知堆左上角）', () => {
  const needToastCss = VIEWS.filter((v) => usesToast(v));
  // 现实基线：这四个视图都用得到 Toast
  expect(needToastCss.sort()).toEqual(['archive-src.html', 'index.html', 'module-src.html', 'scroll-src.html']);
  needToastCss.forEach((v) => {
    expect(view(v).styles).toContain('assets/styles/toast.css');
  });
});

test('每个视图都加载了设计令牌与基础样式（组件样式的前提）', () => {
  VIEWS.forEach((v) => {
    const { styles } = view(v);
    expect(styles).toContain('assets/styles/variables.css');
    expect(styles).toContain('assets/styles/base.css');
  });
});

test('toast.css 确实提供容器定位与图标布局（否则补链也没用）', () => {
  const css = fs.readFileSync(path.join(WEBAPP, 'assets/styles/toast.css'), 'utf8');
  expect(css).toMatch(/\.toast-container\s*\{[^}]*position:\s*fixed/);
  expect(css).toMatch(/\.toast-icon\s*\{/);
  expect(css).toMatch(/\.toast-close-btn\s*\{/);
});
