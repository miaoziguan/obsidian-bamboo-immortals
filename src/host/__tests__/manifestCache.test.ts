import { describe, it, expect } from 'vitest';
import { createManifestCache } from '../manifestCache';

/**
 * 回归锁：市场清单必须做请求去重——同一面板反复打开 / 装卸时不得重复全量拉取。
 * 覆盖三分支：命中缓存、过期重取、force 绕过。
 */
describe('manifestCache TTL 去重', () => {
  it('TTL 内重复取用只触发一次 fetcher，返回同一份清单', async () => {
    let t = 1000;
    const cache = createManifestCache(5000, () => t);
    let calls = 0;
    const fetcher = async () => { calls++; return { materials: [], n: calls }; };

    const a = await cache.get('u', fetcher);
    t = 3000; // 仍在 5000ms TTL 内
    const b = await cache.get('u', fetcher);

    expect(calls).toBe(1);
    expect(a).toBe(b);
  });

  it('超过 TTL 后重取', async () => {
    let t = 1000;
    const cache = createManifestCache(5000, () => t);
    let calls = 0;
    const fetcher = async () => { calls++; return { c: calls }; };

    await cache.get('u', fetcher);
    t = 6001; // 超出 TTL
    const second = await cache.get('u', fetcher);

    expect(calls).toBe(2);
    expect(second).toEqual({ c: 2 });
  });

  it('force=true 绕过缓存强制重取（刷新按钮）', async () => {
    const t = 1000;
    const cache = createManifestCache(5000, () => t);
    let calls = 0;
    const fetcher = async () => { calls++; return { c: calls }; };

    await cache.get('u', fetcher);
    const forced = await cache.get('u', fetcher, true);

    expect(calls).toBe(2);
    expect(forced).toEqual({ c: 2 });
  });

  it('不同 URL 各自独立缓存（三个市场互不串味）', async () => {
    const cache = createManifestCache(5000, () => 1000);
    let calls = 0;
    const fetcher = async (u: string) => { calls++; return { u }; };
    await cache.get('a', fetcher);
    await cache.get('b', fetcher);
    await cache.get('a', fetcher);
    expect(calls).toBe(2);
  });

  it('fetcher 抛错时不写缓存（下次仍会重试）', async () => {
    const cache = createManifestCache(5000, () => 1000);
    let calls = 0;
    const boom = async () => { calls++; throw new Error('网络失败'); };
    await expect(cache.get('u', boom)).rejects.toThrow('网络失败');
    const ok = async () => { calls++; return { ok: true }; };
    expect(await cache.get('u', ok)).toEqual({ ok: true });
    expect(calls).toBe(2);
  });
});
