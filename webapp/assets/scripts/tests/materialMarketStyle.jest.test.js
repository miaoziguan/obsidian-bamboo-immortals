/**
 * @jest-environment jsdom
 */
// 回归锁：素材市场注入的动态 <style>（paper 纸纹 / font 的 css()）必须进 shadowRoot，
// 不能落 document.head —— 画中卷跑在 Shadow DOM 内，light DOM 的样式穿透不进 .tw-card，
// 会导致纸纹/字体 css 全部失效（梦珑 paper 首曝：下载后拖到画布显示的不是该皮肤）。
// 参照 bamboo-garden 早已用 getStyleMount()；此测试防 materialMarket 退回 document.head。
const { loadModule } = require('./__helpers__/testUtils');

describe('materialMarket 动态 <style> 注入 shadowRoot', () => {
  function setupShadow() {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const sr = host.attachShadow({ mode: 'open' });
    const prev = window.__bambooShadowRoot;
    window.__bambooShadowRoot = sr;
    return { sr, restore: () => { window.__bambooShadowRoot = prev; host.remove(); } };
  }

  test('_registerStyle 把 <style> 插入 shadowRoot，且不在 document.head', () => {
    const { sr, restore } = setupShadow();
    try {
      const domref = loadModule('utils/domRef.js', ['getStyleMount', 'byId']);
      const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket'], {
        byId: domref.byId, getStyleMount: domref.getStyleMount,
      });
      const css = '.tw-card[data-paper="梦珑竹叶"]{--rice-paper:#fff}';
      MaterialMarket._registerStyle({ css: () => css }, 'bm-paper-梦珑竹叶');

      const inShadow = sr.getElementById('bm-paper-梦珑竹叶');
      expect(inShadow).not.toBeNull();
      expect(inShadow.textContent).toBe(css);
      // 关键：不能落在 light DOM（否则 shadow 内卡片吃不到）
      expect(document.getElementById('bm-paper-梦珑竹叶')).toBeNull();
      expect(document.head.querySelector('#bm-paper-梦珑竹叶')).toBeNull();

      // 重复注册：复用同一元素并更新内容（不重复插）
      MaterialMarket._registerStyle({ css: () => css + '/*v2*/' }, 'bm-paper-梦珑竹叶');
      expect(sr.querySelectorAll('#bm-paper-梦珑竹叶').length).toBe(1);
      expect(sr.getElementById('bm-paper-梦珑竹叶').textContent).toContain('/*v2*/');
    } finally {
      restore();
    }
  });

  test('无 shadow（kill-switch/测试）时回退 document.head，行为不崩', () => {
    const prev = window.__bambooShadowRoot;
    window.__bambooShadowRoot = null;
    try {
      const domref = loadModule('utils/domRef.js', ['getStyleMount', 'byId']);
      const { MaterialMarket } = loadModule('handlers/features/materialMarket.js', ['MaterialMarket'], {
        byId: domref.byId, getStyleMount: domref.getStyleMount,
      });
      MaterialMarket._registerStyle({ css: () => '.x{}' }, 'bm-paper-noshadow');
      const el = document.getElementById('bm-paper-noshadow');
      expect(el).not.toBeNull();
      expect(document.head.contains(el)).toBe(true);
      el.remove();
    } finally {
      window.__bambooShadowRoot = prev;
    }
  });
});
