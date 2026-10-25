import type { NoiseItem } from '../../settings/PluginSettings';
import type { HostContext, RouteHandler } from './hostContext';

/**
 * 设置持久化类消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 这两个分支的共同点是「写 settings 某字段 → 落盘 → 回执」，落盘动作收敛在
 * HostContext 的 set* 方法里，handler 不直接碰 settings / saveSettings。
 */
export type SettingsHost = Pick<HostContext,
    | 'respond'
    | 'getSettingsSnapshot'
    | 'setSectionConfig'
    | 'setNoiseItems'
    >;

/** 读取当前设置 */
const handleGetSettings: RouteHandler<SettingsHost> = async (ctx, id) => {
    ctx.respond(id, { ok: true, settings: ctx.getSettingsSnapshot() });
};

/** 板块配置 */
const handleSaveSectionConfig: RouteHandler<SettingsHost> = async (ctx, id, payload) => {
    await ctx.setSectionConfig(payload as Record<string, unknown> | null);
    ctx.respond(id, { ok: true });
};

/** 白噪音音源 */
const handleSaveCustomNoises: RouteHandler<SettingsHost> = async (ctx, id, payload) => {
    const items = (Array.isArray(payload) ? payload : []) as NoiseItem[];
    await ctx.setNoiseItems(items);
    ctx.respond(id, { ok: true });
};

export const settingsRoutes: Record<string, RouteHandler<SettingsHost>> = {
    'app:getSettings': handleGetSettings,
    'app:saveSectionConfig': handleSaveSectionConfig,
    'app:saveCustomNoises': handleSaveCustomNoises,
};
