/**
 * @jest-environment jsdom
 */
// 导图第三个机身键（取代「一键自动布局」）：一键切换连线形态 曲线 ⇄ 直线。
// 关注点：多数决定目标态（连按可来回翻）、bend 不丢、选区范围内生效、空/无连线不误伤。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
const { MindmapLayout } = loadModule('handlers/features/mindmapLayout.js', ['MindmapLayout']);
global.MindmapLayout = MindmapLayout;   // mindmapFeature 的 import 在 harness 里靠全局解析
const { MindmapFeature: MM } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);

function reset(links, sel = []) {
  MM._nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  MM._links = links.map((l) => Object.assign({ route: 'bezier', bend: 0, dash: 'solid' }, l));
  MM._selSet = new Set(sel);
  MM._selId = null;
  MM.render = jest.fn();
  MM._scheduleSave = jest.fn();
  MM._msg = jest.fn();
  MM._mutate = (fn) => fn();
  return MM._links;
}

const routeOf = (from, to) => {
  const l = MM._links.find((x) => x.from === from && x.to === to);
  return l ? l.route : null;
};

test('全曲线 → 一键全改直；再按 → 全改曲（连按稳定来回翻）', () => {
  reset([{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }]);
  expect(MM.cycleLinkRoute()).toBe('直线');
  expect(MM._links.every((l) => l.route === 'straight')).toBe(true);
  expect(MM.cycleLinkRoute()).toBe('曲线');
  expect(MM._links.every((l) => l.route === 'bezier')).toBe(true);
});

test('目标形态按多数决定：3 直 1 曲 → 全改曲', () => {
  reset([
    { from: 'a', to: 'b', route: 'straight' },
    { from: 'b', to: 'c', route: 'straight' },
    { from: 'a', to: 'c', route: 'straight' },
    { from: 'c', to: 'a', route: 'bezier' },
  ]);
  expect(MM.cycleLinkRoute()).toBe('曲线');
  expect(MM._links.every((l) => l.route === 'bezier')).toBe(true);
});

test('bend 原样保留：改直后再改回曲线，仍是原来的弯曲量', () => {
  reset([{ from: 'a', to: 'b', bend: 17 }]);
  MM.cycleLinkRoute();
  expect(MM._links[0].route).toBe('straight');
  expect(MM._links[0].bend).toBe(17);
  MM.cycleLinkRoute();
  expect(MM._links[0].route).toBe('bezier');
  expect(MM._links[0].bend).toBe(17);
});

test('有选区：只切换两端都在选区内的连线', () => {
  reset([
    { from: 'a', to: 'b' },   // 两端都在选区 → 切
    { from: 'b', to: 'c' },   // c 不在选区 → 不动
  ], ['a', 'b']);
  MM.cycleLinkRoute();
  expect(routeOf('a', 'b')).toBe('straight');
  expect(routeOf('b', 'c')).toBe('bezier');
});

test('无连线 → 提示，不动数据', () => {
  reset([]);
  expect(MM.cycleLinkRoute()).toBe('');
  expect(MM._msg).toHaveBeenCalledWith('还没有连线');
  expect(MM._links).toEqual([]);
});

test('选区内没有连线 → 提示，不动数据', () => {
  reset([{ from: 'a', to: 'b' }], ['c']);
  const before = JSON.stringify(MM._links);
  expect(MM.cycleLinkRoute()).toBe('');
  expect(MM._msg).toHaveBeenCalledWith('选区内没有连线');
  expect(JSON.stringify(MM._links)).toBe(before);
});
