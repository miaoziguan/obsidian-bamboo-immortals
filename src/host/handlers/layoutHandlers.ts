import type { HostContext, RouteHandler } from './hostContext';

/**
 * 布局 / 视图移动类消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 拆分动机：AppAPI.ts 是宿主与 webapp 的唯一消息中枢，也是最热（近半年 churn 最高）、
 * 最大的文件（2100+ 行），其中 handleMessage 一条方法就占约 950 行、31 个 if 分支。
 * 按领域把分支拆到各自模块，可让 handleMessage 退化为一张路由表，
 * 各领域的改动不再互相挤在同一个巨型方法里。
 *
 * 上下文约定：handler 只声明自己需要的宿主能力（Pick<AppAPI, ...> 结构化子集），
 * 这样「谁依赖什么」在类型上可见，也避免把整个 AppAPI 交给 handler 导致依赖失控。
 * AppAPI 实例天然满足这些子集（它拥有全部成员），故无需任何类型强转。
 */
export type LayoutHost = Pick<HostContext,
    | 'respond'
    | 'moveToCenter'
    | 'moveToSidebar'
    | 'toggleZen'
    | 'collapseRightSidebar'
    | 'expandRightSidebar'
    >;

/**
 * 侧栏 → 中央（进入多列布局时）。
 *
 * mode 会被写进视图状态（pendingLayoutMode）并随 workspace 布局跨重启持久化，
 * 重启后又经 app:ready 注入 webapp 兜底恢复。必须白名单收口，
 * 否则任意字符串会被存进布局文件、并在恢复时被当成布局模式消费。
 * 横向模式已移除：无论 payload 传什么，一律按看板处理（仍保留白名单语义，不接受任意值）。
 */
const handleMoveToCenter: RouteHandler<LayoutHost> = async (ctx, id) => {
    if (ctx.moveToCenter) {
        const mode = 'kanban';
        // 立即回复（不等移动完成）：移动会销毁本视图的 webview，
        // 若等它结束再 respond，iframe 已不存在 → 回执必然丢失（respond 里 contentWindow 为空直接 return）。
        // 折叠右侧栏已改为「新面板收到 app:revealed 后自行发起」，不依赖这条回执。
        // 故意不 await：移动会销毁本视图 webview，await 结束前 iframe 已不存在 → 回执必丢；
        // 此处显式 void 标记「有意忽略 Promise」（满足发布校验的未处理 Promise 告警）。
        void ctx.moveToCenter(mode);
        ctx.respond(id, { ok: true });
    } else {
        ctx.respond(id, { ok: false, error: 'moveToCenter 未注入' });
    }
};

/** 视图移回右侧栏（恢复纵向时） */
const handleMoveToSidebar: RouteHandler<LayoutHost> = async (ctx, id) => {
    if (ctx.moveToSidebar) {
        ctx.moveToSidebar();
        ctx.respond(id, { ok: true });
    } else {
        ctx.respond(id, { ok: false, error: 'moveToSidebar 未注入' });
    }
};

/** 画中卷·打字机「一键全屏」：折叠/恢复左右侧栏 */
const handleToggleZen: RouteHandler<LayoutHost> = async (ctx, id) => {
    if (ctx.toggleZen) {
        const zen = ctx.toggleZen();
        ctx.respond(id, { ok: true, zen: !!zen });
    } else {
        ctx.respond(id, { ok: false, error: 'toggleZen 未注入' });
    }
};

/** 折叠 Obsidian 右侧栏（进入看板多列模式时腾出横向宽度）
 *  @returns wasCollapsed=折叠前是否已折叠（webapp 据此判断恢复纵向时是否需对称展开） */
const handleCollapseRightSidebar: RouteHandler<LayoutHost> = async (ctx, id) => {
    if (ctx.collapseRightSidebar) {
        const wasCollapsed = ctx.collapseRightSidebar();
        ctx.respond(id, { ok: true, wasCollapsed: !!wasCollapsed });
    } else {
        ctx.respond(id, { ok: false, error: 'collapseRightSidebar 未注入' });
    }
};

/** 展开 Obsidian 右侧栏（恢复纵向时对称还原） */
const handleExpandRightSidebar: RouteHandler<LayoutHost> = async (ctx, id) => {
    if (ctx.expandRightSidebar) {
        ctx.expandRightSidebar();
        ctx.respond(id, { ok: true });
    } else {
        ctx.respond(id, { ok: false, error: 'expandRightSidebar 未注入' });
    }
};

export const layoutRoutes: Record<string, RouteHandler<LayoutHost>> = {
    'app:moveToCenter': handleMoveToCenter,
    'app:moveToSidebar': handleMoveToSidebar,
    'app:toggleZen': handleToggleZen,
    'app:collapseRightSidebar': handleCollapseRightSidebar,
    'app:expandRightSidebar': handleExpandRightSidebar,
};
