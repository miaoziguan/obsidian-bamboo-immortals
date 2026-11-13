/**
 * @jest-environment jsdom
 */
/**
 * 引用卡显示投影契约：卡片上不该露出半截 `>` 字符、也不该「首行无 marker、后续行有」。
 * 模型（note.text）保持原始 markdown 单一真源，故投影卡必须打 data-tw-rich，
 * 让编辑 / 拆卡路径改认模型，避免把剥掉 `> ` 后的文本回写进 note.text。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const { renderCardText } = loadModule('services/ViewportCuller.js', ['renderCardText']);
const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

function mkText(text, level = 'quote') {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  renderCardText(el, { level, text });
  return el;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('引用卡 · 显示投影', () => {
  test('多行引用：所有行都剥掉 > ，首行与后续行视觉统一', () => {
    const el = mkText('工欲善其事，必先利其器。\n> 卡片写作把段落变成卡\n> 比起在长文档里滚来滚去');
    const box = el.querySelector('.tw-md-quote');
    expect(box).not.toBeNull();
    expect(el.querySelector('.tw-md-quote').textContent).not.toContain('>');
    expect(box.textContent).toContain('工欲善其事，必先利其器。');
    expect(box.textContent).toContain('卡片写作把段落变成卡');
    expect(box.querySelectorAll('br').length).toBe(2);
  });

  test('投影卡打 data-tw-rich（模型仍是原始 markdown，编辑/拆卡改认模型）', () => {
    const el = mkText('引一\n> 引二');
    expect(el.dataset.twRich).toBe('1');
    expect(el.textContent).not.toContain('>');   // 正因如此不能拿 innerText 回写
  });

  test('编辑态写回的老数据：首行也带 > 时同样统一剥掉', () => {
    const box = mkText('> 引一\n> 引二').querySelector('.tw-md-quote');
    expect(box.querySelectorAll('br').length).toBe(1);   // <br> 的 textContent 不含 \n
    expect(box.childNodes[0].textContent).toBe('引一');
    expect(box.lastChild.textContent).toBe('引二');
  });

  test('引用内嵌列表：bullet 投影生效，不再露出 - 字符', () => {
    const el = mkText('引用块里也可以出现列表吗？\n> - 引用内的无序项一\n> - 引用内的无序项二');
    const box = el.querySelector('.tw-md-quote');
    expect(box.textContent).not.toContain('>');
    expect(box.textContent).not.toContain('- 引用内');
    expect(box.querySelectorAll('.tw-md-list').length).toBe(2);
    expect(Array.from(box.querySelectorAll('.tw-md-marker')).map((n) => n.textContent)).toEqual(['•', '•']);
    expect(box.textContent).toContain('引用内的无序项一');
  });

  test('引用内有序列表：编号照常显示', () => {
    const el = mkText('引用里的说明\n> 1. 第一项\n> 2. 第二项');
    expect(Array.from(el.querySelectorAll('.tw-md-marker')).map((n) => n.textContent)).toEqual(['1.', '2.']);
  });

  test('普通行与列表行混排：不产生多余 <br>，顺序与内容不乱', () => {
    const el = mkText('引一\n> - 列表项\n> 引二');
    const box = el.querySelector('.tw-md-quote');
    expect(box.querySelectorAll('br').length).toBe(0);   // 块级列表行自带换行
    expect(box.querySelectorAll('.tw-md-list').length).toBe(1);
    expect(box.textContent).toContain('引一');
    expect(box.textContent).toContain('引二');
  });

  test('引用内的行内格式仍生效', () => {
    const el = mkText('**粗体** 引用\n> 带 `代码` 的一行');
    expect(el.querySelector('.tw-md-quote strong').textContent).toBe('粗体');
    expect(el.querySelector('.tw-md-quote code').textContent).toBe('代码');
  });

  test('非引用卡不受影响：正文仍走纯文本快路径', () => {
    const el = mkText('普通正文\n第二行', 'p');
    expect(el.querySelector('.tw-md-quote')).toBeNull();
    expect(el.dataset.twRich).toBeUndefined();
    expect(el.textContent).toBe('普通正文\n第二行');
  });

  test('CSS 契约：引用竖线跟随主题墨色，不写死白/黑', () => {
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-quote');
    expect(NOTES_CSS).toMatch(/\.tw-card-text \.tw-md-quote \{[^}]*border-left:/);
    expect(NOTES_CSS).toMatch(/\.tw-card-text \.tw-md-quote \{[^}]*currentColor/);
  });
});
