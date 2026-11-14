/**
 * 卡片正文 Markdown 表格渲染契约：GFM 表格 → <table> 投影，纯文本卡行为不变。
 * 重点回归：投影只是显示层，data-tw-rich 标记让编辑/拆卡路径改认模型，绝不把投影回写进 note.text。
 * 注意：本仓库测试走 loadModule（剥离 ESM），不要用顶层 import。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

const { renderCardText, hasMarkdownTable } = loadModule(
  'services/ViewportCuller.js',
  ['renderCardText', 'hasMarkdownTable'],
);

function mkText() {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  return el;
}

const TABLE = [
  '| 检测点 | 本文所在位置 | 预期表现 |',
  '|---|---|---|',
  '| H1 | 标题「可视化写作实验手记」 | 最深色（色带一端） |',
  '| H2 | 「一、…」「二、…」「三、…」 | 触发分幕；中等权重 |',
].join('\n');

describe('hasMarkdownTable', () => {
  test('标准 GFM 表格可识别', () => {
    expect(hasMarkdownTable(TABLE)).toBe(true);
  });

  test('省略首尾竖线的表格也可识别', () => {
    expect(hasMarkdownTable('a | b\n--- | ---\nc | d')).toBe(true);
  });

  test('水平线不会因上一行含竖线而被误判成单列表格', () => {
    expect(hasMarkdownTable('a | b\n---\nc')).toBe(false);
  });

  test('纯文本不识别', () => {
    expect(hasMarkdownTable('普通正文\n第二行')).toBe(false);
  });
});

describe('renderCardText — Markdown 表格投影', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('GFM 表格渲染成 thead/tbody，单元格 trim 后为纯文本', () => {
    const el = mkText();
    renderCardText(el, { level: 'p', text: TABLE });
    const table = el.querySelector('table.tw-md-table');
    expect(table).not.toBeNull();
    expect(Array.from(table.querySelectorAll('thead th')).map((c) => c.textContent))
      .toEqual(['检测点', '本文所在位置', '预期表现']);
    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelectorAll('td')[1].textContent).toBe('标题「可视化写作实验手记」');
  });

  test('富渲染卡打上 data-tw-rich，纯文本卡不打（供编辑/拆卡路径识别）', () => {
    const a = mkText();
    renderCardText(a, { level: 'p', text: TABLE });
    expect(a.dataset.twRich).toBe('1');

    const b = mkText();
    renderCardText(b, { level: 'p', text: '普通正文\n第二行' });
    expect(b.dataset.twRich).toBeUndefined();
    expect(b.querySelector('table')).toBeNull();
    expect(b.textContent).toBe('普通正文\n第二行');
  });

  test('表格前后文字段保留换行与内容', () => {
    const el = mkText();
    renderCardText(el, { level: 'p', text: `前文一行\n\n${TABLE}\n\n后文一行` });
    const segs = Array.from(el.querySelectorAll('.tw-md-text')).map((d) => d.textContent).join('\n');
    expect(segs).toContain('前文一行');
    expect(segs).toContain('后文一行');
    expect(el.querySelector('table')).not.toBeNull();
  });

  test('对齐语法 :---: / ---: 映射到单元格 text-align', () => {
    const el = mkText();
    renderCardText(el, { level: 'p', text: '| a | b | c |\n|:---:|---:|:---|\n| 1 | 2 | 3 |' });
    const th = el.querySelectorAll('thead th');
    expect(th[0].style.textAlign).toBe('center');
    expect(th[1].style.textAlign).toBe('right');
    expect(th[2].style.textAlign).toBe('');
  });

  test('单元格内容不被当 HTML 解析（用户笔记注入面）', () => {
    const el = mkText();
    const payload = '<img src=x onerror=alert(1)>';
    renderCardText(el, { level: 'p', text: `| a | b |\n|---|---|\n| ${payload} | 正常 |` });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelectorAll('tbody td')[0].textContent).toBe(payload);
  });

  test('task 卡优先走勾选清单，不被表格分支抢走', () => {
    const el = mkText();
    renderCardText(el, { level: 'task', text: '- [ ] 待办' });
    expect(el.querySelector('.tw-task-cb')).not.toBeNull();
    expect(el.querySelector('table')).toBeNull();
  });
});

// 真实缺陷：点「+行」补出的 <td> 没有内容，只按 padding 计算 → 行高塌成一条几像素的线，
// 点不进去、也看不见光标。空行是合法 md（`|  |`），必须给最小行高。
describe('空单元格行高（+行 / Tab 补行）', () => {
  test('单元格有最小行高，且空单元格补行盒', () => {
    const rule = NOTES_CSS.match(
      /\.tw-card-text \.tw-md-table th,\s*\.tw-card-text \.tw-md-table td \{([^}]*)\}/,
    );
    expect(rule).not.toBeNull();
    expect(rule[1]).toMatch(/height:\s*1\.8em/);
    expect(NOTES_CSS).toContain('.tw-md-table td:empty::after');
    expect(NOTES_CSS).toContain('.tw-md-table th:empty::after');
  });

  test('空行渲染出可点击的单元格（DOM 侧），且不影响序列化', () => {
    const el = mkText();
    renderCardText(el, { level: 'table', text: '| a | b |\n|---|---|\n|  |  |' });
    const cells = el.querySelectorAll('tbody td');
    expect(cells.length).toBe(2);
    expect(cells[0].textContent).toBe('');       // 空就是空，不塞 nbsp 进文本
  });
});

// 布局层：写作档正文卡 400px 封顶，表格又是 fixed 均分列宽 —— 4 列以上每列只剩几十像素。
describe('表格卡宽度与列宽分配', () => {
  test('表格卡单独放宽上限（仍封顶），列宽按内容分配', () => {
    expect(NOTES_CSS).toMatch(
      /\.tw-canvas\.tw-mode-write \.tw-card\[data-level="table"\] \{[^}]*max-width:\s*min\(calc\(880px/,
    );
    const rule = (NOTES_CSS.match(/\.tw-card-text \.tw-md-table \{([^}]*)\}/) || [])[1] || '';
    expect(rule).toMatch(/table-layout:\s*auto/);
    expect(rule).toMatch(/width:\s*100%/);   // 仍是 100%：只改分配方式，不撑出卡片
  });

  test('+列 后的空列有可编辑宽度，且不靠单元格 min-width（防定宽便签档溢出）', () => {
    // 真实 Chromium 实测（340px 定宽便签 / 880px 封顶写作档）：
    //  空列现状 16px；空单元格伪元素给 7em → 111px 且表格仍 100%；
    //  若改成 th/td 统一 min-width，定宽容器里表格会被撑到 444px 溢出卡片。
    const emptyRule = (NOTES_CSS.match(
      /\.tw-card-text \.tw-md-table td:empty::after,\s*\.tw-card-text \.tw-md-table th:empty::after \{([^}]*)\}/,
    ) || [])[1] || '';
    expect(emptyRule).toMatch(/display:\s*inline-block/);
    expect(emptyRule).toMatch(/min-width:\s*7em/);
    const cellRule = (NOTES_CSS.match(
      /\.tw-card-text \.tw-md-table th,\s*\.tw-card-text \.tw-md-table td \{([^}]*)\}/,
    ) || [])[1] || '';
    expect(cellRule).not.toMatch(/min-width/);
  });
});
