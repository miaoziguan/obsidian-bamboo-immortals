/**
 * writingDoc — MD可视化写作档的纯逻辑（无 DOM、无存储、无副作用）
 *
 * 数据模型（与思维子弹 MindmapDoc 同构，作为「数据模型为源」的改写基础）：
 *   note = { id, seq, text, x, y, font, paper, level, date, zoom, fontScale, rot }
 *         卡片：一句/一段文本 + 视觉属性（字体/纸样/层级/缩放/字级/旋转）+ 自由坐标
 *         seq  = 【顺序一等数据】文章顺序真值（唯一且连续 0..N-1）。坐标 x/y 自此退化为
 *                纯呈现，不再参与任何语义判定（顺序、导出、徽标一律读 seq）。
 *                旧数据无 seq：由 normalize → normalizeSeq 按 orderIds 推导补齐（读档即升维）。
 *   link = { from, to, route, bend, dash }   卡片间关联连线（文章顺序来源）：自由成对、多对多、无层级、无根
 *   canvasOffset = { x, y }                  画布平移量（绝对 px，与卡片坐标同量纲）
 *
 * 与思维子弹的差别只在字段：子弹是「一句短文本 + 坐标」，写作卡片多了纸样/字体/层级/缩放等视觉属性；
 * 连线语义一致（都是用户拉的、谁连谁自由）。故这里同样「没有」自动布局、没有层级树、没有 layout()：
 * 位置直接来自数据，拖动即改数据；连线由用户拉出。
 *
 * 纯逻辑集中在此，便于单测（tests/writing.jest.test.js）；DOM 与交互在 typewriterFeature.js。
 * 全部不可变：增改返回新数组/新对象，绝不就地改（与 MindmapDoc 同一不变量——将来若接撤销栈、
 * 或做「屏外卡片卸载」的视口剔除，就不需要担心 DOM 把数据带偏，几何缓存也才有唯一真源）。
 */
import { FONTS, PAPERS, MARKET_PAPERS, MARKET_FONTS, LEVELS, ZOOM_MIN, ZOOM_MAX, MAX_LEN, WRITING_SCHEMA_VERSION } from './twConfig.js';

// GFM 表格判定：与 ViewportCuller 的投影判定同源。刻意各存一份 —— 测试桩会剥离 import，
// 纯逻辑层不能反向依赖渲染层；两处正则保持一致，改一处务必同步另一处。
const TABLE_DELIM_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const hasTablePipe = (s) => String(s).indexOf('|') >= 0;
const isTableDelim = (s) => hasTablePipe(s) && TABLE_DELIM_RE.test(s);

// GFM 围栏代码块：与 ViewportCuller 的投影判定同源（同样各存一份，理由同上）。
// 闭合行必须与开围栏同字符、长度不小于开围栏，且不带语言标记。
const FENCE_LINE_RE = /^\s*(`{3,}|~{3,})(.*)$/;
function isFenceClose(line, mark) {
  const m = FENCE_LINE_RE.exec(line);
  return !!(m && m[1].charAt(0) === mark.charAt(0)
    && m[1].length >= mark.length && !m[2].trim());
}

export const WritingDoc = {
  VERSION: WRITING_SCHEMA_VERSION,     // v2 = x/y/canvasOffset 统一绝对 px（与 TypewriterStore.WRITING_VERSION 同值，单一真源在 twConfig）
  ZOOM_MIN,                           // 手动缩放下界（小签 ~180px 宽）
  ZOOM_MAX,                           // 上界（铺满画布的大签）
  MAX_LEN,                            // 单卡最大字数（截断由输入层负责，模型层只导出）
  FONTS,
  PAPERS,
  // 市场纸样/字体是运行时注册的（registerMarketPaper/Font 往 twConfig 的同一数组 push），故动态引用而非快照
  MARKET_PAPERS,
  MARKET_FONTS,
  LEVELS,
  EST_W: 200,                // 估算宽（只用于 freeSpot，真实尺寸由 DOM 量）
  EST_H: 120,                // 估算高
  GAP: 18,

  /** 卡片 id：时间戳 + 随机后缀，肉眼可读（'wc' 前缀与子弹 'mn' 区分开） */
  newId() {
    return 'wc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  /** 把任意 zoom 钳到合法范围（与 _clampZoom 一致） */
  _clampZoom(z) {
    const n = Number(z);
    if (!isFinite(n) || n <= 0) return 1;
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, n));
  },

  /** 旋转角归一到 (-180, 180]（与 _applyRot 一致） */
  _normRot(d) {
    const n = Number(d);
    if (!isFinite(n)) return 0;
    return ((n % 360) + 540) % 360 - 180;
  },

  /**
   * 【顺序一等数据】文章顺序的纯推导 —— 全仓唯一实现，供「升维」与旧路径共用，
   * 杜绝两套实现各自漂移（升维算出的顺序必须与用户当前所见徽标完全一致，否则会被感知成"顺序变了"）。
   *   有连线：以连线为优先（DFS，同一出边按目标位置排序，保证多分支顺序稳定）；
   *   无连线：回退阅读顺序（先 y 后 x）。
   * @param {Array} notes @param {Array} links
   * @returns {string[]} 卡片 id 的有序序列（含全部卡，成环/孤立也会补尾）
   */
  orderIds(notes, links) {
    const list = (Array.isArray(notes) ? notes : []).map((n) => ({
      id: n.id,
      x: Number.isFinite(n.x) ? n.x : 0,
      y: Number.isFinite(n.y) ? n.y : 0,
    }));
    if (!list.length) return [];
    const byPos = (a, b) => (a.y - b.y) || (a.x - b.x);
    list.sort(byPos);
    const byId = new Map(list.map((c) => [c.id, c]));
    const wires = (Array.isArray(links) ? links : [])
      .filter((l) => l && l.from && l.to && byId.has(l.from) && byId.has(l.to));
    if (!wires.length) return list.map((c) => c.id);   // 无连线：退化为阅读顺序
    const adj = new Map();
    const indeg = new Map(list.map((c) => [c.id, 0]));
    wires.forEach((l) => {
      if (!adj.has(l.from)) adj.set(l.from, []);
      adj.get(l.from).push(l.to);
      indeg.set(l.to, (indeg.get(l.to) || 0) + 1);
    });
    adj.forEach((lst) => lst.sort((a, b) => byPos(byId.get(a), byId.get(b))));
    const seen = new Set();
    const out = [];
    const walk = (id) => {
      if (seen.has(id)) return;                 // 成环：走到过就不再进，避免死循环
      seen.add(id);
      out.push(id);
      (adj.get(id) || []).forEach(walk);
    };
    list.filter((c) => !indeg.get(c.id)).forEach((c) => walk(c.id));   // 入度 0 的即开头
    list.filter((c) => !seen.has(c.id)).forEach((c) => walk(c.id));    // 环内残留：按阅读序补尾
    return out;
  },

  /**
   * 【顺序一等数据】把 seq 规范成「唯一且连续 0..N-1」—— 顺序真值的唯一入口。
   *   · 已全部带合法 seq：以 seq 为准（**坐标不再参与语义**），仅压紧空档；
   *   · 缺 seq（旧数据/升维）：按 orderIds 推导补齐（连线优先 → 回退阅读序）。
   * 幂等：对已规范的输入重复调用结果不变（纯函数，可放心在每次读档时跑）。
   */
  normalizeSeq(notes, links) {
    const list = Array.isArray(notes) ? notes : [];
    if (!list.length) return [];
    const allSeq = list.every((n) => Number.isFinite(n.seq));
    let ordered;
    if (allSeq) {
      ordered = list.slice()
        .sort((a, b) => (a.seq - b.seq) || (a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)))
        .map((n) => n.id);
    } else {
      ordered = this.orderIds(list, links);      // 升维：沿用旧的同一套推导
    }
    const rank = new Map();
    ordered.forEach((id, i) => rank.set(id, i));
    let tail = ordered.length;                   // 兜底：未进入序列的排到末尾
    return list.map((n) => Object.assign({}, n, {
      seq: rank.has(n.id) ? rank.get(n.id) : (tail++),
    }));
  },

  /** 显式重排：按给定 id 序列重写 seq（上下移 / 顺流重排 / 拖拽调序的共同收口）。
   *  未出现在 ids 里的卡排到末尾，保证结果仍是「唯一且连续」。 */
  setOrder(notes, ids) {
    const list = Array.isArray(notes) ? notes : [];
    const rank = new Map();
    (Array.isArray(ids) ? ids : []).forEach((id, i) => { if (!rank.has(id)) rank.set(id, i); });
    let tail = rank.size;
    const stamped = list.map((n) => Object.assign({}, n, {
      seq: rank.has(n.id) ? rank.get(n.id) : (tail++),
    }));
    return this.normalizeSeq(stamped, null);
  },

  /**
   * 形状修复（读档后必跑）：逐条过滤、绝不整体清空 —— 与存储层同一条原则。
   * 补齐缺省、按枚举/范围校正非法字段；连线按 note id 校验、丢自环/悬空/重复对。
   * 返回 { notes, links, canvasOffset }（比 MindmapDoc.normalize 多一份 canvasOffset）。
   */
  normalize(notes, links, canvasOffset) {
    const out = [];
    const seen = new Set();
    (Array.isArray(notes) ? notes : []).forEach((n) => {
      if (!n || typeof n.id !== 'string' || !n.id || seen.has(n.id)) return;
      seen.add(n.id);
      // 【市场纸样/字体持久化】原逻辑按内置 FONTS/PAPERS 清单校正，凡市场素材一律回落 classic/plain
      // —— 这会在 loadDoc 归一化时把「已持久化的市场纸样」静默销毁，导致「梦珑皮肤重启后变默认」。
      // 改为：只兜底真正缺值（非字符串/空串）的情况，非空字符串一律保留原值。内置纸样本就是非空串、
      // 市场纸样同样保留；素材注册（registerMarketPaper）是异步的，loadDoc 跑在恢复前 MARKET_PAPERS 可能
      // 仍空，故不能依赖它判定 —— 保留原值后，恢复注册并注入 CSS 时卡片自动套上。
      const font = (typeof n.font === 'string' && n.font) ? n.font : 'classic';
      const paper = (typeof n.paper === 'string' && n.paper) ? n.paper : 'plain';
      const level = this.LEVELS.indexOf(n.level) >= 0 ? n.level : 'p';
      out.push({
        id: n.id,
        // 【顺序一等数据】旧数据无 seq：此处留 undefined，交由下方 normalizeSeq 按
        // orderIds 推导补齐 —— 读档即升维，无需独立迁移脚本，且幂等可重复。
        seq: Number.isFinite(n.seq) ? n.seq : undefined,
        text: typeof n.text === 'string' ? n.text : '',
        x: Number.isFinite(n.x) ? n.x : 0,
        y: Number.isFinite(n.y) ? n.y : 0,
        font,
        paper,
        level,
        date: typeof n.date === 'string' ? n.date : '',
        zoom: this._clampZoom(n.zoom),
        fontScale: (isFinite(Number(n.fontScale)) && Number(n.fontScale) > 0) ? Number(n.fontScale) : 1,
        rot: this._normRot(n.rot),
      });
    });
    const ids = new Set(out.map((n) => n.id));
    const wires = [];
    const pairs = new Set();
    (Array.isArray(links) ? links : []).forEach((l) => {
      if (!l || typeof l.from !== 'string' || typeof l.to !== 'string') return;
      if (l.from === l.to || !ids.has(l.from) || !ids.has(l.to)) return;
      const key = [l.from, l.to].sort().join('>');   // 同一对不分方向只留一条
      if (pairs.has(key)) return;
      pairs.add(key);
      wires.push({
        from: l.from,
        to: l.to,
        route: (l.route === 'straight') ? 'straight' : 'bezier',
        bend: Number.isFinite(l.bend) ? l.bend : 0,
        dash: l.dash === 'dashed' ? 'dashed' : 'solid',
      });
    });
    // 缩放比一并通过 normalize 保留（缺省/非法 → 1，由 CanvasViewport.clamp 兜底）
    const rawS = (canvasOffset && typeof canvasOffset === 'object') ? Number(canvasOffset.scale) : 0;
    const off = (canvasOffset && typeof canvasOffset === 'object')
      ? { x: Number(canvasOffset.x) || 0, y: Number(canvasOffset.y) || 0, scale: (rawS > 0 ? rawS : 1) }
      : { x: 0, y: 0, scale: 1 };
    return { notes: this.normalizeSeq(out, wires), links: wires, canvasOffset: off };
  },

  /** 追加一张卡片（返回新数组，调用方负责落盘）。text/x/y 必填；其余视觉属性走 opts 默认值。 */
  addNote(notes, text, x, y, opts) {
    const o = opts || {};
    // 新卡默认接在文末：取现有最大 seq + 1（无 seq 时从 0 起）
    const maxSeq = (Array.isArray(notes) ? notes : [])
      .reduce((m, n) => (Number.isFinite(n.seq) && n.seq > m ? n.seq : m), -1);
    const note = {
      id: this.newId(),
      seq: maxSeq + 1,
      text: (text && String(text)) || '',
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      font: this.FONTS.indexOf(o.font) >= 0 ? o.font : 'classic',
      paper: this.PAPERS.indexOf(o.paper) >= 0 ? o.paper : 'plain',
      level: this.LEVELS.indexOf(o.level) >= 0 ? o.level : 'p',
      date: typeof o.date === 'string' ? o.date : '',
      zoom: this._clampZoom(o.zoom),
      fontScale: (isFinite(Number(o.fontScale)) && Number(o.fontScale) > 0) ? Number(o.fontScale) : 1,
      rot: this._normRot(o.rot),
    };
    return notes.concat([note]);
  },

  setText(notes, id, text) {
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { text: (text && String(text)) || '' }) : n));
  },

  /**
   * 按段落拆分一张卡（纯函数，返回新数组，调用方负责落盘）。
   *   · 优先以空行（连续换行）分段 —— Markdown 段落语义；
   *   · 若无空行但有多行，则退化为按单个换行分段 —— 打字机输入框里回车即新段，用户不会敲两个回车；
   *   · 首段留在原卡（保留其 level 与全部视觉属性），其余段紧随其后插入：
   *     列表/引用沿用原级，标题等其余类型降为 p；表格/围栏代码是原子结构，禁止拆分；
   *   · seq 由 setOrder 重写为唯一且连续（红线不破）。
   *  段数 ≤ 1（无换行可拆）时原样返回 —— 调用方据此判定「无需拆分」。
   *  @returns {Array} 拆后（或原样）的 notes 数组
   */
  splitNote(notes, id) {
    const list = Array.isArray(notes) ? notes : [];
    const idx = list.findIndex((n) => n.id === id);
    if (idx < 0) return notes;
    const orig = list[idx];
    const raw = (orig.text || '').replace(/\r\n?/g, '\n');
    // 表格 / 围栏代码块是原子结构：逐行拆会把表头/数据行、开围栏/代码拆散。
    if (orig.level === 'table' || orig.level === 'code') return notes;
    // 段内保留相对缩进（嵌套列表层级），只归一化整段公共缩进 —— 与 splitDraft 同一口径。
    // 旧实现逐行删行首缩进，拆一次卡就把嵌套层级抹平了。
    const cleanSeg = (seg) => {
      const rows = seg.replace(/[ \t]+$/gm, '').split('\n');
      let min = Infinity;
      rows.forEach((r) => { if (r.trim()) min = Math.min(min, (/^[ \t]*/.exec(r) || [''])[0].length); });
      if (!isFinite(min)) min = 0;
      return rows.map((r) => (r.trim() && min ? r.slice(min) : r)).join('\n').trim();
    };
    const clean = (arr) => arr.map(cleanSeg).filter((s) => s.length);
    let chunks = clean(raw.split(/\n[ \t]*\n+/));   // ① 空行分段
    if (chunks.length <= 1) chunks = clean(raw.split(/\n+/));   // ② 退化为按换行分段
    if (chunks.length <= 1) return notes;           // 没有可拆的段落
    const updated = Object.assign({}, orig, { text: chunks[0] });
    // 拆出的段沿用可延续的列表/引用层级（否则 ol 编号、task 勾选态会退化成散文本）；
    // 标题卡拆出的说明段仍降级为 p（标题独占一张卡，既有契约）。
    const carried = ['ul', 'ol', 'task', 'quote'].indexOf(orig.level) >= 0 ? orig.level : 'p';
    const inserts = chunks.slice(1).map((t, k) => ({
      id: this.newId(),
      seq: 0,                                            // 占位；下方 setOrder 按数组序重写
      text: t,
      x: (Number.isFinite(orig.x) ? orig.x : 0) + (k + 1) * 24,   // 便签档级联偏移，避免与原文完全重叠
      y: (Number.isFinite(orig.y) ? orig.y : 0) + (k + 1) * 24,
      font: orig.font || 'classic',
      paper: orig.paper || 'plain',
      level: carried,                                    // 列表/引用沿用原级，其余为段落级
      date: orig.date || '',
      zoom: Number.isFinite(orig.zoom) ? orig.zoom : 1,
      fontScale: (Number.isFinite(orig.fontScale) && orig.fontScale > 0) ? orig.fontScale : 1,
      rot: orig.rot || 0,
    }));
    const out = [];
    list.forEach((n, i) => { if (i === idx) out.push(updated, ...inserts); else out.push(n); });
    return this.setOrder(out, out.map((n) => n.id));     // 重排 seq 为唯一且连续
  },

  /**
   * 拆卡时把拆出的片段「内联串接」成链（按段落顺序首尾相接，且把原文后续接到链尾）：
   *   · 进边（B→x）原样保留在首段 x（P1）上；
   *   · 出边（x→A，即原文后续）改接到「末段」—— 拆出的段落链尾接续原文后续，
   *     得到 上段→…→末段→A 的线性串接，而不是让 x 同时叉出两条边；
   *   · 再在序列 [首段, 新段1, 新段2, …] 上补「每段 → 下一段」顺连边
   *     （首段→新段1、新段1→新段2 …），去重避免已存在的相邻边。
   *   若出边目标已是某段 id（链路内边），原样保留、不反向重接。
   *  @param {Array} links    原连线数组 [{from,to,...}]
   *  @param {string} origId 首段（原卡）的 id
   *  @param {Array<string>} newIds 拆出的新段 id 列表（按段落顺序）
   *  @returns {Array} 含顺连链边、且出边已挪到末段的数组（无新段时原样返回）
   */
  chainSplitChunks(links, origId, newIds) {
    const list = Array.isArray(links) ? links : [];
    if (!Array.isArray(newIds) || !newIds.length) return list;   // 无新段（未拆）：不改动
    const seen = new Set(list.map((l) => l.from + '>' + l.to));
    const idSet = new Set(newIds);
    const lastNew = newIds[newIds.length - 1];
    const out = [];
    list.forEach((l) => {
      if (l.from === origId) {
        if (idSet.has(l.to)) { out.push(l); return; }   // 已是段落链内边：原样保留，避免反向/重复
        // 内联串接：出边改接到末段，使拆出链尾接续原文后续（保留原线型 route/bend/dash）
        const sig = lastNew + '>' + l.to;
        if (seen.has(sig)) return;                       // 末段本就直连该卡：不重复
        seen.add(sig);
        out.push({ from: lastNew, to: l.to, route: l.route, bend: l.bend, dash: l.dash });
      } else {
        out.push(l);                                     // 其它边（含进边 to===origId）原样保留
      }
    });
    const seq = [origId].concat(newIds);                 // 段落顺序链
    for (let i = 0; i + 1 < seq.length; i += 1) {
      const sig = seq[i] + '>' + seq[i + 1];
      if (seen.has(sig)) continue;                       // 去重：相邻已连
      seen.add(sig);
      out.push({ from: seq[i], to: seq[i + 1] });       // 顺连：上一段 → 下一段
    }
    return out;
  },

  /**
   * 级别嗅探（纯函数，单一真源）。
   *  只解析首行前缀，命中则剥掉前缀、返回余文：
   *    # {1,6}       → h1..h6
   *    >             → quote
   *    - [ ] / - [x] → task
   *    - / *         → ul
   *    1. / 1)       → ol
   *    其余          → p
   *  CardViewManager.detectWriteLevel 委托到此处，避免两处各写一份正则。
   */
  detectLevel(raw) {
    const text = raw == null ? '' : String(raw);
    const lines = text.split('\n');
    const first = lines[0] || '';
    let m;
    // 围栏代码块：保留完整 markdown（含 ``` 与语言标记），渲染层据此建 <pre><code>。
    if (FENCE_LINE_RE.test(first)) return { level: 'code', text };
    // 表格：首行含 | 且次行是分隔行 → 保留完整 markdown。
    // 与 task 同理，`|`/`---` 是语义而非装饰，渲染层要靠它们建 <table>，绝不能剥掉。
    if (hasTablePipe(first) && isTableDelim(lines[1] || '')) return { level: 'table', text };
    if ((m = /^(#{1,6})\s+(.*)$/.exec(first))) { lines[0] = m[2]; return { level: 'h' + m[1].length, text: lines.join('\n') }; }
    if ((m = /^>\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'quote', text: lines.join('\n') }; }
    // task 不剥 marker：marker 是语义（勾选态），要保留进 note.text，由渲染层解析成勾选框。
    // 其它类型（标题/列表/引用）的 marker 无语义、纯装饰，剥掉才不显示成正文。
    if ((m = /^[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(first))) { return { level: 'task', text }; }
    if ((m = /^[-*]\s+(.*)$/.exec(first))) { lines[0] = m[1]; return { level: 'ul', text: lines.join('\n') }; }
    // 有序列表的编号是信息而非装饰：剥掉首行 `1. ` 会让卡片显示成「2. 3. 4.」缺 1，
    // 导出也拿不回原编号。与 task/table/code 一样保留完整 markdown。
    if (/^\d+[.)]\s+/.test(first)) return { level: 'ol', text };
    return { level: 'p', text };
  },

  /**
   * 长文成块（纯函数）：把一整篇草稿切成「一块一张卡」的块序列，每块各自定级。
   *  与 splitNote（拆单卡）的区别：splitNote 面向「已定级的一张卡」按空行/换行分段，沿用原卡层级；
   *  此处面向整篇草稿，每块各自跑 detectLevel 定级，
   *  故 "# 三、结论" → h3 卡、"- 项" → ul 卡、"1. 项" → ol 卡。
   *
   *  成块规则（逐行状态机，兼顾 Markdown / 纯文本 / 外部 App 脏复制三种来源）：
   *   ① 空行 = 段落边界（Markdown 段落语义）；
   *   ② 标题行（#{1,6} ）必定另起一块 —— 草稿常「标题紧跟正文、无空行」，不断开会整块被判成标题；
   *   ③ 同类型列表行 / 引用行合并成一块 —— 否则 "- a\n- b" 会被切成一张卡一行，导出成松散列表；
   *   ④ 无空行时（PDF/网页复制常见）单换行即分段，避免整篇被并成一个巨段再按句硬切、丢掉原有段落结构。
   *  最后对仍超 maxLen 的块按句末硬切（。！？；!?;），杜绝再出现「一块一万字」。
   *  @param {string} raw    原始草稿全文
   *  @param {number} maxLen 单卡字数上限（缺省 MAX_LEN=500）
   *  @returns {Array<{text:string, level:string}>} 块序列（已去空块，顺序即文章顺序）
   */
  splitDraft(raw, maxLen) {
    const MAX = (Number.isFinite(maxLen) && maxLen > 0) ? maxLen : MAX_LEN;
    const src = String(raw == null ? '' : raw).replace(/\r\n?/g, '\n');
    if (!src.trim()) return [];
    // 行清洗只去行尾空白。行首缩进是嵌套列表的层级语义，必须留到成块阶段：
    // 判定用的 probe 会 trimStart（外部 App 复制的乱缩进仍不会污染 Markdown 语义），
    // 但 cur.lines 存原始行，flush 时归一化「块级公共缩进」，只留下块内相对缩进。
    const lines = src.split('\n').map((s) => s.replace(/[ \t]+$/g, ''));
    const isBlank = (s) => !s.trim();
    const isHeading = (s) => /^#{1,6}\s+/.test(s);
    const isQuote = (s) => /^>\s?/.test(s);
    const listKind = (s) => {
      if (/^[-*]\s+\[( |x|X)\]\s+/.test(s)) return 'task';
      if (/^[-*]\s+/.test(s)) return 'ul';
      if (/^\d+[.)]\s+/.test(s)) return 'ol';
      return '';
    };
    // 有空行 → 空行内的连续普通行是「软换行」，同属一段；无空行 → 每行自成一段（规则④）
    const hasBlank = /\n[ \t]*\n/.test(src);

    const blocks = [];
    const noSplit = new Set();   // 表格/围栏块在 blocks 中的下标：整块不参与超长硬切
    // 先扫出所有「整块结构」区间（围栏代码、GFM 表格）。不做这步的话：
    // 无空行稿子会把它们逐行切成 N 张卡，超 MAX 的块还会被 hardSplit 从句读处
    // 拦腰切断 —— 表头/分隔行/数据行、开围栏/代码/闭围栏分家，结构直接碎掉。
    const blockSpans = new Map();
    for (let k = 0; k < lines.length; k += 1) {
      const fence = FENCE_LINE_RE.exec(lines[k]);
      if (fence) {
        let j = k + 1;
        while (j < lines.length && !isFenceClose(lines[j], fence[1])) j += 1;
        const end = (j < lines.length) ? j + 1 : lines.length;   // 未闭合也整块成卡
        blockSpans.set(k, end);
        k = end - 1;
        continue;
      }
      if (k + 1 < lines.length && hasTablePipe(lines[k]) && isTableDelim(lines[k + 1])) {
        let j = k + 2;
        while (j < lines.length && lines[j].trim() && hasTablePipe(lines[j]) && !isTableDelim(lines[j])) j += 1;
        blockSpans.set(k, j);
        k = j - 1;
      }
    }
    let cur = null;
    const flush = () => {
      if (cur && cur.lines.some((s) => s.trim())) {
        // 归一化「块级公共缩进」：整块都被缩进（外部复制常见）时减掉，
        // 但块内不同行之间的相对缩进保留 —— 那是嵌套 ul/ol 的层级。
        let min = Infinity;
        cur.lines.forEach((s) => {
          if (s.trim()) min = Math.min(min, (/^[ \t]*/.exec(s) || [''])[0].length);
        });
        if (!isFinite(min)) min = 0;
        const body = cur.lines.map((s) => (s.trim() && min ? s.slice(min) : s)).join('\n');
        blocks.push(body.replace(/\s+$/g, '').replace(/^\s+/g, ''));
      }
      cur = null;
    };
    let skipUntil = -1;
    lines.forEach((rawLine, li) => {
      if (li < skipUntil) return;
      const span = blockSpans.get(li);
      if (span != null) {
        flush();
        // 表格 / 围栏块不走归一化：代码行自身的缩进是内容，不能动
        const whole = lines.slice(li, span).join('\n').replace(/\s+$/g, '').replace(/^\s+/g, '');
        if (whole) { noSplit.add(blocks.length); blocks.push(whole); }
        skipUntil = span;
        return;
      }
      const line = rawLine.replace(/^[ \t]+/, '');   // 判定用去缩进版；存储用 rawLine
      if (isBlank(line)) { flush(); return; }
      if (isHeading(line)) { flush(); cur = { kind: 'h', lines: [rawLine] }; return; }
      const lk = listKind(line);
      if (lk) {
        if (cur && cur.kind === lk) { cur.lines.push(rawLine); return; }
        flush(); cur = { kind: lk, lines: [rawLine] }; return;
      }
      if (isQuote(line)) {
        if (cur && cur.kind === 'quote') { cur.lines.push(rawLine); return; }
        flush(); cur = { kind: 'quote', lines: [rawLine] }; return;
      }
      if (cur && cur.kind === 'p' && hasBlank) { cur.lines.push(rawLine); return; }   // 软换行并入同段
      flush(); cur = { kind: 'p', lines: [rawLine] };
    });
    flush();

    // 超长块按句末硬切：优先在句读处断开，切不出就在 MAX 处硬断
    const hardSplit = (s) => {
      const out = [];
      let rest = s;
      while (rest.length > MAX) {
        const win = rest.slice(0, MAX + 1);
        let cut = -1;
        for (let i = win.length - 1; i >= Math.floor(MAX * 0.6); i -= 1) {
          if (/[。！？；!?;]/.test(win[i])) { cut = i + 1; break; }
        }
        if (cut <= 0) cut = MAX;
        const piece = rest.slice(0, cut).replace(/\s+$/g, '');
        if (piece) out.push(piece);
        rest = rest.slice(cut).replace(/^\s+/g, '');
      }
      if (rest) out.push(rest);
      return out;
    };

    const chunks = [];
    blocks.forEach((b, bi) => {
      // 结构块整块豁免：宁可让一张卡偏长，也不能把表头/数据行或围栏/代码切到两张卡上
      const parts = (b.length > MAX && !noSplit.has(bi)) ? hardSplit(b) : [b];
      parts.forEach((p) => {
        const d = this.detectLevel(p);
        if (d.text && d.text.trim()) chunks.push({ text: d.text, level: d.level });
      });
    });
    return chunks;
  },

  /**
   * 合并多张卡为一张（纯函数，与 splitNote 互逆，调用方负责落盘/重绘）。
   *  锚 = 选中里 seq 最小者（读序最前）；其余被并卡移除。
   *  正文 = 按 seq 顺序把所有选中卡 text 用 \n\n 拼接（保段落边界，将来可再拆）。
   *  连线：被并卡(非锚)在连线里的端点改写为锚 id；两端都被并 → 自环 → 丢弃；去重。
   *  锚卡自身连线原样保留。seq 由 setOrder 压紧为唯一且连续（红线不破）。
   *  @param {Array} notes  规范卡片数组
   *  @param {Array} links  连线数组 [{from,to,...}]
   *  @param {Array<string>} ids 要合并的卡 id 列表
   *  @returns {{notes:Array, links:Array, anchorId:?string}} 合并后数据；不足以合并时原样返回、anchorId 为 null
   */
  mergeNotes(notes, links, ids) {
    const set = new Set(ids || []);
    const list = Array.isArray(notes) ? notes : [];
    const picked = list.filter((n) => set.has(n.id));
    if (picked.length < 2) return { notes: list, links: Array.isArray(links) ? links : [], anchorId: null };
    const ordered = picked.slice().sort((a, b) => (Number.isFinite(a.seq) ? a.seq : 0) - (Number.isFinite(b.seq) ? b.seq : 0));
    const anchor = ordered[0];
    const text = ordered
      .map((n) => (n.text || '').replace(/\s+$/g, '').replace(/^\s+/g, ''))
      .filter((s) => s.length)
      .join('\n\n');
    // 层级不一致时降为正文级：否则「ol 卡 + 普通段落」合并后仍挂 ol，
    // 导出的列表分支会把那段普通文字也编上号（同类：marker 语义被张冠李戴）。
    const levels = new Set(ordered.map((n) => n.level || 'p'));
    const merged = Object.assign({}, anchor, {
      text,
      level: levels.size === 1 ? (anchor.level || 'p') : 'p',
    });
    // 连线端点改写：被并卡(非锚)→ 锚；自环丢弃；去重
    const seen = new Set();
    const outLinks = [];
    (Array.isArray(links) ? links : []).forEach((l) => {
      const f = set.has(l.from) && l.from !== anchor.id ? anchor.id : l.from;
      const t = set.has(l.to) && l.to !== anchor.id ? anchor.id : l.to;
      if (f === t) return;                              // 自环（两端都被并）→ 丢弃
      const sig = f + '>' + t;
      if (seen.has(sig)) return;
      seen.add(sig);
      outLinks.push({ from: f, to: t, route: l.route, bend: l.bend, dash: l.dash });
    });
    const kept = list
      .filter((n) => !set.has(n.id) || n.id === anchor.id)
      .map((n) => (n.id === anchor.id ? merged : n));
    return { notes: this.setOrder(kept, kept.map((n) => n.id)), links: outLinks, anchorId: anchor.id };
  },


  setPaper(notes, id, paper) {
    // 内置纸样 ∪ 市场纸样（后者运行时注册）；否则回落 plain。
    // 市场纸样曾被误判为非法 → 静默转成 plain，是「市场皮肤无法持久化、重启变默认」的根因。
    const p = (this.PAPERS.indexOf(paper) >= 0 || (this.MARKET_PAPERS || []).indexOf(paper) >= 0) ? paper : 'plain';
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { paper: p }) : n));
  },

  /** 结构级别：非法值回落正文（'p'），与 _applyLevel 一致 */
  setLevel(notes, id, level) {
    const lv = this.LEVELS.indexOf(level) >= 0 ? level : 'p';
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { level: lv }) : n));
  },

  setDate(notes, id, date) {
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { date: typeof date === 'string' ? date : '' }) : n));
  },

  setZoom(notes, id, zoom) {
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { zoom: this._clampZoom(zoom) }) : n));
  },

  setFontScale(notes, id, fontScale) {
    const fs = (isFinite(Number(fontScale)) && Number(fontScale) > 0) ? Number(fontScale) : 1;
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { fontScale: fs }) : n));
  },

  setRot(notes, id, rot) {
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { rot: this._normRot(rot) }) : n));
  },

  setPos(notes, id, x, y) {
    return notes.map((n) => (n.id === id
      ? Object.assign({}, n, { x: Math.round(x), y: Math.round(y) }) : n));
  },

  /** 批量写位置（pos: Map<id,{x,y}>）：单趟 map 取代「逐卡 setPos」的 O(n²)，顺流/分幕重排用 */
  setPositions(notes, pos) {
    if (!pos || typeof pos.get !== 'function' || pos.size === 0) return notes;
    return notes.map((n) => {
      const p = pos.get(n.id);
      return p ? Object.assign({}, n, { x: Math.round(p.x), y: Math.round(p.y) }) : n;
    });
  },

  /** 删一张卡片：**连带删掉与它相关的所有连线**（否则会留下指向空气的线） */
  removeNote(notes, links, id) {
    const ns = notes.filter((n) => n.id !== id);
    const ls = links.filter((l) => l.from !== id && l.to !== id);
    // 删卡会留 seq 空档 → 压紧回连续（仅在已全部带 seq 时做，避免无谓污染未升维的数据）
    const allSeq = ns.length > 0 && ns.every((n) => Number.isFinite(n.seq));
    return {
      notes: allSeq ? this.normalizeSeq(ns, ls) : ns,
      links: ls,
    };
  },

  /** 连一条线：两张卡都得存在、不能自连、同一对只留一条。不合法返回 null */
  addLink(notes, links, from, to) {
    if (!from || !to || from === to) return null;
    const ids = new Set(notes.map((n) => n.id));
    if (!ids.has(from) || !ids.has(to)) return null;
    if (links.some((l) => (l.from === from && l.to === to) || (l.from === to && l.to === from))) return null;
    return links.concat([{ from, to, route: 'bezier', bend: 0, dash: 'solid' }]);
  },

  removeLink(links, from, to) {
    return links.filter((l) => !((l.from === from && l.to === to) || (l.from === to && l.to === from)));
  },

  /** 按 seq（文章顺序）列出全部卡 id。批量连线前后据此固化读序，连线变化不改文章顺序。 */
  idsBySeq(notes) {
    return (Array.isArray(notes) ? notes : [])
      .filter((n) => n && n.id)
      .slice()
      .sort((a, b) => (Number(a.seq) || 0) - (Number(b.seq) || 0))
      .map((n) => n.id);
  },

  /** 一键连线：按文章顺序把全部卡连成一条单向链（替换现有连线）。
   *  链顺序与 seq 一致，故连完后读序不变；写作档的连线语义就是文章顺序，不需要分叉。 */
  chainLinks(notes) {
    const ids = this.idsBySeq(notes);
    const out = [];
    for (let i = 1; i < ids.length; i += 1) {
      out.push({ from: ids[i - 1], to: ids[i], route: 'bezier', bend: 0, dash: 'solid' });
    }
    return out;
  },

  /** 按需连线：选中集按文章顺序连成链，只增不删；集合外的连线原样保留。
   *  复用 addLink 的双向去重与 id 有效性校验，避免重复/悬空线。 */
  linkSelection(notes, links, ids) {
    const wanted = new Set(Array.isArray(ids) ? ids : []);
    const ordered = this.idsBySeq(notes).filter((id) => wanted.has(id));
    let out = (Array.isArray(links) ? links : []).slice();
    for (let i = 1; i < ordered.length; i += 1) {
      const next = this.addLink(notes, out, ordered[i - 1], ordered[i]);
      if (next) out = next;
    }
    return out;
  },

  /** 按需删除连线：只删两端都在选中集内的连线，跨越集合边界的线保留。 */
  unlinkSelection(links, ids) {
    const wanted = new Set(Array.isArray(ids) ? ids : []);
    return (Array.isArray(links) ? links : [])
      .filter((l) => !(l && wanted.has(l.from) && wanted.has(l.to)));
  },

  /** 选中集是否已按文章顺序连成链（只看集合内部的相邻对，跨边界的线不算）。
   *  多选条上的「连线 / 断开」是同一个键的两态，靠它决定当前该显示哪一面。 */
  selectionChained(notes, links, ids) {
    const wanted = new Set(Array.isArray(ids) ? ids : []);
    const ordered = this.idsBySeq(notes).filter((id) => wanted.has(id));
    if (ordered.length < 2) return false;
    const list = Array.isArray(links) ? links : [];
    const has = (a, b) => list.some((l) => (l.from === a && l.to === b) || (l.from === b && l.to === a));
    for (let i = 1; i < ordered.length; i += 1) {
      if (!has(ordered[i - 1], ordered[i])) return false;
    }
    return true;
  },



  /**
   * 给新卡片找一个不压住已有卡片的落点：以 anchor 为中心向外螺旋试探。
   * 确定性算法（不随机），保证连点多次新建也不会叠在一起。
   * 性能：用网格哈希把 taken() 从 O(N) 降到 ~O(1)（只查落点周围 3×3 格里的真实卡片），
   * 否则连点几百张会变成 O(N²)。卡片间距 = (dx,dy) 且 freeSpot 本就避免重叠，
   * 故两卡片中心绝不会落入同一/相邻格，3×3 邻域精确判定既快又无损正确。
   */
  freeSpot(notes, anchor) {
    const a = anchor || { x: 0, y: 0 };
    const dx = this.EST_W + this.GAP;
    const dy = this.EST_H + this.GAP;
    const grid = new Map();
    const cellKey = (x, y) => Math.floor(x / dx) + ',' + Math.floor(y / dy);
    (Array.isArray(notes) ? notes : []).forEach((n) => {
      const k = cellKey(n.x, n.y);
      let arr = grid.get(k);
      if (!arr) { arr = []; grid.set(k, arr); }
      arr.push(n);
    });
    const taken = (x, y) => {
      const cx = Math.floor(x / dx), cy = Math.floor(y / dy);
      for (let ix = -1; ix <= 1; ix++) {
        for (let iy = -1; iy <= 1; iy++) {
          const arr = grid.get((cx + ix) + ',' + (cy + iy));
          if (!arr) continue;
          for (let i = 0; i < arr.length; i++) {
            const n = arr[i];
            if (Math.abs(n.x - x) < this.EST_W && Math.abs(n.y - y) < this.EST_H) return true;
          }
        }
      }
      return false;
    };
    if (!taken(a.x, a.y)) return { x: Math.round(a.x), y: Math.round(a.y) };
    for (let ring = 1; ring <= 12; ring++) {
      const cands = [];
      for (let i = -ring; i <= ring; i++) {
        cands.push({ x: a.x + i * dx, y: a.y + ring * dy });
        cands.push({ x: a.x + i * dx, y: a.y - ring * dy });
        cands.push({ x: a.x + ring * dx, y: a.y + i * dy });
        cands.push({ x: a.x - ring * dx, y: a.y + i * dy });
      }
      const hit = cands.find((c) => !taken(c.x, c.y));
      if (hit) return { x: Math.round(hit.x), y: Math.round(hit.y) };
    }
    return { x: Math.round(a.x + dx * 3), y: Math.round(a.y + dy * 3) };
  },
};

// 双保险：与其它模块同一套路，打包器未解析 import 时也能从 window 取到
if (typeof window !== 'undefined') window.WritingDoc = WritingDoc;
