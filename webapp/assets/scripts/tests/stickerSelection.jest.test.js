/**
 * 贴纸「选中态」契约。
 *
 * 事故：贴纸（尤其依附便签后）难以"选中调整"——点选后其实已加 .selected 类，
 * 但 .bm-sticker.selected 没有任何样式，界面毫无反馈；手柄又只在 hover 出现。
 *
 * 约定：
 *  - .bm-sticker.selected 必须有可见描边（对齐 .tw-card.selected 的金色选中视觉）；
 *  - 选中时旋转 / 缩放 / 更多手柄常显（不再只 hover）；
 *  - 手柄热区足够大（>= 24px）。
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

describe('贴纸选中态契约', () => {
  test('.bm-sticker.selected 有金色描边（可见的选中反馈）', () => {
    const outlines = rulesMatching('.bm-sticker.selected').map((r) => decl(r.body, 'outline')).filter(Boolean);
    expect(outlines.some((o) => o.includes('solid'))).toBe(true);
    expect(outlines.some((o) => o.includes('#c9a24a'))).toBe(true);
  });

  test('选中时旋转 / 缩放手柄常显（opacity:1）', () => {
    const rot = rulesMatching('.bm-sticker.selected .bm-sticker-rotate').map((r) => decl(r.body, 'opacity'));
    const rs = rulesMatching('.bm-sticker.selected .bm-sticker-resize').map((r) => decl(r.body, 'opacity'));
    expect(rot).toContain('1');
    expect(rs).toContain('1');
  });

  test('选中时「更多」手柄常显（opacity:1）', () => {
    const more = rulesMatching('.bm-sticker.selected .bm-sticker-more').map((r) => decl(r.body, 'opacity'));
    expect(more).toContain('1');
  });

  test('手柄热区 >= 24px（便于点中）', () => {
    expect(decl(rulesMatching('.bm-sticker-rotate')[0].body, 'width')).toBe('24px');
    expect(decl(rulesMatching('.bm-sticker-more')[0].body, 'width')).toBe('24px');
  });
});
