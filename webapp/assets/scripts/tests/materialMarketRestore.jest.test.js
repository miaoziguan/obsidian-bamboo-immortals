/**
 * @jest-environment jsdom
 */
// 回归锁：重启后已安装素材必须被恢复 —— 读宿主权威键 materialInstalled（对象）、
// 过沙箱审计、把 css() 注入 shadowRoot、并 registerMarketPaper。
// 历史 bug：_restoreInstalled 读 installedMaterials(数组)，而宿主 AppAPI 写 materialInstalled(对象)
//          → 永远读空 → 素材不恢复 → MARKET_PAPERS 空 + CSS 不注入 → 市场皮肤重启后显示默认。
const { loadModule } = require('./__helpers__/testUtils');

const FAKE_PAPER = 'window.__bamboo_material_测试皮肤 = { type: "paper", name: "测试皮肤",' +
  ' preview: "<svg width=\\"100%\\" height=\\"100%\\" viewBox=\\"0 0 10 10\\"></svg>",' +
  ' css() { return ".tw-card[data-paper=\\"测试皮肤\\"]{--rice-paper:#fff}"; },' +
  ' render() { return ""; }, init() {}, destroy() {} };';

function setup(settings, codeById) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const sr = host.attachShadow({ mode: 'open' });
  const prevShadow = window.__bambooShadowRoot;
  window.__bambooShadowRoot = sr;
  const domref = loadModule('utils/domRef.js', ['getStyleMount', 'byId']);
  loadModule('handlers/features/twConfig.js', []);
  const semver = loadModule('utils/semver.js', ['meetsMinVersion']);
  const wd = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
  const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket'], {
    getStyleMount: domref.getStyleMount, byId: domref.byId,
    meetsMinVersion: semver.meetsMinVersion, WritingDoc: wd.WritingDoc,
  });
  window.storageManager = {
    getSetting: async (k) => (k in settings ? settings[k] : null),
    loadMarketMaterialCode: async (id) => (codeById && codeById[id]) || null,
  };
  return {
    sr,
    MaterialMarket,
    cleanup() { delete window.__bambooShadowRoot; window.__bambooShadowRoot = prevShadow; delete window.storageManager; host.remove(); },
  };
}

describe('素材市场重启恢复', () => {
  test('读宿主权威键 materialInstalled(对象)：注册纸样 + CSS 注入 shadowRoot', async () => {
    const { sr, MaterialMarket, cleanup } = setup(
      { materialInstalled: { '测试皮肤': { version: '1.0.0', installedAt: 123 } } },
      { '测试皮肤': FAKE_PAPER },
    );
    try {
      await MaterialMarket._restoreInstalled();
      const style = sr.getElementById('bm-paper-测试皮肤');
      expect(style).not.toBeNull();
      expect(style.textContent).toContain('data-paper="测试皮肤"');
      expect(global.MARKET_PAPERS).toContain('测试皮肤');
      // 恢复后 _persist 不应把 version 写丢
      MaterialMarket._persistedMeta = { '测试皮肤': { version: '1.0.0', installedAt: 123 } };
    } finally { cleanup(); }
  });

  test('兼容历史键 installedMaterials(数组)', async () => {
    const { sr, MaterialMarket, cleanup } = setup(
      { installedMaterials: [{ id: '测试皮肤', code: FAKE_PAPER, version: '1.0.0' }] },
      null,
    );
    try {
      await MaterialMarket._restoreInstalled();
      expect(sr.getElementById('bm-paper-测试皮肤')).not.toBeNull();
    } finally { cleanup(); }
  });

  test('卸载后 _persist 从权威键移除条目（否则卸载的素材重启会复活）', async () => {
    const { MaterialMarket, cleanup } = setup(
      { materialInstalled: { '测试皮肤': { version: '1.0.0', installedAt: 123 } } },
      { '测试皮肤': FAKE_PAPER },
    );
    try {
      await MaterialMarket._restoreInstalled();
      let written = null;
      window.storageManager.putSetting = async (k, v) => { written = { k, v }; };
      await MaterialMarket._uninstall('测试皮肤');
      expect(written.k).toBe('materialInstalled');
      expect(written.v['测试皮肤']).toBeUndefined();
    } finally { cleanup(); }
  });

  test('套用到已有卡片：写回模型并触发落盘（否则重启丢失）', () => {
    const { MaterialMarket, cleanup } = setup({}, {});
    try {
      global.registerMarketPaper('测试皮肤');   // 模拟「已安装注册」状态
      const ctrl = {
        _notes: [{ id: 'c1', paper: 'plain', text: '', x: 0, y: 0 }],
        _invalidateGeo: () => {},
        _scheduleSave: () => {},
      };
      MaterialMarket._ctrl = ctrl;
      const card = document.createElement('div');
      card.className = 'tw-card';
      card.dataset.id = 'c1';
      MaterialMarket._applyMaterialToCard(card, { paper: '测试皮肤' });
      expect(card.dataset.paper).toBe('测试皮肤');
      expect(ctrl._notes[0].paper).toBe('测试皮肤');   // 关键：市场纸样必须原值写回模型（旧 setPaper 会转成 plain）
    } finally { cleanup(); }
  });

  test('套用市场纸样时即使尚未注册(MARKET_PAPERS 空)也不回落 plain、原值落盘', () => {
    const { MaterialMarket, cleanup } = setup({}, {});
    try {
      // 注意：未调用 registerMarketPaper —— 模拟「启动竞态/恢复未完成」时 MARKET_PAPERS 为空，
      // 旧代码 setPaper 会把梦珑这类纸样静默转成 plain 并写回模型 → 持久化丢。
      const ctrl = {
        _notes: [{ id: 'c1', paper: 'plain', text: '', x: 0, y: 0 }],
        _invalidateGeo: () => {},
        _scheduleSave: () => {},
      };
      MaterialMarket._ctrl = ctrl;
      const card = document.createElement('div');
      card.className = 'tw-card';
      card.dataset.id = 'c1';
      MaterialMarket._applyMaterialToCard(card, { paper: '测试皮肤' });
      expect(card.dataset.paper).toBe('测试皮肤');
      expect(ctrl._notes[0].paper).toBe('测试皮肤');   // 关键：未注册时也不回落 plain
    } finally { cleanup(); }
  });
});
