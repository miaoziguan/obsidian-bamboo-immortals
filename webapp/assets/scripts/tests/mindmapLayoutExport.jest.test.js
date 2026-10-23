/**
 * 纯模块单测：MindmapLayout（布局）与 MindmapExport（导出）。
 * 抽离自 mindmapFeature.js 的 _computeLayout / buildMarkdown，此处脱离 DOM 验证其行为稳定。
 * 注意：仓库 jest 未配置 ESM transform，故经 loadModule 加载（它会剥离 export），与 mindmap.jest.test.js 同式。
 */
const { loadModule } = require('./__helpers__/testUtils');

const { MindmapLayout } = loadModule('handlers/features/mindmapLayout.js', ['MindmapLayout']);
const { MindmapExport } = loadModule('handlers/features/mindmapExport.js', ['MindmapExport']);

const NODES = [
  { id: 'a', text: '根', x: 0, y: 0 },
  { id: 'b', text: '左', x: 0, y: 0 },
  { id: 'c', text: '右', x: 0, y: 0 },
  { id: 'd', text: '左孙', x: 0, y: 0 },
];
const LINKS = [
  { from: 'a', to: 'b' },
  { from: 'a', to: 'c' },
  { from: 'b', to: 'd' },
];

describe('MindmapLayout.compute', () => {
  test('所有模式都返回全部节点坐标', () => {
    for (const mode of ['tree', 'horizontal', 'radial']) {
      const pos = MindmapLayout.compute(mode, NODES, LINKS);
      expect(pos.size).toBe(NODES.length);
      NODES.forEach((n) => {
        const p = pos.get(n.id);
        expect(p).toBeDefined();
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
      });
    }
  });

  test('树形 / 水平树：子节点位于父节点更深一层', () => {
    const tree = MindmapLayout.compute('tree', NODES, LINKS);
    expect(tree.get('a').y).toBeLessThan(tree.get('b').y);   // b 是 a 的子
    expect(tree.get('b').y).toBeLessThan(tree.get('d').y);   // d 是 b 的子

    const horiz = MindmapLayout.compute('horizontal', NODES, LINKS);
    expect(horiz.get('a').x).toBeLessThan(horiz.get('b').x); // 水平树按深度向右铺
  });

  test('坐标归一化到原点附近（min 偏移为常数 M=40）', () => {
    // 给一个任意偏移的画布，验证结果不依赖输入坐标
    const shifted = NODES.map((n, i) => ({ ...n, x: 10000 + i * 5, y: -7777 }));
    const pos = MindmapLayout.compute('tree', shifted, LINKS);
    let minX = Infinity, minY = Infinity;
    pos.forEach((p) => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); });
    expect(minX).toBe(40);
    expect(minY).toBe(40);
  });

  test('极端环图（无根）兜底不抛错、不丢节点', () => {
    const ring = [
      { id: 'x', text: 'x' },
      { id: 'y', text: 'y' },
    ];
    const ringLinks = [{ from: 'x', to: 'y' }, { from: 'y', to: 'x' }];
    const pos = MindmapLayout.compute('tree', ring, ringLinks);
    expect(pos.size).toBe(2);
    expect(Number.isFinite(pos.get('x').x)).toBe(true);
  });
});

describe('MindmapLayout · 无结构兜底（第一层：别再退化成一行 / 叠一点）', () => {
  const FLAT = [
    { id: 'n1', text: '甲', x: 10, y: 10 },
    { id: 'n2', text: '乙', x: 300, y: 20 },
    { id: 'n3', text: '丙', x: 20, y: 260 },
    { id: 'n4', text: '丁', x: 320, y: 280 },
  ];

  test('isStructured：0 连线 / 覆盖不足 → 假；覆盖过半 → 真', () => {
    expect(MindmapLayout.isStructured(FLAT, [])).toBe(false);
    // 4 个节点只有 1 条边（覆盖恰好一半）不算结构 —— 判据是「严格过半」
    expect(MindmapLayout.isStructured(FLAT, [{ from: 'n1', to: 'n2' }])).toBe(false);
    // 3 条边串起 4 颗（全覆盖）→ 有结构
    expect(MindmapLayout.isStructured(FLAT, [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
    ])).toBe(true);   // 覆盖 n1,n2,n3 = 3/4 > 0.5
    expect(MindmapLayout.isStructured(FLAT, [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' },
    ])).toBe(true);
    // 悬空边（端点不在图上）与自环不计入
    expect(MindmapLayout.isStructured(FLAT, [{ from: 'n1', to: 'zzz' }, { from: 'n2', to: 'n2' }])).toBe(false);
  });

  test('无连线：放射不再把所有子弹算到同一点', () => {
    const pos = MindmapLayout.compute('radial', FLAT, []);
    const keys = [...new Set([...pos.values()].map((p) => p.x + ',' + p.y))];
    expect(keys.length).toBe(FLAT.length);   // 退化时会是 1
  });

  test('多根：放射不再让所有根叠在原点', () => {
    // 两棵互不相连的树 → 两个根
    const nodes = [
      { id: 'r1', text: '根1' }, { id: 'c1', text: '子1' },
      { id: 'r2', text: '根2' }, { id: 'c2', text: '子2' },
    ];
    const links = [{ from: 'r1', to: 'c1' }, { from: 'r2', to: 'c2' }];
    const pos = MindmapLayout.compute('radial', nodes, links);
    const p1 = pos.get('r1'), p2 = pos.get('r2');
    expect(p1.x !== p2.x || p1.y !== p2.y).toBe(true);   // 退化时两根坐标相同
  });

  test('grid / ring：全部节点都有坐标且互不重叠', () => {
    for (const mode of ['grid', 'ring']) {
      const pos = MindmapLayout.compute(mode, FLAT, []);
      expect(pos.size).toBe(FLAT.length);
      const keys = [...new Set([...pos.values()].map((p) => p.x + ',' + p.y))];
      expect(keys.length).toBe(FLAT.length);
      pos.forEach((p) => { expect(Number.isFinite(p.x)).toBe(true); expect(Number.isFinite(p.y)).toBe(true); });
    }
  });

  test('grid 按当前视觉顺序入格（保留大致空间意图，而非打乱）', () => {
    const pos = MindmapLayout.compute('grid', FLAT, []);
    // 甲(10,10) 乙(300,20) 在同一行上方，丙/丁在下方：排序应为 甲、乙 → 丙、丁
    expect(pos.get('n1').y).toBeLessThan(pos.get('n3').y);
    expect(pos.get('n2').y).toBeLessThan(pos.get('n4').y);
    expect(pos.get('n1').x).toBeLessThan(pos.get('n2').x);
  });
});

describe('MindmapFeature 一键布局 · 结构不足时改用扁平布局（接线）', () => {
  // 纯函数对了还不够：第三键（cycleLayout）必须真的按结构充分性分组循环，
  // 且 autoLayout 被直接调用时也要兜底。此处只桩掉渲染 / 落盘，走真实分派逻辑。
  global.MindmapLayout = MindmapLayout;
  const { MindmapFeature: MM } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);

  const NODES3 = [
    { id: 'a', text: '甲', x: 0, y: 0 },
    { id: 'b', text: '乙', x: 200, y: 0 },
    { id: 'c', text: '丙', x: 0, y: 200 },
  ];

  const reset = (links) => {
    MM._nodes = NODES3.map((n) => Object.assign({}, n));
    MM._links = links;
    MM._layoutCursor = { structured: 0, flat: 0 };
    MM._selSet = new Set();
    MM._selId = null;
    MM.render = jest.fn();
    MM._centerView = jest.fn();
    MM._scheduleSave = jest.fn();
    MM._mutate = (fn) => fn();
  };

  test('无连线：点第三键循环 网格 → 环形（不再走树 / 放射）', () => {
    reset([]);
    expect(MM.cycleLayout()).toBe('网格 ▦');
    expect(MM.cycleLayout()).toBe('环形 ○');
    expect(MM.cycleLayout()).toBe('网格 ▦');   // 组内循环，不会串到结构布局
  });

  test('有层次：点第三键循环 树状 → 横向 → 放射', () => {
    reset([{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }]);
    expect(MM.cycleLayout()).toBe('树状 ↓');
    expect(MM.cycleLayout()).toBe('横向 →');
    expect(MM.cycleLayout()).toBe('放射 ◎');
  });

  test('直接调 autoLayout("radial") 但无连线 → 兜底成网格，标签说实话', () => {
    reset([]);
    expect(MM.autoLayout('radial', null)).toBe('网格 ▦');
    // 兜底确实生效：所有子弹各占一格，不再同一个坐标
    const keys = new Set(MM._nodes.map((n) => n.x + ',' + n.y));
    expect(keys.size).toBe(MM._nodes.length);
  });

  test('有层次时 autoLayout("radial") 不被改写', () => {
    reset([{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }]);
    expect(MM.autoLayout('radial', null)).toBe('放射 ◎');
  });
});

describe('MindmapExport.build', () => {
  test('空图返回空串', () => {
    const r = MindmapExport.build([], []);
    expect(r).toEqual({ content: '', title: '' });
  });

  test('整图导出含 YAML frontmatter + 大纲 + 节点文本', () => {
    const { content, title } = MindmapExport.build(NODES, LINKS);
    expect(content.startsWith('---\n')).toBe(true);   // frontmatter 在第一行
    expect(content).toContain('子弹数: 4');
    expect(content).toContain('连线数: 3');
    expect(content).toContain('# 思维子弹导图大纲');
    expect(content).toContain('- 根');
    expect(content).toContain('- 左');
    expect(content).toContain('- 右');
    expect(content).toContain('- 左孙');
    expect(title).toBe('根');
  });

  test('仅导出选中分支（selIds）', () => {
    const { content } = MindmapExport.build(NODES, LINKS, ['a', 'b', 'd']);
    expect(content).toContain('导出范围: 仅选中分支');
    expect(content).toContain('- 根');
    expect(content).toContain('- 左');
    expect(content).toContain('- 左孙');
    expect(content).not.toContain('- 右');   // 右不在选择集合
    expect(content).toContain('子弹数: 3');
  });
});
