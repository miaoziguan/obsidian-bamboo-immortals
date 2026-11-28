/**
 * 中文文章中混入西文标点的语境化归一（展示层修正，绝不改原文）。
 *
 * 依据：GB/T 15834-2011 中文出版物用全角标点；W3C CLREQ「按语言语境决定标点形式」。
 * 原则：
 *   ① 中文语境（标点紧邻汉字）的西文标点 → 转对应全角；
 *   ② 西文语境（两侧 ASCII 字母/数字、URL、代码、邮箱）→ 一律保留；
 *   ③ 不确定的保留 —— 误转西文引文里的逗号比漏转中文语境的逗号更严重；
 *   ④ 只在导出的卡片文本里做，不改源文件。
 */

/** 安全的中文语境转换表（不含句号，句号有数字陷阱，单独处理） */
const CONVERT: Record<string, string> = {
  ',': '，', ':': '：', ';': '；', '!': '！', '?': '？',
  '(': '（', ')': '）', '[': '【', ']': '】',
};

function isCjk(ch: string | undefined): boolean {
  return !!ch && /[\u3400-\u9fff]/.test(ch);
}
function isAsciiWord(ch: string | undefined): boolean {
  return !!ch && /[A-Za-z0-9]/.test(ch);
}

/**
 * 从标点位置向一侧找最近的「有意义字符」（跳过 ASCII 词、数字、空格），
 * 用于判定语境：注意(x); 里的 ) 紧邻 x，但真正的语境是前面的汉字「意」。
 */
function nearestCjk(chars: string[], at: number, dir: -1 | 1): boolean {
  for (let i = at + dir; i >= 0 && i < chars.length; i += dir) {
    const c = chars[i];
    if (isCjk(c)) return true;
    // 穿过西文词/标点片段（用 includes 避免正则字符类里 [] 的转义陷阱）
    if (isAsciiWord(c) || c === ' ' || '.,:/@_()[];!?\'"'.includes(c)) continue;
    return false; // 遇到其他标点/符号，语境到此为止
  }
  return false;
}

export interface PunctResult {
  text: string;
  /** 转换处数（用于决定是否提示用户） */
  changes: number;
}

/**
 * 归一混排标点。
 * @param text 已做 markdown 清理的纯文本
 */
export function normalizeMixedPunctuation(text: string): PunctResult {
  if (!text) return { text, changes: 0 };
  const chars = Array.from(text);
  const out: string[] = [];
  let changes = 0;
  // 引号配对计数：中文语境内的 " 按「开、闭、开、闭」交替转换，
  // 不靠邻居猜（「他说"静"」两侧都是汉字，靠邻居无法判开闭）
  let dqOpen: boolean = false;
  let sqOpen: boolean = false;
  let dqWestern: boolean = false;
  let sqWestern: boolean = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const prev = chars[i - 1];
    const next = chars[i + 1];

    // ── 保护区：URL / 邮箱 / 数字 / ASCII 词内部 ──
    if (isAsciiWord(prev) && isAsciiWord(next)) {
      // 3.14 / v0.1.2 / a,b 之类，两侧都是词字符 → 保留
      out.push(ch);
      continue;
    }
    // URL / 邮箱：左邻是 ASCII 词且右侧是 / . @ : 等（或反过来）
    if ((isAsciiWord(prev) && /[/@:.]/.test(ch)) || (/[/@:.]/.test(ch) && isAsciiWord(next))) {
      out.push(ch);
      continue;
    }
    // 数字小数 / 千分位：两侧数字
    if (/\d/.test(prev || '') && /\d/.test(next || '')) {
      out.push(ch);
      continue;
    }

    // ── 引号：中文语境的 " / ' 按配对顺序转换 ──
    if (ch === '"' || ch === "'") {
      const isDq = ch === '"';
      // 西文引文判定：引号右侧紧跟 ASCII 字母（"The Zen..."），且不是中文语境的「写"静"」
      const opensWestern = isAsciiWord(next);
      const westernQuote = opensWestern || (isDq ? dqWestern : sqWestern);
      if (opensWestern && !isCjk(prev)) {
        if (isDq) dqWestern = true; else sqWestern = true;
      }
      if (westernQuote) {
        out.push(ch);
        if (isDq ? dqWestern : sqWestern) {
          // 闭引号：右侧不是 ASCII 词，结束西文引文模式
          if (!opensWestern) { if (isDq) dqWestern = false; else sqWestern = false; }
        }
        continue;
      }
      const cjk = nearestCjk(chars, i, -1) || nearestCjk(chars, i, 1);
      if (cjk) {
        const open: boolean = isDq ? !dqOpen : !sqOpen;
        out.push(isDq ? (open ? '“' : '”') : (open ? '‘' : '’'));
        if (isDq) dqOpen = open; else sqOpen = open;
        changes++;
      } else {
        out.push(ch);
      }
      continue;
    }

    // ── 通用安全转换：语境由最近的非西文字符决定 ──
    const target = CONVERT[ch];
    if (target) {
      if (nearestCjk(chars, i, -1) || nearestCjk(chars, i, 1)) { out.push(target); changes++; }
      else out.push(ch);
      continue;
    }

    // ── 句号：中文语境、且不与数字/ASCII 词相邻 ──
    if (ch === '.' && (nearestCjk(chars, i, -1) || nearestCjk(chars, i, 1)) &&
        !isAsciiWord(prev) && !isAsciiWord(next)) {
      out.push('。'); changes++; continue;
    }

    // 西文空格紧邻汉字 → 去掉（中文不用词间空格）
    if (ch === ' ' && (isCjk(prev) && isCjk(next))) {
      // 已经是单空格且两侧汉字，留着也无妨；此处不动，避免误删有意分隔
    }

    out.push(ch);
  }

  return { text: out.join(''), changes };
}

/** 供测试/UI：是否值得提示用户（转换处达到阈值） */
export function shouldNotifyPunct(changes: number): boolean {
  return changes >= 3;
}
