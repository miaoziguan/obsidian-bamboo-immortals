// Shadow DOM 隔离引导
// 在入口最前置的 module 中执行（index.html 第一个 <script type="module">）：
//  1. 创建 shadow host 并 attachShadow（open）
//  2. 将 <head> 中的样式 <link> 克隆进 shadow（保留 ?__BUILD__ 指纹），并从 head 移除原 link
//  3. 将 body 内的应用 markup（除 <script> 与 host 自身）搬入 shadow
//  4. 监听 document.body 与 document.documentElement 的 class 变化，镜像到 host
//     （暗色模式用 html.dark，部分状态用 body.theme-*，统一合入 host）
//  5. 注入 light-DOM 复位（html,body margin/padding 归零），避免 host 被 UA/宿主 8px 边距偏移
//
// kill-switch：设置 window.__BAMBOO_NO_SHADOW__ = true 时完全跳过 shadow，
// 此时 window.__bambooShadowRoot 为 null，domRef 自动回退 document，产物等价于旧版。

function initShadow() {
    if (typeof window === 'undefined') return null;
    if (window.__bambooShadowRoot) return window.__bambooShadowRoot;

    const noShadow = window.__BAMBOO_NO_SHADOW__ || typeof document.body.attachShadow !== 'function';
    if (noShadow) {
        window.__bambooShadowRoot = null;
        return null;
    }

    const body = document.body;
    const docEl = document.documentElement;

    // light-DOM 复位：消除 UA 默认 8px body 边距；body 不再承担滚动（交由 host）
    // 注意：此 reset 仅在 shadow 模式注入（noShadow 早退时不创建），故不影响 kill-switch 回退。
    const reset = document.createElement('style');
    reset.id = 'bamboo-light-reset';
    reset.textContent = [
        'html,body{margin:0;padding:0;overflow:hidden;}',
        // 打印时还原 host 为常规流，避免 fixed/overflow 截断整页内容
        '@media print{',
        '  html,body{overflow:visible !important;}',
        '  #bamboo-shadow-host{position:static !important;inset:auto !important;width:auto !important;height:auto !important;overflow:visible !important;}',
        '}',
    ].join('\n');
    document.head.appendChild(reset);

    const host = document.createElement('div');
    host.id = 'bamboo-shadow-host';
    // 关键：让 host 精确覆盖视口并成为滚动容器。
    // Shadow DOM 内 position:fixed 的包含块是 shadow host 而非视口，
    // 仅当 host 与视口尺寸/位置一致时，弹窗/FAB/装饰层才会像原版那样相对视口定位。
    // 用 inline style 设置以最高优先级覆盖 :host 规则，避免被 shadow 内样式改写。
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.left = '0';
    host.style.right = '0';
    host.style.bottom = '0';
    host.style.margin = '0';
    host.style.padding = '0';
    host.style.overflowX = 'hidden';
    host.style.overflowY = 'auto';
    body.appendChild(host);

    const sr = host.attachShadow({ mode: 'open' });
    window.__bambooShadowRoot = sr;

    // 1) 复制 <head> 中的样式表到 shadow，并移除 head 原 link（light DOM 仅剩 host，避免重复样式作用）
    const links = Array.from(
        document.querySelectorAll('head link[rel="stylesheet"][href*="assets/styles/"]')
    );
    links.forEach((link) => sr.appendChild(link.cloneNode(true)));
    links.forEach((link) => link.remove());

    // 2) 将应用 markup 搬入 shadow（跳过 <script> 与 host 自身，脚本已执行无需移动）
    const moveNodes = Array.from(body.children).filter(
        (node) => node !== host && node.tagName !== 'SCRIPT'
    );
    moveNodes.forEach((node) => sr.appendChild(node));

    // 3) 镜像 body + documentElement 的 class 到 host（主题/状态类）
    const mirror = () => {
        const raw = (body.className + ' ' + docEl.className)
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        const set = new Set(raw);
        // 暗色同义词归一：dark / theme-dark 任一出现则两者皆置，
        // 确保 :host(.dark) 与 :host(.theme-dark) 规则都能命中
        if (set.has('dark') || set.has('theme-dark')) {
            set.add('dark');
            set.add('theme-dark');
        }
        if (set.has('theme-light')) set.add('theme-light');
        host.className = 'bamboo-shadow-host ' + [...set].join(' ');
    };
    mirror();
    if (typeof MutationObserver === 'function') {
        new MutationObserver(mirror).observe(body, {
            attributes: true,
            attributeFilter: ['class'],
        });
        new MutationObserver(mirror).observe(docEl, {
            attributes: true,
            attributeFilter: ['class'],
        });
    }

    return sr;
}

// 入口首个 module 即执行；导出以便测试/调试
initShadow();

export { initShadow };
