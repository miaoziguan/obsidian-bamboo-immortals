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

    // 激活遮罩样式（licenseGate.js 依赖，注入 shadow 使其随主题隔离生效）
    const gateStyle = document.createElement('style');
    gateStyle.id = 'bamboo-license-gate-style';
    gateStyle.textContent = `
      .bamboo-license-gate {
        position: fixed; inset: 0; z-index: var(--z-layer-modal, 10001);
        display: flex; align-items: center; justify-content: center;
        background: rgba(var(--white-rgb, 255,255,255), 0.02);
        backdrop-filter: blur(18px) saturate(160%);
        -webkit-backdrop-filter: blur(18px) saturate(160%);
        color: var(--text-primary, #1f2a1c);
        font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, sans-serif);
        padding: 20px;
      }
      .bamboo-license-gate .blg-card {
        width: min(400px, 94vw);
        background: rgba(var(--white-rgb, 255,255,255), 0.92);
        border: 1px solid rgba(var(--bm-primary-rgb, 45,90,39), 0.14);
        border-radius: var(--radius-xl, 22px);
        box-shadow:
          0 2px 1px rgba(45,90,39,0.04),
          0 8px 24px rgba(45,90,39,0.08),
          0 24px 60px rgba(0,0,0,0.12);
        padding: 32px;
        text-align: center;
        -webkit-font-smoothing: antialiased;
      }
      .bamboo-license-gate .blg-header { margin-bottom: 18px; }
      .bamboo-license-gate .blg-title {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: var(--bm-primary, #2D5A27);
      }
      .bamboo-license-gate .blg-subtitle {
        margin: 6px 0 0;
        font-size: 13px;
        color: var(--text-tertiary, #8a9684);
      }
      .bamboo-license-gate .blg-intro {
        margin: 12px auto 0;
        max-width: 320px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--text-secondary, #5a6b54);
        text-align: center;
      }
      .bamboo-license-gate .blg-pricing {
        display: inline-flex;
        align-items: center;
        gap: 18px;
        padding: 10px 22px;
        background: rgba(var(--bm-primary-rgb, 45,90,39), 0.06);
        border: 1px solid rgba(var(--bm-primary-rgb, 45,90,39), 0.10);
        border-radius: 999px;
        margin: 0 auto 14px;
      }
      .bamboo-license-gate .blg-price-main,
      .bamboo-license-gate .blg-price-secondary { display: flex; flex-direction: column; align-items: center; gap: 1px; }
      .bamboo-license-gate .blg-price-label { font-size: 11px; color: var(--text-tertiary, #8a9684); letter-spacing: 0.04em; }
      .bamboo-license-gate .blg-price-main .blg-price-value { font-size: 22px; font-weight: 800; color: var(--bm-primary, #2D5A27); }
      .bamboo-license-gate .blg-price-secondary .blg-price-value { font-size: 15px; font-weight: 600; color: var(--text-secondary, #5a6b54); }
      .bamboo-license-gate .blg-price-divider { width: 1px; height: 32px; background: rgba(var(--bm-primary-rgb, 45,90,39), 0.14); }
      .bamboo-license-gate .blg-tags {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
        margin-bottom: 22px;
      }
      .bamboo-license-gate .blg-tag {
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 500;
        color: var(--bm-primary, #2D5A27);
        background: rgba(var(--bm-primary-rgb, 45,90,39), 0.08);
        border: 1px solid rgba(var(--bm-primary-rgb, 45,90,39), 0.10);
        border-radius: 999px;
      }
      .bamboo-license-gate .blg-form { display: flex; flex-direction: column; gap: 12px; }
      .bamboo-license-gate .blg-input {
        width: 100%; box-sizing: border-box;
        padding: 13px 14px;
        font-size: 14px;
        letter-spacing: 0.5px;
        border: 1px solid var(--bm-border, #d8e3d4);
        border-radius: var(--radius-md, 12px);
        background: rgba(var(--white-rgb, 255,255,255), 0.8);
        color: var(--text-primary, #1f2a1c);
        outline: none;
        transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
      }
      .bamboo-license-gate .blg-input::placeholder { color: var(--text-tertiary, #a8b6a0); }
      .bamboo-license-gate .blg-input:hover { border-color: rgba(var(--bm-primary-rgb, 45,90,39), 0.4); }
      .bamboo-license-gate .blg-input:focus {
        border-color: var(--bm-primary, #2D5A27);
        background: rgba(var(--white-rgb, 255,255,255), 0.98);
        box-shadow: 0 0 0 3px rgba(var(--bm-primary-rgb, 45,90,39), 0.12);
      }
      .bamboo-license-gate .blg-btn {
        width: 100%; padding: 13px 14px;
        font-size: 15px; font-weight: 700;
        letter-spacing: 0.04em;
        border: none; border-radius: var(--radius-md, 12px); cursor: pointer;
        background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.06) 100%), var(--bm-primary, #2D5A27);
        color: #fff;
        box-shadow: 0 4px 12px rgba(var(--bm-primary-rgb, 45,90,39), 0.3);
        transition: transform .12s ease, box-shadow .18s ease, filter .18s ease;
      }
      .bamboo-license-gate .blg-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(var(--bm-primary-rgb, 45,90,39), 0.36);
        filter: brightness(1.05);
      }
      .bamboo-license-gate .blg-btn:disabled { opacity: .6; cursor: default; transform: none; filter: none; }
      .bamboo-license-gate .blg-msg { min-height: 18px; margin-top: 12px; font-size: 13px; }
      .bamboo-license-gate .blg-msg-error { color: var(--status-danger, #c0392b); }
      .bamboo-license-gate .blg-msg-ok { color: var(--bm-primary, #2D5A27); }
      .bamboo-license-gate .blg-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--bm-border, #d8e3d4), transparent);
        margin: 22px 0 18px;
      }
      .bamboo-license-gate .blg-backup { text-align: left; }
      .bamboo-license-gate .blg-backup > summary {
        list-style: none;
        cursor: pointer;
        font-size: 12px;
        color: var(--text-tertiary, #8a9684);
        text-align: center;
        transition: color .15s ease;
      }
      .bamboo-license-gate .blg-backup > summary:hover { color: var(--bm-primary, #2D5A27); }
      .bamboo-license-gate .blg-backup > summary::-webkit-details-marker { display: none; }
      .bamboo-license-gate .blg-backup[open] > summary { margin-bottom: 10px; }
      .bamboo-license-gate .blg-backup-input {
        width: 100%; box-sizing: border-box;
        padding: 11px 12px;
        font-size: 13px;
        border: 1px solid var(--bm-border, #d8e3d4);
        border-radius: var(--radius-md, 10px);
        background: rgba(var(--white-rgb, 255,255,255), 0.7);
        color: var(--text-primary, #1f2a1c);
        outline: none;
      }
      .bamboo-license-gate .blg-backup-input:focus { border-color: var(--bm-primary, #2D5A27); }
      .bamboo-license-gate .blg-backup-btn {
        width: 100%; margin-top: 8px;
        padding: 9px 12px;
        font-size: 13px; font-weight: 600;
        border: 1px solid var(--bm-border, #d8e3d4);
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        background: var(--bm-surface-1, #f4f7f2);
        color: var(--text-primary, #1f2a1c);
        transition: background .15s ease, border-color .15s ease;
      }
      .bamboo-license-gate .blg-backup-btn:hover { background: rgba(var(--bm-primary-rgb, 45,90,39), 0.08); border-color: rgba(var(--bm-primary-rgb, 45,90,39), 0.3); }
      .bamboo-license-gate .blg-backup-msg { min-height: 16px; margin-top: 8px; font-size: 12px; text-align: center; }
      .bamboo-license-gate .blg-backup-msg-error { color: var(--status-danger, #c0392b); }
      .bamboo-license-gate .blg-backup-msg-ok { color: var(--bm-primary, #2D5A27); }
      .bamboo-license-gate .blg-help {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-top: 22px;
        padding: 12px 14px;
        background: rgba(var(--bm-primary-rgb, 45,90,39), 0.06);
        border: 1px solid rgba(var(--bm-primary-rgb, 45,90,39), 0.10);
        border-radius: var(--radius-md, 12px);
        text-align: left;
      }
      .bamboo-license-gate .blg-help-icon { font-size: 18px; line-height: 1; flex-shrink: 0; }
      .bamboo-license-gate .blg-help-text {
        font-size: 12px;
        line-height: 1.55;
        color: var(--text-secondary, #5a6b54);
      }
      .bamboo-license-gate .blg-help-text strong { color: var(--bm-primary, #2D5A27); }
    `;
    sr.appendChild(gateStyle);

    // 1) 复制 <head> 中的样式表到 shadow，并移除 head 原 link（light DOM 仅剩 host，避免重复样式作用）
    // 1a) 复制 <link rel="stylesheet"> 到 shadow（AppHost 可能使用 blob URL，href 不限于 assets/styles/）
    const links = Array.from(
        document.querySelectorAll('head link[rel="stylesheet"]')
    );
    links.forEach((link) => sr.appendChild(link.cloneNode(true)));
    links.forEach((link) => link.remove());

    // 1b) 复制 <head> 中的 <style> 到 shadow（AppHost 内联 CSS 后需要）
    // 排除 shadowBootstrap 自己创建的 light-reset style
    const styles = Array.from(
        document.querySelectorAll('head style:not(#bamboo-light-reset)')
    );
    styles.forEach((style) => sr.appendChild(style.cloneNode(true)));
    styles.forEach((style) => style.remove());

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
