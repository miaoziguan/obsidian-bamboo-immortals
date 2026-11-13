/**
 * @jest-environment jsdom
 */
/**
 * Markdown marker 往返契约（防「同类问题」复发）：
 *   每种块都走一遍  splitDraft（成块定级） → buildCardsMarkdown（导出） → splitDraft（再成块）。
 * 不变量：
 *   ① 导出不得产生重复前缀（> > / - - / 1. 2. / ### ### / - [ ] - [x]）；
 *   ② 导出后重新成块，层级不能漂移；
 *   ③ 原文里的关键信息（编号、引用内容、嵌套项）不能消失。
 * 历史背景：detectLevel 曾把首行 marker 当装饰剥掉；导出又对每行无脑加前缀，
 * 于是 ol 丢首行 `1. `、quote 多行变成 `> > ...`。这里把所有 level 一次性钉死。
 */
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
global.MindmapFeature = { isActive: () => false };

const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);
const { renderCardText } = loadModule('services/ViewportCuller.js', ['renderCardText']);

function exportNotes(notes) {
  const ctrl = { _notes: notes };
  return ModeController.buildCardsMarkdown({ state: {}, ctrl }, notes.map((n) => ({ id: n.id })));
}

function exportOne(note) {
  return exportNotes([Object.assign({ id: 'a', seq: 0 }, note)]);
}

const CASES = [
  { name: '标题 h2 带说明', src: '## 二、每日写作流程\n这是说明段落', level: 'h2', keep: '二、每日写作流程' },
  { name: '多行引用', src: '> 工欲善其事，必先利其器。\n> 卡片写作把段落变成卡\n> 比起在长文档里滚来滚去', level: 'quote', keep: '卡片写作把段落变成卡' },
  { name: '引用内嵌列表', src: '> 引用块里也可以出现列表吗？\n> - 引用内的无序项一\n> - 引用内的无序项二', level: 'quote', keep: '引用内的无序项一' },
  { name: '无序列表 + 嵌套', src: '- 先写骨架，再填血肉\n- 每个论点单独成卡\n  - 嵌套层级也能识别', level: 'ul', keep: '嵌套层级也能识别' },
  { name: '有序列表', src: '1. 打开写作档\n2. 粘贴本检测稿\n3. 逐张核对类型与配色', level: 'ol', keep: '1. 打开写作档' },
  { name: '有序嵌套', src: '1. 外层第一项\n2. 外层第二项\n   1. 内层也能编号', level: 'ol', keep: '内层也能编号' },
  { name: '任务列表', src: '- [x] 读一章书\n- [ ] 写五百字', level: 'task', keep: '- [x] 读一章书' },
  { name: '表格', src: '| 列 | 值 |\n|---|---|\n| a | b |', level: 'table', keep: '|---|---|' },
  { name: '围栏代码', src: '```js\nconst a = 1;\n```', level: 'code', keep: 'const a = 1;' },
  { name: '正文', src: '普通段落。', level: 'p', keep: '普通段落。' },
];

describe('marker 往返：成块 → 导出 → 再成块', () => {
  CASES.forEach((c) => {
    test(`${c.name}：无重复前缀、层级不漂移、关键信息不丢`, () => {
      const chunks = WritingDoc.splitDraft(c.src, 500);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].level).toBe(c.level);

      const out = exportOne(chunks[0]);
      expect(out).not.toMatch(/^[ \t]*> > /m);              // 引用重复前缀
      expect(out).not.toMatch(/^[ \t]*- - /m);              // 无序重复 bullet
      expect(out).not.toMatch(/\d+\.\s+\d+\.\s/);          // 有序重复编号
      expect(out).not.toMatch(/^#{1,6}\s+#{1,6}\s/m);      // 标题重复 #
      expect(out).not.toMatch(/- \[ \] - \[[ xX]\]/);      // task 重复 marker
      expect(out).toContain(c.keep);

      const again = WritingDoc.splitDraft(out, 500);
      expect(again.length).toBeGreaterThan(0);
      expect(again[0].level).toBe(c.level);                // 层级不漂移
    });
  });
});

describe('编辑态 / 老数据写回带 marker 时，导出不重复加前缀', () => {
  test('标题卡模型里已带 ## 不导出成 ## ## 标题', () => {
    const out = exportOne({ level: 'h2', text: '## 二、每日写作流程' });
    expect(out).toContain('## 二、每日写作流程');
    expect(out).not.toMatch(/^#{1,6}\s+#{1,6}\s/m);
  });

  test('引用卡模型里每行已带 > 不导出成 > >', () => {
    const out = exportOne({ level: 'quote', text: '> 引一\n> 引二' });
    expect(out).toContain('> 引一\n> 引二');
    expect(out).not.toMatch(/^[ \t]*> > /m);
  });
});

describe('拆卡（splitNote）不再抹平信息', () => {
  test('嵌套列表卡拆分后相对缩进保留', () => {
    const notes = [{ id: 'a', seq: 0, level: 'ul', text: '- 外层\n  - 内层\n\n另一段' }];
    const out = WritingDoc.splitNote(notes, 'a');
    expect(out.length).toBe(2);
    expect(out[0].text).toContain('  - 内层');
  });

  test('列表 / 引用卡拆出的段沿用原层级（编号与勾选态不退化）', () => {
    const ol = WritingDoc.splitNote([{ id: 'a', seq: 0, level: 'ol', text: '1. 甲\n2. 乙' }], 'a');
    expect(ol.length).toBe(2);
    expect(ol[1].level).toBe('ol');
    const task = WritingDoc.splitNote([{ id: 'b', seq: 0, level: 'task', text: '- [x] 一\n- [ ] 二' }], 'b');
    expect(task[1].level).toBe('task');
    expect(task[1].text).toContain('- [ ]');
  });

  test('标题卡拆出的说明段仍降为 p（既有契约）', () => {
    const out = WritingDoc.splitNote([{ id: 'h', seq: 0, level: 'h2', text: '标题\n\n正文一' }], 'h');
    expect(out[0].level).toBe('h2');
    expect(out[1].level).toBe('p');
  });

  test('表格 / 围栏代码块禁止拆分，结构不会被逐行拆碎', () => {
    const table = [{ id: 't', seq: 0, level: 'table', text: '| 列 | 值 |\n|---|---|\n| a | b |' }];
    expect(WritingDoc.splitNote(table, 't')).toBe(table);
    const code = [{ id: 'c', seq: 0, level: 'code', text: '```js\nconst a = 1;\n```' }];
    expect(WritingDoc.splitNote(code, 'c')).toBe(code);
  });
});

describe('合并卡 / 单块定级口径', () => {
  test('合并不同层级的卡降为正文级，导出不给普通段落编号', () => {
    const notes = [
      { id: 'a', seq: 0, level: 'ol', text: '1. 甲' },
      { id: 'b', seq: 1, level: 'p', text: '普通段落' },
    ];
    const r = WritingDoc.mergeNotes(notes, [], ['a', 'b']);
    expect(r.notes[0].level).toBe('p');
    expect(exportOne(r.notes[0])).not.toMatch(/\d+\.\s*普通段落/);
  });

  test('合并同层级列表卡仍保持列表级', () => {
    const notes = [
      { id: 'a', seq: 0, level: 'ol', text: '1. 甲' },
      { id: 'b', seq: 1, level: 'ol', text: '2. 乙' },
    ];
    expect(WritingDoc.mergeNotes(notes, [], ['a', 'b']).notes[0].level).toBe('ol');
  });

  test('带公共缩进的单块草稿归一化后仍是 ol（单块打印的唯一真源）', () => {
    const chunks = WritingDoc.splitDraft('  1. 项', 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('ol');
    expect(chunks[0].text).toBe('1. 项');
  });
});

describe('ol 编号：卡片与整篇预览/导出必须一致', () => {
  test('已有编号的 ol 卡不参与跨卡累加，预览不会变成 5. 6.', () => {
    const notes = [
      { id: 'p', seq: 0, level: 'ol', text: '1. 一\n2. 二\n3. 三\n4. 四' },
      { id: 'q', seq: 1, level: 'ol', text: '1. 外层第一项\n2. 外层第二项\n   1. 内层也能编号' },
    ];
    const out = exportNotes(notes);
    expect(out).toContain('1. 外层第一项');
    expect(out).toContain('2. 外层第二项');
    expect(out).toContain('   1. 内层也能编号');
    expect(out).not.toMatch(/[5-9]\. 外层第一项/);
  });

  test('多张有编号的 ol 卡各自从 1 开始，且与卡片投影显示的编号一致', () => {
    const notes = [
      { id: 'a', seq: 0, level: 'ol', text: '1. 甲\n2. 乙' },
      { id: 'b', seq: 1, level: 'ol', text: '1. 丙\n2. 丁' },
    ];
    const out = exportNotes(notes);
    expect(out).toContain('1. 甲\n2. 乙');
    expect(out).toContain('1. 丙\n2. 丁');
    expect(out).not.toContain('3. 丙');

    const el = document.createElement('div');
    el.className = 'tw-card-text';
    renderCardText(el, notes[1]);
    const markers = Array.from(el.querySelectorAll('.tw-md-marker')).map((n) => n.textContent);
    expect(markers).toEqual(['1.', '2.']);
    expect(out).toContain(markers[0] + ' 丙');
    expect(out).toContain(markers[1] + ' 丁');
  });

  test('圆括号编号 1) 也原样保留，不被改成 N.', () => {
    const out = exportNotes([{ id: 'a', seq: 0, level: 'ol', text: '1) 圆括号编号\n2) 第二种写法' }]);
    expect(out).toContain('1) 圆括号编号');
    expect(out).toContain('2) 第二种写法');
  });

  test('老数据（无编号纯文本）仍按跨卡累加补号（既有回归）', () => {
    const out = exportNotes([
      { id: 'a', seq: 0, level: 'ol', text: '甲\n乙' },
      { id: 'b', seq: 1, level: 'ol', text: '丙' },
    ]);
    expect(out).toContain('1. 甲');
    expect(out).toContain('2. 乙');
    expect(out).toContain('3. 丙');
  });
});
