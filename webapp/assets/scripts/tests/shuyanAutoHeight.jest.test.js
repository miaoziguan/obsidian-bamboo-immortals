/**
 * 素笺（shuyan）「定宽不定高」契约。
 *
 * 需求：素笺卡片随正文内容长高，尽量不出现滚动条。
 * 改造前：卡片 aspect-ratio:600/300 定高，正文被绝对定位在框里 + overflow:auto → 超出即滚。
 * 改造后：卡片只留 min-height（保住短便签的设计比例），正文回常规流，装饰画按宽度等比绘制。
 */
const fs = require('fs');
const path = require('path');

const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');

function parseRules(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) out.push({ sel: m[1].replace(/\s+/g, ' ').trim(), body: m[2] });
  return out;
}
const RULES = parseRules(NOTES_CSS);
function rulesMatching(selector) {
  return RULES.filter((r) => r.sel.split(',').some((s) => s.trim() === selector));
}
function decl(body, prop) {
  const m = body.match(new RegExp('(?:^|;|\\n)\\s*' + prop + '\\s*:\\s*([^;]+)'));
  return m ? m[1].trim() : null;
}

describe('素笺（shuyan）定宽不定高', () => {
  test('卡片不再定高：无 aspect-ratio，改用 min-height 保底比例', () => {
    const card = rulesMatching('.tw-card[data-paper="shuyan"]');
    expect(card.length).toBeGreaterThan(0);
    const vals = card.map((r) => decl(r.body, 'aspect-ratio')).filter(Boolean);
    expect(vals).toEqual([]);                                  // 定高已移除
    const mh = card.map((r) => decl(r.body, 'min-height')).filter(Boolean);
    expect(mh.length).toBeGreaterThan(0);                      // 有保底高度
  });

  test('正文回常规流：不再绝对定位、不再 overflow:auto（内容撑高卡片）', () => {
    const txt = rulesMatching('.tw-card[data-paper="shuyan"] .tw-card-text');
    expect(txt.length).toBeGreaterThan(0);
    const body = txt[txt.length - 1].body;
    expect(decl(body, 'position')).not.toBe('absolute');
    expect(decl(body, 'overflow')).toBeNull();                 // 不再滚动
    expect(decl(body, 'margin')).toBeTruthy();                 // 用 margin 定位到右侧正文栏
  });

  test('装饰画按宽度等比绘制（100% auto），不再 100% 100% 拉伸', () => {
    const after = rulesMatching('.tw-card[data-paper="shuyan"] .tw-card-main::after');
    expect(after.length).toBeGreaterThan(0);
    const size = after.map((r) => decl(r.body, 'background-size')).filter(Boolean);
    expect(size.some((v) => v.startsWith('100% auto'))).toBe(true);
    expect(size.some((v) => v.startsWith('100% 100%'))).toBe(false);
  });
});
