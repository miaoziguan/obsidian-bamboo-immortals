/**
 * @jest-environment jsdom
 */
// P2：三档「差异真源」modePolicy —— 档位语义集中查表，不再散落 if (_mode === 'x')。
// 另实证 applyModeChrome 的抬头 / 元信息 / 机身键语义确实由表驱动。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);   // 副作用：ICON_* / MAX_LEN 等挂 globalThis
const mp = loadModule('handlers/features/modePolicy.js', ['ModePolicy', 'MODE_POLICY', 'META_IDS']);
global.ModePolicy = mp.ModePolicy;
global.MODE_POLICY = mp.MODE_POLICY;
global.META_IDS = mp.META_IDS;
const { ModePolicy, MODE_POLICY, META_IDS } = mp;

const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);

test('三档齐备：文档种类 / 元信息条 / 机身键语义一档一套，互不重复', () => {
  const metas = [];
  ['notes', 'write', 'mindmap'].forEach((m) => {
    const p = MODE_POLICY[m];
    expect(p && p.id).toBe(m);
    expect(p.docKind).toBe(m);
    expect(META_IDS).toContain(p.meta);
    metas.push(p.meta);
    ['paper', 'font', 'arrange', 'print'].forEach((k) => {
      expect(typeof p.buttons[k].title).toBe('string');
      expect(p.buttons[k].title.length).toBeGreaterThan(0);
    });
  });
  expect(new Set(metas).size).toBe(3);       // 元信息条一档一条
});

test('装饰归属：贴纸只归便签档；写作档输入框用草稿箱上限', () => {
  expect(ModePolicy.ownsStickers('notes')).toBe(true);
  expect(ModePolicy.ownsStickers('write')).toBe(false);
  expect(ModePolicy.ownsStickers('mindmap')).toBe(false);
  expect(MODE_POLICY.write.input.maxLen).toBeGreaterThan(MODE_POLICY.notes.input.maxLen);
});

test('docKind / isMode / next 拨齿与兜底', () => {
  expect(ModePolicy.docKind('write')).toBe('write');
  expect(ModePolicy.docKind('nope')).toBe(null);
  expect(ModePolicy.isMode('notes')).toBe(true);
  expect(ModePolicy.isMode('nope')).toBe(false);
  expect(ModePolicy.next('notes', 1)).toBe('write');
  expect(ModePolicy.next('notes', -1)).toBe('mindmap');
  expect(ModePolicy.next('mindmap', 1)).toBe('notes');
  expect(ModePolicy.of('nope').id).toBe('notes');   // 未知档位回退便签
});

/** 把图标字符串过一遍 DOM 序列化，与 el.innerHTML 的表示对齐 */
function renderIcon(icon) {
  const d = document.createElement('div');
  d.innerHTML = icon;
  return d.innerHTML;
}

function fakeCtrl(mode) {
  const root = document.createElement('div');
  root.innerHTML =
    '<span id="twScreenTitle"></span>' +
    '<span id="twMetaNotes"></span><span id="twMetaWrite"></span><span id="twMetaMindmap"></span>' +
    '<button id="twPaper"></button><button id="twFont"></button><button id="twArrange"></button>' +
    '<button id="twPrint"></button><button id="twDocCorner"></button>';
  document.body.appendChild(root);
  const input = document.createElement('input');
  return {
    _el: root, _mode: mode, _input: input, _draft: {},
    _ensureDocCorner: jest.fn(),
    _refreshDocBtnLabel: jest.fn().mockResolvedValue(undefined),
    _refreshScreenMeta: jest.fn(),
    _syncDecoLayer: jest.fn(),
    _getDocKind() { return ModePolicy.docKind(this._mode); },
  };
}

test('applyModeChrome：抬头 / 元信息 / 机身键语义由策略表驱动', () => {
  const cases = [
    ['notes', '凝墨成笺', '#twMetaNotes', '切换便签样式'],
    ['write', '列锦成文', '#twMetaWrite', '整篇预览'],
    ['mindmap', '枝连成图', '#twMetaMindmap', '切换子弹样式'],
  ];
  cases.forEach(([mode, title, metaId, paperAria]) => {
    document.body.innerHTML = '';
    const ctrl = fakeCtrl(mode);
    const P = MODE_POLICY[mode];
    ModeController.applyModeChrome({ state: {}, ctrl });

    expect(ctrl._el.querySelector('#twScreenTitle').textContent).toBe(title);
    // 元信息：当前档位那条可见，其余隐藏
    META_IDS.forEach((id) => {
      expect(ctrl._el.querySelector(id).hidden).toBe(id !== metaId);
    });
    // 机身键：纸样键的语义随档位变（aria 取自策略表）
    expect(ctrl._el.querySelector('#twPaper').getAttribute('aria-label')).toBe(paperAria);
    expect(P.buttons.paper.aria).toBe(paperAria);
    // 图标比对走同一套序列化（innerHTML 会把自闭合 <path/> 展开成 <path></path>）
    expect(ctrl._el.querySelector('#twPaper').innerHTML).toBe(renderIcon(P.buttons.paper.icon));
    expect(ctrl._el.querySelector('#twFont').innerHTML).toBe(renderIcon(P.buttons.font.icon));
    expect(ctrl._el.querySelector('#twArrange').innerHTML).toBe(renderIcon(P.buttons.arrange.icon));
    // 输入框随档位切换上限与 placeholder
    expect(ctrl._input.maxLength).toBe(P.input.maxLen);
    expect(ctrl._input.placeholder).toBe(P.screen.ph);
    expect(ctrl._syncDecoLayer).toHaveBeenCalled();   // 装饰层随档位同步（P1 接线仍在）
  });
});
