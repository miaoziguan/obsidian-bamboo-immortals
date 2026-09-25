/**
 * @jest-environment jsdom
 */
// 回归锁：④ 子模式持久化 + 比例坐标迁移。
//  - getMode/setMode 往返；
//  - restore 把 v1 比例坐标按画布尺寸换算成绝对 px，并以 v2 落盘；
//  - restore 恢复上次档位（write/mindmap）时复用 setMode 完整切换；
//  - 热切档路径 _loadDoc 同样做 v1→px 换算（用户最初报“切换内容一样/飞出视野”的根因路径）。
const { loadModule } = require('./__helpers__/testUtils');
global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
loadModule('handlers/features/twConfig.js', []);
const { TypewriterStore } = loadModule('services/TypewriterStore.js', ['TypewriterStore']);
const { PersistenceCoordinator } = loadModule('handlers/features/PersistenceCoordinator.js', ['PersistenceCoordinator']);

let settings, files;
function mockStorage() {
  settings = {};
  files = {};
  global.window = global.window || {};
  global.window.storageManager = {
    getSetting: async (k) => (k in settings ? settings[k] : null),
    putSetting: async (k, v) => { settings[k] = v; },
    getTypewriterNotesDoc: async (id) => files[id] || null,
    putTypewriterNotesDoc: async (id, doc) => { files[id] = doc; },
  };
}
function fakeCtrl() {
  return {
    _mode: 'notes', _restored: false, _switchedTo: null, _notes: null, _saved: 0,
    _canvas: { getBoundingClientRect: () => ({ width: 1000, height: 800 }), querySelectorAll: () => [] },
    _timers: [],
    _seedSpatial() {}, _applyCanvasTransform() {}, _renderLinks() {}, _ensureNotesVisible() {},
    _clearSelection() {}, _scheduleSave() { this._saved++; },
    _buildCards(notes) { this._builtNotes = notes; },
    setMode(ctx, m) { this._mode = m; this._switchedTo = m; return Promise.resolve(); },
  };
}

test('getMode/setMode 往返', async () => {
  mockStorage();
  await TypewriterStore.setMode('write');
  expect(await TypewriterStore.getMode()).toBe('write');
  await TypewriterStore.setMode('mindmap');
  expect(await TypewriterStore.getMode()).toBe('mindmap');
  await TypewriterStore.setMode('notes');
  expect(await TypewriterStore.getMode()).toBe('notes');
});

test('restore：v1 比例坐标按画布尺寸换算成绝对 px 并以 v2 落盘', async () => {
  mockStorage();
  settings['typewriter:notes-index'] = { version: 1, current: 'default', groups: { default: { id: 'default', title: 'A', updatedAt: 1 } } };
  files.default = { version: 1, notes: [{ id: 'n1', text: 'a', x: 0.5, y: 0.25 }], links: [], canvasOffset: { x: 0, y: 0, scale: 1 } };
  const ctrl = fakeCtrl();
  await PersistenceCoordinator.restore({ state: {}, ctrl });
  expect(ctrl._notes[0].x).toBe(500);  // 0.5 * 1000
  expect(ctrl._notes[0].y).toBe(200);  // 0.25 * 800
  expect(ctrl._saved).toBeGreaterThanOrEqual(1);  // v1→v2 迁移落盘
});

test('restore：恢复上次档位（write）触发 setMode', async () => {
  mockStorage();
  settings['typewriter:mode'] = 'write';
  settings['typewriter:notes-index'] = { version: 1, current: 'default', groups: { default: { id: 'default', title: 'A', updatedAt: 1 } } };
  files.default = { version: 2, notes: [{ id: 'n1', text: 'a', x: 10, y: 20 }], links: [], canvasOffset: { x: 0, y: 0, scale: 1 } };
  const ctrl = fakeCtrl();
  await PersistenceCoordinator.restore({ state: {}, ctrl });
  expect(ctrl._switchedTo).toBe('write');
  expect(ctrl._mode).toBe('write');
});

test('loadDoc：热切档路径同样做 v1 比例换算', async () => {
  mockStorage();
  files.default = { version: 1, notes: [{ id: 'n1', text: 'a', x: 0.5, y: 0.25 }], links: [], canvasOffset: { x: 0, y: 0, scale: 1 } };
  const ctrl = fakeCtrl();
  await PersistenceCoordinator.loadDoc({ state: {}, ctrl }, 'notes');
  expect(ctrl._notes[0].x).toBe(500);
  expect(ctrl._notes[0].y).toBe(200);
});
