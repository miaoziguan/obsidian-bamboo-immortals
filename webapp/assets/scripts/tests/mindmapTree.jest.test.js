// 纯模块单测：MindmapTree（从自由连线抽取生成树）。
// 自由连线允许多父/成环/孤立点；结构布局与主干路由需要一个稳定的「主父」视角。
const { loadModule } = require('./__helpers__/testUtils');
const { MindmapTree } = loadModule('handlers/features/mindmapTree.js', ['MindmapTree']);

const N = (ids) => ids.map((id) => ({ id }));

describe('MindmapTree.build', () => {
  test('单链：根=入度0，children/treeLinks 逐层展开', () => {
    const t = MindmapTree.build(N(['a', 'b', 'c']), [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }]);
    expect(t.rootId).toBe('a');
    expect(t.children.get('a')).toEqual(['b']);
    expect(t.children.get('b')).toEqual(['c']);
    expect(t.treeLinks).toHaveLength(2);
    expect(t.backLinks).toHaveLength(0);
    expect(t.order).toEqual(['a', 'b', 'c']);
  });

  test('多父：只认首次访问的父，另一条记入 backLinks（不丢数据）', () => {
    const t = MindmapTree.build(N(['a', 'b', 'c']), [{ from: 'a', to: 'c' }, { from: 'b', to: 'c' }]);
    // 两根 a/b：a 出度/入度与 b 相同，稳定取首个 → a
    expect(t.rootId).toBe('a');
    expect(t.children.get('a')).toEqual(['c']);
    expect(t.backLinks).toEqual([{ from: 'b', to: 'c' }]);
    expect(t.treeLinks).toEqual([{ from: 'a', to: 'c' }]);
  });

  test('成环：回边断开，仍能抽出生成树且不死循环', () => {
    const t = MindmapTree.build(N(['a', 'b']), [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }]);
    expect(t.rootId).toBe('a');            // 纯环兜底取首个节点
    expect(t.treeLinks).toEqual([{ from: 'a', to: 'b' }]);
    expect(t.backLinks).toEqual([{ from: 'b', to: 'a' }]);
  });

  test('指定 rootId 优先', () => {
    const t = MindmapTree.build(N(['a', 'b', 'c']), [{ from: 'a', to: 'b' }], 'c');
    expect(t.rootId).toBe('c');
  });

  test('孤立点：各自成根，不丢节点', () => {
    const t = MindmapTree.build(N(['a', 'b', 'c']), []);
    expect(t.treeLinks).toHaveLength(0);
    expect(t.order).toEqual(['a', 'b', 'c']);
  });

  test('悬空/自环不计入树', () => {
    const t = MindmapTree.build(N(['a', 'b']), [{ from: 'a', to: 'zzz' }, { from: 'a', to: 'a' }]);
    expect(t.treeLinks).toHaveLength(0);
    expect(t.backLinks).toHaveLength(0);
  });
});
