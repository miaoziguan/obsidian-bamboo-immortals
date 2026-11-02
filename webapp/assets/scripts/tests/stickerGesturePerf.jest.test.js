const { loadModule } = require('./__helpers__/testUtils.js');

// 贴纸旋转 / 缩放手柄在 materialMarket.js；拖动/旋转/缩放期都应挂 .dragging，
// 以便 .bm-sticker.dragging { filter:none } 生效（避免每帧重栅格化 drop-shadow）。
const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket'], {
  byId: (id) => document.getElementById(id),
});

describe('贴纸旋转 / 缩放手势的 .dragging 开关（清 drop-shadow 防掉帧）', () => {
  let rafSaved;
  beforeEach(() => {
    rafSaved = global.requestAnimationFrame;
    global.requestAnimationFrame = () => 0;
    MaterialMarket._saveStickers = jest.fn();
  });
  afterEach(() => {
    global.requestAnimationFrame = rafSaved;
    document.body.innerHTML = '';
  });

  test('旋转：按下加 .dragging + will-change，松手清除', () => {
    const el = document.createElement('div');
    el.className = 'bm-sticker';
    const handle = document.createElement('button');
    handle.className = 'bm-sticker-rotate';
    el.appendChild(handle);
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
    document.body.appendChild(el);

    const ctrl = { _zTop: 0 };
    MaterialMarket._makeStickerRotatable(ctrl, el, { rot: 0 });

    handle.dispatchEvent(new Event('pointerdown'));
    expect(el.classList.contains('dragging')).toBe(true);
    expect(el.style.willChange).toBe('transform');

    document.dispatchEvent(new Event('pointerup'));
    expect(el.classList.contains('dragging')).toBe(false);
    expect(el.style.willChange).toBe('');
  });

  // 事故（2026-11）：对自由贴纸做一次旋转后，拖动变成「全程不动、松手瞬移」，
  // 且一直坏到重启（重建 DOM）为止。根因是旋转手势只写 `rotate(Ndeg)`，
  // 把 _applyStickerBox 写的 `translate(var(--tw-drag-x…), …)` 覆盖掉 ——
  // 而拖动正是靠每帧改这两个变量产生位移的。以下三条钉死「谁都不许抹掉它」。
  function mountSticker(rec, initialTransform) {
    const el = document.createElement('div');
    el.className = 'bm-sticker';
    if (initialTransform) el.style.transform = initialTransform;
    const handle = document.createElement('button');
    handle.className = 'bm-sticker-rotate';
    el.appendChild(handle);
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
    document.body.appendChild(el);
    MaterialMarket._makeStickerRotatable({ _zTop: 0 }, el, rec);
    return { el, handle };
  }

  test('自由态：旋转手势后 transform 仍带拖动位移变量', () => {
    const FREE = 'translate(var(--tw-drag-x, 0px), var(--tw-drag-y, 0px)) rotate(0deg)';
    const rec = { rot: 0 };
    const { el, handle } = mountSticker(rec, FREE);
    handle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 50, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 0, clientY: 50 }));
    document.dispatchEvent(new MouseEvent('pointerup'));
    expect(el.style.transform).toContain('translate(var(--tw-drag-x');
    expect(el.style.transform).toContain('rotate(');
    expect(Math.abs(Number(rec.rot))).toBeGreaterThan(0);   // 旋转本身确实生效了
  });

  test('自由态：双击归零后 transform 仍带拖动位移变量', () => {
    const rec = { rot: 33 };
    const { el, handle } = mountSticker(rec, 'translate(var(--tw-drag-x, 0px), var(--tw-drag-y, 0px)) rotate(33deg)');
    handle.dispatchEvent(new MouseEvent('dblclick'));
    expect(el.style.transform).toBe('translate(var(--tw-drag-x, 0px), var(--tw-drag-y, 0px)) rotate(0deg)');
    expect(rec.rot).toBe(0);
  });

  test('依附态：旋转后只保留 rotate（父卡片已有位移，不能再叠一层 translate）', () => {
    const rec = { rot: 0, parentId: 'card-1' };
    const { el, handle } = mountSticker(rec, 'rotate(0deg)');
    handle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 50, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 0, clientY: 50 }));
    document.dispatchEvent(new MouseEvent('pointerup'));
    expect(el.style.transform).not.toContain('translate(');
    expect(el.style.transform).toContain('rotate(');
  });

  test('_stickerTransform 是唯一真源：自由/依附两态分别带与不带 translate', () => {
    expect(MaterialMarket._stickerTransform({ rot: 12 })).toBe(
      'translate(var(--tw-drag-x, 0px), var(--tw-drag-y, 0px)) rotate(12deg)');
    expect(MaterialMarket._stickerTransform({ rot: 12, parentId: 'c' })).toBe('rotate(12deg)');
    expect(MaterialMarket._stickerTransform({ rot: 12 }, 90)).toContain('rotate(90deg)');
  });

  test('缩放：按下加 .dragging，松手清除', () => {
    const el = document.createElement('div');
    el.className = 'bm-sticker';
    const handle = document.createElement('button');
    handle.className = 'bm-sticker-resize';
    el.appendChild(handle);
    document.body.appendChild(el);

    const ctrl = { _zTop: 0 };
    MaterialMarket._makeStickerResizable(ctrl, el, { w: 120, h: 120 });

    handle.dispatchEvent(new Event('pointerdown'));
    expect(el.classList.contains('dragging')).toBe(true);

    document.dispatchEvent(new Event('pointerup'));
    expect(el.classList.contains('dragging')).toBe(false);
  });
});
