/**
 * MindmapLayout —— 纯几何布局（树 / 水平树 / 径向 / 网格 / 环形）。
 *
 * 不依赖 DOM、不依赖宿主：给定 nodes / links 与模式，返回 Map<id, {x,y}>（已归一化到原点附近）。
 * 抽离自 mindmapFeature.js._computeLayout，便于脱离 UI 单测（见 mindmapLayout.jest.test.js）。
 */
export const MindmapLayout = {
  /**
   * 计算布局。mode ∈ 'tree' | 'horizontal' | 'radial' | 'grid' | 'ring'；
   * 非上述或未知 → 默认树形。返回 Map<id, {x, y}>。
   */
  compute(mode, nodes, links) {
    const byId = new Map();
    nodes.forEach((n) => byId.set(n.id, n));
    const childrenOf = new Map();
    const indeg = new Map();
    nodes.forEach((n) => { childrenOf.set(n.id, []); indeg.set(n.id, 0); });
    links.forEach((l) => {
      if (!byId.has(l.from) || !byId.has(l.to)) return;
      childrenOf.get(l.from).push(l.to);
      indeg.set(l.to, (indeg.get(l.to) || 0) + 1);
    });
    let roots = nodes.filter((n) => (indeg.get(n.id) || 0) === 0).map((n) => n.id);
    if (!roots.length && nodes.length) roots = [nodes[0].id];   // 纯环图兜底取首节点

    const NW = 180, NH = 64, HGAP = 28, VGAP = 46;
    const placed = new Set();
    const xOf = new Map(), yOf = new Map();

    if (mode === 'grid') {
      // 网格：无层次时的体面摆法（替代「结构布局退化成一行」）。
      // 按当前视觉顺序入格（先上后下、同行先左后右），保留用户原本的大致空间意图，
      // 而不是按创建顺序乱排 —— 否则「一键整理」会把辛苦摆好的相对位置全部打乱。
      const order = nodes.slice().sort((a, b) => {
        const ay = Number(a.y) || 0, by = Number(b.y) || 0;
        if (Math.abs(ay - by) > NH * 0.6) return ay - by;
        return (Number(a.x) || 0) - (Number(b.x) || 0);
      });
      const cols = Math.max(1, Math.ceil(Math.sqrt(order.length)));
      order.forEach((n, i) => {
        xOf.set(n.id, (i % cols) * (NW + HGAP));
        yOf.set(n.id, Math.floor(i / cols) * (NH + VGAP));
      });
    } else if (mode === 'ring') {
      // 环形：所有子弹等角分布在圆周上（无层次的头脑风暴式摆法）。
      // 半径由周长反推，保证相邻节点间距不小于一个节点宽，点多时自动撑大而不是挤成一团。
      const n = Math.max(1, nodes.length);
      const R = Math.max(240, (n * (NW + HGAP)) / (Math.PI * 2));
      nodes.forEach((nd, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;   // 从正上方起顺时针
        xOf.set(nd.id, Math.round(R * Math.cos(a)));
        yOf.set(nd.id, Math.round(R * Math.sin(a)));
      });
    } else if (mode === 'radial') {
      const leafCursor = { i: 0 };
      let leafCount = 0;
      const markLeaves = (id) => {
        if (placed.has(id)) return;
        placed.add(id);
        const ch = childrenOf.get(id) || [];
        if (!ch.length) leafCount++;
        else ch.forEach(markLeaves);
      };
      roots.forEach((r) => { placed.clear(); markLeaves(r); });
      placed.clear();
      const RING = 190;
      const angleOf = new Map();
      const assign = (id, depth, a0, a1) => {
        if (placed.has(id)) return;
        placed.add(id);
        const ch = (childrenOf.get(id) || []).filter((c) => byId.has(c));
        const span = (a1 - a0) / Math.max(1, ch.length);
        let a;
        if (!ch.length) {
          a = ((leafCursor.i + 0.5) / Math.max(1, leafCount)) * Math.PI * 2;
          leafCursor.i++;
        } else {
          ch.forEach((c, i) => assign(c, depth + 1, a0 + i * span, a0 + (i + 1) * span));
          let sa = Infinity, ea = -Infinity;
          ch.forEach((c) => { const v = angleOf.get(c); if (v != null) { sa = Math.min(sa, v); ea = Math.max(ea, v); } });
          a = (sa === Infinity) ? (a0 + a1) / 2 : (sa + ea) / 2;
        }
        angleOf.set(id, a);
        const r = depth * RING;
        xOf.set(id, Math.round(r * Math.cos(a)));
        yOf.set(id, Math.round(r * Math.sin(a)));
      };
      // 多根时不能再都放 depth=0：r = depth*RING 会让每个根都算出原点坐标（重叠成一坨）。
      // 单根 → 居中；多根 → 各占一个角度扇区、分布在第 1 环上。
      if (roots.length === 1) {
        assign(roots[0], 0, 0, Math.PI * 2);
      } else {
        roots.forEach((r, i) => {
          const a0 = (i / roots.length) * Math.PI * 2;
          const a1 = ((i + 1) / roots.length) * Math.PI * 2;
          assign(r, 1, a0, a1);
        });
      }
    } else if (mode === 'mindmap' && roots.length === 1) {
      // 双侧思维导图：根居中，直属子左右交替，各侧按水平树向外生长。
      // 只处理单根（结构模式传入的是生成树，天然单根）；多根/无根时退回下方树/水平树。
      const root = roots[0];
      placed.add(root);
      xOf.set(root, 0);
      yOf.set(root, 0);
      const kids = (childrenOf.get(root) || []).filter((c) => byId.has(c));
      const kidsOf = (id) => (childrenOf.get(id) || []).filter((c) => byId.has(c) && !placed.has(c));
      const leafCount = (id) => {
        const ch = kidsOf(id);
        if (!ch.length) return 1;
        return ch.reduce((s, c) => s + leafCount(c), 0);
      };
      const place = (id, depth, dir, cursor) => {
        if (placed.has(id)) return;
        placed.add(id);
        const ch = kidsOf(id);
        xOf.set(id, depth * (NW + HGAP) * dir);
        if (!ch.length) {
          yOf.set(id, cursor.y);
          cursor.y += NH + VGAP;
          return;
        }
        ch.forEach((c) => place(c, depth + 1, dir, cursor));
        const ys = ch.map((c) => yOf.get(c)).filter((v) => v != null);
        yOf.set(id, ys.length ? (ys[0] + ys[ys.length - 1]) / 2 : cursor.y);
      };
      const placeSide = (side, dir) => {
        const total = side.reduce((s, c) => s + leafCount(c), 0);
        const cursor = { y: -((total - 1) * (NH + VGAP)) / 2 };   // 每侧纵向居中到根
        side.forEach((c) => place(c, 1, dir, cursor));
      };
      const right = [], left = [];
      kids.forEach((c, i) => (i % 2 === 0 ? right : left).push(c));
      placeSide(right, 1);
      placeSide(left, -1);
    } else {
      const horizontal = (mode === 'horizontal' || mode === 'logic');
      let cursor = 0;
      const place = (id, depth) => {
        if (placed.has(id)) return;
        placed.add(id);
        const ch = (childrenOf.get(id) || []).filter((c) => byId.has(c) && !placed.has(c));
        let x;
        if (!ch.length) { x = cursor; cursor += NW + HGAP; }
        else {
          ch.forEach((c) => place(c, depth + 1));
          const xs = ch.map((c) => xOf.get(c)).filter((v) => v != null);
          x = xs.length ? (xs[0] + xs[xs.length - 1]) / 2 : cursor;
        }
        // logic = 左→右（横向树）；tree / org = 上→下（纵向树）
        if (horizontal) { xOf.set(id, depth * (NW + VGAP)); yOf.set(id, x); }
        else { xOf.set(id, x); yOf.set(id, depth * (NH + VGAP)); }
      };
      roots.forEach((r) => place(r, 0));
    }

    // 归一化到原点附近
    let minX = Infinity, minY = Infinity;
    xOf.forEach((v) => { if (v < minX) minX = v; });
    yOf.forEach((v) => { if (v < minY) minY = v; });
    if (!isFinite(minX)) minX = 0;
    if (!isFinite(minY)) minY = 0;
    const M = 40;
    const out = new Map();
    xOf.forEach((v, k) => out.set(k, { x: Math.round(v - minX + M), y: Math.round((yOf.get(k) || 0) - minY + M) }));

    // 兜底：任何未落位节点（极端环图）按序号排在圆周
    const missing = nodes.filter((n) => !out.has(n.id));
    if (missing.length) {
      const R = 240;
      missing.forEach((n, i) => {
        const a = (i / missing.length) * Math.PI * 2;
        out.set(n.id, { x: Math.round(R * Math.cos(a)) + 320, y: Math.round(R * Math.sin(a)) + 320 });
      });
    }
    return out;
  },

  /**
   * 结构充分性判据：结构布局（树 / 水平 / 放射）只吃 links —— 图里没有层次时它们必然退化：
   * 0 连线的图里每个节点都是根，树状退化成「排成一行」，放射退化成「全部叠在原点」。
   * 判据：存在有效边（两端都在图上、非自环），且被连线覆盖的节点占比**严格过半** ——
   * 取严格大于而非 ≥：4 颗子弹只有 1 条边（覆盖恰好一半）算不上结构，跑树状仍大半是散点。
   * 不足 → 应改走扁平布局（grid / ring），而不是硬跑结构布局。
   */
  isStructured(nodes, links) {
    const list = nodes || [];
    if (!list.length) return false;
    const byId = new Set(list.map((n) => n.id));
    let edges = 0;
    const covered = new Set();
    (links || []).forEach((l) => {
      if (!byId.has(l.from) || !byId.has(l.to) || l.from === l.to) return;
      edges += 1;
      covered.add(l.from);
      covered.add(l.to);
    });
    if (!edges) return false;
    return (covered.size / list.length) > 0.5;
  },
};
