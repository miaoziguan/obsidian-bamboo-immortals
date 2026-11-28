/**
 * 中文排版引擎（行业做法，零依赖）。
 *
 * 依据：
 *  - GB/T 15834-2011《标点符号用法》5.1：行首行尾禁则、行末标点半字宽
 *  - W3C CLREQ（中文排版需求）：两端对齐的伸缩优先级
 *  - Type is Beautiful（Eric Liu）：行宽取字号整数倍、字格不被打散
 *  - InDesign / 方正：避头尾优先「挤进」（压标点空隙）而非「推出」（均摊字距）
 *
 * 核心原则：两端对齐的美感不在「把每行拉齐」，而在「每行字距尽量恒定」。
 * 因此伸缩顺序是：中西间距 → 词距 → 标点空隙 → 最后才均分字距。
 */

/* ── 标点分类（决定禁则与挤压优先级） ── */

/** 行首禁则：不能出现在行首 */
const NO_LINE_START = new Set([
  '，', '。', '、', '；', '：', '！', '？', '…', '—',
  '」', '』', '”', '’', '）', '】', '〉', '》', '％', '‰', '℃',
  ',', '.', ';', ':', '!', '?', ')', ']', '}', '%',
  '"', "'",
]);
/** 行尾禁则：不能出现在行尾（仅明确的开引号/开括号） */
const NO_LINE_END = new Set([
  '「', '『', '“', '（', '【', '〈', '《',
  '(', '[', '{',
]);
/** 挤进优先级：数值越小越先被压缩（W3C CLREQ / InDesign） */
const SQUEEZE_PRIORITY: Record<string, number> = {
  // 0: 行末句读压到半字宽（单独处理）
  // 1: 破折号/省略号（两字宽，优先压缩）
  '—': 1, '…': 1,
  // 2: 西文词距（单独处理）
  // 3: 中西间距（单独处理）
  // 4: 括号/引号
  '（': 4, '）': 4, '【': 4, '】': 4, '《': 4, '》': 4,
  '「': 4, '」': 4, '『': 4, '』': 4, '“': 4, '”': 4, '‘': 4, '’': 4,
  '(': 4, ')': 4, '[': 4, ']': 4, '{': 4, '}': 4,
  // 5: 顿号、逗号、分号、冒号
  '、': 5, '，': 5, '；': 5, '：': 5, ',': 5, ';': 5, ':': 5,
  // 6: 句号、问号、叹号
  '。': 6, '！': 6, '？': 6, '.': 6, '!': 6, '?': 6,
};
/** 闭合标点：与前一个字符构成一个整体，不分开断行 */
const CLOSING = new Set(['”', '’', '」', '』', '）', '】', '》', '〉', '"', "'", ')', ']', '}', '：', '：', '，', '。', '、', '；', '！', '？']);

function isAscii(ch: string): boolean { return ch.charCodeAt(0) < 128; }
function isSpace(ch: string): boolean { return ch === ' ' || ch === '\t'; }
function isCjk(ch: string): boolean { return /[\u3400-\u9fff]/.test(ch); }
function priority(ch: string): number { return SQUEEZE_PRIORITY[ch] ?? 7; } // 7 = 汉字，最后动

/** 用 measureText 量一个字符的原生宽度 */
function chWidth(ctx: CanvasRenderingContext2D, ch: string): number {
  return ctx.measureText(ch).width;
}

/**
 * 把文本切成「原子单元」——折行只能发生在单元之间。
 *
 * 用浏览器原生 Intl.Segmenter('zh-CN', {granularity:'word'}) 做中文分词，
 * 让「西文 / 引号 / 开括号 / 递出去」这类词不被从中间拆断；Segmenter 的词典
 * 不完整（「引号」常被切成「引|号」），故把连续单字 segment 合并成最多 3 字的块。
 * ASCII 词串（含 . / < > -）整体成元，标点单独成元。
 * 折行与绘制必须共用这套切分，否则 deltas 索引错位 → 字距异常。
 */
function toAtoms(text: string): string[] {
  /* 单字 atom：中文逐字成元，连续 ASCII 字母数字（含 . / < > -）整体成元。
     词级断行（Intl.Segmenter）曾试过，但粗粒度 atom 让行宽余量必然达到半字~一字，
     两端对齐时余量分到少量词间隙 → 字距拉散出大洞（实测「中文 里夹 西文」）。
     三者（词不拆断 / 行宽固定 / 两端对齐）不可兼得；优先保两端对齐与字距均匀，
     这是排版的基本原则。少量 2 字词跨行由读者自动连读，不构成阅读障碍。 */
  const atoms: string[] = [];
  const raw = Array.from(text);
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (/[A-Za-z0-9]/.test(c)) {
      let word = c;
      while (i + 1 < raw.length && /[A-Za-z0-9._/<>-]/.test(raw[i + 1])) word += raw[++i];
      atoms.push(word);
    } else atoms.push(c);
  }
  return atoms;
}

/**
 * 计算一行的「可压缩量」与「可拉伸量」。
 * 压缩时按优先级从低到高逐级吃进所需空间，每级内均匀分担。
 */
interface FlexInfo {
  natural: number;
  /** 每个间隙的 [优先级, 剩余可压缩宽度] */
  squeeze: Array<{ at: number; max: number }>;
  /** 每个间隙的 [优先级, 可拉伸权重] */
  stretch: Array<{ at: number; weight: number }>;
}

function flexInfo(ctx: CanvasRenderingContext2D, chars: string[], maxWidth: number): FlexInfo {
  const widths = chars.map((c) => chWidth(ctx, c));
  // chars 可能是 atom（多字符英文词），判定用单元首字符
  const firstOf = (u: string): string => Array.from(u)[0] || '';
  const natural = widths.reduce((a, b) => a + b, 0);
  const squeeze: FlexInfo['squeeze'] = [];
  const stretch: FlexInfo['stretch'] = [];
  const han = ctx.measureText('字').width;
  for (let i = 0; i < chars.length - 1; i++) {
    const a = firstOf(chars[i]), b = firstOf(chars[i + 1]);
    /*
     * 关键不变量：每个间隙【恰好一个】squeeze 和一个 stretch 条目，
     * 且顺序与间隙 i 一一对应。此前用多个独立 if，导致英文单词内部
     * （两侧 ASCII 且无空格）0 个条目、中西混合 2 个条目，deltas 数组
     * 与字符间隙错位 → pen 步进错乱 → 视觉上丢字（Vault→Vau、PNG→NG）。
     */
    const cjkMix = (isCjk(a) && isAscii(b) && !isSpace(b)) || (isAscii(a) && !isSpace(a) && isCjk(b));
    const wordSpace = isAscii(a) && isAscii(b) && (isSpace(a) || isSpace(b));
    const p = Math.min(priority(a), priority(b));

    // 压缩优先级（squeezeAt）与拉伸优先级（stretchAt）必须分开：
    // 压缩时先动标点（数字小）；但拉伸时标点绝不能优先——W3C CLREQ 的
    // 拉伸顺序是西文词距 → 中西间距 → 最后均分字距，标点不参与拉伸。
    // 此前复用同一 at 值，标点 at=4 < 汉字 at=7 被优先拉大，实测
    // 逗号周围出现巨大空隙。
    let squeezeAt: number, max: number, stretchAt: number, stretchW: number;
    if (wordSpace) {
      squeezeAt = 2; max = widths[i] * 0.5; stretchAt = 1; stretchW = 0.6;   // 西文词距
    } else if (p <= 6) {
      squeezeAt = p; max = Math.max(widths[i], widths[i + 1], han) * 0.5;
      stretchAt = 9; stretchW = 0;                                            // 标点：不拉伸
    } else if (cjkMix) {
      squeezeAt = 3; max = Math.min(widths[i], widths[i + 1]) * 0.25;
      stretchAt = 2; stretchW = 0.6;                                          // 中西间距
    } else if (isCjk(a) && isCjk(b)) {
      squeezeAt = 7; max = han * 0.08; stretchAt = 7; stretchW = 1;           // 汉字间
    } else {
      squeezeAt = 7; max = 0; stretchAt = 9; stretchW = 0;                    // 西文词内
    }
    squeeze.push({ at: squeezeAt, max });
    stretch.push({ at: stretchAt, weight: stretchW });
  }
  void maxWidth;
  return { natural, squeeze, stretch };
}

/**
 * 折行：行宽对齐字号整数倍 + 避头尾优先挤进。
 * @param ctx 已设置好 font 的测量上下文
 * @param text 单段文本
 * @param maxWidth 可用宽度（内部会对齐到字号整数倍）
 */
export function typesetParagraph(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const unit = ctx.measureText('字').width;
  const cols = Math.max(4, Math.floor(maxWidth / unit));
  const lineWidth = cols * unit; // 行宽取字号整数倍：每行恰好 N 个全角字，两端对齐天然成立

  // 预切成原子单元（英文单词整体），折行只发生在单元之间
  const atoms = toAtoms(text);
  const lines: string[][] = [];
  let line: string[] = [];

  /** 自然宽度（标点按全角计；此前为配合标点悬挂按半宽，悬挂撤销后改回全宽） */
  const natural = (arr: string[]): number =>
    arr.reduce((sum, c) => sum + chWidth(ctx, c), 0);
  /** 字符数（英文单词按 1 个视觉单元计，2 字以上才算短行） */
  const visualLen = (arr: string[]): number => arr.reduce((n, a) => n + (Array.from(a).length > 1 ? 2 : 1), 0);
  const headOf = (u: string | undefined): string => u ? Array.from(u)[0] : '';
  const tailOf = (u: string | undefined): string => u ? Array.from(u).pop() as string : '';

  // ── 第一遍：贪心折行 + 避头尾 ──
  for (let i = 0; i < atoms.length; i++) {
    const ch = atoms[i];
    const trial = [...line, ch];
    if (natural(trial) <= lineWidth) { line = trial; continue; }

    // atom 整体超宽（如长英文词）：整块移到下一行，不从中间切开
    if (natural([ch]) > lineWidth && line.length) {
      lines.push(line); line = [ch]; continue;
    }

    let cutAt = line.length;
    // ① 行尾禁则
    while (cutAt > 1 && NO_LINE_END.has(tailOf(line[cutAt - 1]))) cutAt--;
    // ② 行首禁则：新行首是禁则标点时，往前挪一位让它留在上一行；
    //    ch 本身是禁则标点时，把 line 末原子推到下一行与 ch 同行（避免孤标点）
    const chFirst = headOf(ch);
    while (cutAt > 1) {
      const nextFirst = cutAt < line.length ? headOf(line[cutAt]) : chFirst;
      if (NO_LINE_START.has(nextFirst)) cutAt--;
      else break;
    }
    // ③ 闭合标点跟着前一个字
    while (cutAt > 1 && CLOSING.has(headOf(line[cutAt]))) cutAt--;

    const head = line.slice(0, cutAt);
    const tail = line.slice(cutAt).concat(ch);
    // ASCII 引号 ' " 既可能开也可能闭，无法靠字符判定；保守起见：
    // 若它落在行尾，挪到下一行首（开引号留行尾是明确错误，闭引号挪走也不伤语义）
    while (head.length > 1 && /['"]$/.test(head[head.length - 1])) tail.unshift(head.pop() as string);
    if (head.length) lines.push(head);
    line = tail;

    // 安全兜底：tail 仍超宽，逐 atom 推出（不丢字）
    while (line.length > 1 && natural(line) > lineWidth) {
      lines.push([line.shift() as string]);
    }
  }
  if (line.length) lines.push(line);

  // ── 第二遍：孤字修复（段落中间任意行）──
  // 若某行只有 1~2 个视觉单元，从上一行末尾借 1~2 个 atom 过来，
  // 让两行都健康（借后上一行至少留 2 个单元）。
  for (let i = 1; i < lines.length; i++) {
    const cur = lines[i];
    if (visualLen(cur) > 2) continue;
    const prev = lines[i - 1];
    let borrowed = 0;
    while (visualLen(cur) < 3 && visualLen(prev) > 3 && borrowed < 3) {
      const atom = prev.pop() as string;
      cur.unshift(atom);
      borrowed++;
    }
    // 借字可能把开引号/开括号留在 prev 行尾 —— 从 cur 首部还一个原子给它吃完
    while (cur.length && prev.length && NO_LINE_END.has(tailOf(prev[prev.length - 1]))) {
      prev.push(cur.shift() as string);
    }
  }

  // ── 第三遍：合并相邻过短行（两行加起来不超宽就合并）──
  for (let i = lines.length - 1; i > 0; i--) {
    const cur = lines[i], prev = lines[i - 1];
    if (visualLen(cur) > 2 || natural([...prev, ...cur]) > lineWidth * 1.05) continue;
    if (natural([...prev, ...cur]) <= lineWidth) {
      lines[i - 1] = [...prev, ...cur];
      lines.splice(i, 1);
    }
  }

  // ── 第四遍：所有行的行尾禁则兜底 ──
  // 断行与借字都可能把开引号留在行尾；ASCII " / ' 无法判开闭，一律挪到下一行首。
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    while (ln.length > 1 && (NO_LINE_END.has(tailOf(ln[ln.length - 1])) || /['"]$/.test(ln[ln.length - 1]))) {
      const atom = ln.pop() as string;
      if (i + 1 < lines.length) lines[i + 1].unshift(atom);
      else lines.splice(i + 1, 0, [atom]); // 末行：新建一行承载该字符
    }
  }

  return lines.map((l) => l.join(''));
}

/**
 * 绘制一行：两端对齐（伸缩优先级）+ 行末标点半宽。
 * @returns 本行实际绘制宽度
 */
export function drawTypesetLine(
  ctx: CanvasRenderingContext2D, line: string, x: number, y: number, maxWidth: number,
  justify: boolean,
): number {
  const unit = ctx.measureText('字').width;
  const cols = Math.max(4, Math.floor(maxWidth / unit));
  const lineWidth = cols * unit; // 与折行端一致
  const atoms = toAtoms(line);
  if (!atoms.length) return 0;
  const widths = atoms.map((c) => chWidth(ctx, c));

  if (!justify || atoms.length <= 1) {
    let pen = x;
    for (let i = 0; i < atoms.length; i++) { ctx.fillText(atoms[i], pen, y); pen += widths[i]; }
    return pen - x;
  }

  const info = flexInfo(ctx, atoms, lineWidth);
  const extra = lineWidth - info.natural;
  if (Math.abs(extra) <= 0.5) {
    let pen = x;
    for (let i = 0; i < atoms.length; i++) { ctx.fillText(atoms[i], pen, y); pen += widths[i]; }
    return pen - x;
  }

  /* 两端对齐用「整行自动缩放」而非「往字距里塞像素」：
     scale = 行宽 / 自然宽度。字形等比放大，字距比例保持不变，
     不会出现「冒 号、引 号 换 成 全 角」那种大洞。
     单字断行 + 行宽取整下，scale 通常在 1.0~1.08（含半角字符的行），
     字形变化肉眼几乎不可见；压缩时 scale<1 同理。
     flexInfo 的优先级分配仍保留给未来的精细排版，但绘制端改走 scale。 */
  const scale = lineWidth / info.natural;
  ctx.save();
  ctx.translate(x, 0);
  ctx.scale(scale, 1);
  let pen = 0;
  for (let i = 0; i < atoms.length; i++) {
    ctx.fillText(atoms[i], pen, y);
    pen += widths[i];
  }
  ctx.restore();
  return pen * scale;
}

/** 供测试：一行在给定宽度下的自然宽度（用于断言行宽整数倍） */
export { NO_LINE_START };
