/**
 * @jest-environment jsdom
 */
// 回归：一次 render() 内，同一个节点只应取一次几何。
// 旧行为：每条连线两端各调一次 getGeom → L 条线 = 2L 次；
//         而 getGeom 内部每次还要 ctrl._canvas.getBoundingClientRect() + CanvasViewport.getScale()
//         + card.getBoundingClientRect() + 2×offsetWidth/Height。
//         拖拽时每帧都跑一遍，卡多线多时是"一拖就掉帧"的根因之一。
// 新行为：render() 内按 id 记忆化 → L 条线只调「不同节点数」次。
const { loadModule } = require('./__helpers__/testUtils');

const { LinkLayer } = loadModule('services/LinkLayer.js', ['LinkLayer']);

const SVGNS = 'http://www.w3.org/2000/svg';

describe('LinkLayer.render 几何去重', () => {
  test('同帧同一节点只测一次（10 条线 / 11 个节点 → 11 次，而非 20 次）', () => {
    // 链式 10 条线，覆盖 11 个不同节点
    const links = [];
    for (let i = 0; i < 10; i += 1) links.push({ from: 'c' + i, to: 'c' + (i + 1) });

    let calls = 0;
    const seenIds = [];
    const getGeom = (id) => {
      calls += 1;
      seenIds.push(id);
      return { cx: 0, cy: 0, hw: 10, hh: 10, rot: 0 };
    };

    const layer = new LinkLayer({
      container: document.body,
      getLinks: () => links,
      getGeom,
    });

    // 只验证「取几何的次数」，DOM 构建与几何写入用桩替换（它们不是本测试对象）
    layer.ensureLayer = () => document.createElementNS(SVGNS, 'svg');
    layer.buildLink = () => ({ path: { parentNode: null } });
    layer.applyGeom = () => {};

    layer.render();

    // 旧实现为 20；修复后应为不同节点数 11
    expect(calls).toBe(11);
    // 且每个 id 只出现一次
    expect(new Set(seenIds).size).toBe(seenIds.length);
  });

  test('星型：1 个中心 + 10 个叶子 → 11 个节点 11 次', () => {
    const links = [];
    for (let i = 1; i <= 10; i += 1) links.push({ from: 'hub', to: 'leaf' + i });

    let calls = 0;
    const layer = new LinkLayer({
      container: document.body,
      getLinks: () => links,
      getGeom: () => { calls += 1; return { cx: 0, cy: 0, hw: 5, hh: 5, rot: 0 }; },
    });
    layer.ensureLayer = () => document.createElementNS(SVGNS, 'svg');
    layer.buildLink = () => ({ path: { parentNode: null } });
    layer.applyGeom = () => {};

    layer.render();

    expect(calls).toBe(11);   // 旧实现为 20
  });
});
