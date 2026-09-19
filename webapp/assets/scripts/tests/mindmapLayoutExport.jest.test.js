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
