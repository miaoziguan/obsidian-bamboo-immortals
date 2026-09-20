/**
 * @jest-environment jsdom
 */
// MD可视化写作档独立文档：纯逻辑（WritingDoc，与 MindmapDoc 同构的自由模型）。
// 模型已彻底改为「卡片 + 连线」：没有层级树、没有自动布局。
// 这里只验证：卡片字段有界、连线自由成对、删卡片连带删线、枚举校正、画布偏移净化。
const { loadModule } = require('./__helpers__/testUtils');

const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);

describe('WritingDoc 顺序一等数据（seq）', () => {
  // 旧数据形态：只有坐标（+可选连线），没有 seq —— 即升维要处理的输入
  const legacyNotes = () => ([
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 0, y: 100 },
    { id: 'c', x: 50, y: 200 },
  ]);

  test('orderIds：无连线 → 阅读顺序（先 y 后 x）', () => {
    expect(WritingDoc.orderIds(legacyNotes(), [])).toEqual(['a', 'b', 'c']);
  });

  test('orderIds：有连线 → 连线优先（DFS），坐标只用于稳定多分支', () => {
    // c 在最下方，但 a→c→b 的连线决定了顺序
    expect(WritingDoc.orderIds(legacyNotes(), [
      { from: 'a', to: 'c' }, { from: 'c', to: 'b' },
    ])).toEqual(['a', 'c', 'b']);
  });

  test('orderIds：成环不死循环、孤立卡补尾', () => {
    const ids = WritingDoc.orderIds(
      [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 0, y: 10 }, { id: 'z', x: 999, y: 999 }],
      [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }]
    );
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);        // 全部卡都在，且无重复
  });

  test('normalize 升维：旧数据（无 seq）读出连续唯一的 seq，且顺序与旧推导一致', () => {
    const out = WritingDoc.normalize(legacyNotes(), [{ from: 'a', to: 'c' }, { from: 'c', to: 'b' }]);
    const byId = new Map(out.notes.map((n) => [n.id, n]));
    // 升维结果必须与 orderIds 逐字一致 —— 这是「用户感知顺序不变」的硬保证
    expect(out.notes.slice().sort((p, q) => p.seq - q.seq).map((n) => n.id))
      .toEqual(WritingDoc.orderIds(legacyNotes(), [{ from: 'a', to: 'c' }, { from: 'c', to: 'b' }]));
    expect(byId.get('a').seq).toBe(0);
    expect(byId.get('c').seq).toBe(1);
    expect(byId.get('b').seq).toBe(2);
  });

  test('seq 唯一且连续 0..N-1（normalizeSeq 压紧空档）', () => {
    const messy = [
      { id: 'a', seq: 7, x: 0, y: 0 },
      { id: 'b', seq: 3, x: 0, y: 10 },
      { id: 'c', seq: 99, x: 0, y: 20 },
    ];
    const out = WritingDoc.normalizeSeq(messy, []);
    const seqs = out.map((n) => n.seq).sort((p, q) => p - q);
    expect(seqs).toEqual([0, 1, 2]);
    // 以 seq 为准（而非坐标）：b(3) < a(7) < c(99)
    expect(out.slice().sort((p, q) => p.seq - q.seq).map((n) => n.id)).toEqual(['b', 'a', 'c']);
  });

  test('normalizeSeq 幂等：对已规范输入重复调用结果不变', () => {
    const once = WritingDoc.normalize(legacyNotes(), []);
    const twice = WritingDoc.normalizeSeq(once.notes, once.links);
    expect(twice.map((n) => n.seq)).toEqual(once.notes.map((n) => n.seq));
  });

  test('坐标不再参与语义：改坐标不改 seq（顺序真值稳定）', () => {
    const base = WritingDoc.normalize(legacyNotes(), []);
    const moved = base.notes.map((n) => (n.id === 'c' ? Object.assign({}, n, { y: -500 }) : n));
    const after = WritingDoc.normalizeSeq(moved, []);
    const rankBefore = new Map(base.notes.map((n) => [n.id, n.seq]));
    const rankAfter = new Map(after.map((n) => [n.id, n.seq]));
    expect([...rankBefore.entries()].sort()).toEqual([...rankAfter.entries()].sort());
  });

  test('setOrder：显式重排按给定 id 序列重写 seq', () => {
    const notes = WritingDoc.normalize(legacyNotes(), []).notes;   // a0 b1 c2
    const out = WritingDoc.setOrder(notes, ['c', 'a', 'b']);
    expect(out.slice().sort((p, q) => p.seq - q.seq).map((n) => n.id)).toEqual(['c', 'a', 'b']);
  });

  test('addNote 接文末（seq = max+1）；removeNote 压紧空档', () => {
    let notes = WritingDoc.normalize(legacyNotes(), []).notes;     // a0 b1 c2
    notes = WritingDoc.addNote(notes, '丁', 0, 300);
    const added = notes.find((n) => n.text === '丁');
    expect(added.seq).toBe(3);                                     // 接在文末

    const after = WritingDoc.removeNote(notes, [], 'a');           // 删掉 seq=0 那张
    const seqs = after.notes.map((n) => n.seq).sort((p, q) => p - q);
    expect(seqs).toEqual([0, 1, 2]);                               // 空档被压紧
  });
});

describe('WritingDoc 纯逻辑（自由模型）', () => {
  describe('normalize：形状修复、绝不整体清空', () => {
    test('补齐缺省、按枚举校正非法字段、过滤非法项', () => {
      const out = WritingDoc.normalize(
        [
          { id: 'a', text: '甲', x: 1, y: 2, font: 'modern', paper: 'night', level: 'h2', zoom: 1.5 },
          { id: '', text: '无 id' },                                  // 无 id
          null,                                                       // 非对象
          { id: 'a', text: '重复' },                                  // 重复 id
          { id: 'b', font: '未知字体', paper: '未知纸', level: 'x9', zoom: 99, rot: 540 },  // 非法枚举/越界
        ],
        []
      );
      expect(out.notes.map((n) => n.id)).toEqual(['a', 'b']);         // 重复 id 去重
      expect(out.notes[0]).toMatchObject({ id: 'a', text: '甲', x: 1, y: 2, font: 'modern', paper: 'night', level: 'h2', zoom: 1.5 });
      // 非法枚举回落默认、越界被钳（zoom 99→2.4、rot 540→-180，与 _applyRot 归一一致）
      expect(out.notes[1]).toMatchObject({ font: 'classic', paper: 'plain', level: 'p', zoom: 2.4, rot: -180 });
    });

    test('canvasOffset 净化：缺省 0,0、非法值兜底', () => {
      expect(WritingDoc.normalize([], [], null).canvasOffset).toEqual({ x: 0, y: 0 });
      expect(WritingDoc.normalize([], [], { x: 5, y: 'xx' }).canvasOffset).toEqual({ x: 5, y: 0 });
    });

    test('丢弃自环、悬空、重复连线（同一对不分方向只留一条）', () => {
      const notes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const links = [
        { from: 'a', to: 'a' },                 // 自环
        { from: 'a', to: 'ghost' },             // 悬空
        { from: 'a', to: 'b' },
        { from: 'b', to: 'a' },                 // 与上式同对（反向）
        { from: 'b', to: 'c' },
      ];
      const out = WritingDoc.normalize(notes, links);
      expect(out.links).toEqual([
        { from: 'a', to: 'b', route: 'bezier', bend: 0, dash: 'solid' },
        { from: 'b', to: 'c', route: 'bezier', bend: 0, dash: 'solid' },
      ]);
    });
  });

  describe('卡片增改（不可变）', () => {
    test('addNote 返回新数组，原数组不动；视觉属性走默认值', () => {
      const base = [{ id: 'a', text: '旧', x: 0, y: 0 }];
      const next = WritingDoc.addNote(base, '新', 10, 20, { level: 'h1' });
      expect(base).toHaveLength(1);
      expect(next).toHaveLength(2);
      expect(next[1].text).toBe('新');
      expect(next[1].x).toBe(10);
      expect(next[1].level).toBe('h1');
      expect(next[1]).toMatchObject({ font: 'classic', paper: 'plain', zoom: 1, fontScale: 1, rot: 0 });
      expect(typeof next[1].id).toBe('string');
      expect(next[1].id.startsWith('wc')).toBe(true);
    });

    test('setText / setFont / setLevel / setZoom / setPos 不可变更新', () => {
      const notes = [{ id: 'a', text: 'x', x: 1, y: 1, font: 'classic', paper: 'plain', level: 'p', zoom: 1, rot: 0 }];
      const t = WritingDoc.setText(notes, 'a', '改');
      const f = WritingDoc.setFont(notes, 'a', 'kai');
      const lv = WritingDoc.setLevel(notes, 'a', 'h3');
      const z = WritingDoc.setZoom(notes, 'a', 9);     // 越界钳到 2.4
      const p = WritingDoc.setPos(notes, 'a', 5.6, 6.4); // 取整
      expect(notes[0].text).toBe('x');                  // 原数组不动
      expect(t[0].text).toBe('改');
      expect(f[0].font).toBe('kai');
      expect(lv[0].level).toBe('h3');
      expect(z[0].zoom).toBe(2.4);
      expect(p[0]).toMatchObject({ x: 6, y: 6 });
      // 非法枚举回落默认
      expect(WritingDoc.setLevel(notes, 'a', 'zzz')[0].level).toBe('p');
      expect(WritingDoc.setFont(notes, 'a', 'zzz')[0].font).toBe('classic');
    });
  });

  describe('连线自由成对', () => {
    const notes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    test('addLink：合法才加，返回新数组；自连/重复/悬空返回 null', () => {
      expect(WritingDoc.addLink(notes, [], 'a', 'b')).toEqual([{ from: 'a', to: 'b', route: 'bezier', bend: 0, dash: 'solid' }]);
      expect(WritingDoc.addLink(notes, [], 'a', 'a')).toBeNull();            // 自连
      expect(WritingDoc.addLink(notes, [], 'a', 'ghost')).toBeNull();        // 悬空
      const one = WritingDoc.addLink(notes, [], 'a', 'b');
      expect(WritingDoc.addLink(notes, one, 'b', 'a')).toBeNull();           // 反向重复
    });

    test('removeNote 连带删线', () => {
      let links = [];
      links = WritingDoc.addLink(notes, links, 'a', 'b');
      links = WritingDoc.addLink(notes, links, 'a', 'c');
      const r = WritingDoc.removeNote(notes, links, 'a');
      expect(r.notes.map((n) => n.id)).toEqual(['b', 'c']);
      expect(r.links).toEqual([]);                                           // 与 a 相关的线全删
    });

    test('linksOf 返回某卡的所有邻居', () => {
      let links = [];
      links = WritingDoc.addLink(notes, links, 'a', 'b');
      links = WritingDoc.addLink(notes, links, 'c', 'a');
      expect(WritingDoc.linksOf(links, 'a')).toHaveLength(2);
    });
  });

  describe('画布偏移 & 落点', () => {
    test('clampOffset：缺省与非法值兜底', () => {
      expect(WritingDoc.clampOffset(null)).toEqual({ x: 0, y: 0 });
      expect(WritingDoc.clampOffset({ x: 3 })).toEqual({ x: 3, y: 0 });
    });

    test('freeSpot：确定性、不与已有卡片重叠', () => {
      const notes = [];
      const s1 = WritingDoc.freeSpot(notes, { x: 0, y: 0 });
      const s2 = WritingDoc.freeSpot(notes.concat([{ id: 'a', x: s1.x, y: s1.y }]), { x: 0, y: 0 });
      expect(s1).toEqual({ x: 0, y: 0 });
      expect(s2).not.toEqual(s1);                                          // 第二个不与第一个同格
      // 同输入必得同输出（不随机）
      expect(WritingDoc.freeSpot(notes, { x: 0, y: 0 })).toEqual(s1);
    });
  });
});
