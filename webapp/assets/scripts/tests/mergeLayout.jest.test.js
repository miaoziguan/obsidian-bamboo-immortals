/**
 * @jest-environment jsdom
 */
// 合并卡片布局回归：v3.22.2
// 根因：write 模式下 _mergeSelected 无条件调用 PersistenceCoordinator.reflowWriteOrder，
//   该函数从原点(0,0)全量重铺整列并重置视口，表现为「跳回顺流重排」；
//   且分幕(acts)档在合并后同级标题数 <2 时（splitActs 只数卡片 level）会由 useActs 回退顺流。
// 修复：write 模式合并后保留当前布局（仅刷新徽标/剔除/几何/落盘），不再全量重排。
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

// 把模块内 import 的 PersistenceCoordinator / ViewportCuller 指向可观测的桩
// （strip import 后它们是自由变量 → 解析到 globalThis）。
const reflowSpy = jest.fn();
const removeGeomSpy = jest.fn();
const syncLayoutGeoSpy = jest.fn();
const updateCullingSpy = jest.fn();
global.PersistenceCoordinator = { reflowWriteOrder: reflowSpy };
global.ViewportCuller = {
  removeGeom: removeGeomSpy,
  syncLayoutGeo: syncLayoutGeoSpy,
  updateCulling: updateCullingSpy,
};

const { TypewriterFeature: feature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature']);

function makeCardEl(id) {
  const el = document.createElement('div');
  el.dataset.id = id;
  const t = document.createElement('div');
  t.className = 'tw-card-text';
  el.appendChild(t);
  el.style.left = '0px';
  el.style.top = '0px';
  return el;
}

// 三张卡：两张 H2（分幕有效）+ 一张正文；选中前两张合并将消耗一张 H2 → 合并后只剩 1 个 H2。
// 这正是「分幕 → 顺流」回退的触发条件：修复前 reflowWriteOrder 会因 useActs 失败而回退顺流。
function setupWrite() {
  const canvas = document.createElement('div');
  document.body.appendChild(canvas);
  feature._canvas = canvas;
  feature._state = {};
  feature._mode = 'write';
  feature._layoutMode = 'acts';            // 当前在分幕档
  feature._geo = new Map();
  feature._notes = [
    { id: 'a', text: '## 第一章', seq: 0, level: 'h2', x: 100, y: 50 },
    { id: 'b', text: '## 第二章', seq: 1, level: 'h2', x: 100, y: 300 },
    { id: 'c', text: '正文', seq: 2, level: 'p', x: 400, y: 50 },
  ];
  feature._links = [];
  const elA = makeCardEl('a');
  const elB = makeCardEl('b');
  feature._mountedCards = new Map([['a', elA], ['b', elB], ['c', makeCardEl('c')]]);
  feature._selected = new Set([elA, elB]);

  // 桩掉会触碰真实渲染/外部服务的实例方法
  feature._undoStack = { push: () => {} };
  feature._disposeCard = () => {};
  feature._measureCard = () => {};
  feature._refreshWriteOrder = jest.fn();
  feature._scheduleSave = jest.fn();
  feature._scheduleRenderLinks = jest.fn();
  feature._showScreenMsg = jest.fn();
  feature._updateSelBar = jest.fn();
  feature._orderCards = () => feature._notes.map((n) => ({ id: n.id, el: feature._mountedCards.get(n.id) }));
  feature._noteIndex = () => new Map(feature._notes.map((n) => [n.id, n]));
  return { elA, elB };
}

test('write 模式合并后不再调用全量 reflowWriteOrder（否则跳回顺流重排）', () => {
  setupWrite();
  feature._mergeSelected();
  expect(reflowSpy).not.toHaveBeenCalled();
});

test('write 模式合并后保留分幕(acts)档位，并刷新徽标/几何/落盘', () => {
  setupWrite();
  feature._mergeSelected();
  expect(feature._layoutMode).toBe('acts');         // 关键：档位未被回退成顺流
  expect(feature._refreshWriteOrder).toHaveBeenCalled();
  expect(syncLayoutGeoSpy).toHaveBeenCalled();
  expect(feature._scheduleSave).toHaveBeenCalled();
  expect(updateCullingSpy).toHaveBeenCalled();
});

test('write 模式合并后锚卡位置保持不变（不重铺、不跳视口）', () => {
  setupWrite();
  feature._mountedCards.get('a').style.left = '123px';
  feature._mountedCards.get('a').style.top = '456px';
  feature._mergeSelected();
  expect(feature._mountedCards.get('a').style.left).toBe('123px');
  expect(feature._mountedCards.get('a').style.top).toBe('456px');
});

test('合并后数据收敛：被并卡移除、连线端点改写至锚', () => {
  setupWrite();
  feature._links = [{ from: 'a', to: 'c' }, { from: 'b', to: 'c' }];
  feature._mergeSelected();
  const ids = feature._notes.map((n) => n.id);
  expect(ids).toContain('a');
  expect(ids).not.toContain('b');
  expect(ids).toContain('c');
  const sigs = feature._links.map((l) => l.from + '>' + l.to);
  expect(sigs).toContain('a>c');                     // 原 b→c 改写为 a→c（去重）
});

test('回归：_mergeSelected 的 write 分支不得再含 PersistenceCoordinator.reflowWriteOrder', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'handlers', 'features', 'typewriterFeature.js'), 'utf8'
  );
  const start = src.indexOf('_mergeSelected() {');
  const end = src.indexOf('_deleteSelected', start);
  const body = src.slice(start, end);
  expect(body).not.toContain('PersistenceCoordinator.reflowWriteOrder');
  expect(body).toContain('_refreshWriteOrder()');
  expect(body).toContain('_updateCulling()');
});
