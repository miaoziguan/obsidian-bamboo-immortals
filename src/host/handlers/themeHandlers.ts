import type { HostContext, RouteHandler } from './hostContext';

/**
 * 外部主题 / 调色 / 应用内明暗类消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 说明：这些分支大多只是「转发给 ThemeBridge（宿主主题管线）」，真正的调色计算、
 * 变量写入与广播都在 ThemeBridge 里，门面只暴露调用入口，handler 负责取参/回执。
 */
export type ThemeHost = Pick<HostContext,
    | 'respond'
    | 'respondError'
    | 'getThemeCode'
    | 'applyReaderPalette'
    | 'shouldSyncPaletteToObsidian'
    | 'applyPaletteToObsidian'
    | 'broadcastTheme'
    | 'isObsidianDark'
    | 'switchObsidianTheme'
    >;

/** 按名取已装载外部主题代码（清单先行、代码懒加载，避免全量跨进程下发） */
const handleThemeLoad: RouteHandler<ThemeHost> = async (ctx, id, payload) => {
    const name = (payload as { name?: string } | undefined)?.name;
    const code = name ? ctx.getThemeCode(name) : undefined;
    if (code !== undefined) {
        ctx.respond(id, { ok: true, code });
    } else {
        ctx.respondError(id, 'THEME_NOT_FOUND');
    }
};

/** 调色同步（webapp → Obsidian） */
const handleThemeSyncPalette: RouteHandler<ThemeHost> = async (ctx, id, payload) => {
    const p = payload as {
        hue: number;
        lightnessOffset: number;
        saturation?: number;
        isDark: boolean;
    };
    // 饱和度缺省 100（缩放系数，= 设计稿原饱和度）；异常值由下游统一夹紧，此处只做有限性兜底
    const sat = typeof p.saturation === 'number' && Number.isFinite(p.saturation) ? p.saturation : 100;
    // 阅读视图（宿主自有 BambooReaderView）的竹青强调色：始终跟随滑块。
    // 放在开关判断之外——「将调色同步到 Obsidian」只管原生界面那 7 个变量，
    // 插件自有视图跟随主视图调色属内部一致性要求（与下方 broadcastTheme 同理）。
    ctx.applyReaderPalette(p.hue, p.lightnessOffset, sat);
    if (ctx.shouldSyncPaletteToObsidian()) {
        ctx.applyPaletteToObsidian(p.hue, p.lightnessOffset, p.isDark, sat);
    }
    // 应用内调色（含明暗、色相与饱和度）→ 广播给所有已打开视图（含画中卷独立 iframe）。
    // 色相/明度/饱和度必须一并下发：画中卷等独立 iframe 视图内没有 DisplayManager，
    // 只有拿到这些值才能驱动自身配色（其内部样式全由 --accent-hue /
    // --accent-lightness-offset / --accent-saturation-scale 派生）。
    // 注意：此处不受 syncPaletteToObsidian 开关控制——那个开关管的是
    // 「webapp 调色是否写回 Obsidian 原生界面」，而「所有视图跟随主视图调色」
    // 是插件内部一致性要求，始终生效。
    ctx.broadcastTheme(p.isDark, {
        hue: p.hue,
        lightnessOffset: p.lightnessOffset,
        saturation: sat,
    });
    ctx.respond(id, { ok: true });
};

/**
 * 模块能力：切换 Obsidian 基础明暗（博客模块「快门」改作明暗开关用）。
 * 与画中卷·打字机的机身明暗开关走同一实现，语义是「控制 Obsidian 外观明暗」，
 * 切换后整条主题管线会即时跟随，模块侧栏随之变明暗。
 */
const handleModuleToggleTheme: RouteHandler<ThemeHost> = async (ctx, id, payload) => {
    const wanted = (payload as { isDark?: boolean } | null)?.isDark;
    const targetIsDark = typeof wanted === 'boolean' ? wanted : !ctx.isObsidianDark();
    const r = ctx.switchObsidianTheme(targetIsDark);
    if (!r.ok) {
        ctx.respondError(id, r.error || '切换明暗主题失败');
        return;
    }
    ctx.respond(id, { ok: true, isDark: r.isDark });
};

/**
 * 应用内手动切换明暗（如悬浮菜单夜间模式）。
 * webapp 的 store.setDarkMode 仅在用户手动切换时发出本消息（宿主推送不触发），
 * 由宿主广播给所有视图，确保画中卷等独立 iframe 跟随应用明暗，不依赖 Obsidian 系统主题。
 */
const handleThemeAppDarkMode: RouteHandler<ThemeHost> = async (ctx, id, payload) => {
    const isDark = !!(payload as { isDark?: boolean } | null)?.isDark;
    ctx.broadcastTheme(isDark);
    ctx.respond(id, { ok: true });
};

export const themeRoutes: Record<string, RouteHandler<ThemeHost>> = {
    'theme:load': handleThemeLoad,
    'theme:syncPalette': handleThemeSyncPalette,
    'module:toggleTheme': handleModuleToggleTheme,
    'theme:appDarkMode': handleThemeAppDarkMode,
};
