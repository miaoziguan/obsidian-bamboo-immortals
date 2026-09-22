/**
 * @jest-environment jsdom
 */
// 按段落拆卡回归锁：WritingDoc.splitNote 的纯数据契约 + 写作档 _splitCard 端到端。
// 设计要点（方案 A：物理拆卡 + 手动触发 + 标题独占一张卡）：
//   · 以空行切分 text，首段留在原卡（保留其 level），其余段各成一张 level:'p' 新卡、紧随其后；
//   · seq 由 setOrder 重写为唯一且连续（红线不破）；
//   · 单段落卡（无空行可拆）原样返回，调用方据此不进撤销栈。
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };

const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
const { SpatialIndex } = loadModule('services/SpatialIndex.js', ['SpatialIndex']);
const { GeoCache } = loadModule('services/GeoCache.js', ['GeoCache']);
global.SpatialIndex = SpatialIndex;
global.GeoCache = GeoCache;
const { ViewportCuller } = loadModule('services/ViewportCuller.js', ['ViewportCuller']);
global.ViewportCuller = ViewportCuller;
loadModule('handlers/features/twConfig.js', []);
const _b1mod = (p, n) => { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; };
_b1mod('handlers/features/CardViewManager.js', 'CardViewManager');
_b1mod('handlers/features/CardInteractions.js', 'CardInteractions');
_b1mod('handlers/features/ModeController.js', 'ModeController');
_b1mod('handlers/features/PersistenceCoordinator.js', 'PersistenceCoordinator');
_b1mod('services/TypewriterStore.js', 'TypewriterStore');
_b1mod('services/SpatialIndex.js', 'SpatialIndex');
_b1mod('services/GeoCache.js', 'GeoCache');
_b1mod('services/undoStack.js', 'UndoStack');
_b1mod('handlers/features/writingDoc.js', 'WritingDoc');
_b1mod('handlers/features/mindmapFeature.js', 'MindmapFeature');
_b1mod('services/LinkLayer.js', 'LinkLayer');
_b1mod('services/ViewportCuller.js', 'ViewportCuller');
_b1mod('utils/domRef.js', 'isFromTextEntry');

function splitFixture(notes, mode = 'write') {
  feature._canvas = document.createElement('div');
  Object.defineProperty(feature._canvas, 'clientWidth', { value: 400, configurable: true });
  Object.defineProperty(feature._canvas, 'clientHeight', { value: 800, configurable: true });
  feature._el = document.createElement('div');
  feature._notes = notes;
  feature._state = { notes };
  feature._links = [];
  feature._selected = new Set();
  feature._geo = new GeoCache();
  feature._mountedCards = new Map();
  notes.forEach((n) => {
    const el = document.createElement('div');
    el.dataset.id = n.id;
    feature._mountedCards.set(n.id, el);
  });
  feature._undoStack = { push: () => {} };
  feature._mode = mode;
  feature._layoutMode = 'flow';
  feature._syncLayoutGeo = () => {};
  feature._scheduleRenderLinks = () => {};
  feature._scheduleSave = () => {};
  feature._scheduleCull = () => {};
  feature._refreshWriteOrder = () => {};
  feature._setCanvasOffset = () => {};
  feature._showScreenMsg = () => {};
}

describe('WritingDoc.splitNote 纯数据契约', () => {
  test('一段卡按空行拆成三张：seq 连续、原卡留首段、新卡 level=p', () => {
    const notes = [{ id: 'a', seq: 0, level: 'p', text: '段一\n\n段二\n\n段三', x: 0, y: 0, font: 'classic', paper: 'plain', zoom: 1, fontScale: 1, rot: 0 }];
    const out = WritingDoc.splitNote(notes, 'a');
    expect(out.length).toBe(3);
    expect(out.map((n) => n.seq)).toEqual([0, 1, 2]);   // 唯一且连续
    expect(out[0].id).toBe('a');
    expect(out[0].text).toBe('段一');
    expect(out[0].level).toBe('p');
    expect(out[1].text).toBe('段二');
    expect(out[1].level).toBe('p');
    expect(out[2].text).toBe('段三');
  });

  test('原卡若是标题卡(h2)，拆后仍是标题卡，段卡并入其下（方案A：标题独占一张卡）', () => {
    const notes = [{ id: 'h', seq: 0, level: 'h2', text: '标题\n\n正文一\n\n正文二', x: 0, y: 0 }];
    const out = WritingDoc.splitNote(notes, 'h');
    expect(out.length).toBe(3);
    expect(out[0].id).toBe('h');
    expect(out[0].level).toBe('h2');                    // 标题卡保级
    expect(out[0].text).toBe('标题');
    expect(out[1].level).toBe('p');
    expect(out[2].level).toBe('p');
  });

  test('单段落卡（无空行）原样返回，不拆', () => {
    const notes = [{ id: 'a', seq: 0, level: 'p', text: '只有一段' }];
    expect(WritingDoc.splitNote(notes, 'a').length).toBe(1);
  });

  test('回归：仅用单个换行分段（打字机输入框回车即新段）也要拆开', () => {
    const notes = [{ id: 'a', seq: 0, level: 'p', text: '甲\n乙\n丙' }];
    const out = WritingDoc.splitNote(notes, 'a');
    expect(out.length).toBe(3);                        // 无空行也应按换行拆
    expect(out.map((n) => n.text)).toEqual(['甲', '乙', '丙']);
    expect(out.map((n) => n.seq)).toEqual([0, 1, 2]);
  });

  test('回归：CRLF(\\r\\n) 段落分隔同样识别', () => {
    const notes = [{ id: 'a', seq: 0, level: 'p', text: '甲\r\n\r\n乙' }];
    const out = WritingDoc.splitNote(notes, 'a');
    expect(out.length).toBe(2);
    expect(out[1].text).toBe('乙');
  });

  test('段内多行折叠为单一换行、首尾空白被裁掉', () => {
    const notes = [{ id: 'a', seq: 0, level: 'p', text: '  前导空格段  \n\n  第二段首行\n  第二段次行  ' }];
    const out = WritingDoc.splitNote(notes, 'a');
    expect(out.length).toBe(2);
    expect(out[0].text).toBe('前导空格段');
    expect(out[1].text).toBe('第二段首行\n第二段次行');
  });

  test('不存在的 id 原样返回', () => {
    const notes = [{ id: 'a', seq: 0, level: 'p', text: 'x\n\ny' }];
    expect(WritingDoc.splitNote(notes, 'zzz')).toBe(notes);
  });
});

describe('写作档 _splitCard 端到端', () => {
  test('多段落卡拆后 _notes 增长、seq 连续、新卡紧接原卡之后并显式挂载', () => {
    splitFixture([
      { id: 'x', seq: 0, level: 'p', text: '甲\n\n乙\n\n丙', x: 0, y: 0 },
      { id: 'y', seq: 1, level: 'p', text: '尾卡', x: 0, y: 100 },
    ]);
    const mounted = [];
    feature._mountCard = (n) => { mounted.push(n.id); };   // 写作档无剔除，新卡必须显式建 DOM
    feature._splitCard(feature._mountedCards.get('x'));
    expect(feature._notes.length).toBe(4);             // 原 2 → x 拆出 3 + y = 4
    expect(feature._notes.map((n) => n.seq)).toEqual([0, 1, 2, 3]);
    expect(feature._notes[0].text).toBe('甲');
    expect(feature._notes[1].text).toBe('乙');
    expect(feature._notes[2].text).toBe('丙');
    expect(feature._notes[3].id).toBe('y');
    expect(mounted).toEqual([feature._notes[1].id, feature._notes[2].id]);   // 两个新段都挂了 DOM
  });

  test('单段落卡不拆、不进撤销栈', () => {
    let pushed = 0;
    splitFixture([{ id: 's', seq: 0, level: 'p', text: '只有一段', x: 0, y: 0 }]);
    feature._undoStack = { push: () => { pushed += 1; } };
    feature._splitCard(feature._mountedCards.get('s'));
    expect(feature._notes.length).toBe(1);             // 未拆
    expect(pushed).toBe(0);                            // 未留档
  });

  test('拆卡时片段内联串接（段1→段2→段3→原文后续），原出边挪到末段、不在首段分叉', () => {
    splitFixture([
      { id: 'x', seq: 0, level: 'p', text: '甲\n\n乙\n\n丙', x: 0, y: 0 },   // x 连 A、被 B 连
      { id: 'y', seq: 1, level: 'p', text: '尾卡', x: 0, y: 100 },
    ]);
    feature._links = [
      { from: 'x', to: 'A' },          // x → A（原文后续，应内联串接到末段）
      { from: 'B', to: 'x' },          // B → x（进边，应留在首段）
      { from: 'y', to: 'z' },          // 与 x 无关，不动
    ];
    let rendered = 0;
    feature._scheduleRenderLinks = () => { rendered += 1; };
    feature._mountCard = () => {};
    feature._splitCard(feature._mountedCards.get('x'));
    const newIds = feature._notes.filter((n) => n.id !== 'x' && n.id !== 'y').map((n) => n.id);
    expect(newIds.length).toBe(2);     // 乙、丙 两张新段
    // 原 3 条 → x→A 被改为 末段→A（-1），再补 x→n1、n1→n2 两条链边（+2）= 5
    const has = (f, t) => feature._links.some((l) => l.from === f && l.to === t);
    expect(feature._links.length).toBe(5);
    expect(has('B', 'x')).toBe(true);                  // 进边保留在首段
    expect(has('y', 'z')).toBe(true);                 // 无关边不受影响
    expect(has('x', newIds[0])).toBe(true);           // 顺连：首段 → 新段1
    expect(has(newIds[0], newIds[1])).toBe(true);     // 顺连：新段1 → 新段2
    expect(has(newIds[1], 'A')).toBe(true);           // 内联串接：原出边 x→A 挪到末段
    expect(has('x', 'A')).toBe(false);                // 首段不再直连 A（改由末段连）
    expect(has('x', newIds[1])).toBe(false);          // 非星型：首段不叉出到末段
    expect(has(newIds[0], 'A')).toBe(false);          // 不向外部伙伴蔓延
    expect(has('B', newIds[0])).toBe(false);
    expect(rendered).toBeGreaterThanOrEqual(1);     // 触发了连线重绘
  });

  test('无既有连线时拆卡仍补顺连边、不向外蔓延', () => {
    splitFixture([{ id: 'x', seq: 0, level: 'p', text: '甲\n\n乙', x: 0, y: 0 }]);
    feature._links = [];
    feature._mountCard = () => {};
    feature._splitCard(feature._mountedCards.get('x'));
    // 无外部连线可继承，但顺连仍补一条「首段 → 新段」边（不报错、不丢）
    expect(feature._notes.length).toBe(2);             // 卡片正常拆（1 → 甲/乙 2 张）
    expect(feature._links.length).toBe(1);             // 1 条顺连边 x→新段
    expect(feature._links[0]).toEqual({ from: 'x', to: feature._notes[1].id });
  });
});

describe('WritingDoc.chainSplitChunks 内联串接契约', () => {
  test('片段顺序首尾相接（段1→段2→段3），原出边挪到末段、进边保留、不向外部蔓延', () => {
    const links = [
      { from: 'x', to: 'A', route: 'curve', bend: 0.3, dash: true },
      { from: 'B', to: 'x' },
    ];
    const out = WritingDoc.chainSplitChunks(links, 'x', ['n1', 'n2']);
    expect(out.length).toBe(4);     // 2 原(其一改接末段) + 顺连2
    const has = (f, t) => out.some((l) => l.from === f && l.to === t);
    expect(has('B', 'x')).toBe(true);                 // 进边保留在首段
    expect(has('x', 'n1')).toBe(true);                // 顺连：首段 → 新段1
    expect(has('n1', 'n2')).toBe(true);               // 顺连：新段1 → 新段2
    expect(has('n2', 'A')).toBe(true);                // 内联串接：原出边 x→A 挪到末段 n2
    expect(has('x', 'A')).toBe(false);                // 首段不再直连 A
    expect(has('x', 'n2')).toBe(false);               // 首段不叉出到末段
    expect(has('n1', 'A')).toBe(false);               // 不向外蔓延
    expect(has('B', 'n1')).toBe(false);
    // 出边属性被原样带到末段（线型/弯曲/虚实不丢）
    const moved = out.find((l) => l.from === 'n2' && l.to === 'A');
    expect(moved).toBeTruthy();
    expect(moved.route).toBe('curve');
    expect(moved.bend).toBe(0.3);
    expect(moved.dash).toBe(true);
  });

  test('内联串接核心：三段 + 原文后续 → 首段→n1→n2→后续（出边不在首段分叉）', () => {
    const links = [{ from: 'prev', to: 'x' }, { from: 'x', to: 'next' }];
    const out = WritingDoc.chainSplitChunks(links, 'x', ['n1', 'n2']);
    const has = (f, t) => out.some((l) => l.from === f && l.to === t);
    expect(has('prev', 'x')).toBe(true);   // 进边留在首段
    expect(has('x', 'n1')).toBe(true);
    expect(has('n1', 'n2')).toBe(true);
    expect(has('n2', 'next')).toBe(true);  // 出边挪到末段 → 线性串接
    expect(has('x', 'next')).toBe(false);  // 首段不再叉出
  });

  test('无既有连线时仍补顺连链边（x→n1→n2）', () => {
    const out = WritingDoc.chainSplitChunks([], 'x', ['n1', 'n2']);
    expect(out.length).toBe(2);
    expect(out[0]).toEqual({ from: 'x', to: 'n1' });
    expect(out[1]).toEqual({ from: 'n1', to: 'n2' });
  });

  test('相邻已连时去重，不产生重复边', () => {
    const links = [{ from: 'x', to: 'n1' }];
    const out = WritingDoc.chainSplitChunks(links, 'x', ['n1', 'n2']);
    expect(out.filter((l) => l.from === 'x' && l.to === 'n1').length).toBe(1);
    expect(out.filter((l) => l.from === 'n1' && l.to === 'n2').length).toBe(1);
    expect(out.length).toBe(2);     // 已有 x→n1 + 新加 n1→n2
  });

  test('无新段（未拆）时原样返回', () => {
    expect(WritingDoc.chainSplitChunks([{ from: 'x', to: 'A' }], 'x', [])).toEqual([{ from: 'x', to: 'A' }]);
  });
});
