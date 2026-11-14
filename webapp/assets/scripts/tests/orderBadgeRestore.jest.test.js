/**
 * @jest-environment jsdom
 */
/**
 * 冷启动顺序徽标回归锁（2026-11-14 用户反馈：重启 Obsidian 后数字徽章不出现）。
 *
 * 根因：.tw-card-order 不是卡片模板的一部分，由 refreshWriteOrder 事后动态贴；
 * 而 buildCards 走的是 ViewportCuller.mountCard（只建 DOM / 测量，不刷徽标）。
 * 恢复链路 restore → _setMode('write') → loadDoc → buildCards 一次都不刷徽标，
 * 只有 _spawn（打印新卡）和 updateCulling 的 changed 分支会刷 ——
 * 所以层级徽章（模板自带）一直在，数字徽章却「偶尔不出现，尤其重启后」。
 *
 * 本文件直接跑真实的 buildCards + refreshWriteOrder + cardsByReadingOrder，
 * 断言「全量重建后每张卡都带正确序号」，并锁住收口处那一次刷新调用。
 */
const { loadModule } = require('./__helpers__/testUtils');

const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.GeoCache = GeoCache;
const { PersistenceCoordinator: PC } = loadModule(
  'handlers/features/PersistenceCoordinator.js', ['PersistenceCoordinator']
);

function fixture(mode = 'write') {
  const notes = [
    { id: 'a', seq: 0, x: 0, y: 0, text: 'A' },
    { id: 'b', seq: 1, x: 0, y: 300, text: 'B' },
    { id: 'c', seq: 2, x: 0, y: 600, text: 'C' },
  ];
  const canvas = document.createElement('div');
  const state = { notes };
  const ctrl = {
    _canvas: canvas,
    _state: state,
    _notes: notes,
    _mountedCards: new Map(),
    _geo: new GeoCache(),
    _mode: mode,
    _links: [],
    _canvasOffset: { x: 0, y: 0 },
    // 模拟 ViewportCuller.mountCard：只建 DOM + 登记挂载表，绝不贴徽标
    _mountCard(n) {
      const el = document.createElement('div');
      el.className = 'tw-card';
      el.dataset.id = n.id;
      canvas.appendChild(el);
      ctrl._mountedCards.set(n.id, el);
      return el;
    },
    _flushMountMeasure() {},
    _applyLod() {},
    _cardsByReadingOrder() { return PC.cardsByReadingOrder({ state, ctrl }); },
    _orderCards() { return PC.orderCards({ state, ctrl }); },
    _refreshWriteOrder() { return PC.refreshWriteOrder({ state, ctrl }); },
    _refreshScreenMeta() {},
    _showScreenMsg() {},
  };
  return { ctrl, state, notes, canvas };
}
function badgesOf(ctrl) {
  return Array.from(ctrl._mountedCards.values()).map((el) => el.querySelector('.tw-card-order'));
}

describe('冷启动恢复：buildCards 后顺序徽章必须存在', () => {
  test('写作档全量重建：每张卡都带徽章，序号按 seq', () => {
    const { ctrl, notes, state } = fixture('write');
    PC.buildCards({ state, ctrl }, notes, false, 1000, 800);

    const badges = badgesOf(ctrl);
    expect(badges.every(Boolean)).toBe(true);
    expect(badges.map((b) => b.textContent)).toEqual(['1', '2', '3']);
  });

  test('建卡收口处显式调用了 _refreshWriteOrder（锁住修复点）', () => {
    const { ctrl, notes, state } = fixture('write');
    const spy = jest.spyOn(ctrl, '_refreshWriteOrder');
    PC.buildCards({ state, ctrl }, notes, false, 1000, 800);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('反复重建（切档 / 撤销恢复）不堆叠徽标', () => {
    const { ctrl, notes, state } = fixture('write');
    PC.buildCards({ state, ctrl }, notes, false, 1000, 800);
    PC.buildCards({ state, ctrl }, notes, false, 1000, 800);
    badgesOf(ctrl).forEach((b) => expect(b).not.toBeNull());
    ctrl._mountedCards.forEach((el) => {
      expect(el.querySelectorAll('.tw-card-order').length).toBe(1);
    });
  });

  test('非写作档不贴徽章（清掉遗留）', () => {
    const { ctrl, notes, state } = fixture('notes');
    PC.buildCards({ state, ctrl }, notes, false, 1000, 800);
    expect(badgesOf(ctrl).every((b) => b === null)).toBe(true);
  });
});
