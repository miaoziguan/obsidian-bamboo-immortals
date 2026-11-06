import { getShadowRoot } from '../../utils/domRef.js';

/**
 * 单张便签 → PNG（零依赖 SVG foreignObject）。
 *
 * 为什么不用 html2canvas：实测它对 shadowRoot 内注入的皮肤 `<style>` 与
 * `.tw-card-main::after` 的 base64 SVG 背景还原失败；foreignObject 是浏览器原生能力，
 * 在桌面 Chromium / 移动 UA / data: opaque origin 下像素级还原（见导出 PNG 兼容探针）。
 *
 * 2x 采用「无 viewBox + 内层 transform:scale(S)」写法：iOS WKWebView 上 viewBox
 * 缩放 foreignObject 不生效（内容只占左上 1/4），transform 方案实测正确。
 */

const REMOVE_SELECTORS = [
  '.tw-card-tools', '.tw-card-level', '.tw-card-resize', '.tw-card-rotate',
  '.tw-card-link', '.tw-links', '.tw-links-ctl',
  '.bm-sticker-rotate', '.bm-sticker-resize', '.bm-sticker-more', '.bm-sticker-menu',
  // 导出方式菜单平时挂在功能根元素，但万一将来移进卡片，截图里也不能留下它
  '.tw-png-menu',
];
const REMOVE_CLASSES = [
  'selected', 'editing', 'is-pinned', 'is-rotating', 'is-resizing',
  'tw-tools-below', 'tw-tools-raised', 'is-link-target',
];

/**
 * 导出容器隔离规则（追加在收集到的 CSS 末尾）。
 *
 * 背景：base.css 有宿主页级背景 —— `:host::after` 整页主题渐变、
 * `:host::before` 光影渐变、`:host { background: var(--surface-solid) }`。
 * rewriteHostSelectors 会把它们改写成 `.bm-export-host::after / ::before /
 * .bm-export-host`，而导出容器正好带这个 class，于是画布的深绿底色被画进 PNG。
 * 这里只清「导出容器自身」的背景与伪元素，不碰后代，卡片/皮肤样式完全不受影响。
 * !important 用于压过 `.bm-export-host.dark` 这类更高特异性的宿主规则。
 */
const EXPORT_ISOLATE_CSS = [
  '.bm-export-host {',
  '  background: transparent !important;',
  '  background-image: none !important;',
  '  box-shadow: none !important;',
  '  border: 0 !important;',
  '  outline: none !important;',
  '  min-height: 0 !important;',
  '  padding: 0 !important;',
  '  margin: 0 !important;',
  '}',
  '.bm-export-host::before, .bm-export-host::after {',
  '  content: none !important;',
  '  display: none !important;',
  '  background: transparent !important;',
  '  background-image: none !important;',
  '  box-shadow: none !important;',
  '  border: 0 !important;',
  '  opacity: 0 !important;',
  '}',
].join('\n');

/** XML 文本里只需转义这三个字符（CSS 里的 > 子选择器不能被吃掉） */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 收集渲染便签所需的全部 CSS。
 * 生产里 shadowBootstrap 会把 head 的 <style> 搬进 shadowRoot，运行时皮肤样式
 * （bm-paper-* / bm-font-*）也注入在 shadowRoot；head 兜底覆盖非 shadow / kill-switch 环境。
 */
function collectStyles() {
  const roots = [];
  const sr = getShadowRoot();
  if (sr) roots.push(sr);
  if (document.head) roots.push(document.head);
  const seen = new Set();
  const parts = [];
  roots.forEach((root) => {
    root.querySelectorAll('style').forEach((el) => {
      const text = el.textContent || '';
      if (!text || seen.has(text)) return;
      seen.add(text);
      parts.push(text);
    });
    // 非自包含环境（开发态 / blob 直载）可能仍有外链样式表
    root.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
      const sheet = el.sheet;
      if (!sheet) return;
      try {
        const rules = Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
        if (rules && !seen.has(rules)) { seen.add(rules); parts.push(rules); }
      } catch (e) { /* 跨域样式表不可读，跳过 */ }
    });
  });
  return parts.join('\n');
}

/**
 * `:host(...)` 在 foreignObject 的 light DOM 里不会命中，改写成 `.bm-export-host...`。
 * 用括号平衡扫描，兼容 `:host(.dark)` / `:host(:not(.dark))` / `:host(.dark.cls)` / 裸 `:host`。
 * 导出容器会挂上 shadow host 的真实 class 列表，因此各变体语义原样保留。
 */
function rewriteHostSelectors(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf(':host', i);
    if (at < 0) { out += css.slice(i); break; }
    // 避免误伤 `::host` 之类（CSS 无此写法，但保守跳过伪元素双冒号）
    if (at > 0 && css[at - 1] === ':') { out += css.slice(i, at + 5); i = at + 5; continue; }
    out += css.slice(i, at);
    let j = at + 5;
    if (css[j] === '(') {
      let depth = 1;
      j += 1;
      const start = j;
      while (j < css.length && depth > 0) {
        if (css[j] === '(') depth += 1;
        else if (css[j] === ')') depth -= 1;
        j += 1;
      }
      const inner = depth === 0 ? css.slice(start, j - 1) : '';
      if (!inner) { out += '.bm-export-host'; }
      else if (inner[0] === '.' || inner[0] === ':' || inner[0] === '#' || inner[0] === '[') {
        out += '.bm-export-host' + inner;
      } else {
        out += '.bm-export-host.' + inner;
      }
      i = j;
    } else {
      out += '.bm-export-host';
      i = j;
    }
  }
  return out;
}

/** shadow host 上的运行态 class（dark/theme-dark/platform-mobile/...）需同步到导出容器 */
function hostClasses() {
  const sr = getShadowRoot();
  const host = (sr && sr.host) || document.getElementById('bamboo-shadow-host');
  if (!host) return '';
  return Array.from(host.classList).filter((c) => c !== 'bamboo-shadow-host').join(' ');
}

/**
 * 测量附着贴纸溢出卡片边界的量。
 *
 * 贴纸是卡片子节点，用 left:%/top:em/width:% 本地定位，且可带旋转/翻转 transform，
 * 因此允许合法溢出卡片四周（notes.css 明确不给 .tw-card 加 overflow:hidden）。
 * 导出画布原先固定为卡片尺寸，会把溢出的贴纸切掉；这里用实测包围盒算出四边扩展量。
 *
 * 测量必须把克隆树挂进 shadowRoot（样式在 shadowRoot 内才生效），且用
 * getBoundingClientRect 才能包含贴纸自身的 transform。临时容器 visibility:hidden
 * 仍参与布局、不影响真实画布。
 */
function measureStickerOverflow(wrap, clone) {
  const stickers = clone.querySelectorAll('.bm-sticker');
  const zero = { left: 0, top: 0, right: 0, bottom: 0 };
  if (!stickers.length) return zero;
  const mount = getShadowRoot() || document.body;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;';
  probe.appendChild(wrap);
  mount.appendChild(probe);
  try {
    const base = clone.getBoundingClientRect();
    let l = 0, t = 0, r = 0, b = 0;
    stickers.forEach((el) => {
      const q = el.getBoundingClientRect();
      if (!q.width && !q.height) return;   // 未布局（如测试环境）→ 跳过
      l = Math.max(l, base.left - q.left);
      t = Math.max(t, base.top - q.top);
      r = Math.max(r, q.right - base.right);
      b = Math.max(b, q.bottom - base.bottom);
    });
    // 仅在确有溢出时扩展，另留 8px 容纳 drop-shadow / 抗锯齿
    const pad = (v) => (v > 0 ? Math.ceil(v) + 8 : 0);
    return { left: pad(l), top: pad(t), right: pad(r), bottom: pad(b) };
  } catch (e) {
    return zero;   // 测量不可用则退回原尺寸，不阻断导出
  } finally {
    probe.remove();
  }
}

function cloneForExport(card) {
  const w = card.offsetWidth || Math.round(card.getBoundingClientRect().width);
  const h = card.offsetHeight || Math.round(card.getBoundingClientRect().height);
  if (!w || !h) throw new Error('便签尺寸不可用');
  const clone = card.cloneNode(true);
  REMOVE_SELECTORS.forEach((sel) => clone.querySelectorAll(sel).forEach((el) => el.remove()));
  // 状态类可能挂在卡片内的贴纸上（.bm-sticker.selected 会画金色描边），
  // 只清根节点会把选中框带进 PNG；这里对整棵克隆树统一清理。
  [clone].concat(Array.from(clone.querySelectorAll('*'))).forEach((el) => {
    REMOVE_CLASSES.forEach((c) => el.classList.remove(c));
  });
  // 扶正导出：归零位移与旋转，避免包围盒裁切
  clone.style.removeProperty('--tw-drag-x');
  clone.style.removeProperty('--tw-drag-y');
  clone.style.setProperty('--tw-card-rot', '0deg');
  clone.style.setProperty('--tw-card-scale', '1');
  // 宽度规则挂在 :where(.tw-canvas.tw-mode-notes) 上，容器不可省
  const wrap = document.createElement('div');
  wrap.className = 'tw-canvas tw-mode-notes';
  wrap.style.cssText = 'position:relative;width:' + w + 'px;height:' + h + 'px;overflow:visible;--tw-scale:1;';
  wrap.appendChild(clone);

  // 先以卡片尺寸布局一次，测出贴纸溢出量，再扩展画布并平移卡片
  const pad = measureStickerOverflow(wrap, clone);
  const width = w + pad.left + pad.right;
  const height = h + pad.top + pad.bottom;
  clone.style.left = pad.left + 'px';
  clone.style.top = pad.top + 'px';
  wrap.style.width = width + 'px';
  wrap.style.height = height + 'px';
  return { wrap, width, height, pad };
}

/** data: SVG → Image（用 onload + 超时，不依赖 Image.decode，老 WebView 可能没有） */
function svgToImage(svg, timeoutMs) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; reject(new Error('图片渲染超时')); }
    }, timeoutMs || 10000);
    img.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve(img); } };
    img.onerror = () => { if (!done) { done = true; clearTimeout(timer); reject(new Error('SVG 渲染失败')); } };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/**
 * 生成 PNG 的纯 base64（不含 data URL 前缀）。
 * @param {HTMLElement} card 便签卡片 DOM
 * @param {{scale?:number}} [opts] scale 默认 2；1 表示 1x
 * @returns {Promise<{base64:string,width:number,height:number}>}
 */
export const exportCardPng = async (card, opts) => {
  if (!card) throw new Error('未找到便签');
  const scale = (opts && opts.scale) || 2;
  const { wrap, width, height } = cloneForExport(card);
  // 隔离规则必须追加在末尾：压过 :host 改写后落在导出容器上的页级背景
  const cssText = rewriteHostSelectors(collectStyles()) + '\n' + EXPORT_ISOLATE_CSS;
  const hostCls = hostClasses();
  const xhtml = new XMLSerializer().serializeToString(wrap);
  const cw = Math.round(width * scale);
  const ch = Math.round(height * scale);

  // iOS WKWebView 上 viewBox 缩放 foreignObject 失效；改用「SVG/foreignObject
  // 均为放大后具体 px + 内层 1x 容器 transform:scale(S)」（真机探针 H 方案，已验证）。
  // 透明底：皮肤设计稿本身是透明 + 柔边晕染（素材 css() 明写 background:transparent
  // 「必须透明：背景交给设计图，别盖掉它」），铺白底会盖掉设计意图。
  const inner =
    '<div xmlns="http://www.w3.org/1999/xhtml" class="bm-export-host ' + esc(hostCls) + '" ' +
    'style="width:' + cw + 'px;height:' + ch + 'px;position:relative;background:transparent;overflow:visible">' +
    '<div style="width:' + width + 'px;height:' + height + 'px;position:absolute;left:0;top:0;' +
    'transform:scale(' + scale + ');transform-origin:0 0">' +
    '<style>' + esc(cssText) + '</style>' + xhtml +
    '</div></div>';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + cw + '" height="' + ch + '">' +
    '<foreignObject x="0" y="0" width="' + cw + '" height="' + ch + '">' + inner + '</foreignObject>' +
    '</svg>';

  const img = await svgToImage(svg);
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2D 不可用');
  // 不铺白底：canvas 初始即全透明，皮肤柔边外的区域应保持 alpha=0
  ctx.drawImage(img, 0, 0, cw, ch);
  const dataUrl = canvas.toDataURL('image/png');
  const comma = dataUrl.indexOf(',');
  if (comma < 0 || dataUrl.indexOf('data:image/png') !== 0) throw new Error('PNG 生成失败');
  return { base64: dataUrl.slice(comma + 1), width: cw, height: ch };
}
