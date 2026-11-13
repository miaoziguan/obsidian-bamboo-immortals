/**
 * @jest-environment jsdom
 */
/**
 * 列表卡显示投影契约：ul/ol 卡片不再露原始 `- ` / `1. ` 字符，
 * 改为 bullet / 编号 + 缩进层级；ol 的编号是信息，必须照常显示。
 * 模型仍是原始 markdown 单一真源，故这类卡必须打 data-tw-rich。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const { renderCardText } = loadModule('services/ViewportCuller.js', ['renderCardText']);
const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

function mkText(text, level) {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  renderCardText(el, { level, text });
  return el;
}
const markers = (el) => Array.from(el.querySelectorAll('.tw-md-marker')).map((n) => n.textContent);
const rows = (el) => Array.from(el.querySelectorAll('.tw-md-list'));

afterEach(() => { document.body.innerHTML = ''; });

describe('ul 列表投影', () => {
  test('首行（模型已剥 marker）与后续行都显示 bullet，不残留 - 字符', () => {
    const el = mkText('先写骨架\n- 每个论点单独成卡\n- 最后做减法', 'ul');
    expect(markers(el)).toEqual(['•', '•', '•']);
    expect(el.textContent).not.toMatch(/^[-*]\s|[-*]\s+每个/);
    expect(el.textContent).toContain('先写骨架');
    expect(el.textContent).toContain('每个论点单独成卡');
  });

  test('嵌套缩进映射成 padding-left 层级', () => {
    const el = mkText('外层\n- 外层二\n  - 内层\n    - 更深层', 'ul');
    const rs = rows(el);
    expect(rs.length).toBe(4);
    expect(rs[0].style.getPropertyValue('padding-left')).toBe('');
    expect(parseFloat(rs[2].style.getPropertyValue('padding-left'))).toBeGreaterThan(0);
    expect(parseFloat(rs[3].style.getPropertyValue('padding-left')))
      .toBeGreaterThan(parseFloat(rs[2].style.getPropertyValue('padding-left')));
  });

  test('星号 marker 也归一成 bullet，行内格式仍生效', () => {
    const el = mkText('带 **粗体**\n* 第二项', 'ul');
    expect(markers(el)).toEqual(['•', '•']);
    expect(el.querySelector('.tw-md-list strong').textContent).toBe('粗体');
  });
});

describe('ol 列表投影', () => {
  test('编号 1. 2. 3. 完整显示，首行不丢', () => {
    const el = mkText('1. 打开写作档\n2. 粘贴本检测稿\n3. 逐张核对类型与配色', 'ol');
    expect(markers(el)).toEqual(['1.', '2.', '3.']);
    expect(el.textContent).toContain('打开写作档');
  });

  test('圆括号编号保留原写法，嵌套项保留自己的编号与缩进', () => {
    const el = mkText('1) 外层一\n2) 外层二\n   1. 内层也能编号', 'ol');
    expect(markers(el)).toEqual(['1)', '2)', '1.']);
    expect(parseFloat(rows(el)[2].style.getPropertyValue('padding-left'))).toBeGreaterThan(0);
  });
});

describe('分支优先级与模型保护', () => {
  test('列表投影卡打 data-tw-rich（编辑/拆卡改认模型）', () => {
    expect(mkText('a\n- b', 'ul').dataset.twRich).toBe('1');
    expect(mkText('1. a\n2. b', 'ol').dataset.twRich).toBe('1');
  });

  test('task 卡仍优先走勾选框，不被列表分支抢走', () => {
    const el = mkText('- [x] 读一章书\n- [ ] 写五百字', 'task');
    expect(el.querySelector('.tw-task-cb')).not.toBeNull();
    expect(el.querySelector('.tw-md-list')).toBeNull();
  });

  test('正文 / 引用 / 表格卡不受影响', () => {
    const p = mkText('普通正文\n第二行', 'p');
    expect(p.querySelector('.tw-md-list')).toBeNull();
    expect(p.dataset.twRich).toBeUndefined();
    const q = mkText('引一\n> 引二', 'quote');
    expect(q.querySelector('.tw-md-quote')).not.toBeNull();
    expect(q.querySelector('.tw-md-list')).toBeNull();
    const t = mkText('| 列 | 值 |\n|---|---|\n| a | b |', 'p');
    expect(t.querySelector('table.tw-md-table')).not.toBeNull();
  });

  test('CSS 契约：marker 定宽、主题色、等宽数位', () => {
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-marker');
    expect(NOTES_CSS).toMatch(/\.tw-card-text \.tw-md-marker \{[^}]*min-width:/);
    expect(NOTES_CSS).toMatch(/\.tw-card-text \.tw-md-marker \{[^}]*tabular-nums/);
  });
});
