/**
 * mindmapTree —— 从「自由连线」里抽取一棵生成树。
 *
 * 自由连线允许：多父、成环、孤立点。而结构布局（导图/逻辑图/组织图/树形图）、
 * 主干路由、后续的折叠/大纲，都需要一个稳定的「主父」视角 —— 本模块只负责这件事，
 * **不改原数据**：原始 links 完整保留，跨边/回边单独记入 backLinks，供渲染区分。
 */
export const MindmapTree = {
  /**
   * @param {Array<{id:string}>} nodes
   * @param {Array<{from:string,to:string}>} links
   * @param {string} [rootId] 指定根；缺省：入度 0 中出度最大者 → 首个节点
   * @returns {{rootId:string|null, children:Map<string,string[]>, treeLinks:Array, backLinks:Array, order:string[]}}
   */
  build(nodes, links, rootId) {
    const list = Array.isArray(nodes) ? nodes : [];
    const byId = new Set(list.map((n) => n.id));
    const valid = (l) => l && byId.has(l.from) && byId.has(l.to) && l.from !== l.to;

    const out = new Map();
    const indeg = new Map();
    list.forEach((n) => { out.set(n.id, []); indeg.set(n.id, 0); });
    const all = (Array.isArray(links) ? links : []).filter(valid);
    all.forEach((l) => { out.get(l.from).push(l.to); indeg.set(l.to, (indeg.get(l.to) || 0) + 1); });

    // 选根：显式指定 > 入度 0 中出度最大 > 首个节点（纯环兜底）
    let root = (rootId && byId.has(rootId)) ? rootId : null;
    if (!root) {
      const zero = list.filter((n) => (indeg.get(n.id) || 0) === 0);
      if (zero.length) {
        root = zero.slice().sort((a, b) => (out.get(b.id).length - out.get(a.id).length))[0].id;
      } else if (list.length) {
        root = list[0].id;
      }
    }

    const children = new Map();
    list.forEach((n) => children.set(n.id, []));
    const treeLinks = [];
    const backLinks = [];
    const order = [];
    const state = new Map();   // 1 = 在栈中，2 = 已完成

    const dfs = (id) => {
      state.set(id, 1);
      order.push(id);
      for (const to of (out.get(id) || [])) {
        const st = state.get(to);
        if (st === 1) { backLinks.push({ from: id, to }); continue; }   // 回边（成环）
        if (st === 2) { backLinks.push({ from: id, to }); continue; }   // 跨边（多父/重复方向）
        children.get(id).push(to);
        treeLinks.push({ from: id, to });
        dfs(to);
      }
      state.set(id, 2);
    };

    if (root) dfs(root);
    // 其余弱连通分量各自成根（保证所有节点都进入 order/children）
    list.forEach((n) => { if (!state.has(n.id)) dfs(n.id); });

    return { rootId: root || null, children, treeLinks, backLinks, order };
  },
};

// 测试 harness（loadModule 剥离 import）兼容。
if (typeof globalThis !== 'undefined') {
  globalThis.MindmapTree = MindmapTree;
}
