/**
 * mindmapDoc — 思维子弹的纯逻辑（无 DOM、无存储、无副作用）
 *
 * 数据模型（用户选定：**不做传统思维导图，不给任何结构约束**）：
 *   node = { id, text, x, y }   子弹：一句短文本 + 自由坐标
 *   link = { from, to }         连线：任意两颗之间，多对多、无层级、无根
 *
 * 因此这里**没有**父子、没有自动布局、没有 layout()：位置直接来自数据，
 * 拖动即改数据；连线由用户拉出，谁连谁完全自由。曾实现过的「父子树 + 自动排布 +
 * 改层级」都已删除 —— 那是传统导图的模型，不是这个模式要的。
 *
 * 纯逻辑集中在此，便于单测（tests/mindmap.jest.test.js）；DOM 与交互在 mindmapFeature.js。
 */
export const MindmapDoc = {
  EST_W: 132,   // 估算宽度（只用于「给新子弹找空位」，真实尺寸由 DOM 量）
  EST_H: 40,
  GAP: 18,

  /** 节点 id：时间戳 + 随机后缀，肉眼可读 */
  newId() {
    return 'mn' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  /**
   * 形状修复（读档后必跑）：去重 id、坐标补齐、丢掉自环与重复/悬空连线。
   * 逐条过滤、绝不整体清空 —— 与存储层同一条原则。
   */
  normalize(nodes, links) {
    const out = [];
    const seen = new Set();
    (Array.isArray(nodes) ? nodes : []).forEach((n) => {
      if (!n || typeof n.id !== 'string' || !n.id || seen.has(n.id)) return;
      seen.add(n.id);
      out.push({
        id: n.id,
        text: typeof n.text === 'string' ? n.text : '',
        x: Number.isFinite(n.x) ? n.x : 0,
        y: Number.isFinite(n.y) ? n.y : 0,
        color: typeof n.color === 'string' ? n.color : '',   // 每颗子弹可单独着色（'' = 默认）
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
    return { nodes: out, links: wires };
  },

  /** 追加一颗子弹（返回新数组，调用方负责落盘）。color 可选：'' 表示未设（随主题默认） */
  addNode(nodes, text, x, y, color) {
    return nodes.concat([{ id: this.newId(), text: text || '', x: x || 0, y: y || 0, color: color || '' }]);
  },

  /** 改一颗子弹的颜色（'' = 清回默认） */
  setColor(nodes, id, color) {
    return nodes.map((n) => (n.id === id ? Object.assign({}, n, { color: color || '' }) : n));
  },

  setText(nodes, id, text) {
    return nodes.map((n) => (n.id === id ? Object.assign({}, n, { text: text || '' }) : n));
  },

  setPos(nodes, id, x, y) {
    return nodes.map((n) => (n.id === id
      ? Object.assign({}, n, { x: Math.round(x), y: Math.round(y) }) : n));
  },

  /** 删一颗子弹：**连带删掉与它相关的所有连线**（否则会留下指向空气的线） */
  removeNode(nodes, links, id) {
    return {
      nodes: nodes.filter((n) => n.id !== id),
      links: links.filter((l) => l.from !== id && l.to !== id),
    };
  },

  /** 连一条线：两颗都得存在、不能自连、同一对只留一条。不合法返回 null */
  addLink(nodes, links, from, to) {
    if (!from || !to || from === to) return null;
    const ids = new Set(nodes.map((n) => n.id));
    if (!ids.has(from) || !ids.has(to)) return null;
    if (links.some((l) => (l.from === from && l.to === to) || (l.from === to && l.to === from))) return null;
    return links.concat([{ from, to, route: 'bezier', bend: 0, dash: 'solid' }]);
  },

  removeLink(links, from, to) {
    return links.filter((l) => !((l.from === from && l.to === to) || (l.from === to && l.to === from)));
  },

  /** 某颗子弹的所有邻居（用于删除提示等） */
  linksOf(links, id) {
    return links.filter((l) => l.from === id || l.to === id);
  },

  /**
   * 给新子弹找一个不压住已有子弹的落点：以 anchor 为中心向外螺旋试探。
   * 确定性算法（不随机），保证连点多次新建也不会叠在一起。
   * 性能：用网格哈希把 taken() 从 O(N) 降到 ~O(1)（只查落点周围 3×3 格里的真实节点），
   * 否则连点几百颗子弹会变成 O(N²)。节点间距 = (dx,dy) 且 freeSpot 本就避免重叠，
   * 故两节点中心绝不会落入同一/相邻格，3×3 邻域精确判定既快又无损正确。
   */
  freeSpot(nodes, anchor) {
    const a = anchor || { x: 0, y: 0 };
    const dx = this.EST_W + this.GAP;
    const dy = this.EST_H + this.GAP;
    // 空间哈希：cell 大小 = 节点间距，把「候选点是否压住已有节点」从每次全量扫 nodes 改为查邻域
    const grid = new Map();
    const cellKey = (x, y) => Math.floor(x / dx) + ',' + Math.floor(y / dy);
    (Array.isArray(nodes) ? nodes : []).forEach((n) => {
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

  /**
   * 旧档迁移：v1 的「父子树」→ 自由子弹 + 连线。
   * 位置用「层 × 行」粗略排（深度→列、遍历序→行），只为让老数据不叠在一起；
   * 迁移后位置就是普通数据，随便拖。
   */
  migrateFromTree(oldNodes) {
    const list = (Array.isArray(oldNodes) ? oldNodes : [])
      .filter((n) => n && typeof n.id === 'string' && n.id);
    if (!list.length) return { nodes: [], links: [] };
    const byId = new Map(list.map((n) => [n.id, n]));
    const kids = new Map();
    const hasParent = new Set();
    list.forEach((n) => {
      const p = typeof n.parent === 'string' && n.parent && n.parent !== n.id && byId.has(n.parent)
        ? n.parent : null;
      if (!p) return;
      if (!kids.has(p)) kids.set(p, []);
      kids.get(p).push(n.id);
      hasParent.add(n.id);
    });
    const pos = new Map();
    let row = 0;
    const walk = (id, depth) => {
      if (pos.has(id)) return;
      pos.set(id, { x: depth * (this.EST_W + this.GAP * 3), y: row * (this.EST_H + this.GAP) });
      row++;
      (kids.get(id) || []).forEach((k) => walk(k, depth + 1));
    };
    list.filter((n) => !hasParent.has(n.id)).forEach((n) => walk(n.id, 0));
    list.forEach((n) => walk(n.id, 0));            // 成环等漏网之鱼也摆上，避免丢内容
    const nodes = list.map((n) => {
      const p = pos.get(n.id) || { x: 0, y: 0 };
      return { id: n.id, text: typeof n.text === 'string' ? n.text : '', x: p.x, y: p.y };
    });
    const links = list.filter((n) => hasParent.has(n.id)).map((n) => ({ from: n.parent, to: n.id }));
    return this.normalize(nodes, links);
  },

  /**
   * 一次性种子：便签 → 子弹（网格排布）+ 连线（沿用便签的连线，方向由 from→to 保留）。
   * 只在用户显式点击时执行，只读便签、不回写。
   */
  seedFromCards(cards, links) {
    const list = (cards || []).filter((c) => c && c.id);
    if (!list.length) return { nodes: [], links: [] };
    const cols = Math.max(1, Math.ceil(Math.sqrt(list.length)));
    const dx = this.EST_W + this.GAP * 2;
    const dy = this.EST_H + this.GAP * 3;
    const nodes = list.map((c, i) => ({
      id: 'mns' + Math.random().toString(36).slice(2, 8) + '-' + i,
      text: c.text || '',
      x: (i % cols) * dx,
      y: Math.floor(i / cols) * dy,
    }));
    const idx = new Map(list.map((c, i) => [c.id, i]));
    const wires = (links || [])
      .filter((l) => idx.has(l.from) && idx.has(l.to) && l.from !== l.to)
      .map((l) => ({ from: nodes[idx.get(l.from)].id, to: nodes[idx.get(l.to)].id }));
    return this.normalize(nodes, wires);
  },
};

// 双保险：与其它模块同一套路，打包器未解析 import 时也能从 window 取到
if (typeof window !== 'undefined') window.MindmapDoc = MindmapDoc;
