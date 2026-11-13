/**
 * @jest-environment jsdom
 */
/**
 * 卡片正文的 Markdown 行内格式投影契约。
 * 不变量：① 只生成 DOM 节点，绝不拼 innerHTML（用户笔记不能有注入面）；
 *        ② 纯文本卡保持 textContent 快路径、不打 data-tw-rich；
 *        ③ 含格式的卡必须打 data-tw-rich —— 投影后的 DOM 丢了 markdown 语法，
 *           编辑/拆卡路径据此改认模型，否则 innerText 会把 **粗体** 写成「粗体」。
 */
const { loadModule } = require('./__helpers__/testUtils');

const { renderCardText, hasInlineMarkdown } = loadModule(
  'services/ViewportCuller.js',
  ['renderCardText', 'hasInlineMarkdown'],
);

function mkText() {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  return el;
}

const p = (text) => ({ level: 'p', text });

describe('hasInlineMarkdown', () => {
  test('成对标记才识别', () => {
    expect(hasInlineMarkdown('这是 **粗体**')).toBe(true);
    expect(hasInlineMarkdown('普通正文\n第二行')).toBe(false);
    expect(hasInlineMarkdown('a * b * c')).toBe(false);        // 空格包裹 / 未成对不算
    expect(hasInlineMarkdown('只有一个 * 星号')).toBe(false);
  });
});

describe('renderCardText — 行内格式', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('粗体 / 斜体 / 行内代码 / 删除线 / 高亮各生成对应标签', () => {
    const el = mkText();
    renderCardText(el, p('**粗** 和 *斜* 和 `码` 和 ~~删~~ 和 ==亮=='));
    expect(el.querySelector('strong').textContent).toBe('粗');
    expect(el.querySelector('em').textContent).toBe('斜');
    expect(el.querySelector('code').textContent).toBe('码');
    expect(el.querySelector('del').textContent).toBe('删');
    expect(el.querySelector('mark').textContent).toBe('亮');
  });

  test('行内代码内容原样，内部的 ** 不再被解析', () => {
    const el = mkText();
    renderCardText(el, p('`**不是粗体**`'));
    expect(el.querySelector('code').textContent).toBe('**不是粗体**');
    expect(el.querySelector('strong')).toBeNull();
  });

  test('支持嵌套：粗体里嵌行内代码', () => {
    const el = mkText();
    renderCardText(el, p('**粗体带 `代码`**'));
    expect(el.querySelector('strong code').textContent).toBe('代码');
  });

  test('链接生成 <a> 且带 rel，危险协议一律拒绝', () => {
    const a = mkText();
    renderCardText(a, p('[文档](https://example.com/a) 和 [相对](./note.md)'));
    const links = a.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('https://example.com/a');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(links[1].getAttribute('href')).toBe('./note.md');

    const b = mkText();
    renderCardText(b, p('[危险](javascript:alert(1)) 和 [数据](data:text/html,x)'));
    expect(b.querySelector('a')).toBeNull();
    expect(b.textContent).toContain('[危险]');
    expect(b.dataset.twRich).toBeUndefined();   // 没有有效格式 → 仍走纯文本快路径
  });

  test('下划线在词内不误判为强调', () => {
    const el = mkText();
    renderCardText(el, p('变量 foo_bar_baz 不该变斜体'));
    expect(el.querySelector('em')).toBeNull();
    expect(el.textContent).toBe('变量 foo_bar_baz 不该变斜体');
  });

  test('纯文本卡保持快路径：单文本节点、无 tw-rich', () => {
    const el = mkText();
    renderCardText(el, p('普通正文\n第二行'));
    expect(el.dataset.twRich).toBeUndefined();
    expect(el.childNodes.length).toBe(1);
    expect(el.childNodes[0].nodeType).toBe(3);
    expect(el.textContent).toBe('普通正文\n第二行');
  });

  test('含格式卡打 tw-rich（投影丢了 markdown 语法，编辑/拆卡必须改认模型）', () => {
    const el = mkText();
    renderCardText(el, p('这是 **粗体**'));
    expect(el.dataset.twRich).toBe('1');
    expect(el.querySelector('strong').textContent).toBe('粗体');
    expect(el.textContent).not.toContain('**');   // 正因如此，不能拿 innerText 回写模型
  });

  test('多行用 <br> 保留换行，不打断 justify 的同一文本流', () => {
    const el = mkText();
    renderCardText(el, p('第一行 **粗**\n第二行'));
    expect(el.querySelectorAll('br').length).toBe(1);
    expect(el.childNodes[0].textContent).toBe('第一行 ');
    expect(el.lastChild.textContent).toBe('第二行');
  });

  test('task 卡：任务文字与夹着的普通行都支持行内格式', () => {
    const el = mkText();
    renderCardText(el, { level: 'task', text: '- [ ] 写 **五百字**\n说明 `代码`' });
    expect(el.querySelector('.tw-task-label strong').textContent).toBe('五百字');
    expect(el.querySelector('.tw-task-line code').textContent).toBe('代码');
    expect(el.dataset.twRich).toBe('1');
  });

  test('表格单元格内也支持行内格式', () => {
    const el = mkText();
    renderCardText(el, p('| 列 | 值 |\n|---|---|\n| **粗体** | `码` |'));
    const td = el.querySelectorAll('tbody td');
    expect(td[0].querySelector('strong').textContent).toBe('粗体');
    expect(td[1].querySelector('code').textContent).toBe('码');
  });
});
