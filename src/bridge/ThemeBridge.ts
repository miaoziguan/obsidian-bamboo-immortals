
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
   * 支持 rgb()/rgba()/#hex（3 或 6 位）；无法解析返回 null
   */
  private static parseColorToRgb(color: string): [number, number, number] | null {
    if (!color) return null;
    const c = color.trim();
    let r: number, g: number, b: number;

    const rgbMatch = c.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((s) => parseFloat(s));
      [r, g, b] = parts;
    } else if (c[0] === '#') {
      let hex = c.slice(1);
      if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
      if (hex.length < 6) return null;
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return null;
    }

    if ([r, g, b].some((v) => isNaN(v))) return null;
    return [Math.round(r), Math.round(g), Math.round(b)];
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
      const textMutedRgb = ThemeBridge.rgbToRgbString(textMuted);
      if (textMutedRgb !== null) payload.textMuted = textMutedRgb;
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
   * 计算 webapp 色相/明度 → Obsidian CSS 变量映射
   * 仅覆盖 3 类核心色（强调/背景/文字），其余由 Obsidian 当前主题推算
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
    const bgPrimary = `hsl(${h}, ${bgS}%, ${bgL}%)`;
    const bgSecondary = `hsl(${h}, ${bgS}%, ${isDark ? bgL + 3 : bgL - 2}%)`;

    // 文字色
    const textNormal = isDark ? `hsl(${h}, 6%, 88%)` : `hsl(${h}, 6%, 12%)`;
    const textMuted  = isDark ? `hsl(${h}, 4%, 55%)` : `hsl(${h}, 4%, 45%)`;

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
