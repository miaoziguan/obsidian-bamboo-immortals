/**
 * @jest-environment jsdom
 */
/**
 * 围栏代码块（code）契约：整块成卡、层级识别、块渲染、导出原样透传。
 * 与表格同套机制：splitDraft 先扫「整块结构」区间，绕开逐行切分与超长硬切；
 * 投影只是显示层，data-tw-rich 让编辑/拆卡改认模型。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
global.MindmapFeature = { isActive: () => false };

const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
const { LEVELS, LEVEL_LABELS, LEVEL_GROUPS, LEVEL_LADDER } = loadModule(
  'handlers/features/twConfig.js',
  ['LEVELS', 'LEVEL_LABELS', 'LEVEL_GROUPS', 'LEVEL_LADDER'],
);
const { renderCardText, hasCodeFence, serializeRichText } = loadModule(
  'services/ViewportCuller.js',
  ['renderCardText', 'hasCodeFence', 'serializeRichText'],
);
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);
const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

const FENCE = '```js\nconst a = 1;\nconsole.log(a);\n```';

function mkText() {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  return el;
}
const p = (text) => ({ level: 'p', text });

afterEach(() => { document.body.innerHTML = ''; });

describe('hasCodeFence / detectLevel', () => {
  test('识别反引号与波浪号围栏，普通文本不识别', () => {
    expect(hasCodeFence(FENCE)).toBe(true);
    expect(hasCodeFence('~~~\ncode\n~~~')).toBe(true);
    expect(hasCodeFence('普通 `行内代码`')).toBe(false);
  });

  test('detectLevel 判为 code 并保留完整 markdown（围栏与语言标记都是语义）', () => {
    expect(WritingDoc.detectLevel(FENCE)).toEqual({ level: 'code', text: FENCE });
  });

  test('normalize 保留 code level（LEVELS 白名单不能漏）', () => {
    const res = WritingDoc.normalize([{ id: 'a', seq: 0, text: FENCE, level: 'code' }], [], { x: 0, y: 0 });
    const notes = Array.isArray(res) ? res : ((res && res.notes) || []);
    expect(notes[0].level).toBe('code');
  });
});

describe('splitDraft — 围栏整块成卡', () => {
  test('无空行稿子：代码块不被逐行切碎', () => {
    const chunks = WritingDoc.splitDraft(`开头一句\n${FENCE}\n结尾一句`);
    const codes = chunks.filter((c) => c.level === 'code');
    expect(codes.length).toBe(1);
    expect(codes[0].text).toBe(FENCE);
    expect(chunks.some((c) => c.text === '开头一句')).toBe(true);
    expect(chunks.some((c) => c.text === '结尾一句')).toBe(true);
  });

  test('超 MAX_LEN 的代码块豁免硬切，围栏与代码不分家', () => {
    const long = 'const veryLongLine = 1;\n'.repeat(60);
    const md = '```js\n' + long + '```';
    const chunks = WritingDoc.splitDraft(md, 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('code');
    expect(chunks[0].text).toContain('```js');
    expect(chunks[0].text).toContain('const veryLongLine = 1;');
  });

  test('未闭合围栏也整块成卡，不会散成普通段落', () => {
    const md = '```js\nconst a = 1;\nconst b = 2;';
    const chunks = WritingDoc.splitDraft(md);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('code');
  });

  test('~~~ 围栏由同字符闭合，反引号不能闭合它', () => {
    const chunks = WritingDoc.splitDraft('~~~\ncode\n```\nstill code\n~~~');
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('code');
    expect(chunks[0].text).toContain('still code');
  });
});

describe('renderCardText — 围栏投影', () => {
  test('渲染成 <pre><code>，代码内容原样（** 不被当粗体）', () => {
    const el = mkText();
    renderCardText(el, p('```js\nconst **a** = 1;\n```'));
    const pre = el.querySelector('pre.tw-md-code');
    expect(pre).not.toBeNull();
    expect(pre.dataset.lang).toBe('js');
    expect(pre.querySelector('code').textContent).toBe('const **a** = 1;');
    expect(el.querySelector('strong')).toBeNull();
    expect(el.dataset.twRich).toBe('1');
  });

  test('代码块与文本段混合：文本段仍支持行内格式', () => {
    const el = mkText();
    renderCardText(el, p('说明 **粗体**\n' + FENCE + '\n结尾'));
    expect(el.querySelector('pre.tw-md-code')).not.toBeNull();
    expect(el.querySelector('.tw-md-text strong').textContent).toBe('粗体');
    expect(el.textContent).toContain('结尾');
  });

  test('代码块与表格共存于一张卡', () => {
    const el = mkText();
    renderCardText(el, p('| 列 | 值 |\n|---|---|\n| a | b |\n' + FENCE));
    expect(el.querySelector('table.tw-md-table')).not.toBeNull();
    expect(el.querySelector('pre.tw-md-code')).not.toBeNull();
  });
});

describe('twConfig / 导出 / 样式', () => {
  test('LEVELS / 标签 / 分组都含 code，但不进 LEVEL_LADDER', () => {
    expect(LEVELS).toContain('code');
    expect(LEVEL_LABELS.code).toBe('代码');
    expect(LEVEL_GROUPS.some((g) => g.items.indexOf('code') >= 0)).toBe(true);
    expect(LEVEL_LADDER).not.toContain('code');
    expect(LEVEL_LADDER).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']);
  });

  test('buildCardsMarkdown 对 code 原样透传，不加列表/标题前缀', () => {
    const ctrl = { _notes: [{ id: 'a', seq: 0, text: FENCE, level: 'code' }] };
    const out = ModeController.buildCardsMarkdown({ state: {}, ctrl }, [{ id: 'a' }]);
    expect(out).toContain('```js');
    expect(out).toContain('console.log(a);');
    expect(out).not.toContain('- ```js');
    expect(out).not.toContain('# ```js');
  });

  test('色板与代码样式：亮/暗两套 tint，pre 有等宽排版', () => {
    expect(NOTES_CSS).toMatch(/--bm-tint-src-code:\s*#[0-9A-Fa-f]{6}/);
    expect(NOTES_CSS).toMatch(/--bm-tint-code:\s*var\(--bm-tint-src-code\)/);
    expect(NOTES_CSS).toContain('.tw-level-dot[data-level="code"]');
    expect(NOTES_CSS).toContain(':host(.dark) .tw-canvas.tw-mode-write.tw-lv-tint .tw-card[data-level="code"]');
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-code');
    expect(NOTES_CSS).toContain('white-space: pre;');
  });

  test('着色 token 的样式在 notes.css 里（否则包了 span 也没颜色）', () => {
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-code .tk-kw');
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-code .tk-com');
  });
});

// 着色是纯投影：接线只需保证「包了 span」且「文本/序列化不变」。
// 这里手动注入 paintCode —— 测试 harness 会剥离 import，跑真 bundle 时才自动带上。
describe('语法着色接线（投影层，不出现在 md 里）', () => {
  const HL = loadModule('utils/codeHighlight.js', ['paintCode']);
  afterEach(() => { delete global.paintCode; });

  test('认得语言 → 包 tk-* span，textContent 与序列化都一字不差', () => {
    global.paintCode = HL.paintCode;
    const el = mkText();
    renderCardText(el, p(FENCE));
    const code = el.querySelector('pre.tw-md-code code');
    expect(code.querySelectorAll('span[class^="tk-"]').length).toBeGreaterThan(0);
    expect(code.textContent).toBe('const a = 1;\nconsole.log(a);');
    expect(serializeRichText(el, { level: 'code' })).toBe(FENCE);
  });

  test('不认的语言 → 一个 span 都不包（保持纯文本）', () => {
    global.paintCode = HL.paintCode;
    const el = mkText();
    const md = '```txt\n就是一行输出\n```';
    renderCardText(el, p(md));
    const code = el.querySelector('pre.tw-md-code code');
    expect(code.querySelectorAll('span').length).toBe(0);
    expect(code.textContent).toBe('就是一行输出');
    expect(serializeRichText(el, { level: 'code' })).toBe(md);
  });

  test('编辑中的重投影不塞回 span（如编辑态插入图片后 _applyCardText）', () => {
    global.paintCode = HL.paintCode;
    const el = mkText();
    el.setAttribute('contenteditable', 'true');
    renderCardText(el, p(FENCE));
    expect(el.querySelectorAll('span[class^="tk-"]').length).toBe(0);
    expect(el.querySelector('pre.tw-md-code code').textContent).toBe('const a = 1;\nconsole.log(a);');
  });

  test('没有 paintCode（降级路径）也照常渲染纯文本', () => {
    const el = mkText();
    renderCardText(el, p(FENCE));
    const code = el.querySelector('pre.tw-md-code code');
    expect(code.querySelectorAll('span').length).toBe(0);
    expect(code.textContent).toBe('const a = 1;\nconsole.log(a);');
  });
});
