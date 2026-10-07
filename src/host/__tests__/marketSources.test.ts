import { describe, it, expect } from 'vitest';
import { marketUrlCandidates, isGithubApiUrl, GITHUB_RAW_ACCEPT } from '../marketSources';

/**
 * 回归锁：市场下载必须能绕开被污染的 raw.githubusercontent.com。
 * 背景：该域名在部分网络环境解析到 0.0.0.0，直连立即失败 → 清单拉不到、主题装不上。
 */
describe('marketUrlCandidates 多源回退', () => {
  it('raw 链接展开为 GitHub API → jsDelivr → 原链接（API 优先，实时无缓存）', () => {
    const urls = marketUrlCandidates(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/manifest.json'
    );
    expect(urls).toHaveLength(3);
    expect(urls[0]).toBe(
      'https://api.github.com/repos/miaoziguan/bamboo-theme-market/contents/manifest.json?ref=main'
    );
    expect(urls[1]).toBe(
      'https://cdn.jsdelivr.net/gh/miaoziguan/bamboo-theme-market@main/manifest.json'
    );
    expect(urls[2]).toBe(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/manifest.json'
    );
  });

  it('中文文件名被编码为合法 URL（主题「荷塘鱼影.js」）', () => {
    const urls = marketUrlCandidates(
      'https://raw.githubusercontent.com/miaoziguan/bamboo-theme-market/main/themes/荷塘鱼影.js'
    );
    expect(urls[1]).toBe(
      'https://cdn.jsdelivr.net/gh/miaoziguan/bamboo-theme-market@main/themes/%E8%8D%B7%E5%A1%98%E9%B1%BC%E5%BD%B1.js'
    );
    // 编码后必须仍能被 URL 解析（非法字符会抛错）
    expect(() => new URL(urls[0])).not.toThrow();
    expect(() => new URL(urls[1])).not.toThrow();
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
