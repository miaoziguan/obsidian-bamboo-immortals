/**
 * 便签正文排版契约：正文两端对齐。
 *
 * 需求：便签内部文字任何时候都应是两端对齐（flush both edges），
 * 而不是默认左对齐产生的参差右缘。
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

describe('便签正文排版契约', () => {
  test('.tw-card-text 两端对齐（text-align: justify）', () => {
    const vals = rulesMatching('.tw-card-text').map((r) => decl(r.body, 'text-align')).filter(Boolean);
    expect(vals).toContain('justify');
  });
});
