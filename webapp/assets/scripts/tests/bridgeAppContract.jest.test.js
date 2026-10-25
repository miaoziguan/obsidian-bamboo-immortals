/**
 * bridge.js ↔ 宿主 app:* 契约（发送端）回归锁。
 *
 * 背景（P0-1 覆盖率摸底）：storage/bridge.js 是 webapp 与宿主唯一的跨边界通道，
 * 但覆盖率仅 16.7%，且既有 bridge 测试只覆盖了 nav:/action: 接收端与 source 过滤，
 * **从未验证它发出的 app:* 消息类型**。
 *
 * 风险本质：宿主 AppAPI 是按「消息类型字符串」分发的（type === 'app:moveToCenter' 等）。
 * 发送端如果把类型拼错（或重构时改了方法名没同步），不会报错、不会抛异常 ——
 * 只会静默失效：webapp 以为请求了，宿主永远收不到。这类 bug 只能靠契约测试拦住。
 *
 * 加载策略同既有 bridge 测试：模块顶层注册 message 监听器，只 loadModule 一次。
 */
const { loadModule } = require('./__helpers__/testUtils');

describe('bridge.js ↔ 宿主 app:* 契约（发送端）', () => {
    let storageManager;
    let sent;

    beforeAll(() => {
        const mod = loadModule(
            'storage/bridge.js',
            ['BridgeStorage', 'storageManager'],
            {
                store: { navigateDate: () => {}, goToDate: () => {} },
                Handlers: { openSettingsModal: () => {} },
                StatsModal: { open: () => {} },
                SettingsModal: {},
            }
        );
        storageManager = mod.storageManager;
    });

    beforeEach(() => {
        sent = [];
        // 隔离握手，专注断言「发了什么」
        storageManager.ensureReady = jest.fn().mockResolvedValue(undefined);
        storageManager._send = jest.fn(async (type, payload) => {
            sent.push([type, payload]);
            return { ok: true };
        });
    });

    // [方法名, 调用参数, 期望消息类型, 期望 payload]
    const CONTRACT = [
        ['moveToCenter', ['kanban'], 'app:moveToCenter', { mode: 'kanban' }],
        ['moveToSidebar', [], 'app:moveToSidebar', {}],
        ['collapseRightSidebar', [], 'app:collapseRightSidebar', {}],
        ['expandRightSidebar', [], 'app:expandRightSidebar', {}],
        ['activateLicense', ['CODE-1'], 'app:activateLicense', { code: 'CODE-1' }],
        ['exportBackup', [], 'app:exportBackup', {}],
        ['importBackup', [{ v: 1 }], 'app:importBackup', { backup: { v: 1 } }],
    ];

    CONTRACT.forEach(([method, args, type, payload]) => {
        test(`${method}() → 发送 ${type}`, async () => {
            await storageManager[method](...args);
            expect(sent).toEqual([[type, payload]]);
        });
    });

    test('moveToCenter 把布局模式透传给宿主（宿主据此恢复多列模式）', async () => {
        await storageManager.moveToCenter('kanban');
        expect(sent[0][1]).toEqual({ mode: 'kanban' });
    });

    test('所有请求都先 await ensureReady（未就绪不发送消息）', async () => {
        await storageManager.moveToCenter('kanban');
        expect(storageManager.ensureReady).toHaveBeenCalledTimes(1);
    });

    test('布局切换四类消息类型逐字正确（按序），宿主按同名字符串分发', async () => {
        await storageManager.moveToCenter('kanban');
        await storageManager.moveToSidebar();
        await storageManager.collapseRightSidebar();
        await storageManager.expandRightSidebar();
        expect(sent.map((s) => s[0])).toEqual([
            'app:moveToCenter',
            'app:moveToSidebar',
            'app:collapseRightSidebar',
            'app:expandRightSidebar',
        ]);
    });
});
