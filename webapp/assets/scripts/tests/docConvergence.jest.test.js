/**
 * @jest-environment jsdom
 */
// 回归锁：⑥ 三档代码收敛。write 与 notes 卡片档经统一 _saveCardDoc/_loadCardDoc + 调度器
// saveDoc/loadDoc 走不同桥，互不串文件；mindmap 因数据模型不同单走 saveMindmap/loadMindmap。
const { loadModule } = require('./__helpers__/testUtils');
global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
loadModule('handlers/features/twConfig.js', []);
const { TypewriterStore } = loadModule('services/TypewriterStore.js', ['TypewriterStore']);
const { PersistenceCoordinator } = loadModule('handlers/features/PersistenceCoordinator.js', ['PersistenceCoordinator']);

let files, settings;
function mockStorage() {
  files = {}; settings = {};
  global.window = global.window || {};
  global.window.storageManager = {
    getSetting: async (k) => (k in settings ? settings[k] : null),
    putSetting: async (k, v) => { settings[k] = v; },
    getTypewriterWritingDoc: async (id) => files['w:' + id] || null,
    putTypewriterWritingDoc: async (id, doc) => { files['w:' + id] = doc; },
    getTypewriterNotesDoc: async (id) => files['note:' + id] || null,
    putTypewriterNotesDoc: async (id, doc) => { files['note:' + id] = doc; },
  };
}

test('saveDoc/loadDoc(write) 走写作桥且独立，不串便签文件', async () => {
  mockStorage();
  const notes = [{ id: 'a', text: 'hi', x: 10, y: 20 }];
  const links = [{ from: 'a', to: 'b' }];
  const off = { x: 5, y: 6, scale: 1 };
  await TypewriterStore.saveDoc('write', notes, off, links);
  expect(files['w:default']).toBeTruthy();
  expect(files['w:default'].notes[0].text).toBe('hi');
  expect(files['note:default']).toBeFalsy();   // 没串到便签文件
  const back = await TypewriterStore.loadDoc('write');
  expect(back.notes[0].text).toBe('hi');
  expect(back.canvasOffset).toEqual(off);
  expect(back.links).toEqual(links);
  expect(back.version).toBeGreaterThanOrEqual(1);
});

test('saveDoc/loadDoc(notes) 走便签桥且独立，不串写作文件', async () => {
  mockStorage();
  const notes = [{ id: 'n', text: '便签', x: 1, y: 2 }];
  const links = [{ from: 'n', to: 'm' }];
  const off = { x: 3, y: 4, scale: 1.2 };
  await TypewriterStore.saveDoc('notes', notes, off, links);
  expect(files['note:default']).toBeTruthy();
  expect(files['w:default']).toBeFalsy();       // 没串到写作文件
  const back = await TypewriterStore.loadDoc('notes');
  expect(back.notes[0].text).toBe('便签');
  expect(back.canvasOffset.scale).toBe(1.2);
  expect(back.links).toEqual(links);
});

test('loadDoc(mindmap) 路由到 loadMindmap（数据模型不同，单走）', async () => {
  mockStorage();
  const back = await TypewriterStore.loadDoc('mindmap');
  expect(back).toHaveProperty('nodes');
  expect(Array.isArray(back.nodes)).toBe(true);
});

test('PersistenceCoordinator.persistDoc(write) 经统一 saveDoc 写入写作桥并带视口/连线', async () => {
  mockStorage();
  const ctrl = {
    _mode: 'write',
    _canvas: { getBoundingClientRect: () => ({ width: 1000, height: 800 }) },
    _canvasOffset: { x: 120, y: -40, scale: 1.5 },
    _links: [{ from: 'a', to: 'b' }],
    _collectNotes() { return [{ id: 'a', text: 't', x: 1, y: 2 }]; },
  };
  await PersistenceCoordinator.persistDoc({ state: {}, ctrl }, 'write');
  expect(files['w:default']).toBeTruthy();
  expect(files['w:default'].canvasOffset).toEqual({ x: 120, y: -40, scale: 1.5 });
  expect(files['w:default'].links).toEqual([{ from: 'a', to: 'b' }]);
  expect(files['note:default']).toBeFalsy();   // 没串到便签文件
});
