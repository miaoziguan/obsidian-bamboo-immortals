import type { HostContext, RouteHandler } from './hostContext';

/**
 * 竹杖芒鞋「模块」相关消息处理器（从 AppAPI.handleMessage 拆出）。
 *
 * 覆盖：模块市场（清单/安装/卸载）、模块清单与按需加载、模块自持久化数据、
 * 模块文件能力（列目录/读/写/渲染 markdown/打开/资源 URL/阅读视图）。
 *
 * 迁移方式：**逐分支 1:1 搬运**，错误文案、上限常量、排序规则、校验顺序全部保持原样；
 * 行为等价性由 src/host/__tests__/appApiModuleRoutes.test.ts（迁移前先写的特征测试）保证。
 */
export type ModuleHost = Pick<HostContext,
    | 'respond'
    | 'respondError'
    // 模块市场
    | 'fetchMarketJson'
    | 'wantRefresh'
    | 'fetchMarketText'
    | 'safeAssetId'
    | 'moduleDir'
    | 'rescanModules'
    | 'getModuleInstalled'
    | 'setModuleInstalled'
    | 'clearModuleRecords'
    // 模块清单 / 加载 / 数据
    | 'getModuleIds'
    | 'getModuleCode'
    | 'getModuleMeta'
    | 'getModuleData'
    | 'setModuleData'
    // 文件能力
    | 'safeModulePath'
    | 'normalizeVaultPath'
    | 'vaultFileExists'
    | 'listVaultDir'
    | 'statVaultFile'
    | 'readVaultText'
    | 'writeVaultText'
    | 'removeVaultFileIfExists'
    | 'resolveModuleFile'
    | 'openVaultFileInTab'
    | 'resolveWikiLink'
    | 'resolveResourceUrl'
    | 'renderMarkdownToHtml'
    | 'openReader'
    >;

/** 模块市场：拉取清单（附带已安装版本表，供 webapp 判定「可更新」） */
const handleModuleMarketManifest: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    try {
        const manifest = await ctx.fetchMarketJson('module', ctx.wantRefresh(payload));
        ctx.respond(id, { ok: true, manifest, installed: ctx.getModuleInstalled() });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '模块市场清单拉取失败');
    }
};

/** 模块市场：安装（下载 .js 写入模块目录，触发重扫） */
const handleModuleInstall: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const mid = typeof payload.id === 'string' ? payload.id : '';
    const url = typeof payload.url === 'string' ? payload.url : '';
    if (!mid || !url) {
        ctx.respondError(id, 'module:install 缺少 id 或 url');
        return;
    }
    try {
        const assetId = ctx.safeAssetId(mid, '模块 id');
        const code = await ctx.fetchMarketText(url);
        if (!code.includes('__bamboo_module_')) throw new Error('不是有效的竹林模块文件');
        // 首次安装时目录可能尚不存在：writeVaultText 内部逐级建目录后再写
        await ctx.writeVaultText(`${ctx.moduleDir()}/${assetId}.js`, code);
        await ctx.setModuleInstalled(assetId, {
            version: typeof payload.version === 'string' ? payload.version : '',
            installedAt: Date.now(),
        });
        await ctx.rescanModules();
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '模块安装失败');
    }
};

/** 模块市场：卸载（删除模块 .js，连带清除其自持久化数据） */
const handleModuleUninstall: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const mid = typeof payload.id === 'string' ? payload.id : '';
    if (!mid) {
        ctx.respondError(id, 'module:uninstall 缺少 id');
        return;
    }
    try {
        const assetId = ctx.safeAssetId(mid, '模块 id');
        await ctx.removeVaultFileIfExists(`${ctx.moduleDir()}/${assetId}.js`);
        // 安装记录 + 自持久化数据一并清除（clearModuleRecords 内合并为一次落盘）
        await ctx.clearModuleRecords(assetId);
        await ctx.rescanModules();
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '模块卸载失败');
    }
};

/** 已安装模块清单（主应用据此把模块声明的按钮注入悬浮菜单） */
const handleModuleList: RouteHandler<ModuleHost> = async (ctx, id) => {
    await ctx.rescanModules();
    const installed = ctx.getModuleInstalled();
    ctx.respond(id, {
        ok: true,
        // 带上元数据（含 fab 按钮声明），主应用据此注入悬浮菜单按钮，无需执行模块代码
        modules: ctx.getModuleIds().map((mid) => {
            const meta = ctx.getModuleMeta(mid);
            return {
                id: meta?.id || mid,
                name: meta?.name || mid,
                // 版本以安装记录为准（市场装/卸时写入）；无记录（手工放入的文件）退回元数据声明
                version: installed[mid]?.version || meta?.version || '',
                fab: meta?.fab || null,
                location: meta?.location || 'left',
            };
        }),
    });
};

/** 按需加载模块代码（同 theme:load，避免全量下发 + 全量 new Function 执行） */
const handleModuleLoad: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const mid = typeof payload.id === 'string' ? payload.id : '';
    if (!mid) {
        ctx.respondError(id, 'module:load 缺少 id');
        return;
    }
    if (ctx.getModuleIds().length === 0) await ctx.rescanModules();
    const code = ctx.getModuleCode(mid);
    if (code !== undefined) {
        ctx.respond(id, { ok: true, code });
    } else {
        ctx.respondError(id, 'MODULE_NOT_FOUND');
    }
};

/**
 * 模块自持久化数据：data: URL 下 localStorage/sessionStorage/indexedDB 读取即抛
 * SecurityError，故模块的用户数据统一由宿主存进插件设置。
 */
const handleModuleSaveData: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const mid = typeof payload.id === 'string' ? payload.id : '';
    if (!mid) {
        ctx.respondError(id, 'module:saveData 缺少 id');
        return;
    }
    await ctx.setModuleData(mid, payload.data);
    ctx.respond(id, { ok: true });
};

const handleModuleLoadData: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const mid = typeof payload.id === 'string' ? payload.id : '';
    ctx.respond(id, { ok: true, data: ctx.getModuleData(mid) || null });
};

/** 模块能力：列目录（仅 .md，上限 500 文件 / 深度 5，按 mtime 倒序） */
const handleModuleListFiles: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const rawFolder = typeof payload.folder === 'string' ? payload.folder : '';
    let folder: string;
    try {
        folder = ctx.safeModulePath(rawFolder.replace(/\/+$/, ''), '模块目录');
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '非法目录');
        return;
    }
    try {
        const out: { path: string; name: string; mtime: number; ctime: number; size: number }[] = [];
        // 上限保护：误把 vault 根目录当博客目录时，不至于一次吞掉整个库
        const MAX_FILES = 500;
        const MAX_DEPTH = 5;
        const queue: { p: string; d: number }[] = [{ p: folder, d: 0 }];
        while (queue.length > 0 && out.length < MAX_FILES) {
            const cur = queue.shift();
            if (!cur) break;
            const listed = await ctx.listVaultDir(cur.p);
            for (const f of listed.files) {
                if (!f.endsWith('.md')) continue;
                const np = ctx.normalizeVaultPath(f);
                const st = await ctx.statVaultFile(np);
                out.push({
                    path: np,
                    name: (np.split('/').pop() || np).replace(/\.md$/, ''),
                    mtime: st?.mtime ?? 0,
                    ctime: st?.ctime ?? 0,
                    size: st?.size ?? 0,
                });
                if (out.length >= MAX_FILES) break;
            }
            if (payload.recursive && cur.d + 1 < MAX_DEPTH) {
                for (const d of listed.folders) queue.push({ p: d, d: cur.d + 1 });
            }
        }
        out.sort((a, b) => b.mtime - a.mtime);
        ctx.respond(id, { ok: true, files: out });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '目录读取失败');
    }
};

/** 模块能力：读取 vault 文件正文 */
const handleModuleReadFile: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const p = typeof payload.path === 'string' ? payload.path : '';
    if (!p) {
        ctx.respondError(id, 'module:readFile 缺少 path');
        return;
    }
    try {
        const content = await ctx.readVaultText(ctx.safeModulePath(p, '模块文件路径'));
        ctx.respond(id, { ok: true, content });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '文件读取失败');
    }
};

/** 模块能力：渲染 markdown 为 HTML（侧栏内置阅读视图，避免跳离模块） */
const handleModuleRenderMarkdown: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    let markdown = typeof payload.content === 'string' ? payload.content : null;
    const rawPath = typeof payload.path === 'string' ? payload.path : '';
    let sourcePath = typeof payload.sourcePath === 'string' ? payload.sourcePath : rawPath;

    if (markdown == null && rawPath) {
        // 与 module:readFile 同一套防护：拦路径遍历 + .obsidian 配置目录
        let target = ctx.safeModulePath(rawPath.split('#')[0], '模块文件路径');
        if (!(await ctx.vaultFileExists(target))) {
            // wikilink / 仅笔记名：按 basename 查找（模块内 [[笔记]] 跳转）
            const base = rawPath.split('#')[0].split('/').pop() || rawPath;
            const hit = ctx.resolveWikiLink(base, sourcePath);
            if (hit) target = hit.path;
        }
        try {
            markdown = await ctx.readVaultText(target);
            sourcePath = target;
        } catch (e) {
            ctx.respondError(id, e instanceof Error ? e.message : '文件读取失败');
            return;
        }
    }
    if (markdown == null) {
        ctx.respondError(id, 'module:renderMarkdown 缺少 content/path');
        return;
    }
    try {
        const html = await ctx.renderMarkdownToHtml(markdown, sourcePath);
        ctx.respond(id, { ok: true, html, sourcePath });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '渲染失败');
    }
};

/**
 * 模块能力：用 Obsidian 原生阅读视图打开文件。
 * 模块视图常驻左侧栏，故文章一律在中央工作区新页签打开（不抢占模块视图所在的 leaf）。
 */
const handleModuleOpenFile: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const p = typeof payload.path === 'string' ? payload.path : '';
    if (!p) {
        ctx.respondError(id, 'module:openFile 缺少 path');
        return;
    }
    const tf = ctx.resolveModuleFile(p);
    if (!tf) {
        ctx.respondError(id, '文件不存在：' + p);
        return;
    }
    await ctx.openVaultFileInTab(tf.path);
    ctx.respond(id, { ok: true });
};

/** 模块能力：写入 vault 文件（博客模块「一键应用竹杖芒鞋排版」用） */
const handleModuleWriteFile: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const p = typeof payload.path === 'string' ? payload.path : '';
    if (!p || typeof payload.content !== 'string') {
        ctx.respondError(id, 'module:writeFile 缺少 path/content');
        return;
    }
    const np = ctx.safeModulePath(p, '模块文件路径');
    try {
        // writeVaultText 内部逐级建目录（原实现只建最后一层，嵌套路径会失败）
        await ctx.writeVaultText(np, payload.content);
        ctx.respond(id, { ok: true });
    } catch (e) {
        ctx.respondError(id, e instanceof Error ? e.message : '写入失败');
    }
};

/**
 * 模块能力：把 vault 文件路径解析成 webview 可加载的资源 URL。
 * 模块运行在 webview 里，拿不到 Obsidian 的 getResourcePath；头像/封面等 vault 内图片
 * 必须经宿主换成 app:// 资源地址才能渲染。只读操作，不写盘。
 */
const handleModuleResolveResource: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const p = typeof payload.path === 'string' ? payload.path : '';
    if (!p) {
        ctx.respondError(id, 'module:resolveResource 缺少 path');
        return;
    }
    const url = ctx.resolveResourceUrl(p);
    if (url === null) {
        ctx.respondError(id, '文件不存在');
        return;
    }
    ctx.respond(id, { ok: true, url });
};

/** 模块能力：在宿主自建的竹杖芒鞋式中央阅读视图打开文章 */
const handleModuleOpenReader: RouteHandler<ModuleHost> = async (ctx, id, payload) => {
    const p = typeof payload.path === 'string' ? payload.path : '';
    if (!p) {
        ctx.respondError(id, 'module:openReader 缺少 path');
        return;
    }
    ctx.openReader(p);
    ctx.respond(id, { ok: true });
};

export const moduleRoutes: Record<string, RouteHandler<ModuleHost>> = {
    'module:market:manifest': handleModuleMarketManifest,
    'module:install': handleModuleInstall,
    'module:uninstall': handleModuleUninstall,
    'module:list': handleModuleList,
    'module:load': handleModuleLoad,
    'module:saveData': handleModuleSaveData,
    'module:loadData': handleModuleLoadData,
    'module:listFiles': handleModuleListFiles,
    'module:readFile': handleModuleReadFile,
    'module:renderMarkdown': handleModuleRenderMarkdown,
    'module:openFile': handleModuleOpenFile,
    'module:writeFile': handleModuleWriteFile,
    'module:resolveResource': handleModuleResolveResource,
    'module:openReader': handleModuleOpenReader,
};
