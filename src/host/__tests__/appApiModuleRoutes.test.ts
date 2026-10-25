import { describe, it, expect, beforeEach } from 'vitest';
import { createMockApp, TFile, __setRequestUrlHandler } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * module:* 路由的**特征测试**（characterization tests）。
 *
 * 目的：module:* 这 14 条消息此前零测试，而它们即将从 AppAPI.handleMessage 拆到
 * handlers/moduleHandlers.ts。迁移前先用这些用例把**当前行为**钉住，迁移后同一批用例
 * 必须原样全绿 —— 这就是「迁移不改变行为」的判据。
 *
 * 已知盲区（受测试环境限制，迁移时需逐行比对而非依赖测试）：
 *   · module:renderMarkdown —— 依赖 activeDocument / MarkdownRenderer / Component，
 *     vitest 为 node 环境且 obsidian mock 不提供这些，无法在单测中执行；
 *   · module:listFiles 的递归分支 —— 内存 mock 的 adapter.list() 返回的 folders 是
 *     目录名而非完整路径，与真实 Obsidian 不同，故只测非递归与上限/过滤/排序。
 */

const MOD_DIR = '.obsidian/bamboo-review/modules';

function makeApi(settingsOverride: Record<string, unknown> = {}) {
    const mock = createMockApp();
    const adapter = mock.adapter;
    const app = mock.app as unknown as {
        vault: Record<string, unknown>;
        metadataCache: Record<string, unknown>;
        workspace: Record<string, unknown>;
    };

    const statMap = new Map<string, { mtime: number; ctime: number; size: number }>();
    const vault = app.vault as Record<string, unknown>;
    vault.configDir = '.obsidian';
    vault.getAbstractFileByPath = (p: string) => {
        const st = statMap.get(p);
        return st ? Object.assign(new TFile(p), { stat: st }) : null;
    };
    vault.getResourcePath = (f: { path: string }) => 'app://res/' + f.path;
    app.metadataCache = { getFirstLinkpathDest: () => null };
    app.workspace = { getLeaf: () => ({ openFile: async () => {} }) };

    const settings = {
        dataPath: 'bamboo-review',
        writeStoreFolder: 'typewriter-writing',
        notesStoreFolder: 'typewriter-notes',
        mindmapStoreFolder: 'typewriter-mindmap',
        modulePath: '',
        ...settingsOverride,
    } as Record<string, unknown>;

    const saveSettings = async () => {};
    const api = new AppAPI(
        app as never,
        settings as never,
        saveSettings,
        'noise',
        '.obsidian',
        { isActive: () => false } as never,
    );

    const sent: Array<Record<string, unknown>> = [];
    const cw = { postMessage: (m: Record<string, unknown>) => { sent.push(m); } };
    (api as unknown as { iframe: unknown }).iframe = { contentWindow: cw };

    return { api, adapter, settings, statMap, sent, cw };
}

function makeSend(api: AppAPI, cw: unknown, sent: Array<Record<string, unknown>>) {
    return async (type: string, payload: Record<string, unknown> = {}) => {
        sent.length = 0;
        await (api as unknown as { onMessage: (e: unknown) => Promise<void> }).onMessage({
            data: { type, id: 't1', payload },
            source: cw,
        });
        return sent[sent.length - 1];
    };
}

const MODULE_CODE = (id: string, extra = '') =>
    `window.__bamboo_module_ = { "id":"${id}","name":"${id.toUpperCase()}"${extra} };`;

describe('module:* 特征测试（迁移到 handlers/moduleHandlers.ts 前锁定行为）', () => {
    let ctx: ReturnType<typeof makeApi>;
    let send: ReturnType<typeof makeSend>;

    beforeEach(() => {
        ctx = makeApi();
        send = makeSend(ctx.api, ctx.cw, ctx.sent);
    });

    it('module:list —— 版本以安装记录优先、无记录回退 meta；fab 默认 null、location 默认 left', async () => {
        const c = makeApi({ moduleInstalled: { foo: { version: '9.9.9', installedAt: 1 } } });
        const s = makeSend(c.api, c.cw, c.sent);
        await c.adapter.write(`${MOD_DIR}/foo.js`, MODULE_CODE('foo', ',"version":"1.0.0","fab":{"icon":"x"},"location":"right"'));
        await c.adapter.write(`${MOD_DIR}/bar.js`, MODULE_CODE('bar', ',"version":"2.0.0"'));

        const res = await s('module:list', {});
        const payload = res.payload as { ok: boolean; modules: Array<Record<string, unknown>> };
        expect(payload.ok).toBe(true);
        const foo = payload.modules.find((m) => m.id === 'foo')!;
        const bar = payload.modules.find((m) => m.id === 'bar')!;
        expect(foo.version).toBe('9.9.9');          // 安装记录优先于 meta
        expect(foo.fab).toEqual({ icon: 'x' });
        expect(foo.location).toBe('right');
        expect(bar.version).toBe('2.0.0');          // 无记录 → 回退 meta.version
        expect(bar.fab).toBeNull();
        expect(bar.location).toBe('left');
    });

    it('module:load —— 命中返回 code；未命中返回 MODULE_NOT_FOUND', async () => {
        await ctx.adapter.write(`${MOD_DIR}/foo.js`, MODULE_CODE('foo'));
        let res = await send('module:load', { id: 'foo' });
        expect((res.payload as Record<string, unknown>).ok).toBe(true);
        expect(String((res.payload as Record<string, unknown>).code)).toContain('__bamboo_module_');

        res = await send('module:load', { id: 'nope' });
        expect(res.error).toBe('MODULE_NOT_FOUND');
    });

    it('module:saveData / module:loadData —— 往返一致；未知 id 返回 null', async () => {
        await send('module:saveData', { id: 'foo', data: { a: 1 } });
        expect((ctx.settings.moduleData as Record<string, unknown>).foo).toEqual({ a: 1 });

        let res = await send('module:loadData', { id: 'foo' });
        expect((res.payload as Record<string, unknown>).data).toEqual({ a: 1 });

        res = await send('module:loadData', { id: 'nope' });
        expect((res.payload as Record<string, unknown>).data).toBeNull();
    });

    it('module:writeFile —— 自动逐级建目录并写入；缺 path/content 报错', async () => {
        const res = await send('module:writeFile', { path: 'blog/a/b/c.md', content: 'hi' });
        expect((res.payload as Record<string, unknown>).ok).toBe(true);
        expect(await ctx.adapter.read('blog/a/b/c.md')).toBe('hi');

        const bad = await send('module:writeFile', { path: 'blog/x.md' });
        expect(bad.error).toBe('module:writeFile 缺少 path/content');
    });

    it('module:readFile —— 读取安全路径；配置目录被拒', async () => {
        await ctx.adapter.write('blog/a.md', 'body');
        let res = await send('module:readFile', { path: 'blog/a.md' });
        expect((res.payload as Record<string, unknown>).content).toBe('body');

        res = await send('module:readFile', { path: '.obsidian/x.md' });
        expect(String(res.error)).toContain('禁止访问 Obsidian 配置目录');
    });

    it('module:resolveResource —— 存在→资源 URL；不存在→文件不存在；配置目录被拒', async () => {
        ctx.statMap.set('assets/pic.png', { mtime: 1, ctime: 1, size: 10 });
        let res = await send('module:resolveResource', { path: 'assets/pic.png' });
        expect((res.payload as Record<string, unknown>).url).toBe('app://res/assets/pic.png');

        res = await send('module:resolveResource', { path: 'assets/none.png' });
        expect(res.error).toBe('文件不存在');

        res = await send('module:resolveResource', { path: '.obsidian/x.png' });
        expect(String(res.error)).toContain('禁止访问 Obsidian 配置目录');
    });

    it('module:openReader —— 调用注入回调并回执 ok', async () => {
        const calls: string[] = [];
        (ctx.api as unknown as { onOpenReader: (p: string) => void }).onOpenReader = (p) => calls.push(p);
        const res = await send('module:openReader', { path: 'blog/a.md' });
        expect(calls).toEqual(['blog/a.md']);
        expect((res.payload as Record<string, unknown>).ok).toBe(true);
    });

    it('module:listFiles —— 仅 .md、按 mtime 倒序、非递归不含子目录文件', async () => {
        await ctx.adapter.write('blog/old.md', 'o');
        await ctx.adapter.write('blog/new.md', 'n');
        await ctx.adapter.write('blog/skip.txt', 't');
        await ctx.adapter.write('blog/sub/deep.md', 'd');
        ctx.statMap.set('blog/old.md', { mtime: 100, ctime: 1, size: 1 });
        ctx.statMap.set('blog/new.md', { mtime: 200, ctime: 1, size: 1 });
        ctx.statMap.set('blog/sub/deep.md', { mtime: 300, ctime: 1, size: 1 });

        const res = await send('module:listFiles', { folder: 'blog' });
        const files = (res.payload as { files: Array<{ path: string }> }).files;
        expect(files.map((f) => f.path)).toEqual(['blog/new.md', 'blog/old.md']);   // 倒序 + 排除 txt/子目录
    });

    it('module:listFiles —— 单目录文件数上限 500', async () => {
        for (let i = 0; i < 501; i++) {
            const p = `many/f${String(i).padStart(3, '0')}.md`;
            await ctx.adapter.write(p, 'x');
            ctx.statMap.set(p, { mtime: i, ctime: 1, size: 1 });
        }
        const res = await send('module:listFiles', { folder: 'many' });
        expect((res.payload as { files: unknown[] }).files.length).toBe(500);
    });

    it('module:market:manifest —— 成功带 installed；命中 TTL 缓存不再请求；全新实例网络失败→respondError', async () => {
        const c = makeApi({ moduleInstalled: { foo: { version: '1', installedAt: 1 } } });
        const s = makeSend(c.api, c.cw, c.sent);

        __setRequestUrlHandler(async () => ({ status: 200, text: '{"modules":[]}' } as never));
        let res = await s('module:market:manifest', {});
        expect((res.payload as Record<string, unknown>).ok).toBe(true);
        expect((res.payload as Record<string, unknown>).installed).toEqual({ foo: { version: '1', installedAt: 1 } });

        // 实例级 TTL 缓存：第二次即便 handler 改为抛错，仍返回缓存（不报错）
        __setRequestUrlHandler(async () => { throw new Error('net down'); });
        res = await s('module:market:manifest', {});
        expect((res.payload as Record<string, unknown>).ok).toBe(true);

        // 全新实例（缓存为空）→ 全部源失败 → respondError
        const c2 = makeApi();
        const s2 = makeSend(c2.api, c2.cw, c2.sent);
        const res2 = await s2('module:market:manifest', {});
        expect(String(res2.error)).toContain('所有源均拉取失败');
    });

    it('module:install —— 校验标记后写盘并记录版本；非模块文件被拒', async () => {
        __setRequestUrlHandler(async () => ({ status: 200, text: MODULE_CODE('demo', ',"version":"3.0.0"') } as never));
        const res = await send('module:install', { id: 'demo', url: 'https://example.com/demo.js', version: '3.0.0' });
        expect((res.payload as Record<string, unknown>).ok).toBe(true);
        expect(await ctx.adapter.read(`${MOD_DIR}/demo.js`)).toContain('__bamboo_module_');
        expect((ctx.settings.moduleInstalled as Record<string, { version: string }>).demo.version).toBe('3.0.0');

        __setRequestUrlHandler(async () => ({ status: 200, text: 'not a module' } as never));
        const bad = await send('module:install', { id: 'bad', url: 'https://example.com/bad.js' });
        expect(bad.error).toBe('不是有效的竹林模块文件');
    });

    it('module:uninstall —— 删除 .js 并清除安装记录与模块数据', async () => {
        const c = makeApi({
            moduleInstalled: { demo: { version: '1', installedAt: 1 } },
            moduleData: { demo: { keep: true }, other: { x: 1 } },
        });
        const s = makeSend(c.api, c.cw, c.sent);
        await c.adapter.write(`${MOD_DIR}/demo.js`, MODULE_CODE('demo'));

        const res = await s('module:uninstall', { id: 'demo' });
        expect((res.payload as Record<string, unknown>).ok).toBe(true);
        expect(await c.adapter.exists(`${MOD_DIR}/demo.js`)).toBe(false);
        expect((c.settings.moduleInstalled as Record<string, unknown>).demo).toBeUndefined();
        expect((c.settings.moduleData as Record<string, unknown>).demo).toBeUndefined();
        expect((c.settings.moduleData as Record<string, unknown>).other).toEqual({ x: 1 });  // 不误删其它模块数据
    });

    it('module:openFile —— 文件不存在时报「文件不存在：<path>」', async () => {
        const res = await send('module:openFile', { path: 'blog/missing.md' });
        expect(res.error).toBe('文件不存在：blog/missing.md');
    });
});
