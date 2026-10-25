import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * AppAPI 跨边界契约回归锁（P0-2 → 扩展到全部入站类型）。
 *
 * 背景：AppAPI.ts 曾是 2100+ 行、最热、最大的文件，handleMessage 是约 950 行、31 个
 * if 分支的巨型方法。现已按领域拆到 src/host/handlers/*.ts，由 ROUTES 表分发。
 *
 * 最危险的失效模式是**静默失效**：
 *   handleMessage 末尾对未匹配类型会落到 handleStorageMessage 兜底（只认 storage:*），
 *   返回 undefined → respond(id, undefined)。既不报错也不告警 —— 任一侧把类型拼错、
 *   或拆分迁移时漏注册一条路由，双方都静悄悄，表现为「点了没反应」。
 *
 * 本文件用三条机制锁住：
 *   ① 契约清单与源码**机器对账**（双向）：所有入站类型必须恰好 = 清单；
 *      —— 迁移/新增都必须同步清单，否则失败；
 *   ② 逐类型断言「必须被分发处理、不得落到存储兜底」；
 *   ③ 反证用例：未知类型确实会落兜底（证明检测手段有效，否则可能永远绿）。
 */
const HOST_DIR = path.resolve(__dirname, '..');   // src/host

/** 花括号配对取 handleMessage 方法体（避免把手写实现如 handleFileOp 里的 if 误当分发入口） */
function extractHandleMessageBody(src: string): string {
    const start = src.indexOf('private async handleMessage(');
    if (start < 0) return '';
    const braceStart = src.indexOf('{', start);
    if (braceStart < 0) return '';
    let depth = 0;
    let end = -1;
    for (let i = braceStart; i < src.length; i++) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) { end = i; break; }
        }
    }
    return end > 0 ? src.slice(braceStart, end + 1) : '';
}

/**
 * 从源码提取全部入站契约类型（唯一事实来源）：
 *   ① 仍在 AppAPI.handleMessage 里的 `if (type === 'xxx')`
 *   ② 已迁入 src/host/handlers/*.ts 的路由表键 `'xxx':`
 */
function extractHandledTypes(): string[] {
    const found = new Set<string>();

    const appApiSrc = fs.readFileSync(path.join(HOST_DIR, 'AppAPI.ts'), 'utf8');
    const body = extractHandleMessageBody(appApiSrc);
    for (const m of body.matchAll(/if \(type === '([a-zA-Z:_-]+)'\)/g)) found.add(m[1]);

    const handlersDir = path.join(HOST_DIR, 'handlers');
    if (fs.existsSync(handlersDir)) {
        for (const name of fs.readdirSync(handlersDir)) {
            if (!name.endsWith('.ts')) continue;
            const src = fs.readFileSync(path.join(handlersDir, name), 'utf8');
            // 路由表键形如：'app:moveToCenter': handleMoveToCenter,
            for (const m of src.matchAll(/^\s*'([a-zA-Z:_-]+)'\s*:\s*\w+/gm)) found.add(m[1]);
        }
    }

    return Array.from(found).sort();
}

/**
 * 契约清单（须与源码逐字一致）。新增宿主消息类型时两处都要改：
 *   1) AppAPI.handleMessage 或对应 handlers/*.ts 增路由；
 *   2) 本清单补上（否则对账用例失败，提醒同步）。
 */
const CONTRACT: string[] = [
    // app:*
    'app:activateLicense',
    'app:aiImproveGoal',
    'app:close',
    'app:collapseRightSidebar',
    'app:expandRightSidebar',
    'app:exportBackup',
    'app:exportMindmap',
    'app:getBambooCoinAvailableBalance',
    'app:getBambooCoinBalance',
    'app:getCultivationRealm',
    'app:getHealthOverview',
    'app:getSettings',
    'app:importBackup',
    'app:listVaultAudioFiles',
    'app:moveScroll',
    'app:moveToCenter',
    'app:moveToSidebar',
    'app:openArchive',
    'app:openFile',
    'app:openModule',
    'app:openScroll',
    'app:openScrollLeftSidebar',
    'app:proxyAudioUrl',
    'app:readLocalFile',
    'app:readVaultFile',
    'app:ready',
    'app:saveCustomNoises',
    'app:saveSectionConfig',
    'app:theme:sync',
    'app:toggleObsidianTheme',
    'app:toggleZen',
    // file:*
    'file:delete',
    'file:get',
    'file:list',
    'file:write',
    // market:*
    'market:install',
    'market:manifest',
    'market:uninstall',
    // material:*
    'material:install',
    'material:load',
    'material:manifest',
    // module:*
    'module:install',
    'module:list',
    'module:listFiles',
    'module:load',
    'module:loadData',
    'module:market:manifest',
    'module:openFile',
    'module:openReader',
    'module:readFile',
    'module:renderMarkdown',
    'module:resolveResource',
    'module:saveData',
    'module:toggleTheme',
    'module:uninstall',
    'module:writeFile',
    // theme:*
    'theme:appDarkMode',
    'theme:load',
    'theme:syncPalette',
].sort();

describe('AppAPI 跨边界契约（全部入站类型分发）', () => {
    let api: AppAPI;
    let iframeContentWindow: { postMessage: (msg: unknown) => void };

    beforeEach(() => {
        const mock = createMockApp();
        iframeContentWindow = { postMessage: () => {} };
        api = new AppAPI(
            mock.app as never,
            { dataPath: 'bamboo-review' } as never,
            async () => {},
            'noise',
            '.obsidian',
            { isActive: () => false } as never,
        );
        // 绑定 iframe：onMessage 的来源校验要求 source === this.iframe.contentWindow
        (api as unknown as { iframe: unknown }).iframe = { contentWindow: iframeContentWindow };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('契约清单与源码分发点完全一致（双向防漂移）', () => {
        expect(extractHandledTypes()).toEqual(CONTRACT);
    });

    it('契约清单非空且均含冒号命名空间（防止提取正则失效导致空集放行）', () => {
        expect(CONTRACT.length).toBeGreaterThan(50);
        expect(CONTRACT.every((t) => t.includes(':'))).toBe(true);
    });

    it('handleMessage 内只剩 app:ready（其余 app:* 均已迁入 handlers 路由表）', () => {
        const appApiSrc = fs.readFileSync(path.join(HOST_DIR, 'AppAPI.ts'), 'utf8');
        const body = extractHandleMessageBody(appApiSrc);
        const inApp = Array.from(body.matchAll(/if \(type === '([a-zA-Z:_-]+)'\)/g)).map((m) => m[1]);
        expect(inApp).toEqual(['app:ready']);
    });

    describe.each(CONTRACT)('%s', (type) => {
        it('必须被分发处理，不得落到存储兜底（否则静默 respond(undefined)）', async () => {
            const spy = vi
                .spyOn(api as unknown as { handleStorageMessage: (t: string, p: unknown) => Promise<unknown> }, 'handleStorageMessage')
                .mockResolvedValue(undefined);

            await (api as unknown as { onMessage: (e: unknown) => Promise<void> }).onMessage({
                data: { type, id: 'test-id', payload: {} },
                source: iframeContentWindow,
            });

            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('反证：未知类型确实会落到存储兜底（证明上面的检测有效）', async () => {
        const spy = vi
            .spyOn(api as unknown as { handleStorageMessage: (t: string, p: unknown) => Promise<unknown> }, 'handleStorageMessage')
            .mockResolvedValue(undefined);

        await (api as unknown as { onMessage: (e: unknown) => Promise<void> }).onMessage({
            data: { type: 'app:__definitely_not_a_real_type__', id: 'test-id', payload: {} },
            source: iframeContentWindow,
        });

        // 若这条也「未被调用」，说明上面的逐类型断言是假绿 —— 必须能看到它真的落到底
        expect(spy).toHaveBeenCalledWith('app:__definitely_not_a_real_type__', expect.anything());
    });
});
