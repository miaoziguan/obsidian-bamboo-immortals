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

    if (mode === 'radial') {
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
      roots.forEach((r) => assign(r, 0, 0, Math.PI * 2));
    } else {
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
        if (mode === 'horizontal') { xOf.set(id, depth * (NW + VGAP)); yOf.set(id, x); }
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
};
