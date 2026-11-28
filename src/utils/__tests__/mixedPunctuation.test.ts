import { describe, it, expect } from 'vitest';
import { normalizeMixedPunctuation, shouldNotifyPunct } from '../mixedPunctuation';

describe('normalizeMixedPunctuation：中文语境转换', () => {
  it('中文句子里的西文标点转全角', () => {
    const r = normalizeMixedPunctuation('他说"好的",然后就走了:真的吗?');
    expect(r.text).toBe('他说“好的”，然后就走了：真的吗？');
    expect(r.changes).toBeGreaterThan(0);
  });

  it('中文语境的括号、分号、感叹号', () => {
    expect(normalizeMixedPunctuation('注意(x);别急!').text).toBe('注意（x）；别急！');
  });

  it('中文语境的句号', () => {
    expect(normalizeMixedPunctuation('这样就好.').text).toBe('这样就好。');
  });
});

describe('normalizeMixedPunctuation：西文语境保留', () => {
  it('西文引文原样保留，句末中文语境的句号仍按中文处理', () => {
    const r = normalizeMixedPunctuation('他引用了 "The Zen of Python" 中的原则.');
    expect(r.text).toContain('"The Zen of Python"');  // 西文引文引号不动
    expect(r.text.endsWith('原则。')).toBe(true);      // 中文句子的句号转全角
  });

  it('小数、版本号、千分位不转', () => {
    for (const s of ['价格是 3.14 美元', '版本 v0.1.2 已发布', '共 1,000 人']) {
      expect(normalizeMixedPunctuation(s).text).toBe(s);
    }
  });

  it('URL 与邮箱不转', () => {
    for (const s of ['访问 https://example.com/a,b 获取', '发到 a:b@example.com 即可']) {
      expect(normalizeMixedPunctuation(s).text).toBe(s);
    }
  });

  it('ASCII 词内部的标点不转', () => {
    expect(normalizeMixedPunctuation('if (x > 0) { go(); }').text).toBe('if (x > 0) { go(); }');
  });

  it('英文缩写 U.S.A. 不转', () => {
    expect(normalizeMixedPunctuation('他说 U.S.A. 很好').text).toBe('他说 U.S.A. 很好');
  });
});

describe('normalizeMixedPunctuation：混合与提示', () => {
  it('中文与西文混排只转中文语境', () => {
    const r = normalizeMixedPunctuation('他写"静",引用 "Be still" 之后停了.');
    expect(r.text).toContain('“静”');
    expect(r.text).toContain('"Be still"');
  });

  it('changes 计数准确', () => {
    expect(normalizeMixedPunctuation('好,真的吗?').changes).toBe(2);
    expect(normalizeMixedPunctuation('纯中文。').changes).toBe(0);
  });

  it('shouldNotifyPunct 阈值 3', () => {
    expect(shouldNotifyPunct(0)).toBe(false);
    expect(shouldNotifyPunct(2)).toBe(false);
    expect(shouldNotifyPunct(3)).toBe(true);
  });

  it('空文本安全', () => {
    expect(normalizeMixedPunctuation('').text).toBe('');
  });
});
