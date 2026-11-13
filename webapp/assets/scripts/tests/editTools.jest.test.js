/**
 * @jest-environment jsdom
 */
/**
 * 编辑态格式工具条契约：新增行内格式、增删表格行列、增删列表项与缩进。
 * 底线：工具条只在富渲染卡编辑态出现；所有操作都必须能被 serializeRichText 正确还原。
 */
const { loadModule } = require('./__helpers__/testUtils');

const { renderCardText, serializeRichText } = loadModule(
  'services/ViewportCuller.js',
  ['renderCardText', 'serializeRichText'],
);
global.WritingDoc = {
  setText: (notes, id, text) => notes.map((n) => (n.id === id ? Object.assign({}, n, { text }) : n)),
};
global.fitCardText = () => 1;
const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions']);

function fixture(md, level = 'p', mode = 'notes') {
  const canvas = document.createElement('div');
  canvas.className = 'tw-canvas';
  document.body.appendChild(canvas);
  const card = document.createElement('div');
  card.className = 'tw-card';
  card.dataset.id = 'a';
  const text = document.createElement('div');
  text.className = 'tw-card-text';
  card.appendChild(text);
  canvas.appendChild(card);   // 工具条挂在画布层，card 必须真的在 canvas 里
  renderCardText(text, { level, text: md });
  const shown = [];
  const ctrl = {
    _notes: [{ id: 'a', seq: 0, level, text: md }],
    _mode: mode,
    _canvas: canvas,
    _zTop: 0,
    _exitAllEdits: () => {},
    _scheduleSave: () => {},
    _serializeCardText: (el, note) => serializeRichText(el, note),
    _applyCardText: (el, note) => renderCardText(el, note),
    _invalidateGeo: () => {},
    _showScreenMsg: (msg) => shown.push(msg),
  };
  return { card, text, ctrl, shown, canvas, ctx: { state: {}, ctrl } };
}

function selectNode(node) {
  const r = document.createRange();
  r.selectNodeContents(node);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}

const tool = (bar, title) => Array.from(bar.querySelectorAll('.tw-edit-tool')).find((b) => b.title === title);

/** 把光标放到节点末尾（模拟用户在列表项里按 Enter / Tab）。 */
function caretIn(node) {
  const r = document.createRange();
  r.setStart(node, node.nodeType === 3 ? node.nodeValue.length : node.childNodes.length);
  r.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}

const press = (el, key, opts = {}) => el.dispatchEvent(new window.KeyboardEvent(
  'keydown', Object.assign({ key, bubbles: true, cancelable: true }, opts),
));

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
});

describe('工具条出现时机', () => {
  test('富渲染卡进入编辑显示，退出后隐藏', () => {
    const { card, ctx } = fixture('**粗体**', 'p');
    CardInteractions.enterEdit(ctx, card);
    const bar = ctx.ctrl._editToolsBar;
    expect(bar).not.toBeNull();
    expect(bar.hidden).toBe(false);
    expect(Array.from(bar.querySelectorAll('.tw-edit-tool')).map((b) => b.textContent))
      .toEqual(['B', 'I', '</>', 'S', 'H', 'md']);   // 末位 md = 源码视图兜底出口

    CardInteractions.exitEdit(ctx, card);
    expect(bar.hidden).toBe(true);
  });

  test('纯文本卡也有行内按钮：加粗后自动转富渲染（否则 innerText 会丢 **）', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    expect(text.dataset.twRich).toBeUndefined();
    CardInteractions.enterEdit(ctx, card);
    const bar = ctx.ctrl._editToolsBar;
    expect(bar).not.toBeNull();
    expect(bar.querySelectorAll('.tw-edit-tool').length).toBe(6);   // 5 个行内按钮 + md 源码

    selectNode(text.firstChild);
    tool(bar, '粗体').click();
    expect(text.dataset.twRich).toBe('1');
    expect(serializeRichText(text, { level: 'p' })).toBe('**普通文字**');
  });
});

describe('行内格式', () => {
  test('选中文字点 B 生成 strong，序列化回 **...**', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.firstChild);
    tool(ctx.ctrl._editToolsBar, '粗体').click();
    expect(text.querySelector('strong').textContent).toBe('普通文字');
    expect(serializeRichText(text, { level: 'p' })).toBe('**普通文字**');
  });

  test('编辑态加粗后继续输入、再退出编辑，** 标记不被 innerText 冲掉', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.firstChild);
    tool(ctx.ctrl._editToolsBar, '粗体').click();
    expect(text.querySelector('strong')).toBeTruthy();
    text.dispatchEvent(new window.Event('input', { bubbles: true }));   // 加粗后接着打字
    CardInteractions.exitEdit(ctx, card);
    const note = ctx.ctrl._notes.find((n) => n.id === card.dataset.id);
    expect(note.text).toContain('**');                                  // 写回模型仍带标记
  });

  test('已加粗再点 B 解包回纯文本', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    const bar = ctx.ctrl._editToolsBar;
    selectNode(text.firstChild);
    tool(bar, '粗体').click();
    tool(bar, '粗体').click();
    expect(text.querySelector('strong')).toBeNull();
    expect(serializeRichText(text, { level: 'p' })).toBe('普通文字');
  });

  test('斜体 / 行内代码 / 删除线 / 高亮 各自映射到对应标签', () => {
    [['斜体', 'em', '*'], ['行内代码', 'code', '`'], ['删除线', 'del', '~~'], ['高亮', 'mark', '==']]
      .forEach(([title, tag]) => {
        const { card, text, ctx } = fixture('文本', 'p');
        CardInteractions.enterEdit(ctx, card);
        selectNode(text.firstChild);
        tool(ctx.ctrl._editToolsBar, title).click();
        expect(text.querySelector(tag)).not.toBeNull();
        expect(serializeRichText(text, { level: 'p' })).toContain('文本');
        document.body.innerHTML = '';
        window.getSelection().removeAllRanges();
      });
  });
});

describe('表格增删行列', () => {
  test('加行 / 加列 / 删行 / 删列 都作用在光标所在行列', () => {
    const { card, text, ctx } = fixture('| 列 | 值 |\n|---|---|\n| a | b |');
    CardInteractions.enterEdit(ctx, card);
    const bar = ctx.ctrl._editToolsBar;
    expect(tool(bar, '新增一行')).toBeTruthy();

    selectNode(text.querySelector('tbody td').firstChild);
    tool(bar, '新增一行').click();
    expect(text.querySelectorAll('tbody tr').length).toBe(2);

    selectNode(text.querySelector('tbody td').firstChild);
    tool(bar, '新增一列').click();
    expect(text.querySelectorAll('tbody tr')[0].children.length).toBe(3);

    selectNode(text.querySelector('tbody tr').children[2].firstChild || text.querySelector('tbody tr').children[2]);
    tool(bar, '删除当前列').click();
    expect(text.querySelectorAll('tbody tr')[0].children.length).toBe(2);

    const out = serializeRichText(text, { level: 'p' });
    expect(out).toContain('|---|');
    expect(out.split('\n')[0].split('|').length).toBe(4);   // 首尾空段 + 2 列
  });
});

describe('布局：与卡片操作条互斥，不叠两排', () => {
  const css = require('fs').readFileSync(
    require('path').join(__dirname, '../../styles/notes.css'), 'utf8',
  );
  test('格式条挂画布层（摆脱卡片层叠上下文），编辑态隐藏操作条', () => {
    expect(css).toMatch(/\.tw-canvas > \.tw-edit-tools \{[^}]*z-index: 999/);
    expect(css).toMatch(/\.tw-canvas > \.tw-edit-tools \{[^}]*translate\(-50%, -100%\)/);
    expect(css).toContain('.tw-card.editing .tw-card-tools');
    expect(css).toMatch(/\.tw-card\.editing \.tw-card-tools \{[^}]*pointer-events: none/);
  });

  // 真实缺陷：components-interaction.css 给所有裸 button 设了 min-height:48px（触控目标），
  // .tw-edit-tool 只覆写了 min-width，于是每个按钮被地板到 48px 高、字形却只有 0.72em，
  // 表现为「白色背景框上下留白很大、图标很小」。锁住覆写，防止第 2 次复发。
  test('格式条按钮显式压过全局 48px 触控地板，字形不再过小', () => {
    const bar = css.match(/\.tw-canvas > \.tw-edit-tools \{([^}]*)\}/);
    const tool = css.match(/\.tw-edit-tool \{([^}]*)\}/);
    expect(bar).not.toBeNull();
    expect(tool).not.toBeNull();
    expect(bar[1]).toMatch(/align-items:\s*center/);
    // 规则体里有解释性注释，也写着「48px」——先剥注释，只解析真正的声明
    const body = tool[1].replace(/\/\*[\s\S]*?\*\//g, '');
    const minHeight = (body.match(/min-height:\s*([^;]+)/) || [])[1];
    expect(minHeight).toBeTruthy();
    expect(minHeight).not.toMatch(/48px|min-touch-target/);
    const iconScale = Number((body.match(/font-size:\s*([\d.]+)/) || [])[1]);
    expect(iconScale).toBeGreaterThanOrEqual(0.9);
  });
});

describe('点击链路：pointerdown 生效，失败不再静默', () => {
  test('pointerdown 也能触发（真实环境里画布会抑制 click）', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.firstChild);
    const btn = tool(ctx.ctrl._editToolsBar, '粗体');
    btn.dispatchEvent(new window.Event('pointerdown', { bubbles: true, cancelable: true }));
    expect(text.querySelector('strong')).not.toBeNull();
  });

  test('selection 容器在卡片外（shadow 上提）时，用选中文字重建 Range 加粗', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    // 在卡片外造一段同样文字并选中它，模拟 Shadow DOM 把容器上提到 host 层
    const outside = document.createElement('div');
    outside.textContent = '普通文字';
    document.body.appendChild(outside);
    selectNode(outside.firstChild);
    tool(ctx.ctrl._editToolsBar, '粗体').click();
    expect(text.querySelector('strong')).not.toBeNull();
  });

  test('选中后点按钮前选区被清空：仍用非空快照加粗', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.firstChild);
    document.dispatchEvent(new window.Event('selectionchange'));   // 记录用户选区
    window.getSelection().removeAllRanges();                       // 点击导致选区被清
    tool(ctx.ctrl._editToolsBar, '粗体').click();
    expect(text.querySelector('strong')).not.toBeNull();
  });

  test('没选中文字点 B：给出「先选中」提示，而不是没反应', () => {
    const { card, shown, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    tool(ctx.ctrl._editToolsBar, '粗体').click();
    expect(shown.some((m) => m.indexOf('选中') >= 0)).toBe(true);
  });

  test('光标不在表格单元格点 +行：提示把光标放进表格', () => {
    const { card, text, shown, ctx } = fixture('| 列 | 值 |\n|---|---|\n| a | b |');
    CardInteractions.enterEdit(ctx, card);
    text.focus();
    window.getSelection().removeAllRanges();
    tool(ctx.ctrl._editToolsBar, '新增一行').click();
    expect(shown.some((m) => m.indexOf('表格') >= 0)).toBe(true);
  });

  test('点工具条触发的 blur 不会退出编辑（webview 拦不住 blur 时的兜底）', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.firstChild);
    tool(ctx.ctrl._editToolsBar, '粗体')
      .dispatchEvent(new window.Event('pointerdown', { bubbles: true, cancelable: true }));
    text.dispatchEvent(new window.Event('blur'));          // 模拟失焦
    expect(card.classList.contains('editing')).toBe(true);
    expect(ctx.ctrl._editToolsBar.hidden).toBe(false);
  });

  test('pointerdown 与 mousedown 同一次点击只执行一次（否则加粗立刻被解包）', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.firstChild);
    const btn = tool(ctx.ctrl._editToolsBar, '粗体');
    btn.dispatchEvent(new window.Event('pointerdown', { bubbles: true, cancelable: true }));
    btn.dispatchEvent(new window.Event('mousedown', { bubbles: true, cancelable: true }));
    expect(text.querySelector('strong')).not.toBeNull();
  });

  test('抬手后仍拦住同一次点击的 click 尾巴，复位后下一次点击仍生效', () => {
    jest.useFakeTimers();
    try {
      const { card, text, ctx } = fixture('普通文字', 'p');
      CardInteractions.enterEdit(ctx, card);
      selectNode(text.firstChild);
      const btn = tool(ctx.ctrl._editToolsBar, '粗体');
      btn.dispatchEvent(new window.Event('pointerdown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new window.Event('pointerup', { bubbles: true, cancelable: true }));
      // click 紧跟 pointerup：若抬手就复位，这一下会把刚加的格式又解包（「闪一下就没了」）
      btn.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
      expect(text.querySelector('strong')).not.toBeNull();
      jest.advanceTimersByTime(400);                     // 延后复位到 click 之后
      expect(card._toolHandled).toBe(false);
      selectNode(text.querySelector('strong'));          // 选中已加粗的文字
      btn.dispatchEvent(new window.Event('pointerdown', { bubbles: true, cancelable: true }));
      expect(text.querySelector('strong')).toBeNull();   // 第二次确实解包了
    } finally {
      jest.useRealTimers();
    }
  });

  test('按钮事件被中间层 stopPropagation 吞掉时，document 捕获仍能触发', () => {
    const { card, text, ctx } = fixture('普通文字', 'p');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.firstChild);
    card.addEventListener('pointerdown', (e) => e.stopPropagation(), true);   // 模拟中间层拦截
    tool(ctx.ctrl._editToolsBar, '粗体')
      .dispatchEvent(new window.Event('pointerdown', { bubbles: true, cancelable: true }));
    expect(text.querySelector('strong')).not.toBeNull();
  });
});

describe('列表 / 任务项', () => {
  test('光标塌陷（只点进某一项、不选中文字）也能新增项', () => {
    const { card, text, ctx } = fixture('1. 甲\n2. 乙', 'ol');
    CardInteractions.enterEdit(ctx, card);
    // 真实操作：点进第一项，光标塌陷，不选中任何文字
    const row = text.querySelector('.tw-md-list');
    const r = document.createRange();
    r.setStart(row.firstChild, 0);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    document.dispatchEvent(new window.Event('selectionchange'));
    tool(ctx.ctrl._editToolsBar, '新增列表项').click();
    expect(text.querySelectorAll('.tw-md-list').length).toBe(3);
  });

  test('删除列表项后光标落到相邻项，不留悬空', () => {
    const { card, text, ctx } = fixture('1. 甲\n2. 乙\n3. 丙', 'ol');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.querySelectorAll('.tw-md-list')[1].lastChild);   // 选中中间那项
    tool(ctx.ctrl._editToolsBar, '删除当前项').click();
    expect(text.querySelectorAll('.tw-md-list').length).toBe(2);
    expect(card._caretRange).toBeTruthy();                          // 光标没有随节点消失
    expect(text.contains(card._caretRange.startContainer)).toBe(true);
  });

  test('嵌套有序项新增后同层级递增，不出现重复序号', () => {
    const { card, text, ctx } = fixture('1. 甲\n  1. 乙\n2. 丙', 'ol');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.querySelectorAll('.tw-md-list')[1].lastChild);   // 选中嵌套项
    tool(ctx.ctrl._editToolsBar, '新增列表项').click();
    const ms = Array.from(text.querySelectorAll('.tw-md-marker')).map((m) => m.textContent);
    expect(ms).toEqual(['1.', '1.', '2.', '2.']);                   // 嵌套层 1,2；外层回到 2
  });

  test('列表项内 Enter 新开同级项（splitListItem 标准语义）', () => {
    const { card, text, ctx } = fixture('- 甲', 'ul');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelector('.tw-md-list'));
    press(text, 'Enter');
    expect(text.querySelectorAll('.tw-md-list').length).toBe(2);
    expect(ctx.ctrl._notes[0].text).toBe('- 甲\n- ');                // 纯 md：新项就是一行 `- `
  });

  test('有序列表项内 Enter 后编号连续，不出现重复序号', () => {
    const { card, text, ctx } = fixture('1. 甲\n2. 乙', 'ol');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelectorAll('.tw-md-list')[0]);
    press(text, 'Enter');
    const ms = Array.from(text.querySelectorAll('.tw-md-marker')).map((m) => m.textContent);
    expect(ms).toEqual(['1.', '2.', '3.']);
    expect(ctx.ctrl._notes[0].text).toBe('1. 甲\n2. \n3. 乙');
  });

  test('空列表项按 Enter 收掉该项，不留下一个空行', () => {
    const { card, text, ctx } = fixture('- 甲\n- ', 'ul');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelectorAll('.tw-md-list')[1]);
    press(text, 'Enter');
    expect(text.querySelectorAll('.tw-md-list').length).toBe(1);
    expect(ctx.ctrl._notes[0].text).toBe('- 甲');
  });

  test('列表项内 Tab / Shift+Tab 增减缩进，写回模型的就是缩进空格', () => {
    const { card, text, ctx } = fixture('- 甲\n- 乙', 'ul');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelectorAll('.tw-md-list')[1]);
    press(text, 'Tab');
    expect(ctx.ctrl._notes[0].text).toBe('- 甲\n  - 乙');
    press(text, 'Tab', { shiftKey: true });
    expect(ctx.ctrl._notes[0].text).toBe('- 甲\n- 乙');
  });

  test('列表项内 Shift+Enter 不产出读回会变形的软换行', () => {
    const { card, text, ctx, shown } = fixture('- 甲', 'ul');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelector('.tw-md-list'));
    press(text, 'Enter', { shiftKey: true });
    expect(text.querySelectorAll('.tw-md-list').length).toBe(1);    // 没有多出一行
    expect(ctx.ctrl._notes[0].text).toBe('- 甲');                   // md 没有被污染
    expect(shown.length).toBe(1);                                   // 明确告知不支持
  });

  test('表格单元格内回车跳到下一行同列，不在单元格里塞换行', () => {
    const md = '| 列 | 值 |\n|---|---|\n| a | b |\n| c | d |';
    const { card, text, ctx } = fixture(md);
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelectorAll('td')[0]);
    press(text, 'Enter');
    expect(card._caretRange.startContainer).toBe(text.querySelectorAll('td')[2]);   // 落到 c
    expect(ctx.ctrl._notes[0].text).toBe(md);                                       // 模型没被改
  });

  test('表格末行回车补一行空单元格，写回的是纯 md 表格行', () => {
    const { card, text, ctx } = fixture('| 列 | 值 |\n|---|---|\n| a | b |');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelectorAll('td')[0]);
    press(text, 'Enter');
    expect(text.querySelectorAll('tbody tr').length).toBe(2);
    expect(ctx.ctrl._notes[0].text).toBe('| 列 | 值 |\n|---|---|\n| a | b |\n|  |  |');
  });

  test('表头行回车进入第一行数据行，不复制表头', () => {
    const { card, text, ctx } = fixture('| 列 | 值 |\n|---|---|\n| a | b |');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelector('th'));
    press(text, 'Enter');
    expect(text.querySelectorAll('tr').length).toBe(2);
    expect(card._caretRange.startContainer).toBe(text.querySelectorAll('td')[0]);
  });

  test('字数到上限后输入被拦在 beforeinput，不会切出半截标记', () => {
    const { card, text, ctx, shown } = fixture('a'.repeat(500));
    CardInteractions.enterEdit(ctx, card);
    const hit = new window.Event('beforeinput', { bubbles: true, cancelable: true });
    hit.inputType = 'insertText';
    hit.data = 'b';
    text.dispatchEvent(hit);
    expect(hit.defaultPrevented).toBe(true);
    expect(shown.some((m) => m.indexOf('500') >= 0)).toBe(true);
    const ok = new window.Event('beforeinput', { bubbles: true, cancelable: true });
    ok.inputType = 'insertText';
    ok.data = '';
    text.dispatchEvent(ok);
    expect(ok.defaultPrevented).toBe(false);   // 没超限不拦
  });

  test('写作档不按便签尺寸截卡：超过 500 字的卡片仍能继续输入', () => {
    const { card, text, ctx } = fixture('a'.repeat(600), 'p', 'write');
    CardInteractions.enterEdit(ctx, card);
    const e = new window.Event('beforeinput', { bubbles: true, cancelable: true });
    e.inputType = 'insertText';
    e.data = 'b';
    text.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);   // 600 字在写作档不算超限
  });

  test('写作档编辑超长表格卡时不再被切到 500 字', () => {
    const rows = Array.from({ length: 40 }, (_, i) => `| r${i} | ${'x'.repeat(20)} |`).join('\n');
    const md = `| 列 | 值 |\n|---|---|\n${rows}`;
    const { card, text, ctx } = fixture(md, 'p', 'write');
    expect(md.length).toBeGreaterThan(500);
    CardInteractions.enterEdit(ctx, card);
    text.dispatchEvent(new window.Event('input', { bubbles: true }));
    const note = ctx.ctrl._notes[0];
    expect(note.text.length).toBeGreaterThan(500);   // 没有被切到便签尺寸
    expect(note.text).toContain('r39');              // 末行还在，没被砍掉
  });

  test('列表卡里的空行保留：渲染成占位元素，进出编辑都原样写回', () => {
    const { card, text, ctx } = fixture('- 甲\n\n- 乙', 'ul');
    expect(text.querySelectorAll('.tw-md-gap').length).toBe(1);
    CardInteractions.enterEdit(ctx, card);
    text.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(ctx.ctrl._notes[0].text).toBe('- 甲\n\n- 乙');
    CardInteractions.exitEdit(ctx, card);
    expect(ctx.ctrl._notes[0].text).toBe('- 甲\n\n- 乙');
  });

  test('文末换行不产生可见空行，也不写回多余空行', () => {
    const { card, text, ctx } = fixture('- 甲\n', 'ul');
    expect(text.querySelectorAll('.tw-md-gap').length).toBe(0);
    CardInteractions.enterEdit(ctx, card);
    text.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(ctx.ctrl._notes[0].text).toBe('- 甲');
  });

  test('任务项内 Enter 新开一项，且新项未勾选', () => {
    const { card, text, ctx } = fixture('- [x] 甲', 'task');
    CardInteractions.enterEdit(ctx, card);
    caretIn(text.querySelector('.tw-task-row'));
    press(text, 'Enter');
    const rows = text.querySelectorAll('.tw-task-row');
    expect(rows.length).toBe(2);
    expect(rows[1].querySelector('.tw-task-cb').checked).toBe(false);
    expect(ctx.ctrl._notes[0].text).toBe('- [x] 甲\n- [ ] ');
  });

  test('有序列表新增项后顶层编号重排，缩进可增可减', () => {
    const { card, text, ctx } = fixture('1. 甲\n2. 乙', 'ol');
    CardInteractions.enterEdit(ctx, card);
    const bar = ctx.ctrl._editToolsBar;

    selectNode(text.querySelector('.tw-md-list').firstChild);
    tool(bar, '新增列表项').click();
    expect(text.querySelectorAll('.tw-md-list').length).toBe(3);
    expect(Array.from(text.querySelectorAll('.tw-md-marker')).map((n) => n.textContent))
      .toEqual(['1.', '2.', '3.']);

    selectNode(text.querySelectorAll('.tw-md-list')[0].firstChild);
    tool(bar, '增加缩进').click();
    expect(text.querySelectorAll('.tw-md-list')[0].style.getPropertyValue('padding-left')).toBe('1.2em');
    expect(serializeRichText(text, { level: 'ol' })).toContain('  1.');

    selectNode(text.querySelectorAll('.tw-md-list')[0].firstChild);
    tool(bar, '减少缩进').click();
    expect(text.querySelectorAll('.tw-md-list')[0].style.getPropertyValue('padding-left')).toBe('');
  });

  test('任务行用 div 渲染：<label> 会把编辑态焦点转给复选框，导致字打不进去', () => {
    const { text } = fixture('- [ ] 甲', 'task');
    expect(text.querySelector('.tw-task-row').tagName).toBe('DIV');
    expect(text.querySelector('label')).toBeNull();
  });

  test('文字落在任务行容器上（label 之外）也能被序列化保住', () => {
    const { text } = fixture('- [ ] 甲', 'task');
    const row = text.querySelectorAll('.tw-task-row')[0];
    row.appendChild(document.createTextNode('乙'));   // 光标落在行尾/间隙时的真实 DOM 形态
    expect(serializeRichText(text, { level: 'task' })).toBe('- [ ] 甲乙');
  });

  test('任务卡新增项为未勾选空项，序列化补回 marker', () => {
    const { card, text, ctx } = fixture('- [x] 读一章书', 'task');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.querySelector('.tw-task-label').firstChild);
    tool(ctx.ctrl._editToolsBar, '新增任务项').click();
    const rows = text.querySelectorAll('.tw-task-row');
    expect(rows.length).toBe(2);
    expect(rows[1].querySelector('.tw-task-cb').checked).toBe(false);
    expect(rows[1].querySelector('.tw-task-label').textContent).toBe('');
    expect(serializeRichText(text, { level: 'task' })).toBe('- [x] 读一章书\n- [ ] ');
  });

  test('新建任务项后在项内输入文字，退出编辑仍保留', () => {
    const { card, text, ctx } = fixture('- [ ] 甲', 'task');
    CardInteractions.enterEdit(ctx, card);
    selectNode(text.querySelector('.tw-task-label').firstChild);
    tool(ctx.ctrl._editToolsBar, '新增任务项').click();
    const labels = text.querySelectorAll('.tw-task-label');
    expect(labels.length).toBe(2);
    labels[1].textContent = '乙';                       // 模拟用户在新项里打字
    text.dispatchEvent(new window.Event('input', { bubbles: true }));
    CardInteractions.exitEdit(ctx, card);               // 退出编辑走序列化 + 重投影
    expect(serializeRichText(text, { level: 'task' })).toContain('乙');
  });

  test('输入法组字中退出编辑会等上屏，不丢字', () => {
    jest.useFakeTimers();
    try {
      const { card, text, ctx } = fixture('- [ ] 甲', 'task');
      CardInteractions.enterEdit(ctx, card);
      selectNode(text.querySelector('.tw-task-label').firstChild);
      tool(ctx.ctrl._editToolsBar, '新增任务项').click();
      const lab = text.querySelectorAll('.tw-task-label')[1];
      text.dispatchEvent(new window.Event('compositionstart'));
      lab.textContent = '乙';                            // 组字中：屏幕上已有候选文本
      text.dispatchEvent(new window.Event('input', { bubbles: true }));
      CardInteractions.exitEdit(ctx, card);
      expect(card.classList.contains('editing')).toBe(true);   // 组字未上屏，不得立即退出
      text.dispatchEvent(new window.Event('compositionend'));
      jest.advanceTimersByTime(200);
      expect(card.classList.contains('editing')).toBe(false);  // 上屏后才真正退出
      expect(serializeRichText(text, { level: 'task' })).toContain('乙');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('单卡源码视图（md 兜底出口）', () => {
  // 便签档的格式工具条（含 md 出口按钮）已整条隐藏，⌘/ 必须同步失效：
  // 否则会进入「卡上是纯 md、却没有任何可见出口」的坏状态。
  test('便签档 ⌘/ 不进源码视图（工具条已隐藏，不能留隐藏入口）', () => {
    const { card, text, ctx } = fixture('**粗体**', 'p', 'notes');
    CardInteractions.enterEdit(ctx, card);
    press(text, '/', { metaKey: true });
    expect(card._srcMode).not.toBe(true);
    // 仍是投影（<strong>），没被换成带 ** 的 md 原文
    expect(text.querySelector('strong')).not.toBeNull();
    expect(text.textContent).toBe('粗体');
  });

  test('写作档 ⌘/ 仍可切源码视图', () => {
    const { card, text, ctx } = fixture('**粗体**', 'p', 'write');
    CardInteractions.enterEdit(ctx, card);
    press(text, '/', { metaKey: true });
    expect(card._srcMode).toBe(true);
  });

  test('切到源码：卡上就是原始 md，不渲染任何语法', () => {
    const { card, text, ctrl, ctx } = fixture('**粗体**', 'p');
    CardInteractions.enterEdit(ctx, card);
    expect(CardInteractions.toggleSource(ctx, card)).toBe(true);
    expect(card.classList.contains('tw-src-mode')).toBe(true);
    expect(text.querySelector('strong')).toBeNull();     // 投影元素全部撤掉
    expect(text.textContent).toBe('**粗体**');           // 看到的就是要写进文件的那段
    expect(ctrl._editToolsBar.classList.contains('tw-src-on')).toBe(true);
  });

  test('源码里改 md 原样写回模型，不套任何额外语法', () => {
    const { card, text, ctrl, ctx } = fixture('**粗体**', 'p');
    CardInteractions.enterEdit(ctx, card);
    CardInteractions.toggleSource(ctx, card);
    text.textContent = '![](a.png)\n\n| a | b |';        // 投影表达不了的语法
    text.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(ctrl._notes[0].text).toBe('![](a.png)\n\n| a | b |');
  });

  test('切回投影：源码里改的 md 立刻按语法渲染', () => {
    const { card, text, ctx } = fixture('**粗**', 'p');
    CardInteractions.enterEdit(ctx, card);
    CardInteractions.toggleSource(ctx, card);
    text.textContent = '**粗体**';
    CardInteractions.toggleSource(ctx, card);
    expect(card.classList.contains('tw-src-mode')).toBe(false);
    expect(text.querySelector('strong')).not.toBeNull();
    expect(text.textContent).toBe('粗体');
  });

  test('源码视图下退出编辑：卡片回到投影，模型保持原始 md', () => {
    const { card, text, ctrl, ctx } = fixture('甲', 'p');
    CardInteractions.enterEdit(ctx, card);
    CardInteractions.toggleSource(ctx, card);
    text.textContent = '**乙**';
    text.dispatchEvent(new window.Event('input', { bubbles: true }));
    CardInteractions.exitEdit(ctx, card);
    expect(card.classList.contains('tw-src-mode')).toBe(false);
    expect(text.querySelector('strong')).not.toBeNull();  // 已重新投影，不是把 md 留在卡上
    expect(ctrl._notes[0].text).toBe('**乙**');
  });

  test('⌘/ 切换；源码视图里格式按钮被拦，不会改坏纯文本', () => {
    // 源码视图随格式工具条一起收回写作档，故此处显式用 write 档
    const { card, text, ctrl, ctx, shown } = fixture('**粗体**', 'p', 'write');
    CardInteractions.enterEdit(ctx, card);
    press(text, '/', { metaKey: true });
    expect(card._srcMode).toBe(true);
    const before = text.textContent;
    selectNode(text);
    tool(ctrl._editToolsBar, '粗体').click();
    expect(text.textContent).toBe(before);               // 纯文本没被包上 <strong>
    expect(shown.some((m) => m.indexOf('源码视图') >= 0)).toBe(true);
    press(text, '/', { metaKey: true });
    expect(card._srcMode).toBe(false);
  });

  test('源码里新增表格后切回投影：行列按钮随之出现', () => {
    const { card, text, ctrl, ctx } = fixture('甲', 'p');
    CardInteractions.enterEdit(ctx, card);
    CardInteractions.toggleSource(ctx, card);
    text.textContent = '| a | b |\n|---|---|';
    text.dispatchEvent(new window.Event('input', { bubbles: true }));
    CardInteractions.toggleSource(ctx, card);
    const titles = Array.from(ctrl._editToolsBar.querySelectorAll('.tw-edit-tool')).map((b) => b.title);
    expect(titles).toContain('新增一行');
    expect(text.querySelector('table')).not.toBeNull();
  });

  test('源码视图退出后再次编辑：工具条按钮全部复原', () => {
    const { card, text, ctrl, ctx } = fixture('**粗体**', 'p');
    CardInteractions.enterEdit(ctx, card);
    CardInteractions.toggleSource(ctx, card);
    expect(ctrl._editToolsBar.classList.contains('tw-src-on')).toBe(true);
    CardInteractions.exitEdit(ctx, card);
    CardInteractions.enterEdit(ctx, card);
    expect(ctrl._editToolsBar.classList.contains('tw-src-on')).toBe(false);
    expect(ctrl._editToolsBar.querySelectorAll('.tw-edit-tool').length).toBe(6);
    expect(text.querySelector('strong')).not.toBeNull();   // 回到投影视图
  });

  test('不在编辑态时切换源码不做任何事', () => {
    const { card, text, ctx } = fixture('**粗体**', 'p');
    expect(CardInteractions.toggleSource(ctx, card)).toBe(false);
    expect(text.textContent).toBe('粗体');
  });
});
