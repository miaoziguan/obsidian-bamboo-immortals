/**
 * @jest-environment jsdom
 */
/**
 * Obsidian 特有语法 · A 类（纯视觉）卡片投影契约。
 * 边界：不接宿主 API、不加载外部资源、不产生可点元素；
 * B/C 类（数学、Mermaid、![[嵌入]]）不进卡片，交给整篇预览的宿主 MarkdownRenderer。
 * 模型仍是原始 markdown，含 A 类语法的卡必须打 data-tw-rich。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const { renderCardText } = loadModule('services/ViewportCuller.js', ['renderCardText']);
const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

function mkText(text, level = 'p') {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  renderCardText(el, { level, text });
  return el;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('A 类语法 · 行内投影', () => {
  test('#tag 生成标签节点，# 后跟空格的 ATX 标题不误判', () => {
    const el = mkText('这是一段 #写作/随笔 标签');
    expect(el.querySelector('.tw-md-tag').textContent).toBe('#写作/随笔');
    const plain = mkText('# 标题');
    expect(plain.querySelector('.tw-md-tag')).toBeNull();
    expect(plain.dataset.twRich).toBeUndefined();
  });

  test('[[双链]] 显示笔记名，[[note|alias]] 显示别名并保留 data-note', () => {
    const a = mkText('见 [[季度复盘]]');
    expect(a.querySelector('.tw-md-wikilink').textContent).toBe('季度复盘');
    expect(a.querySelector('.tw-md-wikilink').dataset.note).toBe('季度复盘');
    const b = mkText('见 [[季度复盘|复盘]]');
    expect(b.querySelector('.tw-md-wikilink').textContent).toBe('复盘');
    expect(b.querySelector('.tw-md-wikilink').dataset.note).toBe('季度复盘');
  });

  test('![[图片]] 归图片投影；![[笔记]] 属 C 类：不投影、保持原文', () => {
    // 图片嵌入（.png 等）已升级为投影：卡上显示真图，序列化时仍吐回 ![[...]] 原文
    const img = mkText('附件 ![[封面.png]]');
    expect(img.querySelector('.tw-md-wikilink')).toBeNull();
    expect(img.querySelector('img.tw-md-img').dataset.mdRaw).toBe('![[封面.png]]');

    // 非图片的转写嵌入（笔记 / 块）要读 vault 内容，仍保持原文
    const el = mkText('附件 ![[某篇笔记]]');
    expect(el.querySelector('.tw-md-wikilink')).toBeNull();
    expect(el.textContent).toContain('![[某篇笔记]]');
  });

  test('%%注释%% 生成注释节点（CSS 隐藏），其余文本照常', () => {
    const el = mkText('可见 %%隐藏%% 结束');
    expect(el.querySelector('.tw-md-comment').textContent).toBe('隐藏');
    expect(el.textContent).toContain('可见 ');
    expect(el.textContent).toContain(' 结束');
  });

  test('^块ID 淡显，不与行内其它格式冲突', () => {
    const el = mkText('段落 **粗体** ^abc-123');
    expect(el.querySelector('.tw-md-blockid').textContent).toBe('^abc-123');
    expect(el.querySelector('strong').textContent).toBe('粗体');
  });

  test('含 A 类语法的纯文本卡打 data-tw-rich（编辑/拆卡改认模型）', () => {
    expect(mkText('带 #标签 的一段').dataset.twRich).toBe('1');
    expect(mkText('完全普通的一段').dataset.twRich).toBeUndefined();
  });

  test('A 类语法在 task / 列表 / 引用卡里也生效（共用 inlineNodes）', () => {
    const task = mkText('- [ ] 写 #随笔', 'task');
    expect(task.querySelector('.tw-task-label .tw-md-tag')).not.toBeNull();
    const list = mkText('带 [[链接]] 的项', 'ul');
    expect(list.querySelector('.tw-md-list .tw-md-wikilink')).not.toBeNull();
    const quote = mkText('引用 ^q1\n> 第二行', 'quote');
    expect(quote.querySelector('.tw-md-quote .tw-md-blockid')).not.toBeNull();
  });
});

describe('表格 / callout 的结构保护', () => {
  test('[[note|alias]] 里的 | 不被当成列分隔符', () => {
    const el = mkText('| 链接 | 说明 |\n|---|---|\n| [[季度复盘|复盘]] | 值 |');
    const td = el.querySelectorAll('tbody td');
    expect(td.length).toBe(2);
    expect(td[0].querySelector('.tw-md-wikilink').textContent).toBe('复盘');
    expect(td[1].textContent).toBe('值');
  });

  test('> [!note] callout 标题渲染成带类型徽标的块头', () => {
    const el = mkText('[!note] 提示标题\n> 正文一行', 'quote');
    const head = el.querySelector('.tw-md-callout');
    expect(head).not.toBeNull();
    expect(head.dataset.type).toBe('note');
    expect(head.querySelector('.tw-md-callout-badge').textContent).toBe('note');
    expect(head.textContent).toContain('提示标题');
    expect(el.querySelector('.tw-md-quote').textContent).toContain('正文一行');
  });

  test('callout 与引用内列表混排互不干扰', () => {
    const el = mkText('[!tip] 建议\n> - 第一项', 'quote');
    expect(el.querySelector('.tw-md-callout')).not.toBeNull();
    expect(el.querySelectorAll('.tw-md-list').length).toBe(1);
  });
});

describe('CSS 契约', () => {
  test('A 类样式齐备：注释隐藏、双链不可点、块ID 淡显、callout 徽标', () => {
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-tag');
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-wikilink');
    expect(NOTES_CSS).toMatch(/\.tw-card-text \.tw-md-comment \{\s*display: none;/);
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-blockid');
    expect(NOTES_CSS).toContain('.tw-card-text .tw-md-callout-badge');
    expect(NOTES_CSS).toMatch(/\.tw-card-text \.tw-md-wikilink \{[^}]*cursor: default/);
  });
});
