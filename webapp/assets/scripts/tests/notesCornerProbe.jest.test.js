/**
 * @jest-environment jsdom
 */
// 探针：便签档点击右上角组切换器，面板是否能打开（定位「点不动」是逻辑抛错还是覆盖层）。
const { loadModule } = require('./__helpers__/testUtils');
global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }) };
loadModule('handlers/features/twConfig.js', []); // 副作用：共享常量挂 globalThis
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);
const { TypewriterStore } = loadModule('services/TypewriterStore.js', ['TypewriterStore']);

const idx = { version: 1, current: 'default', groups: { default: { id: 'default', title: '未命名便签', updatedAt: 1 } } };
global.window = global.window || {};
global.window.storageManager = {
  getSetting: async (k) => (k === 'typewriter:notes-index' ? idx : null),
  putSetting: async () => {},
};

function makeCtrl(mode) {
  const ctrl = {
    _mode: mode,
    _el: document.createElement('div'),
    _docPanel: null,
    _docDocHandler: null,
    _getDocKind() { return ModeController.getDocKind({ state: {}, ctrl: this }); },
    _ensureDocCorner(ctx) { return ModeController.ensureDocCorner(ctx || { state: {}, ctrl: this }); },
    _ensureDocPanel(ctx) { return ModeController.ensureDocPanel(ctx || { state: {}, ctrl: this }); },
    _hideDocPanel() { if (this._docPanel) this._docPanel.hidden = true; },
    async _renderDocPanel() { return ModeController.renderDocPanel({ state: {}, ctrl: this }); },
    async _refreshDocBtnLabel() { return ModeController.refreshDocBtnLabel({ state: {}, ctrl: this }); },
  };
  return ctrl;
}

test('notes 档 showPanel 能打开组面板（不抛错）', async () => {
  const ctrl = makeCtrl('notes');
  ModeController.ensureDocCorner({ state: {}, ctrl });
  ModeController.ensureDocPanel({ state: {}, ctrl });
  let threw = null;
  try {
    await ModeController.showDocPanel({ state: {}, ctrl });
  } catch (e) { threw = e; }
  expect(threw).toBeNull();
  expect(ctrl._docPanel.hidden).toBe(false);
});

test('write 档 showDocPanel 同样能打开（对照）', async () => {
  const ctrl = makeCtrl('write');
  ModeController.ensureDocCorner({ state: {}, ctrl });
  ModeController.ensureDocPanel({ state: {}, ctrl });
  let threw = null;
  try {
    await ModeController.showDocPanel({ state: {}, ctrl });
  } catch (e) { threw = e; }
  expect(threw).toBeNull();
  expect(ctrl._docPanel.hidden).toBe(false);
});
