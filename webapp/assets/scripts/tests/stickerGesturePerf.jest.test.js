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
