/**
 * @jest-environment jsdom
 */
// 思维子弹独立文档：纯逻辑（MindmapDoc，自由模型）+ 存储层（TypewriterStore 读/写/净化）。
// 模型已彻底改为「自由子弹 + 自由连线」：没有层级、没有自动布局、没有父子树。
// 因此这里只验证：坐标即数据、连线自由成对、删子弹连带删线、种子只读便签、存储分 key 互不污染。
const { loadModule } = require('./__helpers__/testUtils');

const { MindmapDoc } = loadModule('handlers/features/mindmapDoc.js', ['MindmapDoc']);

describe('MindmapDoc 纯逻辑（自由模型）', () => {
  describe('normalize：形状修复、绝不整体清空', () => {
    test('补齐缺省坐标、过滤非法项', () => {
      const out = MindmapDoc.normalize(
        [{ id: 'a', text: '甲', x: 1, y: 2 }, { id: '', text: '无 id' }, null, { id: 'a', text: '重复' }],
        []
      );
      expect(out.nodes.map((n) => n.id)).toEqual(['a']);        // 重复 id 去重
      expect(out.nodes[0]).toEqual({ id: 'a', text: '甲', x: 1, y: 2, color: '' });
    });

    test('丢弃自环、悬空、重复连线（同一对不分方向只留一条）', () => {
      const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const links = [
        { from: 'a', to: 'a' },                 // 自环
        { from: 'a', to: 'ghost' },             // 悬空
        { from: 'a', to: 'b' },
        { from: 'b', to: 'a' },                 // 与上式同对（反向）
        { from: 'b', to: 'c' },
      ];
      const out = MindmapDoc.normalize(nodes, links);
      expect(out.links).toEqual([
        { from: 'a', to: 'b', route: 'bezier', bend: 0, dash: 'solid' },
        { from: 'b', to: 'c', route: 'bezier', bend: 0, dash: 'solid' },
      ]);
    });
  });

  describe('节点增改', () => {
    test('addNode 返回新数组，不改原数据', () => {
      const base = [{ id: 'a', text: '旧', x: 0, y: 0 }];
      const next = MindmapDoc.addNode(base, '新', 10, 20);
      expect(base).toHaveLength(1);
      expect(next).toHaveLength(2);
      expect(next[1].text).toBe('新');
      expect(next[1].x).toBe(10);
      expect(next[1].y).toBe(20);
    });

    test('setText / setPos 不可变更新', () => {
      const nodes = [{ id: 'a', text: 'x', x: 1, y: 1 }];
      const t = MindmapDoc.setText(nodes, 'a', '改');
      const p = MindmapDoc.setPos(nodes, 'a', 5, 6);
      expect(nodes[0].text).toBe('x');          // 原数组不动
      expect(t[0].text).toBe('改');
      expect(p[0]).toEqual({ id: 'a', text: 'x', x: 5, y: 6 });
    });
  });

  describe('连线自由成对', () => {
    const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    test('addLink：合法才加，返回新数组；自连/重复/悬空返回 null', () => {
      expect(MindmapDoc.addLink(nodes, [], 'a', 'b')).toEqual([{ from: 'a', to: 'b', route: 'bezier', bend: 0, dash: 'solid' }]);
      expect(MindmapDoc.addLink(nodes, [], 'a', 'a')).toBeNull();           // 自连
      expect(MindmapDoc.addLink(nodes, [], 'a', 'ghost')).toBeNull();       // 悬空
      const one = MindmapDoc.addLink(nodes, [], 'a', 'b');
      expect(MindmapDoc.addLink(nodes, one, 'b', 'a')).toBeNull();          // 反向重复
    });

    test('removeLink：按对删除，不分方向', () => {
      const links = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }];
      expect(MindmapDoc.removeLink(links, 'b', 'a')).toEqual([{ from: 'b', to: 'c' }]);
    });
  });

  describe('删子弹连带删线', () => {
    test('removeNode：节点与其所有连线一并清除', () => {
      const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const links = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'a', to: 'c' }];
      const { nodes: ns, links: ls } = MindmapDoc.removeNode(nodes, links, 'b');
      expect(ns.map((n) => n.id)).toEqual(['a', 'c']);
      expect(ls).toEqual([{ from: 'a', to: 'c' }]);     // 与 b 相关的两条线都没了
    });
  });

  describe('freeSpot：给新子弹找不重叠落点', () => {
    test('空白处直接返回 anchor', () => {
      expect(MindmapDoc.freeSpot([], { x: 50, y: 50 })).toEqual({ x: 50, y: 50 });
    });
    test('被占则向外偏移，且不与已有重叠', () => {
      const nodes = [{ id: 'a', x: 0, y: 0 }];
      const spot = MindmapDoc.freeSpot(nodes, { x: 0, y: 0 });
      expect(Math.abs(spot.x - 0) >= MindmapDoc.EST_W || Math.abs(spot.y - 0) >= MindmapDoc.EST_H).toBe(true);
      expect(nodes.some((n) => Math.abs(n.x - spot.x) < MindmapDoc.EST_W && Math.abs(n.y - spot.y) < MindmapDoc.EST_H)).toBe(false);
    });
  });

  describe('migrateFromTree：旧 v1 父子树 → 自由子弹 + 连线', () => {
    test('parent 关系转为连线，无自环；位置仅作兜底摆开', () => {
      const old = [
        { id: 'a', text: '根', parent: null },
        { id: 'b', text: '一', parent: 'a' },
        { id: 'c', text: '一', parent: 'a' },
        { id: 'd', text: '二', parent: 'b' },
      ];
      const { nodes, links } = MindmapDoc.migrateFromTree(old);
      expect(nodes).toHaveLength(4);
      expect(nodes.every((n) => !('parent' in n))).toBe(true);   // 迁移后无 parent 字段
      const pair = (from, to) => (l) => (l.from === from && l.to === to);
      expect(links.some(pair('a', 'b'))).toBe(true);
      expect(links.some(pair('a', 'c'))).toBe(true);
      expect(links.some(pair('b', 'd'))).toBe(true);
      expect(links.some((l) => l.from === l.to)).toBe(false);     // 无自环
    });
    test('坏数据（无 id / 环）不炸、内容不丢', () => {
      const { nodes, links } = MindmapDoc.migrateFromTree([
        { id: 'a', parent: null },
        { id: 'b', parent: 'a' },
        { id: 'a', parent: 'b' },     // 与上式成环
        null,
      ]);
      expect(nodes.length).toBeGreaterThanOrEqual(2);
      expect(links.every((l) => l.from !== l.to)).toBe(true);
    });
  });

  describe('seedFromCards：一次性（便签 → 子弹 + 连线）', () => {
    const cards = [{ id: 'c1', text: '甲' }, { id: 'c2', text: '乙' }, { id: 'c3', text: '丙' }];

    test('连线 from→to 映射成子弹连线', () => {
      const { nodes, links } = MindmapDoc.seedFromCards(cards, [{ from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3' }]);
      expect(nodes).toHaveLength(3);
      expect(links).toHaveLength(2);
      const idByText = new Map(nodes.map((n) => [n.text, n.id]));
      expect(links).toContainEqual({ from: idByText.get('甲'), to: idByText.get('乙'), route: 'bezier', bend: 0, dash: 'solid' });
    });

    test('无连线也不报错；空便签 → 空', () => {
      expect(MindmapDoc.seedFromCards(cards, []).nodes).toHaveLength(3);
      expect(MindmapDoc.seedFromCards([], []).nodes).toEqual([]);
    });
  });
});

describe('存储层：独立 key + 净化（TypewriterStore）', () => {
  const mem = {};
  beforeEach(() => {
    Object.keys(mem).forEach((k) => delete mem[k]);
    global.window = global.window || {};
    global.window.storageManager = {
      getSetting: jest.fn(async (k) => mem[k]),
      putSetting: jest.fn(async (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); }),
    };
  });
  const { TypewriterStore } = loadModule('services/TypewriterStore.js', ['TypewriterStore']);

  test('与便签分 key：读导图不会碰到便签数据', async () => {
    mem[TypewriterStore.KEY_NOTES] = { version: 2, notes: [{ id: 'n1', text: '便签' }] };
    const mm = await TypewriterStore.loadMindmap();
    expect(mm.nodes).toEqual([]);
    expect(mem[TypewriterStore.KEY_NOTES].notes).toHaveLength(1);   // 便签未被触碰
  });

  test('写入后可读回，且只落在导图 key（签名：nodes, links, view）', async () => {
    const nodes = [{ id: 'a', text: '根', x: 1, y: 2 }];
    const links = [{ from: 'a', to: 'b' }];
    await TypewriterStore.saveMindmap(nodes, links, { x: 5, y: 6 });
    expect(mem[TypewriterStore.KEY_MINDMAP].nodes).toHaveLength(1);
    expect(mem[TypewriterStore.KEY_NOTES]).toBeUndefined();
    const back = await TypewriterStore.loadMindmap();
    expect(back.nodes[0].text).toBe('根');
    expect(back.links).toEqual([{ from: 'a', to: 'b' }]);
    expect(back.view).toEqual({ x: 5, y: 6 });
  });

  test('净化：逐条丢弃非法节点，绝不整体清空', async () => {
    mem[TypewriterStore.KEY_MINDMAP] = {
      version: 2,
      nodes: [
        { id: 'ok', text: '合法', x: 0, y: 0 },
        { id: '', text: '空 id' },
        { text: '没有 id' },
        null,
        { id: 'ok2', text: 123, x: 'NaN', y: 1 },
      ],
      links: [{ from: 'ok', to: 'ok2' }],
      view: { x: 0, y: 0 },
    };
    const back = await TypewriterStore.loadMindmap();
    expect(back.nodes.map((n) => n.id)).toEqual(['ok', 'ok2']);
    expect(back.nodes[1].text).toBe('');                  // 非字符串文本归一为空串
    expect(back.nodes[1].x).toBe(0);                     // 非有限数坐标归零
    expect(back.links).toEqual([{ from: 'ok', to: 'ok2' }]);
  });

  test('写前备份保留上一版', async () => {
    await TypewriterStore.saveMindmap([{ id: 'a', text: '第一版', x: 0, y: 0 }], [], null);
    await TypewriterStore.saveMindmap([{ id: 'b', text: '第二版', x: 0, y: 0 }], [], null);
    expect(mem[TypewriterStore.KEY_MINDMAP_BAK].nodes[0].id).toBe('a');
    expect(mem[TypewriterStore.KEY_MINDMAP].nodes[0].id).toBe('b');
  });
});
