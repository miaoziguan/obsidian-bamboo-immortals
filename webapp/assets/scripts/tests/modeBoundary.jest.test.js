/**
 * @jest-environment jsdom
 */
// 档位边界回归网：守住「一档不该看见别档的东西」。
// 这类断言比「消灭所有 if」更能降低长期维护成本 —— 贴纸串档的根因不是用了 if，
// 而是「改了 A 处忘了 B 处」。先有网，再搬代码（A 类收敛）。
//
// 边界清单：
//   B1 · 装饰物（贴纸 / 素材市场）只归便签档
//   B2 · 卡片画布交互在导图档让位（导图自带文档 / 历史 / 手势）
//   B3 · 连线定序只发生在写作档
//   B4 · 机身键 action 名在每个档位都能解析成函数（防拼写 / 漏实现）
//   B5 · 三档文档互不串（docKind 互不相同且与策略一致）
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);   // 副作用：常量 / 图标挂 globalThis
const _m = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; return global[n]; };
const { ModePolicy, MODE_POLICY } = loadModule('handlers/features/modePolicy.js', ['ModePolicy', 'MODE_POLICY']);
_m('handlers/features/writingDoc.js', 'WritingDoc');
_m('services/TypewriterStore.js', 'TypewriterStore');
_m('services/GeoCache.js', 'GeoCache');
_m('services/SpatialIndex.js', 'SpatialIndex');
_m('services/LinkLayer.js', 'LinkLayer');
_m('services/undoStack.js', 'UndoStack');
_m('services/CanvasViewport.js', 'CanvasViewport');
_m('services/ViewportCuller.js', 'ViewportCuller');
_m('handlers/features/mindmapFeature.js', 'MindmapFeature');
_m('utils/domRef.js', 'isFromTextEntry');
_m('services/CanvasGestures.js', 'CanvasGestures');
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);
const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions']);
const { TypewriterFeature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);

const MODES = ['notes', 'write', 'mindmap'];

// ── B1 · 装饰物只归便签档 ─────────────────────────────────────────────
test('B1 · 装饰物（贴纸 / 素材市场）只归便签档', () => {
  expect(ModePolicy.ownsStickers('notes')).toBe(true);
  expect(ModePolicy.ownsStickers('write')).toBe(false);
  expect(ModePolicy.ownsStickers('mindmap')).toBe(false);
});

test('B1 · 素材市场按钮在非便签档一律隐藏（chrome 由策略表驱动）', () => {
  MODES.forEach((mode) => {
    document.body.innerHTML = '';
    const root = document.createElement('div');
    root.innerHTML = '<button class="tw-zoom-market"></button>';
    document.body.appendChild(root);
    const ctrl = {
      _el: root, _mode: mode, _input: null, _draft: {},
      _ensureDocCorner: jest.fn(),
      _refreshDocBtnLabel: jest.fn().mockResolvedValue(undefined),
      _refreshScreenMeta: jest.fn(),
      _syncDecoLayer: jest.fn(),
    };
    ModeController.applyModeChrome({ state: {}, ctrl });
    expect(root.querySelector('.tw-zoom-market').hidden).toBe(mode !== 'notes');
  });
});

// ── B2 · 卡片画布交互在导图档让位 ─────────────────────────────────────
test('B2 · 卡片画布交互：导图档让位，便签 / 写作档接管', () => {
  expect(ModePolicy.usesCardInteractions('notes')).toBe(true);
  expect(ModePolicy.usesCardInteractions('write')).toBe(true);
  expect(ModePolicy.usesCardInteractions('mindmap')).toBe(false);
});

// ── B3 · 连线定序只在写作档 ───────────────────────────────────────────
function linkCtrl(mode) {
  return {
    _mode: mode,
    _links: [],
    _notes: [
      { id: 'a', text: 'A', seq: 0, x: 0, y: 0 },
      { id: 'b', text: 'B', seq: 1, x: 10, y: 0 },
    ],
    _refreshWriteOrder: jest.fn(),
  };
}

test('B3 · 连线定序：写作档重算 seq 并刷徽标；便签 / 导图档不动', () => {
  MODES.forEach((mode) => {
    const should = mode === 'write';
    // addLink
    let c = linkCtrl(mode);
    CardInteractions.addLink({ state: {}, ctrl: c }, 'a', 'b');
    expect(c._refreshWriteOrder.mock.calls.length).toBe(should ? 1 : 0);
    // removeLink
    c = linkCtrl(mode);
    c._links = [{ from: 'a', to: 'b' }];
    CardInteractions.removeLink({ state: {}, ctrl: c }, 'a', 'b');
    expect(c._refreshWriteOrder.mock.calls.length).toBe(should ? 1 : 0);
    // removeLinksOfData（级联删线）
    c = linkCtrl(mode);
    c._links = [{ from: 'a', to: 'b' }];
    CardInteractions.removeLinksOfData({ state: {}, ctrl: c }, 'a');
    expect(c._refreshWriteOrder.mock.calls.length).toBe(should ? 1 : 0);
  });
});

// ── B4 · 机身键 action 名可解析 ───────────────────────────────────────
test('B4 · 每个档位的机身键 action 都能在 TypewriterFeature 上解析成函数', () => {
  MODES.forEach((mode) => {
    const b = MODE_POLICY[mode].buttons;
    ['paper', 'font', 'arrange'].forEach((key) => {
      const name = b[key].action;
      expect(typeof name).toBe('string');
      expect(typeof TypewriterFeature[name]).toBe('function');   // 防拼写 / 漏实现
    });
  });
});

// ── B5 · 三档文档互不串 ───────────────────────────────────────────────
test('B5 · 三档文档种类互不相同，且与 getDocKind 一致', () => {
  const kinds = MODES.map((m) => ModePolicy.of(m).docKind);
  expect(new Set(kinds).size).toBe(3);
  MODES.forEach((mode) => {
    const ctrl = { _mode: mode };
    expect(ModeController.getDocKind({ state: {}, ctrl })).toBe(mode);
  });
});
