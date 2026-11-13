/**
 * @jest-environment jsdom
 */
/**
 * 整篇预览接入 Obsidian MarkdownRenderer 的契约：
 *  · 桥可用 → 升级成阅读视图（HTML），原文 textarea 让位；
 *  · 桥缺失 / 返回空 / 抛错 → 自动回退纯文本，预览绝不能「打不开」；
 *  · HTML 插入前清洗可执行节点/属性（只读视图，不给用户笔记脚本能力）；
 *  · 异步竞态：在途结果不得回填到已关闭或已重新打开的弹层。
 */
const fs = require('fs');
const path = require('path');
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
global.MindmapFeature = { isActive: () => false };
const { ModeController } = loadModule('handlers/features/ModeController.js', ['ModeController']);

const TEMPLATE_JS = fs.readFileSync(
  path.join(__dirname, '../handlers/features/typewriterDomTemplate.js'), 'utf8'
);
const PAGER_CSS = fs.readFileSync(
  path.join(__dirname, '../../styles/scroll-pager.css'), 'utf8'
);

const MD = '# 标题\n\n| 列 | 值 |\n|---|---|\n| a | b |';

function setup(renderMarkdown, apiName = 'moduleRenderMarkdown') {
  document.body.innerHTML = `
    <div id="root">
      <div id="twPreviewModal" hidden>
        <div id="twPreviewStat"></div>
        <div id="twPreviewRendered" tabindex="0" hidden></div>
        <textarea id="twPreviewBody"></textarea>
        <button type="button" id="twPreviewToggle" hidden></button>
      </div>
    </div>`;
  window.storageManager = renderMarkdown ? { [apiName]: renderMarkdown } : {};
  const ctrl = {
    _el: document.getElementById('root'),
    _canvas: document.createElement('div'),
    _orderCards: () => [{ id: 'a' }],
    _buildCardsMarkdown: () => MD,
    _showScreenMsg: () => {},
  };
  return { ctrl, ctx: { state: {}, ctrl } };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const body = () => document.getElementById('twPreviewBody');
const rendered = () => document.getElementById('twPreviewRendered');
const modal = () => document.getElementById('twPreviewModal');

afterEach(() => {
  delete window.storageManager;
  delete navigator.clipboard;
  delete document.execCommand;
});

describe('整篇预览 · 阅读视图', () => {
  test('桥可用：同步先给原文，异步升级成渲染视图', async () => {
    const calls = [];
    const { ctx } = setup((opts) => {
      calls.push(opts);
      return Promise.resolve('<h1>标题</h1><table><tr><td>a</td></tr></table>');
    });
    ModeController.openPreviewModal(ctx);
    expect(body().value).toBe(MD);          // 同步契约保持：原文立刻可用
    expect(modal().hidden).toBe(false);
    await flush();
    expect(rendered().hidden).toBe(false);
    expect(rendered().querySelector('h1').textContent).toBe('标题');
    expect(rendered().querySelector('td').textContent).toBe('a');
    expect(body().hidden).toBe(true);
    expect(calls[0].content).toBe(MD);
    expect(calls[0].sourcePath).toBe('');
  });

  test('兼容模块 API 名 renderMarkdown（_buildApi 暴露的那个名字）', async () => {
    const { ctx } = setup(() => Promise.resolve('<h1>别名可用</h1>'), 'renderMarkdown');
    ModeController.openPreviewModal(ctx);
    await flush();
    expect(rendered().querySelector('h1').textContent).toBe('别名可用');
  });

  test('桥不可用 / 返回空 / 抛错：都回退纯文本预览', async () => {
    for (const fn of [null, () => Promise.resolve(''), () => Promise.reject(new Error('桥断了'))]) {
      const { ctx } = setup(fn);
      ModeController.openPreviewModal(ctx);
      await flush();
      expect(modal().hidden).toBe(false);
      expect(body().hidden).toBe(false);
      expect(body().value).toBe(MD);
      expect(rendered().hidden).toBe(true);
    }
  });

  test('HTML 插入前清洗：脚本/样式/内联事件/javascript: 链接都被剥掉', async () => {
    const dirty = '<h1>标题</h1><script>window.__pwned=1</script>'
      + '<img src="x" onerror="window.__pwned=2">'
      + '<a href="javascript:alert(3)">链接</a><style>body{display:none}</style>';
    const { ctx } = setup(() => Promise.resolve(dirty));
    ModeController.openPreviewModal(ctx);
    await flush();
    const r = rendered();
    expect(r.hidden).toBe(false);
    expect(r.querySelector('h1').textContent).toBe('标题');
    expect(r.querySelector('script')).toBeNull();
    expect(r.querySelector('style')).toBeNull();
    expect(r.querySelector('img').hasAttribute('onerror')).toBe(false);
    expect(r.querySelector('a').hasAttribute('href')).toBe(false);
    expect(window.__pwned).toBeUndefined();
  });

  test('连续打开两轮：慢的旧结果不覆盖新一轮', async () => {
    let resolveFirst;
    let n = 0;
    const { ctx } = setup(() => {
      n += 1;
      if (n === 1) return new Promise((r) => { resolveFirst = r; });
      return Promise.resolve('<h1>第二轮</h1>');
    });
    ModeController.openPreviewModal(ctx);
    ModeController.openPreviewModal(ctx);
    await flush();
    expect(rendered().querySelector('h1').textContent).toBe('第二轮');
    resolveFirst('<h1>第一轮（旧）</h1>');
    await flush();
    expect(rendered().querySelector('h1').textContent).toBe('第二轮');
  });

  test('关闭弹层后，在途渲染不回填', async () => {
    let resolveIt;
    const { ctx } = setup(() => new Promise((r) => { resolveIt = r; }));
    ModeController.openPreviewModal(ctx);
    await flush();                              // 让桥调用发生、在途 Promise 建立
    ModeController.closePreviewModal(ctx);
    resolveIt('<h1>迟到的</h1>');
    await flush();
    expect(rendered().hidden).toBe(true);
    expect(rendered().innerHTML).toBe('');
  });

  test('渲染视图可切回原文再切回（原文能力不因升级而丢失）', async () => {
    const { ctx } = setup(() => Promise.resolve('<h1>标题</h1>'));
    ModeController.openPreviewModal(ctx);
    await flush();
    const toggle = document.getElementById('twPreviewToggle');
    expect(toggle.hidden).toBe(false);
    toggle.click();
    expect(body().hidden).toBe(false);
    expect(rendered().hidden).toBe(true);
    expect(toggle.textContent).toBe('返回阅读视图');
    toggle.click();
    expect(body().hidden).toBe(true);
    expect(rendered().hidden).toBe(false);
    expect(toggle.textContent).toBe('查看原文');
  });

  test('降级时切换按钮不出现（没有可切换的阅读视图）', async () => {
    const { ctx } = setup(null);
    ModeController.openPreviewModal(ctx);
    await flush();
    expect(document.getElementById('twPreviewToggle').hidden).toBe(true);
  });

  test('任务列表：宿主原生 checkbox 换成自绘圆点，勾选态与文字都保留', async () => {
    const html = '<ul class="contains-task-list">'
      + '<li class="task-list-item is-checked" data-task="x"><input type="checkbox" class="task-list-item-checkbox" checked> 读一章书</li>'
      + '<li class="task-list-item" data-task=" "><input type="checkbox" class="task-list-item-checkbox"> 写五百字</li>'
      + '<li class="task-list-item" data-task="x"><input type="checkbox"> 整理卡片</li>'
      + '</ul>';
    const { ctx } = setup(() => Promise.resolve(html));
    ModeController.openPreviewModal(ctx);
    await flush();
    const r = rendered();
    expect(r.querySelector('input')).toBeNull();            // 不再有 UA 大白方块
    const marks = r.querySelectorAll('.tw-preview-check');
    expect(marks.length).toBe(3);
    expect(marks[0].classList.contains('is-checked')).toBe(true);
    expect(marks[1].classList.contains('is-checked')).toBe(false);
    expect(marks[2].classList.contains('is-checked')).toBe(true);   // 无 checked 属性时从 li[data-task] 推断
    expect(r.textContent).toContain('读一章书');
  });

  test('模板与样式契约：渲染容器 + shadow 内自带阅读排版', () => {
    expect(TEMPLATE_JS).toContain('id="twPreviewRendered"');
    expect(TEMPLATE_JS).toContain('tabindex="0"');
    expect(TEMPLATE_JS).toContain('id="twPreviewBody"');   // 降级容器不能被删
    expect(TEMPLATE_JS).toContain('id="twPreviewToggle"');
    expect(PAGER_CSS).toContain('.tw-preview-rendered table');
    expect(PAGER_CSS).toContain('.tw-preview-rendered blockquote');
    expect(PAGER_CSS).toContain('pointer-events: none');   // 只读：链接不导航
    expect(PAGER_CSS).toContain('.tw-preview-rendered .tw-preview-check');
    expect(PAGER_CSS).toContain('ul.contains-task-list');   // 去掉宿主没带进来的 bullet
    expect(PAGER_CSS).toContain('line-through');            // 已完成态
  });

  test('代码块复制钮：右上角定位契约（位置 / 清零触控地板 / hover 浮现）', () => {
    expect(PAGER_CSS).toContain('.tw-preview-rendered pre.tw-preview-code');
    expect(PAGER_CSS).toContain('.tw-preview-rendered .tw-preview-copy');
    const rule = (PAGER_CSS.match(/\.tw-preview-copy \{([^}]*)\}/) || [])[1] || '';
    expect(rule).toMatch(/position:\s*absolute/);
    expect(rule).toMatch(/right:/);
    expect(rule).toMatch(/min-height:\s*0/);   // 全局 48px 触控地板必须清零
    expect(rule).toMatch(/opacity:\s*0/);      // 默认低调，不抢代码正文
    expect(PAGER_CSS).toMatch(/pre\.tw-preview-code:hover \.tw-preview-copy/);
    expect(PAGER_CSS).toMatch(/@media \(hover: none\)/);   // 触屏常驻，不能永远不可见
  });

  test('宿主注入的复制钮归位到 <pre>，换自有类名 / 图标 / 语义标签', async () => {
    const html = '<pre><code class="language-js">const a = 1;</code>'
      + '<button class="copy-code-button" aria-label="Copy"></button></pre>';
    const { ctx } = setup(() => Promise.resolve(html));
    ModeController.openPreviewModal(ctx);
    await flush();
    const r = rendered();
    expect(r.querySelector('.copy-code-button')).toBeNull();
    const btn = r.querySelector('.tw-preview-copy');
    expect(btn).not.toBeNull();
    expect(btn.closest('pre')).not.toBeNull();
    expect(btn.closest('pre').classList.contains('tw-preview-code')).toBe(true);
    expect(btn.querySelector('svg')).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('复制代码');
    expect(btn.getAttribute('type')).toBe('button');
  });

  test('宿主把复制钮放在 <pre> 外时，同样归位进代码块', async () => {
    const html = '<pre><code>let b = 2;</code></pre><button class="copy-code-button"></button>';
    const { ctx } = setup(() => Promise.resolve(html));
    ModeController.openPreviewModal(ctx);
    await flush();
    const btn = rendered().querySelector('.tw-preview-copy');
    expect(btn).not.toBeNull();
    expect(btn.closest('pre')).not.toBeNull();
  });

  test('宿主新版结构：只有 aria-label 的裸按钮也能归位', async () => {
    const html = '<pre><code>let c = 3;</code></pre>'
      + '<div class="code-block-flair"><button aria-label="Copy to clipboard"></button></div>';
    const { ctx } = setup(() => Promise.resolve(html));
    ModeController.openPreviewModal(ctx);
    await flush();
    const r = rendered();
    const btn = r.querySelector('.tw-preview-copy');
    expect(btn).not.toBeNull();
    expect(btn.closest('pre')).not.toBeNull();
    expect(r.querySelector('button[aria-label="Copy to clipboard"]')).toBeNull();
  });

  test('没有归属代码块的宿主复制钮直接移除（不留流内白方块）', async () => {
    const { ctx } = setup(() => Promise.resolve('<p>段落</p><button class="copy-code-button"></button>'));
    ModeController.openPreviewModal(ctx);
    await flush();
    const r = rendered();
    expect(r.querySelector('.copy-code-button')).toBeNull();
    expect(r.querySelector('.tw-preview-copy')).toBeNull();
  });

  test('点击复制代码并给出「已复制」反馈', async () => {
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const html = '<pre><code>const a = 1;</code><button class="copy-code-button"></button></pre>';
    const { ctx } = setup(() => Promise.resolve(html));
    ModeController.openPreviewModal(ctx);
    await flush();
    const btn = rendered().querySelector('.tw-preview-copy');
    btn.click();
    await flush();
    expect(writeText).toHaveBeenCalledWith('const a = 1;');
    expect(btn.getAttribute('aria-label')).toBe('已复制');
    expect(btn.classList.contains('is-copied')).toBe(true);
  });

  test('clipboard API 不可用时降级 execCommand，仍能复制', async () => {
    document.execCommand = jest.fn(() => true);
    const html = '<pre><code>let b = 2;</code><button class="copy-code-button"></button></pre>';
    const { ctx } = setup(() => Promise.resolve(html));
    ModeController.openPreviewModal(ctx);
    await flush();
    rendered().querySelector('.tw-preview-copy').click();
    await flush();
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  test('B 类语法：宿主渲染的数学 / Mermaid 节点不被清洗掉（卡片不投影，交给整篇预览）', async () => {
    const html = '<p>公式 <span class="katex"><math><mi>x</mi></math></span></p>'
      + '<div class="mermaid"><svg><g></g></svg></div>';
    const { ctx } = setup(() => Promise.resolve(html));
    ModeController.openPreviewModal(ctx);
    await flush();
    const r = rendered();
    expect(r.querySelector('.katex math')).not.toBeNull();
    expect(r.querySelector('.mermaid svg')).not.toBeNull();
  });
});
