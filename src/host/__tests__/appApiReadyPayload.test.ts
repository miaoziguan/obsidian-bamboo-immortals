import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * app:ready 握手载荷完整性回归锁。
 *
 * 为什么需要它：app:ready 是**所有视图启动的唯一入口**（激活门控 / 板块配置 / 全量设置快照 /
 * 主题清单 / 平台感知 / 布局恢复源都靠它下发）。它是纯聚合代码——没有分支、没有算法，
 * 因此任何「重构/调整字段」都不会被现有用例发现：漏一个字段的后果是 webapp 静默降级
 * （如少 pendingLayoutMode → 重建后不恢复看板；少 customNoises → 自定义音源丢失）。
 *
 * 本文件不校验每个字段的业务正确性（那由各字段自身的测试负责），只锁两件事：
 *   ① 载荷的**字段集合**不得缺项（漏字段 = 立即失败）；
 *   ② 关键字段的**类型/默认值**与回调透传行为。
 */
const REQUIRED_KEYS = [
    'ok',
    'licenseActive',
    'sectionConfig',
    'settings',
    'customThemes',
    'activeTheme',
    'customNoises',
    'syncPaletteToObsidian',
    'isMobile',
    'appVersion',
    'isMainLeaf',
    'cameFromSidebar',
    'pendingLayoutMode',
] as const;

function makeApi() {
    const mock = createMockApp();
    const settings = {
        dataPath: 'bamboo-review',
        followObsidianTheme: false,
        noiseItems: [{ name: 'rain', path: 'a.mp3' }],
    } as Record<string, unknown>;

    const api = new AppAPI(
        mock.app as never,
        settings as never,
        async () => {},
        'noise',
        '.obsidian',
        { isActive: () => false } as never,
    );

    const sent: Array<Record<string, unknown>> = [];
    const cw = { postMessage: (m: Record<string, unknown>) => { sent.push(m); } };
    (api as unknown as { iframe: unknown }).iframe = { contentWindow: cw };

    // pushTheme 会向已绑定 iframe/document 广播，node 测试环境无 DOM：stub 掉以聚焦载荷本身
    vi.spyOn(
        (api as unknown as { themeBridge: { pushTheme: () => void } }).themeBridge,
        'pushTheme',
    ).mockImplementation(() => {});

    return { api, settings, sent, cw };
}

async function sendReady(api: AppAPI, cw: unknown, sent: Array<Record<string, unknown>>) {
    await (api as unknown as { onMessage: (e: unknown) => Promise<void> }).onMessage({
        data: { type: 'app:ready', id: 'ready-1', payload: {} },
        source: cw,
    });
    const res = sent.find((m) => m.id === 'ready-1' && m.type === 'storage:response');
    expect(res, 'app:ready 必须回执一条 storage:response').toBeDefined();
    return res!.payload as Record<string, unknown>;
}

describe('app:ready 握手载荷完整性', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('载荷包含全部约定字段（缺一即失败）', async () => {
        const { api, sent, cw } = makeApi();
        const payload = await sendReady(api, cw, sent);

        const missing = REQUIRED_KEYS.filter((k) => !Object.prototype.hasOwnProperty.call(payload, k));
        expect(missing).toEqual([]);
    });

    it('关键字段的类型与默认值正确', async () => {
        const { api, settings, sent, cw } = makeApi();
        const payload = await sendReady(api, cw, sent);

        expect(payload.ok).toBe(true);
        expect(typeof payload.licenseActive).toBe('boolean');
        expect(payload.sectionConfig).toBeNull();          // settings 无 sectionConfig → null
        expect(payload.settings).toBe(settings);           // 直接下发同一份快照对象（非拷贝）
        expect(Array.isArray(payload.customThemes)).toBe(true);
        expect(payload.activeTheme).toBeNull();            // 无已激活外部主题
        expect(Array.isArray(payload.customNoises)).toBe(true);
        expect(typeof payload.syncPaletteToObsidian).toBe('boolean');
        expect(typeof payload.isMobile).toBe('boolean');
        expect(typeof payload.appVersion).toBe('string');
        // 未注入回调时的默认值
        expect(payload.isMainLeaf).toBe(true);
        expect(payload.cameFromSidebar).toBe(false);
        expect(payload.pendingLayoutMode).toBeNull();
    });

    it('透传注入的回调（视图位置 / 是否来自侧栏 / 待恢复布局模式）', async () => {
        const { api, sent, cw } = makeApi();
        const anyApi = api as unknown as Record<string, unknown>;
        anyApi.isMainLeaf = () => false;
        anyApi.cameFromSidebar = () => true;
        anyApi.getPendingLayoutMode = () => 'kanban';

        const payload = await sendReady(api, cw, sent);
        expect(payload.isMainLeaf).toBe(false);
        expect(payload.cameFromSidebar).toBe(true);
        expect(payload.pendingLayoutMode).toBe('kanban');
    });
});
