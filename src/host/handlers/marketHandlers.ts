import type { HostContext, RouteHandler } from './hostContext';

/**
 * 扩展市场处理器：主题市场 + 便签素材市场（从 AppAPI.handleMessage 拆出）。
 *
 * 与模块市场同构：清单拉取/下载一律由宿主完成（webview 侧禁 fetch），
 * 安装即写盘并记录版本；主题装/卸后需重扫 + 广播，素材则直接回传源码供沙箱执行。
 * 业务判断（fail-soft、校验、记录）留在本模块，宿主只提供原语。
 */
export type MarketHost = Pick<HostContext,
    | 'respond'
    | 'respondError'
    | 'fetchMarketJson'
    | 'fetchMarketText'
    | 'wantRefresh'
    | 'getInstalledMap'
    | 'setInstalled'
    | 'getCustomThemeNames'
    | 'backfillMaterialRecords'
    | 'safeAssetId'
    | 'getThemeDir'
    | 'getMaterialDir'
    | 'writeVaultText'
    | 'removeVaultFileIfExists'
    | 'readVaultTextIfExists'
    | 'rescanThemes'
    | 'broadcastThemeManifests'
    >;

/** 主题市场：拉取清单（附带已安装版本表，供 webapp 判定「可更新」） */
const handleMarketManifest: RouteHandler<MarketHost> = async (ctx, id, payload) => {
    try {
        const manifest = await ctx.fetchMarketJson('theme', ctx.wantRefresh(payload));
        ctx.respond(id, {
            ok: true,
            manifest,
            installed: ctx.getInstalledMap('theme'),
            installedIds: ctx.getCustomThemeNames(),
        });
    } catch (e) {
        // fail-soft：网络失败只影响「可装目录」，不能连累「本地已安装」。
        // 返回本地半份数据（manifest:null + 已安装 id/版本表），webapp 仍可渲染已安装主题并切换
        // （主题代码由本地磁盘按需加载，无需网络）。
        ctx.respond(id, {
            ok: true,
            manifest: null,
            installed: ctx.getInstalledMap('theme'),
            installedIds: ctx.getCustomThemeNames(),
        });
        console.warn('[ThemeMarket] 清单拉取失败，已回退为本地已安装列表:', e instanceof Error ? e.message : e);
    }
};

/** 主题市场：安装（下载 .js 写入主题文件夹，触发重扫） */
const handleMarketInstall: RouteHandler<MarketHost> = async (ctx, id, payload) => {
    const tid = typeof payload.id === 'string' ? payload.id : '';
    const url = typeof payload.url === 'string' ? payload.url : '';
    if (!tid || !url) {
        ctx.respondError(id, 'market:install 缺少 id 或 url');
        return;
    }
    try {
        // 先校验 id 再下载：id 会直接拼进路径，且可能来自远程市场清单
        const assetId = ctx.safeAssetId(tid, '主题 id');
        const code = await ctx.fetchMarketText(url);
        if (!code.includes('__bamboo_theme_')) throw new Error('不是有效的竹林主题文件');
        const filePath = `${ctx.getThemeDir()}/${assetId}.js`;
        // 首次安装时目录可能尚不存在：writeVaultText 内部逐级建目录后再写
        await ctx.writeVaultText(filePath, code);
        await ctx.setInstalled('theme', assetId, {
            version: typeof payload.version === 'string' ? payload.version : '',
            installedAt: Date.now(),
        });
        await ctx.rescanThemes();
        ctx.broadcastThemeManifests();   // 让其它已打开的视图也看到新主题
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '主题安装失败');
    }
};

/** 主题市场：卸载（删除主题文件夹中的 .js，触发重扫） */
const handleMarketUninstall: RouteHandler<MarketHost> = async (ctx, id, payload) => {
    const tid = typeof payload.id === 'string' ? payload.id : '';
    if (!tid) {
        ctx.respondError(id, 'market:uninstall 缺少 id');
        return;
    }
    try {
        const assetId = ctx.safeAssetId(tid, '主题 id');
        const filePath = `${ctx.getThemeDir()}/${assetId}.js`;
        // 文件可能已被手动删除、或 themePath 与当初安装时不同：
        // 不存在时按「已卸载」处理，版本记录照常清除，避免残留导致重装后误判「已最新」。
        await ctx.removeVaultFileIfExists(filePath);
        await ctx.setInstalled('theme', assetId, null);
        await ctx.rescanThemes();
        ctx.broadcastThemeManifests();
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '主题卸载失败');
    }
};

/** 素材市场：拉取清单（host 侧 fetch；回填遗留安装记录使「可更新」判定与主题一致） */
const handleMaterialManifest: RouteHandler<MarketHost> = async (ctx, id, payload) => {
    try {
        const manifest = await ctx.fetchMarketJson('material', ctx.wantRefresh(payload));
        await ctx.backfillMaterialRecords();
        ctx.respond(id, { ok: true, manifest, installed: ctx.getInstalledMap('material') });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '素材市场清单拉取失败');
    }
};

/** 素材市场：安装（写盘并回传源码供 webapp 立即沙箱执行） */
const handleMaterialInstall: RouteHandler<MarketHost> = async (ctx, id, payload) => {
    const mid = typeof payload.id === 'string' ? payload.id : '';
    const url = typeof payload.url === 'string' ? payload.url : '';
    if (!mid || !url) {
        ctx.respondError(id, 'material:install 缺少 id 或 url');
        return;
    }
    try {
        const assetId = ctx.safeAssetId(mid, '素材 id');
        const code = await ctx.fetchMarketText(url);
        if (!code.includes('__bamboo_material_')) throw new Error('不是有效的竹林素材文件');
        await ctx.writeVaultText(`${ctx.getMaterialDir()}/${assetId}.js`, code);
        await ctx.setInstalled('material', assetId, {
            version: typeof payload.version === 'string' ? payload.version : '',
            installedAt: Date.now(),
        });
        // 直接回传源码：webapp 立即沙箱执行、注入 CSS 并落卡，无需像主题那样重扫广播
        ctx.respond(id, { ok: true, code });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '素材安装失败');
    }
};

/** 素材市场：读回已安装素材源码（webapp 重载后据此恢复本地素材库） */
const handleMaterialLoad: RouteHandler<MarketHost> = async (ctx, id, payload) => {
    const mid = typeof payload.id === 'string' ? payload.id : '';
    if (!mid) {
        ctx.respondError(id, 'material:load 缺少 id');
        return;
    }
    try {
        const filePath = `${ctx.getMaterialDir()}/${ctx.safeAssetId(mid, '素材 id')}.js`;
        const code = await ctx.readVaultTextIfExists(filePath);
        if (code === null) {
            ctx.respond(id, { ok: false, code: null });
            return;
        }
        ctx.respond(id, { ok: true, code });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '素材读回失败');
    }
};

export const marketRoutes: Record<string, RouteHandler<MarketHost>> = {
    'market:manifest': handleMarketManifest,
    'market:install': handleMarketInstall,
    'market:uninstall': handleMarketUninstall,
    'material:manifest': handleMaterialManifest,
    'material:install': handleMaterialInstall,
    'material:load': handleMaterialLoad,
};
