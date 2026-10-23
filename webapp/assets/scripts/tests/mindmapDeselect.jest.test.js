/**
 * @jest-environment jsdom
 */
// 回归：思维子弹「选中节点后单击空白画布取消选中」。
// 单选存在 _selId 上（不在 _selSet 里）；此前 _startMarquee 只清 _selSet，
// 单击空白 = 零尺寸框选 → _selectInRect 选不到东西 → _selSet.size===0 → _selId 永不清。
const { loadModule } = require('./__helpers__/testUtils');

const { MindmapFeature } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);

function mkMM() {
  const canvas = document.createElement('div');
  document.body.appendChild(canvas);
  return {
    _canvas: canvas,
    _view: { x: 0, y: 0, scale: 1 },
    _marquee: null, _marqueeRect: null, _marqueeMove: null, _marqueeUp: null,
    _selId: null, _selSet: new Set(),
    _clearMultiSel: jest.fn(),
    _select: jest.fn(),
    _selectInRect: jest.fn(),
  };
}
const fireUp = () => document.dispatchEvent(new Event('pointerup'));

describe('思维子弹：点空白取消选中（单选 _selId）', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('非 Shift 新建框选：清空单选+多选（单击空白即取消选中）', () => {
    const mm = mkMM();
    mm._selId = 'a';                 // 当前单选某颗节点
    MindmapFeature._startMarquee.call(mm, { clientX: 10, clientY: 10 }, false);
    expect(mm._clearMultiSel).toHaveBeenCalled();
    expect(mm._select).toHaveBeenCalledWith(null);   // 关键：单选被清掉
    fireUp();
  });

  test('Shift 追加框选：保留已有选中（不清单/多选）', () => {
    const mm = mkMM();
    mm._selId = 'a';
    MindmapFeature._startMarquee.call(mm, { clientX: 10, clientY: 10 }, true);
    expect(mm._clearMultiSel).not.toHaveBeenCalled();
    expect(mm._select).not.toHaveBeenCalled();
    fireUp();
  });
});
