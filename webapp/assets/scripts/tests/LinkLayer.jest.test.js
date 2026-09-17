/**
 * @jest-environment jsdom
 */
// LinkLayer 在「视口剔除」下的回归锁。
// P8 把连线端点从活 DOM 改为几何缓存（getGeom）。两个回归：
//   ① 剔除态下卡片 DOM 卸载，旧 render 回退分支读 DOM 属性 → 连线算成 NaN 不画；
//   ② 拖中点弯曲手柄仍查 DOM（cardById）→ 端点卡被剔时返回 null，弯曲直接失效。
// 两条都已改为「优先走 getGeom，未注入才回退 DOM」；本文件把这两种剔除态行为锁死。
const { loadModule } = require('./__helpers__/testUtils');

// jsdom 不实现 SVG 几何接口，mock 掉让 buildControls / applyControlsGeom 能跑
if (typeof SVGElement !== 'undefined') {
  SVGElement.prototype.getTotalLength = function () { return 100; };
  SVGElement.prototype.getPointAtLength = function (len) { return { x: len, y: len }; };
}

const { LinkLayer } = loadModule('services/LinkLayer.js', ['LinkLayer']);

function makeLayer({ geomCache, withCards = false } = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  if (withCards) {
    ['a', 'b'].forEach((id) => {
      const c = document.createElement('div');
      c.className = 'tw-card';
      c.dataset.id = id;
      // jsdom 不做布局，offsetLeft 等恒 0；手动覆盖成非 0 让 DOM 回退路径也有意义
      Object.defineProperty(c, 'offsetLeft', { configurable: true, get: () => (id === 'a' ? 100 : 400) });
      Object.defineProperty(c, 'offsetTop', { configurable: true, get: () => 100 });
      Object.defineProperty(c, 'offsetWidth', { configurable: true, get: () => 120 });
      Object.defineProperty(c, 'offsetHeight', { configurable: true, get: () => 60 });
      container.appendChild(c);
    });
  }
  const links = [{ from: 'a', to: 'b', route: 'bezier', bend: 0, dash: 'solid' }];
  const onChange = jest.fn();
  const layer = new LinkLayer({
    container,
    nodeSelector: '.tw-card',
    ...(geomCache ? { getGeom: (id) => geomCache[id] || null } : {}),
    getLinks: () => links,
    setLinks: (v) => { links.length = 0; links.push(...v); },
    addLink: () => true,
    removeLink: () => {},
    removeLinksOf: () => {},
    onChange,
  });
  return { container, links, onChange, layer };
}

describe('LinkLayer 视口剔除回归', () => {
  test('剔除态（注入 getGeom、卡片 DOM 已卸载）下 render 仍画出连线', () => {
    const geomCache = {
      a: { cx: 100, cy: 100, hw: 60, hh: 30, rot: 0 },
      b: { cx: 400, cy: 100, hw: 60, hh: 30, rot: 0 },
    };
    const { container, layer } = makeLayer({ geomCache });
    expect(container.querySelectorAll('.tw-card')).toHaveLength(0); // 模拟离屏剔除
    layer.render();
    const path = layer._svg.querySelector('.tw-link');
    expect(path).toBeTruthy();
    expect(path.getAttribute('d')).toMatch(/^M\s/); // 路径非空、以 M 起笔
  });

  test('剔除态下 hover 连线并拖中点弯曲：写入 bend（回归②锁定）', () => {
    const geomCache = {
      a: { cx: 100, cy: 100, hw: 60, hh: 30, rot: 0 },
      b: { cx: 400, cy: 100, hw: 60, hh: 30, rot: 0 },
    };
    const { links, onChange, layer } = makeLayer({ geomCache });
    expect(layer._container.querySelectorAll('.tw-card')).toHaveLength(0); // 离屏剔除
    layer.render(); // 先建出连线层与路径（renderControls 依赖 this._svg）

    layer.renderControls('a', 'b'); // 等价于 hit 元素 mouseenter
    expect(layer._ctlEls).toBeTruthy();
    const bendEl = layer._ctlEls.bend;
    expect(bendEl).toBeTruthy();

    bendEl.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    // 容器 rect 在 jsdom 全 0，client 即局部坐标；法线 = (0,1)，base.y=100 → 拖到 y=300 得 bend=200
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 250, clientY: 300, bubbles: false }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: false }));

    expect(onChange).toHaveBeenCalled();
    expect(links[0].bend).toBe(200); // 精确锁定：从几何缓存算出的弯曲量
  });

  test('未注入 getGeom（思维子弹）时仍走 DOM 回退，卡片在 DOM 中可弯曲', () => {
    const { links, onChange, layer } = makeLayer({ withCards: true });
    layer.render();
    layer.renderControls('a', 'b');
    expect(layer._ctlEls).toBeTruthy();
    layer._ctlEls.bend.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 250, clientY: 300, bubbles: false }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: false }));
    expect(onChange).toHaveBeenCalled();
    expect(links[0].bend).not.toBe(0);
  });

  test('两端皆无 DOM 且无 getGeom：弯曲拖拽安全退出（不抛、不改 bend、不落盘）', () => {
    const { links, onChange, layer } = makeLayer({}); // 无 geomCache、无卡片
    layer.render();
    layer.renderControls('a', 'b');
    const before = links[0].bend;
    if (layer._ctlEls && layer._ctlEls.bend) {
      layer._ctlEls.bend.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 250, clientY: 300, bubbles: false }));
      document.dispatchEvent(new MouseEvent('pointerup', { bubbles: false }));
    }
    expect(links[0].bend).toBe(before);
    expect(onChange).not.toHaveBeenCalled();
  });
});
