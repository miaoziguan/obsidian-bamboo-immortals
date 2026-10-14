/**
 * @jest-environment jsdom
 */
// 连线层「资源生命周期」回归锁。
//
// 根因（全板块唯一无界增长的资源）：LinkLayer.watchSize 给每张挂载卡 observe 一次，
// 但 ViewportCuller.unmountCard 只 card.remove()、没有 unobserve —— 写作档超
// WRITE_NO_CULL_MAX(300) 后每轮 cull churn 都给这个共享 RO 新增一条对**已 detach 卡片**
// 的强引用观察，长时间平移后观察列表只增不减，且每次触发都在已销毁的 container 上排 rAF。
//
// 更深的根因是「所有权双份」：B1 抽取时 LinkLayer 把 RO/rAF/hover timer 搬进了自己内部，
// 但 feature 的 _resetState 仍留着 9 个同名字段，unmount 的「清理」因此打在死字段上
// （RO 实际从未断开，LinkLayer.destroy() 全仓零调用）。本文件把两侧都锁住。
const { loadModule } = require('./__helpers__/testUtils');

const { LinkLayer } = loadModule('services/LinkLayer.js', ['LinkLayer']);

/** 带计数的 ResizeObserver mock（jsdom 不实现） */
function makeROMock() {
  const stats = { observe: 0, unobserve: 0, disconnect: 0, targets: new Set() };
  class RO {
    constructor(cb) { this._cb = cb; }
    observe(el) { stats.observe++; stats.targets.add(el); }
    unobserve(el) { stats.unobserve++; stats.targets.delete(el); }
    disconnect() { stats.disconnect++; stats.targets.clear(); }
  }
  return { RO, stats };
}

function makeLayer() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const links = [];
  return {
    container,
    layer: new LinkLayer({
      container,
      nodeSelector: '.tw-card',
      getLinks: () => links,
      setLinks: () => {},
      addLink: () => true,
      removeLink: () => {},
      removeLinksOf: () => {},
      onChange: () => {},
    }),
  };
}

describe('LinkLayer ResizeObserver 生命周期', () => {
  let realRO;

  beforeEach(() => {
    realRO = global.ResizeObserver;
  });

  afterEach(() => {
    global.ResizeObserver = realRO;
  });

  test('watchSize / unwatchSize 严格配对（observe 数 === unobserve 数）', () => {
    const { RO, stats } = makeROMock();
    global.ResizeObserver = RO;
    const { layer } = makeLayer();
    const cards = [1, 2, 3, 4, 5].map(() => document.createElement('div'));
    cards.forEach((c) => layer.watchSize(c));
    expect(stats.observe).toBe(5);
    expect(stats.targets.size).toBe(5);
    // 模拟视口剔除：全部卸载
    cards.forEach((c) => layer.unwatchSize(c));
    expect(stats.unobserve).toBe(5);
    expect(stats.observe).toBe(stats.unobserve);   // 配对本文件的核心断言
    expect(stats.targets.size).toBe(0);
  });

  test('cull churn（反复挂/卸）不累积观察目标', () => {
    const { RO, stats } = makeROMock();
    global.ResizeObserver = RO;
    const { layer } = makeLayer();
    // 写作档超阈值后的典型 churn：同一批卡反复挂载/卸载
    for (let round = 0; round < 10; round++) {
      const c = document.createElement('div');
      layer.watchSize(c);
      layer.unwatchSize(c);
    }
    expect(stats.targets.size).toBe(0);          // 不累积
    expect(stats.observe).toBe(stats.unobserve); // 每轮都配对
  });

  test('destroy() 断开 RO 并清空全部内部元素引用', () => {
    const { RO, stats } = makeROMock();
    global.ResizeObserver = RO;
    const { layer } = makeLayer();
    const c = document.createElement('div');
    layer.watchSize(c);
    layer._linkEls = [{}, {}];
    layer._ctlEls = { bend: {} };
    layer._hitCache = new Map([['a', {}]]);
    layer._hoverLink = { from: 'a', to: 'b' };

    layer.destroy();

    expect(stats.disconnect).toBe(1);
    expect(stats.targets.size).toBe(0);
    expect(layer._linkEls).toEqual([]);
    expect(layer._ctlEls).toBeNull();
    expect(layer._hitCache).toBeNull();
    expect(layer._hoverLink).toBeNull();
    expect(layer._svg).toBeNull();
    expect(layer._ctlSvg).toBeNull();
  });

  test('无 ResizeObserver 环境（老 webview）→ watchSize/unwatchSize 静默降级不抛错', () => {
    global.ResizeObserver = undefined;
    const { layer } = makeLayer();
    const c = document.createElement('div');
    expect(() => { layer.watchSize(c); layer.unwatchSize(c); }).not.toThrow();
  });
});

// 以下锁「所有权双份」的另一半：feature 不得再持有连线层的同名字段。
// 这 9 个字段是 B1 抽取时的漏删产物，正是 unmount 清理打在空气上的直接原因。
describe('连线层字段所有权单一（feature 不再有同名字段）', () => {
  const DEAD_FIELDS = [
    '_linkSvg', '_linkEls', '_linkSigCache', '_ctlEls',
    '_linkRaf', '_linkRo', '_hoverLink', '_hoverTimer', '_ctlHover',
  ];

  test('_resetState() 后这些字段均为 undefined（未声明）', () => {
    const { TypewriterFeature } = loadModule(
      'handlers/features/typewriterFeature.js', ['TypewriterFeature']
    );
    TypewriterFeature._resetState();
    const present = DEAD_FIELDS.filter((f) => TypewriterFeature[f] !== undefined);
    expect(present).toEqual([]);
  });

  test('unmount 调 LinkLayer.destroy()（真实句柄在 LinkLayer 内部）', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'handlers', 'features', 'typewriterFeature.js'), 'utf8'
    );
    expect(src).toMatch(/_linkLayer\.destroy\(\)/);
    // 不得再出现「断 feature 自己的 _linkRo」这类打在死字段上的清理
    expect(src).not.toMatch(/this\._linkRo\)?\s*\{?\s*this\._linkRo\.disconnect/);
    expect(src).not.toMatch(/cancelAnimationFrame\(this\._linkRaf\)/);
  });

  test('ViewportCuller.unmountCard 配对解除观察', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'services', 'ViewportCuller.js'), 'utf8'
    );
    const m = /unmountCard\(ctx, id\) \{([\s\S]*?)\n  \},/.exec(src);
    expect(m).not.toBeNull();
    expect(m[1]).toMatch(/unwatchSize/);
  });
});
