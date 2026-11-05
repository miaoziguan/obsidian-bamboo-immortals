/**
 * @jest-environment jsdom
 */
// 回归锁：便签导出 PNG 的零依赖 foreignObject 链路。
// 重点锁三件容易静默退化的事：
//  1) 2x 必须用「无 viewBox + 内层 transform:scale」——iOS WKWebView 上 viewBox
//     缩放 foreignObject 不生效（真机探针：内容只占左上 1/4，中心纯白）；
//  2) shadowRoot 内的 :host(...) 规则必须改写成 .bm-export-host...，否则暗色导出变亮色；
//  3) 交互控件必须剔除，齿边/正文/贴纸内容必须保留。
const { loadModule } = require('./__helpers__/testUtils');

function load(globals) {
  return loadModule('handlers/features/exportPng.js',
    ['esc', 'rewriteHostSelectors', 'collectStyles', 'cloneForExport', 'exportCardPng'],
    Object.assign({ getShadowRoot: () => null }, globals));
}

/** 造一张结构等价的便签卡 */
function makeCard() {
  const card = document.createElement('div');
  card.className = 'tw-card selected';
  card.dataset.paper = '抓重点1';
  card.style.cssText = 'left:80px;top:60px;--tw-card-rot:-6deg;';
  card.innerHTML =
    '<div class="tw-card-edge tw-card-edge-top"></div>' +
    '<div class="tw-card-main"><div class="tw-card-noise"></div>' +
    '<div class="tw-card-head"><span class="tw-card-title">抓重点</span></div>' +
    '<div class="tw-card-text">今天最重要的事</div></div>' +
    '<div class="tw-card-edge tw-card-edge-bottom"></div>' +
    '<div class="tw-card-tools"><button class="tw-card-export">MD</button></div>' +
    '<div class="tw-card-resize"></div><div class="tw-card-rotate"></div>' +
    '<div class="bm-sticker selected"><div class="bm-sticker-content"><svg viewBox="0 0 10 10"></svg></div>' +
    '<button class="bm-sticker-rotate">↻</button></div>';
  // jsdom 无布局引擎：给 offsetWidth/offsetHeight 兜底，模拟真实卡片尺寸
  Object.defineProperty(card, 'offsetWidth', { value: 340, configurable: true });
  Object.defineProperty(card, 'offsetHeight', { value: 341, configurable: true });
  return card;
}

function setupShadow() {
  const host = document.createElement('div');
  host.id = 'bamboo-shadow-host';
  host.className = 'bamboo-shadow-host dark theme-dark platform-mobile';
  document.body.appendChild(host);
  const sr = host.attachShadow({ mode: 'open' });
  const base = document.createElement('style');
  base.id = 'bm-paper-抓重点1';
  base.textContent = ':host(.dark) .tw-card-text{color:#fff}.tw-card-main::after{background:#ffb5d5}';
  sr.appendChild(base);
  const prev = window.__bambooShadowRoot;
  window.__bambooShadowRoot = sr;
  return { sr, host, restore: () => { window.__bambooShadowRoot = prev; host.remove(); } };
}

describe('rewriteHostSelectors —— :host 规则改写', () => {
  const { rewriteHostSelectors } = load();

  test(':host(.dark) → .bm-export-host.dark', () => {
    expect(rewriteHostSelectors(':host(.dark) .tw-card{color:red}'))
      .toBe('.bm-export-host.dark .tw-card{color:red}');
  });

  test('裸 :host → .bm-export-host（色板变量规则）', () => {
    expect(rewriteHostSelectors(':host{--lv-color:red}'))
      .toBe('.bm-export-host{--lv-color:red}');
  });

  test(':host(:not(.dark)) 括号平衡，不被内层括号截断', () => {
    expect(rewriteHostSelectors(':host(:not(.dark)) .x{}'))
      .toBe('.bm-export-host:not(.dark) .x{}');
  });

  test('复合选择器 :host(.dark.cls) 保留', () => {
    expect(rewriteHostSelectors(':host(.dark.bamboo-immortals-root) .x{}'))
      .toBe('.bm-export-host.dark.bamboo-immortals-root .x{}');
  });

  test('同一段 CSS 内多个 :host 全部改写，且不含残留', () => {
    const css = ':host(.dark) .a{color:1}:host{--v:2}:host(.privacy-on) .b{color:3}';
    const out = rewriteHostSelectors(css);
    expect(out).toBe('.bm-export-host.dark .a{color:1}.bm-export-host{--v:2}.bm-export-host.privacy-on .b{color:3}');
    expect(out).not.toContain(':host');
  });

  test('普通 CSS 内容不受影响', () => {
    const css = '.tw-card-main::after{background:url("data:image/svg+xml;base64,AAA")}';
    expect(rewriteHostSelectors(css)).toBe(css);
  });
});

describe('collectStyles —— 样式收集覆盖 shadowRoot 与 head', () => {
  test('皮肤 style 在 shadowRoot 内时会被收集', () => {
    const { sr, restore } = setupShadow();
    try {
      const { collectStyles } = load({ getShadowRoot: () => sr });
      const css = collectStyles();
      // collectStyles 取原始 CSS；:host 改写发生在 rewriteHostSelectors 之后
      expect(css).toContain(':host(.dark)');
      expect(css).toContain('::after');
      expect(load({ getShadowRoot: () => sr }).rewriteHostSelectors(css)).toContain('.bm-export-host.dark');
    } finally { restore(); }
  });

  test('非 shadow 模式回退 document.head', () => {
    const st = document.createElement('style');
    st.id = 'head-probe';
    st.textContent = '.head-only{color:#123456}';
    document.head.appendChild(st);
    try {
      const { collectStyles } = load({ getShadowRoot: () => null });
      expect(collectStyles()).toContain('.head-only');
    } finally { st.remove(); }
  });
});

describe('cloneForExport —— 剔除交互控件、扶正、保留内容', () => {
  const { cloneForExport } = load();

  test('剔除全部交互控件', () => {
    const { wrap } = cloneForExport(makeCard());
    ['.tw-card-tools', '.tw-card-resize', '.tw-card-rotate', '.bm-sticker-rotate'].forEach((sel) => {
      expect(wrap.querySelector(sel)).toBeNull();
    });
  });

  test('保留齿边、正文与贴纸内容', () => {
    const { wrap } = cloneForExport(makeCard());
    expect(wrap.querySelector('.tw-card-edge')).not.toBeNull();
    expect(wrap.querySelector('.tw-card-text').textContent).toBe('今天最重要的事');
    expect(wrap.querySelector('.bm-sticker-content svg')).not.toBeNull();
  });

  test('整棵克隆树的状态类都被清理（贴纸选中描边不进 PNG）', () => {
    const { wrap } = cloneForExport(makeCard());
    const sticker = wrap.querySelector('.bm-sticker');
    expect(sticker).not.toBeNull();
    expect(sticker.classList.contains('selected')).toBe(false);
    expect(wrap.querySelector('.selected')).toBeNull();
  });

  test('扶正：位移归零、旋转归零、去掉选中态', () => {
    const { wrap } = cloneForExport(makeCard());
    const card = wrap.querySelector('.tw-card');
    expect(card.style.left).toBe('0px');
    expect(card.style.top).toBe('0px');
    expect(card.style.getPropertyValue('--tw-card-rot')).toBe('0deg');
    expect(card.classList.contains('selected')).toBe(false);
  });

  test('保留 .tw-canvas.tw-mode-notes 容器（宽度规则依赖它）', () => {
    const { wrap, width, height } = cloneForExport(makeCard());
    expect(wrap.className).toBe('tw-canvas tw-mode-notes');
    expect(width).toBe(340);
    expect(height).toBe(341);
  });
});

describe('exportCardPng —— SVG 结构（H 2x 写法）', () => {
  let origImage, origToDataURL, origGetContext, capturedSrc, canvasOps;

  beforeEach(() => {
    capturedSrc = null;
    canvasOps = [];
    origImage = global.Image;
    origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    origGetContext = HTMLCanvasElement.prototype.getContext;
    // 拦截 Image：捕获 SVG 并立即触发 onload（jsdom 不加载 data: 图片）
    global.Image = class {
      set src(v) { capturedSrc = v; if (this.onload) setTimeout(() => this.onload(), 0); }
    };
    HTMLCanvasElement.prototype.getContext = () => ({
      fillRect() { canvasOps.push('fillRect'); },
      drawImage() { canvasOps.push('drawImage'); },
      set fillStyle(v) { canvasOps.push('fillStyle:' + v); },
    });
    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,QUJD';
  });

  afterEach(() => {
    global.Image = origImage;
    HTMLCanvasElement.prototype.toDataURL = origToDataURL;
    HTMLCanvasElement.prototype.getContext = origGetContext;
  });

  test('2x 不使用 viewBox，改用 transform:scale(2) 与放大后的具体 px', async () => {
    const { exportCardPng } = load();
    const out = await exportCardPng(makeCard(), { scale: 2 });
    const svg = decodeURIComponent(capturedSrc.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
    // 只查根 <svg> 标签：贴纸自身的内联 SVG 带 viewBox 是合法的
    expect(svg.slice(0, svg.indexOf('>') + 1)).not.toContain('viewBox');
    expect(svg).toContain('transform:scale(2)');
    expect(svg).toContain('transform-origin:0 0');
    expect(svg).toContain('width="680"');
    expect(svg).toContain('height="682"');
    expect(svg).toContain('<foreignObject x="0" y="0" width="680" height="682">');
    expect(out).toEqual({ base64: 'QUJD', width: 680, height: 682 });
  });

  test('透明底：容器不铺白、canvas 不 fillRect，贴纸选中态不进 SVG', async () => {
    const { exportCardPng } = load();
    await exportCardPng(makeCard(), { scale: 2 });
    const svg = decodeURIComponent(capturedSrc.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
    expect(svg).toContain('background:transparent');
    expect(svg).not.toContain('background:#fff');
    expect(canvasOps).not.toContain('fillRect');
    expect(canvasOps).toContain('drawImage');
    // .bm-sticker.selected 的金色描边不应被带进导出图
    expect(svg).not.toContain('bm-sticker selected');
    expect(svg).toContain('bm-sticker');
  });

  test('1x 不放大但仍无 viewBox', async () => {
    const { exportCardPng } = load();
    const out = await exportCardPng(makeCard(), { scale: 1 });
    const svg = decodeURIComponent(capturedSrc.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
    expect(svg.slice(0, svg.indexOf('>') + 1)).not.toContain('viewBox');
    expect(svg).toContain('width="340"');
    expect(out.width).toBe(340);
  });

  test('shadowRoot 样式被内联且 :host 已改写、主题 class 已带上', async () => {
    const { sr, restore } = setupShadow();
    try {
      const { exportCardPng } = load({ getShadowRoot: () => sr });
      await exportCardPng(makeCard(), { scale: 2 });
      const svg = decodeURIComponent(capturedSrc.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
      expect(svg).toContain('.bm-export-host.dark');
      expect(svg).not.toContain(':host(.dark)');
      expect(svg).toContain('class="bm-export-host dark theme-dark platform-mobile"');
      expect(svg).toContain('background:#ffb5d5');
      expect(svg).not.toContain('tw-card-tools');
      expect(svg).toContain('tw-card-edge');
    } finally { restore(); }
  });
});
