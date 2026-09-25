/**
 * @jest-environment jsdom
 */
// 回归锁：便签多组隔离。
//  1) 切组前落盘(persistDoc)必须写「当前组独立文件」(saveNotes)，不写全局遗留 key；
//  2) loadNotes 必须按 current 组读独立文件，各组内容互不相同；
//  3) 桥支持 per-group 时，缺文件的组应视为空，绝不串入旧全局 legacy 文档（否则切换组内容一样）。
const { loadModule } = require('./__helpers__/testUtils');
global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
loadModule('handlers/features/twConfig.js', []); // 副作用：共享常量挂 globalThis
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

test('persistDoc(notes) 写当前组独立文件且带视口/连线，不写全局遗留 key', async () => {
  mockStorage();
  settings['typewriter:notes-index'] = { version: 1, current: 'groupA', groups: { groupA: { id: 'groupA', title: 'A', updatedAt: 1 }, groupB: { id: 'groupB', title: 'B', updatedAt: 1 } } };
  const ctrl = {
    _mode: 'notes',
    _canvas: document.createElement('div'),
    _canvasOffset: { x: 120, y: -40, scale: 1.5 },
    _links: [{ from: 'n1', to: 'n2' }],
    _collectNotes() { return [{ id: 'n1', text: 'a', x: 0, y: 0 }, { id: 'n2', text: 'b', x: 100, y: 0 }]; },
  };
  await PersistenceCoordinator.persistDoc({ state: {}, ctrl }, 'notes');

  expect(files.groupA).toBeTruthy();
  expect(files.groupA.canvasOffset).toEqual({ x: 120, y: -40, scale: 1.5 });
  expect(files.groupA.links).toEqual([{ from: 'n1', to: 'n2' }]);

  const legacy = new Set([TypewriterStore.KEY_NOTES, TypewriterStore.KEY_CANVAS, TypewriterStore.KEY_LINKS]);
  const leaked = Object.keys(settings).filter((k) => legacy.has(k));
  expect(leaked).toEqual([]);
});

test('loadNotes 按 current 组读独立文件，各组内容互不相同', async () => {
  mockStorage();
  settings['typewriter:notes-index'] = { version: 1, current: 'A', groups: { A: { id: 'A', title: 'A', updatedAt: 1 }, B: { id: 'B', title: 'B', updatedAt: 1 } } };
  files.A = { version: TypewriterStore.VERSION, notes: [{ id: 'a', text: 'A-Only', x: 0, y: 0 }], links: [], canvasOffset: { x: 0, y: 0, scale: 1 } };
  files.B = { version: TypewriterStore.VERSION, notes: [{ id: 'b', text: 'B-Only', x: 0, y: 0 }], links: [], canvasOffset: { x: 5, y: 5, scale: 1.2 } };

  await TypewriterStore.setNotesCurrent('A');
  let d = await TypewriterStore.loadNotes();
  expect(d.notes[0].text).toBe('A-Only');

  await TypewriterStore.setNotesCurrent('B');
  d = await TypewriterStore.loadNotes();
  expect(d.notes[0].text).toBe('B-Only');
  expect(d.canvasOffset).toEqual({ x: 5, y: 5, scale: 1.2 });
});

test('缺文件的组视为空，不串入 legacy 全局文档', async () => {
  mockStorage();
  settings['typewriter:notes-index'] = { version: 1, current: 'A', groups: { A: { id: 'A', title: 'A', updatedAt: 1 }, B: { id: 'B', title: 'B', updatedAt: 1 } } };
  files.A = { version: TypewriterStore.VERSION, notes: [{ id: 'a', text: 'A-Only', x: 0, y: 0 }], links: [], canvasOffset: { x: 0, y: 0, scale: 1 } };
  // 旧全局 legacy 残留（内容为 LEGACY）— 不应被缺文件的 B 组显示
  settings['typewriter:notes'] = { version: 1, notes: [{ id: 'legacy', text: 'LEGACY', x: 0, y: 0 }], canvasOffset: { x: 9, y: 9, scale: 2 }, links: [] };
  delete files.B; // B 组文件缺失

  await TypewriterStore.setNotesCurrent('B');
  const d = await TypewriterStore.loadNotes();
  expect(d.notes).toEqual([]); // 空组，而非 legacy 内容
});
