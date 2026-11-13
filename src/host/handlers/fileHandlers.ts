import type { HostContext, RouteHandler } from './hostContext';

/**
 * 画中卷 · 通用文件协议（文本 list / get / write / delete；图片 readImage / writeBinary）。
 *
 * 作用域限定在「画中卷」绑定目录内，路径遍历防护由宿主 handleFileOp 统一执行；
 * 这里只按类型分派，**把 type 原样透传**（handleFileOp 内部按 type 分支），
 * 因此各入口共用同一实现，避免把防护逻辑复制多份。
 */
export type FileHost = Pick<HostContext, 'handleFileOp'>;

const makeFileHandler = (type: string): RouteHandler<FileHost> => async (ctx, id, payload) => {
    await ctx.handleFileOp(id, type, payload);
};

export const fileRoutes: Record<string, RouteHandler<FileHost>> = {
    'file:list': makeFileHandler('file:list'),
    'file:get': makeFileHandler('file:get'),
    'file:write': makeFileHandler('file:write'),
    'file:delete': makeFileHandler('file:delete'),
    'file:readImage': makeFileHandler('file:readImage'),
    'file:writeBinary': makeFileHandler('file:writeBinary'),
};
