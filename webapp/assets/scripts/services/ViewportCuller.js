/**
 * ViewportCuller — 视口剔除 + 几何缓存 + 卡片挂载/卸载/资源释放 的单一职责模块。
 *
 * 从 TypewriterFeature 巨型单例（B1 解耦）中抽出的「视口与几何」子系统：
 *   · 连线端点几何（getGeom）、几何缓存失效/合帧重测（invalidateGeo* / flushGeo / measureCard / syncLayoutGeo）
 *   · 空间索引（seedSpatial / noteIndex / pinnedIds）
 *   · 卡片生命周期（mountCard / unmountCard / disposeCard / ensureCardVisible）
 *   · 视口剔除（updateCulling / scheduleCull）与超上限归档（enforceCap）
 *
 * 【解耦 B5 / 复盘 4.2 模块真解耦】本模块不再穿透 `this` 读写宿主状态：
 *   · 每个方法首参为 `ctx = { state, ctrl }`；
 *   · `state` 是 NotesState 单主实例（notes/geo/spatial/mountedCards/links/selected/canvasOffset/mode），
 *     模块对共享**数据**的全部读写都走 `state.*`（不穿透宿主）；
 *   · `ctrl` 是宿主（TypewriterFeature）显式传入的依赖：模块对宿主**行为/字段**的访问，回调走 `ctrl._xxx`
 *     （如 _scheduleRenderLinks / _createCardEl / _applyLod / _noteIndex…），宿主字段走 `ctrl._xxx`
 *     （如 _canvas / _restored / _zTop / _linkLayer …）；
 *   · 模块内部互相调用（measureCard→setGeom、updateCulling→mountCard…）一律 `this.method(ctx, …)`，
 *     跨子系统调用（mountCard→_createCardEl、updateCulling→_refreshWriteOrder）经 `ctrl._delegate` 回到宿主委托层。
 * 这样模块不再依赖 `this` 隐式等于宿主，数据真源在 NotesState、行为真源在宿主，二者皆显式注入。
 */
import { GeoCache } from './GeoCache.js';
import { SpatialIndex } from './SpatialIndex.js';
import { ModePolicy } from '../handlers/features/modePolicy.js';
import { fitCardText } from '../utils/cardTextFit.js';
import { paintCode } from '../utils/codeHighlight.js';

// ── 卡正文渲染（task → 可勾选清单；其余 → 纯文本）──────────────────────────────
// 放在本模块而非独立 util：卡片正文的唯一渲染入口就是 mountCard，同源好维护；
// 也因为测试 harness（testUtils.loadModule）会剥离 import，跨模块引用在测试里解析不到。
//
// 单一真源约定（与 WritingDoc.detectLevel 配套）：detectLevel 对 task 块**保留完整 markdown**
// （含 `- [ ]` / `- [x]` marker），故 note.text 即原始行；这里按行解析成勾选框，
// toggle 时回写 marker（CardInteractions.onTaskToggle），导出时原样透传（buildCardsMarkdown）。
export const TASK_LINE_RE = /^([-*])\s+\[([ xX])\]\s+(.*)$/;

// ── Markdown 行内格式（只做显示投影，绝不拼 innerHTML）────────────────────────
// note.text 是唯一真源，编辑态在 contenteditable 里改原始 markdown。这里把
// **粗体** / *斜体* / `代码` / ~~删除线~~ / ==高亮== / [文字](url) 解析成 DOM 节点
// （一律 createElement + textContent），既保留渲染效果，也不给用户笔记开注入面。
// 含格式的卡会打 data-tw-rich，编辑/拆卡路径据此改认模型，避免 innerText 把 markdown 写丢。
const INLINE_TOKENS = [
  { open: '`', close: '`', tag: 'code', raw: true },   // 代码内容原样，不再解析内层标记
  { open: '**', close: '**', tag: 'strong' },
  { open: '__', close: '__', tag: 'strong' },
  { open: '~~', close: '~~', tag: 'del' },
  { open: '==', close: '==', tag: 'mark' },
  { open: '%%', close: '%%', tag: 'span', cls: 'tw-md-comment', raw: true },
  { open: '*', close: '*', tag: 'em' },
  { open: '_', close: '_', tag: 'em' },
];
// 探测字符含 Obsidian A 类语法的前导符；无命中时整行仍走纯文本快路径
const INLINE_HINT_RE = /[`*_~=\[#%^]/;

/** 只放行安全 URL：无协议 = 相对路径；带协议的仅 http/https/mailto/tel。 */
function safeHref(raw) {
  const s = String(raw == null ? '' : raw).trim();
  if (!s || /[\u0000-\u001f]/.test(s)) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return /^(https?:|mailto:|tel:)/i.test(s) ? s : '';
  return s;
}

// ── 图片投影（![alt](src) / ![[img.png|300]]）───────────────────────────────────
// 单一真源仍是 note.text：卡上只投影成 <img>，序列化时把原始语法原样吐回。
// 这也是「图片不污染 md」的关键 —— 绝不按投影重拼 `![alt](src)`（alt/title/尺寸都可能漂）。
const IMG_EXT_RE = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i;
// 图片渲染走宿主 file:readImage 拿 data URL：画中卷跑在 data: iframe 里，
// 拼不出能加载的 app:// 资源地址，而 data URL 与该 iframe 同源，必然能显示。
const IMG_CACHE = new Map();     // 路径 → data URL（同一张图只过桥一次）
const IMG_PENDING = new Map();   // 路径 → Promise（并发挂多张卡时去重）
const IMG_MISSING = new Set();   // 读不到的路径：不再反复请求
const IMG_CACHE_MAX = 24;

/** 图片地址白名单：相对路径 / http(s) / data:image / app:；其余（javascript: 等）不投影。 */
function safeImgSrc(raw) {
  const s = String(raw == null ? '' : raw).trim();
  if (!s || /[\u0000-\u001f]/.test(s)) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) {
    return /^(https?:|data:image\/|app:)/i.test(s) ? s : '';
  }
  return s;
}

/** 解析 i 处的图片语法；不是图片返回 null（end 为「语法之后」的下标）。 */
function parseImageAt(str, i) {
  // Obsidian 嵌入 ![[img.png]] / ![[img.png|300]]
  if (str.startsWith('![[', i)) {
    const end = str.indexOf(']]', i + 3);
    if (end < 0) return null;
    const inner = str.slice(i + 3, end);
    if (!inner || /[\n\[\]]/.test(inner)) return null;
    const pipe = inner.indexOf('|');
    const src = (pipe >= 0 ? inner.slice(0, pipe) : inner).trim();
    const size = pipe >= 0 ? inner.slice(pipe + 1).trim() : '';
    // 只认图片扩展名：![[某篇笔记]] 是转写嵌入，交给原样文本，不能当图片吃掉
    if (!src || !IMG_EXT_RE.test(src)) return null;
    return {
      raw: str.slice(i, end + 2),
      alt: src.slice(src.lastIndexOf('/') + 1),
      src: safeImgSrc(src),
      width: /^\d+$/.test(size) ? Number(size) : 0,
      end: end + 2,
    };
  }
  // 标准 Markdown ![alt](src "title")
  if (str.charAt(i + 1) !== '[') return null;
  const mid = str.indexOf('](', i + 2);
  if (mid < 0) return null;
  const alt = str.slice(i + 2, mid);
  if (/[\n\[\]]/.test(alt)) return null;
  const end = str.indexOf(')', mid + 2);
  if (end < 0) return null;
  let inner = str.slice(mid + 2, end).trim();
  let title = '';
  const tm = /^(.*?)\s+["']([^"']*)["']$/.exec(inner);   // 可选 title：path "标题"
  if (tm) { inner = tm[1].trim(); title = tm[2]; }
  if (inner.startsWith('<') && inner.endsWith('>')) inner = inner.slice(1, -1);
  const src = safeImgSrc(inner);
  if (!src) return null;
  return { raw: str.slice(i, end + 1), alt, src, title, width: 0, end: end + 1 };
}

function imageStore() {
  if (typeof window === 'undefined') return null;
  const sm = window.storageManager;
  return (sm && typeof sm.readVaultImage === 'function') ? sm : null;
}

/** 懒加载图片内容：先给空 src，读到 data URL 再填；读不到只标破图，不动 md。 */
function loadCardImage(img, src) {
  if (/^(https?:|data:|app:)/i.test(src)) { img.src = src; return; }
  const store = imageStore();
  if (!store) return;                       // 单测 / 宿主未接线：只留 data-md-raw，序列化照旧
  if (IMG_MISSING.has(src)) { img.classList.add('tw-md-img-broken'); return; }
  const cached = IMG_CACHE.get(src);
  if (cached) { img.src = cached; return; }
  let pending = IMG_PENDING.get(src);
  if (!pending) {
    pending = store.readVaultImage(src).then((data) => data || '').catch(() => '');
    IMG_PENDING.set(src, pending);
  }
  pending.then((data) => {
    IMG_PENDING.delete(src);
    if (!data) { IMG_MISSING.add(src); img.classList.add('tw-md-img-broken'); return; }
    if (IMG_CACHE.size >= IMG_CACHE_MAX) {
      const oldest = IMG_CACHE.keys().next().value;
      IMG_CACHE.delete(oldest);
    }
    IMG_CACHE.set(src, data);
    img.src = data;
  });
}

/** 一张图片 → <img>；所有原始信息留在 data-md-raw，序列化原样还原。 */
function buildImageNode(info) {
  const img = document.createElement('img');
  img.className = 'tw-md-img';
  img.dataset.mdRaw = info.raw;
  img.setAttribute('alt', info.alt || '');
  if (info.width) img.style.setProperty('max-width', info.width + 'px', 'important');
  // 破图 / 未加载时也要占位，避免整行塌掉（尺寸真源由 CSS 按字号给）
  img.addEventListener('error', () => { img.classList.add('tw-md-img-broken'); });
  // 图片是异步解码的：加载完按真实高度重新适配字号（定框纸样才需要，自适应纸样自带 no-op）
  img.addEventListener('load', () => {
    const card = typeof img.closest === 'function' ? img.closest('.tw-card') : null;
    if (card) { try { fitCardText(card); } catch (_) { /* 布局未就绪时忽略 */ } }
  });
  loadCardImage(img, info.src);
  return img;
}

/** 把一行文本的行内标记解析进 parent；返回是否真的生成了元素（纯文本返回 false）。 */
function appendInline(parent, text) {
  const str = String(text == null ? '' : text);
  let buf = '';
  let formatted = false;
  const flush = () => {
    if (buf) { parent.appendChild(document.createTextNode(buf)); buf = ''; }
  };
  for (let i = 0; i < str.length;) {
    // 图片 ![alt](src) / ![[img.png|300]]：投影成 <img>，序列化原样吐回原始语法。
    // 必须排在双链 / 链接之前：`![[` 与 `![](` 都以 `!` 开头，先到先得。
    if (str.charAt(i) === '!' && str.charAt(i + 1) === '[') {
      const info = parseImageAt(str, i);
      if (info) {
        flush();
        parent.appendChild(buildImageNode(info));
        formatted = true;
        i = info.end;
        continue;
      }
    }
    // 链接 [文字](url)：标签保持纯文本，避免嵌套解析的歧义
    if (str.charAt(i) === '[') {
      const mid = str.indexOf('](', i + 1);
      const end = mid > i + 1 ? str.indexOf(')', mid + 2) : -1;
      const label = mid > i + 1 ? str.slice(i + 1, mid) : '';
      const href = end > mid ? safeHref(str.slice(mid + 2, end)) : '';
      if (href && label && label.indexOf('\n') < 0) {
        flush();
        const a = document.createElement('a');
        a.textContent = label;
        a.setAttribute('href', href);
        a.setAttribute('rel', 'noopener noreferrer');
        parent.appendChild(a);
        formatted = true;
        i = end + 1;
        continue;
      }
    }
    // [[双链]] / [[note|alias]]：不可点（卡片画布上点击会触发拖拽/进编辑）。
    // ![[img.png]] 属图片（见上），非图片的 ![[嵌入]]（转写笔记/块）保持原文不投影。
    if (str.startsWith('[[', i) && !(i > 0 && str.charAt(i - 1) === '!')) {
      const end = str.indexOf(']]', i + 2);
      if (end > i + 2) {
        const inner = str.slice(i + 2, end);
        if (!/[\n\[\]]/.test(inner)) {
          const pipe = inner.indexOf('|');
          const note = pipe >= 0 ? inner.slice(0, pipe) : inner;
          const label = pipe >= 0 ? inner.slice(pipe + 1) : inner;
          flush();
          const span = document.createElement('span');
          span.className = 'tw-md-wikilink';
          span.dataset.note = note;
          span.textContent = label;
          parent.appendChild(span);
          formatted = true;
          i = end + 2;
          continue;
        }
      }
    }
    // #tag（`# ` 后跟空格是 ATX 标题，不匹配）
    if (str.charAt(i) === '#' && (i === 0 || !/[\w\u4e00-\u9fa5]/.test(str.charAt(i - 1)))) {
      const m = /^#[\w\u4e00-\u9fa5\/-]+/.exec(str.slice(i));
      if (m) {
        flush();
        const span = document.createElement('span');
        span.className = 'tw-md-tag';
        span.textContent = m[0];
        parent.appendChild(span);
        formatted = true;
        i += m[0].length;
        continue;
      }
    }
    // ^块ID：行尾引用标记，淡显
    if (str.charAt(i) === '^' && (i === 0 || /\s/.test(str.charAt(i - 1)))) {
      const m = /^\^[\w-]+/.exec(str.slice(i));
      if (m) {
        flush();
        const span = document.createElement('span');
        span.className = 'tw-md-blockid';
        span.textContent = m[0];
        parent.appendChild(span);
        formatted = true;
        i += m[0].length;
        continue;
      }
    }
    let hit = null;
    for (let k = 0; k < INLINE_TOKENS.length; k += 1) {
      const t = INLINE_TOKENS[k];
      if (str.slice(i, i + t.open.length) !== t.open) continue;
      // 下划线在词内不是强调（GFM 规则，且本项目Webview不宜用后行断言）
      if (t.open.charAt(0) === '_' && i > 0 && /[\w\u4e00-\u9fa5]/.test(str.charAt(i - 1))) continue;
      const end = str.indexOf(t.close, i + t.open.length);
      if (end < 0) continue;
      const inner = str.slice(i + t.open.length, end);
      if (!inner.trim() || inner.indexOf('\n') >= 0) continue;
      if (t.open.length === 1 && /\s/.test(inner.charAt(0) + inner.charAt(inner.length - 1))) continue;
      hit = { t, end, inner };
      break;
    }
    if (!hit) { buf += str.charAt(i); i += 1; continue; }
    flush();
    const el = document.createElement(hit.t.tag);
    if (hit.t.cls) el.className = hit.t.cls;
    if (hit.t.raw) el.textContent = hit.inner;
    else appendInline(el, hit.inner);            // 递归：粗体里还能套行内代码/斜体
    parent.appendChild(el);
    formatted = true;
    i = hit.end + hit.t.close.length;
  }
  flush();
  return formatted;
}

/** 一行 → DocumentFragment；无任何行内格式时返回 null，让调用方走纯文本快路径。 */
function inlineNodes(line) {
  if (!INLINE_HINT_RE.test(line)) return null;
  const frag = document.createDocumentFragment();
  return appendInline(frag, line) ? frag : null;
}

/** 多行按原换行渲染进 parent（用 <br> 保持 justify 的同一文本流，不改变原有排版）。 */
function appendInlineLines(parent, lines) {
  const frags = lines.map(inlineNodes);
  const rich = frags.some(Boolean);
  lines.forEach((line, k) => {
    if (k) parent.appendChild(document.createElement('br'));
    if (frags[k]) parent.appendChild(frags[k]);
    else parent.appendChild(document.createTextNode(line));
  });
  return rich;
}

/** 纯函数：正文是否含可解析的行内格式（渲染分支判断 + 单测用）。 */
export function hasInlineMarkdown(raw) {
  return String(raw == null ? '' : raw).split('\n').some((line) => inlineNodes(line) !== null);
}

export function renderTaskText(textEl, raw) {
  textEl.innerHTML = '';
  String(raw == null ? '' : raw).split('\n').forEach((line, i) => {
    const m = TASK_LINE_RE.exec(line);
    if (m) {
      // 必须是 div，不能用 <label>：<label> 会把点击 / 焦点转交给内部第一个表单控件（复选框），
      // 编辑态点进任务项想打字时键盘输入被 checkbox 吃掉，字压根进不了 DOM ——
      // 表现就是「新建项打了字，退出编辑直接没了」。点文字勾选改由事件委托补回。
      const row = document.createElement('div');
      row.className = 'tw-task-row';
      row.dataset.line = String(i);          // 行号：toggle 时据此回写 note.text 对应行
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'tw-task-cb';
      // 尺寸真源：inline + !important。
      // 类规则（em / calc(var()) / min() / 裸 px + 四道锁）前四版都没能改变视觉尺寸 ——
      // input[type=checkbox] 的 UA 内置样式与主题重写压过了类声明，改系数永远输。
      // inline !important 只受 UA 约束；em 相对卡正文实际字号（含 fitCardText 缩小），
      // 所以勾选框恒小于文字、并随画布缩放同比，不会出现「圆比字大」。
      [
        'width:0.9em', 'height:0.9em',
        'min-width:0', 'max-width:none', 'min-height:0', 'max-height:none',
        'flex:0 0 auto', 'margin:0', 'padding:0', 'box-sizing:border-box',
        'border-radius:50%', 'font-size:1em',
        'appearance:none', '-webkit-appearance:none',
      ].forEach((decl) => {
        const i = decl.indexOf(':');
        try { cb.style.setProperty(decl.slice(0, i), decl.slice(i + 1), 'important'); } catch (_) { /* 老内核不支持则忽略 */ }
      });
      const done = m[2].toLowerCase() === 'x';
      cb.checked = done;
      // 光标不该进复选框：进了就被当成文本节点，序列化时按「非勾选框内容」处理会串味
      cb.setAttribute('contenteditable', 'false');
      const span = document.createElement('span');
      span.className = 'tw-task-label';
      const labelFrag = inlineNodes(m[3]);
      if (labelFrag) span.appendChild(labelFrag); else span.textContent = m[3];
      row.appendChild(cb);
      row.appendChild(span);
      if (done) row.classList.add('done');
      textEl.appendChild(row);
    } else {
      const div = document.createElement('div');
      div.className = 'tw-task-line';
      const lineFrag = inlineNodes(line);
      if (lineFrag) div.appendChild(lineFrag); else div.textContent = line;
      textEl.appendChild(div);
    }
  });
}

// ── Markdown 表格投影（GFM：表头行 + |---|---| 分隔行 + 数据行）────────────────
// 单一真源仍是 note.text：这里只做「显示投影」，不改模型、不改导出、不改拆块。
// 单元格一律 textContent，绝不拼 innerHTML —— 便签内容来自用户笔记，不能引入注入面。
// 投影后的 DOM 的 innerText 不含 `|`/`---`，故给 textEl 打 data-tw-rich 标记，
// 编辑态与拆卡路径据此改用模型文本，避免把投影写坏回 note.text。
const TABLE_DELIM_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const hasPipe = (line) => line.indexOf('|') >= 0;
// 分隔行也必须含 |：否则正文里一条水平线 `---`（上一行恰好写了 a | b）会被误判成单列表格。
const isTableDelim = (line) => hasPipe(line) && TABLE_DELIM_RE.test(line);

// GFM 围栏代码块：与 writingDoc 的成块判定同源。闭合行同字符、长度不小于开围栏、不带语言标记。
const FENCE_LINE_RE = /^\s*(`{3,}|~{3,})(.*)$/;
function isFenceCloseLine(line, mark) {
  const m = FENCE_LINE_RE.exec(line);
  return !!(m && m[1].charAt(0) === mark.charAt(0)
    && m[1].length >= mark.length && !m[2].trim());
}

/** 纯函数：正文是否含围栏代码块（渲染分支判断 + 单测用）。 */
export function hasCodeFence(raw) {
  return String(raw == null ? '' : raw).split('\n').some((line) => FENCE_LINE_RE.test(line));
}

function splitTableRow(line) {
  let s = String(line).trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  // [[note|alias]] 里的 | 是 wikilink 语法，不是列分隔符：先占位再拆，避免把链接拆成两格
  const links = [];
  s = s.replace(/\[\[[^\]]*\]\]/g, (m) => {
    links.push(m);
    return '\u0001' + (links.length - 1) + '\u0001';
  });
  return s.split('|').map((cell) => cell.trim()
    .replace(/\u0001(\d+)\u0001/g, (_, k) => links[Number(k)] || ''));
}

/** 纯函数：文本是否含标准 Markdown 表格（渲染分支判断 + 单测用）。 */
export function hasMarkdownTable(raw) {
  const lines = String(raw == null ? '' : raw).split('\n');
  return lines.some((line, i) => i > 0 && isTableDelim(line) && hasPipe(lines[i - 1]));
}

function cellAlign(spec) {
  if (spec.startsWith(':') && spec.endsWith(':')) return 'center';
  if (spec.endsWith(':')) return 'right';
  return 'left';
}

function appendCell(row, value, align, tag) {
  const cell = document.createElement(tag);
  const frag = inlineNodes(value);
  if (frag) cell.appendChild(frag); else cell.textContent = value;
  if (align !== 'left') cell.style.textAlign = align;
  row.appendChild(cell);
}

/** 含表格的正文 → 「文本段 + <table>」混合内容；非表格行原样保留换行。 */
export function renderRichText(textEl, raw) {
  const lines = String(raw == null ? '' : raw).split('\n');
  textEl.innerHTML = '';
  let buf = [];
  const flush = () => {
    if (!buf.length) return;
    const div = document.createElement('div');
    div.className = 'tw-md-text';
    appendInlineLines(div, buf);
    textEl.appendChild(div);
    buf = [];
  };
  for (let i = 0; i < lines.length;) {
    // 围栏代码块：内容原样，不做行内解析（代码里的 ** / ` 都不是格式）
    const fence = FENCE_LINE_RE.exec(lines[i]);
    if (fence) {
      flush();
      let j = i + 1;
      while (j < lines.length && !isFenceCloseLine(lines[j], fence[1])) j += 1;
      const pre = document.createElement('pre');
      pre.className = 'tw-md-code';
      const lang = (fence[2] || '').trim();
      if (lang) pre.dataset.lang = lang;
      const code = document.createElement('code');
      code.textContent = lines.slice(i + 1, j).join('\n');
      pre.appendChild(code);
      textEl.appendChild(pre);
      // 语法着色（纯投影：只包 <span class="tk-*">，文本一个字符都不改，序列化照旧逐字吐回）。
      // 必须挂在 appendChild 之后：paintCode 靠 closest('[contenteditable=true]') 判断「正在编辑」，
      // 脱离文档时判断不到，编辑中的重投影就会把 span 塞回正在改的代码块。
      // typeof 守卫：测试 harness 剥离 import 后拿不到该函数，降级为纯文本即可，不影响断言。
      if (typeof paintCode === 'function') paintCode(code, code.textContent, lang);
      i = (j < lines.length) ? j + 1 : lines.length;   // 未闭合也渲染到末尾
      continue;
    }
    if (i + 1 < lines.length && hasPipe(lines[i]) && isTableDelim(lines[i + 1])) {
      flush();
      const aligns = splitTableRow(lines[i + 1]).map(cellAlign);
      const table = document.createElement('table');
      table.className = 'tw-md-table';
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      splitTableRow(lines[i]).forEach((v, k) => appendCell(headRow, v, aligns[k] || 'left', 'th'));
      thead.appendChild(headRow);
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      i += 2;
      while (i < lines.length && lines[i].trim() && hasPipe(lines[i]) && !isTableDelim(lines[i])) {
        const tr = document.createElement('tr');
        splitTableRow(lines[i]).forEach((v, k) => appendCell(tr, v, aligns[k] || 'left', 'td'));
        tbody.appendChild(tr);
        i += 1;
      }
      if (tbody.childNodes.length) table.appendChild(tbody);
      textEl.appendChild(table);
      continue;
    }
    buf.push(lines[i]);
    i += 1;
  }
  flush();
}

/** 生成一行列表 DOM（bullet / 编号 + 缩进层级），供列表卡与「引用内列表」共用。 */
function makeListRow(line, kind) {
  const indentRaw = (/^[ \t]*/.exec(line) || [''])[0];
  const depth = Math.floor(indentRaw.replace(/\t/g, '  ').length / 2);
  const body = line.slice(indentRaw.length);
  const m = /^([-*]|\d+[.)])\s+(.*)$/.exec(body);
  const row = document.createElement('div');
  row.className = 'tw-md-list';
  // inline !important：本环境 calc(var()) 的深度换算不可靠，且不能被类规则盖掉
  if (depth) {
    row.style.setProperty('padding-left', (depth * 1.2) + 'em', 'important');
    row.dataset.indent = indentRaw;   // 无语法编辑回写时精确还原原始缩进宽度，不被量化成 2 空格
  }
  const marker = document.createElement('span');
  marker.className = 'tw-md-marker';
  marker.textContent = kind === 'ul' ? '•' : (m ? m[1] : '');
  // marker 是结构装饰（bullet / 编号），序列化时会被跳过：
  // 光标一旦点进去打字，那些字写完就丢。直接禁止光标进入。
  marker.setAttribute('contenteditable', 'false');
  row.appendChild(marker);
  const content = m ? m[2] : body;
  const frag = inlineNodes(content);
  if (frag) row.appendChild(frag);
  else row.appendChild(document.createTextNode(content));
  return row;
}

/**
 * 引用块投影：逐行剥掉 `> `，交给 CSS 画竖线；行内若还有列表 marker，走同一套列表投影
 * （否则引用内列表会露出 `- ` 原始字符）。投影丢了语法，故调用方必须打 data-tw-rich。
 */
function renderQuoteText(textEl, raw) {
  const lines = String(raw == null ? '' : raw).split('\n');
  textEl.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'tw-md-quote';
  let needBreak = false;
  lines.forEach((line) => {
    const body = line.replace(/^\s*>\s?/, '');
    // Obsidian callout 标题 `> [!note] 标题`：渲染成带类型徽标的块头，纯视觉
    const callout = /^\[!([^\]]+)\]\s*(.*)$/.exec(body);
    if (callout) {
      const head = document.createElement('div');
      head.className = 'tw-md-callout';
      head.dataset.type = callout[1].toLowerCase();
      const badge = document.createElement('span');
      badge.className = 'tw-md-callout-badge';
      badge.textContent = callout[1];
      // 徽标是纯视觉（类型由 dataset.type 还原，序列化时被跳过）：
      // 光标一旦点进去打字，那些字退出编辑就被当装饰丢掉。禁止光标进入。
      badge.setAttribute('contenteditable', 'false');
      head.appendChild(badge);
      const title = callout[2];
      const frag = inlineNodes(title);
      if (frag) head.appendChild(frag);
      else if (title) head.appendChild(document.createTextNode(title));
      box.appendChild(head);
      needBreak = false;
      return;
    }
    const m = /^([-*]|\d+[.)])\s+/.exec(body);
    if (m) {
      // 块级列表行自带换行，前后都不需要 <br>
      box.appendChild(makeListRow(body, /^\d/.test(m[1]) ? 'ol' : 'ul'));
      needBreak = false;
      return;
    }
    if (needBreak) box.appendChild(document.createElement('br'));
    const frag = inlineNodes(body);
    if (frag) box.appendChild(frag);
    else box.appendChild(document.createTextNode(body));
    needBreak = true;
  });
  textEl.appendChild(box);
}

/** 列表卡投影：把 `- ` / `1. ` 换成 bullet / 编号，按缩进量给层级。 */
function renderListText(textEl, raw, kind) {
  const lines = String(raw == null ? '' : raw).split('\n');
  // 文末换行不产生可见空行；中间空行必须留住 —— 那是用户排的段间距，
  // 丢了每次进出编辑都会把 md 改回紧凑列表（md 是唯一真源，不能悄悄改写它）。
  while (lines.length > 1 && !lines[lines.length - 1].trim()) lines.pop();
  textEl.innerHTML = '';
  lines.forEach((line) => {
    if (!line.trim()) {
      const gap = document.createElement('div');
      gap.className = 'tw-md-gap';
      gap.setAttribute('contenteditable', 'false');
      textEl.appendChild(gap);
      return;
    }
    textEl.appendChild(makeListRow(line, kind));
  });
}

// 卡正文统一渲染入口：task → 勾选清单；quote → 引用块；ul/ol → 列表投影；
// 表格/围栏 → 块渲染；行内格式 → DOM 节点；其余纯文本保持 textContent 快路径。
export function renderCardText(textEl, note) {
  const raw = (typeof (note && note.text) === 'string') ? note.text : '';
  if (note && note.level === 'task') {
    renderTaskText(textEl, raw);
    textEl.dataset.twRich = '1';
  } else if (note && note.level === 'quote') {
    renderQuoteText(textEl, raw);
    textEl.dataset.twRich = '1';
  } else if (note && (note.level === 'ul' || note.level === 'ol')) {
    renderListText(textEl, raw, note.level);
    textEl.dataset.twRich = '1';
  } else if (hasMarkdownTable(raw) || hasCodeFence(raw)) {
    renderRichText(textEl, raw);       // 统一块渲染：表格 / 围栏代码 / 文本段
    textEl.dataset.twRich = '1';
  } else {
    const lines = String(raw).split('\n');
    const frags = lines.map(inlineNodes);
    if (frags.some(Boolean)) {
      // 用 <br> 而非逐行 div：保留 .tw-card-text 的 justify 同一文本流，排版不变
      textEl.innerHTML = '';
      lines.forEach((line, k) => {
        if (k) textEl.appendChild(document.createElement('br'));
        if (frags[k]) textEl.appendChild(frags[k]);
        else textEl.appendChild(document.createTextNode(line));
      });
      textEl.dataset.twRich = '1';
    } else {
      textEl.textContent = raw;
      delete textEl.dataset.twRich;
    }
  }
}

// ── 无语法编辑：投影 DOM → markdown 反向序列化 ──────────────────────────────
// 编辑态直接编辑投影（不露 `**` / `|` / `> ` 等语法），连续输入与退出编辑时把 DOM
// 还原成合法 markdown 写回模型。容错原则：未知标签当透明容器递归、未知文本原样保留，
// 因为 contenteditable 可能自行插入 <div>/<span>/<font>。
function serNode(n) {
  if (n.nodeType === 3) return n.nodeValue || '';
  if (n.nodeType !== 1) return '';
  if (n.tagName === 'BR') return '\n';
  const cls = String(n.className || '');
  // callout 徽标是纯视觉，类型由 dataset.type 还原，任何文字都不算正文
  if (/\btw-md-callout-badge\b/.test(cls)) return '';
  if (/\btw-md-marker\b/.test(cls)) {
    // 正常情况 marker 里只有 bullet / 编号，属于结构层还原，返回空；
    // 但光标若钻进去打了字，那些字必须保留，不能被当装饰一起丢掉。
    const inner = Array.from(n.childNodes).map(serNode).join('');
    return /^[•·*-]$|^\d+[.)]$/.test(inner.trim()) ? '' : inner;
  }
  // 图片：原样吐回进入编辑时的那段语法（`![](a.png "标题")` / `![[a.png|300]]`）。
  // 绝不按投影重拼 —— 那是唯一能保证「图片语法不被编辑动作改坏」的做法。
  if (n.tagName === 'IMG') {
    const raw = n.dataset ? n.dataset.mdRaw : '';
    if (raw) return raw;
    // 不是投影出来的图（例如浏览器原生粘贴塞进来的 <img>）：只保留可复现的地址
    const alt = n.getAttribute('alt') || '';
    const src = n.getAttribute('src') || '';
    return /^(https?:|data:image\/)/i.test(src) ? '![' + alt + '](' + src + ')' : '';
  }
  const inner = Array.from(n.childNodes).map(serNode).join('');
  if (n.tagName === 'STRONG' || n.tagName === 'B') return '**' + inner + '**';
  if (n.tagName === 'EM' || n.tagName === 'I') return '*' + inner + '*';
  // execCommand('strikeThrough') 产出的是 <strike>：不认它，删除线会在写回模型这一步被丢掉
  if (n.tagName === 'DEL' || n.tagName === 'S' || n.tagName === 'STRIKE') return '~~' + inner + '~~';
  if (n.tagName === 'MARK') return '==' + inner + '==';
  if (n.tagName === 'CODE') return '`' + inner + '`';
  if (n.tagName === 'A') return '[' + inner + '](' + (n.getAttribute('href') || '') + ')';
  if (/\btw-md-comment\b/.test(cls)) return '%%' + inner + '%%';
  if (/\btw-md-wikilink\b/.test(cls)) {
    const target = n.dataset.note || inner;
    return '[[' + target + (inner !== target ? '|' + inner : '') + ']]';
  }
  // contenteditable 里回车插入的是 <div>/<p>（不是 <br>）：不还原换行，整段多段文本会被压成一行。
  // 结构化块（.tw-md-text / .tw-md-quote）的换行由外层块逻辑补，这里排除以免多出空行。
  if (/^(DIV|P)$/.test(n.tagName) && !/\btw-md-text\b|\btw-md-quote\b/.test(cls)) {
    return inner + (inner && !/\n$/.test(inner) ? '\n' : '');
  }
  return inner;   // tag / blockid 的文本本身即语法，原样保留
}

const serChildren = (el) => Array.from(el.childNodes).map(serNode).join('');

function serTable(table) {
  const trs = Array.from(table.querySelectorAll('tr'));
  if (!trs.length) return '';
  // GFM 单元格内不能有换行（会把表格整段断开）：contenteditable 回车产生的 <br>/<div>
  // 在这里统一压成空格，而不是留给 markdown 去解析。
  const cells = (tr) => Array.from(tr.children)
    .map((c) => serChildren(c).replace(/\s*\n+\s*/g, ' ').trim());
  const aligns = Array.from(trs[0].children).map((th) => {
    const a = th.style.textAlign;
    return a === 'center' ? ':---:' : a === 'right' ? '---:' : '---';
  });
  const line = (arr) => '| ' + arr.join(' | ') + ' |';
  // 分隔行不带空格，与常见 GFM 写法一致，避免每次编辑都产生格式漂移
  return [line(cells(trs[0])), '|' + aligns.join('|') + '|']
    .concat(trs.slice(1).map((tr) => line(cells(tr))))
    .join('\n');
}

/* contenteditable 里的换行在 DOM 里是 <br> 或 <div>，textContent 一格都不含：
   在代码块里回一次车再退出编辑，多行代码就被压成一行。这里按节点还原换行。 */
function serPreText(root) {
  let out = '';
  const walk = (n) => {
    if (n.nodeType === 3) { out += n.nodeValue || ''; return; }
    if (n.nodeType !== 1) return;
    if (n.tagName === 'BR') { out += '\n'; return; }
    if (/^(DIV|P)$/.test(n.tagName) && out && !/\n$/.test(out)) out += '\n';
    Array.from(n.childNodes).forEach(walk);
  };
  Array.from(root.childNodes).forEach(walk);
  return out;
}

function serPre(pre) {
  const code = pre.querySelector('code') || pre;
  return '```' + (pre.dataset.lang || '') + '\n'
    + serPreText(code).replace(/\n+$/, '') + '\n```';
}

function serQuote(box) {
  const lines = [];
  let buf = '';
  // serNode 对回车产生的 <div>/<p> 会在末尾补 \n，这里去掉，否则每段之后多出一个空行
  const flush = () => { const s = buf.replace(/\n+$/, ''); buf = ''; if (s) lines.push('> ' + s); };
  Array.from(box.childNodes).forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'BR') { flush(); return; }
    if (n.nodeType === 1 && n.classList.contains('tw-md-callout')) {
      flush();
      lines.push('> [!' + (n.dataset.type || 'note') + '] ' + serChildren(n).trim());
      return;
    }
    if (n.nodeType === 1 && n.classList.contains('tw-md-list')) {
      flush();
      const marker = n.querySelector('.tw-md-marker');
      const mt = marker ? marker.textContent : '';
      lines.push('> ' + (/^\d/.test(mt) ? mt + ' ' : '- ') + serChildren(n).trim());
      return;
    }
    // 浏览器在引用块里回车会插入 <div> 而不是 <br>：不先 flush 的话多段引用会被压成一行
    if (n.nodeType === 1 && (n.tagName === 'DIV' || n.tagName === 'P')) flush();
    buf += serNode(n);
  });
  flush();
  return lines.join('\n');
}

/** 把当前投影 DOM 序列化回 markdown（无语法编辑的写回口径）。 */
export function serializeRichText(textEl, note) {
  const level = note && note.level;
  if (level === 'task') {
    return Array.from(textEl.childNodes).map((row) => {
      // 兜底：万一有裸文本节点落在容器上（光标被重置后打进来的字），不能静默丢弃，
      // 否则用户新建任务项、打完字一退出编辑，字就整段消失。
      if (row.nodeType === 3) return row.nodeValue;
      if (row.nodeType !== 1) return '';
      if (row.classList.contains('tw-task-row')) {
        const cb = row.querySelector('.tw-task-cb');
        // 光标在 contenteditable 里可以落在行容器任意位置（复选框后的间隙、行尾），
        // 那些文字不在 .tw-task-label 内 —— 只读 label 会静默丢弃，
        // 表现为「打字时看得见，退出编辑就没了」。除复选框外整行内容都归这一项。
        const box = row.cloneNode(true);
        const cbClone = box.querySelector('.tw-task-cb');
        if (cbClone && cbClone.parentNode) cbClone.parentNode.removeChild(cbClone);
        const txt = serChildren(box).replace(/\n+/g, ' ').trim();
        return (cb && cb.checked ? '- [x] ' : '- [ ] ') + txt;
      }
      return serChildren(row);
    }).join('\n');
  }
  if (level === 'ul' || level === 'ol') {
    const serializeRow = (row) => {
      const pl = parseFloat(row.style.getPropertyValue('padding-left')) || 0;
      const depth = Math.max(0, Math.round(pl / 1.2));
      // 优先用投影时存下的原始缩进宽度（含 3 空格这类非 2 倍数），否则按层级回推
      const indent = row.dataset.indent !== undefined ? row.dataset.indent : '  '.repeat(depth);
      const marker = row.querySelector('.tw-md-marker');
      const mt = marker ? marker.textContent : '';
      return indent
        + (level === 'ul' ? '- ' : (mt || '1.') + ' ')
        + serChildren(row).trim();
    };
    const parts = [];
    Array.from(textEl.childNodes).forEach((n) => {
      if (n.nodeType !== 1) return;   // 裸文本交给下面的兜底
      if (n.classList.contains('tw-md-gap')) { parts.push(''); return; }   // 空行原样回写
      if (n.classList.contains('tw-md-list')) parts.push(serializeRow(n));
    });
    // 兜底：列表行被删光后光标落在容器上打的字、或光标跑到行外打的字，都挂在 textEl 上。
    // 只认 .tw-md-list 会把它们静默丢掉（「删完最后一项再打字，字不见了」）。
    const stray = Array.from(textEl.childNodes)
      .filter((n) => !(n.nodeType === 1
        && (n.classList.contains('tw-md-list') || n.classList.contains('tw-md-gap'))))
      .map(serNode).join('').trim();
    if (stray) parts.push((level === 'ul' ? '- ' : '1. ') + stray);
    // 首尾空行没有语义（渲染时也丢掉），不写回模型
    return parts.join('\n').replace(/^\n+|\n+$/g, '');
  }
  const quote = textEl.querySelector('.tw-md-quote');
  if (quote && level === 'quote') return serQuote(quote);
  // 普通富文本 / 表格 / 围栏：块级节点之间补换行，行内片段直接拼接
  let out = '';
  Array.from(textEl.childNodes).forEach((n) => {
    const isBlock = n.nodeType === 1 && (n.tagName === 'TABLE' || n.tagName === 'PRE'
      || n.classList.contains('tw-md-text') || n.classList.contains('tw-md-quote'));
    const s = (n.nodeType === 1 && n.tagName === 'TABLE') ? serTable(n)
      : ((n.nodeType === 1 && n.tagName === 'PRE') ? serPre(n) : serNode(n));
    if (isBlock) out += (out && !/\n$/.test(out) ? '\n' : '') + s + '\n';
    else out += s;
  });
  return out.replace(/\n+$/, '');
}

export const ViewportCuller = {
  /** 连线层取端点的几何源：挂载卡读活 DOM（与旧行为一致），离屏卡读几何缓存（最后测量值）。 */
  getGeom(ctx, id) {
    const { state, ctrl } = ctx;
    if (!state.mountedCards || !state.geo) return null;
    const card = state.mountedCards.get(id);
    if (card) {
      if (ctrl._canvas) {
        const cr = ctrl._canvas.getBoundingClientRect();
        const r = card.getBoundingClientRect();
        // 缩放比取自视口真源；仅在视口不可用时（测试/旧上下文）才回退到 rect 反推。
        // 注意：card.offsetWidth 是未缩放的布局尺寸，即画布坐标下的宽高，不能再除以 s。
        const s = (typeof CanvasViewport !== 'undefined')
          ? CanvasViewport.getScale(ctrl)
          : ((cr.width && ctrl._canvas.offsetWidth) ? cr.width / ctrl._canvas.offsetWidth : 1);
        const hw = card.offsetWidth / 2 || 1;
        const hh = card.offsetHeight / 2 || 1;
        return {
          cx: (r.left + r.width / 2 - cr.left) / s,
          cy: (r.top + r.height / 2 - cr.top) / s,
          hw, hh,
          rot: Number(card.dataset.rot) || 0,
        };
      }
      return {
        cx: card.offsetLeft + card.offsetWidth / 2,
        cy: card.offsetTop + card.offsetHeight / 2,
        hw: card.offsetWidth / 2 || 1,
        hh: card.offsetHeight / 2 || 1,
        rot: Number(card.dataset.rot) || 0,
      };
    }
    const g = state.geo.get(id);
    if (g) return { cx: g.x + g.w / 2, cy: g.y + g.h / 2, hw: g.w / 2 || 1, hh: g.h / 2 || 1, rot: g.rot || 0 };
    return null;
  },

  /** 几何单一写入入口（【解耦 B2 / 复盘 A4】）：一次写入同时刷新 GeoCache（state.geo）与空间索引（state.spatial），
   *  杜绝「只改一处导致另一处停在旧位置」的漂移。凡是改写卡片几何（位置/尺寸/旋转）的入口都应走这里。
   *  seedSpatial（模型重建整张索引）属预挂载引导路径，仍允许只写 state.spatial。 */
  setGeom(ctx, id, g) {
    const { state } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    state.geo.set(id, g);
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    state.spatial.update(id, g.x, g.y, g.w, g.h, g.rot);
  },

  /** 几何单一删除入口：同时清 GeoCache 与空间索引。 */
  removeGeom(ctx, id) {
    const { state } = ctx;
    if (state.geo) state.geo.delete(id);
    if (state.spatial) state.spatial.remove(id);
  },

  /** 重排 / 排版 / 上移下移后同步几何缓存与空间索引（【P8 几何缓存】失效完备性补齐）。 */
  syncLayoutGeo(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    const noteIdx = ctrl._noteIndex();
    if (state.mountedCards) {
      state.mountedCards.forEach((el) => ctrl._measureCard(el));
    }
    noteIdx.forEach((note, id) => {
      if (state.mountedCards && state.mountedCards.has(id)) return;
      const g = state.geo.get(id);
      if (!g) return;
      g.x = typeof note.x === 'number' ? note.x : 0;
      g.y = typeof note.y === 'number' ? note.y : 0;
      this.setGeom(ctx, id, g);
    });
  },

  /** 增量刷新一张已挂载卡的正文（task → 勾选框、其余 → 纯文本）。
   *  供 feature 层在「模型变了但不想整卡重挂」时复用同一渲染口径，避免各层再各写一份 textContent。
   *  写成方法而非对象字面量直接引用：测试 harness 会剥离 import，未注入该名时模块求值不该报错。 */
  applyCardText(textEl, note) { return renderCardText(textEl, note); },
  serializeRichText(textEl, note) { return serializeRichText(textEl, note); },

  /** 把一张模型卡建回 DOM 并挂进挂载表 + 量几何。culling 进屏时调用。
   *  @param {{defer?: boolean}} opts defer=true 时不在本函数内测量，交由 flushMountMeasure
   *         在本批挂载结束后统一测量 —— 避免「挂 N 卡 = N 次强制重排」。
   */
  mountCard(ctx, note, opts = {}) {
    const { state, ctrl } = ctx;
    const _t0 = ctrl._perfBegin();
    const card = ctrl._createCardEl({
      id: note.id, font: note.font, paper: note.paper, date: note.date,
      zoom: note.zoom, fontScale: note.fontScale, rot: note.rot, level: note.level,
    });
    card.style.zIndex = String(++ctrl._zTop);
    card.style.left = (typeof note.x === 'number' ? note.x : 0) + 'px';
    card.style.top = (typeof note.y === 'number' ? note.y : 0) + 'px';
    card.style.bottom = 'auto';
    const textEl = card.querySelector('.tw-card-text');
    renderCardText(textEl, note);
    ctrl._canvas.appendChild(card);
    if (!state.mountedCards) state.mountedCards = new Map();
    if (!state.geo) state.geo = new GeoCache();
    state.mountedCards.set(note.id, card);
    if (opts.defer) {
      // 先把所有卡挂完，最后统一测量：offset* 只有第一次读会触发重排，
      // 其余都命中刚刚算好的布局。
      if (!state._pendingMeasure) state._pendingMeasure = [];
      state._pendingMeasure.push(card);
    } else {
      ctrl._measureCard(card);
      // 定框纸样（美术不可动）：正文放不下时缩字号，尽量不出现滚动条
      fitCardText(card);
    }
    ctrl._perfEnd('mount', _t0);
    return card;
  },

  /** 补做本批「延迟挂载 measurements」的几何测量（见 mountCard 的 opts.defer）。 */
  flushMountMeasure(ctx) {
    const { state, ctrl } = ctx;
    if (!state._pendingMeasure || state._pendingMeasure.length === 0) return;
    const cards = state._pendingMeasure;
    state._pendingMeasure = [];
    for (const card of cards) {
      ctrl._measureCard(card);
      fitCardText(card);   // 与即时挂载同一套：量完就顺带做字号自适应
    }
  },

  /** 量一张卡进几何缓存（坐标取 style.left/top；尺寸取 offset*，一次 reflow 摊销）。 */
  measureCard(ctx, card) {
    const { state } = ctx;
    const id = card.dataset.id;
    if (!id) return;
    const g = {
      x: parseFloat(card.style.left) || 0,
      y: parseFloat(card.style.top) || 0,
      w: card.offsetWidth || 340,
      h: card.offsetHeight || 200,
      rot: Number(card.dataset.rot) || 0,
    };
    this.setGeom(ctx, id, g);
  },

  /** 离屏卡卸载 DOM（保留模型/几何缓存/连线）。 */
  unmountCard(ctx, id) {
    const { state, ctrl } = ctx;
    if (!state.mountedCards) return false;
    const card = state.mountedCards.get(id);
    if (!card) return false;
    ctrl._disposeCard(card);
    // 【根因】配对解除 ResizeObserver：LinkLayer.watchSize 在挂载时 observe 了这张卡，
    // 只 remove 不 unobserve 会让共享 RO 一直持有已销毁卡片的强引用 —— 写作档超
    // WRITE_NO_CULL_MAX 后每轮 cull churn 都新增一条，长时间平移后观察列表无界增长。
    if (ctrl._linkLayer && typeof ctrl._linkLayer.unwatchSize === 'function') {
      ctrl._linkLayer.unwatchSize(card);
    }
    card.remove();
    state.mountedCards.delete(id);
    return true;
  },

  /** 懒建 id→note 索引（cull mount 时按 id 取 note 内容，避免每次 O(n) find）。 */
  noteIndex(ctx) {
    const { state, ctrl } = ctx;
    if (ctrl._noteById && ctrl._noteByIdSrc === state.notes) return ctrl._noteById;
    ctrl._noteById = new Map();
    if (state.notes) for (const n of state.notes) ctrl._noteById.set(n.id, n);
    ctrl._noteByIdSrc = state.notes;
    return ctrl._noteById;
  },

  /** 用模型坐标重建整张空间索引（默认尺寸占位；_buildCards 测量后精确入格）。 */
  seedSpatial(ctx) {
    const { state } = ctx;
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    state.spatial.clear();
    if (!state.notes) return;
    for (const n of state.notes) {
      const x = typeof n.x === 'number' ? n.x : 0;
      const y = typeof n.y === 'number' ? n.y : 0;
      state.spatial.insert(n.id, x, y, 340, 200, Number(n.rot) || 0);
    }
  },

  /** 必须钉在屏上、剔除跳过的卡（编辑 / 选中 / 拖拽中 / 打字中）。 */
  pinnedIds(ctx) {
    const { state, ctrl } = ctx;
    const s = new Set();
    if (state.selected) state.selected.forEach((c) => { if (c.dataset && c.dataset.id) s.add(c.dataset.id); });
    if (ctrl._draggingSet) ctrl._draggingSet.forEach((id) => s.add(id));
    if (ctrl._editingId) s.add(ctrl._editingId);
    return s;
  },

  /** 【几何缓存失效】标记一张卡的几何已不可信（尺寸/比例可能变了），待合帧重测。 */
  invalidateGeo(ctx, id) {
    const { state, ctrl } = ctx;
    if (!id) return;
    if (!state.geo) state.geo = new GeoCache();
    state.geo.markDirty(id);
    this.scheduleGeoFlush(ctx);
  },

  /** 整机根字号变化 → 所有卡片的 em 尺寸全变 → 几何整体失效 */
  invalidateGeoAll(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    state.geo.forEach((_g, id) => state.geo.markDirty(id));
    if (state.mountedCards) state.mountedCards.forEach((_c, id) => state.geo.markDirty(id));
    this.scheduleGeoFlush(ctx);
  },

  scheduleGeoFlush(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    if (state.geo.flushRaf) return;
    state.geo.setFlushRaf(requestAnimationFrame(() => {
      state.geo.setFlushRaf(0);
      this.flushGeo(ctx);
    }));
  },

  /** 合帧重测所有失效卡。离屏卡不在 DOM 无法测，保持旧值即可 —— 重挂载时 _mountCard 会测。 */
  flushGeo(ctx) {
    const { state, ctrl } = ctx;
    if (!state.geo) state.geo = new GeoCache();
    const dirty = state.geo.takeDirty();
    if (!dirty || !dirty.size) return;
    const _t0 = ctrl._perfBegin();
    let changed = false;
    dirty.forEach((id) => {
      const card = state.mountedCards ? state.mountedCards.get(id) : null;
      if (!card) return;
      ctrl._measureCard(card);
      changed = true;
    });
    if (changed) ctrl._scheduleRenderLinks();
    ctrl._perfEnd('geoFlush', _t0);
  },

  scheduleCull(ctx) {
    const { state, ctrl } = ctx;
    // 【写作档不做视口剔除】文章是线性文档、规模有限（几十~几百块），
    // 而剔除会随「新建卡自动归位」/ 画布平移把卡片 DOM 反复销毁又重建 —— 这是可视化写作
    // 闪烁的根因：卡片甚至不到 20 张就开始闪，且与拖动无关（新建卡即触发）。
    // 文章块既少又便宜，虚拟化零收益、纯属负担；超阈值才回退剔除作安全兜底。
    // 常驻挂载不丢功能：卡片由 _buildCards / _mountCard 全量建立，删除走 _removeCard，
    // 几何缓存与连线端点照常工作（离屏卡仍可从 geo 取几何画连线）。
    // 【补注·抖动根因已可治】上文「反复销毁又重建」抖动的根因（每帧 createElement + 逐卡测量强制重排）
    // 已在导图侧以「DOM 回收池复用 + 批量测量」根治（mindmapFeature._mountNode 入池、_cullView 走 _batchMeasure）。
    // 若便签/写作画布日后也出现可感知抖动，可按同一套手法给 mountCard/unmountCard 上回收池，
    // 届时写作档是否下调 WRITE_NO_CULL_MAX 再据实测决定，勿凭推断放宽。
    if (ModePolicy.skipCull(state.mode, state.notes ? state.notes.length : 0)) return;
    if (ctrl._cullRaf) return;
    ctrl._cullRaf = requestAnimationFrame(() => {
      ctrl._cullRaf = 0;
      this.updateCulling(ctx);
    });
  },

  /** 重算挂载：离屏卸载、进屏重建。 */
  updateCulling(ctx) {
    const { state, ctrl } = ctx;
    if (!ctrl._restored || !ctrl._canvas) return;
    // 【切档回填修复】切档窗口（_switching=true）内模型正在换代：state.notes 仍是上一份文档，
    // 而 _mode 已指向新档。此时若允许重挂载，本函数会按尚未替换的 state.notes + state.spatial
    // 把旧卡重新挂回刚清空的画布 → 表现为「便签外皮 + 上一份文档(写作档)内容」的一闪
    // （典型：便签→写作→导图→便签，中间闪写作卡）。
    // 触发窗口的操作源：canvas.hidden=false 让画布尺寸 0→非零，触发观察到画布的 ResizeObserver
    // （typewriterFeature._cullRo）→ _scheduleCull → rAF 在 await _loadDoc 期间到点执行。
    // _mountCard 仅 buildCards 与本函数两处调用，故在此收口即可覆盖全部重挂载路径。
    if (ctrl._switching) return;
    if (!state.mountedCards) state.mountedCards = new Map();
    if (!state.geo) state.geo = new GeoCache();
    if (!state.spatial) state.spatial = new SpatialIndex(512);
    if (ctrl._CULL_MARGIN == null) ctrl._CULL_MARGIN = 240;
    const s = (typeof CanvasViewport !== 'undefined') ? CanvasViewport.getScale(ctrl) : 1;
    const cr = ctrl._canvas.getBoundingClientRect();
    // rect 已含缩放（rect.width = 布局宽 * s），除以 s 还原成「布局宽」——
    // 即未缩放前的可见宽度。不能直接用 cr.width 当可见宽度，否则缩放会让可见区失真。
    // 注：不用 offsetWidth —— jsdom 无布局时恒为 0，会让剔除整体失效（压测回归）。
    const LW = cr.width / s, LH = cr.height / s;
    if (LW < 2 || LH < 2) return;
    const _t0 = ctrl._perfBegin();
    const off = state.canvasOffset || { x: 0, y: 0 };
    const M = ctrl._CULL_MARGIN;
    // 缩放感知：卡片在「内容空间」的位置是 off + s * 画布坐标，
    // 故屏幕可见区 [0, LW] 反解回画布坐标要除以 s —— 否则缩小后大片卡片被误剔除（画面空白）。
    const vx0 = (-off.x - M) / s, vy0 = (-off.y - M) / s;
    const vx1 = (LW + M - off.x) / s, vy1 = (LH + M - off.y) / s;
    const pinned = ctrl._pinnedIds();
    const noteIdx = ctrl._noteIndex();
    const visible = state.spatial.queryRect(vx0, vy0, vx1, vy1);
    let changed = false;
    visible.forEach((id) => {
      if (pinned.has(id) || state.mountedCards.has(id)) return;
      const note = noteIdx.get(id);
      if (note) { ctrl._mountCard(note, { defer: true }); changed = true; }
    });
    pinned.forEach((id) => {
      if (state.mountedCards.has(id)) return;
      const note = noteIdx.get(id);
      if (note) { ctrl._mountCard(note, { defer: true }); changed = true; }
    });
    // 本批挂载统一测量一次（只触发一次重排），确保后续按需读取几何时都是最新值
    this.flushMountMeasure(ctx);
    state.mountedCards.forEach((card, id) => {
      if (pinned.has(id)) return;
      if (!visible.has(id)) { ctrl._unmountCard(id); changed = true; }
    });
    if (changed) {
      if (ctrl._linkLayer) ctrl._linkLayer.clearControls();
      ctrl._scheduleRenderLinks();
      if (ModePolicy.linksDefineOrder(state.mode)) ctrl._refreshWriteOrder();
    }
    ctrl._applyLod();
    ctrl._perfEnd('cull', _t0);
  },

  /** 超上限时移除最早的一批（以「模型真源 state.notes 的数组序」为时间序；cap 由宿主传入，避免本模块依赖 NOTE_CAP 常量）。
   *  注：现行 cap = Infinity（便签不设限），本函数实际不会触发；保留它是为了上限仍可配置。 */
  enforceCap(ctx, cap) {
    const { state, ctrl } = ctx;
    if (state.mode === 'write') return;
    if (state.notes.length - cap <= 0) return;
    const over = state.notes.length - cap;
    if (ctrl._undoStack) ctrl._undoStack.push();
    const victims = state.notes.slice(0, over).map((n) => n.id);
    victims.forEach((id) => ctrl._removeNoteById(id));
    ctrl._scheduleSave();
    if (typeof Toast !== 'undefined') {
      Toast.showToast(`已达 ${cap} 张上限，自动归档最早的 ${victims.length} 张`, 'info');
    } else {
      ctrl._showScreenMsg(`已达上限，归档最早 ${victims.length} 张`, 2200);
    }
  },

  /** 卡片从视图移除前的统一资源释放：打字 timer、编辑态事件监听、瞬时集合引用。 */
  disposeCard(ctx, card) {
    const { state, ctrl } = ctx;
    if (!card) return;
    const id = card.dataset && card.dataset.id;
    if (card._editHandlers || card._editBlur) {
      const text = card.querySelector('.tw-card-text');
      if (text) {
        if (card._editHandlers) {
          text.removeEventListener('input', card._editHandlers.onInput);
          text.removeEventListener('keydown', card._editHandlers.onKey);
          text.removeEventListener('paste', card._editHandlers.onPaste);
        }
        if (card._editBlur) text.removeEventListener('blur', card._editBlur);
      }
      card._editHandlers = null;
      card._editBlur = null;
    }
    if (id) {
      if (ctrl._editingId === id) ctrl._editingId = null;
      if (state.selected) state.selected.delete(card);
    }
  },

  /** 把视野平移到指定卡（钉屏卡跳过；离屏卡用几何缓存/模型定位，无需 DOM）。 */
  ensureCardVisible(ctx, cardOrId) {
    const { state, ctrl } = ctx;
    const canvas = ctrl._canvas;
    if (!canvas) return;
    const VW = canvas.clientWidth, VH = canvas.clientHeight;
    if (!VW || !VH) return;
    const id = (cardOrId && cardOrId.dataset) ? cardOrId.dataset.id : cardOrId;
    if (!id) return;
    if (ctrl._pinnedIds(ctx).has(id)) return;
    const g = state.geo ? state.geo.get(id) : null;
    const n = (typeof ctrl._noteIndex === 'function') ? ctrl._noteIndex().get(id) : (state.notes || []).find((x) => x.id === id);
    const rawL = (g ? g.x : (n && typeof n.x === 'number' ? n.x : 0));
    const rawT = (g ? g.y : (n && typeof n.y === 'number' ? n.y : 0));
    const w = g ? g.w : 340;
    const h = g ? g.h : 200;
    const off = state.canvasOffset || { x: 0, y: 0 };
    const M = 24;
    // 缩放比：卡片在屏幕上的尺寸 = 布局尺寸 * s，约束须用 s 把「可见区(布局像素)」换算到「画布坐标」。
    // 此前漏乘 s（等价硬编码 s=1），缩放≠100% 时归位算错 / 卡片不进视野。
    const s = (typeof CanvasViewport !== 'undefined') ? CanvasViewport.getScale(ctrl) : 1;
    let ox = off.x, oy = off.y;
    if (s * h + 2 * M < VH) {
      oy = Math.min(VH - M - s * (rawT + h), Math.max(M - s * rawT, oy));
    } else {
      oy = M - s * rawT;
    }
    if (s * w + 2 * M < VW) {
      ox = Math.min(VW - M - s * (rawL + w), Math.max(M - s * rawL, ox));
    } else {
      ox = M - s * rawL;
    }
    if (ox === off.x && oy === off.y) return;
    ctrl._setCanvasOffset(ox, oy);
  },
};
