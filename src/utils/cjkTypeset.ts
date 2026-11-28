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
/** 行末可压到半宽的标点（GB/T 15834 5.1.10） */
const HALF_AT_LINE_END = new Set(['，', '。', '、', '；', '：', '！', '？', ',', '.', ';', ':', '!', '?']);
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
 * 把文本切成「原子单元」：汉字/标点单字成元，连续 ASCII 字母数字
 * （英文单词、版本号、路径片段）整体成元。折行与绘制必须共用这套切分，
 * 否则两端 deltas 索引错位 → 字距异常（实测剪贴板与两者之间出现大空隙）。
 */
function toAtoms(text: string): string[] {
  const raw = Array.from(text);
  const atoms: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (/[A-Za-z0-9]/.test(c)) {
      let word = c;
      while (i + 1 < raw.length && /[A-Za-z0-9._/<>-]/.test(raw[i + 1])) word += raw[++i];
      atoms.push(word);
    } else {
      atoms.push(c);
    }
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

/** 按优先级分配压缩量，返回每个间隙实际扣掉多少 */
function allocateSqueeze(info: FlexInfo, need: number): number[] {
  const cuts: number[] = new Array<number>(info.squeeze.length).fill(0);
  let left = need;
  const levels = [...new Set(info.squeeze.map((s) => s.at))].sort((a, b) => a - b);
  for (const lv of levels) {
    const idx = info.squeeze.map((s, i) => s.at === lv ? i : -1).filter((i) => i >= 0);
    const total = idx.reduce((sum, i) => sum + info.squeeze[i].max, 0);
    if (total <= 0) continue;
    const take = Math.min(left, total);
    const ratio = take / total;
    for (const i of idx) cuts[i] = info.squeeze[i].max * ratio;
    left -= take;
    if (left <= 0.01) break;
  }
  return cuts;
}

/** 按优先级分配拉伸量，返回每个间隙加多少（W3C：同时、同等量处理同级） */
function allocateStretch(info: FlexInfo, extra: number, hanWidth = 0): number[] {
  const adds: number[] = new Array<number>(info.stretch.length).fill(0);
  const levels = [...new Set(info.stretch.map((s) => s.at))].sort((a, b) => a - b);
  let left = extra;
  // 单个间隙的拉伸上限：字宽的 15%。超过就递进到下一优先级，
  // 避免单个西文词距吸收全部 extra 被撑成大洞。
  const cap = Math.max(1, hanWidth * 0.15);
  for (const lv of levels) {
    const idx = info.stretch.map((s, i) => s.at === lv ? i : -1).filter((i) => i >= 0);
    const totalW = idx.reduce((sum, i) => sum + info.stretch[i].weight, 0);
    if (totalW <= 0) continue;
    const per = left / totalW;
    let absorbed = 0;
    for (const i of idx) {
      const add = Math.min(per * info.stretch[i].weight, cap);
      adds[i] = add;
      absorbed += add;
    }
    left -= absorbed;
    if (left <= 0.5) break;
  }
  return adds;
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
  const lineWidth = cols * unit;

  // 预切成原子单元（英文单词整体），折行只发生在单元之间
  const atoms = toAtoms(text);

  const lines: string[] = [];
  let line: string[] = [];

  /** 自然宽度（行末句读按半字宽计） */
  const natural = (arr: string[]): number => {
    if (!arr.length) return 0;
    let w = arr.reduce((sum, c) => sum + chWidth(ctx, c), 0);
    const last = arr[arr.length - 1];
    const lastCh = last.length ? Array.from(last).pop() as string : '';
    if (HALF_AT_LINE_END.has(lastCh)) w -= chWidth(ctx, lastCh) * 0.5;
    return w;
  };

  for (let i = 0; i < atoms.length; i++) {
    const ch = atoms[i];
    const trial = [...line, ch];
    if (natural(trial) <= lineWidth) { line = trial; continue; }

    /* 超宽：断行。关键原则 —— 每一行都严格不超过 lineWidth，
       避头尾只调整「断点在哪」，绝不压缩字距硬塞。
       因为 drawTypesetLine 会对自然宽度不足的行做拉伸，若折行时压缩过，
       绘制端会按未压缩的宽度重新算 pen，导致字符重叠（实测「未」被画成「朱」）。 */
    // 取单元的首/末字符（单元可能是整个英文单词）
    const headOf = (u: string | undefined): string => u ? Array.from(u)[0] : '';
    const tailOf = (u: string | undefined): string => u ? Array.from(u).pop() as string : '';
    let cutAt = line.length;
    // ① 行尾禁则：开引号/开括号不能留在行尾，往前挪一位断点
    while (cutAt > 1 && NO_LINE_END.has(tailOf(line[cutAt - 1]))) cutAt--;
    // ② 行首禁则：新行第一个字符若是禁则标点，把断点往前挪一位，让它留在上一行
    //    注意 ch 可能是多字符英文单词，只看首字符；且必须是「标点单元」才推，避免
    //    把英文单词整块推来推去（旧逻辑会因 ch 首字符是禁则而一路 cutAt-- 到 1）。
    const chFirst = headOf(ch);
    while (cutAt > 1 && (NO_LINE_START.has(headOf(line[cutAt])) || NO_LINE_START.has(chFirst))) {
      cutAt--;
      if (!NO_LINE_START.has(chFirst)) break;
    }
    // ③ 闭合标点跟着前一个字：若断在闭合标点前，往前挪一位让它留在上一行
    while (cutAt > 1 && CLOSING.has(headOf(line[cutAt]))) cutAt--;

    const head = line.slice(0, cutAt);
    const tail = line.slice(cutAt).concat(ch);
    if (head.length) lines.push(head.join(''));
    line = tail;

    // 安全兜底：若 tail 仍超宽（极长字符），强制一个字一行，避免死循环
    while (line.length > 1 && natural(line) > lineWidth) {
      const one = line.shift() as string;
      lines.push(one);
    }
  }
  if (line.length) lines.push(line.join(''));

  // 孤行合并：末行只剩 1~2 字时并回上一行（自然宽度允许才合并）
  if (lines.length >= 2 && Array.from(lines[lines.length - 1]).length <= 2) {
    const last = lines.pop() as string;
    const prev = lines[lines.length - 1];
    if (natural(Array.from(prev + last)) <= lineWidth) lines[lines.length - 1] = prev + last;
    else lines.push(last);
  }
  return lines;
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
  const lineWidth = cols * unit;
  const atoms = toAtoms(line);
  if (!atoms.length) return 0;
  const widths = atoms.map((c) => chWidth(ctx, c));

  if (!justify || atoms.length <= 1) {
    let pen = x;
    for (let i = 0; i < atoms.length; i++) {
      ctx.fillText(atoms[i], pen, y);
      pen += widths[i];
    }
    return pen - x;
  }

  const info = flexInfo(ctx, atoms, lineWidth);
  const extra = lineWidth - info.natural;
  if (Math.abs(extra) <= 0.5) {
    let pen = x;
    for (let i = 0; i < atoms.length; i++) { ctx.fillText(atoms[i], pen, y); pen += widths[i]; }
    return pen - x;
  }

  // 负：按优先级压缩；正：按 W3C 优先级拉伸
  const deltas = extra < 0
    ? allocateSqueeze(info, -extra).map((v) => -v)
    : allocateStretch(info, extra, unit);

  let pen = x;
  for (let i = 0; i < atoms.length; i++) {
    ctx.fillText(atoms[i], pen, y);
    if (i < atoms.length - 1) pen += widths[i] + deltas[i];
  }
  // 行末句读半宽：把最后一个原子末字往回移半字宽（视觉上收进字格）
  const lastAtom = atoms[atoms.length - 1];
  const lastCh = Array.from(lastAtom).pop() as string;
  const drawn = pen - x;
  if (HALF_AT_LINE_END.has(lastCh)) return drawn - widths[widths.length - 1] * 0.5;
  return drawn;
}

/** 供测试：一行在给定宽度下的自然宽度（用于断言行宽整数倍） */
export { NO_LINE_START };
