/**
 * @jest-environment jsdom
 */
// 回归：整篇导入 / 新建卡必须「立刻」是投影视图，不能等刷新。
//
// 真实缺陷：_spawn 里直接 textEl.textContent = text，而刷新路径 _restore → mountCard
// 走 renderCardText()。于是粘进一篇带 **粗体** / 表格 / 任务项的文章，卡上先显示原始
// markdown 标记，重载后才变成富投影 —— 用户看到的是「输入后不会立马渲染」。
// 本文件把两条路径的口径钉在一起：新建即投影，且与 renderCardText 的结果一致。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
_b1mod('handlers/features/writingDoc.js', 'WritingDoc');
_b1mod('handlers/features/modePolicy.js', 'ModePolicy');
function _b1mod(p, n) { const m = loadModule(p, [n]); if (!global[n]) global[n] = m[n]; }

const { renderCardText } = loadModule('services/ViewportCuller.js', ['renderCardText']);
const { TypewriterFeature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
  FONTS: ['modern'], PAPERS: ['plain'], MARKET_FONTS: [],
  Toast: { showToast: jest.fn() },
  ViewportCuller: { setGeom: jest.fn() },
  CanvasViewport: { getScale: () => 1 },
  MindmapFeature: { teardown: jest.fn() },
  TypewriterStore: { invalidateWritingIndex: jest.fn() },
});

/** 用最小 fake 跑一次真实 _spawn，返回卡上的 .tw-card-text */
function spawnText(md, level, opts = {}) {
  const canvas = document.createElement('div');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 });
  const beeper = document.createElement('div');
  beeper.className = 'tw-beeper';
  const el = document.createElement('div');
  el.appendChild(beeper);
  el.querySelector = (sel) => (sel === '.tw-beeper' ? beeper : null);
  const card = document.createElement('div');
  card.dataset.id = 'new1';
  const textEl = document.createElement('div');
  textEl.className = 'tw-card-text';
  card.appendChild(textEl);

  const fake = {
    _mode: opts.mode || 'write',
    _canvas: canvas,
    _el: el,
    _input: document.createElement('input'),
    _notes: [],
    _mountedCards: new Map(),
    _zTop: 0,
    _fontIdx: 0,
    _paperIdx: 0,
    _spawnIdx: 0,
    _now: () => '2026-01-01',
    _createCardEl: (meta) => { card.dataset.level = (meta && meta.level) || 'p'; return card; },
    _spawnAnchorCard: jest.fn(() => null),
    _measureCard: jest.fn(),
    _refreshWriteOrder: jest.fn(),
    _showScreenMsg: jest.fn(),
    _ensureAudio: jest.fn(),
    _playFeedSound: jest.fn(),
    _scheduleSave: jest.fn(),
    _flushSave: jest.fn(),
    _scheduleCull: jest.fn(),
    _applyLod: jest.fn(),
    _ensureCardVisible: jest.fn(),
    _spawnFrom: jest.fn(),
    _enforceCap: jest.fn(),
    _selected: new Set(),
    _undoStack: null,
    // 生产里由 typewriterFeature._applyCardText 委托 ViewportCuller.applyCardText
    _applyCardText: opts.legacy ? undefined : (node, note) => renderCardText(node, note),
  };
  TypewriterFeature._spawn.call(fake, md, level, { skipWriteOrder: true, skipEnsureVisible: true });
  return textEl;
}

describe('新建 / 整篇导入：立刻投影，不等刷新', () => {
  test('行内格式：卡上是 strong/em/del/mark/code，不是原始标记', () => {
    const t = spawnText('**粗** *斜* ~~删~~ ==亮== `码`', 'p');
    ['strong', 'em', 'del', 'mark', 'code'].forEach((tag) => {
      expect(t.querySelectorAll(tag).length).toBe(1);
    });
    expect(t.textContent).not.toContain('**');
    expect(t.dataset.twRich).toBe('1');
  });

  test('任务卡：立刻是勾选框行，不露出 - [x] 原文', () => {
    const t = spawnText('- [x] 读一章书\n- [ ] 写五百字', 'task');
    expect(t.querySelectorAll('.tw-task-row').length).toBe(2);
    expect(t.querySelectorAll('input[type="checkbox"]').length).toBe(2);
    expect(t.textContent).not.toContain('[x]');
  });

  test('表格 / 围栏：整块成结构，不按纯文本显示', () => {
    const table = spawnText('| 功能 | 预期 |\n|---|---|\n| 粗体 | 只见文字 |', 'table');
    expect(table.querySelector('table')).not.toBeNull();

    const code = spawnText('```js\nconst a = 1;\n```', 'code');
    expect(code.querySelector('pre.tw-md-code')).not.toBeNull();
  });

  test('与刷新路径同口径：_spawn 的 DOM 等于 renderCardText 的结果', () => {
    const note = { text: '**粗体** 与 [链接](https://example.com)', level: 'p' };
    const spawned = spawnText(note.text, 'p');
    const restored = document.createElement('div');
    renderCardText(restored, note);
    expect(spawned.innerHTML).toBe(restored.innerHTML);
  });

  test('纯文本卡仍走快路径，不无故生成富结构', () => {
    const t = spawnText('一句普通的话', 'p');
    expect(t.textContent).toBe('一句普通的话');
    expect(t.dataset.twRich).toBeUndefined();
  });

  test('没有 _applyCardText 的测试桩降级为纯文本，不炸调用方', () => {
    const t = spawnText('**粗体**', 'p', { legacy: true });
    expect(t.textContent).toBe('**粗体**');
  });
});
