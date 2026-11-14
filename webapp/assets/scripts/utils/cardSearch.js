/**
 * cardSearch — 卡片模糊跳转的匹配与排序（纯函数，无 DOM）
 *
 * 定位：**跳转式查找**，不是全文替换。只回答「哪张卡里有这句话」，
 * 不写模型、不提供替换入口 —— 所以它没有「批量改坏正文」的风险。
 *
 * 为什么自己实现而不用 Obsidian 的 prepareFuzzySearch：
 *   那是宿主侧同步函数，webapp 在 data: iframe 里只能过桥拿，每次输入都要异步往返；
 *   而卡片规模是几十到几百，子序列扫描本身是微秒级，同步实现反而没有竞态、没有延迟。
 */

/** 词首字符：命中这些字符后面的一位给加分（中英文标点都算）。 */
const WORD_BREAK = /[\s，。；：、,.;:!?！？（）()\[\]【】<>《》"'“”‘’\-—/\\|]/;

/**
 * 子序列模糊匹配打分。
 *  - 0  = 不匹配
 *  - ≥1 = 匹配；连续命中 +3、词首命中 +4、其余 +1
 * 空查询返回 1（全部通过，由调用方按 seq 排序）。
 * @param {string} text 卡片正文
 * @param {string} query 用户输入
 * @returns {number}
 */
function fuzzyScore(text, query) {
  const t = String(text == null ? '' : text).toLowerCase();
  const q = String(query == null ? '' : query).toLowerCase().trim();
  if (!q) return 1;
  if (!t) return 0;

  let score = 0;
  let cursor = 0;
  let prevAt = -2;
  for (let i = 0; i < q.length; i += 1) {
    const ch = q.charAt(i);
    if (ch === ' ') continue;                 // 空格只当分隔，不参与匹配
    const at = t.indexOf(ch, cursor);
    if (at < 0) return 0;                     // 有一个字符找不到 → 整条不匹配
    score += 1;
    if (at === prevAt + 1) score += 3;        // 连续命中，比散落命中更像「同一句话」
    if (at === 0 || WORD_BREAK.test(t.charAt(at - 1))) score += 4;   // 词首命中
    prevAt = at;
    cursor = at + 1;
  }
  return score;
}

/**
 * 按匹配度排序卡片；同分按文章顺序（seq）。
 * @param {Array} notes 卡片模型（读 text / seq / level）
 * @param {string} query
 * @param {number} limit 最多返回几条
 * @returns {Array<{ note: object, score: number, hit: number }>}
 *          hit = 连续子串首次出现位置（-1 表示仅有模糊命中，UI 可据此决定是否高亮片段）
 */
export function rankNotes(notes, query, limit = 10) {
  const list = (Array.isArray(notes) ? notes : []).filter((n) => n && n.id);
  const q = String(query == null ? '' : query).trim();
  const max = Number.isFinite(limit) && limit > 0 ? limit : 10;
  const bySeq = (a, b) => (Number(a.seq) || 0) - (Number(b.seq) || 0);

  if (!q) {
    return list.slice().sort(bySeq).slice(0, max)
      .map((note) => ({ note, score: 1, hit: -1 }));
  }

  const out = [];
  list.forEach((note) => {
    const text = String(note.text || '');
    const score = fuzzyScore(text, q);
    if (!score) return;
    out.push({ note, score, hit: text.toLowerCase().indexOf(q.toLowerCase()) });
  });
  out.sort((a, b) => (b.score - a.score) || bySeq(a.note, b.note));
  return out.slice(0, max);
}

/** 结果摘要：把命中的连续片段前后截断，避免长卡片占满列表。 */
export function excerpt(text, hit, query, span = 42) {
  const s = String(text == null ? '' : text);
  if (!s) return '';
  const q = String(query == null ? '' : query).trim();
  if (hit < 0 || !q) return s.slice(0, span * 2).replace(/\s+/g, ' ');
  const start = Math.max(0, hit - Math.floor((span - q.length) / 2));
  const end = Math.min(s.length, start + span + q.length);
  return (start > 0 ? '…' : '') + s.slice(start, end).replace(/\s+/g, ' ') + (end < s.length ? '…' : '');
}
