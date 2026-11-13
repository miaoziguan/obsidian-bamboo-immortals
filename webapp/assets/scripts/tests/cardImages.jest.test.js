/**
 * @jest-environment jsdom
 */
/**
 * 卡片图片契约（`![alt](path)` / `![[img.png|300]]`）：
 * ① 投影只做显示层，md 一个字都不改；
 * ② 序列化必须原样吐回进入编辑时那段语法（alt / title / 尺寸都不能漂）；
 * ③ 读不到图只标破图，绝不把链接从模型里抹掉；
 * ④ 粘贴 / 拖入的图片落盘成 vault 真文件，正文里只留一行链接。
 */
const { loadModule } = require('./__helpers__/testUtils');

globalThis.fitCardText = () => 1;

const { renderCardText, renderRichText, serializeRichText } = loadModule(
  'services/ViewportCuller.js',
  ['renderCardText', 'renderRichText', 'serializeRichText'],
);
global.WritingDoc = {
  setText: (notes, id, text) => notes.map((n) => (n.id === id ? Object.assign({}, n, { text }) : n)),
};
global.ModePolicy = { cardMaxLen: () => 500 };
const { CardInteractions } = loadModule('handlers/features/CardInteractions.js', ['CardInteractions']);

const p = (text, level = 'p') => ({ level, text });

function mkText() {
  const el = document.createElement('div');
  el.className = 'tw-card-text';
  document.body.appendChild(el);
  return el;
}

const imgs = (el) => Array.from(el.querySelectorAll('img.tw-md-img'));
const flush = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
  document.body.innerHTML = '';
  delete window.storageManager;
});

describe('图片投影', () => {
  test('![](path) 投影成 <img>，卡上不再显示原始语法', () => {
    const el = mkText();
    renderCardText(el, p('![](画中卷/assets/a.png)'));
    const [img] = imgs(el);
    expect(img).toBeDefined();
    expect(img.dataset.mdRaw).toBe('![](画中卷/assets/a.png)');
    expect(el.textContent).not.toContain('![');
  });

  test('alt 与 title 都进投影，原始语法一字不改', () => {
    const el = mkText();
    const raw = '![图注](画中卷/assets/x.png "标题")';
    renderCardText(el, p(raw));
    const [img] = imgs(el);
    expect(img.getAttribute('alt')).toBe('图注');
    expect(img.dataset.mdRaw).toBe(raw);
  });

  test('![[img.png|300]] 投影并带上宽度；![[某篇笔记]] 不是图片，保持原文', () => {
    const el = mkText();
    renderCardText(el, p('![[img.png|300]]'));
    const [img] = imgs(el);
    expect(img.dataset.mdRaw).toBe('![[img.png|300]]');
    expect(img.style.getPropertyValue('max-width')).toBe('300px');

    const el2 = mkText();
    renderCardText(el2, p('![[某篇笔记]]'));
    expect(imgs(el2).length).toBe(0);
    expect(el2.textContent).toContain('![[某篇笔记]]');
  });

  test('行内图片：前后文字都在，顺序不变', () => {
    const el = mkText();
    renderCardText(el, p('前![](a.png)后'));
    expect(imgs(el).length).toBe(1);
    expect(el.textContent).toBe('前后');
    expect(serializeRichText(el, p('前![](a.png)后'))).toBe('前![](a.png)后');
  });

  test('不安全协议不投影（留原文，不生成 img）', () => {
    const el = mkText();
    renderCardText(el, p('![](javascript:alert(1))'));
    expect(imgs(el).length).toBe(0);
    expect(el.textContent).toContain('javascript:alert(1)');
  });

  test('写作档富渲染（表格 + 图片行）也走同一投影', () => {
    const el = mkText();
    renderRichText(el, '| a | b |\n|---|---|\n| 1 | 2 |\n![](x.png)');
    expect(el.querySelector('table')).not.toBeNull();
    expect(imgs(el).length).toBe(1);
  });
});

describe('图片序列化（md 是真源）', () => {
  test('进入/退出编辑一轮，四种写法都原样回来', () => {
    const cases = [
      '![](a.png)',
      '![图注](画中卷/assets/带 空格.png "标题")',
      '![[img.png|300]]',
      '前![](a.png)后',
    ];
    for (const md of cases) {
      const el = mkText();
      renderCardText(el, p(md));
      expect(serializeRichText(el, p(md))).toBe(md);
    }
  });

  test('破图也保留 md：读不到只标占位，模型不变', async () => {
    window.storageManager = { readVaultImage: jest.fn(async () => '') };
    const el = mkText();
    renderCardText(el, p('![](missing.png)'));
    await flush();
    const [img] = imgs(el);
    expect(img.classList.contains('tw-md-img-broken')).toBe(true);
    expect(serializeRichText(el, p('![](missing.png)'))).toBe('![](missing.png)');
  });

  test('宿主读到图后 img 才拿到 src（data URL，同源必能加载）', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    window.storageManager = { readVaultImage: jest.fn(async () => dataUrl) };
    const el = mkText();
    renderCardText(el, p('![](loaded.png)'));
    await flush();
    expect(imgs(el)[0].getAttribute('src')).toBe(dataUrl);
    expect(window.storageManager.readVaultImage).toHaveBeenCalledWith('loaded.png');
  });

  test('同一张图挂多张卡只过桥一次', async () => {
    window.storageManager = { readVaultImage: jest.fn(async () => 'data:image/png;base64,AA') };
    renderCardText(mkText(), p('![](same.png)'));
    await flush();
    renderCardText(mkText(), p('![](same.png)'));
    await flush();
    expect(window.storageManager.readVaultImage).toHaveBeenCalledTimes(1);
  });
});

describe('粘贴 / 拖入图片（落盘成 vault 文件）', () => {
  function fixture(md = '', level = 'p') {
    const canvas = document.createElement('div');
    canvas.className = 'tw-canvas';
    document.body.appendChild(canvas);
    const card = document.createElement('div');
    card.className = 'tw-card';
    card.dataset.id = 'a';
    const text = document.createElement('div');
    text.className = 'tw-card-text';
    card.appendChild(text);
    canvas.appendChild(card);
    renderCardText(text, { level, text: md });
    const ctrl = {
      _notes: [{ id: 'a', seq: 0, level, text: md }],
      _mode: 'notes',
      _canvas: canvas,
      _zTop: 0,
      _exitAllEdits: () => {},
      _scheduleSave: () => {},
      _serializeCardText: (el, note) => serializeRichText(el, note),
      _applyCardText: (el, note) => renderCardText(el, note),
      _invalidateGeo: () => {},
      _showScreenMsg: () => {},
    };
    return { card, text, ctrl };
  }

  const fileOf = (name, type, bytes = [137, 80, 78, 71]) => ({
    name,
    type,
    arrayBuffer: async () => new Uint8Array(bytes).buffer,
  });

  test('图片写进 assets/ 并把链接插到卡片里', async () => {
    const { card, text, ctrl } = fixture('甲');
    window.storageManager = {
      writeVaultImage: jest.fn(async () => ({ ok: true, path: '画中卷/assets/pasted-1.png' })),
      readVaultImage: jest.fn(async () => ''),
    };
    // 光标放到末尾（粘贴总是发生在光标处）
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(text);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);

    const n = await CardInteractions.insertImageFiles(ctrl, card, [fileOf('shot.png', 'image/png')]);
    expect(n).toBe(1);
    const [argPath, argB64] = window.storageManager.writeVaultImage.mock.calls[0];
    expect(argPath).toMatch(/^assets\/pasted-.+\.png$/);
    expect(argB64).toBe(btoa('\x89PNG'));
    expect(ctrl._notes[0].text).toContain('![shot](画中卷/assets/pasted-1.png)');
    expect(text.querySelectorAll('img.tw-md-img').length).toBe(1);   // 当场投影，不用退出重进
  });

  test('非图片文件直接忽略', async () => {
    const { card, text, ctrl } = fixture('甲');
    window.storageManager = { writeVaultImage: jest.fn() };
    const n = await CardInteractions.insertImageFiles(ctrl, card, [fileOf('a.md', 'text/markdown')]);
    expect(n).toBe(0);
    expect(window.storageManager.writeVaultImage).not.toHaveBeenCalled();
    expect(ctrl._notes[0].text).toBe('甲');
  });

  test('落盘失败不破坏原文', async () => {
    const { card, ctrl } = fixture('甲');
    window.storageManager = { writeVaultImage: jest.fn(async () => null) };
    const n = await CardInteractions.insertImageFiles(ctrl, card, [fileOf('shot.png', 'image/png')]);
    expect(n).toBe(0);
    expect(ctrl._notes[0].text).toBe('甲');
  });

  test('源码视图里插入：只加 md 链接，不重投影', async () => {
    const { card, text, ctrl } = fixture('甲');
    window.storageManager = {
      writeVaultImage: jest.fn(async () => ({ ok: true, path: '画中卷/assets/pasted-2.png' })),
      readVaultImage: jest.fn(async () => ''),
    };
    CardInteractions.enterEdit({ state: {}, ctrl }, card);
    CardInteractions.toggleSource({ ctrl }, card);
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(text);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);

    await CardInteractions.insertImageFiles(ctrl, card, [fileOf('shot.png', 'image/png')]);
    expect(ctrl._notes[0].text).toContain('![shot](画中卷/assets/pasted-2.png)');
    expect(text.textContent).toContain('![shot](画中卷/assets/pasted-2.png)');   // 源码视图保持纯文本
    expect(text.querySelectorAll('img').length).toBe(0);
  });

  test('粘贴事件里带图片文件时走图片通道，不进纯文本粘贴', () => {
    const { card, text, ctrl } = fixture('甲');
    window.storageManager = { writeVaultImage: jest.fn(async () => ({ ok: true, path: '画中卷/assets/pasted-3.png' })) };
    CardInteractions.enterEdit({ state: {}, ctrl }, card);
    const spy = jest.spyOn(CardInteractions, 'insertImageFiles').mockResolvedValue(1);
    const ev = new window.Event('paste', { bubbles: true, cancelable: true });
    ev.clipboardData = {
      files: [fileOf('shot.png', 'image/png')],
      items: [],
      getData: () => '不应走到这里',
    };
    text.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  // 非编辑态：图直接拖到卡片上（没有 contenteditable、没有选区）→ 追加到正文末尾。
  // 这条路径不依赖 execCommand（Shadow DOM 里的焦点/选区不可靠），只改模型 + 重投影。
  describe('非编辑态直接拖到卡片', () => {
    test('追加到正文末尾（换行分隔），并压一个撤销点', async () => {
      const { card, text, ctrl } = fixture('甲');
      ctrl._undoStack = { push: jest.fn() };
      window.storageManager = {
        writeVaultImage: jest.fn(async () => ({ ok: true, path: '画中卷/assets/pasted-9.png' })),
        readVaultImage: jest.fn(async () => ''),
      };
      expect(text.getAttribute('contenteditable')).toBe(null);   // 确认不是编辑态

      const n = await CardInteractions.insertImageFiles(ctrl, card, [fileOf('shot.png', 'image/png')]);
      expect(n).toBe(1);
      expect(ctrl._notes[0].text).toBe('甲\n![shot](画中卷/assets/pasted-9.png)');
      expect(ctrl._undoStack.push).toHaveBeenCalledTimes(1);
      expect(text.querySelectorAll('img.tw-md-img').length).toBe(1);   // 当场显示
    });

    test('正文已以换行结尾时不重复加空行', async () => {
      const { card, ctrl } = fixture('甲\n');
      ctrl._undoStack = { push: jest.fn() };
      window.storageManager = {
        writeVaultImage: jest.fn(async () => ({ ok: true, path: '画中卷/assets/pasted-10.png' })),
        readVaultImage: jest.fn(async () => ''),
      };
      await CardInteractions.insertImageFiles(ctrl, card, [fileOf('shot.png', 'image/png')]);
      expect(ctrl._notes[0].text).toBe('甲\n![shot](画中卷/assets/pasted-10.png)');
    });

    test('多张图按顺序依次追加', async () => {
      const { card, ctrl } = fixture('甲');
      ctrl._undoStack = { push: jest.fn() };
      let i = 0;
      window.storageManager = {
        writeVaultImage: jest.fn(async () => ({ ok: true, path: `画中卷/assets/pasted-${++i}.png` })),
        readVaultImage: jest.fn(async () => ''),
      };
      const files = [fileOf('a.png', 'image/png'), fileOf('b.png', 'image/png')];
      const n = await CardInteractions.insertImageFiles(ctrl, card, files);
      expect(n).toBe(2);
      expect(ctrl._notes[0].text).toBe('甲\n![a](画中卷/assets/pasted-1.png)\n![b](画中卷/assets/pasted-2.png)');
      expect(ctrl._undoStack.push).toHaveBeenCalledTimes(1);   // 一次拖入 = 一个撤销点
    });
  });
});
