import { describe, it, expect } from 'vitest';
import { preprocessMarkdown } from '../markdownPreprocess';

const NARROW = String.fromCharCode(0x2009);

describe('preprocessMarkdown：语法片段不被窄空格污染', () => {
  it('中英混排文件名的嵌入保持原样（回归：曾把 ![[AI笔记]] 改成 ![[AI 笔记]]）', () => {
    const src = '![[AI笔记]]';
    expect(preprocessMarkdown(src)).toBe(src);
  });

  it('数字开头的文件名同样保持原样', () => {
    const src = '![[2024总结]]';
    expect(preprocessMarkdown(src)).toBe(src);
  });

  it('带锚点的嵌入保持原样（文件名与锚点都不能被改）', () => {
    const src = '![[AI笔记#第二节]]';
    expect(preprocessMarkdown(src)).toBe(src);
  });

  it('iframe 标签整体保持原样（src / 属性内不得插入窄空格）', () => {
    // URL 中刻意带中英交界（AI视频）：旧实现会改成 AI 视频，使资源加载失败
    const src =
      '<iframe src="https://player.example.com/v?title=AI视频&lang=zh" width="560" height="315"></iframe>';
    expect(preprocessMarkdown(src)).toBe(src);
  });

  it('markdown 链接的 URL 内中文不被改写', () => {
    const src = '[链接](https://example.com/我的页面)';
    expect(preprocessMarkdown(src)).toBe(src);
  });

  it('行内代码与围栏代码块内容不被改写', () => {
    expect(preprocessMarkdown('`AI笔记`')).toBe('`AI笔记`');
    expect(preprocessMarkdown('```\nconst 甲=1;\n```')).toBe('```\nconst 甲=1;\n```');
  });
});

describe('preprocessMarkdown：窄空格功能本身仍然生效', () => {
  it('正文中的中英交界处插入窄空格', () => {
    const out = preprocessMarkdown('使用Obsidian写作');
    expect(out).toContain(NARROW);
    expect(out).toBe(`使用${NARROW}Obsidian${NARROW}写作`);
  });

  it('纯中文不带窄空格', () => {
    const src = '这是一段纯中文';
    expect(preprocessMarkdown(src)).toBe(src);
  });

  it('语法片段之外的正文仍会被处理（保护不等于整篇跳过）', () => {
    const out = preprocessMarkdown('看AI笔记里的[[AI笔记]]内容');
    // 正文两处中英交界被处理，wikilink 内部保持原样
    expect(out).toContain('[[AI笔记]]');
    expect(out).toContain(`看${NARROW}AI`);
    expect(out).toContain(`内容`);
  });
});
