/**
 * 博客选区 → 固定风格分享卡 PNG（纯 canvas 手绘，零依赖）。
 *
 * 视觉语言复用 obsidian-bamboo-walking 的「极简宣纸」分享卡：
 * 偏白竹绿底 + 极淡纸纤维质感、暖墨字、竹青署名、中文避头尾、两端对齐。
 * 不依赖 market paper / shadowRoot / foreignObject —— 宿主侧直接绘制即可。
 */

/* ── 极简宣纸设计 token（与 walking share.ts 一致） ── */
const PAPER = '#fafdfb';
const INK = '#2b2b28';
const INK_SOFT = '#5b574e';
const BAMBOO = '#4a7c59';
const SERIF = "'PingFang SC','Microsoft YaHei',sans-serif";

import { typesetParagraph, drawTypesetLine, NO_LINE_START } from './cjkTypeset';
import { normalizeMixedPunctuation } from './mixedPunctuation';


function serif(weight: number, size: number): string {
  return `${weight} ${size}px ${SERIF}`;
}

/**
 * 极淡纸纤维质感：离屏生成 128×128 的噪点 tile，含两类纹理——
 * ① 细颗粒（模拟纸浆纤维的随机明暗）② 横向长丝（模拟宣纸的帘纹），
 * 以 2~3% 透明度平铺。肉眼几乎看不出，但纸面不再是一块死板的纯色。
 */
/**
 * 创建离屏 canvas。走 Obsidian 注入的 createEl（官方 prefer-create-el）——
 * document.body 元素带 createEl 增强；创建后立即从 DOM 摘除，canvas 对象本身仍可用于绘制。
 */
function offscreenCanvas(): HTMLCanvasElement {
  const el = document.body.createEl('canvas');
  el.remove();
  return el;
}

function paintPaperGrain(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const T = 128;
  const tile = offscreenCanvas();
  tile.width = T;
  tile.height = T;
  const tctx = tile.getContext('2d');
  if (!tctx) return;
  const img = tctx.createImageData(T, T);
  const d = img.data;
  let seed = 20261128;                           // 固定种子：同一张卡每次导出纹理一致
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let y = 0; y < T; y++) {
    // 帘纹：每 4px 一条极淡横丝
    const laid = (y % 4 === 0) ? 4 : 0;
    for (let x = 0; x < T; x++) {
      const i = (y * T + x) * 4;
      const fiber = (rnd() * 10 + laid) | 0;
      d[i] = d[i + 1] = d[i + 2] = 30;          // 墨色颗粒（深于纸底）
      d[i + 3] = fiber;                          // alpha 0~14 / 255 ≈ 0~5.5%
    }
  }
  tctx.putImageData(img, 0, 0);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (!pattern) return;
  ctx.save();
  ctx.globalAlpha = 0.55;                        // 再压一档：最终约 0~3%
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * 选区纯文本化：去 markdown 语法、压段内空白，但**保留段落分隔**（\\n）。
 * 两段文字被选区一起复制时，Obsidian 给出的 toString() 用空行分段；
 * 若把 \\s+ 一律压成空格，两段就会粘成一整块（实测分享卡丢掉分段结构）。
 */
export function selectionToPlain(text: string): string {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|]/g, ' ')
    // 段内空白压成单空格；连续空行收敛为单个段落分隔符
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** 供测试/复用：按宽度排版并应用避头尾与孤行合并 */
export function layoutLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paras = text.split('\n').filter((p) => p.trim());
  // 段首禁则合并：被 DOM 切断的「段」以 ”/：/， 开头时并回前一段
  const merged: string[] = [];
  for (const p of paras) {
    const first = Array.from(p)[0];
    if (merged.length && NO_LINE_START.has(first)) merged[merged.length - 1] += p;
    else merged.push(p);
  }
  const lines: string[] = [];
  for (let i = 0; i < merged.length; i++) {
    if (i > 0) lines.push('');
    lines.push(...typesetParagraph(ctx, merged[i], maxWidth));
  }
  // 兜底：任何行仍以禁则标点开头，并入上一行
  for (let i = lines.length - 1; i > 0; i--) {
    if (!lines[i] || lines[i - 1] === '') continue;
    const arr = Array.from(lines[i]);
    let j = 0;
    while (j < arr.length && NO_LINE_START.has(arr[j])) j++;
    if (j > 0) {
      lines[i - 1] += arr.slice(0, j).join('');
      lines[i] = arr.slice(j).join('');
      if (!lines[i]) lines.splice(i, 1);
    }
  }
  return lines;
}

/**
 * 生成固定风格分享卡 PNG。
 * @param selectedText 选区纯文本
 * @param sourceTitle 文章标题（作为出处署名）
 * @param opts 尺寸与页脚：width 默认 1080；height 缺省时按内容自适应；footer 为空时不渲染页脚行
 */
export async function renderSelectionPng(
  selectedText: string,
  sourceTitle: string,
  opts?: {
    width?: number; height?: number; footer?: string;
    /** 归一了 N 处西文标点时回调（供 UI 决定是否提示；N=0 不调用） */
    onPunctNormalized?: (changes: number) => void;
  }
): Promise<{ base64: string; width: number; height: number }> {
  const plain = selectionToPlain(selectedText);
  if (!plain) throw new Error('选区内容为空');
  // 中文夹西文标点：只在导出的卡片文本里按语境归一，绝不改原文
  const norm = normalizeMixedPunctuation(plain);
  const text = norm.text;
  if (opts?.onPunctNormalized) opts.onPunctNormalized(norm.changes);

  const w = opts?.width ?? 1080;
  const pad = Math.round(w * 0.09);
  const maxW = w - pad * 2;

  // ── 第一步：离屏测量折行，据此定字号与画布高度 ──
  // 短选区放大字号（从 0.05 提到 0.06），避免固定大画布里只占中间一小条。
  const chars = Array.from(text).length;
  const probe = offscreenCanvas().getContext('2d');
  if (!probe) throw new Error('canvas 2D 不可用');
  let qSize = Math.round(chars > 260 ? w * 0.036 : chars > 140 ? w * 0.045 : w * 0.06);
  probe.font = serif(700, qSize);
  let lines = layoutLines(probe, text, maxW);
  // 行数过多时收字号，但保住可读下限（w*0.032）；长文宁可卡片变长也不再压字号，
  // 否则多段落文本会被挤成密密麻麻一大片（实测信息难读）。
  if (lines.length > 12) {
    qSize = Math.max(Math.round(w * 0.032), Math.round(qSize * 12 / lines.length));
    probe.font = serif(700, qSize);
    lines = layoutLines(probe, text, maxW);
  }

  const lineH = Math.round(qSize * 1.62);
  const sourceSize = Math.round(w * 0.026);   // 出处略收小，与正文拉开层级
  const footerSize = Math.round(w * 0.02);
  // 出处与正文的固定间距：至少 1.1 倍正文字号 + 一行出处高，不能被页脚上限挤掉
  const sourceGap = Math.round(qSize * 1.8);
  const footerGap = Math.round(pad * 1.1);
  /* 参考构图：正文从约 1/4 高度起、出处紧随其后，下方留约 30% 空白给页脚。
     画布 = 内容区 × 1.35（放大下部留白），正文起点 = 画布高 × 22%。 */
  const bodyH = lines.length * lineH + sourceGap + sourceSize * 1.6;
  const contentH = Math.round(pad * 0.9 + bodyH + footerGap + footerSize);
  /* 高度完全由内容决定，不再设 w*1.6 上限 —— 上限会把 sourceY 顶出画布（出处消失）。
     长文本卡片变长是正确行为，短文本由下方 Math.max 保证不扁。 */
  const h = opts?.height ?? Math.max(Math.round(w * 0.9), Math.round(contentH * 1.35));
  const top = opts?.height ? Math.round(pad * 0.9) : Math.round(h * 0.22);

  // ── 第二步：正式绘制 ──
  const canvas = offscreenCanvas();
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2D 不可用');

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  paintPaperGrain(ctx, w, h);   // 极淡纸纤维，肉眼几乎不可见但纸面不再死板

  const finalH = lines.length * lineH;
  const footerY = h - Math.round(pad * 0.45);
  /* 正文整体上移，贴着出处；出处与末行之间保留固定 sourceGap（高度已计入，不会被挤掉）。
     顶部留白 = 内容区剩余空间，短卡自然偏紧、长卡自然舒展，但间距恒定。 */
  // 兜底：出处不得越过页脚（即使调用方显式传了偏小的 height）
  const sourceY = Math.min(top + finalH + sourceGap, footerY - sourceSize * 2.5);
  let qy = top + lineH;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillStyle = INK;
    ctx.font = serif(700, qSize);
    const ln = lines[i];
    // 空串是段间占位：不画字，但推进一行高度，形成段落留白
    if (ln) {
      // 段末行也不能两端对齐：下一行是段间空串时，本行就是该段最后一行。
      // 原先只看「是否整个 lines 最后一行」，多段时首段末行被误判而拉散（「取 用 。」）。
      const isParaEnd = i === lines.length - 1 || lines[i + 1] === '';
      // 只有 1~2 字的行（多半是残留短句）不拉伸，否则孤零零被拉满很难看
      const justify = !isParaEnd && Array.from(ln).length > 2;
      drawTypesetLine(ctx, ln, pad, qy, maxW, justify);
    }
    qy += lineH;
  }

  // 出处（竹青小字）紧跟正文，页脚钉在底部
  ctx.fillStyle = BAMBOO;
  ctx.font = serif(500, sourceSize);
  // 出处视觉锚点：24px 竹青细线 + 文字，让「正文 / 出处 / 页脚」三段有结构而非平铺
  const ruleW = Math.round(sourceSize * 1.6);
  const ruleY = sourceY - Math.round(sourceSize * 0.32);
  ctx.fillRect(pad, ruleY, ruleW, 1);
  const source = sourceTitle || '竹林博客';
  const sourceText = source.length > 30 ? source.slice(0, 29) + '…' : source;
  ctx.fillText(sourceText, pad + ruleW + Math.round(sourceSize * 0.7), sourceY);
  const footer = (opts?.footer ?? '竹林修仙传 · 读书札记').trim();
  if (footer) {
    ctx.fillStyle = INK_SOFT;
    ctx.font = serif(400, footerSize);
    // 页脚居中，左右各延伸一条极细线到内容区边缘（「—— 文案 ——」的信笺落款样式）
    const textW = ctx.measureText(footer).width;
    const gap = Math.round(footerSize * 0.9);
    const lineStart = (w - textW) / 2 - gap;
    const lineEnd = (w + textW) / 2 + gap;
    const lineY = footerY - Math.round(footerSize * 0.34);
    ctx.fillStyle = 'rgba(91,87,78,0.28)';   // 淡墨，低于文字对比度
    if (lineStart > pad) ctx.fillRect(pad, lineY, lineStart - pad, 1);
    if (lineEnd < w - pad) ctx.fillRect(lineEnd, lineY, (w - pad) - lineEnd, 1);
    ctx.fillStyle = INK_SOFT;
    ctx.textAlign = 'center';
    ctx.fillText(footer, w / 2, footerY);
    ctx.textAlign = 'left';
  }

  const url = canvas.toDataURL('image/png');
  const comma = url.indexOf(',');
  if (comma < 0 || !url.startsWith('data:image/png')) throw new Error('PNG 生成失败');
  return { base64: url.slice(comma + 1), width: w, height: h };
}
