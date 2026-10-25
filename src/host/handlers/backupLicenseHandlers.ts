import { encodeBackup, decodeBackup } from '../../license/backupCode';
import { verifyLicenseKey } from '../../license/licenseKey';
import type { HostContext, RouteHandler } from './hostContext';

/**
 * 备份码 / 激活码类消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 这类消息涉及密钥校验与许可证状态，只经 HostContext 暴露的窄接口访问宿主
 * （不直接碰 licenseStore / settings），见 hostContext.ts 的设计说明。
 */
export type BackupLicenseHost = Pick<HostContext,
    | 'respond'
    | 'respondError'
    | 'isLicenseActive'
    | 'getSavedLicenseKey'
    | 'activateLicense'
    | 'notifyLicenseActivated'
    >;

/** 备份码导出：仅已激活设备可导出（本质是已存激活码的便携封装） */
const handleExportBackup: RouteHandler<BackupLicenseHost> = async (ctx, id) => {
    if (!ctx.isLicenseActive()) {
        ctx.respond(id, { ok: false, error: '未激活，无法导出备份码' });
        return;
    }
    const savedKey = ctx.getSavedLicenseKey();
    if (!savedKey) {
        ctx.respond(id, { ok: false, error: '未找到已保存的激活码' });
        return;
    }
    // 用 Base64 包裹 + 前缀，避免与正式激活码混淆；不含任何密钥
    let backup: string;
    try {
        backup = encodeBackup(savedKey);
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '备份码生成失败');
        return;
    }
    ctx.respond(id, { ok: true, backup });
};

/** 备份码导入：解包得到激活码后走标准激活流程（换设备/换仓库用） */
const handleImportBackup: RouteHandler<BackupLicenseHost> = async (ctx, id, payload) => {
    const raw = typeof payload.backup === 'string' ? payload.backup.trim() : '';
    if (!raw) {
        ctx.respond(id, { ok: false, error: '请输入备份码' });
        return;
    }
    let code: string;
    try {
        code = decodeBackup(raw);
    } catch (e) {
        ctx.respond(id, { ok: false, error: e instanceof Error ? e.message : '备份码无效' });
        return;
    }
    try {
        const verified = await verifyLicenseKey(code);
        if (!verified) {
            ctx.respond(id, { ok: false, error: '备份码无效或已失效' });
            return;
        }
        await ctx.activateLicense(code);
        ctx.notifyLicenseActivated();
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '备份码导入失败');
    }
};

/** 激活码校验（宿主侧持密钥，Web Crypto 异步校验） */
const handleActivateLicense: RouteHandler<BackupLicenseHost> = async (ctx, id, payload) => {
    const code = typeof payload.code === 'string' ? payload.code.trim() : '';
    if (!code) {
        ctx.respond(id, { ok: false, error: '请输入激活码' });
        return;
    }
    try {
        const verified = await verifyLicenseKey(code);
        if (!verified) {
            ctx.respond(id, { ok: false, error: '激活码无效或格式错误' });
            return;
        }
        await ctx.activateLicense(code);
        ctx.notifyLicenseActivated();
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '激活校验失败');
    }
};

/** 关闭面板：先回执，由 webapp 侧自行收尾 */
const handleClose: RouteHandler<BackupLicenseHost> = async (ctx, id) => {
    ctx.respond(id, { ok: true });
};

export const backupLicenseRoutes: Record<string, RouteHandler<BackupLicenseHost>> = {
    'app:exportBackup': handleExportBackup,
    'app:importBackup': handleImportBackup,
    'app:activateLicense': handleActivateLicense,
    'app:close': handleClose,
};
