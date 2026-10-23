const { loadModule } = require('./__helpers__/testUtils.js');

// CardInteractions 从 domRef / WritingDoc / CanvasViewport / ModePolicy import，
// 被 loadModule 剥离后需由全局补回。
const setPos = jest.fn(() => 'notes-after');
const setText = jest.fn(() => []);
const fitCardText = jest.fn();
const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions'], {
  byId: (id) => document.getElementById(id),
  WritingDoc: { setPos, setText, setOrder: jest.fn(), orderIds: jest.fn(() => []) },
  CanvasViewport: { getScale: () => 1, getOffset: () => ({ x: 0, y: 0, scale: 1 }) },
  ModePolicy: { manualCardSize: (m) => m === 'notes', linksDefineOrder: () => false },
  fitCardText,
  MAX_LEN: 1000,
});

let savedRAF = null;
let savedCAF = null;
beforeEach(() => {
  savedRAF = global.requestAnimationFrame;
  savedCAF = global.cancelAnimationFrame;
  global.requestAnimationFrame = (cb) => { cb(0); return 0; };
  global.cancelAnimationFrame = () => {};
});
afterEach(() => {
  if (savedRAF !== null) global.requestAnimationFrame = savedRAF;
  if (savedCAF !== null) global.cancelAnimationFrame = savedCAF;
});

describe('P3-#1 单卡删除：可撤销 + 刷新浮动条计数', () => {
  test('_removeNoteById 被调用，且先留撤销快照、后刷新计数', () => {
    const undoStack = { push: jest.fn() };
    const ctrl = { _undoStack: undoStack, _removeNoteById: jest.fn(), _updateSelBar: jest.fn() };
    const card = document.createElement('div');
    card.dataset.id = 'n1';
    CardInteractions.removeCard({ state: {}, ctrl }, card);
    expect(undoStack.push).toHaveBeenCalledTimes(1);          // 删除可撤销
    expect(ctrl._removeNoteById).toHaveBeenCalledWith('n1');   // 真正删卡
    expect(ctrl._updateSelBar).toHaveBeenCalledTimes(1);       // 删后刷新浮动条
  });
});

describe('第4步 / P3 缩放门控：写作档不提供拖角缩放手柄', () => {
  test('便签档(_mode=notes) → 创建 .tw-card-resize 手柄', () => {
    const card = document.createElement('div');
    CardInteractions.makeResizable({ state: {}, ctrl: { _mode: 'notes' } }, card);
    expect(card.querySelector('.tw-card-resize')).not.toBeNull();
  });

  test('写作档(_mode=write) → 不创建手柄（尺寸由内容决定）', () => {
    const card = document.createElement('div');
    CardInteractions.makeResizable({ state: {}, ctrl: { _mode: 'write' } }, card);
    expect(card.querySelector('.tw-card-resize')).toBeNull();
  });
});

describe('P2-#9 / P3-#2 拖拽：transform 提交 + 越阈入撤销栈', () => {
  function makeCtrl(card) {
    return {
      _undoStack: { push: jest.fn() },
      _notes: 'notes-before',
      _zTop: 0,
      _selected: new Set([card]),
      _materialMarket: null,
      _linkLayer: null,
      _scheduleRenderLinks: jest.fn(),
      _measureCard: jest.fn(),
      _scheduleSave: jest.fn(),
      _scheduleCull: jest.fn(),
      _pinOnly: jest.fn(),
    };
  }

  test('拖动：越阈 push 快照；拖拽中写 --tw-drag-*；松手提交 left/top 并清变量', () => {
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'n1';
    card.style.left = '10px';
    card.style.top = '20px';
    const ctrl = makeCtrl(card);
    const e = { clientX: 100, clientY: 100, target: card, shiftKey: false, preventDefault: jest.fn() };

    CardInteractions.startGroupDrag({ state: {}, ctrl }, e, card);

    // 模拟一次明显位移（> 4px，scale=1 → 局部位移 = 100px）
    const move = new Event('pointermove');
    move.clientX = 200; move.clientY = 100;
    document.dispatchEvent(move);

    // 拖拽中：先留档（越阈一次）→ 撤销栈 +1
    expect(ctrl._undoStack.push).toHaveBeenCalledTimes(1);
    // 拖拽中：位置走 translate 变量（合成层，不落 left/top）
    expect(card.style.getPropertyValue('--tw-drag-x')).toBe('100px');
    expect(card.style.getPropertyValue('--tw-drag-y')).toBe('0px');
    expect(card.style.left).toBe('10px');   // 松手前 left 未变

    // 松手：一次性提交为 left/top 并清变量
    const up = new Event('pointerup');
    document.dispatchEvent(up);
    expect(card.style.left).toBe('110px');   // 10 + 100
    expect(card.style.top).toBe('20px');     // 20 + 0
    expect(card.style.getPropertyValue('--tw-drag-x')).toBe('');   // 变量已清
    expect(setPos).toHaveBeenCalledWith('notes-before', 'n1', 110, 20);
    expect(ctrl._scheduleSave).toHaveBeenCalledTimes(1);
    expect(ctrl._draggingSet).toBeNull();   // 解除钉屏
  });

  test('轻点（未越阈）：不提交位移、不入撤销栈、走钉住路径', () => {
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'n2';
    card.style.left = '10px';
    card.style.top = '20px';
    const ctrl = makeCtrl(card);
    const e = { clientX: 100, clientY: 100, target: card, shiftKey: false, preventDefault: jest.fn() };

    CardInteractions.startGroupDrag({ state: {}, ctrl }, e, card);
    // 仅 1px 位移，不过阈
    const move = new Event('pointermove');
    move.clientX = 101; move.clientY = 100;
    document.dispatchEvent(move);
    const up = new Event('pointerup');
    document.dispatchEvent(up);

    expect(ctrl._undoStack.push).not.toHaveBeenCalled();
    expect(card.style.left).toBe('10px');   // 未提交
    expect(card.style.getPropertyValue('--tw-drag-x')).toBe('');
    expect(ctrl._draggingSet).toBeNull();
  });

  test('多选整体拖动：非主元素同样挂 .dragging（清贴纸投影）/ 写位移 / 松手清除', () => {
    const c1 = document.createElement('div');
    c1.className = 'bm-sticker';
    c1.dataset.id = 's1';
    c1.style.left = '10px'; c1.style.top = '20px';
    const c2 = document.createElement('div');
    c2.className = 'bm-sticker';
    c2.dataset.id = 's2';
    c2.style.left = '50px'; c2.style.top = '60px';
    const ctrl = makeCtrl(c1);
    ctrl._selected = new Set([c1, c2]);   // 两张贴纸一起选中
    const e = { clientX: 100, clientY: 100, target: c1, shiftKey: false, preventDefault: jest.fn() };

    CardInteractions.startGroupDrag({ state: {}, ctrl }, e, c1);
    // 按下即整个拖动集合都挂 .dragging（否则非主贴纸的 drop-shadow 会每帧重栅格化）
    expect(c1.classList.contains('dragging')).toBe(true);
    expect(c2.classList.contains('dragging')).toBe(true);

    const move = new Event('pointermove');
    move.clientX = 200; move.clientY = 100;
    document.dispatchEvent(move);
    // 非主贴纸也拿到同一批位移
    expect(c2.style.getPropertyValue('--tw-drag-x')).toBe('100px');

    const up = new Event('pointerup');
    document.dispatchEvent(up);
    expect(c1.classList.contains('dragging')).toBe(false);
    expect(c2.classList.contains('dragging')).toBe(false);
    expect(c1.style.willChange).toBe('');
    expect(c2.style.willChange).toBe('');
    expect(c2.style.left).toBe('150px');   // 50 + 100
  });

  // 【对齐 Excalidraw】卡片拖拽只认起始 pointerId：第二指 move 不驱动、第二指 up 不掐断
  test('拖拽只认起始 pointerId：第二指 move 不移动、第二指 up 不结束拖拽', () => {
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'n3';
    card.style.left = '10px';
    card.style.top = '20px';
    const ctrl = makeCtrl(card);
    const e = { clientX: 100, clientY: 100, pointerId: 1, target: card, shiftKey: false, preventDefault: jest.fn() };
    CardInteractions.startGroupDrag({ state: {}, ctrl }, e, card);

    const m2 = new Event('pointermove'); m2.pointerId = 2; m2.clientX = 400; m2.clientY = 400;
    document.dispatchEvent(m2);
    expect(card.style.getPropertyValue('--tw-drag-x')).toBe('');   // 第二指不驱动

    const m1 = new Event('pointermove'); m1.pointerId = 1; m1.clientX = 200; m1.clientY = 100;
    document.dispatchEvent(m1);
    expect(card.style.getPropertyValue('--tw-drag-x')).toBe('100px');   // 起始指驱动

    const u2 = new Event('pointerup'); u2.pointerId = 2;
    document.dispatchEvent(u2);
    expect(card.style.left).toBe('10px');                              // 第二指抬起不提交
    expect(typeof ctrl._cardGestureCancel).toBe('function');           // 拖拽仍在进行

    const u1 = new Event('pointerup'); u1.pointerId = 1;
    document.dispatchEvent(u1);
    expect(card.style.left).toBe('110px');                             // 起始指抬起才提交
    expect(ctrl._cardGestureCancel).toBeNull();
  });

  test('_cardGestureCancel：第二指落空白/捏合取消时，提交当前位置并清空句柄', () => {
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'n4';
    card.style.left = '10px';
    card.style.top = '20px';
    const ctrl = makeCtrl(card);
    const e = { clientX: 100, clientY: 100, pointerId: 1, target: card, shiftKey: false, preventDefault: jest.fn() };
    CardInteractions.startGroupDrag({ state: {}, ctrl }, e, card);

    const m1 = new Event('pointermove'); m1.pointerId = 1; m1.clientX = 200; m1.clientY = 100;
    document.dispatchEvent(m1);
    expect(card.style.getPropertyValue('--tw-drag-x')).toBe('100px');

    ctrl._cardGestureCancel();   // 让位给捏合：当前位置定住，不回弹
    expect(card.style.left).toBe('110px');
    expect(card.style.getPropertyValue('--tw-drag-x')).toBe('');
    expect(ctrl._cardGestureCancel).toBeNull();
  });

  test('makeDraggable：抓手/空格态下不在卡片上起拖拽（让位画布平移）', () => {
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'n5';
    const ctrl = makeCtrl(card);
    ctrl._hand = { state: { handTool: true } };
    CardInteractions.makeDraggable({ state: {}, ctrl }, card);
    card.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(ctrl._cardGestureCancel).toBeUndefined();   // 未起拖拽（让位给画布平移）
  });
});

describe('选中态 .selected 类（贴纸金色描边 A 的触发点）', () => {
  function mkCtrl(initial) {
    return { _selected: new Set(initial || []), _blurInput: jest.fn(), _updateSelBar: jest.fn() };
  }

  test('selectOnly：选中新贴纸加 .selected，旧选中移除', () => {
    const a = document.createElement('div'); a.className = 'bm-sticker'; a.classList.add('selected');
    const b = document.createElement('div'); b.className = 'bm-sticker';
    const ctrl = mkCtrl([a]);
    CardInteractions.selectOnly({ state: {}, ctrl }, b);
    expect(a.classList.contains('selected')).toBe(false);
    expect(b.classList.contains('selected')).toBe(true);
    expect(ctrl._selected.has(b)).toBe(true);
    expect(ctrl._selected.has(a)).toBe(false);
    expect(ctrl._updateSelBar).toHaveBeenCalled();
  });

  test('toggleSelect：再次点同一贴纸 → 取消选中，.selected 移除', () => {
    const a = document.createElement('div'); a.className = 'bm-sticker';
    const ctrl = mkCtrl();
    CardInteractions.toggleSelect({ state: {}, ctrl }, a);
    expect(a.classList.contains('selected')).toBe(true);
    CardInteractions.toggleSelect({ state: {}, ctrl }, a);
    expect(a.classList.contains('selected')).toBe(false);
  });
});

describe('编辑输入 · 组字期间也要字号自适应（「不够及时」的根因）', () => {
  function mkCard() {
    const card = document.createElement('div');
    card.dataset.id = 'n1';
    const text = document.createElement('div');
    text.className = 'tw-card-text';
    text.textContent = '你好';
    text.innerText = '你好';   // jsdom 未实现 innerText，这里补一个可读值供被测代码使用
    card.appendChild(text);
    return card;
  }
  function mkCtrl() {
    return { _notes: [], _scheduleSave: jest.fn(), _enforceEditLimit: jest.fn() };
  }

  test('isComposing=true（中文组字中）→ 不截断/不写模型，但 fitCardText 仍执行', () => {
    setText.mockClear();
    fitCardText.mockClear();
    const c = mkCtrl();
    CardInteractions._handleEditInput(c, mkCard(), { isComposing: true });
    expect(fitCardText).toHaveBeenCalledTimes(1);
    expect(setText).not.toHaveBeenCalled();
    expect(c._scheduleSave).toHaveBeenCalled();
  });

  test('isComposing=false → 写模型 + fitCardText', () => {
    setText.mockClear();
    fitCardText.mockClear();
    const c = mkCtrl();
    CardInteractions._handleEditInput(c, mkCard(), { isComposing: false });
    expect(setText).toHaveBeenCalled();
    expect(fitCardText).toHaveBeenCalledTimes(1);
  });
});

describe('字号自适应的挂钩点（粘贴 / 退出编辑）不被误删', () => {
  function mkCard2() {
    const card = document.createElement('div');
    card.dataset.id = 'n1';
    const text = document.createElement('div');
    text.className = 'tw-card-text';
    text.textContent = '你好';
    text.innerText = '你好';
    card.appendChild(text);
    return card;
  }

  test('粘贴后立即自适应（兜底 execCommand 不派发 input 的环境）', () => {
    fitCardText.mockClear();
    const oldExec = document.execCommand;
    const exec = jest.fn();
    document.execCommand = exec;
    try {
      CardInteractions._handleEditPaste({}, mkCard2(), {
        preventDefault: jest.fn(),
        clipboardData: { getData: () => '粘贴内容' },
      });
    } finally {
      document.execCommand = oldExec;
    }
    expect(exec).toHaveBeenCalled();
    expect(fitCardText).toHaveBeenCalledTimes(1);
  });

  test('退出编辑后自适应一次（兜住最后一次输入 / 组字收尾的布局变化）', () => {
    fitCardText.mockClear();
    setText.mockClear();
    const card = mkCard2();
    card.classList.add('editing');
    const text = card.querySelector('.tw-card-text');
    text.setAttribute('contenteditable', 'true');
    card._editHandlers = { onInput() {}, onKey() {}, onPaste() {} };
    const ctrl = { _notes: [], _editingId: 'n1', _scheduleSave: jest.fn(), _invalidateGeo: jest.fn() };

    CardInteractions.exitEdit({ state: {}, ctrl }, card);

    expect(fitCardText).toHaveBeenCalledTimes(1);
    expect(card.classList.contains('editing')).toBe(false);
    expect(text.hasAttribute('contenteditable')).toBe(false);
  });
});

describe('框选边缘自动平移：步长随深度渐变（防「画布跳走」）', () => {
  const vp = { left: 0, top: 0, width: 1000, height: 800 };

  test('不在边缘区 → null（完全不平移）', () => {
    expect(CardInteractions.marqueeEdgeStep(500, 400, vp, 48, 14)).toBeNull();
  });

  test('刚跨入边缘区 → 最小步长 1（不再"瞬间全速"）', () => {
    // 右侧：lx=953，距右边缘 47px（边缘区 48）
    expect(CardInteractions.marqueeEdgeStep(953, 400, vp, 48, 14)).toEqual({ dx: -1, dy: 0, step: 1 });
  });

  test('贴到边缘 → 步长达到上限', () => {
    const s = CardInteractions.marqueeEdgeStep(1000, 400, vp, 48, 14);
    expect(s.dx).toBe(-1);
    expect(s.step).toBe(14);
  });

  test('越靠边越快（单调不减，且不超过上限）', () => {
    const near = CardInteractions.marqueeEdgeStep(960, 400, vp, 48, 14).step;
    const nearer = CardInteractions.marqueeEdgeStep(990, 400, vp, 48, 14).step;
    expect(near).toBeGreaterThanOrEqual(1);
    expect(nearer).toBeGreaterThanOrEqual(near);
    expect(nearer).toBeLessThanOrEqual(14);
  });
});

describe('框选松手后不自动平移画布（保持原位，彻底消除松手移动）', () => {
  function mkRevealCtx(geo) {
    const canvas = document.createElement('div');
    Object.defineProperty(canvas, 'clientWidth', { value: 1000 });
    Object.defineProperty(canvas, 'clientHeight', { value: 800 });
    const card = document.createElement('div');
    card.dataset.id = 'n1';
    const ctrl = {
      _selected: new Set([card]),
      _canvas: canvas,
      _geo: { get: (id) => (id === 'n1' ? geo : null) },
      _setCanvasOffset: jest.fn(),
      _updateSelBar: jest.fn(),
    };
    return { state: {}, ctrl };
  }

  test('选区在视口内 → 完全不平移', () => {
    const ctx = mkRevealCtx({ x: 100, y: 100, w: 200, h: 100 });
    CardInteractions.revealSelection(ctx);
    expect(ctx.ctrl._setCanvasOffset).not.toHaveBeenCalled();
    expect(ctx.ctrl._updateSelBar).toHaveBeenCalled();   // 仍刷新选区工具条
  });

  test('选区超出右边界 → 也完全不平移（不再拉回、不再居中）', () => {
    const ctx = mkRevealCtx({ x: 1200, y: 100, w: 340, h: 100 });
    CardInteractions.revealSelection(ctx);
    expect(ctx.ctrl._setCanvasOffset).not.toHaveBeenCalled();
    expect(ctx.ctrl._updateSelBar).toHaveBeenCalled();
  });
});
