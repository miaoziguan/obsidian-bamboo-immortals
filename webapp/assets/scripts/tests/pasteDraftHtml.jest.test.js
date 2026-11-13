/**
 * @jest-environment jsdom
 */
// 输入框「整篇粘贴」：剪贴板 HTML 交给宿主官方 htmlToMarkdown，落成 md 再进 textarea。
// 这里只测接线与边界（转换器本身是 Obsidian 的，不在本仓库）。
const { loadModule } = require('./__helpers__/testUtils');

loadModule('handlers/features/twConfig.js', []);
const { TypewriterFeature } = loadModule('handlers/features/typewriterFeature.js', ['TypewriterFeature'], {
  FONTS: ['modern'], PAPERS: ['plain'], MARKET_FONTS: [],
  Toast: { showToast: jest.fn() },
  ViewportCuller: { setGeom: jest.fn(), removeGeom: jest.fn() },
  CanvasViewport: { scaleOf: () => 1, clamp: (v) => v, getScale: () => 1 },
  MindmapFeature: { teardown: jest.fn() },
  TypewriterStore: { invalidateWritingIndex: jest.fn() },
  MaterialMarket: { toggle: jest.fn() },
});

const MD = '# 标题\n\n正文';
const flush = () => new Promise((r) => setTimeout(r, 0));

function mkInput(value = '', sel) {
  const input = document.createElement('textarea');
  input.value = value;
  document.body.appendChild(input);
  if (sel) input.setSelectionRange(sel[0], sel[1]);
  else input.setSelectionRange(value.length, value.length);
  return input;
}

function run(input, html, plain, msg = jest.fn()) {
  const fake = { _showScreenMsg: msg };
  TypewriterFeature._pasteHtmlToInput.call(fake, input, html, plain);
  return msg;
}

afterEach(() => { delete window.storageManager; document.body.innerHTML = ''; });

describe('整篇富文本粘贴到输入框', () => {
  test('桥返回 md：插到光标处，光标跟到插入内容之后', async () => {
    window.storageManager = { moduleHtmlToMarkdown: jest.fn(async () => MD) };
    const input = mkInput('前后', [1, 1]);
    run(input, '<h1>标题</h1><p>正文</p>', '标题 正文');
    await flush();
    expect(input.value).toBe('前' + MD + '后');
    expect(input.selectionStart).toBe(1 + MD.length);
  });

  test('桥返回空串：回退纯文本，不能什么都不插', async () => {
    window.storageManager = { moduleHtmlToMarkdown: jest.fn(async () => '') };
    const input = mkInput('');
    run(input, '<p>纯文本</p>', '纯文本');
    await flush();
    expect(input.value).toBe('纯文本');
  });

  test('桥抛错：同样回退纯文本', async () => {
    window.storageManager = { moduleHtmlToMarkdown: jest.fn(async () => { throw new Error('桥断了'); }) };
    const input = mkInput('');
    run(input, '<p>纯文本</p>', '纯文本');
    await flush();
    expect(input.value).toBe('纯文本');
  });

  test('转换期间用户继续输入：追加到末尾，不覆盖刚打的字', async () => {
    let resolveIt;
    window.storageManager = {
      moduleHtmlToMarkdown: jest.fn(() => new Promise((r) => { resolveIt = r; })),
    };
    const input = mkInput('原有');
    run(input, '<p>网页</p>', '网页');
    await flush();                         // 让桥调用发生（此时仍 pending）
    input.value = '原有用户新输入';        // 桥还没回来，用户继续输入
    resolveIt(MD);
    await flush();
    expect(input.value.endsWith(MD)).toBe(true);
    expect(input.value.startsWith('原有用户新输入')).toBe(true);
  });

  test('超大 HTML 不送转换器：直接落纯文本', async () => {
    const spy = jest.fn(async () => MD);
    window.storageManager = { moduleHtmlToMarkdown: spy };
    const input = mkInput('');
    run(input, 'x'.repeat(400001), '纯文本兜底');
    await flush();
    expect(spy).not.toHaveBeenCalled();
    expect(input.value).toBe('纯文本兜底');
  });

  test('超出输入框上限：按剩余空间截断并提示', async () => {
    window.storageManager = { moduleHtmlToMarkdown: jest.fn(async () => 'a'.repeat(50)) };
    const input = mkInput('12345');
    input.maxLength = 10;
    const msg = run(input, '<p>x</p>', 'x');
    await flush();
    expect(input.value.length).toBe(10);
    expect(msg).not.toHaveBeenCalled();

    const full = mkInput('1234567890');
    full.maxLength = 10;
    const msg2 = run(full, '<p>x</p>', 'x');
    await flush();
    expect(msg2).toHaveBeenCalled();       // 没有剩余空间 → 提示而不插
    expect(full.value).toBe('1234567890');
  });
});
