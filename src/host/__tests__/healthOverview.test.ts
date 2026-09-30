import { describe, it, expect, beforeEach } from 'vitest';
import { createMockApp } from '../../../test/mocks/obsidian';
import { AppAPI } from '../AppAPI';

/**
 * app:getHealthOverview 路由（战略复盘的宿主侧数据源出口）。
 * 关键回归点：响应必须带上 overview（数据概览聚合）——此前只发
 * updatedAt/health/goals/results，webapp「数据概览」tab 拿不到权威值，
 * 只能本地再算一遍，且本地用的是含归档的目标集 → 同一面板两套数字。
 */
describe('AppAPI app:getHealthOverview', () => {
  let api: AppAPI;
  let captured: { id: string; payload?: any; error?: string } | null;
  let iframeContentWindow: { postMessage: (msg: any) => void };

  const overview = {
    updatedAt: '2026-06-01T00:00:00.000Z',
    goals: [{ id: 'g1', title: '目标一' }],
    overview: { totalGoals: 7, avgProgress: 42, catStats: [] },
    health: { avgScore: 66, avgLevel: 'good', avgColor: '#fff' },
    results: [{ goalId: 'g1' }],
    hints: [{ type: 'warning', text: '动力指数下降', action: '激活惯性' }],
  };

  beforeEach(() => {
    const mock = createMockApp();
    captured = null;
    iframeContentWindow = { postMessage: (msg: any) => { captured = msg; } };
    api = new AppAPI(mock.app as any, {} as any, async () => {}, 'noise', '.obsidian', { isActive: () => false } as any);
    (api as any).iframe = { contentWindow: iframeContentWindow };
  });

  const send = (source: unknown, data: { type?: string; id?: string; payload?: unknown }) => {
    captured = null;
    return (api as any).onMessage({ data, source });
  };

  it('响应包含 overview（数据概览权威聚合）', async () => {
    api.setStrategyOverviewProvider(async () => overview as never);
    await send(iframeContentWindow, { type: 'app:getHealthOverview', id: 'h1', payload: {} });
    expect(captured!.error).toBeUndefined();
    const p = captured!.payload as any;
    expect(p.updatedAt).toBe(overview.updatedAt);
    expect(p.health).toEqual(overview.health);
    expect(p.goals).toEqual(overview.goals);
    expect(p.results).toEqual(overview.results);
    // 关键：此前缺失的字段
    expect(p.overview).toEqual(overview.overview);
    expect(p.hints).toEqual(overview.hints);
  });

  it('无目标数据（provider 返回 null）→ 明确报错而非空响应', async () => {
    api.setStrategyOverviewProvider(async () => null);
    await send(iframeContentWindow, { type: 'app:getHealthOverview', id: 'h2', payload: {} });
    expect(captured!.error).toBeTruthy();
    expect((captured!.payload as any)?.overview).toBeUndefined();
  });

  it('未配置数据源 → 报错', async () => {
    await send(iframeContentWindow, { type: 'app:getHealthOverview', id: 'h3', payload: {} });
    expect(captured!.error).toBeTruthy();
  });

  it('provider 抛错 → 收敛为错误响应，不抛出', async () => {
    api.setStrategyOverviewProvider(async () => { throw new Error('boom'); });
    await expect(send(iframeContentWindow, { type: 'app:getHealthOverview', id: 'h4', payload: {} })).resolves.toBeUndefined();
    expect(captured!.error).toContain('boom');
  });

  it('非 iframe 来源一律忽略', async () => {
    let called = false;
    api.setStrategyOverviewProvider(async () => { called = true; return overview as never; });
    await send({}, { type: 'app:getHealthOverview', id: 'h5', payload: {} });
    expect(called).toBe(false);
    expect(captured).toBeNull();
  });
});
