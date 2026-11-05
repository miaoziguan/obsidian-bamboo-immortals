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
];
const REMOVE_CLASSES = [
  'selected', 'editing', 'is-pinned', 'is-rotating', 'is-resizing',
  'tw-tools-below', 'tw-tools-raised', 'is-link-target',
];

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

function cloneForExport(card) {
  const w = card.offsetWidth || Math.round(card.getBoundingClientRect().width);
  const h = card.offsetHeight || Math.round(card.getBoundingClientRect().height);
  if (!w || !h) throw new Error('便签尺寸不可用');
  const clone = card.cloneNode(true);
  REMOVE_SELECTORS.forEach((sel) => clone.querySelectorAll(sel).forEach((el) => el.remove()));
  REMOVE_CLASSES.forEach((c) => clone.classList.remove(c));
  // 扶正导出：归零位移与旋转，避免包围盒裁切
  clone.style.left = '0px';
  clone.style.top = '0px';
  clone.style.removeProperty('--tw-drag-x');
  clone.style.removeProperty('--tw-drag-y');
  clone.style.setProperty('--tw-card-rot', '0deg');
  clone.style.setProperty('--tw-card-scale', '1');
  // 宽度规则挂在 :where(.tw-canvas.tw-mode-notes) 上，容器不可省
  const wrap = document.createElement('div');
  wrap.className = 'tw-canvas tw-mode-notes';
  wrap.style.cssText = 'position:relative;width:' + w + 'px;height:' + h + 'px;overflow:hidden;--tw-scale:1;';
  wrap.appendChild(clone);
  return { wrap, width: w, height: h };
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
  const cssText = rewriteHostSelectors(collectStyles());
  const hostCls = hostClasses();
  const xhtml = new XMLSerializer().serializeToString(wrap);
  const cw = Math.round(width * scale);
  const ch = Math.round(height * scale);

  // iOS WKWebView 上 viewBox 缩放 foreignObject 失效；改用「SVG/foreignObject
  // 均为放大后具体 px + 内层 1x 容器 transform:scale(S)」（真机探针 H 方案，已验证）。
  const inner =
    '<div xmlns="http://www.w3.org/1999/xhtml" class="bm-export-host ' + esc(hostCls) + '" ' +
    'style="width:' + cw + 'px;height:' + ch + 'px;position:relative;background:#fff;overflow:hidden">' +
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
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, 0, 0, cw, ch);
  const dataUrl = canvas.toDataURL('image/png');
  const comma = dataUrl.indexOf(',');
  if (comma < 0 || dataUrl.indexOf('data:image/png') !== 0) throw new Error('PNG 生成失败');
  return { base64: dataUrl.slice(comma + 1), width: cw, height: ch };
}
