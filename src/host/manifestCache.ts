/**
 * 市场清单内存缓存（TTL）。
 *
 * 背景：主题 / 模块 / 素材三个市场的清单都由宿主在「每次打开面板」与「每次安装/卸载」
 * 时重新拉取（见 AppAPI 的 *_market:manifest 分支）。清单会随素材增长而变大
 * （素材清单当前已达数百 KB），重复拉取既是流量也是延迟。
 *
 * 为什么用 TTL 而非 ETag：_fetchMarketText 是「GitHub API → jsDelivr → raw」三源回退，
 * 各源的缓存 / 校验语义不同（jsDelivr 自带 CDN 缓存、raw 无 ETag），跨源无法复用 ETag；
 * 而重复拉取绝大多数发生在同一插件会话内，内存 TTL 更简单且完全覆盖该场景。
 *
 * 纯逻辑、可注入时钟，便于单测。
 */

export type ManifestCache = {
  /**
   * 取清单：命中未过期缓存直接返回；否则调用 fetcher 重取并写缓存。
   * force=true 时绕过缓存强制重取。fetcher 抛错时不写缓存（失败不缓存）。
   */
  get(
    rawUrl: string,
    fetcher: (url: string) => Promise<Record<string, unknown>>,
    force?: boolean
  ): Promise<Record<string, unknown>>;
  /** 清空全部缓存（诊断 / 测试用） */
  clear(): void;
};

export function createManifestCache(
  ttlMs: number,
  now: () => number = () => Date.now()
): ManifestCache {
  const store = new Map<string, { at: number; value: Record<string, unknown> }>();
  return {
    async get(rawUrl, fetcher, force = false) {
      if (!force) {
        const hit = store.get(rawUrl);
        if (hit && now() - hit.at <= ttlMs) return hit.value;
      }
      const value = await fetcher(rawUrl);
      store.set(rawUrl, { at: now(), value });
      return value;
    },
    clear() {
      store.clear();
    },
  };
}
