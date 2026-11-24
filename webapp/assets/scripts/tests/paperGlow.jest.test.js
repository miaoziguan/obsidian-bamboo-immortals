/**
 * @jest-environment jsdom
 */
const { loadModule } = require('./__helpers__/testUtils');

global.MindmapFeature = { isActive: () => false, _zoomUI: null };
const { TypewriterFeature: feature } = loadModule(
  'handlers/features/typewriterFeature.js',
  ['TypewriterFeature']
);

describe('落笔生光 / 轮廓辉光', () => {
  test('参数清洗接受 paper 模式并收敛越界值', () => {
    const light = feature._normalizeLight({
      mode: 'paper',
      paper: {
        intensity: 999,
        spread: 99,
        boost: 100,
        settle: 99,
        period: 99,
        dim: 99,
        temp: 'bogus',
        color: 'red',
      },
    });
    expect(light.mode).toBe('paper');
    expect(light.paper).toMatchObject({
      intensity: 100,
      spread: 30,
      boost: 100,
      settle: 8,
      period: 8,
      dim: 70,
      temp: 'warm',
      color: '#e0a35c',
    });
  });

  test('仅暗色写作/导图档应用纸模式变量', () => {
    const makeView = (mode) => Object.assign(Object.create(feature), {
      _mode: mode,
      _el: document.createElement('div'),
      _lightBackdrop: document.createElement('div'),
      _lightPaperDim: document.createElement('div'),
      _light: feature._normalizeLight({
        mode: 'paper',
        paper: { intensity: 42, spread: 14, boost: 62, settle: 2, period: 3, dim: 42, temp: 'warm', color: '#e0a35c' },
      }),
      _isDarkNow: () => true,
      _zoomUI: null,
      _syncLightPhaseTimer: () => {},
      _syncRainSeedTimer: () => {},
    });

    const write = makeView('write');
    write._applyLight();
    expect(write._el.classList.contains('tw-light-paper-on')).toBe(true);
    expect(write._el.style.getPropertyValue('--tw-paper-base')).toBe('0.420');
    expect(write._el.style.getPropertyValue('--tw-paper-write')).toBe('0.780');
    expect(write._el.style.getPropertyValue('--tw-paper-period')).toBe('3s');

    const mindmap = makeView('mindmap');
    mindmap._applyLight();
    expect(mindmap._el.classList.contains('tw-light-paper-on')).toBe(true);

    const notes = makeView('notes');
    notes._applyLight();
    expect(notes._el.classList.contains('tw-light-paper-on')).toBe(false);
  });

  test('呼吸增幅用剩余亮度空间计算，满幅可到 100%', () => {
    const view = Object.assign(Object.create(feature), {
      _mode: 'write',
      _el: document.createElement('div'),
      _lightBackdrop: document.createElement('div'),
      _lightPaperDim: document.createElement('div'),
      _light: feature._normalizeLight({
        mode: 'paper',
        paper: { intensity: 42, boost: 100, temp: 'warm', color: '#e0a35c' },
      }),
      _isDarkNow: () => true,
      _zoomUI: null,
      _syncLightPhaseTimer: () => {},
      _syncRainSeedTimer: () => {},
    });
    view._applyLight();
    expect(view._el.style.getPropertyValue('--tw-paper-write')).toBe('1.000');
  });

  test('选中卡片即点亮辉光，取消选中即熄灭', () => {
    const card = document.createElement('div');
    card.className = 'tw-card';
    document.body.appendChild(card);
    const f = Object.create(feature);
    Object.assign(f, {
      _mode: 'write',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'paper' }),
      _isDarkNow: () => true,
    });

    f._syncPaperGlowSelection(card);
    expect(card.classList.contains('is-paper-lit')).toBe(true);
    f._syncPaperGlowSelection(null);
    expect(card.classList.contains('is-paper-lit')).toBe(false);
    card.remove();
  });

  test('框选多个节点时都点亮弱辉光且不呼吸', () => {
    const nodes = [1, 2].map(() => {
      const el = document.createElement('div');
      el.className = 'tw-mm-node is-breathing';
      document.body.appendChild(el);
      return el;
    });
    const f = Object.create(feature);
    Object.assign(f, {
      _mode: 'mindmap',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'paper' }),
      _isDarkNow: () => true,
    });

    f._syncPaperGlowSelection(nodes, true);

    nodes.forEach((n) => {
      expect(n.classList.contains('is-paper-lit')).toBe(true);
      expect(n.classList.contains('is-paper-lit-multi')).toBe(true);
      expect(n.classList.contains('is-breathing')).toBe(false);
      // 结构标记在辉光模式也必须保留，否则选中的每张卡会重新漏出工具条/连线锚点。
      expect(n.classList.contains('is-multi-active')).toBe(true);
    });
    expect(f._paperGlowCard).toBeNull();
    nodes.forEach((n) => n.remove());
  });

  test('切换光效/明暗时按当前选区重算视觉，不丢多选态', () => {
    const nodes = [1, 2].map(() => {
      const el = document.createElement('div');
      el.className = 'tw-card selected';
      document.body.appendChild(el);
      return el;
    });
    const view = Object.assign(Object.create(feature), {
      _mode: 'write',
      _el: document.body,
      _selected: new Set(nodes),
      _light: feature._normalizeLight({ mode: 'off' }),
      _isDarkNow: () => true,
      _zoomUI: null,
      _syncLightPhaseTimer: () => {},
      _syncRainSeedTimer: () => {},
    });

    view._syncPaperGlowSelection(nodes, true);
    expect(nodes[0].classList.contains('is-multi-active')).toBe(true);
    expect(nodes[0].classList.contains('is-paper-lit')).toBe(false);

    view._light.mode = 'paper';
    view._applyLight();
    nodes.forEach((n) => {
      expect(n.classList.contains('is-paper-lit-multi')).toBe(true);
      expect(n.classList.contains('is-multi-active')).toBe(true);
    });

    view._light.mode = 'off';
    view._applyLight();
    nodes.forEach((n) => {
      expect(n.classList.contains('is-paper-lit')).toBe(false);
      expect(n.classList.contains('is-multi-active')).toBe(true);
    });
    nodes.forEach((n) => n.remove());
  });

  test('超过阈值的多选降级为轻量辉光', () => {
    const nodes = Array.from({ length: 25 }, () => {
      const el = document.createElement('div');
      el.className = 'tw-mm-node';
      document.body.appendChild(el);
      return el;
    });
    const f = Object.create(feature);
    Object.assign(f, {
      _mode: 'mindmap',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'paper' }),
      _isDarkNow: () => true,
    });

    f._syncPaperGlowSelection(nodes, true);

    expect(nodes[0].classList.contains('is-paper-lit-lite')).toBe(true);
    expect(nodes[0].classList.contains('is-paper-lit-multi')).toBe(false);
    nodes.forEach((n) => n.remove());
  });

  test('非 paper 模式的多选也能标记统一激活态', () => {
    const nodes = [1, 2].map(() => {
      const el = document.createElement('div');
      el.className = 'tw-card';
      document.body.appendChild(el);
      return el;
    });
    const f = Object.create(feature);
    Object.assign(f, {
      _mode: 'notes',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'off' }),
      _isDarkNow: () => true,
    });

    f._syncPaperGlowSelection(nodes, true);
    nodes.forEach((n) => expect(n.classList.contains('is-multi-active')).toBe(true));

    f._syncPaperGlowSelection(nodes[0], false);
    expect(nodes[0].classList.contains('is-multi-active')).toBe(false);
    expect(nodes[1].classList.contains('is-multi-active')).toBe(false);
    nodes.forEach((n) => n.remove());
  });

  test('选中同步不会清掉正在编辑节点的呼吸', () => {
    const node = document.createElement('div');
    node.className = 'tw-mm-node is-editing is-paper-lit is-breathing';
    document.body.appendChild(node);
    const f = Object.create(feature);
    Object.assign(f, {
      _mode: 'mindmap',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'paper' }),
      _isDarkNow: () => true,
      _paperGlowCard: node,
    });

    f._syncPaperGlowSelection(node);

    expect(node.classList.contains('is-paper-lit')).toBe(true);
    expect(node.classList.contains('is-breathing')).toBe(true);
    node.remove();
  });

  test('进入编辑即开始呼吸，不等第一次输入', () => {
    const canvas = document.createElement('div');
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.innerHTML = '<div class="tw-card-text"></div>';
    canvas.appendChild(card);
    document.body.appendChild(canvas);
    const f = Object.create(feature);
    Object.assign(f, {
      _canvas: canvas,
      _mode: 'write',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'paper' }),
      _isDarkNow: () => true,
    });
    const detach = f._bindPaperGlow();
    card.querySelector('.tw-card-text').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(card.classList.contains('is-breathing')).toBe(true);
    detach();
    canvas.remove();
  });

  test('导图节点正文获得焦点即开始呼吸', () => {
    const node = document.createElement('div');
    node.className = 'tw-mm-node';
    node.innerHTML = '<span class="tw-mm-text"></span>';
    document.body.appendChild(node);
    const f = Object.create(feature);
    Object.assign(f, {
      _mode: 'mindmap',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'paper' }),
      _isDarkNow: () => true,
    });
    const detach = f._bindPaperGlow();
    node.querySelector('.tw-mm-text').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(node.classList.contains('is-paper-lit')).toBe(true);
    expect(node.classList.contains('is-breathing')).toBe(true);
    detach();
    node.remove();
  });

  test('编辑态切换为呼吸光类', () => {
    const card = document.createElement('div');
    document.body.appendChild(card);
    const f = Object.create(feature);
    Object.assign(f, {
      _mode: 'write',
      _el: document.body,
      _light: feature._normalizeLight({ mode: 'paper' }),
      _isDarkNow: () => true,
      _paperGlowCard: card,
    });

    f._setPaperWriting(true);
    expect(card.classList.contains('is-breathing')).toBe(true);
    f._setPaperWriting(false);
    expect(card.classList.contains('is-breathing')).toBe(false);
    card.remove();
  });

  test('光效面板三档都列出落笔生光，便签档置灰禁选而非隐藏', () => {
    const htmlOf = (mode, dark = true) => feature._lightPanelHtml.call({
      _mode: mode,
      _light: feature._normalizeLight({ mode: 'off' }),
      _lightOpen: {},
      _isDarkNow: () => dark,
    });
    const paperBtn = (html) => html.match(/<button[^>]*data-light-mode="paper"[^>]*>/)[0];
    expect(paperBtn(htmlOf('write'))).not.toMatch(/disabled/);
    expect(paperBtn(htmlOf('mindmap'))).not.toMatch(/disabled/);
    const notes = paperBtn(htmlOf('notes'));
    expect(notes).toMatch(/disabled aria-disabled="true"/);
    expect(notes).toContain('落笔生光仅暗色写作档与思维子弹档可用');
    // 暗色也不是通行证：写作档在亮色下同样禁选，提示改为仅暗色可用。
    expect(paperBtn(htmlOf('write', false))).toMatch(/disabled aria-disabled="true"/);
  });

  test('曲径通幽 / 江南烟雨 / 雪落轻叹在亮色下置灰并在运行时暂停', () => {
    const htmlOf = (dark) => feature._lightPanelHtml.call({
      _mode: 'write',
      _light: feature._normalizeLight({ mode: 'off' }),
      _lightOpen: {},
      _isDarkNow: () => dark,
    });
    ['backdrop', 'rain', 'snow'].forEach((id) => {
      const btn = (dark) => htmlOf(dark).match(new RegExp('<button[^>]*data-light-mode="' + id + '"[^>]*>'))[0];
      expect(btn(true)).not.toMatch(/disabled/);
      expect(btn(false)).toMatch(/disabled aria-disabled="true"/);
      expect(btn(false)).toContain('仅暗色模式可用');
    });

    const host = document.createElement('div');
    host.className = 'scroll-typewriter-feature';
    const view = Object.assign(Object.create(feature), {
      _el: host,
      _light: feature._normalizeLight({ mode: 'rain' }),
      _lightBackdrop: document.createElement('div'),
      _lightPaperDim: document.createElement('div'),
      _isDarkNow: () => false,
      _zoomUI: null,
      _syncLightPhaseTimer: () => {},
      _syncRainSeedTimer: () => {},
    });
    view._applyLight();
    expect(host.classList.contains('tw-light-rain-on')).toBe(false);
    expect(view._isLightOn()).toBe(false);
    expect(view._lightRainHtml()).toContain('亮色模式下江南烟雨已暂停');

    view._isDarkNow = () => true;
    view._applyLight();
    expect(host.classList.contains('tw-light-rain-on')).toBe(true);
    expect(view._isLightOn()).toBe(true);
  });

  test('正文编辑区不显示绿色焦点框', () => {
    const fs = require('fs');
    const path = require('path');
    const css = fs.readFileSync(path.resolve(__dirname, '../../styles/notes.css'), 'utf8');
    expect(css).toMatch(/\.tw-card-text\[contenteditable\]:focus,\s*\.tw-card-text\[contenteditable\]:focus-visible,\s*\.tw-mm-text\[contenteditable\]:focus/);
    expect(css).toMatch(/\{ box-shadow: none; \}/);
  });

  test('写作档选中态不叠加描边/阴影，只保留层级', () => {
    const fs = require('fs');
    const path = require('path');
    const css = fs.readFileSync(path.resolve(__dirname, '../../styles/scroll-pager.css'), 'utf8');
    expect(css).toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.selected \{\s*z-index: 50;\s*\}/);
    expect(css).not.toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.selected \{[^}]*(?:outline|box-shadow)/);
    // 多选只留一道细轮廓：贴着边框外缘(offset 0) + 原边框透明，避免双线；
    // 线宽走反缩放变量，缩小视图下仍是屏幕 1px；落笔生光由辉光表达，不叠这圈线。
    expect(css).toMatch(/:not\(\.tw-light-paper-on\) \.tw-canvas\.tw-mode-write \.tw-card\.selected\.is-multi-active:not\(\.editing\) \.tw-card-main \{[^}]*outline: var\(--tw-sel-hairline, 1px\) solid rgba\(var\(--bm-tw-sel-contour-rgb, var\(--primary-rgb\)\), var\(--bm-tw-sel-contour-alpha, 0\.72\)\)/);
    expect(css).toMatch(/:not\(\.tw-light-paper-on\) \.tw-canvas\.tw-mode-write \.tw-card\.selected\.is-multi-active:not\(\.editing\) \.tw-card-main \{[^}]*outline-offset: 0;[^}]*border-color: transparent;/);
    // 暗色：主色绿与深绿卡面同色系不够跳，换浅竹色 + 高不透明度（写作/导图共用令牌）。
    const vars = fs.readFileSync(path.resolve(__dirname, '../../styles/variables.css'), 'utf8');
    expect(vars).toMatch(/--bm-tw-sel-contour-rgb: var\(--pale-rgb\);/);
    expect(vars).toMatch(/--bm-tw-sel-contour-alpha: 0\.95;/);
    expect(css).not.toMatch(/tw-mode-write \.tw-card\.selected\.is-multi-active[^}]*(?:box-shadow|background)/);
  });

  test('轮廓辉光贴合写作卡，编辑态为呼吸动画', () => {
    const fs = require('fs');
    const path = require('path');
    const css = fs.readFileSync(path.resolve(__dirname, '../../styles/scroll-pager.css'), 'utf8');
    expect(css).toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.is-paper-lit::before \{/);
    expect(css).toMatch(/filter: blur\(var\(--tw-paper-spread, 14px\)\)/);
    expect(css).toMatch(/@keyframes tw-paper-breathe/);
    expect(css).toMatch(/50% \{ opacity: var\(--tw-paper-write, 0\.78\); transform: scale\(1\.03\); \}/);
    expect(css).toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.is-paper-lit\.is-breathing::before/);
    expect(css).toMatch(/\.tw-light-paper-dim \{[^}]*z-index: 1;/);
  });

  test('思维子弹轮廓辉光使用 ::after 且不叠加选中描边', () => {
    const fs = require('fs');
    const path = require('path');
    const css = fs.readFileSync(path.resolve(__dirname, '../../styles/scroll-pager.css'), 'utf8');
    expect(css).toMatch(/\.tw-mm-node\.is-paper-lit::after \{/);
    expect(css).toMatch(/\.tw-mm-node\.is-paper-lit\.is-breathing::after/);
    expect(css).toMatch(/\.tw-mm-node\.is-sel,[^}]*outline: none;/);
    expect(css).toMatch(/\.tw-mm-node\.is-sel,[^}]*box-shadow: var\(--shadow-surface\);/);
    expect(css).not.toMatch(/\.tw-mm-node\.is-multi-sel/);
    expect(css).toMatch(/\.is-paper-lit\.is-paper-lit-multi::(before|after)/);
    expect(css).toMatch(/\.is-paper-lit\.is-paper-lit-lite::(before|after)/);
    expect(css).toMatch(/:not\(\.is-paper-lit-multi\):not\(\.is-paper-lit-lite\)\.is-breathing/);
    expect(css).toMatch(/\.scroll-typewriter-feature\.tw-light-paper-on \.tw-mm \{ z-index: 6; \}/);

    const mmCss = fs.readFileSync(path.resolve(__dirname, '../../styles/mindmap.css'), 'utf8');
    // 导图多选沿用写作档的细轮廓：反缩放线宽 + 共享暗色令牌 + 无阴影；paper 模式让位给辉光。
    expect(mmCss).toMatch(/\.scroll-typewriter-feature:not\(\.tw-light-paper-on\) \.tw-mm-node\.is-multi-sel \{[^}]*outline: var\(--tw-sel-hairline, 1px\) solid rgba\(var\(--bm-tw-sel-contour-rgb, var\(--primary-rgb\)\), var\(--bm-tw-sel-contour-alpha, 0\.72\)\)/);
    expect(mmCss).toMatch(/\.scroll-typewriter-feature:not\(\.tw-light-paper-on\) \.tw-mm-node\.is-multi-sel \{[^}]*outline-offset: 0;[^}]*border-color: transparent;[^}]*box-shadow: none;/);
    const mmJs = fs.readFileSync(path.resolve(__dirname, '../handlers/features/mindmapFeature.js'), 'utf8');
    expect(mmJs).toMatch(/setProperty\('--tw-sel-hairline', String\(1 \/ s\) \+ 'px'\)/);
  });

  test('切档清辉光、节点回收清类、备注编辑器接入呼吸', () => {
    const fs = require('fs');
    const path = require('path');
    const mode = fs.readFileSync(path.resolve(__dirname, '../handlers/features/ModeController.js'), 'utf8');
    const mm = fs.readFileSync(path.resolve(__dirname, '../handlers/features/mindmapFeature.js'), 'utf8');
    const card = fs.readFileSync(path.resolve(__dirname, '../handlers/features/CardInteractions.js'), 'utf8');
    expect(mode).toMatch(/typeof ctrl\._clearPaperGlowVisual === 'function'\) ctrl\._clearPaperGlowVisual\(\)/);
    expect(card).toMatch(/selectInRect[\s\S]*_syncPaperGlowSelection/);
    expect(mm).toMatch(/is-editing', 'is-paper-lit', 'is-breathing'/);
    expect(mm).toMatch(/input\.addEventListener\('focus'/);
  });

  test('漫反射/浮起只留给导图与编辑态，写作档单选不再叠加高亮', () => {
    const fs = require('fs');
    const path = require('path');
    const scroll = fs.readFileSync(path.resolve(__dirname, '../../styles/scroll-pager.css'), 'utf8');
    const notes = fs.readFileSync(path.resolve(__dirname, '../../styles/notes.css'), 'utf8');
    const mm = fs.readFileSync(path.resolve(__dirname, '../../styles/mindmap.css'), 'utf8');

    expect(scroll).toMatch(/--bm-tw-sel-halo:/);
    expect(scroll).toMatch(/--bm-tw-sel-lift:/);
    expect(scroll).not.toMatch(/--bm-tw-sel-(?:halo|lift|multi):[^;]*0 0 0 1px/);
    // 写作档单选只保留层级，不再叠加漫反射/浮起/多选阴影/描边。
    expect(scroll).toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.selected \{\s*z-index: 50;\s*\}/);
    expect(scroll).not.toMatch(/tw-mode-write \.tw-card\.selected[^}]*box-shadow/);
    expect(scroll).not.toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.selected \{[^}]*outline/);
    expect(notes).toMatch(/:not\(\.tw-light-paper-on\) \.tw-card\.editing \{[^}]*box-shadow: var\(--bm-tw-sel-edit\)/);
    expect(mm).toMatch(/\.tw-mm-node\.is-sel \{[^}]*box-shadow: var\(--bm-tw-sel-lift\), var\(--bm-tw-sel-halo\)/);
    expect(mm).toMatch(/\.tw-mm-node\.is-editing \{[^}]*box-shadow: var\(--bm-tw-sel-edit\)/);
  });

  test('便签模式去掉选中高亮，控件只在单选后出现', () => {
    const fs = require('fs');
    const path = require('path');
    const notes = fs.readFileSync(path.resolve(__dirname, '../../styles/notes.css'), 'utf8');

    expect(notes).toMatch(/便签档选中态不叠加任何高亮/);
    expect(notes).toMatch(/\.tw-canvas\.tw-mode-notes \.tw-card\.selected \{\s*z-index: 50;/);
    expect(notes).toMatch(/\.bm-sticker\.selected \{\s*outline: none;/);
    expect(notes).not.toMatch(/\.bm-sticker\.selected \{[^}]*filter:/);
    // 写作档工具条/连线锚点也改成「只有选中」驱动，不再吃 hover / focus / 钉住。
    expect(notes).toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.selected:not\(\.is-multi-active\):not\(\.editing\) \.tw-card-tools/);
    expect(notes).toMatch(/\.tw-canvas\.tw-mode-write \.tw-card\.selected:not\(\.is-multi-active\) \.tw-card-link/);
    expect(notes).not.toMatch(/:not\(\.tw-mode-notes\) \.tw-card:hover \.tw-card-(tools|link)/);
    expect(notes).not.toMatch(/\.tw-card\.is-pinned \.tw-card-(tools|link)/);
    expect(notes).toMatch(/\.tw-canvas\.tw-mode-notes \.tw-card\.selected:not\(\.is-multi-active\):not\(\.editing\) \.tw-card-tools/);
    expect(notes).toMatch(/\.tw-canvas\.tw-mode-notes \.tw-card\.selected:not\(\.is-multi-active\) \.tw-card-rotate/);
    expect(notes).toMatch(/\.tw-canvas\.tw-mode-notes \.tw-card\.selected:not\(\.is-multi-active\):not\(\.editing\) \.tw-card-resize/);
    expect(notes).toMatch(/\.bm-sticker\.selected \.bm-sticker-rotate/);
    expect(notes).not.toMatch(/\.bm-sticker:hover \.bm-sticker-(rotate|resize|more)/);
    expect(notes).not.toMatch(/^\.tw-card:hover \.tw-card-tools/m);
  });

  test('主卡用同款轮廓加深标出，不引入角标/底色', () => {
    const fs = require('fs');
    const path = require('path');
    const css = fs.readFileSync(path.resolve(__dirname, '../../styles/scroll-pager.css'), 'utf8');
    expect(css).toMatch(/\.tw-card\.selected\.is-multi-active\.is-sel-anchor:not\(\.editing\) \.tw-card-main \{[^}]*outline-color: rgb\(var\(--bm-tw-sel-contour-rgb/);
    expect(css).not.toMatch(/\.is-sel-anchor[^}]*(?:background|box-shadow|::after)/);
  });

  test('合并主卡按文章 seq 最小者决定，并在批量条上说明', () => {
    const savedWD = global.WritingDoc;
    global.WritingDoc = { selectionChained: () => false };
    try {
      const canvas = document.createElement('div');
      canvas.className = 'tw-canvas';
      document.body.appendChild(canvas);
      const a = document.createElement('div'); a.className = 'tw-card'; a.dataset.id = 'a';
      const b = document.createElement('div'); b.className = 'tw-card'; b.dataset.id = 'b';
      canvas.appendChild(a); canvas.appendChild(b);
      const view = Object.assign(Object.create(feature), {
        _canvas: canvas,
        _selBarEl: null,
        _selected: new Set([a, b]),
        _notes: [{ id: 'a', seq: 2 }, { id: 'b', seq: 1 }],
        _links: [],
        _mode: 'write',
        _noteIndex: () => new Map([['a', { seq: 2 }], ['b', { seq: 1 }]]),
        _materialMarket: null,
        _selBarUntil: 0,
        _selBarGesture: false,
        _selBarGestureOn: () => {},
        _selBarGestureOff: () => {},
        _scheduleSelBarTick: () => {},
        _cancelSelBarTick: () => {},
      });
      view._updateSelBar();
      expect(b.classList.contains('is-sel-anchor')).toBe(true);
      expect(a.classList.contains('is-sel-anchor')).toBe(false);
      expect(canvas.querySelector('.tw-sel-merge').title).toContain('文章顺序最前');
    } finally {
      if (savedWD === undefined) delete global.WritingDoc;
      else global.WritingDoc = savedWD;
    }
  });

  test('浮动条按视口钳制：跨屏选择不会翻到屏外', () => {
    const savedCV = global.CanvasViewport;
    global.CanvasViewport = { getScale: () => 1 };
    try {
      const canvas = document.createElement('div');
      const root = document.createElement('div');
      document.body.appendChild(root); root.appendChild(canvas);
      canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1000, bottom: 1000, width: 1000, height: 1000 });
      root.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1000, bottom: 600, width: 1000, height: 600 });
      const bar = document.createElement('div');
      bar.className = 'tw-sel-bar is-on';
      Object.defineProperty(bar, 'offsetHeight', { value: 30 });
      Object.defineProperty(bar, 'offsetWidth', { value: 200 });
      canvas.appendChild(bar);
      const a = document.createElement('div'); a.dataset.id = 'a';
      const b = document.createElement('div'); b.dataset.id = 'b';
      const view = Object.assign(Object.create(feature), {
        _canvas: canvas,
        _el: root,
        _selBarEl: bar,
        _selected: new Set([a, b]),
        _geo: new Map([['a', { x: 100, y: 0, w: 100, h: 40 }], ['b', { x: 100, y: 900, w: 100, h: 40 }]]),
        _selBarGesture: false,
        _selBarUntil: 0,
        _scheduleSelBarTick: () => {},
      });
      view._tickSelBar(true);
      expect(parseFloat(bar.style.top)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(bar.style.top)).toBeLessThanOrEqual(570);
    } finally {
      if (savedCV === undefined) delete global.CanvasViewport;
      else global.CanvasViewport = savedCV;
    }
  });
});
