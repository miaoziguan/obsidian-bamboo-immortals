/**
 * noteImport — 「从笔记导入画布」的预处理（纯函数，快照语义）
 *
 * 定位：**拍照，不是链接**。导入只读原笔记一次，之后画布与原笔记各走各的，
 * 不做重新导入 / 覆盖 / 双向同步。所以这里只解决「splitDraft 会认错的东西」。
 *
 * splitDraft 只认 GFM 结构，真实笔记里三类内容会被它认错：
 *   1. 开头的 frontmatter（`---` 包裹的 yaml）—— 会被当分隔线/段落；
 *   2. 内联 HTML（`<u>` / `<span style>` / `<center>`）—— 投影层不认，会变字面量；
 *   3. 超长正文 —— 几百张卡会把画布撑爆，需要按块边界截断。
 */

/** 导入字数上限：约 120 张卡，超过按块边界截断（提示用户） */
const MAX_IMPORT_CHARS = 60000;

/**
 * 剥文件**开头**的 frontmatter（要求闭合）。正文中间的 `---` 一律不动 ——
 * 它可能是分隔线、表格分隔行或 setext 标题下划线，误删会改变正文语义。
 * @returns {{ body: string, frontmatter: string }}
 */
function stripFrontmatter(md) {
  const s = String(md == null ? '' : md).replace(/^\uFEFF/, '');
  if (!s.startsWith('---')) return { body: s, frontmatter: '' };
  const m = s.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return { body: s, frontmatter: '' };   // 没闭合：不猜，原样返回
  return { body: s.slice(m[0].length), frontmatter: m[1] };
}

/** 单行内的 HTML 剥离：`<br>` → 换行，其余标签去掉；行内代码里的内容用占位符保护。 */
function stripHtmlInLine(line) {
  const codes = [];
  const masked = String(line).replace(/`[^`]*`/g, (m) => {
    codes.push(m);
    return '\u0001' + (codes.length - 1) + '\u0001';
  });
  const cleaned = masked
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]{1,200}>/g, '');
  return cleaned.replace(/\u0001(\d+)\u0001/g, (_, i) => codes[Number(i)]);
}

/**
 * 剥掉不认识的 HTML 标签，保留文字。围栏代码块（``` / ~~~）内原样保留 ——
 * 代码里的 `<div>` 是真内容，删了就坏。
 */
function stripInlineHtml(md) {
  const lines = String(md == null ? '' : md).split('\n');
  let fence = false;
  const out = lines.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; return line; }
    if (fence) return line;
    return stripHtmlInLine(line);
  });
  return out.join('\n');
}

/**
 * 超长截断：在 max 附近回退到最近的空行（块边界），不在句子中间切。
 * @returns {{ text: string, truncated: boolean }}
 */
function clampImport(md, max = MAX_IMPORT_CHARS) {
  const s = String(md == null ? '' : md);
  const limit = Number(max) > 0 ? Number(max) : MAX_IMPORT_CHARS;
  if (s.length <= limit) return { text: s, truncated: false };
  const slice = s.slice(0, limit);
  const cut = slice.lastIndexOf('\n\n');
  return { text: cut > limit * 0.6 ? slice.slice(0, cut) : slice, truncated: true };
}

/** 一次性预处理：剥 frontmatter → 剥内联 HTML → 截断。返回可直接交给 splitDraft 的 md。 */
export function prepareImport(raw) {
  const { body, frontmatter } = stripFrontmatter(raw);
  const cleaned = stripInlineHtml(body);
  const { text, truncated } = clampImport(cleaned);
  return {
    text,
    truncated,
    hadFrontmatter: !!frontmatter,
    frontmatter,
  };
}
