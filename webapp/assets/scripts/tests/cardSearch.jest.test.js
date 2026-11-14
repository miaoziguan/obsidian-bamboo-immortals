/**
 * @jest-environment jsdom
 */
// 卡片模糊跳转：匹配算法（纯函数）+ 画布内浮层（打开/过滤/键盘/跳转高亮）。
// 定位是「跳转式查找」，只读模型，不做任何替换。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
const { fuzzyScore, rankNotes, excerpt } = loadModule(
  'utils/cardSearch.js',
  ['fuzzyScore', 'rankNotes', 'excerpt'],
);
// typewriterFeature 用 typeof 前的直接调用：harness 剥离 import 后靠全局注入
global.rankNotes = rankNotes;
global.excerpt = excerpt;
const { TypewriterFeature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
  FONTS: ['modern'], PAPERS: ['plain'], MARKET_FONTS: [],
  Toast: { showToast: jest.fn() },
  ViewportCuller: { setGeom: jest.fn(), removeGeom: jest.fn() },
  CanvasViewport: { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 },
  MindmapFeature: { teardown: jest.fn() },
  TypewriterStore: { invalidateWritingIndex: jest.fn() },
  MaterialMarket: { toggle: jest.fn() },
});

describe('fuzzyScore', () => {
  test('连续命中高于散落命中', () => {
    const contiguous = fuzzyScore('写作档心法', '写作');
    const scattered = fuzzyScore('写一段作废的话', '写作');
    expect(contiguous).toBeGreaterThan(scattered);
  });

  test('词首命中高于句中命中', () => {
    expect(fuzzyScore('表格编辑', '表')).toBeGreaterThan(fuzzyScore('编辑表格', '表'));
  });

  test('不匹配 / 空文本 / 空查询', () => {
    expect(fuzzyScore('表格', '图片')).toBe(0);
    expect(fuzzyScore('', '表')).toBe(0);
    expect(fuzzyScore('表格', '')).toBe(1);     // 空查询：全部通过
  });

  test('大小写不敏感；空格只作分隔', () => {
    expect(fuzzyScore('Hello World', 'hw')).toBeGreaterThan(0);
    expect(fuzzyScore('hello world', 'hello w')).toBeGreaterThan(0);
  });
});

describe('rankNotes', () => {
  const notes = [
    { id: 'a', seq: 0, level: 'p', text: '开头一段普通文字' },
    { id: 'b', seq: 1, level: 'h2', text: '表格编辑体验' },
    { id: 'c', seq: 2, level: 'p', text: '这里也提到表格，但更靠后' },
  ];

  test('按分数降序，同分按 seq', () => {
    const out = rankNotes(notes, '表格', 10);
    expect(out.map((r) => r.note.id)).toEqual(['b', 'c']);
  });

  test('空查询按文章顺序列前 N 张', () => {
    expect(rankNotes(notes, '', 2).map((r) => r.note.id)).toEqual(['a', 'b']);
  });

  test('无匹配返回空数组；limit 生效', () => {
    expect(rankNotes(notes, '不存在的词', 10)).toEqual([]);
    expect(rankNotes(notes, '', 1).length).toBe(1);
  });

  test('hit 记录连续子串位置，供摘要高亮/截断', () => {
    const hit = rankNotes(notes, '表格', 1)[0];
    expect(hit.hit).toBe(0);
  });
});

describe('excerpt', () => {
  test('命中在中间时前后截断并加省略号', () => {
    const s = '前'.repeat(60) + '关键词' + '后'.repeat(60);
    const out = excerpt(s, 60, '关键词');
    expect(out).toContain('关键词');
    expect(out.startsWith('…')).toBe(true);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThan(s.length);
  });

  test('无命中位置时取开头', () => {
    expect(excerpt('短文本', -1, '')).toBe('短文本');
  });
});

// ---- 浮层接线 ----
function fakeCtrl(notes) {
  const root = document.createElement('div');
  const canvas = document.createElement('div');
  root.appendChild(canvas);
  // 缩放条 + 放大镜：真实环境里由 CanvasZoomUI 挂到功能根下。
  // 条与按钮给不同的矩形，用来证明浮层是以「整条」为中心而不是以按钮为中心。
  const bar = document.createElement('div');
  bar.className = 'tw-zoom-bar';
  const btn = document.createElement('button');
  btn.className = 'tw-zoom-btn tw-zoom-search';
  bar.appendChild(btn);
  root.appendChild(bar);
  root.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 });
  bar.getBoundingClientRect = () => ({ left: 100, top: 10, width: 300, height: 30, right: 400, bottom: 40 });
  btn.getBoundingClientRect = () => ({ left: 380, top: 10, width: 20, height: 30, right: 400, bottom: 40 });
  document.body.appendChild(root);
  const c = {
    _el: root,
    _canvas: canvas,
    _notes: notes,
    _mountedCards: new Map(),
    _ensureCardVisible: jest.fn(),
  };
  [
    '_ensureCardSearch', '_openCardSearch', '_closeCardSearch', '_positionCardSearch',
    '_renderCardSearch', '_moveCardSearchActive', '_jumpToNote',
  ].forEach((m) => {
    c[m] = (...args) => TypewriterFeature[m].call(c, ...args);
  });
  return c;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('缩放条入口', () => {
  global.CanvasViewport = { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 };
  const { CanvasZoomUI } = loadModule('services/CanvasZoomUI.js', ['CanvasZoomUI']);
  const mkAdapter = (extra) => Object.assign({
    getCanvas: () => null,
    getView: () => ({ x: 0, y: 0, scale: 1 }),
    setView: () => {}, zoomAtCenter: () => {}, reset: () => {}, fit: () => {},
  }, extra);

  test('传了 onSearch 才生成搜索键，点击触发', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const onSearch = jest.fn();
    CanvasZoomUI.mount(host, mkAdapter({ onSearch }));
    const btn = host.querySelector('[data-act="search"]');
    expect(btn).toBeTruthy();
    btn.click();
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  test('未传 onSearch 的档位（导图）不生成搜索键', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    CanvasZoomUI.mount(host, mkAdapter());
    expect(host.querySelector('[data-act="search"]')).toBeNull();
  });
});

describe('搜索浮层', () => {
  const NOTES = [
    { id: 'a', seq: 0, level: 'p', text: '开头一段' },
    { id: 'b', seq: 1, level: 'h2', text: '表格编辑体验' },
    { id: 'c', seq: 2, level: 'p', text: '另一段提到表格' },
  ];

  test('打开：浮层可见、聚焦输入框、按文章顺序列出结果', () => {
    const c = fakeCtrl(NOTES);
    c._openCardSearch();
    const box = c._cardSearchEl;
    expect(box.hidden).toBe(false);
    const items = box.querySelectorAll('.tw-card-search-item');
    expect(items.length).toBe(3);
    expect(items[0].classList.contains('is-active')).toBe(true);
    expect(box.querySelector('.tw-card-search-input')).toBe(document.activeElement);
    // 以「整条缩放条」中心为锚（条中心 x=250，见夹具），而非放大镜按钮（x=390）；
    // 纵向贴在条下沿 +8
    expect(box.style.left).toBe('250px');
    expect(box.style.top).toBe('48px');
    expect(box.style.transform).toBe('none');
  });

  test('输入过滤：只剩匹配项，级别徽章与摘要都在', () => {
    const c = fakeCtrl(NOTES);
    c._openCardSearch();
    c._renderCardSearch('表格');
    const items = c._cardSearchEl.querySelectorAll('.tw-card-search-item');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('.tw-card-search-level').textContent).toBeTruthy();
    expect(items[0].querySelector('.tw-card-search-text').textContent).toContain('表格');
  });

  test('无匹配显示空态；键盘上下移动高亮', () => {
    const c = fakeCtrl(NOTES);
    c._openCardSearch();
    c._renderCardSearch('不存在');
    expect(c._cardSearchEl.querySelector('.tw-card-search-empty')).not.toBeNull();

    c._renderCardSearch('表格');
    c._moveCardSearchActive(1);
    const items = c._cardSearchEl.querySelectorAll('.tw-card-search-item');
    expect(items[1].classList.contains('is-active')).toBe(true);
    expect(items[0].classList.contains('is-active')).toBe(false);
  });

  test('跳转：带进视野 + 命中高亮；关闭浮层', () => {
    const c = fakeCtrl(NOTES);
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'b';
    c._mountedCards.set('b', card);
    c._openCardSearch();
    expect(c._jumpToNote('b')).toBe(true);
    expect(c._ensureCardVisible).toHaveBeenCalledWith('b');
    expect(card.classList.contains('is-search-hit')).toBe(true);
    expect(c._cardSearchEl.hidden).toBe(true);
  });

  test('跳转到不存在的卡：不动作', () => {
    const c = fakeCtrl(NOTES);
    expect(c._jumpToNote('zzz')).toBe(false);
  });

  // 真实缺陷：浮层挂在 shadow root 里，事件冒到 document 时 e.target 被重定向成 host，
  // 用 contains(target) 判断「点在浮层内」恒为 false —— 点输入框也会被当成点外面，立刻关掉。
  test('Shadow DOM 里点浮层内部不关闭；点外部才关闭', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const root = document.createElement('div');
    shadow.appendChild(root);
    const c = {
      _el: root,
      _canvas: document.createElement('div'),
      _notes: NOTES,
      _mountedCards: new Map(),
      _ensureCardVisible: jest.fn(),
    };
    ['_ensureCardSearch', '_openCardSearch', '_closeCardSearch', '_renderCardSearch', '_positionCardSearch']
      .forEach((m) => { c[m] = (...args) => TypewriterFeature[m].call(c, ...args); });

    c._openCardSearch();
    const box = c._cardSearchEl;
    expect(box.hidden).toBe(false);

    // 从输入框派发：composition 让事件穿过 shadow 边界到达 document
    const input = box.querySelector('.tw-card-search-input');
    input.dispatchEvent(new window.Event('pointerdown', { bubbles: true, composed: true }));
    expect(box.hidden).toBe(false);          // 不能被误判成外部点击

    // 点真正的外部才关
    document.body.dispatchEvent(new window.Event('pointerdown', { bubbles: true, composed: true }));
    expect(box.hidden).toBe(true);
  });
});
