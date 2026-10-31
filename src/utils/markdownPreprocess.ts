/**
 * 博客阅读器的 Markdown 预处理：只在「可见正文」的中英交界插入窄空格（\u2009）。
 *
 * 【为什么必须保护语法片段】
 * 窄空格插入是纯文本替换，它不认识 Markdown 语法。早先只保护了代码块与行内代码，
 * 于是这些也被插了空格，直接改变语义：
 *   ![[AI笔记]]        → ![[AI 笔记]]        文件名变了 → 嵌入找不到文件，显示空白
 *   ![[2024总结]]      → ![[2024 总结]]      同上
 *   ![[AI笔记#第二节]]  → ![[AI 笔记 # 第二节]] 文件名 + 锚点双破坏
 *   <iframe src="...中文...">  → src 被改写 → 资源加载失败
 * 故 wikilink / markdown 链接 / 裸 HTML 标签都与代码块同等对待：整体占位，最后还原。
 *
 * 【保护顺序】代码块 → 行内代码 → wikilink → 链接 → HTML 标签。
 * 代码块必须最先，否则块内的 `<` `>` `[[` 会被后续规则误吞。
 */

const NARROW = String.fromCharCode(0x2009);

export function preprocessMarkdown(md: string): string {
  const keep: string[] = [];
  const stash = (m: string): string => {
    keep.push(m);
    return '\x00K' + (keep.length - 1) + '\x00';
  };

  let processed = md
    .replace(/```[\s\S]*?```/g, stash)          // 围栏代码块（内部可能含 < > [ ] #）
    .replace(/`[^`]*`/g, stash)                 // 行内代码
    .replace(/!?\[\[[^\]]*\]\]/g, stash)        // wikilink / 嵌入 ![[文件#标题]]
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, stash)   // markdown 链接 / 图片（URL 内可能有中文）
    .replace(/<[^>]+>/g, stash);                // 裸 HTML 标签（iframe / video 的 src 与属性）

  const cjk = '[一-鿿]';
  const latin = '[a-zA-Z0-9@&%$#]';
  processed = processed
    .replace(new RegExp('(' + cjk + ')(' + latin + ')', 'g'), '$1' + NARROW + '$2')
    .replace(new RegExp('(' + latin + ')(' + cjk + ')', 'g'), '$1' + NARROW + '$2');

  // eslint-disable-next-line no-control-regex -- \x00 为有意占位符分隔符
  return processed.replace(/\x00K(\d+)\x00/g, (_, i) => keep[+i] || '');
}
