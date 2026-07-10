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

// 返回用于 .style.setProperty 的代理对象（仅 shadow 模式下指向 host 代理）。
// 调用方可直接 `const root = getCssVarRoot(); root.style.setProperty(name, val);`
export function getCssVarRoot() {
    const host = getHost();
    if (host) {
        return {
            style: {
                setProperty: (name, value) => setGlobalCssVar(name, value),
            },
        };
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
