/**
 * @jest-environment jsdom
 */
/**
 * 嵌套列表缩进契约：缩进是层级语义，不能在成块 / 导出 / 渲染任何一环丢掉。
 * 历史问题：splitDraft 曾把行首缩进一律删光；导出又对列表行 trim() 后无脑加
 * marker，得到 `- - 内层` 这类坏 markdown。
 * 边界：整块公共缩进（外部复制的乱缩进）仍要被归一化清掉；表格 / 围栏块
 * 不做归一化（代码行自身的缩进是内容）。
 */
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
global.MindmapFeature = { isActive: () => false };

const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);
const { renderCardText } = loadModule('services/ViewportCuller.js', ['renderCardText']);

function exportOne(text, level) {
  const ctrl = { _notes: [{ id: 'a', seq: 0, text, level }] };
  return ModeController.buildCardsMarkdown({ state: {}, ctrl }, [{ id: 'a' }]);
}

describe('splitDraft — 保留块内相对缩进', () => {
  test('嵌套 ul：各层缩进留在 note.text 里', () => {
    const md = '- 外层一\n- 外层二\n  - 内层一\n    - 更深层\n- 外层三';
    const chunks = WritingDoc.splitDraft(md, 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('ul');
    // detectLevel 只剥首行 marker，其余行的缩进与 marker 都是语义
    expect(chunks[0].text).toBe('外层一\n- 外层二\n  - 内层一\n    - 更深层\n- 外层三');
  });

  test('嵌套 ol：首行编号与缩进项都不丢', () => {
    const md = '1. 外层第一项\n2. 外层第二项\n   1. 内层也能编号\n   2. 内层第二条';
    const chunks = WritingDoc.splitDraft(md, 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('ol');
    expect(chunks[0].text).toBe(md);
  });

  test('平铺 ol：复制粘贴成卡后首行 1. 不丢', () => {
    const md = '1. 打开写作档\n2. 粘贴本检测稿\n3. 逐张核对类型与配色\n4. 确认无误后导出';
    const chunks = WritingDoc.splitDraft(md, 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('ol');
    expect(chunks[0].text).toBe(md);
  });

  test('整块公共缩进被归一化，块内相对缩进保留', () => {
    const chunks = WritingDoc.splitDraft('  - 外层\n    - 内层\n      - 更深层', 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe('外层\n  - 内层\n    - 更深层');
  });

  test('外部复制的乱缩进仍被清洗，不污染语义', () => {
    const chunks = WritingDoc.splitDraft('\t\t# 标题\n   正文段落', 500);
    expect(chunks.map((c) => c.level)).toEqual(['h1', 'p']);
    expect(chunks[0].text).toBe('标题');
  });

  test('围栏代码块不走归一化，代码行缩进原样保留', () => {
    const md = '  ```js\n    const a = 1;\n        const b = 2;\n  ```';
    const chunks = WritingDoc.splitDraft(md, 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('code');
    expect(chunks[0].text).toContain('    const a = 1;');
    expect(chunks[0].text).toContain('        const b = 2;');
  });
});

describe('buildCardsMarkdown — 还原嵌套与 marker', () => {
  test('ul：保留缩进，且不给已有 marker 的子项重复加前缀', () => {
    const out = exportOne('外层一\n- 外层二\n  - 内层一\n    - 更深层', 'ul');
    expect(out).toContain('\n  - 内层一');
    expect(out).toContain('\n    - 更深层');
    expect(out).not.toContain('- - 内层一');
  });

  test('ol：嵌套编号原样保留，不被跨卡累加打乱', () => {
    const out = exportOne('1. 外层第一项\n2. 外层第二项\n   1. 内层也能编号', 'ol');
    expect(out).toContain('1. 外层第一项');
    expect(out).toContain('2. 外层第二项');
    expect(out).toContain('\n   1. 内层也能编号');
  });

  test('ol 顶层项按跨卡顺序重编号，带原始编号也不会叠成 1. 2. 甲', () => {
    const out = exportOne('1. 甲\n2. 乙\n   1. 内层', 'ol');
    expect(out).toContain('1. 甲');
    expect(out).toContain('2. 乙');
    expect(out).toContain('\n   1. 内层');
    expect(out).not.toMatch(/\d+\.\s*\d+\.\s/);
  });

  test('平铺列表行为不变：无 marker 的普通行仍补前缀', () => {
    expect(exportOne('甲\n乙', 'ul')).toContain('- 甲\n- 乙');
    expect(exportOne('甲\n乙', 'ol')).toContain('1. 甲\n2. 乙');
  });

  test('task 老数据补前缀且不重复（既有契约不被破坏）', () => {
    const out = exportOne('待办一\n- [x] 已完成\n  - [ ] 子待办', 'task');
    expect(out).toContain('- [ ] 待办一');
    expect(out).toContain('- [x] 已完成');
    expect(out).toContain('  - [ ] 子待办');
    expect(out).not.toContain('- [ ] - [x]');
  });
});

describe('renderCardText — 缩进与编号可见（列表投影）', () => {
  const textEl = () => {
    const el = document.createElement('div');
    el.className = 'tw-card-text';
    return el;
  };
  const markers = (el) => Array.from(el.querySelectorAll('.tw-md-marker')).map((n) => n.textContent);

  test('含缩进的 ul 卡走列表投影，缩进映射为 padding-left', () => {
    const el = textEl();
    renderCardText(el, { level: 'ul', text: '外层一\n- 外层二\n  - 内层一' });
    expect(el.dataset.twRich).toBe('1');
    const rs = el.querySelectorAll('.tw-md-list');
    expect(rs.length).toBe(3);
    expect(parseFloat(rs[2].style.getPropertyValue('padding-left'))).toBeGreaterThan(0);
    expect(el.textContent).toContain('内层一');
  });

  test('ol 卡显示完整编号，首行 1. 不再丢', () => {
    const el = textEl();
    renderCardText(el, { level: 'ol', text: '1. 打开写作档\n2. 粘贴本检测稿\n3. 逐张核对类型与配色' });
    expect(el.dataset.twRich).toBe('1');
    expect(markers(el)).toEqual(['1.', '2.', '3.']);
  });

  test('有序嵌套卡片：编号与内层缩进同时显示', () => {
    const el = textEl();
    renderCardText(el, { level: 'ol', text: '1. 外层第一项\n2. 外层第二项\n   1. 内层也能编号\n   2. 内层第二条' });
    expect(markers(el)).toEqual(['1.', '2.', '1.', '2.']);
    const rs = el.querySelectorAll('.tw-md-list');
    expect(parseFloat(rs[2].style.getPropertyValue('padding-left'))).toBeGreaterThan(0);
  });
});
