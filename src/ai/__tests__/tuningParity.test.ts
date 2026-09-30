import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TUNING, buildHolidays } from '../healthScore';

/**
 * 宿主↔前端「健康分引擎」parity / 收敛 测试。
 *
 * M2（方案 B）已把评分引擎收敛到宿主唯一源：webapp 的 `modules/goals/healthScore.js`
 * 不再本地计算（compute / computeSet / _score 系列 / _buildDataCache / HOLIDAYS 均已删除），
 * 只保留渲染 + 诊断文案。因此：
 *  1. TUNING 仍两份（webapp 渲染读 HINT_* 与 SUGGESTION_*），需全量深比较防漂移；
 *  2. webapp 源码里不得再出现评分算法标记（防有人把本地引擎悄悄加回来）。
 */
function loadWebappHealthScore(): { TUNING: Record<string, number> } {
  const src = readFileSync('webapp/assets/scripts/modules/goals/healthScore.js', 'utf8');
  const stripped = src
    .replace(/^export\s+(const|let|var|function|class|default)\s+/gm, '$1 ')
    .replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '');
  const fn = new Function(`const window = globalThis;\n${stripped}\nreturn { TUNING };`);
  return fn() as never;
}

describe('TUNING 宿主↔前端全量 parity（防常量漂移）', () => {
  it('TUNING 全量深比较一致（38 个权重/阈值）', () => {
    const web = loadWebappHealthScore();
    expect(web.TUNING).toEqual(TUNING);
  });

  it('宿主 buildHolidays 仍含 2026 春节（表驱动重构不破坏既有口径）', () => {
    expect(buildHolidays(2026).has('2026-02-16')).toBe(true);
  });

  it('未登记年份优雅跳过（不 crash、不产出错误日期）', () => {
    // 2030 尚未登记春节，应仍返回一个只含法定节假日的集合
    const h = buildHolidays(2030);
    expect(h.has('2030-01-01')).toBe(true);
    expect(h.has('2030-10-01')).toBe(true);
    // 未知春节日期不得凭空出现
    expect([...h].some((d) => d.startsWith('2030-02') && d.includes('-10'))).toBe(false);
  });
});

describe('M2 收敛：webapp 本地评分引擎已删除', () => {
  const src = () =>
    readFileSync('webapp/assets/scripts/modules/goals/healthScore.js', 'utf8');

  it.each([
    'computeSet(',
    '_buildDataCache(',
    '_getGlobalDataCache(',
    'HOLIDAYS:',
    '_countWorkdays(',
    '_scoreBalance(',
    '_scoreProgressTrend(',
    '_levelFor(',
    'generateDynamicHints(',
  ])('webapp 源码不得再出现本地评分/诊断标记 %s', (marker) => {
    expect(src()).not.toContain(marker);
  });

  it('webapp 只保留渲染入口（renderOverviewCard / _generateSuggestion / invalidateCache）', () => {
    const s = src();
    expect(s).toContain('renderOverviewCard');
    expect(s).toContain('_generateSuggestion');
    expect(s).toContain('invalidateCache');
  });
});
