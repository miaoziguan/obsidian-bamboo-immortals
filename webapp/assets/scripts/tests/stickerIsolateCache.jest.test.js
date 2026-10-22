const { loadModule } = require('./__helpers__/testUtils.js');

const { isolateStickerHtml, evictStickerIsolate } = loadModule(
  'utils/stickerIsolateCache.js',
  ['isolateStickerHtml', 'evictStickerIsolate'],
  {
    // 模拟隔离：把前缀写进结果，便于断言不同 recId 产出不同字符串
    SvgIsolate: { isolate: (html, prefix) => '<wrapped data-p="' + prefix + '">' + html + '</wrapped>' },
  }
);

function makeMaterial() {
  return { render: jest.fn(() => '<svg><path/></svg>') };
}

describe('贴纸隔离结果缓存', () => {
  test('同一素材 + 同一 recId → render 只调用一次，结果复用', () => {
    const m = makeMaterial();
    const a = isolateStickerHtml(m, 'stk-1');
    const b = isolateStickerHtml(m, 'stk-1');
    expect(m.render).toHaveBeenCalledTimes(1);
    expect(b).toBe(a);
    expect(a).toContain('stk-1-');       // 前缀按 recId
  });

  test('不同 recId → 各自独立缓存（前缀不同、结果不同）', () => {
    const m = makeMaterial();
    const a = isolateStickerHtml(m, 'stk-1');
    const b = isolateStickerHtml(m, 'stk-2');
    expect(m.render).toHaveBeenCalledTimes(2);
    expect(a).not.toBe(b);
    expect(b).toContain('stk-2-');
  });

  test('不同素材对象 → 互不串用（WeakMap 按素材隔离）', () => {
    const m1 = makeMaterial();
    const m2 = makeMaterial();
    isolateStickerHtml(m1, 'stk-1');
    isolateStickerHtml(m2, 'stk-1');
    expect(m1.render).toHaveBeenCalledTimes(1);
    expect(m2.render).toHaveBeenCalledTimes(1);   // 各自算了一次，没有命中对方的缓存
  });

  test('evict 之后同一 recId 会重新处理', () => {
    const m = makeMaterial();
    isolateStickerHtml(m, 'stk-9');
    evictStickerIsolate(m, 'stk-9');
    isolateStickerHtml(m, 'stk-9');
    expect(m.render).toHaveBeenCalledTimes(2);
  });

  test('素材无 render → 返回空串，不缓存不报错', () => {
    expect(isolateStickerHtml({}, 'stk-1')).toBe('');
    expect(isolateStickerHtml(null, 'stk-1')).toBe('');
  });
});
