
/**
 * ThemeBridge - 监听 Obsidian 主题变化，推送到 iframe
 *              + 反向：接收 webapp 调色值，注入 Obsidian 原生界面
 */
export class ThemeBridge {
    private iframe: HTMLIFrameElement | null = null;
    private _paletteSyncTimer: number | null = null;

    /** 存储注入的 CSS 变量键名，用于 restoreDefaults 清理 */
    private static readonly INJECTED_VARS = [
      '--interactive-accent',
      '--interactive-accent-hover',
      '--text-accent',
      '--background-primary',
      '--background-secondary',
      '--text-normal',
      '--text-muted',
    ];

    /** 防抖竞态标记：restoreDefaults 被调用后设为 true，阻止延迟回调覆写（实例级，避免分屏多实例互相干扰 H9） */
    private _suppressed = false;

  attachIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
  }

  detachIframe(): void {
    this.iframe = null;
  }

  /** 获取当前 Obsidian 明暗状态（仅内部使用） */
  private isDarkMode(): boolean {
    return activeDocument.body.classList.contains('theme-dark');
  }

  /**
   * 解析 CSS 颜色字符串 → [r, g, b]（0–255 整数）
   * 支持 rgb()/rgba()/#hex（3 或 6 位）/hsl()/hsla()；无法解析返回 null
   */
  static parseColorToRgb(color: string): [number, number, number] | null {
    if (!color) return null;
    const c = color.trim();
    let r: number, g: number, b: number;

    const rgbMatch = c.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      // 兼容逗号 / 空格分隔：rgb(255, 128, 64) 与 rgb(255 128 64)（H1/M2）
      const parts = rgbMatch[1]
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((s) => parseFloat(s));
      if (parts.length < 3) return null;
      [r, g, b] = parts;
    } else if (c[0] === '#') {
      let hex = c.slice(1).trim();
      // 支持 3/4/6/8 位：#abc、#abcd（每字符重复）、#aabbcc、#aabbccdd（H1/M2）
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map((ch) => ch + ch).join('');
      }
      if (hex.length !== 6 && hex.length !== 8) return null;
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      const hslMatch = c.match(/hsla?\(([^)]+)\)/i);
      if (hslMatch) {
        const parts = hslMatch[1]
          .trim()
          .split(/[\s,/]+/)
          .filter(Boolean)
          .map((s) => parseFloat(s));
        if (parts.length < 3) return null;
        const [h, s, l] = parts;
        if ([h, s, l].some((v) => isNaN(v))) return null;
        [r, g, b] = ThemeBridge.hslToRgb(h, s, l);
      } else {
        return null;
      }
    }

    if ([r, g, b].some((v) => isNaN(v))) return null;
    return [Math.round(r), Math.round(g), Math.round(b)];
  }

  /**
   * HSL → RGB（0–255 整数）
   * h 支持任意角度（deg 已剥离），s/l 支持 0–100 或 0–1
   */
  private static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const hn = ((h % 360) + 360) % 360 / 360;
    const sn = s > 1 ? s / 100 : s;
    const ln = l > 1 ? l / 100 : l;

    const hue2rgb = (p: number, q: number, t: number): number => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };

    let r: number, g: number, b: number;
    if (sn === 0) {
      r = g = b = ln;
    } else {
      const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
      const p = 2 * ln - q;
      r = hue2rgb(p, q, hn + 1 / 3);
      g = hue2rgb(p, q, hn);
      b = hue2rgb(p, q, hn - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * RGB → HSL；输出 h(0–360)、s(0–100)、l(0–100)
   */
  private static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn:
          h = (gn - bn) / d + (gn < bn ? 6 : 0);
          break;
        case gn:
          h = (bn - rn) / d + 2;
          break;
        case bn:
          h = (rn - gn) / d + 4;
          break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  /**
   * WCAG 2.1 相对亮度（sRGB gamma 校正）
   */
  static luminance(rgb: [number, number, number]): number {
    const [r, g, b] = rgb;
    const channel = (v: number): number => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  /**
   * 计算两个 RGB 三元组的 WCAG 对比度
   */
  static contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    const l1 = ThemeBridge.luminance(rgb1);
    const l2 = ThemeBridge.luminance(rgb2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 当对比度不足时，通过调整前景色明度（向背景反方向加深/提亮）
   * 直到满足 targetRatio 或达到安全边界（L 0–100）。
   * 返回调整后的 RGB 三元组。
   */
  private static ensureContrastRgb(
    fg: [number, number, number],
    bg: [number, number, number],
    targetRatio = 4.5
  ): [number, number, number] {
    if (ThemeBridge.contrastRatio(fg, bg) >= targetRatio) return fg;

    const [h, s, l] = ThemeBridge.rgbToHsl(fg[0], fg[1], fg[2]);
    const bgLum = ThemeBridge.luminance(bg);
    // 背景偏亮时把前景压暗，背景偏暗时把前景提亮
    const darken = bgLum > 0.18;
    const step = darken ? -1 : 1;
    let newL = l;

    for (let i = 0; i < 100; i++) {
      newL = darken ? Math.max(0, newL + step) : Math.min(100, newL + step);
      const adjusted = ThemeBridge.hslToRgb(h, s, newL);
      if (ThemeBridge.contrastRatio(adjusted, bg) >= targetRatio || newL === 0 || newL === 100) {
        return adjusted;
      }
    }
    return ThemeBridge.hslToRgb(h, s, newL);
  }

  /**
   * 识别颜色字符串的格式类型（hex / rgb / hsl）。
   */
  private static detectColorFormat(color: string): 'hex' | 'rgb' | 'hsl' | 'unknown' {
    const c = color.trim();
    if (c[0] === '#') return 'hex';
    if (/^rgba?\(/i.test(c)) return 'rgb';
    if (/^hsla?\(/i.test(c)) return 'hsl';
    return 'unknown';
  }

  /**
   * 将 RGB 三元组按指定格式输出；尽量保持与原始颜色字符串同格式。
   */
  private static formatRgb(
    rgb: [number, number, number],
    format: 'hex' | 'rgb' | 'hsl' | 'unknown'
  ): string {
    const [r, g, b] = rgb;
    switch (format) {
      case 'hex':
        return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      case 'rgb':
        return `rgb(${r}, ${g}, ${b})`;
      case 'hsl':
        return ThemeBridge.hslString(...ThemeBridge.rgbToHsl(r, g, b));
      default:
        return `rgb(${r}, ${g}, ${b})`;
    }
  }

  /**
   * 如果 color 与 background 的对比度不满足 targetRatio，自动调整 color 的明度
   * （提升或降低 L）直到满足。返回调整后的颜色字符串，尽量保持原格式。
   * 纯函数，不依赖 Obsidian API。
   */
  static ensureContrast(color: string, background: string, targetRatio = 4.5): string {
    const fg = ThemeBridge.parseColorToRgb(color);
    const bg = ThemeBridge.parseColorToRgb(background);
    if (!fg || !bg) return color;

    if (ThemeBridge.contrastRatio(fg, bg) >= targetRatio) return color;

    const adjusted = ThemeBridge.ensureContrastRgb(fg, bg, targetRatio);
    const format = ThemeBridge.detectColorFormat(color);
    return ThemeBridge.formatRgb(adjusted, format);
  }

  /**
   * 解析 CSS 颜色字符串 → HSL 色相 H（0–360）
   * 用于把 Obsidian 主题的 --interactive-accent 反推为插件的 --accent-hue
   */
  static rgbToHue(color: string): number | null {
    const rgb = ThemeBridge.parseColorToRgb(color);
    if (!rgb) return null;
    const [r, g, b] = rgb;

    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
    if (d === 0) return 0;

    let h: number;
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;

    h = Math.round(h * 60);
    return h < 0 ? h + 360 : h;
  }

  /**
   * 解析 CSS 颜色字符串 → "r, g, b" 三元组字符串
   * 用于把 Obsidian 侧边栏背景 --background-secondary 同步为插件卡片底色，
   * 让插件卡片色温贴近 Obsidian 原生界面
   */
  static rgbToRgbString(color: string): string | null {
    const rgb = ThemeBridge.parseColorToRgb(color);
    if (!rgb) return null;
    return rgb.join(', ');
  }

  /**
   * 向 iframe 推送当前主题状态
   * @param followObsidianTheme 为 true 时，附带从 Obsidian 主题
   *        --interactive-accent 反推的意境色相 hue，驱动插件整盘配色联动
   */
  pushTheme(followObsidianTheme = false): void {
    if (!this.iframe?.contentWindow) return;

    const payload: { isDark: boolean; hue?: number; bg?: string; textNormal?: string; textMuted?: string } = {
      isDark: this.isDarkMode(),
    };

    if (followObsidianTheme) {
      const accent = getComputedStyle(activeDocument.body)
        .getPropertyValue('--interactive-accent')
        .trim();
      const hue = ThemeBridge.rgbToHue(accent);
      if (hue !== null) payload.hue = hue;

      // 侧边栏背景色：驱动插件卡片底色贴近 Obsidian 色温
      const sidebar = getComputedStyle(activeDocument.body)
        .getPropertyValue('--background-secondary')
        .trim();
      const bg = ThemeBridge.rgbToRgbString(sidebar);
      if (bg !== null) payload.bg = bg;

      // 文字色：驱动插件文字色温贴近 Obsidian
      const textNormal = getComputedStyle(activeDocument.body)
        .getPropertyValue('--text-normal')
        .trim();
      const textNormalRgb = ThemeBridge.rgbToRgbString(textNormal);
      if (textNormalRgb !== null) payload.textNormal = textNormalRgb;

      const textMuted = getComputedStyle(activeDocument.body)
        .getPropertyValue('--text-muted')
        .trim();
      const textMutedRgb = ThemeBridge.parseColorToRgb(textMuted);
      if (textMutedRgb !== null) {
        // 与 Obsidian 背景色做对比度保护；优先用侧边栏背景，其次主背景
        const bgRgb =
          ThemeBridge.parseColorToRgb(sidebar) ??
          ThemeBridge.parseColorToRgb(
            getComputedStyle(activeDocument.body).getPropertyValue('--background-primary').trim()
          );
        if (bgRgb && ThemeBridge.contrastRatio(textMutedRgb, bgRgb) < 4.5) {
          payload.textMuted = ThemeBridge.ensureContrastRgb(textMutedRgb, bgRgb, 4.5).join(', ');
        } else {
          payload.textMuted = textMutedRgb.join(', ');
        }
      }
    }

    this.iframe.contentWindow.postMessage(
      {
        type: 'theme:changed',
        id: 'theme_push_' + Date.now(),
        payload,
      },
      '*'
    );
  }

  /** 供外部调用：Obsidian 主题变化时触发 */
  onThemeChanged(followObsidianTheme = false): void {
    this.pushTheme(followObsidianTheme);
  }

  // ===== 双向调色 =====

  /**
   * 将 HSL 分量格式化为 CSS hsl() 字符串
   */
  private static hslString(h: number, s: number, l: number): string {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  /**
   * 计算 webapp 色相/明度 → Obsidian CSS 变量映射
   * 仅覆盖 3 类核心色（强调/背景/文字），其余由 Obsidian 当前主题推算。
   * 文字色会与背景色做 WCAG 对比度保护。
   *
   * 暗色模式饱和度/亮度策略（审计 4.7.1 复核结论：已覆盖，无逻辑缺口）：
   * - 亮度差异：accentL（暗 50+lo / 亮 40+lo）、bgL（暗 12 / 亮 94）、
   *   textNormalL（暗 88 / 亮 12）、textMutedL（暗 55 / 亮 45）均按 isDark 分支。
   * - 饱和度差异：bgS 暗色 8 / 亮色 12（暗色背景降饱和避免泥浊）。
   * - 强调色 accentS 固定 40：暗色下强调色需更高亮度（accentL 已提亮）而非降饱和，
   *   且单测 ThemeBridge.test.ts 锁定暗色 `hsl(120, 40%, 50%)`，故不随模式变化。
   * - webapp 自身的暗色降饱和（--ink-* / --text-* 在 variables.css 暗色段降低 S）
   *   由 CSS 层负责，与本函数（Obsidian 原生变量注入）职责分离。
   */
  static computeObsidianVars(hue: number, lightnessOffset: number, isDark: boolean): Record<string, string> {
    const h = Math.round(hue);
    const lo = Math.max(-30, Math.min(30, lightnessOffset));

    // 强调色：明度偏移 lo 同步作用于强调色，使 webapp 的「明度」滑块
    // 在 Obsidian 原生界面同样可见（与 webapp 侧 --accent-lightness-offset 方向一致：正值提亮）。
    const accentS = 40;
    const accentL = isDark
      ? Math.max(30, Math.min(80, 50 + lo))
      : Math.max(15, Math.min(70, 40 + lo));
    const accent = `hsl(${h}, ${accentS}%, ${accentL}%)`;
    const accentHover = `hsl(${h}, ${accentS}%, ${Math.min(95, accentL + 5)}%)`;

    // 背景色
    const bgS = isDark ? 8 : 12;
    const bgL = isDark
      ? Math.max(5, 12 + lo * 0.3)
      : Math.min(98, 94 + lo * 0.15);
    const bgSecondaryL = isDark ? bgL + 3 : bgL - 2;
    const bgPrimary = `hsl(${h}, ${bgS}%, ${bgL}%)`;
    const bgSecondary = `hsl(${h}, ${bgS}%, ${bgSecondaryL}%)`;

    // 文字色：与主背景做 WCAG 对比度保护
    // textNormal 满足 AA 4.5:1
    const textNormalH = h;
    const textNormalS = 6;
    const textNormalL = isDark ? 88 : 12;
    const textNormal = ThemeBridge.ensureContrast(
      ThemeBridge.hslString(textNormalH, textNormalS, textNormalL),
      bgPrimary,
      4.5
    );

    // textMuted 满足 AA 3:1（大文字/辅助文字最低标准）
    const textMutedH = h;
    const textMutedS = 4;
    const textMutedL = isDark ? 55 : 45;
    const textMuted = ThemeBridge.ensureContrast(
      ThemeBridge.hslString(textMutedH, textMutedS, textMutedL),
      bgPrimary,
      3.0
    );

    return {
      '--interactive-accent': accent,
      '--interactive-accent-hover': accentHover,
      '--text-accent': accent,
      '--background-primary': bgPrimary,
      '--background-secondary': bgSecondary,
      '--text-normal': textNormal,
      '--text-muted': textMuted,
    };
  }

  /**
   * 应用调色到 Obsidian 原生界面
   * 50ms debounce，防止色相/明度滑块快速拖拽产生高频 DOM 写入
   */
  applyPalette(hue: number, lightnessOffset: number, isDark: boolean): void {
    if (this._paletteSyncTimer) window.clearTimeout(this._paletteSyncTimer);
    this._suppressed = false; // 新调色请求到来 → 解除抑制
    this._paletteSyncTimer = window.setTimeout(() => {
      if (this._suppressed) return; // restoreDefaults 在防抖窗口内被调用
      const vars = ThemeBridge.computeObsidianVars(hue, lightnessOffset, isDark);
      for (const [key, value] of Object.entries(vars)) {
        activeDocument.body.style.setProperty(key, value);
      }
    }, 50);
  }

  /** 清除注入的 CSS 变量，恢复 Obsidian 主题默认值 */
  restoreDefaults(): void {
    this._suppressed = true;
    for (const key of ThemeBridge.INJECTED_VARS) {
      activeDocument.body.style.removeProperty(key);
    }
  }

  /** 进程级单例，供 onunload 等无实例上下文处恢复默认（与 AppAPI 持有的实例相互独立，避免 _suppressed 跨实例干扰 H9） */
  private static _default: ThemeBridge | null = null;
  static get default(): ThemeBridge {
    return (this._default ??= new ThemeBridge());
  }
}
