/**
 * @jest-environment jsdom
 */
// 长文成块：splitDraft 把整篇草稿切成「一块一张卡」的块序列，每块各自跑 detectLevel 定级。
// 这是「粘贴一篇长草稿进写作档」的核心纯逻辑，与 splitNote（拆单卡、段一律 'p'）关键区别在于
// 每块独立定级，故标题/列表/引用不会退化为正文。
const { loadModule } = require('./__helpers__/testUtils');

const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);

describe('WritingDoc.detectLevel（级别嗅探单一真源）', () => {
  test('标题 # {1,6}', () => {
    expect(WritingDoc.detectLevel('# 一')).toEqual({ level: 'h1', text: '一' });
    expect(WritingDoc.detectLevel('## 二')).toEqual({ level: 'h2', text: '二' });
    expect(WritingDoc.detectLevel('###### 六')).toEqual({ level: 'h6', text: '六' });
  });
  test('引用 / 任务 / 无序 / 有序', () => {
    expect(WritingDoc.detectLevel('> 引')).toEqual({ level: 'quote', text: '引' });
    expect(WritingDoc.detectLevel('- [ ] 待')).toEqual({ level: 'task', text: '待' });
    expect(WritingDoc.detectLevel('- [x] 已')).toEqual({ level: 'task', text: '已' });
    expect(WritingDoc.detectLevel('- 项')).toEqual({ level: 'ul', text: '项' });
    expect(WritingDoc.detectLevel('* 星')).toEqual({ level: 'ul', text: '星' });
    expect(WritingDoc.detectLevel('1. 有')).toEqual({ level: 'ol', text: '有' });
    expect(WritingDoc.detectLevel('1) 有')).toEqual({ level: 'ol', text: '有' });
  });
  test('普通段落 → p，且前缀不被误剥', () => {
    expect(WritingDoc.detectLevel('普通文本')).toEqual({ level: 'p', text: '普通文本' });
    expect(WritingDoc.detectLevel('1.5 不是有序')).toEqual({ level: 'p', text: '1.5 不是有序' });
  });
  test('只析首行：多行正文不污染级别', () => {
    expect(WritingDoc.detectLevel('# 标题\n正文一\n正文二'))
      .toEqual({ level: 'h1', text: '标题\n正文一\n正文二' });
  });
});

describe('WritingDoc.splitDraft（长文成块）', () => {
  const levels = (chunks) => chunks.map((c) => c.level);

  test('空输入 → 空数组', () => {
    expect(WritingDoc.splitDraft('')).toEqual([]);
    expect(WritingDoc.splitDraft('   \n  \n ')).toEqual([]);
  });

  test('Markdown：标题/正文/列表/引用按语义成块，每块各自定级', () => {
    const draft = ['# 标题', '正文段落一', '', '## 小节', '- 项一', '- 项二', '> 引用一句'].join('\n');
    const chunks = WritingDoc.splitDraft(draft, 500);
    expect(levels(chunks)).toEqual(['h1', 'p', 'h2', 'ul', 'quote']);
    expect(chunks[0].text).toBe('标题');
    expect(chunks[3].text).toBe('项一\n- 项二');   // 列表合并、首行前缀已剥
    expect(chunks[4].text).toBe('引用一句');
  });

  test('标题紧跟正文（无空行）仍独立成块，导出 Markdown 不被误判为整块标题', () => {
    const chunks = WritingDoc.splitDraft('# 标题\n正文段落一', 500);
    expect(levels(chunks)).toEqual(['h1', 'p']);
  });

  test('连续列表行合并为一块 ul（而非一行一张卡）', () => {
    const chunks = WritingDoc.splitDraft('- a\n- b\n- c', 500);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].level).toBe('ul');
    expect(chunks[0].text).toBe('a\n- b\n- c');
  });

  test('纯文本空行分段', () => {
    const draft = ['一段。', '', '二段。', '', '三段。'].join('\n');
    const chunks = WritingDoc.splitDraft(draft, 500);
    expect(levels(chunks)).toEqual(['p', 'p', 'p']);
    expect(chunks.map((c) => c.text)).toEqual(['一段。', '二段。', '三段。']);
  });

  test('无空行 → 每行自成一段', () => {
    const chunks = WritingDoc.splitDraft('行一\n行二\n行三', 500);
    expect(chunks).toHaveLength(3);
    expect(levels(chunks)).toEqual(['p', 'p', 'p']);
  });

  test('超长块按句末硬切，续段不继承标题级，且每块 ≤ maxLen', () => {
    const draft = '一。二。三。四。五。六。七。八。九。十。';  // 20 字带句号
    const chunks = WritingDoc.splitDraft(draft, 10);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c) => {
      expect(c.text.length).toBeLessThanOrEqual(10);
      expect(c.level).toBe('p');
    });
    expect(chunks[0].text.endsWith('。')).toBe(true);   // 切在句读处
  });

  test('无句读的超长块在 maxLen 处硬断', () => {
    const chunks = WritingDoc.splitDraft('a'.repeat(20), 10);
    expect(chunks.map((c) => c.text.length)).toEqual([10, 10]);
    expect(levels(chunks)).toEqual(['p', 'p']);
  });

  test('外部复制的乱缩进被清洗，不污染 Markdown 语义', () => {
    const draft = ['\t\t# 标题', '   正文段落'].join('\n');
    const chunks = WritingDoc.splitDraft(draft, 500);
    expect(levels(chunks)).toEqual(['h1', 'p']);
    expect(chunks[0].text).toBe('标题');
  });

  test('纯标题草稿（无正文）也稳定成块', () => {
    const chunks = WritingDoc.splitDraft('# 仅标题\n\n', 500);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].level).toBe('h1');
    expect(chunks[0].text).toBe('仅标题');
  });
});
