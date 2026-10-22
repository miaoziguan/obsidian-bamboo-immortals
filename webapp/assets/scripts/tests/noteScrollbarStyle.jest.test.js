/**
 * 便签正文滚动条样式契约。
 *
 * 事故：素笺/红笺等纸样给 .tw-card-text 设了 overflow:auto，但没有任何滚动条样式；
 * 亮色下（只有 :host(.dark) 的暗色全局滚动条）会回退浏览器默认灰条，
 * 与画中卷 .tw-input / 模态框 .modal-body 的细圆角新设计不一致。
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

describe('便签正文滚动条样式契约', () => {
  test('.tw-card-text 使用细滚动条（scrollbar-width: thin）', () => {
    const vals = rulesMatching('.tw-card-text').map((r) => decl(r.body, 'scrollbar-width')).filter(Boolean);
    expect(vals).toContain('thin');
  });

  test('::-webkit-scrollbar 细轨道 6px，thumb 有主题色底 + 圆角', () => {
    const w = rulesMatching('.tw-card-text::-webkit-scrollbar').map((r) => decl(r.body, 'width')).filter(Boolean);
    expect(w).toContain('6px');

    const thumbs = rulesMatching('.tw-card-text::-webkit-scrollbar-thumb');
    const bg = thumbs.map((r) => decl(r.body, 'background')).filter(Boolean);
    expect(bg.some((b) => b.includes('bamboo-deep-rgb'))).toBe(true);
    const radius = thumbs.map((r) => decl(r.body, 'border-radius')).filter(Boolean);
    expect(radius.length).toBeGreaterThan(0);
  });

  test('暗色下 thumb 换亮绿（:host(.dark)）', () => {
    const bg = rulesMatching(':host(.dark) .tw-card-text::-webkit-scrollbar-thumb')
      .map((r) => decl(r.body, 'background')).filter(Boolean);
    expect(bg.some((b) => b.includes('green-very-bright-rgb'))).toBe(true);
  });
});
