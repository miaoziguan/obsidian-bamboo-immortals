/**
 * @jest-environment jsdom
 */
// 「拖图片进画中卷」的接线回归锁。
//
// 为什么值得锁：画中卷跑在 iframe 里，把一个文件拖进 iframe 的默认行为是**导航到该文件**
// ——表现为整个画中卷白屏，且不可恢复（只能重开视图）。所以整页必须有一条
// 「拖文件一律 preventDefault」的兜底；而真正的插入只能由卡片那一层做一次
// （画布委托），否则编辑态 + 卡片级各挂一遍就会插两张。
const { loadModule } = require('./__helpers__/testUtils');

function setup() {
  const CardInteractions = { insertImageFiles: jest.fn(() => Promise.resolve(1)) };
  const Toast = { showToast: jest.fn() };
  jest.resetModules();
  const Tw = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
    TypewriterStore: { loadDoc: () => Promise.resolve(null), saveDoc: () => Promise.resolve() },
    CardInteractions,
    Toast,
  }).TypewriterFeature;

  const el = document.createElement('div');
  const canvas = document.createElement('div');
  canvas.className = 'tw-canvas';
  const card = document.createElement('div');
  card.className = 'tw-card';
  card.dataset.id = 'a';
  const text = document.createElement('div');
  text.className = 'tw-card-text';
  card.appendChild(text);
  canvas.appendChild(card);
  el.appendChild(canvas);
  document.body.appendChild(el);

  Tw._el = el;
  Tw._canvas = canvas;
  Tw._state = { notes: [] };
  Tw._unbindFileDropGuards();   // 上一个用例可能残留
  Tw._bindFileDropGuards();
  return { Tw, canvas, card, CardInteractions, Toast };
}

function dragEvent(type, target, files) {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  ev.dataTransfer = {
    types: files && files.length ? ['Files'] : ['text/plain'],
    files: files || [],
    dropEffect: 'none',
  };
  target.dispatchEvent(ev);
  return ev;
}

afterEach(() => {
  document.body.innerHTML = '';
});

test('拖文件到整页任意位置都不会触发 iframe 导航（dragover/drop 全部 preventDefault）', () => {
  const { Tw } = setup();
  const outside = document.createElement('div');
  document.body.appendChild(outside);
  const png = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' });

  expect(dragEvent('dragover', outside, [png]).defaultPrevented).toBe(true);
  expect(dragEvent('drop', outside, [png]).defaultPrevented).toBe(true);
  Tw._unbindFileDropGuards();
});

test('拖着纯文字/链接时完全不插手（不改变正常拖拽语义）', () => {
  const { Tw } = setup();
  const outside = document.createElement('div');
  document.body.appendChild(outside);
  expect(dragEvent('dragover', outside, []).defaultPrevented).toBe(false);
  expect(dragEvent('drop', outside, []).defaultPrevented).toBe(false);
  Tw._unbindFileDropGuards();
});

test('拖到卡片上：交给 CardInteractions.insertImageFiles，且只调一次', () => {
  const { Tw, card, CardInteractions } = setup();
  const png = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' });

  const ev = dragEvent('drop', card, [png]);
  expect(ev.defaultPrevented).toBe(true);
  expect(CardInteractions.insertImageFiles).toHaveBeenCalledTimes(1);
  const [ctx, target, files] = CardInteractions.insertImageFiles.mock.calls[0];
  expect(ctx.ctrl).toBe(Tw);
  expect(target).toBe(card);
  expect(files.length).toBe(1);
  Tw._unbindFileDropGuards();
});

test('拖到卡片但拖的不是图片：不插、也不打扰', () => {
  const { Tw, card, CardInteractions, Toast } = setup();
  const pdf = new File([new Uint8Array([1])], 'a.pdf', { type: 'application/pdf' });
  dragEvent('drop', card, [pdf]);
  expect(CardInteractions.insertImageFiles).not.toHaveBeenCalled();
  expect(Toast.showToast).not.toHaveBeenCalled();
  Tw._unbindFileDropGuards();
});

test('拖到空画布：不插入，但给一句可操作的提示', () => {
  const { Tw, canvas, CardInteractions, Toast } = setup();
  const png = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
  const ev = dragEvent('drop', canvas, [png]);
  expect(ev.defaultPrevented).toBe(true);
  expect(CardInteractions.insertImageFiles).not.toHaveBeenCalled();
  expect(Toast.showToast).toHaveBeenCalledTimes(1);
  expect(Toast.showToast.mock.calls[0][0]).toContain('拖到卡片');
  Tw._unbindFileDropGuards();
});

test('解绑后不再拦截（unmount 会把监听清干净，不泄漏到下一次挂载）', () => {
  const { Tw } = setup();
  Tw._unbindFileDropGuards();
  const outside = document.createElement('div');
  document.body.appendChild(outside);
  const png = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
  expect(dragEvent('drop', outside, [png]).defaultPrevented).toBe(false);
});

test('重复绑定不会挂两份监听（mount 幂等）', () => {
  const { Tw, card, CardInteractions } = setup();
  Tw._bindFileDropGuards();
  Tw._bindFileDropGuards();
  const png = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
  dragEvent('drop', card, [png]);
  expect(CardInteractions.insertImageFiles).toHaveBeenCalledTimes(1);
  Tw._unbindFileDropGuards();
});
