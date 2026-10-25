import type { HostContext, RouteHandler } from './hostContext';

/**
 * 视图导航 / Vault 文件类消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 约定：宿主侧涉及 Obsidian API 的动作（取文件、开 leaf、建目录写盘）都收敛在
 * HostContext 里，handler 只做「取参数 → 校验 → 调用 → 回执」，
 * 并且**保留原有错误文案**（这些文案会直接显示给用户，迁移中不得改变）。
 */
export type ViewFileHost = Pick<HostContext,
    | 'respond'
    | 'respondError'
    | 'openArchive'
    | 'openScroll'
    | 'openScrollLeftSidebar'
    | 'moveScroll'
    | 'openModule'
    | 'openVaultFileByPath'
    | 'writeVaultText'
    >;

/** 目标归档：打开独立归档页 */
const handleOpenArchive: RouteHandler<ViewFileHost> = async (ctx, id) => {
    ctx.openArchive();
    ctx.respond(id, { ok: true });
};

/** 画中卷：打开独立中央视图（不影响日报） */
const handleOpenScroll: RouteHandler<ViewFileHost> = async (ctx, id, payload) => {
    const feature = typeof payload.feature === 'string' ? payload.feature : undefined;
    ctx.openScroll(feature);
    ctx.respond(id, { ok: true });
};

/** 画中卷：打开到左侧边栏（百宝箱首个功能，默认形态） */
const handleOpenScrollLeftSidebar: RouteHandler<ViewFileHost> = async (ctx, id, payload) => {
    const feature = typeof payload.feature === 'string' ? payload.feature : undefined;
    ctx.openScrollLeftSidebar(feature);
    ctx.respond(id, { ok: true });
};

/** 画中卷：画布内 3-dot 请求切换停靠位置 */
const handleMoveScroll: RouteHandler<ViewFileHost> = async (ctx, id, payload) => {
    const loc = payload.location;
    ctx.moveScroll(typeof loc === 'string' ? loc : undefined);
    ctx.respond(id, { ok: true });
};

/** 竹林模块：悬浮菜单点模块按钮 → 打开该模块视图 */
const handleOpenModule: RouteHandler<ViewFileHost> = async (ctx, id, payload) => {
    const moduleId = typeof payload.moduleId === 'string' ? payload.moduleId : '';
    if (!moduleId) {
        ctx.respondError(id, 'app:openModule 缺少 moduleId');
        return;
    }
    const loc = payload.location;
    const location = loc === 'left' || loc === 'center' || loc === 'right' ? loc : undefined;
    ctx.openModule(moduleId, location);
    ctx.respond(id, { ok: true });
};

/** 在 Obsidian 原生打开指定 vault 文件（画中卷便签 → 原生 md 编辑器） */
const handleOpenFile: RouteHandler<ViewFileHost> = async (ctx, id, payload) => {
    try {
        const raw = payload.path;
        const p: string = typeof raw === 'string' ? raw : '';
        if (!p) {
            ctx.respondError(id, '未提供文件路径');
            return;
        }
        await ctx.openVaultFileByPath(p);
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '打开文件失败');
    }
};

/** 思维子弹导出为 Markdown：写入 Vault 任意相对路径（不受画中卷目录限制） */
const handleExportMindmap: RouteHandler<ViewFileHost> = async (ctx, id, payload) => {
    try {
        const raw = typeof payload.path === 'string' ? payload.path.trim() : '';
        if (!raw) throw new Error('未提供文件路径');
        if (raw.includes('..')) throw new Error('路径遍历禁止');
        const content = typeof payload.content === 'string' ? payload.content : '';
        const full = await ctx.writeVaultText(raw, content);
        ctx.respond(id, { ok: true, path: full });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '导出失败');
    }
};

export const viewFileRoutes: Record<string, RouteHandler<ViewFileHost>> = {
    'app:openArchive': handleOpenArchive,
    'app:openScroll': handleOpenScroll,
    'app:openScrollLeftSidebar': handleOpenScrollLeftSidebar,
    'app:moveScroll': handleMoveScroll,
    'app:openModule': handleOpenModule,
    'app:openFile': handleOpenFile,
    'app:exportMindmap': handleExportMindmap,
};
