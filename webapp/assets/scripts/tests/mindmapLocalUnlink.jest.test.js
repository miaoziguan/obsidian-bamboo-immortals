/**
 * @jest-environment jsdom
 */
/**
 * 思维子弹：多选工具条「断开局部连线」回归锁（2026-11-15 用户需求）。
 *
 * 产品边界（用户拍板）：框选一组节点后，**只删两端都在选区内的连线**；
 * 连向选区外节点的线一律保留 —— 批量动作绝不能悄悄改动用户没选中的部分。
 * 只删线、不删节点、不重排、不补线，一次操作一步撤销。
 *
 * 与「一键连成链 / 一键清空全图」的区别：那是全图级且会覆盖手工连线，
 * 已确认不适合自由图并从代码里回退；本功能作用域严格限定在选区内部。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const { MindmapDoc } = loadModule('handlers/features/mindmapDoc.js', ['MindmapDoc']);
global.MindmapDoc = MindmapDoc;
const { MindmapFeature } = loadModule('handlers/features/mindmapFeature.js', ['MindmapFeature']);

const MM_JS = fs.readFileSync(
  path.join(__dirname, '../handlers/features/mindmapFeature.js'), 'utf8'
);
const L = (from, to) => ({ from, to, route: 'straight', bend: 0, dash: 'solid' });

function makeMM(links, ids) {
  return {
    _links: links,
    _selId: null,
    _selSet: new Set(ids),
    _undoStack: { push: jest.fn() },
    _linkLayer: { render: jest.fn() },
    _scheduleSave: jest.fn(),
    _msg: jest.fn(),
    _spatialDirty: false,
    _mutate: MindmapFeature._mutate,
    getSelectedIds: MindmapFeature.getSelectedIds,
    _unlinkSelected: MindmapFeature._unlinkSelected,
  };
}

describe('MindmapDoc.unlinkWithin：只删选区内部的线', () => {
  const links = [L('a', 'b'), L('b', 'c'), L('a', 'x'), L('x', 'y')];

  test('两端都在选区 → 删；跨边界 / 外部 → 全部保留', () => {
    expect(MindmapDoc.unlinkWithin(links, ['a', 'b', 'c'])).toEqual([L('a', 'x'), L('x', 'y')]);
  });

  test('连线无方向：from/to 颠倒也算内部', () => {
    expect(MindmapDoc.unlinkWithin([L('x', 'a')], ['a', 'x'])).toEqual([]);
  });

  test('传入 Set 亦可；空 ids 一条都不删', () => {
    expect(MindmapDoc.unlinkWithin(links, new Set(['a', 'b']))).toEqual([L('b', 'c'), L('a', 'x'), L('x', 'y')]);
    expect(MindmapDoc.unlinkWithin(links, [])).toEqual(links);
  });

  test('防御：非数组 links / 非数组 ids 不抛错', () => {
    expect(MindmapDoc.unlinkWithin(null, ['a'])).toEqual([]);
    expect(MindmapDoc.unlinkWithin(links, null)).toEqual(links);
  });

  test('纯函数：不修改输入数组', () => {
    const before = JSON.stringify(links);
    MindmapDoc.unlinkWithin(links, ['a', 'b', 'c']);
    expect(JSON.stringify(links)).toBe(before);
  });
});

describe('MindmapFeature._unlinkSelected：批量断链的收口', () => {
  test('混合连线：删 2 条内部、保留跨边界与外部；一步撤销 / 重画 / 落盘 / 提示', () => {
    const mm = makeMM([L('a', 'b'), L('b', 'c'), L('a', 'x'), L('x', 'y')], ['a', 'b', 'c']);
    expect(mm._unlinkSelected()).toBe(2);
    expect(mm._links).toEqual([L('a', 'x'), L('x', 'y')]);   // ← 核心不变量
    expect(mm._undoStack.push).toHaveBeenCalledTimes(1);
    expect(mm._linkLayer.render).toHaveBeenCalledTimes(1);
    expect(mm._scheduleSave).toHaveBeenCalledTimes(1);
    expect(mm._msg).toHaveBeenCalledWith('已断开 2 条内部连线（连向选区外的线保留）');
  });

  test('选区内部没有连线 → 只提示，不留撤销点、不改模型', () => {
    const links = [L('a', 'x'), L('x', 'y')];
    const mm = makeMM(links, ['a', 'b', 'c']);
    expect(mm._unlinkSelected()).toBe(0);
    expect(mm._links).toBe(links);
    expect(mm._undoStack.push).not.toHaveBeenCalled();
    expect(mm._msg).toHaveBeenCalledWith('选中节点之间没有连线');
  });

  test('选中不足 2 颗 → 提示且不操作', () => {
    const mm = makeMM([L('a', 'b')], ['a']);
    expect(mm._unlinkSelected()).toBe(0);
    expect(mm._links).toEqual([L('a', 'b')]);
    expect(mm._msg).toHaveBeenCalledWith('至少选中 2 颗才能断开内部连线');
  });
});

describe('多选工具条入口', () => {
  test('新增 unlink 按钮、点击分发、初始隐藏、卸载清引用', () => {
    expect(MM_JS).toMatch(/act: 'unlink'/);
    expect(MM_JS).toMatch(/else if \(act === 'unlink'\) this\._unlinkSelected\(\)/);
    expect(MM_JS).toMatch(/this\._tbUnlinkBtn\.hidden = true/);
    expect(MM_JS).toMatch(/this\._tbUnlinkBtn = null/);
  });

  test('真实 DOM：点击 unlink 按钮触发 _unlinkSelected', () => {
    const layer = document.createElement('div');
    document.body.appendChild(layer);
    const mm = {
      MM_COLORS: ['', '#f00', '#0f0', '#00f', '#ff0', '#0ff'],
      _tbNoteBtn: null, _tbUnlinkBtn: null, _tbSize: null,
      _initToolbar: MindmapFeature._initToolbar,
      _unlinkSelected: jest.fn(),
      _duplicateSel: jest.fn(), _deleteSel: jest.fn(),
      _openNoteEditor: jest.fn(), _setColorForSelection: jest.fn(),
    };
    mm._initToolbar(layer);
    const btn = layer.querySelector('button[data-act="unlink"]');
    expect(btn).toBeTruthy();
    expect(btn.hidden).toBe(true);
    btn.click();
    expect(mm._unlinkSelected).toHaveBeenCalledTimes(1);
    layer.remove();
  });

  test('_updateToolbar：单选隐藏、多选 ≥2 显示，并重新量一次宽度', () => {
    const tb = document.createElement('div');
    let measured = 0;
    Object.defineProperty(tb, 'offsetHeight', { get() { measured += 1; return 40; } });
    Object.defineProperty(tb, 'offsetWidth', { get() { measured += 1; return 180; } });
    const noteBtn = document.createElement('button');
    const unlinkBtn = document.createElement('button');
    unlinkBtn.hidden = true;
    const el = document.createElement('div');
    el.getBoundingClientRect = () => ({ left: 10, top: 20, right: 60, bottom: 50, width: 50, height: 30 });
    const mm = {
      _toolbar: tb, _tbNoteBtn: noteBtn, _tbUnlinkBtn: unlinkBtn,
      _tbSize: { h: 34, hw: 60 },
      _editId: null, _selId: 'a', _selSet: new Set(),
      _els: new Map([['a', el]]),
      _el: { getBoundingClientRect: () => ({ left: 0, top: 0 }), clientWidth: 800 },
      _nodeById: () => null,
      getSelectedIds: MindmapFeature.getSelectedIds,
      _updateToolbar: MindmapFeature._updateToolbar,
    };
    mm._updateToolbar();                     // 单选：保持隐藏，且沿用缓存尺寸（不重测）
    expect(unlinkBtn.hidden).toBe(true);
    expect(measured).toBe(0);
    mm._selId = null;
    mm._selSet = new Set(['a', 'b']);
    mm._els.set('b', el);
    mm._updateToolbar();                     // 多选：显示，且因显隐切换作废宽度缓存 → 重新量一次
    expect(unlinkBtn.hidden).toBe(false);
    expect(measured).toBeGreaterThan(0);
    expect(mm._tbSize).toEqual({ h: 40, hw: 90 });
  });
});
