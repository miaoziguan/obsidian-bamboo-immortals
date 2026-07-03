
/**
 * ThemeBridge - 监听 Obsidian 主题变化，推送到 iframe
 *              + 反向：接收 webapp 调色值，注入 Obsidian 原生界面
 */
export class ThemeBridge {
    private iframe: HTMLIFrameElement | null = null;
    private expectedOrigin = '';
    private _paletteSyncTimer: ReturnType<typeof setTimeout> | null = null;

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

    /** 防抖竞态标记：restoreDefaults 被调用后设为 true，阻止延迟回调覆写 */
    private static _suppressed = false;

    constructor() {
    }

  attachIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
    try {
      this.expectedOrigin = new URL(iframe.src).origin;
    } catch {
      this.expectedOrigin = '';
    }
  }

  detachIframe(): void {
    this.iframe = null;
  }

  /** 获取当前 Obsidian 明暗状态 */
  isDarkMode(): boolean {
    return activeDocument.body.classList.contains('theme-dark');
  }

  /** 向 iframe 推送当前主题状态 */
  pushTheme(): void {
    if (!this.iframe?.contentWindow) return;

    this.iframe.contentWindow.postMessage(
      {
        type: 'theme:changed',
        id: 'theme_push_' + Date.now(),
        payload: { isDark: this.isDarkMode() },
      },
      '*'
    );
  }

  /** 供外部调用：Obsidian 主题变化时触发 */
  onThemeChanged(): void {
    this.pushTheme();
  }

  // ===== 双向调色 =====

  /**
   * 计算 webapp 色相/明度 → Obsidian CSS 变量映射
   * 仅覆盖 3 类核心色（强调/背景/文字），其余由 Obsidian 当前主题推算
   */
  static computeObsidianVars(hue: number, lightnessOffset: number, isDark: boolean): Record<string, string> {
    const h = Math.round(hue);
    const lo = Math.max(-30, Math.min(30, lightnessOffset));

    // 强调色
    const accentS = 40;
    const accentL = isDark ? 50 : 40;
    const accent = `hsl(${h}, ${accentS}%, ${accentL}%)`;
    const accentHover = `hsl(${h}, ${accentS}%, ${accentL + 5}%)`;

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
    ThemeBridge._suppressed = false; // 新调色请求到来 → 解除抑制
    this._paletteSyncTimer = window.setTimeout(() => {
      if (ThemeBridge._suppressed) return; // restoreDefaults 在防抖窗口内被调用
      const vars = ThemeBridge.computeObsidianVars(hue, lightnessOffset, isDark);
      for (const [key, value] of Object.entries(vars)) {
        activeDocument.body.style.setProperty(key, value);
      }
    }, 50);
  }

  /** 清除注入的 CSS 变量，恢复 Obsidian 主题默认值 */
  static restoreDefaults(): void {
    ThemeBridge._suppressed = true;
    for (const key of ThemeBridge.INJECTED_VARS) {
      activeDocument.body.style.removeProperty(key);
    }
  }
}
