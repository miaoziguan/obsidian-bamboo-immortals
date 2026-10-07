/**
 * 市场下载源：把 raw.githubusercontent.com 链接展开成「多源候选」。
 *
 * 背景：raw.githubusercontent.com 在部分网络环境（国内常见）被 DNS 污染解析到 0.0.0.0，
 * 直连立即失败 —— 表现为市场清单拉不到、主题/模块点安装后「安装失败，重试」。
 *
 * 策略：GitHub API（国内直连可达、实时无 CDN 缓存）→ jsDelivr CDN（国内可达，兜底）→ 原 raw 链接。
 * 任一源成功即可；原 raw 链接保留在末尾，海外用户行为不变。
 * 注：jsDelivr 对 @main 分支引用有缓存，模块/主题市场推新版本后短期内仍返回旧清单/代码，
 * 故把「实时」的 GitHub API 排第一，jsDelivr 仅作 API 不可用（限流/故障）时的兜底——
 * 这才是「推送即见」、刷新能看到新版的治本所在（见 src/host/__tests__/marketSources.test.ts）。
 *
 * 纯函数、零 Obsidian 依赖，便于单测（见 src/host/__tests__/marketSources.test.ts）。
 */

const RAW_RE = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/;

export function marketUrlCandidates(rawUrl: string): string[] {
  const out: string[] = [];
  const m = RAW_RE.exec(rawUrl);
  if (m) {
    const [, owner, repo, branch, rest] = m;
    // 主题/模块名可能是中文（如 荷塘鱼影.js），必须编码后才能作为 URL 路径使用
    const path = encodeURI(rest);
    // GitHub API 排第一：api.github.com 国内直连可达，且不像 jsDelivr @main 那样有分支缓存，
    // 保证「推送即见」，从根上解决模块/主题市场刷新不到新版（jsDelivr 缓存 @main 分支引用）。
    out.push(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
    // jsDelivr 作兜底：仅当 API 不可用（限流/临时故障）时回落，CDN 缓存属可接受的降级。
    out.push(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`);
  }
  out.push(encodeURI(rawUrl));
  return out;
}

/** GitHub API 源默认返回 { content: base64 } 包装，加此 Accept 才回原始文件内容 */
export function isGithubApiUrl(url: string): boolean {
  return url.indexOf('api.github.com') !== -1;
}

export const GITHUB_RAW_ACCEPT = 'application/vnd.github.raw';
