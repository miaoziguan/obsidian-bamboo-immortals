/**
 * @jest-environment jsdom
 */
// 写作档「一键连线 / 一键删线 / 选中连线 / 选中删线」回归锁。
//
// 最要紧的一条不变量：连线是文章顺序的输入之一，WritingDoc.orderIds 在**无连线**时会
// 退化为按坐标 (y,x) 排序。分幕多列布局下坐标顺序 ≠ 文章顺序，所以「一键清空连线」若
// 走了 reseqByLinks，整篇文章会悄悄重排。这里用故意与 seq 不一致的坐标钉死它。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
loadModule('handlers/features/modePolicy.js', []);

global.CanvasViewport = { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 };
const { CanvasZoomUI } = loadModule('services/CanvasZoomUI.js', ['CanvasZoomUI']);
const { TypewriterFeature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
  FONTS: ['modern'], PAPERS: ['plain'], MARKET_FONTS: [],
  Toast: { showToast: jest.fn() },
  ViewportCuller: { setGeom: jest.fn(), removeGeom: jest.fn() },
  CanvasViewport: { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 },
  MindmapFeature: { teardown: jest.fn() },
  TypewriterStore: { invalidateWritingIndex: jest.fn() },
  MaterialMarket: { toggle: jest.fn() },
});

const L = (from, to) => ({ from, to, route: 'bezier', bend: 0, dash: 'solid' });

describe('档位归属与样式契约', () => {
  const fs = require('fs');
  const path = require('path');
  const MODE_CTRL = fs.readFileSync(path.join(__dirname, '../handlers/features/ModeController.js'), 'utf8');
  const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

  test('缩放条的连线 toggle 键只在写作档露出', () => {
    expect(MODE_CTRL).toMatch(/linkToggleBtn\.hidden = P\.id !== 'write'/);
  });

  test('hidden 规则、图标状态切换与暗色态齐全', () => {
    expect(NOTES_CSS).toContain('.tw-zoom-bar .tw-zoom-link-toggle[hidden]');
    expect(NOTES_CSS).toContain('.tw-zoom-link-toggle .tw-zoom-icon-unlink');
    expect(NOTES_CSS).toContain('.tw-zoom-link-toggle.is-linked .tw-zoom-icon-link');
    expect(NOTES_CSS).toContain(':host(.dark) .tw-sel-link');
    expect(NOTES_CSS).toContain(':host(.dark) .tw-sel-link.is-unlink');
  });

  // 真实缺陷：裸 button 命中全局触控地板（48px），条被撑到约 60px，浮在选框上方遮住卡片标题。
  // 锁住「显式小尺寸 + 收紧内边距」，防止以后有人删掉这两行又鼓回去。
  test('多选条压过触控地板，保持紧凑高度', () => {
    const btn = (NOTES_CSS.match(/\.tw-sel-bar button \{([^}]*)\}/) || [])[1] || '';
    expect(btn).toMatch(/min-height:\s*26px/);
    expect(btn).toMatch(/min-width:\s*0/);
    expect(btn).not.toMatch(/min-touch-target/);
    const bar = (NOTES_CSS.match(/\.tw-sel-bar \{([^}]*)\}/) || [])[1] || '';
    expect(bar).toMatch(/padding:\s*var\(--space-3\) var\(--space-4\)/);
    expect(bar).toMatch(/gap:\s*var\(--space-2\)/);
  });
});

describe('WritingDoc 连线批量原语', () => {
  // 坐标刻意与 seq 不一致：d 在最上最左，按坐标排会跑到最前
  const notes = () => [
    { id: 'a', seq: 0, x: 500, y: 0 },
    { id: 'b', seq: 1, x: 0, y: 100 },
    { id: 'c', seq: 2, x: 500, y: 100 },
    { id: 'd', seq: 3, x: 0, y: 0 },
  ];

  test('idsBySeq 按 seq，不受坐标影响', () => {
    expect(WritingDoc.idsBySeq(notes())).toEqual(['a', 'b', 'c', 'd']);
  });

  test('chainLinks 按文章顺序连成一条链', () => {
    expect(WritingDoc.chainLinks(notes())).toEqual([L('a', 'b'), L('b', 'c'), L('c', 'd')]);
  });

  test('linkSelection 只增不删、按 seq 连、集合外的线原样保留', () => {
    const base = [L('c', 'd')];
    const out = WritingDoc.linkSelection(notes(), base, ['d', 'b']);
    expect(out[0]).toEqual(L('c', 'd'));
    expect(out).toContainEqual(L('b', 'd'));
    expect(out.length).toBe(2);
  });

  test('linkSelection 双向去重：已有反向线不再补', () => {
    const out = WritingDoc.linkSelection(notes(), [L('b', 'a')], ['a', 'b']);
    expect(out.length).toBe(1);
  });

  test('unlinkSelection 只删两端都在集合内的线', () => {
    const links = [L('a', 'b'), L('b', 'c'), L('c', 'd')];
    expect(WritingDoc.unlinkSelection(links, ['b', 'c'])).toEqual([L('a', 'b'), L('c', 'd')]);
  });
});

function linkCtrl(mode = 'write', links = []) {
  const c = {
    _mode: mode,
    _notes: [
      { id: 'a', seq: 0, x: 500, y: 0 },
      { id: 'b', seq: 1, x: 0, y: 100 },
      { id: 'c', seq: 2, x: 500, y: 100 },
      { id: 'd', seq: 3, x: 0, y: 0 },
    ],
    _links: links,
    _undoStack: { push: jest.fn() },
    _scheduleRenderLinks: jest.fn(),
    _refreshWriteOrder: jest.fn(),
    _scheduleSave: jest.fn(),
    _showScreenMsg: jest.fn(),
    _selected: new Set(),
  };
  // 动作方法通过 this 调用同伴方法：单独 .call(fake) 时把它们绑回去
  c._commitLinks = (next, msg) => TypewriterFeature._commitLinks.call(c, next, msg);
  c._selectedIds = () => TypewriterFeature._selectedIds.call(c);
  c._linkAll = () => TypewriterFeature._linkAll.call(c);
  c._unlinkAll = () => TypewriterFeature._unlinkAll.call(c);
  c._linkSelected = () => TypewriterFeature._linkSelected.call(c);
  c._unlinkSelected = () => TypewriterFeature._unlinkSelected.call(c);
  c._isFullyChained = () => TypewriterFeature._isFullyChained.call(c);
  return c;
}

describe('批量连线动作：文章顺序不变', () => {
  test('一键连线：按 seq 连成链，撤销/落盘/重绘各一次', () => {
    const c = linkCtrl();
    expect(TypewriterFeature._linkAll.call(c)).toBe(3);
    expect(c._links).toEqual([L('a', 'b'), L('b', 'c'), L('c', 'd')]);
    expect(WritingDoc.idsBySeq(c._notes)).toEqual(['a', 'b', 'c', 'd']);
    expect(c._undoStack.push).toHaveBeenCalledTimes(1);
    expect(c._scheduleRenderLinks).toHaveBeenCalledTimes(1);
    expect(c._scheduleSave).toHaveBeenCalledTimes(1);
  });

  test('一键连线幂等：已连好不再压撤销帧', () => {
    const c = linkCtrl('write', [L('a', 'b'), L('b', 'c'), L('c', 'd')]);
    expect(TypewriterFeature._linkAll.call(c)).toBe(0);
    expect(c._undoStack.push).not.toHaveBeenCalled();
  });

  test('一键删线：清空连线后 seq 仍按原文章顺序（防坐标退化重排）', () => {
    const c = linkCtrl('write', [L('a', 'b'), L('b', 'c'), L('c', 'd')]);
    expect(TypewriterFeature._unlinkAll.call(c)).toBe(3);
    expect(c._links).toEqual([]);
    expect(WritingDoc.idsBySeq(c._notes)).toEqual(['a', 'b', 'c', 'd']);
    expect(c._undoStack.push).toHaveBeenCalledTimes(1);
  });

  test('无连线时一键删线提示且不压撤销帧', () => {
    const c = linkCtrl();
    expect(TypewriterFeature._unlinkAll.call(c)).toBe(0);
    expect(c._undoStack.push).not.toHaveBeenCalled();
  });

  test('选中连线 / 断开：只作用于选中集，顺序保持不变', () => {
    const c = linkCtrl('write', [L('a', 'b')]);
    c._selected = new Set(['b', 'c', 'd'].map((id) => {
      const el = document.createElement('div');
      el.dataset.id = id;
      return el;
    }));
    // 已有 a→b，选中 b/c/d 只需补 b→c、c→d 两条
    expect(TypewriterFeature._linkSelected.call(c)).toBe(2);
    expect(c._links).toEqual([L('a', 'b'), L('b', 'c'), L('c', 'd')]);
    expect(WritingDoc.idsBySeq(c._notes)).toEqual(['a', 'b', 'c', 'd']);
    const before = c._links.length;
    expect(TypewriterFeature._unlinkSelected.call(c)).toBe(2);
    expect(c._links.length).toBeLessThan(before);
    expect(c._links).toContainEqual(L('a', 'b'));   // 跨集合边界的线保留
    expect(WritingDoc.idsBySeq(c._notes)).toEqual(['a', 'b', 'c', 'd']);
  });

  test('多选条 toggle：已成链则断开、未成链则补齐，并刷新浮动条', () => {
    const c = linkCtrl('write', [L('a', 'b'), L('b', 'c')]);
    c._updateSelBar = jest.fn();
    c._selected = new Set(['a', 'b', 'c'].map((id) => {
      const el = document.createElement('div');
      el.dataset.id = id;
      return el;
    }));
    expect(TypewriterFeature._linkToggleSelected.call(c)).toBe(2);   // 全链 → 断开
    expect(c._links).toEqual([]);
    expect(c._updateSelBar).toHaveBeenCalled();
    expect(TypewriterFeature._linkToggleSelected.call(c)).toBe(2);   // 无连线 → 补齐
    expect(c._links).toEqual([L('a', 'b'), L('b', 'c')]);
  });

  test('部分连线时 toggle 是「补齐」而不是「清空」（避免误删用户手动的线）', () => {
    const c = linkCtrl('write', [L('a', 'b')]);
    c._zoomUI = { sync: jest.fn() };
    expect(c._isFullyChained()).toBe(false);
    expect(TypewriterFeature._linkToggle.call(c)).toBe(3);   // 补齐为完整链
    expect(c._links).toEqual([L('a', 'b'), L('b', 'c'), L('c', 'd')]);
    expect(c._isFullyChained()).toBe(true);
    expect(c._undoStack.push).toHaveBeenCalledTimes(1);
  });

  test('缩放条 toggle：无连线时成链、已成完整链时清空，并主动刷新按钮状态', () => {
    const c = linkCtrl();
    c._zoomUI = { sync: jest.fn() };
    expect(TypewriterFeature._linkToggle.call(c)).toBe(3);
    expect(c._links.length).toBe(3);
    expect(c._zoomUI.sync).toHaveBeenCalled();
    expect(TypewriterFeature._linkToggle.call(c)).toBe(3);
    expect(c._links).toEqual([]);
    expect(WritingDoc.idsBySeq(c._notes)).toEqual(['a', 'b', 'c', 'd']);
  });

  test('非写作档一律不动模型、不进撤销栈', () => {
    const c = linkCtrl('notes', [L('a', 'b')]);
    c._zoomUI = { sync: jest.fn() };
    ['_linkAll', '_unlinkAll', '_linkSelected', '_unlinkSelected', '_linkToggle'].forEach((m) => {
      expect(TypewriterFeature[m].call(c)).toBe(0);
    });
    expect(c._links).toEqual([L('a', 'b')]);
    expect(c._undoStack.push).not.toHaveBeenCalled();
  });
});

describe('入口一：缩放条的一键连线键', () => {
  const mkAdapter = (extra) => Object.assign({
    getCanvas: () => null,
    getView: () => ({ x: 0, y: 0, scale: 1 }),
    setView: () => {}, zoomAtCenter: () => {}, reset: () => {}, fit: () => {},
  }, extra);

  test('一个 toggle 键：未成链→点完成链、已成链→点完清空，图标与提示同步翻转', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    let linked = false;
    const onLinkToggle = jest.fn(() => { linked = !linked; });
    const ui = CanvasZoomUI.mount(host, mkAdapter({ onLinkToggle, isLinked: () => linked }));
    expect(ui).toBeTruthy();
    const btn = host.querySelector('[data-act="link-toggle"]');
    expect(btn).not.toBeNull();
    expect(host.querySelectorAll('[data-act^="link-"]').length).toBe(1);   // 只有一个键
    expect(btn.getAttribute('aria-label')).toBe('一键连线');
    expect(btn.classList.contains('is-linked')).toBe(false);

    btn.click();
    expect(onLinkToggle).toHaveBeenCalledTimes(1);
    expect(btn.classList.contains('is-linked')).toBe(true);
    expect(btn.getAttribute('aria-label')).toBe('一键删除连线');

    btn.click();
    expect(btn.classList.contains('is-linked')).toBe(false);
    expect(btn.getAttribute('aria-label')).toBe('一键连线');
  });

  test('未传回调的档位（导图）不生成连线键', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    CanvasZoomUI.mount(host, mkAdapter());
    expect(host.querySelector('[data-act="link-toggle"]')).toBeNull();
  });
});

describe('入口二：多选浮动条的按需连线键', () => {
  function selCtrl(mode, links, ids) {
    const canvas = document.createElement('div');
    document.body.appendChild(canvas);
    const c = {
      _canvas: canvas,
      _mode: mode,
      _links: links,
      _notes: [
        { id: 'a', seq: 0 },
        { id: 'b', seq: 1 },
        { id: 'c', seq: 2 },
      ],
      _materialMarket: null,
      _selected: new Set(ids.map((id) => {
        const el = document.createElement('div');
        el.dataset.id = id;
        return el;
      })),
      _mergeSelected: jest.fn(),
      _deleteSelected: jest.fn(),
      _linkSelected: jest.fn(),
      _unlinkSelected: jest.fn(),
      _linkToggleSelected: jest.fn(),
      _attachSelected: jest.fn(),
      _detachSelected: jest.fn(),
      _scheduleSelBarTick: jest.fn(),
      _cancelSelBarTick: jest.fn(),
      _selBarGestureOn: jest.fn(),
      _selBarGestureOff: jest.fn(),
    };
    c._ensureSelBar = () => TypewriterFeature._ensureSelBar.call(c);
    TypewriterFeature._updateSelBar.call(c);
    return c;
  }

  test('只有一个键：未成链显示「连线 N 张」，点击走 toggle', () => {
    const c = selCtrl('write', [], ['a', 'b']);
    const bar = c._canvas.querySelector('.tw-sel-bar');
    const btn = bar.querySelector('.tw-sel-link');
    expect(bar.querySelectorAll('.tw-sel-unlink').length).toBe(0);   // 旧的两键之一已移除
    expect(btn.style.display).toBe('');
    expect(btn.textContent).toBe('连线 2 张');
    expect(btn.classList.contains('is-unlink')).toBe(false);
    btn.click();
    expect(c._linkToggleSelected).toHaveBeenCalledTimes(1);
  });

  test('已成为完整链：同一个键显示「断开 N 条」并进入 is-unlink 态', () => {
    const c = selCtrl('write', [L('a', 'b'), L('b', 'c')], ['a', 'b', 'c']);
    const btn = c._canvas.querySelector('.tw-sel-link');
    expect(btn.textContent).toBe('断开 2 条');
    expect(btn.classList.contains('is-unlink')).toBe(true);
  });

  test('部分连线仍显示「连线」态（补齐，而不是一键清空）', () => {
    const c = selCtrl('write', [L('a', 'b')], ['a', 'b', 'c']);
    const btn = c._canvas.querySelector('.tw-sel-link');
    expect(btn.textContent).toBe('连线 3 张');
    expect(btn.classList.contains('is-unlink')).toBe(false);
  });

  test('便签档不给连线入口（连线不定义该档文章顺序）', () => {
    const c = selCtrl('notes', [L('a', 'b')], ['a', 'b']);
    expect(c._canvas.querySelector('.tw-sel-link').style.display).toBe('none');
  });

  test('不足 2 张：键隐藏', () => {
    const c = selCtrl('write', [], ['a']);
    expect(c._canvas.querySelector('.tw-sel-link').style.display).toBe('none');
  });
});
