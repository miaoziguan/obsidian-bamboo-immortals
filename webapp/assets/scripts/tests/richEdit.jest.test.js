/**
 * @jest-environment jsdom
 */
/**
 * 无语法编辑契约：编辑态直接编辑投影 DOM（不露 markdown 语法），
 * 由 serializeRichText 反向写回模型。两条底线：
 *   ① 结构不丢（marker / 缩进 / 表格分隔行 / 代码语言 / 勾选态 / 行内格式 / A 类语法）；
 *   ② 投影 → 序列化 → 再投影 → 再序列化 必须稳定（不能每次编辑都漂移）。
 */
const { loadModule } = require('./__helpers__/testUtils');

const { renderCardText, serializeRichText } = loadModule(
  'services/ViewportCuller.js',
  ['renderCardText', 'serializeRichText'],
);

// 交互层最小桩：只测「无语法编辑」的三条回写路径，不牵动整套 feature
global.WritingDoc = {
  setText: (notes, id, text) => notes.map((n) => (n.id === id ? Object.assign({}, n, { text }) : n)),
};
global.fitCardText = () => 1;
const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions']);

function project(text, level = 'p') {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  renderCardText(el, { level, text });
  return el;
}
const serialize = (el, level) => serializeRichText(el, { level });

afterEach(() => { document.body.innerHTML = ''; });

const CASES = [
  { name: '行内格式', level: 'p', md: '这是 **粗体** 和 `码` 和 [文档](https://x.com/a) 与 ~~删~~', keep: ['**粗体**', '`码`', '[文档](https://x.com/a)', '~~删~~'] },
  { name: '任务清单', level: 'task', md: '- [x] 读一章书\n- [ ] 写五百字', keep: ['- [x] 读一章书', '- [ ] 写五百字'] },
  { name: '无序嵌套', level: 'ul', md: '外层一\n- 外层二\n  - 内层一', keep: ['- 外层', '  - 内层一'] },
  { name: '有序列表', level: 'ol', md: '1. 打开写作档\n2. 粘贴本检测稿', keep: ['1. 打开写作档', '2. 粘贴本检测稿'] },
  { name: '有序嵌套', level: 'ol', md: '1. 外层第一项\n2. 外层第二项\n   1. 内层也能编号', keep: ['1. 外层第一项', '   1. 内层也能编号'] },
  { name: '多行引用', level: 'quote', md: '引一\n> 引二\n> 引三', keep: ['> 引一', '> 引二'] },
  { name: '引用内列表', level: 'quote', md: '引用说明\n> - 无序项一\n> - 无序项二', keep: ['> 引用说明', '> - 无序项一'] },
  { name: 'callout', level: 'quote', md: '[!note] 提示标题\n> 正文一行', keep: ['> [!note] 提示标题', '> 正文一行'] },
  { name: '表格', level: 'p', md: '| 列 | 值 |\n|---|---|\n| a | b |', keep: ['| 列 | 值 |', '|---|---|', '| a | b |'] },
  { name: '表格对齐', level: 'p', md: '| a | b | c |\n|:---:|---:|:---|\n| 1 | 2 | 3 |', keep: [':---:', '---:'] },
  { name: '围栏代码', level: 'p', md: '```js\nconst a = 1;\n```', keep: ['```js', 'const a = 1;', '```'] },
  { name: 'A 类语法', level: 'p', md: '带 #写作/随笔 与 [[季度复盘|复盘]] 与 %%隐藏%% 与 ^blk1', keep: ['#写作/随笔', '[[季度复盘|复盘]]', '%%隐藏%%', '^blk1'] },
];

describe('投影 → markdown 反向序列化', () => {
  CASES.forEach((c) => {
    test(`${c.name}：结构不丢且二次往返稳定`, () => {
      const el = project(c.md, c.level);
      expect(el.dataset.twRich).toBe('1');
      const md2 = serialize(el, c.level);
      c.keep.forEach((k) => expect(md2).toContain(k));

      // 幂等：再投影再序列化，结果必须一致（否则每次编辑都会让模型漂移）
      const el2 = project(md2, c.level);
      expect(serialize(el2, c.level)).toBe(md2);
    });
  });
});

describe('编辑态改动能反映到模型', () => {
  test('改任务文字 + 勾选：序列化保留 marker 与最新文字', () => {
    const el = project('- [ ] 写五百字', 'task');
    el.querySelector('.tw-task-label').textContent = '写八百字';
    el.querySelector('.tw-task-cb').checked = true;
    expect(serialize(el, 'task')).toBe('- [x] 写八百字');
  });

  test('改表格单元格：分隔行与列结构不丢', () => {
    const el = project('| 列 | 值 |\n|---|---|\n| a | b |');
    el.querySelector('tbody td').textContent = '改过了';
    const out = serialize(el, 'p');
    expect(out).toContain('| 改过了 | b |');
    expect(out).toContain('|---|---|');
  });

  test('改列表文字：编号与缩进不丢', () => {
    const el = project('1. 外层\n2. 第二项\n   1. 内层', 'ol');
    el.querySelectorAll('.tw-md-list')[0].lastChild.textContent = '改过的外层';
    const out = serialize(el, 'ol');
    expect(out).toContain('1. 改过的外层');
    expect(out).toContain('   1. 内层');
  });

  test('改引用文字：每行补回 > 前缀', () => {
    const el = project('引一\n> 引二', 'quote');
    el.querySelector('.tw-md-quote').firstChild.textContent = '改过的引一';
    expect(serialize(el, 'quote')).toBe('> 改过的引一\n> 引二');
  });

  test('改代码块内容：围栏与语言标记保留', () => {
    const el = project('```js\nconst a = 1;\n```');
    el.querySelector('pre code').textContent = 'const b = 2;';
    expect(serialize(el, 'p')).toBe('```js\nconst b = 2;\n```');
  });

  test('代码块里回车产生的 <br> 还原成换行，不压成一行', () => {
    const el = project('```js\na\n```');
    el.querySelector('pre code').innerHTML = 'a<br>b';   // contenteditable 回车后的真实形态
    expect(serialize(el, 'p')).toBe('```js\na\nb\n```');
  });

  test('富卡里回车产生的 <div> 段落不被压成一行', () => {
    const el = project('**甲**', 'p');
    el.innerHTML = '<div><strong>甲</strong></div><div>乙</div>';
    expect(serialize(el, 'p')).toBe('**甲**\n乙');
  });

  test('表格单元格内回车不断开表格（换行压成空格）', () => {
    const el = project('| 列 | 值 |\n|---|---|\n| a | b |');
    el.querySelectorAll('td')[1].innerHTML = 'b<br>c';
    expect(serialize(el, 'p')).toBe('| 列 | 值 |\n|---|---|\n| a | b c |');
  });

  test('列表项删光后在卡片里打的字转成新的一项，而不是消失', () => {
    const el = project('- 甲', 'ul');
    el.innerHTML = '';
    el.appendChild(document.createTextNode('乙'));
    expect(serialize(el, 'ul')).toBe('- 乙');
  });

  test('引用块里回车产生的 <div> 分段不被压成一行', () => {
    const el = project('> 甲', 'quote');
    el.querySelector('.tw-md-quote').innerHTML = '<div>甲</div><div>乙</div>';
    expect(serialize(el, 'quote')).toBe('> 甲\n> 乙');
  });

  test('marker 与复选框不可编辑：光标进不去，字就不会被当装饰丢掉', () => {
    const ul = project('- 甲', 'ul');
    expect(ul.querySelector('.tw-md-marker').getAttribute('contenteditable')).toBe('false');
    const task = project('- [ ] 甲', 'task');
    expect(task.querySelector('.tw-task-cb').getAttribute('contenteditable')).toBe('false');
    const quote = project('> [!note] 标题', 'quote');
    expect(quote.querySelector('.tw-md-callout-badge').getAttribute('contenteditable')).toBe('false');
  });

  test('万一光标钻进 marker 打了字，序列化不能把它当装饰一起吞掉', () => {
    const el = project('- 甲', 'ul');
    el.querySelector('.tw-md-marker').textContent = '乙';   // 模拟标记内被输入
    expect(serialize(el, 'ul')).toContain('乙');
  });
});

describe('编辑态端到端：不露语法、写回不丢结构', () => {
  function editFixture(md, level = 'p') {
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'a';
    const text = document.createElement('div');
    text.className = 'tw-card-text';
    card.appendChild(text);
    document.body.appendChild(card);
    renderCardText(text, { level, text: md });
    const ctrl = {
      _notes: [{ id: 'a', seq: 0, level, text: md }],
      _exitAllEdits: () => {},
      _scheduleSave: () => {},
      _serializeCardText: (el, note) => serializeRichText(el, note),
      _applyCardText: (el, note) => renderCardText(el, note),
      _invalidateGeo: () => {},
    };
    return { card, text, ctrl, ctx: { state: {}, ctrl } };
  }

  test('进入编辑态保留投影 DOM，不再被 textContent 冲成原始 markdown', () => {
    const { card, text, ctx } = editFixture('- [x] 读一章书', 'task');
    expect(text.dataset.twRich).toBe('1');
    CardInteractions.enterEdit(ctx, card);
    expect(text.getAttribute('contenteditable')).toBe('true');
    expect(text.querySelector('.tw-task-cb')).not.toBeNull();
    expect(text.textContent).not.toContain('- [x]');
  });

  test('退出编辑：改过的文字与勾选态写回模型，marker 由序列化补回', () => {
    const { card, text, ctrl, ctx } = editFixture('- [ ] 写五百字', 'task');
    CardInteractions.enterEdit(ctx, card);
    text.querySelector('.tw-task-label').textContent = '写八百字';
    text.querySelector('.tw-task-cb').checked = true;
    CardInteractions.exitEdit(ctx, card);
    expect(ctrl._notes[0].text).toBe('- [x] 写八百字');
    expect(text.querySelector('.tw-task-cb')).not.toBeNull();   // 退出后重新投影
  });

  test('连续输入：富渲染卡写回序列化结果，不是 innerText（表格结构不丢）', () => {
    const { card, text, ctrl } = editFixture('| 列 | 值 |\n|---|---|\n| a | b |');
    text.querySelector('tbody td').textContent = '改过了';
    CardInteractions._handleEditInput(ctrl, card, { isComposing: false });
    expect(ctrl._notes[0].text).toContain('|---|');
    expect(ctrl._notes[0].text).toContain('| 改过了 | b |');
    expect(text.querySelector('table')).not.toBeNull();         // 投影 DOM 没被上限逻辑冲掉
  });
});

// 代码块着色只在「看」的时候存在：进编辑先拍平成纯文本（否则新打的字继承 token 颜色、
// 着色又不随输入重算，看着像坏）。文本一点不变，退出编辑按新模型重绘。
describe('编辑态：代码块着色先拍平', () => {
  const HL = loadModule('utils/codeHighlight.js', ['paintCode', 'plainifyCodeBlocks']);
  afterEach(() => { delete global.paintCode; delete global.plainifyCodeBlocks; });

  function fenceFixture(md) {
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'a';
    const text = document.createElement('div');
    text.className = 'tw-card-text';
    card.appendChild(text);
    document.body.appendChild(card);
    renderCardText(text, { level: 'code', text: md });
    const ctrl = {
      _notes: [{ id: 'a', seq: 0, level: 'code', text: md }],
      _exitAllEdits: () => {},
      _scheduleSave: () => {},
      _serializeCardText: (el, note) => serializeRichText(el, note),
      _applyCardText: (el, note) => renderCardText(el, note),
      _invalidateGeo: () => {},
    };
    return { card, text, ctrl, ctx: { state: {}, ctrl } };
  }

  test('进入编辑去掉 span、文本不变；退出编辑 md 逐字不变', () => {
    global.paintCode = HL.paintCode;
    const md = '```js\nconst a = 1; // 注释\n```';
    const { card, text, ctrl, ctx } = fenceFixture(md);
    expect(text.querySelectorAll('span[class^="tk-"]').length).toBeGreaterThan(0);

    global.plainifyCodeBlocks = HL.plainifyCodeBlocks;
    CardInteractions.enterEdit(ctx, card);
    expect(text.querySelectorAll('span[class^="tk-"]').length).toBe(0);
    expect(text.querySelector('pre.tw-md-code code').textContent).toBe('const a = 1; // 注释');
    expect(text.querySelector('pre.tw-md-code').dataset.lang).toBe('js');

    CardInteractions.exitEdit(ctx, card);
    expect(ctrl._notes[0].text).toBe(md);
  });

  test('没有 plainifyCodeBlocks（降级路径）也能正常进入编辑', () => {
    global.paintCode = HL.paintCode;
    const { card, text, ctx } = fenceFixture('```js\nconst a = 1;\n```');
    CardInteractions.enterEdit(ctx, card);
    expect(text.getAttribute('contenteditable')).toBe('true');
  });
});
