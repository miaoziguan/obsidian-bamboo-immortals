import { describe, it, expect } from 'vitest';
import { ThemeBridge } from '../ThemeBridge';

/**
 * computeObsidianVars 单测：覆盖调色联动的两条修复
 *   1. 色相=0（纯红）不能因任何兜底被写成默认竹青绿（hue 120）
 *   2. 「明度」偏移 lo 必须作用于 --interactive-accent 亮度，
 *      与 webapp 侧 --accent-lightness-offset 语义一致（正值提亮）
 *   3. lo 越界钳制（[-30, 30]）
 */
describe('ThemeBridge.computeObsidianVars', () => {
  it('色相=0（纯红）输出 hsl(0, …) 强调色，而非默认竹青绿 120', () => {
    const vars = ThemeBridge.computeObsidianVars(0, 0, false);
    expect(vars['--interactive-accent']).toBe('hsl(0, 40%, 40%)');
    expect(vars['--interactive-accent']).not.toContain('hsl(120,');
    expect(vars['--text-accent']).toBe('hsl(0, 40%, 40%)');
  });

  it('非 0 色相原样写入（如 200 蓝）', () => {
    const vars = ThemeBridge.computeObsidianVars(200, 0, false);
    expect(vars['--interactive-accent']).toBe('hsl(200, 40%, 40%)');
  });

  it('明度偏移 lo 作用于强调色亮度（正值提亮）', () => {
    const base = ThemeBridge.computeObsidianVars(120, 0, false);
    const bright = ThemeBridge.computeObsidianVars(120, 30, false);
    const dark = ThemeBridge.computeObsidianVars(120, -30, false);

    // 亮色模式下 base=40%，+30→70%（夹紧到 70），-30→10% 但夹紧到下限 15%
    expect(base['--interactive-accent']).toBe('hsl(120, 40%, 40%)');
    expect(bright['--interactive-accent']).toBe('hsl(120, 40%, 70%)');
    expect(dark['--interactive-accent']).toBe('hsl(120, 40%, 15%)');

    // hover 比 accent 高 5%（夹紧 95）
    expect(bright['--interactive-accent-hover']).toBe('hsl(120, 40%, 75%)');
  });

  it('暗色模式下明度偏移同样作用于强调色', () => {
    const base = ThemeBridge.computeObsidianVars(120, 0, true);
    const bright = ThemeBridge.computeObsidianVars(120, 30, true);
    const dark = ThemeBridge.computeObsidianVars(120, -30, true);

    // 暗色模式 base=50%，+30→80%（夹紧），-30→20% 夹紧到下限 30%
    expect(base['--interactive-accent']).toBe('hsl(120, 40%, 50%)');
    expect(bright['--interactive-accent']).toBe('hsl(120, 40%, 80%)');
    expect(dark['--interactive-accent']).toBe('hsl(120, 40%, 30%)');
  });

  it('明度偏移越界被钳制在 [-30, 30]', () => {
    const over = ThemeBridge.computeObsidianVars(120, 999, false);
    const under = ThemeBridge.computeObsidianVars(120, -999, false);
    // 999→30：light 40+30=70；-999→-30：light 40-30=10 夹紧 15
    expect(over['--interactive-accent']).toBe('hsl(120, 40%, 70%)');
    expect(under['--interactive-accent']).toBe('hsl(120, 40%, 15%)');
  });

  it('返回完整的核心色变量键集合', () => {
    const vars = ThemeBridge.computeObsidianVars(120, 0, false);
    expect(Object.keys(vars).sort()).toEqual(
      [
        '--background-primary',
        '--background-secondary',
        '--interactive-accent',
        '--interactive-accent-hover',
        '--text-accent',
        '--text-muted',
        '--text-normal',
      ].sort()
    );
    // 文字/背景仍受色相影响
    expect(vars['--text-normal']).toBe('hsl(120, 6%, 12%)');
    expect(vars['--background-primary']).toContain('hsl(120,');
  });
});
