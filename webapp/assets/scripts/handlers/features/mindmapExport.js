/**
 * MindmapExport —— 纯导出（思维子弹图 → Markdown 大纲）。
 *
 * 不依赖 DOM、不依赖宿主：给定 nodes / links 与可选 selIds，返回 { content, title }。
 * 抽离自 mindmapFeature.js.buildMarkdown，便于脱离 UI 单测（见 mindmapExport.jest.test.js）。
 */
export const MindmapExport = {
  /**
   * 导出为 Markdown 大纲（from→to 视为父子）。
   * @param {Array} nodes 子弹数组 {id,text,x,y}
   * @param {Array} links 连线数组 {from,to}
   * @param {Array|Set} [selIds] 仅导出选中分支（单选/框选）；空则导出整图
   * @returns {{content:string, title:string}}
   */
  build(nodes, links, selIds) {
    if (!nodes.length) return { content: '', title: '' };
    const idSet = (selIds && (Array.isArray(selIds) ? selIds.length : selIds.size))
      ? new Set(Array.isArray(selIds) ? selIds : Array.from(selIds))
      : null;
    const inScope = (id) => !idSet || idSet.has(id);
    const byId = new Map();
    nodes.forEach((n) => byId.set(n.id, n));
    const childrenOf = new Map();
    const indeg = new Map();
    nodes.forEach((n) => { childrenOf.set(n.id, []); indeg.set(n.id, 0); });
    let linkCount = 0;
    links.forEach((l) => {
      if (!byId.has(l.from) || !byId.has(l.to)) return;
      if (idSet && (!inScope(l.from) || !inScope(l.to))) return;   // 只统计选择范围内的连线
      childrenOf.get(l.from).push(l.to);
      indeg.set(l.to, (indeg.get(l.to) || 0) + 1);
      linkCount++;
    });
    const oneLine = (n) => {
      const t = (n && n.text ? String(n.text) : '').replace(/\r?\n/g, ' ').trim();
      return t || '（未填）';
    };
    const visited = new Set();
    const lines = [];
    const renderNode = (id, depth) => {
      if (visited.has(id) || !inScope(id)) return;
      visited.add(id);
      lines.push('  '.repeat(depth) + '- ' + oneLine(byId.get(id)));
      (childrenOf.get(id) || []).forEach((c) => renderNode(c, depth + 1));
    };
    const scopeNodes = idSet ? nodes.filter((n) => idSet.has(n.id)) : nodes;
    let roots = scopeNodes.filter((n) => (indeg.get(n.id) || 0) === 0).map((n) => n.id);
    if (!roots.length && scopeNodes.length) {
      // 纯环图（无入度为 0 的节点）：兜底以任意未访问节点为根，靠 visited 去重防死循环
      roots = [scopeNodes[0].id];
    }
    roots.forEach((r) => renderNode(r, 0));
    const orphans = scopeNodes.filter((n) => !visited.has(n.id)).map((n) => n.id);
    if (orphans.length) {
      lines.push('', '## 未连接');
      orphans.forEach((id) => lines.push('- ' + oneLine(byId.get(id))));
    }
    const d = new Date();
    const pad = (x) => String(x).padStart(2, '0');
    const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const title = (roots.length ? oneLine(byId.get(roots[0]))
      : (scopeNodes[0] ? oneLine(scopeNodes[0]) : '')).slice(0, 24) || '思维子弹';
    const scopeCnt = idSet ? scopeNodes.length : nodes.length;
    // 元信息改用 YAML frontmatter：Obsidian 会把它解析成文档属性（Properties），可检索、可排序；
    // 原来那行 blockquote 只是普通正文，无法被当作数据使用。frontmatter 必须在文件第一行。
    // 时间戳加引号锁定为字符串：避免被 YAML 的「时间戳」类型规则改写格式。
    const front = [
      '---',
      `导出时间: "${stamp}"`,
      `子弹数: ${scopeCnt}`,
      `连线数: ${linkCount}`,
    ];
    if (idSet) front.push('导出范围: 仅选中分支');
    front.push('---', '');
    const header = ['# 思维子弹导图大纲', ''];
    return { content: front.concat(header, lines).join('\n'), title };
  },
};
