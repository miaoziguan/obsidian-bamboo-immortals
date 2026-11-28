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
  const natural = widths.reduce((a, b) => a + b, 0);
  const squeeze: FlexInfo['squeeze'] = [];
  const stretch: FlexInfo['stretch'] = [];
  for (let i = 0; i < chars.length - 1; i++) {
    const a = chars[i], b = chars[i + 1];
    // 中西边界（汉字紧邻 ASCII 字母/数字）可压缩约 1/4 字宽
    const cjkMix = (isCjk(a) && isAscii(b) && !isSpace(b)) || (isAscii(a) && !isSpace(a) && isCjk(b));
    if (cjkMix) {
      squeeze.push({ at: 3, max: Math.min(widths[i], widths[i + 1]) * 0.25 });
      stretch.push({ at: 2, weight: 0.5 });
    }
    // 西文词距（两侧都是 ASCII 且一侧是空格）
    if (isAscii(a) && isAscii(b) && (isSpace(a) || isSpace(b))) {
      squeeze.push({ at: 2, max: widths[i] * 0.5 });
      stretch.push({ at: 1, weight: 0.7 });
    }
    // 标点空隙：压缩上限约半个字宽，拉伸权重小
    const p = Math.min(priority(a), priority(b));
    if (p <= 6) {
      const unit = Math.max(widths[i], widths[i + 1], ctx.measureText('字').width);
      squeeze.push({ at: p, max: unit * 0.5 });
      stretch.push({ at: 4, weight: 0.25 });
    }
    // 汉字间：最后手段，压缩上限很小（字格不能被打散）
    if (isCjk(a) && isCjk(b)) {
      squeeze.push({ at: 7, max: ctx.measureText('字').width * 0.08 });
      stretch.push({ at: 7, weight: 1 });
    }
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
function allocateStretch(info: FlexInfo, extra: number): number[] {
  const adds: number[] = new Array<number>(info.stretch.length).fill(0);
  const levels = [...new Set(info.stretch.map((s) => s.at))].sort((a, b) => a - b);
  let left = extra;
  for (const lv of levels) {
    const idx = info.stretch.map((s, i) => s.at === lv ? i : -1).filter((i) => i >= 0);
    const totalW = idx.reduce((sum, i) => sum + info.stretch[i].weight, 0);
    if (totalW <= 0) continue;
    // 该级每单位权重分到的量；同级均匀，不做「优先某个标点」
    const per = left / totalW;
    for (const i of idx) adds[i] = per * info.stretch[i].weight;
    left = 0; // 全部间隙都参与，一次分完
    break;    // 只动最低一级，避免同时拉多处导致灰度不均
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

  const chars = Array.from(text);
  const lines: string[] = [];
  let line: string[] = [];

  /** 自然宽度（行末句读按半字宽计） */
  const natural = (arr: string[]): number => {
    if (!arr.length) return 0;
    let w = arr.reduce((sum, c) => sum + chWidth(ctx, c), 0);
    const last = arr[arr.length - 1];
    if (HALF_AT_LINE_END.has(last)) w -= chWidth(ctx, last) * 0.5;
    return w;
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const trial = [...line, ch];
    if (natural(trial) <= lineWidth) { line = trial; continue; }

    /* 超宽：断行。关键原则 —— 每一行都严格不超过 lineWidth，
       避头尾只调整「断点在哪」，绝不压缩字距硬塞。
       因为 drawTypesetLine 会对自然宽度不足的行做拉伸，若折行时压缩过，
       绘制端会按未压缩的宽度重新算 pen，导致字符重叠（实测「未」被画成「朱」）。 */
    let cutAt = line.length;
    // ① 行尾禁则：开引号/开括号不能留在行尾，往前挪一位断点
    while (cutAt > 1 && NO_LINE_END.has(line[cutAt - 1])) cutAt--;
    // ② 行首禁则：新行第一个字符若是禁则标点，把断点往前挪一位，让它留在上一行
    while (cutAt > 1 && (NO_LINE_START.has(line[cutAt]) || NO_LINE_START.has(ch))) {
      cutAt--;
      if (!NO_LINE_START.has(ch)) break; // ch 是下一行的第一个字时无需再挪
    }
    // ③ 闭合标点跟着前一个字：若断在闭合标点前，往前挪一位让它留在上一行
    while (cutAt > 1 && CLOSING.has(line[cutAt])) cutAt--;

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
  const chars = Array.from(line);
  if (!chars.length) return 0;
  const widths = chars.map((c) => chWidth(ctx, c));

  if (!justify || chars.length <= 1) {
    let pen = x;
    for (let i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i], pen, y);
      pen += widths[i];
    }
    return pen - x;
  }

  const info = flexInfo(ctx, chars, lineWidth);
  const extra = lineWidth - info.natural;
  if (Math.abs(extra) <= 0.5) {
    let pen = x;
    for (let i = 0; i < chars.length; i++) { ctx.fillText(chars[i], pen, y); pen += widths[i]; }
    return pen - x;
  }

  // 负：按优先级压缩；正：按 W3C 优先级拉伸
  const deltas = extra < 0
    ? allocateSqueeze(info, -extra).map((v) => -v)
    : allocateStretch(info, extra);

  let pen = x;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], pen, y);
    if (i < chars.length - 1) pen += widths[i] + deltas[i];
  }
  // 行末句读半宽：把最后一个字符往回移半字宽（视觉上收进字格）
  const last = chars[chars.length - 1];
  const drawn = pen - x;
  if (HALF_AT_LINE_END.has(last)) return drawn - widths[widths.length - 1] * 0.5;
  return drawn;
}

/** 供测试：一行在给定宽度下的自然宽度（用于断言行宽整数倍） */
export { NO_LINE_START };
