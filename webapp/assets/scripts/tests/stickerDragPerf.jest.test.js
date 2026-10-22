/**
 * 贴纸拖动性能契约。
 *
 * 事故：太阳精华 / 月亮精华 等「内容复杂」的贴纸拖动时掉帧、不跟手。
 * 根因：.bm-sticker 同时承载 filter: drop-shadow(...) 与拖动用的 transform：
 *   每帧改 transform 都要重新栅格化两层 drop-shadow 模糊；内容越复杂越贵，
 *   超过帧预算即卡顿。尺寸不是主因（更大的简单贴纸不卡）。
 *
 * 约定：拖动期间（.dragging）临时关闭投影，松手恢复。这里钉死该契约，
 * 防止有人删掉 .bm-sticker.dragging 的 filter:none（则卡顿回归），
 * 也防止静止态投影被误删（则丢掉纸片质感）。
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

describe('贴纸拖动性能契约', () => {
  test('静止态 .bm-sticker 仍带 drop-shadow 投影（保住纸片质感）', () => {
    const filters = rulesMatching('.bm-sticker').map((r) => decl(r.body, 'filter')).filter(Boolean);
    expect(filters.some((f) => f.includes('drop-shadow'))).toBe(true);
  });

  test('拖动态 .bm-sticker.dragging 关闭 filter（消除每帧 drop-shadow 重栅格化）', () => {
    const eff = rulesMatching('.bm-sticker.dragging').map((r) => decl(r.body, 'filter'));
    expect(eff).toContain('none');
  });

  test('暗色拖动态 :host(.dark) .bm-sticker.dragging 同样关闭 filter', () => {
    const eff = rulesMatching(':host(.dark) .bm-sticker.dragging').map((r) => decl(r.body, 'filter'));
    expect(eff).toContain('none');
  });

  test('贴纸离屏跳过渲染（content-visibility: auto）', () => {
    const vals = rulesMatching('.bm-sticker').map((r) => decl(r.body, 'content-visibility')).filter(Boolean);
    expect(vals).toContain('auto');
  });
});
