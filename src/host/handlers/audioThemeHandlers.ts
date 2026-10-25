import type { HostContext, RouteHandler } from './hostContext';

/**
 * 音频 / 本地文件读取 + 明暗主题类消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 这几个分支本身只是「委托宿主私有实现」或「切换主题」，真正的安全防护
 * （路径遍历、CORS 代理、主题切换回退）都留在 AppAPI 私有方法里，
 * 门面只暴露必要原语，handler 负责取参数与回执。
 */
export type AudioThemeHost = Pick<HostContext,
    | 'respond'
    | 'respondError'
    | 'readVaultFile'
    | 'readLocalFile'
    | 'proxyAudioUrl'
    | 'scanVaultAudioFiles'
    | 'isObsidianDark'
    | 'switchObsidianTheme'
    | 'syncThemeFollow'
    >;

/** 读取 vault 内音频文件 */
const handleReadVaultFile: RouteHandler<AudioThemeHost> = async (ctx, id, payload) => {
    await ctx.readVaultFile(id, payload);
};

/** 读取本机绝对路径音频（兼容旧音源） */
const handleReadLocalFile: RouteHandler<AudioThemeHost> = async (ctx, id, payload) => {
    await ctx.readLocalFile(id, payload);
};

/** 音频文件扫描：返回 vault 内音频文件清单 */
const handleListVaultAudioFiles: RouteHandler<AudioThemeHost> = async (ctx, id) => {
    try {
        const files = await ctx.scanVaultAudioFiles();
        ctx.respond(id, { files });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '扫描库文件失败');
    }
};

/** 代理外部音源链接（绕过 webview CORS，桌面/移动一致） */
const handleProxyAudioUrl: RouteHandler<AudioThemeHost> = async (ctx, id, payload) => {
    await ctx.proxyAudioUrl(id, payload);
};

/**
 * 画中卷·打字机机身明暗开关：切换 Obsidian 基础主题。
 * 该开关语义是「控制 Obsidian 外观明暗」（不是 webapp 内部夜间模式）：
 * 宿主切换 moonstone(亮) / obsidian(暗) 后显式重放 css-change，
 * 驱动既有主题管线（各视图 css-change → onThemeChanged → pushTheme → theme:changed）即时跟随。
 */
const handleToggleObsidianTheme: RouteHandler<AudioThemeHost> = async (ctx, id, payload) => {
    const wanted = (payload as { isDark?: boolean } | null)?.isDark;
    const targetIsDark = typeof wanted === 'boolean' ? wanted : !ctx.isObsidianDark();
    const r = ctx.switchObsidianTheme(targetIsDark);
    if (!r.ok) {
        ctx.respondError(id, r.error || '切换明暗主题失败');
        return;
    }
    ctx.respond(id, { ok: true, isDark: r.isDark });
};

/** 重新开启主题跟随（webapp → Obsidian） */
const handleThemeSync: RouteHandler<AudioThemeHost> = async (ctx, id) => {
    ctx.syncThemeFollow();
    ctx.respond(id, { ok: true });
};

export const audioThemeRoutes: Record<string, RouteHandler<AudioThemeHost>> = {
    'app:readVaultFile': handleReadVaultFile,
    'app:readLocalFile': handleReadLocalFile,
    'app:listVaultAudioFiles': handleListVaultAudioFiles,
    'app:proxyAudioUrl': handleProxyAudioUrl,
    'app:toggleObsidianTheme': handleToggleObsidianTheme,
    'app:theme:sync': handleThemeSync,
};
