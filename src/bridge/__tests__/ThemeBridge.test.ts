import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

  it('textNormal 与 bgPrimary 不满足 4.5:1 时自动调整', () => {
    // 亮色模式下用一个接近背景色的低对比前景
    const vars = ThemeBridge.computeObsidianVars(120, 0, false);
    const bgRgb = ThemeBridge.parseColorToRgb(vars['--background-primary'])!;
    const textNormalRgb = ThemeBridge.parseColorToRgb(vars['--text-normal'])!;
    expect(ThemeBridge.contrastRatio(textNormalRgb, bgRgb)).toBeGreaterThanOrEqual(4.5);
  });

  it('textMuted 与 bgPrimary 不满足 3:1 时自动调整', () => {
    const vars = ThemeBridge.computeObsidianVars(120, 0, false);
    const bgRgb = ThemeBridge.parseColorToRgb(vars['--background-primary'])!;
    const textMutedRgb = ThemeBridge.parseColorToRgb(vars['--text-muted'])!;
    expect(ThemeBridge.contrastRatio(textMutedRgb, bgRgb)).toBeGreaterThanOrEqual(3);
  });
});

describe('ThemeBridge WCAG helpers', () => {
  it('相同灰度对比度为 1:1', () => {
    const gray: [number, number, number] = [128, 128, 128];
    expect(ThemeBridge.contrastRatio(gray, gray)).toBe(1);
  });

  it('黑白对比度约为 21:1', () => {
    const black: [number, number, number] = [0, 0, 0];
    const white: [number, number, number] = [255, 255, 255];
    expect(ThemeBridge.contrastRatio(black, white)).toBeCloseTo(21, 0);
  });

  it('ensureContrast 自动调整后的颜色满足 4.5:1', () => {
    const adjusted = ThemeBridge.ensureContrast('#777777', '#ffffff', 4.5);
    const adjustedRgb = ThemeBridge.parseColorToRgb(adjusted);
    expect(adjustedRgb).not.toBeNull();
    expect(ThemeBridge.contrastRatio(adjustedRgb!, [255, 255, 255])).toBeGreaterThanOrEqual(4.5);
  });

  it('ensureContrast 保持 hex 格式', () => {
    const adjusted = ThemeBridge.ensureContrast('#777777', '#ffffff', 4.5);
    expect(adjusted).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('ensureContrast 保持 rgb 格式', () => {
    const adjusted = ThemeBridge.ensureContrast('rgb(119, 119, 119)', 'rgb(255, 255, 255)', 4.5);
    expect(adjusted).toMatch(/^rgb\(/);
  });

  it('ensureContrast 保持 hsl 格式', () => {
    const adjusted = ThemeBridge.ensureContrast('hsl(0, 0%, 47%)', 'hsl(0, 0%, 100%)', 4.5);
    expect(adjusted).toMatch(/^hsl\(/);
  });

  it('ensureContrast 对已满足对比度的颜色原样返回', () => {
    const adjusted = ThemeBridge.ensureContrast('#000000', '#ffffff', 4.5);
    expect(adjusted).toBe('#000000');
  });
});

/**
 * restoreAllDefaults 单测：验证「将调色同步到 Obsidian」关闭时，
 * 遍历 registry 清理所有 AppAPI 实例（各自 trailing 防抖定时器 + _suppressed），
 * 而非仅清理 default 进程单例——否则 50ms 防抖窗口内关闭开关，
 * AppAPI 实例的 trailing 回调会把刚清空的 body 变量重新写回。
 */
describe('ThemeBridge.restoreAllDefaults', () => {
  let removeProperty: ReturnType<typeof vi.fn>;
  let setProperty: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    removeProperty = vi.fn();
    setProperty = vi.fn();
    // ThemeBridge.restoreDefaults/_applyPaletteNow 依赖 Obsidian 注入的 activeDocument 全局
    vi.stubGlobal('activeDocument', {
      body: { style: { removeProperty, setProperty } },
    });
    vi.stubGlobal('window', {
      setTimeout: vi.fn(() => 1),
      clearTimeout: vi.fn(),
    });
  });

  afterEach(() => {
    // 先在 stub 仍生效时清理 registry（detachIframe 从 registry 移除 + 清定时器），
    // 再还原全局，避免用例间互相污染或引用已还原的 activeDocument
    ((ThemeBridge as unknown as { registry: Set<ThemeBridge> }).registry).forEach((bridge) =>
      bridge.detachIframe()
    );
    ThemeBridge.restoreAllDefaults();
    vi.unstubAllGlobals();
  });

  it('registry 中每个实例的 trailing 防抖定时器都被取消', () => {
    const bridgeA = new ThemeBridge();
    const bridgeB = new ThemeBridge();
    bridgeA.attachIframe({ contentWindow: { postMessage: vi.fn() } } as any);
    bridgeB.attachIframe({ contentWindow: { postMessage: vi.fn() } } as any);

    // 两实例各触发一次 applyPalette：leading 立即写入，trailing 定时器挂起（stub 返回 id=1）
    bridgeA.applyPalette(120, 0, false);
    bridgeB.applyPalette(200, 5, true);
    expect(setProperty).toHaveBeenCalled();

    removeProperty.mockClear();
    setProperty.mockClear();

    ThemeBridge.restoreAllDefaults();

    // clearTimeout 被调用（取消挂起的 trailing 定时器）
    expect(window.clearTimeout).toHaveBeenCalled();
    // 注入的 7 个变量被移除
    const removed = removeProperty.mock.calls.map((c) => c[0]);
    expect(removed).toEqual(
      expect.arrayContaining([
        '--interactive-accent',
        '--background-primary',
        '--text-normal',
      ])
    );
    // restoreDefaults 之后不应再有 setProperty（trailing 未重新注入）
    expect(setProperty).not.toHaveBeenCalled();
  });

  it('restoreAllDefaults 后新调色请求仍可立即生效（_suppressed 不跨实例污染）', () => {
    const bridge = new ThemeBridge();
    bridge.attachIframe({ contentWindow: { postMessage: vi.fn() } } as any);
    bridge.applyPalette(120, 0, false);
    ThemeBridge.restoreAllDefaults();

    setProperty.mockClear();
    bridge.applyPalette(120, 0, false);
    // 新请求解除抑制：leading edge 立即写入
    expect(setProperty).toHaveBeenCalled();
  });
});
