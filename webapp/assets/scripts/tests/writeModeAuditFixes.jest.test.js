/**
 * @jest-environment jsdom
 */
// 写作档 / 卡片侧系统审计的回归锁。
//
// 2) 文本编辑此前不入撤销栈：_handleEditInput 直接 WritingDoc.setText 写模型，enterEdit/exitEdit
//    都不 push —— 而 services/undoStack.js 的注释把「编辑文本」列为应覆盖的操作。
//    修复：一次编辑 = 一步撤销，在**首次真正改动前**留档；放 enterEdit 里 push 会给
//    「打开但一个字没改」的编辑压出空撤销帧。
// 3) refreshWriteOrder 热路径：徽标 / 上移 / 下移按钮原本每卡 3 次 querySelector，
//    外加每次一次整画布 querySelectorAll 兜底扫描，且每卡无条件拼一次提示字符串。
//    修复：引用缓存到卡片上（按 parentNode 判失效）、兜底扫描改遍历挂载表、序号未变不拼串。
const { loadModule } = require('./__helpers__/testUtils');

const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/writingDoc.js', 'WritingDoc');
_b1mod('handlers/features/modePolicy.js', 'ModePolicy');
global.Toast = { showToast: jest.fn() };
global.PrivacyMode = { markText: jest.fn() };
global.fitCardText = jest.fn();

const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions']);
const { PersistenceCoordinator } = loadModule(
  'handlers/features/PersistenceCoordinator.js', ['PersistenceCoordinator']
);

// ── 2) 一次编辑 = 一步撤销 ─────────────────────────────────────────────
function editFixture(initial = '原文') {
  const card = document.createElement('div');
  card.className = 'tw-card';
  card.dataset.id = 'c1';
  const text = document.createElement('div');
  text.className = 'tw-card-text';
  card.appendChild(text);
  // jsdom 不实现 innerText：这里用可写 getter 模拟（_handleEditInput / exitEdit 都读它）
  let val = initial;
  Object.defineProperty(text, 'innerText', {
    configurable: true,
    get: () => val,
    set: (v) => { val = v; },
  });
  const ctrl = {
    _notes: [{ id: 'c1', text: initial, seq: 1, x: 0, y: 0 }],
    _editingId: null,
    _undoStack: { push: jest.fn() },
    _scheduleSave: jest.fn(),
    _invalidateGeo: jest.fn(),
    _exitAllEdits: jest.fn(),
    _exitEdit: jest.fn(),
  };
  return { card, text, ctrl, setText: (v) => { val = v; }, ctx: { state: {}, ctrl } };
}

describe('文本编辑纳入撤销栈（一次编辑一步）', () => {
  test('打开编辑但没改字 → 不压空撤销帧', () => {
    const { card, ctrl, ctx } = editFixture();
    CardInteractions.enterEdit(ctx, card);
    expect(ctrl._undoStack.push).not.toHaveBeenCalled();
  });

  test('连续输入只留一档（不是每次按键一档）', () => {
    const { card, ctrl, ctx, setText } = editFixture();
    CardInteractions.enterEdit(ctx, card);
    setText('新1');
    CardInteractions._handleEditInput(ctrl, card, {});
    setText('新12');
    CardInteractions._handleEditInput(ctrl, card, {});
    expect(ctrl._undoStack.push).toHaveBeenCalledTimes(1);
  });

  test('退出编辑后再进入编辑 → 重新留档（第二次编辑独立一步）', () => {
    const { card, ctrl, ctx, setText } = editFixture();
    CardInteractions.enterEdit(ctx, card);
    setText('A');
    CardInteractions._handleEditInput(ctrl, card, {});
    CardInteractions.exitEdit(ctx, card);

    CardInteractions.enterEdit(ctx, card);
    setText('B');
    CardInteractions._handleEditInput(ctrl, card, {});
    expect(ctrl._undoStack.push).toHaveBeenCalledTimes(2);
  });

  test('输入法组字期间不写模型、也不留档（组字结束那次才留）', () => {
    const { card, ctrl, ctx, setText } = editFixture();
    CardInteractions.enterEdit(ctx, card);
    setText('拼音中');
    CardInteractions._handleEditInput(ctrl, card, { isComposing: true });
    expect(ctrl._undoStack.push).not.toHaveBeenCalled();
    expect(ctrl._notes[0].text).toBe('原文');        // 组字中：模型未改

    setText('汉字');
    CardInteractions._handleEditInput(ctrl, card, { isComposing: false });
    expect(ctrl._undoStack.push).toHaveBeenCalledTimes(1);
    expect(ctrl._notes[0].text).toBe('汉字');
  });
});

// ── 3) refreshWriteOrder 缓存 ──────────────────────────────────────────
function roFixture() {
  const canvas = document.createElement('div');
  const mounted = new Map();
  const cards = [];
  for (let i = 0; i < 3; i += 1) {
    const el = document.createElement('div');
    el.className = 'tw-card';
    el.dataset.id = 'c' + i;
    const up = document.createElement('button');
    up.className = 'tw-card-move-up';
    const dn = document.createElement('button');
    dn.className = 'tw-card-move-down';
    el.appendChild(up);
    el.appendChild(dn);
    canvas.appendChild(el);
    cards.push(el);
    mounted.set('c' + i, el);
  }
  const ctrl = {
    _canvas: canvas,
    _mode: 'write',
    _mountedCards: mounted,
    _orderCards: () => cards.map((el, i) => ({ id: 'c' + i, el, seq: i })),
    _refreshScreenMeta: jest.fn(),
  };
  return { ctrl, canvas, cards, ctx: { state: {}, ctrl } };
}

describe('refreshWriteOrder：引用缓存与按需拼串', () => {
  test('徽标与上下移按钮缓存到卡片上', () => {
    const { cards, ctx } = roFixture();
    PersistenceCoordinator.refreshWriteOrder(ctx);
    expect(cards[0]._orderBadge).toBeTruthy();
    expect(cards[0]._moveUpBtn).toBeTruthy();
    expect(cards[0]._moveDownBtn).toBeTruthy();
    expect(cards[0]._orderBadge.textContent).toBe('1');   // 顺序徽标
  });

  test('第二次调用不再 querySelector（引用已缓存）', () => {
    const { cards, ctx } = roFixture();
    const spy = jest.spyOn(cards[0], 'querySelector');
    PersistenceCoordinator.refreshWriteOrder(ctx);
    const first = spy.mock.calls.length;          // 首次：up / dn 各一次
    expect(first).toBe(2);
    PersistenceCoordinator.refreshWriteOrder(ctx);
    expect(spy.mock.calls.length).toBe(first);    // 第二次零查询
    spy.mockRestore();
  });

  test('提示文案按序号拼（末位「已在最后」）', () => {
    const { cards, ctx } = roFixture();
    PersistenceCoordinator.refreshWriteOrder(ctx);
    expect(cards[0]._moveUpBtn._tipText).toBe('已在最前');
    expect(cards[2]._moveDownBtn._tipText).toBe('已在最后');
    expect(cards[1]._moveUpBtn._tipText).toContain('第 2 位');
  });

  test('非写作档：清掉全部顺序徽标', () => {
    const { ctrl, ctx, cards } = roFixture();
    PersistenceCoordinator.refreshWriteOrder(ctx);
    expect(cards[0]._orderBadge).toBeTruthy();
    ctrl._mode = 'notes';
    PersistenceCoordinator.refreshWriteOrder(ctx);
    expect(cards[0]._orderBadge.parentNode).toBeFalsy();   // 已移除
  });
});

// ── 4) 批量导入：跳过逐块锚点排序 ──────────────────────────────────────
// _spawnAnchorCard → _orderCards() 是 map + sort；_importDraft 逐块调用会让导入变成
// O(K·N log N)，而导入末尾本就有一次 reflowWriteOrder 统一重排，锚点落点随即被覆盖。
const { TypewriterFeature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
  FONTS: ['modern'], PAPERS: ['plain'], MARKET_FONTS: [],
  Toast: { showToast: jest.fn() },
  ViewportCuller: { setGeom: jest.fn() },
  CanvasViewport: { getScale: () => 1 },
  MindmapFeature: { teardown: jest.fn() },
  TypewriterStore: { invalidateWritingIndex: jest.fn() },
});

function spawnStub(mode, opts) {
  const canvas = document.createElement('div');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 });
  const beeper = document.createElement('div');
  beeper.className = 'tw-beeper';
  const el = document.createElement('div');
  el.appendChild(beeper);
  el.querySelector = ((sel) => (sel === '.tw-beeper' ? beeper : null));
  const card = document.createElement('div');
  card.dataset.id = 'new1';
  const cardText = document.createElement('div');
  cardText.className = 'tw-card-text';
  card.appendChild(cardText);
  const fake = {
    _mode: mode,
    _canvas: canvas,
    _el: el,
    _input: document.createElement('input'),   // 机身输入框（_spawn 末尾清空 + 聚焦）
    _notes: [{ id: 'a', text: 'a', seq: 0, x: 0, y: 0 }],
    _mountedCards: new Map(),
    _zTop: 0,
    _fontIdx: 0,
    _paperIdx: 0,
    _now: () => '2026-01-01',
    _createCardEl: () => card,
    _spawnAnchorCard: jest.fn(() => null),
    _measureCard: jest.fn(),
    _refreshWriteOrder: jest.fn(),
    _showScreenMsg: jest.fn(),
    _ensureAudio: jest.fn(),
    _playFeedSound: jest.fn(),
    _scheduleSave: jest.fn(),
    _scheduleCull: jest.fn(),
    _applyLod: jest.fn(),
    _ensureCardVisible: jest.fn(),
    _spawnFrom: jest.fn(),
    _enforceCap: jest.fn(),
    _selected: new Set(),
    _undoStack: null,
  };
  TypewriterFeature._spawn.call(fake, '正文', 'p', opts);
  return fake;
}

describe('_spawn：批量导入跳过锚点计算', () => {
  test('单张新建（不传 skipWriteOrder）仍算锚点', () => {
    const f = spawnStub('write', undefined);
    expect(f._spawnAnchorCard).toHaveBeenCalledTimes(1);
  });

  test('批量导入（skipWriteOrder=true）不算锚点 —— 避免 O(K·N log N)', () => {
    const f = spawnStub('write', { skipWriteOrder: true, skipEnsureVisible: true });
    expect(f._spawnAnchorCard).not.toHaveBeenCalled();
  });
});
