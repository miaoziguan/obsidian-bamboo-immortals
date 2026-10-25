import type { HostContext, RouteHandler } from './hostContext';

/**
 * 数据源 / AI 类消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 共同模式：数据源由视图层注入，未注入时回「未配置数据源」；
 * 取数成功直接下发（健康分会挑字段下发，见下方注释），失败回「计算失败」。
 * 错误文案与迁移前**逐字一致**（这些文案会出现在用户可见的提示里）。
 */
export type ProviderHost = Pick<HostContext,
    | 'respond'
    | 'respondError'
    | 'strategyOverview'
    | 'cultivationRealm'
    | 'bambooCoinBalance'
    | 'bambooCoinAvailableBalance'
    | 'improveGoal'
    >;

/**
 * 健康分权威快照（单一数据源，供 webapp 健康分环/详情消费）。
 *
 * overview 必须一并下发：webapp「数据概览」tab 此前拿不到它，只能本地再算一遍
 * （且本地用的是未过滤归档的目标集），于是同一面板里「概览」与「诊断」两套口径。
 * 下发后概览 tab 优先消费这份权威聚合，真正做到单一数据源。
 */
const handleGetHealthOverview: RouteHandler<ProviderHost> = async (ctx, id) => {
    const provider = ctx.strategyOverview;
    if (!provider) {
        ctx.respondError(id, 'app:getHealthOverview 未配置数据源');
        return;
    }
    try {
        const overview = await provider();
        if (!overview) {
            ctx.respondError(id, '暂无目标数据，无法计算健康分');
            return;
        }
        ctx.respond(id, {
            updatedAt: overview.updatedAt,
            health: overview.health,
            goals: overview.goals,
            results: overview.results,
            overview: overview.overview,
            hints: overview.hints,
        });
    } catch (e) {
        ctx.respondError(id, `app:getHealthOverview 计算失败: ${(e as Error)?.message ?? String(e)}`);
    }
};

/** 当前修行境界（竹杖芒鞋侧栏常驻展示） */
const handleGetCultivationRealm: RouteHandler<ProviderHost> = async (ctx, id) => {
    const provider = ctx.cultivationRealm;
    if (!provider) {
        ctx.respondError(id, 'app:getCultivationRealm 未配置数据源');
        return;
    }
    try {
        ctx.respond(id, await provider());
    } catch (e) {
        ctx.respondError(id, `app:getCultivationRealm 计算失败: ${(e as Error)?.message ?? String(e)}`);
    }
};

/** 当前竹币余额（竹杖芒鞋侧栏常驻展示） */
const handleGetBambooCoinBalance: RouteHandler<ProviderHost> = async (ctx, id) => {
    const provider = ctx.bambooCoinBalance;
    if (!provider) {
        ctx.respondError(id, 'app:getBambooCoinBalance 未配置数据源');
        return;
    }
    try {
        ctx.respond(id, await provider());
    } catch (e) {
        ctx.respondError(id, `app:getBambooCoinBalance 计算失败: ${(e as Error)?.message ?? String(e)}`);
    }
};

/** 当前可用竹币余额（与 webapp 商店界面对齐） */
const handleGetBambooCoinAvailableBalance: RouteHandler<ProviderHost> = async (ctx, id) => {
    const provider = ctx.bambooCoinAvailableBalance;
    if (!provider) {
        ctx.respondError(id, 'app:getBambooCoinAvailableBalance 未配置数据源');
        return;
    }
    try {
        ctx.respond(id, await provider());
    } catch (e) {
        ctx.respondError(id, `app:getBambooCoinAvailableBalance 计算失败: ${(e as Error)?.message ?? String(e)}`);
    }
};

/** AI 优化目标 */
const handleAiImproveGoal: RouteHandler<ProviderHost> = async (ctx, id, payload) => {
    const goalId = payload.goalId;
    if (typeof goalId !== 'string' || goalId.length === 0) {
        ctx.respondError(id, 'app:aiImproveGoal 缺少 goalId');
        return;
    }
    ctx.improveGoal({
        goalId,
        title: typeof payload.title === 'string' ? payload.title : undefined,
        hints: typeof payload.hints === 'string' ? payload.hints : undefined,
    });
    ctx.respond(id, { ok: true });
};

export const providerRoutes: Record<string, RouteHandler<ProviderHost>> = {
    'app:getHealthOverview': handleGetHealthOverview,
    'app:getCultivationRealm': handleGetCultivationRealm,
    'app:getBambooCoinBalance': handleGetBambooCoinBalance,
    'app:getBambooCoinAvailableBalance': handleGetBambooCoinAvailableBalance,
    'app:aiImproveGoal': handleAiImproveGoal,
};
