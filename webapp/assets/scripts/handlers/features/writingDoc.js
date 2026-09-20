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
import { FONTS, PAPERS, LEVELS, ZOOM_MIN, ZOOM_MAX, MAX_LEN, WRITING_SCHEMA_VERSION } from './twConfig.js';
export const WritingDoc = {
  VERSION: WRITING_SCHEMA_VERSION,     // v2 = x/y/canvasOffset 统一绝对 px（与 TypewriterStore.WRITING_VERSION 同值，单一真源在 twConfig）
  ZOOM_MIN,                           // 手动缩放下界（小签 ~180px 宽）
  ZOOM_MAX,                           // 上界（铺满画布的大签）
  MAX_LEN,                            // 单卡最大字数（截断由输入层负责，模型层只导出）
  FONTS,
  PAPERS,
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
      const font = this.FONTS.indexOf(n.font) >= 0 ? n.font : 'classic';
      const paper = this.PAPERS.indexOf(n.paper) >= 0 ? n.paper : 'plain';
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
    const off = (canvasOffset && typeof canvasOffset === 'object')
      ? { x: Number(canvasOffset.x) || 0, y: Number(canvasOffset.y) || 0 }
      : { x: 0, y: 0 };
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

  setFont(notes, id, font) {
    const f = this.FONTS.indexOf(font) >= 0 ? font : 'classic';
    return notes.map((n) => (n.id === id ? Object.assign({}, n, { font: f }) : n));
  },

  setPaper(notes, id, paper) {
    const p = this.PAPERS.indexOf(paper) >= 0 ? paper : 'plain';
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

  /** 某张卡片的所有邻居（用于删除提示等） */
  linksOf(links, id) {
    return links.filter((l) => l.from === id || l.to === id);
  },

  /** 把画布偏移归一到合法数值（缺省 0,0） */
  clampOffset(offset) {
    return {
      x: (offset && Number.isFinite(offset.x)) ? offset.x : 0,
      y: (offset && Number.isFinite(offset.y)) ? offset.y : 0,
    };
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
