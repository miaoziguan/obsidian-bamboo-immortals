/**
 * !important 使用量审计锁（Obsidian 插件审核友好性）。
 *
 * Obsidian 社区插件指南建议避免 !important —— 它会挡住主题/用户的覆盖。
 * 本项目此前在 bamboo-garden.css 保留了 4 处（animation-play-state ×3 + filter ×1），
 * 理由是「主题 CSS 运行时后注入 + animation 简写重置 play-state / 需覆盖内联 filter」。
 *
 * 现已改为由 ThemeEffects._applyPauseAndMotion() 承担：
 *   · 用 Element.getAnimations({subtree:true}).pause()/play() 直接控制动画对象（天然压过主题简写）；
 *   · 静止档就地清除元素内联 filter（保存原值，离开静止档时还原）。
 * 于是全仓 CSS 不再需要任何 !important —— 本测试把「0 条」钉死，防止回潮。
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
  test('CSS 中不得出现任何 !important 声明（0 条）', () => {
    const list = importantDecls();
    expect(list).toEqual([]);
  });

  test('暂停/静止档的动画控制由 JS（Web Animations API）承担，且不得用 important 优先级', () => {
    const src = fs.readFileSync(THEME_EFFECTS, 'utf8');
    expect(/getAnimations\s*\(/.test(src)).toBe(true);   // 用 WAAPI 控制动画
    expect(/\.pause\s*\(/.test(src)).toBe(true);
    expect(/'important'/.test(src)).toBe(false);         // 仍不得使用 important 优先级
  });
});
