// 应用层 DOM 查询抽象层
// 设计目标：
//  - shadow 模式开启时，所有"应用层"DOM 查询/挂载都走 shadowRoot，使 Obsidian 全局样式无法穿透；
//  - 关闭 shadow（kill-switch）或测试（jest/jsdom）环境下，自动回退到 document，行为完全等价旧产物。
// 注意：getDomRoot() 是"实时"取值，不缓存 shadowRoot，因此不受模块加载顺序影响。

export function getShadowRoot() {
    return (typeof window !== 'undefined' && window.__bambooShadowRoot) || null;
}

export function getDomRoot() {
    return getShadowRoot() || document;
}

export function byId(id) {
    return getDomRoot().getElementById(id);
}

export function $(selector, ctx) {
    return (ctx || getDomRoot()).querySelector(selector);
}

export function $$(selector, ctx) {
    return (ctx || getDomRoot()).querySelectorAll(selector);
}

export function getHost() {
    return (typeof document !== 'undefined' && document.getElementById('bamboo-shadow-host')) || null;
}

/**
 * 真正承载页面滚动的元素。
 *
 * shadow 模式下滚动容器是 shadow host（`:host` 带 `overflow-y:auto`，见 base.css），
 * 而不是 window —— 此时 `window.scrollY` 恒为 0，任何基于 `window.scrollY / window.scrollTo`
 * 的滚动逻辑都不会动（scrollspy 高亮与「跳到某板块」双双失效）。
 * light DOM / 测试环境回退到 document.scrollingElement（即 <html>），窗口滚动语义不变。
 */
export function getScrollHost() {
    const host = getHost();
    if (host && typeof host.scrollTop === 'number') return host;
    if (typeof document !== 'undefined' && document.scrollingElement) return document.scrollingElement;
    return null;
}

// document 模式下应挂到 <body>（而非 document 对象本身），shadow 模式挂到 shadowRoot
function getRootMount() {
    const root = getDomRoot();
    return root === document ? document.body : root;
}

// 浮层/弹窗挂载点：优先 #modalContainer（已在 shadow 内），否则回退到 root 挂载点
export function modalMount() {
    return byId('modalContainer') || getRootMount();
}

// 动态 <style> 的挂载点：shadow 模式下必须追加到 shadowRoot，否则其中定义的
// @keyframes 对 shadow 内元素不可见（叶子/竹子动画失效）；非 shadow 模式回退 document.head。
export function getStyleMount() {
    return getShadowRoot() || document.head;
}

// 动态创建的提示/浮层：追加到 shadow 根（或 document 模式的 body），保证样式隔离一致
export function appendToRoot(node) {
    return getRootMount().appendChild(node);
}

// 动态 CSS 变量（如 --content-max-width / --accent-hue 等）必须写到"正确根"：
//  - shadow 模式：注入进 shadow 的 variables.css 里 `:root { --x }` 作用在 shadow host 上，
//    会覆盖从 light DOM <html> 继承来的值；因此必须把变量写到 host 的 inline style 才能生效，
//    且 host 是 shadow 内容的继承边界，变量可正确流入 shadow 树。
//  - 非 shadow 模式：直接写到 document.documentElement（即 <html>）。
// 两个目标都写，保证读取侧（getGlobalComputedStyle）也能取到实际值。
export function setGlobalCssVar(name, value) {
    const host = getHost();
    if (host) host.style.setProperty(name, value);
    if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.style.setProperty(name, value);
    }
}

// 返回用于 .style.setProperty / .style.removeProperty 的代理对象（仅 shadow 模式下指向 host 代理）。
// 调用方可直接 `const root = getCssVarRoot(); root.style.setProperty(name, val);`
export function getCssVarRoot() {
    const host = getHost();
    if (host) {
        const delegate = {
            style: {
                setProperty: (name, value) => setGlobalCssVar(name, value),
                removeProperty: (name) => {
                    if (host) host.style.removeProperty(name);
                    if (typeof document !== 'undefined' && document.documentElement) {
                        document.documentElement.style.removeProperty(name);
                    }
                },
            },
        };
        // 转发 classList：调用方（如 _applyObsidianBg 的明暗判定）需要读真实 host 的 class
        Object.defineProperty(delegate, 'classList', {
            configurable: true,
            get: () => host.classList,
        });
        return delegate;
    }
    return document.documentElement;
}

// 读取"生效中"的计算样式：shadow 模式下从 host 读取（host 是变量流入 shadow 的边界），
// 否则从 document.documentElement 读取。
export function getGlobalComputedStyle() {
    const host = getHost();
    return getComputedStyle(host || document.documentElement);
}

// Shadow DOM 下事件 e.target 会被 retarget 成 host，故用 composedPath() 取真实路径
// （含 shadow 内节点）判断事件目标是否落在 node 内。兼容 kill-switch 回退（light DOM）。
export function eventInTargets(e, node) {
  if (!node) return false;
  const path = (e && typeof e.composedPath === 'function') ? e.composedPath() : [];
  if (path.length) return path.includes(node);
  return !!(e && e.target && node.contains && node.contains(e.target));
}

/**
 * 事件是否来自文本输入处（input / textarea / contentEditable）。
 * 供 document / window 级的快捷键守卫使用。
 *
 * 【为什么不能直接读 e.target】Shadow DOM 会把穿越边界的事件 target 重定向成
 * shadow host —— 从 document 看过去它只是一个普通 div。于是
 * `e.target.tagName === 'INPUT'`、`e.target.closest('input, textarea')` 恒不成立，
 * 守卫形同虚设。典型后果：在机身输入框里敲回车/退格时，被 document 级监听
 * 误当成画布快捷键执行（例如多建一颗空子弹、把选中的便签删掉）。
 * 正确做法是用 composedPath() 取**真实**事件路径来判定。
 */
export function isFromTextEntry(e) {
  if (!e) return false;
  if (typeof e.composedPath === 'function') {
    const path = e.composedPath();
    if (path.length) {
      return path.some((n) => {
        if (!n || n.nodeType !== 1) return false;
        const tag = (n.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || n.isContentEditable === true;
      });
    }
  }
  // 无 composedPath（老环境 / 合成事件）时回退到 target 自身判定
  const t = e.target;
  if (!t) return false;
  const tag = (t.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || t.isContentEditable === true;
}

/**
 * 取「真实」获得焦点的元素。
 *
 * 【为什么不能直接读 document.activeElement】Shadow DOM 下焦点位于 shadow 树内时，
 * document.activeElement 恒为 shadow host（事件/焦点 retarget 的同一套语义），
 * 永远不会是 shadow 内部的元素。于是所有
 *   `active === firstElement` / `root.contains(active)`
 * 这类判定恒不成立：焦点陷阱会误判成「焦点在容器外」，
 * 每次 Tab 都强制回首元素（Tab 无法前进）或反向失效让焦点逃出容器。
 * 与 isFromTextEntry 依赖 composedPath 是同一类问题，故同样收口在本文件。
 *
 * 做法：从 document.activeElement 起，若其持有 shadowRoot 就下钻一层
 * shadowRoot.activeElement，直到不再变化。
 *
 * 兼容：kill-switch 关闭 shadow（light DOM / jest）时第一层即为目标元素，
 * 行为与旧实现完全等价。
 */
export function deepActiveElement() {
    let el = (typeof document !== 'undefined') ? document.activeElement : null;
    // 上限防御：异常深层嵌套下不让循环失控
    for (let i = 0; el && el.shadowRoot && i < 16; i++) {
        const inner = el.shadowRoot.activeElement;
        if (!inner || inner === el) break;
        el = inner;
    }
    return el;
}
