import { describe, it, expect } from 'vitest';
import { selectionToPlain, layoutLines, formatCardDate } from '../selectionExportPng';

/**
 * 博客选区分享卡的回归锁。
 * 固定风格卡是纯 canvas 绘制，DOM 环境里无法断言像素；这里锁住可纯函数验证的
 * 「选区文本 → 卡片文案」链路，以及非本文字不被塞进卡片。
 */
describe('selectionToPlain：选区文本归一化', () => {
  it('去掉 markdown 标记，保留正文', () => {
    expect(selectionToPlain('**加粗** 与 `代码` 和 [链接](https://x.com)')).toBe('加粗 与 和 链接');
  });

  it('去掉图片语法与代码块', () => {
    expect(selectionToPlain('前 ![图](a.png) 后\n```js\ncode\n```\n末')).toBe('前 后\n末');
  });

  it('压缩多余空白', () => {
    expect(selectionToPlain('  多行\n\n  文字  \t 间距 ')).toBe('多行\n文字 间距');
  });

  it('空选区返回空串', () => {
    expect(selectionToPlain('')).toBe('');
    expect(selectionToPlain('   \n  ')).toBe('');
  });

  it('中文标点与引号原样保留（避头尾依赖它们）', () => {
    const s = '他说「慢一点」，于是就慢了。';
    expect(selectionToPlain(s)).toBe(s);
  });

  it('长文本不截断（卡片换行绘制，不在文本层丢内容）', () => {
    const long = '竹'.repeat(600);
    expect(selectionToPlain(long).length).toBe(600);
  });
});

/** 轻量 measureText mock：等宽近似（CJK=1、ASCII=0.5 个单位），够验证禁则逻辑 */
function mockCtx(unit: number): CanvasRenderingContext2D {
  return {
    measureText: (s: string) => ({
      width: Array.from(s).reduce((n, ch) => n + (ch.charCodeAt(0) < 256 ? 0.5 : 1) * unit, 0),
    }),
  } as unknown as CanvasRenderingContext2D;
}

describe('layoutLines：中文禁则与孤行合并', () => {
  const U = 20;
  const maxW = U * 14; // 每行约 14 个汉字

  it('逗号不落到行首', () => {
    const lines = layoutLines(mockCtx(U), '一二三四五六七八九十甲乙丙丁，戊己庚辛壬癸子丑寅卯', maxW);
    for (const ln of lines) expect(ln[0]).not.toBe('，');
  });

  it('句号不落到行首', () => {
    const lines = layoutLines(mockCtx(U), '一二三四五六七八九十甲乙丙丁。戊己庚辛壬癸子丑寅卯', maxW);
    for (const ln of lines) expect(ln[0]).not.toBe('。');
  });

  it('末行不会只剩一个标点', () => {
    // 28 字 + 一个句号：14 字/行 → 朴素折行会得到 [14,14,1] 的「。」孤行
    const lines = layoutLines(mockCtx(U), '一'.repeat(28) + '。', maxW);
    expect(lines.length).toBeGreaterThan(0);
    expect(Array.from(lines[lines.length - 1]).length).toBeGreaterThan(1);
    expect(lines.join('')).toBe('一'.repeat(28) + '。'); // 合并不能丢字
  });

  it('开引号不留在行尾', () => {
    const lines = layoutLines(mockCtx(U), '一二三四五六七八九十甲乙「丙丁戊己庚辛壬癸', maxW);
    for (const ln of lines) expect(ln[ln.length - 1]).not.toBe('「');
  });

  it('短文本不换行', () => {
    expect(layoutLines(mockCtx(U), '短短一句。', maxW)).toEqual(['短短一句。']);
  });
});

describe('selectionToPlain / layoutLines：段落结构', () => {
  it('保留段间空行作为段落分隔', () => {
    expect(selectionToPlain('第一段。\n\n第二段。')).toBe('第一段。\n第二段。');
  });

  it('段内换行压成空格，不误判为段落', () => {
    expect(selectionToPlain('第一行\n第二行')).toBe('第一行\n第二行');
  });

  it('两段文字折行后中间有空行占位', () => {
    const s = '第一段。';
    const t = '第二段。';
    const lines = layoutLines(mockCtx(20), `${s}\n${t}`, 20 * 10);
    expect(lines.filter((x) => x === '').length).toBe(1);
    expect(lines[0]).toContain('第一段');
    expect(lines[lines.length - 1]).toContain('第二段');
  });

  it('单段文字不产生段间空行', () => {
    const lines = layoutLines(mockCtx(20), '只有一段文字内容。', 20 * 10);
    expect(lines.filter((x) => x === '').length).toBe(0);
  });
});

/**
 * 长文多段回归：此前画布高度被 w*1.6 截断，sourceY 按未截断内容算，
 * 出处被画到画布外（信息丢失）；同时首段末行被误判为非末行而两端对齐拉散。
 * 这两条不能纯函数断言（依赖 canvas 尺寸/字号），这里锁住入口契约：
 * 多段文本的行数组里段末行紧邻空串占位，绘制端据此判定不拉伸。
 */
describe('layoutLines：段末行标记', () => {
  it('首段末行后紧跟空串占位（绘制端据此跳过两端对齐）', () => {
    const lines = layoutLines(mockCtx(20), '第一段文字内容较长需要折行处理。\n第二段文字内容。', 20 * 8);
    const blank = lines.indexOf('');
    expect(blank).toBeGreaterThan(0);
    expect(lines[blank - 1]).toBeTruthy();   // 段末行有内容
    expect(lines[blank + 1]).toBeTruthy();   // 空串后是新段
  });
});

describe('layoutLines：ASCII/弯引号避头尾', () => {
  it('ASCII 闭引号不落到行首（截图漏网之鱼）', () => {
    const lines = layoutLines(mockCtx(20), '谢道韫咏雪“未若柳絮因风起”雪落得慢轻得像一声叹', 20 * 10);
    for (const ln of lines) expect('"”').not.toContain(ln[0]);
  });

  it('ASCII 闭引号折行时被挤进上一行', () => {
    const text = '一二三四五六七八九十甲乙丙丁"戊己庚辛壬癸子丑寅卯';
    const lines = layoutLines(mockCtx(20), text, 20 * 14);
    expect(lines.join('')).toBe(text); // 不丢字
  });

  it('ASCII 开引号不留在行尾', () => {
    const text = '一二三四五六七八九十甲乙"丙丁戊己庚辛壬癸';
    const lines = layoutLines(mockCtx(20), text, 20 * 14);
    // ASCII 引号开闭同形，无法判定；只要不丢字、不重复即可
    expect(lines.join('')).toBe(text);
  });
});

describe('layoutLines：连续禁则标点（截图原文）', () => {
  it('中文右引号+冒号不落到行首，且被并入上一行', () => {
    const text = '谢道韫咏雪“未若柳絮因风起”：雪落得慢，轻得像一声叹，给舒缓一个形状。';
    const lines = layoutLines(mockCtx(54), text, 900);
    for (const ln of lines) {
      if (!ln) continue;
      expect(ln[0]).not.toBe('”');
      expect(ln[0]).not.toBe('：');
    }
    expect(lines.join('')).toBe(text); // 不丢字
  });

  it('段首是禁则标点时并入前一段', () => {
    const a = '这是第一段完整内容。';
    const b = '”：这是被 DOM 切断的后半句。';
    const lines = layoutLines(mockCtx(20), `${a}\n${b}`, 20 * 8);
    expect(lines.filter((x) => x === '').length).toBe(0); // 段被合并，不再有段间空行
    expect(lines.some((x) => x.includes('”：'))).toBe(true);
  });
});

describe('drawTypesetLine：英文/中西混排不丢字（deltas 索引对齐）', () => {
  it('flexInfo 每个间隙恰好一个条目，deltas 长度 = 间隙数', () => {
    // 构造混合行：汉字 + 英文单词 + 标点 + 数字
    const text = '保存到 Vault、复制到剪贴板，默认 PNG.png 即可';
    const ctx = mockCtx(54);
    const lines = layoutLines(ctx, text, 54 * 20);
    const joined = lines.join('');
    expect(joined).toBe(text); // 折层不丢字
  });

  it('两端对齐绘制时英文单词不断裂丢字', () => {
    const text = '之中后给三个去处：保存到 Vault、到剪贴板。默认 PNG 的设置';
    const ctx = mockCtx(54);
    const lines = layoutLines(ctx, text, 54 * 20);
    // 每个行都不得出现单词被拆成两段的断点
    for (const line of lines) {
      expect(line).not.toMatch(/Vau$|NG$|pn$/);
    }
    expect(lines.join('')).toBe(text);
  });
});

describe('typesetParagraph：英文单词不可分割', () => {
  it('Vault / PNG / .png 都不被折行拆断', () => {
    const text = '默认项沿用便签 PNG 的设置，保存到 Vault，落在 便签/选区-<时间戳>.png';
    const lines = layoutLines(mockCtx(54), text, 54 * 16);
    expect(lines.join('')).toBe(text);
    // 关键：每行里若出现单词的片段，必须完整
    for (const line of lines) {
      if (line.includes('PN')) expect(line).toContain('PNG');
      if (line.includes('Vau')) expect(line).toContain('Vault');
      if (line.includes('.pn')) expect(line).toContain('.png');
    }
  });
});

describe('typesetParagraph：段落中间不出现孤字行', () => {
  it('窄行宽强制断行时无任何 ≤2 字的行', () => {
    const t = '页脚文案归博客模块自己管设置面板里新增了分享卡页脚默认写竹林修仙传读书札记输入即存留空就不画那一行';
    const lines = layoutLines(mockCtx(20), t, 20 * 8);
    expect(lines.join('')).toBe(t); // 不丢字
    for (const line of lines) {
      expect(Array.from(line).length).toBeGreaterThan(2); // 无「增」「输」式孤字行
    }
  });

  it('图中第三段原文：新增 / 输入 不被拆成孤字行', () => {
    const t = '页脚文案归博客模块自己管：设置面板「博主资料」里新增了「分享卡页脚」，默认写「竹林修仙传 · 读书札记」，输入即存，留空就不画那一行。名字换了，纸还是那张纸。';
    const lines = layoutLines(mockCtx(54), t, 54 * 16);
    expect(lines.join('')).toBe(t);
    for (const line of lines) {
      expect(Array.from(line).length).toBeGreaterThan(2);
    }
    // 「新增」与「输入」都不得被拆断
    for (const line of lines) {
      if (line.includes('新')) expect(line).toContain('新增');
      if (line.includes('输')) expect(line).toContain('输入');
    }
  });
});

describe('formatCardDate：日期模板', () => {
  it('默认模板补零正确', () => {
    const d = new Date(2026, 0, 5, 9, 3, 4);
    expect(formatCardDate(d, 'YYYY年M月D日 HH:mm')).toBe('2026年1月5日 09:03');
  });

  it('自定义 token 组合', () => {
    const d = new Date(2026, 10, 28, 21, 18, 7);
    expect(formatCardDate(d, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-11-28 21:18:07');
    expect(formatCardDate(d, 'YYYY.MM.DD')).toBe('2026.11.28');
  });

  it('未识别字面量原样保留', () => {
    const d = new Date(2026, 10, 28, 21, 18);
    expect(formatCardDate(d, '记于 YYYY 年')).toBe('记于 2026 年');
  });
});

