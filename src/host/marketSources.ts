/**
 * 市场下载源：把 raw.githubusercontent.com 链接展开成「多源候选」。
 *
 * 背景：raw.githubusercontent.com 在部分网络环境（国内常见）被 DNS 污染解析到 0.0.0.0，
 * 直连立即失败 —— 表现为市场清单拉不到、主题/模块点安装后「安装失败，重试」。
 *
 * 策略：jsDelivr CDN（国内可达）→ GitHub API（实时，需 Accept: raw）→ 原 raw 链接。
 * 任一源成功即可；原链接保留在末尾，海外用户行为不变。
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
    out.push(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`);
    out.push(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
  }
  out.push(encodeURI(rawUrl));
  return out;
}

/** GitHub API 源默认返回 { content: base64 } 包装，加此 Accept 才回原始文件内容 */
export function isGithubApiUrl(url: string): boolean {
  return url.indexOf('api.github.com') !== -1;
}

export const GITHUB_RAW_ACCEPT = 'application/vnd.github.raw';
