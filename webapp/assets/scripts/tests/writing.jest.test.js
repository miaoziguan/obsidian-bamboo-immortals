/**
 * @jest-environment jsdom
 */
// MD可视化写作档独立文档：纯逻辑（WritingDoc，与 MindmapDoc 同构的自由模型）。
// 模型已彻底改为「卡片 + 连线」：没有层级树、没有自动布局。
// 这里只验证：卡片字段有界、连线自由成对、删卡片连带删线、枚举校正、画布偏移净化。
const { loadModule } = require('./__helpers__/testUtils');

const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);

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
