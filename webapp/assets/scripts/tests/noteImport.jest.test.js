/**
 * @jest-environment jsdom
 */
// 从笔记导入画布：预处理纯函数 + 导入编排。
// 语义是「拍照，不是链接」——只读一次、不回写、不重新导入，所以没有同步相关断言。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
const { stripFrontmatter, stripInlineHtml, clampImport, prepareImport } = loadModule(
  'utils/noteImport.js',
  ['stripFrontmatter', 'stripInlineHtml', 'clampImport', 'prepareImport'],
);
const { WritingDoc } = loadModule('handlers/features/writingDoc.js', ['WritingDoc']);
global.WritingDoc = WritingDoc;
global.prepareImport = prepareImport;

global.ModeController = {
  setMode: jest.fn(async (ctx, mode) => { ctx.ctrl._mode = mode; }),
  createWritingGroup: jest.fn(async () => true),
};
const { TypewriterFeature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
  FONTS: ['modern'], PAPERS: ['plain'], MARKET_FONTS: [],
  Toast: { showToast: jest.fn() },
  ViewportCuller: { setGeom: jest.fn(), removeGeom: jest.fn() },
  CanvasViewport: { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 },
  MindmapFeature: { teardown: jest.fn() },
  TypewriterStore: { invalidateWritingIndex: jest.fn() },
  MaterialMarket: { toggle: jest.fn() },
});

describe('stripFrontmatter', () => {
  test('剥掉开头的 yaml 块，frontmatter 内容带回给调用方', () => {
    const r = stripFrontmatter('---\ntitle: x\ntags: [a]\n---\n正文');
    expect(r.body).toBe('正文');
    expect(r.frontmatter).toContain('title: x');
  });

  test('没闭合 / 不在开头时一律原样返回（不猜）', () => {
    expect(stripFrontmatter('---\ntitle: x\n正文').body).toBe('---\ntitle: x\n正文');
    expect(stripFrontmatter('标题\n---\n正文').body).toBe('标题\n---\n正文');
  });

  test('BOM 先剥；无 frontmatter 原样', () => {
    expect(stripFrontmatter('\uFEFF---\na: 1\n---\n正文').body).toBe('正文');
    expect(stripFrontmatter('普通正文').body).toBe('普通正文');
  });
});

describe('stripInlineHtml', () => {
  test('去掉 u / span / center 等标签，保留文字', () => {
    expect(stripInlineHtml('<u>下划线</u>与<span style="x">红字</span>')).toBe('下划线与红字');
    expect(stripInlineHtml('<center>居中</center>')).toBe('居中');
  });

  test('<br> 变换行', () => {
    expect(stripInlineHtml('上<br>下')).toBe('上\n下');
  });

  test('围栏代码块内原样保留（代码里的标签是真内容）', () => {
    const md = '```html\n<div>x</div>\n```';
    expect(stripInlineHtml(md)).toBe(md);
  });

  test('行内代码里的标签保留', () => {
    expect(stripInlineHtml('用 `<div>` 包一下')).toBe('用 `<div>` 包一下');
  });

  test('普通小于号不误伤', () => {
    expect(stripInlineHtml('a < b')).toBe('a < b');
  });
});

describe('clampImport', () => {
  test('未超限原样返回', () => {
    expect(clampImport('短文本').truncated).toBe(false);
  });

  test('超限在块边界回退，不在句子中间切', () => {
    const md = ('第一段。\n\n').repeat(30);
    const r = clampImport(md, 100);
    expect(r.truncated).toBe(true);
    expect(r.text.length).toBeLessThanOrEqual(100);
    expect(r.text.endsWith('第一段。')).toBe(true);
  });
});

describe('prepareImport', () => {
  test('组合：剥 frontmatter + 剥 HTML，返回可交给 splitDraft 的正文', () => {
    const r = prepareImport('---\ntitle: x\n---\n<u>正文</u>');
    expect(r.text).toBe('正文');
    expect(r.hadFrontmatter).toBe(true);
    expect(r.truncated).toBe(false);
  });
});

describe('导入编排（_importNoteSnapshot）', () => {
  function fake(mode) {
    return {
      _mode: mode, _state: {}, _showScreenMsg: jest.fn(),
      _el: {},                                   // 已挂载
      _whenMounted: jest.fn(async () => true),
      // .call() 调真实方法时不会继承原型方法，得显式挂上
      _importGroupTitle: TypewriterFeature._importGroupTitle,
    };
  }
  beforeEach(() => { global.ModeController.createWritingGroup.mockClear(); global.ModeController.setMode.mockClear(); });

  test('预处理 + 拆卡 + 建组：title / notePath 透传，HTML 已剥', async () => {
    const c = fake('write');
    const ok = await TypewriterFeature._importNoteSnapshot.call(c, {
      path: '文章写作/检测稿.md',
      title: '检测稿',
      content: '---\ntitle: x\n---\n# 标题\n\n<u>正文一段</u>\n\n- 列表项',
    });
    expect(ok).toBe(true);
    const opts = global.ModeController.createWritingGroup.mock.calls[0][1];
    expect(opts.title).toMatch(/^检测稿 · \d{1,2}-\d{2} \d{2}:\d{2}$/);   // 笔记名 + 时间后缀
    expect(opts.notePath).toBe('文章写作/检测稿.md');
    expect(opts.chunks.length).toBeGreaterThan(1);
    expect(opts.chunks.map((x) => x.text).join('\n')).not.toContain('<u>');
    expect(global.ModeController.setMode).not.toHaveBeenCalled();   // 已在写作档，不该切档
  });

  test('不在写作档：先切档再建组', async () => {
    const c = fake('notes');
    const ok = await TypewriterFeature._importNoteSnapshot.call(c, { title: 't', content: '一段正文' });
    expect(ok).toBe(true);
    expect(global.ModeController.setMode).toHaveBeenCalledWith({ state: c._state, ctrl: c }, 'write');
    expect(global.ModeController.createWritingGroup).toHaveBeenCalled();
  });

  test('空笔记：提示且不建组', async () => {
    const c = fake('write');
    expect(await TypewriterFeature._importNoteSnapshot.call(c, { content: '   \n\n ' })).toBe(false);
    expect(c._showScreenMsg).toHaveBeenCalled();
    expect(global.ModeController.createWritingGroup).not.toHaveBeenCalled();
  });

  test('切档失败（仍在便签）：不建组', async () => {
    const c = fake('notes');
    global.ModeController.setMode.mockImplementationOnce(async () => { /* 模拟忙碌被拒 */ });
    expect(await TypewriterFeature._importNoteSnapshot.call(c, { content: '一段正文' })).toBe(false);
    expect(global.ModeController.createWritingGroup).not.toHaveBeenCalled();
  });

  test('建组被忙碌锁拒绝：不谎报成功，给出提示', async () => {
    const c = fake('write');
    global.ModeController.createWritingGroup.mockImplementationOnce(async () => false);
    expect(await TypewriterFeature._importNoteSnapshot.call(c, { title: 't', content: '一段正文' })).toBe(false);
    expect(c._showScreenMsg).toHaveBeenCalled();
  });

  test('组标题：笔记名为空时回落默认名，且始终带时间后缀', () => {
    const t1 = TypewriterFeature._importGroupTitle('');
    const t2 = TypewriterFeature._importGroupTitle('  ');
    expect(t1).toMatch(/^导入的笔记 · \d{1,2}-\d{2} \d{2}:\d{2}$/);
    expect(t2.startsWith('导入的笔记 · ')).toBe(true);
  });

  test('尚未挂载完成：等不到就不动手（防止被读盘恢复覆盖）', async () => {
    const c = fake('write');
    c._whenMounted = jest.fn(async () => false);
    expect(await TypewriterFeature._importNoteSnapshot.call(c, { title: 't', content: '一段正文' })).toBe(false);
    expect(global.ModeController.createWritingGroup).not.toHaveBeenCalled();
    expect(global.ModeController.setMode).not.toHaveBeenCalled();
  });
});

describe('挂载等待（_whenMounted / _settleMountWaiters）', () => {
  test('已挂载：立即兑现 true', async () => {
    const c = { _mounted: true, _el: {}, _mountWaiters: null };
    expect(await TypewriterFeature._whenMounted.call(c, 50)).toBe(true);
  });

  test('未挂载：挂载完成时兑现 true，且等待者被清空', async () => {
    const c = { _mounted: false, _el: null, _mountWaiters: null };
    const p = TypewriterFeature._whenMounted.call(c, 50);
    expect(Array.isArray(c._mountWaiters)).toBe(true);
    c._mounted = true;
    TypewriterFeature._settleMountWaiters.call(c, true);
    expect(await p).toBe(true);
    expect(c._mountWaiters).toBe(null);
  });

  test('卸载时以 false 兑现，不永久挂起', async () => {
    const c = { _mounted: false, _el: null, _mountWaiters: null };
    const p = TypewriterFeature._whenMounted.call(c, 5000);
    TypewriterFeature._settleMountWaiters.call(c, false);
    expect(await p).toBe(false);
  });
});
