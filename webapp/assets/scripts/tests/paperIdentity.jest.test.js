/**
 * 纸样身份契约 —— 防「id 与中文名认反」的回归锁。
 *
 * 事故：曾把 plain 与 shuyan 认反（误以为 素笺=shuyan），于是把「素笺定宽不定高」
 * 的需求改到了 shuyan 身上 —— 而 shuyan 是【书燕】：600/300 定高画框纸样。
 * 结果摘掉了画里包住正文的矩形框、改了装饰画的绘制方式，书燕样式明显变化。
 *
 * 真实映射（PAPER_LABELS）：
 *   素笺 = plain      夜光 = night      书燕 = shuyan
 *   红绸 = redsilk    若水 = ruoshui    腾云 = tengyun    举火 = juhuo    映月 = yingyue
 *
 * 本文件把「谁是谁」以及「各自的布局性质」钉死：
 *   · 素笺(plain) / 夜光(night)：定宽不定高 —— 不得加 height / aspect-ratio，正文不得绝对定位滚动；
 *   · 书燕(shuyan) 及其余装饰纸样：定高画框 —— 美术不可动（改动应走字号自适应，而非改画）。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

const NOTES_CSS = fs.readFileSync(path.join(__dirname, '../../styles/notes.css'), 'utf8');
const { PAPER_LABELS } = loadModule('handlers/features/twConfig.js', ['PAPER_LABELS']);

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
const valsOf = (selector, prop) => rulesMatching(selector).map((r) => decl(r.body, prop)).filter(Boolean);

describe('纸样 id ↔ 中文名映射（防认反）', () => {
  test('素笺 = plain，夜光 = night，书燕 = shuyan', () => {
    expect(PAPER_LABELS.plain).toBe('素笺');
    expect(PAPER_LABELS.night).toBe('夜光');
    expect(PAPER_LABELS.shuyan).toBe('书燕');
  });

  test('其余装饰纸样名称映射', () => {
    expect(PAPER_LABELS.redsilk).toBe('红绸');
    expect(PAPER_LABELS.ruoshui).toBe('若水');
    expect(PAPER_LABELS.tengyun).toBe('腾云');
    expect(PAPER_LABELS.juhuo).toBe('举火');
    expect(PAPER_LABELS.yingyue).toBe('映月');
  });
});

describe('素笺 / 夜光：定宽不定高（不得加定高或把正文钉进框里）', () => {
  ['plain', 'night'].forEach((p) => {
    test(`${p} 的卡片无 height / aspect-ratio 约束`, () => {
      expect(valsOf(`.tw-card[data-paper="${p}"]`, 'aspect-ratio')).toEqual([]);
      expect(valsOf(`.tw-card[data-paper="${p}"]`, 'height')).toEqual([]);
    });

    test(`${p} 的正文在常规流（不绝对定位、不滚动）`, () => {
      expect(valsOf(`.tw-card[data-paper="${p}"] .tw-card-text`, 'position')).not.toContain('absolute');
      expect(valsOf(`.tw-card[data-paper="${p}"] .tw-card-text`, 'overflow')).toEqual([]);
    });
  });
});

describe('书燕及装饰纸样：定高画框，美术不得改动', () => {
  test('书燕(shuyan) 保持 600/300 定高 + 正文绝对定位滚动', () => {
    expect(valsOf('.tw-card[data-paper="shuyan"]', 'aspect-ratio')).toContain('600 / 300');
    expect(valsOf('.tw-card[data-paper="shuyan"] .tw-card-text', 'position')).toContain('absolute');
    expect(valsOf('.tw-card[data-paper="shuyan"] .tw-card-text', 'overflow')).toContain('auto');
  });

  test('书燕装饰画保持 100% 100% 铺满，且画内矩形框仍在', () => {
    const size = valsOf('.tw-card[data-paper="shuyan"] .tw-card-main::after', 'background-size');
    expect(size.some((v) => v.startsWith('100% 100%'))).toBe(true);
    const after = rulesMatching('.tw-card[data-paper="shuyan"] .tw-card-main::after');
    expect(after.length).toBeGreaterThan(0);
    expect(after[after.length - 1].body).toContain('matrix(1.328526'); // 包住正文的矩形框
  });

  test('其余装饰纸样保持 600/300 定高（字号自适的前提）', () => {
    ['redsilk', 'ruoshui', 'tengyun', 'juhuo', 'yingyue'].forEach((p) => {
      expect(valsOf(`.tw-card[data-paper="${p}"]`, 'aspect-ratio')).toContain('600 / 300');
    });
  });
});
