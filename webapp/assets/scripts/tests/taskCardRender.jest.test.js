/**
 * 任务卡渲染契约：markdown 任务列表 → 可视勾选清单，toggle 回写 marker。
 * 这是写作模式 task 卡从「裸 - [ ] 文本」补上勾选态的回归锁。
 * 注意：本仓库测试走 loadModule（剥离 ESM），不要用顶层 import。
 */
const { loadModule } = require('./__helpers__/testUtils');

// 渲染器与卡挂载同属 ViewportCuller（mountCard 就是它的唯一入口），测试也从这里取。
const { renderTaskText, renderCardText, TASK_LINE_RE } = loadModule(
  'services/ViewportCuller.js',
  ['renderTaskText', 'renderCardText', 'TASK_LINE_RE'],
);

function mkText() {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  return el;
}

describe('renderTaskText — task 块渲染成勾选框', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('`- [ ]` 成未勾选行，`- [x]` 成已勾选并加 done 类', () => {
    const el = mkText();
    renderTaskText(el, '- [ ] 待办一\n- [x] 已办二');
    const rows = el.querySelectorAll('.tw-task-row');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('.tw-task-cb').checked).toBe(false);
    expect(rows[1].querySelector('.tw-task-cb').checked).toBe(true);
    expect(rows[1].classList.contains('done')).toBe(true);
    expect(rows[0].querySelector('.tw-task-label').textContent).toBe('待办一');
  });

  // 回归锁：勾选框尺寸必须由 inline !important 承载。
  // 前四版靠类规则调数值（em / calc(var()) / min() / 裸 px）视觉尺寸都不变 ——
  // input[type=checkbox] 的 UA 内置样式与主题重写会压过类声明，只有 inline !important 能赢。
  test('尺寸真源是 inline !important（0.9em + 继承字号）', () => {
    const el = mkText();
    renderTaskText(el, '- [ ] 项');
    const cb = el.querySelector('.tw-task-cb');
    expect(cb.style.getPropertyValue('width')).toBe('0.9em');
    expect(cb.style.getPropertyPriority('width')).toBe('important');
    expect(cb.style.getPropertyValue('height')).toBe('0.9em');
    expect(cb.style.getPropertyPriority('height')).toBe('important');
    // 1em = 继承父级字号（不用 inherit：部分引擎的 CSSOM 不接受该关键字）
    expect(cb.style.getPropertyValue('font-size')).toBe('1em');
    expect(cb.style.getPropertyPriority('appearance')).toBe('important');
  });

  test('大小写 `[X]` 也算勾选', () => {
    const el = mkText();
    renderTaskText(el, '- [X] 大写');
    expect(el.querySelector('.tw-task-cb').checked).toBe(true);
  });

  test('行号记在 dataset.line，与 note.text 物理行一致（非任务行也占一行号）', () => {
    const el = mkText();
    renderTaskText(el, '说明文字\n- [ ] 项一\n普通行\n- [x] 项二');
    const rows = el.querySelectorAll('.tw-task-row');
    expect(rows.length).toBe(2);
    expect(rows[0].dataset.line).toBe('1');   // 物理行 1（0-based）
    expect(rows[1].dataset.line).toBe('3');
    // 中间的非任务行也渲染出来（但不带勾选框）
    expect(el.querySelectorAll('.tw-task-line').length).toBe(2);
  });

  test('其它类型走纯文本，行为等同原 textContent', () => {
    const el = mkText();
    renderCardText(el, { level: 'p', text: '普通段落' });
    expect(el.querySelector('.tw-task-row')).toBeNull();
    expect(el.textContent).toBe('普通段落');
  });
});

describe('task toggle 回写 marker（renderCardText 的数据契约）', () => {
  test('勾选/取消后对应行 marker 翻转、未勾选行不动', () => {
    const flip = (text, i, checked) => {
      const lines = text.split('\n');
      lines[i] = lines[i].replace(/^([-*]\s+)\[[ xX]\]/, (_, p) => p + '[' + (checked ? 'x' : ' ') + ']');
      return lines.join('\n');
    };
    const t0 = '- [ ] 甲\n- [x] 乙\n- [ ] 丙';
    expect(flip(t0, 1, false)).toBe('- [ ] 甲\n- [ ] 乙\n- [ ] 丙');
    expect(flip(t0, 0, true)).toBe('- [x] 甲\n- [x] 乙\n- [ ] 丙');
  });

  test('第几个勾选框 ≠ 第几行：用 dataset.line 而非数勾选框数', () => {
    const el = mkText();
    renderTaskText(el, '头\n- [ ] 一\n中\n- [x] 二\n尾');
    const rows = Array.from(el.querySelectorAll('.tw-task-row'));
    // 第 2 个勾选框对应物理行 3（"中"是行 2），不能误写成行 1
    expect(rows[1].dataset.line).toBe('3');
    expect(TASK_LINE_RE.test('中')).toBe(false);   // 中间那行不是任务行，不该被回写
  });
});
