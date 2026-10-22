const { loadModule } = require('./__helpers__/testUtils.js');

// 贴纸级联删除在 MaterialMarket；浮动条几何缓存在 TypewriterFeature。
const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket'], {});
const { TypewriterFeature: Typewriter } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {});

describe('贴纸级联删除（MaterialMarket.removeAttachedStickers）', () => {
  test('便签删除时连带删除挂在其下的贴纸：DOM 摘除 + 列表移除 + 计数 + 落盘', () => {
    const parent = document.createElement('div');
    const s1 = document.createElement('div');
    const s2 = document.createElement('div');
    const s3 = document.createElement('div');
    parent.appendChild(s1); parent.appendChild(s2); parent.appendChild(s3);
    MaterialMarket._canvasStickers = [
      { id: 's1', el: s1, parentId: 'cardA' },
      { id: 's2', el: s2, parentId: 'cardB' },
      { id: 's3', el: s3, parentId: 'cardA' },
    ];
    MaterialMarket._saveStickers = jest.fn();
    const n = MaterialMarket.removeAttachedStickers('cardA');
    expect(n).toBe(2);                       // 两张挂在 cardA 下
    expect(s1.parentNode).toBeNull();        // 真正从 DOM 摘除
    expect(s3.parentNode).toBeNull();
    expect(s2.parentNode).toBe(parent);      // 不相关的贴纸不受影响
    expect(MaterialMarket._canvasStickers.map((x) => x.id)).toEqual(['s2']);
    expect(MaterialMarket._saveStickers).toHaveBeenCalled();
  });

  test('无依附贴纸的卡 → 返回 0，不触碰列表、不落盘', () => {
    const parent = document.createElement('div');
    const s1 = document.createElement('div');
    parent.appendChild(s1);
    MaterialMarket._canvasStickers = [{ id: 's1', el: s1, parentId: 'cardB' }];
    MaterialMarket._saveStickers = jest.fn();
    expect(MaterialMarket.removeAttachedStickers('cardA')).toBe(0);
    expect(MaterialMarket._canvasStickers.map((x) => x.id)).toEqual(['s1']);
    expect(MaterialMarket._saveStickers).not.toHaveBeenCalled();
  });
});

describe('依附贴纸层叠（_applyStickerBox）：浮在纸纹之上、半藏仍在纸后', () => {
  // _applyStickerBox 只用到 this._ctrl / _cardElById / _stickerAspect / _installed，
  // 用一个假 this 调用，避免改动 MaterialMarket 单例。
  function boxFor(behind) {
    const el = document.createElement('div');
    const rec = { el, parentId: 'c1', behind, rx: 0, ry: 0, rw: 35, rh: 35, material: 'm' };
    const fakeThis = { _ctrl: {}, _cardElById: () => ({}), _stickerAspect: () => null, _installed: {} };
    MaterialMarket._applyStickerBox.call(fakeThis, rec);
    return el;
  }

  test('正常依附贴纸 z-index=30（高于夜光纸 ::after 的 20 / 正文 10，低于卡片手柄）', () => {
    expect(boxFor(false).style.zIndex).toBe('30');
  });

  test('behind 贴纸 z-index=-1（半藏在纸后）', () => {
    expect(boxFor(true).style.zIndex).toBe('-1');
  });
});

describe('P2-#11 浮动条包围盒走几何缓存（Typewriter._tickSelBar）', () => {
  let bar;
  let canvas;
  let ctrl;
  let rafSaved;
  beforeEach(() => {
    rafSaved = global.requestAnimationFrame;
    global.requestAnimationFrame = () => 0;   // 避免无 rAF 分支递归；且不触发排帧
    bar = document.createElement('div');
    bar.classList.add('is-on');
    canvas = document.createElement('div');
    document.body.appendChild(canvas);
    ctrl = {
      _selBarEl: bar,
      _canvas: canvas,
      _state: {},
      _selected: new Set(),
      _geo: null,
      _updateSelBar: jest.fn(),
      _scheduleSelBarTick: jest.fn(),
      _refreshWriteOrder: jest.fn(),
    };
  });
  afterEach(() => {
    global.requestAnimationFrame = rafSaved;
    document.body.innerHTML = '';
  });

  test('有几何缓存且 scale≈1 → 从 _geo 取包围盒，不对选中卡做 getBoundingClientRect', () => {
    const c1 = document.createElement('div'); c1.dataset.id = 'c1';
    const c2 = document.createElement('div'); c2.dataset.id = 'c2';
    ctrl._selected = new Set([c1, c2]);
    ctrl._geo = new Map([
      ['c1', { x: 100, y: 100, w: 50, h: 50 }],
      ['c2', { x: 200, y: 100, w: 50, h: 50 }],
    ]);
    const spy = jest.spyOn(c1, 'getBoundingClientRect');
    Typewriter._tickSelBar.call(ctrl, true);
    // 性能关键断言：手势期不逐卡测量，只在 geo 层算
    expect(spy).not.toHaveBeenCalled();
    expect(bar.style.left).toBe('175px');   // (minX100 + maxX250) / 2
    expect(bar.style.top).toMatch(/px$/);
  });

  test('无几何缓存 → 回退 getBoundingClientRect（行为不变）', () => {
    const c1 = document.createElement('div'); c1.dataset.id = 'c1';
    const c2 = document.createElement('div'); c2.dataset.id = 'c2';
    ctrl._selected = new Set([c1, c2]);
    ctrl._geo = null;
    const spy = jest.spyOn(c1, 'getBoundingClientRect').mockReturnValue(
      { left: 300, top: 200, right: 350, bottom: 250, width: 50, height: 50 });
    jest.spyOn(c2, 'getBoundingClientRect').mockReturnValue(
      { left: 300, top: 200, right: 350, bottom: 250, width: 50, height: 50 });
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
      { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 });
    Typewriter._tickSelBar.call(ctrl, true);
    expect(spy).toHaveBeenCalled();
    expect(bar.style.left).toBe('325px');   // (300 + 350) / 2（两张卡 BCR 一致，cx 不变）
  });
});
