/**
 * 市场下载源：把 raw.githubusercontent.com 链接展开成「多源候选」。
 *
 * 背景：raw.githubusercontent.com 在部分网络环境（国内常见）被 DNS 污染解析到 0.0.0.0，
 * 直连立即失败 —— 表现为市场清单拉不到、主题/模块点安装后「安装失败，重试」。
 *
 * 排序原则：新鲜源优先，陈旧 CDN 兜底。历史上把 jsDelivr 直接排第二，但它对 @main 分支引用
 * 有缓存延迟，市场推新版本后数小时甚至一天仍返回旧清单/代码（用户点了「更新」却吃到旧版——
 * 窗台模块曾因此把 v0.2.1 当 v0.3.21 装回，风景动效与设置弹窗凭空消失）。故重排为：
 *
 *   1) GitHub API（api.github.com，Accept: raw）：实时无缓存，最新鲜；但国内常被限流/阻断，可能跳过。
 *   2) 实时代理镜像（ghproxy.net 等）：直接代理 GitHub 原始文件、不做陈旧 CDN 缓存，
 *      国内可达且恒为最新——从根上规避「推送后 jsDelivr 仍吐旧版」的坑。
 *   3) jsDelivr CDN（@main）：国内可达、最稳定，但分支引用有缓存；在此追加「按毫秒」缓存破坏参数
 *      （?t=Date.now()）强制回源取最新，作为镜像不可用时的兜底新鲜源（CDN 加速失效，但量极小可接受）。
 *   4) 原 raw 链接：海外用户兜底。
 *
 * 任一源成功即止；原 raw 链接始终保留在末尾。
 *
 * 纯函数、零 Obsidian 依赖，便于单测（见 src/host/__tests__/marketSources.test.ts）。
 */

const RAW_RE = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/;

/**
 * 实时代理镜像：直接代理 GitHub 原始文件、不做陈旧 CDN 缓存。
 * 用于国内网络下绕过 jsDelivr @main 的缓存延迟，保证「推送即见」。
 * 顺序即优先级；第一个可达且新鲜的即被采用。可按需增删（均应为「前缀 + 原始 raw URL」形态）。
 */
const LIVE_MIRRORS = [
  'https://ghproxy.net/',
];

export function marketUrlCandidates(rawUrl: string): string[] {
  const out: string[] = [];
  const m = RAW_RE.exec(rawUrl);
  if (m) {
    const [, owner, repo, branch, rest] = m;
    // 主题/模块名可能是中文（如 荷塘鱼影.js），必须编码后才能作为 URL 路径使用
    const path = encodeURI(rest);
    const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    // 1) GitHub API：实时无缓存，最新鲜（国内常因限流/阻断失败，作首选但可能跳过）
    out.push(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
    // 2) 实时代理镜像：直接代理 GitHub、无陈旧缓存，国内可达且恒为最新
    for (const mirror of LIVE_MIRRORS) {
      out.push(`${mirror}${raw}`);
    }
    // 3) jsDelivr @main：稳定可达，但分支引用有缓存；按毫秒缓存破坏参数强制回源取最新
    out.push(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}?t=${Date.now()}`);
    // 4) 原 raw 链接：海外兜底
    out.push(raw);
  }
  out.push(encodeURI(rawUrl));
  return out;
}

/** GitHub API 源默认返回 { content: base64 } 包装，加此 Accept 才回原始文件内容 */
export function isGithubApiUrl(url: string): boolean {
  return url.indexOf('api.github.com') !== -1;
}

export const GITHUB_RAW_ACCEPT = 'application/vnd.github.raw';
