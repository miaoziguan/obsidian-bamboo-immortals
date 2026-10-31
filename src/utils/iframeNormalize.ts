/**
 * 博客阅读器里 <iframe> 的归一化决策（纯函数，便于单测）。
 *
 * 【两个真实问题，都是实测出来的】
 *
 * 1) 协议相对 URL：视频平台复制的 embed 常写成 `src="//player.xxx/v?bvid=..."`。
 *    Obsidian 桌面端页面运行在 `app://obsidian.md/` 下，`//host/path` 会被解析成
 *    `app://host/path` —— 域名不存在，必然加载失败，表现为黑框。
 *    故补成 `https://...`。
 *
 * 2) 写死的大尺寸被压窄后纵向拉伸：竖屏视频常见 `width="720" height="1280"`，
 *    正文列宽约 668px。实测：
 *      原始            → 724x1284（横向溢出，比例 0.564 正确）
 *      仅 max-width:100% → 632x1284（宽被压窄、高不变 → 比例 0.492，纵向变形）
 *      aspect-ratio 归一 → 632x1120（比例 0.564 保持）
 *    `max-width:100%` 这类规则很可能是宿主全局样式带的，所以此处把「属性宽高」
 *    转成 aspect-ratio + width:100% + height:auto，让高度随宽度等比缩放。
 */

interface IframePlan {
  /** 需要改写的 src（仅协议相对 URL 时给出） */
  src?: string;
  /** 形如 "720 / 1280"，或视频源无宽高时的 "16 / 9" */
  aspectRatio?: string;
}

/** 识别视频平台播放器地址（分享代码常不带宽高，需要给默认比例） */
const VIDEO_SRC_HINT =
  /(player\.|bilibili|youtube|youtu\.be|vimeo|youku|ixigua|douyin|qq\.com\/x\/page)/i;

/** 解析 src：把 `//host/path` 补成 `https://host/path`，其余原样返回 undefined */
function fixProtocolRelative(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  return src.startsWith('//') ? 'https:' + src : undefined;
}

/** 从 width/height 属性推导 aspect-ratio；属性缺失或含单位（如 "100%"）时不推导 */
export function planIframe(
  src: string | null | undefined,
  width: string | null | undefined,
  height: string | null | undefined,
): IframePlan {
  const plan: IframePlan = {};
  const fixed = fixProtocolRelative(src);
  if (fixed) plan.src = fixed;

  const w = Number(width);
  const h = Number(height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    plan.aspectRatio = `${w} / ${h}`;
    return plan;
  }

  // 无宽高属性：视频平台的「分享代码」常常干脆不带宽高（例：B 站新版 iframe 只有 src），
  // 浏览器会退化成 300x150 —— 视频播放器在这个尺寸下几乎不可用。
  // 仅对识别为视频源的地址补 16:9，普通网页 iframe 不擅自改比例。
  if (VIDEO_SRC_HINT.test(src || '')) plan.aspectRatio = '16 / 9';
  return plan;
}
