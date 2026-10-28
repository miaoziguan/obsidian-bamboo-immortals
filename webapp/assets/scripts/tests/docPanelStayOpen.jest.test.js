/**
 * @jest-environment jsdom
 */
// 便签 / 写作 / 思维导图的「组菜单」在切换组后必须保持打开。
// 旧实现切换前先 _hideDocPanel()，等于每切一次就把列表收起，用户要连切几组得反复重开。
const { loadModule } = require('./__helpers__/testUtils');
global.MindmapFeature = { isActive: () => false, stats: () => ({ count: 0, depth: 0 }), switchGroup: async () => {} };
loadModule('handlers/features/twConfig.js', []);
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);
const { TypewriterStore } = loadModule('services/TypewriterStore.js', ['TypewriterStore']);

const idx = {
  version: 1,
  current: 'g1',
  groups: {
    g1: { id: 'g1', title: '未命名便签', updatedAt: 1 },
    g2: { id: 'g2', title: '近期规划', updatedAt: 2 },
  },
};
global.window = global.window || {};
global.window.storageManager = {
  getSetting: async (k) => (k === 'typewriter:notes-index' ? JSON.parse(JSON.stringify(idx)) : null),
  putSetting: async () => {},
};

function makeCtrl() {
  const ctrl = {
    _mode: 'notes',
    _el: document.createElement('div'),
    _docPanel: null,
    _docDocHandler: null,
    _docBusy: false,
    _switching: false,
    _saveTimer: null,
    _pendingModeDir: 0,
    _undoStack: { reset() {} },
    // 依赖全部 no-op：本用例只关心「有没有主动收起菜单」
    _exitAllEdits() {},
    async _persistDoc() {},
    async _loadDoc() {},
    async _reloadStickers() {},
    _scheduleRenderLinks() {},
    _showScreenMsg() {},
    _getDocKind() { return ModeController.getDocKind({ state: {}, ctrl: this }); },
    _ensureDocCorner() { return ModeController.ensureDocCorner({ state: {}, ctrl: this }); },
    _ensureDocPanel() { return ModeController.ensureDocPanel({ state: {}, ctrl: this }); },
    _showDocPanel() { return ModeController.showDocPanel({ state: {}, ctrl: this }); },
    _hideDocPanel() { return ModeController.hideDocPanel({ state: {}, ctrl: this }); },
    async _renderDocPanel() { return ModeController.renderDocPanel({ state: {}, ctrl: this }); },
    async _refreshDocBtnLabel() { return ModeController.refreshDocBtnLabel({ state: {}, ctrl: this }); },
    async _switchNotesGroup(id) { return ModeController.switchNotesGroup({ state: {}, ctrl: this }, id); },
  };
  return ctrl;
}

describe('组菜单在切换后保持打开', () => {
  it('切换便签组：不调用 _hideDocPanel，面板仍可见', async () => {
    const ctrl = makeCtrl();
    const ctx = { state: {}, ctrl };

    // 先放一个真实的 corner 按钮 + 面板（showDocPanel 依赖 #twDocCorner 定位）
    const btn = document.createElement('button');
    btn.id = 'twDocCorner';
    ctrl._el.appendChild(btn);
    document.body.appendChild(ctrl._el);
    ModeController.ensureDocPanel(ctx);
    await ModeController.showDocPanel(ctx);
    expect(ctrl._docPanel.hidden).toBe(false);

    // 监视「收起」动作：直接替换（不转发给真实实现——若有其它路径收起菜单，计数会如实暴露）
    let hideCalls = 0;
    ctrl._hideDocPanel = function () { hideCalls += 1; };

    await ctrl._switchNotesGroup('g2');   // 切到另一个组

    expect(hideCalls).toBe(0);                 // 没有主动收起
    expect(ctrl._docPanel.hidden).toBe(false); // 面板仍打开
  });

  it('点当前组（id 未变）也不会收起面板', async () => {
    const ctrl = makeCtrl();
    const ctx = { state: {}, ctrl };
    const btn = document.createElement('button');
    btn.id = 'twDocCorner';
    ctrl._el.appendChild(btn);
    document.body.appendChild(ctrl._el);
    ModeController.ensureDocPanel(ctx);
    await ModeController.showDocPanel(ctx);

    let hideCalls = 0;
    ctrl._hideDocPanel = function () { hideCalls += 1; };

    await ctrl._switchNotesGroup('g1');   // 就是当前组

    expect(hideCalls).toBe(0);
    expect(ctrl._docPanel.hidden).toBe(false);
  });
});
