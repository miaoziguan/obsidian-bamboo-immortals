const { loadModule } = require('./__helpers__/testUtils.js');

const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket'], {});

/** 以 MaterialMarket 为原型造一个实例：可用自有属性覆盖方法，避免污染单例 */
function mkMM(over) {
  return Object.assign(Object.create(MaterialMarket), over || {});
}

function connectedEl() {
  const el = document.createElement('div');
  el.className = 'bm-sticker';
  document.body.appendChild(el);
  return el;
}

afterEach(() => { document.body.innerHTML = ''; delete window.storageManager; });

describe('B · 停放（离开便签档不销毁自由贴纸）', () => {
  test('只有自由贴纸 → 保存但不清空（DOM 保留，切回可跳过重建）', async () => {
    const el = connectedEl();
    const mm = mkMM({
      _canvasStickers: [{ id: 's1', el, parentId: null }],
      _saveStickers: jest.fn().mockResolvedValue(undefined),
      _clearStickerDom: jest.fn(),
    });
    await mm.parkStickers();
    expect(mm._saveStickers).toHaveBeenCalled();
    expect(mm._clearStickerDom).not.toHaveBeenCalled();
    expect(mm._canvasStickers.length).toBe(1);
  });

  test('存在依附贴纸 → 照旧清空（它们会随卡片被清掉）', async () => {
    const el = connectedEl();
    const mm = mkMM({
      _canvasStickers: [{ id: 's1', el, parentId: 'card1' }],
      _saveStickers: jest.fn().mockResolvedValue(undefined),
      _clearStickerDom: jest.fn(),
    });
    await mm.parkStickers();
    expect(mm._clearStickerDom).toHaveBeenCalled();
  });
});

describe('B · 贴纸 DOM 是否完好', () => {
  test('全部连接 → true', () => {
    const a = connectedEl(); const b = connectedEl();
    const mm = mkMM({ _ctrl: { _canvas: document.body }, _canvasStickers: [{ el: a }, { el: b }] });
    expect(mm._stickerDomIntact()).toBe(true);
  });

  test('有一张断开 / 为空 → false', () => {
    const a = connectedEl();
    const b = document.createElement('div');   // 未入 DOM
    const mm = mkMM({ _ctrl: { _canvas: document.body }, _canvasStickers: [{ el: a }, { el: b }] });
    expect(mm._stickerDomIntact()).toBe(false);
    expect(mkMM({ _ctrl: { _canvas: document.body }, _canvasStickers: [] })._stickerDomIntact()).toBe(false);
  });
});

describe('B · 同组切回跳过重建', () => {
  function base(over) {
    const canvas = document.createElement('div');
    document.body.appendChild(canvas);
    return mkMM(Object.assign({
      _ctrl: { _mode: 'notes', _canvas: canvas },
      _stickerKey: jest.fn(async () => 'group-1'),
      _clearStickerDom: jest.fn(),
      _buildStickerEl: jest.fn(() => connectedEl()),
      _ensureDecoLayer: () => canvas,
      _cardElById: () => null,
      _installed: { m: { name: 'm', render: () => '<svg/>' } },
      _bringStickersToFront: jest.fn(),
      syncDecoLayer: jest.fn(),
    }, over || {}));
  }

  test('同组 + DOM 完好 → 跳过重建（不 clear、不 build，只确保显示）', async () => {
    window.storageManager = { getSetting: jest.fn(async () => [{ id: 's1', material: 'm' }]) };
    const mm = base({ _mountedStickerKey: 'group-1', _stickerDomIntact: () => true });
    await mm._restoreStickers();
    expect(mm._clearStickerDom).not.toHaveBeenCalled();
    expect(mm._buildStickerEl).not.toHaveBeenCalled();
    expect(mm._bringStickersToFront).toHaveBeenCalled();   // 卡片重建会拿更大的 z，必须重新置顶
    expect(mm.syncDecoLayer).toHaveBeenCalled();
  });

  test('组变了 → 正常重建', async () => {
    window.storageManager = { getSetting: jest.fn(async () => [{ id: 's1', material: 'm' }]) };
    const mm = base({ _mountedStickerKey: 'group-0', _stickerDomIntact: () => true });
    await mm._restoreStickers();
    expect(mm._clearStickerDom).toHaveBeenCalled();
    expect(mm._buildStickerEl).toHaveBeenCalledTimes(1);
    expect(mm._mountedStickerKey).toBe('group-1');
  });

  test('force=true → 即使同组且完好也重建', async () => {
    window.storageManager = { getSetting: jest.fn(async () => [{ id: 's1', material: 'm' }]) };
    const mm = base({ _mountedStickerKey: 'group-1', _stickerDomIntact: () => true });
    await mm._restoreStickers(true);
    expect(mm._buildStickerEl).toHaveBeenCalledTimes(1);
  });
});

describe('B · 跳过重建时贴纸重新置顶（否则会被重建卡片盖住）', () => {
  test('自由贴纸拿到递增 z；依附贴纸不动；_zTop 同步推进', () => {
    const a = connectedEl();
    const b = connectedEl();
    const c = connectedEl();
    const mm = mkMM({
      _canvasStickers: [
        { id: 'a', el: a },
        { id: 'b', el: b, parentId: 'card1' },   // 依附：不应被改动
        { id: 'c', el: c },
      ],
    });
    const ctrl = { _zTop: 30 };
    mm._bringStickersToFront(ctrl);
    expect(Number(a.style.zIndex)).toBe(31);
    expect(Number(c.style.zIndex)).toBe(32);
    expect(b.style.zIndex).toBe('');             // 依附贴纸层叠由卡片决定
    expect(ctrl._zTop).toBe(32);
  });
});
