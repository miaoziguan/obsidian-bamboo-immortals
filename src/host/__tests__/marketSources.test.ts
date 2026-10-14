import { describe, it, expect } from 'vitest';
import { marketUrlCandidates, isGithubApiUrl, GITHUB_RAW_ACCEPT } from '../marketSources';

/**
 * 回归锁：市场下载必须能绕开被污染的 raw.githubusercontent.com。
 * 背景：该域名在部分网络环境解析到 0.0.0.0，直连立即失败 → 清单拉不到、主题装不上。
 */
describe('marketUrlCandidates 多源回退', () => {
  it('raw 链接展开为 GitHub API → 实时镜像 → jsDelivr(带缓存破坏) → 原链接', () => {
    const urls = marketUrlCandidates(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/manifest.json'
    );
    // 顺序：API(1) + 实时镜像(1) + jsDelivr(1) + 原 raw(1) + 兜底原链接(1) = 5
    expect(urls).toHaveLength(5);
    expect(urls[0]).toBe(
      'https://api.github.com/repos/miaoziguan/bamboo-theme-market/contents/manifest.json?ref=main'
    );
    // 实时镜像（ghproxy）代理整条 raw URL；路径中的中文由 encodeURI 处理
    expect(urls[1]).toBe(
      'https://ghproxy.net/https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/manifest.json'
    );
    // jsDelivr 必须带缓存破坏参数，强制回源取最新（根治 @main 陈旧缓存）
    expect(urls[2]).toContain('cdn.jsdelivr.net/gh/miaoziguan/bamboo-theme-market@main/manifest.json');
    expect(urls[2]).toContain('?t=');
    // 原 raw（编码后）与兜底原链接一致
    expect(urls[3]).toBe(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/manifest.json'
    );
    expect(urls[4]).toBe(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/manifest.json'
    );
  });

  it('中文文件名被编码为合法 URL（主题「荷塘鱼影.js」）', () => {
    const urls = marketUrlCandidates(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/themes/荷塘鱼影.js'
    );
    expect(urls).toHaveLength(5);
    // 实时镜像保留整条 raw URL（含已编码中文）
    expect(urls[1]).toBe(
      'https://ghproxy.net/https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/themes/%E8%8D%B7%E5%A1%98%E9%B1%BC%E5%BD%B1.js'
    );
    // jsDelivr 候选必须编码中文且带缓存破坏参数
    expect(urls[2]).toContain(
      'cdn.jsdelivr.net/gh/miaoziguan/bamboo-theme-market@main/themes/%E8%8D%B7%E5%A1%98%E9%B1%BC%E5%BD%B1.js'
    );
    expect(urls[2]).toContain('?t=');
    // 编码后必须仍能被 URL 解析（非法字符会抛错）
    expect(() => new URL(urls[0])).not.toThrow();
    expect(() => new URL(urls[2])).not.toThrow();
  });

  it('非 raw 域名（如用户自建源）也至少保有原链接', () => {
    const urls = marketUrlCandidates('https://example.com/market/manifest.json');
    expect(urls).toEqual(['https://example.com/market/manifest.json']);
  });

  it('GitHub API 源需要 raw 的 Accept 头（否则拿到 base64 包装）', () => {
    const urls = marketUrlCandidates(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-module-market/main/manifest.json'
    );
    expect(isGithubApiUrl(urls[0])).toBe(true);
    expect(isGithubApiUrl(urls[1])).toBe(false);
    expect(GITHUB_RAW_ACCEPT).toBe('application/vnd.github.raw');
  });
});
