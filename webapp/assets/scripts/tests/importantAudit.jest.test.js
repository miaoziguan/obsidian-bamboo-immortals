/**
 * !important 使用量审计锁（Obsidian 插件审核友好性）。
 *
 * Obsidian 社区插件指南建议避免 !important —— 它会挡住主题/用户的覆盖。
 * 本项目的立场：
 *   · 能用「特异度」或「内联声明」解决的，一律不用 !important；
 *   · 仅保留【规范上真正需要】的少数几条，并在此处钉死数量与属性，防止悄悄变多。
 *
 * 允许清单（4 条，全在 bamboo-garden.css，理由见该文件注释）：
 *   animation-play-state: paused ×3  —— 主题 CSS 运行时后注入 + animation 简写重置 play-state，
 *                                       同特异度后定义者胜出，只能靠 !important 真正停住动画；
 *   filter: none ×1                   —— 要覆盖元素上的【内联 style】，非 !important 无法覆盖内联样式。
 */
const fs = require('fs');
const path = require('path');

const STYLES = path.join(__dirname, '../../styles');
const THEME_EFFECTS = path.join(__dirname, '../modules/theme-effects.js');

/** 剥掉注释后收集所有带 !important 的声明（避免把注释里的 "!important" 误算进来） */
function importantDecls() {
  const out = [];
  for (const f of fs.readdirSync(STYLES)) {
    if (!f.endsWith('.css')) continue;
    const clean = fs.readFileSync(path.join(STYLES, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      for (const d of m[2].split(';')) {
        if (/!\s*important/i.test(d)) {
          out.push({ file: f, prop: d.split(':')[0].trim() });
        }
      }
    }
  }
  return out;
}

describe('!important 审计', () => {
  test('CSS 中 !important 声明总数不超过 4 条（且都在 bamboo-garden.css）', () => {
    const list = importantDecls();
    expect(list.length).toBeLessThanOrEqual(4);
    expect([...new Set(list.map((x) => x.file))]).toEqual(['bamboo-garden.css']);
  });

  test('保留的 !important 仅限 animation-play-state / filter', () => {
    const props = [...new Set(importantDecls().map((x) => x.prop))].sort();
    expect(props).toEqual(['animation-play-state', 'filter']);
  });

  test('theme-effects 不得用 important 优先级（内联普通声明已足够）', () => {
    const src = fs.readFileSync(THEME_EFFECTS, 'utf8');
    expect(/'important'/.test(src)).toBe(false);
  });
});
