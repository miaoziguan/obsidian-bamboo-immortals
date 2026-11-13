/**
 * @jest-environment jsdom
 */
/**
 * 表格层级（table）契约：整表成块、级别识别、徽标 / 色相 / 阶梯归属。
 * 钉死两个已踩过的坑：
 *   ① splitDraft 会把表格逐行切成 N 张卡，超 MAX_LEN 还会从句读处拦腰切断；
 *   ② 表格是「块类型」不是标题深度，不能进 LEVEL_LADDER（升降级按钮只走 h1…h6→p）。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
const { LEVELS, LEVEL_LABELS, LEVEL_GROUPS, LEVEL_LADDER } = loadModule(
  'handlers/features/twConfig.js',
  ['LEVELS', 'LEVEL_LABELS', 'LEVEL_GROUPS', 'LEVEL_LADDER'],
);
const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

const TABLE = [
  '| 检测点 | 本文所在位置 | 预期表现 |',
  '|---|---|---|',
  '| H1 | 标题「可视化写作实验手记」 | 最深色（色带一端） |',
  '| H2 | 「一、…」「二、…」「三、…」 | 触发分幕；中等权重 |',
].join('\n');

describe('WritingDoc — 表格识别与整表成块', () => {
  test('detectLevel 识别表格并保留完整 markdown（与 task 同理不剥语法）', () => {
    expect(WritingDoc.detectLevel(TABLE)).toEqual({ level: 'table', text: TABLE });
  });

  test('水平线 + 上一行含竖线不被误判成表格', () => {
    expect(WritingDoc.detectLevel('a | b\n---\nc').level).toBe('p');
    expect(WritingDoc.detectLevel('普通正文\n第二行').level).toBe('p');
  });

  test('无空行稿子：整张表成一张 table 卡，不被逐行切碎', () => {
    // 稿子无空行 → 原规则④「每行自成一段」；表格必须例外，否则表头/分隔/数据四散
    const chunks = WritingDoc.splitDraft(`开头一句\n${TABLE}\n结尾一句`);
    const tables = chunks.filter((c) => c.level === 'table');
    expect(tables.length).toBe(1);
    expect(tables[0].text).toBe(TABLE);
    expect(chunks.some((c) => c.text === '开头一句')).toBe(true);
    expect(chunks.some((c) => c.text === '结尾一句')).toBe(true);
  });

  test('超 MAX_LEN 的表格整块豁免硬切，表头与数据行不分家', () => {
    const longCell = '很长的说明内容'.repeat(60);
    const longTable = `| 列一 | 列二 |\n|---|---|\n| ${longCell} | 值 |`;
    const chunks = WritingDoc.splitDraft(longTable, 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].level).toBe('table');
    expect(chunks[0].text).toContain('|---|---|');
    expect(chunks[0].text).toContain(longCell);
  });

  test('normalize 保留 table level（LEVELS 白名单不能漏，否则会被降级成 p）', () => {
    const res = WritingDoc.normalize([{ id: 'a', seq: 0, text: TABLE, level: 'table' }], [], { x: 0, y: 0 });
    const notes = Array.isArray(res) ? res : ((res && res.notes) || []);
    expect(notes[0].level).toBe('table');
  });
});

describe('twConfig — 表格层级归属', () => {
  test('LEVELS / 标签 / 分组都含 table，徽标显示「表格」', () => {
    expect(LEVELS).toContain('table');
    expect(LEVEL_LABELS.table).toBe('表格');
    expect(LEVEL_GROUPS.some((g) => g.items.indexOf('table') >= 0)).toBe(true);
  });

  test('table 不进 LEVEL_LADDER（那是标题深度阶梯，升降级按钮用）', () => {
    expect(LEVEL_LADDER).not.toContain('table');
    expect(LEVEL_LADDER).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']);
  });
});

describe('notes.css — 表格色相与徽标同源', () => {
  test('色值只存一处，亮/暗两套 tint，data-level 与菜单圆点都转发', () => {
    expect(NOTES_CSS).toMatch(/--bm-tint-src-table:\s*#[0-9A-Fa-f]{6}/);
    expect(NOTES_CSS).toMatch(/--bm-tint-table:\s*var\(--bm-tint-src-table\)/);
    expect(NOTES_CSS).toMatch(/:host\(\.dark\)\s*\{[^}]*--bm-tint-table:/);
    expect(NOTES_CSS).toContain('.tw-card[data-level="table"] { --lv-color: var(--bm-tint-table); }');
    expect(NOTES_CSS).toContain('.tw-level-dot[data-level="table"] { background: var(--bm-tint-table); }');
  });

  test('表格描边跟随主题墨色，不能再写死半透明白（浅色纸样上会隐形）', () => {
    const start = NOTES_CSS.indexOf('.tw-card-text .tw-md-table th,');
    // 只取表格样式块本身：其后的行内 / 列表 / 编辑工具条样式不属于表格描边
    const seg = NOTES_CSS.slice(start, NOTES_CSS.indexOf('/* Markdown 行内格式投影', start));
    expect(seg).toContain('border: 1px solid var(--tw-write-line,');
    expect(seg).toContain('currentColor');   // 便签档没有 --tw-write-line 时的兜底
    expect(seg).not.toContain('rgba(var(--white-rgb)');
  });

  test('表格层级亮/暗两套铺色强度都定义（漏暗色会让明暗失衡）', () => {
    expect(NOTES_CSS).toContain(
      '.tw-canvas.tw-mode-write.tw-lv-tint .tw-card[data-level="table"] { --bm-tint-mix: 14%; }'
    );
    expect(NOTES_CSS).toContain(
      ':host(.dark) .tw-canvas.tw-mode-write.tw-lv-tint .tw-card[data-level="table"] { --bm-tint-mix: 26%; }'
    );
  });
});
